import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

// Credenciales compartidas de CursoFitoWeb
const firebaseConfig = {
  apiKey: "AIzaSyCkFnEqQvkPsodmL1x4VCDibQfDlh1jOrs",
  authDomain: "cursofitoweb.firebaseapp.com",
  projectId: "cursofitoweb",
  storageBucket: "cursofitoweb.firebasestorage.app",
  messagingSenderId: "460573573166",
  appId: "1:460573573166:web:d2e690048af32655555555", // Usando Admin App ID por defecto
  measurementId: "G-Q7XMXS0DRM"
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

export default app;
