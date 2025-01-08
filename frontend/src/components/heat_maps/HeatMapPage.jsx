import React, { useState, useEffect } from 'react';
import { ScatterPlot } from './ScatterPlot';
import { LeaderboardSection } from './LeaderboardSection';
import './heatMapPage.css';

export const HeatMapPage = () => {
  const [pitcherStats, setPitcherStats] = useState([]);
  const [selectedPitcher, setSelectedPitcher] = useState(null);
  const [selectedPitcherData, setSelectedPitcherData] = useState(null);
  const effectiveTeamId = localStorage.getItem('lastTeamId');

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
        console.error('Error fetching pitcher stats:', error);
      }
    };

    if (effectiveTeamId) {
      fetchPitcherStats();
    }
  }, [effectiveTeamId]);

  useEffect(() => {
    if (selectedPitcher && pitcherStats.length > 0) {
      const pitcherData = pitcherStats.find(p => p.name === selectedPitcher);
      setSelectedPitcherData(pitcherData);
    }
  }, [selectedPitcher, pitcherStats]);

  return (
    <div className="container-fluid px-4 py-5">
      <div className="row mb-4">
        <div className="col-md-4 mx-auto">
          <select 
            value={selectedPitcher || ''}
            onChange={(e) => setSelectedPitcher(e.target.value)}
            className="form-select"
          >
            <option value="">Select Pitcher</option>
            {pitcherStats.map(pitcher => (
              <option key={pitcher.name} value={pitcher.name}>
                {pitcher.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {selectedPitcherData && (
        <div className="row mb-5">
          <div className="col-12 text-center">
            <h2 className="display-6 mb-3">{selectedPitcherData.name}</h2>
            <p className="lead">
              Relies on {selectedPitcherData.pitch_data.length} pitches: {' '}
              {selectedPitcherData.pitch_data.map((pitch, index) => (
                <span key={pitch.pitch_type}>
                  <strong>{pitch.pitch_type}</strong> ({pitch.usage_pct}%)
                  {index < selectedPitcherData.pitch_data.length - 1 ? ' • ' : ''}
                </span>
              ))}
            </p>
          </div>
        </div>
      )}

      {selectedPitcherData && (
        <div className="row mb-5">
          <div className="col-12">
            <div className="pitch-grid">
              {selectedPitcherData.pitch_data
                .sort((a, b) => b.usage_pct - a.usage_pct)
                .map(pitch => (
                  <ScatterPlot
                    key={pitch.pitch_type}
                    data={pitch.locations}
                    pitchType={pitch.pitch_type}
                    usage={pitch.usage_pct}
                    avgVelo={pitch.avg_velocity}
                    avgSpin={pitch.avg_spin_rate}
                  />
                ))}
            </div>
          </div>
        </div>
      )}

      {pitcherStats.length > 0 && (
        <div className="row mt-5">
          <div className="col-12">
            <h3 className="text-center mb-4">Pitch Leaderboards</h3>
            <LeaderboardSection pitcherStats={pitcherStats} />
          </div>
        </div>
      )}
    </div>
  );
};
