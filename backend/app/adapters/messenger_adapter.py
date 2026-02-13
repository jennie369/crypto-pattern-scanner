"""
Facebook Messenger Platform Adapter
Handles Facebook Messenger API integration
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
    Button,
)
from ..core.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()


class MessengerAdapter(BasePlatformAdapter):
    """
    Facebook Messenger Platform Adapter
    Docs: https://developers.facebook.com/docs/messenger-platform
    """

    platform_name = "messenger"
    API_VERSION = "v21.0"
    API_BASE = f"https://graph.facebook.com/{API_VERSION}"

    def __init__(self):
        self.page_access_token = settings.FB_PAGE_ACCESS_TOKEN
        self.app_secret = settings.FB_APP_SECRET

    async def parse_webhook(self, data: Dict[str, Any]) -> List[IncomingMessage]:
        """
        Parse Messenger webhook events.

        Events:
        - messages: Text, attachments, quick_reply
        - messaging_postbacks: Button clicks
        """
        messages = []

        # Messenger sends entries array
        entries = data.get("entry", [])

        for entry in entries:
            messaging_events = entry.get("messaging", [])

            for event in messaging_events:
                sender_id = event.get("sender", {}).get("id", "")
                timestamp = event.get("timestamp", 0)
                event_time = datetime.fromtimestamp(timestamp / 1000) if timestamp else datetime.utcnow()

                # Handle different event types
                if "message" in event:
                    message = event["message"]
                    msg_id = message.get("mid", "")

                    # Quick reply
                    if "quick_reply" in message:
                        messages.append(IncomingMessage(
                            platform="messenger",
                            platform_user_id=sender_id,
                            message_id=msg_id,
                            content=message.get("text", ""),
                            content_type=MessageType.POSTBACK,
                            postback_payload=message["quick_reply"].get("payload", ""),
                            timestamp=event_time,
                            raw_data=event
                        ))
                        continue

                    # Text message
                    if "text" in message:
                        messages.append(IncomingMessage(
                            platform="messenger",
                            platform_user_id=sender_id,
                            message_id=msg_id,
                            content=message.get("text", ""),
                            content_type=MessageType.TEXT,
                            timestamp=event_time,
                            raw_data=event
                        ))

                    # Attachments
                    elif "attachments" in message:
                        attachments = []
                        att_type = MessageType.FILE

                        for att in message["attachments"]:
                            att_type_str = att.get("type", "file")
                            payload = att.get("payload", {})

                            # Map to MessageType
                            if att_type_str == "image":
                                att_type = MessageType.IMAGE
                            elif att_type_str == "audio":
                                att_type = MessageType.AUDIO
                            elif att_type_str == "video":
                                att_type = MessageType.VIDEO
                            elif att_type_str == "location":
                                att_type = MessageType.LOCATION
                            elif att_type_str == "sticker":
                                att_type = MessageType.STICKER

                            if att_type == MessageType.LOCATION:
                                # Handle location specially
                                messages.append(IncomingMessage(
                                    platform="messenger",
                                    platform_user_id=sender_id,
                                    message_id=msg_id,
                                    content="[Location]",
                                    content_type=MessageType.LOCATION,
                                    location={
                                        "lat": payload.get("coordinates", {}).get("lat", 0),
                                        "lng": payload.get("coordinates", {}).get("long", 0)
                                    },
                                    timestamp=event_time,
                                    raw_data=event
                                ))
                            else:
                                attachments.append(Attachment(
                                    type=att_type_str,
                                    url=payload.get("url", ""),
                                    payload=payload.get("sticker_id", "")
                                ))

                        if attachments:
                            messages.append(IncomingMessage(
                                platform="messenger",
                                platform_user_id=sender_id,
                                message_id=msg_id,
                                content=f"[{att_type.value.capitalize()}]",
                                content_type=att_type,
                                attachments=attachments,
                                timestamp=event_time,
                                raw_data=event
                            ))

                # Postback (button click)
                elif "postback" in event:
                    postback = event["postback"]
                    messages.append(IncomingMessage(
                        platform="messenger",
                        platform_user_id=sender_id,
                        message_id=f"postback_{timestamp}",
                        content=postback.get("title", ""),
                        content_type=MessageType.POSTBACK,
                        postback_payload=postback.get("payload", ""),
                        timestamp=event_time,
                        raw_data=event
                    ))

        return messages

    async def send_message(
        self,
        recipient_id: str,
        message: OutgoingMessage
    ) -> bool:
        """Send message to Messenger user"""
        try:
            url = f"{self.API_BASE}/me/messages"
            params = {"access_token": self.page_access_token}

            # Build message payload based on type
            if message.template_type == "generic" and message.template_elements:
                payload = self._build_generic_template(recipient_id, message)
            elif message.quick_replies:
                payload = self._build_quick_reply_message(recipient_id, message)
            elif message.buttons:
                payload = self._build_button_template(recipient_id, message)
            elif message.attachments:
                payload = self._build_attachment_message(recipient_id, message)
            else:
                payload = {
                    "recipient": {"id": recipient_id},
                    "message": {"text": message.content[:2000]}  # Max 2000 chars
                }

            async with httpx.AsyncClient() as client:
                response = await client.post(
                    url,
                    params=params,
                    json=payload,
                    timeout=30.0
                )

                if response.status_code == 200:
                    return True
                else:
                    result = response.json()
                    logger.error(f"Messenger send error: {result}")
                    return False

        except Exception as e:
            logger.error(f"Messenger send_message error: {e}")
            return False

    def _build_quick_reply_message(
        self,
        recipient_id: str,
        message: OutgoingMessage
    ) -> Dict[str, Any]:
        """Build Messenger quick reply message"""
        quick_replies = []
        for qr in message.quick_replies[:13]:  # Messenger max 13
            qr_data = {
                "content_type": "text",
                "title": qr.title[:20],  # Max 20 chars
                "payload": qr.payload[:1000]  # Max 1000 chars
            }
            if qr.image_url:
                qr_data["image_url"] = qr.image_url
            quick_replies.append(qr_data)

        return {
            "recipient": {"id": recipient_id},
            "message": {
                "text": message.content[:2000],
                "quick_replies": quick_replies
            }
        }

    def _build_button_template(
        self,
        recipient_id: str,
        message: OutgoingMessage
    ) -> Dict[str, Any]:
        """Build Messenger button template"""
        buttons = []
        for btn in message.buttons[:3]:  # Max 3 buttons
            if btn.type == "postback":
                buttons.append({
                    "type": "postback",
                    "title": btn.title[:20],
                    "payload": btn.payload[:1000]
                })
            elif btn.type == "web_url":
                buttons.append({
                    "type": "web_url",
                    "title": btn.title[:20],
                    "url": btn.url
                })
            elif btn.type == "phone":
                buttons.append({
                    "type": "phone_number",
                    "title": btn.title[:20],
                    "payload": btn.payload
                })

        return {
            "recipient": {"id": recipient_id},
            "message": {
                "attachment": {
                    "type": "template",
                    "payload": {
                        "template_type": "button",
                        "text": message.content[:640],
                        "buttons": buttons
                    }
                }
            }
        }

    def _build_generic_template(
        self,
        recipient_id: str,
        message: OutgoingMessage
    ) -> Dict[str, Any]:
        """Build Messenger generic template (carousel)"""
        elements = []
        for elem in message.template_elements[:10]:  # Max 10 elements
            element = {
                "title": elem.get("title", "")[:80],
            }

            if elem.get("subtitle"):
                element["subtitle"] = elem["subtitle"][:80]

            if elem.get("image_url"):
                element["image_url"] = elem["image_url"]

            # Default action
            if elem.get("url"):
                element["default_action"] = {
                    "type": "web_url",
                    "url": elem["url"]
                }

            # Buttons
            if elem.get("buttons"):
                element["buttons"] = []
                for btn in elem["buttons"][:3]:
                    if btn.get("type") == "postback":
                        element["buttons"].append({
                            "type": "postback",
                            "title": btn.get("title", "")[:20],
                            "payload": btn.get("payload", "")
                        })
                    else:
                        element["buttons"].append({
                            "type": "web_url",
                            "title": btn.get("title", "")[:20],
                            "url": btn.get("url", "")
                        })

            elements.append(element)

        return {
            "recipient": {"id": recipient_id},
            "message": {
                "attachment": {
                    "type": "template",
                    "payload": {
                        "template_type": "generic",
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
        """Build Messenger attachment message"""
        att = message.attachments[0]
        return {
            "recipient": {"id": recipient_id},
            "message": {
                "attachment": {
                    "type": att.type,
                    "payload": {
                        "url": att.url,
                        "is_reusable": True
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
            url = f"{self.API_BASE}/me/messages"
            params = {"access_token": self.page_access_token}
            payload = {
                "recipient": {"id": recipient_id},
                "sender_action": "typing_on" if typing_on else "typing_off"
            }

            async with httpx.AsyncClient() as client:
                response = await client.post(
                    url,
                    params=params,
                    json=payload,
                    timeout=10.0
                )
                return response.status_code == 200

        except Exception as e:
            logger.warning(f"Messenger typing indicator error: {e}")
            return False

    async def send_mark_seen(self, recipient_id: str) -> bool:
        """Mark messages as seen"""
        try:
            url = f"{self.API_BASE}/me/messages"
            params = {"access_token": self.page_access_token}
            payload = {
                "recipient": {"id": recipient_id},
                "sender_action": "mark_seen"
            }

            async with httpx.AsyncClient() as client:
                response = await client.post(
                    url,
                    params=params,
                    json=payload,
                    timeout=10.0
                )
                return response.status_code == 200

        except Exception as e:
            logger.warning(f"Messenger mark_seen error: {e}")
            return False

    async def get_user_profile(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Get Messenger user profile"""
        try:
            url = f"{self.API_BASE}/{user_id}"
            params = {
                "access_token": self.page_access_token,
                "fields": "first_name,last_name,profile_pic,locale,timezone"
            }

            async with httpx.AsyncClient() as client:
                response = await client.get(url, params=params, timeout=10.0)

                if response.status_code == 200:
                    data = response.json()
                    return {
                        "id": user_id,
                        "name": f"{data.get('first_name', '')} {data.get('last_name', '')}".strip(),
                        "first_name": data.get("first_name", ""),
                        "last_name": data.get("last_name", ""),
                        "avatar_url": data.get("profile_pic", ""),
                        "locale": data.get("locale", ""),
                        "timezone": data.get("timezone", 0),
                        "raw": data
                    }

            return None

        except Exception as e:
            logger.error(f"Messenger get_user_profile error: {e}")
            return None

    def verify_signature(self, payload: bytes, signature: str) -> bool:
        """
        Verify Facebook webhook signature.

        Facebook uses: X-Hub-Signature-256 = sha256=HMAC-SHA256(app_secret, payload)
        """
        if not self.app_secret:
            logger.warning("Facebook app secret not configured")
            return True  # Skip verification if no secret

        try:
            # Signature format: "sha256=xxxx"
            if signature.startswith("sha256="):
                signature = signature[7:]

            expected = hmac.new(
                self.app_secret.encode(),
                payload,
                hashlib.sha256
            ).hexdigest()

            return hmac.compare_digest(expected.lower(), signature.lower())

        except Exception as e:
            logger.error(f"Messenger signature verification error: {e}")
            return False

    async def set_get_started_button(self, payload: str = "GET_STARTED") -> bool:
        """Set the Get Started button for new users"""
        try:
            url = f"{self.API_BASE}/me/messenger_profile"
            params = {"access_token": self.page_access_token}
            data = {
                "get_started": {"payload": payload}
            }

            async with httpx.AsyncClient() as client:
                response = await client.post(
                    url,
                    params=params,
                    json=data,
                    timeout=10.0
                )
                return response.status_code == 200

        except Exception as e:
            logger.error(f"Messenger set_get_started error: {e}")
            return False

    async def set_persistent_menu(self, menu_items: List[Dict]) -> bool:
        """Set persistent menu for the Page"""
        try:
            url = f"{self.API_BASE}/me/messenger_profile"
            params = {"access_token": self.page_access_token}
            data = {
                "persistent_menu": [{
                    "locale": "default",
                    "composer_input_disabled": False,
                    "call_to_actions": menu_items[:20]  # Max 20 items
                }]
            }

            async with httpx.AsyncClient() as client:
                response = await client.post(
                    url,
                    params=params,
                    json=data,
                    timeout=10.0
                )
                return response.status_code == 200

        except Exception as e:
            logger.error(f"Messenger set_persistent_menu error: {e}")
            return False


# Global instance
messenger_adapter = MessengerAdapter()
