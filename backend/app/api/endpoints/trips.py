import traceback
from fastapi import APIRouter, Depends, HTTPException
from typing import List, Dict, Any
from app.models.trip import TripRequest, TripPlanResult
from app.services.route_service import geocode_location, fetch_osrm_route, sample_checkpoints_along_route
from app.services.weather_service import get_weather_forecast
from app.services.news_service import fetch_destination_news
from app.services.places_service import generate_route_checkpoint_places
from app.services.groq_service import generate_ai_trip_plan
from app.core.firebase import (
    save_trip_to_firebase, get_saved_trips_from_firebase,
    get_cached_poi_data_from_firebase, save_cached_poi_data_to_firebase
)
from app.core.security import get_current_user
from app.models.place import Place

router = APIRouter()

@router.post("/generate", response_model=TripPlanResult)
async def generate_trip_endpoint(trip_req: TripRequest, user: dict = Depends(get_current_user)):
    """
    1. Geocode Origin (FROM) and Destination (TO) into GPS coordinates.
    2. Generate complete route geometry via OSRM / route service.
    3. Sample checkpoints every 5-10 km along the route.
    4. Check shared Firebase common POI cache to eliminate duplicate API calls across all users.
    5. Fetch Open-Meteo Weather along route and GNews for cities along route.
    6. Evaluate Medical & Health rules for all team members.
    7. Process structured JSON with Groq LLM (llama-3.1-8b-instant).
    8. Save result to Firebase Realtime DB and return.
    """
    origin_name = trip_req.origin or "Chennai"
    dest_name = trip_req.destination or "Salem"

    print(f"🚀 [API REQUEST /planner/generate] Route trip: '{origin_name}' → '{dest_name}' | Mode: {trip_req.travel_mode} | Duration: {trip_req.duration} | Members: {len(trip_req.members)} | Budget: ₹{trip_req.budget}")
    try:
        # Step 1: Geocode Origin & Destination
        origin_geo = await geocode_location(origin_name)
        dest_geo = await geocode_location(dest_name)

        # Step 2: Route Generation via OSRM
        route_data = await fetch_osrm_route(
            origin_geo["latitude"], origin_geo["longitude"],
            dest_geo["latitude"], dest_geo["longitude"],
            mode=trip_req.travel_mode
        )

        # Step 3: Sample Checkpoints every 7.5 km
        checkpoints = sample_checkpoints_along_route(
            route_data["coordinates"], route_data["distance_km"], interval_km=7.5
        )

        # Step 4: Shared Firebase Common POI Cache Check
        cache_key = f"{origin_name.strip().lower()}_{dest_name.strip().lower()}"
        cached_places_raw = get_cached_poi_data_from_firebase(cache_key)

        if cached_places_raw and isinstance(cached_places_raw, list) and len(cached_places_raw) > 0:
            print(f"⚡ [FIREBASE COMMON CACHE] Reusing {len(cached_places_raw)} cached POIs for route '{origin_name}' → '{dest_name}' across all users.")
            places = [Place(**p) for p in cached_places_raw]
        else:
            places = generate_route_checkpoint_places(
                origin_name, dest_name, checkpoints, route_data["distance_km"]
            )
            # Save to shared Firebase common cache for all users
            save_cached_poi_data_to_firebase(cache_key, [p.model_dump() for p in places])

        # Step 5: Weather forecast & News
        weather = await get_weather_forecast(dest_geo["latitude"], dest_geo["longitude"])
        news_articles, news_summary, _ = await fetch_destination_news(dest_name)

        # Step 6: Groq LLM Generation
        result = await generate_ai_trip_plan(
            trip_req, route_data, checkpoints, weather, news_articles, news_summary, places
        )

        # Persist directly to Firebase Realtime Database
        save_trip_to_firebase(result.model_dump())

        print(f"✅ [API RESPONSE /planner/generate] Route trip generated! Trip ID: {result.trip_id} | Total Dist: {result.total_distance_km} KM | Safety: {result.safety_score}")
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
