import React, { useState, useEffect } from 'react';
import { db, storage } from '../lib/firebase';
import { collection, addDoc, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * ResourceManager (Admin): Gestión de la Biblioteca Multimedia.
 * UI Mejorada para evitar solapamientos y facilitar la gestión de requisitos.
 */

const RESOURCE_TYPES = [
  { id: 'pdf', label: 'PDF', icon: '📄', color: '#ef4444' },
  { id: 'image', label: 'Imagen', icon: '🖼️', color: '#10b981' },
  { id: 'audio', label: 'Audio', icon: '🎧', color: '#3b82f6' },
  { id: 'video', label: 'Video', icon: '🎬', color: '#a855f7' }
];

const ResourceManager = () => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const [newResource, setNewResource] = useState({
    title: '',
    description: '',
    type: 'pdf',
    requiredMedal: '',
    category: 'general'
  });
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    fetchResources();
  }, []);

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

  const handleFileChange = (e) => {
    if (e.target.files[0]) setSelectedFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!selectedFile || !newResource.title) {
        alert("Por favor completa el título y selecciona un archivo.");
        return;
    }

    setUploading(true);
    try {
      const storagePath = `library/${newResource.type}/${Date.now()}_${selectedFile.name}`;
      const storageRef = ref(storage, storagePath);
      const uploadTask = uploadBytesResumable(storageRef, selectedFile);

      uploadTask.on('state_changed', 
        (snapshot) => {
          const p = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setProgress(Math.round(p));
        }, 
        (error) => {
          console.error("Upload error:", error);
          setUploading(false);
        }, 
        async () => {
          const url = await getDownloadURL(uploadTask.snapshot.ref);
          
          const docData = {
            ...newResource,
            url,
            storagePath,
            createdAt: new Date().toISOString()
          };

          await addDoc(collection(db, 'library'), docData);
          setUploading(false);
          setProgress(0);
          setSelectedFile(null);
          setNewResource({ title: '', description: '', type: 'pdf', requiredMedal: '', category: 'general' });
          fetchResources();
          alert("¡Recurso añadido con éxito!");
        }
      );
    } catch (err) {
      console.error("Error total:", err);
      setUploading(false);
    }
  };

  const deleteResource = async (res) => {
    if (!window.confirm(`¿Seguro que quieres eliminar "${res.title}"?`)) return;
    try {
      await deleteDoc(doc(db, 'library', res.id));
      fetchResources();
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  return (
    <div className="min-h-screen p-6 md:p-12 bg-[#050505] text-main font-sans selection:bg-purple-500/30">
      <header className="mb-12 max-w-[1400px] mx-auto">
        <h1 className="text-4xl font-black text-white uppercase tracking-tighter mb-2">Gestor de Saberes</h1>
        <p className="text-white/20 text-[10px] uppercase tracking-[0.4em] font-bold">Configura los tesoros de la Biblioteca</p>
      </header>

      <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* PANEL DE SUBIDA */}
        <div className="lg:col-span-4 xl:col-span-3">
            <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-6 backdrop-blur-xl sticky top-8">
                <h2 className="text-emerald-400 font-black text-[10px] uppercase tracking-widest mb-6 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Nuevo Recurso
                </h2>

                <div className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-[8px] text-white/40 uppercase font-black ml-2">Título</label>
                        <input 
                            type="text" 
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-purple-500"
                            value={newResource.title}
                            onChange={(e) => setNewResource({...newResource, title: e.target.value})}
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-[8px] text-white/40 uppercase font-black ml-2 text-center block">Tipo</label>
                        <div className="grid grid-cols-4 gap-2">
                            {RESOURCE_TYPES.map(t => (
                                <button 
                                    key={t.id}
                                    onClick={() => setNewResource({...newResource, type: t.id})}
                                    className={`py-3 rounded-lg border transition-all flex flex-col items-center gap-1 ${newResource.type === t.id ? 'bg-purple-500 border-purple-400 text-white' : 'bg-black/40 border-white/5 text-white/40 hover:border-white/20'}`}
                                >
                                    <span className="text-base">{t.icon}</span>
                                    <span className="text-[7px] font-black uppercase tracking-tighter">{t.id}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[8px] text-white/40 uppercase font-black ml-2">ID de Medalla Requerida</label>
                        <input 
                            type="text" 
                            className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-[10px] text-white outline-none focus:border-purple-500 font-mono"
                            placeholder="Ej: herbolaria_pro"
                            value={newResource.requiredMedal}
                            onChange={(e) => setNewResource({...newResource, requiredMedal: e.target.value})}
                        />
                        <p className="text-[7px] text-white/20 px-2 mt-1">Déjalo vacío para que sea acceso libre.</p>
                    </div>

                    <div className="pt-2">
                        <label className="w-full h-24 border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-white/5 hover:border-purple-500/50 transition-all group">
                            <span className="text-xl mb-1">📂</span>
                            <span className="text-[9px] font-black text-white/30 uppercase truncate px-4">
                                {selectedFile ? selectedFile.name : 'Elegir Archivo'}
                            </span>
                            <input type="file" className="hidden" onChange={handleFileChange} />
                        </label>
                    </div>

                    {uploading && (
                        <div className="space-y-2">
                            <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} className="h-full bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]" />
                            </div>
                        </div>
                    )}

                    <button 
                        onClick={handleUpload}
                        disabled={uploading}
                        className="w-full py-4 bg-purple-500 text-white font-black uppercase tracking-[0.1em] text-[10px] rounded-xl shadow-xl shadow-purple-500/10 hover:bg-purple-400 transition-all active:scale-95 disabled:opacity-50"
                    >
                        {uploading ? 'SUBIENDO...' : 'PUBLICAR RECURSO'}
                    </button>
                </div>
            </div>
        </div>

        {/* LISTADO DE RECURSOS */}
        <div className="lg:col-span-8 xl:col-span-9">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                <AnimatePresence>
                    {resources.map(res => (
                        <motion.div 
                            layout
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            key={res.id} 
                            className="bg-white/5 border border-white/5 rounded-[2rem] p-5 flex flex-col justify-between group hover:bg-white/10 transition-all relative overflow-hidden"
                        >
                            <div className="flex justify-between items-start mb-4 relative z-10">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl bg-black/40 border border-white/5 shadow-inner">
                                        {RESOURCE_TYPES.find(t => t.id === res.type)?.icon}
                                    </div>
                                    <div>
                                        <h3 className="font-black text-white uppercase text-[11px] tracking-tight mb-1 leading-none">{res.title}</h3>
                                        <span className="text-[7px] font-black uppercase text-white/30 tracking-widest">{res.type}</span>
                                    </div>
                                </div>
                                <button onClick={() => deleteResource(res)} className="text-white/10 hover:text-red-500 transition-colors p-2">✕</button>
                            </div>

                            <div className="flex items-center justify-between border-t border-white/5 pt-4 mt-2 relative z-10">
                                <div className="flex flex-col gap-0.5">
                                    <span className="text-[7px] text-white/20 uppercase font-black tracking-widest">Requisito</span>
                                    <div className="flex items-center gap-1.5">
                                        <span className="text-[10px]">{res.requiredMedal ? '🏅' : '🔓'}</span>
                                        <span className={`text-[9px] font-black uppercase tracking-tighter ${res.requiredMedal ? 'text-emerald-400' : 'text-white/40'}`}>
                                            {res.requiredMedal ? res.requiredMedal : 'Abierto'}
                                        </span>
                                    </div>
                                </div>
                                <a href={res.url} target="_blank" rel="noopener noreferrer" className="bg-purple-500/10 hover:bg-purple-500/20 px-4 py-2 rounded-lg transition-all border border-purple-500/20">
                                    <span className="text-[8px] font-black text-purple-400 uppercase tracking-widest">Ver</span>
                                </a>
                            </div>

                            {/* Decoración sutil de fondo */}
                            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 blur-[40px] -mr-12 -mt-12 rounded-full pointer-events-none" />
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {resources.length === 0 && !loading && (
                <div className="text-center py-40 border-2 border-dashed border-white/5 rounded-[3rem]">
                    <p className="text-white/10 uppercase font-black tracking-widest text-[10px]">Aún no hay tesoros en esta biblioteca</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default ResourceManager;
