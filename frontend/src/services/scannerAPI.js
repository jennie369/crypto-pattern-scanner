/**
 * Scanner API Service
 * Handles all backend API calls for Scanner v2
 */

// Import supabase only when needed (commented out for mock implementation)
// import { supabase } from '../lib/supabaseClient';

/**
 * Scan for patterns across multiple coins and timeframes
 * @param {Object} filters - Scan configuration
 * @param {Array<string>} filters.coins - List of coins to scan (e.g., ['BTC', 'ETH'])
 * @param {string} filters.timeframe - Timeframe to analyze (e.g., '1H', '4H', '1D')
 * @param {string} filters.patternFilter - Pattern type filter (e.g., 'All', 'DPD', 'UPU')
 * @returns {Promise<Array>} Array of detected patterns
 */
export const scanPatterns = async (filters) => {
  try {
    console.log('[scanPatterns] Starting scan with filters:', filters);

    // Validate filters
    if (!filters) {
      throw new Error('No filters provided');
    }

    // Extract filters with fallback for property name (pattern or patternFilter)
    const { coins, timeframe, pattern, patternFilter } = filters;
    const selectedPattern = pattern || patternFilter || 'All';

    if (!coins || coins.length === 0) {
      throw new Error('No coins selected for scanning');
    }

    console.log('[scanPatterns] Validated filters:', { coins, timeframe, selectedPattern });

    // TODO: Replace with actual backend API call
    // For now, return mock data

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Generate mock patterns based on filters
    const mockPatterns = [];
    const patternTypes = selectedPattern === 'All'
      ? ['DPD', 'UPU', 'UPD', 'DPU', 'H&S', 'Double Top', 'Double Bottom', 'Triangle']
      : [selectedPattern];

    coins.forEach((coin, index) => {
      if (Math.random() > 0.5) { // 50% chance of finding a pattern
        const randomPattern = patternTypes[Math.floor(Math.random() * patternTypes.length)];
        const basePrice = Math.random() * 100000 + 1000;
        const confidence = Math.floor(Math.random() * 40) + 60; // 60-100%

        mockPatterns.push({
          id: `${coin}-${Date.now()}-${index}`,
          coin: `${coin}/USDT`,
          pattern: randomPattern,
          patternName: getPatternName(randomPattern),
          confidence,
          timeframe,
          entry: basePrice,
          stopLoss: basePrice * (1 + (Math.random() * 0.03)),
          takeProfit: basePrice * (1 - (Math.random() * 0.05)),
          riskReward: (1 + Math.random() * 2).toFixed(2),
          detectedAt: new Date().toISOString(),
        });
      }
    });

    return mockPatterns;
  } catch (error) {
    console.error('Error scanning patterns:', error);
    throw error;
  }
};

/**
 * Get pattern name from pattern code
 */
const getPatternName = (pattern) => {
  const names = {
    'DPD': 'Down-Pause-Down',
    'UPU': 'Up-Pause-Up',
    'UPD': 'Up-Pause-Down',
    'DPU': 'Down-Pause-Up',
    'H&S': 'Head & Shoulders',
    'Double Top': 'Double Top',
    'Double Bottom': 'Double Bottom',
    'Triangle': 'Triangle',
  };
  return names[pattern] || pattern;
};

/**
 * Save pattern alert to database
 * @param {Object} pattern - Pattern data to save
 * @returns {Promise<Object>} Saved pattern data
 */
export const savePatternAlert = async (pattern) => {
  try {
    console.log('[savePatternAlert] Saving pattern:', pattern);

    // TODO: Implement actual Supabase integration
    // For now, just save to localStorage
    const savedAlerts = JSON.parse(localStorage.getItem('pattern_alerts') || '[]');
    const newAlert = {
      id: Date.now(),
      coin: pattern.coin,
      pattern_type: pattern.pattern,
      timeframe: pattern.timeframe,
      entry_price: pattern.entry,
      stop_loss: pattern.stopLoss,
      take_profit: pattern.takeProfit,
      confidence: pattern.confidence,
      detected_at: pattern.detectedAt,
      saved_at: new Date().toISOString(),
    };

    savedAlerts.push(newAlert);
    localStorage.setItem('pattern_alerts', JSON.stringify(savedAlerts));

    console.log('[savePatternAlert] Pattern saved successfully');
    return newAlert;
  } catch (error) {
    console.error('Error saving pattern alert:', error);
    throw error;
  }
};

/**
 * Export scan results to CSV
 * @param {Array} patterns - Array of pattern results
 * @returns {string} CSV content
 */
export const exportToCSV = (patterns) => {
  const headers = [
    'Coin',
    'Pattern',
    'Confidence',
    'Timeframe',
    'Entry',
    'Stop Loss',
    'Take Profit',
    'Risk:Reward',
    'Detected At'
  ];

  const rows = patterns.map(p => [
    p.coin,
    p.patternName,
    `${p.confidence}%`,
    p.timeframe,
    p.entry,
    p.stopLoss,
    p.takeProfit,
    `1:${p.riskReward}`,
    new Date(p.detectedAt).toLocaleString()
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');

  return csvContent;
};

/**
 * Download CSV file
 * @param {string} csvContent - CSV content
 * @param {string} filename - Filename
 */
export const downloadCSV = (csvContent, filename = 'pattern-scan-results.csv') => {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Get historical candlestick data
 * @param {string} coin - Coin symbol (e.g., 'BTC/USDT')
 * @param {string} timeframe - Timeframe (e.g., '1H')
 * @param {number} limit - Number of candles to fetch
 * @returns {Promise<Array>} Array of candlestick data
 */
export const getCandlestickData = async (coin, timeframe, limit = 100) => {
  try {
    // TODO: Integrate with Binance API or your backend API
    console.log(`Fetching candlestick data for ${coin} ${timeframe}`);

    // Mock data generation
    const data = [];
    const now = Math.floor(Date.now() / 1000);
    let currentPrice = Math.random() * 100000 + 1000;

    for (let i = limit; i >= 0; i--) {
      const change = (Math.random() - 0.5) * (currentPrice * 0.02);
      const open = currentPrice;
      const close = currentPrice + change;
      const high = Math.max(open, close) + Math.random() * (currentPrice * 0.01);
      const low = Math.min(open, close) - Math.random() * (currentPrice * 0.01);

      data.push({
        time: now - (i * 3600), // 1 hour intervals
        open,
        high,
        low,
        close,
      });

      currentPrice = close;
    }

    return data;
  } catch (error) {
    console.error('Error fetching candlestick data:', error);
    throw error;
  }
};

/**
 * WebSocket connection for real-time updates
 */
export class ScannerWebSocket {
  constructor() {
    this.ws = null;
    this.callbacks = {
      onPattern: null,
      onPrice: null,
      onError: null,
    };
  }

  connect(coins) {
    try {
      // TODO: Replace with actual WebSocket URL
      const wsUrl = 'wss://stream.binance.com:9443/stream';

      // For now, just log
      console.log('WebSocket connection initialized for coins:', coins);

      // Simulate WebSocket connection
      this.simulateWebSocket(coins);
    } catch (error) {
      console.error('WebSocket connection error:', error);
      if (this.callbacks.onError) {
        this.callbacks.onError(error);
      }
    }
  }

  simulateWebSocket(coins) {
    // Simulate periodic updates
    this.interval = setInterval(() => {
      if (this.callbacks.onPrice) {
        coins.forEach(coin => {
          this.callbacks.onPrice({
            coin: `${coin}/USDT`,
            price: Math.random() * 100000 + 1000,
            change24h: (Math.random() - 0.5) * 10,
          });
        });
      }
    }, 3000);
  }

  onPattern(callback) {
    this.callbacks.onPattern = callback;
  }

  onPrice(callback) {
    this.callbacks.onPrice = callback;
  }

  onError(callback) {
    this.callbacks.onError = callback;
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
    console.log('WebSocket disconnected');
  }
}

export default {
  scanPatterns,
  savePatternAlert,
  exportToCSV,
  downloadCSV,
  getCandlestickData,
  ScannerWebSocket,
};
