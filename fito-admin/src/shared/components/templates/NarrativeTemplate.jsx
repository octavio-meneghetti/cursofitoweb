import React from 'react';
import { motion } from 'framer-motion';

const NarrativeTemplate = ({ data, onNext }) => {
  const { character, text, accentColor } = data;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 relative overflow-hidden bg-dark">
      {/* Background Glow */}
      <div 
        className="absolute w-96 h-96 rounded-full blur-[120px] opacity-20"
        style={{ backgroundColor: accentColor || 'var(--color-guardian)', top: '10%', left: '10%' }}
      />

      {/* Character Image (Hologram Style) */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.8, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 mb-8"
      >
        <img 
          src="/guardian.png" 
          alt={character} 
          className="w-full max-w-sm drop-shadow-[0_0_25px_rgba(16,185,129,0.3)]"
          style={{ maskImage: 'linear-gradient(to bottom, black 80%, transparent 100%)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-bg-dark to-transparent opacity-40" />
      </motion.div>

      {/* Text Box */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.6 }}
        className="glass-panel p-8 max-w-lg w-full text-center relative z-20 neon-border-green"
      >
        <h2 className="text-dim text-sm uppercase tracking-widest mb-4 font-bold" style={{ color: accentColor }}>
          {character}
        </h2>
        <p className="text-xl leading-relaxed font-medium">
          {text}
        </p>
      </motion.div>

      {/* Continue Button */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        onClick={onNext}
        className="mt-12 px-10 py-4 glass-panel text-lg font-bold tracking-widest hover:scale-105 transition-transform active:scale-95"
        style={{ color: accentColor }}
      >
        CONTINUAR
      </motion.button>
    </div>
  );
};

export default NarrativeTemplate;
