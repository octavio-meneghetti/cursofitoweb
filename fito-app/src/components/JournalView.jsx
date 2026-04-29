import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { journalService } from '../lib/journalService';

const JournalView = ({ userId, onBack }) => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef(null);

  useEffect(() => {
    const fetchEntries = async () => {
      const data = await journalService.getAllEntries(userId);
      setEntries(data);
      setLoading(false);
    };
    fetchEntries();
  }, [userId]);

  // Autoscroll al final cuando cargan las entradas
  useEffect(() => {
    if (!loading && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [loading, entries]);

  return (
    <div className="flex flex-col min-h-screen bg-[#020403] text-white font-sans relative overflow-hidden">
      
      {/* Background Ambience */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-emerald-500/5 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] opacity-20 pointer-events-none" />

      {/* Top Header Navigation */}
      <header className="px-6 py-8 flex items-center justify-between relative z-50 backdrop-blur-xl bg-black/40 border-b border-white/5">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="w-10 h-10 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-emerald-400"
          >
            ←
          </button>
          <div>
            <h1 className="text-sm font-black uppercase tracking-[0.2em] text-white leading-none">Cuaderno</h1>
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500/60">Bitácora de Campo</span>
          </div>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
          <span className="text-[9px] font-black uppercase text-emerald-400 tracking-widest">Sincronizado</span>
        </div>
      </header>

      {/* Main Timeline Area */}
      <main 
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-6 py-10 relative z-10 custom-scrollbar scroll-smooth"
      >
        {loading ? (
          <div className="flex flex-col items-center justify-center py-40 gap-4">
            <div className="w-10 h-10 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-40 opacity-20">
            <span className="text-6xl block mb-4">📖</span>
            <p className="text-xs uppercase font-black tracking-widest">Tu historia comienza aquí</p>
          </div>
        ) : (
          <div className="relative space-y-16">
            {/* Vertical Timeline Line */}
            <div className="absolute left-3 top-2 bottom-2 w-px bg-gradient-to-b from-transparent via-emerald-500/20 to-transparent" />

            {entries.map((entry, index) => {
              const dateObj = entry.createdAt?.toDate ? entry.createdAt.toDate() : (entry.lastUpdated?.toDate ? entry.lastUpdated.toDate() : new Date());
              const timeStr = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              const dateStr = dateObj.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });

              return (
                <motion.div 
                  key={entry.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="relative pl-10"
                >
                  {/* Timeline Dot with Glow */}
                  <div className="absolute left-[7px] top-1.5 w-3 h-3 bg-emerald-500 rounded-full -translate-x-1/2 z-10 shadow-[0_0_15px_#10b981]" />
                  <div className="absolute left-[7px] top-1.5 w-8 h-8 bg-emerald-500/10 rounded-full -translate-x-1/2 -translate-y-1/4 animate-pulse" />

                  {/* Date & Time Badge */}
                  <div className="flex items-center gap-3 mb-6 bg-white/5 w-fit px-4 py-1.5 rounded-full border border-white/5">
                    <span className="text-[10px] font-black uppercase text-emerald-400 tracking-widest">{dateStr}</span>
                    <div className="w-px h-3 bg-white/10" />
                    <span className="text-[10px] font-black text-white/40 tracking-widest">{timeStr}</span>
                  </div>

                  {/* Enhanced Content Card */}
                  <motion.div 
                    whileHover={{ scale: 1.01 }}
                    className="bg-gradient-to-br from-white/[0.07] to-transparent rounded-[2.5rem] border border-white/10 p-8 shadow-[0_20px_50px_rgba(0,0,0,0.4)] backdrop-blur-md relative overflow-hidden group"
                  >
                    {/* Decorative accent */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-emerald-500/10 transition-colors" />

                    {/* ENTRY CONTENT: JOURNAL */}
                    {entry.data?.isJournalEntry && entry.data?.journalData && (
                      <div className="space-y-8">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-emerald-500/20 rounded-2xl flex items-center justify-center text-xl shadow-inner">📝</div>
                            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-emerald-300">{entry.data.journalData.title}</h3>
                          </div>
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/40" />
                        </div>
                        
                        <div className="space-y-10">
                          {entry.data.journalData.entries.map((q, i) => (
                            <div key={i} className="relative">
                              <p className="text-[8px] uppercase font-black text-white/30 tracking-[0.3em] mb-3 block">
                                {q.question}
                              </p>
                              <div className="bg-black/20 rounded-2xl p-5 border border-white/[0.03]">
                                <p className="text-[15px] text-white/90 font-serif leading-relaxed italic pr-4">
                                  {q.answer ? q.answer : <span className="opacity-10">Sin respuesta registrada...</span>}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* ENTRY CONTENT: DECISION */}
                    {entry.data?.decision && (
                      <div className="flex flex-col gap-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-400 shadow-inner">⚖️</div>
                          <span className="text-[8px] font-black uppercase tracking-[0.3em] text-white/40">Elección de Camino</span>
                        </div>
                        
                        <div className="flex items-center gap-5 bg-emerald-500/5 p-6 rounded-[2rem] border border-emerald-500/10">
                          <div className="w-16 h-16 bg-emerald-500 rounded-3xl flex items-center justify-center text-3xl shadow-[0_10px_20px_rgba(16,185,129,0.3)] shrink-0">
                            {entry.data.choiceIcon || '🌿'}
                          </div>
                          <div>
                            <h3 className="text-lg font-black text-white uppercase tracking-tight leading-tight">
                              {entry.data.choiceLabel || 'Opción seleccionada'}
                            </h3>
                            <p className="text-[9px] font-bold text-emerald-500/60 uppercase tracking-widest mt-1">Preferida en este momento</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>
      
      {/* Footer safe area */}
      <div className="h-10 bg-black/40 backdrop-blur-md border-t border-white/5 shrink-0" />
    </div>
  );
};

export default JournalView;
