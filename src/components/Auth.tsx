import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  updateProfile 
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { User, UserRole, UserStatus } from '../types';
import { Mail, Lock, User as UserIcon, Phone, ArrowRight, Loader2 } from 'lucide-react';

interface Props {
  onAuthSuccess: () => void;
}

export default function Auth({ onAuthSuccess }: Props) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (mode === 'register') {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const fbUser = userCredential.user;
        
        await updateProfile(fbUser, { displayName: name });
        
        const newUser: User = {
          uid: fbUser.uid,
          name,
          email,
          phone,
          photoURL: `https://picsum.photos/seed/${fbUser.uid}/200/200`,
          status: email === 'Ashik@avator.com' ? 'active' : 'inactive',
          role: email === 'Ashik@avator.com' ? 'admin' : 'user',
          createdAt: new Date().toISOString(),
        };
        
        await setDoc(doc(db, 'users', fbUser.uid), newUser);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      onAuthSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen flex items-center justify-center p-6 bg-slate-950 relative overflow-hidden"
    >
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-red-600/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-red-900/20 rounded-full blur-[120px]" />

      <motion.div
        layout
        className="bg-slate-900/40 backdrop-blur-xl p-8 rounded-3xl shadow-2xl max-w-md w-full border border-white/10 relative z-10"
      >
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-gradient-to-br from-red-600 to-red-900 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-red-600/20">
            <span className="text-3xl font-black">A</span>
          </div>
          <h2 className="text-3xl font-black tracking-tight text-white mb-2">
            {mode === 'login' ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="text-slate-400 text-sm">
            {mode === 'login' ? 'Login to access your predictions' : 'Join the elite prediction community'}
          </p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm mb-6"
          >
            {error}
          </motion.div>
        )}

        <form onSubmit={handleAuth} className="space-y-4">
          <AnimatePresence mode="popLayout">
            {mode === 'register' && (
              <motion.div
                key="register-fields"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-4"
              >
                <div className="relative group">
                  <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-red-500 transition-colors" />
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full bg-slate-800/50 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all"
                  />
                </div>
                <div className="relative group">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-red-500 transition-colors" />
                  <input
                    type="tel"
                    placeholder="Phone Number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    className="w-full bg-slate-800/50 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="relative group">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-red-500 transition-colors" />
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-slate-800/50 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all"
            />
          </div>

          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-red-500 transition-colors" />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-slate-800/50 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-red-600 to-red-500 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:from-red-500 hover:to-red-400 transition-all shadow-lg shadow-red-600/20 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <>
                {mode === 'login' ? 'Sign In' : 'Create Account'}
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-slate-400 text-sm">
            {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}
            <button
              onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
              className="ml-2 text-red-500 font-bold hover:text-red-400 transition-colors"
            >
              {mode === 'login' ? 'Register Now' : 'Login Here'}
            </button>
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}
