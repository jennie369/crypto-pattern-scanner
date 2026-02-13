"""
Zalo OA Webhook Handler (PHASE 2 + PHASE 3)
Uses platform adapters and integrates FAQ/Handoff/Emotion services
"""
from fastapi import APIRouter, Request, HTTPException, BackgroundTasks
from typing import Dict, Any
import logging

from ..core.config import get_settings
from ..core.database import (
    get_or_create_platform_user,
    get_or_create_conversation,
    save_message,
    get_conversation_history,
)
from ..adapters.zalo_adapter import zalo_adapter, ZaloAdapter
from ..adapters.base_adapter import IncomingMessage, OutgoingMessage, MessageType
from ..services.ai_service import ai_service
from ..services.nlp_service import nlp_service
from ..services.faq_service import faq_service
from ..services.handoff_service import handoff_service, HandoffPriority
from ..services.emotion_service import emotion_service
from ..services.empathy_service import empathy_service
from ..models.schemas import Platform

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/webhook/zalo", tags=["Zalo OA"])
settings = get_settings()


@router.get("")
async def verify_webhook():
    """Zalo webhook verification (GET request)"""
    return {"status": "ok", "service": "gem-master-zalo"}


@router.post("")
async def handle_zalo_event(
    request: Request,
    background_tasks: BackgroundTasks,
):
    """
    Handle incoming Zalo OA events.

    Event Types:
    - user_send_text: User sends text message
    - user_send_image: User sends image
    - user_send_audio: User sends voice message
    - follow: User follows OA
    - unfollow: User unfollows OA
    """
    try:
        # Get raw body for signature verification
        body_bytes = await request.body()
        body = await request.json()

        # Verify signature using adapter
        signature = request.headers.get("X-ZaloOA-Signature", "")
        if signature and settings.ZALO_APP_SECRET:
            if not zalo_adapter.verify_signature(body_bytes, signature):
                logger.warning("Invalid Zalo signature")
                raise HTTPException(status_code=401, detail="Invalid signature")

        # Parse webhook using adapter
        messages = await zalo_adapter.parse_webhook(body)

        for msg in messages:
            # Route based on message type
            if msg.content_type == MessageType.TEXT:
                background_tasks.add_task(
                    process_zalo_message,
                    incoming=msg,
                )
            elif msg.content_type == MessageType.AUDIO:
                background_tasks.add_task(
                    process_zalo_voice,
                    incoming=msg,
                )
            elif msg.content_type == MessageType.IMAGE:
                background_tasks.add_task(
                    process_zalo_image,
                    incoming=msg,
                )
            elif msg.content_type == MessageType.FOLLOW:
                background_tasks.add_task(
                    send_zalo_welcome,
                    sender_id=msg.platform_user_id,
                )
            elif msg.content_type == MessageType.UNFOLLOW:
                logger.info(f"User unfollowed: {msg.platform_user_id}")

        return {"status": "received"}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Zalo webhook error: {e}")
        return {"status": "error", "message": str(e)}


async def process_zalo_message(incoming: IncomingMessage):
    """
    Process text message from Zalo user.
    Implements FAQ-first flow with handoff support.
    """
    sender_id = incoming.platform_user_id
    message_text = incoming.content

    try:
        # Send typing indicator
        await zalo_adapter.send_typing_indicator(sender_id)

        # Get or create platform user
        platform_user_id = await get_or_create_platform_user(
            platform="zalo",
            platform_user_id=sender_id,
        )

        if not platform_user_id:
            await zalo_adapter.send_message(
                sender_id,
                zalo_adapter.create_text_message(
                    "Xin lỗi, hệ thống đang gặp sự cố. Vui lòng thử lại sau."
                )
            )
            return

        # Get or create conversation
        conv_id = await get_or_create_conversation(
            platform_user_id=platform_user_id,
            platform="zalo",
        )

        # Save user message
        await save_message(
            conversation_id=conv_id,
            platform_user_id=platform_user_id,
            role="user",
            content=message_text,
            platform_message_id=incoming.message_id,
        )

        # ========== PHASE 2: Check for pending handoff ==========
        pending_handoff = await handoff_service.get_pending_for_conversation(conv_id)
        if pending_handoff:
            # User is in handoff mode - forward to agent
            logger.info(f"User in handoff mode, forwarding to agent: {pending_handoff.id}")
            await zalo_adapter.send_message(
                sender_id,
                zalo_adapter.create_text_message(
                    "Tin nhắn của bạn đã được gửi đến nhân viên hỗ trợ. Vui lòng đợi phản hồi."
                )
            )
            return

        # ========== PHASE 3: Analyze emotion ==========
        emotion_analysis = emotion_service.analyze(message_text)
        logger.info(f"Emotion: {emotion_analysis.emotion} ({emotion_analysis.emotion_score}), "
                    f"Sentiment: {emotion_analysis.sentiment}, Urgency: {emotion_analysis.urgency}")

        # Check if empathy service recommends escalation
        should_escalate_empathy, escalation_reason = empathy_service.should_escalate(
            emotion_analysis.emotion, emotion_analysis.urgency
        )

        # ========== PHASE 2: Check handoff triggers first ==========
        should_handoff, handoff_reason, priority = handoff_service.should_trigger(message_text)

        # Combine handoff triggers with emotion-based escalation
        if should_escalate_empathy and not should_handoff:
            should_handoff = True
            handoff_reason = escalation_reason

        if should_handoff:
            handoff = await handoff_service.create_request(
                platform_user_id=platform_user_id,
                conversation_id=conv_id,
                reason=handoff_reason,
                priority=priority
            )
            if handoff:
                online_agents = await handoff_service.get_online_agents_count()
                response_text = handoff_service.format_handoff_message(handoff, online_agents)
                await zalo_adapter.send_message(
                    sender_id,
                    zalo_adapter.create_text_message(response_text)
                )
                await save_message(
                    conversation_id=conv_id,
                    platform_user_id=platform_user_id,
                    role="assistant",
                    content=response_text,
                )
                return

        # ========== PHASE 2: Try FAQ first ==========
        faq_match = await faq_service.search_answer(message_text)
        if faq_match:
            logger.info(f"FAQ match: {faq_match.question} (confidence: {faq_match.confidence})")
            response_text = await faq_service.format_faq_response(faq_match)

            await zalo_adapter.send_message(
                sender_id,
                zalo_adapter.create_text_message(response_text)
            )
            await save_message(
                conversation_id=conv_id,
                platform_user_id=platform_user_id,
                role="assistant",
                content=response_text,
                metadata={"source": "faq", "faq_id": faq_match.id}
            )
            return

        # ========== Fallback to AI ==========
        history = await get_conversation_history(
            platform_user_id=platform_user_id,
            platform="zalo",
            limit=6,
        )

        intent = await nlp_service.detect_intent(message_text)

        response = await ai_service.generate_response(
            message=message_text,
            history=history,
            user_tier="FREE",
            intent=intent,
            platform=Platform.ZALO,
        )

        # ========== PHASE 3: Wrap response with empathy ==========
        empathy_result = empathy_service.format_with_emotion_context(
            analysis=emotion_analysis,
            core_response=response["text"],
        )
        final_response = empathy_result["text"]

        await zalo_adapter.send_message(
            sender_id,
            zalo_adapter.create_text_message(final_response)
        )

        await save_message(
            conversation_id=conv_id,
            platform_user_id=platform_user_id,
            role="assistant",
            content=final_response,
            tokens_used=response.get("tokens_used", 0),
            response_time_ms=response.get("processing_time_ms"),
            metadata={
                "source": "ai",
                "emotion": emotion_analysis.emotion,
                "sentiment": emotion_analysis.sentiment,
                "empathy_level": empathy_result.get("empathy_level"),
            }
        )

        # ========== PHASE 3: Log emotion analysis ==========
        await emotion_service.log_emotion(
            message_id=incoming.message_id,
            platform_user_id=platform_user_id,
            conversation_id=conv_id,
            analysis=emotion_analysis,
            response_tone=empathy_result.get("response_tone"),
            empathy_level=empathy_result.get("empathy_level"),
            raw_text=message_text,
        )

    except Exception as e:
        logger.error(f"Zalo message processing error: {e}")
        await zalo_adapter.send_message(
            sender_id,
            zalo_adapter.create_text_message(
                "Xin lỗi, hệ thống đang gặp sự cố. Vui lòng thử lại sau."
            )
        )


async def process_zalo_voice(incoming: IncomingMessage):
    """Process voice message from Zalo - transcribe and respond"""
    sender_id = incoming.platform_user_id

    try:
        # Get audio URL from attachments
        audio_url = None
        if incoming.attachments:
            audio_url = incoming.attachments[0].url

        if not audio_url:
            await zalo_adapter.send_message(
                sender_id,
                zalo_adapter.create_text_message(
                    "Không thể đọc tin nhắn thoại. Vui lòng gửi lại."
                )
            )
            return

        # TODO: Integrate voice transcription service
        # For now, inform user
        await zalo_adapter.send_message(
            sender_id,
            zalo_adapter.create_text_message(
                "Xin lỗi, tính năng tin nhắn thoại đang được phát triển. Vui lòng gửi tin nhắn văn bản."
            )
        )

    except Exception as e:
        logger.error(f"Zalo voice processing error: {e}")


async def process_zalo_image(incoming: IncomingMessage):
    """Process image message from Zalo"""
    sender_id = incoming.platform_user_id

    try:
        await zalo_adapter.send_message(
            sender_id,
            zalo_adapter.create_text_message(
                "Đã nhận được hình ảnh của bạn. Hiện tại Gemral chưa hỗ trợ phân tích hình ảnh. Vui lòng mô tả bằng văn bản."
            )
        )

    except Exception as e:
        logger.error(f"Zalo image processing error: {e}")


async def send_zalo_welcome(sender_id: str):
    """Send welcome message to new follower"""
    welcome_text = """Chào mừng bạn đến với Gemral!

Tôi là trợ lý AI thông minh, sẵn sàng hỗ trợ bạn về:
- Phân tích xu hướng thị trường crypto
- Chiến lược Frequency Trading Method
- Tư vấn tâm lý giao dịch
- Đá quý và phong thủy
- Tarot và Kinh Dịch

Gửi tin nhắn bất kỳ để bắt đầu!

💡 Nhắn "gặp support" nếu cần hỗ trợ từ nhân viên."""

    # Send with quick replies
    quick_replies = [
        {"title": "Bắt đầu", "payload": "start"},
        {"title": "Xem giá cả", "payload": "pricing"},
        {"title": "Hỗ trợ", "payload": "support"}
    ]

    message = zalo_adapter.create_quick_reply_message(welcome_text, quick_replies)
    await zalo_adapter.send_message(sender_id, message)
