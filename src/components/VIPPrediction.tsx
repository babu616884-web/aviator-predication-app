import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { collection, query, onSnapshot, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase';
import { User, VIPSignal } from '../types';
import { Crown, Calendar, Clock, Zap, TrendingUp, History, Star } from 'lucide-react';

interface Props {
  user: User;
}

export default function VIPPrediction({ user }: Props) {
  const [signals, setSignals] = useState<VIPSignal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, 'vip_signals'),
      orderBy('timestamp', 'desc'),
      limit(10)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as VIPSignal));
      setSignals(data);
      setLoading(false);
    }, (error) => {
      console.error("VIP Signal snapshot error:", error);
    });

    return () => unsubscribe();
  }, []);

  if (user.status !== 'active') {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-24 h-24 bg-yellow-600/10 rounded-full flex items-center justify-center mb-8 border border-yellow-600/20 shadow-[0_0_40px_rgba(202,138,4,0.2)]">
          <Crown className="w-10 h-10 text-yellow-600" />
        </div>
        <h2 className="text-3xl font-black text-white mb-4">VIP Prediction</h2>
        <p className="text-slate-400 max-w-xs leading-relaxed mb-8">
          VIP signals are reserved for <span className="text-yellow-500 font-bold uppercase">Paid Members</span>. 
          Unlock exclusive high-multiplier signals.
        </p>
        <div className="bg-slate-900/40 p-5 rounded-3xl border border-white/5 flex items-center gap-4 max-w-xs w-full">
          <Star className="w-6 h-6 text-yellow-500 shrink-0" />
          <p className="text-[10px] text-slate-400 font-bold uppercase text-left leading-tight">
            VIP signals are 99% accurate and updated daily by experts.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-yellow-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-yellow-600/20">
          <Crown className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-4xl font-black tracking-tighter text-white mb-2">VIP SIGNALS</h2>
        <p className="text-[10px] text-yellow-500 font-black uppercase tracking-[0.3em]">High Accuracy Predictions</p>
      </div>

      {/* Live VIP Signal */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-950 p-8 rounded-[2.5rem] border-2 border-yellow-500/30 shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" />
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2 bg-yellow-500/20 text-yellow-500 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-yellow-500/30">
              <Zap className="w-3.5 h-3.5 fill-current" />
              Live Signal
            </div>
            <div className="flex items-center gap-2 text-slate-500 text-[10px] font-bold uppercase tracking-widest">
              <Clock className="w-3.5 h-3.5" />
              Updated Just Now
            </div>
          </div>

          <div className="text-center py-6">
            <h3 className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-yellow-500 drop-shadow-[0_0_50px_rgba(234,179,8,0.3)]">
              {signals[0]?.value || '10.50x'}
            </h3>
            <p className="text-yellow-500/60 font-mono text-sm mt-4 tracking-widest uppercase font-bold">
              Target Multiplier
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-8 pt-8 border-t border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center">
                <Calendar className="w-5 h-5 text-slate-400" />
              </div>
              <div>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Date</p>
                <p className="text-white font-bold text-sm">{signals[0]?.date || '30 Mar 2026'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 justify-end text-right">
              <div>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Time</p>
                <p className="text-white font-bold text-sm">{signals[0]?.time || '10:30 PM'}</p>
              </div>
              <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center">
                <Clock className="w-5 h-5 text-slate-400" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Signal History Chart */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <History className="w-5 h-5 text-slate-500" />
          <h4 className="text-lg font-black text-white uppercase tracking-tight">Signal History</h4>
        </div>

        <div className="bg-slate-900/40 backdrop-blur-xl rounded-3xl border border-white/5 overflow-hidden">
          <div className="grid grid-cols-3 p-4 bg-white/5 text-[10px] font-black uppercase tracking-widest text-slate-500">
            <span>Time</span>
            <span className="text-center">Signal</span>
            <span className="text-right">Accuracy</span>
          </div>
          <div className="divide-y divide-white/5">
            {signals.map((s, i) => (
              <div key={s.id} className="grid grid-cols-3 p-4 items-center hover:bg-white/5 transition-colors">
                <span className="text-xs text-slate-400 font-bold">{s.time}</span>
                <span className="text-center text-yellow-500 font-black">{s.value}</span>
                <div className="flex items-center justify-end gap-1 text-green-500 text-[10px] font-black">
                  <TrendingUp className="w-3 h-3" />
                  99%
                </div>
              </div>
            ))}
            {signals.length === 0 && (
              <div className="p-8 text-center text-slate-600 text-xs font-bold uppercase tracking-widest">
                No history available
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
