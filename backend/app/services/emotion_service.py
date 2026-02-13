"""
Emotion Detection Service - Nhận diện cảm xúc tiếng Việt
PHASE 3: TRÍ TUỆ
"""

import re
import logging
from typing import Dict, Tuple, List, Optional
from dataclasses import dataclass

from ..core.database import get_supabase_admin

logger = logging.getLogger(__name__)


@dataclass
class EmotionAnalysis:
    """Result of emotion analysis"""
    sentiment: str  # positive, neutral, negative
    sentiment_score: float
    emotion: str  # happy, sad, angry, etc.
    emotion_score: float
    urgency: str  # low, medium, high, critical
    urgency_score: float
    trigger_words: List[str]


class EmotionService:
    """
    Emotion Detection Service for Vietnamese text.
    Detects sentiment, emotion, and urgency from user messages.
    """

    def __init__(self):
        # Vietnamese emotion keywords
        self.emotion_keywords = {
            # Positive emotions
            'happy': [
                'vui', 'vui vẻ', 'hạnh phúc', 'tuyệt vời', 'thích', 'yêu',
                'cảm ơn', 'cám ơn', 'thank', 'thanks', 'hay', 'tốt',
                '😊', '😄', '😃', '🥰', '❤️', '💕', '👍', '🙏'
            ],
            'excited': [
                'wow', 'ôi', 'quá đỉnh', 'xuất sắc', 'phấn khích', 'tuyệt cú mèo',
                'siêu', 'quá hay', 'amazing', 'awesome',
                '🎉', '🔥', '🚀', '✨', '💯', '🤩'
            ],
            'satisfied': [
                'hài lòng', 'ổn', 'được', 'ok', 'nice', 'ưng',
                'tạm được', 'chấp nhận được', 'good'
            ],

            # Neutral emotions
            'neutral': ['à', 'ừ', 'hmm', 'vậy', 'ok', 'ờ', 'thì'],
            'confused': [
                'không hiểu', 'làm sao', 'thế nào', 'tại sao', 'sao vậy',
                'như thế nào', 'giải thích', 'rõ hơn', 'bối rối',
                '🤔', '❓', '❔'
            ],
            'curious': [
                'muốn biết', 'tò mò', 'thắc mắc', 'hỏi', 'tư vấn',
                'cho hỏi', 'giúp', 'cho mình hỏi', 'có thể'
            ],

            # Negative emotions
            'sad': [
                'buồn', 'chán', 'tệ', 'đau', 'khổ', 'thất vọng nhẹ',
                '😢', '😭', '😔', '💔'
            ],
            'disappointed': [
                'thất vọng', 'không như mong đợi', 'kỳ vọng', 'chán quá',
                'không hài lòng', 'tệ quá', 'dở', 'không ổn'
            ],
            'frustrated': [
                'bực', 'khó chịu', 'phiền', 'chán quá', 'mệt mỏi',
                'phức tạp', 'rắc rối', 'lằng nhằng',
                '😤', '😒'
            ],
            'angry': [
                'tức', 'giận', 'điên', 'hết chịu nổi', 'phẫn nộ',
                'bực mình', 'tức giận', 'nổi điên', 'không chấp nhận được',
                '😡', '🤬', '😠', '💢'
            ],
            'anxious': [
                'lo', 'lo lắng', 'sợ', 'hoang mang', 'bất an',
                'lo ngại', 'run', 'hồi hộp', 'căng thẳng',
                '😰', '😟', '😨'
            ]
        }

        # Sentiment patterns
        self.positive_patterns = [
            r'cảm ơn', r'cám ơn', r'tuyệt', r'hay', r'tốt',
            r'thích', r'yêu', r'xuất sắc', r'hài lòng', r'ổn',
            r'tuyệt vời', r'thank', r'nice', r'great', r'good'
        ]

        self.negative_patterns = [
            r'không', r'chưa', r'tệ', r'buồn', r'tức',
            r'giận', r'thất vọng', r'chán', r'bực', r'sai',
            r'lỗi', r'hỏng', r'bad', r'terrible', r'wrong'
        ]

        # Urgency keywords
        self.urgency_keywords = {
            'critical': [
                'khẩn cấp', 'urgent', 'ngay', 'lập tức', 'asap',
                'emergency', 'ngay bây giờ', 'gấp lắm', 'cực kỳ gấp'
            ],
            'high': [
                'nhanh', 'sớm', 'cần', 'quan trọng', 'gấp',
                'mau', 'nhanh lên', 'cần gấp'
            ],
            'medium': [
                'khi nào', 'bao giờ', 'cần biết', 'muốn biết'
            ],
            'low': []
        }

        # Emotion to sentiment mapping
        self.emotion_sentiment = {
            'happy': 'positive',
            'excited': 'positive',
            'satisfied': 'positive',
            'neutral': 'neutral',
            'confused': 'neutral',
            'curious': 'neutral',
            'sad': 'negative',
            'disappointed': 'negative',
            'frustrated': 'negative',
            'angry': 'negative',
            'anxious': 'negative'
        }

    def analyze(self, text: str) -> EmotionAnalysis:
        """
        Phân tích cảm xúc từ text.

        Args:
            text: User message text

        Returns:
            EmotionAnalysis with sentiment, emotion, urgency
        """
        if not text:
            return EmotionAnalysis(
                sentiment='neutral',
                sentiment_score=0.5,
                emotion='neutral',
                emotion_score=0.5,
                urgency='low',
                urgency_score=0.2,
                trigger_words=[]
            )

        text_lower = text.lower().strip()

        # Detect components
        emotion, emotion_score, triggers = self._detect_emotion(text_lower)
        sentiment, sentiment_score = self._detect_sentiment(text_lower, emotion)
        urgency, urgency_score = self._detect_urgency(text_lower)

        return EmotionAnalysis(
            sentiment=sentiment,
            sentiment_score=round(sentiment_score, 3),
            emotion=emotion,
            emotion_score=round(emotion_score, 3),
            urgency=urgency,
            urgency_score=round(urgency_score, 3),
            trigger_words=triggers
        )

    def _detect_sentiment(self, text: str, detected_emotion: str) -> Tuple[str, float]:
        """Detect sentiment (positive/neutral/negative)"""
        positive_count = sum(1 for p in self.positive_patterns if re.search(p, text))
        negative_count = sum(1 for p in self.negative_patterns if re.search(p, text))

        total = positive_count + negative_count

        if total == 0:
            # Fall back to emotion-based sentiment
            return self.emotion_sentiment.get(detected_emotion, 'neutral'), 0.5

        ratio = positive_count / total

        if ratio > 0.6:
            return 'positive', min(0.5 + ratio * 0.5, 1.0)
        elif ratio < 0.4:
            return 'negative', min(0.5 + (1 - ratio) * 0.5, 1.0)

        return 'neutral', 0.5

    def _detect_emotion(self, text: str) -> Tuple[str, float, List[str]]:
        """Detect primary emotion"""
        scores: Dict[str, int] = {}
        triggers: List[str] = []

        for emotion, keywords in self.emotion_keywords.items():
            score = 0
            for keyword in keywords:
                if keyword in text:
                    score += 1
                    triggers.append(keyword)

            if score > 0:
                scores[emotion] = score

        if not scores:
            return 'neutral', 0.5, []

        # Get highest scoring emotion
        best_emotion = max(scores, key=scores.get)
        keyword_count = len(self.emotion_keywords[best_emotion])
        confidence = min(scores[best_emotion] / max(keyword_count * 0.3, 1), 1.0)

        return best_emotion, confidence, list(set(triggers))

    def _detect_urgency(self, text: str) -> Tuple[str, float]:
        """Detect urgency level"""
        for level in ['critical', 'high', 'medium']:
            for keyword in self.urgency_keywords[level]:
                if keyword in text:
                    urgency_scores = {
                        'critical': 1.0,
                        'high': 0.8,
                        'medium': 0.5
                    }
                    return level, urgency_scores[level]

        return 'low', 0.2

    def to_dict(self, analysis: EmotionAnalysis) -> Dict:
        """Convert EmotionAnalysis to dictionary"""
        return {
            'sentiment': analysis.sentiment,
            'sentiment_score': analysis.sentiment_score,
            'emotion': analysis.emotion,
            'emotion_score': analysis.emotion_score,
            'urgency': analysis.urgency,
            'urgency_score': analysis.urgency_score,
            'trigger_words': analysis.trigger_words
        }

    async def log_emotion(
        self,
        message_id: Optional[str],
        platform_user_id: str,
        conversation_id: str,
        analysis: EmotionAnalysis,
        response_tone: Optional[str] = None,
        empathy_level: Optional[int] = None,
        raw_text: Optional[str] = None
    ) -> Optional[str]:
        """
        Log emotion analysis to database.

        Args:
            message_id: ID of the analyzed message
            platform_user_id: Platform user ID
            conversation_id: Conversation ID
            analysis: EmotionAnalysis result
            response_tone: Tone used in response
            empathy_level: Empathy level 1-5
            raw_text: Original text (optional)

        Returns:
            Log entry ID or None on error
        """
        try:
            supabase = get_supabase_admin()

            result = supabase.rpc(
                'log_emotion_analysis',
                {
                    'p_message_id': message_id,
                    'p_platform_user_id': platform_user_id,
                    'p_conversation_id': conversation_id,
                    'p_sentiment': analysis.sentiment,
                    'p_sentiment_score': analysis.sentiment_score,
                    'p_emotion': analysis.emotion,
                    'p_emotion_score': analysis.emotion_score,
                    'p_urgency': analysis.urgency,
                    'p_urgency_score': analysis.urgency_score,
                    'p_trigger_words': analysis.trigger_words,
                    'p_response_tone': response_tone,
                    'p_empathy_level': empathy_level,
                    'p_raw_text': raw_text
                }
            ).execute()

            return result.data

        except Exception as e:
            logger.error(f"Log emotion error: {e}")
            return None

    async def get_user_emotion_stats(
        self,
        platform_user_id: str,
        days: int = 30
    ) -> Optional[Dict]:
        """
        Get emotion statistics for a user.

        Args:
            platform_user_id: Platform user ID
            days: Number of days to look back

        Returns:
            Dict with emotion stats or None on error
        """
        try:
            supabase = get_supabase_admin()

            result = supabase.rpc(
                'get_user_emotion_stats',
                {
                    'p_platform_user_id': platform_user_id,
                    'p_days': days
                }
            ).execute()

            return result.data[0] if result.data else None

        except Exception as e:
            logger.error(f"Get emotion stats error: {e}")
            return None


# Global instance
emotion_service = EmotionService()
