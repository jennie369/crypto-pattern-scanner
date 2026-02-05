/**
 * GEM Mobile - Pattern Detection Service
 * Implements 7 pattern types with zone retest methodology
 *
 * Patterns:
 * 1. DPD (Down-Peak-Down) - Bearish continuation
 * 2. UPU (Up-Peak-Up) - Bullish continuation
 * 3. DPU (Down-Peak-Up) - Bullish reversal
 * 4. UPD (Up-Peak-Down) - Bearish reversal
 * 5. Head & Shoulders - Bearish reversal
 * 6. Double Top - Bearish reversal
 * 7. Double Bottom - Bullish reversal
 *
 * ENHANCEMENTS (TIER2/3 only):
 * - Volume Confirmation
 * - Trend Context Analysis
 * - Zone Retest Validation
 * - S/R Confluence Detection
 * - Candle Confirmation
 * - RSI Divergence Detection
 * - Dynamic R:R Optimization
 */

import { binanceService } from './binanceService';
// V2 Enhancement Integration
import { applyV2Enhancements } from './scanner/patternEnhancerV2';
import { hasAccess, getTierKey } from '../constants/scannerAccess';

// Phase 1A: Pattern Config and Zone Calculator
import {
  getPatternConfig,
  getZoneTypeConfig,
  sortPatternsByStrength,
  PATTERN_CONFIG,
} from '../constants/patternConfig';
import {
  calculateZoneBoundaries,
  calculateRiskReward,
  calculateDistanceToZone,
  validateZoneWidth,
  calculateATR,
  extractPauseCandles,
} from './zoneCalculator';

// Phase 5: Dedicated advanced pattern detectors
import { detectBearishQM, detectBullishQM } from './quasimodoDetector';
import { detectBearishFTR, detectBullishFTR } from './ftrDetector';
import { detectBearishFlagLimit, detectBullishFlagLimit } from './flagLimitDetector';
import { detectDecisionPoints } from './decisionPointDetector';
import { scanConfirmationPatterns, calculateConfirmationScore } from './confirmationPatterns';

// Enhancement utilities (TIER2/3 features)
import { analyzeVolumeProfile, confirmVolumeDirection } from '../utils/volumeAnalysis';
import { analyzeTrend, calculateTrendBonus, getTrendAlignment } from '../utils/trendAnalysis';
import { validateRetest, getRetestStatus } from '../utils/retestValidation';
import { findKeyLevels, checkConfluence } from '../utils/supportResistance';
import { checkCandleConfirmation } from '../utils/candlePatterns';
import { detectRSIDivergence } from '../utils/rsiDivergence';
import { optimizeRiskReward } from '../utils/dynamicRR';

// Tier access check
import { hasFeature, TIER_ACCESS } from '../config/tierAccess';

// Pattern signal configurations
const PATTERN_SIGNALS = {
  DPD: {
    name: 'DPD',
    fullName: 'Down-Pause-Down',
    direction: 'SHORT',
    type: 'continuation',
    color: '#FF6B6B',
    description: 'Bearish continuation - Down move, pause, down continuation',
    expectedWinRate: 68,
    avgRR: 2.5,
  },
  UPU: {
    name: 'UPU',
    fullName: 'Up-Pause-Up',
    direction: 'LONG',
    type: 'continuation',
    color: '#3AF7A6',
    description: 'Bullish continuation - Up move, pause, up continuation',
    expectedWinRate: 71,
    avgRR: 2.8,
  },
  DPU: {
    name: 'DPU',
    fullName: 'Down-Pause-Up',
    direction: 'LONG',
    type: 'reversal',
    color: '#3AF7A6',
    description: 'Bullish reversal - Down move, pause, up reversal',
    expectedWinRate: 69,
    avgRR: 2.6,
  },
  UPD: {
    name: 'UPD',
    fullName: 'Up-Pause-Down',
    direction: 'SHORT',
    type: 'reversal',
    color: '#FF6B6B',
    description: 'Bearish reversal - Up move, pause, down reversal',
    expectedWinRate: 65,
    avgRR: 2.2,
  },
  'Head & Shoulders': {
    name: 'H&S',
    fullName: 'Head & Shoulders',
    direction: 'SHORT',
    type: 'reversal',
    color: '#FF6B6B',
    description: 'Classic bearish reversal - Break neckline to confirm',
    expectedWinRate: 72,
    avgRR: 3.0,
  },
  'Inverse H&S': {
    name: 'IH&S',
    fullName: 'Inverse Head & Shoulders',
    direction: 'LONG',
    type: 'reversal',
    color: '#3AF7A6',
    description: 'Classic bullish reversal pattern',
    expectedWinRate: 75,
    avgRR: 3.0,
  },
  'Double Top': {
    name: 'DT',
    fullName: 'Double Top',
    direction: 'SHORT',
    type: 'reversal',
    color: '#FF6B6B',
    description: 'Bearish reversal at resistance - Two peaks at similar level',
    expectedWinRate: 68,
    avgRR: 2.5,
  },
  'Double Bottom': {
    name: 'DB',
    fullName: 'Double Bottom',
    direction: 'LONG',
    type: 'reversal',
    color: '#3AF7A6',
    description: 'Bullish reversal at support - Two troughs at similar level',
    expectedWinRate: 70,
    avgRR: 2.7,
  },
  // TIER 2 PATTERNS (8)
  'Ascending Triangle': {
    name: 'AT',
    fullName: 'Ascending Triangle',
    direction: 'LONG',
    type: 'continuation',
    color: '#3AF7A6',
    description: 'Bullish continuation with horizontal resistance and rising support',
    expectedWinRate: 70,
    avgRR: 2.2,
  },
  'Descending Triangle': {
    name: 'DT',
    fullName: 'Descending Triangle',
    direction: 'SHORT',
    type: 'continuation',
    color: '#FF6B6B',
    description: 'Bearish continuation with horizontal support and falling resistance',
    expectedWinRate: 68,
    avgRR: 2.1,
  },
  'Symmetrical Triangle': {
    name: 'ST',
    fullName: 'Symmetrical Triangle',
    direction: 'NEUTRAL',
    type: 'continuation',
    color: '#00CFFF',
    description: 'Consolidation pattern - wait for breakout direction',
    expectedWinRate: 65,
    avgRR: 2.0,
  },
  'HFZ': {
    name: 'HFZ',
    fullName: 'High Frequency Zone',
    direction: 'SHORT',
    type: 'reversal',
    color: '#FF6B6B',
    description: 'Price rejection zone at resistance - watch for short entry',
    expectedWinRate: 72,
    avgRR: 2.3,
  },
  'LFZ': {
    name: 'LFZ',
    fullName: 'Low Frequency Zone',
    direction: 'LONG',
    type: 'reversal',
    color: '#3AF7A6',
    description: 'Strong support zone - watch for long entry',
    expectedWinRate: 72,
    avgRR: 2.3,
  },
  'Rounding Bottom': {
    name: 'RB',
    fullName: 'Rounding Bottom',
    direction: 'LONG',
    type: 'reversal',
    color: '#3AF7A6',
    description: 'Gradual bullish reversal forming U-shape bottom',
    expectedWinRate: 68,
    avgRR: 2.4,
  },
  'Rounding Top': {
    name: 'RT',
    fullName: 'Rounding Top',
    direction: 'SHORT',
    type: 'reversal',
    color: '#FF6B6B',
    description: 'Gradual bearish reversal forming inverted U-shape top',
    expectedWinRate: 66,
    avgRR: 2.2,
  },
  // TIER 3 PATTERNS (9)
  'Bull Flag': {
    name: 'BF',
    fullName: 'Bull Flag',
    direction: 'LONG',
    type: 'continuation',
    color: '#3AF7A6',
    description: 'Bullish continuation after strong upward pole',
    expectedWinRate: 72,
    avgRR: 2.5,
  },
  'Bear Flag': {
    name: 'BRF',
    fullName: 'Bear Flag',
    direction: 'SHORT',
    type: 'continuation',
    color: '#FF6B6B',
    description: 'Bearish continuation after strong downward pole',
    expectedWinRate: 71,
    avgRR: 2.4,
  },
  'Wedge': {
    name: 'WDG',
    fullName: 'Wedge',
    direction: 'NEUTRAL',
    type: 'reversal',
    color: '#00CFFF',
    description: 'Rising wedge bearish, falling wedge bullish',
    expectedWinRate: 68,
    avgRR: 2.2,
  },
  'Engulfing': {
    name: 'ENG',
    fullName: 'Engulfing',
    direction: 'NEUTRAL',
    type: 'reversal',
    color: '#00CFFF',
    description: 'Strong reversal candle pattern',
    expectedWinRate: 75,
    avgRR: 1.8,
  },
  'Morning Star': {
    name: 'MS',
    fullName: 'Morning Star',
    direction: 'LONG',
    type: 'reversal',
    color: '#3AF7A6',
    description: 'Bullish 3-candle reversal pattern',
    expectedWinRate: 73,
    avgRR: 2.0,
  },
  'Evening Star': {
    name: 'ES',
    fullName: 'Evening Star',
    direction: 'SHORT',
    type: 'reversal',
    color: '#FF6B6B',
    description: 'Bearish 3-candle reversal pattern',
    expectedWinRate: 72,
    avgRR: 2.0,
  },
  'Cup Handle': {
    name: 'CH',
    fullName: 'Cup & Handle',
    direction: 'LONG',
    type: 'continuation',
    color: '#3AF7A6',
    description: 'Bullish continuation with cup shape and handle retest',
    expectedWinRate: 70,
    avgRR: 2.5,
  },
  'Three Methods': {
    name: 'TM',
    fullName: 'Three Methods',
    direction: 'NEUTRAL',
    type: 'continuation',
    color: '#00CFFF',
    description: 'Continuation pattern with 5-candle structure',
    expectedWinRate: 68,
    avgRR: 2.0,
  },
  'Hammer': {
    name: 'HMR',
    fullName: 'Hammer',
    direction: 'LONG',
    type: 'reversal',
    color: '#3AF7A6',
    description: 'Bullish reversal candle with long lower wick',
    expectedWinRate: 70,
    avgRR: 1.8,
  },
  // ========================================
  // TIER 3 ADVANCED PATTERNS (GEM Frequency)
  // ========================================
  'Quasimodo Bearish': {
    name: 'QML-B',
    fullName: 'Quasimodo Bearish',
    direction: 'SHORT',
    type: 'reversal',
    color: '#FF6B6B',
    description: 'Strong bearish reversal - Lower low followed by lower high',
    expectedWinRate: 75,
    avgRR: 2.8,
  },
  'Quasimodo Bullish': {
    name: 'QML-L',
    fullName: 'Quasimodo Bullish',
    direction: 'LONG',
    type: 'reversal',
    color: '#3AF7A6',
    description: 'Strong bullish reversal - Higher high followed by higher low',
    expectedWinRate: 73,
    avgRR: 2.6,
  },
  'FTR Bearish': {
    name: 'FTR-B',
    fullName: 'Fail To Return Bearish',
    direction: 'SHORT',
    type: 'reversal',
    color: '#FF6B6B',
    description: 'Failed retest of resistance zone - bearish continuation',
    expectedWinRate: 66,
    avgRR: 2.2,
  },
  'FTR Bullish': {
    name: 'FTR-L',
    fullName: 'Fail To Return Bullish',
    direction: 'LONG',
    type: 'reversal',
    color: '#3AF7A6',
    description: 'Failed retest of support zone - bullish continuation',
    expectedWinRate: 68,
    avgRR: 2.3,
  },
  'Flag Limit Bearish': {
    name: 'FL-B',
    fullName: 'Flag Limit Bearish',
    direction: 'SHORT',
    type: 'reversal',
    color: '#FF6B6B',
    description: 'Price fails to break flag high - bearish continuation',
    expectedWinRate: 65,
    avgRR: 2.1,
  },
  'Flag Limit Bullish': {
    name: 'FL-L',
    fullName: 'Flag Limit Bullish',
    direction: 'LONG',
    type: 'reversal',
    color: '#3AF7A6',
    description: 'Price fails to break flag low - bullish continuation',
    expectedWinRate: 65,
    avgRR: 2.1,
  },
  'Decision Point Bearish': {
    name: 'DP-B',
    fullName: 'Decision Point Bearish',
    direction: 'SHORT',
    type: 'reversal',
    color: '#FF6B6B',
    description: 'Key decision area - price rejected at resistance',
    expectedWinRate: 64,
    avgRR: 2.0,
  },
  'Decision Point Bullish': {
    name: 'DP-L',
    fullName: 'Decision Point Bullish',
    direction: 'LONG',
    type: 'reversal',
    color: '#3AF7A6',
    description: 'Key decision area - price bounced at support',
    expectedWinRate: 64,
    avgRR: 2.0,
  },
};

class PatternDetectionService {
  constructor() {
    this.MIN_CANDLES = 30; // Reduced from 50
    this.ZONE_TOLERANCE = 0.03; // 3% tolerance for zone matching
    this.userTier = 'FREE'; // Default tier, should be set by caller

    // ========================================
    // TIMEFRAME-BASED TP/SL SCALING
    // ========================================
    // Scale factors for different timeframes
    // Base = 4h timeframe (1.0x)
    // Smaller TF = smaller TP/SL, Larger TF = larger TP/SL
    this.TIMEFRAME_SCALE = {
      '1m': 0.10,   // 10% of base (very small moves)
      '3m': 0.15,   // 15% of base
      '5m': 0.20,   // 20% of base
      '15m': 0.35,  // 35% of base
      '30m': 0.50,  // 50% of base
      '1h': 0.65,   // 65% of base
      '2h': 0.80,   // 80% of base
      '4h': 1.00,   // Base (100%)
      '6h': 1.20,   // 120% of base
      '8h': 1.35,   // 135% of base
      '12h': 1.50,  // 150% of base
      '1d': 2.00,   // 200% of base
      '3d': 3.00,   // 300% of base
      '1w': 4.00,   // 400% of base
    };

    // Candles per 21 days for each timeframe (3 weeks lookback)
    this.CANDLES_PER_21_DAYS = {
      '1m': 30240,  // 21 * 24 * 60
      '3m': 10080,  // 21 * 24 * 20
      '5m': 6048,   // 21 * 24 * 12
      '15m': 2016,  // 21 * 24 * 4
      '30m': 1008,  // 21 * 24 * 2
      '1h': 504,    // 21 * 24
      '2h': 252,    // 21 * 12
      '4h': 126,    // 21 * 6
      '6h': 84,     // 21 * 4
      '8h': 63,     // 21 * 3
      '12h': 42,    // 21 * 2
      '1d': 21,     // 21
      '3d': 7,      // ~7
      '1w': 3,      // 3
    };
  }

  /**
   * Get TP/SL scale factor for timeframe
   * @param {string} timeframe - Timeframe string (1m, 5m, 1h, 4h, etc.)
   * @returns {number} Scale factor
   */
  getTimeframeScale(timeframe) {
    return this.TIMEFRAME_SCALE[timeframe] || 1.0;
  }

  /**
   * Get number of candles to scan (21 days worth)
   * @param {string} timeframe - Timeframe string
   * @returns {number} Number of candles
   */
  getCandlesFor21Days(timeframe) {
    return this.CANDLES_PER_21_DAYS[timeframe] || 504; // Default to 1h equivalent (21 * 24)
  }

  /**
   * Scale TP percentage based on timeframe
   * @param {number} basePercent - Base percentage (e.g., 0.05 for 5%)
   * @param {string} timeframe - Timeframe string
   * @returns {number} Scaled percentage
   */
  scaleTP(basePercent, timeframe) {
    const scale = this.getTimeframeScale(timeframe);
    // Minimum 0.3% TP, maximum based on timeframe
    return Math.max(0.003, basePercent * scale);
  }

  /**
   * Scale SL percentage based on timeframe
   * @param {number} basePercent - Base percentage (e.g., 0.02 for 2%)
   * @param {string} timeframe - Timeframe string
   * @returns {number} Scaled percentage
   */
  scaleSL(basePercent, timeframe) {
    const scale = this.getTimeframeScale(timeframe);
    // Minimum 0.2% SL, maximum based on timeframe
    return Math.max(0.002, basePercent * scale);
  }

  /**
   * Check if zone is still valid (not broken)
   * @param {Object} zone - Zone object with zoneHigh, zoneLow
   * @param {Array} candles - Candles after zone formation
   * @param {string} direction - LONG or SHORT
   * @returns {Object} { valid, tested, broken, fresh }
   */
  checkZoneValidity(zone, candles, direction) {
    const { zoneHigh, zoneLow } = zone;
    let tested = false;
    let broken = false;

    for (const candle of candles) {
      // Check if price broke through the zone
      if (direction === 'LONG') {
        // For LONG zones (support), broken if price closes below zoneLow
        if (candle.close < zoneLow) {
          broken = true;
          break;
        }
        // Tested if price touched zoneLow but didn't close below
        if (candle.low <= zoneLow * 1.001) {
          tested = true;
        }
      } else {
        // For SHORT zones (resistance), broken if price closes above zoneHigh
        if (candle.close > zoneHigh) {
          broken = true;
          break;
        }
        // Tested if price touched zoneHigh but didn't close above
        if (candle.high >= zoneHigh * 0.999) {
          tested = true;
        }
      }
    }

    return {
      valid: !broken,
      tested: tested,
      broken: broken,
      fresh: !tested && !broken,
    };
  }

  /**
   * Set user tier for enhancement access control
   * @param {String} tier - User tier (FREE, TIER1, TIER2, TIER3, ADMIN)
   */
  setUserTier(tier) {
    this.userTier = tier || 'FREE';
    console.log(`[PatternDetection] User tier set to: ${this.userTier}`);
  }

  /**
   * Phase 1A: Enrich pattern with zone boundaries and pattern strength
   * @param {Object} pattern - Base pattern from detection
   * @param {Array} candles - OHLCV candle data
   * @param {Object} options - Additional options
   * @returns {Object} Pattern enriched with zone data
   */
  enrichWithZoneData(pattern, candles, options = {}) {
    try {
      const patternType = pattern.patternType;
      const patternConfig = getPatternConfig(patternType);
      const zoneTypeConfig = getZoneTypeConfig(patternConfig.type);

      // Get pause candles for zone calculation
      // For swing-based patterns, use the area around the peak/trough
      const pauseStartIndex = pattern.points?.high2?.index ||
                              pattern.points?.low2?.index ||
                              pattern.points?.peak?.index ||
                              pattern.points?.trough?.index ||
                              candles.length - 10;
      const pauseEndIndex = Math.min(pauseStartIndex + 6, candles.length - 1);
      const pauseCandles = candles.slice(
        Math.max(0, pauseStartIndex - 3),
        pauseEndIndex + 1
      );

      // Calculate zone boundaries
      const zone = calculateZoneBoundaries(
        pauseCandles,
        patternConfig.type, // 'HFZ' or 'LFZ'
        pattern.currentPrice
      );

      if (!zone) {
        // ⚠️ FIX: Even if zone calc fails, use pauseCandles timestamps for positioning
        let startTime = null;
        let endTime = null;

        // Try pauseCandles first
        if (pauseCandles[0]?.timestamp) {
          startTime = pauseCandles[0].timestamp;
          if (startTime > 9999999999) startTime = Math.floor(startTime / 1000);
        } else {
          startTime = this._extractPatternStartTime(pattern, candles);
        }

        const lastIdx = pauseCandles.length - 1;
        if (lastIdx >= 0 && pauseCandles[lastIdx]?.timestamp) {
          endTime = pauseCandles[lastIdx].timestamp;
          if (endTime > 9999999999) endTime = Math.floor(endTime / 1000);
        } else {
          endTime = this._extractPatternEndTime(pattern, candles);
        }

        console.log(`[enrichWithZoneData] Zone calc failed for ${pattern.patternType}, pauseCandles times: startTime=${startTime}, endTime=${endTime}`);

        // Return pattern with patternConfig enrichment AND time data
        return {
          ...pattern,
          patternConfig: {
            name: patternConfig.name,
            fullName: patternConfig.fullName,
            context: patternConfig.context,
            strength: patternConfig.strength,
            stars: patternConfig.stars,
            starsDisplay: patternConfig.starsDisplay,
            winRate: patternConfig.winRate,
            tradingBias: patternConfig.tradingBias,
          },
          zoneType: patternConfig.type,
          zoneTypeConfig: {
            name: zoneTypeConfig.name,
            fullName: zoneTypeConfig.fullName,
            vietnameseName: zoneTypeConfig.vietnameseName,
            color: zoneTypeConfig.color,
          },
          // ⚠️ FIX: Use actual pause candle indices for consistency
          startTime,
          endTime,
          startCandleIndex: Math.max(0, pauseStartIndex - 3),
          endCandleIndex: pauseEndIndex,
          hasZoneData: false, // Zone boundaries failed, but time data is available
        };
      }

      // Calculate ATR for zone validation
      const atr = calculateATR(candles, 14);
      const zoneValidation = atr > 0 ? validateZoneWidth(zone, atr) : { isValid: true };

      // Calculate distance to zone
      const distanceToZone = calculateDistanceToZone(pattern.currentPrice, zone);

      // Calculate R:R using zone boundaries
      const targetPrice = pattern.target;
      const riskRewardCalc = calculateRiskReward(zone, targetPrice);

      return {
        ...pattern,
        // Pattern strength info
        patternConfig: {
          name: patternConfig.name,
          fullName: patternConfig.fullName,
          context: patternConfig.context,
          strength: patternConfig.strength,
          stars: patternConfig.stars,
          starsDisplay: patternConfig.starsDisplay,
          winRate: patternConfig.winRate,
          tradingBias: patternConfig.tradingBias,
        },
        // Zone type info
        zoneType: patternConfig.type,
        zoneTypeConfig: {
          name: zoneTypeConfig.name,
          fullName: zoneTypeConfig.fullName,
          vietnameseName: zoneTypeConfig.vietnameseName,
          color: zoneTypeConfig.color,
          colorMuted: zoneTypeConfig.colorMuted,
        },
        // Zone boundaries (Phase 1A key addition)
        zone: {
          entryPrice: zone.entryPrice,
          stopPrice: zone.stopPrice,
          stopLossPrice: zone.stopLossPrice,
          zoneWidth: zone.zoneWidth,
          zoneWidthPercent: zone.zoneWidthPercent,
          pauseHigh: zone.pauseHigh,
          pauseLow: zone.pauseLow,
        },
        // Zone validation
        zoneValidation,
        // Distance info
        distanceToZone,
        // Updated R:R from zone calc
        riskRewardFromZone: riskRewardCalc,
        // For UI display - use zone entry instead of old entry
        zoneEntry: zone.entryPrice,
        zoneStop: zone.stopPrice,
        // ⚠️ FIX: Use pattern's ORIGINAL startTime/endTime if available
        // Pattern detection sets specific times based on pattern formation points
        // Only use pauseCandles as fallback to preserve unique zone positions
        startTime: (() => {
          // PRIORITY 1: Use pattern's original startTime (from pattern detection)
          if (pattern.startTime) {
            let ts = pattern.startTime;
            if (ts > 9999999999) ts = Math.floor(ts / 1000);
            console.log(`[enrichWithZoneData] ${pattern.patternType} startTime from ORIGINAL pattern: ${ts} (${new Date(ts * 1000).toISOString()})`);
            return ts;
          }
          // PRIORITY 2: Use pauseCandles timestamp
          if (pauseCandles[0]?.timestamp) {
            let ts = pauseCandles[0].timestamp;
            if (ts > 9999999999) ts = Math.floor(ts / 1000);
            console.log(`[enrichWithZoneData] ${pattern.patternType} startTime from pauseCandles[0]: ${ts}`);
            return ts;
          }
          // PRIORITY 3: Extract from pattern points
          const st = this._extractPatternStartTime(pattern, candles);
          console.log(`[enrichWithZoneData] ${pattern.patternType} startTime FALLBACK from points: ${st}`);
          return st;
        })(),
        endTime: (() => {
          // PRIORITY 1: Use pattern's original endTime (from pattern detection)
          if (pattern.endTime) {
            let ts = pattern.endTime;
            if (ts > 9999999999) ts = Math.floor(ts / 1000);
            console.log(`[enrichWithZoneData] ${pattern.patternType} endTime from ORIGINAL pattern: ${ts}`);
            return ts;
          }
          // PRIORITY 2: Use pauseCandles timestamp
          const lastIdx = pauseCandles.length - 1;
          if (lastIdx >= 0 && pauseCandles[lastIdx]?.timestamp) {
            let ts = pauseCandles[lastIdx].timestamp;
            if (ts > 9999999999) ts = Math.floor(ts / 1000);
            console.log(`[enrichWithZoneData] ${pattern.patternType} endTime from pauseCandles[${lastIdx}]: ${ts}`);
            return ts;
          }
          // PRIORITY 3: Extract from pattern points
          const et = this._extractPatternEndTime(pattern, candles);
          console.log(`[enrichWithZoneData] ${pattern.patternType} endTime FALLBACK from points: ${et}`);
          return et;
        })(),
        // ⚠️ FIX: Use actual pause candle indices for consistency
        startCandleIndex: Math.max(0, pauseStartIndex - 3),
        endCandleIndex: pauseEndIndex,
        // Flags
        hasZoneData: true,
      };
    } catch (error) {
      console.warn('[PatternDetection] Zone enrichment error:', error.message);
      // ⚠️ Try to at least extract time data even if enrichment failed
      try {
        const startTime = this._extractPatternStartTime(pattern, candles);
        const endTime = this._extractPatternEndTime(pattern, candles);
        return {
          ...pattern,
          startTime,
          endTime,
          hasZoneData: false,
        };
      } catch (timeError) {
        console.warn('[PatternDetection] Time extraction also failed:', timeError.message);
        return pattern;
      }
    }
  }

  /**
   * Extract start time from pattern points
   * Uses timestamp DIRECTLY from points if available (more reliable than index lookup)
   * @private
   */
  _extractPatternStartTime(pattern, candles) {
    // PRIORITY 1: Get timestamps directly from pattern.points
    const timestamps = this._getPatternTimestamps(pattern);
    if (timestamps.length > 0) {
      const minTimestamp = Math.min(...timestamps);
      // Convert ms to seconds for lightweight-charts
      const result = minTimestamp > 9999999999 ? Math.floor(minTimestamp / 1000) : minTimestamp;
      console.log(`[PatternDetection] startTime from points: ${result} (${new Date(result * 1000).toISOString()})`);
      return result;
    }

    // PRIORITY 2: Fallback to candle lookup by index
    const indexes = this._getPatternIndexes(pattern);
    if (indexes.length === 0) {
      console.log(`[PatternDetection] No indexes found for ${pattern.patternType}`);
      return null;
    }
    const startIdx = Math.min(...indexes);
    const candle = candles[startIdx];
    if (candle?.timestamp) {
      const result = candle.timestamp > 9999999999 ? Math.floor(candle.timestamp / 1000) : candle.timestamp;
      console.log(`[PatternDetection] startTime from candle[${startIdx}]: ${result}`);
      return result;
    }
    console.log(`[PatternDetection] No timestamp in candle[${startIdx}]`);
    return null;
  }

  /**
   * Extract end time from pattern points
   * Uses timestamp DIRECTLY from points if available
   * @private
   */
  _extractPatternEndTime(pattern, candles) {
    // PRIORITY 1: Get timestamps directly from pattern.points
    const timestamps = this._getPatternTimestamps(pattern);
    if (timestamps.length > 0) {
      const maxTimestamp = Math.max(...timestamps);
      const result = maxTimestamp > 9999999999 ? Math.floor(maxTimestamp / 1000) : maxTimestamp;
      console.log(`[PatternDetection] endTime from points: ${result}`);
      return result;
    }

    // PRIORITY 2: Fallback to candle lookup by index
    const indexes = this._getPatternIndexes(pattern);
    if (indexes.length === 0) return null;
    const endIdx = Math.max(...indexes);
    const candle = candles[endIdx];
    if (candle?.timestamp) {
      return candle.timestamp > 9999999999 ? Math.floor(candle.timestamp / 1000) : candle.timestamp;
    }
    return null;
  }

  /**
   * Extract start candle index
   * @private
   */
  _extractPatternStartIndex(pattern, candles) {
    const indexes = this._getPatternIndexes(pattern);
    return indexes.length > 0 ? Math.min(...indexes) : null;
  }

  /**
   * Extract end candle index
   * @private
   */
  _extractPatternEndIndex(pattern, candles) {
    const indexes = this._getPatternIndexes(pattern);
    return indexes.length > 0 ? Math.max(...indexes) : null;
  }

  /**
   * Get all TIMESTAMPS directly from pattern points
   * This is more reliable than looking up candles by index
   * Handles both single points and arrays of points
   * @private
   */
  _getPatternTimestamps(pattern) {
    const timestamps = [];

    // 🔴 DEBUG: Show raw points structure
    console.log(`[PatternDetection] 🔴 _getPatternTimestamps input for ${pattern.patternType}:`, {
      hasPoints: !!pattern.points,
      pointKeys: pattern.points ? Object.keys(pattern.points) : [],
      firstPointSample: pattern.points ? Object.entries(pattern.points)[0] : null,
    });

    if (pattern.points) {
      Object.entries(pattern.points).forEach(([key, point]) => {
        // 🔴 DEBUG: Show each point
        console.log(`[PatternDetection] 🔴 Point "${key}":`, {
          isArray: Array.isArray(point),
          hasTimestamp: point?.timestamp !== undefined,
          timestamp: point?.timestamp,
          type: typeof point,
        });

        if (Array.isArray(point)) {
          // Handle arrays of points (e.g., cluster: [point1, point2, ...])
          point.forEach(p => {
            if (p?.timestamp !== undefined && p.timestamp !== null) {
              timestamps.push(p.timestamp);
            }
          });
        } else if (point?.timestamp !== undefined && point.timestamp !== null) {
          // Handle single point object
          timestamps.push(point.timestamp);
        }
      });
    }

    console.log(`[PatternDetection] Extracted ${timestamps.length} timestamps for ${pattern.patternType}:`, timestamps.slice(0, 3));
    return timestamps;
  }

  /**
   * Get all candle indexes from pattern points
   * Handles both single points and arrays of points
   * @private
   */
  _getPatternIndexes(pattern) {
    const indexes = [];

    // Get from pattern.points
    if (pattern.points) {
      Object.entries(pattern.points).forEach(([key, point]) => {
        if (Array.isArray(point)) {
          // Handle arrays of points (e.g., cluster: [point1, point2, ...])
          point.forEach(p => {
            if (p?.index !== undefined && p.index !== null) {
              indexes.push(p.index);
            }
          });
        } else if (point?.index !== undefined && point.index !== null) {
          // Handle single point object
          indexes.push(point.index);
        }
      });
    }

    // Fallback to other index fields
    if (pattern.startIndex !== undefined) indexes.push(pattern.startIndex);
    if (pattern.endIndex !== undefined) indexes.push(pattern.endIndex);
    if (pattern.formationIndex !== undefined) indexes.push(pattern.formationIndex);

    return indexes;
  }

  /**
   * Check if user has access to premium enhancements (TIER2/3 only)
   */
  hasPremiumEnhancements() {
    return ['TIER2', 'TIER3', 'ADMIN'].includes(this.userTier);
  }

  /**
   * Check if user has access to advanced statistics (TIER2+)
   */
  hasAdvancedStats() {
    return hasFeature(this.userTier, 'advancedStats');
  }

  /**
   * Calculate trend direction
   */
  calculateTrend(candles, period = 20) {
    if (candles.length < period) return 'neutral';

    const recentCandles = candles.slice(-period);
    const firstPrice = recentCandles[0].close;
    const lastPrice = recentCandles[recentCandles.length - 1].close;
    const priceChange = ((lastPrice - firstPrice) / firstPrice) * 100;

    if (priceChange > 2) return 'uptrend';
    if (priceChange < -2) return 'downtrend';
    return 'neutral';
  }

  /**
   * Find swing highs and lows
   */
  findSwingPoints(candles, lookback = 5) {
    const swingHighs = [];
    const swingLows = [];

    for (let i = lookback; i < candles.length - lookback; i++) {
      const candle = candles[i];

      // Check swing high
      let isSwingHigh = true;
      for (let j = i - lookback; j <= i + lookback; j++) {
        if (j !== i && candles[j].high >= candle.high) {
          isSwingHigh = false;
          break;
        }
      }
      if (isSwingHigh) {
        swingHighs.push({ index: i, price: candle.high, timestamp: candle.timestamp });
      }

      // Check swing low
      let isSwingLow = true;
      for (let j = i - lookback; j <= i + lookback; j++) {
        if (j !== i && candles[j].low <= candle.low) {
          isSwingLow = false;
          break;
        }
      }
      if (isSwingLow) {
        swingLows.push({ index: i, price: candle.low, timestamp: candle.timestamp });
      }
    }

    return { swingHighs, swingLows };
  }

  // ========================================
  // GEM FREQUENCY METHOD HELPERS
  // ========================================

  /**
   * Check if a candle is impulsive (strong move)
   * @param {Object} candle - OHLCV candle
   * @param {number} atr - Average True Range for comparison
   * @param {string} direction - 'up' or 'down'
   * @returns {boolean}
   */
  isImpulsiveCandle(candle, atr, direction) {
    const bodySize = Math.abs(candle.close - candle.open);
    const fullRange = candle.high - candle.low;
    const bodyRatio = bodySize / fullRange;

    // Impulsive candle: body > 60% of range and body > 0.5 ATR
    const hasLargeBody = bodyRatio > 0.6 && bodySize > atr * 0.5;

    if (direction === 'up') {
      return hasLargeBody && candle.close > candle.open;
    } else {
      return hasLargeBody && candle.close < candle.open;
    }
  }

  /**
   * Detect impulsive move (2+ strong candles in same direction)
   * @param {Array} candles - OHLCV candles
   * @param {number} startIdx - Start index to check
   * @param {string} direction - 'up' or 'down'
   * @param {number} minCandles - Minimum candles for valid move
   * @returns {Object|null} { startIdx, endIdx, strength, moveSize }
   */
  detectImpulsiveMove(candles, startIdx, direction, minCandles = 2, minMovePercent = 0.015) {
    if (startIdx < 0 || startIdx >= candles.length) return null;

    const atr = this.calculateATR(candles.slice(Math.max(0, startIdx - 14), startIdx + 1), 14);
    let consecutiveCount = 0;
    let moveStart = startIdx;
    let moveEnd = startIdx;

    for (let i = startIdx; i < candles.length && consecutiveCount < 6; i++) {
      const candle = candles[i];
      const isCorrectDirection = direction === 'up'
        ? candle.close > candle.open
        : candle.close < candle.open;

      if (isCorrectDirection) {
        consecutiveCount++;
        moveEnd = i;
      } else {
        break;
      }
    }

    if (consecutiveCount < minCandles) return null;

    const startPrice = direction === 'up' ? candles[moveStart].low : candles[moveStart].high;
    const endPrice = direction === 'up' ? candles[moveEnd].high : candles[moveEnd].low;
    const moveSize = Math.abs(endPrice - startPrice);

    // Percentage-based move validation (ref: >= 2% for continuation, >= 1.5% for reversal)
    const movePercent = moveSize / startPrice;
    if (movePercent < minMovePercent) return null;

    // Volume check - if volume data available, check for increasing volume
    let volumeConfirmed = true;
    if (candles[moveStart].volume && candles[moveStart].volume > 0) {
      const moveCandles = candles.slice(moveStart, moveEnd + 1);
      const avgVol = moveCandles.reduce((sum, c) => sum + (c.volume || 0), 0) / moveCandles.length;
      const preVol = candles.slice(Math.max(0, moveStart - 5), moveStart)
        .reduce((sum, c) => sum + (c.volume || 0), 0) / Math.max(1, Math.min(5, moveStart));
      volumeConfirmed = preVol <= 0 || avgVol >= preVol * 0.8; // Allow slight volume drop
    }

    return {
      startIdx: moveStart,
      endIdx: moveEnd,
      startPrice,
      endPrice,
      strength: moveSize / atr,
      moveSize,
      movePercent,
      direction,
      candleCount: consecutiveCount,
      volumeConfirmed,
    };
  }

  /**
   * Detect pause zone (consolidation of 2-6 candles)
   * GEM Method: Small bodies, short wicks, little overlap
   * @param {Array} candles - OHLCV candles
   * @param {number} startIdx - Start index to check
   * @param {number} atr - ATR for comparison
   * @returns {Object|null} { startIdx, endIdx, high, low, candles }
   */
  detectPauseZone(candles, startIdx, atr) {
    if (startIdx < 0 || startIdx >= candles.length - 2) return null;

    let pauseCandles = [];
    let pauseHigh = -Infinity;
    let pauseLow = Infinity;

    for (let i = startIdx; i < Math.min(startIdx + 8, candles.length); i++) {
      const candle = candles[i];
      const bodySize = Math.abs(candle.close - candle.open);

      // Pause candle criteria: small body relative to ATR
      const isSmallBody = bodySize < atr * 0.7;

      // First candle must also meet body size criteria (not auto-include)
      if (!isSmallBody) break;

      pauseCandles.push({ ...candle, index: i });
      pauseHigh = Math.max(pauseHigh, candle.high);
      pauseLow = Math.min(pauseLow, candle.low);

      // Pause zone typically 2-6 candles
      if (pauseCandles.length >= 6) break;
    }

    if (pauseCandles.length < 2) return null;

    const zoneWidth = pauseHigh - pauseLow;

    // Total pause range as percentage check (ref: range < 1.5% of price)
    const avgPrice = (pauseHigh + pauseLow) / 2;
    const pauseRangePercent = zoneWidth / avgPrice;
    if (pauseRangePercent > 0.015) return null;

    const avgBody = pauseCandles.reduce((sum, c) => sum + Math.abs(c.close - c.open), 0) / pauseCandles.length;

    return {
      startIdx: startIdx,
      endIdx: startIdx + pauseCandles.length - 1,
      high: pauseHigh,
      low: pauseLow,
      zoneWidth,
      pauseRangePercent,
      avgBodySize: avgBody,
      candles: pauseCandles,
      candleCount: pauseCandles.length,
      isTight: zoneWidth < atr * 2,
    };
  }

  /**
   * Calculate simple ATR
   */
  calculateATR(candles, period = 14) {
    if (!candles || candles.length < period) {
      return candles && candles.length > 0
        ? (candles[candles.length - 1].high - candles[candles.length - 1].low)
        : 0;
    }

    let sum = 0;
    for (let i = candles.length - period; i < candles.length; i++) {
      const tr = candles[i].high - candles[i].low;
      sum += tr;
    }
    return sum / period;
  }

  /**
   * Find GEM Frequency Pattern (Move-Pause-Move structure)
   * @param {Array} candles - OHLCV candles
   * @param {string} patternType - 'UPD', 'DPU', 'DPD', 'UPU'
   * @returns {Object|null} Pattern with zone data
   */
  findGEMPattern(candles, patternType) {
    if (!candles || candles.length < 30) return null;

    const atr = this.calculateATR(candles, 14);
    const isReversal = patternType === 'UPD' || patternType === 'DPU';
    const patterns = {
      'UPD': { move1: 'up', move2: 'down', zoneType: 'HFZ' },
      'DPU': { move1: 'down', move2: 'up', zoneType: 'LFZ' },
      'DPD': { move1: 'down', move2: 'down', zoneType: 'HFZ' },
      'UPU': { move1: 'up', move2: 'up', zoneType: 'LFZ' },
    };

    const config = patterns[patternType];
    if (!config) return null;

    // Minimum move percent: 2% for continuation, 1.5% for reversal
    const minMovePercent = isReversal ? 0.015 : 0.02;

    // Scan from recent candles backwards to find pattern
    for (let scanStart = candles.length - 10; scanStart >= 20; scanStart -= 3) {
      // Look for Move 1
      let move1Start = -1;
      for (let i = scanStart; i >= Math.max(0, scanStart - 30); i--) {
        const move = this.detectImpulsiveMove(candles, i, config.move1, 2, minMovePercent);
        if (move && move.strength > 1.5) {
          move1Start = i;
          break;
        }
      }

      if (move1Start < 0) continue;

      const move1 = this.detectImpulsiveMove(candles, move1Start, config.move1, 2, minMovePercent);
      if (!move1) continue;

      // Look for Pause after Move 1
      const pauseStartIdx = move1.endIdx + 1;
      const pause = this.detectPauseZone(candles, pauseStartIdx, atr);
      if (!pause || pause.candleCount < 2) continue;

      // Look for Move 2 after Pause
      const move2StartIdx = pause.endIdx + 1;
      if (move2StartIdx >= candles.length - 2) continue;

      const move2 = this.detectImpulsiveMove(candles, move2StartIdx, config.move2, 2, minMovePercent);
      if (!move2) continue;

      // Valid pattern found!
      // Zone = Pause area
      const zoneHigh = pause.high;
      const zoneLow = pause.low;

      // Calculate departure strength (Odds Enhancer #1)
      const departureStrength = move2.strength;

      return {
        patternType,
        move1,
        pause,
        move2,
        zoneHigh,
        zoneLow,
        zoneType: config.zoneType,
        departureStrength,
        pauseTightness: pause.isTight ? 2 : 1,
        pauseCandleCount: pause.candleCount,
        startTime: candles[move1.startIdx].timestamp,
        endTime: candles[pause.endIdx].timestamp,
        formationTime: candles[pause.startIdx].timestamp,
      };
    }

    return null;
  }

  /**
   * Calculate 8 Odds Enhancers score
   * @param {Object} pattern - Pattern with zone data
   * @param {Array} candles - OHLCV candles
   * @param {number} currentPrice - Current price
   * @returns {Object} { totalScore, enhancers }
   */
  calculateOddsEnhancers(pattern, candles, currentPrice) {
    const enhancers = {
      departureStrength: 0,
      timeAtLevel: 0,
      freshness: 0,
      profitMargin: 0,
      bigPicture: 0,
      zoneOrigin: 0,
      arrival: 0,
      riskReward: 0,
    };

    // 1. Departure Strength (0-2) - how fast price left the zone
    if (pattern.departureStrength >= 3) enhancers.departureStrength = 2;
    else if (pattern.departureStrength >= 1.5) enhancers.departureStrength = 1;

    // 2. Time at Level (0-2) - fewer candles = better (less order absorption)
    if (pattern.pauseCandleCount <= 2) enhancers.timeAtLevel = 2;
    else if (pattern.pauseCandleCount <= 4) enhancers.timeAtLevel = 1;

    // 3. Freshness (0-2) - first touch back = 2, second = 1, more = 0
    // New detection = first touch back (FTB) = strongest
    enhancers.freshness = 2; // FTB by definition for new detections

    // 4. Profit Margin (0-2) - distance to OPPOSING zone, not distance from current price
    // Look for the nearest opposing zone boundary in recent price action
    const zoneWidth = pattern.zoneHigh - pattern.zoneLow;
    const isHFZ = pattern.zoneType === 'HFZ';
    // Estimate opposing zone distance using recent swing extremes
    const recentSlice = candles.slice(-50);
    let opposingDistance;
    if (isHFZ) {
      // For sell zones, look for nearest demand below
      const recentLow = Math.min(...recentSlice.map(c => c.low));
      opposingDistance = pattern.zoneLow - recentLow;
    } else {
      // For buy zones, look for nearest supply above
      const recentHigh = Math.max(...recentSlice.map(c => c.high));
      opposingDistance = recentHigh - pattern.zoneHigh;
    }
    if (opposingDistance > zoneWidth * 3) enhancers.profitMargin = 2;
    else if (opposingDistance > zoneWidth * 1.5) enhancers.profitMargin = 1;

    // 5. Big Picture (0-2) - trend alignment
    const trend = this.calculateTrend(candles, 50);
    const isReversal = pattern.patternType === 'UPD' || pattern.patternType === 'DPU';
    if (isReversal) {
      if ((pattern.patternType === 'UPD' && trend === 'uptrend') ||
          (pattern.patternType === 'DPU' && trend === 'downtrend')) {
        enhancers.bigPicture = 2;
      }
    } else {
      if ((pattern.patternType === 'DPD' && trend === 'downtrend') ||
          (pattern.patternType === 'UPU' && trend === 'uptrend')) {
        enhancers.bigPicture = 2;
      } else if ((pattern.patternType === 'DPD' && trend === 'sideways') ||
                 (pattern.patternType === 'UPU' && trend === 'sideways')) {
        enhancers.bigPicture = 1;
      }
    }

    // 6. Zone Origin (0-2) - reversal patterns stronger
    if (pattern.patternType === 'UPD' || pattern.patternType === 'DPU') {
      enhancers.zoneOrigin = 2;
    } else {
      enhancers.zoneOrigin = 1;
    }

    // 7. Arrival (0-2) - how price arrives at the zone
    // Slow, grinding arrival = good (2). Fast, impulsive arrival = bad (0)
    if (candles.length >= 5) {
      const last5 = candles.slice(-5);
      const arrivalRange = Math.max(...last5.map(c => c.high)) - Math.min(...last5.map(c => c.low));
      const avgCandleRange = last5.reduce((s, c) => s + (c.high - c.low), 0) / 5;
      const atr = this.calculateATR(candles, 14);
      // If arrival candles are smaller than ATR, it's a slow arrival (good)
      if (avgCandleRange < atr * 0.6) enhancers.arrival = 2;
      else if (avgCandleRange < atr) enhancers.arrival = 1;
    }

    // 8. Risk/Reward (0-2)
    if (opposingDistance && zoneWidth > 0) {
      const rr = opposingDistance / zoneWidth;
      if (rr >= 3) enhancers.riskReward = 2;
      else if (rr >= 2) enhancers.riskReward = 1;
    }

    const totalScore = Object.values(enhancers).reduce((a, b) => a + b, 0);

    return { totalScore, maxScore: 16, enhancers };
  }

  /**
   * Calculate confidence based on multiple factors
   */
  calculateConfidence(factors) {
    let score = 50; // Base score

    // Volume confirmation
    if (factors.volumeRatio) {
      if (factors.volumeRatio > 1.5) score += 15;
      else if (factors.volumeRatio > 1.2) score += 10;
    }

    // Pattern symmetry
    if (factors.symmetry !== undefined) {
      score += factors.symmetry * 15;
    }

    // Trend alignment
    if (factors.trendAligned) score += 10;

    // Swing point clarity
    if (factors.swingClarity !== undefined) {
      score += factors.swingClarity * 10;
    }

    // Recent price action confirmation
    if (factors.priceConfirmation) score += 5;

    return Math.min(Math.max(score, 35), 95);
  }

  /**
   * Apply TIER2/3 enhancements to pattern
   * @param {Object} pattern - Base pattern object
   * @param {Array} candles - OHLCV candle data
   * @param {String} timeframe - Timeframe
   * @returns {Object} Enhanced pattern with additional scoring
   */
  applyEnhancements(pattern, candles, timeframe) {
    // Skip if no premium access
    if (!this.hasPremiumEnhancements()) {
      console.log('[PatternDetection] Skipping enhancements - user tier:', this.userTier);
      return pattern;
    }

    console.log('[PatternDetection] Applying TIER2/3 enhancements...');

    let enhancementScore = 0;
    const enhancements = {};

    try {
      // 1. VOLUME CONFIRMATION
      const volumeAnalysis = analyzeVolumeProfile(candles);
      const volumeDirection = confirmVolumeDirection(candles, pattern.direction);

      enhancements.volume = {
        score: volumeAnalysis.volumeScore,
        ratio: volumeAnalysis.volumeRatio,
        trend: volumeAnalysis.volumeTrend,
        confirms: volumeAnalysis.hasVolumeConfirmation && volumeDirection.confirms,
        directionBias: volumeDirection.volumeBias,
      };

      if (enhancements.volume.confirms) {
        enhancementScore += volumeAnalysis.volumeScore * 0.15; // Max 15 points
      }

      // 2. TREND CONTEXT ANALYSIS
      const trendAnalysis = analyzeTrend(candles);
      const trendBonus = calculateTrendBonus(pattern.patternType, trendAnalysis, {
        type: pattern.type?.toUpperCase(),
        direction: pattern.direction,
      });
      const trendAlignment = getTrendAlignment(pattern.direction, trendAnalysis);

      enhancements.trend = {
        trend: trendAnalysis.trend,
        confidence: trendAnalysis.confidence,
        alignment: trendAlignment.alignment,
        description: trendAlignment.description,
        bonus: trendBonus,
      };

      enhancementScore += Math.max(0, trendBonus); // Max 25 points

      // 3. S/R CONFLUENCE
      const keyLevels = findKeyLevels(candles);
      const confluence = checkConfluence({
        entry: pattern.entry,
        stopLoss: pattern.stopLoss,
        target: pattern.target,
        direction: pattern.direction,
      }, keyLevels);

      enhancements.confluence = {
        score: confluence.confluenceScore,
        hasConfluence: confluence.hasConfluence,
        notes: confluence.confluenceNotes,
        entryLevel: confluence.entryLevel,
        targetLevel: confluence.targetLevel,
      };

      if (confluence.hasConfluence) {
        enhancementScore += confluence.confluenceScore * 0.2; // Max 20 points
      }

      // 4. CANDLE CONFIRMATION
      const candleConfirm = checkCandleConfirmation(candles.slice(-5), pattern.direction);

      enhancements.candle = {
        score: candleConfirm.confirmationScore,
        hasConfirmation: candleConfirm.hasConfirmation,
        signals: candleConfirm.confirmationSignals,
      };

      if (candleConfirm.hasConfirmation) {
        enhancementScore += candleConfirm.confirmationScore * 0.15; // Max 15 points
      }

      // 5. RSI DIVERGENCE
      const rsiAnalysis = detectRSIDivergence(candles, pattern.direction);

      enhancements.rsi = {
        score: rsiAnalysis.divergenceScore,
        hasDivergence: rsiAnalysis.hasDivergence,
        type: rsiAnalysis.divergenceType,
        currentRSI: rsiAnalysis.currentRSI,
      };

      if (rsiAnalysis.divergenceScore > 0) {
        enhancementScore += rsiAnalysis.divergenceScore * 0.15; // Max 15 points
      }

      // 6. DYNAMIC R:R OPTIMIZATION
      const rrOptimization = optimizeRiskReward(
        {
          entry: pattern.entry,
          stopLoss: pattern.stopLoss,
          target: pattern.target,
          direction: pattern.direction,
        },
        candles,
        timeframe,
        pattern.confidence
      );

      enhancements.riskReward = {
        original: rrOptimization.originalRR,
        optimized: rrOptimization.optimizedRR,
        score: rrOptimization.rrScore,
        optimizedTarget: rrOptimization.optimizedTarget,
        adjustments: rrOptimization.adjustments,
      };

      if (rrOptimization.rrScore > 0) {
        enhancementScore += rrOptimization.rrScore * 0.1; // Max 10 points
      }

      // Calculate final enhanced confidence
      const baseConfidence = pattern.confidence;
      const enhancedConfidence = Math.min(
        baseConfidence + enhancementScore,
        98 // Cap at 98
      );

      // Build quality grade
      let qualityGrade = 'C';
      if (enhancedConfidence >= 85) qualityGrade = 'A+';
      else if (enhancedConfidence >= 75) qualityGrade = 'A';
      else if (enhancedConfidence >= 65) qualityGrade = 'B+';
      else if (enhancedConfidence >= 55) qualityGrade = 'B';
      else if (enhancedConfidence >= 45) qualityGrade = 'C';
      else qualityGrade = 'D';

      console.log(`[PatternDetection] Enhancement complete: ${baseConfidence} -> ${enhancedConfidence} (${qualityGrade})`);

      return {
        ...pattern,
        confidence: Math.round(enhancedConfidence),
        baseConfidence,
        enhancementScore: Math.round(enhancementScore),
        qualityGrade,
        enhancements,
        // Update R:R with optimized values
        riskReward: rrOptimization.optimizedRR,
        target: rrOptimization.optimizedTarget || pattern.target,
        hasEnhancements: true,
      };

    } catch (error) {
      console.error('[PatternDetection] Enhancement error:', error);
      return pattern; // Return original pattern on error
    }
  }

  /**
   * DPD Pattern (Down-Pause-Down) - Bearish Continuation
   * GEM Frequency Method: DOWN move → PAUSE (zone) → DOWN move
   * Creates HFZ (High Frequency Zone / Sell Zone)
   */
  detectDPD(candles, symbol, timeframe) {
    if (candles.length < this.MIN_CANDLES) return null;

    // Use GEM Frequency Method detection (Move-Pause-Move only)
    const gemPattern = this.findGEMPattern(candles, 'DPD');
    if (!gemPattern) return null;

    const currentPrice = candles[candles.length - 1].close;
    const signal = PATTERN_SIGNALS.DPD;
    const { pause, zoneHigh, zoneLow } = gemPattern;

    // Calculate odds enhancers score
    const oddsScore = this.calculateOddsEnhancers(gemPattern, candles, currentPrice);

    // GEM Zone Boundaries:
    // HFZ (Sell Zone): Entry = LOW of pause, Stop = HIGH of pause
    const entry = zoneLow; // Near price (entry point)
    const slBuffer = this.scaleSL(0.005, timeframe); // Small buffer above zone
    const stopLoss = zoneHigh * (1 + slBuffer);
    const riskAmount = stopLoss - entry;
    const rrMultiplier = PATTERN_CONFIG.DPD?.riskReward || 2.5;
    const target = entry - (riskAmount * rrMultiplier);

    // Convert timestamps to seconds
    let startTime = gemPattern.startTime;
    let endTime = gemPattern.endTime;
    if (startTime > 9999999999) startTime = Math.floor(startTime / 1000);
    if (endTime > 9999999999) endTime = Math.floor(endTime / 1000);

    const confidence = Math.min(50 + (oddsScore.totalScore * 3), 95);

    return {
      id: `DPD-${symbol}-${timeframe}-${Date.now()}`,
      patternType: 'DPD',
      symbol,
      timeframe,
      confidence,
      direction: signal.direction,
      type: signal.type,
      color: signal.color,
      description: signal.description,
      entry,
      stopLoss,
      target,
      riskReward: rrMultiplier,
      winRate: signal.expectedWinRate,
      detectedAt: Date.now(),
      currentPrice,
      // GEM Pattern Data
      gemPattern: {
        move1: gemPattern.move1,
        pause: gemPattern.pause,
        move2: gemPattern.move2,
      },
      oddsEnhancers: oddsScore,
      // Zone boundaries (SHORT/HFZ: stop at top, entry at bottom)
      zoneHigh: stopLoss,
      zoneLow: entry,
      pauseHigh: zoneHigh,
      pauseLow: zoneLow,
      // Time data for zone positioning
      startTime,
      endTime,
      formationTime: startTime,
      startCandleIndex: gemPattern.move1.startIdx,
      endCandleIndex: gemPattern.pause.endIdx,
    };
  }

  /**
   * UPU Pattern (Up-Pause-Up) - Bullish Continuation
   * GEM Frequency Method: UP move → PAUSE (zone) → UP move
   * Creates LFZ (Low Frequency Zone / Buy Zone)
   */
  detectUPU(candles, symbol, timeframe) {
    if (candles.length < this.MIN_CANDLES) return null;

    // Use GEM Frequency Method detection (Move-Pause-Move only)
    const gemPattern = this.findGEMPattern(candles, 'UPU');
    if (!gemPattern) return null;

    const currentPrice = candles[candles.length - 1].close;
    const signal = PATTERN_SIGNALS.UPU;
    const { pause, zoneHigh, zoneLow } = gemPattern;

    const oddsScore = this.calculateOddsEnhancers(gemPattern, candles, currentPrice);

    // GEM Zone Boundaries:
    // LFZ (Buy Zone): Entry = HIGH of pause, Stop = LOW of pause
    const entry = zoneHigh; // Near price (entry point)
    const slBuffer = this.scaleSL(0.005, timeframe);
    const stopLoss = zoneLow * (1 - slBuffer);
    const riskAmount = entry - stopLoss;
    const rrMultiplier = PATTERN_CONFIG.UPU?.riskReward || 2.8;
    const target = entry + (riskAmount * rrMultiplier);

    let startTime = gemPattern.startTime;
    let endTime = gemPattern.endTime;
    if (startTime > 9999999999) startTime = Math.floor(startTime / 1000);
    if (endTime > 9999999999) endTime = Math.floor(endTime / 1000);

    const confidence = Math.min(50 + (oddsScore.totalScore * 3), 95);

    return {
      id: `UPU-${symbol}-${timeframe}-${Date.now()}`,
      patternType: 'UPU',
      symbol, timeframe, confidence,
      direction: signal.direction, type: signal.type, color: signal.color,
      description: signal.description,
      entry, stopLoss, target, riskReward: rrMultiplier,
      winRate: signal.expectedWinRate, detectedAt: Date.now(), currentPrice,
      gemPattern: { move1: gemPattern.move1, pause: gemPattern.pause, move2: gemPattern.move2 },
      oddsEnhancers: oddsScore,
      // Zone boundaries (LONG/LFZ: entry at top, stop at bottom)
      zoneHigh: entry, zoneLow: stopLoss,
      pauseHigh: zoneHigh, pauseLow: zoneLow,
      startTime, endTime, formationTime: startTime,
      startCandleIndex: gemPattern.move1.startIdx, endCandleIndex: gemPattern.pause.endIdx,
    };
  }

  /**
   * DPU Pattern (Down-Pause-Up) - Bullish Reversal (STRONG)
   * GEM Frequency Method: DOWN move → PAUSE (zone) → UP move
   * Creates LFZ (Low Frequency Zone / Buy Zone)
   */
  detectDPU(candles, symbol, timeframe) {
    if (candles.length < this.MIN_CANDLES) return null;

    // Use GEM Frequency Method detection (Move-Pause-Move only)
    const gemPattern = this.findGEMPattern(candles, 'DPU');
    if (!gemPattern) return null;

    const currentPrice = candles[candles.length - 1].close;
    const signal = PATTERN_SIGNALS.DPU;
    const { pause, zoneHigh, zoneLow } = gemPattern;

    const oddsScore = this.calculateOddsEnhancers(gemPattern, candles, currentPrice);

    // GEM Zone Boundaries:
    // LFZ (Buy Zone): Entry = HIGH of pause (gần giá nhất), Stop = LOW of pause (xa giá nhất)
    const entry = zoneHigh;
    const slBuffer = this.scaleSL(0.005, timeframe);
    const stopLoss = zoneLow * (1 - slBuffer);
    const riskAmount = entry - stopLoss;
    const rrMultiplier = PATTERN_CONFIG.DPU?.riskReward || 2.6;
    const target = entry + (riskAmount * rrMultiplier);

    let startTime = gemPattern.startTime;
    let endTime = gemPattern.endTime;
    if (startTime > 9999999999) startTime = Math.floor(startTime / 1000);
    if (endTime > 9999999999) endTime = Math.floor(endTime / 1000);

    // Reversal patterns get higher base confidence
    const confidence = Math.min(55 + (oddsScore.totalScore * 3), 95);

    return {
      id: `DPU-${symbol}-${timeframe}-${Date.now()}`,
      patternType: 'DPU',
      symbol, timeframe, confidence,
      direction: signal.direction, type: signal.type, color: signal.color,
      description: signal.description,
      entry, stopLoss, target, riskReward: rrMultiplier,
      winRate: signal.expectedWinRate, detectedAt: Date.now(), currentPrice,
      gemPattern: { move1: gemPattern.move1, pause: gemPattern.pause, move2: gemPattern.move2 },
      oddsEnhancers: oddsScore,
      // Zone boundaries (LONG/LFZ: entry at top, stop at bottom)
      zoneHigh: entry, zoneLow: stopLoss,
      pauseHigh: zoneHigh, pauseLow: zoneLow,
      startTime, endTime, formationTime: startTime,
      startCandleIndex: gemPattern.move1.startIdx, endCandleIndex: gemPattern.pause.endIdx,
    };
  }

  /**
   * UPD Pattern (Up-Pause-Down) - Bearish Reversal (STRONG)
   * GEM Frequency Method: UP move → PAUSE (zone) → DOWN move
   * Creates HFZ (High Frequency Zone / Sell Zone)
   */
  detectUPD(candles, symbol, timeframe) {
    if (candles.length < this.MIN_CANDLES) return null;

    // Use GEM Frequency Method detection (Move-Pause-Move only)
    const gemPattern = this.findGEMPattern(candles, 'UPD');
    if (!gemPattern) return null;

    const currentPrice = candles[candles.length - 1].close;
    const signal = PATTERN_SIGNALS.UPD;
    const { pause, zoneHigh, zoneLow } = gemPattern;

    const oddsScore = this.calculateOddsEnhancers(gemPattern, candles, currentPrice);

    // GEM Zone Boundaries:
    // HFZ (Sell Zone): Entry = LOW of pause (gần giá nhất), Stop = HIGH of pause (xa giá nhất)
    const entry = zoneLow;
    const slBuffer = this.scaleSL(0.005, timeframe);
    const stopLoss = zoneHigh * (1 + slBuffer);
    const riskAmount = stopLoss - entry;
    const rrMultiplier = PATTERN_CONFIG.UPD?.riskReward || 2.2;
    const target = entry - (riskAmount * rrMultiplier);

    let startTime = gemPattern.startTime;
    let endTime = gemPattern.endTime;
    if (startTime > 9999999999) startTime = Math.floor(startTime / 1000);
    if (endTime > 9999999999) endTime = Math.floor(endTime / 1000);

    // Reversal patterns get higher base confidence
    const confidence = Math.min(55 + (oddsScore.totalScore * 3), 95);

    return {
      id: `UPD-${symbol}-${timeframe}-${Date.now()}`,
      patternType: 'UPD',
      symbol, timeframe, confidence,
      direction: signal.direction, type: signal.type, color: signal.color,
      description: signal.description,
      entry, stopLoss, target, riskReward: rrMultiplier,
      winRate: signal.expectedWinRate, detectedAt: Date.now(), currentPrice,
      gemPattern: { move1: gemPattern.move1, pause: gemPattern.pause, move2: gemPattern.move2 },
      oddsEnhancers: oddsScore,
      // Zone boundaries (SHORT/HFZ: stop at top, entry at bottom)
      zoneHigh: stopLoss, zoneLow: entry,
      pauseHigh: zoneHigh, pauseLow: zoneLow,
      startTime, endTime, formationTime: startTime,
      startCandleIndex: gemPattern.move1.startIdx, endCandleIndex: gemPattern.pause.endIdx,
    };
  }

  /**
   * Head and Shoulders Pattern - Bearish Reversal
   */
  detectHeadAndShoulders(candles, symbol, timeframe) {
    if (candles.length < this.MIN_CANDLES) return null;

    const { swingHighs, swingLows } = this.findSwingPoints(candles, 3);

    if (swingHighs.length < 3) return null;

    // Get last 3 swing highs
    const recentHighs = swingHighs.slice(-3);
    const [leftShoulder, head, rightShoulder] = recentHighs;

    // Check H&S pattern criteria
    const shoulderTolerance = 0.03; // 3% tolerance
    const shoulderDiff = Math.abs(leftShoulder.price - rightShoulder.price) / leftShoulder.price;
    const avgShoulder = (leftShoulder.price + rightShoulder.price) / 2;

    // Head must be highest, shoulders roughly equal
    if (
      head.price <= leftShoulder.price ||
      head.price <= rightShoulder.price ||
      shoulderDiff > shoulderTolerance
    ) {
      return null;
    }

    // Head must be > 10% higher than shoulders (ref doc requirement)
    const headAboveShoulders = (head.price - avgShoulder) / avgShoulder;
    if (headAboveShoulders < 0.10) return null;

    // Find neckline - connect the lows between shoulders (not just minimum)
    const necklineLows = swingLows.filter(l =>
      l.index > leftShoulder.index && l.index < rightShoulder.index
    );
    if (necklineLows.length < 1) return null;

    // Use lowest point between shoulders as neckline reference
    const neckline = Math.min(...necklineLows.map(l => l.price));

    // Neckline break confirmation: price must have closed below neckline
    const currentPrice = candles[candles.length - 1].close;
    const hasNecklineBreak = currentPrice < neckline;
    if (!hasNecklineBreak) return null; // Must confirm break

    const confidence = this.calculateConfidence({
      symmetry: 1 - shoulderDiff,
      swingClarity: 0.8,
      trendAligned: this.calculateTrend(candles.slice(0, 30)) === 'uptrend',
    });

    if (confidence < 45) return null;

    const signal = PATTERN_SIGNALS['Head & Shoulders'];

    // RETEST ENTRY (ref: entry on neckline retest, not breakout)
    const slPercent = this.scaleSL(0.01, timeframe); // 1% base SL above head
    const entry = neckline; // Retest of neckline from below
    const stopLoss = head.price * (1 + slPercent);
    const patternHeight = head.price - neckline;
    const target = neckline - patternHeight; // Target based on pattern height (naturally scales)

    // Get neckline lows with proper index reference
    const necklineLowPoints = swingLows.filter(l =>
      l.index > leftShoulder.index && l.index < rightShoulder.index
    );

    // FIX: Extract timestamps for zone positioning (convert ms to seconds for lightweight-charts)
    const leftShoulderTime = leftShoulder.timestamp > 9999999999 ? Math.floor(leftShoulder.timestamp / 1000) : leftShoulder.timestamp;
    const rightShoulderTime = rightShoulder.timestamp > 9999999999 ? Math.floor(rightShoulder.timestamp / 1000) : rightShoulder.timestamp;

    return {
      id: `HS-${symbol}-${timeframe}-${Date.now()}`,
      patternType: 'Head & Shoulders',
      symbol,
      timeframe,
      confidence,
      direction: signal.direction,
      type: signal.type,
      color: signal.color,
      description: signal.description,
      entry,
      stopLoss,
      target,
      riskReward: (patternHeight / (stopLoss - entry)).toFixed(1),
      winRate: signal.expectedWinRate,
      detectedAt: Date.now(),
      currentPrice,
      neckline,
      points: { leftShoulder, head, rightShoulder, necklineLow: necklineLowPoints[0] },
      // FIX: Explicit zone data for zone rendering
      // SHORT pattern: SL at top (zoneHigh), entry at bottom (zoneLow)
      zoneHigh: stopLoss,
      zoneLow: entry,
      // FIX: Explicit time data for zone X-axis positioning
      startTime: leftShoulderTime,
      endTime: rightShoulderTime,
      formationTime: leftShoulderTime,
      startCandleIndex: leftShoulder.index,
      endCandleIndex: rightShoulder.index,
    };
  }

  /**
   * Double Top Pattern - Bearish Reversal
   */
  detectDoubleTop(candles, symbol, timeframe) {
    if (candles.length < this.MIN_CANDLES) return null;

    const { swingHighs, swingLows } = this.findSwingPoints(candles, 4);

    if (swingHighs.length < 2) return null;

    const recentHighs = swingHighs.slice(-4);

    if (recentHighs.length < 2) return null;

    const top1 = recentHighs[recentHighs.length - 2];
    const top2 = recentHighs[recentHighs.length - 1];

    // Tops should be at similar level (within 2% per ref doc)
    const topDiff = Math.abs(top1.price - top2.price) / top1.price;
    if (topDiff > 0.02) return null;

    // Minimum 5 candles between peaks (ref requirement)
    if (top2.index - top1.index < 5) return null;

    // Find trough between tops
    let trough = swingLows.find(l => l.index > top1.index && l.index < top2.index);
    if (!trough) return null; // Must have a trough BETWEEN the peaks

    // Trough should be significant (ref: >= 3% retracement)
    const troughDepth = (top1.price - trough.price) / top1.price;
    if (troughDepth < 0.03) return null;

    const confidence = this.calculateConfidence({
      symmetry: 1 - topDiff,
      swingClarity: Math.min(troughDepth * 15, 1),
    });

    if (confidence < 40) return null; // Lowered threshold

    const currentPrice = candles[candles.length - 1].close;
    const signal = PATTERN_SIGNALS['Double Top'];
    const entry = trough.price;

    // TIMEFRAME-SCALED TP/SL
    // SL above highest top with scaled buffer
    const slPercent = this.scaleSL(0.01, timeframe); // 1% base SL
    const stopLoss = Math.max(top1.price, top2.price) * (1 + slPercent);
    const patternHeight = top1.price - trough.price;
    const target = entry - patternHeight; // Target based on pattern height (naturally scales)

    // ⚠️ FIX: Extract timestamps for zone positioning
    const top1Time = top1.timestamp > 9999999999 ? Math.floor(top1.timestamp / 1000) : top1.timestamp;
    const top2Time = top2.timestamp > 9999999999 ? Math.floor(top2.timestamp / 1000) : top2.timestamp;
    const troughTime = trough.timestamp > 9999999999 ? Math.floor(trough.timestamp / 1000) : trough.timestamp;

    return {
      id: `DT-${symbol}-${timeframe}-${Date.now()}`,
      patternType: 'Double Top',
      symbol,
      timeframe,
      confidence,
      direction: signal.direction,
      type: signal.type,
      color: signal.color,
      description: signal.description,
      entry,
      stopLoss,
      target,
      riskReward: (patternHeight / (stopLoss - entry)).toFixed(1),
      winRate: signal.expectedWinRate,
      detectedAt: Date.now(),
      currentPrice,
      points: { top1, top2, trough },
      // ⚠️ FIX: Explicit zone data for zone rendering
      // SHORT pattern: SL at top (zoneHigh), entry at bottom (zoneLow)
      zoneHigh: stopLoss,
      zoneLow: entry,
      // ⚠️ FIX: Explicit time data for zone X-axis positioning
      startTime: top1Time,
      endTime: Math.max(top2Time, troughTime),
      formationTime: top1Time,
      startCandleIndex: top1.index,
      endCandleIndex: Math.max(top2.index, trough.index),
    };
  }

  /**
   * Double Bottom Pattern - Bullish Reversal
   */
  detectDoubleBottom(candles, symbol, timeframe) {
    if (candles.length < this.MIN_CANDLES) return null;

    const { swingHighs, swingLows } = this.findSwingPoints(candles, 4);

    if (swingLows.length < 2) return null;

    const recentLows = swingLows.slice(-4);

    if (recentLows.length < 2) return null;

    const bottom1 = recentLows[recentLows.length - 2];
    const bottom2 = recentLows[recentLows.length - 1];

    // Bottoms should be at similar level (within 2% per ref doc)
    const bottomDiff = Math.abs(bottom1.price - bottom2.price) / bottom1.price;
    if (bottomDiff > 0.02) return null;

    // Minimum 5 candles between bottoms (ref requirement)
    if (bottom2.index - bottom1.index < 5) return null;

    // Find peak between bottoms
    let peak = swingHighs.find(h => h.index > bottom1.index && h.index < bottom2.index);
    if (!peak) return null; // Must have a peak BETWEEN the bottoms

    // Peak should be significant (ref: >= 3% retracement)
    const peakHeight = (peak.price - bottom1.price) / bottom1.price;
    if (peakHeight < 0.03) return null;

    const confidence = this.calculateConfidence({
      symmetry: 1 - bottomDiff,
      swingClarity: Math.min(peakHeight * 15, 1),
    });

    if (confidence < 40) return null; // Lowered threshold

    const currentPrice = candles[candles.length - 1].close;
    const signal = PATTERN_SIGNALS['Double Bottom'];
    const entry = peak.price;

    // TIMEFRAME-SCALED TP/SL
    // SL below lowest bottom with scaled buffer
    const slPercent = this.scaleSL(0.01, timeframe); // 1% base SL
    const stopLoss = Math.min(bottom1.price, bottom2.price) * (1 - slPercent);
    const patternHeight = peak.price - bottom1.price;
    const target = entry + patternHeight; // Target based on pattern height (naturally scales)

    // ⚠️ FIX: Extract timestamps for zone positioning
    const bottom1Time = bottom1.timestamp > 9999999999 ? Math.floor(bottom1.timestamp / 1000) : bottom1.timestamp;
    const bottom2Time = bottom2.timestamp > 9999999999 ? Math.floor(bottom2.timestamp / 1000) : bottom2.timestamp;
    const peakTime = peak.timestamp > 9999999999 ? Math.floor(peak.timestamp / 1000) : peak.timestamp;

    return {
      id: `DB-${symbol}-${timeframe}-${Date.now()}`,
      patternType: 'Double Bottom',
      symbol,
      timeframe,
      confidence,
      direction: signal.direction,
      type: signal.type,
      color: signal.color,
      description: signal.description,
      entry,
      stopLoss,
      target,
      riskReward: (patternHeight / (entry - stopLoss)).toFixed(1),
      winRate: signal.expectedWinRate,
      detectedAt: Date.now(),
      currentPrice,
      points: { bottom1, bottom2, peak },
      // ⚠️ FIX: Explicit zone data for zone rendering
      // LONG pattern: entry at top (zoneHigh), SL at bottom (zoneLow)
      zoneHigh: entry,
      zoneLow: stopLoss,
      // ⚠️ FIX: Explicit time data for zone X-axis positioning
      startTime: bottom1Time,
      endTime: Math.max(bottom2Time, peakTime),
      formationTime: bottom1Time,
      startCandleIndex: bottom1.index,
      endCandleIndex: Math.max(bottom2.index, peak.index),
    };
  }

  // ============================================================
  // TIER 2 PATTERNS (8 patterns) - Inverse H&S, Triangles, HFZ/LFZ, Rounding
  // ============================================================

  /**
   * Inverse Head & Shoulders - Bullish Reversal (TIER 2)
   */
  detectInverseHeadShoulders(candles, symbol, timeframe) {
    if (candles.length < 60) return null;

    const { swingLows } = this.findSwingPoints(candles, 4);
    if (swingLows.length < 3) return null;

    const recentLows = swingLows.slice(-3);
    const [leftShoulder, head, rightShoulder] = recentLows;

    // Head must be 10%+ deeper than shoulders (ref requirement)
    const avgShoulder = (leftShoulder.price + rightShoulder.price) / 2;
    const headDepthRatio = (avgShoulder - head.price) / avgShoulder;
    const headLower = head.price < leftShoulder.price * 0.90 && head.price < rightShoulder.price * 0.90;
    const shouldersEqual = Math.abs(leftShoulder.price - rightShoulder.price) < head.price * 0.03;

    if (headLower && shouldersEqual) {
      const currentPrice = candles[candles.length - 1].close;

      // Neckline: connect highs between shoulders (not average of shoulder prices)
      const { swingHighs: allHighs } = this.findSwingPoints(candles, 3);
      const necklineHighs = allHighs.filter(h =>
        h.index > leftShoulder.index && h.index < rightShoulder.index
      );
      const neckline = necklineHighs.length > 0
        ? Math.max(...necklineHighs.map(h => h.price))
        : (leftShoulder.price + rightShoulder.price) / 2; // fallback

      // Neckline break confirmation: price must have closed above neckline
      if (currentPrice < neckline) return null;
      const signal = PATTERN_SIGNALS['Inverse H&S'];

      const symmetry = 1 - Math.abs(leftShoulder.price - rightShoulder.price) / head.price;
      const headDepth = (Math.min(leftShoulder.price, rightShoulder.price) - head.price) / head.price;
      let confidence = 65 + symmetry * 15;
      if (headDepth > 0.03) confidence += 10;
      confidence = Math.min(confidence, 90);

      // RETEST ENTRY (ref: entry on neckline retest from above)
      const slPercent = this.scaleSL(0.01, timeframe); // 1% base SL below head
      const entry = neckline; // Retest entry at neckline
      const stopLoss = head.price * (1 - slPercent);
      const patternHeight = neckline - head.price;
      const target = neckline + patternHeight; // Measured move target

      // FIX: Extract timestamps for zone positioning (convert ms to seconds for lightweight-charts)
      const leftShoulderTime = leftShoulder.timestamp > 9999999999 ? Math.floor(leftShoulder.timestamp / 1000) : leftShoulder.timestamp;
      const headTime = head.timestamp > 9999999999 ? Math.floor(head.timestamp / 1000) : head.timestamp;
      const rightShoulderTime = rightShoulder.timestamp > 9999999999 ? Math.floor(rightShoulder.timestamp / 1000) : rightShoulder.timestamp;

      return {
        id: `IHS-${symbol}-${timeframe}-${Date.now()}`,
        patternType: 'Inverse H&S',
        symbol,
        timeframe,
        confidence,
        direction: signal.direction,
        type: signal.type,
        color: signal.color,
        description: signal.description,
        entry,
        stopLoss,
        target,
        riskReward: parseFloat((patternHeight / (entry - stopLoss)).toFixed(1)),
        winRate: signal.expectedWinRate,
        detectedAt: Date.now(),
        currentPrice,
        neckline,
        points: { leftShoulder, head, rightShoulder },
        // FIX: Explicit zone data for zone rendering
        // LONG pattern: entry at top (zoneHigh), SL at bottom (zoneLow)
        zoneHigh: entry,
        zoneLow: stopLoss,
        // FIX: Explicit time data for zone X-axis positioning
        startTime: leftShoulderTime,
        endTime: rightShoulderTime,
        formationTime: leftShoulderTime,
        startCandleIndex: leftShoulder.index,
        endCandleIndex: rightShoulder.index,
      };
    }
    return null;
  }

  /**
   * Ascending Triangle - Bullish Continuation (TIER 2)
   */
  detectAscendingTriangle(candles, symbol, timeframe) {
    if (candles.length < 30) return null;

    const { swingHighs, swingLows } = this.findSwingPoints(candles, 3);
    if (swingHighs.length < 2 || swingLows.length < 2) return null;

    const recentHighs = swingHighs.slice(-3);
    const highPrices = recentHighs.map(h => h.price);
    const highAvg = highPrices.reduce((a, b) => a + b) / highPrices.length;
    const highVariance = highPrices.every(p => Math.abs(p - highAvg) / highAvg < 0.02);

    const recentLows = swingLows.slice(-3);
    const lowsRising = recentLows.length >= 2 && recentLows[recentLows.length - 1].price > recentLows[0].price;

    if (highVariance && lowsRising) {
      const currentPrice = candles[candles.length - 1].close;
      const resistance = highAvg;
      const support = recentLows[recentLows.length - 1].price;
      const signal = PATTERN_SIGNALS['Ascending Triangle'];

      // Get first and last swing points for time positioning
      const firstPoint = recentHighs[0];
      const lastPoint = recentLows[recentLows.length - 1];

      // TIMEFRAME-SCALED TP/SL
      const entryBuffer = this.scaleSL(0.01, timeframe); // 1% base entry buffer above resistance
      const slPercent = this.scaleSL(0.02, timeframe); // 2% base SL below support
      const entry = resistance * (1 + entryBuffer);
      const stopLoss = support * (1 - slPercent);

      // FIX: Extract timestamps for zone positioning (convert ms to seconds for lightweight-charts)
      const firstPointTime = firstPoint.timestamp > 9999999999 ? Math.floor(firstPoint.timestamp / 1000) : firstPoint.timestamp;
      const lastPointTime = lastPoint.timestamp > 9999999999 ? Math.floor(lastPoint.timestamp / 1000) : lastPoint.timestamp;

      return {
        id: `AT-${symbol}-${timeframe}-${Date.now()}`,
        patternType: 'Ascending Triangle',
        symbol,
        timeframe,
        confidence: 70,
        direction: signal.direction,
        type: signal.type,
        color: signal.color,
        description: signal.description,
        entry,
        stopLoss,
        target: resistance + (resistance - support),
        riskReward: 2.2,
        winRate: signal.expectedWinRate,
        detectedAt: Date.now(),
        currentPrice,
        points: { firstHigh: firstPoint, lastLow: lastPoint, resistance: recentHighs[recentHighs.length - 1] },
        // FIX: Explicit zone data for zone rendering
        // LONG pattern: entry at top (zoneHigh), SL at bottom (zoneLow)
        zoneHigh: entry,
        zoneLow: stopLoss,
        // FIX: Explicit time data for zone X-axis positioning
        startTime: firstPointTime,
        endTime: lastPointTime,
        formationTime: firstPointTime,
        startCandleIndex: firstPoint.index,
        endCandleIndex: lastPoint.index,
      };
    }
    return null;
  }

  /**
   * Descending Triangle - Bearish Continuation (TIER 2)
   */
  detectDescendingTriangle(candles, symbol, timeframe) {
    if (candles.length < 30) return null;

    const { swingHighs, swingLows } = this.findSwingPoints(candles, 3);
    if (swingHighs.length < 2 || swingLows.length < 2) return null;

    const recentLows = swingLows.slice(-3);
    const lowPrices = recentLows.map(l => l.price);
    const lowAvg = lowPrices.reduce((a, b) => a + b) / lowPrices.length;
    const lowVariance = lowPrices.every(p => Math.abs(p - lowAvg) / lowAvg < 0.02);

    const recentHighs = swingHighs.slice(-3);
    const highsFalling = recentHighs.length >= 2 && recentHighs[recentHighs.length - 1].price < recentHighs[0].price;

    if (lowVariance && highsFalling) {
      const currentPrice = candles[candles.length - 1].close;
      const support = lowAvg;
      const resistance = recentHighs[recentHighs.length - 1].price;
      const signal = PATTERN_SIGNALS['Descending Triangle'];

      // Get first and last swing points for time positioning
      const firstPoint = recentLows[0];
      const lastPoint = recentHighs[recentHighs.length - 1];

      // TIMEFRAME-SCALED TP/SL
      const entryBuffer = this.scaleSL(0.01, timeframe); // 1% base entry buffer below support
      const slPercent = this.scaleSL(0.02, timeframe); // 2% base SL above resistance
      const entry = support * (1 - entryBuffer);
      const stopLoss = resistance * (1 + slPercent);

      // FIX: Extract timestamps for zone positioning (convert ms to seconds for lightweight-charts)
      const firstPointTime = firstPoint.timestamp > 9999999999 ? Math.floor(firstPoint.timestamp / 1000) : firstPoint.timestamp;
      const lastPointTime = lastPoint.timestamp > 9999999999 ? Math.floor(lastPoint.timestamp / 1000) : lastPoint.timestamp;

      return {
        id: `DT2-${symbol}-${timeframe}-${Date.now()}`,
        patternType: 'Descending Triangle',
        symbol,
        timeframe,
        confidence: 70,
        direction: signal.direction,
        type: signal.type,
        color: signal.color,
        description: signal.description,
        entry,
        stopLoss,
        target: support - (resistance - support),
        riskReward: 2.1,
        winRate: signal.expectedWinRate,
        detectedAt: Date.now(),
        currentPrice,
        points: { firstLow: firstPoint, lastHigh: lastPoint, support: recentLows[recentLows.length - 1] },
        // FIX: Explicit zone data for zone rendering
        // SHORT pattern: SL at top (zoneHigh), entry at bottom (zoneLow)
        zoneHigh: stopLoss,
        zoneLow: entry,
        // FIX: Explicit time data for zone X-axis positioning
        startTime: firstPointTime,
        endTime: lastPointTime,
        formationTime: firstPointTime,
        startCandleIndex: firstPoint.index,
        endCandleIndex: lastPoint.index,
      };
    }
    return null;
  }

  /**
   * Symmetrical Triangle - Breakout Pattern (TIER 2)
   */
  detectSymmetricalTriangle(candles, symbol, timeframe) {
    if (candles.length < 30) return null;

    const { swingHighs, swingLows } = this.findSwingPoints(candles, 3);
    if (swingHighs.length < 2 || swingLows.length < 2) return null;

    const recentHighs = swingHighs.slice(-2);
    const recentLows = swingLows.slice(-2);

    const highsFalling = recentHighs[1].price < recentHighs[0].price;
    const lowsRising = recentLows[1].price > recentLows[0].price;

    if (highsFalling && lowsRising) {
      const currentPrice = candles[candles.length - 1].close;
      const signal = PATTERN_SIGNALS['Symmetrical Triangle'];

      // Determine breakout direction based on price position
      // If price breaks above upper trendline → LONG; below lower trendline → SHORT
      const upperLine = recentHighs[1].price; // Most recent lower high
      const lowerLine = recentLows[1].price;  // Most recent higher low
      const midPoint = (upperLine + lowerLine) / 2;

      // Wait for breakout: price must be outside the triangle
      const breakoutUp = currentPrice > upperLine;
      const breakoutDown = currentPrice < lowerLine;

      if (!breakoutUp && !breakoutDown) return null; // No breakout yet - don't signal

      const direction = breakoutUp ? 'LONG' : 'SHORT';
      const triangleHeight = recentHighs[0].price - recentLows[0].price; // Widest part

      // TIMEFRAME-SCALED TP/SL
      const slPercent = this.scaleSL(0.01, timeframe);
      let entry, stopLoss, targetPrice;
      if (direction === 'LONG') {
        entry = currentPrice;
        stopLoss = lowerLine * (1 - slPercent);
        targetPrice = entry + triangleHeight; // Target = widest part of triangle
      } else {
        entry = currentPrice;
        stopLoss = upperLine * (1 + slPercent);
        targetPrice = entry - triangleHeight;
      }

      // FIX: Extract timestamps for zone positioning
      const high1Time = recentHighs[0].timestamp > 9999999999 ? Math.floor(recentHighs[0].timestamp / 1000) : recentHighs[0].timestamp;
      const low2Time = recentLows[1].timestamp > 9999999999 ? Math.floor(recentLows[1].timestamp / 1000) : recentLows[1].timestamp;

      const isSell = direction === 'SHORT';
      return {
        id: `ST-${symbol}-${timeframe}-${Date.now()}`,
        patternType: 'Symmetrical Triangle',
        symbol,
        timeframe,
        confidence: 65,
        direction,
        type: signal.type,
        color: isSell ? '#FF6B6B' : '#3AF7A6',
        description: `Symmetrical triangle breakout ${direction === 'LONG' ? 'up' : 'down'}`,
        entry,
        stopLoss,
        target: targetPrice,
        riskReward: parseFloat((Math.abs(targetPrice - entry) / Math.abs(stopLoss - entry)).toFixed(1)),
        winRate: signal.expectedWinRate,
        detectedAt: Date.now(),
        currentPrice,
        points: { high1: recentHighs[0], high2: recentHighs[1], low1: recentLows[0], low2: recentLows[1] },
        zoneHigh: isSell ? stopLoss : entry,
        zoneLow: isSell ? entry : stopLoss,
        startTime: high1Time,
        endTime: low2Time,
        formationTime: high1Time,
        startCandleIndex: recentHighs[0].index,
        endCandleIndex: recentLows[1].index,
      };
    }
    return null;
  }

  /**
   * HFZ - High Frequency Zone (Resistance) (TIER 2)
   * DISABLED: Standalone HFZ detection contradicts GEM philosophy.
   * HFZ zones should only come from DPD/UPD pause zones (Move-Pause-Move).
   * Reference: "càng chạm nhiều càng YẾU" - multi-touch weakens zones.
   */
  detectHFZ(candles, symbol, timeframe) {
    // HFZ zones are created by GEM patterns (DPD/UPD), not by S/R cluster detection
    return null;
  }

  /**
   * LFZ - Low Frequency Zone (Support) (TIER 2)
   * DISABLED: Standalone LFZ detection contradicts GEM philosophy.
   * LFZ zones should only come from UPU/DPU pause zones (Move-Pause-Move).
   * Reference: "càng chạm nhiều càng YẾU" - multi-touch weakens zones.
   */
  detectLFZ(candles, symbol, timeframe) {
    // LFZ zones are created by GEM patterns (UPU/DPU), not by S/R cluster detection
    return null;
  }

  /**
   * Rounding Bottom - Bullish Reversal (TIER 2)
   */
  detectRoundingBottom(candles, symbol, timeframe) {
    if (candles.length < 40) return null;

    const window = candles.slice(-30);
    const lows = window.map(c => c.low);
    const midPoint = Math.floor(lows.length / 2);
    const leftSide = lows.slice(0, midPoint);
    const rightSide = lows.slice(midPoint);

    const leftDescending = leftSide[leftSide.length - 1] < leftSide[0];
    const rightAscending = rightSide[rightSide.length - 1] > rightSide[0];
    const bottomPrice = Math.min(...lows);

    if (leftDescending && rightAscending) {
      const currentPrice = candles[candles.length - 1].close;
      const signal = PATTERN_SIGNALS['Rounding Bottom'];

      // Calculate pattern start/end indexes for time positioning
      const windowStartIndex = candles.length - 30;
      const bottomIndex = windowStartIndex + lows.indexOf(Math.min(...lows));
      const startCandle = candles[windowStartIndex];
      const bottomCandle = candles[bottomIndex];
      const endCandle = candles[candles.length - 1];

      // TIMEFRAME-SCALED TP/SL
      const entryBuffer = this.scaleSL(0.01, timeframe); // 1% above current
      const slPercent = this.scaleSL(0.02, timeframe); // 2% below bottom
      const entry = currentPrice * (1 + entryBuffer);
      const stopLoss = bottomPrice * (1 - slPercent);

      // FIX: Extract timestamps for zone positioning (convert ms to seconds for lightweight-charts)
      const startTime = startCandle.timestamp > 9999999999 ? Math.floor(startCandle.timestamp / 1000) : startCandle.timestamp;
      const endTime = endCandle.timestamp > 9999999999 ? Math.floor(endCandle.timestamp / 1000) : endCandle.timestamp;

      return {
        id: `RB-${symbol}-${timeframe}-${Date.now()}`,
        patternType: 'Rounding Bottom',
        symbol,
        timeframe,
        confidence: 68,
        direction: signal.direction,
        type: signal.type,
        color: signal.color,
        description: signal.description,
        entry,
        stopLoss,
        target: currentPrice + (currentPrice - bottomPrice),
        riskReward: 2.4,
        winRate: signal.expectedWinRate,
        detectedAt: Date.now(),
        currentPrice,
        points: {
          start: { index: windowStartIndex, price: startCandle.low, timestamp: startCandle.timestamp },
          bottom: { index: bottomIndex, price: bottomPrice, timestamp: bottomCandle.timestamp },
          end: { index: candles.length - 1, price: endCandle.close, timestamp: endCandle.timestamp },
        },
        // FIX: Explicit zone data for zone rendering
        // LONG pattern: entry at top (zoneHigh), SL at bottom (zoneLow)
        zoneHigh: entry,
        zoneLow: stopLoss,
        // FIX: Explicit time data for zone X-axis positioning
        startTime: startTime,
        endTime: endTime,
        formationTime: startTime,
        startCandleIndex: windowStartIndex,
        endCandleIndex: candles.length - 1,
      };
    }
    return null;
  }

  /**
   * Rounding Top - Bearish Reversal (TIER 2)
   */
  detectRoundingTop(candles, symbol, timeframe) {
    if (candles.length < 40) return null;

    const window = candles.slice(-30);
    const highs = window.map(c => c.high);
    const midPoint = Math.floor(highs.length / 2);
    const leftSide = highs.slice(0, midPoint);
    const rightSide = highs.slice(midPoint);

    const leftAscending = leftSide[leftSide.length - 1] > leftSide[0];
    const rightDescending = rightSide[rightSide.length - 1] < rightSide[0];
    const topPrice = Math.max(...highs);

    if (leftAscending && rightDescending) {
      const currentPrice = candles[candles.length - 1].close;
      const signal = PATTERN_SIGNALS['Rounding Top'];

      // Calculate pattern start/end indexes for time positioning
      const windowStartIndex = candles.length - 30;
      const topIndex = windowStartIndex + highs.indexOf(Math.max(...highs));
      const startCandle = candles[windowStartIndex];
      const topCandle = candles[topIndex];
      const endCandle = candles[candles.length - 1];

      // TIMEFRAME-SCALED TP/SL
      const entryBuffer = this.scaleSL(0.01, timeframe); // 1% below current
      const slPercent = this.scaleSL(0.02, timeframe); // 2% above top
      const entry = currentPrice * (1 - entryBuffer);
      const stopLoss = topPrice * (1 + slPercent);

      // FIX: Extract timestamps for zone positioning (convert ms to seconds for lightweight-charts)
      const startTime = startCandle.timestamp > 9999999999 ? Math.floor(startCandle.timestamp / 1000) : startCandle.timestamp;
      const endTime = endCandle.timestamp > 9999999999 ? Math.floor(endCandle.timestamp / 1000) : endCandle.timestamp;

      return {
        id: `RT-${symbol}-${timeframe}-${Date.now()}`,
        patternType: 'Rounding Top',
        symbol,
        timeframe,
        confidence: 68,
        direction: signal.direction,
        type: signal.type,
        color: signal.color,
        description: signal.description,
        entry,
        stopLoss,
        target: currentPrice - (topPrice - currentPrice),
        riskReward: 2.2,
        winRate: signal.expectedWinRate,
        detectedAt: Date.now(),
        currentPrice,
        points: {
          start: { index: windowStartIndex, price: startCandle.high, timestamp: startCandle.timestamp },
          top: { index: topIndex, price: topPrice, timestamp: topCandle.timestamp },
          end: { index: candles.length - 1, price: endCandle.close, timestamp: endCandle.timestamp },
        },
        // FIX: Explicit zone data for zone rendering
        // SHORT pattern: SL at top (zoneHigh), entry at bottom (zoneLow)
        zoneHigh: stopLoss,
        zoneLow: entry,
        // FIX: Explicit time data for zone X-axis positioning
        startTime: startTime,
        endTime: endTime,
        formationTime: startTime,
        startCandleIndex: windowStartIndex,
        endCandleIndex: candles.length - 1,
      };
    }
    return null;
  }

  // ============================================================
  // TIER 3 PATTERNS (9 patterns) - Flags, Wedge, Engulfing, Stars, Cup, Methods, Hammer
  // ============================================================

  /**
   * Bull Flag - Bullish Continuation (TIER 3)
   */
  detectBullFlag(candles, symbol, timeframe) {
    if (candles.length < 20) return null;

    // Dynamic pole/flag detection: scan for strong up move followed by consolidation
    // Find the pole: look for a strong upward move in the recent candles
    let bestPole = null;
    for (let flagLen = 5; flagLen <= 15; flagLen++) {
      for (let poleLen = 3; poleLen <= 8; poleLen++) {
        const poleStart = candles.length - flagLen - poleLen;
        const poleEnd = candles.length - flagLen;
        if (poleStart < 0) continue;

        const pole = candles.slice(poleStart, poleEnd);
        const poleRise = ((pole[pole.length - 1].close - pole[0].close) / pole[0].close) * 100;

        if (poleRise > 5) {
          const flag = candles.slice(poleEnd);
          const flagHigh = Math.max(...flag.map(c => c.high));
          const flagLow = Math.min(...flag.map(c => c.low));
          const flagRange = (flagHigh - flagLow) / flag[0].close * 100;

          // Flag should be tight and drift DOWNWARD (counter-trend)
          const flagDrift = flag[flag.length - 1].close - flag[0].close;
          const isCounterTrend = flagDrift <= 0; // Flag drifts down in bull flag

          if (flagRange < 3 && isCounterTrend) {
            bestPole = { poleStart, poleEnd, pole, flag, flagHigh, flagLow, poleRise };
            break;
          }
        }
      }
      if (bestPole) break;
    }

    if (!bestPole) return null;

    const { poleStart, pole, flag, flagHigh, flagLow } = bestPole;
    const currentPrice = candles[candles.length - 1].close;
    const signal = PATTERN_SIGNALS['Bull Flag'];

    // Entry at breakout above flag high (not currentPrice + buffer)
    const slPercent = this.scaleSL(0.01, timeframe);
    const entryPrice = flagHigh;
    const stopLossPrice = flagLow * (1 - slPercent);
    const poleHeight = pole[pole.length - 1].close - pole[0].close;

    const poleStartCandle = candles[poleStart];
    const flagEndCandle = candles[candles.length - 1];

    return {
      id: `BF-${symbol}-${timeframe}-${Date.now()}`,
      patternType: 'Bull Flag',
      symbol,
      timeframe,
      confidence: 72,
      direction: signal.direction,
      type: signal.type,
      color: signal.color,
      description: signal.description,
      entry: entryPrice,
      stopLoss: stopLossPrice,
      target: flagHigh + poleHeight, // Target = flag breakout + pole height
      riskReward: parseFloat((poleHeight / (entryPrice - stopLossPrice)).toFixed(1)),
      winRate: signal.expectedWinRate,
      detectedAt: Date.now(),
      currentPrice,
      points: {
        poleStart: { index: poleStart, price: poleStartCandle.close, timestamp: poleStartCandle.timestamp },
        flagEnd: { index: candles.length - 1, price: flagEndCandle.close, timestamp: flagEndCandle.timestamp },
      },
    };
  }

  /**
   * Bear Flag - Bearish Continuation (TIER 3)
   */
  detectBearFlag(candles, symbol, timeframe) {
    if (candles.length < 20) return null;

    // Dynamic pole/flag detection
    let bestPole = null;
    for (let flagLen = 5; flagLen <= 15; flagLen++) {
      for (let poleLen = 3; poleLen <= 8; poleLen++) {
        const poleStart = candles.length - flagLen - poleLen;
        const poleEnd = candles.length - flagLen;
        if (poleStart < 0) continue;

        const pole = candles.slice(poleStart, poleEnd);
        const poleDrop = ((pole[0].close - pole[pole.length - 1].close) / pole[0].close) * 100;

        if (poleDrop > 5) {
          const flag = candles.slice(poleEnd);
          const flagHigh = Math.max(...flag.map(c => c.high));
          const flagLow = Math.min(...flag.map(c => c.low));
          const flagRange = (flagHigh - flagLow) / flag[0].close * 100;

          // Flag should drift UPWARD (counter-trend for bear flag)
          const flagDrift = flag[flag.length - 1].close - flag[0].close;
          const isCounterTrend = flagDrift >= 0;

          if (flagRange < 3 && isCounterTrend) {
            bestPole = { poleStart, poleEnd, pole, flag, flagHigh, flagLow, poleDrop };
            break;
          }
        }
      }
      if (bestPole) break;
    }

    if (!bestPole) return null;

    const { poleStart, pole, flag, flagHigh, flagLow } = bestPole;
    const currentPrice = candles[candles.length - 1].close;
    const signal = PATTERN_SIGNALS['Bear Flag'];

    // Entry at breakout below flag low
    const slPercent = this.scaleSL(0.01, timeframe);
    const entryPrice = flagLow;
    const stopLossPrice = flagHigh * (1 + slPercent);
    const poleHeight = pole[0].close - pole[pole.length - 1].close;

    const poleStartCandle = candles[poleStart];
    const flagEndCandle = candles[candles.length - 1];

    return {
      id: `BRF-${symbol}-${timeframe}-${Date.now()}`,
      patternType: 'Bear Flag',
      symbol,
      timeframe,
      confidence: 72,
      direction: signal.direction,
      type: signal.type,
      color: signal.color,
      description: signal.description,
      entry: entryPrice,
      stopLoss: stopLossPrice,
      target: flagLow - poleHeight, // Target = flag breakout - pole height
      riskReward: parseFloat((poleHeight / (stopLossPrice - entryPrice)).toFixed(1)),
      winRate: signal.expectedWinRate,
      detectedAt: Date.now(),
      currentPrice,
      points: {
        poleStart: { index: poleStart, price: poleStartCandle.close, timestamp: poleStartCandle.timestamp },
        flagEnd: { index: candles.length - 1, price: flagEndCandle.close, timestamp: flagEndCandle.timestamp },
      },
    };
  }

  /**
   * Wedge - Rising/Falling (TIER 3)
   */
  detectWedge(candles, symbol, timeframe) {
    if (candles.length < 30) return null;

    const { swingHighs, swingLows } = this.findSwingPoints(candles, 3);
    if (swingHighs.length < 2 || swingLows.length < 2) return null;

    const recentHighs = swingHighs.slice(-2);
    const recentLows = swingLows.slice(-2);

    const highsRising = recentHighs[1].price > recentHighs[0].price;
    const lowsRising = recentLows[1].price > recentLows[0].price;
    const highsFalling = recentHighs[1].price < recentHighs[0].price;
    const lowsFalling = recentLows[1].price < recentLows[0].price;

    const isRisingWedge = highsRising && lowsRising;
    const isFallingWedge = highsFalling && lowsFalling;

    if (isRisingWedge || isFallingWedge) {
      const currentPrice = candles[candles.length - 1].close;
      const signal = PATTERN_SIGNALS['Wedge'];

      // Widest part of the wedge = target size
      const widestPart = Math.abs(recentHighs[0].price - recentLows[0].price);

      // Wait for breakout: rising wedge breaks down, falling wedge breaks up
      const breakdownLevel = recentLows[1].price;
      const breakupLevel = recentHighs[1].price;

      if (isRisingWedge && currentPrice > breakdownLevel) return null; // No breakdown yet
      if (isFallingWedge && currentPrice < breakupLevel) return null; // No breakup yet

      const direction = isRisingWedge ? 'SHORT' : 'LONG';
      const slPercent = this.scaleSL(0.01, timeframe);
      const entry = currentPrice;
      const stopLoss = isRisingWedge
        ? recentHighs[1].price * (1 + slPercent)
        : recentLows[1].price * (1 - slPercent);
      const target = isRisingWedge
        ? entry - widestPart
        : entry + widestPart;

      return {
        id: `WDG-${symbol}-${timeframe}-${Date.now()}`,
        patternType: 'Wedge',
        pattern: isRisingWedge ? 'RISING_WEDGE' : 'FALLING_WEDGE',
        symbol,
        timeframe,
        confidence: 68,
        direction,
        type: signal.type,
        color: isRisingWedge ? '#FF6B6B' : '#3AF7A6',
        description: signal.description,
        entry,
        stopLoss,
        target,
        riskReward: parseFloat((widestPart / Math.abs(stopLoss - entry)).toFixed(1)),
        winRate: signal.expectedWinRate,
        detectedAt: Date.now(),
        currentPrice,
        points: { high1: recentHighs[0], high2: recentHighs[1], low1: recentLows[0], low2: recentLows[1] },
      };
    }
    return null;
  }

  /**
   * Engulfing - Bull/Bear (TIER 3)
   */
  detectEngulfing(candles, symbol, timeframe) {
    if (candles.length < 2) return null;

    const prev = candles[candles.length - 2];
    const curr = candles[candles.length - 1];

    // Bullish Engulfing
    if (prev.close < prev.open && curr.close > curr.open) {
      if (curr.open <= prev.close && curr.close >= prev.open) {
        const signal = PATTERN_SIGNALS['Engulfing'];

        // Get candle indexes for time positioning
        const prevIndex = candles.length - 2;
        const currIndex = candles.length - 1;

        return {
          id: `ENG-${symbol}-${timeframe}-${Date.now()}`,
          patternType: 'Engulfing',
          pattern: 'BULLISH_ENGULFING',
          symbol,
          timeframe,
          confidence: 75,
          direction: 'LONG',
          type: signal.type,
          color: '#3AF7A6',
          description: 'Bullish engulfing - strong reversal signal',
          entry: curr.close * 1.01,
          stopLoss: curr.low * 0.99,
          target: curr.close * 1.03,
          riskReward: 1.8,
          winRate: signal.expectedWinRate,
          detectedAt: Date.now(),
          currentPrice: curr.close,
          points: {
            prev: { index: prevIndex, price: prev.close, timestamp: prev.timestamp },
            curr: { index: currIndex, price: curr.close, timestamp: curr.timestamp },
          }, // Added for zone positioning
        };
      }
    }

    // Bearish Engulfing
    if (prev.close > prev.open && curr.close < curr.open) {
      if (curr.open >= prev.close && curr.close <= prev.open) {
        const signal = PATTERN_SIGNALS['Engulfing'];

        // Get candle indexes for time positioning
        const prevIndex = candles.length - 2;
        const currIndex = candles.length - 1;

        return {
          id: `ENG-${symbol}-${timeframe}-${Date.now()}`,
          patternType: 'Engulfing',
          pattern: 'BEARISH_ENGULFING',
          symbol,
          timeframe,
          confidence: 75,
          direction: 'SHORT',
          type: signal.type,
          color: '#FF6B6B',
          description: 'Bearish engulfing - strong reversal signal',
          entry: curr.close * 0.99,
          stopLoss: curr.high * 1.01,
          target: curr.close * 0.97,
          riskReward: 1.8,
          winRate: signal.expectedWinRate,
          detectedAt: Date.now(),
          currentPrice: curr.close,
          points: {
            prev: { index: prevIndex, price: prev.close, timestamp: prev.timestamp },
            curr: { index: currIndex, price: curr.close, timestamp: curr.timestamp },
          }, // Added for zone positioning
        };
      }
    }
    return null;
  }

  /**
   * Morning/Evening Star (TIER 3)
   */
  detectMorningEveningStar(candles, symbol, timeframe) {
    if (candles.length < 3) return null;

    const c1 = candles[candles.length - 3];
    const c2 = candles[candles.length - 2];
    const c3 = candles[candles.length - 1];

    const body1 = Math.abs(c1.close - c1.open);
    const body2 = Math.abs(c2.close - c2.open);

    // Morning Star (bullish)
    if (c1.close < c1.open && body2 < body1 * 0.3 && c3.close > c3.open) {
      if (c3.close > (c1.open + c1.close) / 2) {
        const signal = PATTERN_SIGNALS['Morning Star'];

        // Get candle indexes for time positioning
        const idx1 = candles.length - 3;
        const idx3 = candles.length - 1;

        return {
          id: `MS-${symbol}-${timeframe}-${Date.now()}`,
          patternType: 'Morning Star',
          symbol,
          timeframe,
          confidence: 73,
          direction: 'LONG',
          type: signal.type,
          color: signal.color,
          description: signal.description,
          entry: c3.close * 1.01,
          stopLoss: Math.min(c1.low, c2.low, c3.low) * 0.99,
          target: c3.close * 1.04,
          riskReward: 2.0,
          winRate: signal.expectedWinRate,
          detectedAt: Date.now(),
          currentPrice: c3.close,
          points: {
            candle1: { index: idx1, price: c1.close, timestamp: c1.timestamp },
            candle3: { index: idx3, price: c3.close, timestamp: c3.timestamp },
          }, // Added for zone positioning
        };
      }
    }

    // Evening Star (bearish)
    if (c1.close > c1.open && body2 < body1 * 0.3 && c3.close < c3.open) {
      if (c3.close < (c1.open + c1.close) / 2) {
        const signal = PATTERN_SIGNALS['Evening Star'];

        // Get candle indexes for time positioning
        const idx1 = candles.length - 3;
        const idx3 = candles.length - 1;

        return {
          id: `ES-${symbol}-${timeframe}-${Date.now()}`,
          patternType: 'Evening Star',
          symbol,
          timeframe,
          confidence: 73,
          direction: 'SHORT',
          type: signal.type,
          color: signal.color,
          description: signal.description,
          entry: c3.close * 0.99,
          stopLoss: Math.max(c1.high, c2.high, c3.high) * 1.01,
          target: c3.close * 0.96,
          riskReward: 2.0,
          winRate: signal.expectedWinRate,
          detectedAt: Date.now(),
          currentPrice: c3.close,
          points: {
            candle1: { index: idx1, price: c1.close, timestamp: c1.timestamp },
            candle3: { index: idx3, price: c3.close, timestamp: c3.timestamp },
          }, // Added for zone positioning
        };
      }
    }
    return null;
  }

  /**
   * Cup & Handle - Bullish Continuation (TIER 3)
   */
  detectCupHandle(candles, symbol, timeframe) {
    if (candles.length < 50) return null;

    const cupWindow = candles.slice(-40, -10);
    const cupLows = cupWindow.map(c => c.low);
    const cupBottom = Math.min(...cupLows);
    const cupBottomIdx = cupLows.indexOf(cupBottom);

    // Cup rim = max of first and last few candles of cup window
    const cupRimLeft = Math.max(...cupWindow.slice(0, 5).map(c => c.high));
    const cupRimRight = Math.max(...cupWindow.slice(-5).map(c => c.high));
    const cupRim = Math.min(cupRimLeft, cupRimRight);

    // Cup depth check: 12-33% retracement (ref requirement)
    const cupDepthPercent = (cupRim - cupBottom) / cupRim;
    if (cupDepthPercent < 0.12 || cupDepthPercent > 0.33) return null;

    // U-shape validation: bottom should be in middle third, not at edges (V-shape check)
    const cupLen = cupWindow.length;
    const isUShape = cupBottomIdx > cupLen * 0.25 && cupBottomIdx < cupLen * 0.75;
    if (!isUShape) return null;

    // Check gradual descent and ascent (not V-shape)
    const leftHalf = cupLows.slice(0, cupBottomIdx);
    const rightHalf = cupLows.slice(cupBottomIdx);
    // Left should generally descend, right should generally ascend
    if (leftHalf.length < 3 || rightHalf.length < 3) return null;

    const handleWindow = candles.slice(-10);
    const handleHigh = Math.max(...handleWindow.map(c => c.high));
    const handleLow = Math.min(...handleWindow.map(c => c.low));
    const handleRange = (handleHigh - handleLow) / handleHigh;

    // Handle retracement check: 10-20% of cup depth (ref requirement)
    const cupDepth = cupRim - cupBottom;
    const handleDepth = handleHigh - handleLow;
    const handleRetracementRatio = handleDepth / cupDepth;

    if (handleRange < 0.05 && handleRetracementRatio >= 0.10 && handleRetracementRatio <= 0.30) {
      const currentPrice = candles[candles.length - 1].close;
      const signal = PATTERN_SIGNALS['Cup Handle'];

      // Get cup and handle indexes for time positioning
      const cupStartIndex = candles.length - 40;
      const handleEndIndex = candles.length - 1;
      const cupBottomIndex = cupStartIndex + cupLows.indexOf(cupBottom);
      const cupStartCandle = candles[cupStartIndex];
      const cupBottomCandle = candles[cupBottomIndex];
      const handleEndCandle = candles[handleEndIndex];

      return {
        id: `CH-${symbol}-${timeframe}-${Date.now()}`,
        patternType: 'Cup Handle',
        symbol,
        timeframe,
        confidence: 70,
        direction: signal.direction,
        type: signal.type,
        color: signal.color,
        description: signal.description,
        entry: handleHigh * 1.01,
        stopLoss: handleLow * 0.98,
        target: handleHigh + (handleHigh - cupBottom),
        riskReward: 2.5,
        winRate: signal.expectedWinRate,
        detectedAt: Date.now(),
        currentPrice,
        points: {
          cupStart: { index: cupStartIndex, price: cupStartCandle.close, timestamp: cupStartCandle.timestamp },
          cupBottom: { index: cupBottomIndex, price: cupBottom, timestamp: cupBottomCandle.timestamp },
          handleEnd: { index: handleEndIndex, price: handleEndCandle.close, timestamp: handleEndCandle.timestamp },
        }, // Added for zone positioning
      };
    }
    return null;
  }

  /**
   * Three Methods - Rising/Falling (TIER 3)
   */
  detectThreeMethods(candles, symbol, timeframe) {
    if (candles.length < 5) return null;

    const candles5 = candles.slice(-5);
    const c1Up = candles5[0].close > candles5[0].open;
    const c5Up = candles5[4].close > candles5[4].open;
    const middle3Down = candles5.slice(1, 4).every(c => c.close < c.open);

    // Middle candles must stay WITHIN first candle's high/low range
    const c1High = candles5[0].high;
    const c1Low = candles5[0].low;
    const middleWithinRange = candles5.slice(1, 4).every(
      c => c.high <= c1High && c.low >= c1Low
    );

    // Rising 3 Methods
    if (c1Up && middle3Down && c5Up && middleWithinRange) {
      const signal = PATTERN_SIGNALS['Three Methods'];

      // Get candle indexes for time positioning
      const startIdx = candles.length - 5;
      const endIdx = candles.length - 1;

      return {
        id: `TM-${symbol}-${timeframe}-${Date.now()}`,
        patternType: 'Three Methods',
        pattern: 'RISING_THREE_METHODS',
        symbol,
        timeframe,
        confidence: 68,
        direction: 'LONG',
        type: signal.type,
        color: '#3AF7A6',
        description: 'Rising 3 methods - bullish continuation',
        entry: candles5[4].close * 1.01,
        stopLoss: Math.min(...candles5.map(c => c.low)) * 0.98,
        target: candles5[4].close * 1.04,
        riskReward: 2.0,
        winRate: signal.expectedWinRate,
        detectedAt: Date.now(),
        currentPrice: candles5[4].close,
        points: {
          start: { index: startIdx, price: candles5[0].close, timestamp: candles5[0].timestamp },
          end: { index: endIdx, price: candles5[4].close, timestamp: candles5[4].timestamp },
        }, // Added for zone positioning
      };
    }

    // Falling 3 Methods
    const c1Down = candles5[0].close < candles5[0].open;
    const c5Down = candles5[4].close < candles5[4].open;
    const middle3Up = candles5.slice(1, 4).every(c => c.close > c.open);

    if (c1Down && middle3Up && c5Down && middleWithinRange) {
      const signal = PATTERN_SIGNALS['Three Methods'];

      // Get candle indexes for time positioning
      const startIdx = candles.length - 5;
      const endIdx = candles.length - 1;

      return {
        id: `TM-${symbol}-${timeframe}-${Date.now()}`,
        patternType: 'Three Methods',
        pattern: 'FALLING_THREE_METHODS',
        symbol,
        timeframe,
        confidence: 68,
        direction: 'SHORT',
        type: signal.type,
        color: '#FF6B6B',
        description: 'Falling 3 methods - bearish continuation',
        entry: candles5[4].close * 0.99,
        stopLoss: Math.max(...candles5.map(c => c.high)) * 1.02,
        target: candles5[4].close * 0.96,
        riskReward: 2.0,
        winRate: signal.expectedWinRate,
        detectedAt: Date.now(),
        currentPrice: candles5[4].close,
        points: {
          start: { index: startIdx, price: candles5[0].close, timestamp: candles5[0].timestamp },
          end: { index: endIdx, price: candles5[4].close, timestamp: candles5[4].timestamp },
        }, // Added for zone positioning
      };
    }
    return null;
  }

  /**
   * Hammer / Inverted Hammer (TIER 3)
   */
  detectHammer(candles, symbol, timeframe) {
    if (candles.length < 10) return null;

    const curr = candles[candles.length - 1];
    const body = Math.abs(curr.close - curr.open);
    const lowerShadow = Math.min(curr.open, curr.close) - curr.low;
    const upperShadow = curr.high - Math.max(curr.open, curr.close);

    const recentCandles = candles.slice(-10, -1);
    const isDowntrend = recentCandles[recentCandles.length - 1].close < recentCandles[0].close;

    // Hammer (bullish)
    if (isDowntrend && lowerShadow > body * 2 && upperShadow < body * 0.5) {
      const signal = PATTERN_SIGNALS['Hammer'];

      // Get current candle index for time positioning
      const currIndex = candles.length - 1;

      return {
        id: `HMR-${symbol}-${timeframe}-${Date.now()}`,
        patternType: 'Hammer',
        pattern: 'HAMMER',
        symbol,
        timeframe,
        confidence: 70,
        direction: 'LONG',
        type: signal.type,
        color: signal.color,
        description: signal.description,
        entry: curr.close * 1.01,
        stopLoss: curr.low * 0.99,
        target: curr.close * 1.03,
        riskReward: 1.8,
        winRate: signal.expectedWinRate,
        detectedAt: Date.now(),
        currentPrice: curr.close,
        points: {
          hammer: { index: currIndex, price: curr.close, timestamp: curr.timestamp },
        }, // Added for zone positioning
      };
    }

    // Inverted Hammer (bullish)
    if (isDowntrend && upperShadow > body * 2 && lowerShadow < body * 0.5) {
      const signal = PATTERN_SIGNALS['Hammer'];

      // Get current candle index for time positioning
      const currIndex = candles.length - 1;

      return {
        id: `HMR-${symbol}-${timeframe}-${Date.now()}`,
        patternType: 'Hammer',
        pattern: 'INVERTED_HAMMER',
        symbol,
        timeframe,
        confidence: 68,
        direction: 'LONG',
        type: signal.type,
        color: signal.color,
        description: 'Inverted hammer - potential bullish reversal',
        entry: curr.close * 1.01,
        stopLoss: curr.low * 0.99,
        target: curr.close * 1.03,
        riskReward: 1.8,
        winRate: signal.expectedWinRate,
        detectedAt: Date.now(),
        currentPrice: curr.close,
        points: {
          hammer: { index: currIndex, price: curr.close, timestamp: curr.timestamp },
        }, // Added for zone positioning
      };
    }
    return null;
  }

  // ========================================
  // TIER 3 ADVANCED PATTERNS (GEM Frequency)
  // Quasimodo, FTR, Flag Limit, Decision Point
  // ========================================

  /**
   * Adapt dedicated detector output to UI-expected format
   */
  _adaptDetectorResult(result, patternType, symbol, timeframe) {
    if (!result) return null;
    const signal = PATTERN_SIGNALS[patternType];
    if (!signal) return null;

    const currentPrice = result.currentPrice || 0;
    const entry = result.entryPrice || result.zone?.entryPrice || currentPrice;
    const stopLoss = result.stopLossPrice || result.zone?.stopLossPrice || currentPrice;
    const target = result.targetPrice || currentPrice;
    const riskAmount = Math.abs(stopLoss - entry);
    const rr = riskAmount > 0 ? Math.abs(target - entry) / riskAmount : 2.0;

    // Extract time data
    const getTimestamp = (point) => {
      if (!point) return 0;
      const ts = point.timestamp || 0;
      return ts > 9999999999 ? Math.floor(ts / 1000) : ts;
    };

    // Get structure points for time positioning
    const structurePoints = result.structure || {};
    const firstPoint = result.leftShoulder || result.head || result.hl1 || result.bos;
    const lastPoint = result.rightShoulder || result.bos || result.hl1;

    const startTime = getTimestamp(firstPoint);
    const endTime = getTimestamp(lastPoint) || startTime;
    const startIdx = firstPoint?.index || structurePoints.originStartIndex || 0;
    const endIdx = lastPoint?.index || structurePoints.originEndIndex || startIdx;

    const isSell = signal.direction === 'SHORT';

    return {
      id: `${signal.name}-${symbol}-${timeframe}-${Date.now()}`,
      patternType,
      symbol,
      timeframe,
      confidence: Math.round((result.winRate || signal.expectedWinRate / 100) * 100),
      direction: signal.direction,
      type: signal.type,
      color: signal.color,
      description: signal.description,
      entry,
      stopLoss,
      target,
      riskReward: parseFloat(rr.toFixed(1)),
      winRate: signal.expectedWinRate,
      detectedAt: Date.now(),
      currentPrice,
      zoneHierarchyLevel: result.zoneHierarchyLevel,
      // Zone boundaries
      zoneHigh: isSell ? stopLoss : entry,
      zoneLow: isSell ? entry : stopLoss,
      // Time data
      startTime,
      endTime,
      formationTime: startTime,
      startCandleIndex: startIdx,
      endCandleIndex: endIdx,
    };
  }

  /**
   * Quasimodo Bearish - delegates to dedicated quasimodoDetector.js
   */
  detectQuasimodoBearish(candles, symbol, timeframe) {
    try {
      const result = detectBearishQM(candles);
      return this._adaptDetectorResult(result, 'Quasimodo Bearish', symbol, timeframe);
    } catch (e) {
      console.error('[PatternDetection] QM Bearish error:', e.message);
      return null;
    }
  }

  /**
   * Quasimodo Bullish - delegates to dedicated quasimodoDetector.js
   */
  detectQuasimodoBullish(candles, symbol, timeframe) {
    try {
      const result = detectBullishQM(candles);
      return this._adaptDetectorResult(result, 'Quasimodo Bullish', symbol, timeframe);
    } catch (e) {
      console.error('[PatternDetection] QM Bullish error:', e.message);
      return null;
    }
  }

  /**
   * FTR Bearish - delegates to dedicated ftrDetector.js
   */
  detectFTRBearish(candles, symbol, timeframe) {
    try {
      const result = detectBearishFTR(candles);
      return this._adaptDetectorResult(result, 'FTR Bearish', symbol, timeframe);
    } catch (e) {
      console.error('[PatternDetection] FTR Bearish error:', e.message);
      return null;
    }
  }

  /**
   * FTR Bullish - delegates to dedicated ftrDetector.js
   */
  detectFTRBullish(candles, symbol, timeframe) {
    try {
      const result = detectBullishFTR(candles);
      return this._adaptDetectorResult(result, 'FTR Bullish', symbol, timeframe);
    } catch (e) {
      console.error('[PatternDetection] FTR Bullish error:', e.message);
      return null;
    }
  }

  /**
   * Flag Limit Bearish - delegates to dedicated flagLimitDetector.js
   */
  detectFlagLimitBearish(candles, symbol, timeframe) {
    try {
      const result = detectBearishFlagLimit(candles);
      return this._adaptDetectorResult(result, 'Flag Limit Bearish', symbol, timeframe);
    } catch (e) {
      console.error('[PatternDetection] FL Bearish error:', e.message);
      return null;
    }
  }

  /**
   * Flag Limit Bullish - delegates to dedicated flagLimitDetector.js
   */
  detectFlagLimitBullish(candles, symbol, timeframe) {
    try {
      const result = detectBullishFlagLimit(candles);
      return this._adaptDetectorResult(result, 'Flag Limit Bullish', symbol, timeframe);
    } catch (e) {
      console.error('[PatternDetection] FL Bullish error:', e.message);
      return null;
    }
  }

  /**
   * Decision Point Bearish - delegates to dedicated decisionPointDetector.js
   */
  detectDecisionPointBearish(candles, symbol, timeframe) {
    try {
      const results = detectDecisionPoints(candles, { direction: 'bearish' });
      if (!results || results.length === 0) return null;
      // Use the best (first) bearish DP
      const best = results.find(r => r.pattern === 'DECISION_POINT_BEARISH') || results[0];
      return this._adaptDetectorResult(best, 'Decision Point Bearish', symbol, timeframe);
    } catch (e) {
      console.error('[PatternDetection] DP Bearish error:', e.message);
      return null;
    }
  }

  /**
   * Decision Point Bullish - delegates to dedicated decisionPointDetector.js
   */
  detectDecisionPointBullish(candles, symbol, timeframe) {
    try {
      const results = detectDecisionPoints(candles, { direction: 'bullish' });
      if (!results || results.length === 0) return null;
      // Use the best (first) bullish DP
      const best = results.find(r => r.pattern === 'DECISION_POINT_BULLISH') || results[0];
      return this._adaptDetectorResult(best, 'Decision Point Bullish', symbol, timeframe);
    } catch (e) {
      console.error('[PatternDetection] DP Bullish error:', e.message);
      return null;
    }
  }

  /**
   * Scan all patterns for a symbol
   * @param {String} symbol - Trading pair symbol
   * @param {String} timeframe - Candle timeframe
   * @param {String} userTier - Optional: override user tier for this scan
   */
  async detectPatterns(symbol, timeframe = '4h', userTier = null, options = {}) {
    try {
      console.log(`[PatternDetection] Scanning ${symbol} on ${timeframe}...`);

      // Set user tier if provided
      if (userTier) {
        this.setUserTier(userTier);
      }

      // HTF context for weighting patterns (passed from MTF scanner)
      const { htfTrend, htfZones } = options;

      const rawCandles = await binanceService.getCandles(symbol, timeframe, 1500);

      if (!rawCandles || rawCandles.length < this.MIN_CANDLES) {
        console.log('[PatternDetection] Not enough candle data:', rawCandles?.length);
        return [];
      }

      // =====================================================
      // 21-DAY LOOKBACK LIMIT: Only scan recent patterns
      // Prevents scanning full history, focuses on actionable patterns
      // =====================================================
      const candlesFor21Days = this.getCandlesFor21Days(timeframe);
      const candles = rawCandles.length > candlesFor21Days
        ? rawCandles.slice(-candlesFor21Days)
        : rawCandles;

      console.log(`[PatternDetection] 21-day limit applied: ${rawCandles.length} -> ${candles.length} candles (limit: ${candlesFor21Days})`);

      // 🔴 DEBUG: Verify candles have timestamp property
      const firstCandle = candles[0];
      const lastCandle = candles[candles.length - 1];
      console.log(`[PatternDetection] 🔴 CANDLES CHECK for ${symbol}:`, {
        count: candles.length,
        firstCandle_hasTimestamp: 'timestamp' in firstCandle,
        firstCandle_timestamp: firstCandle.timestamp,
        lastCandle_timestamp: lastCandle.timestamp,
        firstCandleKeys: Object.keys(firstCandle),
      });

      const patterns = [];
      const tier = this.userTier;

      // ============================================
      // FREE TIER PATTERNS (3 patterns)
      // ============================================
      const dpd = this.detectDPD(candles, symbol, timeframe);
      if (dpd) patterns.push(dpd);

      const upu = this.detectUPU(candles, symbol, timeframe);
      if (upu) patterns.push(upu);

      const hs = this.detectHeadAndShoulders(candles, symbol, timeframe);
      if (hs) patterns.push(hs);

      // ============================================
      // TIER 1 PATTERNS (+4 = 7 total)
      // ============================================
      if (['TIER1', 'TIER2', 'TIER3', 'ADMIN'].includes(tier)) {
        const dpu = this.detectDPU(candles, symbol, timeframe);
        if (dpu) patterns.push(dpu);

        const upd = this.detectUPD(candles, symbol, timeframe);
        if (upd) patterns.push(upd);

        const dt = this.detectDoubleTop(candles, symbol, timeframe);
        if (dt) patterns.push(dt);

        const db = this.detectDoubleBottom(candles, symbol, timeframe);
        if (db) patterns.push(db);
      }

      // ============================================
      // TIER 2 PATTERNS (+8 = 15 total)
      // ============================================
      if (['TIER2', 'TIER3', 'ADMIN'].includes(tier)) {
        const ihs = this.detectInverseHeadShoulders(candles, symbol, timeframe);
        if (ihs) patterns.push(ihs);

        const at = this.detectAscendingTriangle(candles, symbol, timeframe);
        if (at) patterns.push(at);

        const dt2 = this.detectDescendingTriangle(candles, symbol, timeframe);
        if (dt2) patterns.push(dt2);

        const st = this.detectSymmetricalTriangle(candles, symbol, timeframe);
        if (st) patterns.push(st);

        const hfz = this.detectHFZ(candles, symbol, timeframe);
        if (hfz) patterns.push(hfz);

        const lfz = this.detectLFZ(candles, symbol, timeframe);
        if (lfz) patterns.push(lfz);

        const rb = this.detectRoundingBottom(candles, symbol, timeframe);
        if (rb) patterns.push(rb);

        const rt = this.detectRoundingTop(candles, symbol, timeframe);
        if (rt) patterns.push(rt);
      }

      // ============================================
      // TIER 3 PATTERNS (+9 = 24 total)
      // ============================================
      if (['TIER3', 'ADMIN'].includes(tier)) {
        const bf = this.detectBullFlag(candles, symbol, timeframe);
        if (bf) patterns.push(bf);

        const brf = this.detectBearFlag(candles, symbol, timeframe);
        if (brf) patterns.push(brf);

        const wdg = this.detectWedge(candles, symbol, timeframe);
        if (wdg) patterns.push(wdg);

        const eng = this.detectEngulfing(candles, symbol, timeframe);
        if (eng) patterns.push(eng);

        const star = this.detectMorningEveningStar(candles, symbol, timeframe);
        if (star) patterns.push(star);

        const ch = this.detectCupHandle(candles, symbol, timeframe);
        if (ch) patterns.push(ch);

        const tm = this.detectThreeMethods(candles, symbol, timeframe);
        if (tm) patterns.push(tm);

        const hmr = this.detectHammer(candles, symbol, timeframe);
        if (hmr) patterns.push(hmr);

        // Advanced GEM Frequency patterns
        const qmlB = this.detectQuasimodoBearish(candles, symbol, timeframe);
        if (qmlB) patterns.push(qmlB);

        const qmlL = this.detectQuasimodoBullish(candles, symbol, timeframe);
        if (qmlL) patterns.push(qmlL);

        const ftrB = this.detectFTRBearish(candles, symbol, timeframe);
        if (ftrB) patterns.push(ftrB);

        const ftrL = this.detectFTRBullish(candles, symbol, timeframe);
        if (ftrL) patterns.push(ftrL);

        const flB = this.detectFlagLimitBearish(candles, symbol, timeframe);
        if (flB) patterns.push(flB);

        const flL = this.detectFlagLimitBullish(candles, symbol, timeframe);
        if (flL) patterns.push(flL);

        const dpB = this.detectDecisionPointBearish(candles, symbol, timeframe);
        if (dpB) patterns.push(dpB);

        const dpL = this.detectDecisionPointBullish(candles, symbol, timeframe);
        if (dpL) patterns.push(dpL);
      }

      console.log(`[PatternDetection] Found ${patterns.length} patterns for ${symbol} (tier: ${tier})`);

      // Phase 1A: Enrich all patterns with zone data and pattern strength
      const zoneEnrichedPatterns = patterns.map(pattern =>
        this.enrichWithZoneData(pattern, candles)
      );

      console.log(`[PatternDetection] Zone enriched ${zoneEnrichedPatterns.filter(p => p.hasZoneData).length}/${patterns.length} patterns`);

      // 🔴 DEBUG: Log startTime/endTime for ALL enriched patterns
      zoneEnrichedPatterns.forEach((p, i) => {
        console.log(`[PatternDetection] 🔴 ENRICHED[${i}] ${p.patternType}:`, {
          hasPoints: !!p.points,
          pointKeys: p.points ? Object.keys(p.points) : [],
          startTime: p.startTime,
          endTime: p.endTime,
          startCandleIndex: p.startCandleIndex,
          endCandleIndex: p.endCandleIndex,
        });
      });

      // =====================================================
      // CONFIRMATION PATTERN CHECK: Scan last candles for
      // candlestick confirmations at each detected zone
      // =====================================================
      zoneEnrichedPatterns.forEach(pattern => {
        try {
          if (!pattern.zoneHigh || !pattern.zoneLow) return;

          // Get last 5 candles for confirmation check
          const recentCandles = candles.slice(-5);
          const currentPrice = recentCandles[recentCandles.length - 1]?.close;
          if (!currentPrice) return;

          // Only check confirmation if price is near the zone
          const zoneWidth = pattern.zoneHigh - pattern.zoneLow;
          const zoneBuffer = zoneWidth * 0.5;
          const nearZone = currentPrice >= (pattern.zoneLow - zoneBuffer) &&
                           currentPrice <= (pattern.zoneHigh + zoneBuffer);

          if (!nearZone) return;

          const zone = {
            zoneType: pattern.direction === 'LONG' ? 'LFZ' : 'HFZ',
            zoneHigh: pattern.zoneHigh,
            zoneLow: pattern.zoneLow,
          };

          const confirmations = scanConfirmationPatterns(recentCandles, zone);
          const confirmScore = calculateConfirmationScore(confirmations);

          if (confirmations.length > 0) {
            pattern.confirmation = {
              patterns: confirmations.map(c => ({ name: c.name, type: c.type, score: c.score })),
              score: confirmScore,
              bestPattern: confirmations[0]?.name,
            };
            // Boost confidence based on confirmation strength
            const confBoost = Math.min(10, confirmScore * 2);
            pattern.confidence = Math.min(95, pattern.confidence + confBoost);
          }
        } catch (confErr) {
          // Non-critical, don't break detection
        }
      });

      // Apply TIER2/3 enhancements if user has access
      const enhancedPatterns = zoneEnrichedPatterns.map(pattern =>
        this.applyEnhancements(pattern, candles, timeframe)
      );

      console.log(`[PatternDetection] Enhanced ${enhancedPatterns.filter(p => p.hasEnhancements).length}/${patterns.length} patterns`);

      // =====================================================
      // V2 ENHANCEMENTS: Apply volume, retest, MTF validations
      // For TIER1+ users only
      // =====================================================
      const tierKey = getTierKey(this.userTier);
      let v2EnhancedPatterns = enhancedPatterns;

      if (tierKey !== 'FREE') {
        try {
          // Get historical candles for volume comparison (last 50 candles before pattern)
          const historicalCandles = candles.slice(0, Math.max(50, candles.length - 20));

          v2EnhancedPatterns = await Promise.all(
            enhancedPatterns.map(async (pattern) => {
              try {
                // Build zone object from pattern data
                const zone = pattern.zone || {
                  high: pattern.zoneHigh || pattern.entry,
                  low: pattern.zoneLow || pattern.stopLoss,
                  type: pattern.zoneType || 'RESISTANCE',
                  direction: pattern.direction,
                };

                const v2Pattern = await applyV2Enhancements(pattern, candles, zone, {
                  userTier: this.userTier,
                  symbol,
                  timeframe,
                  historicalCandles,
                });

                return v2Pattern;
              } catch (v2Err) {
                console.log('[PatternDetection] V2 enhancement error for pattern:', v2Err.message);
                return pattern;
              }
            })
          );

          console.log(`[PatternDetection] V2 Enhanced ${v2EnhancedPatterns.filter(p => p.hasV2Enhancements).length}/${patterns.length} patterns`);
        } catch (v2Error) {
          console.error('[PatternDetection] V2 batch enhancement error:', v2Error);
          v2EnhancedPatterns = enhancedPatterns;
        }
      }

      // =====================================================
      // HTF CONTEXT: Weight patterns based on higher timeframe trend
      // and boost patterns whose zones fall within HTF zones
      // =====================================================
      if (htfTrend || htfZones) {
        v2EnhancedPatterns.forEach(pattern => {
          // 7.1: HTF trend weighting
          if (htfTrend) {
            const patDir = pattern.direction;
            const isWithHTF = (htfTrend === 'up' && patDir === 'LONG') ||
                              (htfTrend === 'down' && patDir === 'SHORT');
            const isCounterHTF = (htfTrend === 'up' && patDir === 'SHORT') ||
                                 (htfTrend === 'down' && patDir === 'LONG');
            const isReversal = pattern.patternConfig?.context === 'reversal';

            if (isWithHTF) {
              // Continuation with HTF trend = confidence boost
              pattern.confidence = Math.min(95, pattern.confidence + 10);
              pattern.htfAlignment = 'WITH_TREND';
            } else if (isCounterHTF && !isReversal) {
              // Non-reversal counter-trend = confidence penalty
              pattern.confidence = Math.max(20, pattern.confidence - 15);
              pattern.htfAlignment = 'COUNTER_TREND';
            } else if (isCounterHTF && isReversal) {
              // Reversal counter-trend = small boost (reversal is expected)
              pattern.confidence = Math.min(95, pattern.confidence + 5);
              pattern.htfAlignment = 'REVERSAL_COUNTER';
            } else {
              pattern.htfAlignment = 'NEUTRAL';
            }
          }

          // 7.2: Zone-in-zone prioritization
          if (htfZones && htfZones.length > 0 && pattern.zoneHigh && pattern.zoneLow) {
            const patMid = (pattern.zoneHigh + pattern.zoneLow) / 2;
            const isInsideHTFZone = htfZones.some(hz => {
              const hzHigh = hz.zoneHigh || hz.high;
              const hzLow = hz.zoneLow || hz.low;
              return patMid >= hzLow && patMid <= hzHigh;
            });

            if (isInsideHTFZone) {
              pattern.confidence = Math.min(95, pattern.confidence + 12);
              pattern.insideHTFZone = true;
              console.log(`[PatternDetection] Zone-in-zone boost: ${pattern.patternType} inside HTF zone`);
            }
          }
        });
      }

      // =====================================================
      // ZONE VALIDITY FILTER: Remove broken zones
      // Only keep zones that haven't been broken by price action
      // =====================================================
      let validPatterns = v2EnhancedPatterns;

      // Filter out broken zones
      validPatterns = validPatterns.filter(pattern => {
        // Skip if pattern doesn't have zone data
        if (!pattern.zoneHigh || !pattern.zoneLow) return true;

        // Get candles after the pattern formation
        const patternEndIdx = pattern.endCandleIndex || pattern.startCandleIndex;
        if (!patternEndIdx && patternEndIdx !== 0) return true;

        const candlesAfterZone = candles.slice(patternEndIdx + 1);
        if (candlesAfterZone.length === 0) return true; // No candles to check, keep zone

        // Check zone validity
        const validity = this.checkZoneValidity(
          { zoneHigh: pattern.zoneHigh, zoneLow: pattern.zoneLow },
          candlesAfterZone,
          pattern.direction
        );

        // Attach validity info to pattern
        pattern.zoneValidity = validity;

        // Only keep valid zones (not broken)
        if (!validity.valid) {
          console.log(`[PatternDetection] 🔴 ZONE BROKEN - Filtering out ${pattern.patternType} for ${symbol}:`, {
            zoneHigh: pattern.zoneHigh,
            zoneLow: pattern.zoneLow,
            tested: validity.tested,
            broken: validity.broken,
          });
          return false;
        }

        return true;
      });

      console.log(`[PatternDetection] Zone validity filter: ${v2EnhancedPatterns.length} -> ${validPatterns.length} patterns (removed ${v2EnhancedPatterns.length - validPatterns.length} broken zones)`);

      // =====================================================
      // LOOK RIGHT VALIDATION: Check R:R to nearest opposing zone
      // Skip patterns where opposing zone is too close (< 2:1 R:R)
      // =====================================================
      const beforeLookRight = validPatterns.length;
      validPatterns = validPatterns.filter(pattern => {
        if (!pattern.entry || !pattern.stopLoss) return true;

        const riskAmount = Math.abs(pattern.entry - pattern.stopLoss);
        if (riskAmount <= 0) return true;

        // Find nearest opposing zone from other detected patterns
        const opposingPatterns = validPatterns.filter(p =>
          p !== pattern &&
          p.direction !== pattern.direction &&
          p.zoneHigh && p.zoneLow
        );

        if (opposingPatterns.length === 0) return true; // No opposing zones, keep

        // Calculate distance to nearest opposing zone
        let minOpposingDistance = Infinity;
        for (const opp of opposingPatterns) {
          const oppEntry = pattern.direction === 'LONG' ? opp.zoneLow : opp.zoneHigh;
          const dist = Math.abs(oppEntry - pattern.entry);
          if (dist < minOpposingDistance) {
            minOpposingDistance = dist;
          }
        }

        const lookRightRR = minOpposingDistance / riskAmount;
        pattern.lookRightRR = parseFloat(lookRightRR.toFixed(1));

        if (lookRightRR < 2.0) {
          console.log(`[PatternDetection] LOOK RIGHT FAIL - ${pattern.patternType}: R:R to opposing zone = ${lookRightRR.toFixed(1)} (min 2.0)`);
          return false;
        }

        return true;
      });

      if (beforeLookRight !== validPatterns.length) {
        console.log(`[PatternDetection] Look Right filter: ${beforeLookRight} -> ${validPatterns.length} patterns`);
      }

      // Sort by: pattern strength > zone hierarchy > confidence
      // Reversal patterns (5 stars) > Continuation patterns (3 stars)
      // DP (level 1) > FTR (level 2) > FL (level 3) > Regular (level 4)
      return validPatterns.sort((a, b) => {
        // Primary sort: pattern strength (descending)
        const strengthA = a.patternConfig?.strength || 1;
        const strengthB = b.patternConfig?.strength || 1;
        if (strengthB !== strengthA) {
          return strengthB - strengthA;
        }
        // Secondary sort: zone hierarchy level (ascending = lower level is better)
        const hierA = a.zoneHierarchyLevel || 4;
        const hierB = b.zoneHierarchyLevel || 4;
        if (hierA !== hierB) {
          return hierA - hierB;
        }
        // Tertiary sort: confidence (descending)
        return b.confidence - a.confidence;
      });
    } catch (error) {
      console.error('[PatternDetection] Error:', error);
      return [];
    }
  }

  /**
   * Scan multiple symbols
   * @param {Array} symbols - Array of trading pair symbols
   * @param {String} timeframe - Candle timeframe
   * @param {String} userTier - User tier for enhancement access
   */
  async scanMultipleSymbols(symbols, timeframe = '4h', userTier = null) {
    // Set user tier once for all scans
    if (userTier) {
      this.setUserTier(userTier);
    }

    const allPatterns = [];

    for (const symbol of symbols) {
      const patterns = await this.detectPatterns(symbol, timeframe);
      allPatterns.push(...patterns);
    }

    return allPatterns.sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Get enhancement summary for UI display
   * @param {Object} pattern - Enhanced pattern object
   * @returns {Object} Summary for display
   */
  getEnhancementSummary(pattern) {
    if (!pattern.hasEnhancements || !pattern.enhancements) {
      return {
        hasEnhancements: false,
        message: 'Enhancements available for TIER2/3',
      };
    }

    const { enhancements } = pattern;
    const checks = [];

    // Volume check
    if (enhancements.volume?.confirms) {
      checks.push({ name: 'Volume', status: 'pass', icon: '📊' });
    } else {
      checks.push({ name: 'Volume', status: 'fail', icon: '📊' });
    }

    // Trend check
    if (enhancements.trend?.alignment === 'WITH_TREND') {
      checks.push({ name: 'Trend', status: 'pass', icon: '📈' });
    } else if (enhancements.trend?.alignment === 'COUNTER_TREND') {
      checks.push({ name: 'Trend', status: 'warning', icon: '⚠️' });
    } else {
      checks.push({ name: 'Trend', status: 'neutral', icon: '➖' });
    }

    // Confluence check
    if (enhancements.confluence?.hasConfluence) {
      checks.push({ name: 'S/R', status: 'pass', icon: '🎯' });
    } else {
      checks.push({ name: 'S/R', status: 'neutral', icon: '➖' });
    }

    // Candle confirmation
    if (enhancements.candle?.hasConfirmation) {
      checks.push({ name: 'Candle', status: 'pass', icon: '🕯️' });
    } else {
      checks.push({ name: 'Candle', status: 'neutral', icon: '➖' });
    }

    // RSI divergence
    if (enhancements.rsi?.hasDivergence) {
      checks.push({ name: 'RSI', status: 'pass', icon: '📉' });
    } else {
      checks.push({ name: 'RSI', status: 'neutral', icon: '➖' });
    }

    const passCount = checks.filter(c => c.status === 'pass').length;
    const totalChecks = checks.length;

    return {
      hasEnhancements: true,
      checks,
      passCount,
      totalChecks,
      qualityGrade: pattern.qualityGrade,
      enhancementScore: pattern.enhancementScore,
      rrOptimized: enhancements.riskReward?.optimized,
      message: `${passCount}/${totalChecks} confirmations`,
    };
  }
}

export const patternDetection = new PatternDetectionService();

/**
 * Standalone function to detect all patterns from candles
 * Used by multiPatternScanner which fetches candles separately
 * @param {Array} candles - Candle data array
 * @param {Object} options - Detection options
 * @returns {Promise<Array>} Detected patterns
 */
export async function detectAllPatterns(candles, options = {}) {
  const {
    symbol = 'UNKNOWN',
    timeframe = '4h',
    tier = 'FREE',
    patternTypes = null,
    includeEnhancements = true,
    filterValidZones = false, // NEW: Filter only valid zones (not broken)
    filterFreshZones = false, // NEW: Filter only fresh zones (not tested)
  } = options;

  if (!candles || candles.length < 30) {
    console.log('[detectAllPatterns] Not enough candles:', candles?.length);
    return [];
  }

  // ========================================
  // 21-DAY LOOKBACK LIMIT
  // ========================================
  // Limit candles to 21 days worth based on timeframe
  // This prevents scanning full history and focuses on recent patterns
  const candlesFor21Days = patternDetection.getCandlesFor21Days(timeframe);
  const limitedCandles = candles.length > candlesFor21Days
    ? candles.slice(-candlesFor21Days)
    : candles;

  console.log(`[detectAllPatterns] Using ${limitedCandles.length} candles (21-day limit: ${candlesFor21Days}) for ${timeframe}`);

  // Set tier
  patternDetection.setUserTier(tier);

  const patterns = [];
  const userTier = tier;

  try {
    // ============================================
    // FREE TIER PATTERNS (3 patterns)
    // ============================================
    const dpd = patternDetection.detectDPD(limitedCandles, symbol, timeframe);
    if (dpd) patterns.push(dpd);

    const upu = patternDetection.detectUPU(limitedCandles, symbol, timeframe);
    if (upu) patterns.push(upu);

    const hs = patternDetection.detectHeadAndShoulders(limitedCandles, symbol, timeframe);
    if (hs) patterns.push(hs);

    // ============================================
    // TIER 1 PATTERNS (+4 = 7 total)
    // ============================================
    if (['TIER1', 'TIER2', 'TIER3', 'ADMIN'].includes(userTier)) {
      const dpu = patternDetection.detectDPU(limitedCandles, symbol, timeframe);
      if (dpu) patterns.push(dpu);

      const upd = patternDetection.detectUPD(limitedCandles, symbol, timeframe);
      if (upd) patterns.push(upd);

      const dt = patternDetection.detectDoubleTop(limitedCandles, symbol, timeframe);
      if (dt) patterns.push(dt);

      const db = patternDetection.detectDoubleBottom(limitedCandles, symbol, timeframe);
      if (db) patterns.push(db);
    }

    // ============================================
    // TIER 2 PATTERNS (+8 = 15 total)
    // ============================================
    if (['TIER2', 'TIER3', 'ADMIN'].includes(userTier)) {
      const ihs = patternDetection.detectInverseHeadShoulders(limitedCandles, symbol, timeframe);
      if (ihs) patterns.push(ihs);

      const at = patternDetection.detectAscendingTriangle(limitedCandles, symbol, timeframe);
      if (at) patterns.push(at);

      const dt2 = patternDetection.detectDescendingTriangle(limitedCandles, symbol, timeframe);
      if (dt2) patterns.push(dt2);

      const st = patternDetection.detectSymmetricalTriangle(limitedCandles, symbol, timeframe);
      if (st) patterns.push(st);

      const hfz = patternDetection.detectHFZ(limitedCandles, symbol, timeframe);
      if (hfz) patterns.push(hfz);

      const lfz = patternDetection.detectLFZ(limitedCandles, symbol, timeframe);
      if (lfz) patterns.push(lfz);

      const rb = patternDetection.detectRoundingBottom(limitedCandles, symbol, timeframe);
      if (rb) patterns.push(rb);

      const rt = patternDetection.detectRoundingTop(limitedCandles, symbol, timeframe);
      if (rt) patterns.push(rt);
    }

    // ============================================
    // TIER 3 PATTERNS (+7 = 22 total)
    // ============================================
    if (['TIER3', 'ADMIN'].includes(userTier)) {
      const bf = patternDetection.detectBullFlag(limitedCandles, symbol, timeframe);
      if (bf) patterns.push(bf);

      const brf = patternDetection.detectBearFlag(limitedCandles, symbol, timeframe);
      if (brf) patterns.push(brf);

      const wdg = patternDetection.detectWedge(limitedCandles, symbol, timeframe);
      if (wdg) patterns.push(wdg);

      const eng = patternDetection.detectEngulfing(limitedCandles, symbol, timeframe);
      if (eng) patterns.push(eng);

      const mes = patternDetection.detectMorningEveningStar(limitedCandles, symbol, timeframe);
      if (mes) patterns.push(mes);

      const cup = patternDetection.detectCupHandle(limitedCandles, symbol, timeframe);
      if (cup) patterns.push(cup);

      const hm = patternDetection.detectHammer(limitedCandles, symbol, timeframe);
      if (hm) patterns.push(hm);

      // Advanced GEM Frequency patterns
      const qmlB = patternDetection.detectQuasimodoBearish(limitedCandles, symbol, timeframe);
      if (qmlB) patterns.push(qmlB);

      const qmlL = patternDetection.detectQuasimodoBullish(limitedCandles, symbol, timeframe);
      if (qmlL) patterns.push(qmlL);

      const ftrB = patternDetection.detectFTRBearish(limitedCandles, symbol, timeframe);
      if (ftrB) patterns.push(ftrB);

      const ftrL = patternDetection.detectFTRBullish(limitedCandles, symbol, timeframe);
      if (ftrL) patterns.push(ftrL);

      const flB = patternDetection.detectFlagLimitBearish(limitedCandles, symbol, timeframe);
      if (flB) patterns.push(flB);

      const flL = patternDetection.detectFlagLimitBullish(limitedCandles, symbol, timeframe);
      if (flL) patterns.push(flL);

      const dpB = patternDetection.detectDecisionPointBearish(limitedCandles, symbol, timeframe);
      if (dpB) patterns.push(dpB);

      const dpL = patternDetection.detectDecisionPointBullish(limitedCandles, symbol, timeframe);
      if (dpL) patterns.push(dpL);
    }

    // ========================================
    // ZONE VALIDITY FILTERING
    // ========================================
    let filteredPatterns = patterns;

    // Filter by patternTypes if provided
    if (patternTypes && patternTypes.length > 0) {
      filteredPatterns = filteredPatterns.filter(p => patternTypes.includes(p.type) || patternTypes.includes(p.name));
    }

    // Filter valid zones (zones that haven't been broken)
    if (filterValidZones || filterFreshZones) {
      filteredPatterns = filteredPatterns.filter(pattern => {
        // Skip if pattern doesn't have zone data
        if (!pattern.zoneHigh || !pattern.zoneLow) return true;

        // Get candles after the zone formation
        const zoneEndIndex = pattern.endCandleIndex || limitedCandles.length - 10;
        const candlesAfterZone = limitedCandles.slice(zoneEndIndex);

        if (candlesAfterZone.length === 0) return true; // No candles to check, keep zone

        // Check zone validity
        const validity = patternDetection.checkZoneValidity(
          { zoneHigh: pattern.zoneHigh, zoneLow: pattern.zoneLow },
          candlesAfterZone,
          pattern.direction
        );

        // Add validity info to pattern
        pattern.zoneValidity = validity;

        // Filter based on options
        if (filterFreshZones) {
          // Only keep fresh zones (not tested, not broken)
          return validity.fresh;
        }
        if (filterValidZones) {
          // Keep valid zones (not broken, may be tested)
          return validity.valid;
        }
        return true;
      });

      console.log(`[detectAllPatterns] After zone filter: ${filteredPatterns.length} valid patterns`);
    }

    console.log(`[detectAllPatterns] Found ${filteredPatterns.length} patterns for ${symbol} ${timeframe}`);
    return filteredPatterns;

  } catch (error) {
    console.error('[detectAllPatterns] Error:', error);
    return [];
  }
}

export default patternDetection;
