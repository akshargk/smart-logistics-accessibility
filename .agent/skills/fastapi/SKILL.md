# FastAPI Skill

## Purpose
Build the SIH disaster early-warning backend with FastAPI using clear, secure, testable APIs.

## Stack
- Python 3.11+
- FastAPI + Uvicorn
- Pydantic 2.x
- SQLAlchemy 2.x
- PostgreSQL/PostGIS
- WebSockets
- Pytest

## Rules
- Organize code by routers, schemas, models, services, dependencies, and configuration.
- Keep route handlers thin; business logic belongs in services.
- Use Pydantic request/response schemas instead of exposing ORM models directly.
- Use dependency injection for DB sessions, authenticated users, and shared services.
- Version public APIs under `/api/v1`.
- Use correct HTTP methods/status codes and consistent error responses.
- Never hardcode secrets, tokens, API keys, or database credentials.
- Read configuration from environment/settings.
- Validate all external data before storing or using it.
- Use async endpoints only where the underlying operations are async.
- Add authentication/authorization to protected endpoints.
- Use UTC timestamps.
- Never fabricate disaster predictions or live data.

## SIH flow
External data -> validation -> risk engine -> risk zone -> alert -> affected users -> evacuation center -> safe route.

## Verification
Run tests, lint/type checks, and a smoke test for every critical API change. Keep OpenAPI documentation accurate.
