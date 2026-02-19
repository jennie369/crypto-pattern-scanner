/**
 * Emotion Detection Service (Web)
 * Ported from gem-mobile/src/services/emotionDetectionService.js
 *
 * Detects emotions from text and provides adaptive response guidelines
 * Based on GEM Frequency Method (20Hz - 700Hz)
 * 16 emotions with frequency mapping
 */

import { supabase } from '../lib/supabaseClient';

// ============================================================
// EMOTION CONSTANTS & MAPPINGS
// ============================================================

const EMOTION_KEYWORDS = {
  // Positive emotions (High frequency)
  joy: { keywords: ['vui', 'hanh phuc', 'sung suong', 'phan khoi', 'tuyet voi', 'tot dep', 'may man', 'hung khoi'], frequency: 540, level: 'elevated', icon: 'smile', color: '#FFD700' },
  love: { keywords: ['yeu', 'thuong', 'tran trong', 'cam kich', 'biet on', 'quan tam', 'gan bo'], frequency: 500, level: 'elevated', icon: 'heart', color: '#FF69B4' },
  peace: { keywords: ['binh yen', 'an nhien', 'thanh than', 'tinh lang', 'thu thai', 'nhe nhang', 'yen binh'], frequency: 600, level: 'elevated', icon: 'cloud', color: '#87CEEB' },
  hope: { keywords: ['hy vong', 'lac quan', 'tin tuong', 'ky vong', 'mong doi', 'tuoi sang'], frequency: 310, level: 'elevated', icon: 'sun', color: '#FFA500' },
  gratitude: { keywords: ['biet on', 'cam on', 'tri an', 'may man', 'tran quy', 'danh gia cao'], frequency: 540, level: 'elevated', icon: 'gift', color: '#9370DB' },
  excitement: { keywords: ['hao hung', 'nao nuc', 'hao huc', 'soi dong', 'nhiet tinh', 'hang hai'], frequency: 330, level: 'elevated', icon: 'zap', color: '#FF4500' },
  confidence: { keywords: ['tu tin', 'vung vang', 'chac chan', 'tin tuong ban than', 'manh me'], frequency: 350, level: 'elevated', icon: 'shield', color: '#4169E1' },

  // Neutral emotions (Medium frequency)
  curiosity: { keywords: ['to mo', 'thac mac', 'muon biet', 'quan tam', 'hoi', 'tim hieu'], frequency: 250, level: 'medium', icon: 'help-circle', color: '#20B2AA' },
  acceptance: { keywords: ['chap nhan', 'dong y', 'hieu', 'ok', 'duoc', 'on'], frequency: 350, level: 'medium', icon: 'check-circle', color: '#3CB371' },
  neutral: { keywords: ['binh thuong', 'khong sao', 'tam', 'duoc thoi', 'cung duoc'], frequency: 200, level: 'medium', icon: 'minus-circle', color: '#808080' },

  // Challenging emotions (Lower frequency)
  sadness: { keywords: ['buon', 'u sau', 'dau kho', 'tuyet vong', 'chan nan', 'that vong', 'co don', 'trong rong'], frequency: 75, level: 'low', icon: 'frown', color: '#4682B4' },
  anxiety: { keywords: ['lo lang', 'lo au', 'bat an', 'cang thang', 'hoi hop', 'so hai', 'hoang mang', 'roi'], frequency: 100, level: 'low', icon: 'alert-triangle', color: '#DDA0DD' },
  anger: { keywords: ['tuc gian', 'buc', 'kho chiu', 'buc boi', 'noi gian', 'phan no', 'dien tiet', 'cau'], frequency: 150, level: 'low', icon: 'flame', color: '#DC143C' },
  fear: { keywords: ['so', 'so hai', 'hoang', 'khiep', 'lo so', 'run', 'kinh hai'], frequency: 100, level: 'low', icon: 'alert-circle', color: '#8B0000' },
  guilt: { keywords: ['toi loi', 'hoi han', 'co loi', 'xau ho', 'nguong', 'an han', 'day dut'], frequency: 30, level: 'low', icon: 'x-circle', color: '#696969' },
  frustration: { keywords: ['buc minh', 'chan', 'met moi', 'kiet suc', 'nan', 'bat luc', 'that bai'], frequency: 125, level: 'low', icon: 'frown', color: '#CD853F' },
  overwhelm: { keywords: ['qua tai', 'choang ngop', 'khong chiu noi', 'qua suc', 'ngap ngua', 'be tac'], frequency: 125, level: 'low', icon: 'alert-octagon', color: '#9932CC' },
  loneliness: { keywords: ['co don', 'le loi', 'mot minh', 'khong ai hieu', 'bi bo roi', 'co lap'], frequency: 75, level: 'low', icon: 'user-x', color: '#483D8B' },
  confusion: { keywords: ['boi roi', 'hoang mang', 'khong hieu', 'lac long', 'mo ho', 'mong lung'], frequency: 150, level: 'low', icon: 'help-circle', color: '#708090' },
};

const INTENSITY_MODIFIERS = {
  increase: ['rat', 'qua', 'cuc ky', 'vo cung', 'sieu', 'khung khiep', 'thuc su', 'het suc'],
  decrease: ['hoi', 'mot chut', 'tam', 'cung', 'khong qua', 'kha'],
};

const TONE_GUIDELINES = {
  elevated: {
    style: 'enthusiastic',
    approach: 'Maintain and amplify positive energy',
    suggestions: ['Share joy with user', 'Suggest ways to maintain high frequency', 'Propose frequency-raising activities'],
  },
  medium: {
    style: 'balanced',
    approach: 'Support stability and gradually raise frequency',
    suggestions: ['Listen and validate', 'Ask exploratory questions', 'Gently suggest frequency raising'],
  },
  low: {
    style: 'compassionate',
    approach: 'Empathize, validate, then gradually guide',
    suggestions: ['Show deep understanding', 'Validate feelings as legitimate', 'Gently suggest small steps', 'Remind of inner strength'],
  },
};

// Crisis keywords for safety detection
const CRISIS_KEYWORDS = ['tu tu', 'chet', 'khong muon song', 'ket thuc cuoc doi', 'tu hai', 'tu sat'];

class EmotionDetectionService {
  /**
   * Detect emotions from text
   */
  async detectEmotions(text, userId = null) {
    if (!text || typeof text !== 'string') {
      return this._getDefaultResult();
    }

    // Check for crisis keywords first
    const crisisCheck = this._checkCrisisKeywords(text);
    if (crisisCheck.isCrisis) {
      return this._getCrisisResult(crisisCheck.keywords, userId);
    }

    const keywordResult = this.detectFromKeywords(text);
    const frequency = this.calculateFrequency(keywordResult.emotions);
    const level = this.determineLevel(frequency);
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

    if (userId) {
      await this.saveEmotionalState(userId, result, text);
    }

    return result;
  }

  /**
   * Simple crisis keyword check (replaces validationService dependency)
   */
  _checkCrisisKeywords(text) {
    const lowerText = text.toLowerCase();
    const found = CRISIS_KEYWORDS.filter(kw => lowerText.includes(kw));
    return { isCrisis: found.length > 0, keywords: found };
  }

  detectFromKeywords(text) {
    const lowerText = text.toLowerCase();
    const detectedEmotions = [];

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
          break;
        }
      }
    }

    const intensity = this.calculateIntensity(text);

    detectedEmotions.sort((a, b) => {
      if (a.level === 'low' && b.level !== 'low') return -1;
      if (b.level === 'low' && a.level !== 'low') return 1;
      return a.frequency - b.frequency;
    });

    const primaryEmotion = detectedEmotions[0] || {
      emotion: 'neutral', frequency: 200, level: 'medium', icon: 'minus-circle', color: '#808080',
    };
    const secondaryEmotions = detectedEmotions.slice(1, 3);

    return { emotions: detectedEmotions, primaryEmotion, secondaryEmotions, intensity };
  }

  calculateIntensity(text) {
    let intensity = 5;
    const lowerText = text.toLowerCase();

    for (const modifier of INTENSITY_MODIFIERS.increase) {
      if (lowerText.includes(modifier)) intensity += 1.5;
    }
    for (const modifier of INTENSITY_MODIFIERS.decrease) {
      if (lowerText.includes(modifier)) intensity -= 1;
    }

    const exclamationCount = (text.match(/!/g) || []).length;
    const questionCount = (text.match(/\?/g) || []).length;
    const capsRatio = (text.match(/[A-Z]/g) || []).length / Math.max(text.length, 1);

    intensity += Math.min(exclamationCount * 0.5, 2);
    intensity += Math.min(questionCount * 0.3, 1);
    intensity += capsRatio > 0.3 ? 1.5 : 0;

    const emojiPattern = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F900}-\u{1F9FF}]|[\u{2600}-\u{26FF}]/gu;
    const emojiCount = (text.match(emojiPattern) || []).length;
    intensity += Math.min(emojiCount * 0.3, 1.5);

    return Math.max(1, Math.min(10, Math.round(intensity)));
  }

  calculateFrequency(emotions) {
    if (!emotions || emotions.length === 0) return 200;

    let totalWeight = 0;
    let weightedSum = 0;

    emotions.forEach((emotion, index) => {
      const weight = 1 / (index + 1);
      weightedSum += emotion.frequency * weight;
      totalWeight += weight;
    });

    return Math.round(weightedSum / totalWeight);
  }

  determineLevel(frequency) {
    if (frequency >= 300) return 'elevated';
    if (frequency >= 175) return 'medium';
    return 'low';
  }

  determineResponseTone(emotions, frequency) {
    const level = this.determineLevel(frequency);
    const baseGuidelines = TONE_GUIDELINES[level];
    const primary = emotions[0];
    let specificGuidance = '';

    if (primary) {
      switch (primary.emotion) {
        case 'anxiety': case 'fear':
          specificGuidance = 'Use safe, reassuring language. Guide deep breathing if appropriate.';
          break;
        case 'sadness': case 'loneliness':
          specificGuidance = 'Show companionship, remind them they are not alone.';
          break;
        case 'anger': case 'frustration':
          specificGuidance = 'Validate feelings without judgment. Move toward solutions when ready.';
          break;
        case 'joy': case 'excitement':
          specificGuidance = 'Share the joy, encourage capturing this moment.';
          break;
        case 'gratitude':
          specificGuidance = 'Amplify gratitude energy, suggest gratitude journaling.';
          break;
        case 'confusion':
          specificGuidance = 'Patiently explain, break down information, ask clarifying questions.';
          break;
        default:
          specificGuidance = 'Listen and respond appropriately to context.';
      }
    }

    return { ...baseGuidelines, specificGuidance, primaryEmotion: primary?.emotion || 'neutral', frequency, level };
  }

  _getCrisisResult(keywords, userId) {
    console.warn('[EmotionDetection] Crisis keywords detected for user:', userId);

    return {
      emotions: [{ emotion: 'crisis', frequency: 20, level: 'crisis', icon: 'alert-octagon', color: '#FF0000' }],
      primaryEmotion: { emotion: 'crisis', frequency: 20, level: 'crisis', icon: 'alert-octagon', color: '#FF0000' },
      secondaryEmotions: [],
      intensity: 10,
      frequency: 20,
      level: 'crisis',
      isCrisis: true,
      crisisKeywords: keywords,
      toneGuidelines: {
        style: 'immediate_support',
        approach: 'Immediately provide support and hotline information',
        suggestions: ['Show deep care without judgment', 'Provide mental health hotline', 'Encourage seeking professional help', 'Remind they are not alone'],
        specificGuidance: 'EMERGENCY SITUATION. Prioritize user safety.',
        crisisResources: {
          hotline: '1800 599 920',
          hotlineName: 'Mental Health Hotline',
          message: 'If you are struggling, please contact the mental health support hotline: 1800 599 920 (free, 24/7). You are not alone.',
        },
      },
      timestamp: new Date().toISOString(),
    };
  }

  _getDefaultResult() {
    return {
      emotions: [],
      primaryEmotion: { emotion: 'neutral', frequency: 200, level: 'medium', icon: 'minus-circle', color: '#808080' },
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
          message_excerpt: messageExcerpt?.substring(0, 100) || null,
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

  async getEmotionalJourney(userId, days = 14) {
    if (!userId) return [];

    try {
      const { data, error } = await supabase.rpc('get_emotional_journey', {
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

  async getFrequencyTrend(userId, days = 7) {
    if (!userId) return null;

    try {
      const journey = await this.getEmotionalJourney(userId, days);

      if (!journey || journey.length < 2) {
        return { trend: 'insufficient_data', message: 'Not enough data for trend analysis', avgFrequency: null };
      }

      const halfIndex = Math.floor(journey.length / 2);
      const recentHalf = journey.slice(0, halfIndex);
      const olderHalf = journey.slice(halfIndex);

      const recentAvg = recentHalf.reduce((sum, d) => sum + (d.avg_frequency || 0), 0) / recentHalf.length;
      const olderAvg = olderHalf.reduce((sum, d) => sum + (d.avg_frequency || 0), 0) / olderHalf.length;
      const overallAvg = journey.reduce((sum, d) => sum + (d.avg_frequency || 0), 0) / journey.length;

      const diff = recentAvg - olderAvg;
      let trend, message;

      if (diff > 50) {
        trend = 'rising';
        message = 'Your emotional frequency is rising! Keep it up.';
      } else if (diff < -50) {
        trend = 'falling';
        message = 'Emotional frequency has been declining recently. Take time for self-care.';
      } else {
        trend = 'stable';
        message = 'Your emotional frequency is fairly stable.';
      }

      return { trend, message, avgFrequency: Math.round(overallAvg), recentAvg: Math.round(recentAvg), olderAvg: Math.round(olderAvg), dataPoints: journey.length };
    } catch (error) {
      console.error('[EmotionDetection] getFrequencyTrend error:', error);
      return null;
    }
  }

  // ============================================================
  // UTILITY METHODS
  // ============================================================

  getEmotionConfigs() { return EMOTION_KEYWORDS; }
  getToneGuidelines() { return TONE_GUIDELINES; }

  getEmotionDisplayInfo(emotionName) {
    const config = EMOTION_KEYWORDS[emotionName];
    if (config) {
      return { emotion: emotionName, icon: config.icon, color: config.color, frequency: config.frequency, level: config.level };
    }
    return { emotion: 'neutral', icon: 'minus-circle', color: '#808080', frequency: 200, level: 'medium' };
  }

  formatForPrompt(emotionResult) {
    if (!emotionResult || emotionResult.isCrisis) return '';

    const parts = [];

    if (emotionResult.primaryEmotion?.emotion !== 'neutral') {
      parts.push(`Primary emotion: ${emotionResult.primaryEmotion.emotion}`);
    }

    const levelMap = { elevated: 'high (positive)', medium: 'medium', low: 'low (needs support)' };
    parts.push(`Emotional frequency: ${emotionResult.frequency}Hz (${levelMap[emotionResult.level]})`);

    if (emotionResult.intensity > 7) parts.push('Intensity: high');
    else if (emotionResult.intensity < 4) parts.push('Intensity: mild');

    if (emotionResult.toneGuidelines?.specificGuidance) {
      parts.push(`Response guidance: ${emotionResult.toneGuidelines.specificGuidance}`);
    }

    if (parts.length === 0) return '';
    return `\n[EMOTION ANALYSIS]\n${parts.join('\n')}\n`;
  }
}

export const emotionDetectionService = new EmotionDetectionService();
export default emotionDetectionService;

export { EMOTION_KEYWORDS, TONE_GUIDELINES };
