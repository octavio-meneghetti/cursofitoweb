import React from 'react';
import { useNavigate } from 'react-router-dom';
import '@shared/theme/designSystem.css';

const courses = [
  { id: 'auto', title: 'Autosustentabilidad', color: 'var(--color-guardian)', screens: 40 },
  { id: 'bio', title: 'Bioquímica', color: 'var(--color-mensajera)', screens: 40 },
  { id: 'fito', title: 'Fitoterapia', color: 'var(--color-herbolaria)', screens: 40 },
  { id: 'med', title: 'Medicina', color: 'var(--color-cartografo)', screens: 40 }
];

const Dashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen p-10 bg-dark text-main">
      <header className="mb-12 flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-bold tracking-widest uppercase mb-2">Panel Maestro</h1>
          <p className="text-dim">Gestión de lecciones y contenidos del curso</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => navigate('/map-theme')}
            className="px-6 py-3 bg-white/10 border border-white/20 text-white font-black uppercase tracking-[0.2em] rounded-xl hover:bg-white/20 hover:scale-105 active:scale-95 transition-all text-xs"
          >
            Personalizar Diseño 🎨
          </button>
          <button 
            onClick={() => navigate('/map-editor')}
            className="px-6 py-3 bg-white/10 border border-white/20 text-white font-black uppercase tracking-[0.2em] rounded-xl hover:bg-white/20 hover:scale-105 active:scale-95 transition-all text-xs"
          >
            Configurar Mundo 🗺️
          </button>
          <button 
            onClick={() => navigate('/module-map')}
            className="px-6 py-3 bg-white/10 border border-white/20 text-white font-black uppercase tracking-[0.2em] rounded-xl hover:bg-white/20 hover:scale-105 active:scale-95 transition-all text-xs"
          >
            Configurar Bloques 🧩
          </button>
          <button 
            onClick={() => navigate('/student-preview')}
            className="px-6 py-3 bg-emerald-500 text-black font-black uppercase tracking-[0.2em] rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:scale-105 active:scale-95 transition-all text-xs"
          >
            Ver App Alumno 🌿
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {courses.map(course => (
          <div 
            key={course.id}
            className="glass-panel p-8 hover:scale-105 transition-transform cursor-pointer relative overflow-hidden group"
            style={{ borderLeft: `4px solid ${course.color}` }}
          >
            <div 
              className="absolute -right-4 -bottom-4 w-24 h-24 blur-3xl opacity-20 group-hover:opacity-40 transition-opacity"
              style={{ backgroundColor: course.color }}
            />
            <h3 className="text-xl font-bold mb-4">{course.title}</h3>
            <div className="flex items-center justify-between">
              <span className="text-dim text-sm">{course.screens} Pantallas</span>
              <button 
                onClick={() => navigate(`/course/${course.id}`)}
                className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-white/10"
                style={{ color: course.color }}
              >
                Gestionar
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-16 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 glass-panel p-8">
          <h3 className="text-lg font-bold mb-6 text-dim uppercase tracking-widest">Actividad Reciente</h3>
          <div className="space-y-4">
            <div className="p-4 bg-white/5 rounded-xl flex items-center justify-between">
              <p>Actualizaste la Lección 12 de Fitoterapia</p>
              <span className="text-xs text-dim">Hace 2 horas</span>
            </div>
          </div>
        </div>
        
        <div className="glass-panel p-8 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mb-4 neon-border-green">
            <span className="text-2xl">⚡</span>
          </div>
          <h3 className="font-bold mb-2">Editor Rápido</h3>
          <p className="text-sm text-dim mb-6">Crea una pantalla nueva en segundos usando plantillas.</p>
          <button className="w-full py-3 bg-white text-bg-dark font-bold rounded-xl hover:opacity-90">
            NUEVA PANTALLA
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
