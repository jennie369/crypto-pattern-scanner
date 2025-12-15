/**
 * WIDGET TRIGGER DETECTOR
 * Logic detect khi nào show "Add to Dashboard" widget suggestion
 *
 * Triggers:
 * - Planning/steps cụ thể (bước 1, 2, 3...)
 * - Crystal recommendations
 * - Affirmations
 * - Goals với timeline
 * - I Ching/Tarot readings
 */

// Widget types
export const WIDGET_TYPES = {
  STEPS: 'steps',           // Planning/action steps
  CRYSTAL: 'crystal',       // Crystal recommendation
  AFFIRMATION: 'affirmation', // Daily affirmation
  GOAL: 'goal',             // Goal với timeline
  ICHING: 'iching',         // I Ching reading summary
  TAROT: 'tarot',           // Tarot reading summary
  REMINDER: 'reminder',     // Reminder/alarm
  QUOTE: 'quote',           // Inspirational quote
};

// Keywords để detect planning/steps
const STEP_KEYWORDS = [
  'bước 1', 'bước 2', 'bước 3', 'bước 4', 'bước 5',
  'step 1', 'step 2', 'step 3',
  'đầu tiên', 'tiếp theo', 'sau đó', 'cuối cùng',
  'thứ nhất', 'thứ hai', 'thứ ba',
  'trước hết', 'tiếp đến',
  'action step', 'hành động',
  '1.', '2.', '3.', '4.', '5.',
  '- ', '• ',
];

// Keywords để detect goals
const GOAL_KEYWORDS = [
  'mục tiêu', 'target', 'goal',
  'trong 7 ngày', 'trong 30 ngày', 'trong 1 tuần', 'trong 1 tháng',
  'tuần này', 'tháng này', 'năm này',
  'deadline', 'hạn chót',
  'hoàn thành', 'đạt được',
  'kế hoạch', 'plan',
  'cam kết', 'commitment',
];

// Keywords để detect reminders
const REMINDER_KEYWORDS = [
  'nhắc nhở', 'reminder', 'nhớ',
  'hàng ngày', 'daily', 'mỗi ngày',
  'hàng tuần', 'weekly', 'mỗi tuần',
  'sáng', 'trưa', 'chiều', 'tối',
  'lúc', 'vào', 'at',
  'alarm', 'báo thức',
];

// Keywords để detect quotes
const QUOTE_KEYWORDS = [
  'câu nói', 'quote', 'trích dẫn',
  'châm ngôn', 'ngạn ngữ',
  'wisdom', 'trí tuệ',
  '"', '"', '«', '»',
];

/**
 * Detect widget type từ content
 * @param {Object} content - Content object từ chat/reading
 * @returns {Object|null} - Widget suggestion hoặc null
 */
export const detectWidgetTrigger = (content) => {
  if (!content) return null;

  const triggers = [];

  // Check for I Ching reading
  if (content.type === 'iching' || content.hexagramNumber) {
    triggers.push({
      type: WIDGET_TYPES.ICHING,
      priority: 1,
      data: {
        hexagramNumber: content.hexagramNumber,
        hexagramName: content.hexagramName,
        vietnameseName: content.vietnameseName,
        interpretation: content.interpretation?.slice(0, 100),
        area: content.selectedArea || 'career',
        timestamp: Date.now(),
      },
      title: 'Lưu quẻ Dịch này?',
      description: `Quẻ ${content.hexagramNumber}: ${content.vietnameseName}`,
    });
  }

  // Check for Tarot reading
  if (content.type === 'tarot' || content.cards) {
    const cards = content.cards || [];
    triggers.push({
      type: WIDGET_TYPES.TAROT,
      priority: 1,
      data: {
        cards: cards.map(c => ({
          name: c.name || c.vietnamese,
          position: c.position,
          isReversed: c.isReversed,
        })),
        spread: content.spreadType || 'three-card',
        interpretation: content.interpretation?.slice(0, 100),
        timestamp: Date.now(),
      },
      title: 'Lưu trải bài này?',
      description: cards.map(c => c.vietnamese || c.name).join(' • '),
    });
  }

  // Check for crystal recommendations
  if (content.crystals && content.crystals.length > 0) {
    content.crystals.forEach(crystal => {
      triggers.push({
        type: WIDGET_TYPES.CRYSTAL,
        priority: 2,
        data: {
          name: crystal.name,
          vietnameseName: crystal.vietnameseName,
          reason: crystal.reason,
          shopHandle: crystal.shopHandle,
          source: content.source || 'gemmaster',
          timestamp: Date.now(),
        },
        title: 'Thêm Crystal vào Dashboard?',
        description: crystal.vietnameseName || crystal.name,
      });
    });
  }

  // Check for affirmations
  if (content.affirmations && content.affirmations.length > 0) {
    triggers.push({
      type: WIDGET_TYPES.AFFIRMATION,
      priority: 2,
      data: {
        affirmations: content.affirmations,
        source: content.source || 'gemmaster',
        timestamp: Date.now(),
      },
      title: 'Lưu Affirmation?',
      description: content.affirmations[0]?.slice(0, 50) + '...',
    });
  }

  // Check for action steps trong text
  const text = content.text || content.interpretation || '';
  if (detectStepsInText(text)) {
    const steps = extractSteps(text);
    if (steps.length > 0) {
      triggers.push({
        type: WIDGET_TYPES.STEPS,
        priority: 3,
        data: {
          steps: steps,
          source: content.source || 'gemmaster',
          context: content.context || '',
          timestamp: Date.now(),
        },
        title: 'Lưu các bước hành động?',
        description: `${steps.length} bước cần thực hiện`,
      });
    }
  }

  // Check for goals trong text
  if (detectGoalsInText(text)) {
    triggers.push({
      type: WIDGET_TYPES.GOAL,
      priority: 3,
      data: {
        goalText: extractGoal(text),
        timeline: extractTimeline(text),
        source: content.source || 'gemmaster',
        timestamp: Date.now(),
      },
      title: 'Thêm mục tiêu này?',
      description: extractGoal(text).slice(0, 50),
    });
  }

  // Check for reminders
  if (detectRemindersInText(text)) {
    triggers.push({
      type: WIDGET_TYPES.REMINDER,
      priority: 4,
      data: {
        reminderText: text.slice(0, 100),
        frequency: detectFrequency(text),
        source: content.source || 'gemmaster',
        timestamp: Date.now(),
      },
      title: 'Tạo nhắc nhở?',
      description: 'Đặt lịch nhắc nhở cho hoạt động này',
    });
  }

  // Check for quotes
  if (detectQuotesInText(text)) {
    const quote = extractQuote(text);
    if (quote) {
      triggers.push({
        type: WIDGET_TYPES.QUOTE,
        priority: 5,
        data: {
          quote: quote,
          source: content.source || 'gemmaster',
          timestamp: Date.now(),
        },
        title: 'Lưu câu nói này?',
        description: quote.slice(0, 50) + '...',
      });
    }
  }

  // Sort by priority và return highest priority
  triggers.sort((a, b) => a.priority - b.priority);

  return triggers.length > 0 ? triggers[0] : null;
};

/**
 * Detect tất cả widget triggers
 * @param {Object} content - Content object
 * @returns {Array} - Mảng tất cả triggers
 */
export const detectAllWidgetTriggers = (content) => {
  if (!content) return [];

  const result = detectWidgetTrigger(content);
  if (!result) return [];

  // Reconstruct để get all triggers
  const triggers = [];

  // Manually detect all types
  if (content.type === 'iching' || content.hexagramNumber) {
    triggers.push(createIChingTrigger(content));
  }

  if (content.type === 'tarot' || content.cards) {
    triggers.push(createTarotTrigger(content));
  }

  if (content.crystals?.length > 0) {
    triggers.push(...content.crystals.map(c => createCrystalTrigger(c, content.source)));
  }

  if (content.affirmations?.length > 0) {
    triggers.push(createAffirmationTrigger(content.affirmations, content.source));
  }

  const text = content.text || content.interpretation || '';

  if (detectStepsInText(text)) {
    const steps = extractSteps(text);
    if (steps.length > 0) {
      triggers.push(createStepsTrigger(steps, content));
    }
  }

  if (detectGoalsInText(text)) {
    triggers.push(createGoalTrigger(text, content.source));
  }

  return triggers.filter(Boolean);
};

// Helper functions

const detectStepsInText = (text) => {
  if (!text) return false;
  const lowerText = text.toLowerCase();
  return STEP_KEYWORDS.some(keyword => lowerText.includes(keyword.toLowerCase()));
};

const detectGoalsInText = (text) => {
  if (!text) return false;
  const lowerText = text.toLowerCase();
  return GOAL_KEYWORDS.some(keyword => lowerText.includes(keyword.toLowerCase()));
};

const detectRemindersInText = (text) => {
  if (!text) return false;
  const lowerText = text.toLowerCase();
  return REMINDER_KEYWORDS.some(keyword => lowerText.includes(keyword.toLowerCase()));
};

const detectQuotesInText = (text) => {
  if (!text) return false;
  return QUOTE_KEYWORDS.some(keyword => text.includes(keyword));
};

const extractSteps = (text) => {
  const steps = [];
  const lines = text.split('\n');

  for (const line of lines) {
    const trimmed = line.trim();
    // Match numbered steps
    const numberedMatch = trimmed.match(/^(\d+\.|\d+\))\s*(.+)/);
    if (numberedMatch) {
      steps.push({
        number: steps.length + 1,
        text: numberedMatch[2].trim(),
        completed: false,
      });
      continue;
    }

    // Match bullet points
    const bulletMatch = trimmed.match(/^[-•]\s*(.+)/);
    if (bulletMatch) {
      steps.push({
        number: steps.length + 1,
        text: bulletMatch[1].trim(),
        completed: false,
      });
      continue;
    }

    // Match Vietnamese step keywords
    const vietMatch = trimmed.match(/^(bước \d+|thứ \w+|đầu tiên|tiếp theo|sau đó|cuối cùng)[:\s]+(.+)/i);
    if (vietMatch) {
      steps.push({
        number: steps.length + 1,
        text: vietMatch[2].trim(),
        completed: false,
      });
    }
  }

  return steps;
};

const extractGoal = (text) => {
  // Try to extract the main goal statement
  const lines = text.split('\n');
  for (const line of lines) {
    const lowerLine = line.toLowerCase();
    if (lowerLine.includes('mục tiêu') || lowerLine.includes('goal') || lowerLine.includes('target')) {
      return line.trim();
    }
  }
  // Fallback to first sentence
  const firstSentence = text.split(/[.!?]/)[0];
  return firstSentence?.trim() || text.slice(0, 100);
};

const extractTimeline = (text) => {
  const lowerText = text.toLowerCase();

  if (lowerText.includes('7 ngày') || lowerText.includes('1 tuần') || lowerText.includes('tuần này')) {
    return '7_days';
  }
  if (lowerText.includes('30 ngày') || lowerText.includes('1 tháng') || lowerText.includes('tháng này')) {
    return '30_days';
  }
  if (lowerText.includes('năm này') || lowerText.includes('1 năm')) {
    return '1_year';
  }

  return 'custom';
};

const detectFrequency = (text) => {
  const lowerText = text.toLowerCase();

  if (lowerText.includes('hàng ngày') || lowerText.includes('daily') || lowerText.includes('mỗi ngày')) {
    return 'daily';
  }
  if (lowerText.includes('hàng tuần') || lowerText.includes('weekly') || lowerText.includes('mỗi tuần')) {
    return 'weekly';
  }

  return 'once';
};

const extractQuote = (text) => {
  // Match quoted text
  const quoteMatch = text.match(/[""]([^""]+)[""]/);
  if (quoteMatch) {
    return quoteMatch[1];
  }

  const altQuoteMatch = text.match(/«([^»]+)»/);
  if (altQuoteMatch) {
    return altQuoteMatch[1];
  }

  return null;
};

// Creator functions for each trigger type

const createIChingTrigger = (content) => ({
  type: WIDGET_TYPES.ICHING,
  priority: 1,
  data: {
    hexagramNumber: content.hexagramNumber,
    hexagramName: content.hexagramName,
    vietnameseName: content.vietnameseName,
    interpretation: content.interpretation?.slice(0, 100),
    area: content.selectedArea || 'career',
    timestamp: Date.now(),
  },
  title: 'Lưu quẻ Dịch này?',
  description: `Quẻ ${content.hexagramNumber}: ${content.vietnameseName}`,
});

const createTarotTrigger = (content) => {
  const cards = content.cards || [];
  return {
    type: WIDGET_TYPES.TAROT,
    priority: 1,
    data: {
      cards: cards.map(c => ({
        name: c.name || c.vietnamese,
        position: c.position,
        isReversed: c.isReversed,
      })),
      spread: content.spreadType || 'three-card',
      interpretation: content.interpretation?.slice(0, 100),
      timestamp: Date.now(),
    },
    title: 'Lưu trải bài này?',
    description: cards.map(c => c.vietnamese || c.name).join(' • '),
  };
};

const createCrystalTrigger = (crystal, source) => ({
  type: WIDGET_TYPES.CRYSTAL,
  priority: 2,
  data: {
    name: crystal.name,
    vietnameseName: crystal.vietnameseName,
    reason: crystal.reason,
    shopHandle: crystal.shopHandle,
    source: source || 'gemmaster',
    timestamp: Date.now(),
  },
  title: 'Thêm Crystal vào Dashboard?',
  description: crystal.vietnameseName || crystal.name,
});

const createAffirmationTrigger = (affirmations, source) => ({
  type: WIDGET_TYPES.AFFIRMATION,
  priority: 2,
  data: {
    affirmations: affirmations,
    source: source || 'gemmaster',
    timestamp: Date.now(),
  },
  title: 'Lưu Affirmation?',
  description: affirmations[0]?.slice(0, 50) + '...',
});

const createStepsTrigger = (steps, content) => ({
  type: WIDGET_TYPES.STEPS,
  priority: 3,
  data: {
    steps: steps,
    source: content.source || 'gemmaster',
    context: content.context || '',
    timestamp: Date.now(),
  },
  title: 'Lưu các bước hành động?',
  description: `${steps.length} bước cần thực hiện`,
});

const createGoalTrigger = (text, source) => ({
  type: WIDGET_TYPES.GOAL,
  priority: 3,
  data: {
    goalText: extractGoal(text),
    timeline: extractTimeline(text),
    source: source || 'gemmaster',
    timestamp: Date.now(),
  },
  title: 'Thêm mục tiêu này?',
  description: extractGoal(text).slice(0, 50),
});

/**
 * Check if content should show widget suggestion
 * @param {Object} content - Content to check
 * @returns {boolean}
 */
export const shouldShowWidgetSuggestion = (content) => {
  return detectWidgetTrigger(content) !== null;
};

/**
 * Get widget icon by type
 * @param {string} type - Widget type
 * @returns {string} - Icon name from lucide
 */
export const getWidgetIcon = (type) => {
  const icons = {
    [WIDGET_TYPES.STEPS]: 'ListChecks',
    [WIDGET_TYPES.CRYSTAL]: 'Gem',
    [WIDGET_TYPES.AFFIRMATION]: 'Heart',
    [WIDGET_TYPES.GOAL]: 'Target',
    [WIDGET_TYPES.ICHING]: 'Hexagon',
    [WIDGET_TYPES.TAROT]: 'Sparkles',
    [WIDGET_TYPES.REMINDER]: 'Bell',
    [WIDGET_TYPES.QUOTE]: 'Quote',
  };
  return icons[type] || 'Plus';
};

/**
 * Get widget color by type
 * @param {string} type - Widget type
 * @returns {string} - Color hex
 */
export const getWidgetColor = (type) => {
  const colors = {
    [WIDGET_TYPES.STEPS]: '#4ECDC4',     // Teal
    [WIDGET_TYPES.CRYSTAL]: '#9B59B6',   // Purple
    [WIDGET_TYPES.AFFIRMATION]: '#E74C3C', // Red/Pink
    [WIDGET_TYPES.GOAL]: '#F39C12',      // Orange
    [WIDGET_TYPES.ICHING]: '#2ECC71',    // Green
    [WIDGET_TYPES.TAROT]: '#3498DB',     // Blue
    [WIDGET_TYPES.REMINDER]: '#1ABC9C',  // Turquoise
    [WIDGET_TYPES.QUOTE]: '#9B59B6',     // Purple
  };
  return colors[type] || '#95A5A6';
};

export default {
  WIDGET_TYPES,
  detectWidgetTrigger,
  detectAllWidgetTriggers,
  shouldShowWidgetSuggestion,
  getWidgetIcon,
  getWidgetColor,
};
