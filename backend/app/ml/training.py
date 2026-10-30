"""Model builders and evaluation for price prediction."""
from __future__ import annotations

import numpy as np
import pandas as pd
from sklearn.base import BaseEstimator
from sklearn.compose import TransformedTargetRegressor
from sklearn.ensemble import HistGradientBoostingRegressor
from sklearn.linear_model import LinearRegression, Ridge
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.pipeline import Pipeline

from app.ml.features import build_preprocessor


def build_linear_pipeline() -> Pipeline:
    return Pipeline([
        ("preprocessor", build_preprocessor()),
        ("model", TransformedTargetRegressor(
            regressor=LinearRegression(),
            func=np.log1p,
            inverse_func=np.expm1,
        )),
    ])


def build_ridge_pipeline(alpha: float = 1.0) -> Pipeline:
    return Pipeline([
        ("preprocessor", build_preprocessor()),
        ("model", TransformedTargetRegressor(
            regressor=Ridge(alpha=alpha, random_state=42),
            func=np.log1p,
            inverse_func=np.expm1,
        )),
    ])


def build_histgb_pipeline(max_iter: int = 400, random_state: int = 42) -> Pipeline:
    return Pipeline([
        ("preprocessor", build_preprocessor()),
        ("model", TransformedTargetRegressor(
            regressor=HistGradientBoostingRegressor(
                max_iter=max_iter,
                learning_rate=0.05,
                max_depth=6,
                random_state=random_state,
            ),
            func=np.log1p,
            inverse_func=np.expm1,
        )),
    ])


def evaluate(model: BaseEstimator, X_train, y_train, X_test, y_test) -> dict:
    """Fit model on training data and return test metrics."""
    model.fit(X_train, y_train)
    pred = model.predict(X_test)
    return {
        "mae":  float(mean_absolute_error(y_test, pred)),
        "rmse": float(np.sqrt(mean_squared_error(y_test, pred))),
        "r2":   float(r2_score(y_test, pred)),
    }


def compare_models(
    models: dict[str, BaseEstimator],
    X_train, y_train, X_test, y_test,
) -> pd.DataFrame:
    """Fit each model and return a comparison DataFrame sorted by MAE."""
    rows = []
    for name, model in models.items():
        print(f"Fitting {name}...")
        m = evaluate(model, X_train, y_train, X_test, y_test)
        rows.append({"model": name, **m})
    return (
        pd.DataFrame(rows)
        .sort_values("mae")
        .reset_index(drop=True)
    )