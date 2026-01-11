"""
Cart Recovery Background Worker
PHASE 4: TỐI ƯU

Processes pending cart recovery reminders on a schedule.
"""

import asyncio
import logging
from datetime import datetime
from typing import Optional

logger = logging.getLogger(__name__)


class CartRecoveryWorker:
    """
    Background worker for cart recovery automation.
    Checks for pending reminders and sends them.
    """

    def __init__(self):
        self.running = False
        self.check_interval = 60  # Check every 60 seconds
        self.batch_size = 50  # Process up to 50 reminders per cycle
        self._task: Optional[asyncio.Task] = None

    async def start(self):
        """Start the worker"""
        if self.running:
            logger.warning("Cart Recovery Worker already running")
            return

        self.running = True
        logger.info("Cart Recovery Worker started")

        while self.running:
            try:
                await self.process_pending_reminders()
            except Exception as e:
                logger.error(f"Cart Recovery Worker error: {e}")

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
        logger.info("Cart Recovery Worker stopped")

    def start_background(self):
        """Start worker as background task"""
        self._task = asyncio.create_task(self.start())
        return self._task

    async def process_pending_reminders(self):
        """Process pending cart recovery reminders"""
        # Import here to avoid circular imports
        from ..services.cart_recovery_service import cart_recovery_service

        try:
            # Get pending reminders
            reminders = await cart_recovery_service.get_pending_reminders(
                limit=self.batch_size
            )

            if not reminders:
                return

            logger.info(f"Processing {len(reminders)} pending cart reminders")

            for reminder in reminders:
                try:
                    success = await cart_recovery_service.send_reminder(
                        schedule_id=reminder['schedule_id'],
                        cart_id=reminder['cart_id'],
                        reminder_number=reminder['reminder_number'],
                        platform=reminder['platform'],
                        platform_user_id=reminder['platform_user_external_id'],
                        display_name=reminder.get('display_name'),
                        checkout_url=reminder.get('checkout_url'),
                        items=reminder.get('items', []),
                        item_count=reminder.get('item_count', 0),
                        subtotal=float(reminder.get('subtotal', 0)),
                        currency=reminder.get('currency', 'VND'),
                    )

                    if success:
                        logger.debug(f"Sent reminder {reminder['reminder_number']} for cart {reminder['cart_id']}")
                    else:
                        logger.warning(f"Failed to send reminder for cart {reminder['cart_id']}")

                except Exception as e:
                    logger.error(f"Error processing reminder {reminder['schedule_id']}: {e}")

                # Small delay between sends to avoid rate limiting
                await asyncio.sleep(0.1)

        except Exception as e:
            logger.error(f"Process pending reminders error: {e}")

    async def expire_old_carts(self, max_age_hours: int = 72):
        """
        Expire carts that are too old for recovery.

        Args:
            max_age_hours: Maximum age in hours before expiring
        """
        from ..core.database import get_supabase_admin

        try:
            supabase = get_supabase_admin()

            # Update old carts to expired status
            cutoff = datetime.utcnow().isoformat()

            supabase.table('chatbot_abandoned_carts').update({
                'recovery_status': 'expired'
            }).lt(
                'abandoned_at',
                f"NOW() - INTERVAL '{max_age_hours} hours'"
            ).in_(
                'recovery_status',
                ['abandoned', 'reminder_1', 'reminder_2', 'reminder_3']
            ).execute()

            # Cancel their pending schedules
            supabase.rpc('cancel_expired_cart_schedules', {}).execute()

            logger.info(f"Expired old carts (>{max_age_hours}h)")

        except Exception as e:
            logger.error(f"Expire old carts error: {e}")

    async def get_worker_status(self) -> dict:
        """Get worker status information"""
        from ..services.cart_recovery_service import cart_recovery_service

        stats = await cart_recovery_service.get_stats(days=7)

        return {
            'running': self.running,
            'check_interval': self.check_interval,
            'batch_size': self.batch_size,
            'stats_7d': stats,
        }


# Global instance
cart_recovery_worker = CartRecoveryWorker()
