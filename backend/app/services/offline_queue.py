"""
Offline Queue Service
Handles failed message delivery with retry logic
Uses both Redis (for quick access) and Postgres (for persistence)
"""
from typing import Optional, List, Dict, Any
import json
import uuid
from datetime import datetime, timedelta
import logging

from ..core.config import get_settings
from ..core.database import get_supabase_admin
from ..models.schemas import Platform, QueuedMessage

logger = logging.getLogger(__name__)


class OfflineQueueService:
    """
    Offline queue service for message delivery retry.
    Uses Postgres for persistence (via Supabase RPC functions).
    """

    def __init__(self):
        self.settings = get_settings()
        self.max_retries = 3
        self.retry_delays = [60, 300, 900]  # 1min, 5min, 15min

    async def enqueue(
        self,
        platform: Platform,
        platform_user_id: str,
        content: str,
        message_type: str = "text",
        priority: int = 0,
        error: Optional[str] = None,
    ) -> Optional[str]:
        """
        Add message to offline queue for retry.

        Args:
            platform: Target platform
            platform_user_id: Platform user ID
            content: Message content
            message_type: Message type (text, notification, etc.)
            priority: Priority (higher = more urgent)
            error: Error message if retrying

        Returns:
            Queue item ID or None
        """
        try:
            client = get_supabase_admin()
            result = client.rpc(
                "queue_offline_message",
                {
                    "p_platform_user_id": platform_user_id,
                    "p_platform": platform.value if isinstance(platform, Platform) else platform,
                    "p_message": {"content": content, "error": error},
                    "p_message_type": message_type,
                    "p_priority": priority,
                },
            ).execute()

            queue_id = result.data
            logger.info(f"Enqueued message {queue_id} for {platform}:{platform_user_id}")
            return queue_id

        except Exception as e:
            logger.error(f"Queue enqueue error: {e}")
            return None

    async def dequeue_batch(self, batch_size: int = 10) -> List[Dict[str, Any]]:
        """
        Get batch of messages ready for retry.

        Args:
            batch_size: Max messages to retrieve

        Returns:
            List of queue items
        """
        try:
            client = get_supabase_admin()
            result = client.rpc(
                "process_offline_queue",
                {"p_batch_size": batch_size},
            ).execute()

            return result.data or []

        except Exception as e:
            logger.error(f"Queue dequeue error: {e}")
            return []

    async def mark_delivered(self, queue_id: str) -> bool:
        """Mark queue item as successfully delivered"""
        try:
            client = get_supabase_admin()
            result = client.rpc(
                "mark_queue_delivered",
                {"p_queue_id": queue_id},
            ).execute()

            logger.info(f"Queue item {queue_id} marked as delivered")
            return result.data or False

        except Exception as e:
            logger.error(f"Queue mark delivered error: {e}")
            return False

    async def mark_failed(self, queue_id: str, error: str) -> bool:
        """Mark queue item as failed (will retry or move to DLQ)"""
        try:
            client = get_supabase_admin()
            result = client.rpc(
                "mark_queue_failed",
                {
                    "p_queue_id": queue_id,
                    "p_error": error,
                },
            ).execute()

            logger.info(f"Queue item {queue_id} marked as failed: {error}")
            return result.data or False

        except Exception as e:
            logger.error(f"Queue mark failed error: {e}")
            return False

    async def get_stats(self) -> Dict[str, int]:
        """Get queue statistics"""
        try:
            client = get_supabase_admin()

            # Get counts by status
            pending = (
                client.table("chatbot_offline_queue")
                .select("id", count="exact")
                .eq("status", "pending")
                .execute()
            )
            processing = (
                client.table("chatbot_offline_queue")
                .select("id", count="exact")
                .eq("status", "processing")
                .execute()
            )
            failed = (
                client.table("chatbot_offline_queue")
                .select("id", count="exact")
                .eq("status", "failed")
                .execute()
            )

            return {
                "pending": pending.count or 0,
                "processing": processing.count or 0,
                "failed": failed.count or 0,
            }

        except Exception as e:
            logger.error(f"Queue stats error: {e}")
            return {"pending": 0, "processing": 0, "failed": 0}


# Global instance
offline_queue = OfflineQueueService()


# ============================================================
# Background Worker (to be called by scheduler)
# ============================================================


async def process_offline_queue_worker():
    """
    Background worker to process offline queue.
    Should be run periodically (e.g., every 30 seconds).
    """
    from .ai_service import ai_service
    from ..api.zalo import send_zalo_message
    from ..api.messenger import send_messenger_message

    try:
        # Get pending messages
        messages = await offline_queue.dequeue_batch(10)

        for msg in messages:
            try:
                queue_id = msg.get("id")
                platform = msg.get("platform")
                platform_user_id = msg.get("platform_user_id")
                message_data = msg.get("message", {})
                content = message_data.get("content", "")

                if not content:
                    await offline_queue.mark_delivered(queue_id)
                    continue

                # Send based on platform
                if platform == "zalo":
                    await send_zalo_message(platform_user_id, content)
                elif platform == "messenger":
                    await send_messenger_message(platform_user_id, content)

                await offline_queue.mark_delivered(queue_id)

            except Exception as e:
                logger.error(f"Queue processing error: {e}")
                await offline_queue.mark_failed(msg.get("id"), str(e))

    except Exception as e:
        logger.error(f"Queue worker error: {e}")
