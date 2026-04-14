import React, { useState } from 'react';
import NarrativeTemplate from '@shared/components/templates/NarrativeTemplate';
import QuizTemplate from '@shared/components/templates/QuizTemplate';
import '@shared/theme/designSystem.css';

const TEMPLATES = {
  T01_NARRATIVE: 'Narrativa (Personaje + Texto)',
  T02_QUIZ_SELECT: 'Quiz (Pregunta + Opciones)'
};

const LevelEditor = () => {
  const [template, setTemplate] = useState('T01_NARRATIVE');
  const [data, setData] = useState({
    character: 'El Guardián',
    text: 'Escribe aquí tu diálogo...',
    accentColor: 'var(--color-guardian)',
    pregunta: '¿Cuál es la pregunta?',
    opciones: ['Opción 1', 'Opción 2', 'Opción 3'],
    correctIndex: 0,
    feedback: 'Buen trabajo.'
  });

  const handleChange = (field, value) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const handleOpcionChange = (index, value) => {
    const newOpciones = [...data.opciones];
    newOpciones[index] = value;
    setData(prev => ({ ...prev, opciones: newOpciones }));
  };

  const renderPreview = () => {
    switch (template) {
      case 'T01_NARRATIVE':
        return <NarrativeTemplate data={data} onNext={() => alert('Próxima pantalla')} />;
      case 'T02_QUIZ_SELECT':
        return <QuizTemplate data={data} onNext={() => alert('¡Correcto!')} />;
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-dark text-main">
      {/* Columna Izquierda: Formulario */}
      <div className="w-1/3 border-r border-white/10 p-8 overflow-y-auto">
        <h2 className="text-2xl font-bold mb-8 uppercase tracking-widest">Editor de Pantalla</h2>
        
        <div className="space-y-6">
          <label className="block">
            <span className="text-dim text-xs uppercase font-bold mb-2 block">Tipo de Plantilla</span>
            <select 
              value={template} 
              onChange={(e) => setTemplate(e.target.value)}
              className="w-full bg-white/5 border border-white/10 p-3 rounded-lg text-main"
            >
              {Object.entries(TEMPLATES).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </label>

          <hr className="border-white/5" />

          {/* Campos comunes */}
          <label className="block">
            <span className="text-dim text-xs uppercase font-bold mb-2 block">Personaje</span>
            <input 
              type="text" 
              value={data.character} 
              onChange={(e) => handleChange('character', e.target.value)}
              className="w-full bg-white/5 border border-white/10 p-3 rounded-lg text-main"
            />
          </label>

          {template === 'T01_NARRATIVE' && (
            <label className="block">
              <span className="text-dim text-xs uppercase font-bold mb-2 block">Diálogo</span>
              <textarea 
                value={data.text} 
                onChange={(e) => handleChange('text', e.target.value)}
                rows="4"
                className="w-full bg-white/5 border border-white/10 p-3 rounded-lg text-main"
              />
            </label>
          )}

          {template === 'T02_QUIZ_SELECT' && (
            <>
              <label className="block">
                <span className="text-dim text-xs uppercase font-bold mb-2 block">Pregunta</span>
                <input 
                  type="text" 
                  value={data.pregunta} 
                  onChange={(e) => handleChange('pregunta', e.target.value)}
                  className="w-full bg-white/5 border border-white/10 p-3 rounded-lg text-main"
                />
              </label>

              <div className="space-y-3">
                <span className="text-dim text-xs uppercase font-bold mb-2 block">Opciones</span>
                {data.opciones.map((opc, idx) => (
                  <div key={idx} className="flex gap-2">
                    <input 
                      type="text" 
                      value={opc} 
                      onChange={(e) => handleOpcionChange(idx, e.target.value)}
                      className="flex-1 bg-white/5 border border-white/10 p-3 rounded-lg text-main"
                    />
                    <input 
                      type="radio" 
                      name="correct" 
                      checked={data.correctIndex === idx}
                      onChange={() => handleChange('correctIndex', idx)}
                      className="w-6"
                    />
                  </div>
                ))}
              </div>

              <label className="block">
                <span className="text-dim text-xs uppercase font-bold mb-2 block">Feedback (Correcto)</span>
                <input 
                  type="text" 
                  value={data.feedback} 
                  onChange={(e) => handleChange('feedback', e.target.value)}
                  className="w-full bg-white/5 border border-white/10 p-3 rounded-lg text-main"
                />
              </label>
            </>
          )}
        </div>

        <button className="mt-12 w-full py-4 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-500 transition-colors shadow-lg shadow-emerald-900/20">
          GUARDAR EN FIREBASE
        </button>
      </div>

      {/* Columna Derecha: Live Preview */}
      <div className="flex-1 relative bg-[#05070a] flex flex-col items-center justify-center">
        <div className="absolute top-6 left-6 z-50">
          <span className="bg-emerald-500 text-black px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">LIVE PREVIEW</span>
        </div>
        
        {/* Simulador de Móvil */}
        <div className="w-[375px] h-[667px] bg-dark rounded-[3rem] border-[12px] border-[#1a1c1e] shadow-2xl overflow-hidden relative">
          <div className="absolute inset-0 overflow-y-auto scale-90 origin-top">
            {renderPreview()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LevelEditor;
