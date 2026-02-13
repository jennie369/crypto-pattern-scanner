"""
Health Check Endpoints
For Railway deployment and monitoring
"""
from fastapi import APIRouter
from datetime import datetime
from typing import Dict, Any

from ..core.config import get_settings
from ..core.database import get_supabase_admin

router = APIRouter()
settings = get_settings()


@router.get("/health")
async def health_check() -> Dict[str, Any]:
    """Basic health check for Railway"""
    return {
        "status": "healthy",
        "version": settings.APP_VERSION,
        "timestamp": datetime.utcnow().isoformat(),
    }


@router.get("/health/detailed")
async def detailed_health_check() -> Dict[str, Any]:
    """Detailed health check with service status"""
    services = {}

    # Check Supabase
    try:
        client = get_supabase_admin()
        client.table("profiles").select("id").limit(1).execute()
        services["supabase"] = "healthy"
    except Exception as e:
        services["supabase"] = f"unhealthy: {str(e)[:50]}"

    # Check Redis
    try:
        from ..core.redis import get_redis

        r = await get_redis()
        await r.ping()
        services["redis"] = "healthy"
    except Exception as e:
        services["redis"] = f"unhealthy: {str(e)[:50]}"

    # Check Gemini API key configured
    services["gemini"] = "configured" if settings.GEMINI_API_KEY else "not_configured"

    # Check Zalo configured
    services["zalo"] = "configured" if settings.ZALO_ACCESS_TOKEN else "not_configured"

    # Check Messenger configured
    services["messenger"] = "configured" if settings.FB_PAGE_ACCESS_TOKEN else "not_configured"

    # WebSocket stats placeholder (will be populated by connection manager)
    services["websocket_connections"] = 0

    overall_status = "healthy" if all(
        v in ["healthy", "configured"] for k, v in services.items()
        if k in ["supabase", "redis"]
    ) else "degraded"

    return {
        "status": overall_status,
        "version": settings.APP_VERSION,
        "environment": settings.ENVIRONMENT,
        "timestamp": datetime.utcnow().isoformat(),
        "services": services,
    }


@router.get("/metrics")
async def metrics() -> Dict[str, Any]:
    """Prometheus-compatible metrics endpoint"""
    return {
        "gem_websocket_connections_total": 0,
        "gem_offline_queue_pending": 0,
        "gem_offline_queue_processing": 0,
        "gem_offline_queue_dead_letter": 0,
    }
