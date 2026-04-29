import React, { useState, useEffect } from 'react';
import { db, storage } from '../../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * ModuleMapSettings (Admin): Editor de Mapas de Islas y Santuario.
 * Layout ultra-optimizado para evitar que el mapa desplace los controles.
 */

const MODULES = [
  { id: 'fito', title: 'Fitoterapia', icon: '🌿', color: '#10b981' },
  { id: 'bio', title: 'Bioquímica', icon: '🧬', color: '#06b6d4' },
  { id: 'med', title: 'Medicina', icon: '🏥', color: '#f43f5e' },
  { id: 'auto', title: 'Autosustentabilidad', icon: '🌍', color: '#84cc16' },
  { id: 'san', title: 'Santuario', icon: '⛩️', color: '#a855f7' }
];

const ACTION_TYPES = [
  { id: 'OPEN_LESSON', label: '📖 Abrir Lección/Temario' },
  { id: 'OPEN_LIBRARY', label: '📚 Abrir Biblioteca' },
  { id: 'OPEN_KITCHEN', label: '🍳 Abrir Cocina' },
  { id: 'OPEN_BED', label: '🛌 Abrir Habitación (Energía)' },
  { id: 'OPEN_PRACTICE', label: '⚔️ Abrir Prácticas' }
];

const ModuleMapSettings = () => {
  const [selectedModule, setSelectedModule] = useState(MODULES[0].id);
  const [mapConfig, setMapConfig] = useState(null);
  const [selectedBlockId, setSelectedBlockId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchConfig();
  }, [selectedModule]);

  const fetchConfig = async () => {
    setLoading(true);
    try {
      const docRef = doc(db, 'config', `module_map_${selectedModule}`);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const data = snap.data();
        // Normalizar bloques para asegurar que todos tengan un ID (especialmente datos antiguos)
        const normalizedBlocks = {};
        if (data.blocks) {
          Object.entries(data.blocks).forEach(([key, block]) => {
            normalizedBlocks[key] = { ...block, id: block.id || key };
          });
        }

        setMapConfig({
          imageUrl: data.imageUrl || 'https://placehold.co/1000x1777/0a0a0f/10b981?text=Sube+Mapa+Módulo',
          blocks: normalizedBlocks
        });
      } else {
        setMapConfig({
          imageUrl: 'https://placehold.co/1000x1777/0a0a0f/10b981?text=Sube+Mapa+Módulo',
          blocks: {}
        });
      }
    } catch (err) {
      console.error("Error fetching config:", err);
      setMapConfig({ imageUrl: '', blocks: {} });
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const storageRef = ref(storage, `maps/modules/${selectedModule}/background_${Date.now()}.png`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      setMapConfig(prev => ({ ...prev, imageUrl: url }));
    } catch (err) {
      console.error("Error al subir:", err);
    }
    setUploading(false);
  };

  const addNewBlock = () => {
    const id = Date.now().toString();
    setMapConfig(prev => ({
      ...prev,
      blocks: {
        ...prev.blocks,
        [id]: {
          id,
          name: 'Nuevo Punto',
          x: 50,
          y: 50,
          icon: '✨',
          color: MODULES.find(m => m.id === selectedModule)?.color || '#10b981',
          effectType: 'portal',
          actionType: selectedModule === 'san' ? 'OPEN_LIBRARY' : 'OPEN_LESSON',
          markerSize: 50,
          markerIconSize: 24,
          markerBgColor: 'rgba(0,0,0,0.8)',
          weeks: {}
        }
      }
    }));
    setSelectedBlockId(id);
  };

  const deleteBlock = (id) => {
    if (!window.confirm("¿Eliminar este punto de interés?")) return;
    setMapConfig(prev => {
      const newBlocks = { ...prev.blocks };
      delete newBlocks[id];
      return { ...prev, blocks: newBlocks };
    });
    setSelectedBlockId(null);
  };

  const handleMapClick = (e) => {
    if (!selectedBlockId) return;
    const rect = e.target.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setMapConfig(prev => ({
      ...prev,
      blocks: {
        ...prev.blocks,
        [selectedBlockId]: { 
          ...prev.blocks[selectedBlockId], 
          x: Math.round(x * 10) / 10, 
          y: Math.round(y * 10) / 10 
        }
      }
    }));
  };

  const updateBlock = (id, field, value) => {
    setMapConfig(prev => ({
      ...prev,
      blocks: {
        ...prev.blocks,
        [id]: { ...prev.blocks[id], [field]: value }
      }
    }));
  };

  const updateWeek = (blockId, weekNum, title) => {
    setMapConfig(prev => {
        const block = prev.blocks[blockId];
        return {
            ...prev,
            blocks: {
                ...prev.blocks,
                [blockId]: {
                    ...block,
                    weeks: { ...block.weeks, [weekNum]: title }
                }
            }
        };
    });
  };

  const saveConfig = async () => {
    setLoading(true);
    await setDoc(doc(db, 'config', `module_map_${selectedModule}`), mapConfig);
    alert(`¡Configuración de ${selectedModule.toUpperCase()} guardada!`);
    setLoading(false);
  };

  if (loading && !mapConfig) return <div className="h-screen flex items-center justify-center bg-dark text-emerald-500 font-black animate-pulse uppercase tracking-[0.5em]">Sincronizando...</div>;

  return (
    <div className="h-screen flex flex-col bg-[#050505] text-main font-sans overflow-hidden">
      
      {/* HEADER COMPACTO */}
      <header className="p-4 bg-black/40 border-b border-white/5 flex items-center justify-between z-50">
        <div className="flex items-center gap-6">
            <div>
                <h1 className="text-xl font-black text-white uppercase tracking-tighter leading-none">Editor de Islas</h1>
                <p className="text-white/20 text-[8px] uppercase tracking-widest font-bold">Configuración de Puntos Interactivos</p>
            </div>

            <div className="flex bg-white/5 p-1 rounded-xl border border-white/5 ml-4">
                {MODULES.map(m => (
                <button
                    key={m.id}
                    onClick={() => setSelectedModule(m.id)}
                    className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${selectedModule === m.id ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
                >
                    {m.icon} {m.title}
                </button>
                ))}
            </div>
        </div>

        <div className="flex items-center gap-3">
            <label className="cursor-pointer bg-white/5 text-white/60 font-black px-4 py-2 rounded-xl hover:bg-white/10 transition-all uppercase tracking-widest text-[9px] flex items-center border border-white/5">
                {uploading ? 'SUBIENDO...' : '📁 CAMBIAR MAPA'}
                <input type="file" className="hidden" onChange={handleFileUpload} accept="image/*" />
            </label>
            
            <button 
                onClick={saveConfig}
                className="bg-emerald-500 text-black font-black px-6 py-2.5 rounded-xl hover:bg-emerald-400 transition-all uppercase tracking-widest text-[9px] shadow-lg shadow-emerald-500/20"
            >
                GUARDAR CAMBIOS
            </button>
        </div>
      </header>

      {/* ÁREA DE TRABAJO EN DOS COLUMNAS FIJAS */}
      <main className="flex-1 flex overflow-hidden">
        
        {/* PANEL DE CONTROL (Izquierda - Ancho Fijo) */}
        <aside className="w-[380px] h-full overflow-y-auto p-4 bg-black/20 border-r border-white/5 custom-scrollbar">
            <button 
                onClick={addNewBlock}
                className="w-full py-4 border-2 border-dashed border-emerald-500/30 rounded-2xl text-emerald-400 font-black uppercase tracking-widest text-[9px] hover:bg-emerald-500/10 hover:border-emerald-500 transition-all mb-4"
            >
                + AGREGAR PUNTO DE INTERÉS
            </button>

            <AnimatePresence mode="popLayout">
                {Object.entries(mapConfig.blocks).map(([key, block]) => (
                    <motion.div 
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        key={block.id || key} 
                        className={`p-4 rounded-[1.5rem] border transition-all relative group mb-3 ${selectedBlockId === (block.id || key) ? 'bg-emerald-500/10 border-emerald-500 shadow-xl' : 'bg-white/5 border-white/5'}`}
                    >
                        <div className="flex items-center justify-between mb-3">
                            <button onClick={() => setSelectedBlockId(block.id || key)} className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-black/40 flex items-center justify-center text-xl border border-white/5 shadow-inner">{block.icon}</div>
                                <div className="text-left">
                                    <h3 className="font-black text-white uppercase text-[10px] tracking-widest">{block.name}</h3>
                                    <p className="text-[8px] font-mono text-emerald-400/60 uppercase">{block.x}% / {block.y}%</p>
                                </div>
                            </button>
                            <button onClick={() => deleteBlock(block.id || key)} className="text-white/10 hover:text-red-500 transition-colors p-1 text-xs">✕</button>
                        </div>

                        {selectedBlockId === (block.id || key) && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 pt-4 border-t border-white/5">
                                <div className="space-y-1">
                                    <label className="text-[8px] text-emerald-400 uppercase font-black ml-1">Nombre / Título</label>
                                    <input type="text" value={block.name} onChange={(e) => updateBlock(block.id || key, 'name', e.target.value)} className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-[11px] text-white" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[8px] text-emerald-400 uppercase font-black ml-1">Acción</label>
                                    <select value={block.actionType} onChange={(e) => updateBlock(block.id || key, 'actionType', e.target.value)} className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-[9px] text-white uppercase font-black cursor-pointer outline-none">
                                        {ACTION_TYPES.map(a => <option key={a.id} value={a.id}>{a.label}</option>)}
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                        <label className="text-[8px] text-white/30 uppercase font-black ml-1">Icono</label>
                                        <input type="text" value={block.icon} onChange={(e) => updateBlock(block.id || key, 'icon', e.target.value)} className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-center" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[8px] text-white/30 uppercase font-black ml-1">Color</label>
                                        <input type="color" value={block.color} onChange={(e) => updateBlock(block.id || key, 'color', e.target.value)} className="w-full h-8 bg-black border border-white/10 rounded-lg cursor-pointer p-0.5" />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[8px] text-white/30 uppercase font-black ml-1">Fondo Icono</label>
                                    <input type="text" value={block.markerBgColor} onChange={(e) => updateBlock(block.id || key, 'markerBgColor', e.target.value)} className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-[9px] text-white" />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[8px] text-white/30 uppercase font-black ml-1">URL Imagen (Opcional)</label>
                                    <input type="text" value={block.markerUrl || ''} onChange={(e) => updateBlock(block.id || key, 'markerUrl', e.target.value)} className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-[9px] text-white" />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                        <label className="text-[8px] text-white/30 uppercase font-black ml-1">Efecto</label>
                                        <select value={block.effectType} onChange={(e) => updateBlock(block.id || key, 'effectType', e.target.value)} className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-[9px] text-white uppercase font-black">
                                            <option value="portal">Portal</option>
                                            <option value="floating">Flotante</option>
                                            <option value="none">Nada</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[8px] text-white/30 uppercase font-black ml-1">Tamaños</label>
                                        <div className="flex flex-col gap-1">
                                            <input type="range" min="30" max="120" value={block.markerSize || 50} onChange={(e) => updateBlock(block.id || key, 'markerSize', parseInt(e.target.value))} className="w-full accent-emerald-500" />
                                            <input type="range" min="10" max="80" value={block.markerIconSize || 24} onChange={(e) => updateBlock(block.id || key, 'markerIconSize', parseInt(e.target.value))} className="w-full accent-emerald-500" />
                                        </div>
                                    </div>
                                </div>

                                {block.actionType === 'OPEN_LESSON' && (
                                    <div className="mt-4 pt-4 border-t border-white/5 space-y-3">
                                        <h4 className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">Semanas 1-6</h4>
                                        <div className="grid grid-cols-1 gap-1.5">
                                            {[1, 2, 3, 4, 5, 6].map(w => (
                                                <input 
                                                    key={w}
                                                    type="text" 
                                                    placeholder={`Semana ${w}...`}
                                                    className="bg-black/40 border border-white/5 rounded px-3 py-1.5 text-[9px] text-white focus:border-emerald-500 outline-none"
                                                    value={block.weeks?.[w] || ''}
                                                    onChange={(e) => updateWeek(block.id || key, w, e.target.value)}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </motion.div>
                ))}
            </AnimatePresence>
        </aside>

        {/* ÁREA DEL MAPA (Derecha - Scrollable) */}
        <section className="flex-1 relative bg-black overflow-auto custom-scrollbar p-10 flex justify-center items-start">
            <div className="relative inline-block border border-white/10 shadow-2xl rounded-2xl overflow-hidden">
                <img 
                    src={mapConfig.imageUrl} 
                    className="max-w-none h-auto block cursor-crosshair select-none"
                    onClick={handleMapClick}
                    style={{ maxHeight: '150vh' }} // Límite de altura para evitar proporciones absurdas
                    alt="Map Editor"
                />
                
                {/* Overlay de Marcadores */}
                <div className="absolute inset-0 pointer-events-none">
                    {Object.values(mapConfig.blocks).map((block) => (
                        <div
                            key={block.id}
                            className="absolute"
                            style={{ left: `${block.x}%`, top: `${block.y}%`, transform: 'translate(-50%, -50%)' }}
                        >
                            <div className="relative flex flex-col items-center">
                                {block.effectType === 'portal' && (
                                    <div className="portal-ring scale-75" style={{ '--map-ring-color': block.color }}>
                                        <div className="portal-ring-outer" />
                                        <div className="portal-ring-core" />
                                    </div>
                                )}
                                
                                <motion.div 
                                    animate={block.effectType === 'floating' ? { y: [0, -10, 0] } : {}}
                                    transition={block.effectType === 'floating' ? { duration: 2, repeat: Infinity, ease: "easeInOut" } : {}}
                                    className={`rounded-full border-2 flex items-center justify-center shadow-2xl relative z-10 transition-all ${selectedBlockId === block.id ? 'scale-110' : ''}`}
                                    style={{ 
                                        width: `${block.markerSize}px`, height: `${block.markerSize}px`,
                                        backgroundColor: block.markerBgColor || 'rgba(0,0,0,0.8)',
                                        borderColor: selectedBlockId === block.id ? '#10b981' : 'white',
                                        boxShadow: `0 0 20px ${block.color}66`
                                    }}
                                >
                                    {block.markerUrl ? (
                                        <img src={block.markerUrl} className="w-full h-full object-contain p-2" />
                                    ) : (
                                        <span style={{ fontSize: `${block.markerIconSize}px` }}>{block.icon}</span>
                                    )}
                                </motion.div>

                                <div className="mt-2 bg-black/80 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 shadow-xl">
                                    <p className="text-[8px] font-black text-white uppercase tracking-tighter">{block.name}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Marcador de Modo Edición flotante */}
            <div className="fixed bottom-6 right-6 bg-emerald-500/10 backdrop-blur-xl border border-emerald-500/20 px-6 py-3 rounded-2xl flex items-center gap-4 z-50">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-black text-white uppercase tracking-widest">
                    PUNTO SELECCIONADO: {mapConfig.blocks[selectedBlockId]?.name || 'Ninguno'}
                </span>
            </div>
        </section>
      </main>
    </div>
  );
};

export default ModuleMapSettings;
