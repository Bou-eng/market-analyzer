import joblib
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.config import settings
from app.ml.features import ALL_FEATURES

# ... keep existing tests (test_health, test_predict_valid, etc.) ...

def test_model_serialization():
    """Ensure saved models can be loaded from disk."""
    price_model = joblib.load(settings.PRICE_MODEL_PATH)
    cluster_model = joblib.load(settings.CLUSTER_MODEL_PATH)
    assert price_model is not None
    assert cluster_model is not None

def test_contract_consistency():
    """Ensure the features expected by the model match what the API sends."""
    # Get the Pydantic schema for PredictionRequest
    from app.schemas import PredictionRequest
    request_fields = set(PredictionRequest.model_fields.keys())
    
    # The schema has extra fields like distance_to_center_km, so we only check
    # that all the model's required features are covered by the schema.
    model_features = set(ALL_FEATURES)
    
    # Assert that every feature the model needs is in the API request
    assert model_features.issubset(request_fields), f"Missing from API: {model_features - request_fields}"