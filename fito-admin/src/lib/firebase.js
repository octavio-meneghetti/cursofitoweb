import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

// Credenciales reales de CursoFitoWeb (Específicas para ADMIN)
const firebaseConfig = {
  apiKey: "AIzaSyCkFnEqQvkPsodmL1x4VCDibQfDlh1jOrs",
  authDomain: "cursofitoweb.firebaseapp.com",
  projectId: "cursofitoweb",
  storageBucket: "cursofitoweb.firebasestorage.app",
  messagingSenderId: "460573573166",
  appId: "1:460573573166:web:d2e690048af32655555555",
  measurementId: "G-Q7XMXS0DRM"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
