import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const HotspotTemplate = ({ data, onNext, onResult, isEditMode, onChange }) => {
  const { imageUrl, instruction, points = [], targetHotspot, conceptId } = data;
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (field, value) => {
    if (onChange) onChange(field, value);
  };

  const handlePointClick = (point) => {
    if (isEditMode) return;
    
    setSelectedPoint(point);
    const isCorrect = point.id === targetHotspot;

    if (onResult && !success) {
      onResult({
        success: isCorrect,
        conceptId: conceptId,
        metadata: { clicked: point.label }
      });
    }

    if (isCorrect) {
      setSuccess(true);
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
            placeholder="Ej: Encuentra el punto de máxima energía..."
          />
        </label>

        <label className="block">
          <span className="text-dim text-[10px] uppercase font-bold mb-2 block">Imagen del Mapa</span>
          <input 
            type="text" 
            value={imageUrl || ''} 
            onChange={(e) => handleChange('imageUrl', e.target.value)}
            className="w-full bg-white/5 border border-white/10 p-3 rounded-lg text-main text-xs"
            placeholder="URL de la imagen..."
          />
        </label>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-dim text-[10px] uppercase font-bold">Puntos de Interés</span>
            <button 
              onClick={() => {
                const newPoints = [...points];
                newPoints.push({ id: Math.random().toString(36).substr(2, 9), x: 50, y: 50, label: 'Nuevo punto', info: 'Descripción...' });
                handleChange('points', newPoints);
              }}
              className="text-[10px] bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full border border-emerald-500/30"
            >
              + Añadir Punto
            </button>
          </div>

          <div className="space-y-3">
            {points.map((point, idx) => (
              <div key={point.id} className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-3">
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={point.label} 
                    onChange={(e) => {
                      const newPoints = [...points];
                      newPoints[idx].label = e.target.value;
                      handleChange('points', newPoints);
                    }}
                    className="flex-1 bg-black/40 border border-white/10 p-2 rounded text-xs font-bold"
                    placeholder="Etiqueta"
                  />
                  <button 
                    onClick={() => {
                      const newPoints = points.filter((_, i) => i !== idx);
                      handleChange('points', newPoints);
                    }}
                    className="text-red-500/50 hover:text-red-500 px-2"
                  >&times;</button>
                </div>
                <textarea 
                  value={point.info} 
                  onChange={(e) => {
                    const newPoints = [...points];
                    newPoints[idx].info = e.target.value;
                    handleChange('points', newPoints);
                  }}
                  className="w-full bg-black/40 border border-white/10 p-2 rounded text-[10px]"
                  placeholder="Información que aparece al tocar..."
                />
                <div className="grid grid-cols-2 gap-4">
                  <label className="block">
                    <span className="text-[9px] text-dim uppercase block mb-1">Pos X ({point.x}%)</span>
                    <input type="range" min="0" max="100" value={point.x} onChange={(e) => {
                      const newPoints = [...points];
                      newPoints[idx].x = parseInt(e.target.value);
                      handleChange('points', newPoints);
                    }} className="w-full accent-emerald-500" />
                  </label>
                  <label className="block">
                    <span className="text-[9px] text-dim uppercase block mb-1">Pos Y ({point.y}%)</span>
                    <input type="range" min="0" max="100" value={point.y} onChange={(e) => {
                      const newPoints = [...points];
                      newPoints[idx].y = parseInt(e.target.value);
                      handleChange('points', newPoints);
                    }} className="w-full accent-emerald-500" />
                  </label>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="radio" 
                    name={`target-${data.id || 'current'}`}
                    checked={targetHotspot === point.id}
                    onChange={() => handleChange('targetHotspot', point.id)}
                    className="w-4 h-4 accent-emerald-500"
                  />
                  <span className="text-[10px] uppercase font-bold text-emerald-400">Es el objetivo correcto</span>
                </label>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 relative bg-dark">
      <div className="w-full max-w-2xl">
        <h2 className="text-2xl font-bold mb-6 text-center text-emerald-400">{instruction}</h2>
        
        <div className="relative w-full aspect-square md:aspect-video rounded-3xl overflow-hidden glass-panel border border-white/10 group">
          <img src={imageUrl} alt="Map" className="w-full h-full object-cover" />
          
          <div className={`absolute inset-0 bg-black/40 transition-opacity duration-1000 ${success ? 'opacity-0' : 'opacity-100'}`} />

          {points?.map((point) => (
            <button
              key={point.id}
              onClick={() => handlePointClick(point)}
              className="absolute w-8 h-8 -ml-4 -mt-4 rounded-full border-2 border-white/50 bg-emerald-500/50 flex items-center justify-center hover:scale-125 transition-transform group-hover:animate-pulse z-10"
              style={{ left: `${point.x}%`, top: `${point.y}%` }}
            >
              <div className="w-2 h-2 bg-white rounded-full shadow-[0_0_10px_white]" />
            </button>
          ))}

          <AnimatePresence>
            {selectedPoint && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className={`absolute bottom-4 left-4 right-4 p-4 rounded-2xl backdrop-blur-md border ${
                  success ? 'bg-emerald-900/80 border-emerald-500' : 'bg-red-900/80 border-red-500'
                } z-20`}
              >
                <h3 className="font-bold text-white mb-1">{selectedPoint.label}</h3>
                <p className="text-sm text-white/80">{selectedPoint.info}</p>
                {success && (
                  <button 
                    onClick={onNext}
                    className="mt-4 px-6 py-2 bg-white text-emerald-900 font-bold rounded-lg text-sm uppercase tracking-widest float-right"
                  >
                    CONTINUAR
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default HotspotTemplate;
