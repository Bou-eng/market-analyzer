import { useState } from 'react';
import { api } from '../api/client';
import type { PredictionRequest, PredictionResponse } from '../types/api';
import { ArrowRight, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { cn } from '../utils';

export function PredictPage() {
  const [formData, setFormData] = useState<PredictionRequest>({
    room_type: 'Entire home/apt',
    property_type: 'Entire rental unit',
    neighbourhood_cleansed: 'Beyoğlu',
    accommodates: 4,
    bedrooms: 2,
    beds: 2,
    minimum_nights: 2,
    amenity_count: 15,
    distance_to_center_km: 3.5,
    latitude: 41.01,
    longitude: 28.98,
  });

  const [result, setResult] = useState<PredictionResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await api.predict(formData);
      setResult(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Prediction failed');
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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      
      {/* Form Column */}
      <div className="lg:col-span-5 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Predict Price</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Estimate nightly price based on property details.</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputGroup label="Room Type" name="room_type" value={formData.room_type} onChange={handleChange} type="select" options={['Entire home/apt', 'Private room', 'Shared room']} />
            <InputGroup label="Property Type" name="property_type" value={formData.property_type} onChange={handleChange} type="select" options={['Entire rental unit', 'Entire loft', 'Private room in rental unit']} />
          </div>
          <InputGroup label="Neighbourhood" name="neighbourhood_cleansed" value={formData.neighbourhood_cleansed} onChange={handleChange} type="select" options={['Beyoğlu', 'Beşiktaş', 'Kadıköy', 'Şişli']} />
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <InputGroup label="Accommodates" name="accommodates" value={formData.accommodates} onChange={handleChange} type="number" min={1} max={16} />
            <InputGroup label="Bedrooms" name="bedrooms" value={formData.bedrooms} onChange={handleChange} type="number" min={0} max={10} />
            <InputGroup label="Beds" name="beds" value={formData.beds} onChange={handleChange} type="number" min={0} max={20} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputGroup label="Min. Nights" name="minimum_nights" value={formData.minimum_nights} onChange={handleChange} type="number" min={1} />
            <InputGroup label="Amenity Count" name="amenity_count" value={formData.amenity_count} onChange={handleChange} type="number" min={0} max={100} />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-800"
          >
            {loading ? 'Calculating...' : 'Get Price Prediction'}
            {!loading && <ArrowRight size={18} />}
          </button>
          {error && <p className="text-red-700 dark:text-red-400 text-sm mt-2" role="alert">{error}</p>}
        </form>
      </div>

      {/* Result Column */}
      <div className="lg:col-span-7">
        {result ? (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Main Price Card */}
            <div className="bg-white dark:bg-slate-800 p-8 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 p-6">
                <div className={cn(
                  "flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium",
                  result.confidence === 'high' 
                    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" 
                    : "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                )}>
                  {result.confidence === 'high' ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
                  {result.confidence === 'high' ? 'High Confidence' : 'Low Confidence'}
                </div>
              </div>

              <p className="text-slate-500 dark:text-slate-400 font-medium">Predicted Nightly Price</p>
              <div className="text-5xl font-extrabold text-slate-900 dark:text-white mt-2">
                {result.currency} {result.predicted_price.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">Model version: {result.model_version}</p>
            </div>

            {/* Segment Card */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Market Segment</h3>
              <div className="inline-flex items-center gap-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 px-4 py-2 rounded-lg font-medium text-lg">
                <span className="w-2 h-2 rounded-full bg-indigo-500" />
                {result.cluster_name}
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-4">
                This property falls into segment #{result.cluster_id}. 
                {result.confidence === 'low' && " Note: Predictions for this category are known to be less accurate."}
              </p>
            </div>
          </div>
        ) : (
          <div className="h-full min-h-[400px] flex items-center justify-center bg-slate-100 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-center px-6">
            Fill out the form to see a prediction.
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
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{label}</label>
      {type === 'select' ? (
        <select name={name} value={value} onChange={onChange} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-slate-900 dark:text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
          {options.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
        </select>
      ) : (
        <input type={type} name={name} value={value} onChange={onChange} min={min} max={max} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-slate-900 dark:text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500" />
      )}
    </div>
  );
}
