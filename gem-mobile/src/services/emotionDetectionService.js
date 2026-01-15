/**
 * EMOTION DETECTION SERVICE
 * Detects emotions from text and provides adaptive response guidelines
 * Based on GEM Frequency Method (20Hz - 700Hz)
 */

import { supabase } from './supabase';
import { validationService } from './validationService';

// ============================================================
// EMOTION CONSTANTS & MAPPINGS
// ============================================================

// Primary emotions with Vietnamese keywords
const EMOTION_KEYWORDS = {
  // Positive emotions (High frequency)
  joy: {
    keywords: ['vui', 'hạnh phúc', 'sung sướng', 'phấn khởi', 'tuyệt vời', 'tốt đẹp', 'may mắn', 'hứng khởi'],
    frequency: 540,
    level: 'elevated',
    icon: 'smile',
    color: '#FFD700',
  },
  love: {
    keywords: ['yêu', 'thương', 'trân trọng', 'cảm kích', 'biết ơn', 'quan tâm', 'gắn bó'],
    frequency: 500,
    level: 'elevated',
    icon: 'heart',
    color: '#FF69B4',
  },
  peace: {
    keywords: ['bình yên', 'an nhiên', 'thanh thản', 'tĩnh lặng', 'thư thái', 'nhẹ nhàng', 'yên bình'],
    frequency: 600,
    level: 'elevated',
    icon: 'cloud',
    color: '#87CEEB',
  },
  hope: {
    keywords: ['hy vọng', 'lạc quan', 'tin tưởng', 'kỳ vọng', 'mong đợi', 'tươi sáng'],
    frequency: 310,
    level: 'elevated',
    icon: 'sun',
    color: '#FFA500',
  },
  gratitude: {
    keywords: ['biết ơn', 'cảm ơn', 'tri ân', 'may mắn', 'trân quý', 'đánh giá cao'],
    frequency: 540,
    level: 'elevated',
    icon: 'gift',
    color: '#9370DB',
  },
  excitement: {
    keywords: ['hào hứng', 'náo nức', 'háo hức', 'sôi động', 'nhiệt tình', 'hăng hái'],
    frequency: 330,
    level: 'elevated',
    icon: 'zap',
    color: '#FF4500',
  },
  confidence: {
    keywords: ['tự tin', 'vững vàng', 'chắc chắn', 'tin tưởng bản thân', 'mạnh mẽ'],
    frequency: 350,
    level: 'elevated',
    icon: 'shield',
    color: '#4169E1',
  },

  // Neutral emotions (Medium frequency)
  curiosity: {
    keywords: ['tò mò', 'thắc mắc', 'muốn biết', 'quan tâm', 'hỏi', 'tìm hiểu'],
    frequency: 250,
    level: 'medium',
    icon: 'help-circle',
    color: '#20B2AA',
  },
  acceptance: {
    keywords: ['chấp nhận', 'đồng ý', 'hiểu', 'ok', 'được', 'ổn'],
    frequency: 350,
    level: 'medium',
    icon: 'check-circle',
    color: '#3CB371',
  },
  neutral: {
    keywords: ['bình thường', 'không sao', 'tạm', 'được thôi', 'cũng được'],
    frequency: 200,
    level: 'medium',
    icon: 'minus-circle',
    color: '#808080',
  },

  // Challenging emotions (Lower frequency - need elevation)
  sadness: {
    keywords: ['buồn', 'u sầu', 'đau khổ', 'tuyệt vọng', 'chán nản', 'thất vọng', 'cô đơn', 'trống rỗng'],
    frequency: 75,
    level: 'low',
    icon: 'frown',
    color: '#4682B4',
  },
  anxiety: {
    keywords: ['lo lắng', 'lo âu', 'bất an', 'căng thẳng', 'hồi hộp', 'sợ hãi', 'hoang mang', 'rối'],
    frequency: 100,
    level: 'low',
    icon: 'alert-triangle',
    color: '#DDA0DD',
  },
  anger: {
    keywords: ['tức giận', 'bực', 'khó chịu', 'bực bội', 'nổi giận', 'phẫn nộ', 'điên tiết', 'cáu'],
    frequency: 150,
    level: 'low',
    icon: 'flame',
    color: '#DC143C',
  },
  fear: {
    keywords: ['sợ', 'sợ hãi', 'hoảng', 'khiếp', 'lo sợ', 'run', 'kinh hãi'],
    frequency: 100,
    level: 'low',
    icon: 'alert-circle',
    color: '#8B0000',
  },
  guilt: {
    keywords: ['tội lỗi', 'hối hận', 'có lỗi', 'xấu hổ', 'ngượng', 'ân hận', 'day dứt'],
    frequency: 30,
    level: 'low',
    icon: 'x-circle',
    color: '#696969',
  },
  frustration: {
    keywords: ['bực mình', 'chán', 'mệt mỏi', 'kiệt sức', 'nản', 'bất lực', 'thất bại'],
    frequency: 125,
    level: 'low',
    icon: 'frown',
    color: '#CD853F',
  },
  overwhelm: {
    keywords: ['quá tải', 'choáng ngợp', 'không chịu nổi', 'quá sức', 'ngập ngụa', 'bế tắc'],
    frequency: 125,
    level: 'low',
    icon: 'alert-octagon',
    color: '#9932CC',
  },
  loneliness: {
    keywords: ['cô đơn', 'lẻ loi', 'một mình', 'không ai hiểu', 'bị bỏ rơi', 'cô lập'],
    frequency: 75,
    level: 'low',
    icon: 'user-x',
    color: '#483D8B',
  },
  confusion: {
    keywords: ['bối rối', 'hoang mang', 'không hiểu', 'lạc lõng', 'mơ hồ', 'mông lung'],
    frequency: 150,
    level: 'low',
    icon: 'help-circle',
    color: '#708090',
  },
};

// Intensity modifiers
const INTENSITY_MODIFIERS = {
  increase: ['rất', 'quá', 'cực kỳ', 'vô cùng', 'siêu', 'khủng khiếp', 'thực sự', 'hết sức'],
  decrease: ['hơi', 'một chút', 'tạm', 'cũng', 'không quá', 'khá'],
};

// Response tone guidelines based on emotion
const TONE_GUIDELINES = {
  elevated: {
    style: 'enthusiastic',
    approach: 'Duy trì và khuếch đại năng lượng tích cực',
    suggestions: [
      'Chia sẻ niềm vui cùng người dùng',
      'Gợi ý cách duy trì tần số cao',
      'Đề xuất các hoạt động nâng cao tần số',
    ],
  },
  medium: {
    style: 'balanced',
    approach: 'Hỗ trợ ổn định và từ từ nâng tần số',
    suggestions: [
      'Lắng nghe và xác nhận',
      'Đặt câu hỏi khám phá',
      'Gợi ý nhẹ nhàng về việc nâng tần số',
    ],
  },
  low: {
    style: 'compassionate',
    approach: 'Đồng cảm, xác nhận, rồi từ từ hướng dẫn',
    suggestions: [
      'Thể hiện sự thấu hiểu sâu sắc',
      'Xác nhận cảm xúc là hợp lệ',
      'Nhẹ nhàng gợi ý các bước nhỏ',
      'Nhắc nhở về sức mạnh bên trong',
    ],
  },
};

class EmotionDetectionService {
  // ============================================================
  // MAIN DETECTION METHODS
  // ============================================================

  /**
   * Detect emotions from text
   * @param {string} text - Text to analyze
   * @param {string} userId - Optional user ID for saving state
   * @returns {Promise<Object>} Detection result
   */
  async detectEmotions(text, userId = null) {
    if (!text || typeof text !== 'string') {
      return this._getDefaultResult();
    }

    // Check for crisis keywords first
    const crisisCheck = validationService.checkCrisisKeywords(text);
    if (crisisCheck.isCrisis) {
      return this._getCrisisResult(crisisCheck.keywords, userId);
    }

    // Keyword-based detection
    const keywordResult = this.detectFromKeywords(text);

    // Calculate overall frequency and level
    const frequency = this.calculateFrequency(keywordResult.emotions);
    const level = this.determineLevel(frequency);

    // Get response tone guidelines
    const toneGuidelines = this.determineResponseTone(keywordResult.emotions, frequency);

    const result = {
      emotions: keywordResult.emotions,
      primaryEmotion: keywordResult.primaryEmotion,
      secondaryEmotions: keywordResult.secondaryEmotions,
      intensity: keywordResult.intensity,
      frequency,
      level,
      toneGuidelines,
      isCrisis: false,
      timestamp: new Date().toISOString(),
    };

    // Save emotional state if user ID provided
    if (userId) {
      await this.saveEmotionalState(userId, result, text);
    }

    return result;
  }

  /**
   * Keyword-based emotion detection
   * @param {string} text - Text to analyze
   * @returns {Object} Detection result
   */
  detectFromKeywords(text) {
    const lowerText = text.toLowerCase();
    const detectedEmotions = [];

    // Check each emotion's keywords
    for (const [emotion, config] of Object.entries(EMOTION_KEYWORDS)) {
      for (const keyword of config.keywords) {
        if (lowerText.includes(keyword)) {
          detectedEmotions.push({
            emotion,
            keyword,
            frequency: config.frequency,
            level: config.level,
            icon: config.icon,
            color: config.color,
          });
          break; // Only count once per emotion
        }
      }
    }

    // Calculate intensity
    const intensity = this.calculateIntensity(text);

    // Sort by frequency (lower frequency = more attention needed)
    detectedEmotions.sort((a, b) => {
      // Prioritize low frequency emotions
      if (a.level === 'low' && b.level !== 'low') return -1;
      if (b.level === 'low' && a.level !== 'low') return 1;
      return a.frequency - b.frequency;
    });

    // Determine primary and secondary emotions
    const primaryEmotion = detectedEmotions[0] || {
      emotion: 'neutral',
      frequency: 200,
      level: 'medium',
      icon: 'minus-circle',
      color: '#808080',
    };
    const secondaryEmotions = detectedEmotions.slice(1, 3);

    return {
      emotions: detectedEmotions,
      primaryEmotion,
      secondaryEmotions,
      intensity,
    };
  }

  /**
   * Calculate emotional intensity from text
   * @param {string} text - Text to analyze
   * @returns {number} Intensity (1-10)
   */
  calculateIntensity(text) {
    let intensity = 5; // Base intensity

    const lowerText = text.toLowerCase();

    // Check for intensity modifiers
    for (const modifier of INTENSITY_MODIFIERS.increase) {
      if (lowerText.includes(modifier)) {
        intensity += 1.5;
      }
    }

    for (const modifier of INTENSITY_MODIFIERS.decrease) {
      if (lowerText.includes(modifier)) {
        intensity -= 1;
      }
    }

    // Check for punctuation intensity
    const exclamationCount = (text.match(/!/g) || []).length;
    const questionCount = (text.match(/\?/g) || []).length;
    const capsRatio = (text.match(/[A-Z]/g) || []).length / Math.max(text.length, 1);

    intensity += Math.min(exclamationCount * 0.5, 2);
    intensity += Math.min(questionCount * 0.3, 1);
    intensity += capsRatio > 0.3 ? 1.5 : 0;

    // Check for emoji intensity
    const emojiPattern = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F900}-\u{1F9FF}]|[\u{2600}-\u{26FF}]/gu;
    const emojiCount = (text.match(emojiPattern) || []).length;
    intensity += Math.min(emojiCount * 0.3, 1.5);

    // Clamp to 1-10 range
    return Math.max(1, Math.min(10, Math.round(intensity)));
  }

  /**
   * Calculate overall frequency from detected emotions
   * @param {Array} emotions - Detected emotions array
   * @returns {number} Average frequency in Hz
   */
  calculateFrequency(emotions) {
    if (!emotions || emotions.length === 0) {
      return 200; // Default neutral frequency
    }

    // Weight by position (first emotions have more weight)
    let totalWeight = 0;
    let weightedSum = 0;

    emotions.forEach((emotion, index) => {
      const weight = 1 / (index + 1); // First emotion weight = 1, second = 0.5, etc.
      weightedSum += emotion.frequency * weight;
      totalWeight += weight;
    });

    return Math.round(weightedSum / totalWeight);
  }

  /**
   * Determine frequency level
   * @param {number} frequency - Frequency in Hz
   * @returns {string} Level (low/medium/elevated)
   */
  determineLevel(frequency) {
    if (frequency >= 300) return 'elevated';
    if (frequency >= 175) return 'medium';
    return 'low';
  }

  /**
   * Get response tone guidelines based on emotions
   * @param {Array} emotions - Detected emotions
   * @param {number} frequency - Overall frequency
   * @returns {Object} Tone guidelines
   */
  determineResponseTone(emotions, frequency) {
    const level = this.determineLevel(frequency);
    const baseGuidelines = TONE_GUIDELINES[level];

    // Get primary emotion for specific guidance
    const primary = emotions[0];
    let specificGuidance = '';

    if (primary) {
      switch (primary.emotion) {
        case 'anxiety':
        case 'fear':
          specificGuidance = 'Sử dụng ngôn ngữ an toàn, trấn an. Hướng dẫn hít thở sâu nếu phù hợp.';
          break;
        case 'sadness':
        case 'loneliness':
          specificGuidance = 'Thể hiện sự đồng hành, nhắc nhở họ không cô đơn.';
          break;
        case 'anger':
        case 'frustration':
          specificGuidance = 'Xác nhận cảm xúc hợp lệ, không phán xét. Hướng đến giải pháp khi họ sẵn sàng.';
          break;
        case 'joy':
        case 'excitement':
          specificGuidance = 'Chia sẻ niềm vui, khuyến khích họ ghi nhận khoảnh khắc này.';
          break;
        case 'gratitude':
          specificGuidance = 'Khuếch đại năng lượng biết ơn, gợi ý nhật ký biết ơn.';
          break;
        case 'confusion':
          specificGuidance = 'Kiên nhẫn giải thích, chia nhỏ thông tin, hỏi lại để hiểu rõ hơn.';
          break;
        default:
          specificGuidance = 'Lắng nghe và phản hồi phù hợp với ngữ cảnh.';
      }
    }

    return {
      ...baseGuidelines,
      specificGuidance,
      primaryEmotion: primary?.emotion || 'neutral',
      frequency,
      level,
    };
  }

  // ============================================================
  // CRISIS HANDLING
  // ============================================================

  /**
   * Get crisis result for immediate support
   * @private
   */
  _getCrisisResult(keywords, userId) {
    // Log crisis detection (without saving user message content for privacy)
    console.warn('[EmotionDetection] Crisis keywords detected for user:', userId);

    return {
      emotions: [{
        emotion: 'crisis',
        frequency: 20,
        level: 'crisis',
        icon: 'alert-octagon',
        color: '#FF0000',
      }],
      primaryEmotion: {
        emotion: 'crisis',
        frequency: 20,
        level: 'crisis',
        icon: 'alert-octagon',
        color: '#FF0000',
      },
      secondaryEmotions: [],
      intensity: 10,
      frequency: 20,
      level: 'crisis',
      isCrisis: true,
      crisisKeywords: keywords,
      toneGuidelines: {
        style: 'immediate_support',
        approach: 'Ngay lập tức cung cấp hỗ trợ và thông tin hotline',
        suggestions: [
          'Thể hiện sự quan tâm sâu sắc và không phán xét',
          'Cung cấp đường dây nóng hỗ trợ tâm lý',
          'Khuyến khích tìm kiếm sự giúp đỡ chuyên nghiệp',
          'Nhắc nhở họ không cô đơn',
        ],
        specificGuidance: 'ĐÂY LÀ TÌNH HUỐNG KHẨN CẤP. Ưu tiên an toàn của người dùng.',
        crisisResources: {
          hotline: '1800 599 920',
          hotlineName: 'Đường dây nóng sức khỏe tâm thần',
          message: 'Nếu bạn đang gặp khó khăn, xin hãy liên hệ ngay đường dây nóng hỗ trợ tâm lý: 1800 599 920 (miễn phí, 24/7). Bạn không cô đơn.',
        },
      },
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Get default neutral result
   * @private
   */
  _getDefaultResult() {
    return {
      emotions: [],
      primaryEmotion: {
        emotion: 'neutral',
        frequency: 200,
        level: 'medium',
        icon: 'minus-circle',
        color: '#808080',
      },
      secondaryEmotions: [],
      intensity: 5,
      frequency: 200,
      level: 'medium',
      isCrisis: false,
      toneGuidelines: TONE_GUIDELINES.medium,
      timestamp: new Date().toISOString(),
    };
  }

  // ============================================================
  // DATABASE OPERATIONS
  // ============================================================

  /**
   * Save emotional state to database
   * @param {string} userId - User ID
   * @param {Object} emotionResult - Detection result
   * @param {string} messageExcerpt - Original message (truncated for privacy)
   * @returns {Promise<Object|null>} Saved record or null
   */
  async saveEmotionalState(userId, emotionResult, messageExcerpt = null) {
    if (!userId || !emotionResult) return null;

    try {
      const { data, error } = await supabase
        .from('emotional_states')
        .insert({
          user_id: userId,
          primary_emotion: emotionResult.primaryEmotion?.emotion || 'neutral',
          secondary_emotions: emotionResult.secondaryEmotions?.map(e => e.emotion) || [],
          intensity: emotionResult.intensity || 5,
          frequency_hz: emotionResult.frequency || 200,
          frequency_level: emotionResult.level || 'medium',
          message_excerpt: messageExcerpt?.substring(0, 100) || null, // Truncate for privacy
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('[EmotionDetection] saveEmotionalState error:', error);
      return null;
    }
  }

  /**
   * Get user's emotional journey over time
   * @param {string} userId - User ID
   * @param {number} days - Number of days to look back
   * @returns {Promise<Array>} Emotional journey data
   */
  async getEmotionalJourney(userId, days = 14) {
    if (!userId) return [];

    try {
      const { data, error } = await supabase
        .rpc('get_emotional_journey', {
          p_user_id: userId,
          p_days: days,
        });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('[EmotionDetection] getEmotionalJourney error:', error);
      return [];
    }
  }

  /**
   * Get recent emotional states
   * @param {string} userId - User ID
   * @param {number} limit - Number of records
   * @returns {Promise<Array>} Recent states
   */
  async getRecentEmotionalStates(userId, limit = 10) {
    if (!userId) return [];

    try {
      const { data, error } = await supabase
        .from('emotional_states')
        .select('*')
        .eq('user_id', userId)
        .order('detected_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('[EmotionDetection] getRecentEmotionalStates error:', error);
      return [];
    }
  }

  /**
   * Get emotional frequency trend
   * @param {string} userId - User ID
   * @param {number} days - Days to analyze
   * @returns {Promise<Object>} Trend analysis
   */
  async getFrequencyTrend(userId, days = 7) {
    if (!userId) return null;

    try {
      const journey = await this.getEmotionalJourney(userId, days);

      if (!journey || journey.length < 2) {
        return {
          trend: 'insufficient_data',
          message: 'Chưa đủ dữ liệu để phân tích xu hướng',
          avgFrequency: null,
        };
      }

      // Calculate average frequencies for first and second half
      const halfIndex = Math.floor(journey.length / 2);
      const recentHalf = journey.slice(0, halfIndex);
      const olderHalf = journey.slice(halfIndex);

      const recentAvg = recentHalf.reduce((sum, d) => sum + (d.avg_frequency || 0), 0) / recentHalf.length;
      const olderAvg = olderHalf.reduce((sum, d) => sum + (d.avg_frequency || 0), 0) / olderHalf.length;

      const overallAvg = journey.reduce((sum, d) => sum + (d.avg_frequency || 0), 0) / journey.length;

      let trend, message;
      const diff = recentAvg - olderAvg;

      if (diff > 50) {
        trend = 'rising';
        message = 'Tần số cảm xúc của bạn đang tăng lên! Tiếp tục duy trì nhé.';
      } else if (diff < -50) {
        trend = 'falling';
        message = 'Tần số cảm xúc gần đây có xu hướng giảm. Hãy dành thời gian chăm sóc bản thân.';
      } else {
        trend = 'stable';
        message = 'Tần số cảm xúc của bạn khá ổn định.';
      }

      return {
        trend,
        message,
        avgFrequency: Math.round(overallAvg),
        recentAvg: Math.round(recentAvg),
        olderAvg: Math.round(olderAvg),
        dataPoints: journey.length,
      };
    } catch (error) {
      console.error('[EmotionDetection] getFrequencyTrend error:', error);
      return null;
    }
  }

  // ============================================================
  // UTILITY METHODS
  // ============================================================

  /**
   * Get all emotion configs
   * @returns {Object} Emotion configurations
   */
  getEmotionConfigs() {
    return EMOTION_KEYWORDS;
  }

  /**
   * Get tone guidelines
   * @returns {Object} Tone guidelines
   */
  getToneGuidelines() {
    return TONE_GUIDELINES;
  }

  /**
   * Get emotion display info
   * @param {string} emotionName - Emotion name
   * @returns {Object} Display info (icon, color, frequency)
   */
  getEmotionDisplayInfo(emotionName) {
    const config = EMOTION_KEYWORDS[emotionName];
    if (config) {
      return {
        emotion: emotionName,
        icon: config.icon,
        color: config.color,
        frequency: config.frequency,
        level: config.level,
      };
    }

    return {
      emotion: 'neutral',
      icon: 'minus-circle',
      color: '#808080',
      frequency: 200,
      level: 'medium',
    };
  }

  /**
   * Format emotion result for prompt injection
   * @param {Object} emotionResult - Detection result
   * @returns {string} Formatted string for AI prompt
   */
  formatForPrompt(emotionResult) {
    if (!emotionResult || emotionResult.isCrisis) {
      return '';
    }

    const parts = [];

    // Primary emotion
    if (emotionResult.primaryEmotion?.emotion !== 'neutral') {
      parts.push(`Cảm xúc chính: ${emotionResult.primaryEmotion.emotion}`);
    }

    // Frequency level
    const levelMap = {
      elevated: 'cao (tích cực)',
      medium: 'trung bình',
      low: 'thấp (cần hỗ trợ)',
    };
    parts.push(`Tần số cảm xúc: ${emotionResult.frequency}Hz (${levelMap[emotionResult.level]})`);

    // Intensity
    if (emotionResult.intensity > 7) {
      parts.push('Cường độ: cao');
    } else if (emotionResult.intensity < 4) {
      parts.push('Cường độ: nhẹ');
    }

    // Tone guidance
    if (emotionResult.toneGuidelines?.specificGuidance) {
      parts.push(`Hướng dẫn phản hồi: ${emotionResult.toneGuidelines.specificGuidance}`);
    }

    if (parts.length === 0) return '';

    return `\n[PHÂN TÍCH CẢM XÚC]\n${parts.join('\n')}\n`;
  }
}

// Export singleton instance
export const emotionDetectionService = new EmotionDetectionService();
export default emotionDetectionService;

// Export constants
export { EMOTION_KEYWORDS, TONE_GUIDELINES };
