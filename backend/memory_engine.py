import json
import re
from datetime import datetime
from typing import List, Dict, Any, Optional, Tuple
from backend import database
from backend.embeddings import generate_local_embedding, cosine_similarity

# Constants for hybrid scoring
WEIGHT_SEMANTIC = 0.55
WEIGHT_KEYWORD = 0.25
WEIGHT_IMPORTANCE = 0.15
WEIGHT_RECENCY = 0.05
SIMILARITY_DUPLICATE_THRESHOLD = 0.88
MIN_RETRIEVAL_SCORE = 0.18

def _extract_keywords(text: str) -> set:
    """Extract significant lowercase keywords, ignoring basic stopwords."""
    stopwords = {
        'the', 'is', 'at', 'which', 'on', 'a', 'an', 'and', 'or', 'in', 'to', 'for', 
        'of', 'it', 'this', 'that', 'i', 'my', 'me', 'we', 'you', 'your', 'he', 'she',
        'they', 'am', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had',
        'do', 'does', 'did', 'but', 'if', 'so', 'with', 'as', 'what', 'when', 'how', 'who'
    }
    words = re.findall(r'\b[a-zA-Z0-9_\-\.]{3,}\b', text.lower())
    return {w for w in words if w not in stopwords}

def calculate_keyword_overlap(query: str, text: str) -> float:
    """Calculates Jaccard overlap between query keywords and memory text."""
    q_words = _extract_keywords(query)
    t_words = _extract_keywords(text)
    if not q_words or not t_words:
        return 0.0
    intersection = q_words.intersection(t_words)
    return len(intersection) / len(q_words)

def retrieve_relevant_memories(query: str, top_k: int = 5, user_id: str = "default") -> List[Dict[str, Any]]:
    """
    Retrieves the top-k most relevant memories for the given query and isolated user:
    - Semantic embedding similarity
    - Keyword overlap
    - Importance rating
    - Recency decay
    """
    all_memories = database.get_memories_with_embeddings(user_id=user_id)
    if not all_memories:
        return []

    query_embedding = generate_local_embedding(query)
    scored_memories = []

    now = datetime.now()

    for mem in all_memories:
        content = mem.get("content", "")
        mem_emb = mem.get("embedding")
        importance = mem.get("importance", 0.5)

        # 1. Semantic Similarity
        semantic_sim = 0.0
        if mem_emb:
            semantic_sim = max(0.0, cosine_similarity(query_embedding, mem_emb))

        # 2. Keyword score
        kw_score = calculate_keyword_overlap(query, content)

        # 3. Recency score (decay over 60 days)
        created_at_str = mem.get("created_at")
        recency_score = 0.5
        if created_at_str:
            try:
                created_dt = datetime.fromisoformat(created_at_str.replace("Z", "+00:00"))
                days_old = max(0, (now - created_dt.replace(tzinfo=None)).days)
                recency_score = max(0.0, 1.0 - (days_old / 60.0))
            except Exception:
                pass

        # Hybrid Composite Score
        total_score = (
            (WEIGHT_SEMANTIC * semantic_sim) +
            (WEIGHT_KEYWORD * kw_score) +
            (WEIGHT_IMPORTANCE * importance) +
            (WEIGHT_RECENCY * recency_score)
        )

        if total_score >= MIN_RETRIEVAL_SCORE or kw_score > 0.3:
            scored_memories.append((total_score, mem))

    # Sort by total score descending
    scored_memories.sort(key=lambda x: x[0], reverse=True)
    top_results = [item[1] for item in scored_memories[:top_k]]

    # Record access for retrieved memories
    if top_results:
        accessed_ids = [m["id"] for m in top_results]
        database.record_memory_access(accessed_ids)

    return top_results

def add_or_update_memory(content: str, category: str = "fact", importance: float = 0.5, 
                         source_session_id: Optional[str] = None, user_id: str = "default") -> Tuple[int, str]:
    """
    Adds a new memory or updates an existing one for the isolated user.
    Returns (memory_id, action_taken: 'inserted' | 'updated').
    """
    content = content.strip()
    if not content:
        return 0, "ignored"

    new_emb = generate_local_embedding(content)
    existing_memories = database.get_memories_with_embeddings(user_id=user_id)

    # Check for near duplicates or updates
    for existing in existing_memories:
        ex_content = existing.get("content", "")
        ex_emb = existing.get("embedding")
        
        # Exact match
        if ex_content.lower() == content.lower():
            database.update_memory(existing["id"], content, category, max(importance, existing.get("importance", 0.5)), new_emb, user_id=user_id)
            return existing["id"], "updated"

        # High semantic similarity
        if ex_emb:
            sim = cosine_similarity(new_emb, ex_emb)
            if sim >= SIMILARITY_DUPLICATE_THRESHOLD:
                # Update existing memory with fresher wording
                database.update_memory(existing["id"], content, category, max(importance, existing.get("importance", 0.5)), new_emb, user_id=user_id)
                return existing["id"], "updated"

    # Insert new memory
    new_id = database.insert_memory(
        content=content,
        category=category,
        importance=importance,
        embedding=new_emb,
        source_session_id=source_session_id,
        user_id=user_id
    )
    return new_id, "inserted"

EXTRACTION_SYSTEM_PROMPT = """You are an advanced Real-Time Memory & Personal Profiler Agent.
Your job is to analyze the conversation between the user and assistant and extract long-term, persistent facts about the user.

What to extract:
1. User preferences (favorite tools, languages, food, aesthetics, coding styles, music, routines).
2. Personal background (job, location, pets, relationships, education, equipment).
3. Goals & active projects (what they are building, studying, working towards).
4. Habits, constraints, or recurring patterns.
5. Opinions, strong likes/dislikes, values.

What NOT to extract:
- Temporary ephemeral questions (e.g. "What is the time?", "Explain binary search").
- Generic small talk ("Hi", "Thanks", "Good morning").
- Speculative or unconfirmed assumptions.

Output format:
You MUST respond ONLY with valid JSON in this exact structure:
{
    "profile_updates": [
        {"key": "job_title", "value": "Senior Frontend Developer", "category": "identity"},
        {"key": "favorite_editor", "value": "Neovim", "category": "preferences"}
    ],
    "new_memories": [
        {
            "content": "User prefers dark mode and uses Tailwind CSS for styling",
            "category": "preference",
            "importance": 0.8
        },
        {
            "content": "User has a golden retriever named Max",
            "category": "personal",
            "importance": 0.9
        }
    ]
}

Categories allowed: "preference", "work", "personal", "habit", "project", "fact", "relationship", "goal".
If nothing significant or new was shared, return empty arrays: {"profile_updates": [], "new_memories": []}.
"""

def parse_extraction_json(raw_text: str) -> Dict[str, Any]:
    """Safely extracts and parses JSON response from LLM extraction output."""
    raw_text = raw_text.strip()
    
    # Try finding JSON block between triple backticks
    json_match = re.search(r'```(?:json)?\s*(\{.*?\})\s*```', raw_text, re.DOTALL)
    if json_match:
        raw_text = json_match.group(1)
    else:
        # Try finding outermost braces
        start = raw_text.find('{')
        end = raw_text.rfind('}')
        if start != -1 and end != -1:
            raw_text = raw_text[start:end+1]

    try:
        data = json.loads(raw_text)
        if isinstance(data, dict):
            return {
                "profile_updates": data.get("profile_updates", []),
                "new_memories": data.get("new_memories", [])
            }
    except Exception:
        pass

    return {"profile_updates": [], "new_memories": []}
