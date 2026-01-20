
import React, { useState, useEffect } from 'react';
import { Asset, HealthWeights } from '../types.ts';
import { getPortfolioInsights, getAssetHealthScores, HealthScoreResult } from '../services/geminiService.ts';

interface AIAdvisorProps {
  assets: Asset[];
  onScoresUpdate?: (scores: Record<string, HealthScoreResult>) => void;
  weights: HealthWeights;
  onWeightsChange: (weights: HealthWeights) => void;
}

const AIAdvisor: React.FC<AIAdvisorProps> = ({ assets, onScoresUpdate, weights, onWeightsChange }) => {
  const [insights, setInsights] = useState<string | null>(null);
  const [isTuning, setIsTuning] = useState(false);

  const updateStrategy = async () => {
    if (assets.length === 0) return;
    const [textResult, scoreResult] = await Promise.all([
      getPortfolioInsights(assets),
      getAssetHealthScores(assets, weights)
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
  }, [assets, weights]);

  const handleSliderChange = (metric: keyof HealthWeights, value: string) => {
    onWeightsChange({ ...weights, [metric]: parseFloat(value) });
  };

  return (
    <div className="glass-card rounded-[3rem] p-8 md:p-10 shadow-2xl transition-all h-fit border border-white/10">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-500/20">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-950 dark:text-white tracking-tight">Strategy Tuning</h3>
            <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest opacity-70">Adaptive Engine</p>
          </div>
        </div>
        <button 
          onClick={() => setIsTuning(!isTuning)}
          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${isTuning ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-white/5 text-slate-400'}`}
        >
          {isTuning ? '✓' : '⚙'}
        </button>
      </div>
      
      {isTuning ? (
        <div className="space-y-8 animate-in fade-in slide-in-from-top-4 duration-500 mb-8">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Volatility Sensitivity</label>
              <span className="text-[10px] font-black text-indigo-600">{(weights.volatility * 100).toFixed(0)}%</span>
            </div>
            <input 
              type="range" min="0" max="1" step="0.01" 
              value={weights.volatility} 
              onChange={(e) => handleSliderChange('volatility', e.target.value)}
              className="w-full h-1.5 bg-slate-100 dark:bg-white/10 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Liquidity Priority</label>
              <span className="text-[10px] font-black text-indigo-600">{(weights.liquidity * 100).toFixed(0)}%</span>
            </div>
            <input 
              type="range" min="0" max="1" step="0.01" 
              value={weights.liquidity} 
              onChange={(e) => handleSliderChange('liquidity', e.target.value)}
              className="w-full h-1.5 bg-slate-100 dark:bg-white/10 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Macro Resilience</label>
              <span className="text-[10px] font-black text-indigo-600">{(weights.resilience * 100).toFixed(0)}%</span>
            </div>
            <input 
              type="range" min="0" max="1" step="0.01" 
              value={weights.resilience} 
              onChange={(e) => handleSliderChange('resilience', e.target.value)}
              className="w-full h-1.5 bg-slate-100 dark:bg-white/10 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
          </div>
        </div>
      ) : (
        <div className="space-y-4 mb-8">
          {insights?.split('\n').filter(l => l.trim() !== '').map((line, i) => (
            <div key={i} className="flex gap-4 p-5 glass-card rounded-3xl border border-transparent hover:border-white/20 transition-all group">
              <span className="text-lg shrink-0 group-hover:scale-125 transition-transform duration-500">🎯</span>
              <p className="text-slate-600 dark:text-slate-300 leading-tight font-bold text-xs">
                {line}
              </p>
            </div>
          ))}
          {(!insights || assets.length === 0) && (
            <div className="py-10 text-center">
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] opacity-50">Strategy Offline</p>
            </div>
          )}
        </div>
      )}
      
      <div className="pt-6 border-t border-white/5">
        <div className="flex justify-between items-center px-2">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Weights</p>
          <div className="flex gap-3">
            <div className="w-2 h-2 rounded-full bg-indigo-500" title="Volatility"></div>
            <div className="w-2 h-2 rounded-full bg-emerald-500" title="Liquidity"></div>
            <div className="w-2 h-2 rounded-full bg-amber-500" title="Resilience"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAdvisor;
