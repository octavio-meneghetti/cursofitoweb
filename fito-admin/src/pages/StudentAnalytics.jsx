import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../lib/firebase';
import { collection, getDocs, query, orderBy, limit, doc, getDoc } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';

const StudentAnalytics = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [errorLogs, setErrorLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentDetails, setStudentDetails] = useState({ mastery: [], journal: [] });
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    fetchGlobalData();
  }, []);

  const fetchGlobalData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Students
      const usersSnap = await getDocs(collection(db, 'users'));
      const usersList = usersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setStudents(usersList);

      // 2. Fetch Recent Errors
      const errorsSnap = await getDocs(query(collection(db, 'logs_errors'), orderBy('timestamp', 'desc'), limit(20)));
      setErrorLogs(errorsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

    } catch (err) {
      console.error("Error fetching analytics data:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentDetails = async (student) => {
    setLoadingDetails(true);
    setSelectedStudent(student);
    try {
      // Mastery
      const masterySnap = await getDocs(collection(db, 'users', student.id, 'mastery'));
      const masteryList = masterySnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Journal
      const journalSnap = await getDocs(collection(db, 'users', student.id, 'journal'));
      const journalList = journalSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      // Sort journal by date
      journalList.sort((a, b) => {
        const tA = a.createdAt?.toDate?.()?.getTime() || a.lastUpdated?.toDate?.()?.getTime() || 0;
        const tB = b.createdAt?.toDate?.()?.getTime() || b.lastUpdated?.toDate?.()?.getTime() || 0;
        return tB - tA; // Newest first for admin review
      });

      setStudentDetails({ mastery: masteryList, journal: journalList });
    } catch (err) {
      console.error("Error fetching student details:", err);
    } finally {
      setLoadingDetails(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white p-8 font-sans">
      {/* Header */}
      <header className="mb-12 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/')} className="p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors">←</button>
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tighter">Analíticas <span className="text-blue-500">de Alumnos</span></h1>
            <p className="text-white/40 text-xs uppercase tracking-widest mt-1">Monitoreo de nexos y bitácoras en tiempo real</p>
          </div>
        </div>
        <div className="flex gap-8">
            <div className="text-right">
                <span className="block text-[10px] uppercase font-black text-white/30">Total Alumnos</span>
                <span className="text-2xl font-black">{students.length}</span>
            </div>
            <div className="text-right">
                <span className="block text-[10px] uppercase font-black text-white/30">Alertas Críticas</span>
                <span className="text-2xl font-black text-red-500">{errorLogs.length}</span>
            </div>
        </div>
      </header>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-40">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
          <span className="text-[10px] font-black uppercase tracking-widest animate-pulse">Sincronizando Aula...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main List: Students */}
          <section className="lg:col-span-2 space-y-6">
            <h2 className="text-xs font-black uppercase tracking-[0.3em] text-white/20 mb-4">Registro de Estudiantes</h2>
            <div className="grid gap-4">
              {students.map(student => (
                <motion.div 
                  key={student.id}
                  whileHover={{ x: 5 }}
                  onClick={() => fetchStudentDetails(student)}
                  className={`p-6 rounded-[2rem] border transition-all cursor-pointer flex items-center justify-between ${
                    selectedStudent?.id === student.id 
                    ? 'bg-blue-600/20 border-blue-500/50 shadow-[0_0_30px_rgba(59,130,246,0.1)]' 
                    : 'bg-white/5 border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-gradient-to-br from-white/10 to-transparent rounded-2xl flex items-center justify-center text-2xl border border-white/5">
                        👤
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{student.email || student.id.substring(0, 8)}</h3>
                      <div className="flex gap-4 mt-1">
                        <span className="text-[10px] font-black text-emerald-400 uppercase">🔋 {student.economy?.energy?.current || 0} ATP</span>
                        <span className="text-[10px] font-black text-amber-400 uppercase">☀️ {student.economy?.suns || 0} Soles</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                     <span className="text-[9px] font-black text-white/20 uppercase tracking-widest block mb-1">Última Actividad</span>
                     <span className="text-xs font-bold text-white/60">Reciente</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Right Sidebar: Global Errors & Details */}
          <aside className="space-y-8">
            
            {/* Recent Errors Log */}
            <div className="glass-panel p-8 bg-red-500/5 border-red-500/20 rounded-[2.5rem]">
              <h2 className="text-xs font-black uppercase tracking-[0.3em] text-red-400/60 mb-6">Alertas de Aprendizaje</h2>
              <div className="space-y-4">
                {errorLogs.length === 0 ? (
                  <p className="text-xs text-white/20 italic">No hay alertas recientes.</p>
                ) : (
                  errorLogs.map(log => (
                    <div key={log.id} className="p-4 bg-black/40 rounded-2xl border border-white/5 text-[11px]">
                      <div className="flex justify-between mb-1">
                        <span className="font-black text-red-400 uppercase tracking-tighter">{log.conceptId}</span>
                        <span className="text-white/20">{log.timestamp?.toDate?.().toLocaleTimeString() || '...'}</span>
                      </div>
                      <p className="text-white/60 italic">Error en: {log.metadata?.selectedAnswer || 'Desconocido'}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Quick Stats Summary */}
            <div className="glass-panel p-8 bg-blue-500/5 border-blue-500/20 rounded-[2.5rem]">
                <h2 className="text-xs font-black uppercase tracking-[0.3em] text-blue-400/60 mb-4">Resumen de Aula</h2>
                <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-black/40 rounded-2xl text-center">
                        <span className="block text-[8px] uppercase font-black text-white/30">Energía Promedio</span>
                        <span className="text-lg font-black text-blue-400">
                          {students.length > 0 
                            ? (students.reduce((acc, s) => acc + (s.economy?.energy?.current || 0), 0) / students.length).toFixed(1)
                            : 0}
                        </span>
                    </div>
                    <div className="p-4 bg-black/40 rounded-2xl text-center">
                        <span className="block text-[8px] uppercase font-black text-white/30">Soles Totales</span>
                        <span className="text-lg font-black text-amber-400">
                          {students.reduce((acc, s) => acc + (s.economy?.suns || 0), 0)}
                        </span>
                    </div>
                </div>
            </div>

          </aside>
        </div>
      )}

      {/* Student Details Overlay (Modal-like) */}
      <AnimatePresence>
        {selectedStudent && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-end"
            onClick={() => setSelectedStudent(null)}
          >
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="w-full max-w-2xl h-full bg-[#0d0d10] border-l border-white/10 shadow-2xl p-10 overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-start mb-10">
                <div>
                  <h2 className="text-3xl font-black uppercase">{selectedStudent.email || 'Alumno'}</h2>
                  <p className="text-xs text-blue-400 font-bold uppercase tracking-widest mt-1">Expediente Detallado</p>
                </div>
                <button onClick={() => setSelectedStudent(null)} className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center text-xl">✕</button>
              </div>

              {loadingDetails ? (
                <div className="py-20 text-center animate-pulse uppercase font-black text-[10px] tracking-widest text-white/20">
                  Leyendo registros akáshicos...
                </div>
              ) : (
                <div className="space-y-12">
                  
                  {/* Mastery Section */}
                  <section>
                    <h3 className="text-xs font-black uppercase tracking-[0.3em] text-white/30 mb-6 flex items-center gap-2">
                        <span className="w-2 h-2 bg-blue-500 rounded-full" />
                        Nexo de Saberes (Maestría)
                    </h3>
                    <div className="grid gap-4">
                      {studentDetails.mastery.length === 0 ? (
                         <p className="text-xs text-white/20 italic p-6 border border-white/5 rounded-2xl text-center">Sin interacciones registradas.</p>
                      ) : (
                        studentDetails.mastery.map(item => (
                          <div key={item.id} className="p-5 bg-white/5 rounded-2xl border border-white/5 flex justify-between items-center">
                            <div>
                                <h4 className="font-bold text-sm uppercase text-blue-300">{item.conceptId}</h4>
                                <div className="flex gap-4 mt-1 text-[9px] uppercase font-black text-white/40">
                                    <span>Aciertos: {item.successCount || 0}</span>
                                    <span>Fallos: {item.failCount || 0}</span>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-lg font-black">{item.masteryScore || 0}%</div>
                                <div className="w-24 h-1 bg-white/10 rounded-full mt-1 overflow-hidden">
                                    <div className="h-full bg-blue-500" style={{ width: `${item.masteryScore || 0}%` }} />
                                </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </section>

                  {/* Journal Section */}
                  <section>
                    <h3 className="text-xs font-black uppercase tracking-[0.3em] text-white/30 mb-6 flex items-center gap-2">
                        <span className="w-2 h-2 bg-emerald-500 rounded-full" />
                        Cuaderno de Campo (Bitácora)
                    </h3>
                    <div className="space-y-6">
                      {studentDetails.journal.length === 0 ? (
                         <p className="text-xs text-white/20 italic p-6 border border-white/5 rounded-2xl text-center">El cuaderno está en blanco.</p>
                      ) : (
                        studentDetails.journal.map(entry => (
                          <div key={entry.id} className="p-6 bg-emerald-950/10 rounded-3xl border border-emerald-500/10 relative">
                             <div className="text-[9px] font-black uppercase text-emerald-500/50 mb-4 flex justify-between">
                                <span>{entry.createdAt?.toDate?.().toLocaleDateString() || 'Reciente'}</span>
                                <span>{entry.createdAt?.toDate?.().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) || ''}</span>
                             </div>

                             {entry.data?.isJournalEntry && entry.data?.journalData && (
                                <div className="space-y-4">
                                    <h4 className="text-xs font-black uppercase text-emerald-300">{entry.data.journalData.title}</h4>
                                    {entry.data.journalData.entries.map((q, i) => (
                                        <div key={i}>
                                            <p className="text-[8px] uppercase text-white/30 font-black mb-1">{q.question}</p>
                                            <p className="text-sm text-white/80 italic font-serif leading-relaxed">"{q.answer}"</p>
                                        </div>
                                    ))}
                                </div>
                             )}

                             {entry.data?.decision && (
                                <div className="flex items-center gap-4">
                                    <div className="text-3xl">{entry.data.choiceIcon || '🌱'}</div>
                                    <div>
                                        <p className="text-[8px] uppercase text-white/30 font-black mb-0.5">Decisión</p>
                                        <p className="text-sm font-bold text-emerald-400">{entry.data.choiceLabel}</p>
                                    </div>
                                </div>
                             )}
                          </div>
                        ))
                      )}
                    </div>
                  </section>

                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default StudentAnalytics;
