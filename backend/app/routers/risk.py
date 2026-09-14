"""
SmartLogix SIH Backend — Risk Analysis Router
POST /api/v1/risk/analyse — Analyse risk for a given location
GET  /api/v1/risk/zones   — Get all active risk zones
"""
from datetime import datetime, timezone
from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models import DisasterEvent
from app.schemas import RiskAnalysisRequest, RiskAnalysisResponse, NearbyEvent
from app.services.risk_engine import analyse_risk
from app.services.geo import haversine_km, classify_zone
from app.models import DisasterType, RiskLevel

router = APIRouter(prefix="/api/v1/risk", tags=["Risk Analysis"])


@router.post("/analyse", response_model=RiskAnalysisResponse, summary="Analyse risk for location")
async def analyse_location_risk(
    payload: RiskAnalysisRequest,
    db: AsyncSession = Depends(get_db),
):
    """
    Core endpoint: given a latitude/longitude, returns a complete risk assessment.

    The engine:
    - Fetches all active disaster events from the database
    - Calculates distance to each event
    - Applies the deterministic scoring algorithm
    - Returns risk level (LOW/MEDIUM/HIGH/CRITICAL), score, and explanatory factors

    ⚠️ DEMO MODE: Results are based on simulated disaster data.
    """
    stmt = select(DisasterEvent).where(DisasterEvent.status.in_(["ACTIVE", "MONITORING"]))
    result = await db.execute(stmt)
    active_events = result.scalars().all()

    resp = analyse_risk(payload.latitude, payload.longitude, list(active_events))

    if payload.include_weather:
        try:
            from app.ingestion.service import DataIngestionService
            from app.schemas import RiskFactorDetail
            weather = await DataIngestionService.get_instance().get_weather(
                payload.latitude, payload.longitude
            )
            if weather.precipitation_mm_per_hr > 5.0 or weather.wind_speed_kmh > 40.0:
                resp.factors.append(
                    RiskFactorDetail(
                        factor=f"Live Weather ({weather.source})",
                        contribution=round(min(20.0, weather.precipitation_mm_per_hr * 0.5), 1),
                        description=f"{weather.weather_condition}: {weather.precipitation_mm_per_hr} mm/h rain, {weather.wind_speed_kmh} km/h wind.",
                    )
                )
        except Exception:
            pass

    return resp


@router.get("/zones", summary="List all active risk zones")
async def list_risk_zones(db: AsyncSession = Depends(get_db)):
    """
    Returns all active disaster events as risk zones — suitable for map rendering.
    Each zone includes centre coordinates, radius, severity, and type.
    """
    stmt = select(DisasterEvent).where(DisasterEvent.status.in_(["ACTIVE", "MONITORING"]))
    result = await db.execute(stmt)
    events = result.scalars().all()

    zones = [
        {
            "id": e.id,
            "name": e.name,
            "disaster_type": e.disaster_type,
            "latitude": e.latitude,
            "longitude": e.longitude,
            "radius_km": e.radius_km,
            "severity": e.severity,
            "status": e.status,
            "evacuees": e.evacuees,
            "is_demo": e.is_demo,
        }
        for e in events
    ]

    return {
        "count": len(zones),
        "zones": zones,
        "is_demo": True,
        "fetched_at": datetime.now(timezone.utc).isoformat(),
    }
