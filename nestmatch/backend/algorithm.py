import json
import math
from typing import Dict, Any, List, Tuple

DEFAULT_WEIGHTS = {
    "cleanliness": 3.0,
    "sleep_schedule": 2.5,
    "social_battery": 2.0,
    "noise_tolerance": 2.0,
    "work_routine": 1.5,
    "kitchen_sharing": 1.0,
}

DIMENSION_LABELS = {
    "cleanliness": "Cleanliness Standards",
    "sleep_schedule": "Sleep & Wake Schedule",
    "social_battery": "Social & Guest Frequency",
    "noise_tolerance": "Noise Tolerance",
    "work_routine": "WFH vs Campus/Office Routine",
    "kitchen_sharing": "Kitchen & Meal Sharing",
}

def evaluate_hard_constraints(user_profile: Any, candidate_profile: Any) -> Tuple[bool, List[str]]:
    """
    Tier 1: Evaluates binary dealbreakers.
    Returns (passes_constraints, list_of_failure_reasons).
    """
    reasons = []

    # 1. Budget Overlap
    # Overlap exists if max(user_min, cand_min) <= min(user_max, cand_max)
    overlap_min = max(user_profile.budget_min, candidate_profile.budget_min)
    overlap_max = min(user_profile.budget_max, candidate_profile.budget_max)
    if overlap_min > overlap_max:
        reasons.append(f"Budget ranges do not overlap (₹{user_profile.budget_min:,.0f}-₹{user_profile.budget_max:,.0f} vs ₹{candidate_profile.budget_min:,.0f}-₹{candidate_profile.budget_max:,.0f})")

    # 2. Gender Preference
    if user_profile.gender_preference != "Any":
        if candidate_profile.user_gender != "Any" and user_profile.gender_preference != candidate_profile.user_gender:
            reasons.append(f"Gender preference mismatch (Looking for {user_profile.gender_preference})")
    if candidate_profile.gender_preference != "Any":
        if user_profile.user_gender != "Any" and candidate_profile.gender_preference != user_profile.user_gender:
            reasons.append(f"Candidate prefers {candidate_profile.gender_preference} flatmates")

    # 3. Smoking policy
    if (not user_profile.smoking) and candidate_profile.smoking:
        reasons.append("Smoking habit conflict (Candidate smokes)")
    elif user_profile.smoking and (not candidate_profile.smoking):
        reasons.append("Smoking habit conflict (User smokes)")

    # 4. Pet Allergies / Policy
    if candidate_profile.has_pets and not user_profile.pet_friendly:
        reasons.append("Candidate has pets, but your profile specifies non-pet friendly")
    if user_profile.has_pets and not candidate_profile.pet_friendly:
        reasons.append("You have pets, but candidate's profile is not pet friendly")

    # 5. Strict Pure-Veg Kitchen Dealbreaker check
    u_diet = getattr(user_profile, "dietary_preference", "Flexible")
    c_diet = getattr(candidate_profile, "dietary_preference", "Flexible")
    if u_diet == "Pure Vegetarian" and c_diet == "Non-Vegetarian":
        reasons.append("Dietary mismatch: Strict Pure-Vegetarian kitchen requirement vs Non-Vegetarian")
    elif c_diet == "Pure Vegetarian" and u_diet == "Non-Vegetarian":
        reasons.append("Candidate requires strict Pure-Vegetarian kitchen")

    passes = (len(reasons) == 0)
    return passes, reasons


def calculate_compatibility(user_profile: Any, candidate_profile: Any) -> Dict[str, Any]:
    """
    Tier 2 & 3: Calculates weighted lifestyle distance and generates explainable breakdown.
    """
    passes, dealbreakers = evaluate_hard_constraints(user_profile, candidate_profile)
    if not passes:
        return {
            "score": 0.0,
            "passed_hard_constraints": False,
            "dealbreakers": dealbreakers,
            "green_flags": [],
            "yellow_flags": dealbreakers,
            "dimension_scores": {},
        }

    # Load weights
    weights = DEFAULT_WEIGHTS.copy()
    if user_profile.weights_json:
        try:
            custom_w = json.loads(user_profile.weights_json)
            for k, v in custom_w.items():
                if k in weights and isinstance(v, (int, float)):
                    weights[k] = float(v)
        except Exception:
            pass

    dimensions = [
        "cleanliness",
        "sleep_schedule",
        "social_battery",
        "noise_tolerance",
        "work_routine",
        "kitchen_sharing",
    ]

    total_weight = sum(weights.values())
    weighted_diff_sq = 0.0
    max_possible_diff_sq = 0.0

    dimension_scores = {}
    green_flags = []
    yellow_flags = []

    for dim in dimensions:
        u_val = getattr(user_profile, dim, 3)
        c_val = getattr(candidate_profile, dim, 3)
        diff = abs(u_val - c_val)
        w = weights.get(dim, 1.0)

        weighted_diff_sq += w * (diff ** 2)
        max_possible_diff_sq += w * (4.0 ** 2) # (5 - 1) = 4 is max delta on 1-5 scale

        # Per-dimension similarity percentage (0-100)
        dim_sim = round(max(0.0, (1.0 - (diff / 4.0)) * 100), 1)
        dimension_scores[dim] = {
            "label": DIMENSION_LABELS[dim],
            "user_val": u_val,
            "candidate_val": c_val,
            "diff": diff,
            "similarity": dim_sim,
        }

        # Explainable Insights Generator
        if diff == 0:
            if dim == "sleep_schedule":
                desc = "Exact match on sleep cycle (both " + ("Early Birds" if u_val <= 2 else "Night Owls" if u_val >= 4 else "Moderate Sleepers") + ")"
            elif dim == "cleanliness":
                desc = "Identical cleanliness standards (both " + ("Pristine & Neat" if u_val >= 4 else "Relaxed") + ")"
            elif dim == "social_battery":
                desc = "Perfect harmony on guest frequency and home atmosphere"
            else:
                desc = f"Identical preference on {DIMENSION_LABELS[dim]}"
            green_flags.append(desc)
        elif diff == 1:
            if w >= 2.5:
                green_flags.append(f"Strong alignment on high-priority: {DIMENSION_LABELS[dim]}")
        elif diff >= 3:
            yellow_flags.append(f"Noticeable difference in {DIMENSION_LABELS[dim]} (Rating {u_val} vs {c_val})")

    # Weighted Euclidean Distance
    distance = math.sqrt(weighted_diff_sq)
    max_distance = math.sqrt(max_possible_diff_sq) if max_possible_diff_sq > 0 else 1.0

    # Final Normalized Compatibility Percentage
    score = max(0.0, (1.0 - (distance / max_distance)) * 100.0)
    score = round(score, 1)

    # Bonus: add contextual green flags if list is short
    if len(green_flags) == 0:
        green_flags.append("Balanced overall lifestyle profiles")

    return {
        "score": score,
        "passed_hard_constraints": True,
        "dealbreakers": [],
        "green_flags": green_flags,
        "yellow_flags": yellow_flags,
        "dimension_scores": dimension_scores,
    }


def calculate_fair_rent_split(total_rent: float, rooms: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Computes fair rent distribution among roommates based on:
    - Room area / square footage (weight: 60%)
    - Private vs shared bathroom (weight: 20%)
    - Balcony / private window / extra perks (weight: 20%)
    """
    if not rooms:
        return {"total_rent": total_rent, "allocations": []}

    total_sqft = sum(r.get("sqft", 150) for r in rooms)
    if total_sqft == 0:
        total_sqft = len(rooms) * 150

    # Calculate raw score for each room
    room_scores = []
    for r in rooms:
        sqft = r.get("sqft", 150)
        has_private_bath = 1.0 if r.get("private_bath", False) else 0.0
        has_balcony = 1.0 if r.get("balcony", False) else 0.0
        has_parking = 1.0 if r.get("parking", False) else 0.0

        # Feature component
        sqft_factor = sqft / total_sqft
        perks_factor = 1.0 + (0.25 * has_private_bath) + (0.12 * has_balcony) + (0.08 * has_parking)
        effective_score = sqft_factor * perks_factor
        room_scores.append(effective_score)

    total_effective_score = sum(room_scores)
    allocations = []
    running_sum = 0.0

    for i, r in enumerate(rooms):
        fraction = room_scores[i] / total_effective_score
        calculated_rent = round(total_rent * fraction, 2)
        allocations.append({
            "room_name": r.get("name", f"Room {i+1}"),
            "assigned_to": r.get("assigned_to", f"Tenant {i+1}"),
            "sqft": r.get("sqft", 150),
            "private_bath": r.get("private_bath", False),
            "balcony": r.get("balcony", False),
            "parking": r.get("parking", False),
            "calculated_rent": calculated_rent,
            "rent_percentage": round(fraction * 100, 1)
        })
        running_sum += calculated_rent

    # Adjust any rounding discrepancy to the largest room
    diff = round(total_rent - running_sum, 2)
    if diff != 0 and allocations:
        allocations[0]["calculated_rent"] = round(allocations[0]["calculated_rent"] + diff, 2)

    return {
        "total_rent": total_rent,
        "allocations": allocations,
        "algorithm": "Weighted Proportional Multi-Attribute Valuation (Area + Amenities)",
    }
