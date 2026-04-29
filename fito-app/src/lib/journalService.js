import { db } from './firebase';
import { doc, getDoc, setDoc, addDoc, collection, getDocs, serverTimestamp } from 'firebase/firestore';

/**
 * Servicio para gestionar el Cuaderno de Campo (Diarios y Decisiones)
 */
export const journalService = {
  
  /**
   * Guarda una entrada en el cuaderno de campo.
   * @param {string} userId - ID del alumno
   * @param {string} conceptId - ID del concepto (ej: bio_polaridad)
   * @param {object} entryData - Datos a guardar (respuestas del diario o decisiones)
   */
  saveEntry: async (userId, conceptId, entryData) => {
    if (!userId || !conceptId || !entryData) return;

    // Guardamos en la colección journal para crear registros secuenciales (sin sobreescribir)
    const journalColl = collection(db, 'users', userId, 'journal');
    
    try {
      await addDoc(journalColl, {
        conceptId,
        data: entryData,
        createdAt: serverTimestamp(),
        lastUpdated: serverTimestamp()
      });
      console.log("LOG: Entrada de cuaderno guardada exitosamente:", conceptId);
    } catch (err) {
      console.error("LOG ERROR: Fallo al guardar en cuaderno de campo:", err);
    }
  },

  /**
   * Obtiene todas las entradas del cuaderno de campo del usuario.
   */
  getAllEntries: async (userId) => {
    if (!userId) return [];
    
    try {
      const journalColl = collection(db, 'users', userId, 'journal');
      const snap = await getDocs(journalColl);
      
      const entries = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // Ordenar por creación (más antiguos primero, nuevos abajo)
      return entries.sort((a, b) => {
        const timeA = a.createdAt?.toDate?.()?.getTime() || a.lastUpdated?.toDate?.()?.getTime() || 0;
        const timeB = b.createdAt?.toDate?.()?.getTime() || b.lastUpdated?.toDate?.()?.getTime() || 0;
        return timeA - timeB;
      });
    } catch (err) {
      console.error("LOG ERROR: Error obteniendo entradas del cuaderno:", err);
      return [];
    }
  }
};
