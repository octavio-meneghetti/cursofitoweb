import React, { useState } from 'react';

const JournalTemplate = ({ data, onChange, isEditMode }) => {
  const handleChange = (field, value) => {
    if (onChange) onChange({ ...data, [field]: value });
  };

  const updateQuestion = (index, field, value) => {
    const newQuestions = [...data.questions];
    newQuestions[index][field] = value;
    handleChange('questions', newQuestions);
  };

  const addQuestion = () => {
    handleChange('questions', [
      ...data.questions,
      { id: Math.random().toString(), label: 'Nueva pregunta', chips: ['Opc 1', 'Opc 2'], allowCustom: true }
    ]);
  };

  const removeQuestion = (index) => {
    const newQuestions = data.questions.filter((_, i) => i !== index);
    handleChange('questions', newQuestions);
  };

  if (isEditMode) {
    return (
      <div className="space-y-6">
        <div>
          <h4 className="text-sm font-bold text-emerald-400 mb-2">Preguntas de Diario Guiado</h4>
          {data.questions?.map((q, index) => (
            <div key={q.id} className="bg-black/20 p-4 rounded-xl border border-white/5 mb-4 relative">
              <button onClick={() => removeQuestion(index)} className="absolute top-2 right-2 text-red-400 hover:text-red-300">✕</button>
              
              <label className="block text-xs uppercase text-dim mb-1">Dato a preguntar</label>
              <input
                type="text"
                value={q.label}
                onChange={(e) => updateQuestion(index, 'label', e.target.value)}
                className="w-full bg-black/30 border border-white/10 p-2 rounded text-sm text-white mb-4"
                placeholder="Ej: Aroma de la planta"
              />

              <label className="block text-xs uppercase text-dim mb-1">Opciones rápidas (Chips separadas por coma)</label>
              <input
                type="text"
                value={q.chips.join(', ')}
                onChange={(e) => updateQuestion(index, 'chips', e.target.value.split(',').map(s => s.trim()))}
                className="w-full bg-black/30 border border-white/10 p-2 rounded text-sm text-white mb-4"
                placeholder="Dulce, Intenso, Sin aroma..."
              />

              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  checked={q.allowCustom} 
                  onChange={(e) => updateQuestion(index, 'allowCustom', e.target.checked)} 
                  className="w-5 h-5 accent-emerald-500"
                />
                <span className="text-xs font-bold uppercase text-dim">Permitir respuesta en texto libre</span>
              </div>
            </div>
          ))}
          <button onClick={addQuestion} className="w-full py-2 border-2 border-dashed border-emerald-500/30 text-emerald-400 font-bold rounded-xl hover:bg-emerald-500/10">
            + AGREGAR PREGUNTA
          </button>
        </div>
      </div>
    );
  }

  // PREVIEW / GAMEPLAY MODE
  const [answers, setAnswers] = useState({});
  const [customInputs, setCustomInputs] = useState({});

  const toggleChip = (qId, chip) => {
    const currentAns = answers[qId] || [];
    if (currentAns.includes(chip)) {
      setAnswers({ ...answers, [qId]: currentAns.filter(c => c !== chip) });
    } else {
      setAnswers({ ...answers, [qId]: [...currentAns, chip] });
    }
  };

  const handleCustomChange = (qId, value) => {
    setCustomInputs({ ...customInputs, [qId]: value });
  };

  return (
    <div className="w-full min-h-[400px] flex flex-col p-6 bg-black/20 rounded-3xl overflow-y-auto hide-scrollbar border border-white/5">
      <div className="mb-6">
        <h2 className="text-emerald-400 font-bold uppercase tracking-widest text-sm mb-2 opacity-70">📓 Cuaderno de Campo</h2>
        <p className="text-white text-xl font-serif">Registra tus observaciones</p>
      </div>

      <div className="space-y-8 flex-1">
        {data.questions?.map(q => (
          <div key={q.id} className="animate-fade-in">
            <h3 className="text-emerald-50 font-bold mb-3">{q.label}</h3>
            
            <div className="flex flex-wrap gap-2 mb-3">
              {q.chips.map(chip => {
                const isSelected = (answers[q.id] || []).includes(chip);
                return (
                  <button
                    key={chip}
                    onClick={() => toggleChip(q.id, chip)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${isSelected ? 'bg-emerald-500 text-black border border-emerald-500' : 'bg-black/40 text-dim border border-white/10 hover:border-white/30'}`}
                  >
                    {chip}
                  </button>
                );
              })}
            </div>

            {q.allowCustom && (
              <input 
                type="text"
                placeholder="Otra observación libre..."
                value={customInputs[q.id] || ''}
                onChange={(e) => handleCustomChange(q.id, e.target.value)}
                className="w-full bg-white/5 border border-white/5 p-3 rounded-lg text-sm text-emerald-100 placeholder:text-white/20 focus:outline-none focus:border-emerald-500/50"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default JournalTemplate;
