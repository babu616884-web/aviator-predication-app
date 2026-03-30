import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  updateProfile,
  signInWithPopup,
  GoogleAuthProvider,
  sendPasswordResetEmail
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db, handleFirestoreError } from '../firebase';
import { User, UserRole, UserStatus, OperationType } from '../types';
import { Mail, Lock, User as UserIcon, Phone, ArrowRight, Loader2, Chrome, HelpCircle } from 'lucide-react';

interface Props {
  onAuthSuccess: () => void;
}

export default function Auth({ onAuthSuccess }: Props) {
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    try {
      await sendPasswordResetEmail(auth, email);
      setMessage('Password reset link sent to your email!');
      setTimeout(() => setMode('login'), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const fbUser = result.user;
      
      const userDoc = await getDoc(doc(db, 'users', fbUser.uid));
      if (!userDoc.exists()) {
        const newUser: User = {
          uid: fbUser.uid,
          name: fbUser.displayName || 'User',
          email: fbUser.email || '',
          phone: fbUser.phoneNumber || '',
          photoURL: fbUser.photoURL || `https://picsum.photos/seed/${fbUser.uid}/200/200`,
          status: fbUser.email === 'mahamudurrahman778@gmail.com' ? 'active' : 'inactive',
          role: fbUser.email === 'mahamudurrahman778@gmail.com' ? 'admin' : 'user',
          createdAt: new Date().toISOString(),
        };
        try {
          await setDoc(doc(db, 'users', fbUser.uid), newUser);
        } catch (err) {
          handleFirestoreError(err, OperationType.WRITE, `users/${fbUser.uid}`);
        }
      } else {
        // If user exists, but it's the admin email, ensure role is admin
        const userData = userDoc.data() as User;
        if (fbUser.email === 'mahamudurrahman778@gmail.com' && userData.role !== 'admin') {
          try {
            await setDoc(doc(db, 'users', fbUser.uid), { ...userData, role: 'admin', status: 'active' });
          } catch (err) {
            handleFirestoreError(err, OperationType.WRITE, `users/${fbUser.uid}`);
          }
        }
      }
      onAuthSuccess();
    } catch (err: any) {
      if (err.code === 'auth/network-request-failed') {
        setError('Network error! Please check your internet or disable ad-blockers.');
      } else if (err.code === 'auth/invalid-credential') {
        setError('Invalid login. If you haven\'t registered yet, please use the "Register Now" link below.');
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

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
          status: email === 'mahamudurrahman778@gmail.com' ? 'active' : 'inactive',
          role: email === 'mahamudurrahman778@gmail.com' ? 'admin' : 'user',
          createdAt: new Date().toISOString(),
        };
        
        try {
          await setDoc(doc(db, 'users', fbUser.uid), newUser);
        } catch (err) {
          handleFirestoreError(err, OperationType.WRITE, `users/${fbUser.uid}`);
        }
      } else {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const fbUser = userCredential.user;
        
        // Ensure admin role is set if it's the admin email
        if (fbUser.email === 'mahamudurrahman778@gmail.com') {
          const userDoc = await getDoc(doc(db, 'users', fbUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data() as User;
            if (userData.role !== 'admin') {
              try {
                await setDoc(doc(db, 'users', fbUser.uid), { ...userData, role: 'admin', status: 'active' });
              } catch (err) {
                handleFirestoreError(err, OperationType.WRITE, `users/${fbUser.uid}`);
              }
            }
          }
        }
      }
      onAuthSuccess();
    } catch (err: any) {
      if (err.code === 'auth/network-request-failed') {
        setError('Network error! Please check your internet or disable ad-blockers.');
      } else if (err.code === 'auth/invalid-credential') {
        setError('Invalid login. If you haven\'t registered yet, please use the "Register Now" link below.');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('This email is already registered. Please try to Login instead.');
      } else if (err.code === 'auth/weak-password') {
        setError('Password should be at least 6 characters long.');
      } else {
        setError(err.message);
      }
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
            {mode === 'login' ? 'Welcome Back' : mode === 'register' ? 'Create Account' : 'Reset Password'}
          </h2>
          <p className="text-slate-400 text-sm">
            {mode === 'login' ? 'Login to access your predictions' : mode === 'register' ? 'Join the elite prediction community' : 'Enter your email to reset password'}
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

        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-green-500/10 border border-green-500/20 text-green-400 p-4 rounded-xl text-sm mb-6"
          >
            {message}
          </motion.div>
        )}

        <form onSubmit={mode === 'forgot' ? handleResetPassword : handleAuth} className="space-y-4">
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

          {mode !== 'forgot' && (
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
          )}

          {mode === 'login' && (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setMode('forgot')}
                className="text-[10px] font-black uppercase text-slate-500 hover:text-red-500 transition-colors flex items-center gap-1"
              >
                <HelpCircle className="w-3 h-3" />
                Forgot Password?
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-red-600 to-red-500 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:from-red-500 hover:to-red-400 transition-all shadow-lg shadow-red-600/20 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <>
                {mode === 'login' ? 'Sign In' : mode === 'register' ? 'Create Account' : 'Send Reset Link'}
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>

          {mode !== 'forgot' && (
            <>
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/5"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-slate-900/40 px-2 text-slate-500 font-bold">Or continue with</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full bg-white/5 border border-white/10 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-white/10 transition-all disabled:opacity-50"
              >
                <Chrome className="w-5 h-5 text-red-500" />
                Google Login
              </button>
            </>
          )}
        </form>

        <div className="mt-8 text-center">
          <p className="text-slate-400 text-sm">
            {mode === 'login' ? "Don't have an account?" : mode === 'register' ? 'Already have an account?' : 'Remember your password?'}
            <button
              onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
              className="ml-2 text-red-500 font-bold hover:text-red-400 transition-colors"
            >
              {mode === 'login' ? 'Register Now' : mode === 'register' ? 'Login Here' : 'Back to Login'}
            </button>
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}
