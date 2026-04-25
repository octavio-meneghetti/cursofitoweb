import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const T22_DECISION_GRID = ({ data, onNext, onResult, isEditMode = false }) => {
  const {
    title = 'Misión: Toma una Decisión',
    instruction = 'Elige la opción que más resuene contigo ahora.',
    options = [
      { id: '1', label: 'Opción A', icon: '🌿' },
      { id: '2', label: 'Opción B', icon: '💧' },
      { id: '3', label: 'Opción C', icon: '🔥' },
      { id: '4', label: 'Opción D', icon: '🌙' }
    ],
    footerText = '',
    buttonText = 'REGISTRAR',
    accentColor = '#10b981',
    cardPadding = '1.5rem',
    iconSize = '2rem'
  } = data || {};

  const [selectedId, setSelectedId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSelect = (id) => {
    if (isEditMode) return;
    setSelectedId(id);
  };

  const handleSubmit = () => {
    if (!selectedId || isSubmitting) return;
    
    setIsSubmitting(true);
    
    // Simular guardado y avanzar
    setTimeout(() => {
      if (onResult) {
        onResult({ 
          success: true, 
          metadata: { 
            decision: selectedId,
            choiceLabel: options.find(o => o.id === selectedId)?.label 
          } 
        });
      }
      onNext();
    }, 600);
  };

  const styles = {
    container: {
      minHeight: '100%',
      backgroundColor: '#040d0a',
      color: '#ffffff',
      display: 'flex',
      flexDirection: 'column',
      padding: '2rem 1.5rem',
      fontFamily: "'Inter', sans-serif",
      position: 'relative',
      overflow: 'hidden'
    },
    backgroundGlow: {
      position: 'absolute',
      top: '20%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: '300px',
      height: '300px',
      background: `radial-gradient(circle, ${accentColor}33 0%, transparent 70%)`,
      filter: 'blur(40px)',
      zIndex: 0,
      pointerEvents: 'none'
    },
    header: {
      textAlign: 'center',
      marginBottom: '2rem',
      zIndex: 1
    },
    title: {
      fontSize: '0.75rem',
      fontWeight: '900',
      textTransform: 'uppercase',
      letterSpacing: '0.1em',
      color: accentColor,
      marginBottom: '0.5rem'
    },
    instruction: {
      fontSize: '1.25rem',
      fontWeight: '700',
      lineHeight: '1.4',
      color: '#e2e8f0'
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '1rem',
      flex: 1,
      zIndex: 1
    },
    card: (isSelected) => ({
      backgroundColor: isSelected ? `${accentColor}22` : 'rgba(255, 255, 255, 0.05)',
      border: `1px solid ${isSelected ? accentColor : 'rgba(255, 255, 255, 0.1)'}`,
      borderRadius: '1.5rem',
      padding: `${cardPadding} 1rem`,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.75rem',
      cursor: 'pointer',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      boxShadow: isSelected ? `0 0 20px ${accentColor}33` : 'none',
      position: 'relative'
    }),
    icon: {
      fontSize: iconSize,
      filter: 'drop-shadow(0 0 10px rgba(255,255,255,0.2))'
    },
    label: {
      fontSize: '0.875rem',
      fontWeight: '600',
      textAlign: 'center',
      lineHeight: '1.2'
    },
    footer: {
      marginTop: '2rem',
      textAlign: 'center',
      zIndex: 1
    },
    footerText: {
      fontSize: '0.875rem',
      color: 'rgba(255,255,255,0.6)',
      fontStyle: 'italic',
      marginBottom: '1.5rem',
      padding: '0 1rem'
    },
    button: {
      width: '100%',
      padding: '1.25rem',
      borderRadius: '1rem',
      backgroundColor: selectedId ? accentColor : 'rgba(255, 255, 255, 0.05)',
      color: selectedId ? '#000000' : 'rgba(255, 255, 255, 0.2)',
      border: 'none',
      fontWeight: '900',
      fontSize: '0.875rem',
      letterSpacing: '0.1em',
      cursor: selectedId ? 'pointer' : 'default',
      transition: 'all 0.3s ease'
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.backgroundGlow} />
      
      <div style={{ position: 'absolute', inset: 0, opacity: 0.1, pointerEvents: 'none', backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      <header style={styles.header}>
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          style={styles.title}
        >
          {title}
        </motion.div>
        <motion.h2 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={styles.instruction}
        >
          {instruction}
        </motion.h2>
      </header>

      <div style={styles.grid}>
        {options.map((option, idx) => (
          <motion.div
            key={option.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 + (idx * 0.05) }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleSelect(option.id)}
            style={styles.card(selectedId === option.id)}
          >
            <div style={styles.icon}>{option.icon}</div>
            <div style={styles.label}>{option.label}</div>
            
            {selectedId === option.id && (
              <motion.div 
                layoutId="activeGlow"
                style={{ position: 'absolute', inset: 0, borderRadius: '1.5rem', boxShadow: `inset 0 0 15px ${accentColor}44` }}
              />
            )}
          </motion.div>
        ))}
      </div>

      <footer style={styles.footer}>
        {footerText && (
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={styles.footerText}
          >
            {footerText}
          </motion.p>
        )}
        
        <motion.button
          whileHover={selectedId ? { scale: 1.02, boxShadow: `0 10px 20px ${accentColor}44` } : {}}
          whileTap={selectedId ? { scale: 0.98 } : {}}
          onClick={handleSubmit}
          disabled={!selectedId || isSubmitting}
          style={styles.button}
        >
          {isSubmitting ? 'GUARDANDO...' : buttonText}
        </motion.button>
      </footer>
    </div>
  );
};

export default T22_DECISION_GRID;
