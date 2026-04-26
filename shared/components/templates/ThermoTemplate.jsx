import React, { useState } from 'react';
import { motion } from 'framer-motion';

const ThermoTemplate = ({ data, onNext, onResult, isEditMode, onChange }) => {
  const { instruction, targetTemp, conceptId, units = '°C', minTemp = 0, maxTemp = 100 } = data;
  const [currentTemp, setCurrentTemp] = useState(minTemp);
  const [feedback, setFeedback] = useState(null);

  const handleChange = (field, value) => {
    if (onChange) onChange(field, value);
  };

  const handleVerify = () => {
    const isCorrect = Math.abs(currentTemp - targetTemp) <= 2; // Margen de error de 2 grados

    if (onResult && !feedback?.success) {
      onResult({
        success: isCorrect,
        conceptId: conceptId,
        metadata: { selectedTemp: currentTemp, targetTemp }
      });
    }

    if (isCorrect) {
      setFeedback({ success: true, text: '¡Perfecto! Has alcanzado la temperatura ideal.' });
    } else {
      setFeedback({ success: false, text: currentTemp < targetTemp ? 'Hace demasiado frío...' : 'Te has pasado de calor...' });
    }
  };

  if (isEditMode) {
    return (
      <div className="space-y-6 text-main">
        <label className="block">
          <span className="text-dim text-[10px] uppercase font-bold mb-2 block">Instrucción</span>
          <input 
            type="text" 
            value={instruction || ''} 
            onChange={(e) => handleChange('instruction', e.target.value)}
            className="w-full bg-white/5 border border-white/10 p-3 rounded-lg text-main"
            placeholder="Ej: Calienta el agua a 80°C..."
          />
        </label>

        <div className="grid grid-cols-2 gap-4">
          <label className="block">
            <span className="text-dim text-[10px] uppercase font-bold mb-2 block">Temperatura Objetivo</span>
            <input 
              type="number" 
              value={targetTemp || 0} 
              onChange={(e) => handleChange('targetTemp', parseInt(e.target.value))}
              className="w-full bg-white/5 border border-white/10 p-3 rounded-lg text-main font-bold"
            />
          </label>
          <label className="block">
            <span className="text-dim text-[10px] uppercase font-bold mb-2 block">Unidad (C/F/K)</span>
            <input 
              type="text" 
              value={units || '°C'} 
              onChange={(e) => handleChange('units', e.target.value)}
              className="w-full bg-white/5 border border-white/10 p-3 rounded-lg text-main"
            />
          </label>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <label className="block">
            <span className="text-dim text-[10px] uppercase font-bold mb-2 block">Temp Mínima</span>
            <input 
              type="number" 
              value={minTemp || 0} 
              onChange={(e) => handleChange('minTemp', parseInt(e.target.value))}
              className="w-full bg-white/5 border border-white/10 p-3 rounded-lg text-main"
            />
          </label>
          <label className="block">
            <span className="text-dim text-[10px] uppercase font-bold mb-2 block">Temp Máxima</span>
            <input 
              type="number" 
              value={maxTemp || 100} 
              onChange={(e) => handleChange('maxTemp', parseInt(e.target.value))}
              className="w-full bg-white/5 border border-white/10 p-3 rounded-lg text-main"
            />
          </label>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-dark text-main">
      <div className="w-full max-w-sm flex flex-col items-center">
        <h2 className="text-2xl font-bold mb-12 text-center text-orange-400">{instruction}</h2>

        <div className="relative h-[300px] w-20 bg-white/10 rounded-full border-4 border-white/20 p-2 flex flex-col justify-end">
          <motion.div 
            initial={{ height: 0 }}
            animate={{ height: `${((currentTemp - minTemp) / (maxTemp - minTemp)) * 100}%` }}
            className="w-full bg-gradient-to-t from-orange-600 to-red-400 rounded-full shadow-[0_0_30px_rgba(249,115,22,0.5)]"
          />
          <div className="absolute top-1/2 left-full ml-4 -translate-y-1/2 flex flex-col justify-between h-full text-white/40 font-mono text-xs">
            <span>{maxTemp}</span>
            <span>{Math.round((maxTemp + minTemp) / 2)}</span>
            <span>{minTemp}</span>
          </div>
        </div>

        <div className="mt-12 text-5xl font-black font-mono text-white tracking-tighter">
          {currentTemp}{units}
        </div>

        <input 
          type="range" 
          min={minTemp}
          max={maxTemp}
          value={currentTemp}
          onChange={(e) => setCurrentTemp(parseInt(e.target.value))}
          className="mt-8 w-full accent-orange-500 h-2 bg-white/10 rounded-lg appearance-none cursor-pointer"
        />

        {feedback && (
          <div className={`mt-8 p-4 rounded-xl text-center font-bold ${feedback.success ? 'bg-emerald-900/50 text-emerald-400 border border-emerald-500/30' : 'bg-red-900/50 text-red-400 border border-red-500/30'}`}>
            {feedback.text}
          </div>
        )}

        <div className="mt-8 w-full flex gap-4">
          <button 
            onClick={handleVerify}
            className="flex-1 py-4 bg-orange-600 text-white font-black rounded-xl hover:bg-orange-500 transition-colors uppercase tracking-widest shadow-xl"
          >
            Verificar Temperatura
          </button>
          
          {feedback?.success && (
            <button onClick={onNext} className="px-8 py-4 bg-white text-orange-900 font-black rounded-xl hover:bg-gray-200 transition-colors">➔</button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ThermoTemplate;
