
import React, { useState, useMemo } from 'react';
import { Asset, AssetCategory, HealthWeights } from '../types.ts';
import { HealthScoreResult } from '../services/geminiService.ts';

interface AssetListProps {
  assets: Asset[];
  onDeleteAsset?: (id: string) => void;
  onEditAsset?: (asset: Asset) => void;
  isPrivate?: boolean;
  healthScores?: Record<string, HealthScoreResult>;
  weights?: HealthWeights;
}

const getCategoryIcon = (category: AssetCategory) => {
  switch (category) {
    case AssetCategory.CRYPTO: return '⌇';
    case AssetCategory.STOCKS: return '◈';
    case AssetCategory.REAL_ESTATE: return '▣';
    case AssetCategory.CASH: return '◎';
    default: return '✦';
  }
};

const HealthIndicator = ({ result, weights }: { result: HealthScoreResult, weights: HealthWeights }) => {
  const score = result.score;
  const colorClass = score > 80 ? 'text-emerald-500' : score > 50 ? 'text-amber-500' : 'text-rose-500';
  
  return (
    <div className="relative group/health">
      <div className={`w-10 h-10 rounded-xl flex flex-col items-center justify-center bg-slate-50 dark:bg-white/5 border border-white/10 transition-all hover:scale-110 cursor-help`}>
        <span className={`text-[10px] font-black ${colorClass}`}>{score}</span>
        <span className="text-[6px] font-black text-slate-400 uppercase tracking-tighter">Health</span>
      </div>
      
      <div className="absolute bottom-full mb-6 left-1/2 -translate-x-1/2 w-64 glass-card p-6 rounded-[2.5rem] opacity-0 group-hover/health:opacity-100 pointer-events-none transition-all duration-500 translate-y-4 group-hover/health:translate-y-0 z-[100] shadow-6xl border border-indigo-500/20">
        <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Risk Breakdown</h5>
        <div className="space-y-4">
          {[
            { label: 'Volatility', val: result.metrics.volatility, w: weights.volatility, color: 'bg-indigo-500' },
            { label: 'Liquidity', val: result.metrics.liquidity, w: weights.liquidity, color: 'bg-emerald-500' },
            { label: 'Resilience', val: result.metrics.resilience, w: weights.resilience, color: 'bg-amber-500' }
          ].map((m, i) => (
            <div key={i} className="flex justify-between items-center">
              <span className="text-[9px] font-black text-slate-500">{m.label}</span>
              <div className="flex gap-2 items-center">
                <div className="w-16 h-1 bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden">
                  <div className={`h-full ${m.color}`} style={{ width: `${m.val}%` }} />
                </div>
                <span className="text-[8px] font-black">x{m.w.toFixed(1)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const AssetList: React.FC<AssetListProps> = ({ assets, onDeleteAsset, onEditAsset, isPrivate, healthScores, weights }) => {
  const [selectedCategory, setSelectedCategory] = useState<AssetCategory | null>(null);

  const filteredAssets = useMemo(() => {
    return selectedCategory ? assets.filter(a => a.category === selectedCategory) : assets;
  }, [assets, selectedCategory]);

  return (
    <section className="animate-in fade-in duration-1000">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8 px-2">
        <div>
          <h3 className="text-3xl font-black text-slate-950 dark:text-white tracking-tighter leading-none mb-3">Portfolio Assets</h3>
          <p className="text-slate-400 dark:text-slate-500 font-black uppercase tracking-[0.4em] text-[10px]">Active Inventory Management</p>
        </div>
        
        <div className="flex gap-2 p-1 glass-card rounded-[1.5rem] border-white/20">
          {[null, ...Object.values(AssetCategory)].map(cat => (
            <button 
              key={cat || 'all'}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-[1.2rem] text-[9px] font-black uppercase tracking-widest transition-all ${selectedCategory === cat ? 'bg-slate-950 dark:bg-white text-white dark:text-slate-950 shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
            >{cat || 'All'}</button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {filteredAssets.map((asset) => (
          <div 
            key={asset.id} 
            onClick={() => onEditAsset?.(asset)}
            className="group relative glass-card rounded-[2rem] p-5 md:px-8 flex items-center justify-between transition-all duration-500 hover:bg-white/95 dark:hover:bg-white/[0.05] hover:shadow-2xl border-2 border-transparent hover:border-indigo-600/10 cursor-pointer"
          >
            <div className="flex items-center gap-5 md:gap-8 relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-slate-950 dark:bg-white flex items-center justify-center text-2xl text-white dark:text-slate-950 shadow-xl group-hover:rotate-6 transition-transform">
                {getCategoryIcon(asset.category)}
              </div>
              <div>
                <h4 className="text-xl font-black text-slate-950 dark:text-white tracking-tight leading-none mb-1.5">{asset.name}</h4>
                <div className="flex items-center gap-2">
                  <span className="text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border border-slate-200 dark:border-white/10 text-slate-400">
                    {asset.category}
                  </span>
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{asset.quantity} Qty</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-8 relative z-10">
              {healthScores?.[asset.id] && weights && <HealthIndicator result={healthScores[asset.id]} weights={weights} />}
              <div className="text-right">
                <p className="text-2xl font-black text-slate-950 dark:text-white text-display leading-none mb-1 tracking-tighter">
                  {isPrivate ? '••••' : new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(asset.value)}
                </p>
                <div className={`text-[9px] font-black ${ (asset.change24h || 0) >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                   {(asset.change24h || 0) >= 0 ? '▲' : '▼'} {Math.abs(asset.change24h || 0).toFixed(2)}%
                </div>
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); onDeleteAsset?.(asset.id); }}
                className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400 hover:bg-rose-500 hover:text-white transition-all"
              >✕</button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default AssetList;
