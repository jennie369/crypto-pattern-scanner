/**
 * Gemral - Currency Service
 * Handles currency formatting and conversion between VND and USD
 */

// Default exchange rate (can be updated from API)
let USD_TO_VND_RATE = 24500;

/**
 * Currency Service
 */
export const currencyService = {
  /**
   * Update exchange rate (call this from API if needed)
   * @param {number} rate - New USD to VND rate
   */
  setExchangeRate(rate) {
    USD_TO_VND_RATE = rate;
  },

  /**
   * Get current exchange rate
   * @returns {number} Current USD to VND rate
   */
  getExchangeRate() {
    return USD_TO_VND_RATE;
  },

  /**
   * Format price based on currency
   * @param {number} amount - Amount in VND
   * @param {string} currency - 'VND' or 'USD'
   * @returns {string} Formatted price string
   */
  formatPrice(amount, currency = 'VND') {
    if (amount === null || amount === undefined) return '';

    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

    if (isNaN(numAmount)) return '';

    if (currency === 'USD') {
      const usdAmount = numAmount / USD_TO_VND_RATE;
      return `$${usdAmount.toFixed(2)}`;
    }

    // VND format
    return `${numAmount.toLocaleString('vi-VN')}₫`;
  },

  /**
   * Format price with compact notation for large numbers
   * @param {number} amount - Amount in VND
   * @param {string} currency - 'VND' or 'USD'
   * @returns {string} Compact formatted price
   */
  formatPriceCompact(amount, currency = 'VND') {
    if (amount === null || amount === undefined) return '';

    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

    if (currency === 'USD') {
      const usdAmount = numAmount / USD_TO_VND_RATE;
      if (usdAmount >= 1000000) {
        return `$${(usdAmount / 1000000).toFixed(1)}M`;
      }
      if (usdAmount >= 1000) {
        return `$${(usdAmount / 1000).toFixed(1)}K`;
      }
      return `$${usdAmount.toFixed(2)}`;
    }

    // VND compact format
    if (numAmount >= 1000000000) {
      return `${(numAmount / 1000000000).toFixed(1)} tỷ`;
    }
    if (numAmount >= 1000000) {
      return `${(numAmount / 1000000).toFixed(1)} tr`;
    }
    if (numAmount >= 1000) {
      return `${(numAmount / 1000).toFixed(0)}K₫`;
    }
    return `${numAmount.toLocaleString('vi-VN')}₫`;
  },

  /**
   * Convert VND to USD
   * @param {number} vndAmount - Amount in VND
   * @returns {number} Amount in USD
   */
  toUSD(vndAmount) {
    return vndAmount / USD_TO_VND_RATE;
  },

  /**
   * Convert USD to VND
   * @param {number} usdAmount - Amount in USD
   * @returns {number} Amount in VND
   */
  toVND(usdAmount) {
    return usdAmount * USD_TO_VND_RATE;
  },

  /**
   * Get currency symbol
   * @param {string} currency - 'VND' or 'USD'
   * @returns {string} Currency symbol
   */
  getSymbol(currency = 'VND') {
    return currency === 'USD' ? '$' : '₫';
  },

  /**
   * Parse price string to number
   * @param {string} priceString - Price string like "100,000₫" or "$4.08"
   * @returns {number} Numeric value in VND
   */
  parsePrice(priceString) {
    if (!priceString) return 0;

    const str = priceString.toString().trim();

    // Check if USD
    if (str.startsWith('$')) {
      const usdAmount = parseFloat(str.replace(/[$,]/g, ''));
      return this.toVND(usdAmount);
    }

    // VND - remove currency symbol and commas
    const vndAmount = parseFloat(str.replace(/[₫đ,.\s]/g, ''));
    return isNaN(vndAmount) ? 0 : vndAmount;
  },

  /**
   * Format price range
   * @param {number} min - Minimum price in VND
   * @param {number} max - Maximum price in VND
   * @param {string} currency - 'VND' or 'USD'
   * @returns {string} Formatted price range
   */
  formatPriceRange(min, max, currency = 'VND') {
    const minFormatted = this.formatPrice(min, currency);
    const maxFormatted = this.formatPrice(max, currency);

    if (min === max) return minFormatted;

    return `${minFormatted} - ${maxFormatted}`;
  },

  /**
   * Format discount percentage
   * @param {number} originalPrice - Original price
   * @param {number} salePrice - Sale price
   * @returns {string} Discount percentage (e.g., "-20%")
   */
  formatDiscount(originalPrice, salePrice) {
    if (!originalPrice || !salePrice || salePrice >= originalPrice) return '';

    const discount = Math.round(((originalPrice - salePrice) / originalPrice) * 100);
    return `-${discount}%`;
  },
};

export default currencyService;
