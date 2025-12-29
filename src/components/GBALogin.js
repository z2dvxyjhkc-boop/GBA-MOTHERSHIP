import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, User, Lock, Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '../supabaseClient';

const GBALogin = ({ onBack, onLoginSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    pin: ''
  });

  // LOGO GBA
  const GBALogo = () => (
    <div className="grid grid-cols-2 gap-1 w-8 h-8 opacity-90 mx-auto mb-6">
      <div className="rounded-[2px] bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]" />
      <div className="rounded-[2px] bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.4)]" />
      <div className="rounded-[2px] bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.4)]" />
      <div className="rounded-[2px] bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]" />
    </div>
  );

  // --- FUNCIÓN DE LOGIN ---
  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');

    try {
      // 1. Buscamos en Supabase alguien que coincida con Nombre Y Pin
const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('nombre', formData.name) // Supabase distingue mayúsculas/minúsculas
        .eq('pin', formData.pin)
        .maybeSingle(); // <--- CAMBIO CLAVE: Usamos maybeSingle en vez de single

      // Con maybeSingle, si no existe el usuario, 'data' será null y no habrá error 406
      if (error || !data) {
        setErrorMsg('Credenciales incorrectas. Revisa mayúsculas y PIN.');
        setIsLoading(false);
      } else {
        onLoginSuccess(data);
      }
    } catch (err) {
      setErrorMsg('Error de conexión. Intenta más tarde.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans flex flex-col items-center justify-center relative overflow-hidden selection:bg-blue-500/30">
      
      {/* Fondo */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-blue-900/10 rounded-full blur-[120px] pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md px-6 relative z-10"
      >
        <button onClick={onBack} className="absolute top-0 left-6 text-neutral-500 hover:text-white flex items-center gap-1 text-xs transition-colors">
           <ChevronLeft size={14}/> Volver
        </button>

        <div className="text-center mb-8 mt-8">
           <GBALogo />
           <h1 className="text-3xl font-bold tracking-tight mb-2">Bienvenido de nuevo.</h1>
           <p className="text-neutral-400 text-sm">Ingresa tus credenciales de GBA ID.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
           
           {/* Input Nombre */}
           <div className="relative group">
              <User className="absolute left-0 top-3 text-neutral-600 group-focus-within:text-blue-500 transition-colors" size={20} />
              <input 
                type="text" 
                placeholder="Nombre de usuario"
                className="w-full bg-transparent border-b border-white/20 py-3 pl-8 text-lg focus:outline-none focus:border-blue-500 transition-colors placeholder:text-neutral-700 font-medium text-white"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
           </div>

           {/* Input PIN */}
           <div className="relative group">
              <Lock className="absolute left-0 top-3 text-neutral-600 group-focus-within:text-emerald-500 transition-colors" size={20} />
              <input 
                type="password" 
                maxLength={4}
                placeholder="PIN de seguridad"
                className="w-full bg-transparent border-b border-white/20 py-3 pl-8 text-lg focus:outline-none focus:border-emerald-500 transition-colors placeholder:text-neutral-700 font-medium text-white tracking-widest"
                value={formData.pin}
                onChange={(e) => setFormData({...formData, pin: e.target.value})}
              />
           </div>

           {/* Mensaje de Error */}
           {errorMsg && (
             <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 text-red-400 text-xs bg-red-900/20 p-3 rounded-lg border border-red-500/20">
                <AlertCircle size={16} />
                {errorMsg}
             </motion.div>
           )}

           {/* Botón Login */}
           <button 
             type="submit" 
             disabled={isLoading || !formData.name || !formData.pin}
             className="w-full bg-white text-black py-4 rounded-full font-bold hover:bg-neutral-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
           >
             {isLoading ? <Loader2 className="animate-spin" /> : "Acceder a mi Dashboard"}
           </button>
        </form>

      </motion.div>
    </div>
  );
};

export default GBALogin;