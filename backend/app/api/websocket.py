"""
WebSocket Handler
Real-time chat with typing indicators and authentication
"""
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query
from fastapi.websockets import WebSocketState
from typing import Optional, Dict, Any
import json
import asyncio
from datetime import datetime
import logging

from ..core.config import get_settings
from ..core.security import verify_jwt_from_query
from ..core.database import get_user_profile
from ..services.connection_manager import connection_manager
from ..services.message_router import message_router

logger = logging.getLogger(__name__)
router = APIRouter()
settings = get_settings()


@router.websocket("/ws/chat")
async def websocket_chat(
    websocket: WebSocket,
    token: Optional[str] = Query(None),
):
    """
    WebSocket endpoint for real-time chat.

    Connection Flow:
    1. Client connects with ?token=<jwt>
    2. Server verifies token and accepts connection
    3. Client sends chat messages
    4. Server responds with typing indicator, then response

    Message Types (Client -> Server):
    - {"type": "chat", "content": "...", "session_id": "..."}
    - {"type": "ping"}

    Message Types (Server -> Client):
    - {"type": "connected", "user_id": "...", "tier": "..."}
    - {"type": "typing", "is_typing": true/false}
    - {"type": "response", "content": "...", ...}
    - {"type": "error", "content": "..."}
    - {"type": "pong"}
    """
    user = None
    user_id = None

    try:
        # Verify authentication
        if token:
            user = verify_jwt_from_query(token)

        if not user:
            await websocket.close(code=4001, reason="Authentication required")
            return

        user_id = user["user_id"]

        # Get user profile for tier
        profile = await get_user_profile(user_id)
        user_tier = profile.get("scanner_tier", "FREE") if profile else "FREE"

        # Check connection limit
        if not await connection_manager.can_connect(user_id):
            await websocket.close(code=4002, reason="Too many connections")
            return

        # Accept connection
        await websocket.accept()

        # Register connection
        if not await connection_manager.connect(websocket, user_id):
            await websocket.close(code=4002, reason="Connection failed")
            return

        # Send connected confirmation
        await websocket.send_json({
            "type": "connected",
            "user_id": user_id,
            "tier": user_tier,
            "timestamp": datetime.utcnow().isoformat(),
        })

        logger.info(f"WebSocket connected: {user_id}")

        # Message handling loop
        while True:
            try:
                # Receive message with timeout
                raw_data = await asyncio.wait_for(
                    websocket.receive_text(),
                    timeout=settings.WS_CONNECTION_TIMEOUT,
                )

                data = json.loads(raw_data)
                msg_type = data.get("type")

                # Handle ping/pong for keepalive
                if msg_type == "ping":
                    await websocket.send_json({"type": "pong"})
                    continue

                # Handle chat message
                if msg_type == "chat":
                    await handle_chat_message(
                        websocket=websocket,
                        user_id=user_id,
                        user_tier=user_tier,
                        data=data,
                    )

            except asyncio.TimeoutError:
                # Connection idle timeout
                logger.info(f"Connection timeout for {user_id}")
                await websocket.send_json({
                    "type": "timeout",
                    "message": "Connection idle, closing",
                })
                break

            except json.JSONDecodeError:
                await websocket.send_json({
                    "type": "error",
                    "content": "Invalid JSON format",
                })

    except WebSocketDisconnect:
        logger.info(f"WebSocket disconnected: {user_id}")
    except Exception as e:
        logger.error(f"WebSocket error for {user_id}: {e}")
    finally:
        if user_id:
            await connection_manager.disconnect(websocket, user_id)


async def handle_chat_message(
    websocket: WebSocket,
    user_id: str,
    user_tier: str,
    data: Dict[str, Any],
):
    """Handle incoming chat message with typing indicator"""
    content = data.get("content", "").strip()
    session_id = data.get("session_id")

    if not content:
        await websocket.send_json({
            "type": "error",
            "content": "Message cannot be empty",
        })
        return

    # Check message length
    if len(content) > 4000:
        await websocket.send_json({
            "type": "error",
            "content": "Message too long (max 4000 characters)",
        })
        return

    try:
        # Rate limit check
        if not await connection_manager.check_rate_limit(user_id):
            await websocket.send_json({
                "type": "error",
                "content": "Rate limit exceeded. Please slow down.",
                "code": "RATE_LIMIT",
            })
            return

        # Send typing indicator
        await websocket.send_json({
            "type": "typing",
            "is_typing": True,
        })

        # Process message
        response = await message_router.process(
            content=content,
            user_id=user_id,
            platform="mobile",
        )

        # Stop typing indicator
        await websocket.send_json({
            "type": "typing",
            "is_typing": False,
        })

        # Check for quota exceeded
        if response.get("quota_exceeded"):
            await websocket.send_json({
                "type": "error",
                "content": response["content"],
                "code": "QUOTA_EXCEEDED",
                "quota_exceeded": True,
            })
            return

        # Send response
        await websocket.send_json({
            "type": "response",
            "content": response["content"],
            "session_id": session_id,
            "conversation_id": response.get("conversation_id"),
            "tokens_used": response.get("tokens_used", 0),
            "processing_time_ms": response.get("processing_time_ms", 0),
            "quick_actions": response.get("quick_actions"),
            "intent": response.get("intent"),
        })

    except Exception as e:
        logger.error(f"Chat error for {user_id}: {e}")

        # Make sure typing is stopped
        try:
            await websocket.send_json({
                "type": "typing",
                "is_typing": False,
            })
        except Exception:
            pass

        await websocket.send_json({
            "type": "error",
            "content": "Xin loi, co su co ky thuat. Vui long thu lai.",
        })


@router.get("/ws/status")
async def websocket_status():
    """Get WebSocket connection status"""
    return {
        "active_connections": connection_manager.get_active_connections_count(),
        "connected_users": len(connection_manager.get_connected_users()),
    }
