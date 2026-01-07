import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LogOut, Wallet, Shield, History, Bell, ChevronRight, User, RefreshCw, ShieldAlert, QrCode, Store } from 'lucide-react';
import { supabase } from '../supabaseClient';
import GBAAdminDeposit from './GBAAdminDeposit'; 
import GBATransfer from './GBATransfer'; 
import GBACare from './GBACare'; 
import GBAHistory from './GBAHistory';
import GBAAvisos from './GBAAvisos';
import GBAAdminPanel from './GBAAdminPanel';
import GBAMerchantPOS from './GBAMerchantPOS';
import GBASupervisorAuth from './GBASupervisorAuth'; 
import GBAPayTicket from './GBAPayTicket'; // <--- 1. IMPORTAR TICKET VISUAL

const GBADashboard = ({ user, onLogout }) => {
  const [saldo, setSaldo] = useState(0);
  const [loadingSaldo, setLoadingSaldo] = useState(true);
  
  // ESTADOS PARA LOS MODALES
  const [showAdminDeposit, setShowAdminDeposit] = useState(false); 
  const [showTransfer, setShowTransfer] = useState(false);         
  const [showCare, setShowCare] = useState(false); 
  const [showHistory, setShowHistory] = useState(false);
  const [showAvisos, setShowAvisos] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [showPOS, setShowPOS] = useState(false);
  const [showSupervisorAuth, setShowSupervisorAuth] = useState(false);
  const [ticketData, setTicketData] = useState(null); // <--- 2. NUEVO ESTADO PARA EL TICKET

  // Animaciones
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  const fetchSaldo = async () => {
    if (!user || !user.nombre) return;
    setLoadingSaldo(true);
    
    try {
      const { data, error } = await supabase
        .from('usuarios')
        .select('*') 
        .eq('nombre', user.nombre)
        .maybeSingle();

      if (error) throw error;
      
      if (data) {
        setSaldo(data.saldo || 0);
        Object.assign(user, data); 
      }
    } catch (err) {
      console.error('Error al obtener datos:', err);
    } finally {
      setLoadingSaldo(false);
    }
  };

  useEffect(() => {
    fetchSaldo();
  }, [user]);

  // --- 3. ACTUALIZADO: LOGICA PARA MOSTRAR TICKET VISUAL ---
  const handleGenerateToken = async () => {
    // Quitamos el confirm() para hacerlo más rápido y fluido
    try {
      const token = Math.floor(1000 + Math.random() * 9000).toString();
      
      const { error } = await supabase
        .from('usuarios')
        .update({ token_pago: token })
        .eq('nombre', user.nombre);

      if (error) throw error;
      
      // Guardamos el token en el estado para abrir el modal visual
      setTicketData(token); 

    } catch (error) {
      alert("Error generando el token: " + error.message);
    }
  };
  // ---------------------------------------------------------

  const handleTransferClick = () => {
    if (user?.rol === 'comercio') {
      setShowSupervisorAuth(true);
    } else {
      setShowTransfer(true);
    }
  };

  const formatMoney = (amount) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans p-6 md:p-12 relative overflow-hidden selection:bg-blue-500/30">
      
      {/* Fondo Ambiental */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-blue-900/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-emerald-900/10 rounded-full blur-[150px]" />
      </div>

      <motion.div 
        initial="hidden" 
        animate="visible" 
        variants={containerVariants}
        className="relative z-10 max-w-6xl mx-auto"
      >
        
        {/* --- HEADER --- */}
        <header className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-1 flex items-center gap-4">
              Hola, {user?.nombre || 'Ciudadano'}
              
              {user?.rol === 'Dueño' && (
                <button 
                  onClick={() => setShowAdminPanel(true)}
                  className="flex items-center gap-2 px-4 py-1.5 bg-red-600 text-white text-[10px] font-black uppercase rounded-full hover:bg-red-700 transition-all shadow-[0_0_20px_rgba(220,38,38,0.4)] border border-red-500/50"
                >
                  <ShieldAlert size={12} /> Mothership Command
                </button>
              )}
            </h1>
            <p className="text-neutral-500 text-sm">Bienvenido a tu centro de mando.</p>
          </div>
          <button 
            onClick={onLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 hover:bg-red-900/20 hover:border-red-500/50 hover:text-red-400 transition-all text-xs font-medium"
          >
            <LogOut size={14} /> Salir
          </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <motion.div variants={itemVariants} className="md:col-span-1">
            <div className="relative w-full aspect-[1.58/1] bg-gradient-to-br from-neutral-800 to-black rounded-3xl border border-white/10 overflow-hidden shadow-2xl group cursor-default">
               <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 mix-blend-overlay" />
               <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/30 blur-[60px] rounded-full" />
               
               <div className="relative z-10 p-6 h-full flex flex-col justify-between">
                 <div className="flex justify-between items-start">
                   <div className="grid grid-cols-2 gap-0.5 w-6 h-6">
                      <div className="bg-emerald-500 rounded-[1px]" />
                      <div className="bg-blue-500 rounded-[1px]" />
                      <div className="bg-blue-500 rounded-[1px]" />
                      <div className="bg-emerald-500 rounded-[1px]" />
                   </div>
                   <span className="font-mono text-[10px] text-white/50 tracking-widest">GBA OFFICIAL ID</span>
                 </div>
                 
                 <div>
                   <div className="text-lg font-bold text-white tracking-wide">{user?.nombre || 'USUARIO'}</div>
                   <div className="flex items-center gap-2 mt-1">
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/20 text-[10px] font-bold text-emerald-400">VERIFICADO</span>
                      <span className="text-[10px] text-neutral-500">{user?.nacion || 'Global'}</span>
                      {(user?.rol === 'admin' || user?.rol === 'Dueño') && <span className="text-[10px] text-yellow-500 font-bold border border-yellow-500/30 px-1 rounded uppercase">{user?.rol}</span>}
                      {user?.rol === 'comercio' && <span className="text-[10px] text-blue-400 font-bold border border-blue-400/30 px-1 rounded uppercase">COMERCIO</span>}
                   </div>
                 </div>
               </div>
            </div>

            <div className="mt-6 p-6 rounded-3xl bg-neutral-900/50 border border-white/5 backdrop-blur-md">
               <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400">
                     <User size={20} />
                  </div>
                  <div>
                     <div className="text-xs text-neutral-500">GBA Score</div>
                     <div className="text-lg font-bold text-white">500 <span className="text-xs font-normal text-neutral-600">pts</span></div>
                  </div>
               </div>
               <div className="w-full bg-neutral-800 h-1.5 rounded-full overflow-hidden">
                  <div className="w-1/2 h-full bg-blue-500 rounded-full" />
               </div>
               <p className="text-[10px] text-neutral-500 mt-2 text-center">Rango: {user?.rol || 'Ciudadano'}</p>
            </div>
          </motion.div>


          <div className="md:col-span-2 space-y-6">
            
            <motion.div variants={itemVariants} className="p-8 rounded-[2.5rem] bg-neutral-900/30 border border-white/10 backdrop-blur-md flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
               <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-500" />
               
               <div>
                  <div className="flex items-center gap-2 text-neutral-400 mb-2">
                     <Wallet size={16} />
                     <span className="text-xs font-bold tracking-widest uppercase">Saldo Disponible</span>
                     <button onClick={fetchSaldo} className="ml-2 hover:bg-white/10 p-1 rounded-full transition-colors" title="Actualizar saldo">
                        <RefreshCw size={12} className={loadingSaldo ? "animate-spin" : ""} />
                     </button>
                  </div>
                  
                  <div className="text-5xl font-bold text-white tracking-tighter">
                    {loadingSaldo ? "..." : formatMoney(saldo)}
                  </div>
                  
                  <p className="text-xs text-neutral-500 mt-2">Moneda segura respaldada por GBA.</p>
               </div>

               <div className="flex gap-3">
                  {(user?.rol === 'admin' || user?.rol === 'Dueño') ? (
                    <button 
                      onClick={() => setShowAdminDeposit(true)}
                      className="px-6 py-3 rounded-xl bg-emerald-500 text-black font-bold text-sm hover:bg-emerald-400 transition-colors shadow-[0_0_15px_rgba(16,185,129,0.3)] flex items-center gap-2"
                    >
                       <Shield size={16}/> Panel Cajero
                    </button>
                  ) : (
                    <button className="px-6 py-3 rounded-xl bg-white/5 text-neutral-500 font-bold text-sm border border-white/5 cursor-not-allowed">
                       Ingresar
                    </button>
                  )}

                  <button 
                    onClick={handleTransferClick}
                    className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-bold text-sm hover:bg-white/10 transition-colors"
                  >
                     Enviar
                  </button>

                  {user?.rol === 'comercio' ? (
                     <button 
                        onClick={() => setShowPOS(true)}
                        className="px-6 py-3 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-500 transition-colors shadow-[0_0_15px_rgba(37,99,235,0.4)] flex items-center gap-2"
                     >
                        <Store size={16} /> Cobrar
                     </button>
                  ) : (
                     <button 
                        onClick={handleGenerateToken}
                        className="px-6 py-3 rounded-xl bg-blue-500/10 border border-blue-500/50 text-blue-400 font-bold text-sm hover:bg-blue-500/20 transition-colors flex items-center gap-2"
                        title="Generar código de compra"
                     >
                        <QrCode size={16} /> GBA Pay
                     </button>
                  )}
               </div>
            </motion.div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
               <motion.button 
                 variants={itemVariants} 
                 onClick={() => setShowHistory(true)}
                 className="p-4 rounded-2xl bg-neutral-900/40 border border-white/5 hover:bg-neutral-800/40 hover:scale-[1.02] transition-all text-left group"
               >
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 mb-3 group-hover:bg-purple-500 group-hover:text-white transition-colors">
                     <History size={20} />
                  </div>
                  <div className="font-bold text-sm">Historial</div>
                  <div className="text-[10px] text-neutral-500">Últimos movimientos</div>
               </motion.button>

               <motion.button 
                 variants={itemVariants} 
                 onClick={() => setShowCare(true)} 
                 className="p-4 rounded-2xl bg-neutral-900/40 border border-white/5 hover:bg-neutral-800/40 hover:scale-[1.02] transition-all text-left group"
               >
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-3 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                     <Shield size={20} />
                  </div>
                  <div className="font-bold text-sm">Care+</div>
                  <div className="text-[10px] text-neutral-500">
                    {user?.care_status === 'activo' ? user.care_level : 'Sin póliza'}
                  </div>
               </motion.button>

               <motion.button 
                 variants={itemVariants} 
                 onClick={() => setShowAvisos(true)}
                 className="p-4 rounded-2xl bg-neutral-900/40 border border-white/5 hover:bg-neutral-800/40 hover:scale-[1.02] transition-all text-left group"
               >
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 mb-3 group-hover:bg-amber-500 group-hover:text-white transition-colors">
                     <Bell size={20} />
                  </div>
                  <div className="font-bold text-sm">Avisos</div>
                  <div className="text-[10px] text-neutral-500">Noticias y VISTA</div>
               </motion.button>
            </div>
            
            <motion.a 
              href="https://gimg-vista.vercel.app/"
              target="_blank" 
              rel="noopener noreferrer"
              variants={itemVariants} 
              className="p-6 rounded-3xl bg-black border border-white/10 relative overflow-hidden group cursor-pointer block"
            >
               <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1495020689067-958852a7765e?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-30 group-hover:opacity-40 transition-opacity" />
               <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent" />
               <div className="relative z-10 flex justify-between items-center">
                   <div>
                       <span className="text-[10px] font-bold text-red-500 tracking-widest uppercase mb-1 block">Ultima Hora</span>
                       <h3 className="text-xl font-serif italic text-white">VISTA Breaking News</h3>
                       <p className="text-xs text-neutral-400 mt-1">Accede con tu cuenta GBA</p>
                   </div>
                   <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-md group-hover:bg-white/20 transition-colors">
                       <ChevronRight size={16} />
                   </div>
               </div>
            </motion.a>

          </div>
        </div>
      </motion.div>

      {/* --- MODALES --- */}

      {showAdminDeposit && (
        <GBAAdminDeposit 
          onClose={() => setShowAdminDeposit(false)} 
          onDepositSuccess={() => fetchSaldo()}
        />
      )}

      {showTransfer && (
        <GBATransfer 
          currentUser={{ ...user, saldo }} 
          onClose={() => setShowTransfer(false)}
          onSuccess={() => fetchSaldo()}
        />
      )}

      {showCare && (
        <GBACare 
          currentUser={{ ...user, saldo }} 
          onClose={() => setShowCare(false)} 
          onUpdate={() => fetchSaldo()} 
        />
      )}

      {showHistory && (
        <GBAHistory 
          user={user} 
          onClose={() => setShowHistory(false)} 
        />
      )}

      {showAvisos && (
        <GBAAvisos 
          onClose={() => setShowAvisos(false)} 
        />
      )}

      {showAdminPanel && (
        <GBAAdminPanel 
          onClose={() => setShowAdminPanel(false)} 
        />
      )}

      {showPOS && (
        <GBAMerchantPOS
          onClose={() => setShowPOS(false)}
          onSuccess={() => fetchSaldo()}
        />
      )}

      {showSupervisorAuth && (
        <GBASupervisorAuth
          onClose={() => setShowSupervisorAuth(false)}
          onAuthorized={() => {
            setShowSupervisorAuth(false);
            setShowTransfer(true);
          }}
        />
      )}

      {/* 6. MODAL VISUAL DEL TICKET GBA PAY */}
      {ticketData && (
        <GBAPayTicket 
          token={ticketData} 
          onClose={() => setTicketData(null)} 
        />
      )}

    </div>
  );
};

export default GBADashboard;