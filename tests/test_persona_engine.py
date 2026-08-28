import pytest
from backend import persona_engine

def test_build_tone_guidance():
    persona = {
        "warmth": 90,
        "humor": 85,
        "directness": 80,
        "formality": 10,
        "use_emojis": True,
        "tone_preset": "Candid Best Friend"
    }
    guidance = persona_engine.build_tone_guidance(persona)
    assert "Candid Best Friend" in guidance
    assert "Warmth: Highly supportive" in guidance
    assert "Humor: Playful" in guidance
    assert "Directness: Highly concise" in guidance
    assert "Casual, conversational" in guidance
    assert "Emojis: Use expressive emojis" in guidance

def test_assemble_system_prompt():
    persona = {
        "ai_name": "Aegis",
        "user_name": "Bhavik",
        "warmth": 80,
        "humor": 50,
        "directness": 60,
        "formality": 30,
        "use_emojis": True,
        "tone_preset": "Empathetic Companion",
        "custom_instructions": "Always prioritize clarity and maintain positive energy."
    }
    profile = {
        "name": {"value": "Bhavik", "category": "identity"},
        "primary_goals": {"value": "Building autonomous AI agents", "category": "goals"}
    }
    memories = [
        {"content": "User prefers FastAPI and Python for backends", "category": "preference", "created_at": "2026-08-28T10:00:00"}
    ]

    prompt = persona_engine.assemble_system_prompt(persona, profile, memories, current_time="Friday, August 28, 2026")
    
    assert "Aegis" in prompt
    assert "Bhavik" in prompt
    assert "Building autonomous AI agents" in prompt
    assert "FastAPI and Python" in prompt
    assert "Always prioritize clarity" in prompt
