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
    buttonText = 'VAMOS',
    bubbleFontSize = '0.875rem', // text-sm
    itemFontSize = '0.875rem'    // text-sm
  } = data || {};

  const completedCount = items.filter(item => item.completed).length;
  const progress = (completedCount / items.length) * 100;

  return (
    <div className="flex flex-col items-center justify-start min-h-screen py-8 px-6 bg-[#060608] text-white overflow-y-auto relative font-sans">
      
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

      <div className="max-w-md w-full z-10 space-y-4">
        
        {/* Character Section - TOP CENTERED */}
        <div className="flex flex-col items-center text-center mb-2">
          <motion.div 
            initial={{ scale: 0, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            className="w-28 h-28 relative mb-2"
          >
            <div className="absolute inset-0 rounded-full blur-3xl opacity-30 animate-pulse" style={{ backgroundColor: accentColor }} />
            <img 
              src={avatarImage} 
              alt={character} 
              className="w-full h-full object-contain relative z-10 drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]" 
            />
          </motion.div>
          
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white/10 backdrop-blur-md border border-white/20 p-5 rounded-3xl relative"
          >
            <p className="font-medium leading-relaxed italic text-white/90" style={{ fontSize: bubbleFontSize }}>
              "{bubbleText}"
            </p>
            <div className="absolute top-[-8px] left-1/2 w-4 h-4 bg-white/10 border-l border-t border-white/20 transform rotate-45 -translate-x-1/2" />
          </motion.div>
        </div>

        <motion.div 
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl"
        >
          <div className="flex flex-col items-center space-y-4">
            {items.map((item, index) => (
              <motion.div 
                key={item.id}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="flex items-center gap-4 w-full max-w-[280px]"
              >
                <div className={`w-8 h-8 rounded-xl border-2 flex items-center justify-center flex-shrink-0 transition-all duration-500 ${
                  item.completed 
                    ? 'bg-emerald-500 border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.6)]' 
                    : 'bg-white/5 border-white/60'
                }`}>
                  {item.completed ? (
                    <motion.svg 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-5 h-5 text-black" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor" 
                      strokeWidth={4}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </motion.svg>
                  ) : (
                    <div className="w-1.5 h-1.5 rounded-full bg-white/40" />
                  )}
                </div>
                <span 
                  className={`font-bold tracking-wide transition-all duration-500 ${item.completed ? 'text-white' : 'text-white/60'}`} 
                  style={{ fontSize: itemFontSize }}
                >
                  {item.text}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Action Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onNext}
          className="w-full py-5 bg-emerald-500 text-black font-black uppercase tracking-[0.3em] rounded-2xl shadow-[0_0_50px_rgba(16,185,129,0.3)] text-sm"
        >
          {buttonText}
        </motion.button>
      </div>
    </div>
  );
};

export default PromiseChecklistTemplate;
