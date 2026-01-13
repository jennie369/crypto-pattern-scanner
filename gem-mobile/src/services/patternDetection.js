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
        // ⚠️ CRITICAL FIX: Even if zone calc fails, STILL extract time data for positioning!
        const startTime = this._extractPatternStartTime(pattern, candles);
        const endTime = this._extractPatternEndTime(pattern, candles);

        console.log(`[enrichWithZoneData] Zone calc failed for ${pattern.patternType}, but extracted times: startTime=${startTime}, endTime=${endTime}`);

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
          // ⚠️ CRITICAL: ALWAYS include time data for zone positioning
          startTime,
          endTime,
          startCandleIndex: this._extractPatternStartIndex(pattern, candles),
          endCandleIndex: this._extractPatternEndIndex(pattern, candles),
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
        // ⚠️ CRITICAL: Time fields for zone positioning on chart
        startTime: (() => {
          const st = this._extractPatternStartTime(pattern, candles);
          console.log(`[enrichWithZoneData] ${pattern.patternType} startTime: ${st} (${st ? new Date(st * 1000).toISOString() : 'NULL'})`);
          return st;
        })(),
        endTime: (() => {
          const et = this._extractPatternEndTime(pattern, candles);
          console.log(`[enrichWithZoneData] ${pattern.patternType} endTime: ${et}`);
          return et;
        })(),
        startCandleIndex: this._extractPatternStartIndex(pattern, candles),
        endCandleIndex: this._extractPatternEndIndex(pattern, candles),
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
    const stopLoss = high2.price * 1.01;
    const riskAmount = stopLoss - entry;
    const target = entry - (riskAmount * 2);

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
      riskReward: 2.0,
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
    const stopLoss = low2.price * 0.99;
    const riskAmount = entry - stopLoss;
    const target = entry + (riskAmount * 2);

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
      riskReward: 2.0,
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
    const stopLoss = low2.price * 0.98;
    const riskAmount = entry - stopLoss;
    const target = entry + riskAmount;

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
      riskReward: 1.0,
      winRate: signal.expectedWinRate,
      detectedAt: Date.now(),
      currentPrice,
      points: { low1, low2, peak }, // Added for zone positioning
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
    const stopLoss = high2.price * 1.02;
    const riskAmount = stopLoss - entry;
    const target = entry - riskAmount;

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
      riskReward: 1.0,
      winRate: signal.expectedWinRate,
      detectedAt: Date.now(),
      currentPrice,
      points: { high1, high2, trough }, // Added for zone positioning
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
    const entry = neckline * 0.995;
    const stopLoss = head.price * 1.01;
    const patternHeight = head.price - neckline;
    const target = neckline - patternHeight;

    // Get neckline lows with proper index reference
    const necklineLowPoints = swingLows.filter(l =>
      l.index > leftShoulder.index && l.index < rightShoulder.index
    );

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
      points: { leftShoulder, head, rightShoulder, necklineLow: necklineLowPoints[0] }, // Added for zone positioning
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
    const stopLoss = Math.max(top1.price, top2.price) * 1.01;
    const patternHeight = top1.price - trough.price;
    const target = entry - patternHeight;

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
    const stopLoss = Math.min(bottom1.price, bottom2.price) * 0.99;
    const patternHeight = peak.price - bottom1.price;
    const target = entry + patternHeight;

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
        entry: neckline * 1.01,
        stopLoss: head.price * 0.99,
        target: neckline + (neckline - head.price),
        riskReward: 2.4,
        winRate: signal.expectedWinRate,
        detectedAt: Date.now(),
        currentPrice,
        neckline,
        points: { leftShoulder, head, rightShoulder }, // Added for zone positioning
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
        entry: resistance * 1.01,
        stopLoss: support * 0.98,
        target: resistance + (resistance - support),
        riskReward: 2.2,
        winRate: signal.expectedWinRate,
        detectedAt: Date.now(),
        currentPrice,
        points: { firstHigh: firstPoint, lastLow: lastPoint, resistance: recentHighs[recentHighs.length - 1] }, // Added for zone positioning
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
        entry: support * 0.99,
        stopLoss: resistance * 1.02,
        target: support - (resistance - support),
        riskReward: 2.1,
        winRate: signal.expectedWinRate,
        detectedAt: Date.now(),
        currentPrice,
        points: { firstLow: firstPoint, lastHigh: lastPoint, support: recentLows[recentLows.length - 1] }, // Added for zone positioning
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
        entry: currentPrice,
        stopLoss: currentPrice * 0.97,
        target: currentPrice * 1.05,
        riskReward: 2.0,
        winRate: signal.expectedWinRate,
        detectedAt: Date.now(),
        currentPrice,
        points: { high1: recentHighs[0], high2: recentHighs[1], low1: recentLows[0], low2: recentLows[1] }, // Added for zone positioning
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
        entry: currentPrice * 0.99,
        stopLoss: avgHigh * 1.01,
        target: currentPrice * 0.95,
        riskReward: 2.3,
        winRate: signal.expectedWinRate,
        detectedAt: Date.now(),
        currentPrice,
        zone: { top: avgHigh * 1.005, bottom: avgHigh * 0.995, mid: avgHigh },
        points: { firstHigh, lastHigh, cluster: recentHighs }, // Added for zone positioning
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
        entry: currentPrice * 1.01,
        stopLoss: avgLow * 0.99,
        target: currentPrice * 1.05,
        riskReward: 2.3,
        winRate: signal.expectedWinRate,
        detectedAt: Date.now(),
        currentPrice,
        zone: { top: avgLow * 1.005, bottom: avgLow * 0.995, mid: avgLow },
        points: { firstLow, lastLow, cluster: recentLows }, // Added for zone positioning
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
        entry: currentPrice * 1.01,
        stopLoss: bottomPrice * 0.98,
        target: currentPrice + (currentPrice - bottomPrice),
        riskReward: 2.4,
        winRate: signal.expectedWinRate,
        detectedAt: Date.now(),
        currentPrice,
        points: {
          start: { index: windowStartIndex, price: startCandle.low, timestamp: startCandle.timestamp },
          bottom: { index: bottomIndex, price: bottomPrice, timestamp: bottomCandle.timestamp },
          end: { index: candles.length - 1, price: endCandle.close, timestamp: endCandle.timestamp },
        }, // Added for zone positioning
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
        entry: currentPrice * 0.99,
        stopLoss: topPrice * 1.02,
        target: currentPrice - (topPrice - currentPrice),
        riskReward: 2.2,
        winRate: signal.expectedWinRate,
        detectedAt: Date.now(),
        currentPrice,
        points: {
          start: { index: windowStartIndex, price: startCandle.high, timestamp: startCandle.timestamp },
          top: { index: topIndex, price: topPrice, timestamp: topCandle.timestamp },
          end: { index: candles.length - 1, price: endCandle.close, timestamp: endCandle.timestamp },
        }, // Added for zone positioning
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
          entry: currentPrice * 1.01,
          stopLoss: Math.min(...flag.map(c => c.low)) * 0.98,
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
          entry: currentPrice * 0.99,
          stopLoss: Math.max(...flag.map(c => c.high)) * 1.02,
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

      const candles = await binanceService.getCandles(symbol, timeframe, 150);

      if (!candles || candles.length < this.MIN_CANDLES) {
        console.log('[PatternDetection] Not enough candle data:', candles?.length);
        return [];
      }

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

      // Phase 1A: Sort by pattern strength first, then confidence
      // Reversal patterns (5 stars) > Continuation patterns (3 stars)
      return enhancedPatterns.sort((a, b) => {
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
  const { symbol = 'UNKNOWN', timeframe = '4h', tier = 'FREE', patternTypes = null, includeEnhancements = true } = options;

  if (!candles || candles.length < 30) {
    console.log('[detectAllPatterns] Not enough candles:', candles?.length);
    return [];
  }

  // Set tier
  patternDetection.setUserTier(tier);

  const patterns = [];
  const userTier = tier;

  try {
    // ============================================
    // FREE TIER PATTERNS (3 patterns)
    // ============================================
    const dpd = patternDetection.detectDPD(candles, symbol, timeframe);
    if (dpd) patterns.push(dpd);

    const upu = patternDetection.detectUPU(candles, symbol, timeframe);
    if (upu) patterns.push(upu);

    const hs = patternDetection.detectHeadAndShoulders(candles, symbol, timeframe);
    if (hs) patterns.push(hs);

    // ============================================
    // TIER 1 PATTERNS (+4 = 7 total)
    // ============================================
    if (['TIER1', 'TIER2', 'TIER3', 'ADMIN'].includes(userTier)) {
      const dpu = patternDetection.detectDPU(candles, symbol, timeframe);
      if (dpu) patterns.push(dpu);

      const upd = patternDetection.detectUPD(candles, symbol, timeframe);
      if (upd) patterns.push(upd);

      const dt = patternDetection.detectDoubleTop(candles, symbol, timeframe);
      if (dt) patterns.push(dt);

      const db = patternDetection.detectDoubleBottom(candles, symbol, timeframe);
      if (db) patterns.push(db);
    }

    // ============================================
    // TIER 2 PATTERNS (+8 = 15 total)
    // ============================================
    if (['TIER2', 'TIER3', 'ADMIN'].includes(userTier)) {
      const ihs = patternDetection.detectInverseHeadShoulders(candles, symbol, timeframe);
      if (ihs) patterns.push(ihs);

      const at = patternDetection.detectAscendingTriangle(candles, symbol, timeframe);
      if (at) patterns.push(at);

      const dt2 = patternDetection.detectDescendingTriangle(candles, symbol, timeframe);
      if (dt2) patterns.push(dt2);

      const st = patternDetection.detectSymmetricalTriangle(candles, symbol, timeframe);
      if (st) patterns.push(st);

      const hfz = patternDetection.detectHFZ(candles, symbol, timeframe);
      if (hfz) patterns.push(hfz);

      const lfz = patternDetection.detectLFZ(candles, symbol, timeframe);
      if (lfz) patterns.push(lfz);

      const rb = patternDetection.detectRoundingBottom(candles, symbol, timeframe);
      if (rb) patterns.push(rb);

      const rt = patternDetection.detectRoundingTop(candles, symbol, timeframe);
      if (rt) patterns.push(rt);
    }

    // ============================================
    // TIER 3 PATTERNS (+7 = 22 total)
    // ============================================
    if (['TIER3', 'ADMIN'].includes(userTier)) {
      const bf = patternDetection.detectBullFlag(candles, symbol, timeframe);
      if (bf) patterns.push(bf);

      const brf = patternDetection.detectBearFlag(candles, symbol, timeframe);
      if (brf) patterns.push(brf);

      const wdg = patternDetection.detectWedge(candles, symbol, timeframe);
      if (wdg) patterns.push(wdg);

      const eng = patternDetection.detectEngulfing(candles, symbol, timeframe);
      if (eng) patterns.push(eng);

      const mes = patternDetection.detectMorningEveningStar(candles, symbol, timeframe);
      if (mes) patterns.push(mes);

      const cup = patternDetection.detectCupHandle(candles, symbol, timeframe);
      if (cup) patterns.push(cup);

      const hm = patternDetection.detectHammer(candles, symbol, timeframe);
      if (hm) patterns.push(hm);
    }

    // Filter by patternTypes if provided
    let filteredPatterns = patterns;
    if (patternTypes && patternTypes.length > 0) {
      filteredPatterns = patterns.filter(p => patternTypes.includes(p.type) || patternTypes.includes(p.name));
    }

    console.log(`[detectAllPatterns] Found ${filteredPatterns.length} patterns for ${symbol} ${timeframe}`);
    return filteredPatterns;

  } catch (error) {
    console.error('[detectAllPatterns] Error:', error);
    return [];
  }
}

export default patternDetection;
