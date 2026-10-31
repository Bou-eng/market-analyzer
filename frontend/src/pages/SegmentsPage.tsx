import { useState, useEffect } from 'react';
import { api } from '../api/client';
import type { ClusterProfile } from '../types/api';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend } from 'recharts';
import { useLanguage } from '../contexts/LanguageContext';

export function SegmentsPage() {
  const [clusters, setClusters] = useState<ClusterProfile[]>([]);
  const { t, translateValue } = useLanguage();

  useEffect(() => {
    api.getClusters().then(setClusters).catch(console.error);
  }, []);

  if (!clusters.length) return <div>{t('segments_loading')}</div>;

  const COLORS = ['#8b5cf6', '#3b82f6', '#94a3b8'];

  // Format data for Radar chart (normalized 0-100 for visualization)
  const radarData = [
    { subject: t('radar_price'), A: 100, B: 45, C: 46, fullMark: 100 },
    { subject: t('radar_capacity'), A: 80, B: 40, C: 40, fullMark: 100 },
    { subject: t('radar_bedrooms'), A: 75, B: 25, C: 25, fullMark: 100 },
    { subject: t('radar_amenities'), A: 100, B: 72, C: 63, fullMark: 100 },
    { subject: t('radar_central'), A: 90, B: 90, C: 10, fullMark: 100 },
  ];

  const localizedClusters = clusters.map((cluster) => ({
    ...cluster,
    display_name: translateValue(cluster.cluster_name),
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{t('segments_title')}</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">{t('segments_description')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {clusters.map((c, i) => (
          <div key={c.cluster_id} className="bg-white dark:bg-slate-800 p-6 rounded-xl border-t-4 border border-slate-200 dark:border-slate-700 shadow-sm" style={{ borderTopColor: COLORS[i] }}>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">{translateValue(c.cluster_name)}</h3>
            <p className="text-sm text-slate-500 mb-4">{t('listings_count', { count: c.listings.toLocaleString() })}</p>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-slate-500">{t('median_price_label')}</span> <span className="font-semibold">{c.median_price.toLocaleString()} TRY</span></div>
              <div className="flex justify-between"><span className="text-slate-500">{t('capacity')}</span> <span className="font-semibold">{t('guest_count', { count: c.median_accommodates })}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">{t('bedrooms_label')}</span> <span className="font-semibold">{c.median_bedrooms}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">{t('amenities')}</span> <span className="font-semibold">{c.median_amenities}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">{t('distance_to_center')}</span> <span className="font-semibold">{c.median_distance_km} km</span></div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
         <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">{t('segment_share')}</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={localizedClusters} dataKey="listings" nameKey="display_name" name={t('listings')} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5}>
                  {clusters.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        
         <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">{t('segment_profiles')}</h3>
          <div className="h-72">
             <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="subject" />
                <PolarRadiusAxis angle={30} domain={[0, 100]} />
                <Radar name={t('radar_large_premium')} dataKey="A" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.3} />
                <Radar name={t('radar_central_standard')} dataKey="B" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                <Radar name={t('radar_remote')} dataKey="C" stroke="#94a3b8" fill="#94a3b8" fillOpacity={0.3} />
                <Legend />
              </RadarChart>
             </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
