import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';

const MagneticPuzzleTemplate = ({ data, onNext, onResult, isEditMode }) => {
  const { instruction, elements, conceptId } = data;
  const constraintsRef = useRef(null);
  const [interacted, setInteracted] = useState(false);

  // Al soltar una pieza, registramos interacción (al ser sandbox)
  const handleDragEnd = () => {
    if (!interacted && onResult && !isEditMode) {
      setInteracted(true);
      onResult({ success: true, conceptId, metadata: { experimented: true } });
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 relative bg-dark overflow-hidden">
      
      {/* Campo magnético de fondo */}
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: 'radial-gradient(circle at center, transparent 0%, #06b6d4 100%), repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.05) 10px, rgba(255,255,255,0.05) 20px)'
      }} />

      <div className="w-full max-w-lg z-10 flex flex-col h-full">
        <h2 className="text-xl font-bold mb-6 text-center text-cyan-400">{instruction}</h2>

        {/* Sandbox Area */}
        <motion.div 
          ref={constraintsRef} 
          className="flex-1 w-full min-h-[50vh] glass-panel border border-cyan-500/20 rounded-3xl relative overflow-hidden flex items-center justify-center"
        >
          {elements?.map((el, i) => (
            <motion.div
              key={el.id}
              drag
              dragConstraints={constraintsRef}
              dragElastic={0.2}
              dragMomentum={false}
              onDragEnd={handleDragEnd}
              whileHover={{ scale: 1.1 }}
              whileDrag={{ scale: 1.2, zIndex: 50 }}
              initial={{ x: (Math.random() - 0.5) * 100, y: (Math.random() - 0.5) * 100 }}
              className={`absolute w-24 h-24 rounded-full flex items-center justify-center font-bold text-sm text-center shadow-xl cursor-grab active:cursor-grabbing border-4 backdrop-blur-sm ${
                el.polarity === 'polar' 
                  ? 'border-cyan-400 bg-cyan-900/60 text-cyan-100 shadow-[0_0_20px_rgba(34,211,238,0.5)]' 
                  : 'border-yellow-400 bg-yellow-900/60 text-yellow-100 shadow-[0_0_20px_rgba(250,204,21,0.5)]'
              }`}
            >
              {el.label}
            </motion.div>
          ))}
          
          {/* Decorative polar indicators */}
          <div className="absolute top-4 left-4 text-cyan-500/30 text-4xl font-black">⊕</div>
          <div className="absolute bottom-4 right-4 text-cyan-500/30 text-4xl font-black">⊖</div>
        </motion.div>

        <div className="mt-8 text-center">
          <p className="text-white/40 text-xs mb-4">Experimenta libremente con las fuerzas. Cuando estés listo, avanza.</p>
          <button 
            onClick={onNext}
            className="w-full py-4 bg-cyan-600 text-white font-black uppercase tracking-widest rounded-xl hover:bg-cyan-500 shadow-lg shadow-cyan-900/50"
          >
            CONTINUAR
          </button>
        </div>
      </div>
    </div>
  );
};

export default MagneticPuzzleTemplate;
