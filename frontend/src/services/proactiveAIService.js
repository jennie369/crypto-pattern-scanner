/**
 * Proactive AI Service (Web)
 * Ported from gem-mobile/src/services/proactiveAIService.js
 *
 * Generates and manages proactive AI messages:
 * Daily insights, streak alerts, ritual reminders, pattern observations.
 *
 * Adaptations:
 * - Uses web supabaseClient
 * - Uses simple in-memory cache instead of mobile cacheService
 * - Imports web versions of dependent services
 */

import { supabase } from '../lib/supabaseClient';
import { userMemoryService } from './userMemoryService';

// ============================================================
// MESSAGE TEMPLATES
// ============================================================

export const MESSAGE_TEMPLATES = {
  daily_insight: [
    {
      title: 'Suy ngam buoi sang',
      templates: [
        'Hom nay la ngay thu {days} trong hanh trinh cua ban. {name}, hay nho rang moi buoc nho deu quan trong.',
        'Chao buoi sang {name}! Nang luong hom nay cua ban bat dau tu suy nghi dau tien. Hay chon mot suy nghi tich cuc.',
        '{name}, ban da di duoc {days} ngay. Hom nay, hay tap trung vao dieu ban co the kiem soat.',
      ],
    },
    {
      title: 'Nhac nho tan so',
      templates: [
        'Tan so trung binh cua ban tuan nay la {frequency}Hz. Hay hit tho sau va nang cao nang luong!',
        '{name}, nang luong cua ban dang o muc {level}. Hay danh 5 phut de thien dinh va can bang.',
      ],
    },
  ],

  ritual_reminder: [
    'Da den gio "{ritual_name}"! Hay danh {duration} phut cho ban than.',
    'Nhac nho: {ritual_name} trong {minutes_until} phut nua. Ban da san sang chua?',
    '{name}, dung quen {ritual_name} hom nay nhe! Streak cua ban dang o {streak} ngay.',
  ],

  streak_alert: {
    at_risk: [
      'Streak {streak} ngay cua ban sap mat! Chi con vai gio de duy tri.',
      '{name}, dung de streak {streak} ngay bien mat! Hay hanh dong ngay.',
    ],
    broken: [
      'Streak truoc do cua ban la {previous_streak} ngay. Hom nay la ngay moi de bat dau lai!',
      'Khong sao {name}, moi bac thay deu co luc vap nga. Hay bat dau streak moi ngay hom nay.',
    ],
    milestone: [
      'Chuc mung! Ban da dat {streak} ngay lien tiep! Tiep tuc duy tri nhe!',
      '{name}, tuyet voi! {streak} ngay la mot cot moc dang nho. Hay tu hao ve ban than!',
    ],
  },

  pattern_observation: [
    '{name}, toi nhan thay ban thuong {pattern}. Day la dau hieu {interpretation}.',
    'Qua cac cuoc tro chuyen, toi thay {observation}. Ban co muon kham pha them khong?',
  ],

  encouragement: [
    'Moi ngay la mot co hoi moi de tro thanh phien ban tot nhat cua ban.',
    'Ban dang lam tot hon ban nghi, {name}. Hay tiep tuc!',
    'Hanh trinh {days} ngay cua ban la minh chung cho su kien tri.',
  ],

  celebration: [
    'Chuc mung {name}! Ban da dat duoc {achievement}!',
    'Tuyet voi! {achievement}. Hay tu thuong cho ban than ngay hom nay!',
  ],

  check_in: [
    '{name}, hom nay ban cam thay the nao? Toi o day de lang nghe.',
    'Da lau khong thay ban. Moi thu on chu {name}?',
  ],
};

export const MESSAGE_TYPES = {
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

export const DELIVERY_METHODS = {
  IN_APP: 'in_app',
  PUSH: 'push',
  BOTH: 'both',
  EMAIL: 'email',
};

// Simple in-memory cache
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000;

const getCached = (key) => {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL) {
    cache.delete(key);
    return null;
  }
  return entry.data;
};

const setCached = (key, data) => {
  cache.set(key, { data, timestamp: Date.now() });
};

const invalidateCache = (prefix, userId) => {
  const key = `${prefix}_${userId}`;
  cache.delete(key);
};

class ProactiveAIService {
  async generateDailyInsight(userId) {
    if (!userId) return null;

    try {
      const { data: hasSent } = await supabase
        .rpc('has_daily_insight_today', { p_user_id: userId });

      if (hasSent) return { alreadySent: true };

      const profile = await userMemoryService.getUserProfile(userId);
      const name = profile?.preferred_name || profile?.display_name || 'ban';
      const days = profile?.transformation_days || 0;

      const templates = MESSAGE_TEMPLATES.daily_insight[0].templates;
      const template = templates[Math.floor(Math.random() * templates.length)];
      const content = this._fillTemplate(template, { name, days, frequency: 200, level: 'trung binh', streak: 0 });

      const message = await this.scheduleMessage(userId, {
        message_type: MESSAGE_TYPES.DAILY_INSIGHT,
        title: 'Suy ngam hom nay',
        content,
        scheduled_for: new Date().toISOString(),
        priority: 5,
        delivery_method: DELIVERY_METHODS.IN_APP,
        metadata: { days, generated_at: new Date().toISOString() },
      });

      return message;
    } catch (error) {
      console.error('[ProactiveAI] generateDailyInsight error:', error);
      return null;
    }
  }

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

      invalidateCache('PENDING_MESSAGES', userId);
      return { id: data, ...messageData };
    } catch (error) {
      console.error('[ProactiveAI] scheduleMessage error:', error);
      return null;
    }
  }

  async getPendingMessages(userId, limit = 10) {
    if (!userId) return [];

    try {
      const cached = getCached(`PENDING_MESSAGES_${userId}`);
      if (cached) return cached;

      const { data, error } = await supabase
        .rpc('get_pending_proactive_messages', {
          p_user_id: userId,
          p_limit: limit,
        });

      if (error) throw error;

      if (data) setCached(`PENDING_MESSAGES_${userId}`, data);
      return data || [];
    } catch (error) {
      console.error('[ProactiveAI] getPendingMessages error:', error);
      return [];
    }
  }

  async markMessageRead(messageId, userId) {
    if (!messageId || !userId) return false;

    try {
      const { data, error } = await supabase
        .rpc('mark_proactive_message_read', {
          p_message_id: messageId,
          p_user_id: userId,
        });

      if (error) throw error;
      invalidateCache('PENDING_MESSAGES', userId);
      return data || true;
    } catch (error) {
      console.error('[ProactiveAI] markMessageRead error:', error);
      return false;
    }
  }

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
      invalidateCache('PENDING_MESSAGES', userId);
      return true;
    } catch (error) {
      console.error('[ProactiveAI] dismissMessage error:', error);
      return false;
    }
  }

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
      invalidateCache('PENDING_MESSAGES', userId);
      return true;
    } catch (error) {
      console.error('[ProactiveAI] recordUserResponse error:', error);
      return false;
    }
  }

  _fillTemplate(template, values) {
    let result = template;
    for (const [key, value] of Object.entries(values)) {
      result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
    }
    return result;
  }

  _isMilestone(streak) {
    const milestones = [7, 14, 21, 30, 60, 90, 100, 150, 200, 365];
    return milestones.includes(streak);
  }

  getMessageTypes() {
    return MESSAGE_TYPES;
  }

  getDeliveryMethods() {
    return DELIVERY_METHODS;
  }

  clearCache(userId) {
    if (userId) invalidateCache('PENDING_MESSAGES', userId);
  }
}

export const proactiveAIService = new ProactiveAIService();
export default proactiveAIService;
