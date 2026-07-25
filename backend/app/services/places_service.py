import httpx
import traceback
from typing import List, Dict, Any
from app.core.config import settings
from app.models.place import Place

# High quality Unsplash imagery by category
CATEGORY_IMAGES: Dict[str, List[str]] = {
    "Tea & Coffee Shop": [
        "https://images.unsplash.com/photo-1541167760496-1628856ab772?w=800",
        "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800",
        "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800",
    ],
    "Bakery": [
        "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800",
        "https://images.unsplash.com/photo-1517433670267-08bbd4be890f?w=800",
        "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=800",
    ],
    "Restaurant": [
        "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800",
        "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800",
        "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800",
    ],
    "Hotel": [
        "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800",
        "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800",
        "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800",
    ],
    "Tourist Attraction": [
        "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800",
        "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800",
        "https://images.unsplash.com/photo-1476514525535-ce74f45814d1?w=800",
    ],
    "Scenic Viewpoint & Waterfall": [
        "https://images.unsplash.com/photo-1434394354979-a235cd36269d?w=800",
        "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800",
    ],
    "Hospital": [
        "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=800",
        "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800",
    ],
    "Fuel Station": [
        "https://images.unsplash.com/photo-1527018601619-a508a2be00ce?w=800",
    ],
    "EV Charging": [
        "https://images.unsplash.com/photo-1563720223185-11003d516935?w=800",
    ],
    "Shopping & Market": [
        "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800",
    ],
    "Park": [
        "https://images.unsplash.com/photo-1519331379826-f10be5486c6f?w=800",
    ],
    "Default": [
        "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800",
    ]
}

def get_images_for_category(category: str, idx: int = 0) -> List[str]:
    imgs = CATEGORY_IMAGES.get(category)
    if not imgs:
        for k, v in CATEGORY_IMAGES.items():
            if k.lower() in category.lower() or category.lower() in k.lower():
                imgs = v
                break
    if not imgs:
        imgs = CATEGORY_IMAGES["Default"]
    return [imgs[idx % len(imgs)]]


def generate_route_checkpoint_places(
    origin: str,
    destination: str,
    checkpoints: List[Dict[str, Any]],
    total_dist_km: float
) -> List[Place]:
    """
    Generates realistic, high-quality places along route checkpoints.
    Populates 50 KM tea/bakery stops, 150-200 KM lunch stops, milestone hotels, along-route attractions, and fuel/emergency stations.
    """
    places: List[Place] = []
    place_counter = 1

    if not checkpoints:
        checkpoints = [
            {"id": "chk-0", "name": f"{origin} City Center", "latitude": 13.0827, "longitude": 80.2707, "km_mark": 0.0},
            {"id": "chk-1", "name": f"Highway Rest Zone ({round(total_dist_km*0.5, 1)} KM)", "latitude": 12.3735, "longitude": 79.2084, "km_mark": round(total_dist_km*0.5, 1)},
            {"id": "chk-2", "name": f"{destination} City Center", "latitude": 11.6643, "longitude": 78.1460, "km_mark": total_dist_km},
        ]

    num_chk = len(checkpoints)

    # 1. Smart 50 KM Tea & Bakery Stops (One best place per ~50 KM interval)
    tea_names = [
        ("Highway Filter Coffee & Artisanal Chai", "Tea & Coffee Shop", 4.9, 3850, "Piping hot South Indian filter coffee, herbal tea, fresh snacks & clean rest stop."),
        ("Grand Highway Bakers & Cookie Studio", "Bakery", 4.8, 2400, "Oven-fresh puff pastry, cream rolls, tea, packaged snacks for highway drive."),
        ("Royal Leaf Highway Tea & Espresso Bar", "Tea & Coffee Shop", 4.7, 1920, "Organic hill tea, cappuccino, fresh banana cake, family rest zone."),
        ("Heritage Highway Tea & Pastry House", "Bakery", 4.9, 3100, "Fresh baked cookies, hot samosas, filter coffee, baby diaper station."),
    ]
    for idx, chk in enumerate(checkpoints):
        km = chk.get("km_mark", idx * 50.0)
        # Add a tea/bakery stop at 50 KM intervals
        if idx == 0 or (idx % 2 == 1 and km < total_dist_km):
            name, cat, rat, rev, desc = tea_names[idx % len(tea_names)]
            lat = round(chk["latitude"] + 0.0015, 5)
            lng = round(chk["longitude"] - 0.0015, 5)
            places.append(Place(
                id=f"tea-{place_counter}",
                name=f"{name} @ KM {round(km, 1)}",
                category=cat,
                rating=rat,
                reviews_count=rev,
                latitude=lat,
                longitude=lng,
                address=f"NH Expressway Checkpoint @ {round(km, 1)} KM",
                phone="+91 94440 88811",
                opening_hours="06:00 AM - 11:00 PM",
                is_open_now=True,
                distance_from_route_km=0.3,
                visit_duration="20-30 Mins",
                parking_available=True,
                family_friendly=True,
                wifi_available=True,
                images=get_images_for_category(cat, idx),
                description=desc,
                safety_accessible=True
            ))
            place_counter += 1

    # 2. Smart 150-200 KM Lunch Stops (One best restaurant per 150-200 KM interval)
    lunch_names = [
        ("Highway Flavors Grand Multi-Cuisine", 4.8, 3420, "Hygienic South & North Indian thalis, air-conditioned dining, clean washrooms & wheelchair ramps."),
        ("Pure Veg Transit Dining & Meal Plaza", 4.7, 2180, "Fresh crispy ghee dosas, traditional meals, filtered RO water, quick service."),
        ("Royal Highway Spice Court", 4.6, 1840, "Authentic Biryani, Tandoori specialties, kids play area & spacious monitored parking."),
    ]
    for idx, chk in enumerate(checkpoints):
        km = chk.get("km_mark", 150.0)
        if 100 <= km <= (total_dist_km - 30) and (idx % 3 == 0 or idx == 2):
            name, rat, rev, desc = lunch_names[len(places) % len(lunch_names)]
            lat = round(chk["latitude"] - 0.002, 5)
            lng = round(chk["longitude"] + 0.002, 5)
            places.append(Place(
                id=f"lunch-{place_counter}",
                name=f"{name} @ KM {round(km, 1)}",
                category="Restaurant",
                rating=rat,
                reviews_count=rev,
                latitude=lat,
                longitude=lng,
                address=f"Highway Corridor Rest Stop @ {round(km, 1)} KM",
                phone="+91 97900 99922",
                opening_hours="07:00 AM - 10:30 PM",
                is_open_now=True,
                distance_from_route_km=0.4,
                visit_duration="45-60 Mins",
                parking_available=True,
                family_friendly=True,
                wifi_available=True,
                images=get_images_for_category("Restaurant", idx),
                description=desc,
                safety_accessible=True
            ))
            place_counter += 1

    # 3. Smart Hotel Planning (Milestone stays)
    hotel_templates = [
        ("Grand Highway Residency & Suites", 4.8, 1450, "Safe 24/7 CCTV monitored parking, express check-in, family restaurant & generator backup."),
        ("Royal Palms Highway Resort & Spa", 4.7, 1120, "Lush gardens, kids play park, 24-hour check-in, swimming pool & EV fast charger."),
        ("Transit Comfort Inn & Lodging", 4.5, 780, "Budget-friendly clean AC rooms, generator backup, 24/7 pharmacy next door."),
    ]
    for idx, chk in enumerate(checkpoints):
        km = chk.get("km_mark", 110.0)
        if (km > 80 and km < total_dist_km - 20) and (idx % 3 == 1):
            h_name, rat, rev, desc = hotel_templates[idx % len(hotel_templates)]
            lat = round(chk["latitude"] + 0.003, 5)
            lng = round(chk["longitude"] - 0.0025, 5)
            places.append(Place(
                id=f"hotel-{place_counter}",
                name=f"{h_name} @ KM {round(km, 1)}",
                category="Hotel",
                rating=rat,
                reviews_count=rev,
                latitude=lat,
                longitude=lng,
                address=f"NH Milestone Stop @ {round(km, 1)} KM",
                phone="+91 98400 77733",
                opening_hours="24 Hours",
                is_open_now=True,
                distance_from_route_km=0.5,
                visit_duration="Overnight",
                parking_available=True,
                family_friendly=True,
                wifi_available=True,
                images=get_images_for_category("Hotel", idx),
                description=desc,
                safety_accessible=True
            ))
            place_counter += 1

    # 4. Top 5 Along Route Attractions (within 5 KM)
    attraction_templates = [
        ("Heritage Fort & Panoramic Valley Ridge", "Scenic Viewpoint & Waterfall", 4.9, 4200, "Historical hilltop fort featuring 360-degree valley views & photography deck.", "1.2 KM", "1.5 Hours"),
        ("Eco Forest Waterfall & Cascade Pool", "Scenic Viewpoint & Waterfall", 4.8, 3100, "Pristine natural waterfall with shaded walking trails & family picnic zone.", "2.4 KM", "1.0 Hour"),
        ("Ancient Dravidian Temple Shrine", "Tourist Attraction", 4.9, 4800, "7th-century architectural stone carving temple with peaceful surroundings.", "0.8 KM", "45 Mins"),
        ("Organic Tea Estate & Spice Promenade", "Tourist Attraction", 4.7, 2600, "Guided tea processing tour, fresh spice sampling & lush green photography decks.", "3.1 KM", "1.5 Hours"),
        ("Pine Forest Ridge & Echo Point", "Scenic Viewpoint & Waterfall", 4.6, 2150, "Chilly pine breezes, mountain lookout, and local handicraft stalls.", "1.9 KM", "45 Mins"),
    ]
    for idx, (a_name, cat, rat, rev, desc, dist_str, dur_str) in enumerate(attraction_templates):
        chk = checkpoints[idx % num_chk]
        lat = round(chk["latitude"] + (0.004 if idx % 2 == 0 else -0.005), 5)
        lng = round(chk["longitude"] + (0.005 if idx % 2 == 1 else -0.004), 5)
        places.append(Place(
            id=f"attr-{place_counter}",
            name=f"{a_name}",
            category=cat,
            rating=rat,
            reviews_count=rev,
            latitude=lat,
            longitude=lng,
            address=f"Near {chk['name']}, Highway Route",
            phone="+91 94440 12345",
            opening_hours="06:00 AM - 06:30 PM",
            is_open_now=True,
            distance_from_route_km=float(dist_str.split(" ")[0]),
            visit_duration=dur_str,
            parking_available=True,
            family_friendly=True,
            wifi_available=False,
            images=get_images_for_category("Tourist Attraction", idx),
            description=desc,
            safety_accessible=True
        ))
        place_counter += 1

    # 5. Fuel, EV, Hospital & Emergency Stops
    emergency_templates = [
        ("IndianOil Mega Fuel Station & Air Plaza", "Fuel Station", 4.7, 1820, "24/7 Petrol, Diesel, nitrogen air refill, washrooms, mini-mart."),
        ("TATA Power 60kW DC Fast EV Charging Station", "EV Charging", 4.9, 840, "Dual DC Fast Charger with AC waiting lounge & cafe."),
        ("Highway Lifeline Multispeciality Hospital", "Hospital", 4.8, 620, "24/7 Emergency Trauma ICU, ambulance dispatch, cardiac unit."),
        ("District Highway Emergency Police Station", "Police Station", 4.9, 410, "24/7 Police Patrol, SOS helpline, breakdown assistance."),
    ]
    for idx, (e_name, cat, rat, rev, desc) in enumerate(emergency_templates):
        chk = checkpoints[(idx * 2) % num_chk]
        lat = round(chk["latitude"] - 0.003, 5)
        lng = round(chk["longitude"] - 0.002, 5)
        places.append(Place(
            id=f"emerg-{place_counter}",
            name=f"{e_name}",
            category=cat,
            rating=rat,
            reviews_count=rev,
            latitude=lat,
            longitude=lng,
            address=f"Emergency Sector @ {chk['km_mark']} KM",
            phone="108 / +91 44 2888 9999",
            opening_hours="24 Hours",
            is_open_now=True,
            distance_from_route_km=0.2,
            visit_duration="15 Mins",
            parking_available=True,
            family_friendly=True,
            wifi_available=True,
            images=get_images_for_category(cat, idx),
            description=desc,
            safety_accessible=True
        ))
        place_counter += 1

    return places


def generate_destination_explorer_top3(destination: str, center_lat: float = 11.6643, center_lng: float = 78.1460) -> Dict[str, List[Place]]:
    """
    Generates EXACTLY TOP 3 AI-Selected Places for 14 destination categories.
    Categories:
    1. Tourist Attractions
    2. Hotels
    3. Restaurants
    4. Bakeries
    5. Hospitals
    6. Shopping Malls
    7. Parks
    8. Bus Stand
    9. Railway Station
    10. Fuel Stations
    11. EV Chargers
    12. Medical Shops
    13. Police Stations
    14. ATMs
    """
    categories_data: Dict[str, List[Place]] = {}
    p_counter = 100

    cat_specs = {
        "Tourist Attractions": [
            (f"{destination} Botanical Gardens & Lake", 4.9, 4820, "Sprawling lake promenade, boating, manicured flower beds & paved walking trails."),
            (f"{destination} Heritage Palace & Museum", 4.8, 3650, "Historic royal architecture, artifact galleries, and sunset photography balcony."),
            (f"{destination} Scenic Mountain Peak Overlook", 4.9, 5100, "Highest peak viewpoint with 360-degree views, telescope deck & tea gardens."),
        ],
        "Hotels": [
            (f"Grand {destination} Luxury Hotel & Resort", 4.8, 1950, "5-star hospitality, infinity pool, safe monitored parking, 24h room service."),
            (f"{destination} Heritage Residency & Spa", 4.7, 1420, "Boutique hotel with traditional courtyard, multi-cuisine dining & spa."),
            (f"{destination} Transit Comfort Suites", 4.6, 980, "Modern AC rooms, express check-in, complimentary breakfast & fast Wi-Fi."),
        ],
        "Restaurants": [
            (f"{destination} Royal Spice Multi-Cuisine", 4.8, 3100, "Authentic regional South Indian thalis, Chettinad specials & North Indian tandoori."),
            (f"The Green Leaf Pure Veg Restaurant", 4.9, 2840, "Crispy ghee roast dosas, fresh filter coffee, RO drinking water & family seating."),
            (f"{destination} Highway Grill & Sea Food", 4.7, 1960, "Tandoori platters, fresh juices, outdoor garden seating & kids play area."),
        ],
        "Bakeries": [
            (f"{destination} Crown Bakery & Pastry Studio", 4.9, 2900, "Famous oven-fresh plum cakes, chocolate pastries, hot puffs & filter coffee."),
            (f"The French Loaf Bakery & Cafe", 4.8, 1850, "Artisanal sourdough breads, croissants, hot mocha & savory rolls."),
            (f"{destination} Honeycomb Cake & Coffee Shop", 4.7, 1420, "Custom birthday cakes, cookies, iced tea & cozy seating."),
        ],
        "Hospitals": [
            (f"{destination} Multispeciality Emergency Hospital", 4.9, 1250, "24/7 Trauma ICU, emergency surgery, 108 ambulance dispatch & cardiac care."),
            (f"{destination} City General Hospital", 4.7, 890, "24-hour outpatient clinic, diagnostic labs, pharmacy & pediatric unit."),
            (f"Apollo Speciality Medical Center", 4.8, 1100, "Advanced emergency care, 24/7 blood bank, ICU & specialist doctors."),
        ],
        "Shopping Malls": [
            (f"Grand {destination} Central Shopping Mall", 4.8, 4100, "Multi-floor shopping, brand outlets, food court, multiplex cinema & parking."),
            (f"{destination} Silk & Handloom Heritage Bazaar", 4.9, 3250, "Authentic pure silk sarees, handicrafts, organic spices & souvenirs."),
            (f"City Plaza Mall & Hypermarket", 4.6, 2180, "Supermarket, electronics, fashion stores & games arcade."),
        ],
        "Parks": [
            (f"{destination} Eco Green Park & Rose Garden", 4.9, 3400, "Beautiful rose gardens, walking tracks, fountain shows & kids play equipment."),
            (f"Central Lake Park & Promenade", 4.8, 2750, "Lakeside jogging track, pedal boats, shaded benches & musical fountain."),
            (f"{destination} Children's Joy Science Park", 4.7, 1890, "Interactive science exhibits, green lawns, duck pond & picnic spots."),
        ],
        "Bus Stand": [
            (f"{destination} Central Bus Terminus (TNSTC)", 4.6, 2800, "24/7 Intercity express buses, cloakroom, waiting hall & taxi stand."),
            (f"Omni Private Bus Terminal", 4.5, 1450, "AC sleeper bus boarding point, waiting lounge & luggage storage."),
            (f"Town Bus Stand Plaza", 4.4, 980, "Local city bus connectivity, auto-rickshaw stand & refreshment stalls."),
        ],
        "Railway Station": [
            (f"{destination} Junction Railway Station", 4.8, 5600, "Major rail junction, 24/7 ticket counters, executive lounge, escalators & parking."),
            (f"{destination} Town Railway Halt", 4.4, 720, "Suburban train stop with passenger shelter & auto stand."),
            (f"North Express Rail Station", 4.5, 910, "Express train halt, ticket vending machines & clean waiting rooms."),
        ],
        "Fuel Stations": [
            (f"IndianOil Mega Auto Fuel Plaza", 4.8, 1950, "24/7 Petrol, Diesel, EV charger, nitrogen air refill, washrooms & mini-mart."),
            (f"Bharat Petroleum Pure Fuel Outlet", 4.7, 1420, "Speed petrol, diesel, quick windshield cleaning & digital payment."),
            (f"HP Auto Care Station & Service", 4.6, 1180, "Clean fuel, free tire pressure check, oil change & 24/7 operation."),
        ],
        "EV Chargers": [
            (f"TATA Power 60kW DC Fast EV Station", 4.9, 920, "Dual DC fast charger, AC lounge, coffee machine & safe parking."),
            (f"Jio-bp pulse EV Charging Hub", 4.8, 640, "Fast charging CCS2 plugs, canopy shelter & 24/7 security."),
            (f"Ather Grid Fast Scooter Charger", 4.7, 450, "Two-wheeler fast charging, located near central cafe plaza."),
        ],
        "Medical Shops": [
            (f"Apollo Pharmacy 24x7 Central", 4.9, 1850, "All prescription drugs, surgical supplies, baby care & 24/7 delivery."),
            (f"MedPlus 24/7 Express Pharmacy", 4.8, 1420, "Genuine medicines, health supplements, BP & sugar check station."),
            (f"{destination} City Life Pharmacy", 4.7, 890, "Prescription medicines, emergency first-aid kits & digital payment."),
        ],
        "Police Stations": [
            (f"{destination} Central Police Headquarters", 4.9, 680, "24/7 Police control room, SOS emergency response & tourist help desk."),
            (f"City Traffic Police Patrol Station", 4.8, 420, "Traffic assistance, emergency towing service & highway patrol."),
            (f"North Town Police Station", 4.7, 310, "24-hour public assistance, safety monitoring & emergency helpline."),
        ],
        "ATMs": [
            (f"SBI 24/7 Cash Recycler & ATM Plaza", 4.9, 1450, "24-hour cash withdrawal & deposit, cardless cash & CCTV security."),
            (f"HDFC Bank 24x7 ATM Center", 4.8, 1120, "High cash availability, air-conditioned booth & multi-card support."),
            (f"ICICI Bank ATM & Passbook Station", 4.7, 980, "Fast cash withdrawal, 24/7 operation & safe well-lit location."),
        ]
    }

    # Offsets around destination center
    lat_offsets = [0.005, -0.006, 0.004, -0.003, 0.007, -0.008, 0.002]
    lng_offsets = [0.006, 0.005, -0.007, 0.008, -0.004, 0.003, -0.005]

    for cat_name, places_list in cat_specs.items():
        cat_places: List[Place] = []
        for p_idx, (name, rat, rev, desc) in enumerate(places_list):
            lat = round(center_lat + lat_offsets[(p_counter + p_idx) % len(lat_offsets)], 5)
            lng = round(center_lng + lng_offsets[(p_counter + p_idx) % len(lng_offsets)], 5)
            cat_places.append(Place(
                id=f"dest-{p_counter}",
                name=name,
                category=cat_name,
                rating=rat,
                reviews_count=rev,
                latitude=lat,
                longitude=lng,
                address=f"Central Sector, {destination}",
                website=f"https://www.google.com/search?q={name.replace(' ', '+')}",
                phone="+91 98400 12345",
                opening_hours="09:00 AM - 09:00 PM" if "Hospital" not in cat_name and "Station" not in cat_name and "ATM" not in cat_name else "24 Hours",
                is_open_now=True,
                distance_from_route_km=round(0.3 + p_idx * 0.4, 1),
                visit_duration="1 Hour",
                parking_available=True,
                family_friendly=True,
                wifi_available=True,
                images=get_images_for_category(cat_name, p_idx),
                description=desc,
                safety_accessible=True
            ))
            p_counter += 1
        categories_data[cat_name] = cat_places

    return categories_data


def generate_destination_places(destination: str, center_lat: float = 11.6643, center_lng: float = 78.1460) -> List[Place]:
    """Flattens destination explorer top 3 places for search/place endpoints."""
    top3_dict = generate_destination_explorer_top3(destination, center_lat, center_lng)
    flat_places: List[Place] = []
    for cat, plist in top3_dict.items():
        flat_places.extend(plist)
    return flat_places
