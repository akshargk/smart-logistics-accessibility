# SmartLogix — SIH Backend

> **Smart India Hackathon 2026 — Smart Logistics Accessibility / Disaster Management Command Center**

FastAPI backend for the SIH prototype. Provides risk analysis, location-based alerts, safe evacuation routing, and a complete demo dashboard API.

> ⚠️ **All disaster data is SIMULATED** — for SIH demonstration only. Do NOT use for real emergency decisions.

---

## Quick Start

```bash
cd backend

# Create virtual environment (Python 3.12 required — 3.14 has no pydantic-core wheels)
uv venv .venv --python 3.12

# Install dependencies
uv pip install -r requirements.txt --python .venv/Scripts/python.exe

# Copy environment file
copy .env.example .env

# Start server
.venv/Scripts/uvicorn.exe main:app --host 0.0.0.0 --port 8000 --reload
```

Server starts at **http://localhost:8000**

- **API docs**: http://localhost:8000/docs
- **Health check**: http://localhost:8000/health
- **Demo dashboard**: http://localhost:8000/api/v1/demo/dashboard

---

## Frontend

```bash
# From project root
npm install
npm run dev
```

Frontend starts at **http://localhost:5173**

---

## API Endpoints

### Health
| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Backend status + DB connectivity |
| GET | `/api/v1/status` | Same as /health (alias) |

### Disaster Events
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v1/events` | List all events (filter by `status`, `disaster_type`) |
| GET | `/api/v1/events/active` | Active and monitoring events only |
| GET | `/api/v1/events/{id}` | Single event by ID |
| POST | `/api/v1/events` | Create new event |
| DELETE | `/api/v1/events/{id}` | Delete event |

### Risk Analysis
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/v1/risk/analyse` | Analyse risk for a lat/lon → LOW/MEDIUM/HIGH/CRITICAL |
| GET | `/api/v1/risk/zones` | All active risk zones (for map rendering) |

### Alerts
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/v1/alerts/generate` | Generate alerts for a location |
| GET | `/api/v1/alerts` | List alerts (filter by `status`) |
| POST | `/api/v1/alerts/{id}/acknowledge` | Acknowledge an alert |

### Routes & Locations
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/v1/route` | Get evacuation route for a location |
| GET | `/api/v1/locations` | List safe shelter locations |

### Demo / Dashboard
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v1/demo/dashboard` | Full dashboard state for SIH presentation |
| GET | `/api/v1/demo/scenarios` | List 4 demo scenarios |
| POST | `/api/v1/demo/scenario` | Run end-to-end demo scenario |

---

## Demo Scenarios

Run these during the SIH presentation:

```bash
# Scenario 1 — Safe (Coimbatore, far from disasters)
curl -X POST http://localhost:8000/api/v1/demo/scenario \
  -H "Content-Type: application/json" \
  -d '{"scenario": "safe"}'
# Result: LOW risk

# Scenario 2 — Flood (inside Kerala flood zone)
curl -X POST http://localhost:8000/api/v1/demo/scenario \
  -d '{"scenario": "flood"}'
# Result: HIGH risk + flood alert + evacuation route

# Scenario 3 — Landslide (near Wayanad)
curl -X POST http://localhost:8000/api/v1/demo/scenario \
  -d '{"scenario": "landslide"}'
# Result: HIGH risk + landslide warning + route

# Scenario 4 — Multiple Hazards
curl -X POST http://localhost:8000/api/v1/demo/scenario \
  -d '{"scenario": "multi_hazard"}'
# Result: HIGH/CRITICAL risk with compounding factor explanation
```

---

## Architecture

```
USER LOCATION
    ↓
POST /api/v1/risk/analyse
    ↓ Haversine distance to each active event
    ↓ Deterministic scoring (severity × zone × proximity)
    ↓ Multi-hazard compounding bonus
    ↓
RISK LEVEL (LOW / MEDIUM / HIGH / CRITICAL)
    ↓
POST /api/v1/alerts/generate   →  Alert records created in DB
POST /api/v1/route             →  Nearest safe shelter + waypoints
GET  /api/v1/demo/dashboard    →  Aggregated state for frontend
```

### Database

SQLite (`sih_backend.db`) — auto-created on first run.

Tables:
- `disaster_events` — Active disaster events with location + severity + radius
- `safe_locations` — Shelters, hospitals, relief camps
- `alerts` — Generated alerts with status tracking

### Replacing Mock Data with Real Data

The architecture is designed for easy replacement:

1. **Risk engine**: swap `app/services/risk_engine.py::analyse_risk()` with an ML model — same input/output interface
2. **Routing**: swap `app/services/route_service.py::_generate_waypoints()` with Google Maps / OSRM
3. **Disaster data**: seed real NDMA feed into `disaster_events` table
4. **Weather**: add `OPENWEATHER_API_KEY` to `.env` and wire into risk scoring

---

## Running Tests

```bash
# Make sure the server is running on port 8000 first
.venv/Scripts/python.exe tests/test_api.py
# Expected: 24/24 tests passed
```

---

## Environment Variables

See `.env.example`. Required:
- `DATABASE_URL` — SQLite path (default: `sqlite+aiosqlite:///./sih_backend.db`)
- `CORS_ORIGINS` — Comma-separated frontend origins

Optional (mock fallback used if missing):
- `OPENWEATHER_API_KEY`
- `GOOGLE_MAPS_API_KEY`

---

## Project Structure

```
backend/
├── main.py                    # FastAPI app + lifespan startup
├── requirements.txt
├── .env.example
├── app/
│   ├── config.py              # Settings (pydantic-settings)
│   ├── database.py            # Async SQLite + session management
│   ├── models.py              # SQLAlchemy ORM models
│   ├── schemas.py             # Pydantic request/response schemas
│   ├── seed.py                # Demo data seeder
│   ├── routers/
│   │   ├── health.py          # GET /health
│   │   ├── events.py          # /api/v1/events
│   │   ├── risk.py            # /api/v1/risk
│   │   ├── alerts.py          # /api/v1/alerts
│   │   ├── routes.py          # /api/v1/route, /api/v1/locations
│   │   └── demo.py            # /api/v1/demo
│   └── services/
│       ├── geo.py             # Haversine, zone detection, travel time
│       ├── risk_engine.py     # Deterministic scoring + alert templates
│       ├── route_service.py   # Evacuation route generation
│       └── demo_data.py       # Simulation scenarios + seed data
└── tests/
    └── test_api.py            # 24-test async API test suite
```
