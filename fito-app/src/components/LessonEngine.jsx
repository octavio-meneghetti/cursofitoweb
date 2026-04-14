import React, { useState } from 'react';
import NarrativeTemplate from './templates/NarrativeTemplate';
import QuizTemplate from './templates/QuizTemplate';

const LessonEngine = ({ lesson, onExit }) => {
  const [currentScreenIndex, setCurrentScreenIndex] = useState(0);
  const currentScreen = lesson.screens[currentScreenIndex];

  const handleNext = () => {
    if (currentScreenIndex < lesson.screens.length - 1) {
      setCurrentScreenIndex(currentScreenIndex + 1);
    } else {
      alert("¡Lección completada! Has ganado 10 XP.");
      onExit();
    }
  };

  const renderScreen = () => {
    switch (currentScreen.template) {
      case 'T01_NARRATIVE':
        return <NarrativeTemplate data={currentScreen.data} onNext={handleNext} />;
      case 'T02_QUIZ_SELECT':
        return <QuizTemplate data={currentScreen.data} onNext={handleNext} />;
      default:
        return <div>Plantilla no encontrada: {currentScreen.template}</div>;
    }
  };

  return (
    <div className="lesson-engine">
      {/* Indicador de Progreso */}
      <div className="fixed top-0 left-0 w-full h-1 bg-white/5 z-50">
        <div 
          className="h-full bg-emerald-500 transition-all duration-500" 
          style={{ width: `${((currentScreenIndex + 1) / lesson.screens.length) * 100}%` }}
        />
      </div>

      {/* Botón Home / Volver al Mapa */}
      <button 
        onClick={onExit}
        className="fixed top-6 right-6 z-50 w-12 h-12 glass-panel flex items-center justify-center hover:scale-110 transition-transform shadow-lg"
      >
        <span className="text-xl">🗺️</span>
      </button>

      {renderScreen()}
    </div>
  );
};

export default LessonEngine;
