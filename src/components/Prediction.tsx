import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User } from '../types';
import { Lock, Zap, Loader2, RefreshCw, AlertTriangle } from 'lucide-react';

interface Props {
  user: User;
}

export default function Prediction({ user }: Props) {
  const [signal, setSignal] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [signalCount, setSignalCount] = useState(0);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (cooldown > 0) {
      timer = setInterval(() => {
        setCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  const generateSignal = () => {
    if (cooldown > 0) return;
    setLoading(true);
    
    setTimeout(() => {
      let val: number;
      const isBigSignal = (signalCount + 1) % 5 === 0;
      
      if (isBigSignal) {
        val = Math.random() * (5.0 - 3.0) + 3.0;
      } else {
        val = Math.random() * (2.5 - 1.1) + 1.1;
      }
      
      setSignal(val.toFixed(2) + 'x');
      setSignalCount((prev) => prev + 1);
      setLoading(false);
      setCooldown(5);
    }, 1500);
  };

  if (user.status !== 'active') {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-24 h-24 bg-red-600/10 rounded-full flex items-center justify-center mb-8 border border-red-600/20 shadow-[0_0_40px_rgba(220,38,38,0.2)]">
          <Lock className="w-10 h-10 text-red-600" />
        </div>
        <h2 className="text-3xl font-black text-white mb-4">Locked Feature</h2>
        <p className="text-slate-400 max-w-xs leading-relaxed mb-8">
          Prediction signals are only available for <span className="text-red-500 font-bold uppercase">Active Members</span>. 
          Please complete your payment to unlock.
        </p>
        <div className="bg-slate-900/40 p-5 rounded-3xl border border-white/5 flex items-center gap-4 max-w-xs w-full">
          <AlertTriangle className="w-6 h-6 text-yellow-500 shrink-0" />
          <p className="text-[10px] text-slate-400 font-bold uppercase text-left leading-tight">
            Wait for admin to verify your transaction after payment.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-4xl font-black tracking-tighter text-white mb-2">AVIATOR PREDICTION</h2>
        <p className="text-[10px] text-red-500 font-black uppercase tracking-[0.3em]">Next Signal Generator</p>
      </div>

      <div className="relative aspect-video bg-slate-900 rounded-[2.5rem] overflow-hidden border-4 border-slate-800 shadow-2xl group">
        <img 
          src="https://picsum.photos/seed/aviator-game/800/450" 
          alt="Aviator Game" 
          className="w-full h-full object-cover opacity-40 group-hover:scale-105 transition-transform duration-1000"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
        
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.2 }}
                className="flex flex-col items-center gap-4"
              >
                <Loader2 className="w-16 h-16 text-red-600 animate-spin" />
                <p className="text-red-500 font-black uppercase tracking-widest text-xs animate-pulse">Analyzing Data...</p>
              </motion.div>
            ) : signal ? (
              <motion.div
                key="signal"
                initial={{ opacity: 0, scale: 0.5, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="text-center"
              >
                <p className="text-[10px] text-red-500 font-black uppercase tracking-[0.5em] mb-2">Predicted Value</p>
                <h3 className="text-8xl font-black text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.3)]">
                  {signal}
                </h3>
              </motion.div>
            ) : (
              <motion.div
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center"
              >
                <div className="w-20 h-20 bg-red-600/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-600/30">
                  <Zap className="w-10 h-10 text-red-600" />
                </div>
                <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Ready to Predict</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="flex flex-col items-center gap-6">
        <button
          onClick={generateSignal}
          disabled={loading || cooldown > 0}
          className={`w-full max-w-xs h-20 rounded-3xl font-black text-xl uppercase tracking-widest flex items-center justify-center gap-3 transition-all shadow-2xl ${
            loading || cooldown > 0 
              ? 'bg-slate-900 text-slate-600 border border-white/5 cursor-not-allowed' 
              : 'bg-gradient-to-r from-red-600 to-red-500 text-white hover:from-red-500 hover:to-red-400 shadow-red-600/20'
          }`}
        >
          {loading ? (
            <Loader2 className="w-8 h-8 animate-spin" />
          ) : cooldown > 0 ? (
            <div className="flex items-center gap-2">
              <RefreshCw className="w-6 h-6 animate-spin" />
              <span>Wait {cooldown}s</span>
            </div>
          ) : (
            <>
              <Zap className="w-7 h-7 fill-current" />
              Get Signal
            </>
          )}
        </button>

        <div className="flex gap-2">
          {[...Array(5)].map((_, i) => (
            <div 
              key={i} 
              className={`w-3 h-3 rounded-full transition-all duration-500 ${
                signalCount % 5 > i ? 'bg-red-600 shadow-[0_0_10px_rgba(220,38,38,0.8)]' : 'bg-slate-800'
              }`} 
            />
          ))}
        </div>
        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
          Big signal in {5 - (signalCount % 5)} turns
        </p>
      </div>
    </div>
  );
}
