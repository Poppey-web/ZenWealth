
import React, { useState } from 'react';
import Logo from './Logo.tsx';

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

  const menuItems = [
    { id: 'dashboard', label: 'Overview', icon: '✦' },
    { id: 'assets', label: 'Portfolio', icon: '◈' },
    { id: 'compare', label: 'Insights', icon: '▣' },
    { id: 'watchlist', label: 'ZenWatch', icon: '◎' },
    { id: 'cashflow', label: 'CashFlow', icon: '⌇' },
    { id: 'settings', label: 'Settings', icon: '⚙' },
  ];

  // Fix: Explicitly type NavItem as a React.FC to allow the 'key' prop when used in map
  const NavItem: React.FC<{ item: any, isMobile?: boolean }> = ({ item, isMobile = false }) => {
    const isActive = activeTab === item.id;
    return (
      <button
        onClick={() => {
          setActiveTab(item.id);
          if (isMobile) setIsMobileMenuOpen(false);
        }}
        className={`relative flex items-center transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] ${
          isMobile 
            ? 'flex-col gap-2 p-4' 
            : `w-full gap-5 px-6 py-4 rounded-[2rem] group ${
                isActive ? 'bg-indigo-600 text-white shadow-2xl shadow-indigo-500/40' : 'text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/10'
              } ${isCollapsed ? 'justify-center' : ''}`
        }`}
      >
        <span className={`text-2xl transition-transform duration-700 group-hover:scale-125 ${isActive ? 'scale-110' : ''}`}>
          {item.icon}
        </span>
        {(!isCollapsed || isMobile) && (
          <span className={`${isMobile ? 'text-[9px]' : 'text-sm'} font-black tracking-tight uppercase`}>
            {item.label}
          </span>
        )}
      </button>
    );
  };

  return (
    <>
      <aside className={`fixed left-8 top-8 bottom-8 z-50 transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] hidden md:flex flex-col glass-card rounded-[4rem] p-7 ${isCollapsed ? 'w-28' : 'w-80'}`}>
        <div className={`flex items-center mb-16 ${isCollapsed ? 'justify-center' : 'justify-between px-2'}`}>
          {!isCollapsed && (
            <div className="flex items-center gap-4 animate-in fade-in slide-in-from-left-4 duration-1000">
              <Logo className="w-12 h-12" />
              <span className="text-2xl font-black tracking-tighter dark:text-white leading-none">ZenWealth</span>
            </div>
          )}
          {isCollapsed && <Logo className="w-12 h-12" />}
          <button 
            onClick={onToggleCollapse}
            className="p-3 rounded-2xl bg-slate-100 dark:bg-white/5 text-slate-400 hover:text-indigo-600 transition-all"
          >
            {isCollapsed ? '→' : '←'}
          </button>
        </div>

        <nav className="flex-1 space-y-4">
          {menuItems.map(item => <NavItem key={item.id} item={item} />)}
        </nav>

        <div className="mt-auto">
          <button 
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center gap-4 p-5 rounded-[2.5rem] bg-slate-50 dark:bg-white/5 border border-white/5 transition-all hover:border-indigo-600/30 group ${isCollapsed ? 'justify-center' : ''}`}
          >
            <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-2xl shrink-0 group-hover:rotate-12 transition-transform">
              {avatar}
            </div>
            {!isCollapsed && (
              <div className="flex flex-col text-left overflow-hidden">
                <p className="text-sm font-black text-slate-900 dark:text-white truncate">{username}</p>
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest truncate">{email}</span>
              </div>
            )}
          </button>
        </div>
      </aside>

      <nav className="md:hidden fixed bottom-6 left-6 right-6 z-[60] glass-card rounded-5xl h-24 flex justify-around items-center px-6">
        {menuItems.slice(0, 4).map(item => <NavItem key={item.id} item={item} isMobile />)}
        <button onClick={() => setIsMobileMenuOpen(true)} className="text-slate-400">☰</button>
      </nav>
    </>
  );
};

export default Sidebar;
