"""
Broadcast Service - Gửi tin nhắn hàng loạt
PHASE 4: TỐI ƯU
KPI: 90%+ broadcast open rate
"""

import logging
import asyncio
import random
from typing import Dict, List, Optional, Any
from datetime import datetime
from dataclasses import dataclass

from ..core.database import get_supabase_admin
from ..adapters.base_adapter import OutgoingMessage, QuickReply

logger = logging.getLogger(__name__)


@dataclass
class BroadcastStats:
    """Broadcast statistics"""
    name: str
    status: str
    total_recipients: int
    sent_count: int
    delivered_count: int
    read_count: int
    clicked_count: int
    replied_count: int
    error_count: int
    open_rate: float
    click_rate: float
    reply_rate: float


@dataclass
class ABVariant:
    """A/B test variant"""
    id: str
    message: str
    weight: int  # Percentage weight


class BroadcastService:
    """
    Broadcast Marketing Service.
    Sends bulk messages to user segments with A/B testing support.
    """

    def __init__(self):
        self.batch_size = 50  # Messages per batch
        self.batch_delay = 1.0  # Seconds between batches

    async def create_broadcast(
        self,
        name: str,
        message_template: str,
        segment_id: Optional[str] = None,
        platforms: Optional[List[str]] = None,
        scheduled_at: Optional[datetime] = None,
        message_type: str = 'text',
        attachments: Optional[List[Dict]] = None,
        quick_replies: Optional[List[Dict]] = None,
        ab_variants: Optional[List[Dict]] = None,
        tags: Optional[List[str]] = None,
        created_by: Optional[str] = None,
    ) -> Optional[str]:
        """
        Create a new broadcast campaign.

        Args:
            name: Campaign name
            message_template: Message template with {{variables}}
            segment_id: Target segment ID
            platforms: Target platforms ['zalo', 'messenger']
            scheduled_at: When to send (None = draft)
            message_type: Type of message
            attachments: List of attachments
            quick_replies: Quick reply buttons
            ab_variants: A/B test variants
            tags: Campaign tags
            created_by: Creator user ID

        Returns:
            Broadcast ID or None on error
        """
        try:
            supabase = get_supabase_admin()

            # Determine status
            status = 'draft'
            if scheduled_at:
                if scheduled_at <= datetime.utcnow():
                    status = 'sending'
                else:
                    status = 'scheduled'

            result = supabase.table('chatbot_broadcasts').insert({
                'name': name,
                'message_template': message_template,
                'message_type': message_type,
                'segment_id': segment_id,
                'platforms': platforms or ['zalo', 'messenger'],
                'status': status,
                'scheduled_at': scheduled_at.isoformat() if scheduled_at else None,
                'attachments': attachments or [],
                'quick_replies': quick_replies or [],
                'is_ab_test': ab_variants is not None and len(ab_variants) > 1,
                'ab_variants': ab_variants,
                'tags': tags or [],
                'created_by': created_by,
            }).execute()

            broadcast_id = result.data[0]['id']

            # Populate recipients
            await self.populate_recipients(broadcast_id)

            logger.info(f"Created broadcast: {name} ({broadcast_id})")
            return broadcast_id

        except Exception as e:
            logger.error(f"Create broadcast error: {e}")
            return None

    async def populate_recipients(self, broadcast_id: str) -> int:
        """
        Populate recipients for a broadcast based on segment.

        Args:
            broadcast_id: Broadcast ID

        Returns:
            Number of recipients added
        """
        try:
            supabase = get_supabase_admin()

            result = supabase.rpc(
                'populate_broadcast_recipients',
                {'p_broadcast_id': broadcast_id}
            ).execute()

            count = result.data if result.data else 0
            logger.info(f"Populated {count} recipients for broadcast {broadcast_id}")
            return count

        except Exception as e:
            logger.error(f"Populate recipients error: {e}")
            return 0

    async def send_broadcast(self, broadcast_id: str) -> Dict:
        """
        Send a broadcast to all recipients.

        Args:
            broadcast_id: Broadcast ID

        Returns:
            Send results with counts
        """
        try:
            supabase = get_supabase_admin()

            # Get broadcast details
            broadcast = supabase.table('chatbot_broadcasts').select(
                '*'
            ).eq('id', broadcast_id).single().execute()

            if not broadcast.data:
                return {'error': 'Broadcast not found'}

            data = broadcast.data

            # Check status
            if data['status'] not in ['draft', 'scheduled', 'paused']:
                return {'error': f"Cannot send broadcast with status: {data['status']}"}

            # Update status to sending
            supabase.table('chatbot_broadcasts').update({
                'status': 'sending',
                'started_at': datetime.utcnow().isoformat(),
            }).eq('id', broadcast_id).execute()

            # Get pending recipients
            recipients = supabase.table('chatbot_broadcast_recipients').select(
                '*, chatbot_platform_users(platform, platform_user_id, display_name)'
            ).eq('broadcast_id', broadcast_id).eq('status', 'pending').execute()

            sent = 0
            errors = 0
            ab_variants = data.get('ab_variants') or []

            # Process in batches
            batch_data = recipients.data or []
            for i in range(0, len(batch_data), self.batch_size):
                batch = batch_data[i:i + self.batch_size]

                for recipient in batch:
                    user = recipient.get('chatbot_platform_users', {})
                    if not user:
                        continue

                    # Select A/B variant if applicable
                    variant_id = None
                    message = data['message_template']

                    if ab_variants:
                        variant = self._select_variant(ab_variants)
                        if variant:
                            variant_id = variant.get('id')
                            message = variant.get('message', message)

                    # Personalize message
                    personalized = self._personalize_message(message, user)

                    # Build quick replies
                    quick_replies = []
                    for qr in (data.get('quick_replies') or []):
                        quick_replies.append(QuickReply(
                            title=qr.get('label', qr.get('title', '')),
                            payload=qr.get('payload', ''),
                        ))

                    # Send message
                    success = await self._send_to_user(
                        platform=user.get('platform'),
                        recipient_id=user.get('platform_user_id'),
                        message=personalized,
                        quick_replies=quick_replies,
                    )

                    # Update recipient status
                    update_data = {
                        'status': 'sent' if success else 'failed',
                        'sent_at': datetime.utcnow().isoformat() if success else None,
                        'variant_id': variant_id,
                        'error_message': None if success else 'Send failed',
                    }
                    supabase.table('chatbot_broadcast_recipients').update(
                        update_data
                    ).eq('id', recipient['id']).execute()

                    if success:
                        sent += 1
                    else:
                        errors += 1

                # Delay between batches to avoid rate limiting
                if i + self.batch_size < len(batch_data):
                    await asyncio.sleep(self.batch_delay)

            # Update broadcast stats
            supabase.table('chatbot_broadcasts').update({
                'status': 'sent',
                'completed_at': datetime.utcnow().isoformat(),
                'sent_count': sent,
                'error_count': errors,
            }).eq('id', broadcast_id).execute()

            logger.info(f"Broadcast {broadcast_id} completed: {sent} sent, {errors} errors")
            return {'sent': sent, 'errors': errors, 'status': 'completed'}

        except Exception as e:
            logger.error(f"Send broadcast error: {e}")

            # Mark as failed
            try:
                supabase = get_supabase_admin()
                supabase.table('chatbot_broadcasts').update({
                    'status': 'failed',
                }).eq('id', broadcast_id).execute()
            except Exception:
                pass

            return {'error': str(e)}

    async def pause_broadcast(self, broadcast_id: str) -> bool:
        """
        Pause a sending broadcast.

        Args:
            broadcast_id: Broadcast ID

        Returns:
            Success status
        """
        try:
            supabase = get_supabase_admin()

            supabase.table('chatbot_broadcasts').update({
                'status': 'paused',
            }).eq('id', broadcast_id).eq('status', 'sending').execute()

            return True

        except Exception as e:
            logger.error(f"Pause broadcast error: {e}")
            return False

    async def cancel_broadcast(self, broadcast_id: str) -> bool:
        """
        Cancel a broadcast (cannot be resumed).

        Args:
            broadcast_id: Broadcast ID

        Returns:
            Success status
        """
        try:
            supabase = get_supabase_admin()

            supabase.table('chatbot_broadcasts').update({
                'status': 'cancelled',
            }).eq('id', broadcast_id).in_(
                'status', ['draft', 'scheduled', 'paused']
            ).execute()

            # Cancel pending recipients
            supabase.table('chatbot_broadcast_recipients').update({
                'status': 'skipped',
            }).eq('broadcast_id', broadcast_id).eq('status', 'pending').execute()

            return True

        except Exception as e:
            logger.error(f"Cancel broadcast error: {e}")
            return False

    async def get_broadcast(self, broadcast_id: str) -> Optional[Dict]:
        """
        Get broadcast details.

        Args:
            broadcast_id: Broadcast ID

        Returns:
            Broadcast data or None
        """
        try:
            supabase = get_supabase_admin()

            result = supabase.table('chatbot_broadcasts').select(
                '*, chatbot_segments(name)'
            ).eq('id', broadcast_id).single().execute()

            return result.data

        except Exception as e:
            logger.error(f"Get broadcast error: {e}")
            return None

    async def list_broadcasts(
        self,
        status: Optional[str] = None,
        limit: int = 20,
        offset: int = 0,
    ) -> List[Dict]:
        """
        List broadcasts.

        Args:
            status: Filter by status
            limit: Maximum results
            offset: Pagination offset

        Returns:
            List of broadcasts
        """
        try:
            supabase = get_supabase_admin()

            query = supabase.table('chatbot_broadcasts').select(
                'id, name, status, scheduled_at, sent_count, error_count, created_at'
            )

            if status:
                query = query.eq('status', status)

            result = query.order('created_at', desc=True).range(
                offset, offset + limit - 1
            ).execute()

            return result.data or []

        except Exception as e:
            logger.error(f"List broadcasts error: {e}")
            return []

    async def get_stats(self, broadcast_id: str) -> Optional[BroadcastStats]:
        """
        Get detailed broadcast statistics.

        Args:
            broadcast_id: Broadcast ID

        Returns:
            BroadcastStats or None
        """
        try:
            supabase = get_supabase_admin()

            result = supabase.rpc(
                'get_broadcast_stats',
                {'p_broadcast_id': broadcast_id}
            ).execute()

            if result.data and len(result.data) > 0:
                s = result.data[0]
                return BroadcastStats(
                    name=s.get('broadcast_name', ''),
                    status=s.get('status', ''),
                    total_recipients=s.get('total_recipients', 0),
                    sent_count=s.get('sent_count', 0),
                    delivered_count=s.get('delivered_count', 0),
                    read_count=s.get('read_count', 0),
                    clicked_count=s.get('clicked_count', 0),
                    replied_count=s.get('replied_count', 0),
                    error_count=s.get('error_count', 0),
                    open_rate=float(s.get('open_rate', 0)),
                    click_rate=float(s.get('click_rate', 0)),
                    reply_rate=float(s.get('reply_rate', 0)),
                )

            return None

        except Exception as e:
            logger.error(f"Get stats error: {e}")
            return None

    async def get_scheduled_broadcasts(self, limit: int = 10) -> List[Dict]:
        """
        Get broadcasts that are due to be sent.

        Args:
            limit: Maximum results

        Returns:
            List of scheduled broadcasts
        """
        try:
            supabase = get_supabase_admin()

            result = supabase.rpc(
                'get_scheduled_broadcasts',
                {'p_limit': limit}
            ).execute()

            return result.data or []

        except Exception as e:
            logger.error(f"Get scheduled broadcasts error: {e}")
            return []

    async def update_recipient_status(
        self,
        recipient_id: str,
        status: str,
        platform_message_id: Optional[str] = None,
    ) -> bool:
        """
        Update recipient status (for delivery/read tracking).

        Args:
            recipient_id: Recipient record ID
            status: New status (delivered, read, clicked, replied)
            platform_message_id: Platform message ID

        Returns:
            Success status
        """
        try:
            supabase = get_supabase_admin()

            update_data = {'status': status}

            if status == 'delivered':
                update_data['delivered_at'] = datetime.utcnow().isoformat()
            elif status == 'read':
                update_data['read_at'] = datetime.utcnow().isoformat()
            elif status == 'clicked':
                update_data['clicked_at'] = datetime.utcnow().isoformat()
            elif status == 'replied':
                update_data['replied_at'] = datetime.utcnow().isoformat()

            if platform_message_id:
                update_data['platform_message_id'] = platform_message_id

            supabase.table('chatbot_broadcast_recipients').update(
                update_data
            ).eq('id', recipient_id).execute()

            # Update broadcast aggregate counts
            await self._update_broadcast_counts(recipient_id)

            return True

        except Exception as e:
            logger.error(f"Update recipient status error: {e}")
            return False

    async def _update_broadcast_counts(self, recipient_id: str):
        """Update broadcast aggregate counts from recipient status"""
        try:
            supabase = get_supabase_admin()

            # Get broadcast ID
            recipient = supabase.table('chatbot_broadcast_recipients').select(
                'broadcast_id'
            ).eq('id', recipient_id).single().execute()

            if not recipient.data:
                return

            broadcast_id = recipient.data['broadcast_id']

            # Count statuses
            counts = supabase.table('chatbot_broadcast_recipients').select(
                'status', count='exact'
            ).eq('broadcast_id', broadcast_id).execute()

            # This is a simplified approach - in production, use SQL aggregation
            delivered = read = clicked = replied = 0

            for row in (counts.data or []):
                if row['status'] in ['delivered', 'read', 'clicked', 'replied']:
                    delivered += 1
                if row['status'] in ['read', 'clicked', 'replied']:
                    read += 1
                if row['status'] in ['clicked', 'replied']:
                    clicked += 1
                if row['status'] == 'replied':
                    replied += 1

            supabase.table('chatbot_broadcasts').update({
                'delivered_count': delivered,
                'read_count': read,
                'clicked_count': clicked,
                'replied_count': replied,
            }).eq('id', broadcast_id).execute()

        except Exception as e:
            logger.error(f"Update broadcast counts error: {e}")

    def _personalize_message(self, template: str, user: Dict) -> str:
        """Replace template variables with user data"""
        message = template

        # Standard replacements
        replacements = {
            '{{name}}': user.get('display_name') or 'bạn',
            '{{platform}}': user.get('platform', ''),
        }

        for var, value in replacements.items():
            message = message.replace(var, str(value))

        return message

    def _select_variant(self, variants: List[Dict]) -> Optional[Dict]:
        """Select A/B variant based on weights"""
        if not variants:
            return None

        # Calculate total weight
        total_weight = sum(v.get('weight', 50) for v in variants)

        # Random selection
        rand = random.randint(1, total_weight)
        cumulative = 0

        for variant in variants:
            cumulative += variant.get('weight', 50)
            if rand <= cumulative:
                return variant

        return variants[0]

    async def _send_to_user(
        self,
        platform: str,
        recipient_id: str,
        message: str,
        quick_replies: Optional[List[QuickReply]] = None,
    ) -> bool:
        """Send message to user via platform adapter"""
        try:
            # Import adapters here to avoid circular imports
            from ..adapters.zalo_adapter import zalo_adapter
            from ..adapters.messenger_adapter import messenger_adapter

            outgoing = OutgoingMessage(
                content=message,
                quick_replies=quick_replies or [],
            )

            if platform == 'zalo':
                return await zalo_adapter.send_message(recipient_id, outgoing)
            elif platform == 'messenger':
                return await messenger_adapter.send_message(recipient_id, outgoing)
            else:
                logger.warning(f"Unknown platform: {platform}")
                return False

        except Exception as e:
            logger.error(f"Send to user error: {e}")
            return False


# Global instance
broadcast_service = BroadcastService()
