import React from "react";
import { TeamGrid } from "./TeamGrid";
import "./home.css";

export const Home = () => {
  return (
    <div className="home-container">
      <div className="intro-text">
        <h1>MLB Pitching Analytics Hub</h1>
        <p>
          Explore comprehensive pitching statistics and key performance indicators from the San Diego Padres' July 2024 games. 
          Select the Padres to analyze their pitching staff's performance, or choose any other team to see how their 
          pitchers fared against Padres hitters during this period. Dive into detailed metrics including strikeout rates, 
          walk percentages, and advanced analytics.
        </p>
      </div>
      <TeamGrid />
    </div>
  );
};
