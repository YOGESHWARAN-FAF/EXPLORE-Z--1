import math
import httpx
import traceback
from typing import List, Dict, Any, Tuple

# Fallback coordinates dictionary for Indian & popular travel destinations
KNOWN_COORDINATES: Dict[str, Tuple[float, float]] = {
    "chennai": (13.0827, 80.2707),
    "salem": (11.6643, 78.1460),
    "vagamon": (9.6892, 76.9060),
    "munnar": (10.0889, 77.0595),
    "kodaikanal": (10.2381, 77.4892),
    "ooty": (11.4102, 76.6950),
    "yercaud": (11.7753, 78.2093),
    "coimbatore": (11.0168, 76.9558),
    "bangalore": (12.9716, 77.5946),
    "bengaluru": (12.9716, 77.5946),
    "mysore": (12.2958, 76.6394),
    "mysuru": (12.2958, 76.6394),
    "kochi": (9.9312, 76.2673),
    "cochin": (9.9312, 76.2673),
    "madurai": (9.9252, 78.1198),
    "trichy": (10.7905, 78.7047),
    "tiruchirappalli": (10.7905, 78.7047),
    "pondicherry": (11.9416, 79.8083),
    "puducherry": (11.9416, 79.8083),
    "wayanad": (11.6854, 76.1320),
    "alleppey": (9.4981, 76.3388),
    "alappuzha": (9.4981, 76.3388),
    "thekkady": (9.6024, 77.1639),
    "kumarakom": (9.6175, 76.4301),
    "varkala": (8.7379, 76.7163),
    "coorg": (12.4244, 75.7382),
    "madikeri": (12.4244, 75.7382),
    "chikmagalur": (13.3161, 75.7720),
    "gokarna": (14.5479, 74.3188),
    "hampi": (15.3350, 76.4600),
    "goa": (15.2993, 74.1240),
    "kanyakumari": (8.0883, 77.5385),
    "mumbai": (19.0760, 72.8777),
    "delhi": (28.6139, 77.2090),
    "hyderabad": (17.3850, 78.4867),
    "vellore": (12.9165, 79.1325),
    "hosur": (12.7409, 77.8253),
    "dharmapuri": (12.1211, 78.1582),
    "krishnagiri": (12.5266, 78.2144),
    "erode": (11.3410, 77.7172),
    "karur": (10.9601, 78.0766),
    "namakkal": (11.2189, 78.1674),
    "dindigul": (10.3673, 77.9803),
    "tirunelveli": (8.7139, 77.7567),
    "thanjavur": (10.7870, 79.1378),
    "rameshwaram": (9.2876, 79.3129),
    "mahabalipuram": (12.6269, 80.1927),
}

async def geocode_location(query: str) -> Dict[str, Any]:
    """Converts location name to (lat, lng, display_name) with India country bias & fast fallback."""
    clean_q = query.strip()
    q_lower = clean_q.lower()

    # 1. First check KNOWN_COORDINATES for exact/alias match to prevent foreign geocoding
    for key, (lat, lng) in KNOWN_COORDINATES.items():
        if key == q_lower or q_lower.startswith(key):
            return {
                "name": clean_q.title(),
                "display_name": f"{clean_q.title()}, India",
                "latitude": lat,
                "longitude": lng,
            }

    # 2. Query Nominatim with India country bias first
    headers = {"User-Agent": "AITravelPlanner/2.0 (contact@aitravelplanner.io)"}
    url = "https://nominatim.openstreetmap.org/search"
    params_in = {"q": f"{clean_q}, India", "format": "json", "limit": 1, "countrycodes": "in"}

    try:
        async with httpx.AsyncClient(timeout=4.0) as client:
            res = await client.get(url, params=params_in, headers=headers)
            if res.status_code == 200:
                data = res.json()
                if data and len(data) > 0:
                    item = data[0]
                    return {
                        "name": clean_q,
                        "display_name": item.get("display_name", clean_q),
                        "latitude": float(item["lat"]),
                        "longitude": float(item["lon"]),
                    }

            # Fallback to generic search if India search returns empty
            params_gen = {"q": clean_q, "format": "json", "limit": 1}
            res_gen = await client.get(url, params=params_gen, headers=headers)
            if res_gen.status_code == 200:
                data_gen = res_gen.json()
                if data_gen and len(data_gen) > 0:
                    item = data_gen[0]
                    return {
                        "name": clean_q,
                        "display_name": item.get("display_name", clean_q),
                        "latitude": float(item["lat"]),
                        "longitude": float(item["lon"]),
                    }
    except Exception as e:
        print(f"⚠️ Nominatim geocode error for '{clean_q}': {e}")

    # 3. Partial fallback search in KNOWN_COORDINATES
    for key, (lat, lng) in KNOWN_COORDINATES.items():
        if key in q_lower or q_lower in key:
            return {
                "name": clean_q.title(),
                "display_name": f"{clean_q.title()}, India",
                "latitude": lat,
                "longitude": lng,
            }

    # Generic default (Chennai)
    return {
        "name": clean_q.title(),
        "display_name": f"{clean_q.title()}, Location",
        "latitude": 13.0827,
        "longitude": 80.2707,
    }

async def autocomplete_locations(query: str) -> List[Dict[str, Any]]:
    """Returns Nominatim suggestions for location search inputs with strict deduplication."""
    clean_q = query.strip()
    if len(clean_q) < 2:
        return []

    headers = {"User-Agent": "AITravelPlanner/2.0 (contact@aitravelplanner.io)"}
    url = "https://nominatim.openstreetmap.org/search"
    params = {"q": clean_q, "format": "json", "limit": 10, "addressdetails": 1}

    raw_results = []
    try:
        async with httpx.AsyncClient(timeout=3.0) as client:
            res = await client.get(url, params=params, headers=headers)
            if res.status_code == 200:
                data = res.json()
                for item in data:
                    raw_name = item.get("name") or item.get("display_name", "").split(",")[0].strip()
                    raw_results.append({
                        "name": raw_name,
                        "display_name": item.get("display_name", ""),
                        "latitude": float(item["lat"]),
                        "longitude": float(item["lon"]),
                    })
    except Exception as e:
        print(f"⚠️ Autocomplete query error for '{clean_q}': {e}")

    # Fallback search matching known cities if needed
    q_lower = clean_q.lower()
    for city, (lat, lng) in KNOWN_COORDINATES.items():
        if q_lower in city or city in q_lower:
            raw_results.append({
                "name": city.title(),
                "display_name": f"{city.title()}, India",
                "latitude": lat,
                "longitude": lng,
            })

    # Strict Deduplication: filter by normalized name and proximity coordinates
    unique_results = []
    seen_names = set()
    for item in raw_results:
        norm_name = item["name"].strip().lower()
        # Avoid duplicate names or near identical locations within ~5km (~0.05 degrees)
        is_dup = norm_name in seen_names or any(
            abs(item["latitude"] - existing["latitude"]) < 0.04 and abs(item["longitude"] - existing["longitude"]) < 0.04
            for existing in unique_results
        )
        if not is_dup:
            seen_names.add(norm_name)
            unique_results.append(item)
            if len(unique_results) >= 5:
                break

    return unique_results



def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculates distance between two lat/lon pairs in km using Haversine formula."""
    R = 6371.0 # Earth radius in km
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat / 2.0)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2.0)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c


async def fetch_osrm_route(
    origin_lat: float, origin_lng: float,
    dest_lat: float, dest_lng: float,
    mode: str = "Car"
) -> Dict[str, Any]:
    """
    Fetches real route geometry from OSRM public API or generates smooth polyline interpolated coordinates.
    """
    profile = "driving"
    if mode.lower() in ("walking", "cycling"):
        profile = "foot" if mode.lower() == "walking" else "bike"

    url = f"https://router.project-osrm.org/route/v1/{profile}/{origin_lng},{origin_lat};{dest_lng},{dest_lat}"
    params = {"overview": "full", "geometries": "geojson", "steps": "true"}

    try:
        async with httpx.AsyncClient(timeout=6.0) as client:
            res = await client.get(url, params=params)
            if res.status_code == 200:
                data = res.json()
                if "routes" in data and len(data["routes"]) > 0:
                    route = data["routes"][0]
                    coords_lnglat = route["geometry"]["coordinates"]
                    coords_latlng = [[pt[1], pt[0]] for pt in coords_lnglat]
                    distance_km = round(route["distance"] / 1000.0, 1)
                    duration_hrs = round(route["duration"] / 3600.0, 1)

                    print(f"🗺️ [OSRM SUCCESS] Generated route from ({origin_lat}, {origin_lng}) to ({dest_lat}, {dest_lng}) | Dist: {distance_km} km | Points: {len(coords_latlng)}")
                    return {
                        "coordinates": coords_latlng,
                        "distance_km": distance_km,
                        "duration_hours": duration_hrs,
                    }
    except Exception as e:
        print(f"⚠️ OSRM API call exception, generating interpolated polyline route: {e}")

    return generate_interpolated_route(origin_lat, origin_lng, dest_lat, dest_lng)


def generate_interpolated_route(
    lat1: float, lon1: float, lat2: float, lon2: float, steps: int = 40
) -> Dict[str, Any]:
    """Generates a realistic curved polyline path between origin and destination."""
    coords = []
    dist = haversine_distance(lat1, lon1, lat2, lon2)

    mid_lat = (lat1 + lat2) / 2.0
    mid_lon = (lon1 + lon2) / 2.0
    offset_lat = (lon2 - lon1) * 0.08

    for i in range(steps + 1):
        t = i / steps
        lat = (1 - t)**2 * lat1 + 2 * (1 - t) * t * (mid_lat + offset_lat) + t**2 * lat2
        lon = (1 - t)**2 * lon1 + 2 * (1 - t) * t * mid_lon + t**2 * lon2
        coords.append([round(lat, 5), round(lon, 5)])

    est_dist = round(dist * 1.15, 1)
    est_duration = round(est_dist / 65.0, 1)

    return {
        "coordinates": coords,
        "distance_km": est_dist,
        "duration_hours": est_duration,
    }


def sample_checkpoints_along_route(
    polyline_latlng: List[List[float]], total_distance_km: float, interval_km: float = 7.5
) -> List[Dict[str, Any]]:
    """
    Samples route checkpoints every 5–10 km along the route polyline.
    Returns list of checkpoint dictionaries with index, lat, lng, distance_from_start_km.
    """
    if not polyline_latlng or len(polyline_latlng) < 2:
        return []

    checkpoints = []
    accumulated_km = 0.0
    next_checkpoint_km = 0.0

    checkpoints.append({
        "id": "chk-0",
        "name": "Origin Checkpoint (0 KM)",
        "latitude": polyline_latlng[0][0],
        "longitude": polyline_latlng[0][1],
        "km_mark": 0.0,
    })
    next_checkpoint_km += interval_km

    for i in range(len(polyline_latlng) - 1):
        p1 = polyline_latlng[i]
        p2 = polyline_latlng[i+1]
        segment_dist = haversine_distance(p1[0], p1[1], p2[0], p2[1])
        accumulated_km += segment_dist

        if accumulated_km >= next_checkpoint_km:
            checkpoints.append({
                "id": f"chk-{len(checkpoints)}",
                "name": f"Route Checkpoint ({round(accumulated_km, 1)} KM)",
                "latitude": round(p2[0], 5),
                "longitude": round(p2[1], 5),
                "km_mark": round(accumulated_km, 1),
            })
            next_checkpoint_km += interval_km

    dest_pt = polyline_latlng[-1]
    if len(checkpoints) == 0 or checkpoints[-1]["km_mark"] < (total_distance_km - 2.0):
        checkpoints.append({
            "id": f"chk-{len(checkpoints)}",
            "name": f"Destination Checkpoint ({total_distance_km} KM)",
            "latitude": dest_pt[0],
            "longitude": dest_pt[1],
            "km_mark": total_distance_km,
        })

    return checkpoints


def calculate_expected_arrival_time(duration_hours: float, start_hour: int = 7) -> str:
    """Calculates formatted Expected Arrival Time (ETA) string assuming morning 07:00 AM departure."""
    import datetime
    buffer_hours = max(0.5, round(duration_hours * 0.2, 1)) # Add rest break buffers
    total_trip_hours = duration_hours + buffer_hours
    start_dt = datetime.datetime.now().replace(hour=start_hour, minute=0, second=0, microsecond=0)
    arrival_dt = start_dt + datetime.timedelta(hours=total_trip_hours)
    return arrival_dt.strftime("%I:%M %p")

