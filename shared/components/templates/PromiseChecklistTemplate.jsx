import React from 'react';
import { motion } from 'framer-motion';

const PromiseChecklistTemplate = ({ data, onNext, isEditMode = false }) => {
  const { 
    character = 'El Cartógrafo', 
    avatarImage = '/avatars/cartografo.png',
    bubbleText = 'Hoy no vas a aprender nombres raros. Vas a aprender algo más útil: mapear tu estado.',
    items = [
      { id: '1', text: 'Ubico mi tensión', completed: false },
      { id: '2', text: 'Reconozco el mensajero', completed: false },
      { id: '3', text: 'Registro el terreno (24h)', completed: false }
    ],
    accentColor = '#10b981',
    buttonText = 'VAMOS'
  } = data || {};

  const completedCount = items.filter(item => item.completed).length;
  const progress = (completedCount / items.length) * 100;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-[#060608] text-white overflow-hidden relative font-sans">
      
      {/* Background Ambience */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full blur-[120px] opacity-20"
          style={{ backgroundColor: accentColor }}
        />
        <div 
          className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full blur-[120px] opacity-10"
          style={{ backgroundColor: accentColor }}
        />
      </div>

      <div className="max-w-md w-full z-10 space-y-8">
        
        {/* Character Section */}
        <div className="flex items-end gap-4 mb-8">
          <motion.div 
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="w-24 h-24 flex-shrink-0 relative"
          >
            <div className="absolute inset-0 rounded-full blur-xl opacity-40" style={{ backgroundColor: accentColor }} />
            <img 
              src={avatarImage} 
              alt={character} 
              className="w-full h-full object-contain relative z-10 drop-shadow-2xl" 
            />
          </motion.div>
          
          <motion.div 
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl rounded-bl-none relative mb-4"
          >
            <p className="text-sm font-medium leading-relaxed italic text-white/90">
              "{bubbleText}"
            </p>
            <div className="absolute bottom-[-8px] left-0 w-4 h-4 bg-white/10 border-l border-b border-white/20 transform rotate-45 -translate-x-1/2" />
          </motion.div>
        </div>

        {/* Checklist Section */}
        <motion.div 
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl"
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xs uppercase font-black tracking-[0.3em] text-white/40">Hoja de Ruta</h3>
            <span className="text-[10px] font-bold px-2 py-1 bg-white/5 rounded-full border border-white/10">
              {completedCount} / {items.length}
            </span>
          </div>

          <div className="space-y-4">
            {items.map((item, index) => (
              <motion.div 
                key={item.id}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className={`flex items-center gap-4 p-4 rounded-2xl border transition-all duration-500 ${
                  item.completed 
                    ? 'bg-emerald-500/10 border-emerald-500/30' 
                    : 'bg-white/5 border-white/5 opacity-70'
                }`}
              >
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all duration-500 ${
                  item.completed 
                    ? 'bg-emerald-500 border-emerald-500 scale-110' 
                    : 'border-white/20'
                }`}>
                  {item.completed && (
                    <motion.svg 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-4 h-4 text-black" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor" 
                      strokeWidth={4}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </motion.svg>
                  )}
                </div>
                <span className={`text-sm font-bold tracking-wide transition-all duration-500 ${
                  item.completed ? 'text-white' : 'text-white/40'
                }`}>
                  {item.text}
                </span>
              </motion.div>
            ))}
          </div>

          {/* Progress Bar */}
          <div className="mt-8">
            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-white/30 mb-2">
              <span>Progreso del Día</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                className="h-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]"
              />
            </div>
          </div>
        </motion.div>

        {/* Action Button */}
        {!isEditMode && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onNext}
            className="w-full py-5 bg-emerald-500 text-black font-black uppercase tracking-[0.3em] rounded-2xl shadow-[0_0_50px_rgba(16,185,129,0.3)] text-sm"
          >
            {buttonText}
          </motion.button>
        )}
      </div>
    </div>
  );
};

export default PromiseChecklistTemplate;
