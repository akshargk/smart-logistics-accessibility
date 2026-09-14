"""
SmartLogix SIH Backend — Ingestion Endpoints ASGI Integration Tests
Tests all /api/v1/data/* endpoints directly via httpx ASGITransport.
"""

import pytest
import httpx
from main import app


@pytest.mark.asyncio
async def test_data_weather_endpoint():
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://testserver") as client:
        res = await client.get("/api/v1/data/weather", params={"latitude": 26.18, "longitude": 91.74})
        assert res.status_code == 200
        body = res.json()
        assert body["status"] in ("ok", "cached")
        assert "precipitation_mm_per_hr" in body["data"]
        assert "wind_speed_kmh" in body["data"]
        assert body["data"]["latitude"] == 26.18


@pytest.mark.asyncio
async def test_data_earthquakes_endpoint():
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://testserver") as client:
        res = await client.get("/api/v1/data/earthquakes", params={"latitude": 26.18, "longitude": 91.74, "radius_km": 500})
        assert res.status_code == 200
        body = res.json()
        assert body["status"] == "ok"
        assert isinstance(body["data"], list)


@pytest.mark.asyncio
async def test_data_infrastructure_endpoint():
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://testserver") as client:
        res = await client.get("/api/v1/data/infrastructure", params={"latitude": 26.18, "longitude": 91.74, "radius_km": 20})
        assert res.status_code == 200
        body = res.json()
        assert body["status"] == "ok"
        assert len(body["data"]) > 0


@pytest.mark.asyncio
async def test_data_river_endpoint():
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://testserver") as client:
        res = await client.get("/api/v1/data/river", params={"latitude": 26.18, "longitude": 91.74})
        assert res.status_code == 200
        body = res.json()
        assert body["status"] == "ok"
        assert body["data"]["river_basin"] == "Brahmaputra"


@pytest.mark.asyncio
async def test_data_features_endpoint():
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://testserver") as client:
        res = await client.get("/api/v1/data/features", params={"latitude": 26.18, "longitude": 91.74})
        assert res.status_code == 200
        body = res.json()
        assert body["status"] == "ok"
        features = body["data"]
        assert "rainfall_mm_per_hr" in features
        assert "wind_speed_kmh" in features
        assert "nearest_hospital_dist_km" in features
        assert isinstance(features["sources_used"], list)


@pytest.mark.asyncio
async def test_data_health_endpoint():
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://testserver") as client:
        res = await client.get("/api/v1/data/health")
        assert res.status_code == 200
        body = res.json()
        assert body["overall_status"] in ("HEALTHY", "DEGRADED")
        assert len(body["providers"]) == 4


@pytest.mark.asyncio
async def test_coordinate_validation_422():
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://testserver") as client:
        # Latitude 999 is invalid
        res = await client.get("/api/v1/data/weather", params={"latitude": 999.0, "longitude": 91.74})
        assert res.status_code == 422
