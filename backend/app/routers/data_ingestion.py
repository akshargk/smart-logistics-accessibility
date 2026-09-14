"""
SmartLogix SIH Backend — Data Ingestion Router
Exposes normalized telemetry feeds, circuit-breaker observability,
and ML candidate feature signals via FastAPI endpoints.
"""

import time
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Query, HTTPException, status

from app.ingestion.service import DataIngestionService
from app.ingestion.schemas import (
    NormalizedWeather,
    NormalizedEarthquake,
    NormalizedInfrastructure,
    NormalizedRiverTelemetry,
    CandidateMLSignals,
    IngestionHealthResponse,
    IngestionEnvelope,
)

router = APIRouter(
    prefix="/api/v1/data",
    tags=["Disaster Data Ingestion & ML Features"],
)


@router.get(
    "/weather",
    response_model=IngestionEnvelope[NormalizedWeather],
    summary="Get normalized weather telemetry (Open-Meteo)",
    description="Returns real-time precipitation, rain rate, wind speed, and atmospheric conditions.",
)
async def get_weather(
    latitude: float = Query(..., ge=-90.0, le=90.0, description="Latitude"),
    longitude: float = Query(..., ge=-180.0, le=180.0, description="Longitude"),
    refresh: bool = Query(False, description="Force bypass TTL cache"),
):
    start = time.perf_counter()
    service = DataIngestionService.get_instance()
    weather = await service.get_weather(latitude, longitude, force_refresh=refresh)
    latency_ms = round((time.perf_counter() - start) * 1000.0, 2)

    return IngestionEnvelope(
        status="cached" if weather.is_cached else "ok",
        data=weather,
        cached=weather.is_cached,
        source=weather.source,
        timestamp_utc=weather.timestamp_utc,
        latency_ms=latency_ms,
    )


@router.get(
    "/earthquakes",
    response_model=IngestionEnvelope[List[NormalizedEarthquake]],
    summary="Get normalized seismic events (USGS)",
    description="Returns earthquake events within specified radius, sorted by proximity.",
)
async def get_earthquakes(
    latitude: float = Query(..., ge=-90.0, le=90.0, description="Latitude"),
    longitude: float = Query(..., ge=-180.0, le=180.0, description="Longitude"),
    radius_km: float = Query(300.0, ge=10.0, le=2000.0, description="Search radius in kilometres"),
    refresh: bool = Query(False, description="Force bypass TTL cache"),
):
    start = time.perf_counter()
    service = DataIngestionService.get_instance()
    events = await service.get_earthquakes(latitude, longitude, radius_km=radius_km, force_refresh=refresh)
    latency_ms = round((time.perf_counter() - start) * 1000.0, 2)

    return IngestionEnvelope(
        status="ok",
        data=events,
        cached=False,
        source="USGS",
        timestamp_utc=datetime.now(timezone.utc),
        latency_ms=latency_ms,
    )


@router.get(
    "/infrastructure",
    response_model=IngestionEnvelope[List[NormalizedInfrastructure]],
    summary="Get critical emergency infrastructure (OSM)",
    description="Returns nearby hospitals, emergency shelters, and relief hubs.",
)
async def get_infrastructure(
    latitude: float = Query(..., ge=-90.0, le=90.0, description="Latitude"),
    longitude: float = Query(..., ge=-180.0, le=180.0, description="Longitude"),
    radius_km: float = Query(15.0, ge=1.0, le=100.0, description="Search radius in kilometres"),
    types: Optional[str] = Query(None, description="Comma-separated amenities (e.g. hospital,shelter)"),
    refresh: bool = Query(False, description="Force bypass TTL cache"),
):
    start = time.perf_counter()
    service = DataIngestionService.get_instance()
    amenity_list = [t.strip() for t in types.split(",")] if types else None
    infra = await service.get_infrastructure(
        latitude, longitude, radius_km=radius_km, amenity_types=amenity_list, force_refresh=refresh
    )
    latency_ms = round((time.perf_counter() - start) * 1000.0, 2)

    return IngestionEnvelope(
        status="ok",
        data=infra,
        cached=False,
        source="OPENSTREETMAP",
        timestamp_utc=datetime.now(timezone.utc),
        latency_ms=latency_ms,
    )


@router.get(
    "/river",
    response_model=IngestionEnvelope[Optional[NormalizedRiverTelemetry]],
    summary="Get hydrological river gauge telemetry (CWC)",
    description="Returns telemetry and flood ratios for the nearest river basin station.",
)
async def get_river_telemetry(
    latitude: float = Query(..., ge=-90.0, le=90.0, description="Latitude"),
    longitude: float = Query(..., ge=-180.0, le=180.0, description="Longitude"),
    refresh: bool = Query(False, description="Force bypass TTL cache"),
):
    start = time.perf_counter()
    service = DataIngestionService.get_instance()
    river = await service.get_river_telemetry(latitude, longitude, force_refresh=refresh)
    latency_ms = round((time.perf_counter() - start) * 1000.0, 2)

    return IngestionEnvelope(
        status="ok" if river else "not_found",
        data=river,
        cached=False,
        source=river.source if river else "CWC_INDIA",
        timestamp_utc=datetime.now(timezone.utc),
        latency_ms=latency_ms,
    )


@router.get(
    "/features",
    response_model=IngestionEnvelope[CandidateMLSignals],
    summary="Get candidate ML feature signals",
    description="Supplies clean, verified candidate signals for downstream risk models without modifying ML architecture.",
)
async def get_candidate_features(
    latitude: float = Query(..., ge=-90.0, le=90.0, description="Latitude"),
    longitude: float = Query(..., ge=-180.0, le=180.0, description="Longitude"),
):
    start = time.perf_counter()
    service = DataIngestionService.get_instance()
    features = await service.get_candidate_features(latitude, longitude)
    latency_ms = round((time.perf_counter() - start) * 1000.0, 2)

    return IngestionEnvelope(
        status="ok",
        data=features,
        cached=False,
        source="DATA_INGESTION_PIPELINE",
        timestamp_utc=features.timestamp_utc,
        latency_ms=latency_ms,
    )


@router.get(
    "/health",
    response_model=IngestionHealthResponse,
    summary="Ingestion health & circuit breaker telemetry",
    description="Returns real-time status of all external providers, failure counts, latencies, and circuit breaker states.",
)
async def get_ingestion_health():
    service = DataIngestionService.get_instance()
    return service.get_health()
