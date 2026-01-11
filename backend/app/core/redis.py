"""
Redis Connection Manager
For WebSocket state management and offline queue
"""
import redis.asyncio as redis
from typing import Optional
import logging

from .config import get_settings

logger = logging.getLogger(__name__)


class RedisManager:
    """Singleton Redis connection manager"""

    _instance: Optional[redis.Redis] = None

    @classmethod
    async def get_client(cls) -> redis.Redis:
        """Get Redis client instance"""
        if cls._instance is None:
            settings = get_settings()
            cls._instance = redis.from_url(
                settings.REDIS_URL,
                password=settings.REDIS_PASSWORD,
                decode_responses=True,
                socket_timeout=5.0,
                socket_connect_timeout=5.0,
            )
            # Test connection
            try:
                await cls._instance.ping()
                logger.info("Redis connection established")
            except Exception as e:
                logger.error(f"Redis connection failed: {e}")
                cls._instance = None
                raise
        return cls._instance

    @classmethod
    async def close(cls):
        """Close Redis connection"""
        if cls._instance:
            await cls._instance.close()
            cls._instance = None
            logger.info("Redis connection closed")


async def get_redis() -> redis.Redis:
    """Shortcut to get Redis client"""
    return await RedisManager.get_client()


# ============================================================
# Redis Key Prefixes
# ============================================================

class RedisKeys:
    """Redis key prefix constants"""

    # WebSocket connections
    WS_CONNECTIONS = "gem:ws:connections"  # Hash: user_id -> connection_ids
    WS_CONNECTION_INFO = "gem:ws:info"  # Hash: connection_id -> user_id

    # Rate limiting
    RATE_LIMIT = "gem:rate:"  # Key per user: gem:rate:{user_id}

    # Message deduplication
    MSG_DEDUPE = "gem:dedupe:"  # Key per message: gem:dedupe:{platform}:{msg_id}

    # Offline queue (backup to Postgres)
    OFFLINE_QUEUE = "gem:offline_queue"

    # Session cache
    SESSION_CACHE = "gem:session:"  # Key per user: gem:session:{user_id}

    @classmethod
    def user_rate_key(cls, user_id: str) -> str:
        return f"{cls.RATE_LIMIT}{user_id}"

    @classmethod
    def dedupe_key(cls, platform: str, msg_id: str) -> str:
        return f"{cls.MSG_DEDUPE}{platform}:{msg_id}"

    @classmethod
    def session_key(cls, user_id: str) -> str:
        return f"{cls.SESSION_CACHE}{user_id}"
