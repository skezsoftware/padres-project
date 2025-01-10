from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from .routes import pitcher_stats, teams
from .database import db
from .config import get_settings

settings = get_settings()
app = FastAPI(title=settings.PROJECT_NAME)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include router
app.include_router(pitcher_stats.router, prefix=settings.API_V1_STR)
app.include_router(teams.router, prefix=settings.API_V1_STR)


@app.get("/")
async def root():
    return {"message": f"Welcome to the {settings.PROJECT_NAME}"}
