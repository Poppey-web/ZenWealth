
import React, { useMemo, useState, useEffect } from 'react';
import { Asset, AssetCategory } from '../types.ts';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, RadarChart, PolarGrid, PolarAngleAxis, Radar } from 'recharts';
import { GoogleGenAI } from "@google/genai";

interface RecommendationsProps {
  assets: Asset[];
}

const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

const Recommendations: React.FC<RecommendationsProps> = ({ assets }) => {
  const [loading, setLoading] = useState(false);
  const [advice, setAdvice] = useState<string[]>([]);

  const radarData = useMemo(() => [
    { subject: 'Diversification', A: 85, full: 100 },
    { subject: 'Performance', A: 70, full: 100 },
    { subject: 'Résilience', A: 90, full: 100 },
    { subject: 'Liquidité', A: 65, full: 100 },
    { subject: 'Frais TER', A: 80, full: 100 },
  ], []);

  const exposureData = useMemo(() => {
    const sectors: Record<string, number> = {};
    assets.forEach(a => { sectors[a.category] = (sectors[a.category] || 0) + a.value; });
    return Object.entries(sectors).map(([name, value]) => ({ name, value }));
  }, [assets]);

  const fetchAdvice = async () => {
    if (assets.length === 0) return;
    setLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const summary = assets.map(a => `${a.name}: ${a.value}€`).join(", ");
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Expert gestion de fortune. Analyse ce portefeuille: ${summary}. Donne 3 conseils d'arbitrage précis. Réponds uniquement avec 3 phrases courtes séparées par des retours à la ligne.`,
      });
      setAdvice(response.text?.split('\n').filter(l => l.trim().length > 5).slice(0, 3) || []);
    } catch (e) {
      setAdvice(["Diversifiez davantage vers les actifs décorrélés.", "Réduisez l'exposition aux cryptos volatiles.", "Optimisez les frais de gestion de vos ETF."]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAdvice(); }, [assets]);

  return (
    <div className="space-y-12 pb-24 animate-in fade-in duration-700">
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 md:gap-10">
        {/* Radar */}
        <section className="bg-white dark:bg-slate-900 p-6 md:p-10 rounded-[3.5rem] border border-slate-100 dark:border-slate-800 shadow-sm">
          <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-10 tracking-tighter">Profil Santé</h3>
          <div className="h-[280px] md:h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                <PolarGrid stroke="#e2e8f0" strokeDasharray="4 4" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: '900' }} />
                <Radar name="Score" dataKey="A" stroke="#4f46e5" fill="#4f46e5" fillOpacity={0.6} strokeWidth={3} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Action Cards */}
        <section className="xl:col-span-2 space-y-6 md:space-y-8">
          <div className="bg-slate-950 p-8 md:p-12 rounded-[3.5rem] text-white shadow-2xl relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-12 text-[15rem] opacity-5 rotate-12 transition-transform group-hover:rotate-45 pointer-events-none">🧠</div>
             <div className="relative z-10">
                <div className="px-4 py-1 bg-white/10 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-[0.2em] border border-white/10 inline-block mb-8">ZenIntelligence</div>
                <h3 className="text-3xl md:text-4xl font-black mb-10 tracking-tighter">Actions Recommandées</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8">
                  {loading ? [1,2,3].map(i => (
                    <div key={i} className="h-40 bg-white/5 rounded-[2.5rem] animate-pulse"></div>
                  )) : advice.map((text, i) => (
                    <div key={i} className="bg-white/10 backdrop-blur-lg p-6 rounded-[2.5rem] border border-white/10 hover:bg-white/20 transition-all cursor-default group/card">
                      <div className="text-3xl mb-4 transform group-hover/card:scale-125 transition-transform">{i === 0 ? '💎' : i === 1 ? '🛡️' : '⚖️'}</div>
                      <p className="text-sm font-black leading-relaxed tracking-tight text-white/90">{text}</p>
                    </div>
                  ))}
                </div>
             </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
             <div className="bg-white dark:bg-slate-900 p-8 md:p-10 rounded-[3rem] border border-slate-100 dark:border-slate-800 flex items-center justify-between shadow-sm">
                <div>
                   <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Potentiel Yield</p>
                   <p className="text-3xl font-black text-slate-900 dark:text-white">+5.8% / an</p>
                </div>
                <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center text-3xl">📈</div>
             </div>
             <div className="bg-white dark:bg-slate-900 p-8 md:p-10 rounded-[3rem] border border-slate-100 dark:border-slate-800 flex items-center justify-between shadow-sm">
                <div>
                   <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Risque Portefeuille</p>
                   <p className="text-3xl font-black text-slate-900 dark:text-white">Modéré</p>
                </div>
                <div className="w-16 h-16 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center text-3xl">🧘</div>
             </div>
          </div>
        </section>
      </div>

      <section className="bg-white dark:bg-slate-900 p-8 md:p-12 rounded-[4rem] border border-slate-100 dark:border-slate-800 transition-all">
        <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter mb-12">Exposition Sectorielle</h3>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 items-center">
          <div className="lg:col-span-2 h-[350px] md:h-[400px]">
             <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={exposureData} innerRadius={80} outerRadius={120} paddingAngle={10} dataKey="value" stroke="none">
                    {exposureData.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                  <Legend iconType="circle" />
                </PieChart>
             </ResponsiveContainer>
          </div>
          <div className="space-y-4">
            {exposureData.map((d, i) => (
              <div key={i} className="flex items-center justify-between p-5 bg-slate-50 dark:bg-slate-800 rounded-[2rem] border border-transparent transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                  <span className="text-sm font-black text-slate-700 dark:text-slate-300 uppercase tracking-tight">{d.name}</span>
                </div>
                <span className="font-black text-slate-900 dark:text-white text-lg">{((d.value / assets.reduce((s, a) => s + a.value, 0)) * 100).toFixed(1)}%</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Recommendations;
