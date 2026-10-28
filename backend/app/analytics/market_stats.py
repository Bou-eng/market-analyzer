# backend/app/analytics/market_stats.py
"""Reusable market-statistics functions.

Each function takes a DataFrame and returns a DataFrame or dict.
No plotting, no DB access, no I/O — pure functions.
"""
from __future__ import annotations

import pandas as pd


def price_summary(df: pd.DataFrame) -> dict:
    """Return key price statistics for a listings DataFrame."""
    return {
        "count": int(len(df)),
        "median": float(df["price"].median()),
        "mean": float(df["price"].mean()),
        "p25": float(df["price"].quantile(0.25)),
        "p75": float(df["price"].quantile(0.75)),
        "p99": float(df["price"].quantile(0.99)),
        "min": float(df["price"].min()),
        "max": float(df["price"].max()),
    }


def neighborhood_summary(
    df: pd.DataFrame,
    min_listings: int = 30,
    top_n: int | None = None,
) -> pd.DataFrame:
    """Median/mean price and listing count per neighborhood."""
    summary = (
        df.groupby("neighbourhood_cleansed")
        .agg(
            median_price=("price", "median"),
            mean_price=("price", "mean"),
            listings=("listing_id", "count"),
        )
        .query("listings >= @min_listings")
        .sort_values("median_price", ascending=False)
    )
    return summary.head(top_n) if top_n else summary


def amenity_impact(
    df: pd.DataFrame,
    amenities: list[str],
) -> pd.DataFrame:
    """Median price with vs. without each amenity."""
    import ast

    parsed = df["amenities"].apply(
        lambda s: ast.literal_eval(s) if isinstance(s, str) else []
    )

    rows = []
    for a in amenities:
        has = parsed.apply(lambda lst: a in lst)
        with_price = float(df.loc[has, "price"].median())
        without_price = float(df.loc[~has, "price"].median())
        rows.append({
            "amenity": a,
            "median_with": with_price,
            "median_without": without_price,
            "n_with": int(has.sum()),
            "n_without": int((~has).sum()),
            "pct_diff": (with_price - without_price) / without_price * 100,
        })
    return pd.DataFrame(rows).sort_values("pct_diff", ascending=False)