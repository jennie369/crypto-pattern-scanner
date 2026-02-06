/**
 * GEM Mobile - Odds Enhancers Service
 * Calculate all 8 Odds Enhancers scores for zone quality assessment
 *
 * Phase 1C: Odds Enhancers + Freshness Tracking
 */

import { supabase } from './supabase';
import {
  ODDS_ENHANCERS,
  getGradeFromScore,
  isTradeableScore,
  getPositionSizeFromGrade,
  getTradeAdvice,
} from '../constants/oddsEnhancersConfig';

// ═══════════════════════════════════════════════════════════
// MAIN SCORING FUNCTION
// ═══════════════════════════════════════════════════════════

/**
 * Calculate all 8 Odds Enhancers for a zone/pattern
 * @param {Object} zoneData - Zone information
 * @param {Object} marketData - Market/candle data
 * @returns {Object} Complete score breakdown
 */
export const calculateOddsEnhancers = (zoneData, marketData = {}) => {
  const scores = {};
  let totalScore = 0;

  // 1. Departure Strength
  scores.departure_strength = ODDS_ENHANCERS.DEPARTURE_STRENGTH.calculate(
    marketData.departureCandle,
    marketData.avgCandleSize
  );
  totalScore += scores.departure_strength;

  // 2. Time at Level
  scores.time_at_level = ODDS_ENHANCERS.TIME_AT_LEVEL.calculate(
    zoneData.pauseCandleCount || 3 // Default middle score
  );
  totalScore += scores.time_at_level;

  // 3. Freshness
  scores.freshness = ODDS_ENHANCERS.FRESHNESS.calculate(
    zoneData.testCount || 0
  );
  totalScore += scores.freshness;

  // 4. Profit Margin
  scores.profit_margin = ODDS_ENHANCERS.PROFIT_MARGIN.calculate(
    marketData.distanceToOpposing,
    zoneData.zoneWidth
  );
  totalScore += scores.profit_margin;

  // 5. Big Picture / Curve
  scores.big_picture = ODDS_ENHANCERS.BIG_PICTURE.calculate(
    zoneData.zoneType,
    marketData.htfTrend
  );
  totalScore += scores.big_picture;

  // 6. Zone Origin
  scores.zone_origin = ODDS_ENHANCERS.ZONE_ORIGIN.calculate(
    zoneData.patternCategory,
    zoneData.zoneHierarchy
  );
  totalScore += scores.zone_origin;

  // 7. Arrival Speed
  scores.arrival_speed = ODDS_ENHANCERS.ARRIVAL_SPEED.calculate(
    marketData.arrivalCandles,
    marketData.avgCandleSize
  );
  totalScore += scores.arrival_speed;

  // 8. Risk/Reward
  scores.risk_reward = ODDS_ENHANCERS.RISK_REWARD.calculate(
    zoneData.riskRewardRatio
  );
  totalScore += scores.risk_reward;

  // Get grade info
  const gradeInfo = getGradeFromScore(totalScore);
  const positionSize = getPositionSizeFromGrade(gradeInfo.grade);
  const advice = getTradeAdvice(gradeInfo.grade);

  return {
    scores,
    totalScore,
    maxScore: 16,
    grade: gradeInfo.grade,
    gradeColor: gradeInfo.color,
    gradeDescription: gradeInfo.description,
    isTradeable: isTradeableScore(totalScore),
    positionSizePercent: positionSize,
    advice,
    breakdown: buildScoreBreakdown(scores),
    calculatedAt: new Date().toISOString(),
  };
};

// ═══════════════════════════════════════════════════════════
// SCORE BREAKDOWN HELPER
// ═══════════════════════════════════════════════════════════

/**
 * Build detailed breakdown for UI display
 * @param {Object} scores - Individual scores
 * @returns {Array} Breakdown array for display
 */
const buildScoreBreakdown = (scores) => {
  return Object.entries(ODDS_ENHANCERS).map(([key, enhancer]) => {
    const score = scores[enhancer.id] || 0;
    return {
      id: enhancer.id,
      name: enhancer.name,
      nameEn: enhancer.nameEn,
      icon: enhancer.icon,
      score,
      maxScore: enhancer.maxScore,
      criteria: enhancer.criteria[score] || enhancer.criteria[0],
      percentage: (score / enhancer.maxScore) * 100,
    };
  });
};

// ═══════════════════════════════════════════════════════════
// QUICK SCORE FOR PATTERN CARDS
// ═══════════════════════════════════════════════════════════

/**
 * Quick score calculation for pattern list display
 * Uses simplified inputs when full market data isn't available
 * @param {Object} pattern - Pattern from scanner
 * @returns {Object} Quick score result
 */
export const calculateQuickScore = (pattern) => {
  const zoneData = {
    zoneType: pattern.zone_type || pattern.zoneType,
    patternCategory: pattern.pattern_category || 'basic',
    zoneHierarchy: getHierarchyFromCategory(pattern.pattern_category),
    testCount: pattern.zone_test_count || pattern.testCount || 0,
    pauseCandleCount: pattern.pause_candle_count || 3,
    zoneWidth: pattern.zone_width,
    riskRewardRatio: pattern.risk_reward || calculateRRFromPattern(pattern),
  };

  const marketData = {
    htfTrend: pattern.htf_trend || 'unknown',
    distanceToOpposing: null, // Not available in quick mode
  };

  return calculateOddsEnhancers(zoneData, marketData);
};

/**
 * Get hierarchy level from pattern category
 */
const getHierarchyFromCategory = (category) => {
  const hierarchy = {
    decision_point: 1,
    quasimodo: 1,
    ftr: 2,
    flag_limit: 3,
    basic: 4,
  };
  return hierarchy[category] || 4;
};

/**
 * Calculate R:R ratio from pattern data
 */
const calculateRRFromPattern = (pattern) => {
  const entry = pattern.entry_price || pattern.entryPrice;
  const stop = pattern.stop_price || pattern.stopPrice;
  const tp = pattern.take_profit || pattern.takeProfit;

  if (!entry || !stop || !tp) return 2; // Default middle score

  const risk = Math.abs(entry - stop);
  const reward = Math.abs(tp - entry);

  return risk > 0 ? reward / risk : 2;
};

// ═══════════════════════════════════════════════════════════
// SUPABASE OPERATIONS
// ═══════════════════════════════════════════════════════════

/**
 * Save pattern scores to Supabase
 * @param {string} userId - User ID
 * @param {string} symbol - Trading pair
 * @param {string} timeframe - Timeframe
 * @param {Object} scoreResult - Result from calculateOddsEnhancers
 * @param {string} zoneHistoryId - Optional zone history reference
 * @returns {Object} Saved record
 */
export const savePatternScore = async (userId, symbol, timeframe, scoreResult, zoneHistoryId = null) => {
  try {
    const { data, error } = await supabase
      .from('pattern_scores')
      .insert({
        user_id: userId,
        zone_history_id: zoneHistoryId,
        symbol,
        timeframe,
        departure_strength: scoreResult.scores.departure_strength,
        time_at_level: scoreResult.scores.time_at_level,
        freshness_score: scoreResult.scores.freshness,
        profit_margin: scoreResult.scores.profit_margin,
        big_picture: scoreResult.scores.big_picture,
        zone_origin: scoreResult.scores.zone_origin,
        arrival_speed: scoreResult.scores.arrival_speed,
        risk_reward: scoreResult.scores.risk_reward,
        total_score: scoreResult.totalScore,
        grade: scoreResult.grade,
        is_tradeable: scoreResult.isTradeable,
        score_breakdown: scoreResult.breakdown,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('[OddsEnhancers] Error saving score:', error);
    return null;
  }
};

/**
 * Get pattern scores for a user
 * @param {string} userId - User ID
 * @param {Object} filters - Optional filters
 * @returns {Array} Score records
 */
export const getPatternScores = async (userId, filters = {}) => {
  try {
    let query = supabase
      .from('pattern_scores')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (filters.symbol) {
      query = query.eq('symbol', filters.symbol);
    }
    if (filters.grade) {
      query = query.eq('grade', filters.grade);
    }
    if (filters.minScore) {
      query = query.gte('total_score', filters.minScore);
    }
    if (filters.limit) {
      query = query.limit(filters.limit);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('[OddsEnhancers] Error fetching scores:', error);
    return [];
  }
};

/**
 * Get score statistics for analytics
 * @param {string} userId - User ID
 * @returns {Object} Statistics
 */
export const getScoreStatistics = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('pattern_scores')
      .select('total_score, grade, is_tradeable')
      .eq('user_id', userId);

    if (error) throw error;
    if (!data || data.length === 0) {
      return {
        totalPatterns: 0,
        averageScore: 0,
        gradeDistribution: {},
        tradeablePercent: 0,
      };
    }

    const gradeCount = {};
    let totalScore = 0;
    let tradeableCount = 0;

    data.forEach((record) => {
      totalScore += record.total_score;
      gradeCount[record.grade] = (gradeCount[record.grade] || 0) + 1;
      if (record.is_tradeable) tradeableCount++;
    });

    return {
      totalPatterns: data.length,
      averageScore: (totalScore / data.length).toFixed(1),
      gradeDistribution: gradeCount,
      tradeablePercent: ((tradeableCount / data.length) * 100).toFixed(1),
    };
  } catch (error) {
    console.error('[OddsEnhancers] Error fetching statistics:', error);
    return null;
  }
};

// ═══════════════════════════════════════════════════════════
// UPDATE POSITION/TRADE WITH SCORES
// ═══════════════════════════════════════════════════════════

/**
 * Update a paper position with odds score
 * @param {string} positionId - Position ID
 * @param {Object} scoreResult - Score result
 * @param {string} freshnessStatus - fresh, tested, stale
 * @param {boolean} isFTB - Is First Time Back
 */
export const updatePositionWithScore = async (positionId, scoreResult, freshnessStatus = 'fresh', isFTB = false) => {
  try {
    const { error } = await supabase
      .from('paper_positions')
      .update({
        odds_score: scoreResult.totalScore,
        odds_grade: scoreResult.grade,
        freshness_status: freshnessStatus,
        is_ftb: isFTB,
        updated_at: new Date().toISOString(),
      })
      .eq('id', positionId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('[OddsEnhancers] Error updating position:', error);
    return false;
  }
};

/**
 * Update a pending order with odds score
 * @param {string} orderId - Order ID
 * @param {Object} scoreResult - Score result
 * @param {string} freshnessStatus - fresh, tested, stale
 * @param {boolean} isFTB - Is First Time Back
 */
export const updatePendingOrderWithScore = async (orderId, scoreResult, freshnessStatus = 'fresh', isFTB = false) => {
  try {
    const { error } = await supabase
      .from('paper_pending_orders')
      .update({
        odds_score: scoreResult.totalScore,
        odds_grade: scoreResult.grade,
        freshness_status: freshnessStatus,
        is_ftb: isFTB,
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('[OddsEnhancers] Error updating pending order:', error);
    return false;
  }
};

// ═══════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════

export default {
  calculateOddsEnhancers,
  calculateQuickScore,
  savePatternScore,
  getPatternScores,
  getScoreStatistics,
  updatePositionWithScore,
  updatePendingOrderWithScore,
};
