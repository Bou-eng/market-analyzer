import argparse
import sys
from pathlib import Path

import joblib
import pandas as pd

sys.path.append(str(Path(__file__).resolve().parents[1] / "backend"))
from app.ml.clustering import (                        # noqa: E402
    CLUSTER_FEATURES, build_cluster_pipeline, cluster_profiles,
)


def main() -> None:
    parser = argparse.ArgumentParser(description="Fit K-Means clustering and save artifacts.")
    parser.add_argument("--data", default="data/processed/listings_clean.parquet")
    parser.add_argument("--n-clusters", type=int, required=True)
    parser.add_argument("--model-out", default="models/cluster_pipeline.joblib")
    parser.add_argument("--profiles-out", default="reports/clusters/cluster_profiles.csv")
    args = parser.parse_args()

    df = pd.read_parquet(args.data)
    print(f"Loaded {len(df):,} rows")

    X = df[CLUSTER_FEATURES]
    pipeline = build_cluster_pipeline(n_clusters=args.n_clusters)
    df["cluster_id"] = pipeline.fit_predict(X)

    # Save model
    model_out = Path(args.model_out)
    model_out.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump(pipeline, model_out)
    print(f"Saved pipeline -> {model_out}")

    # Save profiles
    profiles = cluster_profiles(df)
    profiles_out = Path(args.profiles_out)
    profiles_out.parent.mkdir(parents=True, exist_ok=True)
    profiles.to_csv(profiles_out)
    print(f"Saved profiles -> {profiles_out}")
    print()
    print(profiles.to_string())


if __name__ == "__main__":
    main()