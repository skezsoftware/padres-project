import React from "react";
import { Link, useParams, useLocation, useNavigate } from "react-router-dom";
import { getTeamColor } from "../../utils/teamColors";
import "./header.css";

export const Header = () => {
  const { teamId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const teamColor = getTeamColor(teamId);

  React.useEffect(() => {
    if (teamId) {
      localStorage.setItem("lastTeamId", teamId);
    }
  }, [teamId]);

  const effectiveTeamId = teamId || localStorage.getItem("lastTeamId");

  // Add team options
  const teams = [
    "Arizona Diamondbacks",
    "Atlanta Braves",
    "Baltimore Orioles",
    "Cleveland Guardians",
    "Los Angeles Dodgers",
    "San Diego Padres",
    "Seattle Mariners",
    "Texas Rangers",
    "Washington Nationals",
  ];

  const handleTeamChange = (e) => {
    const newTeam = e.target.value;
    if (newTeam) {
      navigate(`/team/${newTeam}`);
    }
  };

  if (location.pathname === "/") {
    return null;
  }

  const isTeamDashboard = location.pathname.startsWith("/team/");

  return (
    <nav
      className="navbar navbar-expand-lg"
      style={{ backgroundColor: teamColor }}
    >
      <div className="container-fluid">
        <span className="navbar-brand text-white">{effectiveTeamId}</span>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <Link
                to="/"
                className={`nav-link text-white ${
                  location.pathname === "/" ? "active" : ""
                }`}
              >
                TEAMS
              </Link>
            </li>
            <li className="nav-item">
              <Link
                to={`/team/${effectiveTeamId}`}
                className={`nav-link text-white ${
                  isTeamDashboard ? "active" : ""
                }`}
              >
                KEY PERFORMANCE INDICATORS
              </Link>
            </li>
            <li className="nav-item">
              <Link
                to={`/heatmaps/${effectiveTeamId}`}
                className={`nav-link text-white ${
                  location.pathname.startsWith("/heatmaps") ? "active" : ""
                }`}
              >
                HEAT MAPS & LEADERBOARDS
              </Link>
            </li>
          </ul>

          {/* Bootstrap dropdown */}
          <div className="dropdown">
            <button
              className="btn btn-outline-light dropdown-toggle"
              type="button"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              {effectiveTeamId || "Select Team"}
            </button>
            <ul className="dropdown-menu dropdown-menu-end">
              {teams.map((team) => (
                <li key={team}>
                  <button
                    className="dropdown-item"
                    onClick={() =>
                      handleTeamChange({ target: { value: team } })
                    }
                  >
                    {team}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </nav>
  );
};
