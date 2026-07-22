from fastapi import APIRouter, Query
from app.services.news_service import fetch_destination_news

router = APIRouter()

@router.get("/latest")
async def get_latest_news(destination: str = Query("Ooty")):
    articles = await fetch_destination_news(destination)
    return {
        "destination": destination,
        "articles": articles
    }
