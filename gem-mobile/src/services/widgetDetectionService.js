/**
 * Widget Detection Service
 * Detects when AI response should trigger widget creation
 * Based on keywords and patterns from gemKnowledge.json
 */

// Widget Types (matching user_widgets.type)
export const WIDGET_TYPES = {
  GOAL: 'goal',
  AFFIRMATION: 'affirmation',
  HABIT: 'habit',
  CRYSTAL: 'crystal',
  QUOTE: 'quote',
  TAROT: 'tarot',
};

// Detection patterns với keywords từ gemKnowledge.json
// UPDATED: Increased minMatches to reduce spam
const DETECTION_PATTERNS = {
  goal: {
    // Keywords indicate user wants to set a goal/target
    keywords: [
      // Vietnamese - specific goal words
      'mục tiêu', 'target', 'đạt được', 'muốn đạt',
      'trong \\d+ ngày', 'trong \\d+ tháng', 'trong \\d+ năm',
      'manifest', 'manifestation', 'hiện hóa',
      // Financial - specific amounts
      'triệu', 'tỷ', 'thu nhập',
      'tài lộc', 'wealth',
      // Action words
      'deadline', 'hạn chót',
    ],
    minMatches: 3,  // Increased from 2
    baseConfidence: 0.85,
    // Require explicit goal-setting intent
    requiredKeywords: ['mục tiêu', 'target', 'manifest', 'đạt được', 'muốn đạt'],
  },

  affirmation: {
    keywords: [
      'khẳng định', 'affirmation', 'câu nói tích cực', 'lời khẳng định',
      'tôi xứng đáng', 'tôi có thể', 'tôi là', 'tôi sẽ',
      'tự tin', 'yêu bản thân', 'tự yêu',
      'hàng ngày', 'mỗi ngày', 'thực hành',
      'câu affirmation', 'bài tập affirmation',
    ],
    minMatches: 2,  // Reduced from 3 for better detection
    baseConfidence: 0.80,
    requiredKeywords: ['khẳng định', 'affirmation', 'câu nói tích cực', 'lời khẳng định', 'tôi xứng đáng', 'tôi có thể'],
  },

  habit: {
    keywords: [
      'thói quen', 'habit', 'routine',
      'bước 1', 'bước 2', 'step 1', 'step 2',
      'checklist', 'danh sách', 'to-do',
      'kế hoạch hành động', 'action plan',
    ],
    minMatches: 3,  // Increased from 2
    baseConfidence: 0.80,
    requiredKeywords: ['thói quen', 'habit', 'routine', 'checklist', 'kế hoạch hành động'],
  },

  crystal: {
    keywords: [
      // Crystal types - specific names
      'thạch anh tím', 'thạch anh hồng', 'thạch anh vàng',
      'amethyst', 'citrine', 'rose quartz', 'clear quartz',
      // Properties
      'chakra', 'healing', 'crystal grid',
      'phong thủy', 'feng shui',
      // Actions
      'chọn đá', 'gợi ý đá',
    ],
    minMatches: 2,  // Keep at 2 since crystal names are specific
    baseConfidence: 0.80,
    requiredKeywords: ['thạch anh', 'crystal', 'đá quý', 'amethyst', 'citrine', 'rose quartz'],
  },
};

// Data extractors for each widget type
const DATA_EXTRACTORS = {
  goal: (aiResponse, userMessage) => {
    const combined = `${userMessage} ${aiResponse}`.toLowerCase();

    // Extract amount
    const amountMatch = combined.match(/(\d+(?:[.,]\d+)?)\s*(triệu|tỷ|tr|m|k)/i);
    let targetAmount = 0;
    if (amountMatch) {
      const num = parseFloat(amountMatch[1].replace(',', '.'));
      const unit = amountMatch[2].toLowerCase();
      if (unit === 'tỷ') targetAmount = num * 1000000000;
      else if (unit === 'triệu' || unit === 'tr' || unit === 'm') targetAmount = num * 1000000;
      else if (unit === 'k') targetAmount = num * 1000;
    }

    // Extract deadline
    const timeMatch = combined.match(/trong\s*(\d+)\s*(ngày|tháng|năm|tuần)/i);
    let targetDate = null;
    if (timeMatch) {
      const num = parseInt(timeMatch[1]);
      const unit = timeMatch[2].toLowerCase();
      const date = new Date();
      if (unit === 'ngày') date.setDate(date.getDate() + num);
      else if (unit === 'tuần') date.setDate(date.getDate() + num * 7);
      else if (unit === 'tháng') date.setMonth(date.getMonth() + num);
      else if (unit === 'năm') date.setFullYear(date.getFullYear() + num);
      targetDate = date.toISOString().split('T')[0];
    }

    return {
      targetAmount,
      currentAmount: 0,
      targetDate,
      unit: 'VND',
      category: targetAmount > 0 ? 'financial' : 'general',
      notes: '',
    };
  },

  affirmation: (aiResponse, userMessage) => {
    // Extract affirmations from AI response
    const lines = aiResponse.split('\n');
    const affirmations = [];

    for (const line of lines) {
      // Lines starting with "Tôi" or bullet points
      const cleaned = line.replace(/^[•\-*\d.]\s*/, '').trim();
      if (cleaned.match(/^(tôi|i am|i can|i will)/i) &&
          cleaned.length > 10 &&
          cleaned.length < 200) {
        affirmations.push(cleaned);
      }
    }

    // If no affirmations found, try to extract quoted text
    if (affirmations.length === 0) {
      const quotes = aiResponse.match(/"([^"]+)"/g);
      if (quotes) {
        quotes.forEach(q => {
          const cleaned = q.replace(/"/g, '').trim();
          if (cleaned.length > 10 && cleaned.length < 200) {
            affirmations.push(cleaned);
          }
        });
      }
    }

    return {
      affirmations: affirmations.slice(0, 5),
      streak: 0,
      lastCompleted: null,
    };
  },

  habit: (aiResponse, userMessage) => {
    const lines = aiResponse.split('\n');
    const habits = [];

    for (const line of lines) {
      // Numbered items or bullet points
      if (line.match(/^(\d+\.|\d+\)|\*|•|-)/)) {
        const cleaned = line.replace(/^(\d+\.|\d+\)|\*|•|-)\s*/, '').trim();
        // Remove bold markers
        const text = cleaned.replace(/\*\*/g, '').trim();
        if (text.length > 5 && text.length < 150) {
          habits.push({
            id: `habit_${Date.now()}_${habits.length}`,
            name: text,
            done: false,
          });
        }
      }
    }

    return {
      habits: habits.slice(0, 10),
      progress: 0,
    };
  },

  crystal: (aiResponse, userMessage) => {
    const combined = `${userMessage} ${aiResponse}`.toLowerCase();

    const crystalMap = {
      'thạch anh tím': 'Amethyst',
      'amethyst': 'Amethyst',
      'thạch anh hồng': 'Rose Quartz',
      'rose quartz': 'Rose Quartz',
      'thạch anh vàng': 'Citrine',
      'citrine': 'Citrine',
      'thạch anh trắng': 'Clear Quartz',
      'clear quartz': 'Clear Quartz',
      'thạch anh khói': 'Smoky Quartz',
      'hematite': 'Hematite',
    };

    const crystals = [];
    for (const [key, value] of Object.entries(crystalMap)) {
      if (combined.includes(key) && !crystals.includes(value)) {
        crystals.push(value);
      }
    }

    // Detect purpose
    let purpose = 'general';
    if (combined.match(/tình yêu|love|relationship/)) purpose = 'love';
    else if (combined.match(/tiền|money|tài lộc|wealth/)) purpose = 'wealth';
    else if (combined.match(/thiền|meditation|calm|sleep/)) purpose = 'meditation';
    else if (combined.match(/bảo vệ|protection/)) purpose = 'protection';

    return {
      crystals: crystals.slice(0, 5),
      purpose,
      lastCleansed: null,
    };
  },
};

/**
 * Generate widget title based on type and data
 */
const generateWidgetTitle = (widgetType, data) => {
  switch (widgetType) {
    case 'goal':
      if (data.targetAmount) {
        const formatted = new Intl.NumberFormat('vi-VN').format(data.targetAmount);
        return `Mục tiêu: ${formatted} VND`;
      }
      return 'Mục tiêu mới';

    case 'affirmation':
      const count = data.affirmations?.length || 0;
      return count > 0 ? `${count} câu khẳng định` : 'Khẳng định hàng ngày';

    case 'habit':
      const habitCount = data.habits?.length || 0;
      return `Kế hoạch hành động (${habitCount} bước)`;

    case 'crystal':
      const purposes = {
        love: 'Tình yêu',
        wealth: 'Thịnh vượng',
        meditation: 'Thiền định',
        protection: 'Bảo vệ',
        general: 'Cân bằng',
      };
      return `Crystal Grid - ${purposes[data.purpose] || 'Năng lượng'}`;

    default:
      return 'Widget mới';
  }
};

/**
 * Main detection function
 * @param {string} aiResponse - Response from AI
 * @param {string} userMessage - Original user message
 * @returns {Object} { shouldShow, widgetType, confidence, extractedData, title }
 */
export const detectWidgetTrigger = (aiResponse, userMessage) => {
  if (!aiResponse || !userMessage) {
    return { shouldShow: false };
  }

  const combined = `${userMessage} ${aiResponse}`.toLowerCase();

  let bestMatch = null;
  let bestScore = 0;

  // Check each widget type
  for (const [widgetType, pattern] of Object.entries(DETECTION_PATTERNS)) {
    let matchCount = 0;
    const matchedKeywords = [];
    let hasRequiredKeyword = false;

    for (const keyword of pattern.keywords) {
      const regex = new RegExp(keyword, 'i');
      if (regex.test(combined)) {
        matchCount++;
        matchedKeywords.push(keyword);
      }
    }

    // Check if at least one required keyword is present
    if (pattern.requiredKeywords) {
      for (const reqKeyword of pattern.requiredKeywords) {
        if (combined.includes(reqKeyword.toLowerCase())) {
          hasRequiredKeyword = true;
          break;
        }
      }
    } else {
      hasRequiredKeyword = true; // No required keywords = always pass
    }

    // Only match if we have required keyword AND minimum matches
    if (matchCount >= pattern.minMatches && hasRequiredKeyword) {
      const confidence = Math.min(
        (matchCount / pattern.minMatches) * pattern.baseConfidence,
        1.0
      );

      if (confidence > bestScore) {
        bestScore = confidence;
        bestMatch = {
          widgetType,
          confidence,
          matchedKeywords,
        };
      }
    }
  }

  // Threshold - increased from 0.70 to 0.80
  const CONFIDENCE_THRESHOLD = 0.80;

  if (bestMatch && bestMatch.confidence >= CONFIDENCE_THRESHOLD) {
    // Extract data
    const extractor = DATA_EXTRACTORS[bestMatch.widgetType];
    const extractedData = extractor ? extractor(aiResponse, userMessage) : {};

    // Generate title
    const title = generateWidgetTitle(bestMatch.widgetType, extractedData);

    console.log('[WidgetDetection] Detected:', bestMatch.widgetType, 'Confidence:', bestMatch.confidence);

    return {
      shouldShow: true,
      widgetType: bestMatch.widgetType,
      confidence: bestMatch.confidence,
      extractedData,
      title,
      matchedKeywords: bestMatch.matchedKeywords,
    };
  }

  return { shouldShow: false };
};

export default {
  detectWidgetTrigger,
  WIDGET_TYPES,
};
