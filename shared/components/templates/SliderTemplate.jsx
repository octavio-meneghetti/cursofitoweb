import React, { useState } from 'react';
import { motion } from 'framer-motion';

const SliderTemplate = ({ data, onChange, isEditMode }) => {
  const handleChange = (field, value) => {
    if (onChange) onChange(field, value);
  };

  const updatePoint = (index, field, value) => {
    const newPoints = [...(data.points || [])];
    newPoints[index][field] = value;
    handleChange('points', newPoints);
  };

  if (isEditMode) {
    return (
      <div className="space-y-6">
        <div>
          <label className="block text-[10px] uppercase font-black text-emerald-400 mb-1 tracking-widest">Concepto Base (Título)</label>
          <input 
            type="text" 
            value={data.concept || ''} 
            onChange={e => handleChange('concept', e.target.value)} 
            className="w-full bg-black/40 border border-white/10 p-2 rounded text-sm text-white" 
            placeholder="Ej: Fuego Digestivo" 
          />
        </div>

        <div className="space-y-4">
          <h4 className="text-[10px] font-black uppercase text-white/40 tracking-widest">Puntos del Escenario (Fijos: 3 Niveles)</h4>
          {data.points?.map((point, index) => (
            <div key={index} className="bg-black/40 p-4 rounded-xl border border-white/10 mb-4">
              <span className="text-[10px] font-black bg-white/10 px-3 py-1 rounded-full mb-3 inline-block uppercase text-emerald-400">Nivel {index + 1}</span>
              
              <div className="grid grid-cols-2 gap-4 mb-3">
                <div>
                  <label className="block text-[9px] uppercase font-bold text-dim mb-1">Nombre (Ej: Niño)</label>
                  <input
                    value={point.label}
                    onChange={(e) => updatePoint(index, 'label', e.target.value)}
                    className="w-full bg-white/5 border border-white/10 p-2 rounded text-sm text-white"
                  />
                </div>
                <div>
                  <label className="block text-[9px] uppercase font-bold text-dim mb-1">Icono/Emoji (Ej: ☀️)</label>
                  <input
                    value={point.image}
                    onChange={(e) => updatePoint(index, 'image', e.target.value)}
                    className="w-full bg-white/5 border border-white/10 p-2 rounded text-sm text-white text-center text-xl"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[9px] uppercase font-bold text-dim mb-1">Explicación del Escenario</label>
                <textarea
                  value={point.text}
                  onChange={(e) => updatePoint(index, 'text', e.target.value)}
                  className="w-full bg-white/5 border border-white/10 p-2 rounded text-sm text-white min-h-[50px]"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // PREVIEW / GAMEPLAY MODE
  const [sliderValue, setSliderValue] = useState(1);
  const currentPoint = data.points?.[sliderValue - 1];

  return (
    <div className="w-full h-full flex flex-col p-8 items-center justify-between text-center relative overflow-hidden bg-[#05070a] rounded-3xl border border-white/5">
      <div className="mt-8 z-10 w-full max-w-md">
        <h2 className="text-[10px] uppercase tracking-[0.4em] text-emerald-500 font-black mb-6 opacity-60">{data.concept}</h2>
        <motion.div 
          key={sliderValue}
          initial={{ opacity: 0, scale: 0.5, rotate: -20 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          className="text-8xl mb-8 drop-shadow-[0_0_30px_rgba(255,255,255,0.2)]"
        >
          {currentPoint?.image}
        </motion.div>
        <motion.h3 
          key={`l-${sliderValue}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-serif text-white mb-8"
        >
          {currentPoint?.label}
        </motion.h3>
        <motion.div 
          key={`t-${sliderValue}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 backdrop-blur-md p-8 rounded-3xl border border-white/10 relative shadow-2xl"
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-emerald-500 px-4 py-1 rounded-full text-[10px] font-black text-black uppercase tracking-widest">OBSERVACIÓN</div>
          <p className="text-emerald-50/80 text-xl leading-relaxed italic">{currentPoint?.text}</p>
        </motion.div>
      </div>

      <div className="w-full max-w-sm mb-12 z-10 px-4">
        <div className="flex justify-between text-[9px] font-black text-dim mb-4 uppercase tracking-[0.2em]">
          {data.points?.map((p, i) => (
            <span key={i} className={sliderValue === i + 1 ? 'text-emerald-400' : ''}>{p.label}</span>
          ))}
        </div>
        <div className="relative group">
            <input 
              type="range" 
              min="1" 
              max={data.points?.length || 3} 
              step="1"
              value={sliderValue}
              onChange={(e) => setSliderValue(Number(e.target.value))}
              className="w-full h-3 bg-white/10 rounded-full appearance-none cursor-pointer accent-emerald-500 transition-all hover:bg-white/20"
            />
            {/* Visual guide markers */}
            <div className="absolute inset-0 flex justify-between pointer-events-none px-1">
                {[1,2,3].map(i => (
                    <div key={i} className={`w-1 h-1 rounded-full mt-1 ${sliderValue === i ? 'bg-black' : 'bg-white/20'}`} />
                ))}
            </div>
        </div>
      </div>
      
      {/* Dynamic Background Glow based on slider */}
      <motion.div 
        animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.2, 0.1]
        }}
        transition={{ duration: 5, repeat: Infinity }}
        className="absolute bottom-0 w-[600px] h-[600px] rounded-full blur-[120px] -z-10 transition-colors duration-1000"
        style={{
          background: sliderValue === 1 ? 'rgba(250, 204, 21, 0.3)' : sliderValue === 2 ? 'rgba(239, 68, 68, 0.4)' : 'rgba(59, 130, 246, 0.3)'
        }}
      />
    </div>
  );
};

export default SliderTemplate;
