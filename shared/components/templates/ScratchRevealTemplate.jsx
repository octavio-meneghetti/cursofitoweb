import React, { useState, useRef, useEffect } from 'react';

const ScratchRevealTemplate = ({ data, onNext, onResult, isEditMode, onChange }) => {
  const { imageUrl, overlayColor = '#1a1c1e', instruction, revealThreshold = 0.5, conceptId } = data;
  const canvasRef = useRef(null);
  const [isDone, setIsDone] = useState(false);

  const handleChange = (field, value) => {
    if (onChange) onChange(field, value);
  };

  useEffect(() => {
    if (isEditMode) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    // Fill with overlay color
    ctx.fillStyle = overlayColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Add some noise/texture to make it look like a scratch card
    ctx.globalAlpha = 0.1;
    for(let i=0; i<1000; i++) {
        ctx.fillStyle = Math.random() > 0.5 ? '#fff' : '#000';
        ctx.fillRect(Math.random()*canvas.width, Math.random()*canvas.height, 2, 2);
    }
    ctx.globalAlpha = 1.0;
  }, [overlayColor, isEditMode]);

  const handleScratch = (e) => {
    if (isDone || isEditMode) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    
    const x = (e.clientX || e.touches[0].clientX) - rect.left;
    const y = (e.clientY || e.touches[0].clientY) - rect.top;

    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, 30, 0, Math.PI * 2);
    ctx.fill();

    checkReveal();
  };

  const checkReveal = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;
    let transparentPixels = 0;

    for (let i = 0; i < pixels.length; i += 4) {
      if (pixels[i + 3] < 128) transparentPixels++;
    }

    const percent = transparentPixels / (pixels.length / 4);
    if (percent > revealThreshold && !isDone) {
      setIsDone(true);
      if (onResult) {
        onResult({
          success: true,
          conceptId: conceptId,
          metadata: { revealPercent: percent }
        });
      }
    }
  };

  if (isEditMode) {
    return (
      <div className="space-y-6 text-main">
        <label className="block">
          <span className="text-dim text-[10px] uppercase font-bold mb-2 block">Instrucción</span>
          <input 
            type="text" 
            value={instruction || ''} 
            onChange={(e) => handleChange('instruction', e.target.value)}
            className="w-full bg-white/5 border border-white/10 p-3 rounded-lg text-main"
            placeholder="Ej: Raspa para revelar la planta oculta..."
          />
        </label>

        <label className="block">
          <span className="text-dim text-[10px] uppercase font-bold mb-2 block">Imagen a Revelar (Fondo)</span>
          <input 
            type="text" 
            value={imageUrl || ''} 
            onChange={(e) => handleChange('imageUrl', e.target.value)}
            className="w-full bg-white/5 border border-white/10 p-3 rounded-lg text-main text-xs font-mono"
          />
        </label>

        <div className="grid grid-cols-2 gap-4">
          <label className="block">
            <span className="text-dim text-[10px] uppercase font-bold mb-2 block">Color de la Capa (Overlay)</span>
            <input 
              type="text" 
              value={overlayColor || '#1a1c1e'} 
              onChange={(e) => handleChange('overlayColor', e.target.value)}
              className="w-full bg-white/5 border border-white/10 p-3 rounded-lg text-main"
            />
          </label>
          <label className="block">
            <span className="text-dim text-[10px] uppercase font-bold mb-2 block">Umbral de Revelación ({Math.round((revealThreshold || 0.5) * 100)}%)</span>
            <input 
              type="range" min="0.1" max="0.9" step="0.1"
              value={revealThreshold || 0.5} 
              onChange={(e) => handleChange('revealThreshold', parseFloat(e.target.value))}
              className="w-full accent-emerald-500"
            />
          </label>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-dark">
      <div className="w-full max-w-sm">
        <h2 className="text-2xl font-bold mb-8 text-center text-emerald-400">{instruction}</h2>

        <div className="relative aspect-square rounded-3xl overflow-hidden border-8 border-white/10 shadow-2xl cursor-crosshair">
          <img src={imageUrl} alt="Secret" className="absolute inset-0 w-full h-full object-cover" />
          
          <canvas
            ref={canvasRef}
            width={400}
            height={400}
            onMouseMove={handleScratch}
            onTouchMove={handleScratch}
            className="absolute inset-0 w-full h-full z-10"
          />

          {isDone && (
            <div className="absolute inset-0 z-20 bg-emerald-500/20 flex flex-col items-center justify-center animate-pulse pointer-events-none">
              <span className="text-white font-black text-3xl drop-shadow-lg uppercase tracking-tighter">✨ ¡REVELADO! ✨</span>
            </div>
          )}
        </div>

        <div className="mt-12 text-center">
            {isDone ? (
                <button 
                  onClick={onNext}
                  className="px-12 py-4 bg-emerald-600 text-white font-black rounded-xl hover:bg-emerald-500 shadow-xl uppercase tracking-widest transition-all scale-110"
                >
                  Continuar
                </button>
            ) : (
                <p className="text-dim text-sm italic animate-pulse">Sigue raspando para ver el secreto...</p>
            )}
        </div>
      </div>
    </div>
  );
};

export default ScratchRevealTemplate;
