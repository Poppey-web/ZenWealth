
import React from 'react';

interface SettingsViewProps {
  user: any;
  displayName: string;
  setDisplayName: (val: string) => void;
  avatar: string;
  setAvatar: (val: string) => void;
  isDark: boolean;
  setIsDark: (val: boolean) => void;
  isPrivate: boolean;
  setIsPrivate: (val: boolean) => void;
  currency: string;
  setCurrency: (val: string) => void;
  onLogout: () => void;
  freedomGoal: number;
  setFreedomGoal: (val: number) => void;
}

const EMOJIS = ['👤', '🦁', '🦊', '🦉', '💎', '🚀', '🧠', '💰', '🧘', '🦄', '🦅', '🐲', '⚡', '🌌', '🍀'];
const CURRENCIES = [
  { code: 'EUR', symbol: '€', label: 'Euro' },
  { code: 'USD', symbol: '$', label: 'US Dollar' },
  { code: 'GBP', symbol: '£', label: 'British Pound' },
  { code: 'CHF', symbol: '₣', label: 'Swiss Franc' },
];

const SettingsView: React.FC<SettingsViewProps> = ({
  user, displayName, setDisplayName, avatar, setAvatar, isDark, setIsDark, isPrivate, setIsPrivate, currency, setCurrency, onLogout, freedomGoal, setFreedomGoal
}) => {
  const isFounder = user?.email === 'nilscattiauxtruelle@gmail.com';

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-24 animate-in fade-in duration-500">
      <section className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-50 dark:border-slate-800 flex justify-between items-center">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Profil & Objectifs</h3>
          {isFounder && (
            <span className="bg-indigo-600 text-white text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-lg shadow-indigo-200">💎 Compte Fondateur</span>
          )}
        </div>
        <div className="p-8 space-y-10">
          <div className="flex flex-col md:flex-row items-center gap-10">
            <div className="space-y-4 text-center">
              <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-[2.5rem] flex items-center justify-center text-5xl border border-slate-200 dark:border-slate-700 shadow-inner relative group">
                {avatar}
                <div className="absolute inset-0 bg-black/5 rounded-[2.5rem] opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Avatar Actuel</p>
            </div>
            
            <div className="flex-1 w-full space-y-6">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Nom d'affichage</label>
                <input value={displayName} onChange={e => setDisplayName(e.target.value)} className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 rounded-2xl font-black outline-none border-2 border-transparent focus:border-indigo-500 transition-all" />
              </div>
              
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Changer l'avatar</label>
                <div className="flex flex-wrap gap-2">
                  {EMOJIS.map(e => (
                    <button 
                      key={e} 
                      onClick={() => { setAvatar(e); localStorage.setItem('zen_avatar', e); }}
                      className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl transition-all ${avatar === e ? 'bg-indigo-600 text-white scale-110 shadow-lg' : 'bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
                    >
                      {e}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-2 ml-1">Objectif Liberté Financière ({currency === 'EUR' ? '€' : currency})</label>
                <input 
                  type="number" 
                  value={freedomGoal} 
                  onChange={e => setFreedomGoal(Number(e.target.value))} 
                  className="w-full px-6 py-4 bg-indigo-50 dark:bg-indigo-950/20 border-2 border-indigo-100 dark:border-indigo-900 text-indigo-600 dark:text-indigo-400 rounded-2xl font-black outline-none text-2xl tracking-tighter" 
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-50 dark:border-slate-800">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Préférences & Devise</h3>
        </div>
        <div className="p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Devise Principale</label>
              <div className="grid grid-cols-2 gap-3">
                {CURRENCIES.map(c => (
                  <button 
                    key={c.code} 
                    onClick={() => { setCurrency(c.code); localStorage.setItem('currency', c.code); }}
                    className={`px-5 py-4 rounded-2xl font-black text-sm flex items-center justify-between transition-all border-2 ${currency === c.code ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400' : 'border-transparent bg-slate-50 dark:bg-slate-800 text-slate-500'}`}
                  >
                    <span>{c.label}</span>
                    <span className="opacity-40">{c.symbol}</span>
                  </button>
                ))}
              </div>
            </div>
            
            <div className="space-y-4">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Interface</label>
              <div className="flex items-center justify-between p-5 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                <p className="font-black text-slate-900 dark:text-white text-sm">Mode Sombre</p>
                <button onClick={() => setIsDark(!isDark)} className={`w-14 h-8 rounded-full p-1 flex items-center transition-colors ${isDark ? 'bg-indigo-600 justify-end' : 'bg-slate-300 justify-start'}`}>
                  <div className="w-6 h-6 bg-white rounded-full shadow-sm" />
                </button>
              </div>
              <div className="flex items-center justify-between p-5 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                <p className="font-black text-slate-900 dark:text-white text-sm">Mode Discret (Masquer Valeurs)</p>
                <button onClick={() => setIsPrivate(!isPrivate)} className={`w-14 h-8 rounded-full p-1 flex items-center transition-colors ${isPrivate ? 'bg-indigo-600 justify-end' : 'bg-slate-300 justify-start'}`}>
                  <div className="w-6 h-6 bg-white rounded-full shadow-sm" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <button onClick={onLogout} className="w-full py-6 bg-rose-600 text-white font-black rounded-3xl shadow-xl shadow-rose-100 dark:shadow-none uppercase tracking-[0.2em] text-xs hover:bg-rose-700 hover:scale-[1.01] transition-all active:scale-95">Déconnexion Sécurisée</button>
    </div>
  );
};

export default SettingsView;
