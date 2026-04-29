import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const QuickBurstQuizTemplate = ({ data, onNext, onResult, conceptId, isEditMode = false }) => {
  const { 
    title = 'Mini-quiz de Validación',
    questions = [
      { id: 'q1', text: '¿Para empezar, es obligatorio saber el nombre?', options: ['No', 'Sí'], correctIndex: 0 },
      { id: 'q2', text: '¿Qué es más importante hoy?', options: ['Mirar con atención', 'Buscar recetas'], correctIndex: 0 },
      { id: 'q3', text: '¿Cuál es el primer gesto del terapeuta?', options: ['Observar', 'Intervenir'], correctIndex: 0 }
    ],
    shakeIntensity = 50
  } = data || {};

  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [errorIndex, setErrorIndex] = useState(null);

  const handleSelect = (qIndex, optIndex) => {
    if (qIndex !== currentStep) return;
    const isCorrect = optIndex === questions[qIndex].correctIndex;

    if (isCorrect) {
      const newAnswers = { ...answers, [qIndex]: optIndex };
      setAnswers(newAnswers);
      setErrorIndex(null);
      if (currentStep < questions.length - 1) {
        setTimeout(() => setCurrentStep(prev => prev + 1), 400);
      } else {
        setTimeout(() => {
          if (onResult) {
            onResult({ 
              success: true, 
              conceptId: conceptId || 'quick_burst', 
              metadata: { 
                isJournalEntry: true,
                journalData: {
                  title: title || 'Quiz Ráfaga',
                  entries: questions.map((q, i) => ({
                    question: q.text,
                    answer: newAnswers[i] !== undefined ? q.options[newAnswers[i]] : 'Sin responder'
                  }))
                }
              } 
            });
          }
          onNext();
        }, 800);
      }
    } else {
      setErrorIndex(qIndex);
      // NUEVO: Reportamos el error inmediatamente al sistema de maestría/analíticas
      if (onResult) {
        onResult({
          success: false,
          conceptId: conceptId || 'quick_burst',
          metadata: {
            question: questions[qIndex].text,
            selectedAnswer: questions[qIndex].options[optIndex],
            correctAnswer: questions[qIndex].options[questions[qIndex].correctIndex]
          }
        });
      }
      setTimeout(() => setErrorIndex(null), 500);
    }
  };

  const styles = {
    container: {
      background: 'linear-gradient(to bottom, #0a241d, #040d0a, #020504)',
      minHeight: '100vh',
      color: 'white',
      padding: '24px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      position: 'relative',
      overflowX: 'hidden'
    },
    header: {
      marginBottom: '32px',
      position: 'relative',
      zIndex: 10
    },
    title: {
      fontSize: '24px',
      fontWeight: '900',
      textTransform: 'uppercase',
      margin: 0,
      letterSpacing: '-0.5px'
    },
    subtitle: {
      fontSize: '10px',
      fontWeight: '900',
      textTransform: 'uppercase',
      letterSpacing: '3px',
      color: 'rgba(16, 185, 129, 0.6)',
      display: 'block',
      marginBottom: '4px'
    },
    card: (isActive, isCompleted, isLocked) => ({
      background: isActive ? 'rgba(255, 255, 255, 0.08)' : isCompleted ? 'rgba(16, 185, 129, 0.05)' : 'rgba(255, 255, 255, 0.02)',
      borderRadius: '32px',
      padding: '24px',
      border: `1px solid ${isActive ? 'rgba(16, 185, 129, 0.4)' : 'rgba(255, 255, 255, 0.05)'}`,
      marginBottom: '16px',
      opacity: isLocked ? 0.2 : 1,
      transition: 'all 0.5s ease',
      backdropFilter: 'blur(10px)',
      boxShadow: isActive ? '0 20px 40px rgba(0,0,0,0.3)' : 'none'
    }),
    number: (isCompleted, isActive) => ({
      width: '40px',
      height: '40px',
      borderRadius: '12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: '900',
      fontSize: '16px',
      background: isCompleted ? 'linear-gradient(135deg, #34d399, #059669)' : isActive ? '#10b981' : 'rgba(255,255,255,0.1)',
      color: isCompleted ? 'black' : 'white',
      marginRight: '16px',
      boxShadow: isCompleted ? '0 0 20px rgba(16, 185, 129, 0.4)' : 'none'
    }),
    option: {
      background: 'rgba(16, 185, 129, 0.1)',
      border: '1px solid rgba(16, 185, 129, 0.2)',
      borderRadius: '16px',
      padding: '16px 20px',
      color: 'white',
      fontWeight: '700',
      fontSize: '16px',
      textAlign: 'left',
      width: '100%',
      marginBottom: '10px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      cursor: 'pointer',
      outline: 'none'
    }
  };

  const answeredCount = Object.keys(answers).length;

  return (
    <div style={styles.container}>
      
      {/* Background Glows */}
      <div style={{ position: 'absolute', top: '-10%', right: '-10%', width: '500px', height: '500px', background: 'rgba(16, 185, 129, 0.15)', filter: 'blur(100px)', borderRadius: '50%', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '10%', left: '-10%', width: '400px', height: '400px', background: 'rgba(5, 150, 105, 0.1)', filter: 'blur(100px)', borderRadius: '50%', pointerEvents: 'none' }} />

      <div style={{ maxWidth: '450px', margin: '0 auto', position: 'relative', zIndex: 10, paddingTop: '20px' }}>
        
        <header style={styles.header}>
          <span style={styles.subtitle}>Desafío Botánico</span>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h1 style={styles.title}>{title}</h1>
            <div style={{ fontWeight: '900', fontSize: '24px' }}>
              <span style={{ color: '#10b981' }}>{answeredCount}</span>
              <span style={{ opacity: 0.3, fontSize: '14px' }}> / {questions.length}</span>
            </div>
          </div>
          <div style={{ height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', marginTop: '12px', overflow: 'hidden' }}>
            <motion.div 
              animate={{ width: `${(answeredCount / questions.length) * 100}%` }}
              style={{ height: '100%', background: '#10b981', boxShadow: '0 0 10px #10b981' }}
            />
          </div>
        </header>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {questions.map((q, idx) => {
            const isLocked = idx > currentStep;
            const isCompleted = idx < currentStep || answers[idx] !== undefined;
            const isActive = idx === currentStep;

            return (
              <motion.div
                key={q.id}
                animate={{ 
                  scale: isActive && !isCompleted ? 1 : 0.98,
                  opacity: isLocked ? 0.2 : 1,
                  x: errorIndex === idx ? [0, -shakeIntensity, shakeIntensity, -shakeIntensity, shakeIntensity, -shakeIntensity, shakeIntensity, 0] : 0
                }}
                transition={{ 
                  duration: errorIndex === idx ? 0.25 : 0.5,
                  ease: "linear"
                }}
                style={styles.card(isActive, isCompleted, isLocked)}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: (isActive && !isCompleted) ? '20px' : '0' }}>
                  <div style={styles.number(isCompleted, isActive)}>
                    {isCompleted ? '✓' : idx + 1}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, fontSize: '18px', fontWeight: '800', lineHeight: '1.2' }}>{q.text}</p>
                    {isCompleted && (
                      <span style={{ color: '#34d399', fontSize: '12px', fontWeight: '900', textTransform: 'uppercase', marginTop: '4px', display: 'block' }}>
                        {q.options[answers[idx]]}
                      </span>
                    )}
                  </div>
                </div>

                <AnimatePresence>
                  {isActive && !isCompleted && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      style={{ overflow: 'hidden' }}
                    >
                      {q.options.map((opt, optIdx) => (
                        <motion.button
                          key={optIdx}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleSelect(idx, optIdx)}
                          style={styles.option}
                        >
                          <span>{opt}</span>
                          <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.1)' }} />
                        </motion.button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        <footer style={{ marginTop: '40px', textAlign: 'center', opacity: 0.4 }}>
          <p style={{ fontSize: '10px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '2px' }}>
            Selecciona la respuesta correcta
          </p>
        </footer>
      </div>
    </div>
  );
};

export default QuickBurstQuizTemplate;
