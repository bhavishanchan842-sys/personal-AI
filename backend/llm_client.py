import os
import json
import asyncio
import logging
from typing import AsyncGenerator, List, Dict, Any, Optional
import httpx
from backend import database
from backend.memory_engine import (
    EXTRACTION_SYSTEM_PROMPT, 
    parse_extraction_json, 
    add_or_update_memory
)

logger = logging.getLogger("llm_client")

# Fallback chain for Gemini models if a given model is deprecated / 404
GEMINI_FALLBACK_MODELS = [
    "gemini-3.6-flash",
    "gemini-2.5-flash",
    "gemini-1.5-flash",
    "gemini-1.5-pro"
]

def get_api_key(provider: str) -> Optional[str]:
    """Fetch API key from settings DB first, then environment variable."""
    with database.get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT value FROM settings WHERE key = ?", (f"{provider}_api_key",))
        row = cursor.fetchone()
        if row and row["value"].strip():
            return row["value"].strip()
            
    if provider == "gemini":
        return os.getenv("GEMINI_API_KEY")
    elif provider == "openai":
        return os.getenv("OPENAI_API_KEY")
    elif provider == "groq":
        return os.getenv("GROQ_API_KEY")
    return None

def get_active_provider_and_model() -> tuple[str, str]:
    """Returns the current configured provider and model name."""
    with database.get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT value FROM settings WHERE key = 'active_provider'")
        row_p = cursor.fetchone()
        cursor.execute("SELECT value FROM settings WHERE key = 'active_model'")
        row_m = cursor.fetchone()
        
    provider = row_p["value"] if row_p else os.getenv("DEFAULT_PROVIDER", "groq")
    model = row_m["value"] if row_m else os.getenv("DEFAULT_MODEL", "openai/gpt-oss-120b")
    
    # Auto-migrate deprecated gemini-2.0-flash to gemini-3.6-flash
    if model in ["gemini-2.0-flash", "gemini-2.0-flash-exp"]:
        model = "gemini-3.6-flash"
        with database.get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES ('active_model', 'gemini-3.6-flash', CURRENT_TIMESTAMP)")
            conn.commit()

    return provider, model

async def stream_chat_completion(
    messages: List[Dict[str, str]], 
    system_prompt: str,
    temperature: float = 0.7
) -> AsyncGenerator[str, None]:
    """
    Multi-provider SSE streaming hub.
    Supports Google Gemini (with resilient fallback loop), OpenAI, Groq, Ollama, and offline simulation.
    """
    provider, model = get_active_provider_and_model()
    api_key = get_api_key(provider)

    # 1. Google Gemini Provider
    if provider == "gemini" and api_key:
        models_to_try = [model]
        for fb in GEMINI_FALLBACK_MODELS:
            if fb not in models_to_try:
                models_to_try.append(fb)

        contents = []
        for m in messages:
            role = "user" if m["role"] == "user" else "model"
            contents.append({"role": role, "parts": [{"text": m["content"]}]})

        payload = {
            "contents": contents,
            "systemInstruction": {
                "parts": [{"text": system_prompt}]
            },
            "generationConfig": {
                "temperature": temperature,
                "maxOutputTokens": 2048
            }
        }

        success = False
        last_error = ""

        for candidate_model in models_to_try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{candidate_model}:streamGenerateContent?key={api_key}&alt=sse"
            
            try:
                async with httpx.AsyncClient(timeout=60.0) as client:
                    async with client.stream("POST", url, json=payload) as response:
                        if response.status_code == 404:
                            # Model not found or deprecated, try next fallback
                            err_text = (await response.aread()).decode('utf-8')
                            last_error = err_text
                            continue
                        
                        if response.status_code != 200:
                            error_body = await response.aread()
                            yield f"*[Error calling Gemini API ({response.status_code}): {error_body.decode('utf-8')}]*"
                            return

                        # If candidate model succeeded and differs from configured model, update DB setting
                        if candidate_model != model:
                            with database.get_db_connection() as conn:
                                cursor = conn.cursor()
                                cursor.execute("INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES ('active_model', ?, CURRENT_TIMESTAMP)", (candidate_model,))
                                conn.commit()

                        async for line in response.aiter_lines():
                            if line.startswith("data: "):
                                data_str = line[6:].strip()
                                if data_str:
                                    try:
                                        chunk_json = json.loads(data_str)
                                        candidates = chunk_json.get("candidates", [])
                                        if candidates:
                                            parts = candidates[0].get("content", {}).get("parts", [])
                                            for part in parts:
                                                if "text" in part:
                                                    yield part["text"]
                                                    success = True
                                    except Exception as e:
                                        logger.error(f"Error parsing Gemini SSE: {e}")
                        
                        if success:
                            return
            except Exception as e:
                last_error = str(e)
                continue

        if not success:
            yield f"*[Error: Unable to connect to Gemini with models {models_to_try}. Details: {last_error}]*"

    # 2. OpenAI, Groq, or OpenAI-Compatible (Ollama / Local)
    elif ((provider in ["openai", "groq"]) and api_key) or provider == "ollama":
        if provider == "groq":
            base_url = "https://api.groq.com/openai/v1"
        elif provider == "openai":
            base_url = "https://api.openai.com/v1"
        else:
            base_url = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434/v1")

        headers = {"Content-Type": "application/json"}
        if api_key:
            headers["Authorization"] = f"Bearer {api_key}"

        formatted_messages = [{"role": "system", "content": system_prompt}] + messages
        payload = {
            "model": model,
            "messages": formatted_messages,
            "temperature": temperature,
            "stream": True
        }

        async with httpx.AsyncClient(timeout=60.0) as client:
            async with client.stream("POST", f"{base_url}/chat/completions", headers=headers, json=payload) as response:
                if response.status_code != 200:
                    error_body = await response.aread()
                    yield f"*[Error calling {provider.upper()} API ({response.status_code}): {error_body.decode('utf-8')}]*"
                    return

                async for line in response.aiter_lines():
                    if line.startswith("data: ") and not line.startswith("data: [DONE]"):
                        data_str = line[6:].strip()
                        try:
                            chunk_json = json.loads(data_str)
                            choices = chunk_json.get("choices", [])
                            if choices:
                                delta = choices[0].get("delta", {})
                                if "content" in delta and delta["content"]:
                                    yield delta["content"]
                        except Exception as e:
                            logger.error(f"Error parsing OpenAI SSE: {e}")

    # 3. Fallback Interactive Mode (When no API key is yet configured)
    else:
        intro = (
            "*(Note: You haven't added an API Key yet in Settings. To unlock full real-time Gemini/OpenAI reasoning, "
            "add your key in the Settings tab! Here is a live simulation demonstrating memory recall & persona):*\n\n"
        )
        for char in intro:
            yield char
            await asyncio.sleep(0.005)

        last_user_msg = messages[-1]["content"] if messages else ""
        simulated_response = (
            f"Hey there! I received your message: \"{last_user_msg}\".\n\n"
            f"I have automatically activated your persistent memory vault and persona engine. "
            f"Any facts, preferences, and projects you mention are continuously saved to your local database "
            f"and will stay with me across all future sessions!"
        )
        for word in simulated_response.split(" "):
            yield word + " "
            await asyncio.sleep(0.04)

async def generate_text_completion(messages: List[Dict[str, str]], system_prompt: str) -> str:
    """Non-streaming text completion for background reasoning and extraction."""
    collected = []
    async for chunk in stream_chat_completion(messages, system_prompt, temperature=0.2):
        collected.append(chunk)
    return "".join(collected)

async def extract_and_store_memories(
    user_message: str, 
    assistant_response: str, 
    session_id: Optional[str] = None,
    user_id: str = "default"
):
    """
    Background worker that analyzes the user's latest interaction,
    extracts new facts/preferences, and updates the database & user profile for the specific user.
    """
    try:
        dialogue = (
            f"USER: {user_message}\n"
            f"ASSISTANT: {assistant_response}"
        )
        
        provider, _ = get_active_provider_and_model()
        api_key = get_api_key(provider)

        # If API key is available, use LLM extraction
        if api_key:
            messages = [{"role": "user", "content": dialogue}]
            raw_response = await generate_text_completion(messages, EXTRACTION_SYSTEM_PROMPT)
            extraction = parse_extraction_json(raw_response)
        else:
            # Smart heuristic extraction for offline / no-key mode
            extraction = {"profile_updates": [], "new_memories": []}
            text_lower = user_message.lower()
            
            # Simple heuristic detection for demo/offline resilience
            if "my name is" in text_lower or "i am " in text_lower:
                m = user_message.strip()
                extraction["new_memories"].append({
                    "content": f"User shared: {m}",
                    "category": "identity",
                    "importance": 0.9
                })
            elif "i like" in text_lower or "i prefer" in text_lower or "favorite" in text_lower or "i love" in text_lower:
                extraction["new_memories"].append({
                    "content": f"User preference: {user_message.strip()}",
                    "category": "preference",
                    "importance": 0.85
                })
            elif "i am building" in text_lower or "my project" in text_lower or "i work on" in text_lower:
                extraction["new_memories"].append({
                    "content": f"User project/work info: {user_message.strip()}",
                    "category": "work",
                    "importance": 0.85
                })
            elif len(user_message.strip()) > 20 and not user_message.strip().endswith("?"):
                extraction["new_memories"].append({
                    "content": user_message.strip(),
                    "category": "fact",
                    "importance": 0.6
                })

        # Apply profile updates for isolated user
        for prof in extraction.get("profile_updates", []):
            k = prof.get("key", "").strip()
            v = prof.get("value", "").strip()
            cat = prof.get("category", "general")
            if k and v:
                database.set_profile_field(k, v, cat, user_id=user_id)

        # Store new memories for isolated user
        for mem in extraction.get("new_memories", []):
            content = mem.get("content", "").strip()
            cat = mem.get("category", "fact")
            imp = float(mem.get("importance", 0.6))
            if content:
                add_or_update_memory(
                    content=content,
                    category=cat,
                    importance=imp,
                    source_session_id=session_id,
                    user_id=user_id
                )

    except Exception as e:
        logger.error(f"Error in extract_and_store_memories: {e}", exc_info=True)
