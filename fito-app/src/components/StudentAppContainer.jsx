import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import MundoMapa from './MundoMapa';
import LessonEngine from './LessonEngine';
import PracticeEngine from './PracticeEngine';
import AuthScreen from './ui/AuthScreen';
import IntroVideoOverlay from './ui/IntroVideoOverlay';
import JournalView from './JournalView';
import { db, auth } from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, updateDoc, setDoc, Timestamp, serverTimestamp } from 'firebase/firestore';

const StudentAppContainer = ({ user: externalUser, onExit }) => {
  const [internalUser, setInternalUser] = useState(null);
  const [view, setView] = useState('map'); // 'map', 'loading', 'lesson', 'practice', 'intro'
  const [currentLesson, setCurrentLesson] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [introSeen, setIntroSeen] = useState(false);
  
  const [economy, setEconomy] = useState({
    energy: { current: 5, lastRefill: null },
    water: 0,
    compost: 0,
    suns: 0,
    isPremium: false
  });
  const [economyConfig, setEconomyConfig] = useState(null);
  const [showNoEnergy, setShowNoEnergy] = useState(false);
  const [globalConfig, setGlobalConfig] = useState({
    introVideoUrl: 'https://firebasestorage.googleapis.com/v0/b/cursofitoweb.firebasestorage.app/o/Introcursoweb.mp4?alt=media&token=b0078a71-af2a-41d2-9336-caec5dd7eb05'
  });

  const activeUser = externalUser || internalUser;

  useEffect(() => {
    // Cargar config general para ver si saltamos la intro
    const checkSkipIntro = async () => {
      try {
        const { doc, getDoc } = await import('firebase/firestore');
        const themeDoc = await getDoc(doc(db, 'config', 'map_theme'));
        if (themeDoc.exists()) {
          const data = themeDoc.data();
          if (data.skipIntro) setIntroSeen(true);
          if (data.introVideoUrl) setGlobalConfig(prev => ({ ...prev, introVideoUrl: data.introVideoUrl }));
        }
      } catch (err) {
        console.warn("Error verificando skip intro:", err);
      }
    };
    checkSkipIntro();
  }, []);

  useEffect(() => {
    // If we are passed a user from outside (like fito-admin), use it.
    if (externalUser) {
      setInternalUser(externalUser);
      setAuthChecked(true);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setInternalUser(currentUser);
      setAuthChecked(true);
    });
    return () => unsubscribe();
  }, [externalUser]);

  useEffect(() => {
    const activeUser = externalUser || internalUser;
    if (!activeUser) return;

    const fetchEconomy = async () => {
      try {
        const econDoc = await getDoc(doc(db, 'config', 'economy'));
        if (econDoc.exists()) setEconomyConfig(econDoc.data());

        const userDoc = await getDoc(doc(db, 'users', activeUser.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          let currentEcon = userData.economy || { energy: { current: 5, lastRefill: Timestamp.now() }, water: 0, compost: 0, suns: 0 };
          
          // Asegurar que el email está en el documento para el panel admin
          if (!userData.email && activeUser.email) {
            await setDoc(doc(db, 'users', activeUser.uid), { email: activeUser.email }, { merge: true });
          }

          if (econDoc.exists()) {
            const cfg = econDoc.data();
            const now = Date.now();
            const lastRefill = currentEcon.energy.lastRefill?.toMillis() || now;
            const hoursPassed = (now - lastRefill) / (1000 * 60 * 60);
            const pointsToGain = Math.floor(hoursPassed / cfg.hours_per_refill);
            
            if (pointsToGain > 0 && currentEcon.energy.current < cfg.max_energy) {
              currentEcon.energy.current = Math.min(cfg.max_energy, currentEcon.energy.current + pointsToGain);
              currentEcon.energy.lastRefill = Timestamp.now();
              await setDoc(doc(db, 'users', activeUser.uid), { economy: currentEcon, email: activeUser.email }, { merge: true });
            }
          }
          setEconomy(currentEcon);
        } else {
            // Inicializar perfil si no existe
            const initialEcon = { energy: { current: 5, lastRefill: Timestamp.now() }, water: 0, compost: 0, suns: 0 };
            await setDoc(doc(db, 'users', activeUser.uid), { 
              economy: initialEcon, 
              email: activeUser.email,
              createdAt: serverTimestamp() 
            }, { merge: true });
            setEconomy(initialEcon);
        }
      } catch (err) {
        console.warn("Error cargando economía:", err);
      }
    };
    fetchEconomy();
  }, [internalUser, externalUser]);

  const handleZoneSelect = async (islandId, lesson) => {
    if (lesson) {
      console.log("LOG: Iniciando zona", islandId, lesson.id);
      // Validar Energía (solo si no es premium)
      if (!economy.isPremium && economy.energy.current < (economyConfig?.cost_new_lesson || 1)) {
        console.log("LOG: Sin energía");
        setShowNoEnergy(true);
        return;
      }

      // Cambiamos la vista inmediatamente para mejor UX (Optimista)
      setCurrentLesson(lesson);
      setView('lesson');

      // Consumir Energía en background
      if (!economy.isPremium) {
        try {
          const newEcon = { ...economy };
          newEcon.energy.current -= (economyConfig?.cost_new_lesson || 1);
          newEcon.energy.lastRefill = Timestamp.now();
          setEconomy(newEcon);
          await setDoc(doc(db, 'users', activeUser.uid), { economy: newEcon }, { merge: true });
          console.log("LOG: Energía consumida y guardada");
        } catch (err) {
          console.error("LOG ERROR: Fallo al guardar consumo de energía", err);
        }
      }
    } else {
      alert('Esta zona herbolaria aún no ha sido mapeada.');
    }
  };
  const handleReward = async (rewards) => {
    if (!activeUser) return;
    const newEcon = { ...economy };
    
    if (rewards.energy || rewards.rewardEnergy) newEcon.energy.current = Math.min(economyConfig?.max_energy || 5, newEcon.energy.current + (rewards.energy || rewards.rewardEnergy || 0));
    if (rewards.water || rewards.rewardWater) newEcon.water += (rewards.water || rewards.rewardWater || 0);
    if (rewards.compost || rewards.rewardCompost) newEcon.compost += (rewards.compost || rewards.rewardCompost || 0);
    if (rewards.suns || rewards.rewardSuns) newEcon.suns += (rewards.suns || rewards.rewardSuns || 0);
    
    setEconomy(newEcon);
    await setDoc(doc(db, 'users', activeUser.uid), { economy: newEcon }, { merge: true });
  };

  const handleReportResult = async (uid, conceptId, success, metadata) => {
    console.log("LOG: Reportando resultado", conceptId, success);
    try {
      // 1. Guardar entradas de Diario o Decisiones en el Cuaderno de Campo
      if (metadata?.isJournalEntry || metadata?.decision) {
        const { journalService } = await import('../lib/journalService');
        await journalService.saveEntry(uid, conceptId, metadata);
      } else {
        // 2. Reportar al servicio de maestría (antiguo) para quizzes y retos
        const { masteryService } = await import('../lib/masteryService');
        await masteryService.reportInteraction(uid, conceptId, success, metadata);

        // 3. Lógica de Compost / Energía por fallo
        if (!success) {
            const newEcon = { ...economy };
            newEcon.compost += (economyConfig?.reward_compost_failure || 1);
            setEconomy(newEcon);
            await setDoc(doc(db, 'users', activeUser.uid), { economy: newEcon }, { merge: true });
        }
      }
      console.log("LOG: Resultado reportado con éxito");
    } catch (err) {
      console.error("LOG ERROR: Fallo al reportar resultado", err);
    }
  };

  const handleLessonExit = async (result) => {
    if (result?.lessonCompleted) {
        // Aquí podríamos verificar si terminó el día/semana/bloque (Herencia de premios)
        // Por ahora, solo volvemos al mapa
    }
    setView('map');
  };

  if (!authChecked) {
    return (
      <div className="fixed inset-0 bg-[#060608] flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!activeUser) {
    return <AuthScreen onAuthSuccess={() => {
      // Al loguearse con éxito, mostramos la intro antes de ir al mapa
      setView('intro');
    }} />;
  }

  // Si acabamos de entrar (con usuario ya logueado) y no hemos visto la intro, la mostramos
  if (activeUser && !introSeen && view === 'map') {
    setView('intro');
  }

  return (
    <div className="StudentApp relative">
      {view === 'map' && (
        <MundoMapa 
          onSelectZone={handleZoneSelect} 
          onPracticeClick={() => setView('practice')}
          onJournalClick={() => setView('journal')}
          user={activeUser}
          economy={economy}
          economyConfig={economyConfig}
          onUpdateEconomy={handleReward}
        />
      )}

      {/* OVERLAY SIN ENERGIA */}
      <AnimatePresence>
        {showNoEnergy && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[300] flex items-center justify-center p-8 backdrop-blur-xl bg-black/80">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-[#0c0c12] border border-white/10 p-10 rounded-[3rem] text-center max-w-sm shadow-2xl">
                <span className="text-6xl mb-6 block animate-pulse">🔋</span>
                <h2 className="text-2xl font-black text-white uppercase mb-2 tracking-tighter">Sin ATP Vital</h2>
                <p className="text-white/40 uppercase tracking-widest text-[10px] mb-8 leading-relaxed">
                  Te has quedado sin energía para asimilar nuevos conocimientos. 
                  <br /><br />
                  <span className="text-amber-500/60 font-black">Descansa en el Santuario o haz una práctica para recuperar fuerzas.</span>
                </p>
                <div className="flex flex-col gap-3">
                  <button onClick={() => setShowNoEnergy(false)} className="w-full py-4 bg-white text-black font-black uppercase text-[10px] rounded-2xl tracking-widest">Entendido</button>
                  <button onClick={() => { setShowNoEnergy(false); setView('practice'); }} className="w-full py-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-black uppercase text-[10px] rounded-2xl tracking-widest">Hacer Práctica (+1 ATP)</button>
                </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {view === 'intro' && (
        <IntroVideoOverlay 
          videoUrl={globalConfig.introVideoUrl}
          onVideoEnd={() => {
            setIntroSeen(true);
            setView('map');
          }} 
        />
      )}
      
      {view === 'loading' && (
        <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-50">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full mx-auto mb-4 animate-spin" />
          <p className="text-emerald-500 font-bold tracking-widest animate-pulse uppercase">Cargando Lección...</p>
        </div>
      )}

      {view === 'lesson' && currentLesson && (
        <LessonEngine 
          lesson={currentLesson} 
          user={activeUser}
          onExit={handleLessonExit} 
          onReward={handleReward}
          onReportResult={handleReportResult}
        />
      )}

      {/* Journal View */}
      {view === 'journal' && (
        <JournalView 
          userId={activeUser.uid}
          onBack={() => setView('map')}
        />
      )}

      {/* Practice view */}
      {view === 'practice' && (
        <PracticeEngine 
          user={activeUser}
          onExit={() => setView('map')}
          onReward={handleReward}
        />
      )}

      {onExit && (
        <button 
          onClick={onExit}
          className="fixed top-6 right-20 z-[110] px-4 py-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl text-[10px] font-black tracking-widest uppercase hover:bg-red-500/30 transition-all"
        >
          Cerrar Vista Alumno
        </button>
      )}
    </div>
  );
};

export default StudentAppContainer;
