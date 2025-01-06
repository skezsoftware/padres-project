import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';


export const TeamGrid = () => {
  const navigate = useNavigate();
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/v1/teams');
        const result = await response.json();
        if (result.success) {
          setTeams(result.data);
        } else {
          setError(result.error);
        }
      } catch (err) {
        setError('Failed to fetch teams');
      } finally {
        setLoading(false);
      }
    };

    fetchTeams();
  }, []);

  const handleTeamClick = (team) => {
    navigate(`/team/${team}`);
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="team-grid">
      <h1>MLB Teams</h1>
      <div className="grid-container">
        {teams.map((team) => (
          <div 
            key={team} 
            className={`team-card ${team === 'SDP' ? 'padres' : ''}`}
            onClick={() => handleTeamClick(team)}
          >
            {team}
          </div>
        ))}
      </div>
    </div>
  );
};