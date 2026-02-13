"""
Empathetic Response Service - Phản hồi đồng cảm
PHASE 3: TRÍ TUỆ
"""

import logging
from typing import Dict, Optional, Tuple
from dataclasses import dataclass
from enum import IntEnum

from .emotion_service import EmotionAnalysis

logger = logging.getLogger(__name__)


class EmpathyLevel(IntEnum):
    """Empathy levels 1-5"""
    MINIMAL = 1
    LOW = 2
    MODERATE = 3
    HIGH = 4
    MAXIMUM = 5


@dataclass
class EmpathyConfig:
    """Configuration for empathetic response"""
    level: EmpathyLevel
    should_escalate: bool
    escalation_reason: Optional[str]
    response_tone: str
    prefix: str
    suffix: str


class EmpathyService:
    """
    Empathetic Response Service for Vietnamese chatbot.
    Wraps AI responses with appropriate emotional acknowledgment.
    """

    def __init__(self):
        # Emotion-specific empathetic prefixes (Vietnamese)
        self.emotion_prefixes = {
            # Positive emotions
            'happy': [
                "Tuyệt vời! ",
                "Thật vui khi nghe điều đó! ",
                "Rất tuyệt! ",
            ],
            'excited': [
                "Wow, thật tuyệt! ",
                "Tuyệt vời quá! ",
                "Thật phấn khích! ",
            ],
            'satisfied': [
                "Tốt quá! ",
                "Rất vui vì bạn hài lòng! ",
                "Tuyệt! ",
            ],

            # Neutral emotions
            'neutral': [
                "",
                "Mình hiểu. ",
                "",
            ],
            'confused': [
                "Mình hiểu bạn đang thắc mắc. ",
                "Để mình giải thích rõ hơn nhé. ",
                "Đây là điều dễ gây nhầm lẫn. ",
            ],
            'curious': [
                "Câu hỏi hay! ",
                "Đây là thắc mắc rất phổ biến. ",
                "Mình rất vui được giải đáp! ",
            ],

            # Negative emotions
            'sad': [
                "Mình hiểu cảm giác của bạn. ",
                "Mình rất tiếc khi nghe điều này. ",
                "Đừng lo, mình ở đây để giúp bạn. ",
            ],
            'disappointed': [
                "Mình thật sự xin lỗi về trải nghiệm này. ",
                "Mình hiểu sự thất vọng của bạn. ",
                "Cảm ơn bạn đã chia sẻ, mình sẽ cố gắng giúp. ",
            ],
            'frustrated': [
                "Mình hiểu bạn đang bực mình. ",
                "Xin lỗi vì sự bất tiện này. ",
                "Mình sẽ cố gắng giải quyết ngay. ",
            ],
            'angry': [
                "Mình thật sự xin lỗi. ",
                "Mình hoàn toàn hiểu sự bức xúc của bạn. ",
                "Mình rất tiếc và sẽ hỗ trợ ngay. ",
            ],
            'anxious': [
                "Đừng lo lắng, mình ở đây để giúp bạn. ",
                "Mình hiểu bạn đang lo. Để mình giải thích. ",
                "Không sao đâu, mình sẽ hướng dẫn từng bước. ",
            ],
        }

        # Emotion-specific empathetic suffixes (Vietnamese)
        self.emotion_suffixes = {
            'happy': [
                " Có gì khác mình có thể giúp không?",
                " Chúc bạn một ngày tốt lành!",
                "",
            ],
            'excited': [
                " Cùng nhau khám phá tiếp nhé!",
                "",
                " Hãy tiếp tục phấn đấu!",
            ],
            'satisfied': [
                " Cần gì thêm cứ hỏi nhé!",
                "",
                "",
            ],
            'neutral': [
                "",
                " Nếu có thắc mắc gì thêm, cứ hỏi nhé!",
                "",
            ],
            'confused': [
                " Nếu vẫn chưa rõ, hãy hỏi thêm nhé!",
                " Bạn cần giải thích thêm phần nào không?",
                "",
            ],
            'curious': [
                " Hỏi thêm nếu cần nhé!",
                "",
                "",
            ],
            'sad': [
                " Mình luôn ở đây nếu bạn cần.",
                " Hy vọng điều này giúp được bạn.",
                "",
            ],
            'disappointed': [
                " Mình sẽ cố gắng cải thiện. Cảm ơn bạn đã phản hồi.",
                " Nếu cần thêm hỗ trợ, nhắn 'gặp support' nhé.",
                "",
            ],
            'frustrated': [
                " Mình hy vọng đã giải quyết được vấn đề.",
                " Nếu vẫn chưa ổn, nhắn 'gặp support' để gặp nhân viên.",
                "",
            ],
            'angry': [
                " Nhắn 'gặp support' nếu bạn muốn nói chuyện với nhân viên.",
                " Mình sẽ chuyển cho nhân viên hỗ trợ ngay.",
                "",
            ],
            'anxious': [
                " Đừng ngại hỏi thêm nhé!",
                " Mọi thứ sẽ ổn thôi!",
                "",
            ],
        }

        # Response tones based on emotion
        self.emotion_tones = {
            'happy': 'celebratory',
            'excited': 'enthusiastic',
            'satisfied': 'warm',
            'neutral': 'professional',
            'confused': 'clarifying',
            'curious': 'informative',
            'sad': 'compassionate',
            'disappointed': 'apologetic',
            'frustrated': 'solution-focused',
            'angry': 'calming',
            'anxious': 'reassuring',
        }

        # Escalation rules
        self.escalation_emotions = {'angry', 'frustrated'}
        self.escalation_urgencies = {'critical', 'high'}

    def get_empathy_config(
        self,
        emotion: str,
        urgency: str,
    ) -> EmpathyConfig:
        """
        Get empathy configuration based on emotion and urgency.

        Args:
            emotion: Detected emotion
            urgency: Urgency level

        Returns:
            EmpathyConfig with level, escalation info, and response modifiers
        """
        # Calculate empathy level
        level = self._calculate_empathy_level(emotion, urgency)

        # Check escalation
        should_escalate, escalation_reason = self._check_escalation(emotion, urgency)

        # Get tone
        tone = self.emotion_tones.get(emotion, 'professional')

        # Get prefix/suffix based on empathy level
        prefix = self._get_prefix(emotion, level)
        suffix = self._get_suffix(emotion, level)

        return EmpathyConfig(
            level=level,
            should_escalate=should_escalate,
            escalation_reason=escalation_reason,
            response_tone=tone,
            prefix=prefix,
            suffix=suffix,
        )

    def get_empathetic_response(
        self,
        emotion: str,
        urgency: str,
        core_response: str,
        include_prefix: bool = True,
        include_suffix: bool = True,
    ) -> Dict:
        """
        Wrap core response with empathetic prefix/suffix.

        Args:
            emotion: Detected emotion
            urgency: Urgency level
            core_response: The main response content
            include_prefix: Whether to add empathetic prefix
            include_suffix: Whether to add empathetic suffix

        Returns:
            Dict with full_response, config, and metadata
        """
        config = self.get_empathy_config(emotion, urgency)

        # Build response
        parts = []
        if include_prefix and config.prefix:
            parts.append(config.prefix)
        parts.append(core_response)
        if include_suffix and config.suffix:
            parts.append(config.suffix)

        full_response = ''.join(parts)

        return {
            'text': full_response,
            'empathy_level': config.level,
            'response_tone': config.response_tone,
            'should_escalate': config.should_escalate,
            'escalation_reason': config.escalation_reason,
        }

    def should_escalate(self, emotion: str, urgency: str) -> Tuple[bool, Optional[str]]:
        """
        Check if conversation should be escalated to human agent.

        Args:
            emotion: Detected emotion
            urgency: Urgency level

        Returns:
            Tuple of (should_escalate, reason)
        """
        return self._check_escalation(emotion, urgency)

    def get_empathy_level(self, emotion: str, urgency: str) -> EmpathyLevel:
        """
        Calculate empathy level for given emotion and urgency.

        Args:
            emotion: Detected emotion
            urgency: Urgency level

        Returns:
            EmpathyLevel (1-5)
        """
        return self._calculate_empathy_level(emotion, urgency)

    def _calculate_empathy_level(self, emotion: str, urgency: str) -> EmpathyLevel:
        """Calculate empathy level based on emotion and urgency"""
        # Base level from emotion
        negative_emotions = {'sad', 'disappointed', 'frustrated', 'angry', 'anxious'}
        positive_emotions = {'happy', 'excited', 'satisfied'}

        if emotion in negative_emotions:
            base_level = 4  # HIGH for negative emotions
        elif emotion in positive_emotions:
            base_level = 2  # LOW for positive (don't over-empathize)
        else:
            base_level = 3  # MODERATE for neutral

        # Adjust for urgency
        urgency_boost = {
            'critical': 1,
            'high': 1,
            'medium': 0,
            'low': 0,
        }

        final_level = min(base_level + urgency_boost.get(urgency, 0), 5)
        return EmpathyLevel(final_level)

    def _check_escalation(self, emotion: str, urgency: str) -> Tuple[bool, Optional[str]]:
        """Check if escalation to human is needed"""
        reasons = []

        if emotion in self.escalation_emotions:
            reasons.append(f"Cảm xúc tiêu cực: {emotion}")

        if urgency in self.escalation_urgencies:
            reasons.append(f"Mức độ khẩn cấp: {urgency}")

        if reasons:
            return True, "; ".join(reasons)

        return False, None

    def _get_prefix(self, emotion: str, level: EmpathyLevel) -> str:
        """Get empathetic prefix based on emotion and level"""
        prefixes = self.emotion_prefixes.get(emotion, [""])

        if level <= EmpathyLevel.LOW:
            return prefixes[0] if prefixes else ""
        elif level <= EmpathyLevel.MODERATE:
            return prefixes[min(1, len(prefixes) - 1)] if prefixes else ""
        else:
            return prefixes[min(2, len(prefixes) - 1)] if prefixes else ""

    def _get_suffix(self, emotion: str, level: EmpathyLevel) -> str:
        """Get empathetic suffix based on emotion and level"""
        suffixes = self.emotion_suffixes.get(emotion, [""])

        if level <= EmpathyLevel.LOW:
            return ""  # No suffix for low empathy
        elif level <= EmpathyLevel.MODERATE:
            return suffixes[min(1, len(suffixes) - 1)] if suffixes else ""
        else:
            return suffixes[min(2, len(suffixes) - 1)] if suffixes else ""

    def get_crisis_response(self, emotion: str) -> str:
        """
        Get immediate crisis response for severe negative emotions.

        Args:
            emotion: Detected emotion

        Returns:
            Crisis response text
        """
        if emotion == 'angry':
            return (
                "Mình thật sự xin lỗi về trải nghiệm này. "
                "Mình sẽ chuyển bạn đến nhân viên hỗ trợ ngay để giải quyết. "
                "Vui lòng đợi trong giây lát."
            )
        elif emotion == 'anxious':
            return (
                "Mình hiểu bạn đang lo lắng. Đừng lo, mình ở đây để giúp bạn. "
                "Nếu bạn cần nói chuyện với nhân viên, hãy nhắn 'gặp support'."
            )
        elif emotion in {'sad', 'disappointed', 'frustrated'}:
            return (
                "Mình rất tiếc về điều này. Mình sẽ cố gắng hết sức để giúp bạn. "
                "Nếu cần, mình có thể chuyển bạn đến nhân viên hỗ trợ."
            )

        return ""

    def format_with_emotion_context(
        self,
        analysis: EmotionAnalysis,
        core_response: str,
    ) -> Dict:
        """
        Format response with full emotion context from EmotionAnalysis.

        Args:
            analysis: EmotionAnalysis from emotion_service
            core_response: Core response text

        Returns:
            Complete formatted response with metadata
        """
        result = self.get_empathetic_response(
            emotion=analysis.emotion,
            urgency=analysis.urgency,
            core_response=core_response,
        )

        # Add emotion analysis context
        result['emotion_context'] = {
            'emotion': analysis.emotion,
            'emotion_score': analysis.emotion_score,
            'sentiment': analysis.sentiment,
            'sentiment_score': analysis.sentiment_score,
            'urgency': analysis.urgency,
            'urgency_score': analysis.urgency_score,
            'trigger_words': analysis.trigger_words,
        }

        return result


# Global instance
empathy_service = EmpathyService()
