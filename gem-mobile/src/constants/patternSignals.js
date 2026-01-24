/**
 * GEM Mobile - Pattern Signal Definitions
 * Port from Web version with tier access and expected win rates
 * Version: Mobile optimized
 */

export const PATTERN_SIGNALS = {
  // ========================================
  // ✅ FREE TIER (3 PATTERNS)
  // ========================================

  DPD: {
    tier: 'FREE',
    implemented: true,
    signal: 'BEARISH',
    direction: 'SHORT',
    type: 'CONTINUATION',
    color: '#FF4757',
    icon: '🔻',
    label: 'SHORT',
    fullLabel: 'BEARISH CONTINUATION',
    description: 'Downtrend tiếp tục sau pause',
    expectedWinRate: 71,
    avgRR: 2.5,
    bestTimeframes: ['4H', '1D'],
    goodTimeframes: ['1H', '12H', '1W'],
    cautionTimeframes: ['15m', '30m'],
  },

  UPU: {
    tier: 'FREE',
    implemented: true,
    signal: 'BULLISH',
    direction: 'LONG',
    type: 'CONTINUATION',
    color: '#3AF7A6',
    icon: '🔺',
    label: 'LONG',
    fullLabel: 'BULLISH CONTINUATION',
    description: 'Uptrend tiếp tục sau pause',
    expectedWinRate: 68,
    avgRR: 2.8,
    bestTimeframes: ['4H', '1D'],
    goodTimeframes: ['1H', '12H', '1W'],
    cautionTimeframes: ['15m', '30m'],
  },

  HEAD_SHOULDERS: {
    tier: 'FREE',
    implemented: true,
    signal: 'BEARISH',
    direction: 'SHORT',
    type: 'REVERSAL',
    color: '#FF4757',
    icon: '🔻',
    label: 'SHORT',
    fullLabel: 'BEARISH REVERSAL',
    description: 'Đầu vai đảo chiều đỉnh',
    expectedWinRate: 68,
    avgRR: 2.5,
    bestTimeframes: ['1D', '1W'],
    goodTimeframes: ['4H', '12H'],
    cautionTimeframes: ['1H'],
  },

  // ========================================
  // ✅ TIER 1 EXCLUSIVE (4 PATTERNS)
  // ========================================

  UPD: {
    tier: 'TIER1',
    implemented: true,
    signal: 'BEARISH',
    direction: 'SHORT',
    type: 'REVERSAL',
    color: '#FF4757',
    icon: '🔻',
    label: 'SHORT',
    fullLabel: 'BEARISH REVERSAL',
    description: 'Giá tăng đến đỉnh → Phân phối → Đảo chiều giảm',
    expectedWinRate: 65,
    avgRR: 2.2,
    bestTimeframes: ['1D', '1W'],
    goodTimeframes: ['4H', '12H'],
    cautionTimeframes: ['1H', '2H'],
  },

  DPU: {
    tier: 'TIER1',
    implemented: true,
    signal: 'BULLISH',
    direction: 'LONG',
    type: 'REVERSAL',
    color: '#3AF7A6',
    icon: '🔺',
    label: 'LONG',
    fullLabel: 'BULLISH REVERSAL',
    description: 'Giá giảm đến đáy → Accumulation → Đảo chiều tăng',
    expectedWinRate: 67,
    avgRR: 2.4,
    bestTimeframes: ['1D', '1W'],
    goodTimeframes: ['4H', '12H'],
    cautionTimeframes: ['1H', '2H'],
  },

  DOUBLE_TOP: {
    tier: 'TIER1',
    implemented: true,
    signal: 'BEARISH',
    direction: 'SHORT',
    type: 'REVERSAL',
    color: '#FF4757',
    icon: '🔻',
    label: 'SHORT',
    fullLabel: 'BEARISH REVERSAL',
    description: 'Hai đỉnh đảo chiều',
    expectedWinRate: 66,
    avgRR: 2.3,
    bestTimeframes: ['4H', '1D'],
    goodTimeframes: ['1H', '12H', '1W'],
    cautionTimeframes: ['15m', '30m'],
  },

  DOUBLE_BOTTOM: {
    tier: 'TIER1',
    implemented: true,
    signal: 'BULLISH',
    direction: 'LONG',
    type: 'REVERSAL',
    color: '#3AF7A6',
    icon: '🔺',
    label: 'LONG',
    fullLabel: 'BULLISH REVERSAL',
    description: 'Hai đáy đảo chiều',
    expectedWinRate: 67,
    avgRR: 2.4,
    bestTimeframes: ['4H', '1D'],
    goodTimeframes: ['1H', '12H', '1W'],
    cautionTimeframes: ['15m', '30m'],
  },

  // ========================================
  // ✅ TIER 2 EXCLUSIVE (8 PATTERNS)
  // ========================================

  INVERSE_HEAD_SHOULDERS: {
    tier: 'TIER2',
    implemented: true,
    signal: 'BULLISH',
    direction: 'LONG',
    type: 'REVERSAL',
    color: '#3AF7A6',
    icon: '🔺',
    label: 'LONG',
    fullLabel: 'BULLISH REVERSAL',
    description: 'Đầu vai ngược đảo chiều đáy',
    expectedWinRate: 69,
    avgRR: 2.6,
    bestTimeframes: ['1D', '1W'],
    goodTimeframes: ['4H', '12H'],
    cautionTimeframes: ['1H'],
  },

  ASCENDING_TRIANGLE: {
    tier: 'TIER2',
    implemented: true,
    signal: 'BULLISH',
    direction: 'LONG',
    type: 'CONTINUATION',
    color: '#3AF7A6',
    icon: '🔺',
    label: 'LONG',
    fullLabel: 'BULLISH CONTINUATION',
    description: 'Tam giác tăng breakout',
    expectedWinRate: 66,
    avgRR: 2.3,
    bestTimeframes: ['4H', '1D'],
    goodTimeframes: ['1H', '12H'],
    cautionTimeframes: ['15m', '30m'],
  },

  DESCENDING_TRIANGLE: {
    tier: 'TIER2',
    implemented: true,
    signal: 'BEARISH',
    direction: 'SHORT',
    type: 'CONTINUATION',
    color: '#FF4757',
    icon: '🔻',
    label: 'SHORT',
    fullLabel: 'BEARISH CONTINUATION',
    description: 'Tam giác giảm breakdown',
    expectedWinRate: 65,
    avgRR: 2.2,
    bestTimeframes: ['4H', '1D'],
    goodTimeframes: ['1H', '12H'],
    cautionTimeframes: ['15m', '30m'],
  },

  HFZ: {
    tier: 'TIER2',
    implemented: true,
    signal: 'BEARISH',
    direction: 'SHORT',
    type: 'ZONE',
    color: '#FF4757',
    icon: '🔴',
    label: 'HFZ',
    fullLabel: 'HIGH FREQUENCY ZONE',
    description: 'Zone tần suất cao - kháng cự mạnh',
    expectedWinRate: 70,
    avgRR: 2.7,
    bestTimeframes: ['4H', '1D', '1W'],
    goodTimeframes: ['1H', '12H'],
    cautionTimeframes: ['15m', '30m'],
  },

  LFZ: {
    tier: 'TIER2',
    implemented: true,
    signal: 'BULLISH',
    direction: 'LONG',
    type: 'ZONE',
    color: '#3AF7A6',
    icon: '🟢',
    label: 'LFZ',
    fullLabel: 'LOW FREQUENCY ZONE',
    description: 'Zone tần suất thấp - hỗ trợ mạnh',
    expectedWinRate: 71,
    avgRR: 2.8,
    bestTimeframes: ['4H', '1D', '1W'],
    goodTimeframes: ['1H', '12H'],
    cautionTimeframes: ['15m', '30m'],
  },

  SYMMETRICAL_TRIANGLE: {
    tier: 'TIER2',
    implemented: true,
    signal: 'NEUTRAL',
    direction: 'BREAKOUT',
    type: 'BREAKOUT',
    color: '#FFBD59',
    icon: '⚡',
    label: 'BREAKOUT',
    fullLabel: 'BREAKOUT PATTERN',
    description: 'Tam giác cân bằng chờ breakout',
    expectedWinRate: 63,
    avgRR: 2.0,
    bestTimeframes: ['4H', '1D'],
    goodTimeframes: ['1H', '12H'],
    cautionTimeframes: ['15m', '30m'],
  },

  ROUNDING_BOTTOM: {
    tier: 'TIER2',
    implemented: true,
    signal: 'BULLISH',
    direction: 'LONG',
    type: 'REVERSAL',
    color: '#3AF7A6',
    icon: '🔺',
    label: 'LONG',
    fullLabel: 'BULLISH REVERSAL',
    description: 'Đáy tròn accumulation dài hạn',
    expectedWinRate: 68,
    avgRR: 2.9,
    bestTimeframes: ['1D', '1W'],
    goodTimeframes: ['4H', '12H'],
    cautionTimeframes: ['1H'],
  },

  ROUNDING_TOP: {
    tier: 'TIER2',
    implemented: true,
    signal: 'BEARISH',
    direction: 'SHORT',
    type: 'REVERSAL',
    color: '#FF4757',
    icon: '🔻',
    label: 'SHORT',
    fullLabel: 'BEARISH REVERSAL',
    description: 'Đỉnh tròn distribution dài hạn',
    expectedWinRate: 67,
    avgRR: 2.8,
    bestTimeframes: ['1D', '1W'],
    goodTimeframes: ['4H', '12H'],
    cautionTimeframes: ['1H'],
  },

  // ========================================
  // ✅ TIER 3 EXCLUSIVE (9 PATTERNS)
  // ========================================

  BULL_FLAG: {
    tier: 'TIER3',
    implemented: true,
    signal: 'BULLISH',
    direction: 'LONG',
    type: 'CONTINUATION',
    color: '#3AF7A6',
    icon: '🔺',
    label: 'LONG',
    fullLabel: 'BULLISH CONTINUATION',
    description: 'Cờ tăng tiếp tục',
    expectedWinRate: 70,
    avgRR: 2.5,
    bestTimeframes: ['1H', '4H'],
    goodTimeframes: ['15m', '30m', '1D'],
    cautionTimeframes: ['5m'],
  },

  BEAR_FLAG: {
    tier: 'TIER3',
    implemented: true,
    signal: 'BEARISH',
    direction: 'SHORT',
    type: 'CONTINUATION',
    color: '#FF4757',
    icon: '🔻',
    label: 'SHORT',
    fullLabel: 'BEARISH CONTINUATION',
    description: 'Cờ giảm tiếp tục',
    expectedWinRate: 69,
    avgRR: 2.4,
    bestTimeframes: ['1H', '4H'],
    goodTimeframes: ['15m', '30m', '1D'],
    cautionTimeframes: ['5m'],
  },

  WEDGE: {
    tier: 'TIER3',
    implemented: true,
    signal: 'NEUTRAL',
    direction: 'REVERSAL',
    type: 'REVERSAL',
    color: '#FFBD59',
    icon: '⚡',
    label: 'REVERSAL',
    fullLabel: 'REVERSAL PATTERN',
    description: 'Wedge tăng/giảm đảo chiều',
    expectedWinRate: 64,
    avgRR: 2.1,
    bestTimeframes: ['4H', '1D'],
    goodTimeframes: ['1H', '12H'],
    cautionTimeframes: ['15m', '30m'],
  },

  CUP_HANDLE: {
    tier: 'TIER3',
    implemented: true,
    signal: 'BULLISH',
    direction: 'LONG',
    type: 'CONTINUATION',
    color: '#3AF7A6',
    icon: '🔺',
    label: 'LONG',
    fullLabel: 'BULLISH CONTINUATION',
    description: 'Cốc quai tiếp tục tăng',
    expectedWinRate: 72,
    avgRR: 3.0,
    bestTimeframes: ['1D', '1W'],
    goodTimeframes: ['4H', '12H'],
    cautionTimeframes: ['1H'],
  },

  ENGULFING: {
    tier: 'TIER3',
    implemented: true,
    signal: 'NEUTRAL',
    direction: 'REVERSAL',
    type: 'REVERSAL',
    color: '#FFBD59',
    icon: '⚡',
    label: 'REVERSAL',
    fullLabel: 'REVERSAL PATTERN',
    description: 'Nến bao phủ đảo chiều',
    expectedWinRate: 64,
    avgRR: 2.1,
    bestTimeframes: ['4H', '1D'],
    goodTimeframes: ['1H', '12H'],
    cautionTimeframes: ['15m', '30m'],
  },

  MORNING_EVENING_STAR: {
    tier: 'TIER3',
    implemented: true,
    signal: 'NEUTRAL',
    direction: 'REVERSAL',
    type: 'REVERSAL',
    color: '#FFBD59',
    icon: '⚡',
    label: 'REVERSAL',
    fullLabel: 'REVERSAL PATTERN',
    description: 'Sao mai/tối 3 nến đảo chiều',
    expectedWinRate: 66,
    avgRR: 2.3,
    bestTimeframes: ['1D', '1W'],
    goodTimeframes: ['4H', '12H'],
    cautionTimeframes: ['1H'],
  },

  THREE_METHODS: {
    tier: 'TIER3',
    implemented: true,
    signal: 'NEUTRAL',
    direction: 'CONTINUATION',
    type: 'CONTINUATION',
    color: '#FFBD59',
    icon: '⚡',
    label: 'CONTINUATION',
    fullLabel: 'CONTINUATION PATTERN',
    description: '3 phương pháp tăng/giảm',
    expectedWinRate: 67,
    avgRR: 2.4,
    bestTimeframes: ['1D', '1W'],
    goodTimeframes: ['4H', '12H'],
    cautionTimeframes: ['1H'],
  },

  HAMMER: {
    tier: 'TIER3',
    implemented: true,
    signal: 'NEUTRAL',
    direction: 'REVERSAL',
    type: 'REVERSAL',
    color: '#FFBD59',
    icon: '⚡',
    label: 'REVERSAL',
    fullLabel: 'REVERSAL PATTERN',
    description: 'Búa/Búa ngược đảo chiều',
    expectedWinRate: 62,
    avgRR: 2.0,
    bestTimeframes: ['1D', '1W'],
    goodTimeframes: ['4H', '12H'],
    cautionTimeframes: ['1H'],
  },

  FLAG: {
    tier: 'TIER3',
    implemented: true,
    signal: 'NEUTRAL',
    direction: 'CONTINUATION',
    type: 'CONTINUATION',
    color: '#FFBD59',
    icon: '⚡',
    label: 'CONTINUATION',
    fullLabel: 'CONTINUATION PATTERN',
    description: 'Cờ generic tiếp tục trend',
    expectedWinRate: 65,
    avgRR: 2.2,
    bestTimeframes: ['1H', '4H'],
    goodTimeframes: ['15m', '30m', '1D'],
    cautionTimeframes: ['5m'],
  },
};

// ========================================
// PATTERN ALIASES - Support Multiple Formats
// ========================================

export const PATTERN_ALIASES = {
  // Head & Shoulders variations
  'HEAD SHOULDERS': 'HEAD_SHOULDERS',
  'HEAD AND SHOULDERS': 'HEAD_SHOULDERS',
  'HEADSHOULDERS': 'HEAD_SHOULDERS',
  'H&S': 'HEAD_SHOULDERS',
  'HS': 'HEAD_SHOULDERS',

  // Inverse Head & Shoulders
  'INVERSE HEAD SHOULDERS': 'INVERSE_HEAD_SHOULDERS',
  'INVERSE HEAD AND SHOULDERS': 'INVERSE_HEAD_SHOULDERS',
  'INVERSE H&S': 'INVERSE_HEAD_SHOULDERS',
  'IHS': 'INVERSE_HEAD_SHOULDERS',

  // Double patterns
  'DOUBLE TOP': 'DOUBLE_TOP',
  'DOUBLETOP': 'DOUBLE_TOP',
  'DOUBLE BOTTOM': 'DOUBLE_BOTTOM',
  'DOUBLEBOTTOM': 'DOUBLE_BOTTOM',

  // Triangles
  'TRIANGLE': 'SYMMETRICAL_TRIANGLE',
  'ASCENDING TRIANGLE': 'ASCENDING_TRIANGLE',
  'ASCENDINGTRIANGLE': 'ASCENDING_TRIANGLE',
  'DESCENDING TRIANGLE': 'DESCENDING_TRIANGLE',
  'DESCENDINGTRIANGLE': 'DESCENDING_TRIANGLE',
  'SYMMETRICAL TRIANGLE': 'SYMMETRICAL_TRIANGLE',
  'SYMMETRICALTRIANGLE': 'SYMMETRICAL_TRIANGLE',

  // Rounding patterns
  'ROUNDING BOTTOM': 'ROUNDING_BOTTOM',
  'ROUNDING TOP': 'ROUNDING_TOP',

  // Flags
  'BULL FLAG': 'BULL_FLAG',
  'BULLFLAG': 'BULL_FLAG',
  'BEAR FLAG': 'BEAR_FLAG',
  'BEARFLAG': 'BEAR_FLAG',

  // Cup & Handle
  'CUP HANDLE': 'CUP_HANDLE',
  'CUP AND HANDLE': 'CUP_HANDLE',
  'CUP&HANDLE': 'CUP_HANDLE',
  'CUPHANDLE': 'CUP_HANDLE',

  // Stars
  'MORNING EVENING STAR': 'MORNING_EVENING_STAR',
  'MORNING/EVENING STAR': 'MORNING_EVENING_STAR',
  'MORNING STAR': 'MORNING_EVENING_STAR',
  'EVENING STAR': 'MORNING_EVENING_STAR',

  // Methods
  'THREE METHODS': 'THREE_METHODS',
  '3 METHODS': 'THREE_METHODS',
  '3METHODS': 'THREE_METHODS',
  'THREEMETHODS': 'THREE_METHODS',
  'RISING THREE METHODS': 'THREE_METHODS',
  'FALLING THREE METHODS': 'THREE_METHODS',
};

/**
 * Normalize pattern type - convert to uppercase and replace spaces with underscores
 */
const normalizePatternType = (patternType) => {
  if (!patternType) return '';
  return patternType.toString().toUpperCase().trim().replace(/\s+/g, '_');
};

/**
 * Resolve pattern type with aliases support
 * @param {string} patternType - Input pattern type (any format)
 * @returns {string} - Canonical pattern type or 'UNKNOWN'
 */
export const resolvePatternType = (patternType) => {
  if (!patternType) return 'UNKNOWN';

  // Normalize input (UPPERCASE with underscores)
  const normalized = normalizePatternType(patternType);

  // Check if exists directly in PATTERN_SIGNALS
  if (PATTERN_SIGNALS[normalized]) {
    return normalized;
  }

  // Check aliases (try uppercase version)
  const upperType = patternType.toString().toUpperCase().trim();
  if (PATTERN_ALIASES[upperType]) {
    return PATTERN_ALIASES[upperType];
  }

  // Try with underscores replaced by spaces (for 'DOUBLE_TOP' → 'DOUBLE TOP')
  const withSpaces = normalized.replace(/_/g, ' ');
  if (PATTERN_ALIASES[withSpaces]) {
    return PATTERN_ALIASES[withSpaces];
  }

  return 'UNKNOWN';
};

/**
 * Get pattern signal info by type (with alias resolution)
 * @param {string} patternType - Pattern type (any format supported)
 * @returns {Object} - Pattern signal info with expectedWinRate and avgRR
 */
export const getPatternSignal = (patternType) => {
  const resolved = resolvePatternType(patternType);

  return PATTERN_SIGNALS[resolved] || {
    signal: 'NEUTRAL',
    direction: 'UNKNOWN',
    type: 'UNKNOWN',
    color: '#94A3B8',
    icon: '⚪',
    label: 'UNKNOWN',
    fullLabel: 'UNKNOWN PATTERN',
    description: `Pattern "${patternType}" không tìm thấy`,
    expectedWinRate: 50,
    avgRR: 1.0,
    bestTimeframes: ['1D'],
    goodTimeframes: ['4H'],
    cautionTimeframes: ['1H'],
  };
};

/**
 * Get timeframe quality for current TF
 */
export const getTimeframeQuality = (patternType, currentTimeframe) => {
  if (!patternType || !currentTimeframe) return 'CAUTION';

  const signalInfo = getPatternSignal(patternType);
  const tf = currentTimeframe.toUpperCase();

  if (signalInfo.bestTimeframes?.includes(tf)) {
    return 'BEST';
  }

  if (signalInfo.goodTimeframes?.includes(tf)) {
    return 'GOOD';
  }

  return 'CAUTION';
};

/**
 * Get expected win rate for pattern type
 */
export const getExpectedWinRate = (patternType) => {
  const signal = getPatternSignal(patternType);
  return signal.expectedWinRate || 60;
};

/**
 * Get average Risk:Reward for pattern type
 */
export const getAverageRR = (patternType) => {
  const signal = getPatternSignal(patternType);
  return signal.avgRR || 2.0;
};

// ========================================
// PATTERN STATES
// ========================================

export const PATTERN_STATES = {
  FRESH: {
    label: 'FRESH',
    emoji: '🆕',
    color: '#00FF88',
    bgColor: 'rgba(0, 255, 136, 0.15)',
    description: 'Mới phát hiện',
    shouldShow: true,
    canTrade: false,
    dimmed: false
  },

  WAITING: {
    label: 'WAITING',
    emoji: '⏳',
    color: '#FFBD59',
    bgColor: 'rgba(255, 189, 89, 0.15)',
    description: 'Chờ retest',
    shouldShow: true,
    canTrade: false,
    dimmed: false
  },

  WAITING_RETEST: {
    label: 'WAITING',
    emoji: '⏳',
    color: '#FFBD59',
    bgColor: 'rgba(255, 189, 89, 0.15)',
    description: 'Chờ retest',
    shouldShow: true,
    canTrade: false,
    dimmed: false
  },

  ACTIVE: {
    label: 'ACTIVE',
    emoji: '✅',
    color: '#00FF88',
    bgColor: 'rgba(0, 255, 136, 0.2)',
    description: 'Có thể trade',
    shouldShow: true,
    canTrade: true,
    dimmed: false,
    highlight: true,
    pulse: true
  },

  MISSED: {
    label: 'MISSED',
    emoji: '❌',
    color: '#6B7280',
    bgColor: 'rgba(107, 114, 128, 0.15)',
    description: 'Đã bỏ lỡ',
    shouldShow: false,
    canTrade: false,
    dimmed: true
  },

  STOPPED: {
    label: 'STOPPED',
    emoji: '🛑',
    color: '#FF4757',
    bgColor: 'rgba(255, 71, 87, 0.15)',
    description: 'Hit stop loss',
    shouldShow: true,
    canTrade: false,
    dimmed: true
  },

  STOPPED_OUT: {
    label: 'STOPPED',
    emoji: '🛑',
    color: '#FF4757',
    bgColor: 'rgba(255, 71, 87, 0.15)',
    description: 'Hit stop loss',
    shouldShow: true,
    canTrade: false,
    dimmed: true
  },

  TARGET_HIT: {
    label: 'COMPLETED',
    emoji: '🎯',
    color: '#00FF88',
    bgColor: 'rgba(0, 255, 136, 0.15)',
    description: 'Đạt target',
    shouldShow: true,
    canTrade: false,
    dimmed: true
  },

  EXPIRED: {
    label: 'EXPIRED',
    emoji: '⌛',
    color: '#6B7280',
    bgColor: 'rgba(107, 114, 128, 0.15)',
    description: 'Hết hạn',
    shouldShow: false,
    canTrade: false,
    dimmed: true
  }
};

/**
 * Get pattern state info
 */
export const getPatternState = (stateName) => {
  return PATTERN_STATES[stateName] || PATTERN_STATES.FRESH;
};

/**
 * Get patterns available for user tier
 */
export const getPatternsByTier = (userTier) => {
  const allPatterns = Object.entries(PATTERN_SIGNALS);

  switch(userTier) {
    case 'FREE':
      return allPatterns.filter(([_, info]) =>
        info.tier === 'FREE' && info.implemented
      );

    case 'TIER1':
      return allPatterns.filter(([_, info]) =>
        (info.tier === 'FREE' || info.tier === 'TIER1') && info.implemented
      );

    case 'TIER2':
      return allPatterns.filter(([_, info]) =>
        (info.tier === 'FREE' || info.tier === 'TIER1' || info.tier === 'TIER2') &&
        info.implemented
      );

    case 'TIER3':
    case 'ADMIN':
      return allPatterns.filter(([_, info]) => info.implemented);

    default:
      return [];
  }
};

/**
 * Check if user has access to pattern
 */
export const hasPatternAccess = (patternType, userTier) => {
  const pattern = PATTERN_SIGNALS[patternType];
  if (!pattern) return false;

  if (!pattern.implemented) return false;

  const tierLevel = {
    'FREE': 0,
    'TIER1': 1,
    'TIER2': 2,
    'TIER3': 3,
    'ADMIN': 4
  };

  const requiredLevel = tierLevel[pattern.tier] || 0;
  const userLevel = tierLevel[userTier] || 0;

  return userLevel >= requiredLevel;
};

/**
 * Get pattern count by tier
 */
export const getPatternCountByTier = () => {
  const counts = { FREE: 0, TIER1: 0, TIER2: 0, TIER3: 0 };

  Object.values(PATTERN_SIGNALS).forEach(p => {
    if (p.implemented && counts[p.tier] !== undefined) {
      counts[p.tier]++;
    }
  });

  return {
    FREE: counts.FREE,
    TIER1: counts.FREE + counts.TIER1,
    TIER2: counts.FREE + counts.TIER1 + counts.TIER2,
    TIER3: counts.FREE + counts.TIER1 + counts.TIER2 + counts.TIER3
  };
};

export default PATTERN_SIGNALS;
