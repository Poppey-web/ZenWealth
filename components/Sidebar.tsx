
import React from 'react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
  username: string;
  avatar: string;
  email?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, onLogout, username, avatar, email }) => {
  const isFounder = email === 'nilscattiauxtruelle@gmail.com';

  const menuItems = [
    { id: 'dashboard', label: 'Vue Globale', icon: '📱' },
    { id: 'assets', label: 'Portefeuille', icon: '💼' },
    { id: 'compare', label: 'Comparaison', icon: '⚖️' },
    { id: 'watchlist', label: 'Watchlist', icon: '👁️' },
    { id: 'recommendations', label: 'Zen Conseils', icon: '💡' },
    { id: 'news', label: 'Actualités', icon: '🌍' },
    { id: 'cashflow', label: 'Flux', icon: '💰' },
    { id: 'budget', label: 'Budgets', icon: '📝' },
    { id: 'settings', label: 'Réglages', icon: '⚙️' },
  ];

  return (
    <div className="w-64 bg-white dark:bg-slate-950 h-screen border-r border-slate-200 dark:border-slate-800 hidden md:flex flex-col fixed left-0 top-0 z-50 transition-colors duration-300">
      <div className="p-8">
        <h1 className="text-2xl font-black text-indigo-600 dark:text-indigo-400 flex items-center gap-2">
          <span className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white text-sm">ZW</span>
          ZenWealth
        </h1>
      </div>
      <nav className="flex-1 px-4 space-y-1 overflow-y-auto scrollbar-hide">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all ${
              activeTab === item.id
                ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-black'
                : 'text-slate-400 hover:text-slate-900 dark:hover:text-white font-bold'
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            <span className="text-sm tracking-tight">{item.label}</span>
          </button>
        ))}
      </nav>
      <div className="p-6 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3 px-2">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xl shadow-sm border border-slate-200 dark:border-slate-700">
              {avatar}
            </div>
            {isFounder && (
              <div className="absolute -top-1 -right-1 bg-indigo-600 text-white rounded-full p-0.5 border-2 border-white dark:border-slate-950">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293l-4 4a1 1 0 01-1.414 0l-2-2a1 1 0 111.414-1.414L9 10.586l3.293-3.293a1 1 0 111.414 1.414z"/></svg>
              </div>
            )}
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="text-sm font-black text-slate-900 dark:text-white truncate">{username}</p>
            </div>
            {isFounder && (
              <span className="text-[8px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest bg-indigo-50 dark:bg-indigo-900/30 px-1.5 py-0.5 rounded-md w-fit">Fondateur</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
