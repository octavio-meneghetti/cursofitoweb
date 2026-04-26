import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * MantraTemplate (T23): Pantalla de Sellos de Impacto
 * Ahora con controles de audio, tamaño, color y posicionamiento.
 */
const MantraTemplate = ({ data, onNext, isEditMode, onChange, onAudioUpload }) => {
  const {
    questions = ['¿Qué es?', '¿Para qué?', '¿Cómo la voy a usar?'],
    caption = 'Estas tres preguntas te protegen de la improvisación.',
    buttonText = 'Hacer la práctica',
    accentColor = '#ef4444', 
    backgroundColor = '#05070a',
    audioUrl = '', // Sonido de impacto
    phraseSize = 48, // Tamaño de fuente en px (mobile-first)
    verticalOffset = 0, // Desplazamiento vertical (0 es centro)
    gap = 40 // Espacio entre sellos
  } = data;

  const [visibleStamps, setVisibleStamps] = useState(0);
  const [showExtras, setShowExtras] = useState(false);
  const audioRef = useRef(null);

  // Reproducir sonido de impacto
  const playImpactSound = () => {
    if (audioUrl && audioRef.current) {
        // Clonar audio para solapamiento si los impactos son rápidos
        const sound = new Audio(audioUrl);
        sound.volume = 0.5;
        sound.play().catch(e => console.warn("Audio play blocked", e));
    }
  };

  useEffect(() => {
    setVisibleStamps(0);
    setShowExtras(false);

    if (isEditMode) {
      setVisibleStamps(questions.length);
      setShowExtras(true);
      return;
    }
    
    const timers = questions.map((_, i) => {
        return setTimeout(() => {
            setVisibleStamps(i + 1);
            playImpactSound();
        }, 800 + (i * 1200));
    });

    const finalTimer = setTimeout(() => setShowExtras(true), 1200 + (questions.length * 1500));

    return () => {
        timers.forEach(t => clearTimeout(t));
        clearTimeout(finalTimer);
    };
  }, [isEditMode, questions.length, audioUrl]);

  const handleChange = (field, value) => {
    if (onChange) onChange(field, value);
  };

  if (isEditMode) {
    return (
      <div className="space-y-6 text-main">
        <div className="space-y-4">
            <label className="block">
                <span className="text-[10px] uppercase font-black text-emerald-400 mb-2 block tracking-widest">Frases del Sello</span>
                <textarea 
                    value={questions.join('\n')}
                    onChange={(e) => handleChange('questions', e.target.value.split('\n'))}
                    className="w-full bg-black/40 border border-white/10 p-3 rounded-xl text-sm text-white min-h-[80px]"
                />
            </label>

            <div className="p-4 bg-white/5 border border-white/10 rounded-2xl space-y-4">
                <h4 className="text-[10px] font-black uppercase text-white/40 tracking-widest">Diseño del Sello</h4>
                <div className="grid grid-cols-2 gap-4">
                    <label className="block">
                        <span className="text-[9px] text-dim uppercase font-bold mb-1 block">Color Sello</span>
                        <input type="color" value={accentColor} onChange={(e) => handleChange('accentColor', e.target.value)} className="w-full h-8 bg-transparent cursor-pointer" />
                    </label>
                    <label className="block">
                        <span className="text-[9px] text-dim uppercase font-bold mb-1 block">Tamaño Fuente ({phraseSize}px)</span>
                        <input type="range" min="20" max="100" value={phraseSize} onChange={(e) => handleChange('phraseSize', parseInt(e.target.value))} className="w-full accent-emerald-500" />
                    </label>
                </div>
            </div>

            <div className="p-4 bg-white/5 border border-white/10 rounded-2xl space-y-4">
                <h4 className="text-[10px] font-black uppercase text-white/40 tracking-widest">Posicionamiento</h4>
                <div className="grid grid-cols-2 gap-4">
                    <label className="block">
                        <span className="text-[9px] text-dim uppercase font-bold mb-1 block">Subir/Bajar ({verticalOffset}px)</span>
                        <input type="range" min="-300" max="300" value={verticalOffset} onChange={(e) => handleChange('verticalOffset', parseInt(e.target.value))} className="w-full accent-emerald-500" />
                    </label>
                    <label className="block">
                        <span className="text-[9px] text-dim uppercase font-bold mb-1 block">Espacio entre sellos ({gap}px)</span>
                        <input type="range" min="10" max="200" value={gap} onChange={(e) => handleChange('gap', parseInt(e.target.value))} className="w-full accent-emerald-500" />
                    </label>
                </div>
            </div>

            <div className="p-4 bg-white/5 border border-white/10 rounded-2xl space-y-2">
                <h4 className="text-[10px] font-black uppercase text-white/40 tracking-widest mb-2">Efecto de Sonido</h4>
                <div className="flex gap-2">
                    <input 
                        type="text" 
                        value={audioUrl} 
                        onChange={(e) => handleChange('audioUrl', e.target.value)}
                        placeholder="URL del sonido .mp3..."
                        className="flex-1 bg-black/40 border border-white/10 p-2 rounded text-[10px] text-white font-mono"
                    />
                    <label className="cursor-pointer px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[10px] font-bold transition-all shadow-lg">
                        📁 Subir
                        <input type="file" accept="audio/*" className="hidden" onChange={onAudioUpload} />
                    </label>
                </div>
            </div>
        </div>
      </div>
    );
  }

  const stampVariants = {
    hidden: { opacity: 0, scale: 4, rotate: -25, y: -80 },
    visible: (i) => ({ 
        opacity: 1, 
        scale: 1, 
        rotate: [-12, -6, -15][i % 3], 
        y: 0,
        transition: { type: "spring", damping: 12, stiffness: 250 }
    })
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-10 text-center relative overflow-hidden bg-[#05070a]">
      
      {/* Glow de Fondo */}
      <motion.div 
        animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
        transition={{ duration: 6, repeat: Infinity }}
        className="absolute w-[600px] h-[600px] rounded-full blur-[140px] pointer-events-none z-0"
        style={{ backgroundColor: accentColor }}
      />

      <audio ref={audioRef} src={audioUrl} preload="auto" />

      {/* CONTENEDOR DE SELLOS CON OFFSET */}
      <div 
        className="flex flex-col items-center justify-center relative z-10 w-full max-w-4xl transition-all"
        style={{ 
            transform: `translateY(${verticalOffset}px)`,
            gap: `${gap}px`
        }}
      >
        {questions.map((q, idx) => (
          <div key={idx} className="flex items-center justify-center w-full">
            <AnimatePresence>
                {visibleStamps > idx && (
                <motion.div
                    custom={idx}
                    variants={stampVariants}
                    initial="hidden"
                    animate="visible"
                    className="relative"
                >
                    {/* El Sello */}
                    <div 
                        className="px-10 py-4 border-[6px] border-double font-black uppercase tracking-tighter"
                        style={{ 
                            borderColor: accentColor, 
                            color: accentColor,
                            fontSize: `${phraseSize}px`,
                            boxShadow: `0 0 30px ${accentColor}11`,
                            backgroundColor: `${backgroundColor}dd`,
                            backdropFilter: 'blur(8px)',
                            lineHeight: 1
                        }}
                    >
                    {q}
                    </div>
                    
                    {/* Impact Flash */}
                    <motion.div 
                        initial={{ opacity: 0.8, scale: 0.8 }}
                        animate={{ opacity: 0, scale: 1.6 }}
                        transition={{ duration: 0.4 }}
                        className="absolute inset-0 border-[6px] border-double pointer-events-none"
                        style={{ borderColor: accentColor }}
                    />
                </motion.div>
                )}
            </AnimatePresence>
          </div>
        ))}
      </div>

      {/* TEXTO Y BOTÓN (Aparecen debajo de los sellos) */}
      <div className="mt-20 flex flex-col items-center">
        <AnimatePresence>
            {showExtras && (
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center"
            >
                <div className="w-12 h-[1px] bg-white/10 mb-6" />
                <p className="text-white/40 text-lg md:text-xl italic font-medium max-w-lg leading-relaxed mb-12">
                    {caption}
                </p>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onNext}
                    className="px-12 py-4 rounded-full bg-white text-black font-black uppercase tracking-[0.4em] text-[10px] shadow-2xl transition-all"
                >
                    {buttonText}
                </motion.button>
            </motion.div>
            )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default MantraTemplate;
