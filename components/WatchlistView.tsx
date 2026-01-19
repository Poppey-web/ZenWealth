
import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient.ts';

interface WatchlistItem {
  id: string;
  name: string;
  symbol: string;
  price: number;
  change24h: number;
}

const WatchlistView: React.FC<{ userId: string }> = ({ userId }) => {
  const [items, setItems] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    fetchWatchlist();
  }, []);

  const fetchWatchlist = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('watchlist').select('*').eq('user_id', userId);
    if (!error) setItems(data || []);
    setLoading(false);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName) return;
    setIsAdding(true);
    
    try {
      // Simulation locale pour remplacer Gemini (API Public optionnelle ou Mock)
      const data = {
        symbol: newName.substring(0, 4).toUpperCase(),
        price: 100 + Math.random() * 500,
        change: (Math.random() * 4) - 2
      };

      const { data: inserted, error } = await supabase.from('watchlist').insert([{
        name: newName,
        symbol: data.symbol,
        price: data.price,
        change24h: Number(data.change.toFixed(2)),
        user_id: userId
      }]).select();

      if (inserted) setItems([...items, inserted[0]]);
      setNewName('');
    } catch (e) {
      console.error(e);
    } finally {
      setIsAdding(false);
    }
  };

  const removeItem = async (id: string) => {
    await supabase.from('watchlist').delete().eq('id', id);
    setItems(items.filter(i => i.id !== id));
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="bg-white dark:bg-slate-900 p-10 rounded-[3.5rem] border border-slate-100 dark:border-slate-800 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-12">
          <div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">Liste de Suivi</h3>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Observez le marché sans risque</p>
          </div>
          <form onSubmit={handleAdd} className="flex gap-4 w-full md:w-auto">
            <input 
              value={newName} 
              onChange={e => setNewName(e.target.value)}
              placeholder="Ex: Tesla, Solana..." 
              className="flex-1 md:w-64 px-6 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500 outline-none font-bold text-sm text-slate-900 dark:text-white"
            />
            <button disabled={isAdding} className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase shadow-xl hover:bg-indigo-700 transition-all">
              {isAdding ? '...' : '+ Suivre'}
            </button>
          </form>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map(item => (
            <div key={item.id} className="p-8 bg-slate-50 dark:bg-slate-800/50 rounded-[2.5rem] border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all group relative">
              <button onClick={() => removeItem(item.id)} className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-500 transition-all">✕</button>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-white dark:bg-slate-900 rounded-2xl flex items-center justify-center text-xl shadow-sm border border-slate-100 dark:border-slate-800">👁️</div>
                <div>
                  <h4 className="font-black text-slate-900 dark:text-white">{item.name}</h4>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.symbol}</p>
                </div>
              </div>
              <div className="flex justify-between items-end">
                <p className="text-2xl font-black text-slate-900 dark:text-white">{item.price.toLocaleString()} €</p>
                <span className={`text-xs font-black px-3 py-1 rounded-xl ${item.change24h >= 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                  {item.change24h >= 0 ? '+' : ''}{item.change24h}%
                </span>
              </div>
            </div>
          ))}
          {items.length === 0 && !loading && (
            <div className="col-span-full py-20 text-center opacity-30 font-black uppercase text-xs tracking-[0.3em] dark:text-white">Votre liste est vide</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WatchlistView;
