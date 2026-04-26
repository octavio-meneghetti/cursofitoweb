import React, { useState } from 'react';
import { motion } from 'framer-motion';

const MagneticPuzzleTemplate = ({ data, onNext, onResult, isEditMode, onChange }) => {
  const { instruction, pieces = [], conceptId } = data;
  const [positions, setPositions] = useState({});
  const [solved, setSolved] = useState([]);

  const handleChange = (field, value) => {
    if (onChange) onChange(field, value);
  };

  const handleDragEnd = (id, info, targetX, targetY) => {
    if (isEditMode) return;

    // Simulación de imán: si está cerca del objetivo, se "pega"
    const distance = Math.sqrt(Math.pow(info.point.x - targetX, 2) + Math.pow(info.point.y - targetY, 2));
    
    if (distance < 50) {
      if (!solved.includes(id)) {
        const newSolved = [...solved, id];
        setSolved(newSolved);
        
        if (newSolved.length === pieces.length && onResult) {
          onResult({ success: true, conceptId, metadata: { piecesSolved: newSolved.length } });
        }
      }
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
            placeholder="Ej: Une las polaridades del agua..."
          />
        </label>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-dim text-[10px] uppercase font-bold">Piezas Magnéticas</span>
            <button 
              onClick={() => {
                const newPieces = [...pieces];
                newPieces.push({ id: Math.random().toString(36).substr(2, 9), label: '🔋 (+)', targetX: 100, targetY: 100, color: '#3b82f6' });
                handleChange('pieces', newPieces);
              }}
              className="text-[10px] bg-indigo-500/20 text-indigo-400 px-3 py-1 rounded-full border border-indigo-500/30"
            >
              + Añadir Pieza
            </button>
          </div>

          <div className="space-y-3">
            {pieces.map((piece, idx) => (
              <div key={piece.id} className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-3">
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={piece.label} 
                    onChange={(e) => {
                      const newPieces = [...pieces];
                      newPieces[idx].label = e.target.value;
                      handleChange('pieces', newPieces);
                    }}
                    className="flex-1 bg-black/40 border border-white/10 p-2 rounded text-sm font-bold"
                    placeholder="Contenido/Icono"
                  />
                  <input 
                    type="text" 
                    value={piece.color} 
                    onChange={(e) => {
                      const newPieces = [...pieces];
                      newPieces[idx].color = e.target.value;
                      handleChange('pieces', newPieces);
                    }}
                    className="w-20 bg-black/40 border border-white/10 p-2 rounded text-[10px]"
                    placeholder="Color"
                  />
                  <button 
                    onClick={() => {
                      const newPieces = pieces.filter((_, i) => i !== idx);
                      handleChange('pieces', newPieces);
                    }}
                    className="text-red-500/50 hover:text-red-500 px-2"
                  >&times;</button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <p className="text-[9px] text-white/30 italic col-span-2">Ubicación del objetivo (X/Y en px relativo al centro)</p>
                  <input 
                    type="number" 
                    value={piece.targetX} 
                    onChange={(e) => {
                        const newPieces = [...pieces];
                        newPieces[idx].targetX = parseInt(e.target.value);
                        handleChange('pieces', newPieces);
                    }}
                    className="bg-black/40 border border-white/10 p-2 rounded text-xs"
                    placeholder="X Objetivo"
                  />
                  <input 
                    type="number" 
                    value={piece.targetY} 
                    onChange={(e) => {
                        const newPieces = [...pieces];
                        newPieces[idx].targetY = parseInt(e.target.value);
                        handleChange('pieces', newPieces);
                    }}
                    className="bg-black/40 border border-white/10 p-2 rounded text-xs"
                    placeholder="Y Objetivo"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-[#05070a] text-white">
      <h2 className="text-2xl font-bold mb-12 text-indigo-400 text-center">{instruction}</h2>
      
      <div className="relative w-full max-w-sm h-96 border-2 border-indigo-500/20 rounded-3xl bg-indigo-950/10 shadow-inner overflow-hidden">
        {/* Marcadores de objetivo */}
        {pieces.map(piece => (
          <div 
            key={`target-${piece.id}`}
            className="absolute w-16 h-16 -ml-8 -mt-8 border-2 border-dashed border-indigo-500/30 rounded-full flex items-center justify-center"
            style={{ left: `${piece.targetX}px`, top: `${piece.targetY}px` }}
          >
            <div className="w-1 h-1 bg-indigo-500/50 rounded-full" />
          </div>
        ))}

        {/* Piezas móviles */}
        {pieces.map(piece => (
          <motion.div
            key={piece.id}
            drag
            dragConstraints={{ top: 0, left: 0, right: 300, bottom: 300 }}
            onDragEnd={(e, info) => handleDragEnd(piece.id, info, piece.targetX, piece.targetY)}
            animate={solved.includes(piece.id) ? { left: piece.targetX, top: piece.targetY, scale: 1.1 } : {}}
            className={`absolute w-16 h-16 -ml-8 -mt-8 rounded-full flex items-center justify-center font-bold text-2xl shadow-xl cursor-grab active:cursor-grabbing z-20 ${solved.includes(piece.id) ? 'shadow-[0_0_20px_white]' : ''}`}
            style={{ backgroundColor: piece.color, left: solved.includes(piece.id) ? piece.targetX : '50%', top: solved.includes(piece.id) ? piece.targetY : '80%' }}
          >
            {piece.label}
          </motion.div>
        ))}
      </div>

      {solved.length === pieces.length && (
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={onNext}
          className="mt-12 px-12 py-4 bg-indigo-600 text-white font-black rounded-xl shadow-lg uppercase tracking-widest"
        >
          ¡Enlace Completo!
        </motion.button>
      )}
    </div>
  );
};

export default MagneticPuzzleTemplate;
