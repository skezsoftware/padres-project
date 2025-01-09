import React, { useState, useEffect } from "react";
import { ScatterPlot } from "./ScatterPlot";
import { SwingMissPlot } from "./SwingMissPlot";
import { LeaderboardSection } from "./LeaderboardWidget";
import "./heatMapPage.css";

const PITCH_TYPE_NAMES = {
  "4S": "Four-Seam",
  "2S": "Two-Seam",
  "CH": "Changeup",
  "SL": "Slider",
  "CT": "Cutter",
  "SP": "Splitter",
  "SW": "Sweeper",
  "KN": "Knuckleball",
  "CB": "Curveball",
};

const PITCH_COLORS = {
  "Four-Seam": "#FF6B6B", // Red
  "Slider": "#DAA520", // Goldenrod
  "Splitter": "#4ECDC4", // Teal
  "Sweeper": "#FF9F1C", // Orange
  "Curveball": "#6C63FF", // Purple
  "Changeup": "#95D5B2", // Green
  "Sinker": "#2196F3", // Blue
  "Cutter": "#FF4081", // Pink
  "Two-Seam": "#FB8C00", // Dark Orange
};

export const HeatMapPage = () => {
  const [pitcherStats, setPitcherStats] = useState([]);
  const [selectedPitcher, setSelectedPitcher] = useState(null);
  const [selectedPitcherData, setSelectedPitcherData] = useState(null);
  const effectiveTeamId = localStorage.getItem("lastTeamId");

  useEffect(() => {
    const fetchPitcherStats = async () => {
      try {
        const encodedTeam = encodeURIComponent(effectiveTeamId);
        const url = `http://localhost:8000/api/v1/pitcher-stats?team=${encodedTeam}`;
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        if (result.success && result.data) {
          setPitcherStats(result.data);
          if (result.data.length > 0) {
            setSelectedPitcher(result.data[0].name);
          }
        }
      } catch (error) {
        console.error("Error fetching pitcher stats:", error);
      }
    };

    if (effectiveTeamId) {
      fetchPitcherStats();
    }
  }, [effectiveTeamId]);

  useEffect(() => {
    if (selectedPitcher && pitcherStats.length > 0) {
      const pitcherData = pitcherStats.find((p) => p.name === selectedPitcher);
      setSelectedPitcherData(pitcherData);
    }
  }, [selectedPitcher, pitcherStats]);

  return (
    <div className="container-fluid px-4 py-5">
      <div className="row mb-4">
        <div className="col-md-4 mx-auto">
          <div className="pitcher-select-container">
            <h3 className="select-title">Select Any Pitcher:</h3>
            <select
              value={selectedPitcher || ""}
              onChange={(e) => setSelectedPitcher(e.target.value)}
              className="pitcher-select"
            >
              <option value="">Choose a pitcher...</option>
              {pitcherStats.map((pitcher) => (
                <option key={pitcher.name} value={pitcher.name}>
                  {pitcher.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {selectedPitcherData && (
        <>
          <div className="row mb-5">
            <div className="col-12 text-center">
              <h2 className="display-6 mb-3 pitcher-name">
                {selectedPitcherData.name}
              </h2>
              <p className="lead">
                Relies on {selectedPitcherData.pitch_data.length} pitches:{" "}
                {selectedPitcherData.pitch_data
                  .sort((a, b) => b.usage_pct - a.usage_pct)
                  .map((pitch, index) => {
                    const pitchName =
                      PITCH_TYPE_NAMES[pitch.pitch_type] || pitch.pitch_type;
                    const color = PITCH_COLORS[pitchName];
                    return (
                      <span key={pitch.pitch_type}>
                        <span style={{ color: color }}>{pitchName}</span>
                        {` (${pitch.usage_pct.toFixed(1)}%)`}
                        {index < selectedPitcherData.pitch_data.length - 1
                          ? " • "
                          : ""}
                      </span>
                    );
                  })}
              </p>
            </div>
          </div>

          <hr className="my-5" style={{ border: "2px solid #000" }} />

          <div className="row mb-4">
            <div className="col-12">
              <div className="section-title-container">
                <h2 className="section-title display-6">
                  PITCH LOCATION DISTRIBUTION
                </h2>
              </div>
            </div>
          </div>

          <div className="row mb-5">
            <div className="col-12">
              <div className="pitch-grid">
                {selectedPitcherData.pitch_data
                  .sort((a, b) => b.usage_pct - a.usage_pct)
                  .map((pitch, index) => {
                    const pitchName =
                      PITCH_TYPE_NAMES[pitch.pitch_type] || pitch.pitch_type;
                    const color = PITCH_COLORS[pitchName];
                    return (
                      <div key={pitch.pitch_type} className="pitch-column">
                        <ScatterPlot
                          data={pitch.locations}
                          pitchType={pitchName}
                          usage={pitch.usage_pct}
                          avgVelo={pitch.avg_velocity}
                          avgSpin={pitch.avg_spin_rate}
                          isHighest={index === 0}
                          color={color}
                        />
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>

          <hr className="my-5" style={{ border: "2px solid #000" }} />

          <div className="row mb-4">
            <div className="col-12">
              <div className="section-title-container">
                <h2 className="section-title display-6">
                  SWING & MISS LOCATIONS
                </h2>
              </div>
            </div>
          </div>

          <div className="row mb-5">
            <div className="col-12">
              <div className="pitch-grid">
                {selectedPitcherData.pitch_data
                  .sort((a, b) => b.whiff_pct - a.whiff_pct)
                  .map((pitch, index) => {
                    const pitchName =
                      PITCH_TYPE_NAMES[pitch.pitch_type] || pitch.pitch_type;
                    const color = PITCH_COLORS[pitchName];
                    return (
                      <div key={pitch.pitch_type} className="pitch-column">
                        <SwingMissPlot
                          data={pitch.locations}
                          pitchType={pitchName}
                          usage={pitch.usage_pct}
                          avgVelo={pitch.avg_velocity}
                          avgSpin={pitch.avg_spin_rate}
                          whiff_pct={pitch.whiff_pct}
                          isHighest={index === 0}
                          color={color}
                        />
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>

          <hr className="my-5" style={{ border: "2px solid #000" }} />

          <div className="row mb-4">
            <div className="col-12">
              <div className="section-title-container">
                <h2 className="section-title display-6">
                  PITCHER LEADERBOARDS
                </h2>
              </div>
            </div>
          </div>

          <div className="row mb-5">
            <div className="col-12">
              <LeaderboardSection pitcherStats={pitcherStats} />
            </div>
          </div>
        </>
      )}
    </div>
  );
};
