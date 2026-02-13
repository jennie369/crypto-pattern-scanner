/**
 * Scanner API Service
 * Handles all backend API calls for Scanner v2
 */

import type {
  DetectedPattern,
  ScanFilters,
  PatternAlert,
  PatternCode,
  Candle,
  Timeframe,
  TimeframeDisplay,
  PriceUpdate,
  PatternDetectedCallback,
  PriceUpdateCallback,
  ErrorCallback,
} from '../types';

/** Pattern name mapping */
const PATTERN_NAMES: Record<string, string> = {
  'DPD': 'Down-Pause-Down',
  'UPU': 'Up-Pause-Up',
  'UPD': 'Up-Pause-Down',
  'DPU': 'Down-Pause-Up',
  'H&S': 'Head & Shoulders',
  'Double Top': 'Double Top',
  'Double Bottom': 'Double Bottom',
  'Triangle': 'Triangle',
};

/**
 * Get pattern name from pattern code
 */
const getPatternName = (pattern: string): string => {
  return PATTERN_NAMES[pattern] ?? pattern;
};

/**
 * Scan for patterns across multiple coins and timeframes
 */
export const scanPatterns = async (filters: ScanFilters): Promise<DetectedPattern[]> => {
  try {
    console.log('[scanPatterns] Starting scan with filters:', filters);

    if (!filters) {
      throw new Error('No filters provided');
    }

    const { coins, timeframe, pattern, patternFilter } = filters;
    const selectedPattern = pattern ?? patternFilter ?? 'All';

    if (!coins || coins.length === 0) {
      throw new Error('No coins selected for scanning');
    }

    console.log('[scanPatterns] Validated filters:', { coins, timeframe, selectedPattern });

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Generate mock patterns based on filters
    const mockPatterns: DetectedPattern[] = [];
    const patternTypes: PatternCode[] = selectedPattern === 'All'
      ? ['DPD', 'UPU', 'UPD', 'DPU', 'H&S', 'Double Top', 'Double Bottom', 'Triangle']
      : [selectedPattern as PatternCode];

    coins.forEach((coin, index) => {
      if (Math.random() > 0.5) {
        const randomPattern = patternTypes[Math.floor(Math.random() * patternTypes.length)];
        const basePrice = Math.random() * 100000 + 1000;
        const confidence = Math.floor(Math.random() * 40) + 60;

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
          riskReward: parseFloat((1 + Math.random() * 2).toFixed(2)),
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
 * Save pattern alert to database
 */
export const savePatternAlert = async (pattern: DetectedPattern): Promise<PatternAlert> => {
  try {
    console.log('[savePatternAlert] Saving pattern:', pattern);

    const savedAlerts: PatternAlert[] = JSON.parse(localStorage.getItem('pattern_alerts') ?? '[]');
    const newAlert: PatternAlert = {
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
 */
export const exportToCSV = (patterns: DetectedPattern[]): string => {
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
 */
export const downloadCSV = (csvContent: string, filename: string = 'pattern-scan-results.csv'): void => {
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
 */
export const getCandlestickData = async (
  coin: string,
  timeframe: Timeframe | TimeframeDisplay,
  limit: number = 100
): Promise<Candle[]> => {
  try {
    console.log(`Fetching candlestick data for ${coin} ${timeframe}`);

    const data: Candle[] = [];
    const now = Math.floor(Date.now() / 1000);
    let currentPrice = Math.random() * 100000 + 1000;

    for (let i = limit; i >= 0; i--) {
      const change = (Math.random() - 0.5) * (currentPrice * 0.02);
      const open = currentPrice;
      const close = currentPrice + change;
      const high = Math.max(open, close) + Math.random() * (currentPrice * 0.01);
      const low = Math.min(open, close) - Math.random() * (currentPrice * 0.01);

      data.push({
        time: now - (i * 3600),
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

/** WebSocket callbacks interface */
interface ScannerWebSocketCallbacks {
  onPattern: PatternDetectedCallback | null;
  onPrice: PriceUpdateCallback | null;
  onError: ErrorCallback | null;
}

/**
 * WebSocket connection for real-time updates
 */
export class ScannerWebSocket {
  private ws: WebSocket | null;
  private callbacks: ScannerWebSocketCallbacks;
  private interval: NodeJS.Timeout | null;

  constructor() {
    this.ws = null;
    this.interval = null;
    this.callbacks = {
      onPattern: null,
      onPrice: null,
      onError: null,
    };
  }

  connect(coins: string[]): void {
    try {
      console.log('WebSocket connection initialized for coins:', coins);
      this.simulateWebSocket(coins);
    } catch (error) {
      console.error('WebSocket connection error:', error);
      if (this.callbacks.onError) {
        this.callbacks.onError(error as Error);
      }
    }
  }

  private simulateWebSocket(coins: string[]): void {
    this.interval = setInterval(() => {
      if (this.callbacks.onPrice) {
        coins.forEach(coin => {
          const update: PriceUpdate = {
            coin: `${coin}/USDT`,
            price: Math.random() * 100000 + 1000,
            change24h: (Math.random() - 0.5) * 10,
          };
          this.callbacks.onPrice!(update);
        });
      }
    }, 3000);
  }

  onPattern(callback: PatternDetectedCallback): void {
    this.callbacks.onPattern = callback;
  }

  onPrice(callback: PriceUpdateCallback): void {
    this.callbacks.onPrice = callback;
  }

  onError(callback: ErrorCallback): void {
    this.callbacks.onError = callback;
  }

  disconnect(): void {
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
