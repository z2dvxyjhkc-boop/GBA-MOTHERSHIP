import React, { useState, useEffect } from 'react';
import { X, Megaphone, Users, Landmark, Send, Loader2, ShieldAlert, UserCog, Wallet, ArrowRight } from 'lucide-react';
import { supabase } from '../supabaseClient';

const GBAAdminPanel = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState('avisos');
  const [loading, setLoading] = useState(false);
  const [usersList, setUsersList] = useState([]);
  const [fetchingUsers, setFetchingUsers] = useState(false);
  
  // --- ESTADO PARA ECONOMÍA ---
  const [stats, setStats] = useState({ totalMoney: 0, activeCare: 0, avgMoney: 0 });

  // Estados para Avisos
  const [avisoData, setAvisoData] = useState({
    titulo: '', mensaje: '', categoria: 'NOTICIA', prioridad: false
  });

  // --- CARGAR USUARIOS ---
  const fetchUsers = async () => {
    setFetchingUsers(true);
    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .order('nombre', { ascending: true });
    
    if (!error) setUsersList(data);
    setFetchingUsers(false);
  };

  // --- CARGAR ESTADÍSTICAS GLOBALES ---
  const fetchStats = async () => {
    const { data, error } = await supabase.from('usuarios').select('saldo, care_status');
    if (!error && data) {
      const total = data.reduce((acc, curr) => acc + (curr.saldo || 0), 0);
      const care = data.filter(u => u.care_status === 'activo').length;
      setStats({
        totalMoney: total,
        activeCare: care,
        avgMoney: data.length > 0 ? Math.round(total / data.length) : 0
      });
    }
  };

  useEffect(() => {
    if (activeTab === 'usuarios' || activeTab === 'economia') fetchUsers();
    if (activeTab === 'economia') fetchStats();
  }, [activeTab]);

  // --- ACTUALIZAR SALDO O ROL ---
  const handleUpdateUser = async (userId, field, newValue) => {
    try {
      const { error } = await supabase
        .from('usuarios')
        .update({ [field]: newValue })
        .eq('id', userId);

      if (error) throw error;
      fetchUsers(); 
      if (activeTab === 'economia') fetchStats();
    } catch (err) {
      alert("Error al actualizar usuario: " + err.message);
    }
  };

  // --- PUBLICAR AVISO ---
  const handlePublishAviso = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Nota: Si usas el RPC de seguridad, cambia .insert por .rpc('publicar_aviso_dueño', {...})
      const { error } = await supabase.from('avisos').insert([avisoData]);
      if (error) throw error;
      alert("📣 Comunicado emitido correctamente");
      setAvisoData({ titulo: '', mensaje: '', categoria: 'NOTICIA', prioridad: false });
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl">
      <div className="bg-neutral-900 border border-white/10 w-full max-w-5xl h-[85vh] rounded-[3rem] flex flex-col overflow-hidden shadow-2xl">
        
        {/* HEADER */}
        <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/5">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-red-500/20 rounded-2xl border border-red-500/20">
              <ShieldAlert className="text-red-500" size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-black uppercase tracking-tighter italic">GBA MOTHERSHIP <span className="text-neutral-500">CONTROL</span></h2>
              <p className="text-[10px] text-red-500 font-black uppercase tracking-[0.2em]">Acceso de Seguridad Nivel: DUEÑO</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-white/10 rounded-full transition-colors"><X size={24} /></button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* SIDEBAR */}
          <div className="w-72 border-r border-white/5 p-6 space-y-2 bg-black/20">
            <button onClick={() => setActiveTab('avisos')} className={`w-full flex items-center gap-3 px-4 py-4 rounded-2xl text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'avisos' ? 'bg-white text-black shadow-lg shadow-white/10' : 'text-neutral-500 hover:text-white hover:bg-white/5'}`}>
              <Megaphone size={18} /> Avisos
            </button>
            <button onClick={() => setActiveTab('usuarios')} className={`w-full flex items-center gap-3 px-4 py-4 rounded-2xl text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'usuarios' ? 'bg-white text-black shadow-lg shadow-white/10' : 'text-neutral-500 hover:text-white hover:bg-white/5'}`}>
              <Users size={18} /> Ciudadanos
            </button>
            <button onClick={() => setActiveTab('economia')} className={`w-full flex items-center gap-3 px-4 py-4 rounded-2xl text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'economia' ? 'bg-white text-black shadow-lg shadow-white/10' : 'text-neutral-500 hover:text-white hover:bg-white/5'}`}>
              <Landmark size={18} /> Economía
            </button>
          </div>

          {/* CONTENT */}
          <div className="flex-1 p-10 overflow-y-auto bg-[#0a0a0a] custom-scrollbar">
            
            {/* --- TAB AVISOS --- */}
            {activeTab === 'avisos' && (
              <form onSubmit={handlePublishAviso} className="max-w-xl space-y-6">
                <div className="mb-10 text-center md:text-left">
                  <h3 className="text-2xl font-bold mb-2">Publicar Comunicado</h3>
                  <p className="text-neutral-500 text-sm italic">Este mensaje será visible para todos los usuarios en el centro de avisos.</p>
                </div>

                <div className="space-y-4">
                  <input required value={avisoData.titulo} onChange={e => setAvisoData({...avisoData, titulo: e.target.value})} placeholder="Título del Aviso" className="w-full bg-neutral-900 border border-white/5 rounded-2xl px-5 py-4 text-white focus:border-red-500 outline-none transition-all" />
                  <select value={avisoData.categoria} onChange={e => setAvisoData({...avisoData, categoria: e.target.value})} className="w-full bg-neutral-900 border border-white/5 rounded-2xl px-5 py-4 text-white outline-none">
                    <option value="NOTICIA">Noticia General</option>
                    <option value="VISTA">VISTA LIVE (Notificación Roja)</option>
                    <option value="OFERTA">Promoción Bancaria</option>
                    <option value="EVENTO">Alerta de Evento</option>
                  </select>
                  <textarea required rows="4" value={avisoData.mensaje} onChange={e => setAvisoData({...avisoData, mensaje: e.target.value})} placeholder="Cuerpo del mensaje..." className="w-full bg-neutral-900 border border-white/5 rounded-2xl px-5 py-4 text-white focus:border-red-500 outline-none resize-none" />
                  
                  <div className="flex items-center gap-4 bg-red-500/5 p-5 rounded-2xl border border-red-500/10">
                    <input type="checkbox" id="pri" checked={avisoData.prioridad} onChange={e => setAvisoData({...avisoData, prioridad: e.target.checked})} className="w-5 h-5 accent-red-500 cursor-pointer" />
                    <label htmlFor="pri" className="text-sm font-bold text-red-400 cursor-pointer">MARCAR COMO PRIORIDAD MÁXIMA</label>
                  </div>
                </div>

                <button disabled={loading} className="w-full bg-white text-black py-5 rounded-3xl font-black uppercase tracking-tighter hover:scale-[1.02] active:scale-95 transition-all">
                  {loading ? <Loader2 className="animate-spin mx-auto" /> : "Transmitir a la Red"}
                </button>
              </form>
            )}

            {/* --- TAB USUARIOS --- */}
            {activeTab === 'usuarios' && (
              <div className="space-y-6">
                <div className="flex justify-between items-end mb-8">
                  <h3 className="text-2xl font-bold">Registro de Ciudadanos</h3>
                  <button onClick={fetchUsers} className="text-xs text-neutral-500 hover:text-white underline uppercase tracking-widest font-bold">Refrescar Lista</button>
                </div>

                {fetchingUsers ? <div className="py-20 text-center font-bold text-neutral-500">Cargando base de datos...</div> : (
                  <div className="grid grid-cols-1 gap-4">
                    {usersList.map(u => (
                      <div key={u.id} className="bg-neutral-900/50 border border-white/5 rounded-3xl p-6 flex flex-col md:flex-row items-center gap-6 group hover:bg-neutral-800/50 transition-all">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <span className="text-lg font-bold text-white">{u.nombre}</span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${u.rol === 'Dueño' ? 'bg-red-500 text-white' : u.rol === 'admin' ? 'bg-blue-500 text-white' : 'bg-neutral-700 text-neutral-300'}`}>
                              {u.rol}
                            </span>
                          </div>
                          <div className="text-[10px] text-neutral-500 uppercase tracking-widest font-bold">Care+: {u.care_status === 'activo' ? u.care_level : 'Inactivo'}</div>
                        </div>

                        {/* EDITAR SALDO */}
                        <div className="flex items-center gap-3 bg-black/40 p-2 rounded-2xl border border-white/5">
                          <Wallet size={16} className="text-neutral-500 ml-2" />
                          <input 
                            type="number" 
                            defaultValue={u.saldo}
                            onBlur={(e) => handleUpdateUser(u.id, 'saldo', parseInt(e.target.value))}
                            className="bg-transparent w-24 text-sm font-mono font-bold text-emerald-400 outline-none"
                          />
                        </div>

                        {/* EDITAR ROL */}
                        <div className="flex items-center gap-3 bg-black/40 p-2 rounded-2xl border border-white/5">
                          <UserCog size={16} className="text-neutral-500 ml-2" />
                          <select 
                            value={u.rol}
                            onChange={(e) => handleUpdateUser(u.id, 'rol', e.target.value)}
                            className="bg-transparent text-xs font-bold text-white outline-none pr-4 cursor-pointer"
                          >
                            <option value="usuario">Ciudadano</option>
                            <option value="admin">Administrador</option>
                            <option value="Dueño">Dueño</option>
                          </select>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* --- TAB ECONOMÍA (NUEVA) --- */}
            {activeTab === 'economia' && (
              <div className="space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white/5 border border-white/5 p-8 rounded-[2rem] relative overflow-hidden group">
                    <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity">
                      <Landmark size={120} />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-neutral-500 mb-2">Masa Monetaria Total</p>
                    <h4 className="text-4xl font-bold text-emerald-400 font-mono">${stats.totalMoney.toLocaleString()}</h4>
                  </div>

                  <div className="bg-white/5 border border-white/5 p-8 rounded-[2rem]">
                    <p className="text-[10px] font-black uppercase tracking-widest text-neutral-500 mb-2">Riqueza x Ciudadano</p>
                    <h4 className="text-4xl font-bold text-white font-mono">${stats.avgMoney.toLocaleString()}</h4>
                  </div>

                  <div className="bg-white/5 border border-white/5 p-8 rounded-[2rem]">
                    <p className="text-[10px] font-black uppercase tracking-widest text-neutral-500 mb-2">Pólizas Care+ Activas</p>
                    <h4 className="text-4xl font-bold text-blue-500 font-mono">{stats.activeCare}</h4>
                  </div>
                </div>

                <div className="bg-black/30 border border-white/5 rounded-[2.5rem] p-8">
                  <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <ArrowRight className="text-red-500" size={20} /> 
                    Top 5 Ciudadanos más Influyentes
                  </h3>
                  <div className="space-y-4">
                    {usersList
                      .sort((a, b) => b.saldo - a.saldo)
                      .slice(0, 5)
                      .map((u, idx) => (
                        <div key={u.id} className="flex items-center justify-between border-b border-white/5 pb-4">
                          <div className="flex items-center gap-4">
                            <span className="text-neutral-600 font-mono font-bold">0{idx + 1}</span>
                            <span className="font-bold">{u.nombre}</span>
                          </div>
                          <span className="font-mono text-emerald-400 font-bold">${u.saldo.toLocaleString()}</span>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default GBAAdminPanel;