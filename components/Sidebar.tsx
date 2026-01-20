
import React, { useState } from 'react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
  username: string;
  avatar: string;
  email?: string;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, onLogout, username, avatar, email, isCollapsed, onToggleCollapse }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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

  // Sélectionner les 4 icônes principales pour la barre de navigation mobile
  const mobileQuickLinks = menuItems.filter(item => ['dashboard', 'assets', 'cashflow', 'watchlist'].includes(item.id));

  return (
    <>
      {/* BARRE LATERALE (DESKTOP) */}
      <div className={`${isCollapsed ? 'w-24' : 'w-64'} bg-white dark:bg-slate-950 h-screen border-r border-slate-200 dark:border-slate-800 hidden md:flex flex-col fixed left-0 top-0 z-50 transition-all duration-300`}>
        <div className={`p-6 flex items-center h-24 ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
          {!isCollapsed && (
            <div className="flex items-center gap-3 min-w-0 pr-4">
              <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center text-white text-xs shrink-0 shadow-lg shadow-indigo-200 dark:shadow-none">ZW</div>
              <span className="text-xl font-black text-indigo-600 dark:text-indigo-400 truncate">ZenWealth</span>
            </div>
          )}
          <button 
            onClick={onToggleCollapse}
            className={`p-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-indigo-600 transition-all shrink-0 hover:scale-110 active:scale-90 ${isCollapsed ? '' : ''}`}
          >
            {isCollapsed ? '➡' : '⬅'}
          </button>
        </div>
        
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto scrollbar-hide">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all ${
                activeTab === item.id
                  ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-black shadow-sm'
                  : 'text-slate-400 hover:text-slate-900 dark:hover:text-white font-bold hover:bg-slate-50 dark:hover:bg-slate-800/50'
              } ${isCollapsed ? 'justify-center' : ''}`}
              title={isCollapsed ? item.label : ''}
            >
              <span className="text-xl">{item.icon}</span>
              {!isCollapsed && <span className="text-sm tracking-tight truncate">{item.label}</span>}
            </button>
          ))}
        </nav>
        
        <div className={`p-6 border-t border-slate-100 dark:border-slate-800 ${isCollapsed ? 'flex justify-center' : ''}`}>
          <div className="flex items-center gap-3 px-1 min-w-0">
            <div className="relative shrink-0">
              <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xl shadow-sm border border-slate-200 dark:border-slate-700">
                {avatar}
              </div>
            </div>
            {!isCollapsed && (
              <div className="flex flex-col min-w-0">
                <p className="text-sm font-black text-slate-900 dark:text-white truncate">{username}</p>
                {isFounder && (
                  <span className="text-[8px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest bg-indigo-50 dark:bg-indigo-900/30 px-1.5 py-0.5 rounded-md w-fit">Fondateur</span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* BARRE DE NAVIGATION BASSE (MOBILE) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 z-[60] px-4 pb-safe">
        <div className="flex justify-around items-center h-20">
          {mobileQuickLinks.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center gap-1 transition-all ${activeTab === item.id ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`}
            >
              <span className="text-2xl">{item.icon}</span>
              <span className="text-[10px] font-black uppercase tracking-tighter">{item.label.split(' ')[0]}</span>
            </button>
          ))}
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="flex flex-col items-center gap-1 text-slate-400"
          >
            <span className="text-2xl">☰</span>
            <span className="text-[10px] font-black uppercase tracking-tighter">Menu</span>
          </button>
        </div>
      </div>

      {/* MENU TIROIR MOBILE (DRAWER) */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-[70] flex items-end">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in" onClick={() => setIsMobileMenuOpen(false)} />
          <div className="relative w-full bg-white dark:bg-slate-900 rounded-t-[3rem] p-8 pb-12 shadow-2xl border-t border-white/10 animate-in slide-in-from-bottom-full duration-300">
            <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full mx-auto mb-8" />
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-2xl border border-slate-200 dark:border-slate-700">
                {avatar}
              </div>
              <div>
                <p className="font-black text-slate-900 dark:text-white">{username}</p>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Compte ZenWealth</p>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => { setActiveTab(item.id); setIsMobileMenuOpen(false); }}
                  className={`flex flex-col items-center gap-3 p-4 rounded-3xl transition-all border ${
                    activeTab === item.id
                      ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400'
                      : 'bg-slate-50 dark:bg-slate-800/50 border-transparent text-slate-500'
                  }`}
                >
                  <span className="text-2xl">{item.icon}</span>
                  <span className="text-[9px] font-black uppercase text-center leading-tight">{item.label}</span>
                </button>
              ))}
            </div>

            <button 
              onClick={() => { onLogout(); setIsMobileMenuOpen(false); }}
              className="w-full mt-8 py-4 bg-rose-50 dark:bg-rose-950/30 text-rose-600 rounded-2xl font-black uppercase text-[10px] tracking-widest border border-rose-100 dark:border-rose-900"
            >
              Déconnexion
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
