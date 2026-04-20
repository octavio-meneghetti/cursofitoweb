import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const IntroTemplate = ({ data, onNext, isEditMode = false }) => {
  const { 
    character = 'El Guardián', 
    avatarImage = '/guardian.png', 
    audioUrl, 
    subtitlesText = '', 
    accentColor = '#10b981',
    autoContinue = true
  } = data;

  const [currentSubtitle, setCurrentSubtitle] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [parsedSubtitles, setParsedSubtitles] = useState([]);
  const audioRef = useRef(null);

  // Parsear el texto [0:05] Frase... a un array de objetos
  useEffect(() => {
    if (!subtitlesText) return;
    
    const lines = subtitlesText.split('\n');
    const parsed = lines.map(line => {
      const match = line.match(/\[(\d+):(\d+)\]\s*(.*)/);
      if (match) {
        const minutes = parseInt(match[1]);
        const seconds = parseInt(match[2]);
        return {
          time: minutes * 60 + seconds,
          text: match[3]
        };
      }
      return null;
    }).filter(Boolean).sort((a, b) => a.time - b.time);

    setParsedSubtitles(parsed);
  }, [subtitlesText]);

  // Sincronizar subtítulo con el tiempo actual (simulado o real)
  useEffect(() => {
    const active = [...parsedSubtitles].reverse().find(s => s.time <= currentTime);
    if (active && active.text !== currentSubtitle) {
      setCurrentSubtitle(active.text);
    } else if (!active && currentSubtitle) {
      setCurrentSubtitle('');
    }
  }, [currentTime, parsedSubtitles]);

  // Simulación de tiempo en modo edición (Independiente del audio para pruebas rápidas)
  useEffect(() => {
    let interval;
    if (isEditMode && isPlaying && !audioUrl) {
      interval = setInterval(() => {
        setCurrentTime(prev => prev + 0.1);
      }, 100);
    }
    
    return () => {
      clearInterval(interval);
    };
  }, [isEditMode, isPlaying]);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const togglePlay = () => {
    if (isPlaying) {
      if (audioRef.current && audioUrl) audioRef.current.pause();
    } else {
      if (audioRef.current && audioUrl) audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentTime(0);
    setCurrentSubtitle('');
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.pause();
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    if (autoContinue) {
      setTimeout(onNext, 1500);
    }
  };

  // Renderizado para el Editor (Sin animaciones para evitar pantalla negra)
  if (isEditMode) {
    return (
      <div className="flex flex-col items-center justify-between p-4 relative overflow-hidden bg-[#0c0c12] border border-white/5 h-full w-full" style={{ zIndex: 1, pointerEvents: 'auto' }}>
        <div className="absolute inset-0 z-0">
          <div className="absolute w-[500px] h-[500px] rounded-full blur-[150px] opacity-20 -top-20 -left-20" style={{ backgroundColor: accentColor }} />
        </div>

        <div className="relative z-10 mt-4 flex justify-center">
          <img 
            src={avatarImage} 
            alt={character} 
            style={{ width: '240px', height: '240px', objectFit: 'contain' }}
            className="drop-shadow-[0_0_40px_rgba(255,255,255,0.15)]" 
          />
        </div>

        <div className="relative z-20 w-full max-w-xl px-4 text-center min-h-[80px] flex items-center justify-center">
          <div className="text-xl md:text-2xl font-bold leading-relaxed text-white drop-shadow-lg opacity-100">
            {currentSubtitle || (subtitlesText ? "Inicia la previsualización..." : "Escribe subtítulos con tiempo [0:00]...") }
          </div>
        </div>

        <div className="mb-8 flex flex-col items-center gap-6" style={{ zIndex: 9999, pointerEvents: 'auto', position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div className="flex flex-col items-center" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <span className="text-[10px] font-black tracking-[0.4em] uppercase text-white/40 mb-2">
              {Math.floor(currentTime / 60)}:{(Math.floor(currentTime % 60)).toString().padStart(2, '0')}
            </span>
          </div>
          
          <div className="flex items-center gap-8" style={{ pointerEvents: 'auto', display: 'flex', alignItems: 'center', gap: '32px', justifyContent: 'center' }}>
            <button 
              onClick={handleReset}
              title="Reiniciar"
              className="group transition-all active:scale-95"
              style={{ 
                cursor: 'pointer', 
                pointerEvents: 'auto', 
                zIndex: 10000, 
                position: 'relative',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <svg style={{ width: '22px', height: '22px' }} fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
              </svg>
            </button>

            <button 
              onClick={togglePlay}
              title={isPlaying ? "Pausar" : "Reproducir"}
              className="group transition-all active:scale-90"
              style={{ 
                cursor: 'pointer', 
                pointerEvents: 'auto', 
                zIndex: 10000, 
                position: 'relative',
                background: accentColor,
                width: '72px',
                height: '72px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: 'none',
                boxShadow: `0 0 30px ${accentColor}66`
              }}
            >
              {isPlaying ? (
                <svg style={{ width: '28px', height: '28px' }} fill="white" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M6.75 5.25a.75.75 0 01.75.75v12a.75.75 0 01-1.5 0v-12a.75.75 0 01.75-.75zm10.5 0a.75.75 0 01.75.75v12a.75.75 0 01-1.5 0v-12a.75.75 0 01.75-.75z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg style={{ width: '32px', height: '32px', transform: 'translateX(3px)' }} fill="white" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Elemento Audio fundamental para escuchar en el editor */}
        <audio 
          ref={audioRef}
          src={audioUrl}
          onTimeUpdate={handleTimeUpdate}
          onEnded={handleEnded}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-full p-6 relative overflow-hidden bg-[#060608]">
      {/* Fondo Atmosférico */}
      <div className="absolute inset-0 z-0">
        <div 
          className="absolute w-[500px] h-[500px] rounded-full blur-[150px] opacity-20 -top-20 -left-20 animate-pulse"
          style={{ backgroundColor: accentColor }}
        />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
      </div>

      {/* Avatar Narrador */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        className="relative z-10 mb-12"
      >
        <div className="relative group">
          <img 
            src={avatarImage} 
            alt={character} 
            className="w-full max-w-md h-auto object-contain drop-shadow-[0_0_60px_rgba(255,255,255,0.15)]"
            style={{ 
              maskImage: 'linear-gradient(to bottom, black 85%, transparent 100%)',
              filter: isPlaying ? 'drop-shadow(0 0 30px ' + accentColor + '66)' : 'none'
            }}
          />
          {/* Visualizador de Audio (Sutil) */}
          {isPlaying && (
            <motion.div 
              animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-0 rounded-full blur-3xl -z-10"
              style={{ backgroundColor: accentColor }}
            />
          )}
        </div>
      </motion.div>

      {/* Caja de Subtítulos */}
      <div className="relative z-20 w-full max-w-xl px-4 text-center min-h-[120px] flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.p
            key={currentSubtitle}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.5 }}
            className="text-4xl md:text-5xl font-bold leading-relaxed text-white drop-shadow-2xl"
          >
            {currentSubtitle || "Escucha atentamente..."}
          </motion.p>
        </AnimatePresence>
      </div>

      {/* Controles y Nombre */}
      <div className="mt-12 flex flex-col items-center gap-6 z-30">
        <div className="flex flex-col items-center">
          <span className="text-[10px] font-black tracking-[0.4em] uppercase text-white/30 mb-2">Narración Cinemática</span>
        </div>

        <div className="flex items-center gap-10">
            <button 
                onClick={handleReset}
                className="w-12 h-12 rounded-full flex items-center justify-center border border-white/10 bg-white/5 hover:bg-white/10 transition-all active:scale-95"
            >
                <svg className="w-5 h-5 stroke-white" fill="none" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                </svg>
            </button>

            <button 
                onClick={togglePlay}
                className="w-20 h-20 rounded-full flex items-center justify-center shadow-lg transition-all active:scale-90"
                style={{ backgroundColor: accentColor, boxShadow: `0 0 40px ${accentColor}44` }}
            >
                {isPlaying ? (
                    <svg className="w-8 h-8 fill-white" viewBox="0 0 24 24">
                      <path fillRule="evenodd" d="M6.75 5.25a.75.75 0 01.75.75v12a.75.75 0 01-1.5 0v-12a.75.75 0 01.75-.75zm10.5 0a.75.75 0 01.75.75v12a.75.75 0 01-1.5 0v-12a.75.75 0 01.75-.75z" clipRule="evenodd" />
                    </svg>
                ) : (
                    <svg className="w-10 h-10 fill-white translate-x-1" viewBox="0 0 24 24">
                      <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
                    </svg>
                )}
            </button>

            <button 
                onClick={onNext}
                className="px-10 py-3 rounded-full border border-white/10 bg-white/5 text-[10px] font-black uppercase tracking-[0.3em] text-white/50 hover:text-white hover:bg-white/10 transition-all"
            >
                Saltar
            </button>
        </div>
      </div>

      {/* Elemento Audio Invisible */}
      <audio 
        ref={audioRef}
        src={audioUrl}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />
    </div>
  );
};

export default IntroTemplate;
