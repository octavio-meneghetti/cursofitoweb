import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const QuizTemplate = ({ data, onNext, onResult }) => {
  const { character, pregunta, opciones, correctIndex, feedback, accentColor, conceptId } = data;
  const [selected, setSelected] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);

  const handleSelect = (index) => {
    if (showFeedback) return;
    const isCorrect = index === correctIndex;
    setSelected(index);
    setShowFeedback(true);
    
    // Reportamos al sistema de maestría
    if (onResult) {
      onResult({
        success: isCorrect,
        conceptId: data.conceptId, // Viene de la data de la pantalla
        metadata: {
          selectedAnswer: opciones[index],
          correctAnswer: opciones[correctIndex]
        }
      });
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 relative bg-dark">
      <div 
        className="absolute w-72 h-72 rounded-full blur-[100px] opacity-10"
        style={{ backgroundColor: accentColor, top: '5%', right: '5%' }}
      />

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-panel p-8 w-full max-w-lg neon-border-green z-10"
      >
        <span className="text-dim text-xs uppercase tracking-tighter mb-2 block">{character} pregunta:</span>
        <h2 className="text-2xl font-bold mb-8 leading-tight">{pregunta}</h2>

        <div className="space-y-4">
          {opciones.map((opcion, index) => (
            <motion.button
              key={index}
              whileHover={{ x: 5 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleSelect(index)}
              className={`w-full text-left p-5 rounded-xl border transition-all duration-300 font-medium ${
                selected === index 
                  ? (index === correctIndex ? 'bg-emerald-900/40 border-emerald-500 text-emerald-200' : 'bg-red-900/40 border-red-500 text-red-200')
                  : 'bg-white/5 border-white/10 hover:bg-white/10'
              }`}
            >
              {opcion}
            </motion.button>
          ))}
        </div>

        <AnimatePresence>
          {showFeedback && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              className="mt-8 pt-6 border-t border-white/10"
            >
              <p className={`text-lg italic ${selected === correctIndex ? 'text-emerald-400' : 'text-red-400'}`}>
                {selected === correctIndex ? "✓ " : "✕ "} {feedback}
              </p>
              
              <button
                onClick={onNext}
                className="mt-6 w-full py-4 bg-white text-bg-dark font-black tracking-widest rounded-xl hover:bg-opacity-90 transition-colors"
                style={{ backgroundColor: accentColor }}
              >
                CONTINUAR
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default QuizTemplate;
