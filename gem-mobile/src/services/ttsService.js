/**
 * TTS Service - FPT.AI AceSound Text-to-Speech
 * 9 Vietnamese voices (North/Central/South)
 *
 * Features:
 * - Generate audio from text
 * - Persona-to-voice mapping
 * - Emotion-based speed adjustment
 * - Response caching
 * - Latency tracking
 */

import { supabase } from './supabase';

// ============================================================================
// CONFIGURATION
// ============================================================================

const FPT_AI_API_URL = 'https://api.fpt.ai/hmi/tts/v5';

// 9 Vietnamese voices from FPT.AI
export const VOICES = {
  // Miền Bắc (Northern)
  banmai: {
    id: 'banmai',
    name: 'Ban Mai',
    displayName: 'Bạn Mai',
    region: 'north',
    gender: 'female',
    description: 'Giọng nữ miền Bắc, trẻ trung',
  },
  linhsan: {
    id: 'linhsan',
    name: 'Linh San',
    displayName: 'Linh San',
    region: 'north',
    gender: 'female',
    description: 'Giọng nữ miền Bắc, chuyên nghiệp',
  },
  thuminh: {
    id: 'thuminh',
    name: 'Thu Minh',
    displayName: 'Thu Minh',
    region: 'north',
    gender: 'female',
    description: 'Giọng nữ miền Bắc, ấm áp',
  },
  giahuy: {
    id: 'giahuy',
    name: 'Gia Huy',
    displayName: 'Gia Huy',
    region: 'north',
    gender: 'male',
    description: 'Giọng nam miền Bắc, trầm ấm',
  },
  minhquang: {
    id: 'minhquang',
    name: 'Minh Quang',
    displayName: 'Minh Quang',
    region: 'north',
    gender: 'male',
    description: 'Giọng nam miền Bắc, chuyên nghiệp',
  },
  ngoclam: {
    id: 'ngoclam',
    name: 'Ngoc Lam',
    displayName: 'Ngọc Lam',
    region: 'north',
    gender: 'female',
    description: 'Giọng nữ miền Bắc, nhẹ nhàng',
  },

  // Miền Trung (Central)
  myan: {
    id: 'myan',
    name: 'My An',
    displayName: 'Mỹ An',
    region: 'central',
    gender: 'female',
    description: 'Giọng nữ miền Trung',
  },

  // Miền Nam (Southern)
  lannhi: {
    id: 'lannhi',
    name: 'Lan Nhi',
    displayName: 'Lan Nhi',
    region: 'south',
    gender: 'female',
    description: 'Giọng nữ miền Nam, ngọt ngào',
  },
  leminh: {
    id: 'leminh',
    name: 'Le Minh',
    displayName: 'Lê Minh',
    region: 'south',
    gender: 'male',
    description: 'Giọng nam miền Nam, thân thiện',
  },
};

// Persona to voice mapping
export const PERSONA_VOICES = {
  SuPhu: 'banmai', // Sư Phụ - wise, calm female voice
  CoGiao: 'linhsan', // Cô Giáo - professional female voice
  BanThan: 'lannhi', // Bạn Thân - friendly southern female voice
};

// Emotion to speed/pitch adjustment
const EMOTION_SETTINGS = {
  happy: { speed: '1', pitch: '1' }, // Normal, slightly upbeat
  excited: { speed: '0', pitch: '1' }, // Faster (0 = fastest in FPT.AI)
  sad: { speed: '2', pitch: '-1' }, // Slower
  angry: { speed: '1', pitch: '0' }, // Normal speed, lower pitch
  calm: { speed: '3', pitch: '0' }, // Slowest
  neutral: { speed: '1', pitch: '0' }, // Normal
  curious: { speed: '1', pitch: '1' }, // Normal with slight rise
  surprised: { speed: '0', pitch: '1' }, // Fast with higher pitch
};

// ============================================================================
// TTS SERVICE CLASS
// ============================================================================

class TTSService {
  constructor() {
    this.currentVoice = 'banmai';
    this.cache = new Map();
    this.cacheMaxSize = 100;
    this.cacheTTL = 5 * 60 * 1000; // 5 minutes
  }

  // ========== VOICE MANAGEMENT ==========

  /**
   * Set current voice by ID
   */
  setVoice(voiceId) {
    if (VOICES[voiceId]) {
      this.currentVoice = voiceId;
      console.log('[TTSService] Voice set to:', VOICES[voiceId].displayName);
      return true;
    }
    console.warn('[TTSService] Unknown voice:', voiceId);
    return false;
  }

  /**
   * Set voice by persona
   */
  setVoiceByPersona(persona) {
    const voiceId = PERSONA_VOICES[persona] || 'banmai';
    return this.setVoice(voiceId);
  }

  /**
   * Get current voice info
   */
  getCurrentVoice() {
    return VOICES[this.currentVoice];
  }

  /**
   * Get all available voices
   */
  getAvailableVoices() {
    return Object.values(VOICES);
  }

  /**
   * Get voices by region
   */
  getVoicesByRegion(region) {
    return Object.values(VOICES).filter((v) => v.region === region);
  }

  // ========== AUDIO GENERATION ==========

  /**
   * Generate audio from text
   * Uses Supabase Edge Function to proxy FPT.AI API (hide API key)
   *
   * @param {string} text - Text to convert to speech
   * @param {object} options - { voice, speed, format }
   * @returns {object} { audioUrl, duration, latency }
   */
  async generateAudio(text, options = {}) {
    const startTime = Date.now();

    // Validate text
    if (!text || text.trim().length === 0) {
      throw new Error('Text is required');
    }

    // Truncate long text (FPT.AI limit is ~5000 chars)
    const truncatedText = text.slice(0, 5000);

    // Build cache key
    const voice = options.voice || this.currentVoice;
    const speed = options.speed || '1';
    const cacheKey = this._getCacheKey(truncatedText, voice, speed);

    // Check cache
    const cached = this._getFromCache(cacheKey);
    if (cached) {
      console.log('[TTSService] Cache hit');
      return {
        ...cached,
        fromCache: true,
        latency: Date.now() - startTime,
      };
    }

    try {
      // Call Supabase Edge Function (or direct API if key is available)
      const result = await this._callTTSAPI(truncatedText, {
        voice,
        speed,
        format: options.format || 'mp3',
      });

      const latency = Date.now() - startTime;

      const response = {
        audioUrl: result.async, // FPT.AI returns async URL
        duration: result.duration || this._estimateDuration(truncatedText),
        latency,
        voice,
        fromCache: false,
      };

      // Cache result
      this._addToCache(cacheKey, response);

      console.log(`[TTSService] Generated in ${latency}ms, voice: ${voice}`);
      return response;
    } catch (error) {
      console.error('[TTSService] Generation error:', error);
      throw error;
    }
  }

  /**
   * Generate audio with emotion adjustment
   * Adjusts speed based on emotion
   *
   * @param {string} text - Text to convert
   * @param {string} emotion - Emotion type
   * @returns {object} { audioUrl, duration, latency, emotion }
   */
  async generateWithEmotion(text, emotion = 'neutral') {
    const settings = EMOTION_SETTINGS[emotion] || EMOTION_SETTINGS.neutral;

    const result = await this.generateAudio(text, {
      speed: settings.speed,
    });

    return {
      ...result,
      emotion,
      emotionSettings: settings,
    };
  }

  /**
   * Generate audio for livestream response
   * Includes persona and emotion handling
   *
   * @param {string} text - Response text
   * @param {object} options - { persona, emotion }
   * @returns {object} Full TTS result
   */
  async generateForLivestream(text, options = {}) {
    // Set voice by persona if provided
    if (options.persona) {
      this.setVoiceByPersona(options.persona);
    }

    // Generate with emotion if provided
    if (options.emotion) {
      return this.generateWithEmotion(text, options.emotion);
    }

    return this.generateAudio(text);
  }

  // ========== INTERNAL METHODS ==========

  /**
   * Call TTS API (via Edge Function or direct)
   */
  async _callTTSAPI(text, options) {
    // Try Edge Function first (recommended - hides API key)
    try {
      const { data, error } = await supabase.functions.invoke('fpt-tts', {
        body: {
          text,
          voice: options.voice,
          speed: options.speed,
          format: options.format,
        },
      });

      if (error) throw error;
      return data;
    } catch (edgeFunctionError) {
      console.warn(
        '[TTSService] Edge function failed, trying direct API:',
        edgeFunctionError.message
      );

      // Fallback to direct API call (requires EXPO_PUBLIC_FPT_AI_API_KEY)
      return this._callDirectAPI(text, options);
    }
  }

  /**
   * Direct FPT.AI API call (fallback)
   */
  async _callDirectAPI(text, options) {
    const apiKey = process.env.EXPO_PUBLIC_FPT_AI_API_KEY;

    if (!apiKey) {
      throw new Error('FPT.AI API key not configured');
    }

    const controller = new AbortController();
    const fetchTimeout = setTimeout(() => controller.abort(), 15000);
    let response;
    try {
      response = await fetch(FPT_AI_API_URL, {
        method: 'POST',
        headers: {
          'api-key': apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          voice: options.voice,
          speed: options.speed,
          format: options.format || 'mp3',
        }),
        signal: controller.signal,
      });
    } finally {
      clearTimeout(fetchTimeout);
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`FPT.AI API error: ${response.status} - ${errorText}`);
    }

    return response.json();
  }

  /**
   * Estimate audio duration based on text length
   * Approximate: 150 words per minute
   */
  _estimateDuration(text) {
    const words = text.split(/\s+/).length;
    return Math.ceil((words / 150) * 60); // seconds
  }

  // ========== CACHE MANAGEMENT ==========

  _getCacheKey(text, voice, speed) {
    // Simple hash for cache key
    const hash = text.slice(0, 50) + text.length + voice + speed;
    return hash;
  }

  _getFromCache(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
      return cached.data;
    }
    // Remove expired
    if (cached) {
      this.cache.delete(key);
    }
    return null;
  }

  _addToCache(key, data) {
    // Limit cache size
    if (this.cache.size >= this.cacheMaxSize) {
      // Remove oldest entry
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  /**
   * Clear all cached audio
   */
  clearCache() {
    this.cache.clear();
    console.log('[TTSService] Cache cleared');
  }

  // ========== UTILITY METHODS ==========

  /**
   * Test TTS connection
   */
  async testConnection() {
    try {
      const result = await this.generateAudio('Xin chào', {
        voice: 'banmai',
      });
      return {
        success: true,
        latency: result.latency,
        audioUrl: result.audioUrl,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get service stats
   */
  getStats() {
    return {
      currentVoice: this.getCurrentVoice(),
      cacheSize: this.cache.size,
      cacheMaxSize: this.cacheMaxSize,
      cacheTTL: this.cacheTTL,
    };
  }
}

// ============================================================================
// SINGLETON EXPORT
// ============================================================================

export const ttsService = new TTSService();
export default ttsService;
