import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Fingerprint, Coins, ArrowRightLeft, Radio, Menu, X, ExternalLink, CheckCircle2, Globe, ArrowRight, CreditCard, Lock } from 'lucide-react';

const GBAMothership = ({ onOpenID, onOpenLogin }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // --- LOGO GBA PERSONALIZADO ---
  const GBALogo = () => (
    <div className="grid grid-cols-2 gap-1 p-1 bg-white/5 rounded-md border border-white/10 backdrop-blur-sm shadow-[0_0_15px_rgba(255,255,255,0.1)]">
      <div className="w-2.5 h-2.5 rounded-[2px] bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-sm" />
      <div className="w-2.5 h-2.5 rounded-[2px] bg-gradient-to-br from-blue-400 to-blue-600 shadow-sm" />
      <div className="w-2.5 h-2.5 rounded-[2px] bg-gradient-to-br from-blue-400 to-blue-600 shadow-sm" />
      <div className="w-2.5 h-2.5 rounded-[2px] bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-sm" />
    </div>
  );

  // Animaciones
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-blue-500/30 overflow-x-hidden relative">
      
      {/* --- LUCES DE FONDO --- */}
      <div className="fixed top-0 left-1/4 w-[800px] h-[800px] bg-blue-900/10 rounded-full blur-[120px] -z-10 pointer-events-none" />
      <div className="fixed bottom-0 right-1/4 w-[600px] h-[600px] bg-emerald-900/05 rounded-full blur-[120px] -z-10 pointer-events-none" />

      {/* --- NAVBAR --- */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-black/70 backdrop-blur-xl transition-all">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          
          {/* LOGO */}
          <div className="flex items-center gap-3 group cursor-default">
             <GBALogo />
             <span className="font-bold text-lg tracking-tight text-white/90 group-hover:text-white transition-colors">
               GlobalBank <span className="text-white/50 font-normal">Alliance</span>
             </span>
          </div>

          {/* MENÚ DESKTOP */}
          <div className="hidden md:flex items-center gap-6">
            <a href="#servicios" className="text-sm text-neutral-400 hover:text-white transition-colors">Servicios</a>
            <a href="#gimg" className="text-sm text-neutral-400 hover:text-white transition-colors">Media</a>
            
            <button 
              onClick={onOpenLogin}
              className="text-sm font-medium text-white hover:text-blue-400 transition-colors"
            >
              Entrar
            </button>

            <button 
              onClick={onOpenID} 
              className="bg-white text-black px-5 py-2 rounded-full text-xs font-bold hover:bg-neutral-200 transition-all shadow-[0_0_20px_rgba(255,255,255,0.15)] flex items-center gap-2"
            >
              <Fingerprint size={14} /> GBA ID
            </button>
          </div>

          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden text-white">
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
        
        {/* MENÚ MÓVIL */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-16 left-0 w-full bg-black/95 backdrop-blur-2xl border-b border-white/10 p-6 flex flex-col gap-4 shadow-2xl z-50">
            <a href="#servicios" onClick={() => setIsMenuOpen(false)} className="text-lg font-medium text-neutral-300 hover:text-white">Servicios</a>
            <a href="#gimg" onClick={() => setIsMenuOpen(false)} className="text-lg font-medium text-neutral-300 hover:text-white">Media</a>
            
            <button 
              onClick={() => {
                onOpenID();
                setIsMenuOpen(false);
              }}
              className="bg-blue-600 active:bg-blue-700 text-white py-3 rounded-xl font-bold mt-2 shadow-[0_0_15px_rgba(37,99,235,0.3)] transition-all"
            >
              Crear GBA ID
            </button>

            <button 
              onClick={() => {
                onOpenLogin();
                setIsMenuOpen(false);
              }}
              className="text-neutral-400 text-sm font-medium py-2"
            >
              ¿Ya tienes cuenta? Iniciar Sesión
            </button>
          </div>
        )}
      </nav>

      {/* --- HERO SECTION --- */}
      <section className="pt-44 pb-20 px-6 text-center">
        <motion.div initial="hidden" animate="visible" variants={fadeInUp} className="max-w-4xl mx-auto">
          
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 text-neutral-300 text-[10px] font-bold tracking-widest uppercase mb-8 backdrop-blur-md hover:bg-white/10 transition-colors cursor-default">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"/>
            Sistema Económico Centralizado v2.1
          </div>

          <h1 className="text-5xl md:text-8xl font-bold tracking-tighter mb-8 bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-neutral-500">
            El estándar de <br/> Empyria.
          </h1>
          
          <p className="text-xl text-neutral-400 max-w-2xl mx-auto mb-12 font-light leading-relaxed">
            Unificamos banca, líneas de crédito y seguridad militar en una sola plataforma. 
            Bienvenido a la economía moderna.
          </p>
        </motion.div>
      </section>

      {/* --- GRID DE SERVICIOS (BENTO GRID) --- */}
      <section id="servicios" className="px-4 pb-32">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            initial="hidden" 
            whileInView="visible" 
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            
            {/* 1. GBA ID (Principal) */}
            <motion.div variants={fadeInUp} className="md:col-span-2 relative group overflow-hidden rounded-[2.5rem] bg-neutral-900/40 border border-white/10 backdrop-blur-xl hover:border-blue-500/20 transition-all duration-500 min-h-[400px]">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-900/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="relative z-10 p-10 h-full flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <div className="max-w-md">
                    <h3 className="text-3xl font-bold mb-3 text-white">GBA ID</h3>
                    <p className="text-neutral-400 text-sm md:text-base leading-relaxed">
                      Tu identidad financiera única. Almacena tu historial, rango social y acceso a divisas internacionales. 
                      Sin GBA ID, no existes en el sistema.
                    </p>
                  </div>
                  <Fingerprint className="text-blue-500" size={42} />
                </div>

                {/* Visual Card */}
                <div className="mt-8 self-start w-full md:w-auto">
                  <div className="bg-gradient-to-r from-neutral-800/80 to-black/80 border border-white/10 rounded-2xl p-6 flex items-center gap-6 shadow-2xl backdrop-blur-md">
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-blue-800 rounded-full flex items-center justify-center shadow-lg">
                      <Globe className="text-white" size={24} />
                    </div>
                    <div>
                      <div className="text-[10px] text-neutral-500 tracking-widest uppercase mb-1">Status</div>
                      <div className="text-xl font-bold text-white tracking-tight">Ciudadano Verificado</div>
                    </div>
                    <div className="ml-auto pl-6 border-l border-white/10">
                       <CheckCircle2 className="text-emerald-500 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]" size={24} />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* 2. CARE+ (Seguros & Crédito) */}
            <motion.div variants={fadeInUp} className="relative group overflow-hidden rounded-[2.5rem] bg-neutral-900/40 border border-white/10 backdrop-blur-xl hover:bg-neutral-800/40 transition-colors">
              <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#10b981 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
              
              <div className="relative z-10 p-8 h-full flex flex-col justify-between min-h-[350px]">
                <div>
                   <div className="flex items-center gap-2 mb-4">
                     <Shield className="text-emerald-500" size={24} />
                     <span className="text-[10px] font-bold bg-emerald-950/30 text-emerald-400 px-2 py-1 rounded border border-emerald-500/20">AEGIS & CREDIT</span>
                   </div>
                   <h3 className="text-2xl font-bold mb-2">Care+</h3>
                   <p className="text-neutral-400 text-sm leading-relaxed mb-4">
                     Protección de activos militares y acceso a <strong>Tarjetas de Crédito</strong>. Financia tu guerra o tu negocio hoy, paga mañana.
                   </p>
                </div>
                
                {/* Visual de Tarjeta de Crédito */}
                <div className="w-full h-32 bg-gradient-to-br from-neutral-800 to-black rounded-xl border border-white/5 p-4 flex flex-col justify-between relative overflow-hidden group-hover:scale-105 transition-transform duration-500">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/20 blur-xl rounded-full"></div>
                    <div className="flex justify-between items-center z-10">
                        <span className="text-[10px] text-emerald-500 font-bold">GBA BLACK</span>
                        <CreditCard size={14} className="text-white/50" />
                    </div>
                    <div className="z-10">
                        <div className="text-white/80 font-mono text-sm">**** **** 4021</div>
                    </div>
                </div>

                <button 
                  onClick={onOpenLogin}
                  className="mt-6 w-full py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white text-sm font-bold transition-all flex items-center justify-center gap-2"
                >
                   Solicitar <ArrowRight size={14} />
                </button>
              </div>
            </motion.div>

            {/* 3. TRADE */}
            <motion.div variants={fadeInUp} className="relative group overflow-hidden rounded-[2.5rem] bg-neutral-900/40 border border-white/10 backdrop-blur-xl min-h-[350px]">
               <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-[40px] rounded-full" />
               <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/10 blur-[40px] rounded-full" />

               <div className="relative z-10 p-8 h-full flex flex-col justify-center text-center">
                 <div className="mx-auto w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mb-6 border border-white/10 shadow-[0_0_15px_rgba(255,255,255,0.05)]">
                   <ArrowRightLeft className="text-neutral-300" size={20} />
                 </div>
                 <h3 className="text-2xl font-bold mb-3">GBA Trade</h3>
                 <p className="text-neutral-400 text-sm mb-6">
                   El puente neutral. Conectamos los mercados del bloque Capitalista y Socialista sin fricción política.
                 </p>
                 <div className="flex justify-center gap-2">
                    <span className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-bold">SWIFT</span>
                    <span className="px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[10px] font-bold">SECURE</span>
                 </div>
               </div>
            </motion.div>

            {/* 4. GBA PAY (Antes Pay Later, ahora enfocado en el sistema de pago) */}
            <motion.div variants={fadeInUp} className="md:col-span-2 relative group overflow-hidden rounded-[2.5rem] bg-neutral-900/40 border border-white/10 backdrop-blur-xl hover:border-amber-500/20 transition-all duration-500">
               <div className="absolute right-0 top-0 p-12 opacity-5 group-hover:opacity-10 transition-opacity">
                  <Coins size={150} />
               </div>
               
               <div className="relative z-10 p-10 h-full flex flex-col md:flex-row items-center gap-8">
                  <div className="flex-1">
                     <h3 className="text-2xl font-bold mb-2 text-white">GBA Pay</h3>
                     <p className="text-neutral-400 text-sm md:text-base mb-6">
                        El sistema de pago universal de Empyria. Genera códigos QR o Tokens temporales para pagar en comercios autorizados con seguridad de grado militar.
                     </p>
                     <div className="flex items-center gap-2 text-xs font-bold tracking-widest text-amber-500 uppercase">
                        <Lock size={12} />
                        Tokenización Encriptada
                     </div>
                  </div>
                  
                  {/* Ciclo de Pago Visual */}
                  <div className="flex-1 w-full flex justify-center">
                     <div className="flex gap-4">
                        <div className="w-20 h-28 rounded-xl bg-neutral-800/50 border border-white/5 flex flex-col items-center justify-center gap-2 backdrop-blur-sm">
                           <div className="w-6 h-6 rounded-full bg-neutral-700 flex items-center justify-center text-[10px]">1</div>
                           <span className="text-[10px] text-neutral-400">Token</span>
                        </div>
                        <div className="w-8 h-28 flex items-center justify-center">
                            <ArrowRight size={16} className="text-neutral-600" />
                        </div>
                        <div className="w-20 h-28 rounded-xl bg-amber-900/20 border border-amber-500/20 flex flex-col items-center justify-center gap-2 backdrop-blur-sm shadow-[0_0_15px_rgba(245,158,11,0.1)]">
                           <div className="w-6 h-6 rounded-full bg-amber-600 text-black flex items-center justify-center text-[10px] font-bold">2</div>
                           <span className="text-[10px] text-amber-400 font-bold">Pago</span>
                        </div>
                     </div>
                  </div>
               </div>
            </motion.div>

            
            {/* 5. GIMG - VISTA (Media) */}
            <motion.div id="gimg" variants={fadeInUp} className="md:col-span-3 relative group overflow-hidden rounded-[2.5rem] bg-black border border-white/10 min-h-[300px]">
                <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent z-10" />
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1588613254550-0624a317797e?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-30 group-hover:scale-105 transition-transform duration-1000" />
                
                <div className="relative z-20 p-10 flex flex-col md:flex-row items-end md:items-center justify-between gap-6 h-full">
                    <div>
                        <div className="flex items-center gap-2 mb-2 text-red-500">
                            <Radio size={16} className="animate-pulse" />
                            <span className="text-xs font-bold tracking-widest uppercase">Global Insight Media Group</span>
                        </div>
                        <h3 className="text-3xl md:text-4xl font-serif italic text-white mb-2">VISTA News</h3>
                        <p className="text-neutral-400 max-w-lg">
                            La verdad sin filtros. Cobertura en tiempo real de conflictos, economía y política global.
                        </p>
                    </div>
                    
                    <a 
                      href="https://gimg-vista.vercel.app/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="px-8 py-3 rounded-full bg-white text-black font-bold hover:bg-neutral-200 transition-colors flex items-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                    >
                        Explorar VISTA <ExternalLink size={16} />
                    </a>
                </div>
            </motion.div>

          </motion.div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="py-12 border-t border-white/5 text-center bg-black">
        <p className="text-neutral-600 text-xs tracking-widest mb-2">
          GBA GLOBALBANK ALLIANCE &copy; 2025
        </p>
      </footer>
    </div>
  );
};

export default GBAMothership;