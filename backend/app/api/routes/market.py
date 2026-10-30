"""Market stats endpoints."""
from __future__ import annotations

from fastapi import APIRouter, HTTPException, Request

from app.schemas import ClusterProfile, MarketSummary, NeighbourhoodStat
from app.services.market import (
    get_clusters_from_csv,
    get_neighbourhoods,
    get_summary,
)

router = APIRouter(prefix="/api/v1/market", tags=["market"])


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