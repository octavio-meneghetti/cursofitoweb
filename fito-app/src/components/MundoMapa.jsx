import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";

const LEVELS = {
  WORLD: 'world',
  BLOCKS: 'blocks',
  WEEKS: 'weeks',
  DAYS: 'days',
  SCREENS: 'screens'
};

const ISLANDS = [
  { id: 'fito', title: 'Fitoterapia', icon: '🌿', color: '#10b981', gradient: 'from-emerald-900/40 to-emerald-950/80', description: 'El arte de las plantas' },
  { id: 'bio', title: 'Bioquímica', icon: '🧬', color: '#06b6d4', gradient: 'from-cyan-900/40 to-cyan-950/80', description: 'La ciencia invisible' },
  { id: 'med', title: 'Medicina', icon: '🏥', color: '#f43f5e', gradient: 'from-rose-900/40 to-rose-950/80', description: 'El mapa del cuerpo' },
  { id: 'auto', title: 'Sustentabilidad', icon: '🌍', color: '#84cc16', gradient: 'from-lime-900/40 to-lime-950/80', description: 'La alianza con la tierra' },
  { id: 'san', title: 'Santuario', icon: '⛩️', color: '#a855f7', gradient: 'from-purple-900/40 to-purple-950/80', description: 'El refugio del alma' }
];

const MundoMapa = ({ onSelectZone, onPracticeClick }) => {
  const [nav, setNav] = useState({
// ... (omitted)
    activeLesson: null
  });

  const [lessons, setLessons] = useState([]);
  const [progress, setProgress] = useState({ completedDays: [], unlockedBlocks: [1] });
  const [loading, setLoading] = useState(false);
  const [mapConfig, setMapConfig] = useState(null);
  const [mapTheme, setMapTheme] = useState(null);
  const [moduleMapConfig, setModuleMapConfig] = useState(null);

  // Cargar configuración del mapa y tema (Firestore)
  useEffect(() => {
    const fetchConfigs = async () => {
      try {
        // Cargar coordenadas y zonas
        const mapDoc = await getDoc(doc(db, 'config', 'world_map'));
        if (mapDoc.exists()) setMapConfig(mapDoc.data());

        // Cargar tema visual (colores, tamaños, etc)
        const themeDoc = await getDoc(doc(db, 'config', 'map_theme'));
        if (themeDoc.exists()) setMapTheme(themeDoc.data());
      } catch (err) {
        console.warn("Error cargando config de mapa:", err);
      }
    };
    fetchConfigs();
  }, []);

  // Preparar variables CSS dinámicas basadas en el tema
  const dynamicStyles = mapTheme ? {
    '--map-ring-color': mapTheme.ringColor,
    '--map-ring-glow': mapTheme.ringGlow,
    '--map-ring-size': `${mapTheme.ringSize}px`,
    '--map-ring-speed': `${mapTheme.ringSpeed}s`,
    '--map-ring-blur': `${mapTheme.ringBlur}px`,
    '--map-marker-size': `${mapTheme.markerSize}px`,
    '--map-marker-icon-size': `${mapTheme.markerIconSize}px`,
    '--map-label-font-size': `${mapTheme.labelFontSize}px`,
    '--map-marker-bg': mapTheme.markerBgColor,
  } : {};

  // Cargar lecciones, progreso y mapa de módulo cuando entramos a una isla
  useEffect(() => {
    if (nav.island) {
      loadLessons(nav.island.id);
      loadProgress(nav.island.id);
      loadModuleMap(nav.island.id);
    } else {
      setModuleMapConfig(null);
    }
  }, [nav.island]);

  const loadModuleMap = async (courseId) => {
    try {
      const docRef = doc(db, 'config', `module_map_${courseId}`);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        setModuleMapConfig(snap.data());
      } else {
        // Si no existe, seteamos una estructura base para evitar el cargando infinito
        setModuleMapConfig({
          imageUrl: 'https://placehold.co/1000x1777/0a0a0f/10b981?text=Mapa+en+Preparacion',
          blocks: {}
        });
      }
    } catch (err) {
      console.warn("Error cargando mapa de módulo:", err);
      setModuleMapConfig({
        imageUrl: 'https://placehold.co/1000x1777/0a0a0f/10b981?text=Error+de+Conexion',
        blocks: {}
      });
    }
  };

  const loadProgress = async (courseId) => {
    // Aquí cargaríamos el progreso real de Firestore.
    // Por ahora simularemos progreso basado en lecciones locales para demostración.
    // En una fase posterior, esto vendría de users/{uid}/progress/{courseId}
    setProgress({
      completedDays: [1, 2, 3], // Simulación: días 1, 2 y 3 completados
      unlockedBlocks: [1, 2]     // Simulación: bloques 1 y 2 desbloqueados
    });
  };

  const loadLessons = async (courseId) => {
    setLoading(true);
    try {
      const q = query(collection(db, 'lessons'), where('courseId', '==', courseId));
      const snap = await getDocs(q);
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setLessons(data);
    } catch (err) {
      console.error("Error cargando lecciones:", err);
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    if (nav.level === LEVELS.SCREENS) setNav(prev => ({ ...prev, level: LEVELS.DAYS }));
    else if (nav.level === LEVELS.DAYS) setNav(prev => ({ ...prev, level: LEVELS.WEEKS }));
    else if (nav.level === LEVELS.WEEKS) setNav(prev => ({ ...prev, level: LEVELS.BLOCKS }));
    else if (nav.level === LEVELS.BLOCKS) setNav(prev => ({ ...prev, level: LEVELS.WORLD, island: null }));
  };

  // VISTAS DE RENDERIZADO

  const renderWorld = () => {
    // Si no hay configuración o imagen, forzamos un fallback para que no se quede cargando infinito
    const currentMapUrl = (mapConfig && mapConfig.imageUrl) ? mapConfig.imageUrl : '/world_map_v.png';
    const currentZones = (mapConfig && mapConfig.zones) ? mapConfig.zones : {
      herbolaria: { x: 28, y: 18 },
      alumno: { x: 74, y: 31 },
      mensajera: { x: 55, y: 55 },
      guardian: { x: 32, y: 80 },
      medicina: { x: 76, y: 88 }
    };

    console.log("DEBUG F12 - MAPA GLOBAL:", { url: currentMapUrl, zones: currentZones });

    return (
      <div className="map-wrapper text-center mx-auto">
          {/* Fondo del Mapa */}
          <motion.img 
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            src={currentMapUrl}
            className="map-background"
          />

          {/* Overlay de Interacción - Niebla/Brillo opcional */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/40 pointer-events-none" />

          {/* Renderizado Dinámico de Zonas desde BD */}
          {Object.entries(currentZones).map(([zoneId, zoneConfig]) => {
            if (!zoneConfig.x || !zoneConfig.y) return null;

            // Mapeo de comportamiento para islas
            const islandIdMap = {
              'herbolaria': 'fito',
              'mensajera': 'bio',
              'medicina': 'med',
              'guardian': 'auto',
              'alumno': 'san'
            };
            
            const islandId = islandIdMap[zoneId];
            const islandData = ISLANDS.find(isl => isl.id === islandId);
            
            // Determinar acción al hacer clic
            let handleClick = null;
            let markerColor = islandData?.color || "#ffffff";
            
            if (islandData) {
              handleClick = () => setNav({ ...nav, level: LEVELS.BLOCKS, island: islandData });
            } else if (zoneId === 'practicas') {
              handleClick = onPracticeClick;
              markerColor = "#ff4444";
            }

            return (
              <motion.div
                key={zoneId}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + Math.random() * 0.4 }}
                className="map-marker"
                style={{ 
                  left: `${zoneConfig.x}%`, 
                  top: `${zoneConfig.y}%` 
                }}
              >
                <div 
                  onClick={handleClick}
                  className="marker-content"
                >
                  <div className="portal-ring">
                    <div className="portal-ring-outer" />
                    <div className="portal-ring-core" />
                  </div>

                  <motion.div 
                    whileHover={{ scale: 1.25 }}
                    whileTap={{ scale: 0.9 }}
                    className="marker-icon-box"
                    style={{ 
                      borderColor: markerColor + "55",
                      background: 'var(--map-marker-bg)',
                      borderRadius: '50%',
                      borderWidth: '2px',
                      width: 'var(--map-marker-size)',
                      height: 'var(--map-marker-size)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    {zoneConfig.markerUrl ? (
                      <img src={zoneConfig.markerUrl} className="w-full h-full object-contain" />
                    ) : (
                      <span style={{ fontSize: 'var(--map-marker-icon-size)' }}>
                        {zoneConfig.icon || '📍'}
                      </span>
                    )}
                  </motion.div>

                  <div className="marker-label">
                    <p className="text-[10px] font-black uppercase text-white tracking-widest">
                      {zoneConfig.title || zoneId}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
    );
  };

  const renderBlocks = () => {
    if (!moduleMapConfig) {
      return (
        <div className="p-6 mt-20 text-center">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full mx-auto animate-spin mb-4" />
          <p className="text-white/40 uppercase tracking-widest text-xs">Sincronizando el mapa del sector...</p>
        </div>
      );
    }

    console.log("DEBUG F12 - MAPA MODULO:", { url: moduleMapConfig.imageUrl, blocksCount: Object.keys(moduleMapConfig.blocks).length });

    return (
      <div className="map-wrapper text-center mx-auto">
        {/* Fondo del Mapa */}
        <img 
          src={moduleMapConfig.imageUrl}
          className="map-background block select-none"
          style={{ width: '100%', height: 'auto' }}
        />

        {/* Overlay de gradiente suave */}
        <div className="absolute inset-0 bg-black/10 pointer-events-none" />

        {/* Renderizado de los 10 Bloques (Sincronizados con el mapa) */}
        {Object.entries(moduleMapConfig.blocks).map(([num, block]) => {
          const blockNum = parseInt(num);
          const isUnlocked = progress.unlockedBlocks.includes(blockNum);
          const markerColor = block.color || nav.island.color;

          return (
            <motion.div
              key={num}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 * blockNum }}
              className="map-marker"
              style={{ 
                left: `${block.x}%`, 
                top: `${block.y}%`,
                position: 'absolute'
              }}
            >
              <div 
                onClick={(e) => {
                  e.stopPropagation();
                  if (isUnlocked) setNav({ ...nav, level: LEVELS.WEEKS, block: blockNum });
                }}
                className={`marker-content ${!isUnlocked ? 'opacity-40 grayscale pointer-events-none' : ''}`}
              >
                {/* EFECTO: PORTAL vs FLOATING */}
                {block.effectType === 'portal' && (
                  <div className="portal-ring" style={{ '--map-ring-color': markerColor }}>
                    <div className="portal-ring-outer" />
                    <div className="portal-ring-core" />
                  </div>
                )}

                <motion.div 
                  whileTap={isUnlocked ? { scale: 0.9 } : {}}
                  animate={block.effectType === 'floating' ? { y: [0, -12, 0] } : {}}
                  transition={block.effectType === 'floating' ? { duration: 2.5, repeat: Infinity, ease: "easeInOut" } : {}}
                  className="marker-icon-box"
                  style={{ 
                    borderColor: markerColor + "55",
                    background: block.markerBgColor || (mapTheme && mapTheme.markerBgColor) || 'rgba(0,0,0,0.85)',
                    borderRadius: '50%',
                    borderWidth: '2px',
                    width: block.markerSize ? `${block.markerSize}px` : 'calc(var(--map-marker-size) * 0.8)',
                    height: block.markerSize ? `${block.markerSize}px` : 'calc(var(--map-marker-size) * 0.8)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: isUnlocked ? `0 0 20px ${markerColor}44` : 'none'
                  }}
                >
                  {!isUnlocked ? (
                     <span className="text-sm">🔒</span>
                  ) : block.markerUrl ? (
                    <img 
                      src={block.markerUrl} 
                      className="object-contain p-1" 
                      style={{ 
                        width: block.markerIconSize ? `${block.markerIconSize}px` : '100%',
                        height: block.markerIconSize ? `${block.markerIconSize}px` : '100%'
                      }}
                    />
                  ) : (
                    <span style={{ fontSize: block.markerIconSize ? `${block.markerIconSize}px` : 'calc(var(--map-marker-icon-size) * 0.8)' }}>
                      {block.icon || '✨'}
                    </span>
                  )}
                </motion.div>

                <div className="marker-label">
                  <p className="text-[8px] font-black uppercase text-white tracking-widest bg-black/60 px-2 py-0.5 rounded border border-white/10">
                    Bloque {blockNum}
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    );
  };

  const renderWeeks = () => (
    <div className="p-6 mt-20">
      <div className="mb-8">
        <h2 className="text-white font-bold">Bloque {nav.block}</h2>
        <p className="text-white/40 text-xs uppercase tracking-widest">Navegando Semanas</p>
      </div>
      <div className="space-y-4">
        {[1, 2, 3, 4, 5, 6].map(week => (
          <motion.button
            key={week}
            whileTap={{ scale: 0.98 }}
            onClick={() => setNav({ ...nav, level: LEVELS.DAYS, week })}
            className="w-full p-6 bg-gradient-to-r from-white/10 to-transparent border border-white/10 rounded-3xl flex justify-between items-center"
          >
            <div className="text-left">
              <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Semana {week}</span>
              <h3 className="text-white font-medium">Campamento de Aprendizaje</h3>
            </div>
            <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-black font-bold">
              {week}
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );

  const renderDays = () => {
    const days = nav.week === 6 ? [36, 37, 38, 39, 40] : Array.from({ length: 7 }, (_, i) => (nav.week - 1) * 7 + i + 1);
    
    return (
      <div className="p-6 mt-20 pb-32">
        <div className="mb-8 text-center">
          <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest px-4 py-1 bg-emerald-400/10 rounded-full">Semana {nav.week}</span>
          <h2 className="text-white text-2xl font-serif mt-2">La Ruta del Saber</h2>
        </div>
        
        <div className="flex flex-col items-center space-y-8">
          {days.map((day, index) => {
            const lesson = lessons.find(l => parseInt(l.blockNumber) === nav.block && parseInt(l.dayNumber) === day);
            
            // Lógica de desbloqueo: El día 1 siempre está abierto si el bloque está abierto.
            // Los siguientes requieren que el día anterior esté en completedDays.
            const isFirstDayOfBlock = index === 0 && (nav.week === 1 || (nav.week - 1) * 7 + 1 === day);
            const isPreviousCompleted = progress.completedDays.includes(day - 1);
            const isUnlocked = isFirstDayOfBlock || isPreviousCompleted || progress.completedDays.includes(day);
            
            return (
              <motion.div
                key={day}
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => isUnlocked && lesson && setNav({ ...nav, level: LEVELS.SCREENS, day, activeLesson: lesson })}
                className="relative flex flex-col items-center"
              >
                {index < days.length - 1 && (
                   <div className={`absolute top-16 w-0.5 h-12 border-l border-dashed transition-colors ${isUnlocked ? 'border-emerald-500/40' : 'border-white/10'}`} />
                )}
                
                <div className={`w-16 h-16 rounded-3xl border-2 flex items-center justify-center text-xl shadow-2xl transition-all relative ${isUnlocked ? (progress.completedDays.includes(day) ? 'bg-emerald-500 border-emerald-400 text-black' : 'bg-black border-emerald-500 text-white cursor-pointer') : 'bg-white/5 border-white/10 text-white/20 cursor-not-allowed'}`}>
                  {progress.completedDays.includes(day) ? '✓' : (lesson?.type === 'practice' ? '⚔️' : day)}
                  {!isUnlocked && <span className="absolute -top-1 -right-1 text-[10px]">🔒</span>}
                </div>
                
                <div className="mt-2 text-center max-w-[120px]">
                   <p className={`text-[10px] font-bold uppercase tracking-wider ${isUnlocked ? 'text-white' : 'text-white/20'}`}>
                    {lesson?.title || `Día ${day}`}
                   </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderScreens = () => {
    const lesson = nav.activeLesson;
    if (!lesson) return null;
    
    return (
      <div className="p-6 mt-20 flex flex-col items-center pb-40">
        <div className="text-center mb-10">
          <h2 className="text-white font-black text-3xl uppercase tracking-tighter italic">{lesson.title}</h2>
          <p className="text-emerald-400 text-xs font-bold uppercase mt-2 border-y border-emerald-400/20 py-2 inline-block px-4">
            MICRO-RUTA DIARIA
          </p>
        </div>

        <div className="space-y-4 w-full max-w-xs relative">
          <div className="absolute left-6 top-8 bottom-8 w-[1px] bg-emerald-500/10 z-0"></div>
          {lesson.screens?.map((screen, idx) => (
            <motion.div
              key={screen.id || idx}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="flex items-center gap-4 bg-white/[0.02] backdrop-blur-sm border border-white/5 p-4 rounded-2xl z-10"
            >
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center text-[10px] font-black font-mono">
                {idx + 1}
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-emerald-400/50 text-[9px] font-black uppercase tracking-widest">{screen.templateId?.split('_')[1] || 'PASO'}</p>
                <p className="text-white/70 text-[10px] truncate leading-tight">{screen.data?.text || screen.data?.pregunta || 'Fase Interactiva'}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div className="fixed bottom-24 left-0 right-0 p-6 z-[130]">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelectZone(nav.island.id, lesson)}
            className="w-full max-w-sm mx-auto flex py-5 bg-emerald-500 text-black font-black uppercase tracking-[0.3em] rounded-2xl shadow-[0_0_50px_rgba(16,185,129,0.4)] text-sm items-center justify-center gap-3"
          >
            <span>INGRESAR</span>
            <span className="text-xl">⚡</span>
          </motion.button>
        </motion.div>
      </div>
    );
  };

  return (
    <div className="world-container" style={dynamicStyles}>
      {/* Background Ambience */}
      <div 
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{ 
          background: nav.island ? `radial-gradient(circle at center, ${nav.island.color}22 0%, transparent 70%)` : 'none',
          transition: 'background 1s ease'
        }}
      />
      
      {/* HUD Superior - Se oculta en el mapa de bloques para máxima inmersión */}
      {nav.level !== LEVELS.BLOCKS && (
        <div className="hud-top">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button 
              onClick={() => auth.signOut()}
              className="glass-panel"
              style={{ padding: '0.5rem 1rem', fontSize: '10px', color: '#ff4444', border: '1px solid rgba(255,0,0,0.2)' }}
            >
              SALIR
            </button>
            {nav.level !== LEVELS.WORLD && (
              <button 
                onClick={goBack} 
                className="glass-panel text-white flex items-center justify-center"
                style={{ width: '40px', height: '40px' }}
              >
                &larr;
              </button>
            )}
            <div>
              <h1 style={{ fontSize: '12px', fontWeight: '900', letterSpacing: '0.2em', color: '#10b981', textTransform: 'uppercase' }}>
                {nav.level === LEVELS.WORLD ? 'MAPA GLOBAL' : nav.island?.title}
              </h1>
              {nav.level !== LEVELS.WORLD && (
                <p style={{ fontSize: '8px', fontWeight: '700', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  {nav.level === LEVELS.BLOCKS && 'Regiones de Poder'}
                  {nav.level === LEVELS.WEEKS && `Bloque ${nav.block}`}
                  {nav.level === LEVELS.DAYS && `Semana ${nav.week}`}
                  {nav.level === LEVELS.SCREENS && `Día ${nav.day}`}
                </p>
              )}
            </div>
          </div>
          <div className="xp-badge">
            <span className="xp-text">1,250 XP</span>
            <div style={{ width: '6px', height: '6px', backgroundColor: '#10b981', borderRadius: '50%' }} />
          </div>
        </div>
      )}

      {/* Main Content Viewport */}
      <div className="map-viewport">
        <AnimatePresence mode="wait">
          <motion.div
            key={nav.level + (nav.island?.id || '') + (nav.block || '') + (nav.week || '') + (nav.day || '')}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.3 }}
            className="w-full h-full relative flex justify-center"
          >
            {nav.level === LEVELS.WORLD && renderWorld()}
            {nav.level === LEVELS.BLOCKS && renderBlocks()}
            {nav.level === LEVELS.WEEKS && renderWeeks()}
            {nav.level === LEVELS.DAYS && renderDays()}
            {nav.level === LEVELS.SCREENS && renderScreens()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Menú Inferior (Dock) - Se oculta en mapa de bloques */}
      {nav.level !== LEVELS.BLOCKS && (
        <div className="hud-bottom">
          <div className="menu-dock">
            <button 
              onClick={() => setNav({ level: LEVELS.WORLD, island: null, block: null, week: null, day: null, activeLesson: null })} 
              className="dock-item"
              style={{ color: nav.level === LEVELS.WORLD ? '#10b981' : 'rgba(255,255,255,0.2)' }}
            >
              🗺️
            </button>
            
            <button onClick={onPracticeClick} className="dock-item" style={{ position: 'relative' }}>
              <span style={{ filter: 'grayscale(0.5)' }}>⚔️</span>
              <div style={{ position: 'absolute', top: '10px', right: '10px', width: '8px', height: '8px', backgroundColor: '#ff4444', borderRadius: '50%', border: '2px solid #000' }} />
            </button>

            <button className="dock-item" style={{ opacity: 0.2 }}>🏆</button>
            <button className="dock-item" style={{ opacity: 0.2 }}>🏠</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MundoMapa;
