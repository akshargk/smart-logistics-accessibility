"""
SmartLogix SIH Backend — Ingestion Schemas & Contracts
Pydantic v2 normalized contracts for external disaster feeds,
observability status, and candidate ML feature handoffs.
"""

from datetime import datetime, timezone
from enum import Enum
from typing import List, Optional, Generic, TypeVar, Any
from pydantic import BaseModel, Field, ConfigDict


class DataQualityFlag(str, Enum):
    VERIFIED = "VERIFIED"
    ESTIMATED = "ESTIMATED"
    STALE_CACHED = "STALE_CACHED"
    FALLBACK_BASELINE = "FALLBACK_BASELINE"


class CircuitState(str, Enum):
    CLOSED = "CLOSED"
    OPEN = "OPEN"
    HALF_OPEN = "HALF_OPEN"


# ── Weather Data ───────────────────────────────────────────────

class NormalizedWeather(BaseModel):
    """Normalized real-time and forecast weather telemetry."""
    model_config = ConfigDict(from_attributes=True)

    latitude: float = Field(..., ge=-90.0, le=90.0)
    longitude: float = Field(..., ge=-180.0, le=180.0)
    timestamp_utc: datetime
    temperature_c: Optional[float] = Field(None, ge=-80.0, le=70.0, description="Ambient temperature in Celsius")
    precipitation_mm_per_hr: float = Field(0.0, ge=0.0, le=1000.0, description="Total precipitation rate (mm/h)")
    rain_mm_per_hr: float = Field(0.0, ge=0.0, le=1000.0, description="Liquid rainfall rate (mm/h)")
    wind_speed_kmh: float = Field(0.0, ge=0.0, le=400.0, description="10m wind speed in km/h")
    wind_direction_deg: Optional[float] = Field(None, ge=0.0, le=360.0, description="Wind azimuth angle (degrees)")
    relative_humidity_pct: Optional[float] = Field(None, ge=0.0, le=100.0, description="Relative humidity %")
    weather_condition: Optional[str] = Field("Clear", description="WMO weather interpretation description")
    source: str = Field(..., description="Provider source identifier")
    quality_flag: DataQualityFlag = DataQualityFlag.VERIFIED
    is_cached: bool = False
    freshness_seconds: Optional[float] = None


# ── Earthquake / Seismic Data ──────────────────────────────────

class NormalizedEarthquake(BaseModel):
    """Normalized seismic event telemetry from USGS/NDMA."""
    model_config = ConfigDict(from_attributes=True)

    event_id: str
    magnitude: float = Field(..., ge=-1.0, le=10.0, description="Moment magnitude (Mw) or Richter scale")
    depth_km: float = Field(..., ge=0.0, le=1000.0, description="Focal depth in kilometres")
    latitude: float = Field(..., ge=-90.0, le=90.0)
    longitude: float = Field(..., ge=-180.0, le=180.0)
    timestamp_utc: datetime
    place: str = Field(..., description="Geographic location or epicenter description")
    distance_km: Optional[float] = Field(None, ge=0.0, description="Haversine distance from query location")
    source: str = "USGS"
    quality_flag: DataQualityFlag = DataQualityFlag.VERIFIED


# ── Critical Infrastructure / OSM ─────────────────────────────

class NormalizedInfrastructure(BaseModel):
    """Normalized critical infrastructure (hospitals, shelters, relief hubs)."""
    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str
    amenity_type: str = Field(..., description="hospital | shelter | fire_station | police | relief_hub")
    latitude: float = Field(..., ge=-90.0, le=90.0)
    longitude: float = Field(..., ge=-180.0, le=180.0)
    distance_km: Optional[float] = Field(None, ge=0.0, description="Distance from origin in kilometres")
    contact: Optional[str] = None
    accessible: Optional[bool] = None
    capacity: Optional[int] = Field(None, ge=0)
    source: str = "OPENSTREETMAP"
    quality_flag: DataQualityFlag = DataQualityFlag.VERIFIED


# ── River Gauge / Hydrological Telemetry ───────────────────────

class NormalizedRiverTelemetry(BaseModel):
    """Hydrological river telemetry (CWC / Brahmaputra basin)."""
    model_config = ConfigDict(from_attributes=True)

    station_id: str
    station_name: str
    river_basin: str
    water_level_meters: float
    danger_level_meters: float
    warning_level_meters: float
    trend: str = Field("STEADY", description="RISING | FALLING | STEADY")
    latitude: float = Field(..., ge=-90.0, le=90.0)
    longitude: float = Field(..., ge=-180.0, le=180.0)
    timestamp_utc: datetime
    source: str = "CWC_INDIA"
    quality_flag: DataQualityFlag = DataQualityFlag.VERIFIED


# ── Candidate ML Signals (Clean Model Handoff Contract) ─────────

class CandidateMLSignals(BaseModel):
    """
    Clean, decoupled pre-model feature contract.
    Supplies candidate environmental and infrastructure signals to downstream
    prediction services without altering model architecture or weights.
    """
    model_config = ConfigDict(from_attributes=True)

    latitude: float = Field(..., ge=-90.0, le=90.0)
    longitude: float = Field(..., ge=-180.0, le=180.0)
    rainfall_mm_per_hr: float = Field(0.0, ge=0.0, description="Observed/estimated rainfall rate in mm/h")
    wind_speed_kmh: float = Field(0.0, ge=0.0, description="Observed/estimated wind speed in km/h")
    nearest_seismic_mag: Optional[float] = Field(None, description="Magnitude of nearest seismic event within query radius")
    nearest_seismic_dist_km: Optional[float] = Field(None, description="Distance to nearest seismic epicenter in km")
    nearest_hospital_dist_km: Optional[float] = Field(None, description="Distance to nearest hospital in km")
    nearest_shelter_dist_km: Optional[float] = Field(None, description="Distance to nearest evacuation shelter in km")
    river_flood_ratio: Optional[float] = Field(None, description="Ratio of current river level to danger level (if near basin)")
    timestamp_utc: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    sources_used: List[str] = Field(default_factory=list)
    data_quality: DataQualityFlag = DataQualityFlag.VERIFIED


# ── Provider Health & Observability ─────────────────────────────

class ProviderHealthStatus(BaseModel):
    """Provider circuit breaker and health telemetry."""
    provider_name: str
    status: str = Field(..., description="HEALTHY | DEGRADED | FAILING | CIRCUIT_OPEN")
    circuit_state: CircuitState
    consecutive_failures: int
    total_requests: int
    successful_requests: int
    last_latency_ms: Optional[float] = None
    last_success_timestamp: Optional[datetime] = None
    last_error: Optional[str] = None


class IngestionHealthResponse(BaseModel):
    """Aggregate health status of all ingestion providers."""
    overall_status: str
    timestamp_utc: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    cache_entries_count: int
    providers: List[ProviderHealthStatus]


T = TypeVar("T")

class IngestionEnvelope(BaseModel, Generic[T]):
    """Standard API response envelope for ingested telemetry."""
    status: str = Field("ok", description="ok | degraded | cached | fallback")
    data: T
    cached: bool = False
    source: str
    timestamp_utc: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    latency_ms: float = 0.0
