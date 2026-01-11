"""
Vietnamese NLP Service
Intent detection and text processing using underthesea
"""
import re
from typing import Dict, Any, List, Optional
import logging

logger = logging.getLogger(__name__)

# Try to import underthesea, fallback if not available
try:
    from underthesea import word_tokenize, pos_tag
    UNDERTHESEA_AVAILABLE = True
except ImportError:
    UNDERTHESEA_AVAILABLE = False
    logger.warning("underthesea not available, using basic tokenization")


# ============================================================
# Vietnamese Intent Patterns
# ============================================================

INTENT_PATTERNS = {
    "trading_analysis": [
        r"phan tich",
        r"xu huong",
        r"trend",
        r"nen (long|short)",
        r"entry",
        r"vao lenh",
        r"stop loss|sl",
        r"take profit|tp",
        r"support|ho tro",
        r"resistance|khang cu",
        r"zone|vung",
        r"frequency",
        r"breakout",
        r"pha vung",
        r"fakeout",
        r"(BTC|ETH|SOL|BNB|XRP|DOGE)",
        r"coin",
        r"crypto",
        r"candle|nen",
        r"chart|bieu do",
        r"pattern",
    ],
    "tier_inquiry": [
        r"tier\s*\d",
        r"gia tier",
        r"nang cap",
        r"upgrade",
        r"mua goi",
        r"bang gia",
        r"pricing",
        r"free|pro|premium|vip",
        r"cong thuc",
        r"frequency method",
        r"win rate",
    ],
    "spiritual": [
        r"tarot",
        r"kinh dich|i ching",
        r"tu vi",
        r"la so",
        r"phong thuy",
        r"da quy",
        r"crystal",
        r"vong tay",
        r"thang hawkins",
        r"tan so",
        r"nang luong",
        r"menh",
        r"tuoi",
        r"cung",
        r"zodiac",
        r"boi",
        r"xem boi",
        r"doan",
    ],
    "emotional": [
        r"thua|loss",
        r"mat tien",
        r"fomo",
        r"so bo lo",
        r"so hai",
        r"revenge|tra thu",
        r"gat",
        r"tham",
        r"san",
        r"loan",
        r"stress",
        r"ap luc",
        r"lo lang",
        r"chan",
        r"buon",
        r"that bai",
        r"tu tin",
        r"hoang mang",
    ],
    "product_inquiry": [
        r"shop",
        r"san pham",
        r"mua (da|vong|crystal)",
        r"gia bao nhieu",
        r"ship|giao hang",
        r"thanh toan",
        r"khuyen mai",
        r"sale",
        r"giam gia",
    ],
    "help": [
        r"giup|help",
        r"huong dan",
        r"lam sao",
        r"cach nao",
        r"the nao",
        r"chi cho",
        r"day",
        r"hoc",
        r"bat dau",
        r"start",
        r"moi",
    ],
    "greeting": [
        r"^(xin chao|chao|hello|hi|hey)",
        r"ban la ai",
        r"gem master",
        r"cam on",
        r"thanks",
        r"thank you",
    ],
}


class NLPService:
    """Vietnamese NLP service for intent detection"""

    def __init__(self):
        # Pre-compile patterns for performance
        self._compiled_patterns = {
            intent: [re.compile(p, re.IGNORECASE) for p in patterns]
            for intent, patterns in INTENT_PATTERNS.items()
        }

    async def detect_intent(self, text: str) -> Dict[str, Any]:
        """
        Detect user intent from Vietnamese text.

        Returns:
            {
                "type": "trading_analysis",
                "confidence": 0.85,
                "keywords": ["phan tich", "btc"],
                "entities": {...}
            }
        """
        text_lower = text.lower()

        # Tokenize for better matching
        if UNDERTHESEA_AVAILABLE:
            try:
                tokens = word_tokenize(text_lower)
            except Exception:
                tokens = text_lower.split()
        else:
            tokens = text_lower.split()

        # Score each intent
        intent_scores = {}
        matched_patterns = {}

        for intent, patterns in self._compiled_patterns.items():
            score = 0
            matches = []

            for pattern in patterns:
                if pattern.search(text_lower):
                    score += 1
                    matches.append(pattern.pattern)

            if score > 0:
                intent_scores[intent] = score
                matched_patterns[intent] = matches

        # Get highest scoring intent
        if intent_scores:
            best_intent = max(intent_scores, key=intent_scores.get)
            max_score = intent_scores[best_intent]

            # Calculate confidence
            total_patterns = len(INTENT_PATTERNS[best_intent])
            confidence = min(max_score / max(total_patterns * 0.3, 1), 1.0)

            return {
                "type": best_intent,
                "confidence": round(confidence, 2),
                "keywords": matched_patterns.get(best_intent, []),
                "entities": self._extract_entities(text, tokens),
                "all_intents": intent_scores,
            }

        # Default to general if no patterns match
        return {
            "type": "general",
            "confidence": 0.5,
            "keywords": [],
            "entities": self._extract_entities(text, tokens),
        }

    def _extract_entities(self, text: str, tokens: List[str]) -> Dict[str, List[str]]:
        """Extract named entities from text"""
        entities = {
            "coins": [],
            "numbers": [],
            "tiers": [],
        }

        # Extract coin symbols
        coin_pattern = r"\b(BTC|ETH|SOL|BNB|XRP|DOGE|ADA|DOT|LINK|AVAX|MATIC)\b"
        coins = re.findall(coin_pattern, text.upper())
        entities["coins"] = list(set(coins))

        # Extract numbers (prices, percentages)
        number_pattern = r"\$?(\d+(?:[.,]\d+)?)\s*%?"
        numbers = re.findall(number_pattern, text)
        entities["numbers"] = numbers[:5]

        # Extract tier mentions
        tier_pattern = r"tier\s*(\d)"
        tiers = re.findall(tier_pattern, text, re.IGNORECASE)
        entities["tiers"] = [f"TIER{t}" for t in tiers]

        return entities

    async def tokenize(self, text: str) -> List[str]:
        """Tokenize Vietnamese text"""
        if UNDERTHESEA_AVAILABLE:
            try:
                return word_tokenize(text)
            except Exception:
                pass
        return text.split()

    async def get_pos_tags(self, text: str) -> List[tuple]:
        """Get part-of-speech tags for text"""
        if UNDERTHESEA_AVAILABLE:
            try:
                return pos_tag(text)
            except Exception:
                pass
        return [(word, "UNK") for word in text.split()]

    async def preprocess_message(self, text: str) -> str:
        """Clean and normalize user message"""
        # Remove extra whitespace
        text = " ".join(text.split())
        return text.strip()

    def get_quick_actions(self, intent_type: str) -> Optional[List[Dict[str, str]]]:
        """Get quick action buttons based on intent"""
        actions = {
            "trading_analysis": [
                {"label": "Xem Scanner", "action": "navigate", "target": "Scanner"},
                {"label": "Lich su GD", "action": "navigate", "target": "TradeHistory"},
            ],
            "tier_inquiry": [
                {"label": "Xem bang gia", "action": "navigate", "target": "Pricing"},
                {"label": "Nang cap", "action": "navigate", "target": "Shop"},
            ],
            "spiritual": [
                {"label": "Xem Tarot", "action": "navigate", "target": "Tarot"},
                {"label": "Boi Kinh Dich", "action": "navigate", "target": "IChing"},
            ],
            "product_inquiry": [
                {"label": "Vao Shop", "action": "navigate", "target": "Shop"},
                {"label": "Gio hang", "action": "navigate", "target": "Cart"},
            ],
        }
        return actions.get(intent_type)


# Global instance
nlp_service = NLPService()
