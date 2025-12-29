import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Shield, Check, ChevronRight, Zap, Target, Box, Loader2 } from 'lucide-react';
import { supabase } from '../supabaseClient';

const PLANS = [
  {
    id: 'tier1',
    name: 'Eco Guard',
    tagline: 'Protección esencial para civiles.',
    price: 2500,
    icon: <Box size={32} className="text-blue-500" />,
    features: ['Recuperación de inventario', 'Remolque de vehículos civiles', 'Soporte técnico GBA']
  },
  {
    id: 'tier2',
    name: 'Tactical Shield',
    tagline: 'Para operaciones de campo activas.',
    price: 7500,
    icon: <Target size={32} className="text-emerald-500" />,
    features: ['Sustitución de blindados ligeros', 'Seguro de armamento táctico', 'Suministros médicos urgentes']
  },
  {
    id: 'tier3',
    name: 'Aegis Prime',
    tagline: 'La tranquilidad de la fuerza total.',
    price: 20000,
    icon: <Shield size={32} className="text-amber-500" />,
    features: ['Sustitución inmediata de Tanques', 'Apoyo aéreo de rescate', 'Cobertura total de base']
  }
];

const GBACare = ({ currentUser, onClose, onUpdate }) => {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const confirmPurchase = async () => {
    if (currentUser.saldo < selectedPlan.price) {
      alert('Fondos insuficientes');
      return;
    }

    setIsProcessing(true);
    try {
      const expireDate = new Date();
      expireDate.setDate(expireDate.getDate() + 7);

      // 1. Actualizar el estado del usuario
      const { error: updateError } = await supabase
        .from('usuarios')
        .update({
          saldo: currentUser.saldo - selectedPlan.price,
          care_level: selectedPlan.name,
          care_status: 'activo',
          care_expire: expireDate.toISOString()
        })
        .eq('nombre', currentUser.nombre);

      if (updateError) throw updateError;

      // 2. REGISTRAR EN EL HISTORIAL (NUEVO)
      const { error: historyError } = await supabase
        .from('transacciones')
        .insert([{
          emisor: currentUser.nombre,
          receptor: 'AEGIS CARE+',
          monto: selectedPlan.price,
          tipo: 'CARE+',
          detalles: `Suscripción semanal: ${selectedPlan.name}`
        }]);

      if (historyError) console.error("Error al registrar historial:", historyError);
      
      onUpdate();
      setSelectedPlan(null);
      onClose();
      alert(`Contrato ${selectedPlan.name} activado con éxito.`);
      
    } catch (err) {
      console.error(err);
      alert('Error en el sistema Aegis. Verifica la conexión con la base de datos.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-white text-black overflow-y-auto font-sans"
    >
      {/* HEADER ESTILO APPLE */}
      <nav className="sticky top-0 bg-white/80 backdrop-blur-md z-10 px-6 py-4 flex justify-between items-center border-b border-neutral-100">
        <span className="font-bold text-xl tracking-tight italic text-blue-600">Care+</span>
        <button onClick={onClose} className="p-2 hover:bg-neutral-100 rounded-full transition-colors">
          <X size={20} />
        </button>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-16">
        {/* TITULAR PRINCIPAL */}
        <header className="text-center mb-20">
          <motion.h1 
            initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
            className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6"
          >
            Cubrimos todos <br/> los ángulos.
          </motion.h1>
          <p className="text-xl text-neutral-500 max-w-2xl mx-auto font-medium">
            GBA Care+ ofrece la tranquilidad que necesitas, ya que protege todos tus activos tácticos por dentro y por fuera.
          </p>
        </header>

        {/* GRID DE PLANES ESTILO TARJETAS APPLE */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {PLANS.map((plan, idx) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              onClick={() => setSelectedPlan(plan)}
              className="group cursor-pointer bg-neutral-50 rounded-[2.5rem] p-10 flex flex-col items-center text-center hover:bg-neutral-100 transition-all duration-500 border border-transparent hover:border-neutral-200"
            >
              <div className="mb-8 transform group-hover:scale-110 transition-transform duration-500">
                {plan.icon}
              </div>
              <h2 className="text-3xl font-bold mb-2">{plan.name}</h2>
              <p className="text-neutral-500 mb-6 text-sm px-4 leading-relaxed">{plan.tagline}</p>
              <span className="mt-auto font-bold text-blue-600 flex items-center gap-1 group-hover:gap-3 transition-all">
                Obtener cobertura <ChevronRight size={18} />
              </span>
            </motion.div>
          ))}
        </div>

        {/* SECCIÓN DE BENEFICIOS */}
        <section className="bg-neutral-950 rounded-[3rem] p-12 md:p-20 text-white flex flex-col md:flex-row items-center gap-12">
           <div className="flex-1">
              <h2 className="text-4xl font-bold mb-6 italic tracking-tight">Reemplazo <br/> sin costo.</h2>
              <p className="text-neutral-400 text-lg mb-8 leading-relaxed font-light">
                Si pierdes tu tanque en combate o tu base es asediada, el servicio prioritario de Aegis te entrega equipo nuevo en tiempo récord.
              </p>
              <div className="flex gap-4">
                 <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center border border-white/5"><Zap className="text-amber-400" size={20} /></div>
                 <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center border border-white/5"><Shield className="text-blue-400" size={20} /></div>
              </div>
           </div>
           <div className="flex-1 flex justify-center">
              <div className="w-64 h-64 bg-gradient-to-br from-neutral-800 to-black rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex items-center justify-center border border-white/10 -rotate-3 hover:rotate-0 transition-transform duration-700 group">
                 <Shield size={80} className="text-white/20 group-hover:text-emerald-500/40 transition-colors" />
              </div>
           </div>
        </section>
      </div>

      {/* MODAL DE CONFIRMACIÓN (CHECKOUT) */}
      <AnimatePresence>
        {selectedPlan && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] bg-black/40 backdrop-blur-md flex items-end md:items-center justify-center p-4"
          >
            <motion.div 
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              className="bg-white w-full max-w-xl rounded-[2.5rem] p-10 text-center shadow-2xl"
            >
              <div className="mb-6 flex justify-center">{selectedPlan.icon}</div>
              <h3 className="text-4xl font-extrabold mb-2 tracking-tight">Confirmar {selectedPlan.name}</h3>
              <p className="text-neutral-500 mb-8 font-mono text-sm tracking-widest uppercase font-bold">Total a debitar: ${selectedPlan.price.toLocaleString()}</p>
              
              <ul className="text-left bg-neutral-50 rounded-2xl p-6 mb-8 space-y-4">
                {selectedPlan.features.map((f, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm font-bold">
                    <Check size={18} className="text-blue-600 shrink-0" /> {f}
                  </li>
                ))}
              </ul>

              <div className="flex flex-col gap-4">
                <button 
                  onClick={confirmPurchase}
                  disabled={isProcessing}
                  className="w-full bg-blue-600 text-white py-5 rounded-2xl font-bold text-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 flex items-center justify-center gap-2 disabled:bg-neutral-300"
                >
                  {isProcessing ? <Loader2 className="animate-spin" /> : "Confirmar Contrato"}
                </button>
                <button 
                  onClick={() => setSelectedPlan(null)}
                  className="w-full py-2 text-neutral-400 font-bold hover:text-black transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default GBACare;