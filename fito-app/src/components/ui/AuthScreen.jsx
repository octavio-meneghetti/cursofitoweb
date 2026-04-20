import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { auth } from '../../lib/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';

const AuthScreen = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        // Enviar log detallado si falla el registro
        console.log("Intentando registrar usuario:", email);
        await createUserWithEmailAndPassword(auth, email, password);
      }
      onAuthSuccess();
    } catch (err) {
      console.error("DEBUG AUTH ERROR:", {
        code: err.code,
        message: err.message,
        email: email,
        fullError: err
      });
      
      let friendlyMessage = 'Error en la conexión con la red micelial.';
      
      switch (err.code) {
        case 'auth/user-not-found':
          friendlyMessage = 'El Guardián no existe en los registros.';
          break;
        case 'auth/wrong-password':
          friendlyMessage = 'La llave (contraseña) no es correcta.';
          break;
        case 'auth/email-already-in-use':
          friendlyMessage = 'Este correo ya pertenece a otro Guardián.';
          break;
        case 'auth/weak-password':
          friendlyMessage = 'La contraseña es muy débil (mínimo 6 caracteres).';
          break;
        case 'auth/invalid-email':
          friendlyMessage = 'El formato del correo micelial es inválido.';
          break;
        case 'auth/network-request-failed':
          friendlyMessage = 'Error de conexión. Revisa tu internet.';
          break;
        default:
          friendlyMessage = `Error en la conexión con la red micelial (${err.code}).`;
      }
      
      setError(friendlyMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#060608] flex items-center justify-center p-6 z-[200]">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-500/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-500/10 blur-[120px] rounded-full" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm glass-panel p-8 relative overflow-hidden"
      >
        <div className="text-center mb-10">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="w-20 h-20 border-2 border-emerald-500/30 rounded-full mx-auto mb-4 flex items-center justify-center relative"
          >
            <span className="text-4xl">🌿</span>
            <div className="absolute inset-x-0 -bottom-1 h-0.5 bg-emerald-500 shadow-[0_0_15px_#10b981]" />
          </motion.div>
          <h1 className="text-2xl font-black tracking-[0.2em] text-white">FITO <span className="text-emerald-500 text-sm italic">ALDEA</span></h1>
          <p className="text-white/40 text-[10px] uppercase font-bold tracking-widest mt-2 px-10">
            {isLogin ? 'Ingresa a tu Red Micelial' : 'Crea tu Identidad de Guardián'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-emerald-500/70 tracking-widest ml-1">Email</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl text-white focus:border-emerald-500/50 focus:bg-emerald-500/5 outline-none transition-all"
              placeholder="alumno@fitoweb.com"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-emerald-500/70 tracking-widest ml-1">Contraseña</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl text-white focus:border-emerald-500/50 focus:bg-emerald-500/5 outline-none transition-all"
              placeholder="••••••••"
            />
          </div>

          <AnimatePresence>
            {error && (
              <motion.p 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="text-red-400 text-xs font-bold text-center"
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>

          <button 
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-emerald-500 text-black font-black uppercase tracking-widest rounded-2xl shadow-[0_0_40px_rgba(16,185,129,0.2)] hover:scale-[1.02] active:scale-95 transition-all relative overflow-hidden group"
          >
            {loading ? (
              <div className="w-6 h-6 border-2 border-black/30 border-t-black rounded-full animate-spin mx-auto" />
            ) : (
              <span className="flex items-center justify-center gap-2">
                {isLogin ? 'ENTRAR' : 'REGISTRARSE'} 
                <span className="text-xl">➔</span>
              </span>
            )}
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
          </button>
        </form>

        <div className="mt-8 text-center">
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="text-white/30 text-[10px] font-bold uppercase tracking-widest hover:text-emerald-400 transition-colors"
          >
            {isLogin ? '¿No tienes cuenta? Registrate' : '¿Ya tienes cuenta? Ingresa'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default AuthScreen;
