import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const ThermoTemplate = ({ data, onNext, onResult, isEditMode }) => {
  const { instruction, targetTempRange, minTemp, maxTemp, successMessage, conceptId } = data;
  const [temp, setTemp] = useState(minTemp);
  const [timeInZone, setTimeInZone] = useState(0);
  const [success, setSuccess] = useState(false);

  // Determinar color basado en temp
  const getTempColor = (t) => {
    if (t < 30) return 'from-blue-600 to-cyan-400';
    if (t < 50) return 'from-emerald-600 to-green-400';
    if (t < 80) return 'from-orange-600 to-yellow-400';
    return 'from-red-700 to-red-500';
  };

  const isTargetZone = temp >= targetTempRange[0] && temp <= targetTempRange[1];

  useEffect(() => {
    if (isEditMode || success) return;

    let interval;
    if (isTargetZone) {
      interval = setInterval(() => {
        setTimeInZone(prev => {
          if (prev > 2) {
            setSuccess(true);
            if (onResult) {
              onResult({ success: true, conceptId, metadata: { finalTemp: temp } });
            }
            return prev;
          }
          return prev + 0.1;
        });
      }, 100);
    } else {
      setTimeInZone(0);
    }

    return () => clearInterval(interval);
  }, [temp, isTargetZone, success, isEditMode, onResult, conceptId]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 relative bg-dark">
      
      {/* Background Visual Feedback */}
      <div className={`absolute inset-0 bg-gradient-to-t ${getTempColor(temp)} opacity-10 transition-colors duration-1000`} />
      
      <div className="w-full max-w-sm glass-panel p-8 relative z-10 text-center">
        <h2 className="text-xl font-bold mb-8 text-white">{instruction}</h2>

        <div className="relative h-64 w-12 mx-auto bg-black border-2 border-white/20 rounded-full flex items-end p-1 overflow-hidden shadow-[inset_0_0_20px_rgba(0,0,0,1)]">
          {/* Target Zone Indicator */}
          <div 
            className="absolute w-full bg-emerald-500/30 border-y border-emerald-400/50"
            style={{ 
              bottom: `${(targetTempRange[0] / maxTemp) * 100}%`, 
              height: `${((targetTempRange[1] - targetTempRange[0]) / maxTemp) * 100}%` 
            }}
          />

          {/* Mercury / Fluid */}
          <motion.div 
            className={`w-full rounded-full bg-gradient-to-t ${getTempColor(temp)} shadow-[0_0_15px_currentColor] transition-colors duration-500`}
            animate={{ height: `${(temp / maxTemp) * 100}%` }}
            transition={{ type: 'spring', stiffness: 50 }}
          />
        </div>

        <div className="mt-8 font-mono text-4xl font-black text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">
          {Math.round(temp)}°C
        </div>

        <input 
          type="range" 
          min={minTemp} 
          max={maxTemp} 
          value={temp} 
          onChange={(e) => setTemp(Number(e.target.value))}
          disabled={success}
          className="w-full mt-6 accent-white"
        />

        <div className="mt-4 h-2 bg-white/10 rounded-full overflow-hidden">
          <div className="h-full bg-emerald-500 transition-all duration-100" style={{ width: `${(timeInZone / 2) * 100}%` }} />
        </div>

        {success && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6">
            <p className="text-emerald-400 font-bold mb-4">{successMessage}</p>
            <button 
              onClick={onNext}
              className="w-full py-4 bg-white text-black font-black uppercase tracking-widest rounded-xl hover:bg-gray-200"
            >
              CONTINUAR
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ThermoTemplate;
