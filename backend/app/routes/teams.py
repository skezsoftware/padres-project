from fastapi import APIRouter
from ..database import Database

router = APIRouter()
db = Database()

@router.get("/teams")
async def get_teams():
    try:
        df = db.get_dataframe()
        teams = sorted(df['pitcher_team'].unique().tolist())
        
        return {
            "success": True,
            "data": teams,
            "error": None
        }
    except Exception as e:
        print(f"Error: {e}")
        return {
            "success": False,
            "data": [],
            "error": str(e)
        }