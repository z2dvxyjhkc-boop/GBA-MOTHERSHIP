import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, ArrowDownLeft, ArrowUpRight, Shield, Loader2, Clock } from 'lucide-react';
import { supabase } from '../supabaseClient';

const GBAHistory = ({ user, onClose }) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      // Buscamos donde el usuario sea emisor O receptor
      const { data, error } = await supabase
        .from('transacciones')
        .select('*')
        .or(`emisor.eq.${user.nombre},receptor.eq.${user.nombre}`)
        .order('created_at', { ascending: false });

      if (!error) setTransactions(data);
      setLoading(false);
    };

    fetchHistory();
  }, [user.nombre]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
        className="bg-neutral-900 border border-white/10 w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl"
      >
        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/5">
          <div className="flex items-center gap-3">
            <Clock className="text-blue-400" size={20} />
            <h2 className="text-xl font-bold">Historial de Actividad</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-6 space-y-4 custom-scrollbar">
          {loading ? (
            <div className="flex flex-col items-center py-20 text-neutral-500">
              <Loader2 className="animate-spin mb-2" size={32} />
              <p>Consultando registros...</p>
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-20 text-neutral-500 italic">
              No hay movimientos registrados en esta cuenta.
            </div>
          ) : (
            transactions.map((tx) => {
              const isOutgoing = tx.emisor === user.nombre;
              return (
                <div key={tx.id} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      tx.tipo === 'CARE+' ? 'bg-emerald-500/20 text-emerald-400' :
                      isOutgoing ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'
                    }`}>
                      {tx.tipo === 'CARE+' ? <Shield size={18} /> : 
                       isOutgoing ? <ArrowUpRight size={18} /> : <ArrowDownLeft size={18} />}
                    </div>
                    <div>
                      <div className="font-bold text-sm">
                        {tx.tipo === 'DEPOSITO' ? 'Ingreso de Efectivo' :
                         tx.tipo === 'CARE+' ? `Seguro ${tx.detalles}` :
                         isOutgoing ? `Enviado a ${tx.receptor}` : `Recibido de ${tx.emisor}`}
                      </div>
                      <div className="text-[10px] text-neutral-500 uppercase tracking-wider">
                        {new Date(tx.created_at).toLocaleString()} • {tx.detalles}
                      </div>
                    </div>
                  </div>
                  <div className={`font-mono font-bold ${isOutgoing ? 'text-white' : 'text-emerald-400'}`}>
                    {isOutgoing ? '-' : '+'}${tx.monto.toLocaleString()}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default GBAHistory;