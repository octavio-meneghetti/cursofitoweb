import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const RewardTemplate = ({ data, onChange, isEditMode }) => {
  const handleChange = (field, value) => {
    if (onChange) onChange({ ...data, [field]: value });
  };

  if (isEditMode) {
    return (
      <div className="space-y-6">
        <div>
          <label className="block text-xs uppercase font-bold text-dim mb-1">Nombre del Logro / Badge</label>
          <input 
            type="text" 
            value={data.badgeName || ''} 
            onChange={e => handleChange('badgeName', e.target.value)} 
            className="w-full bg-black/30 border border-white/10 p-2 rounded text-sm text-white" 
            placeholder="Ej: Guardián de la Vida" 
          />
        </div>
        <div>
          <label className="block text-xs uppercase font-bold text-dim mb-1">Icono (Emoji o Símbolo)</label>
          <input 
            type="text" 
            value={data.badgeIcon || ''} 
            onChange={e => handleChange('badgeIcon', e.target.value)} 
            className="w-full bg-black/30 border border-white/10 p-2 rounded text-sm text-white text-center text-2xl" 
          />
        </div>
        <div>
          <label className="block text-xs uppercase font-bold text-dim mb-1">Mensaje de Victoria</label>
          <textarea 
            value={data.message || ''} 
            onChange={e => handleChange('message', e.target.value)} 
            className="w-full bg-black/30 border border-white/10 p-2 rounded text-sm text-white min-h-[60px]" 
            placeholder="Escribe algo épico..." 
          />
        </div>
        <div className="flex items-center gap-2">
          <input 
            type="checkbox" 
            checked={data.particles !== false} 
            onChange={e => handleChange('particles', e.target.checked)} 
            className="w-5 h-5 accent-emerald-500"
          />
          <span className="text-xs font-bold uppercase text-dim">Mostrar Partículas / Explosión</span>
        </div>
      </div>
    );
  }

  // PREVIEW / GAMEPLAY MODE
  const [showText, setShowText] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShowText(true), 1200);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="w-full h-[500px] flex flex-col items-center justify-center relative overflow-hidden bg-[#05070a] rounded-3xl border border-yellow-500/10">
      
      {/* Background glow animated */}
      <motion.div 
        animate={{ scale: [1, 1.5, 1], opacity: [0.1, 0.3, 0.1] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute w-96 h-96 bg-yellow-500/20 rounded-full blur-[100px] pointer-events-none"
      />

      {/* Confetti / Particles Simulation */}
      {data.particles !== false && (
        <div className="absolute inset-0 pointer-events-none opacity-40">
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ y: "120%", x: "50%", scale: 0 }}
              animate={{ 
                y: "-20%", 
                x: `${Math.random() * 100}%`,
                scale: Math.random() * 1 + 0.5,
                rotate: 360 * Math.random() 
              }}
              transition={{ duration: 2 + Math.random() * 2, ease: "easeOut", delay: i * 0.1 }}
              className="absolute bottom-0 w-2 h-2 rounded-full"
              style={{ background: ['#FBBF24', '#34D399', '#60A5FA', '#F87171'][i % 4] }}
            />
          ))}
        </div>
      )}

      {/* Floating Badge */}
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", damping: 12, stiffness: 100, delay: 0.3 }}
        className="relative z-10 w-32 h-32 mb-8 bg-gradient-to-br from-yellow-400 to-amber-600 rounded-full p-1 shadow-[0_0_50px_rgba(251,191,36,0.3)] flex items-center justify-center"
      >
        <div className="w-full h-full bg-[#05070a] rounded-full flex items-center justify-center border-4 border-yellow-900/50">
          <span className="text-6xl drop-shadow-lg">{data.badgeIcon}</span>
        </div>
      </motion.div>

      {/* Reveal Text */}
      <AnimatePresence>
        {showText && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative z-10 text-center px-6"
          >
            <p className="text-yellow-500 text-xs tracking-[0.3em] font-black uppercase mb-3 drop-shadow-md">NUEVO LOGRO</p>
            <h2 className="text-3xl font-serif text-white mb-4">{data.badgeName}</h2>
            <p className="text-yellow-100/70">{data.message}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RewardTemplate;
