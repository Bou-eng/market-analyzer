# Model Comparison — Phase 5

## Setup

- **Dataset:** Istanbul Inside Airbnb, snapshot 2026-09, **16,558 rows** after cleaning.
- **Train/test split:** 80/20 with `random_state=42`.
- **Target:** `price` (TRY/night).
- **Features:** 8 numeric + 3 categorical (`accommodates`, `bedrooms`, `beds`, `minimum_nights`, `amenity_count`, `distance_to_center_km`, `latitude`, `longitude`, `room_type`, `property_type`, `neighbourhood_cleansed`).
- **Excluded features:** `bathrooms` (100% null), review counts (unavailable at prediction time for new listings), and price-derived columns (to avoid target leakage).

## Results

| Model | Test MAE (TRY) | Test RMSE (TRY) | Test R² |
|---|---|---|---|
| Median baseline | 3,196.52 | 8,481.95 | -0.04 |
| Linear Regression | 2,506.45 | 7,786.61 | 0.12 |
| Ridge Regression | 2,496.21 | 7,779.52 | 0.13 |
| **HistGradientBoosting** | **1,981.28** | **7,242.18** | **0.24** |

## Chosen model: **HistGradientBoosting**

**Why:** HistGB achieves a test MAE of 1,981 TRY, which is **21% lower than the Linear model** and **38% lower than the baseline**. It clearly captures non-linear interactions (e.g., how property size interacts with neighborhood) that the linear models miss, boosting the R² from 0.12 to 0.24.

**Trade-off:** We sacrifice the direct interpretability of linear coefficients. With HistGB, we cannot say "adding 1 bedroom increases price by exactly X TRY" as easily, but we gain significant accuracy for the user.

## Residual analysis

See `reports/residual_analysis.png`. Key observations:

- **Right-skewed target behavior:** The Predicted vs. Actual plot shows the model predicts typical listings (under 10,000 TRY) very accurately, but systematically **under-predicts the top decile** (the ultra-luxury outliers). This is typical for right-skewed targets; the model lacks the features to justify predicting a 50,000 TRY price.
- **Error by room type:** The residual analysis shows Hotel rooms have a massive MAE of **6,450 TRY** (based on only 45 test samples), while private/shared rooms have very low errors (1,555 and 1,316 TRY).
- **Stable error magnitude:** The residual-vs-predicted plot shows no severe funnel shape for the core market, meaning error magnitude is roughly stable across standard price ranges.

## Limitations

- **Advertised, not booked:** The target is the *advertised* listing price, not realized revenue. Actual occupancy and discount rates are unknown.
- **Single snapshot:** Segments and models reflect one point in time (2026-09); we haven't tested temporal generalization.
- **Hotel data scarcity:** The model struggles with `Hotel room` types because they make up a tiny fraction of the data and have fundamentally different pricing logic.
- **Excluded review data:** The model doesn't use review count or rating, as those are unavailable for a brand-new listing (cold-start problem).
- **Feature scope:** Missing `bathrooms` (100% null in this dataset) and host-specific fields (like superhost status or response rates), which likely drive some price variance.