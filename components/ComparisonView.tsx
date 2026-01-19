
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
      setSelectedIds(selectedIds.filter(i => i !== id));
    } else if (selectedIds.length < 5) {
      setSelectedIds([...selectedIds, id]);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="mb-10">
          <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">Comparateur de Performance</h3>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1">Comparaison relative (Base 100)</p>
        </div>

        {/* Sélection des actifs */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 mb-10">
          {assets.map((asset, i) => (
            <button 
              key={asset.id} 
              onClick={() => toggleSelection(asset.id)}
              className={`p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border-2 text-center ${selectedIds.includes(asset.id) ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg scale-105' : 'bg-slate-50 dark:bg-slate-800 border-transparent text-slate-400 hover:border-slate-200 dark:hover:border-slate-700'}`}
            >
              <div className="truncate">{asset.name}</div>
              <div className="text-[8px] opacity-60 mt-1">{asset.category}</div>
            </button>
          ))}
        </div>

        {/* Graphique */}
        <div className="h-[400px] w-full bg-slate-50/50 dark:bg-slate-950/30 rounded-[2rem] p-6 border border-slate-50 dark:border-slate-800">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="dark:opacity-10" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 'bold'}} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} domain={['auto', 'auto']} />
              <Tooltip 
                contentStyle={{ borderRadius: '20px', border: 'none', background: '#0f172a', color: 'white', padding: '15px' }} 
                itemStyle={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }}
                formatter={(v: number) => [`${v}%`, 'Valeur Relative']}
              />
              <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: '900', textTransform: 'uppercase', paddingBottom: '20px' }} />
              {selectedIds.map((id, i) => (
                <Line 
                  key={id} 
                  type="monotone" 
                  dataKey={id} 
                  name={assets.find(a => a.id === id)?.name} 
                  stroke={COLORS[i % COLORS.length]} 
                  strokeWidth={4} 
                  dot={{ r: 4, strokeWidth: 2, fill: '#fff' }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                  animationDuration={1500}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Stats Récapitulatives */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
           {selectedIds.map((id, i) => {
             const asset = assets.find(a => a.id === id);
             if (!asset) return null;
             return (
               <div key={id} className="p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    <p className="text-[9px] font-black text-slate-400 uppercase truncate">{asset.name}</p>
                  </div>
                  <div className="flex justify-between items-end">
                    <p className="text-lg font-black text-slate-900 dark:text-white">{asset.value.toLocaleString()} €</p>
                    <span className={`text-[10px] font-black ${asset.change24h && asset.change24h >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {asset.change24h && asset.change24h >= 0 ? '+' : ''}{asset.change24h}%
                    </span>
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
