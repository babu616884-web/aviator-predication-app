import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { User, Transaction } from '../types';
import { 
  History, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ArrowUpRight, 
  Wallet,
  Calendar,
  Hash
} from 'lucide-react';

interface Props {
  user: User;
}

export default function TransactionHistory({ user }: Props) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, 'transactions'),
      where('uid', '==', user.uid),
      orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction));
      setTransactions(data);
      setLoading(false);
    }, (error) => {
      console.error("Transaction snapshot error:", error);
    });

    return () => unsubscribe();
  }, [user.uid]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-purple-600/10 rounded-2xl flex items-center justify-center border border-purple-600/20">
            <History className="w-6 h-6 text-purple-500" />
          </div>
          <div>
            <h2 className="text-2xl font-black tracking-tight text-white">Transactions</h2>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Payment History</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Total Paid</p>
          <p className="text-xl font-black text-white">
            {transactions.filter(t => t.status === 'success').reduce((acc, t) => acc + t.amount, 0)} BDT
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {transactions.length === 0 ? (
          <div className="bg-slate-900/40 backdrop-blur-xl p-10 rounded-3xl border border-white/5 text-center">
            <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <History className="w-8 h-8 text-slate-600" />
            </div>
            <p className="text-slate-400 font-bold">No transactions found</p>
            <p className="text-slate-600 text-xs mt-2">Your payment history will appear here</p>
          </div>
        ) : (
          transactions.map((tx) => (
            <motion.div
              key={tx.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-slate-900/40 backdrop-blur-xl p-5 rounded-3xl border border-white/5 relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    tx.status === 'success' ? 'bg-green-500/10 text-green-500' :
                    tx.status === 'declined' ? 'bg-red-500/10 text-red-500' :
                    'bg-yellow-500/10 text-yellow-500'
                  }`}>
                    {tx.status === 'success' ? <CheckCircle2 className="w-6 h-6" /> :
                     tx.status === 'declined' ? <XCircle className="w-6 h-6" /> :
                     <Clock className="w-6 h-6" />}
                  </div>
                  <div>
                    <p className="text-white font-black text-lg">{tx.amount} BDT</p>
                    <p className={`text-[10px] font-black uppercase tracking-widest ${
                      tx.status === 'success' ? 'text-green-500' :
                      tx.status === 'declined' ? 'text-red-500' :
                      'text-yellow-500'
                    }`}>
                      {tx.status}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Payment No</p>
                  <p className="text-white font-bold text-sm">{tx.paymentNumber}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                <div className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  <p className="text-[10px] text-slate-400 font-bold">
                    {new Date(tx.timestamp).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-2 justify-end">
                  <Hash className="w-3.5 h-3.5 text-slate-500" />
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">
                    Trx: {tx.transactionId}
                  </p>
                </div>
              </div>

              {tx.status === 'declined' && tx.reason && (
                <div className="mt-4 p-3 bg-red-500/10 rounded-xl border border-red-500/20 text-red-400 text-[10px] font-bold uppercase tracking-widest">
                  Reason: {tx.reason}
                </div>
              )}
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
