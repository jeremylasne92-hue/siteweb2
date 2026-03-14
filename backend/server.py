from fastapi import FastAPI, APIRouter
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request as StarletteRequest
from starlette.responses import Response as StarletteResponse
from starlette.staticfiles import StaticFiles
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path

# Import routes
from routes import auth, episodes, progress, videos, users, thematics, resources, partners, candidatures, events, analytics, contact, volunteers, members

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI(
    title="Mouvement ECHO API",
    description="API for ECHO series platform",
    version="1.0.0"
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
api_router.include_router(members.router)
api_router.include_router(members.admin_router)

# Health check endpoint
@api_router.get("/")
async def root():
    return {"message": "Mouvement ECHO API is running"}

# Include the router in the main app
app.include_router(api_router)

# Serve uploaded files (logos, etc.)
uploads_dir = os.path.join(ROOT_DIR, "uploads")
os.makedirs(uploads_dir, exist_ok=True)
app.mount("/api/uploads", StaticFiles(directory=uploads_dir), name="uploads")

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', 'http://localhost:5173').split(','),
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
)

class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: StarletteRequest, call_next):
        response: StarletteResponse = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()"
        if os.environ.get('ENVIRONMENT') == 'production':
            response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        return response

app.add_middleware(SecurityHeadersMiddleware)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("startup")
async def startup_indexes():
    """Create TTL and compound indexes for rate limiting and data retention."""
    from utils.rate_limit import ensure_rate_limit_indexes
    app.db = db
    await ensure_rate_limit_indexes(db)

    # Data retention TTL indexes (RGPD)
    try:
        await db.tech_candidatures.create_index("created_at", expireAfterSeconds=15552000)  # 6 months
        await db.contact_messages.create_index("created_at", expireAfterSeconds=15552000)  # 6 months
        await db.analytics_events.create_index("created_at", expireAfterSeconds=31536000)  # 1 year
        await db.password_reset_tokens.create_index("created_at", expireAfterSeconds=86400)  # 24h
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

    logger.info("Rate limit and retention indexes ensured")


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()