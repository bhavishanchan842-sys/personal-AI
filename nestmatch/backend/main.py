import json
from typing import List, Optional
from fastapi import FastAPI, Depends, HTTPException, status, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from database import engine, get_db, Base
import models
import schemas
from auth import hash_password, verify_password, create_access_token, get_current_user, get_current_user_optional
from algorithm import calculate_compatibility, calculate_fair_rent_split

# Ensure tables are created
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Smart Rental and Roommate Compatibility API",
    description="Intelligent Room, PG & Roommate Compatibility Engine",
    version="1.0.0"
)

# Enable CORS for local dev and network previews
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ==========================================
# 1. Authentication Endpoints
# ==========================================

@app.post("/api/auth/register", response_model=schemas.TokenResponse)
def register(data: schemas.UserRegister, db: Session = Depends(get_db)):
    existing = db.query(models.User).filter(models.User.email == data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email is already registered")

    user = models.User(
        email=data.email,
        hashed_password=hash_password(data.password),
        full_name=data.full_name,
        role=data.role,
        avatar=data.avatar or f"https://api.dicebear.com/7.x/avataaars/svg?seed={data.full_name}",
        college_or_company=data.college_or_company,
        is_verified=bool(data.email.endswith(".edu") or "university" in data.email),
        bio=data.bio,
        phone=data.phone
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # Initialize default lifestyle profile for user
    profile = models.LifestyleProfile(user_id=user.id)
    db.add(profile)
    db.commit()

    token = create_access_token(data={"sub": user.email})
    return {"access_token": token, "token_type": "bearer", "user": user}


@app.post("/api/auth/login", response_model=schemas.TokenResponse)
def login(data: schemas.UserLogin, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == data.email).first()
    if not user or not verify_password(user.hashed_password, data.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )

    token = create_access_token(data={"sub": user.email})
    return {"access_token": token, "token_type": "bearer", "user": user}


@app.get("/api/auth/me", response_model=schemas.UserResponse)
def get_me(current_user: models.User = Depends(get_current_user)):
    return current_user


@app.get("/api/auth/demo-users")
def get_demo_users(db: Session = Depends(get_db)):
    """Convenient endpoint for 1-click switching during viva/evaluations."""
    users = db.query(models.User).all()
    return [
        {
            "id": u.id,
            "email": u.email,
            "full_name": u.full_name,
            "role": u.role,
            "avatar": u.avatar,
            "college_or_company": u.college_or_company
        }
        for u in users
    ]


# ==========================================
# 2. Lifestyle Profile Endpoints
# ==========================================

@app.get("/api/profile/me", response_model=schemas.ProfileResponse)
def get_my_profile(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.query(models.LifestyleProfile).filter(models.LifestyleProfile.user_id == current_user.id).first()
    if not profile:
        profile = models.LifestyleProfile(user_id=current_user.id)
        db.add(profile)
        db.commit()
        db.refresh(profile)

    res = schemas.ProfileResponse.from_orm(profile)
    if profile.weights_json:
        try:
            res.weights = json.loads(profile.weights_json)
        except Exception:
            pass
    return res


@app.put("/api/profile/me", response_model=schemas.ProfileResponse)
def update_my_profile(
    data: schemas.ProfileUpdate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.query(models.LifestyleProfile).filter(models.LifestyleProfile.user_id == current_user.id).first()
    if not profile:
        profile = models.LifestyleProfile(user_id=current_user.id)
        db.add(profile)

    profile.sleep_schedule = data.sleep_schedule
    profile.cleanliness = data.cleanliness
    profile.social_battery = data.social_battery
    profile.work_routine = data.work_routine
    profile.noise_tolerance = data.noise_tolerance
    profile.kitchen_sharing = data.kitchen_sharing
    profile.smoking = data.smoking
    profile.drinking = data.drinking
    profile.has_pets = data.has_pets
    profile.pet_friendly = data.pet_friendly
    profile.budget_min = data.budget_min
    profile.budget_max = data.budget_max
    profile.user_gender = data.user_gender
    profile.gender_preference = data.gender_preference
    profile.preferred_city = data.preferred_city
    profile.move_in_date = data.move_in_date
    if data.weights:
        profile.weights_json = json.dumps(data.weights)

    db.commit()
    db.refresh(profile)

    res = schemas.ProfileResponse.from_orm(profile)
    if profile.weights_json:
        try:
            res.weights = json.loads(profile.weights_json)
        except Exception:
            pass
    return res


# ==========================================
# 3. Compatibility & Matching Endpoints
# ==========================================

@app.get("/api/match/recommendations", response_model=List[schemas.MatchCandidate])
def get_roommate_recommendations(
    min_score: float = Query(0.0, ge=0.0, le=100.0),
    city: Optional[str] = None,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user_prof = db.query(models.LifestyleProfile).filter(models.LifestyleProfile.user_id == current_user.id).first()
    if not user_prof:
        raise HTTPException(status_code=400, detail="Please complete your lifestyle questionnaire first")

    # Fetch all candidate profiles (excluding self)
    candidate_profiles = db.query(models.LifestyleProfile).filter(models.LifestyleProfile.user_id != current_user.id).all()

    recommendations = []
    for cand_prof in candidate_profiles:
        cand_user = db.query(models.User).filter(models.User.id == cand_prof.user_id).first()
        if not cand_user or cand_user.role == "landlord":
            continue

        # Pan-India flexible city filter
        if city:
            c_query = city.strip().lower()
            if c_query not in ["", "all", "all india", "all indian cities", "pan-india", "any"]:
                cand_city = (cand_prof.preferred_city or "").lower()
                # Match if search query is in candidate city or candidate city is in query
                if c_query not in cand_city and cand_city not in c_query:
                    continue

        result = calculate_compatibility(user_prof, cand_prof)
        score = result["score"]

        if score >= min_score:
            cand_profile_resp = schemas.ProfileResponse.from_orm(cand_prof)
            if cand_prof.weights_json:
                try:
                    cand_profile_resp.weights = json.loads(cand_prof.weights_json)
                except Exception:
                    pass

            recommendations.append({
                "user": schemas.UserResponse.from_orm(cand_user),
                "profile": cand_profile_resp,
                "compatibility_score": score,
                "passed_hard_constraints": result["passed_hard_constraints"],
                "dealbreakers": result["dealbreakers"],
                "green_flags": result["green_flags"],
                "yellow_flags": result["yellow_flags"],
                "dimension_scores": result["dimension_scores"],
            })

    # Rank sorted by compatibility score descending
    recommendations.sort(key=lambda x: x["compatibility_score"], reverse=True)
    return recommendations


@app.get("/api/match/candidate/{candidate_user_id}", response_model=schemas.MatchCandidate)
def get_candidate_details(
    candidate_user_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user_prof = db.query(models.LifestyleProfile).filter(models.LifestyleProfile.user_id == current_user.id).first()
    cand_prof = db.query(models.LifestyleProfile).filter(models.LifestyleProfile.user_id == candidate_user_id).first()
    cand_user = db.query(models.User).filter(models.User.id == candidate_user_id).first()

    if not user_prof or not cand_prof or not cand_user:
        raise HTTPException(status_code=404, detail="Candidate or user profile not found")

    result = calculate_compatibility(user_prof, cand_prof)
    cand_profile_resp = schemas.ProfileResponse.from_orm(cand_prof)
    if cand_prof.weights_json:
        try:
            cand_profile_resp.weights = json.loads(cand_prof.weights_json)
        except Exception:
            pass

    return {
        "user": schemas.UserResponse.from_orm(cand_user),
        "profile": cand_profile_resp,
        "compatibility_score": result["score"],
        "passed_hard_constraints": result["passed_hard_constraints"],
        "dealbreakers": result["dealbreakers"],
        "green_flags": result["green_flags"],
        "yellow_flags": result["yellow_flags"],
        "dimension_scores": result["dimension_scores"],
    }


# ==========================================
# 4. Property Listings Endpoints
# ==========================================

@app.get("/api/listings", response_model=List[schemas.ListingResponse])
def get_listings(
    min_rent: Optional[float] = None,
    max_rent: Optional[float] = None,
    category: Optional[str] = None,
    pg_gender: Optional[str] = None,
    sharing_type: Optional[str] = None,
    food_included: Optional[str] = None,
    property_type: Optional[str] = None,
    bedrooms: Optional[int] = None,
    city: Optional[str] = None,
    current_user: Optional[models.User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    query = db.query(models.PropertyListing).filter(models.PropertyListing.is_active == True)

    if min_rent is not None:
        query = query.filter(models.PropertyListing.rent >= min_rent)
    if max_rent is not None:
        query = query.filter(models.PropertyListing.rent <= max_rent)
    if category and category != "All":
        query = query.filter(models.PropertyListing.category.ilike(f"%{category}%"))
    if pg_gender and pg_gender != "All":
        query = query.filter(models.PropertyListing.pg_gender == pg_gender)
    if sharing_type and sharing_type != "All":
        query = query.filter(models.PropertyListing.sharing_type.ilike(f"%{sharing_type}%"))
    if food_included and food_included != "All":
        if food_included.lower() == "meals included":
            query = query.filter(models.PropertyListing.food_included != "No Food")
        else:
            query = query.filter(models.PropertyListing.food_included.ilike(f"%{food_included}%"))
    if property_type and property_type != "All":
        query = query.filter(models.PropertyListing.property_type == property_type)
    if bedrooms is not None:
        query = query.filter(models.PropertyListing.bedrooms >= bedrooms)
    if city and city != "All India":
        query = query.filter(models.PropertyListing.city.ilike(f"%{city}%"))

    listings = query.order_by(models.PropertyListing.created_at.desc()).all()

    user_profile = None
    if current_user:
        user_profile = db.query(models.LifestyleProfile).filter(models.LifestyleProfile.user_id == current_user.id).first()

    response = []
    for l in listings:
        owner = l.owner
        roommate_ids = []
        try:
            roommate_ids = json.loads(l.roommate_ids_json or "[]")
        except Exception:
            roommate_ids = []

        roommates = []
        compat_scores = []

        if roommate_ids:
            occupants = db.query(models.User).filter(models.User.id.in_(roommate_ids)).all()
            for occ in occupants:
                occ_score = None
                occ_prof = occ.profile
                if user_profile and occ_prof and occ.id != (current_user.id if current_user else None):
                    comp_res = calculate_compatibility(user_profile, occ_prof)
                    occ_score = comp_res["score"]
                    compat_scores.append(occ_score)

                roommates.append({
                    "id": occ.id,
                    "full_name": occ.full_name,
                    "role": occ.role,
                    "avatar": occ.avatar,
                    "college_or_company": occ.college_or_company,
                    "bio": occ.bio,
                    "compatibility_score": occ_score,
                    "sleep_schedule": occ_prof.sleep_schedule if occ_prof else None,
                    "cleanliness": occ_prof.cleanliness if occ_prof else None,
                    "dietary_preference": occ_prof.dietary_preference if occ_prof else None,
                })

        avg_compat = round(sum(compat_scores) / len(compat_scores), 1) if compat_scores else None

        response.append({
            "id": l.id,
            "owner_id": l.owner_id,
            "owner_name": owner.full_name if owner else "Unknown",
            "owner_email": owner.email if owner else "",
            "owner_verified": owner.is_verified if owner else False,
            "owner_avatar": owner.avatar if owner else None,
            "title": l.title,
            "description": l.description,
            "property_type": l.property_type,
            "category": l.category or "PG / Co-Living",
            "pg_gender": l.pg_gender or "Any",
            "sharing_type": l.sharing_type or "Single Occupancy",
            "food_included": l.food_included or "No Food",
            "curfew": l.curfew or "No Curfew (24/7 Access)",
            "housekeeping": l.housekeeping or "Daily Housekeeping",
            "notice_period": l.notice_period or "30 Days",
            "rent": l.rent,
            "deposit": l.deposit,
            "bedrooms": l.bedrooms,
            "bathrooms": l.bathrooms,
            "address": l.address,
            "city": l.city,
            "amenities": json.loads(l.amenities_json or "[]"),
            "images": json.loads(l.images_json or "[]"),
            "roommate_ids": roommate_ids,
            "roommates": roommates,
            "avg_roommate_compatibility": avg_compat,
            "available_from": l.available_from,
            "is_active": l.is_active,
            "created_at": l.created_at
        })
    return response


@app.post("/api/listings", response_model=schemas.ListingResponse)
def create_listing(
    data: schemas.ListingCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    listing = models.PropertyListing(
        owner_id=current_user.id,
        title=data.title,
        description=data.description,
        property_type=data.property_type,
        category=data.category,
        pg_gender=data.pg_gender,
        sharing_type=data.sharing_type,
        food_included=data.food_included,
        curfew=data.curfew,
        housekeeping=data.housekeeping,
        notice_period=data.notice_period,
        rent=data.rent,
        deposit=data.deposit,
        bedrooms=data.bedrooms,
        bathrooms=data.bathrooms,
        address=data.address,
        city=data.city,
        amenities_json=json.dumps(data.amenities),
        images_json=json.dumps(data.images),
        roommate_ids_json=json.dumps(data.roommate_ids),
        available_from=data.available_from,
        is_active=True
    )
    db.add(listing)
    db.commit()
    db.refresh(listing)

    return {
        "id": listing.id,
        "owner_id": listing.owner_id,
        "owner_name": current_user.full_name,
        "owner_email": current_user.email,
        "owner_verified": current_user.is_verified,
        "owner_avatar": current_user.avatar,
        "title": listing.title,
        "description": listing.description,
        "property_type": listing.property_type,
        "category": listing.category,
        "pg_gender": listing.pg_gender,
        "sharing_type": listing.sharing_type,
        "food_included": listing.food_included,
        "curfew": listing.curfew,
        "housekeeping": listing.housekeeping,
        "notice_period": listing.notice_period,
        "rent": listing.rent,
        "deposit": listing.deposit,
        "bedrooms": listing.bedrooms,
        "bathrooms": listing.bathrooms,
        "address": listing.address,
        "city": listing.city,
        "amenities": data.amenities,
        "images": data.images,
        "roommate_ids": data.roommate_ids,
        "roommates": [],
        "avg_roommate_compatibility": None,
        "available_from": listing.available_from,
        "is_active": listing.is_active,
        "created_at": listing.created_at
    }


@app.get("/api/listings/{listing_id}/roommates")
def get_listing_roommates_compatibility(
    listing_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    listing = db.query(models.PropertyListing).filter(models.PropertyListing.id == listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")

    roommate_ids = []
    try:
        roommate_ids = json.loads(listing.roommate_ids_json or "[]")
    except Exception:
        roommate_ids = []

    u_prof = db.query(models.LifestyleProfile).filter(models.LifestyleProfile.user_id == current_user.id).first()
    results = []
    if roommate_ids:
        occupants = db.query(models.User).filter(models.User.id.in_(roommate_ids)).all()
        for occ in occupants:
            occ_prof = occ.profile
            compat = None
            if u_prof and occ_prof:
                compat = calculate_compatibility(u_prof, occ_prof)
            cand_profile_resp = schemas.ProfileResponse.from_orm(occ_prof) if occ_prof else None
            results.append({
                "user": schemas.UserResponse.from_orm(occ),
                "profile": cand_profile_resp,
                "compatibility": compat
            })
    return results


# ==========================================
# 5. Match Requests (Connect with Roommate)
# ==========================================

@app.post("/api/match/requests", response_model=schemas.MatchRequestResponse)
def send_match_request(
    data: schemas.MatchRequestCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if data.receiver_id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot send match request to yourself")

    receiver = db.query(models.User).filter(models.User.id == data.receiver_id).first()
    if not receiver:
        raise HTTPException(status_code=404, detail="Receiver user not found")

    # Compute compatibility score to store with request
    u_prof = db.query(models.LifestyleProfile).filter(models.LifestyleProfile.user_id == current_user.id).first()
    r_prof = db.query(models.LifestyleProfile).filter(models.LifestyleProfile.user_id == data.receiver_id).first()
    score = 0.0
    if u_prof and r_prof:
        score = calculate_compatibility(u_prof, r_prof)["score"]

    # Check for existing request
    existing = db.query(models.MatchRequest).filter(
        models.MatchRequest.sender_id == current_user.id,
        models.MatchRequest.receiver_id == data.receiver_id
    ).first()

    if existing:
        existing.message = data.message
        existing.status = "pending"
        existing.compatibility_score = score
        db.commit()
        db.refresh(existing)
        return existing

    req = models.MatchRequest(
        sender_id=current_user.id,
        receiver_id=data.receiver_id,
        message=data.message,
        compatibility_score=score,
        status="pending"
    )
    db.add(req)
    db.commit()
    db.refresh(req)
    return req


@app.get("/api/match/requests", response_model=List[schemas.MatchRequestResponse])
def get_my_match_requests(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    requests = db.query(models.MatchRequest).filter(
        (models.MatchRequest.sender_id == current_user.id) |
        (models.MatchRequest.receiver_id == current_user.id)
    ).order_by(models.MatchRequest.created_at.desc()).all()
    return requests


@app.put("/api/match/requests/{request_id}", response_model=schemas.MatchRequestResponse)
def update_match_request_status(
    request_id: int,
    data: schemas.MatchRequestUpdate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    req = db.query(models.MatchRequest).filter(models.MatchRequest.id == request_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Request not found")
    if req.receiver_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only the recipient can accept/reject this request")

    req.status = data.status
    db.commit()
    db.refresh(req)
    return req


# ==========================================
# 6. Smart Co-Living Utilities
# ==========================================

@app.post("/api/tools/fair-rent-split", response_model=schemas.FairRentResponse)
def compute_fair_rent(data: schemas.FairRentRequest):
    room_dicts = [r.dict() for r in data.rooms]
    res = calculate_fair_rent_split(data.total_rent, room_dicts)
    return res


@app.post("/api/tools/agreements", response_model=schemas.AgreementResponse)
def create_agreement(
    data: schemas.AgreementCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    u2 = db.query(models.User).filter(models.User.id == data.user2_id).first()
    if not u2:
        raise HTTPException(status_code=404, detail="Roommate user not found")

    agreement = models.RoommateAgreement(
        user1_id=current_user.id,
        user2_id=data.user2_id,
        property_address=data.property_address,
        total_rent=data.total_rent,
        user1_share=data.user1_share,
        user2_share=data.user2_share,
        quiet_hours=data.quiet_hours,
        guest_policy=data.guest_policy,
        chore_schedule=data.chore_schedule,
        special_terms=data.special_terms,
        status="signed"
    )
    db.add(agreement)
    db.commit()
    db.refresh(agreement)

    return {
        "id": agreement.id,
        "user1": schemas.UserResponse.from_orm(current_user),
        "user2": schemas.UserResponse.from_orm(u2),
        "property_address": agreement.property_address,
        "total_rent": agreement.total_rent,
        "user1_share": agreement.user1_share,
        "user2_share": agreement.user2_share,
        "quiet_hours": agreement.quiet_hours,
        "guest_policy": agreement.guest_policy,
        "chore_schedule": agreement.chore_schedule,
        "special_terms": agreement.special_terms,
        "status": agreement.status,
        "created_at": agreement.created_at
    }


@app.get("/api/tools/agreements", response_model=List[schemas.AgreementResponse])
def get_my_agreements(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    agreements = db.query(models.RoommateAgreement).filter(
        (models.RoommateAgreement.user1_id == current_user.id) |
        (models.RoommateAgreement.user2_id == current_user.id)
    ).order_by(models.RoommateAgreement.created_at.desc()).all()

    result = []
    for a in agreements:
        u1 = db.query(models.User).filter(models.User.id == a.user1_id).first()
        u2 = db.query(models.User).filter(models.User.id == a.user2_id).first()
        result.append({
            "id": a.id,
            "user1": schemas.UserResponse.from_orm(u1),
            "user2": schemas.UserResponse.from_orm(u2),
            "property_address": a.property_address,
            "total_rent": a.total_rent,
            "user1_share": a.user1_share,
            "user2_share": a.user2_share,
            "quiet_hours": a.quiet_hours,
            "guest_policy": a.guest_policy,
            "chore_schedule": a.chore_schedule,
            "special_terms": a.special_terms,
            "status": a.status,
            "created_at": a.created_at
        })
    return result
