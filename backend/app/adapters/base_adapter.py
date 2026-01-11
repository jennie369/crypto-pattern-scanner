"""
Base Platform Adapter
Abstract base class defining the interface for all platform adapters
"""

from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from typing import Dict, List, Any, Optional
from enum import Enum
from datetime import datetime


class MessageType(str, Enum):
    """Types of messages"""
    TEXT = "text"
    IMAGE = "image"
    AUDIO = "audio"
    VIDEO = "video"
    FILE = "file"
    LOCATION = "location"
    STICKER = "sticker"
    POSTBACK = "postback"
    FOLLOW = "follow"
    UNFOLLOW = "unfollow"


@dataclass
class Attachment:
    """Attachment data"""
    type: str  # image, audio, video, file
    url: str
    payload: Optional[str] = None
    filename: Optional[str] = None
    size: Optional[int] = None


@dataclass
class QuickReply:
    """Quick reply button"""
    title: str
    payload: str
    image_url: Optional[str] = None


@dataclass
class Button:
    """Button for templates"""
    type: str  # postback, web_url, phone
    title: str
    payload: Optional[str] = None
    url: Optional[str] = None


@dataclass
class IncomingMessage:
    """Standardized incoming message from any platform"""
    platform: str  # "zalo" or "messenger"
    platform_user_id: str
    message_id: str
    content: str
    content_type: MessageType
    attachments: List[Attachment] = field(default_factory=list)
    timestamp: datetime = field(default_factory=datetime.utcnow)
    raw_data: Dict[str, Any] = field(default_factory=dict)

    # Optional metadata
    reply_to_message_id: Optional[str] = None
    postback_payload: Optional[str] = None
    location: Optional[Dict[str, float]] = None  # {lat, lng}


@dataclass
class OutgoingMessage:
    """Standardized outgoing message to any platform"""
    content: str
    content_type: MessageType = MessageType.TEXT
    attachments: List[Attachment] = field(default_factory=list)
    quick_replies: List[QuickReply] = field(default_factory=list)
    buttons: List[Button] = field(default_factory=list)

    # Template data (for carousels, lists)
    template_type: Optional[str] = None  # generic, list, button
    template_elements: List[Dict[str, Any]] = field(default_factory=list)

    # Metadata
    metadata: Dict[str, Any] = field(default_factory=dict)


class BasePlatformAdapter(ABC):
    """
    Abstract base class for platform adapters.
    Each platform (Zalo, Messenger, etc.) should implement this interface.
    """

    platform_name: str = "base"

    @abstractmethod
    async def parse_webhook(self, data: Dict[str, Any]) -> List[IncomingMessage]:
        """
        Parse incoming webhook data into standardized messages.

        Args:
            data: Raw webhook payload from the platform

        Returns:
            List of IncomingMessage objects
        """
        pass

    @abstractmethod
    async def send_message(
        self,
        recipient_id: str,
        message: OutgoingMessage
    ) -> bool:
        """
        Send a message to a user on the platform.

        Args:
            recipient_id: Platform-specific user ID
            message: Standardized OutgoingMessage

        Returns:
            True if sent successfully, False otherwise
        """
        pass

    @abstractmethod
    async def send_typing_indicator(
        self,
        recipient_id: str,
        typing_on: bool = True
    ) -> bool:
        """
        Send typing indicator to show bot is processing.

        Args:
            recipient_id: Platform-specific user ID
            typing_on: True to show typing, False to stop

        Returns:
            True if successful
        """
        pass

    @abstractmethod
    async def get_user_profile(
        self,
        user_id: str
    ) -> Optional[Dict[str, Any]]:
        """
        Get user profile information from the platform.

        Args:
            user_id: Platform-specific user ID

        Returns:
            Dict with user info (name, avatar, etc.) or None
        """
        pass

    @abstractmethod
    def verify_signature(
        self,
        payload: bytes,
        signature: str
    ) -> bool:
        """
        Verify webhook signature for security.

        Args:
            payload: Raw request body
            signature: Signature from request headers

        Returns:
            True if signature is valid
        """
        pass

    # Helper methods (common implementations)

    def create_text_message(self, text: str) -> OutgoingMessage:
        """Create a simple text message"""
        return OutgoingMessage(content=text, content_type=MessageType.TEXT)

    def create_quick_reply_message(
        self,
        text: str,
        quick_replies: List[Dict[str, str]]
    ) -> OutgoingMessage:
        """
        Create a message with quick replies.

        Args:
            text: Message text
            quick_replies: List of {title, payload} dicts
        """
        return OutgoingMessage(
            content=text,
            content_type=MessageType.TEXT,
            quick_replies=[
                QuickReply(title=qr["title"], payload=qr["payload"])
                for qr in quick_replies
            ]
        )

    def create_carousel_message(
        self,
        elements: List[Dict[str, Any]]
    ) -> OutgoingMessage:
        """
        Create a carousel/generic template message.

        Args:
            elements: List of card elements with title, subtitle, image_url, buttons
        """
        return OutgoingMessage(
            content="",
            template_type="generic",
            template_elements=elements
        )
