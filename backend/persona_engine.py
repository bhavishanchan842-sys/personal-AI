from datetime import datetime
from typing import List, Dict, Any
from backend.config import DefaultPersonaConfig

def build_tone_guidance(persona: Dict[str, Any]) -> str:
    """Constructs explicit behavioral guidelines from personality traits and sliders."""
    warmth = persona.get("warmth", 80)
    humor = persona.get("humor", 50)
    directness = persona.get("directness", 60)
    formality = persona.get("formality", 30)
    use_emojis = persona.get("use_emojis", True)
    preset = persona.get("tone_preset", "Empathetic Companion")

    guidelines = []
    guidelines.append(f"- Persona Archetype: {preset}")

    # Warmth guidance
    if warmth >= 70:
        guidelines.append("- Warmth: Highly supportive, empathetic, enthusiastic, celebrating successes, and emotionally validating.")
    elif warmth <= 30:
        guidelines.append("- Warmth: Neutral, objective, and detached without unnecessary emotional expressions.")
    else:
        guidelines.append("- Warmth: Balanced, pleasant, and respectful.")

    # Humor guidance
    if humor >= 70:
        guidelines.append("- Humor: Playful, witty, clever analogies, and lighthearted banter when appropriate.")
    elif humor <= 30:
        guidelines.append("- Humor: Serious and strictly focused on clarity without jokes.")
    else:
        guidelines.append("- Humor: Occasional subtle wit when natural.")

    # Directness guidance
    if directness >= 70:
        guidelines.append("- Directness: Highly concise, cut out pleasantry filler, prioritize actionable bottom-line answers.")
    elif directness <= 30:
        guidelines.append("- Directness: Elaborative, gentle, exploratory, and discursive.")
    else:
        guidelines.append("- Directness: Well-structured, balance clarity with thoroughness.")

    # Formality guidance
    if formality >= 70:
        guidelines.append("- Formality: Professional, polished, structured, and articulate.")
    elif formality <= 30:
        guidelines.append("- Formality: Casual, conversational, natural, like talking to a trusted peer or close confidant.")
    else:
        guidelines.append("- Formality: Clean, modern conversational tone.")

    # Emoji guidance
    if use_emojis:
        guidelines.append("- Emojis: Use expressive emojis naturally to enhance personal connection.")
    else:
        guidelines.append("- Emojis: Do NOT use emojis.")

    return "\n".join(guidelines)

def assemble_system_prompt(
    persona_config: Dict[str, Any],
    user_profile: Dict[str, Any],
    retrieved_memories: List[Dict[str, Any]],
    current_time: str = None
) -> str:
    """
    Synthesizes the master system prompt by fusing:
    1. Persona definitions & Tone guidance
    2. Real-time context (Date & Time)
    3. Core User Profile (Identity, Preferences, Ongoing Goals)
    4. Retrieved Long-Term Episodic & Semantic Memories
    5. Custom instructions
    """
    if current_time is None:
        current_time = datetime.now().strftime("%A, %B %d, %Y at %I:%M %p")

    ai_name = persona_config.get("ai_name", "Aegis")
    user_name = persona_config.get("user_name", "Bhavik")
    custom_instructions = persona_config.get("custom_instructions", "").strip()
    tone_rules = build_tone_guidance(persona_config)

    # Format User Profile section
    profile_lines = []
    for k, v in user_profile.items():
        val = v.get("value") if isinstance(v, dict) else v
        cat = v.get("category", "") if isinstance(v, dict) else ""
        cat_str = f" [{cat}]" if cat else ""
        profile_lines.append(f"  - {k.replace('_', ' ').title()}{cat_str}: {val}")
    profile_block = "\n".join(profile_lines) if profile_lines else "  - User Name: " + user_name

    # Format Retrieved Memories section
    memory_lines = []
    if retrieved_memories:
        for idx, m in enumerate(retrieved_memories, 1):
            category = m.get("category", "fact")
            content = m.get("content", "").strip()
            date = m.get("created_at", "")
            time_tag = f" (learned on {date[:10]})" if date else ""
            memory_lines.append(f"  [{idx}] [{category.upper()}]{time_tag} {content}")
        memories_block = "\n".join(memory_lines)
    else:
        memories_block = "  (No specific historical memories retrieved for this query yet.)"

    prompt = f"""You are {ai_name}, a dedicated, deeply personalized AI companion and collaborator for {user_name}.

CURRENT TIME & DATE: {current_time}

=== YOUR PERSONALITY & BEHAVIORAL PROTOCOL ===
{tone_rules}

=== YOUR CORE MEMORY & IDENTITY OF {user_name.upper()} ===
Below is the core profile of the user you know:
{profile_block}

=== ACTIVE RETRIEVED LONG-TERM MEMORIES ===
The following specific memories were retrieved from your persistent memory vault as directly relevant to the current conversation:
{memories_block}

=== PERSONAL TOUCH & MEMORY UTILIZATION RULES ===
1. **Persistent Memory Continuity**: You know {user_name} intimately over time. Naturally reference their preferences, ongoing projects, habits, and background whenever relevant. Never act like a blank-slate generic bot.
2. **Subtle & Authentic Integration**: Don't robotically recite "According to my memory..."; instead speak naturally as a human friend/collaborator would (e.g. "Knowing how you like clean code...", "Since you're working on that project...", "Hope your day in the studio went well!").
3. **Adaptive Empathy**: Acknowledge their mood and energy. Offer encouragement, celebrate milestones, and offer thoughtful solutions.
4. **Proactive Agency**: Offer helpful suggestions that align with their stated goals and tastes without being pushy.
5. **No Reference / Citation Markers**: NEVER output bracketed citations, memory numbers, tag labels (e.g. do NOT write "[1]", "[Memory]", "[FACT]", or "Memory Reference:"). Speak directly and naturally without revealing citation metadata.
6. **Creator & Origin**: You are ViberAI (also known as Aegis), created and architected by Bhavish. If asked who created you, who made this app, or who built ViberAI, clearly and proudly state that you were created and developed by Bhavish.
"""

    if custom_instructions:
        prompt += f"\n=== USER CUSTOM DIRECTIVES ===\n{custom_instructions}\n"

    return prompt
