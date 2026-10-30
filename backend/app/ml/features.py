"""Feature definitions and preprocessing pipeline for price prediction.

The feature lists are the CONTRACT between training and serving.
Any change must be coordinated with Phase 6 (API schemas).
"""
from __future__ import annotations

from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler

TARGET: str = "price"

NUMERIC_FEATURES: list[str] = [
    "accommodates",
    "bedrooms",
    "beds",
    "minimum_nights",
    "amenity_count",
    "distance_to_center_km",
    "latitude",
    "longitude",
]

CATEGORICAL_FEATURES: list[str] = [
    "room_type",
    "property_type",
    "neighbourhood_cleansed",
]

ALL_FEATURES: list[str] = NUMERIC_FEATURES + CATEGORICAL_FEATURES


def build_preprocessor() -> ColumnTransformer:
    """Return a ColumnTransformer: numeric → impute+scale, categorical → impute+onehot."""
    numeric_pipe = Pipeline([
        ("imputer", SimpleImputer(strategy="median")),
        ("scaler", StandardScaler()),
    ])
    categorical_pipe = Pipeline([
        ("imputer", SimpleImputer(strategy="most_frequent")),
        ("onehot", OneHotEncoder(handle_unknown="ignore", sparse_output=False)),
    ])
    return ColumnTransformer([
        ("num", numeric_pipe, NUMERIC_FEATURES),
        ("cat", categorical_pipe, CATEGORICAL_FEATURES),
    ])