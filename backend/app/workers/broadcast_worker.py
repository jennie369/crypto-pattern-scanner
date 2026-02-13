"""
Broadcast Background Worker
PHASE 4: TỐI ƯU

Processes scheduled broadcasts on a schedule.
"""

import asyncio
import logging
from datetime import datetime
from typing import Optional

logger = logging.getLogger(__name__)


class BroadcastWorker:
    """
    Background worker for broadcast automation.
    Checks for scheduled broadcasts and sends them.
    """

    def __init__(self):
        self.running = False
        self.check_interval = 60  # Check every 60 seconds
        self.max_concurrent = 3  # Max concurrent broadcast sends
        self._task: Optional[asyncio.Task] = None
        self._sending_broadcasts: set = set()

    async def start(self):
        """Start the worker"""
        if self.running:
            logger.warning("Broadcast Worker already running")
            return

        self.running = True
        logger.info("Broadcast Worker started")

        while self.running:
            try:
                await self.process_scheduled_broadcasts()
            except Exception as e:
                logger.error(f"Broadcast Worker error: {e}")

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
        logger.info("Broadcast Worker stopped")

    def start_background(self):
        """Start worker as background task"""
        self._task = asyncio.create_task(self.start())
        return self._task

    async def process_scheduled_broadcasts(self):
        """Process scheduled broadcasts that are due"""
        from ..services.broadcast_service import broadcast_service

        try:
            # Check capacity
            available_slots = self.max_concurrent - len(self._sending_broadcasts)
            if available_slots <= 0:
                logger.debug("All broadcast slots in use, waiting...")
                return

            # Get scheduled broadcasts
            broadcasts = await broadcast_service.get_scheduled_broadcasts(
                limit=available_slots
            )

            if not broadcasts:
                return

            logger.info(f"Processing {len(broadcasts)} scheduled broadcasts")

            for broadcast in broadcasts:
                broadcast_id = broadcast['broadcast_id']

                # Skip if already sending
                if broadcast_id in self._sending_broadcasts:
                    continue

                # Mark as sending
                self._sending_broadcasts.add(broadcast_id)

                try:
                    # Send in background to not block other broadcasts
                    asyncio.create_task(
                        self._send_broadcast_with_cleanup(broadcast_id)
                    )
                except Exception as e:
                    logger.error(f"Error starting broadcast {broadcast_id}: {e}")
                    self._sending_broadcasts.discard(broadcast_id)

        except Exception as e:
            logger.error(f"Process scheduled broadcasts error: {e}")

    async def _send_broadcast_with_cleanup(self, broadcast_id: str):
        """Send broadcast and clean up tracking"""
        from ..services.broadcast_service import broadcast_service

        try:
            logger.info(f"Starting broadcast: {broadcast_id}")
            result = await broadcast_service.send_broadcast(broadcast_id)
            logger.info(f"Broadcast {broadcast_id} completed: {result}")
        except Exception as e:
            logger.error(f"Broadcast {broadcast_id} failed: {e}")
        finally:
            self._sending_broadcasts.discard(broadcast_id)

    async def get_worker_status(self) -> dict:
        """Get worker status information"""
        from ..services.broadcast_service import broadcast_service
        from ..core.database import get_supabase_admin

        try:
            supabase = get_supabase_admin()

            # Get counts by status
            result = supabase.table('chatbot_broadcasts').select(
                'status', count='exact'
            ).execute()

            status_counts = {}
            for row in (result.data or []):
                status = row.get('status', 'unknown')
                status_counts[status] = status_counts.get(status, 0) + 1

            return {
                'running': self.running,
                'check_interval': self.check_interval,
                'max_concurrent': self.max_concurrent,
                'currently_sending': list(self._sending_broadcasts),
                'status_counts': status_counts,
            }

        except Exception as e:
            logger.error(f"Get worker status error: {e}")
            return {
                'running': self.running,
                'error': str(e),
            }

    async def retry_failed_broadcasts(self, max_retries: int = 3):
        """
        Retry failed broadcasts.

        Args:
            max_retries: Maximum retry attempts
        """
        from ..core.database import get_supabase_admin
        from ..services.broadcast_service import broadcast_service

        try:
            supabase = get_supabase_admin()

            # Get failed broadcasts that haven't exceeded retry limit
            failed = supabase.table('chatbot_broadcasts').select(
                'id'
            ).eq('status', 'failed').execute()

            for broadcast in (failed.data or []):
                broadcast_id = broadcast['id']

                # Reset status to scheduled
                supabase.table('chatbot_broadcasts').update({
                    'status': 'scheduled',
                    'scheduled_at': datetime.utcnow().isoformat(),
                }).eq('id', broadcast_id).execute()

                logger.info(f"Reset broadcast {broadcast_id} for retry")

        except Exception as e:
            logger.error(f"Retry failed broadcasts error: {e}")


# Global instance
broadcast_worker = BroadcastWorker()
