import React, { useState } from 'react';
import { X, CreditCard, CheckCircle, AlertTriangle } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { motion } from 'framer-motion';

const GBAMerchantPOS = ({ onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState('');
  const [monto, setMonto] = useState('');
  const [status, setStatus] = useState(null); // null, 'success', 'error'
  const [msg, setMsg] = useState('');

  const handleCobro = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    try {
      // Llamada a la función segura de Supabase
      const { data, error } = await supabase
        .rpc('gba_cobro_token', {
          p_token_pago: token,
          p_comercio_gamertag: 'Espartan_Shop', // OJO: Aquí deberías poner user.nombre si lo pasas por props
          p_monto: parseInt(monto),
          p_concepto: 'Compra en Comercio'
        });

      if (error) throw error;

      if (data.success) {
        setStatus('success');
        setMsg(data.msg);
        setTimeout(() => {
          onSuccess(); // Actualizar saldo
          onClose();   // Cerrar modal
        }, 2000);
      } else {
        setStatus('error');
        setMsg(data.msg);
      }
    } catch (err) {
      setStatus('error');
      setMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }} 
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-md bg-[#1a1a1a] border border-blue-500/30 rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(0,100,255,0.2)]"
      >
        {/* Header Terminal */}
        <div className="bg-neutral-900 p-4 border-b border-white/10 flex justify-between items-center">
          <div className="flex items-center gap-2 text-blue-400">
            <CreditCard size={20} />
            <span className="font-bold tracking-widest">TERMINAL GBA</span>
          </div>
          <button onClick={onClose} className="text-neutral-500 hover:text-white"><X size={20} /></button>
        </div>

        <div className="p-6">
          {status === 'success' ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">¡Cobro Exitoso!</h3>
              <p className="text-neutral-400">{msg}</p>
            </div>
          ) : (
            <form onSubmit={handleCobro} className="space-y-4">
              
              <div>
                <label className="block text-xs font-bold text-neutral-500 mb-1 uppercase">Código del Cliente (Token)</label>
                <input 
                  type="text" 
                  maxLength="4"
                  placeholder="Ej: 8842"
                  className="w-full bg-black border border-white/10 rounded-lg p-3 text-center text-2xl tracking-[0.5em] text-white font-mono focus:border-blue-500 focus:outline-none"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-500 mb-1 uppercase">Monto a Cobrar ($)</label>
                <input 
                  type="number" 
                  placeholder="0.00"
                  className="w-full bg-black border border-white/10 rounded-lg p-3 text-white focus:border-blue-500 focus:outline-none"
                  value={monto}
                  onChange={(e) => setMonto(e.target.value)}
                  required
                />
              </div>

              {status === 'error' && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-red-400 text-sm">
                  <AlertTriangle size={16} />
                  {msg}
                </div>
              )}

              <button 
                type="submit" 
                disabled={loading}
                className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all shadow-lg disabled:opacity-50"
              >
                {loading ? 'Procesando...' : 'REALIZAR COBRO'}
              </button>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default GBAMerchantPOS;