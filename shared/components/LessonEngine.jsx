import React, { useState } from 'react';
import NarrativeTemplate from './templates/NarrativeTemplate';
import QuizTemplate from './templates/QuizTemplate';
import SwipeTemplate from './templates/SwipeTemplate';
import FlipTemplate from './templates/FlipTemplate';
import SliderTemplate from './templates/SliderTemplate';
import DragMatchTemplate from './templates/DragMatchTemplate';
import RewardTemplate from './templates/RewardTemplate';
import JournalTemplate from './templates/JournalTemplate';
import HotspotTemplate from './templates/HotspotTemplate';
import OrderingTemplate from './templates/OrderingTemplate';
import ThermoTemplate from './templates/ThermoTemplate';
import ScratchRevealTemplate from './templates/ScratchRevealTemplate';
import MagneticPuzzleTemplate from './templates/MagneticPuzzleTemplate';
import IntroTemplate from './templates/IntroTemplate';
import VideoPresentationTemplate from './templates/VideoPresentationTemplate';
import StorytellingTemplate from './templates/StorytellingTemplate';
import StatementTemplate from './templates/StatementTemplate';
import PromiseChecklistTemplate from './templates/PromiseChecklistTemplate';
import MissionActionTemplate from './templates/MissionActionTemplate';
import BotanicalRecordTemplate from './templates/BotanicalRecordTemplate';
import QuickBurstQuizTemplate from './templates/QuickBurstQuizTemplate';
import DecisionGridTemplate from './templates/DecisionGridTemplate';

const LessonEngine = ({ lesson, onExit, user, initialScreenIndex = 0, onReportResult }) => {
  const [currentScreenIndex, setCurrentScreenIndex] = useState(initialScreenIndex);
  const currentScreen = lesson.screens[currentScreenIndex];

  const handleNext = () => {
    const nav = currentScreen.navigation;

    // Verificar si hay un salto programado
    if (nav && nav.type === 'jump' && nav.jumpTarget) {
      const { lessonId, screenId } = nav.jumpTarget;

      // Si el salto es dentro de la MISMA lección
      if (!lessonId || lessonId === lesson.id) {
        const targetIndex = lesson.screens.findIndex(s => s.id === screenId);
        if (targetIndex !== -1) {
          setCurrentScreenIndex(targetIndex);
          return;
        }
      } else {
        // Si el salto es a OTRA lección (otro día/semana/bloque)
        if (onExit) {
          onExit({ 
            finished: true, 
            jumpTo: nav.jumpTarget 
          });
        }
        return;
      }
    }

    // Comportamiento secuencial normal
    if (currentScreenIndex < lesson.screens.length - 1) {
      setCurrentScreenIndex(currentScreenIndex + 1);
    } else {
      if (!onReportResult) {
        alert("¡Lección completada! (Modo Vista Previa)");
      }
      onExit && onExit();
    }
  };

  const handleResult = ({ success, conceptId, metadata }) => {
    if (onReportResult && user && conceptId) {
      onReportResult(user.uid, conceptId, success, metadata);
    }
  };

  const renderScreen = () => {
    if (!currentScreen) return <div className="text-white p-10">Cargando...</div>;

    switch (currentScreen.templateId || currentScreen.template) {
      case 'T01_NARRATIVE':
        return <NarrativeTemplate data={currentScreen.data} onNext={handleNext} />;
      case 'T02_QUIZ_SELECT':
        return <QuizTemplate data={currentScreen} onNext={handleNext} onResult={handleResult} />;
      case 'T03_SWIPE_CARDS':
        return <SwipeTemplate data={currentScreen.data} onNext={handleNext} onResult={handleResult} isEditMode={false} />;
      case 'T04_FLIP_CARDS':
        return (
          <div className="relative w-full h-full">
            <FlipTemplate data={currentScreen.data} onNext={handleNext} isEditMode={false} />
            <button onClick={handleNext} className="absolute bottom-6 left-1/2 -translate-x-1/2 px-8 py-3 bg-emerald-500 text-black font-bold rounded-full z-50 shadow-2xl">Siguiente &rarr;</button>
          </div>
        );
      case 'T05_SLIDER':
        return (
          <div className="relative w-full h-full">
            <SliderTemplate data={currentScreen.data} onNext={handleNext} isEditMode={false} />
            <button onClick={handleNext} className="absolute bottom-6 left-1/2 -translate-x-1/2 px-8 py-3 bg-emerald-500 text-black font-bold rounded-full z-50 shadow-2xl">Siguiente &rarr;</button>
          </div>
        );
      case 'T06_DRAG_MATCH':
        return (
          <div className="relative w-full h-full">
            <DragMatchTemplate data={currentScreen.data} onNext={handleNext} isEditMode={false} />
            <button onClick={handleNext} className="absolute bottom-6 left-1/2 -translate-x-1/2 px-8 py-3 bg-emerald-500 text-black font-bold rounded-full z-50 shadow-2xl">Siguiente &rarr;</button>
          </div>
        );
      case 'T07_REWARD':
        return (
          <div className="relative w-full h-full">
            <RewardTemplate data={currentScreen.data} onNext={handleNext} isEditMode={false} />
            <button onClick={handleNext} className="absolute bottom-6 left-1/2 -translate-x-1/2 px-8 py-3 bg-yellow-500 text-black font-bold rounded-full z-50 shadow-2xl uppercase tracking-tighter">Cobrar Recompensa</button>
          </div>
        );
      case 'T08_JOURNAL':
        return (
          <div className="relative w-full h-full">
            <JournalTemplate data={currentScreen.data} onNext={handleNext} isEditMode={false} />
            <button onClick={handleNext} className="absolute bottom-6 left-1/2 -translate-x-1/2 px-8 py-3 bg-emerald-500 text-black font-bold rounded-full z-50 shadow-2xl">Guardar Registro</button>
          </div>
        );
      case 'T09_HOTSPOTS':
        return <HotspotTemplate data={currentScreen.data} onNext={handleNext} onResult={handleResult} isEditMode={false} />;
      case 'T10_ORDERING':
        return <OrderingTemplate data={currentScreen.data} onNext={handleNext} onResult={handleResult} isEditMode={false} />;
      case 'T11_THERMO':
        return <ThermoTemplate data={currentScreen.data} onNext={handleNext} onResult={handleResult} isEditMode={false} />;
      case 'T12_SCRATCH':
        return <ScratchRevealTemplate data={currentScreen.data} onNext={handleNext} onResult={handleResult} isEditMode={false} />;
      case 'T13_MAGNETIC':
        return <MagneticPuzzleTemplate data={currentScreen.data} onNext={handleNext} onResult={handleResult} isEditMode={false} />;
      case 'T14_INTRO':
        return <IntroTemplate data={currentScreen.data} onNext={handleNext} />;
      case 'T15_VIDEO':
        return <VideoPresentationTemplate data={currentScreen.data} onNext={handleNext} />;
      case 'T16_STORY_STEPS':
        return <StorytellingTemplate data={currentScreen.data} onNext={handleNext} />;
      case 'T17_STATEMENT':
        return <StatementTemplate data={currentScreen.data} onNext={handleNext} />;
      case 'T18_PROMISE_CHECKLIST':
        return <PromiseChecklistTemplate data={currentScreen.data} onNext={handleNext} />;
      case 'T19_MISSION_ACTION':
        return <MissionActionTemplate data={currentScreen.data} conceptId={currentScreen.conceptId} onNext={handleNext} onResult={handleResult} />;
      case 'T20_BOTANICAL_RECORD':
        return <BotanicalRecordTemplate data={currentScreen.data} conceptId={currentScreen.conceptId} onNext={handleNext} onResult={handleResult} />;
      case 'T21_QUICK_BURST':
        return <QuickBurstQuizTemplate data={currentScreen.data} conceptId={currentScreen.conceptId} onNext={handleNext} onResult={handleResult} />;
      case 'T22_DECISION_GRID':
        return <DecisionGridTemplate data={currentScreen.data} onNext={handleNext} onResult={handleResult} />;
      default:
        return <div className="text-white p-10">Plantilla no encontrada: {currentScreen.templateId || currentScreen.template}</div>;
    }
  };

  return (
    <div className="lesson-engine w-full h-full bg-black relative">
      {/* Indicador de Progreso */}
      <div className="fixed top-0 left-0 w-full h-1 bg-white/5 z-50">
        <div 
          className="h-full bg-emerald-500 transition-all duration-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" 
          style={{ width: `${((currentScreenIndex + 1) / lesson.screens.length) * 100}%` }}
        />
        
        {/* Título de la Pantalla Actual */}
        {currentScreen?.title && (
          <div className="absolute top-4 left-6 z-50">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 block mb-1">Sección</span>
            <span className="text-xs font-bold text-emerald-400/80 uppercase tracking-widest">{currentScreen.title}</span>
          </div>
        )}
      </div>

      {/* Botón Home / Volver al Mapa o Cerrar */}
      <button 
        onClick={onExit}
        className="fixed top-6 right-6 z-50 w-12 h-12 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl flex items-center justify-center hover:scale-110 transition-transform shadow-lg"
      >
        <span className="text-xl">✕</span>
      </button>

      {renderScreen()}
    </div>
  );
};

export default LessonEngine;
