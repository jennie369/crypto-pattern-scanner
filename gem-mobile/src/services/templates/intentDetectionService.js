/**
 * Intent Detection Service
 *
 * Detects template intent from user messages
 * Supports Vietnamese and English keywords with fuzzy matching
 *
 * Created: 2026-02-02
 */

import { TEMPLATES, getTemplate, canAccessTemplate } from './journalTemplates';

const SERVICE_NAME = '[IntentDetectionService]';

// ==================== INTENT PATTERNS ====================

/**
 * Keyword patterns for each template
 * Organized by template ID with regex patterns
 */
const INTENT_PATTERNS = {
  fear_setting: {
    keywords: [
      // Vietnamese - simple patterns (no complex word boundaries)
      /sợ/i,         // Simple: matches "sợ" anywhere
      /so(?=\s|$)/i, // Matches "so" followed by space or end (stripped)
      /lo lắng/i,
      /lo lang/i,
      /không dám/i,
      /khong dam/i,
      /e ngại/i,
      /lo sợ/i,
      /lo so/i,
      /băn khoăn/i,
      /ban khoan/i,
      /sợ thất bại/i,
      /so that bai/i,
      /sợ rủi ro/i,
      /so rui ro/i,
      /sợ đầu tư/i,
      /so dau tu/i,
      // English
      /\bfear\b/i,
      /\bafraid\b/i,
      /\bworried\b/i,
      /\banxious\b/i,
    ],
    weight: 1.0,
    requiresMinLength: 3,
  },

  think_day: {
    keywords: [
      // Vietnamese - simple patterns
      /mất cân bằng/i,
      /mat can bang/i,
      /review cuộc sống/i,
      /review cuoc song/i,
      /think day/i,
      /đánh giá lại/i,
      /danh gia lai/i,
      /nhìn lại/i,
      /nhin lai/i,
      /suy nghĩ về cuộc sống/i,
      /suy nghi ve cuoc song/i,
      /tổng kết/i,
      /tong ket/i,
      // English
      /life review/i,
      /reflect on life/i,
    ],
    weight: 1.0,
    requiresMinLength: 5,
  },

  gratitude: {
    keywords: [
      // Vietnamese - simple patterns
      /biết ơn/i,
      /biet on/i,
      /cảm ơn/i,
      /cam on/i,
      /hạnh phúc/i,
      /hanh phuc/i,
      /trân trọng/i,
      /tran trong/i,
      // English
      /grateful/i,
      /thankful/i,
      /gratitude/i,
      /appreciate/i,
    ],
    weight: 0.9,
    requiresMinLength: 5,
  },

  goal_basic: {
    keywords: [
      // Vietnamese - simple patterns
      /mục tiêu/i,
      /muc tieu/i,
      /muốn đạt/i,
      /muon dat/i,
      /đặt mục tiêu/i,
      /dat muc tieu/i,
      /tôi muốn/i,
      /toi muon/i,
      /em muốn/i,
      /em muon/i,
      /cam kết/i,
      /cam ket/i,
      // English
      /\bgoal\b/i,
      /set goal/i,
      /my goal/i,
      /want to achieve/i,
    ],
    weight: 0.8,
    requiresMinLength: 5,
  },

  daily_wins: {
    keywords: [
      // Vietnamese - simple patterns
      /thành tựu/i,
      /thanh tuu/i,
      /đã làm được/i,
      /da lam duoc/i,
      /hôm nay đã/i,
      /hom nay da/i,
      /hoàn thành/i,
      /hoan thanh/i,
      /chiến thắng/i,
      /chien thang/i,
      // English
      /\bwin\b/i,
      /\bwins\b/i,
      /achievement/i,
      /accomplished/i,
    ],
    weight: 0.8,
    requiresMinLength: 4,
  },

  weekly_planning: {
    keywords: [
      // Vietnamese - simple patterns
      /tuần này/i,
      /tuan nay/i,
      /tuần mới/i,
      /tuan moi/i,
      /kế hoạch tuần/i,
      /ke hoach tuan/i,
      /tuần tới/i,
      /tuan toi/i,
      // English
      /weekly/i,
      /this week/i,
      /next week/i,
      /week plan/i,
    ],
    weight: 0.9,
    requiresMinLength: 6,
  },

  vision_3_5_years: {
    keywords: [
      // Vietnamese - simple patterns
      /tương lai/i,
      /tuong lai/i,
      /5 năm/i,
      /5 nam/i,
      /3 năm/i,
      /3 nam/i,
      /tầm nhìn/i,
      /tam nhin/i,
      /lý tưởng/i,
      /ly tuong/i,
      // English
      /vision/i,
      /future/i,
      /5 years/i,
      /3 years/i,
      /long term/i,
    ],
    weight: 0.9,
    requiresMinLength: 5,
  },

  trading_journal: {
    keywords: [
      // Vietnamese - simple patterns
      /lệnh/i,
      /lenh/i,
      /giao dịch/i,
      /giao dich/i,
      /vào lệnh/i,
      /vao lenh/i,
      /thoát lệnh/i,
      /thoat lenh/i,
      /ghi chép giao dịch/i,
      /ghi chep giao dich/i,
      // English
      /entry/i,
      /exit/i,
      /\btrade\b/i,
      /trading/i,
      /position/i,
    ],
    weight: 0.85,
    requiresMinLength: 4,
  },
};

// ==================== HELPER FUNCTIONS ====================

/**
 * Normalize Vietnamese text for matching
 * Converts diacritics to base characters for fuzzy matching
 */
const normalizeVietnamese = (text) => {
  if (!text) return '';

  const diacriticsMap = {
    'à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ': 'a',
    'è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ': 'e',
    'ì|í|ị|ỉ|ĩ': 'i',
    'ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ': 'o',
    'ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ': 'u',
    'ỳ|ý|ỵ|ỷ|ỹ': 'y',
    'đ': 'd',
  };

  let normalized = text.toLowerCase();

  for (const [pattern, replacement] of Object.entries(diacriticsMap)) {
    normalized = normalized.replace(new RegExp(`[${pattern}]`, 'gi'), replacement);
  }

  return normalized;
};

/**
 * Calculate match confidence based on multiple factors
 */
const calculateConfidence = (matches, messageLength, patternWeight) => {
  // Base confidence from matches - higher base so single match can trigger
  // 1 match = 0.65, 2 matches = 0.85, 3+ matches = 0.95
  let confidence = Math.min(0.5 + (matches.length * 0.15), 0.95);

  // Apply pattern weight
  confidence *= patternWeight;

  // Boost for longer messages
  if (messageLength > 20) {
    confidence = Math.min(confidence + 0.05, 0.95);
  }

  console.log(`${SERVICE_NAME} calculateConfidence: matches=${matches.length}, msgLen=${messageLength}, weight=${patternWeight}, result=${confidence}`);
  return Math.round(confidence * 100) / 100;
};

// ==================== MAIN FUNCTIONS ====================

/**
 * Detect template intent from user message
 * @param {string} message - User message
 * @param {Object} options - Detection options
 * @param {string} options.userTier - User's tier for access check
 * @param {string[]} options.excludeTemplates - Templates to exclude
 * @param {boolean} options.checkAccess - Whether to check template access
 * @returns {Object|null} - { templateId, confidence, trigger, accessAllowed } or null if no match
 */
export const detectTemplateIntent = (message, options = {}) => {
  if (!message || typeof message !== 'string') {
    return null;
  }

  const {
    userTier = 'free',
    excludeTemplates = [],
    checkAccess = true,
  } = options;

  // Normalize message for matching
  const normalizedMessage = message.toLowerCase();
  // Also create diacritic-stripped version for fallback matching
  const strippedMessage = normalizeVietnamese(message);
  const messageLength = message.length;

  console.log(`${SERVICE_NAME} Detecting intent - original: "${normalizedMessage}", stripped: "${strippedMessage}"`);

  // Track best match
  let bestMatch = null;
  let bestConfidence = 0;

  // Check each template's patterns
  for (const [templateId, pattern] of Object.entries(INTENT_PATTERNS)) {
    // Skip excluded templates
    if (excludeTemplates.includes(templateId)) {
      continue;
    }

    // Check minimum message length
    if (messageLength < pattern.requiresMinLength) {
      continue;
    }

    // Find matching keywords - check both original and diacritic-stripped versions
    const matches = [];
    for (const regex of pattern.keywords) {
      // Try matching against original message
      if (regex.test(normalizedMessage)) {
        matches.push(regex.toString());
      }
      // Also try matching against stripped message for better Unicode support
      else if (regex.test(strippedMessage)) {
        matches.push(regex.toString() + ' (stripped)');
      }
    }

    // Calculate confidence if matches found
    if (matches.length > 0) {
      const confidence = calculateConfidence(matches, messageLength, pattern.weight);
      console.log(`${SERVICE_NAME} Template "${templateId}" matched with confidence ${confidence}, matches:`, matches);

      if (confidence > bestConfidence) {
        bestConfidence = confidence;
        bestMatch = {
          templateId,
          confidence,
          trigger: matches[0],
          matchCount: matches.length,
        };
      }
    }
  }

  // Return null if no match or confidence too low
  if (!bestMatch || bestConfidence < 0.5) {
    console.log(`${SERVICE_NAME} No match found or confidence too low. Best: ${bestConfidence}`);
    return null;
  }

  // Check access if requested
  if (checkAccess) {
    const access = canAccessTemplate(bestMatch.templateId, userTier);
    bestMatch.accessAllowed = access.allowed;
    bestMatch.upgradeRequired = access.upgradeRequired || null;
  }

  console.log(`${SERVICE_NAME} Detected intent:`, bestMatch);

  return bestMatch;
};

/**
 * Extract context for auto-fill from user message
 * @param {string} message - User message
 * @param {Object} template - Template definition
 * @returns {Object} - { fieldId: value } for auto-fill
 */
export const extractContextForAutoFill = (message, template) => {
  if (!message || !template) {
    return {};
  }

  const autoFillData = {};

  // Find fields that support auto-fill
  const autoFillFields = template.fields?.filter((f) => f.autoFillFromContext) || [];

  for (const field of autoFillFields) {
    // Extract relevant content based on field and template
    switch (template.id) {
      case 'fear_setting':
        if (field.id === 'fear_target') {
          // Extract what user is afraid of
          // Pattern: "sợ X", "lo lắng về X", "không dám X"
          const fearPatterns = [
            /s[oợ]\s+(.{5,100}?)(?:\.|,|$)/i,
            /lo\s*l[aắ]ng\s+v[eề]\s+(.{5,100}?)(?:\.|,|$)/i,
            /kh[oô]ng\s*d[aá]m\s+(.{5,100}?)(?:\.|,|$)/i,
            /e\s*ng[aạ]i\s+(.{5,100}?)(?:\.|,|$)/i,
          ];

          for (const pattern of fearPatterns) {
            const match = message.match(pattern);
            if (match && match[1]) {
              autoFillData[field.id] = match[1].trim();
              break;
            }
          }
        }
        break;

      case 'goal_basic':
        if (field.id === 'title') {
          // Extract goal from message
          // Pattern: "mục tiêu X", "muốn X", "đạt X"
          const goalPatterns = [
            /m[uụ]c\s*ti[eê]u\s*(?:l[aà])?\s*(.{5,100}?)(?:\.|,|$)/i,
            /mu[oố]n\s+(.{5,100}?)(?:\.|,|$)/i,
            /[dđ][aạ]t\s+(.{5,100}?)(?:\.|,|$)/i,
          ];

          for (const pattern of goalPatterns) {
            const match = message.match(pattern);
            if (match && match[1]) {
              autoFillData[field.id] = match[1].trim();
              break;
            }
          }
        }
        break;

      case 'trading_journal':
        if (field.id === 'pair') {
          // Extract trading pair
          const pairPattern = /\b([A-Z]{2,10})[\/\-]?([A-Z]{2,10})\b/i;
          const match = message.match(pairPattern);
          if (match) {
            autoFillData[field.id] = `${match[1].toUpperCase()}/${match[2].toUpperCase()}`;
          }
        }
        break;

      default:
        // No specific extraction logic
        break;
    }
  }

  console.log(`${SERVICE_NAME} Extracted auto-fill data:`, autoFillData);

  return autoFillData;
};

/**
 * Check if message is asking about a template (not wanting to use it)
 * @param {string} message - User message
 * @returns {boolean}
 */
export const isAskingAboutTemplate = (message) => {
  if (!message) return false;

  const askingPatterns = [
    /\b(l[aà]\s*g[iì]|what\s*is)\b/i,
    /\b(gi[aả]i\s*th[ií]ch|explain)\b/i,
    /\b(c[aá]ch\s*d[uù]ng|how\s*to\s*use)\b/i,
    /\b(template\s*n[aà]y)\b/i,
    /\b(fear.?setting\s*l[aà])\b/i,
    /\b(think\s*day\s*l[aà])\b/i,
  ];

  for (const pattern of askingPatterns) {
    if (pattern.test(message)) {
      return true;
    }
  }

  return false;
};

/**
 * Get suggested template for message
 * Returns template info without triggering form
 * @param {string} message - User message
 * @param {string} userTier - User's tier
 * @returns {Object|null} - Template info for suggestion
 */
export const getSuggestedTemplate = (message, userTier = 'free') => {
  const intent = detectTemplateIntent(message, { userTier, checkAccess: true });

  if (!intent) {
    return null;
  }

  const template = getTemplate(intent.templateId);
  if (!template) {
    return null;
  }

  return {
    id: template.id,
    name: template.name,
    nameEn: template.nameEn,
    icon: template.icon,
    description: template.description,
    confidence: intent.confidence,
    accessAllowed: intent.accessAllowed,
    upgradeRequired: intent.upgradeRequired,
  };
};

/**
 * Get all available templates for selection
 * (When user wants to manually choose template)
 * @param {string} userTier - User's tier
 * @returns {Array} - Array of template options
 */
export const getTemplateOptions = (userTier = 'free') => {
  return Object.values(TEMPLATES).map((template) => {
    const access = canAccessTemplate(template.id, userTier);
    return {
      id: template.id,
      name: template.name,
      nameEn: template.nameEn,
      icon: template.icon,
      description: template.description,
      category: template.category,
      requiredTier: template.requiredTier,
      accessAllowed: access.allowed,
      upgradeRequired: access.upgradeRequired || null,
    };
  });
};

export default {
  detectTemplateIntent,
  extractContextForAutoFill,
  isAskingAboutTemplate,
  getSuggestedTemplate,
  getTemplateOptions,
};
