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
    images: List[str] = []
    safety_accessible: bool = True
    crowd_level: Optional[str] = "Moderate" # Low, Moderate, High
    description: Optional[str] = None

class PlacesResponse(BaseModel):
    destination: str
    places: List[Place]
