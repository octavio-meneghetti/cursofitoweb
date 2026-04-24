import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const MissionActionTemplate = ({ data, onNext, onResult, conceptId, isEditMode = false }) => {
  const { 
    missionTitle = 'Misión 1: Elegí una planta',
    instruction = 'Elegí una planta cerca. No importa cuál. Si no sabés su nombre, mejor.',
    successButtonText = 'YA LA TENGO',
    helpButtonText = 'NO ENCUENTRO',
    helpMessage = 'Podés buscar una hoja, un árbol, una maleza o incluso una maceta.',
    accentColor = '#10b981',
    titleFontSize = '1.5rem',
    instructionFontSize = '1.1rem'
  } = data || {};

  const [showHelp, setShowHelp] = useState(false);

  const handleComplete = () => {
    if (onResult) {
      onResult({ 
        success: true, 
        conceptId: conceptId || 'mission_action',
        metadata: { missionCompleted: true } 
      });
    }
    onNext();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-10 px-6 bg-[#060608] text-white overflow-hidden relative font-sans text-center">
      
      {/* Background Ambience */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full blur-[120px] opacity-10"
          style={{ backgroundColor: accentColor }}
        />
        <div 
          className="absolute bottom-[-5%] left-[-5%] w-[30%] h-[30%] rounded-full blur-[100px] opacity-10"
          style={{ backgroundColor: accentColor }}
        />
      </div>

      <div className="max-w-md w-full z-10 space-y-12">
        
        {/* Mission Badge & Title */}
        <motion.div 
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="space-y-4"
        >
          <div className="inline-block px-4 py-1.5 rounded-full bg-white/5 border border-white/10 mb-2">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50">Tarea de Campo</span>
          </div>
          <h1 className="font-black leading-tight uppercase tracking-tight" style={{ fontSize: titleFontSize, color: accentColor }}>
            {missionTitle}
          </h1>
        </motion.div>

        {/* Main Instruction Card */}
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-10 shadow-2xl relative"
        >
          <p className="font-medium leading-relaxed opacity-90" style={{ fontSize: instructionFontSize }}>
            {instruction}
          </p>

          <AnimatePresence>
            {showHelp && (
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="mt-8 pt-8 border-t border-white/10 flex flex-col items-center"
              >
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center mb-3">
                  <span className="text-sm">💡</span>
                </div>
                <p className="text-sm italic text-white/60 leading-relaxed">
                  {helpMessage}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Actions Section */}
        <div className="space-y-4 w-full">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleComplete}
            className="w-full py-5 bg-white text-black font-black uppercase tracking-[0.3em] rounded-2xl shadow-[0_10px_30px_rgba(255,255,255,0.1)] text-sm"
          >
            {successButtonText}
          </motion.button>

          {!showHelp && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={() => setShowHelp(true)}
              className="w-full py-4 text-white/40 font-bold uppercase tracking-widest text-[10px] hover:text-white transition-colors"
            >
              {helpButtonText}
            </motion.button>
          )}
        </div>

      </div>
    </div>
  );
};

export default MissionActionTemplate;
