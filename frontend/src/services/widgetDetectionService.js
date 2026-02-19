/**
 * Widget Detection Service (Web)
 * Ported from gem-mobile/src/services/widgetDetectionService.js
 *
 * Detects when AI response should trigger widget creation.
 * Pure JavaScript - no mobile dependencies.
 */

export const WIDGET_TYPES = {
  GOAL: 'goal',
  AFFIRMATION: 'affirmation',
  HABIT: 'habit',
  CRYSTAL: 'crystal',
  QUOTE: 'quote',
  TAROT: 'tarot',
};

const DETECTION_PATTERNS = {
  goal: {
    keywords: [
      'muc tieu', 'target', 'dat duoc', 'muon dat',
      'trong \\d+ ngay', 'trong \\d+ thang', 'trong \\d+ nam',
      'manifest', 'manifestation', 'hien hoa',
      'trieu', 'ty', 'thu nhap',
      'tai loc', 'wealth',
      'deadline', 'han chot',
    ],
    minMatches: 3,
    baseConfidence: 0.85,
    requiredKeywords: ['muc tieu', 'target', 'manifest', 'dat duoc', 'muon dat'],
  },
  affirmation: {
    keywords: [
      'khang dinh', 'affirmation', 'cau noi tich cuc', 'loi khang dinh',
      'toi xung dang', 'toi co the', 'toi la', 'toi se',
      'tu tin', 'yeu ban than', 'tu yeu',
      'hang ngay', 'moi ngay', 'thuc hanh',
      'cau affirmation', 'bai tap affirmation',
    ],
    minMatches: 2,
    baseConfidence: 0.80,
    requiredKeywords: ['khang dinh', 'affirmation', 'cau noi tich cuc', 'loi khang dinh', 'toi xung dang', 'toi co the'],
  },
  habit: {
    keywords: [
      'thoi quen', 'habit', 'routine',
      'buoc 1', 'buoc 2', 'step 1', 'step 2',
      'checklist', 'danh sach', 'to-do',
      'ke hoach hanh dong', 'action plan',
    ],
    minMatches: 3,
    baseConfidence: 0.80,
    requiredKeywords: ['thoi quen', 'habit', 'routine', 'checklist', 'ke hoach hanh dong'],
  },
  crystal: {
    keywords: [
      'thach anh tim', 'thach anh hong', 'thach anh vang',
      'amethyst', 'citrine', 'rose quartz', 'clear quartz',
      'chakra', 'healing', 'crystal grid',
      'phong thuy', 'feng shui',
      'chon da', 'goi y da',
    ],
    minMatches: 2,
    baseConfidence: 0.80,
    requiredKeywords: ['thach anh', 'crystal', 'da quy', 'amethyst', 'citrine', 'rose quartz'],
  },
};

const DATA_EXTRACTORS = {
  goal: (aiResponse, userMessage) => {
    const combined = `${userMessage} ${aiResponse}`.toLowerCase();

    const amountMatch = combined.match(/(\d+(?:[.,]\d+)?)\s*(trieu|ty|tr|m|k)/i);
    let targetAmount = 0;
    if (amountMatch) {
      const num = parseFloat(amountMatch[1].replace(',', '.'));
      const unit = amountMatch[2].toLowerCase();
      if (unit === 'ty') targetAmount = num * 1000000000;
      else if (unit === 'trieu' || unit === 'tr' || unit === 'm') targetAmount = num * 1000000;
      else if (unit === 'k') targetAmount = num * 1000;
    }

    const timeMatch = combined.match(/trong\s*(\d+)\s*(ngay|thang|nam|tuan)/i);
    let targetDate = null;
    if (timeMatch) {
      const num = parseInt(timeMatch[1]);
      const unit = timeMatch[2].toLowerCase();
      const date = new Date();
      if (unit === 'ngay') date.setDate(date.getDate() + num);
      else if (unit === 'tuan') date.setDate(date.getDate() + num * 7);
      else if (unit === 'thang') date.setMonth(date.getMonth() + num);
      else if (unit === 'nam') date.setFullYear(date.getFullYear() + num);
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

  affirmation: (aiResponse) => {
    const lines = aiResponse.split('\n');
    const affirmations = [];

    for (const line of lines) {
      const cleaned = line.replace(/^[-*\d.]\s*/, '').trim();
      if (cleaned.match(/^(toi|i am|i can|i will)/i) &&
          cleaned.length > 10 &&
          cleaned.length < 200) {
        affirmations.push(cleaned);
      }
    }

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

  habit: (aiResponse) => {
    const lines = aiResponse.split('\n');
    const habits = [];

    for (const line of lines) {
      if (line.match(/^(\d+\.|\d+\)|\*|-)/)) {
        const cleaned = line.replace(/^(\d+\.|\d+\)|\*|-)\s*/, '').trim();
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
      'thach anh tim': 'Amethyst',
      'amethyst': 'Amethyst',
      'thach anh hong': 'Rose Quartz',
      'rose quartz': 'Rose Quartz',
      'thach anh vang': 'Citrine',
      'citrine': 'Citrine',
      'thach anh trang': 'Clear Quartz',
      'clear quartz': 'Clear Quartz',
      'thach anh khoi': 'Smoky Quartz',
      'hematite': 'Hematite',
    };

    const crystals = [];
    for (const [key, value] of Object.entries(crystalMap)) {
      if (combined.includes(key) && !crystals.includes(value)) {
        crystals.push(value);
      }
    }

    let purpose = 'general';
    if (combined.match(/tinh yeu|love|relationship/)) purpose = 'love';
    else if (combined.match(/tien|money|tai loc|wealth/)) purpose = 'wealth';
    else if (combined.match(/thien|meditation|calm|sleep/)) purpose = 'meditation';
    else if (combined.match(/bao ve|protection/)) purpose = 'protection';

    return {
      crystals: crystals.slice(0, 5),
      purpose,
      lastCleansed: null,
    };
  },
};

const generateWidgetTitle = (widgetType, data) => {
  switch (widgetType) {
    case 'goal':
      if (data.targetAmount) {
        const formatted = new Intl.NumberFormat('vi-VN').format(data.targetAmount);
        return `Muc tieu: ${formatted} VND`;
      }
      return 'Muc tieu moi';
    case 'affirmation': {
      const count = data.affirmations?.length || 0;
      return count > 0 ? `${count} cau khang dinh` : 'Khang dinh hang ngay';
    }
    case 'habit': {
      const habitCount = data.habits?.length || 0;
      return `Ke hoach hanh dong (${habitCount} buoc)`;
    }
    case 'crystal': {
      const purposes = {
        love: 'Tinh yeu',
        wealth: 'Thinh vuong',
        meditation: 'Thien dinh',
        protection: 'Bao ve',
        general: 'Can bang',
      };
      return `Crystal Grid - ${purposes[data.purpose] || 'Nang luong'}`;
    }
    default:
      return 'Widget moi';
  }
};

export const detectWidgetTrigger = (aiResponse, userMessage) => {
  if (!aiResponse || !userMessage) {
    return { shouldShow: false };
  }

  const combined = `${userMessage} ${aiResponse}`.toLowerCase();
  let bestMatch = null;
  let bestScore = 0;

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

    if (pattern.requiredKeywords) {
      for (const reqKeyword of pattern.requiredKeywords) {
        if (combined.includes(reqKeyword.toLowerCase())) {
          hasRequiredKeyword = true;
          break;
        }
      }
    } else {
      hasRequiredKeyword = true;
    }

    if (matchCount >= pattern.minMatches && hasRequiredKeyword) {
      const confidence = Math.min(
        (matchCount / pattern.minMatches) * pattern.baseConfidence,
        1.0
      );
      if (confidence > bestScore) {
        bestScore = confidence;
        bestMatch = { widgetType, confidence, matchedKeywords };
      }
    }
  }

  const CONFIDENCE_THRESHOLD = 0.80;

  if (bestMatch && bestMatch.confidence >= CONFIDENCE_THRESHOLD) {
    const extractor = DATA_EXTRACTORS[bestMatch.widgetType];
    const extractedData = extractor ? extractor(aiResponse, userMessage) : {};
    const title = generateWidgetTitle(bestMatch.widgetType, extractedData);

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
