import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const ScratchRevealTemplate = ({ data, onNext, onResult, isEditMode }) => {
  const { instruction, undertext, overlayColor, conceptId } = data;
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [percentCleared, setPercentCleared] = useState(0);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    
    ctx.fillStyle = overlayColor || '#1e293b'; // Default Fog
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, [overlayColor]);

  const calculateClearArea = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    
    let transparent = 0;
    for (let i = 3; i < pixels.length; i += 4) {
      if (pixels[i] < 128) transparent++;
    }
    
    const percentage = (transparent / (pixels.length / 4)) * 100;
    setPercentCleared(percentage);

    if (percentage > 50 && !success) {
      setSuccess(true);
      if (onResult && !isEditMode) {
        onResult({ success: true, conceptId, metadata: { scratched: true } });
      }
    }
  };

  const getCoordinates = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const startDrawing = (e) => {
    if (success) return;
    setIsDrawing(true);
    scratch(e);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    calculateClearArea();
  };

  const scratch = (e) => {
    if (!isDrawing || success) return;
    e.preventDefault(); // Prevent scrolling on mobile
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const { x, y } = getCoordinates(e);

    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, 30, 0, Math.PI * 2, false);
    ctx.fill();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 relative bg-dark">
      <div className="w-full max-w-sm">
        <h2 className="text-xl font-bold mb-6 text-center text-white">{instruction}</h2>

        <div className="relative aspect-square rounded-2xl overflow-hidden glass-panel border border-white/10 shadow-2xl">
          {/* Under layer (The truth) */}
          <div className="absolute inset-0 flex items-center justify-center p-8 bg-black/80">
            <p className="text-center text-lg font-bold text-emerald-400">
              {undertext}
            </p>
          </div>

          {/* Scratch Canvas */}
          <canvas
            ref={canvasRef}
            className={`absolute inset-0 w-full h-full touch-none cursor-crosshair transition-opacity duration-1000 ${success ? 'opacity-0' : 'opacity-100'}`}
            onMouseDown={startDrawing}
            onMouseUp={stopDrawing}
            onMouseOut={stopDrawing}
            onMouseMove={scratch}
            onTouchStart={startDrawing}
            onTouchEnd={stopDrawing}
            onTouchCancel={stopDrawing}
            onTouchMove={scratch}
          />
        </div>

        {/* Progress Bar */}
        {!success && (
          <div className="mt-6 h-2 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-slate-500 transition-all duration-300" style={{ width: `${percentCleared * 2}%` }} />
          </div>
        )}

        {success && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-8">
            <button 
              onClick={onNext}
              className="w-full py-4 bg-emerald-500 text-black font-black uppercase tracking-widest rounded-xl hover:bg-emerald-400"
            >
              CONTINUAR
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ScratchRevealTemplate;
