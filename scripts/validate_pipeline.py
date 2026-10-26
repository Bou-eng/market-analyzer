"""Assert the cleaned dataset is sane. Exits non-zero on failure."""
import sys
from pathlib import Path
import pandas as pd


def main() -> None:
    df = pd.read_parquet("data/processed/listings_clean.parquet")

    checks = [
        ("listing_id unique", df["listing_id"].is_unique),
        ("price all positive", (df["price"] > 0).all()),
        ("price numeric", pd.api.types.is_float_dtype(df["price"])),
        ("lat/lon in range",
         df["latitude"].between(-90, 90).all()
         and df["longitude"].between(-180, 180).all()),
        ("distance positive",
         (df["distance_to_center_km"] >= 0).all()),
    ]

    failed = [name for name, ok in checks if not ok]
    for name, ok in checks:
        print(f"{'✓' if ok else '✗'} {name}")

    if failed:
        print(f"\nFAILED: {failed}")
        sys.exit(1)
    print("\nAll checks passed.")


if __name__ == "__main__":
    main()