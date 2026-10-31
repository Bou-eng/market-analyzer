"""Prediction service — no HTTP, no FastAPI, just model inference.

Pure-ish functions: given a model + features, return a prediction.
Testable without spinning up the API.
"""
from __future__ import annotations

import pandas as pd
from sklearn.base import BaseEstimator

from app.config import settings
from app.ml.clustering import CLUSTER_FEATURES
from app.ml.features import ALL_FEATURES


def build_feature_frame(features: dict, feature_list: list[str]) -> pd.DataFrame:
    """Construct a one-row DataFrame with the exact column order the model expects.

    This is the *boundary* between the API's dict and the model's DataFrame.
    """
    return pd.DataFrame([features])[feature_list]


def predict_price(model: BaseEstimator, features: dict) -> float:
    """Predict nightly price in TRY. Clips at 0 (models can't go negative)."""
    frame = build_feature_frame(features, ALL_FEATURES)
    return max(0.0, float(model.predict(frame)[0]))


def predict_cluster(model: BaseEstimator, features: dict) -> int:
    """Assign the property to a market segment."""
    frame = build_feature_frame(features, CLUSTER_FEATURES)
    return int(model.predict(frame)[0])


def confidence_for(features: dict, predicted_price: float) -> str:
    """Flag predictions with known-weak signal.

    Low-confidence cases (from Phase 5 residual analysis):
    - room_type == "Hotel room" (n=45 in test, MAE 6,450)
    - predicted_price > P90 of training prices (~9,000 TRY) — model underpredicts
      the top decile; the actual top 1% is >38,000 TRY.
    """
    if features.get("room_type") == "Hotel room":
        return "low"
    if predicted_price > 9_000:
        return "low"
    return "high"


def predict_full(
    price_model: BaseEstimator,
    cluster_model: BaseEstimator,
    features: dict,
) -> dict:
    """Full prediction pipeline: predict price, then cluster USING the predicted price.

    The cluster model was trained on CLUSTER_FEATURES which includes `price`.
    At serving time, `price` is unknown (it's what we're predicting). So we
    predict price first, then feed the *predicted* price into the cluster
    features. This makes the cluster assignment semantically meaningful:
    "given these features and this predicted price, which market tier is this?"
    """
    price = predict_price(price_model, features)

    # Inject the predicted price into the features dict for the cluster model
    cluster_features = {**features, "price": price}
    cluster_id = predict_cluster(cluster_model, cluster_features)

    return {
        "predicted_price": price,
        "cluster_id": cluster_id,
        "cluster_name": settings.CLUSTER_NAMES.get(cluster_id, "Unknown"),
        "confidence": confidence_for(features, price),
        "currency": settings.CURRENCY,
        "model_version": settings.MODEL_VERSION,
    }