"""
Segment Service - User Segmentation for Marketing
PHASE 4: TỐI ƯU
"""

import logging
from typing import Dict, List, Optional, Any
from dataclasses import dataclass
from datetime import datetime, timedelta

from ..core.database import get_supabase_admin

logger = logging.getLogger(__name__)


@dataclass
class SegmentRule:
    """Segment rule definition"""
    field: str
    operator: str  # eq, neq, in, nin, gt, gte, lt, lte, contains
    value: Any


@dataclass
class Segment:
    """Segment data"""
    id: str
    name: str
    description: Optional[str]
    rules: Dict
    user_count: int
    is_active: bool
    is_system: bool


class SegmentService:
    """
    User Segmentation Service.
    Allows creating segments based on user attributes for targeted marketing.
    """

    def __init__(self):
        # Supported segment fields
        self.supported_fields = {
            'platform': 'string',
            'tier': 'string',
            'last_active_days': 'number',
            'purchase_count': 'number',
            'zodiac_sign': 'string',
            'element': 'string',
            'emotion_dominant': 'string',
            'has_abandoned_cart': 'boolean',
            'engagement_score': 'number',
            'created_days_ago': 'number',
        }

    async def create_segment(
        self,
        name: str,
        rules: Dict,
        description: Optional[str] = None,
        created_by: Optional[str] = None,
    ) -> Optional[str]:
        """
        Create a new user segment.

        Args:
            name: Segment name
            rules: Segment rules as JSON
            description: Optional description
            created_by: User ID who created

        Returns:
            Segment ID or None on error
        """
        try:
            supabase = get_supabase_admin()

            result = supabase.table('chatbot_segments').insert({
                'name': name,
                'description': description,
                'rules': rules,
                'created_by': created_by,
                'is_system': False,
            }).execute()

            segment_id = result.data[0]['id']

            # Calculate initial user count
            await self.calculate_segment_size(segment_id)

            logger.info(f"Created segment: {name} ({segment_id})")
            return segment_id

        except Exception as e:
            logger.error(f"Create segment error: {e}")
            return None

    async def update_segment(
        self,
        segment_id: str,
        name: Optional[str] = None,
        rules: Optional[Dict] = None,
        description: Optional[str] = None,
        is_active: Optional[bool] = None,
    ) -> bool:
        """
        Update an existing segment.

        Args:
            segment_id: Segment ID
            name: New name
            rules: New rules
            description: New description
            is_active: Active status

        Returns:
            Success status
        """
        try:
            supabase = get_supabase_admin()

            # Check if system segment
            segment = supabase.table('chatbot_segments').select(
                'is_system'
            ).eq('id', segment_id).single().execute()

            if segment.data and segment.data.get('is_system'):
                logger.warning("Cannot modify system segment")
                return False

            update_data = {'updated_at': datetime.utcnow().isoformat()}
            if name is not None:
                update_data['name'] = name
            if rules is not None:
                update_data['rules'] = rules
            if description is not None:
                update_data['description'] = description
            if is_active is not None:
                update_data['is_active'] = is_active

            supabase.table('chatbot_segments').update(
                update_data
            ).eq('id', segment_id).execute()

            # Recalculate if rules changed
            if rules is not None:
                await self.calculate_segment_size(segment_id)

            return True

        except Exception as e:
            logger.error(f"Update segment error: {e}")
            return False

    async def delete_segment(self, segment_id: str) -> bool:
        """
        Delete a segment (soft delete by setting inactive).

        Args:
            segment_id: Segment ID

        Returns:
            Success status
        """
        try:
            supabase = get_supabase_admin()

            # Check if system segment
            segment = supabase.table('chatbot_segments').select(
                'is_system'
            ).eq('id', segment_id).single().execute()

            if segment.data and segment.data.get('is_system'):
                logger.warning("Cannot delete system segment")
                return False

            supabase.table('chatbot_segments').update({
                'is_active': False
            }).eq('id', segment_id).execute()

            return True

        except Exception as e:
            logger.error(f"Delete segment error: {e}")
            return False

    async def get_segment(self, segment_id: str) -> Optional[Segment]:
        """
        Get segment by ID.

        Args:
            segment_id: Segment ID

        Returns:
            Segment object or None
        """
        try:
            supabase = get_supabase_admin()

            result = supabase.table('chatbot_segments').select(
                '*'
            ).eq('id', segment_id).single().execute()

            if not result.data:
                return None

            return Segment(
                id=result.data['id'],
                name=result.data['name'],
                description=result.data.get('description'),
                rules=result.data.get('rules', {}),
                user_count=result.data.get('user_count', 0),
                is_active=result.data.get('is_active', True),
                is_system=result.data.get('is_system', False),
            )

        except Exception as e:
            logger.error(f"Get segment error: {e}")
            return None

    async def list_segments(
        self,
        active_only: bool = True,
        include_system: bool = True,
    ) -> List[Segment]:
        """
        List all segments.

        Args:
            active_only: Only return active segments
            include_system: Include system segments

        Returns:
            List of segments
        """
        try:
            supabase = get_supabase_admin()

            query = supabase.table('chatbot_segments').select('*')

            if active_only:
                query = query.eq('is_active', True)
            if not include_system:
                query = query.eq('is_system', False)

            result = query.order('name').execute()

            return [
                Segment(
                    id=s['id'],
                    name=s['name'],
                    description=s.get('description'),
                    rules=s.get('rules', {}),
                    user_count=s.get('user_count', 0),
                    is_active=s.get('is_active', True),
                    is_system=s.get('is_system', False),
                )
                for s in result.data or []
            ]

        except Exception as e:
            logger.error(f"List segments error: {e}")
            return []

    async def calculate_segment_size(self, segment_id: str) -> int:
        """
        Calculate and update user count for a segment.

        Args:
            segment_id: Segment ID

        Returns:
            User count
        """
        try:
            supabase = get_supabase_admin()

            result = supabase.rpc(
                'calculate_segment_users',
                {'p_segment_id': segment_id}
            ).execute()

            return result.data if result.data else 0

        except Exception as e:
            logger.error(f"Calculate segment size error: {e}")
            return 0

    async def get_segment_users(
        self,
        segment_id: str,
        platforms: Optional[List[str]] = None,
        limit: int = 1000,
        offset: int = 0,
    ) -> List[Dict]:
        """
        Get users matching a segment.

        Args:
            segment_id: Segment ID
            platforms: Filter by platforms
            limit: Maximum users to return
            offset: Pagination offset

        Returns:
            List of user records
        """
        try:
            supabase = get_supabase_admin()

            # Get segment rules
            segment = await self.get_segment(segment_id)
            if not segment:
                return []

            # Build query
            query = supabase.table('chatbot_platform_users').select(
                'id, platform, platform_user_id, display_name, avatar_url'
            ).eq('is_blocked', False)

            # Apply platform filter
            if platforms:
                query = query.in_('platform', platforms)

            # Apply segment rules
            rules = segment.rules
            if rules:
                if 'platform' in rules:
                    query = query.in_('platform', rules['platform'])

            result = query.range(offset, offset + limit - 1).execute()
            return result.data or []

        except Exception as e:
            logger.error(f"Get segment users error: {e}")
            return []

    async def get_user_segments(self, platform_user_id: str) -> List[str]:
        """
        Get segments a user belongs to.

        Args:
            platform_user_id: Platform user ID

        Returns:
            List of segment IDs
        """
        try:
            supabase = get_supabase_admin()

            # Get user data
            user = supabase.table('chatbot_platform_users').select(
                'platform, tier'
            ).eq('id', platform_user_id).single().execute()

            if not user.data:
                return []

            # Get all active segments
            segments = await self.list_segments(active_only=True)

            matching = []
            for segment in segments:
                if self._user_matches_segment(user.data, segment.rules):
                    matching.append(segment.id)

            return matching

        except Exception as e:
            logger.error(f"Get user segments error: {e}")
            return []

    def _user_matches_segment(self, user: Dict, rules: Dict) -> bool:
        """Check if user matches segment rules"""
        if not rules:
            return True

        for field, condition in rules.items():
            user_value = user.get(field)

            if isinstance(condition, list):
                # IN operator
                if user_value not in condition:
                    return False
            elif isinstance(condition, dict):
                # Comparison operators
                if 'eq' in condition and user_value != condition['eq']:
                    return False
                if 'neq' in condition and user_value == condition['neq']:
                    return False
                if 'gte' in condition and (user_value is None or user_value < condition['gte']):
                    return False
                if 'lte' in condition and (user_value is None or user_value > condition['lte']):
                    return False
                if 'gt' in condition and (user_value is None or user_value <= condition['gt']):
                    return False
                if 'lt' in condition and (user_value is None or user_value >= condition['lt']):
                    return False
            else:
                # Direct equality
                if user_value != condition:
                    return False

        return True

    async def recalculate_all_segments(self) -> Dict[str, int]:
        """
        Recalculate user counts for all active segments.

        Returns:
            Dict of segment_id -> user_count
        """
        segments = await self.list_segments(active_only=True)
        results = {}

        for segment in segments:
            count = await self.calculate_segment_size(segment.id)
            results[segment.id] = count

        return results


# Global instance
segment_service = SegmentService()
