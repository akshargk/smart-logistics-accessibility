# Deployment & DevOps Skill

## Purpose
Deploy the SIH application reproducibly and safely.

## Rules
- Containerize backend/services with Docker where appropriate.
- Keep frontend and backend configuration environment-driven.
- Never commit secrets.
- Run database migrations explicitly.
- Use PostgreSQL/PostGIS-compatible infrastructure.
- Configure health/readiness checks.
- Ensure WebSockets are supported by the deployment/proxy.
- Ensure background jobs do not duplicate unexpectedly across replicas.
- Persist database data appropriately.
- Use CI checks for tests, linting, builds, and migration validation.
- Have a rollback plan.
- Run a smoke test after deployment.

## SIH
Prefer reliable, understandable deployment over unnecessary infrastructure complexity.
