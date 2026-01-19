
import React, { useState, useEffect } from 'react';
import { Asset } from '../types.ts';
import { getPortfolioInsights, getAssetHealthScores, HealthScoreResult } from '../services/geminiService.ts';

interface AIAdvisorProps {
  assets: Asset[];
  onScoresUpdate?: (scores: Record<string, HealthScoreResult>) => void;
}

const AIAdvisor: React.FC<AIAdvisorProps> = ({ assets, onScoresUpdate }) => {
  const [insights, setInsights] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchInsightsAndScores = async () => {
    if (assets.length === 0) return;
    setLoading(true);
    try {
      // Fetch textual insights and numerical health scores in parallel
      const [textResult, scoreResult] = await Promise.all([
        getPortfolioInsights(assets),
        getAssetHealthScores(assets)
      ]);

      setInsights(textResult || "Impossible de générer des analyses pour le moment.");
      
      if (scoreResult && onScoresUpdate) {
        const scoresMap: Record<string, HealthScoreResult> = {};
        scoreResult.forEach(item => {
          scoresMap[item.id] = item;
        });
        onScoresUpdate(scoresMap);
      }
    } catch (error) {
      console.error("AI Advisor Fetch Error:", error);
      setInsights("Une erreur est survenue lors de l'analyse IA.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsightsAndScores();
  }, [assets]);

  return (
    <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-[2.5rem] shadow-lg p-8 text-white mb-8 border border-white/10">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-xl">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <div>
            <h3 className="text-xl font-black">Conseiller ZenIA</h3>
            <p className="text-indigo-100 text-[10px] font-black uppercase tracking-widest opacity-70">Analyse de Portefeuille en Temps Réel</p>
          </div>
        </div>
        <button 
          onClick={fetchInsightsAndScores}
          disabled={loading}
          className="text-[10px] font-black uppercase tracking-widest bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl transition-all border border-white/5 active:scale-95 disabled:opacity-50"
        >
          {loading ? 'Analyse...' : 'Actualiser'}
        </button>
      </div>
      
      {loading ? (
        <div className="space-y-3 py-4">
          <div className="h-3 bg-white/20 rounded-full w-full animate-pulse"></div>
          <div className="h-3 bg-white/20 rounded-full w-[90%] animate-pulse"></div>
          <div className="h-3 bg-white/20 rounded-full w-[70%] animate-pulse"></div>
        </div>
      ) : (
        <div className="space-y-4">
          {insights?.split('\n').filter(l => l.trim() !== '').map((line, i) => (
            <div key={i} className="flex gap-3 group">
              <div className="w-1 h-auto bg-indigo-300/30 rounded-full group-hover:bg-indigo-300 transition-colors" />
              <p className="text-indigo-50 leading-relaxed font-medium text-sm">
                {line.replace(/^\s*[-*•]\s*/, '')}
              </p>
            </div>
          ))}
          {!insights && !loading && (
            <p className="text-indigo-200 text-sm italic">Ajoutez des actifs pour recevoir des conseils personnalisés.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default AIAdvisor;
