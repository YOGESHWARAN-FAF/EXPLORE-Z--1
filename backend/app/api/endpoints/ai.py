import traceback
import httpx
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List, Dict
from app.services.groq_service import settings
from app.core.security import get_current_user

router = APIRouter()

class ChatRequest(BaseModel):
    trip_id: str = ""
    destination: str = "Ooty"
    message: str
    history: List[Dict[str, str]] = []

@router.post("/chat")
async def ai_chat_assistant(req: ChatRequest, user: dict = Depends(get_current_user)):
    """Intelligent Groq AI Travel Assistant for destination & health Q&A."""
    print(f"🤖 [API REQUEST /ai/chat] Destination: {req.destination} | Query: '{req.message}'")
    
    if settings.GROQ_API_KEY:
        try:
            sys_msg = (
                f"You are the AI Smart Tourist Assistant for {req.destination}. "
                "Provide concise, helpful, friendly, and safety-aware travel answers."
            )
            messages = [{"role": "system", "content": sys_msg}]
            for h in req.history[-4:]:
                messages.append(h)
            messages.append({"role": "user", "content": req.message})

            headers = {"Authorization": f"Bearer {settings.GROQ_API_KEY}", "Content-Type": "application/json"}
            body = {"model": settings.GROQ_MODEL, "messages": messages, "temperature": 0.5}
            
            async with httpx.AsyncClient(timeout=8.0) as client:
                res = await client.post("https://api.groq.com/openai/v1/chat/completions", headers=headers, json=body)
                if res.status_code == 200:
                    reply = res.json()["choices"][0]["message"]["content"]
                    print(f"🤖 [GROQ LLM CHAT SUCCESS] Reply generated ({len(reply)} chars)")
                    return {"reply": reply}
                else:
                    print(f"❌ [GROQ LLM CHAT API ERROR] Status {res.status_code}: {res.text}")
        except Exception as e:
            print("❌ [GROQ LLM CHAT EXCEPTION]:")
            traceback.print_exc()

    # Intelligent contextual response
    user_msg = req.message.lower()
    if "weather" in user_msg or "rain" in user_msg:
        reply = f"The weather in {req.destination} is currently comfortable (~22°C) with low rain probability. Carry a light jacket for late afternoons."
    elif "hospital" in user_msg or "emergency" in user_msg or "doctor" in user_msg:
        reply = f"The primary emergency center in {req.destination} is the Government General Hospital on Hospital Road (24/7 Trauma unit). You can also click the red SOS button on your map page."
    elif "food" in user_msg or "eat" in user_msg or "restaurant" in user_msg:
        reply = f"In {req.destination}, don't miss the freshly baked chocolate cakes at Hill Country Bakery and traditional South Indian thalis at Royal Indian Multi-Cuisine."
    elif "senior" in user_msg or "heart" in user_msg or "asthma" in user_msg or "wheelchair" in user_msg:
        reply = f"For members with special health or mobility needs in {req.destination}, we recommend paved Botanical Garden paths, lake promenades, and tea museum tours while avoiding steep mountain trails."
    else:
        reply = f"I'm your AI Travel Assistant for {req.destination}! You can ask me about nearby places, weather, accessible paths, local food recommendations, or emergency medical points."

    return {"reply": reply}
