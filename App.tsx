
import React, { useState, useMemo, useEffect } from 'react';
import Sidebar from './components/Sidebar.tsx';
import StatsHeader from './components/StatsHeader.tsx';
import PortfolioCharts from './components/PortfolioCharts.tsx';
import AssetList from './components/AssetList.tsx';
import AIAdvisor from './components/AIAdvisor.tsx';
import AddAssetModal from './components/AddAssetModal.tsx';
import CashFlow from './components/CashFlow.tsx';
import Budgeting from './components/Budgeting.tsx';
import Auth from './components/Auth.tsx';
import SettingsView from './components/SettingsView.tsx';
import Recommendations from './components/Recommendations.tsx';
import News from './components/News.tsx';
import ComparisonView from './components/ComparisonView.tsx';
import WatchlistView from './components/WatchlistView.tsx';
import { supabase } from './services/supabaseClient.ts';
import { Asset, PortfolioStats } from './types.ts';
import { HealthScoreResult, syncMarketPrices } from './services/geminiService.ts';

const App: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [healthScores, setHealthScores] = useState<Record<string, HealthScoreResult>>({});
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error' | 'info'} | null>(null);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [syncing, setSyncing] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => localStorage.getItem('sidebar_collapsed') === 'true');
  
  // Settings
  const [displayName, setDisplayName] = useState(localStorage.getItem('zen_display_name') || '');
  const [avatar, setAvatar] = useState(localStorage.getItem('zen_avatar') || '🧘');
  const [freedomGoal, setFreedomGoal] = useState(() => Number(localStorage.getItem('zen_freedom_goal')) || 1000000);
  const [isDark, setIsDark] = useState(() => localStorage.getItem('theme') === 'dark');
  const [isPrivate, setIsPrivate] = useState(() => localStorage.getItem('privateMode') === 'true');
  const [currency, setCurrency] = useState(() => localStorage.getItem('currency') || 'EUR');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => setSession(session));
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session) fetchAssets();
  }, [session]);

  useEffect(() => {
    if (isDark) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  useEffect(() => {
    localStorage.setItem('sidebar_collapsed', String(isSidebarCollapsed));
  }, [isSidebarCollapsed]);

  const fetchAssets = async () => {
    try {
      const { data, error } = await supabase.from('assets').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setAssets((data || []).map(item => ({
        id: item.id,
        name: item.name,
        category: item.category,
        quantity: item.quantity,
        unitPrice: item.unit_price,
        value: item.value,
        change24h: item.change24h,
        yieldAPY: item.yield_apy,
        feePercentage: item.fee_percentage || 0,
        tags: item.tags,
        user_id: item.user_id,
        created_at: item.created_at
      })));
    } catch (err: any) {
      showToast(err, 'error');
    }
  };

  const handleSyncPrices = async () => {
    if (syncing || assets.length === 0) return;
    setSyncing(true);
    showToast("Synchronisation des marchés...", "info");
    try {
      const { updates } = await syncMarketPrices(assets);
      for (const update of updates) {
        const asset = assets.find(a => a.id === update.id);
        if (asset && update.unitPrice) {
          await supabase.from('assets').update({ 
            unit_price: update.unitPrice, 
            value: asset.quantity * update.unitPrice,
            change24h: update.change24h || 0 
          }).eq('id', update.id);
        }
      }
      await fetchAssets();
      showToast("Portefeuille actualisé !", "success");
    } catch (e: any) {
      showToast(e.message, "error");
    } finally {
      setSyncing(false);
    }
  };

  const showToast = (message: any, type: 'success' | 'error' | 'info' = 'success') => {
    const text = typeof message === 'string' ? message : (message?.message || "Erreur");
    setToast({ message: text, type });
    setTimeout(() => setToast(null), 5000);
  };

  const stats: PortfolioStats = useMemo(() => {
    const totalNetWorth = assets.reduce((sum, a) => sum + a.value, 0);
    const totalChange24h = assets.reduce((sum, a) => sum + (a.value * (a.change24h || 0) / 100), 0);
    const totalChangePercentage = totalNetWorth > 0 ? (totalChange24h / (totalNetWorth - totalChange24h)) * 100 : 0;
    return { totalNetWorth, totalChange24h, totalChangePercentage };
  }, [assets]);

  if (!session) return <Auth onLogin={() => {}} />;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col md:flex-row transition-all duration-500">
      <Sidebar 
        activeTab={activeTab} setActiveTab={setActiveTab} 
        onLogout={() => supabase.auth.signOut()} 
        username={displayName} avatar={avatar} email={session.user.email}
        isCollapsed={isSidebarCollapsed} onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />
      
      {toast && (
        <div className={`fixed top-8 left-1/2 -translate-x-1/2 z-[100] px-6 py-4 rounded-2xl shadow-2xl border flex items-center gap-4 animate-in fade-in slide-in-from-top-4 max-w-[90vw] ${toast.type === 'success' ? 'bg-emerald-600 text-white border-emerald-500' : toast.type === 'info' ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-rose-600 text-white border-rose-500'}`}>
          <span className="font-black text-[10px] uppercase tracking-widest">{toast.message}</span>
        </div>
      )}

      <main className={`flex-1 p-4 md:p-10 pb-28 overflow-y-auto transition-all duration-300 ${isSidebarCollapsed ? 'md:ml-24' : 'md:ml-64'}`}>
        <header className="flex flex-col sm:flex-row sm:items-center justify-between mb-10 gap-6">
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tighter">
            {activeTab === 'dashboard' ? 'Vue Globale' : activeTab === 'assets' ? 'Portefeuille' : activeTab === 'compare' ? 'Comparateur' : activeTab === 'watchlist' ? 'Suivi' : activeTab === 'recommendations' ? 'Conseils' : activeTab === 'news' ? 'Actualités' : activeTab === 'cashflow' ? 'Flux' : activeTab === 'budget' ? 'Budgets' : 'Réglages'}
          </h1>
          <div className="flex gap-4">
            {(activeTab === 'dashboard' || activeTab === 'assets') && (
              <>
                <button onClick={handleSyncPrices} disabled={syncing} className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase border dark:border-slate-700 shadow-sm disabled:opacity-50">
                  {syncing ? 'Synchro...' : 'Mise à jour'}
                </button>
                <button onClick={() => { setEditingAsset(null); setIsModalOpen(true); }} className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-black text-[10px] uppercase shadow-xl hover:scale-105 active:scale-95 transition-all">
                  + Ajouter
                </button>
              </>
            )}
          </div>
        </header>

        <div className="max-w-7xl mx-auto">
          {activeTab === 'dashboard' && (
            <div className="space-y-10">
              <StatsHeader stats={stats} goal={freedomGoal} />
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
                <div className="xl:col-span-2 space-y-8">
                  <PortfolioCharts history={[]} assets={assets} />
                  <AssetList isPrivate={isPrivate} assets={assets} onEditAsset={(a) => { setEditingAsset(a); setIsModalOpen(true); }} />
                </div>
                <div className="space-y-6">
                   <AIAdvisor assets={assets} onScoresUpdate={setHealthScores} />
                </div>
              </div>
            </div>
          )}
          {activeTab === 'assets' && <AssetList isPrivate={isPrivate} assets={assets} onEditAsset={(a) => { setEditingAsset(a); setIsModalOpen(true); }} />}
          {activeTab === 'compare' && <ComparisonView assets={assets} />}
          {activeTab === 'watchlist' && <WatchlistView userId={session.user.id} />}
          {activeTab === 'recommendations' && <Recommendations assets={assets} />}
          {activeTab === 'news' && <News />}
          {activeTab === 'cashflow' && <CashFlow userId={session.user.id} onToast={showToast} />}
          {activeTab === 'budget' && <Budgeting userId={session.user.id} onToast={showToast} />}
          {activeTab === 'settings' && (
            <SettingsView 
              user={session.user} displayName={displayName} setDisplayName={setDisplayName}
              avatar={avatar} setAvatar={setAvatar} isDark={isDark} setIsDark={setIsDark}
              isPrivate={isPrivate} setIsPrivate={setIsPrivate} currency={currency} setCurrency={setCurrency}
              onLogout={() => supabase.auth.signOut()} freedomGoal={freedomGoal} setFreedomGoal={(v) => { setFreedomGoal(v); localStorage.setItem('zen_freedom_goal', v.toString()); }}
            />
          )}
        </div>
      </main>

      <AddAssetModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onAdd={async (a) => {
        const { error } = await supabase.from('assets').insert([{...a, unit_price: a.unitPrice, user_id: session.user.id}]);
        if (error) showToast(error.message, 'error');
        else { showToast("Actif ajouté !", "success"); fetchAssets(); }
      }} onUpdate={async (a) => {
        const { error } = await supabase.from('assets').update({...a, unit_price: a.unitPrice}).eq('id', a.id);
        if (error) showToast(error.message, 'error');
        else { showToast("Actif mis à jour !", "success"); fetchAssets(); }
      }} assets={assets} initialAsset={editingAsset} />
    </div>
  );
};

export default App;
