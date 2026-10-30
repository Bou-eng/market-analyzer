"""Shared pytest fixtures.

The `client` fixture uses TestClient as a context manager so the FastAPI
lifespan handler runs and populates `app.state` (models, market data).
Without the `with` block, app.state is empty and any endpoint that reads
from it will fail with AttributeError.
"""
import pytest
from fastapi.testclient import TestClient

from app.main import app


@pytest.fixture(scope="session")
def client():
    """A TestClient with lifespan started once per test session.

    `scope="session"` means models load once, not per test — mirrors
    production behavior and keeps tests fast.
    """
    with TestClient(app) as c:
        yield c