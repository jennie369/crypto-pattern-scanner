"""
Authentication and Security Helpers
JWT verification for Supabase tokens and platform webhook signatures
"""
from fastapi import HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from typing import Optional, Dict, Any
import hmac
import hashlib
import time
import logging

from .config import get_settings
from .database import get_user_profile

logger = logging.getLogger(__name__)
security = HTTPBearer(auto_error=False)


async def verify_supabase_token(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
) -> Optional[Dict[str, Any]]:
    """
    Verify Supabase JWT token and return user claims.
    Returns None if no token provided (for optional auth).
    """
    if not credentials:
        return None

    try:
        settings = get_settings()
        token = credentials.credentials

        # Decode and verify JWT
        payload = jwt.decode(
            token,
            settings.SUPABASE_JWT_SECRET,
            algorithms=["HS256"],
            audience="authenticated",
        )

        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token: missing user ID")

        # Get user profile for tier info
        profile = await get_user_profile(user_id)

        return {
            "user_id": user_id,
            "email": payload.get("email"),
            "role": payload.get("role"),
            "profile": profile,
            "scanner_tier": profile.get("scanner_tier", "FREE") if profile else "FREE",
            "chatbot_tier": profile.get("chatbot_tier", "FREE") if profile else "FREE",
        }
    except JWTError as e:
        logger.error(f"JWT verification failed: {e}")
        raise HTTPException(status_code=401, detail=f"Invalid token: {str(e)}")


async def require_auth(
    user: Optional[Dict[str, Any]] = Depends(verify_supabase_token),
) -> Dict[str, Any]:
    """Require authentication - raises 401 if not authenticated"""
    if not user:
        raise HTTPException(status_code=401, detail="Authentication required")
    return user


def verify_jwt_from_query(token: str) -> Optional[Dict[str, Any]]:
    """
    Verify JWT token from query parameter (for WebSocket).
    Returns user dict or None if invalid.
    """
    if not token:
        return None

    try:
        settings = get_settings()
        payload = jwt.decode(
            token,
            settings.SUPABASE_JWT_SECRET,
            algorithms=["HS256"],
            audience="authenticated",
        )

        user_id = payload.get("sub")
        if not user_id:
            return None

        return {
            "user_id": user_id,
            "email": payload.get("email"),
            "role": payload.get("role"),
        }
    except JWTError as e:
        logger.error(f"JWT verification failed: {e}")
        return None


# ============================================================
# Zalo OA Signature Verification
# ============================================================


def verify_zalo_mac(
    app_id: str,
    user_id: str,
    timestamp: str,
    mac: str,
) -> bool:
    """
    Verify Zalo MAC authentication for webhook security.
    MAC = HMAC-SHA256(app_id + data + timestamp + secret_key)
    """
    settings = get_settings()

    if not settings.ZALO_APP_SECRET:
        logger.warning("Zalo app secret not configured")
        return False

    # Check timestamp (within 5 minutes)
    try:
        current_time = int(time.time() * 1000)
        if abs(current_time - int(timestamp)) > 300000:  # 5 minutes
            logger.warning("Zalo timestamp expired")
            return False
    except ValueError:
        return False

    # Calculate expected MAC
    data = f"{app_id}{user_id}{timestamp}"
    expected_mac = hmac.new(
        settings.ZALO_APP_SECRET.encode(),
        data.encode(),
        hashlib.sha256,
    ).hexdigest()

    return hmac.compare_digest(mac, expected_mac)


# ============================================================
# Facebook Messenger Signature Verification
# ============================================================


def verify_fb_signature(payload: bytes, signature: str) -> bool:
    """
    Verify Facebook webhook signature.
    X-Hub-Signature-256 = sha256=<HMAC-SHA256(payload, app_secret)>
    """
    settings = get_settings()

    if not settings.FB_APP_SECRET:
        logger.warning("FB app secret not configured")
        return False

    if not signature or not signature.startswith("sha256="):
        return False

    expected_sig = "sha256=" + hmac.new(
        settings.FB_APP_SECRET.encode(),
        payload,
        hashlib.sha256,
    ).hexdigest()

    return hmac.compare_digest(signature, expected_sig)


# ============================================================
# Tier-based Quota Checking
# ============================================================


TIER_LIMITS = {
    "FREE": 5,
    "TIER1": 15,
    "PRO": 15,
    "TIER2": 50,
    "PREMIUM": 50,
    "TIER3": -1,  # Unlimited
    "VIP": -1,
    "ADMIN": -1,
}


def get_tier_limit(tier: str) -> int:
    """Get daily message limit for tier"""
    return TIER_LIMITS.get(tier.upper(), 5)


def is_unlimited_tier(tier: str) -> bool:
    """Check if tier has unlimited messages"""
    return get_tier_limit(tier) == -1
