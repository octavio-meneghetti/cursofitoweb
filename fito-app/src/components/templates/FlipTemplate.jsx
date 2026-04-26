import React, { useState } from 'react';
import { motion } from 'framer-motion';

const FlipTemplate = ({ data, onChange, isEditMode }) => {
  const handleChange = (field, value) => {
    if (onChange) onChange(field, value);
  };

  const updateCard = (index, field, value) => {
    const newCards = [...(data.cards || [])];
    newCards[index][field] = value;
    handleChange('cards', newCards);
  };

  const addCard = () => {
    handleChange('cards', [...(data.cards || []), { id: Math.random().toString(), front: 'Nuevo Concepto', back: 'Explicación' }]);
  };

  const removeCard = (index) => {
    const newCards = data.cards.filter((_, i) => i !== index);
    handleChange('cards', newCards);
  };

  if (isEditMode) {
    return (
      <div className="space-y-6">
        <h4 className="text-[10px] font-black uppercase text-emerald-400 tracking-widest">Cartas de Estudio (Girar)</h4>
        {data.cards?.map((card, index) => (
          <div key={card.id} className="bg-black/40 p-4 rounded-xl border border-white/10 mb-4 relative">
            <button onClick={() => removeCard(index)} className="absolute top-2 right-2 text-red-500/50 hover:text-red-500 font-bold">✕</button>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[9px] uppercase font-bold text-dim mb-1">Frente (Concepto)</label>
                <textarea
                  value={card.front}
                  onChange={(e) => updateCard(index, 'front', e.target.value)}
                  className="w-full bg-white/5 border border-white/10 p-2 rounded text-sm text-white min-h-[60px]"
                />
              </div>
              <div>
                <label className="block text-[9px] uppercase font-bold text-dim mb-1">Dorso (Explicación)</label>
                <textarea
                  value={card.back}
                  onChange={(e) => updateCard(index, 'back', e.target.value)}
                  className="w-full bg-white/5 border border-white/10 p-2 rounded text-sm text-white min-h-[60px]"
                />
              </div>
            </div>
          </div>
        ))}
        <button onClick={addCard} className="w-full py-3 border-2 border-dashed border-emerald-500/20 text-emerald-400 font-bold rounded-xl hover:bg-emerald-500/10 transition-all">
          + AGREGAR CARTA GIRATORIA
        </button>
      </div>
    );
  }

  // PREVIEW / GAMEPLAY MODE
  const [flippedIndex, setFlippedIndex] = useState(null);

  return (
    <div className="w-full h-full p-8 flex flex-wrap justify-center gap-6 bg-[#05070a] rounded-3xl overflow-y-auto hide-scrollbar border border-white/5">
      {data.cards?.map((card, index) => (
        <div 
          key={card.id} 
          className="w-64 h-80 relative perspective-1000"
          onClick={() => setFlippedIndex(flippedIndex === index ? null : index)}
        >
          <motion.div
            animate={{ rotateY: flippedIndex === index ? 180 : 0 }}
            transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
            className="w-full h-full relative preserve-3d cursor-pointer"
          >
            {/* Front */}
            <div className="absolute inset-0 backface-hidden bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 flex flex-col items-center justify-center text-center shadow-xl">
              <span className="text-[10px] font-black uppercase text-emerald-500 mb-6 tracking-widest opacity-50">Concepto</span>
              <p className="text-xl font-medium text-white leading-relaxed">{card.front}</p>
              <div className="mt-8 text-[9px] font-black text-white/20 uppercase tracking-widest">Tocar para girar</div>
            </div>

            {/* Back */}
            <div 
              className="absolute inset-0 backface-hidden bg-emerald-950/40 backdrop-blur-xl border border-emerald-500/30 rounded-3xl p-8 flex flex-col items-center justify-center text-center shadow-2xl rotate-y-180"
            >
              <span className="text-[10px] font-black uppercase text-emerald-400 mb-6 tracking-widest opacity-50">Explicación</span>
              <p className="text-lg text-emerald-50/90 leading-relaxed italic">{card.back}</p>
              <div className="mt-8 w-8 h-1 bg-emerald-500/30 rounded-full" />
            </div>
          </motion.div>
        </div>
      ))}
    </div>
  );
};

export default FlipTemplate;
