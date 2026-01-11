"""
FastAPI Main Application Entry Point
GEM Master Backend - AI Trading Assistant
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from contextlib import asynccontextmanager
import asyncio
import logging

from .core.config import get_settings
from .api import health, websocket

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events"""
    # Startup
    logger.info(f"[{settings.APP_NAME}] Starting up...")
    logger.info(f"Environment: {settings.ENVIRONMENT}")
    logger.info(f"Debug: {settings.DEBUG}")

    # Initialize Redis connection
    try:
        from .core.redis import get_redis
        await get_redis()
        logger.info("Redis connection established")
    except Exception as e:
        logger.warning(f"Redis connection failed (will work without): {e}")

    # Start background workers (offline queue processor)
    # queue_task = asyncio.create_task(process_offline_queue())

    # PHASE 4: Start marketing workers
    cart_recovery_task = None
    broadcast_task = None
    try:
        from .workers import cart_recovery_worker, broadcast_worker
        cart_recovery_task = cart_recovery_worker.start_background()
        broadcast_task = broadcast_worker.start_background()
        logger.info("Marketing workers started (cart recovery + broadcast)")
    except Exception as e:
        logger.warning(f"Marketing workers not started: {e}")

    # Start nurturing worker for waitlist
    nurturing_task = None
    try:
        from .workers.nurturing_worker import nurturing_worker
        nurturing_task = nurturing_worker.start_background()
        logger.info("Nurturing worker started")
    except Exception as e:
        logger.warning(f"Nurturing worker not started: {e}")

    yield

    # Stop marketing workers
    if cart_recovery_task:
        try:
            from .workers import cart_recovery_worker
            await cart_recovery_worker.stop()
        except Exception:
            pass
    if broadcast_task:
        try:
            from .workers import broadcast_worker
            await broadcast_worker.stop()
        except Exception:
            pass

    # Stop nurturing worker
    if nurturing_task:
        try:
            from .workers.nurturing_worker import nurturing_worker
            await nurturing_worker.stop()
        except Exception:
            pass

    # Shutdown
    logger.info(f"[{settings.APP_NAME}] Shutting down...")

    # Close Redis
    try:
        from .core.redis import RedisManager
        await RedisManager.close()
    except Exception:
        pass


# Create FastAPI app
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="GEM Master Backend - AI Trading Assistant with WebSocket support",
    lifespan=lifespan,
    docs_url="/docs" if settings.DEBUG else None,
    redoc_url="/redoc" if settings.DEBUG else None,
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Gzip compression
app.add_middleware(GZipMiddleware, minimum_size=1000)

# Include routers
app.include_router(health.router, tags=["Health"])
app.include_router(websocket.router, tags=["WebSocket"])

# Import and include platform webhooks when available
try:
    from .api import zalo
    app.include_router(zalo.router)
except ImportError:
    logger.info("Zalo webhook not available yet")

try:
    from .api import messenger
    app.include_router(messenger.router)
except ImportError:
    logger.info("Messenger webhook not available yet")

# Import transcription API
try:
    from .api import transcription
    app.include_router(transcription.router)
except ImportError:
    logger.info("Transcription API not available yet")

# PHASE 4: Import marketing API (cart recovery, broadcast, segments)
try:
    from .api import marketing
    app.include_router(marketing.router)
    logger.info("Marketing API registered")
except ImportError:
    logger.info("Marketing API not available yet")

# PHASE 5: Import gamification API (games, gems, achievements)
try:
    from .api import gamification
    app.include_router(gamification.router)
    logger.info("Gamification API registered")
except ImportError:
    logger.info("Gamification API not available yet")

# Waitlist API (registration, nurturing, admin)
try:
    from .api import waitlist
    app.include_router(waitlist.router)
    logger.info("Waitlist API registered")
except ImportError:
    logger.info("Waitlist API not available yet")


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "running",
        "docs": "/docs" if settings.DEBUG else "disabled",
    }


@app.get("/ping")
async def ping():
    """Simple ping for latency testing"""
    return {"pong": True}
