/**
 * INTENT DETECTOR
 * Smart detection của user intent để:
 * - Suggest đúng tool (Tarot, I Ching, Chatbot)
 * - Auto-fill form data
 * - Detect mood/emotion
 * - Suggest crystals based on intent
 */

// Intent types
export const INTENT_TYPES = {
  // Divination intents
  TAROT_READING: 'tarot_reading',
  ICHING_READING: 'iching_reading',
  GENERAL_DIVINATION: 'general_divination',

  // Life areas
  CAREER: 'career',
  FINANCE: 'finance',
  LOVE: 'love',
  HEALTH: 'health',
  SPIRITUAL: 'spiritual',

  // Emotional states
  ANXIOUS: 'anxious',
  STRESSED: 'stressed',
  CONFUSED: 'confused',
  HOPEFUL: 'hopeful',
  EXCITED: 'excited',
  SAD: 'sad',
  ANGRY: 'angry',

  // Actions
  SEEKING_GUIDANCE: 'seeking_guidance',
  MAKING_DECISION: 'making_decision',
  NEED_CLARITY: 'need_clarity',
  WANT_MOTIVATION: 'want_motivation',
  WANT_AFFIRMATION: 'want_affirmation',

  // Crystal related
  CRYSTAL_RECOMMENDATION: 'crystal_recommendation',
  CRYSTAL_INFO: 'crystal_info',

  // General
  CHAT: 'chat',
  QUESTION: 'question',
  GREETING: 'greeting',
};

// Vietnamese keywords mapping
const INTENT_KEYWORDS = {
  // Tarot
  [INTENT_TYPES.TAROT_READING]: [
    'tarot', 'bói bài', 'trải bài', 'xem bài', 'rút bài',
    'lá bài', 'quân bài', 'the fool', 'major arcana',
    'past present future', 'quá khứ hiện tại tương lai',
  ],

  // I Ching
  [INTENT_TYPES.ICHING_READING]: [
    'i ching', 'kinh dịch', 'dịch kinh', 'quẻ dịch', 'xem quẻ',
    'bói quẻ', 'hexagram', 'lục hào', 'bát quái', 'âm dương',
    'gieo quẻ', 'quẻ số',
  ],

  // Career
  [INTENT_TYPES.CAREER]: [
    'công việc', 'sự nghiệp', 'career', 'job', 'work',
    'thăng tiến', 'promotion', 'boss', 'sếp', 'đồng nghiệp',
    'colleague', 'thay đổi việc', 'nghỉ việc', 'tìm việc',
    'phỏng vấn', 'interview', 'dự án', 'project',
    'kinh doanh', 'business', 'startup', 'khởi nghiệp',
  ],

  // Finance
  [INTENT_TYPES.FINANCE]: [
    'tiền', 'money', 'tài chính', 'finance', 'financial',
    'đầu tư', 'investment', 'invest', 'trading', 'crypto',
    'chứng khoán', 'stock', 'lương', 'salary', 'income',
    'nợ', 'debt', 'tiết kiệm', 'saving', 'mua', 'bán',
    'lợi nhuận', 'profit', 'thua lỗ', 'loss',
  ],

  // Love
  [INTENT_TYPES.LOVE]: [
    'tình yêu', 'love', 'yêu', 'người yêu', 'boyfriend', 'girlfriend',
    'chồng', 'vợ', 'husband', 'wife', 'hẹn hò', 'date', 'dating',
    'chia tay', 'breakup', 'làm lành', 'tình cảm', 'relationship',
    'crush', 'thích', 'quan hệ', 'hôn nhân', 'marriage', 'cưới',
    'đám cưới', 'wedding', 'ex', 'người cũ', 'tán', 'flirt',
  ],

  // Health
  [INTENT_TYPES.HEALTH]: [
    'sức khỏe', 'health', 'bệnh', 'illness', 'sick', 'ốm',
    'mệt', 'tired', 'stress', 'ngủ', 'sleep', 'insomnia',
    'ăn', 'diet', 'tập', 'exercise', 'gym', 'yoga',
    'thiền', 'meditation', 'đau', 'pain', 'bác sĩ', 'doctor',
    'thuốc', 'medicine', 'năng lượng', 'energy',
  ],

  // Spiritual
  [INTENT_TYPES.SPIRITUAL]: [
    'tâm thức', 'spiritual', 'tinh thần', 'mental',
    'thiền', 'meditation', 'meditate', 'chakra', 'luân xa',
    'năng lượng', 'energy', 'aura', 'karma', 'nghiệp',
    'giác ngộ', 'enlightenment', 'vũ trụ', 'universe',
    'linh hồn', 'soul', 'spirit', 'ý nghĩa cuộc sống',
    'mục đích', 'purpose', 'intuition', 'trực giác',
  ],

  // Emotional states
  [INTENT_TYPES.ANXIOUS]: [
    'lo lắng', 'anxious', 'anxiety', 'lo', 'sợ', 'fear',
    'bất an', 'worried', 'worry', 'nervous', 'hồi hộp',
  ],

  [INTENT_TYPES.STRESSED]: [
    'stress', 'căng thẳng', 'áp lực', 'pressure', 'overwhelmed',
    'quá tải', 'burnt out', 'kiệt sức', 'exhausted',
  ],

  [INTENT_TYPES.CONFUSED]: [
    'bối rối', 'confused', 'confusion', 'không biết', 'hoang mang',
    'mất phương hướng', 'lost', 'không hiểu', 'khó hiểu',
  ],

  [INTENT_TYPES.HOPEFUL]: [
    'hy vọng', 'hope', 'hopeful', 'mong', 'kỳ vọng',
    'tin tưởng', 'optimistic', 'lạc quan',
  ],

  [INTENT_TYPES.SAD]: [
    'buồn', 'sad', 'sadness', 'depressed', 'depression',
    'chán', 'down', 'tệ', 'thất vọng', 'disappointed',
  ],

  [INTENT_TYPES.ANGRY]: [
    'tức', 'giận', 'angry', 'anger', 'frustrated', 'bực',
    'khó chịu', 'annoyed', 'irritated',
  ],

  // Actions
  [INTENT_TYPES.SEEKING_GUIDANCE]: [
    'hướng dẫn', 'guidance', 'guide', 'lời khuyên', 'advice',
    'nên làm gì', 'what should I', 'giúp tôi', 'help me',
    'chỉ dẫn', 'suggest', 'recommend', 'gợi ý',
  ],

  [INTENT_TYPES.MAKING_DECISION]: [
    'quyết định', 'decision', 'decide', 'chọn', 'choose',
    'lựa chọn', 'choice', 'nên hay không', 'có nên',
    'phân vân', 'option', 'alternative',
  ],

  [INTENT_TYPES.NEED_CLARITY]: [
    'rõ ràng', 'clarity', 'clear', 'hiểu', 'understand',
    'tại sao', 'why', 'nguyên nhân', 'reason', 'lý do',
  ],

  [INTENT_TYPES.WANT_MOTIVATION]: [
    'động lực', 'motivation', 'motivate', 'inspire', 'cảm hứng',
    'khích lệ', 'encourage', 'thúc đẩy', 'push',
  ],

  // Crystal
  [INTENT_TYPES.CRYSTAL_RECOMMENDATION]: [
    'đá nào', 'crystal', 'đá phong thủy', 'đá quý',
    'thạch anh', 'amethyst', 'recommend crystal', 'đá hợp',
    'nên mang đá', 'đá bảo hộ', 'đá may mắn',
  ],

  [INTENT_TYPES.CRYSTAL_INFO]: [
    'công dụng', 'effect', 'meaning', 'ý nghĩa đá',
    'đá này', 'loại đá', 'crystal info',
  ],

  // General
  [INTENT_TYPES.GREETING]: [
    'xin chào', 'hello', 'hi', 'hey', 'chào',
    'good morning', 'good afternoon', 'good evening',
    'chào buổi sáng', 'chào buổi tối',
  ],
};

// Crystal recommendations based on intent
const CRYSTAL_FOR_INTENT = {
  [INTENT_TYPES.ANXIOUS]: [
    { name: 'Amethyst', vietnameseName: 'Thạch Anh Tím', shopHandle: 'amethyst' },
    { name: 'Blue Lace Agate', vietnameseName: 'Mã Não Xanh', shopHandle: 'blue-lace-agate' },
    { name: 'Lepidolite', vietnameseName: 'Lepidolite', shopHandle: 'lepidolite' },
  ],
  [INTENT_TYPES.STRESSED]: [
    { name: 'Black Tourmaline', vietnameseName: 'Tourmaline Đen', shopHandle: 'black-tourmaline' },
    { name: 'Smoky Quartz', vietnameseName: 'Thạch Anh Khói', shopHandle: 'smoky-quartz' },
    { name: 'Fluorite', vietnameseName: 'Fluorite', shopHandle: 'fluorite' },
  ],
  [INTENT_TYPES.CONFUSED]: [
    { name: 'Clear Quartz', vietnameseName: 'Thạch Anh Trắng', shopHandle: 'clear-quartz' },
    { name: 'Sodalite', vietnameseName: 'Sodalite', shopHandle: 'sodalite' },
    { name: 'Lapis Lazuli', vietnameseName: 'Lapis Lazuli', shopHandle: 'lapis-lazuli' },
  ],
  [INTENT_TYPES.CAREER]: [
    { name: 'Citrine', vietnameseName: 'Citrine', shopHandle: 'citrine' },
    { name: 'Tiger Eye', vietnameseName: 'Mắt Hổ', shopHandle: 'tiger-eye' },
    { name: 'Pyrite', vietnameseName: 'Pyrite', shopHandle: 'pyrite' },
  ],
  [INTENT_TYPES.FINANCE]: [
    { name: 'Green Aventurine', vietnameseName: 'Thạch Anh Xanh', shopHandle: 'green-aventurine' },
    { name: 'Citrine', vietnameseName: 'Citrine', shopHandle: 'citrine' },
    { name: 'Jade', vietnameseName: 'Ngọc Bích', shopHandle: 'jade' },
  ],
  [INTENT_TYPES.LOVE]: [
    { name: 'Rose Quartz', vietnameseName: 'Thạch Anh Hồng', shopHandle: 'rose-quartz' },
    { name: 'Rhodonite', vietnameseName: 'Rhodonite', shopHandle: 'rhodonite' },
    { name: 'Garnet', vietnameseName: 'Garnet', shopHandle: 'garnet' },
  ],
  [INTENT_TYPES.HEALTH]: [
    { name: 'Bloodstone', vietnameseName: 'Bloodstone', shopHandle: 'bloodstone' },
    { name: 'Carnelian', vietnameseName: 'Carnelian', shopHandle: 'carnelian' },
    { name: 'Clear Quartz', vietnameseName: 'Thạch Anh Trắng', shopHandle: 'clear-quartz' },
  ],
  [INTENT_TYPES.SPIRITUAL]: [
    { name: 'Amethyst', vietnameseName: 'Thạch Anh Tím', shopHandle: 'amethyst' },
    { name: 'Selenite', vietnameseName: 'Selenite', shopHandle: 'selenite' },
    { name: 'Labradorite', vietnameseName: 'Labradorite', shopHandle: 'labradorite' },
  ],
  [INTENT_TYPES.SAD]: [
    { name: 'Sunstone', vietnameseName: 'Sunstone', shopHandle: 'sunstone' },
    { name: 'Citrine', vietnameseName: 'Citrine', shopHandle: 'citrine' },
    { name: 'Orange Calcite', vietnameseName: 'Calcite Cam', shopHandle: 'orange-calcite' },
  ],
};

// Suggested tool based on intent
const TOOL_FOR_INTENT = {
  [INTENT_TYPES.TAROT_READING]: 'tarot',
  [INTENT_TYPES.ICHING_READING]: 'iching',
  [INTENT_TYPES.GENERAL_DIVINATION]: 'both', // Let user choose
  [INTENT_TYPES.MAKING_DECISION]: 'iching',
  [INTENT_TYPES.SEEKING_GUIDANCE]: 'tarot',
  [INTENT_TYPES.NEED_CLARITY]: 'iching',
  [INTENT_TYPES.WANT_MOTIVATION]: 'tarot',
};

/**
 * Detect primary intent from text
 * @param {string} text - User input text
 * @returns {Object} - Detected intent object
 */
export const detectIntent = (text) => {
  if (!text) return { type: INTENT_TYPES.CHAT, confidence: 0, intents: [] };

  const lowerText = text.toLowerCase();
  const detectedIntents = [];

  // Check each intent type
  for (const [intentType, keywords] of Object.entries(INTENT_KEYWORDS)) {
    const matchedKeywords = keywords.filter(keyword =>
      lowerText.includes(keyword.toLowerCase())
    );

    if (matchedKeywords.length > 0) {
      detectedIntents.push({
        type: intentType,
        confidence: Math.min(matchedKeywords.length / keywords.length, 1),
        matchedKeywords,
      });
    }
  }

  // Sort by confidence
  detectedIntents.sort((a, b) => b.confidence - a.confidence);

  // Get primary intent
  const primaryIntent = detectedIntents[0] || { type: INTENT_TYPES.CHAT, confidence: 0 };

  return {
    ...primaryIntent,
    intents: detectedIntents,
    allIntents: detectedIntents.map(i => i.type),
  };
};

/**
 * Detect emotion/mood from text
 * @param {string} text - User input
 * @returns {Object} - Detected emotion
 */
export const detectEmotion = (text) => {
  const emotionTypes = [
    INTENT_TYPES.ANXIOUS,
    INTENT_TYPES.STRESSED,
    INTENT_TYPES.CONFUSED,
    INTENT_TYPES.HOPEFUL,
    INTENT_TYPES.EXCITED,
    INTENT_TYPES.SAD,
    INTENT_TYPES.ANGRY,
  ];

  const intent = detectIntent(text);
  const emotionIntents = intent.intents.filter(i =>
    emotionTypes.includes(i.type)
  );

  if (emotionIntents.length > 0) {
    return {
      emotion: emotionIntents[0].type,
      confidence: emotionIntents[0].confidence,
      supportingCrystals: CRYSTAL_FOR_INTENT[emotionIntents[0].type] || [],
    };
  }

  return {
    emotion: null,
    confidence: 0,
    supportingCrystals: [],
  };
};

/**
 * Detect life area focus from text
 * @param {string} text - User input
 * @returns {Object} - Detected life area
 */
export const detectLifeArea = (text) => {
  const areaTypes = [
    INTENT_TYPES.CAREER,
    INTENT_TYPES.FINANCE,
    INTENT_TYPES.LOVE,
    INTENT_TYPES.HEALTH,
    INTENT_TYPES.SPIRITUAL,
  ];

  const intent = detectIntent(text);
  const areaIntents = intent.intents.filter(i =>
    areaTypes.includes(i.type)
  );

  if (areaIntents.length > 0) {
    const area = areaIntents[0].type;
    return {
      area: area,
      confidence: areaIntents[0].confidence,
      supportingCrystals: CRYSTAL_FOR_INTENT[area] || [],
    };
  }

  return {
    area: null,
    confidence: 0,
    supportingCrystals: [],
  };
};

/**
 * Get suggested tool based on intent
 * @param {string} text - User input
 * @returns {Object} - Tool suggestion
 */
export const getSuggestedTool = (text) => {
  const intent = detectIntent(text);

  // Check for explicit tool request
  if (intent.allIntents.includes(INTENT_TYPES.TAROT_READING)) {
    return { tool: 'tarot', reason: 'Bạn muốn xem bài Tarot' };
  }

  if (intent.allIntents.includes(INTENT_TYPES.ICHING_READING)) {
    return { tool: 'iching', reason: 'Bạn muốn xem quẻ Kinh Dịch' };
  }

  // Check for action-based suggestion
  for (const [intentType, tool] of Object.entries(TOOL_FOR_INTENT)) {
    if (intent.allIntents.includes(intentType)) {
      return {
        tool: tool,
        reason: getToolReason(intentType),
      };
    }
  }

  // Default to chatbot
  return { tool: 'chatbot', reason: 'Hãy chat với GEM để được hướng dẫn' };
};

const getToolReason = (intentType) => {
  const reasons = {
    [INTENT_TYPES.MAKING_DECISION]: 'Kinh Dịch phù hợp cho việc ra quyết định',
    [INTENT_TYPES.SEEKING_GUIDANCE]: 'Tarot sẽ cho bạn hướng dẫn cụ thể',
    [INTENT_TYPES.NEED_CLARITY]: 'Kinh Dịch giúp làm rõ tình huống',
    [INTENT_TYPES.WANT_MOTIVATION]: 'Tarot sẽ mang đến cảm hứng cho bạn',
  };
  return reasons[intentType] || '';
};

/**
 * Get crystal recommendations based on user intent
 * @param {string} text - User input
 * @returns {Array} - Recommended crystals
 */
export const getCrystalRecommendations = (text) => {
  const intent = detectIntent(text);
  const emotion = detectEmotion(text);
  const area = detectLifeArea(text);

  const recommendations = new Set();

  // Add crystals based on emotion
  if (emotion.emotion && CRYSTAL_FOR_INTENT[emotion.emotion]) {
    CRYSTAL_FOR_INTENT[emotion.emotion].forEach(c => recommendations.add(JSON.stringify(c)));
  }

  // Add crystals based on area
  if (area.area && CRYSTAL_FOR_INTENT[area.area]) {
    CRYSTAL_FOR_INTENT[area.area].forEach(c => recommendations.add(JSON.stringify(c)));
  }

  // Convert back to objects
  return Array.from(recommendations).map(c => JSON.parse(c));
};

/**
 * Auto-fill form data based on detected intent
 * @param {string} text - User input
 * @returns {Object} - Form data to auto-fill
 */
export const getAutoFillData = (text) => {
  const intent = detectIntent(text);
  const emotion = detectEmotion(text);
  const area = detectLifeArea(text);
  const tool = getSuggestedTool(text);

  return {
    suggestedTool: tool.tool,
    toolReason: tool.reason,
    selectedArea: area.area || 'career',
    detectedEmotion: emotion.emotion,
    question: text,
    crystals: getCrystalRecommendations(text),
    confidence: {
      intent: intent.confidence,
      emotion: emotion.confidence,
      area: area.confidence,
    },
  };
};

/**
 * Check if text is asking for divination
 * @param {string} text - User input
 * @returns {boolean}
 */
export const isDivinationRequest = (text) => {
  const intent = detectIntent(text);
  const divinationTypes = [
    INTENT_TYPES.TAROT_READING,
    INTENT_TYPES.ICHING_READING,
    INTENT_TYPES.GENERAL_DIVINATION,
    INTENT_TYPES.SEEKING_GUIDANCE,
    INTENT_TYPES.MAKING_DECISION,
    INTENT_TYPES.NEED_CLARITY,
  ];

  return intent.allIntents.some(i => divinationTypes.includes(i));
};

/**
 * Check if text is a greeting
 * @param {string} text - User input
 * @returns {boolean}
 */
export const isGreeting = (text) => {
  const intent = detectIntent(text);
  return intent.type === INTENT_TYPES.GREETING || intent.allIntents.includes(INTENT_TYPES.GREETING);
};

/**
 * Get response context based on intent
 * @param {string} text - User input
 * @returns {Object} - Context for generating response
 */
export const getResponseContext = (text) => {
  const intent = detectIntent(text);
  const emotion = detectEmotion(text);
  const area = detectLifeArea(text);

  return {
    primaryIntent: intent.type,
    allIntents: intent.allIntents,
    emotion: emotion.emotion,
    lifeArea: area.area,
    shouldSuggestTarot: intent.allIntents.includes(INTENT_TYPES.SEEKING_GUIDANCE),
    shouldSuggestIChing: intent.allIntents.includes(INTENT_TYPES.MAKING_DECISION),
    shouldSuggestCrystal: emotion.emotion !== null,
    tone: determineTone(emotion.emotion),
  };
};

const determineTone = (emotion) => {
  const tones = {
    [INTENT_TYPES.ANXIOUS]: 'calming',
    [INTENT_TYPES.STRESSED]: 'supportive',
    [INTENT_TYPES.CONFUSED]: 'clarifying',
    [INTENT_TYPES.HOPEFUL]: 'encouraging',
    [INTENT_TYPES.SAD]: 'compassionate',
    [INTENT_TYPES.ANGRY]: 'understanding',
  };
  return tones[emotion] || 'friendly';
};

export default {
  INTENT_TYPES,
  detectIntent,
  detectEmotion,
  detectLifeArea,
  getSuggestedTool,
  getCrystalRecommendations,
  getAutoFillData,
  isDivinationRequest,
  isGreeting,
  getResponseContext,
};
