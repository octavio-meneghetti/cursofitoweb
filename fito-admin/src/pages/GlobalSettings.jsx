import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, storage } from '../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import '@shared/theme/designSystem.css';

const GlobalSettings = () => {
  const navigate = useNavigate();
  const [config, setConfig] = useState({
    skipIntro: false,
    introVideoUrl: 'https://firebasestorage.googleapis.com/v0/b/cursofitoweb.firebasestorage.app/o/Introcursoweb.mp4?alt=media&token=b0078a71-af2a-41d2-9336-caec5dd7eb05'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const docRef = doc(db, 'config', 'map_theme');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setConfig(prev => ({
            ...prev,
            ...data
          }));
        }
      } catch (err) {
        console.error("Error cargando config:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchConfig();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      // Guardamos en map_theme por compatibilidad
      await setDoc(doc(db, 'config', 'map_theme'), config, { merge: true });
      alert("¡Configuración guardada correctamente!");
    } catch (err) {
      alert("Error al guardar: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleVideoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.includes('video')) return alert("Por favor selecciona un archivo de video (MP4)");

    setUploading(true);
    try {
      const storageRef = ref(storage, `system/intro_video_${Date.now()}.mp4`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      setConfig(prev => ({ ...prev, introVideoUrl: url }));
      alert("¡Video subido con éxito!");
    } catch (err) {
      console.error(err);
      alert("Error al subir el video.");
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-dark text-emerald-500">Cargando Configuración...</div>;

  return (
    <div className="min-h-screen p-10 bg-[#060608] text-white">
      <header className="mb-12 flex justify-between items-center">
        <div>
          <button onClick={() => navigate('/')} className="text-dim hover:text-white transition-colors mb-2 flex items-center gap-2 text-sm">
            ← Volver al Panel
          </button>
          <h1 className="text-4xl font-black tracking-widest uppercase italic">Configuración Global</h1>
          <p className="text-dim uppercase text-[10px] tracking-[0.3em] mt-1">Ajustes maestros del sistema y onboarding</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="px-10 py-4 bg-emerald-500 text-black font-black uppercase tracking-[0.2em] rounded-2xl shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
        >
          {saving ? 'Guardando...' : 'Guardar Todo 💾'}
        </button>
      </header>

      <div className="max-w-4xl space-y-10">
        
        {/* SECCIÓN: VIDEO DE INICIO */}
        <section className="glass-panel p-8 space-y-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-3xl -mr-16 -mt-16" />
          
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-black uppercase tracking-tight mb-1">Cinemática de Introducción</h3>
              <p className="text-xs text-dim italic">Gestiona el video que ven los alumnos al entrar por primera vez.</p>
            </div>
            
            <div className="flex bg-white/5 p-1.5 rounded-2xl border border-white/10 w-fit">
                <button 
                  onClick={() => setConfig(prev => ({ ...prev, skipIntro: false }))}
                  className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500 ${
                    !config.skipIntro 
                      ? 'bg-emerald-500 text-black shadow-[0_0_20px_rgba(16,185,129,0.4)] scale-105' 
                      : 'text-white/30 hover:text-white/60 hover:bg-white/5'
                  }`}
                >
                  Activado
                </button>
                <button 
                  onClick={() => setConfig(prev => ({ ...prev, skipIntro: true }))}
                  className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500 ${
                    config.skipIntro 
                      ? 'bg-amber-500 text-black shadow-[0_0_20px_rgba(245,158,11,0.4)] scale-105' 
                      : 'text-white/30 hover:text-white/60 hover:bg-white/5'
                  }`}
                >
                  Desactivado
                </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-4">
             <div className="space-y-4">
                <label className="block">
                  <span className="text-[10px] uppercase font-black tracking-widest text-emerald-500/60 block mb-2">Archivo de Video (MP4)</span>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={config.introVideoUrl}
                      onChange={(e) => setConfig(prev => ({ ...prev, introVideoUrl: e.target.value }))}
                      className="flex-1 bg-white/5 border border-white/10 p-4 rounded-2xl text-xs text-white/60 focus:border-emerald-500 transition-all outline-none"
                    />
                    <label className={`cursor-pointer px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 transition-all ${uploading ? 'bg-white/5 text-white/20' : 'bg-blue-600 hover:bg-blue-500 text-white shadow-xl'}`}>
                      {uploading ? '...' : 'Subir'}
                      <input type="file" accept="video/mp4" className="hidden" onChange={handleVideoUpload} disabled={uploading} />
                    </label>
                  </div>
                </label>
                
                <div className="p-5 rounded-3xl bg-amber-500/5 border border-amber-500/20">
                    <p className="text-[10px] text-amber-500/80 leading-relaxed">
                        <span className="font-black mr-2">⚠️ NOTA:</span>
                        El video de introducción es una experiencia inmersiva de 20MB. Recomendamos no cambiarlo a menos que sea estrictamente necesario para mantener la coherencia narrativa.
                    </p>
                </div>
             </div>

             <div className="rounded-[2.5rem] overflow-hidden border border-white/10 aspect-video bg-black shadow-2xl relative group">
                <video 
                    src={config.introVideoUrl} 
                    className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" 
                    controls 
                />
                {!config.introVideoUrl && (
                    <div className="absolute inset-0 flex items-center justify-center text-white/20 text-sm italic">Sin video cargado</div>
                )}
             </div>
          </div>
        </section>

        {/* MÁS AJUSTES FUTUROS AQUÍ */}
        <div className="p-10 border-2 border-dashed border-white/5 rounded-[3rem] text-center">
            <p className="text-white/10 font-black uppercase tracking-[0.4em] text-xs">Ajustes Adicionales Próximamente</p>
        </div>

      </div>
    </div>
  );
};

export default GlobalSettings;
