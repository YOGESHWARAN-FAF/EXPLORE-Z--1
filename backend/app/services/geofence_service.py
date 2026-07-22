import math
from typing import List, Dict, Tuple
from app.models.tracking import MemberLocation

def haversine_distance_meters(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculates distance between two lat/lng coordinates in meters using the Haversine formula."""
    R = 6371000.0 # Earth radius in meters
    d_lat = math.radians(lat2 - lat1)
    d_lon = math.radians(lon2 - lon1)
    a = (math.sin(d_lat / 2) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
         math.sin(d_lon / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return round(R * c, 2)

def calculate_group_centroid(locations: List[MemberLocation]) -> Tuple[float, float]:
    """Computes geometric average center coordinate for group members."""
    if not locations:
        return (0.0, 0.0)
    avg_lat = sum(loc.latitude for loc in locations) / len(locations)
    avg_lng = sum(loc.longitude for loc in locations) / len(locations)
    return (avg_lat, avg_lng)

def evaluate_group_tracking(
    locations: List[MemberLocation], 
    geofence_radius_km: float = 5.0
) -> Dict[str, Any]:
    """
    Evaluates group member locations:
    - Calculates distance from group center.
    - Sets is_missing = True if distance > 300 meters.
    - Sets is_outside_geofence = True if distance > radius boundary.
    - Returns updated member locations, centroid, missing count & alerts.
    """
    if not locations:
        return {
            "center": {"latitude": 0.0, "longitude": 0.0},
            "members": [],
            "missing_members": [],
            "geofence_breaches": [],
            "total_members": 0
        }

    center_lat, center_lng = calculate_group_centroid(locations)
    updated_members: List[MemberLocation] = []
    missing_members: List[Dict[str, Any]] = []
    geofence_breaches: List[Dict[str, Any]] = []

    geofence_limit_meters = geofence_radius_km * 1000.0

    for member in locations:
        dist = haversine_distance_meters(center_lat, center_lng, member.latitude, member.longitude)
        m_copy = member.model_copy()
        m_copy.distance_from_center = dist

        # Missing Member threshold: > 300 meters from group centroid
        if dist > 300.0:
            m_copy.is_missing = True
            missing_members.append({
                "member_id": m_copy.member_id,
                "member_name": m_copy.member_name,
                "distance_meters": dist,
                "latitude": m_copy.latitude,
                "longitude": m_copy.longitude
            })

        # Geofence boundary threshold
        if dist > geofence_limit_meters:
            m_copy.is_outside_geofence = True
            geofence_breaches.append({
                "member_id": m_copy.member_id,
                "member_name": m_copy.member_name,
                "distance_meters": dist,
                "limit_km": geofence_radius_km
            })

        updated_members.append(m_copy)

    return {
        "center": {"latitude": center_lat, "longitude": center_lng},
        "members": [m.model_dump() for m in updated_members],
        "missing_members": missing_members,
        "geofence_breaches": geofence_breaches,
        "total_members": len(updated_members),
        "missing_count": len(missing_members)
    }
