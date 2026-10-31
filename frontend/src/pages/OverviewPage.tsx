import { useEffect, useState } from 'react';
import { api } from '../api/client';
import type { MarketSummary, DistributionBin, NeighbourhoodStat } from '../types/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import type { TooltipContentProps } from 'recharts';
import { TrendingUp, Users, Home, DollarSign } from 'lucide-react';

export function OverviewPage() {
  const [summary, setSummary] = useState<MarketSummary | null>(null);
  const [dist, setDist] = useState<DistributionBin[]>([]);
  const [neighbourhoods, setNeighbourhoods] = useState<NeighbourhoodStat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.getSummary(), api.getDistribution(), api.getNeighbourhoods()])
      .then(([s, d, n]) => {
        setSummary(s);
        setDist(d);
        setNeighbourhoods(n);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="animate-pulse h-96 bg-slate-200 dark:bg-slate-800 rounded-xl" />;
  if (!summary) return <div className="text-red-700 dark:text-red-400">Failed to load data.</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Market Overview</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Istanbul short-term rental market summary.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="Active Listings" value={summary.count.toLocaleString()} icon={<Home />} trend="+6%" />
        <StatCard title="Median Price" value={`${summary.currency} ${summary.median_price.toLocaleString()}`} icon={<DollarSign />} trend="+8%" />
        <StatCard title="75th Percentile" value={`${summary.currency} ${summary.p75_price.toLocaleString()}`} icon={<TrendingUp />} trend="+7%" />
        <StatCard title="Avg. Capacity" value="3 guests" icon={<Users />} trend="0%" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribution Chart */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm transition-colors hover:border-slate-300 dark:hover:border-slate-600">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">Nightly Price Distribution</h2>
          <div className="h-72 text-slate-600 dark:text-slate-300">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dist}>
                <XAxis dataKey="bin_start" tickFormatter={(v) => `${v}`} tick={{ fill: 'currentColor', fontSize: 12 }} axisLine={{ stroke: 'currentColor', opacity: 0.35 }} tickLine={{ stroke: 'currentColor', opacity: 0.35 }} />
                <YAxis tick={{ fill: 'currentColor', fontSize: 12 }} axisLine={{ stroke: 'currentColor', opacity: 0.35 }} tickLine={{ stroke: 'currentColor', opacity: 0.35 }} />
                <Tooltip 
                  cursor={{ fill: 'currentColor', opacity: 0.08 }}
                  content={(props) => (
                    <ChartTooltip
                      {...props}
                      formatLabel={(label) => `Price: ~${Math.round(Number(label))} TRY`}
                      valueLabel="Listings"
                    />
                  )}
                />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Neighbourhoods */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm transition-colors hover:border-slate-300 dark:hover:border-slate-600">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">Top Neighbourhoods by Price</h2>
          <div className="h-72 text-slate-600 dark:text-slate-300">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={neighbourhoods} layout="vertical" margin={{ left: 40 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="neighbourhood" type="category" axisLine={false} tickLine={false} tick={{ fill: 'currentColor', fontSize: 12 }} />
                <Tooltip
                  cursor={{ fill: 'currentColor', opacity: 0.08 }}
                  content={(props) => <ChartTooltip {...props} valueLabel="Median price (TRY)" />}
                />
                <Bar dataKey="median_price" fill="#6366f1" radius={[0, 4, 4, 0]}>
                  {neighbourhoods.map((_, i) => <Cell key={i} fill={i === 0 ? '#4f46e5' : '#818cf8'} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, trend }: { title: string, value: string, icon: React.ReactNode, trend: string }) {
  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col transition-colors hover:border-slate-300 dark:hover:border-slate-600">
      <div className="flex justify-between items-start mb-4">
        <div className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
          {icon}
        </div>
        <span className="text-sm font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-1 rounded-md">
          {trend}
        </span>
      </div>
      <div className="text-slate-500 dark:text-slate-400 text-sm font-medium">{title}</div>
      <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{value}</div>
    </div>
  );
}

type ChartTooltipProps = Pick<TooltipContentProps, 'active' | 'payload' | 'label'> & {
  formatLabel?: (label: string | number | undefined) => React.ReactNode;
  valueLabel: string;
};

function ChartTooltip({ active, payload, label, formatLabel, valueLabel }: ChartTooltipProps) {
  if (!active || !payload.length) return null;

  const value = payload[0]?.value;

  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-lg dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100">
      <p className="font-semibold">{formatLabel ? formatLabel(label) : label}</p>
      <p className="mt-1 text-slate-700 dark:text-slate-300">
        {valueLabel}: <span className="font-semibold text-slate-950 dark:text-white">{Array.isArray(value) ? value.join(' – ') : value}</span>
      </p>
    </div>
  );
}
