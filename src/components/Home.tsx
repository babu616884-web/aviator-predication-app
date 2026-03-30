import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Transaction, VIPSignal, Stats } from '../types';
import Profile from './Profile';
import TransactionHistory from './TransactionHistory';
import Prediction from './Prediction';
import VIPPrediction from './VIPPrediction';
import LiveStatus from './LiveStatus';
import SupportChat from './SupportChat';
import { 
  User as UserIcon, 
  History, 
  Zap, 
  Crown, 
  Activity, 
  LogOut, 
  Menu, 
  X,
  ChevronRight,
  MessageSquare
} from 'lucide-react';

interface Props {
  user: User;
  onLogout: () => void;
  onSwitchToAdmin?: () => void;
}

type Tab = 'profile' | 'transaction' | 'prediction' | 'vip' | 'live' | 'support';

export default function Home({ user, onLogout, onSwitchToAdmin }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('prediction');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { id: 'profile', label: 'Profile', icon: UserIcon, color: 'blue' },
    { id: 'transaction', label: 'History', icon: History, color: 'purple' },
    { id: 'prediction', label: 'Prediction', icon: Zap, color: 'red' },
    { id: 'vip', label: 'VIP', icon: Crown, color: 'yellow' },
    { id: 'live', label: 'Live', icon: Activity, color: 'green' },
    { id: 'support', label: 'Support', icon: MessageSquare, color: 'pink' },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'profile': return <Profile user={user} onLogout={onLogout} />;
      case 'transaction': return <TransactionHistory user={user} />;
      case 'prediction': return <Prediction user={user} />;
      case 'vip': return <VIPPrediction user={user} />;
      case 'live': return <LiveStatus />;
      case 'support': return <SupportChat user={user} />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 pb-24">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-white/5 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-red-900 rounded-xl flex items-center justify-center shadow-lg shadow-red-600/20">
            <span className="text-xl font-black">A</span>
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight">AVIATOR PRO</h1>
            <p className="text-[10px] text-red-500 font-bold uppercase tracking-widest">Premium Access</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {onSwitchToAdmin && (
            <button 
              onClick={onSwitchToAdmin}
              className="hidden sm:flex items-center gap-2 bg-red-600/10 text-red-500 px-4 py-2 rounded-xl border border-red-600/20 hover:bg-red-600/20 transition-all font-bold text-[10px] uppercase tracking-widest"
            >
              <Crown className="w-3 h-3" /> Admin Panel
            </button>
          )}
          <div className="text-right hidden sm:block">
            <p className="text-xs text-slate-400 font-bold">{user.name}</p>
            <p className={`text-[10px] font-black uppercase ${user.status === 'active' ? 'text-green-500' : 'text-red-500'}`}>
              {user.status === 'active' ? 'Active Member' : 'Inactive'}
            </p>
          </div>
          <button 
            onClick={onLogout}
            className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center border border-white/5 hover:bg-red-600/20 transition-colors"
          >
            <LogOut className="w-5 h-5 text-slate-400" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 max-w-4xl mx-auto w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-slate-900/90 backdrop-blur-2xl border-t border-white/10 px-2 py-3 flex items-center justify-around shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as Tab)}
              className={`relative flex flex-col items-center gap-1 p-2 transition-all duration-300 ${isActive ? 'scale-110' : 'opacity-50 grayscale hover:grayscale-0 hover:opacity-80'}`}
            >
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${isActive ? `bg-gradient-to-br from-red-600 to-red-900 shadow-lg shadow-red-600/30` : 'bg-slate-800'}`}>
                <Icon className={`w-6 h-6 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              </div>
              <span className={`text-[10px] font-bold uppercase tracking-tighter ${isActive ? 'text-red-500' : 'text-slate-500'}`}>
                {item.label}
              </span>
              {isActive && (
                <motion.div
                  layoutId="active-nav"
                  className="absolute -top-1 w-1 h-1 bg-red-500 rounded-full"
                />
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
