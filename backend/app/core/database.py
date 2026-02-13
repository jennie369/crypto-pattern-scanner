"""
Supabase Database Client
Provides connection to Supabase with service role for backend operations
"""
from supabase import create_client, Client
from typing import Optional, Dict, Any, List
from datetime import date
import logging

from .config import get_settings

logger = logging.getLogger(__name__)


class SupabaseClient:
    """Singleton Supabase client manager"""

    _instance: Optional[Client] = None
    _service_instance: Optional[Client] = None

    @classmethod
    def get_client(cls) -> Client:
        """Get Supabase client with anon key (for user-context operations)"""
        if cls._instance is None:
            settings = get_settings()
            cls._instance = create_client(
                settings.SUPABASE_URL,
                settings.SUPABASE_ANON_KEY,
            )
        return cls._instance

    @classmethod
    def get_service_client(cls) -> Client:
        """Get Supabase client with service role key (for admin operations)"""
        if cls._service_instance is None:
            settings = get_settings()
            cls._service_instance = create_client(
                settings.SUPABASE_URL,
                settings.SUPABASE_SERVICE_ROLE_KEY,
            )
        return cls._service_instance


def get_supabase_admin() -> Client:
    """Shortcut to get admin client"""
    return SupabaseClient.get_service_client()


# ============================================================
# Database Helper Functions
# ============================================================


async def get_user_profile(user_id: str) -> Optional[Dict[str, Any]]:
    """Get user profile from profiles table"""
    try:
        client = get_supabase_admin()
        result = client.table("profiles").select("*").eq("id", user_id).single().execute()
        return result.data if result.data else None
    except Exception as e:
        logger.error(f"Error getting user profile: {e}")
        return None


async def get_chatbot_quota(user_id: str, quota_date: date) -> Dict[str, Any]:
    """Get chatbot quota for user on specific date"""
    try:
        client = get_supabase_admin()
        result = (
            client.table("chatbot_quota")
            .select("*")
            .eq("user_id", user_id)
            .eq("date", str(quota_date))
            .single()
            .execute()
        )
        return result.data or {"queries_used": 0}
    except Exception:
        return {"queries_used": 0}


async def increment_chatbot_usage(user_id: str, quota_date: date) -> bool:
    """Increment chatbot usage counter"""
    try:
        client = get_supabase_admin()
        result = client.rpc(
            "increment_chatbot_usage",
            {"p_user_id": user_id, "p_date": str(quota_date)},
        ).execute()
        return result.data is not None
    except Exception as e:
        logger.error(f"Error incrementing usage: {e}")
        return False


# ============================================================
# Platform User Functions (for multi-platform chatbot)
# ============================================================


async def get_or_create_platform_user(
    platform: str,
    platform_user_id: str,
    display_name: Optional[str] = None,
    avatar_url: Optional[str] = None,
    metadata: Optional[Dict[str, Any]] = None,
) -> Optional[str]:
    """Get or create platform user, returns user ID"""
    try:
        client = get_supabase_admin()
        result = client.rpc(
            "get_or_create_platform_user",
            {
                "p_platform": platform,
                "p_platform_user_id": platform_user_id,
                "p_display_name": display_name,
                "p_avatar_url": avatar_url,
                "p_metadata": metadata or {},
            },
        ).execute()
        return result.data
    except Exception as e:
        logger.error(f"Error creating platform user: {e}")
        return None


async def get_or_create_conversation(
    platform_user_id: str,
    platform: str = "mobile",
    context: Optional[Dict[str, Any]] = None,
) -> Optional[str]:
    """Get or create active conversation"""
    try:
        client = get_supabase_admin()
        result = client.rpc(
            "get_or_create_conversation",
            {
                "p_platform_user_id": platform_user_id,
                "p_platform": platform,
                "p_context": context or {},
            },
        ).execute()
        return result.data
    except Exception as e:
        logger.error(f"Error creating conversation: {e}")
        return None


async def save_message(
    conversation_id: str,
    platform_user_id: str,
    role: str,
    content: str,
    content_type: str = "text",
    metadata: Optional[Dict[str, Any]] = None,
    tokens_used: int = 0,
    response_time_ms: Optional[int] = None,
    platform_message_id: Optional[str] = None,
) -> Optional[str]:
    """Save message and return message ID"""
    try:
        client = get_supabase_admin()
        result = client.rpc(
            "save_chatbot_message",
            {
                "p_conversation_id": conversation_id,
                "p_platform_user_id": platform_user_id,
                "p_role": role,
                "p_content": content,
                "p_content_type": content_type,
                "p_metadata": metadata or {},
                "p_tokens_used": tokens_used,
                "p_response_time_ms": response_time_ms,
                "p_platform_message_id": platform_message_id,
            },
        ).execute()
        return result.data
    except Exception as e:
        logger.error(f"Error saving message: {e}")
        return None


async def get_conversation_history(
    platform_user_id: str,
    platform: str = "mobile",
    limit: int = 10,
) -> List[Dict[str, Any]]:
    """Get recent conversation history for AI context"""
    try:
        client = get_supabase_admin()

        # First get active conversation
        conv_result = (
            client.table("chatbot_platform_conversations")
            .select("id")
            .eq("platform_user_id", platform_user_id)
            .eq("platform", platform)
            .eq("status", "active")
            .order("last_message_at", desc=True)
            .limit(1)
            .execute()
        )

        if not conv_result.data:
            return []

        conversation_id = conv_result.data[0]["id"]

        # Get messages
        msg_result = (
            client.table("chatbot_messages")
            .select("role, content, created_at")
            .eq("conversation_id", conversation_id)
            .order("created_at", desc=True)
            .limit(limit)
            .execute()
        )

        # Return in chronological order
        messages = msg_result.data or []
        messages.reverse()
        return messages

    except Exception as e:
        logger.error(f"Error getting history: {e}")
        return []


async def link_platform_user_to_app(platform_user_id: str, app_user_id: str) -> bool:
    """Link external platform user to app account"""
    try:
        client = get_supabase_admin()
        result = client.rpc(
            "link_platform_user_to_app",
            {
                "p_platform_user_id": platform_user_id,
                "p_app_user_id": app_user_id,
            },
        ).execute()
        return result.data or False
    except Exception as e:
        logger.error(f"Error linking user: {e}")
        return False
