
import React from 'react';

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
    <div className={`${isCollapsed ? 'w-24' : 'w-64'} bg-white dark:bg-slate-950 h-screen border-r border-slate-200 dark:border-slate-800 hidden md:flex flex-col fixed left-0 top-0 z-50 transition-all duration-300`}>
      <div className={`p-6 flex items-center h-24 ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
        {!isCollapsed && (
          <h1 className="text-xl font-black text-indigo-600 dark:text-indigo-400 flex items-center gap-2 min-w-0">
            <span className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center text-white text-xs shrink-0 shadow-lg shadow-indigo-200 dark:shadow-none">ZW</span>
            <span className="truncate">ZenWealth</span>
          </h1>
        )}
        <button 
          onClick={onToggleCollapse}
          className={`p-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-indigo-600 transition-all shrink-0 hover:scale-110 active:scale-90 ${isCollapsed ? '' : 'ml-2'}`}
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
  );
};

export default Sidebar;
