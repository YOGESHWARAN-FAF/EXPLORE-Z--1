from fastapi import APIRouter, Depends
from app.core.security import get_current_user

router = APIRouter()

@router.get("/me")
async def read_user_profile(user: dict = Depends(get_current_user)):
    return {
        "status": "success",
        "user": user
    }
