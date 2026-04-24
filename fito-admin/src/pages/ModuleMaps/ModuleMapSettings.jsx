import React, { useState, useEffect } from 'react';
import { db, storage } from '../../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { motion, AnimatePresence } from 'framer-motion';

const MODULES = [
  { id: 'fito', title: 'Fitoterapia', icon: '🌿', color: '#10b981' },
  { id: 'bio', title: 'Bioquímica', icon: '🧬', color: '#06b6d4' },
  { id: 'med', title: 'Medicina', icon: '🏥', color: '#f43f5e' },
  { id: 'auto', title: 'Autosustentabilidad', icon: '🌍', color: '#84cc16' }
];

const ModuleMapSettings = () => {
  const [selectedModule, setSelectedModule] = useState(MODULES[0].id);
  const [mapConfig, setMapConfig] = useState(null);
  const [selectedBlock, setSelectedBlock] = useState(1);
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
        setMapConfig({
          imageUrl: data.imageUrl || 'https://placehold.co/1000x1777/0a0a0f/10b981?text=Sube+Mapa+Módulo',
          blocks: data.blocks || {},
          weeks: data.weeks || {}
        });
      } else {
        setMapConfig({
          imageUrl: 'https://placehold.co/1000x1777/0a0a0f/10b981?text=Sube+Mapa+Módulo',
          blocks: {},
          weeks: {}
        });
      }
    } catch (err) {
      console.error("Error fetching config:", err);
      // Initialize with default on error
      setMapConfig({
        imageUrl: 'https://placehold.co/1000x1777/0a0a0f/10b981?text=Sube+Mapa+Módulo',
        blocks: {}
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const storageRef = ref(storage, `maps/modules/${selectedModule}/background.png`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      
      setMapConfig(prev => ({ ...prev, imageUrl: url }));
      alert('¡Imagen de módulo subida! Ahora ubica los 10 bloques.');
    } catch (err) {
      console.error("Error al subir:", err);
      alert("Error al subir la imagen.");
    }
    setUploading(false);
  };

  const handleMapClick = (e) => {
    if (!selectedBlock) return;

    const rect = e.target.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setMapConfig(prev => {
      const currentBlocks = prev?.blocks || {};
      const blockData = currentBlocks[selectedBlock] || {};
      
      return {
        ...prev,
        blocks: {
          ...currentBlocks,
          [selectedBlock]: { 
            ...blockData,
            x: Math.round(x), 
            y: Math.round(y),
            icon: blockData.icon || '✨',
            effectType: blockData.effectType || 'portal',
            color: blockData.color || MODULES.find(m => m.id === selectedModule)?.color || '#10b981'
          }
        }
      };
    });
  };

  const saveConfig = async () => {
    setLoading(true);
    await setDoc(doc(db, 'config', `module_map_${selectedModule}`), mapConfig);
    alert(`¡Mapa de ${selectedModule.toUpperCase()} actualizado! 🚀`);
    setLoading(false);
  };

  if (loading && !mapConfig) return <div className="p-10 text-white">Cargando Mapa...</div>;

  return (
    <div className="min-h-screen p-10 bg-dark text-main font-sans">
      <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black text-white uppercase tracking-tighter">Editor de Mapas de Módulo</h1>
          <p className="text-white/40 text-sm uppercase tracking-widest">Configura los 10 bloques para cada isla</p>
        </div>

        <div className="flex flex-wrap gap-4">
          <div className="flex bg-black/40 p-1 rounded-2xl border border-white/10">
            {MODULES.map(m => (
              <button
                key={m.id}
                onClick={() => setSelectedModule(m.id)}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${selectedModule === m.id ? 'bg-emerald-500 text-black' : 'text-white/40 hover:text-white'}`}
              >
                {m.title}
              </button>
            ))}
          </div>
          
          <label className="cursor-pointer bg-white/10 text-white font-bold px-6 py-3 rounded-full hover:bg-white/20 transition-all uppercase tracking-widest text-[10px] flex items-center">
            {uploading ? 'Subiendo...' : '📁 Subir Mapa'}
            <input type="file" className="hidden" onChange={handleFileUpload} accept="image/*" />
          </label>
          
          <button 
            onClick={saveConfig}
            className="bg-emerald-500 text-black font-black px-8 py-3 rounded-full hover:bg-emerald-400 transition-all uppercase tracking-widest text-[10px] shadow-[0_0_20px_rgba(16,185,129,0.3)]"
          >
            Guardar Cambios
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Panel de Bloques */}
        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
          <h2 className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em] mb-4">Seleccionar Bloque (1-10)</h2>
          
          {[...Array(10)].map((_, i) => {
            const num = i + 1;
            const block = mapConfig.blocks[num];
            return (
              <div key={num} className={`p-4 rounded-2xl border-2 transition-all ${selectedBlock === num ? 'bg-emerald-500/10 border-emerald-500' : 'bg-black/40 border-white/5 opacity-60'}`}>
                <button
                  onClick={() => setSelectedBlock(num)}
                  className="w-full flex items-center justify-between mb-3"
                >
                  <span className="font-black text-white uppercase text-xs">Bloque {num}</span>
                  {block && <span className="text-[9px] font-mono text-emerald-400">{block.x}% : {block.y}%</span>}
                </button>

                {selectedBlock === num && (
                  <div className="space-y-3 pt-3 border-t border-white/10">
                    <div className="flex flex-col gap-1">
                      <label className="text-[8px] text-emerald-400 uppercase font-black">Nombre del Bloque</label>
                      <input 
                        type="text" 
                        placeholder="Ej: Introducción a la Fito"
                        className="bg-black border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-emerald-500 outline-none"
                        value={block?.name || ''}
                        onChange={(e) => setMapConfig(prev => ({
                          ...prev,
                          blocks: { ...prev.blocks, [num]: { ...prev.blocks[num], name: e.target.value } }
                        }))}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        <input 
                          type="text" 
                          placeholder="Icono (Emoji)"
                          className="bg-black border border-white/10 rounded-lg px-3 py-2 text-xs text-white"
                          value={block?.icon || ''}
                          onChange={(e) => setMapConfig(prev => ({
                            ...prev,
                            blocks: { ...prev.blocks, [num]: { ...prev.blocks[num], icon: e.target.value } }
                          }))}
                        />
                        <div className="flex flex-col gap-1">
                          <label className="text-[8px] text-white/40 uppercase font-black">Portal/Brillo</label>
                          <input 
                            type="color" 
                            className="w-full h-8 bg-black border border-white/10 rounded-lg cursor-pointer"
                            value={block?.color || '#10b981'}
                            onChange={(e) => setMapConfig(prev => ({
                              ...prev,
                              blocks: { ...prev.blocks, [num]: { ...prev.blocks[num], color: e.target.value } }
                            }))}
                          />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        <div className="flex flex-col gap-1">
                          <label className="text-[8px] text-white/40 uppercase font-black">Fondo Icono</label>
                          <input 
                            type="text" 
                            placeholder="Ej: transparent o #hex"
                            className="w-full bg-emerald-500/5 border border-emerald-500/20 rounded-lg px-3 py-2 text-[10px] text-white focus:border-emerald-500 outline-none transition-all"
                            value={block?.markerBgColor || ''}
                            onChange={(e) => setMapConfig(prev => ({
                              ...prev,
                              blocks: { ...prev.blocks, [num]: { ...prev.blocks[num], markerBgColor: e.target.value } }
                            }))}
                          />
                          <div className="flex gap-1 mt-1">
                            <button onClick={() => setMapConfig(prev => ({...prev, blocks: {...prev.blocks, [num]: {...prev.blocks[num], markerBgColor: 'transparent'}}}))} className="text-[7px] bg-white/5 hover:bg-white/10 px-1 py-0.5 rounded border border-white/10 text-white/60">🚫 Quitar</button>
                            <button onClick={() => setMapConfig(prev => ({...prev, blocks: {...prev.blocks, [num]: {...prev.blocks[num], markerBgColor: '#000000'}}}))} className="text-[7px] bg-white/5 hover:bg-white/10 px-1 py-0.5 rounded border border-white/10 text-white/60">🌑 Negro</button>
                            <button onClick={() => setMapConfig(prev => ({...prev, blocks: {...prev.blocks, [num]: {...prev.blocks[num], markerBgColor: 'rgba(0,0,0,0.5)'}}}))} className="text-[7px] bg-white/5 hover:bg-white/10 px-1 py-0.5 rounded border border-white/10 text-white/60">💨 Transp.</button>
                          </div>
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[8px] text-white/40 uppercase font-black">Efecto</label>
                          <select 
                            className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-[9px] text-white uppercase font-black"
                            value={block?.effectType || 'portal'}
                            onChange={(e) => setMapConfig(prev => ({
                              ...prev,
                              blocks: { ...prev.blocks, [num]: { ...prev.blocks[num], effectType: e.target.value } }
                            }))}
                          >
                            <option value="portal">Portal</option>
                            <option value="floating">Flotante</option>
                            <option value="none">Nada</option>
                          </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[8px] font-black text-white/40 uppercase">Tamaño Marcador ({block?.markerSize || 50}px)</label>
                          <input 
                            type="range" min="30" max="100" 
                            value={block?.markerSize || 50} 
                            onChange={(e) => setMapConfig(prev => ({
                              ...prev,
                              blocks: { ...prev.blocks, [num]: { ...prev.blocks[num], markerSize: parseInt(e.target.value) } }
                            }))}
                            className="w-full accent-emerald-500" 
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[8px] font-black text-white/40 uppercase">Icono ({block?.markerIconSize || 22}px)</label>
                          <input 
                            type="range" min="10" max="60" 
                            value={block?.markerIconSize || 22} 
                            onChange={(e) => setMapConfig(prev => ({
                              ...prev,
                              blocks: { ...prev.blocks, [num]: { ...prev.blocks[num], markerIconSize: parseInt(e.target.value) } }
                            }))}
                            className="w-full accent-emerald-500" 
                          />
                        </div>
                    </div>
                      
                    <input 
                      type="text" 
                      placeholder="URL Imagen personalizada (opcional)"
                      className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-[9px] text-white"
                      value={block?.markerUrl || ''}
                      onChange={(e) => setMapConfig(prev => ({
                        ...prev,
                        blocks: { ...prev.blocks, [num]: { ...prev.blocks[num], markerUrl: e.target.value } }
                      }))}
                    />

                    {/* Nombres de Semanas Específicas por Bloque */}
                    <div className="mt-6 pt-6 border-t border-white/10 space-y-3">
                      <h3 className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">Temario: Semanas 1-6</h3>
                      <div className="grid grid-cols-1 gap-2">
                        {[1, 2, 3, 4, 5, 6].map(weekNum => (
                          <div key={weekNum} className="flex flex-col gap-1">
                            <label className="text-[7px] text-white/40 uppercase font-bold">Semana {weekNum}</label>
                            <input 
                              type="text" 
                              placeholder={`Título de la semana...`}
                              className="bg-black/40 border border-white/5 rounded-lg px-3 py-1.5 text-[10px] text-white focus:border-emerald-500/50 outline-none transition-all"
                              value={block?.weeks?.[weekNum] || ''}
                              onChange={(e) => setMapConfig(prev => ({
                                ...prev,
                                blocks: { 
                                  ...prev.blocks, 
                                  [num]: { 
                                    ...prev.blocks[num], 
                                    weeks: { ...prev.blocks[num]?.weeks, [weekNum]: e.target.value }
                                  } 
                                }
                              }))}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

        </div>

        {/* Editor Visual */}
        <div className="lg:col-span-3 relative rounded-[2.5rem] overflow-hidden border border-white/10 bg-black/60 shadow-2xl">
          <div className="relative w-full h-full min-h-[600px] overflow-auto custom-scrollbar">
            <img 
              src={mapConfig.imageUrl} 
              className="w-full h-auto min-w-full block cursor-crosshair"
              onClick={handleMapClick}
              alt="Module Map Editor"
            />
            
            {/* Overlay de Bloques */}
            <div className="absolute inset-0 pointer-events-none">
              {Object.entries(mapConfig.blocks).map(([num, block]) => (
                <div
                  key={num}
                  className="absolute"
                  style={{ 
                    left: `${block.x}%`, 
                    top: `${block.y}%`,
                    transform: 'translate(-50%, -50%)',
                  }}
                >
                  <div className="relative flex flex-col items-center">
                    {/* Visualización del Efecto Proyectada */}
                    {block.effectType === 'portal' && (
                       <div className="portal-ring scale-75" style={{ '--map-ring-color': block.color }}>
                          <div className="portal-ring-outer" />
                          <div className="portal-ring-core" />
                       </div>
                    )}

                    <motion.div 
                      animate={block.effectType === 'floating' ? { y: [0, -10, 0] } : {}}
                      transition={block.effectType === 'floating' ? { duration: 2, repeat: Infinity, ease: "easeInOut" } : {}}
                      className="rounded-full border-2 border-white flex items-center justify-center shadow-2xl relative z-10"
                      style={{ 
                        width: `${block.markerSize || 40}px`,
                        height: `${block.markerSize || 40}px`,
                        backgroundColor: block.markerBgColor || 'rgba(0,0,0,0.8)',
                        borderColor: selectedBlock === parseInt(num) ? '#10b981' : 'white',
                        boxShadow: `0 0 15px ${block.color}55`
                      }}
                    >
                      {block.markerUrl ? (
                         <img src={block.markerUrl} className="object-contain" style={{ width: `${block.markerIconSize || 20}px`, height: `${block.markerIconSize || 20}px` }} />
                      ) : (
                         <span style={{ fontSize: `${block.markerIconSize || 20}px` }}>{block.icon}</span>
                      )}
                    </motion.div>
                    
                    <div className="mt-1 bg-black/80 px-2 py-0.5 rounded-md border border-white/10">
                      <span className="text-[8px] font-black text-white uppercase tracking-tighter italic">B{num}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="absolute top-6 left-6 glass-panel px-4 py-2 text-[10px] font-black uppercase text-emerald-400 pointer-events-none">
              Editando: {MODULES.find(m => m.id === selectedModule)?.title} &bull; Bloque {selectedBlock}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModuleMapSettings;
