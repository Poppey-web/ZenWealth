
import React, { useState, useEffect } from 'react';
import { Asset } from '../types.ts';
import { getPortfolioInsights, getAssetHealthScores, HealthScoreResult } from '../services/geminiService.ts';

interface AIAdvisorProps {
  assets: Asset[];
  onScoresUpdate?: (scores: Record<string, HealthScoreResult>) => void;
}

const AIAdvisor: React.FC<AIAdvisorProps> = ({ assets, onScoresUpdate }) => {
  const [insights, setInsights] = useState<string | null>(null);

  const updateStrategy = async () => {
    if (assets.length === 0) return;
    const [textResult, scoreResult] = await Promise.all([
      getPortfolioInsights(assets),
      getAssetHealthScores(assets)
    ]);

    setInsights(textResult);
    if (scoreResult && onScoresUpdate) {
      const scoresMap: Record<string, HealthScoreResult> = {};
      scoreResult.forEach(item => { scoresMap[item.id] = item; });
      onScoresUpdate(scoresMap);
    }
  };

  useEffect(() => {
    updateStrategy();
  }, [assets]);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-sm p-5 border border-slate-100 dark:border-slate-800 transition-all h-fit">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-9 h-9 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-md">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        </div>
        <div>
          <h3 className="text-base font-black text-slate-900 dark:text-white tracking-tight">ZenStrategy</h3>
          <p className="text-[8px] font-black text-indigo-500 uppercase tracking-widest opacity-70">Analyse Algorithmique</p>
        </div>
      </div>
      
      <div className="space-y-2.5">
        {insights?.split('\n').filter(l => l.trim() !== '').map((line, i) => (
          <div key={i} className="flex gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-transparent hover:border-slate-100 dark:hover:border-slate-700 transition-all group">
            <span className="text-sm shrink-0">🎯</span>
            <p className="text-slate-600 dark:text-slate-300 leading-tight font-bold text-[11px]">
              {line}
            </p>
          </div>
        ))}
        {(!insights || assets.length === 0) && (
          <div className="py-4 text-center">
            <p className="text-slate-400 text-[10px] font-bold italic">Ajoutez des actifs pour générer votre stratégie.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIAdvisor;
