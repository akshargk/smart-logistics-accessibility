# Frontend ↔ Backend Integration Skill

## Purpose
Keep the React/Vite frontend and FastAPI backend consistent and reliable.

## Rules
- Use environment variables for backend URLs.
- Centralize API calls in a client/service layer.
- Keep TypeScript types synchronized with Pydantic/OpenAPI contracts.
- Handle loading, empty, error, and success states.
- Never expose backend secrets in frontend code.
- Store/authenticate user state safely.
- Enforce role-aware UI but never rely on UI for authorization.
- Render GeoJSON safely and consistently.
- Handle browser geolocation permissions and failures.
- Manage WebSocket lifecycle, reconnect, and missed-alert recovery.
- Keep the existing Vite/React project structure; do not create an unnecessary second frontend folder.
- Build accessible, responsive disaster dashboards.

## Critical screens
Risk map, active alerts, affected area, evacuation centers, safe route, prediction explanation, data-source/freshness indicators.
