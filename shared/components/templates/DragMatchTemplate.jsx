import React, { useState } from 'react';
import { motion, useMotionValue } from 'framer-motion';

const DragMatchTemplate = ({ data, onChange, isEditMode }) => {
  const handleChange = (field, value) => {
    onChange({ ...data, [field]: value });
  };

  const updateItem = (index, field, value) => {
    const newItems = [...data.items];
    newItems[index][field] = value;
    handleChange('items', newItems);
  };

  const addItem = () => {
    handleChange('items', [...data.items, { id: Math.random().toString(), label: 'Nuevo Elemento', isCorrect: false }]);
  };

  const removeItem = (index) => {
    const newItems = data.items.filter((_, i) => i !== index);
    handleChange('items', newItems);
  };

  if (isEditMode) {
    return (
      <div className="space-y-6">
        <label className="block">
          <span className="text-dim text-xs uppercase font-bold mb-1 block">Etiqueta de la Zona Objetivo (Ej: Mortero)</span>
          <input 
            type="text" 
            value={data.objectiveLabel || ''} 
            onChange={e => handleChange('objectiveLabel', e.target.value)} 
            className="w-full bg-black/30 border border-white/10 p-2 rounded text-sm text-white" 
          />
        </label>
        
        <label className="block">
          <span className="text-dim text-xs uppercase font-bold mb-1 block">Mensaje de Éxito</span>
          <input 
            type="text" 
            value={data.successMessage || ''} 
            onChange={e => handleChange('successMessage', e.target.value)} 
            className="w-full bg-black/30 border border-white/10 p-2 rounded text-sm text-white" 
          />
        </label>

        <div>
          <h4 className="text-sm font-bold text-emerald-400 mb-2">Elementos Arrastrables</h4>
          {data.items?.map((item, index) => (
            <div key={item.id} className="bg-black/20 p-4 rounded-xl border border-white/5 mb-4 relative flex gap-4 items-center">
              <button onClick={() => removeItem(index)} className="absolute top-2 right-2 text-red-400 hover:text-red-300">✕</button>
              
              <div className="flex-1">
                <input
                  type="text"
                  value={item.label}
                  onChange={(e) => updateItem(index, 'label', e.target.value)}
                  className="w-full bg-black/30 border border-white/10 p-2 rounded text-sm text-white"
                  placeholder="Nombre de la planta / concepto"
                />
              </div>
              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  checked={item.isCorrect} 
                  onChange={(e) => updateItem(index, 'isCorrect', e.target.checked)} 
                  className="w-5 h-5 accent-emerald-500"
                />
                <span className="text-xs font-bold uppercase text-dim">Correcto</span>
              </div>
            </div>
          ))}
          <button onClick={addItem} className="w-full py-2 border-2 border-dashed border-emerald-500/30 text-emerald-400 font-bold rounded-xl hover:bg-emerald-500/10">
            + AGREGAR ELEMENTO
          </button>
        </div>
      </div>
    );
  }

  // PREVIEW / GAMEPLAY MODE
  const [items, setItems] = useState(data.items || []);
  const [message, setMessage] = useState(null);
  
  // We check if all correct items have been removed (meaning they were successfully matched)
  const allMatched = items.filter(i => i.isCorrect).length === 0 && data.items?.some(i => i.isCorrect);

  const handleDragEnd = (event, info, item) => {
    // If dragged downwards towards the target (y offset > 100)
    if (info.offset.y > 100) {
      if (item.isCorrect) {
        // Success match: remove item from pool
        setItems(prev => prev.filter(i => i.id !== item.id));
        setMessage({ type: 'success', text: '¡Correcto!' });
        setTimeout(() => setMessage(null), 1500);
      } else {
        // Incorrect match: show error, box snaps back natively because constraints
        setMessage({ type: 'error', text: 'Esto no va aquí.' });
        setTimeout(() => setMessage(null), 1500);
      }
    }
  };

  if (allMatched) {
    return (
      <div className="flex flex-col items-center justify-center p-8 h-full bg-emerald-950/20 text-center rounded-3xl border border-emerald-500/30">
        <span className="text-6xl mb-4">⚗️</span>
        <h2 className="text-2xl font-bold text-emerald-400 mb-2">{data.successMessage}</h2>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[500px] flex flex-col items-center justify-between bg-black/20 rounded-3xl overflow-hidden border border-white/5 p-6">
      
      <div className="w-full text-center mb-4">
        <p className="text-dim text-sm uppercase tracking-widest font-bold">Arrastra el correcto al objetivo</p>
      </div>

      {/* Draggable items pool */}
      <div className="flex flex-wrap gap-4 justify-center flex-1 items-center z-10 w-full relative">
        {items.map(item => (
          <motion.div
            key={item.id}
            drag
            dragConstraints={{ top: 0, left: 0, right: 0, bottom: 0 }}
            dragElastic={0.8}
            onDragEnd={(e, info) => handleDragEnd(e, info, item)}
            className="px-6 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl text-white font-bold cursor-grab active:cursor-grabbing shadow-lg"
          >
            {item.label}
          </motion.div>
        ))}
      </div>

      {/* Target Zone */}
      <div className="w-full h-40 bg-white/5 border-2 border-dashed border-white/20 rounded-2xl flex flex-col items-center justify-center mt-auto relative">
        <span className="text-4xl mb-2 opacity-50">🥣</span>
        <span className="text-white/50 font-bold uppercase tracking-widest">{data.objectiveLabel}</span>
        
        {/* Helper text overlay */}
        <div className="absolute inset-x-0 -top-8 text-center text-xs text-dim animate-pulse">
          ⬇ Arrastra aquí ⬇
        </div>
      </div>

      {/* Message Overlay */}
      {message && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
          <div className={`px-6 py-3 rounded-full font-bold text-sm shadow-2xl ${message.type === 'success' ? 'bg-emerald-500 text-black' : 'bg-red-500 text-white'}`}>
            {message.text}
          </div>
        </div>
      )}
    </div>
  );
};

export default DragMatchTemplate;
