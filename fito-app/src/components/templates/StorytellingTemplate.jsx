import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * T16_STORYTELLING (v2): Jerárquico - Escenas > Frases
 * La imagen y personaje se mantienen fijos mientras se pasan las frases dentro de una escena.
 */
const StorytellingTemplate = ({ data, onNext }) => {
  const { 
    scenes = [], 
    accentColor = '#10b981',
    defaultCharacter = 'El Guardián',
    defaultImage = '/guardian.png'
  } = data;

  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);

  // Normalización de datos para evitar errores
  const activeScenes = scenes.length > 0 ? scenes : [{ 
    phrases: ['Configura las escenas en el editor.'], 
    character: defaultCharacter, 
    image: defaultImage 
  }];
  
  const currentScene = activeScenes[currentSceneIndex];
  const phrases = currentScene.phrases || ['...'];

  const handleNext = () => {
    // Si quedan frases en la escena actual, avanzar frase
    if (currentPhraseIndex < phrases.length - 1) {
      setCurrentPhraseIndex(currentPhraseIndex + 1);
    } 
    // Si no quedan frases pero quedan escenas, avanzar escena y resetear frase
    else if (currentSceneIndex < activeScenes.length - 1) {
      setCurrentSceneIndex(currentSceneIndex + 1);
      setCurrentPhraseIndex(0);
    } 
    // Si es el final de todo, avanzar a la siguiente pantalla del nivel
    else {
      onNext();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 relative overflow-hidden bg-[#060608]">
      {/* Background Glow */}
      <div 
        className="absolute w-96 h-96 rounded-full blur-[120px] opacity-20 animate-pulse-slow"
        style={{ backgroundColor: accentColor, top: '10%', left: '10%' }}
      />

      <div className="relative z-10 w-full max-w-sm flex flex-col items-center">
        
        {/* ESCENA (Imagen): Solo se anima si cambia el índice de escena */}
        <div className="w-full aspect-square mb-8 overflow-hidden rounded-2xl border border-white/10 shadow-2xl relative bg-black/40">
          <AnimatePresence mode="wait">
            <motion.img 
              key={currentSceneIndex + (currentScene.image || defaultImage)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
              src={currentScene.image || defaultImage} 
              alt={currentScene.character || defaultCharacter} 
              className="w-full h-full object-cover"
            />
          </AnimatePresence>
        </div>

        {/* FRASES (Caja de Diálogo): Se anima en cada clic */}
        <div 
          className="glass-panel p-8 w-full text-center relative z-20"
          style={{ 
            borderColor: accentColor, 
            boxShadow: `0 0 20px ${accentColor}33`,
            borderWidth: '1px',
            borderStyle: 'solid'
          }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={`${currentSceneIndex}-${currentPhraseIndex}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-sm uppercase tracking-widest mb-4 font-black" style={{ color: accentColor }}>
                {currentScene.character || defaultCharacter}
              </h2>
              <p className="text-xl md:text-2xl leading-relaxed font-medium text-white drop-shadow-sm">
                {phrases[currentPhraseIndex]}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* Progress Indicator (Global) */}
          <div className="mt-6 flex justify-center gap-1 opacity-20">
             {/* Calculamos el total de frases para mostrar el progreso real */}
             {activeScenes.map((s, sIdx) => (
                (s.phrases || []).map((_, pIdx) => (
                    <div 
                        key={`${sIdx}-${pIdx}`}
                        className={`h-1 rounded-full transition-all duration-300 ${ (sIdx < currentSceneIndex) || (sIdx === currentSceneIndex && pIdx <= currentPhraseIndex) ? 'w-3 opacity-100' : 'w-1'}`}
                        style={{ backgroundColor: (sIdx < currentSceneIndex) || (sIdx === currentSceneIndex && pIdx <= currentPhraseIndex) ? accentColor : '#fff' }}
                    />
                ))
             ))}
          </div>
        </div>

        {/* Continue Button */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handleNext}
          className="mt-12 group relative flex items-center justify-center"
        >
          <div className="px-10 py-3 rounded-full bg-white/5 border border-white/10 text-[11px] font-black uppercase tracking-[0.4em] text-white/50 group-hover:text-white group-hover:bg-white/10 transition-all">
            { (currentSceneIndex === activeScenes.length - 1 && currentPhraseIndex === phrases.length - 1) ? 'Finalizar' : 'Continuar' }
          </div>
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-12 h-[2px] rounded-full blur-[1px] opacity-50" style={{ backgroundColor: accentColor }} />
        </motion.button>
      </div>
    </div>
  );
};

export default StorytellingTemplate;
