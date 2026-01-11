/**
 * GEM Scanner - Order Lines Service
 * Manages order line data for chart display (Entry, TP, SL, Liquidation)
 */

import paperTradeService from './paperTradeService';
import { binanceService } from './binanceService';
import { chartPreferencesService } from './chartPreferencesService';

// Line types enum
export const LINE_TYPES = {
  ENTRY: 'entry',
  TAKE_PROFIT: 'take_profit',
  STOP_LOSS: 'stop_loss',
  LIQUIDATION: 'liquidation',
  PENDING_ENTRY: 'pending_entry',
  PENDING_TP: 'pending_tp',
  PENDING_SL: 'pending_sl',
};

// Default colors matching Binance
export const LINE_COLORS = {
  [LINE_TYPES.ENTRY]: '#FFBD59',        // Gold
  [LINE_TYPES.TAKE_PROFIT]: '#22C55E',  // Green
  [LINE_TYPES.STOP_LOSS]: '#EF4444',    // Red
  [LINE_TYPES.LIQUIDATION]: '#A855F7',  // Purple
  [LINE_TYPES.PENDING_ENTRY]: '#00F0FF', // Cyan
  [LINE_TYPES.PENDING_TP]: '#22C55E80', // Green semi-transparent
  [LINE_TYPES.PENDING_SL]: '#EF444480', // Red semi-transparent
};

class OrderLinesService {
  constructor() {
    this.currentSymbol = null;
    this.orderLines = [];
    this.onUpdateCallback = null;
    this.customColors = null;
  }

  /**
   * Set callback for order lines updates
   */
  setOnUpdateCallback(callback) {
    this.onUpdateCallback = callback;
  }

  /**
   * Get colors from preferences or use defaults
   * Maps preference keys to LINE_TYPES
   */
  getColors() {
    try {
      const prefColors = chartPreferencesService.getOrderLineColors();
      return {
        [LINE_TYPES.ENTRY]: prefColors.entryLineColor || LINE_COLORS[LINE_TYPES.ENTRY],
        [LINE_TYPES.TAKE_PROFIT]: prefColors.tpLineColor || LINE_COLORS[LINE_TYPES.TAKE_PROFIT],
        [LINE_TYPES.STOP_LOSS]: prefColors.slLineColor || LINE_COLORS[LINE_TYPES.STOP_LOSS],
        [LINE_TYPES.LIQUIDATION]: prefColors.liquidationLineColor || LINE_COLORS[LINE_TYPES.LIQUIDATION],
        [LINE_TYPES.PENDING_ENTRY]: prefColors.pendingLineColor || LINE_COLORS[LINE_TYPES.PENDING_ENTRY],
        [LINE_TYPES.PENDING_TP]: (prefColors.tpLineColor || LINE_COLORS[LINE_TYPES.TAKE_PROFIT]) + '80', // Semi-transparent
        [LINE_TYPES.PENDING_SL]: (prefColors.slLineColor || LINE_COLORS[LINE_TYPES.STOP_LOSS]) + '80', // Semi-transparent
      };
    } catch (error) {
      console.warn('[OrderLinesService] Error getting colors from preferences, using defaults:', error);
      return LINE_COLORS;
    }
  }

  /**
   * Get line styles from preferences or use defaults
   * Maps preference keys to LINE_TYPES (0=Solid, 1=Dashed, 2=Dotted)
   */
  getLineStyles() {
    try {
      const prefStyles = chartPreferencesService.getOrderLineStyles();
      return {
        [LINE_TYPES.ENTRY]: prefStyles.entryLineStyle ?? 0,
        [LINE_TYPES.TAKE_PROFIT]: prefStyles.tpLineStyle ?? 1,
        [LINE_TYPES.STOP_LOSS]: prefStyles.slLineStyle ?? 1,
        [LINE_TYPES.LIQUIDATION]: prefStyles.liquidationLineStyle ?? 2,
        [LINE_TYPES.PENDING_ENTRY]: prefStyles.pendingLineStyle ?? 2,
        [LINE_TYPES.PENDING_TP]: prefStyles.tpLineStyle ?? 1, // Same as TP
        [LINE_TYPES.PENDING_SL]: prefStyles.slLineStyle ?? 1, // Same as SL
      };
    } catch (error) {
      console.warn('[OrderLinesService] Error getting line styles from preferences, using defaults:', error);
      return {
        [LINE_TYPES.ENTRY]: 0,
        [LINE_TYPES.TAKE_PROFIT]: 1,
        [LINE_TYPES.STOP_LOSS]: 1,
        [LINE_TYPES.LIQUIDATION]: 2,
        [LINE_TYPES.PENDING_ENTRY]: 2,
        [LINE_TYPES.PENDING_TP]: 1,
        [LINE_TYPES.PENDING_SL]: 1,
      };
    }
  }

  /**
   * Get order lines for a specific symbol
   * @param {string} symbol - Trading pair (e.g., 'BTCUSDT')
   * @param {Object} preferences - User preferences for visibility
   * @returns {Array} Order lines data
   */
  async getOrderLinesForSymbol(symbol, preferences = {}) {
    this.currentSymbol = symbol;
    const lines = [];

    const {
      showEntryLines = true,
      showTPLines = true,
      showSLLines = true,
      showLiquidationLines = true,
      showPendingOrders = true,
    } = preferences;

    try {
      // Get open positions for this symbol
      const positions = await this.getPositionsForSymbol(symbol);

      // Get pending orders for this symbol
      const pendingOrders = await this.getPendingOrdersForSymbol(symbol);

      // Get current price for PnL calculation
      const currentPrice = await this.getCurrentPrice(symbol);

      // Process open positions
      for (const position of positions) {
        const positionLines = this.createPositionLines(
          position,
          currentPrice,
          { showEntryLines, showTPLines, showSLLines, showLiquidationLines }
        );
        lines.push(...positionLines);
      }

      // Process pending orders
      if (showPendingOrders) {
        for (const order of pendingOrders) {
          const orderLines = this.createPendingOrderLines(order);
          lines.push(...orderLines);
        }
      }

      this.orderLines = lines;
      console.log('[OrderLinesService] getOrderLinesForSymbol result:', {
        symbol,
        linesCount: lines.length,
        lines: lines.map(l => ({
          id: l.id,
          type: l.type,
          price: l.price,
          label: l.label,
        }))
      });
      return lines;
    } catch (error) {
      console.error('[OrderLinesService] Error getting order lines:', error);
      return [];
    }
  }

  /**
   * Get positions for a specific symbol
   * Note: userId should be set via setCurrentUserId() before calling this
   */
  async getPositionsForSymbol(symbol) {
    await paperTradeService.init(paperTradeService.currentUserId);
    const allPositions = paperTradeService.openPositions || [];
    const filtered = allPositions.filter(p => p.symbol === symbol && p.status === 'OPEN');
    console.log('[OrderLinesService] getPositionsForSymbol:', {
      symbol,
      allPositions: allPositions.length,
      filtered: filtered.length,
      positions: filtered.map(p => ({
        id: p.id,
        symbol: p.symbol,
        status: p.status,
        entryPrice: p.entryPrice,
        takeProfit: p.takeProfit,
        stopLoss: p.stopLoss,
        direction: p.direction,
      }))
    });
    return filtered;
  }

  /**
   * Get pending orders for a specific symbol
   * Note: userId should be set via setCurrentUserId() before calling this
   */
  async getPendingOrdersForSymbol(symbol) {
    await paperTradeService.init(paperTradeService.currentUserId);
    const allPending = paperTradeService.pendingOrders || [];
    return allPending.filter(p => p.symbol === symbol && p.status === 'PENDING');
  }

  /**
   * Get current price from Binance
   */
  async getCurrentPrice(symbol) {
    try {
      const price = await binanceService.getPrice(symbol);
      return price || 0;
    } catch (error) {
      console.error('[OrderLinesService] Error getting price:', error);
      return 0;
    }
  }

  /**
   * Create order lines for an open position
   */
  createPositionLines(position, currentPrice, visibility) {
    const lines = [];
    // Get colors and styles from preferences (custom settings)
    const colors = this.getColors();
    const lineStyles = this.getLineStyles();

    const {
      id,
      // Support both camelCase (local) and snake_case (database)
      entryPrice: localEntryPrice,
      entry_price,
      takeProfit: localTakeProfit,
      take_profit,
      stopLoss: localStopLoss,
      stop_loss,
      direction,
      quantity,
      leverage = 1,
      positionValue: localPositionValue,
      position_value,
    } = position;

    // Use camelCase first (from paperTradeService), fallback to snake_case (from database)
    const entryPrice = parseFloat(localEntryPrice || entry_price);
    const tp = (localTakeProfit || take_profit) ? parseFloat(localTakeProfit || take_profit) : null;
    const sl = (localStopLoss || stop_loss) ? parseFloat(localStopLoss || stop_loss) : null;
    const isLong = direction === 'LONG';

    // Calculate PnL
    const pnl = this.calculatePnL(entryPrice, currentPrice, quantity, isLong);
    const pnlPercent = this.calculatePnLPercent(entryPrice, currentPrice, isLong, leverage);

    // Entry Line - Use clear label to distinguish from pattern lines
    // Include quantity, direction, leverage for real-time PnL calculation in WebView
    if (visibility.showEntryLines) {
      lines.push({
        id: `${id}_entry`,
        positionId: id,
        type: LINE_TYPES.ENTRY,
        price: entryPrice,
        color: colors[LINE_TYPES.ENTRY],
        label: isLong ? '▲ Long' : '▼ Short', // Direction arrow + type
        direction,
        quantity,  // For real-time PnL calculation
        leverage,  // For real-time PnL calculation
        pnl,
        pnlPercent,
        currentPrice,
        isDraggable: false,
        lineStyle: lineStyles[LINE_TYPES.ENTRY],
      });
    }

    // Take Profit Line
    if (visibility.showTPLines && tp) {
      const tpPnl = this.calculatePnL(entryPrice, tp, quantity, isLong);
      const tpPercent = this.calculatePnLPercent(entryPrice, tp, isLong, leverage);

      lines.push({
        id: `${id}_tp`,
        positionId: id,
        type: LINE_TYPES.TAKE_PROFIT,
        price: tp,
        color: colors[LINE_TYPES.TAKE_PROFIT],
        label: 'TP',
        expectedPnl: tpPnl,
        expectedPercent: tpPercent,
        isDraggable: true,
        lineStyle: lineStyles[LINE_TYPES.TAKE_PROFIT],
      });
    }

    // Stop Loss Line
    if (visibility.showSLLines && sl) {
      const slPnl = this.calculatePnL(entryPrice, sl, quantity, isLong);
      const slPercent = this.calculatePnLPercent(entryPrice, sl, isLong, leverage);

      lines.push({
        id: `${id}_sl`,
        positionId: id,
        type: LINE_TYPES.STOP_LOSS,
        price: sl,
        color: colors[LINE_TYPES.STOP_LOSS],
        label: 'SL',
        expectedPnl: slPnl,
        expectedPercent: slPercent,
        isDraggable: true,
        lineStyle: lineStyles[LINE_TYPES.STOP_LOSS],
      });
    }

    // Liquidation Price Line
    if (visibility.showLiquidationLines && leverage > 1) {
      const liquidationPrice = this.calculateLiquidationPrice(entryPrice, leverage, isLong);

      lines.push({
        id: `${id}_liq`,
        positionId: id,
        type: LINE_TYPES.LIQUIDATION,
        price: liquidationPrice,
        color: colors[LINE_TYPES.LIQUIDATION],
        label: 'Thanh Lý',
        isDraggable: false,
        lineStyle: lineStyles[LINE_TYPES.LIQUIDATION],
      });
    }

    return lines;
  }

  /**
   * Create order lines for pending orders
   */
  createPendingOrderLines(order) {
    const lines = [];
    // Get colors and styles from preferences (custom settings)
    const colors = this.getColors();
    const lineStyles = this.getLineStyles();

    const {
      id,
      // Support both camelCase (local) and snake_case (database)
      entryPrice: localEntryPrice,
      limit_price,
      takeProfit: localTakeProfit,
      take_profit,
      stopLoss: localStopLoss,
      stop_loss,
      direction,
    } = order;

    // For pending orders, entry price is stored in entryPrice (camelCase) or limit_price (snake_case)
    const entryPrice = parseFloat(localEntryPrice || limit_price);
    const tp = (localTakeProfit || take_profit) ? parseFloat(localTakeProfit || take_profit) : null;
    const sl = (localStopLoss || stop_loss) ? parseFloat(localStopLoss || stop_loss) : null;
    const isLong = direction === 'LONG';

    // Pending Entry Line
    lines.push({
      id: `${id}_pending_entry`,
      orderId: id,
      type: LINE_TYPES.PENDING_ENTRY,
      price: entryPrice,
      color: colors[LINE_TYPES.PENDING_ENTRY],
      label: isLong ? '○ Chờ Long' : '○ Chờ Short', // Circle + pending type
      direction,
      isPending: true,
      isDraggable: true,
      lineStyle: lineStyles[LINE_TYPES.PENDING_ENTRY],
    });

    // Pending TP Line
    if (tp) {
      lines.push({
        id: `${id}_pending_tp`,
        orderId: id,
        type: LINE_TYPES.PENDING_TP,
        price: tp,
        color: colors[LINE_TYPES.PENDING_TP],
        label: 'Chờ TP',
        isPending: true,
        isDraggable: true,
        lineStyle: lineStyles[LINE_TYPES.PENDING_TP],
      });
    }

    // Pending SL Line
    if (sl) {
      lines.push({
        id: `${id}_pending_sl`,
        orderId: id,
        type: LINE_TYPES.PENDING_SL,
        price: sl,
        color: colors[LINE_TYPES.PENDING_SL],
        label: 'Chờ SL',
        isPending: true,
        isDraggable: true,
        lineStyle: lineStyles[LINE_TYPES.PENDING_SL],
      });
    }

    return lines;
  }

  /**
   * Calculate PnL
   */
  calculatePnL(entryPrice, currentPrice, quantity, isLong) {
    if (!entryPrice || !currentPrice || !quantity) return 0;
    const priceDiff = isLong
      ? currentPrice - entryPrice
      : entryPrice - currentPrice;
    return priceDiff * quantity;
  }

  /**
   * Calculate PnL percentage
   */
  calculatePnLPercent(entryPrice, currentPrice, isLong, leverage = 1) {
    if (!entryPrice || !currentPrice) return 0;
    const priceDiff = isLong
      ? (currentPrice - entryPrice) / entryPrice
      : (entryPrice - currentPrice) / entryPrice;
    return priceDiff * leverage * 100;
  }

  /**
   * Calculate liquidation price
   */
  calculateLiquidationPrice(entryPrice, leverage, isLong) {
    const maintenanceMarginRate = 0.004; // 0.4%
    if (isLong) {
      return entryPrice * (1 - 1 / leverage + maintenanceMarginRate);
    } else {
      return entryPrice * (1 + 1 / leverage - maintenanceMarginRate);
    }
  }

  /**
   * Update TP/SL for a position
   */
  async updatePositionTPSL(positionId, updates) {
    try {
      await paperTradeService.updatePositionTPSL(positionId, updates);

      // Trigger callback to refresh lines
      if (this.onUpdateCallback) {
        const lines = await this.getOrderLinesForSymbol(this.currentSymbol);
        this.onUpdateCallback(lines);
      }

      return true;
    } catch (error) {
      console.error('[OrderLinesService] Error updating TP/SL:', error);
      return false;
    }
  }

  /**
   * Update pending order price
   */
  async updatePendingOrderPrice(orderId, newPrice) {
    try {
      await paperTradeService.updatePendingOrder(orderId, {
        limit_price: newPrice
      });

      // Trigger callback to refresh lines
      if (this.onUpdateCallback) {
        const lines = await this.getOrderLinesForSymbol(this.currentSymbol);
        this.onUpdateCallback(lines);
      }

      return true;
    } catch (error) {
      console.error('[OrderLinesService] Error updating pending order:', error);
      return false;
    }
  }

  /**
   * Format price for display (Vietnamese format)
   */
  formatPrice(price) {
    if (!price) return '-';
    if (price >= 1000) return price.toLocaleString('vi-VN', { maximumFractionDigits: 2 });
    if (price >= 1) return price.toFixed(4).replace('.', ',');
    return price.toFixed(8).replace('.', ',');
  }

  /**
   * Format PnL for display (Vietnamese format: dot for thousands, comma for decimals)
   */
  formatPnL(pnl, showSign = true) {
    if (!pnl && pnl !== 0) return '-';
    const sign = pnl >= 0 ? '+' : '';
    // Vietnamese format: use toLocaleString for thousand separators
    const formatted = Math.abs(pnl).toLocaleString('vi-VN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
    return showSign ? `${sign}$${formatted}` : `$${formatted}`;
  }

  /**
   * Format percent for display (Vietnamese format: comma for decimals)
   */
  formatPercent(percent, showSign = true) {
    if (!percent && percent !== 0) return '-';
    const sign = percent >= 0 ? '+' : '';
    const formatted = Math.abs(percent).toFixed(2).replace('.', ',');
    return showSign ? `${sign}${formatted}%` : `${formatted}%`;
  }
}

export const orderLinesService = new OrderLinesService();
export default orderLinesService;
