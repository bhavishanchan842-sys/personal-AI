# 🏡 NestMate India — Rooms, PGs & Roommate Compatibility Platform

> **The Smart Accommodation & Roommate Matchmaking Platform for Indian Tech & Student Hubs**  
> *Search Verified PGs, Hostels & Private Rooms — With Algorithmic Roommate Compatibility Scoring*

---

## 🌟 Executive Summary & Features

In metropolitan hubs like **Bengaluru, Delhi NCR / Gurgaon, Mumbai, Pune, and Hyderabad**, finding a room or PG (Paying Guest) and compatible roommates is one of the most critical challenges for students and working professionals:
- **PG & Room Discovery**: Search Boys PGs, Girls PGs, and Co-ed Hostels with filters for single, double, and triple sharing.
- **Meal Inclusions**: Filter by 3 meals included (breakfast, lunch, dinner), 2 meals, or self-cooking.
- **Roommate Compatibility on Listings**: View current occupants living in a room or PG, and inspect real-time compatibility scores before scheduling a visit or booking.
- **6-Axis Lifestyle Vector Compatibility**: Quantitative Euclidean distance matching comparing sleep schedules (early bird vs night owl), cleanliness, social/guest battery, noise tolerance, WFH routines, and dietary preferences (Pure Veg vs Non-Veg).
- **Interactive Radar Comparison**: Side-by-side radar charts with green flags (strengths) and yellow flags (discussion points).
- **Free Visit Scheduling**: 1-click scheduling of property tours with zero brokerage.
- **Fair Rent Splitter & Co-Living Agreement**: Mathematical room splits based on square footage, attached washroom, and balcony, plus digital 11-month agreement generation.

---

## 📐 System Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                        NestMate Web Application                        │
│              React 18 • Vite • Tailwind CSS • Recharts                 │
├──────────────────┬────────────────────────────┬────────────────────────┤
│ 🏢 Search PGs &  │ 🤝 Roommate Compatibility  │ ⚖️ Smart Utilities     │
│    Rooms         │ • 6-Axis Radar Comparison  │ • Fair Rent Splitter   │
│ • Boys/Girls PGs │ • Live Match % on Listings │ • Digital Agreement PDF│
│ • Meal Plans     │ • Dealbreaker Filters      │ • Free Visit Scheduler │
└──────────────────┴─────────────┬──────────────┴────────────────────────┘
                                 │ REST API (JSON)
                                 ▼
┌────────────────────────────────────────────────────────────────────────┐
│                       FastAPI Backend Engine                           │
├────────────────────────────────────────────────────────────────────────┤
│  /api/auth       • JWT token authentication & demo persona switcher    │
│  /api/profile    • Vectorized 1-5 ratings + custom priority weights    │
│  /api/match      • Two-tier hard constraint filter + weighted distance │
│  /api/listings   • Property CRUD & multi-attribute filter query        │
│  /api/tools      • Mathematical rent split & co-living agreement state │
└────────────────────────────────┬───────────────────────────────────────┘
                                 │ SQLAlchemy ORM
                                 ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        SQLite Database (nestmatch.db)                  │
│   Users • LifestyleProfiles • PropertyListings • MatchRequests • Agree │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 🧠 The Compatibility Algorithm

The matching system implements a **two-tier algorithmic model**:

### Tier 1: Hard Constraints Filter ($H(u, v)$)
Binary dealbreakers must be satisfied before computing lifestyle similarity:
1. **Budget Overlap**: $\max(u_{\min}, v_{\min}) \le \min(u_{\max}, v_{\max})$
2. **Gender Preference**: Bidirectional compatibility with self-identified gender.
3. **Smoking Policy**: Strict non-smokers are never paired with smokers.
4. **Pet Policies**: Pet owners are filtered against non-pet-friendly candidates.

$$\text{If } H(u, v) = 0 \implies \text{Final Compatibility Score} = 0\%$$

### Tier 2: Weighted Normalized Euclidean Similarity
For all 6 normalized lifestyle dimensions $i \in \{1, \dots, 6\}$ on a $[1, 5]$ scale:
1. Cleanliness & Chores
2. Sleep & Wake Rhythm
3. Social Battery & Guest Frequency
4. Noise Tolerance & Ambient Audio
5. Work/Study Routine (Office vs. WFH)
6. Kitchen & Meal Sharing

Users assign personalized importance weights $w_i \in \{1.0, 2.0, 3.0\}$ (Low, Normal, High):

$$\text{Distance}(u, v) = \sqrt{\sum_{i=1}^{n} w_i \cdot (u_i - v_i)^2}$$

$$\text{Max Distance} = \sqrt{\sum_{i=1}^{n} w_i \cdot (5 - 1)^2}$$

$$\text{Compatibility Score}(u, v) = \max\left(0, \left(1 - \frac{\text{Distance}(u, v)}{\text{Max Distance}}\right) \times 100\right)$$

### Tier 3: Explainable AI (XAI) Breakdown
- **Green Flags**: Automated detection of high-priority alignments (e.g., *"Both thrive on quiet night routines"*).
- **Yellow Flags**: Explicit alerts on differing habits to discuss before signing a lease.

---

## ⚖️ Fair Rent Splitter Mathematics

When splitting a shared apartment (e.g. 2BHK for \$2,000/mo), dividing rent 50/50 is unfair if one room is 240 sqft with an attached private bath and balcony while the other is 160 sqft.

NestMatch uses **Weighted Proportional Multi-Attribute Valuation**:
- **Base Area Factor ($A_k$)**: $\frac{\text{sqft}_k}{\sum \text{sqft}}$ (60% weight)
- **Amenity Multipliers**:
  - Attached Private Bathroom: $+25\%$
  - Private Balcony: $+12\%$
  - Reserved Parking: $+8\%$

$$\text{Effective Score}_k = \left(\frac{\text{sqft}_k}{\text{Total Area}}\right) \times \left(1 + 0.25 \cdot \text{Bath}_k + 0.12 \cdot \text{Balcony}_k + 0.08 \cdot \text{Parking}_k\right)$$

$$\text{Fair Share}_k = \text{Total Rent} \times \frac{\text{Effective Score}_k}{\sum \text{Effective Score}}$$

---

## 🚀 Quick Start & Demo Setup

### Prerequisites
- Python 3.10+
- Node.js 18+ and npm

### 1-Click Launch (Recommended)
```bash
# In the nestmatch directory:
python run.py
```
*Or simply double-click `run.bat` on Windows.*

Both the FastAPI backend (`http://127.0.0.1:8000`) and the Vite React frontend (`http://localhost:5173`) will launch concurrently and open automatically in your browser!

### Manual Split Terminal Launch

#### 1. Backend:
```bash
cd backend
python -m pip install -r requirements.txt
python seed_data.py
python -m uvicorn main:app --reload --port 8000
```

#### 2. Frontend:
```bash
cd frontend
npm install
npm run dev
```

---

## 🧪 Testing

Automated unit and integration tests verify the algorithm, dealbreakers, and API endpoints:
```bash
cd backend
python -m pytest test_backend.py
```
*Result: 6 tests covering hard constraints, Euclidean distance, fair rent math, and FastAPI endpoints.*

---

## 🎭 Pre-Configured Demo Personas
NestMatch includes an instant **Persona Switcher** in the top navigation bar for seamless live evaluations:
- **Alex Chen**: CS Senior, Night Owl (Level 5), Clean (Level 4), Quiet Sanctuary.
- **Maya Patel**: Biotech Researcher, Early Bird (Level 1), Pristine Clean (Level 5), Strictly Non-Smoking.
- **Liam Miller**: UX Designer with a Golden Retriever, Social Friday Nights, Tenant offering a room.
- **Elena Rostova**: DevOps Engineer, WFH Full-time, looking for quiet roommates.

---

## 📜 Viva & Presentation Highlights
When presenting to professors or project evaluators, emphasize:
1. **Algorithmic Rigor**: Beyond simple keyword search; quantitative weighted Euclidean distance with user-defined priorities.
2. **Explainable Recommendations**: Transparent green flags and yellow flags rather than a black-box percentage.
3. **End-to-End Co-Living Lifecycle**: Property Discovery $\rightarrow$ Roommate Matching $\rightarrow$ Fair Rent Calculation $\rightarrow$ Digital Agreement Signing.
