"""
Web Widget Adapter
PHASE 2: MULTI-PLATFORM

Handles communication with the Gemral website widget via WebSocket.
"""

import logging
import json
import hashlib
import hmac
from typing import Dict, Optional, List, Any
from datetime import datetime

from .base_adapter import (
    BasePlatformAdapter,
    IncomingMessage,
    OutgoingMessage,
    QuickReply,
    Button,
)

logger = logging.getLogger(__name__)


class WebAdapter(BasePlatformAdapter):
    """
    Adapter for Gemral Website Widget.
    Handles WebSocket messages from the embedded chat widget.
    """

    platform = "web"

    def __init__(self, config: Optional[Dict] = None):
        """
        Initialize Web adapter.

        Args:
            config: Optional configuration dict
        """
        self.config = config or {}
        self.secret_key = self.config.get("secret_key", "")
        self.allowed_origins = self.config.get("allowed_origins", ["*"])

    def verify_signature(self, payload: str, signature: str) -> bool:
        """
        Verify webhook signature (optional for web widget).

        Args:
            payload: Raw payload string
            signature: Signature from header

        Returns:
            True if valid
        """
        if not self.secret_key:
            return True  # No secret configured, skip verification

        expected = hmac.new(
            self.secret_key.encode(),
            payload.encode(),
            hashlib.sha256
        ).hexdigest()

        return hmac.compare_digest(f"sha256={expected}", signature)

    def verify_origin(self, origin: str) -> bool:
        """
        Verify request origin.

        Args:
            origin: Request origin header

        Returns:
            True if allowed
        """
        if "*" in self.allowed_origins:
            return True

        return origin in self.allowed_origins

    async def parse_webhook(self, data: Dict) -> List[IncomingMessage]:
        """
        Parse WebSocket message from widget.

        Expected format:
        {
            "type": "message",
            "user_id": "web_abc123",
            "content": "Hello",
            "timestamp": 1234567890,
            "metadata": {
                "url": "https://example.com/page",
                "referrer": "https://google.com",
                "userAgent": "..."
            }
        }

        Args:
            data: WebSocket message data

        Returns:
            List of IncomingMessage objects
        """
        messages = []

        try:
            msg_type = data.get("type", "message")

            if msg_type == "auth":
                # Authentication message - don't process as chat
                logger.info(f"Web widget auth: {data.get('user_id')}")
                return []

            if msg_type == "typing":
                # Typing indicator - don't process
                return []

            if msg_type == "message":
                user_id = data.get("user_id", "")
                content = data.get("content", "")
                timestamp = data.get("timestamp")

                if not user_id or not content:
                    return []

                # Determine content type
                content_type = "text"
                attachments = []

                if data.get("attachments"):
                    for att in data["attachments"]:
                        att_type = att.get("type", "file")
                        if att_type == "image":
                            content_type = "image"
                        attachments.append({
                            "type": att_type,
                            "url": att.get("url"),
                            "name": att.get("name"),
                        })

                message = IncomingMessage(
                    platform="web",
                    platform_user_id=user_id,
                    message_id=data.get("message_id", f"web_{datetime.utcnow().timestamp()}"),
                    content=content,
                    content_type=content_type,
                    attachments=attachments if attachments else None,
                    timestamp=datetime.fromtimestamp(timestamp / 1000) if timestamp else datetime.utcnow(),
                    raw_data=data,
                )
                messages.append(message)

            elif msg_type == "quick_reply":
                # Quick reply button click
                user_id = data.get("user_id", "")
                payload = data.get("payload", "")
                label = data.get("label", payload)

                if user_id and payload:
                    message = IncomingMessage(
                        platform="web",
                        platform_user_id=user_id,
                        message_id=f"web_qr_{datetime.utcnow().timestamp()}",
                        content=label,
                        content_type="quick_reply",
                        attachments=None,
                        timestamp=datetime.utcnow(),
                        raw_data={"payload": payload, **data},
                    )
                    messages.append(message)

            elif msg_type == "postback":
                # Button postback
                user_id = data.get("user_id", "")
                payload = data.get("payload", "")

                if user_id and payload:
                    message = IncomingMessage(
                        platform="web",
                        platform_user_id=user_id,
                        message_id=f"web_pb_{datetime.utcnow().timestamp()}",
                        content=payload,
                        content_type="postback",
                        attachments=None,
                        timestamp=datetime.utcnow(),
                        raw_data=data,
                    )
                    messages.append(message)

        except Exception as e:
            logger.error(f"Error parsing web widget message: {e}")

        return messages

    async def send_message(
        self,
        recipient_id: str,
        message: OutgoingMessage,
    ) -> bool:
        """
        Format message for sending via WebSocket.

        Note: Actual sending is done by the WebSocket connection manager.
        This method formats the message into the widget protocol.

        Args:
            recipient_id: User ID
            message: OutgoingMessage to send

        Returns:
            Formatted message dict
        """
        try:
            response = {
                "type": "message",
                "content": message.content,
                "content_type": message.content_type,
                "timestamp": int(datetime.utcnow().timestamp() * 1000),
            }

            # Add attachments
            if message.attachments:
                response["attachments"] = []
                for att in message.attachments:
                    response["attachments"].append({
                        "type": att.get("type", "file"),
                        "url": att.get("url"),
                        "name": att.get("name"),
                        "thumbnail": att.get("thumbnail"),
                    })

            # Add quick replies
            if message.quick_replies:
                response["quick_replies"] = []
                for qr in message.quick_replies:
                    if isinstance(qr, QuickReply):
                        response["quick_replies"].append({
                            "label": qr.title,
                            "payload": qr.payload,
                            "icon": qr.image_url,
                        })
                    elif isinstance(qr, dict):
                        response["quick_replies"].append({
                            "label": qr.get("title", qr.get("label", "")),
                            "payload": qr.get("payload", ""),
                            "icon": qr.get("image_url"),
                        })

            # Add buttons
            if message.buttons:
                response["buttons"] = []
                for btn in message.buttons:
                    if isinstance(btn, Button):
                        response["buttons"].append({
                            "type": btn.type,
                            "title": btn.title,
                            "payload": btn.payload,
                            "url": btn.url,
                        })
                    elif isinstance(btn, dict):
                        response["buttons"].append({
                            "type": btn.get("type", "postback"),
                            "title": btn.get("title", ""),
                            "payload": btn.get("payload"),
                            "url": btn.get("url"),
                        })

            # Add template if present
            if message.template:
                response["template"] = message.template

            return response

        except Exception as e:
            logger.error(f"Error formatting web widget message: {e}")
            return False

    async def send_typing_indicator(
        self,
        recipient_id: str,
        is_typing: bool = True,
    ) -> Dict:
        """
        Send typing indicator.

        Args:
            recipient_id: User ID
            is_typing: Whether typing

        Returns:
            Formatted typing message
        """
        return {
            "type": "typing",
            "typing": is_typing,
        }

    async def get_user_profile(self, user_id: str) -> Optional[Dict]:
        """
        Get user profile from stored metadata.

        Web widget users don't have rich profiles like Zalo/Messenger.
        Profile is built from metadata sent during auth.

        Args:
            user_id: User ID

        Returns:
            Profile dict or None
        """
        # Profile would be stored in database during auth
        # Return minimal profile for web users
        return {
            "id": user_id,
            "platform": "web",
            "display_name": f"Web User",
        }

    def format_product_carousel(self, products: List[Dict]) -> Dict:
        """
        Format product carousel for web widget.

        Args:
            products: List of product dicts

        Returns:
            Carousel template
        """
        elements = []

        for product in products[:10]:  # Max 10 products
            element = {
                "title": product.get("title", ""),
                "subtitle": product.get("description", "")[:80] if product.get("description") else "",
                "image_url": product.get("image_url"),
                "price": product.get("price"),
                "currency": product.get("currency", "VND"),
                "buttons": [
                    {
                        "type": "url",
                        "title": "Xem chi tiet",
                        "url": product.get("url", ""),
                    },
                    {
                        "type": "postback",
                        "title": "Mua ngay",
                        "payload": f"BUY_{product.get('id')}",
                    },
                ],
            }
            elements.append(element)

        return {
            "type": "carousel",
            "elements": elements,
        }

    def format_order_card(self, order: Dict) -> Dict:
        """
        Format order status card.

        Args:
            order: Order dict

        Returns:
            Order card template
        """
        return {
            "type": "order_card",
            "order_id": order.get("id"),
            "status": order.get("status"),
            "status_text": self._get_order_status_text(order.get("status")),
            "total": order.get("total"),
            "currency": order.get("currency", "VND"),
            "items_count": len(order.get("items", [])),
            "created_at": order.get("created_at"),
            "tracking_url": order.get("tracking_url"),
        }

    def _get_order_status_text(self, status: str) -> str:
        """Get Vietnamese text for order status."""
        status_map = {
            "pending": "Cho xu ly",
            "confirmed": "Da xac nhan",
            "processing": "Dang xu ly",
            "shipped": "Dang giao hang",
            "delivered": "Da giao hang",
            "cancelled": "Da huy",
        }
        return status_map.get(status, status)

    def format_faq_list(self, faqs: List[Dict]) -> Dict:
        """
        Format FAQ list for web widget.

        Args:
            faqs: List of FAQ dicts

        Returns:
            FAQ list template
        """
        return {
            "type": "faq_list",
            "items": [
                {
                    "id": faq.get("id"),
                    "question": faq.get("question"),
                    "category": faq.get("category"),
                }
                for faq in faqs[:5]
            ],
        }

    def format_game_result(self, game: str, result: Dict) -> Dict:
        """
        Format game result for web widget.

        Args:
            game: Game type (lucky_wheel, etc.)
            result: Game result dict

        Returns:
            Game result template
        """
        return {
            "type": "game_result",
            "game": game,
            "segment": result.get("segment"),
            "prize_type": result.get("prize_type"),
            "prize_value": result.get("prize_value"),
            "message": result.get("message"),
            "animation": game,  # Widget will play animation
        }


# Global instance
web_adapter = WebAdapter()
