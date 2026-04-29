import React, { useEffect, useState } from 'react';
import LessonEngine from '@shared/components/LessonEngine';

const PreviewWindow = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    // Escuchar cambios en localStorage (para actualizar si el admin guarda en la otra ventana)
    const handleStorageChange = () => {
      const rawData = localStorage.getItem('fito_editor_preview');
      if (rawData) {
        setData(JSON.parse(rawData));
      }
    };

    // Leer valor inicial
    handleStorageChange();

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-white p-10 font-sans">
        <div className="text-center">
          <span className="text-4xl mb-4 block">📱</span>
          <h2 className="text-xl font-bold mb-2">Simulador Móvil Listo</h2>
          <p className="text-white/50 text-sm">Vuelve a la pestaña del Editor y presiona "PROBAR INTERACTIVIDAD" para cargar la vista previa aquí.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-black overflow-hidden relative font-sans text-white">
      <LessonEngine 
        lesson={{ id: data.lessonId, screens: data.screens }} 
        initialScreenIndex={data.screens.findIndex(s => s.id === data.selectedScreenId)}
        onExit={() => window.close()}
        user={{ uid: 'admin-test' }} // Usuario ficticio para pruebas
      />
    </div>
  );
};

export default PreviewWindow;
