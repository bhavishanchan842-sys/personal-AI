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

    # Verify profile was set
    prof_res = client.get("/api/profile")
    prof = prof_res.json()["profile"]
    assert prof["name"]["value"] == "Sarah Connor"
    assert prof["preferred_nickname"]["value"] == "Sarah"
    assert prof["occupation"]["value"] == "Cybersecurity Engineer"

    # Verify persona was updated
    persona_res = client.get("/api/persona")
    persona = persona_res.json()["persona"]
    assert persona["user_name"] == "Sarah"
    assert persona["tone_preset"] == "Tech Mentor"

