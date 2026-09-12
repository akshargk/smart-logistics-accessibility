# Observability & Monitoring Skill

## Purpose
Make the disaster platform diagnosable during development and an SIH demo.

## Rules
- Use structured logs.
- Include request/correlation IDs where practical.
- Never log passwords, tokens, or unnecessary personal data.
- Track API latency/error rate, database failures, external-provider failures, job failures, WebSocket connections, alert delivery, and AI inference failures.
- Keep metrics labels low-cardinality.
- Separate audit logs from ordinary application logs.
- Provide health and readiness checks.
- Surface stale data clearly.
- Preserve enough context to trace External Data -> Prediction -> Risk Zone -> Alert -> Delivery.
- Fail gracefully and show useful user-facing status.

## Demo
The dashboard should make LIVE/HISTORICAL/SIMULATED source state and system health obvious without exposing secrets.
