import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Bell, Radio, Tag, Megaphone, ExternalLink } from 'lucide-react';
import { supabase } from '../supabaseClient';

const GBAAvisos = ({ onClose }) => {
  const [avisos, setAvisos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAvisos = async () => {
      const { data, error } = await supabase
        .from('avisos')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error) setAvisos(data);
      setLoading(false);
    };
    fetchAvisos();
  }, []);

  const getIcon = (cat) => {
    switch (cat) {
      case 'VISTA': return <Radio className="text-red-500" size={18} />;
      case 'OFERTA': return <Tag className="text-emerald-400" size={18} />;
      default: return <Megaphone className="text-blue-400" size={18} />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
      <motion.div 
        initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }}
        className="bg-neutral-900 border border-white/10 w-full max-w-xl rounded-[2.5rem] overflow-hidden shadow-2xl"
      >
        <div className="p-8 border-b border-white/5 flex justify-between items-center bg-gradient-to-r from-blue-600/10 to-transparent">
          <div className="flex items-center gap-3">
            <div className="relative">
               <Bell className="text-white" size={24} />
               <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-ping"></span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight">Centro de Avisos</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-6 space-y-4">
          {loading ? (
            <div className="text-center py-20 text-neutral-500 font-medium">Sincronizando feed...</div>
          ) : avisos.length === 0 ? (
            <div className="text-center py-20 text-neutral-500 italic">No hay comunicados recientes.</div>
          ) : (
            avisos.map((aviso) => (
              <div 
                key={aviso.id} 
                className={`p-5 rounded-3xl border transition-all ${
                  aviso.prioridad ? 'bg-red-500/5 border-red-500/20' : 'bg-white/5 border-white/5'
                }`}
              >
                <div className="flex items-center gap-2 mb-3">
                  {getIcon(aviso.categoria)}
                  <span className={`text-[10px] font-black uppercase tracking-widest ${
                    aviso.categoria === 'VISTA' ? 'text-red-500' : 'text-neutral-500'
                  }`}>
                    {aviso.categoria}
                  </span>
                  <span className="text-[10px] text-neutral-600 ml-auto">
                    {new Date(aviso.created_at).toLocaleDateString()}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{aviso.titulo}</h3>
                <p className="text-sm text-neutral-400 leading-relaxed mb-4">{aviso.mensaje}</p>
                
                {aviso.categoria === 'VISTA' && (
                  <button className="flex items-center gap-2 text-xs font-bold text-red-500 hover:text-red-400 transition-colors uppercase tracking-tighter">
                    Sintonizar VISTA LIVE <ExternalLink size={12} />
                  </button>
                )}
              </div>
            ))
          )}
        </div>

        <div className="p-4 bg-white/5 text-center">
           <p className="text-[10px] text-neutral-600 font-bold uppercase tracking-widest">Global Bank Alliance • Broadcast System</p>
        </div>
      </motion.div>
    </div>
  );
};

export default GBAAvisos;