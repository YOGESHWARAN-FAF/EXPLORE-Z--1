from fastapi import APIRouter, Query, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from app.services.news_service import (
    fetch_destination_news, 
    analyze_news_with_groq, 
    news_ai_chat_query
)

router = APIRouter()

class NewsAnalysisRequest(BaseModel):
    destination: str
    weather: Optional[Dict[str, Any]] = {}
    news: List[Dict[str, Any]]

class NewsChatRequest(BaseModel):
    destination: str
    selected_news: Dict[str, Any]
    weather: Optional[Dict[str, Any]] = {}
    user_budget: Optional[float] = 5000.0
    medical_conditions: Optional[List[str]] = []
    user_query: str

@router.get("/latest")
async def get_latest_news(destination: str = Query("Ooty")):
    articles, summary, overall_rec = await fetch_destination_news(destination)
    return {
        "destination": destination,
        "news_summary": summary,
        "overall_ai_recommendation": overall_rec,
        "articles": articles,
        "news": articles  # Support both keys
    }

@router.get("/{destination}")
async def get_news_by_destination(destination: str):
    articles, summary, overall_rec = await fetch_destination_news(destination)
    return {
        "destination": destination,
        "weather": {},
        "news_summary": summary,
        "overall_ai_recommendation": overall_rec,
        "news": articles,
        "articles": articles
    }

@router.post("/ai-analysis")
async def post_ai_analysis(payload: NewsAnalysisRequest):
    try:
        res = await analyze_news_with_groq(payload.destination, payload.weather or {}, payload.news)
        return res
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/chat")
async def post_news_chat(payload: NewsChatRequest):
    try:
        ans = await news_ai_chat_query(
            destination=payload.destination,
            selected_news=payload.selected_news,
            weather=payload.weather,
            user_budget=payload.user_budget,
            medical_conditions=payload.medical_conditions,
            user_query=payload.user_query
        )
        return {"response": ans}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

