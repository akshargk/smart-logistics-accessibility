"""
SmartLogix SIH Backend — Demo / Dashboard Router

GET  /api/v1/demo/dashboard     — Full dashboard summary for the SIH presentation
POST /api/v1/demo/scenario      — Run a predefined demo scenario end-to-end
GET  /api/v1/demo/scenarios     — List available scenarios
"""
from datetime import datetime, timezone
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.database import get_db
from app.models import DisasterEvent, Alert, SafeLocation, AlertStatus
from app.schemas import (
    DemoScenarioRequest, DemoScenarioResponse, DashboardSummary,
    LocationResponse, AlertResponse, DisasterEventResponse,
)
from app.services.risk_engine import analyse_risk, get_alert_message
from app.services.route_service import generate_route, generate_route_async
from app.services.demo_data import DEMO_SCENARIOS
from app.models import RiskLevel

router = APIRouter(prefix="/api/v1/demo", tags=["Demo / Dashboard"])


@router.get("/dashboard", response_model=DashboardSummary, summary="Full dashboard summary")
async def get_dashboard(db: AsyncSession = Depends(get_db)):
    """
    Returns a comprehensive dashboard state for the SIH presentation:
    - Backend status
    - All active disaster events
    - Recent alerts
    - Safe location count

    Perfect for displaying on the frontend command dashboard during demo.
    """
    # Active events
    events_result = await db.execute(
        select(DisasterEvent).where(DisasterEvent.status.in_(["ACTIVE", "MONITORING"]))
        .order_by(DisasterEvent.created_at.desc())
    )
    active_events = events_result.scalars().all()

    # Recent alerts (last 20)
    alerts_result = await db.execute(
        select(Alert).order_by(Alert.created_at.desc()).limit(20)
    )
    recent_alerts = alerts_result.scalars().all()

    # Count safe locations
    loc_count_result = await db.execute(
        select(func.count()).select_from(SafeLocation).where(SafeLocation.is_active == True)
    )
    safe_loc_count = loc_count_result.scalar() or 0

    # Active alerts count
    active_alert_count_result = await db.execute(
        select(func.count()).select_from(Alert).where(Alert.status == AlertStatus.ACTIVE.value)
    )
    active_alert_count = active_alert_count_result.scalar() or 0

    return DashboardSummary(
        backend_status="operational",
        active_events_count=len(active_events),
        active_alerts_count=active_alert_count,
        safe_locations_count=safe_loc_count,
        demo_mode=True,
        active_events=active_events,
        recent_alerts=recent_alerts,
        timestamp=datetime.now(timezone.utc),
    )


@router.get("/scenarios", summary="List available demo scenarios")
async def list_scenarios():
    """Returns all available demo scenario names and descriptions."""
    return {
        "scenarios": [
            {
                "id": key,
                "description": val["description"],
                "test_latitude": val["latitude"],
                "test_longitude": val["longitude"],
            }
            for key, val in DEMO_SCENARIOS.items()
        ]
    }


@router.post("/scenario", response_model=DemoScenarioResponse, summary="Run a demo scenario")
async def run_scenario(
    payload: DemoScenarioRequest,
    db: AsyncSession = Depends(get_db),
):
    """
    Executes a complete end-to-end SIH demonstration scenario.

    Scenarios available:
    - **safe**: User far from all hazards → LOW risk
    - **flood**: User inside flood zone → HIGH/CRITICAL + alert + route
    - **landslide**: User near landslide area → HIGH risk + alert + route
    - **multi_hazard**: User near multiple hazards → CRITICAL + compounded risk

    Perfect for SIH demos — shows the full system working in one API call.
    """
    scenario_data = DEMO_SCENARIOS[payload.scenario]
    test_lat = scenario_data["latitude"]
    test_lon = scenario_data["longitude"]

    # Fetch all active events
    events_result = await db.execute(
        select(DisasterEvent).where(DisasterEvent.status.in_(["ACTIVE", "MONITORING"]))
    )
    active_events = list(events_result.scalars().all())

    # Run risk analysis
    risk = analyse_risk(test_lat, test_lon, active_events)

    # Build event responses
    event_responses = [
        DisasterEventResponse(
            id=e.id,
            disaster_type=e.disaster_type,
            name=e.name,
            description=e.description,
            latitude=e.latitude,
            longitude=e.longitude,
            severity=e.severity,
            radius_km=e.radius_km,
            status=e.status,
            is_demo=e.is_demo,
            evacuees=e.evacuees,
            source=e.source,
            created_at=e.created_at,
            updated_at=e.updated_at,
        )
        for e in active_events
    ]

    # Generate alerts for HIGH/CRITICAL nearby events
    generated_alerts = []
    import uuid
    alert_levels = {RiskLevel.HIGH, RiskLevel.CRITICAL}

    for nearby in risk.nearby_events:
        if nearby.zone == "OUTSIDE":
            continue
        if nearby.severity not in alert_levels and risk.risk_level not in alert_levels:
            continue

        alert_severity = max(
            [nearby.severity, risk.risk_level],
            key=lambda l: ["LOW", "MEDIUM", "HIGH", "CRITICAL"].index(l.value),
        )
        title, message = get_alert_message(nearby.disaster_type, alert_severity)

        from app.schemas import AlertResponse as AR
        from app.models import AlertStatus
        generated_alerts.append(AR(
            id=str(uuid.uuid4()),
            disaster_event_id=nearby.event_id,
            disaster_type=nearby.disaster_type,
            risk_level=alert_severity,
            title=title,
            message=message,
            user_latitude=test_lat,
            user_longitude=test_lon,
            location_name=f"({test_lat:.4f}, {test_lon:.4f})",
            status=AlertStatus.ACTIVE,
            is_demo=True,
            created_at=datetime.now(timezone.utc),
        ))

    # Generate route (evaluated across scenarios so judges can compare normal vs active disaster routing)
    safe_stmt = select(SafeLocation).where(SafeLocation.is_active == True)
    safe_result = await db.execute(safe_stmt)
    safe_locs = list(safe_result.scalars().all())
    safe_route = None
    if safe_locs:
        # Scenario weather conditions
        rain = 68.0 if payload.scenario in ("flood", "multi_hazard") else (38.0 if payload.scenario == "landslide" else 6.0)
        wind = 45.0 if payload.scenario == "multi_hazard" else 24.0
        safe_route = await generate_route_async(
            test_lat, test_lon, safe_locs, active_events,
            rainfall_mm=rain, wind_speed_kmh=wind,
        )

    return DemoScenarioResponse(
        scenario=payload.scenario,
        description=scenario_data["description"],
        test_location=LocationResponse(latitude=test_lat, longitude=test_lon),
        active_events=event_responses,
        risk_analysis=risk,
        alerts=generated_alerts,
        safe_route=safe_route,
    )
