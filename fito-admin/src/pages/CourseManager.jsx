import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, orderBy, deleteDoc, doc, getDoc } from 'firebase/firestore';
import '@shared/theme/designSystem.css';

const CourseManager = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBlock, setSelectedBlock] = useState(1);
  const [moduleConfig, setModuleConfig] = useState(null);

  const courseNames = {
    'auto': 'Autosustentabilidad',
    'bio': 'Bioquímica',
    'fito': 'Fitoterapia',
    'med': 'Medicina'
  };

  const courseName = courseNames[courseId] || 'Curso Desconocido';

  useEffect(() => {
    const fetchLessons = async () => {
      try {
        const q = query(collection(db, 'lessons'), where('courseId', '==', courseId));
        const querySnapshot = await getDocs(q);
        let lessonsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        // Sort by Day Number (or Order) within each week
        lessonsData.sort((a, b) => (Number(a.dayNumber) || Number(a.order) || 0) - (Number(b.dayNumber) || Number(b.order) || 0));
        setLessons(lessonsData);
      } catch (err) {
        console.error("Error cargando lecciones:", err);
      } finally {
        setLoading(false);
      }
    };

    const fetchModuleConfig = async () => {
      try {
        const configRef = doc(db, 'config', `module_map_${courseId}`);
        const configSnap = await getDoc(configRef);
        if (configSnap.exists()) {
          setModuleConfig(configSnap.data());
        }
      } catch (err) {
        console.error("Error cargando config del módulo:", err);
      }
    };

    fetchLessons();
    fetchModuleConfig();
  }, [courseId]);
  
  const handleDeleteLesson = async (lessonId, lessonTitle) => {
    if (!window.confirm(`¿Estás seguro de que quieres eliminar la lección "${lessonTitle}"? Esta acción no se puede deshacer.`)) return;

    try {
      await deleteDoc(doc(db, 'lessons', lessonId));
      setLessons(prev => prev.filter(l => l.id !== lessonId));
      alert("Lección eliminada correctamente.");
    } catch (err) {
      console.error("Error al eliminar lección:", err);
      alert("Hubo un error al intentar eliminar la lección.");
    }
  };

  const handleDeleteBlock = async () => {
    const blockLessons = lessons.filter(l => (l.blockNumber || 1) === selectedBlock);
    if (blockLessons.length === 0) return alert("Este bloque ya está vacío.");

    if (!window.confirm(`¡ADVERTENCIA! Vas a eliminar ${blockLessons.length} lecciones del Bloque ${selectedBlock}. ¿Estás absolutamente seguro de que quieres borrar el bloque completo?`)) return;

    try {
      // Borramos una por una (o podríamos usar un batch si fueran demasiadas)
      const deletePromises = blockLessons.map(l => deleteDoc(doc(db, 'lessons', l.id)));
      await Promise.all(deletePromises);
      
      setLessons(prev => prev.filter(l => (l.blockNumber || 1) !== selectedBlock));
      alert(`Se han eliminado ${blockLessons.length} lecciones del Bloque ${selectedBlock}.`);
    } catch (err) {
      console.error("Error al eliminar bloque:", err);
      alert("Hubo un error al intentar eliminar el bloque.");
    }
  };

  return (
    <div className="min-h-screen p-10 bg-dark text-main">
      <header className="mb-12 flex justify-between items-center">
        <div>
          <Link to="/" className="text-dim text-sm tracking-widest hover:text-white uppercase mb-4 inline-block">&larr; Volver al Dashboard</Link>
          <h1 className="text-4xl font-bold tracking-widest uppercase mb-2">Gestor: {courseName}</h1>
          <p className="text-dim">Administra las lecciones de este módulo</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleDeleteBlock}
            className="px-5 py-2 bg-red-600/20 text-red-400 border border-red-500/30 font-bold rounded-lg hover:bg-red-600 hover:text-white transition-all text-[10px] uppercase tracking-widest"
          >
            Borrar Bloque {selectedBlock} 🗑️
          </button>
          <button 
            onClick={() => navigate(`/editor/new/${courseId}`)}
            className="px-6 py-2.5 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-500 shadow-xl shadow-emerald-900/40 text-[10px] uppercase tracking-widest"
          >
            + Nueva Lección
          </button>
        </div>
      </header>

      {/* Selector de Bloque */}
      <div className="mb-8 flex gap-4 overflow-x-auto pb-4 hide-scrollbar">
        {[...Array(10)].map((_, i) => (
          <button
            key={i+1}
            onClick={() => setSelectedBlock(i+1)}
            className={`px-8 py-3 rounded-xl font-bold whitespace-nowrap transition-all flex flex-col items-center ${selectedBlock === i+1 ? 'bg-emerald-500 text-black shadow-[0_0_20px_rgba(16,185,129,0.4)]' : 'bg-white/5 text-dim border border-white/10 hover:bg-white/10'}`}
          >
            <span className="text-[10px] uppercase font-black opacity-60">Bloque {i+1}</span>
            <span className="text-sm truncate max-w-[150px]">
              {moduleConfig?.blocks?.[i+1]?.name || 'Sin Nombre'}
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-20">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full mx-auto animate-spin mb-4" />
          <p className="text-dim">Cargando lecciones...</p>
        </div>
      ) : lessons.length === 0 ? (
        <div className="glass-panel p-12 text-center border-dashed border-2 border-white/10">
          <h3 className="text-2xl font-bold mb-4">No hay lecciones creadas</h3>
          <p className="text-dim mb-8">Comienza creando la primera lección para este curso.</p>
          <button 
            onClick={() => navigate(`/editor/new/${courseId}`)}
            className="px-6 py-3 bg-white/10 text-white font-bold rounded-xl hover:bg-white/20"
          >
            Crear Primera Lección
          </button>
        </div>
      ) : (
        <div className="space-y-12">
          {/* Agrupar e iterar por semanas (1 a 6) */}
          {[1, 2, 3, 4, 5, 6].map(week => {
            const weekLessons = lessons.filter(l => (l.blockNumber || 1) === selectedBlock && (l.weekNumber || 1) === week);
            if (weekLessons.length === 0) return null;

            return (
              <div key={week} className="space-y-4">
                <h2 className="text-emerald-400 font-bold uppercase tracking-widest border-b border-white/10 pb-2 flex items-center gap-3">
                  <span className="bg-emerald-500/10 px-2 py-1 rounded text-[10px]">SEMANA {week}</span>
                  <span>{moduleConfig?.weeks?.[week] || 'Sin Nombre'}</span>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {weekLessons.map((lesson) => (
                    <div key={lesson.id} className="glass-panel p-6 flex justify-between items-center hover:bg-white/5 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-black/50 border border-white/10 flex items-center justify-center rounded-lg font-bold text-lg text-emerald-400">
                          D{lesson.dayNumber || lesson.order || '-'}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-lg font-bold truncate max-w-[200px]">{lesson.title}</h3>
                            {lesson.type === 'practice' && <span className="text-[10px] bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded border border-yellow-500/30 font-bold">RETO</span>}
                          </div>
                          <p className="text-dim text-xs">{lesson.screens?.length || 0} Pantallas • Req: {lesson.prerequisites?.length || 0}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => navigate(`/editor/${lesson.id}`)}
                          className="px-4 py-2 bg-white/10 border border-white/20 text-white font-bold rounded-lg hover:bg-white/20 uppercase tracking-widest text-[10px]"
                        >
                          Editar
                        </button>
                        <button 
                          onClick={() => handleDeleteLesson(lesson.id, lesson.title)}
                          className="px-4 py-2 bg-red-500/20 border border-red-500/40 text-red-400 font-bold rounded-lg hover:bg-red-500 hover:text-white transition-all uppercase tracking-widest text-[10px] flex items-center gap-2"
                        >
                          <span>Borrar</span>
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
          
          {/* Mensaje por si el bloque está vacío */}
          {lessons.filter(l => (l.blockNumber || 1) === selectedBlock).length === 0 && (
             <div className="text-center py-10 opacity-50 border border-dashed border-white/10 rounded-xl">
               <span className="text-4xl block mb-4">🍂</span>
               <p>No hay lecciones en el Bloque {selectedBlock}</p>
             </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CourseManager;
