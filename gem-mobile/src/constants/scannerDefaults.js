/**
 * =====================================================
 * File: src/constants/scannerDefaults.js
 * Description: Default configuration values for Scanner Upgrade V2
 * Version: 3.1
 * =====================================================
 */

/**
 * Volume Validation Thresholds
 * Defines volume ratio thresholds for pattern validation
 */
export const VOLUME_THRESHOLDS = {
  STRONG: 2.0,      // Volume >= 2x average → +20 confidence
  GOOD: 1.5,        // Volume >= 1.5x → +15 confidence
  ACCEPTABLE: 1.2,  // Volume >= 1.2x → +10 confidence
  MINIMUM: 1.0,     // Volume >= 1x → +5 confidence
  REJECT: 0.8,      // Volume < 0.8x → REJECT pattern
};

/**
 * Volume Score Mapping
 */
export const VOLUME_SCORES = {
  STRONG: 20,
  GOOD: 15,
  ACCEPTABLE: 10,
  MINIMUM: 5,
  WEAK: 0,
  REJECT: -10,
};

/**
 * Zone Retest Configuration
 */
export const ZONE_RETEST_CONFIG = {
  LOOKBACK_CANDLES: 5,        // Candles to look back for retest
  TOLERANCE_PERCENT: 0.1,     // 10% zone height tolerance

  STRENGTH: {
    STRONG: 'STRONG',         // Full zone penetration + bounce
    MEDIUM: 'MEDIUM',         // Partial penetration + bounce
    WEAK: 'WEAK',             // Wick touch only
  },

  SCORES: {
    STRONG: 15,
    MEDIUM: 10,
    WEAK: 5,
    NONE: 0,
    REQUIRED_PENALTY: -10,    // Penalty if required but not found
  },
};

/**
 * Multi-Timeframe Analysis Configuration
 */
export const MTF_CONFIG = {
  // Timeframe hierarchy - maps current TF to higher TF
  HIERARCHY: {
    '1m': '5m',
    '3m': '15m',
    '5m': '15m',
    '15m': '1h',
    '30m': '1h',
    '1h': '4h',
    '2h': '4h',
    '4h': '1d',
    '8h': '1d',
    '1d': '1w',
    '1w': '1M',
  },

  // Trend strength threshold for counter-trend penalty
  STRENGTH_THRESHOLD: 60,

  // Minimum candles needed for trend analysis
  MIN_CANDLES: 20,

  // EMA periods for trend analysis
  EMA_FAST: 20,
  EMA_SLOW: 50,

  SCORES: {
    ALIGNED_STRONG: 15,       // Pattern aligns with strong HTF trend
    ALIGNED_WEAK: 10,         // Pattern aligns with weak HTF trend
    NEUTRAL: 0,               // HTF trend neutral
    COUNTER_WEAK: -5,         // Counter weak HTF trend (allowed)
    COUNTER_STRONG: -15,      // Counter strong HTF trend (warn/block)
  },
};

/**
 * Confidence V2 Configuration
 */
export const CONFIDENCE_CONFIG = {
  BASE_SCORE: 40,             // Starting base score (down from 50)
  MIN_THRESHOLD: 55,          // Minimum for valid signal (up from 45)
  MAX_SCORE: 98,              // Maximum possible score
  MIN_SCORE: 30,              // Minimum possible score

  // Grade thresholds and labels
  GRADES: {
    'A+': { min: 80, label: 'Rat manh', color: '#0ECB81' },
    'A':  { min: 70, label: 'Manh', color: '#0ECB81' },
    'B+': { min: 65, label: 'Kha', color: '#FFBD59' },
    'B':  { min: 60, label: 'Trung binh', color: '#FFBD59' },
    'C':  { min: 55, label: 'Yeu', color: '#F6465D' },
    'REJECT': { min: 0, label: 'Loai', color: '#888888' },
  },

  // Maximum points per factor
  WEIGHTS: {
    VOLUME: 20,               // Volume validation
    ZONE_RETEST: 15,          // Zone retest validation
    HTF_ALIGNMENT: 15,        // Higher TF alignment
    PATTERN_QUALITY: 10,      // Pattern symmetry/clarity
    SWING_QUALITY: 10,        // Swing point quality
    RSI_DIVERGENCE: 10,       // RSI divergence
    SR_CONFLUENCE: 10,        // S/R level confluence
    CANDLE_CONFIRM: 10,       // Candlestick confirmation
  },
};

/**
 * Swing Point Configuration
 */
export const SWING_CONFIG = {
  LOOKBACK: 5,                // Candles each side to confirm swing
  MIN_CONFIRMATIONS: 2,       // Minimum confirmation candles

  // Height threshold relative to ATR
  HEIGHT_THRESHOLD_ATR: 0.5,

  // Volume requirement at swing
  VOLUME_RATIO_MIN: 1.2,

  SCORES: {
    HIGH_QUALITY: 10,
    MEDIUM_QUALITY: 6,
    LOW_QUALITY: 3,
    INVALID: 0,
  },
};

/**
 * RSI Divergence Configuration
 */
export const RSI_CONFIG = {
  PERIOD: 14,                 // RSI period
  LOOKBACK: 20,               // Candles to look for divergence

  OVERSOLD: 30,               // Oversold threshold
  OVERBOUGHT: 70,             // Overbought threshold

  // Strong divergence when RSI at extremes
  STRONG_OVERSOLD: 25,
  STRONG_OVERBOUGHT: 75,

  SCORES: {
    STRONG: 10,               // Clear divergence at extremes
    MEDIUM: 6,                // Divergence present
    WEAK: 3,                  // Weak divergence
  },
};

/**
 * Breakout Volume Configuration
 */
export const BREAKOUT_CONFIG = {
  // Minimum volume ratio for valid breakout
  MIN_VOLUME_RATIO: 1.5,

  // Strong breakout volume
  STRONG_VOLUME_RATIO: 2.0,

  // Close must be past level by this %
  CLOSE_THRESHOLD: 0.001,     // 0.1%

  SCORES: {
    STRONG: 15,
    GOOD: 10,
    WEAK: 5,
    FALSE_BREAKOUT: -10,
  },

  // Probability of false breakout without volume
  FALSE_BREAKOUT_PROBABILITY: 70,
};

/**
 * Alert Configuration
 */
export const ALERT_CONFIG = {
  TYPES: {
    PATTERN_DETECTED: 'PATTERN_DETECTED',
    ZONE_APPROACH: 'ZONE_APPROACH',
    ZONE_RETEST: 'ZONE_RETEST',
    ENTRY_TRIGGERED: 'ENTRY_TRIGGERED',
    TP_APPROACHING: 'TP_APPROACHING',
    SL_APPROACHING: 'SL_APPROACHING',
    TP_HIT: 'TP_HIT',
    SL_HIT: 'SL_HIT',
    BREAKOUT: 'BREAKOUT',
    HTF_ALIGNMENT_CHANGE: 'HTF_ALIGNMENT_CHANGE',
    PATTERN_EXPIRED: 'PATTERN_EXPIRED',
    PATTERN_INVALIDATED: 'PATTERN_INVALIDATED',
  },

  PRIORITY: {
    LOW: 'LOW',
    NORMAL: 'NORMAL',
    HIGH: 'HIGH',
    URGENT: 'URGENT',
  },

  // Zone approach threshold (as multiple of ATR)
  ZONE_APPROACH_THRESHOLD_ATR: 0.5,

  // TP/SL approach threshold (%)
  TPSL_APPROACH_THRESHOLD: 1.0,
};

/**
 * Pattern Expiration Configuration
 */
export const EXPIRATION_CONFIG = {
  // Default expiration by timeframe (in hours)
  BY_TIMEFRAME: {
    '1m': 1,
    '5m': 4,
    '15m': 12,
    '1h': 48,
    '4h': 168,        // 1 week
    '1d': 720,        // 1 month
  },

  // Max age for cleanup (days)
  CLEANUP_DAYS: 30,
};

/**
 * Default User Config (mirrors database defaults)
 */
export const DEFAULT_USER_CONFIG = {
  // Volume
  volume_strong: VOLUME_THRESHOLDS.STRONG,
  volume_good: VOLUME_THRESHOLDS.GOOD,
  volume_acceptable: VOLUME_THRESHOLDS.ACCEPTABLE,
  volume_minimum: VOLUME_THRESHOLDS.MINIMUM,
  volume_reject: VOLUME_THRESHOLDS.REJECT,

  // Confidence
  confidence_base: CONFIDENCE_CONFIG.BASE_SCORE,
  confidence_min: CONFIDENCE_CONFIG.MIN_THRESHOLD,
  confidence_strong: CONFIDENCE_CONFIG.GRADES['A+'].min,
  confidence_good: CONFIDENCE_CONFIG.GRADES['A'].min,

  // MTF
  mtf_enabled: true,
  mtf_strength_threshold: MTF_CONFIG.STRENGTH_THRESHOLD,

  // Zone retest
  zone_retest_required: true,
  zone_retest_lookback: ZONE_RETEST_CONFIG.LOOKBACK_CANDLES,

  // Swing
  swing_lookback: SWING_CONFIG.LOOKBACK,
  swing_min_confirmations: SWING_CONFIG.MIN_CONFIRMATIONS,

  // RSI
  rsi_lookback: RSI_CONFIG.LOOKBACK,
  rsi_oversold: RSI_CONFIG.OVERSOLD,
  rsi_overbought: RSI_CONFIG.OVERBOUGHT,

  // Alerts
  alerts_enabled: true,
  alert_on_zone_approach: true,
  alert_on_retest: true,
  alert_on_breakout: true,
};

export default {
  VOLUME_THRESHOLDS,
  VOLUME_SCORES,
  ZONE_RETEST_CONFIG,
  MTF_CONFIG,
  CONFIDENCE_CONFIG,
  SWING_CONFIG,
  RSI_CONFIG,
  BREAKOUT_CONFIG,
  ALERT_CONFIG,
  EXPIRATION_CONFIG,
  DEFAULT_USER_CONFIG,
};
