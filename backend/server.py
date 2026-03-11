from fastapi import FastAPI, APIRouter
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from starlette.staticfiles import StaticFiles
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path

# Import routes
from routes import auth, episodes, progress, videos, users, thematics, resources, partners, candidatures, events, analytics

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
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("startup")
async def startup_indexes():
    """Create TTL and compound indexes for rate limiting auto-cleanup."""
    from utils.rate_limit import ensure_rate_limit_indexes
    app.db = db
    await ensure_rate_limit_indexes(db)
    logger.info("Rate limit indexes ensured")


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()