import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import LevelEditor from './pages/LevelEditor';
import MapSettings from './pages/MapSettings';
import MapThemeEditor from './pages/MapThemeEditor';
import ModuleMapSettings from './pages/ModuleMaps/ModuleMapSettings';
import CourseManager from './pages/CourseManager';
import ResourceManager from './pages/ResourceManager';
import EconomySettings from './pages/EconomySettings';
import PreviewWindow from './pages/PreviewWindow';
import StudentAnalytics from './pages/StudentAnalytics';
import GlobalSettings from './pages/GlobalSettings';
import StudentAppContainer from '@student/components/StudentAppContainer';
import './index.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/analytics" element={<StudentAnalytics />} />
          <Route path="/settings" element={<GlobalSettings />} />
          <Route path="/course/:courseId" element={<CourseManager />} />
          <Route path="/editor/new/:courseId" element={<LevelEditor />} />
          <Route path="/editor/:lessonId" element={<LevelEditor />} />
          <Route path="/map-editor" element={<MapSettings />} />
          <Route path="/module-map" element={<ModuleMapSettings />} />
          <Route path="/map-theme" element={<MapThemeEditor />} />
          <Route path="/resources" element={<ResourceManager />} />
          <Route path="/economy" element={<EconomySettings />} />
          <Route path="/editor-preview" element={<PreviewWindow />} />
          <Route path="/student-preview/*" element={<StudentAppContainer onExit={() => window.location.href = '/'} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
