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

# Exploratory Data Analysis: Findings

## Finding 1 — Istanbul's median nightly price is 4,470 TRY, with a long luxury tail

**Key Numbers:**
* **Median:** 4,470 TRY
* **P25:** 3,000.00 TRY
* **P75:** 6,856.57 TRY
* **P99:** 38,358 TRY
* **Max:** 502,353.28 TRY

**Interpretation:** 
Half of Istanbul listings cost less than 4,470 TRY/night. The top 1% cost more than 38,358 TRY — an entirely different tier. Averages would be misleading: the mean is heavily inflated by that long tail (as seen by the massive gap between the median line and the far-right edge of the raw price chart). The log transformation on the right panel confirms that once we compress the extreme values, the market has a predictable, roughly symmetric shape centered around ~8.4 (log scale).

**Limitation:** 
These are *advertised* prices, not booked prices. Actual paid rates are unknown.

## Finding 2 — Neighborhood price variation is 3.4× between the top and the median

**Evidence:** See `reports/eda/neighbourhood_prices.png`. 

**Key Numbers:**
* **Top neighborhood (Silivri) median:** 15,371 TRY
* **City-wide median:** 4,470 TRY
* **Ratio:** ~3.4×

**Interpretation:** 
A listing's neighborhood alone shifts the expected price by a factor of roughly 3.4×. This strongly validates including `neighbourhood_cleansed` as a predictor in Phase 5. 

**Data Observation (Important):** 
Silivri appears as an extreme outlier (15,371 TRY) but has a very small sample size (n=54). Silivri is geographically on the far western edge of Istanbul. It's highly likely these 54 listings are large villas or summer homes, which represent a niche market rather than the typical Istanbul apartment. The densest, most competitive neighborhoods (like Şişli, with 2,100 listings) cluster tightly around the 5,800 TRY median. Therefore, while neighborhood is highly predictive, models must be careful not to over-index on low-sample-size outliers like Silivri.

**Limitation:** 
Neighborhood *name* is a proxy — it doesn't capture block-level variation (e.g., sea-view vs. interior streets within the same neighborhood). It also acts as a partial proxy for property type (e.g., Silivri = villas), so a future model should include both.