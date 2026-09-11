"""
SmartLogix SIH Backend — Pydantic Schemas (request/response validation)
"""
from pydantic import BaseModel, Field, field_validator, model_validator
from typing import Optional, List
from datetime import datetime
from app.models import DisasterType, RiskLevel, AlertStatus, EventStatus


# ── Location ─────────────────────────────────────────────────

class LocationInput(BaseModel):
    """User location submitted by the frontend."""
    latitude: float = Field(..., ge=-90, le=90, description="Latitude (-90 to 90)")
    longitude: float = Field(..., ge=-180, le=180, description="Longitude (-180 to 180)")
    accuracy_m: Optional[float] = Field(None, ge=0, description="GPS accuracy in metres")
    timestamp: Optional[datetime] = None

    model_config = {"json_schema_extra": {
        "example": {"latitude": 26.18, "longitude": 91.74}
    }}


class LocationResponse(BaseModel):
    latitude: float
    longitude: float
    accuracy_m: Optional[float] = None
    timestamp: Optional[datetime] = None


# ── Disaster Events ──────────────────────────────────────────

class DisasterEventCreate(BaseModel):
    disaster_type: DisasterType
    name: str = Field(..., min_length=3, max_length=200)
    description: Optional[str] = None
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)
    severity: RiskLevel
    radius_km: float = Field(5.0, gt=0, le=500)
    status: EventStatus = EventStatus.ACTIVE
    source: str = "DEMO"
    evacuees: int = Field(0, ge=0)

    model_config = {"json_schema_extra": {
        "example": {
            "disaster_type": "FLOOD",
            "name": "Brahmaputra Basin Flood",
            "description": "Monsoon flooding along riverfront",
            "latitude": 26.185,
            "longitude": 91.745,
            "severity": "HIGH",
            "radius_km": 10.0
        }
    }}


class DisasterEventResponse(BaseModel):
    id: str
    disaster_type: DisasterType
    name: str
    description: Optional[str] = None
    latitude: float
    longitude: float
    severity: RiskLevel
    radius_km: float
    status: EventStatus
    is_demo: bool
    evacuees: int
    source: str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


# ── Risk Analysis ─────────────────────────────────────────────

class RiskAnalysisRequest(BaseModel):
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)
    include_weather: bool = False

    model_config = {"json_schema_extra": {
        "example": {"latitude": 9.93, "longitude": 76.26}
    }}


class RiskFactorDetail(BaseModel):
    factor: str
    contribution: float  # 0-100
    description: str


class NearbyEvent(BaseModel):
    event_id: str
    name: str
    disaster_type: DisasterType
    distance_km: float
    severity: RiskLevel
    zone: str  # INSIDE / NEAR / OUTSIDE


class RiskAnalysisResponse(BaseModel):
    risk_level: RiskLevel
    risk_score: float = Field(..., ge=0, le=100)
    primary_hazard: Optional[DisasterType] = None
    reason: str
    factors: List[RiskFactorDetail] = []
    nearby_events: List[NearbyEvent] = []
    recommendation: str
    is_demo: bool = True
    analysed_at: datetime


# ── Alerts ──────────────────────────────────────────────────

class AlertCreate(BaseModel):
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)

    model_config = {"json_schema_extra": {
        "example": {"latitude": 9.93, "longitude": 76.26}
    }}


class AlertResponse(BaseModel):
    id: str
    disaster_event_id: Optional[str] = None
    disaster_type: DisasterType
    risk_level: RiskLevel
    title: str
    message: str
    user_latitude: Optional[float] = None
    user_longitude: Optional[float] = None
    location_name: Optional[str] = None
    status: AlertStatus
    is_demo: bool
    created_at: datetime
    acknowledged_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


class AlertAcknowledge(BaseModel):
    alert_id: str


# ── Safe Route ───────────────────────────────────────────────

class RouteRequest(BaseModel):
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)
    prefer_accessible: bool = False  # Prefer wheelchair-accessible routes

    model_config = {"json_schema_extra": {
        "example": {"latitude": 26.18, "longitude": 91.74, "prefer_accessible": False}
    }}


class RouteWaypoint(BaseModel):
    latitude: float
    longitude: float
    label: Optional[str] = None


class CandidateRoute(BaseModel):
    route_id: str
    name: str
    destination_name: str
    destination_type: str
    distance_km: float
    estimated_minutes: int
    ml_risk_score: float
    status: str  # SAFE / CAUTION / HAZARD_PRONE / BLOCKED
    is_accessible: bool
    hazards_avoided: int
    safety_verdict: str
    is_recommended: bool
    waypoints: List[RouteWaypoint] = []


class SafeRouteResponse(BaseModel):
    route_id: str
    status: str  # SAFE / CAUTION / HAZARD_PRONE / BLOCKED
    from_location: RouteWaypoint
    to_location: RouteWaypoint
    destination_name: str
    destination_type: str
    distance_km: float
    estimated_minutes: int
    waypoints: List[RouteWaypoint] = []
    hazards_avoided: int
    is_accessible: bool
    safety_notes: List[str] = []
    is_demo: bool = True
    generated_at: datetime
    # ML & Multi-Candidate Extensions
    recommended_route_id: Optional[str] = None
    selection_reason: Optional[str] = None
    ml_risk_score: Optional[float] = None
    candidate_routes: List[CandidateRoute] = []
    ml_telemetry: Optional[dict] = None

    model_config = {"json_schema_extra": {
        "example": {
            "status": "SAFE",
            "destination_name": "Sarusajai Stadium Relief Hub",
            "distance_km": 6.8,
            "estimated_minutes": 16,
            "ml_risk_score": 24.5,
            "recommended_route_id": "candidate_route_1"
        }
    }}


# ── Safe Locations ────────────────────────────────────────────

class SafeLocationResponse(BaseModel):
    id: str
    name: str
    location_type: str
    latitude: float
    longitude: float
    capacity: int
    current_occupancy: int
    is_accessible: bool
    contact: Optional[str] = None
    address: Optional[str] = None
    is_active: bool

    model_config = {"from_attributes": True}


# ── Health ────────────────────────────────────────────────────

class HealthResponse(BaseModel):
    status: str
    app_name: str
    version: str
    environment: str
    demo_mode: bool
    database: str
    timestamp: datetime


# ── Demo / Dashboard ──────────────────────────────────────────

class DemoScenarioRequest(BaseModel):
    scenario: str = Field(..., description="safe | flood | landslide | multi_hazard")

    @field_validator("scenario")
    @classmethod
    def validate_scenario(cls, v: str) -> str:
        valid = {"safe", "flood", "landslide", "multi_hazard"}
        if v not in valid:
            raise ValueError(f"scenario must be one of: {', '.join(valid)}")
        return v


class DemoScenarioResponse(BaseModel):
    scenario: str
    description: str
    test_location: LocationResponse
    active_events: List[DisasterEventResponse]
    risk_analysis: RiskAnalysisResponse
    alerts: List[AlertResponse]
    safe_route: Optional[SafeRouteResponse] = None
    disclaimer: str = (
        "⚠️ This is DEMO/SIMULATION data for the Smart India Hackathon prototype. "
        "Do NOT use for real emergency decisions."
    )


class DashboardSummary(BaseModel):
    backend_status: str
    active_events_count: int
    active_alerts_count: int
    safe_locations_count: int
    demo_mode: bool
    active_events: List[DisasterEventResponse]
    recent_alerts: List[AlertResponse]
    disclaimer: str = (
        "⚠️ DEMO DATA — Smart India Hackathon prototype. Not real emergency data."
    )
    timestamp: datetime
