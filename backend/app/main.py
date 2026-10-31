"""FastAPI application — wires everything together."""
from __future__ import annotations

from contextlib import asynccontextmanager

import joblib
import pandas as pd
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import health, market, predictions
from app.config import settings


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup: load models and market data ONCE. Shutdown: no cleanup needed."""
    print(f"Loading models from {settings.MODEL_DIR}...")
    app.state.price_model = joblib.load(settings.PRICE_MODEL_PATH)
    app.state.cluster_model = joblib.load(settings.CLUSTER_MODEL_PATH)

    print(f"Loading market data from {settings.DATA_PATH}...")
    app.state.market_df = pd.read_parquet(settings.DATA_PATH)

    print(f"Ready. City={settings.CITY}, currency={settings.CURRENCY}")
    yield


app = FastAPI(
    title="Dynamic Market Analyzer API",
    version=settings.MODEL_VERSION,
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)

app.include_router(health.router)
app.include_router(predictions.router)
app.include_router(market.router)