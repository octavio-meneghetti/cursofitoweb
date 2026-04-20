import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import '@shared/theme/designSystem.css';

const DEFAULT_THEME = {
  ringColor: '#ffd700',
  ringGlow: 'rgba(255, 215, 0, 0.4)',
  ringSize: 100,
  ringSpeed: 4,
  ringBlur: 8,
  markerSize: 50,
  markerIconSize: 24,
  labelFontSize: 10,
  labelBgColor: 'rgba(0,0,0,0.9)',
  labelTextColor: '#ffffff',
  markerBgColor: 'rgba(0,0,0,0.6)'
};

const MapThemeEditor = () => {
  const navigate = useNavigate();
  const [theme, setTheme] = useState(DEFAULT_THEME);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchTheme = async () => {
      try {
        const docRef = doc(db, 'config', 'map_theme');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setTheme({ ...DEFAULT_THEME, ...docSnap.data() });
        }
      } catch (err) {
        console.error("Error cargando tema:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTheme();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, 'config', 'map_theme'), theme);
      alert("¡Diseño guardado correctamente!");
    } catch (err) {
      alert("Error al guardar: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (key, value) => {
    setTheme(prev => ({ ...prev, [key]: value }));
  };

  const [previewIcon, setPreviewIcon] = useState('🌿');

  // Inject variables for live preview
  const previewStyles = {
    '--map-ring-color': theme.ringColor,
    '--map-ring-glow': theme.ringGlow,
    '--map-ring-size': `${theme.ringSize}px`,
    '--map-ring-speed': `${theme.ringSpeed}s`,
    '--map-ring-blur': `${theme.ringBlur}px`,
    '--map-marker-size': `${theme.markerSize}px`,
    '--map-marker-icon-size': `${theme.markerIconSize}px`,
    '--map-label-font-size': `${theme.labelFontSize}px`,
    '--map-marker-bg': theme.markerBgColor,
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-dark text-emerald-500">Cargando Estilos...</div>;

  return (
    <div className="min-h-screen p-6 lg:p-10 bg-dark text-main" style={previewStyles}>
      <header className="mb-10 flex justify-between items-center">
        <div>
          <button onClick={() => navigate('/')} className="text-dim hover:text-white transition-colors mb-2 flex items-center gap-2 text-sm">
            ← Volver al Panel
          </button>
          <h1 className="text-4xl font-bold tracking-widest uppercase">Editor de Estilos del Mapa</h1>
          <p className="text-dim">Personaliza la apariencia visual de los portales y marcadores</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="px-8 py-4 bg-emerald-500 text-black font-black uppercase tracking-[0.2em] rounded-xl shadow-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
        >
          {saving ? 'Guardando...' : 'Guardar Cambios 💾'}
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* PANEL DE CONTROL */}
        <div className="glass-panel p-8 space-y-8 overflow-y-auto max-h-[70vh] custom-scrollbar">
          
          {/* SECCIÓN: AROS DORADOS */}
          <section>
            <h3 className="text-emerald-500 font-black uppercase tracking-widest mb-6 border-b border-emerald-500/20 pb-2 flex items-center gap-2">
              <span>✨</span> Aros Místicos (Portales)
            </h3>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-dim uppercase">Color Principal</label>
                <input type="color" value={theme.ringColor} onChange={(e) => handleChange('ringColor', e.target.value)} className="w-full h-10 bg-white/5 border border-white/10 rounded-lg cursor-pointer" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-dim uppercase">Resplandor (Glow)</label>
                <input type="text" value={theme.ringGlow} onChange={(e) => handleChange('ringGlow', e.target.value)} placeholder="rgba(255,215,0,0.4)" className="w-full h-10 bg-white/5 border border-white/10 rounded-lg px-3 text-sm" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-dim uppercase">Tamaño del Aro ({theme.ringSize}px)</label>
                <input type="range" min="40" max="250" value={theme.ringSize} onChange={(e) => handleChange('ringSize', parseInt(e.target.value))} className="w-full accent-emerald-500" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-dim uppercase">Velocidad Rotación ({theme.ringSpeed}s)</label>
                <input type="range" min="1" max="10" step="0.5" value={theme.ringSpeed} onChange={(e) => handleChange('ringSpeed', parseFloat(e.target.value))} className="w-full accent-emerald-500" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-dim uppercase">Difuminado / Blur ({theme.ringBlur}px)</label>
                <input type="range" min="0" max="20" value={theme.ringBlur} onChange={(e) => handleChange('ringBlur', parseInt(e.target.value))} className="w-full accent-emerald-500" />
              </div>
            </div>
          </section>

          {/* SECCIÓN: MARCADORES E ICONOS */}
          <section>
            <h3 className="text-emerald-500 font-black uppercase tracking-widest mb-6 border-b border-emerald-500/20 pb-2 flex items-center gap-2">
              <span>📍</span> Iconos y Etiquetas
            </h3>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-dim uppercase">Tamaño Marcador ({theme.markerSize}px)</label>
                <input type="range" min="20" max="100" value={theme.markerSize} onChange={(e) => handleChange('markerSize', parseInt(e.target.value))} className="w-full accent-emerald-500" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-dim uppercase">Tamaño Emoji/Icono ({theme.markerIconSize}px)</label>
                <input type="range" min="10" max="60" value={theme.markerIconSize} onChange={(e) => handleChange('markerIconSize', parseInt(e.target.value))} className="w-full accent-emerald-500" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-dim uppercase">Texto Etiqueta ({theme.labelFontSize}px)</label>
                <input type="range" min="8" max="24" value={theme.labelFontSize} onChange={(e) => handleChange('labelFontSize', parseInt(e.target.value))} className="w-full accent-emerald-500" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-dim uppercase">Fondo Etiqueta</label>
                <input type="text" value={theme.labelBgColor} onChange={(e) => handleChange('labelBgColor', e.target.value)} className="w-full h-10 bg-white/5 border border-white/10 rounded-lg px-3 text-sm" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-dim uppercase">Fondo del Icono (Círculo)</label>
                <input type="text" value={theme.markerBgColor} onChange={(e) => handleChange('markerBgColor', e.target.value)} placeholder="rgba(0,0,0,0.6)" className="w-full h-10 bg-white/5 border border-white/10 rounded-lg px-3 text-sm" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-emerald-400 uppercase">Probar con otro Icono/Emoji</label>
                <input 
                  type="text" 
                  value={previewIcon} 
                  onChange={(e) => setPreviewIcon(e.target.value)} 
                  className="w-full h-10 bg-emerald-500/10 border border-emerald-500/30 rounded-lg px-3 text-center text-xl" 
                />
              </div>
            </div>
          </section>

          {/* SECCIÓN: OPCIONES DEL SISTEMA */}
          <section>
            <h3 className="text-emerald-500 font-black uppercase tracking-widest mb-6 border-b border-emerald-500/20 pb-2 flex items-center gap-2">
              <span>⚙️</span> Sistema y Onboarding
            </h3>
            <div className="flex items-center justify-between p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl">
              <div>
                <p className="text-xs font-bold text-white uppercase tracking-widest">Saltar Video de Introducción</p>
                <p className="text-[10px] text-dim">Al activar esto, los alumnos irán directo al mapa global.</p>
              </div>
              <button 
                onClick={() => handleChange('skipIntro', !theme.skipIntro)}
                className={`w-14 h-8 rounded-full transition-all relative ${theme.skipIntro ? 'bg-emerald-500' : 'bg-white/10'}`}
              >
                <div className={`absolute top-1 w-6 h-6 rounded-full bg-white transition-all ${theme.skipIntro ? 'right-1' : 'left-1'}`} />
              </button>
            </div>
          </section>
        </div>

        {/* PREVIEW EN TIEMPO REAL */}
        <div className="glass-panel p-8 flex flex-col items-center justify-center relative overflow-hidden min-h-[400px]">
          <div className="absolute inset-0 bg-[url('/world_map_v.png')] bg-cover bg-center opacity-20 blur-sm" />
          <h3 className="absolute top-6 left-6 text-xs font-black uppercase tracking-[0.3em] text-emerald-500 bg-emerald-500/10 px-4 py-1 rounded-full">Vista Previa Directa</h3>
          
          {/* EL MARCADOR DE PREVIEW ACTUAL */}
          <div className="relative flex flex-col items-center">
            {/* PORTAL RING PREVIEW */}
            <div className="portal-ring">
              <div className="portal-ring-outer" />
              <div className="portal-ring-core" />
            </div>

            {/* Marcador Visual */}
            <div 
              className="rounded-full flex items-center justify-center border-2 border-white shadow-2xl z-20 transition-all"
              style={{ 
                width: `${theme.markerSize}px`, 
                height: `${theme.markerSize}px`,
                backgroundColor: theme.markerBgColor
              }}
            >
              <span style={{ fontSize: `${theme.markerIconSize}px` }}>{previewIcon}</span>
            </div>
            
            <div 
              className="mt-3 px-4 py-1 rounded-full border border-white/20 z-20 shadow-xl"
              style={{ 
                backgroundColor: theme.labelBgColor,
                color: theme.labelTextColor
              }}
            >
              <p 
                className="font-black uppercase tracking-tighter whitespace-nowrap"
                style={{ fontSize: `${theme.labelFontSize}px` }}
              >
                EJEMPLO DE BOSQUE
              </p>
            </div>
          </div>

          <div className="absolute bottom-6 text-center">
            <p className="text-[10px] text-white/30 uppercase tracking-widest">Los cambios se aplican globalmente<br/>al guardar</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapThemeEditor;
