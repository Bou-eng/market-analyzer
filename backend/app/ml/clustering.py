"""Reusable clustering pipeline for market segmentation."""
from __future__ import annotations

import pandas as pd
from sklearn.cluster import KMeans
from sklearn.impute import SimpleImputer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler

# Features used for clustering — the *contract* with the serving layer.
# Any change here must be reflected in the API schema (Phase 6).
CLUSTER_FEATURES: list[str] = [
    "price",
    "accommodates",
    "bedrooms",
    "amenity_count",
    "distance_to_center_km",
]


def build_cluster_pipeline(n_clusters: int, random_state: int = 42) -> Pipeline:
    """Return an unfitted pipeline: impute → scale → KMeans."""
    return Pipeline([
        ("imputer", SimpleImputer(strategy="median")),
        ("scaler", StandardScaler()),
        ("kmeans", KMeans(n_clusters=n_clusters, random_state=random_state, n_init=10)),
    ])


def cluster_profiles(df: pd.DataFrame, cluster_col: str = "cluster_id") -> pd.DataFrame:
    """Return a per-cluster median summary, suitable for interpretation."""
    return (
        df.groupby(cluster_col)
        .agg(
            listings=("listing_id", "count"),
            median_price=("price", "median"),
            median_accommodates=("accommodates", "median"),
            median_bedrooms=("bedrooms", "median"),
            median_amenities=("amenity_count", "median"),
            median_distance_km=("distance_to_center_km", "median"),
            top_room_type=("room_type", lambda x: x.mode().iloc[0]),
        )
        .sort_index()
    )