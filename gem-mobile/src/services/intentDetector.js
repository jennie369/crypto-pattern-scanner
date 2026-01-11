// =====================================================
// INTENT DETECTOR SERVICE
// Phát hiện intent từ message người dùng
// Tích hợp Vietnamese NLP Service
// =====================================================

import { vietnameseNLP, INTENT_KEYWORDS } from './nlp';

/**
 * @typedef {Object} IntentResult
 * @property {string} intent - Intent chính
 * @property {string|null} secondaryIntent - Intent phụ
 * @property {number} confidence - Độ tin cậy (0-1)
 * @property {Object} entities - Các entities trích xuất được
 * @property {Object} nlp - Kết quả NLP đầy đủ
 * @property {Object} scores - Điểm của từng intent
 */

/**
 * Intent categories với priority
 */
const INTENT_PRIORITY = {
  // High priority - cần xử lý ngay
  purchase: 10,
  pricing: 9,
  inventory: 8,
  shipping: 7,

  // Medium priority - spiritual/trading
  divination: 6,
  crystal: 6,
  trading: 6,
  crypto: 6,
  analysis: 5,

  // Life areas
  spiritual: 5,
  love: 4,
  money: 4,
  health: 4,
  career: 4,

  // Low priority - general
  greeting: 2,
  thanks: 2,
  help: 3,
  gift: 3,
  size: 3,

  // Default
  general: 1,
};

/**
 * Detect intent với NLP preprocessing
 *
 * @param {string} text - Message từ user
 * @returns {IntentResult} - Intent detection result
 *
 * @example
 * const result = detectIntentEnhanced("còn hàng ko shop, mik ở HN");
 * // {
 * //   intent: "inventory",
 * //   confidence: 0.85,
 * //   entities: { location: "Hà Nội" },
 * //   ...
 * // }
 */
export const detectIntentEnhanced = (text) => {
  // 1. NLP Processing
  const nlpResult = vietnameseNLP.process(text);

  // 2. Detect intent từ normalized text
  const { normalized, keywords, entities } = nlpResult;

  // 3. Score each intent category
  const scores = {};

  for (const [intent, intentWords] of Object.entries(INTENT_KEYWORDS)) {
    let score = 0;

    // Check keywords từ NLP
    for (const keyword of keywords) {
      if (intentWords.some((w) => keyword.includes(w) || w.includes(keyword))) {
        score += 2;
      }
    }

    // Check normalized text
    for (const word of intentWords) {
      if (normalized.includes(word)) {
        score += 1;
      }
    }

    // Apply priority multiplier
    const priority = INTENT_PRIORITY[intent] || 1;
    score = score * (1 + priority * 0.05);

    scores[intent] = score;
  }

  // 4. Get top intents
  const sortedIntents = Object.entries(scores)
    .filter(([_, score]) => score > 0)
    .sort((a, b) => b[1] - a[1]);

  const primaryIntent = sortedIntents[0]?.[0] || 'general';
  const secondaryIntent = sortedIntents[1]?.[0] || null;

  // 5. Calculate confidence
  const maxScore = sortedIntents[0]?.[1] || 0;
  const secondScore = sortedIntents[1]?.[1] || 0;

  // Higher confidence if there's clear winner
  let confidence = Math.min(0.95, 0.5 + maxScore * 0.08);
  if (maxScore > 0 && secondScore > 0) {
    // Reduce confidence if scores are close
    const scoreDiff = (maxScore - secondScore) / maxScore;
    confidence = confidence * (0.7 + scoreDiff * 0.3);
  }

  // 6. Extract relevant entities
  const extractedData = {};

  for (const entity of entities) {
    switch (entity.label) {
      case 'LOCATION':
        extractedData.location = entity.value;
        break;
      case 'QUANTITY':
        extractedData.quantity = entity.value;
        extractedData.quantityUnit = entity.unit;
        break;
      case 'MONEY':
        extractedData.budget = entity.value;
        break;
      case 'PHONE':
        extractedData.phone = entity.value;
        break;
      case 'EMAIL':
        extractedData.email = entity.value;
        break;
    }
  }

  return {
    intent: primaryIntent,
    secondaryIntent,
    confidence: Math.round(confidence * 100) / 100,
    entities: extractedData,
    nlp: nlpResult,
    scores,
  };
};

/**
 * Detect intent đơn giản (backward compatible)
 *
 * @param {string} text - Message từ user
 * @returns {string} - Intent name
 */
export const detectIntent = (text) => {
  const result = detectIntentEnhanced(text);
  return result.intent;
};

/**
 * Check if intent matches category
 *
 * @param {string} text - Message từ user
 * @param {string} category - Category to check
 * @returns {boolean}
 */
export const isIntentCategory = (text, category) => {
  const result = detectIntentEnhanced(text);
  return result.intent === category || result.secondaryIntent === category;
};

/**
 * Get all possible intents with scores
 *
 * @param {string} text - Message từ user
 * @returns {Array<{intent: string, score: number}>}
 */
export const getAllIntents = (text) => {
  const result = detectIntentEnhanced(text);
  return Object.entries(result.scores)
    .filter(([_, score]) => score > 0)
    .sort((a, b) => b[1] - a[1])
    .map(([intent, score]) => ({ intent, score }));
};

/**
 * Detect if message is a question
 *
 * @param {string} text - Message từ user
 * @returns {boolean}
 */
export const isQuestion = (text) => {
  if (!text) return false;

  const normalized = vietnameseNLP.normalizeText(text);

  // Question indicators
  const questionWords = [
    'không',
    'sao',
    'gì',
    'đâu',
    'nào',
    'bao nhiêu',
    'mấy',
    'khi nào',
    'như thế nào',
    'tại sao',
    'làm sao',
  ];

  // Check for question mark
  if (text.includes('?')) return true;

  // Check for question words
  for (const word of questionWords) {
    if (normalized.includes(word)) return true;
  }

  return false;
};

/**
 * Detect sentiment (positive/negative/neutral)
 *
 * @param {string} text - Message từ user
 * @returns {'positive' | 'negative' | 'neutral'}
 */
export const detectSentiment = (text) => {
  if (!text) return 'neutral';

  const normalized = vietnameseNLP.normalizeText(text);

  const positiveWords = [
    'tốt',
    'hay',
    'đẹp',
    'thích',
    'yêu',
    'tuyệt',
    'xuất sắc',
    'cảm ơn',
    'vui',
    'hạnh phúc',
    'ổn',
    'được',
    'ok',
    'good',
    'nice',
    'love',
  ];

  const negativeWords = [
    'xấu',
    'dở',
    'tệ',
    'ghét',
    'chán',
    'buồn',
    'khó chịu',
    'thất vọng',
    'không được',
    'không thích',
    'bad',
    'hate',
    'terrible',
  ];

  let positiveScore = 0;
  let negativeScore = 0;

  for (const word of positiveWords) {
    if (normalized.includes(word)) positiveScore++;
  }

  for (const word of negativeWords) {
    if (normalized.includes(word)) negativeScore++;
  }

  if (positiveScore > negativeScore) return 'positive';
  if (negativeScore > positiveScore) return 'negative';
  return 'neutral';
};

/**
 * Detect urgency level
 *
 * @param {string} text - Message từ user
 * @returns {'high' | 'medium' | 'low'}
 */
export const detectUrgency = (text) => {
  if (!text) return 'low';

  const normalized = vietnameseNLP.normalizeText(text);

  const highUrgencyWords = [
    'gấp',
    'khẩn',
    'ngay',
    'lập tức',
    'urgent',
    'asap',
    'nhanh',
    'sớm nhất',
  ];

  const mediumUrgencyWords = ['sớm', 'nhanh', 'hôm nay', 'bây giờ'];

  for (const word of highUrgencyWords) {
    if (normalized.includes(word)) return 'high';
  }

  for (const word of mediumUrgencyWords) {
    if (normalized.includes(word)) return 'medium';
  }

  return 'low';
};

export default {
  detectIntent,
  detectIntentEnhanced,
  isIntentCategory,
  getAllIntents,
  isQuestion,
  detectSentiment,
  detectUrgency,
};
