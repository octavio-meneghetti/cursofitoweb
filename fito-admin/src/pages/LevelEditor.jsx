import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import NarrativeTemplate from '@shared/components/templates/NarrativeTemplate';
import QuizTemplate from '@shared/components/templates/QuizTemplate';
import SwipeTemplate from '@shared/components/templates/SwipeTemplate';
import FlipTemplate from '@shared/components/templates/FlipTemplate';
import SliderTemplate from '@shared/components/templates/SliderTemplate';
import DragMatchTemplate from '@shared/components/templates/DragMatchTemplate';
import RewardTemplate from '@shared/components/templates/RewardTemplate';
import JournalTemplate from '@shared/components/templates/JournalTemplate';
import IntroTemplate from '@shared/components/templates/IntroTemplate';
import '@shared/theme/designSystem.css';
import { db, storage } from '../lib/firebase';
import { doc, getDoc, collection, addDoc, updateDoc, getDocs } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const TEMPLATES = {
  T01_NARRATIVE: 'Narrativa (Personaje + Texto)',
  T02_QUIZ_SELECT: 'Quiz (Pregunta + Opciones)',
  T03_SWIPE_CARDS: 'Triaje (Deslizar Tarjetas)',
  T04_FLIP_CARDS: 'Flashcards (Cartas Giratorias)',
  T05_SLIDER: 'Simulador (Deslizador de Variables)',
  T06_DRAG_MATCH: 'Laboratorio (Fusión de Elementos)',
  T07_REWARD: 'Medalla Cinemática (Recompensa)',
  T08_JOURNAL: 'Registro (Selección de Chips)',
  T09_HOTSPOTS: 'Cartógrafo: Puntos de Interés (Medicina)',
  T10_ORDERING: 'Ordenamiento: Jerarquías y Procesos',
  T11_THERMO: 'Termodinámica: Temperatura y Extracción (Bioquímica)',
  T12_SCRATCH: 'Raspadita: Revelación Oculta (Autosustentabilidad)',
  T13_MAGNETIC: 'Magnetismo: Polaridad Sandbox (Bioquímica)',
  T14_INTRO: 'Intro: Narración Cinematográfica (Audio + Subtítulos)'
};

const AVATAR_IMAGES = [
  { id: '/guardian.png', label: 'El Guardián' },
  { id: '/mensajera.png', label: 'La Mensajera' },
  { id: '/cartografo.png', label: 'El Cartógrafo' },
  { id: '/herbolaria.png', label: 'La Herbolaria' }
];

const AVATAR_EFFECTS = [
  { id: 'none', label: 'Ninguno' },
  { id: 'float', label: 'Flotar' },
  { id: 'glow', label: 'Brillo' },
  { id: 'grayscale', label: 'Blanco y Negro' }
];

const generateId = () => Math.random().toString(36).substr(2, 9);

const DEFAULT_NARRATIVE_DATA = {
  character: 'El Guardián',
  text: 'Escribe aquí tu diálogo...',
  accentColor: 'var(--color-guardian)',
  avatarImage: '/avatars/guardian.png',
  avatarEffect: 'none',
  audioUrl: ''
};

const DEFAULT_QUIZ_DATA = {
  pregunta: '¿Cuál es la pregunta?',
  opciones: ['Opción 1', 'Opción 2', 'Opción 3'],
  correctIndex: 0,
  feedback: 'Buen trabajo.'
};

const DEFAULT_SWIPE_DATA = {
  leftLabel: 'Derivar 🚩',
  rightLabel: 'Acompañar 🌿',
  cards: [{ id: generateId(), text: 'Caso de estudio...', correctDirection: 'left', explanation: 'Motivo de esta decisión...' }]
};

const DEFAULT_FLIP_DATA = {
  cards: [{ id: generateId(), front: 'Concepto a aprender', back: 'Explicación o concepto inverso' }]
};

const DEFAULT_SLIDER_DATA = {
  concept: 'Edad del paciente',
  points: [
    { value: 1, label: 'Niño', text: 'Usar plantas nobles.', image: '☀️' },
    { value: 2, label: 'Adulto', text: 'Dosis estándar.', image: '🔥' },
    { value: 3, label: 'Anciano', text: 'Dosis reducida.', image: '🌙' }
  ]
};

const DEFAULT_DRAG_DATA = {
  objectiveLabel: 'Mortero',
  items: [
    { id: generateId(), label: 'Elemento incorrecto', isCorrect: false },
    { id: generateId(), label: 'Elemento correcto', isCorrect: true }
  ],
  successMessage: '¡Fusión exitosa!'
};

const DEFAULT_REWARD_DATA = {
  badgeName: 'Guardián de la Vida',
  badgeIcon: '🏅',
  message: 'Has dominado este concepto.',
  particles: true
};

const DEFAULT_JOURNAL_DATA = {
  questions: [
    { id: generateId(), label: 'Textura de la planta', chips: ['Lisa', 'Áspera', 'Carnosa'], allowCustom: true }
  ]
};

const DEFAULT_HOTSPOTS_DATA = {
  imageUrl: 'https://images.unsplash.com/photo-1530213786676-41801d9cdb7d?q=80&w=1000',
  instruction: 'Encuentra y pulsa el Hígado',
  targetHotspot: 'hotspot-1',
  points: [
    { id: 'hotspot-1', x: 50, y: 50, label: 'Hígado', info: 'Órgano vital de desintoxicación.' }
  ]
};

const DEFAULT_ORDERING_DATA = {
  instruction: 'Ordena de Superior a Inferior',
  items: [
    { id: 'item-1', label: 'Boca', order: 1 },
    { id: 'item-2', label: 'Esófago', order: 2 },
    { id: 'item-3', label: 'Estómago', order: 3 }
  ]
};

const DEFAULT_THERMO_DATA = {
  instruction: 'Ajusta la temperatura idónea para la extracción.',
  targetTempRange: [60, 80],
  minTemp: 0,
  maxTemp: 100,
  successMessage: '¡Temperatura óptima alcanzada!'
};

const DEFAULT_SCRATCH_DATA = {
  instruction: 'Raspa la superficie para descubrir el costo ecológico.',
  undertext: 'Un vaso de leche almendras requiere 74 litros de agua.',
  overlayColor: '#1e293b' // Fog color
};

const DEFAULT_MAGNETIC_DATA = {
  instruction: 'Observa la polaridad. Mezcla Agua e Hidrolato polar.',
  elements: [
    { id: 'e-1', label: 'Agua (+)', polarity: 'polar' },
    { id: 'e-2', label: 'Aceite (-)', polarity: 'non-polar' }
  ]
};

const DEFAULT_INTRO_DATA = {
  character: 'El Guardián',
  avatarImage: '/guardian.png',
  audioUrl: '',
  subtitlesText: '[0:02] Bienvenidos al portal de sabiduría.\n[0:07] Escucha atentamente lo que el bosque tiene para decirte.',
  accentColor: '#10b981',
  autoContinue: true
};

const LevelEditor = () => {
  const { courseId, lessonId } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState('Nueva Lección');
  const [order, setOrder] = useState(1);
  const [blockNumber, setBlockNumber] = useState(1);
  const [weekNumber, setWeekNumber] = useState(1);
  const [dayNumber, setDayNumber] = useState(1);
  const [type, setType] = useState('lesson'); // 'lesson' o 'practice'
  const [prerequisites, setPrerequisites] = useState([]); // array de IDs
  const [allLessons, setAllLessons] = useState([]); // para el selector
  
  const [screens, setScreens] = useState([
    { id: generateId(), templateId: 'T01_NARRATIVE', data: { ...DEFAULT_NARRATIVE_DATA } }
  ]);
  const [selectedScreenId, setSelectedScreenId] = useState(screens[0].id);
  const [loading, setLoading] = useState(true);
  const [uploadingAudio, setUploadingAudio] = useState(false);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // Traer todas las lecciones existentes para poder seleccionarlas como prerrequisitos
        const reqLessons = await getDocs(collection(db, 'lessons'));
        const availableLessons = reqLessons.docs
          .map(d => ({ id: d.id, ...d.data() }))
          .filter(d => d.id !== lessonId); // no puedes ser prerrequisito de ti misma
        setAllLessons(availableLessons);

        if (lessonId) {
          const docRef = doc(db, 'lessons', lessonId);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            setTitle(data.title || 'Lección sin título');
            setOrder(data.order || 1);
            setBlockNumber(data.blockNumber || 1);
            setWeekNumber(data.weekNumber || 1);
            setDayNumber(data.dayNumber || 1);
            setType(data.type || 'lesson');
            setPrerequisites(data.prerequisites || []);

            if (data.screens && data.screens.length > 0) {
              setScreens(data.screens);
              setSelectedScreenId(data.screens[0].id);
            }
          }
        }
      } catch (err) {
        console.error("Error al cargar:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, [lessonId]);

  const addScreen = () => {
    const newScreen = {
      id: generateId(),
      templateId: 'T01_NARRATIVE',
      conceptId: '', // Nuevo campo para el Nexo de Saberes
      data: { ...DEFAULT_NARRATIVE_DATA }
    };
    setScreens([...screens, newScreen]);
    setSelectedScreenId(newScreen.id);
  };

  const removeScreen = (id) => {
    if (screens.length === 1) return alert("Debe haber al menos 1 pantalla.");
    const newScreens = screens.filter(s => s.id !== id);
    setScreens(newScreens);
    if (selectedScreenId === id) {
      setSelectedScreenId(newScreens[0].id);
    }
  };

  const currentScreenIndex = screens.findIndex(s => s.id === selectedScreenId);
  const currentScreen = screens[currentScreenIndex];

  const updateCurrentScreen = (updates) => {
    const newScreens = [...screens];
    newScreens[currentScreenIndex] = { ...currentScreen, ...updates };
    setScreens(newScreens);
  };

  const handleChangeData = (field, value) => {
    updateCurrentScreen({
      data: { ...currentScreen.data, [field]: value }
    });
  };

  const handleTemplateChange = (newTemplateId) => {
    let defaultData = {};
    if (newTemplateId === 'T01_NARRATIVE') defaultData = { ...DEFAULT_NARRATIVE_DATA };
    else if (newTemplateId === 'T02_QUIZ_SELECT') defaultData = { ...DEFAULT_QUIZ_DATA };
    else if (newTemplateId === 'T03_SWIPE_CARDS') defaultData = { ...DEFAULT_SWIPE_DATA };
    else if (newTemplateId === 'T04_FLIP_CARDS') defaultData = { ...DEFAULT_FLIP_DATA };
    else if (newTemplateId === 'T05_SLIDER') defaultData = { ...DEFAULT_SLIDER_DATA };
    else if (newTemplateId === 'T06_DRAG_MATCH') defaultData = { ...DEFAULT_DRAG_DATA };
    else if (newTemplateId === 'T07_REWARD') defaultData = { ...DEFAULT_REWARD_DATA };
    else if (newTemplateId === 'T08_JOURNAL') defaultData = { ...DEFAULT_JOURNAL_DATA };
    else if (newTemplateId === 'T09_HOTSPOTS') defaultData = { ...DEFAULT_HOTSPOTS_DATA };
    else if (newTemplateId === 'T10_ORDERING') defaultData = { ...DEFAULT_ORDERING_DATA };
    else if (newTemplateId === 'T11_THERMO') defaultData = { ...DEFAULT_THERMO_DATA };
    else if (newTemplateId === 'T12_SCRATCH') defaultData = { ...DEFAULT_SCRATCH_DATA };
    else if (newTemplateId === 'T13_MAGNETIC') defaultData = { ...DEFAULT_MAGNETIC_DATA };
    else if (newTemplateId === 'T14_INTRO') defaultData = { ...DEFAULT_INTRO_DATA };
    
    updateCurrentScreen({
      templateId: newTemplateId,
      data: defaultData
    });
  };

  const handleOpcionChange = (index, value) => {
    const newOpciones = [...currentScreen.data.opciones];
    newOpciones[index] = value;
    handleChangeData('opciones', newOpciones);
  };

  const handlePrerequisiteToggle = (lessonIdToCheck) => {
    setPrerequisites(prev => 
      prev.includes(lessonIdToCheck) 
        ? prev.filter(id => id !== lessonIdToCheck)
        : [...prev, lessonIdToCheck]
    );
  };

  const handleAudioUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.includes('audio')) return alert("Por favor selecciona un archivo de audio (MP3, WAV, etc.)");

    setUploadingAudio(true);
    try {
      const storageRef = ref(storage, `lessons/audio/${generateId()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      
      handleChangeData('audioUrl', url);
      alert('¡Audio subido con éxito!');
    } catch (err) {
      console.error("Error al subir audio:", err);
      alert("Error al subir el audio. Verifica el Storage de Firebase.");
    } finally {
      setUploadingAudio(false);
    }
  };

  const saveLesson = async () => {
    if (!title) return alert("Ponle un título a la lección.");
    try {
      const lessonData = {
        courseId: courseId || 'fito',
        title,
        order: Number(order),
        blockNumber: Number(blockNumber),
        weekNumber: Number(weekNumber),
        dayNumber: Number(dayNumber),
        type,
        prerequisites,
        screens
      };

      if (lessonId) {
        await updateDoc(doc(db, 'lessons', lessonId), lessonData);
        alert("¡Lección actualizada exitosamente!");
      } else {
        await addDoc(collection(db, 'lessons'), lessonData);
        alert("¡Lección creada exitosamente!");
        navigate(`/course/${courseId}`);
      }
    } catch (err) {
      console.error(err);
      alert("Error al guardar en Firebase.");
    }
  };

  if (loading) return <div className="p-10 text-white">Cargando editor...</div>;

  const renderPreview = (screen) => {
    switch (screen.templateId) {
      case 'T01_NARRATIVE':
        return <NarrativeTemplate data={screen.data} />;
      case 'T02_QUIZ_SELECT':
        return <QuizTemplate data={screen.data} />;
      case 'T03_SWIPE_CARDS':
        return <SwipeTemplate data={screen.data} />;
      case 'T04_FLIP_CARDS':
        return <FlipTemplate data={screen.data} />;
      case 'T05_SLIDER':
        return <SliderTemplate data={screen.data} />;
      case 'T06_DRAG_MATCH':
        return <DragMatchTemplate data={screen.data} />;
      case 'T07_REWARD':
        return <RewardTemplate data={screen.data} />;
      case 'T08_JOURNAL':
        return <JournalTemplate data={screen.data} />;
      case 'T14_INTRO':
        return <IntroTemplate data={screen.data} onNext={() => {}} isEditMode={true} />;
      default:
        return <div className="text-dim p-10">Selecciona una plantilla válida.</div>;
    }
  };

  return (
    <div className="flex h-screen bg-dark text-main">
      
      {/* Navegador de Pantallas (Sidebar Izquierdo) */}
      <div className="w-64 border-r border-white/10 p-4 overflow-y-auto bg-black/30 flex flex-col">
        <button onClick={() => navigate(-1)} className="text-dim text-sm mb-6 hover:text-white">&larr; Volver</button>
        
        <div className="space-y-4 mb-4">
          <label className="block text-xs uppercase font-bold text-dim">Título de la Lección</label>
          <input 
            type="text" 
            value={title} 
            onChange={e => setTitle(e.target.value)} 
            className="w-full bg-white/5 border border-white/10 p-2 rounded text-sm text-white" 
          />
          
          <div className="grid grid-cols-2 gap-2">
            <label className="block text-xs uppercase font-bold text-dim">Bloque (1-10)</label>
            <input type="number" min="1" max="10" value={blockNumber} onChange={e => setBlockNumber(e.target.value)} className="w-full bg-white/5 border border-white/10 p-2 rounded text-sm text-white" />
            
            <label className="block text-xs uppercase font-bold text-dim">Semana (1-6)</label>
            <input type="number" min="1" max="6" value={weekNumber} onChange={e => setWeekNumber(e.target.value)} className="w-full bg-white/5 border border-white/10 p-2 rounded text-sm text-white" />
            
            <label className="block text-xs uppercase font-bold text-dim">Día (1-40)</label>
            <input type="number" min="1" max="40" value={dayNumber} onChange={e => setDayNumber(e.target.value)} className="w-full bg-white/5 border border-white/10 p-2 rounded text-sm text-white" />
          </div>

          <label className="block text-xs uppercase font-bold text-dim mt-4">Tipo de Lección</label>
          <select value={type} onChange={e => setType(e.target.value)} className="w-full bg-emerald-900/40 border border-emerald-500/30 p-2 rounded text-sm text-emerald-100 font-bold">
            <option value="lesson">📖 Lección de Teoría</option>
            <option value="practice">⚔️ Reto de Práctica</option>
          </select>

          <label className="block text-xs uppercase font-bold text-dim mt-4">Req. Previos (Para Abrir)</label>
          <div className="h-24 overflow-y-auto bg-black/50 border border-white/10 rounded p-2 text-xs text-dim space-y-1">
            {allLessons.map(l => (
              <label key={l.id} className="flex flex-row items-center cursor-pointer hover:bg-white/5 p-1 rounded">
                <input 
                  type="checkbox" 
                  checked={prerequisites.includes(l.id)} 
                  onChange={() => handlePrerequisiteToggle(l.id)}
                  className="mr-2 accent-emerald-500" 
                />
                <span className="truncate">{l.courseId?.toUpperCase()}: {l.title}</span>
              </label>
            ))}
          </div>
        </div>

        <h3 className="text-xs uppercase font-bold text-dim mb-4 tracking-widest">Secuencia de Pantallas</h3>
        <div className="flex-1 space-y-2 overflow-y-auto">
          {screens.map((screen, idx) => (
            <div 
              key={screen.id} 
              className={`p-3 rounded-lg border cursor-pointer flex justify-between items-center transition-colors ${selectedScreenId === screen.id ? 'bg-emerald-900/40 border-emerald-500 text-emerald-400' : 'bg-white/5 border-white/10 text-dim hover:bg-white/10 hover:text-white'}`}
              onClick={() => setSelectedScreenId(screen.id)}
            >
              <div className="truncate text-sm font-bold">
                {idx + 1}. {TEMPLATES[screen.templateId].split(' ')[0]}
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); removeScreen(screen.id); }}
                className="text-red-500/50 hover:text-red-500 font-bold px-2"
              >&times;</button>
            </div>
          ))}
        </div>
        
        <button 
          onClick={addScreen}
          className="mt-4 w-full py-3 bg-white/10 text-white font-bold rounded-lg hover:bg-white/20 border border-white/20"
        >
          + Añadir Pantalla
        </button>

        <button 
          onClick={saveLesson}
          className="mt-4 w-full py-4 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-500 shadow-lg shadow-emerald-900/20"
        >
          GUARDAR EN FIREBASE
        </button>
      </div>

      {/* Editor Central (Formulario) */}
      <div className="flex-1 border-r border-white/10 p-8 overflow-y-auto relative">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold mb-8 uppercase tracking-widest">Editando Pantalla {currentScreenIndex + 1}</h2>
          
          <div className="space-y-6">
              <label className="block">
                <span className="text-dim text-xs uppercase font-bold mb-2 block">Tipo de Plantilla</span>
                <select 
                  value={currentScreen?.templateId || 'T01_NARRATIVE'} 
                  onChange={(e) => handleTemplateChange(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 p-3 rounded-lg text-main font-bold"
                >
                  {Object.entries(TEMPLATES).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </label>

              <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl space-y-2">
                <label className="block">
                  <span className="text-emerald-400 text-[10px] uppercase font-black tracking-widest block mb-1">ID de Concepto (Nexo de Saberes)</span>
                  <input 
                    type="text" 
                    placeholder="ej: bio_polaridad_agua"
                    value={currentScreen?.conceptId || ''} 
                    onChange={(e) => updateCurrentScreen({ conceptId: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 p-2 rounded text-sm text-emerald-100 placeholder:text-white/10"
                  />
                  <p className="text-[9px] text-white/30 italic mt-1">Usa el mismo ID para repetir este concepto en otras lecciones.</p>
                </label>
              </div>

              <hr className="border-white/5 my-8" />

            {/* Campos de T01_NARRATIVE */}
            {currentScreen?.templateId === 'T01_NARRATIVE' && (
              <div className="space-y-6 animate-fade-in">
                <div className="grid grid-cols-2 gap-4">
                  <label className="block">
                    <span className="text-dim text-xs uppercase font-bold mb-2 block">Personaje (Nombre)</span>
                    <input 
                      type="text" 
                      value={currentScreen.data.character || ''} 
                      onChange={(e) => handleChangeData('character', e.target.value)}
                      className="w-full bg-white/5 border border-white/10 p-3 rounded-lg text-main"
                    />
                  </label>
                  <label className="block">
                    <span className="text-dim text-xs uppercase font-bold mb-2 block">Color (Hex/Var)</span>
                    <input 
                      type="text" 
                      value={currentScreen.data.accentColor || ''} 
                      onChange={(e) => handleChangeData('accentColor', e.target.value)}
                      className="w-full bg-white/5 border border-white/10 p-3 rounded-lg text-main"
                    />
                  </label>
                </div>

                <label className="block">
                  <span className="text-dim text-xs uppercase font-bold mb-2 block">Diálogo</span>
                  <textarea 
                    value={currentScreen.data.text || ''} 
                    onChange={(e) => handleChangeData('text', e.target.value)}
                    rows="6"
                    className="w-full bg-white/5 border border-white/10 p-3 rounded-lg text-main font-serif text-lg leading-relaxed"
                  />
                </label>

                <div className="p-6 border border-white/10 rounded-xl bg-white/5 space-y-4">
                  <h4 className="text-emerald-400 font-bold uppercase tracking-widest text-xs">Opciones Avanzadas de Avatar & Voz</h4>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <label className="block">
                      <span className="text-dim text-xs font-bold mb-2 block">Imagen de Avatar</span>
                      <select 
                        value={AVATAR_IMAGES.some(a => a.id === currentScreen.data.avatarImage) ? currentScreen.data.avatarImage : 'custom'} 
                        onChange={(e) => {
                          if (e.target.value !== 'custom') handleChangeData('avatarImage', e.target.value);
                        }}
                        className="w-full bg-black/40 border border-white/10 p-2 rounded-lg text-main"
                      >
                        {AVATAR_IMAGES.map((av) => (
                          <option key={av.id} value={av.id}>{av.label}</option>
                        ))}
                        <option value="custom">URL Personalizada...</option>
                      </select>
                      <input 
                        type="text" 
                        placeholder="/avatars/mi-imagen.png"
                        value={currentScreen.data.avatarImage || ''} 
                        onChange={(e) => handleChangeData('avatarImage', e.target.value)}
                        className="w-full bg-black/40 border border-white/10 p-2 rounded-lg text-main mt-2 text-xs"
                      />
                    </label>
                    <label className="block">
                      <span className="text-dim text-xs font-bold mb-2 block">Efecto Visual</span>
                      <select 
                        value={currentScreen.data.avatarEffect || 'none'} 
                        onChange={(e) => handleChangeData('avatarEffect', e.target.value)}
                        className="w-full bg-black/40 border border-white/10 p-2 rounded-lg text-main"
                      >
                        {AVATAR_EFFECTS.map((eff) => (
                          <option key={eff.id} value={eff.id}>{eff.label}</option>
                        ))}
                      </select>
                    </label>
                  </div>

                  <label className="block">
                    <span className="text-dim text-xs font-bold mb-2 block">URL de Audio (TTS / MP3)</span>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        placeholder="https://..."
                        value={currentScreen.data.audioUrl || ''} 
                        onChange={(e) => handleChangeData('audioUrl', e.target.value)}
                        className="flex-1 bg-black/40 border border-white/10 p-2 rounded-lg text-main text-xs"
                      />
                      <button className="px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg text-xs font-bold font-sans">
                        🎙️ GEN. VOZ
                      </button>
                    </div>
                  </label>
                </div>
              </div>
            )}

            {/* Campos de T02_QUIZ_SELECT */}
            {currentScreen?.templateId === 'T02_QUIZ_SELECT' && (
              <div className="space-y-6 animate-fade-in">
                <label className="block">
                  <span className="text-dim text-xs uppercase font-bold mb-2 block">Pregunta</span>
                  <input 
                    type="text" 
                    value={currentScreen.data.pregunta || ''} 
                    onChange={(e) => handleChangeData('pregunta', e.target.value)}
                    className="w-full bg-white/5 border border-white/10 p-3 rounded-lg text-main font-serif text-xl"
                  />
                </label>

                <div className="space-y-3 bg-white/5 p-6 rounded-xl border border-white/10">
                  <span className="text-dim text-xs uppercase font-bold mb-4 block text-emerald-400">Opciones Múltiples</span>
                  {(currentScreen.data.opciones || []).map((opc, idx) => (
                    <div key={idx} className="flex gap-4 items-center">
                      <input 
                        type="radio" 
                        name={`correct-${currentScreen.id}`} 
                        checked={currentScreen.data.correctIndex === idx}
                        onChange={() => handleChangeData('correctIndex', idx)}
                        className="w-6 h-6 accent-emerald-500"
                      />
                      <input 
                        type="text" 
                        value={opc} 
                        onChange={(e) => handleOpcionChange(idx, e.target.value)}
                        className={`flex-1 p-3 rounded-lg text-main transition-colors ${currentScreen.data.correctIndex === idx ? 'bg-emerald-900/40 border border-emerald-500 text-emerald-100 font-bold' : 'bg-black/40 border border-white/10'}`}
                        placeholder={`Opción ${idx + 1}`}
                      />
                    </div>
                  ))}
                </div>

                <label className="block">
                  <span className="text-dim text-xs uppercase font-bold mb-2 block">Feedback (Si responde correcto)</span>
                  <input 
                    type="text" 
                    value={currentScreen.data.feedback || ''} 
                    onChange={(e) => handleChangeData('feedback', e.target.value)}
                    className="w-full bg-emerald-900/20 border border-emerald-500/50 p-3 rounded-lg text-emerald-100"
                  />
                </label>
              </div>
            )}

            {currentScreen?.templateId === 'T03_SWIPE_CARDS' && (
              <SwipeTemplate data={currentScreen.data} onChange={handleChangeData} isEditMode />
            )}

            {currentScreen?.templateId === 'T04_FLIP_CARDS' && (
              <FlipTemplate data={currentScreen.data} onChange={handleChangeData} isEditMode />
            )}

            {currentScreen?.templateId === 'T05_SLIDER' && (
              <SliderTemplate data={currentScreen.data} onChange={handleChangeData} isEditMode />
            )}

            {currentScreen?.templateId === 'T06_DRAG_MATCH' && (
              <DragMatchTemplate data={currentScreen.data} onChange={handleChangeData} isEditMode />
            )}

            {currentScreen?.templateId === 'T07_REWARD' && (
              <RewardTemplate data={currentScreen.data} onChange={handleChangeData} isEditMode />
            )}

            {currentScreen?.templateId === 'T08_JOURNAL' && (
              <JournalTemplate data={currentScreen.data} onChange={handleChangeData} isEditMode />
            )}

            {/* SECCIÓN: T14_INTRO */}
            {currentScreen?.templateId === 'T14_INTRO' && (
              <div className="space-y-6 animate-fade-in">
                <div className="grid grid-cols-2 gap-4">
                  <label className="block">
                    <span className="text-dim text-xs uppercase font-bold mb-2 block">Personaje (Nombre)</span>
                    <input 
                      type="text" 
                      value={currentScreen.data.character || ''} 
                      onChange={(e) => handleChangeData('character', e.target.value)}
                      className="w-full bg-white/5 border border-white/10 p-3 rounded-lg text-main"
                    />
                  </label>
                  <label className="block">
                    <span className="text-dim text-xs uppercase font-bold mb-2 block">Color Accent</span>
                    <input 
                      type="text" 
                      value={currentScreen.data.accentColor || ''} 
                      onChange={(e) => handleChangeData('accentColor', e.target.value)}
                      className="w-full bg-white/5 border border-white/10 p-3 rounded-lg text-main"
                    />
                  </label>
                </div>

                <label className="block">
                  <span className="text-dim text-xs uppercase font-bold mb-2 block">URL de Audio (MP3)</span>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="https://firebasestorage..."
                      value={currentScreen.data.audioUrl || ''} 
                      onChange={(e) => handleChangeData('audioUrl', e.target.value)}
                      className="flex-1 bg-white/5 border border-white/10 p-3 rounded-lg text-main text-xs"
                    />
                    <label className={`cursor-pointer px-4 py-3 rounded-lg font-bold text-xs flex items-center gap-2 transition-all ${uploadingAudio ? 'bg-white/5 text-white/20' : 'bg-purple-600 hover:bg-purple-500 text-white shadow-lg'}`}>
                      {uploadingAudio ? 'Subiendo...' : '📁 Subir'}
                      <input type="file" className="hidden" accept="audio/*" onChange={handleAudioUpload} disabled={uploadingAudio} />
                    </label>
                  </div>
                </label>

                <label className="block">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-dim text-xs uppercase font-bold block">Subtítulos Sincronizados</span>
                    <span className="text-[9px] text-white/30 uppercase tracking-widest">Ej: [0:05] Mi frase...</span>
                  </div>
                  <textarea 
                    value={currentScreen.data.subtitlesText || ''} 
                    onChange={(e) => handleChangeData('subtitlesText', e.target.value)}
                    rows="10"
                    placeholder="[0:02] Hola aventurero.\n[0:07] Este es el saber de la tierra..."
                    className="w-full bg-white/5 border border-white/10 p-3 rounded-lg text-main font-mono text-sm leading-relaxed"
                  />
                </label>

                <div className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-4">
                  <label className="block">
                    <span className="text-dim text-xs font-bold mb-2 block">Imagen de Avatar</span>
                    <select 
                      value={currentScreen.data.avatarImage} 
                      onChange={(e) => handleChangeData('avatarImage', e.target.value)}
                      className="w-full bg-black/40 border border-white/10 p-2 rounded-lg text-main"
                    >
                      {AVATAR_IMAGES.map((av) => (
                        <option key={av.id} value={av.id}>{av.label}</option>
                      ))}
                    </select>
                  </label>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-dim">Continuar auto. al terminar audio</span>
                    <input 
                      type="checkbox" 
                      checked={currentScreen.data.autoContinue} 
                      onChange={(e) => handleChangeData('autoContinue', e.target.checked)}
                      className="w-5 h-5 accent-emerald-500"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Simulador de Móvil (Live Preview) */}
      <div className="w-96 bg-[#05070a] flex flex-col items-center justify-center relative p-8">
        {/* Live Preview Badge removed for cleaner UI */}
        
        <div 
          className="bg-[#0c0c12] shadow-2xl overflow-hidden relative" 
          style={{ 
            width: '340px', 
            height: '720px', 
            borderRadius: '40px', 
            border: '12px solid #1a1c1e', 
            boxShadow: '0 0 50px rgba(0,0,0,0.5)',
            zIndex: 10
          }}
        >
          {/* Cámara Notch simulado */}
          <div className="absolute top-0 inset-x-0 h-6 bg-[#1a1c1e] rounded-b-3xl w-40 mx-auto z-40"></div>
          
          <div className="absolute inset-0 overflow-y-auto bg-black">
            {currentScreen ? renderPreview(currentScreen) : (
                <div className="flex items-center justify-center h-full text-dim text-xs">Selecciona una pantalla</div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
};

export default LevelEditor;
