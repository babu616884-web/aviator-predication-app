import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  collection, 
  query, 
  onSnapshot, 
  orderBy, 
  addDoc, 
  serverTimestamp, 
  doc, 
  setDoc, 
  updateDoc,
  increment
} from 'firebase/firestore';
import { db } from '../firebase';
import { User, SupportMessage } from '../types';
import { Send, Loader2, MessageSquare, User as UserIcon, ShieldCheck } from 'lucide-react';

interface Props {
  user: User;
}

export default function SupportChat({ user }: Props) {
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const q = query(
      collection(db, 'support_chats', user.uid, 'messages'),
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SupportMessage)));
      setLoading(false);
      // Reset unread count for user when they open the chat (if we had unread for user)
      // For now, we only track unread for admin
    }, (error) => {
      console.error("Support messages snapshot error:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user.uid]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    setSending(true);
    const text = newMessage.trim();
    setNewMessage('');

    try {
      const messageData = {
        text,
        senderId: user.uid,
        timestamp: new Date().toISOString(),
        isAdmin: false
      };

      // Add message to subcollection
      await addDoc(collection(db, 'support_chats', user.uid, 'messages'), messageData);

      // Update chat session doc
      await setDoc(doc(db, 'support_chats', user.uid), {
        userId: user.uid,
        userName: user.name,
        userPhoto: user.photoURL,
        lastMessage: text,
        lastTimestamp: new Date().toISOString(),
        unreadCount: increment(1)
      }, { merge: true });

    } catch (err) {
      console.error("Error sending message:", err);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] bg-slate-900/40 backdrop-blur-xl rounded-3xl border border-white/5 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-white/5 bg-white/5 flex items-center gap-3">
        <div className="w-10 h-10 bg-red-600/20 rounded-xl flex items-center justify-center border border-red-600/30">
          <MessageSquare className="w-5 h-5 text-red-500" />
        </div>
        <div>
          <h3 className="text-sm font-black text-white uppercase tracking-wider">Live Support</h3>
          <p className="text-[10px] text-green-500 font-bold uppercase tracking-widest flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
            Online & Ready to Help
          </p>
        </div>
      </div>

      {/* Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth"
      >
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-6 h-6 text-red-500 animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mb-4">
              <MessageSquare className="w-8 h-8 text-slate-500" />
            </div>
            <h4 className="text-white font-bold mb-2">No Messages Yet</h4>
            <p className="text-slate-500 text-xs leading-relaxed">
              Send a message to start a conversation with our support team. We usually reply within a few minutes.
            </p>
          </div>
        ) : (
          messages.map((msg) => (
            <div 
              key={msg.id}
              className={`flex ${msg.isAdmin ? 'justify-start' : 'justify-end'}`}
            >
              <div className={`max-w-[80%] flex gap-2 ${msg.isAdmin ? 'flex-row' : 'flex-row-reverse'}`}>
                <div className={`w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center ${msg.isAdmin ? 'bg-red-600' : 'bg-slate-800'}`}>
                  {msg.isAdmin ? <ShieldCheck className="w-4 h-4 text-white" /> : <UserIcon className="w-4 h-4 text-slate-400" />}
                </div>
                <div className={`p-3 rounded-2xl text-sm ${
                  msg.isAdmin 
                    ? 'bg-slate-800 text-white rounded-tl-none' 
                    : 'bg-red-600 text-white rounded-tr-none'
                }`}>
                  <p>{msg.text}</p>
                  <p className="text-[9px] opacity-50 mt-1 font-bold uppercase">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSendMessage} className="p-4 bg-white/5 border-t border-white/5">
        <div className="relative">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="w-full bg-slate-800 border border-white/5 rounded-2xl py-4 pl-4 pr-14 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all"
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center text-white hover:bg-red-500 transition-all disabled:opacity-50 disabled:grayscale"
          >
            {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </button>
        </div>
      </form>
    </div>
  );
}
