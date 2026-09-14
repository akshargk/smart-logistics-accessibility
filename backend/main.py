"""
SmartLogix SIH Backend — Main Application Entry Point

FastAPI application for the Smart India Hackathon 2026 prototype:
Smart Logistics Accessibility / Disaster Management Command Center

Run with:
    uvicorn main:app --reload --port 8000
"""
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.config import settings
from app.database import init_db, AsyncSessionLocal
from app.seed import seed_demo_data
from app.routers import health, events, risk, alerts, routes, demo, mongo_admin, data_ingestion

# ── Logging ───────────────────────────────────────────────────
logging.basicConfig(
    level=logging.DEBUG if settings.debug else logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger(__name__)


# ── Lifespan: startup / shutdown ──────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info(f"🚀 Starting {settings.app_name} v{settings.app_version}")
    logger.info(f"   Environment : {settings.app_env}")
    logger.info(f"   Demo mode   : {settings.demo_mode}")
    logger.info(f"   Database    : {settings.database_url}")

    # Create tables
    await init_db()
    logger.info("   ✓ SQLite tables initialised")

    # Seed demo data
    async with AsyncSessionLocal() as db:
        await seed_demo_data(db)

    # Initialize and seed MongoDB
    from app.mongodb import init_mongodb
    await init_mongodb()
    logger.info("   ✓ MongoDB initialised & Northeast India data seeded")

    logger.info("   ✓ Demo data loaded")
    logger.info(f"   ✓ API docs   : http://localhost:{settings.port}/docs")
    logger.info(f"   ✓ Health     : http://localhost:{settings.port}/health")
    logger.info("   Backend ready.\n")

    yield

    logger.info("Shutting down...")
    from app.ingestion.service import DataIngestionService
    await DataIngestionService.get_instance().close()


# ── Application ───────────────────────────────────────────────
app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description=(
        "**Smart India Hackathon 2026 — Smart Logistics Accessibility Prototype**\n\n"
        "A disaster management command centre backend providing:\n"
        "- 🗺️ Real-time risk zone analysis\n"
        "- 🚨 Location-aware alerts\n"
        "- 🛣️ Safe evacuation route recommendations\n"
        "- ♿ Accessibility-aware routing\n"
        "- 📊 Dashboard API for the SIH demo\n\n"
        "> ⚠️ **PROTOTYPE** — All disaster data is simulated for the SIH presentation."
    ),
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# ── CORS ──────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_origin_regex=r"^https:\/\/.*\.vercel\.app$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Global exception handler ──────────────────────────────────
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled error on {request.url}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "error": "internal_server_error",
            "message": "An unexpected error occurred. Please try again.",
            "path": str(request.url),
        },
    )


# ── Routers ───────────────────────────────────────────────────
app.include_router(health.router)
app.include_router(events.router)
app.include_router(risk.router)
app.include_router(alerts.router)
app.include_router(routes.router)
app.include_router(demo.router)
app.include_router(mongo_admin.router)
app.include_router(data_ingestion.router)


# ── Root ──────────────────────────────────────────────────────
@app.get("/", tags=["Root"], summary="API root")
async def root():
    """API root — returns basic info and links."""
    return {
        "name": settings.app_name,
        "version": settings.app_version,
        "status": "running",
        "docs": "/docs",
        "health": "/health",
        "demo_dashboard": "/api/v1/demo/dashboard",
        "disclaimer": (
            "⚠️ SIH PROTOTYPE — All disaster data is simulated. "
            "Do NOT use for real emergency decisions."
        ),
    }
