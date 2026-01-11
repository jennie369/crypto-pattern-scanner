/**
 * Number Formatting Utilities
 * Format large numbers for display
 * Phase 4: View Count & Algorithm (30/12/2024)
 */

/**
 * Format number with K, M, B suffixes
 * @param {number} num - Number to format
 * @param {number} digits - Decimal digits (default 1)
 * @returns {string} Formatted string
 *
 * Examples:
 * - 999 → "999"
 * - 1000 → "1K"
 * - 1234 → "1.2K"
 * - 12345 → "12.3K"
 * - 1234567 → "1.2M"
 */
export const formatNumber = (num, digits = 1) => {
  if (num === null || num === undefined) return '0';

  const number = typeof num === 'string' ? parseFloat(num) : num;

  if (isNaN(number)) return '0';
  if (number < 1000) return Math.floor(number).toString();

  const units = [
    { value: 1e9, suffix: 'B' },
    { value: 1e6, suffix: 'M' },
    { value: 1e3, suffix: 'K' },
  ];

  for (const unit of units) {
    if (number >= unit.value) {
      const formatted = (number / unit.value).toFixed(digits);
      // Remove trailing zeros and decimal point if not needed
      const cleaned = formatted.replace(/\.0+$/, '').replace(/(\.\d*[1-9])0+$/, '$1');
      return cleaned + unit.suffix;
    }
  }

  return Math.floor(number).toString();
};

/**
 * Format number for Vietnamese locale
 * @param {number} num - Number to format
 * @returns {string} Formatted with dots as thousand separators
 */
export const formatNumberVN = (num) => {
  if (num === null || num === undefined) return '0';
  const number = typeof num === 'string' ? parseFloat(num) : num;
  if (isNaN(number)) return '0';
  return Math.floor(number).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

/**
 * Format number with compact notation
 * Shorter version for very tight spaces
 * @param {number} num - Number to format
 * @returns {string} Formatted string
 */
export const formatCompact = (num) => {
  if (num === null || num === undefined) return '0';
  const number = typeof num === 'string' ? parseFloat(num) : num;
  if (isNaN(number)) return '0';

  if (number >= 1e9) return Math.floor(number / 1e9) + 'B';
  if (number >= 1e6) return Math.floor(number / 1e6) + 'M';
  if (number >= 1e3) return Math.floor(number / 1e3) + 'K';
  return Math.floor(number).toString();
};

export default formatNumber;
