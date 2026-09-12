# Database Architecture Skill

## Purpose
Maintain a traceable PostgreSQL/PostGIS data model for the complete SIH workflow.

## Core entities
Users, notification_preferences, disaster_events, risk_zones, predictions, alerts, alert_deliveries, evacuation_centers, roads, road_status, weather_observations, routes, audit_logs.

## Rules
- Define primary/foreign keys and appropriate uniqueness constraints.
- Add timestamps and status fields intentionally.
- Use spatial indexes for spatial columns.
- Use relational indexes for common filters.
- Preserve provenance from input data to prediction and alert.
- Keep alert delivery records separate from alert definitions.
- Use transactions for critical multi-step state changes.
- Prevent duplicate alerts with database/application safeguards.
- Use Alembic for schema evolution.
- Avoid storing secrets unnecessarily.
- Design for testability and backup/recovery.

## Traceability
External Data -> Prediction -> Risk Zone -> Alert -> Affected User -> Evacuation Center -> Safe Route.
