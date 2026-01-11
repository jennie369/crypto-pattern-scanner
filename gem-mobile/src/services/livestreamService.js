/**
 * Livestream Service - Orchestration Layer
 * Coordinates TTS, Avatar, and Database operations for AI Livestream
 *
 * Features:
 * - Generate complete AI response (text → audio → video)
 * - Session management (create, start, end)
 * - Comment handling
 * - Real-time subscriptions
 * - Latency tracking
 */

import { supabase } from './supabase';
import { ttsService, PERSONA_VOICES } from './ttsService';
import { avatarService } from './avatarService';

// ============================================================================
// CONFIGURATION
// ============================================================================

// Default persona settings
const DEFAULT_PERSONA = 'SuPhu';

// Response generation timeout (ms)
const RESPONSE_TIMEOUT = 30000; // 30 seconds

// ============================================================================
// LIVESTREAM SERVICE CLASS
// ============================================================================

class LivestreamService {
  constructor() {
    this.currentSession = null;
    this.currentPersona = DEFAULT_PERSONA;
    this.subscriptions = [];
    this.listeners = new Map();
    this.isInitialized = false;
  }

  // ========== INITIALIZATION ==========

  /**
   * Initialize service with persona
   */
  async initialize(persona = DEFAULT_PERSONA) {
    this.currentPersona = persona;

    // Set TTS voice for persona
    ttsService.setVoiceByPersona(persona);

    // Set Avatar for persona
    avatarService.setAvatarByPersona(persona);

    this.isInitialized = true;
    console.log(`[LivestreamService] Initialized with persona: ${persona}`);

    return { success: true, persona };
  }

  /**
   * Set current persona (changes voice and avatar)
   */
  setPersona(persona) {
    this.currentPersona = persona;
    ttsService.setVoiceByPersona(persona);
    avatarService.setAvatarByPersona(persona);
    console.log(`[LivestreamService] Persona changed to: ${persona}`);
  }

  // ========== RESPONSE GENERATION ==========

  /**
   * Generate complete AI response with audio and video
   *
   * @param {string} text - Response text
   * @param {object} options - { persona, emotion }
   * @returns {object} { audioUrl, videoUrl, latency }
   */
  async generateResponse(text, options = {}) {
    const startTime = Date.now();

    const persona = options.persona || this.currentPersona;
    const emotion = options.emotion || 'neutral';

    console.log(
      `[LivestreamService] Generating response: persona=${persona}, emotion=${emotion}, text length=${text.length}`
    );

    try {
      // Step 1: Generate audio with TTS
      const ttsResult = await ttsService.generateForLivestream(text, {
        persona,
        emotion,
      });

      console.log(`[LivestreamService] TTS complete in ${ttsResult.latency}ms`);

      // Step 2: Generate video with Avatar
      const avatarResult = await avatarService.generateForLivestream(
        ttsResult.audioUrl,
        {
          persona,
          emotion,
        }
      );

      console.log(
        `[LivestreamService] Avatar complete in ${avatarResult.totalLatency}ms`
      );

      const totalLatency = Date.now() - startTime;

      return {
        text,
        audioUrl: ttsResult.audioUrl,
        videoUrl: avatarResult.videoUrl,
        duration: avatarResult.duration,
        persona,
        emotion,
        voice: ttsResult.voice,
        expression: avatarResult.expression,
        latency: {
          tts: ttsResult.latency,
          avatar: avatarResult.totalLatency,
          total: totalLatency,
        },
      };
    } catch (error) {
      console.error('[LivestreamService] Generation error:', error);
      throw error;
    }
  }

  /**
   * Generate audio-only response (no video)
   * Faster for quick responses
   */
  async generateAudioResponse(text, options = {}) {
    const persona = options.persona || this.currentPersona;
    const emotion = options.emotion || 'neutral';

    const result = await ttsService.generateForLivestream(text, {
      persona,
      emotion,
    });

    return {
      text,
      audioUrl: result.audioUrl,
      duration: result.duration,
      persona,
      emotion,
      voice: result.voice,
      latency: result.latency,
    };
  }

  // ========== SESSION MANAGEMENT ==========

  /**
   * Create a new livestream session
   */
  async createSession(sessionData) {
    try {
      const { data, error } = await supabase
        .from('livestream_sessions')
        .insert({
          title: sessionData.title || 'Livestream mới',
          description: sessionData.description || '',
          thumbnail_url: sessionData.thumbnailUrl,
          scheduled_start: sessionData.scheduledStart,
          persona: sessionData.persona || this.currentPersona,
          voice_id: PERSONA_VOICES[sessionData.persona || this.currentPersona],
          platforms: sessionData.platforms || { gemral: true },
          created_by: sessionData.createdBy,
        })
        .select()
        .single();

      if (error) throw error;

      console.log(`[LivestreamService] Session created: ${data.id}`);
      return { success: true, session: data };
    } catch (error) {
      console.error('[LivestreamService] Create session error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Start a livestream session (change status to 'live')
   */
  async startSession(sessionId) {
    try {
      const { data, error } = await supabase
        .from('livestream_sessions')
        .update({
          status: 'live',
          actual_start: new Date().toISOString(),
        })
        .eq('id', sessionId)
        .select()
        .single();

      if (error) throw error;

      this.currentSession = data;
      console.log(`[LivestreamService] Session started: ${sessionId}`);

      return { success: true, session: data };
    } catch (error) {
      console.error('[LivestreamService] Start session error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * End a livestream session
   */
  async endSession(sessionId) {
    try {
      const { data, error } = await supabase
        .from('livestream_sessions')
        .update({
          status: 'ended',
          actual_end: new Date().toISOString(),
        })
        .eq('id', sessionId)
        .select()
        .single();

      if (error) throw error;

      // Calculate duration
      if (data.actual_start) {
        const duration = Math.round(
          (new Date(data.actual_end) - new Date(data.actual_start)) / 60000
        );
        await supabase
          .from('livestream_sessions')
          .update({ duration_minutes: duration })
          .eq('id', sessionId);
      }

      this.currentSession = null;
      this.cleanup();

      console.log(`[LivestreamService] Session ended: ${sessionId}`);
      return { success: true, session: data };
    } catch (error) {
      console.error('[LivestreamService] End session error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get current active session
   */
  async getActiveSession() {
    try {
      const { data, error } = await supabase
        .from('livestream_sessions')
        .select('*')
        .eq('status', 'live')
        .order('actual_start', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows

      return { success: true, session: data || null };
    } catch (error) {
      console.error('[LivestreamService] Get active session error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get session by ID
   */
  async getSession(sessionId) {
    try {
      const { data, error } = await supabase
        .from('livestream_sessions')
        .select('*')
        .eq('id', sessionId)
        .single();

      if (error) throw error;
      return { success: true, session: data };
    } catch (error) {
      console.error('[LivestreamService] Get session error:', error);
      return { success: false, error: error.message };
    }
  }

  // ========== COMMENTS ==========

  /**
   * Send a comment to the current session
   */
  async sendComment(sessionId, commentData) {
    try {
      const { data, error } = await supabase
        .from('livestream_comments')
        .insert({
          session_id: sessionId,
          user_id: commentData.userId,
          platform: commentData.platform || 'gemral',
          platform_username: commentData.username,
          platform_avatar: commentData.avatar,
          message: commentData.message,
          has_gift: commentData.hasGift || false,
          gift_type: commentData.giftType,
          gift_value: commentData.giftValue || 0,
        })
        .select()
        .single();

      if (error) throw error;

      console.log(`[LivestreamService] Comment sent: ${data.id}`);
      return { success: true, comment: data };
    } catch (error) {
      console.error('[LivestreamService] Send comment error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get comments for a session
   */
  async getComments(sessionId, options = {}) {
    try {
      let query = supabase
        .from('livestream_comments')
        .select('*')
        .eq('session_id', sessionId)
        .eq('is_hidden', false)
        .eq('is_spam', false)
        .order('created_at', { ascending: false });

      if (options.limit) {
        query = query.limit(options.limit);
      }

      const { data, error } = await query;

      if (error) throw error;
      return { success: true, comments: data };
    } catch (error) {
      console.error('[LivestreamService] Get comments error:', error);
      return { success: false, error: error.message };
    }
  }

  // ========== REAL-TIME SUBSCRIPTIONS ==========

  /**
   * Subscribe to session comments (real-time)
   */
  subscribeToComments(sessionId, callback) {
    const subscription = supabase
      .channel(`comments:${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'livestream_comments',
          filter: `session_id=eq.${sessionId}`,
        },
        (payload) => {
          console.log('[LivestreamService] New comment:', payload.new.id);
          callback(payload.new);
        }
      )
      .subscribe();

    this.subscriptions.push(subscription);

    return () => {
      subscription.unsubscribe();
      this.subscriptions = this.subscriptions.filter((s) => s !== subscription);
    };
  }

  /**
   * Subscribe to session status changes
   */
  subscribeToSession(sessionId, callback) {
    const subscription = supabase
      .channel(`session:${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'livestream_sessions',
          filter: `id=eq.${sessionId}`,
        },
        (payload) => {
          console.log('[LivestreamService] Session updated:', payload.new.status);
          callback(payload.new);
        }
      )
      .subscribe();

    this.subscriptions.push(subscription);

    return () => {
      subscription.unsubscribe();
      this.subscriptions = this.subscriptions.filter((s) => s !== subscription);
    };
  }

  // ========== AI RESPONSE LOGGING ==========

  /**
   * Log an AI response to the database
   */
  async logAIResponse(responseData) {
    try {
      const { data, error } = await supabase
        .from('ai_responses')
        .insert({
          session_id: responseData.sessionId,
          comment_id: responseData.commentId,
          response_text: responseData.text,
          response_tier: responseData.tier || 1,
          persona: responseData.persona,
          voice_id: responseData.voiceId,
          voice_settings: responseData.voiceSettings,
          avatar_expression: responseData.expression,
          audio_url: responseData.audioUrl,
          video_url: responseData.videoUrl,
          tts_latency_ms: responseData.ttsLatency,
          avatar_latency_ms: responseData.avatarLatency,
          total_latency_ms: responseData.totalLatency,
          tokens_used: responseData.tokensUsed,
        })
        .select()
        .single();

      if (error) throw error;
      return { success: true, response: data };
    } catch (error) {
      console.error('[LivestreamService] Log AI response error:', error);
      return { success: false, error: error.message };
    }
  }

  // ========== HEALTH CHECK ==========

  /**
   * Check all service dependencies
   */
  async healthCheck() {
    const results = {
      tts: { status: 'unknown' },
      avatar: { status: 'unknown' },
      database: { status: 'unknown' },
    };

    // Check TTS
    try {
      const ttsTest = await ttsService.testConnection();
      results.tts = {
        status: ttsTest.success ? 'healthy' : 'unhealthy',
        latency: ttsTest.latency,
        error: ttsTest.error,
      };
    } catch (e) {
      results.tts = { status: 'unhealthy', error: e.message };
    }

    // Check Avatar
    try {
      const avatarHealth = await avatarService.healthCheck();
      results.avatar = {
        status: avatarHealth.healthy ? 'healthy' : 'unhealthy',
        gpuAvailable: avatarHealth.gpuAvailable,
        error: avatarHealth.error,
      };
    } catch (e) {
      results.avatar = { status: 'unhealthy', error: e.message };
    }

    // Check Database
    try {
      const { data, error } = await supabase
        .from('livestream_sessions')
        .select('count')
        .limit(1);
      results.database = {
        status: error ? 'unhealthy' : 'healthy',
        error: error?.message,
      };
    } catch (e) {
      results.database = { status: 'unhealthy', error: e.message };
    }

    const allHealthy = Object.values(results).every(
      (r) => r.status === 'healthy'
    );

    return {
      healthy: allHealthy,
      services: results,
    };
  }

  // ========== CLEANUP ==========

  /**
   * Cleanup subscriptions and resources
   */
  cleanup() {
    // Unsubscribe from all channels
    this.subscriptions.forEach((sub) => {
      try {
        sub.unsubscribe();
      } catch (e) {
        console.warn('[LivestreamService] Cleanup error:', e);
      }
    });
    this.subscriptions = [];

    // Clear caches
    ttsService.clearCache();

    console.log('[LivestreamService] Cleanup complete');
  }

  // ========== UTILITY ==========

  /**
   * Get service status
   */
  getStatus() {
    return {
      initialized: this.isInitialized,
      currentPersona: this.currentPersona,
      currentSession: this.currentSession,
      activeSubscriptions: this.subscriptions.length,
      ttsVoice: ttsService.getCurrentVoice(),
      avatar: avatarService.getCurrentAvatar(),
    };
  }
}

// ============================================================================
// SINGLETON EXPORT
// ============================================================================

export const livestreamService = new LivestreamService();
export default livestreamService;
