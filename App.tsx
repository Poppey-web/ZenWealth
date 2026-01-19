
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
import { Asset, PortfolioStats, ChartDataPoint, AssetCategory } from './types.ts';
import { HealthScoreResult, syncMarketPrices } from './services/geminiService.ts';

const App: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [healthScores, setHealthScores] = useState<Record<string, HealthScoreResult>>({});
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error' | 'info'} | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  
  const [displayName, setDisplayName] = useState(localStorage.getItem('zen_display_name') || '');
  const [avatar, setAvatar] = useState(localStorage.getItem('zen_avatar') || '🧘');
  const [freedomGoal, setFreedomGoal] = useState(() => Number(localStorage.getItem('zen_freedom_goal')) || 1000000);

  const [isDark, setIsDark] = useState(() => localStorage.getItem('theme') === 'dark');
  const [isPrivate, setIsPrivate] = useState(() => localStorage.getItem('privateMode') === 'true');
  const [currency, setCurrency] = useState(() => localStorage.getItem('currency') || 'EUR');

  const [assets, setAssets] = useState<Asset[]>([]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session && !displayName) {
        const name = session.user.email?.split('@')[0] || 'ZenUser';
        setDisplayName(name);
        localStorage.setItem('zen_display_name', name);
      }
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => setSession(session));
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session) fetchAssets();
    else setLoading(false);
  }, [session]);

  useEffect(() => {
    if (isDark) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  const fetchAssets = async () => {
    if (!session) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.from('assets').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      
      const mappedAssets: Asset[] = (data || []).map(item => ({
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
      }));
      
      setAssets(mappedAssets);
    } catch (err: any) {
      showToast(err, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Helper pour convertir un objet Asset (camelCase) en format Supabase (snake_case)
  const mapAssetToDb = (a: any) => ({
    name: a.name,
    category: a.category,
    quantity: a.quantity,
    unit_price: a.unitPrice,
    value: a.value,
    yield_apy: a.yieldAPY,
    fee_percentage: a.feePercentage,
    tags: a.tags,
    change24h: a.change24h,
  });

  const handleSyncPrices = async () => {
    if (syncing || assets.length === 0) return;
    setSyncing(true);
    showToast("Synchronisation des prix via ZenIA...", "info");
    try {
      const { updates } = await syncMarketPrices(assets);
      if (updates && updates.length > 0) {
        for (const update of updates) {
          const asset = assets.find(a => a.id === update.id);
          if (asset && update.unitPrice) {
            const newValue = asset.quantity * update.unitPrice;
            await supabase.from('assets').update({ 
              unit_price: update.unitPrice, 
              value: newValue,
              change24h: update.change24h || 0 
            }).eq('id', update.id);
          }
        }
        await fetchAssets();
        showToast("Positions actualisées !", "success");
      } else {
        showToast("Aucune mise à jour trouvée.", "info");
      }
    } catch (e) {
      showToast("Erreur lors de la synchro marché.", "error");
    } finally {
      setSyncing(false);
    }
  };

  const showToast = (message: any, type: 'success' | 'error' | 'info' = 'success') => {
    const stringifyMessage = (m: any): string => {
      if (typeof m === 'string') return m;
      if (m?.message) return m.message;
      return "Erreur";
    };
    setToast({ message: stringifyMessage(message), type });
    setTimeout(() => setToast(null), 4000);
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
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onLogout={() => supabase.auth.signOut()} 
        username={displayName}
        avatar={avatar}
        email={session.user.email}
      />
      
      {/* Mobile Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-t border-slate-100 dark:border-slate-800 flex justify-around items-center py-4 px-2 z-[60] md:hidden shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
        {[
          { id: 'dashboard', label: 'Home', icon: '📱' },
          { id: 'assets', label: 'Actifs', icon: '💼' },
          { id: 'compare', label: '⚖️', icon: '⚖️' },
          { id: 'watchlist', label: 'Watch', icon: '👁️' },
          { id: 'settings', label: 'Profil', icon: '⚙️' },
        ].map(item => (
          <button 
            key={item.id} 
            onClick={() => setActiveTab(item.id)}
            className={`flex flex-col items-center gap-1 flex-1 transition-all ${activeTab === item.id ? 'text-indigo-600 scale-110' : 'text-slate-400'}`}
          >
            <span className="text-xl">{item.icon}</span>
            <span className="text-[9px] font-black uppercase tracking-widest">{item.label}</span>
          </button>
        ))}
      </nav>

      {toast && (
        <div className={`fixed top-8 right-8 z-[100] px-6 py-4 rounded-2xl shadow-2xl border flex items-center gap-4 animate-in slide-in-from-right-10 ${toast.type === 'success' ? 'bg-emerald-600 text-white border-emerald-500' : toast.type === 'info' ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-rose-600 text-white border-rose-500'}`}>
          <span className="font-black text-[10px] uppercase tracking-widest">{toast.message}</span>
        </div>
      )}

      <main className="flex-1 md:ml-64 p-4 md:p-10 pb-28 md:pb-10 overflow-y-auto">
        <header className="flex flex-col sm:flex-row sm:items-center justify-between mb-10 gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tighter">
              {activeTab === 'dashboard' ? 'Vue Globale' : activeTab === 'assets' ? 'Portefeuille' : activeTab === 'compare' ? 'Comparateur' : activeTab === 'watchlist' ? 'Liste de Suivi' : activeTab === 'recommendations' ? 'Zen Conseils' : activeTab === 'news' ? 'Actualités' : activeTab === 'cashflow' ? 'Flux' : activeTab === 'budget' ? 'Budgets' : 'Réglages'}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            {(activeTab === 'dashboard' || activeTab === 'assets') && (
              <>
                <button 
                  onClick={handleSyncPrices} 
                  disabled={syncing}
                  className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest border border-slate-100 dark:border-slate-700 shadow-sm hover:bg-slate-50 transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  <svg className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                  {syncing ? 'Synchro...' : 'Mise à jour'}
                </button>
                <button onClick={() => { setEditingAsset(null); setIsModalOpen(true); }} className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-700 shadow-xl shadow-indigo-200 dark:shadow-none transition-all active:scale-95 flex items-center gap-2">
                  <span className="text-lg">+</span>
                  <span>Ajouter</span>
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
                <AIAdvisor assets={assets} onScoresUpdate={setHealthScores} />
              </div>
            </div>
          )}

          {activeTab === 'assets' && (
            <div className="space-y-10">
               <StatsHeader stats={stats} goal={freedomGoal} />
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-between">
                   <div>
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Total Positions</p>
                     <h2 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter">{assets.length} <span className="text-xl text-slate-300 ml-2">Actifs</span></h2>
                   </div>
                   <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 rounded-3xl flex items-center justify-center text-3xl">💼</div>
                 </div>
                 <div className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-between">
                   <div>
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Moyenne / Actif</p>
                     <h2 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter">
                       {assets.length > 0 ? (stats.totalNetWorth / assets.length).toLocaleString(undefined, { maximumFractionDigits: 0 }) : 0} <span className="text-xl text-slate-300 ml-1">€</span>
                     </h2>
                   </div>
                   <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-3xl flex items-center justify-center text-3xl">📊</div>
                 </div>
               </div>
               <AssetList isPrivate={isPrivate} assets={assets} onEditAsset={(a) => { setEditingAsset(a); setIsModalOpen(true); }} />
            </div>
          )}

          {activeTab === 'compare' && <ComparisonView assets={assets} />}
          {activeTab === 'watchlist' && <WatchlistView userId={session.user.id} />}
          {activeTab === 'recommendations' && <Recommendations assets={assets} />}
          {activeTab === 'news' && <News />}
          {activeTab === 'cashflow' && <CashFlow userId={session.user.id} onToast={showToast} />}
          {activeTab === 'budget' && <Budgeting userId={session.user.id} onToast={showToast} />}
          {activeTab === 'settings' && (
            <SettingsView 
              user={session.user}
              displayName={displayName} setDisplayName={setDisplayName}
              avatar={avatar} setAvatar={setAvatar}
              isDark={isDark} setIsDark={setIsDark}
              isPrivate={isPrivate} setIsPrivate={setIsPrivate}
              currency={currency} setCurrency={setCurrency}
              onLogout={() => supabase.auth.signOut()}
              freedomGoal={freedomGoal} setFreedomGoal={(v) => { setFreedomGoal(v); localStorage.setItem('zen_freedom_goal', v.toString()); }}
            />
          )}
        </div>
      </main>

      <AddAssetModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onAdd={async (a) => {
        const dbData = { ...mapAssetToDb(a), user_id: session.user.id };
        const { error } = await supabase.from('assets').insert([dbData]);
        if (error) {
          showToast(`Erreur Supabase: ${error.message}`, 'error');
        } else {
          showToast("Actif ajouté !", "success"); 
          fetchAssets(); 
        }
      }} onUpdate={async (a) => {
        const dbData = mapAssetToDb(a);
        const { error } = await supabase.from('assets').update(dbData).eq('id', a.id);
        if (error) {
          showToast(`Erreur Supabase: ${error.message}`, 'error');
        } else {
          showToast("Actif mis à jour !", "success"); 
          fetchAssets(); 
        }
      }} assets={assets} initialAsset={editingAsset} />
    </div>
  );
};

export default App;
