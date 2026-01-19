
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
    <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-[2.5rem] shadow-lg p-8 text-white mb-8 border border-white/10 relative overflow-hidden group">
      <div className="absolute -right-10 -bottom-10 text-[10rem] opacity-5 rotate-12 group-hover:rotate-45 transition-transform duration-1000">📊</div>
      
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-xl">
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        </div>
        <div>
          <h3 className="text-xl font-black">ZenStrategy</h3>
          <p className="text-indigo-100 text-[10px] font-black uppercase tracking-widest opacity-70">Analyse Algorithmique en Temps Réel</p>
        </div>
      </div>
      
      <div className="space-y-4 relative z-10">
        {insights?.split('\n').filter(l => l.trim() !== '').map((line, i) => (
          <div key={i} className="flex gap-4 p-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-all">
            <span className="text-lg">🎯</span>
            <p className="text-indigo-50 leading-relaxed font-bold text-sm">
              {line}
            </p>
          </div>
        ))}
        {(!insights || assets.length === 0) && (
          <p className="text-indigo-200 text-sm italic p-4">Ajoutez des actifs pour générer votre stratégie personnalisée.</p>
        )}
      </div>
    </div>
  );
};

export default AIAdvisor;
