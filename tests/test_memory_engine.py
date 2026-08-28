import pytest
from backend import database
from backend import memory_engine
from backend.embeddings import generate_local_embedding, cosine_similarity

@pytest.fixture(autouse=True)
def setup_test_db(tmp_path, monkeypatch):
    test_db = str(tmp_path / "test_memory.db")
    monkeypatch.setattr("backend.database.DATABASE_PATH", test_db)
    database.init_db()

def test_embeddings_and_cosine_similarity():
    v1 = generate_local_embedding("I love Python and machine learning")
    v2 = generate_local_embedding("I really like machine learning and Python code")
    v3 = generate_local_embedding("Cooking italian pasta with parmesan")

    sim_high = cosine_similarity(v1, v2)
    sim_low = cosine_similarity(v1, v3)

    assert sim_high > sim_low
    assert sim_high > 0.4
    assert sim_low < 0.3

def test_add_and_retrieve_relevant_memories():
    memory_engine.add_or_update_memory("User prefers typing on mechanical keyboards with tactile switches", category="preference", importance=0.8)
    memory_engine.add_or_update_memory("User owns a golden retriever dog named Max", category="personal", importance=0.9)
    memory_engine.add_or_update_memory("User works as an AI infrastructure engineer building distributed systems", category="work", importance=0.95)

    # Query 1: Keyboard
    results_kb = memory_engine.retrieve_relevant_memories("What kind of keyboard switches do I like?", top_k=2)
    assert len(results_kb) > 0
    assert "mechanical keyboards" in results_kb[0]["content"]

    # Query 2: Pet
    results_pet = memory_engine.retrieve_relevant_memories("Tell me about my dog", top_k=2)
    assert len(results_pet) > 0
    assert "golden retriever" in results_pet[0]["content"]

def test_duplicate_memory_deduplication():
    id1, action1 = memory_engine.add_or_update_memory("User drinks black coffee every morning", category="habit", importance=0.7)
    assert action1 == "inserted"

    id2, action2 = memory_engine.add_or_update_memory("User drinks black coffee every morning", category="habit", importance=0.85)
    assert action2 == "updated"
    assert id1 == id2

def test_parse_extraction_json():
    sample_llm_json = """
    ```json
    {
        "profile_updates": [
            {"key": "favorite_editor", "value": "Neovim", "category": "preferences"}
        ],
        "new_memories": [
            {"content": "User prefers Neovim for coding", "category": "preference", "importance": 0.8}
        ]
    }
    ```
    """
    res = memory_engine.parse_extraction_json(sample_llm_json)
    assert len(res["profile_updates"]) == 1
    assert res["profile_updates"][0]["key"] == "favorite_editor"
    assert len(res["new_memories"]) == 1
    assert "Neovim" in res["new_memories"][0]["content"]
