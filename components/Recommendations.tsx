
import React, { useMemo } from 'react';
import { Asset, AssetCategory } from '../types.ts';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, RadarChart, PolarGrid, PolarAngleAxis, Radar } from 'recharts';

interface RecommendationsProps {
  assets: Asset[];
}

const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

const Recommendations: React.FC<RecommendationsProps> = ({ assets }) => {
  const radarData = useMemo(() => {
    const total = assets.reduce((s, a) => s + a.value, 0);
    const categories = Array.from(new Set(assets.map(a => a.category)));
    
    // Scores calculés
    const diversification = Math.min(100, (categories.length / 5) * 100);
    const resilience = Math.min(100, (assets.filter(a => a.category === AssetCategory.CASH || a.category === AssetCategory.REAL_ESTATE).reduce((s, a) => s + a.value, 0) / total) * 100 * 2);
    const performance = Math.min(100, (assets.filter(a => a.category === AssetCategory.CRYPTO || a.category === AssetCategory.STOCKS).reduce((s, a) => s + a.value, 0) / total) * 100);

    return [
      { subject: 'Diversification', A: diversification || 20, full: 100 },
      { subject: 'Performance', A: performance || 50, full: 100 },
      { subject: 'Résilience', A: resilience || 30, full: 100 },
      { subject: 'Liquidité', A: (assets.filter(a => a.category === AssetCategory.CASH).length > 0 ? 80 : 20), full: 100 },
      { subject: 'Stabilité', A: 100 - (performance / 2), full: 100 },
    ];
  }, [assets]);

  const exposureData = useMemo(() => {
    const sectors: Record<string, number> = {};
    assets.forEach(a => { sectors[a.category] = (sectors[a.category] || 0) + a.value; });
    return Object.entries(sectors).map(([name, value]) => ({ name, value }));
  }, [assets]);

  const staticAdvice = useMemo(() => {
    if (assets.length === 0) return ["Ajoutez des actifs pour voir vos conseils."];
    const total = assets.reduce((s, a) => s + a.value, 0);
    const cryptoWeight = (assets.filter(a => a.category === AssetCategory.CRYPTO).reduce((s, a) => s + a.value, 0) / total) * 100;
    
    const advice = [];
    if (cryptoWeight > 25) advice.push("Prenez des bénéfices sur vos cryptos.");
    else advice.push("Allocation crypto saine.");
    
    if (assets.length < 3) advice.push("Augmentez le nombre de vos lignes.");
    else advice.push("Bonne granularité du portefeuille.");
    
    advice.push("Gardez un matelas de sécurité en Cash.");
    return advice;
  }, [assets]);

  return (
    <div className="space-y-12 pb-24 animate-in fade-in duration-700">
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
        <section className="bg-white dark:bg-slate-900 p-10 rounded-[3.5rem] border border-slate-100 dark:border-slate-800 shadow-sm">
          <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-10 tracking-tighter">Profil Stratégique</h3>
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                <PolarGrid stroke="#e2e8f0" strokeDasharray="4 4" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: '900' }} />
                <Radar name="Score" dataKey="A" stroke="#4f46e5" fill="#4f46e5" fillOpacity={0.6} strokeWidth={3} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="xl:col-span-2 space-y-8">
          <div className="bg-indigo-600 p-12 rounded-[3.5rem] text-white shadow-2xl relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-12 text-[15rem] opacity-10 rotate-12 transition-transform group-hover:rotate-45 pointer-events-none">📊</div>
             <div className="relative z-10">
                <h3 className="text-3xl font-black mb-10 tracking-tighter">Objectifs Recommandés</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {staticAdvice.map((text, i) => (
                    <div key={i} className="bg-white/10 backdrop-blur-lg p-6 rounded-[2.5rem] border border-white/10 hover:bg-white/20 transition-all">
                      <div className="text-3xl mb-4">{i === 0 ? '🛡️' : i === 1 ? '💎' : '⚖️'}</div>
                      <p className="text-sm font-black leading-relaxed text-white/90">{text}</p>
                    </div>
                  ))}
                </div>
             </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Recommendations;
