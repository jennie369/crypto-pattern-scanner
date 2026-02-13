/**
 * Backtesting Service
 * Professional backtesting engine for TIER 3 users
 *
 * Key Features:
 * - Zone Retest Trading (NOT breakout trading)
 * - Historical data from Binance (up to 5 years)
 * - Pattern detection with zone creation
 * - Wait for zone retest with confirmation
 * - Performance metrics calculation
 *
 * CRITICAL: This implements RETEST-based entries, not breakout entries!
 */

import { binanceService } from './binanceService';
import { supabase } from '../lib/supabaseClient';
import { patternDetectionService } from './patternDetection';
import { checkConfirmationCandle, getZoneQuality } from '../utils/entryWorkflow';

// Use existing pattern detection instance
const patternDetector = patternDetectionService;

class BacktestingService {
  constructor() {
    this.isCancelled = false;
  }

  /**
   * Main backtest execution function
   * @param {Object} config - Backtest configuration
   * @returns {Promise<Object>} Backtest results
   */
  async runBacktest(config) {
    this.isCancelled = false;
    const startTime = Date.now();

    try {
      const {
        patterns,
        symbols,
        timeframe,
        startDate,
        endDate,
        entryRules,
        exitRules,
        riskPerTrade,
        initialCapital
      } = config;

      console.log('🚀 Starting backtest:', {
        patterns,
        symbols,
        timeframe,
        period: `${startDate} to ${endDate}`
      });

      // Initialize results
      const results = {
        trades: [],
        equityCurve: [],
        metrics: {},
        candles_analyzed: 0,
        patterns_detected: 0,
        patterns_entered: 0
      };

      let capital = initialCapital;
      let equity = capital;
      let peak = capital;

      // Process each symbol
      for (const symbol of symbols) {
        if (this.isCancelled) break;

        console.log(`📊 Processing ${symbol}...`);

        // Fetch historical data
        const candles = await this.fetchHistoricalDataRange(
          symbol,
          timeframe,
          startDate,
          endDate
        );

        results.candles_analyzed += candles.length;

        // Scan for patterns
        const detectedPatterns = this.scanForPatterns(
          candles,
          patterns,
          symbol
        );

        results.patterns_detected += detectedPatterns.length;

        console.log(`✅ Found ${detectedPatterns.length} patterns for ${symbol}`);

        // Process each pattern
        for (const pattern of detectedPatterns) {
          if (this.isCancelled) break;

          // ⚠️ CRITICAL: Wait for zone retest (not immediate entry!)
          const retestInfo = this.waitForZoneRetest(
            pattern,
            candles,
            pattern.detectedAtIndex,
            entryRules
          );

          if (!retestInfo) {
            // No retest found or zone broken
            continue;
          }

          results.patterns_entered++;

          // Execute trade simulation
          const trade = this.executeTrade({
            symbol,
            pattern,
            retestInfo,
            candles,
            capital: equity,
            riskPerTrade,
            entryRules,
            exitRules
          });

          // Simulate trade outcome
          const tradeResult = this.simulateTrade(
            trade,
            candles,
            retestInfo.entryIndex
          );

          results.trades.push(tradeResult);

          // Update equity
          equity += tradeResult.pnl;

          // Track peak for drawdown
          if (equity > peak) {
            peak = equity;
          }

          // Add to equity curve
          results.equityCurve.push({
            date: tradeResult.exit_time,
            equity: equity,
            drawdown: ((peak - equity) / peak) * 100
          });

          console.log(`💰 Trade ${results.trades.length}: ${tradeResult.result} | P&L: $${tradeResult.pnl.toFixed(2)}`);
        }
      }

      // Calculate performance metrics
      results.metrics = this.calculateMetrics(results.trades, initialCapital);
      results.execution_time_seconds = Math.round((Date.now() - startTime) / 1000);

      console.log('✅ Backtest complete!', results.metrics);

      return results;

    } catch (error) {
      console.error('❌ Backtest failed:', error);
      throw error;
    }
  }

  /**
   * Fetch historical data for a date range
   * Binance API limit: 1000 candles per request
   */
  async fetchHistoricalDataRange(symbol, timeframe, startDate, endDate) {
    const allCandles = [];
    const startTime = new Date(startDate).getTime();
    const endTime = new Date(endDate).getTime();

    // Calculate interval in milliseconds
    const intervalMs = this.timeframeToMs(timeframe);
    let currentTime = startTime;

    console.log(`📥 Fetching historical data for ${symbol} ${timeframe}...`);

    while (currentTime < endTime) {
      try {
        // Fetch batch (max 1000 candles)
        const url = `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${timeframe}&startTime=${currentTime}&limit=1000`;

        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();

        if (data.length === 0) break;

        // Format candles
        const candles = data.map(k => ({
          timestamp: new Date(k[0]),
          open: parseFloat(k[1]),
          high: parseFloat(k[2]),
          low: parseFloat(k[3]),
          close: parseFloat(k[4]),
          volume: parseFloat(k[5]),
          openTime: k[0],
          closeTime: k[6]
        }));

        allCandles.push(...candles);

        // Move to next batch
        currentTime = candles[candles.length - 1].closeTime + 1;

        // Rate limiting (be nice to Binance API)
        await this.delay(100);

      } catch (error) {
        console.error('Error fetching batch:', error);
        break;
      }
    }

    console.log(`✅ Fetched ${allCandles.length} candles`);

    return allCandles;
  }

  /**
   * Scan for patterns in candlestick data
   */
  scanForPatterns(candles, patternTypes, symbol) {
    const detectedPatterns = [];

    // Need at least 60 candles for pattern detection
    for (let i = 60; i < candles.length - 20; i++) {
      const window = candles.slice(i - 60, i);

      // Detect each pattern type
      for (const patternType of patternTypes) {
        let pattern = null;

        switch (patternType) {
          case 'DPD':
            pattern = patternDetector.detectDPD(window);
            break;
          case 'UPU':
            pattern = patternDetector.detectUPU(window);
            break;
          case 'UPD':
            pattern = patternDetector.detectUPD(window);
            break;
          case 'DPU':
            pattern = patternDetector.detectDPU(window);
            break;
          case 'HEAD_SHOULDERS':
            pattern = patternDetector.detectHeadAndShoulders(window);
            break;
          case 'DOUBLE_TOP':
            pattern = patternDetector.detectDoubleTop(window);
            break;
          case 'DOUBLE_BOTTOM':
            pattern = patternDetector.detectDoubleBottom(window);
            break;
          default:
            break;
        }

        if (pattern) {
          // Add zone information
          pattern.zone = this.createZoneFromPattern(pattern, window);
          pattern.detectedAtIndex = i;
          pattern.symbol = symbol;

          detectedPatterns.push(pattern);
        }
      }
    }

    return detectedPatterns;
  }

  /**
   * Create tradeable zone from pattern
   */
  createZoneFromPattern(pattern, candles) {
    // Extract zone from pattern pause/consolidation area
    const middleSection = candles.slice(20, 40);
    const highs = middleSection.map(c => c.high);
    const lows = middleSection.map(c => c.low);

    const zoneTop = Math.max(...highs);
    const zoneBottom = Math.min(...lows);
    const zoneMid = (zoneTop + zoneBottom) / 2;

    // Determine zone type based on pattern
    let zoneType = 'HFZ'; // Default resistance
    if (pattern.pattern === 'UPU' || pattern.signal === 'STRONG_BUY') {
      zoneType = 'LFZ'; // Support
    }

    return {
      type: zoneType,
      top: zoneTop,
      bottom: zoneBottom,
      mid: zoneMid,
      testCount: 0,
      status: 'fresh',
      createdAt: candles[candles.length - 1].timestamp
    };
  }

  /**
   * ⚠️ CRITICAL: Wait for zone retest (CORE BACKTEST LOGIC)
   * This is what makes this a RETEST strategy, not a breakout strategy!
   */
  waitForZoneRetest(pattern, candles, patternIndex, entryRules) {
    const zone = pattern.zone;
    const maxBarsToWait = 200; // Max bars to wait for retest

    // Start checking after pattern formation
    for (let i = patternIndex + 1; i < Math.min(patternIndex + maxBarsToWait, candles.length); i++) {
      const candle = candles[i];

      // Check if zone is broken (invalidated)
      if (this.isZoneBroken(zone, candle)) {
        return null; // Zone broken, no entry
      }

      // Check if price is retesting zone
      if (this.isPriceInZone(zone, candle)) {
        // Price in zone! Check for confirmation candle
        const confirmation = checkConfirmationCandle(candle, zone.type);

        if (confirmation && confirmation.hasConfirmation) {
          // ✅ VALID ENTRY: Retest + Confirmation
          return {
            entryIndex: i,
            entryCandle: candle,
            confirmation,
            barsToRetest: i - patternIndex,
            zoneStatus: this.getZoneStatusAtIndex(zone, candles, i)
          };
        }
      }
    }

    // No retest with confirmation found
    return null;
  }

  /**
   * Check if zone is broken
   */
  isZoneBroken(zone, candle) {
    if (zone.type === 'HFZ') {
      // SHORT zone: broken if price closes above
      return candle.close > zone.top * 1.02; // 2% buffer
    } else {
      // LONG zone: broken if price closes below
      return candle.close < zone.bottom * 0.98; // 2% buffer
    }
  }

  /**
   * Check if price is in zone
   */
  isPriceInZone(zone, candle) {
    return candle.low <= zone.top && candle.high >= zone.bottom;
  }

  /**
   * Get zone status at a specific point in time
   */
  getZoneStatusAtIndex(zone, candles, currentIndex) {
    // Count how many times zone was tested before this entry
    let testCount = 0;

    const zoneCreationIndex = candles.findIndex(c =>
      c.timestamp.getTime() === zone.createdAt.getTime()
    );

    for (let i = zoneCreationIndex; i < currentIndex; i++) {
      if (this.isPriceInZone(zone, candles[i])) {
        testCount++;
      }
    }

    if (testCount === 0) return 'fresh';
    if (testCount === 1) return 'tested_1x';
    if (testCount === 2) return 'tested_2x';
    return 'weak';
  }

  /**
   * Execute trade (create trade object)
   */
  executeTrade({ symbol, pattern, retestInfo, candles, capital, riskPerTrade, entryRules, exitRules }) {
    const zone = pattern.zone;
    const isLong = zone.type === 'LFZ';

    // Entry at zone mid or current price
    const entryPrice = retestInfo.entryCandle.close;

    // Stop loss beyond zone with buffer
    const stopLoss = isLong
      ? zone.bottom * 0.995 // 0.5% below zone
      : zone.top * 1.005; // 0.5% above zone

    // Calculate position size based on risk
    const riskAmount = capital * (riskPerTrade / 100);
    const stopDistance = Math.abs(entryPrice - stopLoss);
    const positionSize = riskAmount / stopDistance;

    // Target based on R:R ratio
    const rrRatio = exitRules.rrRatio || 2;
    const targetDistance = stopDistance * rrRatio;
    const target = isLong
      ? entryPrice + targetDistance
      : entryPrice - targetDistance;

    return {
      symbol,
      pattern_type: pattern.pattern,
      zone_type: zone.type,
      trade_direction: isLong ? 'LONG' : 'SHORT',

      // Zone info
      zone_status: retestInfo.zoneStatus,
      zone_top: zone.top,
      zone_bottom: zone.bottom,
      zone_mid: zone.mid,

      // Entry details
      entry_price: entryPrice,
      entry_time: retestInfo.entryCandle.timestamp,
      entry_candle_index: retestInfo.entryIndex,
      confirmation_type: retestInfo.confirmation.type,
      pattern_confidence: pattern.confidence,

      // Exit targets
      stop_loss: stopLoss,
      target: target,
      position_size: positionSize,
      risk_amount: riskAmount,

      // Metadata
      bars_to_retest: retestInfo.barsToRetest
    };
  }

  /**
   * Simulate trade outcome
   */
  simulateTrade(trade, candles, startIndex) {
    const isLong = trade.trade_direction === 'LONG';
    const maxBarsInTrade = 500; // Max bars to hold trade

    // Simulate each candle
    for (let i = startIndex + 1; i < Math.min(startIndex + maxBarsInTrade, candles.length); i++) {
      const candle = candles[i];

      // Check stop loss hit
      if (isLong && candle.low <= trade.stop_loss) {
        return {
          ...trade,
          exit_price: trade.stop_loss,
          exit_time: candle.timestamp,
          exit_candle_index: i,
          exit_reason: 'STOP_LOSS',
          pnl: -trade.risk_amount,
          pnl_percent: -((trade.risk_amount / (trade.position_size * trade.entry_price)) * 100),
          result: 'LOSS',
          trade_duration_hours: Math.round((candle.timestamp - trade.entry_time) / (1000 * 60 * 60)),
          rratio_actual: -1
        };
      }

      if (!isLong && candle.high >= trade.stop_loss) {
        return {
          ...trade,
          exit_price: trade.stop_loss,
          exit_time: candle.timestamp,
          exit_candle_index: i,
          exit_reason: 'STOP_LOSS',
          pnl: -trade.risk_amount,
          pnl_percent: -((trade.risk_amount / (trade.position_size * trade.entry_price)) * 100),
          result: 'LOSS',
          trade_duration_hours: Math.round((candle.timestamp - trade.entry_time) / (1000 * 60 * 60)),
          rratio_actual: -1
        };
      }

      // Check target hit
      if (isLong && candle.high >= trade.target) {
        const reward = Math.abs(trade.target - trade.entry_price) * trade.position_size;
        return {
          ...trade,
          exit_price: trade.target,
          exit_time: candle.timestamp,
          exit_candle_index: i,
          exit_reason: 'TARGET_HIT',
          pnl: reward,
          pnl_percent: ((reward / (trade.position_size * trade.entry_price)) * 100),
          result: 'WIN',
          trade_duration_hours: Math.round((candle.timestamp - trade.entry_time) / (1000 * 60 * 60)),
          rratio_actual: reward / trade.risk_amount
        };
      }

      if (!isLong && candle.low <= trade.target) {
        const reward = Math.abs(trade.entry_price - trade.target) * trade.position_size;
        return {
          ...trade,
          exit_price: trade.target,
          exit_time: candle.timestamp,
          exit_candle_index: i,
          exit_reason: 'TARGET_HIT',
          pnl: reward,
          pnl_percent: ((reward / (trade.position_size * trade.entry_price)) * 100),
          result: 'WIN',
          trade_duration_hours: Math.round((candle.timestamp - trade.entry_time) / (1000 * 60 * 60)),
          rratio_actual: reward / trade.risk_amount
        };
      }
    }

    // Trade not closed (neutral exit at last candle)
    const lastCandle = candles[candles.length - 1];
    return {
      ...trade,
      exit_price: lastCandle.close,
      exit_time: lastCandle.timestamp,
      exit_candle_index: candles.length - 1,
      exit_reason: 'NEUTRAL',
      pnl: 0,
      pnl_percent: 0,
      result: 'NEUTRAL',
      trade_duration_hours: Math.round((lastCandle.timestamp - trade.entry_time) / (1000 * 60 * 60)),
      rratio_actual: 0
    };
  }

  /**
   * Calculate performance metrics
   */
  calculateMetrics(trades, initialCapital) {
    if (trades.length === 0) {
      return {
        total_trades: 0,
        winning_trades: 0,
        losing_trades: 0,
        neutral_trades: 0,
        win_rate: 0,
        total_return: 0,
        net_profit: 0,
        max_drawdown: 0,
        sharpe_ratio: 0,
        profit_factor: 0,
        avg_win: 0,
        avg_loss: 0,
        largest_win: 0,
        largest_loss: 0,
        avg_rratio: 0,
        avg_trade_duration_hours: 0,
        avg_bars_to_entry: 0
      };
    }

    const winningTrades = trades.filter(t => t.result === 'WIN');
    const losingTrades = trades.filter(t => t.result === 'LOSS');
    const neutralTrades = trades.filter(t => t.result === 'NEUTRAL');

    const totalPnl = trades.reduce((sum, t) => sum + t.pnl, 0);
    const totalWin = winningTrades.reduce((sum, t) => sum + t.pnl, 0);
    const totalLoss = Math.abs(losingTrades.reduce((sum, t) => sum + t.pnl, 0));

    return {
      total_trades: trades.length,
      winning_trades: winningTrades.length,
      losing_trades: losingTrades.length,
      neutral_trades: neutralTrades.length,
      win_rate: (winningTrades.length / trades.length) * 100,

      total_return: ((totalPnl / initialCapital) * 100),
      net_profit: totalPnl,

      max_drawdown: this.calculateMaxDrawdown(trades, initialCapital),
      sharpe_ratio: this.calculateSharpe(trades),
      profit_factor: totalLoss > 0 ? (totalWin / totalLoss) : 0,

      avg_win: winningTrades.length > 0 ? totalWin / winningTrades.length : 0,
      avg_loss: losingTrades.length > 0 ? totalLoss / losingTrades.length : 0,
      largest_win: winningTrades.length > 0 ? Math.max(...winningTrades.map(t => t.pnl)) : 0,
      largest_loss: losingTrades.length > 0 ? Math.min(...losingTrades.map(t => t.pnl)) : 0,

      avg_rratio: trades.filter(t => t.rratio_actual).length > 0
        ? trades.reduce((sum, t) => sum + (t.rratio_actual || 0), 0) / trades.filter(t => t.rratio_actual).length
        : 0,

      // ✅ FIX: Round to integers for INTEGER database columns
      avg_trade_duration_hours: Math.round(trades.reduce((sum, t) => sum + t.trade_duration_hours, 0) / trades.length),
      avg_bars_to_entry: Math.round(trades.reduce((sum, t) => sum + (t.bars_to_retest || 0), 0) / trades.length)
    };
  }

  /**
   * Calculate maximum drawdown
   */
  calculateMaxDrawdown(trades, initialCapital) {
    let peak = initialCapital;
    let maxDD = 0;
    let equity = initialCapital;

    for (const trade of trades) {
      equity += trade.pnl;

      if (equity > peak) {
        peak = equity;
      }

      const drawdown = ((peak - equity) / peak) * 100;
      if (drawdown > maxDD) {
        maxDD = drawdown;
      }
    }

    return maxDD;
  }

  /**
   * Calculate Sharpe ratio
   */
  calculateSharpe(trades) {
    const returns = trades.map(t => t.pnl_percent || 0);
    const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length;

    const variance = returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length;
    const stdDev = Math.sqrt(variance);

    // Annualized Sharpe (assuming risk-free rate = 0)
    return stdDev > 0 ? (avgReturn / stdDev) * Math.sqrt(252) : 0;
  }

  /**
   * Save backtest to database
   */
  async saveBacktest(configId, userId, results) {
    try {
      // Save backtest result
      const { data: resultData, error: resultError } = await supabase
        .from('backtestresults')
        .insert([{
          config_id: configId,
          user_id: userId,
          ...results.metrics,
          equity_curve: results.equityCurve,
          candles_analyzed: results.candles_analyzed,
          patterns_detected: results.patterns_detected,
          patterns_entered: results.patterns_entered,
          execution_time_seconds: results.execution_time_seconds,
          status: 'completed'
        }])
        .select()
        .single();

      if (resultError) throw resultError;

      // Save individual trades
      if (results.trades.length > 0) {
        const tradesData = results.trades.map(trade => ({
          result_id: resultData.id,
          user_id: userId,
          ...trade
        }));

        const { error: tradesError } = await supabase
          .from('backtesttrades')
          .insert(tradesData);

        if (tradesError) throw tradesError;
      }

      return resultData;

    } catch (error) {
      console.error('Error saving backtest:', error);
      throw error;
    }
  }

  /**
   * Cancel ongoing backtest
   */
  cancel() {
    this.isCancelled = true;
  }

  // Helper functions

  timeframeToMs(timeframe) {
    const map = {
      '1m': 60 * 1000,
      '5m': 5 * 60 * 1000,
      '15m': 15 * 60 * 1000,
      '1h': 60 * 60 * 1000,
      '4h': 4 * 60 * 60 * 1000,
      '1d': 24 * 60 * 60 * 1000,
      '1w': 7 * 24 * 60 * 60 * 1000
    };
    return map[timeframe] || 60 * 60 * 1000;
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const backtestingService = new BacktestingService();
