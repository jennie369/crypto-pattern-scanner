/**
 * GEM AI Trading Brain - Position Service
 * Position tracking and analysis for AI assistant
 *
 * Features:
 * - Get open positions for user
 * - Analyze position P&L, risk, status
 * - Generate position alerts
 * - Provide recommendations
 */

import paperTradeService from '../paperTradeService';

// ═══════════════════════════════════════════════════════════
// ALERT TYPES
// ═══════════════════════════════════════════════════════════
export const ALERT_TYPES = {
  APPROACHING_SL: 'approaching_sl',
  APPROACHING_TP: 'approaching_tp',
  HIT_SL: 'hit_sl',
  HIT_TP: 'hit_tp',
  LARGE_PROFIT: 'large_profit',
  LARGE_LOSS: 'large_loss',
  RISK_WARNING: 'risk_warning',
  BREAKEVEN: 'breakeven',
};

// ═══════════════════════════════════════════════════════════
// THRESHOLDS
// ═══════════════════════════════════════════════════════════
const THRESHOLDS = {
  APPROACHING_SL_PERCENT: 1.5, // Alert when within 1.5% of SL
  APPROACHING_TP_PERCENT: 2, // Alert when within 2% of TP
  LARGE_PROFIT_PERCENT: 10, // Alert on 10%+ profit
  LARGE_LOSS_PERCENT: -5, // Alert on 5%+ loss
  HIGH_RISK_EXPOSURE: 0.5, // 50% of balance at risk
};

class AdminAIPositionService {
  constructor() {
    this.lastAnalysis = null;
    this.alertHistory = [];
  }

  // ═══════════════════════════════════════════════════════════
  // GET POSITIONS
  // ═══════════════════════════════════════════════════════════

  /**
   * Get all open positions for user
   * @param {string} userId - User ID
   * @returns {Promise<Array>} Array of open positions
   */
  async getOpenPositions(userId) {
    try {
      await paperTradeService.init(userId);
      return paperTradeService.openPositions || [];
    } catch (error) {
      console.error('[AdminAIPosition] getOpenPositions error:', error);
      return [];
    }
  }

  /**
   * Get pending orders for user
   * @param {string} userId - User ID
   * @returns {Promise<Array>} Array of pending orders
   */
  async getPendingOrders(userId) {
    try {
      await paperTradeService.init(userId);
      return paperTradeService.pendingOrders || [];
    } catch (error) {
      console.error('[AdminAIPosition] getPendingOrders error:', error);
      return [];
    }
  }

  /**
   * Get trade history for user
   * @param {string} userId - User ID
   * @param {number} limit - Number of recent trades
   * @returns {Promise<Array>} Array of historical trades
   */
  async getTradeHistory(userId, limit = 10) {
    try {
      await paperTradeService.init(userId);
      const history = paperTradeService.tradeHistory || [];
      return history.slice(-limit);
    } catch (error) {
      console.error('[AdminAIPosition] getTradeHistory error:', error);
      return [];
    }
  }

  /**
   * Get account balance info
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Balance info
   */
  async getBalanceInfo(userId) {
    try {
      await paperTradeService.init(userId);
      return {
        balance: paperTradeService.balance,
        initialBalance: paperTradeService.initialBalance,
        pnlPercent: ((paperTradeService.balance - paperTradeService.initialBalance) / paperTradeService.initialBalance) * 100,
      };
    } catch (error) {
      console.error('[AdminAIPosition] getBalanceInfo error:', error);
      return { balance: 0, initialBalance: 0, pnlPercent: 0 };
    }
  }

  // ═══════════════════════════════════════════════════════════
  // POSITION ANALYSIS
  // ═══════════════════════════════════════════════════════════

  /**
   * Analyze a single position
   * @param {Object} position - Position object
   * @param {number} currentPrice - Current market price
   * @returns {Object} Position analysis
   */
  analyzePosition(position, currentPrice) {
    if (!position || !currentPrice) {
      return { error: 'Invalid position or price' };
    }

    const { entryPrice, stopLoss, takeProfit, side, quantity, leverage = 1 } = position;
    const isLong = side === 'LONG';

    // Calculate P&L
    const priceDiff = isLong
      ? currentPrice - entryPrice
      : entryPrice - currentPrice;
    const pnlPercent = (priceDiff / entryPrice) * 100 * leverage;
    const pnlAmount = priceDiff * quantity;

    // Calculate distance to SL/TP
    const distanceToSL = stopLoss
      ? isLong
        ? ((currentPrice - stopLoss) / currentPrice) * 100
        : ((stopLoss - currentPrice) / currentPrice) * 100
      : null;

    const distanceToTP = takeProfit
      ? isLong
        ? ((takeProfit - currentPrice) / currentPrice) * 100
        : ((currentPrice - takeProfit) / currentPrice) * 100
      : null;

    // Calculate risk level
    const riskLevel = this._calculateRiskLevel(pnlPercent, distanceToSL);

    // Calculate R:R achieved
    const initialRisk = stopLoss
      ? Math.abs((entryPrice - stopLoss) / entryPrice) * 100 * leverage
      : null;
    const rrAchieved = initialRisk ? pnlPercent / initialRisk : null;

    return {
      symbol: position.symbol,
      side,
      entryPrice,
      currentPrice,
      pnlPercent: parseFloat(pnlPercent.toFixed(2)),
      pnlAmount: parseFloat(pnlAmount.toFixed(2)),
      distanceToSL: distanceToSL ? parseFloat(distanceToSL.toFixed(2)) : null,
      distanceToTP: distanceToTP ? parseFloat(distanceToTP.toFixed(2)) : null,
      riskLevel,
      rrAchieved: rrAchieved ? parseFloat(rrAchieved.toFixed(2)) : null,
      leverage,
      isProfit: pnlPercent > 0,
      timestamp: Date.now(),
    };
  }

  /**
   * Calculate risk level for position
   * @private
   */
  _calculateRiskLevel(pnlPercent, distanceToSL) {
    if (distanceToSL !== null && distanceToSL < THRESHOLDS.APPROACHING_SL_PERCENT) {
      return 'CRITICAL';
    }
    if (pnlPercent < THRESHOLDS.LARGE_LOSS_PERCENT) {
      return 'HIGH';
    }
    if (pnlPercent < 0) {
      return 'MEDIUM';
    }
    return 'LOW';
  }

  /**
   * Analyze all positions for a user
   * @param {string} userId - User ID
   * @param {Object} currentPrices - Map of symbol -> current price
   * @returns {Promise<Object>} Full portfolio analysis
   */
  async analyzeAllPositions(userId, currentPrices = {}) {
    const positions = await this.getOpenPositions(userId);
    const balanceInfo = await this.getBalanceInfo(userId);

    if (positions.length === 0) {
      return {
        positions: [],
        totalPnL: 0,
        totalPnLPercent: 0,
        riskLevel: 'LOW',
        alerts: [],
        balanceInfo,
        timestamp: Date.now(),
      };
    }

    const analyzedPositions = [];
    let totalPnL = 0;
    let totalExposure = 0;
    const alerts = [];

    for (const position of positions) {
      const price = currentPrices[position.symbol];
      if (!price) continue;

      const analysis = this.analyzePosition(position, price);
      analyzedPositions.push(analysis);

      totalPnL += analysis.pnlAmount || 0;
      totalExposure += position.quantity * position.entryPrice;

      // Generate alerts
      const positionAlerts = this.getPositionAlerts(position, price);
      alerts.push(...positionAlerts);
    }

    const totalPnLPercent = balanceInfo.initialBalance > 0
      ? (totalPnL / balanceInfo.initialBalance) * 100
      : 0;

    const exposureRatio = balanceInfo.balance > 0
      ? totalExposure / balanceInfo.balance
      : 0;

    const portfolioRiskLevel = this._calculatePortfolioRisk(analyzedPositions, exposureRatio);

    this.lastAnalysis = {
      positions: analyzedPositions,
      totalPnL: parseFloat(totalPnL.toFixed(2)),
      totalPnLPercent: parseFloat(totalPnLPercent.toFixed(2)),
      totalExposure: parseFloat(totalExposure.toFixed(2)),
      exposureRatio: parseFloat(exposureRatio.toFixed(2)),
      riskLevel: portfolioRiskLevel,
      alerts,
      balanceInfo,
      positionCount: positions.length,
      timestamp: Date.now(),
    };

    return this.lastAnalysis;
  }

  /**
   * Calculate portfolio-level risk
   * @private
   */
  _calculatePortfolioRisk(positions, exposureRatio) {
    const criticalCount = positions.filter((p) => p.riskLevel === 'CRITICAL').length;
    const highCount = positions.filter((p) => p.riskLevel === 'HIGH').length;

    if (criticalCount > 0 || exposureRatio > THRESHOLDS.HIGH_RISK_EXPOSURE) {
      return 'CRITICAL';
    }
    if (highCount > 1) {
      return 'HIGH';
    }
    if (highCount === 1) {
      return 'MEDIUM';
    }
    return 'LOW';
  }

  // ═══════════════════════════════════════════════════════════
  // POSITION ALERTS
  // ═══════════════════════════════════════════════════════════

  /**
   * Generate alerts for a position
   * @param {Object} position - Position object
   * @param {number} currentPrice - Current market price
   * @returns {Array} Array of alerts
   */
  getPositionAlerts(position, currentPrice) {
    const alerts = [];
    const analysis = this.analyzePosition(position, currentPrice);

    // Approaching SL
    if (analysis.distanceToSL !== null && analysis.distanceToSL < THRESHOLDS.APPROACHING_SL_PERCENT && analysis.distanceToSL > 0) {
      alerts.push({
        type: ALERT_TYPES.APPROACHING_SL,
        priority: 'urgent',
        symbol: position.symbol,
        message: `⚠️ ${position.symbol} approaching SL (${analysis.distanceToSL.toFixed(1)}% away)`,
        data: analysis,
      });
    }

    // Hit SL (negative distance = past SL)
    if (analysis.distanceToSL !== null && analysis.distanceToSL <= 0) {
      alerts.push({
        type: ALERT_TYPES.HIT_SL,
        priority: 'urgent',
        symbol: position.symbol,
        message: `❌ ${position.symbol} HIT STOP LOSS`,
        data: analysis,
      });
    }

    // Approaching TP
    if (analysis.distanceToTP !== null && analysis.distanceToTP < THRESHOLDS.APPROACHING_TP_PERCENT && analysis.distanceToTP > 0) {
      alerts.push({
        type: ALERT_TYPES.APPROACHING_TP,
        priority: 'high',
        symbol: position.symbol,
        message: `🎯 ${position.symbol} approaching TP (${analysis.distanceToTP.toFixed(1)}% away)`,
        data: analysis,
      });
    }

    // Hit TP
    if (analysis.distanceToTP !== null && analysis.distanceToTP <= 0) {
      alerts.push({
        type: ALERT_TYPES.HIT_TP,
        priority: 'high',
        symbol: position.symbol,
        message: `✅ ${position.symbol} HIT TAKE PROFIT`,
        data: analysis,
      });
    }

    // Large profit
    if (analysis.pnlPercent > THRESHOLDS.LARGE_PROFIT_PERCENT) {
      alerts.push({
        type: ALERT_TYPES.LARGE_PROFIT,
        priority: 'normal',
        symbol: position.symbol,
        message: `💰 ${position.symbol} +${analysis.pnlPercent.toFixed(1)}% profit - consider taking some profit`,
        data: analysis,
      });
    }

    // Large loss
    if (analysis.pnlPercent < THRESHOLDS.LARGE_LOSS_PERCENT) {
      alerts.push({
        type: ALERT_TYPES.LARGE_LOSS,
        priority: 'high',
        symbol: position.symbol,
        message: `📉 ${position.symbol} ${analysis.pnlPercent.toFixed(1)}% loss - review position`,
        data: analysis,
      });
    }

    return alerts;
  }

  // ═══════════════════════════════════════════════════════════
  // RECOMMENDATIONS
  // ═══════════════════════════════════════════════════════════

  /**
   * Generate recommendation for a position
   * @param {Object} analysis - Position analysis from analyzePosition()
   * @returns {Object} Recommendation
   */
  generateRecommendation(analysis) {
    const { pnlPercent, distanceToSL, distanceToTP, riskLevel, rrAchieved } = analysis;

    // Critical: approaching or hit SL
    if (riskLevel === 'CRITICAL') {
      if (distanceToSL <= 0) {
        return {
          action: 'CLOSE',
          urgency: 'IMMEDIATE',
          reason: 'SL hit - close position to limit loss',
          confidence: 95,
        };
      }
      return {
        action: 'MONITOR',
        urgency: 'HIGH',
        reason: `Position near SL (${distanceToSL?.toFixed(1)}% away). Prepare to close or move SL.`,
        confidence: 85,
      };
    }

    // Near TP
    if (distanceToTP !== null && distanceToTP < 2) {
      return {
        action: 'TAKE_PROFIT',
        urgency: 'HIGH',
        reason: 'Approaching TP - consider taking profits',
        confidence: 80,
      };
    }

    // Good profit achieved
    if (rrAchieved !== null && rrAchieved >= 2) {
      return {
        action: 'PARTIAL_CLOSE',
        urgency: 'MEDIUM',
        reason: `2R achieved (${rrAchieved?.toFixed(1)}R) - consider taking 50% off`,
        confidence: 75,
      };
    }

    // In profit but not at target
    if (pnlPercent > 5) {
      return {
        action: 'TRAIL_STOP',
        urgency: 'LOW',
        reason: 'In profit - consider trailing stop to breakeven',
        confidence: 70,
      };
    }

    // In loss but manageable
    if (pnlPercent < 0 && pnlPercent > THRESHOLDS.LARGE_LOSS_PERCENT) {
      return {
        action: 'HOLD',
        urgency: 'LOW',
        reason: 'Minor drawdown - hold if thesis still valid',
        confidence: 65,
      };
    }

    // Default: hold
    return {
      action: 'HOLD',
      urgency: 'LOW',
      reason: 'Position within normal parameters',
      confidence: 60,
    };
  }

  /**
   * Get summary of all recommendations
   * @param {string} userId - User ID
   * @param {Object} currentPrices - Map of symbol -> price
   * @returns {Promise<Object>} Summary with recommendations
   */
  async getRecommendationsSummary(userId, currentPrices = {}) {
    const analysis = await this.analyzeAllPositions(userId, currentPrices);

    const recommendations = analysis.positions.map((pos) => ({
      symbol: pos.symbol,
      side: pos.side,
      pnlPercent: pos.pnlPercent,
      ...this.generateRecommendation(pos),
    }));

    // Sort by urgency
    const urgencyOrder = { IMMEDIATE: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
    recommendations.sort((a, b) => urgencyOrder[a.urgency] - urgencyOrder[b.urgency]);

    return {
      recommendations,
      urgentCount: recommendations.filter((r) => r.urgency === 'IMMEDIATE' || r.urgency === 'HIGH').length,
      portfolioRisk: analysis.riskLevel,
      alerts: analysis.alerts,
      timestamp: Date.now(),
    };
  }
}

// Export singleton
export const adminAIPositionService = new AdminAIPositionService();
export default adminAIPositionService;
