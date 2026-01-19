
import React from 'react';
import { PortfolioStats } from '../types.ts';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';

interface StatsHeaderProps {
  stats: PortfolioStats;
  goal: number;
}

const miniChartData = [
  { v: 400 }, { v: 450 }, { v: 420 }, { v: 480 }, { v: 510 }, { v: 500 }, { v: 550 }
];

const StatsHeader: React.FC<StatsHeaderProps> = ({ stats, goal }) => {
  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', notation: 'compact', maximumFractionDigits: 1 }).format(val);

  const fullFormatCurrency = (val: number) => 
    new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(val);

  const progress = Math.min(100, (stats.totalNetWorth / goal) * 100);

  return (
    <div className="space-y-8 mb-10">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Patrimoine Net */}
        <div className="bg-white dark:bg-slate-900 p-8 md:p-10 rounded-[2.5rem] md:rounded-[3rem] border border-slate-100 dark:border-white/5 shadow-sm transition-all hover:shadow-xl flex flex-col justify-between overflow-hidden relative group min-h-[160px] md:min-h-[180px]">
          <div className="absolute top-0 right-0 w-32 md:w-40 h-full opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={miniChartData}>
                <Area type="monotone" dataKey="v" stroke="#4f46e5" fill="#4f46e5" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[10px] md:text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-4 relative z-10">Patrimoine Net</p>
          <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tighter relative z-10 truncate" title={fullFormatCurrency(stats.totalNetWorth)}>
            {stats.totalNetWorth > 999999 ? formatCurrency(stats.totalNetWorth) : fullFormatCurrency(stats.totalNetWorth)}
          </h2>
        </div>

        {/* Performance */}
        <div className="bg-white dark:bg-slate-900 p-8 md:p-10 rounded-[2.5rem] md:rounded-[3rem] border border-slate-100 dark:border-white/5 shadow-sm transition-all hover:shadow-xl flex flex-col justify-between min-h-[160px] md:min-h-[180px]">
          <p className="text-[10px] md:text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-4">Performance (24h)</p>
          <div className="flex flex-wrap items-center gap-2 md:gap-4">
            <h2 className={`text-3xl md:text-5xl font-black tracking-tighter ${stats.totalChange24h >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
              {stats.totalChange24h >= 0 ? '+' : ''}{formatCurrency(stats.totalChange24h)}
            </h2>
            <span className={`text-[10px] md:text-xs font-black px-3 md:px-4 py-1.5 md:py-2 rounded-2xl ${stats.totalChange24h >= 0 ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-600'}`}>
               {stats.totalChangePercentage.toFixed(2)}%
            </span>
          </div>
        </div>

        {/* Objectif - Style Premium Glow */}
        <div className="bg-indigo-600 p-8 md:p-10 rounded-[2.5rem] md:rounded-[3rem] shadow-[0_20px_50px_-12px_rgba(79,70,229,0.4)] text-white relative overflow-hidden transition-all hover:scale-[1.02] min-h-[160px] md:min-h-[180px] flex flex-col justify-between">
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/20 rounded-full blur-[60px] pointer-events-none"></div>
          <p className="text-[10px] md:text-[11px] font-black text-indigo-100 uppercase tracking-[0.2em] mb-4 relative z-10">Vers la Liberté</p>
          <div className="flex items-center gap-4 md:gap-8 relative z-10">
             <div className="relative w-14 h-14 md:w-20 md:h-20 flex items-center justify-center shrink-0">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 64 64">
                  <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-white/20" />
                  <circle 
                    cx="32" cy="32" r="28" 
                    stroke="white" strokeWidth="6" 
                    fill="transparent" 
                    strokeDasharray={175.9} 
                    strokeDashoffset={175.9 - (175.9 * progress / 100)} 
                    strokeLinecap="round" 
                    className="transition-all duration-1000 ease-out" 
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-[10px] md:text-sm font-black">{Math.round(progress)}%</span>
             </div>
             <div className="min-w-0">
                <h2 className="text-2xl md:text-4xl font-black tracking-tighter leading-none truncate">{formatCurrency(goal)}</h2>
                <p className="text-[8px] md:text-[10px] font-bold opacity-60 uppercase tracking-widest mt-1 md:mt-2">Objectif Final</p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsHeader;
