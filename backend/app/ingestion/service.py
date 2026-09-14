"""
SmartLogix SIH Backend — Ingestion Engine & Service Orchestrator
Aggregates multi-source feeds, manages in-memory TTL caching with stale fallbacks,
and synthesizes candidate ML signals for downstream services.
"""

import asyncio
import logging
import time
from datetime import datetime, timezone
from typing import Dict, Any, Optional, List, Tuple

from app.ingestion.schemas import (
    NormalizedWeather,
    NormalizedEarthquake,
    NormalizedInfrastructure,
    NormalizedRiverTelemetry,
    CandidateMLSignals,
    DataQualityFlag,
    IngestionHealthResponse,
    ProviderHealthStatus,
)
from app.ingestion.providers.open_meteo import OpenMeteoProvider
from app.ingestion.providers.usgs import USGSEarthquakeProvider
from app.ingestion.providers.osm import OSMInfrastructureProvider
from app.ingestion.providers.india_authoritative import IndianDisasterPortalProvider

logger = logging.getLogger(__name__)


class CacheEntry:
    def __init__(self, data: Any, ttl_seconds: float):
        self.data = data
        self.created_at = time.time()
        self.ttl_seconds = ttl_seconds

    @property
    def is_expired(self) -> bool:
        return (time.time() - self.created_at) > self.ttl_seconds

    @property
    def age_seconds(self) -> float:
        return time.time() - self.created_at


class DataIngestionService:
    """
    Central singleton orchestrating external disaster feeds, caching, and ML feature handoffs.
    """
    _instance: Optional["DataIngestionService"] = None

    def __init__(self):
        self.weather_provider = OpenMeteoProvider()
        self.earthquake_provider = USGSEarthquakeProvider()
        self.osm_provider = OSMInfrastructureProvider()
        self.india_provider = IndianDisasterPortalProvider()

        # In-memory TTL cache: key -> CacheEntry
        self._cache: Dict[str, CacheEntry] = {}

        # Default TTLs (seconds)
        self.ttl_weather = 300.0        # 5 minutes
        self.ttl_earthquakes = 600.0    # 10 minutes
        self.ttl_infrastructure = 1800.0 # 30 minutes
        self.ttl_rivers = 600.0         # 10 minutes

    @classmethod
    def get_instance(cls) -> "DataIngestionService":
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    def _cache_key(self, prefix: str, lat: float, lon: float, extra: str = "") -> str:
        return f"{prefix}_{round(lat, 2)}_{round(lon, 2)}{'_' + extra if extra else ''}"

    async def close(self):
        """Clean up provider HTTP clients."""
        await asyncio.gather(
            self.weather_provider.close(),
            self.earthquake_provider.close(),
            self.osm_provider.close(),
            self.india_provider.close(),
            return_exceptions=True,
        )

    # ── Weather Telemetry ────────────────────────────────────────

    async def get_weather(
        self, latitude: float, longitude: float, force_refresh: bool = False
    ) -> NormalizedWeather:
        """
        Retrieves weather with TTL cache and graceful stale fallback.
        """
        cache_key = self._cache_key("weather", latitude, longitude)
        cached_entry = self._cache.get(cache_key)

        if not force_refresh and cached_entry and not cached_entry.is_expired:
            w: NormalizedWeather = cached_entry.data
            return w.model_copy(update={"is_cached": True, "freshness_seconds": round(cached_entry.age_seconds, 1)})

        try:
            weather = await self.weather_provider.fetch_weather(latitude, longitude)
            self._cache[cache_key] = CacheEntry(weather, self.ttl_weather)
            return weather
        except Exception as exc:
            logger.warning(f"Live weather fetch failed ({exc}). Checking cache fallback.")
            if cached_entry:
                stale_weather: NormalizedWeather = cached_entry.data
                return stale_weather.model_copy(
                    update={
                        "is_cached": True,
                        "quality_flag": DataQualityFlag.STALE_CACHED,
                        "freshness_seconds": round(cached_entry.age_seconds, 1),
                    }
                )

            # Baseline regional fallback if no cache exists
            return NormalizedWeather(
                latitude=latitude,
                longitude=longitude,
                timestamp_utc=datetime.now(timezone.utc),
                temperature_c=25.0,
                precipitation_mm_per_hr=0.0,
                rain_mm_per_hr=0.0,
                wind_speed_kmh=15.0,
                weather_condition="Estimated Normal",
                source="REGIONAL_CLIMATE_BASELINE",
                quality_flag=DataQualityFlag.FALLBACK_BASELINE,
                is_cached=False,
                freshness_seconds=0.0,
            )

    # ── Earthquake Telemetry ─────────────────────────────────────

    async def get_earthquakes(
        self,
        latitude: float,
        longitude: float,
        radius_km: float = 300.0,
        force_refresh: bool = False,
    ) -> List[NormalizedEarthquake]:
        """
        Retrieves seismic events within radius_km.
        """
        cache_key = self._cache_key("eq", latitude, longitude, str(int(radius_km)))
        cached_entry = self._cache.get(cache_key)

        if not force_refresh and cached_entry and not cached_entry.is_expired:
            return cached_entry.data

        try:
            eq_list = await self.earthquake_provider.fetch_nearby_earthquakes(
                latitude, longitude, radius_km=radius_km
            )
            self._cache[cache_key] = CacheEntry(eq_list, self.ttl_earthquakes)
            return eq_list
        except Exception as exc:
            logger.warning(f"Live earthquake fetch failed ({exc}). Checking cache.")
            if cached_entry:
                return cached_entry.data
            return []

    # ── Critical Infrastructure ──────────────────────────────────

    async def get_infrastructure(
        self,
        latitude: float,
        longitude: float,
        radius_km: float = 15.0,
        amenity_types: Optional[List[str]] = None,
        force_refresh: bool = False,
    ) -> List[NormalizedInfrastructure]:
        """
        Retrieves nearby hospitals, shelters, and relief facilities.
        """
        types_key = "-".join(sorted(amenity_types)) if amenity_types else "all"
        cache_key = self._cache_key("infra", latitude, longitude, f"{int(radius_km)}_{types_key}")
        cached_entry = self._cache.get(cache_key)

        if not force_refresh and cached_entry and not cached_entry.is_expired:
            return cached_entry.data

        try:
            infra = await self.osm_provider.fetch_nearby_infrastructure(
                latitude, longitude, radius_km=radius_km, amenity_types=amenity_types
            )
            self._cache[cache_key] = CacheEntry(infra, self.ttl_infrastructure)
            return infra
        except Exception as exc:
            logger.warning(f"Infrastructure fetch failed ({exc}). Checking cache.")
            if cached_entry:
                return cached_entry.data
            return []

    # ── River Gauge Telemetry ────────────────────────────────────

    async def get_river_telemetry(
        self, latitude: float, longitude: float, force_refresh: bool = False
    ) -> Optional[NormalizedRiverTelemetry]:
        """
        Retrieves nearest river gauge telemetry.
        """
        cache_key = self._cache_key("river", latitude, longitude)
        cached_entry = self._cache.get(cache_key)

        if not force_refresh and cached_entry and not cached_entry.is_expired:
            return cached_entry.data

        try:
            river = await self.india_provider.fetch_nearest_river_telemetry(latitude, longitude)
            if river:
                self._cache[cache_key] = CacheEntry(river, self.ttl_rivers)
            return river
        except Exception as exc:
            logger.warning(f"River telemetry query failed ({exc}).")
            if cached_entry:
                return cached_entry.data
            return None

    # ── Clean ML Candidate Signals Handoff ────────────────────────

    async def get_candidate_features(
        self, latitude: float, longitude: float
    ) -> CandidateMLSignals:
        """
        Synthesizes verified candidate signals from all available feeds.
        This provides a standardized, decoupled feature bridge to downstream ML services.
        """
        # Concurrently gather all telemetry with failure isolation
        w_task = self.get_weather(latitude, longitude)
        eq_task = self.get_earthquakes(latitude, longitude, radius_km=300.0)
        infra_task = self.get_infrastructure(latitude, longitude, radius_km=25.0)
        river_task = self.get_river_telemetry(latitude, longitude)

        results = await asyncio.gather(w_task, eq_task, infra_task, river_task, return_exceptions=True)

        weather_res = results[0] if not isinstance(results[0], Exception) else None
        eq_res = results[1] if not isinstance(results[1], Exception) else []
        infra_res = results[2] if not isinstance(results[2], Exception) else []
        river_res = results[3] if not isinstance(results[3], Exception) else None

        sources: List[str] = []
        rainfall = 0.0
        wind = 0.0
        quality = DataQualityFlag.VERIFIED

        # Extract weather parameters
        if isinstance(weather_res, NormalizedWeather):
            rainfall = max(weather_res.precipitation_mm_per_hr, weather_res.rain_mm_per_hr)
            wind = weather_res.wind_speed_kmh
            sources.append(weather_res.source)
            if weather_res.quality_flag != DataQualityFlag.VERIFIED:
                quality = weather_res.quality_flag

        # Extract seismic parameters
        nearest_seismic_mag = None
        nearest_seismic_dist_km = None
        if isinstance(eq_res, list) and len(eq_res) > 0:
            nearest_eq = eq_res[0]
            nearest_seismic_mag = nearest_eq.magnitude
            nearest_seismic_dist_km = nearest_eq.distance_km
            sources.append(nearest_eq.source)

        # Extract infrastructure distances
        nearest_hospital_dist = None
        nearest_shelter_dist = None
        if isinstance(infra_res, list) and len(infra_res) > 0:
            sources.append("OPENSTREETMAP")
            for item in infra_res:
                if item.amenity_type in ("hospital", "clinic") and nearest_hospital_dist is None:
                    nearest_hospital_dist = item.distance_km
                elif item.amenity_type in ("shelter", "relief_camp") and nearest_shelter_dist is None:
                    nearest_shelter_dist = item.distance_km

        # Extract hydrological risk ratio
        flood_ratio = None
        if isinstance(river_res, NormalizedRiverTelemetry):
            sources.append(river_res.source)
            if river_res.danger_level_meters > 0:
                flood_ratio = round(river_res.water_level_meters / river_res.danger_level_meters, 3)

        return CandidateMLSignals(
            latitude=latitude,
            longitude=longitude,
            rainfall_mm_per_hr=round(rainfall, 2),
            wind_speed_kmh=round(wind, 2),
            nearest_seismic_mag=nearest_seismic_mag,
            nearest_seismic_dist_km=nearest_seismic_dist_km,
            nearest_hospital_dist_km=nearest_hospital_dist,
            nearest_shelter_dist_km=nearest_shelter_dist,
            river_flood_ratio=flood_ratio,
            timestamp_utc=datetime.now(timezone.utc),
            sources_used=list(set(sources)),
            data_quality=quality,
        )

    # ── Provider Health & Circuit State Observability ─────────────

    def get_health(self) -> IngestionHealthResponse:
        """Compiles health and circuit telemetry across all providers."""
        providers = [
            self.weather_provider.get_health_status(),
            self.earthquake_provider.get_health_status(),
            self.osm_provider.get_health_status(),
            self.india_provider.get_health_status(),
        ]

        any_circuit_open = any(p.circuit_state.value == "OPEN" for p in providers)
        any_degraded = any(p.status in ("DEGRADED", "CIRCUIT_OPEN") for p in providers)

        if any_circuit_open:
            overall = "DEGRADED_CIRCUIT_OPEN"
        elif any_degraded:
            overall = "DEGRADED"
        else:
            overall = "HEALTHY"

        return IngestionHealthResponse(
            overall_status=overall,
            cache_entries_count=len(self._cache),
            providers=providers,
        )
