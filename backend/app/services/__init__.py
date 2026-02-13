"""Services module - Business logic"""
from .connection_manager import ConnectionManager, connection_manager
from .nlp_service import NLPService, nlp_service
from .ai_service import AIService, ai_service
from .message_router import MessageRouter, message_router
from .faq_service import FAQService, faq_service
from .handoff_service import HandoffService, handoff_service
from .emotion_service import EmotionService, emotion_service
from .empathy_service import EmpathyService, empathy_service
from .recommendation_service import RecommendationService, recommendation_service
from .segment_service import SegmentService, segment_service
from .cart_recovery_service import CartRecoveryService, cart_recovery_service
from .broadcast_service import BroadcastService, broadcast_service
from .gamification_service import GamificationService, gamification_service

__all__ = [
    "ConnectionManager",
    "connection_manager",
    "NLPService",
    "nlp_service",
    "AIService",
    "ai_service",
    "MessageRouter",
    "message_router",
    # PHASE 2
    "FAQService",
    "faq_service",
    "HandoffService",
    "handoff_service",
    # PHASE 3
    "EmotionService",
    "emotion_service",
    "EmpathyService",
    "empathy_service",
    "RecommendationService",
    "recommendation_service",
    # PHASE 4
    "SegmentService",
    "segment_service",
    "CartRecoveryService",
    "cart_recovery_service",
    "BroadcastService",
    "broadcast_service",
    # PHASE 5
    "GamificationService",
    "gamification_service",
]
