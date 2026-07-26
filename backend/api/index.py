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
except Exception:
    from main import app as fastapi_app

# Handler export for Vercel serverless function
app = fastapi_app
handler = fastapi_app
