import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const IntroVideoOverlay = ({ onVideoEnd, videoUrl: propVideoUrl }) => {
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [videoUrl, setVideoUrl] = useState(null);
  const videoRef = useRef(null);

  const STORAGE_URL = propVideoUrl || "https://firebasestorage.googleapis.com/v0/b/cursofitoweb.firebasestorage.app/o/Introcursoweb.mp4?alt=media&token=b0078a71-af2a-41d2-9336-caec5dd7eb05";

  useEffect(() => {
    const safetyTimeout = setTimeout(() => {
      if (!isReady) setIsReady(true);
    }, 10000);

    const fetchVideo = async () => {
      try {
        const response = await fetch(STORAGE_URL);
        if (!response.ok) throw new Error('CORS Error');
        const reader = response.body.getReader();
        const contentLength = +response.headers.get('Content-Length');
        let receivedLength = 0;
        let chunks = [];
        while(true) {
          const { done, value } = await reader.read();
          if (done) break;
          chunks.push(value);
          receivedLength += value.length;
          if (contentLength) setLoadingProgress(Math.round((receivedLength / contentLength) * 100));
        }
        const blob = new Blob(chunks, { type: 'video/mp4' });
        setVideoUrl(URL.createObjectURL(blob));
        setIsReady(true);
      } catch (err) {
        setVideoUrl(STORAGE_URL);
      }
    };

    fetchVideo();
    return () => clearTimeout(safetyTimeout);
  }, [isReady]);

  const handleStartVideo = () => {
    if (videoRef.current) {
      videoRef.current.play();
      setHasStarted(true);
    }
  };

  return (
    <div className="intro-container" style={{ backgroundColor: '#000' }}>
      {/* Video siempre en el DOM si hay URL, pero oculto hasta que empiece */}
      {videoUrl && (
        <video 
          ref={videoRef}
          src={videoUrl}
          className="intro-video-element"
          style={{ opacity: hasStarted ? 1 : 0, transition: 'opacity 1s' }}
          playsInline
          onEnded={onVideoEnd}
        />
      )}

      {/* Botón de Saltar (solo cuando el video ya corre) */}
      <AnimatePresence>
        {hasStarted && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 5 }}
            onClick={onVideoEnd}
            className="skip-button"
          >
            Saltar Intro
          </motion.button>
        )}
      </AnimatePresence>

      {/* Pantalla de Carga y Botón de Inicio */}
      <AnimatePresence>
        {!hasStarted && (
          <motion.div 
            exit={{ opacity: 0, scale: 1.1 }}
            transition={{ duration: 1 }}
            className="absolute inset-0 z-[1000] flex flex-col items-center justify-center bg-[#060608]"
          >
            {/* Logo Central */}
            <div className="relative w-32 h-32 mb-16">
              <motion.div 
                className="absolute inset-0 rounded-full border-t-2 border-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.4)]"
                style={{ borderTop: '2px solid #10b981' }}
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.span 
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-emerald-500 font-bold text-4xl italic tracking-tighter"
                >
                  FW
                </motion.span>
              </div>
            </div>

            {/* Progreso o Botón */}
            <div className="w-full max-w-xs text-center px-6">
              {!isReady ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-[10px] uppercase tracking-[0.4em] font-black text-emerald-500/40">Sincronizando</span>
                    <span className="text-xs font-black text-emerald-500">{loadingProgress}%</span>
                  </div>
                  <div className="h-[2px] w-full bg-emerald-900/20 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-emerald-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${loadingProgress}%` }}
                    />
                  </div>
                </div>
              ) : (
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.05, letterSpacing: '0.6em', backgroundColor: '#059669' }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleStartVideo}
                  className="px-20 py-10 bg-emerald-600 border-2 border-emerald-400 rounded-3xl text-white text-base font-black tracking-[0.4em] uppercase shadow-[0_0_70px_rgba(16,185,129,0.5)] cursor-pointer"
                  style={{ zIndex: 2000, position: 'relative', pointerEvents: 'auto' }}
                >
                  COMENZAR
                </motion.button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default IntroVideoOverlay;
