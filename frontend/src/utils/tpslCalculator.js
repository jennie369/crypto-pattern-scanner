/**
 * TP/SL Calculator Utilities
 * Binance-style automatic calculation
 */

export const TPSLCalculator = {

  /**
   * Calculate Take Profit price from percentage
   */
  calculateTPFromPercentage(entryPrice, percentage, side = 'buy') {
    const price = parseFloat(entryPrice);
    const pct = parseFloat(percentage);

    if (!price || !pct) return null;

    if (side === 'buy') {
      // Long position: TP above entry
      return price * (1 + pct / 100);
    } else {
      // Short position: TP below entry
      return price * (1 - pct / 100);
    }
  },

  /**
   * Calculate Stop Loss price from percentage
   */
  calculateSLFromPercentage(entryPrice, percentage, side = 'buy') {
    const price = parseFloat(entryPrice);
    const pct = parseFloat(percentage);

    if (!price || !pct) return null;

    if (side === 'buy') {
      // Long position: SL below entry
      return price * (1 - Math.abs(pct) / 100);
    } else {
      // Short position: SL above entry
      return price * (1 + Math.abs(pct) / 100);
    }
  },

  /**
   * Calculate TP percentage from price
   */
  calculateTPPercentage(entryPrice, tpPrice, side = 'buy') {
    const entry = parseFloat(entryPrice);
    const tp = parseFloat(tpPrice);

    if (!entry || !tp) return null;

    if (side === 'buy') {
      return ((tp - entry) / entry) * 100;
    } else {
      return ((entry - tp) / entry) * 100;
    }
  },

  /**
   * Calculate SL percentage from price
   */
  calculateSLPercentage(entryPrice, slPrice, side = 'buy') {
    const entry = parseFloat(entryPrice);
    const sl = parseFloat(slPrice);

    if (!entry || !sl) return null;

    if (side === 'buy') {
      return -((entry - sl) / entry) * 100;
    } else {
      return -((sl - entry) / entry) * 100;
    }
  },

  /**
   * Calculate PnL if TP hits
   */
  calculateTPPnL(entryPrice, tpPrice, quantity, side = 'buy') {
    const entry = parseFloat(entryPrice);
    const tp = parseFloat(tpPrice);
    const qty = parseFloat(quantity);

    if (!entry || !tp || !qty) return null;

    if (side === 'buy') {
      return (tp - entry) * qty;
    } else {
      return (entry - tp) * qty;
    }
  },

  /**
   * Calculate PnL if SL hits
   */
  calculateSLPnL(entryPrice, slPrice, quantity, side = 'buy') {
    const entry = parseFloat(entryPrice);
    const sl = parseFloat(slPrice);
    const qty = parseFloat(quantity);

    if (!entry || !sl || !qty) return null;

    if (side === 'buy') {
      return (sl - entry) * qty;
    } else {
      return (entry - sl) * qty;
    }
  },

  /**
   * Calculate Risk:Reward ratio
   */
  calculateRiskReward(tpPnL, slPnL) {
    const tp = parseFloat(tpPnL);
    const sl = parseFloat(slPnL);

    if (!tp || !sl || sl === 0) return null;

    return Math.abs(tp / sl);
  },

  /**
   * Calculate current unrealized PnL
   */
  calculateCurrentPnL(entryPrice, currentPrice, quantity, side = 'buy') {
    const entry = parseFloat(entryPrice);
    const current = parseFloat(currentPrice);
    const qty = parseFloat(quantity);

    if (!entry || !current || !qty) return null;

    if (side === 'buy') {
      return (current - entry) * qty;
    } else {
      return (entry - current) * qty;
    }
  },

  /**
   * Format price to 2 decimals
   */
  formatPrice(price) {
    return parseFloat(price).toFixed(2);
  },

  /**
   * Format PnL with sign
   */
  formatPnL(pnl) {
    const value = parseFloat(pnl);
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(2)}`;
  },

  /**
   * Format percentage with sign
   */
  formatPercentage(percentage) {
    const value = parseFloat(percentage);
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(2)}%`;
  }
};
