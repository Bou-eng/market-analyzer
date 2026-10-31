import numpy as np
import pandas as pd

from app.ml.features import build_preprocessor


def test_preprocessor():
    # Create a tiny dataframe with missing values
    df = pd.DataFrame({
        "accommodates": [2, 4], "bedrooms": [1, np.nan], "beds": [1, 2],
        "minimum_nights": [1, 2], "amenity_count": [10, 15],
        "distance_to_center_km": [1.0, 2.0], "latitude": [41.0, 41.1], "longitude": [28.9, 29.0],
        "room_type": ["Entire home/apt", "Private room"],
        "property_type": ["Apartment", "House"],
        "neighbourhood_cleansed": ["Beyoglu", "Kadikoy"]
    })
    
    preprocessor = build_preprocessor()
    transformed = preprocessor.fit_transform(df)
    
    # Check that it returns a numpy array (or sparse matrix)
    assert transformed.shape[0] == 2
    # Check that missing value was imputed (no NaNs in output)
    assert not np.isnan(transformed).any()