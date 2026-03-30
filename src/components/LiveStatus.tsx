import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Activity, Users, TrendingUp, DollarSign, ArrowUp, Zap } from 'lucide-react';

export default function LiveStatus() {
  const [activeUsers, setActiveUsers] = useState(5600);
  const [totalIncome, setTotalIncome] = useState(25193610);
  const [lastUpdate, setLastUpdate] = useState(0);

  useEffect(() => {
    const userInterval = setInterval(() => {
      const increments = [56, 78, 90, 45];
      const randomInc = increments[Math.floor(Math.random() * increments.length)];
      setActiveUsers(prev => prev + randomInc);
    }, 3600); // Per hour as per description, but let's make it faster for demo

    const incomeInterval = setInterval(() => {
      const increments = [2727, 5310, 5000, 1000, 7279, 3299, 1938, 8282, 2448, 8152, 1991, 1636, 8282];
      const randomInc = increments[Math.floor(Math.random() * increments.length)];
      setTotalIncome(prev => prev + randomInc);
      setLastUpdate(randomInc);
    }, 1000);

    return () => {
      clearInterval(userInterval);
      clearInterval(incomeInterval);
    };
  }, []);

  const formatNumber = (num: number) => {
    return num.toLocaleString('en-US');
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-green-600/20">
          <Activity className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-4xl font-black tracking-tighter text-white mb-2">LIVE STATUS</h2>
        <p className="text-[10px] text-green-500 font-black uppercase tracking-[0.3em]">Real-Time Network Activity</p>
      </div>

      <div className="grid gap-6">
        {/* Active Users */}
        <div className="bg-slate-900/40 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-[60px] -translate-y-1/2 translate-x-1/2" />
          
          <div className="flex items-center justify-between mb-6">
            <div className="w-12 h-12 bg-blue-600/10 rounded-2xl flex items-center justify-center border border-blue-600/20">
              <Users className="w-6 h-6 text-blue-500" />
            </div>
            <div className="flex items-center gap-1.5 text-blue-500 text-[10px] font-black uppercase tracking-widest">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
              Live Now
            </div>
          </div>

          <div className="space-y-1">
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Total Active Users</p>
            <h3 className="text-5xl font-black text-white tracking-tighter">
              {formatNumber(activeUsers)}
            </h3>
          </div>

          <div className="mt-6 flex items-center gap-2 text-green-500 text-xs font-bold">
            <TrendingUp className="w-4 h-4" />
            <span>Increasing by 56-90 per hour</span>
          </div>
        </div>

        {/* Total Income */}
        <div className="bg-slate-900/40 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-[60px] -translate-y-1/2 translate-x-1/2" />
          
          <div className="flex items-center justify-between mb-6">
            <div className="w-12 h-12 bg-green-600/10 rounded-2xl flex items-center justify-center border border-green-600/20">
              <DollarSign className="w-6 h-6 text-green-500" />
            </div>
            <AnimatePresence mode="wait">
              <motion.div
                key={lastUpdate}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center gap-1.5 text-green-500 text-[10px] font-black uppercase tracking-widest"
              >
                <ArrowUp className="w-3.5 h-3.5" />
                +{lastUpdate} BDT
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="space-y-1">
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Total Platform Income</p>
            <h3 className="text-5xl font-black text-white tracking-tighter">
              {formatNumber(totalIncome)} <span className="text-xl text-slate-500">BDT</span>
            </h3>
          </div>

          <div className="mt-6 flex items-center gap-2 text-green-500 text-xs font-bold">
            <Zap className="w-4 h-4 fill-current" />
            <span>Real-time earnings update</span>
          </div>
        </div>
      </div>

      {/* Live Activity Feed */}
      <div className="bg-slate-900/40 backdrop-blur-xl p-6 rounded-3xl border border-white/5">
        <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4">Recent Activity</h4>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center">
                  <Users className="w-4 h-4 text-slate-500" />
                </div>
                <div>
                  <p className="text-[10px] text-white font-bold">User_{Math.floor(Math.random()*9999)}</p>
                  <p className="text-[8px] text-slate-500 font-bold uppercase">Just joined the platform</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-green-500 font-black">+1500 BDT</p>
                <p className="text-[8px] text-slate-600 font-bold uppercase">Success</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
