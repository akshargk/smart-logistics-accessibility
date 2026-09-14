"""
SmartLogix SIH Backend — OpenStreetMap Infrastructure Provider
Queries Overpass API / Nominatim for critical emergency infrastructure:
Hospitals, evacuation shelters, relief hubs, and emergency centers.
"""

import logging
from typing import List, Optional, Dict, Any
import httpx

from app.ingestion.providers.base import BaseProvider
from app.ingestion.schemas import NormalizedInfrastructure, DataQualityFlag
from app.services.geo import haversine_km

logger = logging.getLogger(__name__)

# Authoritative regional fallback infrastructure for Northeast India
CURATED_NE_INFRASTRUCTURE = [
    {
        "id": "ne_gmch_ghy",
        "name": "Gauhati Medical College & Hospital (GMCH)",
        "amenity_type": "hospital",
        "latitude": 26.1584,
        "longitude": 91.7712,
        "accessible": True,
        "contact": "+91-361-2529457",
        "capacity": 1200,
    },
    {
        "id": "ne_sarusajai_hub",
        "name": "Sarusajai Stadium Regional Disaster Relief Hub",
        "amenity_type": "shelter",
        "latitude": 26.1132,
        "longitude": 91.7615,
        "accessible": True,
        "contact": "+91-361-2237050",
        "capacity": 3500,
    },
    {
        "id": "ne_iitg_shelter",
        "name": "IIT Guwahati Indoor Sports Complex Emergency Shelter",
        "amenity_type": "shelter",
        "latitude": 26.1878,
        "longitude": 91.6916,
        "accessible": True,
        "contact": "+91-361-2583000",
        "capacity": 850,
    },
    {
        "id": "ne_smch_silchar",
        "name": "Silchar Medical College & Hospital (SMCH)",
        "amenity_type": "hospital",
        "latitude": 24.7833,
        "longitude": 92.7933,
        "accessible": True,
        "contact": "+91-3842-240212",
        "capacity": 600,
    },
    {
        "id": "ne_civil_shillong",
        "name": "Shillong Civil Hospital",
        "amenity_type": "hospital",
        "latitude": 25.5788,
        "longitude": 91.8831,
        "accessible": False,
        "contact": "+91-364-2224100",
        "capacity": 400,
    },
]


class OSMInfrastructureProvider(BaseProvider):
    """
    OpenStreetMap Overpass API adapter for emergency amenities.
    Strictly follows OSM Acceptable Use Policies (custom User-Agent, bounded queries).
    """

    OVERPASS_URL = "https://overpass-api.de/api/interpreter"

    def __init__(self):
        super().__init__(
            name="OPENSTREETMAP_INFRA",
            failure_threshold=3,
            recovery_timeout_seconds=60.0,
            request_timeout_seconds=6.0,
            max_retries=2,
        )

    async def fetch_nearby_infrastructure(
        self,
        latitude: float,
        longitude: float,
        radius_km: float = 15.0,
        amenity_types: Optional[List[str]] = None,
        limit: int = 10,
    ) -> List[NormalizedInfrastructure]:
        """
        Queries nearby emergency facilities. Uses Overpass API with local curated fallback.
        """
        radius_m = int(radius_km * 1000)
        types_regex = "|".join(amenity_types or ["hospital", "clinic", "shelter", "fire_station"])

        # Overpass QL query
        query = f"""
        [out:json][timeout:5];
        (
          node["amenity"~"{types_regex}"](around:{radius_m},{latitude},{longitude});
          way["amenity"~"{types_regex}"](around:{radius_m},{latitude},{longitude});
        );
        out center {limit};
        """

        headers = {
            "User-Agent": "SmartLogix-SIH-Disaster-Command/1.0 (sih-disaster-response@smartlogix.org)",
        }

        async def _call(client: httpx.AsyncClient):
            return await client.post(
                self.OVERPASS_URL, data={"data": query}, headers=headers
            )

        try:
            response = await self.execute_with_resilience(_call)
            data = response.json()
            elements = data.get("elements", [])
            if elements:
                return self._normalize_elements(elements, latitude, longitude)
        except Exception as exc:
            logger.debug(f"Overpass API returned ({exc}). Falling back to regional baseline catalog.")

        # Fallback to curated infrastructure
        return self._curated_fallback(latitude, longitude, radius_km)

    def _normalize_elements(
        self, elements: list, req_lat: float, req_lon: float
    ) -> List[NormalizedInfrastructure]:
        """Maps Overpass elements into NormalizedInfrastructure objects."""
        results: List[NormalizedInfrastructure] = []
        for el in elements:
            tags = el.get("tags", {})
            name = tags.get("name") or tags.get("operator") or "Emergency Facility"
            amenity = tags.get("amenity", "shelter")

            lat = el.get("lat") or el.get("center", {}).get("lat")
            lon = el.get("lon") or el.get("center", {}).get("lon")
            if lat is None or lon is None:
                continue

            dist = haversine_km(req_lat, req_lon, lat, lon)
            accessible = tags.get("wheelchair") in ("yes", "designated")
            phone = tags.get("phone") or tags.get("contact:phone")

            results.append(
                NormalizedInfrastructure(
                    id=f"osm_{el.get('id', 'unknown')}",
                    name=name,
                    amenity_type=amenity,
                    latitude=lat,
                    longitude=lon,
                    distance_km=round(dist, 2),
                    contact=phone,
                    accessible=accessible,
                    source=self.name,
                    quality_flag=DataQualityFlag.VERIFIED,
                )
            )

        results.sort(key=lambda x: x.distance_km if x.distance_km is not None else 999.0)
        return results

    def _curated_fallback(
        self, req_lat: float, req_lon: float, radius_km: float
    ) -> List[NormalizedInfrastructure]:
        """Provides verified regional fallback entries ranked by proximity."""
        fallbacks: List[NormalizedInfrastructure] = []
        for item in CURATED_NE_INFRASTRUCTURE:
            dist = haversine_km(req_lat, req_lon, item["latitude"], item["longitude"])
            fallbacks.append(
                NormalizedInfrastructure(
                    id=item["id"],
                    name=item["name"],
                    amenity_type=item["amenity_type"],
                    latitude=item["latitude"],
                    longitude=item["longitude"],
                    distance_km=round(dist, 2),
                    contact=item["contact"],
                    accessible=item["accessible"],
                    capacity=item["capacity"],
                    source="REGIONAL_CURATED_CATALOG",
                    quality_flag=DataQualityFlag.FALLBACK_BASELINE,
                )
            )

        fallbacks.sort(key=lambda x: x.distance_km if x.distance_km is not None else 999.0)
        return fallbacks[:10]
