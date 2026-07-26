import sys
import os

# Add root directory and backend directory to sys.path for Vercel Python runtime
current_dir = os.path.dirname(os.path.abspath(__file__))
root_dir = os.path.dirname(current_dir)
backend_dir = os.path.join(root_dir, "backend")

if root_dir not in sys.path:
    sys.path.insert(0, root_dir)
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

try:
    from backend.app.main import app as fastapi_app
except Exception as e1:
    try:
        from app.main import app as fastapi_app
    except Exception as e2:
        from fastapi import FastAPI
        fastapi_app = FastAPI()
        @fastapi_app.get("/{full_path:path}")
        async def fallback_err(full_path: str):
            return {"status": "error", "message": "FastAPI import error", "details": str(e1)}

try:
    from mangum import Mangum
    handler = Mangum(fastapi_app)
except Exception:
    handler = fastapi_app

app = fastapi_app
