from fastapi import APIRouter
from app.api.endpoints import auth, trips, ai, location, weather, news, places, emergency

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(trips.router, prefix="/planner", tags=["Trip Planner"])
api_router.include_router(trips.router, prefix="/trips", tags=["Trip Planner"])
api_router.include_router(ai.router, prefix="/ai", tags=["AI Assistant"])
api_router.include_router(location.router, prefix="/location", tags=["Group Live Tracking"])
api_router.include_router(weather.router, prefix="/weather", tags=["Weather"])
api_router.include_router(news.router, prefix="/news", tags=["News & Advisories"])
api_router.include_router(places.router, prefix="/places", tags=["Places Lookup"])
api_router.include_router(emergency.router, prefix="/emergency", tags=["Emergency SOS"])
