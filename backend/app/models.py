"""
SmartLogix SIH Backend — Domain Models (SQLAlchemy ORM)
"""
import uuid
from datetime import datetime
from sqlalchemy import (
    String, Float, Integer, Boolean, Text, DateTime, Enum as SAEnum
)
from sqlalchemy.orm import Mapped, mapped_column
from app.database import Base
import enum


# ── Enums ────────────────────────────────────────────────────

class DisasterType(str, enum.Enum):
    FLOOD = "FLOOD"
    LANDSLIDE = "LANDSLIDE"
    EARTHQUAKE = "EARTHQUAKE"
    CYCLONE = "CYCLONE"
    HEAVY_RAIN = "HEAVY_RAIN"
    STORM = "STORM"
    DROUGHT = "DROUGHT"
    WILDFIRE = "WILDFIRE"


class RiskLevel(str, enum.Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"


class AlertStatus(str, enum.Enum):
    ACTIVE = "ACTIVE"
    ACKNOWLEDGED = "ACKNOWLEDGED"
    RESOLVED = "RESOLVED"


class EventStatus(str, enum.Enum):
    ACTIVE = "ACTIVE"
    MONITORING = "MONITORING"
    RESOLVED = "RESOLVED"


# ── ORM Models ───────────────────────────────────────────────

class DisasterEvent(Base):
    """A disaster event in the system."""
    __tablename__ = "disaster_events"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    disaster_type: Mapped[str] = mapped_column(SAEnum(DisasterType), nullable=False)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=True)
    latitude: Mapped[float] = mapped_column(Float, nullable=False)
    longitude: Mapped[float] = mapped_column(Float, nullable=False)
    severity: Mapped[str] = mapped_column(SAEnum(RiskLevel), nullable=False)
    radius_km: Mapped[float] = mapped_column(Float, default=5.0)  # affected radius in km
    status: Mapped[str] = mapped_column(SAEnum(EventStatus), default=EventStatus.ACTIVE)
    is_demo: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    source: Mapped[str] = mapped_column(String(100), default="DEMO")
    evacuees: Mapped[int] = mapped_column(Integer, default=0)


class SafeLocation(Base):
    """A pre-registered safe shelter or evacuation destination."""
    __tablename__ = "safe_locations"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    location_type: Mapped[str] = mapped_column(String(50), default="SHELTER")  # SHELTER, HOSPITAL, RELIEF_CAMP
    latitude: Mapped[float] = mapped_column(Float, nullable=False)
    longitude: Mapped[float] = mapped_column(Float, nullable=False)
    capacity: Mapped[int] = mapped_column(Integer, default=0)
    current_occupancy: Mapped[int] = mapped_column(Integer, default=0)
    is_accessible: Mapped[bool] = mapped_column(Boolean, default=True)  # wheelchair-accessible
    contact: Mapped[str] = mapped_column(String(200), nullable=True)
    address: Mapped[str] = mapped_column(String(500), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class Alert(Base):
    """An alert generated for a risk situation."""
    __tablename__ = "alerts"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    disaster_event_id: Mapped[str] = mapped_column(String(36), nullable=True)
    disaster_type: Mapped[str] = mapped_column(SAEnum(DisasterType), nullable=False)
    risk_level: Mapped[str] = mapped_column(SAEnum(RiskLevel), nullable=False)
    title: Mapped[str] = mapped_column(String(300), nullable=False)
    message: Mapped[str] = mapped_column(Text, nullable=False)
    user_latitude: Mapped[float] = mapped_column(Float, nullable=True)
    user_longitude: Mapped[float] = mapped_column(Float, nullable=True)
    location_name: Mapped[str] = mapped_column(String(200), nullable=True)
    status: Mapped[str] = mapped_column(SAEnum(AlertStatus), default=AlertStatus.ACTIVE)
    is_demo: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    acknowledged_at: Mapped[datetime] = mapped_column(DateTime, nullable=True)
