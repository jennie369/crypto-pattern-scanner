"""
Pydantic Models for Request/Response Validation
Matches existing gem-mobile message structures
"""
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any, Literal
from datetime import datetime
from enum import Enum


# ============================================================
# Enums
# ============================================================


class MessageType(str, Enum):
    USER = "user"
    ASSISTANT = "assistant"
    SYSTEM = "system"
    TYPING = "typing"
    ERROR = "error"


class Platform(str, Enum):
    APP = "app"
    MOBILE = "mobile"
    WEB = "web"
    ZALO = "zalo"
    MESSENGER = "messenger"


class UserTier(str, Enum):
    FREE = "FREE"
    TIER1 = "TIER1"
    TIER2 = "TIER2"
    TIER3 = "TIER3"
    PRO = "PRO"
    PREMIUM = "PREMIUM"
    VIP = "VIP"
    ADMIN = "ADMIN"


# ============================================================
# WebSocket Messages
# ============================================================


class WSMessage(BaseModel):
    """Base WebSocket message structure"""

    type: str
    data: Optional[Dict[str, Any]] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class WSChatMessage(BaseModel):
    """Chat message from client via WebSocket"""

    type: Literal["chat"] = "chat"
    content: str = Field(..., min_length=1, max_length=4000)
    session_id: Optional[str] = None
    platform: Platform = Platform.MOBILE
    metadata: Optional[Dict[str, Any]] = None


class WSTypingIndicator(BaseModel):
    """Typing indicator message"""

    type: Literal["typing"] = "typing"
    is_typing: bool = True


class WSChatResponse(BaseModel):
    """Chat response to client via WebSocket"""

    type: Literal["response", "error"] = "response"
    content: str
    session_id: Optional[str] = None
    conversation_id: Optional[str] = None
    sources: Optional[List[str]] = None
    tokens_used: int = 0
    processing_time_ms: int = 0
    quick_actions: Optional[List[Dict[str, str]]] = None


class WSConnectedMessage(BaseModel):
    """Connection confirmation message"""

    type: Literal["connected"] = "connected"
    user_id: str
    tier: str = "FREE"
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class WSErrorMessage(BaseModel):
    """Error message to client"""

    type: Literal["error"] = "error"
    content: str
    code: Optional[str] = None
    quota_exceeded: bool = False


# ============================================================
# HTTP API Models
# ============================================================


class ChatRequest(BaseModel):
    """HTTP chat request (fallback for WebSocket)"""

    message: str = Field(..., min_length=1, max_length=4000)
    conversation_history: Optional[List[Dict[str, str]]] = None
    session_id: Optional[str] = None
    use_rag: bool = True
    platform: Platform = Platform.MOBILE


class ChatResponse(BaseModel):
    """HTTP chat response"""

    response: str
    conversation_id: Optional[str] = None
    rag_used: bool = False
    sources: Optional[List[str]] = None
    tokens_used: int = 0
    processing_time_ms: int = 0
    fallback: bool = False
    error: Optional[str] = None


# ============================================================
# Zalo Webhook Models
# ============================================================


class ZaloSender(BaseModel):
    """Zalo sender info"""

    id: str


class ZaloRecipient(BaseModel):
    """Zalo recipient info"""

    id: str


class ZaloMessageContent(BaseModel):
    """Zalo message content"""

    msg_id: Optional[str] = None
    text: Optional[str] = None
    attachments: Optional[List[Dict[str, Any]]] = None


class ZaloEvent(BaseModel):
    """Zalo OA webhook event"""

    app_id: str
    event_name: str
    timestamp: str
    sender: ZaloSender
    recipient: ZaloRecipient
    message: Optional[ZaloMessageContent] = None
    user_id_by_app: Optional[str] = None


# ============================================================
# Facebook Messenger Webhook Models
# ============================================================


class FBMessaging(BaseModel):
    """Facebook messaging event"""

    sender: Dict[str, str]
    recipient: Dict[str, str]
    timestamp: Optional[int] = None
    message: Optional[Dict[str, Any]] = None
    postback: Optional[Dict[str, Any]] = None


class FBEntry(BaseModel):
    """Facebook webhook entry"""

    id: str
    time: int
    messaging: Optional[List[FBMessaging]] = None


class FBWebhookEvent(BaseModel):
    """Facebook webhook event"""

    object: str
    entry: List[FBEntry]


# ============================================================
# Voice Transcription
# ============================================================


class VoiceTranscriptionRequest(BaseModel):
    """Voice transcription request"""

    audio_url: Optional[str] = None
    language: str = "vi"
    prompt: Optional[str] = None


class VoiceTranscriptionResponse(BaseModel):
    """Voice transcription response"""

    success: bool
    text: Optional[str] = None
    language: str = "vi"
    processing_time_ms: int = 0
    error: Optional[str] = None


# ============================================================
# Health Check
# ============================================================


class HealthResponse(BaseModel):
    """Health check response"""

    status: str
    version: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class DetailedHealthResponse(BaseModel):
    """Detailed health check response"""

    status: str
    version: str
    environment: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    services: Dict[str, Any]


# ============================================================
# Intent Detection
# ============================================================


class IntentResult(BaseModel):
    """NLP intent detection result"""

    type: str = "general"
    confidence: float = 0.5
    keywords: List[str] = []
    entities: Dict[str, List[str]] = {}
    all_intents: Optional[Dict[str, int]] = None


# ============================================================
# Queue Models
# ============================================================


class QueuedMessage(BaseModel):
    """Message stored in offline queue"""

    id: str
    user_id: str
    platform: Platform
    platform_user_id: str
    content: str
    created_at: datetime
    retry_count: int = 0
    last_error: Optional[str] = None
