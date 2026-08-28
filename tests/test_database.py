import os
import pytest
from backend import database

@pytest.fixture(autouse=True)
def setup_test_db(tmp_path, monkeypatch):
    test_db = str(tmp_path / "test_personal_ai.db")
    monkeypatch.setattr("backend.database.DATABASE_PATH", test_db)
    database.init_db()

def test_database_init_and_defaults():
    profile = database.get_profile()
    assert "name" in profile
    assert profile["name"]["value"] == "Bhavik"

    persona = database.get_persona_config()
    assert persona["ai_name"] == "Aegis"
    assert persona["tone_preset"] == "Empathetic Companion"

def test_memory_crud():
    # Insert
    mem_id = database.insert_memory("User likes dark chocolate", category="preference", importance=0.8)
    assert mem_id > 0

    # Retrieve
    memories = database.get_all_memories()
    assert len(memories) >= 1
    found = next((m for m in memories if m["id"] == mem_id), None)
    assert found is not None
    assert found["content"] == "User likes dark chocolate"
    assert found["category"] == "preference"

    # Update
    updated = database.update_memory(mem_id, "User loves 85% dark chocolate", category="preference", importance=0.9)
    assert updated is True
    memories_after = database.get_all_memories()
    updated_mem = next(m for m in memories_after if m["id"] == mem_id)
    assert updated_mem["content"] == "User loves 85% dark chocolate"

    # Access count
    database.record_memory_access([mem_id])
    mems_with_emb = database.get_memories_with_embeddings()
    accessed = next(m for m in mems_with_emb if m["id"] == mem_id)
    assert accessed["access_count"] == 1

    # Delete
    deleted = database.delete_memory(mem_id)
    assert deleted is True
    assert len([m for m in database.get_all_memories() if m["id"] == mem_id]) == 0

def test_profile_crud():
    database.set_profile_field("city", "San Francisco", "location")
    prof = database.get_profile()
    assert prof["city"]["value"] == "San Francisco"
    assert prof["city"]["category"] == "location"

    deleted = database.delete_profile_field("city")
    assert deleted is True
    assert "city" not in database.get_profile()

def test_chat_sessions_and_messages():
    sess_id = "test_session_123"
    database.create_session(sess_id, "Testing Session")
    
    msg_id = database.add_message(sess_id, "user", "Hello AI!")
    assert msg_id > 0
    
    database.add_message(sess_id, "assistant", "Hello Bhavik!", memory_triggers=[1, 2])
    
    messages = database.get_session_messages(sess_id)
    assert len(messages) == 2
    assert messages[0]["role"] == "user"
    assert messages[1]["role"] == "assistant"
    assert messages[1]["memory_triggers"] == [1, 2]
