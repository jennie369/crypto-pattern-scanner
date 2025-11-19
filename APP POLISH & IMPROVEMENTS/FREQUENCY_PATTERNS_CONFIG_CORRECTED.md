# ⚙️ FREQUENCY PATTERNS - CONFIGURATION FILE (CORRECTED)

> **Pattern Detection Parameters & Settings**  
> ⚠️ CORRECTED: Zone retest trading system configuration

---

## 📊 PATTERN DETECTION PARAMETERS

```javascript
// src/config/frequencyPatternConfig.js

export const PATTERN_CONFIG = {
  // ========================================
  // TREND DETECTION SETTINGS
  // ========================================
  trend: {
    // Minimum % of candles making higher/lower highs & lows
    minTrendStrength: 60,  // 60% = moderate trend
    
    // Minimum price change to consider as trend
    minPriceChangePercent: 1,  // 1% minimum movement
    
    // Candle lookback for trend phases
    phase1Length: 30,  // Phase 1: 30 candles
    phase3Length: 30,  // Phase 3: 30 candles
    
    // Trend strength quality thresholds
    strongTrend: 75,      // >75% = strong
    moderateTrend: 60,    // 60-75% = moderate
    weakTrend: 50,        // 50-60% = weak (skip)
  },
  
  // ========================================
  // PAUSE ZONE DETECTION SETTINGS
  // ⚠️ CORRECTED: GEM system uses 1-5 candles
  // ========================================
  pauseZone: {
    // Maximum price range for pause zone (% of average price)
    maxRangePercent: 2,  // 2% max range
    
    // Pause zone duration (candles)
    minLength: 1,  // At least 1 candle
    maxLength: 5,  // No more than 5 candles (GEM system)
    optimalLength: 3,  // Ideal: 2-3 candles
    
    // Pause quality scoring weights
    rangeWeight: 40,      // Max 40 points for tight range
    lengthWeight: 30,     // Max 30 points for optimal length
    volatilityWeight: 30, // Max 30 points for low volatility
  },
  
  // ========================================
  // ZONE TRACKING SETTINGS (NEW - CRITICAL)
  // ⚠️ Core of retest trading system
  // ========================================
  zoneTracking: {
    // Maximum retests per zone
    maxTestsPerZone: 2,  // Zone good for 1-2 retests only
    
    // Zone strength decay
    zoneFreshnessDecay: true,
    freshZoneStrength: 100,    // 0 tests = 100%
    firstRetestStrength: 80,   // 1 test = 80%
    secondRetestStrength: 60,  // 2 tests = 60%
    weakZoneThreshold: 50,     // <50% = skip
    
    // Zone proximity alert (% distance to trigger alert)
    alertProximity: 0.01,  // Alert when price within 1% of zone
    
    // Zone invalidation
    autoInvalidateBrokenZones: true,
    requireCloseOutsideZone: true,  // Must close outside to invalidate
  },
  
  // ========================================
  // CONFIRMATION SETTINGS (NEW - CRITICAL)
  // ⚠️ Mandatory for entry
  // ========================================
  confirmation: {
    // Require confirmation candle?
    required: true,  // ALWAYS true for GEM system
    
    // Confirmation patterns to detect
    patterns: {
      pinBar: true,
      engulfing: true,
      hammer: true,
      shootingStar: true,
      doji: false,  // Optional
    },
    
    // Minimum confirmation strength
    minStrength: 70,  // 0-100 scale
    
    // Candles to analyze for confirmation
    lookbackCandles: 3,  // Check last 3 candles
  },
  
  // ========================================
  // ENTRY STRATEGY SETTINGS
  // ⚠️ CORRECTED: Retest trading, not breakout!
  // ========================================
  entryStrategy: {
    // Entry timing
    type: 'RETEST',  // ⚠️ NOT 'BREAKOUT'!
    
    // Wait for retest?
    waitForRetest: true,  // ALWAYS true
    
    // Require confirmation?
    requireConfirmation: true,  // ALWAYS true
    
    // Entry location
    entryAtZone: true,  // Entry AT zone, not at breakout
    
    // Stop loss buffer (% beyond zone)
    stopLossBuffer: 0.005,  // 0.5% buffer
    
    // Minimum risk/reward ratio
    minRiskReward: 2,  // 1:2 minimum
    preferredRiskReward: 2.5,  // 1:2.5 preferred
    
    // Alert settings
    alertOnPatternDetection: true,
    alertOnZoneRetest: true,
    alertOnConfirmation: true,
  },
  
  // ========================================
  // PATTERN CONFIDENCE CALCULATION
  // ========================================
  confidence: {
    // Weight for each phase
    phase1Weight: 30,  // Max 30% from phase 1 strength
    pauseWeight: 40,   // Max 40% from pause quality
    phase3Weight: 30,  // Max 30% from phase 3 strength
    
    // Confidence thresholds
    highConfidence: 80,     // >80 = excellent trade
    mediumConfidence: 60,   // 60-80 = good trade
    lowConfidence: 40,      // 40-60 = risky (skip)
    rejectBelow: 40,        // <40 = reject pattern
    
    // Reversal pattern penalty
    reversalMultiplier: 0.9,  // 10% penalty for reversals
  },
  
  // ========================================
  // TRADING RULES
  // ========================================
  trading: {
    // Risk management
    maxRiskPerTradePercent: 2,  // 2% max risk per trade
    maxConcurrentPositions: 5,
    
    // Volume confirmation
    requireVolumeConfirmation: true,
    volumeMultiplier: 1.5,  // 1.5x average volume on breakout
    
    // Multiple timeframe
    enableMTF: true,
    higherTimeframe: '4h',  // Confirm on higher TF
  },
  
  // ========================================
  // PATTERN SCANNING SETTINGS
  // ========================================
  scanning: {
    // Data lookback (candles)
    lookback: 100,  // Scan last 100 candles
    
    // Scan range
    minStartIdx: 50,   // Start scanning from candle 50
    maxEndIdx: -50,    // Stop 50 candles before end
    
    // Pattern overlap prevention
    minCandlesBetweenPatterns: 20,
    
    // Maximum patterns to return per coin
    maxPatternsPerCoin: 5,
    
    // Sort by
    sortBy: 'confidence',  // 'confidence' | 'timestamp' | 'zoneStrength'
  },
  
  // ========================================
  // TIMEFRAME SETTINGS
  // ========================================
  timeframes: {
    // Recommended timeframes by trading style
    scalping: ['5m', '15m'],
    dayTrading: ['1h', '4h'],
    swingTrading: ['1d', '1w'],
    
    // Default timeframe
    default: '1h',
    
    // Best timeframes per pattern (based on backtest)
    patternTimeframes: {
      DPD: ['4h', '1d'],  // 68% win rate
      UPU: ['4h', '1d'],  // 71% win rate
      UPD: ['1d', '1w'],  // 65% win rate
      DPU: ['1d', '1w'],  // 69% win rate
    },
  },
  
  // ========================================
  // PATTERN SPECIFIC SETTINGS
  // ========================================
  patterns: {
    DPD: {
      enabled: true,
      minConfidence: 60,
      preferredConfidence: 75,
      zoneType: 'HFZ',
      entryDirection: 'SHORT',
      avgWinRate: 68,
      avgRiskReward: 2.5,
    },
    
    UPU: {
      enabled: true,
      minConfidence: 60,
      preferredConfidence: 75,
      zoneType: 'LFZ',
      entryDirection: 'LONG',
      avgWinRate: 71,
      avgRiskReward: 2.8,
    },
    
    UPD: {
      enabled: true,
      minConfidence: 55,
      preferredConfidence: 70,
      zoneType: 'HFZ',
      entryDirection: 'SHORT',
      patternType: 'REVERSAL',
      avgWinRate: 65,
      avgRiskReward: 2.2,
    },
    
    DPU: {
      enabled: true,
      minConfidence: 55,
      preferredConfidence: 70,
      zoneType: 'LFZ',
      entryDirection: 'LONG',
      patternType: 'REVERSAL',
      avgWinRate: 69,
      avgRiskReward: 2.6,
    },
  },
  
  // ========================================
  // VISUALIZATION SETTINGS
  // ========================================
  visualization: {
    colors: {
      // Pattern colors
      DPD: '#F6465D',
      UPU: '#0ECB81',
      UPD: '#F6465D',
      DPU: '#0ECB81',
      
      // Zone colors
      HFZ: '#9C0612',
      LFZ: '#0ECB81',
      pauseZone: 'rgba(255, 215, 0, 0.2)',
      
      // Trading levels
      entry: '#FFBD59',
      stopLoss: '#F6465D',
      takeProfit1: '#0ECB81',
      takeProfit2: '#00A86B',
      takeProfit3: '#008B5B',
      
      // Zone status
      freshZone: '#FFD700',      // Gold
      testedOnce: '#FFA500',     // Orange
      testedTwice: '#FF6347',    // Tomato
      invalidated: '#808080',    // Gray
    },
    
    // Zone indicators
    showZoneStrength: true,
    showTestCount: true,
    showRetestAlerts: true,
    
    // Chart drawing settings
    lineWidth: 2,
    dashPattern: [5, 5],
    labelFontSize: 12,
    labelFontFamily: 'Arial, bold',
    
    // Opacity settings
    zoneOpacity: 0.2,
    hoverOpacity: 0.4,
  },
  
  // ========================================
  // ALERT SETTINGS
  // ========================================
  alerts: {
    // Pattern detection alerts
    onPatternDetected: true,
    patternMessage: 'Pattern detected! Zone created. Wait for retest.',
    
    // Retest alerts
    onZoneRetest: true,
    retestMessage: 'Price testing zone! Check for confirmation.',
    
    // Confirmation alerts
    onConfirmation: true,
    confirmationMessage: 'Confirmation detected! Entry signal.',
    
    // Zone invalidation alerts
    onZoneInvalidated: true,
    invalidationMessage: 'Zone broken. No longer tradeable.',
    
    // Sound alerts
    enableSound: true,
    soundOnEntry: true,
  },
  
  // ========================================
  // PERFORMANCE SETTINGS
  // ========================================
  performance: {
    // Enable caching
    enableCache: true,
    cacheTimeout: 60000,  // 60 seconds
    
    // Throttle detection
    enableThrottle: true,
    throttleDelay: 500,  // 500ms
    
    // Maximum processing time
    maxProcessingTime: 5000,  // 5 seconds
    
    // Batch processing
    batchSize: 10,  // Process 10 coins at a time
  },
  
  // ========================================
  // DEBUG SETTINGS
  // ========================================
  debug: {
    enabled: false,
    logLevel: 'info',  // 'debug' | 'info' | 'warn' | 'error'
    logPatternDetails: false,
    logZoneTracking: true,  // Log zone retest events
    logConfirmation: true,  // Log confirmation validation
    logPerformance: false,
  },
};

// ========================================
// PRESET CONFIGURATIONS
// ========================================

export const PRESETS = {
  // Conservative (higher quality, fewer signals)
  conservative: {
    ...PATTERN_CONFIG,
    trend: {
      ...PATTERN_CONFIG.trend,
      minTrendStrength: 70,
      minPriceChangePercent: 1.5,
    },
    confidence: {
      ...PATTERN_CONFIG.confidence,
      rejectBelow: 70,
    },
    zoneTracking: {
      ...PATTERN_CONFIG.zoneTracking,
      maxTestsPerZone: 1,  // Only fresh zones
      weakZoneThreshold: 70,
    },
    confirmation: {
      ...PATTERN_CONFIG.confirmation,
      minStrength: 80,  // Higher confirmation threshold
    },
  },
  
  // Balanced (default settings) - RECOMMENDED
  balanced: PATTERN_CONFIG,
  
  // Aggressive (more signals, lower quality)
  aggressive: {
    ...PATTERN_CONFIG,
    trend: {
      ...PATTERN_CONFIG.trend,
      minTrendStrength: 50,
      minPriceChangePercent: 0.5,
    },
    confidence: {
      ...PATTERN_CONFIG.confidence,
      rejectBelow: 30,
    },
    zoneTracking: {
      ...PATTERN_CONFIG.zoneTracking,
      maxTestsPerZone: 3,  // Allow more tests
      weakZoneThreshold: 40,
    },
    confirmation: {
      ...PATTERN_CONFIG.confirmation,
      minStrength: 60,
    },
  },
  
  // Scalping (fast timeframes)
  scalping: {
    ...PATTERN_CONFIG,
    trend: {
      ...PATTERN_CONFIG.trend,
      phase1Length: 15,
      phase3Length: 15,
    },
    pauseZone: {
      ...PATTERN_CONFIG.pauseZone,
      minLength: 1,
      maxLength: 3,
    },
    timeframes: {
      ...PATTERN_CONFIG.timeframes,
      default: '5m',
    },
    entryStrategy: {
      ...PATTERN_CONFIG.entryStrategy,
      minRiskReward: 1.5,  // Lower R:R for scalping
    },
  },
  
  // Swing Trading (longer timeframes, quality focus)
  swingTrading: {
    ...PATTERN_CONFIG,
    trend: {
      ...PATTERN_CONFIG.trend,
      minTrendStrength: 70,
      phase1Length: 50,
      phase3Length: 50,
    },
    pauseZone: {
      ...PATTERN_CONFIG.pauseZone,
      minLength: 2,
      maxLength: 5,
    },
    timeframes: {
      ...PATTERN_CONFIG.timeframes,
      default: '1d',
    },
    zoneTracking: {
      ...PATTERN_CONFIG.zoneTracking,
      maxTestsPerZone: 1,  // Only fresh zones for swing
    },
  },
};

// ========================================
// HELPER FUNCTIONS
// ========================================

/**
 * Get config preset by name
 */
export const getPreset = (presetName = 'balanced') => {
  return PRESETS[presetName] || PATTERN_CONFIG;
};

/**
 * Merge custom config with defaults
 */
export const mergeConfig = (customConfig = {}) => {
  return {
    ...PATTERN_CONFIG,
    ...customConfig,
  };
};

/**
 * Validate config values
 */
export const validateConfig = (config) => {
  const errors = [];
  
  // Validate trend settings
  if (config.trend.minTrendStrength < 0 || config.trend.minTrendStrength > 100) {
    errors.push('minTrendStrength must be between 0-100');
  }
  
  // Validate pause zone settings
  if (config.pauseZone.maxRangePercent <= 0) {
    errors.push('maxRangePercent must be positive');
  }
  
  if (config.pauseZone.minLength < 1 || config.pauseZone.maxLength > 5) {
    errors.push('pauseZone length must be 1-5 candles (GEM system)');
  }
  
  // Validate zone tracking
  if (config.zoneTracking.maxTestsPerZone < 1) {
    errors.push('maxTestsPerZone must be at least 1');
  }
  
  // Validate entry strategy
  if (config.entryStrategy.type !== 'RETEST') {
    errors.push('entryStrategy.type must be RETEST (not BREAKOUT)');
  }
  
  if (!config.entryStrategy.waitForRetest) {
    errors.push('waitForRetest must be true for GEM system');
  }
  
  if (!config.confirmation.required) {
    errors.push('confirmation.required must be true for GEM system');
  }
  
  // Validate trading settings
  if (config.entryStrategy.minRiskReward < 1) {
    errors.push('minRiskReward must be at least 1');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Get zone status label
 */
export const getZoneStatusLabel = (zone) => {
  switch (zone.status) {
    case 'FRESH':
      return '⭐⭐⭐⭐⭐ Fresh Zone';
    case 'TESTED_1X':
      return '⭐⭐⭐⭐ Tested Once';
    case 'TESTED_2X':
      return '⭐⭐⭐ Tested Twice';
    case 'WEAK':
      return '⭐⭐ Weak (Skip)';
    case 'INVALIDATED':
      return '❌ Invalidated';
    default:
      return zone.status;
  }
};

/**
 * Get entry signal label
 */
export const getEntrySignalLabel = (pattern, hasConfirmation) => {
  if (!hasConfirmation) {
    return '⏰ Wait for confirmation';
  }
  
  const direction = pattern.signal === 'BULLISH' ? 'LONG' : 'SHORT';
  return `✅ ${direction} Entry Signal`;
};

// ========================================
// EXPORT DEFAULT
// ========================================

export default PATTERN_CONFIG;
```

---

## 📖 USAGE EXAMPLES

### Basic Usage:
```javascript
import PATTERN_CONFIG from './config/frequencyPatternConfig';

const patterns = detectAllFrequencyPatterns(data, PATTERN_CONFIG);
```

### Using Presets:
```javascript
import { getPreset } from './config/frequencyPatternConfig';

// Conservative trading (high quality only)
const conservativeConfig = getPreset('conservative');

// Balanced (recommended)
const balancedConfig = getPreset('balanced');

// Aggressive (more signals)
const aggressiveConfig = getPreset('aggressive');
```

### Validation:
```javascript
import { validateConfig } from './config/frequencyPatternConfig';

const validation = validateConfig(myCustomConfig);
if (!validation.isValid) {
  console.error('Config errors:', validation.errors);
}
```

### Zone Status:
```javascript
import { getZoneStatusLabel } from './config/frequencyPatternConfig';

const label = getZoneStatusLabel(zone);
// "⭐⭐⭐⭐⭐ Fresh Zone"
```

---

## 🎯 KEY DIFFERENCES FROM OLD VERSION

### ❌ OLD (WRONG):
```javascript
entryStrategy: {
  type: 'BREAKOUT',  // WRONG!
  waitForRetest: false,
}
```

### ✅ NEW (CORRECT):
```javascript
entryStrategy: {
  type: 'RETEST',  // CORRECT!
  waitForRetest: true,
  requireConfirmation: true,
  entryAtZone: true,
}

zoneTracking: {
  maxTestsPerZone: 2,
  zoneFreshnessDecay: true,
}

confirmation: {
  required: true,
  minStrength: 70,
}
```

---

## ⚠️ CRITICAL CONFIG RULES

### 1. Entry Strategy MUST BE:
- ✅ `type: 'RETEST'`
- ✅ `waitForRetest: true`
- ✅ `requireConfirmation: true`

### 2. Zone Tracking MUST BE:
- ✅ `maxTestsPerZone: 1-2`
- ✅ Track zone status
- ✅ Auto invalidate broken zones

### 3. Pause Zone MUST BE:
- ✅ `minLength: 1`
- ✅ `maxLength: 5`
- ✅ Per GEM system specification

---

**✅ FILE ĐÃ CORRECTED - READY TO USE!**

© GEM Trading Academy - Frequency Trading Method
**Corrected Configuration - November 2, 2025**
