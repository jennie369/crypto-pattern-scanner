/**
 * Pattern Detection Service
 * Implements 3 basic patterns for FREE tier:
 * - DPD (Down-Pause-Down)
 * - UPU (Up-Pause-Up)
 * - Head & Shoulders
 */

import { binanceService } from './binanceService'
import { supabase } from '../lib/supabaseClient'
import { detectUPD } from '../utils/patterns/UPDPattern.js'
import { getPatternSignal } from '../constants/patternSignals'
import { validateAndFixPattern } from '../utils/patternValidator'

// ====================================
// PHASE 1: WIN RATE IMPROVEMENT UTILITIES
// ====================================
import { analyzeVolumeProfile, confirmVolumeDirection } from '../utils/volumeAnalysis'
import { analyzeTrend, calculateTrendBonus, getTrendAlignment } from '../utils/trendAnalysis'
import { validateRetest, getRetestStatus } from '../utils/retestValidation'
import { hasFeatureAccess, getTierConfig, isPremiumTier, normalizeTierName } from '../constants/tierFeatures'

// ====================================
// PHASE 2: HIGH IMPACT WIN RATE IMPROVEMENTS
// ====================================
import { findKeyLevels, checkConfluence } from '../utils/supportResistance'
import { checkCandleConfirmation } from '../utils/candlePatterns'

// ====================================
// PHASE 3: ADVANCED WIN RATE OPTIMIZATION
// ====================================
import { detectRSIDivergence } from '../utils/rsiDivergence'
import { optimizeRiskReward } from '../utils/dynamicRR'

class PatternDetectionService {

  /**
   * Calculate trend direction for a period
   * @param {Array} candles - Array of candlestick data
   * @param {number} period - Number of candles to analyze
   * @returns {string} - 'uptrend', 'downtrend', or 'neutral'
   */
  calculateTrend(candles, period = 20) {
    if (candles.length < period) return 'neutral'

    const recentCandles = candles.slice(-period)
    const firstPrice = recentCandles[0].close
    const lastPrice = recentCandles[recentCandles.length - 1].close

    const priceChange = ((lastPrice - firstPrice) / firstPrice) * 100

    if (priceChange > 1.5) return 'uptrend'
    if (priceChange < -1.5) return 'downtrend'
    return 'neutral'
  }

  /**
   * Find swing highs and lows in candlestick data
   * @param {Array} candles - Candlestick data
   * @param {number} lookback - Number of candles to look around
   * @returns {Object} - { swingHighs, swingLows }
   */
  findSwingPoints(candles, lookback = 5) {
    const swingHighs = []
    const swingLows = []

    for (let i = lookback; i < candles.length - lookback; i++) {
      const candle = candles[i]

      // Check if swing high
      let isSwingHigh = true
      for (let j = i - lookback; j <= i + lookback; j++) {
        if (j !== i && candles[j].high >= candle.high) {
          isSwingHigh = false
          break
        }
      }
      if (isSwingHigh) {
        swingHighs.push({ index: i, price: candle.high, timestamp: candle.timestamp })
      }

      // Check if swing low
      let isSwingLow = true
      for (let j = i - lookback; j <= i + lookback; j++) {
        if (j !== i && candles[j].low <= candle.low) {
          isSwingLow = false
          break
        }
      }
      if (isSwingLow) {
        swingLows.push({ index: i, price: candle.low, timestamp: candle.timestamp })
      }
    }

    return { swingHighs, swingLows }
  }

  /**
   * Pattern 1: DPD (Downtrend → Price Drop → Downtrend)
   * Bearish continuation pattern
   */
  detectDPD(candles) {
    if (candles.length < 60) return null

    const firstTrend = this.calculateTrend(candles.slice(0, 20))
    const middleTrend = this.calculateTrend(candles.slice(20, 40))
    const lastTrend = this.calculateTrend(candles.slice(40, 60))

    // Price drop in middle section
    const middleStart = candles[20].close
    const middleEnd = candles[39].close
    const priceDrop = ((middleEnd - middleStart) / middleStart) * 100

    if (firstTrend === 'downtrend' && priceDrop < -2 && lastTrend === 'downtrend') {
      const currentPrice = candles[candles.length - 1].close
      const signalInfo = getPatternSignal('DPD')

      return {
        patternType: 'DPD',
        pattern: 'DPD', // Legacy field
        confidence: this.calculateDPDConfidence(candles),
        description: signalInfo.description,
        signal: signalInfo.signal,
        direction: signalInfo.direction,
        type: signalInfo.type,
        color: signalInfo.color,
        icon: signalInfo.icon,
        iconColor: signalInfo.iconColor,
        label: signalInfo.label,
        fullLabel: signalInfo.fullLabel,
        expectedWinRate: signalInfo.expectedWinRate,
        avgRR: signalInfo.avgRR,
        bestTimeframes: signalInfo.bestTimeframes,
        goodTimeframes: signalInfo.goodTimeframes,
        cautionTimeframes: signalInfo.cautionTimeframes,
        entry: currentPrice * 0.98,
        stopLoss: currentPrice * 1.02,
        target: currentPrice * 0.90,
        takeProfit: currentPrice * 0.90, // Legacy field
        timeframe: '1h',
        detectedAt: Date.now(),
        timestamp: new Date()
      }
    }

    return null
  }

  calculateDPDConfidence(candles) {
    let confidence = 60

    // Check trend strength
    const trend1 = this.calculateTrend(candles.slice(0, 20))
    const trend2 = this.calculateTrend(candles.slice(40, 60))

    // Volume analysis
    const lastCandles = candles.slice(-20)
    const avgVolume = lastCandles.reduce((sum, c) => sum + c.volume, 0) / 20
    const recentVolume = lastCandles.slice(-5).reduce((sum, c) => sum + c.volume, 0) / 5

    if (recentVolume > avgVolume * 1.5) confidence += 15
    if (trend1 === 'downtrend' && trend2 === 'downtrend') confidence += 10

    return Math.min(confidence, 95)
  }

  /**
   * Pattern 2: UPU (Uptrend → Price Up → Uptrend)
   * Bullish continuation pattern
   */
  detectUPU(candles) {
    if (candles.length < 60) return null

    const firstTrend = this.calculateTrend(candles.slice(0, 20))
    const middleTrend = this.calculateTrend(candles.slice(20, 40))
    const lastTrend = this.calculateTrend(candles.slice(40, 60))

    // Price rise in middle section
    const middleStart = candles[20].close
    const middleEnd = candles[39].close
    const priceRise = ((middleEnd - middleStart) / middleStart) * 100

    if (firstTrend === 'uptrend' && priceRise > 2 && lastTrend === 'uptrend') {
      const currentPrice = candles[candles.length - 1].close
      const signalInfo = getPatternSignal('UPU')

      return {
        patternType: 'UPU',
        pattern: 'UPU', // Legacy field
        confidence: this.calculateUPUConfidence(candles),
        description: signalInfo.description,
        signal: signalInfo.signal,
        direction: signalInfo.direction,
        type: signalInfo.type,
        color: signalInfo.color,
        icon: signalInfo.icon,
        iconColor: signalInfo.iconColor,
        label: signalInfo.label,
        fullLabel: signalInfo.fullLabel,
        expectedWinRate: signalInfo.expectedWinRate,
        avgRR: signalInfo.avgRR,
        bestTimeframes: signalInfo.bestTimeframes,
        goodTimeframes: signalInfo.goodTimeframes,
        cautionTimeframes: signalInfo.cautionTimeframes,
        entry: currentPrice * 1.02,
        stopLoss: currentPrice * 0.98,
        target: currentPrice * 1.10,
        takeProfit: currentPrice * 1.10, // Legacy field
        timeframe: '1h',
        detectedAt: Date.now(),
        timestamp: new Date()
      }
    }

    return null
  }

  calculateUPUConfidence(candles) {
    let confidence = 60

    const lastCandles = candles.slice(-20)
    const avgVolume = lastCandles.reduce((sum, c) => sum + c.volume, 0) / 20
    const recentVolume = lastCandles.slice(-5).reduce((sum, c) => sum + c.volume, 0) / 5

    if (recentVolume > avgVolume * 1.5) confidence += 15

    const firstTrend = this.calculateTrend(candles.slice(0, 20))
    const lastTrend = this.calculateTrend(candles.slice(40, 60))
    if (firstTrend === 'uptrend' && lastTrend === 'uptrend') confidence += 10

    return Math.min(confidence, 95)
  }

  /**
   * Pattern 3: Head & Shoulders
   * Classic bearish reversal pattern
   */
  detectHeadAndShoulders(candles) {
    if (candles.length < 60) return null

    const { swingHighs } = this.findSwingPoints(candles)

    if (swingHighs.length < 3) return null

    // Get last 3 swing highs
    const recentHighs = swingHighs.slice(-3)
    const [leftShoulder, head, rightShoulder] = recentHighs

    // Validate pattern
    const leftLower = leftShoulder.price < head.price * 0.98
    const rightLower = rightShoulder.price < head.price * 0.98
    const shouldersEqual = Math.abs(leftShoulder.price - rightShoulder.price) < head.price * 0.02

    if (leftLower && rightLower && shouldersEqual) {
      const currentPrice = candles[candles.length - 1].close
      const signalInfo = getPatternSignal('HEAD_SHOULDERS')

      return {
        patternType: 'HEAD_SHOULDERS',
        pattern: 'HEAD_SHOULDERS', // Legacy field - matches PATTERN_SIGNALS key
        confidence: this.calculateHSConfidence(recentHighs),
        description: signalInfo.description,
        signal: signalInfo.signal,
        direction: signalInfo.direction,
        type: signalInfo.type,
        color: signalInfo.color,
        icon: signalInfo.icon,
        iconColor: signalInfo.iconColor,
        label: signalInfo.label,
        fullLabel: signalInfo.fullLabel,
        expectedWinRate: signalInfo.expectedWinRate,
        avgRR: signalInfo.avgRR,
        bestTimeframes: signalInfo.bestTimeframes,
        goodTimeframes: signalInfo.goodTimeframes,
        cautionTimeframes: signalInfo.cautionTimeframes,
        entry: currentPrice * 0.99,
        stopLoss: head.price,
        target: currentPrice * 0.92,
        takeProfit: currentPrice * 0.92, // Legacy field
        timeframe: '1h',
        detectedAt: Date.now(),
        timestamp: new Date(),
        keyPoints: {
          leftShoulder: leftShoulder.price,
          head: head.price,
          rightShoulder: rightShoulder.price
        }
      }
    }

    return null
  }

  calculateHSConfidence(highs) {
    const [left, head, right] = highs

    let confidence = 65

    // More symmetric = higher confidence
    const symmetry = 1 - Math.abs(left.price - right.price) / head.price
    confidence += symmetry * 15

    // Head significantly higher = higher confidence
    const headHeight = (head.price - Math.max(left.price, right.price)) / head.price
    if (headHeight > 0.03) confidence += 10

    return Math.min(confidence, 90)
  }

  /**
   * Pattern 4: UPD (Up-Pause-Down)
   * Sophisticated 3-phase bearish reversal pattern - TIER 1+
   * Win Rate: 65% | R:R: 1:2.2
   * Uses advanced volume distribution analysis
   */
  detectUPD(candles) {
    if (candles.length < 50) return null

    // Use the sophisticated UPD detector
    const patterns = detectUPD(candles, {
      minPhase1Candles: 10,
      minPhase1Change: 0.02,      // 2% minimum rally
      maxPhase2Candles: 5,        // Max 5 candles in pause
      minPhase2Candles: 1,        // Min 1 candle in pause
      maxPhase2Range: 0.015,      // 1.5% max range
      minPhase3Change: 0.02,      // 2% minimum drop
      volumeIncrease: 1.2,        // 20% above MA
      minConfidence: 60,          // 60% minimum confidence
      timeframe: '1h',
    })

    if (patterns.length === 0) return null

    // Get the first (most recent) pattern
    const upd = patterns[0]
    const signalInfo = getPatternSignal('UPD')

    // Convert to scanner format
    return {
      patternType: 'UPD',
      pattern: 'UPD', // Legacy field
      confidence: upd.confidence,
      description: signalInfo.description,
      signal: signalInfo.signal,
      direction: signalInfo.direction,
      type: signalInfo.type,
      color: signalInfo.color,
      icon: signalInfo.icon,
      iconColor: signalInfo.iconColor,
      label: signalInfo.label,
      fullLabel: signalInfo.fullLabel,
      expectedWinRate: signalInfo.expectedWinRate,
      avgRR: signalInfo.avgRR,
      bestTimeframes: signalInfo.bestTimeframes,
      goodTimeframes: signalInfo.goodTimeframes,
      cautionTimeframes: signalInfo.cautionTimeframes,
      entry: upd.entry,
      stopLoss: upd.stopLoss,
      target: upd.target,
      takeProfit: upd.target, // Legacy field
      riskReward: upd.riskReward,
      timeframe: '1h',
      detectedAt: Date.now(),
      timestamp: new Date(),
      // Additional pattern details
      zone: {
        type: 'HFZ',
        top: upd.zoneTop,
        bottom: upd.zoneBottom,
        mid: upd.zoneMid,
        status: upd.zoneStatus,
      },
      phases: {
        phase1: {
          candles: upd.phase1.candles,
          change: upd.phase1.change,
          volume: upd.phase1.volume,
        },
        phase2: {
          candles: upd.phase2.candles,
          range: upd.phase2.range,
          volume: upd.phase2.volume,
          hasDistribution: upd.hasDistribution,
        },
        phase3: {
          candles: upd.phase3.candles,
          change: upd.phase3.change,
          volume: upd.phase3.volume,
        },
      },
      validation: {
        hasStrongVolume: upd.hasStrongVolume,
        hasDistribution: upd.hasDistribution,
        isValidReversal: upd.isValidReversal,
      },
      // Include full pattern data for advanced users
      patternData: upd,
    }
  }

  /**
   * Pattern 5: DPU (Downtrend → Price Up → Uptrend)
   * Bullish reversal pattern - TIER 1+
   */
  detectDPU(candles) {
    if (candles.length < 60) return null

    const firstTrend = this.calculateTrend(candles.slice(0, 20))
    const middleTrend = this.calculateTrend(candles.slice(20, 40))
    const lastTrend = this.calculateTrend(candles.slice(40, 60))

    // Price rise in middle section
    const middleStart = candles[20].close
    const middleEnd = candles[39].close
    const priceRise = ((middleEnd - middleStart) / middleStart) * 100

    if (firstTrend === 'downtrend' && priceRise > 3 && lastTrend === 'uptrend') {
      const currentPrice = candles[candles.length - 1].close
      const signalInfo = getPatternSignal('DPU')

      return {
        patternType: 'DPU',
        pattern: 'DPU', // Legacy field
        confidence: this.calculateDPUConfidence(candles),
        description: signalInfo.description,
        signal: signalInfo.signal,
        direction: signalInfo.direction,
        type: signalInfo.type,
        color: signalInfo.color,
        icon: signalInfo.icon,
        iconColor: signalInfo.iconColor,
        label: signalInfo.label,
        fullLabel: signalInfo.fullLabel,
        expectedWinRate: signalInfo.expectedWinRate,
        avgRR: signalInfo.avgRR,
        bestTimeframes: signalInfo.bestTimeframes,
        goodTimeframes: signalInfo.goodTimeframes,
        cautionTimeframes: signalInfo.cautionTimeframes,
        entry: currentPrice * 1.01,
        stopLoss: currentPrice * 0.97,
        target: currentPrice * 1.07,
        takeProfit: currentPrice * 1.07, // Legacy field
        timeframe: '1h',
        detectedAt: Date.now(),
        timestamp: new Date()
      }
    }

    return null
  }

  calculateDPUConfidence(candles) {
    let confidence = 65

    const firstTrend = this.calculateTrend(candles.slice(0, 20))
    const lastTrend = this.calculateTrend(candles.slice(40, 60))

    if (firstTrend === 'downtrend' && lastTrend === 'uptrend') confidence += 10

    const lastCandles = candles.slice(-20)
    const avgVolume = lastCandles.reduce((sum, c) => sum + c.volume, 0) / 20
    const recentVolume = lastCandles.slice(-5).reduce((sum, c) => sum + c.volume, 0) / 5

    if (recentVolume > avgVolume * 1.5) confidence += 10

    return Math.min(confidence, 90)
  }

  /**
   * Pattern 6: Double Top
   * Bearish reversal pattern - TIER 1+
   */
  detectDoubleTop(candles) {
    if (candles.length < 60) return null

    const { swingHighs } = this.findSwingPoints(candles)

    if (swingHighs.length < 2) return null

    // Get last 2 swing highs
    const [peak1, peak2] = swingHighs.slice(-2)

    // Peaks should be roughly equal (within 2%)
    const priceEqual = Math.abs(peak1.price - peak2.price) < peak1.price * 0.02

    // Peaks should be separated by at least 10 candles
    const timeSpaced = peak2.index - peak1.index >= 10

    // Price should form a valley between peaks
    const valleyCandles = candles.slice(peak1.index, peak2.index)
    const lowestInValley = Math.min(...valleyCandles.map(c => c.low))
    const valleyDepth = ((peak1.price - lowestInValley) / peak1.price) * 100

    if (priceEqual && timeSpaced && valleyDepth > 2) {
      const currentPrice = candles[candles.length - 1].close
      const signalInfo = getPatternSignal('DOUBLE_TOP')

      return {
        patternType: 'DOUBLE_TOP',
        pattern: 'DOUBLE_TOP', // Legacy field
        confidence: this.calculateDoubleTopConfidence(peak1, peak2, valleyDepth),
        description: signalInfo.description,
        signal: signalInfo.signal,
        direction: signalInfo.direction,
        type: signalInfo.type,
        color: signalInfo.color,
        icon: signalInfo.icon,
        iconColor: signalInfo.iconColor,
        label: signalInfo.label,
        fullLabel: signalInfo.fullLabel,
        expectedWinRate: signalInfo.expectedWinRate,
        avgRR: signalInfo.avgRR,
        bestTimeframes: signalInfo.bestTimeframes,
        goodTimeframes: signalInfo.goodTimeframes,
        cautionTimeframes: signalInfo.cautionTimeframes,
        entry: currentPrice * 0.99,
        stopLoss: Math.max(peak1.price, peak2.price),
        target: lowestInValley * 0.98,
        takeProfit: lowestInValley * 0.98, // Legacy field
        timeframe: '1h',
        detectedAt: Date.now(),
        timestamp: new Date(),
        keyPoints: {
          peak1: peak1.price,
          peak2: peak2.price,
          valley: lowestInValley
        }
      }
    }

    return null
  }

  calculateDoubleTopConfidence(peak1, peak2, valleyDepth) {
    let confidence = 60

    // More equal peaks = higher confidence
    const equality = 1 - Math.abs(peak1.price - peak2.price) / peak1.price
    confidence += equality * 15

    // Deeper valley = higher confidence
    if (valleyDepth > 3) confidence += 10
    if (valleyDepth > 5) confidence += 5

    return Math.min(confidence, 90)
  }

  /**
   * Pattern 7: Double Bottom
   * Bullish reversal pattern - TIER 1+
   */
  detectDoubleBottom(candles) {
    if (candles.length < 60) return null

    const { swingLows } = this.findSwingPoints(candles)

    if (swingLows.length < 2) return null

    // Get last 2 swing lows
    const [bottom1, bottom2] = swingLows.slice(-2)

    // Bottoms should be roughly equal (within 2%)
    const priceEqual = Math.abs(bottom1.price - bottom2.price) < bottom1.price * 0.02

    // Bottoms should be separated by at least 10 candles
    const timeSpaced = bottom2.index - bottom1.index >= 10

    // Price should form a peak between bottoms
    const peakCandles = candles.slice(bottom1.index, bottom2.index)
    const highestInPeak = Math.max(...peakCandles.map(c => c.high))
    const peakHeight = ((highestInPeak - bottom1.price) / bottom1.price) * 100

    if (priceEqual && timeSpaced && peakHeight > 2) {
      const currentPrice = candles[candles.length - 1].close
      const signalInfo = getPatternSignal('DOUBLE_BOTTOM')

      return {
        patternType: 'DOUBLE_BOTTOM',
        pattern: 'DOUBLE_BOTTOM', // Legacy field
        confidence: this.calculateDoubleBottomConfidence(bottom1, bottom2, peakHeight),
        description: signalInfo.description,
        signal: signalInfo.signal,
        direction: signalInfo.direction,
        type: signalInfo.type,
        color: signalInfo.color,
        icon: signalInfo.icon,
        iconColor: signalInfo.iconColor,
        label: signalInfo.label,
        fullLabel: signalInfo.fullLabel,
        expectedWinRate: signalInfo.expectedWinRate,
        avgRR: signalInfo.avgRR,
        bestTimeframes: signalInfo.bestTimeframes,
        goodTimeframes: signalInfo.goodTimeframes,
        cautionTimeframes: signalInfo.cautionTimeframes,
        entry: currentPrice * 1.01,
        stopLoss: Math.min(bottom1.price, bottom2.price),
        target: highestInPeak * 1.02,
        takeProfit: highestInPeak * 1.02, // Legacy field
        timeframe: '1h',
        detectedAt: Date.now(),
        timestamp: new Date(),
        keyPoints: {
          bottom1: bottom1.price,
          bottom2: bottom2.price,
          peak: highestInPeak
        }
      }
    }

    return null
  }

  calculateDoubleBottomConfidence(bottom1, bottom2, peakHeight) {
    let confidence = 60

    // More equal bottoms = higher confidence
    const equality = 1 - Math.abs(bottom1.price - bottom2.price) / bottom1.price
    confidence += equality * 15

    // Higher peak = higher confidence
    if (peakHeight > 3) confidence += 10
    if (peakHeight > 5) confidence += 5

    return Math.min(confidence, 90)
  }

  /**
   * TIER 2 PATTERNS (8 patterns)
   */

  /**
   * Pattern 8: Inverse Head & Shoulders
   * Bullish reversal pattern - TIER 2+
   */
  detectInverseHeadShoulders(candles) {
    if (candles.length < 60) return null

    const { swingLows } = this.findSwingPoints(candles)

    if (swingLows.length < 3) return null

    // Get last 3 swing lows
    const recentLows = swingLows.slice(-3)
    const [leftShoulder, head, rightShoulder] = recentLows

    // Validate pattern: head lower than shoulders
    const headLower = head.price < leftShoulder.price * 1.02 && head.price < rightShoulder.price * 1.02
    const shouldersEqual = Math.abs(leftShoulder.price - rightShoulder.price) < head.price * 0.02

    if (headLower && shouldersEqual) {
      const currentPrice = candles[candles.length - 1].close
      const neckline = (leftShoulder.price + rightShoulder.price) / 2
      const signalInfo = getPatternSignal('INVERSE_HEAD_SHOULDERS')

      return {
        patternType: 'INVERSE_HEAD_SHOULDERS',
        pattern: 'INVERSE_HEAD_SHOULDERS',
        confidence: this.calculateIHSConfidence(recentLows),
        description: signalInfo.description,
        signal: signalInfo.signal,
        direction: signalInfo.direction,
        type: signalInfo.type,
        color: signalInfo.color,
        icon: signalInfo.icon,
        iconColor: signalInfo.iconColor,
        label: signalInfo.label,
        fullLabel: signalInfo.fullLabel,
        expectedWinRate: signalInfo.expectedWinRate,
        avgRR: signalInfo.avgRR,
        bestTimeframes: signalInfo.bestTimeframes,
        goodTimeframes: signalInfo.goodTimeframes,
        cautionTimeframes: signalInfo.cautionTimeframes,
        entry: neckline * 1.01,
        stopLoss: head.price * 0.99,
        target: neckline + (neckline - head.price),
        takeProfit: neckline + (neckline - head.price),
        timeframe: '1h',
        detectedAt: Date.now(),
        timestamp: new Date(),
        keyPoints: {
          leftShoulder: leftShoulder.price,
          head: head.price,
          rightShoulder: rightShoulder.price,
          neckline: neckline
        }
      }
    }

    return null
  }

  calculateIHSConfidence(lows) {
    const [left, head, right] = lows
    let confidence = 65

    const symmetry = 1 - Math.abs(left.price - right.price) / head.price
    confidence += symmetry * 15

    const headDepth = (Math.min(left.price, right.price) - head.price) / head.price
    if (headDepth > 0.03) confidence += 10

    return Math.min(confidence, 90)
  }

  /**
   * Pattern 9-10: Triangles (Ascending, Descending, Symmetrical)
   * TIER 2+ patterns
   */
  detectAscendingTriangle(candles) {
    if (candles.length < 30) return null

    const { swingHighs, swingLows } = this.findSwingPoints(candles, 3)
    if (swingHighs.length < 2 || swingLows.length < 2) return null

    // Check if highs form horizontal resistance
    const recentHighs = swingHighs.slice(-3)
    const highPrices = recentHighs.map(h => h.price)
    const highAvg = highPrices.reduce((a, b) => a + b) / highPrices.length
    const highVariance = highPrices.every(p => Math.abs(p - highAvg) / highAvg < 0.02)

    // Check if lows are rising
    const recentLows = swingLows.slice(-3)
    const lowsRising = recentLows.length >= 2 && recentLows[recentLows.length - 1].price > recentLows[0].price

    if (highVariance && lowsRising) {
      const currentPrice = candles[candles.length - 1].close
      const resistance = highAvg
      const support = recentLows[recentLows.length - 1].price
      const signalInfo = getPatternSignal('ASCENDING_TRIANGLE')

      return {
        patternType: 'ASCENDING_TRIANGLE',
        pattern: 'ASCENDING_TRIANGLE',
        confidence: 70,
        description: signalInfo.description,
        signal: signalInfo.signal,
        direction: signalInfo.direction,
        type: signalInfo.type,
        color: signalInfo.color,
        icon: signalInfo.icon,
        iconColor: signalInfo.iconColor,
        label: signalInfo.label,
        fullLabel: signalInfo.fullLabel,
        expectedWinRate: signalInfo.expectedWinRate,
        avgRR: signalInfo.avgRR,
        bestTimeframes: signalInfo.bestTimeframes,
        goodTimeframes: signalInfo.goodTimeframes,
        cautionTimeframes: signalInfo.cautionTimeframes,
        entry: resistance * 1.01,
        stopLoss: support * 0.98,
        target: resistance + (resistance - support),
        takeProfit: resistance + (resistance - support),
        timeframe: '1h',
        detectedAt: Date.now(),
        timestamp: new Date()
      }
    }

    return null
  }

  detectDescendingTriangle(candles) {
    if (candles.length < 30) return null

    const { swingHighs, swingLows } = this.findSwingPoints(candles, 3)
    if (swingHighs.length < 2 || swingLows.length < 2) return null

    // Check if lows form horizontal support
    const recentLows = swingLows.slice(-3)
    const lowPrices = recentLows.map(l => l.price)
    const lowAvg = lowPrices.reduce((a, b) => a + b) / lowPrices.length
    const lowVariance = lowPrices.every(p => Math.abs(p - lowAvg) / lowAvg < 0.02)

    // Check if highs are falling
    const recentHighs = swingHighs.slice(-3)
    const highsFalling = recentHighs.length >= 2 && recentHighs[recentHighs.length - 1].price < recentHighs[0].price

    if (lowVariance && highsFalling) {
      const currentPrice = candles[candles.length - 1].close
      const support = lowAvg
      const resistance = recentHighs[recentHighs.length - 1].price
      const signalInfo = getPatternSignal('DESCENDING_TRIANGLE')

      return {
        patternType: 'DESCENDING_TRIANGLE',
        pattern: 'DESCENDING_TRIANGLE',
        confidence: 70,
        description: signalInfo.description,
        signal: signalInfo.signal,
        direction: signalInfo.direction,
        type: signalInfo.type,
        color: signalInfo.color,
        icon: signalInfo.icon,
        iconColor: signalInfo.iconColor,
        label: signalInfo.label,
        fullLabel: signalInfo.fullLabel,
        expectedWinRate: signalInfo.expectedWinRate,
        avgRR: signalInfo.avgRR,
        bestTimeframes: signalInfo.bestTimeframes,
        goodTimeframes: signalInfo.goodTimeframes,
        cautionTimeframes: signalInfo.cautionTimeframes,
        entry: support * 0.99,
        stopLoss: resistance * 1.02,
        target: support - (resistance - support),
        takeProfit: support - (resistance - support),
        timeframe: '1h',
        detectedAt: Date.now(),
        timestamp: new Date()
      }
    }

    return null
  }

  detectSymmetricalTriangle(candles) {
    if (candles.length < 30) return null

    const { swingHighs, swingLows } = this.findSwingPoints(candles, 3)
    if (swingHighs.length < 2 || swingLows.length < 2) return null

    const recentHighs = swingHighs.slice(-2)
    const recentLows = swingLows.slice(-2)

    const highsFalling = recentHighs[1].price < recentHighs[0].price
    const lowsRising = recentLows[1].price > recentLows[0].price

    if (highsFalling && lowsRising) {
      const currentPrice = candles[candles.length - 1].close
      const upperLine = recentHighs[1].price
      const lowerLine = recentLows[1].price
      const signalInfo = getPatternSignal('SYMMETRICAL_TRIANGLE')

      return {
        patternType: 'SYMMETRICAL_TRIANGLE',
        pattern: 'SYMMETRICAL_TRIANGLE',
        confidence: 65,
        description: signalInfo.description,
        signal: signalInfo.signal,
        direction: signalInfo.direction,
        type: signalInfo.type,
        color: signalInfo.color,
        icon: signalInfo.icon,
        iconColor: signalInfo.iconColor,
        label: signalInfo.label,
        fullLabel: signalInfo.fullLabel,
        expectedWinRate: signalInfo.expectedWinRate,
        avgRR: signalInfo.avgRR,
        bestTimeframes: signalInfo.bestTimeframes,
        goodTimeframes: signalInfo.goodTimeframes,
        cautionTimeframes: signalInfo.cautionTimeframes,
        entry: currentPrice,
        stopLoss: currentPrice * 0.97,
        target: currentPrice * 1.05,
        takeProfit: currentPrice * 1.05,
        timeframe: '1h',
        detectedAt: Date.now(),
        timestamp: new Date()
      }
    }

    return null
  }

  /**
   * Pattern 11-12: HFZ & LFZ (High/Low Frequency Zones)
   * TIER 2+ patterns
   */
  detectHFZ(candles) {
    if (candles.length < 40) return null

    const { swingHighs } = this.findSwingPoints(candles, 3)
    if (swingHighs.length < 3) return null

    // Find clustered highs (price rejection zone)
    const recentHighs = swingHighs.slice(-5)
    const avgHigh = recentHighs.reduce((sum, h) => sum + h.price, 0) / recentHighs.length

    // Check if highs cluster tightly
    const isCluster = recentHighs.every(h => Math.abs(h.price - avgHigh) / avgHigh < 0.015)

    if (isCluster) {
      const currentPrice = candles[candles.length - 1].close
      const signalInfo = getPatternSignal('HFZ')

      return {
        patternType: 'HFZ',
        pattern: 'HFZ',
        confidence: 70,
        description: signalInfo.description,
        signal: signalInfo.signal,
        direction: signalInfo.direction,
        type: signalInfo.type,
        color: signalInfo.color,
        icon: signalInfo.icon,
        iconColor: signalInfo.iconColor,
        label: signalInfo.label,
        fullLabel: signalInfo.fullLabel,
        expectedWinRate: signalInfo.expectedWinRate,
        avgRR: signalInfo.avgRR,
        bestTimeframes: signalInfo.bestTimeframes,
        goodTimeframes: signalInfo.goodTimeframes,
        cautionTimeframes: signalInfo.cautionTimeframes,
        entry: currentPrice * 0.99,
        stopLoss: avgHigh * 1.01,
        target: currentPrice * 0.95,
        takeProfit: currentPrice * 0.95,
        timeframe: '1h',
        detectedAt: Date.now(),
        timestamp: new Date(),
        zone: { top: avgHigh * 1.005, bottom: avgHigh * 0.995, mid: avgHigh }
      }
    }

    return null
  }

  detectLFZ(candles) {
    if (candles.length < 40) return null

    const { swingLows } = this.findSwingPoints(candles, 3)
    if (swingLows.length < 3) return null

    // Find clustered lows (support zone)
    const recentLows = swingLows.slice(-5)
    const avgLow = recentLows.reduce((sum, l) => sum + l.price, 0) / recentLows.length

    // Check if lows cluster tightly
    const isCluster = recentLows.every(l => Math.abs(l.price - avgLow) / avgLow < 0.015)

    if (isCluster) {
      const currentPrice = candles[candles.length - 1].close
      const signalInfo = getPatternSignal('LFZ')

      return {
        patternType: 'LFZ',
        pattern: 'LFZ',
        confidence: 70,
        description: signalInfo.description,
        signal: signalInfo.signal,
        direction: signalInfo.direction,
        type: signalInfo.type,
        color: signalInfo.color,
        icon: signalInfo.icon,
        iconColor: signalInfo.iconColor,
        label: signalInfo.label,
        fullLabel: signalInfo.fullLabel,
        expectedWinRate: signalInfo.expectedWinRate,
        avgRR: signalInfo.avgRR,
        bestTimeframes: signalInfo.bestTimeframes,
        goodTimeframes: signalInfo.goodTimeframes,
        cautionTimeframes: signalInfo.cautionTimeframes,
        entry: currentPrice * 1.01,
        stopLoss: avgLow * 0.99,
        target: currentPrice * 1.05,
        takeProfit: currentPrice * 1.05,
        timeframe: '1h',
        detectedAt: Date.now(),
        timestamp: new Date(),
        zone: { top: avgLow * 1.005, bottom: avgLow * 0.995, mid: avgLow }
      }
    }

    return null
  }

  /**
   * Pattern 13-14: Rounding Bottom/Top
   * TIER 2+ patterns
   */
  detectRoundingBottom(candles) {
    if (candles.length < 40) return null

    const window = candles.slice(-30)
    const lows = window.map(c => c.low)

    // Check if lows form a U-shape (decreasing then increasing)
    const midPoint = Math.floor(lows.length / 2)
    const leftSide = lows.slice(0, midPoint)
    const rightSide = lows.slice(midPoint)

    const leftDescending = leftSide[leftSide.length - 1] < leftSide[0]
    const rightAscending = rightSide[rightSide.length - 1] > rightSide[0]
    const bottomPrice = Math.min(...lows)

    if (leftDescending && rightAscending) {
      const currentPrice = candles[candles.length - 1].close
      const signalInfo = getPatternSignal('ROUNDING_BOTTOM')

      return {
        patternType: 'ROUNDING_BOTTOM',
        pattern: 'ROUNDING_BOTTOM',
        confidence: 68,
        description: signalInfo.description,
        signal: signalInfo.signal,
        direction: signalInfo.direction,
        type: signalInfo.type,
        color: signalInfo.color,
        icon: signalInfo.icon,
        iconColor: signalInfo.iconColor,
        label: signalInfo.label,
        fullLabel: signalInfo.fullLabel,
        expectedWinRate: signalInfo.expectedWinRate,
        avgRR: signalInfo.avgRR,
        bestTimeframes: signalInfo.bestTimeframes,
        goodTimeframes: signalInfo.goodTimeframes,
        cautionTimeframes: signalInfo.cautionTimeframes,
        entry: currentPrice * 1.01,
        stopLoss: bottomPrice * 0.98,
        target: currentPrice + (currentPrice - bottomPrice),
        takeProfit: currentPrice + (currentPrice - bottomPrice),
        timeframe: '1h',
        detectedAt: Date.now(),
        timestamp: new Date()
      }
    }

    return null
  }

  detectRoundingTop(candles) {
    if (candles.length < 40) return null

    const window = candles.slice(-30)
    const highs = window.map(c => c.high)

    // Check if highs form an inverted U-shape
    const midPoint = Math.floor(highs.length / 2)
    const leftSide = highs.slice(0, midPoint)
    const rightSide = highs.slice(midPoint)

    const leftAscending = leftSide[leftSide.length - 1] > leftSide[0]
    const rightDescending = rightSide[rightSide.length - 1] < rightSide[0]
    const topPrice = Math.max(...highs)

    if (leftAscending && rightDescending) {
      const currentPrice = candles[candles.length - 1].close
      const signalInfo = getPatternSignal('ROUNDING_TOP')

      return {
        patternType: 'ROUNDING_TOP',
        pattern: 'ROUNDING_TOP',
        confidence: 68,
        description: signalInfo.description,
        signal: signalInfo.signal,
        direction: signalInfo.direction,
        type: signalInfo.type,
        color: signalInfo.color,
        icon: signalInfo.icon,
        iconColor: signalInfo.iconColor,
        label: signalInfo.label,
        fullLabel: signalInfo.fullLabel,
        expectedWinRate: signalInfo.expectedWinRate,
        avgRR: signalInfo.avgRR,
        bestTimeframes: signalInfo.bestTimeframes,
        goodTimeframes: signalInfo.goodTimeframes,
        cautionTimeframes: signalInfo.cautionTimeframes,
        entry: currentPrice * 0.99,
        stopLoss: topPrice * 1.02,
        target: currentPrice - (topPrice - currentPrice),
        takeProfit: currentPrice - (topPrice - currentPrice),
        timeframe: '1h',
        detectedAt: Date.now(),
        timestamp: new Date()
      }
    }

    return null
  }

  /**
   * TIER 3 PATTERNS (9 patterns)
   */

  /**
   * Pattern 15-17: Flag Patterns (Bull/Bear/Generic)
   * TIER 3+ patterns
   */
  detectBullFlag(candles) {
    if (candles.length < 20) return null

    // Find pole (strong up move)
    const poleStart = candles.length - 15
    const poleEnd = candles.length - 10
    const pole = candles.slice(poleStart, poleEnd)

    const poleRise = ((pole[pole.length - 1].close - pole[0].close) / pole[0].close) * 100

    if (poleRise > 5) {
      // Check for flag (consolidation)
      const flag = candles.slice(-10)
      const flagRange = (Math.max(...flag.map(c => c.high)) - Math.min(...flag.map(c => c.low))) / flag[0].close * 100

      if (flagRange < 3) {
        const currentPrice = candles[candles.length - 1].close
        const signalInfo = getPatternSignal('BULL_FLAG')

        return {
          patternType: 'BULL_FLAG',
          pattern: 'BULL_FLAG',
          confidence: 72,
          description: signalInfo.description,
          signal: signalInfo.signal,
          direction: signalInfo.direction,
          type: signalInfo.type,
          color: signalInfo.color,
          icon: signalInfo.icon,
          iconColor: signalInfo.iconColor,
          label: signalInfo.label,
          fullLabel: signalInfo.fullLabel,
          expectedWinRate: signalInfo.expectedWinRate,
          avgRR: signalInfo.avgRR,
          bestTimeframes: signalInfo.bestTimeframes,
          goodTimeframes: signalInfo.goodTimeframes,
          cautionTimeframes: signalInfo.cautionTimeframes,
          entry: currentPrice * 1.01,
          stopLoss: Math.min(...flag.map(c => c.low)) * 0.98,
          target: currentPrice + (pole[pole.length - 1].close - pole[0].close),
          takeProfit: currentPrice + (pole[pole.length - 1].close - pole[0].close),
          timeframe: '1h',
          detectedAt: Date.now(),
          timestamp: new Date()
        }
      }
    }

    return null
  }

  detectBearFlag(candles) {
    if (candles.length < 20) return null

    // Find pole (strong down move)
    const poleStart = candles.length - 15
    const poleEnd = candles.length - 10
    const pole = candles.slice(poleStart, poleEnd)

    const poleDrop = ((pole[0].close - pole[pole.length - 1].close) / pole[0].close) * 100

    if (poleDrop > 5) {
      // Check for flag (consolidation)
      const flag = candles.slice(-10)
      const flagRange = (Math.max(...flag.map(c => c.high)) - Math.min(...flag.map(c => c.low))) / flag[0].close * 100

      if (flagRange < 3) {
        const currentPrice = candles[candles.length - 1].close
        const signalInfo = getPatternSignal('BEAR_FLAG')

        return {
          patternType: 'BEAR_FLAG',
          pattern: 'BEAR_FLAG',
          confidence: 72,
          description: signalInfo.description,
          signal: signalInfo.signal,
          direction: signalInfo.direction,
          type: signalInfo.type,
          color: signalInfo.color,
          icon: signalInfo.icon,
          iconColor: signalInfo.iconColor,
          label: signalInfo.label,
          fullLabel: signalInfo.fullLabel,
          expectedWinRate: signalInfo.expectedWinRate,
          avgRR: signalInfo.avgRR,
          bestTimeframes: signalInfo.bestTimeframes,
          goodTimeframes: signalInfo.goodTimeframes,
          cautionTimeframes: signalInfo.cautionTimeframes,
          entry: currentPrice * 0.99,
          stopLoss: Math.max(...flag.map(c => c.high)) * 1.02,
          target: currentPrice - (pole[0].close - pole[pole.length - 1].close),
          takeProfit: currentPrice - (pole[0].close - pole[pole.length - 1].close),
          timeframe: '1h',
          detectedAt: Date.now(),
          timestamp: new Date()
        }
      }
    }

    return null
  }

  /**
   * Pattern 18: Wedge (Rising/Falling)
   * TIER 3+ pattern
   */
  detectWedge(candles) {
    if (candles.length < 30) return null

    const { swingHighs, swingLows } = this.findSwingPoints(candles, 3)
    if (swingHighs.length < 2 || swingLows.length < 2) return null

    const recentHighs = swingHighs.slice(-2)
    const recentLows = swingLows.slice(-2)

    const highsRising = recentHighs[1].price > recentHighs[0].price
    const lowsRising = recentLows[1].price > recentLows[0].price
    const highsFalling = recentHighs[1].price < recentHighs[0].price
    const lowsFalling = recentLows[1].price < recentLows[0].price

    // Rising Wedge (bearish) or Falling Wedge (bullish)
    const isRisingWedge = highsRising && lowsRising
    const isFallingWedge = highsFalling && lowsFalling

    if (isRisingWedge || isFallingWedge) {
      const currentPrice = candles[candles.length - 1].close
      const signalInfo = getPatternSignal('WEDGE')

      return {
        patternType: 'WEDGE',
        pattern: isRisingWedge ? 'RISING_WEDGE' : 'FALLING_WEDGE',
        confidence: 68,
        description: signalInfo.description,
        signal: isRisingWedge ? 'SELL' : 'BUY',
        direction: isRisingWedge ? 'SHORT' : 'LONG',
        type: signalInfo.type,
        color: signalInfo.color,
        icon: signalInfo.icon,
        iconColor: signalInfo.iconColor,
        label: signalInfo.label,
        fullLabel: signalInfo.fullLabel,
        expectedWinRate: signalInfo.expectedWinRate,
        avgRR: signalInfo.avgRR,
        bestTimeframes: signalInfo.bestTimeframes,
        goodTimeframes: signalInfo.goodTimeframes,
        cautionTimeframes: signalInfo.cautionTimeframes,
        entry: currentPrice,
        stopLoss: isRisingWedge ? recentHighs[1].price * 1.01 : recentLows[1].price * 0.99,
        target: isRisingWedge ? currentPrice * 0.95 : currentPrice * 1.05,
        takeProfit: isRisingWedge ? currentPrice * 0.95 : currentPrice * 1.05,
        timeframe: '1h',
        detectedAt: Date.now(),
        timestamp: new Date()
      }
    }

    return null
  }

  /**
   * Pattern 19: Engulfing (Bull/Bear)
   * TIER 3+ pattern
   */
  detectEngulfing(candles) {
    if (candles.length < 2) return null

    const prev = candles[candles.length - 2]
    const curr = candles[candles.length - 1]

    const prevBody = Math.abs(prev.close - prev.open)
    const currBody = Math.abs(curr.close - curr.open)

    // Bullish Engulfing
    if (prev.close < prev.open && curr.close > curr.open) {
      if (curr.open <= prev.close && curr.close >= prev.open) {
        const signalInfo = getPatternSignal('ENGULFING')

        return {
          patternType: 'ENGULFING',
          pattern: 'BULLISH_ENGULFING',
          confidence: 75,
          description: signalInfo.description,
          signal: 'BUY',
          direction: 'LONG',
          type: signalInfo.type,
          color: signalInfo.color,
          icon: signalInfo.icon,
          iconColor: signalInfo.iconColor,
          label: signalInfo.label,
          fullLabel: signalInfo.fullLabel,
          expectedWinRate: signalInfo.expectedWinRate,
          avgRR: signalInfo.avgRR,
          bestTimeframes: signalInfo.bestTimeframes,
          goodTimeframes: signalInfo.goodTimeframes,
          cautionTimeframes: signalInfo.cautionTimeframes,
          entry: curr.close * 1.01,
          stopLoss: curr.low * 0.99,
          target: curr.close * 1.03,
          takeProfit: curr.close * 1.03,
          timeframe: '1h',
          detectedAt: Date.now(),
          timestamp: new Date()
        }
      }
    }

    // Bearish Engulfing
    if (prev.close > prev.open && curr.close < curr.open) {
      if (curr.open >= prev.close && curr.close <= prev.open) {
        const signalInfo = getPatternSignal('ENGULFING')

        return {
          patternType: 'ENGULFING',
          pattern: 'BEARISH_ENGULFING',
          confidence: 75,
          description: signalInfo.description,
          signal: 'SELL',
          direction: 'SHORT',
          type: signalInfo.type,
          color: signalInfo.color,
          icon: signalInfo.icon,
          iconColor: signalInfo.iconColor,
          label: signalInfo.label,
          fullLabel: signalInfo.fullLabel,
          expectedWinRate: signalInfo.expectedWinRate,
          avgRR: signalInfo.avgRR,
          bestTimeframes: signalInfo.bestTimeframes,
          goodTimeframes: signalInfo.goodTimeframes,
          cautionTimeframes: signalInfo.cautionTimeframes,
          entry: curr.close * 0.99,
          stopLoss: curr.high * 1.01,
          target: curr.close * 0.97,
          takeProfit: curr.close * 0.97,
          timeframe: '1h',
          detectedAt: Date.now(),
          timestamp: new Date()
        }
      }
    }

    return null
  }

  /**
   * Pattern 20: Morning Star / Evening Star
   * TIER 3+ pattern
   */
  detectMorningEveningStar(candles) {
    if (candles.length < 3) return null

    const c1 = candles[candles.length - 3]
    const c2 = candles[candles.length - 2]
    const c3 = candles[candles.length - 1]

    const body1 = Math.abs(c1.close - c1.open)
    const body2 = Math.abs(c2.close - c2.open)
    const body3 = Math.abs(c3.close - c3.open)

    // Morning Star (bullish)
    if (c1.close < c1.open && body2 < body1 * 0.3 && c3.close > c3.open) {
      if (c3.close > (c1.open + c1.close) / 2) {
        const signalInfo = getPatternSignal('MORNING_EVENING_STAR')

        return {
          patternType: 'MORNING_EVENING_STAR',
          pattern: 'MORNING_STAR',
          confidence: 73,
          description: signalInfo.description,
          signal: 'BUY',
          direction: 'LONG',
          type: signalInfo.type,
          color: signalInfo.color,
          icon: signalInfo.icon,
          iconColor: signalInfo.iconColor,
          label: signalInfo.label,
          fullLabel: signalInfo.fullLabel,
          expectedWinRate: signalInfo.expectedWinRate,
          avgRR: signalInfo.avgRR,
          bestTimeframes: signalInfo.bestTimeframes,
          goodTimeframes: signalInfo.goodTimeframes,
          cautionTimeframes: signalInfo.cautionTimeframes,
          entry: c3.close * 1.01,
          stopLoss: Math.min(c1.low, c2.low, c3.low) * 0.99,
          target: c3.close * 1.04,
          takeProfit: c3.close * 1.04,
          timeframe: '1h',
          detectedAt: Date.now(),
          timestamp: new Date()
        }
      }
    }

    // Evening Star (bearish)
    if (c1.close > c1.open && body2 < body1 * 0.3 && c3.close < c3.open) {
      if (c3.close < (c1.open + c1.close) / 2) {
        const signalInfo = getPatternSignal('MORNING_EVENING_STAR')

        return {
          patternType: 'MORNING_EVENING_STAR',
          pattern: 'EVENING_STAR',
          confidence: 73,
          description: signalInfo.description,
          signal: 'SELL',
          direction: 'SHORT',
          type: signalInfo.type,
          color: signalInfo.color,
          icon: signalInfo.icon,
          iconColor: signalInfo.iconColor,
          label: signalInfo.label,
          fullLabel: signalInfo.fullLabel,
          expectedWinRate: signalInfo.expectedWinRate,
          avgRR: signalInfo.avgRR,
          bestTimeframes: signalInfo.bestTimeframes,
          goodTimeframes: signalInfo.goodTimeframes,
          cautionTimeframes: signalInfo.cautionTimeframes,
          entry: c3.close * 0.99,
          stopLoss: Math.max(c1.high, c2.high, c3.high) * 1.01,
          target: c3.close * 0.96,
          takeProfit: c3.close * 0.96,
          timeframe: '1h',
          detectedAt: Date.now(),
          timestamp: new Date()
        }
      }
    }

    return null
  }

  /**
   * Pattern 21: Cup & Handle
   * TIER 3+ pattern
   */
  detectCupHandle(candles) {
    if (candles.length < 50) return null

    // Check for cup (rounding bottom) in first 30 candles
    const cupWindow = candles.slice(-40, -10)
    const cupLows = cupWindow.map(c => c.low)
    const cupBottom = Math.min(...cupLows)

    // Check for handle (small retracement) in last 10 candles
    const handleWindow = candles.slice(-10)
    const handleHigh = Math.max(...handleWindow.map(c => c.high))
    const handleLow = Math.min(...handleWindow.map(c => c.low))
    const handleRange = (handleHigh - handleLow) / handleHigh

    if (handleRange < 0.05) {
      const currentPrice = candles[candles.length - 1].close
      const signalInfo = getPatternSignal('CUP_HANDLE')

      return {
        patternType: 'CUP_HANDLE',
        pattern: 'CUP_HANDLE',
        confidence: 70,
        description: signalInfo.description,
        signal: signalInfo.signal,
        direction: signalInfo.direction,
        type: signalInfo.type,
        color: signalInfo.color,
        icon: signalInfo.icon,
        iconColor: signalInfo.iconColor,
        label: signalInfo.label,
        fullLabel: signalInfo.fullLabel,
        expectedWinRate: signalInfo.expectedWinRate,
        avgRR: signalInfo.avgRR,
        bestTimeframes: signalInfo.bestTimeframes,
        goodTimeframes: signalInfo.goodTimeframes,
        cautionTimeframes: signalInfo.cautionTimeframes,
        entry: handleHigh * 1.01,
        stopLoss: handleLow * 0.98,
        target: handleHigh + (handleHigh - cupBottom),
        takeProfit: handleHigh + (handleHigh - cupBottom),
        timeframe: '1h',
        detectedAt: Date.now(),
        timestamp: new Date()
      }
    }

    return null
  }

  /**
   * Pattern 22: Three Methods (Rising/Falling)
   * TIER 3+ pattern
   */
  detectThreeMethods(candles) {
    if (candles.length < 5) return null

    const candles5 = candles.slice(-5)

    // Rising 3 Methods
    const c1Up = candles5[0].close > candles5[0].open
    const c5Up = candles5[4].close > candles5[4].open
    const middle3Down = candles5.slice(1, 4).every(c => c.close < c.open)

    if (c1Up && middle3Down && c5Up) {
      const signalInfo = getPatternSignal('THREE_METHODS')

      return {
        patternType: 'THREE_METHODS',
        pattern: 'RISING_THREE_METHODS',
        confidence: 68,
        description: signalInfo.description,
        signal: 'BUY',
        direction: 'LONG',
        type: signalInfo.type,
        color: signalInfo.color,
        icon: signalInfo.icon,
        iconColor: signalInfo.iconColor,
        label: signalInfo.label,
        fullLabel: signalInfo.fullLabel,
        expectedWinRate: signalInfo.expectedWinRate,
        avgRR: signalInfo.avgRR,
        bestTimeframes: signalInfo.bestTimeframes,
        goodTimeframes: signalInfo.goodTimeframes,
        cautionTimeframes: signalInfo.cautionTimeframes,
        entry: candles5[4].close * 1.01,
        stopLoss: Math.min(...candles5.map(c => c.low)) * 0.98,
        target: candles5[4].close * 1.04,
        takeProfit: candles5[4].close * 1.04,
        timeframe: '1h',
        detectedAt: Date.now(),
        timestamp: new Date()
      }
    }

    // Falling 3 Methods
    const c1Down = candles5[0].close < candles5[0].open
    const c5Down = candles5[4].close < candles5[4].open
    const middle3Up = candles5.slice(1, 4).every(c => c.close > c.open)

    if (c1Down && middle3Up && c5Down) {
      const signalInfo = getPatternSignal('THREE_METHODS')

      return {
        patternType: 'THREE_METHODS',
        pattern: 'FALLING_THREE_METHODS',
        confidence: 68,
        description: signalInfo.description,
        signal: 'SELL',
        direction: 'SHORT',
        type: signalInfo.type,
        color: signalInfo.color,
        icon: signalInfo.icon,
        iconColor: signalInfo.iconColor,
        label: signalInfo.label,
        fullLabel: signalInfo.fullLabel,
        expectedWinRate: signalInfo.expectedWinRate,
        avgRR: signalInfo.avgRR,
        bestTimeframes: signalInfo.bestTimeframes,
        goodTimeframes: signalInfo.goodTimeframes,
        cautionTimeframes: signalInfo.cautionTimeframes,
        entry: candles5[4].close * 0.99,
        stopLoss: Math.max(...candles5.map(c => c.high)) * 1.02,
        target: candles5[4].close * 0.96,
        takeProfit: candles5[4].close * 0.96,
        timeframe: '1h',
        detectedAt: Date.now(),
        timestamp: new Date()
      }
    }

    return null
  }

  /**
   * Pattern 23: Hammer / Inverted Hammer
   * TIER 3+ pattern
   */
  detectHammer(candles) {
    if (candles.length < 10) return null

    const curr = candles[candles.length - 1]
    const body = Math.abs(curr.close - curr.open)
    const lowerShadow = Math.min(curr.open, curr.close) - curr.low
    const upperShadow = curr.high - Math.max(curr.open, curr.close)

    // Check if in downtrend
    const recentCandles = candles.slice(-10, -1)
    const isDowntrend = recentCandles[recentCandles.length - 1].close < recentCandles[0].close

    // Hammer (bullish)
    if (isDowntrend && lowerShadow > body * 2 && upperShadow < body * 0.5) {
      const signalInfo = getPatternSignal('HAMMER')

      return {
        patternType: 'HAMMER',
        pattern: 'HAMMER',
        confidence: 70,
        description: signalInfo.description,
        signal: 'BUY',
        direction: 'LONG',
        type: signalInfo.type,
        color: signalInfo.color,
        icon: signalInfo.icon,
        iconColor: signalInfo.iconColor,
        label: signalInfo.label,
        fullLabel: signalInfo.fullLabel,
        expectedWinRate: signalInfo.expectedWinRate,
        avgRR: signalInfo.avgRR,
        bestTimeframes: signalInfo.bestTimeframes,
        goodTimeframes: signalInfo.goodTimeframes,
        cautionTimeframes: signalInfo.cautionTimeframes,
        entry: curr.close * 1.01,
        stopLoss: curr.low * 0.99,
        target: curr.close * 1.03,
        takeProfit: curr.close * 1.03,
        timeframe: '1h',
        detectedAt: Date.now(),
        timestamp: new Date()
      }
    }

    // Inverted Hammer (bullish)
    if (isDowntrend && upperShadow > body * 2 && lowerShadow < body * 0.5) {
      const signalInfo = getPatternSignal('HAMMER')

      return {
        patternType: 'HAMMER',
        pattern: 'INVERTED_HAMMER',
        confidence: 68,
        description: signalInfo.description,
        signal: 'BUY',
        direction: 'LONG',
        type: signalInfo.type,
        color: signalInfo.color,
        icon: signalInfo.icon,
        iconColor: signalInfo.iconColor,
        label: signalInfo.label,
        fullLabel: signalInfo.fullLabel,
        expectedWinRate: signalInfo.expectedWinRate,
        avgRR: signalInfo.avgRR,
        bestTimeframes: signalInfo.bestTimeframes,
        goodTimeframes: signalInfo.goodTimeframes,
        cautionTimeframes: signalInfo.cautionTimeframes,
        entry: curr.close * 1.01,
        stopLoss: curr.low * 0.99,
        target: curr.close * 1.03,
        takeProfit: curr.close * 1.03,
        timeframe: '1h',
        detectedAt: Date.now(),
        timestamp: new Date()
      }
    }

    return null
  }

  /**
   * Scan a single symbol for patterns
   * @param {string} symbol - Trading pair (e.g., 'BTCUSDT')
   * @param {string} userTier - User tier level ('free', 'tier1', 'tier2', 'tier3', 'admin')
   * @param {Object} filters - Optional filters { patterns: [], confidenceThreshold: 0.7, direction: 'all' }
   * @returns {Promise<Object|null>}
   */
  async scanSymbol(symbol, userTier = 'free', filters = null) {
    try {
      // 🔥 FIX: Use timeframe from filters, default to 1h
      const timeframe = filters?.timeframe || '1h';
      console.log(`[PatternDetection] Scanning ${symbol} on ${timeframe} timeframe`);

      // Fetch candlestick data with specified timeframe
      const candles = await binanceService.getCandlestickData(symbol, timeframe, 100)

      if (!candles || candles.length < 60) {
        console.log(`[PatternDetection] Insufficient candles for ${symbol} on ${timeframe}`);
        return null
      }

      // ✅ APPLY FILTERS - Run only selected patterns
      const selectedPatterns = filters?.patterns || []
      const confidenceThreshold = filters?.confidenceThreshold || 0 // 0 = no filter
      const directionFilter = filters?.direction || 'all'

      // Map filter pattern IDs to detection methods
      const patternMap = {
        // FREE TIER
        'dpd': () => this.detectDPD(candles),
        'upu': () => this.detectUPU(candles),
        'head_shoulders': () => this.detectHeadAndShoulders(candles),

        // TIER 1
        'upd': () => this.detectUPD(candles),
        'dpu': () => this.detectDPU(candles),
        'double_top': () => this.detectDoubleTop(candles),
        'double_bottom': () => this.detectDoubleBottom(candles),

        // TIER 2
        'inverse_head_shoulders': () => this.detectInverseHeadShoulders(candles),
        'ascending_triangle': () => this.detectAscendingTriangle(candles),
        'descending_triangle': () => this.detectDescendingTriangle(candles),
        'symmetrical_triangle': () => this.detectSymmetricalTriangle(candles),
        'hfz': () => this.detectHFZ(candles),
        'lfz': () => this.detectLFZ(candles),
        'rounding_bottom': () => this.detectRoundingBottom(candles),
        'rounding_top': () => this.detectRoundingTop(candles),

        // TIER 3
        'bull_flag': () => this.detectBullFlag(candles),
        'bear_flag': () => this.detectBearFlag(candles),
        'wedge': () => this.detectWedge(candles),
        'engulfing': () => this.detectEngulfing(candles),
        'morning_evening_star': () => this.detectMorningEveningStar(candles),
        'cup_handle': () => this.detectCupHandle(candles),
        'three_methods': () => this.detectThreeMethods(candles),
        'hammer': () => this.detectHammer(candles),
      }

      // Determine which patterns to run based on tier and filters
      let patternsToRun = []

      if (selectedPatterns.length > 0) {
        // ✅ User selected specific patterns - only run those (if user has access)
        patternsToRun = selectedPatterns
      } else {
        // ✅ No specific selection - run all patterns available for user's tier
        if (userTier === 'free') {
          patternsToRun = ['dpd', 'upu', 'head_shoulders']
        } else if (userTier === 'tier1') {
          patternsToRun = ['dpd', 'upu', 'head_shoulders', 'upd', 'dpu', 'double_top', 'double_bottom']
        } else if (userTier === 'tier2') {
          patternsToRun = [
            'dpd', 'upu', 'head_shoulders', 'upd', 'dpu', 'double_top', 'double_bottom',
            'inverse_head_shoulders', 'ascending_triangle', 'descending_triangle', 'symmetrical_triangle',
            'hfz', 'lfz', 'rounding_bottom', 'rounding_top'
          ]
        } else if (userTier === 'tier3' || userTier === 'admin') {
          // All 24 patterns
          patternsToRun = Object.keys(patternMap)
        } else {
          // Default to free tier
          patternsToRun = ['dpd', 'upu', 'head_shoulders']
        }
      }

      // Run selected pattern detections
      const detectedPatterns = []
      for (const patternId of patternsToRun) {
        const detectFunc = patternMap[patternId]
        if (detectFunc) {
          const result = detectFunc()
          if (result) {
            detectedPatterns.push(result)
          }
        }
      }

      // ====================================
      // PHASE 1 + PHASE 2: ENHANCE PATTERNS WITH QUALITY SCORING
      // TIER-GATED: Only TIER2/TIER3 get full enhancements
      // ====================================

      // Check tier access for Phase 1/2 features
      const normalizedTier = normalizeTierName(userTier);
      const tierConfig = getTierConfig(userTier);
      const hasPremiumAccess = isPremiumTier(userTier);

      console.log(`[Phase1+2] Tier Check: ${userTier} → ${normalizedTier}, Premium: ${hasPremiumAccess}`);

      // PHASE 1: Run trend analysis (for premium tiers only)
      let trendAnalysis = null;
      if (hasFeatureAccess(userTier, 'trendAnalysis')) {
        trendAnalysis = analyzeTrend(candles);
        console.log('[Phase1] Trend Analysis (TIER2/3):', trendAnalysis);
      }

      // PHASE 2: Find S/R key levels (for premium tiers only)
      let keyLevels = [];
      if (hasFeatureAccess(userTier, 'qualityFiltering')) {
        console.log('[Phase2] Finding S/R key levels (TIER2/3 feature)...');
        keyLevels = findKeyLevels(candles, 200);
        console.log(`[Phase2] Found ${keyLevels.length} key S/R levels`);
      }

      // 2. Enhance each pattern with volume, trend, and quality score
      const enhancedPatterns = detectedPatterns.map(pattern => {
        // Get pattern signal info
        const signalInfo = getPatternSignal(pattern.patternType || pattern.pattern);

        // ====================================
        // TIER-GATED ENHANCEMENTS
        // ====================================

        // Volume Analysis (TIER2/3 only)
        let volumeAnalysis = null;
        let volumeDirection = null;
        if (hasFeatureAccess(userTier, 'volumeConfirmation')) {
          volumeAnalysis = analyzeVolumeProfile(candles, {
            start: Math.max(0, candles.length - 50),
            end: candles.length - 1
          });
          volumeDirection = confirmVolumeDirection(
            candles.slice(-10),
            signalInfo.direction || pattern.direction
          );
        }

        // Trend Analysis (TIER2/3 only)
        let trendBonus = 0;
        let trendAlignment = null;
        if (hasFeatureAccess(userTier, 'trendAnalysis') && trendAnalysis) {
          trendBonus = calculateTrendBonus(
            pattern.patternType || pattern.pattern,
            trendAnalysis,
            signalInfo
          );
          trendAlignment = getTrendAlignment(
            signalInfo.direction || pattern.direction,
            trendAnalysis
          );
        }

        // ====================================
        // CALCULATE TOTAL QUALITY SCORE
        // Premium tiers get enhanced scoring
        // ====================================
        let totalScore = 0;
        const scoreBreakdown = {};

        // Base confidence (0-100) - everyone gets this
        const baseConfidence = pattern.confidence || 50;
        totalScore += baseConfidence;
        scoreBreakdown.base = baseConfidence;

        // Premium enhancements (TIER2/3 only)
        // ====================================
        // PHASE 1 SCORING
        // ====================================
        let confluenceAnalysis = null;
        let candleConfirmation = null;

        if (hasPremiumAccess) {
          // Volume contribution (0-19 points)
          if (volumeAnalysis) {
            const volumeContribution = (volumeAnalysis.volumeScore || 50) * 0.19;
            totalScore += volumeContribution;
            scoreBreakdown.volume = Math.round(volumeContribution);
          }

          // Trend bonus (-20 to +25)
          if (trendAnalysis) {
            totalScore += trendBonus;
            scoreBreakdown.trend = trendBonus;
          }

          // Volume direction bonus (-5 to +10)
          if (volumeDirection) {
            let volumeDirBonus = 0;
            if (volumeDirection.confirms) {
              volumeDirBonus = volumeDirection.volumeBias === signalInfo.direction ? 10 : 5;
            } else {
              volumeDirBonus = -5;
            }
            totalScore += volumeDirBonus;
            scoreBreakdown.volumeDir = volumeDirBonus;
          }

          // ====================================
          // PHASE 2 SCORING
          // ====================================

          // S/R Confluence Analysis (0-20 points)
          if (keyLevels.length > 0) {
            console.log(`[Phase2] Checking S/R confluence for ${pattern.patternType || pattern.pattern}...`);
            confluenceAnalysis = checkConfluence(pattern, keyLevels);

            const confluenceBonus = confluenceAnalysis.confluenceScore * 0.2; // Max 20 points
            totalScore += confluenceBonus;
            scoreBreakdown.confluence = Math.round(confluenceBonus);

            console.log(`[Phase2] Confluence: score=${confluenceAnalysis.confluenceScore}, bonus=+${confluenceBonus.toFixed(1)}`);
          }

          // Candlestick Confirmation (0-15 points)
          console.log(`[Phase2] Checking candle confirmation for ${pattern.patternType || pattern.pattern}...`);
          const recentCandles = candles.slice(-5);
          candleConfirmation = checkCandleConfirmation(recentCandles, signalInfo.direction || pattern.direction);

          const candleBonus = candleConfirmation.confirmationScore * 0.15; // Max 15 points
          totalScore += candleBonus;
          scoreBreakdown.candle = Math.round(candleBonus);

          console.log(`[Phase2] Candle: score=${candleConfirmation.confirmationScore}, bonus=+${candleBonus.toFixed(1)}`);

          // ====================================
          // PHASE 3 SCORING
          // ====================================

          // RSI Divergence Analysis (0-20 points)
          console.log(`[Phase3] Checking RSI divergence for ${pattern.patternType || pattern.pattern}...`);
          const rsiDivergence = detectRSIDivergence(candles, signalInfo.direction || pattern.direction);

          if (rsiDivergence.divergenceScore > 0) {
            const divergenceBonus = rsiDivergence.divergenceScore * 0.2; // Max 20 points
            totalScore += divergenceBonus;
            scoreBreakdown.divergence = Math.round(divergenceBonus);
            console.log(`[Phase3] RSI Divergence: score=${rsiDivergence.divergenceScore}, bonus=+${divergenceBonus.toFixed(1)}`);
          }

          // Dynamic R:R Optimization (0-15 points)
          console.log(`[Phase3] Optimizing R:R for ${pattern.patternType || pattern.pattern}...`);
          const rrOptimization = optimizeRiskReward(
            pattern,
            candles,
            timeframe,
            totalScore // Use current total score for quality-based adjustment
          );

          if (rrOptimization.rrScore > 0) {
            const rrBonus = rrOptimization.rrScore * 0.15; // Max 15 points
            totalScore += rrBonus;
            scoreBreakdown.rr = Math.round(rrBonus);
            console.log(`[Phase3] R:R Optimization: score=${rrOptimization.rrScore}, bonus=+${rrBonus.toFixed(1)}`);
          }
        }

        // Clamp total score to 0-100
        totalScore = Math.max(0, Math.min(100, totalScore));

        // Determine grade
        let grade = 'D';
        if (totalScore >= 85) grade = 'A+';
        else if (totalScore >= 75) grade = 'A';
        else if (totalScore >= 65) grade = 'B';
        else if (totalScore >= 55) grade = 'C';

        // Determine warning (TIER2/3 only)
        let warning = null;
        if (hasPremiumAccess) {
          if (trendAlignment && trendAlignment.alignment === 'COUNTER_TREND') {
            warning = 'COUNTER_TREND_RISK';
          } else if (volumeAnalysis && !volumeAnalysis.hasVolumeConfirmation) {
            warning = 'LOW_VOLUME';
          }
        }

        console.log(`[Phase1] Pattern ${pattern.patternType || pattern.pattern}:`, {
          tier: normalizedTier,
          premium: hasPremiumAccess,
          totalScore: Math.round(totalScore),
          grade,
          hasVolumeAnalysis: !!volumeAnalysis,
          hasTrendAnalysis: !!trendAnalysis
        });

        // Build enhanced pattern object
        const enhancedPattern = {
          ...pattern,
          totalScore: Math.round(totalScore),
          scoreBreakdown,
          grade,
          // Updated confidence includes enhancements (if premium)
          confidence: Math.round(totalScore)
        };

        // Add premium enhancements only for TIER2/3
        if (hasPremiumAccess) {
          // Phase 1 data
          enhancedPattern.volumeAnalysis = volumeAnalysis;
          enhancedPattern.volumeDirection = volumeDirection;
          enhancedPattern.trendAnalysis = trendAnalysis;
          enhancedPattern.trendBonus = trendBonus;
          enhancedPattern.trendAlignment = trendAlignment;
          enhancedPattern.warning = warning;
          enhancedPattern.isPremiumEnhanced = true;

          // Phase 2 data
          if (confluenceAnalysis) {
            enhancedPattern.confluence = confluenceAnalysis;
          }
          if (candleConfirmation) {
            enhancedPattern.candleConfirmation = candleConfirmation;

            // Mark as WAITING if weak candle confirmation
            if (candleConfirmation.confirmationScore < 20) {
              enhancedPattern.waitingFor = 'CANDLE_CONFIRMATION';
              console.log(`[Phase2] ${pattern.patternType || pattern.pattern} marked as WAITING - weak candle confirmation`);
            }
          }
          enhancedPattern.keyLevels = keyLevels.slice(0, 5); // Include top 5 levels for UI display

          // Phase 3 data
          if (rsiDivergence) {
            enhancedPattern.rsiDivergence = rsiDivergence;

            // Mark as STRONG SIGNAL if divergence aligns with pattern
            if (rsiDivergence.hasDivergence &&
                ((rsiDivergence.divergenceType === 'BULLISH' && (signalInfo.direction === 'LONG' || pattern.direction === 'LONG')) ||
                 (rsiDivergence.divergenceType === 'BEARISH' && (signalInfo.direction === 'SHORT' || pattern.direction === 'SHORT')))) {
              enhancedPattern.hasAlignedDivergence = true;
              console.log(`[Phase3] ${pattern.patternType || pattern.pattern} has aligned divergence - STRONG signal`);
            }
          }

          if (rrOptimization) {
            enhancedPattern.rrOptimization = rrOptimization;

            // Use optimized target if better than original
            if (rrOptimization.optimizedRR > rrOptimization.originalRR) {
              enhancedPattern.optimizedTarget = rrOptimization.optimizedTarget;
              enhancedPattern.optimizedRR = rrOptimization.optimizedRR;
              console.log(`[Phase3] ${pattern.patternType || pattern.pattern} R:R optimized: ${rrOptimization.originalRR.toFixed(2)} → ${rrOptimization.optimizedRR.toFixed(2)}`);
            }
          }
        }

        return enhancedPattern;
      });

      // ====================================
      // QUALITY FILTER - Remove low-quality patterns
      // Uses tierFeatures.js for min score thresholds
      // ====================================
      const minScore = tierConfig.minPatternScore || 40;
      const qualityFiltered = hasFeatureAccess(userTier, 'qualityFiltering')
        ? enhancedPatterns.filter(p => {
            const passes = p.totalScore >= minScore;
            if (!passes) {
              console.log(`[Phase1] Pattern ${p.patternType || p.pattern} FILTERED - Score ${p.totalScore} < ${minScore}`);
            }
            return passes;
          })
        : enhancedPatterns; // FREE/TIER1 skip quality filter

      console.log(`[Phase1] Quality Filter (${normalizedTier}): ${enhancedPatterns.length} → ${qualityFiltered.length} patterns`);

      // Sort by score (best first)
      qualityFiltered.sort((a, b) => b.totalScore - a.totalScore);

      // ✅ FILTER BY CONFIDENCE THRESHOLD (use qualityFiltered instead of detectedPatterns)
      const filteredByConfidence = qualityFiltered.filter(p => p.confidence >= confidenceThreshold * 100)

      // ✅ FILTER BY DIRECTION (bullish = BUY signals, bearish = SELL signals)
      let filteredByDirection = filteredByConfidence
      if (directionFilter === 'bullish') {
        filteredByDirection = filteredByConfidence.filter(p =>
          p.signal.includes('BUY')
        )
      } else if (directionFilter === 'bearish') {
        filteredByDirection = filteredByConfidence.filter(p =>
          p.signal.includes('SELL')
        )
      }

      // Return first matching pattern (highest priority)
      if (filteredByDirection.length > 0) {
        console.log(`✅ ${symbol}: Found ${filteredByDirection.length} patterns matching filters on ${timeframe}, returning first`)

        // 🔥 CRITICAL: Validate and fix pattern before returning
        const rawPattern = {
          ...filteredByDirection[0],
          timeframe: timeframe,
          detectedAt: new Date().toISOString()
        };

        // Validate and auto-fix if needed
        const { pattern: validatedPattern, wasFixed, fixes } = validateAndFixPattern(rawPattern);

        if (wasFixed) {
          console.log(`🔧 [Validator] Fixed pattern ${symbol}:`, fixes);
        }

        return validatedPattern;
      }

      return null

    } catch (error) {
      console.error(`Error scanning ${symbol}:`, error)
      return null
    }
  }

  /**
   * Scan multiple symbols for patterns (parallelized for speed)
   * @param {Array<string>} symbols - Array of trading pairs
   * @param {string} userTier - User tier level ('free', 'tier1', 'tier2', 'tier3', 'admin')
   * @returns {Promise<Array>}
   */
  async scanMultiple(symbols, userTier = 'free') {
    console.log(`🔍 Starting parallel scan of ${symbols.length} symbols for ${userTier.toUpperCase()} tier...`)

    // Scan all symbols in parallel using Promise.all
    const scanPromises = symbols.map(async (symbol) => {
      try {
        console.log(`🔍 Scanning ${symbol}...`)
        const pattern = await this.scanSymbol(symbol, userTier)

        if (pattern) {
          console.log(`✅ Pattern found in ${symbol}: ${pattern.pattern}`)
          return { symbol, ...pattern }
        } else {
          console.log(`ℹ️ No pattern in ${symbol}`)
          return null
        }
      } catch (error) {
        console.error(`❌ Error scanning ${symbol}:`, error.message)
        return null
      }
    })

    // Wait for all scans to complete
    const allResults = await Promise.all(scanPromises)

    // Filter out null results
    const results = allResults.filter(result => result !== null)

    console.log(`✅ Parallel scan complete! Found ${results.length} patterns in ${symbols.length} symbols`)
    return results
  }

  /**
   * ⚡ NEW: Save scan history to database
   * @param {string} userId - User ID
   * @param {Array<string>} scannedCoins - List of symbols scanned
   * @param {Array<Object>} results - Patterns found
   * @param {string} timeframe - Timeframe used for scan
   * @param {string} userTier - User tier at time of scan
   * @returns {Promise<Object>}
   */
  async saveScanHistory(userId, scannedCoins, results, timeframe, userTier) {
    try {
      // Prepare data theo ĐÚNG structure database
      const historyRecord = {
        user_id: userId,
        symbols: scannedCoins, // ARRAY of symbols scanned
        patterns_found: results, // JSONB containing all patterns found
        timeframe: timeframe || '1h',
        tier_at_scan: userTier || 'free',
        created_at: new Date().toISOString()
      }

      console.log('💾 Saving scan history:', historyRecord)

      const { data, error } = await supabase
        .from('scan_history')
        .insert([historyRecord])
        .select()

      if (error) {
        console.error('❌ Failed to save scan history:', error)
        throw error
      }

      console.log('✅ Scan history saved successfully:', data)
      return data

    } catch (err) {
      console.error('💥 Error saving scan history:', err)
      throw err
    }
  }

  /**
   * ⚡ NEW: Run scan and auto-save to database
   * @param {Array<string>} symbols - Trading pairs to scan
   * @param {Object} filters - Scan filters
   * @param {string} userId - User ID (for saving history)
   * @param {string} userTier - User tier level
   * @returns {Promise<Array>}
   */
  async runScan(symbols, filters, userId, userTier) {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('🔍 RUNNING SCAN WITH AUTO-SAVE')
    console.log(`   Symbols: ${symbols.length}`)
    console.log(`   User ID: ${userId}`)
    console.log(`   Tier: ${userTier}`)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

    try {
      // Run the scan using scanMultiple
      const results = await this.scanMultiple(symbols, userTier)

      console.log(`📊 Scan results: ${results.length} patterns found`)

      // ⚡ Save to database if there are results and userId is provided
      if (results.length > 0 && userId) {
        console.log('💾 Saving scan history to database...')
        await this.saveScanHistory(
          userId,
          symbols,
          results,
          filters?.timeframe || '1h',
          userTier
        )
      } else if (!userId) {
        console.warn('⚠️ No user ID provided - skipping history save')
      } else {
        console.log('ℹ️ No patterns found - skipping history save')
      }

      return results

    } catch (error) {
      console.error('❌ Error in runScan:', error)
      throw error
    }
  }
}

// Export singleton
export const patternDetectionService = new PatternDetectionService()
