"""
SmartLogix SIH Backend — Risk Analysis Engine

Deterministic, explainable risk scoring system.
Architecture is designed so the scoring function can be swapped for an ML model
without changing any API or database code.

Scoring model:
    risk_score = Σ(factor_weight × factor_score) / total_weight

Factors considered:
    1. Distance from disaster event(s) relative to their radius
    2. Severity of the nearest/most severe event
    3. Number of simultaneous hazards
    4. Whether the user is inside vs near vs outside a zone
"""
from datetime import datetime, timezone
from typing import List, Tuple
from app.models import DisasterType, RiskLevel
from app.schemas import RiskFactorDetail, NearbyEvent, RiskAnalysisResponse
from app.services.geo import haversine_km, classify_zone


# ── Severity base scores ──────────────────────────────────────
SEVERITY_BASE: dict[RiskLevel, float] = {
    RiskLevel.LOW: 15.0,
    RiskLevel.MEDIUM: 40.0,
    RiskLevel.HIGH: 70.0,
    RiskLevel.CRITICAL: 95.0,
}

# ── Zone proximity multipliers ────────────────────────────────
ZONE_MULTIPLIER: dict[str, float] = {
    "INSIDE": 1.0,
    "NEAR": 0.55,
    "OUTSIDE": 0.0,
}

# ── Risk level thresholds ─────────────────────────────────────
def score_to_level(score: float) -> RiskLevel:
    if score >= 75:
        return RiskLevel.CRITICAL
    elif score >= 50:
        return RiskLevel.HIGH
    elif score >= 25:
        return RiskLevel.MEDIUM
    else:
        return RiskLevel.LOW


# ── Recommendations per risk level ────────────────────────────
RECOMMENDATIONS: dict[RiskLevel, str] = {
    RiskLevel.LOW: (
        "Stay informed via official channels. No immediate action required. "
        "Keep emergency contacts handy."
    ),
    RiskLevel.MEDIUM: (
        "Monitor the situation closely. Prepare an emergency kit. "
        "Be ready to evacuate if conditions worsen."
    ),
    RiskLevel.HIGH: (
        "⚠️ Move to higher ground or designated shelter immediately. "
        "Avoid flood-prone roads. Follow safe route guidance."
    ),
    RiskLevel.CRITICAL: (
        "🚨 IMMEDIATE EVACUATION REQUIRED. Leave the area now via the recommended route. "
        "Do not wait for further instructions. Contact emergency services if needed."
    ),
}

# ── Alert messages per hazard × level ─────────────────────────
ALERT_TEMPLATES: dict[tuple, tuple[str, str]] = {
    (DisasterType.FLOOD, RiskLevel.HIGH): (
        "⚠️ HIGH FLOOD RISK Near Your Location",
        "Significant flooding detected near you. Move to higher ground immediately "
        "and avoid low-lying roads. Follow the recommended evacuation route.",
    ),
    (DisasterType.FLOOD, RiskLevel.CRITICAL): (
        "🚨 CRITICAL FLOOD EMERGENCY",
        "You are inside an active flood zone. EVACUATE IMMEDIATELY via the safe route. "
        "Do not attempt to cross flooded roads.",
    ),
    (DisasterType.LANDSLIDE, RiskLevel.HIGH): (
        "⚠️ LANDSLIDE RISK Detected",
        "Landslide activity detected near your location. Avoid hilly terrain and "
        "unstable slopes. Move to flat ground and follow the safe route.",
    ),
    (DisasterType.LANDSLIDE, RiskLevel.CRITICAL): (
        "🚨 CRITICAL LANDSLIDE DANGER",
        "You are in an active landslide zone. LEAVE IMMEDIATELY. Do not use mountain roads.",
    ),
    (DisasterType.CYCLONE, RiskLevel.HIGH): (
        "⚠️ CYCLONE WARNING — Seek Shelter",
        "A cyclone is approaching your area. Seek strong, permanent shelter immediately. "
        "Stay away from coastal areas and windows.",
    ),
    (DisasterType.CYCLONE, RiskLevel.CRITICAL): (
        "🚨 SEVERE CYCLONE — IMMEDIATE SHELTER",
        "Severe cyclonic conditions detected. Take shelter in a reinforced structure NOW. "
        "Do not venture outdoors.",
    ),
    (DisasterType.EARTHQUAKE, RiskLevel.HIGH): (
        "⚠️ EARTHQUAKE ACTIVITY Detected",
        "Seismic activity detected near you. Stay away from buildings and avoid bridges. "
        "If indoors: drop, cover and hold on.",
    ),
    (DisasterType.HEAVY_RAIN, RiskLevel.HIGH): (
        "⚠️ HEAVY RAINFALL ALERT",
        "Extremely heavy rainfall detected. Risk of flash flooding and waterlogging. "
        "Avoid low-lying areas and monitor water levels.",
    ),
}

_DEFAULT_ALERT = (
    "⚠️ DISASTER ALERT",
    "A disaster event has been detected near your location. "
    "Follow local authority guidance and consider evacuation.",
)


def get_alert_message(disaster_type: DisasterType, risk_level: RiskLevel) -> tuple[str, str]:
    """Return (title, message) for a given disaster type and risk level."""
    key = (disaster_type, risk_level)
    if key in ALERT_TEMPLATES:
        return ALERT_TEMPLATES[key]
    # Fallback: use HIGH template if CRITICAL not found, vice versa
    fallback_level = RiskLevel.HIGH if risk_level == RiskLevel.CRITICAL else RiskLevel.CRITICAL
    fallback_key = (disaster_type, fallback_level)
    if fallback_key in ALERT_TEMPLATES:
        return ALERT_TEMPLATES[fallback_key]
    return _DEFAULT_ALERT


def analyse_risk(
    user_lat: float,
    user_lon: float,
    active_events: list,  # List[DisasterEvent ORM objects]
) -> RiskAnalysisResponse:
    """
    Analyse risk for a user location given a list of active disaster events.

    Returns a complete RiskAnalysisResponse with score, level, factors, and nearby events.
    """
    if not active_events:
        return RiskAnalysisResponse(
            risk_level=RiskLevel.LOW,
            risk_score=0.0,
            primary_hazard=None,
            reason="No active disaster events in the monitored region.",
            factors=[],
            nearby_events=[],
            recommendation=RECOMMENDATIONS[RiskLevel.LOW],
            is_demo=True,
            analysed_at=datetime.now(timezone.utc),
        )

    nearby_events: List[NearbyEvent] = []
    factors: List[RiskFactorDetail] = []
    total_score = 0.0
    primary_event = None
    max_contribution = 0.0

    for event in active_events:
        dist = haversine_km(user_lat, user_lon, event.latitude, event.longitude)
        zone = classify_zone(dist, event.radius_km)

        nearby_events.append(NearbyEvent(
            event_id=event.id,
            name=event.name,
            disaster_type=DisasterType(event.disaster_type),
            distance_km=round(dist, 2),
            severity=RiskLevel(event.severity),
            zone=zone,
        ))

        if zone == "OUTSIDE":
            continue  # No contribution from events beyond 1.5× radius

        base = SEVERITY_BASE[RiskLevel(event.severity)]
        multiplier = ZONE_MULTIPLIER[zone]

        # Distance-based decay within zone
        if zone == "INSIDE":
            # Closer = higher score (max at epicentre)
            proximity_factor = 1.0 - (dist / event.radius_km) * 0.3
        else:  # NEAR
            proximity_factor = 1.0 - ((dist - event.radius_km) / event.radius_km) * 0.5

        contribution = base * multiplier * proximity_factor
        total_score += contribution

        factor = RiskFactorDetail(
            factor=f"{event.disaster_type} — {event.name}",
            contribution=round(contribution, 1),
            description=(
                f"{zone} zone, {dist:.1f} km away "
                f"(radius: {event.radius_km} km, severity: {event.severity})"
            ),
        )
        factors.append(factor)

        if contribution > max_contribution:
            max_contribution = contribution
            primary_event = event

    # Multi-hazard bonus (compounding risk)
    contributing_events = [e for e in nearby_events if e.zone != "OUTSIDE"]
    if len(contributing_events) > 1:
        bonus = min(15.0, (len(contributing_events) - 1) * 7.0)
        total_score += bonus
        factors.append(RiskFactorDetail(
            factor="Multiple Simultaneous Hazards",
            contribution=round(bonus, 1),
            description=f"{len(contributing_events)} overlapping hazard zones compound the risk.",
        ))

    # Cap at 100
    final_score = min(100.0, round(total_score, 1))
    risk_level = score_to_level(final_score)

    # Build reason string
    if primary_event:
        primary_type = DisasterType(primary_event.disaster_type)
        zone_desc = nearby_events[0].zone if nearby_events else "NEAR"
        reason = (
            f"Primary hazard: {primary_event.name} ({primary_type.value}) — "
            f"you are {zone_desc} the affected zone "
            f"({haversine_km(user_lat, user_lon, primary_event.latitude, primary_event.longitude):.1f} km away). "
        )
        if len(contributing_events) > 1:
            reason += f"Additionally, {len(contributing_events) - 1} other hazard(s) affect this area."
    else:
        primary_type = None
        reason = "All active events are outside your immediate risk zone."

    return RiskAnalysisResponse(
        risk_level=risk_level,
        risk_score=final_score,
        primary_hazard=primary_type if primary_event else None,
        reason=reason,
        factors=sorted(factors, key=lambda f: f.contribution, reverse=True),
        nearby_events=sorted(nearby_events, key=lambda e: e.distance_km),
        recommendation=RECOMMENDATIONS[risk_level],
        is_demo=True,
        analysed_at=datetime.now(timezone.utc),
    )
