"""Smoke tests for the FastAPI app.

The `client` fixture (in conftest.py) uses TestClient as a context manager,
which triggers the app's lifespan handler and loads the models into
app.state before the first request.
"""


def test_health(client):
    r = client.get("/health")
    assert r.status_code == 200
    assert r.json() == {"status": "ok"}


def test_predict_valid(client):
    payload = {
        "room_type": "Entire home/apt",
        "property_type": "Entire rental unit",
        "neighbourhood_cleansed": "Beyoğlu",
        "accommodates": 4, "bedrooms": 2, "beds": 2,
        "minimum_nights": 2, "amenity_count": 15,
        "distance_to_center_km": 3.5,
        "latitude": 41.01, "longitude": 28.98,
    }
    r = client.post("/api/v1/predict", json=payload)
    assert r.status_code == 200
    body = r.json()
    assert body["predicted_price"] > 0
    assert body["cluster_id"] in (0, 1, 2)
    assert body["currency"] == "TRY"


def test_predict_invalid_accommodates(client):
    payload = {
        "room_type": "Entire home/apt",
        "property_type": "Entire rental unit",
        "neighbourhood_cleansed": "Beyoğlu",
        "accommodates": 0,
        "bedrooms": 2, "beds": 2,
        "minimum_nights": 2, "amenity_count": 15,
        "distance_to_center_km": 3.5,
        "latitude": 41.01, "longitude": 28.98,
    }
    r = client.post("/api/v1/predict", json=payload)
    assert r.status_code == 422


def test_predict_returns_cluster_name(client):
    """Regression: cluster prediction uses the predicted price."""
    payload = {
        "room_type": "Entire home/apt",
        "property_type": "Entire rental unit",
        "neighbourhood_cleansed": "Beyoğlu",
        "accommodates": 4, "bedrooms": 2, "beds": 2,
        "minimum_nights": 2, "amenity_count": 15,
        "distance_to_center_km": 3.5,
        "latitude": 41.01, "longitude": 28.98,
    }
    r = client.post("/api/v1/predict", json=payload)
    assert r.status_code == 200
    body = r.json()
    assert body["cluster_name"] in (
        "Large Premium Stays", "Central Standard", "Remote Outskirts"
    )


def test_predict_hotel_room_low_confidence(client):
    """Regression: hotel rooms are flagged low confidence (Phase 5 finding)."""
    payload = {
        "room_type": "Hotel room",
        "property_type": "Hotel",
        "neighbourhood_cleansed": "Beyoğlu",
        "accommodates": 2, "bedrooms": 1, "beds": 1,
        "minimum_nights": 1, "amenity_count": 10,
        "distance_to_center_km": 2.0,
        "latitude": 41.01, "longitude": 28.98,
    }
    r = client.post("/api/v1/predict", json=payload)
    assert r.status_code == 200
    assert r.json()["confidence"] == "low"


def test_market_summary(client):
    r = client.get("/api/v1/market/summary")
    assert r.status_code == 200
    body = r.json()
    assert body["count"] > 0
    assert body["median_price"] > 0


def test_market_clusters(client):
    r = client.get("/api/v1/market/clusters")
    assert r.status_code == 200
    assert len(r.json()) == 3