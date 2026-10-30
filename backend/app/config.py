"""Environment-variable-based settings for the API.

This is the SINGLE place where paths, currency, and origins are configured.
Env vars override defaults; same code runs locally and in production.
"""
from __future__ import annotations

import os
from pathlib import Path


class Settings:
    # --- Model artifact paths ---
    MODEL_DIR: Path = Path(os.getenv("MODEL_DIR", "models"))
    PRICE_MODEL_PATH: Path = MODEL_DIR / os.getenv(
        "PRICE_MODEL_FILE", "price_pipeline.joblib"
    )
    CLUSTER_MODEL_PATH: Path = MODEL_DIR / os.getenv(
        "CLUSTER_MODEL_FILE", "cluster_pipeline.joblib"
    )

    # --- Data path for market stats endpoints ---
    DATA_PATH: Path = Path(os.getenv(
        "DATA_PATH", "data/processed/listings_clean.parquet"
    ))

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