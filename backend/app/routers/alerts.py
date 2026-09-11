"""
SmartLogix SIH Backend — Alerts Router
POST /api/v1/alerts/generate  — Generate alerts for a given location
GET  /api/v1/alerts           — List recent alerts
POST /api/v1/alerts/{id}/acknowledge — Acknowledge an alert
"""
from typing import List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models import DisasterEvent, Alert, AlertStatus
from app.schemas import AlertCreate, AlertResponse, AlertAcknowledge
from app.services.risk_engine import analyse_risk, get_alert_message
from app.models import DisasterType, RiskLevel
from app.services.geo import haversine_km, classify_zone
import uuid

router = APIRouter(prefix="/api/v1/alerts", tags=["Alerts"])


@router.post(
    "/generate",
    response_model=List[AlertResponse],
    status_code=201,
    summary="Generate alerts for a location",
)
async def generate_alerts(
    payload: AlertCreate,
    db: AsyncSession = Depends(get_db),
):
    """
    Given a user location, generates alerts for any HIGH or CRITICAL risk events nearby.

    Logic:
    1. Run risk analysis for the location
    2. For each nearby HIGH/CRITICAL event, create an alert record
    3. Return all generated alerts

    ⚠️ DEMO MODE — alerts are based on simulated disaster data.
    """
    # Get active events
    stmt = select(DisasterEvent).where(DisasterEvent.status.in_(["ACTIVE", "MONITORING"]))
    result = await db.execute(stmt)
    active_events = list(result.scalars().all())

    # Run risk analysis
    risk = analyse_risk(payload.latitude, payload.longitude, active_events)

    # Only generate alerts for HIGH/CRITICAL nearby events
    alert_levels = {RiskLevel.HIGH, RiskLevel.CRITICAL}
    created_alerts = []

    for nearby in risk.nearby_events:
        if nearby.zone == "OUTSIDE":
            continue
        if nearby.severity not in alert_levels and risk.risk_level not in alert_levels:
            continue

        # Get alert template
        alert_severity = max(
            [nearby.severity, risk.risk_level],
            key=lambda l: ["LOW", "MEDIUM", "HIGH", "CRITICAL"].index(l.value),
        )
        title, message = get_alert_message(nearby.disaster_type, alert_severity)

        alert = Alert(
            id=str(uuid.uuid4()),
            disaster_event_id=nearby.event_id,
            disaster_type=nearby.disaster_type.value,
            risk_level=alert_severity.value,
            title=title,
            message=message,
            user_latitude=payload.latitude,
            user_longitude=payload.longitude,
            location_name=f"({payload.latitude:.4f}, {payload.longitude:.4f})",
            status=AlertStatus.ACTIVE.value,
            is_demo=True,
        )
        db.add(alert)
        created_alerts.append(alert)

    if not created_alerts:
        # No high-risk alerts needed — return an informational alert
        level_name = risk.risk_level.value
        alert = Alert(
            id=str(uuid.uuid4()),
            disaster_event_id=None,
            disaster_type="FLOOD",  # Generic
            risk_level=risk.risk_level.value,
            title=f"ℹ️ {level_name} RISK — Area Monitored",
            message=(
                f"Current risk level at your location is {level_name}. "
                f"{risk.recommendation}"
            ),
            user_latitude=payload.latitude,
            user_longitude=payload.longitude,
            location_name=f"({payload.latitude:.4f}, {payload.longitude:.4f})",
            status=AlertStatus.ACTIVE.value,
            is_demo=True,
        )
        db.add(alert)
        created_alerts.append(alert)

    await db.flush()
    for a in created_alerts:
        await db.refresh(a)

    # Also sync alerts to MongoDB
    try:
        from app.mongodb import get_mongo_db
        m_db = await get_mongo_db()
        for a in created_alerts:
            await m_db["alerts"].insert_one({
                "_id": a.id,
                "id": a.id,
                "disaster_event_id": a.disaster_event_id,
                "disaster_type": a.disaster_type,
                "risk_level": a.risk_level,
                "title": a.title,
                "message": a.message,
                "user_latitude": a.user_latitude,
                "user_longitude": a.user_longitude,
                "location_name": a.location_name,
                "status": a.status,
                "is_demo": True,
                "created_at": a.created_at.isoformat() if a.created_at else None,
                "acknowledged_at": None,
            })
    except Exception:
        pass

    return created_alerts


@router.get("", response_model=List[AlertResponse], summary="List recent alerts")
async def list_alerts(
    status: Optional[str] = Query(None, description="Filter by: ACTIVE|ACKNOWLEDGED|RESOLVED"),
    limit: int = Query(50, ge=1, le=200),
    db: AsyncSession = Depends(get_db),
):
    """Returns recent alerts, newest first. Filter by status if needed."""
    stmt = select(Alert).order_by(Alert.created_at.desc()).limit(limit)
    if status:
        stmt = stmt.where(Alert.status == status.upper())
    result = await db.execute(stmt)
    return result.scalars().all()


@router.post("/{alert_id}/acknowledge", response_model=AlertResponse, summary="Acknowledge an alert")
async def acknowledge_alert(alert_id: str, db: AsyncSession = Depends(get_db)):
    """Mark an alert as acknowledged."""
    result = await db.execute(select(Alert).where(Alert.id == alert_id))
    alert = result.scalar_one_or_none()
    if not alert:
        raise HTTPException(status_code=404, detail=f"Alert '{alert_id}' not found.")
    if alert.status == AlertStatus.ACKNOWLEDGED.value:
        raise HTTPException(status_code=409, detail="Alert already acknowledged.")
    alert.status = AlertStatus.ACKNOWLEDGED.value
    alert.acknowledged_at = datetime.now(timezone.utc)
    await db.flush()
    await db.refresh(alert)

    # Also sync acknowledgment to MongoDB
    try:
        from app.mongodb import mongo_acknowledge_alert, get_mongo_db
        m_db = await get_mongo_db()
        await mongo_acknowledge_alert(m_db, alert_id)
    except Exception:
        pass

    return alert
