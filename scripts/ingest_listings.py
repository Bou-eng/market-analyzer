import argparse
import sys
from pathlib import Path

import pandas as pd
from sqlalchemy import text

sys.path.append(str(Path(__file__).resolve().parents[1] / "backend"))
from app.db.connection import engine  # noqa: E402


def derive_snapshot_date(df: pd.DataFrame, snapshot_arg: str) -> str:
    """Prefer last_scraped from the CSV; fall back to '<snapshot>-01'."""
    if "last_scraped" in df.columns:
        scraped = pd.to_datetime(df["last_scraped"], errors="coerce").dropna()
        if not scraped.empty:
            return scraped.max().date().isoformat()
    # fallback: "2026-09" -> "2026-09-01"
    return f"{snapshot_arg}-01"


def main() -> None:
    parser = argparse.ArgumentParser(description="Ingest Inside Airbnb listings CSV into PostgreSQL.")
    parser.add_argument("--city", default="istanbul")
    parser.add_argument("--snapshot", required=True, help="e.g. 2026-09")
    parser.add_argument("--snapshot-date", default=None,
                        help="ISO date to stamp on rows; default: derived from last_scraped")
    parser.add_argument("--table", default="listings")
    args = parser.parse_args()

    raw_path = Path(f"data/raw/{args.city}/{args.snapshot}/listings.csv.gz")
    if not raw_path.exists():
        raise SystemExit(f"File not found: {raw_path}")

    print(f"Reading {raw_path} ...")
    df = pd.read_csv(raw_path, low_memory=False)
    print(f"  raw rows: {len(df):,}  |  columns: {len(df.columns)}")

    if "id" not in df.columns:
        raise SystemExit("No 'id' column — wrong file?")

    df = df.rename(columns={"id": "listing_id"})
    snapshot_date = args.snapshot_date or derive_snapshot_date(df, args.snapshot)
    df["snapshot_date"] = snapshot_date
    print(f"  snapshot_date = {snapshot_date}")

    staging = f"{args.table}__staging"

    # Load into staging table first (atomic swap below)
    df.to_sql(
        staging,
        engine,
        if_exists="replace",
        index=False,
        method="multi",
        chunksize=1000,
    )

    # Atomic swap: drop old, rename staging -> final
    with engine.begin() as conn:
        conn.execute(text(f'DROP TABLE IF EXISTS "{args.table}"'))
        conn.execute(text(f'ALTER TABLE "{staging}" RENAME TO "{args.table}"'))
        count = conn.execute(text(f'SELECT COUNT(*) FROM "{args.table}"')).scalar()

    print(f"Loaded {count:,} rows into '{args.table}'.")


if __name__ == "__main__":
    main()