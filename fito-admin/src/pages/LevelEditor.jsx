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
import VideoPresentationTemplate from '@shared/components/templates/VideoPresentationTemplate';
import StorytellingTemplate from '@shared/components/templates/StorytellingTemplate';
import StatementTemplate from '@shared/components/templates/StatementTemplate';
import PromiseChecklistTemplate from '@shared/components/templates/PromiseChecklistTemplate';
import MissionActionTemplate from '@shared/components/templates/MissionActionTemplate';
import BotanicalRecordTemplate from '@shared/components/templates/BotanicalRecordTemplate';
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
  T14_INTRO: 'Intro: Narración Cinematográfica (Audio + Subtítulos)',
  T15_VIDEO: 'Presentación de Video (MP4 + Frase)',
  T16_STORY_STEPS: 'Storytelling: Diálogos por Pasos (Multipantalla Interna)',
  T17_STATEMENT: 'Frase Centrada (Minimalista + Animación)',
  T18_PROMISE_CHECKLIST: 'Hoja de Ruta: Promesa + Objetivos (Auto-check)',
  T19_MISSION_ACTION: 'Misión: Acción Real (Con Ayuda/Sugerencia)',
  T20_BOTANICAL_RECORD: 'Registro Botánico: Ficha de 5 Rasgos'
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
  title: '¡Medalla de Sabiduría!',
  message: 'Has completado el desafío con éxito.',
  icon: '🏆',
  accentColor: '#10b981'
};

const DEFAULT_CHECKLIST_DATA = {
  character: 'El Cartógrafo',
  avatarImage: '/avatars/cartografo.png',
  bubbleText: 'Hoy no vas a aprender nombres raros. Vas a aprender algo más útil: mapear tu estado.',
  items: [
    { id: generateId(), text: 'Ubico mi tensión', completed: false },
    { id: generateId(), text: 'Reconozco el mensajero', completed: false },
    { id: generateId(), text: 'Registro el terreno (24h)', completed: false }
  ],
  accentColor: '#10b981',
  buttonText: 'VAMOS',
  bubbleFontSize: '0.875rem',
  itemFontSize: '0.875rem'
};

const DEFAULT_MISSION_DATA = {
  missionTitle: 'Misión 1: Elegí una planta',
  instruction: 'Elegí una planta cerca. No importa cuál. Si no sabés su nombre, mejor.',
  successButtonText: 'YA LA TENGO',
  helpButtonText: 'NO ENCUENTRO',
  helpMessage: 'Podés buscar una hoja, un árbol, una maleza o incluso una maceta.',
  accentColor: '#10b981',
  titleFontSize: '1.5rem',
  instructionFontSize: '1.1rem'
};

const DEFAULT_BOTANICAL_DATA = {
  title: 'Describila en 5 rasgos',
  traits: [
    { id: 'color', label: 'Color', options: ['Verde claro', 'Verde oscuro', 'Rojizo', 'Otro'], icon: '🎨' },
    { id: 'texture', label: 'Textura', options: ['Lisa', 'Áspera', 'Carnosa', 'Fina', 'Dura'], icon: '✋' },
    { id: 'aroma', label: 'Aroma', options: ['Sin aroma', 'Suave', 'Fuerte', 'Dulce', 'Resinoso'], icon: '👃' },
    { id: 'shape', label: 'Forma', options: ['Hojas grandes', 'Hojas pequeñas', 'Alargadas', 'Redondas'], icon: '📐' },
    { id: 'place', label: 'Lugar', options: ['Maceta', 'Suelo', 'Vereda', 'Sombra', 'Sol'], icon: '📍' }
  ],
  buttonText: 'GUARDAR REGISTRO',
  accentColor: '#10b981'
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
  autoContinue: true,
  autoChangeAvatar: true,
  speakers: {} // { "Nombre": { avatar: "...", color: "..." } }
};

const DEFAULT_VIDEO_DATA = {
  videoUrl: '',
  phrase: 'Bienvenidos a esta presentación.',
  accentColor: '#10b981',
  textColor: '#ffffff',
  fontSize: '24',
  videoMaxWidth: '320',
  borderColor: '#10b981',
  autoContinue: false
};

const DEFAULT_STORY_DATA = {
  accentColor: '#10b981',
  defaultCharacter: 'El Guardián',
  defaultImage: '/guardian.png',
  scenes: [
    { 
      id: generateId(), 
      character: 'El Guardián', 
      image: '/guardian.png', 
      phrases: ['Primer diálogo de esta escena...'] 
    }
  ]
};

const DEFAULT_STATEMENT_DATA = {
  text: 'Escribe aquí tu frase impactante...',
  accentColor: '#10b981',
  animationType: 'typewriter',
  fontSize: '2.5rem',
  textColor: '#ffffff',
  backgroundColor: '#060608',
  keySoundUrl: '/tecla2.mp3',
  volume: 0.2,
  typingSpeed: 1
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
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

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
    if (!window.confirm("¿Estás seguro de que quieres eliminar esta pantalla?")) return;
    const newScreens = screens.filter(s => s.id !== id);
    setScreens(newScreens);
    if (selectedScreenId === id) {
      setSelectedScreenId(newScreens[0].id);
    }
  };

  const moveScreen = (idx, direction) => {
    if (direction === 'up' && idx === 0) return;
    if (direction === 'down' && idx === screens.length - 1) return;

    const newScreens = [...screens];
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    [newScreens[idx], newScreens[targetIdx]] = [newScreens[targetIdx], newScreens[idx]];
    
    setScreens(newScreens);
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
    else if (newTemplateId === 'T15_VIDEO') defaultData = { ...DEFAULT_VIDEO_DATA };
    else if (newTemplateId === 'T16_STORY_STEPS') defaultData = { ...DEFAULT_STORY_DATA };
    else if (newTemplateId === 'T17_STATEMENT') defaultData = { ...DEFAULT_STATEMENT_DATA };
    else if (newTemplateId === 'T18_PROMISE_CHECKLIST') defaultData = { ...DEFAULT_CHECKLIST_DATA };
    else if (newTemplateId === 'T19_MISSION_ACTION') defaultData = { ...DEFAULT_MISSION_DATA };
    else if (newTemplateId === 'T20_BOTANICAL_RECORD') defaultData = { ...DEFAULT_BOTANICAL_DATA };
    
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

  const handleVideoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.includes('video')) return alert("Por favor selecciona un archivo de video (MP4)");

    setUploadingVideo(true);
    try {
      const storageRef = ref(storage, `lessons/video/${generateId()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      
      handleChangeData('videoUrl', url);
      alert('¡Video subido con éxito!');
    } catch (err) {
      console.error("Error al subir video:", err);
      alert("Error al subir el video.");
    } finally {
      setUploadingVideo(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const storageRef = ref(storage, `custom_images/${lessonId || 'new'}/${generateId()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      handleChangeData('avatarImage', url);
      alert("¡Imagen subida con éxito!");
    } catch (err) {
      console.error(err);
      alert("Error al subir la imagen.");
    } finally {
      setUploadingImage(false);
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
      case 'T15_VIDEO':
        return <VideoPresentationTemplate data={screen.data} onNext={() => {}} isEditMode={true} />;
      case 'T16_STORY_STEPS':
        return <StorytellingTemplate data={screen.data} onNext={() => {}} />;
      case 'T17_STATEMENT':
        return <StatementTemplate key={JSON.stringify(screen.data)} data={screen.data} onNext={() => {}} />;
      case 'T18_PROMISE_CHECKLIST':
        return <PromiseChecklistTemplate data={screen.data} isEditMode={true} />;
      case 'T19_MISSION_ACTION':
        return <MissionActionTemplate data={screen.data} isEditMode={true} />;
      case 'T20_BOTANICAL_RECORD':
        return <BotanicalRecordTemplate data={screen.data} isEditMode={true} />;
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
              className={`p-3 rounded-lg border cursor-pointer group transition-colors ${selectedScreenId === screen.id ? 'bg-emerald-900/40 border-emerald-500 text-emerald-400' : 'bg-white/5 border-white/10 text-dim hover:bg-white/10 hover:text-white'}`}
              onClick={() => setSelectedScreenId(screen.id)}
            >
              <div className="flex-1 truncate mr-2 flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] opacity-40">{idx + 1}</span>
                  <span className="text-sm font-bold truncate">{screen.title || TEMPLATES[screen.templateId]?.split(' ')[0]}</span>
                </div>
                {screen.title && (
                  <span className="text-[9px] opacity-40 uppercase tracking-tighter">
                    {TEMPLATES[screen.templateId]?.split(':')[0]}
                  </span>
                )}
              </div>
              
              <div className="flex items-center gap-1">
                {idx > 0 && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); moveScreen(idx, 'up'); }}
                    className="hover:text-emerald-400 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Subir"
                  >▲</button>
                )}
                {idx < screens.length - 1 && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); moveScreen(idx, 'down'); }}
                    className="hover:text-emerald-400 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Bajar"
                  >▼</button>
                )}
                <button 
                  onClick={(e) => { e.stopPropagation(); removeScreen(screen.id); }}
                  className="text-red-500/30 hover:text-red-500 font-bold px-1 ml-1"
                  title="Eliminar Pantalla"
                >&times;</button>
              </div>
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="block">
                  <span className="text-emerald-400 text-[10px] uppercase font-black tracking-widest block mb-2">Nombre de esta Pantalla</span>
                  <input 
                    type="text" 
                    placeholder="Ej: Introducción Cinematográfica"
                    value={currentScreen?.title || ''} 
                    onChange={(e) => updateCurrentScreen({ title: e.target.value })}
                    className="w-full bg-emerald-500/5 border border-emerald-500/20 p-3 rounded-lg text-main font-bold placeholder:text-white/10"
                  />
                </label>
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
              </div>

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
                      <div className="flex gap-2 mb-2">
                        <select 
                          value={AVATAR_IMAGES.some(a => a.id === currentScreen.data.avatarImage) ? currentScreen.data.avatarImage : 'custom'} 
                          onChange={(e) => {
                            if (e.target.value !== 'custom') handleChangeData('avatarImage', e.target.value);
                          }}
                          className="flex-1 bg-black/40 border border-white/10 p-2 rounded-lg text-main"
                        >
                          {AVATAR_IMAGES.map((av) => (
                            <option key={av.id} value={av.id}>{av.label}</option>
                          ))}
                          <option value="custom">URL / Escena Personalizada...</option>
                        </select>
                        <label className={`cursor-pointer px-3 py-2 rounded-lg font-bold text-[10px] flex items-center gap-2 transition-all ${uploadingImage ? 'bg-white/5 text-white/20' : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg'}`}>
                          {uploadingImage ? '...' : 'Subir'}
                          <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploadingImage} />
                        </label>
                      </div>
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

                <div className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-6">
                  <div className="flex items-center justify-between border-b border-white/5 pb-4">
                    <div>
                      <h4 className="text-emerald-400 font-bold uppercase tracking-widest text-[10px]">Control de Avatar</h4>
                      <p className="text-[9px] text-white/30">¿Cambiar foto según quien hable?</p>
                    </div>
                    <input 
                      type="checkbox" 
                      checked={currentScreen.data.autoChangeAvatar} 
                      onChange={(e) => handleChangeData('autoChangeAvatar', e.target.checked)}
                      className="w-5 h-5 accent-emerald-500"
                    />
                  </div>

                  <label className="block">
                    <span className="text-dim text-xs font-bold mb-2 block">{currentScreen.data.autoChangeAvatar ? 'Imagen por Defecto / Fondo' : 'Imagen Exclusiva (Fija)'}</span>
                    <div className="flex gap-2 mb-2">
                        <select 
                        value={AVATAR_IMAGES.some(a => a.id === currentScreen.data.avatarImage) ? currentScreen.data.avatarImage : 'custom'} 
                        onChange={(e) => {
                            if (e.target.value !== 'custom') handleChangeData('avatarImage', e.target.value);
                        }}
                        className="flex-1 bg-black/40 border border-white/10 p-2 rounded-lg text-main text-xs"
                        >
                        {AVATAR_IMAGES.map((av) => (
                            <option key={av.id} value={av.id}>{av.label}</option>
                        ))}
                        <option value="custom">URL / Escena Personalizada...</option>
                        </select>
                        <label className={`cursor-pointer px-3 py-2 rounded-lg font-bold text-[10px] flex items-center gap-2 transition-all ${uploadingImage ? 'bg-white/5 text-white/20' : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg'}`}>
                          {uploadingImage ? '...' : 'Subir Escena'}
                          <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploadingImage} />
                        </label>
                    </div>
                    <input 
                      type="text"
                      placeholder="URL de imagen personalizada..."
                      value={currentScreen.data.avatarImage}
                      onChange={(e) => handleChangeData('avatarImage', e.target.value)}
                      className="w-full bg-black/40 border border-white/10 p-2 rounded-lg text-main text-[10px]"
                    />
                  </label>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="text-emerald-400 font-bold uppercase tracking-widest text-[10px]">Mapeo de Personajes</h4>
                      <button 
                        onClick={() => {
                          const name = prompt("Nombre del personaje (ej: El Guardián):");
                          if (name) {
                            const newSpeakers = { ...currentScreen.data.speakers };
                            newSpeakers[name] = { 
                              avatar: '/guardian.png', 
                              color: '#10b981', 
                              titleColor: '#10b981',
                              textColor: '#ffffff',
                              titleSize: 14,
                              dialogueSize: 24
                            };
                            handleChangeData('speakers', newSpeakers);
                          }
                        }}
                        className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded border border-emerald-500/30 hover:bg-emerald-500/40"
                      >
                        + Añadir Personaje
                      </button>
                    </div>

                    <div className="space-y-3">
                      {Object.entries(currentScreen.data.speakers || {}).map(([name, config], i) => (
                        <div key={i} className="p-3 bg-black/40 border border-white/5 rounded-lg space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-white font-bold text-xs">{name}</span>
                            <button 
                              onClick={() => {
                                const newSpeakers = { ...currentScreen.data.speakers };
                                delete newSpeakers[name];
                                handleChangeData('speakers', newSpeakers);
                              }}
                              className="text-red-500/50 hover:text-red-500 text-xs"
                            >Eliminar</button>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                             <select 
                              value={config.avatar} 
                              onChange={(e) => {
                                const newSpeakers = { ...currentScreen.data.speakers };
                                newSpeakers[name].avatar = e.target.value;
                                handleChangeData('speakers', newSpeakers);
                              }}
                              className="bg-black/20 border border-white/10 p-1 rounded text-[10px] text-white"
                            >
                              {AVATAR_IMAGES.map((av) => (
                                <option key={av.id} value={av.id}>{av.label}</option>
                              ))}
                            </select>
                            <input 
                              type="text" 
                              value={config.color} 
                              onChange={(e) => {
                                const newSpeakers = { ...currentScreen.data.speakers };
                                newSpeakers[name].color = e.target.value;
                                handleChangeData('speakers', newSpeakers);
                              }}
                              placeholder="#Glow"
                              title="Color de Resplandor/Acento"
                              className="bg-black/20 border border-white/10 p-1 rounded text-[10px] text-white"
                            />
                            <input 
                              type="text" 
                              value={config.titleColor || config.color || '#10b981'} 
                              onChange={(e) => {
                                const newSpeakers = { ...currentScreen.data.speakers };
                                newSpeakers[name].titleColor = e.target.value;
                                handleChangeData('speakers', newSpeakers);
                              }}
                              placeholder="#Título"
                              title="Color del Título (Nombre)"
                              className="bg-black/20 border border-white/10 p-1 rounded text-[10px] text-white"
                            />
                            <input 
                              type="text" 
                              value={config.textColor || '#ffffff'} 
                              onChange={(e) => {
                                const newSpeakers = { ...currentScreen.data.speakers };
                                newSpeakers[name].textColor = e.target.value;
                                handleChangeData('speakers', newSpeakers);
                              }}
                              placeholder="#Texto"
                              title="Color de la Letra"
                              className="bg-black/20 border border-white/10 p-1 rounded text-[10px] text-white"
                            />
                            {/* Nuevos Tamaños por Personaje */}
                            <input 
                              type="number" 
                              value={config.titleSize || 14} 
                              onChange={(e) => {
                                const newSpeakers = { ...currentScreen.data.speakers };
                                newSpeakers[name].titleSize = e.target.value;
                                handleChangeData('speakers', newSpeakers);
                              }}
                              placeholder="Tit. px"
                              title="Tamaño Título (px)"
                              className="bg-black/20 border border-white/10 p-1 rounded text-[10px] text-white"
                            />
                            <input 
                              type="number" 
                              value={config.dialogueSize || 24} 
                              onChange={(e) => {
                                const newSpeakers = { ...currentScreen.data.speakers };
                                newSpeakers[name].dialogueSize = e.target.value;
                                handleChangeData('speakers', newSpeakers);
                              }}
                              placeholder="Diag. px"
                              title="Tamaño Diálogo (px)"
                              className="bg-black/20 border border-white/10 p-1 rounded text-[10px] text-white"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between border-t border-white/5 pt-4">
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

            {currentScreen?.templateId === 'T16_STORY_STEPS' && (
              <div className="space-y-6 animate-fade-in text-main">
                <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl space-y-4">
                  <div className="flex justify-between items-center px-2">
                    <h3 className="text-emerald-400 font-bold uppercase tracking-widest text-[10px]">Escenas Narrativas</h3>
                    <button 
                      onClick={() => {
                        const newScenes = [...(currentScreen.data.scenes || [])];
                        newScenes.push({ 
                          id: generateId(), 
                          character: currentScreen.data.defaultCharacter || 'El Guardián', 
                          image: currentScreen.data.defaultImage || '/guardian.png',
                          phrases: ['Nueva frase para esta escena...']
                        });
                        handleChangeData('scenes', newScenes);
                      }}
                      className="text-[9px] bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full border border-emerald-500/30 hover:bg-emerald-500/40"
                    >
                      + Añadir Escena
                    </button>
                  </div>

                  <div className="space-y-6">
                    {(currentScreen.data.scenes || []).map((scene, sIdx) => (
                      <div key={scene.id} className="p-5 bg-black/40 border border-white/10 rounded-xl space-y-4 relative">
                        <div className="flex justify-between items-center border-b border-white/5 pb-2">
                           <span className="text-[10px] font-black text-emerald-500/50 uppercase tracking-tighter">Escena {sIdx + 1}</span>
                           <button 
                            onClick={() => {
                              const newScenes = currentScreen.data.scenes.filter(s => s.id !== scene.id);
                              handleChangeData('scenes', newScenes);
                            }}
                            className="text-red-500/40 hover:text-red-500 text-[9px] uppercase font-bold"
                           >Eliminar Escena</button>
                        </div>
                        
                        {/* Config de Escena (Imagen y Personaje) */}
                        <div className="grid grid-cols-2 gap-3">
                           <label className="block">
                              <span className="text-[9px] text-dim uppercase mb-1 block font-bold">Personaje</span>
                              <input 
                                type="text"
                                value={scene.character}
                                onChange={(e) => {
                                  const newScenes = [...currentScreen.data.scenes];
                                  newScenes[sIdx].character = e.target.value;
                                  handleChangeData('scenes', newScenes);
                                }}
                                className="w-full bg-black/40 border border-white/10 p-2 rounded text-xs text-white"
                              />
                           </label>
                           <label className="block text-right">
                              <span className="text-[9px] text-dim uppercase mb-1 block font-bold">Imagen de Fondo</span>
                              <div className="flex gap-1 justify-end">
                                <select 
                                  value={AVATAR_IMAGES.some(av => av.id === scene.image) ? scene.image : 'custom'}
                                  onChange={(e) => {
                                    if (e.target.value !== 'custom') {
                                      const newScenes = [...currentScreen.data.scenes];
                                      newScenes[sIdx].image = e.target.value;
                                      handleChangeData('scenes', newScenes);
                                    }
                                  }}
                                  className="bg-black/40 border border-white/10 p-1 rounded text-[10px] text-white"
                                >
                                  {AVATAR_IMAGES.map(av => <option key={av.id} value={av.id}>{av.label}</option>)}
                                  <option value="custom">URL...</option>
                                </select>
                                <label className="cursor-pointer px-2 py-1 bg-blue-600 rounded text-[9px] hover:bg-blue-500 text-white font-bold">
                                   Subir
                                   <input 
                                    type="file" 
                                    className="hidden" 
                                    onChange={async (e) => {
                                      const file = e.target.files[0];
                                      if (!file) return;
                                      setUploadingImage(true);
                                      try {
                                        const storageRef = ref(storage, `story_scenes/${lessonId || 'new'}/${generateId()}_${file.name}`);
                                        await uploadBytes(storageRef, file);
                                        const url = await getDownloadURL(storageRef);
                                        const newScenes = [...currentScreen.data.scenes];
                                        newScenes[sIdx].image = url;
                                        handleChangeData('scenes', newScenes);
                                      } catch (err) { console.error(err); }
                                      finally { setUploadingImage(false); }
                                    }} 
                                   />
                                </label>
                              </div>
                           </label>
                        </div>

                        {/* LISTA DE FRASES DENTRO DE LA ESCENA */}
                        <div className="space-y-2 pt-2">
                           <div className="flex justify-between items-center px-1">
                             <span className="text-[9px] text-white/30 uppercase font-black">Frases en esta escena</span>
                             <button 
                               onClick={() => {
                                 const newScenes = [...currentScreen.data.scenes];
                                 newScenes[sIdx].phrases = [...(newScenes[sIdx].phrases || []), 'Nueva frase...'];
                                 handleChangeData('scenes', newScenes);
                               }}
                               className="text-[8px] bg-white/5 border border-white/10 text-white/50 px-2 py-0.5 rounded hover:bg-white/10"
                             >+ Añadir Frase</button>
                           </div>
                           
                           <div className="space-y-2">
                             {(scene.phrases || []).map((phrase, pIdx) => (
                               <div key={pIdx} className="flex gap-2 group/phrase items-start">
                                 <div className="text-[10px] text-white/10 mt-3 font-mono">{pIdx + 1}</div>
                                 <textarea 
                                    value={phrase}
                                    onChange={(e) => {
                                      const newScenes = [...currentScreen.data.scenes];
                                      newScenes[sIdx].phrases[pIdx] = e.target.value;
                                      handleChangeData('scenes', newScenes);
                                    }}
                                    className="flex-1 bg-white/5 border border-white/5 p-2 rounded text-xs text-white min-h-[40px] focus:border-emerald-500/50 outline-none transition-all"
                                 />
                                 <button 
                                   onClick={() => {
                                      const newScenes = [...currentScreen.data.scenes];
                                      newScenes[sIdx].phrases = newScenes[sIdx].phrases.filter((_, i) => i !== pIdx);
                                      handleChangeData('scenes', newScenes);
                                   }}
                                   className="opacity-0 group-hover/phrase:opacity-100 text-red-500/40 hover:text-red-500 text-[10px] mt-3"
                                 >✕</button>
                               </div>
                             ))}
                           </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                  <label className="block">
                    <span className="text-dim text-[10px] uppercase font-bold mb-2 block">Color de Acento (Glow/Progreso)</span>
                    <input 
                      type="text" 
                      value={currentScreen.data.accentColor} 
                      onChange={(e) => handleChangeData('accentColor', e.target.value)}
                      className="w-full bg-black/40 border border-white/10 p-2 rounded text-xs text-white shadow-inner"
                    />
                  </label>
                </div>
              </div>
            )}

            {currentScreen?.templateId === 'T15_VIDEO' && (
              <div className="space-y-6 animate-fade-in text-main">
                <label className="block">
                  <span className="text-dim text-xs uppercase font-bold mb-2 block">URL del Video (MP4)</span>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="https://firebasestorage..."
                      value={currentScreen.data.videoUrl || ''} 
                      onChange={(e) => handleChangeData('videoUrl', e.target.value)}
                      className="flex-1 bg-white/5 border border-white/10 p-3 rounded-lg text-main text-xs"
                    />
                    <label className={`cursor-pointer px-4 py-3 rounded-lg font-bold text-xs flex items-center gap-2 transition-all ${uploadingVideo ? 'bg-white/5 text-white/20' : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg'}`}>
                      {uploadingVideo ? 'Subiendo...' : '📹 Subir Video'}
                      <input type="file" className="hidden" accept="video/*" onChange={handleVideoUpload} disabled={uploadingVideo} />
                    </label>
                  </div>
                </label>

                <label className="block">
                  <span className="text-dim text-xs uppercase font-bold mb-2 block">Frase de Presentación</span>
                  <textarea 
                    value={currentScreen.data.phrase || ''} 
                    onChange={(e) => handleChangeData('phrase', e.target.value)}
                    rows="3"
                    className="w-full bg-white/5 border border-white/10 p-3 rounded-lg text-main text-sm"
                  />
                </label>

                <div className="grid grid-cols-2 gap-4">
                  <label className="block">
                    <span className="text-dim text-xs uppercase font-bold mb-2 block">Ancho Máximo Video (px)</span>
                    <input 
                      type="number" 
                      value={currentScreen.data.videoMaxWidth || 320} 
                      onChange={(e) => handleChangeData('videoMaxWidth', e.target.value)}
                      className="w-full bg-white/5 border border-white/10 p-3 rounded-lg text-main"
                    />
                  </label>
                  <label className="block">
                    <span className="text-dim text-xs uppercase font-bold mb-2 block">Tamaño de Fuente (px)</span>
                    <input 
                      type="number" 
                      value={currentScreen.data.fontSize || 24} 
                      onChange={(e) => handleChangeData('fontSize', e.target.value)}
                      className="w-full bg-white/5 border border-white/10 p-3 rounded-lg text-main"
                    />
                  </label>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <label className="block">
                    <span className="text-dim text-[10px] uppercase font-bold mb-2 block">Color Acento (Glow)</span>
                    <input 
                      type="text" 
                      value={currentScreen.data.accentColor} 
                      onChange={(e) => handleChangeData('accentColor', e.target.value)}
                      className="w-full bg-white/5 border border-white/10 p-2 rounded text-xs text-white"
                    />
                  </label>
                  <label className="block">
                    <span className="text-dim text-[10px] uppercase font-bold mb-2 block">Color Texto</span>
                    <input 
                      type="text" 
                      value={currentScreen.data.textColor} 
                      onChange={(e) => handleChangeData('textColor', e.target.value)}
                      className="w-full bg-white/5 border border-white/10 p-2 rounded text-xs text-white"
                    />
                  </label>
                  <label className="block">
                    <span className="text-dim text-[10px] uppercase font-bold mb-2 block">Color Borde Video</span>
                    <input 
                      type="text" 
                      value={currentScreen.data.borderColor} 
                      onChange={(e) => handleChangeData('borderColor', e.target.value)}
                      className="w-full bg-white/5 border border-white/10 p-2 rounded text-xs text-white"
                    />
                  </label>
                </div>

                <div className="flex items-center justify-between border-t border-white/5 pt-4">
                  <span className="text-xs text-dim">Continuar auto. al terminar video</span>
                  <input 
                    type="checkbox" 
                    checked={currentScreen.data.autoContinue} 
                    onChange={(e) => handleChangeData('autoContinue', e.target.checked)}
                    className="w-5 h-5 accent-emerald-500"
                  />
                </div>
              </div>
            )}

            {/* Campos de T17_STATEMENT */}
            {currentScreen?.templateId === 'T17_STATEMENT' && (
              <div className="space-y-6 animate-fade-in text-main">
                <label className="block">
                  <span className="text-dim text-xs uppercase font-bold mb-2 block">Frase Principal</span>
                  <textarea 
                    value={currentScreen.data.text || ''} 
                    onChange={(e) => handleChangeData('text', e.target.value)}
                    rows="4"
                    className="w-full bg-white/5 border border-white/10 p-3 rounded-lg text-main font-serif text-xl leading-relaxed"
                    placeholder="Escribe tu frase aquí..."
                  />
                </label>

                <div className="grid grid-cols-2 gap-4">
                  <label className="block">
                    <span className="text-dim text-xs uppercase font-bold mb-2 block">Tipo de Animación</span>
                    <select 
                      value={currentScreen.data.animationType || 'typewriter'} 
                      onChange={(e) => handleChangeData('animationType', e.target.value)}
                      className="w-full bg-white/5 border border-white/10 p-3 rounded-lg text-main shadow-lg"
                    >
                      <option value="typewriter">⌨️ Máquina de escribir</option>
                      <option value="fade">🌬️ Aparecer (Fade)</option>
                      <option value="blur">🌫️ Desenfoque (Blur)</option>
                      <option value="zoom">🔍 Zoom</option>
                    </select>
                  </label>
                  <label className="block">
                    <span className="text-dim text-xs uppercase font-bold mb-2 block">Tamaño de Fuente (rem/px)</span>
                    <input 
                      type="text" 
                      value={currentScreen.data.fontSize || '2.5rem'} 
                      onChange={(e) => handleChangeData('fontSize', e.target.value)}
                      className="w-full bg-white/5 border border-white/10 p-3 rounded-lg text-main"
                    />
                  </label>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <label className="block">
                    <span className="text-dim text-[10px] uppercase font-bold mb-2 block">Velocidad (1=Normal, 2=Rápido)</span>
                    <input 
                      type="range" 
                      min="0.2"
                      max="3"
                      step="0.1"
                      value={currentScreen.data.typingSpeed || 1} 
                      onChange={(e) => handleChangeData('typingSpeed', parseFloat(e.target.value))}
                      className="w-full accent-emerald-500"
                    />
                    <div className="text-[10px] text-right text-dim">{currentScreen.data.typingSpeed || 1}x</div>
                  </label>
                  <label className="block">
                    <span className="text-dim text-[10px] uppercase font-bold mb-2 block">Probar Audio</span>
                    <button 
                      onClick={() => {
                        const audio = new Audio(currentScreen.data.keySoundUrl);
                        audio.volume = currentScreen.data.volume || 0.2;
                        audio.play().catch(e => alert("Bloqueado por el navegador. Haz clic en la página primero."));
                      }}
                      className="w-full bg-white/5 border border-white/10 p-2 rounded text-[10px] text-white hover:bg-white/10"
                    >
                      🔊 Reproducir Test
                    </button>
                  </label>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <label className="block">
                    <span className="text-dim text-[10px] uppercase font-bold mb-2 block">Sonido de Tecla (URL MP3)</span>
                    <input 
                      type="text" 
                      value={currentScreen.data.keySoundUrl || ''} 
                      onChange={(e) => handleChangeData('keySoundUrl', e.target.value)}
                      className="w-full bg-white/5 border border-white/10 p-3 rounded-lg text-main text-[10px]"
                      placeholder="https://..."
                    />
                  </label>
                  <label className="block">
                    <span className="text-dim text-[10px] uppercase font-bold mb-2 block">Volumen (0.0 a 1.0)</span>
                    <input 
                      type="number" 
                      step="0.1"
                      min="0"
                      max="1"
                      value={currentScreen.data.volume || 0.2} 
                      onChange={(e) => handleChangeData('volume', parseFloat(e.target.value))}
                      className="w-full bg-white/5 border border-white/10 p-3 rounded-lg text-main"
                    />
                  </label>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <label className="block">
                    <span className="text-dim text-[10px] uppercase font-bold mb-2 block">Color Acento (Glow)</span>
                    <input 
                      type="text" 
                      value={currentScreen.data.accentColor} 
                      onChange={(e) => handleChangeData('accentColor', e.target.value)}
                      className="w-full bg-white/5 border border-white/10 p-2 rounded text-xs text-white"
                    />
                  </label>
                  <label className="block">
                    <span className="text-dim text-[10px] uppercase font-bold mb-2 block">Color Texto</span>
                    <input 
                      type="text" 
                      value={currentScreen.data.textColor} 
                      onChange={(e) => handleChangeData('textColor', e.target.value)}
                      className="w-full bg-white/5 border border-white/10 p-2 rounded text-xs text-white"
                    />
                  </label>
                  <label className="block">
                    <span className="text-dim text-[10px] uppercase font-bold mb-2 block">Color Fondo</span>
                    <input 
                      type="text" 
                      value={currentScreen.data.backgroundColor} 
                      onChange={(e) => handleChangeData('backgroundColor', e.target.value)}
                      className="w-full bg-white/5 border border-white/10 p-2 rounded text-xs text-white"
                    />
                  </label>
                </div>
              </div>
            )}

            {/* Campos de T18_PROMISE_CHECKLIST */}
            {currentScreen?.templateId === 'T18_PROMISE_CHECKLIST' && (
              <div className="space-y-6 animate-fade-in text-main">
                <div className="grid grid-cols-2 gap-4">
                  <label className="block">
                    <span className="text-dim text-[10px] uppercase font-bold mb-2 block">Tamaño Fuente Burbuja</span>
                    <input 
                      type="text" 
                      value={currentScreen.data.bubbleFontSize || '0.875rem'} 
                      onChange={(e) => handleChangeData('bubbleFontSize', e.target.value)}
                      className="w-full bg-black/60 border border-white/20 p-3 rounded-lg text-sm text-white focus:border-emerald-500/50 outline-none transition-all"
                      placeholder="0.875rem / 16px"
                    />
                  </label>
                  <label className="block">
                    <span className="text-dim text-[10px] uppercase font-bold mb-2 block">Tamaño Fuente Objetivos</span>
                    <input 
                      type="text" 
                      value={currentScreen.data.itemFontSize || '0.875rem'} 
                      onChange={(e) => handleChangeData('itemFontSize', e.target.value)}
                      className="w-full bg-black/60 border border-white/20 p-3 rounded-lg text-sm text-white focus:border-emerald-500/50 outline-none transition-all"
                      placeholder="0.875rem / 16px"
                    />
                  </label>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <label className="block">
                    <span className="text-dim text-xs uppercase font-bold mb-2 block">Personaje</span>
                    <input 
                      type="text" 
                      value={currentScreen.data.character || ''} 
                      onChange={(e) => handleChangeData('character', e.target.value)}
                      className="w-full bg-white/5 border border-white/10 p-3 rounded-lg text-main"
                    />
                  </label>
                  <label className="block">
                    <span className="text-dim text-xs uppercase font-bold mb-2 block">Color Acento</span>
                    <input 
                      type="text" 
                      value={currentScreen.data.accentColor || '#10b981'} 
                      onChange={(e) => handleChangeData('accentColor', e.target.value)}
                      className="w-full bg-white/5 border border-white/10 p-3 rounded-lg text-main"
                    />
                  </label>
                </div>

                <label className="block">
                  <span className="text-dim text-xs font-bold mb-2 block">Imagen de Misión (Personaje/Medalla)</span>
                  <div className="flex gap-2 mb-2">
                    <select 
                      value={AVATAR_IMAGES.some(a => a.id === currentScreen.data.avatarImage) ? currentScreen.data.avatarImage : 'custom'} 
                      onChange={(e) => {
                        if (e.target.value !== 'custom') handleChangeData('avatarImage', e.target.value);
                      }}
                      className="flex-1 bg-black/40 border border-white/10 p-2 rounded-lg text-main text-xs"
                    >
                      {AVATAR_IMAGES.map((av) => (
                        <option key={av.id} value={av.id}>{av.label}</option>
                      ))}
                      <option value="custom">URL / Imagen Personalizada...</option>
                    </select>
                    <label className={`cursor-pointer px-3 py-2 rounded-lg font-bold text-[10px] flex items-center gap-2 transition-all ${uploadingImage ? 'bg-white/5 text-white/20' : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg'}`}>
                      {uploadingImage ? '...' : 'Subir'}
                      <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploadingImage} />
                    </label>
                  </div>
                  <input 
                    type="text" 
                    placeholder="/avatars/mi-imagen.png"
                    value={currentScreen.data.avatarImage || ''} 
                    onChange={(e) => handleChangeData('avatarImage', e.target.value)}
                    className="w-full bg-black/40 border border-white/10 p-2 rounded-lg text-main text-xs"
                  />
                </label>

                <label className="block">
                  <span className="text-dim text-xs uppercase font-bold mb-2 block">Texto de la Burbuja</span>
                  <textarea 
                    value={currentScreen.data.bubbleText || ''} 
                    onChange={(e) => handleChangeData('bubbleText', e.target.value)}
                    rows="3"
                    className="w-full bg-white/5 border border-white/10 p-3 rounded-lg text-main italic"
                  />
                </label>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-dim text-xs uppercase font-bold">Objetivos de la Hoja de Ruta</span>
                    <button 
                      onClick={() => {
                        const newItems = [...(currentScreen.data.items || [])];
                        newItems.push({ id: generateId(), text: 'Nuevo objetivo', completed: false });
                        handleChangeData('items', newItems);
                      }}
                      className="text-[10px] bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full border border-emerald-500/30 hover:bg-emerald-500/40"
                    >
                      + Añadir Objetivo
                    </button>
                  </div>
                  
                  <div className="space-y-2">
                    {(currentScreen.data.items || []).map((item, idx) => (
                      <div key={item.id} className="flex gap-2 items-center bg-white/5 p-2 rounded-lg border border-white/5">
                        <input 
                          type="checkbox" 
                          checked={item.completed} 
                          onChange={(e) => {
                            const newItems = [...currentScreen.data.items];
                            newItems[idx].completed = e.target.checked;
                            handleChangeData('items', newItems);
                          }}
                          className="w-5 h-5 accent-emerald-500"
                        />
                        <input 
                          type="text" 
                          value={item.text} 
                          onChange={(e) => {
                            const newItems = [...currentScreen.data.items];
                            newItems[idx].text = e.target.value;
                            handleChangeData('items', newItems);
                          }}
                          className="flex-1 bg-transparent border-none text-sm text-white focus:ring-0"
                        />
                        <button 
                          onClick={() => {
                            const newItems = currentScreen.data.items.filter((_, i) => i !== idx);
                            handleChangeData('items', newItems);
                          }}
                          className="text-red-500/50 hover:text-red-500 px-2"
                        >
                          &times;
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <label className="block">
                  <span className="text-dim text-xs uppercase font-bold mb-2 block">Texto del Botón</span>
                  <input 
                    type="text" 
                    value={currentScreen.data.buttonText || 'VAMOS'} 
                    onChange={(e) => handleChangeData('buttonText', e.target.value)}
                    className="w-full bg-white/5 border border-white/10 p-3 rounded-lg text-main font-bold"
                  />
                </label>
              </div>
            )}

            {/* Campos de T19_MISSION_ACTION */}
            {currentScreen?.templateId === 'T19_MISSION_ACTION' && (
              <div className="space-y-6 animate-fade-in text-main">
                <div className="grid grid-cols-2 gap-4">
                  <label className="block">
                    <span className="text-dim text-xs uppercase font-bold mb-2 block">Título de la Misión</span>
                    <input 
                      type="text" 
                      value={currentScreen.data.missionTitle || ''} 
                      onChange={(e) => handleChangeData('missionTitle', e.target.value)}
                      className="w-full bg-white/5 border border-white/10 p-3 rounded-lg text-main"
                    />
                  </label>
                  <label className="block">
                    <span className="text-dim text-xs uppercase font-bold mb-2 block">Color Acento</span>
                    <input 
                      type="text" 
                      value={currentScreen.data.accentColor || '#10b981'} 
                      onChange={(e) => handleChangeData('accentColor', e.target.value)}
                      className="w-full bg-white/5 border border-white/10 p-3 rounded-lg text-main"
                    />
                  </label>
                </div>

                <label className="block">
                  <span className="text-dim text-xs uppercase font-bold mb-2 block">Instrucción Principal</span>
                  <textarea 
                    value={currentScreen.data.instruction || ''} 
                    onChange={(e) => handleChangeData('instruction', e.target.value)}
                    rows="4"
                    className="w-full bg-white/5 border border-white/10 p-3 rounded-lg text-main font-medium"
                  />
                </label>

                <div className="grid grid-cols-2 gap-4">
                  <label className="block">
                    <span className="text-dim text-xs uppercase font-bold mb-2 block">Botón Éxito (Siguiente)</span>
                    <input 
                      type="text" 
                      value={currentScreen.data.successButtonText || 'YA LA TENGO'} 
                      onChange={(e) => handleChangeData('successButtonText', e.target.value)}
                      className="w-full bg-white/5 border border-white/10 p-3 rounded-lg text-main"
                    />
                  </label>
                  <label className="block">
                    <span className="text-dim text-xs uppercase font-bold mb-2 block">Botón Ayuda</span>
                    <input 
                      type="text" 
                      value={currentScreen.data.helpButtonText || 'NO ENCUENTRO'} 
                      onChange={(e) => handleChangeData('helpButtonText', e.target.value)}
                      className="w-full bg-white/5 border border-white/10 p-3 rounded-lg text-main"
                    />
                  </label>
                </div>

                <label className="block">
                  <span className="text-dim text-xs uppercase font-bold mb-2 block">Mensaje de Ayuda/Sugerencia</span>
                  <textarea 
                    value={currentScreen.data.helpMessage || ''} 
                    onChange={(e) => handleChangeData('helpMessage', e.target.value)}
                    rows="2"
                    className="w-full bg-white/5 border border-white/10 p-3 rounded-lg text-main italic"
                    placeholder="Escribe aquí las sugerencias..."
                  />
                </label>

                <div className="grid grid-cols-2 gap-4">
                  <label className="block">
                    <span className="text-dim text-[10px] uppercase font-bold mb-2 block">Tamaño Fuente Título</span>
                    <input 
                      type="text" 
                      value={currentScreen.data.titleFontSize || '1.5rem'} 
                      onChange={(e) => handleChangeData('titleFontSize', e.target.value)}
                      className="w-full bg-black/60 border border-white/20 p-2 rounded text-xs text-white"
                    />
                  </label>
                  <label className="block">
                    <span className="text-dim text-[10px] uppercase font-bold mb-2 block">Tamaño Fuente Instrucción</span>
                    <input 
                      type="text" 
                      value={currentScreen.data.instructionFontSize || '1.1rem'} 
                      onChange={(e) => handleChangeData('instructionFontSize', e.target.value)}
                      className="w-full bg-black/60 border border-white/20 p-2 rounded text-xs text-white"
                    />
                  </label>
                </div>
              </div>
            )}

            {/* Campos de T20_BOTANICAL_RECORD */}
            {currentScreen?.templateId === 'T20_BOTANICAL_RECORD' && (
              <div className="space-y-6 animate-fade-in text-main">
                <label className="block">
                  <span className="text-dim text-xs uppercase font-bold mb-2 block">Título de la Pantalla</span>
                  <input 
                    type="text" 
                    value={currentScreen.data.title || ''} 
                    onChange={(e) => handleChangeData('title', e.target.value)}
                    className="w-full bg-white/5 border border-white/10 p-3 rounded-lg text-main"
                  />
                </label>

                <div className="space-y-4">
                  <span className="text-dim text-xs uppercase font-bold block">Configuración de Rasgos (Cards)</span>
                  {currentScreen.data.traits?.map((trait, idx) => (
                    <div key={trait.id} className="bg-white/5 p-4 rounded-2xl border border-white/10 space-y-3">
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          value={trait.icon} 
                          onChange={(e) => {
                            const newTraits = [...currentScreen.data.traits];
                            newTraits[idx].icon = e.target.value;
                            handleChangeData('traits', newTraits);
                          }}
                          className="w-12 bg-white/5 border border-white/10 p-2 rounded text-center"
                          placeholder="Emoji"
                        />
                        <input 
                          type="text" 
                          value={trait.label} 
                          onChange={(e) => {
                            const newTraits = [...currentScreen.data.traits];
                            newTraits[idx].label = e.target.value;
                            handleChangeData('traits', newTraits);
                          }}
                          className="flex-1 bg-white/5 border border-white/10 p-2 rounded text-sm font-bold"
                          placeholder="Nombre del Rasgo"
                        />
                      </div>
                      <input 
                        type="text" 
                        value={trait.options?.join(', ')} 
                        onChange={(e) => {
                          const newTraits = [...currentScreen.data.traits];
                          newTraits[idx].options = e.target.value.split(',').map(s => s.trim());
                          handleChangeData('traits', newTraits);
                        }}
                        className="w-full bg-white/5 border border-white/10 p-2 rounded text-xs text-dim"
                        placeholder="Opciones (separadas por coma)"
                      />
                    </div>
                  ))}
                </div>

                <label className="block">
                  <span className="text-dim text-xs uppercase font-bold mb-2 block">Texto del Botón</span>
                  <input 
                    type="text" 
                    value={currentScreen.data.buttonText || 'GUARDAR REGISTRO'} 
                    onChange={(e) => handleChangeData('buttonText', e.target.value)}
                    className="w-full bg-white/5 border border-white/10 p-3 rounded-lg text-main font-bold"
                  />
                </label>

                <label className="block">
                  <span className="text-dim text-xs uppercase font-bold mb-2 block">Placeholder de Notas (Opcional)</span>
                  <input 
                    type="text" 
                    value={currentScreen.data.notesPlaceholder || '¿Alguna observación extra? (Opcional)'} 
                    onChange={(e) => handleChangeData('notesPlaceholder', e.target.value)}
                    className="w-full bg-white/5 border border-white/10 p-3 rounded-lg text-main italic text-sm"
                  />
                </label>
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
