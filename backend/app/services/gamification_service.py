"""
Gamification Service - Games, Rewards, Gems System
PHASE 5: NÂNG CAO
KPI: 40%+ engagement rate
"""

import logging
import random
from typing import Dict, Optional, List, Any
from datetime import datetime, date, timedelta
from dataclasses import dataclass

from ..core.database import get_supabase_admin

logger = logging.getLogger(__name__)


@dataclass
class GemBalance:
    """User gem balance data"""
    balance: int
    total_earned: int
    total_spent: int
    current_streak: int
    longest_streak: int


@dataclass
class GameResult:
    """Game play result"""
    success: bool
    segment: Optional[str]
    prize_type: Optional[str]
    prize_value: Optional[str]
    message: str
    gems_won: int = 0


@dataclass
class CheckinResult:
    """Daily check-in result"""
    success: bool
    streak_day: int
    gems_earned: int
    bonus: Optional[str]
    message: str


class GamificationService:
    """
    Gamification Service for engagement features.
    Includes Lucky Wheel, Daily Check-in, Gems system, and Achievements.
    """

    def __init__(self):
        # Daily check-in rewards by streak day
        self.daily_checkin_rewards = {
            1: {'gems': 10, 'bonus': None},
            2: {'gems': 15, 'bonus': None},
            3: {'gems': 20, 'bonus': None},
            4: {'gems': 25, 'bonus': None},
            5: {'gems': 30, 'bonus': None},
            6: {'gems': 40, 'bonus': None},
            7: {'gems': 100, 'bonus': 'mystery_box'},
        }

        # Win messages
        self.win_messages = {
            'none': [
                "Chúc bạn may mắn lần sau! 🍀",
                "Ôi tiếc quá! Thử lại mai nhé! 🎡",
                "Gần trúng rồi! Cố lên! 💪",
            ],
            'gems': "🎉 Chúc mừng! Bạn nhận được {value} Gems! 💎",
            'discount': "🎉 Chúc mừng! Bạn nhận được mã giảm {value}%! 🎫",
            'free_shipping': "🎉 Chúc mừng! Bạn nhận được Free Ship! 🚚",
            'product': "🎉 Chúc mừng! Bạn nhận được: {value}! 🎁",
        }

    # ========== LUCKY WHEEL ==========

    async def play_lucky_wheel(self, platform_user_id: str) -> GameResult:
        """
        Play the Lucky Wheel game.

        Args:
            platform_user_id: Platform user UUID

        Returns:
            GameResult with prize info
        """
        try:
            supabase = get_supabase_admin()

            # Get active lucky wheel game
            game = supabase.table('chatbot_games').select(
                '*'
            ).eq('game_type', 'lucky_wheel').eq('is_active', True).single().execute()

            if not game.data:
                return GameResult(
                    success=False,
                    segment=None,
                    prize_type=None,
                    prize_value=None,
                    message="Game không khả dụng lúc này.",
                )

            game_data = game.data

            # Check daily limit
            plays_today = supabase.rpc(
                'get_plays_today',
                {
                    'p_platform_user_id': platform_user_id,
                    'p_game_id': game_data['id'],
                }
            ).execute()

            plays_count = plays_today.data if plays_today.data else 0

            if plays_count >= game_data['plays_per_day']:
                return GameResult(
                    success=False,
                    segment=None,
                    prize_type=None,
                    prize_value=None,
                    message="Đã hết lượt quay hôm nay! Quay lại mai nhé 🎡",
                )

            # Check if gems required
            gems_required = game_data.get('requires_gems', 0)
            if gems_required > 0:
                balance = await self.get_balance(platform_user_id)
                if balance < gems_required:
                    return GameResult(
                        success=False,
                        segment=None,
                        prize_type=None,
                        prize_value=None,
                        message=f"Cần {gems_required} Gems để quay. Bạn có {balance} Gems.",
                    )
                # Spend gems
                await self.spend_gems(
                    platform_user_id,
                    gems_required,
                    'game_spend',
                    'Lucky Wheel spin',
                )

            # Spin the wheel
            config = game_data.get('config', {})
            segments = config.get('segments', [])

            if not segments:
                return GameResult(
                    success=False,
                    segment=None,
                    prize_type=None,
                    prize_value=None,
                    message="Game cấu hình không hợp lệ.",
                )

            result = self._weighted_random_choice(segments)

            # Save play record
            supabase.table('chatbot_game_plays').insert({
                'game_id': game_data['id'],
                'platform_user_id': platform_user_id,
                'result': result,
                'prize_type': result.get('prize_type'),
                'prize_value': result.get('prize_value'),
                'gems_spent': gems_required,
            }).execute()

            # Update game stats
            supabase.table('chatbot_games').update({
                'total_plays': game_data['total_plays'] + 1,
                'total_winners': game_data['total_winners'] + (1 if result.get('prize_type') != 'none' else 0),
            }).eq('id', game_data['id']).execute()

            # Award prize
            gems_won = 0
            if result.get('prize_type') == 'gems':
                gems_won = int(result.get('prize_value', 0))
                await self.add_gems(
                    platform_user_id,
                    gems_won,
                    'game_win',
                    f"Lucky Wheel: {result.get('label')}",
                )

            # Generate win message
            message = self._get_win_message(result)

            return GameResult(
                success=True,
                segment=result.get('label'),
                prize_type=result.get('prize_type'),
                prize_value=result.get('prize_value'),
                message=message,
                gems_won=gems_won,
            )

        except Exception as e:
            logger.error(f"Play lucky wheel error: {e}")
            return GameResult(
                success=False,
                segment=None,
                prize_type=None,
                prize_value=None,
                message="Có lỗi xảy ra. Vui lòng thử lại.",
            )

    def _weighted_random_choice(self, segments: List[Dict]) -> Dict:
        """Select random segment based on probability weights"""
        total = sum(s.get('probability', 0) for s in segments)
        if total == 0:
            return segments[0] if segments else {}

        r = random.uniform(0, total)
        cumulative = 0

        for segment in segments:
            cumulative += segment.get('probability', 0)
            if r <= cumulative:
                return segment

        return segments[-1]

    def _get_win_message(self, result: Dict) -> str:
        """Generate win message based on prize type"""
        prize_type = result.get('prize_type', 'none')

        if prize_type == 'none':
            messages = self.win_messages.get('none', [])
            return random.choice(messages) if messages else "Chúc may mắn lần sau!"

        template = self.win_messages.get(prize_type, "🎉 Chúc mừng! Bạn nhận được: {value}!")
        return template.format(value=result.get('prize_value', result.get('label', '')))

    # ========== DAILY CHECK-IN ==========

    async def daily_checkin(self, platform_user_id: str) -> CheckinResult:
        """
        Perform daily check-in.

        Args:
            platform_user_id: Platform user UUID

        Returns:
            CheckinResult with streak and rewards
        """
        try:
            supabase = get_supabase_admin()

            result = supabase.rpc(
                'daily_checkin',
                {'p_platform_user_id': platform_user_id}
            ).execute()

            if result.data and len(result.data) > 0:
                data = result.data[0]
                return CheckinResult(
                    success=data.get('success', False),
                    streak_day=data.get('streak_day', 0),
                    gems_earned=data.get('gems_earned', 0),
                    bonus=data.get('bonus_earned'),
                    message=data.get('message', ''),
                )

            return CheckinResult(
                success=False,
                streak_day=0,
                gems_earned=0,
                bonus=None,
                message="Có lỗi xảy ra khi điểm danh.",
            )

        except Exception as e:
            logger.error(f"Daily checkin error: {e}")
            return CheckinResult(
                success=False,
                streak_day=0,
                gems_earned=0,
                bonus=None,
                message="Có lỗi xảy ra. Vui lòng thử lại.",
            )

    async def get_checkin_status(self, platform_user_id: str) -> Dict:
        """
        Get check-in status for today.

        Args:
            platform_user_id: Platform user UUID

        Returns:
            Check-in status info
        """
        try:
            supabase = get_supabase_admin()

            today = date.today().isoformat()

            # Check today's check-in
            today_checkin = supabase.table('chatbot_daily_checkins').select(
                '*'
            ).eq('platform_user_id', platform_user_id).eq(
                'checkin_date', today
            ).single().execute()

            # Get current streak from gems table
            gems = supabase.table('chatbot_user_gems').select(
                'current_streak, longest_streak'
            ).eq('platform_user_id', platform_user_id).single().execute()

            checked_in_today = today_checkin.data is not None
            current_streak = gems.data.get('current_streak', 0) if gems.data else 0

            # Get next reward
            next_day = (current_streak % 7) + 1 if not checked_in_today else ((current_streak % 7) + 1) % 7 + 1
            next_reward = self.daily_checkin_rewards.get(next_day, {'gems': 10})

            return {
                'checked_in_today': checked_in_today,
                'current_streak': current_streak,
                'longest_streak': gems.data.get('longest_streak', 0) if gems.data else 0,
                'next_reward': next_reward,
                'streak_day_today': today_checkin.data.get('streak_day') if today_checkin.data else None,
            }

        except Exception as e:
            logger.error(f"Get checkin status error: {e}")
            return {
                'checked_in_today': False,
                'current_streak': 0,
                'error': str(e),
            }

    # ========== GEMS SYSTEM ==========

    async def get_balance(self, platform_user_id: str) -> int:
        """
        Get user's gem balance.

        Args:
            platform_user_id: Platform user UUID

        Returns:
            Gem balance
        """
        try:
            supabase = get_supabase_admin()

            result = supabase.table('chatbot_user_gems').select(
                'balance'
            ).eq('platform_user_id', platform_user_id).single().execute()

            return result.data.get('balance', 0) if result.data else 0

        except Exception as e:
            logger.debug(f"Get balance error (may be new user): {e}")
            return 0

    async def get_gem_info(self, platform_user_id: str) -> GemBalance:
        """
        Get full gem balance info.

        Args:
            platform_user_id: Platform user UUID

        Returns:
            GemBalance with all stats
        """
        try:
            supabase = get_supabase_admin()

            # Ensure balance exists
            supabase.rpc(
                'get_or_create_gem_balance',
                {'p_platform_user_id': platform_user_id}
            ).execute()

            result = supabase.table('chatbot_user_gems').select(
                '*'
            ).eq('platform_user_id', platform_user_id).single().execute()

            if result.data:
                return GemBalance(
                    balance=result.data.get('balance', 0),
                    total_earned=result.data.get('total_earned', 0),
                    total_spent=result.data.get('total_spent', 0),
                    current_streak=result.data.get('current_streak', 0),
                    longest_streak=result.data.get('longest_streak', 0),
                )

            return GemBalance(
                balance=0,
                total_earned=0,
                total_spent=0,
                current_streak=0,
                longest_streak=0,
            )

        except Exception as e:
            logger.error(f"Get gem info error: {e}")
            return GemBalance(0, 0, 0, 0, 0)

    async def add_gems(
        self,
        platform_user_id: str,
        amount: int,
        transaction_type: str,
        description: Optional[str] = None,
        reference_type: Optional[str] = None,
        reference_id: Optional[str] = None,
    ) -> int:
        """
        Add gems to user balance.

        Args:
            platform_user_id: Platform user UUID
            amount: Amount to add (positive)
            transaction_type: Type of transaction
            description: Transaction description
            reference_type: Reference type
            reference_id: Reference ID

        Returns:
            New balance
        """
        try:
            supabase = get_supabase_admin()

            result = supabase.rpc(
                'add_gems_chatbot',
                {
                    'p_platform_user_id': platform_user_id,
                    'p_amount': amount,
                    'p_transaction_type': transaction_type,
                    'p_description': description,
                    'p_reference_type': reference_type,
                    'p_reference_id': reference_id,
                }
            ).execute()

            new_balance = result.data if result.data else 0
            logger.info(f"Added {amount} gems to {platform_user_id}, new balance: {new_balance}")
            return new_balance

        except Exception as e:
            logger.error(f"Add gems error: {e}")
            return 0

    async def spend_gems(
        self,
        platform_user_id: str,
        amount: int,
        transaction_type: str,
        description: Optional[str] = None,
    ) -> Dict:
        """
        Spend gems from user balance.

        Args:
            platform_user_id: Platform user UUID
            amount: Amount to spend (positive)
            transaction_type: Type of transaction
            description: Transaction description

        Returns:
            Dict with balance or error
        """
        try:
            current = await self.get_balance(platform_user_id)

            if current < amount:
                return {
                    'error': f'Không đủ Gems! Bạn có {current} Gems, cần {amount} Gems.',
                    'balance': current,
                    'required': amount,
                }

            # Use add_gems with negative amount
            new_balance = await self.add_gems(
                platform_user_id,
                -amount,
                transaction_type,
                description,
            )

            return {
                'balance': new_balance,
                'spent': amount,
            }

        except Exception as e:
            logger.error(f"Spend gems error: {e}")
            return {'error': str(e)}

    async def get_transactions(
        self,
        platform_user_id: str,
        limit: int = 20,
        offset: int = 0,
        transaction_type: Optional[str] = None,
    ) -> List[Dict]:
        """
        Get gem transaction history.

        Args:
            platform_user_id: Platform user UUID
            limit: Maximum transactions
            offset: Pagination offset

        Returns:
            List of transactions
        """
        try:
            supabase = get_supabase_admin()

            query = supabase.table('chatbot_gem_transactions').select(
                '*'
            ).eq('platform_user_id', platform_user_id)

            if transaction_type:
                query = query.eq('transaction_type', transaction_type)

            result = query.order(
                'created_at', desc=True
            ).range(offset, offset + limit - 1).execute()

            return result.data or []

        except Exception as e:
            logger.error(f"Get transactions error: {e}")
            return []

    # ========== ACHIEVEMENTS ==========

    async def get_achievements(self, platform_user_id: str) -> List[Dict]:
        """
        Get user achievements with progress.

        Args:
            platform_user_id: Platform user UUID

        Returns:
            List of achievements with unlock status
        """
        try:
            supabase = get_supabase_admin()

            # Get all achievements
            achievements = supabase.table('chatbot_achievements').select(
                '*'
            ).eq('is_active', True).execute()

            # Get user's unlocked achievements
            user_achievements = supabase.table('chatbot_user_achievements').select(
                '*'
            ).eq('platform_user_id', platform_user_id).execute()

            user_map = {ua['achievement_id']: ua for ua in (user_achievements.data or [])}

            result = []
            for achievement in (achievements.data or []):
                user_data = user_map.get(achievement['id'])

                # Skip hidden achievements that aren't unlocked
                if achievement.get('is_hidden') and (not user_data or not user_data.get('completed')):
                    continue

                result.append({
                    **achievement,
                    'progress': user_data.get('progress', 0) if user_data else 0,
                    'completed': user_data.get('completed', False) if user_data else False,
                    'completed_at': user_data.get('completed_at') if user_data else None,
                    'reward_claimed': user_data.get('reward_claimed', False) if user_data else False,
                })

            return result

        except Exception as e:
            logger.error(f"Get achievements error: {e}")
            return []

    async def claim_achievement_reward(
        self,
        platform_user_id: str,
        achievement_id: str,
    ) -> Dict:
        """
        Claim reward for completed achievement.

        Args:
            platform_user_id: Platform user UUID
            achievement_id: Achievement ID

        Returns:
            Claim result
        """
        try:
            supabase = get_supabase_admin()

            # Get user achievement
            user_ach = supabase.table('chatbot_user_achievements').select(
                '*, chatbot_achievements(*)'
            ).eq('platform_user_id', platform_user_id).eq(
                'achievement_id', achievement_id
            ).single().execute()

            if not user_ach.data:
                return {'error': 'Achievement not found'}

            if not user_ach.data.get('completed'):
                return {'error': 'Achievement not completed'}

            if user_ach.data.get('reward_claimed'):
                return {'error': 'Reward already claimed'}

            achievement = user_ach.data.get('chatbot_achievements', {})
            gem_reward = achievement.get('gem_reward', 0)

            # Mark as claimed
            supabase.table('chatbot_user_achievements').update({
                'reward_claimed': True,
            }).eq('id', user_ach.data['id']).execute()

            # Add gems
            if gem_reward > 0:
                await self.add_gems(
                    platform_user_id,
                    gem_reward,
                    'bonus',
                    f"Achievement: {achievement.get('name')}",
                    'achievement',
                    achievement_id,
                )

            return {
                'success': True,
                'gems_earned': gem_reward,
                'message': f"Đã nhận {gem_reward} Gems từ thành tựu '{achievement.get('name')}'!",
            }

        except Exception as e:
            logger.error(f"Claim achievement error: {e}")
            return {'error': str(e)}

    # ========== GAMES ==========

    async def list_games(self, active_only: bool = True) -> List[Dict]:
        """
        List all games.

        Args:
            active_only: Only return active games

        Returns:
            List of games
        """
        try:
            supabase = get_supabase_admin()

            query = supabase.table('chatbot_games').select('*')
            if active_only:
                query = query.eq('is_active', True)

            result = query.execute()
            return result.data or []

        except Exception as e:
            logger.error(f"List games error: {e}")
            return []

    async def get_game(self, game_type: str) -> Optional[Dict]:
        """
        Get game by type.

        Args:
            game_type: Game type (e.g., 'lucky_wheel')

        Returns:
            Game data or None
        """
        try:
            supabase = get_supabase_admin()

            result = supabase.table('chatbot_games').select(
                '*'
            ).eq('game_type', game_type).single().execute()

            return result.data

        except Exception as e:
            logger.debug(f"Get game error: {e}")
            return None

    async def get_game_status(self, platform_user_id: str, game_type: str) -> Dict:
        """
        Get user's game status.

        Args:
            platform_user_id: Platform user UUID
            game_type: Game type

        Returns:
            Game status info
        """
        try:
            supabase = get_supabase_admin()

            # Get game
            game = supabase.table('chatbot_games').select(
                '*'
            ).eq('game_type', game_type).eq('is_active', True).single().execute()

            if not game.data:
                return {'error': 'Game not found'}

            game_data = game.data

            # Get today's plays
            plays_today = supabase.rpc(
                'get_plays_today',
                {
                    'p_platform_user_id': platform_user_id,
                    'p_game_id': game_data['id'],
                }
            ).execute()

            plays_count = plays_today.data if plays_today.data else 0

            return {
                'game_id': game_data['id'],
                'game_name': game_data['name'],
                'plays_today': plays_count,
                'plays_per_day': game_data['plays_per_day'],
                'plays_remaining': max(0, game_data['plays_per_day'] - plays_count),
                'can_play': plays_count < game_data['plays_per_day'],
                'requires_gems': game_data.get('requires_gems', 0),
            }

        except Exception as e:
            logger.error(f"Get game status error: {e}")
            return {'error': str(e)}

    async def get_checkin_history(
        self,
        platform_user_id: str,
        days: int = 30,
    ) -> List[Dict]:
        """
        Get check-in history.

        Args:
            platform_user_id: Platform user UUID
            days: Number of days to look back

        Returns:
            List of check-in records
        """
        try:
            supabase = get_supabase_admin()

            from_date = (date.today() - timedelta(days=days)).isoformat()

            result = supabase.table('chatbot_daily_checkins').select(
                '*'
            ).eq('platform_user_id', platform_user_id).gte(
                'checkin_date', from_date
            ).order('checkin_date', desc=True).execute()

            return result.data or []

        except Exception as e:
            logger.error(f"Get checkin history error: {e}")
            return []

    async def get_gems_summary(self, platform_user_id: str) -> Dict:
        """
        Get gems summary.

        Args:
            platform_user_id: Platform user UUID

        Returns:
            Gems summary
        """
        try:
            info = await self.get_gem_info(platform_user_id)
            return {
                'balance': info.balance,
                'total_earned': info.total_earned,
                'total_spent': info.total_spent,
                'current_streak': info.current_streak,
                'longest_streak': info.longest_streak,
            }

        except Exception as e:
            logger.error(f"Get gems summary error: {e}")
            return {'balance': 0, 'total_earned': 0, 'total_spent': 0}

    async def list_all_achievements(self) -> List[Dict]:
        """
        List all achievements.

        Returns:
            List of achievements
        """
        try:
            supabase = get_supabase_admin()

            result = supabase.table('chatbot_achievements').select(
                '*'
            ).eq('is_active', True).order('order_index').execute()

            # Filter out hidden achievements from public list
            achievements = [
                a for a in (result.data or [])
                if not a.get('is_hidden', False)
            ]

            return achievements

        except Exception as e:
            logger.error(f"List achievements error: {e}")
            return []

    async def get_leaderboard(
        self,
        metric: str = 'gems_total',
        limit: int = 10,
    ) -> List[Dict]:
        """
        Get leaderboard by metric.

        Args:
            metric: Ranking metric (gems_total, streak, games_played)
            limit: Max entries

        Returns:
            Leaderboard entries
        """
        try:
            supabase = get_supabase_admin()

            if metric == 'gems_total':
                result = supabase.table('chatbot_user_gems').select(
                    'platform_user_id, total_earned'
                ).order('total_earned', desc=True).limit(limit).execute()

                return [
                    {'rank': i + 1, 'user_id': r['platform_user_id'], 'value': r['total_earned']}
                    for i, r in enumerate(result.data or [])
                ]

            elif metric == 'streak':
                result = supabase.table('chatbot_user_gems').select(
                    'platform_user_id, longest_streak'
                ).order('longest_streak', desc=True).limit(limit).execute()

                return [
                    {'rank': i + 1, 'user_id': r['platform_user_id'], 'value': r['longest_streak']}
                    for i, r in enumerate(result.data or [])
                ]

            elif metric == 'games_played':
                # Count games played per user
                result = supabase.table('chatbot_game_plays').select(
                    'platform_user_id'
                ).execute()

                # Count plays per user
                counts = {}
                for play in (result.data or []):
                    uid = play['platform_user_id']
                    counts[uid] = counts.get(uid, 0) + 1

                # Sort and return top N
                sorted_users = sorted(counts.items(), key=lambda x: x[1], reverse=True)[:limit]
                return [
                    {'rank': i + 1, 'user_id': uid, 'value': count}
                    for i, (uid, count) in enumerate(sorted_users)
                ]

            elif metric == 'achievements':
                # Count completed achievements per user
                result = supabase.table('chatbot_user_achievements').select(
                    'platform_user_id'
                ).eq('completed', True).execute()

                counts = {}
                for ach in (result.data or []):
                    uid = ach['platform_user_id']
                    counts[uid] = counts.get(uid, 0) + 1

                sorted_users = sorted(counts.items(), key=lambda x: x[1], reverse=True)[:limit]
                return [
                    {'rank': i + 1, 'user_id': uid, 'value': count}
                    for i, (uid, count) in enumerate(sorted_users)
                ]

            return []

        except Exception as e:
            logger.error(f"Get leaderboard error: {e}")
            return []

    async def get_admin_stats(self, days: int = 30) -> Dict:
        """
        Get admin stats for gamification system.

        Args:
            days: Number of days to analyze

        Returns:
            Admin stats
        """
        try:
            supabase = get_supabase_admin()
            from_date = (datetime.utcnow() - timedelta(days=days)).isoformat()

            # Total users with gems
            users = supabase.table('chatbot_user_gems').select(
                'id', count='exact'
            ).execute()

            # Total games played
            games = supabase.table('chatbot_game_plays').select(
                'id', count='exact'
            ).gte('played_at', from_date).execute()

            # Total check-ins
            checkins = supabase.table('chatbot_daily_checkins').select(
                'id', count='exact'
            ).gte('created_at', from_date).execute()

            # Total gems earned
            transactions = supabase.table('chatbot_gem_transactions').select(
                'amount'
            ).gte('created_at', from_date).gt('amount', 0).execute()

            total_earned = sum(t['amount'] for t in (transactions.data or []))

            # Active users (users with activity in period)
            active_gems = supabase.table('chatbot_user_gems').select(
                'id', count='exact'
            ).gte('updated_at', from_date).execute()

            return {
                'period_days': days,
                'total_users': users.count or 0,
                'active_users': active_gems.count or 0,
                'total_games_played': games.count or 0,
                'total_checkins': checkins.count or 0,
                'total_gems_earned': total_earned,
                'engagement_rate': round(
                    ((active_gems.count or 0) / max(users.count or 1, 1)) * 100, 2
                ),
            }

        except Exception as e:
            logger.error(f"Get admin stats error: {e}")
            return {'error': str(e)}

    # ========== STATS ==========

    async def get_stats(self, platform_user_id: str) -> Dict:
        """
        Get full gamification stats for user.

        Args:
            platform_user_id: Platform user UUID

        Returns:
            Complete stats
        """
        try:
            supabase = get_supabase_admin()

            result = supabase.rpc(
                'get_gamification_stats',
                {'p_platform_user_id': platform_user_id}
            ).execute()

            if result.data and len(result.data) > 0:
                return result.data[0]

            return {
                'gem_balance': 0,
                'total_earned': 0,
                'total_spent': 0,
                'current_streak': 0,
                'longest_streak': 0,
                'games_played': 0,
                'games_won': 0,
                'total_checkins': 0,
            }

        except Exception as e:
            logger.error(f"Get stats error: {e}")
            return {'error': str(e)}


# Global instance
gamification_service = GamificationService()
