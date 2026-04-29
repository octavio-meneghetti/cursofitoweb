import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * JournalTemplate (T08): Diario de Reflexión / Escritura Guiada
 * Versión optimizada: contador en una línea y campos adaptables.
 */
const JournalTemplate = ({ data, onChange, isEditMode, onNext, onResult, conceptId }) => {
  const {
    title = 'Cuaderno de Campo',
    subtitle = 'Registra tus observaciones',
    questions = [
      { id: '1', label: '¿Qué es?', placeholder: 'Ej: Una planta con hojas aromáticas...', chips: [], allowCustom: true }
    ],
    accentColor = '#10b981',
    buttonText = 'GUARDAR REGISTRO',
    titleSize = 48,
    subtitleSize = 10,
    labelSize = 24,
    placeholderSize = 16,
    gapBetweenQuestions = 48,
    maxChars = 120
  } = data || {};

  const handleChange = (field, value) => {
    if (onChange) onChange(field, value);
  };

  const updateQuestion = (index, field, value) => {
    const newQuestions = [...questions];
    newQuestions[index][field] = value;
    handleChange('questions', newQuestions);
  };

  const addQuestion = () => {
    handleChange('questions', [
      ...questions,
      { id: Math.random().toString(), label: 'Nueva pregunta', placeholder: 'Escribe aquí...', chips: [], allowCustom: true }
    ]);
  };

  const removeQuestion = (index) => {
    const newQuestions = questions.filter((_, i) => i !== index);
    handleChange('questions', newQuestions);
  };

  if (isEditMode) {
    return (
      <div className="space-y-6 text-main pb-10">
        <div className="p-4 bg-white/5 border border-white/10 rounded-2xl space-y-4">
            <h4 className="text-[10px] font-black uppercase text-emerald-400 tracking-widest mb-2">Encabezado</h4>
            <div className="grid grid-cols-2 gap-4">
                <label className="block">
                    <span className="text-[9px] uppercase font-bold text-dim mb-1 block">Título</span>
                    <input type="text" value={title} onChange={(e) => handleChange('title', e.target.value)} className="w-full bg-black/40 border border-white/10 p-2 rounded text-xs text-white" />
                </label>
                <label className="block">
                    <span className="text-[9px] uppercase font-bold text-dim mb-1 block">Tamaño Título ({titleSize}px)</span>
                    <input type="range" min="20" max="100" value={titleSize} onChange={(e) => handleChange('titleSize', parseInt(e.target.value))} className="w-full accent-emerald-500" />
                </label>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <label className="block">
                    <span className="text-[9px] uppercase font-bold text-dim mb-1 block">Subtítulo</span>
                    <input type="text" value={subtitle} onChange={(e) => handleChange('subtitle', e.target.value)} className="w-full bg-black/40 border border-white/10 p-2 rounded text-xs text-white" />
                </label>
                <label className="block">
                    <span className="text-[9px] uppercase font-bold text-dim mb-1 block">Tamaño Subt ({subtitleSize}px)</span>
                    <input type="range" min="8" max="30" value={subtitleSize} onChange={(e) => handleChange('subtitleSize', parseInt(e.target.value))} className="w-full accent-emerald-500" />
                </label>
            </div>
        </div>

        <div className="p-4 bg-white/5 border border-white/10 rounded-2xl space-y-4">
            <h4 className="text-[10px] font-black uppercase text-emerald-400 tracking-widest mb-2">Configuración de Campos</h4>
            <div className="grid grid-cols-2 gap-4">
                <label className="block">
                    <span className="text-[9px] uppercase font-bold text-dim mb-1 block">Tam. Pregunta ({labelSize}px)</span>
                    <input type="range" min="14" max="60" value={labelSize} onChange={(e) => handleChange('labelSize', parseInt(e.target.value))} className="w-full accent-emerald-500" />
                </label>
                <label className="block">
                    <span className="text-[9px] uppercase font-bold text-dim mb-1 block">Tam. Ejemplo ({placeholderSize}px)</span>
                    <input type="range" min="10" max="40" value={placeholderSize} onChange={(e) => handleChange('placeholderSize', parseInt(e.target.value))} className="w-full accent-emerald-500" />
                </label>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <label className="block">
                    <span className="text-[9px] uppercase font-bold text-dim mb-1 block">Espaciado ({gapBetweenQuestions}px)</span>
                    <input type="range" min="10" max="150" value={gapBetweenQuestions} onChange={(e) => handleChange('gapBetweenQuestions', parseInt(e.target.value))} className="w-full accent-emerald-500" />
                </label>
                <label className="block">
                    <span className="text-[9px] uppercase font-bold text-dim mb-1 block">Límite Caract. ({maxChars})</span>
                    <input type="number" value={maxChars} onChange={(e) => handleChange('maxChars', parseInt(e.target.value))} className="w-full bg-black/40 border border-white/10 p-2 rounded text-xs text-white" />
                </label>
            </div>
        </div>

        <div className="space-y-4">
          <h4 className="text-[10px] font-black uppercase text-white/40 tracking-widest">Preguntas del Diario</h4>
          {questions.map((q, index) => (
            <div key={q.id} className="bg-white/5 p-4 rounded-2xl border border-white/10 relative space-y-3">
              <button onClick={() => removeQuestion(index)} className="absolute top-4 right-4 text-red-500/50 hover:text-red-500 transition-colors">✕</button>
              
              <label className="block">
                <span className="text-[9px] uppercase font-bold text-dim mb-1 block">Pregunta</span>
                <input type="text" value={q.label} onChange={(e) => updateQuestion(index, 'label', e.target.value)} className="w-full bg-black/40 border border-white/10 p-2 rounded-lg text-sm text-white" />
              </label>

              <label className="block">
                <span className="text-[9px] uppercase font-bold text-dim mb-1 block">Ejemplo / Placeholder</span>
                <input type="text" value={q.placeholder || ''} onChange={(e) => updateQuestion(index, 'placeholder', e.target.value)} className="w-full bg-black/40 border border-white/10 p-2 rounded-lg text-sm text-emerald-400/60" />
              </label>
            </div>
          ))}
          <button onClick={addQuestion} className="w-full py-4 border-2 border-dashed border-white/10 text-emerald-400 font-bold rounded-2xl hover:bg-emerald-500/10 transition-all text-xs uppercase tracking-widest">
            + AGREGAR PREGUNTA AL DIARIO
          </button>
        </div>

        <label className="block">
            <span className="text-[10px] uppercase font-black text-emerald-400 mb-2 block tracking-widest">Texto del Botón</span>
            <input type="text" value={buttonText} onChange={(e) => handleChange('buttonText', e.target.value)} className="w-full bg-black/40 border border-white/10 p-3 rounded-xl text-sm text-white" />
        </label>
      </div>
    );
  }

  // MODO PLAY / ALUMNO
  const [customInputs, setCustomInputs] = useState({});

  const handleCustomChange = (qId, value) => {
    if (value.length <= maxChars) {
        setCustomInputs({ ...customInputs, [qId]: value });
    }
  };

  const handleSave = () => {
    if (onResult && Object.keys(customInputs).length > 0) {
      onResult({
        success: true,
        conceptId: conceptId || 'journal_entry',
        metadata: {
          isJournalEntry: true,
          journalData: {
            title,
            entries: questions.map(q => ({
              question: q.label,
              answer: customInputs[q.id] || ''
            }))
          }
        }
      });
    }
    if (onNext) onNext();
  };

  return (
    <div className="w-full h-full flex flex-col p-8 bg-[#05070a] relative overflow-y-auto hide-scrollbar">
      {/* Cabecera */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12 text-center"
      >
        <h2 
            className="text-emerald-500 font-black uppercase tracking-[0.4em] opacity-70 mb-2"
            style={{ fontSize: `${subtitleSize}px` }}
        >
            {title}
        </h2>
        <p 
            className="text-white font-serif leading-tight"
            style={{ fontSize: `${titleSize}px` }}
        >
            {subtitle}
        </p>
      </motion.div>

      {/* Listado de Preguntas */}
      <div 
        className="w-full"
        style={{ display: 'flex', flexDirection: 'column', gap: `${gapBetweenQuestions}px` }}
      >
        {questions.map((q, idx) => (
          <motion.div 
            key={q.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="w-full relative z-10"
          >
            <h3 
                className="text-emerald-50/90 font-bold mb-4 flex items-center gap-4"
                style={{ fontSize: `${labelSize}px` }}
            >
                {q.label}
            </h3>
            
            <div className="relative group">
                <textarea 
                  rows="7"
                  placeholder={q.placeholder || "Tu respuesta aquí..."}
                  value={customInputs[q.id] || ''}
                  onChange={(e) => handleCustomChange(q.id, e.target.value)}
                  className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl text-white placeholder:text-white/20 focus:outline-none focus:border-emerald-500/50 focus:bg-emerald-500/5 transition-all shadow-inner resize-none min-h-[200px]"
                  style={{ fontSize: `${placeholderSize}px`, lineHeight: '1.4' }}
                />
                
                {/* Contador de caracteres (Optimizado para una línea) */}
                <div className="mt-2 flex justify-end items-center px-2">
                    <span className={`text-[10px] font-black tracking-widest whitespace-nowrap ${ (customInputs[q.id]?.length || 0) >= maxChars ? 'text-red-500' : 'text-white/30'}`}>
                        {(customInputs[q.id]?.length || 0)} / {maxChars}
                    </span>
                </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Botón de Guardado */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="w-full max-w-md mx-auto mt-12 pb-12 relative z-50"
      >
        <button 
          onClick={handleSave}
          className="w-full py-5 rounded-full bg-white text-black font-black uppercase tracking-[0.3em] text-xs shadow-[0_20px_50px_rgba(0,0,0,0.5)] hover:scale-105 transition-all active:scale-95 relative overflow-hidden"
        >
          {buttonText}
        </button>
      </motion.div>
    </div>
  );

};

export default JournalTemplate;
