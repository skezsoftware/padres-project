from fastapi import APIRouter, HTTPException
from ..database import db
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

@router.get("/teams")
async def get_teams():
    try:
        df = db.get_dataframe()
        teams = sorted(df['pitcher_team'].unique().tolist())
        logger.info(f"Successfully retrieved {len(teams)} teams")
        
        return {
            "success": True,
            "data": teams,
            "error": None
        }
    except Exception as e:
        logger.error(f"Error retrieving teams: {e}")
        raise HTTPException(
            status_code=500,
            detail="Failed to retrieve teams"
        )