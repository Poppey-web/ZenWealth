
import React from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend, BarChart, Bar, ReferenceLine 
} from 'recharts';
import { Asset, ChartDataPoint, AssetCategory } from '../types.ts';

interface PortfolioChartsProps {
  history: ChartDataPoint[];
  assets: Asset[];
}

const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const PortfolioCharts: React.FC<PortfolioChartsProps> = ({ history, assets }) => {
  const pieData = Object.values(AssetCategory).map(category => ({
    name: category,
    value: assets.filter(a => a.category === category).reduce((sum, a) => sum + a.value, 0)
  })).filter(item => item.value > 0);

  const performanceData = Object.values(AssetCategory).map(category => {
    const categoryAssets = assets.filter(a => a.category === category);
    if (categoryAssets.length === 0) return null;
    
    const totalVal = categoryAssets.reduce((sum, a) => sum + a.value, 0);
    const totalChange = categoryAssets.reduce((sum, a) => sum + (a.value * (a.change24h || 0) / 100), 0);
    const prevVal = totalVal - totalChange;
    const percent = prevVal !== 0 ? (totalChange / prevVal) * 100 : 0;
    
    return {
      name: category,
      performance: parseFloat(percent.toFixed(2))
    };
  }).filter((item): item is { name: AssetCategory; performance: number } => item !== null);

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('fr-FR', { notation: 'compact', currency: 'EUR' }).format(val);

  return (
    <div className="space-y-6 mb-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Evolution Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 min-h-[400px] transition-colors">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6">Évolution du Patrimoine</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={history}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" className="dark:opacity-10" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} tickFormatter={(val) => `${formatCurrency(val)}`} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', background: '#0f172a', color: 'white' }} />
                <Line type="monotone" dataKey="value" stroke="#4f46e5" strokeWidth={3} dot={{ r: 4, fill: '#4f46e5' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Allocation Chart */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 min-h-[400px] transition-colors">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6">Allocation d'Actifs</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', background: '#0f172a', color: 'white' }} />
                <Legend verticalAlign="bottom" align="center" iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Performance by Category Chart */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 transition-colors">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white">Performance par Catégorie (24h)</h3>
        </div>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={performanceData} layout="vertical" margin={{ left: 40 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" className="dark:opacity-10" />
              <XAxis type="number" hide />
              <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12, fontWeight: 500}} width={100} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', background: '#0f172a', color: 'white' }} />
              <ReferenceLine x={0} stroke="#e2e8f0" strokeWidth={2} />
              <Bar dataKey="performance" radius={[0, 4, 4, 0]} barSize={24}>
                {performanceData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.performance >= 0 ? '#10b981' : '#f43f5e'} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default PortfolioCharts;
