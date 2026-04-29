import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { db, auth } from '../lib/firebase';
import { collection, query, where, getDocs, doc, getDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import LibraryOverlay from './ui/LibraryOverlay';
import GardenOverlay from './ui/GardenOverlay';

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

const MundoMapa = ({ onSelectZone, onPracticeClick, onJournalClick, user, economy, economyConfig, onUpdateEconomy }) => {
  const [nav, setNav] = useState({
    level: LEVELS.WORLD,
    island: null,
    block: null,
    week: null,
    day: null,
    activeLesson: null
  });

  // Asegurar que al montar empezamos en el mapa global y no en una vista residual
  useEffect(() => {
    setNav({
        level: LEVELS.WORLD,
        island: null,
        block: null,
        week: null,
        day: null,
        activeLesson: null
    });
    console.log("DEBUG F12 - MundoMapa iniciado en MAPA GLOBAL");
  }, []);

  const [activeOverlay, setActiveOverlay] = useState(null);

  const [lessons, setLessons] = useState([]);
  const [progress, setProgress] = useState({ completedDays: [], unlockedBlocks: [1] });
  const [loading, setLoading] = useState(false);
  const [mapConfig, setMapConfig] = useState(null);
  const [mapTheme, setMapTheme] = useState(null);
  const [moduleMapConfig, setModuleMapConfig] = useState(null);

  // Cargar configuración del mapa y tema
  useEffect(() => {
    const fetchConfigs = async () => {
      try {
        const mapDoc = await getDoc(doc(db, 'config', 'world_map'));
        if (mapDoc.exists()) setMapConfig(mapDoc.data());

        const themeDoc = await getDoc(doc(db, 'config', 'map_theme'));
        if (themeDoc.exists()) setMapTheme(themeDoc.data());
      } catch (err) {
        console.warn("Error cargando configs:", err);
      }
    };
    fetchConfigs();
  }, []);

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
    setProgress({
      completedDays: [1, 2, 3], 
      unlockedBlocks: [1, 2, 3, 4, 5],
      medals: ['fito_basic', 'bio_init']
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

  const renderWorld = () => {
    const currentMapUrl = (mapConfig && mapConfig.imageUrl) ? mapConfig.imageUrl : 'https://firebasestorage.googleapis.com/v0/b/cursofitoweb.firebasestorage.app/o/maps%2Fworld_map_v1.png?alt=media&token=4cc38fe0-7087-4368-86f5-b19d255e5af6';
    const currentZones = (mapConfig && mapConfig.zones) ? mapConfig.zones : {
      herbolaria: { x: 28, y: 18 },
      alumno: { x: 74, y: 31 },
      mensajera: { x: 55, y: 55 },
      guardian: { x: 32, y: 80 },
      medicina: { x: 76, y: 88 }
    };

    return (
      <div className="map-wrapper text-center mx-auto">
          <motion.img 
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            src={currentMapUrl}
            className="map-background"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/40 pointer-events-none" />

          {Object.entries(currentZones).map(([zoneId, zoneConfig]) => {
            if (!zoneConfig.x || !zoneConfig.y) return null;

            const islandIdMap = {
              'herbolaria': 'fito',
              'mensajera': 'bio',
              'medicina': 'med',
              'guardian': 'auto',
              'alumno': 'san'
            };
            
            const islandId = islandIdMap[zoneId];
            const islandData = ISLANDS.find(isl => isl.id === islandId);
            
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
                style={{ left: `${zoneConfig.x}%`, top: `${zoneConfig.y}%` }}
              >
                <div onClick={handleClick} className="marker-content">
                  <div className="portal-ring" style={{ '--map-ring-color': markerColor }}>
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
                      <span style={{ fontSize: 'var(--map-marker-icon-size)' }}>{zoneConfig.icon || '📍'}</span>
                    )}
                  </motion.div>

                  <div className="marker-label">
                    <p className="text-[10px] font-black uppercase text-white tracking-widest">{zoneConfig.title || zoneId}</p>
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

    return (
      <div className="map-wrapper text-center mx-auto">
        <img src={moduleMapConfig.imageUrl} className="map-background block select-none" style={{ width: '100%', height: 'auto' }} />
        <div className="absolute inset-0 bg-black/10 pointer-events-none" />

        {Object.entries(moduleMapConfig.blocks).map(([num, block]) => {
          const blockNum = parseInt(num);
          const isUnlocked = nav.island.id === 'san' || progress.unlockedBlocks.includes(blockNum);
          const markerColor = block.color || nav.island.color;

          return (
            <motion.div
              key={num}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.05 }}
              className="map-marker"
              style={{ left: `${block.x}%`, top: `${block.y}%`, position: 'absolute' }}
            >
              <div 
                onClick={(e) => {
                  e.stopPropagation();
                  if (block.actionType === 'OPEN_LIBRARY') setActiveOverlay('LIBRARY');
                  else if (block.actionType === 'OPEN_KITCHEN') setActiveOverlay('KITCHEN');
                  else if (block.actionType === 'OPEN_GARDEN') setActiveOverlay('GARDEN');
                  else if (block.actionType === 'OPEN_BED') setActiveOverlay('BED');
                  else {
                    if (isUnlocked) setNav({ ...nav, level: LEVELS.WEEKS, block: blockNum });
                  }
                }}
                className={`marker-content ${!isUnlocked ? 'opacity-40 grayscale pointer-events-none' : ''}`}
              >
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
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: isUnlocked ? `0 0 20px ${markerColor}44` : 'none'
                  }}
                >
                  {!isUnlocked ? <span className="text-sm">🔒</span> : block.markerUrl ? (
                    <img src={block.markerUrl} className="object-contain p-1" style={{ width: block.markerIconSize ? `${block.markerIconSize}px` : '100%', height: block.markerIconSize ? `${block.markerIconSize}px` : '100%' }} />
                  ) : (
                    <span style={{ fontSize: block.markerIconSize ? `${block.markerIconSize}px` : 'calc(var(--map-marker-icon-size) * 0.8)' }}>{block.icon || '✨'}</span>
                  )}
                </motion.div>
                <div className="marker-label mt-2">
                  <p className="text-[9px] font-black uppercase text-white tracking-widest bg-black/80 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 shadow-xl whitespace-nowrap">
                    {block.name || `Bloque ${blockNum}`}
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
          <motion.button key={week} whileTap={{ scale: 0.98 }} onClick={() => setNav({ ...nav, level: LEVELS.DAYS, week })} className="w-full p-6 bg-gradient-to-r from-white/10 to-transparent border border-white/10 rounded-3xl flex justify-between items-center">
            <div className="text-left">
              <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Semana {week}</span>
              <h3 className="text-white font-medium">Campamento de Aprendizaje</h3>
            </div>
            <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-black font-bold">{week}</div>
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
            const isFirstDayOfBlock = index === 0 && (nav.week === 1 || (nav.week - 1) * 7 + 1 === day);
            const isUnlocked = isFirstDayOfBlock || progress.completedDays.includes(day - 1) || progress.completedDays.includes(day);
            return (
              <motion.div key={day} initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.1 }} onClick={() => isUnlocked && lesson && setNav({ ...nav, level: LEVELS.SCREENS, day, activeLesson: lesson })} className="relative flex flex-col items-center">
                {index < days.length - 1 && <div className={`absolute top-16 w-0.5 h-12 border-l border-dashed transition-colors ${isUnlocked ? 'border-emerald-500/40' : 'border-white/10'}`} />}
                <div className={`w-16 h-16 rounded-3xl border-2 flex items-center justify-center text-xl shadow-2xl transition-all relative ${isUnlocked ? (progress.completedDays.includes(day) ? 'bg-emerald-500 border-emerald-400 text-black' : 'bg-black border-emerald-500 text-white cursor-pointer') : 'bg-white/5 border-white/10 text-white/20 cursor-not-allowed'}`}>
                  {progress.completedDays.includes(day) ? '✓' : (lesson?.type === 'practice' ? '⚔️' : day)}
                  {!isUnlocked && <span className="absolute -top-1 -right-1 text-[10px]">🔒</span>}
                </div>
                <div className="mt-2 text-center max-w-[120px]">
                   <p className={`text-[10px] font-bold uppercase tracking-wider ${isUnlocked ? 'text-white' : 'text-white/20'}`}>{lesson?.title || `Día ${day}`}</p>
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
      <div className="flex-col items-center" style={{ padding: '6rem 1.5rem 10rem', width: '100%', maxWidth: '500px', margin: '0 auto', display: 'flex' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h2 style={{ color: 'white', fontWeight: '900', fontSize: '2rem', textTransform: 'uppercase', letterSpacing: '-0.02em', fontStyle: 'italic', margin: 0 }}>{lesson.title}</h2>
          <p style={{ color: '#10b981', fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', marginTop: '0.5rem', borderTop: '1px solid rgba(16,185,129,0.2)', borderBottom: '1px solid rgba(16,185,129,0.2)', padding: '0.5rem 1rem', display: 'inline-block' }}>MICRO-RUTA DIARIA</p>
        </div>
        
        <div style={{ width: '100%', position: 'relative', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ position: 'absolute', left: '24px', top: '32px', bottom: '32px', width: '1px', background: 'rgba(16,185,129,0.1)' }}></div>
          {lesson.screens?.map((screen, idx) => (
            <motion.div key={screen.id || idx} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }} className="screen-item">
              <div style={{ width: '2rem', height: '2rem', borderRadius: '50%', background: 'rgba(16,185,129,0.2)', color: '#10b981', border: '1px solid rgba(16,185,129,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: '900', zIndex: 1, flexShrink: 0 }}>{idx + 1}</div>
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <p style={{ color: 'rgba(16,185,129,0.5)', fontSize: '9px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>{screen.templateId?.split('_')[1] || 'PASO'}</p>
                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '11px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', margin: 0 }}>{screen.data?.text || screen.data?.pregunta || 'Fase Interactiva'}</p>
              </div>
            </motion.div>
          ))}
        </div>
        
        <motion.div style={{ position: 'fixed', bottom: '100px', left: 0, right: 0, padding: '1.5rem', zIndex: 250, display: 'flex', justifyContent: 'center' }}>
          <motion.button 
            whileHover={{ scale: 1.05 }} 
            whileTap={{ scale: 0.95 }} 
            onClick={() => {
              console.log("CLICK INGRESAR", nav.island.id, lesson);
              onSelectZone(nav.island.id, lesson);
            }} 
            className="btn-ingresar"
          >
            <span>INGRESAR</span><span style={{ fontSize: '1.25rem' }}>⚡</span>
          </motion.button>
        </motion.div>
      </div>
    );
  };

  return (
    <div className="world-container" style={dynamicStyles}>
      <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ background: nav.island ? `radial-gradient(circle at center, ${nav.island.color}22 0%, transparent 70%)` : 'none', transition: 'background 1s ease' }} />
      
      {/* NUEVO HUD SUPERIOR (ECONOMÍA) */}
      <div className="hud-container">
        <div className="hud-group">
          <div className="resource-card" style={{ gap: '12px', padding: '0.4rem 1rem' }}>
            <span style={{ fontSize: '9px', fontWeight: '900', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {user?.email || 'Estudiante'}
            </span>
            <div style={{ width: '1px', height: '10px', background: 'rgba(255,255,255,0.1)' }} />
            <button 
              onClick={() => auth.signOut()} 
              style={{ color: '#f87171', fontSize: '9px', fontWeight: '900', cursor: 'pointer', background: 'none', border: 'none', padding: 0, textTransform: 'uppercase' }}
            >
              SALIR
            </button>
          </div>
          
          {nav.level !== LEVELS.WORLD && (
            <button onClick={goBack} className="resource-card" style={{ padding: '0.4rem 0.8rem', cursor: 'pointer' }}>&larr;</button>
          )}

          <div className="resource-card">
            <div style={{ textAlign: 'left' }}>
              <h1 style={{ fontSize: '11px', fontWeight: '900', color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>
                {nav.level === LEVELS.WORLD ? 'Mapa Global' : nav.island?.title}
              </h1>
              <p style={{ fontSize: '8px', fontWeight: '700', color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', margin: 0 }}>
                {nav.level === LEVELS.WORLD ? 'Sector Herbolario' : `Nivel: ${nav.level}`}
              </p>
            </div>
          </div>
        </div>

        {/* RECURSOS */}
        <div className="hud-group">
          {/* ENERGÍA (ATP) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div className="resource-card">
              <div className="resource-icon" style={{ background: 'rgba(245, 158, 11, 0.2)' }}>🔋</div>
              <div>
                <div className="energy-slot-container">
                  {[...Array(economyConfig?.max_energy || 5)].map((_, i) => (
                    <div key={i} className={`energy-slot ${i < economy.energy.current ? 'active' : 'empty'}`} />
                  ))}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <p className="resource-label">ATP VITAL</p>
                  <p style={{ fontSize: '10px', fontWeight: '900', color: '#fbbf24', marginLeft: '8px' }}>
                    {economy.energy.current} / {economyConfig?.max_energy || 5}
                  </p>
                </div>
              </div>
            </div>
            
            {/* BOTÓN TRUCO (RECARGA) */}
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onUpdateEconomy({ energy: 5 });
                alert("¡Energía Maestra Restaurada! 🔋⚡");
              }}
              className="btn-cheat"
              title="Truco: Recargar ATP"
            >
              ⚡
            </button>
          </div>

          {/* AGUA */}
          <div className="resource-card">
            <div className="resource-icon" style={{ background: 'rgba(59, 130, 246, 0.2)' }}>💧</div>
            <div>
              <p style={{ fontSize: '14px', fontWeight: '900', color: 'white', margin: 0 }}>{economy.water || 0}</p>
              <p className="resource-label">GOTAS</p>
            </div>
          </div>

          {/* SOLES */}
          <div className="resource-card">
            <div className="resource-icon" style={{ background: 'rgba(234, 179, 8, 0.2)' }}>☀️</div>
            <div>
              <p style={{ fontSize: '14px', fontWeight: '900', color: 'white', margin: 0 }}>{economy.suns || 0}</p>
              <p className="resource-label">SOLES</p>
            </div>
          </div>
        </div>
      </div>

      <div className="map-viewport">
        <AnimatePresence mode="wait">
          <motion.div key={nav.level + (nav.island?.id || '') + (nav.block || '') + (nav.week || '') + (nav.day || '')} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.05 }} transition={{ duration: 0.3 }} className="w-full h-full relative flex justify-center">
            {nav.level === LEVELS.WORLD && renderWorld()}
            {nav.level === LEVELS.BLOCKS && renderBlocks()}
            {nav.level === LEVELS.WEEKS && renderWeeks()}
            {nav.level === LEVELS.DAYS && renderDays()}
            {nav.level === LEVELS.SCREENS && renderScreens()}
          </motion.div>
        </AnimatePresence>
      </div>

      {nav.level !== LEVELS.BLOCKS && (
        <div className="hud-bottom">
          <div className="menu-dock">
            <button onClick={() => setNav({ level: LEVELS.WORLD, island: null, block: null, week: null, day: null, activeLesson: null })} className="dock-item" style={{ color: nav.level === LEVELS.WORLD ? '#10b981' : 'rgba(255,255,255,0.2)' }}>🗺️</button>
            <button onClick={onPracticeClick} className="dock-item" style={{ position: 'relative' }}><span style={{ filter: 'grayscale(0.5)' }}>⚔️</span><div style={{ position: 'absolute', top: '10px', right: '10px', width: '8px', height: '8px', backgroundColor: '#ff4444', borderRadius: '50%', border: '2px solid #000' }} /></button>
            <button onClick={onJournalClick} className="dock-item" style={{ color: 'rgba(255,255,255,0.8)' }}>🎒</button>
            <button className="dock-item" style={{ opacity: 0.2 }}>🏠</button>
          </div>
        </div>
      )}
      <AnimatePresence>
        {activeOverlay === 'LIBRARY' && <LibraryOverlay isOpen={true} onClose={() => setActiveOverlay(null)} userMedals={progress.medals || []} />}
        
        <GardenOverlay 
          isOpen={activeOverlay === 'GARDEN'}
          onClose={() => setActiveOverlay(null)}
          user={user}
          economy={economy}
          onUpdateEconomy={onUpdateEconomy}
        />

        {(activeOverlay === 'KITCHEN' || activeOverlay === 'BED') && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center p-10 backdrop-blur-md bg-black/80">
            <div className="bg-white/5 border border-white/10 p-20 rounded-[3rem] text-center">
                <span className="text-6xl mb-6 block">{activeOverlay === 'KITCHEN' ? '🍳' : '🛌'}</span>
                <h2 className="text-2xl font-black text-white uppercase mb-2">Zona en Preparación</h2>
                <p className="text-white/40 uppercase tracking-widest text-xs mb-8">Estamos terminando de acomodar este rincón del Santuario</p>
                <button onClick={() => setActiveOverlay(null)} className="px-10 py-4 bg-white text-black font-black uppercase text-[10px] rounded-full">Volver a la Cabaña</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MundoMapa;
