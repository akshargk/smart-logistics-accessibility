# SQLAlchemy Skill

## Purpose
Use SQLAlchemy 2.x safely with PostgreSQL/PostGIS for the SIH backend.

## Rules
- Prefer SQLAlchemy 2.x typed declarative models and `select()`.
- Keep ORM models separate from Pydantic API schemas.
- Use one request-scoped DB session through FastAPI dependency injection.
- Commit transactions deliberately; rollback on failure.
- Avoid N+1 queries; use appropriate eager loading.
- Add indexes and constraints intentionally.
- Never concatenate untrusted values into SQL.
- Use parameterized SQL and SQLAlchemy expressions.
- Use UTC-aware timestamps.
- Put complex business rules in services, not models/routes.

## Spatial work
Use PostGIS geometry/geography types through the configured SQLAlchemy/PostGIS integration. Spatial queries should use appropriate functions such as `ST_DWithin`, `ST_Intersects`, `ST_Contains`, and `ST_Distance`.

## SIH entities
Users, disaster events, risk zones, predictions, alerts, alert deliveries, evacuation centers, roads, road status, weather observations, routes, audit logs.

## Migrations/testing
All schema changes go through Alembic. Test important queries, transactions, constraints, and spatial behavior.
