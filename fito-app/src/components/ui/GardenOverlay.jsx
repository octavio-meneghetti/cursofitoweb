import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '../../lib/firebase';
import { doc, getDoc, updateDoc, setDoc, Timestamp } from 'firebase/firestore';

const PLANTS = {
  romero: { id: 'romero', name: 'Romero', icon: '🌿', duration: 24 * 60 * 60 * 1000, waterCost: 5, reward: { water: 15 }, color: '#10b981' },
  valeriana: { id: 'valeriana', name: 'Valeriana', icon: '🌸', duration: 48 * 60 * 60 * 1000, waterCost: 10, reward: { energy: 3 }, color: '#a855f7' },
  lavanda: { id: 'lavanda', name: 'Lavanda', icon: '🪻', duration: 72 * 60 * 60 * 1000, waterCost: 20, reward: { suns: 2 }, color: '#3b82f6' }
};

const GardenOverlay = ({ isOpen, onClose, user, economy, onUpdateEconomy }) => {
  const [garden, setGarden] = useState({ slots: Array(6).fill(null).map((_, i) => ({ id: i, plant: null })) });
  const [loading, setLoading] = useState(true);
  const [selectedSlot, setSelectedSlot] = useState(null);

  useEffect(() => {
    if (isOpen && user) fetchGarden();
  }, [isOpen, user]);

  const fetchGarden = async () => {
    setLoading(true);
    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists() && userDoc.data().garden) {
        setGarden(userDoc.data().garden);
      }
    } catch (err) {
      console.error("Error fetching garden:", err);
    }
    setLoading(false);
  };

  const saveGarden = async (newGarden) => {
    setGarden(newGarden);
    try {
      await setDoc(doc(db, 'users', user.uid), { garden: newGarden }, { merge: true });
    } catch (err) {
      console.error("Error saving garden:", err);
    }
  };

  const handlePlant = async (plantId) => {
    if (!selectedSlot && selectedSlot !== 0) return;
    const plant = PLANTS[plantId];
    if (economy.water < plant.waterCost) return alert("No tienes suficiente agua.");

    // Descontar agua
    await onUpdateEconomy({ water: -plant.waterCost });

    const newSlots = [...garden.slots];
    newSlots[selectedSlot] = {
      ...newSlots[selectedSlot],
      plantId: plantId,
      plantedAt: Timestamp.now(),
      isComposted: false
    };

    await saveGarden({ ...garden, slots: newSlots });
    setSelectedSlot(null);
  };

  const handleCompost = async (slotId) => {
    if (economy.compost < 1) return alert("No tienes compost.");
    
    await onUpdateEconomy({ compost: -1 });

    const newSlots = [...garden.slots];
    newSlots[slotId].isComposted = true;
    await saveGarden({ ...garden, slots: newSlots });
  };

  const handleHarvest = async (slotId) => {
    const slot = garden.slots[slotId];
    const plant = PLANTS[slot.plantId];
    
    let rewards = { ...plant.reward };
    if (slot.isComposted) {
      // Duplicar recompensas
      Object.keys(rewards).forEach(k => rewards[k] *= 2);
    }

    await onUpdateEconomy(rewards);

    const newSlots = [...garden.slots];
    newSlots[slotId] = { id: slotId, plantId: null };
    await saveGarden({ ...garden, slots: newSlots });
    alert("¡Cosecha exitosa!");
  };

  const handleUseSun = async (slotId) => {
    if (economy.suns < 1) return alert("No tienes soles.");
    
    await onUpdateEconomy({ suns: -1 });

    const newSlots = [...garden.slots];
    // Reducir tiempo a la mitad (o simplemente terminarlo para MVP)
    newSlots[slotId].plantedAt = Timestamp.fromMillis(newSlots[slotId].plantedAt.toMillis() - (PLANTS[newSlots[slotId].plantId].duration / 2));
    await saveGarden({ ...garden, slots: newSlots });
  };

  if (!isOpen) return null;

  return (
    <motion.div 
      initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
      className="fixed inset-0 z-[200] bg-[#05070a] flex flex-col overflow-hidden"
    >
      {/* Header */}
      <div className="p-8 bg-black/40 border-b border-white/5 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-white uppercase tracking-tighter">La Quinta</h2>
          <p className="text-emerald-500/60 text-[10px] uppercase tracking-[0.3em] font-black">Cultiva medicina, nutre tu alma</p>
        </div>
        <button onClick={onClose} className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white">✕</button>
      </div>

      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
        {loading ? (
          <div className="h-full flex items-center justify-center font-black text-emerald-500 animate-pulse uppercase tracking-widest">Sintonizando Frecuencia de Crecimiento...</div>
        ) : (
          <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-3 gap-6">
            {garden.slots.map((slot, idx) => (
              <SlotCard 
                key={idx} 
                slot={slot} 
                onSelect={() => setSelectedSlot(idx)}
                onHarvest={() => handleHarvest(idx)}
                onCompost={() => handleCompost(idx)}
                onUseSun={() => handleUseSun(idx)}
                economy={economy}
              />
            ))}
          </div>
        )}
      </div>

      {/* Selector de Plantas (Modal inferior) */}
      <AnimatePresence>
        {(selectedSlot || selectedSlot === 0) && (
          <motion.div 
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            className="fixed inset-x-0 bottom-0 z-[210] bg-[#0c0c12] border-t border-white/10 p-8 rounded-t-[3rem] shadow-[0_-20px_50px_rgba(0,0,0,0.5)]"
          >
            <div className="max-w-xl mx-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-black text-white uppercase">Sembrar en Parcela {selectedSlot + 1}</h3>
                <button onClick={() => setSelectedSlot(null)} className="text-white/20 hover:text-white">Cerrar</button>
              </div>
              <div className="grid grid-cols-1 gap-4">
                {Object.values(PLANTS).map(p => (
                  <button 
                    key={p.id}
                    onClick={() => handlePlant(p.id)}
                    className="group bg-white/5 border border-white/5 p-5 rounded-3xl flex items-center gap-6 hover:bg-white/10 hover:border-emerald-500/30 transition-all"
                  >
                    <div className="w-16 h-16 bg-black/40 rounded-2xl flex items-center justify-center text-3xl shadow-inner group-hover:scale-110 transition-transform">{p.icon}</div>
                    <div className="flex-1 text-left">
                      <h4 className="font-black text-white text-lg leading-none mb-1">{p.name}</h4>
                      <p className="text-[10px] text-white/30 uppercase font-bold">Crecimiento: {p.duration / (3600000)}h</p>
                    </div>
                    <div className="text-right">
                      <div className="bg-blue-500/20 px-3 py-1.5 rounded-xl border border-blue-500/30 flex items-center gap-2">
                        <span className="text-[10px] font-black text-blue-400">💧 {p.waterCost}</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const SlotCard = ({ slot, onSelect, onHarvest, onCompost, onUseSun, economy }) => {
  const [timeLeft, setTimeLeft] = useState(0);
  const plant = slot.plantId ? PLANTS[slot.plantId] : null;

  useEffect(() => {
    if (!plant) return;
    const interval = setInterval(() => {
      const now = Date.now();
      const plantedAt = slot.plantedAt.toMillis();
      const elapsed = now - plantedAt;
      const remaining = Math.max(0, plant.duration - elapsed);
      setTimeLeft(remaining);
    }, 1000);
    return () => clearInterval(interval);
  }, [slot.plantId, slot.plantedAt]);

  const isReady = plant && timeLeft === 0;
  const progress = plant ? Math.min(100, ((plant.duration - timeLeft) / plant.duration) * 100) : 0;

  return (
    <div className={`aspect-square rounded-[2.5rem] border transition-all flex flex-col p-6 relative overflow-hidden ${plant ? 'bg-white/5 border-white/10' : 'bg-black/20 border-dashed border-2 border-white/5 hover:bg-white/5 hover:border-white/10 cursor-pointer'}`} onClick={!plant ? onSelect : undefined}>
      {!plant ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-4 opacity-30 group">
          <span className="text-4xl group-hover:scale-110 transition-transform">🌱</span>
          <p className="text-[10px] font-black uppercase tracking-widest">Parcela Vacía</p>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-start mb-4">
            <div className="w-14 h-14 bg-black/40 rounded-2xl flex items-center justify-center text-3xl shadow-inner relative">
                {plant.icon}
                {slot.isComposted && <span className="absolute -top-2 -right-2 text-sm bg-purple-500 rounded-full w-6 h-6 flex items-center justify-center shadow-lg shadow-purple-500/40">🪱</span>}
            </div>
            <div className="text-right">
              <h4 className="font-black text-white text-[12px] uppercase leading-none mb-1">{plant.name}</h4>
              <p className={`text-[9px] font-black uppercase ${isReady ? 'text-emerald-400' : 'text-white/20'}`}>{isReady ? '¡LISTO!' : `${Math.floor(timeLeft / 3600000)}h ${Math.floor((timeLeft % 3600000) / 60000)}m`}</p>
            </div>
          </div>

          <div className="flex-1 flex items-center justify-center py-4">
              <div className="relative w-full h-2 bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                    initial={{ width: 0 }} 
                    animate={{ width: `${progress}%` }} 
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-500 to-teal-400 shadow-[0_0_10px_rgba(16,185,129,0.5)]" 
                />
              </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {isReady ? (
              <button onClick={onHarvest} className="col-span-2 py-3 bg-emerald-500 text-black font-black uppercase text-[10px] rounded-xl shadow-lg shadow-emerald-500/20 active:scale-95 transition-all">Cosechar</button>
            ) : (
              <>
                <button 
                    disabled={slot.isComposted || economy.compost < 1}
                    onClick={onCompost} 
                    className={`py-2 rounded-xl border text-[9px] font-black uppercase tracking-widest transition-all ${slot.isComposted ? 'bg-purple-500/20 border-purple-500/40 text-purple-400' : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10 hover:text-white'}`}
                >
                    {slot.isComposted ? 'Abonado' : 'Abonar'}
                </button>
                <button 
                    onClick={onUseSun} 
                    className="py-2 bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-yellow-500/20 transition-all"
                >
                    Sol
                </button>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default GardenOverlay;
