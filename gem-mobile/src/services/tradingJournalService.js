/**
 * Trading Journal Service - Specialized trading journal with metrics
 * Part of Calendar Smart Journal System
 *
 * Created: January 28, 2026
 */

import { supabase } from './supabase';
import { checkCalendarAccess, getTradingDailyLimit, getTradingScreenshotLimit } from '../config/calendarAccessControl';

const SERVICE_NAME = '[TradingJournalService]';

// ==================== CONSTANTS ====================

export const TRADE_DIRECTIONS = {
  LONG: 'long',
  SHORT: 'short',
};

export const TRADE_RESULTS = {
  WIN: 'win',
  LOSS: 'loss',
  BREAKEVEN: 'breakeven',
  OPEN: 'open',
  CANCELLED: 'cancelled',
};

export const PATTERN_TYPES = [
  { id: 'DPD', name: 'DPD (Demand > Pullback > Demand)', category: 'zone_retest' },
  { id: 'UPU', name: 'UPU (Supply > Pullback > Supply)', category: 'zone_retest' },
  { id: 'DBD', name: 'DBD (Drop-Base-Drop)', category: 'continuation' },
  { id: 'RBR', name: 'RBR (Rally-Base-Rally)', category: 'continuation' },
  { id: 'DBR', name: 'DBR (Drop-Base-Rally)', category: 'reversal' },
  { id: 'RBD', name: 'RBD (Rally-Base-Drop)', category: 'reversal' },
  { id: 'head-shoulders', name: 'Head & Shoulders', category: 'reversal' },
  { id: 'double-top', name: 'Double Top', category: 'reversal' },
  { id: 'double-bottom', name: 'Double Bottom', category: 'reversal' },
  { id: 'breakout', name: 'Breakout', category: 'momentum' },
  { id: 'other', name: 'Khac', category: 'other' },
];

export const PATTERN_GRADES = ['A+', 'A', 'B', 'C', 'D'];

export const TIMEFRAMES = ['1m', '5m', '15m', '30m', '1h', '4h', '1d', '1w'];

export const ZONE_TYPES = [
  { id: 'demand', name: 'Demand Zone', color: '#3AF7A6' },
  { id: 'supply', name: 'Supply Zone', color: '#FF6B6B' },
  { id: 'flip', name: 'Flip Zone', color: '#FFD700' },
];

export const TRADE_EMOTIONS = [
  { id: 'calm', label: 'Binh tinh', icon: 'Heart', color: '#3AF7A6' },
  { id: 'confident', label: 'Tu tin', icon: 'Zap', color: '#FFD700' },
  { id: 'anxious', label: 'Lo lang', icon: 'AlertCircle', color: '#FFB800' },
  { id: 'greedy', label: 'Tham lam', icon: 'DollarSign', color: '#FF6B6B' },
  { id: 'fomo', label: 'FOMO', icon: 'TrendingUp', color: '#FF6B6B' },
  { id: 'fearful', label: 'So hai', icon: 'Shield', color: '#6B7280' },
  { id: 'revenge', label: 'Tra thu', icon: 'Flame', color: '#9C0612' },
  { id: 'frustrated', label: 'Buc boi', icon: 'Frown', color: '#FF6B6B' },
];

export const DISCIPLINE_CHECKLIST_ITEMS = [
  { id: 'correct_setup', label: 'Dung setup theo he thong', category: 'entry' },
  { id: 'correct_size', label: 'Dung size (risk <= 2%)', category: 'risk' },
  { id: 'stop_loss_set', label: 'Dat SL truoc khi entry', category: 'risk' },
  { id: 'waited_confirmation', label: 'Cho du confirmation', category: 'entry' },
  { id: 'followed_plan', label: 'Lam theo ke hoach', category: 'discipline' },
  { id: 'no_fomo', label: 'Khong FOMO', category: 'psychology' },
  { id: 'no_revenge_trade', label: 'Khong revenge trade', category: 'psychology' },
  { id: 'proper_risk_management', label: 'Quan ly rui ro dung', category: 'risk' },
];

export const CONFIRMATIONS = [
  { id: 'volume_spike', label: 'Volume Spike' },
  { id: 'rsi_divergence', label: 'RSI Divergence' },
  { id: 'candle_pattern', label: 'Candle Pattern' },
  { id: 'trendline_break', label: 'Trendline Break' },
  { id: 'ma_cross', label: 'MA Cross' },
  { id: 'support_resistance', label: 'S/R Level' },
  { id: 'fibonacci', label: 'Fibonacci Level' },
  { id: 'order_flow', label: 'Order Flow' },
];

// ==================== HELPERS ====================

/**
 * Get pattern by id
 */
export const getPatternById = (patternId) => {
  return PATTERN_TYPES.find(p => p.id === patternId) || null;
};

/**
 * Get emotion by id
 */
export const getEmotionById = (emotionId) => {
  return TRADE_EMOTIONS.find(e => e.id === emotionId) || null;
};

/**
 * Get zone type by id
 */
export const getZoneTypeById = (zoneId) => {
  return ZONE_TYPES.find(z => z.id === zoneId) || null;
};

// ==================== VALIDATION ====================

const validateTradingEntry = (data) => {
  const errors = [];

  // Required fields
  if (!data.symbol || data.symbol.trim().length === 0) {
    errors.push('Symbol khong duoc de trong');
  }

  if (!data.direction || !Object.values(TRADE_DIRECTIONS).includes(data.direction)) {
    errors.push('Huong giao dich khong hop le');
  }

  if (!data.entry_price || isNaN(parseFloat(data.entry_price)) || parseFloat(data.entry_price) <= 0) {
    errors.push('Gia entry khong hop le');
  }

  if (!data.trade_date) {
    errors.push('Ngay giao dich khong duoc de trong');
  }

  // Optional validations
  if (data.exit_price && (isNaN(parseFloat(data.exit_price)) || parseFloat(data.exit_price) < 0)) {
    errors.push('Gia exit khong hop le');
  }

  if (data.stop_loss && (isNaN(parseFloat(data.stop_loss)) || parseFloat(data.stop_loss) <= 0)) {
    errors.push('Stop loss khong hop le');
  }

  if (data.risk_percent && (parseFloat(data.risk_percent) < 0 || parseFloat(data.risk_percent) > 100)) {
    errors.push('Risk % phai tu 0-100');
  }

  if (data.pattern_grade && !PATTERN_GRADES.includes(data.pattern_grade)) {
    errors.push('Pattern grade khong hop le');
  }

  if (data.result && !Object.values(TRADE_RESULTS).includes(data.result)) {
    errors.push('Ket qua khong hop le');
  }

  // Rating validations
  ['execution_rating', 'setup_rating', 'management_rating'].forEach(field => {
    if (data[field] && (data[field] < 1 || data[field] > 5)) {
      errors.push(`${field} phai tu 1-5`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// ==================== CALCULATIONS ====================

/**
 * Calculate P/L and other metrics
 */
export const calculateTradeMetrics = (data) => {
  const metrics = {
    pnl_amount: null,
    pnl_percent: null,
    pnl_r: null,
    risk_reward_ratio: null,
    holding_duration_minutes: null,
    discipline_score: null,
  };

  const entryPrice = parseFloat(data.entry_price);
  const exitPrice = data.exit_price ? parseFloat(data.exit_price) : null;
  const stopLoss = data.stop_loss ? parseFloat(data.stop_loss) : null;
  const takeProfit = data.take_profit_1 ? parseFloat(data.take_profit_1) : null;
  const positionValue = data.position_value_usdt ? parseFloat(data.position_value_usdt) : null;

  // Calculate P/L if exit price exists
  if (exitPrice && positionValue) {
    const priceChange = data.direction === 'long'
      ? exitPrice - entryPrice
      : entryPrice - exitPrice;

    metrics.pnl_percent = (priceChange / entryPrice) * 100;
    metrics.pnl_amount = (priceChange / entryPrice) * positionValue;
  }

  // Calculate R:R ratio
  if (stopLoss && takeProfit) {
    const risk = Math.abs(entryPrice - stopLoss);
    const reward = Math.abs(takeProfit - entryPrice);
    metrics.risk_reward_ratio = risk > 0 ? parseFloat((reward / risk).toFixed(2)) : null;
  }

  // Calculate P/L in R multiples
  if (exitPrice && stopLoss) {
    const riskPerUnit = Math.abs(entryPrice - stopLoss);
    const pnlPerUnit = data.direction === 'long'
      ? exitPrice - entryPrice
      : entryPrice - exitPrice;
    metrics.pnl_r = riskPerUnit > 0 ? parseFloat((pnlPerUnit / riskPerUnit).toFixed(2)) : null;
  }

  // Calculate holding duration
  if (data.entry_time && data.exit_time) {
    const entryTime = new Date(data.entry_time);
    const exitTime = new Date(data.exit_time);
    metrics.holding_duration_minutes = Math.round((exitTime - entryTime) / (1000 * 60));
  }

  // Calculate discipline score
  if (data.discipline_checklist) {
    const checklist = typeof data.discipline_checklist === 'string'
      ? JSON.parse(data.discipline_checklist)
      : data.discipline_checklist;

    const totalItems = DISCIPLINE_CHECKLIST_ITEMS.length;
    const checkedItems = Object.values(checklist).filter(v => v === true).length;
    metrics.discipline_score = Math.round((checkedItems / totalItems) * 100);
  }

  return metrics;
};

/**
 * Determine trade result based on P/L
 */
const determineResult = (pnlAmount) => {
  if (pnlAmount === null || pnlAmount === undefined) return null;
  if (pnlAmount > 0) return TRADE_RESULTS.WIN;
  if (pnlAmount < 0) return TRADE_RESULTS.LOSS;
  return TRADE_RESULTS.BREAKEVEN;
};

// ==================== CRUD OPERATIONS ====================

/**
 * Create new trading journal entry
 */
export const createTradingEntry = async (userId, data, userTier = 'free', userRole = null) => {
  console.log(`${SERVICE_NAME} createTradingEntry`, { userId, symbol: data.symbol });

  try {
    // Check access
    const access = checkCalendarAccess('trading_journal', userTier, userRole);
    if (!access.allowed) {
      return {
        success: false,
        error: access.reason,
        requiresUpgrade: true,
      };
    }

    // Check daily limit
    const dailyLimit = getTradingDailyLimit(userTier, userRole);
    if (dailyLimit !== 'unlimited' && dailyLimit !== null) {
      const today = new Date().toISOString().split('T')[0];
      const { count, error: countError } = await supabase
        .from('trading_journal_entries')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('trade_date', today);

      if (countError) throw countError;

      if (count >= dailyLimit) {
        return {
          success: false,
          error: `Ban da dat gioi han ${dailyLimit} trades/ngay`,
          limitReached: true,
        };
      }
    }

    // Check screenshot limit
    const screenshotLimit = getTradingScreenshotLimit(userTier, userRole);
    if (screenshotLimit && data.screenshots && data.screenshots.length > screenshotLimit) {
      return {
        success: false,
        error: `Gioi han ${screenshotLimit} screenshots. Nang cap de them nhieu hon.`,
      };
    }

    // Validate
    const validation = validateTradingEntry(data);
    if (!validation.isValid) {
      return { success: false, error: validation.errors.join(', '), errors: validation.errors };
    }

    // Calculate metrics
    const metrics = calculateTradeMetrics(data);

    // Determine result if exit price provided
    let result = data.result || null;
    if (!result && metrics.pnl_amount !== null) {
      result = determineResult(metrics.pnl_amount);
    }
    if (data.exit_price && !result) {
      result = TRADE_RESULTS.OPEN;
    }

    // Prepare data
    const entryData = {
      user_id: userId,
      trade_date: data.trade_date,
      trade_time: data.trade_time || null,
      symbol: data.symbol.toUpperCase().trim(),
      direction: data.direction,

      // Pattern & Setup
      pattern_type: data.pattern_type || null,
      pattern_grade: data.pattern_grade || null,
      timeframe: data.timeframe || null,
      zone_type: data.zone_type || null,
      zone_strength: data.zone_strength || null,

      // Prices
      entry_price: parseFloat(data.entry_price),
      exit_price: data.exit_price ? parseFloat(data.exit_price) : null,
      stop_loss: data.stop_loss ? parseFloat(data.stop_loss) : null,
      take_profit_1: data.take_profit_1 ? parseFloat(data.take_profit_1) : null,
      take_profit_2: data.take_profit_2 ? parseFloat(data.take_profit_2) : null,
      take_profit_3: data.take_profit_3 ? parseFloat(data.take_profit_3) : null,

      // Position
      position_size: data.position_size ? parseFloat(data.position_size) : null,
      position_value_usdt: data.position_value_usdt ? parseFloat(data.position_value_usdt) : null,
      risk_amount_usdt: data.risk_amount_usdt ? parseFloat(data.risk_amount_usdt) : null,
      risk_percent: data.risk_percent ? parseFloat(data.risk_percent) : null,
      risk_reward_ratio: metrics.risk_reward_ratio,

      // Result
      pnl_amount: metrics.pnl_amount,
      pnl_percent: metrics.pnl_percent,
      pnl_r: metrics.pnl_r,
      result: result,

      // Notes
      entry_reason: data.entry_reason || null,
      exit_reason: data.exit_reason || null,
      lessons_learned: data.lessons_learned || null,
      market_context: data.market_context || null,
      what_went_well: data.what_went_well || null,
      what_to_improve: data.what_to_improve || null,

      // Ratings
      execution_rating: data.execution_rating || null,
      setup_rating: data.setup_rating || null,
      management_rating: data.management_rating || null,

      // Discipline
      discipline_checklist: data.discipline_checklist || {},
      discipline_score: metrics.discipline_score,

      // Psychology
      pre_trade_emotion: data.pre_trade_emotion || null,
      during_trade_emotion: data.during_trade_emotion || null,
      post_trade_emotion: data.post_trade_emotion || null,
      emotional_note: data.emotional_note || null,

      // Screenshots
      screenshots: data.screenshots || [],

      // Source
      source: data.source || 'manual',
      source_reference_id: data.source_reference_id || null,

      // Confirmations
      confirmations_used: data.confirmations_used || [],

      // Times
      entry_time: data.entry_time || null,
      exit_time: data.exit_time || null,
      holding_duration_minutes: metrics.holding_duration_minutes,
    };

    // Insert
    const { data: entry, error } = await supabase
      .from('trading_journal_entries')
      .insert(entryData)
      .select()
      .single();

    if (error) throw error;

    console.log(`${SERVICE_NAME} Created trading entry:`, entry.id);

    return { success: true, data: entry };

  } catch (error) {
    console.error(`${SERVICE_NAME} createTradingEntry error:`, error);
    return { success: false, error: error.message || 'Khong the luu giao dich' };
  }
};

/**
 * Get trading entry by ID
 */
export const getEntryById = async (userId, entryId) => {
  try {
    const { data, error } = await supabase
      .from('trading_journal_entries')
      .select('*')
      .eq('id', entryId)
      .eq('user_id', userId)
      .maybeSingle(); // Use maybeSingle to handle 0 rows gracefully

    if (error) throw error;

    if (!data) {
      return { success: false, error: 'Entry not found', data: null };
    }

    return { success: true, data };

  } catch (error) {
    console.error(`${SERVICE_NAME} getEntryById error:`, error);
    return { success: false, error: error.message, data: null };
  }
};

/**
 * Get trading entries for date
 */
export const getTradingEntriesForDate = async (userId, date) => {
  try {
    const { data, error } = await supabase
      .from('trading_journal_entries')
      .select('*')
      .eq('user_id', userId)
      .eq('trade_date', date)
      .order('entry_time', { ascending: true, nullsFirst: false })
      .order('created_at', { ascending: true });

    if (error) throw error;

    return { success: true, data: data || [] };

  } catch (error) {
    console.error(`${SERVICE_NAME} getTradingEntriesForDate error:`, error);
    return { success: false, error: error.message, data: [] };
  }
};

/**
 * Get trading entries for date range
 */
export const getTradingEntriesForRange = async (userId, startDate, endDate, options = {}) => {
  try {
    let query = supabase
      .from('trading_journal_entries')
      .select('*')
      .eq('user_id', userId)
      .gte('trade_date', startDate)
      .lte('trade_date', endDate);

    // Filters
    if (options.symbol) {
      query = query.ilike('symbol', `%${options.symbol}%`);
    }
    if (options.result) {
      query = query.eq('result', options.result);
    }
    if (options.pattern_type) {
      query = query.eq('pattern_type', options.pattern_type);
    }
    if (options.direction) {
      query = query.eq('direction', options.direction);
    }

    query = query
      .order('trade_date', { ascending: false })
      .order('entry_time', { ascending: false, nullsFirst: false });

    if (options.limit) {
      query = query.limit(options.limit);
    }

    const { data, error } = await query;

    if (error) throw error;

    return { success: true, data: data || [] };

  } catch (error) {
    console.error(`${SERVICE_NAME} getTradingEntriesForRange error:`, error);
    return { success: false, error: error.message, data: [] };
  }
};

/**
 * Update trading entry
 */
export const updateTradingEntry = async (userId, entryId, updates) => {
  console.log(`${SERVICE_NAME} updateTradingEntry`, { userId, entryId });

  try {
    // Get current entry
    const { data: currentEntry } = await supabase
      .from('trading_journal_entries')
      .select('*')
      .eq('id', entryId)
      .eq('user_id', userId)
      .single();

    if (!currentEntry) {
      return { success: false, error: 'Khong tim thay giao dich' };
    }

    // Merge with updates
    const mergedData = { ...currentEntry, ...updates };

    // Recalculate metrics
    const metrics = calculateTradeMetrics(mergedData);

    // Determine result
    let result = updates.result || currentEntry.result;
    if (updates.exit_price && !result) {
      result = determineResult(metrics.pnl_amount);
    }

    // Prepare update
    const updateData = {
      ...updates,
      pnl_amount: metrics.pnl_amount ?? currentEntry.pnl_amount,
      pnl_percent: metrics.pnl_percent ?? currentEntry.pnl_percent,
      pnl_r: metrics.pnl_r ?? currentEntry.pnl_r,
      risk_reward_ratio: metrics.risk_reward_ratio ?? currentEntry.risk_reward_ratio,
      discipline_score: metrics.discipline_score ?? currentEntry.discipline_score,
      holding_duration_minutes: metrics.holding_duration_minutes ?? currentEntry.holding_duration_minutes,
      result: result,
      updated_at: new Date().toISOString(),
    };

    // Remove fields that shouldn't be updated
    delete updateData.user_id;
    delete updateData.id;
    delete updateData.created_at;

    const { data, error } = await supabase
      .from('trading_journal_entries')
      .update(updateData)
      .eq('id', entryId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;

    return { success: true, data };

  } catch (error) {
    console.error(`${SERVICE_NAME} updateTradingEntry error:`, error);
    return { success: false, error: error.message };
  }
};

/**
 * Delete trading entry
 */
export const deleteTradingEntry = async (userId, entryId) => {
  try {
    const { error } = await supabase
      .from('trading_journal_entries')
      .delete()
      .eq('id', entryId)
      .eq('user_id', userId);

    if (error) throw error;

    return { success: true };

  } catch (error) {
    console.error(`${SERVICE_NAME} deleteTradingEntry error:`, error);
    return { success: false, error: error.message };
  }
};

/**
 * Get trading statistics
 */
export const getTradingStats = async (userId, startDate = null, endDate = null) => {
  try {
    const { data, error } = await supabase
      .rpc('get_trading_journal_stats', {
        p_user_id: userId,
        p_start_date: startDate,
        p_end_date: endDate,
      });

    if (error) throw error;

    return { success: true, data };

  } catch (error) {
    console.error(`${SERVICE_NAME} getTradingStats error:`, error);
    return { success: false, error: error.message };
  }
};

/**
 * Get today's trade count
 */
export const getTodayTradeCount = async (userId) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const { count, error } = await supabase
      .from('trading_journal_entries')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('trade_date', today);

    if (error) throw error;

    return { success: true, count: count || 0 };

  } catch (error) {
    console.error(`${SERVICE_NAME} getTodayTradeCount error:`, error);
    return { success: false, error: error.message, count: 0 };
  }
};

/**
 * Create trading entry from Scanner signal (prefill data)
 */
export const createFromScannerSignal = (signalData) => {
  console.log(`${SERVICE_NAME} createFromScannerSignal`, { signalData });

  // Pre-fill data from signal
  return {
    symbol: signalData.symbol || '',
    direction: signalData.direction || (signalData.zone_type === 'demand' ? 'long' : 'short'),
    pattern_type: signalData.pattern_type || signalData.pattern || null,
    pattern_grade: signalData.pattern_grade || signalData.grade || null,
    timeframe: signalData.timeframe || null,
    zone_type: signalData.zone_type || null,
    zone_strength: signalData.zone_strength || null,
    trade_date: new Date().toISOString().split('T')[0],
    source: 'scanner_signal',
    source_reference_id: signalData.id || null,
    market_context: signalData.context || signalData.analysis || null,
  };
};

/**
 * Create trading entry from Paper Trade (prefill data)
 */
export const createFromPaperTrade = (paperTradeData) => {
  console.log(`${SERVICE_NAME} createFromPaperTrade`, { paperTradeData });

  return {
    symbol: paperTradeData.symbol || '',
    direction: paperTradeData.side?.toLowerCase() || paperTradeData.direction || 'long',
    entry_price: paperTradeData.entry_price || null,
    exit_price: paperTradeData.exit_price || null,
    stop_loss: paperTradeData.stop_loss || null,
    take_profit_1: paperTradeData.take_profit || null,
    position_size: paperTradeData.quantity || null,
    position_value_usdt: paperTradeData.position_value || null,
    pnl_amount: paperTradeData.pnl || null,
    pnl_percent: paperTradeData.pnl_percent || null,
    result: paperTradeData.pnl > 0 ? 'win' : paperTradeData.pnl < 0 ? 'loss' : 'breakeven',
    trade_date: paperTradeData.closed_at?.split('T')[0] || new Date().toISOString().split('T')[0],
    entry_time: paperTradeData.opened_at || null,
    exit_time: paperTradeData.closed_at || null,
    source: 'paper_trade',
    source_reference_id: paperTradeData.id || null,
  };
};

export default {
  // Constants
  TRADE_DIRECTIONS,
  TRADE_RESULTS,
  PATTERN_TYPES,
  PATTERN_GRADES,
  TIMEFRAMES,
  ZONE_TYPES,
  TRADE_EMOTIONS,
  DISCIPLINE_CHECKLIST_ITEMS,
  CONFIRMATIONS,

  // Helpers
  getPatternById,
  getEmotionById,
  getZoneTypeById,
  calculateTradeMetrics,

  // CRUD
  createTradingEntry,
  getEntryById,
  getTradingEntriesForDate,
  getTradingEntriesForRange,
  updateTradingEntry,
  deleteTradingEntry,

  // Stats
  getTradingStats,
  getTodayTradeCount,

  // Integrations
  createFromScannerSignal,
  createFromPaperTrade,
};
