import sys
import os

# Add current directory and parent backend directory to sys.path
api_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.dirname(api_dir)

if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)
if api_dir not in sys.path:
    sys.path.insert(0, api_dir)

try:
    from app.main import app as fastapi_app
except Exception as e1:
    try:
        from main import app as fastapi_app
    except Exception as e2:
        from fastapi import FastAPI
        fastapi_app = FastAPI()
        @fastapi_app.get("/{full_path:path}")
        async def fallback_err(full_path: str):
            return {"status": "error", "message": "FastAPI import error", "details": str(e1)}

try:
    from mangum import Mangum
    handler = Mangum(fastapi_app, lifespan="off")
except Exception:
    handler = fastapi_app

app = fastapi_app
