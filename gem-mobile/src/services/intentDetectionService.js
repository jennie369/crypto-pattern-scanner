// src/services/intentDetectionService.js
// ============================================================
// INTENT DETECTION SERVICE
// Classify user intent from message
// ============================================================

const SERVICE_NAME = '[IntentDetectionService]';

// ============================================================
// INTENT CATEGORIES & KEYWORDS
// ============================================================

export const INTENT_CATEGORIES = {
  LEARNING: {
    name: 'LEARNING',
    keywords: ['học', 'hiểu', 'giải thích', 'là gì', 'thế nào', 'tại sao', 'như thế nào', 'cách', 'hướng dẫn', 'dạy', 'teach', 'explain', 'what is', 'how to'],
    responseStyle: {
      tone: 'educational',
      depth: 'detailed',
      includeExamples: true,
    },
    priority: 3,
  },
  TRADING: {
    name: 'TRADING',
    keywords: ['entry', 'exit', 'trade', 'setup', 'signal', 'btc', 'eth', 'bitcoin', 'pattern', 'dpd', 'upu', 'dpu', 'upd', 'chart', 'giá', 'mua', 'bán', 'long', 'short', 'stoploss', 'tp', 'crypto', 'coin', 'market', 'trend', 'breakout', 'support', 'resistance'],
    responseStyle: {
      tone: 'disciplined',
      depth: 'technical',
      includeWarnings: true,
    },
    priority: 1,
  },
  FOMO_TRADING: {
    name: 'FOMO_TRADING',
    keywords: ['mua ngay', 'nhảy vào', 'vào ngay', 'tăng rồi', 'tăng % rồi', 'pump rồi', 'sợ lỡ', 'bỏ lỡ', 'không kịp', 'đang tăng', 'đang pump', 'tăng mạnh', 'rocket', 'moon', 'fomo', 'nhảy lệnh', 'vào lệnh ngay', 'mua gấp', 'all in', 'chờ gì nữa'],
    responseStyle: {
      tone: 'protective',
      depth: 'analytical',
      includeFOMOCheck: true,
    },
    priority: 0, // Highest priority - FOMO detection first
  },
  EMOTIONAL: {
    name: 'EMOTIONAL',
    keywords: ['buồn', 'lo', 'sợ', 'thua', 'mất', 'stress', 'lo lắng', 'chán', 'thất vọng', 'tức giận', 'bực', 'mệt', 'kiệt sức', 'áp lực', 'fomo', 'fud', 'sad', 'worry', 'fear', 'anxious', 'depressed', 'overwhelmed'],
    responseStyle: {
      tone: 'empathetic',
      depth: 'supportive',
      includeHealing: true,
    },
    priority: 2,
  },
  RELATIONSHIP: {
    name: 'RELATIONSHIP',
    keywords: ['người ấy', 'định mệnh', 'duyên', 'nửa kia', 'tình duyên', 'yêu', 'crush', 'bạn trai', 'bạn gái', 'vợ', 'chồng', 'chia tay', 'hẹn hò', 'kết hôn', 'mối quan hệ', 'soulmate', 'twin flame', 'người yêu', 'ex', 'tình cũ', 'phải lòng', 'có duyên', 'hợp tuổi'],
    responseStyle: {
      tone: 'compassionate',
      depth: 'insightful',
      includeEnergy: true,
    },
    priority: 2,
  },
  CAREER: {
    name: 'CAREER',
    keywords: ['đổi việc', 'nghỉ việc', 'sự nghiệp', 'công việc', 'career', 'job', 'lương', 'sếp', 'đồng nghiệp', 'thăng tiến', 'ở lại', 'nhảy việc', 'khởi nghiệp', 'startup', 'kinh doanh', 'mở shop', 'freelance', 'thất nghiệp', 'phỏng vấn', 'offer'],
    responseStyle: {
      tone: 'strategic',
      depth: 'practical',
      includeAction: true,
    },
    priority: 2,
  },
  SELF_DISCOVERY: {
    name: 'SELF_DISCOVERY',
    keywords: ['tiềm năng', 'ngăn cản', 'block', 'chướng ngại', 'mục đích', 'sứ mệnh', 'tại sao tôi', 'tôi là ai', 'con đường', 'định hướng', 'bế tắc', 'lạc lối', 'không biết', 'hoang mang', 'purpose', 'calling', 'passion', 'giới hạn', 'tự sabotage', 'sống đúng'],
    responseStyle: {
      tone: 'philosophical',
      depth: 'transformative',
      includeReflection: true,
    },
    priority: 2,
  },
  WEALTH: {
    name: 'WEALTH',
    keywords: ['tiền', 'tuột', 'giữ tiền', 'tiết kiệm', 'block tiền', 'nghèo', 'giàu', 'tài chính', 'thu nhập', 'nợ', 'đầu tư', 'thịnh vượng', 'abundance', 'wealthy', 'money block', 'scarcity', 'không đủ', 'chi tiêu', 'manifest tiền'],
    responseStyle: {
      tone: 'empowering',
      depth: 'root-cause',
      includeExercise: true,
    },
    priority: 2,
  },
  SPIRITUAL: {
    name: 'SPIRITUAL',
    keywords: ['thiền', 'tần số', 'năng lượng', 'crystal', 'chakra', 'tâm linh', 'vũ trụ', 'meditation', 'affirmation', 'ritual', 'chữa lành', 'healing', 'mindfulness', 'frequency', 'vibration', 'manifestation', 'yin', 'yang', 'âm dương', 'thạch anh', 'đá', 'phong thủy'],
    responseStyle: {
      tone: 'mystical',
      depth: 'philosophical',
      includeExercises: true,
    },
    priority: 4,
  },
  UPGRADE: {
    name: 'UPGRADE',
    keywords: ['nâng cấp', 'tier', 'mua', 'giá', 'gói', 'premium', 'subscription', 'đăng ký', 'thanh toán', 'unlock', 'upgrade', 'pro', 'vip', 'plan', 'pricing'],
    responseStyle: {
      tone: 'informative',
      depth: 'concise',
      includeCTA: true,
    },
    priority: 5,
  },
  GREETING: {
    name: 'GREETING',
    keywords: ['xin chào', 'hello', 'hi', 'chào', 'alo', 'hey', 'good morning', 'good evening', 'chào buổi sáng', 'chào buổi tối'],
    responseStyle: {
      tone: 'friendly',
      depth: 'brief',
      includePersonalization: true,
    },
    priority: 6,
  },
  GENERAL: {
    name: 'GENERAL',
    keywords: [],
    responseStyle: {
      tone: 'helpful',
      depth: 'moderate',
      includeFollowUp: true,
    },
    priority: 99,
  },
};

// ============================================================
// SENTIMENT KEYWORDS
// ============================================================

const SENTIMENT_KEYWORDS = {
  positive: ['vui', 'tuyệt', 'tốt', 'hay', 'thích', 'cảm ơn', 'thanks', 'great', 'awesome', 'win', 'lãi', 'thắng', 'happy', 'excited', 'amazing', 'wonderful'],
  negative: ['buồn', 'tệ', 'xấu', 'ghét', 'chán', 'fail', 'thua', 'lỗ', 'mất', 'khó', 'bad', 'terrible', 'hate', 'angry', 'upset'],
  neutral: [],
};

// ============================================================
// CORE FUNCTIONS
// ============================================================

/**
 * Normalize text for matching
 * @param {string} text
 * @returns {string}
 */
const normalizeText = (text) => {
  if (!text || typeof text !== 'string') return '';
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .trim();
};

/**
 * Count keyword matches
 * @param {string} normalizedText
 * @param {string[]} keywords
 * @returns {number}
 */
const countKeywordMatches = (normalizedText, keywords) => {
  if (!normalizedText || !keywords?.length) return 0;

  let count = 0;
  for (const keyword of keywords) {
    const normalizedKeyword = normalizeText(keyword);
    if (normalizedText.includes(normalizedKeyword)) {
      count++;
    }
  }
  return count;
};

/**
 * Detect intent from message
 * @param {string} message
 * @returns {object}
 */
export const detectIntent = (message) => {
  console.log(SERVICE_NAME, 'detectIntent started:', message?.substring(0, 50));

  if (!message || typeof message !== 'string') {
    console.warn(SERVICE_NAME, 'detectIntent: Invalid message');
    return {
      primaryIntent: INTENT_CATEGORIES.GENERAL,
      secondaryIntents: [],
      confidence: 0,
      sentiment: 'neutral',
    };
  }

  const normalizedMessage = normalizeText(message);
  const results = [];

  // Score each category
  for (const [key, category] of Object.entries(INTENT_CATEGORIES)) {
    if (key === 'GENERAL') continue;

    const matches = countKeywordMatches(normalizedMessage, category.keywords);
    if (matches > 0) {
      results.push({
        category,
        matches,
        score: matches * (1 / category.priority), // Higher priority = higher score
      });
    }
  }

  // Sort by score
  results.sort((a, b) => b.score - a.score);

  // Detect sentiment
  let sentiment = 'neutral';
  const positiveMatches = countKeywordMatches(normalizedMessage, SENTIMENT_KEYWORDS.positive);
  const negativeMatches = countKeywordMatches(normalizedMessage, SENTIMENT_KEYWORDS.negative);

  if (positiveMatches > negativeMatches) sentiment = 'positive';
  else if (negativeMatches > positiveMatches) sentiment = 'negative';
  else if (positiveMatches > 0 && negativeMatches > 0) sentiment = 'mixed';

  // Build result
  const primaryIntent = results[0]?.category || INTENT_CATEGORIES.GENERAL;
  const secondaryIntents = results.slice(1, 3).map(r => r.category);
  const confidence = results[0]
    ? Math.min(results[0].matches / 3, 1) // Max confidence at 3+ matches
    : 0;

  const result = {
    primaryIntent,
    secondaryIntents,
    confidence,
    sentiment,
    matchDetails: results.slice(0, 3),
  };

  console.log(SERVICE_NAME, 'detectIntent result:', {
    intent: primaryIntent.name,
    confidence,
    sentiment,
  });

  return result;
};

/**
 * Get response style based on intent
 * @param {object} intentResult
 * @param {string} userTier
 * @returns {object}
 */
export const getResponseStyle = (intentResult, userTier = 'FREE') => {
  console.log(SERVICE_NAME, 'getResponseStyle:', {
    intent: intentResult?.primaryIntent?.name,
    tier: userTier
  });

  const baseStyle = intentResult?.primaryIntent?.responseStyle || {
    tone: 'helpful',
    depth: 'moderate',
  };

  // Adjust based on tier
  const tierAdjustments = {
    FREE: { maxWords: 150, ctaFrequency: 'high' },
    STARTER: { maxWords: 150, ctaFrequency: 'high' },
    TIER1: { maxWords: 200, ctaFrequency: 'medium' },
    TIER2: { maxWords: 300, ctaFrequency: 'low' },
    TIER3: { maxWords: 400, ctaFrequency: 'none' },
    PRO: { maxWords: 200, ctaFrequency: 'medium' },
    PREMIUM: { maxWords: 300, ctaFrequency: 'low' },
    VIP: { maxWords: 400, ctaFrequency: 'none' },
  };

  const adjustment = tierAdjustments[userTier] || tierAdjustments.FREE;

  return {
    ...baseStyle,
    ...adjustment,
    userTier,
  };
};

/**
 * Build AI instruction based on intent
 * @param {object} intentResult
 * @param {object} responseStyle
 * @returns {string}
 */
export const buildIntentInstruction = (intentResult, responseStyle) => {
  console.log(SERVICE_NAME, 'buildIntentInstruction:', intentResult?.primaryIntent?.name);

  const intent = intentResult?.primaryIntent?.name || 'GENERAL';
  const sentiment = intentResult?.sentiment || 'neutral';

  let instruction = '';

  switch (intent) {
    case 'EMOTIONAL':
      instruction = `
**RESPONSE STYLE: EMPATHETIC & SUPPORTIVE**
- User đang có cảm xúc ${sentiment === 'negative' ? 'tiêu cực' : 'cần được lắng nghe'}
- Bắt đầu bằng việc đồng cảm với user
- Đưa ra 1 bài tập chữa lành cụ thể
- Kết thúc với affirmation tích cực
- KHÔNG giảng đạo, KHÔNG phán xét
`;
      break;

    case 'TRADING':
      instruction = `
**RESPONSE STYLE: DISCIPLINED & TECHNICAL**
- Trả lời đanh thép, kỷ luật
- Nhấn mạnh quản lý rủi ro
- Cung cấp thông tin kỹ thuật cụ thể
- LUÔN nhắc nhở: "Đây không phải lời khuyên tài chính"
`;
      break;

    case 'FOMO_TRADING':
      instruction = `
**RESPONSE STYLE: FOMO PROTECTION MODE**
⚠️ PHÁT HIỆN TÂM LÝ FOMO - User đang muốn vào lệnh vội vàng!

**BẮT BUỘC PHẢI:**
1. MỞ ĐẦU bằng: "⚠️ **Phát hiện tâm lý FOMO.**"
2. Nêu chỉ số kỹ thuật (RSI, xu hướng) nếu có
3. KHÔNG khuyến khích vào lệnh ngay
4. Đưa ra lời khuyên cụ thể: "Hãy thở sâu 3 lần rồi hỏi lại sau 15 phút."

**FORMAT PHẢN HỒI:**
⚠️ **Phát hiện tâm lý FOMO.**

[Nêu lý do tại sao không nên vào ngay - RSI quá mua, giá đã tăng quá nhanh, etc.]

**Lời khuyên của Ta:**
→ Không vào lệnh lúc này.
→ Hãy thở sâu 3 lần.
→ Quay lại sau 15 phút với tâm lý bình tĩnh.

"Thị trường sẽ vẫn ở đây. Tiền của bạn thì không."

**GIỌNG VĂN:** Nghiêm khắc nhưng bảo vệ, như một người thầy chặn học trò khỏi sai lầm.
`;
      break;

    case 'SPIRITUAL':
      instruction = `
**RESPONSE STYLE: MYSTICAL & PHILOSOPHICAL**
- Sử dụng ngôn ngữ tâm linh, huyền bí
- Kết nối với triết lý Âm Dương, Vũ trụ
- Gợi ý ritual hoặc meditation phù hợp
- Truyền cảm hứng về sự chuyển hóa năng lượng
`;
      break;

    case 'RELATIONSHIP':
      instruction = `
**RESPONSE STYLE: COMPASSIONATE & INSIGHTFUL**

**FORMAT BẮT BUỘC:**
1. BẮT ĐẦU bằng câu dẫn đồng cảm: "Ta hiểu sự trăn trở này...", "Tình yêu là hành trình..."
2. Phân tích NGẮN GỌN năng lượng mối quan hệ (2-3 câu)
3. Nếu hỏi về "định mệnh": Giải thích Twin Flame/Soulmate NGẮN GỌN
4. Đặt 1 câu hỏi reflection giúp user tự nhìn nhận
5. KẾT THÚC bằng: "Bạn muốn bói Tarot hoặc Kinh Dịch để có góc nhìn sâu hơn không?"

**LƯU Ý:**
- Tone: Đồng cảm, không phán xét
- KHÔNG dài dòng - tập trung vào insight cốt lõi
`;
      break;

    case 'CAREER':
      instruction = `
**RESPONSE STYLE: STRATEGIC & PRACTICAL**

**FORMAT BẮT BUỘC:**
1. BẮT ĐẦU bằng câu dẫn: "Quyết định này đòi hỏi sự cân nhắc kỹ lưỡng...", "Ta sẽ giúp bạn phân tích..."
2. Đưa ra framework NGẮN GỌN (3-4 tiêu chí đánh giá)
3. Đặt 1-2 câu hỏi reflection để user tự nhìn nhận
4. KẾT THÚC bằng câu hỏi mở: "Khi nghĩ về các yếu tố này, bạn nghiêng về hướng nào?"

**LƯU Ý:**
- KHÔNG liệt kê quá nhiều - tập trung vào framework rõ ràng
- Kết hợp góc nhìn năng lượng + thực tế
`;
      break;

    case 'SELF_DISCOVERY':
      instruction = `
**RESPONSE STYLE: TRANSFORMATIVE & DEEP**

**FORMAT BẮT BUỘC:**
1. BẮT ĐẦU bằng câu dẫn sâu sắc: "Đây là câu hỏi quan trọng...", "Ta cảm nhận được sự tìm kiếm trong bạn..."
2. Đào sâu vào GỐC RỄ vấn đề (2-3 câu insight về block tâm lý/năng lượng)
3. Đặt 1 CÂU HỎI REFLECTION mạnh mẽ để user tự nhìn nhận
4. CHỈ ĐƯA 1 BÀI TẬP/NGHI THỨC cụ thể (nếu phù hợp)
5. KẾT THÚC bằng: "Bạn cảm thấy điều này có đúng với mình không?"

**LƯU Ý:**
- Response phải tạo "Aha moment" cho user
- Tone: Sâu sắc, thấu hiểu, không phán xét
- KHÔNG liệt kê nhiều - tập trung vào 1 insight sâu sắc
`;
      break;

    case 'WEALTH':
      instruction = `
**RESPONSE STYLE: EMPOWERING & ROOT-CAUSE**

**FORMAT BẮT BUỘC:**
1. BẮT ĐẦU bằng câu dẫn đồng cảm: "Ta hiểu vấn đề này...", "Đây là câu hỏi sâu sắc..."
2. Phân tích NGẮN GỌN gốc rễ (2-3 câu về money block hoặc belief system)
3. CHỈ ĐƯA 1 BÀI TẬP DUY NHẤT - cụ thể nhất cho vấn đề này
4. KẾT THÚC bằng: "Bạn muốn thêm bài tập khác hoặc tìm hiểu về đá hỗ trợ tài chính không?"

**LƯU Ý:**
- KHÔNG liệt kê nhiều bài tập - CHỈ 1 BÀI TẬP
- Bài tập phải có hướng dẫn THỰC HÀNH CỤ THỂ (làm gì, khi nào, như thế nào)
- Tone: Đồng cảm nhưng đanh thép
`;
      break;

    case 'LEARNING':
      instruction = `
**RESPONSE STYLE: EDUCATIONAL**
- Giải thích từng bước, dễ hiểu
- Sử dụng ví dụ cụ thể
- Cung cấp tài liệu tham khảo nếu có
- Khuyến khích user thực hành
`;
      break;

    case 'UPGRADE':
      instruction = `
**RESPONSE STYLE: INFORMATIVE**
- Giải thích lợi ích của từng tier
- So sánh các gói rõ ràng
- Không ép buộc, tôn trọng quyết định của user
- Cung cấp link nâng cấp nếu user quan tâm
`;
      break;

    case 'GREETING':
      instruction = `
**RESPONSE STYLE: FRIENDLY & WARM**
- Chào hỏi thân thiện, ấm áp
- Sử dụng tên user nếu biết
- Hỏi user hôm nay thế nào hoặc cần giúp gì
- Giữ response ngắn gọn
`;
      break;

    default:
      instruction = `
**RESPONSE STYLE: HELPFUL**
- Trả lời ngắn gọn, đúng trọng tâm
- Hỏi clarifying question nếu cần
- Thân thiện nhưng chuyên nghiệp
`;
  }

  // Add word limit
  if (responseStyle?.maxWords) {
    instruction += `\n- Giới hạn: Tối đa ${responseStyle.maxWords} từ`;
  }

  // Add CTA instruction
  if (responseStyle?.ctaFrequency === 'high') {
    instruction += `\n- Gợi ý nâng cấp tier nếu phù hợp với câu hỏi`;
  }

  return instruction.trim();
};

/**
 * Extract topic from message
 * @param {string} message
 * @param {object} intentResult
 * @returns {object}
 */
export const extractTopic = (message, intentResult) => {
  console.log(SERVICE_NAME, 'extractTopic started');

  if (!message) {
    return { topic: 'general', category: 'general' };
  }

  const normalizedMessage = normalizeText(message);
  const intent = intentResult?.primaryIntent?.name || 'GENERAL';

  // Extract specific topics based on intent
  const topicPatterns = {
    TRADING: {
      patterns: ['dpd', 'upu', 'dpu', 'upd', 'btc', 'eth', 'bitcoin', 'ethereum', 'pattern'],
      extract: (text) => {
        const match = text.match(/(dpd|upu|dpu|upd|btc|eth|bitcoin|ethereum)/i);
        return match ? match[0].toUpperCase() : 'trading-general';
      },
    },
    FOMO_TRADING: {
      patterns: ['mua ngay', 'nhay vao', 'tang roi', 'pump', 'fomo', 'all in'],
      extract: (text) => {
        // Extract coin symbol if mentioned
        const coinMatch = text.match(/(btc|eth|sol|bnb|xrp|doge|ada)/i);
        const coin = coinMatch ? coinMatch[0].toUpperCase() : 'CRYPTO';
        return `FOMO-${coin}`;
      },
    },
    SPIRITUAL: {
      patterns: ['thien', 'meditation', 'chakra', 'crystal', 'ritual', 'thach anh', 'da'],
      extract: (text) => {
        if (text.includes('thien') || text.includes('meditation')) return 'meditation';
        if (text.includes('chakra')) return 'chakra';
        if (text.includes('crystal') || text.includes('thach anh') || text.includes('da ')) return 'crystal';
        if (text.includes('ritual')) return 'ritual';
        return 'spiritual-general';
      },
    },
    EMOTIONAL: {
      patterns: ['fomo', 'fud', 'stress', 'lo', 'so'],
      extract: (text) => {
        if (text.includes('fomo')) return 'FOMO';
        if (text.includes('fud')) return 'FUD';
        if (text.includes('stress')) return 'stress';
        return 'emotional-support';
      },
    },
    RELATIONSHIP: {
      patterns: ['dinh menh', 'duyen', 'nguoi ay', 'tinh yeu', 'soulmate'],
      extract: (text) => {
        if (text.includes('dinh menh') || text.includes('soulmate')) return 'destiny';
        if (text.includes('chia tay') || text.includes('ex')) return 'breakup';
        if (text.includes('crush') || text.includes('thich')) return 'crush';
        return 'relationship-general';
      },
    },
    CAREER: {
      patterns: ['doi viec', 'nghi viec', 'su nghiep', 'cong viec'],
      extract: (text) => {
        if (text.includes('doi viec') || text.includes('nhay viec')) return 'job-change';
        if (text.includes('nghi viec') || text.includes('that nghiep')) return 'resignation';
        if (text.includes('khoi nghiep') || text.includes('startup')) return 'startup';
        return 'career-general';
      },
    },
    SELF_DISCOVERY: {
      patterns: ['tiem nang', 'ngan can', 'block', 'muc dich', 'su menh'],
      extract: (text) => {
        if (text.includes('tiem nang') || text.includes('song dung')) return 'potential';
        if (text.includes('ngan can') || text.includes('block')) return 'blocks';
        if (text.includes('muc dich') || text.includes('su menh')) return 'purpose';
        return 'self-discovery-general';
      },
    },
    WEALTH: {
      patterns: ['tien', 'tuot', 'block tien', 'giau', 'ngheo'],
      extract: (text) => {
        if (text.includes('tuot') || text.includes('giu khong duoc')) return 'money-leak';
        if (text.includes('block tien') || text.includes('bi block')) return 'money-block';
        if (text.includes('manifest') || text.includes('thu hut')) return 'manifest-wealth';
        return 'wealth-general';
      },
    },
  };

  const topicConfig = topicPatterns[intent];
  let topic = intent.toLowerCase();

  if (topicConfig) {
    topic = topicConfig.extract(normalizedMessage);
  }

  // Map intent to category (must match DB check constraint: trading, spiritual, emotional, learning, upgrade, general)
  const categoryMap = {
    TRADING: 'trading',
    FOMO_TRADING: 'trading',
    SPIRITUAL: 'spiritual',
    EMOTIONAL: 'emotional',
    LEARNING: 'learning',
    UPGRADE: 'upgrade',
    RELATIONSHIP: 'emotional',  // Mapped to emotional (DB constraint)
    CAREER: 'general',          // Mapped to general (DB constraint)
    SELF_DISCOVERY: 'spiritual',
    WEALTH: 'general',          // Mapped to general (DB constraint)
  };

  const result = {
    topic,
    category: categoryMap[intent] || 'general',
    sentiment: intentResult?.sentiment || 'neutral',
  };

  console.log(SERVICE_NAME, 'extractTopic result:', result);
  return result;
};

// ============================================================
// EXPORTS
// ============================================================

export default {
  INTENT_CATEGORIES,
  detectIntent,
  getResponseStyle,
  buildIntentInstruction,
  extractTopic,
};
