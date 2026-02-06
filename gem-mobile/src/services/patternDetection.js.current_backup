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
  calculateSmartTP,
} from './zoneCalculator';

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
    fullName: 'Down-Peak-Down',
    direction: 'SHORT',
    type: 'continuation',
    color: '#FF6B6B',
    description: 'Bearish continuation - Lower high formed, expect further downside',
    expectedWinRate: 65,
    avgRR: 2.1,
  },
  UPU: {
    name: 'UPU',
    fullName: 'Up-Peak-Up',
    direction: 'LONG',
    type: 'continuation',
    color: '#3AF7A6',
    description: 'Bullish continuation - Higher low formed, expect further upside',
    expectedWinRate: 68,
    avgRR: 2.3,
  },
  DPU: {
    name: 'DPU',
    fullName: 'Down-Peak-Up',
    direction: 'LONG',
    type: 'reversal',
    color: '#3AF7A6',
    description: 'Bullish reversal - Downtrend ending, higher low signals reversal',
    expectedWinRate: 62,
    avgRR: 2.0,
  },
  UPD: {
    name: 'UPD',
    fullName: 'Up-Peak-Down',
    direction: 'SHORT',
    type: 'reversal',
    color: '#FF6B6B',
    description: 'Bearish reversal - Uptrend ending, lower high signals reversal',
    expectedWinRate: 60,
    avgRR: 2.0,
  },
  'Head & Shoulders': {
    name: 'H&S',
    fullName: 'Head & Shoulders',
    direction: 'SHORT',
    type: 'reversal',
    color: '#FF6B6B',
    description: 'Classic bearish reversal - Break neckline to confirm',
    expectedWinRate: 72,
    avgRR: 2.5,
  },
  'Inverse H&S': {
    name: 'IH&S',
    fullName: 'Inverse Head & Shoulders',
    direction: 'LONG',
    type: 'reversal',
    color: '#3AF7A6',
    description: 'Classic bullish reversal pattern',
    expectedWinRate: 70,
    avgRR: 2.4,
  },
  'Double Top': {
    name: 'DT',
    fullName: 'Double Top',
    direction: 'SHORT',
    type: 'reversal',
    color: '#FF6B6B',
    description: 'Bearish reversal at resistance - Two peaks at similar level',
    expectedWinRate: 67,
    avgRR: 2.2,
  },
  'Double Bottom': {
    name: 'DB',
    fullName: 'Double Bottom',
    direction: 'LONG',
    type: 'reversal',
    color: '#3AF7A6',
    description: 'Bullish reversal at support - Two troughs at similar level',
    expectedWinRate: 68,
    avgRR: 2.3,
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

    // Candles per 7 days for each timeframe
    this.CANDLES_PER_7_DAYS = {
      '1m': 10080,  // 7 * 24 * 60
      '3m': 3360,   // 7 * 24 * 20
      '5m': 2016,   // 7 * 24 * 12
      '15m': 672,   // 7 * 24 * 4
      '30m': 336,   // 7 * 24 * 2
      '1h': 168,    // 7 * 24
      '2h': 84,     // 7 * 12
      '4h': 42,     // 7 * 6
      '6h': 28,     // 7 * 4
      '8h': 21,     // 7 * 3
      '12h': 14,    // 7 * 2
      '1d': 7,      // 7
      '3d': 3,      // ~2-3
      '1w': 1,      // 1
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
   * Get number of candles to scan (7 days worth)
   * @param {string} timeframe - Timeframe string
   * @returns {number} Number of candles
   */
  getCandlesFor7Days(timeframe) {
    return this.CANDLES_PER_7_DAYS[timeframe] || 168; // Default to 1h equivalent
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
        // ⚠️ FIX: Use pauseCandles timestamps instead of pattern.points
        // This ensures zone time position matches where zone prices were calculated
        // Without this fix, zones would float in areas with no candles
        startTime: (() => {
          // FIRST: Use FIRST pause candle timestamp (where zone prices come from)
          if (pauseCandles[0]?.timestamp) {
            let ts = pauseCandles[0].timestamp;
            if (ts > 9999999999) ts = Math.floor(ts / 1000);
            console.log(`[enrichWithZoneData] ${pattern.patternType} startTime from pauseCandles[0]: ${ts} (${new Date(ts * 1000).toISOString()})`);
            return ts;
          }
          // FALLBACK: Use pattern points timestamp (may cause floating zones)
          const st = this._extractPatternStartTime(pattern, candles);
          console.log(`[enrichWithZoneData] ${pattern.patternType} startTime FALLBACK from points: ${st}`);
          return st;
        })(),
        endTime: (() => {
          // FIRST: Use LAST pause candle timestamp
          const lastIdx = pauseCandles.length - 1;
          if (lastIdx >= 0 && pauseCandles[lastIdx]?.timestamp) {
            let ts = pauseCandles[lastIdx].timestamp;
            if (ts > 9999999999) ts = Math.floor(ts / 1000);
            console.log(`[enrichWithZoneData] ${pattern.patternType} endTime from pauseCandles[${lastIdx}]: ${ts}`);
            return ts;
          }
          // FALLBACK: Use pattern points timestamp
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
   * DPD Pattern (Down-Peak-Down) - Bearish Continuation
   * Structure: Lower high formation in downtrend
   */
  detectDPD(candles, symbol, timeframe) {
    if (candles.length < this.MIN_CANDLES) return null;

    const { swingHighs, swingLows } = this.findSwingPoints(candles, 3); // Reduced lookback

    if (swingHighs.length < 2) return null;

    const recentHighs = swingHighs.slice(-4);
    const recentLows = swingLows.slice(-4);

    if (recentHighs.length < 2) return null;

    const high1 = recentHighs[recentHighs.length - 2];
    const high2 = recentHighs[recentHighs.length - 1];

    // High2 must be lower than High1 (lower high) - with tolerance
    const highDiff = (high1.price - high2.price) / high1.price;
    if (highDiff < 0.005) return null; // At least 0.5% lower

    // Find any low between highs or use the most recent low before high2
    let lowBetween = recentLows.find(l => l.index > high1.index && l.index < high2.index);
    if (!lowBetween && recentLows.length > 0) {
      lowBetween = recentLows.find(l => l.index < high2.index) || recentLows[recentLows.length - 1];
    }
    if (!lowBetween) return null;

    // Calculate metrics
    const lowerHighRatio = high2.price / high1.price;

    const confidence = this.calculateConfidence({
      symmetry: Math.min(highDiff * 10, 1),
      trendAligned: this.calculateTrend(candles.slice(0, 20)) === 'downtrend',
      swingClarity: 0.6,
    });

    if (confidence < 45) return null; // Lowered threshold

    const currentPrice = candles[candles.length - 1].close;
    const signal = PATTERN_SIGNALS.DPD;
    const entry = lowBetween.price;

    // TIMEFRAME-SCALED TP/SL
    // Base: 1% SL above high2, 2:1 RR for target
    const slPercent = this.scaleSL(0.01, timeframe); // Scale 1% base SL
    const stopLoss = high2.price * (1 + slPercent);
    const riskAmount = stopLoss - entry;
    const rrMultiplier = 2.0; // Keep 2:1 R:R
    const target = entry - (riskAmount * rrMultiplier);

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
      points: { high1, high2, lowBetween },
    };
  }

  /**
   * UPU Pattern (Up-Peak-Up) - Bullish Continuation
   * Structure: Higher low formation in uptrend
   */
  detectUPU(candles, symbol, timeframe) {
    if (candles.length < this.MIN_CANDLES) return null;

    const { swingHighs, swingLows } = this.findSwingPoints(candles, 3); // Reduced lookback

    if (swingLows.length < 2) return null;

    const recentHighs = swingHighs.slice(-4);
    const recentLows = swingLows.slice(-4);

    if (recentLows.length < 2) return null;

    const low1 = recentLows[recentLows.length - 2];
    const low2 = recentLows[recentLows.length - 1];

    // Low2 must be higher than Low1 (higher low) - with tolerance
    const lowDiff = (low2.price - low1.price) / low1.price;
    if (lowDiff < 0.005) return null; // At least 0.5% higher

    // Find any high between lows or use the most recent high before low2
    let highBetween = recentHighs.find(h => h.index > low1.index && h.index < low2.index);
    if (!highBetween && recentHighs.length > 0) {
      highBetween = recentHighs.find(h => h.index < low2.index) || recentHighs[recentHighs.length - 1];
    }
    if (!highBetween) return null;

    const higherLowRatio = low2.price / low1.price;

    const confidence = this.calculateConfidence({
      symmetry: Math.min(lowDiff * 10, 1),
      trendAligned: this.calculateTrend(candles.slice(0, 20)) === 'uptrend',
      swingClarity: 0.6,
    });

    if (confidence < 45) return null; // Lowered threshold

    const currentPrice = candles[candles.length - 1].close;
    const signal = PATTERN_SIGNALS.UPU;
    const entry = highBetween.price;

    // TIMEFRAME-SCALED TP/SL
    // Base: 1% SL below low2, 2:1 RR for target
    const slPercent = this.scaleSL(0.01, timeframe); // Scale 1% base SL
    const stopLoss = low2.price * (1 - slPercent);
    const riskAmount = entry - stopLoss;
    const rrMultiplier = 2.0; // Keep 2:1 R:R
    const target = entry + (riskAmount * rrMultiplier);

    return {
      id: `UPU-${symbol}-${timeframe}-${Date.now()}`,
      patternType: 'UPU',
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
      points: { low1, low2, highBetween },
    };
  }

  /**
   * DPU Pattern (Down-Peak-Up) - Bullish Reversal
   * Structure: Downtrend followed by higher low
   */
  detectDPU(candles, symbol, timeframe) {
    if (candles.length < this.MIN_CANDLES) return null;

    const { swingHighs, swingLows } = this.findSwingPoints(candles, 3);

    if (swingLows.length < 2) return null;

    const recentLows = swingLows.slice(-4);
    const recentHighs = swingHighs.slice(-4);

    if (recentLows.length < 2) return null;

    const low1 = recentLows[recentLows.length - 2];
    const low2 = recentLows[recentLows.length - 1];

    // Low2 must be higher (reversal) - with small tolerance
    const lowDiff = (low2.price - low1.price) / low1.price;
    if (lowDiff < 0.003) return null; // At least 0.3% higher

    // Find peak between lows or any recent high
    let peak = recentHighs.find(h => h.index > low1.index && h.index < low2.index);
    if (!peak && recentHighs.length > 0) {
      peak = recentHighs[recentHighs.length - 1];
    }
    if (!peak) return null;

    const reversalStrength = lowDiff;

    const confidence = this.calculateConfidence({
      symmetry: Math.min(reversalStrength * 15, 1),
      trendAligned: false, // Reversal against trend
      swingClarity: 0.5,
    });

    if (confidence < 40) return null; // Lowered threshold

    const currentPrice = candles[candles.length - 1].close;
    const signal = PATTERN_SIGNALS.DPU;
    const entry = peak.price;

    // TIMEFRAME-SCALED TP/SL
    // Base: 2% SL below low2, 2:1 RR for target
    const slPercent = this.scaleSL(0.02, timeframe); // Scale 2% base SL
    const stopLoss = low2.price * (1 - slPercent);
    const riskAmount = entry - stopLoss;
    const rrMultiplier = 2.0; // 2:1 R:R
    const target = entry + (riskAmount * rrMultiplier);

    // ⚠️ FIX: Extract timestamps for zone positioning (convert ms to seconds for lightweight-charts)
    const low1Time = low1.timestamp > 9999999999 ? Math.floor(low1.timestamp / 1000) : low1.timestamp;
    const low2Time = low2.timestamp > 9999999999 ? Math.floor(low2.timestamp / 1000) : low2.timestamp;
    const peakTime = peak.timestamp > 9999999999 ? Math.floor(peak.timestamp / 1000) : peak.timestamp;

    return {
      id: `DPU-${symbol}-${timeframe}-${Date.now()}`,
      patternType: 'DPU',
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
      points: { low1, low2, peak },
      // ⚠️ FIX: Explicit zone data for zone rendering
      // LONG pattern: entry at top (zoneHigh), SL at bottom (zoneLow)
      zoneHigh: entry,
      zoneLow: stopLoss,
      // ⚠️ FIX: Explicit time data for zone X-axis positioning
      startTime: low1Time,
      endTime: peakTime,
      formationTime: low1Time,
      startCandleIndex: low1.index,
      endCandleIndex: peak.index,
    };
  }

  /**
   * UPD Pattern (Up-Peak-Down) - Bearish Reversal
   * Structure: Uptrend followed by lower high
   */
  detectUPD(candles, symbol, timeframe) {
    if (candles.length < this.MIN_CANDLES) return null;

    const { swingHighs, swingLows } = this.findSwingPoints(candles, 3);

    if (swingHighs.length < 2) return null;

    const recentHighs = swingHighs.slice(-4);
    const recentLows = swingLows.slice(-4);

    if (recentHighs.length < 2) return null;

    const high1 = recentHighs[recentHighs.length - 2];
    const high2 = recentHighs[recentHighs.length - 1];

    // High2 must be lower (reversal) - with tolerance
    const highDiff = (high1.price - high2.price) / high1.price;
    if (highDiff < 0.003) return null; // At least 0.3% lower

    // Find trough between highs or any recent low
    let trough = recentLows.find(l => l.index > high1.index && l.index < high2.index);
    if (!trough && recentLows.length > 0) {
      trough = recentLows[recentLows.length - 1];
    }
    if (!trough) return null;

    const reversalStrength = highDiff;

    const confidence = this.calculateConfidence({
      symmetry: Math.min(reversalStrength * 15, 1),
      trendAligned: false,
      swingClarity: 0.5,
    });

    if (confidence < 40) return null; // Lowered threshold

    const currentPrice = candles[candles.length - 1].close;
    const signal = PATTERN_SIGNALS.UPD;
    const entry = trough.price;

    // TIMEFRAME-SCALED TP/SL
    // Base: 2% SL above high2, 2:1 RR for target
    const slPercent = this.scaleSL(0.02, timeframe); // Scale 2% base SL
    const stopLoss = high2.price * (1 + slPercent);
    const riskAmount = stopLoss - entry;
    const rrMultiplier = 2.0; // 2:1 R:R
    const target = entry - (riskAmount * rrMultiplier);

    // ⚠️ FIX: Extract timestamps for zone positioning (convert ms to seconds for lightweight-charts)
    const high1Time = high1.timestamp > 9999999999 ? Math.floor(high1.timestamp / 1000) : high1.timestamp;
    const high2Time = high2.timestamp > 9999999999 ? Math.floor(high2.timestamp / 1000) : high2.timestamp;
    const troughTime = trough.timestamp > 9999999999 ? Math.floor(trough.timestamp / 1000) : trough.timestamp;

    return {
      id: `UPD-${symbol}-${timeframe}-${Date.now()}`,
      patternType: 'UPD',
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
      points: { high1, high2, trough },
      // ⚠️ FIX: Explicit zone data for zone rendering
      // SHORT pattern: SL at top (zoneHigh), entry at bottom (zoneLow)
      zoneHigh: stopLoss,
      zoneLow: entry,
      // ⚠️ FIX: Explicit time data for zone X-axis positioning
      startTime: high1Time,
      endTime: troughTime,
      formationTime: high1Time,
      startCandleIndex: high1.index,
      endCandleIndex: trough.index,
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

    // Head must be highest, shoulders roughly equal
    if (
      head.price <= leftShoulder.price ||
      head.price <= rightShoulder.price ||
      shoulderDiff > shoulderTolerance
    ) {
      return null;
    }

    // Find neckline
    const necklineLows = swingLows.filter(l =>
      l.index > leftShoulder.index && l.index < rightShoulder.index
    );
    if (necklineLows.length < 1) return null;

    const neckline = Math.min(...necklineLows.map(l => l.price));

    const confidence = this.calculateConfidence({
      symmetry: 1 - shoulderDiff,
      swingClarity: 0.8,
      trendAligned: this.calculateTrend(candles.slice(0, 30)) === 'uptrend',
    });

    if (confidence < 45) return null; // Lowered threshold

    const currentPrice = candles[candles.length - 1].close;
    const signal = PATTERN_SIGNALS['Head & Shoulders'];

    // TIMEFRAME-SCALED TP/SL
    // Entry slightly below neckline, SL above head
    const entryBuffer = this.scaleSL(0.005, timeframe); // 0.5% base buffer
    const slPercent = this.scaleSL(0.01, timeframe); // 1% base SL above head
    const entry = neckline * (1 - entryBuffer);
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

    // Tops should be at similar level (within 4%)
    const topDiff = Math.abs(top1.price - top2.price) / top1.price;
    if (topDiff > 0.04) return null; // Loosened from 2%

    // Find trough between tops or any recent low
    let trough = swingLows.find(l => l.index > top1.index && l.index < top2.index);
    if (!trough && swingLows.length > 0) {
      trough = swingLows[swingLows.length - 1];
    }
    if (!trough) return null;

    // Trough should be significant (lowered threshold)
    const troughDepth = (top1.price - trough.price) / top1.price;
    if (troughDepth < 0.01) return null; // Lowered from 2%

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

    // SMART TP: Use ATR capping + swing targets instead of raw pattern height
    const smartTP = calculateSmartTP({
      entry,
      stopLoss,
      direction: 'SHORT',
      candles,
      minRR: 2.0,
      maxATRMultiple: 3.5,
      patternHeight,
    });

    // Use smart TP if valid, otherwise fallback to capped pattern height
    const target = smartTP.isValid
      ? smartTP.price
      : entry - Math.min(patternHeight, calculateATR(candles, 14) * 3);

    const risk = stopLoss - entry;
    const reward = entry - target;
    const riskReward = risk > 0 ? (reward / risk).toFixed(1) : '2.0';

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
      riskReward,
      winRate: signal.expectedWinRate,
      detectedAt: Date.now(),
      currentPrice,
      points: { top1, top2, trough },
      // Smart TP metadata
      smartTP: smartTP.isValid ? {
        method: smartTP.method,
        reasoning: smartTP.reasoning,
        atr: smartTP.atr,
      } : null,
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

    // Bottoms should be at similar level (within 4%)
    const bottomDiff = Math.abs(bottom1.price - bottom2.price) / bottom1.price;
    if (bottomDiff > 0.04) return null; // Loosened from 2%

    // Find peak between bottoms or any recent high
    let peak = swingHighs.find(h => h.index > bottom1.index && h.index < bottom2.index);
    if (!peak && swingHighs.length > 0) {
      peak = swingHighs[swingHighs.length - 1];
    }
    if (!peak) return null;

    // Peak should be significant (lowered threshold)
    const peakHeight = (peak.price - bottom1.price) / bottom1.price;
    if (peakHeight < 0.01) return null; // Lowered from 2%

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

    // SMART TP: Use ATR capping + swing targets instead of raw pattern height
    const smartTP = calculateSmartTP({
      entry,
      stopLoss,
      direction: 'LONG',
      candles,
      minRR: 2.0,
      maxATRMultiple: 3.5,
      patternHeight, // Consider pattern height but cap it
    });

    // Use smart TP if valid, otherwise fallback to capped pattern height
    const target = smartTP.isValid
      ? smartTP.price
      : entry + Math.min(patternHeight, calculateATR(candles, 14) * 3);

    const risk = entry - stopLoss;
    const reward = target - entry;
    const riskReward = risk > 0 ? (reward / risk).toFixed(1) : '2.0';

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
      riskReward,
      winRate: signal.expectedWinRate,
      detectedAt: Date.now(),
      currentPrice,
      points: { bottom1, bottom2, peak },
      // Smart TP metadata
      smartTP: smartTP.isValid ? {
        method: smartTP.method,
        reasoning: smartTP.reasoning,
        atr: smartTP.atr,
      } : null,
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

    // Head lower than shoulders
    const headLower = head.price < leftShoulder.price * 1.02 && head.price < rightShoulder.price * 1.02;
    const shouldersEqual = Math.abs(leftShoulder.price - rightShoulder.price) < head.price * 0.03;

    if (headLower && shouldersEqual) {
      const currentPrice = candles[candles.length - 1].close;
      const neckline = (leftShoulder.price + rightShoulder.price) / 2;
      const signal = PATTERN_SIGNALS['Inverse H&S'];

      const symmetry = 1 - Math.abs(leftShoulder.price - rightShoulder.price) / head.price;
      const headDepth = (Math.min(leftShoulder.price, rightShoulder.price) - head.price) / head.price;
      let confidence = 65 + symmetry * 15;
      if (headDepth > 0.03) confidence += 10;
      confidence = Math.min(confidence, 90);

      // TIMEFRAME-SCALED TP/SL
      const entryBuffer = this.scaleSL(0.01, timeframe); // 1% base entry buffer
      const slPercent = this.scaleSL(0.01, timeframe); // 1% base SL below head
      const entry = neckline * (1 + entryBuffer);
      const stopLoss = head.price * (1 - slPercent);
      const patternHeight = neckline - head.price;

      // SMART TP: Use ATR capping + swing targets
      const smartTP = calculateSmartTP({
        entry,
        stopLoss,
        direction: 'LONG',
        candles,
        minRR: 2.0,
        maxATRMultiple: 3.5,
        patternHeight,
      });

      const target = smartTP.isValid
        ? smartTP.price
        : entry + Math.min(patternHeight, calculateATR(candles, 14) * 3);

      const risk = entry - stopLoss;
      const reward = target - entry;
      const riskReward = risk > 0 ? parseFloat((reward / risk).toFixed(1)) : 2.4;

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
        riskReward,
        winRate: signal.expectedWinRate,
        detectedAt: Date.now(),
        currentPrice,
        neckline,
        points: { leftShoulder, head, rightShoulder },
        // Smart TP metadata
        smartTP: smartTP.isValid ? {
          method: smartTP.method,
          reasoning: smartTP.reasoning,
          atr: smartTP.atr,
        } : null,
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

      // TIMEFRAME-SCALED TP/SL
      const slPercent = this.scaleSL(0.03, timeframe); // 3% base SL (symmetrical patterns more volatile)
      const tpPercent = this.scaleTP(0.05, timeframe); // 5% base TP
      const entry = currentPrice;
      const stopLoss = currentPrice * (1 - slPercent);
      const targetPrice = currentPrice * (1 + tpPercent);

      // FIX: Extract timestamps for zone positioning (convert ms to seconds for lightweight-charts)
      const high1Time = recentHighs[0].timestamp > 9999999999 ? Math.floor(recentHighs[0].timestamp / 1000) : recentHighs[0].timestamp;
      const low2Time = recentLows[1].timestamp > 9999999999 ? Math.floor(recentLows[1].timestamp / 1000) : recentLows[1].timestamp;

      return {
        id: `ST-${symbol}-${timeframe}-${Date.now()}`,
        patternType: 'Symmetrical Triangle',
        symbol,
        timeframe,
        confidence: 65,
        direction: signal.direction,
        type: signal.type,
        color: signal.color,
        description: signal.description,
        entry,
        stopLoss,
        target: targetPrice,
        riskReward: 2.0,
        winRate: signal.expectedWinRate,
        detectedAt: Date.now(),
        currentPrice,
        points: { high1: recentHighs[0], high2: recentHighs[1], low1: recentLows[0], low2: recentLows[1] },
        // FIX: Explicit zone data for zone rendering
        // LONG pattern: entry at top (zoneHigh), SL at bottom (zoneLow)
        zoneHigh: entry,
        zoneLow: stopLoss,
        // FIX: Explicit time data for zone X-axis positioning
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
   */
  detectHFZ(candles, symbol, timeframe) {
    if (candles.length < 40) return null;

    const { swingHighs } = this.findSwingPoints(candles, 3);
    if (swingHighs.length < 3) return null;

    const recentHighs = swingHighs.slice(-5);
    const avgHigh = recentHighs.reduce((sum, h) => sum + h.price, 0) / recentHighs.length;
    const isCluster = recentHighs.every(h => Math.abs(h.price - avgHigh) / avgHigh < 0.015);

    if (isCluster) {
      const currentPrice = candles[candles.length - 1].close;
      const signal = PATTERN_SIGNALS['HFZ'];

      // Get first and last swing high for time positioning
      const firstHigh = recentHighs[0];
      const lastHigh = recentHighs[recentHighs.length - 1];

      // TIMEFRAME-SCALED TP/SL
      const entryBuffer = this.scaleSL(0.01, timeframe); // 1% below current
      const slPercent = this.scaleSL(0.01, timeframe); // 1% above avg high
      const entry = currentPrice * (1 - entryBuffer);
      const stopLoss = avgHigh * (1 + slPercent);

      // SMART TP: Use ATR capping + swing targets
      const smartTP = calculateSmartTP({
        entry,
        stopLoss,
        direction: 'SHORT',
        candles,
        minRR: 2.0,
        maxATRMultiple: 3.5,
      });

      // Use smart TP if valid, otherwise fallback
      const targetPrice = smartTP.isValid
        ? smartTP.price
        : entry - (calculateATR(candles, 14) * 2.5);

      const risk = stopLoss - entry;
      const reward = entry - targetPrice;
      const riskReward = risk > 0 ? parseFloat((reward / risk).toFixed(1)) : 2.0;

      // FIX: Extract timestamps for zone positioning (convert ms to seconds for lightweight-charts)
      const firstHighTime = firstHigh.timestamp > 9999999999 ? Math.floor(firstHigh.timestamp / 1000) : firstHigh.timestamp;
      const lastHighTime = lastHigh.timestamp > 9999999999 ? Math.floor(lastHigh.timestamp / 1000) : lastHigh.timestamp;

      return {
        id: `HFZ-${symbol}-${timeframe}-${Date.now()}`,
        patternType: 'HFZ',
        symbol,
        timeframe,
        confidence: 70,
        direction: signal.direction,
        type: signal.type,
        color: signal.color,
        description: signal.description,
        entry,
        stopLoss,
        target: targetPrice,
        riskReward,
        winRate: signal.expectedWinRate,
        detectedAt: Date.now(),
        currentPrice,
        zone: { top: avgHigh * 1.005, bottom: avgHigh * 0.995, mid: avgHigh },
        points: { firstHigh, lastHigh, cluster: recentHighs },
        // Smart TP metadata
        smartTP: smartTP.isValid ? {
          method: smartTP.method,
          reasoning: smartTP.reasoning,
          atr: smartTP.atr,
        } : null,
        // FIX: Explicit zone data for zone rendering
        // SHORT pattern: SL at top (zoneHigh), entry at bottom (zoneLow)
        zoneHigh: stopLoss,
        zoneLow: entry,
        // FIX: Explicit time data for zone X-axis positioning
        startTime: firstHighTime,
        endTime: lastHighTime,
        formationTime: firstHighTime,
        startCandleIndex: firstHigh.index,
        endCandleIndex: lastHigh.index,
      };
    }
    return null;
  }

  /**
   * LFZ - Low Frequency Zone (Support) (TIER 2)
   */
  detectLFZ(candles, symbol, timeframe) {
    if (candles.length < 40) return null;

    const { swingLows } = this.findSwingPoints(candles, 3);
    if (swingLows.length < 3) return null;

    const recentLows = swingLows.slice(-5);
    const avgLow = recentLows.reduce((sum, l) => sum + l.price, 0) / recentLows.length;
    const isCluster = recentLows.every(l => Math.abs(l.price - avgLow) / avgLow < 0.015);

    if (isCluster) {
      const currentPrice = candles[candles.length - 1].close;
      const signal = PATTERN_SIGNALS['LFZ'];

      // Get first and last swing low for time positioning
      const firstLow = recentLows[0];
      const lastLow = recentLows[recentLows.length - 1];

      // TIMEFRAME-SCALED TP/SL
      const entryBuffer = this.scaleSL(0.01, timeframe); // 1% above current
      const slPercent = this.scaleSL(0.01, timeframe); // 1% below avg low
      const entry = currentPrice * (1 + entryBuffer);
      const stopLoss = avgLow * (1 - slPercent);

      // SMART TP: Use ATR capping + swing targets
      const smartTP = calculateSmartTP({
        entry,
        stopLoss,
        direction: 'LONG',
        candles,
        minRR: 2.0,
        maxATRMultiple: 3.5,
      });

      // Use smart TP if valid, otherwise fallback
      const targetPrice = smartTP.isValid
        ? smartTP.price
        : entry + (calculateATR(candles, 14) * 2.5);

      const risk = entry - stopLoss;
      const reward = targetPrice - entry;
      const riskReward = risk > 0 ? parseFloat((reward / risk).toFixed(1)) : 2.0;

      // FIX: Extract timestamps for zone positioning (convert ms to seconds for lightweight-charts)
      const firstLowTime = firstLow.timestamp > 9999999999 ? Math.floor(firstLow.timestamp / 1000) : firstLow.timestamp;
      const lastLowTime = lastLow.timestamp > 9999999999 ? Math.floor(lastLow.timestamp / 1000) : lastLow.timestamp;

      return {
        id: `LFZ-${symbol}-${timeframe}-${Date.now()}`,
        patternType: 'LFZ',
        symbol,
        timeframe,
        confidence: 70,
        direction: signal.direction,
        type: signal.type,
        color: signal.color,
        description: signal.description,
        entry,
        stopLoss,
        target: targetPrice,
        riskReward,
        winRate: signal.expectedWinRate,
        detectedAt: Date.now(),
        currentPrice,
        zone: { top: avgLow * 1.005, bottom: avgLow * 0.995, mid: avgLow },
        points: { firstLow, lastLow, cluster: recentLows },
        // Smart TP metadata
        smartTP: smartTP.isValid ? {
          method: smartTP.method,
          reasoning: smartTP.reasoning,
          atr: smartTP.atr,
        } : null,
        // FIX: Explicit zone data for zone rendering
        // LONG pattern: entry at top (zoneHigh), SL at bottom (zoneLow)
        zoneHigh: entry,
        zoneLow: stopLoss,
        // FIX: Explicit time data for zone X-axis positioning
        startTime: firstLowTime,
        endTime: lastLowTime,
        formationTime: firstLowTime,
        startCandleIndex: firstLow.index,
        endCandleIndex: lastLow.index,
      };
    }
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

    const poleStart = candles.length - 15;
    const poleEnd = candles.length - 10;
    const pole = candles.slice(poleStart, poleEnd);
    const poleRise = ((pole[pole.length - 1].close - pole[0].close) / pole[0].close) * 100;

    if (poleRise > 5) {
      const flag = candles.slice(-10);
      const flagRange = (Math.max(...flag.map(c => c.high)) - Math.min(...flag.map(c => c.low))) / flag[0].close * 100;

      if (flagRange < 3) {
        const currentPrice = candles[candles.length - 1].close;
        const signal = PATTERN_SIGNALS['Bull Flag'];

        // Get pole and flag candles for time positioning
        const poleStartCandle = candles[poleStart];
        const flagEndCandle = candles[candles.length - 1];

        // TIMEFRAME-SCALED TP/SL
        const entryBuffer = this.scaleSL(0.01, timeframe);
        const slPercent = this.scaleSL(0.02, timeframe);
        const entryPrice = currentPrice * (1 + entryBuffer);
        const flagLow = Math.min(...flag.map(c => c.low));
        const stopLossPrice = flagLow * (1 - slPercent);

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
          target: currentPrice + (pole[pole.length - 1].close - pole[0].close),
          riskReward: 2.5,
          winRate: signal.expectedWinRate,
          detectedAt: Date.now(),
          currentPrice,
          points: {
            poleStart: { index: poleStart, price: poleStartCandle.close, timestamp: poleStartCandle.timestamp },
            flagEnd: { index: candles.length - 1, price: flagEndCandle.close, timestamp: flagEndCandle.timestamp },
          }, // Added for zone positioning
        };
      }
    }
    return null;
  }

  /**
   * Bear Flag - Bearish Continuation (TIER 3)
   */
  detectBearFlag(candles, symbol, timeframe) {
    if (candles.length < 20) return null;

    const poleStart = candles.length - 15;
    const poleEnd = candles.length - 10;
    const pole = candles.slice(poleStart, poleEnd);
    const poleDrop = ((pole[0].close - pole[pole.length - 1].close) / pole[0].close) * 100;

    if (poleDrop > 5) {
      const flag = candles.slice(-10);
      const flagRange = (Math.max(...flag.map(c => c.high)) - Math.min(...flag.map(c => c.low))) / flag[0].close * 100;

      if (flagRange < 3) {
        const currentPrice = candles[candles.length - 1].close;
        const signal = PATTERN_SIGNALS['Bear Flag'];

        // Get pole and flag candles for time positioning
        const poleStartCandle = candles[poleStart];
        const flagEndCandle = candles[candles.length - 1];

        // TIMEFRAME-SCALED TP/SL
        const entryBuffer = this.scaleSL(0.01, timeframe);
        const slPercent = this.scaleSL(0.02, timeframe);
        const entryPrice = currentPrice * (1 - entryBuffer);
        const flagHigh = Math.max(...flag.map(c => c.high));
        const stopLossPrice = flagHigh * (1 + slPercent);

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
          target: currentPrice - (pole[0].close - pole[pole.length - 1].close),
          riskReward: 2.4,
          winRate: signal.expectedWinRate,
          detectedAt: Date.now(),
          currentPrice,
          points: {
            poleStart: { index: poleStart, price: poleStartCandle.close, timestamp: poleStartCandle.timestamp },
            flagEnd: { index: candles.length - 1, price: flagEndCandle.close, timestamp: flagEndCandle.timestamp },
          }, // Added for zone positioning
        };
      }
    }
    return null;
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

      return {
        id: `WDG-${symbol}-${timeframe}-${Date.now()}`,
        patternType: 'Wedge',
        pattern: isRisingWedge ? 'RISING_WEDGE' : 'FALLING_WEDGE',
        symbol,
        timeframe,
        confidence: 68,
        direction: isRisingWedge ? 'SHORT' : 'LONG',
        type: signal.type,
        color: isRisingWedge ? '#FF6B6B' : '#3AF7A6',
        description: signal.description,
        entry: currentPrice,
        stopLoss: isRisingWedge ? recentHighs[1].price * 1.01 : recentLows[1].price * 0.99,
        target: isRisingWedge ? currentPrice * 0.95 : currentPrice * 1.05,
        riskReward: 2.2,
        winRate: signal.expectedWinRate,
        detectedAt: Date.now(),
        currentPrice,
        points: { high1: recentHighs[0], high2: recentHighs[1], low1: recentLows[0], low2: recentLows[1] }, // Added for zone positioning
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

    const handleWindow = candles.slice(-10);
    const handleHigh = Math.max(...handleWindow.map(c => c.high));
    const handleLow = Math.min(...handleWindow.map(c => c.low));
    const handleRange = (handleHigh - handleLow) / handleHigh;

    if (handleRange < 0.05) {
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

    // Rising 3 Methods
    if (c1Up && middle3Down && c5Up) {
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

    if (c1Down && middle3Up && c5Down) {
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

  /**
   * Scan all patterns for a symbol
   * @param {String} symbol - Trading pair symbol
   * @param {String} timeframe - Candle timeframe
   * @param {String} userTier - Optional: override user tier for this scan
   */
  async detectPatterns(symbol, timeframe = '4h', userTier = null) {
    try {
      console.log(`[PatternDetection] Scanning ${symbol} on ${timeframe}...`);

      // Set user tier if provided
      if (userTier) {
        this.setUserTier(userTier);
      }

      const rawCandles = await binanceService.getCandles(symbol, timeframe, 500);

      if (!rawCandles || rawCandles.length < this.MIN_CANDLES) {
        console.log('[PatternDetection] Not enough candle data:', rawCandles?.length);
        return [];
      }

      // =====================================================
      // 7-DAY LOOKBACK LIMIT: Only scan recent patterns
      // Prevents scanning full history, focuses on actionable patterns
      // =====================================================
      const candlesFor7Days = this.getCandlesFor7Days(timeframe);
      const candles = rawCandles.length > candlesFor7Days
        ? rawCandles.slice(-candlesFor7Days)
        : rawCandles;

      console.log(`[PatternDetection] 7-day limit applied: ${rawCandles.length} -> ${candles.length} candles (limit: ${candlesFor7Days})`);

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

      // Phase 1A: Sort by pattern strength first, then confidence
      // Reversal patterns (5 stars) > Continuation patterns (3 stars)
      return validPatterns.sort((a, b) => {
        // Primary sort: pattern strength (descending)
        const strengthA = a.patternConfig?.strength || 1;
        const strengthB = b.patternConfig?.strength || 1;
        if (strengthB !== strengthA) {
          return strengthB - strengthA;
        }
        // Secondary sort: confidence (descending)
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
  // 7-DAY LOOKBACK LIMIT
  // ========================================
  // Limit candles to 7 days worth based on timeframe
  // This prevents scanning full history and focuses on recent patterns
  const candlesFor7Days = patternDetection.getCandlesFor7Days(timeframe);
  const limitedCandles = candles.length > candlesFor7Days
    ? candles.slice(-candlesFor7Days)
    : candles;

  console.log(`[detectAllPatterns] Using ${limitedCandles.length} candles (7-day limit: ${candlesFor7Days}) for ${timeframe}`);

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
