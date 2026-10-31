import { useState, useEffect } from 'react';
import { api } from '../api/client';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { CheckCircle, AlertCircle } from 'lucide-react';

export function ModelPage() {
  const [metrics, setMetrics] = useState<any>(null);

  useEffect(() => {
    api.getModelMetrics().then(setMetrics).catch(console.error);
  }, []);

  if (!metrics) return <div className="p-8 text-center">Loading model metrics...</div>;

  // Format data for Recharts
  const chartData = [
    metrics.baseline,
    ...metrics.models
  ].map((m: any) => ({
    name: m.model.replace('_', ' '),
    MAE: m.mae,
    RMSE: m.rmse,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Model Performance</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Evaluate predictive reliability for advertised nightly prices.</p>
      </div>

      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-4">
        <div className="bg-emerald-100 dark:bg-emerald-900/30 p-3 rounded-full text-emerald-600">
          <CheckCircle size={24} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white capitalize">Production Model: {metrics.chosen}</h2>
          <p className="text-slate-500 text-sm">Selected based on lowest MAE and acceptable residual behavior.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Model Comparison (Test Set)</h3>
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
            <h3 className="text-lg font-semibold mb-4">Residual Analysis</h3>
            <img src="/residual_analysis.png" alt="Residuals" className="max-h-72 object-contain rounded-lg border border-slate-200 dark:border-slate-700" />
            <p className="text-sm text-slate-500 mt-4">Actual vs Predicted prices. Lower residuals represent better fit.</p>
        </div>
      </div>
    </div>
  );
}