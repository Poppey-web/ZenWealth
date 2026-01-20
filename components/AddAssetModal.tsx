
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-2xl animate-in fade-in duration-500">
      <div 
        className="relative bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[4rem] shadow-6xl overflow-hidden border border-white/20 animate-in zoom-in-95 duration-500" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute top-0 left-0 w-full h-2 bg-indigo-600" />
        
        <div className="p-12 md:p-16">
          <div className="flex justify-between items-start mb-12">
            <div>
              <h2 className="text-4xl font-black text-slate-950 dark:text-white tracking-tighter text-display">
                {initialAsset ? 'Edit Position' : 'New Position'}
              </h2>
              <p className="text-slate-400 font-black uppercase tracking-[0.4em] text-[10px] mt-4">Inventory Expansion</p>
            </div>
            <button 
              onClick={onClose} 
              className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400 hover:text-rose-500 transition-all duration-500"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-10">
            <div className="flex p-1.5 glass-card rounded-[2rem] border-white/10">
              <button 
                type="button" 
                onClick={() => setActiveTab('info')} 
                className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-[1.5rem] transition-all duration-500 ${activeTab === 'info' ? 'bg-slate-950 dark:bg-white text-white dark:text-slate-900 shadow-xl' : 'text-slate-400'}`}
              >
                Information
              </button>
              <button 
                type="button" 
                onClick={() => setActiveTab('advanced')} 
                className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-[1.5rem] transition-all duration-500 ${activeTab === 'advanced' ? 'bg-slate-950 dark:bg-white text-white dark:text-slate-900 shadow-xl' : 'text-slate-400'}`}
              >
                Strategy
              </button>
            </div>

            <div className="space-y-8 min-h-[300px]">
              {activeTab === 'info' ? (
                <div className="space-y-8 animate-in fade-in duration-500">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Asset Name</label>
                    <input 
                      required type="text" value={name} onChange={(e) => setName(e.target.value)} 
                      placeholder="e.g. BTC, VOO, Realty Paris..." 
                      className="w-full px-8 py-5 rounded-[2.5rem] bg-slate-100 dark:bg-white/5 border-2 border-transparent focus:border-indigo-600 outline-none font-black text-slate-950 dark:text-white" 
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Quantity</label>
                      <input 
                        required type="number" step="any" value={quantity} onChange={(e) => setQuantity(e.target.value)} 
                        className="w-full px-8 py-5 rounded-[2.5rem] bg-slate-100 dark:bg-white/5 font-black text-slate-950 dark:text-white outline-none" 
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Unit Price (€)</label>
                      <input 
                        required type="number" step="any" value={unitPrice} onChange={(e) => setUnitPrice(e.target.value)} 
                        className="w-full px-8 py-5 rounded-[2.5rem] bg-slate-100 dark:bg-white/5 font-black text-slate-950 dark:text-white outline-none" 
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-8 animate-in fade-in duration-500">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Category</label>
                    <select 
                      value={category} onChange={e => setCategory(e.target.value as AssetCategory)} 
                      className="w-full px-8 py-5 rounded-[2.5rem] bg-slate-100 dark:bg-white/5 font-black text-slate-950 dark:text-white outline-none appearance-none cursor-pointer"
                    >
                      {Object.values(AssetCategory).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">APY Yield %</label>
                      <input 
                        type="number" step="0.1" value={yieldAPY} onChange={(e) => setYieldAPY(e.target.value)} 
                        className="w-full px-8 py-5 rounded-[2.5rem] bg-slate-100 dark:bg-white/5 font-black text-slate-950 dark:text-white outline-none" 
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Annual Fees %</label>
                      <input 
                        type="number" step="0.01" value={feePercentage} onChange={(e) => setFeePercentage(e.target.value)} 
                        className="w-full px-8 py-5 rounded-[2.5rem] bg-slate-100 dark:bg-white/5 font-black text-slate-950 dark:text-white outline-none" 
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <button 
              type="submit" 
              disabled={isSubmitting} 
              className="w-full py-7 bg-indigo-600 text-white rounded-[2.5rem] font-black shadow-2xl shadow-indigo-500/30 hover:bg-indigo-700 hover:scale-[1.01] active:scale-[0.98] transition-all disabled:opacity-50 text-xs uppercase tracking-widest"
            >
              {isSubmitting ? 'PROCESSING...' : initialAsset ? 'SAVE CHANGES' : 'DEPLOY POSITION'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddAssetModal;
