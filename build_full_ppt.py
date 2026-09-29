import os
import sys
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN
from pptx.enum.shapes import MSO_SHAPE

def build_presentation(output_pptx_path):
    prs = Presentation()
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)
    slide_layout = prs.slide_layouts[6] # Blank

    # Color Palette
    NAVY = RGBColor(15, 23, 42)          # Slate 900
    DARK_BLUE = RGBColor(30, 41, 59)     # Slate 800
    EMERALD = RGBColor(16, 185, 129)     # Emerald 500
    TEAL = RGBColor(13, 148, 136)        # Teal 600
    CARD_BG = RGBColor(248, 250, 252)    # Slate 50
    CARD_BORDER = RGBColor(226, 232, 240)# Slate 200
    TEXT_LIGHT = RGBColor(241, 245, 249) # Slate 100
    TEXT_MUTED = RGBColor(148, 163, 184) # Slate 400
    TEXT_DARK = RGBColor(30, 41, 59)     # Slate 800
    TEXT_BODY = RGBColor(51, 65, 85)     # Slate 700

    def add_slide_header(slide, title_text, category="NESTMATE PROJECT REVIEW"):
        # Category Tag
        cat_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.4), Inches(11.5), Inches(0.35))
        tf_cat = cat_box.text_frame
        tf_cat.word_wrap = True
        p_cat = tf_cat.paragraphs[0]
        p_cat.text = category.upper()
        p_cat.font.size = Pt(11)
        p_cat.font.bold = True
        p_cat.font.color.rgb = TEAL

        # Title
        title_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.72), Inches(11.5), Inches(0.7))
        tf_title = title_box.text_frame
        tf_title.word_wrap = True
        p_title = tf_title.paragraphs[0]
        p_title.text = title_text
        p_title.font.size = Pt(23)
        p_title.font.bold = True
        p_title.font.color.rgb = NAVY

    # ==========================================
    # SLIDE 1: TITLE SLIDE (Dark Navy Theme)
    # ==========================================
    s1 = prs.slides.add_slide(slide_layout)
    bg1 = s1.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, Inches(13.333), Inches(7.5))
    bg1.fill.solid()
    bg1.fill.fore_color.rgb = NAVY
    bg1.line.fill.background()

    # Title Box
    tbox = s1.shapes.add_textbox(Inches(1.0), Inches(1.4), Inches(11.3), Inches(2.8))
    tf1 = tbox.text_frame
    tf1.word_wrap = True
    
    p = tf1.paragraphs[0]
    p.text = "ACADEMIC CAPSTONE PROJECT PRESENTATION"
    p.font.size = Pt(13)
    p.font.bold = True
    p.font.color.rgb = EMERALD
    p.space_after = Pt(12)

    p = tf1.add_paragraph()
    p.text = "NestMate: Intelligent Room & PG Finder"
    p.font.size = Pt(36)
    p.font.bold = True
    p.font.color.rgb = TEXT_LIGHT

    p = tf1.add_paragraph()
    p.text = "With Algorithmic Roommate Lifestyle Compatibility Matching"
    p.font.size = Pt(21)
    p.font.color.rgb = TEXT_MUTED
    p.space_before = Pt(8)

    # Info Cards Box
    info_box = s1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(1.0), Inches(4.7), Inches(11.3), Inches(1.9))
    info_box.fill.solid()
    info_box.fill.fore_color.rgb = DARK_BLUE
    info_box.line.color.rgb = RGBColor(51, 65, 85)
    
    tf_info = info_box.text_frame
    tf_info.word_wrap = True
    tf_info.margin_left = Inches(0.4)
    tf_info.margin_top = Inches(0.25)

    p = tf_info.paragraphs[0]
    p.text = "Student Name: [Your Name]      |   Register / Roll No: [Your Roll Number]"
    p.font.size = Pt(14)
    p.font.bold = True
    p.font.color.rgb = TEXT_LIGHT
    p.space_after = Pt(6)

    p = tf_info.add_paragraph()
    p.text = "Project Guide / Mam: [Guide / Faculty Name]   |   Department: Computer Science & Engineering"
    p.font.size = Pt(13)
    p.font.color.rgb = RGBColor(203, 213, 225)
    p.space_after = Pt(6)

    p = tf_info.add_paragraph()
    p.text = "Domain: Web Systems & Algorithmic Multi-Attribute Recommender Systems"
    p.font.size = Pt(12)
    p.font.color.rgb = EMERALD

    # ==========================================
    # SLIDE 2: AGENDA / TABLE OF CONTENTS
    # ==========================================
    s2 = prs.slides.add_slide(slide_layout)
    add_slide_header(s2, "Presentation Outline & Agenda", "Structure")

    agenda_items = [
        ("01. Introduction & Background", "Context of student housing & roommate conflicts"),
        ("02. Literature Survey", "Comprehensive comparative analysis of existing rental platforms"),
        ("03. Gaps in Existing Systems", "Why current real estate portals fail in co-living"),
        ("04. Problem Statement", "Formal definition and boundaries of the project"),
        ("05. Project Objectives", "Primary and secondary technical goals"),
        ("06. System Architecture", "Frontend, FastAPI backend, SQLite database & matching engine"),
        ("07. Compatibility Algorithm", "Multi-attribute vector distance & dealbreaker mathematics"),
        ("08. Expected Outcomes & Summary", "Key deliverables, impact, and next milestones")
    ]

    for idx, (head, desc) in enumerate(agenda_items):
        col = idx // 4
        row = idx % 4
        x = Inches(0.8 + col * 5.9)
        y = Inches(1.6 + row * 1.3)

        c = s2.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, x, y, Inches(5.6), Inches(1.15))
        c.fill.solid()
        c.fill.fore_color.rgb = CARD_BG
        c.line.color.rgb = CARD_BORDER

        tf = c.text_frame
        tf.word_wrap = True
        tf.margin_left = Inches(0.25)
        tf.margin_top = Inches(0.18)

        p = tf.paragraphs[0]
        p.text = head
        p.font.size = Pt(14)
        p.font.bold = True
        p.font.color.rgb = NAVY

        p_sub = tf.add_paragraph()
        p_sub.text = desc
        p_sub.font.size = Pt(11)
        p_sub.font.color.rgb = TEXT_MUTED

    # ==========================================
    # SLIDE 3: INTRODUCTION & MOTIVATION
    # ==========================================
    s3 = prs.slides.add_slide(slide_layout)
    add_slide_header(s3, "1. Introduction & Motivation", "Context & Significance")

    c1 = s3.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(1.6), Inches(5.6), Inches(5.2))
    c1.fill.solid()
    c1.fill.fore_color.rgb = CARD_BG
    c1.line.color.rgb = CARD_BORDER
    tf = c1.text_frame
    tf.word_wrap = True
    tf.margin_left = Inches(0.3)
    tf.margin_top = Inches(0.3)
    
    p = tf.paragraphs[0]
    p.text = "The Co-Living Dilemma"
    p.font.size = Pt(18)
    p.font.bold = True
    p.font.color.rgb = NAVY
    p.space_after = Pt(10)

    intro_pts = [
        "Rapid Urban & Student Influx: Millions of students and entry-level IT professionals relocate to metro hubs (Bengaluru, Gurgaon, Pune, Hyderabad, Mumbai) annually.",
        "Financial Necessity: Shared flats and Paying Guest (PG) accommodations are the only affordable housing options.",
        "The Real Issue is People, Not Just Rooms: While finding an empty room is straightforward, finding habit-compatible roommates determines long-term peace of mind.",
        "High Conflict & Churn: Differences in sleep cycles, hygiene, and diet lead to stress, strained relationships, broken leases, and loss of security deposits."
    ]
    for pt in intro_pts:
        p = tf.add_paragraph()
        p.text = "• " + pt
        p.font.size = Pt(12.5)
        p.font.color.rgb = TEXT_BODY
        p.space_after = Pt(8)

    c2 = s3.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(6.8), Inches(1.6), Inches(5.7), Inches(5.2))
    c2.fill.solid()
    c2.fill.fore_color.rgb = CARD_BG
    c2.line.color.rgb = CARD_BORDER
    tf = c2.text_frame
    tf.word_wrap = True
    tf.margin_left = Inches(0.3)
    tf.margin_top = Inches(0.3)

    p = tf.paragraphs[0]
    p.text = "The NestMate Solution"
    p.font.size = Pt(18)
    p.font.bold = True
    p.font.color.rgb = TEAL
    p.space_after = Pt(10)

    sol_pts = [
        "Dual-Integrated Platform: Seamlessly pairs specialized room/PG search with an algorithmic compatibility engine.",
        "Pre-Booking Occupant Compatibility: Before scheduling a visit, seekers view real-time compatibility scores with current tenants already living in that room.",
        "Multi-Dimensional Profiling: Calibrates 6 lifestyle axes (Sleep rhythms, Cleanliness, Social battery, Noise, Work habits, Meal sharing).",
        "Conflict-Free Co-Living Utilities: Includes a Fair Rent Splitter and an automated 11-Month Digital Roommate Agreement."
    ]
    for pt in sol_pts:
        p = tf.add_paragraph()
        p.text = "✓ " + pt
        p.font.size = Pt(12.5)
        p.font.color.rgb = TEXT_BODY
        p.space_after = Pt(8)

    # ==========================================
    # SLIDE 4: LITERATURE SURVEY
    # ==========================================
    s4 = prs.slides.add_slide(slide_layout)
    add_slide_header(s4, "2. Literature Survey & Related Work", "Comparative Analysis")

    rows, cols = 5, 4
    table_shape = s4.shapes.add_table(rows, cols, Inches(0.8), Inches(1.6), Inches(11.7), Inches(5.0))
    table = table_shape.table
    table.columns[0].width = Inches(2.2)
    table.columns[1].width = Inches(3.0)
    table.columns[2].width = Inches(3.2)
    table.columns[3].width = Inches(3.3)

    headers = ["Category / System", "Primary Focus", "Key Strengths", "Critical Gaps & Limitations"]
    for i, h in enumerate(headers):
        cell = table.cell(0, i)
        cell.fill.solid()
        cell.fill.fore_color.rgb = DARK_BLUE
        p = cell.text_frame.paragraphs[0]
        p.text = h
        p.font.size = Pt(13)
        p.font.bold = True
        p.font.color.rgb = TEXT_LIGHT

    survey_data = [
        (
            "Commercial Portals\n(99acres, MagicBricks, Housing)",
            "Whole property real estate sales and family rentals",
            "Vast listings database, map geolocation, high traffic.",
            "Complete absence of roommate matching; treats PGs strictly as commercial transactions."
        ),
        (
            "Managed Co-Living\n(Zolo Stays, Stanza Living)",
            "Managed hostels and student accommodations",
            "Standardized furnishings, food provided, mobile payment app.",
            "Zero compatibility screening; arbitrary bed assignments; high deposits and rigid locks."
        ),
        (
            "International Apps\n(Roomi, SpareRoom, Flatmates)",
            "Roommate discovery in US, UK & Australia",
            "Personal profiles, lifestyle tags, direct chat.",
            "Lacks Indian context (no single/double/triple sharing, no food/mess plans, no strict veg dealbreakers)."
        ),
        (
            "Academic Matching Research\n(Gale-Shapley, Multi-Criteria)",
            "Theoretical algorithmic matchmaking algorithms",
            "Mathematical proof of stable pairing, vector distance models.",
            "Theoretical only; disconnected from an operational property discovery & booking portal."
        )
    ]
    for row_idx, row in enumerate(survey_data, start=1):
        for col_idx, text in enumerate(row):
            cell = table.cell(row_idx, col_idx)
            cell.fill.solid()
            cell.fill.fore_color.rgb = RGBColor(255, 255, 255) if row_idx % 2 == 1 else RGBColor(241, 245, 249)
            p = cell.text_frame.paragraphs[0]
            p.text = text
            p.font.size = Pt(11)
            p.font.color.rgb = TEXT_DARK

    # ==========================================
    # SLIDE 5: GAPS IN EXISTING SYSTEMS
    # ==========================================
    s5 = prs.slides.add_slide(slide_layout)
    add_slide_header(s5, "3. Gaps in Existing Systems", "Research & Market Opportunities")

    gaps_list = [
        ("Gap 1: Property-Centric vs. Human-Centric", "Existing portals treat accommodation search as real estate transactions. In reality, tenant satisfaction in shared spaces is 80% dependent on interpersonal roommate harmony."),
        ("Gap 2: The 'Blind Booking' Risk", "Tenants sign leases without knowing if current occupants are night owls, non-vegetarians, smokers, or have incompatible hygiene habits, causing immediate friction."),
        ("Gap 3: Missing Indian Context Specifics", "Global platforms do not account for Indian student needs: Boys/Girls/Co-Ed PGs, Food/Mess inclusions (3 meals/day), Curfew rules, and Zero Brokerage verification."),
        ("Gap 4: Lack of Conflict Prevention Utilities", "No existing platforms provide objective tools like Fair Rent Splitters (adjusting rent for attached baths/balconies) or structured digital co-living agreements.")
    ]
    for idx, (title, desc) in enumerate(gaps_list):
        gx = Inches(0.8 + (idx % 2) * 5.9)
        gy = Inches(1.6 + (idx // 2) * 2.7)

        gc = s5.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, gx, gy, Inches(5.6), Inches(2.4))
        gc.fill.solid()
        gc.fill.fore_color.rgb = CARD_BG
        gc.line.color.rgb = CARD_BORDER

        gtf = gc.text_frame
        gtf.word_wrap = True
        gtf.margin_left = Inches(0.3)
        gtf.margin_top = Inches(0.25)
        gtf.margin_right = Inches(0.3)

        p = gtf.paragraphs[0]
        p.text = title
        p.font.size = Pt(15)
        p.font.bold = True
        p.font.color.rgb = NAVY if idx % 2 == 0 else TEAL
        p.space_after = Pt(6)

        p_desc = gtf.add_paragraph()
        p_desc.text = desc
        p_desc.font.size = Pt(12)
        p_desc.font.color.rgb = TEXT_BODY

    # ==========================================
    # SLIDE 6: PROBLEM STATEMENT
    # ==========================================
    s6 = prs.slides.add_slide(slide_layout)
    add_slide_header(s6, "4. Problem Statement", "Core Research Challenge")

    # Big Banner
    bcard = s6.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(1.6), Inches(11.7), Inches(2.4))
    bcard.fill.solid()
    bcard.fill.fore_color.rgb = DARK_BLUE
    bcard.line.fill.background()

    btf = bcard.text_frame
    btf.word_wrap = True
    btf.margin_left = Inches(0.4)
    btf.margin_top = Inches(0.35)
    btf.margin_right = Inches(0.4)

    p = btf.paragraphs[0]
    p.text = "FORMAL PROBLEM STATEMENT"
    p.font.size = Pt(12)
    p.font.bold = True
    p.font.color.rgb = EMERALD
    p.space_after = Pt(8)

    p_s = btf.add_paragraph()
    p_s.text = (
        '"To design and develop a unified web platform that integrates student/PG accommodation '
        'search with an algorithmic roommate lifestyle compatibility engine, enabling prospective '
        'tenants to evaluate physical property parameters and current occupant compatibility '
        'simultaneously before committing to financial deposits or residential agreements."'
    )
    p_s.font.size = Pt(15.5)
    p_s.font.color.rgb = TEXT_LIGHT

    # Scope Cards below
    sc1 = s6.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(4.3), Inches(5.6), Inches(2.5))
    sc1.fill.solid()
    sc1.fill.fore_color.rgb = CARD_BG
    sc1.line.color.rgb = CARD_BORDER
    tf = sc1.text_frame
    tf.word_wrap = True
    tf.margin_left = Inches(0.3)
    tf.margin_top = Inches(0.2)

    p = tf.paragraphs[0]
    p.text = "Target Demographics:"
    p.font.size = Pt(15)
    p.font.bold = True
    p.font.color.rgb = NAVY
    p.space_after = Pt(6)

    for item in [
        "Undergraduate & postgraduate college students.",
        "Entry-level IT & corporate professionals in tech hubs.",
        "Independent PG owners seeking long-term, harmonious tenants."
    ]:
        p = tf.add_paragraph()
        p.text = "• " + item
        p.font.size = Pt(12)
        p.font.color.rgb = TEXT_BODY
        p.space_after = Pt(4)

    sc2 = s6.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(6.8), Inches(4.3), Inches(5.7), Inches(2.5))
    sc2.fill.solid()
    sc2.fill.fore_color.rgb = CARD_BG
    sc2.line.color.rgb = CARD_BORDER
    tf = sc2.text_frame
    tf.word_wrap = True
    tf.margin_left = Inches(0.3)
    tf.margin_top = Inches(0.2)

    p = tf.paragraphs[0]
    p.text = "Key Challenges Addressed:"
    p.font.size = Pt(15)
    p.font.bold = True
    p.font.color.rgb = TEAL
    p.space_after = Pt(6)

    for item in [
        "Eliminating the financial risk of incompatible co-living.",
        "Providing transparency into existing flatmates' daily habits.",
        "Removing broker exploitation and zero brokerage discovery."
    ]:
        p = tf.add_paragraph()
        p.text = "• " + item
        p.font.size = Pt(12)
        p.font.color.rgb = TEXT_BODY
        p.space_after = Pt(4)

    # ==========================================
    # SLIDE 7: PROJECT OBJECTIVES
    # ==========================================
    s7 = prs.slides.add_slide(slide_layout)
    add_slide_header(s7, "5. Project Objectives", "Primary & Secondary Goals")

    oc1 = s7.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(1.6), Inches(5.6), Inches(5.2))
    oc1.fill.solid()
    oc1.fill.fore_color.rgb = CARD_BG
    oc1.line.color.rgb = CARD_BORDER
    tf = oc1.text_frame
    tf.word_wrap = True
    tf.margin_left = Inches(0.3)
    tf.margin_top = Inches(0.3)

    p = tf.paragraphs[0]
    p.text = "Primary Objectives"
    p.font.size = Pt(18)
    p.font.bold = True
    p.font.color.rgb = NAVY
    p.space_after = Pt(10)

    p_objs = [
        "Interactive PG & Room Discovery Engine: Design filters for Boys/Girls/Co-Ed PGs, single/sharing rooms, meal plans, and budget in ₹ INR.",
        "Algorithmic Compatibility Engine: Implement a weighted Euclidean distance algorithm across 6 lifestyle dimensions.",
        "Dual-Integration Architecture: Embed real-time occupant compatibility match % directly into property listings cards.",
        "Visual Radar Comparison: Generate 6-axis Radar charts with automatic Green Flags (strengths) and Yellow Flags (points to discuss)."
    ]
    for obj in p_objs:
        p = tf.add_paragraph()
        p.text = "🎯 " + obj
        p.font.size = Pt(12.5)
        p.font.color.rgb = TEXT_BODY
        p.space_after = Pt(8)

    oc2 = s7.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(6.8), Inches(1.6), Inches(5.7), Inches(5.2))
    oc2.fill.solid()
    oc2.fill.fore_color.rgb = CARD_BG
    oc2.line.color.rgb = CARD_BORDER
    tf = oc2.text_frame
    tf.word_wrap = True
    tf.margin_left = Inches(0.3)
    tf.margin_top = Inches(0.3)

    p = tf.paragraphs[0]
    p.text = "Secondary / Utility Objectives"
    p.font.size = Pt(18)
    p.font.bold = True
    p.font.color.rgb = TEAL
    p.space_after = Pt(10)

    s_objs = [
        "Dealbreaker Enforcement: Strict filtering for smoking, alcohol, pets, and dietary constraints (Pure Veg vs Non-Veg).",
        "Mathematical Fair Rent Splitter: Objective algorithm calculating room rent based on square footage, attached bath, and balcony.",
        "11-Month Digital Roommate Agreement: Standardized house rule and chore contract generator with print/export options.",
        "High-Performance SPA: Fast, responsive user experience using React 18, Vite, and Python FastAPI REST APIs."
    ]
    for obj in s_objs:
        p = tf.add_paragraph()
        p.text = "⚡ " + obj
        p.font.size = Pt(12.5)
        p.font.color.rgb = TEXT_BODY
        p.space_after = Pt(8)

    # ==========================================
    # SLIDE 8: SYSTEM ARCHITECTURE
    # ==========================================
    s8 = prs.slides.add_slide(slide_layout)
    add_slide_header(s8, "6. Proposed System Architecture", "Dataflow & Component Design")

    layers = [
        ("Presentation Layer (React 18 + Vite)", "Modern Single Page Application (SPA), Tailwind CSS, Lucide icons, interactive SVG Radar charts, responsive filter controls."),
        ("Application & API Layer (Python FastAPI)", "High-performance REST API, asynchronous route handlers, Pydantic schemas for data validation, JWT/session management."),
        ("Algorithmic Engine (Matching & Scoring)", "6-Axis Weighted Euclidean distance calculator, hard constraint dealbreaker evaluator, Fair Rent Splitter math."),
        ("Data Persistence Layer (SQLite / SQLAlchemy)", "Relational tables: Users, LifestyleProfiles, PropertyListings, OccupantRelations, and ConnectionRequests.")
    ]

    for idx, (title, desc) in enumerate(layers):
        y = Inches(1.6 + idx * 1.3)
        ac = s8.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), y, Inches(11.7), Inches(1.15))
        ac.fill.solid()
        ac.fill.fore_color.rgb = CARD_BG
        ac.line.color.rgb = CARD_BORDER

        tf = ac.text_frame
        tf.word_wrap = True
        tf.margin_left = Inches(0.3)
        tf.margin_top = Inches(0.18)

        p = tf.paragraphs[0]
        p.text = f"Layer {idx + 1}: {title}"
        p.font.size = Pt(14)
        p.font.bold = True
        p.font.color.rgb = NAVY if idx % 2 == 0 else TEAL

        p_desc = tf.add_paragraph()
        p_desc.text = desc
        p_desc.font.size = Pt(12)
        p_desc.font.color.rgb = TEXT_BODY

    # ==========================================
    # SLIDE 9: COMPATIBILITY ALGORITHM
    # ==========================================
    s9 = prs.slides.add_slide(slide_layout)
    add_slide_header(s9, "7. Compatibility Matching Algorithm", "Mathematical Formulation")

    # Formula Card
    fcard = s9.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(1.6), Inches(11.7), Inches(2.2))
    fcard.fill.solid()
    fcard.fill.fore_color.rgb = DARK_BLUE
    fcard.line.fill.background()

    ftf = fcard.text_frame
    ftf.word_wrap = True
    ftf.margin_left = Inches(0.4)
    ftf.margin_top = Inches(0.25)

    p = ftf.paragraphs[0]
    p.text = "MATHEMATICAL FORMULATION"
    p.font.size = Pt(12)
    p.font.bold = True
    p.font.color.rgb = EMERALD
    p.space_after = Pt(6)

    p = ftf.add_paragraph()
    p.text = "1. Weighted Euclidean Distance:  D = sqrt( sum( w_i * (p_i - q_i)^2 ) )"
    p.font.size = Pt(15)
    p.font.bold = True
    p.font.color.rgb = TEXT_LIGHT
    p.space_after = Pt(4)

    p = ftf.add_paragraph()
    p.text = "2. Normalized Match Percentage:  Match % = max(0, 100 * (1 - D / D_max))"
    p.font.size = Pt(15)
    p.font.bold = True
    p.font.color.rgb = TEXT_LIGHT

    # Two bottom detail cards
    d1 = s9.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(4.1), Inches(5.6), Inches(2.7))
    d1.fill.solid()
    d1.fill.fore_color.rgb = CARD_BG
    d1.line.color.rgb = CARD_BORDER
    tf1 = d1.text_frame
    tf1.word_wrap = True
    tf1.margin_left = Inches(0.3)
    tf1.margin_top = Inches(0.2)

    p = tf1.paragraphs[0]
    p.text = "The 6 Evaluated Lifestyle Axes (1-5):"
    p.font.size = Pt(14)
    p.font.bold = True
    p.font.color.rgb = NAVY
    p.space_after = Pt(6)

    for item in [
        "1. Sleep Schedule (Early Bird 5 AM vs Night Owl 2 AM)",
        "2. Cleanliness & Chores (Relaxed vs Daily Deep Clean)",
        "3. Social Battery (Quiet Sanctuary vs Social Gatherings)",
        "4. Work Routine (100% In-Office vs 100% WFH)",
        "5. Noise Tolerance (Silent vs Music / TV)",
        "6. Kitchen Habits (Separate vs Cooking Together)"
    ]:
        p = tf1.add_paragraph()
        p.text = "• " + item
        p.font.size = Pt(11.5)
        p.font.color.rgb = TEXT_BODY
        p.space_after = Pt(3)

    d2 = s9.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(6.8), Inches(4.1), Inches(5.7), Inches(2.7))
    d2.fill.solid()
    d2.fill.fore_color.rgb = CARD_BG
    d2.line.color.rgb = CARD_BORDER
    tf2 = d2.text_frame
    tf2.word_wrap = True
    tf2.margin_left = Inches(0.3)
    tf2.margin_top = Inches(0.2)

    p = tf2.paragraphs[0]
    p.text = "Hard Dealbreakers & Thresholds:"
    p.font.size = Pt(14)
    p.font.bold = True
    p.font.color.rgb = TEAL
    p.space_after = Pt(6)

    for item in [
        "Strict Vegetarian vs Non-Vegetarian cooking conflict",
        "Smoking & Alcohol consumption restrictions",
        "Pet tolerance & allergies dealbreakers",
        "Budget divergence exceeding 35% threshold",
        "If any dealbreaker fails, compatibility is instantly reduced to 0%"
    ]:
        p = tf2.add_paragraph()
        p.text = "✓ " + item
        p.font.size = Pt(11.5)
        p.font.color.rgb = TEXT_BODY
        p.space_after = Pt(4)

    # ==========================================
    # SLIDE 10: TECH STACK & REQUIREMENTS
    # ==========================================
    s10 = prs.slides.add_slide(slide_layout)
    add_slide_header(s10, "8. Technology Stack & Implementation", "Tools & Frameworks")

    tech_cards = [
        ("Frontend Technology", "React 18, Vite build tool, Tailwind CSS, Lucide Icons, SVG Canvas for Radar Charts.", NAVY),
        ("Backend Framework", "Python 3.11+, FastAPI (Asynchronous REST API), Pydantic v2 schemas, Uvicorn ASGI server.", TEAL),
        ("Database & ORM", "SQLite (lightweight, zero-config relational DB), SQLAlchemy ORM with foreign key cascades.", DARK_BLUE),
        ("Testing & Quality", "Pytest automated integration test suite, Vite production builds, Postman API testing.", TEAL)
    ]

    for idx, (head, desc, col) in enumerate(tech_cards):
        tx = Inches(0.8 + (idx % 2) * 5.9)
        ty = Inches(1.6 + (idx // 2) * 2.7)

        card = s10.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, tx, ty, Inches(5.6), Inches(2.4))
        card.fill.solid()
        card.fill.fore_color.rgb = CARD_BG
        card.line.color.rgb = CARD_BORDER

        tf = card.text_frame
        tf.word_wrap = True
        tf.margin_left = Inches(0.3)
        tf.margin_top = Inches(0.25)

        p = tf.paragraphs[0]
        p.text = head
        p.font.size = Pt(16)
        p.font.bold = True
        p.font.color.rgb = col
        p.space_after = Pt(6)

        p_desc = tf.add_paragraph()
        p_desc.text = desc
        p_desc.font.size = Pt(12)
        p_desc.font.color.rgb = TEXT_BODY

    # ==========================================
    # SLIDE 11: CONCLUSION & NEXT MILESTONES
    # ==========================================
    s11 = prs.slides.add_slide(slide_layout)
    add_slide_header(s11, "9. Conclusion & Future Roadmap", "Project Outcomes")

    c_left = s11.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(1.6), Inches(5.6), Inches(5.2))
    c_left.fill.solid()
    c_left.fill.fore_color.rgb = CARD_BG
    c_left.line.color.rgb = CARD_BORDER
    tf = c_left.text_frame
    tf.word_wrap = True
    tf.margin_left = Inches(0.3)
    tf.margin_top = Inches(0.3)

    p = tf.paragraphs[0]
    p.text = "Key Project Achievements"
    p.font.size = Pt(18)
    p.font.bold = True
    p.font.color.rgb = NAVY
    p.space_after = Pt(10)

    achieves = [
        "Successfully unified PG and room discovery with real-time occupant lifestyle compatibility.",
        "Engineered an objective 6-axis mathematical matching engine to minimize co-living friction.",
        "Tailored the platform for Indian student & tech hub realities (Boys/Girls PG, meals, zero brokerage).",
        "Built dispute-prevention utilities (Fair Rent Splitter and Digital Agreement)."
    ]
    for ach in achieves:
        p = tf.add_paragraph()
        p.text = "✓ " + ach
        p.font.size = Pt(12.5)
        p.font.color.rgb = TEXT_BODY
        p.space_after = Pt(8)

    c_right = s11.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(6.8), Inches(1.6), Inches(5.7), Inches(5.2))
    c_right.fill.solid()
    c_right.fill.fore_color.rgb = CARD_BG
    c_right.line.color.rgb = CARD_BORDER
    tf = c_right.text_frame
    tf.word_wrap = True
    tf.margin_left = Inches(0.3)
    tf.margin_top = Inches(0.3)

    p = tf.paragraphs[0]
    p.text = "Future Milestones"
    p.font.size = Pt(18)
    p.font.bold = True
    p.font.color.rgb = TEAL
    p.space_after = Pt(10)

    futures = [
        "In-App Messaging: WebSocket-based direct chat for prospective roommates.",
        "Student ID / Work Email Verification: College ID verification to prevent fake listings.",
        "Owner Portal: Direct PG owner dashboard for managing bed vacancies and updating meal menus.",
        "Geolocation Mapping: Google Maps API integration with distance to college/metro stations."
    ]
    for fut in futures:
        p = tf.add_paragraph()
        p.text = "🚀 " + fut
        p.font.size = Pt(12.5)
        p.font.color.rgb = TEXT_BODY
        p.space_after = Pt(8)

    # ==========================================
    # SLIDE 12: THANK YOU & Q&A
    # ==========================================
    s12 = prs.slides.add_slide(slide_layout)
    bg12 = s12.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, Inches(13.333), Inches(7.5))
    bg12.fill.solid()
    bg12.fill.fore_color.rgb = NAVY
    bg12.line.fill.background()

    tbox12 = s12.shapes.add_textbox(Inches(1.5), Inches(2.2), Inches(10.3), Inches(3.0))
    tf12 = tbox12.text_frame
    tf12.word_wrap = True

    p = tf12.paragraphs[0]
    p.text = "Thank You!"
    p.font.size = Pt(44)
    p.font.bold = True
    p.font.color.rgb = TEXT_LIGHT
    p.alignment = PP_ALIGN.CENTER
    p.space_after = Pt(14)

    p = tf12.add_paragraph()
    p.text = "NestMate: Finding the right room begins with finding the right people."
    p.font.size = Pt(20)
    p.font.color.rgb = EMERALD
    p.alignment = PP_ALIGN.CENTER
    p.space_after = Pt(20)

    p = tf12.add_paragraph()
    p.text = "Questions & Feedback Welcome"
    p.font.size = Pt(18)
    p.font.color.rgb = TEXT_MUTED
    p.alignment = PP_ALIGN.CENTER

    prs.save(output_pptx_path)
    print(f"[SUCCESS] 12-slide Presentation saved to: {output_pptx_path}")

if __name__ == "__main__":
    out_file = r"c:\Drive d\hmmmmm\NestMate_Project_Presentation.pptx"
    build_presentation(out_file)
