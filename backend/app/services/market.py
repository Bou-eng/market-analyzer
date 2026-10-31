"""Market statistics service — wraps analytics functions for JSON output."""
from __future__ import annotations

import pandas as pd

from app.analytics.market_stats import (
    neighborhood_summary,
    price_summary,
)
from app.config import settings


def get_summary(df: pd.DataFrame) -> dict:
    """Aggregate market KPIs for the summary endpoint."""
    stats = price_summary(df)
    return {
        "city": settings.CITY,
        "currency": settings.CURRENCY,
        "snapshot_date": settings.SNAPSHOT_DATE,
        "count": stats["count"],
        "median_price": stats["median"],
        "mean_price": stats["mean"],
        "p25_price": stats["p25"],
        "p75_price": stats["p75"],
        "p99_price": stats["p99"],
    }

def get_form_options(df: pd.DataFrame) -> dict:
    """Return valid dropdown options and numeric bounds from the training data."""
    # 1. Neighborhoods: top 15
    top_neighbourhoods = df["neighbourhood_cleansed"].value_counts().head(15).index.tolist()
    
    # 2. Property Types: ONLY those with >= 50 listings
    valid_property_types = df["property_type"].value_counts()
    valid_property_types = valid_property_types[valid_property_types >= 50].index.tolist()
    
    return {
        "neighbourhoods": sorted(top_neighbourhoods),
        "room_types": sorted(df["room_type"].dropna().unique().tolist()),
        "property_types": sorted(valid_property_types),
        "bounds": {
            "accommodates": {"min": 1, "max": int(df["accommodates"].max())},
            "bedrooms": {"min": 0, "max": int(df["bedrooms"].max())},
            "beds": {"min": 0, "max": int(df["beds"].max())},
            "minimum_nights": {"min": 1, "max": int(df["minimum_nights"].max())},
            "amenity_count": {"min": 0, "max": int(df["amenity_count"].max())},
        }
    }

def get_neighbourhoods(
    df: pd.DataFrame,
    min_listings: int = 30,
    top_n: int = 20,
) -> list[dict]:
    """Neighborhood stats as a list of dicts (JSON-safe)."""
    summary = neighborhood_summary(df, min_listings=min_listings, top_n=top_n)
    return [
        {
            "neighbourhood": name,
            "median_price": float(row["median_price"]),
            "listings": int(row["listings"]),
        }
        for name, row in summary.iterrows()
    ]

def get_distribution(df: pd.DataFrame, bins: int = 20) -> list[dict]:
    """Price histogram bins for the frontend chart."""
    # Filter out extreme outliers for a readable chart (e.g., < P99)
    cutoff = df["price"].quantile(0.99)
    filtered = df[df["price"] <= cutoff]["price"]
    
    counts, bin_edges = pd.cut(filtered, bins=bins, retbins=True)
    counts = counts.value_counts(sort=False)
    
    return [
        {
            "bin_start": float(bin_edges[i]),
            "bin_end": float(bin_edges[i+1]),
            "count": int(counts.iloc[i])
        }
        for i in range(len(counts))
    ]


def get_clusters_from_csv() -> list[dict]:
    """Read the Phase 4 artifact directly."""
    profiles = pd.read_csv(settings.CLUSTER_PROFILES_PATH, index_col=0)
    return [
        {
            "cluster_id": int(cid),
            "cluster_name": settings.CLUSTER_NAMES.get(int(cid), "Unknown"),
            "listings": int(row["listings"]),
            "median_price": float(row["median_price"]),
            "median_accommodates": float(row["median_accommodates"]),
            "median_bedrooms": float(row["median_bedrooms"]),
            "median_amenities": float(row["median_amenities"]),
            "median_distance_km": float(row["median_distance_km"]),
        }
        for cid, row in profiles.iterrows()
    ]