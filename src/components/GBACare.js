import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Shield, Check, ChevronRight, Zap, Target, Box, Loader2, CreditCard, AlertTriangle, Trash2 } from 'lucide-react';
import { supabase } from '../supabaseClient';

// --- CONFIGURACIÓN ---
const DISCORD_WEBHOOK_URL = "https://discord.com/api/webhooks/1454921751300669576/0D76QmjUjFVSIxOHCGxRqu_Zcjw1I4MY-HEtt-ylN1BBOuxNSH7NZ5DEZLdFhnO82jCa"; 
const TREASURY_ACCOUNT = "Aegis_Corp"; // <--- LA CUENTA QUE RECIBE EL DINERO

const PLANS = [
  {
    id: 'tier1',
    name: 'Eco Guard',
    tagline: 'Protección esencial para civiles.',
    price: 2500,
    creditLimit: 1500,
    icon: <Box size={32} className="text-blue-500" />,
    features: ['Recuperación de inventario', 'Remolque de vehículos civiles', 'Soporte técnico GBA', 'Línea de Crédito: $1,500']
  },
  {
    id: 'tier2',
    name: 'Tactical Shield',
    tagline: 'Para operaciones de campo activas.',
    price: 7500,
    creditLimit: 5000,
    icon: <Target size={32} className="text-emerald-500" />,
    features: ['Sustitución de blindados ligeros', 'Seguro de armamento táctico', 'Suministros médicos urgentes', 'Línea de Crédito: $5,000']
  },
  {
    id: 'tier3',
    name: 'Aegis Prime',
    tagline: 'La tranquilidad de la fuerza total.',
    price: 20000,
    creditLimit: 15000,
    icon: <Shield size={32} className="text-amber-500" />,
    features: ['Sustitución inmediata de Tanques', 'Apoyo aéreo de rescate', 'Cobertura total de base', 'Línea de Crédito: $15,000']
  }
];

const GBACare = ({ currentUser, onClose, onUpdate }) => {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [showSuccess, setShowSuccess] = useState(false);
  const [successData, setSuccessData] = useState(null);
  const [showCancel, setShowCancel] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  // --- LOGS A DISCORD ---
  const sendDiscordLog = async (type, data) => {
    if (!DISCORD_WEBHOOK_URL || DISCORD_WEBHOOK_URL.includes("TU_URL")) return;

    const isPurchase = type === 'COMPRA';
    const color = isPurchase ? 5763719 : 15548997;
    const title = isPurchase ? "🛡️ Nuevo Contrato Care+" : "🚫 Cancelación de Servicio";

    const embed = {
      title: title,
      color: color,
      fields: [
        { name: "Usuario", value: currentUser.nombre, inline: true },
        { name: "Nivel / Plan", value: isPurchase ? data.planName : "Cancelado", inline: true },
        { name: "Monto", value: isPurchase ? `$${data.price}` : "$0", inline: true },
        ...(isPurchase ? [
          { name: "Crédito Aprobado", value: `$${data.creditLimit}`, inline: false }
        ] : [
          { name: "Motivo de Baja", value: data.reason, inline: false }
        ]),
        { name: "Fecha", value: new Date().toLocaleString(), inline: false }
      ],
      footer: { text: "GBA Banking System • Aegis Security" }
    };

    try {
      await fetch(DISCORD_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ embeds: [embed] })
      });
    } catch (error) {
      console.error("Error webhook:", error);
    }
  };

  // --- LÓGICA DE COMPRA (CON DEPÓSITO A TESORERÍA) ---
  const confirmPurchase = async () => {
    if (currentUser.saldo < selectedPlan.price) {
      alert('Fondos insuficientes');
      return;
    }

    setIsProcessing(true);
    try {
      // 1. OBTENER SALDO DE LA TESORERÍA (AEGIS CORP)
      const { data: treasuryData, error: treasuryError } = await supabase
        .from('usuarios')
        .select('saldo')
        .eq('nombre', TREASURY_ACCOUNT)
        .single();

      if (treasuryError) {
        console.error("Error buscando cuenta tesorería:", treasuryError);
        alert(`Error crítico: No se encuentra la cuenta ${TREASURY_ACCOUNT}. Contacta al admin.`);
        return; // Detenemos todo si no existe la cuenta destino
      }

      const expireDate = new Date();
      expireDate.setDate(expireDate.getDate() + 7);

      // 2. ACTUALIZAR AL USUARIO (RESTA) Y ACTIVAR TARJETA
      const { error: userError } = await supabase
        .from('usuarios')
        .update({
          saldo: currentUser.saldo - selectedPlan.price,
          care_level: selectedPlan.name,
          care_status: 'activo',
          care_expire: expireDate.toISOString(),
          credito_limite: selectedPlan.creditLimit,
          credito_activo: true
        })
        .eq('nombre', currentUser.nombre);

      if (userError) throw userError;

      // 3. ACTUALIZAR TESORERÍA (SUMA) - ¡AQUÍ ESTÁ EL DINERO!
      const { error: depositError } = await supabase
        .from('usuarios')
        .update({
          saldo: treasuryData.saldo + selectedPlan.price
        })
        .eq('nombre', TREASURY_ACCOUNT);

      if (depositError) console.error("Error depositando a tesorería (dinero en limbo):", depositError);

      // 4. LOGS E HISTORIAL
      await supabase.from('transacciones').insert([{
        emisor: currentUser.nombre,
        receptor: TREASURY_ACCOUNT, // Ahora el receptor es Aegis
        monto: selectedPlan.price,
        tipo: 'CARE+',
        detalles: `Suscripción: ${selectedPlan.name}`
      }]);
      
      sendDiscordLog('COMPRA', {
        planName: selectedPlan.name,
        price: selectedPlan.price,
        creditLimit: selectedPlan.creditLimit
      });

      setSuccessData(selectedPlan);
      setSelectedPlan(null);
      setShowSuccess(true);
      
    } catch (err) {
      console.error(err);
      alert('Error en el sistema Aegis.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancelPlan = async () => {
    if (!cancelReason.trim()) {
      alert("Por favor, escribe un motivo breve.");
      return;
    }

    setIsProcessing(true);
    try {
      const { error } = await supabase
        .from('usuarios')
        .update({
          care_status: 'cancelado',
          care_level: null,
          credito_limite: 0,
          credito_activo: false
        })
        .eq('nombre', currentUser.nombre);

      if (error) throw error;

      await supabase.from('transacciones').insert([{
        emisor: currentUser.nombre,
        receptor: 'AEGIS ADMIN',
        monto: 0,
        tipo: 'CANCELACION',
        detalles: `Motivo: ${cancelReason}`
      }]);

      sendDiscordLog('CANCELACION', { reason: cancelReason });

      alert("Plan cancelado y crédito revocado.");
      onUpdate();
      setShowCancel(false);
      onClose();

    } catch (err) {
      console.error(err);
      alert("Error al cancelar.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCloseSuccess = () => {
    setShowSuccess(false);
    onUpdate();
    onClose();
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-white text-black overflow-y-auto font-sans"
    >
      <nav className="sticky top-0 bg-white/80 backdrop-blur-md z-10 px-6 py-4 flex justify-between items-center border-b border-neutral-100">
        <span className="font-bold text-xl tracking-tight italic text-blue-600">Care+</span>
        <button onClick={onClose} className="p-2 hover:bg-neutral-100 rounded-full transition-colors">
          <X size={20} />
        </button>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-16">
        
        <header className="text-center mb-16">
          <motion.h1 
            initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
            className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6"
          >
            Protección total. <br/> Crédito ilimitado.
          </motion.h1>
          <p className="text-xl text-neutral-500 max-w-2xl mx-auto font-medium">
            Al contratar GBA Care+, no solo proteges tus activos. También desbloqueas una línea de crédito exclusiva en GBA Bank.
          </p>
        </header>

        {currentUser.care_status === 'activo' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="mb-20 bg-neutral-50 border border-neutral-200 rounded-[2rem] p-8 flex flex-col md:flex-row items-center justify-between gap-6"
          >
            <div className="flex items-center gap-4">
               <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                  <Shield size={32} />
               </div>
               <div>
                  <h3 className="text-2xl font-bold">Plan Actual: {currentUser.care_level}</h3>
                  <p className="text-neutral-500">Tu cobertura y tarjeta de crédito están activas.</p>
               </div>
            </div>
            <button 
              onClick={() => setShowCancel(true)}
              className="px-6 py-3 bg-white border border-red-200 text-red-600 font-bold rounded-xl hover:bg-red-50 transition-colors flex items-center gap-2"
            >
               <Trash2 size={18} /> Cancelar Suscripción
            </button>
          </motion.div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {PLANS.map((plan, idx) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              onClick={() => setSelectedPlan(plan)}
              className={`group cursor-pointer rounded-[2.5rem] p-10 flex flex-col items-center text-center transition-all duration-500 border ${currentUser.care_level === plan.name ? 'bg-blue-50 border-blue-200 ring-2 ring-blue-500 ring-offset-2' : 'bg-neutral-50 border-transparent hover:bg-neutral-100 hover:border-neutral-200'}`}
            >
              <div className="mb-8 transform group-hover:scale-110 transition-transform duration-500">
                {plan.icon}
              </div>
              <h2 className="text-3xl font-bold mb-2">{plan.name}</h2>
              <div className="text-sm font-bold bg-neutral-200 px-3 py-1 rounded-full mb-4 flex items-center gap-1">
                 <CreditCard size={12} /> Crédito: ${plan.creditLimit.toLocaleString()}
              </div>
              <p className="text-neutral-500 mb-6 text-sm px-4 leading-relaxed">{plan.tagline}</p>
              <span className="mt-auto font-bold text-blue-600 flex items-center gap-1 group-hover:gap-3 transition-all">
                {currentUser.care_level === plan.name ? 'Plan Actual' : 'Seleccionar'} <ChevronRight size={18} />
              </span>
            </motion.div>
          ))}
        </div>

        <section className="bg-neutral-950 rounded-[3rem] p-12 md:p-20 text-white flex flex-col md:flex-row items-center gap-12">
           <div className="flex-1">
              <h2 className="text-4xl font-bold mb-6 italic tracking-tight">Financia <br/> tus ambiciones.</h2>
              <p className="text-neutral-400 text-lg mb-8 leading-relaxed font-light">
                Con Care+, obtienes acceso inmediato a una tarjeta de crédito GBA Black, Gold o Silver. Compra ahora y paga después.
              </p>
              <div className="flex gap-4">
                 <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center border border-white/5"><CreditCard className="text-purple-400" size={20} /></div>
                 <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center border border-white/5"><Shield className="text-blue-400" size={20} /></div>
              </div>
           </div>
           <div className="flex-1 flex justify-center">
              <div className="w-80 h-48 bg-gradient-to-br from-neutral-800 to-black rounded-2xl shadow-[0_20px_50px_rgba(255,255,255,0.1)] flex flex-col justify-between p-6 border border-white/10 -rotate-6 hover:rotate-0 transition-transform duration-700">
                 <div className="flex justify-between items-start">
                    <div className="text-white/50 text-xs font-mono">GBA CREDIT</div>
                    <CreditCard className="text-yellow-500" />
                 </div>
                 <div>
                    <div className="text-white font-mono text-lg tracking-widest">**** **** 9988</div>
                    <div className="text-white/40 text-xs mt-2">MEMBER SINCE 2025</div>
                 </div>
              </div>
           </div>
        </section>
      </div>

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

      <AnimatePresence>
        {showSuccess && successData && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[120] bg-black/90 backdrop-blur-xl flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              className="bg-neutral-900 border border-white/10 w-full max-w-md rounded-[3rem] p-8 text-center relative overflow-hidden"
            >
               <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-blue-500/20 to-transparent pointer-events-none" />

               <div className="relative z-10">
                 <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(34,197,94,0.5)]">
                    <Check size={40} className="text-white" strokeWidth={3} />
                 </div>
                 
                 <h2 className="text-3xl font-bold text-white mb-2">¡Suscripción Activada!</h2>
                 <p className="text-neutral-400 mb-8">Eres oficialmente miembro de {successData.name}.</p>

                 <div className="bg-gradient-to-br from-neutral-800 to-black rounded-2xl p-6 border border-yellow-500/30 mb-8 shadow-2xl transform rotate-1 hover:rotate-0 transition-transform">
                    <div className="flex justify-between items-center mb-4">
                       <span className="text-yellow-500 text-xs font-bold tracking-widest uppercase">GBA CREDIT UNLOCKED</span>
                       <CreditCard className="text-yellow-500" size={20} />
                    </div>
                    <div className="text-left">
                       <div className="text-neutral-400 text-xs uppercase">Línea de Crédito Aprobada</div>
                       <div className="text-4xl font-mono text-white font-bold">${successData.creditLimit.toLocaleString()}</div>
                    </div>
                 </div>

                 <button 
                   onClick={handleCloseSuccess}
                   className="w-full bg-white text-black py-4 rounded-2xl font-bold hover:bg-neutral-200 transition-colors"
                 >
                    Ir al Dashboard
                 </button>
               </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showCancel && (
          <motion.div 
             initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
             className="fixed inset-0 z-[120] bg-black/50 backdrop-blur-md flex items-center justify-center p-4"
          >
             <motion.div 
               initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
               className="bg-white w-full max-w-lg rounded-[2.5rem] p-8 shadow-2xl"
             >
                <div className="flex items-center gap-3 text-red-600 mb-4">
                   <AlertTriangle size={32} />
                   <h3 className="text-2xl font-bold">Cancelar Suscripción</h3>
                </div>
                <p className="text-neutral-600 mb-6 leading-relaxed">
                   Al cancelar, perderás la cobertura de seguro inmediatamente y <strong>tu tarjeta de crédito será desactivada</strong>. La deuda pendiente deberá ser pagada con tu saldo de débito.
                </p>

                <label className="block text-sm font-bold text-neutral-800 mb-2">¿Por qué deseas cancelar?</label>
                <textarea 
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="El servicio es muy caro, no lo uso..."
                  className="w-full bg-neutral-100 rounded-xl p-4 text-sm mb-6 focus:outline-none focus:ring-2 focus:ring-red-500"
                  rows={3}
                />

                <div className="flex gap-3">
                   <button 
                     onClick={() => setShowCancel(false)}
                     className="flex-1 py-4 bg-neutral-100 text-neutral-600 font-bold rounded-xl hover:bg-neutral-200 transition-colors"
                   >
                      Volver
                   </button>
                   <button 
                     onClick={handleCancelPlan}
                     disabled={isProcessing}
                     className="flex-1 py-4 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors shadow-lg shadow-red-200"
                   >
                      {isProcessing ? <Loader2 className="animate-spin mx-auto" /> : "Confirmar Baja"}
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