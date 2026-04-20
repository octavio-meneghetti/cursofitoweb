import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const HotspotTemplate = ({ data, onNext, onResult, isEditMode }) => {
  const { imageUrl, instruction, points, targetHotspot, conceptId } = data;
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [success, setSuccess] = useState(false);

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

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 relative bg-dark">
      <div className="w-full max-w-2xl">
        <h2 className="text-2xl font-bold mb-6 text-center text-emerald-400">{instruction}</h2>
        
        <div className="relative w-full aspect-square md:aspect-video rounded-3xl overflow-hidden glass-panel border border-white/10 group">
          <img src={imageUrl} alt="Map" className="w-full h-full object-cover" />
          
          {/* Overlay oscuro para contrastar si no se ha encontrado */}
          <div className={`absolute inset-0 bg-black/40 transition-opacity duration-1000 ${success ? 'opacity-0' : 'opacity-100'}`} />

          {/* Hotspots */}
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

          {/* Info Popup */}
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
