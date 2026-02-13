/**
 * Avatar Service - MuseTalk Integration
 * Connects to MuseTalk API Server running on local PC
 *
 * Features:
 * - Generate lip-synced avatar video from audio
 * - 7 facial expressions
 * - 4 avatar personas
 * - Health check
 * - Latency tracking
 */

// ============================================================================
// CONFIGURATION
// ============================================================================

// MuseTalk API URL (PC local with ngrok/cloudflare tunnel)
// Set this in .env as EXPO_PUBLIC_MUSETALK_API_URL
const MUSETALK_API_URL =
  process.env.EXPO_PUBLIC_MUSETALK_API_URL || 'http://localhost:8000';

// Available avatars
export const AVATARS = {
  default: {
    id: 'default',
    name: 'Default',
    displayName: 'Mặc định',
    description: 'Avatar mặc định',
  },
  sufu: {
    id: 'sufu',
    name: 'Su Phu',
    displayName: 'Sư Phụ',
    description: 'Avatar Sư Phụ - Người hướng dẫn tâm thức',
  },
  cogiao: {
    id: 'cogiao',
    name: 'Co Giao',
    displayName: 'Cô Giáo',
    description: 'Avatar Cô Giáo - Chuyên gia crystals',
  },
  banthan: {
    id: 'banthan',
    name: 'Ban Than',
    displayName: 'Bạn Thân',
    description: 'Avatar Bạn Thân - Người bạn thân thiện',
  },
};

// Available expressions
export const EXPRESSIONS = {
  neutral: {
    id: 'neutral',
    name: 'Neutral',
    displayName: 'Bình thường',
    description: 'Biểu cảm trung tính',
  },
  happy: {
    id: 'happy',
    name: 'Happy',
    displayName: 'Vui vẻ',
    description: 'Mỉm cười, vui vẻ',
  },
  sad: {
    id: 'sad',
    name: 'Sad',
    displayName: 'Buồn',
    description: 'Biểu cảm buồn, đồng cảm',
  },
  excited: {
    id: 'excited',
    name: 'Excited',
    displayName: 'Phấn khích',
    description: 'Hào hứng, năng lượng cao',
  },
  calm: {
    id: 'calm',
    name: 'Calm',
    displayName: 'Bình tĩnh',
    description: 'Thư giãn, bình an',
  },
  thinking: {
    id: 'thinking',
    name: 'Thinking',
    displayName: 'Suy nghĩ',
    description: 'Đang suy nghĩ, tập trung',
  },
  surprised: {
    id: 'surprised',
    name: 'Surprised',
    displayName: 'Ngạc nhiên',
    description: 'Ngạc nhiên, ấn tượng',
  },
};

// Emotion to expression mapping
const EMOTION_TO_EXPRESSION = {
  happy: 'happy',
  excited: 'excited',
  sad: 'sad',
  angry: 'neutral', // No angry expression, use neutral
  neutral: 'neutral',
  curious: 'thinking',
  confused: 'thinking',
  surprised: 'surprised',
  calm: 'calm',
  fearful: 'sad',
};

// Persona to avatar mapping
const PERSONA_TO_AVATAR = {
  SuPhu: 'sufu',
  CoGiao: 'cogiao',
  BanThan: 'banthan',
};

// ============================================================================
// AVATAR SERVICE CLASS
// ============================================================================

class AvatarService {
  constructor() {
    this.currentAvatar = 'sufu';
    this.currentExpression = 'neutral';
    this.isHealthy = false;
    this.lastHealthCheck = null;
  }

  // ========== AVATAR MANAGEMENT ==========

  /**
   * Set current avatar by ID
   */
  setAvatar(avatarId) {
    if (AVATARS[avatarId]) {
      this.currentAvatar = avatarId;
      console.log('[AvatarService] Avatar set to:', AVATARS[avatarId].displayName);
      return true;
    }
    console.warn('[AvatarService] Unknown avatar:', avatarId);
    return false;
  }

  /**
   * Set avatar by persona
   */
  setAvatarByPersona(persona) {
    const avatarId = PERSONA_TO_AVATAR[persona] || 'sufu';
    return this.setAvatar(avatarId);
  }

  /**
   * Get current avatar info
   */
  getCurrentAvatar() {
    return AVATARS[this.currentAvatar];
  }

  /**
   * Get all available avatars
   */
  getAvailableAvatars() {
    return Object.values(AVATARS);
  }

  // ========== EXPRESSION MANAGEMENT ==========

  /**
   * Set current expression
   */
  setExpression(expressionId) {
    if (EXPRESSIONS[expressionId]) {
      this.currentExpression = expressionId;
      return true;
    }
    return false;
  }

  /**
   * Get expression from emotion
   */
  getExpressionFromEmotion(emotion) {
    return EMOTION_TO_EXPRESSION[emotion] || 'neutral';
  }

  /**
   * Get all available expressions
   */
  getAvailableExpressions() {
    return Object.values(EXPRESSIONS);
  }

  // ========== VIDEO GENERATION ==========

  /**
   * Generate lip-synced avatar video from audio URL
   *
   * @param {string} audioUrl - URL to audio file
   * @param {object} options - { avatarId, expression }
   * @returns {object} { videoUrl, duration, latency }
   */
  async generateVideo(audioUrl, options = {}) {
    const startTime = Date.now();

    if (!audioUrl) {
      throw new Error('Audio URL is required');
    }

    const avatarId = options.avatarId || this.currentAvatar;
    const expression = options.expression || this.currentExpression;

    console.log(
      `[AvatarService] Generating video: avatar=${avatarId}, expression=${expression}`
    );

    try {
      const response = await fetch(`${MUSETALK_API_URL}/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          audio_url: audioUrl,
          avatar_id: avatarId,
          expression: expression,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.detail || `MuseTalk API error: ${response.status}`
        );
      }

      const data = await response.json();
      const totalLatency = Date.now() - startTime;

      // Build full video URL
      const videoUrl = data.video_url.startsWith('http')
        ? data.video_url
        : `${MUSETALK_API_URL}${data.video_url}`;

      console.log(`[AvatarService] Generated in ${totalLatency}ms: ${videoUrl}`);

      return {
        videoUrl,
        duration: data.duration,
        avatarLatency: data.latency_ms,
        totalLatency,
        avatarId,
        expression,
      };
    } catch (error) {
      console.error('[AvatarService] Generation error:', error);
      throw error;
    }
  }

  /**
   * Generate video with emotion (auto-maps to expression)
   *
   * @param {string} audioUrl - URL to audio file
   * @param {string} emotion - Emotion type
   * @returns {object} Video generation result
   */
  async generateWithEmotion(audioUrl, emotion) {
    const expression = this.getExpressionFromEmotion(emotion);
    return this.generateVideo(audioUrl, { expression });
  }

  /**
   * Generate video for livestream
   * Sets both avatar by persona and expression by emotion
   *
   * @param {string} audioUrl - Audio URL
   * @param {object} options - { persona, emotion }
   * @returns {object} Video result
   */
  async generateForLivestream(audioUrl, options = {}) {
    // Set avatar by persona if provided
    if (options.persona) {
      this.setAvatarByPersona(options.persona);
    }

    // Get expression from emotion if provided
    const expression = options.emotion
      ? this.getExpressionFromEmotion(options.emotion)
      : this.currentExpression;

    return this.generateVideo(audioUrl, {
      avatarId: this.currentAvatar,
      expression,
    });
  }

  // ========== HEALTH CHECK ==========

  /**
   * Check if MuseTalk API is healthy
   */
  async healthCheck() {
    try {
      const response = await fetch(`${MUSETALK_API_URL}/health`, {
        method: 'GET',
        timeout: 5000,
      });

      if (!response.ok) {
        this.isHealthy = false;
        return { healthy: false, error: `HTTP ${response.status}` };
      }

      const data = await response.json();
      this.isHealthy = data.status === 'healthy';
      this.lastHealthCheck = new Date();

      return {
        healthy: this.isHealthy,
        gpuAvailable: data.gpu_available,
        cudaVersion: data.cuda_version,
        avatarsAvailable: data.avatars_available,
      };
    } catch (error) {
      this.isHealthy = false;
      return {
        healthy: false,
        error: error.message,
      };
    }
  }

  /**
   * Get list of avatars from server
   */
  async getServerAvatars() {
    try {
      const response = await fetch(`${MUSETALK_API_URL}/avatars`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      return data.avatars;
    } catch (error) {
      console.error('[AvatarService] Failed to get server avatars:', error);
      return [];
    }
  }

  // ========== UTILITY METHODS ==========

  /**
   * Get service configuration
   */
  getConfig() {
    return {
      apiUrl: MUSETALK_API_URL,
      currentAvatar: this.getCurrentAvatar(),
      currentExpression: EXPRESSIONS[this.currentExpression],
      isHealthy: this.isHealthy,
      lastHealthCheck: this.lastHealthCheck,
    };
  }

  /**
   * Test connection with a simple generation
   */
  async testConnection(testAudioUrl) {
    try {
      const healthResult = await this.healthCheck();
      if (!healthResult.healthy) {
        return {
          success: false,
          stage: 'health_check',
          error: healthResult.error,
        };
      }

      if (testAudioUrl) {
        const generateResult = await this.generateVideo(testAudioUrl);
        return {
          success: true,
          stage: 'generate',
          ...generateResult,
        };
      }

      return {
        success: true,
        stage: 'health_check',
        ...healthResult,
      };
    } catch (error) {
      return {
        success: false,
        stage: 'unknown',
        error: error.message,
      };
    }
  }
}

// ============================================================================
// SINGLETON EXPORT
// ============================================================================

export const avatarService = new AvatarService();
export default avatarService;
