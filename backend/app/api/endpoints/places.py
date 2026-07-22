from fastapi import APIRouter, Depends, Query
from typing import List, Optional
from app.models.place import Place, PlacesResponse
from app.services.places_service import generate_destination_places
from app.services.weather_service import get_coordinates_for_destination

router = APIRouter()

@router.get("/search", response_model=PlacesResponse)
async def search_destination_places(
    destination: str = Query(..., example="Ooty"),
    category: Optional[str] = None
):
    coords = await get_coordinates_for_destination(destination)
    all_places = generate_destination_places(destination, coords["latitude"], coords["longitude"])
    
    if category:
        all_places = [p for p in all_places if p.category.lower() == category.lower()]

    return PlacesResponse(destination=destination, places=all_places)
