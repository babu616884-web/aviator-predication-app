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
import { User, Transaction, VIPSignal, Notice, SupportChat, SupportMessage } from '../types';
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
  ShieldAlert,
  MessageSquare,
  User as UserIcon
} from 'lucide-react';

interface Props {
  onLogout: () => void;
  onSwitchToUser?: () => void;
}

type AdminTab = 'dashboard' | 'users' | 'transactions' | 'signals' | 'notices' | 'support';

export default function Admin({ onLogout, onSwitchToUser }: Props) {
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [users, setUsers] = useState<User[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [signals, setSignals] = useState<VIPSignal[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [supportChats, setSupportChats] = useState<SupportChat[]>([]);
  const [selectedChat, setSelectedChat] = useState<SupportChat | null>(null);
  const [chatMessages, setChatMessages] = useState<SupportMessage[]>([]);
  const [adminReply, setAdminReply] = useState('');
  const [loading, setLoading] = useState(true);
  const [declineModal, setDeclineModal] = useState<{ show: boolean; tx: Transaction | null; reason: string }>({
    show: false,
    tx: null,
    reason: ''
  });

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

    const unsubSupport = onSnapshot(query(collection(db, 'support_chats'), orderBy('lastTimestamp', 'desc')), (snapshot) => {
      setSupportChats(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SupportChat)));
    }, (error) => {
      console.error("Admin support chats snapshot error:", error);
    });

    return () => {
      unsubUsers();
      unsubTx();
      unsubSignals();
      unsubNotices();
      unsubSupport();
    };
  }, []);

  useEffect(() => {
    if (selectedChat) {
      const q = query(collection(db, 'support_chats', selectedChat.userId, 'messages'), orderBy('timestamp', 'asc'));
      const unsubMessages = onSnapshot(q, (snapshot) => {
        setChatMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SupportMessage)));
        // Reset unread count when admin views
        if (selectedChat.unreadCount > 0) {
          updateDoc(doc(db, 'support_chats', selectedChat.userId), { unreadCount: 0 });
        }
      });
      return () => unsubMessages();
    } else {
      setChatMessages([]);
    }
  }, [selectedChat]);

  const handleSendAdminReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminReply.trim() || !selectedChat) return;

    const text = adminReply.trim();
    setAdminReply('');

    try {
      await addDoc(collection(db, 'support_chats', selectedChat.userId, 'messages'), {
        text,
        senderId: 'admin',
        timestamp: new Date().toISOString(),
        isAdmin: true
      });

      await updateDoc(doc(db, 'support_chats', selectedChat.userId), {
        lastMessage: text,
        lastTimestamp: new Date().toISOString()
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleApproveTx = async (tx: Transaction) => {
    try {
      await updateDoc(doc(db, 'transactions', tx.id), { status: 'success' });
      await updateDoc(doc(db, 'users', tx.uid), { status: 'active' });
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeclineTx = async () => {
    if (declineModal.tx && declineModal.reason) {
      try {
        await updateDoc(doc(db, 'transactions', declineModal.tx.id), { 
          status: 'declined', 
          reason: declineModal.reason 
        });
        setDeclineModal({ show: false, tx: null, reason: '' });
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleDeleteUser = async (uid: string) => {
    if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        await deleteDoc(doc(db, 'users', uid));
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleBlockUser = async (uid: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'blocked' ? 'inactive' : 'blocked';
      await updateDoc(doc(db, 'users', uid), { status: newStatus });
    } catch (err) {
      console.error(err);
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
    { id: 'support', label: 'Support', icon: MessageSquare },
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
          {onSwitchToUser && (
            <button 
              onClick={onSwitchToUser}
              className="flex items-center gap-3 p-4 rounded-2xl font-bold text-sm text-yellow-500 hover:bg-yellow-500/10 transition-all mb-4 border border-yellow-500/20"
            >
              <Zap className="w-5 h-5" />
              Switch to User View
            </button>
          )}
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
                  <StatCard label="Total Revenue" value={transactions.filter(t => t.status === 'success').reduce((acc, t) => acc + t.amount, 0) + ' BDT'} icon={CreditCard} color="purple" />
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
                        <th className="p-4 text-right">Actions</th>
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
                            <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-full ${
                              u.status === 'active' ? 'bg-green-500/10 text-green-500' : 
                              u.status === 'blocked' ? 'bg-red-600/10 text-red-500' :
                              'bg-yellow-500/10 text-yellow-500'
                            }`}>
                              {u.status}
                            </span>
                          </td>
                          <td className="p-4 text-slate-400 text-sm font-bold uppercase">{u.role}</td>
                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button 
                                onClick={() => handleBlockUser(u.uid, u.status)}
                                className={`p-2 rounded-lg transition-colors ${u.status === 'blocked' ? 'text-green-500 hover:bg-green-500/10' : 'text-yellow-500 hover:bg-yellow-500/10'}`}
                                title={u.status === 'blocked' ? 'Unblock User' : 'Block User'}
                              >
                                {u.status === 'blocked' ? <ShieldCheck className="w-5 h-5" /> : <ShieldAlert className="w-5 h-5" />}
                              </button>
                              <button 
                                onClick={() => handleDeleteUser(u.uid)}
                                className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                                title="Delete User"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </div>
                          </td>
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
                              onClick={() => setDeclineModal({ show: true, tx, reason: '' })}
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

            {activeTab === 'support' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[calc(100vh-8rem)]">
                {/* Chat List */}
                <div className="bg-slate-900/40 rounded-3xl border border-white/5 overflow-hidden flex flex-col">
                  <div className="p-6 border-b border-white/5 bg-white/5">
                    <h2 className="text-xl font-black text-white">Support Chats</h2>
                  </div>
                  <div className="flex-1 overflow-y-auto divide-y divide-white/5">
                    {supportChats.length === 0 ? (
                      <div className="p-10 text-center text-slate-500">
                        <MessageSquare className="w-10 h-10 mx-auto mb-4 opacity-20" />
                        <p className="text-sm font-bold uppercase tracking-widest">No Active Chats</p>
                      </div>
                    ) : (
                      supportChats.map(chat => (
                        <button
                          key={chat.id}
                          onClick={() => setSelectedChat(chat)}
                          className={`w-full p-4 flex items-center gap-4 hover:bg-white/5 transition-all text-left ${selectedChat?.id === chat.id ? 'bg-white/5' : ''}`}
                        >
                          <div className="relative">
                            <img src={chat.userPhoto} className="w-12 h-12 rounded-xl" referrerPolicy="no-referrer" />
                            {chat.unreadCount > 0 && (
                              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-slate-900">
                                {chat.unreadCount}
                              </span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="text-white font-bold truncate">{chat.userName}</p>
                              <p className="text-[9px] text-slate-500 font-bold uppercase">{new Date(chat.lastTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                            </div>
                            <p className="text-xs text-slate-400 truncate mt-0.5">{chat.lastMessage}</p>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </div>

                {/* Chat Window */}
                <div className="lg:col-span-2 bg-slate-900/40 rounded-3xl border border-white/5 overflow-hidden flex flex-col">
                  {selectedChat ? (
                    <>
                      <div className="p-4 border-b border-white/5 bg-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <img src={selectedChat.userPhoto} className="w-10 h-10 rounded-xl" referrerPolicy="no-referrer" />
                          <div>
                            <h3 className="text-sm font-black text-white uppercase tracking-wider">{selectedChat.userName}</h3>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">User ID: {selectedChat.userId}</p>
                          </div>
                        </div>
                        <button onClick={() => setSelectedChat(null)} className="lg:hidden text-slate-500 hover:text-white">
                          <XCircle className="w-6 h-6" />
                        </button>
                      </div>

                      <div className="flex-1 overflow-y-auto p-6 space-y-4">
                        {chatMessages.map(msg => (
                          <div key={msg.id} className={`flex ${msg.isAdmin ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] p-4 rounded-2xl text-sm ${msg.isAdmin ? 'bg-red-600 text-white rounded-tr-none' : 'bg-slate-800 text-white rounded-tl-none'}`}>
                              <p>{msg.text}</p>
                              <p className="text-[9px] opacity-50 mt-1 font-bold uppercase">{new Date(msg.timestamp).toLocaleTimeString()}</p>
                            </div>
                          </div>
                        ))}
                      </div>

                      <form onSubmit={handleSendAdminReply} className="p-4 bg-white/5 border-t border-white/5 flex gap-3">
                        <input
                          type="text"
                          value={adminReply}
                          onChange={e => setAdminReply(e.target.value)}
                          placeholder="Type your reply..."
                          className="flex-1 bg-slate-800 border border-white/5 rounded-xl p-4 text-white focus:outline-none focus:ring-2 focus:ring-red-500/50"
                        />
                        <button className="bg-red-600 text-white p-4 rounded-xl font-bold hover:bg-red-500 transition-all">
                          <Send className="w-5 h-5" />
                        </button>
                      </form>
                    </>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-10">
                      <div className="w-20 h-20 bg-slate-800 rounded-3xl flex items-center justify-center mb-6">
                        <MessageSquare className="w-10 h-10 text-slate-500" />
                      </div>
                      <h3 className="text-xl font-black text-white mb-2 uppercase tracking-widest">Select a Conversation</h3>
                      <p className="text-slate-500 text-sm max-w-xs">Choose a chat from the list to start helping our users.</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Decline Reason Modal */}
      <AnimatePresence>
        {declineModal.show && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
              onClick={() => setDeclineModal({ show: false, tx: null, reason: '' })}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-slate-900 border border-white/10 p-8 rounded-3xl shadow-2xl max-w-md w-full relative z-10"
            >
              <h3 className="text-2xl font-black text-white mb-4 uppercase tracking-tight">Decline Payment</h3>
              <p className="text-slate-400 text-sm mb-6">Please provide a reason for declining this payment request.</p>
              
              <textarea
                value={declineModal.reason}
                onChange={e => setDeclineModal({ ...declineModal, reason: e.target.value })}
                placeholder="e.g. Invalid Transaction ID"
                className="w-full bg-slate-800 border border-white/5 rounded-xl p-4 text-white min-h-[120px] mb-6 focus:outline-none focus:ring-2 focus:ring-red-500/50"
              />

              <div className="flex gap-3">
                <button
                  onClick={() => setDeclineModal({ show: false, tx: null, reason: '' })}
                  className="flex-1 bg-slate-800 text-white py-4 rounded-xl font-bold hover:bg-slate-700 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeclineTx}
                  disabled={!declineModal.reason.trim()}
                  className="flex-1 bg-red-600 text-white py-4 rounded-xl font-bold hover:bg-red-500 transition-all disabled:opacity-50"
                >
                  Decline
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
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
