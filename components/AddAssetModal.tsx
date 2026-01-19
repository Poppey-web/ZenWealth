
import React, { useState, useEffect } from 'react';
import { Asset, AssetCategory } from '../types.ts';

interface AddAssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (asset: Omit<Asset, 'id'>) => Promise<void>;
  onUpdate: (asset: Asset) => Promise<void>;
  assets: Asset[];
  initialAsset?: Asset | null;
}

const AddAssetModal: React.FC<AddAssetModalProps> = ({ isOpen, onClose, onAdd, onUpdate, assets, initialAsset }) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<AssetCategory>(AssetCategory.STOCKS);
  const [quantity, setQuantity] = useState('1');
  const [unitPrice, setUnitPrice] = useState('');
  const [yieldAPY, setYieldAPY] = useState('');
  const [feePercentage, setFeePercentage] = useState('0');
  const [tags, setTags] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'info' | 'advanced'>('info');

  useEffect(() => {
    if (initialAsset) {
      setName(initialAsset.name || '');
      setCategory(initialAsset.category || AssetCategory.STOCKS);
      setQuantity(initialAsset.quantity?.toString() || '1');
      setUnitPrice(initialAsset.unitPrice?.toString() || '');
      setYieldAPY(initialAsset.yieldAPY?.toString() || '');
      setFeePercentage(initialAsset.feePercentage?.toString() || '0');
      setTags(initialAsset.tags?.join(', ') || '');
    } else {
      setName('');
      setCategory(AssetCategory.STOCKS);
      setQuantity('1');
      setUnitPrice('');
      setYieldAPY('');
      setFeePercentage('0');
      setTags('');
    }
  }, [isOpen, initialAsset]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !quantity || !unitPrice || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const q = parseFloat(quantity);
      const up = parseFloat(unitPrice);
      
      const commonData = {
        name: name.trim(),
        category,
        quantity: q,
        unitPrice: up,
        value: q * up,
        yieldAPY: yieldAPY ? parseFloat(yieldAPY) : 0,
        feePercentage: feePercentage ? parseFloat(feePercentage) : 0,
        tags: tags.split(',').map(t => t.trim()).filter(t => t !== ''),
      };

      if (initialAsset) {
        await onUpdate({ ...initialAsset, ...commonData });
      } else {
        await onAdd({ ...commonData, change24h: 0 });
      }
      onClose();
    } catch (err) {
      console.error("Submission error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800" onClick={(e) => e.stopPropagation()}>
        <div className="p-8 pb-4 border-b border-slate-50 dark:border-slate-800 flex justify-between items-center">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">
            {initialAsset ? 'Modifier l\'Actif' : 'Nouvel Actif'}
          </h2>
          <button onClick={onClose} className="p-3 rounded-2xl text-slate-400 hover:bg-slate-100 transition-all">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl">
            <button type="button" onClick={() => setActiveTab('info')} className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === 'info' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-400'}`}>Essentiel</button>
            <button type="button" onClick={() => setActiveTab('advanced')} className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === 'advanced' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-400'}`}>Avancé</button>
          </div>

          {activeTab === 'info' ? (
            <div className="space-y-5">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Nom de l'actif</label>
                <input required type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: ETF World, Bitcoin..." className="w-full px-5 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500 outline-none font-bold text-slate-900 dark:text-white" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Quantité</label>
                  <input required type="number" step="any" value={quantity} onChange={(e) => setQuantity(e.target.value)} className="w-full px-5 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 outline-none font-black text-slate-900 dark:text-white" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Prix Unitaire (€)</label>
                  <input required type="number" step="any" value={unitPrice} onChange={(e) => setUnitPrice(e.target.value)} className="w-full px-5 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 outline-none font-black text-slate-900 dark:text-white" />
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Catégorie</label>
                <select value={category} onChange={e => setCategory(e.target.value as AssetCategory)} className="w-full px-5 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 font-bold outline-none text-slate-900 dark:text-white">
                  {Object.values(AssetCategory).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Rendement Annuel %</label>
                  <input type="number" step="0.1" value={yieldAPY} onChange={(e) => setYieldAPY(e.target.value)} className="w-full px-5 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 font-bold text-slate-900 dark:text-white" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Frais Annuels (TER) %</label>
                  <input type="number" step="0.01" value={feePercentage} onChange={(e) => setFeePercentage(e.target.value)} className="w-full px-5 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 font-bold text-slate-900 dark:text-white" />
                </div>
              </div>
            </div>
          )}

          <button type="submit" disabled={isSubmitting} className="w-full px-4 py-5 rounded-2xl bg-indigo-600 text-white font-black hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-50">
            {isSubmitting ? 'Enregistrement...' : initialAsset ? 'Enregistrer' : 'Ajouter'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddAssetModal;
