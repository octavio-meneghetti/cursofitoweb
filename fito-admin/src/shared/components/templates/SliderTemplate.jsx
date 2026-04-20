import React, { useState } from 'react';
import { motion } from 'framer-motion';

const SliderTemplate = ({ data, onChange, isEditMode }) => {
  const handleChange = (field, value) => {
    onChange({ ...data, [field]: value });
  };

  const updatePoint = (index, field, value) => {
    const newPoints = [...data.points];
    newPoints[index][field] = value;
    handleChange('points', newPoints);
  };

  if (isEditMode) {
    return (
      <div className="space-y-6">
        <div>
          <label className="block text-xs uppercase font-bold text-dim mb-1">Concepto Base (Título)</label>
          <input 
            type="text" 
            value={data.concept || ''} 
            onChange={e => handleChange('concept', e.target.value)} 
            className="w-full bg-black/30 border border-white/10 p-2 rounded text-sm text-white" 
            placeholder="Ej: Fuego Digestivo" 
          />
        </div>

        <div>
          <h4 className="text-sm font-bold text-emerald-400 mb-2">Puntos del Escenario (Deslizador)</h4>
          <p className="text-xs text-dim mb-4">El alumno deslizará de 1 a {data.points?.length || 3}.</p>
          
          {data.points?.map((point, index) => (
            <div key={index} className="bg-black/20 p-4 rounded-xl border border-white/5 mb-4">
              <span className="text-xs font-bold bg-white/10 px-2 py-1 rounded mb-2 inline-block">Nivel {index + 1}</span>
              
              <div className="grid grid-cols-2 gap-4 mb-2">
                <div>
                  <label className="block text-xs uppercase text-dim mb-1">Nombre (Ej: Niño)</label>
                  <input
                    value={point.label}
                    onChange={(e) => updatePoint(index, 'label', e.target.value)}
                    className="w-full bg-black/30 border border-white/10 p-2 rounded text-sm text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase text-dim mb-1">Aura/Icono (Ej: ☀️)</label>
                  <input
                    value={point.image}
                    onChange={(e) => updatePoint(index, 'image', e.target.value)}
                    className="w-full bg-black/30 border border-white/10 p-2 rounded text-sm text-white text-center text-xl"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs uppercase text-dim mb-1">Explicación del Escenario</label>
                <textarea
                  value={point.text}
                  onChange={(e) => updatePoint(index, 'text', e.target.value)}
                  className="w-full bg-black/30 border border-white/10 p-2 rounded text-sm text-white min-h-[50px]"
                />
              </div>
            </div>
          ))}
          <div className="text-xs text-dim text-center">Para este template mantenemos 3 niveles fijos por diseño.</div>
        </div>
      </div>
    );
  }

  // PREVIEW / GAMEPLAY MODE
  const [sliderValue, setSliderValue] = useState(1);
  const currentPoint = data.points?.[sliderValue - 1];

  return (
    <div className="w-full h-full flex flex-col p-6 items-center justify-between text-center relative overflow-hidden bg-gradient-to-b from-black to-emerald-950/30">
      <div className="mt-8 z-10">
        <h2 className="text-sm uppercase tracking-[0.2em] text-emerald-400 font-bold mb-2">{data.concept}</h2>
        <motion.div 
          key={sliderValue}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-6xl mb-4"
        >
          {currentPoint?.image}
        </motion.div>
        <motion.h3 
          key={`l-${sliderValue}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-3xl font-serif text-white mb-6"
        >
          {currentPoint?.label}
        </motion.h3>
        <motion.div 
          key={`t-${sliderValue}`}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-panel p-6 border-white/10 relative"
        >
          <p className="text-emerald-50 text-lg leading-relaxed">{currentPoint?.text}</p>
        </motion.div>
      </div>

      <div className="w-full mb-12 z-10 px-4">
        <div className="flex justify-between text-xs font-bold text-dim mb-2 uppercase">
          {data.points?.map((p, i) => (
            <span key={i} className={sliderValue === i + 1 ? 'text-emerald-400' : ''}>{p.label}</span>
          ))}
        </div>
        <input 
          type="range" 
          min="1" 
          max={data.points?.length || 3} 
          step="1"
          value={sliderValue}
          onChange={(e) => setSliderValue(Number(e.target.value))}
          className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-emerald-500"
        />
      </div>
      
      {/* Dynamic Background Glow based on slider */}
      <div 
        className="absolute bottom-0 w-[500px] h-[500px] rounded-full blur-[100px] -z-10 transition-all duration-1000"
        style={{
          background: sliderValue === 1 ? 'rgba(250, 204, 21, 0.1)' : sliderValue === 2 ? 'rgba(239, 68, 68, 0.15)' : 'rgba(59, 130, 246, 0.1)'
        }}
      />
    </div>
  );
};

export default SliderTemplate;
