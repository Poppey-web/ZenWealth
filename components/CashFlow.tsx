
import React, { useState, useEffect } from 'react';
import { Transaction, TransactionType } from '../types.ts';
import { supabase } from '../services/supabaseClient.ts';

interface CashFlowProps {
  userId: string;
  onToast?: (message: any, type: 'success' | 'error' | 'info') => void;
}

const CashFlow: React.FC<CashFlowProps> = ({ userId, onToast }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [newType, setNewType] = useState<TransactionType>(TransactionType.EXPENSE);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (userId) fetchTransactions();
  }, [userId]);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });
      
      if (error) {
        if (error.code === 'PGRST103' || error.message.includes('schema cache')) {
          throw new Error("La table 'transactions' n'existe pas. Veuillez l'ajouter dans l'éditeur SQL de Supabase.");
        }
        throw error;
      }
      setTransactions(data || []);
    } catch (err: any) {
      if (onToast) onToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountVal = parseFloat(newAmount);
    if (!newLabel || isNaN(amountVal) || isSaving) return;

    setIsSaving(true);
    try {
      const { data, error } = await supabase.from('transactions').insert([{
        label: newLabel.trim(),
        amount: amountVal,
        type: newType,
        user_id: userId
      }]).select();

      if (error) throw error;
      if (data) {
        setTransactions([data[0], ...transactions]);
        setNewLabel('');
        setNewAmount('');
        setShowAddForm(false);
        if (onToast) onToast("Flux enregistré !", "success");
      }
    } catch (err: any) {
      if (onToast) onToast(err.message, "error");
    } finally {
      setIsSaving(false);
    }
  };

  const deleteTransaction = async (id: string) => {
    try {
      const { error } = await supabase.from('transactions').delete().eq('id', id);
      if (error) throw error;
      setTransactions(transactions.filter(t => t.id !== id));
      if (onToast) onToast("Flux supprimé", "info");
    } catch (err: any) {
      if (onToast) onToast(err.message, 'error');
    }
  };

  const totalIncome = transactions.filter(t => t.type === TransactionType.INCOME).reduce((s, t) => s + t.amount, 0);
  const totalExpenses = transactions.filter(t => t.type === TransactionType.EXPENSE).reduce((s, t) => s + t.amount, 0);

  return (
    <div className="space-y-6 md:space-y-10 animate-in fade-in duration-700">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 md:p-10 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Revenus</p>
          <p className="text-2xl md:text-3xl font-black text-emerald-500">+{totalIncome.toLocaleString()} €</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 md:p-10 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Dépenses</p>
          <p className="text-2xl md:text-3xl font-black text-rose-500">-{totalExpenses.toLocaleString()} €</p>
        </div>
        <div className={`p-6 md:p-10 rounded-[2.5rem] border shadow-2xl transition-all ${totalIncome - totalExpenses >= 0 ? 'bg-indigo-600 text-white' : 'bg-rose-600 text-white'}`}>
          <p className="text-[10px] font-black uppercase tracking-widest mb-2 opacity-80">Net Mensuel</p>
          <p className="text-2xl md:text-3xl font-black">{(totalIncome - totalExpenses).toLocaleString()} €</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="p-6 md:p-10 border-b border-slate-50 dark:border-slate-800 flex justify-between items-center bg-slate-50/30 dark:bg-slate-800/20">
          <h3 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight">Activités</h3>
          <button onClick={() => setShowAddForm(!showAddForm)} className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase shadow-xl hover:bg-indigo-700 transition-all">
             {showAddForm ? 'Fermer' : '+ Flux'}
          </button>
        </div>

        {showAddForm && (
          <form onSubmit={handleAddTransaction} className="p-6 md:p-10 bg-slate-50 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800 animate-in slide-in-from-top-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6">
              <input required type="text" placeholder="Description" value={newLabel} onChange={e => setNewLabel(e.target.value)} className="w-full px-5 py-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 outline-none focus:border-indigo-500" />
              <input required type="number" step="0.01" placeholder="Montant" value={newAmount} onChange={e => setNewAmount(e.target.value)} className="w-full px-5 py-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 outline-none focus:border-indigo-500" />
              <select value={newType} onChange={e => setNewType(e.target.value as TransactionType)} className="w-full px-5 py-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 outline-none font-bold">
                <option value={TransactionType.EXPENSE}>📉 Dépense</option>
                <option value={TransactionType.INCOME}>📈 Revenu</option>
              </select>
              <button type="submit" disabled={isSaving} className="w-full bg-indigo-600 text-white rounded-2xl font-black shadow-lg">
                {isSaving ? '...' : 'Valider'}
              </button>
            </div>
          </form>
        )}

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {transactions.map((tx) => (
            <div key={tx.id} className="p-6 md:p-8 flex items-center justify-between group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all">
              <div className="flex items-center gap-4 md:gap-6">
                <div className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center text-xl border ${tx.type === TransactionType.INCOME ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-400'}`}>
                  {tx.type === TransactionType.INCOME ? '💸' : '🛒'}
                </div>
                <div>
                  <p className="font-black text-slate-900 dark:text-white text-base md:text-lg">{tx.label}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{new Date(tx.date).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 md:gap-8 text-right">
                <p className={`font-black text-xl md:text-2xl ${tx.type === TransactionType.INCOME ? 'text-emerald-500' : 'text-slate-900 dark:text-white'}`}>
                  {tx.type === TransactionType.INCOME ? '+' : '-'} {tx.amount.toLocaleString()} €
                </p>
                <button onClick={() => deleteTransaction(tx.id)} className="opacity-0 group-hover:opacity-100 p-2 text-rose-500 hover:scale-110 transition-all">✕</button>
              </div>
            </div>
          ))}
          {transactions.length === 0 && !loading && (
             <div className="p-20 text-center text-slate-400 font-black uppercase tracking-widest text-xs">Aucun flux enregistré</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CashFlow;
