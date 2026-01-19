
import React, { useState, useMemo } from 'react';
import { Asset } from '../types.ts';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface ComparisonViewProps {
  assets: Asset[];
}

const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

const ComparisonView: React.FC<ComparisonViewProps> = ({ assets }) => {
  const [selectedIds, setSelectedIds] = useState<string[]>(assets.slice(0, 3).map(a => a.id));

  const chartData = useMemo(() => {
    const data = [];
    const points = 12; 
    
    for (let i = 0; i < points; i++) {
      const point: any = { month: `M${i + 1}` };
      selectedIds.forEach(id => {
        const asset = assets.find(a => a.id === id);
        if (asset) {
          const drift = (asset.change24h || 0) / 5; 
          const volatility = 1.5;
          const prevValue = i === 0 ? 100 : data[i-1][id];
          point[id] = Number((prevValue + (Math.random() - 0.48) * volatility + drift).toFixed(2));
        }
      });
      data.push(point);
    }
    return data;
  }, [assets, selectedIds]);

  const toggleSelection = (id: string) => {
    if (selectedIds.includes(id)) {
      if (selectedIds.length > 1) setSelectedIds(selectedIds.filter(i => i !== id));
    } else if (selectedIds.length < 5) {
      setSelectedIds([...selectedIds, id]);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <div className="bg-white dark:bg-slate-900 p-6 md:p-10 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm transition-all">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">Comparateur de Performance</h3>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1.5 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
              Base 100 : Évolution relative des actifs sélectionnés
            </p>
          </div>
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 dark:bg-slate-800 px-4 py-2 rounded-full">
            {selectedIds.length} / 5 Sélectionnés
          </div>
        </div>

        {/* Sélection des actifs - Nouveau Design Scrollable horizontal si trop de contenu */}
        <div className="flex overflow-x-auto gap-3 pb-6 -mx-2 px-2 scrollbar-hide mb-4">
          {assets.map((asset, i) => (
            <button 
              key={asset.id} 
              onClick={() => toggleSelection(asset.id)}
              className={`p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border-2 flex flex-col items-center justify-center min-w-[120px] h-24 ${selectedIds.includes(asset.id) ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg scale-105' : 'bg-slate-50 dark:bg-slate-800 border-transparent text-slate-400 hover:border-slate-200 dark:hover:border-slate-700'}`}
            >
              <div className="text-lg mb-1">{asset.category === 'Crypto' ? '🪙' : asset.category === 'Stocks' ? '📊' : '💰'}</div>
              <div className="truncate w-full text-center">{asset.name}</div>
            </button>
          ))}
        </div>

        {/* Graphique avec Glassmorphism léger */}
        <div className="h-[420px] w-full bg-slate-50/50 dark:bg-slate-950/40 rounded-[2rem] p-4 md:p-8 border border-slate-50 dark:border-slate-800/50">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 20, right: 20, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#e2e8f0" className="dark:opacity-5" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: '900'}} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} domain={['auto', 'auto']} />
              <Tooltip 
                contentStyle={{ borderRadius: '16px', border: 'none', background: '#0f172a', color: 'white', padding: '12px', fontSize: '11px', fontWeight: 'bold' }} 
                cursor={{ stroke: '#4f46e5', strokeWidth: 1, strokeDasharray: '5 5' }}
              />
              <Legend verticalAlign="top" height={40} iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.1em' }} />
              {selectedIds.map((id, i) => (
                <Line 
                  key={id} 
                  type="monotone" 
                  dataKey={id} 
                  name={assets.find(a => a.id === id)?.name} 
                  stroke={COLORS[i % COLORS.length]} 
                  strokeWidth={4} 
                  dot={false}
                  activeDot={{ r: 6, strokeWidth: 0, fill: COLORS[i % COLORS.length] }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Cartes Stats en bas */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mt-10">
           {selectedIds.map((id, i) => {
             const asset = assets.find(a => a.id === id);
             if (!asset) return null;
             const finalVal = chartData[chartData.length - 1][id];
             const perf = finalVal - 100;
             return (
               <div key={id} className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    <p className="text-[8px] font-black text-slate-400 uppercase truncate">{asset.name}</p>
                  </div>
                  <div>
                    <p className="text-base font-black text-slate-900 dark:text-white leading-none mb-1">{finalVal.toFixed(1)}%</p>
                    <p className={`text-[9px] font-black ${perf >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {perf >= 0 ? '▲' : '▼'} {Math.abs(perf).toFixed(1)}%
                    </p>
                  </div>
               </div>
             )
           })}
        </div>
      </div>
    </div>
  );
};

export default ComparisonView;
