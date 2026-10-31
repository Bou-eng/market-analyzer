"""Pydantic request and response schemas.

These are the API contract. Any field added here must be handled in the
route that uses the schema.
"""
from __future__ import annotations

from pydantic import BaseModel, Field


class PredictionRequest(BaseModel):
    """User inputs for a property price prediction."""
    room_type: str = Field(examples=["Entire home/apt"])
    property_type: str = Field(examples=["Entire rental unit"])
    neighbourhood_cleansed: str = Field(examples=["Beyoğlu"])
    accommodates: int = Field(ge=1, le=30)
    bedrooms: float = Field(ge=0, le=20)
    beds: float = Field(ge=0, le=30)
    minimum_nights: int = Field(ge=1, le=365)
    amenity_count: int = Field(ge=0, le=200)
    distance_to_center_km: float = Field(ge=0, le=300)
    latitude: float = Field(ge=-90, le=90)
    longitude: float = Field(ge=-180, le=180)

class DistributionBin(BaseModel):
    bin_start: float
    bin_end: float
    count: int

class PredictionResponse(BaseModel):
    """API response for a price prediction."""
    predicted_price: float
    currency: str
    cluster_id: int
    cluster_name: str
    confidence: str = Field(description="'high' or 'low'")
    model_version: str


class MarketSummary(BaseModel):
    """Aggregate price statistics for the whole market."""
    city: str
    currency: str
    snapshot_date: str
    count: int
    median_price: float
    mean_price: float
    p25_price: float
    p75_price: float
    p99_price: float


class NeighbourhoodStat(BaseModel):
    """Price statistics for one neighborhood."""
    neighbourhood: str
    median_price: float
    listings: int


class ClusterProfile(BaseModel):
    """Median profile for one market segment."""
    cluster_id: int
    cluster_name: str
    listings: int
    median_price: float
    median_accommodates: float
    median_bedrooms: float
    median_amenities: float
    median_distance_km: float

class FormOptions(BaseModel):
    neighbourhoods: list[str]
    room_types: list[str]
    property_types: list[str]
    bounds: dict

class DataQualityMetric(BaseModel):
    metric: str
    value: str
    status: str

class DataQualityResponse(BaseModel):
    raw_rows: int
    clean_rows: int
    checks_passed: int
    total_checks: int
    snapshot_date: str
    metrics: list[DataQualityMetric]