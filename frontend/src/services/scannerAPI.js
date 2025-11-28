/**
 * Scanner API Service
 * Handles all backend API calls for Scanner v2
 *
 * 🔥 UPDATED: Now uses real patternDetectionService instead of mock data
 * This ensures correct SL/TP levels based on pattern direction
 */

// Import supabase only when needed (commented out for mock implementation)
// import { supabase } from '../lib/supabaseClient';

// 🔥 FIX: Import the real pattern detection service
import { patternDetectionService } from './patternDetection';
import { getPatternSignal } from '../constants/patternSignals';

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
    const { coins, pattern, patternFilter } = filters;
    // 🔥 FIX: Normalize timeframe to lowercase (Binance requires lowercase like '1h', not '1H')
    const timeframe = (filters.timeframe || '1h').toLowerCase();
    const selectedPattern = pattern || patternFilter || 'All';

    if (!coins || coins.length === 0) {
      throw new Error('No coins selected for scanning');
    }

    console.log('[scanPatterns] Validated filters:', { coins, timeframe, selectedPattern });

    // TODO: Replace with actual backend API call
    // For now, return mock data with REAL prices from Binance

    console.log('[scanPatterns] 🔵 Fetching REAL current prices from Binance for', coins.length, 'coins...');

    // 🔥 FIX: Fetch REAL current prices for all coins from Binance
    const pricePromises = coins.map(async (coin) => {
      try {
        // Clean symbol for Binance API
        const cleanedSymbol = coin.replace(/[\/\-_]/g, '').toUpperCase().replace(/USDT$/, '') + 'USDT';
        const url = `https://fapi.binance.com/fapi/v1/ticker/price?symbol=${cleanedSymbol}`;
        const response = await fetch(url);

        if (!response.ok) {
          console.warn(`[scanPatterns] ⚠️ Failed to fetch price for ${coin}, using fallback`);
          return { coin, price: null };
        }

        const data = await response.json();
        const price = parseFloat(data.price);
        console.log(`[scanPatterns] ✅ ${coin}: $${price.toFixed(price < 1 ? 6 : 2)}`);
        return { coin, price };
      } catch (error) {
        console.warn(`[scanPatterns] ⚠️ Error fetching price for ${coin}:`, error.message);
        return { coin, price: null };
      }
    });

    const priceResults = await Promise.all(pricePromises);
    const priceMap = {};
    priceResults.forEach(({ coin, price }) => {
      priceMap[coin] = price;
    });

    console.log('[scanPatterns] 🔵 Price map:', priceMap);

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // 🔥 ISSUE #2: Track coins without price data
    const coinsWithoutData = coins.filter(coin => !priceMap[coin]);
    const coinsWithData = coins.filter(coin => priceMap[coin]);

    if (coinsWithoutData.length > 0) {
      console.warn('[scanPatterns] ⚠️ Skipping', coinsWithoutData.length, 'coins without price data:');
      console.warn('[scanPatterns]   Skipped coins:', coinsWithoutData.join(', '));
    }

    console.log('[scanPatterns] ✅ Valid coins:', coinsWithData.length, 'out of', coins.length);

    // 🔥 FIX: Use REAL pattern detection instead of mock data
    // This ensures SL/TP levels are correct for each pattern direction
    console.log('[scanPatterns] 🔍 Using REAL pattern detection service...');

    // Determine user tier from localStorage or default to 'free'
    const userTier = localStorage.getItem('user_tier') || 'free';
    console.log('[scanPatterns] 👤 User tier:', userTier);

    // Build pattern filter for detection service
    const patternFilters = selectedPattern === 'All' ? [] : [selectedPattern.toLowerCase().replace(/[- &]/g, '_')];

    // Scan each coin with real pattern detection
    const scanPromises = coinsWithData.map(async (coin) => {
      try {
        // Clean symbol for Binance API (e.g., "BTC" -> "BTCUSDT")
        const cleanedSymbol = coin.replace(/[\/\-_]/g, '').toUpperCase().replace(/USDT$/, '') + 'USDT';

        console.log(`[scanPatterns] 🔍 Scanning ${cleanedSymbol} on ${timeframe}...`);

        // Call REAL pattern detection with filters
        const pattern = await patternDetectionService.scanSymbol(cleanedSymbol, userTier, {
          timeframe: timeframe,
          patterns: patternFilters.length > 0 ? patternFilters : undefined,
        });

        if (pattern) {
          console.log(`[scanPatterns] ✅ ${cleanedSymbol}: Found ${pattern.patternType || pattern.pattern}`);

          // Get direction info from PATTERN_SIGNALS
          const signalInfo = getPatternSignal(pattern.patternType || pattern.pattern);

          return {
            id: `${coin}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
            coin: `${coin}/USDT`,
            pattern: pattern.patternType || pattern.pattern,
            patternType: pattern.patternType || pattern.pattern,
            patternName: pattern.fullLabel || pattern.description || pattern.pattern,
            confidence: pattern.confidence || 70,
            timeframe: timeframe,
            entry: pattern.entry,
            stopLoss: pattern.stopLoss,
            takeProfit: pattern.takeProfit || pattern.target,
            target: pattern.target || pattern.takeProfit,
            riskReward: pattern.riskReward || 2.0,
            detectedAt: pattern.detectedAt || new Date().toISOString(),
            // 🔥 CRITICAL: Include direction from PATTERN_SIGNALS
            direction: signalInfo?.direction || pattern.direction,
            signal: signalInfo?.signal || pattern.signal,
            type: signalInfo?.type || pattern.type,
            color: signalInfo?.color || pattern.color,
            icon: signalInfo?.icon || pattern.icon,
          };
        }

        return null;
      } catch (error) {
        console.warn(`[scanPatterns] ⚠️ Error scanning ${coin}:`, error.message);
        return null;
      }
    });

    // Wait for all scans to complete
    const results = await Promise.all(scanPromises);
    const detectedPatterns = results.filter(p => p !== null);

    console.log('[scanPatterns] ✅ REAL scan complete:', detectedPatterns.length, 'patterns found');
    console.log('[scanPatterns] 📊 Summary:', {
      totalCoins: coins.length,
      coinsWithData: coinsWithData.length,
      coinsSkipped: coinsWithoutData.length,
      patternsFound: detectedPatterns.length,
    });

    // 🔥 ISSUE #2: Return patterns with metadata about skipped coins
    detectedPatterns._metadata = {
      totalCoinsScanned: coins.length,
      coinsWithData: coinsWithData.length,
      coinsSkipped: coinsWithoutData.length,
      skippedCoins: coinsWithoutData,
    };

    return detectedPatterns;
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
    p.entry.toFixed(2),
    p.stopLoss.toFixed(2),
    p.takeProfit.toFixed(2),
    `1:${typeof p.riskReward === 'number' ? p.riskReward.toFixed(2) : p.riskReward}`,
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
