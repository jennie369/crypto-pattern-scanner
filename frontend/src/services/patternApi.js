/**
 * Pattern Detection API Service
 * Connects to Python backend for pattern scanning
 */

const BACKEND_URL = 'http://localhost:8000'; // Update with your backend URL

export class PatternAPI {
  /**
   * Scan symbols for patterns
   * @param {Array<string>} symbols - Array of symbols to scan
   * @param {string} timeframe - Timeframe (15m, 1h, 4h, 1d)
   * @returns {Promise<Array>} - Array of detected patterns
   */
  async scanPatterns(symbols, timeframe = '15m') {
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
        })
      });

      if (!response.ok) {
        throw new Error(`Scan failed: ${response.statusText}`);
      }

      const data = await response.json();
      return data.results;
    } catch (error) {
      console.error('Pattern scan error:', error);
      throw error;
    }
  }

  /**
   * Get pattern details
   * @param {string} symbol - Symbol to analyze
   * @param {string} patternType - Type of pattern
   * @returns {Promise<Object>} - Pattern details with chart image
   */
  async getPatternDetails(symbol, patternType) {
    try {
      const response = await fetch(
        `${BACKEND_URL}/api/pattern/${symbol}/${patternType}`
      );

      if (!response.ok) {
        throw new Error(`Failed to get pattern details: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Get pattern details error:', error);
      throw error;
    }
  }

  /**
   * Get pattern history
   * @param {string} symbol - Symbol to get history for
   * @param {number} limit - Number of historical patterns
   * @returns {Promise<Array>} - Historical patterns
   */
  async getPatternHistory(symbol, limit = 50) {
    try {
      const response = await fetch(
        `${BACKEND_URL}/api/history/${symbol}?limit=${limit}`
      );

      if (!response.ok) {
        throw new Error(`Failed to get history: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Get pattern history error:', error);
      throw error;
    }
  }
}

// Singleton instance
export const patternApi = new PatternAPI();
