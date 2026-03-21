from contextlib import asynccontextmanager
from fastapi import FastAPI, APIRouter, Request
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request as StarletteRequest
from starlette.responses import Response as StarletteResponse
from starlette.staticfiles import StaticFiles
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import time
import uuid
from pymongo.errors import PyMongoError
from pathlib import Path

# Import routes
from routes import auth, episodes, progress, videos, users, thematics, resources, partners, candidatures, events, analytics, contact, volunteers, members, mediatheque, students, newsletter, onboarding
from routes.admin_dashboard import router as admin_dashboard_router

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')
from core.config import settings
from utils.logging_config import setup_logging

# Server start time for uptime calculation
_server_start_time = time.time()

# Configure logging
setup_logging(settings.ENVIRONMENT)
logger = logging.getLogger(__name__)

# MongoDB connection
client = AsyncIOMotorClient(settings.MONGO_URL)
db = client[settings.DB_NAME]

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan — startup indexes and shutdown cleanup."""
    # --- Startup ---
    from utils.rate_limit import ensure_rate_limit_indexes
    app.db = db
    settings.validate()
    await ensure_rate_limit_indexes(db)

    # Data retention TTL indexes (RGPD)
    try:
        await db.tech_candidatures.create_index("created_at", expireAfterSeconds=15552000)
        await db.contact_messages.create_index("created_at", expireAfterSeconds=15552000)  # 6 months
        await db.analytics_events.create_index("created_at", expireAfterSeconds=31536000)
        await db.password_reset_tokens.create_index("created_at", expireAfterSeconds=86400)
        await db.volunteer_applications.create_index("created_at", expireAfterSeconds=94608000)
        await db.student_applications.create_index("created_at", expireAfterSeconds=94608000)  # 3 years RGPD
    except Exception as e:
        logger.warning(f"TTL index creation: {e}")

    # Member profiles indexes
    try:
        await db.member_profiles.create_index(
            "user_id", unique=True,
            partialFilterExpression={"user_id": {"$type": "string"}},
        )
        await db.member_profiles.create_index("slug", unique=True)
        await db.member_profiles.create_index([("visible", 1), ("project", 1)])
        await db.member_profiles.create_index("membership_status")
    except Exception as e:
        logger.warning(f"Member profiles index creation: {e}")

    # Analytics query indexes
    try:
        await db.analytics_events.create_index([("category", 1), ("action", 1)])
        await db.analytics_events.create_index("path")
        await db.analytics_events.create_index("session_id")
    except Exception as e:
        logger.warning(f"Analytics index creation: {e}")

    # Performance indexes for hot queries
    try:
        await db.user_sessions.create_index("session_token")
        await db.user_sessions.create_index("user_id")
        await db.user_sessions.create_index("expires_at", expireAfterSeconds=0)
        await db.users.create_index("email")
        await db.users.create_index("username")
        await db.users.create_index("id", unique=True)
        await db.partners.create_index("slug", unique=True)
        await db.pending_2fa.create_index("user_id")
    except Exception as e:
        logger.warning(f"Performance index creation: {e}")

    # Query indexes for hot paths (audit 2026-03-15)
    try:
        await db.events.create_index("id")
        await db.events.create_index([("is_published", 1), ("date", 1)])
        await db.partners.create_index("user_id")
        await db.partners.create_index("status")
        await db.video_progress.create_index(
            [("user_id", 1), ("episode_id", 1)], unique=True
        )
        await db.episode_optins.create_index("user_id")
        await db.tech_candidatures.create_index("email")
        await db.tech_candidatures.create_index([("status", 1), ("project", 1)])
        await db.tech_candidatures.create_index([("ip_address", 1), ("created_at", 1)])
        await db.volunteer_applications.create_index("email")
        await db.volunteer_applications.create_index("status")
        await db.volunteer_applications.create_index([("ip_address", 1), ("created_at", 1)])
        await db.student_applications.create_index("email")
        await db.student_applications.create_index("status")
        await db.student_applications.create_index([("ip_address", 1), ("created_at", 1)])
        await db.contact_messages.create_index([("ip_address", 1), ("created_at", 1)])
        await db.pending_2fa.create_index("created_at", expireAfterSeconds=600)
    except Exception as e:
        logger.warning(f"Audit index creation: {e}")

    # Analytics composite index for dashboard time-range queries (data quality audit 2026-03-16)
    try:
        await db.analytics_events.create_index([("category", 1), ("action", 1), ("created_at", -1)])
        await db.media_resources.create_index([("is_published", 1), ("sort_order", 1)])
        await db.admin_actions.create_index("timestamp")
        await db.admin_actions.create_index("created_at", expireAfterSeconds=94608000)  # 3 years retention
    except Exception as e:
        logger.warning(f"Data quality index creation: {e}")

    # RGPD Art. 17 — Auto-purge accounts with deletion_requested_at > 30 days
    try:
        await db.users.create_index("deletion_requested_at", expireAfterSeconds=2592000)  # 30 days
    except Exception as e:
        logger.warning(f"RGPD deletion TTL index: {e}")

    # Onboarding email sequence — compound index for cron query
    try:
        await db.users.create_index([("onboarding_step", 1), ("onboarding_next_at", 1)])
    except Exception as e:
        logger.warning(f"Onboarding index creation: {e}")

    # Onboarding migration — mark existing users as fully onboarded
    try:
        result = await db.users.update_many(
            {"onboarding_step": {"$exists": False}},
            {"$set": {"onboarding_step": 3, "onboarding_next_at": None}},
        )
        if result.modified_count > 0:
            logger.info(f"Onboarding migration: {result.modified_count} existing users set to step 3")
    except Exception as e:
        logger.warning(f"Onboarding migration: {e}")

    logger.info("Rate limit and retention indexes ensured")

    yield  # Application runs here

    # --- Shutdown ---
    client.close()


# Create the main app without a prefix
app = FastAPI(
    title="Mouvement ECHO API",
    description="API for ECHO series platform",
    version="1.0.0",
    lifespan=lifespan,
    # Disable API docs in production to avoid exposing internals
    docs_url=None if settings.is_production else "/docs",
    redoc_url=None if settings.is_production else "/redoc",
    openapi_url=None if settings.is_production else "/openapi.json",
)

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Include all routers
api_router.include_router(auth.router)
api_router.include_router(progress.router)
api_router.include_router(videos.router)
api_router.include_router(users.router)
api_router.include_router(thematics.router)
api_router.include_router(resources.router)
api_router.include_router(resources.actors_router)
api_router.include_router(partners.router)
api_router.include_router(episodes.router)
api_router.include_router(candidatures.router)
api_router.include_router(events.router)
api_router.include_router(analytics.router)
api_router.include_router(contact.router)
api_router.include_router(volunteers.router)
api_router.include_router(students.router)
api_router.include_router(members.router)
api_router.include_router(members.admin_router)
api_router.include_router(admin_dashboard_router)
api_router.include_router(mediatheque.router)
api_router.include_router(mediatheque.admin_router)
api_router.include_router(newsletter.router)
api_router.include_router(onboarding.router)
api_router.include_router(onboarding.admin_router)

# Health check endpoint
@api_router.get("/")
async def root():
    return {"message": "Mouvement ECHO API is running"}

@api_router.get("/health")
async def health_check():
    """Health check endpoint — verifies MongoDB connectivity with latency and uptime."""
    from starlette.responses import JSONResponse

    uptime_seconds = round(time.time() - _server_start_time, 1)

    try:
        start = time.perf_counter()
        await db.command("ping")
        db_latency_ms = round((time.perf_counter() - start) * 1000, 1)

        from routes.onboarding import _last_cron_run as _onboarding_last_run
        cron_onboarding_status = "ok" if _onboarding_last_run else "never_run"

        return {
            "status": "healthy",
            "database": "connected",
            "db_latency_ms": db_latency_ms,
            "uptime_seconds": uptime_seconds,
            "cron_onboarding": {
                "last_run": _onboarding_last_run.isoformat() if _onboarding_last_run else None,
                "status": cron_onboarding_status,
            },
        }
    except Exception as e:
        logger.error("Health check failed — MongoDB unreachable: %s", e)
        return JSONResponse(
            status_code=503,
            content={
                "status": "unhealthy",
                "database": str(e),
                "uptime_seconds": uptime_seconds,
            },
        )

# Include the router in the main app
app.include_router(api_router)

# Serve uploaded files (logos, etc.)
uploads_dir = os.path.join(ROOT_DIR, "uploads")
os.makedirs(uploads_dir, exist_ok=True)
app.mount("/api/uploads", StaticFiles(directory=uploads_dir), name="uploads")

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=[o.strip() for o in settings.CORS_ORIGINS.split(',')],
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
)


@app.middleware("http")
async def limit_request_size(request: Request, call_next):
    """Reject requests larger than 10MB (except file upload endpoints)."""
    content_length = request.headers.get("content-length")
    if content_length and int(content_length) > 10 * 1024 * 1024:  # 10MB
        if not request.url.path.endswith(("/logo", "/upload", "/image")):
            from starlette.responses import JSONResponse as _JSONResp
            return _JSONResp(status_code=413, content={"detail": "Request too large"})
    return await call_next(request)


@app.middleware("http")
async def csrf_origin_check(request: Request, call_next):
    """Validate Origin header on mutating requests to prevent CSRF attacks."""
    if request.method in ("POST", "PUT", "PATCH", "DELETE"):
        # Exempt OAuth callback (redirect doesn't send Origin)
        if request.url.path == "/api/auth/google/callback":
            return await call_next(request)

        origin = request.headers.get("origin")
        referer = request.headers.get("referer")
        allowed_origins = [o.strip() for o in settings.CORS_ORIGINS.split(",")]

        if origin:
            allowed = any(origin == o or origin.startswith(o) for o in allowed_origins)
            if not allowed:
                from starlette.responses import JSONResponse as _JSONResponse
                return _JSONResponse(status_code=403, content={"detail": "Origin not allowed"})
        elif referer:
            from urllib.parse import urlparse
            ref_origin = f"{urlparse(referer).scheme}://{urlparse(referer).netloc}"
            allowed = any(ref_origin == o for o in allowed_origins)
            if not allowed:
                from starlette.responses import JSONResponse as _JSONResponse
                return _JSONResponse(status_code=403, content={"detail": "Origin not allowed"})
        # If neither Origin nor Referer → allow (server-to-server, API clients)

    return await call_next(request)

class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: StarletteRequest, call_next):
        response: StarletteResponse = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()"
        response.headers["Content-Security-Policy"] = (
            "default-src 'self'; "
            "script-src 'self' https://www.google.com https://www.gstatic.com; "
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
            "font-src 'self' https://fonts.gstatic.com; "
            "img-src 'self' data: https:; "
            f"connect-src 'self' {settings.FRONTEND_URL} https://nominatim.openstreetmap.org https://www.google.com https://www.google-analytics.com https://region1.google-analytics.com; "
            "frame-src https://www.google.com https://www.youtube-nocookie.com https://www.youtube.com;"
        )
        if settings.is_production:
            response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        return response

app.add_middleware(SecurityHeadersMiddleware)

class MongoDBErrorMiddleware(BaseHTTPMiddleware):
    """Global safety net: catch unhandled MongoDB errors and return 503."""
    async def dispatch(self, request: StarletteRequest, call_next):
        try:
            return await call_next(request)
        except PyMongoError as e:
            logger.error(f"Unhandled MongoDB error on {request.method} {request.url.path}: {e}")
            from starlette.responses import JSONResponse
            return JSONResponse(
                status_code=503,
                content={"detail": "Service temporairement indisponible. Veuillez réessayer."},
            )

app.add_middleware(MongoDBErrorMiddleware)


class ActivityTrackingMiddleware(BaseHTTPMiddleware):
    """Update last_active_at for authenticated users (throttled: max once per hour)."""

    _cache: dict[str, float] = {}  # user_id → last_update_timestamp

    async def dispatch(self, request: StarletteRequest, call_next):
        response: StarletteResponse = await call_next(request)

        # Only track successful authenticated requests
        if response.status_code >= 400:
            return response

        session_token = request.cookies.get("session_token")
        if not session_token:
            return response

        try:
            db = request.app.db
            # Lookup session
            session = await db.user_sessions.find_one({"session_token": session_token})
            if not session:
                return response

            user_id = session["user_id"]

            # Throttle: only update once per hour per user
            now = time.time()
            last_update = self._cache.get(user_id, 0)
            if now - last_update < 3600:
                return response

            self._cache[user_id] = now

            from datetime import datetime, UTC
            now_dt = datetime.now(UTC)

            # Update user last_login (lightweight)
            await db.users.update_one(
                {"id": user_id},
                {"$set": {"last_login": now_dt}},
            )
            # Update member_profiles last_active_at if member
            await db.member_profiles.update_one(
                {"user_id": user_id},
                {"$set": {"last_active_at": now_dt}},
            )
        except Exception:
            pass  # Never break requests for activity tracking

        return response


app.add_middleware(ActivityTrackingMiddleware)


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """Log every HTTP request with method, path, status, and duration.

    Also tracks:
    - Slow requests (> 2 seconds) logged as WARNING
    - 5xx error count (in-memory counter for monitoring)
    """

    error_5xx_count: int = 0
    SLOW_REQUEST_THRESHOLD_MS: float = 2000.0

    async def dispatch(self, request: StarletteRequest, call_next):
        # Skip health check and root to avoid noise
        if request.url.path in ("/api/health", "/api/"):
            return await call_next(request)

        request_id = uuid.uuid4().hex[:8]
        request.state.request_id = request_id

        start = time.perf_counter()
        response: StarletteResponse = await call_next(request)
        duration_ms = round((time.perf_counter() - start) * 1000, 1)

        status_code = response.status_code

        # Track 5xx errors
        if status_code >= 500:
            RequestLoggingMiddleware.error_5xx_count += 1
            level = logging.ERROR
        elif status_code >= 400:
            level = logging.WARNING
        else:
            level = logging.INFO

        # Slow request detection
        if duration_ms > self.SLOW_REQUEST_THRESHOLD_MS:
            logger.warning(
                "SLOW REQUEST: %s %s took %.1fms (threshold: %.0fms)",
                request.method,
                request.url.path,
                duration_ms,
                self.SLOW_REQUEST_THRESHOLD_MS,
                extra={"request_id": request_id},
            )

        logger.log(
            level,
            "%s %s %s %.1fms",
            request.method,
            request.url.path,
            status_code,
            duration_ms,
            extra={"request_id": request_id},
        )

        return response


app.add_middleware(RequestLoggingMiddleware)
