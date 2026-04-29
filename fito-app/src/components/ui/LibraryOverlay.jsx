import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '../../lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

/**
 * LibraryOverlay (Student): La Biblioteca del Santuario.
 * Muestra los recursos multimedia y gestiona los bloqueos por medalla.
 */

const LibraryOverlay = ({ isOpen, onClose, userMedals = [] }) => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (isOpen) fetchResources();
  }, [isOpen]);

  const fetchResources = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, 'library'));
      const list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setResources(list);
    } catch (err) {
      console.error("Error fetching library:", err);
    }
    setLoading(false);
  };

  const filteredResources = resources.filter(res => {
    if (filter === 'all') return true;
    return res.type === filter;
  });

  if (!isOpen) return null;

  return (
      <motion.div 
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="fixed inset-0 z-[100] bg-[#050505] flex flex-col overflow-hidden"
      >
        {/* Header Estilo Pantalla */}
        <div className="p-6 md:p-10 bg-black/40 border-b border-white/5 flex items-center gap-8">
            <button 
                onClick={onClose} 
                className="group flex items-center gap-3 px-6 py-3 bg-white/5 border border-white/10 rounded-2xl text-white hover:bg-white/10 transition-all"
            >
                <span className="text-xl group-hover:-translate-x-1 transition-transform">←</span>
                <span className="text-[10px] font-black uppercase tracking-widest">Regresar</span>
            </button>

            <div>
                <h2 className="text-3xl font-black text-white uppercase tracking-tighter leading-none mb-1">Baúl de Saberes</h2>
                <p className="text-white/30 text-[9px] uppercase tracking-[0.3em] font-bold">Biblioteca Multimedia del Santuario</p>
            </div>

            <div className="hidden lg:flex bg-white/5 p-1 rounded-2xl border border-white/5 ml-auto">
                {['all', 'pdf', 'image', 'audio', 'video'].map(f => (
                    <button 
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === f ? 'bg-purple-500 text-white shadow-lg' : 'text-white/30 hover:text-white'}`}
                    >
                        {f === 'all' ? 'Todos' : f}
                    </button>
                ))}
            </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
            {loading ? (
                <div className="h-full flex items-center justify-center">
                    <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredResources.map(res => {
                        const isLocked = res.requiredMedal && !userMedals.includes(res.requiredMedal);
                        
                        return (
                            <motion.div 
                                layout
                                key={res.id}
                                className={`group relative p-6 rounded-[2rem] border transition-all ${isLocked ? 'bg-black/40 border-white/5 opacity-50' : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-purple-500/30'}`}
                            >
                                <div className="flex items-center gap-5 mb-6">
                                    <div className="w-16 h-16 rounded-[1.5rem] bg-black/40 flex items-center justify-center text-3xl border border-white/5 shadow-inner">
                                        {res.type === 'pdf' ? '📄' : res.type === 'image' ? '🖼️' : res.type === 'audio' ? '🎧' : '🎬'}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-black text-white text-sm uppercase tracking-tight leading-tight mb-1">{res.title}</h3>
                                        <p className="text-[10px] text-white/30 uppercase font-bold">{res.type}</p>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between mt-auto">
                                    {isLocked ? (
                                        <div className="flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-xl">
                                            <span className="text-xs">🔒</span>
                                            <span className="text-[9px] font-black text-red-400 uppercase tracking-widest">Requiere: {res.requiredMedal}</span>
                                        </div>
                                    ) : (
                                        <a 
                                            href={res.url} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="w-full py-4 bg-purple-500 text-white text-center font-black uppercase text-[10px] tracking-widest rounded-2xl shadow-lg shadow-purple-500/20 hover:bg-purple-400 transition-all active:scale-95"
                                        >
                                            Abrir Archivo
                                        </a>
                                    )}
                                </div>

                                {isLocked && (
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 rounded-[2rem] backdrop-blur-[2px]">
                                        <p className="text-[10px] font-black text-white uppercase tracking-[0.2em] px-6 text-center">
                                            Gana la medalla <span className="text-emerald-400">{res.requiredMedal}</span> para desbloquear este saber
                                        </p>
                                    </div>
                                )}
                            </motion.div>
                        );
                    })}
                </div>
            )}

            {!loading && filteredResources.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-20">
                    <span className="text-6xl mb-4">📖</span>
                    <p className="font-black uppercase tracking-[0.3em] text-xs">No hay manuscritos en esta sección</p>
                </div>
            )}
        </div>
      </motion.div>
  );
};

export default LibraryOverlay;
