
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ChartDataPoint } from '../types.ts';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-card p-5 rounded-3xl border border-white/20 shadow-6xl backdrop-blur-2xl">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{label}</p>
        <p className="text-xl font-black text-slate-900 dark:text-white">
          {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(payload[0].value)}
        </p>
      </div>
    );
  }
  return null;
};

const PortfolioCharts: React.FC<{ history: ChartDataPoint[] }> = ({ history }) => {
  return (
    <div className="glass-card p-10 md:p-14 rounded-[4rem] shadow-2xl transition-all min-h-[500px] flex flex-col mb-16">
      <div className="mb-14">
        <h3 className="text-4xl font-black text-slate-950 dark:text-white tracking-tighter leading-none">Performance Orbit</h3>
        <p className="text-slate-400 font-black uppercase tracking-[0.4em] text-[10px] mt-4">Total Net Worth Evolution Index</p>
      </div>
      
      <div className="flex-1 min-h-[350px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={history}>
            <CartesianGrid strokeDasharray="8 8" vertical={false} stroke="#e2e8f0" className="dark:opacity-5" />
            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: '900'}} dy={20} />
            <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: '700'}} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#4f46e5', strokeWidth: 2, strokeDasharray: '4 4' }} />
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke="#4f46e5" 
              strokeWidth={6} 
              dot={{ r: 0 }} 
              activeDot={{ r: 8, fill: '#4f46e5', stroke: '#fff', strokeWidth: 4 }}
              animationDuration={2500}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default PortfolioCharts;
