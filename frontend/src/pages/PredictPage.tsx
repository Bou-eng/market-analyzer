// src/pages/PredictPage.tsx
import { useState, useEffect } from 'react';
import { api } from '../api/client';
import type { FormOptions, PredictionRequest, PredictionResponse } from '../types/api';
import { ArrowRight, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { cn } from '../utils';
import { useLanguage } from '../contexts/LanguageContext';

export function PredictPage() {
  const { t, translateValue } = useLanguage();
  const [formData, setFormData] = useState<PredictionRequest>({
    room_type: 'Entire home/apt',
    property_type: 'Entire rental unit',
    neighbourhood_cleansed: '',
    accommodates: 2,
    bedrooms: 1,
    beds: 1,
    minimum_nights: 1,
    amenity_count: 15,
    distance_to_center_km: 3.5,
    latitude: 41.01,
    longitude: 28.98,
  });

  const [options, setOptions] = useState<FormOptions | null>(null);
  const [optionsError, setOptionsError] = useState(false);
  const [result, setResult] = useState<PredictionResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  // Fetch dynamic options on mount
  useEffect(() => {
    api.getOptions().then((opts) => {
      setOptions(opts);
      // Set a default neighborhood once options are loaded
      setFormData(prev => ({ ...prev, neighbourhood_cleansed: opts.neighbourhoods[0] }));
    }).catch((err) => {
      console.error(err);
      setOptionsError(true);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(false);
    try {
      const res = await api.predict(formData);
      setResult(res);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: ['room_type', 'property_type', 'neighbourhood_cleansed'].includes(name) ? value : Number(value)
    }));
  };

  if (optionsError) return <div className="p-8 text-center text-slate-500">{t('predict_load_options_error')}</div>;
  if (!options) return <div className="p-8 text-center text-slate-500">{t('predict_loading_options')}</div>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <div className="lg:col-span-5 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{t('predict_title')}</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">{t('predict_description')}</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <InputGroup label={t('room_type')} name="room_type" value={formData.room_type} onChange={handleChange} type="select" options={options.room_types} />
            <InputGroup label={t('property_type')} name="property_type" value={formData.property_type} onChange={handleChange} type="select" options={options.property_types} />
          </div>
          
          <InputGroup label={t('neighbourhood')} name="neighbourhood_cleansed" value={formData.neighbourhood_cleansed} onChange={handleChange} type="select" options={options.neighbourhoods} />
          
          <div className="grid grid-cols-3 gap-4">
            {/* Limits applied here based on the data */}
            <InputGroup label={t('accommodates')} name="accommodates" value={formData.accommodates} onChange={handleChange} type="number" min={options.bounds.accommodates.min} max={options.bounds.accommodates.max} />
            <InputGroup label={t('bedrooms')} name="bedrooms" value={formData.bedrooms} onChange={handleChange} type="number" min={options.bounds.bedrooms.min} max={options.bounds.bedrooms.max} />
            <InputGroup label={t('beds')} name="beds" value={formData.beds} onChange={handleChange} type="number" min={options.bounds.beds.min} max={options.bounds.beds.max} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <InputGroup label={t('minimum_nights')} name="minimum_nights" value={formData.minimum_nights} onChange={handleChange} type="number" min={options.bounds.minimum_nights.min} max={options.bounds.minimum_nights.max} />
            <InputGroup label={t('amenity_count')} name="amenity_count" value={formData.amenity_count} onChange={handleChange} type="number" min={options.bounds.amenity_count.min} max={options.bounds.amenity_count.max} />
          </div>

          <button type="submit" disabled={loading} className="w-full mt-4 bg-brand hover:bg-brand-dark text-white font-medium py-3 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50">
            {loading ? t('calculating') : t('predict_button')}
            {!loading && <ArrowRight size={18} />}
          </button>
          {error && <p className="text-red-500 text-sm mt-2">{t('prediction_failed')}</p>}
        </form>
      </div>

      <div className="lg:col-span-7">
        {result ? (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white dark:bg-slate-800 p-8 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 p-6">
                <div className={cn(
                  "flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium",
                  result.confidence === 'high' 
                    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" 
                    : "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                )}>
                  {result.confidence === 'high' ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
                  {result.confidence === 'high' ? t('high_confidence') : t('low_confidence')}
                </div>
              </div>

              <p className="text-slate-500 dark:text-slate-400 font-medium">{t('predicted_nightly_price')}</p>
              <div className="text-5xl font-extrabold text-slate-900 dark:text-white mt-2">
                {result.currency} {result.predicted_price.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </div>
              <p className="text-sm text-slate-400 mt-2">{t('model_version', { version: result.model_version })}</p>
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">{t('market_segment')}</h3>
              <div className="inline-flex items-center gap-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 px-4 py-2 rounded-lg font-medium text-lg">
                <span className="w-2 h-2 rounded-full bg-indigo-500" />
                {translateValue(result.cluster_name)}
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-4">
                {t('segment_assignment', { id: result.cluster_id })}{' '}
                {result.confidence === 'low' && t('low_confidence_note')}
              </p>
            </div>
          </div>
        ) : (
          <div className="h-full min-h-[400px] flex items-center justify-center bg-slate-100 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-slate-400">
            {t('prediction_empty')}
          </div>
        )}
      </div>
    </div>
  );
}

// Reusable form input component
type InputGroupProps = {
  label: string;
  name: keyof PredictionRequest;
  value: string | number;
  onChange: React.ChangeEventHandler<HTMLInputElement | HTMLSelectElement>;
  type: 'select' | 'number';
  options?: string[];
  min?: number;
  max?: number;
};

function InputGroup({ label, name, value, onChange, type, options = [], min, max }: InputGroupProps) {
  const { translateValue } = useLanguage();

  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{label}</label>
      {type === 'select' ? (
        <select name={name} value={value} onChange={onChange} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none">
          {options.map((opt) => <option key={opt} value={opt}>{translateValue(opt)}</option>)}
        </select>
      ) : (
        <input type="number" name={name} value={value} onChange={onChange} min={min} max={max} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none" />
      )}
    </div>
  );
}
