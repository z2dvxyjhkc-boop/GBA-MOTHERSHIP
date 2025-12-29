import React, { useState } from 'react';
import { X, Search, CheckCircle, AlertCircle, Loader2, MapPin } from 'lucide-react';
import { supabase } from '../supabaseClient';

// --- CONFIGURACIÓN ---
// URL del Webhook (Ya la tienes puesta correctamente)
const DISCORD_WEBHOOK_URL = 'https://discord.com/api/webhooks/1454910938456264795/fsT51rvXjnl3RLngwM9Rp7ytOdyi5ZE4KQCQC7dvG2P1LU9Yl-HqW6-05hcFtyjaWDsE';

const GBAAdminDeposit = ({ onClose, onDepositSuccess }) => {
  const [targetUser, setTargetUser] = useState('');
  const [amount, setAmount] = useState('');
  const [locationInfo, setLocationInfo] = useState(''); 
  const [status, setStatus] = useState('idle'); 
  const [foundUserData, setFoundUserData] = useState(null);
  const [feedback, setFeedback] = useState('');

  // 1. BUSCAR AL USUARIO
  const searchUser = async () => {
    if (!targetUser) return;
    setStatus('searching');
    setFeedback('');

    try {
      const { data, error } = await supabase
        .from('usuarios')
        .select('nombre, saldo, nacion')
        .eq('nombre', targetUser)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setFoundUserData(data);
        setStatus('confirm'); 
      } else {
        setFeedback('Usuario no encontrado.');
        setStatus('error');
      }
    } catch (err) {
      console.error(err);
      setFeedback('Error de conexión.');
      setStatus('error');
    }
  };

  // 2. ENVIAR REPORTE A DISCORD (CORREGIDO)
  const sendDiscordLog = async (adminName, clientName, monto, ubicacion) => {
    // ELIMINÉ LA LÍNEA QUE BLOQUEABA EL ENVÍO

    const mensaje = {
      username: "GBA Bóveda",
      avatar_url: "https://cdn-icons-png.flaticon.com/512/2482/2482520.png", // Icono de caja fuerte
      embeds: [
        {
          title: "💰 Nuevo Ingreso de Efectivo",
          color: 3066993, // Color Verde
          fields: [
            { name: "Cajero (Admin)", value: adminName, inline: true },
            { name: "Cliente", value: clientName, inline: true },
            { name: "Monto", value: `$${monto}`, inline: true },
            { name: "📍 Ubicación Física / Cofre", value: ubicacion }
          ],
          footer: { text: `GBA System • ${new Date().toLocaleString()}` }
        }
      ]
    };

    try {
      await fetch(DISCORD_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mensaje)
      });
    } catch (error) {
      console.error("Error enviando a Discord", error);
    }
  };

  // 3. EJECUTAR EL DEPÓSITO
  const executeDeposit = async () => {
    if (!foundUserData || !amount || !locationInfo) return;
    setStatus('processing');

    const deposito = parseInt(amount);
    const nuevoSaldo = (foundUserData.saldo || 0) + deposito;

    try {
      // A. Actualizamos el saldo en Supabase
      const { error } = await supabase
        .from('usuarios')
        .update({ saldo: nuevoSaldo })
        .eq('nombre', foundUserData.nombre);

      if (error) throw error;

      // B. Enviamos el Log a Discord
      // Nota: Aquí pasamos "Admin" como nombre del cajero, pero idealmente podrías pasar user.nombre si lo recibieras como prop
      await sendDiscordLog("Admin GBA", foundUserData.nombre, amount, locationInfo);

      // C. Éxito
      setStatus('success');
      setTimeout(() => {
        onDepositSuccess(); 
        onClose(); 
      }, 2000);
      await supabase.from('transacciones').insert([{
  emisor: 'SISTEMA GBA',
  receptor: foundUserData.nombre,
  monto: deposito,
  tipo: 'DEPOSITO',
  detalles: locationInfo
}]);
    } catch (err) {
      console.error(err);
      setFeedback('Falló el depósito.');
      setStatus('error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-neutral-900 border border-white/10 w-full max-w-md rounded-2xl p-6 relative shadow-2xl">
        
        <button onClick={onClose} className="absolute top-4 right-4 text-neutral-500 hover:text-white">
          <X size={20} />
        </button>

        <h2 className="text-xl font-bold mb-1 text-emerald-500">Terminal de Cajero</h2>
        <p className="text-neutral-500 text-sm mb-6">Ingreso de divisas y bitácora física.</p>

        {/* --- PASO 1: BUSQUEDA --- */}
        {status === 'idle' || status === 'error' || status === 'searching' ? (
          <div className="space-y-4">
            <div>
              <label className="text-xs text-neutral-400 uppercase font-bold">Usuario Destino</label>
              <div className="flex gap-2 mt-1">
                <input 
                  type="text" 
                  value={targetUser}
                  onChange={(e) => setTargetUser(e.target.value)}
                  placeholder="Nombre exacto"
                  className="flex-1 bg-black border border-white/20 rounded-lg px-4 py-3 text-white focus:border-emerald-500 outline-none"
                />
                <button 
                  onClick={searchUser}
                  disabled={status === 'searching' || !targetUser}
                  className="bg-white/10 hover:bg-white/20 border border-white/10 rounded-lg px-4 flex items-center justify-center transition-colors disabled:opacity-50"
                >
                  {status === 'searching' ? <Loader2 className="animate-spin" size={20} /> : <Search size={20} />}
                </button>
              </div>
            </div>
            {status === 'error' && (
              <p className="text-red-400 text-xs flex items-center gap-1"><AlertCircle size={12}/> {feedback}</p>
            )}
          </div>
        ) : null}

        {/* --- PASO 2: FORMULARIO DE DEPÓSITO --- */}
        {(status === 'confirm' || status === 'processing' || status === 'success') && foundUserData && (
          <div className="space-y-4">
            
            {/* Tarjeta Resumen */}
            <div className="bg-white/5 rounded-xl p-4 border border-white/10 flex items-center justify-between mb-2">
              <div>
                <div className="text-sm font-bold text-white">{foundUserData.nombre}</div>
                <div className="text-xs text-neutral-500">{foundUserData.nacion}</div>
              </div>
              <div className="text-right">
                <div className="text-[10px] text-neutral-500 uppercase">Saldo Actual</div>
                <div className="text-sm font-mono text-emerald-400">${foundUserData.saldo}</div>
              </div>
            </div>

            {/* Campo Monto */}
            <div>
              <label className="text-xs text-neutral-400 uppercase font-bold">Monto ($)</label>
              <input 
                type="number" 
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                autoFocus
                className="w-full bg-black border border-white/20 rounded-lg px-4 py-3 text-xl font-bold text-white focus:border-emerald-500 outline-none mt-1"
              />
            </div>

            {/* Campo Ubicación */}
            <div>
              <label className="text-xs text-neutral-400 uppercase font-bold flex items-center gap-1">
                <MapPin size={12}/> Ubicación Física / Nota
              </label>
              <input 
                type="text" 
                value={locationInfo}
                onChange={(e) => setLocationInfo(e.target.value)}
                placeholder="Ej: Cofre 4, Sucursal Norte"
                className="w-full bg-black border border-white/20 rounded-lg px-4 py-3 text-sm text-white focus:border-emerald-500 outline-none mt-1"
              />
            </div>

            <button 
              onClick={executeDeposit}
              disabled={status === 'processing' || !amount || !locationInfo}
              className={`w-full py-4 rounded-xl font-bold text-black transition-all flex items-center justify-center gap-2 mt-4
                ${status === 'success' ? 'bg-emerald-500' : 'bg-white hover:bg-neutral-200'}
                disabled:opacity-50 disabled:cursor-not-allowed
              `}
            >
              {status === 'processing' ? <Loader2 className="animate-spin" /> : 
               status === 'success' ? <><CheckCircle /> Registrado</> : 
               "Procesar Ingreso"}
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default GBAAdminDeposit;