# Data Directory

## Layout
- `raw/<city>/<YYYY-MM>/` — immutable downloads from Inside Airbnb. Never edit.
- `interim/` — scratch files, safe to delete.
- `processed/` — model-ready parquet + quality reports, regenerable from `raw/`.

## Rule
Raw data is the source of truth. All downstream files must be rebuildable by
running the scripts in `scripts/`.

## Sources
- Istanbul snapshot YYYY-MM: https://insideairbnb.com/get-the-data