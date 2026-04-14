import React, { useState, useEffect } from 'react';
import { db, storage } from '../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { motion } from 'framer-motion';

const MapSettings = () => {
  const [mapConfig, setMapConfig] = useState(null);
  const [selectedZone, setSelectedZone] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  // Zonas fijas que controlamos
  const zonesList = [
    { id: 'herbolaria', title: 'Bosque', icon: '🌿' },
    { id: 'alumno', title: 'Santuario', icon: '🏠' },
    { id: 'mensajera', title: 'Nexo', icon: '🧬' },
    { id: 'guardian', title: 'Huerta', icon: '🎋' },
    { id: 'medicina', title: 'Clínica', icon: '🏥' }
  ];

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const docRef = doc(db, 'config', 'world_map');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setMapConfig(docSnap.data());
      } else {
        // Doc no existe - Cargar default
        setMapConfig(defaultConfig);
      }
    } catch (err) {
      console.error("Error Firestore:", err);
      // FALLBACK POR ERROR DE PERMISOS
      setMapConfig(defaultConfig);
    }
    setLoading(false);
  };

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

    setMapConfig(prev => ({
      ...prev,
      zones: {
        ...prev.zones,
        [selectedZone]: { x: Math.round(x), y: Math.round(y) }
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
    <div className="p-8 pb-24 max-w-6xl mx-auto">
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-white">EDITOR DE MUNDO</h1>
          <p className="text-white/40 text-sm">Haz clic en el mapa para ubicar los iconos interactivos</p>
        </div>
        <div className="flex gap-4">
          <label className="cursor-pointer bg-white/10 text-white font-bold px-6 py-3 rounded-full hover:bg-white/20 transition-all uppercase tracking-widest text-xs flex items-center">
            {uploading ? 'Subiendo...' : '📁 Subir Mapa'}
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
          <h2 className="text-xs font-black text-emerald-400 uppercase tracking-widest mb-4">Seleccionar Zona</h2>
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
        <div className="lg:col-span-2 relative">
          <div className="relative inline-block border-2 border-emerald-500/20 rounded-[2rem] overflow-hidden shadow-2xl bg-black/40">
            <img 
              src={mapConfig.imageUrl} 
              className="w-full h-auto max-h-[75dvh] cursor-crosshair opacity-90 transition-opacity hover:opacity-100 block object-contain"
              onClick={handleMapClick}
              alt="World Map Editor"
            />
            
            {/* Marcadores Visuales en el Editor (%) */}
            {zonesList.map(zone => mapConfig.zones[zone.id] && (
              <motion.div
                key={zone.id}
                className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                style={{ 
                  left: `${mapConfig.zones[zone.id].x}%`, 
                  top: `${mapConfig.zones[zone.id].y}%` 
                }}
                animate={{ scale: selectedZone === zone.id ? 1.3 : 1 }}
              >
                <div className={`flex flex-col items-center`}>
                   <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 border-white shadow-xl ${
                    selectedZone === zone.id ? 'bg-emerald-500 ring-4 ring-emerald-500/30' : 'bg-black'
                  }`}>
                    <span className="text-sm">{zone.icon}</span>
                  </div>
                  <div className="mt-1 bg-black/80 px-2 py-0.5 rounded-full border border-white/10">
                    <span className="text-[8px] font-bold text-white uppercase whitespace-nowrap">{zone.title}</span>
                  </div>
                </div>
              </motion.div>
            ))}
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
