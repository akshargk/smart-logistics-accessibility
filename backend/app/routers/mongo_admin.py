"""
SmartLogix SIH Backend — MongoDB Administration & Diagnostics Router
GET /api/v1/mongo/stats — Inspect MongoDB collections and document counts
POST /api/v1/mongo/seed — Trigger re-seeding of Northeast India data
"""
from fastapi import APIRouter, HTTPException
from datetime import datetime, timezone
from app.mongodb import get_mongo_db, is_mongo_mock, seed_mongo_data
from app.config import settings

router = APIRouter(prefix="/api/v1/mongo", tags=["MongoDB"])


@router.get("/stats", summary="MongoDB collection statistics")
async def mongo_stats():
    """
    Returns live statistics on MongoDB collections, document counts,
    and driver status (live Atlas cluster vs in-memory mock).
    """
    try:
        db = await get_mongo_db()
        events_count = await db["disaster_events"].count_documents({})
        shelters_count = await db["safe_locations"].count_documents({})
        alerts_count = await db["alerts"].count_documents({})

        # Query sample documents for proof of Northeast India data
        sample_event = await db["disaster_events"].find_one({}, {"_id": 0, "name": 1, "disaster_type": 1, "severity": 1, "latitude": 1, "longitude": 1})
        sample_shelter = await db["safe_locations"].find_one({}, {"_id": 0, "name": 1, "latitude": 1, "longitude": 1, "capacity": 1, "is_accessible": 1})

        return {
            "status": "connected",
            "database_name": getattr(settings, "mongodb_database", "smartlogix"),
            "mode": "in-memory mock" if is_mongo_mock() else "live",
            "is_mock": is_mongo_mock(),
            "collections": {
                "disaster_events": events_count,
                "safe_locations": shelters_count,
                "alerts": alerts_count,
            },
            "sample_event": sample_event,
            "sample_shelter": sample_shelter,
            "region": "Northeast India",
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"MongoDB error: {str(e)}")


@router.post("/seed", summary="Re-seed MongoDB with Northeast India data")
async def mongo_reseed():
    """Deterministic re-seed of Northeast India data into MongoDB."""
    try:
        db = await get_mongo_db()
        await seed_mongo_data(db)
        events_count = await db["disaster_events"].count_documents({})
        shelters_count = await db["safe_locations"].count_documents({})
        return {
            "status": "success",
            "message": "Northeast India demo data re-seeded into MongoDB",
            "counts": {
                "disaster_events": events_count,
                "safe_locations": shelters_count,
            },
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Seeding failed: {str(e)}")
