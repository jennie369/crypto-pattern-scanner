"""
Configuration Settings for GEM Master Backend
Loads from environment variables with Railway/Docker support
"""
from pydantic_settings import BaseSettings
from typing import Optional, List
from functools import lru_cache


class Settings(BaseSettings):
    """Application settings loaded from environment variables"""

    # App Settings
    APP_NAME: str = "GEM Master Backend"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False
    ENVIRONMENT: str = "production"

    # Server
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    WORKERS: int = 4

    # CORS
    CORS_ORIGINS: List[str] = ["*"]

    # Supabase
    SUPABASE_URL: str = ""
    SUPABASE_ANON_KEY: str = ""
    SUPABASE_SERVICE_ROLE_KEY: str = ""
    SUPABASE_JWT_SECRET: str = ""

    # Redis (for WebSocket state and offline queue)
    REDIS_URL: str = "redis://localhost:6379"
    REDIS_PASSWORD: Optional[str] = None

    # AI Services
    GEMINI_API_KEY: str = ""
    OPENAI_API_KEY: str = ""  # For Whisper transcription

    # Zalo OA
    ZALO_APP_ID: str = ""
    ZALO_APP_SECRET: str = ""
    ZALO_OA_ID: str = ""
    ZALO_ACCESS_TOKEN: str = ""
    ZALO_REFRESH_TOKEN: str = ""
    ZALO_WEBHOOK_SECRET: str = ""

    # Facebook Messenger
    FB_PAGE_ACCESS_TOKEN: str = ""
    FB_VERIFY_TOKEN: str = ""
    FB_APP_SECRET: str = ""

    # Rate Limits
    WS_MAX_CONNECTIONS_PER_USER: int = 5
    WS_MESSAGE_RATE_LIMIT: int = 30  # messages per minute
    API_RATE_LIMIT: int = 100  # requests per minute

    # Timeouts
    AI_RESPONSE_TIMEOUT: int = 30  # seconds
    WS_HEARTBEAT_INTERVAL: int = 30  # seconds
    WS_CONNECTION_TIMEOUT: int = 300  # seconds (5 min idle)

    # FAQ Settings (PHASE 2)
    FAQ_CONFIDENCE_THRESHOLD: float = 0.75  # Minimum confidence to use FAQ
    FAQ_MAX_RESULTS: int = 3  # Max FAQ results to consider

    # Handoff Settings (PHASE 2)
    HANDOFF_AUTO_ASSIGN: bool = True  # Auto-assign to available agents
    HANDOFF_DEFAULT_PRIORITY: str = "normal"  # Default priority level

    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = "ignore"


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance"""
    return Settings()


# Global settings instance
settings = get_settings()
