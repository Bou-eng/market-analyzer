from __future__ import annotations

import os
from pathlib import Path

# Project root = market-analyzer/ (config.py lives at backend/app/config.py)
PROJECT_ROOT = Path(__file__).resolve().parents[2]


class Settings:
    MODEL_DIR: Path = PROJECT_ROOT / os.getenv("MODEL_DIR", "models")
    PRICE_MODEL_PATH: Path = MODEL_DIR / os.getenv(
        "PRICE_MODEL_FILE", "price_pipeline.joblib"
    )
    CLUSTER_MODEL_PATH: Path = MODEL_DIR / os.getenv(
        "CLUSTER_MODEL_FILE", "cluster_pipeline.joblib"
    )

    DATA_PATH: Path = PROJECT_ROOT / os.getenv(
        "DATA_PATH", "data/processed/listings_clean.parquet"
    )

    CLUSTER_PROFILES_PATH: Path = PROJECT_ROOT / os.getenv(
        "CLUSTER_PROFILES_PATH", "reports/clusters/cluster_profiles.csv"
    )

    MODEL_METRICS_PATH: Path = PROJECT_ROOT / os.getenv(
        "MODEL_METRICS_PATH", "reports/model_metrics.json"
    )


    # --- City / currency context ---
    CITY: str = os.getenv("CITY", "Istanbul")
    CURRENCY: str = os.getenv("CURRENCY", "TRY")
    SNAPSHOT_DATE: str = os.getenv("SNAPSHOT_DATE", "2026-09-01")
    MODEL_VERSION: str = os.getenv("MODEL_VERSION", "v1")

    # --- CORS ---
    # Comma-separated list; default is Vite's dev port
    ALLOWED_ORIGINS: list[str] = [
        o.strip() for o in os.getenv(
            "ALLOWED_ORIGINS", "http://localhost:5173"
        ).split(",") if o.strip()
    ]

    # --- Cluster name mapping (stable across retraining) ---
    # Cluster IDs are arbitrary; the mapping is the semantic truth.
    CLUSTER_NAMES: dict[int, str] = {
        0: "Large Premium Stays",
        1: "Central Standard",
        2: "Remote Outskirts",
    }


settings = Settings()