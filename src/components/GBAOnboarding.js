import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, User, MessageSquare, Globe, Building2, Star, ShieldCheck, Check, Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '../supabaseClient';

const GBAOnboarding = ({ onBack, onComplete }) => {
  const [step, setStep] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState(''); // Estado para mostrar errores
  const [formData, setFormData] = useState({
    name: '',
    discord: '',
    zone: '', 
    pin: ''
  });

  const GBALogo = () => (
    <div className="grid grid-cols-2 gap-1 w-8 h-8 opacity-90">
      <div className="rounded-[2px] bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]" />
      <div className="rounded-[2px] bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.4)]" />
      <div className="rounded-[2px] bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.4)]" />
      <div className="rounded-[2px] bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]" />
    </div>
  );

  const handleNext = () => {
    if (step === 1 && !formData.name) return;
    setStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setErrorMsg(''); // Limpiamos errores al volver
    setStep((prev) => prev - 1);
  };

  const finalizarRegistro = async (finalPin) => {
    setIsSaving(true);
    setErrorMsg('');

    try {
      // ---------------------------------------------------------
      // PASO 1 DE SEGURIDAD: Verificar si el nombre ya existe
      // ---------------------------------------------------------
      const { data: usuarioExistente, error: errorBusqueda } = await supabase
        .from('usuarios')
        .select('id')
        .eq('nombre', formData.name)
        .maybeSingle();

      if (errorBusqueda) {
        throw errorBusqueda;
      }

      // Si "usuarioExistente" tiene datos, significa que YA EXISTE alguien con ese nombre
      if (usuarioExistente) {
        setErrorMsg(`El usuario "${formData.name}" ya existe. Elige otro nombre.`);
        setIsSaving(false);
        setFormData({ ...formData, pin: '' }); // Reseteamos el PIN para que intente de nuevo
        return; // ¡DETENEMOS TODO AQUÍ!
      }

      // ---------------------------------------------------------
      // PASO 2: Si no existe, procedemos a guardar
      // ---------------------------------------------------------
      const datosParaEnviar = {
        nombre: formData.name,
        discord_id: formData.discord,
        nacion: formData.zone,
        pin: finalPin
      };

      const { error: errorGuardado } = await supabase
        .from('usuarios')
        .insert([datosParaEnviar]);

      if (errorGuardado) {
        throw errorGuardado;
      }

      // ¡ÉXITO TOTAL!
      setStep(5);
      
    } catch (err) {
      console.error('Error:', err);
      setErrorMsg('Error del sistema. Intenta más tarde.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans flex flex-col items-center justify-center relative overflow-hidden selection:bg-blue-500/30">
      
      <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-blue-900/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-emerald-900/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-lg px-6">
        <div className="relative z-10">
          
          <div className="flex justify-center mb-12">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <GBALogo />
            </motion.div>
          </div>

          <AnimatePresence mode='wait'>
            
            {/* PASO 0: INTRO */}
            {step === 0 && (
              <motion.div key="intro" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="text-center">
                {onBack && (
                  <button onClick={onBack} className="absolute top-0 left-0 text-neutral-500 hover:text-white flex items-center gap-1 text-xs">
                    <ChevronLeft size={14}/> Volver
                  </button>
                )}
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">GBA ID</h1>
                <p className="text-xl text-neutral-400 mb-10 font-light">Una cuenta. Todo el ecosistema.</p>
                <button onClick={handleNext} className="bg-white text-black px-8 py-3 rounded-full font-medium hover:bg-neutral-200 transition-all transform hover:scale-105">Crear mi ID</button>
              </motion.div>
            )}

            {/* PASO 1: NOMBRE */}
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                <div className="text-center space-y-2">
                  <h2 className="text-2xl font-bold">¿Cómo te llamas?</h2>
                  <p className="text-neutral-500 text-sm">Tu nombre de usuario exacto en Empyria.</p>
                </div>
                <div className="relative group">
                  <User className="absolute left-0 top-3 text-neutral-600 group-focus-within:text-blue-500 transition-colors" size={20} />
                  <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="Tu nombre de usuario" className="w-full bg-transparent border-b border-white/20 py-3 pl-8 text-xl focus:outline-none focus:border-blue-500 transition-colors placeholder:text-neutral-700 font-medium" autoFocus />
                </div>
                <div className="flex justify-end pt-4">
                  <button onClick={handleNext} disabled={!formData.name} className="flex items-center gap-2 text-white/80 hover:text-white disabled:opacity-30 transition">Siguiente <ChevronRight size={20} /></button>
                </div>
              </motion.div>
            )}

            {/* PASO 2: DISCORD */}
            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                <button onClick={handleBack} className="text-neutral-600 hover:text-white mb-2"><ChevronLeft /></button>
                <div className="text-center space-y-2">
                  <h2 className="text-2xl font-bold">Contacto Seguro.</h2>
                  <p className="text-neutral-500 text-sm">Para notificaciones oficiales.</p>
                </div>
                <div className="relative group">
                  <MessageSquare className="absolute left-0 top-3 text-neutral-600 group-focus-within:text-indigo-500 transition-colors" size={20} />
                  <input type="text" value={formData.discord} onChange={(e) => setFormData({...formData, discord: e.target.value})} placeholder="Usuario de Discord (ej. User#1234)" className="w-full bg-transparent border-b border-white/20 py-3 pl-8 text-xl focus:outline-none focus:border-indigo-500 transition-colors placeholder:text-neutral-700 font-medium" autoFocus />
                </div>
                <div className="flex justify-end pt-4">
                  <button onClick={handleNext} className="flex items-center gap-2 text-white/80 hover:text-white transition">Continuar <ChevronRight size={20} /></button>
                </div>
              </motion.div>
            )}

            {/* PASO 3: ZONA */}
            {step === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                <button onClick={handleBack} className="text-neutral-600 hover:text-white mb-2"><ChevronLeft /></button>
                <div className="text-center space-y-2">
                  <h2 className="text-2xl font-bold">Tu zona de operación.</h2>
                </div>
                <div className="grid gap-3">
                  {[{ id: 'Occidente', icon: Building2, color: 'blue', label: 'Bloque Occidental' }, { id: 'Oriente', icon: Star, color: 'red', label: 'Bloque Oriental' }, { id: 'Neutral', icon: Globe, color: 'emerald', label: 'Neutral / Nómada' }].map((zoneOption) => (
                    <button key={zoneOption.id} onClick={() => { setFormData({...formData, zone: zoneOption.id}); handleNext(); }} className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-left group">
                      <div className={`w-10 h-10 rounded-full bg-${zoneOption.color}-500/10 flex items-center justify-center text-${zoneOption.color}-400 group-hover:text-white`}><zoneOption.icon size={20} /></div>
                      <div className="font-bold text-sm">{zoneOption.label}</div>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* PASO 4: PIN & GUARDADO */}
            {step === 4 && (
              <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8 text-center">
                {!isSaving && <button onClick={handleBack} className="absolute left-0 top-0 text-neutral-600 hover:text-white"><ChevronLeft /></button>}
                
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold">{isSaving ? "Verificando identidad..." : "Protege tu cuenta."}</h2>
                  <p className="text-neutral-500 text-sm">{isSaving ? "Consultando disponibilidad en Supabase." : "Crea un PIN de 4 dígitos."}</p>
                </div>

                {isSaving ? (
                  <div className="flex justify-center py-8"><Loader2 className="animate-spin text-blue-500" size={48} /></div>
                ) : (
                  <>
                    <div className="flex justify-center gap-4">
                      {[0, 1, 2, 3].map((i) => (<div key={i} className={`w-4 h-4 rounded-full border border-white/30 transition-all duration-300 ${formData.pin.length > i ? 'bg-white border-white scale-110' : 'bg-transparent'}`} />))}
                    </div>
                    
                    {/* Mensaje de Error (si existe el usuario) */}
                    {errorMsg && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-center gap-2 text-red-400 text-sm bg-red-900/20 p-3 rounded-lg border border-red-500/20 mt-4">
                        <AlertCircle size={16} /> {errorMsg}
                      </motion.div>
                    )}

                    <input type="number" value={formData.pin} onChange={(e) => {
                        const val = e.target.value;
                        if (val.length <= 4) {
                          setFormData({...formData, pin: val});
                          if (val.length === 4) finalizarRegistro(val); 
                        }
                      }} className="opacity-0 absolute inset-0 h-full w-full cursor-pointer" autoFocus />
                    <p className="text-xs text-neutral-600 mt-4">Usa tu teclado numérico</p>
                  </>
                )}
              </motion.div>
            )}

            {/* PASO 5: ÉXITO */}
            {step === 5 && (
              <motion.div key="step5" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
                <div className="mb-6 flex justify-center">
                   <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(59,130,246,0.5)]"><Check className="text-white w-8 h-8" strokeWidth={3} /></div>
                </div>
                <h2 className="text-3xl font-bold mb-2">Bienvenido a la Alianza.</h2>
                <p className="text-neutral-400 mb-8">Tu identidad ha sido registrada.</p>
                <div className="relative w-full aspect-[1.58/1] bg-black rounded-2xl border border-white/10 overflow-hidden shadow-2xl mx-auto max-w-sm mb-8">
                  <div className="absolute inset-0 bg-gradient-to-br from-neutral-800 to-neutral-950" />
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 blur-[50px] rounded-full" />
                  <div className="relative z-10 p-6 h-full flex flex-col justify-between text-left">
                    <div className="flex justify-between items-start"><GBALogo /><span className="font-mono text-xs text-neutral-500 tracking-widest">GBA ID</span></div>
                    <div><div className="text-[10px] text-neutral-400 uppercase tracking-wider mb-1">Titular</div><div className="text-lg font-bold tracking-tight text-white">{formData.name}</div><div className="text-[10px] text-emerald-500 font-bold mt-1 flex items-center gap-1"><ShieldCheck size={10} /> REGISTRADO</div></div>
                  </div>
                </div>
                <button onClick={() => onComplete({ nombre: formData.name, nacion: formData.zone })} className="text-sm text-neutral-400 hover:text-white underline decoration-blue-500 underline-offset-4 transition-colors">Ir a mi Dashboard -></button>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default GBAOnboarding;