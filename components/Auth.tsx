
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
        const { error: signUpError, data } = await supabase.auth.signUp({
          email,
          password,
        });
        if (signUpError) throw signUpError;
        
        if (data?.user && !data?.session) {
          setError("Inscription réussie ! Si vous ne recevez pas l'email de confirmation, vérifiez vos spams ou désactivez 'Confirm Email' dans les paramètres Auth de Supabase.");
        }
      }
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4 transition-colors duration-500">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-indigo-600 rounded-[2.5rem] flex items-center justify-center text-white mx-auto mb-6 shadow-2xl shadow-indigo-200 dark:shadow-none animate-bounce-slow">
            <span className="text-3xl font-black italic">ZW</span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">ZenWealth</h1>
          <p className="text-slate-400 mt-2 font-bold uppercase tracking-widest text-[10px]">Intelligence Patrimoniale</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden relative transition-all">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-indigo-600"></div>
          
          <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-8">
            {isLogin ? 'Connexion' : 'Nouvel Investisseur'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-6 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500 outline-none transition-all font-bold text-slate-900 dark:text-white"
                placeholder="nom@exemple.com"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Mot de passe</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-6 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500 outline-none transition-all font-bold text-slate-900 dark:text-white"
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <div className={`text-[11px] font-bold p-5 rounded-2xl border leading-relaxed animate-in fade-in slide-in-from-top-2 ${error.includes('réussie') ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
                {error}
              </div>
            )}

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black shadow-xl shadow-indigo-100 dark:shadow-none hover:bg-indigo-700 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 text-sm uppercase tracking-widest"
            >
              {loading ? 'Traitement...' : isLogin ? 'Démarrer' : 'Rejoindre'}
            </button>
          </form>

          <div className="mt-10 text-center">
            <button 
              onClick={() => setIsLogin(!isLogin)}
              className="text-xs font-black text-slate-400 hover:text-indigo-600 uppercase tracking-widest transition-colors"
            >
              {isLogin ? "S'inscrire" : "Se connecter"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
