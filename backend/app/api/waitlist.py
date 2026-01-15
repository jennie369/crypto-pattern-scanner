"""
Waitlist API Endpoints - Registration & Management
PHASE 1: MVP
"""

from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks, Query, Request
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
import logging
import json

from ..services.waitlist_service import waitlist_service
from ..core.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()

router = APIRouter(tags=["Waitlist"])


# ============================================================
# Request/Response Models
# ============================================================

class RegisterRequest(BaseModel):
    """Waitlist registration request"""
    phone: str = Field(..., description="Vietnamese phone number")
    name: Optional[str] = Field(None, description="User name")
    referral_code: Optional[str] = Field(None, description="Referral code from friend")
    utm_source: Optional[str] = None
    utm_medium: Optional[str] = None
    utm_campaign: Optional[str] = None


class RegisterResponse(BaseModel):
    """Waitlist registration response"""
    id: str
    queue_number: int
    phone: str
    referral_code: str
    status: str
    already_exists: bool


class StatusResponse(BaseModel):
    """Waitlist status response"""
    queue_number: int
    status: str
    nurturing_stage: int
    referral_code: str
    referral_count: int
    zalo_connected: bool
    created_at: str


class PublicStatsResponse(BaseModel):
    """Public statistics for landing page"""
    total_entries: int
    remaining_slots: int
    zalo_connected_count: int


class ManualLinkZaloRequest(BaseModel):
    """Request to manually link Zalo ID"""
    zalo_id: str


class SendNurturingRequest(BaseModel):
    """Request to send nurturing message"""
    stage: int = Field(..., ge=2, le=5)


class BroadcastRequest(BaseModel):
    """Broadcast message request"""
    message: str
    status_filter: Optional[List[str]] = None
    limit: int = Field(1000, ge=1, le=10000)


class TriggerLaunchRequest(BaseModel):
    """Request to trigger launch notifications"""
    app_link: str = "https://app.gemral.com"


class UpdateStatusRequest(BaseModel):
    """Request to update entry status"""
    status: str


# ============================================================
# PUBLIC ENDPOINTS (Landing page calls these)
# ============================================================

@router.post("/api/waitlist/register", response_model=RegisterResponse)
async def register_waitlist(request: RegisterRequest):
    """
    Register for waitlist.
    Called by landing page form submission.
    """
    entry, error = await waitlist_service.create_entry(
        phone=request.phone,
        name=request.name,
        referral_code=request.referral_code,
        utm_source=request.utm_source,
        utm_medium=request.utm_medium,
        utm_campaign=request.utm_campaign,
    )

    if error:
        raise HTTPException(status_code=400, detail=error)

    return RegisterResponse(
        id=entry['id'],
        queue_number=entry['queue_number'],
        phone=entry['phone'],
        referral_code=entry['referral_code'],
        status=entry['status'],
        already_exists=entry.get('already_exists', False),
    )


@router.get("/api/waitlist/check/{phone}", response_model=StatusResponse)
async def check_waitlist_status(phone: str):
    """
    Check waitlist status by phone number.
    """
    status = await waitlist_service.check_status(phone)

    if not status:
        raise HTTPException(status_code=404, detail="Không tìm thấy đăng ký với số điện thoại này")

    return StatusResponse(
        queue_number=status['queue_number'],
        status=status['status'],
        nurturing_stage=status['nurturing_stage'],
        referral_code=status['referral_code'],
        referral_count=status['referral_count'],
        zalo_connected=status['zalo_connected'],
        created_at=status['created_at'],
    )


@router.get("/api/waitlist/stats/public", response_model=PublicStatsResponse)
async def get_public_stats():
    """
    Get public statistics for landing page.
    Shows total registrations and remaining slots.
    """
    stats = await waitlist_service.get_public_stats()

    return PublicStatsResponse(
        total_entries=stats.get('total_entries', 0),
        remaining_slots=stats.get('remaining_slots', 1000),
        zalo_connected_count=stats.get('zalo_connected_count', 0),
    )


@router.get("/api/waitlist/referral/{code}")
async def get_referrer_info(code: str):
    """
    Get referrer information by referral code.
    """
    info = await waitlist_service.get_referrer_info(code)

    if not info:
        raise HTTPException(status_code=404, detail="Mã giới thiệu không hợp lệ")

    return info


# ============================================================
# WEBHOOK ENDPOINT (Zalo OA calls this)
# ============================================================

@router.post("/webhook/zalo-waitlist")
async def handle_zalo_webhook(
    request: Request,
    background_tasks: BackgroundTasks,
):
    """
    Handle Zalo OA webhook events for waitlist.
    Processes follow/unfollow events.
    """
    try:
        # Verify signature
        signature = request.headers.get("X-ZaloOA-Signature", "")
        body = await request.body()

        from ..adapters.zalo_adapter import zalo_adapter
        if not zalo_adapter.verify_signature(body, signature):
            logger.warning("Invalid Zalo webhook signature")
            raise HTTPException(status_code=401, detail="Invalid signature")

        data = json.loads(body)
        event_name = data.get("event_name", "")

        if event_name == "follow":
            follower = data.get("follower", {})
            zalo_user_id = follower.get("id", "")
            timestamp = data.get("timestamp", 0)

            if zalo_user_id:
                event_time = datetime.fromtimestamp(timestamp / 1000) if timestamp else datetime.utcnow()
                background_tasks.add_task(
                    waitlist_service.handle_zalo_follow,
                    zalo_user_id,
                    event_time,
                )

        elif event_name == "unfollow":
            follower = data.get("follower", {})
            zalo_user_id = follower.get("id", "")

            if zalo_user_id:
                background_tasks.add_task(
                    waitlist_service.handle_zalo_unfollow,
                    zalo_user_id,
                )

        return {"message": "OK"}

    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid JSON")
    except Exception as e:
        logger.error(f"Zalo webhook error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================
# ADMIN ENDPOINTS (require authentication)
# ============================================================

@router.get("/api/admin/waitlist/entries")
async def list_waitlist_entries(
    status: Optional[str] = Query(None),
    has_zalo: Optional[bool] = Query(None),
    search: Optional[str] = Query(None),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
):
    """
    List waitlist entries with filters.
    Admin only.
    """
    entries, total = await waitlist_service.list_entries(
        status=status,
        has_zalo=has_zalo,
        search=search,
        limit=limit,
        offset=offset,
    )

    return {
        "entries": entries,
        "total": total,
        "limit": limit,
        "offset": offset,
        "has_more": offset + limit < total,
    }


@router.get("/api/admin/waitlist/entries/{entry_id}")
async def get_waitlist_entry(entry_id: str):
    """
    Get single waitlist entry details.
    Admin only.
    """
    entry = await waitlist_service.get_entry(entry_id)

    if not entry:
        raise HTTPException(status_code=404, detail="Entry not found")

    return entry


@router.put("/api/admin/waitlist/entries/{entry_id}/status")
async def update_entry_status(entry_id: str, request: UpdateStatusRequest):
    """
    Update waitlist entry status.
    Admin only.
    """
    success = await waitlist_service.update_entry_status(
        entry_id=entry_id,
        status=request.status,
    )

    if not success:
        raise HTTPException(status_code=400, detail="Failed to update status")

    return {"message": "Status updated"}


@router.post("/api/admin/waitlist/entries/{entry_id}/link-zalo")
async def manual_link_zalo(entry_id: str, request: ManualLinkZaloRequest):
    """
    Manually link Zalo ID to waitlist entry.
    Admin only.
    """
    success, error = await waitlist_service.manual_link_zalo(
        entry_id=entry_id,
        zalo_user_id=request.zalo_id,
    )

    if not success:
        raise HTTPException(status_code=400, detail=error or "Failed to link Zalo")

    return {"message": "Zalo linked successfully"}


@router.post("/api/admin/waitlist/entries/{entry_id}/resend-welcome")
async def resend_welcome(entry_id: str, background_tasks: BackgroundTasks):
    """
    Resend welcome message to entry.
    Admin only.
    """
    entry = await waitlist_service.get_entry(entry_id)

    if not entry:
        raise HTTPException(status_code=404, detail="Entry not found")

    if not entry.get('zalo_user_id'):
        raise HTTPException(status_code=400, detail="Entry has no Zalo connection")

    background_tasks.add_task(waitlist_service.send_welcome_message, entry_id)

    return {"message": "Welcome message queued for sending"}


@router.post("/api/admin/waitlist/entries/{entry_id}/send-nurturing")
async def send_nurturing(entry_id: str, request: SendNurturingRequest):
    """
    Send specific nurturing stage message.
    Admin only.
    """
    result = await waitlist_service.send_nurturing_message(
        entry_id=entry_id,
        stage=request.stage,
    )

    if not result.success:
        raise HTTPException(status_code=400, detail=result.error_message or "Failed to send")

    return {"message": f"Nurturing stage {request.stage} sent successfully"}


@router.get("/api/admin/waitlist/entries/{entry_id}/messages")
async def get_entry_messages(entry_id: str, limit: int = Query(50, ge=1, le=200)):
    """
    Get message log for entry.
    Admin only.
    """
    messages = await waitlist_service.get_message_log(
        entry_id=entry_id,
        limit=limit,
    )

    return {"messages": messages}


@router.get("/api/admin/waitlist/stats")
async def get_waitlist_stats():
    """
    Get detailed waitlist statistics.
    Admin only.
    """
    stats = await waitlist_service.get_stats()

    return {
        "total_entries": stats.total_entries,
        "zalo_connected": stats.zalo_connected,
        "pending": stats.pending,
        "nurturing": stats.nurturing,
        "completed": stats.completed,
        "converted": stats.converted,
        "unsubscribed": stats.unsubscribed,
        "connection_rate": stats.connection_rate,
        "today_signups": stats.today_signups,
    }


@router.post("/api/admin/waitlist/broadcast")
async def send_broadcast(request: BroadcastRequest, background_tasks: BackgroundTasks):
    """
    Send broadcast message to waitlist entries.
    Admin only.
    """
    background_tasks.add_task(
        waitlist_service.send_broadcast,
        request.message,
        request.status_filter,
        request.limit,
    )

    return {"message": "Broadcast queued for sending"}


@router.post("/api/admin/waitlist/send-launch")
async def trigger_launch_notifications(
    limit: int = Query(100, ge=1, le=1000),
    background_tasks: BackgroundTasks = None,
):
    """
    Trigger launch notifications to waitlist entries.
    Sends app launch announcement in batches.
    Admin only.
    """
    # Get entries that haven't been notified
    entries, _ = await waitlist_service.list_entries(
        status=None,  # All eligible statuses
        has_zalo=True,
        limit=limit,
    )

    # Filter to those not yet notified
    eligible = [
        e for e in entries
        if not e.get('launch_notified_at')
        and e.get('status') not in ['unsubscribed', 'invalid']
    ]

    if not eligible:
        return {"message": "No entries to notify", "count": 0}

    # Queue notifications
    for entry in eligible:
        background_tasks.add_task(
            waitlist_service.send_launch_notification,
            entry['id'],
        )

    return {
        "message": f"Launch notifications queued for {len(eligible)} entries",
        "count": len(eligible),
    }


@router.get("/api/admin/waitlist/export")
async def export_waitlist(
    format: str = Query("json", regex="^(json|csv)$"),
    status: Optional[str] = Query(None),
):
    """
    Export waitlist entries.
    Admin only.
    """
    entries = await waitlist_service.export_entries(
        format=format,
        status=status,
    )

    if format == "csv":
        # Build CSV content
        if not entries:
            return {"content": "", "filename": "waitlist_export.csv"}

        headers = list(entries[0].keys())
        rows = [",".join(headers)]

        for entry in entries:
            row = [str(entry.get(h, "")).replace(",", ";") for h in headers]
            rows.append(",".join(row))

        csv_content = "\n".join(rows)

        return {
            "content": csv_content,
            "filename": f"waitlist_export_{datetime.utcnow().strftime('%Y%m%d')}.csv",
        }

    return {
        "entries": entries,
        "count": len(entries),
        "exported_at": datetime.utcnow().isoformat(),
    }


# ============================================================
# WORKER CONTROL ENDPOINTS
# ============================================================

@router.get("/api/admin/waitlist/nurturing/status")
async def get_nurturing_status():
    """
    Get nurturing worker status.
    Admin only.
    """
    try:
        from ..workers.nurturing_worker import nurturing_worker
        return await nurturing_worker.get_worker_status()
    except ImportError:
        return {"status": "not_available", "message": "Nurturing worker not initialized"}


@router.post("/api/admin/waitlist/nurturing/process")
async def process_nurturing_now(background_tasks: BackgroundTasks):
    """
    Manually trigger nurturing queue processing.
    Admin only.
    """
    background_tasks.add_task(waitlist_service.process_nurturing_queue, 50)

    return {"message": "Nurturing queue processing triggered"}


# ============================================================
# TRADING LEADS ENDPOINTS (for yinyangmasters.com landing page)
# ============================================================

class TradingLeadRequest(BaseModel):
    """Trading course lead registration request"""
    email: str = Field(..., description="Email address")
    name: Optional[str] = Field(None, description="User name")
    phone: Optional[str] = Field(None, description="Phone number")
    source: Optional[str] = Field("fomo_popup", description="Lead source")
    utm_source: Optional[str] = None
    utm_medium: Optional[str] = None
    utm_campaign: Optional[str] = None
    referrer_url: Optional[str] = None


class TradingLeadResponse(BaseModel):
    """Trading lead registration response"""
    id: str
    queue_number: int
    email: str
    discount_code: str
    is_first_50: bool
    benefits: dict


class ValidateDiscountRequest(BaseModel):
    """Validate discount code request"""
    code: str


@router.post("/api/trading-leads/register", response_model=TradingLeadResponse)
async def register_trading_lead(request: TradingLeadRequest):
    """
    Register as trading course lead.
    First 50 get: 500K discount + 30 days Pro Scanner.
    Called by yinyangmasters.com FOMO popup.
    """
    try:
        from ..core.database import get_supabase_admin

        supabase = get_supabase_admin()

        # Validate email format
        import re
        if not re.match(r'^[\w\.-]+@[\w\.-]+\.\w+$', request.email):
            raise HTTPException(status_code=400, detail="Email khong hop le")

        # Check for existing lead
        existing = supabase.table('trading_leads').select(
            'id, queue_number, email, discount_code'
        ).eq('email', request.email.lower()).execute()

        if existing.data and len(existing.data) > 0:
            lead = existing.data[0]
            is_first_50 = lead['queue_number'] <= 50

            return TradingLeadResponse(
                id=lead['id'],
                queue_number=lead['queue_number'],
                email=lead['email'],
                discount_code=lead['discount_code'],
                is_first_50=is_first_50,
                benefits={
                    "discount_amount": 500000 if is_first_50 else 0,
                    "scanner_days": 30 if is_first_50 else 0,
                    "already_registered": True,
                }
            )

        # Create new lead
        result = supabase.table('trading_leads').insert({
            'email': request.email.lower(),
            'name': request.name,
            'phone': request.phone,
            'source': request.source,
            'utm_source': request.utm_source,
            'utm_medium': request.utm_medium,
            'utm_campaign': request.utm_campaign,
            'referrer_url': request.referrer_url,
        }).execute()

        if result.data and len(result.data) > 0:
            lead = result.data[0]
            is_first_50 = lead['queue_number'] <= 50

            return TradingLeadResponse(
                id=lead['id'],
                queue_number=lead['queue_number'],
                email=lead['email'],
                discount_code=lead['discount_code'],
                is_first_50=is_first_50,
                benefits={
                    "discount_amount": 500000 if is_first_50 else 0,
                    "scanner_days": 30 if is_first_50 else 0,
                    "already_registered": False,
                }
            )

        raise HTTPException(status_code=500, detail="Khong the dang ky")

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Trading lead registration error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/api/trading-leads/stats")
async def get_trading_leads_stats():
    """
    Get public stats for trading leads.
    Shows remaining slots (of first 50).
    """
    try:
        from ..core.database import get_supabase_admin

        supabase = get_supabase_admin()

        result = supabase.rpc('get_trading_leads_stats').execute()

        if result.data:
            return result.data

        return {
            "total_leads": 0,
            "first_50_remaining": 50,
            "first_50_taken": 0,
        }

    except Exception as e:
        logger.error(f"Get trading leads stats error: {e}")
        return {
            "total_leads": 0,
            "first_50_remaining": 50,
            "first_50_taken": 0,
        }


@router.post("/api/trading-leads/validate-discount")
async def validate_discount_code(request: ValidateDiscountRequest):
    """
    Validate a trading discount code.
    Called by Shopify checkout or payment page.
    """
    try:
        from ..core.database import get_supabase_admin

        supabase = get_supabase_admin()

        result = supabase.rpc('validate_trading_discount', {
            'p_code': request.code
        }).execute()

        if result.data:
            return result.data

        return {"valid": False, "error": "Invalid code"}

    except Exception as e:
        logger.error(f"Validate discount error: {e}")
        return {"valid": False, "error": str(e)}


@router.post("/api/trading-leads/activate-scanner")
async def activate_pro_scanner(email: str = Query(...)):
    """
    Activate Pro Scanner for trading lead.
    Called when user creates Gemral account or manually.
    """
    try:
        from ..core.database import get_supabase_admin

        supabase = get_supabase_admin()

        result = supabase.rpc('activate_pro_scanner', {
            'p_email': email
        }).execute()

        if result.data:
            return result.data

        return {"success": False, "error": "Activation failed"}

    except Exception as e:
        logger.error(f"Activate scanner error: {e}")
        return {"success": False, "error": str(e)}


@router.get("/api/admin/trading-leads")
async def list_trading_leads(
    status: Optional[str] = Query(None),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
):
    """
    List trading leads.
    Admin only.
    """
    try:
        from ..core.database import get_supabase_admin

        supabase = get_supabase_admin()

        query = supabase.table('trading_leads').select(
            'id, queue_number, email, name, phone, source, discount_code, '
            'benefits_status, scanner_activated_at, scanner_expires_at, '
            'converted_at, course_tier, created_at',
            count='exact'
        )

        if status:
            query = query.eq('benefits_status', status)

        result = query.order('created_at', desc=True).range(
            offset, offset + limit - 1
        ).execute()

        return {
            "leads": result.data or [],
            "total": result.count or 0,
            "limit": limit,
            "offset": offset,
        }

    except Exception as e:
        logger.error(f"List trading leads error: {e}")
        return {"leads": [], "total": 0}


# ============================================================
# FREQUENCY LEADS ENDPOINTS (for yinyangmasters.com/pages/7ngaykhaimotansogoc)
# Khóa 7 Ngày Khai Mở Tần Số Gốc
# ============================================================

class FrequencyLeadRequest(BaseModel):
    """Frequency course lead registration request"""
    email: str = Field(..., description="Email address")
    name: Optional[str] = Field(None, description="User name")
    phone: Optional[str] = Field(None, description="Phone number")
    source: Optional[str] = Field("fomo_popup", description="Lead source")
    utm_source: Optional[str] = None
    utm_medium: Optional[str] = None
    utm_campaign: Optional[str] = None
    referrer_url: Optional[str] = None


class FrequencyLeadResponse(BaseModel):
    """Frequency lead registration response"""
    id: str
    queue_number: int
    email: str
    discount_code: str
    is_first_50: bool
    benefits: dict


@router.post("/api/frequency-leads/register", response_model=FrequencyLeadResponse)
async def register_frequency_lead(request: FrequencyLeadRequest):
    """
    Register as frequency course lead.
    First 50 get: 200K discount.
    Called by yinyangmasters.com FOMO popup (Khóa 7 Ngày Khai Mở Tần Số Gốc).
    """
    try:
        from ..core.database import get_supabase_admin

        supabase = get_supabase_admin()

        # Validate email format
        import re
        if not re.match(r'^[\w\.-]+@[\w\.-]+\.\w+$', request.email):
            raise HTTPException(status_code=400, detail="Email khong hop le")

        # Check for existing lead
        existing = supabase.table('frequency_leads').select(
            'id, queue_number, email, discount_code'
        ).eq('email', request.email.lower()).execute()

        if existing.data and len(existing.data) > 0:
            lead = existing.data[0]
            is_first_50 = lead['queue_number'] <= 50

            return FrequencyLeadResponse(
                id=lead['id'],
                queue_number=lead['queue_number'],
                email=lead['email'],
                discount_code=lead['discount_code'],
                is_first_50=is_first_50,
                benefits={
                    "discount_amount": 200000 if is_first_50 else 0,
                    "already_registered": True,
                }
            )

        # Create new lead
        result = supabase.table('frequency_leads').insert({
            'email': request.email.lower(),
            'name': request.name,
            'phone': request.phone,
            'source': request.source,
            'utm_source': request.utm_source,
            'utm_medium': request.utm_medium,
            'utm_campaign': request.utm_campaign,
            'referrer_url': request.referrer_url,
        }).execute()

        if result.data and len(result.data) > 0:
            lead = result.data[0]
            is_first_50 = lead['queue_number'] <= 50

            # Send push notification to admins
            try:
                await notify_admins_frequency_lead(lead)
            except Exception as e:
                logger.warning(f"Failed to send admin notification: {e}")

            return FrequencyLeadResponse(
                id=lead['id'],
                queue_number=lead['queue_number'],
                email=lead['email'],
                discount_code=lead['discount_code'],
                is_first_50=is_first_50,
                benefits={
                    "discount_amount": 200000 if is_first_50 else 0,
                    "already_registered": False,
                }
            )

        raise HTTPException(status_code=500, detail="Khong the dang ky")

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Frequency lead registration error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/api/frequency-leads/stats")
async def get_frequency_leads_stats():
    """
    Get public stats for frequency leads.
    Shows remaining slots (of first 50).
    """
    try:
        from ..core.database import get_supabase_admin

        supabase = get_supabase_admin()

        result = supabase.rpc('get_frequency_leads_stats').execute()

        if result.data:
            return result.data

        return {
            "total_leads": 0,
            "first_50_remaining": 50,
            "first_50_taken": 0,
        }

    except Exception as e:
        logger.error(f"Get frequency leads stats error: {e}")
        return {
            "total_leads": 0,
            "first_50_remaining": 50,
            "first_50_taken": 0,
        }


@router.post("/api/frequency-leads/validate-discount")
async def validate_frequency_discount_code(request: ValidateDiscountRequest):
    """
    Validate a frequency discount code.
    Called by Shopify checkout or payment page.
    """
    try:
        from ..core.database import get_supabase_admin

        supabase = get_supabase_admin()

        result = supabase.rpc('validate_frequency_discount', {
            'p_code': request.code
        }).execute()

        if result.data:
            return result.data

        return {"valid": False, "error": "Invalid code"}

    except Exception as e:
        logger.error(f"Validate frequency discount error: {e}")
        return {"valid": False, "error": str(e)}


@router.get("/api/admin/frequency-leads")
async def list_frequency_leads(
    status: Optional[str] = Query(None),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
):
    """
    List frequency leads.
    Admin only.
    """
    try:
        from ..core.database import get_supabase_admin

        supabase = get_supabase_admin()

        query = supabase.table('frequency_leads').select(
            'id, queue_number, email, name, phone, source, discount_code, '
            'benefits_status, converted_at, order_id, created_at',
            count='exact'
        )

        if status:
            query = query.eq('benefits_status', status)

        result = query.order('created_at', desc=True).range(
            offset, offset + limit - 1
        ).execute()

        return {
            "leads": result.data or [],
            "total": result.count or 0,
            "limit": limit,
            "offset": offset,
        }

    except Exception as e:
        logger.error(f"List frequency leads error: {e}")
        return {"leads": [], "total": 0}


async def notify_admins_frequency_lead(lead: dict):
    """
    Send push notification to all admins about new frequency lead.
    """
    try:
        import httpx

        from ..core.database import get_supabase_admin

        supabase = get_supabase_admin()

        # Get admin push tokens
        admins = supabase.table('profiles').select(
            'id, push_token'
        ).or_(
            'role.eq.admin,is_admin.eq.true'
        ).not_.is_('push_token', 'null').execute()

        if not admins.data:
            logger.info("No admin push tokens found")
            return

        push_tokens = [
            admin['push_token'] for admin in admins.data
            if admin.get('push_token')
        ]

        if not push_tokens:
            return

        # Prepare Expo push messages
        is_first_50 = lead['queue_number'] <= 50
        messages = [
            {
                "to": token,
                "sound": "default",
                "title": f"Lead Khóa 7 Ngày #{lead['queue_number']}",
                "body": f"Email: {lead['email']}" + (" | 50 SLOTS" if is_first_50 else ""),
                "data": {
                    "type": "frequency_lead_new",
                    "lead_id": lead['id'],
                    "queue_number": lead['queue_number'],
                }
            }
            for token in push_tokens
        ]

        # Send to Expo Push API
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://exp.host/--/api/v2/push/send",
                json=messages,
                headers={"Content-Type": "application/json"},
                timeout=10.0
            )
            logger.info(f"Sent {len(messages)} push notifications to admins")

    except Exception as e:
        logger.error(f"Failed to notify admins: {e}")
