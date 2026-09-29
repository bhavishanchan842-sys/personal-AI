from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(100), nullable=False)
    role = Column(String(50), default="seeker")  # seeker, tenant, landlord
    avatar = Column(String(255), nullable=True)
    college_or_company = Column(String(150), nullable=True)
    is_verified = Column(Boolean, default=False)
    bio = Column(Text, nullable=True)
    phone = Column(String(50), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    profile = relationship("LifestyleProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    listings = relationship("PropertyListing", back_populates="owner", cascade="all, delete-orphan")
    sent_requests = relationship("MatchRequest", foreign_keys="MatchRequest.sender_id", back_populates="sender")
    received_requests = relationship("MatchRequest", foreign_keys="MatchRequest.receiver_id", back_populates="receiver")


class LifestyleProfile(Base):
    __tablename__ = "lifestyle_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)

    # Lifestyle Dimension Vectors (Scale 1 to 5)
    sleep_schedule = Column(Integer, default=3)     # 1: Early Bird (5am-9pm) -> 5: Night Owl (2am-10am)
    cleanliness = Column(Integer, default=3)        # 1: Very Relaxed -> 5: Extremely Neat / Daily deep clean
    social_battery = Column(Integer, default=3)     # 1: Quiet Sanctuary -> 5: Frequent Parties & Guests
    work_routine = Column(Integer, default=3)       # 1: 100% Office/Campus -> 5: 100% WFH/Study in room
    noise_tolerance = Column(Integer, default=3)    # 1: Silent Library -> 5: Music/TV ambient noise
    kitchen_sharing = Column(Integer, default=3)    # 1: Strict Separate -> 5: Cook & Share together

    # Hard Constraints / Categorical Attributes
    smoking = Column(Boolean, default=False)
    drinking = Column(Boolean, default=False)
    has_pets = Column(Boolean, default=False)
    pet_friendly = Column(Boolean, default=True)
    dietary_preference = Column(String(50), default="Flexible") # Pure Vegetarian, Eggetarian, Non-Vegetarian, Flexible
    
    # Financial & Demographic Preferences (INR)
    budget_min = Column(Float, default=7000.0)
    budget_max = Column(Float, default=22000.0)
    user_gender = Column(String(20), default="Any")
    gender_preference = Column(String(20), default="Any") # Any, Male, Female
    preferred_city = Column(String(100), default="Bengaluru")
    move_in_date = Column(String(50), nullable=True)

    # Custom dimension importance weights JSON (e.g. {"cleanliness": 3, "sleep": 2, ...})
    weights_json = Column(Text, nullable=True)

    user = relationship("User", back_populates="profile")


class PropertyListing(Base):
    __tablename__ = "property_listings"

    id = Column(Integer, primary_key=True, index=True)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    property_type = Column(String(50), default="Private Room") # Private Room, Shared Room, Entire Apartment, Studio
    category = Column(String(50), default="PG / Co-Living") # PG / Co-Living, Private Room, Entire Flat, Studio
    pg_gender = Column(String(30), default="Any") # Boys PG, Girls PG, Co-ed PG, Any
    sharing_type = Column(String(50), default="Single Occupancy") # Single Occupancy, Double Sharing, Triple Sharing, 4+ Sharing, Private Room, Entire Flat
    food_included = Column(String(100), default="No Food") # 3 Meals (Breakfast, Lunch, Dinner), 2 Meals (Breakfast + Dinner), Breakfast Only, Self-Cooking / Kitchen, No Food
    curfew = Column(String(100), default="No Curfew (24/7 Access)")
    housekeeping = Column(String(100), default="Daily Housekeeping")
    notice_period = Column(String(50), default="30 Days")
    rent = Column(Float, nullable=False)
    deposit = Column(Float, default=0.0)
    bedrooms = Column(Integer, default=1)
    bathrooms = Column(Integer, default=1)
    address = Column(String(255), nullable=False)
    city = Column(String(100), nullable=False)
    amenities_json = Column(Text, default="[]")  # JSON list of amenities (WiFi, AC, Laundry, Parking, etc.)
    images_json = Column(Text, default="[]")     # JSON list of image URLs
    roommate_ids_json = Column(Text, default="[]") # JSON list of existing resident user IDs
    available_from = Column(String(50), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    owner = relationship("User", back_populates="listings")


class MatchRequest(Base):
    __tablename__ = "match_requests"

    id = Column(Integer, primary_key=True, index=True)
    sender_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    receiver_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    status = Column(String(30), default="pending")  # pending, accepted, rejected
    message = Column(Text, nullable=True)
    compatibility_score = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow)

    sender = relationship("User", foreign_keys=[sender_id], back_populates="sent_requests")
    receiver = relationship("User", foreign_keys=[receiver_id], back_populates="received_requests")


class RoommateAgreement(Base):
    __tablename__ = "roommate_agreements"

    id = Column(Integer, primary_key=True, index=True)
    user1_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    user2_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    property_address = Column(String(255), nullable=False)
    total_rent = Column(Float, nullable=False)
    user1_share = Column(Float, nullable=False)
    user2_share = Column(Float, nullable=False)
    quiet_hours = Column(String(100), default="11:00 PM - 7:00 AM")
    guest_policy = Column(String(200), default="Overnight guests allowed with 24h prior notice")
    chore_schedule = Column(String(200), default="Alternating weekly kitchen and common area deep clean")
    special_terms = Column(Text, nullable=True)
    status = Column(String(30), default="draft") # draft, signed
    created_at = Column(DateTime, default=datetime.utcnow)
