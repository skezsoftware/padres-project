import React from 'react';
import { getTeamColor } from '../../utils/teamColors';

const getPlaceIcon = (index) => {
  switch(index) {
    case 0:
      return <span className="medal-icon">🥇</span>;
    case 1:
      return <span className="medal-icon">🥈</span>;
    case 2:
      return <span className="medal-icon">🥉</span>;
    default:
      return `${index + 1}.`;
  }
};

export const LeaderboardSection = ({ pitcherStats }) => {
  const teamId = localStorage.getItem('lastTeamId');
  const teamColor = getTeamColor(teamId);

  // Helper function to get pitch name
  const getPitchName = (code) => {
    const pitchTypes = {
      // 'FF': 'Four-Seam',
      '4S': 'Four-Seam',
      // 'FT': 'Two-Seam',
      '2S': 'Two-Seam',
      // 'SI': 'Sinker',
      'CH': 'Changeup',
      // 'CU': 'Curveball',
      'SL': 'Slider',
      'CT': 'Cutter',
      'SP': 'Splitter',
      'SW': 'Sweeper',
      'KN': 'Knuckleball',
      'CB': 'Curveball'
    };
    return pitchTypes[code] || code;
  };

  // Helper function to calculate in-zone percentage
  const calculateInZonePercent = (locations) => {
    if (!locations || locations.length === 0) return 0;
    const inZone = locations.filter(loc => 
      Math.abs(loc.plate_x) <= 0.851 && 
      loc.plate_z >= 1.5 && 
      loc.plate_z <= 3.5
    );
    return (inZone.length / locations.length) * 100;
  };

  // Process data for leaderboards
  const processLeaderboardData = () => {
    if (!pitcherStats || pitcherStats.length === 0) return { 
      velocity: [], 
      spinRate: [], 
      inZone: [], 
      whiffRate: [],
      exitVelo: [],
      inningsPitched: []  // Add new array for innings pitched leaders
    };

    const allPitches = [];
    const exitVeloData = [];
    const inningsPitchedData = [];  // New array for innings pitched data

    pitcherStats.forEach(pitcher => {
      // Add pitcher to innings pitched array
      if (pitcher.innings_pitched !== undefined) {
        inningsPitchedData.push({
          pitcherName: pitcher.name,
          innings: pitcher.innings_pitched
        });
      }

      // Add pitcher to exit velocity array with their avg_hit_speed
      if (pitcher.avg_hit_speed !== undefined) {
        exitVeloData.push({
          pitcherName: pitcher.name,
          avgExitVelo: pitcher.avg_hit_speed
        });
      }

      // Rest of the existing pitch data processing
      if (pitcher.pitch_data) {
        pitcher.pitch_data.forEach(pitch => {
          allPitches.push({
            pitcherName: pitcher.name,
            pitchType: pitch.pitch_type,
            pitchName: getPitchName(pitch.pitch_type),
            avgVelocity: pitch.avg_velocity || 0,
            avgSpin: pitch.avg_spin_rate || 0,
            locations: pitch.locations || [],
            whiffPct: pitch.whiff_pct || 0
          });
        });
      }
    });

    return {
      velocity: allPitches
        .sort((a, b) => b.avgVelocity - a.avgVelocity)
        .slice(0, 5),
      spinRate: allPitches
        .sort((a, b) => b.avgSpin - a.avgSpin)
        .slice(0, 5),
      inZone: allPitches
        .map(pitch => ({
          ...pitch,
          inZonePercent: calculateInZonePercent(pitch.locations)
        }))
        .sort((a, b) => b.inZonePercent - a.inZonePercent)
        .slice(0, 5),
      whiffRate: allPitches
        .sort((a, b) => b.whiffPct - a.whiffPct)
        .slice(0, 5),
      exitVelo: exitVeloData
        .sort((a, b) => a.avgExitVelo - b.avgExitVelo)  // Sort ascending (lower is better)
        .slice(0, 5),
      inningsPitched: inningsPitchedData
        .sort((a, b) => b.innings - a.innings)  // Sort descending (higher is better)
        .slice(0, 5)
    };
  };

  const leaderboards = processLeaderboardData();

  return (
    <div className="leaderboard-container">
      <div className="card">
        <div className="card-header" style={{ backgroundColor: teamColor }}>
          <h5 className="card-title">Average Velocity Leaders</h5>
        </div>
        <div className="card-body">
          <div className="list-group">
            {leaderboards.velocity.map((pitch, idx) => (
              <div key={`${pitch.pitcherName}-${pitch.pitchType}-velo`} className="list-group-item">
                <div className="player-info">
                  <div className="player-name">
                    {getPlaceIcon(idx)}
                    <strong>{pitch.pitcherName}</strong>
                  </div>
                  <div className="pitch-type">{pitch.pitchName}</div>
                </div>
                <span className="badge" style={{ backgroundColor: teamColor }}>
                  {pitch.avgVelocity.toFixed(1)} mph
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header" style={{ backgroundColor: teamColor }}>
          <h5 className="card-title">Average Spin Rate Leaders</h5>
        </div>
        <div className="card-body">
          <div className="list-group">
            {leaderboards.spinRate.map((pitch, idx) => (
              <div key={`${pitch.pitcherName}-${pitch.pitchType}-spin`} className="list-group-item">
                <div className="player-info">
                  <div className="player-name">
                    {getPlaceIcon(idx)}
                    <strong>{pitch.pitcherName}</strong>
                  </div>
                  <div className="pitch-type">{pitch.pitchName}</div>
                </div>
                <span className="badge" style={{ backgroundColor: teamColor }}>
                  {pitch.avgSpin.toFixed(0)} rpm
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header" style={{ backgroundColor: teamColor }}>
          <h5 className="card-title">In Strike Zone % Leaders</h5>
        </div>
        <div className="card-body">
          <div className="list-group">
            {leaderboards.inZone.map((pitch, idx) => (
              <div key={`${pitch.pitcherName}-${pitch.pitchType}-zone`} className="list-group-item">
                <div className="player-info">
                  <div className="player-name">
                    {getPlaceIcon(idx)}
                    <strong>{pitch.pitcherName}</strong>
                  </div>
                  <div className="pitch-type">{pitch.pitchName}</div>
                </div>
                <span className="badge" style={{ backgroundColor: teamColor }}>
                  {pitch.inZonePercent.toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header" style={{ backgroundColor: teamColor }}>
          <h5 className="card-title">Whiff % Leaders</h5>
        </div>
        <div className="card-body">
          <div className="list-group">
            {leaderboards.whiffRate.map((pitch, idx) => (
              <div key={`${pitch.pitcherName}-${pitch.pitchType}-whiff`} className="list-group-item">
                <div className="player-info">
                  <div className="player-name">
                    {getPlaceIcon(idx)}
                    <strong>{pitch.pitcherName}</strong>
                  </div>
                  <div className="pitch-type">{pitch.pitchName}</div>
                </div>
                <span className="badge" style={{ backgroundColor: teamColor }}>
                  {pitch.whiffPct.toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header" style={{ backgroundColor: teamColor }}>
          <h5 className="card-title">Lowest Avg Exit Velocity</h5>
        </div>
        <div className="card-body">
          <div className="list-group">
            {leaderboards.exitVelo.map((pitcher, idx) => (
              <div key={`${pitcher.pitcherName}-exit-velo`} className="list-group-item">
                <div className="player-info">
                  <div className="player-name">
                    {getPlaceIcon(idx)}
                    <strong>{pitcher.pitcherName}</strong>
                  </div>
                </div>
                <span className="badge" style={{ backgroundColor: teamColor }}>
                  {pitcher.avgExitVelo.toFixed(1)} mph
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header" style={{ backgroundColor: teamColor }}>
          <h5 className="card-title">Innings Pitched Leaders</h5>
        </div>
        <div className="card-body">
          <div className="list-group">
            {leaderboards.inningsPitched.map((pitcher, idx) => (
              <div key={`${pitcher.pitcherName}-innings`} className="list-group-item">
                <div className="player-info">
                  <div className="player-name">
                    {getPlaceIcon(idx)}
                    <strong>{pitcher.pitcherName}</strong>
                  </div>
                </div>
                <span className="badge" style={{ backgroundColor: teamColor }}>
                  {pitcher.innings.toFixed(1)} IP
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};