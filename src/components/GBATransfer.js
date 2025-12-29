import React, { useState } from 'react';
import { X, Search, CheckCircle, AlertCircle, Loader2, ArrowRight } from 'lucide-react';
import { supabase } from '../supabaseClient';

// --- CONFIGURACIÓN ---
const DISCORD_WEBHOOK_URL = 'https://discord.com/api/webhooks/1454910938456264795/fsT51rvXjnl3RLngwM9Rp7ytOdyi5ZE4KQCQC7dvG2P1LU9Yl-HqW6-05hcFtyjaWDsE';

const GBATransfer = ({ currentUser, onClose, onSuccess }) => {
  const [recipientName, setRecipientName] = useState('');
  const [amount, setAmount] = useState('');
  const [status, setStatus] = useState('idle'); 
  const [feedback, setFeedback] = useState('');

  // --- FUNCIÓN PARA ENVIAR A DISCORD ---
  const sendDiscordLog = async (sender, receiver, monto) => {
    if (!DISCORD_WEBHOOK_URL || DISCORD_WEBHOOK_URL.includes('AQUI_PEGA')) return; 

    const mensaje = {
      username: "GBA Wire System",
      avatar_url: "https://cdn-icons-png.flaticon.com/512/2534/2534204.png",
      embeds: [
        {
          title: "💸 Transferencia Realizada",
          color: 3447003,
          fields: [
            { name: "Remitente", value: sender, inline: true },
            { name: "Destinatario", value: receiver, inline: true },
            { name: "Monto", value: `$${monto}`, inline: true }
          ],
          footer: { text: `GBA Network • ${new Date().toLocaleString()}` }
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

  const handleTransfer = async () => {
    // --- VALIDACIONES ---
    if (!recipientName || !amount) { setFeedback("Faltan datos."); return; }
    const monto = parseInt(amount);
    if (monto <= 0) { setFeedback("El monto debe ser mayor a 0."); return; }
    if (recipientName === currentUser.nombre) { setFeedback("No puedes enviarte dinero a ti mismo."); return; }
    if (monto > (currentUser.saldo || 0)) { setFeedback("Fondos insuficientes."); return; }

    setStatus('processing');
    setFeedback('');

    try {
      // 1. OBTENER DATOS FRESCOS DEL REMITENTE
      const { data: senderData, error: senderError } = await supabase
        .from('usuarios')
        .select('id, saldo, nombre')
        .eq('nombre', currentUser.nombre)
        .single();

      if (senderError || !senderData) throw new Error("Error verificando tu cuenta.");
      if (senderData.saldo < monto) {
        setFeedback("Fondos insuficientes en el servidor.");
        setStatus('error');
        return;
      }

      // 2. BUSCAR AL DESTINATARIO
      const { data: recipientData, error: recipientError } = await supabase
        .from('usuarios')
        .select('id, saldo, nombre')
        .eq('nombre', recipientName)
        .maybeSingle();

      if (recipientError) throw recipientError;
      if (!recipientData) {
        setFeedback(`El usuario "${recipientName}" no existe.`);
        setStatus('error');
        return;
      }

      // 3. EJECUTAR LA TRANSFERENCIA (Resta y Suma)
      const { error: deductError } = await supabase
        .from('usuarios')
        .update({ saldo: senderData.saldo - monto })
        .eq('nombre', senderData.nombre);

      if (deductError) throw new Error("Error al retirar fondos.");

      const { error: addError } = await supabase
        .from('usuarios')
        .update({ saldo: recipientData.saldo + monto })
        .eq('nombre', recipientData.nombre);

      if (addError) throw new Error("Error crítico al depositar.");

      // 4. REGISTRAR EN EL HISTORIAL (TABLA TRANSACCIONES)
      await supabase.from('transacciones').insert([{
        emisor: currentUser.nombre,
        receptor: recipientName,
        monto: monto,
        tipo: 'TRANSFERENCIA',
        detalles: 'Transferencia Directa P2P'
      }]);

      // 5. LOG EN DISCORD
      await sendDiscordLog(senderData.nombre, recipientData.nombre, amount);

      // 6. ÉXITO FINAL
      setStatus('success');
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 2000);

    } catch (err) {
      console.error(err);
      setFeedback(err.message || "Error en la transferencia.");
      setStatus('error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-neutral-900 border border-white/10 w-full max-w-md rounded-2xl p-6 relative shadow-2xl">
        
        <button onClick={onClose} className="absolute top-4 right-4 text-neutral-500 hover:text-white">
          <X size={20} />
        </button>

        <h2 className="text-xl font-bold mb-1 text-white">Realizar Transferencia</h2>
        <p className="text-neutral-500 text-sm mb-6">Envío de fondos P2P instantáneo.</p>

        {status === 'success' ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 text-black shadow-[0_0_20px_rgba(16,185,129,0.5)]">
              <CheckCircle size={32} />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">¡Enviado!</h3>
            <p className="text-neutral-400">Has transferido ${amount} a {recipientName}.</p>
          </div>
        ) : (
          <div className="space-y-5">
            <div>
              <label className="text-xs text-neutral-400 uppercase font-bold">Destinatario</label>
              <div className="relative mt-1">
                <Search className="absolute left-3 top-3 text-neutral-600" size={18} />
                <input 
                  type="text" 
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  placeholder="Nombre de usuario exacto"
                  className="w-full bg-black border border-white/20 rounded-lg pl-10 pr-4 py-3 text-white focus:border-blue-500 outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <label className="text-xs text-neutral-400 uppercase font-bold">Monto</label>
                <span className="text-xs text-emerald-400">Disponible: ${currentUser?.saldo || 0}</span>
              </div>
              <input 
                type="number" 
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                className="w-full bg-black border border-white/20 rounded-lg px-4 py-3 text-2xl font-bold text-white focus:border-blue-500 outline-none"
              />
            </div>

            {recipientName && amount && (
              <div className="flex items-center justify-between bg-white/5 p-3 rounded-lg border border-white/5 text-sm">
                <span className="text-neutral-400">{currentUser.nombre}</span>
                <ArrowRight size={14} className="text-neutral-600" />
                <span className="font-bold text-white">${amount}</span>
                <ArrowRight size={14} className="text-neutral-600" />
                <span className="text-blue-400">{recipientName}</span>
              </div>
            )}

            {feedback && (
              <div className="bg-red-900/20 border border-red-500/20 p-3 rounded-lg flex items-center gap-2 text-red-400 text-xs">
                <AlertCircle size={16} /> {feedback}
              </div>
            )}

            <button 
              onClick={handleTransfer}
              disabled={status === 'processing' || !amount || !recipientName}
              className="w-full bg-white hover:bg-neutral-200 text-black font-bold py-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
            >
              {status === 'processing' ? <Loader2 className="animate-spin" /> : "Confirmar Envío"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default GBATransfer;