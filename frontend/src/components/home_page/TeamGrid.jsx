import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export const TeamGrid = () => {
  const navigate = useNavigate();
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const teamAbbreviations = {
    "Arizona Diamondbacks": "ARI",
    "Atlanta Braves": "ATL",
    "Baltimore Orioles": "BAL",
    "Cleveland Guardians": "CLE",
    "Los Angeles Dodgers": "LAD",
    "San Diego Padres": "SD",
    "Seattle Mariners": "SEA",
    "Texas Rangers": "TEX",
    "Washington Nationals": "WSH",
  };

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const response = await fetch("http://localhost:8000/api/v1/teams");
        const result = await response.json();
        if (result.success) {
          // Sort the teams to ensure Padres are in the middle
          const sortedTeams = result.data.sort((a, b) => {
            if (a === "San Diego Padres") return 1; // Move Padres towards the end
            if (b === "San Diego Padres") return -1; // Move Padres towards the end
            return a.localeCompare(b);
          });
          setTeams(sortedTeams);
        } else {
          setError(result.error);
        }
      } catch (err) {
        setError("Failed to fetch teams");
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
      <div className="grid-container">
        {teams.map((team) => (
          <div
            key={team}
            className={`team-card ${teamAbbreviations[team]}`}
            onClick={() => handleTeamClick(team)}
          >
            {team}
          </div>
        ))}
      </div>
    </div>
  );
};
