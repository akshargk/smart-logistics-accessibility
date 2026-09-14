"""
SmartLogix SIH Backend — USGS Earthquake Provider
Ingests real-time seismic event telemetry from the United States Geological Survey.
Computes epicenter distance, focal depth, and magnitude ranking.
"""

import logging
from datetime import datetime, timezone
from typing import List, Optional
import httpx

from app.ingestion.providers.base import BaseProvider
from app.ingestion.schemas import NormalizedEarthquake, DataQualityFlag
from app.services.geo import haversine_km

logger = logging.getLogger(__name__)


class USGSEarthquakeProvider(BaseProvider):
    """
    USGS Earthquake Hazards Program client.
    Free, public API requiring no authorization keys.
    """

    BASE_URL = "https://earthquake.usgs.gov/fdsnws/event/1/query"

    def __init__(self):
        super().__init__(
            name="USGS_EARTHQUAKE",
            failure_threshold=3,
            recovery_timeout_seconds=60.0,
            request_timeout_seconds=10.0,
            max_retries=3,
        )

    async def fetch_nearby_earthquakes(
        self,
        latitude: float,
        longitude: float,
        radius_km: float = 300.0,
        min_magnitude: float = 2.5,
        limit: int = 15,
    ) -> List[NormalizedEarthquake]:
        """
        Queries seismic events within radius_km from (latitude, longitude).
        """
        params = {
            "format": "geojson",
            "latitude": round(latitude, 4),
            "longitude": round(longitude, 4),
            "maxradiuskm": round(radius_km, 1),
            "minmagnitude": round(min_magnitude, 1),
            "orderby": "time",
            "limit": limit,
        }

        async def _call(client: httpx.AsyncClient):
            return await client.get(self.BASE_URL, params=params)

        try:
            response = await self.execute_with_resilience(_call)
            data = response.json()
            return self._normalize_response(data, latitude, longitude)
        except Exception as e:
            logger.warning(f"USGS earthquake query failed ({e}). Returning empty seismic list.")
            return []

    def _normalize_response(
        self, data: dict, req_lat: float, req_lon: float
    ) -> List[NormalizedEarthquake]:
        """Maps USGS GeoJSON FeatureCollection into List[NormalizedEarthquake]."""
        events: List[NormalizedEarthquake] = []
        features = data.get("features", [])

        for feat in features:
            props = feat.get("properties", {})
            geom = feat.get("geometry", {})
            coords = geom.get("coordinates", [0.0, 0.0, 0.0])

            # GeoJSON coordinates: [longitude, latitude, depth_km]
            if len(coords) < 2:
                continue

            lon = float(coords[0])
            lat = float(coords[1])
            depth = float(coords[2]) if len(coords) > 2 else 10.0

            mag = float(props.get("mag") or 0.0)
            event_id = feat.get("id") or str(props.get("code") or f"eq_{lat}_{lon}")
            place = str(props.get("place") or "Unknown Region")

            # Timestamp epoch milliseconds -> UTC datetime
            epoch_ms = props.get("time")
            if epoch_ms:
                dt = datetime.fromtimestamp(epoch_ms / 1000.0, tz=timezone.utc)
            else:
                dt = datetime.now(timezone.utc)

            # Calculate haversine distance
            dist_km = haversine_km(req_lat, req_lon, lat, lon)

            events.append(
                NormalizedEarthquake(
                    event_id=event_id,
                    magnitude=round(mag, 2),
                    depth_km=round(depth, 1),
                    latitude=lat,
                    longitude=lon,
                    timestamp_utc=dt,
                    place=place,
                    distance_km=round(dist_km, 2),
                    source=self.name,
                    quality_flag=DataQualityFlag.VERIFIED,
                )
            )

        # Sort by distance
        events.sort(key=lambda x: x.distance_km if x.distance_km is not None else 9999.0)
        return events
