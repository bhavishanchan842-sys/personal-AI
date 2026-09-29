from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

# ----------------- Auth & User Schemas -----------------

class UserRegister(BaseModel):
    email: str
    password: str = Field(..., min_length=4)
    full_name: str
    role: str = "seeker" # seeker, tenant, landlord
    college_or_company: Optional[str] = None
    bio: Optional[str] = None
    phone: Optional[str] = None
    avatar: Optional[str] = None

class UserLogin(BaseModel):
    email: str
    password: str

class UserResponse(BaseModel):
    id: int
    email: str
    full_name: str
    role: str
    avatar: Optional[str] = None
    college_or_company: Optional[str] = None
    is_verified: bool
    bio: Optional[str] = None
    phone: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


# ----------------- Lifestyle Profile Schemas -----------------

class ProfileUpdate(BaseModel):
    sleep_schedule: int = Field(3, ge=1, le=5)
    cleanliness: int = Field(3, ge=1, le=5)
    social_battery: int = Field(3, ge=1, le=5)
    work_routine: int = Field(3, ge=1, le=5)
    noise_tolerance: int = Field(3, ge=1, le=5)
    kitchen_sharing: int = Field(3, ge=1, le=5)

    smoking: bool = False
    drinking: bool = False
    has_pets: bool = False
    pet_friendly: bool = True
    dietary_preference: str = "Flexible" # Pure Vegetarian, Eggetarian, Non-Vegetarian, Flexible

    budget_min: float = 7000.0
    budget_max: float = 25000.0
    user_gender: str = "Any"
    gender_preference: str = "Any"
    preferred_city: str = "Bengaluru"
    move_in_date: Optional[str] = None
    weights: Optional[Dict[str, float]] = None

class ProfileResponse(BaseModel):
    id: int
    user_id: int
    sleep_schedule: int
    cleanliness: int
    social_battery: int
    work_routine: int
    noise_tolerance: int
    kitchen_sharing: int
    smoking: bool
    drinking: bool
    has_pets: bool
    pet_friendly: bool
    dietary_preference: str = "Flexible"
    budget_min: float
    budget_max: float
    user_gender: str
    gender_preference: str
    preferred_city: str
    move_in_date: Optional[str] = None
    weights: Optional[Dict[str, float]] = None

    model_config = {"from_attributes": True}


# ----------------- Match & Recommendation Schemas -----------------

class DimensionScoreDetail(BaseModel):
    label: str
    user_val: int
    candidate_val: int
    diff: int
    similarity: float

class MatchCandidate(BaseModel):
    user: UserResponse
    profile: ProfileResponse
    compatibility_score: float
    passed_hard_constraints: bool
    dealbreakers: List[str]
    green_flags: List[str]
    yellow_flags: List[str]
    dimension_scores: Dict[str, DimensionScoreDetail]


# ----------------- Property Listing Schemas -----------------

class OccupantProfileSummary(BaseModel):
    id: int
    full_name: str
    role: str
    avatar: Optional[str] = None
    college_or_company: Optional[str] = None
    bio: Optional[str] = None
    compatibility_score: Optional[float] = None
    sleep_schedule: Optional[int] = None
    cleanliness: Optional[int] = None
    dietary_preference: Optional[str] = None

class ListingCreate(BaseModel):
    title: str
    description: str
    property_type: str = "Private Room"
    category: str = "PG / Co-Living"
    pg_gender: str = "Any"
    sharing_type: str = "Single Occupancy"
    food_included: str = "No Food"
    curfew: str = "No Curfew (24/7 Access)"
    housekeeping: str = "Daily Housekeeping"
    notice_period: str = "30 Days"
    rent: float
    deposit: float = 0.0
    bedrooms: int = 1
    bathrooms: int = 1
    address: str
    city: str
    amenities: List[str] = []
    images: List[str] = []
    roommate_ids: List[int] = []
    available_from: Optional[str] = None

class ListingResponse(BaseModel):
    id: int
    owner_id: int
    owner_name: str
    owner_email: str
    owner_verified: bool
    owner_avatar: Optional[str] = None
    title: str
    description: str
    property_type: str
    category: str = "PG / Co-Living"
    pg_gender: str = "Any"
    sharing_type: str = "Single Occupancy"
    food_included: str = "No Food"
    curfew: str = "No Curfew (24/7 Access)"
    housekeeping: str = "Daily Housekeeping"
    notice_period: str = "30 Days"
    rent: float
    deposit: float
    bedrooms: int
    bathrooms: int
    address: str
    city: str
    amenities: List[str]
    images: List[str]
    roommate_ids: List[int] = []
    roommates: List[OccupantProfileSummary] = []
    avg_roommate_compatibility: Optional[float] = None
    available_from: Optional[str] = None
    is_active: bool
    created_at: datetime


# ----------------- Match Request Schemas -----------------

class MatchRequestCreate(BaseModel):
    receiver_id: int
    message: Optional[str] = "Hey! I saw our compatibility score and would love to chat about sharing a place."

class MatchRequestUpdate(BaseModel):
    status: str # accepted, rejected

class MatchRequestResponse(BaseModel):
    id: int
    sender_id: int
    receiver_id: int
    sender: UserResponse
    receiver: UserResponse
    status: str
    message: Optional[str] = None
    compatibility_score: float
    created_at: datetime


# ----------------- Fair Rent Split Schemas -----------------

class RoomSpec(BaseModel):
    name: str = "Master Bedroom"
    assigned_to: str = "Tenant 1"
    sqft: float = 200.0
    private_bath: bool = True
    balcony: bool = True
    parking: bool = False

class FairRentRequest(BaseModel):
    total_rent: float
    rooms: List[RoomSpec]

class RoomAllocation(BaseModel):
    room_name: str
    assigned_to: str
    sqft: float
    private_bath: bool
    balcony: bool
    parking: bool
    calculated_rent: float
    rent_percentage: float

class FairRentResponse(BaseModel):
    total_rent: float
    allocations: List[RoomAllocation]
    algorithm: str


# ----------------- Agreement Schemas -----------------

class AgreementCreate(BaseModel):
    user2_id: int
    property_address: str
    total_rent: float
    user1_share: float
    user2_share: float
    quiet_hours: str = "11:00 PM - 7:00 AM"
    guest_policy: str = "Overnight guests allowed with 24h prior notice"
    chore_schedule: str = "Alternating weekly kitchen and common area deep clean"
    special_terms: Optional[str] = None

class AgreementResponse(BaseModel):
    id: int
    user1: UserResponse
    user2: UserResponse
    property_address: str
    total_rent: float
    user1_share: float
    user2_share: float
    quiet_hours: str
    guest_policy: str
    chore_schedule: str
    special_terms: Optional[str] = None
    status: str
    created_at: datetime
