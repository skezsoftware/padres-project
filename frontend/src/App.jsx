import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Home } from "./components/home_page/Home";
import { TeamDashboard } from "./components/kpi_page/TeamDashboard";
import { Header } from "./components/header/Header";
import { HeatMapPage } from "./components/heatmaps_leaderboards_page/HeatMapPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <>
              <Header />
              <Home />
            </>
          }
        />
        <Route
          path="/team/:teamId"
          element={
            <>
              <Header />
              <TeamDashboard />
            </>
          }
        />
        <Route
          path="/heatmaps/:teamId"
          element={
            <>
              <Header />
              <HeatMapPage />
            </>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
