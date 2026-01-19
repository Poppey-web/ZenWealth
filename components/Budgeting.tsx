
import React, { useState, useEffect } from 'react';
import { Budget } from '../types.ts';
import { supabase } from '../services/supabaseClient.ts';

interface BudgetingProps {
  userId: string;
  onToast?: (message: any, type: 'success' | 'error' | 'info') => void;
}

const Budgeting: React.FC<BudgetingProps> = ({ userId, onToast }) => {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [newLimit, setNewLimit] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (userId) fetchBudgets();
  }, [userId]);

  const fetchBudgets = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('budgets').select('*').eq('user_id', userId);
      if (error) {
        if (error.code === 'PGRST103' || error.message.includes('schema cache')) {
           throw new Error("La table 'budgets' n'existe pas. Veuillez l'ajouter dans l'éditeur SQL de Supabase.");
        }
        throw error;
      }
      // Mapper spent et limit_amount si nécessaire
      setBudgets(data?.map(b => ({ ...b, limit: b.limit_amount || b.limit })) || []);
    } catch (err: any) {
      if (onToast) onToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    const limitVal = parseFloat(newLimit);
    if (!newCategory || isNaN(limitVal) || isSaving) return;

    setIsSaving(true);
    try {
      const { data, error } = await supabase.from('budgets').insert([{
        category: newCategory.trim(),
        limit_amount: limitVal,
        user_id: userId
      }]).select();

      if (error) throw error;
      if (data) {
        setBudgets([...budgets, { ...data[0], limit: data[0].limit_amount }]);
        setNewCategory('');
        setNewLimit('');
        setShowAddForm(false);
        if (onToast) onToast("Nouveau budget activé !", "success");
      }
    } catch (err: any) {
      if (onToast) onToast(err.message, "error");
    } finally {
      setIsSaving(false);
    }
  };

  const deleteBudget = async (id: string) => {
    try {
      const { error } = await supabase.from('budgets').delete().eq('id', id);
      if (error) throw error;
      setBudgets(budgets.filter(b => b.id !== id));
      if (onToast) onToast("Budget supprimé", "info");
    } catch (err: any) {
      if (onToast) onToast(err.message, 'error');
    }
  };

  return (
    <div className="space-y-8 md:space-y-10 animate-in fade-in duration-700">
      <div className="bg-indigo-600 p-8 md:p-12 rounded-[3.5rem] text-white flex flex-col md:flex-row justify-between items-center shadow-2xl relative overflow-hidden transition-all">
        <div className="absolute top-0 right-0 p-12 text-[10rem] opacity-10 rotate-12 pointer-events-none">📉</div>
        <div className="relative z-10 text-center md:text-left">
          <h3 className="text-3xl md:text-4xl font-black tracking-tighter">Budget Control</h3>
          <p className="text-indigo-100 font-bold opacity-70 mt-2 uppercase tracking-widest text-xs">Maitrisez votre cash-flow</p>
        </div>
        <button onClick={() => setShowAddForm(!showAddForm)} className="mt-6 md:mt-0 relative z-10 bg-white text-indigo-600 px-8 py-4 rounded-2xl font-black shadow-xl hover:bg-indigo-50 transition-all text-xs uppercase tracking-widest">
           {showAddForm ? 'Fermer' : '+ Créer un Budget'}
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleAddBudget} className="bg-white dark:bg-slate-900 p-8 md:p-10 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-2xl animate-in slide-in-from-top-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            <input required type="text" value={newCategory} onChange={e => setNewCategory(e.target.value)} placeholder="Catégorie (Sorties, Courses...)" className="w-full px-6 py-5 rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:border-indigo-500 border-2 border-transparent font-bold" />
            <input required type="number" value={newLimit} onChange={e => setNewLimit(e.target.value)} placeholder="Plafond mensuel (€)" className="w-full px-6 py-5 rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:border-indigo-500 border-2 border-transparent font-black" />
          </div>
          <button type="submit" disabled={isSaving} className="mt-8 w-full py-6 bg-indigo-600 text-white rounded-2xl font-black hover:bg-indigo-700 transition-all disabled:opacity-50 shadow-xl uppercase tracking-widest text-xs">
            {isSaving ? 'Établissement...' : 'Activer'}
          </button>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {budgets.map((budget) => {
          const ratio = Math.min(100, (budget.spent / budget.limit) * 100);
          return (
            <div key={budget.id} className="bg-white dark:bg-slate-900 p-8 md:p-10 rounded-[3rem] border border-slate-100 dark:border-slate-800 relative group transition-all hover:shadow-2xl">
              <button onClick={() => deleteBudget(budget.id)} className="absolute top-8 right-8 opacity-0 group-hover:opacity-100 p-2 text-rose-500 hover:scale-110 transition-all">✕</button>
              <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-3xl mb-8 border border-slate-100 dark:border-slate-700 transition-transform group-hover:scale-110">🎯</div>
              <h4 className="font-black text-slate-900 dark:text-white text-2xl mb-2">{budget.category}</h4>
              
              <div className="mt-10 flex justify-between items-end mb-4">
                <div>
                  <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mb-1">Dépensé</p>
                  <p className="font-black text-slate-900 dark:text-white text-xl">{budget.spent.toLocaleString()} €</p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mb-1">Plafond</p>
                  <p className="font-black text-slate-400 text-lg">{budget.limit.toLocaleString()} €</p>
                </div>
              </div>

              <div className="w-full bg-slate-100 dark:bg-slate-800 h-4 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-1000 ${ratio > 90 ? 'bg-rose-500' : ratio > 70 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                  style={{ width: `${ratio}%` }}
                />
              </div>
            </div>
          );
        })}
        {budgets.length === 0 && !loading && (
          <div className="col-span-full py-32 text-center text-slate-400 font-black uppercase tracking-[0.3em] text-xs">Aucun budget actif</div>
        )}
      </div>
    </div>
  );
};

export default Budgeting;
