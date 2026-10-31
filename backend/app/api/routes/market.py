"""Market stats endpoints."""
from __future__ import annotations
import pandas as pd

import json

from fastapi import APIRouter, HTTPException, Request

def _get_df(req: Request) -> pd.DataFrame:  # <-- Removed the quotes
    df = req.app.state.market_df
    if df is None:
        raise HTTPException(status_code=503, detail="Market data not loaded")
    return df

from app.config import settings
from app.schemas import (
    ClusterProfile,
    DataQualityResponse,
    DistributionBin,
    FormOptions,
    MarketSummary,
    NeighbourhoodStat,
)
from app.services.market import (
    get_clusters_from_csv,
    get_data_quality,
    get_distribution,
    get_form_options,
    get_neighbourhoods,
    get_summary,
)

router = APIRouter(prefix="/api/v1/market", tags=["market"])

@router.get("/data-quality", response_model=DataQualityResponse)
def data_quality() -> DataQualityResponse:
    return DataQualityResponse(**get_data_quality())

@router.get("/model-metrics")
def model_metrics():
    path = settings.MODEL_METRICS_PATH
    
    if not path.exists():
        raise HTTPException(status_code=404, detail="Metrics not found")
        
    return json.loads(path.read_text())


@router.get("/options", response_model=FormOptions)
def options(req: Request) -> FormOptions:
    return FormOptions(**get_form_options(_get_df(req)))


def _get_df(req: Request) -> "pd.DataFrame":
    df = req.app.state.market_df
    if df is None:
        raise HTTPException(status_code=503, detail="Market data not loaded")
    return df


@router.get("/summary", response_model=MarketSummary)
def summary(req: Request) -> MarketSummary:
    return MarketSummary(**get_summary(_get_df(req)))


@router.get("/neighbourhoods", response_model=list[NeighbourhoodStat])
def neighbourhoods(req: Request, min_listings: int = 30) -> list[NeighbourhoodStat]:
    return [NeighbourhoodStat(**d) for d in get_neighbourhoods(_get_df(req), min_listings=min_listings)]


@router.get("/clusters", response_model=list[ClusterProfile])
def clusters() -> list[ClusterProfile]:
    return [ClusterProfile(**d) for d in get_clusters_from_csv()]

@router.get("/distribution", response_model=list[DistributionBin])
def distribution(req: Request, bins: int = 20) -> list[DistributionBin]:
    return [DistributionBin(**d) for d in get_distribution(_get_df(req), bins=bins)]