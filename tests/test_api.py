import pytest
from fastapi.testclient import TestClient
from backend import database
from backend.main import app

@pytest.fixture(autouse=True)
def setup_test_db(tmp_path, monkeypatch):
    test_db = str(tmp_path / "test_api.db")
    monkeypatch.setattr("backend.database.DATABASE_PATH", test_db)
    database.init_db()

@pytest.fixture
def client():
    return TestClient(app)

def test_api_index(client):
    response = client.get("/")
    assert response.status_code == 200

def test_api_memories_crud(client):
    # 1. Create
    res = client.post("/api/memories", json={
        "content": "User loves cycling on weekends",
        "category": "habit",
        "importance": 0.75
    })
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True
    mem_id = data["id"]

    # 2. List
    res_list = client.get("/api/memories")
    assert res_list.status_code == 200
    mems = res_list.json()["memories"]
    assert any(m["id"] == mem_id for m in mems)

    # 3. Update
    res_update = client.put(f"/api/memories/{mem_id}", json={
        "content": "User loves gravel cycling on mountain trails",
        "category": "habit",
        "importance": 0.85
    })
    assert res_update.status_code == 200

    # 4. Delete
    res_del = client.delete(f"/api/memories/{mem_id}")
    assert res_del.status_code == 200

def test_api_profile_endpoints(client):
    res = client.post("/api/profile", json={
        "key": "current_project",
        "value": "Autonomous Agent Workspace",
        "category": "work"
    })
    assert res.status_code == 200
    
    res_get = client.get("/api/profile")
    assert res_get.status_code == 200
    prof = res_get.json()["profile"]
    assert "current_project" in prof
    assert prof["current_project"]["value"] == "Autonomous Agent Workspace"

def test_api_persona_endpoints(client):
    persona_payload = {
        "ai_name": "Atlas",
        "user_name": "Bhavik",
        "tone_preset": "Tech Mentor",
        "warmth": 60,
        "humor": 40,
        "directness": 80,
        "formality": 40,
        "use_emojis": False,
        "custom_instructions": "Focus on high performance code."
    }
    res = client.post("/api/persona", json=persona_payload)
    assert res.status_code == 200
    
    res_get = client.get("/api/persona")
    assert res_get.status_code == 200
    p = res_get.json()["persona"]
    assert p["ai_name"] == "Atlas"
    assert p["tone_preset"] == "Tech Mentor"

def test_api_groq_settings(client):
    res = client.post("/api/settings", json={
        "active_provider": "groq",
        "active_model": "llama-3.3-70b-versatile",
        "groq_api_key": "gsk_test_1234567890abcdef"
    })
    assert res.status_code == 200

    res_get = client.get("/api/settings")
    assert res_get.status_code == 200
    data = res_get.json()
    assert data["active_provider"] == "groq"
    assert data["active_model"] == "llama-3.3-70b-versatile"
    assert data["groq_api_key_set"] is True
    assert "gsk_" in data["groq_api_key_masked"]


def test_api_export_and_import(client):
    # Add memory first
    client.post("/api/memories", json={"content": "Testing export backup", "category": "fact", "importance": 0.5})
    
    # Export
    res_export = client.get("/api/export")
    assert res_export.status_code == 200
    exported_data = res_export.json()
    assert "memories" in exported_data
    assert "user_profile" in exported_data
    assert len(exported_data["memories"]) >= 1

    # Import
    res_import = client.post("/api/import", json=exported_data)
    assert res_import.status_code == 200
    assert res_import.json()["success"] is True

def test_api_onboarding(client):
    onboard_payload = {
        "name": "Sarah Connor",
        "preferred_nickname": "Sarah",
        "occupation": "Cybersecurity Engineer",
        "primary_goals": "Securing distributed AI infrastructure",
        "communication_preference": "Direct, tactical, concise",
        "tone_preset": "Tech Mentor"
    }
    res = client.post("/api/onboarding", json=onboard_payload)
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True
    assert data["user_name"] == "Sarah"
    uid = data["user_id"]

    # Verify profile was set for this user
    prof_res = client.get("/api/profile", headers={"X-User-Id": uid})
    prof = prof_res.json()["profile"]
    assert prof["name"]["value"] == "Sarah Connor"
    assert prof["preferred_nickname"]["value"] == "Sarah"
    assert prof["occupation"]["value"] == "Cybersecurity Engineer"

    # Verify persona was updated for this user
    persona_res = client.get("/api/persona", headers={"X-User-Id": uid})
    persona = persona_res.json()["persona"]
    assert persona["user_name"] == "Sarah"
    assert persona["tone_preset"] == "Tech Mentor"

def test_api_multi_user_isolation(client):
    # User 1: Onboard Alice
    res1 = client.post("/api/onboarding", json={
        "user_id": "user_alice",
        "name": "Alice Wonderland",
        "preferred_nickname": "Alice",
        "occupation": "Botanist",
        "tone_preset": "Empathetic Companion"
    }, headers={"X-User-Id": "user_alice"})
    assert res1.status_code == 200

    # User 2: Onboard Bob
    res2 = client.post("/api/onboarding", json={
        "user_id": "user_bob",
        "name": "Bob Builder",
        "preferred_nickname": "Bob",
        "occupation": "Architect",
        "tone_preset": "Tech Mentor"
    }, headers={"X-User-Id": "user_bob"})
    assert res2.status_code == 200

    # Query profile for Alice
    prof_alice = client.get("/api/profile", headers={"X-User-Id": "user_alice"}).json()["profile"]
    assert prof_alice["name"]["value"] == "Alice Wonderland"
    assert prof_alice["occupation"]["value"] == "Botanist"

    # Query profile for Bob
    prof_bob = client.get("/api/profile", headers={"X-User-Id": "user_bob"}).json()["profile"]
    assert prof_bob["name"]["value"] == "Bob Builder"
    assert prof_bob["occupation"]["value"] == "Architect"

    # Add memory for Alice
    client.post("/api/memories", json={"content": "Alice's secret garden", "category": "fact"}, headers={"X-User-Id": "user_alice"})
    
    # Query memories
    mems_alice = client.get("/api/memories", headers={"X-User-Id": "user_alice"}).json()["memories"]
    mems_bob = client.get("/api/memories", headers={"X-User-Id": "user_bob"}).json()["memories"]

    assert any("Alice's secret garden" in m["content"] for m in mems_alice)
    assert not any("Alice's secret garden" in m["content"] for m in mems_bob)


