import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';

const VideoPresentationTemplate = ({ data, onNext, isEditMode = false }) => {
  const {
    videoUrl = '',
    phrase = '', // Sin texto por defecto aquí para evitar que aparezca el recuadro si no hay data
    accentColor = '#10b981',
    textColor = '#ffffff',
    fontSize = '24',
    videoMaxWidth = '320',
    borderColor = '#10b981',
    autoContinue = false,
    verticalOffset = 0
  } = data;

  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    if (autoContinue) {
      setTimeout(onNext, 1000);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 relative overflow-hidden bg-[#060608]">
      {/* Fondo Atmosférico */}
      <div className="absolute inset-0 z-0">
        <div 
          className="absolute w-[500px] h-[500px] rounded-full blur-[150px] opacity-20 -top-20 -left-20 animate-pulse transition-colors duration-1000"
          style={{ backgroundColor: accentColor }}
        />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
      </div>

      {/* Contenedor del Video */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: verticalOffset }}
        transition={{ type: 'spring', damping: 20 }}
        className="relative z-10 w-full mb-8 flex justify-center"
      >
        <div 
          className="relative rounded-2xl overflow-hidden shadow-2xl transition-all duration-500"
          style={{ 
            maxWidth: `${videoMaxWidth}px`,
            border: `2px solid ${borderColor}`,
            boxShadow: `0 0 30px ${accentColor}33`
          }}
        >
          {videoUrl ? (
            <video 
              ref={videoRef}
              src={videoUrl}
              className="w-full h-auto block"
              onClick={togglePlay}
              onEnded={handleEnded}
              playsInline
            />
          ) : (
            <div className="aspect-[9/16] bg-black/40 flex items-center justify-center text-white/20 p-8 text-center text-xs italic">
              Sin video configurado. <br/> Sube un archivo MP4 o pega una URL.
            </div>
          )}

          {/* Overlay de Play (Solo si no está reproduciendo) */}
          {!isPlaying && videoUrl && (
            <div 
              className="absolute inset-0 flex items-center justify-center bg-black/20 cursor-pointer group"
              onClick={togglePlay}
            >
              <div 
                className="w-16 h-16 rounded-full flex items-center justify-center transition-all group-hover:scale-110 active:scale-95"
                style={{ backgroundColor: accentColor }}
              >
                <svg className="w-8 h-8 fill-white translate-x-0.5" viewBox="0 0 24 24">
                  <path d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" />
                </svg>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Caja de Frase / Subtítulo */}
      {phrase?.trim() && (
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-panel p-8 max-w-lg w-full text-center relative z-20 neon-border-green"
          style={{ borderColor: accentColor }}
        >
          <p 
            className="leading-relaxed font-medium transition-all duration-500"
            style={{ 
              fontSize: `${fontSize}px`,
              color: textColor
            }}
          >
            {phrase}
          </p>
        </motion.div>
      )}

      {/* Botón Siguiente (Si no es auto-continue) */}
      {!autoContinue && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-10 z-30"
        >
          <button 
            onClick={onNext}
            className="px-10 py-3 rounded-full border border-white/10 bg-white/5 text-[10px] font-black uppercase tracking-[0.3em] text-white/50 hover:text-white hover:bg-white/10 transition-all font-inter"
          >
            Continuar
          </button>
        </motion.div>
      )}
    </div>
  );
};

export default VideoPresentationTemplate;
