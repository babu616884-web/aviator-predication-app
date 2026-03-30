import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, onSnapshot, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import { User, UserRole, UserStatus, Notice } from './types';
import { ShieldAlert } from 'lucide-react';
import Splash from './components/Splash';
import Auth from './components/Auth';
import Payment from './components/Payment';
import Home from './components/Home';
import Admin from './components/Admin';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [view, setView] = useState<'splash' | 'auth' | 'payment' | 'home' | 'admin' | 'blocked'>('splash');
  const [notice, setNotice] = useState<Notice | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        const userDoc = await getDoc(doc(db, 'users', fbUser.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data() as User;
          setUser(userData);
          if (userData.role === 'admin' && fbUser.email === 'mahamudurrahman778@gmail.com') {
            setView('admin');
          } else if (userData.status === 'blocked') {
            setView('blocked');
          } else if (userData.status === 'inactive') {
            setView('payment');
          } else {
            setView('home');
          }
        } else {
          // New user, need to register details
          setView('auth');
        }
      } else {
        setUser(null);
        setView('auth');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (firebaseUser) {
      const unsubscribe = onSnapshot(doc(db, 'users', firebaseUser.uid), (snapshot) => {
        if (snapshot.exists()) {
          const userData = snapshot.data() as User;
          setUser(userData);
          
          // Determine correct view based on user data
          let targetView: 'home' | 'admin' | 'payment' | 'blocked' = 'home';
          if (userData.role === 'admin' && firebaseUser.email === 'mahamudurrahman778@gmail.com') {
            targetView = 'admin';
          } else if (userData.status === 'blocked') {
            targetView = 'blocked';
          } else if (userData.status === 'inactive') {
            targetView = 'payment';
          }

          // Only update view if it's a necessary transition (e.g. from auth/payment/splash)
          // or if the status changed while in home/admin
          if (view === 'auth' || view === 'payment' || view === 'splash' || view === 'blocked' || 
              (view === 'home' && targetView === 'payment') ||
              (view === 'home' && targetView === 'blocked') ||
              (view === 'payment' && targetView === 'home')) {
            setView(targetView);
          }
        }
      }, (error) => {
        console.error("User snapshot error:", error);
      });
      return () => unsubscribe();
    }
  }, [firebaseUser, view]);

  useEffect(() => {
    if (firebaseUser) {
      const unsubscribe = onSnapshot(doc(db, 'notices', 'current'), (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data() as Notice;
          if (data.active) {
            setNotice(data);
          } else {
            setNotice(null);
          }
        }
      }, (error) => {
        console.error("Notice snapshot error:", error);
      });
      return () => unsubscribe();
    }
  }, [firebaseUser]);

  if (loading) return <Splash />;

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-red-500 selection:text-white">
      <AnimatePresence mode="wait">
        {view === 'splash' && (
          <motion.div key="splash" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Splash onFinish={() => setView('auth')} />
          </motion.div>
        )}
        {view === 'auth' && (
          <motion.div key="auth" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Auth onAuthSuccess={() => {}} />
          </motion.div>
        )}
        {view === 'payment' && (
          <motion.div key="payment" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Payment user={user!} onLogout={() => auth.signOut()} />
          </motion.div>
        )}
        {view === 'home' && (
          <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Home 
              user={user!} 
              onLogout={() => auth.signOut()} 
              onSwitchToAdmin={user?.role === 'admin' ? () => setView('admin') : undefined}
            />
          </motion.div>
        )}
        {view === 'admin' && (
          <motion.div key="admin" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Admin 
              onLogout={() => auth.signOut()} 
              onSwitchToUser={() => setView('home')}
            />
          </motion.div>
        )}
        {view === 'blocked' && (
          <motion.div key="blocked" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="min-h-screen flex items-center justify-center p-6 bg-slate-950">
              <div className="bg-slate-900/40 backdrop-blur-xl p-10 rounded-3xl shadow-2xl max-w-md w-full border border-red-500/20 text-center">
                <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <ShieldAlert className="w-12 h-12 text-red-500" />
                </div>
                <h2 className="text-3xl font-black text-white mb-4">Account Blocked</h2>
                <p className="text-slate-400 mb-8 leading-relaxed">
                  Your account has been suspended by the administrator for violating our terms of service. 
                  Please contact support if you believe this is a mistake.
                </p>
                <button
                  onClick={() => auth.signOut()}
                  className="w-full bg-red-600 text-white py-4 rounded-2xl font-bold hover:bg-red-500 transition-colors shadow-lg shadow-red-600/20"
                >
                  Logout
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {notice && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 50 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm"
        >
          <div className="bg-gradient-to-br from-red-600 to-red-900 p-8 rounded-3xl shadow-2xl max-w-md w-full border border-red-400/30 text-center">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-3xl">📢</span>
            </div>
            <h3 className="text-2xl font-bold mb-4">Important Notice</h3>
            <p className="text-red-50 mb-8 leading-relaxed">{notice.message}</p>
            <button
              onClick={() => setNotice(null)}
              className="w-full bg-white text-red-700 py-4 rounded-2xl font-bold hover:bg-red-50 transition-colors shadow-lg"
            >
              Understood
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
