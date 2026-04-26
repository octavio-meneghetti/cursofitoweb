import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

const OrderingTemplate = ({ data, onNext, onResult, isEditMode, onChange }) => {
  const { instruction, items = [], conceptId } = data;
  const [list, setList] = useState([]);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    if (items && !isEditMode) {
      const shuffled = [...items].sort(() => Math.random() - 0.5);
      setList(shuffled);
    } else if (items) {
      setList([...items].sort((a, b) => a.order - b.order));
    }
  }, [items, isEditMode]);

  const handleChange = (field, value) => {
    if (onChange) onChange(field, value);
  };

  const onDragEnd = (result) => {
    if (!result.destination || isEditMode) return;

    const sourceIndex = result.source.index;
    const destIndex = result.destination.index;

    const newList = Array.from(list);
    const [removed] = newList.splice(sourceIndex, 1);
    newList.splice(destIndex, 0, removed);

    setList(newList);
  };

  const handleVerify = () => {
    const sortedOriginal = [...items].sort((a, b) => a.order - b.order);
    const isCorrect = list.every((item, index) => item.id === sortedOriginal[index].id);

    if (onResult && !feedback?.success) {
      onResult({
        success: isCorrect,
        conceptId: conceptId,
        metadata: { currentOrder: list.map(i => i.label) }
      });
    }

    if (isCorrect) {
      setFeedback({ success: true, text: '¡Excelente! El orden es correcto.' });
    } else {
      setFeedback({ success: false, text: 'El orden aún no es correcto. Sigue intentando.' });
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
            placeholder="Ej: Ordena los pasos del proceso..."
          />
        </label>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-dim text-[10px] uppercase font-bold">Elementos a Ordenar (En el orden correcto)</span>
            <button 
              onClick={() => {
                const newItems = [...items];
                const maxOrder = items.length > 0 ? Math.max(...items.map(i => i.order)) : 0;
                newItems.push({ id: Math.random().toString(36).substr(2, 9), label: 'Nuevo paso', order: maxOrder + 1 });
                handleChange('items', newItems);
              }}
              className="text-[10px] bg-cyan-500/20 text-cyan-400 px-3 py-1 rounded-full border border-cyan-500/30"
            >
              + Añadir Paso
            </button>
          </div>

          <div className="space-y-2">
            {items.sort((a, b) => a.order - b.order).map((item, idx) => (
              <div key={item.id} className="flex gap-2 items-center bg-white/5 p-2 rounded-lg border border-white/5">
                <span className="text-[10px] font-black text-cyan-500/50 w-6">{idx + 1}</span>
                <input 
                  type="text" 
                  value={item.label} 
                  onChange={(e) => {
                    const newItems = [...items];
                    const itemIdx = newItems.findIndex(i => i.id === item.id);
                    newItems[itemIdx].label = e.target.value;
                    handleChange('items', newItems);
                  }}
                  className="flex-1 bg-transparent border-none text-sm text-white focus:ring-0"
                />
                <button 
                  onClick={() => {
                    const newItems = items.filter(i => i.id !== item.id);
                    handleChange('items', newItems);
                  }}
                  className="text-red-500/50 hover:text-red-500 px-2"
                >&times;</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-dark text-main">
      <div className="w-full max-w-md">
        <h2 className="text-2xl font-bold mb-8 text-center text-cyan-400">{instruction}</h2>

        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="ordering-list">
            {(provided) => (
              <div 
                {...provided.droppableProps} 
                ref={provided.innerRef}
                className="space-y-3"
              >
                {list.map((item, index) => (
                  <Draggable key={item.id} draggableId={item.id} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={`p-4 rounded-xl border flex items-center justify-between font-bold text-lg font-mono tracking-widest ${
                          snapshot.isDragging 
                            ? 'bg-cyan-900 border-cyan-400 text-white shadow-[0_0_20px_rgba(34,211,238,0.5)]' 
                            : 'bg-white/5 border-white/10 text-white/80 hover:bg-white/10'
                        } transition-colors`}
                        style={{ ...provided.draggableProps.style }}
                      >
                        <span className="text-white/20 mr-4">☰</span>
                        <span className="flex-1 text-center">{item.label}</span>
                        <span className="text-white/20 ml-4 font-black">0{index + 1}</span>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>

        {feedback && (
          <div className={`mt-6 p-4 rounded-xl text-center font-bold ${feedback.success ? 'bg-emerald-900/50 text-emerald-400 border border-emerald-500/30' : 'bg-red-900/50 text-red-400 border border-red-500/30'}`}>
            {feedback.text}
          </div>
        )}

        <div className="mt-8 flex gap-4">
          <button 
            onClick={handleVerify}
            className="flex-1 py-4 bg-cyan-600 text-white font-black rounded-xl hover:bg-cyan-500 transition-colors uppercase tracking-widest shadow-lg"
          >
            Verificar Orden
          </button>

          {feedback?.success && (
            <button 
              onClick={onNext}
              className="px-8 py-4 bg-white text-cyan-900 font-black rounded-xl hover:bg-gray-200 transition-colors uppercase tracking-widest shadow-lg"
            >
              ➔
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderingTemplate;
