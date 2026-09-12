# Pytest Skill

## Purpose
Test the SIH backend, API contracts, database behavior, spatial logic, and real-time alerts.

## Rules
- Use pytest with focused, deterministic tests.
- Keep unit, integration, API, and end-to-end tests distinguishable.
- Use fixtures for app setup, database sessions, authentication, and test data.
- Mock external weather/sensor/disaster providers.
- Never depend on real external APIs in normal tests.
- Test validation boundaries and error responses.
- Test authorization for every protected critical endpoint.
- Test PostGIS spatial queries with realistic geometry fixtures.
- Test disaster -> risk -> alert -> affected-user flow.
- Test WebSocket connect/auth/send/disconnect/reconnect behavior.
- Keep tests isolated and clean up database state.
- Add regression tests for every important bug.

## SIH principle
A green test suite must prove behavior, not merely increase coverage numbers.
