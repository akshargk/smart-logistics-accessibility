# Data Ingestion Skill

## Purpose
Ingest weather, rainfall, disaster, and sensor data safely into the SIH platform.

## Rules
- Create provider adapters instead of coupling business logic to one API.
- Validate with Pydantic before storage.
- Normalize units, timestamps, field names, and coordinate systems.
- Use UTC internally.
- Record provider/source and freshness metadata.
- Apply timeouts, retries with backoff, and rate-limit handling.
- Never trust remote data.
- Do not allow arbitrary user-controlled URLs to become server-side fetch targets.
- Deduplicate observations and make ingestion idempotent.
- Store raw data only when justified and safe.
- Clearly label LIVE, HISTORICAL, and SIMULATED data in the demo.

## Failure handling
External-provider failure must not crash the whole alert system. Mark data unavailable/stale and continue with safe degradation.
