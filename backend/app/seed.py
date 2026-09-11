"""
SmartLogix SIH Backend — Database Seeding
Populates both SQLite and MongoDB with Northeast India demo disaster events and safe locations.
"""
import logging
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, delete
from app.models import DisasterEvent, SafeLocation
from app.services.demo_data import DEMO_EVENTS, DEMO_SAFE_LOCATIONS

logger = logging.getLogger(__name__)


async def seed_demo_data(db: AsyncSession) -> None:
    """
    Seed the SQLite database with Northeast India demo data.
    Updates demo records so the database reflects Northeast India.
    """
    # Delete previous demo events to upgrade to Northeast India
    await db.execute(delete(DisasterEvent).where(DisasterEvent.is_demo == True))
    logger.info("Seeding Northeast India demo disaster events...")
    for evt_data in DEMO_EVENTS:
        event = DisasterEvent(**evt_data, is_demo=True)
        db.add(event)
    logger.info(f"  ✓ Added {len(DEMO_EVENTS)} Northeast India disaster events to SQLite")

    # Update safe locations
    await db.execute(delete(SafeLocation))
    logger.info("Seeding Northeast India safe locations...")
    for loc_data in DEMO_SAFE_LOCATIONS:
        loc = SafeLocation(**loc_data)
        db.add(loc)
    logger.info(f"  ✓ Added {len(DEMO_SAFE_LOCATIONS)} Northeast India safe locations to SQLite")

    await db.commit()
    logger.info("SQLite database seeding complete.")
