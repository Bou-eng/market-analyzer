"""Reusable data-cleaning functions.

Each function is pure (input -> output) so it can be unit-tested
in Phase 8 without a database or CSV.
"""
import re
import numpy as np
import pandas as pd


def parse_price(series: pd.Series) -> pd.Series:
    """Extract numeric price from strings like '$1,250.00'."""
    cleaned = (
        series.astype("string")
        .str.replace(r"[^\d.,-]", "", regex=True)   # strip currency symbol
        .str.replace(",", "", regex=False)          # remove thousands separators
    )
    return pd.to_numeric(cleaned, errors="coerce")


def haversine_km(lat, lon, center_lat, center_lon):
    """Great-circle distance in km between two coordinates."""
    lat, lon = np.radians(lat), np.radians(lon)
    center_lat, center_lon = np.radians(center_lat), np.radians(center_lon)
    dlat = lat - center_lat
    dlon = lon - center_lon
    a = (
        np.sin(dlat / 2) ** 2
        + np.cos(lat) * np.cos(center_lat) * np.sin(dlon / 2) ** 2
    )
    return 6371.0 * 2 * np.arcsin(np.sqrt(a))


def count_amenities(value):
    """Count items in the JSON-like amenities string."""
    import ast
    if not isinstance(value, str) or not value.strip():
        return np.nan
    try:
        parsed = ast.literal_eval(value)
    except (ValueError, SyntaxError):
        return np.nan
    return len(parsed) if isinstance(parsed, list) else np.nan