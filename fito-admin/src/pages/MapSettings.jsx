import React, { useState, useEffect } from 'react';
import { db, storage } from '../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { motion } from 'framer-motion';

const MapSettings = () => {
  const [mapConfig, setMapConfig] = useState(null);
  const [mapTheme, setMapTheme] = useState(null);
  const [selectedZone, setSelectedZone] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  // Zonas fijas que controlamos
  const zonesList = [
    { id: 'herbolaria', title: 'Bosque', icon: '🌿' },
    { id: 'alumno', title: 'Santuario', icon: '🏠' },
    { id: 'mensajera', title: 'Nexo', icon: '🧬' },
    { id: 'guardian', title: 'Huerta', icon: '🎋' },
    { id: 'medicina', title: 'Clínica', icon: '🏥' },
    { id: 'practicas', title: 'Prácticas', icon: '⚔️' }
  ];

  useEffect(() => {
    const fetchConfigs = async () => {
      try {
        const mapDoc = await getDoc(doc(db, 'config', 'world_map'));
        if (mapDoc.exists()) {
          setMapConfig(mapDoc.data());
        } else {
          setMapConfig(defaultConfig);
        }

        const themeDoc = await getDoc(doc(db, 'config', 'map_theme'));
        if (themeDoc.exists()) {
          setMapTheme(themeDoc.data());
        } else {
          // Si no hay tema, se usan los valores por defecto definidos en themeStyles o CSS
          setMapTheme({});
        }
      } catch (err) {
        console.error("Error cargando configs:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchConfigs();
  }, []);

  const themeStyles = mapTheme ? {
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

  const defaultConfig = {
    imageUrl: 'https://placehold.co/1000x1777/0a0a0f/10b981?text=Sube+tu+Mapa+Aqui',
    zones: {
      herbolaria: { x: 28, y: 18 },
      alumno: { x: 74, y: 31 },
      mensajera: { x: 55, y: 55 },
      guardian: { x: 32, y: 80 },
      medicina: { x: 76, y: 88 }
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const storageRef = ref(storage, 'maps/world_map_v1.png');
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      
      setMapConfig(prev => ({ ...prev, imageUrl: url }));
      alert('¡Imagen subida con éxito! Ahora puedes ubicar los iconos.');
    } catch (err) {
      console.error("Error al subir:", err);
      alert("Error al subir la imagen. Verifica que tengas el Storage activo en Firebase.");
    }
    setUploading(false);
  };

  const handleMapClick = (e) => {
    if (!selectedZone) return;

    // Calcular porcentajes exactos relativos a la imagen
    const rect = e.target.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    const zoneData = zonesList.find(z => z.id === selectedZone);
    if (!zoneData) return;

    setMapConfig(prev => ({
      ...prev,
      zones: {
        ...prev.zones,
        [selectedZone]: { 
          x: Math.round(x), 
          y: Math.round(y),
          title: zoneData.title,
          icon: zoneData.icon
        }
      }
    }));
  };

  const saveConfig = async () => {
    setLoading(true);
    await setDoc(doc(db, 'config', 'world_map'), mapConfig);
    alert('¡Mapa actualizado para todos los alumnos! 🚀');
    setLoading(false);
  };

  if (loading) return <div className="p-10 text-white">Sincronizando con el Cosmos...</div>;

  return (
    <div className="min-h-screen p-10 bg-dark text-main" style={themeStyles}>
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-white">EDITOR DE MUNDO</h1>
          <p className="text-white/40 text-sm">Haz clic en el mapa para ubicar los iconos interactivos</p>
        </div>
        <div className="flex gap-4">
          <div className="flex flex-col gap-1">
            <input 
              type="text" 
              placeholder="URL de Imagen Directa"
              className="bg-white/5 border border-white/10 rounded-full px-4 py-2 text-[10px] text-white w-64"
              value={mapConfig.imageUrl}
              onChange={(e) => setMapConfig(prev => ({ ...prev, imageUrl: e.target.value }))}
            />
          </div>
          <label className="cursor-pointer bg-white/10 text-white font-bold px-6 py-3 rounded-full hover:bg-white/20 transition-all uppercase tracking-widest text-xs flex items-center">
            {uploading ? 'Subiendo...' : '📁 Subir Archivo'}
            <input type="file" className="hidden" onChange={handleFileUpload} accept="image/*" disabled={uploading} />
          </label>
          <button 
            onClick={saveConfig}
            className="bg-emerald-500 text-black font-black px-8 py-3 rounded-full hover:bg-emerald-400 transition-all uppercase tracking-widest shadow-[0_0_20px_rgba(16,185,129,0.4)]"
          >
            Guardar Cambios
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Panel de Selección */}
        <div className="space-y-4">
          <h2 className="text-xs font-black text-emerald-400 uppercase tracking-widest mb-4">Configurar Zonas</h2>
          
          {selectedZone && (
            <div className="p-4 rounded-3xl bg-emerald-500/5 border border-emerald-500/20 mb-6 motion-safe:animate-pulse">
              <h3 className="text-white font-black text-[10px] uppercase mb-3">Marcador Personalizado: {selectedZone}</h3>
              <input 
                type="text" 
                placeholder="URL de imagen del edificio (PNG)"
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs text-white mb-2"
                value={mapConfig.zones[selectedZone]?.markerUrl || ''}
                onChange={(e) => setMapConfig(prev => ({
                  ...prev,
                  zones: {
                    ...prev.zones,
                    [selectedZone]: { ...prev.zones[selectedZone], markerUrl: e.target.value }
                  }
                }))}
              />
              <input 
                type="text" 
                placeholder="Icono / Emoji (opcional)"
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs text-white"
                value={mapConfig.zones[selectedZone]?.icon || ''}
                onChange={(e) => setMapConfig(prev => ({
                  ...prev,
                  zones: {
                    ...prev.zones,
                    [selectedZone]: { ...prev.zones[selectedZone], icon: e.target.value }
                  }
                }))}
              />
              <p className="text-[9px] text-white/30 italic mt-2">Personaliza el dibujo o emoji de este marcador.</p>
            </div>
          )}

          {zonesList.map(zone => (
            <button
              key={zone.id}
              onClick={() => setSelectedZone(zone.id)}
              className={`w-full p-4 rounded-2xl flex items-center justify-between border-2 transition-all ${
                selectedZone === zone.id 
                  ? 'bg-emerald-500/10 border-emerald-500 text-white shadow-lg' 
                  : 'bg-black/40 border-white/5 text-white/40 hover:border-white/20'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">{zone.icon}</span>
                <span className="font-bold uppercase text-xs tracking-widest">{zone.title}</span>
              </div>
              {mapConfig.zones[zone.id] && (
                <span className="text-[10px] font-mono opacity-60">
                  {mapConfig.zones[zone.id].x}% : {mapConfig.zones[zone.id].y}%
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Área de Visualización y Click */}
        <div className="lg:col-span-2 relative max-h-[80vh] overflow-y-auto rounded-[2rem] border border-white/10 bg-black/40 custom-scrollbar">
          <div className="relative w-full overflow-hidden">
            {/* Capa de Imagen */}
            <img 
              src={mapConfig.imageUrl} 
              className="w-full h-auto block cursor-crosshair relative z-0"
              onClick={handleMapClick}
              alt="World Map Editor"
            />
            
            {/* Capa de Marcadores (Overlay) */}
            <div className="absolute inset-0 pointer-events-none z-50">
              {zonesList.map(zone => mapConfig.zones[zone.id] && (
                <div
                  key={zone.id}
                  className="absolute pointer-events-none"
                  style={{ 
                    left: `${mapConfig.zones[zone.id].x}%`, 
                    top: `${mapConfig.zones[zone.id].y}%`,
                    transform: 'translate(-50%, -50%)',
                    zIndex: 100
                  }}
                >
                  <div className="flex flex-col items-center relative">
                    {/* EFECTO: PORTAL DORADO */}
                    <div className="portal-ring">
                      <div className="portal-ring-outer" />
                      <div className="portal-ring-core" />
                    </div>

                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 border-white shadow-[0_0_20px_rgba(0,0,0,0.8)] z-20 transition-all`}
                    style={{ 
                      backgroundColor: 'var(--map-marker-bg)',
                      width: 'var(--map-marker-size)',
                      height: 'var(--map-marker-size)',
                      borderColor: selectedZone === zone.id ? 'var(--color-emerald-500)' : 'white'
                    }}>
                      <span style={{ fontSize: 'var(--map-marker-icon-size)' }}>
                        {mapConfig.zones[zone.id]?.icon || zone.icon}
                      </span>
                    </div>
                    
                    <div className="mt-2 bg-black/90 px-3 py-1 rounded-full border border-white/20 z-20 shadow-xl">
                      <p className="text-[10px] font-black text-white uppercase tracking-tighter whitespace-nowrap">{zone.title}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {selectedZone && (
            <div className="absolute top-4 left-4 glass-panel px-4 py-2 text-[10px] font-black uppercase text-emerald-400">
              Modo Edición: {selectedZone}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MapSettings;
