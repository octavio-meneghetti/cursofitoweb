import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const FlipTemplate = ({ data, onChange, isEditMode }) => {
  const handleChange = (field, value) => {
    onChange({ ...data, [field]: value });
  };

  const updateCard = (index, field, value) => {
    const newCards = [...data.cards];
    newCards[index][field] = value;
    handleChange('cards', newCards);
  };

  const addCard = () => {
    handleChange('cards', [...data.cards, { id: Math.random().toString(), front: 'Frente', back: 'Reverso' }]);
  };

  const removeCard = (index) => {
    const newCards = data.cards.filter((_, i) => i !== index);
    handleChange('cards', newCards);
  };

  if (isEditMode) {
    return (
      <div className="space-y-6">
        <div>
          <h4 className="text-sm font-bold text-emerald-400 mb-2">Tarjetas Giratorias (Flashcards)</h4>
          {data.cards?.map((card, index) => (
            <div key={card.id} className="bg-black/20 p-4 rounded-xl border border-white/5 mb-4 relative">
              <button onClick={() => removeCard(index)} className="absolute top-2 right-2 text-red-400 hover:text-red-300">✕</button>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase text-dim mb-1">Frente (Concepto)</label>
                  <textarea
                    value={card.front}
                    onChange={(e) => updateCard(index, 'front', e.target.value)}
                    className="w-full bg-black/30 border border-white/10 p-2 rounded text-sm text-white min-h-[60px]"
                    placeholder="Ej: SUMAR (Potenciación)"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase text-dim mb-1">Reverso (Explicación)</label>
                  <textarea
                    value={card.back}
                    onChange={(e) => updateCard(index, 'back', e.target.value)}
                    className="w-full bg-black/30 border border-white/10 p-2 rounded text-sm text-white min-h-[60px]"
                    placeholder="Explicación detallada al girar..."
                  />
                </div>
              </div>
            </div>
          ))}
          <button onClick={addCard} className="w-full py-2 border-2 border-dashed border-emerald-500/30 text-emerald-400 font-bold rounded-xl hover:bg-emerald-500/10">
            + AGREGAR TARJETA
          </button>
        </div>
      </div>
    );
  }

  // PREVIEW / GAMEPLAY MODE
  const [flippedIndex, setFlippedIndex] = useState(null);

  const handleCardClick = (index) => {
    setFlippedIndex(flippedIndex === index ? null : index);
  };

  return (
    <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
      {data.cards?.map((card, index) => {
        const isFlipped = flippedIndex === index;
        
        return (
          <div 
            key={card.id}
            className="relative h-64 cursor-pointer perspective-1000"
            onClick={() => handleCardClick(index)}
          >
            <motion.div
              className="w-full h-full relative preserve-3d"
              initial={false}
              animate={{ rotateY: isFlipped ? 180 : 0 }}
              transition={{ duration: 0.6, type: "spring", bounce: 0.2 }}
              style={{ transformStyle: "preserve-3d" }}
            >
              {/* FRONT */}
              <div className="absolute inset-0 backface-hidden bg-gradient-to-br from-emerald-900/40 to-black/60 border border-emerald-500/30 rounded-2xl flex items-center justify-center p-6 text-center shadow-lg">
                <div>
                  <span className="text-4xl mb-4 block opacity-50">🔄</span>
                  <h3 className="text-xl font-bold text-emerald-100">{card.front}</h3>
                  <p className="text-xs text-dim uppercase tracking-widest mt-4">Toca para girar</p>
                </div>
              </div>

              {/* BACK */}
              <div 
                className="absolute inset-0 backface-hidden bg-gradient-to-br from-indigo-900/40 to-black/60 border border-indigo-500/30 rounded-2xl flex items-center justify-center p-6 text-center shadow-lg"
                style={{ transform: 'rotateY(180deg)' }}
              >
                <div>
                  <p className="text-lg text-white font-medium">{card.back}</p>
                </div>
              </div>
            </motion.div>
          </div>
        );
      })}

      {/* Internal CSS for 3D flip (if not in gloabl CSS) */}
      <style dangerouslySetInnerHTML={{__html: `
        .perspective-1000 { perspective: 1000px; }
        .preserve-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; -webkit-backface-visibility: hidden; }
      `}} />
    </div>
  );
};

export default FlipTemplate;
