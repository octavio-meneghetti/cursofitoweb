import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * IntroTemplate: Narrativa Cinematográfica Premium
 * Unificada para funcionar en entornos con y sin Tailwind (fito-admin y fito-app)
 */
const IntroTemplate = ({ data, onNext, isEditMode = false }) => {
  const { 
    character = 'El Guardián', 
    avatarImage = '/guardian.png', 
    audioUrl, 
    subtitlesText = '', 
    accentColor = '#10b981',
    autoContinue = true,
    titleSize,
    dialogueSize
  } = data;

  const [currentSubtitle, setCurrentSubtitle] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [parsedSubtitles, setParsedSubtitles] = useState([]);
  const [activeSpeakerData, setActiveSpeakerData] = useState(null);
  const audioRef = useRef(null);

  // 1. LÓGICA DE PARSEO DE SUBTÍTULOS
  useEffect(() => {
    if (!subtitlesText) return;
    
    const lines = subtitlesText.split('\n');
    const parsed = lines.map(line => {
      const match = line.match(/\[(\d+):(\d+)\]\s*(?:\[([^\]]+)\]|([^:]+):)?\s*(.*)/);
      if (match) {
        const minutes = parseInt(match[1]);
        const seconds = parseInt(match[2]);
        const speakerName = (match[3] || match[4] || '').trim() || null;
        return {
          time: minutes * 60 + seconds,
          speaker: speakerName,
          text: match[5] ? match[5].trim() : ''
        };
      }
      return null;
    }).filter(Boolean).sort((a, b) => a.time - b.time);

    setParsedSubtitles(parsed);
  }, [subtitlesText]);

  // 2. SINCRONIZACIÓN DE TIEMPO
  useEffect(() => {
    const active = [...parsedSubtitles].reverse().find(s => s.time <= currentTime);
    
    if (active) {
      if (active.text !== currentSubtitle) {
        setCurrentSubtitle(active.text);
      }
      
      if (active.speaker) {
        const meta = (data.speakers && data.speakers[active.speaker]) ? data.speakers[active.speaker] : {};
        setActiveSpeakerData({
            name: active.speaker,
            ...meta
        });
      } else {
        setActiveSpeakerData(null);
      }
    } else {
      setCurrentSubtitle('');
      setActiveSpeakerData(null);
    }
  }, [currentTime, parsedSubtitles, data.speakers]);

  // 3. ESTILOS DINÁMICOS BASADOS EN EL PERSONAJE
  const displayCharacter = activeSpeakerData?.name || character;
  const displayColor = activeSpeakerData?.color || accentColor;
  const displayAvatar = (data.autoChangeAvatar && activeSpeakerData?.avatar) ? activeSpeakerData.avatar : avatarImage;
  const displayTextColor = activeSpeakerData?.textColor || '#e2e8f0';
  const displayTitleColor = activeSpeakerData?.titleColor || displayColor;
  
  const currentTitleSize = activeSpeakerData?.titleSize || titleSize || 24;
  const currentDialogueSize = activeSpeakerData?.dialogueSize || dialogueSize || 18;

  // 4. MANEJO DE REPRODUCCIÓN
  useEffect(() => {
    let interval;
    if (isPlaying && !audioUrl) {
      interval = setInterval(() => {
        setCurrentTime(prev => prev + 0.1);
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isPlaying, audioUrl]);

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

  // --- ESTILOS INLINE PARA MÁXIMA ROBUSTEZ ---
  const containerStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    height: '100%',
    minHeight: isEditMode ? '100%' : '100vh',
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: isEditMode ? '#0c0c12' : '#060608',
    padding: '2rem 1.5rem',
    color: '#fff',
    fontFamily: '"Inter", sans-serif'
  };

  const glassPanelStyle = {
    background: 'rgba(20, 26, 35, 0.75)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    borderRadius: '24px',
    border: `1px solid ${displayColor}44`,
    padding: '2rem',
    width: '100%',
    maxWidth: '520px',
    textAlign: 'center',
    boxShadow: `0 0 20px ${displayColor}1A`,
    transition: 'all 0.5s ease'
  };

  return (
    <div style={containerStyle}>
      {/* Fondo Atmosférico (Glow) */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        <div 
          style={{ 
            position: 'absolute', 
            width: '600px', 
            height: '600px', 
            borderRadius: '50%', 
            filter: 'blur(150px)', 
            opacity: 0.15, 
            top: '-10%', 
            left: '-10%',
            backgroundColor: displayColor,
            transition: 'background-color 1s ease'
          }} 
        />
        <div style={{ position: 'absolute', inset: 0, opacity: 0.05, backgroundImage: "url('https://www.transparenttextures.com/patterns/carbon-fibre.png')" }} />
      </div>

      {/* 1. NARRADOR (AVATAR) */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10, width: '100%', marginBottom: '1rem' }}>
        <AnimatePresence mode="wait">
          <motion.img 
            key={displayAvatar}
            src={displayAvatar} 
            alt={displayCharacter} 
            initial={{ opacity: 0, scale: 0.85, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: -20 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            style={{ 
              maxWidth: '320px', 
              width: '100%',
              height: 'auto',
              maxHeight: '42vh',
              objectFit: 'contain',
              filter: isPlaying ? `drop-shadow(0 0 35px ${displayColor}66)` : `drop-shadow(0 0 15px rgba(255,255,255,0.05))`,
              WebkitMaskImage: 'linear-gradient(to bottom, black 85%, transparent 100%)',
              maskImage: 'linear-gradient(to bottom, black 85%, transparent 100%)',
              transition: 'filter 0.5s ease'
            }}
          />
        </AnimatePresence>
      </div>

      {/* 2. CAJA DE DIÁLOGO (GLASSMORPISM) */}
      <div style={{ width: '100%', display: 'flex', justifyContent: 'center', marginBottom: '2.5rem', zIndex: 20 }}>
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          style={glassPanelStyle}
        >
          <h2 style={{ 
            color: displayTitleColor, 
            fontSize: `${currentTitleSize}px`, 
            textTransform: 'uppercase', 
            letterSpacing: '0.25em', 
            fontWeight: 900,
            marginBottom: '1rem',
            transition: 'color 0.5s ease'
          }}>
            {displayCharacter}
          </h2>
          
          <div style={{ minHeight: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <AnimatePresence mode="wait">
              <motion.p
                key={currentSubtitle || 'empty'}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.4 }}
                style={{ 
                  color: displayTextColor, 
                  fontSize: `${currentDialogueSize}px`, 
                  lineHeight: 1.6, 
                  fontWeight: 500,
                  transition: 'color 0.5s ease'
                }}
              >
                {currentSubtitle || (subtitlesText ? (isPlaying ? "Escuchando..." : "Inicia la historia") : "Escribe diálogos en el editor...")}
              </motion.p>
            </AnimatePresence>
          </div>
        </motion.div>
      </div>

      {/* 3. CONTROLES DE REPRODUCCIÓN */}
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', paddingBottom: '1.5rem', zIndex: 30, position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '2.5rem' }}>
          {/* BOTÓN REINICIAR */}
          <button 
            onClick={handleReset}
            style={{ 
              width: '44px', height: '44px', 
              borderRadius: '50%', 
              backgroundColor: 'rgba(255,255,255,0.05)', 
              border: '1px solid rgba(255,255,255,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.3s'
            }}
            title="Reiniciar"
          >
            <svg style={{ width: '20px', height: '20px', stroke: '#fff' }} fill="none" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
          </button>

          {/* BOTÓN PLAY/PAUSE (PREMIUM GLOW) */}
          <button 
            onClick={togglePlay}
            style={{ 
              width: '80px', height: '80px', 
              borderRadius: '50%', 
              backgroundColor: displayColor, 
              border: 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: `0 0 35px ${displayColor}66`,
              transition: 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
            }}
          >
            {isPlaying ? (
              <svg style={{ width: '32px', height: '32px', fill: '#fff' }} viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M6.75 5.25a.75.75 0 01.75.75v12a.75.75 0 01-1.5 0v-12a.75.75 0 01.75-.75zm10.5 0a.75.75 0 01.75.75v12a.75.75 0 01-1.5 0v-12a.75.75 0 01.75-.75z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg style={{ width: '36px', height: '36px', fill: '#fff', transform: 'translateX(3px)' }} viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
              </svg>
            )}
          </button>

          {/* BOTÓN SALTAR */}
          <button 
            onClick={onNext}
            style={{ 
              padding: '12px 28px', 
              borderRadius: '99px', 
              backgroundColor: 'rgba(255,255,255,0.05)', 
              border: '1px solid rgba(255,255,255,0.1)',
              color: 'rgba(255,255,255,0.5)',
              fontSize: '11px',
              fontWeight: 900,
              textTransform: 'uppercase',
              letterSpacing: '0.2em',
              cursor: 'pointer',
              transition: 'all 0.3s'
            }}
          >
            Saltar
          </button>
        </div>

        {/* BARRA DE PROGRESO */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
          <span style={{ fontSize: '12px', fontWeight: 900, letterSpacing: '0.4em', color: 'rgba(255,255,255,0.3)', marginBottom: '0.5rem', fontVariantNumeric: 'tabular-nums' }}>
             {Math.floor(currentTime / 60)}:{(Math.floor(currentTime % 60)).toString().padStart(2, '0')}
          </span>
          <div style={{ height: '6px', width: '140px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '99px', overflow: 'hidden' }}>
            <motion.div 
              style={{ 
                height: '100%', 
                backgroundColor: 'rgba(255,255,255,0.5)',
                width: (audioRef.current && audioRef.current.duration) ? `${(currentTime / audioRef.current.duration) * 100}%` : (isPlaying && !audioUrl ? `${(currentTime / 60) * 100}%` : '0%') 
              }} 
            />
          </div>
        </div>
      </div>

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
