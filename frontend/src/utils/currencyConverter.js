/**
 * Currency Converter Utility
 * Handles currency conversion and formatting
 */

// Exchange rates (base: USD)
// In production, these should be fetched from an API like exchangerate-api.com
export const EXCHANGE_RATES = {
  USD: 1,
  EUR: 0.92,     // 1 USD = 0.92 EUR
  VND: 24500,    // 1 USD = 24,500 VND
};

// Currency symbols
export const CURRENCY_SYMBOLS = {
  USD: '$',
  EUR: '€',
  VND: '₫',
};

// Currency names
export const CURRENCY_NAMES = {
  USD: 'US Dollar',
  EUR: 'Euro',
  VND: 'Vietnamese Dong',
};

/**
 * Format price with currency symbol and proper decimal places
 * @param {number} usdPrice - Price in USD
 * @param {string} targetCurrency - Target currency (USD, EUR, VND)
 * @returns {string} Formatted price string
 */
export function formatPrice(usdPrice, targetCurrency = 'USD') {
  console.log(`💱 formatPrice() called: ${usdPrice} USD → ${targetCurrency}`);

  if (typeof usdPrice !== 'number' || isNaN(usdPrice)) {
    console.log(`⚠️ Invalid price: ${usdPrice}`);
    return `${CURRENCY_SYMBOLS[targetCurrency]}0.00`;
  }

  // Convert to target currency
  const rate = EXCHANGE_RATES[targetCurrency] || 1;
  const convertedPrice = usdPrice * rate;
  console.log(`   Rate: ${rate}, Converted: ${convertedPrice}`);

  let result;
  // Format based on currency
  if (targetCurrency === 'VND') {
    // VND: No decimals, use comma thousands separator
    result = `${Math.round(convertedPrice).toLocaleString('vi-VN')}${CURRENCY_SYMBOLS.VND}`;
  } else if (targetCurrency === 'EUR') {
    // EUR: 2 decimals, symbol after number (European style)
    result = `${convertedPrice.toLocaleString('de-DE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}${CURRENCY_SYMBOLS.EUR}`;
  } else {
    // USD: Symbol before, 2 decimals
    result = `${CURRENCY_SYMBOLS.USD}${convertedPrice.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }

  console.log(`   Result: ${result}`);
  return result;
}

/**
 * Format price compact (for small displays)
 * @param {number} usdPrice - Price in USD
 * @param {string} targetCurrency - Target currency
 * @returns {string} Compact formatted price
 */
export function formatPriceCompact(usdPrice, targetCurrency = 'USD') {
  if (typeof usdPrice !== 'number' || isNaN(usdPrice)) {
    return `${CURRENCY_SYMBOLS[targetCurrency]}0`;
  }

  const rate = EXCHANGE_RATES[targetCurrency] || 1;
  const convertedPrice = usdPrice * rate;

  if (targetCurrency === 'VND') {
    // VND: Round to nearest thousand
    const thousands = Math.round(convertedPrice / 1000);
    return `${thousands}K${CURRENCY_SYMBOLS.VND}`;
  } else if (convertedPrice >= 1000) {
    // For large numbers, use K notation
    const k = (convertedPrice / 1000).toFixed(1);
    return `${CURRENCY_SYMBOLS[targetCurrency]}${k}K`;
  } else {
    return `${CURRENCY_SYMBOLS[targetCurrency]}${convertedPrice.toFixed(2)}`;
  }
}

/**
 * Convert price from USD to target currency (number only)
 * @param {number} usdPrice - Price in USD
 * @param {string} targetCurrency - Target currency
 * @returns {number} Converted price
 */
export function convertPrice(usdPrice, targetCurrency = 'USD') {
  if (typeof usdPrice !== 'number' || isNaN(usdPrice)) {
    return 0;
  }

  const rate = EXCHANGE_RATES[targetCurrency] || 1;
  return usdPrice * rate;
}

/**
 * Get current currency from localStorage
 * @returns {string} Current currency (USD, EUR, or VND)
 */
export function getCurrentCurrency() {
  console.log('🔍 getCurrentCurrency() called');
  try {
    const settings = localStorage.getItem('userSettings');
    console.log('   localStorage userSettings:', settings);

    if (settings) {
      const parsed = JSON.parse(settings);
      console.log('   Parsed:', parsed);
      console.log('   Currency found:', parsed.currency || 'USD');
      return parsed.currency || 'USD';
    }
  } catch (error) {
    console.error('❌ Failed to get current currency:', error);
  }

  console.log('   No settings found, defaulting to USD');
  return 'USD';
}

/**
 * Update exchange rates from API (optional, for production)
 * @returns {Promise<boolean>} Success status
 */
export async function updateExchangeRates() {
  try {
    const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
    const data = await response.json();

    if (data && data.rates) {
      EXCHANGE_RATES.EUR = data.rates.EUR;
      EXCHANGE_RATES.VND = data.rates.VND;

      console.log('Exchange rates updated:', EXCHANGE_RATES);
      return true;
    }
  } catch (error) {
    console.error('Failed to update exchange rates:', error);
  }
  return false;
}

/**
 * Format percentage change
 * @param {number} change - Percentage change
 * @returns {string} Formatted percentage
 */
export function formatPercentage(change) {
  if (typeof change !== 'number' || isNaN(change)) {
    return '0.00%';
  }

  const sign = change >= 0 ? '+' : '';
  return `${sign}${change.toFixed(2)}%`;
}

export default {
  formatPrice,
  formatPriceCompact,
  convertPrice,
  getCurrentCurrency,
  updateExchangeRates,
  formatPercentage,
  EXCHANGE_RATES,
  CURRENCY_SYMBOLS,
  CURRENCY_NAMES,
};
