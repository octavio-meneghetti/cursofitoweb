import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { db } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

const MundoMapa = ({ onSelectZone }) => {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const docRef = doc(db, 'config', 'world_map');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setConfig(docSnap.data());
        } else {
          // Fallback robusto
          setConfig({
            imageUrl: '/world_map_final.png',
            zones: {
              herbolaria: { x: 28, y: 18 },
              alumno: { x: 74, y: 31 },
              mensajera: { x: 55, y: 55 },
              guardian: { x: 32, y: 80 },
              medicina: { x: 76, y: 88 }
            }
          });
        }
      } catch (err) {
        console.error("Error al cargar mapa:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchConfig();
  }, []);

  if (loading || !config) return (
    <div className="fixed inset-0 bg-black flex items-center justify-center">
      <div className="text-center">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
          className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full mx-auto mb-4"
        />
        <span className="text-emerald-500 font-black tracking-widest animate-pulse">CARGANDO ALDEA...</span>
      </div>
    </div>
  );

  const zones = [
    { id: 'herbolaria', title: 'Bosque', icon: '🌿', x: config.zones?.herbolaria?.x || 28, y: config.zones?.herbolaria?.y || 18, color: '#10b981' },
    { id: 'alumno', title: 'Santuario', icon: '🏠', x: config.zones?.alumno?.x || 74, y: config.zones?.alumno?.y || 31, color: '#ffffff' },
    { id: 'mensajera', title: 'Nexo', icon: '🧬', x: config.zones?.mensajera?.x || 55, y: config.zones?.mensajera?.y || 55, color: '#06b6d4' },
    { id: 'guardian', title: 'Huerta', icon: '🎋', x: config.zones?.guardian?.x || 32, y: config.zones?.guardian?.y || 80, color: '#059669' },
    { id: 'medicina', title: 'Clínica', icon: '🏥', x: config.zones?.medicina?.x || 76, y: config.zones?.medicina?.y || 88, color: '#f43f5e' }
  ];

  return (
    <div className="fixed inset-0 bg-[#060608] flex flex-col overflow-hidden font-sans">
      
      {/* HUD Superior */}
      <div className="fixed top-0 left-0 right-0 px-8 py-10 flex justify-between items-center z-[110] bg-gradient-to-b from-black/90 to-transparent pointer-events-none">
        <h1 className="text-xl font-black tracking-[0.2em] text-emerald-400 pointer-events-auto drop-shadow-2xl">
          MUNDO FITO <span className="text-[8px] opacity-20 align-top">v.3.1</span>
        </h1>
        <div className="px-4 py-1.5 bg-white/5 border border-white/10 backdrop-blur-md rounded-full pointer-events-auto">
          <span className="text-emerald-400 font-black text-[10px] tracking-widest">1,240 XP</span>
        </div>
      </div>

      {/* Contenedor del Mapa con Scroll */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide pt-20 pb-40">
        <div className="relative w-full" style={{ position: 'relative' }}>
          <img 
            src={config.imageUrl ? `${config.imageUrl}?v=${Date.now()}` : '/world_map_final.png'} 
            className="w-full h-auto block relative brightness-75 grayscale-[0.1] contrast-[1.1]"
            style={{ width: '100%', height: 'auto', display: 'block', position: 'relative', zIndex: 1 }}
            alt="World Map"
          />

          {zones.map((zone) => (
            <div
              key={zone.id}
              onClick={() => onSelectZone(zone.id)}
              className="absolute cursor-pointer pointer-events-auto"
              style={{ 
                position: 'absolute',
                zIndex: 60,
                top: `${zone.y}%`, 
                left: `${zone.x}%`,
                transform: 'translate(-50%, -50%)'
              }}
            >
              <div className="flex flex-col items-center relative">
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                  className="absolute -top-6 bottom-[-15px] -left-10 -right-10 opacity-60 mix-blend-screen pointer-events-none"
                  style={{
                    background: `conic-gradient(from 0deg, transparent, ${zone.color}, transparent, transparent)`,
                    borderRadius: '50%',
                    filter: 'blur(15px)'
                  }}
                />

                <div className="relative flex flex-col items-center z-10">
                  <div className="relative flex items-center justify-center mb-1">
                    <motion.div 
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ repeat: Infinity, duration: 3 }}
                      className="w-20 h-20 rounded-full bg-black border-[3px] flex items-center justify-center shadow-[0_0_40px_rgba(0,0,0,1)]"
                      style={{ borderColor: zone.color }}
                    >
                      <span className="text-5xl filter saturate-150 drop-shadow-2xl">{zone.icon}</span>
                    </motion.div>
                  </div>
                  <div className="bg-black border border-white/20 px-5 py-1.5 rounded-sm shadow-2xl">
                    <span className="text-[11px] font-black uppercase tracking-[0.2em] text-white whitespace-nowrap">
                      {zone.title}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navegación Inferior */}
      <div className="fixed bottom-10 left-0 right-0 flex justify-center px-8 z-[120] pointer-events-none">
        <div className="w-full max-w-sm py-4 bg-black/60 border border-white/10 flex justify-around shadow-[0_0_50px_rgba(0,0,0,0.8)] backdrop-blur-2xl pointer-events-auto rounded-3xl">
          <button className="text-emerald-400 text-4xl">🗺️</button>
          <button className="text-white/20 text-4xl">🏆</button>
          <button className="text-white/20 text-4xl" onClick={() => onSelectZone('alumno')}>🏠</button>
        </div>
      </div>
    </div>
  );
};

export default MundoMapa;
