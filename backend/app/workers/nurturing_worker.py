"""
Nurturing Background Worker
PHASE 1: MVP

Processes nurturing queue and sends scheduled messages.
"""

import asyncio
import logging
from datetime import datetime, date
from typing import Optional

logger = logging.getLogger(__name__)


class NurturingWorker:
    """
    Background worker for waitlist nurturing automation.
    Checks for due nurturing messages and sends them.
    Also updates daily statistics.
    """

    def __init__(self):
        self.running = False
        self.check_interval = 900  # Check every 15 minutes
        self.batch_size = 50  # Process 50 entries per batch
        self._task: Optional[asyncio.Task] = None
        self._processing = False
        self._last_stats_update: Optional[date] = None

    async def start(self):
        """Start the worker"""
        if self.running:
            logger.warning("Nurturing Worker already running")
            return

        self.running = True
        logger.info("Nurturing Worker started")

        while self.running:
            try:
                # Process nurturing queue
                await self.process_nurturing_queue()

                # Update daily stats once per day
                await self.update_daily_stats()

                # Process failed/pending messages
                await self.process_pending_messages()

            except Exception as e:
                logger.error(f"Nurturing Worker error: {e}")

            # Wait before next check
            await asyncio.sleep(self.check_interval)

    async def stop(self):
        """Stop the worker gracefully"""
        self.running = False
        if self._task:
            self._task.cancel()
            try:
                await self._task
            except asyncio.CancelledError:
                pass
        logger.info("Nurturing Worker stopped")

    def start_background(self):
        """Start worker as background task"""
        self._task = asyncio.create_task(self.start())
        return self._task

    async def process_nurturing_queue(self):
        """Process entries that are due for nurturing"""
        if self._processing:
            logger.debug("Already processing nurturing queue, skipping...")
            return

        self._processing = True

        try:
            from ..services.waitlist_service import waitlist_service

            result = await waitlist_service.process_nurturing_queue(
                batch_size=self.batch_size
            )

            if result['sent'] > 0 or result['failed'] > 0:
                logger.info(
                    f"Nurturing queue processed: {result['sent']} sent, "
                    f"{result['failed']} failed"
                )

        except Exception as e:
            logger.error(f"Process nurturing queue error: {e}")
        finally:
            self._processing = False

    async def process_pending_messages(self):
        """Retry sending failed/queued messages"""
        try:
            from ..core.database import get_supabase_admin

            supabase = get_supabase_admin()

            # Get failed messages from last 24 hours that can be retried
            failed = supabase.table('waitlist_message_logs').select(
                'id, entry_id, message_type, stage'
            ).eq('status', 'failed').gte(
                'sent_at',
                (datetime.utcnow().replace(hour=0, minute=0, second=0)).isoformat()
            ).limit(20).execute()

            if not failed.data:
                return

            logger.info(f"Retrying {len(failed.data)} failed messages")

            from ..services.waitlist_service import waitlist_service

            for msg in failed.data:
                if msg['message_type'] == 'welcome':
                    success = await waitlist_service.send_welcome_message(msg['entry_id'])
                elif msg['message_type'] == 'nurturing' and msg.get('stage'):
                    result = await waitlist_service.send_nurturing_message(
                        msg['entry_id'],
                        msg['stage']
                    )
                    success = result.success
                else:
                    continue

                if success:
                    # Mark old log as retried
                    supabase.table('waitlist_message_logs').update({
                        'status': 'retried',
                    }).eq('id', msg['id']).execute()

                # Rate limit
                await asyncio.sleep(0.6)

        except Exception as e:
            logger.error(f"Process pending messages error: {e}")

    async def update_daily_stats(self):
        """Update daily statistics (runs once per day)"""
        today = date.today()

        if self._last_stats_update == today:
            return

        try:
            from ..core.database import get_supabase_admin

            supabase = get_supabase_admin()

            # Call the stats update function
            supabase.rpc('update_waitlist_daily_stats', {
                'p_date': today.isoformat(),
                'p_new_entries': 0,  # Will be calculated from actual data
                'p_zalo_connected': 0,
            }).execute()

            # Now update with actual counts for today
            today_entries = supabase.table('waitlist_entries').select(
                'id', count='exact'
            ).gte('created_at', today.isoformat()).execute()

            today_zalo = supabase.table('waitlist_entries').select(
                'id', count='exact'
            ).gte('zalo_connected_at', today.isoformat()).execute()

            # Get yesterday's total for calculating new entries
            yesterday_total = supabase.table('waitlist_daily_stats').select(
                'cumulative_total'
            ).eq('date', (datetime.now().date().replace(day=datetime.now().day - 1)).isoformat()
            ).single().execute()

            prev_total = yesterday_total.data.get('cumulative_total', 0) if yesterday_total.data else 0

            # Update today's stats
            current_total = supabase.table('waitlist_entries').select(
                'id', count='exact'
            ).execute()

            supabase.table('waitlist_daily_stats').upsert({
                'date': today.isoformat(),
                'new_entries': today_entries.count or 0,
                'zalo_connected': today_zalo.count or 0,
                'cumulative_total': current_total.count or 0,
            }, on_conflict='date').execute()

            self._last_stats_update = today
            logger.info(f"Daily stats updated for {today}")

        except Exception as e:
            logger.error(f"Update daily stats error: {e}")

    async def get_worker_status(self) -> dict:
        """Get worker status information"""
        try:
            from ..core.database import get_supabase_admin

            supabase = get_supabase_admin()

            # Get entries pending nurturing
            pending = supabase.table('waitlist_entries').select(
                'id', count='exact'
            ).not_.is_('next_nurturing_at', 'null').lte(
                'next_nurturing_at',
                datetime.utcnow().isoformat()
            ).execute()

            # Get entries by nurturing stage
            stages = {}
            for stage in range(0, 6):
                result = supabase.table('waitlist_entries').select(
                    'id', count='exact'
                ).eq('nurturing_stage', stage).execute()
                stages[f'stage_{stage}'] = result.count or 0

            # Get today's message counts
            today = date.today().isoformat()
            messages_today = supabase.table('waitlist_message_logs').select(
                'id', count='exact'
            ).gte('sent_at', today).execute()

            return {
                'running': self.running,
                'processing': self._processing,
                'check_interval': self.check_interval,
                'batch_size': self.batch_size,
                'pending_nurturing': pending.count or 0,
                'stages': stages,
                'messages_today': messages_today.count or 0,
                'last_stats_update': self._last_stats_update.isoformat() if self._last_stats_update else None,
            }

        except Exception as e:
            logger.error(f"Get worker status error: {e}")
            return {
                'running': self.running,
                'processing': self._processing,
                'error': str(e),
            }

    async def send_batch_launch_notifications(
        self,
        batch_size: int = 100,
        app_link: str = "https://app.gemral.com",
    ) -> dict:
        """
        Send launch notifications to eligible entries in batches.

        Args:
            batch_size: Number of entries to process
            app_link: App download/open link

        Returns:
            Dict with sent/failed counts
        """
        try:
            from ..services.waitlist_service import waitlist_service

            entries, _ = await waitlist_service.list_entries(
                status=None,
                has_zalo=True,
                limit=batch_size,
            )

            # Filter to those not yet notified
            eligible = [
                e for e in entries
                if not e.get('launch_notified_at')
                and e.get('status') not in ['unsubscribed', 'invalid']
            ]

            sent = 0
            failed = 0

            for entry in eligible:
                success = await waitlist_service.send_launch_notification(
                    entry['id'],
                    app_link,
                )

                if success:
                    sent += 1
                else:
                    failed += 1

                # Rate limit
                await asyncio.sleep(0.6)

            logger.info(f"Launch notifications: {sent} sent, {failed} failed")
            return {'sent': sent, 'failed': failed, 'total': len(eligible)}

        except Exception as e:
            logger.error(f"Batch launch notifications error: {e}")
            return {'sent': 0, 'failed': 0, 'error': str(e)}


# Global instance
nurturing_worker = NurturingWorker()
