import argparse
import json
import sys
from pathlib import Path

import numpy as np
import pandas as pd

sys.path.append(str(Path(__file__).resolve().parents[1] / "backend"))
from app.db.connection import engine                    # noqa: E402
from app.data.cleaning import (                        # noqa: E402
    parse_price, haversine_km, count_amenities,
)

CENTER_LAT, CENTER_LON = 41.0055, 28.9769

MODELING_COLUMNS = [
    "price", "accommodates", "bedrooms", "bathrooms", "beds",
    "amenity_count", "distance_to_center_km",
    "room_type", "property_type", "neighbourhood_cleansed",
]


def main() -> None:
    parser = argparse.ArgumentParser(description="Clean listings table -> parquet + report.")
    parser.add_argument("--table", default="listings")
    parser.add_argument("--output", default="data/processed/listings_clean.parquet")
    parser.add_argument("--report", default="data/processed/data_quality_report.json")
    parser.add_argument("--min-nights-threshold", type=int, default=30)
    args = parser.parse_args()

    output = Path(args.output)
    report_path = Path(args.report)

    df = pd.read_sql(f'SELECT * FROM "{args.table}"', engine)
    print(f"Loaded {len(df):,} rows from {args.table}")

    report = {"source_table": args.table, "rows_in": len(df), "steps": []}

    # 1. parse price
    df["price"] = parse_price(df["price"])
    report["steps"].append({
        "step": "parse_price",
        "rows_nulled": int(df["price"].isna().sum()),
    })

    # 2. dedupe
    before = len(df)
    df = df.drop_duplicates(subset="listing_id")
    report["steps"].append({
        "step": "drop_duplicate_ids",
        "rows_removed": before - len(df),
    })

    # 3. validity
    before = len(df)
    df = df[
        df["price"].notna()
        & (df["price"] > 0)
        & df["latitude"].between(-90, 90)
        & df["longitude"].between(-180, 180)
    ].copy()
    report["steps"].append({
        "step": "validity_rules",
        "rows_removed": before - len(df),
    })

    # 4. long-stay filter
    before = len(df)
    long_stay = df["minimum_nights"] >= args.min_nights_threshold
    df = df[~long_stay].copy()
    report["steps"].append({
        "step": "drop_long_stay_listings",
        "rows_removed": before - len(df),
        "rationale": (
            f"minimum_nights >= {args.min_nights_threshold} implies "
            "monthly/yearly price entered as nightly"
        ),
    })

    # 5. feature engineering
    df["amenity_count"] = df["amenities"].map(count_amenities)
    df["distance_to_center_km"] = haversine_km(
        df["latitude"].values, df["longitude"].values,
        CENTER_LAT, CENTER_LON,
    )
    df["price_log"] = np.log1p(df["price"])

    # 6. save
    output.parent.mkdir(parents=True, exist_ok=True)
    df.to_parquet(output, index=False)

    report["rows_out"] = len(df)
    report["missingness_after"] = df.isna().mean().round(4).to_dict()
    report["null_counts_after"] = (
        df[MODELING_COLUMNS].isna().sum().astype(int).to_dict()
    )
    report["null_policy"] = {
        "bedrooms": "kept as NaN; imputed inside model Pipeline (Phase 5)",
        "bathrooms": "kept as NaN; imputed inside model Pipeline (Phase 5)",
        "beds": "kept as NaN; imputed inside model Pipeline (Phase 5)",
        "amenity_count": "kept as NaN; imputed inside model Pipeline (Phase 5)",
        "review_scores_rating": "kept as NaN; not used as predictor",
        "_note": "Imputing here would leak test-set statistics. Defer to pipeline.",
    }

    report_path.parent.mkdir(parents=True, exist_ok=True)
    report_path.write_text(json.dumps(report, indent=2))

    print(f"Saved {len(df):,} rows -> {output}")
    print(f"Report -> {report_path}")


if __name__ == "__main__":
    main()