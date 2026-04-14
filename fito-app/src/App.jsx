import React from 'react';
import MundoMapa from './components/MundoMapa';
import LessonEngine from './components/LessonEngine';
import { mockLessons } from './data/mockLessons';
import './index.css';

function App() {
  const [view, setView] = React.useState('map'); // 'map' o 'lesson'

  return (
    <div className="App">
      {view === 'map' ? (
        <MundoMapa onSelectZone={(zoneId) => setView('lesson')} />
      ) : (
        <LessonEngine 
          lesson={mockLessons[0]} 
          onExit={() => setView('map')} 
        />
      )}
    </div>
  );
}

export default App;
