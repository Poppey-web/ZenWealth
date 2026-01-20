
import React, { useState, useMemo, useEffect } from 'react';
import Sidebar from './components/Sidebar.tsx';
import StatsHeader from './components/StatsHeader.tsx';
import PortfolioCharts from './components/PortfolioCharts.tsx';
import AssetList from './components/AssetList.tsx';
import AIAdvisor from './components/AIAdvisor.tsx';
import AddAssetModal from './components/AddAssetModal.tsx';
import CashFlow from './components/CashFlow.tsx';
import Auth from './components/Auth.tsx';
import SettingsView from './components/SettingsView.tsx';
import Recommendations from './components/Recommendations.tsx';
import ComparisonView from './components/ComparisonView.tsx';
import WatchlistView from './components/WatchlistView.tsx';
import { supabase } from './services/supabaseClient.ts';
import { Asset, PortfolioStats, HealthWeights, ChartDataPoint } from './types.ts';
import { HealthScoreResult, syncMarketPrices } from './services/geminiService.ts';

const App: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [healthScores, setHealthScores] = useState<Record<string, HealthScoreResult>>({});
  const [healthWeights, setHealthWeights] = useState<HealthWeights>(() => {
    const saved = localStorage.getItem('zen_health_weights');
    return saved ? JSON.parse(saved) : { volatility: 0.33, liquidity: 0.33, resilience: 0.34 };
  });
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error' | 'info'} | null>(null);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [syncing, setSyncing] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => localStorage.getItem('sidebar_collapsed') === 'true');
  
  const [displayName, setDisplayName] = useState(localStorage.getItem('zen_display_name') || 'Investor');
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

  useEffect(() => {
    localStorage.setItem('zen_health_weights', JSON.stringify(healthWeights));
  }, [healthWeights]);

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

  const mapAssetToDb = (a: any) => ({
    name: a.name,
    category: a.category,
    quantity: a.quantity,
    unit_price: a.unitPrice,
    value: a.value,
    yield_apy: a.yieldAPY,
    fee_percentage: a.feePercentage,
    tags: Array.isArray(a.tags) ? a.tags : [],
    change24h: a.change24h || 0,
  });

  const handleDeleteAsset = async (id: string) => {
    try {
      const { error } = await supabase.from('assets').delete().eq('id', id);
      if (error) throw error;
      setAssets(assets.filter(a => a.id !== id));
      showToast("Position Liquidated", "success");
    } catch (err: any) {
      showToast(err.message, "error");
    }
  };

  const handleSyncPrices = async () => {
    if (syncing || assets.length === 0) return;
    setSyncing(true);
    showToast("Connecting to markets...", "info");
    try {
      const { updates } = await syncMarketPrices(assets);
      for (const update of updates) {
        const asset = assets.find(a => a.id === update.id);
        if (asset && update.unitPrice !== undefined) {
          await supabase.from('assets').update({ 
            unit_price: update.unitPrice, 
            value: asset.quantity * update.unitPrice,
            change24h: update.change24h || 0 
          }).eq('id', update.id);
        }
      }
      await fetchAssets();
      showToast("Portfolio Synced", "success");
    } catch (e: any) {
      showToast(e.message, "error");
    } finally {
      setSyncing(false);
    }
  };

  const showToast = (message: any, type: 'success' | 'error' | 'info' = 'success') => {
    const text = typeof message === 'string' ? message : (message?.message || "Error");
    setToast({ message: text, type });
    setTimeout(() => setToast(null), 4000);
  };

  const stats: PortfolioStats = useMemo(() => {
    const totalNetWorth = assets.reduce((sum, a) => sum + a.value, 0);
    const totalChange24h = assets.reduce((sum, a) => sum + (a.value * (a.change24h || 0) / 100), 0);
    const totalChangePercentage = totalNetWorth > 0 ? (totalChange24h / (totalNetWorth - totalChange24h)) * 100 : 0;
    return { totalNetWorth, totalChange24h, totalChangePercentage };
  }, [assets]);

  // Génération d'historique factice basé sur la valeur réelle actuelle pour que le graph fonctionne
  const historyData: ChartDataPoint[] = useMemo(() => {
    const baseValue = stats.totalNetWorth;
    const months = ['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr'];
    return months.map((m, i) => ({
      date: `2024-${m}`,
      value: baseValue * (0.85 + (i * 0.02) + (Math.random() * 0.05))
    })).concat([{ date: 'Aujourd\'hui', value: baseValue }]);
  }, [stats.totalNetWorth]);

  if (!session) return <Auth onLogin={() => {}} />;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col md:flex-row transition-all duration-1000">
      <Sidebar 
        activeTab={activeTab} setActiveTab={setActiveTab} 
        onLogout={() => supabase.auth.signOut()} 
        username={displayName} avatar={avatar} email={session.user.email}
        isCollapsed={isSidebarCollapsed} onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />
      
      {toast && (
        <div className={`fixed top-12 left-1/2 -translate-x-1/2 z-[100] px-10 py-5 rounded-[2.5rem] glass-card shadow-2xl flex items-center gap-5 animate-in fade-in slide-in-from-top-12 duration-700 max-w-[90vw]`}>
          <div className={`w-3 h-3 rounded-full animate-pulse ${toast.type === 'success' ? 'bg-emerald-500' : toast.type === 'info' ? 'bg-indigo-500' : 'bg-rose-500'}`} />
          <span className="font-black text-[10px] uppercase tracking-[0.3em] dark:text-white leading-none">{toast.message}</span>
        </div>
      )}

      <main className={`flex-1 p-6 md:p-12 lg:p-20 transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] ${isSidebarCollapsed ? 'md:ml-32' : 'md:ml-80'}`}>
        <header className="flex flex-col xl:flex-row xl:items-end justify-between mb-20 gap-10">
          <div>
            <h1 className="text-5xl md:text-7xl xl:text-8xl font-black text-slate-950 dark:text-white tracking-tighter leading-none text-display">
              {activeTab === 'dashboard' ? 'Overview' : activeTab === 'assets' ? 'Assets' : activeTab === 'compare' ? 'Insights' : activeTab === 'watchlist' ? 'ZenWatch' : activeTab === 'settings' ? 'Settings' : activeTab === 'cashflow' ? 'CashFlow' : 'ZenWealth'}
            </h1>
            <p className="text-slate-400 dark:text-slate-500 font-black mt-6 uppercase tracking-[0.4em] text-[10px]">Wealth Intelligence Hub — High Precision Asset Management</p>
          </div>
          <div className="flex flex-wrap gap-4">
            {(activeTab === 'dashboard' || activeTab === 'assets') && (
              <>
                <button 
                  onClick={handleSyncPrices} 
                  disabled={syncing} 
                  className="bg-slate-950 dark:bg-white text-white dark:text-slate-950 px-10 py-5 rounded-[2rem] font-black text-[10px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all duration-700 disabled:opacity-50"
                >
                  {syncing ? 'Connecting...' : 'Sync Market'}
                </button>
                <button onClick={() => { setEditingAsset(null); setIsModalOpen(true); }} className="bg-indigo-600 text-white px-12 py-5 rounded-[2rem] font-black text-[10px] uppercase tracking-widest shadow-2xl shadow-indigo-500/30 hover:bg-indigo-700 hover:scale-105 active:scale-95 transition-all duration-700">
                  + Add Position
                </button>
              </>
            )}
          </div>
        </header>

        <div className="max-w-[1800px] mx-auto animate-in fade-in slide-in-from-bottom-12 duration-1000 ease-[cubic-bezier(0.23,1,0.32,1)]">
          {activeTab === 'dashboard' && (
            <div className="space-y-20">
              <StatsHeader stats={stats} goal={freedomGoal} />
              <div className="bento-grid">
                <div className="col-span-12 xl:col-span-8 space-y-16">
                  {/* Graphique plein écran */}
                  <PortfolioCharts history={historyData} assets={assets} />
                </div>
                <div className="col-span-12 xl:col-span-4 space-y-16">
                   <AIAdvisor 
                     assets={assets} 
                     onScoresUpdate={setHealthScores} 
                     weights={healthWeights} 
                     onWeightsChange={setHealthWeights}
                   />
                   <Recommendations assets={assets} />
                </div>
              </div>
            </div>
          )}
          {activeTab === 'assets' && (
            <AssetList 
              isPrivate={isPrivate} assets={assets} 
              onDeleteAsset={handleDeleteAsset} 
              onEditAsset={(a) => { setEditingAsset(a); setIsModalOpen(true); }}
              healthScores={healthScores}
              weights={healthWeights}
            />
          )}
          {activeTab === 'compare' && <ComparisonView assets={assets} />}
          {activeTab === 'watchlist' && <WatchlistView userId={session.user.id} />}
          {activeTab === 'cashflow' && <CashFlow userId={session.user.id} onToast={showToast} />}
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
        const dbData = { ...mapAssetToDb(a), user_id: session.user.id };
        const { error } = await supabase.from('assets').insert([dbData]);
        if (error) showToast(error.message, 'error');
        else { showToast("Asset Tracked", "success"); fetchAssets(); }
      }} onUpdate={async (a) => {
        const dbData = mapAssetToDb(a);
        const { error } = await supabase.from('assets').update(dbData).eq('id', a.id);
        if (error) showToast(error.message, 'error');
        else { showToast("Position Updated", "success"); fetchAssets(); }
      }} assets={assets} initialAsset={editingAsset} />
    </div>
  );
};

export default App;
