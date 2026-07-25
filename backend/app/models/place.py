from typing import Optional, List
from pydantic import BaseModel

class Place(BaseModel):
    id: Optional[str] = None
    name: str
    category: str # Tourist Place, Hotel, Restaurant, Bakery, Hospital, Medical Shop, Bus Stand, Railway Station, Airport, Petrol Station, EV Charging, Parking, ATM, Police Station, Public Toilet, Shopping Mall, Park
    rating: float = 4.5
    reviews_count: int = 120
    latitude: float
    longitude: float
    address: str
    website: Optional[str] = None
    phone: Optional[str] = None
    opening_hours: Optional[str] = "09:00 AM - 08:00 PM"
    is_open_now: bool = True
    distance_from_route_km: float = 0.5
    visit_duration: Optional[str] = "45 Mins"
    parking_available: bool = True
    family_friendly: bool = True
    wifi_available: bool = True
    images: List[str] = []
    safety_accessible: bool = True
    crowd_level: Optional[str] = "Moderate" # Low, Moderate, High
    description: Optional[str] = None

class PlacesResponse(BaseModel):
    destination: str
    places: List[Place]
