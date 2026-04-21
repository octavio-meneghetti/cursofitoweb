import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

const OrderingTemplate = ({ data, onNext, onResult, isEditMode }) => {
  const { instruction, items, conceptId } = data;
  const [list, setList] = useState([]);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    // Shuffle the items initially so they aren't in the correct order
    if (items) {
      const shuffled = [...items].sort(() => Math.random() - 0.5);
      setList(shuffled);
    }
  }, [items]);

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
    // Check if the current list order exactly matches the items array sorted by 'order'
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

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-dark">
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
            className="flex-1 py-4 bg-cyan-600 text-white font-black rounded-xl hover:bg-cyan-500 transition-colors uppercase tracking-widest"
          >
            Verificar Orden
          </button>

          {feedback?.success && (
            <button 
              onClick={onNext}
              className="px-8 py-4 bg-white text-cyan-900 font-black rounded-xl hover:bg-gray-200 transition-colors uppercase tracking-widest"
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
