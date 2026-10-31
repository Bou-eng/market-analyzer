// src/types/api.ts
export interface PredictionRequest {
  room_type: string;
  property_type: string;
  neighbourhood_cleansed: string;
  accommodates: number;
  bedrooms: number;
  beds: number;
  minimum_nights: number;
  amenity_count: number;
  distance_to_center_km: number;
  latitude: number;
  longitude: number;
}

export interface PredictionResponse {
  predicted_price: number;
  currency: string;
  cluster_id: number;
  cluster_name: string;
  confidence: "high" | "low";
  model_version: string;
}

export interface MarketSummary {
  city: string;
  currency: string;
  snapshot_date: string;
  count: number;
  median_price: number;
  mean_price: number;
  p25_price: number;
  p75_price: number;
  p99_price: number;
}

export interface NeighbourhoodStat {
  neighbourhood: string;
  median_price: number;
  listings: number;
}

export interface DistributionBin {
  bin_start: number;
  bin_end: number;
  count: number;
}

export interface ClusterProfile {
  cluster_id: number;
  cluster_name: string;
  listings: number;
  median_price: number;
  median_accommodates: number;
  median_bedrooms: number;
  median_amenities: number;
  median_distance_km: number;
}

export interface FormOptions {
  neighbourhoods: string[];
  room_types: string[];
  property_types: string[];
  bounds: {
    accommodates: { min: number; max: number };
    bedrooms: { min: number; max: number };
    beds: { min: number; max: number };
    minimum_nights: { min: number; max: number };
    amenity_count: { min: number; max: number };
  };
}