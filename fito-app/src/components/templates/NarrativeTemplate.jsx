import React from 'react';
import { motion } from 'framer-motion';

const NarrativeTemplate = ({ data, onNext }) => {
  const { 
    character = 'El Guardián', 
    text = '', 
    accentColor = '#10b981',
    avatarImage = '/guardian.png',
    verticalOffset = 0
  } = data;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 relative overflow-hidden bg-[#060608]">
      {/* Background Glow */}
      <div 
        className="absolute w-96 h-96 rounded-full blur-[120px] opacity-20 animate-pulse-slow"
        style={{ backgroundColor: accentColor, top: '10%', left: '10%' }}
      />

      {/* Main Container for Image and Box */}
      <div className="relative z-10 w-full max-w-sm flex flex-col items-center">
        
        {/* Character/Artwork Image */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: verticalOffset }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="w-full aspect-square mb-8 overflow-hidden rounded-2xl border border-white/10 shadow-2xl"
        >
          <img 
            src={avatarImage} 
            alt={character} 
            className="w-full h-full object-cover"
          />
        </motion.div>

        {/* Dialogue Box (Glass Panel) */}
        {text?.trim() && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="glass-panel p-8 w-full text-center relative z-20 neon-border-green"
            style={{ 
              borderColor: accentColor, 
              boxShadow: `0 0 20px ${accentColor}33` 
            }}
          >
            <h2 className="text-dim text-sm uppercase tracking-widest mb-4 font-black" style={{ color: accentColor }}>
              {character}
            </h2>
            <p className="text-xl md:text-2xl leading-relaxed font-medium text-white drop-shadow-sm">
              {text}
            </p>
          </motion.div>
        )}

        {/* Continue Button */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          onClick={onNext}
          className="mt-12 group relative flex items-center justify-center"
        >
          <div className="px-10 py-3 rounded-full bg-white/5 border border-white/10 text-[11px] font-black uppercase tracking-[0.4em] text-white/50 group-hover:text-white group-hover:bg-white/10 transition-all font-inter">
            Continuar
          </div>
          {/* Subtle neon underline/glow for button */}
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-12 h-[2px] rounded-full blur-[1px] opacity-50" style={{ backgroundColor: accentColor }} />
        </motion.button>
      </div>
    </div>
  );
};

export default NarrativeTemplate;
