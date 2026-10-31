import { useState, useEffect } from 'react';
import { api } from '../api/client';
import type { ModelMetrics } from '../types/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { CheckCircle } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export function ModelPage() {
  const [metrics, setMetrics] = useState<ModelMetrics | null>(null);
  const { t, translateValue } = useLanguage();

  useEffect(() => {
    api.getModelMetrics().then(setMetrics).catch(console.error);
  }, []);

  if (!metrics) return <div className="p-8 text-center">{t('model_loading')}</div>;

  // Format data for Recharts
  const chartData = [
    metrics.baseline,
    ...metrics.models
  ].map((m) => ({
    name: translateValue(m.model.replace('_', ' ')),
    MAE: m.mae,
    RMSE: m.rmse,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{t('model_title')}</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">{t('model_description')}</p>
      </div>

      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-4">
        <div className="bg-emerald-100 dark:bg-emerald-900/30 p-3 rounded-full text-emerald-600">
          <CheckCircle size={24} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white capitalize">{t('production_model', { model: translateValue(metrics.chosen) })}</h2>
          <p className="text-slate-500 text-sm">{t('production_model_description')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">{t('model_comparison')}</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip cursor={{fill: 'transparent'}} />
                <Legend />
                <Bar dataKey="MAE" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="RMSE" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-center items-center text-center">
            <h3 className="text-lg font-semibold mb-4">{t('residual_analysis')}</h3>
            <img src="/residual_analysis.png" alt={t('residual_alt')} className="max-h-72 object-contain rounded-lg border border-slate-200 dark:border-slate-700" />
            <p className="text-sm text-slate-500 mt-4">{t('residual_description')}</p>
        </div>
      </div>
    </div>
  );
}
