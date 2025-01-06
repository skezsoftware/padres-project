import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { TeamGrid } from './components/home/TeamGrid';
import { Home } from './components/home/Home';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<TeamGrid />} />
        <Route path="/team/:teamId" element={<Home />} />
      </Routes>
    </Router>
  );
}

export default App;
