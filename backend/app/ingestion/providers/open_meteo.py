"""
SmartLogix SIH Backend — Open-Meteo Weather Provider
Ingests real-time and forecast precipitation, rain, wind speed,
and atmospheric telemetry for flood/landslide risk assessment.
"""

import logging
from datetime import datetime, timezone
from typing import Optional
import httpx

from app.ingestion.providers.base import BaseProvider
from app.ingestion.schemas import NormalizedWeather, DataQualityFlag

logger = logging.getLogger(__name__)

# WMO Weather Interpretation Codes (WW)
WMO_CODE_MAP = {
    0: "Clear sky",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Fog",
    48: "Depositing rime fog",
    51: "Light drizzle",
    53: "Moderate drizzle",
    55: "Dense drizzle",
    61: "Slight rain",
    63: "Moderate rain",
    65: "Heavy rain",
    66: "Light freezing rain",
    67: "Heavy freezing rain",
    71: "Slight snow fall",
    73: "Moderate snow fall",
    75: "Heavy snow fall",
    80: "Slight rain showers",
    81: "Moderate rain showers",
    82: "Violent rain showers",
    95: "Thunderstorm",
    96: "Thunderstorm with slight hail",
    99: "Thunderstorm with heavy hail",
}


class OpenMeteoProvider(BaseProvider):
    """
    Open-Meteo provider for high-resolution weather & precipitation telemetry.
    Free, non-commercial and commercial friendly, no API key required.
    """

    BASE_URL = "https://api.open-meteo.com/v1/forecast"

    def __init__(self):
        super().__init__(
            name="OPEN_METEO",
            failure_threshold=3,
            recovery_timeout_seconds=45.0,
            request_timeout_seconds=3.0,
            max_retries=2,
        )

    async def fetch_weather(self, latitude: float, longitude: float) -> NormalizedWeather:
        """
        Fetches current conditions and immediate hourly precipitation for (lat, lon).
        """
        params = {
            "latitude": round(latitude, 4),
            "longitude": round(longitude, 4),
            "current": "temperature_2m,relative_humidity_2m,precipitation,rain,weather_code,wind_speed_10m,wind_direction_10m",
            "hourly": "precipitation,rain,wind_speed_10m",
            "timezone": "UTC",
        }

        async def _call(client: httpx.AsyncClient):
            return await client.get(self.BASE_URL, params=params)

        response = await self.execute_with_resilience(_call)
        data = response.json()

        return self._normalize_response(data, latitude, longitude)

    def _normalize_response(self, data: dict, req_lat: float, req_lon: float) -> NormalizedWeather:
        """Maps raw Open-Meteo JSON into NormalizedWeather."""
        current = data.get("current", {})
        hourly = data.get("hourly", {})

        # Extract current rain or immediate 1st hourly precipitation
        precip = float(current.get("precipitation", 0.0) or 0.0)
        rain = float(current.get("rain", 0.0) or 0.0)

        # If current is 0 but hourly is available, verify latest hour
        if precip == 0.0 and hourly.get("precipitation"):
            hourly_precips = hourly.get("precipitation", [])
            if hourly_precips:
                precip = float(hourly_precips[0] or 0.0)
                rain = float(hourly.get("rain", [0.0])[0] or 0.0)

        wind_spd = float(current.get("wind_speed_10m", 0.0) or 0.0)
        wind_dir = current.get("wind_direction_10m")
        temp_c = current.get("temperature_2m")
        rel_hum = current.get("relative_humidity_2m")
        w_code = current.get("weather_code", 0)
        condition = WMO_CODE_MAP.get(w_code, "Unspecified")

        # Parse timestamp
        time_str = current.get("time")
        if time_str:
            try:
                obs_time = datetime.fromisoformat(time_str.replace("Z", "+00:00"))
                if obs_time.tzinfo is None:
                    obs_time = obs_time.replace(tzinfo=timezone.utc)
            except Exception:
                obs_time = datetime.now(timezone.utc)
        else:
            obs_time = datetime.now(timezone.utc)

        return NormalizedWeather(
            latitude=req_lat,
            longitude=req_lon,
            timestamp_utc=obs_time,
            temperature_c=float(temp_c) if temp_c is not None else None,
            precipitation_mm_per_hr=round(precip, 2),
            rain_mm_per_hr=round(rain, 2),
            wind_speed_kmh=round(wind_spd, 2),
            wind_direction_deg=float(wind_dir) if wind_dir is not None else None,
            relative_humidity_pct=float(rel_hum) if rel_hum is not None else None,
            weather_condition=condition,
            source=self.name,
            quality_flag=DataQualityFlag.VERIFIED,
            is_cached=False,
            freshness_seconds=0.0,
        )
