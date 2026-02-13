"""
FAQ Automation Service
Provides automated FAQ responses with keyword matching and confidence scoring
"""

import re
import logging
from typing import Dict, List, Any, Optional, Tuple
from dataclasses import dataclass

from ..core.database import get_supabase
from ..core.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()


@dataclass
class FAQMatch:
    """Represents a matched FAQ entry"""
    id: str
    question: str
    answer: str
    category: str
    confidence: float
    keywords: List[str]


class FAQService:
    """
    FAQ Automation Service

    Features:
    - Keyword-based FAQ search
    - Confidence threshold filtering
    - Match tracking for analytics
    - Feedback recording
    """

    def __init__(self):
        self.confidence_threshold = getattr(settings, 'FAQ_CONFIDENCE_THRESHOLD', 0.75)
        self.max_results = getattr(settings, 'FAQ_MAX_RESULTS', 3)

        # Vietnamese stop words to filter out
        self.stop_words = {
            'là', 'và', 'của', 'có', 'được', 'cho', 'với', 'này',
            'các', 'một', 'để', 'trong', 'như', 'những', 'người',
            'từ', 'khi', 'cũng', 'về', 'đã', 'sẽ', 'không', 'thì',
            'vào', 'hay', 'nào', 'bạn', 'tôi', 'mình', 'ơi', 'nhé',
            'cho', 'làm', 'sao', 'thế', 'nào', 'à', 'ạ', 'dạ', 'vâng'
        }

    def extract_keywords(self, text: str) -> List[str]:
        """
        Extract keywords from user query.

        Args:
            text: Raw user message

        Returns:
            List of normalized keywords
        """
        if not text:
            return []

        # Lowercase and normalize
        text = text.lower().strip()

        # Remove punctuation except Vietnamese characters
        text = re.sub(r'[^\w\sàáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]', ' ', text)

        # Split into words
        words = text.split()

        # Filter out stop words and short words
        keywords = [
            w for w in words
            if w not in self.stop_words and len(w) >= 2
        ]

        return keywords

    async def search_answer(
        self,
        query: str,
        category: Optional[str] = None
    ) -> Optional[FAQMatch]:
        """
        Search for FAQ answer matching user query.

        Args:
            query: User's question
            category: Optional category filter

        Returns:
            FAQMatch if confidence >= threshold, None otherwise
        """
        if not query or len(query.strip()) < 2:
            return None

        try:
            supabase = await get_supabase()
            keywords = self.extract_keywords(query)

            if not keywords:
                return None

            # Call Supabase RPC function
            result = await supabase.rpc(
                'search_faq_keywords',
                {
                    'p_keywords': keywords,
                    'p_category': category,
                    'p_limit': self.max_results
                }
            ).execute()

            if not result.data:
                return None

            # Get best match
            best_match = result.data[0]
            confidence = best_match.get('match_score', 0)

            # Check confidence threshold
            if confidence < self.confidence_threshold:
                logger.debug(f"FAQ match below threshold: {confidence} < {self.confidence_threshold}")
                return None

            faq_match = FAQMatch(
                id=best_match['id'],
                question=best_match['question'],
                answer=best_match['answer'],
                category=best_match['category'],
                confidence=confidence,
                keywords=best_match.get('keywords', [])
            )

            # Increment match count asynchronously
            await self._increment_match_count(faq_match.id)

            return faq_match

        except Exception as e:
            logger.error(f"FAQ search error: {e}")
            return None

    async def search_multiple(
        self,
        query: str,
        category: Optional[str] = None,
        limit: int = 3
    ) -> List[FAQMatch]:
        """
        Search for multiple FAQ matches.

        Args:
            query: User's question
            category: Optional category filter
            limit: Max results to return

        Returns:
            List of FAQMatch objects sorted by confidence
        """
        if not query or len(query.strip()) < 2:
            return []

        try:
            supabase = await get_supabase()
            keywords = self.extract_keywords(query)

            if not keywords:
                return []

            result = await supabase.rpc(
                'search_faq_keywords',
                {
                    'p_keywords': keywords,
                    'p_category': category,
                    'p_limit': limit
                }
            ).execute()

            if not result.data:
                return []

            matches = []
            for row in result.data:
                if row.get('match_score', 0) >= self.confidence_threshold * 0.5:  # Lower threshold for suggestions
                    matches.append(FAQMatch(
                        id=row['id'],
                        question=row['question'],
                        answer=row['answer'],
                        category=row['category'],
                        confidence=row.get('match_score', 0),
                        keywords=row.get('keywords', [])
                    ))

            return matches

        except Exception as e:
            logger.error(f"FAQ search_multiple error: {e}")
            return []

    async def get_faqs_by_category(
        self,
        category: str,
        limit: int = 10
    ) -> List[Dict[str, Any]]:
        """
        Get FAQs for a specific category.

        Args:
            category: Category name
            limit: Max results

        Returns:
            List of FAQ dictionaries
        """
        try:
            supabase = await get_supabase()

            result = await supabase.from_('chatbot_faq') \
                .select('id, question, answer, category, keywords, priority') \
                .eq('category', category) \
                .eq('is_active', True) \
                .order('priority', desc=True) \
                .order('match_count', desc=True) \
                .limit(limit) \
                .execute()

            return result.data or []

        except Exception as e:
            logger.error(f"FAQ get_by_category error: {e}")
            return []

    async def get_all_categories(self) -> List[str]:
        """Get all FAQ categories"""
        try:
            supabase = await get_supabase()

            result = await supabase.from_('chatbot_faq') \
                .select('category') \
                .eq('is_active', True) \
                .execute()

            if not result.data:
                return []

            # Unique categories
            categories = list(set(row['category'] for row in result.data))
            return sorted(categories)

        except Exception as e:
            logger.error(f"FAQ get_categories error: {e}")
            return []

    async def record_feedback(
        self,
        faq_id: str,
        helpful: bool
    ) -> bool:
        """
        Record user feedback on FAQ response.

        Args:
            faq_id: FAQ entry ID
            helpful: True if user found it helpful

        Returns:
            True if recorded successfully
        """
        try:
            supabase = await get_supabase()

            await supabase.rpc(
                'record_faq_feedback',
                {
                    'p_faq_id': faq_id,
                    'p_helpful': helpful
                }
            ).execute()

            return True

        except Exception as e:
            logger.error(f"FAQ record_feedback error: {e}")
            return False

    async def _increment_match_count(self, faq_id: str) -> None:
        """Increment match count for analytics"""
        try:
            supabase = await get_supabase()

            await supabase.rpc(
                'increment_faq_match',
                {'p_faq_id': faq_id}
            ).execute()

        except Exception as e:
            logger.warning(f"FAQ increment_match error: {e}")

    async def get_popular_faqs(self, limit: int = 5) -> List[Dict[str, Any]]:
        """Get most frequently matched FAQs"""
        try:
            supabase = await get_supabase()

            result = await supabase.from_('chatbot_faq') \
                .select('id, question, answer, category, match_count') \
                .eq('is_active', True) \
                .order('match_count', desc=True) \
                .limit(limit) \
                .execute()

            return result.data or []

        except Exception as e:
            logger.error(f"FAQ get_popular error: {e}")
            return []

    async def format_faq_response(
        self,
        faq_match: FAQMatch,
        include_feedback_prompt: bool = True
    ) -> str:
        """
        Format FAQ answer for user display.

        Args:
            faq_match: Matched FAQ entry
            include_feedback_prompt: Whether to include feedback buttons hint

        Returns:
            Formatted response string
        """
        response = faq_match.answer

        if include_feedback_prompt:
            response += "\n\n💡 Câu trả lời có hữu ích không? Phản hồi giúp Gemral cải thiện!"

        return response


# Global instance
faq_service = FAQService()
