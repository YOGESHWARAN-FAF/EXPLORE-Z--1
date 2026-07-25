from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field
from app.models.member import MemberCreate, Member
from app.models.place import Place

class TripRequest(BaseModel):
    origin: str = "Chennai"
    destination: str = "Salem"
    travel_mode: str = "Car" # Car, Bike, Bus, Walking, Cycling
    duration: str = "3 Days" # Same Day, 2 Days, 3 Days, 5 Days, 1 Week
    budget: float = 10000.0
    num_members: int = 1
    members: List[MemberCreate] = []

class ScheduleItem(BaseModel):
    time: str
    activity: str
    location: str
    km_mark: Optional[float] = None
    category: Optional[str] = "Activity" # Departure, Breakfast, Tea, Lunch, Tourist, Photo, Dinner, Hotel
    notes: Optional[str] = None
    suitable_for_all: bool = True
    health_advisory: Optional[str] = None
    safety_tips: Optional[str] = None

class BudgetBreakdown(BaseModel):
    accommodation: float
    food_and_dining: float
    transportation: float
    activities_and_entry: float
    emergency_fund: float
    total: float

class AIHealthRecommendation(BaseModel):
    member_name: str
    condition_summary: str
    avoid_activities: List[str]
    recommended_activities: List[str]
    special_care_tips: List[str]

class SmartHotelRecommendation(BaseModel):
    day: str
    target_km: float
    hotel_name: str
    location: str
    rating: float
    reasons: List[str] # Safe parking, 24h check-in, family friendly, budget friendly

class TripPlanResult(BaseModel):
    trip_id: str
    origin: str
    destination: str
    travel_mode: str
    duration: str
    budget: float
    total_distance_km: float = 0.0
    duration_hours: float = 0.0
    expected_arrival_time: str = "05:30 PM"
    safety_score: int = 90 # 0 - 100
    trip_summary: str
    route_geometry: List[List[float]] = [] # [[lat, lon], ...]
    checkpoints: List[Dict[str, Any]] = []
    weather_overview: Dict[str, Any] = {}
    budget_breakdown: BudgetBreakdown
    health_recommendations: List[AIHealthRecommendation] = []
    best_tourist_places: List[Place] = []
    best_hotels: List[Place] = []
    best_restaurants: List[Place] = []
    tea_and_bakeries: List[Place] = []
    hospitals: List[Place] = []
    petrol_stations: List[Place] = []
    ev_charging: List[Place] = []
    parking: List[Place] = []
    viewpoints: List[Place] = []
    rest_stops: List[Place] = []
    smart_tea_stops: List[Place] = []
    smart_lunch_stops: List[Place] = []
    along_route_attractions: List[Place] = []
    emergency_stops: List[Place] = []
    destination_explorer_top3: Dict[str, List[Place]] = {}
    travel_schedule: List[ScheduleItem] = []
    daily_itineraries: Dict[str, List[ScheduleItem]] = {}
    smart_hotel_plan: List[SmartHotelRecommendation] = []
    crowd_prediction: str = "Low to Moderate crowd expected."
    weather_advice: str = "Pleasant weather along travel route."
    emergency_suggestions: List[str] = []
    hidden_gems: List[str] = []
    local_foods: List[str] = []
    photo_spots: List[str] = []
    things_to_avoid: List[str] = []
    recommended_route: List[str] = []
    travel_tips: List[str] = []
    news_articles: List[Dict[str, Any]] = []
    news_summary: str = ""
