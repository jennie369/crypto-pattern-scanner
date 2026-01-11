"""
Cart Recovery Service - Tự động nhắc mua hàng
PHASE 4: TỐI ƯU
KPI: 25%+ cart recovery rate
"""

import logging
import uuid
from typing import Dict, List, Optional, Any
from datetime import datetime, timedelta
from dataclasses import dataclass

from ..core.database import get_supabase_admin
from ..adapters.base_adapter import OutgoingMessage, QuickReply

logger = logging.getLogger(__name__)


@dataclass
class CartItem:
    """Cart item data"""
    product_id: str
    title: str
    quantity: int
    price: float
    image_url: Optional[str] = None


@dataclass
class AbandonedCart:
    """Abandoned cart data"""
    id: str
    platform_user_id: str
    shopify_cart_id: Optional[str]
    checkout_url: Optional[str]
    items: List[Dict]
    item_count: int
    subtotal: float
    currency: str
    recovery_status: str
    discount_code: Optional[str]
    discount_percent: Optional[int]


class CartRecoveryService:
    """
    Cart Recovery Service for abandoned cart automation.
    Sends reminder messages to users who abandoned their shopping carts.
    """

    def __init__(self):
        # Reminder templates (Vietnamese)
        self.templates = {
            1: """Xin chào {name}!

Bạn còn {item_count} sản phẩm trong giỏ hàng:
{items_preview}

Tổng: {subtotal}

Hoàn tất đơn hàng: {checkout_url}

Cần hỗ trợ? Chat với Gemral nhé!""",

            2: """Chào {name}!

Giỏ hàng của bạn vẫn đang chờ đó!

{items_preview}

Số lượng có hạn, đừng bỏ lỡ!

Mua ngay: {checkout_url}""",

            3: """ƯU ĐÃI ĐẶC BIỆT cho {name}!

Gemral tặng bạn mã giảm giá {discount_percent}%: {discount_code}

Áp dụng cho giỏ hàng:
{items_preview}

Chỉ còn: {discounted_total}

Mã hết hạn sau 24h!

Dùng ngay: {checkout_url}"""
        }

        # Quick replies for cart reminders
        self.quick_replies = [
            QuickReply(title="Mua ngay", payload="cart_checkout"),
            QuickReply(title="Xem giỏ hàng", payload="cart_view"),
            QuickReply(title="Hỏi Gemral", payload="cart_help"),
        ]

    async def track_abandoned_cart(
        self,
        platform_user_id: str,
        shopify_cart_id: Optional[str],
        checkout_url: Optional[str],
        items: List[Dict],
        subtotal: float,
        currency: str = 'VND',
    ) -> Optional[str]:
        """
        Track an abandoned cart and schedule reminders.

        Args:
            platform_user_id: Platform user UUID
            shopify_cart_id: Shopify cart ID
            checkout_url: URL to checkout
            items: List of cart items
            subtotal: Cart subtotal
            currency: Currency code

        Returns:
            Cart ID or None on error
        """
        try:
            supabase = get_supabase_admin()

            result = supabase.rpc(
                'track_abandoned_cart',
                {
                    'p_platform_user_id': platform_user_id,
                    'p_shopify_cart_id': shopify_cart_id,
                    'p_checkout_url': checkout_url,
                    'p_items': items,
                    'p_subtotal': subtotal,
                    'p_currency': currency,
                }
            ).execute()

            cart_id = result.data
            logger.info(f"Tracked abandoned cart: {cart_id}")
            return cart_id

        except Exception as e:
            logger.error(f"Track abandoned cart error: {e}")
            return None

    async def get_pending_reminders(self, limit: int = 50) -> List[Dict]:
        """
        Get reminders that are due to be sent.

        Args:
            limit: Maximum reminders to fetch

        Returns:
            List of pending reminders with cart and user data
        """
        try:
            supabase = get_supabase_admin()

            result = supabase.rpc(
                'get_pending_reminders',
                {'p_limit': limit}
            ).execute()

            return result.data or []

        except Exception as e:
            logger.error(f"Get pending reminders error: {e}")
            return []

    async def send_reminder(
        self,
        schedule_id: str,
        cart_id: str,
        reminder_number: int,
        platform: str,
        platform_user_id: str,
        display_name: Optional[str],
        checkout_url: Optional[str],
        items: List[Dict],
        item_count: int,
        subtotal: float,
        currency: str,
    ) -> bool:
        """
        Send a cart recovery reminder.

        Args:
            schedule_id: Schedule record ID
            cart_id: Cart ID
            reminder_number: Reminder number (1, 2, or 3)
            platform: User platform (zalo/messenger)
            platform_user_id: Platform-specific user ID
            display_name: User's display name
            checkout_url: Checkout URL
            items: Cart items
            item_count: Number of items
            subtotal: Cart subtotal
            currency: Currency

        Returns:
            Success status
        """
        try:
            supabase = get_supabase_admin()

            # Generate discount for reminder 3
            discount_code = None
            discount_percent = 0
            discounted_total = subtotal

            if reminder_number == 3:
                discount_code = f"COMEBACK{uuid.uuid4().hex[:6].upper()}"
                discount_percent = 10
                discounted_total = subtotal * 0.9

                # Save discount to cart
                supabase.table('chatbot_abandoned_carts').update({
                    'discount_code': discount_code,
                    'discount_percent': discount_percent,
                }).eq('id', cart_id).execute()

            # Format message
            message = self._format_reminder_message(
                reminder_number=reminder_number,
                name=display_name or 'bạn',
                items=items,
                item_count=item_count,
                subtotal=subtotal,
                currency=currency,
                checkout_url=checkout_url or '',
                discount_code=discount_code,
                discount_percent=discount_percent,
                discounted_total=discounted_total,
            )

            # Send message via appropriate adapter
            success = await self._send_message(
                platform=platform,
                recipient_id=platform_user_id,
                message=message,
            )

            # Update schedule status
            now = datetime.utcnow().isoformat()

            supabase.table('chatbot_cart_recovery_schedule').update({
                'status': 'sent' if success else 'failed',
                'sent_at': now if success else None,
                'attempt_count': 1,  # Increment if implementing retry
                'error_message': None if success else 'Send failed',
            }).eq('id', schedule_id).execute()

            # Update cart reminder status
            if success:
                update_field = f"reminder_{reminder_number}_sent_at"
                update_data = {
                    update_field: now,
                    'recovery_status': f'reminder_{reminder_number}',
                }
                supabase.table('chatbot_abandoned_carts').update(
                    update_data
                ).eq('id', cart_id).execute()

            logger.info(f"Sent reminder {reminder_number} for cart {cart_id}: {success}")
            return success

        except Exception as e:
            logger.error(f"Send reminder error: {e}")

            # Mark as failed
            try:
                supabase = get_supabase_admin()
                supabase.table('chatbot_cart_recovery_schedule').update({
                    'status': 'failed',
                    'error_message': str(e),
                }).eq('id', schedule_id).execute()
            except Exception:
                pass

            return False

    async def mark_recovered(
        self,
        cart_id: str,
        order_id: str,
        amount: Optional[float] = None,
    ) -> bool:
        """
        Mark a cart as recovered (purchase completed).

        Args:
            cart_id: Cart ID
            order_id: Order ID from Shopify
            amount: Order amount

        Returns:
            Success status
        """
        try:
            supabase = get_supabase_admin()

            supabase.rpc(
                'mark_cart_recovered',
                {
                    'p_cart_id': cart_id,
                    'p_order_id': order_id,
                    'p_amount': amount,
                }
            ).execute()

            logger.info(f"Marked cart {cart_id} as recovered (order: {order_id})")
            return True

        except Exception as e:
            logger.error(f"Mark recovered error: {e}")
            return False

    async def mark_recovered_by_shopify_cart(
        self,
        shopify_cart_id: str,
        order_id: str,
        amount: Optional[float] = None,
    ) -> bool:
        """
        Mark cart as recovered by Shopify cart ID.

        Args:
            shopify_cart_id: Shopify cart ID
            order_id: Order ID
            amount: Order amount

        Returns:
            Success status
        """
        try:
            supabase = get_supabase_admin()

            # Find cart by Shopify cart ID
            result = supabase.table('chatbot_abandoned_carts').select(
                'id'
            ).eq('shopify_cart_id', shopify_cart_id).eq(
                'recovery_status', 'abandoned'
            ).execute()

            if result.data:
                cart_id = result.data[0]['id']
                return await self.mark_recovered(cart_id, order_id, amount)

            return False

        except Exception as e:
            logger.error(f"Mark recovered by Shopify cart error: {e}")
            return False

    async def opt_out(self, platform_user_id: str) -> bool:
        """
        Opt user out of cart recovery reminders.

        Args:
            platform_user_id: Platform user ID

        Returns:
            Success status
        """
        try:
            supabase = get_supabase_admin()

            # Update all pending carts for user
            supabase.table('chatbot_abandoned_carts').update({
                'recovery_status': 'opted_out',
            }).eq('platform_user_id', platform_user_id).in_(
                'recovery_status', ['abandoned', 'reminder_1', 'reminder_2']
            ).execute()

            # Cancel pending schedules
            cart_ids = supabase.table('chatbot_abandoned_carts').select(
                'id'
            ).eq('platform_user_id', platform_user_id).execute()

            if cart_ids.data:
                ids = [c['id'] for c in cart_ids.data]
                supabase.table('chatbot_cart_recovery_schedule').update({
                    'status': 'cancelled',
                }).in_('cart_id', ids).eq('status', 'pending').execute()

            return True

        except Exception as e:
            logger.error(f"Opt out error: {e}")
            return False

    async def get_stats(self, days: int = 30) -> Dict:
        """
        Get cart recovery statistics.

        Args:
            days: Number of days to look back

        Returns:
            Stats dictionary
        """
        try:
            supabase = get_supabase_admin()

            result = supabase.rpc(
                'get_cart_recovery_stats',
                {'p_days': days}
            ).execute()

            if result.data and len(result.data) > 0:
                stats = result.data[0]
                return {
                    'total_abandoned': stats.get('total_abandoned', 0),
                    'total_recovered': stats.get('total_recovered', 0),
                    'recovery_rate': float(stats.get('recovery_rate', 0)),
                    'total_abandoned_value': float(stats.get('total_abandoned_value', 0)),
                    'total_recovered_value': float(stats.get('total_recovered_value', 0)),
                    'avg_cart_value': float(stats.get('avg_cart_value', 0)),
                    'reminder_1_sent': stats.get('reminder_1_sent', 0),
                    'reminder_2_sent': stats.get('reminder_2_sent', 0),
                    'reminder_3_sent': stats.get('reminder_3_sent', 0),
                    'period_days': days,
                }

            return {
                'total_abandoned': 0,
                'total_recovered': 0,
                'recovery_rate': 0.0,
                'period_days': days,
            }

        except Exception as e:
            logger.error(f"Get stats error: {e}")
            return {'error': str(e)}

    def _format_reminder_message(
        self,
        reminder_number: int,
        name: str,
        items: List[Dict],
        item_count: int,
        subtotal: float,
        currency: str,
        checkout_url: str,
        discount_code: Optional[str],
        discount_percent: int,
        discounted_total: float,
    ) -> str:
        """Format reminder message from template"""
        template = self.templates.get(reminder_number, self.templates[1])

        # Format items preview
        items_preview = '\n'.join([
            f"• {item.get('title', 'Sản phẩm')} x{item.get('quantity', 1)}"
            for item in items[:3]
        ])
        if len(items) > 3:
            items_preview += f"\n  ... và {len(items) - 3} sản phẩm khác"

        # Format currency
        subtotal_formatted = f"{int(subtotal):,}₫" if currency == 'VND' else f"{subtotal:.2f} {currency}"
        discounted_formatted = f"{int(discounted_total):,}₫" if currency == 'VND' else f"{discounted_total:.2f} {currency}"

        return template.format(
            name=name,
            item_count=item_count,
            items_preview=items_preview,
            subtotal=subtotal_formatted,
            checkout_url=checkout_url,
            discount_code=discount_code or '',
            discount_percent=discount_percent,
            discounted_total=discounted_formatted,
        )

    async def _send_message(
        self,
        platform: str,
        recipient_id: str,
        message: str,
    ) -> bool:
        """Send message via platform adapter"""
        try:
            # Import adapters here to avoid circular imports
            from ..adapters.zalo_adapter import zalo_adapter
            from ..adapters.messenger_adapter import messenger_adapter

            outgoing = OutgoingMessage(
                content=message,
                quick_replies=self.quick_replies,
            )

            if platform == 'zalo':
                return await zalo_adapter.send_message(recipient_id, outgoing)
            elif platform == 'messenger':
                return await messenger_adapter.send_message(recipient_id, outgoing)
            else:
                logger.warning(f"Unknown platform: {platform}")
                return False

        except Exception as e:
            logger.error(f"Send message error: {e}")
            return False


# Global instance
cart_recovery_service = CartRecoveryService()
