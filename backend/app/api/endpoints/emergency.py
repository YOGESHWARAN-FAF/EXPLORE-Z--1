import traceback
from fastapi import APIRouter, Depends, HTTPException
from app.models.tracking import SOSAlert
from app.services.places_service import generate_destination_places
from app.core.security import get_current_user
from app.core.firebase import trigger_sos_in_firebase

router = APIRouter()

@router.post("/sos")
async def trigger_sos_alert(alert: SOSAlert, user: dict = Depends(get_current_user)):
    """Triggers Emergency SOS, syncs to Firebase Realtime DB, and logs panic event to terminal."""
    print(f"🚨🚨🚨 [EMERGENCY SOS DISPATCH] Triggered by '{alert.member_name}' ({alert.member_id}) at coordinates: ({alert.latitude}, {alert.longitude})")
    try:
        alert.is_sos_active = True

        # Sync to Firebase Realtime DB
        trigger_sos_in_firebase(alert.model_dump())

        places = generate_destination_places("Destination", alert.latitude, alert.longitude)
        hospitals = [p for p in places if p.category == "Hospital"]
        police = [p for p in places if p.category == "Police Station"]
        pharmacies = [p for p in places if p.category == "Medical Shop"]

        return {
            "status": "SOS_BROADCAST_ACTIVE",
            "alert": alert,
            "message": f"EMERGENCY BROADCAST SENT for {alert.member_name}! Nearest emergency services alerted.",
            "nearest_hospitals": hospitals[:2],
            "nearest_police": police[:1],
            "nearest_pharmacies": pharmacies[:2]
        }
    except Exception as e:
        print("❌ [API ERROR /emergency/sos] Emergency SOS dispatch failed:")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"SOS dispatch error: {str(e)}")
