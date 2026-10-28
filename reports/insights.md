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

## Finding 3 — Prices concentrate geographically around the central Bosphorus and coastal corridors

**Evidence:** See `reports/eda/geographic_prices.png`. The high-price listings (yellow/light orange dots) cluster heavily around the central Bosphorus-adjacent neighborhoods and the western coastline, while lower-priced listings (darker purple dots) spread further inland and to the outer districts.

**Interpretation:** 
Location captures information beyond "which neighborhood it's in" — it's the actual distance to the sea, the city center, and major transport corridors. The visual clustering confirms that latitude and longitude (and the engineered `distance_to_center_km` feature) will be highly predictive for price modeling.

**Limitation:** 
Listing coordinates are approximate (Airbnb intentionally jitters them for privacy). Therefore, we can observe macro-level clusters but cannot claim block-level precision (e.g., we cannot distinguish a sea-view apartment from an interior street apartment if they share the same jittered coordinate).

### Finding 4 — Amenities with the largest price association: Kitchen, Gym, and Pool

**Evidence:** See `reports/eda/amenity_associations.png`. 

**Key Numbers:**
* **Kitchen:** +58% median price difference (With vs. Without)
* **Gym:** +48%
* **Pool:** +38%
* **Elevator:** +33%
* **Air conditioning:** +2% (virtually no association)

**Interpretation:** 
Premium amenities strongly correlate with premium listings. Listings with a kitchen, gym, or pool command significantly higher median prices. However, this is clearly confounded by property size and neighborhood — a massive luxury villa in Beykoz is highly likely to have a pool and a gym, whereas a standard studio in Şişli might not. Interestingly, basic "Air conditioning" shows almost no price premium (+2%), suggesting it is treated as a standard baseline utility rather than a luxury feature in the Istanbul market.

**Limitation:** 
These associations are heavily confounded by property type, size, and location. This is a descriptive correlation, not a causal claim. Adding a gym to a cheap apartment will not instantly raise its price by 48%.
