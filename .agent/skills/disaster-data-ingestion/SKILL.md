---
name: disaster-data-ingestion
description: Fault-tolerant asynchronous ingestion of Indian and global disaster data: IMD weather, CWC river telemetry, NASA GPM satellite precipitation, and IoT sensors.
---

# Disaster Data Ingestion Skill

## 1. Purpose
Safely ingest, normalize, validate, deduplicate, and cache mission-critical disaster feeds from national agencies (IMD, CWC), satellite precipitation networks (NASA GPM IMERG), and field IoT telemetry. Ensures uninterrupted platform operations through resilient circuit breakers and local fallback caches.

---

## 2. Core Rules & Requirements

1. **Provider Adapter Pattern**:
   - Decouple all external data sources behind dedicated adapter classes (`IMDWeatherAdapter`, `CWCRiverAdapter`, `NASAGPMAdapter`, `OpenMeteoAdapter`).
   - Business and routing logic must NEVER make raw external HTTP requests directly.

2. **Asynchronous I/O & Connection Pooling**:
   - Use `httpx.AsyncClient` with configured limits:
     - `max_connections=20`, `max_keepalive_connections=10`.
     - Explicit timeouts: `connect=5.0s`, `read=15.0s`.
   - Always use `asyncio.gather` with concurrency semaphores to prevent connection exhaustion.

3. **Circuit Breaker Pattern**:
   - Maintain a 3-state circuit breaker per provider:
     - `CLOSED`: Normal operation.
     - `OPEN`: 3 consecutive failures trips the breaker; immediately serve cached baseline data for 60 seconds without hitting external servers.
     - `HALF_OPEN`: Trial request after cooldown; closes on success, reopens on failure.

4. **Exponential Backoff with Jitter**:
   - Retries must use randomized exponential backoff:
     t_wait = min(t_max, t_base * 2^attempt) + uniform(0, jitter)
   - Maximum 3 retries. Never retry on 4xx client errors (except 429 Too Many Requests).

5. **Strict Schema Validation & Deduplication**:
   - Validate every raw payload with **Pydantic v2** models before persisting to SQLite/MongoDB.
   - Enforce UTC ISO-8601 timestamps and decimal degree coordinate bounds (Northeast India: Lat 21.5-29.5 N, Lon 89.5-97.5 E).
   - Compute observation idempotency key:
     idempotency_hash = SHA256(station_id + parameter + observation_timestamp_utc)
   - Deduplicate on write to prevent double-counting precipitation or river levels.

6. **Provenance & Quality Flagging**:
   - Every ingested record must carry provenance metadata:
     - `source`: e.g. `IMD_DWR_GUWAHATI`, `CWC_TELEMETRY`, `NASA_GPM_IMERG`, `OPEN_METEO`.
     - `freshness_sec`: Seconds elapsed since station measurement.
     - `data_quality`: `VERIFIED`, `ESTIMATED`, `SYNTHETIC_DEMO`, `STALE_CACHED`.

---

## 3. Required Technologies & Libraries
- **HTTP & Resilience**: `httpx>=0.28.0`, `tenacity>=8.5.0`
- **Data Validation**: `pydantic>=2.10.0`, `pydantic-settings>=2.6.0`
- **Binary / Scientific Formats**: `h5py>=3.11.0` (HDF5 NASA GPM), `rasterio>=1.3.0` (GeoTIFF)
- **Async Storage**: `motor>=3.6.0`, `aiosqlite>=0.20.0`

---

## 4. Implementation Guidance for SmartLogix

### Resilient Ingestion Adapter Template
```python
import httpx
import hashlib
from datetime import datetime, timezone
from pydantic import BaseModel, Field

class WeatherObservation(BaseModel):
    station_id: str
    latitude: float = Field(ge=21.0, le=30.0)
    longitude: float = Field(ge=89.0, le=98.0)
    timestamp_utc: datetime
    rainfall_1h_mm: float = Field(ge=0.0, le=500.0)
    rainfall_24h_mm: float = Field(ge=0.0, le=2000.0)
    provenance: str = "OPEN_METEO"
    quality_flag: str = "VERIFIED"

class ResilientWeatherIngester:
    def __init__(self, client: httpx.AsyncClient):
        self.client = client
        self.failure_count = 0
        self.is_circuit_open = False
        self.cache: dict[str, WeatherObservation] = {}

    async def fetch_station_telemetry(self, station_id: str, lat: float, lon: float) -> WeatherObservation:
        if self.is_circuit_open:
            if station_id in self.cache:
                cached = self.cache[station_id].model_copy()
                cached.quality_flag = "STALE_CACHED"
                return cached
            raise RuntimeError(f"Circuit OPEN and no cache for station {station_id}")

        url = f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&hourly=precipitation&timezone=UTC"
        try:
            resp = await self.client.get(url, timeout=10.0)
            resp.raise_for_status()
            data = resp.json()
            
            obs = WeatherObservation(
                station_id=station_id,
                latitude=lat,
                longitude=lon,
                timestamp_utc=datetime.now(timezone.utc),
                rainfall_1h_mm=data["hourly"]["precipitation"][-1] or 0.0,
                rainfall_24h_mm=sum(data["hourly"]["precipitation"][-24:] or [0.0]),
                provenance="OPEN_METEO",
                quality_flag="VERIFIED"
            )
            self.cache[station_id] = obs
            self.failure_count = 0
            return obs
        except Exception as err:
            self.failure_count += 1
            if self.failure_count >= 3:
                self.is_circuit_open = True
            if station_id in self.cache:
                fallback = self.cache[station_id].model_copy()
                fallback.quality_flag = "STALE_CACHED"
                return fallback
            raise err
```

---

## 5. Validation & Testing Requirements
- **Boundary Validation**: Pass coordinates outside Northeast India; assert Pydantic raises `ValidationError`.
- **Circuit Breaker Simulation**: Simulate 3 consecutive 503 errors; verify circuit trips and cached telemetry returns with `"STALE_CACHED"`.
- **Deduplication Test**: Insert duplicate timestamp records; verify SQLite/MongoDB idempotency constraints prevent duplicates.
- **NASA HDF5 Parsing**: Validate reading GPM IMERG half-hourly precipitation matrices without memory leaks.

---

## 6. Integration Guidance
- Feeds validated weather and river data to `.agent/skills/hydrological-time-series` and `.agent/skills/disaster-ml-prediction`.
- Persists raw feeds in MongoDB Atlas and hourly summary rollups in SQLite via `backend/app/database.py`.
