/**
 * GEM Scanner - Trading Calculations Service
 * Formulas for margin, fee, liquidation price, PnL, ROE
 * Matches Binance Futures calculation methods
 */

import {
  FEE_RATES,
  MARGIN_RATES,
  getMaintenanceMarginRate,
} from '../constants/tradingConstants';

// ═══════════════════════════════════════════════════════════
// POSITION VALUE
// ═══════════════════════════════════════════════════════════

/**
 * Calculate position value in USDT
 * @param {number} quantity - Amount of base asset
 * @param {number} price - Entry price
 * @returns {number} Position value in USDT
 */
export const calculatePositionValue = (quantity, price) => {
  if (!quantity || !price) return 0;
  return quantity * price;
};

// ═══════════════════════════════════════════════════════════
// INITIAL MARGIN
// ═══════════════════════════════════════════════════════════

/**
 * Calculate initial margin required
 * Formula: Initial Margin = Position Value / Leverage
 * @param {number} positionValue - Position value in USDT
 * @param {number} leverage - Leverage multiplier (1-125)
 * @returns {number} Initial margin required in USDT
 */
export const calculateInitialMargin = (positionValue, leverage) => {
  if (!positionValue || !leverage || leverage < 1) return 0;
  return positionValue / leverage;
};

/**
 * Calculate initial margin from quantity and price
 * @param {number} quantity - Amount of base asset
 * @param {number} price - Entry price
 * @param {number} leverage - Leverage multiplier
 * @returns {number} Initial margin required in USDT
 */
export const calculateInitialMarginFromQuantity = (quantity, price, leverage) => {
  const positionValue = calculatePositionValue(quantity, price);
  return calculateInitialMargin(positionValue, leverage);
};

// ═══════════════════════════════════════════════════════════
// MAINTENANCE MARGIN
// ═══════════════════════════════════════════════════════════

/**
 * Calculate maintenance margin
 * Formula: Maintenance Margin = Position Value * MMR
 * @param {number} positionValue - Position value in USDT
 * @returns {number} Maintenance margin in USDT
 */
export const calculateMaintenanceMargin = (positionValue) => {
  if (!positionValue) return 0;
  const mmr = getMaintenanceMarginRate(positionValue);
  return positionValue * mmr;
};

/**
 * Calculate margin ratio (how close to liquidation)
 * Formula: Margin Ratio = Maintenance Margin / (Margin Balance + Unrealized PnL)
 * @param {number} maintenanceMargin - Maintenance margin required
 * @param {number} marginBalance - Current margin balance
 * @param {number} unrealizedPnL - Current unrealized PnL
 * @returns {number} Margin ratio as percentage (0-100+)
 */
export const calculateMarginRatio = (maintenanceMargin, marginBalance, unrealizedPnL = 0) => {
  const effectiveBalance = marginBalance + unrealizedPnL;
  if (effectiveBalance <= 0) return 100;
  return (maintenanceMargin / effectiveBalance) * 100;
};

// ═══════════════════════════════════════════════════════════
// LIQUIDATION PRICE
// ═══════════════════════════════════════════════════════════

/**
 * Calculate liquidation price for Isolated margin
 *
 * For LONG:
 * Liq Price = Entry * (1 - 1/Leverage + MMR)
 * Simplified: Liq Price = Entry * (Leverage - 1 + MMR*Leverage) / Leverage
 *
 * For SHORT:
 * Liq Price = Entry * (1 + 1/Leverage - MMR)
 * Simplified: Liq Price = Entry * (Leverage + 1 - MMR*Leverage) / Leverage
 *
 * @param {number} entryPrice - Entry price
 * @param {number} leverage - Leverage multiplier
 * @param {string} direction - 'LONG' or 'SHORT'
 * @param {number} positionValue - Optional position value for MMR tier
 * @returns {number} Liquidation price
 */
export const calculateLiquidationPrice = (entryPrice, leverage, direction, positionValue = 50000) => {
  if (!entryPrice || !leverage || leverage < 1) return 0;

  const mmr = getMaintenanceMarginRate(positionValue);
  const leverageInverse = 1 / leverage;

  if (direction === 'LONG') {
    // Long: lose when price goes down
    // Liq = Entry * (1 - (1/Lev) + MMR)
    const liqPrice = entryPrice * (1 - leverageInverse + mmr);
    return Math.max(0, liqPrice);
  } else {
    // Short: lose when price goes up
    // Liq = Entry * (1 + (1/Lev) - MMR)
    const liqPrice = entryPrice * (1 + leverageInverse - mmr);
    return liqPrice;
  }
};

/**
 * Calculate distance to liquidation as percentage
 * @param {number} currentPrice - Current market price
 * @param {number} liquidationPrice - Calculated liquidation price
 * @param {string} direction - 'LONG' or 'SHORT'
 * @returns {number} Distance to liquidation as percentage
 */
export const calculateDistanceToLiquidation = (currentPrice, liquidationPrice, direction) => {
  if (!currentPrice || !liquidationPrice) return 100;

  const distance = Math.abs(currentPrice - liquidationPrice);
  const percentage = (distance / currentPrice) * 100;

  return percentage;
};

// ═══════════════════════════════════════════════════════════
// TRADING FEE
// ═══════════════════════════════════════════════════════════

/**
 * Calculate trading fee
 * @param {number} positionValue - Position value in USDT
 * @param {boolean} isMaker - True for maker order, false for taker
 * @param {boolean} useBnbDiscount - True if using BNB for fee discount
 * @returns {number} Trading fee in USDT
 */
export const calculateTradingFee = (positionValue, isMaker = false, useBnbDiscount = false) => {
  if (!positionValue) return 0;

  let feeRate;
  if (useBnbDiscount) {
    feeRate = isMaker ? FEE_RATES.makerBnb : FEE_RATES.takerBnb;
  } else {
    feeRate = isMaker ? FEE_RATES.maker : FEE_RATES.taker;
  }

  return positionValue * feeRate;
};

/**
 * Calculate total fees for opening and closing position
 * @param {number} positionValue - Position value in USDT
 * @param {boolean} openIsMaker - True if open order is maker
 * @param {boolean} closeIsMaker - True if close order is maker
 * @returns {number} Total fees for round trip
 */
export const calculateRoundTripFee = (positionValue, openIsMaker = false, closeIsMaker = false) => {
  const openFee = calculateTradingFee(positionValue, openIsMaker);
  const closeFee = calculateTradingFee(positionValue, closeIsMaker);
  return openFee + closeFee;
};

// ═══════════════════════════════════════════════════════════
// MAX POSITION SIZE
// ═══════════════════════════════════════════════════════════

/**
 * Calculate maximum position size based on available balance
 * @param {number} balance - Available balance in USDT
 * @param {number} leverage - Leverage multiplier
 * @param {number} price - Current price
 * @returns {Object} { maxPositionValue, maxQuantity }
 */
export const calculateMaxPosition = (balance, leverage, price) => {
  if (!balance || !leverage || !price) {
    return { maxPositionValue: 0, maxQuantity: 0 };
  }

  // Max position = Balance * Leverage
  const maxPositionValue = balance * leverage;
  const maxQuantity = maxPositionValue / price;

  return {
    maxPositionValue,
    maxQuantity,
  };
};

/**
 * Calculate position size for a given risk percentage
 * @param {number} balance - Available balance
 * @param {number} riskPercent - Percentage of balance to risk (e.g., 2%)
 * @param {number} leverage - Leverage multiplier
 * @returns {number} Position value in USDT
 */
export const calculatePositionFromRisk = (balance, riskPercent, leverage) => {
  if (!balance || !riskPercent) return 0;
  const riskAmount = balance * (riskPercent / 100);
  return riskAmount * leverage;
};

// ═══════════════════════════════════════════════════════════
// UNREALIZED PNL
// ═══════════════════════════════════════════════════════════

/**
 * Calculate unrealized PnL
 * @param {number} entryPrice - Entry price
 * @param {number} currentPrice - Current market price
 * @param {number} quantity - Position quantity
 * @param {string} direction - 'LONG' or 'SHORT'
 * @returns {number} Unrealized PnL in USDT
 */
export const calculateUnrealizedPnL = (entryPrice, currentPrice, quantity, direction) => {
  if (!entryPrice || !currentPrice || !quantity) return 0;

  const priceDiff = currentPrice - entryPrice;

  if (direction === 'LONG') {
    return priceDiff * quantity;
  } else {
    return -priceDiff * quantity;
  }
};

/**
 * Calculate unrealized PnL percentage
 * @param {number} pnl - Unrealized PnL in USDT
 * @param {number} positionValue - Original position value
 * @returns {number} PnL as percentage
 */
export const calculateUnrealizedPnLPercent = (pnl, positionValue) => {
  if (!positionValue) return 0;
  return (pnl / positionValue) * 100;
};

// ═══════════════════════════════════════════════════════════
// ROE (Return On Equity)
// ═══════════════════════════════════════════════════════════

/**
 * Calculate ROE - Return on Equity (margin)
 * Formula: ROE = (PnL / Initial Margin) * 100
 * @param {number} pnl - Unrealized or realized PnL
 * @param {number} initialMargin - Initial margin used
 * @returns {number} ROE as percentage
 */
export const calculateROE = (pnl, initialMargin) => {
  if (!initialMargin) return 0;
  return (pnl / initialMargin) * 100;
};

/**
 * Calculate ROE with leverage
 * Formula: ROE = PnL% * Leverage
 * @param {number} pnlPercent - PnL as percentage of position
 * @param {number} leverage - Leverage multiplier
 * @returns {number} ROE as percentage
 */
export const calculateROEWithLeverage = (pnlPercent, leverage) => {
  return pnlPercent * leverage;
};

// ═══════════════════════════════════════════════════════════
// TP/SL CALCULATIONS
// ═══════════════════════════════════════════════════════════

/**
 * Calculate TP price from percentage
 * @param {number} entryPrice - Entry price
 * @param {number} tpPercent - Take profit percentage
 * @param {string} direction - 'LONG' or 'SHORT'
 * @returns {number} Take profit price
 */
export const calculateTPPrice = (entryPrice, tpPercent, direction) => {
  if (!entryPrice || !tpPercent) return null;

  if (direction === 'LONG') {
    return entryPrice * (1 + tpPercent / 100);
  } else {
    return entryPrice * (1 - tpPercent / 100);
  }
};

/**
 * Calculate SL price from percentage
 * @param {number} entryPrice - Entry price
 * @param {number} slPercent - Stop loss percentage
 * @param {string} direction - 'LONG' or 'SHORT'
 * @returns {number} Stop loss price
 */
export const calculateSLPrice = (entryPrice, slPercent, direction) => {
  if (!entryPrice || !slPercent) return null;

  if (direction === 'LONG') {
    return entryPrice * (1 - slPercent / 100);
  } else {
    return entryPrice * (1 + slPercent / 100);
  }
};

/**
 * Calculate profit/loss at TP/SL
 * @param {number} entryPrice - Entry price
 * @param {number} targetPrice - TP or SL price
 * @param {number} quantity - Position quantity
 * @param {string} direction - 'LONG' or 'SHORT'
 * @returns {number} Profit or loss amount
 */
export const calculatePnLAtPrice = (entryPrice, targetPrice, quantity, direction) => {
  return calculateUnrealizedPnL(entryPrice, targetPrice, quantity, direction);
};

/**
 * Calculate Risk:Reward ratio
 * @param {number} entryPrice - Entry price
 * @param {number} tpPrice - Take profit price
 * @param {number} slPrice - Stop loss price
 * @param {string} direction - 'LONG' or 'SHORT'
 * @returns {Object} { risk, reward, ratio, ratioString }
 */
export const calculateRiskReward = (entryPrice, tpPrice, slPrice, direction) => {
  if (!entryPrice || !tpPrice || !slPrice) {
    return { risk: 0, reward: 0, ratio: 0, ratioString: 'N/A' };
  }

  let risk, reward;

  if (direction === 'LONG') {
    reward = tpPrice - entryPrice;
    risk = entryPrice - slPrice;
  } else {
    reward = entryPrice - tpPrice;
    risk = slPrice - entryPrice;
  }

  if (risk <= 0) {
    return { risk: 0, reward: 0, ratio: 0, ratioString: 'Invalid' };
  }

  const ratio = reward / risk;
  // Use Vietnamese decimal format (comma)
  const ratioFormatted = ratio.toFixed(1).replace('.', ',');
  const ratioString = `1:${ratioFormatted}`;

  return { risk, reward, ratio, ratioString };
};

// ═══════════════════════════════════════════════════════════
// QUANTITY CALCULATIONS
// ═══════════════════════════════════════════════════════════

/**
 * Calculate quantity from USDT amount
 * @param {number} usdtAmount - Amount in USDT
 * @param {number} price - Current price
 * @returns {number} Quantity of base asset
 */
export const calculateQuantityFromUSDT = (usdtAmount, price) => {
  if (!usdtAmount || !price) return 0;
  return usdtAmount / price;
};

/**
 * Calculate USDT amount from quantity
 * @param {number} quantity - Quantity of base asset
 * @param {number} price - Current price
 * @returns {number} Amount in USDT
 */
export const calculateUSDTFromQuantity = (quantity, price) => {
  if (!quantity || !price) return 0;
  return quantity * price;
};

/**
 * Calculate quantity for percentage of balance
 * @param {number} balance - Available balance
 * @param {number} percent - Percentage (0-100)
 * @param {number} leverage - Leverage multiplier
 * @param {number} price - Current price
 * @returns {Object} { quantity, positionValue, margin }
 */
export const calculateQuantityFromPercent = (balance, percent, leverage, price) => {
  if (!balance || !percent || !leverage || !price) {
    return { quantity: 0, positionValue: 0, margin: 0 };
  }

  const margin = balance * (percent / 100);
  const positionValue = margin * leverage;
  const quantity = positionValue / price;

  return {
    quantity,
    positionValue,
    margin,
  };
};

// ═══════════════════════════════════════════════════════════
// COMPLETE ORDER CALCULATIONS
// ═══════════════════════════════════════════════════════════

/**
 * Calculate all order details at once
 * @param {Object} params - Order parameters
 * @returns {Object} Complete calculation results
 */
export const calculateOrderDetails = ({
  entryPrice,
  quantity,
  leverage,
  direction,
  marginMode = 'isolated',
  isMaker = true,
  tpPercent = null,
  slPercent = null,
}) => {
  // Basic calculations
  const positionValue = calculatePositionValue(quantity, entryPrice);
  const initialMargin = calculateInitialMargin(positionValue, leverage);
  const maintenanceMargin = calculateMaintenanceMargin(positionValue);
  const tradingFee = calculateTradingFee(positionValue, isMaker);
  const roundTripFee = calculateRoundTripFee(positionValue, isMaker, false);

  // Liquidation
  const liquidationPrice = calculateLiquidationPrice(entryPrice, leverage, direction, positionValue);

  // TP/SL
  const tpPrice = tpPercent ? calculateTPPrice(entryPrice, tpPercent, direction) : null;
  const slPrice = slPercent ? calculateSLPrice(entryPrice, slPercent, direction) : null;

  // PnL at TP/SL
  const tpPnL = tpPrice ? calculatePnLAtPrice(entryPrice, tpPrice, quantity, direction) : null;
  const slPnL = slPrice ? calculatePnLAtPrice(entryPrice, slPrice, quantity, direction) : null;

  // ROE at TP/SL
  const tpROE = tpPnL ? calculateROE(tpPnL, initialMargin) : null;
  const slROE = slPnL ? calculateROE(slPnL, initialMargin) : null;

  // Risk:Reward
  const riskReward = tpPrice && slPrice
    ? calculateRiskReward(entryPrice, tpPrice, slPrice, direction)
    : null;

  return {
    // Position
    positionValue,
    quantity,
    entryPrice,
    leverage,
    direction,
    marginMode,

    // Margin
    initialMargin,
    maintenanceMargin,

    // Fees
    tradingFee,
    roundTripFee,

    // Liquidation
    liquidationPrice,

    // TP/SL
    takeProfit: {
      price: tpPrice,
      pnl: tpPnL,
      roe: tpROE,
    },
    stopLoss: {
      price: slPrice,
      pnl: slPnL,
      roe: slROE,
    },

    // Risk:Reward
    riskReward,
  };
};

// ═══════════════════════════════════════════════════════════
// FORMAT HELPERS (Vietnamese locale)
// - Decimal separator: comma (,)
// - Thousands separator: dot (.)
// ═══════════════════════════════════════════════════════════

/**
 * Format number with Vietnamese locale (comma as decimal, dot as thousands)
 * @param {number} value - Number to format
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted number
 */
export const formatNumber = (value, decimals = 2) => {
  if (value === null || value === undefined || isNaN(value)) return '-';
  const fixed = parseFloat(value).toFixed(decimals);
  const parts = fixed.split('.');
  // Add dots as thousand separators (Vietnamese style)
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  // Join with comma as decimal separator (Vietnamese style)
  return parts.length > 1 ? parts.join(',') : parts[0];
};

/**
 * Format price based on value magnitude (Vietnamese locale)
 * @param {number} price - Price to format
 * @returns {string} Formatted price
 */
export const formatPrice = (price) => {
  if (price === null || price === undefined) return '-';

  if (price >= 1000) return formatNumber(price, 2);
  if (price >= 1) return formatNumber(price, 4);
  if (price >= 0.01) return formatNumber(price, 6);
  return formatNumber(price, 8);
};

/**
 * Format USDT amount (Vietnamese locale)
 * @param {number} amount - Amount in USDT
 * @returns {string} Formatted amount with $ symbol
 */
export const formatUSDT = (amount) => {
  if (amount === null || amount === undefined) return '-';
  return '$' + formatNumber(amount, 2);
};

/**
 * Format percentage (Vietnamese locale)
 * @param {number} percent - Percentage value
 * @param {boolean} showSign - Show + for positive
 * @returns {string} Formatted percentage
 */
export const formatPercent = (percent, showSign = true) => {
  if (percent === null || percent === undefined) return '-';
  const sign = showSign && percent > 0 ? '+' : '';
  return sign + formatNumber(percent, 2) + '%';
};

// ═══════════════════════════════════════════════════════════
// DEFAULT EXPORT
// ═══════════════════════════════════════════════════════════

const tradingCalculations = {
  // Position
  calculatePositionValue,

  // Margin
  calculateInitialMargin,
  calculateInitialMarginFromQuantity,
  calculateMaintenanceMargin,
  calculateMarginRatio,

  // Liquidation
  calculateLiquidationPrice,
  calculateDistanceToLiquidation,

  // Fee
  calculateTradingFee,
  calculateRoundTripFee,

  // Max position
  calculateMaxPosition,
  calculatePositionFromRisk,

  // PnL
  calculateUnrealizedPnL,
  calculateUnrealizedPnLPercent,
  calculateROE,
  calculateROEWithLeverage,

  // TP/SL
  calculateTPPrice,
  calculateSLPrice,
  calculatePnLAtPrice,
  calculateRiskReward,

  // Quantity
  calculateQuantityFromUSDT,
  calculateUSDTFromQuantity,
  calculateQuantityFromPercent,

  // Complete
  calculateOrderDetails,

  // Format
  formatNumber,
  formatPrice,
  formatUSDT,
  formatPercent,
};

export default tradingCalculations;
