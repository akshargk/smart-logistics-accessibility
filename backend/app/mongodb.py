"""
SmartLogix SIH Backend — MongoDB Database Layer
Connects to MongoDB using Motor async driver, with automatic fallback to mongomock-motor.
"""
import logging
import uuid
from datetime import datetime, timezone
from typing import Optional, List, Dict, Any

from app.config import settings
from app.services.demo_data import DEMO_EVENTS, DEMO_SAFE_LOCATIONS

logger = logging.getLogger(__name__)

# Global client and db
_mongo_client = None
_mongo_db = None
_is_mock = False


async def init_mongodb():
    """
    Initializes the MongoDB connection.
    Attempts live connection to MongoDB URL; falls back to mongomock-motor if offline.
    """
    global _mongo_client, _mongo_db, _is_mock
    
    mongo_url = settings.effective_mongodb_url
    db_name = settings.effective_mongodb_database
    
    try:
        from motor.motor_asyncio import AsyncIOMotorClient
        import certifi

        client_kwargs = {
            "serverSelectionTimeoutMS": 5000,
        }
        if "mongodb+srv://" in mongo_url or "ssl=true" in mongo_url.lower() or "tls=true" in mongo_url.lower():
            client_kwargs["tlsCAFile"] = certifi.where()

        client = AsyncIOMotorClient(mongo_url, **client_kwargs)
        # Ping the server
        await client.admin.command('ping')
        _mongo_client = client
        _mongo_db = client[db_name]
        _is_mock = False
        logger.info(f"Connected to live MongoDB at {mongo_url}, database: {db_name}")
    except Exception as e:
        logger.warning(f"Could not connect to live MongoDB ({e}). Using mongomock-motor async client.")
        import mongomock_motor
        _mongo_client = mongomock_motor.AsyncMongoMockClient()
        _mongo_db = _mongo_client[db_name]
        _is_mock = True
        logger.info("Initialized in-memory MongoDB async database (mongomock-motor).")
    
    # Create indexes for high-performance querying
    try:
        await _mongo_db["disaster_events"].create_index([("status", 1), ("created_at", -1)])
        await _mongo_db["disaster_events"].create_index([("latitude", 1), ("longitude", 1)])
        await _mongo_db["safe_locations"].create_index([("is_active", 1), ("is_accessible", 1)])
        await _mongo_db["alerts"].create_index([("status", 1), ("created_at", -1)])
        logger.info("   ✓ MongoDB indexes created on events, safe_locations, and alerts")
    except Exception as idx_err:
        logger.debug(f"Index creation note: {idx_err}")

    # Seed Northeast India demo data
    await seed_mongo_data(_mongo_db)
    return _mongo_db


async def get_mongo_db():
    """Dependency / accessor for MongoDB database instance."""
    global _mongo_db
    if _mongo_db is None:
        await init_mongodb()
    return _mongo_db


def is_mongo_mock() -> bool:
    return _is_mock


async def seed_mongo_data(db):
    """
    Seeds the MongoDB database with Northeast India demo events and safe shelters.
    """
    events_col = db["disaster_events"]
    locations_col = db["safe_locations"]

    # Clear and re-seed to ensure clean Northeast India data
    await events_col.delete_many({"is_demo": True})
    now = datetime.now(timezone.utc).isoformat()

    event_docs = []
    for evt in DEMO_EVENTS:
        doc = {
            "_id": str(uuid.uuid4()),
            "id": str(uuid.uuid4()),
            **evt,
            "is_demo": True,
            "created_at": now,
            "updated_at": now,
        }
        # keep id and _id synchronized
        doc["id"] = doc["_id"]
        event_docs.append(doc)

    if event_docs:
        await events_col.insert_many(event_docs)
        logger.info(f"Seeded {len(event_docs)} Northeast India disaster events into MongoDB.")

    # Safe locations
    await locations_col.delete_many({})
    loc_docs = []
    for loc in DEMO_SAFE_LOCATIONS:
        doc = {
            "_id": str(uuid.uuid4()),
            "id": str(uuid.uuid4()),
            **loc,
            "is_active": True,
            "created_at": now,
        }
        doc["id"] = doc["_id"]
        loc_docs.append(doc)

    if loc_docs:
        await locations_col.insert_many(loc_docs)
        logger.info(f"Seeded {len(loc_docs)} Northeast India safe locations into MongoDB.")


# ── MongoDB Repository Helpers ─────────────────────────────────

async def mongo_get_active_events(db) -> List[Dict[str, Any]]:
    col = db["disaster_events"]
    cursor = col.find({"status": {"$in": ["ACTIVE", "MONITORING"]}}).sort("created_at", -1)
    return await cursor.to_list(length=100)


async def mongo_get_all_events(db, status=None, disaster_type=None) -> List[Dict[str, Any]]:
    col = db["disaster_events"]
    query = {}
    if status:
        query["status"] = status.upper()
    if disaster_type:
        query["disaster_type"] = disaster_type.upper()
    cursor = col.find(query).sort("created_at", -1)
    return await cursor.to_list(length=100)


async def mongo_get_safe_locations(db, accessible_only: bool = False) -> List[Dict[str, Any]]:
    col = db["safe_locations"]
    query = {"is_active": True}
    if accessible_only:
        query["is_accessible"] = True
    cursor = col.find(query)
    return await cursor.to_list(length=100)


async def mongo_insert_alert(db, alert_data: Dict[str, Any]) -> Dict[str, Any]:
    col = db["alerts"]
    alert_id = str(uuid.uuid4())
    doc = {
        "_id": alert_id,
        "id": alert_id,
        **alert_data,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "acknowledged_at": None,
    }
    await col.insert_one(doc)
    return doc


async def mongo_get_alerts(db, status: Optional[str] = None) -> List[Dict[str, Any]]:
    col = db["alerts"]
    query = {}
    if status:
        query["status"] = status.upper()
    cursor = col.find(query).sort("created_at", -1)
    return await cursor.to_list(length=100)


async def mongo_acknowledge_alert(db, alert_id: str) -> Optional[Dict[str, Any]]:
    col = db["alerts"]
    now = datetime.now(timezone.utc).isoformat()
    result = await col.find_one_and_update(
        {"$or": [{"_id": alert_id}, {"id": alert_id}]},
        {"$set": {"status": "ACKNOWLEDGED", "acknowledged_at": now}},
        return_document=True
    )
    return result
