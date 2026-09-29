import os
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN
from pptx.enum.shapes import MSO_SHAPE

def build_smart_rental_presentation():
    prs = Presentation()
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)
    blank_layout = prs.slide_layouts[6]

    NAVY = RGBColor(15, 23, 42)          # Slate 900
    DARK_BLUE = RGBColor(30, 41, 59)     # Slate 800
    EMERALD = RGBColor(16, 185, 129)     # Emerald 500
    TEAL = RGBColor(13, 148, 136)        # Teal 600
    CARD_BG = RGBColor(248, 250, 252)    # Slate 50
    CARD_BORDER = RGBColor(226, 232, 240)# Slate 200
    TEXT_LIGHT = RGBColor(248, 250, 252) # Slate 50
    TEXT_DARK = RGBColor(15, 23, 42)     # Slate 900
    TEXT_BODY = RGBColor(51, 65, 85)     # Slate 700

    def add_chrome(slide, slide_num, category, title):
        tag = slide.shapes.add_textbox(Inches(0.8), Inches(0.4), Inches(9.0), Inches(0.35))
        tf_t = tag.text_frame
        p_t = tf_t.paragraphs[0]
        p_t.text = category.upper()
        p_t.font.size = Pt(11)
        p_t.font.bold = True
        p_t.font.color.rgb = TEAL

        badge = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(11.2), Inches(0.4), Inches(1.3), Inches(0.38))
        badge.fill.solid()
        badge.fill.fore_color.rgb = DARK_BLUE
        badge.line.fill.background()
        tf_b = badge.text_frame
        p_b = tf_b.paragraphs[0]
        p_b.text = f"SLIDE {slide_num}/5"
        p_b.font.size = Pt(11)
        p_b.font.bold = True
        p_b.font.color.rgb = EMERALD
        p_b.alignment = PP_ALIGN.CENTER

        title_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.72), Inches(10.0), Inches(0.7))
        tf_title = title_box.text_frame
        p_title = tf_title.paragraphs[0]
        p_title.text = title
        p_title.font.size = Pt(24)
        p_title.font.bold = True
        p_title.font.color.rgb = NAVY

    # =========================================================================
    # SLIDE 1: INTRODUCTION & BACKGROUND
    # =========================================================================
    s1 = prs.slides.add_slide(blank_layout)
    add_chrome(s1, 1, "Project Introduction", "1. Introduction & Background")

    banner = s1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(1.5), Inches(11.7), Inches(1.1))
    banner.fill.solid()
    banner.fill.fore_color.rgb = DARK_BLUE
    banner.line.fill.background()
    t_tf = banner.text_frame
    t_tf.margin_left = Inches(0.3)
    t_tf.margin_top = Inches(0.16)
    p = t_tf.paragraphs[0]
    p.text = "Project Name: Smart Rental and Roommate Compatibility"
    p.font.size = Pt(15)
    p.font.bold = True
    p.font.color.rgb = EMERALD
    p_sub = t_tf.add_paragraph()
    p_sub.text = "Student Name: [Your Name]   |   Roll No: [Your Roll No]   |   Guide: [Guide / Mam's Name]"
    p_sub.font.size = Pt(12)
    p_sub.font.color.rgb = TEXT_LIGHT

    c1 = s1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(2.8), Inches(5.6), Inches(4.3))
    c1.fill.solid()
    c1.fill.fore_color.rgb = CARD_BG
    c1.line.color.rgb = CARD_BORDER
    tf1 = c1.text_frame
    tf1.margin_left = Inches(0.3)
    tf1.margin_top = Inches(0.25)
    p = tf1.paragraphs[0]
    p.text = "The Real Problem Today"
    p.font.size = Pt(16)
    p.font.bold = True
    p.font.color.rgb = NAVY
    p.space_after = Pt(8)

    pts_left = [
        "Students & Job Seekers Move to Cities: Thousands move to Bangalore, Pune, Gurgaon, etc. for college or IT jobs.",
        "High Room Rent: Full apartments are too expensive, so everyone stays in PGs or shared rooms.",
        "The Roommate Problem: Finding an empty room is easy, but finding good roommates is very hard.",
        "Daily Conflicts: Differences in sleep time (night owl vs early bird), cleaning, or food cause daily stress and fights."
    ]
    for pt in pts_left:
        p = tf1.add_paragraph()
        p.text = "• " + pt
        p.font.size = Pt(12.5)
        p.font.color.rgb = TEXT_BODY
        p.space_after = Pt(6)

    c2 = s1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(6.8), Inches(2.8), Inches(5.7), Inches(4.3))
    c2.fill.solid()
    c2.fill.fore_color.rgb = CARD_BG
    c2.line.color.rgb = CARD_BORDER
    tf2 = c2.text_frame
    tf2.margin_left = Inches(0.3)
    tf2.margin_top = Inches(0.25)
    p = tf2.paragraphs[0]
    p.text = "Our Smart Rental Solution"
    p.font.size = Pt(16)
    p.font.bold = True
    p.font.color.rgb = TEAL
    p.space_after = Pt(8)

    pts_right = [
        "Two-in-One Website: Search for rooms and PGs, and also check roommate compatibility.",
        "Check Compatibility Before Booking: See a 0% to 100% match score with roommates already living there before you pay.",
        "Simple 6-Habit Quiz: Matches users on sleep timing, cleanliness, noise level, work routine, and food preferences.",
        "Helpful Living Tools: A fair rent splitter (for bigger rooms) and a simple 1-click roommate agreement for house rules."
    ]
    for pt in pts_right:
        p = tf2.add_paragraph()
        p.text = "✓ " + pt
        p.font.size = Pt(12.5)
        p.font.color.rgb = TEXT_BODY
        p.space_after = Pt(6)

    # =========================================================================
    # SLIDE 2: LITERATURE SURVEY
    # =========================================================================
    s2 = prs.slides.add_slide(blank_layout)
    add_chrome(s2, 2, "What Existing Apps Do", "2. Literature Survey & Related Work")

    table_shape = s2.shapes.add_table(5, 4, Inches(0.8), Inches(1.6), Inches(11.7), Inches(5.2))
    t = table_shape.table
    t.columns[0].width = Inches(2.3)
    t.columns[1].width = Inches(3.0)
    t.columns[2].width = Inches(3.0)
    t.columns[3].width = Inches(3.4)

    headers = ["Existing Systems", "What They Are Used For", "What They Do Well", "What They Don't Do (Gaps)"]
    for i, h in enumerate(headers):
        cell = t.cell(0, i)
        cell.fill.solid()
        cell.fill.fore_color.rgb = DARK_BLUE
        p = cell.text_frame.paragraphs[0]
        p.text = h
        p.font.size = Pt(13)
        p.font.bold = True
        p.font.color.rgb = TEXT_LIGHT

    survey_data = [
        (
            "MagicBricks & 99acres",
            "Property sales and whole flat rentals",
            "Large list of properties, photos, and owner phone numbers.",
            "Zero roommate matching. They only care about rent money, not who lives with you."
        ),
        (
            "Zolo Stays & Stanza Living",
            "Managed hostels and student PGs",
            "Furnished rooms, regular food mess, and housekeeping.",
            "Puts random roommates together without asking you. High deposit and rigid contracts."
        ),
        (
            "Foreign Apps\n(Roomi, SpareRoom)",
            "Roommate finding in US & UK",
            "User profiles, budget search, in-app messaging.",
            "Not made for India. Does not have Boys/Girls PG filters, meal options, or veg food rules."
        ),
        (
            "College Research Papers",
            "Math formulas for matching people",
            "Formulas to calculate compatibility between two people.",
            "Only research papers and theory. Nobody built a simple, working website for students."
        )
    ]
    for row_idx, row in enumerate(survey_data, start=1):
        for col_idx, text in enumerate(row):
            cell = t.cell(row_idx, col_idx)
            cell.fill.solid()
            cell.fill.fore_color.rgb = RGBColor(255, 255, 255) if row_idx % 2 == 1 else RGBColor(241, 245, 249)
            p = cell.text_frame.paragraphs[0]
            p.text = text
            p.font.size = Pt(11.5)
            p.font.color.rgb = TEXT_DARK

    # =========================================================================
    # SLIDE 3: GAPS IN EXISTING SYSTEMS
    # =========================================================================
    s3 = prs.slides.add_slide(blank_layout)
    add_chrome(s3, 3, "What Is Missing Today", "3. Gaps in Existing Systems")

    gaps = [
        ("1. Apps Only Show Rooms, Not People", "Existing websites show photos of empty rooms and walls. But your peaceful living depends on who you live with, not just how the room looks."),
        ("2. The Problem of 'Blind Booking'", "Students pay money and book a bed without knowing if their roommate stays awake all night, leaves dirty dishes, or smokes inside."),
        ("3. Missing Indian PG Features", "Most apps don't easily filter for Indian needs: Boys PG, Girls PG, 3 meals included daily, gate curfew timings, and zero brokerage."),
        ("4. No Help to Avoid Daily Fights", "Existing apps have no tools to divide rent fairly if one person has a bigger room or attached bathroom, and no simple house rules agreement.")
    ]
    for idx, (title, desc) in enumerate(gaps):
        gx = Inches(0.8 + (idx % 2) * 5.9)
        gy = Inches(1.6 + (idx // 2) * 2.7)

        gc = s3.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, gx, gy, Inches(5.6), Inches(2.45))
        gc.fill.solid()
        gc.fill.fore_color.rgb = CARD_BG
        gc.line.color.rgb = CARD_BORDER

        gtf = gc.text_frame
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
        p_desc.font.size = Pt(12.5)
        p_desc.font.color.rgb = TEXT_BODY

    # =========================================================================
    # SLIDE 4: PROBLEM STATEMENT
    # =========================================================================
    s4 = prs.slides.add_slide(blank_layout)
    add_chrome(s4, 4, "Clear Problem Definition", "4. Problem Statement")

    bcard = s4.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(1.6), Inches(11.7), Inches(2.3))
    bcard.fill.solid()
    bcard.fill.fore_color.rgb = DARK_BLUE
    bcard.line.fill.background()

    btf = bcard.text_frame
    btf.margin_left = Inches(0.4)
    btf.margin_top = Inches(0.35)
    btf.margin_right = Inches(0.4)

    p = btf.paragraphs[0]
    p.text = "PROBLEM STATEMENT"
    p.font.size = Pt(12)
    p.font.bold = True
    p.font.color.rgb = EMERALD
    p.space_after = Pt(8)

    p_s = btf.add_paragraph()
    p_s.text = (
        '"To build an easy-to-use Smart Rental website where students and job seekers can search '
        'for PGs and rooms, and check if their lifestyle habits match with current roommates '
        'before paying any deposit money."'
    )
    p_s.font.size = Pt(16)
    p_s.font.color.rgb = TEXT_LIGHT

    sc1 = s4.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(4.2), Inches(5.6), Inches(2.6))
    sc1.fill.solid()
    sc1.fill.fore_color.rgb = CARD_BG
    sc1.line.color.rgb = CARD_BORDER
    tf = sc1.text_frame
    tf.margin_left = Inches(0.3)
    tf.margin_top = Inches(0.2)
    p = tf.paragraphs[0]
    p.text = "Who Will Use This Website?"
    p.font.size = Pt(15)
    p.font.bold = True
    p.font.color.rgb = NAVY
    p.space_after = Pt(6)
    for item in [
        "College students moving to university cities.",
        "Young IT and office workers looking for shared flats.",
        "PG owners who want peaceful, long-term tenants."
    ]:
        p = tf.add_paragraph()
        p.text = "• " + item
        p.font.size = Pt(12.5)
        p.font.color.rgb = TEXT_BODY
        p.space_after = Pt(5)

    sc2 = s4.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(6.8), Inches(4.2), Inches(5.7), Inches(2.6))
    sc2.fill.solid()
    sc2.fill.fore_color.rgb = CARD_BG
    sc2.line.color.rgb = CARD_BORDER
    tf = sc2.text_frame
    tf.margin_left = Inches(0.3)
    tf.margin_top = Inches(0.2)
    p = tf.paragraphs[0]
    p.text = "Main Benefits for Students:"
    p.font.size = Pt(15)
    p.font.bold = True
    p.font.color.rgb = TEAL
    p.space_after = Pt(6)
    for item in [
        "No more roommate fights or stress after moving in.",
        "Full transparency of daily habits before booking.",
        "Direct contact without paying broker fees."
    ]:
        p = tf.add_paragraph()
        p.text = "✓ " + item
        p.font.size = Pt(12.5)
        p.font.color.rgb = TEXT_BODY
        p.space_after = Pt(5)

    # =========================================================================
    # SLIDE 5: OBJECTIVES
    # =========================================================================
    s5 = prs.slides.add_slide(blank_layout)
    add_chrome(s5, 5, "What the Website Does", "5. Project Objectives")

    oc1 = s5.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(1.6), Inches(5.6), Inches(5.2))
    oc1.fill.solid()
    oc1.fill.fore_color.rgb = CARD_BG
    oc1.line.color.rgb = CARD_BORDER
    tf = oc1.text_frame
    tf.margin_left = Inches(0.3)
    tf.margin_top = Inches(0.3)
    p = tf.paragraphs[0]
    p.text = "Main Objectives (Core Features)"
    p.font.size = Pt(18)
    p.font.bold = True
    p.font.color.rgb = NAVY
    p.space_after = Pt(10)

    for obj in [
        "Smart PG & Room Search: Search by Boys PG, Girls PG, Single/2/3 sharing, 3 meals included, and budget in Rupees.",
        "Roommate Compatibility Score: Calculates a 0% to 100% match score using 6 daily habits (Sleep, Cleanliness, Work, Noise, Food, Guests).",
        "Match Score on Room Cards: Shows '92% Match with Flatmate' directly on room listings so you know before visiting.",
        "Comparison Charts: Simple charts showing what habits you match on and what you should discuss."
    ]:
        p = tf.add_paragraph()
        p.text = "🎯 " + obj
        p.font.size = Pt(12.5)
        p.font.color.rgb = TEXT_BODY
        p.space_after = Pt(8)

    oc2 = s5.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(6.8), Inches(1.6), Inches(5.7), Inches(5.2))
    oc2.fill.solid()
    oc2.fill.fore_color.rgb = CARD_BG
    oc2.line.color.rgb = CARD_BORDER
    tf = oc2.text_frame
    tf.margin_left = Inches(0.3)
    tf.margin_top = Inches(0.3)
    p = tf.paragraphs[0]
    p.text = "Helpful Tools (Extra Features)"
    p.font.size = Pt(18)
    p.font.bold = True
    p.font.color.rgb = TEAL
    p.space_after = Pt(10)

    for obj in [
        "Strict Dealbreakers: Strict filters for Pure Veg food, non-smoking, and pets (if dealbreaker fails, match is 0%).",
        "Fair Rent Splitter: Tool that calculates fair rent if someone has an attached bathroom or balcony.",
        "Roommate Agreement: 1-click simple agreement for cleaning turns, quiet hours, and visitors.",
        "Fast & Clean Website: Modern, clean website that works smoothly on mobile and laptops."
    ]:
        p = tf.add_paragraph()
        p.text = "⚡ " + obj
        p.font.size = Pt(12.5)
        p.font.color.rgb = TEXT_BODY
        p.space_after = Pt(8)

    paths = [
        r"C:\Users\bhavi\OneDrive\Desktop\Smart_Rental_and_Roommate_Compatibility.pptx",
        r"c:\Drive d\hmmmmm\Smart_Rental_and_Roommate_Compatibility.pptx",
        r"C:\Users\bhavi\OneDrive\Desktop\NestMate_5_Slides.pptx",
        r"c:\Drive d\hmmmmm\NestMate_5_Slides.pptx"
    ]
    for p_out in paths:
        try:
            prs.save(p_out)
            print(f"Updated: {p_out}")
        except Exception as e:
            print(f"Error saving {p_out}: {e}")

if __name__ == "__main__":
    build_smart_rental_presentation()
