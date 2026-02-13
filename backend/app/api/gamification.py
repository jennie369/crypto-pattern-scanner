"""
Gamification API Endpoints - Games, Gems, Achievements
PHASE 5: NANG CAO
"""

from fastapi import APIRouter, HTTPException, Depends, Query
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/gamification", tags=["Gamification"])


# ============================================================
# REQUEST/RESPONSE MODELS
# ============================================================

class PlayGameRequest(BaseModel):
    """Request to play a game"""
    platform_user_id: str


class DailyCheckinRequest(BaseModel):
    """Request for daily check-in"""
    platform_user_id: str


class SpendGemsRequest(BaseModel):
    """Request to spend gems"""
    platform_user_id: str
    amount: int = Field(gt=0)
    transaction_type: str
    description: Optional[str] = None


class ClaimAchievementRequest(BaseModel):
    """Request to claim achievement reward"""
    platform_user_id: str
    achievement_id: str


class AddGemsRequest(BaseModel):
    """Request to add gems (admin only)"""
    platform_user_id: str
    amount: int = Field(gt=0)
    transaction_type: str = "admin_grant"
    description: Optional[str] = None


# ============================================================
# LUCKY WHEEL ENDPOINTS
# ============================================================

@router.get("/games")
async def list_games(active_only: bool = Query(True)):
    """
    List all available games.
    """
    from ..services.gamification_service import gamification_service

    try:
        games = await gamification_service.list_games(active_only=active_only)
        return {"games": games}
    except Exception as e:
        logger.error(f"Error listing games: {e}")
        raise HTTPException(status_code=500, detail="Failed to list games")


@router.get("/games/{game_type}")
async def get_game(game_type: str):
    """
    Get game details by type.
    """
    from ..services.gamification_service import gamification_service

    try:
        game = await gamification_service.get_game(game_type)
        if not game:
            raise HTTPException(status_code=404, detail="Game not found")
        return game
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting game: {e}")
        raise HTTPException(status_code=500, detail="Failed to get game")


@router.post("/games/lucky-wheel/play")
async def play_lucky_wheel(request: PlayGameRequest):
    """
    Play the Lucky Wheel game.
    Returns the result including any prizes won.
    """
    from ..services.gamification_service import gamification_service

    try:
        result = await gamification_service.play_lucky_wheel(request.platform_user_id)

        if "error" in result:
            raise HTTPException(status_code=400, detail=result["error"])

        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error playing lucky wheel: {e}")
        raise HTTPException(status_code=500, detail="Failed to play game")


@router.get("/games/lucky-wheel/status/{platform_user_id}")
async def get_lucky_wheel_status(platform_user_id: str):
    """
    Get user's Lucky Wheel status (plays remaining today, etc.)
    """
    from ..services.gamification_service import gamification_service

    try:
        status = await gamification_service.get_game_status(
            platform_user_id,
            "lucky_wheel"
        )
        return status
    except Exception as e:
        logger.error(f"Error getting game status: {e}")
        raise HTTPException(status_code=500, detail="Failed to get status")


# ============================================================
# DAILY CHECK-IN ENDPOINTS
# ============================================================

@router.post("/checkin")
async def daily_checkin(request: DailyCheckinRequest):
    """
    Perform daily check-in.
    Returns streak info and rewards earned.
    """
    from ..services.gamification_service import gamification_service

    try:
        result = await gamification_service.daily_checkin(request.platform_user_id)

        if "error" in result:
            raise HTTPException(status_code=400, detail=result["error"])

        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error performing checkin: {e}")
        raise HTTPException(status_code=500, detail="Failed to check in")


@router.get("/checkin/status/{platform_user_id}")
async def get_checkin_status(platform_user_id: str):
    """
    Get user's check-in status (current streak, last check-in, etc.)
    """
    from ..services.gamification_service import gamification_service

    try:
        status = await gamification_service.get_checkin_status(platform_user_id)
        return status
    except Exception as e:
        logger.error(f"Error getting checkin status: {e}")
        raise HTTPException(status_code=500, detail="Failed to get status")


@router.get("/checkin/history/{platform_user_id}")
async def get_checkin_history(
    platform_user_id: str,
    days: int = Query(30, ge=1, le=365)
):
    """
    Get user's check-in history.
    """
    from ..services.gamification_service import gamification_service

    try:
        history = await gamification_service.get_checkin_history(
            platform_user_id,
            days=days
        )
        return {"history": history}
    except Exception as e:
        logger.error(f"Error getting checkin history: {e}")
        raise HTTPException(status_code=500, detail="Failed to get history")


# ============================================================
# GEMS ENDPOINTS
# ============================================================

@router.get("/gems/balance/{platform_user_id}")
async def get_gems_balance(platform_user_id: str):
    """
    Get user's current Gems balance.
    """
    from ..services.gamification_service import gamification_service

    try:
        balance = await gamification_service.get_balance(platform_user_id)
        return {"balance": balance}
    except Exception as e:
        logger.error(f"Error getting balance: {e}")
        raise HTTPException(status_code=500, detail="Failed to get balance")


@router.get("/gems/summary/{platform_user_id}")
async def get_gems_summary(platform_user_id: str):
    """
    Get user's Gems summary (balance, total earned, total spent).
    """
    from ..services.gamification_service import gamification_service

    try:
        summary = await gamification_service.get_gems_summary(platform_user_id)
        return summary
    except Exception as e:
        logger.error(f"Error getting summary: {e}")
        raise HTTPException(status_code=500, detail="Failed to get summary")


@router.post("/gems/spend")
async def spend_gems(request: SpendGemsRequest):
    """
    Spend Gems for a purchase or action.
    """
    from ..services.gamification_service import gamification_service

    try:
        result = await gamification_service.spend_gems(
            platform_user_id=request.platform_user_id,
            amount=request.amount,
            transaction_type=request.transaction_type,
            description=request.description
        )

        if "error" in result:
            raise HTTPException(status_code=400, detail=result["error"])

        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error spending gems: {e}")
        raise HTTPException(status_code=500, detail="Failed to spend gems")


@router.get("/gems/transactions/{platform_user_id}")
async def get_gem_transactions(
    platform_user_id: str,
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    transaction_type: Optional[str] = None
):
    """
    Get user's Gem transaction history.
    """
    from ..services.gamification_service import gamification_service

    try:
        transactions = await gamification_service.get_transactions(
            platform_user_id=platform_user_id,
            limit=limit,
            offset=offset,
            transaction_type=transaction_type
        )
        return {"transactions": transactions}
    except Exception as e:
        logger.error(f"Error getting transactions: {e}")
        raise HTTPException(status_code=500, detail="Failed to get transactions")


# ============================================================
# ACHIEVEMENTS ENDPOINTS
# ============================================================

@router.get("/achievements")
async def list_achievements():
    """
    List all available achievements.
    """
    from ..services.gamification_service import gamification_service

    try:
        achievements = await gamification_service.list_all_achievements()
        return {"achievements": achievements}
    except Exception as e:
        logger.error(f"Error listing achievements: {e}")
        raise HTTPException(status_code=500, detail="Failed to list achievements")


@router.get("/achievements/{platform_user_id}")
async def get_user_achievements(platform_user_id: str):
    """
    Get user's achievement progress.
    """
    from ..services.gamification_service import gamification_service

    try:
        achievements = await gamification_service.get_achievements(platform_user_id)
        return {"achievements": achievements}
    except Exception as e:
        logger.error(f"Error getting achievements: {e}")
        raise HTTPException(status_code=500, detail="Failed to get achievements")


@router.post("/achievements/claim")
async def claim_achievement(request: ClaimAchievementRequest):
    """
    Claim reward for a completed achievement.
    """
    from ..services.gamification_service import gamification_service

    try:
        result = await gamification_service.claim_achievement_reward(
            platform_user_id=request.platform_user_id,
            achievement_id=request.achievement_id
        )

        if "error" in result:
            raise HTTPException(status_code=400, detail=result["error"])

        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error claiming achievement: {e}")
        raise HTTPException(status_code=500, detail="Failed to claim achievement")


# ============================================================
# USER STATS ENDPOINTS
# ============================================================

@router.get("/stats/{platform_user_id}")
async def get_user_stats(platform_user_id: str):
    """
    Get comprehensive gamification stats for a user.
    """
    from ..services.gamification_service import gamification_service

    try:
        stats = await gamification_service.get_stats(platform_user_id)
        return stats
    except Exception as e:
        logger.error(f"Error getting stats: {e}")
        raise HTTPException(status_code=500, detail="Failed to get stats")


@router.get("/leaderboard")
async def get_leaderboard(
    metric: str = Query("gems_total", regex="^(gems_total|streak|games_played|achievements)$"),
    limit: int = Query(10, ge=1, le=100)
):
    """
    Get gamification leaderboard.
    """
    from ..services.gamification_service import gamification_service

    try:
        leaderboard = await gamification_service.get_leaderboard(
            metric=metric,
            limit=limit
        )
        return {"leaderboard": leaderboard}
    except Exception as e:
        logger.error(f"Error getting leaderboard: {e}")
        raise HTTPException(status_code=500, detail="Failed to get leaderboard")


# ============================================================
# ADMIN ENDPOINTS
# ============================================================

@router.post("/admin/gems/add")
async def admin_add_gems(request: AddGemsRequest):
    """
    Admin endpoint to add Gems to a user.
    """
    from ..services.gamification_service import gamification_service

    try:
        new_balance = await gamification_service.add_gems(
            platform_user_id=request.platform_user_id,
            amount=request.amount,
            transaction_type=request.transaction_type,
            description=request.description or "Admin grant"
        )
        return {"balance": new_balance, "added": request.amount}
    except Exception as e:
        logger.error(f"Error adding gems: {e}")
        raise HTTPException(status_code=500, detail="Failed to add gems")


@router.get("/admin/stats")
async def get_admin_stats(days: int = Query(30, ge=1, le=365)):
    """
    Get overall gamification statistics for admin.
    """
    from ..services.gamification_service import gamification_service

    try:
        stats = await gamification_service.get_admin_stats(days=days)
        return stats
    except Exception as e:
        logger.error(f"Error getting admin stats: {e}")
        raise HTTPException(status_code=500, detail="Failed to get stats")
