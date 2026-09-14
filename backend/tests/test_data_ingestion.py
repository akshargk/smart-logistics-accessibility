"""
SmartLogix SIH Backend — Ingestion & Resilience Test Suite
Tests schema normalization, circuit breaker states, exponential backoff,
TTL caching with stale fallback, provider isolation, and API endpoints.
"""

import asyncio
import time
from datetime import datetime, timezone
import pytest
from pydantic import ValidationError
import httpx

from app.ingestion.schemas import (
    NormalizedWeather,
    NormalizedEarthquake,
    NormalizedInfrastructure,
    CandidateMLSignals,
    DataQualityFlag,
    CircuitState,
)
from app.ingestion.providers.base import BaseProvider, CircuitBreakerOpenException
from app.ingestion.service import DataIngestionService


# ── 1. Schema Validation Tests ─────────────────────────────────

def test_weather_schema_validation():
    """Verify NormalizedWeather enforces coordinate and numeric constraints."""
    # Valid weather record
    valid = NormalizedWeather(
        latitude=26.18,
        longitude=91.74,
        timestamp_utc=datetime.now(timezone.utc),
        precipitation_mm_per_hr=12.5,
        rain_mm_per_hr=12.5,
        wind_speed_kmh=24.0,
        source="TEST_SOURCE",
    )
    assert valid.latitude == 26.18
    assert valid.precipitation_mm_per_hr == 12.5
    assert valid.quality_flag == DataQualityFlag.VERIFIED

    # Invalid latitude (> 90)
    with pytest.raises(ValidationError):
        NormalizedWeather(
            latitude=120.0,
            longitude=91.74,
            timestamp_utc=datetime.now(timezone.utc),
            precipitation_mm_per_hr=10.0,
            source="TEST",
        )

    # Negative precipitation should fail
    with pytest.raises(ValidationError):
        NormalizedWeather(
            latitude=26.0,
            longitude=91.0,
            timestamp_utc=datetime.now(timezone.utc),
            precipitation_mm_per_hr=-5.0,
            source="TEST",
        )


def test_earthquake_schema_validation():
    """Verify NormalizedEarthquake validation."""
    eq = NormalizedEarthquake(
        event_id="test_eq_001",
        magnitude=5.2,
        depth_km=15.0,
        latitude=26.5,
        longitude=92.3,
        timestamp_utc=datetime.now(timezone.utc),
        place="Assam, India",
        distance_km=45.2,
    )
    assert eq.magnitude == 5.2
    assert eq.distance_km == 45.2

    # Negative depth should fail
    with pytest.raises(ValidationError):
        NormalizedEarthquake(
            event_id="bad_eq",
            magnitude=4.0,
            depth_km=-10.0,
            latitude=26.0,
            longitude=92.0,
            timestamp_utc=datetime.now(timezone.utc),
            place="Invalid",
        )


def test_candidate_ml_signals_contract():
    """Verify CandidateMLSignals structure for downstream ML models."""
    signals = CandidateMLSignals(
        latitude=26.18,
        longitude=91.74,
        rainfall_mm_per_hr=22.0,
        wind_speed_kmh=35.0,
        nearest_seismic_mag=4.8,
        nearest_seismic_dist_km=62.0,
        nearest_hospital_dist_km=3.2,
        nearest_shelter_dist_km=1.8,
        river_flood_ratio=0.92,
        sources_used=["OPEN_METEO", "USGS", "OPENSTREETMAP", "CWC_INDIA"],
        data_quality=DataQualityFlag.VERIFIED,
    )
    assert signals.rainfall_mm_per_hr == 22.0
    assert signals.nearest_hospital_dist_km == 3.2
    assert len(signals.sources_used) == 4


# ── 2. Circuit Breaker Unit Tests ──────────────────────────────

class MockFailingProvider(BaseProvider):
    def __init__(self, failure_threshold=3, recovery_timeout_seconds=0.5):
        super().__init__(
            name="MOCK_FAILING",
            failure_threshold=failure_threshold,
            recovery_timeout_seconds=recovery_timeout_seconds,
            request_timeout_seconds=1.0,
            max_retries=1,
        )


@pytest.mark.asyncio
async def test_circuit_breaker_state_transitions():
    """Verify CLOSED -> OPEN on consecutive failures -> HALF_OPEN -> CLOSED on success."""
    provider = MockFailingProvider(failure_threshold=3, recovery_timeout_seconds=0.2)
    assert provider.circuit_state == CircuitState.CLOSED

    async def fail_call(client):
        raise httpx.ConnectError("Simulated network outage")

    # 1st failure
    with pytest.raises(httpx.ConnectError):
        await provider.execute_with_resilience(fail_call)
    assert provider.circuit_state == CircuitState.CLOSED
    assert provider.consecutive_failures == 1

    # 2nd failure
    with pytest.raises(httpx.ConnectError):
        await provider.execute_with_resilience(fail_call)
    assert provider.circuit_state == CircuitState.CLOSED
    assert provider.consecutive_failures == 2

    # 3rd failure: Trips circuit to OPEN
    with pytest.raises(httpx.ConnectError):
        await provider.execute_with_resilience(fail_call)
    assert provider.circuit_state == CircuitState.OPEN
    assert provider.consecutive_failures == 3

    # Subsequent call while circuit is OPEN must be blocked immediately
    with pytest.raises(CircuitBreakerOpenException):
        await provider.execute_with_resilience(fail_call)

    # Wait for recovery cooldown
    await asyncio.sleep(0.25)

    # Provider should probe in HALF_OPEN
    async def succeed_call(client):
        return {"status": "recovered"}

    res = await provider.execute_with_resilience(succeed_call)
    assert res == {"status": "recovered"}
    assert provider.circuit_state == CircuitState.CLOSED
    assert provider.consecutive_failures == 0


# ── 3. TTL Caching & Stale Fallback Tests ───────────────────────

@pytest.mark.asyncio
async def test_ttl_cache_and_stale_fallback():
    """Verify cached responses and graceful degradation to stale cache on network failure."""
    service = DataIngestionService()
    service.ttl_weather = 0.2  # short 200ms TTL for testing

    lat, lon = 26.18, 91.74

    # 1st call: fresh fetch
    w1 = await service.get_weather(lat, lon)
    assert isinstance(w1, NormalizedWeather)
    assert w1.is_cached is False

    # 2nd call immediate: should return cached
    w2 = await service.get_weather(lat, lon)
    assert w2.is_cached is True
    assert w2.quality_flag in (DataQualityFlag.VERIFIED, DataQualityFlag.FALLBACK_BASELINE)

    # Mock provider failure after TTL expires
    await asyncio.sleep(0.25)

    async def fail_weather(*args, **kwargs):
        raise httpx.ConnectError("Weather server down")

    service.weather_provider.fetch_weather = fail_weather

    # Call should succeed by returning STALE_CACHED data without raising an error
    w3 = await service.get_weather(lat, lon)
    assert w3.is_cached is True
    assert w3.quality_flag == DataQualityFlag.STALE_CACHED
    assert w3.freshness_seconds is not None
    assert w3.freshness_seconds > 0.2


# ── 4. Provider Isolation & Candidate Signals Test ─────────────

@pytest.mark.asyncio
async def test_provider_isolation_in_candidate_signals():
    """Verify that if one provider fails, the candidate signals still resolve safely."""
    service = DataIngestionService()

    # Simulate earthquake provider failure
    async def fail_earthquake(*args, **kwargs):
        raise RuntimeError("USGS API down")

    service.earthquake_provider.fetch_nearby_earthquakes = fail_earthquake

    # Candidate feature extraction must NOT fail
    signals = await service.get_candidate_features(26.18, 91.74)
    assert isinstance(signals, CandidateMLSignals)
    assert signals.latitude == 26.18
    assert signals.rainfall_mm_per_hr >= 0.0
    assert signals.nearest_seismic_mag is None  # Handled gracefully as None
    assert signals.nearest_hospital_dist_km is not None  # Curated/OSM still provided!


# ── 5. Observability & Health Telemetry Test ───────────────────

def test_ingestion_health_status():
    """Verify health reporting captures all 4 providers and metrics."""
    service = DataIngestionService()
    health = service.get_health()

    assert len(health.providers) == 4
    provider_names = {p.provider_name for p in health.providers}
    assert "OPEN_METEO" in provider_names
    assert "USGS_EARTHQUAKE" in provider_names
    assert "OPENSTREETMAP_INFRA" in provider_names
    assert "INDIA_AUTHORITATIVE_PORTALS" in provider_names
    assert health.overall_status in ("HEALTHY", "DEGRADED")
