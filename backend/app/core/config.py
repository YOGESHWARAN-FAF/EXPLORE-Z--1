from typing import List, Union
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "AI Smart Tourist Planner"
    API_V1_STR: str = "/api/v1"
    
    # AI Config
    GROQ_API_KEY: str = ""
    GROQ_MODEL: str = "llama-3.1-8b-instant"
    
    # Firebase Config
    FIREBASE_CREDENTIALS_JSON: str = ""
    FIREBASE_DATABASE_URL: str = "https://smart-tourist-planner.firebaseio.com"
    
    # News & Places APIs
    GNEWS_API_KEY: str = ""
    APIFY_API_TOKEN: str = ""
    
    # App Settings
    ENVIRONMENT: str = "development"
    CORS_ORIGINS: Union[List[str], str] = ["*"]
    
    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
