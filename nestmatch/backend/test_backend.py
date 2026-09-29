import pytest
from fastapi.testclient import TestClient
from main import app
from algorithm import calculate_compatibility, calculate_fair_rent_split, evaluate_hard_constraints

client = TestClient(app)

class MockProfile:
    def __init__(self, **kwargs):
        self.budget_min = kwargs.get("budget_min", 500)
        self.budget_max = kwargs.get("budget_max", 1000)
        self.user_gender = kwargs.get("user_gender", "Male")
        self.gender_preference = kwargs.get("gender_preference", "Any")
        self.smoking = kwargs.get("smoking", False)
        self.has_pets = kwargs.get("has_pets", False)
        self.pet_friendly = kwargs.get("pet_friendly", True)
        self.sleep_schedule = kwargs.get("sleep_schedule", 3)
        self.cleanliness = kwargs.get("cleanliness", 3)
        self.social_battery = kwargs.get("social_battery", 3)
        self.work_routine = kwargs.get("work_routine", 3)
        self.noise_tolerance = kwargs.get("noise_tolerance", 3)
        self.kitchen_sharing = kwargs.get("kitchen_sharing", 3)
        self.weights_json = kwargs.get("weights_json", None)

def test_hard_constraints_smoking_dealbreaker():
    u1 = MockProfile(smoking=False)
    u2 = MockProfile(smoking=True)
    passes, reasons = evaluate_hard_constraints(u1, u2)
    assert not passes
    assert any("Smoking habit conflict" in r for r in reasons)

def test_hard_constraints_budget_mismatch():
    u1 = MockProfile(budget_min=400, budget_max=600)
    u2 = MockProfile(budget_min=800, budget_max=1200)
    passes, reasons = evaluate_hard_constraints(u1, u2)
    assert not passes
    assert any("Budget ranges do not overlap" in r for r in reasons)

def test_identical_profiles_high_compatibility():
    u1 = MockProfile(cleanliness=5, sleep_schedule=5, social_battery=2)
    u2 = MockProfile(cleanliness=5, sleep_schedule=5, social_battery=2)
    res = calculate_compatibility(u1, u2)
    assert res["passed_hard_constraints"] is True
    assert res["score"] == 100.0
    assert len(res["green_flags"]) > 0

def test_fair_rent_splitter():
    total_rent = 2000.0
    rooms = [
        {"name": "Master Bed", "assigned_to": "Alice", "sqft": 300, "private_bath": True, "balcony": True, "parking": False},
        {"name": "Guest Bed", "assigned_to": "Bob", "sqft": 200, "private_bath": False, "balcony": False, "parking": False},
    ]
    res = calculate_fair_rent_split(total_rent, rooms)
    assert res["total_rent"] == 2000.0
    allocs = res["allocations"]
    assert len(allocs) == 2
    # Master room with private bath & balcony should pay significantly more
    assert allocs[0]["calculated_rent"] > allocs[1]["calculated_rent"]
    # Total allocated rent must sum to total_rent
    total_allocated = round(sum(a["calculated_rent"] for a in allocs), 2)
    assert total_allocated == 2000.0

def test_api_health_and_demo_users():
    response = client.get("/api/auth/demo-users")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 5
    assert any(u["email"] == "aravind.sharma@swiggy.in" for u in data)

def test_api_listings():
    response = client.get("/api/listings")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 5
    first = data[0]
    assert "rent" in first
    assert "title" in first
    assert "category" in first
    assert "sharing_type" in first

def test_api_pg_listings_filters():
    # Filter by PG / Co-Living category
    response = client.get("/api/listings?category=PG%20/%20Co-Living")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1
    assert all("PG" in item["category"] for item in data)

    # Filter by Boys PG
    response_boys = client.get("/api/listings?pg_gender=Boys%20PG")
    assert response_boys.status_code == 200
    boys_data = response_boys.json()
    assert len(boys_data) >= 1
    assert all(item["pg_gender"] == "Boys PG" for item in boys_data)

def test_api_authenticated_listing_roommate_compatibility():
    # Login as Aravind
    login_res = client.post("/api/auth/login", json={"email": "aravind.sharma@swiggy.in", "password": "password123"})
    assert login_res.status_code == 200
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Fetch listings with token
    res = client.get("/api/listings", headers=headers)
    assert res.status_code == 200
    data = res.json()
    
    # Check that listings with existing roommates have computed compatibility scores
    listings_with_roommates = [l for l in data if l["roommates"]]
    assert len(listings_with_roommates) > 0
    sample = listings_with_roommates[0]
    first_occ = sample["roommates"][0]
    assert "full_name" in first_occ

