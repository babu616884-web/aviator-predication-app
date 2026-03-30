import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  collection, 
  query, 
  onSnapshot, 
  orderBy, 
  doc, 
  updateDoc, 
  addDoc, 
  setDoc,
  deleteDoc,
  getDocs,
  where
} from 'firebase/firestore';
import { db } from '../firebase';
import { User, Transaction, VIPSignal, Notice } from '../types';
import { 
  LayoutDashboard, 
  Users, 
  CreditCard, 
  Zap, 
  Bell, 
  LogOut, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Plus, 
  Trash2,
  Send,
  ShieldCheck,
  ShieldAlert
} from 'lucide-react';

interface Props {
  onLogout: () => void;
}

type AdminTab = 'dashboard' | 'users' | 'transactions' | 'signals' | 'notices';

export default function Admin({ onLogout }: Props) {
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [users, setUsers] = useState<User[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [signals, setSignals] = useState<VIPSignal[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [newSignal, setNewSignal] = useState({ value: '', time: '', date: '' });
  const [newNotice, setNewNotice] = useState('');

  useEffect(() => {
    const unsubUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
      setUsers(snapshot.docs.map(doc => ({ ...doc.data() } as User)));
    }, (error) => {
      console.error("Admin users snapshot error:", error);
    });

    const unsubTx = onSnapshot(query(collection(db, 'transactions'), orderBy('timestamp', 'desc')), (snapshot) => {
      setTransactions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction)));
    }, (error) => {
      console.error("Admin transactions snapshot error:", error);
    });

    const unsubSignals = onSnapshot(query(collection(db, 'vip_signals'), orderBy('timestamp', 'desc')), (snapshot) => {
      setSignals(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as VIPSignal)));
    }, (error) => {
      console.error("Admin signals snapshot error:", error);
    });

    const unsubNotices = onSnapshot(collection(db, 'notices'), (snapshot) => {
      setNotices(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Notice)));
    }, (error) => {
      console.error("Admin notices snapshot error:", error);
    });

    return () => {
      unsubUsers();
      unsubTx();
      unsubSignals();
      unsubNotices();
    };
  }, []);

  const handleApproveTx = async (tx: Transaction) => {
    try {
      await updateDoc(doc(db, 'transactions', tx.id), { status: 'success' });
      await updateDoc(doc(db, 'users', tx.uid), { status: 'active' });
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeclineTx = async (tx: Transaction) => {
    const reason = prompt('Enter decline reason:');
    if (reason) {
      try {
        await updateDoc(doc(db, 'transactions', tx.id), { status: 'declined', reason });
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleAddSignal = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'vip_signals'), {
        ...newSignal,
        timestamp: new Date().toISOString()
      });
      setNewSignal({ value: '', time: '', date: '' });
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await setDoc(doc(db, 'notices', 'current'), {
        message: newNotice,
        active: true,
        timestamp: new Date().toISOString()
      });
      setNewNotice('');
    } catch (err) {
      console.error(err);
    }
  };

  const toggleNotice = async (id: string, active: boolean) => {
    try {
      await updateDoc(doc(db, 'notices', id), { active: !active });
    } catch (err) {
      console.error(err);
    }
  };

  const deleteSignal = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'vip_signals', id));
    } catch (err) {
      console.error(err);
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'transactions', label: 'Payments', icon: CreditCard },
    { id: 'signals', label: 'VIP Signals', icon: Zap },
    { id: 'notices', label: 'Notices', icon: Bell },
  ];

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-slate-900/50 border-r border-white/5 p-6 flex flex-col gap-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-red-600/20">
            <span className="text-xl font-black">A</span>
          </div>
          <h1 className="text-lg font-black tracking-tight">ADMIN PANEL</h1>
        </div>

        <nav className="flex-1 flex flex-col gap-2">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as AdminTab)}
                className={`flex items-center gap-3 p-4 rounded-2xl font-bold text-sm transition-all ${
                  isActive ? 'bg-red-600 text-white shadow-lg shadow-red-600/20' : 'text-slate-400 hover:bg-white/5'
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </button>
            );
          })}
        </nav>

        <button 
          onClick={onLogout}
          className="flex items-center gap-3 p-4 rounded-2xl font-bold text-sm text-red-500 hover:bg-red-500/10 transition-all"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-6xl mx-auto"
          >
            {activeTab === 'dashboard' && (
              <div className="space-y-8">
                <h2 className="text-3xl font-black text-white">Dashboard Overview</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <StatCard label="Total Users" value={users.length} icon={Users} color="blue" />
                  <StatCard label="Active Members" value={users.filter(u => u.status === 'active').length} icon={ShieldCheck} color="green" />
                  <StatCard label="Pending Payments" value={transactions.filter(t => t.status === 'pending').length} icon={Clock} color="yellow" />
                  <StatCard label="Total Revenue" value={transactions.filter(t => t.status === 'success').length * 1500 + ' BDT'} icon={CreditCard} color="purple" />
                </div>
              </div>
            )}

            {activeTab === 'users' && (
              <div className="space-y-6">
                <h2 className="text-3xl font-black text-white">User Management</h2>
                <div className="bg-slate-900/40 rounded-3xl border border-white/5 overflow-hidden">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-white/5 text-[10px] font-black uppercase tracking-widest text-slate-500">
                        <th className="p-4">User</th>
                        <th className="p-4">Phone</th>
                        <th className="p-4">Status</th>
                        <th className="p-4">Role</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {users.map(u => (
                        <tr key={u.uid} className="hover:bg-white/5 transition-colors">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <img src={u.photoURL} className="w-8 h-8 rounded-lg" referrerPolicy="no-referrer" />
                              <div>
                                <p className="text-white font-bold text-sm">{u.name}</p>
                                <p className="text-slate-500 text-[10px]">{u.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-4 text-slate-400 text-sm font-bold">{u.phone}</td>
                          <td className="p-4">
                            <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-full ${u.status === 'active' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                              {u.status}
                            </span>
                          </td>
                          <td className="p-4 text-slate-400 text-sm font-bold uppercase">{u.role}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'transactions' && (
              <div className="space-y-6">
                <h2 className="text-3xl font-black text-white">Payment Requests</h2>
                <div className="grid gap-4">
                  {transactions.map(tx => (
                    <div key={tx.id} className="bg-slate-900/40 p-6 rounded-3xl border border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-slate-800 rounded-2xl flex items-center justify-center">
                          <CreditCard className="w-6 h-6 text-slate-400" />
                        </div>
                        <div>
                          <p className="text-white font-black text-lg">{tx.amount} BDT</p>
                          <p className="text-slate-500 text-xs font-bold uppercase">Trx: {tx.transactionId} | No: {tx.paymentNumber}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        {tx.status === 'pending' ? (
                          <>
                            <button 
                              onClick={() => handleApproveTx(tx)}
                              className="bg-green-600 text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-green-500 transition-all flex items-center gap-2"
                            >
                              <CheckCircle2 className="w-4 h-4" /> Approve
                            </button>
                            <button 
                              onClick={() => handleDeclineTx(tx)}
                              className="bg-red-600 text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-red-500 transition-all flex items-center gap-2"
                            >
                              <XCircle className="w-4 h-4" /> Decline
                            </button>
                          </>
                        ) : (
                          <span className={`text-[10px] font-black uppercase px-4 py-2 rounded-full ${tx.status === 'success' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                            {tx.status}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'signals' && (
              <div className="space-y-8">
                <h2 className="text-3xl font-black text-white">VIP Signal Management</h2>
                <form onSubmit={handleAddSignal} className="bg-slate-900/40 p-8 rounded-3xl border border-white/5 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Signal Value</label>
                    <input 
                      type="text" 
                      placeholder="e.g. 10.50x" 
                      value={newSignal.value}
                      onChange={e => setNewSignal({...newSignal, value: e.target.value})}
                      required
                      className="w-full bg-slate-800 border border-white/5 rounded-xl p-4 text-white" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Time</label>
                    <input 
                      type="text" 
                      placeholder="e.g. 10:30 PM" 
                      value={newSignal.time}
                      onChange={e => setNewSignal({...newSignal, time: e.target.value})}
                      required
                      className="w-full bg-slate-800 border border-white/5 rounded-xl p-4 text-white" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Date</label>
                    <input 
                      type="text" 
                      placeholder="e.g. 30 Mar" 
                      value={newSignal.date}
                      onChange={e => setNewSignal({...newSignal, date: e.target.value})}
                      required
                      className="w-full bg-slate-800 border border-white/5 rounded-xl p-4 text-white" 
                    />
                  </div>
                  <button className="bg-red-600 text-white p-4 rounded-xl font-bold hover:bg-red-500 transition-all flex items-center justify-center gap-2">
                    <Plus className="w-5 h-5" /> Add Signal
                  </button>
                </form>

                <div className="bg-slate-900/40 rounded-3xl border border-white/5 overflow-hidden">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-white/5 text-[10px] font-black uppercase tracking-widest text-slate-500">
                        <th className="p-4">Signal</th>
                        <th className="p-4">Time</th>
                        <th className="p-4">Date</th>
                        <th className="p-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {signals.map(s => (
                        <tr key={s.id} className="hover:bg-white/5 transition-colors">
                          <td className="p-4 text-yellow-500 font-black">{s.value}</td>
                          <td className="p-4 text-slate-400 text-sm font-bold">{s.time}</td>
                          <td className="p-4 text-slate-400 text-sm font-bold">{s.date}</td>
                          <td className="p-4 text-right">
                            <button onClick={() => deleteSignal(s.id)} className="text-red-500 hover:text-red-400 p-2">
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'notices' && (
              <div className="space-y-8">
                <h2 className="text-3xl font-black text-white">Emergency Notices</h2>
                <form onSubmit={handleAddNotice} className="bg-slate-900/40 p-8 rounded-3xl border border-white/5 flex flex-col gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Notice Message</label>
                    <textarea 
                      placeholder="Enter urgent message for all users..." 
                      value={newNotice}
                      onChange={e => setNewNotice(e.target.value)}
                      required
                      className="w-full bg-slate-800 border border-white/5 rounded-xl p-4 text-white min-h-[120px]" 
                    />
                  </div>
                  <button className="bg-red-600 text-white p-4 rounded-xl font-bold hover:bg-red-500 transition-all flex items-center justify-center gap-2 self-end px-10">
                    <Send className="w-5 h-5" /> Broadcast Notice
                  </button>
                </form>

                <div className="space-y-4">
                  {notices.map(n => (
                    <div key={n.id} className="bg-slate-900/40 p-6 rounded-3xl border border-white/5 flex items-center justify-between gap-6">
                      <div className="flex-1">
                        <p className="text-white font-bold">{n.message}</p>
                        <p className="text-slate-500 text-[10px] mt-1 uppercase font-bold">{new Date(n.timestamp).toLocaleString()}</p>
                      </div>
                      <button 
                        onClick={() => toggleNotice(n.id, n.active)}
                        className={`px-6 py-2 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${
                          n.active ? 'bg-green-600 text-white' : 'bg-slate-800 text-slate-500'
                        }`}
                      >
                        {n.active ? 'Active' : 'Inactive'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color }: any) {
  const colors: any = {
    blue: 'bg-blue-600/10 text-blue-500 border-blue-600/20',
    green: 'bg-green-600/10 text-green-500 border-green-600/20',
    yellow: 'bg-yellow-600/10 text-yellow-500 border-yellow-600/20',
    purple: 'bg-purple-600/10 text-purple-500 border-purple-600/20',
  };

  return (
    <div className="bg-slate-900/40 p-6 rounded-3xl border border-white/5">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border mb-4 ${colors[color]}`}>
        <Icon className="w-6 h-6" />
      </div>
      <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{label}</p>
      <p className="text-2xl font-black text-white mt-1">{value}</p>
    </div>
  );
}
