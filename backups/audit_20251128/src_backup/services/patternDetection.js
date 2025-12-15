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
 */

import { binanceService } from './binanceService';

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
};

class PatternDetectionService {
  constructor() {
    this.MIN_CANDLES = 30; // Reduced from 50
    this.ZONE_TOLERANCE = 0.03; // 3% tolerance for zone matching
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

  /**
   * Scan all patterns for a symbol
   */
  async detectPatterns(symbol, timeframe = '4h') {
    try {
      console.log(`[PatternDetection] Scanning ${symbol} on ${timeframe}...`);

      const candles = await binanceService.getCandles(symbol, timeframe, 150);

      if (!candles || candles.length < this.MIN_CANDLES) {
        console.log('[PatternDetection] Not enough candle data:', candles?.length);
        return [];
      }

      const patterns = [];

      // Run all detectors
      const dpd = this.detectDPD(candles, symbol, timeframe);
      if (dpd) patterns.push(dpd);

      const upu = this.detectUPU(candles, symbol, timeframe);
      if (upu) patterns.push(upu);

      const dpu = this.detectDPU(candles, symbol, timeframe);
      if (dpu) patterns.push(dpu);

      const upd = this.detectUPD(candles, symbol, timeframe);
      if (upd) patterns.push(upd);

      const hs = this.detectHeadAndShoulders(candles, symbol, timeframe);
      if (hs) patterns.push(hs);

      const dt = this.detectDoubleTop(candles, symbol, timeframe);
      if (dt) patterns.push(dt);

      const db = this.detectDoubleBottom(candles, symbol, timeframe);
      if (db) patterns.push(db);

      console.log(`[PatternDetection] Found ${patterns.length} patterns for ${symbol}`);

      return patterns.sort((a, b) => b.confidence - a.confidence);
    } catch (error) {
      console.error('[PatternDetection] Error:', error);
      return [];
    }
  }

  /**
   * Scan multiple symbols
   */
  async scanMultipleSymbols(symbols, timeframe = '4h') {
    const allPatterns = [];

    for (const symbol of symbols) {
      const patterns = await this.detectPatterns(symbol, timeframe);
      allPatterns.push(...patterns);
    }

    return allPatterns.sort((a, b) => b.confidence - a.confidence);
  }
}

export const patternDetection = new PatternDetectionService();
export default patternDetection;
