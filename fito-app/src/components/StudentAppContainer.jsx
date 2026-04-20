import React, { useState, useEffect } from 'react';
import MundoMapa from './MundoMapa';
import LessonEngine from './LessonEngine';
import PracticeEngine from './PracticeEngine';
import AuthScreen from './ui/AuthScreen';
import IntroVideoOverlay from './ui/IntroVideoOverlay';
import { db, auth } from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

const StudentAppContainer = ({ user: externalUser, onExit }) => {
  const [internalUser, setInternalUser] = useState(null);
  const [view, setView] = useState('map'); // 'map', 'loading', 'lesson', 'practice', 'intro'
  const [currentLesson, setCurrentLesson] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [introSeen, setIntroSeen] = useState(false);

  useEffect(() => {
    // Cargar config general para ver si saltamos la intro
    const checkSkipIntro = async () => {
      try {
        const { doc, getDoc } = await import('firebase/firestore');
        const themeDoc = await getDoc(doc(db, 'config', 'map_theme'));
        if (themeDoc.exists() && themeDoc.data().skipIntro) {
          setIntroSeen(true);
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

  const handleZoneSelect = (islandId, lesson) => {
    if (lesson) {
      setCurrentLesson(lesson);
      setView('lesson');
    } else {
      alert('Esta zona herbolaria aún no ha sido mapeada.');
    }
  };

  const activeUser = externalUser || internalUser;

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
        />
      )}

      {view === 'intro' && (
        <IntroVideoOverlay 
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
          onExit={() => setView('map')} 
        />
      )}

      {/* Practice view */}
      {view === 'practice' && (
        <PracticeEngine 
          user={activeUser}
          onExit={() => setView('map')}
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
