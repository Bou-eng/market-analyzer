// src/api/client.ts
import type { 
  PredictionRequest, 
  PredictionResponse, 
  FormOptions, 
  MarketSummary, 
  NeighbourhoodStat, 
  DistributionBin, 
  ClusterProfile, 
  ModelMetrics,
} from '../types/api';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

async function fetchApi<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    throw new Error(errorData?.detail?.[0]?.msg || `HTTP error ${res.status}`);
  }
  return res.json();
}

// Single consolidated export
export const api = {
  predict: (data: PredictionRequest) => 
    fetchApi<PredictionResponse>('/api/v1/predict', { method: 'POST', body: JSON.stringify(data) }),
  
  getSummary: () => fetchApi<MarketSummary>('/api/v1/market/summary'),
  
  getNeighbourhoods: () => fetchApi<NeighbourhoodStat[]>('/api/v1/market/neighbourhoods?min_listings=30&top_n=10'),
  
  getDistribution: () => fetchApi<DistributionBin[]>('/api/v1/market/distribution?bins=20'),
  
  getClusters: () => fetchApi<ClusterProfile[]>('/api/v1/market/clusters'),
  
  getOptions: () => fetchApi<FormOptions>('/api/v1/market/options'),

  // Added the missing method for the ModelPage
  getModelMetrics: () => fetchApi<ModelMetrics>('/api/v1/market/model-metrics'),
};