/**
 * Intent Classifier Service
 * Classifies user messages into 25 intent categories
 *
 * Used by AI Brain for:
 * - Quick response selection (Tier 1)
 * - Priority queue scoring
 * - Response template selection
 *
 * Performance target: < 5ms for local classification
 */

// ===========================================
// 25 INTENT CATEGORIES
// ===========================================

export const INTENT_CATEGORIES = {
  // === GREETING & BASIC ===
  GREETING: {
    id: 'GREETING',
    name: 'Chào hỏi',
    priority: 0.3,
    tier: 1, // Quick template response
    patterns: [
      /^(chào|hello|hi|xin chào|chào bạn|hey|alo|chào mọi người)/i,
      /^(good morning|good evening|good afternoon)/i,
      /(chào buổi sáng|chào buổi tối|chào buổi chiều)/i,
    ],
    keywords: ['chào', 'hello', 'hi', 'xin chào', 'hey', 'alo'],
    examples: ['Chào shop', 'Hello', 'Hi mọi người', 'Chào buổi sáng'],
  },

  GOODBYE: {
    id: 'GOODBYE',
    name: 'Tạm biệt',
    priority: 0.2,
    tier: 1,
    patterns: [
      /(tạm biệt|bye|goodbye|bai|see you|hẹn gặp lại)/i,
      /(chào nhé|đi ngủ|offline|đi đây)/i,
    ],
    keywords: ['tạm biệt', 'bye', 'goodbye', 'bai', 'hẹn gặp'],
    examples: ['Bye shop', 'Tạm biệt', 'Đi ngủ đây'],
  },

  THANKS: {
    id: 'THANKS',
    name: 'Cảm ơn',
    priority: 0.3,
    tier: 1,
    patterns: [
      /(cảm ơn|cám ơn|thank|thanks|tks|thank you)/i,
      /(biết ơn|appreciate)/i,
    ],
    keywords: ['cảm ơn', 'cám ơn', 'thank', 'thanks', 'tks'],
    examples: ['Cảm ơn shop', 'Thanks nha', 'Thank you'],
  },

  // === PURCHASE INTENTS (HIGH PRIORITY) ===
  BUY_INTENT: {
    id: 'BUY_INTENT',
    name: 'Muốn mua',
    priority: 1.0, // Highest priority
    tier: 2,
    patterns: [
      /(muốn mua|mua ngay|đặt hàng|order|mua|lấy|chốt)/i,
      /(cho (em|mình|tôi|tui) (mua|lấy|đặt))/i,
      /(ship|giao hàng|có ship)/i,
      /(còn hàng|còn không|hết chưa)/i,
    ],
    keywords: ['mua', 'order', 'đặt hàng', 'chốt', 'ship', 'còn hàng', 'lấy'],
    examples: ['Em muốn mua viên này', 'Cho mình đặt hàng', 'Còn hàng không shop?'],
  },

  PRICE_QUERY: {
    id: 'PRICE_QUERY',
    name: 'Hỏi giá',
    priority: 0.9,
    tier: 2,
    patterns: [
      /(giá|bao nhiêu|bn|how much|price)/i,
      /(giá cả|giá tiền|giá bán|giá gốc|giá sale)/i,
      /(rẻ|đắt|mắc|expensive|cheap)/i,
      /(giảm giá|khuyến mãi|sale|discount)/i,
    ],
    keywords: ['giá', 'bao nhiêu', 'bn', 'rẻ', 'đắt', 'sale', 'khuyến mãi'],
    examples: ['Viên này giá bao nhiêu?', 'Có sale không shop?', 'Giá gốc là bn?'],
  },

  PRODUCT_INFO: {
    id: 'PRODUCT_INFO',
    name: 'Thông tin sản phẩm',
    priority: 0.8,
    tier: 2,
    patterns: [
      /(là gì|tác dụng|công dụng|có tác dụng|dùng để)/i,
      /(chất liệu|xuất xứ|nguồn gốc|origin)/i,
      /(size|kích thước|cỡ|nặng|gram|mm)/i,
      /(thật|fake|authentic|chính hãng)/i,
    ],
    keywords: ['tác dụng', 'công dụng', 'chất liệu', 'xuất xứ', 'thật', 'fake'],
    examples: ['Thạch anh hồng có tác dụng gì?', 'Đá này xuất xứ đâu?'],
  },

  // === ZODIAC & ELEMENT QUERIES ===
  ZODIAC_QUERY: {
    id: 'ZODIAC_QUERY',
    name: 'Hỏi về tuổi',
    priority: 0.85,
    tier: 2,
    patterns: [
      /(tuổi|sinh năm|năm sinh|con giáp)/i,
      /(tý|sửu|dần|mão|thìn|tỵ|ngọ|mùi|thân|dậu|tuất|hợi)/i,
      /(chuột|trâu|hổ|mèo|rồng|rắn|ngựa|dê|khỉ|gà|chó|heo|lợn)/i,
    ],
    keywords: ['tuổi', 'sinh năm', 'con giáp', 'tý', 'sửu', 'dần', 'mão'],
    examples: ['Em sinh năm 1995 hợp đá gì?', 'Tuổi Thìn nên đeo đá nào?'],
  },

  ELEMENT_QUERY: {
    id: 'ELEMENT_QUERY',
    name: 'Hỏi về mệnh',
    priority: 0.85,
    tier: 2,
    patterns: [
      /(mệnh|ngũ hành|bản mệnh)/i,
      /(mệnh (kim|mộc|thủy|hỏa|thổ))/i,
      /(kim|mộc|thủy|hỏa|thổ)/i,
      /(tương sinh|tương khắc|sinh khắc)/i,
    ],
    keywords: ['mệnh', 'ngũ hành', 'kim', 'mộc', 'thủy', 'hỏa', 'thổ'],
    examples: ['Em mệnh Thủy nên đeo gì?', 'Mệnh Kim hợp đá màu gì?'],
  },

  // === CRYSTAL SPECIFIC ===
  CRYSTAL_RECOMMENDATION: {
    id: 'CRYSTAL_RECOMMENDATION',
    name: 'Tư vấn đá',
    priority: 0.9,
    tier: 2,
    patterns: [
      /(tư vấn|recommend|gợi ý|suggest|nên (mua|đeo|dùng))/i,
      /(hợp (với|cho)|phù hợp)/i,
      /(đá nào|viên nào|loại nào)/i,
      /(đeo gì|mua gì|chọn gì)/i,
    ],
    keywords: ['tư vấn', 'gợi ý', 'nên mua', 'hợp với', 'phù hợp', 'đá nào'],
    examples: ['Tư vấn giúp em đá hợp với mệnh Kim', 'Nên đeo đá gì để may mắn?'],
  },

  CRYSTAL_CARE: {
    id: 'CRYSTAL_CARE',
    name: 'Chăm sóc đá',
    priority: 0.6,
    tier: 2,
    patterns: [
      /(chăm sóc|bảo quản|làm sạch|clean|care)/i,
      /(tẩy tế|nạp năng lượng|charge|cleanse)/i,
      /(đeo tay nào|đặt ở đâu|để đâu)/i,
      /(ngâm|rửa|phơi|ánh trăng|ánh nắng)/i,
    ],
    keywords: ['chăm sóc', 'bảo quản', 'tẩy tế', 'nạp năng lượng', 'đeo tay'],
    examples: ['Làm sao để tẩy tế đá?', 'Đeo tay nào đúng cách?'],
  },

  CRYSTAL_AUTHENTICITY: {
    id: 'CRYSTAL_AUTHENTICITY',
    name: 'Xác thực đá',
    priority: 0.7,
    tier: 2,
    patterns: [
      /(thật|giả|fake|authentic|real)/i,
      /(nhận biết|phân biệt|check|kiểm tra)/i,
      /(chứng nhận|certificate|giấy|chứng chỉ)/i,
    ],
    keywords: ['thật', 'giả', 'fake', 'nhận biết', 'chứng nhận'],
    examples: ['Làm sao biết đá thật hay giả?', 'Có giấy chứng nhận không?'],
  },

  // === HEALTH & WELLNESS ===
  HEALTH_QUERY: {
    id: 'HEALTH_QUERY',
    name: 'Hỏi về sức khỏe',
    priority: 0.75,
    tier: 3, // Need careful response
    patterns: [
      /(sức khỏe|health|bệnh|đau|nhức|mệt)/i,
      /(ngủ|insomnia|mất ngủ|stress|căng thẳng)/i,
      /(đau đầu|đau lưng|đau khớp|viêm)/i,
      /(chữa|trị|heal|healing|therapy)/i,
    ],
    keywords: ['sức khỏe', 'bệnh', 'đau', 'mất ngủ', 'stress', 'chữa'],
    examples: ['Đá nào giúp ngủ ngon?', 'Em bị stress nên đeo gì?'],
  },

  LOVE_QUERY: {
    id: 'LOVE_QUERY',
    name: 'Hỏi về tình yêu',
    priority: 0.8,
    tier: 2,
    patterns: [
      /(tình yêu|love|tình duyên|duyên|yêu|người yêu)/i,
      /(hôn nhân|kết hôn|vợ chồng|gia đình)/i,
      /(thu hút|attract|quyến rũ|hấp dẫn)/i,
      /(ế|độc thân|single|FA)/i,
    ],
    keywords: ['tình yêu', 'tình duyên', 'yêu', 'hôn nhân', 'thu hút', 'ế'],
    examples: ['Đá nào thu hút tình yêu?', 'Em muốn thoát ế!'],
  },

  WEALTH_QUERY: {
    id: 'WEALTH_QUERY',
    name: 'Hỏi về tài lộc',
    priority: 0.85,
    tier: 2,
    patterns: [
      /(tiền|tài lộc|tài chính|wealth|money|rich)/i,
      /(may mắn|luck|lucky|fortune)/i,
      /(làm ăn|kinh doanh|business|buôn bán)/i,
      /(thăng tiến|sự nghiệp|career)/i,
    ],
    keywords: ['tiền', 'tài lộc', 'may mắn', 'kinh doanh', 'sự nghiệp'],
    examples: ['Đá nào thu hút tài lộc?', 'Đeo gì để làm ăn phát đạt?'],
  },

  // === CUSTOMER SERVICE ===
  COMPLAINT: {
    id: 'COMPLAINT',
    name: 'Khiếu nại',
    priority: 0.95, // Very high - need immediate attention
    tier: 3,
    patterns: [
      /(phàn nàn|khiếu nại|complaint|không hài lòng)/i,
      /(lỗi|hỏng|vỡ|bể|broken|defect)/i,
      /(hoàn tiền|refund|trả lại|đổi)/i,
      /(tệ|dở|không tốt|bad|poor)/i,
    ],
    keywords: ['phàn nàn', 'khiếu nại', 'lỗi', 'hỏng', 'hoàn tiền', 'tệ'],
    examples: ['Đá em nhận bị vỡ!', 'Em muốn hoàn tiền'],
  },

  SHIPPING_QUERY: {
    id: 'SHIPPING_QUERY',
    name: 'Hỏi giao hàng',
    priority: 0.7,
    tier: 1,
    patterns: [
      /(giao hàng|ship|shipping|delivery)/i,
      /(bao lâu|mấy ngày|khi nào|when)/i,
      /(phí ship|tiền ship|free ship)/i,
      /(địa chỉ|address|đến đâu)/i,
    ],
    keywords: ['giao hàng', 'ship', 'bao lâu', 'phí ship', 'free ship'],
    examples: ['Ship bao lâu nhận?', 'Phí ship bao nhiêu?'],
  },

  PAYMENT_QUERY: {
    id: 'PAYMENT_QUERY',
    name: 'Hỏi thanh toán',
    priority: 0.7,
    tier: 1,
    patterns: [
      /(thanh toán|payment|pay|trả tiền)/i,
      /(chuyển khoản|bank|ngân hàng|ATM)/i,
      /(momo|zalopay|vnpay|COD)/i,
      /(trả góp|installment)/i,
    ],
    keywords: ['thanh toán', 'chuyển khoản', 'momo', 'COD', 'trả góp'],
    examples: ['Thanh toán bằng gì?', 'Có nhận momo không?'],
  },

  // === ENGAGEMENT ===
  LIKE_FOLLOW: {
    id: 'LIKE_FOLLOW',
    name: 'Like/Follow',
    priority: 0.5,
    tier: 1,
    patterns: [
      /(like|follow|subscribe|đăng ký)/i,
      /(share|chia sẻ|tag|@)/i,
      /(fan|người theo dõi)/i,
    ],
    keywords: ['like', 'follow', 'subscribe', 'share', 'đăng ký'],
    examples: ['Đã follow shop rồi nha', 'Like cho shop'],
  },

  COMPLIMENT: {
    id: 'COMPLIMENT',
    name: 'Khen ngợi',
    priority: 0.6,
    tier: 1,
    patterns: [
      /(đẹp quá|đẹp|xinh|beautiful|gorgeous|cute)/i,
      /(thích|love it|yêu|amazing|awesome)/i,
      /(tuyệt vời|wonderful|great|cool)/i,
      /(chất lượng|quality|good)/i,
    ],
    keywords: ['đẹp', 'xinh', 'thích', 'tuyệt vời', 'chất lượng'],
    examples: ['Đá đẹp quá!', 'Shop xinh ghê', 'Chất lượng tốt'],
  },

  // === SPECIAL REQUESTS ===
  GIFT_SENDING: {
    id: 'GIFT_SENDING',
    name: 'Gửi quà',
    priority: 0.95,
    tier: 1,
    patterns: [
      /(tặng|gift|quà|present)/i,
      /(❤️|💝|🎁|💎|💰)/,
      /(donate|ủng hộ|support)/i,
    ],
    keywords: ['tặng', 'gift', 'quà', '❤️', '💝', '🎁', 'donate'],
    examples: ['Tặng shop', '❤️❤️❤️', '🎁 Gift for you'],
  },

  CUSTOM_ORDER: {
    id: 'CUSTOM_ORDER',
    name: 'Đặt riêng',
    priority: 0.85,
    tier: 3,
    patterns: [
      /(đặt riêng|custom|customize|theo yêu cầu)/i,
      /(thiết kế|design|làm theo)/i,
      /(size riêng|kích thước riêng)/i,
    ],
    keywords: ['đặt riêng', 'custom', 'thiết kế', 'theo yêu cầu'],
    examples: ['Em muốn đặt riêng theo size tay', 'Custom được không shop?'],
  },

  // === OTHER ===
  SPAM: {
    id: 'SPAM',
    name: 'Spam',
    priority: 0.1,
    tier: 0, // Ignore
    patterns: [
      /^(haha|hihi|hehe|lol|=\)\)|:\)\)|:D)+$/i,
      /^[!@#$%^&*()]+$/,
      /^\.+$/,
      /(xxx|porn|sex|18\+)/i,
    ],
    keywords: ['haha', 'hihi', 'lol'],
    examples: ['hahaha', '....', '!!!'],
  },

  QUESTION: {
    id: 'QUESTION',
    name: 'Câu hỏi chung',
    priority: 0.5,
    tier: 2,
    patterns: [
      /\?$/,
      /^(là sao|như nào|thế nào|sao)/i,
      /(ai|gì|ở đâu|khi nào|tại sao|như thế nào)/i,
    ],
    keywords: ['?', 'là gì', 'như thế nào', 'tại sao', 'ở đâu'],
    examples: ['Cái này là sao?', 'Như thế nào vậy?'],
  },

  UNKNOWN: {
    id: 'UNKNOWN',
    name: 'Không xác định',
    priority: 0.4,
    tier: 2,
    patterns: [],
    keywords: [],
    examples: [],
  },
};

// ===========================================
// CLASSIFIER LOGIC
// ===========================================

/**
 * Classify user message into intent category
 * @param {string} message - User message
 * @returns {Object} { intent, confidence, tier, priority }
 */
export function classifyIntent(message) {
  if (!message || typeof message !== 'string') {
    return {
      intent: INTENT_CATEGORIES.UNKNOWN,
      confidence: 0,
      tier: 2,
      priority: 0.4,
    };
  }

  const normalizedMessage = message.trim().toLowerCase();
  const results = [];

  // Check each category
  for (const [key, category] of Object.entries(INTENT_CATEGORIES)) {
    if (key === 'UNKNOWN') continue;

    let score = 0;
    let matchCount = 0;

    // Pattern matching (high weight)
    for (const pattern of category.patterns) {
      if (pattern.test(normalizedMessage)) {
        score += 0.6;
        matchCount++;
        break; // One pattern match is enough
      }
    }

    // Keyword matching (medium weight)
    for (const keyword of category.keywords) {
      if (normalizedMessage.includes(keyword.toLowerCase())) {
        score += 0.2;
        matchCount++;
      }
    }

    // Cap score at 1.0
    score = Math.min(score, 1.0);

    if (score > 0) {
      results.push({
        intent: category,
        confidence: score,
        tier: category.tier,
        priority: category.priority,
        matchCount,
      });
    }
  }

  // Sort by confidence, then priority
  results.sort((a, b) => {
    if (b.confidence !== a.confidence) return b.confidence - a.confidence;
    return b.priority - a.priority;
  });

  // Return best match or UNKNOWN
  if (results.length > 0 && results[0].confidence >= 0.2) {
    return results[0];
  }

  return {
    intent: INTENT_CATEGORIES.UNKNOWN,
    confidence: 0.3,
    tier: 2,
    priority: 0.4,
  };
}

/**
 * Get multiple possible intents
 * @param {string} message
 * @param {number} limit - Max number of intents to return
 * @returns {Array} Array of { intent, confidence }
 */
export function getMultipleIntents(message, limit = 3) {
  if (!message || typeof message !== 'string') {
    return [{ intent: INTENT_CATEGORIES.UNKNOWN, confidence: 0 }];
  }

  const normalizedMessage = message.trim().toLowerCase();
  const results = [];

  for (const [key, category] of Object.entries(INTENT_CATEGORIES)) {
    if (key === 'UNKNOWN') continue;

    let score = 0;

    for (const pattern of category.patterns) {
      if (pattern.test(normalizedMessage)) {
        score += 0.6;
        break;
      }
    }

    for (const keyword of category.keywords) {
      if (normalizedMessage.includes(keyword.toLowerCase())) {
        score += 0.15;
      }
    }

    score = Math.min(score, 1.0);

    if (score > 0.2) {
      results.push({ intent: category, confidence: score });
    }
  }

  results.sort((a, b) => b.confidence - a.confidence);
  return results.slice(0, limit);
}

/**
 * Check if message is high priority (needs immediate response)
 * @param {string} message
 * @returns {boolean}
 */
export function isHighPriority(message) {
  const result = classifyIntent(message);
  return result.priority >= 0.9;
}

/**
 * Check if message is purchase intent
 * @param {string} message
 * @returns {boolean}
 */
export function isPurchaseIntent(message) {
  const result = classifyIntent(message);
  return ['BUY_INTENT', 'PRICE_QUERY'].includes(result.intent.id);
}

/**
 * Get response tier for message
 * @param {string} message
 * @returns {number} 0, 1, 2, or 3
 */
export function getResponseTier(message) {
  const result = classifyIntent(message);
  return result.tier;
}

/**
 * Quick check for specific intent
 * @param {string} message
 * @param {string} intentId
 * @returns {boolean}
 */
export function hasIntent(message, intentId) {
  const result = classifyIntent(message);
  return result.intent.id === intentId && result.confidence >= 0.3;
}

/**
 * Get intent by ID
 * @param {string} intentId
 * @returns {Object} Intent category
 */
export function getIntentById(intentId) {
  return INTENT_CATEGORIES[intentId] || INTENT_CATEGORIES.UNKNOWN;
}

/**
 * Get all intent categories
 * @returns {Object}
 */
export function getAllIntents() {
  return INTENT_CATEGORIES;
}

/**
 * Calculate priority score for queue
 * Combines intent priority with other factors
 * @param {Object} params
 * @returns {number} 0-1 priority score
 */
export function calculatePriorityScore({
  message,
  hasGift = false,
  isVIP = false,
  platform = 'gemral',
  mentionsProduct = false,
}) {
  const result = classifyIntent(message);
  let score = result.priority;

  // Boost for gifts
  if (hasGift) score += 0.3;

  // Boost for VIP users
  if (isVIP) score += 0.2;

  // Boost for external platforms
  if (['tiktok', 'facebook', 'youtube'].includes(platform)) {
    score += 0.1;
  }

  // Boost for product mentions
  if (mentionsProduct) score += 0.1;

  return Math.min(score, 1.0);
}

// ===========================================
// EXPORT
// ===========================================

export default {
  INTENT_CATEGORIES,
  classifyIntent,
  getMultipleIntents,
  isHighPriority,
  isPurchaseIntent,
  getResponseTier,
  hasIntent,
  getIntentById,
  getAllIntents,
  calculatePriorityScore,
};
