/**
 * Pattern Detection API Service
 * Connects to Python backend for pattern scanning
 */

const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export class PatternAPI {
  /**
   * Scan symbols for patterns
   * @param {Array<string>} symbols - Array of symbols to scan
   * @param {string} timeframe - Timeframe (15m, 1h, 4h, 1d)
   * @returns {Promise<Array>} - Array of detected patterns
   */
  async scanPatterns(symbols, timeframe = '15m') {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    try {
      const response = await fetch(`${BACKEND_URL}/api/scan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          symbols,
          timeframe,
          patterns: [
            'Head and Shoulders',
            'Inverse Head and Shoulders',
            'Double Top',
            'Double Bottom',
            'Triple Top',
            'Triple Bottom',
            'Ascending Triangle',
            'Descending Triangle',
            'Symmetrical Triangle',
            'Rising Wedge',
            'Falling Wedge',
            'Bull Flag',
            'Bear Flag',
            'Cup and Handle',
            'Rounding Bottom'
          ]
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`Scan failed: ${response.statusText}`);
      }

      const data = await response.json();
      return data.results;
    } catch (error) {
      if (error.name === 'AbortError') {
        console.warn('Pattern scan timed out after 10s');
        return [];
      }
      console.error('Pattern scan error:', error);
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * Get pattern details
   * @param {string} symbol - Symbol to analyze
   * @param {string} patternType - Type of pattern
   * @returns {Promise<Object>} - Pattern details with chart image
   */
  async getPatternDetails(symbol, patternType) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    try {
      const response = await fetch(
        `${BACKEND_URL}/api/pattern/${symbol}/${patternType}`,
        { signal: controller.signal }
      );

      if (!response.ok) {
        throw new Error(`Failed to get pattern details: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      if (error.name === 'AbortError') {
        console.warn('Pattern details request timed out after 10s');
        return null;
      }
      console.error('Get pattern details error:', error);
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * Get pattern history
   * @param {string} symbol - Symbol to get history for
   * @param {number} limit - Number of historical patterns
   * @returns {Promise<Array>} - Historical patterns
   */
  async getPatternHistory(symbol, limit = 50) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    try {
      const response = await fetch(
        `${BACKEND_URL}/api/history/${symbol}?limit=${limit}`,
        { signal: controller.signal }
      );

      if (!response.ok) {
        throw new Error(`Failed to get history: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      if (error.name === 'AbortError') {
        console.warn('Pattern history request timed out after 10s');
        return [];
      }
      console.error('Get pattern history error:', error);
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  }
}

// Singleton instance
export const patternApi = new PatternAPI();
