/**
 * GEM Mobile - Scanner Integration Service
 * Phase 3C: Final integration combining all pattern detection services
 *
 * This service orchestrates all detection algorithms and provides
 * a unified interface for the scanner functionality.
 */

import { calculateOddsEnhancers, quickScore } from './oddsEnhancers';
import { checkFTBStatus } from './ftbTracker';
import { detectCompression } from './compressionDetector';
import { detectInducement } from './inducementDetector';
import { validateLookRight } from './lookRightValidator';
import { scanConfirmationPatterns, getBestConfirmation, calculateConfirmationScore } from './confirmationPatterns';
import { detectPinEngulfCombo } from './pinEngulfCombo';
import { calculateMPL } from './mplCalculator';
import { checkZoneExtension } from './extendedZoneCalculator';
import { alertManager } from './alertManager';

/**
 * Complete scanner analysis
 * Runs all detection algorithms on provided candle data
 *
 * @param {Object} params - Analysis parameters
 * @param {string} params.symbol - Trading symbol
 * @param {string} params.timeframe - Timeframe
 * @param {Array} params.candles - OHLCV candle data
 * @param {Array} params.htfCandles - Higher timeframe candles (optional)
 * @param {Array} params.ltfCandles - Lower timeframe candles (optional)
 * @param {Array} params.zones - Detected zones
 * @param {string} params.userId - User ID for alerts
 * @param {number} params.currentPrice - Current market price
 * @param {Object} params.userPreferences - User preferences
 * @returns {Promise<Object>} Complete analysis result
 */
export const runCompleteAnalysis = async ({
  symbol,
  timeframe,
  candles,
  htfCandles = null,
  ltfCandles = null,
  zones = [],
  userId,
  currentPrice,
  userPreferences = {},
}) => {
  const startTime = Date.now();

  try {
    if (!candles || candles.length < 10) {
      return {
        success: false,
        error: 'Insufficient candle data',
        symbol,
        timeframe,
      };
    }

    // Get current price if not provided
    const price = currentPrice || candles[candles.length - 1]?.close;

    // 1. Start with provided zones
    let allZones = [...zones];

    // 2. Validate with Look Right
    allZones = allZones.map(zone => {
      const validation = validateLookRight(zone, candles);
      return { ...zone, ...validation };
    }).filter(z => z.isValid);

    // 3. Check for zone extensions
    allZones = allZones.map(zone => {
      const extension = checkZoneExtension(zone, candles);
      if (extension.shouldExtend) {
        return { ...zone, ...extension.zone, isExtended: true };
      }
      return zone;
    });

    // 4. Calculate Odds Enhancers for each zone
    allZones = await Promise.all(allZones.map(async (zone) => {
      const odds = await calculateOddsEnhancers({
        zone,
        candles,
        htfCandles,
        testCount: zone.testCount || 0,
      });
      return {
        ...zone,
        oddsScore: odds?.totalScore || 0,
        oddsGrade: odds?.grade || 'F',
        oddsResult: odds,
      };
    }));

    // 5. Check FTB status
    allZones = allZones.map(zone => {
      const ftbStatus = checkFTBStatus(zone, price, zone.testCount || 0);
      return {
        ...zone,
        ftbStatus,
        isFTB: ftbStatus?.isFirstTimeBack || false,
      };
    });

    // 6. Compression detection
    const recentCandles = candles.slice(-20);
    allZones = allZones.map(zone => {
      const compression = detectCompression(recentCandles, zone);
      return { ...zone, compression };
    });

    // 7. Inducement detection
    allZones = allZones.map(zone => {
      const inducement = detectInducement(recentCandles, zone);
      return { ...zone, inducement };
    });

    // 8. Confirmation patterns
    const confirmCandles = candles.slice(-5);
    allZones = allZones.map(zone => {
      const confirmations = scanConfirmationPatterns(confirmCandles, zone);
      const pinEngulfCombo = detectPinEngulfCombo(confirmCandles, zone);
      const bestConfirmation = getBestConfirmation(confirmations);

      return {
        ...zone,
        confirmations,
        pinEngulfCombo,
        bestConfirmation,
        hasConfirmation: confirmations.length > 0,
        confirmationScore: calculateConfirmationScore(confirmations),
      };
    });

    // 9. MPL calculation for zones with enough data
    allZones = allZones.map(zone => {
      const candlesInZone = candles.filter(c =>
        c.low <= Math.max(zone.entryPrice, zone.stopPrice) &&
        c.high >= Math.min(zone.entryPrice, zone.stopPrice)
      );
      const mpl = calculateMPL(zone, candlesInZone);
      return { ...zone, mpl };
    });

    // 10. Final sorting and filtering
    const tradeableZones = allZones
      .filter(z => z.oddsScore >= 8) // Minimum C grade
      .sort((a, b) => {
        // Sort by: hierarchy -> odds score -> FTB -> confirmation
        const hierA = a.zoneHierarchyLevel || 4;
        const hierB = b.zoneHierarchyLevel || 4;
        if (hierA !== hierB) {
          return hierA - hierB;
        }
        if (a.oddsScore !== b.oddsScore) {
          return b.oddsScore - a.oddsScore;
        }
        if (a.isFTB !== b.isFTB) {
          return a.isFTB ? -1 : 1;
        }
        return (b.confirmationScore || 0) - (a.confirmationScore || 0);
      });

    // 11. Trigger alerts if needed
    if (userId && alertManager.isInitialized) {
      const previousPrice = candles[candles.length - 2]?.close;
      await alertManager.checkAlertsForSymbol(
        symbol,
        price,
        previousPrice,
        tradeableZones,
        confirmCandles
      );
    }

    const executionTime = Date.now() - startTime;

    // 12. Build result
    return {
      success: true,
      symbol,
      timeframe,
      currentPrice: price,

      // All zones
      allZones,
      tradeableZones,

      // Best opportunities
      bestZone: tradeableZones[0] || null,
      ftbOpportunities: tradeableZones.filter(z => z.isFTB),
      confirmedZones: tradeableZones.filter(z => z.hasConfirmation),
      comboZones: tradeableZones.filter(z => z.pinEngulfCombo?.hasPinEngulfCombo),

      // Stats
      stats: {
        totalZones: allZones.length,
        validZones: allZones.filter(z => z.isValid).length,
        tradeableCount: tradeableZones.length,
        ftbCount: tradeableZones.filter(z => z.isFTB).length,
        confirmedCount: tradeableZones.filter(z => z.hasConfirmation).length,
        comboCount: tradeableZones.filter(z => z.pinEngulfCombo?.hasPinEngulfCombo).length,
        avgOddsScore: tradeableZones.length > 0
          ? (tradeableZones.reduce((sum, z) => sum + z.oddsScore, 0) / tradeableZones.length).toFixed(1)
          : 0,
        hierarchyBreakdown: {
          dp: allZones.filter(z => z.zoneHierarchyLevel === 1).length,
          ftr: allZones.filter(z => z.zoneHierarchyLevel === 2).length,
          fl: allZones.filter(z => z.zoneHierarchyLevel === 3).length,
          regular: allZones.filter(z => z.zoneHierarchyLevel === 4 || !z.zoneHierarchyLevel).length,
        },
      },

      // Metadata
      executionTime,
      analyzedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error('[Scanner Integration] Error:', error);
    return {
      success: false,
      error: error.message,
      symbol,
      timeframe,
    };
  }
};

/**
 * Quick scan for watchlist/multi-symbol
 * Faster analysis with fewer features
 *
 * @param {Array} candles - Candle data
 * @param {Array} zones - Detected zones
 * @param {Object} options - Scan options
 * @returns {Object} Quick scan result
 */
export const runQuickScan = (candles, zones = [], options = {}) => {
  const { symbol, timeframe, currentPrice } = options;

  try {
    const price = currentPrice || candles[candles.length - 1]?.close;

    // Quick validation and scoring
    const quickZones = zones.slice(0, 5).map(zone => {
      const score = quickScore(zone, zone.testCount || 0);
      const ftbStatus = checkFTBStatus(zone, price, zone.testCount || 0);

      return {
        ...zone,
        ...score,
        isFTB: ftbStatus?.isFirstTimeBack || false,
        priceDistance: Math.abs(price - zone.entryPrice) / price * 100,
      };
    });

    // Sort by distance to price
    quickZones.sort((a, b) => a.priceDistance - b.priceDistance);

    return {
      success: true,
      symbol,
      timeframe,
      currentPrice: price,
      zones: quickZones,
      nearestZone: quickZones[0] || null,
      ftbAvailable: quickZones.some(z => z.isFTB),
    };
  } catch (error) {
    console.error('[Quick Scan] Error:', error);
    return {
      success: false,
      error: error.message,
      symbol,
      timeframe,
    };
  }
};

/**
 * Analyze single zone in detail
 *
 * @param {Object} zone - Zone to analyze
 * @param {Array} candles - Candle data
 * @param {number} currentPrice - Current price
 * @returns {Object} Detailed zone analysis
 */
export const analyzeZoneDetail = async (zone, candles, currentPrice) => {
  try {
    const price = currentPrice || candles[candles.length - 1]?.close;

    // Full analysis for single zone
    const validation = validateLookRight(zone, candles);
    const extension = checkZoneExtension(zone, candles);
    const ftbStatus = checkFTBStatus(zone, price, zone.testCount || 0);

    const odds = await calculateOddsEnhancers({
      zone,
      candles,
      testCount: zone.testCount || 0,
    });

    const recentCandles = candles.slice(-5);
    const confirmations = scanConfirmationPatterns(recentCandles, zone);
    const pinEngulfCombo = detectPinEngulfCombo(recentCandles, zone);
    const compression = detectCompression(candles.slice(-20), zone);
    const inducement = detectInducement(candles.slice(-20), zone);

    const candlesInZone = candles.filter(c =>
      c.low <= Math.max(zone.entryPrice, zone.stopPrice) &&
      c.high >= Math.min(zone.entryPrice, zone.stopPrice)
    );
    const mpl = calculateMPL(zone, candlesInZone);

    return {
      success: true,
      zone: {
        ...zone,
        ...validation,
        ...(extension.shouldExtend ? extension.zone : {}),
        isExtended: extension.shouldExtend,
        ftbStatus,
        isFTB: ftbStatus?.isFirstTimeBack || false,
        oddsScore: odds?.totalScore || 0,
        oddsGrade: odds?.grade || 'F',
        oddsResult: odds,
        confirmations,
        pinEngulfCombo,
        bestConfirmation: confirmations[0] || null,
        hasConfirmation: confirmations.length > 0,
        confirmationScore: calculateConfirmationScore(confirmations),
        compression,
        inducement,
        mpl,
      },
      currentPrice: price,
      analyzedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error('[Zone Detail] Error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Get scanner summary stats
 *
 * @param {Object} analysisResult - Result from runCompleteAnalysis
 * @returns {Object} Summary stats for display
 */
export const getScannerSummary = (analysisResult) => {
  if (!analysisResult?.success) {
    return {
      status: 'error',
      message: analysisResult?.error || 'Analysis failed',
    };
  }

  const { stats, bestZone, ftbOpportunities, comboZones } = analysisResult;

  return {
    status: 'success',
    totalZones: stats.totalZones,
    tradeable: stats.tradeableCount,
    avgScore: stats.avgOddsScore,
    ftbCount: stats.ftbCount,
    confirmedCount: stats.confirmedCount,
    comboCount: stats.comboCount,
    bestOpportunity: bestZone ? {
      symbol: bestZone.symbol,
      type: bestZone.zoneType,
      grade: bestZone.oddsGrade,
      isFTB: bestZone.isFTB,
      hasCombo: !!bestZone.pinEngulfCombo?.hasPinEngulfCombo,
    } : null,
    highlights: [
      ftbOpportunities.length > 0 && `${ftbOpportunities.length} FTB opportunities`,
      comboZones.length > 0 && `${comboZones.length} Pin+Engulf combos`,
      bestZone?.oddsGrade === 'A+' && 'A+ zone available!',
    ].filter(Boolean),
  };
};

export default {
  runCompleteAnalysis,
  runQuickScan,
  analyzeZoneDetail,
  getScannerSummary,
};
