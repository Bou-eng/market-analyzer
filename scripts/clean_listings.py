import sys
from pathlib import Path

import pandas as pd

sys.path.append(str(Path(__file__).resolve().parents[1] / "backend"))
from app.db.connection import engine                    # noqa: E402
from app.data.cleaning import (                        # noqa: E402
    parse_price, haversine_km, count_amenities,
)

# Istanbul center (Sultanahmet) — documented choice
CENTER_LAT, CENTER_LON = 41.0055, 28.9769
OUTPUT = Path("data/processed/listings_clean.parquet")
REPORT = Path("data/processed/data_quality_report.json")


def main() -> None:
    df = pd.read_sql("SELECT * FROM listings", engine)
    print(f"Loaded {len(df):,} rows from DB")

    report = {"rows_in": len(df), "steps": []}

    # --- 1. parse price ---
    df["price"] = parse_price(df["price"])
    removed = int(df["price"].isna().sum())
    report["steps"].append({"step": "parse_price", "rows_nulled": removed})

    # --- 2. duplicates ---
    before = len(df)
    df = df.drop_duplicates(subset="listing_id")
    report["steps"].append({"step": "drop_duplicate_ids",
                            "rows_removed": before - len(df)})

    # --- 3. validity rules ---
    before = len(df)
    df = df[
        df["price"].notna()
        & (df["price"] > 0)
        & df["latitude"].between(-90, 90)
        & df["longitude"].between(-180, 180)
    ].copy()
    report["steps"].append({"step": "validity_rules",
                            "rows_removed": before - len(df)})

    # --- 3b. remove long-stay listings priced as nightly ---
    # Listings with minimum_nights >= 30 are long-term rentals.
    # Their "price" field often holds the monthly price (proved by
    # price_quote_total_price / price == minimum_nights for many rows).
    before = len(df)
    long_stay = df["minimum_nights"] >= 30
    df = df[~long_stay].copy()
    report["steps"].append({
        "step": "drop_long_stay_listings",
        "rows_removed": before - len(df),
        "rationale": "minimum_nights >= 30 => monthly/yearly price entered as nightly",
    })
    # --- 4. feature engineering ---
    df["amenity_count"] = df["amenities"].map(count_amenities)
    df["distance_to_center_km"] = haversine_km(
        df["latitude"].values, df["longitude"].values,
        CENTER_LAT, CENTER_LON,
    )
    df["price_log"] = df["price"].apply(lambda x: __import__("numpy").log1p(x))

    # --- 5. save ---
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    df.to_parquet(OUTPUT, index=False)

    report["rows_out"] = len(df)
    report["missingness_after"] = df.isna().mean().round(4).to_dict()
    import json
    REPORT.write_text(json.dumps(report, indent=2))

    print(f"Saved {len(df):,} rows -> {OUTPUT}")
    print(f"Report -> {REPORT}")


if __name__ == "__main__":
    main()