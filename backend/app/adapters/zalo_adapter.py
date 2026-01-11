"""
Zalo OA Platform Adapter
Handles Zalo Official Account API integration
"""

import hmac
import hashlib
import httpx
import logging
from typing import Dict, List, Any, Optional
from datetime import datetime

from .base_adapter import (
    BasePlatformAdapter,
    IncomingMessage,
    OutgoingMessage,
    MessageType,
    Attachment,
    QuickReply,
)
from ..core.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()


class ZaloAdapter(BasePlatformAdapter):
    """
    Zalo Official Account Adapter
    Docs: https://developers.zalo.me/docs/api/official-account-api
    """

    platform_name = "zalo"
    API_BASE = "https://openapi.zalo.me/v3.0/oa"

    def __init__(self):
        self.access_token = settings.ZALO_ACCESS_TOKEN
        self.app_secret = settings.ZALO_APP_SECRET

    async def parse_webhook(self, data: Dict[str, Any]) -> List[IncomingMessage]:
        """
        Parse Zalo webhook events.

        Events:
        - user_send_text: Text message
        - user_send_image: Image attachment
        - user_send_audio: Audio/voice message
        - user_send_file: File attachment
        - user_send_gif: GIF
        - user_send_sticker: Sticker
        - user_send_location: Location sharing
        - follow: User follows OA
        - unfollow: User unfollows OA
        """
        messages = []
        event_name = data.get("event_name", "")
        sender = data.get("sender", {})
        user_id = sender.get("id", "")
        message_data = data.get("message", {})
        timestamp = data.get("timestamp", 0)

        # Convert timestamp to datetime
        event_time = datetime.fromtimestamp(timestamp / 1000) if timestamp else datetime.utcnow()

        # Handle different event types
        if event_name == "user_send_text":
            messages.append(IncomingMessage(
                platform="zalo",
                platform_user_id=user_id,
                message_id=message_data.get("msg_id", ""),
                content=message_data.get("text", ""),
                content_type=MessageType.TEXT,
                timestamp=event_time,
                raw_data=data
            ))

        elif event_name == "user_send_image":
            attachments = []
            if "attachments" in message_data:
                for att in message_data["attachments"]:
                    attachments.append(Attachment(
                        type="image",
                        url=att.get("payload", {}).get("url", ""),
                        payload=att.get("payload", {}).get("thumbnail", "")
                    ))

            messages.append(IncomingMessage(
                platform="zalo",
                platform_user_id=user_id,
                message_id=message_data.get("msg_id", ""),
                content="[Image]",
                content_type=MessageType.IMAGE,
                attachments=attachments,
                timestamp=event_time,
                raw_data=data
            ))

        elif event_name == "user_send_audio":
            attachments = []
            if "attachments" in message_data:
                for att in message_data["attachments"]:
                    attachments.append(Attachment(
                        type="audio",
                        url=att.get("payload", {}).get("url", "")
                    ))

            messages.append(IncomingMessage(
                platform="zalo",
                platform_user_id=user_id,
                message_id=message_data.get("msg_id", ""),
                content="[Audio]",
                content_type=MessageType.AUDIO,
                attachments=attachments,
                timestamp=event_time,
                raw_data=data
            ))

        elif event_name == "user_send_file":
            attachments = []
            if "attachments" in message_data:
                for att in message_data["attachments"]:
                    payload = att.get("payload", {})
                    attachments.append(Attachment(
                        type="file",
                        url=payload.get("url", ""),
                        filename=payload.get("name", ""),
                        size=payload.get("size", 0)
                    ))

            messages.append(IncomingMessage(
                platform="zalo",
                platform_user_id=user_id,
                message_id=message_data.get("msg_id", ""),
                content="[File]",
                content_type=MessageType.FILE,
                attachments=attachments,
                timestamp=event_time,
                raw_data=data
            ))

        elif event_name == "user_send_sticker":
            messages.append(IncomingMessage(
                platform="zalo",
                platform_user_id=user_id,
                message_id=message_data.get("msg_id", ""),
                content="[Sticker]",
                content_type=MessageType.STICKER,
                timestamp=event_time,
                raw_data=data
            ))

        elif event_name == "user_send_location":
            location = message_data.get("attachments", [{}])[0].get("payload", {})
            messages.append(IncomingMessage(
                platform="zalo",
                platform_user_id=user_id,
                message_id=message_data.get("msg_id", ""),
                content="[Location]",
                content_type=MessageType.LOCATION,
                location={
                    "lat": location.get("latitude", 0),
                    "lng": location.get("longitude", 0)
                },
                timestamp=event_time,
                raw_data=data
            ))

        elif event_name == "follow":
            follower = data.get("follower", {})
            messages.append(IncomingMessage(
                platform="zalo",
                platform_user_id=follower.get("id", user_id),
                message_id=f"follow_{timestamp}",
                content="",
                content_type=MessageType.FOLLOW,
                timestamp=event_time,
                raw_data=data
            ))

        elif event_name == "unfollow":
            follower = data.get("follower", {})
            messages.append(IncomingMessage(
                platform="zalo",
                platform_user_id=follower.get("id", user_id),
                message_id=f"unfollow_{timestamp}",
                content="",
                content_type=MessageType.UNFOLLOW,
                timestamp=event_time,
                raw_data=data
            ))

        return messages

    async def send_message(
        self,
        recipient_id: str,
        message: OutgoingMessage
    ) -> bool:
        """Send message to Zalo user"""
        try:
            url = f"{self.API_BASE}/message/cs"
            headers = {
                "access_token": self.access_token,
                "Content-Type": "application/json"
            }

            # Build message payload based on type
            if message.template_type == "generic" and message.template_elements:
                # Carousel/List template
                payload = self._build_list_template(recipient_id, message)
            elif message.quick_replies:
                # Text with quick replies
                payload = self._build_quick_reply_message(recipient_id, message)
            elif message.attachments:
                # Attachment message
                payload = self._build_attachment_message(recipient_id, message)
            else:
                # Simple text message
                payload = {
                    "recipient": {"user_id": recipient_id},
                    "message": {"text": message.content}
                }

            async with httpx.AsyncClient() as client:
                response = await client.post(url, json=payload, headers=headers, timeout=30.0)

                if response.status_code == 200:
                    result = response.json()
                    if result.get("error") == 0:
                        return True
                    else:
                        logger.error(f"Zalo send error: {result}")
                        return False
                else:
                    logger.error(f"Zalo API error: {response.status_code}")
                    return False

        except Exception as e:
            logger.error(f"Zalo send_message error: {e}")
            return False

    def _build_quick_reply_message(
        self,
        recipient_id: str,
        message: OutgoingMessage
    ) -> Dict[str, Any]:
        """Build Zalo quick reply message payload"""
        actions = []
        for qr in message.quick_replies[:5]:  # Zalo max 5 quick replies
            actions.append({
                "action": "oa.query.show",
                "title": qr.title[:100],  # Max 100 chars
                "payload": qr.payload
            })

        return {
            "recipient": {"user_id": recipient_id},
            "message": {
                "text": message.content,
                "attachment": {
                    "type": "template",
                    "payload": {
                        "template_type": "request_user_info",
                        "elements": [{
                            "title": message.content,
                            "subtitle": "",
                            "image_url": ""
                        }]
                    }
                }
            },
            "actions": actions
        }

    def _build_list_template(
        self,
        recipient_id: str,
        message: OutgoingMessage
    ) -> Dict[str, Any]:
        """Build Zalo list/carousel template"""
        elements = []
        for elem in message.template_elements[:5]:  # Max 5 elements
            element = {
                "title": elem.get("title", "")[:100],
                "subtitle": elem.get("subtitle", "")[:500],
                "image_url": elem.get("image_url", "")
            }
            # Add default action if URL provided
            if elem.get("url"):
                element["default_action"] = {
                    "type": "oa.open.url",
                    "url": elem["url"]
                }
            elements.append(element)

        return {
            "recipient": {"user_id": recipient_id},
            "message": {
                "attachment": {
                    "type": "template",
                    "payload": {
                        "template_type": "list",
                        "elements": elements
                    }
                }
            }
        }

    def _build_attachment_message(
        self,
        recipient_id: str,
        message: OutgoingMessage
    ) -> Dict[str, Any]:
        """Build Zalo attachment message"""
        att = message.attachments[0]
        return {
            "recipient": {"user_id": recipient_id},
            "message": {
                "attachment": {
                    "type": att.type,
                    "payload": {
                        "url": att.url
                    }
                }
            }
        }

    async def send_typing_indicator(
        self,
        recipient_id: str,
        typing_on: bool = True
    ) -> bool:
        """Send typing indicator"""
        try:
            url = f"{self.API_BASE}/message/cs"
            headers = {
                "access_token": self.access_token,
                "Content-Type": "application/json"
            }
            payload = {
                "recipient": {"user_id": recipient_id},
                "sender_action": "typing" if typing_on else "mark_seen"
            }

            async with httpx.AsyncClient() as client:
                response = await client.post(url, json=payload, headers=headers, timeout=10.0)
                return response.status_code == 200

        except Exception as e:
            logger.warning(f"Zalo typing indicator error: {e}")
            return False

    async def get_user_profile(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Get Zalo user profile"""
        try:
            url = f"{self.API_BASE}/getprofile"
            headers = {"access_token": self.access_token}
            params = {"data": f'{{"user_id": "{user_id}"}}'}

            async with httpx.AsyncClient() as client:
                response = await client.get(url, headers=headers, params=params, timeout=10.0)

                if response.status_code == 200:
                    result = response.json()
                    if result.get("error") == 0:
                        data = result.get("data", {})
                        return {
                            "id": user_id,
                            "name": data.get("display_name", ""),
                            "avatar_url": data.get("avatar", ""),
                            "is_follower": data.get("user_is_follower", False),
                            "raw": data
                        }

            return None

        except Exception as e:
            logger.error(f"Zalo get_user_profile error: {e}")
            return None

    def verify_signature(self, payload: bytes, signature: str) -> bool:
        """
        Verify Zalo webhook signature using MAC.

        Zalo uses: MAC = HMAC-SHA256(app_secret, request_body)
        """
        if not self.app_secret:
            logger.warning("Zalo app secret not configured")
            return True  # Skip verification if no secret

        try:
            expected = hmac.new(
                self.app_secret.encode(),
                payload,
                hashlib.sha256
            ).hexdigest()

            return hmac.compare_digest(expected.lower(), signature.lower())

        except Exception as e:
            logger.error(f"Zalo signature verification error: {e}")
            return False


# Global instance
zalo_adapter = ZaloAdapter()
