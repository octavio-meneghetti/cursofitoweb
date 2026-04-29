import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { masteryService } from '../lib/masteryService';
import QuizTemplate from './templates/QuizTemplate';
import DragMatchTemplate from './templates/DragMatchTemplate';
import SwipeTemplate from './templates/SwipeTemplate';
import MissionActionTemplate from './templates/MissionActionTemplate';
import BotanicalRecordTemplate from './templates/BotanicalRecordTemplate';
import QuickBurstQuizTemplate from './templates/QuickBurstQuizTemplate';
import DecisionGridTemplate from './templates/DecisionGridTemplate';

const PracticeEngine = ({ user, onExit, onReward }) => {
  const [loading, setLoading] = useState(true);
  const [sessionScreens, setSessionScreens] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);

  useEffect(() => {
    if (user) {
      loadSession();
    }
  }, [user]);

  const loadSession = async () => {
    setLoading(true);
    try {
      // 1. Obtener conceptos a repasar
      const concepts = await masteryService.getReviewConcepts(user.uid);
      
      if (concepts.length === 0) {
        setSessionScreens([]);
        setLoading(false);
        return;
      }

      // 2. Mapeo de conceptos por defecto a tipos de plantilla
      const defaultMappings = {
        'mission_action': 'T19_MISSION_ACTION',
        'botanical_record': 'T20_BOTANICAL_RECORD',
        'quick_burst': 'T21_QUICK_BURST',
        'decision_grid': 'T22_DECISION_GRID'
      };

      // 3. Buscar pantallas que correspondan a esos conceptos
      const screensFound = [];
      const lessonsSnap = await getDocs(collection(db, 'lessons'));
      const allLessons = lessonsSnap.docs.map(d => d.data());

      for (const concept of concepts) {
        let found = false;
        const targetTemplate = defaultMappings[concept.conceptId];

        for (const lesson of allLessons) {
          if (lesson.screens) {
            const screen = lesson.screens.find(s => {
              // Coincidencia exacta por ID
              if (s.conceptId === concept.conceptId || s.data?.conceptId === concept.conceptId) return true;
              
              // Coincidencia inteligente por tipo de plantilla (si no tiene ID puesto)
              if (targetTemplate && (s.templateId === targetTemplate || s.template === targetTemplate)) {
                if (!s.conceptId && !s.data?.conceptId) return true;
              }

              return false;
            });

            if (screen) {
              screensFound.push({
                ...screen,
                conceptId: concept.conceptId
              });
              found = true;
              break;
            }
          }
        }
        if (screensFound.length >= 10) break;
      }

      setSessionScreens(screensFound);
    } catch (err) {
      console.error("Error cargando sesión de práctica:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (currentIdx < sessionScreens.length - 1) {
      setCurrentIdx(currentIdx + 1);
    } else {
      if (onReward) onReward({ energy: 1 });
      alert("¡Repaso completado! Tu energía vital ha aumentado (🔋 +1 ATP).");
      onExit();
    }
  };

  const handleResult = ({ success, conceptId, metadata }) => {
    if (user && conceptId) {
      masteryService.reportInteraction(user.uid, conceptId, success, metadata);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-[#060608] flex flex-col items-center justify-center z-[200]">
        <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-6" />
        <p className="text-emerald-400 font-black tracking-widest animate-pulse uppercase">Conectando Red Micelial...</p>
      </div>
    );
  }

  if (sessionScreens.length === 0) {
    return (
      <div className="fixed inset-0 bg-[#060608] flex flex-col items-center justify-center z-[200] p-10 text-center">
        <span className="text-6xl mb-6">🌟</span>
        <h2 className="text-white text-2xl font-black mb-2 uppercase">¡Sabiduría Radiante!</h2>
        <p className="text-white/40 max-w-xs mb-10">No tienes conceptos pendientes de repaso. Vuelve mañana para fortalecer tu conexión.</p>
        <button onClick={onExit} className="px-10 py-4 bg-emerald-500 text-black font-black uppercase tracking-widest rounded-2xl">VOLVER AL MAPA</button>
      </div>
    );
  }

  const screen = sessionScreens[currentIdx];

  const renderScreen = () => {
    const commonProps = {
      data: screen.data || screen,
      onNext: handleNext,
      onResult: handleResult,
      isEditMode: false
    };

    switch (screen.templateId || screen.template) {
      case 'T02_QUIZ_SELECT':
        return <QuizTemplate {...commonProps} />;
      case 'T03_SWIPE_CARDS':
        return <SwipeTemplate {...commonProps} />;
      case 'T06_DRAG_MATCH':
        return <DragMatchTemplate {...commonProps} />;
      case 'T19_MISSION_ACTION':
        return <MissionActionTemplate {...commonProps} />;
      case 'T20_BOTANICAL_RECORD':
        return <BotanicalRecordTemplate {...commonProps} />;
      case 'T21_QUICK_BURST':
        return <QuickBurstQuizTemplate {...commonProps} />;
      case 'T22_DECISION_GRID':
        return <DecisionGridTemplate {...commonProps} />;
      default:
        // Fallback simple si no conocemos la plantilla o es narrativa
        return (
          <div className="flex flex-col items-center justify-center h-full p-10 text-white">
            <h3 className="text-xl mb-4">Repaso de Concepto</h3>
            <p className="mb-10 text-center opacity-70">{screen.data?.text || "Analiza este concepto para reforzar tu conexión."}</p>
            <button onClick={handleNext} className="px-8 py-3 bg-emerald-500 text-black font-bold rounded-xl">CONTINUAR</button>
          </div>
        );
    }
  };

  return (
    <div className="practice-engine fixed inset-0 z-[250] bg-[#060608]">
      <div className="fixed top-0 left-0 w-full h-1 bg-white/5 z-[260]">
        <div 
          className="h-full bg-emerald-400 transition-all duration-500 shadow-[0_0_10px_#10b981]" 
          style={{ width: `${((currentIdx + 1) / sessionScreens.length) * 100}%` }}
        />
      </div>
      
      <button 
        onClick={onExit}
        className="fixed top-6 left-6 z-[260] w-10 h-10 rounded-full bg-black/40 border border-white/10 flex items-center justify-center text-white"
      >
        ✕
      </button>

      {renderScreen()}
    </div>
  );
};

export default PracticeEngine;
