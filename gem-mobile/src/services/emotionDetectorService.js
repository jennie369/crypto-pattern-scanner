/**
 * Emotion Detector Service
 * Detects user emotions from message content
 *
 * 8 Emotion Categories:
 * - HAPPY, EXCITED, SAD, ANGRY
 * - NEUTRAL, CURIOUS, FRUSTRATED, SURPRISED
 *
 * Used by AI Brain for:
 * - Adjusting response tone
 * - Avatar expression selection
 * - TTS speed/pitch adjustment
 *
 * Performance target: < 3ms for detection
 */

// ===========================================
// 8 EMOTION CATEGORIES
// ===========================================

export const EMOTION_CATEGORIES = {
  HAPPY: {
    id: 'HAPPY',
    name: 'Vui vẻ',
    emoji: '😊',
    avatarExpression: 'happy',
    ttsSpeed: 1.1, // Slightly faster
    ttsPitch: 1.05,
    color: '#FFD700', // Gold
    patterns: [
      /(vui|hạnh phúc|happy|haha|hihi|=\)|:\)|😊|😄|😁|🥰|❤️)/i,
      /(thích|yêu|love|like|thương)/i,
      /(tuyệt vời|amazing|awesome|great|perfect)/i,
      /(cảm ơn|thank|tks)/i,
    ],
    keywords: [
      'vui', 'hạnh phúc', 'happy', 'haha', 'hihi',
      'thích', 'yêu', 'love', 'thương',
      'tuyệt', 'amazing', 'great', 'cảm ơn',
    ],
    emojis: ['😊', '😄', '😁', '🥰', '❤️', '💕', '😍', '🤗', '👍', '✨'],
    responseStyle: {
      tone: 'warm',
      ending: ['ạ', 'nhé', 'nha', 'ha'],
      emojis: ['😊', '💕', '✨'],
    },
  },

  EXCITED: {
    id: 'EXCITED',
    name: 'Hào hứng',
    emoji: '🤩',
    avatarExpression: 'excited',
    ttsSpeed: 1.2, // Faster
    ttsPitch: 1.1,
    color: '#FF6B6B', // Coral
    patterns: [
      /(wow|ôi|trời|amazing|OMG|oh my|wooow)/i,
      /(quá đẹp|quá xinh|quá tuyệt|quá hay)/i,
      /(muốn quá|thích quá|cần quá|want)/i,
      /(nhanh|gấp|urgent|ngay|liền)/i,
      /(🤩|🔥|💯|⭐|🎉|🥳)/,
    ],
    keywords: [
      'wow', 'ôi', 'trời', 'amazing', 'OMG',
      'quá đẹp', 'quá xinh', 'quá tuyệt',
      'muốn quá', 'thích quá', 'nhanh', 'gấp',
    ],
    emojis: ['🤩', '🔥', '💯', '⭐', '🎉', '🥳', '😱', '🙀'],
    responseStyle: {
      tone: 'enthusiastic',
      ending: ['luôn', 'ngay', 'đi', 'thôi'],
      emojis: ['🔥', '✨', '💎'],
    },
  },

  SAD: {
    id: 'SAD',
    name: 'Buồn',
    emoji: '😢',
    avatarExpression: 'sad',
    ttsSpeed: 0.9, // Slower
    ttsPitch: 0.95,
    color: '#6B7FD7', // Blue
    patterns: [
      /(buồn|sad|đau|unhappy|upset)/i,
      /(khóc|cry|tears|nước mắt)/i,
      /(thất vọng|disappoint|chán|bored)/i,
      /(cô đơn|lonely|alone|một mình)/i,
      /(😢|😭|💔|😔|😞|🥺)/,
    ],
    keywords: [
      'buồn', 'sad', 'đau', 'khóc', 'cry',
      'thất vọng', 'chán', 'cô đơn', 'lonely',
    ],
    emojis: ['😢', '😭', '💔', '😔', '😞', '🥺', '😿'],
    responseStyle: {
      tone: 'empathetic',
      ending: ['ạ', 'nhé', 'nha'],
      emojis: ['💕', '🤗', '💎'],
    },
  },

  ANGRY: {
    id: 'ANGRY',
    name: 'Tức giận',
    emoji: '😠',
    avatarExpression: 'neutral', // Don't mirror anger
    ttsSpeed: 1.0,
    ttsPitch: 1.0,
    color: '#E74C3C', // Red
    patterns: [
      /(tức|giận|angry|mad|bực|điên)/i,
      /(ghét|hate|không thích|dở|tệ)/i,
      /(lừa đảo|scam|fake|bịp)/i,
      /(wtf|what the|damn|shit)/i,
      /(😠|😡|🤬|💢|👿)/,
    ],
    keywords: [
      'tức', 'giận', 'angry', 'mad', 'bực',
      'ghét', 'hate', 'lừa đảo', 'scam', 'fake',
    ],
    emojis: ['😠', '😡', '🤬', '💢', '👿', '😤'],
    responseStyle: {
      tone: 'calm_professional',
      ending: ['ạ', 'nhé'],
      emojis: ['💕', '🙏'],
    },
  },

  NEUTRAL: {
    id: 'NEUTRAL',
    name: 'Trung tính',
    emoji: '😐',
    avatarExpression: 'neutral',
    ttsSpeed: 1.0,
    ttsPitch: 1.0,
    color: '#95A5A6', // Gray
    patterns: [
      // Default when no other emotion detected
    ],
    keywords: [],
    emojis: ['😐', '🙂'],
    responseStyle: {
      tone: 'professional',
      ending: ['ạ', 'nhé', 'nha'],
      emojis: ['✨', '💎'],
    },
  },

  CURIOUS: {
    id: 'CURIOUS',
    name: 'Tò mò',
    emoji: '🤔',
    avatarExpression: 'thinking',
    ttsSpeed: 1.0,
    ttsPitch: 1.0,
    color: '#9B59B6', // Purple
    patterns: [
      /(\?|hỏi|ask|question)/i,
      /(là gì|what|how|why|sao|như nào)/i,
      /(tư vấn|advise|recommend|giúp)/i,
      /(có không|được không|có thể)/i,
      /(🤔|❓|🧐|💭)/,
    ],
    keywords: [
      '?', 'hỏi', 'là gì', 'what', 'how', 'why',
      'tư vấn', 'giúp', 'có không', 'được không',
    ],
    emojis: ['🤔', '❓', '🧐', '💭', '🙋'],
    responseStyle: {
      tone: 'helpful',
      ending: ['ạ', 'nhé', 'nha', 'ha'],
      emojis: ['✨', '💡', '💎'],
    },
  },

  FRUSTRATED: {
    id: 'FRUSTRATED',
    name: 'Bực bội',
    emoji: '😤',
    avatarExpression: 'calm', // Stay calm
    ttsSpeed: 0.95,
    ttsPitch: 1.0,
    color: '#E67E22', // Orange
    patterns: [
      /(khó chịu|bực|annoyed|irritated|frustrated)/i,
      /(không hiểu|don't understand|confused)/i,
      /(lâu quá|chậm quá|mãi|sao lâu)/i,
      /(lại|again|nữa|hoài)/i,
      /(😤|😒|🙄|😑)/,
    ],
    keywords: [
      'khó chịu', 'bực', 'annoyed', 'không hiểu',
      'lâu quá', 'chậm quá', 'mãi', 'lại', 'nữa',
    ],
    emojis: ['😤', '😒', '🙄', '😑'],
    responseStyle: {
      tone: 'patient',
      ending: ['ạ', 'nhé'],
      emojis: ['🙏', '💕'],
    },
  },

  SURPRISED: {
    id: 'SURPRISED',
    name: 'Ngạc nhiên',
    emoji: '😮',
    avatarExpression: 'surprised',
    ttsSpeed: 1.1,
    ttsPitch: 1.1,
    color: '#1ABC9C', // Teal
    patterns: [
      /(ồ|oh|wow|whoa|thật|really|serious)/i,
      /(không tin|không ngờ|bất ngờ|surprise)/i,
      /(thật sao|thật hả|thật luôn|really\?)/i,
      /(😮|😲|😯|🤯|😳)/,
    ],
    keywords: [
      'ồ', 'oh', 'wow', 'thật', 'really',
      'không tin', 'không ngờ', 'bất ngờ',
    ],
    emojis: ['😮', '😲', '😯', '🤯', '😳', '👀'],
    responseStyle: {
      tone: 'warm',
      ending: ['ạ', 'luôn', 'đó'],
      emojis: ['✨', '💎', '😊'],
    },
  },
};

// ===========================================
// DETECTOR LOGIC
// ===========================================

/**
 * Detect emotion from message
 * @param {string} message - User message
 * @returns {Object} { emotion, confidence, expression, ttsParams }
 */
export function detectEmotion(message) {
  if (!message || typeof message !== 'string') {
    return {
      emotion: EMOTION_CATEGORIES.NEUTRAL,
      confidence: 0.5,
      expression: 'neutral',
      ttsParams: { speed: 1.0, pitch: 1.0 },
    };
  }

  const normalizedMessage = message.trim().toLowerCase();
  const results = [];

  // Check each emotion category
  for (const [key, emotion] of Object.entries(EMOTION_CATEGORIES)) {
    if (key === 'NEUTRAL') continue; // Check neutral last

    let score = 0;

    // Pattern matching (high weight)
    for (const pattern of emotion.patterns) {
      if (pattern.test(normalizedMessage)) {
        score += 0.5;
        break;
      }
    }

    // Keyword matching (medium weight)
    for (const keyword of emotion.keywords) {
      if (normalizedMessage.includes(keyword.toLowerCase())) {
        score += 0.2;
      }
    }

    // Emoji matching (medium weight)
    for (const emoji of emotion.emojis) {
      if (message.includes(emoji)) {
        score += 0.3;
        break;
      }
    }

    // Cap at 1.0
    score = Math.min(score, 1.0);

    if (score > 0) {
      results.push({
        emotion,
        confidence: score,
        expression: emotion.avatarExpression,
        ttsParams: {
          speed: emotion.ttsSpeed,
          pitch: emotion.ttsPitch,
        },
      });
    }
  }

  // Sort by confidence
  results.sort((a, b) => b.confidence - a.confidence);

  // Return best match or NEUTRAL
  if (results.length > 0 && results[0].confidence >= 0.2) {
    return results[0];
  }

  return {
    emotion: EMOTION_CATEGORIES.NEUTRAL,
    confidence: 0.5,
    expression: 'neutral',
    ttsParams: { speed: 1.0, pitch: 1.0 },
  };
}

/**
 * Get emotion-adjusted response style
 * @param {string} emotionId
 * @returns {Object} Response style config
 */
export function getResponseStyle(emotionId) {
  const emotion = EMOTION_CATEGORIES[emotionId];
  if (!emotion) return EMOTION_CATEGORIES.NEUTRAL.responseStyle;
  return emotion.responseStyle;
}

/**
 * Get avatar expression for emotion
 * @param {string} emotionId
 * @returns {string} Expression name
 */
export function getAvatarExpression(emotionId) {
  const emotion = EMOTION_CATEGORIES[emotionId];
  if (!emotion) return 'neutral';
  return emotion.avatarExpression;
}

/**
 * Get TTS parameters for emotion
 * @param {string} emotionId
 * @returns {Object} { speed, pitch }
 */
export function getTTSParams(emotionId) {
  const emotion = EMOTION_CATEGORIES[emotionId];
  if (!emotion) return { speed: 1.0, pitch: 1.0 };
  return {
    speed: emotion.ttsSpeed,
    pitch: emotion.ttsPitch,
  };
}

/**
 * Check if emotion is negative (needs careful response)
 * @param {string} emotionId
 * @returns {boolean}
 */
export function isNegativeEmotion(emotionId) {
  return ['SAD', 'ANGRY', 'FRUSTRATED'].includes(emotionId);
}

/**
 * Check if emotion is positive
 * @param {string} emotionId
 * @returns {boolean}
 */
export function isPositiveEmotion(emotionId) {
  return ['HAPPY', 'EXCITED', 'SURPRISED'].includes(emotionId);
}

/**
 * Get appropriate response ending based on emotion
 * @param {string} emotionId
 * @returns {string}
 */
export function getResponseEnding(emotionId) {
  const style = getResponseStyle(emotionId);
  const endings = style.ending || ['ạ'];
  return endings[Math.floor(Math.random() * endings.length)];
}

/**
 * Get appropriate emoji for response based on emotion
 * @param {string} emotionId
 * @returns {string}
 */
export function getResponseEmoji(emotionId) {
  const style = getResponseStyle(emotionId);
  const emojis = style.emojis || ['✨'];
  return emojis[Math.floor(Math.random() * emojis.length)];
}

/**
 * Combine emotion with intent for better response
 * @param {Object} emotionResult - From detectEmotion()
 * @param {Object} intentResult - From classifyIntent()
 * @returns {Object} Combined analysis
 */
export function combineEmotionIntent(emotionResult, intentResult) {
  const emotion = emotionResult.emotion;
  const intent = intentResult.intent;

  // Adjust priority based on emotion
  let priorityBoost = 0;
  if (isNegativeEmotion(emotion.id)) {
    priorityBoost = 0.2; // Boost negative emotions
  }

  // Determine response tier
  let tier = intentResult.tier;
  if (emotion.id === 'ANGRY' || emotion.id === 'FRUSTRATED') {
    tier = Math.max(tier, 2); // At least Tier 2 for upset users
  }

  return {
    emotion: emotion.id,
    intent: intent.id,
    confidence: (emotionResult.confidence + intentResult.confidence) / 2,
    priority: Math.min(intentResult.priority + priorityBoost, 1.0),
    tier,
    expression: emotionResult.expression,
    ttsParams: emotionResult.ttsParams,
    responseStyle: getResponseStyle(emotion.id),
  };
}

/**
 * Get all emotions
 * @returns {Object}
 */
export function getAllEmotions() {
  return EMOTION_CATEGORIES;
}

/**
 * Get emotion by ID
 * @param {string} emotionId
 * @returns {Object}
 */
export function getEmotionById(emotionId) {
  return EMOTION_CATEGORIES[emotionId] || EMOTION_CATEGORIES.NEUTRAL;
}

// ===========================================
// EMOTION ANALYSIS HELPERS
// ===========================================

/**
 * Analyze emotional intensity (0-1)
 * @param {string} message
 * @returns {number}
 */
export function analyzeIntensity(message) {
  if (!message) return 0.5;

  let intensity = 0.5;

  // Check for intensifiers
  const intensifiers = [
    /quá|rất|cực kỳ|siêu|mega|super/i,
    /!!!+|!{2,}/,
    /[A-Z]{3,}/, // CAPS LOCK
  ];

  for (const pattern of intensifiers) {
    if (pattern.test(message)) {
      intensity += 0.15;
    }
  }

  // Check for repeated characters
  if (/(.)\1{2,}/.test(message)) {
    intensity += 0.1; // e.g., "đẹppppp"
  }

  // Check for multiple emojis
  const emojiCount = (message.match(/[\u{1F600}-\u{1F64F}]/gu) || []).length;
  if (emojiCount >= 3) {
    intensity += 0.1;
  }

  return Math.min(intensity, 1.0);
}

/**
 * Get emotion summary for logging/analytics
 * @param {string} message
 * @returns {Object}
 */
export function getEmotionSummary(message) {
  const result = detectEmotion(message);
  const intensity = analyzeIntensity(message);

  return {
    emotionId: result.emotion.id,
    emotionName: result.emotion.name,
    confidence: result.confidence,
    intensity,
    isNegative: isNegativeEmotion(result.emotion.id),
    isPositive: isPositiveEmotion(result.emotion.id),
    avatarExpression: result.expression,
    ttsSpeed: result.ttsParams.speed,
  };
}

// ===========================================
// EXPORT
// ===========================================

export default {
  EMOTION_CATEGORIES,
  detectEmotion,
  getResponseStyle,
  getAvatarExpression,
  getTTSParams,
  isNegativeEmotion,
  isPositiveEmotion,
  getResponseEnding,
  getResponseEmoji,
  combineEmotionIntent,
  getAllEmotions,
  getEmotionById,
  analyzeIntensity,
  getEmotionSummary,
};
