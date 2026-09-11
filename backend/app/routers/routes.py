"""
SmartLogix SIH Backend — Safe Route Router
POST /api/v1/route  — Get evacuation route for a location
GET  /api/v1/locations — List safe shelter locations
"""
from typing import List
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models import DisasterEvent, SafeLocation
from app.schemas import RouteRequest, SafeRouteResponse, SafeLocationResponse
from app.services.route_service import generate_route, generate_route_async

router = APIRouter(prefix="/api/v1", tags=["Routes & Locations"])


@router.post("/route", response_model=SafeRouteResponse, summary="Get safe evacuation route")
async def get_safe_route(
    payload: RouteRequest,
    db: AsyncSession = Depends(get_db),
):
    """
    Returns a recommended evacuation route from the user's location to the nearest safe shelter.

    - Considers all active safe shelter locations in the database
    - Avoids known disaster zones where possible
    - Respects accessibility preference

    ⚠️ DEMO ROUTE — Not a real-time GPS route. For actual emergencies, follow official guidance.
    """
    # Fetch active safe locations
    safe_stmt = select(SafeLocation).where(SafeLocation.is_active == True)
    safe_result = await db.execute(safe_stmt)
    safe_locs = list(safe_result.scalars().all())

    # Fetch active events (for hazard avoidance calculation)
    event_stmt = select(DisasterEvent).where(DisasterEvent.status.in_(["ACTIVE", "MONITORING"]))
    event_result = await db.execute(event_stmt)
    active_events = list(event_result.scalars().all())

    return await generate_route_async(
        payload.latitude,
        payload.longitude,
        safe_locs,
        active_events,
        prefer_accessible=payload.prefer_accessible,
    )


@router.get("/locations", response_model=List[SafeLocationResponse], summary="List safe shelter locations")
async def list_safe_locations(
    accessible_only: bool = Query(False, description="Only return wheelchair-accessible shelters"),
    db: AsyncSession = Depends(get_db),
):
    """Returns all registered safe shelter / relief camp locations."""
    stmt = select(SafeLocation).where(SafeLocation.is_active == True)
    if accessible_only:
        stmt = stmt.where(SafeLocation.is_accessible == True)
    result = await db.execute(stmt)
    return result.scalars().all()
