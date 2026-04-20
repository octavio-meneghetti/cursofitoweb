import { db } from './firebase';
import { doc, getDoc, setDoc, updateDoc, increment, serverTimestamp } from 'firebase/firestore';

/**
 * Servicio para gestionar el Nexo de Saberes (Repetición Espaciada)
 */
export const masteryService = {
  
  /**
   * Registra una interacción del usuario con un concepto específico
   * @param {string} userId - ID del alumno
   * @param {string} conceptId - Identificador del concepto (ej: bio_polaridad)
   * @param {boolean} success - Si la respuesta fue correcta
   * @param {object} metadata - Detalles adicionales (ej: error específico)
   */
  reportInteraction: async (userId, conceptId, success, metadata = {}) => {
    if (!userId || !conceptId) return;

    const masteryRef = doc(db, 'users', userId, 'mastery', conceptId);
    
    try {
      const docSnap = await getDoc(masteryRef);
      
      if (!docSnap.exists()) {
        // Primer encuentro con el concepto
        const initialInterval = success ? 1 : 0; // Si acierta, repasar en 1 día. Si falla, en 0 (mañana).
        await setDoc(masteryRef, {
          conceptId,
          successCount: success ? 1 : 0,
          failCount: success ? 0 : 1,
          interval: initialInterval,
          lastReview: serverTimestamp(),
          nextReview: new Date(Date.now() + initialInterval * 24 * 60 * 60 * 1000),
          masteryScore: success ? 20 : 0, // Escala 0-100
          history: [{ success, timestamp: Date.now(), ...metadata }]
        });
      } else {
        const data = docSnap.data();
        let newInterval = data.interval || 0;
        
        if (success) {
          // Algoritmo de crecimiento simple (estilo Anki)
          newInterval = newInterval === 0 ? 1 : Math.min(newInterval * 2, 30);
        } else {
          // Penalización por error
          newInterval = 0;
        }

        const newScore = Math.max(0, Math.min(100, (data.masteryScore || 0) + (success ? 10 : -15)));

        await updateDoc(masteryRef, {
          successCount: increment(success ? 1 : 0),
          failCount: increment(success ? 0 : 1),
          interval: newInterval,
          lastReview: serverTimestamp(),
          nextReview: new Date(Date.now() + newInterval * 24 * 60 * 60 * 1000),
          masteryScore: newScore,
          // Limitamos el historial para no saturar el doc
          history: [...(data.history || []).slice(-9), { success, timestamp: Date.now(), ...metadata }]
        });
      }

      // También guardamos un log global de errores para analíticas del docente
      if (!success) {
        await setDoc(doc(db, 'logs_errors', `${userId}_${Date.now()}`), {
          userId,
          conceptId,
          metadata,
          timestamp: serverTimestamp()
        });
      }

    } catch (err) {
      console.error("Error en MasteryService:", err);
    }
  },

  /**
   * Obtiene los conceptos que el usuario necesita reforzar
   * Prioriza aquellos cuya fecha de revisión ha pasado o tienen score bajo.
   */
  getReviewConcepts: async (userId) => {
    if (!userId) return [];
    
    try {
      const masteryColl = collection(db, 'users', userId, 'mastery');
      const snap = await getDocs(masteryColl);
      
      const now = Date.now();
      const concepts = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Filtramos conceptos que necesitan revisión:
      // 1. nextReview <= ahora (estimado)
      // 2. masteryScore < 70 (conceptos no dominados)
      const reviewSession = concepts
        .filter(c => {
          const nextReviewDate = c.nextReview?.toDate?.()?.getTime() || 0;
          return nextReviewDate <= now || (c.masteryScore || 0) < 70;
        })
        .sort((a, b) => (a.masteryScore || 0) - (b.masteryScore || 0)) // Peores primero
        .slice(0, 10); // Sesiones de 10 conceptos máximo

      return reviewSession;
    } catch (err) {
      console.error("Error obteniendo conceptos para revisión:", err);
      return [];
    }
  }
};
