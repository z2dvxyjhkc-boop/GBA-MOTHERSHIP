import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, CreditCard, Wallet, CheckCircle, AlertTriangle, Loader2, DollarSign } from 'lucide-react';
import { supabase } from '../supabaseClient';

// AHORA RECIBIMOS 'currentUser' PARA SABER QUIÉN ES EL COMERCIO
const GBAMerchantPOS = ({ onClose, onSuccess, currentUser }) => {
  const [tokenInput, setTokenInput] = useState('');
  const [amount, setAmount] = useState('');
  const [status, setStatus] = useState('idle'); // idle, searching, processing, success, error
  const [clientInfo, setClientInfo] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  // 1. BUSCAR CLIENTE POR TOKEN
  const handleSearchToken = async () => {
    if (tokenInput.length < 4) return;
    setStatus('searching');
    setErrorMsg('');

    try {
      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('token_pago', tokenInput)
        .single();

      if (error || !data) {
        setStatus('error');
        setErrorMsg('Token inválido o expirado.');
        return;
      }

      setClientInfo(data);
      setStatus('idle');
    } catch (err) {
      setStatus('error');
      setErrorMsg('Error de conexión.');
    }
  };

  // 2. PROCESAR EL COBRO (LA LÓGICA MAESTRA)
  const handleCharge = async () => {
    if (!amount || isNaN(amount) || amount <= 0) {
      alert("Ingresa un monto válido.");
      return;
    }
    if (!clientInfo) return;
    
    // Verificación de seguridad para el comercio
    if (!currentUser || !currentUser.nombre) {
      alert("Error crítico: No se puede identificar tu cuenta de comercio.");
      return;
    }

    setStatus('processing');
    const cobro = parseFloat(amount);
    
    // Identificar modo de pago (Débito o Crédito)
    const modoPago = clientInfo.token_modo || 'debit'; 

    try {
      // --- PASO 1: COBRAR AL CLIENTE ---
      if (modoPago === 'credit') {
        const creditoDisponible = clientInfo.credito_limite - clientInfo.credito_usado;
        
        // Validaciones
        if (creditoDisponible < cobro) throw new Error("Línea de crédito insuficiente.");
        if (!clientInfo.credito_activo) throw new Error("La tarjeta de crédito del cliente está bloqueada.");

        // Ejecutar cobro: Aumentar deuda al cliente
        const { error: userError } = await supabase
          .from('usuarios')
          .update({
            credito_usado: clientInfo.credito_usado + cobro,
            token_pago: null // Quemar el token
          })
          .eq('id', clientInfo.id);
        
        if (userError) throw userError;

      } else {
        // Modo Débito
        if (clientInfo.saldo < cobro) throw new Error("Fondos insuficientes en tarjeta de débito.");

        // Ejecutar cobro: Restar saldo al cliente
        const { error: userError } = await supabase
          .from('usuarios')
          .update({
            saldo: clientInfo.saldo - cobro,
            token_pago: null // Quemar el token
          })
          .eq('id', clientInfo.id);

        if (userError) throw userError;
      }

      // --- PASO 2: PAGAR AL COMERCIO (TÚ) ---
      // Aquí es donde el dinero entra a TU cuenta
      
      // Primero obtenemos tu saldo más reciente para evitar errores de sincronización
      const { data: merchantData, error: merchantFetchError } = await supabase
        .from('usuarios')
        .select('saldo')
        .eq('nombre', currentUser.nombre)
        .single();

      if (merchantFetchError) throw merchantFetchError;

      const nuevoSaldoComercio = merchantData.saldo + cobro;

      const { error: depositError } = await supabase
        .from('usuarios')
        .update({ saldo: nuevoSaldoComercio })
        .eq('nombre', currentUser.nombre);

      if (depositError) throw depositError;

      // --- PASO 3: REGISTRAR HISTORIAL ---
      await supabase.from('transacciones').insert([{
        emisor: clientInfo.nombre,
        receptor: currentUser.nombre, // <--- AHORA SÍ APARECE TU NOMBRE
        monto: cobro,
        tipo: 'VENTA',
        detalles: `GBA Pay (${modoPago === 'credit' ? 'Crédito' : 'Débito'})`
      }]);

      setStatus('success');
      setTimeout(() => {
        onSuccess(); // Esto recargará el dashboard para que veas tu nuevo saldo
        onClose();
      }, 2000);

    } catch (err) {
      console.error(err);
      setStatus('error');
      setErrorMsg(err.message || "Error procesando el pago.");
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 font-sans"
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
        className="bg-neutral-900 w-full max-w-md rounded-3xl border border-white/10 shadow-2xl overflow-hidden flex flex-col"
      >
        {/* HEADER */}
        <div className="bg-neutral-800 p-4 flex justify-between items-center border-b border-white/5">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            <span className="font-bold text-white tracking-widest text-sm">GBA TERMINAL v2.0</span>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X size={18} className="text-neutral-400" />
          </button>
        </div>

        <div className="p-6 flex flex-col gap-6">
          
          {/* DISPLAY DE MONTO */}
          <div className="relative">
             <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 text-2xl font-light">$</span>
             <input 
               type="number" 
               value={amount}
               onChange={(e) => setAmount(e.target.value)}
               placeholder="0.00"
               className="w-full bg-black border-2 border-neutral-700 rounded-2xl py-6 pl-10 pr-6 text-right text-4xl text-white font-mono focus:outline-none focus:border-blue-500 transition-colors placeholder:text-neutral-700"
               autoFocus
             />
          </div>

          {/* ZONA DE TOKEN */}
          {!clientInfo ? (
            <div className="flex gap-2">
              <input 
                type="text" 
                maxLength={4}
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                placeholder="Ingresar Token (4 dígitos)"
                className="flex-1 bg-neutral-800 border border-neutral-700 rounded-xl px-4 text-center text-white tracking-[0.5em] font-bold focus:border-blue-500 focus:outline-none uppercase"
              />
              <button 
                onClick={handleSearchToken}
                disabled={tokenInput.length < 4}
                className="bg-blue-600 text-white p-4 rounded-xl disabled:opacity-50 hover:bg-blue-500 transition-colors"
              >
                <Search size={20} />
              </button>
            </div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="bg-neutral-800/50 rounded-2xl p-4 border border-white/5"
            >
               <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="text-xs text-neutral-500 mb-1">CLIENTE DETECTADO</div>
                    <div className="text-lg font-bold text-white">{clientInfo.nombre}</div>
                    <div className="text-xs text-neutral-400">{clientInfo.nacion}</div>
                  </div>
                  {clientInfo.token_modo === 'credit' ? (
                     <div className="bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-2">
                        <CreditCard size={12} /> CRÉDITO
                     </div>
                  ) : (
                     <div className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-2">
                        <Wallet size={12} /> DÉBITO
                     </div>
                  )}
               </div>
               
               <button 
                 onClick={() => { setClientInfo(null); setTokenInput(''); }}
                 className="text-xs text-red-400 hover:text-red-300 underline"
               >
                 Cancelar / Cambiar Cliente
               </button>
            </motion.div>
          )}

          {/* MENSAJES DE ESTADO */}
          {status === 'error' && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl flex items-center gap-3 text-sm">
              <AlertTriangle size={18} />
              {errorMsg}
            </div>
          )}

          {status === 'success' && (
             <div className="bg-green-500/10 border border-green-500/20 text-green-400 p-3 rounded-xl flex items-center gap-3 text-sm font-bold justify-center">
               <CheckCircle size={18} />
               ¡Cobro Exitoso!
             </div>
          )}

        </div>

        {/* FOOTER / BOTÓN DE COBRO */}
        <div className="p-4 bg-neutral-800 border-t border-white/5">
          <button
            onClick={handleCharge}
            disabled={!clientInfo || !amount || status === 'processing' || status === 'success'}
            className="w-full bg-emerald-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-emerald-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2"
          >
            {status === 'processing' ? <Loader2 className="animate-spin" /> : <><DollarSign size={20} /> COBRAR AHORA</>}
          </button>
        </div>

      </motion.div>
    </motion.div>
  );
};

export default GBAMerchantPOS;