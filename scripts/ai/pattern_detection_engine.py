# scripts/ai/pattern_detection_engine.py
# Core pattern detection engine with 24 patterns
# GEMRAL AI BRAIN - Phase 6

from dataclasses import dataclass
from enum import Enum
from typing import List, Dict, Any, Optional, Tuple
import numpy as np

from feature_extractor import (
    Candle, PatternFeatures, extract_features,
    calculate_ema, calculate_rsi, calculate_atr, calculate_macd,
    zone_retest_validation, support_resistance_confluence,
    volume_confirmation, trend_context
)

# ═══════════════════════════════════════════════════════════════════════════
# PATTERN TYPES
# ═══════════════════════════════════════════════════════════════════════════

class PatternType(Enum):
    # FREE Tier (3 patterns)
    DPD = 'dpd'
    UPU = 'upu'
    HEAD_SHOULDERS = 'head_shoulders'

    # TIER1 (+4 = 7 total)
    UPD = 'upd'
    DPU = 'dpu'
    DOUBLE_TOP = 'double_top'
    DOUBLE_BOTTOM = 'double_bottom'

    # TIER2 (+8 = 15 total)
    INV_HEAD_SHOULDERS = 'inv_head_shoulders'
    ASCENDING_TRIANGLE = 'ascending_triangle'
    DESCENDING_TRIANGLE = 'descending_triangle'
    HFZ = 'hfz'
    LFZ = 'lfz'
    SYMMETRICAL_TRIANGLE = 'symmetrical_triangle'
    ROUNDING_BOTTOM = 'rounding_bottom'
    ROUNDING_TOP = 'rounding_top'

    # TIER3 (+9 = 24 total)
    BULL_FLAG = 'bull_flag'
    BEAR_FLAG = 'bear_flag'
    WEDGE = 'wedge'
    CUP_HANDLE = 'cup_handle'
    ENGULFING = 'engulfing'
    MORNING_EVENING_STAR = 'morning_evening_star'
    THREE_METHODS = 'three_methods'
    HAMMER = 'hammer'
    FLAG = 'flag'

class SignalType(Enum):
    BULLISH = 'bullish'
    BEARISH = 'bearish'
    NEUTRAL = 'neutral'

TIER_PATTERNS = {
    'FREE': [PatternType.DPD, PatternType.UPU, PatternType.HEAD_SHOULDERS],
    'TIER1': [PatternType.UPD, PatternType.DPU, PatternType.DOUBLE_TOP, PatternType.DOUBLE_BOTTOM],
    'TIER2': [
        PatternType.INV_HEAD_SHOULDERS, PatternType.ASCENDING_TRIANGLE,
        PatternType.DESCENDING_TRIANGLE, PatternType.HFZ, PatternType.LFZ,
        PatternType.SYMMETRICAL_TRIANGLE, PatternType.ROUNDING_BOTTOM, PatternType.ROUNDING_TOP
    ],
    'TIER3': [
        PatternType.BULL_FLAG, PatternType.BEAR_FLAG, PatternType.WEDGE,
        PatternType.CUP_HANDLE, PatternType.ENGULFING, PatternType.MORNING_EVENING_STAR,
        PatternType.THREE_METHODS, PatternType.HAMMER, PatternType.FLAG
    ],
}

# ═══════════════════════════════════════════════════════════════════════════
# DATA CLASSES
# ═══════════════════════════════════════════════════════════════════════════

@dataclass
class PatternDetection:
    """A detected pattern."""
    pattern_type: PatternType
    signal_type: SignalType
    confidence: float

    # Location
    start_index: int
    end_index: int

    # Prices
    entry_price: float
    stop_loss: float
    take_profit: float

    # Zone info
    zone_price: Optional[float] = None
    zone_type: Optional[str] = None

    # Pattern data
    pattern_data: Dict[str, Any] = None

    # Features
    features: Optional[PatternFeatures] = None

# ═══════════════════════════════════════════════════════════════════════════
# INDIVIDUAL PATTERN DETECTORS
# ═══════════════════════════════════════════════════════════════════════════

def detect_double_bottom(candles: List[Candle], lookback: int = 50) -> Optional[PatternDetection]:
    """
    Detect Double Bottom pattern.
    Two lows at similar price levels, with a peak in between.
    """
    if len(candles) < lookback:
        return None

    recent = candles[-lookback:]
    lows = [c.low for c in recent]
    highs = [c.high for c in recent]
    closes = [c.close for c in recent]

    # Find two lowest points
    sorted_lows = sorted(enumerate(lows), key=lambda x: x[1])

    if len(sorted_lows) < 2:
        return None

    idx1, low1 = sorted_lows[0]
    idx2, low2 = sorted_lows[1]

    # Ensure they're at least 5 candles apart
    if abs(idx1 - idx2) < 5:
        return None

    # Order chronologically
    if idx1 > idx2:
        idx1, idx2 = idx2, idx1
        low1, low2 = low2, low1

    # Lows should be within 2% of each other
    if abs(low1 - low2) / low1 > 0.02:
        return None

    # Find high between the two lows (neckline)
    high_between = max(highs[idx1:idx2+1])
    neckline = high_between

    # There should be at least 3% bounce from the lows to the neckline
    avg_low = (low1 + low2) / 2
    if (neckline - avg_low) / avg_low < 0.03:
        return None

    # Current price should be near or above neckline
    current_price = closes[-1]
    if current_price < neckline * 0.98:
        return None

    # Calculate targets
    pattern_height = neckline - avg_low
    entry_price = current_price
    stop_loss = avg_low * 0.99
    take_profit = neckline + pattern_height

    # Calculate confidence
    symmetry = 1 - abs(low1 - low2) / avg_low
    height_score = min(1.0, pattern_height / avg_low / 0.05)
    breakout_score = 1.0 if current_price > neckline else 0.5
    confidence = (symmetry * 0.3 + height_score * 0.3 + breakout_score * 0.4)

    return PatternDetection(
        pattern_type=PatternType.DOUBLE_BOTTOM,
        signal_type=SignalType.BULLISH,
        confidence=confidence,
        start_index=len(candles) - lookback + idx1,
        end_index=len(candles) - 1,
        entry_price=entry_price,
        stop_loss=stop_loss,
        take_profit=take_profit,
        zone_price=avg_low,
        zone_type='support',
        pattern_data={
            'low1': low1,
            'low2': low2,
            'neckline': neckline,
            'pattern_height': pattern_height,
        }
    )

def detect_double_top(candles: List[Candle], lookback: int = 50) -> Optional[PatternDetection]:
    """
    Detect Double Top pattern.
    Two highs at similar price levels, with a trough in between.
    """
    if len(candles) < lookback:
        return None

    recent = candles[-lookback:]
    lows = [c.low for c in recent]
    highs = [c.high for c in recent]
    closes = [c.close for c in recent]

    # Find two highest points
    sorted_highs = sorted(enumerate(highs), key=lambda x: x[1], reverse=True)

    if len(sorted_highs) < 2:
        return None

    idx1, high1 = sorted_highs[0]
    idx2, high2 = sorted_highs[1]

    if abs(idx1 - idx2) < 5:
        return None

    if idx1 > idx2:
        idx1, idx2 = idx2, idx1
        high1, high2 = high2, high1

    if abs(high1 - high2) / high1 > 0.02:
        return None

    low_between = min(lows[idx1:idx2+1])
    neckline = low_between

    avg_high = (high1 + high2) / 2
    if (avg_high - neckline) / avg_high < 0.03:
        return None

    current_price = closes[-1]
    if current_price > neckline * 1.02:
        return None

    pattern_height = avg_high - neckline
    entry_price = current_price
    stop_loss = avg_high * 1.01
    take_profit = neckline - pattern_height

    symmetry = 1 - abs(high1 - high2) / avg_high
    height_score = min(1.0, pattern_height / avg_high / 0.05)
    breakdown_score = 1.0 if current_price < neckline else 0.5
    confidence = (symmetry * 0.3 + height_score * 0.3 + breakdown_score * 0.4)

    return PatternDetection(
        pattern_type=PatternType.DOUBLE_TOP,
        signal_type=SignalType.BEARISH,
        confidence=confidence,
        start_index=len(candles) - lookback + idx1,
        end_index=len(candles) - 1,
        entry_price=entry_price,
        stop_loss=stop_loss,
        take_profit=take_profit,
        zone_price=avg_high,
        zone_type='resistance',
        pattern_data={
            'high1': high1,
            'high2': high2,
            'neckline': neckline,
            'pattern_height': pattern_height,
        }
    )

def detect_head_shoulders(candles: List[Candle], lookback: int = 60) -> Optional[PatternDetection]:
    """
    Detect Head and Shoulders pattern.
    Three peaks with middle (head) being highest.
    """
    if len(candles) < lookback:
        return None

    recent = candles[-lookback:]
    highs = [c.high for c in recent]
    lows = [c.low for c in recent]
    closes = [c.close for c in recent]

    # Find peaks (local maxima)
    peaks = []
    for i in range(2, len(highs) - 2):
        if (highs[i] > highs[i-1] and highs[i] > highs[i-2] and
            highs[i] > highs[i+1] and highs[i] > highs[i+2]):
            peaks.append((i, highs[i]))

    if len(peaks) < 3:
        return None

    # Find head (highest peak)
    head_idx = max(range(len(peaks)), key=lambda x: peaks[x][1])

    # Need at least one peak on each side
    if head_idx == 0 or head_idx == len(peaks) - 1:
        return None

    # Get shoulders (peaks adjacent to head)
    left_shoulder = peaks[head_idx - 1]
    head = peaks[head_idx]
    right_shoulder = peaks[head_idx + 1]

    # Head must be higher than shoulders
    if head[1] <= left_shoulder[1] or head[1] <= right_shoulder[1]:
        return None

    # Shoulders should be roughly equal (within 15%)
    shoulder_diff = abs(left_shoulder[1] - right_shoulder[1]) / left_shoulder[1]
    if shoulder_diff > 0.15:
        return None

    # Find neckline (connect lows between peaks)
    left_trough = min(lows[left_shoulder[0]:head[0]])
    right_trough = min(lows[head[0]:right_shoulder[0]+1])
    neckline = (left_trough + right_trough) / 2

    # Current price should be near or below neckline
    current_price = closes[-1]
    if current_price > neckline * 1.02:
        return None

    # Calculate targets
    pattern_height = head[1] - neckline
    entry_price = current_price
    stop_loss = right_shoulder[1] * 1.01
    take_profit = neckline - pattern_height

    # Calculate confidence
    shoulder_symmetry = 1 - shoulder_diff
    head_prominence = (head[1] - (left_shoulder[1] + right_shoulder[1]) / 2) / head[1]
    breakdown_score = 1.0 if current_price < neckline else 0.5
    confidence = (shoulder_symmetry * 0.3 + min(head_prominence * 5, 1.0) * 0.3 + breakdown_score * 0.4)

    return PatternDetection(
        pattern_type=PatternType.HEAD_SHOULDERS,
        signal_type=SignalType.BEARISH,
        confidence=confidence,
        start_index=len(candles) - lookback + left_shoulder[0],
        end_index=len(candles) - 1,
        entry_price=entry_price,
        stop_loss=stop_loss,
        take_profit=take_profit,
        zone_price=neckline,
        zone_type='support',
        pattern_data={
            'left_shoulder': left_shoulder[1],
            'head': head[1],
            'right_shoulder': right_shoulder[1],
            'neckline': neckline,
            'pattern_height': pattern_height,
        }
    )

def detect_upu(candles: List[Candle], lookback: int = 40) -> Optional[PatternDetection]:
    """
    Detect UPU (Up-Pause-Up) pattern.
    GEM proprietary continuation pattern.
    """
    if len(candles) < lookback:
        return None

    recent = candles[-lookback:]
    closes = [c.close for c in recent]

    # Phase 1: Initial up move (first 1/3)
    phase1_end = lookback // 3
    phase1_start_price = closes[0]
    phase1_end_price = max(closes[:phase1_end])
    phase1_move = (phase1_end_price - phase1_start_price) / phase1_start_price

    if phase1_move < 0.02:  # Need at least 2% move
        return None

    # Phase 2: Pause/consolidation (middle 1/3)
    phase2_start = phase1_end
    phase2_end = phase1_end * 2
    phase2_prices = closes[phase2_start:phase2_end]
    phase2_range = (max(phase2_prices) - min(phase2_prices)) / min(phase2_prices)

    if phase2_range > 0.03:  # Consolidation should be tight
        return None

    # Phase 3: Continuation up (last 1/3)
    phase3_prices = closes[phase2_end:]
    if not phase3_prices:
        return None

    current_price = closes[-1]
    phase2_high = max(phase2_prices)

    # Should break above consolidation
    if current_price <= phase2_high:
        return None

    # Calculate targets
    entry_price = current_price
    stop_loss = min(phase2_prices) * 0.99
    take_profit = current_price + (phase1_end_price - phase1_start_price)

    confidence = min(1.0, phase1_move * 10) * 0.5 + (1 - phase2_range * 10) * 0.5

    return PatternDetection(
        pattern_type=PatternType.UPU,
        signal_type=SignalType.BULLISH,
        confidence=confidence,
        start_index=len(candles) - lookback,
        end_index=len(candles) - 1,
        entry_price=entry_price,
        stop_loss=stop_loss,
        take_profit=take_profit,
        zone_price=min(phase2_prices),
        zone_type='support',
        pattern_data={
            'phase1_move': phase1_move,
            'phase2_range': phase2_range,
            'breakout_level': phase2_high,
        }
    )

def detect_dpd(candles: List[Candle], lookback: int = 40) -> Optional[PatternDetection]:
    """
    Detect DPD (Down-Pause-Down) pattern.
    GEM proprietary continuation pattern.
    """
    if len(candles) < lookback:
        return None

    recent = candles[-lookback:]
    closes = [c.close for c in recent]

    # Phase 1: Initial down move
    phase1_end = lookback // 3
    phase1_start_price = closes[0]
    phase1_end_price = min(closes[:phase1_end])
    phase1_move = (phase1_start_price - phase1_end_price) / phase1_start_price

    if phase1_move < 0.02:
        return None

    # Phase 2: Pause
    phase2_start = phase1_end
    phase2_end = phase1_end * 2
    phase2_prices = closes[phase2_start:phase2_end]
    phase2_range = (max(phase2_prices) - min(phase2_prices)) / max(phase2_prices)

    if phase2_range > 0.03:
        return None

    # Phase 3: Continuation down
    current_price = closes[-1]
    phase2_low = min(phase2_prices)

    if current_price >= phase2_low:
        return None

    entry_price = current_price
    stop_loss = max(phase2_prices) * 1.01
    take_profit = current_price - (phase1_start_price - phase1_end_price)

    confidence = min(1.0, phase1_move * 10) * 0.5 + (1 - phase2_range * 10) * 0.5

    return PatternDetection(
        pattern_type=PatternType.DPD,
        signal_type=SignalType.BEARISH,
        confidence=confidence,
        start_index=len(candles) - lookback,
        end_index=len(candles) - 1,
        entry_price=entry_price,
        stop_loss=stop_loss,
        take_profit=take_profit,
        zone_price=max(phase2_prices),
        zone_type='resistance',
        pattern_data={
            'phase1_move': phase1_move,
            'phase2_range': phase2_range,
            'breakdown_level': phase2_low,
        }
    )

def detect_hfz(candles: List[Candle], lookback: int = 100) -> Optional[PatternDetection]:
    """
    Detect HFZ (High Frequency Zone) - Support zone with multiple touches.
    """
    if len(candles) < lookback:
        return None

    recent = candles[-lookback:]
    lows = [c.low for c in recent]
    closes = [c.close for c in recent]
    current_price = closes[-1]

    # Find potential support zones
    zone_tolerance = current_price * 0.015  # 1.5% zone width

    # Count touches at various levels
    test_levels = np.linspace(min(lows), max(lows), 20)
    best_zone = None
    best_touches = 0

    for level in test_levels:
        touches = sum(1 for low in lows if abs(low - level) < zone_tolerance)
        if touches > best_touches and touches >= 3:
            best_touches = touches
            best_zone = level

    if best_zone is None:
        return None

    # Current price should be near the zone (within 3%)
    if abs(current_price - best_zone) / current_price > 0.03:
        return None

    # Price should be above zone (bouncing)
    if current_price < best_zone:
        return None

    entry_price = current_price
    stop_loss = best_zone * 0.98
    take_profit = current_price + (current_price - best_zone) * 2.5

    confidence = min(1.0, best_touches / 5)

    return PatternDetection(
        pattern_type=PatternType.HFZ,
        signal_type=SignalType.BULLISH,
        confidence=confidence,
        start_index=len(candles) - lookback,
        end_index=len(candles) - 1,
        entry_price=entry_price,
        stop_loss=stop_loss,
        take_profit=take_profit,
        zone_price=best_zone,
        zone_type='support',
        pattern_data={
            'zone_level': best_zone,
            'touch_count': best_touches,
            'zone_width': zone_tolerance,
        }
    )

def detect_lfz(candles: List[Candle], lookback: int = 100) -> Optional[PatternDetection]:
    """
    Detect LFZ (Low Frequency Zone) - Resistance zone with multiple touches.
    """
    if len(candles) < lookback:
        return None

    recent = candles[-lookback:]
    highs = [c.high for c in recent]
    closes = [c.close for c in recent]
    current_price = closes[-1]

    zone_tolerance = current_price * 0.015

    test_levels = np.linspace(min(highs), max(highs), 20)
    best_zone = None
    best_touches = 0

    for level in test_levels:
        touches = sum(1 for high in highs if abs(high - level) < zone_tolerance)
        if touches > best_touches and touches >= 3:
            best_touches = touches
            best_zone = level

    if best_zone is None:
        return None

    if abs(current_price - best_zone) / current_price > 0.03:
        return None

    if current_price > best_zone:
        return None

    entry_price = current_price
    stop_loss = best_zone * 1.02
    take_profit = current_price - (best_zone - current_price) * 2.5

    confidence = min(1.0, best_touches / 5)

    return PatternDetection(
        pattern_type=PatternType.LFZ,
        signal_type=SignalType.BEARISH,
        confidence=confidence,
        start_index=len(candles) - lookback,
        end_index=len(candles) - 1,
        entry_price=entry_price,
        stop_loss=stop_loss,
        take_profit=take_profit,
        zone_price=best_zone,
        zone_type='resistance',
        pattern_data={
            'zone_level': best_zone,
            'touch_count': best_touches,
            'zone_width': zone_tolerance,
        }
    )

def detect_bull_flag(candles: List[Candle], lookback: int = 40) -> Optional[PatternDetection]:
    """
    Detect Bull Flag pattern.
    Strong upward move (pole) followed by slight downward consolidation (flag).
    """
    if len(candles) < lookback:
        return None

    recent = candles[-lookback:]
    closes = [c.close for c in recent]
    highs = [c.high for c in recent]
    lows = [c.low for c in recent]

    # Find the pole (strong up move in first half)
    pole_end = lookback // 2
    pole_start_price = min(lows[:pole_end])
    pole_end_price = max(highs[:pole_end])
    pole_move = (pole_end_price - pole_start_price) / pole_start_price

    if pole_move < 0.05:  # Need at least 5% pole
        return None

    # Flag should retrace no more than 38.2% of pole
    flag_prices = closes[pole_end:]
    flag_low = min(flag_prices)
    max_retrace = pole_start_price + (pole_end_price - pole_start_price) * 0.618

    if flag_low < max_retrace:
        return None

    # Current price should be breaking out of flag
    current_price = closes[-1]
    flag_high = max(highs[pole_end:])

    if current_price < flag_high * 0.98:
        return None

    entry_price = current_price
    stop_loss = flag_low * 0.99
    take_profit = current_price + (pole_end_price - pole_start_price)

    retrace_pct = (pole_end_price - flag_low) / (pole_end_price - pole_start_price)
    confidence = min(1.0, pole_move * 5) * 0.5 + (1 - retrace_pct) * 0.5

    return PatternDetection(
        pattern_type=PatternType.BULL_FLAG,
        signal_type=SignalType.BULLISH,
        confidence=confidence,
        start_index=len(candles) - lookback,
        end_index=len(candles) - 1,
        entry_price=entry_price,
        stop_loss=stop_loss,
        take_profit=take_profit,
        zone_price=flag_low,
        zone_type='support',
        pattern_data={
            'pole_height': pole_end_price - pole_start_price,
            'pole_percent': pole_move,
            'retrace_percent': retrace_pct,
        }
    )

def detect_bear_flag(candles: List[Candle], lookback: int = 40) -> Optional[PatternDetection]:
    """
    Detect Bear Flag pattern.
    """
    if len(candles) < lookback:
        return None

    recent = candles[-lookback:]
    closes = [c.close for c in recent]
    highs = [c.high for c in recent]
    lows = [c.low for c in recent]

    pole_end = lookback // 2
    pole_start_price = max(highs[:pole_end])
    pole_end_price = min(lows[:pole_end])
    pole_move = (pole_start_price - pole_end_price) / pole_start_price

    if pole_move < 0.05:
        return None

    flag_prices = closes[pole_end:]
    flag_high = max(flag_prices)
    max_retrace = pole_start_price - (pole_start_price - pole_end_price) * 0.618

    if flag_high > max_retrace:
        return None

    current_price = closes[-1]
    flag_low = min(lows[pole_end:])

    if current_price > flag_low * 1.02:
        return None

    entry_price = current_price
    stop_loss = flag_high * 1.01
    take_profit = current_price - (pole_start_price - pole_end_price)

    retrace_pct = (flag_high - pole_end_price) / (pole_start_price - pole_end_price)
    confidence = min(1.0, pole_move * 5) * 0.5 + (1 - retrace_pct) * 0.5

    return PatternDetection(
        pattern_type=PatternType.BEAR_FLAG,
        signal_type=SignalType.BEARISH,
        confidence=confidence,
        start_index=len(candles) - lookback,
        end_index=len(candles) - 1,
        entry_price=entry_price,
        stop_loss=stop_loss,
        take_profit=take_profit,
        zone_price=flag_high,
        zone_type='resistance',
        pattern_data={
            'pole_height': pole_start_price - pole_end_price,
            'pole_percent': pole_move,
            'retrace_percent': retrace_pct,
        }
    )

# ═══════════════════════════════════════════════════════════════════════════
# PATTERN DETECTION ENGINE
# ═══════════════════════════════════════════════════════════════════════════

class PatternDetectionEngine:
    """Main pattern detection engine."""

    def __init__(self, user_tier: str = 'FREE'):
        self.user_tier = user_tier
        self.available_patterns = self._get_available_patterns()

        # Pattern detector functions
        self.detectors = {
            PatternType.DOUBLE_BOTTOM: detect_double_bottom,
            PatternType.DOUBLE_TOP: detect_double_top,
            PatternType.HEAD_SHOULDERS: detect_head_shoulders,
            PatternType.UPU: detect_upu,
            PatternType.DPD: detect_dpd,
            PatternType.HFZ: detect_hfz,
            PatternType.LFZ: detect_lfz,
            PatternType.BULL_FLAG: detect_bull_flag,
            PatternType.BEAR_FLAG: detect_bear_flag,
        }

    def _get_available_patterns(self) -> List[PatternType]:
        """Get patterns available for user's tier."""
        patterns = []
        tier_order = ['FREE', 'TIER1', 'TIER2', 'TIER3']

        user_tier_idx = tier_order.index(self.user_tier) if self.user_tier in tier_order else 0

        for i, tier in enumerate(tier_order):
            if i <= user_tier_idx:
                patterns.extend(TIER_PATTERNS[tier])

        return patterns

    def detect_all(
        self,
        candles: List[Candle],
        min_confidence: float = 0.5,
        require_zone_retest: bool = True
    ) -> List[PatternDetection]:
        """
        Detect all patterns in candles.

        Args:
            candles: List of candles
            min_confidence: Minimum confidence threshold
            require_zone_retest: Whether to require zone retest (KEY for win rate)

        Returns:
            List of detected patterns
        """
        if len(candles) < 200:
            print('[PatternEngine] Need at least 200 candles')
            return []

        detections = []

        for pattern_type in self.available_patterns:
            if pattern_type not in self.detectors:
                continue

            detector = self.detectors[pattern_type]

            try:
                detection = detector(candles)

                if detection is None:
                    continue

                if detection.confidence < min_confidence:
                    continue

                # Extract features and check zone retest
                if detection.zone_price and detection.zone_type:
                    try:
                        features = extract_features(
                            candles,
                            detection.start_index,
                            detection.end_index,
                            detection.zone_price,
                            detection.zone_type
                        )
                        detection.features = features

                        # Check zone retest requirement (KEY for win rate)
                        if require_zone_retest and not features.has_zone_retest:
                            continue

                        # Update confidence with features
                        detection.confidence = (detection.confidence + features.overall_score) / 2

                    except Exception as e:
                        print(f'[PatternEngine] Feature extraction error: {e}')

                detections.append(detection)

            except Exception as e:
                print(f'[PatternEngine] Error detecting {pattern_type.value}: {e}')

        # Sort by confidence
        detections.sort(key=lambda x: x.confidence, reverse=True)

        return detections

    def detect_pattern(
        self,
        candles: List[Candle],
        pattern_type: PatternType
    ) -> Optional[PatternDetection]:
        """Detect a specific pattern."""
        if pattern_type not in self.detectors:
            return None

        return self.detectors[pattern_type](candles)

# ═══════════════════════════════════════════════════════════════════════════
# FILTER ENGINE
# ═══════════════════════════════════════════════════════════════════════════

class FilterEngine:
    """Apply filters to pattern detections."""

    def __init__(self, filters: List[Dict[str, Any]] = None):
        self.filters = filters or []

    def apply_filters(
        self,
        detection: PatternDetection,
        candles: List[Candle]
    ) -> Tuple[bool, float]:
        """
        Apply filters to a detection.

        Returns:
            (passed, adjusted_score)
        """
        if not detection.features:
            return True, detection.confidence

        features = detection.features
        score = detection.confidence

        for f in self.filters:
            filter_type = f.get('filter_type')
            conditions = f.get('conditions', {})

            if filter_type == 'volume':
                vol_min = conditions.get('volume_ratio_min')
                if vol_min and features.volume_breakout_ratio < vol_min:
                    return False, 0.0
                score += 0.05  # Bonus for passing

            elif filter_type == 'zone_retest':
                if conditions.get('require_zone_retest') and not features.has_zone_retest:
                    return False, 0.0
                if features.has_zone_retest:
                    score += 0.15  # Big bonus for zone retest

            elif filter_type == 'pattern_quality':
                quality_min = conditions.get('pattern_quality_min')
                if quality_min and features.pattern_quality_score < quality_min:
                    return False, 0.0

            elif filter_type == 'trend':
                strength_min = conditions.get('trend_strength_min')
                if strength_min and features.trend_strength < strength_min:
                    return False, 0.0

            elif filter_type == 'momentum':
                rsi_min = conditions.get('rsi_min')
                rsi_max = conditions.get('rsi_max')
                if rsi_min and features.rsi_value < rsi_min:
                    return False, 0.0
                if rsi_max and features.rsi_value > rsi_max:
                    return False, 0.0

        return True, min(1.0, score)

# ═══════════════════════════════════════════════════════════════════════════
# EXPORT
# ═══════════════════════════════════════════════════════════════════════════

__all__ = [
    'PatternType',
    'SignalType',
    'PatternDetection',
    'PatternDetectionEngine',
    'FilterEngine',
    'TIER_PATTERNS',
    'detect_double_bottom',
    'detect_double_top',
    'detect_head_shoulders',
    'detect_upu',
    'detect_dpd',
    'detect_hfz',
    'detect_lfz',
    'detect_bull_flag',
    'detect_bear_flag',
]

if __name__ == '__main__':
    print('Pattern Detection Engine loaded')
    print(f'Total patterns: {len(PatternType)}')

    for tier, patterns in TIER_PATTERNS.items():
        print(f'{tier}: {[p.value for p in patterns]}')
