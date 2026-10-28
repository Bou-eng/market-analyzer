# Clustering Decisions — Phase 4

## Feature set

Clustered on these 5 features:
- `price` — the target of the analyzer product; **deliberately included** so segments are price-sensitive. Trade-off: segments split mostly by price. A future experiment can exclude price to get "property-characteristic" segments.
- `accommodates`, `bedrooms` — property size
- `amenity_count` — property quality proxy
- `distance_to_center_km` — location

*(Note: `bathrooms` was originally considered but removed because it was 100% null in the dataset).*

## K selection

See `elbow_silhouette.png`. Chose **K = 3** because:
- **Elbow:** Inertia dropped sharply until K=4, then flattened.
- **Silhouette:** Peaked clearly at K=3 (0.405), stayed high at K=4 (0.400), then collapsed sharply at K=5 (0.285).
- **Interpretability:** K=3 produced segments with distinct, easily explainable traits (see profiles below). K=4 was a close second mathematically, but K=3 provided the most distinct separation. 

## Preprocessing

- `SimpleImputer(strategy="median")` — for missing bedrooms and amenities.
- `StandardScaler` — **MANDATORY** because K-Means is distance-based; without it, `price` (range ~30,000) would completely dominate `accommodates` (range ~15).

## Cluster profiles

See `cluster_profiles.csv`. Summary:

| ID | Name | Listings | Median price (TRY) | Median cap. | Key trait |
|---|---|---|---|---|---|
| 0 | Large Premium Stays | 3,260 | ~8,577 | 6 | 3 bed, 44 amenities, close to center (3.7 km) |
| 1 | Central Standard | 12,006 | ~3,856 | 3 | 1 bed, 32 amenities, close to center (3.6 km) |
| 2 | Remote Outskirts | 1,292 | ~4,000 | 3 | 1 bed, 28 amenities, far from center (28.9 km) |

## Limitations

- **Cluster IDs are not stable** across retraining. Names are stored in a separate mapping, not inferred from the ID.
- **Including `price`** means clusters are price-driven by design. Excluding price would produce segments purely by property type — a valid alternative, documented in stretch goals.
- **Geography drives the split.** Cluster 2 has almost identical specs to Cluster 1 (3 guests, 1 bed, ~4,000 TRY), but is separated purely because it is 29 km from the center. If the goal is strictly price/quality segmentation, distance should be excluded.
- **Clusters are descriptive, not prescriptive.** "Cluster 0" does not mean "market segment that would benefit from X."
- **Single snapshot.** Segments reflect one point in time (the 2026-09 snapshot).