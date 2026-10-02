import datetime
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.database.connection import get_db
from app.services.ollama_service import ollama_service
from app.config import settings

router = APIRouter()

@router.get("/health")
async def get_health(db: Session = Depends(get_db)):
    # Check DB
    db_healthy = False
    try:
        db.execute(text("SELECT 1"))
        db_healthy = True
    except Exception:
        db_healthy = False

    ai_status = await ollama_service.get_status()

    return {
        "status": "healthy" if db_healthy else "degraded",
        "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "database": "connected" if db_healthy else "error",
        "app_env": settings.APP_ENV,
        "ai": ai_status
    }
