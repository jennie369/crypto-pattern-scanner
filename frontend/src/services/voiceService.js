/**
 * Voice Service (Web)
 * Enhanced version of voiceInput.js with quota tracking.
 * Ported from gem-mobile/src/services/voiceService.js
 *
 * Uses Web Speech API (webkitSpeechRecognition / SpeechRecognition).
 * Adds quota management via Supabase (voice_usage table).
 *
 * QUOTA SYSTEM:
 * - FREE: 3 voice messages/day
 * - TIER1+: Unlimited
 */

import { supabase } from '../lib/supabaseClient';

// Inline tier normalization
const normalizeTier = (tier) => {
  if (!tier) return 'FREE';
  const upper = tier.toUpperCase();
  const map = {
    'STARTER': 'FREE', 'PRO': 'TIER1', 'PREMIUM': 'TIER2',
    'VIP': 'TIER3', 'FREE': 'FREE', 'TIER1': 'TIER1',
    'TIER2': 'TIER2', 'TIER3': 'TIER3', 'ADMIN': 'ADMIN',
    'MANAGER': 'ADMIN',
  };
  return map[upper] || 'FREE';
};

const FREE_VOICE_LIMIT = 3;

class VoiceService {
  constructor() {
    this.recognition = null;
    this.isListening = false;
    this._initRecognition();
  }

  _initRecognition() {
    if (typeof window === 'undefined') return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn('[VoiceService] Speech recognition not supported in this browser');
      return;
    }

    this.recognition = new SpeechRecognition();
    this.recognition.continuous = false;
    this.recognition.interimResults = true;
    this.recognition.maxAlternatives = 1;
    this.recognition.lang = 'vi-VN';
  }

  isSupported() {
    return this.recognition !== null;
  }

  setLanguage(lang) {
    if (this.recognition) {
      this.recognition.lang = lang;
    }
  }

  /**
   * Start voice recognition
   * @param {Function} onResult - (transcript, isFinal) => void
   * @param {Function} onEnd - () => void
   * @param {Function} onError - (error) => void
   * @returns {boolean} true if started
   */
  startRecording(onResult, onEnd, onError) {
    if (!this.recognition) {
      onError?.('Speech recognition not supported');
      return false;
    }

    if (this.isListening) {
      this.stopRecording();
    }

    this.recognition.onresult = (event) => {
      const last = event.results.length - 1;
      const transcript = event.results[last][0].transcript;
      const isFinal = event.results[last].isFinal;
      onResult?.(transcript, isFinal);
    };

    this.recognition.onend = () => {
      this.isListening = false;
      onEnd?.();
    };

    this.recognition.onerror = (event) => {
      this.isListening = false;
      onError?.(event.error);
    };

    try {
      this.recognition.start();
      this.isListening = true;
      return true;
    } catch (error) {
      console.error('[VoiceService] Start error:', error);
      this.isListening = false;
      onError?.(error.message);
      return false;
    }
  }

  stopRecording() {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch (e) {
        // Ignore - may already be stopped
      }
      this.isListening = false;
    }
  }

  cancelRecording() {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.abort();
      } catch (e) {
        // Ignore
      }
      this.isListening = false;
    }
  }

  // ============================================
  // QUOTA MANAGEMENT
  // ============================================

  getVietnamDate() {
    const now = new Date();
    const vietnamOffset = 7 * 60;
    const localOffset = now.getTimezoneOffset();
    const vietnamTime = new Date(now.getTime() + (vietnamOffset + localOffset) * 60 * 1000);
    return vietnamTime.toISOString().split('T')[0];
  }

  async getTodayVoiceCount(userId) {
    if (!userId) return 0;

    try {
      const today = this.getVietnamDate();
      const { data, error } = await supabase
        .from('voice_usage')
        .select('count')
        .eq('user_id', userId)
        .eq('date', today)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('[VoiceService] Get voice count error:', error);
        return 0;
      }

      return data?.count || 0;
    } catch (error) {
      console.error('[VoiceService] Get voice count error:', error);
      return 0;
    }
  }

  async incrementVoiceCount(userId) {
    if (!userId) return false;

    try {
      const today = this.getVietnamDate();

      const { data: existing } = await supabase
        .from('voice_usage')
        .select('count')
        .eq('user_id', userId)
        .eq('date', today)
        .single();

      if (existing) {
        const { error } = await supabase
          .from('voice_usage')
          .update({ count: existing.count + 1, updated_at: new Date().toISOString() })
          .eq('user_id', userId)
          .eq('date', today);

        if (error) {
          console.error('[VoiceService] Update voice count error:', error);
          return false;
        }
      } else {
        const { error } = await supabase
          .from('voice_usage')
          .insert({ user_id: userId, date: today, count: 1, updated_at: new Date().toISOString() });

        if (error) {
          console.error('[VoiceService] Insert voice count error:', error);
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error('[VoiceService] Increment voice count error:', error);
      return false;
    }
  }

  async canUseVoice(userId, userTier) {
    const normalized = normalizeTier(userTier);

    if (normalized !== 'FREE') {
      return { canUse: true, remaining: -1, limit: -1, reason: null };
    }

    const todayCount = await this.getTodayVoiceCount(userId);

    if (todayCount >= FREE_VOICE_LIMIT) {
      return { canUse: false, remaining: 0, limit: FREE_VOICE_LIMIT, reason: 'voice_limit_reached' };
    }

    return {
      canUse: true,
      remaining: FREE_VOICE_LIMIT - todayCount,
      limit: FREE_VOICE_LIMIT,
      reason: null,
    };
  }

  async getVoiceQuotaInfo(userId, userTier) {
    const normalized = normalizeTier(userTier);

    if (normalized !== 'FREE') {
      return {
        isUnlimited: true,
        canUse: true,
        used: 0,
        limit: -1,
        remaining: -1,
        displayText: 'Khong gioi han',
      };
    }

    const todayCount = await this.getTodayVoiceCount(userId);
    const remaining = Math.max(0, FREE_VOICE_LIMIT - todayCount);

    return {
      isUnlimited: false,
      canUse: remaining > 0,
      used: todayCount,
      limit: FREE_VOICE_LIMIT,
      remaining,
      displayText: `${remaining}/${FREE_VOICE_LIMIT} con lai`,
    };
  }
}

const voiceService = new VoiceService();

export default voiceService;
export { VoiceService };
