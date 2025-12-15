/**
 * GEM Mobile - Formatters Utility
 * Centralized number formatting functions
 * Issue #19: Fix confidence decimals
 */

/**
 * Format confidence percentage
 * @param {number} value - Raw confidence value (0-100)
 * @param {number} decimals - Number of decimal places (default: 1)
 * @returns {string} Formatted percentage string
 */
export const formatConfidence = (value, decimals = 1) => {
  if (typeof value !== 'number' || isNaN(value)) return '0%';
  return `${value.toFixed(decimals)}%`;
};

/**
 * Format percent - generic percentage formatter
 * 82.87204730831974 → "82.9%"
 */
export const formatPercent = (value, decimals = 1) => {
  if (value === null || value === undefined || isNaN(value)) return '0%';
  return `${parseFloat(value).toFixed(decimals)}%`;
};

/**
 * Format decimal - generic decimal formatter
 */
export const formatDecimal = (value, decimals = 2) => {
  if (value === null || value === undefined || isNaN(value)) return '0';
  return parseFloat(value).toFixed(decimals);
};

/**
 * Add thousand separators to a number string
 * @param {string} numStr - Number string to format
 * @returns {string} Number with thousand separators
 */
const addThousandSeparators = (numStr) => {
  const parts = numStr.split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return parts.join('.');
};

/**
 * Format price với dynamic precision based on value
 * Includes thousand separators for large numbers
 * Standardized decimal places:
 * - >= 1000: 2 decimals (e.g., 90,363.84)
 * - >= 1: 4 decimals (e.g., 13.5752)
 * - >= 0.0001: 6 decimals (e.g., 0.001234)
 * - < 0.0001: 8 decimals (e.g., 0.00001234)
 *
 * @param {number} price - Raw price value
 * @param {boolean} withSeparators - Whether to include thousand separators (default: true)
 * @returns {string} Formatted price string
 */
export const formatPrice = (price, withSeparators = true) => {
  if (price === null || price === undefined || typeof price !== 'number' || isNaN(price)) {
    return '0';
  }

  let formatted;
  if (price >= 1000) {
    formatted = price.toFixed(2);
  } else if (price >= 1) {
    formatted = price.toFixed(4);
  } else if (price >= 0.0001) {
    formatted = price.toFixed(6);
  } else if (price > 0) {
    formatted = price.toFixed(8);
  } else {
    return '0';
  }

  return withSeparators ? addThousandSeparators(formatted) : formatted;
};

/**
 * Format currency amount (always with thousand separators)
 * For amounts like $100.00, $9,040.00
 * @param {number} amount - Amount value
 * @param {number} decimals - Number of decimal places (default: 2)
 * @returns {string} Formatted amount string
 */
export const formatCurrency = (amount, decimals = 2) => {
  if (amount === null || amount === undefined || typeof amount !== 'number' || isNaN(amount)) {
    return '0.00';
  }
  return addThousandSeparators(amount.toFixed(decimals));
};

/**
 * Format price with currency symbol
 * @param {number} price - Raw price value
 * @param {string} currency - Currency symbol (default: '$')
 * @returns {string} Formatted price with currency
 */
export const formatPriceWithCurrency = (price, currency = '$') => {
  return `${currency}${formatPrice(price)}`;
};

/**
 * Format percentage change
 * @param {number} value - Percentage change value
 * @returns {string} Formatted percentage with sign
 */
export const formatPercentChange = (value) => {
  if (typeof value !== 'number' || isNaN(value)) return '0%';
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
};

/**
 * Format large numbers with suffixes (K, M, B)
 * @param {number} num - Number to format
 * @returns {string} Formatted number string
 */
export const formatLargeNumber = (num) => {
  if (typeof num !== 'number' || isNaN(num)) return '0';

  if (num >= 1e9) {
    return (num / 1e9).toFixed(2) + 'B';
  } else if (num >= 1e6) {
    return (num / 1e6).toFixed(2) + 'M';
  } else if (num >= 1e3) {
    return (num / 1e3).toFixed(2) + 'K';
  }
  return num.toFixed(2);
};

/**
 * Format volume
 * @param {number} volume - Volume value
 * @returns {string} Formatted volume string
 */
export const formatVolume = (volume) => {
  return formatLargeNumber(volume);
};

/**
 * Format market cap
 * @param {number} marketCap - Market cap value
 * @returns {string} Formatted market cap string
 */
export const formatMarketCap = (marketCap) => {
  return '$' + formatLargeNumber(marketCap);
};

/**
 * Format Risk:Reward ratio
 * @param {number} entry - Entry price
 * @param {number} stopLoss - Stop loss price
 * @param {number} takeProfit - Take profit price
 * @returns {string} Formatted R:R string
 */
export const formatRiskReward = (entry, stopLoss, takeProfit) => {
  if (!entry || !stopLoss || !takeProfit) return '0:0';

  const risk = Math.abs(entry - stopLoss);
  const reward = Math.abs(takeProfit - entry);

  if (risk === 0) return '0:∞';

  const rr = reward / risk;
  return `1:${rr.toFixed(2)}`;
};

/**
 * Calculate Risk:Reward ratio as number
 * @param {object} pattern - Pattern with entry, stopLoss, target/takeProfit
 * @returns {number} R:R ratio
 */
export const calculateRR = (pattern) => {
  // FIXED: Support ALL takeProfit field names: target, takeProfit1, takeProfit, targets[]
  const tp = pattern?.target || pattern?.takeProfit1 || pattern?.takeProfit || pattern?.targets?.[0];
  if (!pattern?.entry || !pattern?.stopLoss || !tp) return 0;

  const { entry, stopLoss } = pattern;
  const risk = Math.abs(entry - stopLoss);
  const reward = Math.abs(tp - entry);

  if (risk === 0) return 0;
  return reward / risk;
};

/**
 * Format timestamp to locale string
 * @param {string|number|Date} timestamp - Timestamp to format
 * @returns {string} Formatted date string
 */
export const formatTimestamp = (timestamp) => {
  if (!timestamp) return '';

  const date = new Date(timestamp);
  return date.toLocaleString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Format relative time (e.g., "2 giờ trước")
 * @param {string|number|Date} timestamp - Timestamp to format
 * @returns {string} Relative time string
 */
export const formatRelativeTime = (timestamp) => {
  if (!timestamp) return '';

  const now = new Date();
  const date = new Date(timestamp);
  const diffMs = now - date;
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return 'Vừa xong';
  if (diffMins < 60) return `${diffMins} phút trước`;
  if (diffHours < 24) return `${diffHours} giờ trước`;
  if (diffDays < 7) return `${diffDays} ngày trước`;

  return formatTimestamp(timestamp);
};

export default {
  formatConfidence,
  formatPercent,
  formatDecimal,
  formatPrice,
  formatCurrency,
  formatPriceWithCurrency,
  formatPercentChange,
  formatLargeNumber,
  formatVolume,
  formatMarketCap,
  formatRiskReward,
  calculateRR,
  formatTimestamp,
  formatRelativeTime,
};
