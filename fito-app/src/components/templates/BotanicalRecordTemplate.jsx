import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const BotanicalRecordTemplate = ({ data, onNext, onResult, conceptId, isEditMode = false }) => {
  const { 
    title = 'Describila en 5 rasgos',
    traits = [
      { id: 'color', label: 'Color', options: ['Verde claro', 'Verde oscuro', 'Rojizo', 'Otro'], icon: '🎨' },
      { id: 'texture', label: 'Textura', options: ['Lisa', 'Áspera', 'Carnosa', 'Fina', 'Dura'], icon: '✋' },
      { id: 'aroma', label: 'Aroma', options: ['Sin aroma', 'Suave', 'Fuerte', 'Dulce', 'Resinoso'], icon: '👃' },
      { id: 'shape', label: 'Forma', options: ['Hojas grandes', 'Hojas pequeñas', 'Alargadas', 'Redondas'], icon: '📐' },
      { id: 'place', label: 'Lugar', options: ['Maceta', 'Suelo', 'Vereda', 'Sombra', 'Sol'], icon: '📍' }
    ],
    buttonText = 'GUARDAR REGISTRO',
    accentColor = '#10b981',
    notesPlaceholder = '¿Alguna observación extra? (Opcional)'
  } = data || {};

  const [selections, setSelections] = useState({});
  const [extraNotes, setExtraNotes] = useState('');
  const [activeTrait, setActiveTrait] = useState(null);

  // Sanitización básica para evitar HTML
  const sanitizeText = (text) => {
    return text.replace(/<[^>]*>?/gm, '');
  };

  const handleSelect = (traitId, option) => {
    const newSelections = { ...selections, [traitId]: option };
    setSelections(newSelections);
    setActiveTrait(null);
  };

  const isComplete = traits.every(t => selections[t.id]);

  const handleFinalSubmit = () => {
    if (onResult) {
      onResult({ 
        success: true, 
        conceptId: conceptId || 'botanical_record',
        metadata: { 
          isJournalEntry: true,
          journalData: {
            title: title || 'Registro Botánico',
            entries: [
              ...traits.map(t => ({
                question: t.label,
                answer: selections[t.id] || 'No especificado'
              })),
              {
                question: 'Notas Adicionales',
                answer: sanitizeText(extraNotes) || 'Sin notas'
              }
            ]
          }
        } 
      });
    }
    onNext();
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#060608] text-white p-6 font-sans relative overflow-y-auto">
      
      {/* Ambience */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-[100px] rounded-full -mr-32 -mt-32" />
      
      <div className="z-10 flex flex-col h-full max-w-md mx-auto w-full">
        
        {/* Header */}
        <header className="mb-8 pt-4">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 mb-2"
          >
            <div className="h-px flex-1 bg-white/10" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Bitácora Botánica</span>
            <div className="h-px flex-1 bg-white/10" />
          </motion.div>
          <h1 className="text-2xl font-black text-center uppercase tracking-tight">
            {title}
          </h1>
        </header>

        {/* Traits Grid */}
        <div className="grid grid-cols-1 gap-3 mb-4">
          {traits.map((trait, index) => (
            <motion.button
              key={trait.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => setActiveTrait(trait)}
              className={`group relative flex items-center gap-3 p-4 rounded-2xl border transition-all duration-300 ${
                selections[trait.id] 
                  ? 'bg-emerald-500/10 border-emerald-500/30' 
                  : 'bg-white/5 border-white/5 hover:border-white/20'
              }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg transition-all ${
                selections[trait.id] ? 'bg-emerald-500 text-black shadow-[0_0_15px_#10b981]' : 'bg-white/5 text-white/40'
              }`}>
                {trait.icon}
              </div>
              
              <div className="text-left flex-1">
                <span className="block text-[9px] font-black uppercase tracking-widest text-white/30 mb-0.5">
                  {trait.label}
                </span>
                <span className={`text-xs font-bold ${selections[trait.id] ? 'text-white' : 'text-white/20 italic'}`}>
                  {selections[trait.id] || 'Pendiente...'}
                </span>
              </div>

              {selections[trait.id] && (
                <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg">
                  <svg className="w-4 h-4 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </motion.button>
          ))}

          {/* Extra Notes Field */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: traits.length * 0.1 }}
            className="mt-4 p-5 rounded-3xl bg-white/5 border border-white/5 space-y-3"
          >
            <div className="flex items-center gap-2 text-white/30">
              <span className="text-xs">📝</span>
              <span className="text-[10px] font-black uppercase tracking-widest">Notas Adicionales</span>
            </div>
            <textarea
              value={extraNotes}
              onChange={(e) => setExtraNotes(e.target.value)}
              placeholder={notesPlaceholder}
              rows="2"
              maxLength="1000"
              className="w-full bg-transparent border-none p-0 text-sm text-white/80 placeholder:text-white/10 focus:ring-0 resize-none italic"
            />
          </motion.div>
        </div>

        {/* Space for the fixed button */}
        <div className="h-32 flex-shrink-0" />

        {/* Footer Button */}
        <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#060608] via-[#060608] to-transparent pt-12 z-20">
          <div className="max-w-md mx-auto">
            <motion.button
              disabled={!isComplete && !isEditMode}
              whileHover={isComplete ? { scale: 1.02 } : {}}
              whileTap={isComplete ? { scale: 0.98 } : {}}
              onClick={handleFinalSubmit}
              className={`w-full py-5 rounded-2xl font-black uppercase tracking-[0.3em] text-sm transition-all shadow-2xl ${
                isComplete 
                  ? 'bg-emerald-500 text-black shadow-[0_0_40px_rgba(16,185,129,0.3)]' 
                  : 'bg-white/5 text-white/20 cursor-not-allowed border border-white/5'
              }`}
            >
              {buttonText}
            </motion.button>
          </div>
        </div>

        {/* Selection Modal */}
        <AnimatePresence>
          {activeTrait && (
            <div className="fixed inset-0 z-50 flex items-end justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setActiveTrait(null)}
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              />
              <motion.div 
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="relative bg-[#0c0c12] w-full max-w-md rounded-t-[3rem] border-t border-white/10 p-6 pt-2 overflow-hidden shadow-[0_-20px_50px_rgba(0,0,0,0.5)]"
              >
                <div className="w-12 h-1 bg-white/10 rounded-full mx-auto mb-4 opacity-20" />
                
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center text-xl">
                    {activeTrait.icon}
                  </div>
                  <h3 className="text-lg font-black uppercase tracking-tight">{activeTrait.label}</h3>
                </div>

                <div className="grid grid-cols-2 gap-2 mb-4">
                  {activeTrait.options.map((option) => (
                    <button
                      key={option}
                      onClick={() => handleSelect(activeTrait.id, option)}
                      className={`p-3 rounded-xl border font-bold text-xs transition-all ${
                        selections[activeTrait.id] === option
                          ? 'bg-emerald-500 border-emerald-500 text-black'
                          : 'bg-white/5 border-white/5 hover:border-white/20 text-white/70'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
};

export default BotanicalRecordTemplate;
