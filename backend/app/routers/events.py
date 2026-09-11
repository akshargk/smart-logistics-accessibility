"""
SmartLogix SIH Backend — Disaster Events Router
CRUD for disaster events.
"""
from typing import Optional, List
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from app.database import get_db
from app.models import DisasterEvent, EventStatus, RiskLevel
from app.schemas import DisasterEventCreate, DisasterEventResponse

router = APIRouter(prefix="/api/v1/events", tags=["Disaster Events"])


@router.get("", response_model=List[DisasterEventResponse], summary="List all disaster events")
async def list_events(
    status: Optional[str] = Query(None, description="Filter by status: ACTIVE|MONITORING|RESOLVED"),
    disaster_type: Optional[str] = Query(None, description="Filter by type: FLOOD|LANDSLIDE|..."),
    db: AsyncSession = Depends(get_db),
):
    """
    Returns all registered disaster events, optionally filtered by status or type.
    Demo events are pre-loaded on startup.
    """
    stmt = select(DisasterEvent).order_by(DisasterEvent.created_at.desc())
    if status:
        stmt = stmt.where(DisasterEvent.status == status.upper())
    if disaster_type:
        stmt = stmt.where(DisasterEvent.disaster_type == disaster_type.upper())
    result = await db.execute(stmt)
    return result.scalars().all()


@router.get("/active", response_model=List[DisasterEventResponse], summary="Active events only")
async def list_active_events(db: AsyncSession = Depends(get_db)):
    """Returns only events with status ACTIVE or MONITORING."""
    stmt = (
        select(DisasterEvent)
        .where(DisasterEvent.status.in_(["ACTIVE", "MONITORING"]))
        .order_by(DisasterEvent.created_at.desc())
    )
    result = await db.execute(stmt)
    return result.scalars().all()


@router.get("/{event_id}", response_model=DisasterEventResponse, summary="Get single event")
async def get_event(event_id: str, db: AsyncSession = Depends(get_db)):
    """Returns a single disaster event by ID."""
    result = await db.execute(select(DisasterEvent).where(DisasterEvent.id == event_id))
    event = result.scalar_one_or_none()
    if not event:
        raise HTTPException(status_code=404, detail=f"Event '{event_id}' not found.")
    return event


@router.post("", response_model=DisasterEventResponse, status_code=201, summary="Create disaster event")
async def create_event(payload: DisasterEventCreate, db: AsyncSession = Depends(get_db)):
    """
    Create a new disaster event.
    All events created via API are marked as DEMO by default.
    """
    event = DisasterEvent(
        disaster_type=payload.disaster_type.value,
        name=payload.name,
        description=payload.description,
        latitude=payload.latitude,
        longitude=payload.longitude,
        severity=payload.severity.value,
        radius_km=payload.radius_km,
        status=payload.status.value,
        source=payload.source,
        evacuees=payload.evacuees,
        is_demo=True,
    )
    db.add(event)
    await db.flush()
    await db.refresh(event)

    # Also sync to MongoDB
    try:
        from app.mongodb import get_mongo_db
        m_db = await get_mongo_db()
        await m_db["disaster_events"].insert_one({
            "_id": event.id,
            "id": event.id,
            "disaster_type": event.disaster_type,
            "name": event.name,
            "description": event.description,
            "latitude": event.latitude,
            "longitude": event.longitude,
            "severity": event.severity,
            "radius_km": event.radius_km,
            "status": event.status,
            "source": event.source,
            "evacuees": event.evacuees,
            "is_demo": True,
            "created_at": event.created_at.isoformat() if event.created_at else None,
        })
    except Exception:
        pass

    return event


@router.delete("/{event_id}", status_code=204, summary="Delete disaster event")
async def delete_event(event_id: str, db: AsyncSession = Depends(get_db)):
    """Delete a disaster event by ID."""
    result = await db.execute(select(DisasterEvent).where(DisasterEvent.id == event_id))
    event = result.scalar_one_or_none()
    if not event:
        raise HTTPException(status_code=404, detail=f"Event '{event_id}' not found.")
    await db.delete(event)

    # Also sync deletion to MongoDB
    try:
        from app.mongodb import get_mongo_db
        m_db = await get_mongo_db()
        await m_db["disaster_events"].delete_one({"$or": [{"_id": event_id}, {"id": event_id}]})
    except Exception:
        pass
