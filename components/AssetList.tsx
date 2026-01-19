
import React, { useState, useMemo } from 'react';
import { Asset, AssetCategory } from '../types.ts';
import { HealthScoreResult } from '../services/geminiService.ts';

interface AssetListProps {
  assets: Asset[];
  onDeleteAsset?: (id: string) => void;
  onEditAsset?: (asset: Asset) => void;
  aiScores?: Record<string, HealthScoreResult>;
  isPrivate?: boolean;
}

const getCategoryIcon = (category: AssetCategory) => {
  switch (category) {
    case AssetCategory.CRYPTO: return '🪙';
    case AssetCategory.STOCKS: return '📊';
    case AssetCategory.REAL_ESTATE: return '🏰';
    case AssetCategory.CASH: return '💰';
    default: return '📁';
  }
};

const getCategoryColor = (category: AssetCategory) => {
  switch (category) {
    case AssetCategory.CRYPTO: return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
    case AssetCategory.STOCKS: return 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20';
    case AssetCategory.REAL_ESTATE: return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
    case AssetCategory.CASH: return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
    default: return 'text-slate-500 bg-slate-500/10 border-slate-500/20';
  }
};

const AssetList: React.FC<AssetListProps> = ({ assets, onDeleteAsset, onEditAsset, aiScores, isPrivate }) => {
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [assetToDelete, setAssetToDelete] = useState<Asset | null>(null);

  const formatCurrency = (val: number) => {
    if (isPrivate) return '•••• €';
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(val);
  };

  const groupedAssets = useMemo(() => {
    const filtered = selectedTag ? assets.filter(a => a.tags?.includes(selectedTag)) : assets;
    const groups: Record<string, Asset[]> = {};
    Object.values(AssetCategory).forEach(category => {
      const catAssets = filtered.filter(a => a.category === category);
      if (catAssets.length > 0) groups[category] = catAssets;
    });
    return groups;
  }, [assets, selectedTag]);

  const availableTags = useMemo<string[]>(() => {
    const tags = assets.flatMap(a => a.tags || []);
    return Array.from(new Set(tags)).sort();
  }, [assets]);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-[3rem] shadow-sm border border-slate-100 dark:border-slate-800 transition-all overflow-hidden">
      {assetToDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-[3rem] shadow-2xl p-10 border border-slate-100 dark:border-slate-800">
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-6 text-center">Supprimer l'actif ?</h3>
            <div className="flex gap-4">
              <button onClick={() => setAssetToDelete(null)} className="flex-1 px-4 py-4 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-500">Annuler</button>
              <button onClick={() => { if (onDeleteAsset) onDeleteAsset(assetToDelete.id); setAssetToDelete(null); }} className="flex-1 px-4 py-4 bg-rose-600 rounded-2xl text-xs font-black uppercase tracking-widest text-white shadow-lg">Confirmer</button>
            </div>
          </div>
        </div>
      )}

      <div className="p-8 md:p-10 border-b border-slate-50 dark:border-slate-800">
        <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter mb-8">Vos Positions</h3>
        <div className="flex overflow-x-auto gap-4 pb-2 scrollbar-hide">
          <button onClick={() => setSelectedTag(null)} className={`px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${!selectedTag ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-50 dark:bg-slate-800 text-slate-400'}`}>Tous</button>
          {availableTags.map(tag => (
            <button key={tag} onClick={() => setSelectedTag(tag)} className={`px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest whitespace-nowrap transition-all ${selectedTag === tag ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-50 dark:bg-slate-800 text-slate-400'}`}>#{tag}</button>
          ))}
        </div>
      </div>

      <div className="divide-y divide-slate-50 dark:divide-slate-800/50">
        {Object.entries(groupedAssets).map(([category, items]) => (
          <div key={category} className="p-8 md:p-10">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-8 flex items-center gap-4">
               {category}
               <div className="flex-1 h-px bg-slate-50 dark:bg-slate-800" />
            </h4>
            <div className="space-y-6">
              {items.map((asset) => (
                <div key={asset.id} className="flex items-center justify-between group p-5 rounded-[2.5rem] hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all cursor-pointer border border-transparent hover:border-slate-100 dark:hover:border-slate-800" onClick={() => onEditAsset?.(asset)}>
                  <div className="flex items-center gap-6">
                    <div className={`w-14 h-14 rounded-2xl border flex items-center justify-center text-2xl transition-transform group-hover:scale-110 ${getCategoryColor(asset.category as AssetCategory)}`}>
                      {getCategoryIcon(asset.category as AssetCategory)}
                    </div>
                    <div>
                      <p className="font-black text-slate-900 dark:text-white text-lg">{asset.name}</p>
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.15em] mt-1">{asset.quantity} Unités</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-10">
                    <div className="text-right">
                      <p className="font-black text-slate-900 dark:text-white text-xl leading-none mb-2">{formatCurrency(asset.value)}</p>
                      <div className={`text-[10px] font-black ${ (asset.change24h || 0) >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {(asset.change24h || 0) >= 0 ? '▲' : '▼'} {Math.abs(asset.change24h || 0).toFixed(2)}%
                      </div>
                    </div>
                    <button 
                      onClick={(e) => { e.stopPropagation(); setAssetToDelete(asset); }}
                      className="opacity-0 group-hover:opacity-100 p-3 text-slate-300 hover:text-rose-500 transition-all hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-xl"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
        {assets.length === 0 && (
          <div className="p-32 text-center text-slate-400 font-black uppercase tracking-widest text-xs">Aucun actif enregistré</div>
        )}
      </div>
    </div>
  );
};

export default AssetList;
