import logging
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.config import settings
from app.database.connection import init_db
from app.api.endpoints import (
    health,
    auth,
    profile,
    tasks,
    memories,
    documents,
    chat,
    study,
    reminders,
    brief,
    search,
    settings as settings_api,
    data_management
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("palmind")

from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing PalMind local database...")
    init_db()
    logger.info("PalMind backend ready.")
    yield

# Create FastAPI instance
app = FastAPI(
    title="PalMind API",
    description="Private Local AI Memory & Study Companion for a Friend",
    version="1.0.0",
    lifespan=lifespan
)

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Exception handlers
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Global exception on {request.method} {request.url.path}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "An internal server error occurred.", "error": str(exc)}
    )

# Include Routers
app.include_router(health.router, prefix="/api", tags=["Health"])
app.include_router(auth.router, prefix="/api", tags=["Auth"])
app.include_router(profile.router, prefix="/api", tags=["Profile"])
app.include_router(tasks.router, prefix="/api", tags=["Tasks"])
app.include_router(memories.router, prefix="/api", tags=["Memories"])
app.include_router(documents.router, prefix="/api", tags=["Documents"])
app.include_router(chat.router, prefix="/api", tags=["Chat"])
app.include_router(study.router, prefix="/api", tags=["Study"])
app.include_router(reminders.router, prefix="/api", tags=["Reminders"])
app.include_router(brief.router, prefix="/api", tags=["Daily Brief"])
app.include_router(search.router, prefix="/api", tags=["Search"])
app.include_router(settings_api.router, prefix="/api", tags=["Settings"])
app.include_router(data_management.router, prefix="/api", tags=["Data Management"])

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
