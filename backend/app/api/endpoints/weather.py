from fastapi import APIRouter, Query
from app.services.weather_service import get_coordinates_for_destination, get_weather_forecast

router = APIRouter()

@router.get("/current")
async def get_destination_weather(destination: str = Query("Ooty")):
    coords = await get_coordinates_for_destination(destination)
    forecast = await get_weather_forecast(coords["latitude"], coords["longitude"])
    return {
        "destination": destination,
        "coordinates": coords,
        "weather": forecast
    }
