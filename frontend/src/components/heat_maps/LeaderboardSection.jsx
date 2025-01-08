import React from 'react';

export const LeaderboardSection = ({ pitcherStats }) => {
  // Helper function to get pitch name
  const getPitchName = (code) => {
    const pitchTypes = {
      'FF': 'Four-Seam',
      '4S': 'Four-Seam',
      'FT': 'Two-Seam',
      '2S': 'Two-Seam',
      'SI': 'Sinker',
      'CH': 'Changeup',
      'CU': 'Curveball',
      'SL': 'Slider',
      'FC': 'Cutter',
      'SP': 'Splitter',
      'SW': 'Sweeper',
      'KN': 'Knuckleball'
    };
    return pitchTypes[code] || code;
  };

  // Helper function to calculate in-zone percentage
  const calculateInZonePercent = (locations) => {
    if (!locations || locations.length === 0) return 0;
    const inZone = locations.filter(loc => 
      Math.abs(loc.plate_x) <= 0.83 && 
      loc.plate_z >= 1.5 && 
      loc.plate_z <= 3.5
    );
    return (inZone.length / locations.length) * 100;
  };

  // Process data for leaderboards
  const processLeaderboardData = () => {
    if (!pitcherStats || pitcherStats.length === 0) return { velocity: [], spinRate: [], inZone: [] };

    const allPitches = [];
    pitcherStats.forEach(pitcher => {
      if (pitcher.pitch_data) {
        pitcher.pitch_data.forEach(pitch => {
          allPitches.push({
            pitcherName: pitcher.name,
            pitchType: pitch.pitch_type,
            pitchName: getPitchName(pitch.pitch_type),
            avgVelocity: pitch.avg_velocity || 0,
            avgSpin: pitch.avg_spin_rate || 0,
            locations: pitch.locations || []
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
        .slice(0, 5)
    };
  };

  const leaderboards = processLeaderboardData();

  return (
    <div className="row g-4">
      <div className="col-md-4">
        <div className="card h-100">
          <div className="card-header bg-primary text-white">
            <h5 className="card-title mb-0">Average Velocity Leaders</h5>
          </div>
          <div className="card-body">
            <div className="list-group list-group-flush">
              {leaderboards.velocity.map((pitch, idx) => (
                <div key={`${pitch.pitcherName}-${pitch.pitchType}-velo`} className="list-group-item">
                  <div className="d-flex justify-content-between align-items-center">
                    <span>
                      <strong>{idx + 1}. {pitch.pitcherName}</strong>
                      <br />
                      <small className="text-muted">{pitch.pitchName}</small>
                    </span>
                    <span className="badge bg-primary rounded-pill">
                      {pitch.avgVelocity.toFixed(1)} mph
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="col-md-4">
        <div className="card h-100">
          <div className="card-header bg-success text-white">
            <h5 className="card-title mb-0">Average Spin Rate Leaders</h5>
          </div>
          <div className="card-body">
            <div className="list-group list-group-flush">
              {leaderboards.spinRate.map((pitch, idx) => (
                <div key={`${pitch.pitcherName}-${pitch.pitchType}-spin`} className="list-group-item">
                  <div className="d-flex justify-content-between align-items-center">
                    <span>
                      <strong>{idx + 1}. {pitch.pitcherName}</strong>
                      <br />
                      <small className="text-muted">{pitch.pitchName}</small>
                    </span>
                    <span className="badge bg-success rounded-pill">
                      {pitch.avgSpin.toFixed(0)} rpm
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="col-md-4">
        <div className="card h-100">
          <div className="card-header bg-indigo text-white">
            <h5 className="card-title mb-0">In Strike Zone % Leaders</h5>
          </div>
          <div className="card-body">
            <div className="list-group list-group-flush">
              {leaderboards.inZone.map((pitch, idx) => (
                <div key={`${pitch.pitcherName}-${pitch.pitchType}-zone`} className="list-group-item">
                  <div className="d-flex justify-content-between align-items-center">
                    <span>
                      <strong>{idx + 1}. {pitch.pitcherName}</strong>
                      <br />
                      <small className="text-muted">{pitch.pitchName}</small>
                    </span>
                    <span className="badge bg-indigo rounded-pill">
                      {pitch.inZonePercent.toFixed(1)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};