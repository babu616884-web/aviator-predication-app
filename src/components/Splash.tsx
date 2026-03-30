import React, { useEffect } from 'react';
import { motion } from 'motion/react';

interface Props {
  onFinish?: () => void;
}

export default function Splash({ onFinish }: Props) {
  useEffect(() => {
    const timer = setTimeout(() => {
      if (onFinish) onFinish();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[1000] flex flex-col items-center justify-center bg-slate-950 overflow-hidden"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-red-900/20 via-transparent to-transparent opacity-50" />
      
      <motion.div
        initial={{ scale: 0.5, opacity: 0, rotate: -10 }}
        animate={{ scale: 1, opacity: 1, rotate: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="relative z-10 text-center"
      >
        <div className="w-40 h-40 bg-gradient-to-br from-red-600 to-red-900 rounded-3xl shadow-[0_0_50px_rgba(220,38,38,0.5)] flex items-center justify-center mx-auto mb-8 border-4 border-red-500/30 overflow-hidden">
          <img 
            src="https://picsum.photos/seed/aviator/400/400" 
            alt="Aviator Logo" 
            className="w-full h-full object-cover opacity-80 mix-blend-overlay"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-6xl font-black text-white drop-shadow-2xl">A</span>
          </div>
        </div>
        
        <h1 className="text-5xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-white to-red-500 animate-pulse">
          AVIATOR PRO
        </h1>
        <p className="text-red-400/60 font-mono text-sm mt-4 tracking-widest uppercase">
          Prediction System v2.0
        </p>
      </motion.div>

      <div className="absolute bottom-20 w-64 h-1.5 bg-slate-800 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: "100%" }}
          transition={{ duration: 2.5, ease: "easeInOut" }}
          className="h-full bg-gradient-to-r from-red-600 to-red-400 shadow-[0_0_10px_rgba(220,38,38,0.8)]"
        />
      </div>
    </motion.div>
  );
}
