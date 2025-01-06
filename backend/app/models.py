from pydantic import BaseModel
from typing import List, Optional

class PitcherStats(BaseModel):
    name: str
    team: str
    type: str
    first_pitch_strike_pct: Optional[float] = None
    strikeout_pct: Optional[float] = None
    walk_pct: Optional[float] = None
    k_minus_bb: Optional[float] = None
    k_bb_ratio: Optional[float] = None
    total_pitches: Optional[int] = None
    total_batters: Optional[int] = None
    fip: Optional[float]
    innings_pitched: float
    
class PitcherStatsResponse(BaseModel):
    success: bool
    data: List[PitcherStats]
    error: Optional[str] = None