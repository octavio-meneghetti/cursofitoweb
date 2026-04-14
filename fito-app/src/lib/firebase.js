import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Credenciales reales de CursoFitoWeb
const firebaseConfig = {
  apiKey: "AIzaSyCkFnEqGvkFsodmL1x4UCD1bQfD1h1jOrs",
  authDomain: "cursofitoweb.firebaseapp.com",
  projectId: "cursofitoweb",
  storageBucket: "cursofitoweb.firebasestorage.app",
  messagingSenderId: "460573573166",
  appId: "1:460573573166:web:dc2df7fb48169af90a5fbf",
  measurementId: "G-EV8M29WX8W"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
