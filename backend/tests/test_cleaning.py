import pandas as pd
from app.data.cleaning import parse_price, haversine_km, count_amenities

def test_parse_price():
    raw = pd.Series(["$1,200.00", "90", None, "invalid"])
    cleaned = parse_price(raw)
    assert cleaned.iloc[0] == 1200.0
    assert cleaned.iloc[1] == 90.0
    assert pd.isna(cleaned.iloc[2])
    assert pd.isna(cleaned.iloc[3])

def test_haversine_km():
    # Distance between same point should be 0
    assert haversine_km(41.01, 28.98, 41.01, 28.98) == 0.0
    # Distance between two Istanbul points should be reasonable (e.g., < 50km)
    dist = haversine_km(41.01, 28.98, 41.05, 29.02)
    assert 0.0 < dist < 50.0

def test_count_amenities():
    assert count_amenities('["Wifi", "Kitchen"]') == 2
    assert count_amenities("[]") == 0
    assert pd.isna(count_amenities(None))
    assert pd.isna(count_amenities("not a list"))