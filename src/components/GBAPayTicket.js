import React from 'react';
import { motion } from 'framer-motion';
import { X, QrCode, Smartphone, Wifi } from 'lucide-react';

const GBAPayTicket = ({ token, onClose }) => {
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
      <motion.div 
        initial={{ scale: 0.8, rotateX: 90 }} 
        animate={{ scale: 1, rotateX: 0 }}
        className="relative w-full max-w-xs bg-white text-black rounded-3xl overflow-hidden shadow-[0_0_80px_rgba(0,150,255,0.4)] font-mono"
      >
        {/* Header del Ticket */}
        <div className="bg-blue-600 p-4 text-white flex justify-between items-center">
          <div className="flex items-center gap-2 font-bold tracking-widest">
            <Wifi size={16} className="animate-pulse"/> GBA PAY
          </div>
          <button onClick={onClose} className="bg-white/20 p-1 rounded-full hover:bg-white/40 transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Cuerpo del Ticket */}
        <div className="p-6 flex flex-col items-center text-center relative">
            {/* Fondo decorativo */}
            <div className="absolute inset-0 opacity-5 bg-[url('https://www.transparenttextures.com/patterns/graphy.png')]"></div>

            <div className="mb-2 text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Token de Compra</div>
            
            {/* EL CÓDIGO GIGANTE */}
            <div className="text-6xl font-black tracking-tighter text-blue-600 my-4">
                {token}
            </div>

            <div className="flex items-center gap-2 text-xs text-neutral-500 bg-neutral-100 px-3 py-1 rounded-full mb-6">
                <Smartphone size={12} />
                <span>Muestra esto al cajero</span>
            </div>

            {/* Decoración visual QR (Estético) */}
            <div className="w-full border-t-2 border-dashed border-neutral-300 py-4 flex justify-center opacity-80">
                <QrCode size={64} className="text-neutral-800" />
            </div>
            
            <p className="text-[9px] text-neutral-400 uppercase">Válido por 1 uso • Expiración inmediata</p>
        </div>

        {/* Efecto de borde inferior (como ticket cortado) */}
        <div className="h-2 bg-gradient-to-r from-transparent via-black/10 to-transparent"></div>
      </motion.div>
    </div>
  );
};

export default GBAPayTicket;