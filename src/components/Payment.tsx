import React, { useState } from 'react';
import { motion } from 'motion/react';
import { doc, setDoc, addDoc, collection } from 'firebase/firestore';
import { db } from '../firebase';
import { User, Transaction } from '../types';
import { CreditCard, Wallet, CheckCircle2, Loader2, Info, LogOut } from 'lucide-react';

interface Props {
  user: User;
  onLogout: () => void;
}

export default function Payment({ user, onLogout }: Props) {
  const [transactionId, setTransactionId] = useState('');
  const [paymentNumber, setPaymentNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const newTransaction: Omit<Transaction, 'id'> = {
        uid: user.uid,
        amount: 1500,
        transactionId,
        paymentNumber,
        timestamp: new Date().toISOString(),
        status: 'pending',
      };

      await addDoc(collection(db, 'transactions'), newTransaction);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="min-h-screen flex items-center justify-center p-6 bg-slate-950"
      >
        <div className="bg-slate-900/40 backdrop-blur-xl p-10 rounded-3xl shadow-2xl max-w-md w-full border border-white/10 text-center relative">
          <button 
            onClick={onLogout}
            className="absolute top-6 right-6 w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center border border-white/5 hover:bg-red-600/20 transition-colors"
          >
            <LogOut className="w-5 h-5 text-slate-400" />
          </button>
          <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-12 h-12 text-green-500" />
          </div>
          <h2 className="text-3xl font-black text-white mb-4">Payment Submitted</h2>
          <p className="text-slate-400 mb-8 leading-relaxed">
            Your payment of <span className="text-white font-bold">1500 BDT</span> has been submitted for verification. 
            Please wait for admin approval.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-green-600 text-white py-4 rounded-2xl font-bold hover:bg-green-500 transition-colors shadow-lg shadow-green-600/20"
          >
            Check Status
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen flex items-center justify-center p-6 bg-slate-950 relative overflow-hidden"
    >
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-pink-600/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-pink-900/20 rounded-full blur-[120px]" />

      <motion.div
        layout
        className="bg-slate-900/40 backdrop-blur-xl p-8 rounded-3xl shadow-2xl max-w-md w-full border border-white/10 relative z-10"
      >
        <button 
          onClick={onLogout}
          className="absolute top-4 right-4 w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center border border-white/5 hover:bg-red-600/20 transition-colors z-20"
        >
          <LogOut className="w-5 h-5 text-slate-400" />
        </button>
        <div className="flex items-center justify-between mb-8">
          <div className="w-12 h-12 bg-pink-600 rounded-xl flex items-center justify-center shadow-lg shadow-pink-600/20">
            <Wallet className="w-6 h-6 text-white" />
          </div>
          <div className="text-right">
            <p className="text-slate-400 text-xs uppercase tracking-widest font-bold">Amount to Pay</p>
            <p className="text-3xl font-black text-white">1500 BDT</p>
          </div>
        </div>

        <div className="bg-pink-600/10 border border-pink-500/20 p-6 rounded-2xl mb-8">
          <div className="flex items-center gap-3 mb-4">
            <img 
              src="https://upload.wikimedia.org/wikipedia/commons/8/8c/BKash_Logo.svg" 
              alt="bKash" 
              className="h-6"
              referrerPolicy="no-referrer"
            />
            <span className="text-pink-500 font-bold text-lg">bKash Personal</span>
          </div>
          <div className="space-y-2">
            <p className="text-slate-400 text-sm">Send Money to:</p>
            <p className="text-2xl font-black text-white tracking-widest">01700000000</p>
          </div>
        </div>

        <div className="bg-slate-800/50 p-4 rounded-xl mb-8 flex gap-3 items-start border border-white/5">
          <Info className="w-5 h-5 text-pink-400 shrink-0 mt-0.5" />
          <p className="text-slate-400 text-xs leading-relaxed">
            Please send <span className="text-white font-bold">1500 BDT</span> to the number above via bKash Send Money. 
            Then enter your payment number and Transaction ID below.
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-slate-400 text-xs font-bold uppercase ml-1">Your bKash Number</label>
            <input
              type="tel"
              placeholder="01XXXXXXXXX"
              value={paymentNumber}
              onChange={(e) => setPaymentNumber(e.target.value)}
              required
              className="w-full bg-slate-800/50 border border-white/5 rounded-2xl py-4 px-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-pink-500/50 transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-slate-400 text-xs font-bold uppercase ml-1">Transaction ID (TrxID)</label>
            <input
              type="text"
              placeholder="ABC123XYZ"
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
              required
              className="w-full bg-slate-800/50 border border-white/5 rounded-2xl py-4 px-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-pink-500/50 transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-pink-600 to-pink-500 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:from-pink-500 hover:to-pink-400 transition-all shadow-lg shadow-pink-600/20 disabled:opacity-50 mt-4"
          >
            {loading ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              'Submit Payment'
            )}
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
}
