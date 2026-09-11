import asyncio
from datetime import datetime, timezone

async def test_mongo():
    try:
        from app.services.demo_data import DEMO_EVENTS, DEMO_SAFE_LOCATIONS
        print(f"Loaded {len(DEMO_EVENTS)} Northeast demo events and {len(DEMO_SAFE_LOCATIONS)} Northeast safe locations.")

        import mongomock_motor
        client = mongomock_motor.AsyncMongoMockClient()
        db = client["sih_smart_logistics"]

        # Test insert
        events_col = db["disaster_events"]
        locations_col = db["safe_locations"]

        await events_col.insert_many([{**e, "_id": str(i)} for i, e in enumerate(DEMO_EVENTS)])
        await locations_col.insert_many([{**l, "_id": str(i)} for i, l in enumerate(DEMO_SAFE_LOCATIONS)])

        events_count = await events_col.count_documents({})
        locs_count = await locations_col.count_documents({})

        print(f"MongoDB Mock Success: {events_count} events, {locs_count} safe locations stored.")
        
        # Test query
        first_event = await events_col.find_one({"disaster_type": "FLOOD"})
        print(f"Queried Event: {first_event['name']} at ({first_event['latitude']}, {first_event['longitude']})")
        return True
    except Exception as e:
        print("Error in test_mongo:", e)
        return False

if __name__ == "__main__":
    success = asyncio.run(test_mongo())
    print("Test passed:", success)
