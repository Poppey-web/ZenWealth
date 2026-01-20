
import React, { useState } from 'react';
import { supabase } from '../services/supabaseClient.ts';

interface AuthProps {
  onLogin: (email: string, username: string) => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) throw signInError;
      } else {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });
        if (signUpError) throw signUpError;
        setError("Inscription réussie ! Vérifiez vos emails.");
      }
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6 transition-all duration-1000 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-600/10 blur-[120px] rounded-full" />

      <div className="w-full max-w-xl relative z-10">
        <div className="text-center mb-16 animate-in fade-in slide-in-from-top-12 duration-1000">
          <div className="w-24 h-24 bg-indigo-600 rounded-6xl flex items-center justify-center text-white mx-auto mb-8 shadow-2xl shadow-indigo-500/30">
            <span className="text-4xl font-black">ZW</span>
          </div>
          <h1 className="text-6xl font-black text-slate-950 dark:text-white tracking-tighter text-display">ZenWealth</h1>
          <p className="text-slate-400 mt-6 font-black uppercase tracking-[0.5em] text-[10px]">Wealth Intelligence Hub</p>
        </div>

        <div className="glass-card p-12 md:p-16 rounded-[4rem] shadow-2xl border-white/20 animate-in zoom-in-95 duration-700">
          <h2 className="text-3xl font-black text-slate-950 dark:text-white mb-10 tracking-tight">
            {isLogin ? 'Welcome Back' : 'Join the Elite'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-3">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Secure Email</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-8 py-5 rounded-[2rem] bg-slate-100 dark:bg-white/5 border-2 border-transparent focus:border-indigo-600 outline-none transition-all font-black text-slate-950 dark:text-white"
                placeholder="investor@zenwealth.com"
                required
              />
            </div>
            <div className="space-y-3">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Password</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-8 py-5 rounded-[2rem] bg-slate-100 dark:bg-white/5 border-2 border-transparent focus:border-indigo-600 outline-none transition-all font-black text-slate-950 dark:text-white"
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <div className={`text-[11px] font-black p-6 rounded-[2rem] border animate-in fade-in ${error.includes('réussie') ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
                {error}
              </div>
            )}

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-6 rounded-[2.5rem] font-black shadow-2xl shadow-indigo-500/40 hover:bg-indigo-700 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 text-xs uppercase tracking-widest"
            >
              {loading ? 'AUTHENTICATING...' : isLogin ? 'SIGN IN' : 'CREATE ACCOUNT'}
            </button>
          </form>

          <div className="mt-12 text-center">
            <button 
              onClick={() => setIsLogin(!isLogin)}
              className="text-[10px] font-black text-slate-400 hover:text-indigo-600 uppercase tracking-[0.2em] transition-colors"
            >
              {isLogin ? "DON'T HAVE AN ACCOUNT? JOIN US" : "ALREADY TRACKING? SIGN IN"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
