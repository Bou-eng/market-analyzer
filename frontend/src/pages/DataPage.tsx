import { useState, useEffect } from 'react';
import { api } from '../api/client';
import type { DataQualityResponse } from '../types/api';
import { Database, ShieldCheck, FileText, ArrowRight, CheckCircle2, Server, Cpu, Code2, LayoutDashboard } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export function DataPage() {
  const [data, setData] = useState<DataQualityResponse | null>(null);
  const [error, setError] = useState(false);
  const { language, t } = useLanguage();

  useEffect(() => {
    api.getDataQuality().then(setData).catch((err) => {
      console.error(err);
      setError(true);
    });
  }, []);

  if (error) return <div className="p-8 text-center">{t('data_load_error')}</div>;
  if (!data) return <div className="p-8 text-center">{t('data_loading')}</div>;

  const locale = language === 'tr' ? 'tr-TR' : 'en-US';
  const snapshot = new Intl.DateTimeFormat(locale, {
    month: 'short',
    year: 'numeric',
  }).format(new Date(`${data.snapshot_date}T00:00:00`));

  const metricLabels: Record<string, string> = {
    'Validity Rules': t('data_metric_validity_rules'),
    'Drop Long Stay Listings': t('data_metric_long_stay'),
    'Null Value Policy': t('data_metric_null_policy'),
  };

  const formatMetricValue = (value: string) => {
    if (value.startsWith('Removed ')) {
      const count = Number(value.slice('Removed '.length).replaceAll(',', ''));
      return t('data_metric_removed', { count: count.toLocaleString(locale) });
    }

    if (value === 'Imputed in pipeline') {
      return t('data_metric_imputed');
    }

    return value;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{t('data_title')}</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">{t('data_description')}</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title={t('data_raw_rows')} value={data.raw_rows.toLocaleString(locale)} icon={<Database />} />
        <StatCard title={t('data_clean_rows')} value={data.clean_rows.toLocaleString(locale)} icon={<FileText />} />
        <StatCard title={t('data_validation_checks')} value={`${data.checks_passed} / ${data.total_checks}`} icon={<ShieldCheck />} highlight />
        <StatCard title={t('data_latest_snapshot')} value={snapshot} icon={<Server />} />
      </div>

      {/* Pipeline Visual */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm mt-6">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">{t('data_pipeline_architecture')}</h2>
        <div className="flex flex-wrap items-center justify-between gap-2 text-sm font-medium">
          <PipelineStep icon={<Database />} label={t('data_pipeline_raw_csv')} />
          <ArrowRight className="text-slate-300 dark:text-slate-600 w-5 h-5 shrink-0" />
          <PipelineStep icon={<Server />} label={t('data_pipeline_postgresql')} />
          <ArrowRight className="text-slate-300 dark:text-slate-600 w-5 h-5 shrink-0" />
          <PipelineStep icon={<Code2 />} label={t('data_pipeline_cleaning')} />
          <ArrowRight className="text-slate-300 dark:text-slate-600 w-5 h-5 shrink-0" />
          <PipelineStep icon={<FileText />} label={t('data_pipeline_parquet')} />
          <ArrowRight className="text-slate-300 dark:text-slate-600 w-5 h-5 shrink-0" />
          <PipelineStep icon={<Cpu />} label={t('data_pipeline_models')} />
          <ArrowRight className="text-slate-300 dark:text-slate-600 w-5 h-5 shrink-0" />
          <PipelineStep icon={<LayoutDashboard />} label={t('data_pipeline_ui')} />
        </div>
      </div>

      {/* Quality & Artifacts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">{t('data_quality_cleaning')}</h3>
          <div className="space-y-4">
            {data.metrics.map((m, i) => (
              <div key={i} className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-2 last:border-0">
                <span className="text-slate-600 dark:text-slate-300">{metricLabels[m.metric] ?? m.metric}</span>
                <span className="font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  {formatMetricValue(m.value)} <CheckCircle2 size={16} />
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">{t('data_key_artifacts')}</h3>
          <div className="space-y-3">
            <ArtifactRow name="listings_clean.parquet" type={t('data_artifact_dataset')} size="48.2 MB" />
            <ArtifactRow name="data_quality_report.json" type={t('data_artifact_report')} size="1.3 MB" />
            <ArtifactRow name="cluster_pipeline.joblib" type={t('data_artifact_model')} size="12.6 MB" />
            <ArtifactRow name="price_pipeline.joblib" type={t('data_artifact_model')} size="8.4 MB" />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, highlight }: { title: string, value: string, icon: React.ReactNode, highlight?: boolean }) {
  return (
    <div className={`bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col ${highlight ? 'ring-2 ring-emerald-500/20' : ''}`}>
      <div className="flex justify-between items-start mb-4">
        <div className={`p-2 rounded-lg ${highlight ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' : 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'}`}>
          {icon}
        </div>
      </div>
      <div className="text-slate-500 dark:text-slate-400 text-sm font-medium">{title}</div>
      <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{value}</div>
    </div>
  );
}

function PipelineStep({ icon, label }: { icon: React.ReactNode, label: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-3 bg-slate-50 dark:bg-slate-900 rounded-lg flex-1 min-w-[100px] text-center border border-slate-200 dark:border-slate-700">
      <div className="text-slate-600 dark:text-slate-300 mb-2">{icon}</div>
      <span className="text-xs text-slate-700 dark:text-slate-200">{label}</span>
    </div>
  );
}

function ArtifactRow({ name, type, size }: { name: string, type: string, size: string }) {
  return (
    <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-700">
      <div className="flex flex-col">
        <span className="font-medium text-sm text-slate-800 dark:text-slate-200 font-mono">{name}</span>
        <span className="text-xs text-slate-500">{type}</span>
      </div>
      <span className="text-sm font-medium text-slate-600 dark:text-slate-400">{size}</span>
    </div>
  );
}
