import sys
import os

# Add backend directory to sys.path
api_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.dirname(api_dir)

if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)
if api_dir not in sys.path:
    sys.path.insert(0, api_dir)

try:
    from app.main import app as fastapi_app
except Exception as e:
    from fastapi import FastAPI
    fastapi_app = FastAPI()
    
    @fastapi_app.get("/{full_path:path}")
    async def crash_diagnostic(full_path: str):
        return {
            "status": "error",
            "message": "FastAPI initialization diagnostic fallback",
            "details": str(e)
        }

app = fastapi_app
