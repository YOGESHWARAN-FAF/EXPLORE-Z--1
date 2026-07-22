from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field
from app.models.member import MemberCreate, Member
from app.models.place import Place

class TripRequest(BaseModel):
    destination: str # e.g. Ooty, Manali, Goa, Paris
    boundary_km: float = 5.0 # 3, 5, 7, 10
    duration: str = "1 Day" # 2 Hours, 5 Hours, 1 Day, 2 Days, 3 Days
    budget: float = 5000.0 # INR / USD
    num_members: int = 1
    members: List[MemberCreate] = []

class ScheduleItem(BaseModel):
    time: str
    activity: str
    location: str
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

class TripPlanResult(BaseModel):
    trip_id: str
    destination: str
    duration: str
    budget: float
    safety_score: int # 0 - 100
    trip_summary: str
    weather_overview: Dict[str, Any] = {}
    budget_breakdown: BudgetBreakdown
    health_recommendations: List[AIHealthRecommendation] = []
    best_tourist_places: List[Place] = []
    best_hotels: List[Place] = []
    best_restaurants: List[Place] = []
    best_bakeries: List[Place] = []
    hospitals: List[Place] = []
    bus_stands: List[Place] = []
    ev_charging: List[Place] = []
    parking: List[Place] = []
    petrol_stations: List[Place] = []
    travel_schedule: List[ScheduleItem] = []
    crowd_prediction: str = "Moderate crowd expected around midday."
    weather_advice: str = "Comfortable weather. Light jacket recommended for evening."
    emergency_suggestions: List[str] = []
    hidden_gems: List[str] = []
    local_foods: List[str] = []
    photo_spots: List[str] = []
    things_to_avoid: List[str] = []
    recommended_route: List[str] = []
    travel_tips: List[str] = []
    news_articles: List[Dict[str, Any]] = []
    news_summary: str = ""
