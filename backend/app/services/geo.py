"""
SmartLogix SIH Backend — Geographic Utilities
Haversine distance, zone detection, nearest-location finder.
"""
import math
from typing import Tuple, List, TypeVar, Optional


def haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Calculate great-circle distance between two points on Earth.
    Returns distance in kilometres using the Haversine formula.
    """
    R = 6371.0  # Earth radius in km

    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)

    a = math.sin(dphi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2) ** 2
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


def classify_zone(distance_km: float, radius_km: float) -> str:
    """
    Classify a user's proximity to a disaster event.

    Returns:
        INSIDE  — user is within the disaster radius
        NEAR    — user is within 1.5× the radius (warning buffer)
        OUTSIDE — user is beyond the warning buffer
    """
    if distance_km <= radius_km:
        return "INSIDE"
    elif distance_km <= radius_km * 1.5:
        return "NEAR"
    else:
        return "OUTSIDE"


T = TypeVar("T")


def find_nearest(
    user_lat: float,
    user_lon: float,
    items: List[T],
    lat_attr: str = "latitude",
    lon_attr: str = "longitude",
) -> Optional[Tuple[T, float]]:
    """
    Find the nearest item from a list, returning (item, distance_km).
    Returns None if items is empty.
    """
    if not items:
        return None
    nearest = min(
        items,
        key=lambda item: haversine_km(
            user_lat, user_lon,
            getattr(item, lat_attr),
            getattr(item, lon_attr),
        ),
    )
    dist = haversine_km(user_lat, user_lon, getattr(nearest, lat_attr), getattr(nearest, lon_attr))
    return nearest, dist


def estimate_travel_minutes(distance_km: float, speed_kmh: float = 30.0) -> int:
    """Estimate travel time in minutes given distance and average speed."""
    return max(1, int((distance_km / speed_kmh) * 60))
