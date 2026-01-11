"""
Human Handoff Service
Manages handoff from chatbot to human agents
"""

import re
import logging
from typing import Dict, List, Any, Optional, Tuple
from dataclasses import dataclass
from enum import Enum

from ..core.database import get_supabase
from ..core.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()


class HandoffPriority(str, Enum):
    LOW = "low"
    NORMAL = "normal"
    HIGH = "high"
    URGENT = "urgent"


class HandoffStatus(str, Enum):
    WAITING = "waiting"
    ASSIGNED = "assigned"
    IN_PROGRESS = "in_progress"
    RESOLVED = "resolved"
    CANCELLED = "cancelled"
    EXPIRED = "expired"


@dataclass
class HandoffRequest:
    """Represents a handoff request"""
    id: str
    platform_user_id: str
    conversation_id: str
    reason: str
    priority: HandoffPriority
    status: HandoffStatus
    queue_position: Optional[int] = None
    assigned_agent_id: Optional[str] = None
    wait_time_seconds: int = 0


class HandoffService:
    """
    Human Handoff Service

    Features:
    - Trigger phrase detection
    - Urgency detection
    - Handoff queue management
    - Agent assignment
    - CSAT tracking
    """

    def __init__(self):
        # Vietnamese trigger phrases for handoff
        self.trigger_phrases = [
            'gặp support', 'gặp nhân viên', 'nói chuyện với người',
            'cần hỗ trợ', 'cần giúp đỡ', 'cần tư vấn', 'hỗ trợ tôi',
            'không hiểu', 'tức quá', 'giận quá', 'bực quá',
            'muốn khiếu nại', 'khiếu nại', 'complain',
            'refund', 'hoàn tiền', 'trả tiền',
            'gọi cho tôi', 'liên hệ với tôi', 'call me',
            'người thật', 'human', 'agent', 'staff',
            'muốn gặp', 'gặp người', 'nói với người',
            'bot không hiểu', 'ai khác', 'người khác',
            'cần nói chuyện', 'talk to someone'
        ]

        # Urgency indicators
        self.urgency_phrases = [
            'khẩn cấp', 'urgent', 'gấp', 'ngay lập tức',
            'cực kỳ', 'rất gấp', 'asap', 'emergency',
            'ngay bây giờ', 'right now', 'immediately'
        ]

        # Frustration indicators (increase priority)
        self.frustration_phrases = [
            'tức quá', 'giận quá', 'bực quá', 'chán quá',
            'không được', 'lỗi hoài', 'hỏng rồi', 'không hoạt động',
            'mất tiền', 'bị mất', 'stolen', 'scam',
            'terrible', 'awful', 'worst', 'horrible'
        ]

        # Auto-assign setting
        self.auto_assign = getattr(settings, 'HANDOFF_AUTO_ASSIGN', True)
        self.default_priority = HandoffPriority.NORMAL

    def should_trigger(self, message: str) -> Tuple[bool, Optional[str], HandoffPriority]:
        """
        Check if message should trigger handoff.

        Args:
            message: User message text

        Returns:
            Tuple of (should_trigger, reason, priority)
        """
        if not message:
            return False, None, self.default_priority

        message_lower = message.lower().strip()

        # Check trigger phrases
        triggered = False
        matched_phrase = None

        for phrase in self.trigger_phrases:
            if phrase in message_lower:
                triggered = True
                matched_phrase = phrase
                break

        if not triggered:
            return False, None, self.default_priority

        # Determine priority
        priority = self.default_priority

        # Check for urgency
        for phrase in self.urgency_phrases:
            if phrase in message_lower:
                priority = HandoffPriority.URGENT
                break

        # Check for high priority indicators
        if priority != HandoffPriority.URGENT:
            for phrase in self.frustration_phrases:
                if phrase in message_lower:
                    priority = HandoffPriority.HIGH
                    break

        # Build reason
        reason = f"Người dùng yêu cầu hỗ trợ: '{matched_phrase}'"

        return True, reason, priority

    async def create_request(
        self,
        platform_user_id: str,
        conversation_id: str,
        reason: str,
        priority: HandoffPriority = HandoffPriority.NORMAL
    ) -> Optional[HandoffRequest]:
        """
        Create a new handoff request.

        Args:
            platform_user_id: Platform user ID
            conversation_id: Conversation ID
            reason: Reason for handoff
            priority: Priority level

        Returns:
            HandoffRequest if created, None on error
        """
        try:
            supabase = await get_supabase()

            # Call request_handoff RPC
            result = await supabase.rpc(
                'request_handoff',
                {
                    'p_platform_user_id': platform_user_id,
                    'p_conversation_id': conversation_id,
                    'p_reason': reason,
                    'p_priority': priority.value
                }
            ).execute()

            if not result.data:
                logger.error("Failed to create handoff request")
                return None

            handoff_id = result.data

            # Get the created request
            handoff_data = await supabase.from_('chatbot_handoff_queue') \
                .select('*') \
                .eq('id', handoff_id) \
                .single() \
                .execute()

            if not handoff_data.data:
                return None

            handoff = self._parse_handoff(handoff_data.data)

            # Try auto-assign if enabled
            if self.auto_assign:
                await self.try_auto_assign(handoff_id)

            return handoff

        except Exception as e:
            logger.error(f"Handoff create_request error: {e}")
            return None

    async def try_auto_assign(self, handoff_id: Optional[str] = None) -> Optional[str]:
        """
        Try to auto-assign handoff to available agent.

        Args:
            handoff_id: Specific handoff ID, or None to process queue

        Returns:
            Assigned agent ID if successful, None otherwise
        """
        try:
            supabase = await get_supabase()

            result = await supabase.rpc(
                'auto_assign_handoff',
                {'p_handoff_id': handoff_id}
            ).execute()

            return result.data  # Returns agent ID or None

        except Exception as e:
            logger.error(f"Handoff auto_assign error: {e}")
            return None

    async def get_queue_position(self, handoff_id: str) -> int:
        """
        Get current queue position for a handoff.

        Args:
            handoff_id: Handoff request ID

        Returns:
            Queue position (1-based) or 0 if not in queue
        """
        try:
            supabase = await get_supabase()

            result = await supabase.rpc(
                'get_queue_position',
                {'p_handoff_id': handoff_id}
            ).execute()

            return result.data or 0

        except Exception as e:
            logger.error(f"Handoff get_queue_position error: {e}")
            return 0

    async def get_handoff_status(self, handoff_id: str) -> Optional[HandoffRequest]:
        """Get current handoff status"""
        try:
            supabase = await get_supabase()

            result = await supabase.from_('chatbot_handoff_queue') \
                .select('*') \
                .eq('id', handoff_id) \
                .single() \
                .execute()

            if not result.data:
                return None

            return self._parse_handoff(result.data)

        except Exception as e:
            logger.error(f"Handoff get_status error: {e}")
            return None

    async def get_pending_for_conversation(
        self,
        conversation_id: str
    ) -> Optional[HandoffRequest]:
        """
        Get pending handoff for a conversation.

        Args:
            conversation_id: Conversation ID

        Returns:
            HandoffRequest if exists, None otherwise
        """
        try:
            supabase = await get_supabase()

            result = await supabase.from_('chatbot_handoff_queue') \
                .select('*') \
                .eq('conversation_id', conversation_id) \
                .in_('status', ['waiting', 'assigned', 'in_progress']) \
                .order('requested_at', desc=True) \
                .limit(1) \
                .execute()

            if not result.data:
                return None

            return self._parse_handoff(result.data[0])

        except Exception as e:
            logger.error(f"Handoff get_pending error: {e}")
            return None

    async def resolve(
        self,
        handoff_id: str,
        notes: Optional[str] = None,
        csat_score: Optional[int] = None,
        csat_feedback: Optional[str] = None
    ) -> bool:
        """
        Resolve a handoff.

        Args:
            handoff_id: Handoff request ID
            notes: Resolution notes
            csat_score: Customer satisfaction score (1-5)
            csat_feedback: Customer feedback text

        Returns:
            True if resolved successfully
        """
        try:
            supabase = await get_supabase()

            result = await supabase.rpc(
                'resolve_handoff',
                {
                    'p_handoff_id': handoff_id,
                    'p_notes': notes,
                    'p_csat_score': csat_score,
                    'p_csat_feedback': csat_feedback
                }
            ).execute()

            return result.data is True

        except Exception as e:
            logger.error(f"Handoff resolve error: {e}")
            return False

    async def cancel(self, handoff_id: str) -> bool:
        """
        Cancel a handoff request.

        Args:
            handoff_id: Handoff request ID

        Returns:
            True if cancelled successfully
        """
        try:
            supabase = await get_supabase()

            result = await supabase.rpc(
                'cancel_handoff',
                {'p_handoff_id': handoff_id}
            ).execute()

            return result.data is True

        except Exception as e:
            logger.error(f"Handoff cancel error: {e}")
            return False

    async def get_online_agents_count(self) -> int:
        """Get count of online agents"""
        try:
            supabase = await get_supabase()

            result = await supabase.from_('chatbot_agents') \
                .select('id', count='exact') \
                .eq('status', 'online') \
                .execute()

            return result.count or 0

        except Exception as e:
            logger.error(f"Handoff get_online_agents error: {e}")
            return 0

    async def get_queue_info(self) -> Dict[str, Any]:
        """Get queue statistics"""
        try:
            supabase = await get_supabase()

            # Get waiting count
            waiting = await supabase.from_('chatbot_handoff_queue') \
                .select('id', count='exact') \
                .eq('status', 'waiting') \
                .execute()

            # Get online agents
            agents = await supabase.from_('chatbot_agents') \
                .select('id', count='exact') \
                .eq('status', 'online') \
                .execute()

            # Get average wait time (last 24h)
            from datetime import datetime, timedelta
            yesterday = (datetime.utcnow() - timedelta(days=1)).isoformat()

            avg_wait = await supabase.from_('chatbot_handoff_queue') \
                .select('wait_time_seconds') \
                .gte('resolved_at', yesterday) \
                .execute()

            avg_wait_time = 0
            if avg_wait.data:
                wait_times = [r['wait_time_seconds'] for r in avg_wait.data if r.get('wait_time_seconds')]
                if wait_times:
                    avg_wait_time = sum(wait_times) / len(wait_times)

            return {
                'waiting_count': waiting.count or 0,
                'online_agents': agents.count or 0,
                'avg_wait_time_seconds': int(avg_wait_time)
            }

        except Exception as e:
            logger.error(f"Handoff get_queue_info error: {e}")
            return {'waiting_count': 0, 'online_agents': 0, 'avg_wait_time_seconds': 0}

    def format_handoff_message(
        self,
        handoff: HandoffRequest,
        online_agents: int
    ) -> str:
        """
        Format handoff status message for user.

        Args:
            handoff: Handoff request
            online_agents: Number of online agents

        Returns:
            Formatted message string
        """
        if online_agents == 0:
            return (
                "🔔 Yêu cầu hỗ trợ đã được ghi nhận!\n\n"
                "Hiện tại không có nhân viên trực tuyến. "
                "Chúng tôi sẽ liên hệ lại trong giờ hành chính.\n\n"
                "📧 Email: support@gemral.com\n"
                "⏰ Giờ làm việc: 9:00 - 18:00 (T2-T7)"
            )

        if handoff.status == HandoffStatus.ASSIGNED:
            return (
                "✅ Nhân viên hỗ trợ đã nhận yêu cầu!\n\n"
                "Bạn sẽ nhận được phản hồi trong ít phút.\n"
                "Vui lòng chờ trong cuộc trò chuyện này."
            )

        queue_pos = handoff.queue_position or 0
        estimated_wait = queue_pos * 5  # Rough estimate: 5 min per person

        return (
            f"🔔 Yêu cầu hỗ trợ đã được tiếp nhận!\n\n"
            f"📊 Vị trí trong hàng đợi: #{queue_pos}\n"
            f"⏱️ Thời gian chờ dự kiến: ~{estimated_wait} phút\n"
            f"👨‍💼 Nhân viên trực tuyến: {online_agents}\n\n"
            "Vui lòng đợi, nhân viên sẽ hỗ trợ bạn sớm nhất!"
        )

    def _parse_handoff(self, data: Dict[str, Any]) -> HandoffRequest:
        """Parse handoff data to HandoffRequest"""
        return HandoffRequest(
            id=data['id'],
            platform_user_id=data['platform_user_id'],
            conversation_id=data['conversation_id'],
            reason=data.get('reason', ''),
            priority=HandoffPriority(data.get('priority', 'normal')),
            status=HandoffStatus(data.get('status', 'waiting')),
            queue_position=data.get('queue_position'),
            assigned_agent_id=data.get('assigned_agent_id'),
            wait_time_seconds=data.get('wait_time_seconds', 0)
        )


# Global instance
handoff_service = HandoffService()
