from pydantic import BaseModel
from typing import List, Optional, Dict


class PitchLocation(BaseModel):
    plate_x: float
    plate_z: float
    swinging_strike: bool


class PitchData(BaseModel):
    pitch_type: str
    usage_pct: float
    whiff_pct: float
    avg_velocity: float
    avg_spin_rate: float
    locations: List[PitchLocation]


class PitcherStats(BaseModel):
    name: str
    team: str
    type: str
    first_pitch_strike_pct: Optional[float] = None
    strikeout_pct: Optional[float] = None
    walk_pct: Optional[float] = None
    k_bb_ratio: Optional[float] = None
    total_pitches: Optional[int] = None
    total_batters: Optional[int] = None
    fip: Optional[float]
    innings_pitched: float
    hard_hit_pct: Optional[float] = None
    pitch_data: Optional[List[PitchData]] = None
    avg_hit_speed: Optional[float] = None


class PitcherStatsResponse(BaseModel):
    success: bool
    data: List[PitcherStats]
    error: Optional[str] = None
