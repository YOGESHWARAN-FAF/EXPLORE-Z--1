import traceback
from fastapi import APIRouter, Depends, HTTPException
from typing import List, Dict, Any
from app.models.trip import TripRequest, TripPlanResult
from app.services.weather_service import get_coordinates_for_destination, get_weather_forecast
from app.services.news_service import fetch_destination_news
from app.services.places_service import generate_destination_places
from app.services.groq_service import generate_ai_trip_plan
from app.core.security import get_current_user
from app.core.firebase import save_trip_to_firebase, get_saved_trips_from_firebase

router = APIRouter()

@router.post("/generate", response_model=TripPlanResult)
async def generate_trip_endpoint(trip_req: TripRequest, user: dict = Depends(get_current_user)):
    """
    1. Collect Destination, Boundary, Duration, Budget, Members & Health
    2. Fetch Geocode & Open-Meteo Weather
    3. Fetch GNews Alerts & Tourist Advisories
    4. Fetch Categorized Places (Tourist, Hotels, Restaurants, Bakeries, EV, Hospitals, Bus Stand, ATM, Parking)
    5. Evaluate Medical & Health rules for every group member
    6. Process with Groq AI (llama-3.1-8b-instant)
    7. Persist directly to Firebase Realtime Database
    """
    print(f"🚀 [API REQUEST /planner/generate] Generating trip for '{trip_req.destination}' | Members: {len(trip_req.members)} | Budget: ₹{trip_req.budget}")
    try:
        # Step 1: Geocode
        coords = await get_coordinates_for_destination(trip_req.destination)
        lat, lng = coords["latitude"], coords["longitude"]

        # Step 2: Weather & News
        weather = await get_weather_forecast(lat, lng)
        news_articles, news_summary = await fetch_destination_news(trip_req.destination)

        # Step 3: Places
        places = generate_destination_places(trip_req.destination, lat, lng)

        # Step 4: AI Generation via Groq LLM
        result = await generate_ai_trip_plan(trip_req, weather, news_articles, news_summary, places)

        # Persist directly to Firebase Realtime Database
        save_trip_to_firebase(result.model_dump())

        print(f"✅ [API RESPONSE /planner/generate] Trip generated successfully! Trip ID: {result.trip_id} | Safety Score: {result.safety_score}")
        return result

    except Exception as e:
        print(f"❌ [API ERROR /planner/generate] Trip generation failed:")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Trip generation error: {str(e)}")

@router.get("/saved", response_model=List[TripPlanResult])
async def get_saved_trips(user: dict = Depends(get_current_user)):
    """Reads saved trips directly from Firebase Realtime Database."""
    print("📥 [API REQUEST /planner/saved] Fetching saved trips from Firebase Realtime DB")
    try:
        fb_trips = get_saved_trips_from_firebase()
        if fb_trips:
            return [TripPlanResult(**t) for t in fb_trips]
        return []
    except Exception as e:
        print("❌ [API ERROR /planner/saved] Failed to fetch saved trips:")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Database query error: {str(e)}")

@router.get("/{trip_id}", response_model=TripPlanResult)
async def get_trip_by_id(trip_id: str, user: dict = Depends(get_current_user)):
    """Fetches a specific trip by ID from Firebase Realtime DB."""
    print(f"🔍 [API REQUEST /planner/{trip_id}] Querying trip from Firebase")
    try:
        fb_trips = get_saved_trips_from_firebase()
        for t in fb_trips:
            if t.get("trip_id") == trip_id:
                return TripPlanResult(**t)
        raise HTTPException(status_code=404, detail=f"Trip ID '{trip_id}' not found in Firebase Database")
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ [API ERROR /planner/{trip_id}] Fetch failed:")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Trip query error: {str(e)}")
