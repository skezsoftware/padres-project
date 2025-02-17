from fastapi import APIRouter, Query, HTTPException
from typing import Optional, Dict, List
from ..database import db
from ..models import PitcherStats, PitcherStatsResponse, PitchData, PitchLocation
import pandas as pd
from statistics import mean
import logging

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get("/pitcher-stats", response_model=PitcherStatsResponse)
async def get_pitcher_stats(
    sort_by: str = Query(
        "name",
        enum=[
            "name",
            "team",
            "first_pitch_strike_pct",
            "strikeout_pct",
            "walk_pct",
            "k_minus_bb",
            "k_bb_ratio",
            "fip",
        ],
    ),
    pitcher_type: str = Query("all", enum=["all", "S", "R"]),
    order: str = Query("desc", enum=["asc", "desc"]),
    team: Optional[str] = Query(None, description="Filter by specific team"),
    min_pitches: Optional[int] = Query(
        None, description="Minimum number of pitches", ge=0
    ),
    min_strikeout_pct: Optional[float] = Query(
        None, description="Minimum strikeout percentage", ge=0, le=100
    ),
    min_walk_pct: Optional[float] = Query(
        None, description="Minimum walk percentage", ge=0, le=100
    ),
    min_first_pitch_strike_pct: Optional[float] = Query(
        None, description="Minimum first pitch strike percentage", ge=0, le=100
    ),
    min_k_minus_bb: Optional[float] = Query(
        None, description="Minimum K-BB%", ge=-100, le=100
    ),
    min_batters: Optional[int] = Query(None, description="Minimum batters faced", ge=0),
    start_date: Optional[str] = Query(None, description="Start date (YYYY-MM-DD)"),
    end_date: Optional[str] = Query(None, description="End date (YYYY-MM-DD)"),
):
    try:
        logger.info(f"Processing pitcher stats request - team: {team}, sort: {sort_by}")
        df = db.get_dataframe()

        if team:
            logger.debug(f"Filtering by team: {team}")
        if pitcher_type != "all":
            logger.debug(f"Filtering by pitcher type: {pitcher_type}")

        # Apply date filters if provided
        if start_date:
            df = df[df["game_date"] >= start_date]
        if end_date:
            df = df[df["game_date"] <= end_date]

        stats = []

        for (team_name, first_name, last_name, p_type), pitcher_data in df.groupby(
            ["pitcher_team", "pitcher_name_first", "pitcher_name_last", "pitcher_type"]
        ):
            # Apply team filter if specified
            if team and team.lower() != team_name.lower():
                continue

            # Filter by pitcher type if specified
            if pitcher_type != "all" and p_type != pitcher_type:
                continue

            # Skip if doesn't meet minimum pitches threshold
            if min_pitches and len(pitcher_data) < min_pitches:
                continue

            # Calculate first pitch strike percentage
            first_pitches = pitcher_data[pitcher_data["pitch_seq"] == 1]
            total_first_pitches = len(first_pitches)

            if total_first_pitches > 0:
                first_pitch_strikes = first_pitches[
                    (first_pitches["ball"] == False)
                    | (
                        (first_pitches["pre_strikes"] == 0)
                        & (first_pitches["post_strikes"] == 1)
                    )
                    | (first_pitches["called_strike"] == True)
                    | (first_pitches["swinging_strike"] == True)
                    | (first_pitches["foul"] == True)
                    | (first_pitches["in_play"] == True)
                ]
                first_pitch_strike_pct = (
                    len(first_pitch_strikes) / total_first_pitches
                ) * 100
            else:
                first_pitch_strike_pct = 0

            # Calculate strikeout percentage
            total_batters = (
                pitcher_data[["game_date", "at_bat_number"]].drop_duplicates().shape[0]
            )
            strikeouts = len(pitcher_data[pitcher_data["event_type"] == "strikeout"])
            strikeout_pct = (
                (strikeouts / total_batters) * 100 if total_batters > 0 else 0
            )

            # Calculate walk percentage
            walks = len(
                pitcher_data[
                    pitcher_data["event_type"].str.contains(
                        "walk", case=False, na=False
                    )
                ]
            )
            first_pitches_count = len(pitcher_data[pitcher_data["pitch_seq"] == 1])
            walk_pct = (
                (walks / first_pitches_count) * 100 if first_pitches_count > 0 else 0
            )

            # Calculate strikeout to walk ratio (K/BB)
            if walks == 0:
                k_bb_ratio = round(
                    strikeouts / 1, 2
                )  # If no walks, divide strikeouts by 1
            else:
                k_bb_ratio = round(strikeouts / walks, 2)

            # Calculate FIP components
            innings_pitched = (
                pitcher_data["post_outs"] - pitcher_data["pre_outs"]
            ).sum() / 3
            home_runs = len(pitcher_data[pitcher_data["event_type"] == "home_run"])
            walks = len(
                pitcher_data[
                    pitcher_data["event_type"].str.contains(
                        "walk", case=False, na=False
                    )
                ]
            )
            hit_by_pitch = len(
                pitcher_data[pitcher_data["event_type"] == "hit_by_pitch"]
            )
            strikeouts = len(pitcher_data[pitcher_data["event_type"] == "strikeout"])

            # Calculate FIP (using 3.17 as the constant)
            if innings_pitched > 0:
                fip = (
                    (13 * home_runs) + (3 * (walks + hit_by_pitch)) - (2 * strikeouts)
                ) / innings_pitched + 3.17
            else:
                fip = None

            # Calculate hard hit %
            batted_balls = pitcher_data[pitcher_data["hit_exit_speed"].notna()]
            hard_hits = batted_balls[batted_balls["hit_exit_speed"] >= 95.0]
            hard_hit_pct = (
                (len(hard_hits) / len(batted_balls)) * 100
                if len(batted_balls) > 0
                else 0
            )

            # Performance threshold filters
            if min_strikeout_pct and strikeout_pct < min_strikeout_pct:
                continue
            if min_walk_pct and walk_pct < min_walk_pct:
                continue
            if (
                min_first_pitch_strike_pct
                and first_pitch_strike_pct < min_first_pitch_strike_pct
            ):
                continue
            if min_k_minus_bb is not None and k_bb_ratio < min_k_minus_bb:
                continue

            # Apply batters faced filters
            if min_batters and total_batters < min_batters:
                continue

            # Calculate pitch type data
            pitcher_data = pitcher_data[pitcher_data["pitch_type"].notna()]
            pitch_data = []
            for pitch_type, pitch_group in pitcher_data.groupby("pitch_type"):
                pitch_count = len(pitch_group)
                usage_pct = (pitch_count / len(pitcher_data)) * 100

                # Calculate whiff percentage
                whiff_count = len(pitch_group[pitch_group["swinging_strike"] == True])
                whiff_pct = (whiff_count / pitch_count) * 100 if pitch_count > 0 else 0

                pitch_data.append(
                    PitchData(
                        pitch_type=pitch_type,
                        usage_pct=round(usage_pct, 1),
                        whiff_pct=round(whiff_pct, 1),  # Add whiff percentage
                        avg_velocity=round(pitch_group["rel_speed"].mean(), 1),
                        avg_spin_rate=round(pitch_group["spin_rate"].mean(), 0),
                        locations=[
                            PitchLocation(
                                plate_x=row["plate_x"],
                                plate_z=row["plate_z"],
                                swinging_strike=bool(row["swinging_strike"]),
                            )
                            for _, row in pitch_group.iterrows()
                        ],
                    )
                )

            avg_hit_speed = pitcher_data["hit_exit_speed"].mean()

            stats.append(
                PitcherStats(
                    name=f"{first_name} {last_name}",
                    team=team_name,
                    type="Starter" if p_type.lower().startswith("s") else "Reliever",
                    first_pitch_strike_pct=round(first_pitch_strike_pct, 1),
                    strikeout_pct=round(strikeout_pct, 1),
                    walk_pct=round(walk_pct, 1),
                    k_bb_ratio=k_bb_ratio,
                    total_pitches=len(pitcher_data),
                    total_batters=total_batters,
                    fip=round(fip, 2) if fip is not None else None,
                    innings_pitched=round(innings_pitched, 1),
                    hard_hit_pct=round(hard_hit_pct, 1),
                    pitch_data=pitch_data,
                    avg_hit_speed=(
                        round(avg_hit_speed, 1) if not pd.isna(avg_hit_speed) else None
                    ),
                )
            )

        # Sort the results
        if sort_by == "first_pitch_strike_pct":
            stats.sort(
                key=lambda x: x.first_pitch_strike_pct or 0, reverse=(order == "desc")
            )
        elif sort_by == "strikeout_pct":
            stats.sort(key=lambda x: x.strikeout_pct or 0, reverse=(order == "desc"))
        elif sort_by == "walk_pct":
            stats.sort(key=lambda x: x.walk_pct or 0, reverse=(order == "desc"))
        elif sort_by == "name":
            stats.sort(key=lambda x: x.name, reverse=(order == "desc"))
        elif sort_by == "team":
            stats.sort(key=lambda x: x.team, reverse=(order == "desc"))
        elif sort_by == "k_minus_bb":
            stats.sort(key=lambda x: x.k_minus_bb or 0, reverse=(order == "desc"))
        elif sort_by == "k_bb_ratio":
            stats.sort(
                key=lambda x: x.k_bb_ratio if x.k_bb_ratio is not None else -1,
                reverse=(order.lower() == "desc"),
            )
        elif sort_by == "fip":
            stats.sort(
                key=lambda x: x.fip if x.fip is not None else float("inf"),
                reverse=(order == "desc"),
            )

        logger.info(f"Successfully processed {len(stats)} pitcher records")

        return PitcherStatsResponse(
            success=True,
            data=stats,
        )

    except Exception as e:
        logger.error(f"Error processing pitcher stats: {e}")
        raise HTTPException(
            status_code=500, detail="Failed to process pitcher statistics"
        )
