import traceback
from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Dict, Any
from app.models.tracking import MemberLocation, LocationUpdateRequest
from app.services.geofence_service import evaluate_group_tracking
from app.services.route_service import autocomplete_locations
from app.core.security import get_current_user
from app.core.firebase import update_live_location_in_firebase, get_group_locations_from_firebase

router = APIRouter()

@router.get("/autocomplete")
async def autocomplete_endpoint(query: str = Query(..., min_length=1)):
    """Provides Nominatim location search autocomplete for starting location & destination inputs."""
    try:
        results = await autocomplete_locations(query)
        return {"query": query, "suggestions": results}
    except Exception as e:
        print(f"❌ [API ERROR /location/autocomplete]: {e}")
        return {"query": query, "suggestions": []}

@router.post("/update")
async def update_member_location(data: LocationUpdateRequest, user: dict = Depends(get_current_user)):
    """Receives live GPS updates and syncs directly to Firebase Realtime Database."""
    print(f"📡 [API REQUEST /location/update] Member '{data.member_name}' ({data.member_id}) updating GPS: ({data.latitude}, {data.longitude})")
    try:
        loc = MemberLocation(
            member_id=data.member_id,
            member_name=data.member_name,
            latitude=data.latitude,
            longitude=data.longitude,
            battery_level=data.battery_level or 90
        )

        update_live_location_in_firebase(data.trip_id, loc.model_dump())

        fb_locs = get_group_locations_from_firebase(data.trip_id)
        parsed_locs = [MemberLocation(**m) for m in fb_locs.values()] if fb_locs else [loc]

        status_report = evaluate_group_tracking(parsed_locs, geofence_radius_km=5.0)

        return {
            "status": "success",
            "updated_member": loc,
            "group_summary": status_report
        }
    except Exception as e:
        print("❌ [API ERROR /location/update] GPS update failed:")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"GPS update error: {str(e)}")

@router.get("/group/{trip_id}")
async def get_group_live_status(trip_id: str, radius_km: float = 5.0, user: dict = Depends(get_current_user)):
    """Returns live locations, distance from centroid, missing member (>300m) alerts, and geofence alerts directly from Firebase Realtime DB."""
    print(f"📡 [API REQUEST /location/group/{trip_id}] Fetching group telemetry from Firebase")
    try:
        fb_locs = get_group_locations_from_firebase(trip_id)
        if fb_locs:
            parsed_locs = [MemberLocation(**m) for m in fb_locs.values()]
            return evaluate_group_tracking(parsed_locs, geofence_radius_km=radius_km)

        return evaluate_group_tracking([], geofence_radius_km=radius_km)
    except Exception as e:
        print(f"❌ [API ERROR /location/group/{trip_id}] Telemetry query failed:")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Location query error: {str(e)}")
