/**
 * PROACTIVE AI SERVICE
 * Generates and manages proactive AI messages
 * Daily insights, streak alerts, ritual reminders, pattern observations
 */

import { supabase } from './supabase';
import cacheService from './cacheService';
import { userMemoryService } from './userMemoryService';
import { streakService } from './streakService';
import { ritualTrackingService } from './ritualTrackingService';
import { emotionDetectionService } from './emotionDetectionService';

// ============================================================
// MESSAGE TEMPLATES
// ============================================================

const MESSAGE_TEMPLATES = {
  daily_insight: [
    {
      title: 'Suy ngẫm buổi sáng',
      templates: [
        'Hôm nay là ngày thứ {days} trong hành trình của bạn. {name}, hãy nhớ rằng mỗi bước nhỏ đều quan trọng.',
        'Chào buổi sáng {name}! Năng lượng hôm nay của bạn bắt đầu từ suy nghĩ đầu tiên. Hãy chọn một suy nghĩ tích cực.',
        '{name}, bạn đã đi được {days} ngày. Hôm nay, hãy tập trung vào điều bạn có thể kiểm soát.',
      ],
    },
    {
      title: 'Nhắc nhở tần số',
      templates: [
        'Tần số trung bình của bạn tuần này là {frequency}Hz. Hãy hít thở sâu và nâng cao năng lượng!',
        '{name}, năng lượng của bạn đang ở mức {level}. Hãy dành 5 phút để thiền định và cân bằng.',
      ],
    },
  ],

  ritual_reminder: [
    'Đã đến giờ "{ritual_name}"! Hãy dành {duration} phút cho bản thân.',
    'Nhắc nhở: {ritual_name} trong {minutes_until} phút nữa. Bạn đã sẵn sàng chưa?',
    '{name}, đừng quên {ritual_name} hôm nay nhé! Streak của bạn đang ở {streak} ngày.',
  ],

  streak_alert: {
    at_risk: [
      'Streak {streak} ngày của bạn sắp mất! Chỉ còn vài giờ để duy trì.',
      '{name}, đừng để streak {streak} ngày biến mất! Hãy hành động ngay.',
    ],
    broken: [
      'Streak trước đó của bạn là {previous_streak} ngày. Hôm nay là ngày mới để bắt đầu lại!',
      'Không sao {name}, mỗi bậc thầy đều có lúc vấp ngã. Hãy bắt đầu streak mới ngay hôm nay.',
    ],
    milestone: [
      'Chúc mừng! Bạn đã đạt {streak} ngày liên tiếp! Tiếp tục duy trì nhé!',
      '{name}, tuyệt vời! {streak} ngày là một cột mốc đáng nhớ. Hãy tự hào về bản thân!',
    ],
  },

  pattern_observation: [
    '{name}, tôi nhận thấy bạn thường {pattern}. Đây là dấu hiệu {interpretation}.',
    'Qua các cuộc trò chuyện, tôi thấy {observation}. Bạn có muốn khám phá thêm không?',
  ],

  encouragement: [
    'Mỗi ngày là một cơ hội mới để trở thành phiên bản tốt nhất của bạn.',
    'Bạn đang làm tốt hơn bạn nghĩ, {name}. Hãy tiếp tục!',
    'Hành trình {days} ngày của bạn là minh chứng cho sự kiên trì.',
  ],

  celebration: [
    'Chúc mừng {name}! Bạn đã đạt được {achievement}!',
    'Tuyệt vời! {achievement}. Hãy tự thưởng cho bản thân ngày hôm nay!',
  ],

  check_in: [
    '{name}, hôm nay bạn cảm thấy thế nào? Tôi ở đây để lắng nghe.',
    'Đã lâu không thấy bạn. Mọi thứ ổn chứ {name}?',
  ],
};

// Message types enum
const MESSAGE_TYPES = {
  DAILY_INSIGHT: 'daily_insight',
  RITUAL_REMINDER: 'ritual_reminder',
  STREAK_ALERT: 'streak_alert',
  STREAK_MILESTONE: 'streak_milestone',
  PATTERN_OBSERVATION: 'pattern_observation',
  CELEBRATION: 'celebration',
  ENCOURAGEMENT: 'encouragement',
  CHECK_IN: 'check_in',
  WEEKLY_SUMMARY: 'weekly_summary',
  CUSTOM: 'custom',
};

// Delivery methods
const DELIVERY_METHODS = {
  IN_APP: 'in_app',
  PUSH: 'push',
  BOTH: 'both',
  EMAIL: 'email',
};

class ProactiveAIService {
  // ============================================================
  // MESSAGE GENERATION
  // ============================================================

  /**
   * Generate daily insight for user
   * @param {string} userId - User ID
   * @returns {Promise<Object|null>} Generated message
   */
  async generateDailyInsight(userId) {
    if (!userId) return null;

    try {
      // Check if already sent today
      const { data: hasSent } = await supabase
        .rpc('has_daily_insight_today', { p_user_id: userId });

      if (hasSent) {
        return { alreadySent: true };
      }

      // Get user context
      const [profile, emotionTrend, streakSummary] = await Promise.all([
        userMemoryService.getUserProfile(userId),
        emotionDetectionService.getFrequencyTrend(userId, 7),
        streakService.getGamificationSummary(userId),
      ]);

      const name = profile?.preferred_name || profile?.display_name || 'bạn';
      const days = profile?.transformation_days || 0;
      const frequency = emotionTrend?.avgFrequency || 200;
      const level = frequency >= 300 ? 'cao' : frequency >= 175 ? 'trung bình' : 'cần nâng cao';

      // Select template category based on context
      const category = this._selectInsightCategory(streakSummary, emotionTrend);
      const templates = MESSAGE_TEMPLATES.daily_insight.find(t =>
        t.title.toLowerCase().includes(category)
      )?.templates || MESSAGE_TEMPLATES.daily_insight[0].templates;

      // Select random template
      const template = templates[Math.floor(Math.random() * templates.length)];

      // Fill in template
      const content = this._fillTemplate(template, {
        name,
        days,
        frequency,
        level,
        streak: streakSummary?.currentStreak || 0,
      });

      // Schedule the message
      const message = await this.scheduleMessage(userId, {
        message_type: MESSAGE_TYPES.DAILY_INSIGHT,
        title: 'Suy ngẫm hôm nay',
        content,
        scheduled_for: new Date().toISOString(),
        priority: 5,
        delivery_method: DELIVERY_METHODS.IN_APP,
        metadata: {
          days,
          frequency,
          generated_at: new Date().toISOString(),
        },
      });

      return message;
    } catch (error) {
      console.error('[ProactiveAI] generateDailyInsight error:', error);
      return null;
    }
  }

  /**
   * Check and generate streak alerts
   * @param {string} userId - User ID
   * @returns {Promise<Object|null>} Alert message if needed
   */
  async checkStreaksAndAlert(userId) {
    if (!userId) return null;

    try {
      const riskCheck = await streakService.checkStreakRisk(userId);
      if (!riskCheck) return null;

      const profile = await userMemoryService.getUserProfile(userId);
      const name = profile?.preferred_name || profile?.display_name || 'bạn';

      let templates;
      let messageType;
      let priority;

      if (riskCheck.atRisk) {
        templates = MESSAGE_TEMPLATES.streak_alert.at_risk;
        messageType = MESSAGE_TYPES.STREAK_ALERT;
        priority = riskCheck.urgency === 'high' ? 9 : 7;
      } else if (riskCheck.streakBroken) {
        templates = MESSAGE_TEMPLATES.streak_alert.broken;
        messageType = MESSAGE_TYPES.STREAK_ALERT;
        priority = 6;
      } else if (this._isMilestone(riskCheck.currentStreak)) {
        templates = MESSAGE_TEMPLATES.streak_alert.milestone;
        messageType = MESSAGE_TYPES.STREAK_MILESTONE;
        priority = 8;
      } else {
        return null; // No alert needed
      }

      const template = templates[Math.floor(Math.random() * templates.length)];
      const content = this._fillTemplate(template, {
        name,
        streak: riskCheck.currentStreak || 0,
        previous_streak: riskCheck.previousStreak || 0,
      });

      const message = await this.scheduleMessage(userId, {
        message_type: messageType,
        title: riskCheck.atRisk ? 'Streak Alert!' : riskCheck.streakBroken ? 'Bắt đầu lại' : 'Cột mốc!',
        content,
        scheduled_for: new Date().toISOString(),
        priority,
        delivery_method: riskCheck.urgency === 'high' ? DELIVERY_METHODS.BOTH : DELIVERY_METHODS.IN_APP,
        metadata: {
          streak: riskCheck.currentStreak,
          at_risk: riskCheck.atRisk,
          streak_broken: riskCheck.streakBroken,
        },
      });

      return message;
    } catch (error) {
      console.error('[ProactiveAI] checkStreaksAndAlert error:', error);
      return null;
    }
  }

  /**
   * Generate ritual reminders
   * @param {string} userId - User ID
   * @returns {Promise<Array>} Generated reminders
   */
  async generateRitualReminders(userId) {
    if (!userId) return [];

    try {
      const todayStatus = await ritualTrackingService.getTodayStatus(userId);
      if (!todayStatus?.rituals) return [];

      const profile = await userMemoryService.getUserProfile(userId);
      const name = profile?.preferred_name || profile?.display_name || 'bạn';
      const gamification = await streakService.getGamificationSummary(userId);

      const reminders = [];
      const now = new Date();

      for (const ritual of todayStatus.rituals) {
        if (ritual.is_completed) continue;

        // Parse scheduled time
        const [hours, minutes] = (ritual.scheduled_time || '08:00').split(':').map(Number);
        const scheduledTime = new Date();
        scheduledTime.setHours(hours, minutes, 0, 0);

        // Check if within reminder window (15 minutes before)
        const reminderTime = new Date(scheduledTime.getTime() - 15 * 60 * 1000);
        const timeDiff = scheduledTime.getTime() - now.getTime();
        const minutesUntil = Math.round(timeDiff / (60 * 1000));

        if (minutesUntil > 0 && minutesUntil <= 30) {
          const template = MESSAGE_TEMPLATES.ritual_reminder[
            Math.floor(Math.random() * MESSAGE_TEMPLATES.ritual_reminder.length)
          ];

          const content = this._fillTemplate(template, {
            name,
            ritual_name: ritual.ritual_name,
            duration: ritual.duration_minutes || 10,
            minutes_until: minutesUntil,
            streak: gamification?.currentStreak || 0,
          });

          const reminder = await this.scheduleMessage(userId, {
            message_type: MESSAGE_TYPES.RITUAL_REMINDER,
            title: `Nhắc nhở: ${ritual.ritual_name}`,
            content,
            scheduled_for: reminderTime.toISOString(),
            priority: 7,
            delivery_method: DELIVERY_METHODS.PUSH,
            metadata: {
              ritual_id: ritual.ritual_id,
              ritual_name: ritual.ritual_name,
              scheduled_time: ritual.scheduled_time,
            },
          });

          reminders.push(reminder);
        }
      }

      return reminders;
    } catch (error) {
      console.error('[ProactiveAI] generateRitualReminders error:', error);
      return [];
    }
  }

  /**
   * Analyze user patterns and generate observation
   * @param {string} userId - User ID
   * @returns {Promise<Object|null>} Pattern observation message
   */
  async analyzeUserPatterns(userId) {
    if (!userId) return null;

    try {
      const [emotionJourney, ritualStats, memories] = await Promise.all([
        emotionDetectionService.getEmotionalJourney(userId, 14),
        ritualTrackingService.getRitualStats(userId, null, 14),
        userMemoryService.getRecentMemories(userId, 14),
      ]);

      // Simple pattern detection
      const patterns = [];

      // Emotion patterns
      if (emotionJourney?.length >= 7) {
        const avgFrequency = emotionJourney.reduce((sum, d) => sum + (d.avg_frequency || 0), 0) / emotionJourney.length;

        if (avgFrequency >= 300) {
          patterns.push({
            type: 'positive_trend',
            observation: 'tần số cảm xúc của bạn đang ở mức cao',
            interpretation: 'bạn đang trong trạng thái tốt',
          });
        } else if (avgFrequency < 175) {
          patterns.push({
            type: 'needs_attention',
            observation: 'tần số cảm xúc gần đây có xu hướng thấp',
            interpretation: 'có thể bạn đang cần thêm sự hỗ trợ',
          });
        }
      }

      // Ritual patterns
      if (ritualStats) {
        const completionRate = ritualStats.completion_rate || 0;

        if (completionRate >= 80) {
          patterns.push({
            type: 'consistency',
            observation: 'duy trì ritual rất đều đặn',
            interpretation: 'thói quen tích cực đang được hình thành',
          });
        } else if (completionRate < 50 && ritualStats.total_completions > 0) {
          patterns.push({
            type: 'declining',
            observation: 'tỷ lệ hoàn thành ritual đang giảm',
            interpretation: 'có thể cần điều chỉnh lịch trình',
          });
        }
      }

      if (patterns.length === 0) return null;

      // Generate message from patterns
      const profile = await userMemoryService.getUserProfile(userId);
      const name = profile?.preferred_name || profile?.display_name || 'bạn';
      const pattern = patterns[0];

      const template = MESSAGE_TEMPLATES.pattern_observation[
        Math.floor(Math.random() * MESSAGE_TEMPLATES.pattern_observation.length)
      ];

      const content = this._fillTemplate(template, {
        name,
        pattern: pattern.observation,
        observation: pattern.observation,
        interpretation: pattern.interpretation,
      });

      const message = await this.scheduleMessage(userId, {
        message_type: MESSAGE_TYPES.PATTERN_OBSERVATION,
        title: 'Quan sát từ GEM Master',
        content,
        scheduled_for: new Date().toISOString(),
        priority: 5,
        delivery_method: DELIVERY_METHODS.IN_APP,
        metadata: {
          patterns,
        },
      });

      return message;
    } catch (error) {
      console.error('[ProactiveAI] analyzeUserPatterns error:', error);
      return null;
    }
  }

  // ============================================================
  // MESSAGE MANAGEMENT
  // ============================================================

  /**
   * Schedule a proactive message
   * @param {string} userId - User ID
   * @param {Object} messageData - Message data
   * @returns {Promise<Object|null>} Scheduled message
   */
  async scheduleMessage(userId, messageData) {
    if (!userId || !messageData) return null;

    try {
      const { data, error } = await supabase
        .rpc('schedule_proactive_message', {
          p_user_id: userId,
          p_message_type: messageData.message_type,
          p_title: messageData.title,
          p_content: messageData.content,
          p_scheduled_for: messageData.scheduled_for,
          p_priority: messageData.priority || 5,
          p_delivery_method: messageData.delivery_method || DELIVERY_METHODS.IN_APP,
          p_metadata: messageData.metadata || {},
        });

      if (error) throw error;

      // Invalidate cache
      await cacheService.invalidate('PENDING_MESSAGES', userId);

      return { id: data, ...messageData };
    } catch (error) {
      console.error('[ProactiveAI] scheduleMessage error:', error);
      return null;
    }
  }

  /**
   * Get pending (unread) messages for user
   * @param {string} userId - User ID
   * @param {number} limit - Max messages
   * @returns {Promise<Array>} Pending messages
   */
  async getPendingMessages(userId, limit = 10) {
    if (!userId) return [];

    try {
      // Check cache
      const cached = await cacheService.getForUser('PENDING_MESSAGES', userId);
      if (cached) return cached;

      const { data, error } = await supabase
        .rpc('get_pending_proactive_messages', {
          p_user_id: userId,
          p_limit: limit,
        });

      if (error) throw error;

      // Cache results
      if (data) {
        await cacheService.setForUser('PENDING_MESSAGES', userId, data);
      }

      return data || [];
    } catch (error) {
      console.error('[ProactiveAI] getPendingMessages error:', error);
      return [];
    }
  }

  /**
   * Mark message as read
   * @param {string} messageId - Message ID
   * @param {string} userId - User ID
   * @returns {Promise<boolean>} Success status
   */
  async markMessageRead(messageId, userId) {
    if (!messageId || !userId) return false;

    try {
      const { data, error } = await supabase
        .rpc('mark_proactive_message_read', {
          p_message_id: messageId,
          p_user_id: userId,
        });

      if (error) throw error;

      // Invalidate cache
      await cacheService.invalidate('PENDING_MESSAGES', userId);

      return data || true;
    } catch (error) {
      console.error('[ProactiveAI] markMessageRead error:', error);
      return false;
    }
  }

  /**
   * Dismiss a message
   * @param {string} messageId - Message ID
   * @param {string} userId - User ID
   * @returns {Promise<boolean>} Success status
   */
  async dismissMessage(messageId, userId) {
    if (!messageId || !userId) return false;

    try {
      const { error } = await supabase
        .from('proactive_messages')
        .update({
          was_dismissed: true,
          dismissed_at: new Date().toISOString(),
        })
        .eq('id', messageId)
        .eq('user_id', userId);

      if (error) throw error;

      // Invalidate cache
      await cacheService.invalidate('PENDING_MESSAGES', userId);

      return true;
    } catch (error) {
      console.error('[ProactiveAI] dismissMessage error:', error);
      return false;
    }
  }

  /**
   * Record user response to message
   * @param {string} messageId - Message ID
   * @param {string} userId - User ID
   * @param {string} response - User's response
   * @returns {Promise<boolean>} Success status
   */
  async recordUserResponse(messageId, userId, response) {
    if (!messageId || !userId) return false;

    try {
      const { error } = await supabase
        .from('proactive_messages')
        .update({
          user_response: response,
          user_responded_at: new Date().toISOString(),
          was_read: true,
          read_at: new Date().toISOString(),
        })
        .eq('id', messageId)
        .eq('user_id', userId);

      if (error) throw error;

      // Invalidate cache
      await cacheService.invalidate('PENDING_MESSAGES', userId);

      return true;
    } catch (error) {
      console.error('[ProactiveAI] recordUserResponse error:', error);
      return false;
    }
  }

  // ============================================================
  // UTILITY METHODS
  // ============================================================

  /**
   * Fill template with values
   * @private
   */
  _fillTemplate(template, values) {
    let result = template;
    for (const [key, value] of Object.entries(values)) {
      result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
    }
    return result;
  }

  /**
   * Select insight category based on context
   * @private
   */
  _selectInsightCategory(streakSummary, emotionTrend) {
    if (emotionTrend?.trend === 'falling') {
      return 'tần số';
    }
    if (streakSummary?.currentStreak > 7) {
      return 'buổi sáng';
    }
    return 'buổi sáng';
  }

  /**
   * Check if streak is a milestone
   * @private
   */
  _isMilestone(streak) {
    const milestones = [7, 14, 21, 30, 60, 90, 100, 150, 200, 365];
    return milestones.includes(streak);
  }

  /**
   * Get message types enum
   * @returns {Object} Message types
   */
  getMessageTypes() {
    return MESSAGE_TYPES;
  }

  /**
   * Get delivery methods enum
   * @returns {Object} Delivery methods
   */
  getDeliveryMethods() {
    return DELIVERY_METHODS;
  }

  /**
   * Clear user's cache
   * @param {string} userId - User ID
   */
  async clearCache(userId) {
    if (userId) {
      await cacheService.invalidate('PENDING_MESSAGES', userId);
    }
  }
}

// Export singleton instance
export const proactiveAIService = new ProactiveAIService();
export default proactiveAIService;

// Export constants
export { MESSAGE_TYPES, DELIVERY_METHODS, MESSAGE_TEMPLATES };
