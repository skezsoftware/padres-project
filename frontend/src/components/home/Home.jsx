import React from 'react'
import { TeamGrid } from './TeamGrid'
import './home.css'

export const Home = () => {
  return (
    <div className="home-container">
      <div className="intro-text">
        <h1>MLB Pitching Analytics Hub</h1>
        <p>Dive deep into comprehensive pitching statistics and analysis. Select any team to explore their pitching staff's performance metrics, including strikeout rates, walk percentages, and advanced analytics.</p>
      </div>
      <TeamGrid />
    </div>
  )
}

