/**
 * GEM Mobile - Odds Enhancers Configuration
 * 8 scoring criteria for zone quality assessment
 *
 * Phase 1C: Odds Enhancers + Freshness Tracking
 *
 * Each criterion scores 0-2 points
 * Total max score: 16 points
 * Grade: A+ (14-16) to F (0-5)
 */

// ═══════════════════════════════════════════════════════════
// 8 ODDS ENHANCERS
// ═══════════════════════════════════════════════════════════

export const ODDS_ENHANCERS = {
  // ===== 1. DEPARTURE STRENGTH =====
  DEPARTURE_STRENGTH: {
    id: 'departure_strength',
    name: 'Sức Mạnh Thoát Ly',
    nameEn: 'Departure Strength',
    description: 'Độ mạnh của nến rời khỏi zone',
    maxScore: 2,
    icon: 'Zap',
    criteria: {
      0: 'Nến yếu, body nhỏ, nhiều wick',
      1: 'Nến trung bình, body >= 50% range',
      2: 'Nến mạnh, body >= 70% range, ít wick, gap up/down',
    },
    calculate: (departureCandle, avgCandleSize) => {
      if (!departureCandle) return 0;
      const bodySize = Math.abs(departureCandle.close - departureCandle.open);
      const totalRange = departureCandle.high - departureCandle.low;
      const bodyRatio = totalRange > 0 ? bodySize / totalRange : 0;
      const sizeRatio = avgCandleSize > 0 ? totalRange / avgCandleSize : 1;

      if (bodyRatio >= 0.7 && sizeRatio >= 1.5) return 2;
      if (bodyRatio >= 0.5 && sizeRatio >= 1.0) return 1;
      return 0;
    },
  },

  // ===== 2. TIME AT LEVEL =====
  TIME_AT_LEVEL: {
    id: 'time_at_level',
    name: 'Thời Gian Tại Vùng',
    nameEn: 'Time at Level',
    description: 'Số nến trong vùng pause (ít = tốt)',
    maxScore: 2,
    icon: 'Clock',
    criteria: {
      0: '> 6 nến (quá lâu, orders có thể đã fill)',
      1: '3-6 nến (bình thường)',
      2: '1-2 nến (rất ít thời gian = fresh orders)',
    },
    calculate: (pauseCandleCount) => {
      if (pauseCandleCount <= 2) return 2;
      if (pauseCandleCount <= 6) return 1;
      return 0;
    },
  },

  // ===== 3. FRESHNESS =====
  FRESHNESS: {
    id: 'freshness',
    name: 'Độ Tươi Mới',
    nameEn: 'Freshness',
    description: 'Số lần zone đã được test',
    maxScore: 2,
    icon: 'Star',
    criteria: {
      0: 'Test 3+ lần (stale, < 30% orders left)',
      1: 'Test 1-2 lần (60-70% orders left)',
      2: 'Chưa test / FTB (100% orders, fresh)',
    },
    calculate: (testCount) => {
      if (testCount === 0) return 2;
      if (testCount <= 2) return 1;
      return 0;
    },
  },

  // ===== 4. PROFIT MARGIN =====
  PROFIT_MARGIN: {
    id: 'profit_margin',
    name: 'Biên Lợi Nhuận',
    nameEn: 'Profit Margin',
    description: 'Khoảng cách đến opposing zone (room to move)',
    maxScore: 2,
    icon: 'TrendingUp',
    criteria: {
      0: '< 2x zone width (không đủ room)',
      1: '2-4x zone width (đủ room)',
      2: '> 4x zone width hoặc clear path (tuyệt vời)',
    },
    calculate: (distanceToOpposing, zoneWidth) => {
      if (!distanceToOpposing || !zoneWidth || zoneWidth === 0) return 1;
      const ratio = distanceToOpposing / zoneWidth;
      if (ratio >= 4) return 2;
      if (ratio >= 2) return 1;
      return 0;
    },
  },

  // ===== 5. BIG PICTURE / CURVE =====
  BIG_PICTURE: {
    id: 'big_picture',
    name: 'Xu Hướng Lớn',
    nameEn: 'Big Picture / Curve',
    description: 'Zone cùng hướng với trend HTF',
    maxScore: 2,
    icon: 'Globe',
    criteria: {
      0: 'Ngược trend HTF',
      1: 'Không rõ trend HTF',
      2: 'Cùng hướng trend HTF',
    },
    calculate: (zoneType, htfTrend) => {
      if (!htfTrend || htfTrend === 'unknown' || htfTrend === 'sideways') return 1;

      const aligned =
        (zoneType === 'LFZ' && htfTrend === 'uptrend') ||
        (zoneType === 'HFZ' && htfTrend === 'downtrend');

      if (aligned) return 2;
      return 0;
    },
  },

  // ===== 6. ZONE ORIGIN =====
  ZONE_ORIGIN: {
    id: 'zone_origin',
    name: 'Nguồn Gốc Zone',
    nameEn: 'Zone Origin',
    description: 'Loại zone (DP > FTR > FL > Regular)',
    maxScore: 2,
    icon: 'Layers',
    criteria: {
      0: 'Regular zone (DPD/UPU)',
      1: 'FTR hoặc Flag Limit',
      2: 'Decision Point hoặc QM',
    },
    calculate: (patternCategory, zoneHierarchy) => {
      if (zoneHierarchy === 1 || patternCategory === 'decision_point' || patternCategory === 'quasimodo') return 2;
      if (zoneHierarchy === 2 || zoneHierarchy === 3 || patternCategory === 'ftr' || patternCategory === 'flag_limit') return 1;
      return 0;
    },
  },

  // ===== 7. ARRIVAL SPEED =====
  ARRIVAL_SPEED: {
    id: 'arrival_speed',
    name: 'Tốc Độ Tiếp Cận',
    nameEn: 'Arrival Speed',
    description: 'Giá tiếp cận zone nhanh hay chậm',
    maxScore: 2,
    icon: 'FastForward',
    criteria: {
      0: 'Nhanh, mạnh (momentum vào zone = có thể break)',
      1: 'Bình thường',
      2: 'Chậm, yếu dần (compression = tốt cho reversal)',
    },
    calculate: (arrivalCandles, avgCandleSize) => {
      if (!arrivalCandles || arrivalCandles.length < 3) return 1;

      // Check if candles are getting smaller (slowing down)
      const sizes = arrivalCandles.map(c => c.high - c.low);
      const recentAvg = sizes.slice(-3).reduce((a, b) => a + b, 0) / 3;
      const olderAvg = sizes.slice(0, Math.min(3, sizes.length)).reduce((a, b) => a + b, 0) / Math.min(3, sizes.length);

      if (olderAvg === 0) return 1;
      if (recentAvg < olderAvg * 0.7) return 2; // Slowing down
      if (recentAvg > olderAvg * 1.3) return 0; // Speeding up
      return 1;
    },
  },

  // ===== 8. RISK/REWARD =====
  RISK_REWARD: {
    id: 'risk_reward',
    name: 'Tỷ Lệ R:R',
    nameEn: 'Risk/Reward',
    description: 'Tỷ lệ lợi nhuận / rủi ro',
    maxScore: 2,
    icon: 'Scale',
    criteria: {
      0: '< 2:1 (không nên trade)',
      1: '2:1 - 3:1 (chấp nhận được)',
      2: '> 3:1 (tuyệt vời)',
    },
    calculate: (riskRewardRatio) => {
      if (!riskRewardRatio || riskRewardRatio < 2) return 0;
      if (riskRewardRatio >= 3) return 2;
      return 1;
    },
  },
};

// ═══════════════════════════════════════════════════════════
// GRADE THRESHOLDS
// ═══════════════════════════════════════════════════════════

export const GRADE_THRESHOLDS = {
  'A+': { min: 14, max: 16, color: '#22C55E', description: 'Xuất sắc - Full size position' },
  'A': { min: 12, max: 13, color: '#84CC16', description: 'Tốt - 75% size position' },
  'B': { min: 10, max: 11, color: '#FFBD59', description: 'Khá - 50% size position' },
  'C': { min: 8, max: 9, color: '#F97316', description: 'Trung bình - Chỉ trade với confluence' },
  'D': { min: 6, max: 7, color: '#EF4444', description: 'Yếu - Cân nhắc skip' },
  'F': { min: 0, max: 5, color: '#DC2626', description: 'Rất yếu - SKIP' },
};

// ═══════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════

/**
 * Get grade info from score
 * @param {number} score - Total score (0-16)
 * @returns {Object} Grade info with grade, color, description
 */
export const getGradeFromScore = (score) => {
  const numScore = Number(score) || 0;
  for (const [grade, config] of Object.entries(GRADE_THRESHOLDS)) {
    if (numScore >= config.min && numScore <= config.max) {
      return { grade, ...config };
    }
  }
  return { grade: 'F', ...GRADE_THRESHOLDS['F'] };
};

/**
 * Check if score is tradeable (>= C grade)
 * @param {number} score - Total score
 * @returns {boolean}
 */
export const isTradeableScore = (score) => {
  return Number(score) >= 8;
};

/**
 * Get position size recommendation based on grade
 * @param {string} grade - Grade string
 * @returns {number} Position size percent (0-100)
 */
export const getPositionSizeFromGrade = (grade) => {
  const sizes = {
    'A+': 100,
    'A': 75,
    'B': 50,
    'C': 25,
    'D': 0,
    'F': 0,
  };
  return sizes[grade] || 0;
};

/**
 * Get trade advice based on grade
 * @param {string} grade - Grade string
 * @returns {string} Trade advice text
 */
export const getTradeAdvice = (grade) => {
  const advice = {
    'A+': 'Trade với full confidence. Setup xuất sắc.',
    'A': 'Trade tốt. Có thể entry với 75% size.',
    'B': 'Trade được. Chờ thêm confirmation hoặc giảm size.',
    'C': 'Cần confluence. Chỉ trade nếu có thêm yếu tố hỗ trợ.',
    'D': 'Cân nhắc skip. Risk cao.',
    'F': 'SKIP. Không trade setup này.',
  };
  return advice[grade] || advice['F'];
};

/**
 * Get all enhancer IDs
 * @returns {Array<string>}
 */
export const getEnhancerIds = () => {
  return Object.keys(ODDS_ENHANCERS).map(k => ODDS_ENHANCERS[k].id);
};

/**
 * Get enhancer by ID
 * @param {string} id - Enhancer ID
 * @returns {Object|null}
 */
export const getEnhancerById = (id) => {
  return Object.values(ODDS_ENHANCERS).find(e => e.id === id) || null;
};

// ═══════════════════════════════════════════════════════════
// DEFAULT EXPORT
// ═══════════════════════════════════════════════════════════

export default {
  ODDS_ENHANCERS,
  GRADE_THRESHOLDS,
  getGradeFromScore,
  isTradeableScore,
  getPositionSizeFromGrade,
  getTradeAdvice,
  getEnhancerIds,
  getEnhancerById,
};
