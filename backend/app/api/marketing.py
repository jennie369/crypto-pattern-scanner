"""
Marketing API Endpoints - Cart Recovery & Broadcast
PHASE 4: TỐI ƯU
"""

from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks, Query
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
import logging

from ..services.cart_recovery_service import cart_recovery_service
from ..services.broadcast_service import broadcast_service
from ..services.segment_service import segment_service
from ..workers.cart_recovery_worker import cart_recovery_worker
from ..workers.broadcast_worker import broadcast_worker

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/marketing", tags=["Marketing"])


# ============================================================
# CART RECOVERY ENDPOINTS
# ============================================================

class TrackCartRequest(BaseModel):
    """Request to track abandoned cart"""
    platform_user_id: str
    shopify_cart_id: Optional[str] = None
    checkout_url: Optional[str] = None
    items: List[Dict[str, Any]]
    subtotal: float
    currency: str = "VND"


class RecoverCartRequest(BaseModel):
    """Request to mark cart as recovered"""
    cart_id: Optional[str] = None
    shopify_cart_id: Optional[str] = None
    order_id: str
    amount: Optional[float] = None


@router.post("/cart/track")
async def track_abandoned_cart(request: TrackCartRequest):
    """
    Track an abandoned cart and schedule recovery reminders.
    Called when user leaves checkout without completing purchase.
    """
    cart_id = await cart_recovery_service.track_abandoned_cart(
        platform_user_id=request.platform_user_id,
        shopify_cart_id=request.shopify_cart_id,
        checkout_url=request.checkout_url,
        items=request.items,
        subtotal=request.subtotal,
        currency=request.currency,
    )

    if not cart_id:
        raise HTTPException(status_code=500, detail="Failed to track cart")

    return {"cart_id": cart_id, "message": "Cart tracked, reminders scheduled"}


@router.post("/cart/recovered")
async def mark_cart_recovered(request: RecoverCartRequest):
    """
    Mark a cart as recovered (purchase completed).
    Called when order is placed successfully.
    """
    success = False

    if request.cart_id:
        success = await cart_recovery_service.mark_recovered(
            cart_id=request.cart_id,
            order_id=request.order_id,
            amount=request.amount,
        )
    elif request.shopify_cart_id:
        success = await cart_recovery_service.mark_recovered_by_shopify_cart(
            shopify_cart_id=request.shopify_cart_id,
            order_id=request.order_id,
            amount=request.amount,
        )
    else:
        raise HTTPException(status_code=400, detail="cart_id or shopify_cart_id required")

    if not success:
        raise HTTPException(status_code=404, detail="Cart not found or already recovered")

    return {"message": "Cart marked as recovered"}


@router.post("/cart/opt-out/{platform_user_id}")
async def opt_out_cart_recovery(platform_user_id: str):
    """
    Opt user out of cart recovery reminders.
    """
    success = await cart_recovery_service.opt_out(platform_user_id)

    if not success:
        raise HTTPException(status_code=500, detail="Failed to opt out")

    return {"message": "Opted out of cart recovery reminders"}


@router.get("/cart/stats")
async def get_cart_recovery_stats(days: int = Query(30, ge=1, le=365)):
    """
    Get cart recovery statistics.
    """
    stats = await cart_recovery_service.get_stats(days=days)
    return stats


@router.get("/cart/worker/status")
async def get_cart_worker_status():
    """
    Get cart recovery worker status.
    """
    return await cart_recovery_worker.get_worker_status()


# ============================================================
# SEGMENT ENDPOINTS
# ============================================================

class CreateSegmentRequest(BaseModel):
    """Request to create a segment"""
    name: str
    description: Optional[str] = None
    rules: Dict[str, Any] = {}


class UpdateSegmentRequest(BaseModel):
    """Request to update a segment"""
    name: Optional[str] = None
    description: Optional[str] = None
    rules: Optional[Dict[str, Any]] = None
    is_active: Optional[bool] = None


@router.post("/segments")
async def create_segment(request: CreateSegmentRequest):
    """
    Create a new user segment.
    """
    segment_id = await segment_service.create_segment(
        name=request.name,
        description=request.description,
        rules=request.rules,
    )

    if not segment_id:
        raise HTTPException(status_code=500, detail="Failed to create segment")

    return {"segment_id": segment_id}


@router.get("/segments")
async def list_segments(
    active_only: bool = Query(True),
    include_system: bool = Query(True),
):
    """
    List all segments.
    """
    segments = await segment_service.list_segments(
        active_only=active_only,
        include_system=include_system,
    )

    return {
        "segments": [
            {
                "id": s.id,
                "name": s.name,
                "description": s.description,
                "user_count": s.user_count,
                "is_active": s.is_active,
                "is_system": s.is_system,
            }
            for s in segments
        ]
    }


@router.get("/segments/{segment_id}")
async def get_segment(segment_id: str):
    """
    Get segment details.
    """
    segment = await segment_service.get_segment(segment_id)

    if not segment:
        raise HTTPException(status_code=404, detail="Segment not found")

    return {
        "id": segment.id,
        "name": segment.name,
        "description": segment.description,
        "rules": segment.rules,
        "user_count": segment.user_count,
        "is_active": segment.is_active,
        "is_system": segment.is_system,
    }


@router.put("/segments/{segment_id}")
async def update_segment(segment_id: str, request: UpdateSegmentRequest):
    """
    Update a segment.
    """
    success = await segment_service.update_segment(
        segment_id=segment_id,
        name=request.name,
        description=request.description,
        rules=request.rules,
        is_active=request.is_active,
    )

    if not success:
        raise HTTPException(status_code=400, detail="Failed to update segment (may be system segment)")

    return {"message": "Segment updated"}


@router.delete("/segments/{segment_id}")
async def delete_segment(segment_id: str):
    """
    Delete a segment (soft delete).
    """
    success = await segment_service.delete_segment(segment_id)

    if not success:
        raise HTTPException(status_code=400, detail="Failed to delete segment (may be system segment)")

    return {"message": "Segment deleted"}


@router.post("/segments/{segment_id}/calculate")
async def calculate_segment_size(segment_id: str):
    """
    Recalculate segment user count.
    """
    count = await segment_service.calculate_segment_size(segment_id)
    return {"user_count": count}


# ============================================================
# BROADCAST ENDPOINTS
# ============================================================

class CreateBroadcastRequest(BaseModel):
    """Request to create a broadcast"""
    name: str
    message_template: str
    segment_id: Optional[str] = None
    platforms: Optional[List[str]] = None
    scheduled_at: Optional[datetime] = None
    message_type: str = "text"
    attachments: Optional[List[Dict[str, Any]]] = None
    quick_replies: Optional[List[Dict[str, str]]] = None
    ab_variants: Optional[List[Dict[str, Any]]] = None
    tags: Optional[List[str]] = None


@router.post("/broadcasts")
async def create_broadcast(request: CreateBroadcastRequest):
    """
    Create a new broadcast campaign.
    """
    broadcast_id = await broadcast_service.create_broadcast(
        name=request.name,
        message_template=request.message_template,
        segment_id=request.segment_id,
        platforms=request.platforms,
        scheduled_at=request.scheduled_at,
        message_type=request.message_type,
        attachments=request.attachments,
        quick_replies=request.quick_replies,
        ab_variants=request.ab_variants,
        tags=request.tags,
    )

    if not broadcast_id:
        raise HTTPException(status_code=500, detail="Failed to create broadcast")

    return {"broadcast_id": broadcast_id}


@router.get("/broadcasts")
async def list_broadcasts(
    status: Optional[str] = Query(None),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
):
    """
    List broadcasts.
    """
    broadcasts = await broadcast_service.list_broadcasts(
        status=status,
        limit=limit,
        offset=offset,
    )

    return {"broadcasts": broadcasts}


@router.get("/broadcasts/{broadcast_id}")
async def get_broadcast(broadcast_id: str):
    """
    Get broadcast details.
    """
    broadcast = await broadcast_service.get_broadcast(broadcast_id)

    if not broadcast:
        raise HTTPException(status_code=404, detail="Broadcast not found")

    return broadcast


@router.get("/broadcasts/{broadcast_id}/stats")
async def get_broadcast_stats(broadcast_id: str):
    """
    Get broadcast statistics.
    """
    stats = await broadcast_service.get_stats(broadcast_id)

    if not stats:
        raise HTTPException(status_code=404, detail="Broadcast not found")

    return {
        "name": stats.name,
        "status": stats.status,
        "total_recipients": stats.total_recipients,
        "sent_count": stats.sent_count,
        "delivered_count": stats.delivered_count,
        "read_count": stats.read_count,
        "clicked_count": stats.clicked_count,
        "replied_count": stats.replied_count,
        "error_count": stats.error_count,
        "open_rate": stats.open_rate,
        "click_rate": stats.click_rate,
        "reply_rate": stats.reply_rate,
    }


@router.post("/broadcasts/{broadcast_id}/send")
async def send_broadcast(broadcast_id: str, background_tasks: BackgroundTasks):
    """
    Send a broadcast immediately.
    Runs in background for large broadcasts.
    """
    # Check broadcast exists
    broadcast = await broadcast_service.get_broadcast(broadcast_id)
    if not broadcast:
        raise HTTPException(status_code=404, detail="Broadcast not found")

    if broadcast.get('status') not in ['draft', 'scheduled', 'paused']:
        raise HTTPException(
            status_code=400,
            detail=f"Cannot send broadcast with status: {broadcast.get('status')}"
        )

    # Send in background
    background_tasks.add_task(broadcast_service.send_broadcast, broadcast_id)

    return {"message": "Broadcast sending started", "broadcast_id": broadcast_id}


@router.post("/broadcasts/{broadcast_id}/pause")
async def pause_broadcast(broadcast_id: str):
    """
    Pause a sending broadcast.
    """
    success = await broadcast_service.pause_broadcast(broadcast_id)

    if not success:
        raise HTTPException(status_code=400, detail="Cannot pause broadcast")

    return {"message": "Broadcast paused"}


@router.post("/broadcasts/{broadcast_id}/cancel")
async def cancel_broadcast(broadcast_id: str):
    """
    Cancel a broadcast.
    """
    success = await broadcast_service.cancel_broadcast(broadcast_id)

    if not success:
        raise HTTPException(status_code=400, detail="Cannot cancel broadcast")

    return {"message": "Broadcast cancelled"}


@router.get("/broadcasts/worker/status")
async def get_broadcast_worker_status():
    """
    Get broadcast worker status.
    """
    return await broadcast_worker.get_worker_status()


# ============================================================
# WORKER CONTROL ENDPOINTS
# ============================================================

@router.post("/workers/start")
async def start_workers(background_tasks: BackgroundTasks):
    """
    Start all marketing workers.
    """
    # Start workers in background
    background_tasks.add_task(cart_recovery_worker.start)
    background_tasks.add_task(broadcast_worker.start)

    return {"message": "Workers starting"}


@router.post("/workers/stop")
async def stop_workers():
    """
    Stop all marketing workers.
    """
    await cart_recovery_worker.stop()
    await broadcast_worker.stop()

    return {"message": "Workers stopped"}
