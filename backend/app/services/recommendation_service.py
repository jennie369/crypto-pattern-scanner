"""
Smart Recommendation Service - Gợi ý thông minh
PHASE 3: TRÍ TUỆ
"""

import logging
from typing import Dict, List, Optional, Any
from dataclasses import dataclass

from ..core.database import get_supabase_admin

logger = logging.getLogger(__name__)


@dataclass
class RecommendationResult:
    """Result of recommendation query"""
    products: List[Dict]
    reason: str
    confidence: float
    strategy: str


class RecommendationService:
    """
    Smart Product Recommendation Service.
    Recommends products based on zodiac, emotion, purpose, and user preferences.
    """

    def __init__(self):
        # Crystal recommendations by zodiac sign
        self.zodiac_crystals = {
            'aries': ['carnelian', 'red jasper', 'citrine', 'hematite'],
            'taurus': ['rose quartz', 'emerald', 'jade', 'malachite'],
            'gemini': ['tiger eye', 'agate', 'citrine', 'aquamarine'],
            'cancer': ['moonstone', 'pearl', 'selenite', 'opal'],
            'leo': ['sunstone', 'amber', 'citrine', 'pyrite'],
            'virgo': ['amazonite', 'moss agate', 'sapphire', 'peridot'],
            'libra': ['rose quartz', 'lapis lazuli', 'opal', 'lepidolite'],
            'scorpio': ['obsidian', 'malachite', 'labradorite', 'garnet'],
            'sagittarius': ['turquoise', 'sodalite', 'lapis lazuli', 'amethyst'],
            'capricorn': ['garnet', 'onyx', 'jet', 'smoky quartz'],
            'aquarius': ['amethyst', 'aquamarine', 'labradorite', 'fluorite'],
            'pisces': ['amethyst', 'aquamarine', 'moonstone', 'turquoise'],
        }

        # Crystal recommendations by element (Ngũ Hành)
        self.element_crystals = {
            'metal': ['pyrite', 'hematite', 'tiger eye', 'citrine'],
            'water': ['aquamarine', 'moonstone', 'black tourmaline', 'obsidian'],
            'wood': ['jade', 'malachite', 'green aventurine', 'moss agate'],
            'fire': ['carnelian', 'sunstone', 'amber', 'ruby'],
            'earth': ['tiger eye', 'smoky quartz', 'jasper', 'agate'],
        }

        # Crystal recommendations by emotion
        self.emotion_crystals = {
            'happy': ['citrine', 'sunstone', 'amber'],
            'excited': ['carnelian', 'tiger eye', 'pyrite'],
            'satisfied': ['jade', 'rose quartz', 'green aventurine'],
            'neutral': ['clear quartz', 'amethyst', 'fluorite'],
            'confused': ['lapis lazuli', 'sodalite', 'fluorite'],
            'curious': ['labradorite', 'moonstone', 'amethyst'],
            'sad': ['rose quartz', 'lepidolite', 'smoky quartz'],
            'disappointed': ['black tourmaline', 'smoky quartz', 'obsidian'],
            'frustrated': ['amethyst', 'lepidolite', 'howlite'],
            'angry': ['black tourmaline', 'hematite', 'smoky quartz'],
            'anxious': ['amethyst', 'lepidolite', 'blue lace agate'],
        }

        # Crystal recommendations by purpose
        self.purpose_crystals = {
            'love': ['rose quartz', 'rhodonite', 'garnet', 'moonstone'],
            'wealth': ['citrine', 'pyrite', 'jade', 'green aventurine'],
            'health': ['clear quartz', 'amethyst', 'bloodstone', 'turquoise'],
            'protection': ['black tourmaline', 'obsidian', 'hematite', 'smoky quartz'],
            'career': ['tiger eye', 'citrine', 'pyrite', 'lapis lazuli'],
            'creativity': ['carnelian', 'orange calcite', 'sunstone', 'citrine'],
            'intuition': ['amethyst', 'labradorite', 'moonstone', 'lapis lazuli'],
            'grounding': ['hematite', 'black tourmaline', 'smoky quartz', 'obsidian'],
            'communication': ['blue lace agate', 'sodalite', 'aquamarine', 'turquoise'],
            'meditation': ['amethyst', 'selenite', 'clear quartz', 'lepidolite'],
            'sleep': ['amethyst', 'lepidolite', 'howlite', 'moonstone'],
            'energy': ['carnelian', 'citrine', 'clear quartz', 'red jasper'],
            'trading': ['tiger eye', 'citrine', 'pyrite', 'hematite'],
        }

        # Vietnamese purpose mappings
        self.purpose_keywords = {
            'tình yêu': 'love', 'yêu': 'love', 'hôn nhân': 'love',
            'tiền': 'wealth', 'tài lộc': 'wealth', 'giàu': 'wealth', 'làm ăn': 'wealth',
            'sức khỏe': 'health', 'khỏe': 'health', 'bệnh': 'health',
            'bảo vệ': 'protection', 'xui': 'protection', 'phong thủy': 'protection',
            'công việc': 'career', 'thăng tiến': 'career', 'sự nghiệp': 'career',
            'sáng tạo': 'creativity', 'nghệ thuật': 'creativity',
            'trực giác': 'intuition', 'linh cảm': 'intuition',
            'cân bằng': 'grounding', 'ổn định': 'grounding',
            'giao tiếp': 'communication', 'thuyết trình': 'communication',
            'thiền': 'meditation', 'tĩnh tâm': 'meditation', 'yoga': 'meditation',
            'ngủ': 'sleep', 'giấc ngủ': 'sleep', 'mất ngủ': 'sleep',
            'năng lượng': 'energy', 'mệt mỏi': 'energy', 'sức sống': 'energy',
            'trading': 'trading', 'giao dịch': 'trading', 'crypto': 'trading',
        }

    async def get_recommendations(
        self,
        platform_user_id: Optional[str] = None,
        zodiac: Optional[str] = None,
        element: Optional[str] = None,
        emotion: Optional[str] = None,
        purpose: Optional[str] = None,
        price_min: Optional[float] = None,
        price_max: Optional[float] = None,
        limit: int = 5,
    ) -> RecommendationResult:
        """
        Get smart product recommendations.

        Args:
            platform_user_id: User ID for personalized recommendations
            zodiac: Zodiac sign for crystal matching
            element: Element (Ngũ Hành) for crystal matching
            emotion: Current emotion for mood-based recommendations
            purpose: Purpose/goal for targeted recommendations
            price_min: Minimum price filter
            price_max: Maximum price filter
            limit: Maximum number of recommendations

        Returns:
            RecommendationResult with products and metadata
        """
        try:
            # Collect crystal keywords based on inputs
            crystal_keywords = set()
            strategies = []

            if zodiac and zodiac.lower() in self.zodiac_crystals:
                crystal_keywords.update(self.zodiac_crystals[zodiac.lower()])
                strategies.append(f"zodiac:{zodiac}")

            if element and element.lower() in self.element_crystals:
                crystal_keywords.update(self.element_crystals[element.lower()])
                strategies.append(f"element:{element}")

            if emotion and emotion.lower() in self.emotion_crystals:
                crystal_keywords.update(self.emotion_crystals[emotion.lower()])
                strategies.append(f"emotion:{emotion}")

            if purpose:
                purpose_key = self._map_purpose(purpose)
                if purpose_key and purpose_key in self.purpose_crystals:
                    crystal_keywords.update(self.purpose_crystals[purpose_key])
                    strategies.append(f"purpose:{purpose_key}")

            # Fetch user preferences if available
            if platform_user_id:
                prefs = await self._get_user_preferences(platform_user_id)
                if prefs:
                    if prefs.get('favorite_crystals'):
                        crystal_keywords.update(prefs['favorite_crystals'])
                        strategies.append("user_favorites")
                    if prefs.get('zodiac_sign') and not zodiac:
                        zodiac = prefs['zodiac_sign']
                        crystal_keywords.update(self.zodiac_crystals.get(zodiac.lower(), []))
                        strategies.append(f"user_zodiac:{zodiac}")
                    if prefs.get('element') and not element:
                        element = prefs['element']
                        crystal_keywords.update(self.element_crystals.get(element.lower(), []))
                        strategies.append(f"user_element:{element}")

            # Search products
            products = await self._search_products(
                keywords=list(crystal_keywords),
                price_min=price_min,
                price_max=price_max,
                limit=limit,
            )

            # Build recommendation reason
            reason = self._build_reason(zodiac, element, emotion, purpose)

            return RecommendationResult(
                products=products,
                reason=reason,
                confidence=min(len(strategies) * 0.25, 1.0),
                strategy="+".join(strategies) if strategies else "general",
            )

        except Exception as e:
            logger.error(f"Recommendation error: {e}")
            return RecommendationResult(
                products=[],
                reason="Không thể lấy gợi ý lúc này.",
                confidence=0.0,
                strategy="error",
            )

    async def get_recommendations_for_query(
        self,
        query: str,
        platform_user_id: Optional[str] = None,
        limit: int = 5,
    ) -> RecommendationResult:
        """
        Get recommendations based on natural language query.

        Args:
            query: User's natural language query
            platform_user_id: User ID for personalization
            limit: Maximum results

        Returns:
            RecommendationResult
        """
        # Extract purpose from query
        purpose = None
        for keyword, purpose_key in self.purpose_keywords.items():
            if keyword in query.lower():
                purpose = purpose_key
                break

        return await self.get_recommendations(
            platform_user_id=platform_user_id,
            purpose=purpose,
            limit=limit,
        )

    async def get_emotion_based_recommendations(
        self,
        emotion: str,
        urgency: str,
        platform_user_id: Optional[str] = None,
        limit: int = 3,
    ) -> RecommendationResult:
        """
        Get recommendations specifically based on emotional state.

        Args:
            emotion: Detected emotion
            urgency: Urgency level
            platform_user_id: User ID for personalization
            limit: Maximum results

        Returns:
            RecommendationResult with emotion-appropriate products
        """
        # For high urgency negative emotions, recommend calming crystals
        if urgency in ('critical', 'high') and emotion in ('angry', 'anxious', 'frustrated'):
            crystals = ['amethyst', 'lepidolite', 'black tourmaline', 'blue lace agate']
        else:
            crystals = self.emotion_crystals.get(emotion, ['amethyst', 'clear quartz'])

        products = await self._search_products(
            keywords=crystals,
            limit=limit,
        )

        reason = self._get_emotion_reason(emotion)

        return RecommendationResult(
            products=products,
            reason=reason,
            confidence=0.75,
            strategy=f"emotion:{emotion}",
        )

    async def get_similar_products(
        self,
        product_id: str,
        limit: int = 4,
    ) -> List[Dict]:
        """
        Get products similar to a given product.

        Args:
            product_id: Product ID to find similar items
            limit: Maximum results

        Returns:
            List of similar products
        """
        try:
            supabase = get_supabase_admin()

            # Get original product
            result = supabase.table('shopify_products').select(
                'tags, product_type, price'
            ).eq('id', product_id).single().execute()

            if not result.data:
                return []

            original = result.data

            # Find similar by tags and type
            query = supabase.table('shopify_products').select(
                'id, title, price, image_url, handle, tags'
            ).eq('status', 'active').neq('id', product_id)

            if original.get('product_type'):
                query = query.eq('product_type', original['product_type'])

            # Price range ±30%
            if original.get('price'):
                price = float(original['price'])
                query = query.gte('price', price * 0.7).lte('price', price * 1.3)

            result = query.limit(limit).execute()
            return result.data or []

        except Exception as e:
            logger.error(f"Similar products error: {e}")
            return []

    async def track_recommendation_click(
        self,
        platform_user_id: str,
        product_id: str,
        recommendation_strategy: str,
    ) -> bool:
        """
        Track when user clicks on a recommendation.

        Args:
            platform_user_id: User ID
            product_id: Clicked product ID
            recommendation_strategy: Strategy that generated the recommendation

        Returns:
            Success status
        """
        try:
            supabase = get_supabase_admin()

            # Update user preferences with viewed product
            supabase.rpc(
                'array_append_unique',
                {
                    'table_name': 'chatbot_user_preferences',
                    'column_name': 'viewed_products',
                    'row_id': platform_user_id,
                    'new_value': product_id,
                }
            ).execute()

            logger.info(f"Tracked recommendation click: {product_id} via {recommendation_strategy}")
            return True

        except Exception as e:
            logger.error(f"Track recommendation error: {e}")
            return False

    async def _get_user_preferences(self, platform_user_id: str) -> Optional[Dict]:
        """Get user preferences from database"""
        try:
            supabase = get_supabase_admin()

            result = supabase.table('chatbot_user_preferences').select(
                'zodiac_sign, element, favorite_crystals, favorite_categories, price_range'
            ).eq('platform_user_id', platform_user_id).single().execute()

            return result.data

        except Exception as e:
            logger.debug(f"No user preferences found: {e}")
            return None

    async def _search_products(
        self,
        keywords: List[str],
        price_min: Optional[float] = None,
        price_max: Optional[float] = None,
        limit: int = 5,
    ) -> List[Dict]:
        """Search products by keywords"""
        try:
            supabase = get_supabase_admin()

            query = supabase.table('shopify_products').select(
                'id, title, price, compare_at_price, image_url, handle, tags, description'
            ).eq('status', 'active')

            if price_min:
                query = query.gte('price', price_min)
            if price_max:
                query = query.lte('price', price_max)

            result = query.limit(limit * 3).execute()  # Get more, filter by keywords

            if not result.data:
                return []

            # Filter by keywords in title, tags, description
            matching = []
            for product in result.data:
                score = 0
                title_lower = (product.get('title') or '').lower()
                desc_lower = (product.get('description') or '').lower()
                tags = product.get('tags') or []

                for keyword in keywords:
                    kw = keyword.lower()
                    if kw in title_lower:
                        score += 3
                    if any(kw in tag.lower() for tag in tags):
                        score += 2
                    if kw in desc_lower:
                        score += 1

                if score > 0:
                    product['_relevance'] = score
                    matching.append(product)

            # Sort by relevance and return top results
            matching.sort(key=lambda x: x.get('_relevance', 0), reverse=True)
            return matching[:limit]

        except Exception as e:
            logger.error(f"Product search error: {e}")
            return []

    def _map_purpose(self, purpose: str) -> Optional[str]:
        """Map Vietnamese purpose to English key"""
        purpose_lower = purpose.lower()

        # Direct match
        if purpose_lower in self.purpose_crystals:
            return purpose_lower

        # Keyword match
        for keyword, key in self.purpose_keywords.items():
            if keyword in purpose_lower:
                return key

        return None

    def _build_reason(
        self,
        zodiac: Optional[str],
        element: Optional[str],
        emotion: Optional[str],
        purpose: Optional[str],
    ) -> str:
        """Build recommendation reason text"""
        parts = []

        if zodiac:
            parts.append(f"cung {zodiac.capitalize()}")
        if element:
            element_vn = {
                'metal': 'Kim', 'water': 'Thủy', 'wood': 'Mộc',
                'fire': 'Hỏa', 'earth': 'Thổ',
            }.get(element.lower(), element)
            parts.append(f"mệnh {element_vn}")
        if emotion:
            parts.append(f"cân bằng cảm xúc")
        if purpose:
            parts.append(f"mục đích {purpose}")

        if parts:
            return f"Gợi ý dành cho bạn dựa trên {', '.join(parts)}."
        return "Gợi ý các sản phẩm phổ biến."

    def _get_emotion_reason(self, emotion: str) -> str:
        """Get recommendation reason for emotion"""
        reasons = {
            'happy': "Duy trì năng lượng tích cực với những viên đá này.",
            'excited': "Kênh năng lượng hưng phấn với đá phù hợp.",
            'satisfied': "Đá giúp duy trì sự hài lòng và bình an.",
            'neutral': "Đá giúp cân bằng và thanh lọc năng lượng.",
            'confused': "Đá giúp tăng cường sự sáng suốt và tập trung.",
            'curious': "Đá hỗ trợ trực giác và khám phá.",
            'sad': "Đá giúp xoa dịu và mang lại sự ấm áp.",
            'disappointed': "Đá giúp bảo vệ và thanh lọc năng lượng tiêu cực.",
            'frustrated': "Đá giúp giải tỏa căng thẳng và mang lại bình tĩnh.",
            'angry': "Đá giúp làm dịu và bảo vệ năng lượng.",
            'anxious': "Đá giúp xoa dịu lo âu và mang lại sự bình an.",
        }
        return reasons.get(emotion, "Đá phù hợp với bạn lúc này.")


# Global instance
recommendation_service = RecommendationService()
