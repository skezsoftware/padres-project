from pydantic_settings import BaseSettings
from functools import lru_cache
import os
from typing import List

class Settings(BaseSettings):
    # API Settings
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "Padres Pitching Stats API"
    
    # CORS Settings
    BACKEND_CORS_ORIGINS: List[str] = ["http://localhost:5173"]
    
    # Database Settings
    DATABASE_FILE: str = "padres_project_data.csv"
    
    # Logging Settings
    LOG_LEVEL: str = "INFO"
    
    class Config:
        case_sensitive = True
        env_file = ".env"

@lru_cache()
def get_settings() -> Settings:
    return Settings()