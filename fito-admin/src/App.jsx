import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import LevelEditor from './pages/LevelEditor';
import MapSettings from './pages/MapSettings';
import './index.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/editor" element={<LevelEditor />} />
          <Route path="/map-editor" element={<MapSettings />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
