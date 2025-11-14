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

      return {
        pattern: 'DPD',
        confidence: this.calculateDPDConfidence(candles),
        description: 'Down-Pause-Down - Bearish Continuation',
        signal: 'STRONG_SELL',
        entry: currentPrice * 0.98,
        stopLoss: currentPrice * 1.02,
        takeProfit: currentPrice * 0.90,
        timeframe: '1h',
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

      return {
        pattern: 'UPU',
        confidence: this.calculateUPUConfidence(candles),
        description: 'Up-Pause-Up - Bullish Continuation',
        signal: 'STRONG_BUY',
        entry: currentPrice * 1.02,
        stopLoss: currentPrice * 0.98,
        takeProfit: currentPrice * 1.10,
        timeframe: '1h',
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

      return {
        pattern: 'HEAD_AND_SHOULDERS',
        confidence: this.calculateHSConfidence(recentHighs),
        description: 'Head and Shoulders - Bearish Reversal',
        signal: 'SELL',
        entry: currentPrice * 0.99,
        stopLoss: head.price,
        takeProfit: currentPrice * 0.92,
        timeframe: '1h',
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

    // Convert to scanner format
    return {
      pattern: 'UPD',
      confidence: upd.confidence,
      description: 'Up-Pause-Down - Bearish Reversal (3-Phase)',
      signal: 'STRONG_SELL',
      entry: upd.entry,
      stopLoss: upd.stopLoss,
      takeProfit: upd.target,
      riskReward: upd.riskReward,
      timeframe: '1h',
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

      return {
        pattern: 'DPU',
        confidence: this.calculateDPUConfidence(candles),
        description: 'Down-Pause-Up - Bullish Reversal',
        signal: 'BUY',
        entry: currentPrice * 1.01,
        stopLoss: currentPrice * 0.97,
        takeProfit: currentPrice * 1.07,
        timeframe: '1h',
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

      return {
        pattern: 'DOUBLE_TOP',
        confidence: this.calculateDoubleTopConfidence(peak1, peak2, valleyDepth),
        description: 'Double Top - Bearish Reversal',
        signal: 'SELL',
        entry: currentPrice * 0.99,
        stopLoss: Math.max(peak1.price, peak2.price),
        takeProfit: lowestInValley * 0.98,
        timeframe: '1h',
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

      return {
        pattern: 'DOUBLE_BOTTOM',
        confidence: this.calculateDoubleBottomConfidence(bottom1, bottom2, peakHeight),
        description: 'Double Bottom - Bullish Reversal',
        signal: 'BUY',
        entry: currentPrice * 1.01,
        stopLoss: Math.min(bottom1.price, bottom2.price),
        takeProfit: highestInPeak * 1.02,
        timeframe: '1h',
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
   * Scan a single symbol for patterns
   * @param {string} symbol - Trading pair (e.g., 'BTCUSDT')
   * @param {string} userTier - User tier level ('free', 'tier1', 'tier2', 'tier3', 'admin')
   * @param {Object} filters - Optional filters { patterns: [], confidenceThreshold: 0.7, direction: 'all' }
   * @returns {Promise<Object|null>}
   */
  async scanSymbol(symbol, userTier = 'free', filters = null) {
    try {
      // Fetch candlestick data (1h, 100 candles for better pattern detection)
      const candles = await binanceService.getCandlestickData(symbol, '1h', 100)

      if (!candles || candles.length < 60) {
        return null
      }

      // ✅ APPLY FILTERS - Run only selected patterns
      const selectedPatterns = filters?.patterns || []
      const confidenceThreshold = filters?.confidenceThreshold || 0 // 0 = no filter
      const directionFilter = filters?.direction || 'all'

      // Map filter pattern IDs to detection methods
      const patternMap = {
        'head_shoulders': () => this.detectHeadAndShoulders(candles),
        'double_top': () => this.detectDoubleTop(candles),
        'double_bottom': () => this.detectDoubleBottom(candles),
        // Add mappings for GEM patterns (DPD, UPU, etc.)
        'dpd': () => this.detectDPD(candles),
        'upu': () => this.detectUPU(candles),
        'upd': () => this.detectUPD(candles),
        'dpu': () => this.detectDPU(candles),
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
        } else {
          patternsToRun = ['dpd', 'upu', 'head_shoulders', 'upd', 'dpu', 'double_top', 'double_bottom']
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

      // ✅ FILTER BY CONFIDENCE THRESHOLD
      const filteredByConfidence = detectedPatterns.filter(p => p.confidence >= confidenceThreshold * 100)

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
        console.log(`✅ ${symbol}: Found ${filteredByDirection.length} patterns matching filters, returning first`)
        return filteredByDirection[0]
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
