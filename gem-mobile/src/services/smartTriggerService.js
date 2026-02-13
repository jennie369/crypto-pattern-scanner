// src/services/smartTriggerService.js
// ============================================================
// SMART TRIGGER SERVICE
// Detect behavior patterns and trigger proactive engagement
// ============================================================

import { supabase } from './supabase';

const SERVICE_NAME = '[SmartTriggerService]';

// ============================================================
// TRIGGER DEFINITIONS
// ============================================================

export const SMART_TRIGGERS = {
  HIGH_SCAN_NO_TRADE: {
    id: 'HIGH_SCAN_NO_TRADE',
    name: 'Scan nhiều nhưng không trade',
    condition: (stats) => (stats?.scansLast7Days || 0) > 20 && (stats?.paperTradesLast7Days || 0) === 0,
    message: '📊 Ta thấy bạn đang scan nhiều nhưng chưa thực hành. Paper trading sẽ giúp bạn tự tin hơn trước khi trade thật.',
    action: 'SUGGEST_PAPER_TRADE',
    priority: 1,
    cooldownHours: 72, // Không hiện lại trong 72h
  },

  MEDITATION_STREAK: {
    id: 'MEDITATION_STREAK',
    name: 'Streak thiền 7 ngày',
    condition: (stats) => (stats?.meditationStreak || 0) >= 7,
    message: '🧘 Tuyệt vời! Streak ${stats.meditationStreak} ngày thiền định! Tần số của bạn đang ổn định ở mức cao. Tiếp tục duy trì nhé!',
    action: 'CELEBRATE',
    priority: 2,
    cooldownHours: 168, // 7 ngày
  },

  REPEATED_TOPIC: {
    id: 'REPEATED_TOPIC',
    name: 'Hỏi nhiều về 1 topic',
    condition: (stats, history) => {
      const topicFrequency = getTopicFrequency(history, stats?.mostAskedTopic);
      return topicFrequency >= 3;
    },
    message: '💡 Ta thấy bạn quan tâm nhiều đến ${stats.mostAskedTopic}. Đây có vẻ là chủ đề phù hợp với bạn. Bạn có muốn tìm hiểu sâu hơn không?',
    action: 'SUGGEST_DEEP_DIVE',
    priority: 3,
    cooldownHours: 48,
  },

  LOSING_STREAK: {
    id: 'LOSING_STREAK',
    name: 'Chuỗi thua liên tiếp',
    condition: (stats) => (stats?.losingStreak || 0) >= 3,
    message: '🌟 Ta nhận thấy bạn đang trải qua giai đoạn khó khăn. Hãy dừng lại, hít thở sâu, và điều chỉnh lại tâm thế. Muốn ta hướng dẫn bài thiền phục hồi không?',
    action: 'SUGGEST_HEALING',
    priority: 1,
    cooldownHours: 24,
  },

  INACTIVE_USER: {
    id: 'INACTIVE_USER',
    name: 'User không hoạt động 3 ngày',
    condition: (stats) => (stats?.daysSinceLastActivity || 0) >= 3,
    message: '👋 Lâu rồi không thấy bạn! Vũ trụ đang chờ đợi sự trở lại của bạn. Hôm nay có gì mới không?',
    action: 'WELCOME_BACK',
    priority: 4,
    cooldownHours: 72,
  },

  FIRST_PROFITABLE_TRADE: {
    id: 'FIRST_PROFITABLE_TRADE',
    name: 'Trade có lãi đầu tiên',
    condition: (stats) => (stats?.totalProfitableTrades || 0) === 1 && (stats?.lastTradeProfit || 0) > 0,
    message: '🎉 Chúc mừng trade có lãi đầu tiên! Đây là bước khởi đầu tuyệt vời. Hãy tiếp tục kỷ luật và nhớ: Bảo toàn vốn là ưu tiên số 1.',
    action: 'CELEBRATE_FIRST_WIN',
    priority: 1,
    cooldownHours: 0, // Chỉ hiện 1 lần
  },

  UPGRADE_OPPORTUNITY: {
    id: 'UPGRADE_OPPORTUNITY',
    name: 'User tiềm năng nâng cấp',
    condition: (stats) => {
      return stats?.tier === 'FREE' &&
             (stats?.totalScans || 0) > 50 &&
             (stats?.chatbotMessages || 0) > 30;
    },
    message: '⭐ Bạn đang sử dụng GEM rất hiệu quả! Với tier Premium, bạn sẽ có quyền truy cập tất cả patterns và tính năng nâng cao.',
    action: 'SUGGEST_UPGRADE',
    priority: 5,
    cooldownHours: 168,
  },
};

// ============================================================
// HELPER FUNCTIONS
// ============================================================

/**
 * Get topic frequency from history
 * @param {array} history
 * @param {string} topic
 * @returns {number}
 */
const getTopicFrequency = (history, topic) => {
  if (!history?.length || !topic) return 0;
  return history.filter(h =>
    h?.topic?.toLowerCase().includes(topic.toLowerCase())
  ).length;
};

/**
 * Check if trigger is in cooldown
 * @param {string} triggerId
 * @param {array} triggerLogs
 * @param {number} cooldownHours
 * @returns {boolean}
 */
const isInCooldown = (triggerId, triggerLogs, cooldownHours) => {
  if (!triggerLogs?.length || cooldownHours === 0) return false;

  const lastTrigger = triggerLogs.find(log => log.trigger_type === triggerId);
  if (!lastTrigger) return false;

  const lastShownTime = new Date(lastTrigger.shown_at).getTime();
  const cooldownMs = cooldownHours * 60 * 60 * 1000;

  return Date.now() - lastShownTime < cooldownMs;
};

// ============================================================
// CORE FUNCTIONS
// ============================================================

/**
 * Get user stats for trigger evaluation
 * @param {string} userId
 * @returns {Promise<object>}
 */
export const getUserStats = async (userId) => {
  console.log(SERVICE_NAME, 'getUserStats started:', userId);

  if (!userId) {
    return {};
  }

  try {
    // Get tier info
    const { data: tierData, error: tierError } = await supabase
      .from('profiles')
      .select('scanner_tier')
      .eq('id', userId)
      .single();

    // Get scan activity (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    const { data: scanData, error: scanError } = await supabase
      .from('scan_history')
      .select('id, created_at')
      .eq('user_id', userId)
      .gte('created_at', sevenDaysAgo);

    // Get chatbot messages (last 7 days)
    const { data: chatData, error: chatError } = await supabase
      .from('chatbot_history')
      .select('id, created_at')
      .eq('user_id', userId)
      .gte('created_at', sevenDaysAgo);

    // Get paper trades (last 20)
    const { data: tradeData, error: tradeError } = await supabase
      .from('paper_trades')
      .select('profit_loss, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20);

    // Calculate stats
    const scansLast7Days = scanData?.length || 0;
    const chatbotMessages = chatData?.length || 0;

    // Calculate paper trades in last 7 days
    const trades = tradeData || [];
    const paperTradesLast7Days = trades.filter(t => {
      const tradeDate = new Date(t.created_at);
      return Date.now() - tradeDate.getTime() < 7 * 24 * 60 * 60 * 1000;
    }).length;

    // Calculate losing streak
    let losingStreak = 0;
    for (const trade of trades) {
      if ((trade.profit_loss || 0) < 0) {
        losingStreak++;
      } else {
        break;
      }
    }

    // Calculate profitable trades
    const profitableTrades = trades.filter(t => (t.profit_loss || 0) > 0).length;

    // Days since last activity
    const lastScan = scanData?.[0]?.created_at;
    const lastChat = chatData?.[0]?.created_at;
    const lastActivity = lastScan > lastChat ? lastScan : (lastChat || lastScan);
    const daysSinceLastActivity = lastActivity
      ? Math.floor((Date.now() - new Date(lastActivity).getTime()) / (1000 * 60 * 60 * 24))
      : 999;

    const stats = {
      tier: tierData?.scanner_tier || 'FREE',
      scansLast7Days,
      paperTradesLast7Days,
      losingStreak,
      totalProfitableTrades: profitableTrades,
      daysSinceLastActivity,
      totalScans: scansLast7Days,
      chatbotMessages,
    };

    console.log(SERVICE_NAME, 'getUserStats success:', stats);
    return stats;
  } catch (err) {
    console.error(SERVICE_NAME, 'getUserStats error:', err.message);
    return {};
  }
};

/**
 * Get user's trigger logs
 * @param {string} userId
 * @returns {Promise<array>}
 */
export const getUserTriggerLogs = async (userId) => {
  console.log(SERVICE_NAME, 'getUserTriggerLogs:', userId);

  if (!userId) return [];

  try {
    const { data, error } = await supabase
      .from('smart_trigger_logs')
      .select('trigger_type, shown_at, was_dismissed')
      .eq('user_id', userId)
      .order('shown_at', { ascending: false })
      .limit(50);

    if (error) {
      console.warn(SERVICE_NAME, 'getUserTriggerLogs error:', error.message);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error(SERVICE_NAME, 'getUserTriggerLogs exception:', err.message);
    return [];
  }
};

/**
 * Evaluate triggers and return active ones
 * @param {string} userId
 * @param {array} conversationHistory
 * @returns {Promise<array>}
 */
export const evaluateTriggers = async (userId, conversationHistory = []) => {
  console.log(SERVICE_NAME, 'evaluateTriggers started:', userId);

  if (!userId) {
    return [];
  }

  try {
    // Get user stats and logs
    const [stats, triggerLogs] = await Promise.all([
      getUserStats(userId),
      getUserTriggerLogs(userId),
    ]);

    const activeTriggers = [];

    // Evaluate each trigger
    for (const [key, trigger] of Object.entries(SMART_TRIGGERS)) {
      // Check cooldown
      if (isInCooldown(trigger.id, triggerLogs, trigger.cooldownHours)) {
        console.log(SERVICE_NAME, 'Trigger in cooldown:', trigger.id);
        continue;
      }

      // Evaluate condition
      try {
        const conditionMet = trigger.condition(stats, conversationHistory);
        if (conditionMet) {
          // Replace placeholders in message
          let message = trigger.message;
          for (const [statKey, statValue] of Object.entries(stats)) {
            message = message.replace(`\${stats.${statKey}}`, statValue);
          }

          activeTriggers.push({
            ...trigger,
            message,
            stats,
          });

          console.log(SERVICE_NAME, 'Trigger activated:', trigger.id);
        }
      } catch (conditionError) {
        console.warn(SERVICE_NAME, 'Trigger condition error:', key, conditionError.message);
      }
    }

    // Sort by priority
    activeTriggers.sort((a, b) => a.priority - b.priority);

    console.log(SERVICE_NAME, 'evaluateTriggers result:', activeTriggers.length, 'triggers');
    return activeTriggers;
  } catch (err) {
    console.error(SERVICE_NAME, 'evaluateTriggers error:', err.message);
    return [];
  }
};

/**
 * Log trigger shown to user
 * @param {string} userId
 * @param {object} trigger
 * @returns {Promise<boolean>}
 */
export const logTriggerShown = async (userId, trigger) => {
  console.log(SERVICE_NAME, 'logTriggerShown:', { userId, triggerId: trigger?.id });

  if (!userId || !trigger?.id) return false;

  try {
    const { error } = await supabase
      .from('smart_trigger_logs')
      .insert({
        user_id: userId,
        trigger_type: trigger.id,
        trigger_message: trigger.message,
        trigger_condition: { stats: trigger.stats },
        was_shown: true,
      });

    if (error) {
      console.error(SERVICE_NAME, 'logTriggerShown error:', error.message);
      return false;
    }

    return true;
  } catch (err) {
    console.error(SERVICE_NAME, 'logTriggerShown exception:', err.message);
    return false;
  }
};

/**
 * Log trigger dismissed
 * @param {string} logId
 * @returns {Promise<boolean>}
 */
export const logTriggerDismissed = async (logId) => {
  console.log(SERVICE_NAME, 'logTriggerDismissed:', logId);

  if (!logId) return false;

  try {
    const { error } = await supabase
      .from('smart_trigger_logs')
      .update({
        was_dismissed: true,
        dismissed_at: new Date().toISOString(),
      })
      .eq('id', logId);

    return !error;
  } catch (err) {
    console.error(SERVICE_NAME, 'logTriggerDismissed error:', err.message);
    return false;
  }
};

/**
 * Log trigger acted upon
 * @param {string} logId
 * @param {string} action
 * @returns {Promise<boolean>}
 */
export const logTriggerActedUpon = async (logId, action) => {
  console.log(SERVICE_NAME, 'logTriggerActedUpon:', { logId, action });

  if (!logId) return false;

  try {
    const { error } = await supabase
      .from('smart_trigger_logs')
      .update({
        was_acted_upon: true,
        action_taken: action,
        acted_at: new Date().toISOString(),
      })
      .eq('id', logId);

    return !error;
  } catch (err) {
    console.error(SERVICE_NAME, 'logTriggerActedUpon error:', err.message);
    return false;
  }
};

// ============================================================
// EXPORTS
// ============================================================

export default {
  SMART_TRIGGERS,
  getUserStats,
  getUserTriggerLogs,
  evaluateTriggers,
  logTriggerShown,
  logTriggerDismissed,
  logTriggerActedUpon,
};
