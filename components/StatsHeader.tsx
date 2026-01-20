
import React from 'react';
import { PortfolioStats } from '../types.ts';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';

interface StatsHeaderProps {
  stats: PortfolioStats;
  goal: number;
}

const miniChartData = [
  { v: 400 }, { v: 450 }, { v: 420 }, { v: 480 }, { v: 510 }, { v: 500 }, { v: 550 }, { v: 530 }, { v: 580 }, { v: 600 }
];

const StatsHeader: React.FC<StatsHeaderProps> = ({ stats, goal }) => {
  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', notation: 'compact', maximumFractionDigits: 1 }).format(val);

  const progress = Math.min(100, (stats.totalNetWorth / goal) * 100);

  return (
    <div className="bento-grid mb-12">
      {/* MAIN NET WORTH BENTO */}
      <div className="col-span-12 lg:col-span-8 glass-card rounded-[4rem] p-12 md:p-16 relative overflow-hidden group min-h-[400px] flex flex-col justify-between transition-all duration-700 hover:shadow-indigo-500/10 hover:shadow-2xl">
        <div className="absolute top-0 right-0 w-3/4 h-full opacity-10 pointer-events-none transition-transform group-hover:scale-110 duration-[2000ms]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={miniChartData}>
              <defs>
                <linearGradient id="heroGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#4f46e5" stopOpacity={0}/>
                  <stop offset="100%" stopColor="#4f46e5" stopOpacity={1}/>
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="v" stroke="#4f46e5" fill="url(#heroGrad)" strokeWidth={0} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-10">
            <div className="w-3 h-3 rounded-full bg-indigo-500 animate-pulse" />
            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.4em]">Global Net Worth</p>
          </div>
          <h2 className="text-[clamp(3.5rem,10vw,8rem)] font-black text-slate-950 dark:text-white text-display tracking-tighter mb-8 leading-none">
            {formatCurrency(stats.totalNetWorth)}
          </h2>
          <div className="flex flex-wrap items-center gap-6">
            <div className={`px-6 py-3 rounded-2xl flex items-center gap-2 ${stats.totalChange24h >= 0 ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-600'}`}>
              <span className="text-xl font-bold">{stats.totalChange24h >= 0 ? '↑' : '↓'}</span>
              <span className="text-sm font-black tracking-tight">{stats.totalChangePercentage.toFixed(2)}%</span>
            </div>
            <p className="text-slate-400 dark:text-slate-500 text-xs font-bold uppercase tracking-widest">Market is active</p>
          </div>
        </div>
      </div>

      {/* FREEDOM GOAL BENTO */}
      <div className="col-span-12 lg:col-span-4 bg-slate-950 dark:bg-white rounded-[4rem] p-12 md:p-16 flex flex-col justify-between shadow-2xl relative overflow-hidden group transition-all duration-700">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-indigo-600 opacity-20 blur-[120px] rounded-full group-hover:scale-150 transition-transform duration-1000" />
        
        <div className="relative z-10">
          <p className="text-[10px] font-black text-indigo-400 dark:text-slate-400 uppercase tracking-[0.4em] mb-12 text-center lg:text-left">Freedom Orbit</p>
          
          <div className="relative w-48 h-48 mx-auto mb-12 flex items-center justify-center">
             <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="44" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-slate-800 dark:text-slate-100" />
                <circle 
                  cx="50" cy="50" r="44" 
                  stroke="#4f46e5" strokeWidth="8" 
                  fill="transparent" 
                  strokeDasharray="276" 
                  strokeDashoffset={276 - (276 * progress / 100)} 
                  strokeLinecap="round" 
                  className="transition-all duration-1000 ease-[cubic-bezier(0.23,1,0.32,1)]" 
                />
             </svg>
             <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-5xl font-black text-white dark:text-slate-950 tracking-tighter">{Math.round(progress)}%</span>
             </div>
          </div>

          <div className="text-center lg:text-left">
            <p className="text-white dark:text-slate-950 font-black text-2xl tracking-tight leading-tight">
              {formatCurrency(goal)} <br/>
              <span className="text-indigo-400 dark:text-slate-400 text-xs font-bold uppercase tracking-[0.2em]">Target Freedom</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsHeader;
