"""
SmartLogix SIH Backend — Health Router
GET /health — Quick status check
GET /api/v1/status — Detailed status (same info, aliased)
"""
from datetime import datetime, timezone
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from app.database import get_db
from app.config import settings
from app.schemas import HealthResponse

router = APIRouter(tags=["Health"])


@router.get("/health", response_model=HealthResponse, summary="Backend health check")
async def health_check(db: AsyncSession = Depends(get_db)):
    """
    Returns backend status, version, environment, and database connectivity.
    Use this to verify the backend is running correctly.
    """
    # DB connectivity check
    sqlite_ok = False
    try:
        await db.execute(text("SELECT 1"))
        sqlite_ok = True
    except Exception:
        sqlite_ok = False

    mongo_ok = False
    try:
        from app.mongodb import get_mongo_db, is_mongo_mock
        m_db = await get_mongo_db()
        await m_db["disaster_events"].count_documents({})
        mode_str = "in-memory mock" if is_mongo_mock() else "live"
        mongo_ok = True
        db_status = f"SQLite: {'connected' if sqlite_ok else 'offline'} | MongoDB ({mode_str}): connected"
    except Exception as e:
        db_status = f"SQLite: {'connected' if sqlite_ok else 'offline'} | MongoDB: {str(e)}"

    return HealthResponse(
        status="ok",
        app_name=settings.app_name,
        version=settings.app_version,
        environment=settings.app_env,
        demo_mode=settings.demo_mode,
        database=db_status,
        timestamp=datetime.now(timezone.utc),
    )


@router.get("/api/v1/status", response_model=HealthResponse, summary="API status (alias)")
async def api_status(db: AsyncSession = Depends(get_db)):
    """Alias for /health — returns the same information."""
    return await health_check(db)
