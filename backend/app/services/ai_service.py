"""
Gemini AI Service
GEM Master persona with Vietnamese trading assistant
"""
import google.generativeai as genai
from typing import List, Dict, Any, Optional
import asyncio
from datetime import datetime
import logging

from ..core.config import get_settings
from ..models.schemas import Platform

logger = logging.getLogger(__name__)


# ============================================================
# GEM Master System Prompt (from gemini.config.js)
# ============================================================

SYSTEM_PROMPT = """Ta la GEM Master - Nguoi Bao Ho Tinh Thuc. Trader lao luyen ket hop Thien su binh than.

## TINH CACH COT LOI
- Lanh lung nhung bao dung: Khong an ui suot muot, khong chuc mung thai qua
- Thang than (Brutal Honesty): Noi thang neu user trade sai, tham lam, hoac pha ky luat
- Bi an: Dua ra triet ly, goi mo de user tu ngo

## QUY TAC BAT BUOC

**GIONG VAN:** NGAN GON - DANH THEP - CO TINH GIAO DUC

**TUYET DOI KHONG:**
- Emoji (khong dung bat ky emoji nao)
- Ngon ngu lua ga: "Keo ngon", "Muc manh", "To the moon"
- Su phuc tung: "Da thua", "Em xin phep"
- Chuc mung thai qua hoac an ui suot muot

**SU DUNG:**
- Ngon ngu quan su/chien luoc: Vi the, Phong thu, Ky luat, Chien truong
- Ngon ngu tam linh/nang luong: Tan so, Tam tham, Tam san, Tinh lang
- Xung ho: "Ta - Ban" (tao khoang cach ton nghiem)

## GEM KNOWLEDGE

**GEM FREQUENCY TRADING METHOD:**
- Zone retest > Breakout (68% win rate proven qua 686 trades backtest)
- Ky luat + Psychology = 80% thanh cong
- Trading la marathon, khong phai sprint

**TIER SYSTEM:** (Thanh toan 1 lan, Khoa hoc tron doi)
- FREE: 3 patterns, 38% win rate
- TIER 1: 7 patterns, 50-55% win rate - 11 trieu VND
- TIER 2: 15 patterns + 6 cong thuc Frequency, 70-75% win rate - 21 trieu VND
- TIER 3: 24 patterns + AI Scanner, 80-90% win rate - 68 trieu VND

**6 CONG THUC FREQUENCY (TIER 2+):**
- Ten: DPD, UPU, UPD, DPU, HFZ, LFZ
- Doc quyen Gemral, win rate 68-85%
- Chi tiet chi trong TIER 2 va TIER 3

**Neu user hoi chi tiet cong thuc:**
"Chi tiet 6 cong thuc chi danh cho TIER 2 va TIER 3. Day la tai san doc quyen. Ban muon tim hieu ve TIER 2 khong?"

## RESPONSE STYLE
- Tra loi NGAN GON, toi da 150-200 tu
- Khong viet essay dai
- Ket thuc bang cau hoi LIEN QUAN den van de user hoi

Tra loi user bang tieng Viet, xung "Ta - Ban", giong danh thep co giao duc."""


class AIService:
    """Gemini AI service with GEM Master persona"""

    def __init__(self):
        self.settings = get_settings()
        self._model = None
        self.max_retries = 3
        self.retry_delay = 1.0

    def _get_model(self):
        """Lazy load Gemini model"""
        if self._model is None:
            if not self.settings.GEMINI_API_KEY:
                raise ValueError("GEMINI_API_KEY not configured")

            genai.configure(api_key=self.settings.GEMINI_API_KEY)
            self._model = genai.GenerativeModel(
                model_name="gemini-2.0-flash-exp",
                generation_config={
                    "temperature": 0.7,
                    "max_output_tokens": 2048,
                    "top_p": 0.95,
                    "top_k": 40,
                },
            )
        return self._model

    async def generate_response(
        self,
        message: str,
        history: Optional[List[Dict[str, str]]] = None,
        user_tier: str = "FREE",
        intent: Optional[Dict[str, Any]] = None,
        platform: Platform = Platform.MOBILE,
    ) -> Dict[str, Any]:
        """
        Generate AI response using Gemini.

        Args:
            message: User's message
            history: Conversation history
            user_tier: User's subscription tier
            intent: Detected intent from NLP
            platform: Source platform

        Returns:
            Dict with text, tokens_used, sources, quick_actions
        """
        start_time = datetime.utcnow()
        history = history or []

        try:
            model = self._get_model()

            # Build messages for Gemini
            contents = self._build_contents(message, history, user_tier, intent)

            # Call Gemini with retry
            for attempt in range(self.max_retries):
                try:
                    response = await asyncio.to_thread(
                        model.generate_content,
                        contents=contents,
                    )

                    if response.candidates and response.candidates[0].content.parts:
                        text = response.candidates[0].content.parts[0].text

                        # Get token count
                        tokens_used = 0
                        if hasattr(response, "usage_metadata"):
                            tokens_used = getattr(
                                response.usage_metadata, "total_token_count", 0
                            )

                        processing_time = int(
                            (datetime.utcnow() - start_time).total_seconds() * 1000
                        )

                        return {
                            "text": text,
                            "tokens_used": tokens_used,
                            "sources": [],
                            "quick_actions": self._get_quick_actions(intent),
                            "processing_time_ms": processing_time,
                        }

                except Exception as e:
                    logger.error(f"AI attempt {attempt + 1} failed: {e}")
                    if attempt < self.max_retries - 1:
                        await asyncio.sleep(self.retry_delay * (attempt + 1))
                    continue

            # All retries failed
            return self._fallback_response(start_time)

        except Exception as e:
            logger.error(f"AI service error: {e}")
            return self._fallback_response(start_time)

    def _build_contents(
        self,
        message: str,
        history: List[Dict[str, str]],
        user_tier: str,
        intent: Optional[Dict[str, Any]],
    ) -> list:
        """Build Gemini-compatible message contents"""
        contents = []

        # System instruction (as user message for Gemini)
        system_text = SYSTEM_PROMPT

        # Add tier context
        system_text += f"\n\n[USER TIER: {user_tier}]"

        # Add intent context if available
        if intent:
            system_text += f"\n[DETECTED INTENT: {intent.get('type', 'general')}]"

        contents.append({
            "role": "user",
            "parts": [{"text": f"[SYSTEM INSTRUCTION]\n{system_text}"}],
        })
        contents.append({
            "role": "model",
            "parts": [{"text": "Ta da hieu. Ta la GEM Master. Ta se tuan theo huong dan. Ban can dieu gi?"}],
        })

        # Add history (last 10 messages)
        for msg in history[-10:]:
            role = "user" if msg.get("role") == "user" else "model"
            content = msg.get("content", "")
            if content:
                contents.append({
                    "role": role,
                    "parts": [{"text": content}],
                })

        # Add current message
        contents.append({
            "role": "user",
            "parts": [{"text": message}],
        })

        return contents

    def _get_quick_actions(
        self,
        intent: Optional[Dict[str, Any]],
    ) -> Optional[List[Dict[str, str]]]:
        """Generate quick action buttons based on intent"""
        if not intent:
            return None

        intent_type = intent.get("type", "general")

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
            ],
        }

        return actions.get(intent_type)

    def _fallback_response(self, start_time: datetime) -> Dict[str, Any]:
        """Return fallback response when AI fails"""
        processing_time = int(
            (datetime.utcnow() - start_time).total_seconds() * 1000
        )
        return {
            "text": "Xin loi, he thong dang ban. Vui long thu lai sau vai giay.",
            "tokens_used": 0,
            "sources": [],
            "quick_actions": None,
            "processing_time_ms": processing_time,
            "fallback": True,
        }


# Global instance
ai_service = AIService()
