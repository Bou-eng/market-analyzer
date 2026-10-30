import argparse
import json
import sys
from pathlib import Path

import joblib
import pandas as pd
from sklearn.model_selection import train_test_split

sys.path.append(str(Path(__file__).resolve().parents[1] / "backend"))
from app.ml.features import ALL_FEATURES, TARGET          # noqa: E402
from app.ml.training import (                             # noqa: E402
    build_linear_pipeline, build_ridge_pipeline,
    build_histgb_pipeline, compare_models,
)


MODEL_BUILDERS = {
    "linear": build_linear_pipeline,
    "ridge": build_ridge_pipeline,
    "histgb": build_histgb_pipeline,
}


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Train and compare regression models; save the chosen one."
    )
    parser.add_argument("--data", default="data/processed/listings_clean.parquet")
    parser.add_argument("--choose", choices=list(MODEL_BUILDERS), default="histgb",
                        help="Model to save as the production artifact")
    parser.add_argument("--model-out", default="models/price_pipeline.joblib")
    parser.add_argument("--metrics-out", default="reports/model_metrics.json")
    args = parser.parse_args()

    df = pd.read_parquet(args.data)
    X = df[ALL_FEATURES]
    y = df[TARGET]
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )
    print(f"Train: {len(X_train):,} | Test: {len(X_test):,}")

    # Baseline
    import numpy as np
    from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
    baseline_pred = np.full_like(y_test, fill_value=y_train.median())
    baseline = {
        "model": "median_baseline",
        "mae":  float(mean_absolute_error(y_test, baseline_pred)),
        "rmse": float(np.sqrt(mean_squared_error(y_test, baseline_pred))),
        "r2":   float(r2_score(y_test, baseline_pred)),
    }

    # Compare all three
    models = {name: builder() for name, builder in MODEL_BUILDERS.items()}
    results = compare_models(models, X_train, y_train, X_test, y_test)

    # Save full comparison
    report = {
        "n_train": len(X_train),
        "n_test": len(X_test),
        "target": TARGET,
        "features": ALL_FEATURES,
        "baseline": baseline,
        "models": results.to_dict(orient="records"),
        "chosen": args.choose,
    }
    metrics_out = Path(args.metrics_out)
    metrics_out.parent.mkdir(parents=True, exist_ok=True)
    metrics_out.write_text(json.dumps(report, indent=2))
    print(f"\nMetrics -> {metrics_out}")
    print(pd.DataFrame([baseline]).to_string(index=False))
    print(results.to_string(index=False))

    # Fit and save the chosen model on ALL training data (already fit in comparison,
    # but we refit fresh here to guarantee a clean artifact)
    print(f"\nSaving chosen model: {args.choose}")
    final_model = MODEL_BUILDERS[args.choose]()
    final_model.fit(X_train, y_train)

    model_out = Path(args.model_out)
    model_out.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump(final_model, model_out)
    print(f"Model -> {model_out}")


if __name__ == "__main__":
    main()