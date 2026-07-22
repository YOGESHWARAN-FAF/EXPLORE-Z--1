import json
import traceback
import firebase_admin
from firebase_admin import credentials, auth, db
from app.core.config import settings

_firebase_initialized = False

def init_firebase():
    global _firebase_initialized
    if _firebase_initialized:
        return
    
    if settings.FIREBASE_CREDENTIALS_JSON:
        try:
            cred_dict = json.loads(settings.FIREBASE_CREDENTIALS_JSON)
            cred = credentials.Certificate(cred_dict)
            firebase_admin.initialize_app(cred, {
                'databaseURL': settings.FIREBASE_DATABASE_URL
            })
            _firebase_initialized = True
            print(f"🔥 [FIREBASE INIT SUCCESS] Connected to Firebase Project: {cred_dict.get('project_id')} | Database: {settings.FIREBASE_DATABASE_URL}")
        except Exception as e:
            print(f"❌ [FIREBASE INIT ERROR] Failed to initialize Firebase Admin SDK:")
            traceback.print_exc()
    else:
        print("⚠️ [FIREBASE WARNING] No FIREBASE_CREDENTIALS_JSON provided.")

init_firebase()

def verify_firebase_id_token(token: str) -> dict:
    """Strictly verifies Firebase ID token using Firebase Admin Auth."""
    if not token or len(token) < 10:
        raise ValueError("Missing or invalid token format")
        
    if _firebase_initialized:
        try:
            decoded_token = auth.verify_id_token(token)
            print(f"🔑 [FIREBASE AUTH VERIFIED] Token verified for UID: {decoded_token.get('uid')} | Email: {decoded_token.get('email')}")
            return decoded_token
        except Exception as e:
            print(f"❌ [FIREBASE AUTH ERROR] ID Token verification failed: {e}")
            traceback.print_exc()
            raise ValueError(f"Invalid Firebase Token: {str(e)}")
    
    raise ValueError("Firebase Admin SDK is not initialized")

# --- Real Realtime Database Operations ---

def save_trip_to_firebase(trip_dict: dict):
    """Persists a complete AI generated trip plan to Firebase Realtime Database."""
    if not _firebase_initialized:
        print("❌ [FIREBASE DB ERROR] Cannot save trip: Firebase Admin SDK not initialized")
        return
    try:
        trip_id = trip_dict.get("trip_id")
        if trip_id:
            ref = db.reference(f"trips/{trip_id}")
            ref.set(trip_dict)
            saved_ref = db.reference(f"saved_trips/{trip_id}")
            saved_ref.set(trip_dict)
            print(f"✅ [FIREBASE DB] Trip {trip_id} written to /trips/{trip_id} & /saved_trips/{trip_id}")
    except Exception as e:
        print(f"❌ [FIREBASE DB ERROR] Error writing trip {trip_dict.get('trip_id')} to Firebase Realtime DB:")
        traceback.print_exc()

def get_saved_trips_from_firebase() -> list:
    """Retrieves saved trips directly from Firebase Realtime DB."""
    if not _firebase_initialized:
        print("❌ [FIREBASE DB ERROR] Cannot fetch trips: Firebase Admin SDK not initialized")
        return []
    try:
        ref = db.reference("saved_trips")
        snapshot = ref.get()
        if snapshot and isinstance(snapshot, dict):
            trips_list = list(snapshot.values())
            print(f"📥 [FIREBASE DB] Retrieved {len(trips_list)} saved trips from /saved_trips")
            return trips_list
    except Exception as e:
        print("❌ [FIREBASE DB ERROR] Error reading trips from Firebase Realtime DB:")
        traceback.print_exc()
    return []

def update_live_location_in_firebase(trip_id: str, location_dict: dict):
    """Updates member live GPS location in Firebase Realtime DB under /live_locations/{trip_id}/{member_id}."""
    if not _firebase_initialized:
        return
    try:
        member_id = location_dict.get("member_id")
        if trip_id and member_id:
            ref = db.reference(f"live_locations/{trip_id}/{member_id}")
            ref.set(location_dict)
            print(f"📍 [FIREBASE DB] GPS updated for {location_dict.get('member_name')} in /live_locations/{trip_id}/{member_id}")
    except Exception as e:
        print(f"❌ [FIREBASE DB ERROR] Error updating live location in Firebase:")
        traceback.print_exc()

def get_group_locations_from_firebase(trip_id: str) -> dict:
    """Fetches all member live GPS locations for a trip from Firebase Realtime DB."""
    if not _firebase_initialized:
        return {}
    try:
        ref = db.reference(f"live_locations/{trip_id}")
        snapshot = ref.get()
        if snapshot and isinstance(snapshot, dict):
            print(f"📡 [FIREBASE DB] Retrieved {len(snapshot)} live member locations for trip {trip_id}")
            return snapshot
    except Exception as e:
        print(f"❌ [FIREBASE DB ERROR] Error fetching group locations from Firebase:")
        traceback.print_exc()
    return {}

def trigger_sos_in_firebase(sos_dict: dict):
    """Logs emergency SOS alert to Firebase Realtime DB under /emergency_sos/{trip_id}."""
    if not _firebase_initialized:
        return
    try:
        trip_id = sos_dict.get("trip_id")
        if trip_id:
            ref = db.reference(f"emergency_sos/{trip_id}").push()
            ref.set(sos_dict)
            print(f"🚨 [FIREBASE DB] Emergency SOS alert pushed to /emergency_sos/{trip_id}")
    except Exception as e:
        print("❌ [FIREBASE DB ERROR] Error logging SOS to Firebase:")
        traceback.print_exc()
