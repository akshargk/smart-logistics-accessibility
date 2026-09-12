# Background Jobs & Scheduling Skill

## Purpose
Run recurring ingestion, prediction, alert expiry, retries, and cleanup safely.

## Rules
- Keep jobs idempotent.
- Prevent duplicate concurrent execution where necessary.
- Use timeouts and bounded retries with backoff.
- Separate jobs by responsibility.
- Use UTC for schedules/data timestamps.
- Keep DB transactions short.
- Never let one failed provider/job terminate unrelated processing.
- Log job start, completion, duration, failure, and relevant correlation ID.
- Consider multiple-worker duplication before using in-process schedulers.
- Keep prototype architecture simple; introduce Celery/RQ/Dramatiq only when justified.
- Provide manual trigger endpoints/tools for SIH demonstrations, protected by authorization.

## Critical jobs
Weather ingestion, sensor ingestion, risk recalculation, alert expiry, notification retries, stale-data checks, cleanup.
