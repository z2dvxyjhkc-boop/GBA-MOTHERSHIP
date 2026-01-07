import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Lock, UserCheck, ShieldAlert } from 'lucide-react';
import { supabase } from '../supabaseClient';

const GBASupervisorAuth = ({ onClose, onAuthorized }) => {
  const [supervisor, setSupervisor] = useState('');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const { data, error } = await supabase
        .rpc('gba_validar_supervisor', {
          p_supervisor: supervisor,
          p_pin: pin
        });

      if (error) throw error;

      if (data.success) {
        // Si es correcto, llamamos a la función que abre la transferencia
        onAuthorized();
      } else {
        setErrorMsg(data.msg);
      }

    } catch (err) {
      setErrorMsg('Error de conexión o validación.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }} 
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-sm bg-neutral-900 border border-red-500/30 rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(220,38,38,0.2)]"
      >
        {/* Header de Seguridad */}
        <div className="bg-red-900/20 p-4 border-b border-red-500/20 flex justify-between items-center">
          <div className="flex items-center gap-2 text-red-500">
            <ShieldAlert size={20} />
            <span className="font-bold tracking-widest text-xs uppercase">Bloqueo de Seguridad</span>
          </div>
          <button onClick={onClose} className="text-neutral-500 hover:text-white"><X size={20} /></button>
        </div>

        <div className="p-6">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-3 text-red-500">
              <Lock size={32} />
            </div>
            <h3 className="text-lg font-bold text-white">Autorización Requerida</h3>
            <p className="text-xs text-neutral-400 mt-1">Esta es una cuenta comercial.<br/>Se requiere firma del Gerente para retirar fondos.</p>
          </div>

          <form onSubmit={handleVerify} className="space-y-4">
            <div>
              <label className="text-[10px] font-bold text-neutral-500 uppercase">Gamertag del Supervisor</label>
              <input 
                type="text" 
                placeholder="Ej: Santiago"
                className="w-full bg-black border border-white/10 rounded-lg p-3 text-white focus:border-red-500 focus:outline-none"
                value={supervisor}
                onChange={(e) => setSupervisor(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-neutral-500 uppercase">PIN de Seguridad</label>
              <input 
                type="password" 
                placeholder="****"
                maxLength="4"
                className="w-full bg-black border border-white/10 rounded-lg p-3 text-white focus:border-red-500 focus:outline-none tracking-widest"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                required
              />
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-xs text-center font-bold">
                {errorMsg}
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2"
            >
              {loading ? 'Verificando...' : <><UserCheck size={18} /> AUTORIZAR ACCESO</>}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default GBASupervisorAuth;