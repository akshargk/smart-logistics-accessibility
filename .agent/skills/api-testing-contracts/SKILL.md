# API Testing & Contracts Skill

## Purpose
Keep FastAPI endpoints and the React client synchronized.

## Rules
- Define request/response contracts with Pydantic.
- Test success and failure status codes.
- Test authentication and authorization.
- Test validation errors and consistent error shapes.
- Test filtering, pagination, and sorting where present.
- Test GeoJSON/spatial responses with realistic fixtures.
- Test disaster, risk, alert, evacuation, and route endpoints.
- Mock external providers.
- Test idempotency for repeatable alert/ingestion operations.
- Test WebSocket contracts separately.
- Use OpenAPI as a contract source where practical.
- Add regression tests when a contract bug is fixed.

## Critical E2E contract
Data -> prediction -> risk zone -> alert -> affected user -> evacuation center -> safe route.
