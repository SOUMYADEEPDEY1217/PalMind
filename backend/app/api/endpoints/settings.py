from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.database.models import AppSetting
from app.schemas.schemas import SettingsOut, SettingsUpdate, AIStatusOut, AITestResponse
from app.services.ollama_service import ollama_service
from app.config import settings

router = APIRouter()

def get_setting_val(db: Session, key: str, default: str) -> str:
    item = db.query(AppSetting).filter(AppSetting.key == key).first()
    return item.value if item else default

def set_setting_val(db: Session, key: str, value: str):
    item = db.query(AppSetting).filter(AppSetting.key == key).first()
    if not item:
        item = AppSetting(key=key, value=value)
        db.add(item)
    else:
        item.value = value
    db.commit()

@router.get("/settings", response_model=SettingsOut)
def get_settings(db: Session = Depends(get_db)):
    ollama_url = get_setting_val(db, "ollama_url", settings.OLLAMA_BASE_URL)
    ollama_model = get_setting_val(db, "ollama_model", settings.OLLAMA_MODEL)
    theme = get_setting_val(db, "theme", "dark")
    temp = float(get_setting_val(db, "temperature", "0.3"))
    auto_pri = get_setting_val(db, "auto_priority_enabled", "true").lower() == "true"
    prod_time = get_setting_val(db, "productive_time", "Morning")

    return SettingsOut(
        ollama_url=ollama_url,
        ollama_model=ollama_model,
        embedding_model=settings.EMBEDDING_MODEL,
        theme=theme,
        productive_time=prod_time,
        temperature=temp,
        auto_priority_enabled=auto_pri
    )

@router.put("/settings", response_model=SettingsOut)
def update_settings(data: SettingsUpdate, db: Session = Depends(get_db)):
    if data.ollama_url is not None:
        set_setting_val(db, "ollama_url", data.ollama_url.strip())
        settings.OLLAMA_BASE_URL = data.ollama_url.strip()
        ollama_service.base_url = data.ollama_url.strip().rstrip("/")
    if data.ollama_model is not None:
        set_setting_val(db, "ollama_model", data.ollama_model.strip())
        settings.OLLAMA_MODEL = data.ollama_model.strip()
        ollama_service.preferred_model = data.ollama_model.strip()
    if data.theme is not None:
        set_setting_val(db, "theme", data.theme)
    if data.temperature is not None:
        set_setting_val(db, "temperature", str(data.temperature))
    if data.auto_priority_enabled is not None:
        set_setting_val(db, "auto_priority_enabled", str(data.auto_priority_enabled).lower())

    return get_settings(db)

@router.get("/ai/status", response_model=AIStatusOut)
async def get_ai_status():
    return await ollama_service.get_status()

@router.post("/ai/test", response_model=AITestResponse)
async def test_ai_connection():
    res = await ollama_service.test_connection()
    return AITestResponse(**res)
