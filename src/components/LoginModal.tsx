import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, Mail, Lock, Zap, ArrowRight } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { auth } from '../lib/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface LoginModalProps {
  onSuccess: () => void;
  onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ onSuccess, onClose }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
      onSuccess();
    } catch (err: any) {
      console.error('Auth error:', err);
      // Simplify error messages for user
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError('Invalid email or password');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('Email already in use');
      } else if (err.code === 'auth/weak-password') {
        setError('Password should be at least 6 characters');
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md">
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white border-[6px] border-black rounded-[40px] shadow-[20px_20px_0px_0px_rgba(0,0,0,1)] p-10 relative overflow-hidden"
      >
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 hover:bg-slate-100 rounded-full transition-colors"
        >
          <X size={24} className="text-black" />
        </button>

        <div className="mb-8">
          <div className="w-12 h-12 bg-indigo-600 border-2 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center mb-6">
            <Zap className="text-white" size={24} fill="currentColor" />
          </div>
          <h2 className="text-4xl font-black text-black italic tracking-tighter uppercase leading-none">
            {isLogin ? 'Welcome Back' : 'Join QuestAi'}
          </h2>
          <p className="text-slate-500 font-bold mt-2">
            Professional AI questions for elite developers.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="text-[10px] font-black text-black uppercase tracking-widest mb-2 block ml-1">Email Terminal</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="developer@questai.ai"
                className="w-full bg-slate-50 border-4 border-black rounded-2xl py-4 pl-12 pr-4 font-bold text-black focus:outline-none focus:ring-4 ring-indigo-600/20"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-black text-black uppercase tracking-widest mb-2 block ml-1">Secure Key</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="********"
                className="w-full bg-slate-50 border-4 border-black rounded-2xl py-4 pl-12 pr-4 font-bold text-black focus:outline-none focus:ring-4 ring-indigo-600/20"
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border-2 border-red-200 p-4 rounded-xl text-red-600 text-xs font-bold animate-shake">
              {error}
            </div>
          )}

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white font-black py-5 rounded-2xl border-4 border-black shadow-[8px_8px_0px_0px_rgba(31,31,31,1)] hover:bg-slate-800 transition-all active:translate-x-1 active:translate-y-1 active:shadow-none flex items-center justify-center gap-3 text-lg"
          >
            {loading ? 'AUTHENTICATING...' : isLogin ? 'SIGN IN' : 'CREATE ACCOUNT'}
            {!loading && <ArrowRight size={20} />}
          </button>
        </form>

        <div className="mt-8 text-center">
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="text-xs font-black text-indigo-600 uppercase tracking-widest hover:underline"
          >
            {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
