import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import '@shared/theme/designSystem.css';

const CourseManager = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBlock, setSelectedBlock] = useState(1);

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

    fetchLessons();
  }, [courseId]);

  return (
    <div className="min-h-screen p-10 bg-dark text-main">
      <header className="mb-12 flex justify-between items-center">
        <div>
          <Link to="/" className="text-dim text-sm tracking-widest hover:text-white uppercase mb-4 inline-block">&larr; Volver al Dashboard</Link>
          <h1 className="text-4xl font-bold tracking-widest uppercase mb-2">Gestor: {courseName}</h1>
          <p className="text-dim">Administra las lecciones de este módulo</p>
        </div>
        <button 
          onClick={() => navigate(`/editor/new/${courseId}`)}
          className="px-6 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-500 shadow-lg shadow-emerald-900/20"
        >
          + NUEVA LECCIÓN
        </button>
      </header>

      {/* Selector de Bloque */}
      <div className="mb-8 flex gap-4 overflow-x-auto pb-4 hide-scrollbar">
        {[...Array(10)].map((_, i) => (
          <button
            key={i+1}
            onClick={() => setSelectedBlock(i+1)}
            className={`px-8 py-3 rounded-xl font-bold whitespace-nowrap transition-colors ${selectedBlock === i+1 ? 'bg-emerald-500 text-black shadow-[0_0_20px_rgba(16,185,129,0.4)]' : 'bg-white/5 text-dim border border-white/10 hover:bg-white/10'}`}
          >
            BLOQUE {i+1}
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
                <h2 className="text-emerald-400 font-bold uppercase tracking-widest border-b border-white/10 pb-2">
                  📁 SEMANA {week}
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
                      <button 
                        onClick={() => navigate(`/editor/${lesson.id}`)}
                        className="px-4 py-2 bg-white/5 border border-white/10 text-white font-bold rounded-lg hover:bg-white/10 uppercase tracking-widest text-[10px]"
                      >
                        Editar
                      </button>
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
