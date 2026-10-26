import argparse
import sys
from pathlib import Path

import pandas as pd
from sqlalchemy import text

sys.path.append(str(Path(__file__).resolve().parents[1] / "backend"))
from app.db.connection import engine  # noqa: E402


def derive_snapshot_date(df: pd.DataFrame, snapshot_arg: str) -> str:
    if "last_scraped" in df.columns:
        scraped = pd.to_datetime(df["last_scraped"], errors="coerce").dropna()
        if not scraped.empty:
            return scraped.max().date().isoformat()
    return f"{snapshot_arg}-01"


def main() -> None:
    parser = argparse.ArgumentParser(description="Ingest Inside Airbnb listings CSV into PostgreSQL.")
    parser.add_argument("--city", default="istanbul")
    parser.add_argument("--snapshot", required=True)
    parser.add_argument("--snapshot-date", default=None)
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

    backup = f"{args.table}__backup"

    # 1. Move current table out of the way (if it exists)
    with engine.begin() as conn:
        conn.execute(text(f'DROP TABLE IF EXISTS "{backup}"'))
        exists = conn.execute(
            text(f"SELECT to_regclass('public.{args.table}') IS NOT NULL")
        ).scalar()
        if exists:
            conn.execute(text(f'ALTER TABLE "{args.table}" RENAME TO "{backup}"'))

    # 2. Load fresh data directly into the final table name
    df.to_sql(
        args.table,
        engine,
        if_exists="replace",
        index=False,
        method="multi",
        chunksize=100,
    )

    # 3. Verify, then promote or rollback
    with engine.connect() as conn:
        count = conn.execute(text(f'SELECT COUNT(*) FROM "{args.table}"')).scalar()

    if count == len(df):
        with engine.begin() as conn:
            conn.execute(text(f'DROP TABLE IF EXISTS "{backup}"'))
        print(f"✅ Loaded and promoted {count:,} rows into '{args.table}'.")
    else:
        with engine.begin() as conn:
            conn.execute(text(f'DROP TABLE IF EXISTS "{args.table}"'))
            if exists:
                conn.execute(text(f'ALTER TABLE "{backup}" RENAME TO "{args.table}"'))
        raise SystemExit(
            f"❌ Ingestion mismatch: expected {len(df):,}, found {count:,}. Restored backup."
        )


if __name__ == "__main__":
    main()