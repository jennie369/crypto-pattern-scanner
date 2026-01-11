"""
Waitlist Service - Quản lý đăng ký chờ và nurturing campaign
PHASE 1: MVP
KPI: 90%+ Zalo connection rate, 70%+ nurturing completion
"""

import logging
import asyncio
import re
from typing import Dict, List, Optional, Any, Tuple
from datetime import datetime, timedelta
from dataclasses import dataclass

from ..core.database import get_supabase_admin
from ..adapters.base_adapter import OutgoingMessage, QuickReply

logger = logging.getLogger(__name__)


# ============================================================
# Data Classes
# ============================================================

@dataclass
class WaitlistEntry:
    """Waitlist entry data"""
    id: str
    queue_number: int
    phone: str
    name: Optional[str]
    zalo_user_id: Optional[str]
    status: str
    nurturing_stage: int
    referral_code: str
    referred_by: Optional[str]
    referral_count: int
    created_at: datetime
    zalo_connected_at: Optional[datetime]


@dataclass
class WaitlistStats:
    """Waitlist statistics"""
    total_entries: int
    zalo_connected: int
    pending: int
    nurturing: int
    completed: int
    converted: int
    unsubscribed: int
    connection_rate: float
    today_signups: int


@dataclass
class NurturingResult:
    """Result of nurturing send operation"""
    entry_id: str
    stage: int
    success: bool
    error_message: Optional[str]


# ============================================================
# Constants
# ============================================================

VALID_STATUSES = [
    'pending',      # Mới đăng ký, chưa kết nối Zalo
    'verified',     # Đã kết nối Zalo
    'nurturing',    # Đang nhận nurturing
    'completed',    # Hoàn thành nurturing
    'converted',    # Đã convert thành user
    'unsubscribed', # Đã hủy đăng ký
    'invalid',      # SĐT không hợp lệ
]

NURTURING_STAGES = {
    0: 'none',
    1: 'day_0_welcome',
    2: 'day_3_value',
    3: 'day_7_feature',
    4: 'day_10_social_proof',
    5: 'day_14_urgency',
}

# Rate limit: 100 messages per minute for Zalo
ZALO_RATE_LIMIT = 100
ZALO_RATE_WINDOW = 60  # seconds


class WaitlistService:
    """
    Waitlist Management Service.
    Handles registration, Zalo connection, and nurturing campaigns.
    """

    def __init__(self):
        self.batch_size = 50
        self.batch_delay = 1.0  # seconds between batches
        self._last_send_times: List[float] = []

    # ============================================================
    # Registration Methods
    # ============================================================

    async def create_entry(
        self,
        phone: str,
        name: Optional[str] = None,
        referral_code: Optional[str] = None,
        utm_source: Optional[str] = None,
        utm_medium: Optional[str] = None,
        utm_campaign: Optional[str] = None,
    ) -> Tuple[Optional[Dict], Optional[str]]:
        """
        Create new waitlist entry.

        Args:
            phone: Vietnamese phone number (0xxx, +84xxx, 84xxx formats)
            name: Optional user name
            referral_code: Optional referral code from friend
            utm_source: UTM source tracking
            utm_medium: UTM medium tracking
            utm_campaign: UTM campaign tracking

        Returns:
            Tuple of (entry_data, error_message)
        """
        try:
            # Validate phone format
            if not self._validate_phone(phone):
                return None, "Số điện thoại không hợp lệ"

            supabase = get_supabase_admin()

            # Check for existing entry
            existing = supabase.table('waitlist_entries').select(
                'id, queue_number, phone, status, referral_code'
            ).eq('phone', self._normalize_phone(phone)).execute()

            if existing.data and len(existing.data) > 0:
                entry = existing.data[0]
                return {
                    'id': entry['id'],
                    'queue_number': entry['queue_number'],
                    'phone': entry['phone'],
                    'status': entry['status'],
                    'referral_code': entry['referral_code'],
                    'already_exists': True,
                }, None

            # Get referrer ID if referral code provided
            referred_by = None
            if referral_code:
                referrer = supabase.table('waitlist_entries').select(
                    'id'
                ).eq('referral_code', referral_code.upper()).execute()
                if referrer.data and len(referrer.data) > 0:
                    referred_by = referrer.data[0]['id']

            # Create new entry
            result = supabase.table('waitlist_entries').insert({
                'phone': phone,  # Will be normalized by trigger
                'name': name,
                'referred_by': referred_by,
                'utm_source': utm_source,
                'utm_medium': utm_medium,
                'utm_campaign': utm_campaign,
                'status': 'pending',
                'nurturing_stage': 0,
            }).execute()

            if result.data and len(result.data) > 0:
                entry = result.data[0]
                logger.info(f"Created waitlist entry: {entry['queue_number']} - {entry['phone']}")

                # Update daily stats
                await self._update_daily_stats('new_entry')

                return {
                    'id': entry['id'],
                    'queue_number': entry['queue_number'],
                    'phone': entry['phone'],
                    'referral_code': entry['referral_code'],
                    'status': entry['status'],
                    'already_exists': False,
                }, None

            return None, "Không thể tạo đăng ký"

        except Exception as e:
            logger.error(f"Create waitlist entry error: {e}")
            return None, str(e)

    async def check_status(self, phone: str) -> Optional[Dict]:
        """
        Check waitlist status by phone number.

        Args:
            phone: Phone number to check

        Returns:
            Entry status or None if not found
        """
        try:
            supabase = get_supabase_admin()

            result = supabase.table('waitlist_entries').select(
                'id, queue_number, phone, name, status, nurturing_stage, '
                'referral_code, referral_count, zalo_connected_at, created_at'
            ).eq('phone', self._normalize_phone(phone)).execute()

            if result.data and len(result.data) > 0:
                entry = result.data[0]
                return {
                    'queue_number': entry['queue_number'],
                    'status': entry['status'],
                    'nurturing_stage': entry['nurturing_stage'],
                    'referral_code': entry['referral_code'],
                    'referral_count': entry['referral_count'],
                    'zalo_connected': entry['zalo_connected_at'] is not None,
                    'created_at': entry['created_at'],
                }

            return None

        except Exception as e:
            logger.error(f"Check waitlist status error: {e}")
            return None

    async def get_public_stats(self) -> Dict:
        """
        Get public statistics for landing page.

        Returns:
            Dict with total registrations and remaining slots
        """
        try:
            supabase = get_supabase_admin()

            result = supabase.rpc('get_waitlist_public_stats').execute()

            if result.data:
                return result.data

            return {
                'total_entries': 0,
                'remaining_slots': 1000,
                'zalo_connected_count': 0,
            }

        except Exception as e:
            logger.error(f"Get public stats error: {e}")
            return {
                'total_entries': 0,
                'remaining_slots': 1000,
                'zalo_connected_count': 0,
            }

    async def get_referrer_info(self, referral_code: str) -> Optional[Dict]:
        """
        Get referrer information by referral code.

        Args:
            referral_code: Referral code to lookup

        Returns:
            Referrer info or None if not found
        """
        try:
            supabase = get_supabase_admin()

            result = supabase.table('waitlist_entries').select(
                'name, queue_number, referral_count'
            ).eq('referral_code', referral_code.upper()).execute()

            if result.data and len(result.data) > 0:
                entry = result.data[0]
                return {
                    'name': entry['name'] or f"User #{entry['queue_number']}",
                    'referral_count': entry['referral_count'],
                }

            return None

        except Exception as e:
            logger.error(f"Get referrer info error: {e}")
            return None

    # ============================================================
    # Zalo Integration Methods
    # ============================================================

    async def handle_zalo_follow(
        self,
        zalo_user_id: str,
        timestamp: Optional[datetime] = None,
    ) -> Tuple[Optional[Dict], Optional[str]]:
        """
        Handle Zalo OA follow event.
        Attempts to match with existing waitlist entry.

        Args:
            zalo_user_id: Zalo user ID from webhook
            timestamp: Follow event timestamp

        Returns:
            Tuple of (entry_data, error_message)
        """
        try:
            supabase = get_supabase_admin()
            now = timestamp or datetime.utcnow()

            # Check if already linked to an entry
            existing = supabase.table('waitlist_entries').select(
                'id, queue_number, phone, status'
            ).eq('zalo_user_id', zalo_user_id).execute()

            if existing.data and len(existing.data) > 0:
                entry = existing.data[0]
                logger.info(f"Zalo user {zalo_user_id} already linked to entry {entry['id']}")
                return {
                    'id': entry['id'],
                    'queue_number': entry['queue_number'],
                    'status': entry['status'],
                    'already_linked': True,
                }, None

            # Try to get user profile from Zalo
            zalo_profile = await self._get_zalo_profile(zalo_user_id)
            display_name = zalo_profile.get('name') if zalo_profile else None

            # Create new entry for Zalo followers who didn't register via form
            result = supabase.table('waitlist_entries').insert({
                'phone': None,  # Will be filled later
                'name': display_name,
                'zalo_user_id': zalo_user_id,
                'zalo_display_name': display_name,
                'zalo_avatar_url': zalo_profile.get('avatar_url') if zalo_profile else None,
                'zalo_connected_at': now.isoformat(),
                'status': 'verified',
                'nurturing_stage': 0,
                'utm_source': 'zalo_direct',
            }).execute()

            if result.data and len(result.data) > 0:
                entry = result.data[0]
                logger.info(f"Created waitlist entry from Zalo follow: {entry['id']}")

                # Update daily stats
                await self._update_daily_stats('zalo_connected')

                # Send welcome message
                await self.send_welcome_message(entry['id'])

                return {
                    'id': entry['id'],
                    'queue_number': entry['queue_number'],
                    'status': entry['status'],
                    'already_linked': False,
                }, None

            return None, "Không thể tạo đăng ký từ Zalo"

        except Exception as e:
            logger.error(f"Handle Zalo follow error: {e}")
            return None, str(e)

    async def handle_zalo_unfollow(self, zalo_user_id: str) -> bool:
        """
        Handle Zalo OA unfollow event.
        Pauses nurturing for the user.

        Args:
            zalo_user_id: Zalo user ID

        Returns:
            Success status
        """
        try:
            supabase = get_supabase_admin()

            supabase.table('waitlist_entries').update({
                'status': 'unsubscribed',
                'next_nurturing_at': None,
            }).eq('zalo_user_id', zalo_user_id).execute()

            logger.info(f"Zalo user {zalo_user_id} unfollowed, nurturing paused")
            return True

        except Exception as e:
            logger.error(f"Handle Zalo unfollow error: {e}")
            return False

    async def manual_link_zalo(
        self,
        entry_id: str,
        zalo_user_id: str,
    ) -> Tuple[bool, Optional[str]]:
        """
        Manually link Zalo user to waitlist entry.

        Args:
            entry_id: Waitlist entry ID
            zalo_user_id: Zalo user ID

        Returns:
            Tuple of (success, error_message)
        """
        try:
            supabase = get_supabase_admin()
            now = datetime.utcnow()

            # Check if Zalo ID already linked
            existing = supabase.table('waitlist_entries').select(
                'id'
            ).eq('zalo_user_id', zalo_user_id).neq('id', entry_id).execute()

            if existing.data and len(existing.data) > 0:
                return False, "Zalo ID đã được liên kết với đăng ký khác"

            # Get Zalo profile
            zalo_profile = await self._get_zalo_profile(zalo_user_id)

            # Update entry
            supabase.table('waitlist_entries').update({
                'zalo_user_id': zalo_user_id,
                'zalo_display_name': zalo_profile.get('name') if zalo_profile else None,
                'zalo_avatar_url': zalo_profile.get('avatar_url') if zalo_profile else None,
                'zalo_connected_at': now.isoformat(),
                'status': 'verified',
            }).eq('id', entry_id).execute()

            # Update daily stats
            await self._update_daily_stats('zalo_connected')

            logger.info(f"Manually linked Zalo {zalo_user_id} to entry {entry_id}")
            return True, None

        except Exception as e:
            logger.error(f"Manual link Zalo error: {e}")
            return False, str(e)

    # ============================================================
    # Messaging Methods
    # ============================================================

    async def send_welcome_message(self, entry_id: str) -> bool:
        """
        Send welcome message to new Zalo follower.

        Args:
            entry_id: Waitlist entry ID

        Returns:
            Success status
        """
        try:
            supabase = get_supabase_admin()

            # Get entry
            entry = supabase.table('waitlist_entries').select(
                'id, zalo_user_id, name, zalo_display_name, queue_number, referral_code'
            ).eq('id', entry_id).single().execute()

            if not entry.data:
                logger.error(f"Entry not found: {entry_id}")
                return False

            data = entry.data
            if not data.get('zalo_user_id'):
                logger.error(f"Entry {entry_id} has no Zalo connection")
                return False

            # Get welcome message template (stage 1)
            template = supabase.table('nurturing_messages').select(
                'message_template, quick_actions'
            ).eq('stage', 1).eq('is_active', True).single().execute()

            if not template.data:
                logger.error("Welcome message template not found")
                return False

            # Personalize message
            name = data.get('name') or data.get('zalo_display_name') or 'bạn'
            message = self._personalize_message(
                template.data['message_template'],
                name=name,
                queue_number=data.get('queue_number', 0),
                referral_code=data.get('referral_code', ''),
            )

            # Build quick replies
            quick_replies = []
            for action in (template.data.get('quick_actions') or []):
                quick_replies.append(QuickReply(
                    title=action.get('label', ''),
                    payload=action.get('payload', ''),
                ))

            # Send via Zalo
            success = await self._send_zalo_message(
                zalo_user_id=data['zalo_user_id'],
                message=message,
                quick_replies=quick_replies,
            )

            # Log message
            await self._log_message(
                entry_id=entry_id,
                message_type='welcome',
                stage=1,
                content=message,
                status='sent' if success else 'failed',
            )

            if success:
                # Update nurturing stage and schedule next
                next_time = datetime.utcnow() + timedelta(days=3)
                supabase.table('waitlist_entries').update({
                    'nurturing_stage': 1,
                    'status': 'nurturing',
                    'next_nurturing_at': next_time.isoformat(),
                }).eq('id', entry_id).execute()

            return success

        except Exception as e:
            logger.error(f"Send welcome message error: {e}")
            return False

    async def send_nurturing_message(
        self,
        entry_id: str,
        stage: int,
    ) -> NurturingResult:
        """
        Send nurturing message for specific stage.

        Args:
            entry_id: Waitlist entry ID
            stage: Nurturing stage (2-5)

        Returns:
            NurturingResult with success status
        """
        try:
            supabase = get_supabase_admin()

            # Validate stage
            if stage < 2 or stage > 5:
                return NurturingResult(
                    entry_id=entry_id,
                    stage=stage,
                    success=False,
                    error_message="Invalid nurturing stage",
                )

            # Get entry
            entry = supabase.table('waitlist_entries').select(
                'id, zalo_user_id, name, zalo_display_name, queue_number, '
                'referral_code, nurturing_stage, status'
            ).eq('id', entry_id).single().execute()

            if not entry.data:
                return NurturingResult(
                    entry_id=entry_id,
                    stage=stage,
                    success=False,
                    error_message="Entry not found",
                )

            data = entry.data

            # Check if can send
            if not data.get('zalo_user_id'):
                return NurturingResult(
                    entry_id=entry_id,
                    stage=stage,
                    success=False,
                    error_message="No Zalo connection",
                )

            if data['status'] in ['unsubscribed', 'converted', 'invalid']:
                return NurturingResult(
                    entry_id=entry_id,
                    stage=stage,
                    success=False,
                    error_message=f"Cannot send to {data['status']} entry",
                )

            # Check if stage already completed
            if data['nurturing_stage'] >= stage:
                return NurturingResult(
                    entry_id=entry_id,
                    stage=stage,
                    success=False,
                    error_message=f"Stage {stage} already completed",
                )

            # Get message template
            template = supabase.table('nurturing_messages').select(
                'message_template, quick_actions, days_after_signup'
            ).eq('stage', stage).eq('is_active', True).single().execute()

            if not template.data:
                return NurturingResult(
                    entry_id=entry_id,
                    stage=stage,
                    success=False,
                    error_message=f"Template for stage {stage} not found",
                )

            # Personalize message
            name = data.get('name') or data.get('zalo_display_name') or 'bạn'
            message = self._personalize_message(
                template.data['message_template'],
                name=name,
                queue_number=data.get('queue_number', 0),
                referral_code=data.get('referral_code', ''),
            )

            # Build quick replies
            quick_replies = []
            for action in (template.data.get('quick_actions') or []):
                quick_replies.append(QuickReply(
                    title=action.get('label', ''),
                    payload=action.get('payload', ''),
                ))

            # Check rate limit
            if not self._check_rate_limit():
                return NurturingResult(
                    entry_id=entry_id,
                    stage=stage,
                    success=False,
                    error_message="Rate limit exceeded, will retry later",
                )

            # Send via Zalo
            success = await self._send_zalo_message(
                zalo_user_id=data['zalo_user_id'],
                message=message,
                quick_replies=quick_replies,
            )

            # Log message
            await self._log_message(
                entry_id=entry_id,
                message_type='nurturing',
                stage=stage,
                content=message,
                status='sent' if success else 'failed',
            )

            if success:
                # Calculate next nurturing time
                next_stage = stage + 1
                next_time = None
                new_status = 'nurturing'

                if next_stage <= 5:
                    # Get days for next stage
                    next_template = supabase.table('nurturing_messages').select(
                        'days_after_signup'
                    ).eq('stage', next_stage).eq('is_active', True).single().execute()

                    if next_template.data:
                        days_diff = next_template.data['days_after_signup'] - template.data['days_after_signup']
                        next_time = datetime.utcnow() + timedelta(days=days_diff)
                else:
                    new_status = 'completed'

                # Update entry
                supabase.table('waitlist_entries').update({
                    'nurturing_stage': stage,
                    'status': new_status,
                    'next_nurturing_at': next_time.isoformat() if next_time else None,
                }).eq('id', entry_id).execute()

            return NurturingResult(
                entry_id=entry_id,
                stage=stage,
                success=success,
                error_message=None if success else "Failed to send message",
            )

        except Exception as e:
            logger.error(f"Send nurturing message error: {e}")
            return NurturingResult(
                entry_id=entry_id,
                stage=stage,
                success=False,
                error_message=str(e),
            )

    async def process_nurturing_queue(
        self,
        batch_size: int = 50,
    ) -> Dict[str, int]:
        """
        Process nurturing queue - sends due messages.

        Args:
            batch_size: Number of entries to process

        Returns:
            Dict with sent/failed counts
        """
        try:
            supabase = get_supabase_admin()

            # Get entries due for nurturing
            result = supabase.rpc(
                'get_waitlist_nurturing_queue',
                {'batch_size': batch_size}
            ).execute()

            entries = result.data or []
            sent = 0
            failed = 0

            for entry in entries:
                next_stage = entry['nurturing_stage'] + 1

                if next_stage > 5:
                    # Mark as completed
                    supabase.table('waitlist_entries').update({
                        'status': 'completed',
                        'next_nurturing_at': None,
                    }).eq('id', entry['id']).execute()
                    continue

                result = await self.send_nurturing_message(
                    entry_id=entry['id'],
                    stage=next_stage,
                )

                if result.success:
                    sent += 1
                else:
                    failed += 1

                # Rate limit delay
                await asyncio.sleep(0.6)  # ~100 per minute

            logger.info(f"Nurturing queue processed: {sent} sent, {failed} failed")
            return {'sent': sent, 'failed': failed}

        except Exception as e:
            logger.error(f"Process nurturing queue error: {e}")
            return {'sent': 0, 'failed': 0}

    async def send_launch_notification(
        self,
        entry_id: str,
        app_link: str = "https://app.gemral.com",
    ) -> bool:
        """
        Send app launch notification to user.

        Args:
            entry_id: Waitlist entry ID
            app_link: Link to download/open app

        Returns:
            Success status
        """
        try:
            supabase = get_supabase_admin()

            # Get entry
            entry = supabase.table('waitlist_entries').select(
                'id, zalo_user_id, name, zalo_display_name, queue_number, status, launch_notified_at'
            ).eq('id', entry_id).single().execute()

            if not entry.data:
                logger.error(f"Entry not found: {entry_id}")
                return False

            data = entry.data

            # Check if already notified
            if data.get('launch_notified_at'):
                logger.info(f"Entry {entry_id} already notified about launch")
                return True

            if not data.get('zalo_user_id'):
                logger.error(f"Entry {entry_id} has no Zalo connection")
                return False

            if data['status'] in ['unsubscribed', 'invalid']:
                return False

            # Build launch message
            name = data.get('name') or data.get('zalo_display_name') or 'bạn'
            message = (
                f"Chào {name}!\n\n"
                f"Tin vui! Gemral App đã chính thức ra mắt!\n\n"
                f"Với vị trí #{data['queue_number']} trong waitlist, "
                f"bạn được ưu tiên trải nghiệm sớm nhất.\n\n"
                f"Tải app ngay: {app_link}\n\n"
                f"Cảm ơn bạn đã kiên nhẫn chờ đợi!"
            )

            quick_replies = [
                QuickReply(title="Tải App Ngay", payload="download_app"),
                QuickReply(title="Xem Hướng Dẫn", payload="view_guide"),
            ]

            success = await self._send_zalo_message(
                zalo_user_id=data['zalo_user_id'],
                message=message,
                quick_replies=quick_replies,
            )

            if success:
                supabase.table('waitlist_entries').update({
                    'launch_notified_at': datetime.utcnow().isoformat(),
                    'status': 'converted',
                }).eq('id', entry_id).execute()

                await self._log_message(
                    entry_id=entry_id,
                    message_type='launch',
                    stage=0,
                    content=message,
                    status='sent',
                )

            return success

        except Exception as e:
            logger.error(f"Send launch notification error: {e}")
            return False

    async def send_broadcast(
        self,
        message: str,
        status_filter: Optional[List[str]] = None,
        limit: int = 1000,
    ) -> Dict[str, int]:
        """
        Send broadcast message to waitlist entries.

        Args:
            message: Message content
            status_filter: Filter by status (default: verified, nurturing, completed)
            limit: Maximum recipients

        Returns:
            Dict with sent/failed counts
        """
        try:
            supabase = get_supabase_admin()

            statuses = status_filter or ['verified', 'nurturing', 'completed']

            # Get entries with Zalo connection
            query = supabase.table('waitlist_entries').select(
                'id, zalo_user_id, name, zalo_display_name'
            ).not_.is_('zalo_user_id', 'null').in_('status', statuses).limit(limit)

            result = query.execute()
            entries = result.data or []

            if not entries:
                return {'sent': 0, 'failed': 0, 'total': 0}

            sent = 0
            failed = 0

            for entry in entries:
                name = entry.get('name') or entry.get('zalo_display_name') or 'bạn'
                personalized = message.replace('{{name}}', name)

                success = await self._send_zalo_message(
                    zalo_user_id=entry['zalo_user_id'],
                    message=personalized,
                )

                if success:
                    sent += 1
                else:
                    failed += 1

                await self._log_message(
                    entry_id=entry['id'],
                    message_type='broadcast',
                    stage=0,
                    content=personalized,
                    status='sent' if success else 'failed',
                )

                # Rate limit
                await asyncio.sleep(0.6)

            logger.info(f"Broadcast completed: {sent} sent, {failed} failed")
            return {'sent': sent, 'failed': failed, 'total': len(entries)}

        except Exception as e:
            logger.error(f"Send broadcast error: {e}")
            return {'sent': 0, 'failed': 0, 'total': 0}

    # ============================================================
    # Admin Methods
    # ============================================================

    async def list_entries(
        self,
        status: Optional[str] = None,
        has_zalo: Optional[bool] = None,
        search: Optional[str] = None,
        limit: int = 50,
        offset: int = 0,
    ) -> Tuple[List[Dict], int]:
        """
        List waitlist entries with filters.

        Args:
            status: Filter by status
            has_zalo: Filter by Zalo connection
            search: Search in phone/name
            limit: Page size
            offset: Page offset

        Returns:
            Tuple of (entries, total_count)
        """
        try:
            supabase = get_supabase_admin()

            query = supabase.table('waitlist_entries').select(
                'id, queue_number, phone, name, zalo_user_id, zalo_display_name, '
                'status, nurturing_stage, referral_code, referral_count, '
                'utm_source, created_at, zalo_connected_at, next_nurturing_at',
                count='exact'
            )

            if status:
                query = query.eq('status', status)

            if has_zalo is True:
                query = query.not_.is_('zalo_user_id', 'null')
            elif has_zalo is False:
                query = query.is_('zalo_user_id', 'null')

            if search:
                query = query.or_(f"phone.ilike.%{search}%,name.ilike.%{search}%")

            result = query.order('created_at', desc=True).range(
                offset, offset + limit - 1
            ).execute()

            total = result.count or 0
            return result.data or [], total

        except Exception as e:
            logger.error(f"List entries error: {e}")
            return [], 0

    async def get_entry(self, entry_id: str) -> Optional[Dict]:
        """
        Get single waitlist entry with full details.

        Args:
            entry_id: Entry ID

        Returns:
            Entry data or None
        """
        try:
            supabase = get_supabase_admin()

            result = supabase.table('waitlist_entries').select(
                '*'
            ).eq('id', entry_id).single().execute()

            return result.data

        except Exception as e:
            logger.error(f"Get entry error: {e}")
            return None

    async def update_entry_status(
        self,
        entry_id: str,
        status: str,
    ) -> bool:
        """
        Update entry status.

        Args:
            entry_id: Entry ID
            status: New status

        Returns:
            Success status
        """
        try:
            if status not in VALID_STATUSES:
                logger.error(f"Invalid status: {status}")
                return False

            supabase = get_supabase_admin()

            update_data = {'status': status}

            # Clear next nurturing if unsubscribed
            if status in ['unsubscribed', 'converted', 'invalid']:
                update_data['next_nurturing_at'] = None

            supabase.table('waitlist_entries').update(
                update_data
            ).eq('id', entry_id).execute()

            return True

        except Exception as e:
            logger.error(f"Update entry status error: {e}")
            return False

    async def get_stats(self) -> WaitlistStats:
        """
        Get detailed waitlist statistics.

        Returns:
            WaitlistStats object
        """
        try:
            supabase = get_supabase_admin()

            # Get counts by status
            total = supabase.table('waitlist_entries').select(
                'id', count='exact'
            ).execute()

            zalo = supabase.table('waitlist_entries').select(
                'id', count='exact'
            ).not_.is_('zalo_user_id', 'null').execute()

            pending = supabase.table('waitlist_entries').select(
                'id', count='exact'
            ).eq('status', 'pending').execute()

            nurturing = supabase.table('waitlist_entries').select(
                'id', count='exact'
            ).eq('status', 'nurturing').execute()

            completed = supabase.table('waitlist_entries').select(
                'id', count='exact'
            ).eq('status', 'completed').execute()

            converted = supabase.table('waitlist_entries').select(
                'id', count='exact'
            ).eq('status', 'converted').execute()

            unsubscribed = supabase.table('waitlist_entries').select(
                'id', count='exact'
            ).eq('status', 'unsubscribed').execute()

            today = datetime.utcnow().date()
            today_signups = supabase.table('waitlist_entries').select(
                'id', count='exact'
            ).gte('created_at', today.isoformat()).execute()

            total_count = total.count or 0
            zalo_count = zalo.count or 0
            connection_rate = (zalo_count / total_count * 100) if total_count > 0 else 0

            return WaitlistStats(
                total_entries=total_count,
                zalo_connected=zalo_count,
                pending=pending.count or 0,
                nurturing=nurturing.count or 0,
                completed=completed.count or 0,
                converted=converted.count or 0,
                unsubscribed=unsubscribed.count or 0,
                connection_rate=round(connection_rate, 1),
                today_signups=today_signups.count or 0,
            )

        except Exception as e:
            logger.error(f"Get stats error: {e}")
            return WaitlistStats(
                total_entries=0,
                zalo_connected=0,
                pending=0,
                nurturing=0,
                completed=0,
                converted=0,
                unsubscribed=0,
                connection_rate=0,
                today_signups=0,
            )

    async def get_message_log(
        self,
        entry_id: str,
        limit: int = 50,
    ) -> List[Dict]:
        """
        Get message log for entry.

        Args:
            entry_id: Entry ID
            limit: Max messages

        Returns:
            List of message logs
        """
        try:
            supabase = get_supabase_admin()

            result = supabase.table('waitlist_message_logs').select(
                'id, message_type, stage, content, status, sent_at, error_message'
            ).eq('entry_id', entry_id).order(
                'sent_at', desc=True
            ).limit(limit).execute()

            return result.data or []

        except Exception as e:
            logger.error(f"Get message log error: {e}")
            return []

    async def export_entries(
        self,
        format: str = 'json',
        status: Optional[str] = None,
    ) -> List[Dict]:
        """
        Export waitlist entries.

        Args:
            format: Export format (json/csv)
            status: Filter by status

        Returns:
            List of entries for export
        """
        try:
            supabase = get_supabase_admin()

            query = supabase.table('waitlist_entries').select(
                'queue_number, phone, name, zalo_display_name, status, '
                'nurturing_stage, referral_code, referral_count, '
                'utm_source, utm_medium, utm_campaign, '
                'created_at, zalo_connected_at'
            )

            if status:
                query = query.eq('status', status)

            result = query.order('queue_number').execute()

            return result.data or []

        except Exception as e:
            logger.error(f"Export entries error: {e}")
            return []

    # ============================================================
    # Private Helper Methods
    # ============================================================

    def _validate_phone(self, phone: str) -> bool:
        """Validate Vietnamese phone number format"""
        if not phone:
            return False

        # Remove spaces and dashes
        cleaned = re.sub(r'[\s\-]', '', phone)

        # Match Vietnamese patterns
        patterns = [
            r'^0\d{9}$',        # 0xxxxxxxxx
            r'^\+84\d{9}$',     # +84xxxxxxxxx
            r'^84\d{9}$',       # 84xxxxxxxxx
        ]

        for pattern in patterns:
            if re.match(pattern, cleaned):
                return True

        return False

    def _normalize_phone(self, phone: str) -> str:
        """Normalize phone to +84 format"""
        if not phone:
            return phone

        cleaned = re.sub(r'[\s\-]', '', phone)

        if cleaned.startswith('0'):
            return '+84' + cleaned[1:]
        elif cleaned.startswith('84') and not cleaned.startswith('+84'):
            return '+' + cleaned
        elif cleaned.startswith('+84'):
            return cleaned

        return cleaned

    def _personalize_message(
        self,
        template: str,
        name: str = 'bạn',
        queue_number: int = 0,
        referral_code: str = '',
    ) -> str:
        """Personalize message template with user data"""
        message = template
        message = message.replace('{{name}}', name)
        message = message.replace('{{queue_number}}', str(queue_number))
        message = message.replace('{{referral_code}}', referral_code)
        return message

    def _check_rate_limit(self) -> bool:
        """Check if within Zalo rate limit"""
        now = asyncio.get_event_loop().time()
        window_start = now - ZALO_RATE_WINDOW

        # Remove old timestamps
        self._last_send_times = [t for t in self._last_send_times if t > window_start]

        if len(self._last_send_times) >= ZALO_RATE_LIMIT:
            return False

        self._last_send_times.append(now)
        return True

    async def _send_zalo_message(
        self,
        zalo_user_id: str,
        message: str,
        quick_replies: Optional[List[QuickReply]] = None,
    ) -> bool:
        """Send message via Zalo adapter"""
        try:
            from ..adapters.zalo_adapter import zalo_adapter

            outgoing = OutgoingMessage(
                content=message,
                quick_replies=quick_replies or [],
            )

            return await zalo_adapter.send_message(zalo_user_id, outgoing)

        except Exception as e:
            logger.error(f"Zalo send error: {e}")
            return False

    async def _get_zalo_profile(self, zalo_user_id: str) -> Optional[Dict]:
        """Get Zalo user profile"""
        try:
            from ..adapters.zalo_adapter import zalo_adapter
            return await zalo_adapter.get_user_profile(zalo_user_id)
        except Exception as e:
            logger.error(f"Get Zalo profile error: {e}")
            return None

    async def _log_message(
        self,
        entry_id: str,
        message_type: str,
        stage: int,
        content: str,
        status: str,
        error_message: Optional[str] = None,
    ):
        """Log sent message to database"""
        try:
            supabase = get_supabase_admin()

            supabase.table('waitlist_message_logs').insert({
                'entry_id': entry_id,
                'message_type': message_type,
                'stage': stage,
                'content': content,
                'status': status,
                'error_message': error_message,
                'sent_at': datetime.utcnow().isoformat(),
            }).execute()

        except Exception as e:
            logger.error(f"Log message error: {e}")

    async def _update_daily_stats(self, event_type: str):
        """Update daily statistics"""
        try:
            supabase = get_supabase_admin()
            today = datetime.utcnow().date().isoformat()

            if event_type == 'new_entry':
                supabase.rpc('update_waitlist_daily_stats', {
                    'p_date': today,
                    'p_new_entries': 1,
                    'p_zalo_connected': 0,
                }).execute()
            elif event_type == 'zalo_connected':
                supabase.rpc('update_waitlist_daily_stats', {
                    'p_date': today,
                    'p_new_entries': 0,
                    'p_zalo_connected': 1,
                }).execute()

        except Exception as e:
            logger.error(f"Update daily stats error: {e}")


# Global instance
waitlist_service = WaitlistService()
