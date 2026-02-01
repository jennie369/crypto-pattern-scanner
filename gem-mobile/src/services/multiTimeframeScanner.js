// ============================================
// 🔐 MULTI-TIMEFRAME SCANNER WITH TIER ACCESS CONTROL
// Reused from web version for GEM Mobile
// ============================================

import { patternDetection } from './patternDetection';

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
  },
  ADMIN: {
    maxTimeframes: 7,
    allowedTimeframes: ['1m', '5m', '15m', '1h', '4h', '1d', '1w', '1M'],
    features: ['multi-tf-scan', 'timeframe-confluence', 'advanced-filtering', 'admin-tools']
  }
};

// 🔄 NORMALIZE TIER (handle aliases per DATABASE_SCHEMA.md)
const normalizeTier = (tier) => {
  if (!tier) return 'FREE';
  const upperTier = tier.toUpperCase();

  // Map aliases to canonical tier names
  const tierMap = {
    'FREE': 'FREE',
    'TIER1': 'TIER1',
    'PRO': 'TIER1',       // PRO = TIER1
    'TIER2': 'TIER2',
    'PREMIUM': 'TIER2',   // PREMIUM = TIER2
    'TIER3': 'TIER3',
    'VIP': 'TIER3',       // VIP = TIER3
    'ADMIN': 'ADMIN'
  };

  return tierMap[upperTier] || 'FREE';
};

// 🎯 CHECK USER TIER ACCESS
export const checkMultiTFAccess = (userTier) => {
  console.log('[Multi-TF] Raw userTier received:', userTier);

  const tier = normalizeTier(userTier);
  console.log('[Multi-TF] Normalized tier:', tier);

  const config = TIER_CONFIG[tier] || TIER_CONFIG.FREE;
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
  console.log('[Multi-TF] scanMultipleTimeframes CALLED');
  console.log('[Multi-TF] Params:', { symbol, timeframes, userTier });

  const cleanSymbol = sanitizeSymbol(symbol);
  console.log('[Multi-TF] Sanitized symbol:', symbol, '→', cleanSymbol);

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
          console.log(`[Multi-TF] Timeframe ${tf} not allowed for ${access.tier}`);
          return {
            timeframe: tf,
            patterns: [],
            error: `Timeframe ${tf} not available in ${access.tier}`
          };
        }

        console.log(`[Multi-TF] Scanning ${cleanSymbol} on ${tf}...`);

        // Use detectPatterns method (not scanSymbol which doesn't exist)
        const patterns = await patternDetection.detectPatterns(cleanSymbol, tf, access.tier);

        console.log(`[Multi-TF] ${tf} result:`, patterns?.length ? `${patterns.length} pattern(s) found` : 'No pattern');

        return {
          timeframe: tf,
          patterns: patterns,
          patternCount: patterns.length,
          scannedAt: new Date().toISOString()
        };
      } catch (error) {
        console.error(`[Multi-TF] Error scanning ${tf}:`, error);
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
    console.log(`[Multi-TF] Scan complete for ${cleanSymbol}:`, {
      timeframesScanned: results.length,
      totalPatterns,
      byTimeframe: results.map(r => `${r.timeframe}: ${r.patterns.length}`)
    });

    // 📊 Group patterns by type across timeframes
    const groupedPatterns = groupPatternsByType(results);

    // 🎯 Calculate confluence scores
    const confluenceData = calculateConfluence(groupedPatterns);

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
    console.error('[Multi-TF] Scan error:', error);
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
      return;
    }

    patterns.forEach(pattern => {
      const type = pattern.patternName || pattern.pattern || pattern.name || 'UNKNOWN';
      const direction = pattern.direction || pattern.signal || 'BREAKOUT';

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

  return Object.values(grouped);
};

// 🎯 CALCULATE CONFLUENCE SCORE
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
    'HEAD_SHOULDERS': ['1d', '4h', '1h'],
    'DOUBLE_TOP': ['1d', '4h'],
    'DOUBLE_BOTTOM': ['1d', '4h'],

    // CONTINUATION patterns work on multiple timeframes
    'DPD': ['4h', '1d', '1h'],
    'UPU': ['4h', '1d', '1h'],
    'BULL_FLAG': ['1h', '4h', '15m'],
    'BEAR_FLAG': ['1h', '4h', '15m'],

    // BREAKOUT patterns need multiple TF confirmation
    'SYMMETRICAL_TRIANGLE': ['4h', '1d', '1h', '15m'],
    'ASCENDING_TRIANGLE': ['4h', '1d', '1h'],
    'DESCENDING_TRIANGLE': ['4h', '1d', '1h'],
    'WEDGE': ['4h', '1d', '1h'],

    // FREQUENCY ZONES need higher timeframes
    'HFZ': ['1d', '1w', '4h'],
    'LFZ': ['1d', '1w', '4h'],

    // Advanced GEM Frequency patterns
    'Quasimodo Bearish': ['1d', '4h', '1h'],
    'Quasimodo Bullish': ['1d', '4h', '1h'],
    'QML-B': ['1d', '4h', '1h'],
    'QML-L': ['1d', '4h', '1h'],
    'FTR Bearish': ['4h', '1h', '15m'],
    'FTR Bullish': ['4h', '1h', '15m'],
    'FTR-B': ['4h', '1h', '15m'],
    'FTR-L': ['4h', '1h', '15m'],
    'Flag Limit Bearish': ['4h', '1h', '15m'],
    'Flag Limit Bullish': ['4h', '1h', '15m'],
    'FL-B': ['4h', '1h', '15m'],
    'FL-L': ['4h', '1h', '15m'],
    'Decision Point Bearish': ['1d', '4h', '1h'],
    'Decision Point Bullish': ['1d', '4h', '1h'],
    'DP-B': ['1d', '4h', '1h'],
    'DP-L': ['1d', '4h', '1h'],
  };

  return recommendations[patternType] || ['1d', '4h', '1h'];
};

// 📊 PATTERN STRENGTH RANKING
// Based on GEM Frequency Method win rates and reliability
export const PATTERN_STRENGTH_RANKING = {
  // TIER S - Highest reliability (75%+ expected win rate)
  'Quasimodo Bearish': { tier: 'S', winRate: 75, strength: 95 },
  'Quasimodo Bullish': { tier: 'S', winRate: 73, strength: 93 },
  'QML-B': { tier: 'S', winRate: 75, strength: 95 },
  'QML-L': { tier: 'S', winRate: 73, strength: 93 },

  // TIER A - Strong reversal patterns (70-74% win rate)
  'UPD': { tier: 'A', winRate: 72, strength: 88 },
  'DPU': { tier: 'A', winRate: 71, strength: 87 },
  'HEAD_SHOULDERS': { tier: 'A', winRate: 70, strength: 85 },
  'DOUBLE_TOP': { tier: 'A', winRate: 68, strength: 82 },
  'DOUBLE_BOTTOM': { tier: 'A', winRate: 68, strength: 82 },
  'FTR Bearish': { tier: 'A', winRate: 66, strength: 80 },
  'FTR Bullish': { tier: 'A', winRate: 68, strength: 82 },
  'FTR-B': { tier: 'A', winRate: 66, strength: 80 },
  'FTR-L': { tier: 'A', winRate: 68, strength: 82 },

  // TIER B - Good patterns (65-69% win rate)
  'Flag Limit Bearish': { tier: 'B', winRate: 65, strength: 75 },
  'Flag Limit Bullish': { tier: 'B', winRate: 65, strength: 75 },
  'FL-B': { tier: 'B', winRate: 65, strength: 75 },
  'FL-L': { tier: 'B', winRate: 65, strength: 75 },
  'ASCENDING_TRIANGLE': { tier: 'B', winRate: 67, strength: 78 },
  'DESCENDING_TRIANGLE': { tier: 'B', winRate: 67, strength: 78 },
  'DPD': { tier: 'B', winRate: 65, strength: 75 },
  'UPU': { tier: 'B', winRate: 65, strength: 75 },
  'Decision Point Bearish': { tier: 'B', winRate: 64, strength: 74 },
  'Decision Point Bullish': { tier: 'B', winRate: 64, strength: 74 },
  'DP-B': { tier: 'B', winRate: 64, strength: 74 },
  'DP-L': { tier: 'B', winRate: 64, strength: 74 },

  // TIER C - Standard patterns (60-64% win rate)
  'SYMMETRICAL_TRIANGLE': { tier: 'C', winRate: 63, strength: 70 },
  'BULL_FLAG': { tier: 'C', winRate: 64, strength: 72 },
  'BEAR_FLAG': { tier: 'C', winRate: 64, strength: 72 },
  'WEDGE': { tier: 'C', winRate: 62, strength: 68 },
};

// 📊 TIMEFRAME STRENGTH RANKING
// Higher timeframes = stronger signals
export const TIMEFRAME_STRENGTH = {
  '1M': { weight: 100, label: 'Monthly', reliability: 95 },
  '1w': { weight: 90, label: 'Weekly', reliability: 90 },
  '1d': { weight: 80, label: 'Daily', reliability: 85 },
  '4h': { weight: 65, label: '4 Hour', reliability: 75 },
  '1h': { weight: 50, label: '1 Hour', reliability: 65 },
  '30m': { weight: 35, label: '30 Min', reliability: 55 },
  '15m': { weight: 25, label: '15 Min', reliability: 50 },
  '5m': { weight: 15, label: '5 Min', reliability: 40 },
  '1m': { weight: 5, label: '1 Min', reliability: 30 },
};

// 🎯 CALCULATE COMBINED PATTERN-TIMEFRAME STRENGTH
export const calculatePatternTimeframeStrength = (patternType, timeframe) => {
  const patternInfo = PATTERN_STRENGTH_RANKING[patternType] || { tier: 'C', winRate: 60, strength: 65 };
  const tfInfo = TIMEFRAME_STRENGTH[timeframe] || { weight: 50, reliability: 60 };

  // Combined score = pattern strength * 0.6 + timeframe weight * 0.4
  const combinedScore = Math.round(patternInfo.strength * 0.6 + tfInfo.weight * 0.4);

  // Adjusted win rate based on timeframe reliability
  const adjustedWinRate = Math.round(patternInfo.winRate * (tfInfo.reliability / 100));

  return {
    patternType,
    timeframe,
    patternTier: patternInfo.tier,
    baseWinRate: patternInfo.winRate,
    patternStrength: patternInfo.strength,
    timeframeWeight: tfInfo.weight,
    timeframeReliability: tfInfo.reliability,
    combinedScore,
    adjustedWinRate,
    grade: combinedScore >= 85 ? 'S' : combinedScore >= 75 ? 'A' : combinedScore >= 65 ? 'B' : 'C',
  };
};

// 🔍 ANALYZE MULTI-TF PATTERN RESULTS
export const analyzeMultiTFResults = (mtfResults) => {
  if (!mtfResults?.results?.length) {
    return null;
  }

  const analysis = {
    strongestPattern: null,
    strongestTimeframe: null,
    bestCombination: null,
    alignedPatterns: [],
    recommendations: [],
  };

  let maxStrength = 0;
  let maxTfWeight = 0;
  let maxCombined = 0;

  // Analyze each timeframe result
  mtfResults.results.forEach(tfResult => {
    const { timeframe, patterns } = tfResult;
    const tfInfo = TIMEFRAME_STRENGTH[timeframe] || { weight: 50, reliability: 60 };

    // Track strongest timeframe with patterns
    if (patterns?.length > 0 && tfInfo.weight > maxTfWeight) {
      maxTfWeight = tfInfo.weight;
      analysis.strongestTimeframe = {
        timeframe,
        weight: tfInfo.weight,
        reliability: tfInfo.reliability,
        patternCount: patterns.length,
      };
    }

    // Analyze each pattern
    patterns?.forEach(pattern => {
      const patternType = pattern.patternName || pattern.name || pattern.type;
      const patternInfo = PATTERN_STRENGTH_RANKING[patternType] || { tier: 'C', winRate: 60, strength: 65 };

      // Track strongest pattern
      if (patternInfo.strength > maxStrength) {
        maxStrength = patternInfo.strength;
        analysis.strongestPattern = {
          patternType,
          timeframe,
          tier: patternInfo.tier,
          winRate: patternInfo.winRate,
          strength: patternInfo.strength,
          pattern,
        };
      }

      // Calculate combined strength
      const combined = calculatePatternTimeframeStrength(patternType, timeframe);
      if (combined.combinedScore > maxCombined) {
        maxCombined = combined.combinedScore;
        analysis.bestCombination = {
          ...combined,
          pattern,
        };
      }
    });
  });

  // Find aligned patterns (same direction across multiple timeframes)
  const directionCount = { LONG: [], SHORT: [] };
  mtfResults.results.forEach(tfResult => {
    tfResult.patterns?.forEach(pattern => {
      const direction = pattern.direction || pattern.signal;
      if (direction === 'LONG' || direction === 'SHORT') {
        directionCount[direction].push({
          timeframe: tfResult.timeframe,
          pattern: pattern.patternName || pattern.name || pattern.type,
        });
      }
    });
  });

  // Check for alignment
  if (directionCount.LONG.length >= 2) {
    analysis.alignedPatterns.push({
      direction: 'LONG',
      timeframes: directionCount.LONG,
      strength: 'STRONG',
    });
  }
  if (directionCount.SHORT.length >= 2) {
    analysis.alignedPatterns.push({
      direction: 'SHORT',
      timeframes: directionCount.SHORT,
      strength: 'STRONG',
    });
  }

  // Generate recommendations
  if (analysis.bestCombination?.combinedScore >= 80) {
    analysis.recommendations.push({
      type: 'HIGH_PROBABILITY',
      message: `${analysis.bestCombination.patternType} trên ${analysis.bestCombination.timeframe} có độ tin cậy cao (${analysis.bestCombination.combinedScore}/100)`,
      action: 'TRADE',
    });
  }

  if (analysis.alignedPatterns.length > 0) {
    const aligned = analysis.alignedPatterns[0];
    analysis.recommendations.push({
      type: 'ALIGNMENT',
      message: `${aligned.timeframes.length} timeframes cùng hướng ${aligned.direction}`,
      action: 'CONFIRM',
    });
  }

  if (analysis.strongestTimeframe?.weight >= 80) {
    analysis.recommendations.push({
      type: 'TIMEFRAME',
      message: `Pattern trên ${analysis.strongestTimeframe.timeframe} đáng tin cậy hơn`,
      action: 'PRIORITIZE',
    });
  }

  return analysis;
};

// 🎨 GET TIER BADGE COLOR
export const getTierBadgeColor = (tier) => {
  const colors = {
    FREE: '#6C757D',
    TIER1: '#17A2B8',
    TIER2: '#FFC107',
    TIER3: '#FF6B6B',
    ADMIN: '#9B59B6'
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

// 📊 Get available timeframes for user tier
export const getAvailableTimeframesForTier = (userTier) => {
  const access = checkMultiTFAccess(userTier);

  return MULTI_TF_TIMEFRAMES.filter(tf => {
    // Tier level mapping (includes aliases per DATABASE_SCHEMA.md)
    const tierLevel = {
      'FREE': 0,
      'TIER1': 1,
      'PRO': 1,       // Alias for TIER1
      'TIER2': 2,
      'PREMIUM': 2,   // Alias for TIER2
      'TIER3': 3,
      'VIP': 3,       // Alias for TIER3
      'ADMIN': 4
    };

    const requiredLevel = tierLevel[tf.tier] || 0;
    const userLevel = tierLevel[access.tier?.toUpperCase()] || 0;

    return userLevel >= requiredLevel;
  });
};

export default {
  checkMultiTFAccess,
  scanMultipleTimeframes,
  getRecommendedTimeframes,
  getTierBadgeColor,
  getTierFeatures,
  getAvailableTimeframesForTier,
  MULTI_TF_TIMEFRAMES,
  TIER_CONFIG,
  // Pattern & Timeframe strength analysis
  PATTERN_STRENGTH_RANKING,
  TIMEFRAME_STRENGTH,
  calculatePatternTimeframeStrength,
  analyzeMultiTFResults,
};
