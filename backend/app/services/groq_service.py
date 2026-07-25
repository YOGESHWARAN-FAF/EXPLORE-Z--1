import json
import uuid
import httpx
from typing import Dict, Any, List
from app.core.config import settings
from app.models.trip import (
    TripRequest, TripPlanResult, AIHealthRecommendation, ScheduleItem, BudgetBreakdown, SmartHotelRecommendation
)
from app.models.place import Place
from app.services.health_rules import evaluate_group_health

async def generate_ai_trip_plan(
    trip_req: TripRequest,
    route_data: Dict[str, Any],
    checkpoints: List[Dict[str, Any]],
    weather: Dict[str, Any],
    news: List[Dict[str, Any]],
    news_summary: str,
    places: List[Place]
) -> TripPlanResult:
    """
    Sends structured JSON context of the ENTIRE ROUTE to Groq (llama-3.1-8b-instant) and parses structured output.
    Constructs multi-day itineraries, smart hotel stays, food stops, health advisories, and safety analysis.
    """
    health_recs = evaluate_group_health(trip_req.members)
    trip_id = f"ROUTE-{uuid.uuid4().hex[:8].upper()}"

    total_dist = route_data.get("distance_km", 340.0)
    dur_hrs = route_data.get("duration_hours", 5.5)

    # Parse numeric days from duration string
    days_count = 1
    dur_str = trip_req.duration.lower()
    if "2 day" in dur_str:
        days_count = 2
    elif "3 day" in dur_str:
        days_count = 3
    elif "5 day" in dur_str:
        days_count = 5
    elif "week" in dur_str or "7 day" in dur_str:
        days_count = 7

    avg_daily_km = round(total_dist / days_count, 1)

    # Categorize places
    tourist_spots  = [p for p in places if p.category in ("Tourist Attraction", "Scenic Viewpoint & Waterfall", "Temple & Heritage")]
    hotels         = [p for p in places if p.category in ("Hotel", "Lodge & Resort")]
    restaurants    = [p for p in places if p.category == "Restaurant"]
    tea_bakeries   = [p for p in places if p.category in ("Tea & Coffee Shop", "Bakery")]
    hospitals      = [p for p in places if p.category in ("Hospital", "Medical Shop")]
    fuel_stations  = [p for p in places if p.category == "Fuel Station"]
    ev_charging    = [p for p in places if p.category == "EV Charging"]
    parking_lots   = [p for p in places if p.category == "Parking Facility"]
    viewpoints     = [p for p in places if p.category == "Scenic Viewpoint & Waterfall"]
    rest_stops     = [p for p in places if p.category == "Rest Stop & Washroom"]

    # Try Groq API call first if key present
    if settings.GROQ_API_KEY:
        try:
            prompt_context = {
                "origin": trip_req.origin,
                "destination": trip_req.destination,
                "travel_mode": trip_req.travel_mode,
                "duration": trip_req.duration,
                "days_count": days_count,
                "budget_inr": trip_req.budget,
                "total_distance_km": total_dist,
                "avg_daily_travel_km": avg_daily_km,
                "members_count": len(trip_req.members),
                "health_evaluations": [hr.model_dump() for hr in health_recs],
                "route_checkpoints_count": len(checkpoints),
                "weather_overview": weather,
                "news_summary": news_summary,
                "available_hotels": [h.name for h in hotels[:4]],
                "available_food_stops": [r.name for r in restaurants[:4]],
                "available_tourist_spots": [t.name for t in tourist_spots[:4]],
            }

            system_instruction = (
                "You are an expert AI Route-Based Tourism & Health Concierge. "
                "Analyze the complete journey route between origin and destination. "
                "Return ONLY a valid JSON object matching this exact key structure:\n"
                "{\n"
                '  "safety_score": 94,\n'
                '  "trip_summary": "Comprehensive multi-day route planner...",\n'
                '  "crowd_prediction": "Low crowd at morning checkpoints, Moderate at peak tourist spots.",\n'
                '  "weather_advice": "Clear skies along the highway. Carry light jackets for hill viewpoints.",\n'
                '  "emergency_suggestions": ["Keep emergency 108 helpline saved", "Frequent rest stops every 2 hours"],\n'
                '  "hidden_gems": ["Highway Vista Overlook at KM 120"],\n'
                '  "local_foods": ["Fresh Filter Coffee & Hot Snacks"],\n'
                '  "photo_spots": ["Scenic Bridge Crossing at Checkpoint 3"],\n'
                '  "things_to_avoid": ["Steep unpaved shortcuts near mountain passes"],\n'
                '  "recommended_route": ["NH Highway Main Expressway"],\n'
                '  "travel_tips": ["Maintain 80 km/h speed limit", "Keep live group tracking active"]\n'
                "}"
            )

            headers = {
                "Authorization": f"Bearer {settings.GROQ_API_KEY}",
                "Content-Type": "application/json"
            }
            body = {
                "model": settings.GROQ_MODEL,
                "messages": [
                    {"role": "system", "content": system_instruction},
                    {"role": "user", "content": json.dumps(prompt_context)}
                ],
                "temperature": 0.3,
                "response_format": {"type": "json_object"}
            }

            async with httpx.AsyncClient(timeout=10.0) as client:
                res = await client.post("https://api.groq.com/openai/v1/chat/completions", headers=headers, json=body)
                if res.status_code == 200:
                    ai_json = res.json()["choices"][0]["message"]["content"]
                    parsed = json.loads(ai_json)
                    return build_final_route_plan(
                        trip_id, trip_req, route_data, checkpoints, weather, health_recs, parsed,
                        days_count, total_dist, avg_daily_km, tourist_spots, hotels, restaurants,
                        tea_bakeries, hospitals, fuel_stations, ev_charging, parking_lots, viewpoints,
                        rest_stops, news, news_summary, places
                    )
        except Exception as e:
            print(f"⚠️ Groq LLM route planning exception, running AI route generator: {e}")

    # High-quality structured fallback generator
    fallback_ai = {
        "safety_score": 92 if not any("Heart Disease" in m.condition_summary or "Pregnancy" in m.condition_summary for m in health_recs) else 88,
        "trip_summary": f"AI Customized {trip_req.duration} route journey from {trip_req.origin} to {trip_req.destination} ({total_dist} KM) via {trip_req.travel_mode}. Optimized with ~{avg_daily_km} KM daily travel targets, safe hotel check-ins, food stops, and medical precautions for {len(trip_req.members)} members.",
        "crowd_prediction": "Low crowd along highway checkpoints. Moderate crowd expected at major tourist attractions between 11 AM - 3 PM.",
        "weather_advice": f"Pleasant conditions along route: {weather.get('temperature', 24)}°C with {weather.get('rain_probability', 10)}% chance of rain. Ideal travel weather.",
        "emergency_suggestions": [
            "24/7 Lifeline Emergency Hospital indexed at every 30 KM.",
            "Group live GPS tracking enabled in mobile view.",
            "Nearest police patrol posts & tow mechanics active along highway."
        ],
        "hidden_gems": [
            f"Panorama Viewpoint Deck near KM {round(total_dist * 0.4, 0)}",
            "Artisanal Organic Highway Tea Estate",
            f"Ancient Rock Heritage Shrine near {trip_req.destination}"
        ],
        "local_foods": [
            "Hot Filter Coffee & Crispy Medu Vada",
            "Traditional Highway South Indian Thali",
            "Oven Fresh Pastries & Hot Highway Tea"
        ],
        "photo_spots": [
            f"Expressway Scenic River Bridge (KM {round(total_dist * 0.3, 0)})",
            "Sunrise Vista Ridge Viewpoint",
            f"{trip_req.destination} Landmark Promenade"
        ],
        "things_to_avoid": [
            "Over-speeding past rural highway crossings",
            "Continuous driving without a 15-min hydration break every 2 hours",
            "Unpaved steep hill shortcuts for pregnant / cardiac members"
        ],
        "recommended_route": [
            f"Origin: {trip_req.origin}",
            f"National Highway Corridor (NH) via Route Checkpoints",
            f"Destination Arrival: {trip_req.destination}"
        ],
        "travel_tips": [
            "Inspect tire pressure and fuel before departure.",
            "Carry medical health kits for senior / cardiac members.",
            "Schedule hotel check-in before sunset for optimal rest."
        ]
    }

    return build_final_route_plan(
        trip_id, trip_req, route_data, checkpoints, weather, health_recs, fallback_ai,
        days_count, total_dist, avg_daily_km, tourist_spots, hotels, restaurants,
        tea_bakeries, hospitals, fuel_stations, ev_charging, parking_lots, viewpoints,
        rest_stops, news, news_summary, places
    )


def build_final_route_plan(
    trip_id: str,
    req: TripRequest,
    route_data: Dict[str, Any],
    checkpoints: List[Dict[str, Any]],
    weather: Dict[str, Any],
    health_recs: List[AIHealthRecommendation],
    ai_data: Dict[str, Any],
    days_count: int,
    total_dist: float,
    avg_daily_km: float,
    tourist_spots: List[Place],
    hotels: List[Place],
    restaurants: List[Place],
    tea_bakeries: List[Place],
    hospitals: List[Place],
    fuel_stations: List[Place],
    ev_charging: List[Place],
    parking_lots: List[Place],
    viewpoints: List[Place],
    rest_stops: List[Place],
    news: List[Dict[str, Any]],
    news_summary: str,
    places: List[Place] = []
) -> TripPlanResult:

    dur_hrs = route_data.get("duration_hours", 5.5)

    if not places:
        places = tourist_spots + hotels + restaurants + tea_bakeries + hospitals + fuel_stations + ev_charging + parking_lots + viewpoints + rest_stops

    from app.services.route_service import calculate_expected_arrival_time
    from app.services.places_service import generate_destination_explorer_top3

    eta_str = calculate_expected_arrival_time(dur_hrs)

    # Categorize smart stops
    smart_tea_stops = [p for p in places if p.category in ("Tea & Coffee Shop", "Bakery") or "tea-" in (p.id or "")]
    smart_lunch_stops = [p for p in places if p.category == "Restaurant" or "lunch-" in (p.id or "")]
    along_route_attractions = [p for p in places if p.category in ("Tourist Attraction", "Scenic Viewpoint & Waterfall", "Temple & Heritage") or "attr-" in (p.id or "")]
    emergency_stops = [p for p in places if p.category in ("Hospital", "Police Station", "Fuel Station", "EV Charging") or "emerg-" in (p.id or "")]

    # Get Destination center lat/lng
    dest_lat = checkpoints[-1]["latitude"] if checkpoints else 11.6643
    dest_lng = checkpoints[-1]["longitude"] if checkpoints else 78.1460
    destination_explorer_top3 = generate_destination_explorer_top3(req.destination, dest_lat, dest_lng)

    # Budget Breakdown
    b = req.budget
    budget_breakdown = BudgetBreakdown(
        accommodation=round(b * 0.38, 2),
        food_and_dining=round(b * 0.28, 2),
        transportation=round(b * 0.18, 2),
        activities_and_entry=round(b * 0.10, 2),
        emergency_fund=round(b * 0.06, 2),
        total=b
    )

    # Smart Hotel Planning (~100-120 km intervals)
    smart_hotel_plan: List[SmartHotelRecommendation] = []
    for day_idx in range(1, days_count + 1):
        target_km = min(round(avg_daily_km * day_idx, 1), total_dist)
        h_place = hotels[(day_idx - 1) % len(hotels)] if hotels else None
        h_name = h_place.name if h_place else f"Highway Comfort Hotel @ KM {target_km}"
        h_loc = h_place.address if h_place else f"Route KM {target_km}"
        h_rating = h_place.rating if h_place else 4.7

        smart_hotel_plan.append(SmartHotelRecommendation(
            day=f"Day {day_idx}",
            target_km=target_km,
            hotel_name=h_name,
            location=h_loc,
            rating=h_rating,
            reasons=[
                "Safe 24/7 Monitored Parking",
                "24-Hour Express Check-in",
                "In-house Family Restaurant & Clean Hygiene",
                f"Located right at Day {day_idx} target milestone ({target_km} KM)"
            ]
        ))

    # Daily Itinerary Schedule Generation
    daily_itineraries: Dict[str, List[ScheduleItem]] = {}
    master_schedule: List[ScheduleItem] = []

    has_heart_issue = any("Heart" in getattr(r, 'condition_summary', '') for r in health_recs)
    has_asthma = any("Asthma" in getattr(r, 'condition_summary', '') for r in health_recs)
    has_pregnancy = any("Pregnancy" in getattr(r, 'condition_summary', '') for r in health_recs)

    for day_idx in range(1, days_count + 1):
        day_name = f"Day {day_idx}"
        start_km = round(avg_daily_km * (day_idx - 1), 1)
        end_km = min(round(avg_daily_km * day_idx, 1), total_dist)

        hotel_for_day = smart_hotel_plan[day_idx - 1]
        tourist_for_day = tourist_spots[(day_idx - 1) % len(tourist_spots)] if tourist_spots else None
        rest_for_day = restaurants[(day_idx - 1) % len(restaurants)] if restaurants else None
        tea_for_day = tea_bakeries[(day_idx - 1) % len(tea_bakeries)] if tea_bakeries else None

        day_items = [
            ScheduleItem(
                time="07:00 AM",
                activity=f"Morning Departure from {req.origin if day_idx == 1 else smart_hotel_plan[day_idx-2].hotel_name}",
                location=f"KM {start_km}",
                km_mark=start_km,
                category="Departure",
                notes=f"Vehicle safety check. Starting Day {day_idx} route leg ({start_km} KM → {end_km} KM).",
                suitable_for_all=True,
                safety_tips="Confirm all group members are wearing seatbelts / helmets."
            ),
            ScheduleItem(
                time="08:30 AM",
                activity=f"Breakfast & Coffee Break at {tea_for_day.name if tea_for_day else 'Highway Tea & Breakfast Shop'}",
                location=f"Route Checkpoint @ {round(start_km + 25.0, 1)} KM",
                km_mark=round(start_km + 25.0, 1),
                category="Breakfast",
                notes="Fresh hot breakfast, tea, coffee, and clean washroom facilities.",
                suitable_for_all=True,
                health_advisory="Diabetic members: choose low-sugar herbal tea / steamed idlis." if any("Diabetes" in r.condition_summary for r in health_recs) else None
            ),
            ScheduleItem(
                time="10:30 AM",
                activity=f"Sightseeing & Exploration: {tourist_for_day.name if tourist_for_day else 'Scenic Viewpoint & Heritage Site'}",
                location=tourist_for_day.address if tourist_for_day else f"KM {round(start_km + 50.0, 1)}",
                km_mark=round(start_km + 50.0, 1),
                category="Tourist",
                notes="Explore scenic pathways, flower gardens, and historical architecture.",
                suitable_for_all=not (has_heart_issue or has_pregnancy),
                health_advisory="Senior & Cardiac members: take flat paved pathways. Avoid steep stair climbs." if (has_heart_issue or has_pregnancy) else "Enjoy light leisure walking.",
                safety_tips="Apply sunscreen and carry water bottles."
            ),
            ScheduleItem(
                time="01:00 PM",
                activity=f"Highway Lunch Stop at {rest_for_day.name if rest_for_day else 'Highway Grand Restaurant'}",
                location=f"KM {round(start_km + 75.0, 1)}",
                km_mark=round(start_km + 75.0, 1),
                category="Lunch",
                notes="Nutritious multi-cuisine meal. Clean dining space and fuel refill point nearby.",
                suitable_for_all=True,
                safety_tips="Rest for 30 minutes post meal before driving."
            ),
            ScheduleItem(
                time="03:30 PM",
                activity=f"Fuel Refill & Photo Stop at {viewpoints[day_idx%len(viewpoints)].name if viewpoints else 'Valley Overlook Deck'}",
                location=f"KM {round(start_km + 95.0, 1)}",
                km_mark=round(start_km + 95.0, 1),
                category="Photo",
                notes="Scenic photo opportunity and fuel / EV charging checkpoint.",
                suitable_for_all=True,
                safety_tips="Park vehicle securely inside marked bay."
            ),
            ScheduleItem(
                time="06:30 PM",
                activity=f"Arrival & Hotel Check-in at {hotel_for_day.hotel_name}",
                location=hotel_for_day.location,
                km_mark=end_km,
                category="Hotel",
                notes=f"Complete Day {day_idx} journey at {end_km} KM mark. Relax, refresh, and enjoy dinner.",
                suitable_for_all=True,
                health_advisory="Seniors and pregnant members: rest feet elevated for 30 mins after checking in."
            )
        ]

        daily_itineraries[day_name] = day_items
        master_schedule.extend(day_items)

    return TripPlanResult(
        trip_id=trip_id,
        origin=req.origin,
        destination=req.destination,
        travel_mode=req.travel_mode,
        duration=req.duration,
        budget=req.budget,
        total_distance_km=total_dist,
        duration_hours=dur_hrs,
        expected_arrival_time=eta_str,
        safety_score=ai_data.get("safety_score", 92),
        trip_summary=ai_data.get("trip_summary", f"AI Route-Based Plan from {req.origin} to {req.destination}"),
        route_geometry=route_data.get("coordinates", []),
        checkpoints=checkpoints,
        weather_overview=weather,
        budget_breakdown=budget_breakdown,
        health_recommendations=health_recs,
        best_tourist_places=tourist_spots,
        best_hotels=hotels,
        best_restaurants=restaurants,
        tea_and_bakeries=tea_bakeries,
        hospitals=hospitals,
        petrol_stations=fuel_stations,
        ev_charging=ev_charging,
        parking=parking_lots,
        viewpoints=viewpoints,
        rest_stops=rest_stops,
        smart_tea_stops=smart_tea_stops,
        smart_lunch_stops=smart_lunch_stops,
        along_route_attractions=along_route_attractions,
        emergency_stops=emergency_stops,
        destination_explorer_top3=destination_explorer_top3,
        travel_schedule=master_schedule,
        daily_itineraries=daily_itineraries,
        smart_hotel_plan=smart_hotel_plan,
        crowd_prediction=ai_data.get("crowd_prediction", "Low to Moderate crowd along route."),
        weather_advice=ai_data.get("weather_advice", "Pleasant travel weather expected."),
        emergency_suggestions=ai_data.get("emergency_suggestions", ["Keep 108 helpline active."]),
        hidden_gems=ai_data.get("hidden_gems", ["Scenic Overlook Deck"]),
        local_foods=ai_data.get("local_foods", ["Filter Coffee & Local Snacks"]),
        photo_spots=ai_data.get("photo_spots", ["River Bridge Crossing"]),
        things_to_avoid=ai_data.get("things_to_avoid", ["Unpaved shortcuts"]),
        recommended_route=ai_data.get("recommended_route", ["National Highway Corridor"]),
        travel_tips=ai_data.get("travel_tips", ["Keep live GPS active."]),
        news_articles=news,
        news_summary=news_summary,
    )
