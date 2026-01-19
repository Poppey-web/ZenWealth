
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
  const [selectedCategory, setSelectedCategory] = useState<AssetCategory | null>(null);
  const [assetToDelete, setAssetToDelete] = useState<Asset | null>(null);

  const formatCurrency = (val: number) => {
    if (isPrivate) return '•••• €';
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(val);
  };

  const groupedAssets = useMemo(() => {
    let filtered = assets;
    if (selectedTag) filtered = filtered.filter(a => a.tags?.includes(selectedTag));
    if (selectedCategory) filtered = filtered.filter(a => a.category === selectedCategory);
    
    const groups: Record<string, Asset[]> = {};
    Object.values(AssetCategory).forEach(category => {
      const catAssets = filtered.filter(a => a.category === category);
      if (catAssets.length > 0) groups[category] = catAssets;
    });
    return groups;
  }, [assets, selectedTag, selectedCategory]);

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

      <div className="p-8 md:p-10 border-b border-slate-50 dark:border-slate-800 space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">Positions</h3>
          <div className="flex gap-2">
            <button onClick={() => { setSelectedTag(null); setSelectedCategory(null); }} className="text-[10px] font-black uppercase text-slate-400 hover:text-indigo-600 transition-colors">Réinitialiser</button>
          </div>
        </div>
        
        {/* Catégories */}
        <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-hide">
          <button 
            onClick={() => setSelectedCategory(null)}
            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${!selectedCategory ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-50 dark:bg-slate-800 text-slate-400'}`}
          >Tout</button>
          {Object.values(AssetCategory).map(cat => (
            <button 
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${selectedCategory === cat ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-50 dark:bg-slate-800 text-slate-400'}`}
            >{cat}</button>
          ))}
        </div>

        {/* Tags */}
        <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-hide border-t border-slate-50 dark:border-slate-800 pt-4">
          {availableTags.map(tag => (
            <button key={tag} onClick={() => setSelectedTag(tag === selectedTag ? null : tag)} className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest whitespace-nowrap transition-all border ${selectedTag === tag ? 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-200 text-indigo-600' : 'bg-transparent border-slate-100 dark:border-slate-800 text-slate-400'}`}>#{tag}</button>
          ))}
        </div>
      </div>

      <div className="divide-y divide-slate-50 dark:divide-slate-800/50">
        {(Object.entries(groupedAssets) as [string, Asset[]][]).map(([category, items]) => (
          <div key={category} className="p-6 md:p-8">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-6 flex items-center gap-4">
               {category}
               <div className="flex-1 h-px bg-slate-50 dark:bg-slate-800" />
            </h4>
            <div className="space-y-4">
              {items.map((asset) => (
                <div key={asset.id} className="flex items-center justify-between group p-4 rounded-[2rem] hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all cursor-pointer border border-transparent hover:border-slate-100 dark:hover:border-slate-800" onClick={() => onEditAsset?.(asset)}>
                  <div className="flex items-center gap-5">
                    <div className={`w-12 h-12 rounded-xl border flex items-center justify-center text-xl transition-transform group-hover:scale-110 ${getCategoryColor(asset.category as AssetCategory)}`}>
                      {getCategoryIcon(asset.category as AssetCategory)}
                    </div>
                    <div>
                      <p className="font-black text-slate-900 dark:text-white text-base">{asset.name}</p>
                      <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mt-0.5">{asset.quantity} Unités</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="font-black text-slate-900 dark:text-white text-lg leading-none mb-1.5">{formatCurrency(asset.value)}</p>
                      <div className={`text-[10px] font-black ${ (asset.change24h || 0) >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {(asset.change24h || 0) >= 0 ? '▲' : '▼'} {Math.abs(asset.change24h || 0).toFixed(2)}%
                      </div>
                    </div>
                    <button 
                      onClick={(e) => { e.stopPropagation(); setAssetToDelete(asset); }}
                      className="opacity-0 group-hover:opacity-100 p-2 text-slate-300 hover:text-rose-500 transition-all"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
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
