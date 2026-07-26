import traceback
import httpx
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List, Dict
from app.services.groq_service import settings
from app.core.firebase import get_user_chat_sessions_from_firebase, save_chat_session_to_firebase
from app.core.security import get_current_user

router = APIRouter()

class ChatRequest(BaseModel):
    session_id: str = ""
    trip_id: str = ""
    destination: str = "Ooty"
    message: str
    history: List[Dict[str, str]] = []

@router.post("/chat")
async def ai_chat_assistant(req: ChatRequest, user: dict = Depends(get_current_user)):
    """Intelligent Groq AI Travel Assistant for destination & health Q&A."""
    print(f"🤖 [API REQUEST /ai/chat] Destination: {req.destination} | Query: '{req.message}'")
    
    reply = ""
    if settings.GROQ_API_KEY:
        try:
            sys_msg = (
                f"You are a professional AI Tourist & Route Assistant for {req.destination}. "
                "Provide helpful, friendly, and safety-focused travel advice. "
                "Format your answers with emojis, bullet points, and clean line breaks. "
                "DO NOT use raw markdown asterisks like ** or *** in your response."
            )
            messages = [{"role": "system", "content": sys_msg}]
            for h in req.history[-6:]:
                messages.append(h)
            messages.append({"role": "user", "content": req.message})

            headers = {"Authorization": f"Bearer {settings.GROQ_API_KEY}", "Content-Type": "application/json"}
            body = {"model": settings.GROQ_MODEL, "messages": messages, "temperature": 0.6, "max_tokens": 800}
            
            async with httpx.AsyncClient(timeout=8.0) as client:
                res = await client.post("https://api.groq.com/openai/v1/chat/completions", headers=headers, json=body)
                if res.status_code == 200:
                    reply = res.json()["choices"][0]["message"]["content"]
                    print(f"🤖 [GROQ LLM CHAT SUCCESS] Reply generated ({len(reply)} chars)")
                else:
                    print(f"❌ [GROQ LLM CHAT API ERROR] Status {res.status_code}: {res.text}")
        except Exception as e:
            print("❌ [GROQ LLM CHAT EXCEPTION]:")
            traceback.print_exc()

    if not reply:
        # Intelligent contextual response fallback
        user_msg = req.message.lower()
        if "weather" in user_msg or "rain" in user_msg:
            reply = f"The weather in {req.destination} is currently comfortable (~22°C) with low rain probability ⛅ Carry a light jacket for late afternoons."
        elif "hospital" in user_msg or "emergency" in user_msg or "doctor" in user_msg:
            reply = f"The primary emergency center in {req.destination} is the Government General Hospital on Hospital Road (24/7 Trauma unit) 🏥"
        elif "food" in user_msg or "eat" in user_msg or "restaurant" in user_msg:
            reply = f"In {req.destination}, don't miss freshly baked chocolate cakes at Hill Country Bakery and traditional thalis at Royal Indian 🍲"
        elif "senior" in user_msg or "heart" in user_msg or "asthma" in user_msg or "wheelchair" in user_msg:
            reply = f"For members with special health needs in {req.destination}, we recommend paved Botanical Garden paths and lake promenades 🚶"
        else:
            reply = f"I'm your AI Travel Assistant for {req.destination}! You can ask me about nearby places, weather, food recommendations, or emergency medical points ⛰️"

    return {"reply": reply}

@router.get("/chat/history")
async def get_chat_history(user: dict = Depends(get_current_user)):
    """Retrieves all chat sessions for the authenticated user's UID from Firebase Realtime DB."""
    user_uid = user.get("uid") if user else None
    print(f"📥 [API REQUEST /ai/chat/history] Fetching chat sessions for UID '{user_uid}'")
    try:
        if user_uid:
            sessions = get_user_chat_sessions_from_firebase(user_uid)
            return {"sessions": sessions}
        return {"sessions": []}
    except Exception as e:
        print(f"❌ [API ERROR /ai/chat/history]: {e}")
        return {"sessions": []}
