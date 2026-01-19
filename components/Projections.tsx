
import React, { useState, useMemo } from 'react';
import { Asset, AssetCategory } from '../types.ts';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface ProjectionsProps {
  assets: Asset[];
}

const Projections: React.FC<ProjectionsProps> = ({ assets }) => {
  const [monthlySavings, setMonthlySavings] = useState(500);
  const [targetApy, setTargetApy] = useState(7);
  const currentWorth = assets.reduce((sum, a) => sum + a.value, 0);

  const projectionData = useMemo(() => {
    const data = [];
    let wealth = currentWorth;
    const monthlyRate = targetApy / 100 / 12;

    for (let year = 0; year <= 30; year++) {
      data.push({
        year: `An ${year}`,
        wealth: Math.round(wealth),
      });

      // Calcul pour l'année suivante (12 mois)
      for (let month = 0; month < 12; month++) {
        wealth = (wealth + monthlySavings) * (1 + monthlyRate);
      }
    }
    return data;
  }, [currentWorth, monthlySavings, targetApy]);

  // Analyse des frais ETF
  const etfAssets = assets.filter(a => a.feePercentage && a.feePercentage > 0);
  const etfWorth = etfAssets.reduce((sum, a) => sum + a.value, 0);
  const avgFee = etfAssets.length > 0 
    ? etfAssets.reduce((sum, a) => sum + (a.feePercentage || 0) * (a.value / etfWorth), 0)
    : 0.2;

  const feeData = useMemo(() => {
    const data = [];
    let capitalNoFee = etfWorth || 10000; // Fallback à 10k si pas d'ETF
    let capitalWithFee = capitalNoFee;
    
    const rate = 0.07; // Hypothèse 7%
    const fee = avgFee / 100;

    for (let year = 0; year <= 30; year++) {
      data.push({
        year: `An ${year}`,
        sansFrais: Math.round(capitalNoFee),
        avecFrais: Math.round(capitalWithFee),
        perte: Math.round(capitalNoFee - capitalWithFee)
      });
      capitalNoFee *= (1 + rate);
      capitalWithFee *= (1 + rate - fee);
    }
    return data;
  }, [etfWorth, avgFee]);

  const totalLoss = feeData[30].sansFrais - feeData[30].avecFrais;

  return (
    <div className="space-y-12 pb-20 animate-in fade-in duration-700">
      {/* Simulation Patrimoine */}
      <section className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-10">
          <div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white">Cap vers le Futur</h3>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Projection de patrimoine sur 30 ans</p>
          </div>
          <div className="flex flex-wrap gap-4">
            <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700">
              <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Apport mensuel</label>
              <div className="flex items-center gap-2">
                <input type="number" value={monthlySavings} onChange={e => setMonthlySavings(Number(e.target.value))} className="bg-transparent font-black text-slate-900 dark:text-white outline-none w-20" />
                <span className="text-slate-400 font-bold">€</span>
              </div>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700">
              <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Rendement visé</label>
              <div className="flex items-center gap-2">
                <input type="number" step="0.5" value={targetApy} onChange={e => setTargetApy(Number(e.target.value))} className="bg-transparent font-black text-slate-900 dark:text-white outline-none w-14" />
                <span className="text-slate-400 font-bold">%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={projectionData}>
              <defs>
                <linearGradient id="colorWealth" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} tickFormatter={v => `${(v/1000000).toFixed(1)}M€`} />
              <Tooltip contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)'}} />
              <Area type="monotone" dataKey="wealth" name="Patrimoine" stroke="#4f46e5" strokeWidth={4} fillOpacity={1} fill="url(#colorWealth)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-indigo-50 dark:bg-indigo-950/20 rounded-[2rem] border border-indigo-100 dark:border-indigo-800">
            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Dans 10 ans</p>
            <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400">{Math.round(projectionData[10].wealth).toLocaleString()} €</p>
          </div>
          <div className="p-6 bg-indigo-50 dark:bg-indigo-950/20 rounded-[2rem] border border-indigo-100 dark:border-indigo-800">
            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Dans 20 ans</p>
            <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400">{Math.round(projectionData[20].wealth).toLocaleString()} €</p>
          </div>
          <div className="p-6 bg-indigo-600 rounded-[2rem] shadow-xl shadow-indigo-200 dark:shadow-none">
            <p className="text-[10px] font-black text-indigo-100 uppercase tracking-widest mb-1">Dans 30 ans 🚀</p>
            <p className="text-2xl font-black text-white">{Math.round(projectionData[30].wealth).toLocaleString()} €</p>
          </div>
        </div>
      </section>

      {/* Impact des Frais */}
      <section className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm">
        <div className="mb-10">
          <h3 className="text-2xl font-black text-slate-900 dark:text-white">L'Impact Silencieux des Frais</h3>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Projection basée sur vos {etfAssets.length} ETF (Moyenne TER: {avgFee.toFixed(2)}%)</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={feeData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
                <Tooltip />
                <Area type="monotone" dataKey="sansFrais" name="Sans frais" stroke="#10b981" fill="#10b981" fillOpacity={0.1} />
                <Area type="monotone" dataKey="avecFrais" name="Avec vos frais" stroke="#f43f5e" fill="#f43f5e" fillOpacity={0.1} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-col justify-center space-y-8">
            <div className="text-center p-8 bg-rose-50 dark:bg-rose-950/20 rounded-[2.5rem] border border-rose-100 dark:border-rose-900">
              <div className="text-4xl mb-4">💸</div>
              <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-2">Manque à gagner (30 ans)</p>
              <p className="text-4xl font-black text-rose-600">{totalLoss.toLocaleString()} €</p>
              <p className="text-xs text-slate-400 font-bold mt-4 leading-relaxed">Ces frais grignotent vos intérêts composés. Chaque 0.1% compte.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Projections;
