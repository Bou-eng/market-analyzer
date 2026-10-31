"""Prediction endpoint."""
from __future__ import annotations

from fastapi import APIRouter, HTTPException, Request

from app.schemas import PredictionRequest, PredictionResponse
from app.services.prediction import predict_full

router = APIRouter(prefix="/api/v1", tags=["predictions"])


@router.post("/predict", response_model=PredictionResponse)
def predict(request: PredictionRequest, req: Request) -> PredictionResponse:
    price_model = req.app.state.price_model
    cluster_model = req.app.state.cluster_model
    if price_model is None or cluster_model is None:
        raise HTTPException(status_code=503, detail="Models not loaded")
    try:
        result = predict_full(price_model, cluster_model, request.model_dump())
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {e}")
    return PredictionResponse(**result)