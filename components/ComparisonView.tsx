
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
    // Simulation de données historiques indexées sur 100 pour comparer la performance relative
    const data = [];
    const points = 12; // 12 mois
    
    for (let i = 0; i < points; i++) {
      const point: any = { month: `M${i + 1}` };
      selectedIds.forEach(id => {
        const asset = assets.find(a => a.id === id);
        if (asset) {
          // Simulation : Performance annuelle estimée basée sur le change24h ou random
          const drift = (asset.change24h || 0) / 10; 
          const volatility = 2;
          const prevValue = i === 0 ? 100 : data[i-1][id];
          point[id] = Math.max(0, prevValue + (Math.random() - 0.5) * volatility + drift);
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
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="bg-white dark:bg-slate-900 p-10 rounded-[3.5rem] border border-slate-100 dark:border-slate-800 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-10">
          <div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">Comparateur de Performance</h3>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Évolution relative (Base 100)</p>
          </div>
          <div className="flex flex-wrap gap-3">
            {assets.map((asset, i) => (
              <button 
                key={asset.id} 
                onClick={() => toggleSelection(asset.id)}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${selectedIds.includes(asset.id) ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-50 dark:bg-slate-800 text-slate-400 border-transparent'}`}
              >
                {asset.name}
              </button>
            ))}
          </div>
        </div>

        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" className="dark:opacity-10" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 'bold'}} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11}} domain={['auto', 'auto']} />
              <Tooltip 
                contentStyle={{ borderRadius: '24px', border: 'none', background: '#0f172a', color: 'white', fontWeight: 'bold' }} 
                formatter={(v: number) => `${v.toFixed(2)}%`}
              />
              <Legend iconType="circle" />
              {selectedIds.map((id, i) => (
                <Line 
                  key={id} 
                  type="monotone" 
                  dataKey={id} 
                  name={assets.find(a => a.id === id)?.name} 
                  stroke={COLORS[i % COLORS.length]} 
                  strokeWidth={4} 
                  dot={false}
                  animationDuration={1500}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default ComparisonView;
