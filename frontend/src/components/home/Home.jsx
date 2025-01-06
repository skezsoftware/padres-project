import React from 'react'
import { StrikeoutPercentage } from '../pitcher_strikeouts/StrikeoutPercentage'
import { FirstPitchStrikes } from '../pitcher_fps/FirstPitchStrikes'
import { WalkPercentage } from '../pitcher_walks/WalkPercentage'
import { KbbRatio } from '../kbb_ratio/KBBRatio'
import { FieldingIndependentPitching } from '../fip/FieldingIndependentPitching'
import { TeamGrid } from './TeamGrid'
import './home.css'

export const Home = () => {
  return (
    <div className="home-container">
      <h1>Pitcher Stats</h1>
      <TeamGrid />
      <div className="stats-container">
        <StrikeoutPercentage />
        <FirstPitchStrikes />
        <WalkPercentage />
        <KbbRatio />
        <FieldingIndependentPitching />
      </div>
    </div>
  )
}

