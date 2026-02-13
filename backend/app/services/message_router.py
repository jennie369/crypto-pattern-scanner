"""
Message Router
Main processing pipeline for chat messages
"""
from typing import Dict, Any, Optional, List
from datetime import date
import logging

from .nlp_service import nlp_service
from .ai_service import ai_service
from ..core.database import (
    get_or_create_platform_user,
    get_or_create_conversation,
    save_message,
    get_conversation_history,
    get_user_profile,
    get_chatbot_quota,
    increment_chatbot_usage,
)
from ..core.security import get_tier_limit, is_unlimited_tier
from ..models.schemas import Platform

logger = logging.getLogger(__name__)


class MessageRouter:
    """
    Message routing and processing pipeline.
    Handles quota, NLP, AI, and storage.
    """

    async def process(
        self,
        content: str,
        user_id: str,
        platform: str = "mobile",
        platform_user_id: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """
        Process incoming message through full pipeline.

        Args:
            content: Message content
            user_id: App user ID (from JWT)
            platform: Platform source
            platform_user_id: External platform user ID (for Zalo/Messenger)
            metadata: Additional metadata

        Returns:
            Response dict with content, conversation_id, etc.
        """
        try:
            # Get user profile for tier
            profile = await get_user_profile(user_id)
            user_tier = profile.get("chatbot_tier", "FREE") if profile else "FREE"

            # Check quota
            quota_check = await self.check_quota(user_id, user_tier)
            if not quota_check["allowed"]:
                return {
                    "content": quota_check["message"],
                    "conversation_id": None,
                    "message_id": None,
                    "quota_exceeded": True,
                }

            # Get or create platform user
            if platform in ["zalo", "messenger"] and platform_user_id:
                p_user_id = await get_or_create_platform_user(
                    platform=platform,
                    platform_user_id=platform_user_id,
                    display_name=metadata.get("display_name") if metadata else None,
                )
            else:
                # For mobile/web, use app user as platform user
                p_user_id = await get_or_create_platform_user(
                    platform=platform,
                    platform_user_id=user_id,
                    display_name=profile.get("display_name") if profile else None,
                )

            if not p_user_id:
                return self._error_response("Could not create user")

            # Get or create conversation
            conv_id = await get_or_create_conversation(
                platform_user_id=p_user_id,
                platform=platform,
                context={"user_tier": user_tier},
            )

            if not conv_id:
                return self._error_response("Could not create conversation")

            # Save user message
            await save_message(
                conversation_id=conv_id,
                platform_user_id=p_user_id,
                role="user",
                content=content,
            )

            # Get conversation history for context
            history = await get_conversation_history(
                platform_user_id=p_user_id,
                platform=platform,
                limit=10,
            )

            # Detect intent with NLP
            intent = await nlp_service.detect_intent(content)
            logger.info(f"Intent: {intent.get('type')} (confidence: {intent.get('confidence')})")

            # Generate AI response
            ai_response = await ai_service.generate_response(
                message=content,
                history=history,
                user_tier=user_tier,
                intent=intent,
                platform=Platform(platform),
            )

            # Save assistant response
            msg_id = await save_message(
                conversation_id=conv_id,
                platform_user_id=p_user_id,
                role="assistant",
                content=ai_response["text"],
                tokens_used=ai_response.get("tokens_used", 0),
                response_time_ms=ai_response.get("processing_time_ms"),
            )

            # Increment quota
            await increment_chatbot_usage(user_id, date.today())

            return {
                "content": ai_response["text"],
                "conversation_id": conv_id,
                "message_id": msg_id,
                "tokens_used": ai_response.get("tokens_used", 0),
                "processing_time_ms": ai_response.get("processing_time_ms", 0),
                "quick_actions": ai_response.get("quick_actions"),
                "intent": intent.get("type"),
            }

        except Exception as e:
            logger.error(f"Message router error: {e}")
            return self._error_response(str(e))

    async def check_quota(self, user_id: str, user_tier: str) -> Dict[str, Any]:
        """Check if user has remaining quota"""
        if is_unlimited_tier(user_tier):
            return {"allowed": True}

        limit = get_tier_limit(user_tier)
        quota = await get_chatbot_quota(user_id, date.today())
        used = quota.get("queries_used", 0)

        if used >= limit:
            return {
                "allowed": False,
                "message": f"Ban da su dung het {limit} luot hoi hom nay. Nang cap len TIER cao hon de co nhieu luot hon hoac cho den ngay mai.",
                "used": used,
                "limit": limit,
            }

        return {
            "allowed": True,
            "used": used,
            "limit": limit,
            "remaining": limit - used,
        }

    async def get_platform_history(
        self,
        platform: Platform,
        platform_user_id: str,
        limit: int = 10,
    ) -> List[Dict[str, str]]:
        """Get conversation history for platform user"""
        # First need to get internal platform_user_id
        # For now, return empty - will be implemented with proper lookup
        return []

    async def save_platform_message(
        self,
        platform: Platform,
        platform_user_id: str,
        user_message: str,
        assistant_message: str,
    ):
        """Save message exchange for platform user"""
        # Implementation for webhook handlers
        pass

    def _error_response(self, error: str) -> Dict[str, Any]:
        """Return error response"""
        return {
            "content": "Xin loi, co loi xay ra. Vui long thu lai sau.",
            "conversation_id": None,
            "message_id": None,
            "error": error,
        }


# Global instance
message_router = MessageRouter()
