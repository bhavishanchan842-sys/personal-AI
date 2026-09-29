import json
from database import SessionLocal, engine, Base
import models
from auth import hash_password

def seed_database():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    default_hashed = hash_password("password123")

    users_data = [
        # --- BENGALURU ---
        {
            "email": "aravind.sharma@swiggy.in",
            "full_name": "Aravind Sharma",
            "role": "seeker",
            "college_or_company": "Swiggy India (SDE-2)",
            "avatar": "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
            "is_verified": True,
            "bio": "Software Engineer at Swiggy. Late night coder, quiet on weekdays, love brewing South Indian filter coffee. Looking for a clean 2BHK/3BHK in HSR or Koramangala.",
            "phone": "+91 98765 43210",
            "profile": {
                "sleep_schedule": 5, "cleanliness": 4, "social_battery": 2, "work_routine": 4,
                "noise_tolerance": 2, "kitchen_sharing": 3, "smoking": False, "drinking": True,
                "has_pets": False, "pet_friendly": True, "dietary_preference": "Eggetarian",
                "budget_min": 12000, "budget_max": 22000, "user_gender": "Male", "gender_preference": "Male",
                "preferred_city": "Bengaluru", "move_in_date": "1st of next month",
                "weights": {"cleanliness": 3.0, "sleep_schedule": 3.0, "noise_tolerance": 2.5, "social_battery": 2.0, "work_routine": 1.5, "kitchen_sharing": 1.0}
            }
        },
        {
            "email": "ananya.iyer@iisc.ac.in",
            "full_name": "Ananya Iyer",
            "role": "seeker",
            "college_or_company": "IISc Bangalore (PhD Scholar)",
            "avatar": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
            "is_verified": True,
            "bio": "Computational biology researcher. Strict Pure Vegetarian kitchen, early morning yoga, pristine clean living space. Seeking female flatmate in a peaceful society.",
            "phone": "+91 98123 45678",
            "profile": {
                "sleep_schedule": 1, "cleanliness": 5, "social_battery": 2, "work_routine": 2,
                "noise_tolerance": 1, "kitchen_sharing": 4, "smoking": False, "drinking": False,
                "has_pets": False, "pet_friendly": False, "dietary_preference": "Pure Vegetarian",
                "budget_min": 10000, "budget_max": 18000, "user_gender": "Female", "gender_preference": "Female",
                "preferred_city": "Bengaluru", "move_in_date": "Immediate",
                "weights": {"cleanliness": 3.0, "sleep_schedule": 2.5, "noise_tolerance": 3.0, "social_battery": 2.0, "work_routine": 1.5, "kitchen_sharing": 2.5}
            }
        },
        {
            "email": "rohan.verma@cred.club",
            "full_name": "Rohan Verma",
            "role": "tenant",
            "college_or_company": "CRED (Product Designer)",
            "avatar": "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80",
            "is_verified": True,
            "bio": "Product designer with a friendly Golden Retriever puppy. Chilled out, enjoy board games on weekends, open-minded. Have 1 master room vacant in Indiranagar 3BHK.",
            "phone": "+91 97234 56789",
            "profile": {
                "sleep_schedule": 4, "cleanliness": 4, "social_battery": 4, "work_routine": 3,
                "noise_tolerance": 3, "kitchen_sharing": 4, "smoking": False, "drinking": True,
                "has_pets": True, "pet_friendly": True, "dietary_preference": "Non-Vegetarian",
                "budget_min": 14000, "budget_max": 26000, "user_gender": "Male", "gender_preference": "Any",
                "preferred_city": "Bengaluru", "move_in_date": "Immediate",
                "weights": {"social_battery": 3.0, "cleanliness": 2.0, "sleep_schedule": 2.0, "noise_tolerance": 2.0, "work_routine": 1.0, "kitchen_sharing": 2.0}
            }
        },

        # --- DELHI NCR / GURGAON ---
        {
            "email": "simran.kaur@zomato.com",
            "full_name": "Simran Kaur",
            "role": "seeker",
            "college_or_company": "Zomato HQ (Brand Lead)",
            "avatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
            "is_verified": True,
            "bio": "Brand Marketing lead at Cyber Hub. Looking for a flatmate for DLF Phase 5 / Golf Course Road 3BHK. Respectful of personal boundaries, social on weekends.",
            "phone": "+91 98100 23456",
            "profile": {
                "sleep_schedule": 3, "cleanliness": 4, "social_battery": 4, "work_routine": 3,
                "noise_tolerance": 3, "kitchen_sharing": 3, "smoking": False, "drinking": True,
                "has_pets": False, "pet_friendly": True, "dietary_preference": "Non-Vegetarian",
                "budget_min": 18000, "budget_max": 30000, "user_gender": "Female", "gender_preference": "Female",
                "preferred_city": "Delhi NCR", "move_in_date": "1st of next month",
                "weights": {"cleanliness": 2.5, "social_battery": 2.5, "noise_tolerance": 2.0, "sleep_schedule": 2.0, "work_routine": 1.5, "kitchen_sharing": 1.5}
            }
        },

        # --- MUMBAI (POWAI / BANDRA) ---
        {
            "email": "tanmay.joshi@hdfcsec.com",
            "full_name": "Tanmay Joshi",
            "role": "seeker",
            "college_or_company": "HDFC Securities (Equity Analyst)",
            "avatar": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
            "is_verified": True,
            "bio": "Equity Analyst in BKC. Early morning market watcher, quiet, organized, Pure Vegetarian. Looking for flatmate in Powai / Ghatkopar.",
            "phone": "+91 98200 87654",
            "profile": {
                "sleep_schedule": 2, "cleanliness": 5, "social_battery": 2, "work_routine": 2,
                "noise_tolerance": 1, "kitchen_sharing": 4, "smoking": False, "drinking": False,
                "has_pets": False, "pet_friendly": False, "dietary_preference": "Pure Vegetarian",
                "budget_min": 15000, "budget_max": 28000, "user_gender": "Male", "gender_preference": "Male",
                "preferred_city": "Mumbai", "move_in_date": "Immediate",
                "weights": {"cleanliness": 3.0, "noise_tolerance": 3.0, "sleep_schedule": 2.5, "social_battery": 2.0, "work_routine": 1.5, "kitchen_sharing": 2.0}
            }
        },

        # --- HYDERABAD (HITEC CITY) ---
        {
            "email": "karthik.reddy@microsoft.com",
            "full_name": "Karthik Reddy",
            "role": "seeker",
            "college_or_company": "Microsoft Hyderabad",
            "avatar": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
            "is_verified": True,
            "bio": "Cloud Architect at Microsoft. Looking for flatmates in Gachibowli or HITEC City. Badminton enthusiast, regular workout routine.",
            "phone": "+91 98450 12345",
            "profile": {
                "sleep_schedule": 3, "cleanliness": 4, "social_battery": 3, "work_routine": 3,
                "noise_tolerance": 3, "kitchen_sharing": 3, "smoking": False, "drinking": True,
                "has_pets": False, "pet_friendly": True, "dietary_preference": "Non-Vegetarian",
                "budget_min": 11000, "budget_max": 20000, "user_gender": "Male", "gender_preference": "Male",
                "preferred_city": "Hyderabad", "move_in_date": "Immediate",
                "weights": {"cleanliness": 2.5, "noise_tolerance": 2.0, "sleep_schedule": 2.0, "social_battery": 2.0, "work_routine": 1.5, "kitchen_sharing": 1.5}
            }
        },

        # --- PUNE (HINJEWADI / BANER) ---
        {
            "email": "divya.kulkarni@tcs.com",
            "full_name": "Divya Kulkarni",
            "role": "seeker",
            "college_or_company": "TCS Hinjewadi (Pune)",
            "avatar": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
            "is_verified": True,
            "bio": "Systems Engineer at Hinjewadi Phase 1. Seeking a Pure Vegetarian female flatmate in Wakad or Baner. Calm environment and shared maid/cook expenses.",
            "phone": "+91 96543 21098",
            "profile": {
                "sleep_schedule": 2, "cleanliness": 5, "social_battery": 2, "work_routine": 2,
                "noise_tolerance": 2, "kitchen_sharing": 4, "smoking": False, "drinking": False,
                "has_pets": False, "pet_friendly": False, "dietary_preference": "Pure Vegetarian",
                "budget_min": 8000, "budget_max": 15000, "user_gender": "Female", "gender_preference": "Female",
                "preferred_city": "Pune", "move_in_date": "Immediate",
                "weights": {"cleanliness": 3.0, "sleep_schedule": 2.5, "noise_tolerance": 2.5, "social_battery": 2.0, "work_routine": 1.0, "kitchen_sharing": 2.0}
            }
        },

        # --- KOLKATA (SALT LAKE) ---
        {
            "email": "aditya.sen@wipro.com",
            "full_name": "Aditya Sen",
            "role": "seeker",
            "college_or_company": "Wipro Kolkata (Sector V)",
            "avatar": "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80",
            "is_verified": True,
            "bio": "Full-stack developer working in Salt Lake Sector V. Love football, music, and home cooked Bengali meals. Looking for a room in Newtown or Salt Lake.",
            "phone": "+91 98301 98765",
            "profile": {
                "sleep_schedule": 4, "cleanliness": 4, "social_battery": 3, "work_routine": 3,
                "noise_tolerance": 3, "kitchen_sharing": 4, "smoking": False, "drinking": True,
                "has_pets": False, "pet_friendly": True, "dietary_preference": "Non-Vegetarian",
                "budget_min": 7000, "budget_max": 14000, "user_gender": "Male", "gender_preference": "Male",
                "preferred_city": "Kolkata", "move_in_date": "1st of next month",
                "weights": {"cleanliness": 2.5, "sleep_schedule": 2.0, "noise_tolerance": 2.0, "social_battery": 2.0, "work_routine": 1.5, "kitchen_sharing": 2.0}
            }
        },

        # --- KOCHI / KERALA (INFOPARK) ---
        {
            "email": "meera.nambiar@tcs.com",
            "full_name": "Meera Nambiar",
            "role": "seeker",
            "college_or_company": "InfoPark Kochi",
            "avatar": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
            "is_verified": True,
            "bio": "Cloud developer in Kakkanad InfoPark. Quiet, non-smoker, looking for female flatmate in SmartCity / Kakkanad residential apartments.",
            "phone": "+91 94470 12345",
            "profile": {
                "sleep_schedule": 2, "cleanliness": 4, "social_battery": 2, "work_routine": 3,
                "noise_tolerance": 2, "kitchen_sharing": 3, "smoking": False, "drinking": False,
                "has_pets": False, "pet_friendly": True, "dietary_preference": "Non-Vegetarian",
                "budget_min": 6000, "budget_max": 13000, "user_gender": "Female", "gender_preference": "Female",
                "preferred_city": "Kochi", "move_in_date": "Immediate",
                "weights": {"cleanliness": 3.0, "noise_tolerance": 2.5, "sleep_schedule": 2.0, "social_battery": 2.0, "work_routine": 1.0, "kitchen_sharing": 1.5}
            }
        },

        # --- PAN-INDIA VERIFIED LANDLORD ---
        {
            "email": "rajesh.gupta@dlfproperties.in",
            "full_name": "Rajesh Gupta",
            "role": "landlord",
            "college_or_company": "Gupta Estates Pan-India",
            "avatar": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
            "is_verified": True,
            "bio": "Pan-India rental property manager offering verified, bachelor-friendly gated flats in Bengaluru, Mumbai, Gurgaon, Pune, and Hyderabad.",
            "phone": "+91 98111 22334",
            "profile": {
                "sleep_schedule": 3, "cleanliness": 4, "social_battery": 3, "work_routine": 2,
                "noise_tolerance": 3, "kitchen_sharing": 3, "smoking": False, "drinking": False,
                "has_pets": False, "pet_friendly": True, "dietary_preference": "Flexible",
                "budget_min": 15000, "budget_max": 50000, "user_gender": "Male", "gender_preference": "Any",
                "preferred_city": "All India", "move_in_date": "Immediate",
                "weights": {"cleanliness": 2.0, "sleep_schedule": 2.0, "noise_tolerance": 2.0, "social_battery": 2.0, "work_routine": 1.0, "kitchen_sharing": 1.0}
            }
        }
    ]

    created_users = {}

    for u_info in users_data:
        prof_data = u_info.pop("profile")
        user = models.User(
            email=u_info["email"],
            hashed_password=default_hashed,
            full_name=u_info["full_name"],
            role=u_info["role"],
            college_or_company=u_info["college_or_company"],
            avatar=u_info["avatar"],
            is_verified=u_info["is_verified"],
            bio=u_info["bio"],
            phone=u_info["phone"]
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        created_users[user.email] = user

        profile = models.LifestyleProfile(
            user_id=user.id,
            sleep_schedule=prof_data["sleep_schedule"],
            cleanliness=prof_data["cleanliness"],
            social_battery=prof_data["social_battery"],
            work_routine=prof_data["work_routine"],
            noise_tolerance=prof_data["noise_tolerance"],
            kitchen_sharing=prof_data["kitchen_sharing"],
            smoking=prof_data["smoking"],
            drinking=prof_data["drinking"],
            has_pets=prof_data["has_pets"],
            pet_friendly=prof_data["pet_friendly"],
            dietary_preference=prof_data["dietary_preference"],
            budget_min=prof_data["budget_min"],
            budget_max=prof_data["budget_max"],
            user_gender=prof_data["user_gender"],
            gender_preference=prof_data["gender_preference"],
            preferred_city=prof_data["preferred_city"],
            move_in_date=prof_data["move_in_date"],
            weights_json=json.dumps(prof_data.get("weights", {}))
        )
        db.add(profile)
        db.commit()

    # Seed Pan-India Property Listings
    # Seed Pan-India Property Listings (PGs, Co-Living & Private Rooms)
    landlord_user = created_users["rajesh.gupta@dlfproperties.in"]
    rohan_user = created_users["rohan.verma@cred.club"]
    aravind_user = created_users["aravind.sharma@swiggy.in"]
    ananya_user = created_users["ananya.iyer@iisc.ac.in"]
    simran_user = created_users["simran.kaur@zomato.com"]
    tanmay_user = created_users["tanmay.joshi@hdfcsec.com"]

    listings_data = [
        # --- BENGALURU ---
        {
            "owner_id": landlord_user.id,
            "title": "NestMate Hub — Koramangala 4th Block Luxury Boys PG",
            "description": "Premium tech-friendly Boys PG located 200m from Sony World Signal. Includes 3 hot home-cooked meals daily, 200 Mbps optical WiFi, attached washroom, daily housekeeping, biometric security, and dedicated PlayStation lounge.",
            "property_type": "PG / Co-Living",
            "category": "PG / Co-Living",
            "pg_gender": "Boys PG",
            "sharing_type": "Double Sharing",
            "food_included": "3 Meals (Breakfast, Lunch, Dinner)",
            "curfew": "No Curfew (24/7 Access)",
            "housekeeping": "Daily Housekeeping",
            "notice_period": "15 Days",
            "rent": 12500.0,
            "deposit": 12500.0,
            "bedrooms": 1,
            "bathrooms": 1,
            "address": "80 Feet Road, 4th Block, Koramangala",
            "city": "Bengaluru",
            "amenities": ["3 Homestyle Meals", "High-Speed WiFi (200 Mbps)", "Attached Washroom", "Daily Housekeeping", "Washing Machine", "No Curfew / Biometric Entry", "RO Water Purifier", "Geyser", "100% DG Power Backup"],
            "images": [
                "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&auto=format&fit=crop&q=80",
                "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&auto=format&fit=crop&q=80"
            ],
            "roommate_ids": [aravind_user.id],
            "available_from": "Immediate"
        },
        {
            "owner_id": landlord_user.id,
            "title": "NestMate Blossom — HSR Layout Sector 1 Premium Girls PG",
            "description": "Safe, serene and modern Girls PG near Agara Lake. Features nutritious Pure Veg / Eggetarian meal service, daily sanitization, 24/7 female warden, biometric gate, AC rooms, and high-speed Wi-Fi.",
            "property_type": "PG / Co-Living",
            "category": "PG / Co-Living",
            "pg_gender": "Girls PG",
            "sharing_type": "Single Occupancy",
            "food_included": "3 Meals (Breakfast, Lunch, Dinner)",
            "curfew": "11:00 PM",
            "housekeeping": "Daily Housekeeping",
            "notice_period": "30 Days",
            "rent": 16500.0,
            "deposit": 20000.0,
            "bedrooms": 1,
            "bathrooms": 1,
            "address": "14th Main, HSR Layout Sector 1",
            "city": "Bengaluru",
            "amenities": ["3 Hygienic Meals", "Pure Veg Counter", "Attached Washroom & Balcony", "AC in Room", "High-Speed WiFi", "Daily Housekeeping", "24/7 Female Security & CCTV", "Automatic Washing Machines"],
            "images": [
                "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=800&auto=format&fit=crop&q=80",
                "https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=800&auto=format&fit=crop&q=80"
            ],
            "roommate_ids": [ananya_user.id],
            "available_from": "Immediate"
        },
        {
            "owner_id": rohan_user.id,
            "title": "Sunlit Master Bedroom with Attached Balcony in HSR Sector 2",
            "description": "1 Master bedroom available in a modern semi-furnished 3BHK gated apartment. Includes attached washroom, private balcony, 100% DG power backup, ACT Fibernet, and shared modular kitchen. Cook & maid already active.",
            "property_type": "Private Room",
            "category": "Private Room",
            "pg_gender": "Any",
            "sharing_type": "Private Room",
            "food_included": "Self-Cooking / Kitchen",
            "curfew": "No Curfew (24/7 Access)",
            "housekeeping": "Alternate Days",
            "notice_period": "30 Days",
            "rent": 16500.0,
            "deposit": 40000.0,
            "bedrooms": 3,
            "bathrooms": 3,
            "address": "24th Main, HSR Layout Sector 2",
            "city": "Bengaluru",
            "amenities": ["100% Power Backup (DG)", "Attached Washroom", "Private Balcony", "Cook & Maid Sharing", "RO Water Purifier", "Geyser", "Gated Security", "Covered Two-Wheeler Parking"],
            "images": [
                "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&auto=format&fit=crop&q=80"
            ],
            "roommate_ids": [rohan_user.id],
            "available_from": "1st of next month"
        },

        # --- DELHI NCR / GURGAON ---
        {
            "owner_id": landlord_user.id,
            "title": "NestMate Cyber Suites — DLF Phase 3 Executive Co-Ed PG",
            "description": "Modern corporate co-living accommodation 5 mins from DLF Cyber City & Rapid Metro. Fully furnished private studio rooms with attached bath, high-speed Wi-Fi, chef-prepared breakfast and dinner, rooftop terrace café, and zero curfew.",
            "property_type": "PG / Co-Living",
            "category": "PG / Co-Living",
            "pg_gender": "Co-ed PG",
            "sharing_type": "Single Occupancy",
            "food_included": "2 Meals (Breakfast + Dinner)",
            "curfew": "No Curfew (24/7 Access)",
            "housekeeping": "Daily Housekeeping",
            "notice_period": "30 Days",
            "rent": 18500.0,
            "deposit": 18500.0,
            "bedrooms": 1,
            "bathrooms": 1,
            "address": "U-Block, DLF Phase 3, Near Cyber City",
            "city": "Delhi NCR",
            "amenities": ["2 Meals (Breakfast + Dinner)", "Rooftop Cafe & Gym", "High-Speed WiFi", "Central AC", "Attached Washroom", "Laundry Service", "100% DG Backup", "24/7 Security"],
            "images": [
                "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&auto=format&fit=crop&q=80",
                "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&auto=format&fit=crop&q=80"
            ],
            "roommate_ids": [simran_user.id],
            "available_from": "Immediate"
        },
        {
            "owner_id": landlord_user.id,
            "title": "Luxury 3BHK Gated Apartment on Golf Course Road",
            "description": "Premium 3BHK high-rise apartment near Rapid Metro Sector 54. Fully furnished with modular kitchen, AC in all rooms, club house, tennis court, and 24/7 security. Ideal for young professionals in Cyber City.",
            "property_type": "Entire Apartment",
            "category": "Entire Flat",
            "pg_gender": "Any",
            "sharing_type": "Entire Flat",
            "food_included": "No Food",
            "curfew": "No Curfew (24/7 Access)",
            "housekeeping": "Self",
            "notice_period": "60 Days",
            "rent": 48000.0,
            "deposit": 96000.0,
            "bedrooms": 3,
            "bathrooms": 3,
            "address": "DLF Phase 5, Golf Course Road",
            "city": "Delhi NCR",
            "amenities": ["Near Rapid Metro", "Clubhouse & Gym", "Central AC", "100% Power Backup", "Covered Car Parking", "24/7 Security Guards"],
            "images": [
                "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&auto=format&fit=crop&q=80"
            ],
            "roommate_ids": [],
            "available_from": "Immediate"
        },

        # --- MUMBAI (POWAI / BANDRA) ---
        {
            "owner_id": landlord_user.id,
            "title": "NestMate LakeView — Powai Boys Co-Living PG",
            "description": "Well-appointed co-living home overlooking Powai Lake. Ideal for IIT Bombay scholars and BKC/Andheri professionals. Healthy morning breakfast included, high-speed broadband, refrigerator, geyser, and peaceful study atmosphere.",
            "property_type": "PG / Co-Living",
            "category": "PG / Co-Living",
            "pg_gender": "Boys PG",
            "sharing_type": "Double Sharing",
            "food_included": "Breakfast Only",
            "curfew": "No Curfew (24/7 Access)",
            "housekeeping": "Daily Housekeeping",
            "notice_period": "30 Days",
            "rent": 15000.0,
            "deposit": 25000.0,
            "bedrooms": 1,
            "bathrooms": 1,
            "address": "Central Avenue, Hiranandani Gardens, Powai",
            "city": "Mumbai",
            "amenities": ["Breakfast Included", "Lake View Balcony", "Air Conditioned", "RO Water Purifier", "Daily Housekeeping", "Washing Machine", "High-Speed WiFi"],
            "images": [
                "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&auto=format&fit=crop&q=80"
            ],
            "roommate_ids": [tanmay_user.id],
            "available_from": "Immediate"
        },
        {
            "owner_id": landlord_user.id,
            "title": "Modern 2BHK Lake View Apartment in Hiranandani",
            "description": "Stunning 2BHK flat overlooking Powai Lake. Walking distance to cafes, high-street shopping, and Hiranandani Business Park. Pure Veg friendly society with active security and piped gas.",
            "property_type": "Entire Apartment",
            "category": "Entire Flat",
            "pg_gender": "Any",
            "sharing_type": "Entire Flat",
            "food_included": "No Food",
            "curfew": "No Curfew (24/7 Access)",
            "housekeeping": "Self",
            "notice_period": "30 Days",
            "rent": 52000.0,
            "deposit": 150000.0,
            "bedrooms": 2,
            "bathrooms": 2,
            "address": "Hiranandani Gardens, Powai",
            "city": "Mumbai",
            "amenities": ["Lake View", "Piped Gas", "Gated Township", "24/7 Water Supply", "Gym & Pool Access", "High Speed Elevators"],
            "images": [
                "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&auto=format&fit=crop&q=80"
            ],
            "roommate_ids": [],
            "available_from": "1st of month"
        },

        # --- HYDERABAD (HITEC CITY / GACHIBOWLI) ---
        {
            "owner_id": landlord_user.id,
            "title": "NestMate CyberTowers — HITEC City Luxury Co-Ed PG",
            "description": "Tech-focused co-living space right behind Cyber Towers. Offers 3 hot North & South Indian meals daily, superfast 300 Mbps fiber internet, attached washrooms, and dedicated work desks in each room.",
            "property_type": "PG / Co-Living",
            "category": "PG / Co-Living",
            "pg_gender": "Co-ed PG",
            "sharing_type": "Double Sharing",
            "food_included": "3 Meals (Breakfast, Lunch, Dinner)",
            "curfew": "No Curfew (24/7 Access)",
            "housekeeping": "Daily Housekeeping",
            "notice_period": "15 Days",
            "rent": 11500.0,
            "deposit": 15000.0,
            "bedrooms": 1,
            "bathrooms": 1,
            "address": "Madhapur, Behind Cyber Towers",
            "city": "Hyderabad",
            "amenities": ["3 Homestyle Meals", "Attached Washroom", "High-Speed WiFi", "Ergonomic Work Desk", "Daily Housekeeping", "RO Purified Water", "Lift with Power Backup"],
            "images": [
                "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=800&auto=format&fit=crop&q=80"
            ],
            "roommate_ids": [aravind_user.id],
            "available_from": "Immediate"
        },
        {
            "owner_id": rohan_user.id,
            "title": "Private Bedroom in High-Rise near Gachibowli ORR",
            "description": "Single occupancy room available in a high-rise gated society in Financial District. Society features clubhouse, swimming pool, gym, grocery supermarket inside compound, and 100% DG backup.",
            "property_type": "Private Room",
            "category": "Private Room",
            "pg_gender": "Any",
            "sharing_type": "Private Room",
            "food_included": "Self-Cooking / Kitchen",
            "curfew": "No Curfew (24/7 Access)",
            "housekeeping": "Weekly",
            "notice_period": "30 Days",
            "rent": 14000.0,
            "deposit": 35000.0,
            "bedrooms": 3,
            "bathrooms": 3,
            "address": "Financial District, Nanakramguda",
            "city": "Hyderabad",
            "amenities": ["Clubhouse & Gym", "Swimming Pool", "Supermarket in Compound", "100% Power Backup", "Cook Sharing"],
            "images": [
                "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=800&auto=format&fit=crop&q=80"
            ],
            "roommate_ids": [rohan_user.id],
            "available_from": "Immediate"
        },

        # --- PUNE (HINJEWADI / WAKAD) ---
        {
            "owner_id": landlord_user.id,
            "title": "NestMate TechLife — Hinjawadi Phase 1 Budget Boys PG",
            "description": "Affordable Boys PG for software engineers in Hinjawadi IT Park. Includes 3 meals (breakfast, lunch, dinner), high-speed Wi-Fi, geyser, RO purifier, washing machine, and covered bike parking.",
            "property_type": "PG / Co-Living",
            "category": "PG / Co-Living",
            "pg_gender": "Boys PG",
            "sharing_type": "Triple Sharing",
            "food_included": "3 Meals (Breakfast, Lunch, Dinner)",
            "curfew": "No Curfew (24/7 Access)",
            "housekeeping": "Daily Housekeeping",
            "notice_period": "15 Days",
            "rent": 7800.0,
            "deposit": 10000.0,
            "bedrooms": 1,
            "bathrooms": 1,
            "address": "Hinjawadi Phase 1, Near Infosys Circle",
            "city": "Pune",
            "amenities": ["All 3 Meals Included", "High-Speed WiFi", "Attached Washroom", "RO Water Purifier", "Washing Machine", "Geyser", "Covered Bike Parking"],
            "images": [
                "https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=800&auto=format&fit=crop&q=80"
            ],
            "roommate_ids": [rohan_user.id],
            "available_from": "Immediate"
        }
    ]

    for l_data in listings_data:
        listing = models.PropertyListing(
            owner_id=l_data["owner_id"],
            title=l_data["title"],
            description=l_data["description"],
            property_type=l_data.get("property_type", "Private Room"),
            category=l_data.get("category", "PG / Co-Living"),
            pg_gender=l_data.get("pg_gender", "Any"),
            sharing_type=l_data.get("sharing_type", "Single Occupancy"),
            food_included=l_data.get("food_included", "No Food"),
            curfew=l_data.get("curfew", "No Curfew (24/7 Access)"),
            housekeeping=l_data.get("housekeeping", "Daily Housekeeping"),
            notice_period=l_data.get("notice_period", "30 Days"),
            rent=l_data["rent"],
            deposit=l_data["deposit"],
            bedrooms=l_data["bedrooms"],
            bathrooms=l_data["bathrooms"],
            address=l_data["address"],
            city=l_data["city"],
            amenities_json=json.dumps(l_data["amenities"]),
            images_json=json.dumps(l_data["images"]),
            roommate_ids_json=json.dumps(l_data.get("roommate_ids", [])),
            available_from=l_data["available_from"],
            is_active=True
        )
        db.add(listing)

    # Seed sample request
    aravind = created_users["aravind.sharma@swiggy.in"]
    rohan = created_users["rohan.verma@cred.club"]
    req = models.MatchRequest(
        sender_id=aravind.id,
        receiver_id=rohan.id,
        status="pending",
        message="Hey Rohan! Both of us work in tech, have similar sleep cycles, and prefer clean living spaces. I saw your master bedroom listing in Indiranagar and would love to connect!",
        compatibility_score=91.2
    )
    db.add(req)

    db.commit()
    db.close()
    print(f"Successfully seeded Pan-India database with {len(users_data)} users, {len(listings_data)} listings!")

if __name__ == "__main__":
    seed_database()
