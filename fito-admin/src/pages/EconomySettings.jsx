import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { motion } from 'framer-motion';

const EconomySettings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState({
    // ATP / Energía
    max_energy: 5,
    hours_per_refill: 4,
    cost_new_lesson: 1,
    cost_fail_lesson: 1,
    practice_refill: 1,
    
    // Gotas de Agua
    drops_perfect: 5,
    drops_complete: 2,
    drops_block_bonus: 20,
    drops_streak_bonus: 1,
    
    // Compost
    compost_per_error: 1,
    compost_yield_multiplier: 2,
    
    // Soles
    sun_streak_threshold: 5, // Días de racha para empezar a ganar soles
    sun_per_streak_milestone: 2,
    sun_cost_instant_harvest: 10,
    
    // La Quinta
    base_growth_time_hours: 48,
    watering_cost_drops: 10
  });

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const docSnap = await getDoc(doc(db, 'config', 'economy'));
      if (docSnap.exists()) {
        setConfig({ ...config, ...docSnap.data() });
      }
    } catch (err) {
      console.error("Error fetching economy config:", err);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, 'config', 'economy'), config);
      alert("¡Configuración de Economía guardada con éxito!");
    } catch (err) {
      console.error("Error saving config:", err);
      alert("Error al guardar.");
    }
    setSaving(false);
  };

  if (loading) return <div className="p-20 text-white animate-pulse uppercase tracking-widest text-center">Sincronizando Mercados...</div>;

  const InputGroup = ({ label, value, onChange, type = "number", suffix = "" }) => (
    <div className="bg-white/5 border border-white/10 p-4 rounded-2xl flex flex-col gap-2">
      <label className="text-[9px] uppercase font-black text-white/40 tracking-widest">{label}</label>
      <div className="flex items-center gap-3">
        <input 
          type={type} 
          value={value} 
          onChange={(e) => onChange(type === "number" ? parseFloat(e.target.value) : e.target.value)}
          className="bg-black/40 border border-white/5 rounded-lg px-3 py-2 text-white font-mono text-sm w-full outline-none focus:border-emerald-500 transition-colors"
        />
        {suffix && <span className="text-[10px] font-black text-white/20 uppercase">{suffix}</span>}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen p-8 md:p-16 bg-[#050505] text-white font-sans selection:bg-emerald-500/30 pb-32">
      <header className="mb-16 max-w-5xl mx-auto flex justify-between items-end">
        <div>
          <h1 className="text-5xl font-black uppercase tracking-tighter mb-2">Central de Economía</h1>
          <p className="text-white/20 text-xs uppercase tracking-[0.4em] font-bold">Calibra el flujo de energía y recursos de FitoWeb</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="px-8 py-4 bg-emerald-500 text-black font-black uppercase tracking-widest text-[10px] rounded-xl hover:bg-emerald-400 transition-all active:scale-95 disabled:opacity-50 shadow-[0_0_40px_rgba(16,185,129,0.3)]"
        >
          {saving ? 'GUARDANDO...' : 'GUARDAR CONFIGURACIÓN'}
        </button>
      </header>

      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        
        {/* ENERGIA */}
        <section className="space-y-4">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-2xl">🔋</span>
            <h2 className="text-lg font-black uppercase tracking-tight">Energía Vital (ATP)</h2>
          </div>
          <InputGroup label="Capacidad Máxima" value={config.max_energy} onChange={v => setConfig({...config, max_energy: v})} suffix="Cargas" />
          <InputGroup label="Recarga por Tiempo" value={config.hours_per_refill} onChange={v => setConfig({...config, hours_per_refill: v})} suffix="Horas / Punto" />
          <InputGroup label="Costo Lección Nueva" value={config.cost_new_lesson} onChange={v => setConfig({...config, cost_new_lesson: v})} suffix="Puntos" />
          <InputGroup label="Recarga por Práctica" value={config.practice_refill} onChange={v => setConfig({...config, practice_refill: v})} suffix="Puntos" />
        </section>

        {/* AGUA */}
        <section className="space-y-4">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-2xl">💧</span>
            <h2 className="text-lg font-black uppercase tracking-tight">Gotas de Agua</h2>
          </div>
          <InputGroup label="Premio Perfecto (100%)" value={config.drops_perfect} onChange={v => setConfig({...config, drops_perfect: v})} suffix="Gotas" />
          <InputGroup label="Premio Completar" value={config.drops_complete} onChange={v => setConfig({...config, drops_complete: v})} suffix="Gotas" />
          <InputGroup label="Bono por Bloque" value={config.drops_block_bonus} onChange={v => setConfig({...config, drops_block_bonus: v})} suffix="Gotas" />
          <InputGroup label="Bono por Racha Diaria" value={config.drops_streak_bonus} onChange={v => setConfig({...config, drops_streak_bonus: v})} suffix="Gotas" />
        </section>

        {/* COMPOST & SOLES */}
        <section className="space-y-4">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-2xl">☀️</span>
            <h2 className="text-lg font-black uppercase tracking-tight">Meta-Juego</h2>
          </div>
          <div className="p-6 bg-white/5 border border-white/10 rounded-3xl space-y-6">
            <h3 className="text-[10px] font-black text-white/20 uppercase tracking-widest border-b border-white/5 pb-2">Compost (El Error)</h3>
            <InputGroup label="Abono por Fallo" value={config.compost_per_error} onChange={v => setConfig({...config, compost_per_error: v})} suffix="Unidades" />
            <InputGroup label="Multiplicador Cosecha" value={config.compost_yield_multiplier} onChange={v => setConfig({...config, compost_yield_multiplier: v})} suffix="X" />
            
            <h3 className="text-[10px] font-black text-white/20 uppercase tracking-widest border-b border-white/5 pb-2 pt-4">Soles (Acelerador)</h3>
            <InputGroup label="Soles por Hito de Racha" value={config.sun_per_streak_milestone} onChange={v => setConfig({...config, sun_per_streak_milestone: v})} suffix="Soles" />
            <InputGroup label="Costo Cosecha Instantánea" value={config.sun_cost_instant_harvest} onChange={v => setConfig({...config, sun_cost_instant_harvest: v})} suffix="Soles" />
          </div>
        </section>

      </div>
    </div>
  );
};

export default EconomySettings;
