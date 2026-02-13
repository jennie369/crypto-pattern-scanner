// ============================================
// 🔐 MULTI-TIMEFRAME SCANNER WITH TIER ACCESS CONTROL
// ============================================

import { patternDetectionService } from './patternDetection';

// 📋 TIER ACCESS RULES
const TIER_CONFIG = {
  FREE: {
    maxTimeframes: 1,
    allowedTimeframes: ['current'], // Only current viewing timeframe
    features: ['single-tf-scan']
  },
  TIER1: {
    maxTimeframes: 1,
    allowedTimeframes: ['current'],
    features: ['single-tf-scan']
  },
  TIER2: {
    maxTimeframes: 3,
    allowedTimeframes: ['15m', '1h', '4h', '1d', '1w'],
    features: ['multi-tf-scan', 'timeframe-confluence']
  },
  TIER3: {
    maxTimeframes: 5,
    allowedTimeframes: ['5m', '15m', '1h', '4h', '1d', '1w', '1M'],
    features: ['multi-tf-scan', 'timeframe-confluence', 'advanced-filtering']
  }
};

// 🎯 CHECK USER TIER ACCESS
export const checkMultiTFAccess = (userTier) => {
  // Debug logging
  console.log('[Multi-TF] Raw userTier received:', userTier);
  console.log('[Multi-TF] Type of userTier:', typeof userTier);

  const tier = userTier?.toUpperCase() || 'FREE';
  console.log('[Multi-TF] Normalized tier:', tier);

  const config = TIER_CONFIG[tier] || TIER_CONFIG.FREE;
  console.log('[Multi-TF] Config found:', config);
  console.log('[Multi-TF] Has access:', config.maxTimeframes > 1);

  return {
    hasAccess: config.maxTimeframes > 1,
    maxTimeframes: config.maxTimeframes,
    allowedTimeframes: config.allowedTimeframes,
    features: config.features,
    tier: tier
  };
};

// 📊 AVAILABLE TIMEFRAMES FOR MULTI-TF SCAN
export const MULTI_TF_TIMEFRAMES = [
  { value: '5m', label: '5m', tier: 'TIER3' },
  { value: '15m', label: '15m', tier: 'TIER2' },
  { value: '1h', label: '1h', tier: 'TIER2' },
  { value: '4h', label: '4h', tier: 'TIER2' },
  { value: '1d', label: '1D', tier: 'TIER2' },
  { value: '1w', label: '1W', tier: 'TIER2' },
  { value: '1M', label: '1M', tier: 'TIER3' }
];

// 🔥 HELPER: Sanitize symbol for API calls (remove /USDT suffix)
const sanitizeSymbol = (symbol) => {
  if (!symbol) return 'BTCUSDT';
  // Remove slashes and ensure single USDT suffix
  let cleaned = symbol.replace(/\//g, '').toUpperCase();
  // Remove duplicate USDT (e.g., BTCUSDTUSDT -> BTCUSDT)
  while (cleaned.endsWith('USDTUSDT')) {
    cleaned = cleaned.slice(0, -4);
  }
  // Ensure ends with USDT
  if (!cleaned.endsWith('USDT')) {
    cleaned = cleaned + 'USDT';
  }
  return cleaned;
};

// 🔍 SCAN MULTIPLE TIMEFRAMES
export const scanMultipleTimeframes = async (symbol, timeframes, userTier) => {
  console.log('[Multi-TF] 🚀 scanMultipleTimeframes CALLED');
  console.log('[Multi-TF] 📥 Params:', { symbol, timeframes, userTier });

  // 🔥 FIX: Sanitize symbol to remove /USDT
  const cleanSymbol = sanitizeSymbol(symbol);
  console.log('[Multi-TF] 🧹 Sanitized symbol:', symbol, '→', cleanSymbol);

  try {
    const access = checkMultiTFAccess(userTier);

    // ❌ Access denied for FREE/TIER1
    if (!access.hasAccess) {
      return {
        success: false,
        error: 'UPGRADE_REQUIRED',
        message: `Multi-timeframe scanning requires TIER2 or higher. Your current tier: ${access.tier}`,
        tier: access.tier
      };
    }

    // ⚠️ Limit timeframes based on tier
    const limitedTimeframes = timeframes.slice(0, access.maxTimeframes);

    // 🚀 Scan each timeframe in parallel
    console.log(`[Multi-TF] Scanning ${cleanSymbol} across ${limitedTimeframes.length} timeframes:`, limitedTimeframes);

    const scanPromises = limitedTimeframes.map(async (tf) => {
      try {
        // Check if timeframe is allowed for this tier
        if (!access.allowedTimeframes.includes(tf)) {
          console.log(`[Multi-TF] ❌ Timeframe ${tf} not allowed for ${access.tier}`);
          return {
            timeframe: tf,
            patterns: [],
            error: `Timeframe ${tf} not available in ${access.tier}`
          };
        }

        console.log(`[Multi-TF] 📊 Scanning ${cleanSymbol} on ${tf}...`);

        // 🔥 FIX: scanSymbol returns a single pattern object, not an array
        // 🔥 FIX: Use cleanSymbol (sanitized) instead of raw symbol
        console.log(`[Multi-TF] 📡 Calling scanSymbol(${cleanSymbol}, 'free', { timeframe: '${tf}' })...`);
        const patternResult = await patternDetectionService.scanSymbol(cleanSymbol, 'free', { timeframe: tf });

        console.log(`[Multi-TF] 🔍 ${tf} result:`, patternResult);
        console.log(`[Multi-TF] 🔍 ${tf} pattern found:`, patternResult ? patternResult.pattern || patternResult.patternType : 'NONE');

        // 🔥 FIX: Wrap single pattern in array (scanSymbol returns 1 pattern or null)
        const patterns = patternResult ? [patternResult] : [];

        return {
          timeframe: tf,
          patterns: patterns,
          patternCount: patterns.length,
          scannedAt: new Date().toISOString()
        };
      } catch (error) {
        console.error(`❌ Error scanning ${tf}:`, error);
        return {
          timeframe: tf,
          patterns: [],
          patternCount: 0,
          error: error.message
        };
      }
    });

    const results = await Promise.all(scanPromises);

    // 📊 Log results summary
    const totalPatterns = results.reduce((sum, r) => sum + r.patterns.length, 0);
    console.log(`[Multi-TF] ✅ Scan complete for ${cleanSymbol}:`, {
      timeframesScanned: results.length,
      totalPatterns,
      byTimeframe: results.map(r => `${r.timeframe}: ${r.patterns.length}`)
    });

    // 📊 Group patterns by type across timeframes
    const groupedPatterns = groupPatternsByType(results);
    console.log(`[Multi-TF] 📦 Grouped patterns:`, groupedPatterns);

    // 🎯 Calculate confluence scores
    const confluenceData = calculateConfluence(groupedPatterns);
    console.log(`[Multi-TF] 🎯 Confluence data (${confluenceData.length} patterns with scores):`, confluenceData);

    return {
      success: true,
      symbol: cleanSymbol,
      scannedTimeframes: limitedTimeframes,
      availableTimeframes: access.maxTimeframes,
      tier: access.tier,
      results,
      grouped: groupedPatterns,
      confluence: confluenceData,
      totalPatterns,
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    console.error('❌ Multi-TF scan error:', error);
    return {
      success: false,
      error: 'SCAN_ERROR',
      message: error.message
    };
  }
};

// 📦 GROUP PATTERNS BY TYPE ACROSS TIMEFRAMES
const groupPatternsByType = (results) => {
  const grouped = {};

  results.forEach(({ timeframe, patterns }) => {
    if (!patterns || patterns.length === 0) {
      console.log(`[Multi-TF] No patterns for ${timeframe}`);
      return;
    }

    patterns.forEach(pattern => {
      // 🔥 FIX: Check multiple possible property names
      const type = pattern.patternName || pattern.pattern || pattern.name || 'UNKNOWN';
      const direction = pattern.direction || pattern.signal || 'BREAKOUT';

      console.log(`[Multi-TF] Grouping pattern: ${type} on ${timeframe}`, pattern);

      if (!grouped[type]) {
        grouped[type] = {
          patternName: type,
          direction: direction,
          timeframes: [],
          count: 0
        };
      }

      grouped[type].timeframes.push({
        timeframe,
        state: pattern.state || 'FRESH',
        confidence: pattern.confidence || 0,
        entry: pattern.entry,
        stopLoss: pattern.stopLoss,
        takeProfit: pattern.takeProfit,
        detectedAt: pattern.detectedAt || new Date().toISOString()
      });

      grouped[type].count++;
    });
  });

  console.log(`[Multi-TF] Grouped ${Object.keys(grouped).length} pattern types:`, Object.keys(grouped));

  return Object.values(grouped);
};

// 🎯 CALCULATE CONFLUENCE SCORE
// Confluence = when same pattern appears on multiple timeframes
const calculateConfluence = (groupedPatterns) => {
  return groupedPatterns.map(pattern => {
    const tfCount = pattern.timeframes.length;
    const activeCount = pattern.timeframes.filter(tf => tf.state === 'ACTIVE').length;
    const avgConfidence = pattern.timeframes.reduce((sum, tf) => sum + (tf.confidence || 0), 0) / tfCount;

    // Calculate confluence score (0-100)
    let score = 0;
    score += tfCount * 20; // More timeframes = higher score
    score += activeCount * 15; // Active states boost score
    score += avgConfidence * 0.3; // Confidence contributes

    // Cap at 100
    score = Math.min(100, score);

    return {
      ...pattern,
      confluence: {
        score: Math.round(score),
        level: score >= 70 ? 'HIGH' : score >= 40 ? 'MEDIUM' : 'LOW',
        activeTimeframes: activeCount,
        totalTimeframes: tfCount,
        avgConfidence: Math.round(avgConfidence)
      }
    };
  });
};

// 🔄 GET RECOMMENDED TIMEFRAMES BASED ON PATTERN TYPE
export const getRecommendedTimeframes = (patternType) => {
  const recommendations = {
    // REVERSAL patterns work best on higher timeframes
    'UPD': ['1d', '1w', '4h'],
    'DPU': ['1d', '1w', '4h'],
    'Head & Shoulders': ['1d', '4h', '1h'],
    'Double Top': ['1d', '4h'],
    'Double Bottom': ['1d', '4h'],

    // CONTINUATION patterns work on multiple timeframes
    'DPD': ['4h', '1d', '1h'],
    'UPU': ['4h', '1d', '1h'],
    'Bull Flag': ['1h', '4h', '15m'],
    'Bear Flag': ['1h', '4h', '15m'],

    // BREAKOUT patterns need multiple TF confirmation
    'Triangle': ['4h', '1d', '1h', '15m'],
    'Wedge': ['4h', '1d', '1h'],
    'Rectangle': ['4h', '1d', '1h'],

    // FREQUENCY ZONES need higher timeframes
    'HFZ': ['1d', '1w', '4h'],
    'LFZ': ['1d', '1w', '4h']
  };

  return recommendations[patternType] || ['1d', '4h', '1h'];
};

// 🎨 GET TIER BADGE COLOR
export const getTierBadgeColor = (tier) => {
  const colors = {
    FREE: '#6C757D',
    TIER1: '#17A2B8',
    TIER2: '#FFC107',
    TIER3: '#FF6B6B'
  };

  return colors[tier?.toUpperCase()] || colors.FREE;
};

// 📋 GET TIER FEATURES DESCRIPTION
export const getTierFeatures = (tier) => {
  const upperTier = tier?.toUpperCase() || 'FREE';
  const config = TIER_CONFIG[upperTier] || TIER_CONFIG.FREE;

  return {
    tier: upperTier,
    maxTimeframes: config.maxTimeframes,
    timeframesText: config.maxTimeframes === 1 ? 'Single timeframe only' : `Up to ${config.maxTimeframes} timeframes`,
    features: config.features.map(f => f.replace(/-/g, ' ').toUpperCase()),
    allowedTimeframes: config.allowedTimeframes
  };
};

export default {
  checkMultiTFAccess,
  scanMultipleTimeframes,
  getRecommendedTimeframes,
  getTierBadgeColor,
  getTierFeatures,
  MULTI_TF_TIMEFRAMES,
  TIER_CONFIG
};
