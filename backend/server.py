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
from routes import auth, episodes, progress, videos, users, thematics, resources, partners, candidatures, events, analytics, contact, volunteers, members, mediatheque, students
from routes.admin_dashboard import router as admin_dashboard_router

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')
from core.config import settings
from utils.logging_config import setup_logging

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
        await db.contact_messages.create_index("created_at", expireAfterSeconds=15552000)
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

# Health check endpoint
@api_router.get("/")
async def root():
    return {"message": "Mouvement ECHO API is running"}

@api_router.get("/health")
async def health_check():
    """Health check endpoint — verifies MongoDB connectivity."""
    try:
        from server import db
        await db.command("ping")
        return {"status": "healthy", "database": "connected"}
    except Exception as e:
        from starlette.responses import JSONResponse
        return JSONResponse(
            status_code=503,
            content={"status": "unhealthy", "database": str(e)},
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
    allow_origins=settings.CORS_ORIGINS.split(','),
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
)


@app.middleware("http")
async def csrf_origin_check(request: Request, call_next):
    """Validate Origin header on mutating requests to prevent CSRF attacks."""
    if request.method in ("POST", "PUT", "PATCH", "DELETE"):
        # Exempt OAuth callback (redirect doesn't send Origin)
        if request.url.path == "/api/auth/google/callback":
            return await call_next(request)

        origin = request.headers.get("origin")
        referer = request.headers.get("referer")
        allowed_origins = settings.CORS_ORIGINS.split(",")

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


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """Log every HTTP request with method, path, status, and duration."""

    async def dispatch(self, request: StarletteRequest, call_next):
        # Skip health check to avoid noise
        if request.url.path == "/api/health":
            return await call_next(request)

        request_id = uuid.uuid4().hex[:8]
        request.state.request_id = request_id

        start = time.perf_counter()
        response: StarletteResponse = await call_next(request)
        duration_ms = round((time.perf_counter() - start) * 1000, 1)

        status_code = response.status_code
        if status_code >= 500:
            level = logging.ERROR
        elif status_code >= 400:
            level = logging.WARNING
        else:
            level = logging.INFO

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
