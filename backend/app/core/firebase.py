import json
import traceback
from datetime import datetime
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
            print(f"[FIREBASE INIT SUCCESS] Connected to Firebase Project: {cred_dict.get('project_id')} | Database: {settings.FIREBASE_DATABASE_URL}")
        except Exception as e:
            print(f"[FIREBASE INIT ERROR] Failed to initialize Firebase Admin SDK:")
            traceback.print_exc()
    else:
        print("[FIREBASE WARNING] No FIREBASE_CREDENTIALS_JSON provided.")

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

def save_trip_to_firebase(trip_dict: dict, user_uid: str = None):
    """Persists a complete AI generated trip plan to Firebase Realtime Database under global paths and user UID path."""
    if not _firebase_initialized:
        print("❌ [FIREBASE DB ERROR] Cannot save trip: Firebase Admin SDK not initialized")
        return
    try:
        trip_id = trip_dict.get("trip_id")
        if not trip_id:
            return

        # Create lightweight payload for Firebase RTDB to fit single request limits
        fb_payload = dict(trip_dict)

        # Downsample route_geometry array if too large for single RTDB request
        raw_geom = fb_payload.get("route_geometry") or []
        if isinstance(raw_geom, list) and len(raw_geom) > 150:
            step = max(1, len(raw_geom) // 150)
            sampled_geom = raw_geom[::step]
            if raw_geom[-1] not in sampled_geom:
                sampled_geom.append(raw_geom[-1])
            fb_payload["route_geometry"] = sampled_geom

        # Write to /trips/{trip_id}
        try:
            db.reference(f"trips/{trip_id}").set(fb_payload)
            print(f"✅ [FIREBASE DB] Trip {trip_id} written to /trips/{trip_id}")
        except Exception as e1:
            print(f"⚠️ [FIREBASE DB WARN] Could not write to /trips/{trip_id}: {e1}")

        # Write to /saved_trips/{trip_id}
        try:
            db.reference(f"saved_trips/{trip_id}").set(fb_payload)
            print(f"✅ [FIREBASE DB] Trip {trip_id} written to /saved_trips/{trip_id}")
        except Exception as e2:
            print(f"⚠️ [FIREBASE DB WARN] Could not write to /saved_trips/{trip_id}: {e2}")

        # Write to user UID path /users/{clean_uid}/searched_plans/{trip_id}
        if user_uid:
            clean_uid = user_uid.replace(".", "_")
            try:
                db.reference(f"users/{clean_uid}/searched_plans/{trip_id}").set(fb_payload)
                print(f"🔥 [FIREBASE USER UID DB] Saved trip search under user UID: /users/{clean_uid}/searched_plans/{trip_id}")
            except Exception as e3:
                print(f"⚠️ [FIREBASE USER DB WARN] Could not write to /users/{clean_uid}/searched_plans/{trip_id}: {e3}")

    except Exception as e:
        print(f"❌ [FIREBASE DB ERROR] Error in save_trip_to_firebase: {e}")

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

def get_user_search_history_from_firebase(user_uid: str) -> list:
    """Retrieves search history for a specific user UID directly from Firebase Realtime DB."""
    if not _firebase_initialized or not user_uid:
        print("❌ [FIREBASE DB ERROR] Cannot fetch user history: SDK not initialized or empty UID")
        return []
    try:
        clean_uid = user_uid.replace(".", "_")
        ref = db.reference(f"users/{clean_uid}/searched_plans")
        snapshot = ref.get()
        if snapshot and isinstance(snapshot, dict):
            history_list = list(snapshot.values())
            print(f"📥 [FIREBASE USER UID DB] Retrieved {len(history_list)} searched plans for UID '{user_uid}'")
            return history_list
    except Exception as e:
        print(f"❌ [FIREBASE DB ERROR] Error reading user history from /users/{user_uid}/searched_plans:")
        traceback.print_exc()
    return []

def save_chat_session_to_firebase(user_uid: str, session_dict: dict):
    """Persists a complete AI chat session under /users/{clean_uid}/chat_sessions/{session_id} in Firebase Realtime DB."""
    if not _firebase_initialized or not user_uid or not session_dict:
        return
    try:
        clean_uid = user_uid.replace(".", "_")
        session_id = session_dict.get("id") or f"session_{int(datetime.now().timestamp() * 1000)}"
        ref_path = f"users/{clean_uid}/chat_sessions/{session_id}"
        db.reference(ref_path).set(session_dict)
        print(f"🔥 [FIREBASE CHAT DB] Saved chat session {session_id} to /{ref_path}")
    except Exception as e:
        print(f"❌ [FIREBASE DB ERROR] Error saving chat session: {e}")

def get_user_chat_sessions_from_firebase(user_uid: str) -> list:
    """Retrieves all saved chat sessions for a specific user UID from Firebase Realtime DB."""
    if not _firebase_initialized or not user_uid:
        return []
    try:
        clean_uid = user_uid.replace(".", "_")
        ref = db.reference(f"users/{clean_uid}/chat_sessions")
        snapshot = ref.get()
        if snapshot and isinstance(snapshot, dict):
            sessions_list = list(snapshot.values())
            sessions_list.sort(key=lambda x: x.get("updated_at", ""), reverse=True)
            print(f"📥 [FIREBASE CHAT DB] Retrieved {len(sessions_list)} chat sessions for UID '{user_uid}'")
            return sessions_list
    except Exception as e:
        print(f"❌ [FIREBASE DB ERROR] Error reading chat sessions: {e}")
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

def get_cached_poi_data_from_firebase(cache_key: str) -> dict:
    """Reads shared route POI data from Firebase Realtime DB under /common_poi_cache/{cache_key} for all users."""
    if not _firebase_initialized or not cache_key:
        return None
    try:
        clean_key = cache_key.lower().replace(" ", "_").replace("/", "_")
        ref = db.reference(f"common_poi_cache/{clean_key}")
        snapshot = ref.get()
        if snapshot and isinstance(snapshot, dict):
            print(f"⚡ [FIREBASE COMMON CACHE HIT] Reusing cached route POI data for key: '{clean_key}'")
            return snapshot
    except Exception as e:
        print(f"⚠️ [FIREBASE CACHE WARN] Could not read POI cache for {cache_key}: {e}")
    return None

def save_cached_poi_data_to_firebase(cache_key: str, poi_data: dict):
    """Saves route POI data to Firebase Realtime DB under /common_poi_cache/{cache_key} so all users reuse it without repeat API calls."""
    if not _firebase_initialized or not cache_key:
        return
    try:
        clean_key = cache_key.lower().replace(" ", "_").replace("/", "_")
        ref = db.reference(f"common_poi_cache/{clean_key}")
        ref.set(poi_data)
        print(f"💾 [FIREBASE COMMON CACHE WRITE] Cached shared route POI data for key: '{clean_key}'")
    except Exception as e:
        print(f"⚠️ [FIREBASE CACHE WARN] Could not write POI cache for {cache_key}: {e}")

