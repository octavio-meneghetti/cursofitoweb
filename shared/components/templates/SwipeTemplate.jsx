import React from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';

const SwipeTemplate = ({ data, onChange, isEditMode, onResult }) => {
  const handleChange = (field, value) => {
    if (onChange) onChange(field, value);
  };

  const updateCard = (index, field, value) => {
    const newCards = [...(data.cards || [])];
    newCards[index][field] = value;
    handleChange('cards', newCards);
  };

  const addCard = () => {
    handleChange('cards', [...(data.cards || []), { id: Math.random().toString(), text: 'Nuevo caso', correctDirection: 'left', explanation: '' }]);
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
            <label className="block text-[10px] uppercase font-black text-emerald-400 mb-1">Etiqueta Izquierda (Rojo)</label>
            <input type="text" value={data.leftLabel || ''} onChange={e => handleChange('leftLabel', e.target.value)} className="w-full bg-black/40 border border-white/10 p-2 rounded text-sm text-white" />
          </div>
          <div>
            <label className="block text-[10px] uppercase font-black text-emerald-400 mb-1">Etiqueta Derecha (Verde)</label>
            <input type="text" value={data.rightLabel || ''} onChange={e => handleChange('rightLabel', e.target.value)} className="w-full bg-black/40 border border-white/10 p-2 rounded text-sm text-white" />
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="text-[10px] font-black uppercase text-white/40 tracking-widest">Tarjetas de Triaje</h4>
          {data.cards?.map((card, index) => (
            <div key={card.id} className="bg-black/40 p-4 rounded-xl border border-white/10 mb-4 relative">
              <button onClick={() => removeCard(index)} className="absolute top-2 right-2 text-red-500/50 hover:text-red-500 font-bold">✕</button>
              <label className="block text-[9px] uppercase font-bold text-dim mb-1">Caso Clínico / Texto</label>
              <textarea
                value={card.text}
                onChange={(e) => updateCard(index, 'text', e.target.value)}
                className="w-full bg-white/5 border border-white/10 p-2 rounded text-sm text-white min-h-[60px] mb-3"
                placeholder="Descripción del caso..."
              />
              <div className="grid grid-cols-2 gap-4 mb-3">
                <div>
                  <label className="block text-[9px] uppercase font-bold text-dim mb-1">Decisión Correcta</label>
                  <select value={card.correctDirection} onChange={(e) => updateCard(index, 'correctDirection', e.target.value)} className="w-full bg-white/5 border border-white/10 p-2 rounded text-xs text-white">
                    <option value="left">Izquierda ({data.leftLabel})</option>
                    <option value="right">Derecha ({data.rightLabel})</option>
                  </select>
                </div>
                <div>
                   <label className="block text-[9px] uppercase font-bold text-dim mb-1">Feedback / Explicación</label>
                   <input type="text" value={card.explanation || ''} onChange={(e) => updateCard(index, 'explanation', e.target.value)} className="w-full bg-white/5 border border-white/10 p-2 rounded text-xs text-white" />
                </div>
              </div>
            </div>
          ))}
          <button onClick={addCard} className="w-full py-3 border-2 border-dashed border-emerald-500/20 text-emerald-400 font-bold rounded-xl hover:bg-emerald-500/10 transition-all">
            + AGREGAR CASO DE TRIAJE
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
      const isCorrect = swipedDirection === activeCard.correctDirection;

      if (onResult) {
        onResult({
          success: isCorrect,
          conceptId: data.conceptId,
          metadata: { cardText: activeCard.text, direction: swipedDirection }
        });
      }

      if (isCorrect) {
        setFeedback({ success: true, text: activeCard.explanation || '¡Correcto!' });
        setTimeout(() => {
          setFeedback(null);
          setCurrentIndex(prev => prev + 1);
        }, 2500);
      } else {
        setFeedback({ success: false, text: 'Incorrecto. ' + (activeCard.explanation || 'Vuelve a intentarlo.') });
      }
    }
  };

  if (currentIndex >= (data.cards?.length || 0)) {
    return (
      <div className="flex flex-col items-center justify-center p-12 h-full bg-[#05070a] text-center rounded-3xl border border-emerald-500/10">
        <span className="text-7xl mb-6">🌿</span>
        <h2 className="text-3xl font-serif text-white mb-4">¡Triaje completado!</h2>
        <p className="text-emerald-100/40 italic">Has clasificado correctamente todos los casos.</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[500px] flex items-center justify-center bg-[#05070a] rounded-3xl overflow-hidden border border-white/5 shadow-2xl">
      {/* Background Indicators */}
      <div className="absolute left-6 top-1/2 -translate-y-1/2 text-red-500/20 font-black text-3xl -rotate-90 origin-center whitespace-nowrap tracking-[0.2em]">
        &larr; {data.leftLabel}
      </div>
      <div className="absolute right-6 top-1/2 -translate-y-1/2 text-emerald-500/20 font-black text-3xl rotate-90 origin-center whitespace-nowrap tracking-[0.2em]">
        {data.rightLabel} &rarr;
      </div>

      {activeCard && !feedback && (
        <motion.div
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          onDragEnd={handleDragEnd}
          style={{ x, rotate, opacity }}
          className="absolute z-10 w-4/5 aspect-[3/4] bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 flex flex-col justify-center items-center text-center shadow-2xl cursor-grab active:cursor-grabbing group"
        >
          <div className="absolute top-4 left-4 text-[10px] font-black text-white/20 uppercase tracking-widest">{currentIndex + 1} / {data.cards.length}</div>
          <motion.p style={{ color }} className="text-2xl font-medium leading-relaxed drop-shadow-lg">
            {activeCard.text}
          </motion.p>
          <div className="mt-8 text-[10px] font-black text-white/10 uppercase tracking-[0.4em] group-hover:text-white/30 transition-all">Desliza para decidir</div>
        </motion.div>
      )}

      {feedback && (
        <div className={`absolute inset-0 z-20 flex flex-col items-center justify-center p-12 text-center backdrop-blur-md ${feedback.success ? 'bg-emerald-950/80 text-emerald-100' : 'bg-red-950/80 text-red-100'}`}>
          <motion.div 
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex flex-col items-center"
          >
            <span className="text-7xl mb-6">{feedback.success ? '✨' : '🚩'}</span>
            <p className="text-2xl font-serif mb-4">{feedback.text}</p>
            {!feedback.success && (
              <button onClick={() => setFeedback(null)} className="mt-8 px-10 py-3 bg-white text-red-950 rounded-full font-black uppercase text-xs tracking-widest hover:scale-110 transition-transform shadow-xl">Intentar de nuevo</button>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default SwipeTemplate;
