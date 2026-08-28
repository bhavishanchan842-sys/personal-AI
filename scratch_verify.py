import sys
import asyncio
if hasattr(sys.stdout, 'reconfigure'):
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass
from backend import database, memory_engine, persona_engine, llm_client

async def test_end_to_end_flow():
    print("1. Initializing DB...")
    database.init_db()

    print("2. Storing sample memories...")
    memory_engine.add_or_update_memory("User's favorite drink is Japanese Matcha Latte with oat milk", category="preference", importance=0.85)
    memory_engine.add_or_update_memory("User is currently building a high-throughput personal AI assistant using FastAPI and SQLite", category="work", importance=0.95)
    memory_engine.add_or_update_memory("User has a pet rescue cat named Luna who likes sleeping on the laptop", category="personal", importance=0.9)
    memory_engine.add_or_update_memory("User works out at 6:30 AM every weekday morning", category="habit", importance=0.7)

    print("3. Querying relevant memories for 'What coffee or tea do I like?'...")
    recalled = memory_engine.retrieve_relevant_memories("What coffee or tea do I like?", top_k=3)
    print(f"   Recalled {len(recalled)} memories:")
    for r in recalled:
        print(f"   -> [{r['category'].upper()}] {r['content']}")
    assert any("Matcha Latte" in r["content"] for r in recalled), "Failed to recall drink preference!"

    print("4. Querying relevant memories for 'Who is Luna?'...")
    recalled_pet = memory_engine.retrieve_relevant_memories("Who is Luna?", top_k=3)
    print(f"   Recalled {len(recalled_pet)} memories:")
    for r in recalled_pet:
        print(f"   -> [{r['category'].upper()}] {r['content']}")
    assert any("Luna" in r["content"] for r in recalled_pet), "Failed to recall pet memory!"

    print("5. Synthesizing dynamic system prompt...")
    persona = database.get_persona_config()
    profile = database.get_profile()
    system_prompt = persona_engine.assemble_system_prompt(persona, profile, recalled_pet)
    print("   Generated Prompt Snippet:")
    print("   " + "\n   ".join(system_prompt.splitlines()[:18]))

    print("6. Simulating streaming chat response...")
    messages = [{"role": "user", "content": "How's Luna doing?"}]
    tokens = []
    async for token in llm_client.stream_chat_completion(messages, system_prompt):
        tokens.append(token)
    response_text = "".join(tokens)
    print(f"   Response Preview: {response_text[:180]}...")

    print("\n✅ All End-to-End Personal AI System checks PASSED successfully!")

if __name__ == "__main__":
    asyncio.run(test_end_to_end_flow())
