import React from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';

const SwipeTemplate = ({ data, onChange, isEditMode }) => {
  const handleChange = (field, value) => {
    onChange({ ...data, [field]: value });
  };

  const updateCard = (index, field, value) => {
    const newCards = [...data.cards];
    newCards[index][field] = value;
    handleChange('cards', newCards);
  };

  const addCard = () => {
    handleChange('cards', [...data.cards, { id: Math.random().toString(), text: 'Nuevo caso', correctDirection: 'left', explanation: '' }]);
  };

  const removeCard = (index) => {
    const newCards = data.cards.filter((_, i) => i !== index);
    handleChange('cards', newCards);
  };

  if (isEditMode) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs uppercase font-bold text-dim mb-1">Etiqueta Izquierda (Rojo)</label>
            <input type="text" value={data.leftLabel || ''} onChange={e => handleChange('leftLabel', e.target.value)} className="w-full bg-black/30 border border-white/10 p-2 rounded text-sm text-white" />
          </div>
          <div>
            <label className="block text-xs uppercase font-bold text-dim mb-1">Etiqueta Derecha (Verde)</label>
            <input type="text" value={data.rightLabel || ''} onChange={e => handleChange('rightLabel', e.target.value)} className="w-full bg-black/30 border border-white/10 p-2 rounded text-sm text-white" />
          </div>
        </div>

        <div>
          <h4 className="text-sm font-bold text-emerald-400 mb-2">Tarjetas de Triaje</h4>
          {data.cards?.map((card, index) => (
            <div key={card.id} className="bg-black/20 p-4 rounded-xl border border-white/5 mb-4 relative">
              <button onClick={() => removeCard(index)} className="absolute top-2 right-2 text-red-400 hover:text-red-300">✕</button>
              <textarea
                value={card.text}
                onChange={(e) => updateCard(index, 'text', e.target.value)}
                className="w-full bg-black/30 border border-white/10 p-2 rounded text-sm text-white min-h-[60px] mb-2"
                placeholder="Descripción del caso clínico..."
              />
              <div className="grid grid-cols-2 gap-2 mb-2">
                <div>
                  <label className="block text-xs uppercase text-dim">Dirección Correcta</label>
                  <select value={card.correctDirection} onChange={(e) => updateCard(index, 'correctDirection', e.target.value)} className="w-full bg-black/30 border border-white/10 p-2 rounded text-sm text-white">
                    <option value="left">Izquierda ({data.leftLabel})</option>
                    <option value="right">Derecha ({data.rightLabel})</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs uppercase text-dim">Explicación (Feedback)</label>
                <input type="text" value={card.explanation || ''} onChange={e => updateCard(index, 'explanation', e.target.value)} className="w-full bg-black/30 border border-white/10 p-2 rounded text-sm text-white" />
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
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [feedback, setFeedback] = React.useState(null);
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-150, 150], [-15, 15]);
  const opacity = useTransform(x, [-150, 0, 150], [0.5, 1, 0.5]);
  const color = useTransform(x, [-100, 0, 100], ['#ef4444', '#ffffff', '#10b981']);

  const activeCard = data.cards?.[currentIndex];

  const handleDragEnd = (event, info) => {
    if (!activeCard) return;
    
    const threshold = 100;
    const offset = info.offset.x;
    
    if (Math.abs(offset) > threshold) {
      const swipedDirection = offset > 0 ? 'right' : 'left';
      if (swipedDirection === activeCard.correctDirection) {
        setFeedback({ success: true, text: activeCard.explanation || '¡Correcto!' });
        setTimeout(() => {
          setFeedback(null);
          setCurrentIndex(prev => prev + 1);
        }, 3000);
      } else {
        setFeedback({ success: false, text: 'Incorrecto. ' + (activeCard.explanation || 'Vuelve a intentarlo.') });
        // The card snaps back to origin because we don't change the index
      }
    }
  };

  if (currentIndex >= data.cards?.length) {
    return (
      <div className="flex flex-col items-center justify-center p-8 h-full bg-emerald-950/20 text-center rounded-3xl border border-emerald-500/30">
        <span className="text-6xl mb-4">🏆</span>
        <h2 className="text-2xl font-bold text-emerald-400 mb-2">¡Triaje completado!</h2>
        <p className="text-emerald-100/70">Has clasificado correctamente todos los casos.</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[400px] flex items-center justify-center bg-black/20 rounded-3xl overflow-hidden border border-white/5">
      {/* Background Indicators */}
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-red-500/30 font-bold text-2xl -rotate-90 origin-center whitespace-nowrap">
        &larr; {data.leftLabel}
      </div>
      <div className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-500/30 font-bold text-2xl rotate-90 origin-center whitespace-nowrap">
        {data.rightLabel} &rarr;
      </div>

      {activeCard && !feedback && (
        <motion.div
          drag="x"
          dragConstraints={{ left: 0, right: 0 }} // Snaps back if not swiped far enough
          onDragEnd={handleDragEnd}
          style={{ x, rotate, opacity }}
          className="absolute z-10 w-3/4 aspect-[3/4] bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 flex flex-col justify-center items-center text-center shadow-2xl cursor-grab active:cursor-grabbing"
        >
          <motion.p style={{ color }} className="text-xl font-medium">
            {activeCard.text}
          </motion.p>
        </motion.div>
      )}

      {feedback && (
        <div className={`absolute inset-0 z-20 flex flex-col items-center justify-center p-8 text-center backdrop-blur-sm ${feedback.success ? 'bg-emerald-900/80 text-emerald-100' : 'bg-red-900/80 text-red-100'}`}>
          <span className="text-6xl mb-4">{feedback.success ? '🌿' : '🚩'}</span>
          <p className="text-xl font-bold">{feedback.text}</p>
          {!feedback.success && (
            <button onClick={() => setFeedback(null)} className="mt-6 px-6 py-2 bg-white/20 hover:bg-white/30 rounded-full font-bold">Intentar de nuevo</button>
          )}
        </div>
      )}
    </div>
  );
};

export default SwipeTemplate;
