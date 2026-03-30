import React, { useState } from 'react';
import { motion } from 'motion/react';
import { User } from '../types';
import { Camera, Mail, Phone, User as UserIcon, ShieldCheck, ShieldAlert, LogOut } from 'lucide-react';
import { updateProfile } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

interface Props {
  user: User;
  onLogout: () => void;
}

export default function Profile({ user, onLogout }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [photoURL, setPhotoURL] = useState(user.photoURL);

  const handleUpdatePhoto = async () => {
    const newPhoto = prompt('Enter new photo URL:', photoURL);
    if (newPhoto && newPhoto !== photoURL) {
      try {
        setPhotoURL(newPhoto);
        await updateDoc(doc(db, 'users', user.uid), { photoURL: newPhoto });
        if (auth.currentUser) {
          await updateProfile(auth.currentUser, { photoURL: newPhoto });
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="relative">
        <div className="h-40 bg-gradient-to-br from-red-600 to-red-900 rounded-3xl shadow-2xl overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://picsum.photos/seed/bg/800/400')] opacity-20 mix-blend-overlay bg-cover" />
        </div>
        
        <div className="absolute -bottom-12 left-1/2 -translate-x-1/2">
          <div className="relative group">
            <div className="w-32 h-32 rounded-3xl border-4 border-slate-950 overflow-hidden shadow-2xl bg-slate-900">
              <img 
                src={photoURL} 
                alt={user.name} 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <button 
              onClick={handleUpdatePhoto}
              className="absolute bottom-2 right-2 w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center border-2 border-slate-950 shadow-lg hover:bg-red-500 transition-colors"
            >
              <Camera className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>
      </div>

      <div className="pt-16 text-center">
        <h2 className="text-3xl font-black tracking-tight text-white">{user.name}</h2>
        <div className="flex items-center justify-center gap-2 mt-2">
          {user.status === 'active' ? (
            <div className="flex items-center gap-1.5 bg-green-500/10 text-green-500 px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest border border-green-500/20">
              <ShieldCheck className="w-3.5 h-3.5" />
              Active Member
            </div>
          ) : (
            <div className="flex items-center gap-1.5 bg-red-500/10 text-red-500 px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest border border-red-500/20">
              <ShieldAlert className="w-3.5 h-3.5" />
              Unactive Member
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-4 mt-8">
        <div className="bg-slate-900/40 backdrop-blur-xl p-5 rounded-3xl border border-white/5 flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-600/10 rounded-2xl flex items-center justify-center border border-blue-600/20">
            <Mail className="w-6 h-6 text-blue-500" />
          </div>
          <div className="flex-1">
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Email Address</p>
            <p className="text-white font-bold">{user.email}</p>
          </div>
        </div>

        <div className="bg-slate-900/40 backdrop-blur-xl p-5 rounded-3xl border border-white/5 flex items-center gap-4">
          <div className="w-12 h-12 bg-purple-600/10 rounded-2xl flex items-center justify-center border border-purple-600/20">
            <Phone className="w-6 h-6 text-purple-500" />
          </div>
          <div className="flex-1">
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Phone Number</p>
            <p className="text-white font-bold">{user.phone}</p>
          </div>
        </div>

        <div className="bg-slate-900/40 backdrop-blur-xl p-5 rounded-3xl border border-white/5 flex items-center gap-4">
          <div className="w-12 h-12 bg-red-600/10 rounded-2xl flex items-center justify-center border border-red-600/20">
            <UserIcon className="w-6 h-6 text-red-500" />
          </div>
          <div className="flex-1">
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">User ID</p>
            <p className="text-white font-mono text-xs">{user.uid}</p>
          </div>
        </div>
      </div>

      <button
        onClick={onLogout}
        className="w-full bg-slate-900 text-red-500 py-5 rounded-3xl font-black uppercase tracking-widest flex items-center justify-center gap-3 border border-red-500/20 hover:bg-red-500/10 transition-all mt-6"
      >
        <LogOut className="w-6 h-6" />
        Logout Account
      </button>
    </div>
  );
}
