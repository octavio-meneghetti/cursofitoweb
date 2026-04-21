import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * StatementTemplate (T17): Frase Centrada Minimalista Premium
 * Presenta una frase con animaciones avanzadas y "Human-like typing" con sonido.
 */
const StatementTemplate = ({ data, onNext }) => {
  const { 
    text = 'Tu frase aquí...', 
    accentColor = '#10b981',
    animationType = 'typewriter', // typewriter, fade, blur, zoom
    fontSize = '2.5rem',
    textColor = '#ffffff',
    backgroundColor = '#060608',
    keySoundUrl = '/tecla2.mp3',
    volume = 0.2,
    typingSpeed = 1
  } = data;

  const [displayedText, setDisplayedText] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const audioRef = useRef(null);
  const timerRef = useRef(null);

  // 1. LÓGICA DE TIEMPO HUMANO (IRREGULAR)
  const getDelay = (char) => {
    // Velocidad base irregular (30ms a 150ms)
    let delay = 30 + Math.random() * 120;

    // Pausas naturales por puntuación
    if (char === ' ') delay += 20 + Math.random() * 80;
    if (char === ',' || char === ';' || char === ':') delay += 120 + Math.random() * 180;
    if (char === '.' || char === '!' || char === '?') delay += 250 + Math.random() * 350;
    if (char === '\n') delay += 300 + Math.random() * 300;

    // Pequeña posibilidad de "duda/pensar" (7%)
    if (Math.random() < 0.07) delay += 150 + Math.random() * 400;

    // Aplicamos multiplicador de velocidad (mayor speed = menor delay)
    return delay / Math.max(0.1, typingSpeed);
  };

  // 2. REPRODUCCIÓN DE SONIDO (CON CLONACIÓN PARA SOLAPAMIENTO)
  const playKeySound = (char) => {
    if (char === '\n' || char === ' ') return;
    
    // Si es un punto, usamos el sonido especial 'final.mp3'
    const soundPath = char === '.' ? '/final.mp3' : keySoundUrl;
    if (!soundPath) return;

    try {
      const sound = new Audio(soundPath);
      sound.volume = Math.max(0, Math.min(1, volume * (0.8 + Math.random() * 0.4)));
      sound.play().catch(err => console.warn("Audio play blocked/failed:", err));
    } catch (e) {
      console.error("Audio error:", e);
    }
  };

  // 3. EFECTO DE ESCRITURA (Sólo para modo typewriter)
  useEffect(() => {
    if (animationType !== 'typewriter') {
      setDisplayedText(text);
      setIsComplete(true);
      return;
    }

    // Resetear si cambia el texto
    setDisplayedText('');
    setIsComplete(false);
    let index = 0;

    const typeNext = () => {
      if (index < text.length) {
        const char = text[index];
        setDisplayedText(prev => prev + char);
        playKeySound(char);
        index++;
        timerRef.current = setTimeout(typeNext, getDelay(char));
      } else {
        setIsComplete(true);
      }
    };

    // Pequeño delay inicial antes de empezar
    timerRef.current = setTimeout(typeNext, 600);

    return () => clearTimeout(timerRef.current);
  }, [text, animationType]);

  // 4. ANIMACIONES (Para otros modos)
  const characters = text.split('');
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { 
        staggerChildren: 0.02, 
        delayChildren: 0.3 
      }
    }
  };

  const childVariants = {
    hidden: (type) => {
      switch (type) {
        case 'blur': return { opacity: 0, filter: 'blur(10px)', y: 10 };
        case 'zoom': return { opacity: 0, scale: 0.5, y: 20 };
        default: return { opacity: 0, y: 10 };
      }
    },
    visible: {
      opacity: 1, filter: 'blur(0px)', scale: 1, y: 0,
      transition: { type: 'spring', damping: 12, stiffness: 100 }
    }
  };

  return (
    <div 
      className="flex flex-col items-center justify-center min-h-screen p-8 relative overflow-hidden"
      style={{ backgroundColor }}
    >
      {/* Dynamic Background Glow */}
      <motion.div 
        initial={{ opacity: 0.05, scale: 0.8 }}
        animate={{ opacity: 0.15, scale: 1.1 }}
        transition={{ duration: 4, repeat: Infinity, repeatType: "reverse" }}
        className="absolute w-[600px] h-[600px] rounded-full blur-[140px] pointer-events-none"
        style={{ backgroundColor: accentColor }}
      />

      {/* Audio Element Hidden */}
      <audio ref={audioRef} src={keySoundUrl} preload="auto" />

      <div className="relative z-10 w-full max-w-4xl text-center">
        {animationType === 'typewriter' ? (
          /* MODO TYPEWRITER: Texto Progresivo con Cursor */
          <div 
            style={{ 
              fontSize, 
              lineHeight: 1.4,
              fontWeight: 600,
              color: textColor,
              fontFamily: 'Georgia, serif', // Estilo máquina antigua
              whiteSpace: 'pre-wrap',
              textShadow: `0 0 10px ${accentColor}1A`
            }}
          >
            {displayedText}
            {/* Cursor parpadeante */}
            <motion.span
              animate={{ opacity: [1, 0, 1] }}
              transition={{ repeat: Infinity, duration: 0.8, ease: "steps(2)" }}
              className="inline-block w-3 h-[1em] ml-1 align-middle"
              style={{ backgroundColor: accentColor }}
            />
          </div>
        ) : (
          /* OTROS MODOS: Usando Framer Motion Stagger */
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-wrap justify-center items-center"
            style={{ 
              fontSize, 
              lineHeight: 1.4,
              fontWeight: 600,
              color: textColor,
              fontFamily: '"Inter", sans-serif',
              textShadow: `0 0 20px ${accentColor}22`
            }}
          >
            {characters.map((char, index) => (
              <motion.span
                key={`${char}-${index}`}
                variants={childVariants}
                custom={animationType}
                style={{ 
                  display: char === ' ' ? 'inline' : 'inline-block',
                  whiteSpace: 'pre'
                }}
              >
                {char}
              </motion.span>
            ))}
          </motion.div>
        )}

        {/* Action Button */}
        <AnimatePresence>
          {isComplete && (
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              whileTap={{ scale: 0.95 }}
              onClick={onNext}
              className="mt-20 group relative overflow-hidden"
            >
              <div className="px-14 py-4 rounded-full bg-white/5 border border-white/10 text-[11px] font-black uppercase tracking-[0.6em] text-white/40 group-hover:text-white group-hover:border-white/30 group-hover:bg-white/10 transition-all">
                Continuar
              </div>
              {/* Glow underline */}
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-20 h-[3px] rounded-full blur-[2px] opacity-60" style={{ backgroundColor: accentColor }} />
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default StatementTemplate;
