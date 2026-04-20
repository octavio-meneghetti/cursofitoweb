import React from 'react';
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { useNavigate } from 'react-router-dom';
import bitmapSvg from '../../assets/experimental/bitmap1.svg';

const VectorMapTest = () => {
  const navigate = useNavigate();

  return (
    <div className="fixed inset-0 bg-[#000] text-white overflow-hidden font-sans">
      {/* Botón Flotante para Volver */}
      <button 
        onClick={() => navigate('/')} 
        className="fixed top-6 left-6 z-[100] px-4 py-2 bg-black/40 backdrop-blur-md border border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500 hover:text-black transition-all shadow-2xl"
      >
        ← Volver
      </button>

      {/* Visor de Mapa a Pantalla Completa */}
      <TransformWrapper
        initialScale={1}
        minScale={0.1}
        maxScale={100}
        centerOnInit={true}
        limitToBounds={false}
        wheel={{
          smoothStep: 0.0005,
        }}
        doubleClick={{
          disabled: true,
        }}
      >
        {({ zoomIn, zoomOut, resetTransform, ...rest }) => (
          <>
            {/* Controles Flotantes Minimistas */}
            <div className="fixed bottom-8 right-8 z-[100] flex flex-col gap-2">
              <button onClick={() => zoomIn()} className="w-12 h-12 bg-black/60 backdrop-blur-md border border-white/10 rounded-xl text-xl font-bold flex items-center justify-center transition-all active:scale-90">+</button>
              <button onClick={() => zoomOut()} className="w-12 h-12 bg-black/60 backdrop-blur-md border border-white/10 rounded-xl text-xl font-bold flex items-center justify-center transition-all active:scale-90">-</button>
              <button onClick={() => resetTransform()} className="w-12 h-12 bg-black/60 backdrop-blur-md border border-white/10 rounded-xl text-[8px] font-black uppercase flex items-center justify-center transition-all active:scale-90 text-emerald-500">Reset</button>
            </div>

            <TransformComponent
              wrapperStyle={{
                width: "100vw",
                height: "100vh",
                overflow: "hidden"
              }}
            >
              <div className="flex items-center justify-center min-w-[100vw] min-h-[100vh]">
                  <img 
                      src={bitmapSvg} 
                      alt="Vector Map" 
                      className="w-full h-auto select-none pointer-events-none"
                      style={{ maxWidth: 'none' }}
                  />
              </div>
            </TransformComponent>
          </>
        )}
      </TransformWrapper>

      {/* Etiqueta flotante muy discreta */}
      <div className="fixed top-6 right-6 z-[100] flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full backdrop-blur-sm pointer-events-none">
        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        <span className="text-[8px] font-black uppercase tracking-[0.2em] text-emerald-500">Modo Vectorial Full</span>
      </div>
    </div>
  );
};

export default VectorMapTest;
