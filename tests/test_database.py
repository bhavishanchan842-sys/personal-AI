import os
import pytest
from backend import database

@pytest.fixture(autouse=True)
def setup_test_db(tmp_path, monkeypatch):
    test_db = str(tmp_path / "test_personal_ai.db")
    monkeypatch.setattr("backend.database.DATABASE_PATH", test_db)
    database.init_db()

def test_database_init_and_defaults():
    profile = database.get_profile("default")
    assert "name" in profile
    assert profile["name"]["value"] == "Bhavik"

    persona = database.get_persona_config("default")
    assert persona["ai_name"] == "Aegis"
    assert persona["tone_preset"] == "Empathetic Companion"

def test_multi_user_isolation():
    # User A
    database.create_or_update_user("user_a", "Alice Johnson", "Alice")
    database.set_profile_field("name", "Alice Johnson", "identity", user_id="user_a")
    database.set_profile_field("favorite_lang", "Python", "preference", user_id="user_a")
    database.insert_memory("Alice loves tea", category="habit", importance=0.8, user_id="user_a")

    # User B
    database.create_or_update_user("user_b", "Bob Smith", "Bob")
    database.set_profile_field("name", "Bob Smith", "identity", user_id="user_b")
    database.set_profile_field("favorite_lang", "Rust", "preference", user_id="user_b")
    database.insert_memory("Bob loves coffee", category="habit", importance=0.8, user_id="user_b")

    # Verify User A profile & memories
    prof_a = database.get_profile("user_a")
    assert prof_a["name"]["value"] == "Alice Johnson"
    assert prof_a["favorite_lang"]["value"] == "Python"
    mems_a = database.get_all_memories("user_a")
    assert len(mems_a) == 1
    assert "Alice loves tea" in mems_a[0]["content"]

    # Verify User B profile & memories
    prof_b = database.get_profile("user_b")
    assert prof_b["name"]["value"] == "Bob Smith"
    assert prof_b["favorite_lang"]["value"] == "Rust"
    mems_b = database.get_all_memories("user_b")
    assert len(mems_b) == 1
    assert "Bob loves coffee" in mems_b[0]["content"]

    # Ensure no cross-contamination
    assert "Alice" not in str(prof_b)
    assert "Bob" not in str(prof_a)
    assert "Bob loves coffee" not in [m["content"] for m in mems_a]
    assert "Alice loves tea" not in [m["content"] for m in mems_b]

def test_memory_crud():
    # Insert
    mem_id = database.insert_memory("User likes dark chocolate", category="preference", importance=0.8, user_id="default")
    assert mem_id > 0

    # Retrieve
    memories = database.get_all_memories("default")
    assert len(memories) >= 1
    found = next((m for m in memories if m["id"] == mem_id), None)
    assert found is not None
    assert found["content"] == "User likes dark chocolate"
    assert found["category"] == "preference"

    # Update
    updated = database.update_memory(mem_id, "User loves 85% dark chocolate", category="preference", importance=0.9, user_id="default")
    assert updated is True
    memories_after = database.get_all_memories("default")
    updated_mem = next(m for m in memories_after if m["id"] == mem_id)
    assert updated_mem["content"] == "User loves 85% dark chocolate"

    # Access count
    database.record_memory_access([mem_id])
    mems_with_emb = database.get_memories_with_embeddings("default")
    accessed = next(m for m in mems_with_emb if m["id"] == mem_id)
    assert accessed["access_count"] == 1

    # Delete
    deleted = database.delete_memory(mem_id, user_id="default")
    assert deleted is True
    assert len([m for m in database.get_all_memories("default") if m["id"] == mem_id]) == 0

def test_profile_crud():
    database.set_profile_field("city", "San Francisco", "location", user_id="default")
    prof = database.get_profile("default")
    assert prof["city"]["value"] == "San Francisco"
    assert prof["city"]["category"] == "location"

    deleted = database.delete_profile_field("city", user_id="default")
    assert deleted is True
    assert "city" not in database.get_profile("default")

def test_chat_sessions_and_messages():
    sess_id = "test_session_123"
    database.create_session(sess_id, "Testing Session", user_id="default")
    
    msg_id = database.add_message(sess_id, "user", "Hello AI!")
    assert msg_id > 0
    
    database.add_message(sess_id, "assistant", "Hello Bhavik!", memory_triggers=[1, 2])
    
    messages = database.get_session_messages(sess_id)
    assert len(messages) == 2
    assert messages[0]["role"] == "user"
    assert messages[1]["role"] == "assistant"
    assert messages[1]["memory_triggers"] == [1, 2]
