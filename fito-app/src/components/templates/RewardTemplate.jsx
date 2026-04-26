import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const RewardTemplate = ({ data, onNext, onChange, isEditMode }) => {
  const handleChange = (field, value) => {
    if (onChange) onChange(field, value);
  };

  const {
    badgeName = '¡Logro Desbloqueado!',
    badgeIcon = '🏆',
    message = '¡Excelente trabajo! Has completado este desafío.',
    particles = true,
    badgeSize = 128,
    mediaUrl = '',
    mediaType = 'image', // 'image' | 'video'
    mediaSize = 300,
    accentColor = '#FBBF24',
    buttonText = 'Cobrar Recompensa'
  } = data;

  if (isEditMode) {
    return (
      <div className="space-y-6 text-main">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] uppercase font-black text-emerald-400 mb-1">Nombre del Logro</label>
            <input 
              type="text" 
              value={badgeName} 
              onChange={e => handleChange('badgeName', e.target.value)} 
              className="w-full bg-black/40 border border-white/10 p-2 rounded text-sm text-white" 
              placeholder="Ej: Guardián de la Vida" 
            />
          </div>
          <div>
            <label className="block text-[10px] uppercase font-black text-emerald-400 mb-1">Icono / Emoji</label>
            <input 
              type="text" 
              value={badgeIcon} 
              onChange={e => handleChange('badgeIcon', e.target.value)} 
              className="w-full bg-black/40 border border-white/10 p-2 rounded text-sm text-white text-center text-xl" 
            />
          </div>
        </div>

        <div>
          <label className="block text-[10px] uppercase font-black text-emerald-400 mb-1">Mensaje de Victoria</label>
          <textarea 
            value={message} 
            onChange={e => handleChange('message', e.target.value)} 
            className="w-full bg-black/40 border border-white/10 p-2 rounded text-sm text-white min-h-[60px]" 
            placeholder="Escribe algo épico..." 
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-white/5 border border-white/10 rounded-2xl space-y-4">
            <h4 className="text-[10px] font-black uppercase text-white/40 tracking-widest">Botón de Acción</h4>
            <input 
              type="text" 
              value={buttonText} 
              onChange={e => handleChange('buttonText', e.target.value)}
              placeholder="Texto del botón..."
              className="w-full bg-black/40 border border-white/10 p-2 rounded text-xs text-white" 
            />
          </div>
          <div className="p-4 bg-white/5 border border-white/10 rounded-2xl space-y-4">
             <h4 className="text-[10px] font-black uppercase text-white/40 tracking-widest">Color de Aura</h4>
             <input type="text" value={accentColor} onChange={e => handleChange('accentColor', e.target.value)} className="w-full bg-black/40 border border-white/10 p-2 rounded text-xs text-white font-mono" />
          </div>
        </div>

        <div className="p-4 bg-white/5 border border-white/10 rounded-2xl space-y-4">
          <h4 className="text-[10px] font-black uppercase text-white/40 tracking-widest">Multimedia (Personaje/Escena)</h4>
          <div className="flex gap-2">
            <select 
              value={mediaType} 
              onChange={e => handleChange('mediaType', e.target.value)}
              className="bg-black/40 border border-white/10 p-2 rounded text-xs text-white"
            >
              <option value="image">🖼️ Imagen</option>
              <option value="video">📹 Video (MP4)</option>
            </select>
            <input 
              type="text" 
              value={mediaUrl} 
              onChange={e => handleChange('mediaUrl', e.target.value)}
              placeholder="URL de imagen o video..."
              className="flex-1 bg-black/40 border border-white/10 p-2 rounded text-[10px] text-white font-mono" 
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="text-[9px] text-dim uppercase font-bold mb-1 block">Tamaño Medalla ({badgeSize}px)</span>
              <input 
                type="range" min="50" max="300" 
                value={badgeSize} 
                onChange={e => handleChange('badgeSize', parseInt(e.target.value))}
                className="w-full accent-yellow-500"
              />
            </label>
            <label className="block">
              <span className="text-[9px] text-dim uppercase font-bold mb-1 block">Tamaño Multimedia ({mediaSize}px)</span>
              <input 
                type="range" min="100" max="600" 
                value={mediaSize} 
                onChange={e => handleChange('mediaSize', parseInt(e.target.value))}
                className="w-full accent-emerald-500"
              />
            </label>
          </div>
        </div>

        <div className="flex items-center gap-4 p-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input 
              type="checkbox" 
              checked={particles !== false} 
              onChange={e => handleChange('particles', e.target.checked)} 
              className="w-5 h-5 accent-yellow-500"
            />
            <span className="text-[10px] font-black uppercase text-dim">Explosión de Partículas</span>
          </label>
        </div>
      </div>
    );
  }

  // PREVIEW / GAMEPLAY MODE
  const [showText, setShowText] = useState(false);
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setShowText(true), 1500);
    const t2 = setTimeout(() => setShowButton(true), 2500);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  return (
    <div className="w-full h-screen min-h-[600px] flex flex-col items-center justify-center relative overflow-hidden bg-[#05070a]">
      
      {/* Media Background (optional image/video of character) */}
      {mediaUrl && (
        <motion.div 
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 0.6, scale: 1 }}
          transition={{ duration: 2 }}
          className="absolute inset-0 z-0 flex items-center justify-center"
        >
          {mediaType === 'video' ? (
            <video 
              src={mediaUrl} 
              autoPlay loop muted playsInline 
              className="w-full h-full object-cover opacity-40 blur-sm"
              style={{ maxWidth: mediaSize * 2, maxHeight: mediaSize * 2 }}
            />
          ) : (
            <img 
              src={mediaUrl} 
              alt="Celebration" 
              className="w-full h-full object-contain opacity-60"
              style={{ maxWidth: mediaSize, maxHeight: mediaSize }}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#05070a] via-transparent to-[#05070a]" />
        </motion.div>
      )}

      {/* Background glow animated */}
      <motion.div 
        animate={{ 
          scale: [1, 1.3, 1], 
          opacity: [0.1, 0.2, 0.1],
          backgroundColor: accentColor 
        }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute w-[500px] h-[500px] rounded-full blur-[120px] pointer-events-none z-0"
        style={{ backgroundColor: accentColor }}
      />

      {/* Confetti / Particles Simulation */}
      {particles !== false && (
        <div className="absolute inset-0 pointer-events-none z-10">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ y: "120%", x: "50%", scale: 0, opacity: 1 }}
              animate={{ 
                y: "-20%", 
                x: `${10 + Math.random() * 80}%`,
                scale: Math.random() * 1.5 + 0.5,
                rotate: 720 * Math.random(),
                opacity: 0
              }}
              transition={{ duration: 3 + Math.random() * 2, ease: "easeOut", delay: i * 0.05 }}
              className="absolute bottom-0 w-3 h-3 rounded-sm"
              style={{ background: [accentColor, '#34D399', '#60A5FA', '#ffffff'][i % 4] }}
            />
          ))}
        </div>
      )}

      {/* Floating Badge */}
      <motion.div
        initial={{ scale: 0, rotate: -270, y: 100 }}
        animate={{ scale: 1, rotate: 0, y: 0 }}
        transition={{ type: "spring", damping: 15, stiffness: 80, delay: 0.5 }}
        className="relative z-20 bg-gradient-to-br from-yellow-300 via-amber-500 to-yellow-600 rounded-full p-1 shadow-[0_0_80px_rgba(251,191,36,0.4)] flex items-center justify-center"
        style={{ width: badgeSize, height: badgeSize }}
      >
        <div className="w-full h-full bg-[#05070a] rounded-full flex items-center justify-center border-4 border-yellow-900/30">
          <span className="drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]" style={{ fontSize: badgeSize * 0.5 }}>{badgeIcon}</span>
        </div>
        
        <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            className="absolute -inset-4 border-2 border-dashed border-yellow-500/20 rounded-full"
        />
      </motion.div>

      {/* Reveal Text */}
      <AnimatePresence>
        {showText && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative z-20 text-center px-8 mt-12 mb-12"
          >
            <motion.p 
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-yellow-500 text-[10px] tracking-[0.5em] font-black uppercase mb-4 drop-shadow-md"
            >
                RECOMPENSA OBTENIDA
            </motion.p>
            <h2 className="text-4xl md:text-5xl font-serif text-white mb-6 drop-shadow-2xl">{badgeName}</h2>
            <div className="w-24 h-1 bg-gradient-to-r from-transparent via-yellow-500 to-transparent mx-auto mb-6" />
            <p className="text-yellow-100/60 text-lg max-w-md mx-auto italic leading-relaxed">{message}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action Button inside Template */}
      <AnimatePresence>
        {showButton && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={onNext}
            className="relative z-30 px-12 py-4 bg-yellow-500 text-black font-black rounded-full shadow-[0_0_30px_rgba(245,158,11,0.3)] uppercase tracking-tighter hover:scale-110 hover:bg-yellow-400 transition-all active:scale-95"
          >
            {buttonText}
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RewardTemplate;
