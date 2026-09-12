# Notifications & Alerts Skill

## Purpose
Design trustworthy disaster alerts and delivery tracking.

## Rules
- Every alert must have hazard type, severity, source, created time, expiry/status, target geography, and traceable origin.
- Clearly distinguish official alerts from AI-generated risk alerts.
- Target users geographically where appropriate.
- Deduplicate repeated alerts.
- Support escalation and expiry.
- Record delivery status.
- Use WebSockets for live in-app delivery; keep a recovery path for missed alerts.
- Apply authentication and authorization.
- Avoid alert spam.
- Keep user language/accessibility preferences in mind.
- Use retries with bounded backoff for delivery failures.
- Keep an audit trail for critical alerts.

## Message design
Make severity and required action immediately understandable. Never hide uncertainty or simulated-data status.
