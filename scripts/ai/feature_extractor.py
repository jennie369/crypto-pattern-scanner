# scripts/ai/feature_extractor.py
# Feature extraction for pattern detection AI
# GEMRAL AI BRAIN - Phase 6

import numpy as np
from typing import List, Dict, Any, Optional, Tuple
from dataclasses import dataclass
from enum import Enum

# ═══════════════════════════════════════════════════════════════════════════
# CONFIGURATION
# ═══════════════════════════════════════════════════════════════════════════

EMA_PERIODS = [20, 50, 200]
RSI_PERIOD = 14
ATR_PERIOD = 14
MACD_FAST = 12
MACD_SLOW = 26
MACD_SIGNAL = 9

# ═══════════════════════════════════════════════════════════════════════════
# DATA CLASSES
# ═══════════════════════════════════════════════════════════════════════════

@dataclass
class Candle:
    """Single candlestick data."""
    timestamp: int
    open: float
    high: float
    low: float
    close: float
    volume: float

@dataclass
class PatternFeatures:
    """Extracted features for a pattern."""
    # Price features
    price_change_percent: float
    volatility_atr: float
    volatility_ratio: float

    # Volume features
    volume_avg: float
    volume_breakout_ratio: float
    volume_trend: str  # 'increasing', 'decreasing', 'flat'

    # Pattern structure
    pattern_duration_candles: int
    pattern_height_percent: float
    pattern_symmetry_score: float
    touch_count_support: int
    touch_count_resistance: int

    # Trend context
    trend_direction: str  # 'up', 'down', 'sideways'
    trend_strength: float
    ema_20_position: str
    ema_50_position: str
    ema_200_position: str

    # Support/Resistance
    distance_to_sr_percent: float
    sr_strength: int

    # Momentum
    rsi_value: float
    rsi_divergence: str  # 'bullish', 'bearish', 'none'
    macd_histogram: float
    macd_signal: str

    # Time features
    hour_of_day: int
    day_of_week: int
    is_weekend: bool

    # Zone Retest (CRITICAL)
    has_zone_retest: bool
    retest_candles_ago: int
    retest_quality_score: float

    # Computed scores
    pattern_quality_score: float
    entry_timing_score: float
    risk_reward_score: float
    overall_score: float

# ═══════════════════════════════════════════════════════════════════════════
# TECHNICAL INDICATORS
# ═══════════════════════════════════════════════════════════════════════════

def calculate_ema(prices: List[float], period: int) -> List[float]:
    """Calculate Exponential Moving Average."""
    if len(prices) < period:
        return [prices[0]] * len(prices) if prices else []

    multiplier = 2 / (period + 1)
    ema = [sum(prices[:period]) / period]

    for price in prices[period:]:
        ema.append((price - ema[-1]) * multiplier + ema[-1])

    # Pad beginning with first EMA value
    return [ema[0]] * (period - 1) + ema

def calculate_rsi(prices: List[float], period: int = RSI_PERIOD) -> List[float]:
    """Calculate Relative Strength Index."""
    if len(prices) < period + 1:
        return [50.0] * len(prices)

    deltas = [prices[i] - prices[i-1] for i in range(1, len(prices))]
    gains = [d if d > 0 else 0 for d in deltas]
    losses = [-d if d < 0 else 0 for d in deltas]

    avg_gain = sum(gains[:period]) / period
    avg_loss = sum(losses[:period]) / period

    rsi_values = [50.0] * period  # Pad beginning

    for i in range(period, len(deltas)):
        avg_gain = (avg_gain * (period - 1) + gains[i]) / period
        avg_loss = (avg_loss * (period - 1) + losses[i]) / period

        if avg_loss == 0:
            rsi_values.append(100.0)
        else:
            rs = avg_gain / avg_loss
            rsi_values.append(100 - (100 / (1 + rs)))

    return [rsi_values[0]] + rsi_values  # Account for first delta

def calculate_atr(candles: List[Candle], period: int = ATR_PERIOD) -> List[float]:
    """Calculate Average True Range."""
    if len(candles) < 2:
        return [0.0] * len(candles)

    true_ranges = [candles[0].high - candles[0].low]

    for i in range(1, len(candles)):
        c = candles[i]
        prev_close = candles[i-1].close
        tr = max(
            c.high - c.low,
            abs(c.high - prev_close),
            abs(c.low - prev_close)
        )
        true_ranges.append(tr)

    # Simple moving average of true ranges
    atr = []
    for i in range(len(true_ranges)):
        if i < period:
            atr.append(sum(true_ranges[:i+1]) / (i + 1))
        else:
            atr.append(sum(true_ranges[i-period+1:i+1]) / period)

    return atr

def calculate_macd(prices: List[float]) -> Tuple[List[float], List[float], List[float]]:
    """Calculate MACD, Signal line, and Histogram."""
    ema_fast = calculate_ema(prices, MACD_FAST)
    ema_slow = calculate_ema(prices, MACD_SLOW)

    macd_line = [f - s for f, s in zip(ema_fast, ema_slow)]
    signal_line = calculate_ema(macd_line, MACD_SIGNAL)
    histogram = [m - s for m, s in zip(macd_line, signal_line)]

    return macd_line, signal_line, histogram

# ═══════════════════════════════════════════════════════════════════════════
# TIER2+ ENHANCEMENT FEATURES
# ═══════════════════════════════════════════════════════════════════════════

def volume_confirmation(
    candles: List[Candle],
    breakout_index: int,
    lookback: int = 20
) -> Dict[str, Any]:
    """
    Check volume confirmation for breakout.
    KEY: Breakout with volume > 1.5x avg is more reliable.
    """
    if breakout_index < lookback or breakout_index >= len(candles):
        return {
            'volume_ratio': 1.0,
            'volume_trend': 'flat',
            'is_confirmed': False
        }

    # Calculate average volume before breakout
    avg_volume = sum(c.volume for c in candles[breakout_index-lookback:breakout_index]) / lookback
    breakout_volume = candles[breakout_index].volume

    ratio = breakout_volume / avg_volume if avg_volume > 0 else 1.0

    # Determine volume trend
    recent_volumes = [c.volume for c in candles[breakout_index-5:breakout_index]]
    if len(recent_volumes) >= 3:
        if recent_volumes[-1] > recent_volumes[0] * 1.2:
            trend = 'increasing'
        elif recent_volumes[-1] < recent_volumes[0] * 0.8:
            trend = 'decreasing'
        else:
            trend = 'flat'
    else:
        trend = 'flat'

    return {
        'volume_ratio': ratio,
        'volume_trend': trend,
        'is_confirmed': ratio >= 1.2
    }

def trend_context(
    candles: List[Candle],
    current_index: int
) -> Dict[str, Any]:
    """
    Analyze trend context using EMAs.
    """
    if current_index < 200:
        return {
            'direction': 'sideways',
            'strength': 0.5,
            'ema_20_position': 'crossing',
            'ema_50_position': 'crossing',
            'ema_200_position': 'crossing'
        }

    prices = [c.close for c in candles[:current_index+1]]
    current_price = prices[-1]

    ema_20 = calculate_ema(prices, 20)[-1]
    ema_50 = calculate_ema(prices, 50)[-1]
    ema_200 = calculate_ema(prices, 200)[-1]

    # Determine trend direction
    if current_price > ema_20 > ema_50 > ema_200:
        direction = 'up'
        strength = min(1.0, (current_price - ema_200) / ema_200 * 10)
    elif current_price < ema_20 < ema_50 < ema_200:
        direction = 'down'
        strength = min(1.0, (ema_200 - current_price) / ema_200 * 10)
    else:
        direction = 'sideways'
        strength = 0.3

    # EMA positions
    def get_position(price, ema):
        diff_pct = (price - ema) / ema * 100
        if diff_pct > 1:
            return 'above'
        elif diff_pct < -1:
            return 'below'
        return 'crossing'

    return {
        'direction': direction,
        'strength': strength,
        'ema_20_position': get_position(current_price, ema_20),
        'ema_50_position': get_position(current_price, ema_50),
        'ema_200_position': get_position(current_price, ema_200)
    }

def zone_retest_validation(
    candles: List[Candle],
    zone_price: float,
    zone_type: str,  # 'support' or 'resistance'
    breakout_index: int,
    max_candles: int = 20
) -> Dict[str, Any]:
    """
    Validate zone retest after breakout.
    THIS IS THE KEY to improving win rate from 38% to 68%+!

    A valid retest:
    1. Price breaks through zone
    2. Price comes back to touch zone
    3. Zone holds (old support = new resistance, or vice versa)
    4. Confirmation candle forms
    """
    if breakout_index >= len(candles) - 1:
        return {
            'has_retest': False,
            'retest_candles_ago': 0,
            'retest_quality': 0.0
        }

    zone_tolerance = zone_price * 0.005  # 0.5% tolerance

    retest_index = None
    retest_quality = 0.0

    for i in range(breakout_index + 1, min(len(candles), breakout_index + max_candles)):
        c = candles[i]

        if zone_type == 'support':
            # After break below support, price should come back UP to test it as resistance
            if c.high >= zone_price - zone_tolerance and c.high <= zone_price + zone_tolerance:
                # Check if rejected (closed below zone)
                if c.close < zone_price:
                    retest_index = i
                    # Calculate quality based on precision and rejection strength
                    precision = 1 - abs(c.high - zone_price) / zone_tolerance
                    rejection = (c.high - c.close) / (c.high - c.low) if c.high != c.low else 0.5
                    retest_quality = (precision + rejection) / 2
                    break

        else:  # resistance
            # After break above resistance, price should come back DOWN to test it as support
            if c.low <= zone_price + zone_tolerance and c.low >= zone_price - zone_tolerance:
                # Check if bounced (closed above zone)
                if c.close > zone_price:
                    retest_index = i
                    precision = 1 - abs(c.low - zone_price) / zone_tolerance
                    bounce = (c.close - c.low) / (c.high - c.low) if c.high != c.low else 0.5
                    retest_quality = (precision + bounce) / 2
                    break

    return {
        'has_retest': retest_index is not None,
        'retest_candles_ago': len(candles) - retest_index if retest_index else 0,
        'retest_quality': retest_quality
    }

def support_resistance_confluence(
    candles: List[Candle],
    current_price: float,
    lookback: int = 100
) -> Dict[str, Any]:
    """
    Find nearby support/resistance levels and their strength.
    """
    if len(candles) < lookback:
        lookback = len(candles)

    recent_candles = candles[-lookback:]

    # Find pivot highs and lows
    pivot_highs = []
    pivot_lows = []

    for i in range(2, len(recent_candles) - 2):
        c = recent_candles[i]
        # Pivot high
        if (c.high > recent_candles[i-1].high and
            c.high > recent_candles[i-2].high and
            c.high > recent_candles[i+1].high and
            c.high > recent_candles[i+2].high):
            pivot_highs.append(c.high)
        # Pivot low
        if (c.low < recent_candles[i-1].low and
            c.low < recent_candles[i-2].low and
            c.low < recent_candles[i+1].low and
            c.low < recent_candles[i+2].low):
            pivot_lows.append(c.low)

    # Find nearest S/R
    nearest_support = None
    nearest_resistance = None
    support_strength = 0
    resistance_strength = 0

    tolerance = current_price * 0.02  # 2% tolerance

    for low in pivot_lows:
        if low < current_price:
            if nearest_support is None or low > nearest_support:
                nearest_support = low
            # Count touches
            touches = sum(1 for c in recent_candles if abs(c.low - low) < tolerance)
            if touches > support_strength:
                support_strength = touches

    for high in pivot_highs:
        if high > current_price:
            if nearest_resistance is None or high < nearest_resistance:
                nearest_resistance = high
            touches = sum(1 for c in recent_candles if abs(c.high - high) < tolerance)
            if touches > resistance_strength:
                resistance_strength = touches

    distance_to_support = ((current_price - nearest_support) / current_price * 100) if nearest_support else 100
    distance_to_resistance = ((nearest_resistance - current_price) / current_price * 100) if nearest_resistance else 100

    return {
        'nearest_support': nearest_support,
        'nearest_resistance': nearest_resistance,
        'distance_to_support_percent': distance_to_support,
        'distance_to_resistance_percent': distance_to_resistance,
        'support_strength': support_strength,
        'resistance_strength': resistance_strength
    }

def rsi_divergence_check(
    candles: List[Candle],
    lookback: int = 20
) -> str:
    """
    Check for RSI divergence.
    Bullish: Price makes lower low, RSI makes higher low
    Bearish: Price makes higher high, RSI makes lower high
    """
    if len(candles) < lookback + RSI_PERIOD:
        return 'none'

    prices = [c.close for c in candles]
    rsi_values = calculate_rsi(prices)

    recent_prices = prices[-lookback:]
    recent_rsi = rsi_values[-lookback:]

    # Find local extremes
    price_lows = []
    price_highs = []
    rsi_lows = []
    rsi_highs = []

    for i in range(2, len(recent_prices) - 2):
        # Price lows
        if (recent_prices[i] < recent_prices[i-1] and
            recent_prices[i] < recent_prices[i-2] and
            recent_prices[i] < recent_prices[i+1] and
            recent_prices[i] < recent_prices[i+2]):
            price_lows.append((i, recent_prices[i]))
            rsi_lows.append((i, recent_rsi[i]))
        # Price highs
        if (recent_prices[i] > recent_prices[i-1] and
            recent_prices[i] > recent_prices[i-2] and
            recent_prices[i] > recent_prices[i+1] and
            recent_prices[i] > recent_prices[i+2]):
            price_highs.append((i, recent_prices[i]))
            rsi_highs.append((i, recent_rsi[i]))

    # Check bullish divergence (price lower low, RSI higher low)
    if len(price_lows) >= 2 and len(rsi_lows) >= 2:
        if price_lows[-1][1] < price_lows[-2][1] and rsi_lows[-1][1] > rsi_lows[-2][1]:
            return 'bullish'

    # Check bearish divergence (price higher high, RSI lower high)
    if len(price_highs) >= 2 and len(rsi_highs) >= 2:
        if price_highs[-1][1] > price_highs[-2][1] and rsi_highs[-1][1] < rsi_highs[-2][1]:
            return 'bearish'

    return 'none'

def dynamic_rr_optimization(
    entry_price: float,
    stop_loss: float,
    candles: List[Candle],
    signal_type: str  # 'bullish' or 'bearish'
) -> Dict[str, float]:
    """
    Calculate optimal take profit levels based on S/R and ATR.
    """
    atr_values = calculate_atr(candles)
    current_atr = atr_values[-1] if atr_values else entry_price * 0.02

    risk = abs(entry_price - stop_loss)

    # Find S/R levels
    sr_info = support_resistance_confluence(candles, entry_price)

    # Calculate take profit levels
    if signal_type == 'bullish':
        tp1 = entry_price + risk * 1.5
        tp2 = entry_price + risk * 2.5
        tp3 = entry_price + risk * 4.0

        # Adjust to nearby resistance
        if sr_info['nearest_resistance']:
            if sr_info['nearest_resistance'] < tp1:
                tp1 = sr_info['nearest_resistance'] * 0.995
    else:
        tp1 = entry_price - risk * 1.5
        tp2 = entry_price - risk * 2.5
        tp3 = entry_price - risk * 4.0

        # Adjust to nearby support
        if sr_info['nearest_support']:
            if sr_info['nearest_support'] > tp1:
                tp1 = sr_info['nearest_support'] * 1.005

    return {
        'tp1': tp1,
        'tp2': tp2,
        'tp3': tp3,
        'risk': risk,
        'rr_ratio_tp1': 1.5,
        'rr_ratio_tp2': 2.5,
        'rr_ratio_tp3': 4.0
    }

def calculate_quality_grade(features: PatternFeatures) -> str:
    """
    Calculate overall quality grade (A, B, C, D, F).
    """
    score = features.overall_score

    if score >= 0.8:
        return 'A'
    elif score >= 0.65:
        return 'B'
    elif score >= 0.5:
        return 'C'
    elif score >= 0.35:
        return 'D'
    else:
        return 'F'

# ═══════════════════════════════════════════════════════════════════════════
# MAIN FEATURE EXTRACTION
# ═══════════════════════════════════════════════════════════════════════════

def extract_features(
    candles: List[Candle],
    pattern_start: int,
    pattern_end: int,
    zone_price: Optional[float] = None,
    zone_type: Optional[str] = None
) -> PatternFeatures:
    """
    Extract all features for a detected pattern.
    """
    from datetime import datetime

    if len(candles) < 200:
        raise ValueError("Need at least 200 candles for feature extraction")

    current_candle = candles[pattern_end]
    prices = [c.close for c in candles[:pattern_end+1]]

    # Price features
    price_change = (current_candle.close - candles[pattern_start].close) / candles[pattern_start].close * 100

    atr_values = calculate_atr(candles[:pattern_end+1])
    current_atr = atr_values[-1]
    avg_atr = sum(atr_values[-20:]) / 20 if len(atr_values) >= 20 else current_atr
    volatility_ratio = current_atr / avg_atr if avg_atr > 0 else 1.0

    # Volume features
    vol_info = volume_confirmation(candles, pattern_end)

    # Pattern structure
    pattern_duration = pattern_end - pattern_start
    pattern_high = max(c.high for c in candles[pattern_start:pattern_end+1])
    pattern_low = min(c.low for c in candles[pattern_start:pattern_end+1])
    pattern_height = (pattern_high - pattern_low) / pattern_low * 100

    # Trend context
    trend_info = trend_context(candles, pattern_end)

    # S/R
    sr_info = support_resistance_confluence(candles[:pattern_end+1], current_candle.close)

    # Momentum
    rsi_values = calculate_rsi(prices)
    current_rsi = rsi_values[-1]
    divergence = rsi_divergence_check(candles[:pattern_end+1])

    macd_line, signal_line, histogram = calculate_macd(prices)
    current_histogram = histogram[-1]
    macd_sig = 'none'
    if len(histogram) >= 2:
        if histogram[-1] > 0 and histogram[-2] <= 0:
            macd_sig = 'bullish_cross'
        elif histogram[-1] < 0 and histogram[-2] >= 0:
            macd_sig = 'bearish_cross'

    # Time features
    dt = datetime.fromtimestamp(current_candle.timestamp / 1000)

    # Zone Retest (CRITICAL)
    retest_info = {'has_retest': False, 'retest_candles_ago': 0, 'retest_quality': 0.0}
    if zone_price and zone_type:
        retest_info = zone_retest_validation(candles, zone_price, zone_type, pattern_end)

    # Calculate scores
    pattern_quality = calculate_pattern_quality_score(
        vol_info, trend_info, sr_info, pattern_height, pattern_duration
    )
    entry_timing = calculate_entry_timing_score(current_rsi, divergence, macd_sig)
    rr_score = calculate_rr_score(sr_info, trend_info)

    # Overall score with Zone Retest bonus
    overall = (pattern_quality * 0.4 + entry_timing * 0.3 + rr_score * 0.3)
    if retest_info['has_retest']:
        overall = min(1.0, overall + retest_info['retest_quality'] * 0.15)

    return PatternFeatures(
        price_change_percent=price_change,
        volatility_atr=current_atr,
        volatility_ratio=volatility_ratio,
        volume_avg=vol_info.get('volume_avg', 0),
        volume_breakout_ratio=vol_info['volume_ratio'],
        volume_trend=vol_info['volume_trend'],
        pattern_duration_candles=pattern_duration,
        pattern_height_percent=pattern_height,
        pattern_symmetry_score=0.7,  # Placeholder
        touch_count_support=sr_info['support_strength'],
        touch_count_resistance=sr_info['resistance_strength'],
        trend_direction=trend_info['direction'],
        trend_strength=trend_info['strength'],
        ema_20_position=trend_info['ema_20_position'],
        ema_50_position=trend_info['ema_50_position'],
        ema_200_position=trend_info['ema_200_position'],
        distance_to_sr_percent=min(
            sr_info['distance_to_support_percent'],
            sr_info['distance_to_resistance_percent']
        ),
        sr_strength=max(sr_info['support_strength'], sr_info['resistance_strength']),
        rsi_value=current_rsi,
        rsi_divergence=divergence,
        macd_histogram=current_histogram,
        macd_signal=macd_sig,
        hour_of_day=dt.hour,
        day_of_week=dt.weekday(),
        is_weekend=dt.weekday() >= 5,
        has_zone_retest=retest_info['has_retest'],
        retest_candles_ago=retest_info['retest_candles_ago'],
        retest_quality_score=retest_info['retest_quality'],
        pattern_quality_score=pattern_quality,
        entry_timing_score=entry_timing,
        risk_reward_score=rr_score,
        overall_score=overall
    )

def calculate_pattern_quality_score(
    vol_info: Dict,
    trend_info: Dict,
    sr_info: Dict,
    pattern_height: float,
    pattern_duration: int
) -> float:
    """Calculate pattern quality score (0-1)."""
    score = 0.5

    # Volume bonus
    if vol_info['volume_ratio'] >= 1.5:
        score += 0.15
    elif vol_info['volume_ratio'] >= 1.2:
        score += 0.1

    # Trend alignment bonus
    score += trend_info['strength'] * 0.2

    # S/R strength bonus
    if sr_info['support_strength'] >= 3 or sr_info['resistance_strength'] >= 3:
        score += 0.1

    # Pattern structure
    if 5 <= pattern_duration <= 20:
        score += 0.05
    if 3 <= pattern_height <= 15:
        score += 0.05

    return min(1.0, max(0.0, score))

def calculate_entry_timing_score(
    rsi: float,
    divergence: str,
    macd_signal: str
) -> float:
    """Calculate entry timing score (0-1)."""
    score = 0.5

    # RSI position
    if 30 <= rsi <= 70:
        score += 0.1
    if rsi < 30 or rsi > 70:
        score += 0.05  # Oversold/overbought can be good for reversals

    # Divergence bonus
    if divergence != 'none':
        score += 0.2

    # MACD signal
    if macd_signal != 'none':
        score += 0.15

    return min(1.0, max(0.0, score))

def calculate_rr_score(
    sr_info: Dict,
    trend_info: Dict
) -> float:
    """Calculate risk/reward score (0-1)."""
    score = 0.5

    # Good R:R if S/R is far enough
    if sr_info['distance_to_resistance_percent'] > 3:
        score += 0.2
    if sr_info['distance_to_support_percent'] > 3:
        score += 0.1

    # Trend bonus for R:R
    if trend_info['strength'] > 0.6:
        score += 0.15

    return min(1.0, max(0.0, score))

# ═══════════════════════════════════════════════════════════════════════════
# EXPORT
# ═══════════════════════════════════════════════════════════════════════════

__all__ = [
    'Candle',
    'PatternFeatures',
    'extract_features',
    'calculate_ema',
    'calculate_rsi',
    'calculate_atr',
    'calculate_macd',
    'volume_confirmation',
    'trend_context',
    'zone_retest_validation',
    'support_resistance_confluence',
    'rsi_divergence_check',
    'dynamic_rr_optimization',
    'calculate_quality_grade',
]
