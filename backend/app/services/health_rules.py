from typing import List
from app.models.member import MemberCreate
from app.models.trip import AIHealthRecommendation

def analyze_member_health(member: MemberCreate) -> AIHealthRecommendation:
    avoid = []
    recommended = []
    tips = []
    conditions = []

    # Age rules
    if member.age >= 65:
        conditions.append(f"Senior Citizen ({member.age} yrs)")
        avoid.extend(["Strenuous mountain trekking", "Long distance walking (>2 km)", "High altitude steep climbs"])
        recommended.extend(["Botanical Gardens", "Scenic Lake Boat Rides", "Heritage Bus/Car Tours", "Flat paved promenades"])
        tips.append("Schedule 20-minute rest intervals after 45 minutes of activity.")

    elif member.age <= 10:
        conditions.append(f"Child ({member.age} yrs)")
        avoid.extend(["Unprotected cliff edge views", "Late night excursions (>10 PM)", "Intense historical lectures"])
        recommended.extend(["Interactive Parks", "Science Centers / Aquariums", "Child-friendly dining", "Toy Train / Mini Railway"])
        tips.append("Ensure hydration and carry sun defense / rain wear.")

    # Medical Conditions
    if member.has_heart_disease:
        conditions.append("Heart Disease")
        avoid.extend(["High-altitude trekking", "Extreme adventure sports", "Rapid uphill walking", "Steep staircases"])
        recommended.extend(["Flat park walks", "Tea museum visits", "Scenic viewpoints with vehicle access"])
        tips.append("Keep emergency cardiac medications handy. Nearest emergency services mapped.")

    if member.has_asthma:
        conditions.append("Asthma")
        avoid.extend(["Dusty trails", "High smoke / bonfire zones", "Dense unventilated caves", "Extreme cold wind exposure"])
        recommended.extend(["Fresh pine forest walks", "Indoor art galleries", "Clean air gardens"])
        tips.append("Carry inhaler at all times and check live air quality index before outdoor tours.")

    if member.is_pregnant:
        conditions.append("Pregnancy")
        avoid.extend(["Bump-heavy off-road safaris", "Rollercoasters & adventure rides", "Water rafting", "Long continuous standing"])
        recommended.extend(["Relaxing botanical walks", "Local craft markets", "Comfortable café dining"])
        tips.append("Maintain comfortable posture and frequent hydration.")

    if member.uses_wheelchair or member.walking_ability in ["Minimal", "Wheelchair"]:
        conditions.append("Wheelchair / Limited Mobility")
        avoid.extend(["Cobblestone-only alleys", "Steep unpaved trails", "Locations without ramp access"])
        recommended.extend(["Wheelchair-accessible gardens", "Paved lakeview promenades", "Accessible museum exhibits"])
        tips.append("Confirm ramp & elevator availability before visiting secondary locations.")

    if member.has_diabetes or member.has_high_bp:
        conditions.append("Diabetes / High BP")
        tips.append("Plan timely meals to avoid glycemic drops. Carry quick snacks and water.")

    if member.no_medical_issues and not conditions:
        conditions.append("Good Health")
        recommended.extend(["All standard sightseeing, trekking, local food exploration & adventure activities"])
        tips.append("Enjoy full itinerary flexibility while staying hydrated.")

    summary = ", ".join(conditions) if conditions else "No major constraints"

    return AIHealthRecommendation(
        member_name=member.name,
        condition_summary=summary,
        avoid_activities=list(set(avoid)),
        recommended_activities=list(set(recommended)),
        special_care_tips=tips
    )

def evaluate_group_health(members: List[MemberCreate]) -> List[AIHealthRecommendation]:
    return [analyze_member_health(m) for m in members]
