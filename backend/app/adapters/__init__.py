"""
Platform Adapters for Multi-Platform Chatbot
Handles platform-specific message parsing and sending
"""

from .base_adapter import (
    BasePlatformAdapter,
    IncomingMessage,
    OutgoingMessage,
    QuickReply,
    Button,
    Attachment,
    MessageType,
)
from .zalo_adapter import ZaloAdapter
from .messenger_adapter import MessengerAdapter
from .web_adapter import WebAdapter, web_adapter

__all__ = [
    "BasePlatformAdapter",
    "IncomingMessage",
    "OutgoingMessage",
    "QuickReply",
    "Button",
    "Attachment",
    "MessageType",
    "ZaloAdapter",
    "MessengerAdapter",
    "WebAdapter",
    "web_adapter",
]
