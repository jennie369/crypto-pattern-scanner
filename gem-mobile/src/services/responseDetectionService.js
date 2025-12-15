/**
 * GEM Mobile - Response Detection Service
 * Day 17-19: AI Chat → Dashboard Integration
 *
 * Detects AI response types and extracts structured data
 * for widget creation in AccountScreen Dashboard.
 *
 * Response Types:
 * - MANIFESTATION_GOAL: Goals, targets, affirmations
 * - CRYSTAL_HEALING: Crystal recommendations
 * - TRADING_ANALYSIS: Trading insights, mistakes
 * - GENERAL_ADVICE: No widget needed
 */

class ResponseDetectionService {
  /**
   * Response types with detection rules
   */
  RESPONSE_TYPES = {
    MANIFESTATION_GOAL: {
      triggers: [
        'manifest', 'goal', 'achieve', 'target', 'thu nhập', 'giàu có',
        'thành công', 'mục tiêu', 'ước mơ', 'tài chính', 'financial',
        'abundance', 'prosperity', 'wealth', 'money', 'tiền',
        'affirmation', 'khẳng định', 'lời khẳng định', 'câu nói tích cực',
        'tôi xứng đáng', 'tôi có thể', 'hàng ngày', 'mỗi ngày'
      ],
      hasFields: ['target_amount', 'timeline', 'affirmations', 'action_plan'],
      widgetTypes: ['GOAL_CARD', 'AFFIRMATION_CARD', 'ACTION_CHECKLIST'],
      confidence: 0.95,
      suggestDashboard: true,
    },

    CRYSTAL_HEALING: {
      triggers: [
        'crystal', 'stress', 'anxiety', 'chakra', 'năng lượng', 'thạch anh',
        'healing', 'đá', 'phong thủy', 'feng shui', 'amethyst', 'citrine',
        'rose quartz', 'pyrite', 'protection', 'bảo vệ'
      ],
      hasFields: ['crystal_names', 'placement', 'usage_guide', 'chakra_alignment'],
      widgetTypes: ['CRYSTAL_GRID', 'USAGE_GUIDE'],
      confidence: 0.92,
      suggestDashboard: true,
    },

    TRADING_ANALYSIS: {
      triggers: [
        'btc', 'trade', 'loss', 'pattern', 'win rate', 'strategy', 'phân tích',
        'trading', 'giao dịch', 'profit', 'lỗ', 'lãi', 'stop loss', 'take profit',
        'entry', 'exit', 'chart', 'technical', 'risk', 'reward'
      ],
      hasFields: ['mistakes', 'spiritual_insight', 'action_plan', 'patterns'],
      widgetTypes: ['CROSS_DOMAIN_CARD', 'TRADING_CHECKLIST'],
      confidence: 0.88,
      suggestDashboard: true,
    },

    GENERAL_ADVICE: {
      triggers: [
        'how', 'what', 'explain', 'why', 'tell me', 'tại sao',
        'như thế nào', 'là gì', 'giải thích'
      ],
      hasFields: null,
      widgetTypes: null,
      confidence: 0.85,
      suggestDashboard: false,
    },
  };

  /**
   * Detect response type from AI response
   * @param {string} aiResponse - AI response text
   * @param {string} userQuery - User's original query
   * @returns {Object|null} - Detection result with type, confidence, rules
   */
  detectResponseType(aiResponse, userQuery) {
    const text = (aiResponse + ' ' + userQuery).toLowerCase();
    const detections = [];

    // Minimum trigger matches required per type to reduce false positives
    const MIN_MATCHES = {
      MANIFESTATION_GOAL: 2,    // Reduced from 3 for better affirmation detection
      CRYSTAL_HEALING: 2,       // Need at least 2 crystal keywords
      TRADING_ANALYSIS: 3,      // Need at least 3 trading keywords
      GENERAL_ADVICE: 1,        // General advice is fallback
    };

    // Check each response type
    Object.entries(this.RESPONSE_TYPES).forEach(([type, rules]) => {
      const triggerMatches = rules.triggers.filter(trigger =>
        text.includes(trigger.toLowerCase())
      ).length;

      const minRequired = MIN_MATCHES[type] || 2;

      // Only add detection if we meet minimum threshold
      if (triggerMatches >= minRequired) {
        const confidence = (triggerMatches / rules.triggers.length) * rules.confidence;

        detections.push({
          type,
          confidence,
          triggerMatches,
          rules,
        });
      }
    });

    // Sort by confidence
    detections.sort((a, b) => b.confidence - a.confidence);

    // Return highest confidence only if it's above threshold
    // Don't return GENERAL_ADVICE as it should not trigger widget
    const result = detections.find(d => d.type !== 'GENERAL_ADVICE');
    return result || null;
  }

  /**
   * Extract structured data from AI response
   * @param {string} aiResponse - AI response text
   * @param {string} responseType - Detected response type
   * @returns {Object} - Extracted structured data
   */
  extractStructuredData(aiResponse, responseType) {
    const data = {};

    switch (responseType) {
      case 'MANIFESTATION_GOAL':
        data.goalTitle = this.extractGoalTitle(aiResponse);
        data.targetAmount = this.extractTargetAmount(aiResponse);
        data.timeline = this.extractTimeline(aiResponse);
        data.affirmations = this.extractAffirmations(aiResponse);
        data.actionSteps = this.extractActionSteps(aiResponse);
        data.crystalRecommendations = this.extractCrystals(aiResponse);
        break;

      case 'CRYSTAL_HEALING':
        data.crystalNames = this.extractCrystals(aiResponse);
        data.usageGuide = this.extractUsageGuide(aiResponse);
        data.placement = this.extractPlacement(aiResponse);
        break;

      case 'TRADING_ANALYSIS':
        data.mistakes = this.extractMistakes(aiResponse);
        data.spiritualInsight = this.extractInsights(aiResponse);
        data.actionPlan = this.extractActionSteps(aiResponse);
        break;
    }

    return data;
  }

  /**
   * Helper: Extract goal title
   */
  extractGoalTitle(text) {
    const patterns = [
      /manifest\s+([^.!?\n]+)/i,
      /goal[:\s]+([^.!?\n]+)/i,
      /achieve\s+([^.!?\n]+)/i,
      /thu nhập[:\s]+([^.!?\n]+)/i,
      /mục tiêu[:\s]+([^.!?\n]+)/i,
      /target[:\s]+([^.!?\n]+)/i,
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        return match[1].trim().slice(0, 100);
      }
    }

    return 'Mục tiêu của bạn';
  }

  /**
   * Helper: Extract target amount
   */
  extractTargetAmount(text) {
    const patterns = [
      /(\d+)\s*M(?!\w)/i,
      /(\d+)\s*triệu/i,
      /(\d+)\s*million/i,
      /(\d+[,\.]\d+)\s*(?:M|triệu|million)/i,
      /\$(\d+[,\d]*)/i,
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        const num = parseFloat(match[1].replace(/,/g, '.'));
        return num * 1000000;
      }
    }

    return 100000000; // Default 100M VND
  }

  /**
   * Helper: Extract timeline
   */
  extractTimeline(text) {
    const patterns = [
      /(\d+)\s*(?:tháng|months?)/i,
      /(\d+)\s*(?:năm|years?)/i,
      /(\d+)\s*(?:tuần|weeks?)/i,
      /(\d+)\s*(?:ngày|days?)/i,
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        return match[0];
      }
    }

    return '6 tháng';
  }

  /**
   * Helper: Extract affirmations
   */
  extractAffirmations(text) {
    const affirmations = [];

    // Look for quoted text
    const quotedPattern = /"([^"]+)"/g;
    let match;

    while ((match = quotedPattern.exec(text)) !== null) {
      if (match[1].length > 10 && match[1].length < 200) {
        affirmations.push(match[1].trim());
      }
    }

    // Look for bullet points with affirmation keywords
    const bulletPattern = /[•✨\-*]\s*([^\n]+)/g;
    while ((match = bulletPattern.exec(text)) !== null) {
      const line = match[1].trim();
      const lineLower = line.toLowerCase();
      // Check if it looks like an affirmation (expanded criteria)
      if (line.length > 10 && line.length < 200 &&
          (lineLower.includes('tôi') ||
           lineLower.includes('i am') ||
           lineLower.includes('i will') ||
           lineLower.includes('sẽ') ||
           lineLower.includes('xứng đáng') ||
           lineLower.includes('có thể') ||
           lineLower.includes('yêu thương') ||
           lineLower.includes('bình an') ||
           lineLower.includes('hạnh phúc') ||
           lineLower.includes('giàu có') ||
           lineLower.includes('thành công') ||
           lineLower.startsWith('affirmation'))) {
        affirmations.push(line);
      }
    }

    // Also look for numbered lists (1. 2. 3.)
    const numberedPattern = /\d+\.\s*([^\n]+)/g;
    while ((match = numberedPattern.exec(text)) !== null) {
      const line = match[1].trim();
      const lineLower = line.toLowerCase();
      // Check if it looks like an affirmation
      if (line.length > 10 && line.length < 200 &&
          (lineLower.includes('tôi') ||
           lineLower.includes('xứng đáng') ||
           lineLower.includes('có thể') ||
           lineLower.startsWith('"'))) {
        affirmations.push(line.replace(/^["']|["']$/g, '').trim());
      }
    }

    // Deduplicate and limit
    return [...new Set(affirmations)].slice(0, 5);
  }

  /**
   * Helper: Extract action steps
   */
  extractActionSteps(text) {
    const steps = [];

    const patterns = [
      /\d+\.\s*([^\n]+)/g,
      /Week\s+\d+[:\s]+([^\n]+)/gi,
      /Step\s+\d+[:\s]+([^\n]+)/gi,
      /Bước\s+\d+[:\s]+([^\n]+)/gi,
      /Tuần\s+\d+[:\s]+([^\n]+)/gi,
    ];

    patterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        const step = match[1].trim();
        if (step.length > 5 && step.length < 150) {
          steps.push(step);
        }
      }
    });

    return [...new Set(steps)].slice(0, 10);
  }

  /**
   * Helper: Extract crystal recommendations
   */
  extractCrystals(text) {
    const crystals = [];
    const knownCrystals = [
      'Citrine', 'Pyrite', 'Green Aventurine', 'Rose Quartz', 'Amethyst',
      'Clear Quartz', 'Black Tourmaline', 'Carnelian', 'Tiger Eye',
      'Thạch anh', 'Thạch anh hồng', 'Thạch anh tím', 'Thạch anh trắng',
      'Mắt hổ', 'Obsidian', 'Jade', 'Lapis Lazuli', 'Malachite',
      'Selenite', 'Moonstone', 'Labradorite'
    ];

    knownCrystals.forEach(crystal => {
      if (text.toLowerCase().includes(crystal.toLowerCase())) {
        crystals.push(crystal);
      }
    });

    return [...new Set(crystals)];
  }

  /**
   * Helper: Extract usage guide
   */
  extractUsageGuide(text) {
    const sections = text.split('\n\n');
    const usageSection = sections.find(section =>
      section.toLowerCase().includes('use') ||
      section.toLowerCase().includes('cách dùng') ||
      section.toLowerCase().includes('sử dụng') ||
      section.toLowerCase().includes('hướng dẫn')
    );

    return usageSection || text.slice(0, 300);
  }

  /**
   * Helper: Extract placement instructions
   */
  extractPlacement(text) {
    const patterns = [
      /place[d]?\s+(?:on|at|in)\s+([^.!?\n]+)/i,
      /đặt\s+(?:ở|tại|vào)\s+([^.!?\n]+)/i,
      /vị trí[:\s]+([^.!?\n]+)/i,
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        return match[1].trim();
      }
    }

    return 'Mang theo người hoặc đặt trong phòng';
  }

  /**
   * Helper: Extract trading mistakes
   */
  extractMistakes(text) {
    const mistakes = [];
    const sections = text.split('\n');

    sections.forEach(line => {
      if (line.toLowerCase().includes('mistake') ||
          line.toLowerCase().includes('sai lầm') ||
          line.toLowerCase().includes('lỗi') ||
          line.includes('❌') ||
          line.includes('✗')) {
        const cleaned = line.replace(/[❌✗\-]/g, '').trim();
        if (cleaned.length > 5) {
          mistakes.push(cleaned);
        }
      }
    });

    return mistakes.slice(0, 5);
  }

  /**
   * Helper: Extract insights
   */
  extractInsights(text) {
    const insights = [];
    const sections = text.split('\n');

    sections.forEach(line => {
      if (line.toLowerCase().includes('insight') ||
          line.toLowerCase().includes('nhận xét') ||
          line.toLowerCase().includes('gợi ý') ||
          line.includes('💡') ||
          line.includes('✨')) {
        const cleaned = line.replace(/[💡✨\-]/g, '').trim();
        if (cleaned.length > 5) {
          insights.push(cleaned);
        }
      }
    });

    return insights.slice(0, 3);
  }

  /**
   * Should suggest dashboard for this response?
   * @param {Object} detection - Detection result
   * @returns {boolean}
   */
  shouldSuggestDashboard(detection) {
    if (!detection) return false;

    // Require higher confidence to avoid spam
    // Need at least 25% confidence (was 15%)
    // Also require suggestDashboard flag from rules
    return detection.rules.suggestDashboard &&
           detection.confidence >= 0.25;
  }

  /**
   * Get widget suggestion message
   * @param {string} responseType
   * @returns {string}
   */
  getWidgetSuggestionMessage(responseType) {
    const messages = {
      MANIFESTATION_GOAL: 'Tôi có thể tạo widget theo dõi mục tiêu cho bạn. Thêm vào Dashboard?',
      CRYSTAL_HEALING: 'Tôi có thể tạo Crystal Grid widget cho bạn. Thêm vào Dashboard?',
      TRADING_ANALYSIS: 'Tôi có thể tạo Trading Checklist cho bạn. Thêm vào Dashboard?',
    };

    return messages[responseType] || 'Thêm vào Dashboard của bạn?';
  }
}

export default new ResponseDetectionService();
