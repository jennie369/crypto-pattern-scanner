// src/services/gemMasterService.js
// GEM Master AI Service - WITH QUESTIONNAIRE FLOW + LOCAL KNOWLEDGE BASE + RAG
// GEMRAL AI BRAIN - Updated with RAG integration

import { supabase } from './supabase';
import {
  MONEY_QUESTIONS,
  LOVE_QUESTIONS,
  HEALTH_QUESTIONS,
  CAREER_QUESTIONS,
  FAMILY_QUESTIONS,
  SCENARIOS,
  matchScenario,
  KARMA_TYPES,
  getQuestionsForKarma,
} from '../data/gemMasterKnowledge';
import gemKnowledge from '../data/gemKnowledge.json';
import ragService from './ragService';

// ========== API CONFIG ==========
const API_KEY = 'AIzaSyCymkgeL0ERDYYePtbV4zuL-BZ2mfMxehc';
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;

// RAG Configuration
const USE_RAG = true; // Enable RAG by default
const RAG_FALLBACK_TO_API = true; // Fallback to direct API if RAG fails

console.log('[GEM] API Key exists:', !!API_KEY);
console.log('[GEM] Local Knowledge loaded:', !!gemKnowledge?.faq);
console.log('[GEM] RAG enabled:', USE_RAG);

// ========== CONVERSATION STATE ==========
let conversationState = {
  mode: 'chat', // 'chat' | 'questionnaire'
  karmaType: null, // 'money' | 'love' | 'health' | 'career' | 'family'
  currentQuestionIndex: 0,
  answers: [],
  analysisComplete: false,
};

let messageCount = 0;

// ========== DETECT KARMA INTENT ==========
// IMPORTANT: Only trigger questionnaire when user explicitly asks about "nghiệp" (karma)
// Do NOT trigger for manifest requests, general questions, or simple mentions of topics
const detectKarmaIntent = (message) => {
  const m = message.toLowerCase();

  // Skip if user is asking about manifest, hướng dẫn, giới thiệu - these are NOT karma analysis
  const skipKeywords = ['manifest', 'hướng dẫn', 'giới thiệu', 'dạy', 'học', 'cách', 'làm sao', 'làm thế nào', 'khóa học', 'course'];
  if (skipKeywords.some(kw => m.includes(kw))) {
    console.log('[GEM] Skip karma detection - manifest/guide request detected');
    return null;
  }

  // Only trigger when user EXPLICITLY mentions "nghiệp" (karma)
  // Money karma - must mention "nghiệp tiền" or "nghiệp tài chính"
  if (m.includes('nghiệp tiền') || m.includes('nghiệp tài chính') || (m.includes('nghiệp') && (m.includes('tiền') || m.includes('tài')))) {
    return 'money';
  }
  // Love karma - must mention "nghiệp tình" or "nghiệp duyên"
  if (m.includes('nghiệp tình') || m.includes('nghiệp duyên') || (m.includes('nghiệp') && (m.includes('tình') || m.includes('yêu')))) {
    return 'love';
  }
  // Health karma - must mention "nghiệp sức khỏe" or "nghiệp bệnh"
  if (m.includes('nghiệp sức khỏe') || m.includes('nghiệp bệnh') || (m.includes('nghiệp') && m.includes('khỏe'))) {
    return 'health';
  }
  // Career karma - must mention "nghiệp sự nghiệp" or "nghiệp công việc"
  if (m.includes('nghiệp sự nghiệp') || m.includes('nghiệp công việc') || (m.includes('nghiệp') && (m.includes('nghiệp') || m.includes('việc')))) {
    return 'career';
  }
  // Family karma - must mention "nghiệp gia đình"
  if (m.includes('nghiệp gia đình') || (m.includes('nghiệp') && m.includes('gia đình'))) {
    return 'family';
  }
  // Frequency analysis - explicit request
  if ((m.includes('phân tích') || m.includes('đo')) && (m.includes('tần số') || m.includes('năng lượng') || m.includes('hawkins'))) {
    return 'frequency';
  }

  return null;
};

// ========== GET QUESTIONS FOR KARMA TYPE ==========
const getQuestions = (karmaType) => {
  switch (karmaType) {
    case 'money':
      return MONEY_QUESTIONS;
    case 'love':
      return LOVE_QUESTIONS;
    case 'health':
      return HEALTH_QUESTIONS;
    case 'career':
      return CAREER_QUESTIONS;
    case 'family':
      return FAMILY_QUESTIONS;
    default:
      return [];
  }
};

// ========== FORMAT QUESTION FOR USER ==========
// Returns { text, options } for interactive button rendering
const formatQuestion = (question, index, total) => {
  let text = `📋 **Câu hỏi ${index + 1}/${total}**\n\n`;
  text += `${question.question}`;

  // Return both text AND options array for interactive buttons
  // Options will be rendered as buttons in MessageBubble
  const formattedOptions = question.options.map((opt, i) => ({
    id: opt.id || String.fromCharCode(97 + i), // a, b, c, d...
    label: String.fromCharCode(65 + i), // A, B, C, D...
    text: opt.text,
    score: opt.score,
  }));

  return {
    text,
    options: formattedOptions,
    questionId: question.id,
    questionIndex: index,
    totalQuestions: total,
  };
};

// ========== PARSE USER ANSWER ==========
const parseAnswer = (message, question) => {
  const m = message.trim().toUpperCase();

  // Check if answer is a letter
  const letterMatch = m.match(/^[A-Z]$/);
  if (letterMatch) {
    const index = letterMatch[0].charCodeAt(0) - 65;
    if (index >= 0 && index < question.options.length) {
      return question.options[index];
    }
  }

  // Check if answer contains option text
  for (const opt of question.options) {
    if (message.toLowerCase().includes(opt.text.toLowerCase().slice(0, 20))) {
      return opt;
    }
  }

  return null;
};

// ========== FORMAT ANALYSIS RESULT ==========
const formatAnalysisResult = (result) => {
  const { scenario, frequency, dominantEmotions } = result;

  if (!scenario) {
    return `Tôi chưa thể phân tích chính xác. Bạn có thể chia sẻ thêm về tình huống cụ thể không?`;
  }

  let text = `🔮 **KẾT QUẢ PHÂN TÍCH**\n\n`;

  // Frequency
  text += `📊 **Tần số hiện tại:** ${frequency} Hz\n`;
  text += `${scenario.frequencyName}\n\n`;

  // Karma Type
  text += `🔴 **${scenario.title}**\n`;
  text += `${scenario.description}\n\n`;

  // Root Cause
  text += `📍 **Nguyên nhân gốc:**\n`;
  text += `${scenario.rootCause}\n\n`;

  // Healing
  text += `✨ **Bài tập chữa lành:**\n`;
  scenario.healing.forEach((step, i) => {
    text += `${i + 1}. ${step}\n`;
  });

  // Crystal
  text += `\n💎 **Đá phù hợp:** ${scenario.crystal}\n`;

  // Follow-up
  text += `\n🤔 Bạn có muốn tôi hướng dẫn chi tiết về bài tập số mấy không?`;

  return text;
};

// ========== WIDGET SUGGESTIONS ==========
export const WIDGET_SUGGESTIONS = {
  money: {
    type: 'affirmation',
    title: 'Widget Affirmation Tiền Bạc',
    icon: '💰',
    affirmations: [
      'Tiền đến với tôi dễ dàng và dồi dào',
      'Tôi là nam châm thu hút tài lộc',
      'Mọi việc tôi làm đều sinh ra tiền',
    ],
    explanation: 'Widget nhắc đọc affirmation tiền bạc mỗi ngày.',
  },
  love: {
    type: 'affirmation',
    title: 'Widget Chữa Lành Tình Yêu',
    icon: '💕',
    affirmations: [
      'Tôi yêu thương và chấp nhận bản thân',
      'Tôi xứng đáng có tình yêu đích thực',
      'Tim tôi rộng mở để yêu và được yêu',
    ],
    explanation: 'Widget giúp yêu thương bản thân mỗi ngày.',
  },
  health: {
    type: 'affirmation',
    title: 'Widget Sức Khỏe',
    icon: '🏥',
    affirmations: [
      'Cơ thể tôi là đền thờ linh thiêng',
      'Tôi lắng nghe và yêu thương cơ thể mình',
      'Mỗi ngày tôi càng khỏe mạnh hơn',
    ],
    explanation: 'Widget nhắc chăm sóc sức khỏe mỗi ngày.',
  },
  career: {
    type: 'affirmation',
    title: 'Widget Sự Nghiệp',
    icon: '💼',
    affirmations: [
      'Tôi xứng đáng với mọi thành công',
      'Tôi đang sống đúng purpose của mình',
      'Công việc mang lại niềm vui và ý nghĩa',
    ],
    explanation: 'Widget nhắc về sự nghiệp mỗi ngày.',
  },
  family: {
    type: 'affirmation',
    title: 'Widget Gia Đình',
    icon: '👨‍👩‍👧‍👦',
    affirmations: [
      'Tôi yêu gia đình VÀ yêu bản thân',
      'Tôi đặt boundaries lành mạnh với gia đình',
      'Tôi tự hào là người tôi đang trở thành',
    ],
    explanation: 'Widget về mối quan hệ gia đình.',
  },
  frequency: {
    type: 'exercise',
    title: 'Widget Nâng Tần Số',
    icon: '🔮',
    exercises: ['Thiền 5 phút mỗi sáng', 'Viết gratitude journal'],
    explanation: 'Widget nhắc nâng tần số mỗi ngày.',
  },
  karma: {
    type: 'exercise',
    title: 'Widget Chuyển Hóa Nghiệp',
    icon: '🔄',
    exercises: ['Viết 10 niềm tin tiêu cực', 'Viết thư tha thứ'],
    explanation: 'Widget nhắc làm bài tập chuyển hóa.',
  },
};

// ========== COURSE RECOMMENDATIONS ==========
export const COURSE_RECOMMENDATIONS = {
  money: {
    id: 'course_money',
    title: 'Manifest Tiền Bạc - Tư Duy Triệu Phú',
    subtitle: '30 ngày thay đổi Money Mindset',
    price: '499K',
    icon: '💰',
    benefits: ['Công thức hiện hóa tài chính', 'Phá vỡ block tiền bạc'],
    url: 'courses',
  },
  love: {
    id: 'course_love',
    title: 'Kích Hoạt Tần Số Tình Yêu',
    subtitle: '21 ngày thu hút tình yêu',
    price: '399K',
    icon: '💖',
    benefits: ['Chữa lành trauma tình cảm', 'Mở khóa Heart Chakra'],
    url: 'courses',
  },
  frequency: {
    id: 'course_frequency',
    title: 'Khóa 7 Ngày Khai Mở Tần Số Gốc',
    subtitle: 'Chuyển hóa năng lượng cốt lõi',
    price: '1.997K',
    icon: '🌟',
    benefits: ['Nâng cao tần số toàn diện', 'Kết nối với Higher Self'],
    url: 'courses',
  },
  health: {
    id: 'course_frequency',
    title: 'Khóa 7 Ngày Khai Mở Tần Số Gốc',
    subtitle: 'Chuyển hóa năng lượng cốt lõi',
    price: '1.997K',
    icon: '🌟',
    benefits: ['Nâng cao tần số toàn diện', 'Kết nối với Higher Self'],
    url: 'courses',
  },
  career: {
    id: 'course_frequency',
    title: 'Khóa 7 Ngày Khai Mở Tần Số Gốc',
    subtitle: 'Chuyển hóa năng lượng cốt lõi',
    price: '1.997K',
    icon: '🌟',
    benefits: ['Nâng cao tần số toàn diện', 'Kết nối với Higher Self'],
    url: 'courses',
  },
  family: {
    id: 'course_frequency',
    title: 'Khóa 7 Ngày Khai Mở Tần Số Gốc',
    subtitle: 'Chuyển hóa năng lượng cốt lõi',
    price: '1.997K',
    icon: '🌟',
    benefits: ['Nâng cao tần số toàn diện', 'Kết nối với Higher Self'],
    url: 'courses',
  },
  general: {
    id: 'course_frequency',
    title: 'Khóa 7 Ngày Khai Mở Tần Số Gốc',
    subtitle: 'Chuyển hóa năng lượng cốt lõi',
    price: '1.997K',
    icon: '🌟',
    benefits: ['Nâng cao tần số toàn diện', 'Kết nối với Higher Self'],
    url: 'courses',
  },
  trading: {
    id: 'course_frequency',
    title: 'Khóa 7 Ngày Khai Mở Tần Số Gốc',
    subtitle: 'Chuyển hóa năng lượng cốt lõi',
    price: '1.997K',
    icon: '🌟',
    benefits: ['Nâng cao tần số toàn diện', 'Kết nối với Higher Self'],
    url: 'courses',
  },
};

// ========== AFFILIATE PROMO ==========
export const AFFILIATE_PROMO = {
  title: 'Cơ hội Cộng tác viên Gemral',
  description: 'Kiếm thu nhập thụ động với hoa hồng lên đến 30%!',
  tiers: [
    { name: 'Affiliate', commission: '3%' },
    { name: 'CTV Bronze', commission: '10%' },
    { name: 'CTV Silver', commission: '20%' },
    { name: 'CTV Gold', commission: '30%' },
  ],
  cta: 'Đăng ký làm CTV ngay',
  url: 'https://gemral.com/affiliate',
};

// ========== TOPIC KEYWORDS ==========
const TOPIC_KEYWORDS = {
  money: ['tiền', 'nghiệp tiền', 'tài chính', 'giàu', 'nghèo', 'nợ', 'thu nhập', 'kiếm tiền', 'manifest', 'tài lộc'],
  love: ['tình yêu', 'nghiệp tình', 'người yêu', 'sai người', 'chia tay', 'cô đơn', 'hẹn hò', 'crush'],
  health: ['sức khỏe', 'stress', 'kiệt sức', 'bệnh', 'mệt mỏi', 'ngủ'],
  career: ['công việc', 'sự nghiệp', 'burnout', 'imposter', 'thành công'],
  family: ['gia đình', 'bố mẹ', 'cha mẹ', 'con cái'],
  frequency: ['tần số', 'năng lượng', 'hawkins', 'hz'],
  karma: ['nghiệp', 'karma', 'tiền kiếp'],
  crystal: ['đá', 'crystal', 'thạch anh'],
  trading: ['trading', 'crypto', 'bitcoin', 'scanner'],
  affiliate: ['kiếm thêm', 'thu nhập thụ động', 'cộng tác', 'affiliate', 'ctv', 'hoa hồng'],
};

const detectTopics = (msg) => {
  const m = msg.toLowerCase();
  const topics = [];
  for (const [topic, keywords] of Object.entries(TOPIC_KEYWORDS)) {
    if (keywords.some(kw => m.includes(kw))) topics.push(topic);
  }
  return topics.length > 0 ? topics : ['general'];
};

// ========== LOCAL KNOWLEDGE LOOKUP ==========
const MATCH_THRESHOLD = 0.5; // Minimum confidence to use local answer (lowered for better matching)

/**
 * Check if message matches any FAQ in local knowledge base
 * Returns { matched: true, faqKey, answer, confidence } or { matched: false }
 */
const matchLocalKnowledge = (message) => {
  if (!gemKnowledge?.faq) {
    console.log('[GEM] No local FAQ found');
    return { matched: false };
  }

  const m = message.toLowerCase().trim();
  let bestMatch = { matched: false, confidence: 0, matchCount: 0 };

  // Check each FAQ category
  for (const [faqKey, faqData] of Object.entries(gemKnowledge.faq)) {
    if (!faqData.keywords || !faqData.answers) continue;

    // Count how many keywords match
    let matchCount = 0;
    const matchedKeywords = [];

    for (const keyword of faqData.keywords) {
      if (m.includes(keyword.toLowerCase())) {
        matchCount++;
        matchedKeywords.push(keyword);
      }
    }

    // Calculate confidence - use minimum of 3 keywords required for good match
    // If matchCount >= 3, confidence is high
    // If matchCount >= 2 and includes primary keyword (first 5), confidence is medium
    let confidence = 0;
    if (matchCount >= 3) {
      confidence = 0.9; // High confidence
    } else if (matchCount >= 2) {
      confidence = 0.7; // Medium confidence
    } else if (matchCount === 1) {
      confidence = 0.4; // Low confidence
    }

    // Boost confidence if matched keyword is in first 5 (primary keywords)
    const primaryKeywords = faqData.keywords.slice(0, 5);
    const hasPrimaryMatch = matchedKeywords.some(kw => primaryKeywords.includes(kw));
    if (hasPrimaryMatch && matchCount >= 2) {
      confidence = Math.max(confidence, 0.8);
    }

    if (matchCount > bestMatch.matchCount || (matchCount === bestMatch.matchCount && confidence > bestMatch.confidence)) {
      bestMatch = {
        matched: true,
        faqKey,
        answer: faqData.answers[Math.floor(Math.random() * faqData.answers.length)],
        confidence: Math.min(confidence, faqData.confidence || 0.9),
        matchCount,
        matchedKeywords,
        searchTags: faqData.searchTags || [],
        quickActions: faqData.quickActions || [],
      };
    }
  }

  console.log('[GEM] Local match result:', bestMatch.matched ? `${bestMatch.faqKey} (${(bestMatch.confidence * 100).toFixed(0)}%, ${bestMatch.matchCount} keywords: ${bestMatch.matchedKeywords?.join(', ')})` : 'No match');

  // Only return if confidence meets threshold
  if (bestMatch.matched && bestMatch.confidence >= MATCH_THRESHOLD) {
    return bestMatch;
  }

  return { matched: false };
};

/**
 * Get knowledge content by key (philosophy, hawkins_scale, etc.)
 */
const getKnowledgeContent = (key) => {
  return gemKnowledge?.knowledge?.[key] || null;
};

/**
 * Knowledge topics mapping - keywords to knowledge keys
 */
const KNOWLEDGE_KEYWORDS = {
  hawkins_scale: [
    'thang hawkins', 'thang đo hawkins', 'hawkins scale', 'tần số hawkins',
    'bao nhiêu hz', 'mức hz', 'hz là gì', 'tần số là gì',
    '20hz', '100hz', '200hz', '500hz', '700hz',
    'shame', 'guilt', 'apathy', 'grief', 'fear', 'desire', 'anger', 'pride',
    'courage', 'neutrality', 'willingness', 'acceptance', 'reason', 'love', 'joy', 'peace', 'enlightenment',
    'xấu hổ', 'tội lỗi', 'thờ ơ', 'đau khổ', 'sợ hãi', 'tức giận', 'kiêu ngạo',
    'can đảm', 'chấp nhận', 'bình an', 'giác ngộ',
    'các mức tần số', 'tần số thấp', 'tần số cao', 'điểm chuyển hóa',
  ],
  mindset_errors: [
    'lỗi tâm thức', '7 lỗi', 'bảy lỗi', 'mindset error', 'tâm thức sai',
    'siết chặt dòng chảy', 'money block', 'block tiền',
    'tư duy thiếu hụt', 'scarcity mindset', 'thiếu hụt',
    'nạn nhân tâm lý', 'victim mentality', 'đổ lỗi',
    'sợ thành công', 'fear of success', 'tự sabotage',
    'tê liệt hoàn hảo', 'perfectionism', 'cầu toàn',
    'vòng lặp thiếu thốn', 'scarcity loop',
    'mất kết nối', 'disconnection', 'cô đơn tâm linh',
    'niềm tin gốc', 'niềm tin sai', 'belief system',
  ],
  healing_exercises: [
    'bài tập', 'bài tập chữa lành', 'exercise', 'healing exercise',
    'chi tiền trong hạnh phúc', 'chi tiền hạnh phúc',
    'gương soi', 'gương soi yêu thương', 'mirror work',
    'thiền higher self', 'thiền kết nối', 'kết nối higher self',
    'nhật ký biết ơn', 'gratitude journal', 'biết ơn',
    'nhật ký trách nhiệm', 'responsibility journal',
    'thực hành', 'practice', 'làm bài tập', '21 ngày',
  ],
  affirmations_library: [
    'affirmation', 'affirmations', 'khẳng định', 'câu khẳng định',
    'lời khẳng định', 'positive affirmation',
    'tiền bạc affirmation', 'tình yêu affirmation',
    'sức khỏe affirmation', 'sự nghiệp affirmation',
    'câu nói tích cực', 'lời nói tích cực',
    'tôi là nam châm', 'tiền đến với tôi',
  ],
  crystal_chakra_mapping: [
    'chakra', 'luân xa', '7 chakra', 'bảy luân xa',
    'crown chakra', 'third eye', 'throat chakra', 'heart chakra',
    'solar plexus', 'sacral chakra', 'root chakra',
    'đỉnh đầu', 'con mắt thứ 3', 'cổ họng', 'tim', 'búi mặt trời', 'bụng dưới', 'gốc',
    'đá nào cho chakra', 'chakra nào', 'luân xa nào',
    '963hz', '852hz', '741hz', '639hz', '528hz', '417hz', '396hz',
  ],
  philosophy: [
    'triết lý', 'philosophy', 'học thuyết', 'yinyang masters',
    'luật hấp dẫn', 'law of attraction', 'manifestation',
    'năng lượng rung động', 'vũ trụ', 'universe',
    'jennie uyen chu', 'founder', 'người sáng lập',
  ],
  frequency_formulas: [
    '11 công thức', 'công thức frequency', '6 công thức core',
    'dpd là gì', 'upu là gì', 'upd là gì', 'dpu là gì',
    'hfz là gì', 'lfz là gì',
    'giải thích dpd', 'giải thích upu', 'giải thích upd', 'giải thích dpu',
    'down pause down', 'up pause up', 'up pause down', 'down pause up',
    'high frequency zone', 'low frequency zone',
    'công thức độc quyền', 'nghiên cứu gem', 'gem academy',
  ],
};

/**
 * Match message to knowledge content
 * Returns { matched: true, key, content } or { matched: false }
 */
const matchKnowledge = (message) => {
  if (!gemKnowledge?.knowledge) {
    return { matched: false };
  }

  const m = message.toLowerCase().trim();
  let bestMatch = { matched: false, score: 0 };

  for (const [key, keywords] of Object.entries(KNOWLEDGE_KEYWORDS)) {
    let matchCount = 0;

    for (const keyword of keywords) {
      if (m.includes(keyword.toLowerCase())) {
        matchCount++;
      }
    }

    if (matchCount > bestMatch.score) {
      const content = getKnowledgeContent(key);
      if (content) {
        bestMatch = {
          matched: true,
          key,
          content,
          score: matchCount,
        };
      }
    }
  }

  console.log('[GEM] Knowledge match:', bestMatch.matched ? `${bestMatch.key} (score: ${bestMatch.score})` : 'No match');

  return bestMatch.score >= 1 ? bestMatch : { matched: false };
};

// ========== HELPER FUNCTIONS ==========
const getWidgetSuggestion = (scenario) => {
  if (!scenario) return null;

  return {
    type: 'affirmation',
    title: `Widget ${scenario.title}`,
    icon: KARMA_TYPES[scenario.type]?.icon || '✨',
    affirmations: scenario.healing.filter(h => h.includes('Affirmation')),
    explanation: `Widget nhắc bạn thực hành chữa lành ${scenario.frequencyName} mỗi ngày.`,
  };
};

const getCourseRecommendation = (scenario) => {
  if (!scenario?.course) return null;

  const courses = {
    course_money: COURSE_RECOMMENDATIONS.money,
    course_love: COURSE_RECOMMENDATIONS.love,
    course_frequency: COURSE_RECOMMENDATIONS.frequency,
    course_health: COURSE_RECOMMENDATIONS.health,
    course_career: COURSE_RECOMMENDATIONS.career,
    course_family: COURSE_RECOMMENDATIONS.family,
  };

  return courses[scenario.course] || null;
};

// ========== MAIN PROCESS FUNCTION ==========
export const processMessage = async (userMessage, history = []) => {
  console.log('[GEM] === START ===');
  console.log('[GEM] Message:', userMessage);
  console.log('[GEM] State:', conversationState);
  messageCount++;

  try {
    // ========== MODE: QUESTIONNAIRE ==========
    if (conversationState.mode === 'questionnaire') {
      const questions = getQuestions(conversationState.karmaType);
      const currentQ = questions[conversationState.currentQuestionIndex];

      // Parse answer
      const answer = parseAnswer(userMessage, currentQ);

      if (!answer) {
        // Return question with interactive options
        const formattedQ = formatQuestion(currentQ, conversationState.currentQuestionIndex, questions.length);
        return {
          text: `Tôi không hiểu câu trả lời. Vui lòng chọn một trong các đáp án:`,
          mode: 'questionnaire',
          // Pass options for interactive button rendering
          options: formattedQ.options,
          questionId: formattedQ.questionId,
          questionIndex: formattedQ.questionIndex,
          totalQuestions: formattedQ.totalQuestions,
          isQuestionMessage: true,
        };
      }

      // Save answer
      conversationState.answers.push(answer);
      conversationState.currentQuestionIndex++;

      // Check if more questions
      if (conversationState.currentQuestionIndex < questions.length) {
        const nextQ = questions[conversationState.currentQuestionIndex];
        const formattedQ = formatQuestion(nextQ, conversationState.currentQuestionIndex, questions.length);
        return {
          text: `Cảm ơn bạn! ✨\n\n${formattedQ.text}`,
          mode: 'questionnaire',
          // Pass options for interactive button rendering
          options: formattedQ.options,
          questionId: formattedQ.questionId,
          questionIndex: formattedQ.questionIndex,
          totalQuestions: formattedQ.totalQuestions,
          isQuestionMessage: true,
        };
      }

      // Analysis complete - Match scenario
      const result = matchScenario(conversationState.answers, conversationState.karmaType);

      // Reset state
      const karmaType = conversationState.karmaType;
      conversationState = {
        mode: 'chat',
        karmaType: null,
        currentQuestionIndex: 0,
        answers: [],
        analysisComplete: true,
      };

      return {
        text: formatAnalysisResult(result),
        scenario: result.scenario,
        frequency: result.frequency,
        topics: [karmaType],
        widgetSuggestion: getWidgetSuggestion(result.scenario) || WIDGET_SUGGESTIONS[karmaType],
        courseRecommendation: getCourseRecommendation(result.scenario) || COURSE_RECOMMENDATIONS[karmaType],
        showCrystals: true,
        crystalTags: [result.scenario?.crystal?.toLowerCase().replace(/\s+/g, '-') || 'crystal'],
      };
    }

    // ========== MODE: CHAT ==========

    const isFirst = history.length === 0;
    const topics = detectTopics(userMessage);
    console.log('[GEM] Topics:', topics, 'IsFirst:', isFirst);

    // ========== STEP 1: CHECK LOCAL KNOWLEDGE BASE FIRST ==========
    const localMatch = matchLocalKnowledge(userMessage);

    if (localMatch.matched) {
      console.log('[GEM] Using LOCAL knowledge:', localMatch.faqKey);

      // Determine additional data based on FAQ type
      const faqToTopic = {
        money_block: 'money',
        love_block: 'love',
        crystals: 'crystal',
        trading: 'trading',
        frequency_formulas: 'trading',
        courses: 'general',
        spiritual_disconnect: 'frequency',
        energy_analysis: 'frequency',
        greeting: 'general',
      };

      const mainTopic = faqToTopic[localMatch.faqKey] || topics[0] || 'general';
      const showCrystals = localMatch.answer.includes('thạch anh') ||
                          localMatch.answer.includes('đá') ||
                          localMatch.faqKey === 'crystals' ||
                          mainTopic === 'crystal';

      return {
        text: localMatch.answer,
        topics: [mainTopic, ...topics.filter(t => t !== mainTopic)],
        mode: 'chat',
        source: 'local', // Mark as local knowledge
        widgetSuggestion: WIDGET_SUGGESTIONS[mainTopic] || null,
        courseRecommendation: COURSE_RECOMMENDATIONS[mainTopic] || null,
        showCrystals,
        crystalTags: showCrystals ? (localMatch.searchTags.length > 0 ? localMatch.searchTags : ['crystal']) : [],
        quickActions: localMatch.quickActions,
      };
    }

    // ========== STEP 1.5: CHECK KNOWLEDGE BASE ==========
    // Check if user is asking about knowledge topics (hawkins_scale, mindset_errors, etc.)
    const knowledgeMatch = matchKnowledge(userMessage);

    if (knowledgeMatch.matched) {
      console.log('[GEM] Using KNOWLEDGE base:', knowledgeMatch.key);

      // Content is already formatted text in gemKnowledge.json
      // Just add a follow-up question based on the topic
      let formattedContent = knowledgeMatch.content;

      // Add follow-up question based on knowledge type
      const followUpQuestions = {
        hawkins_scale: '\n\n💡 Bạn muốn tìm hiểu về mức tần số nào cụ thể?',
        mindset_errors: '\n\n💡 Bạn cảm thấy mình đang mắc lỗi nào nhiều nhất?',
        healing_exercises: '\n\n💡 Bạn muốn tôi hướng dẫn chi tiết bài tập nào?',
        affirmations_library: '\n\n💡 Muốn tôi tạo affirmation riêng cho bạn không?',
        crystal_chakra_mapping: '\n\n💡 Bạn muốn biết đá nào phù hợp với chakra cụ thể?',
        philosophy: '\n\n💡 Bạn muốn tìm hiểu thêm về nguyên lý nào?',
        frequency_formulas: '\n\n💡 Bạn muốn tìm hiểu công thức nào cụ thể?',
      };

      formattedContent += followUpQuestions[knowledgeMatch.key] || '\n\n💡 Bạn có câu hỏi gì thêm không?';

      // Determine topic for widgets/courses
      const knowledgeToTopic = {
        hawkins_scale: 'frequency',
        mindset_errors: 'money',
        healing_exercises: 'frequency',
        affirmations_library: 'general',
        crystal_chakra_mapping: 'crystal',
        philosophy: 'general',
        frequency_formulas: 'trading',
      };

      const mainTopic = knowledgeToTopic[knowledgeMatch.key] || 'general';
      const showCrystals = knowledgeMatch.key === 'crystal_chakra_mapping' ||
                          formattedContent.includes('thạch anh') ||
                          formattedContent.includes('Chakra');

      return {
        text: formattedContent,
        topics: [mainTopic, ...topics.filter(t => t !== mainTopic)],
        mode: 'chat',
        source: 'knowledge',
        knowledgeKey: knowledgeMatch.key,
        widgetSuggestion: WIDGET_SUGGESTIONS[mainTopic] || WIDGET_SUGGESTIONS.frequency,
        courseRecommendation: COURSE_RECOMMENDATIONS[mainTopic] || COURSE_RECOMMENDATIONS.frequency,
        showCrystals,
        crystalTags: showCrystals ? ['crystal', 'chakra'] : [],
      };
    }

    // ========== STEP 2: CHECK KARMA INTENT FOR QUESTIONNAIRE ==========
    // Detect if user is asking about karma
    const karmaIntent = detectKarmaIntent(userMessage);

    if (karmaIntent && karmaIntent !== 'frequency') {
      // Start questionnaire flow
      conversationState = {
        mode: 'questionnaire',
        karmaType: karmaIntent,
        currentQuestionIndex: 0,
        answers: [],
        analysisComplete: false,
      };

      const questions = getQuestions(karmaIntent);
      const firstQ = questions[0];
      const karmaName = KARMA_TYPES[karmaIntent]?.name || 'Nghiệp';
      const formattedQ = formatQuestion(firstQ, 0, questions.length);

      return {
        text: `Tôi sẽ giúp bạn khám phá ${karmaName} của mình!\n\nĐể phân tích chính xác, tôi cần hỏi bạn ${questions.length} câu hỏi ngắn.\n\n${formattedQ.text}`,
        mode: 'questionnaire',
        // Pass options for interactive button rendering
        options: formattedQ.options,
        questionId: formattedQ.questionId,
        questionIndex: formattedQ.questionIndex,
        totalQuestions: formattedQ.totalQuestions,
        isQuestionMessage: true,
      };
    }

    // ========== STEP 3: TRY RAG-ENHANCED CHAT (EDGE FUNCTION) ==========
    console.log('[GEM] No local match, trying RAG...');

    if (USE_RAG) {
      try {
        // Convert history format for RAG service
        const conversationHistory = history.slice(-6).map(m => ({
          role: m.isUser ? 'user' : 'assistant',
          content: m.text,
        }));

        // Get current user from supabase (if available)
        const { data: { user } } = await supabase.auth.getUser();
        const userId = user?.id;

        // Call RAG-enhanced edge function
        const ragResponse = await ragService.sendRAGMessage({
          message: userMessage,
          conversationHistory,
          userId,
          userTier: 'FREE', // TODO: Get actual tier from profile
          useRAG: true,
        });

        if (!ragResponse.fallback && ragResponse.response) {
          console.log('[GEM] RAG response received, sources:', ragResponse.sources?.length || 0);

          // Determine what to show based on response
          const text = ragResponse.response;
          const showCrystals = text.includes('thạch anh') || text.includes('đá') || topics.includes('crystal');
          const showAffiliate = topics.includes('affiliate') || userMessage.toLowerCase().includes('kiếm thêm');

          return {
            text,
            topics,
            mode: 'chat',
            source: 'rag',
            ragUsed: ragResponse.ragUsed,
            ragSources: ragResponse.sources || [],
            widgetSuggestion: WIDGET_SUGGESTIONS[topics[0]] || null,
            courseRecommendation: COURSE_RECOMMENDATIONS[topics[0]] || null,
            showCrystals,
            crystalTags: showCrystals ? ['crystal'] : [],
            showAffiliate,
            affiliatePromo: showAffiliate ? AFFILIATE_PROMO : null,
          };
        }

        console.log('[GEM] RAG fallback triggered, using direct API...');
      } catch (ragError) {
        console.error('[GEM] RAG error:', ragError?.message || ragError);
        if (!RAG_FALLBACK_TO_API) {
          throw ragError;
        }
        console.log('[GEM] Falling back to direct API...');
      }
    }

    // ========== STEP 4: FALLBACK TO DIRECT GEMINI API ==========
    console.log('[GEM] Using direct Gemini API...');

    // Regular chat - Use Gemini API
    if (!API_KEY) {
      return { text: '⚠️ Thiếu API key trong .env', error: 'no-key' };
    }

    // Build prompt - Updated to NOT give frequency without asking questions
    let prompt = `Bạn là GEM Master - AI tư vấn tâm linh của Gemral.

QUY TẮC BẮT BUỘC:
1. CHỈ chào "Chào bạn! 👋" ở TIN NHẮN ĐẦU TIÊN
2. Tin nhắn tiếp theo: KHÔNG CHÀO, đi thẳng vào vấn đề
3. Nếu user hỏi về nghiệp tiền/tình yêu/sức khỏe/sự nghiệp/gia đình → ĐỀ NGHỊ LÀM BÀI TEST
4. KHÔNG đoán tần số nếu chưa có thông tin từ user
5. Tối đa 200 từ
6. LUÔN có câu hỏi follow-up

QUAN TRỌNG:
- Nếu user hỏi về "nghiệp tiền", "nghiệp tình", v.v. → Nói: "Để phân tích chính xác, tôi cần hỏi bạn vài câu hỏi ngắn. Bạn sẵn sàng chưa?"
- KHÔNG BAO GIỜ đoán tần số Hz nếu chưa có thông tin cụ thể từ user

THANG HAWKINS (chỉ dùng khi đã có thông tin):
- 20-30Hz: Xấu hổ/Tội lỗi
- 50-75Hz: Thờ ơ/Đau khổ
- 100-125Hz: Sợ hãi/Mong cầu
- 150-175Hz: Tức giận/Kiêu ngạo
- 200Hz+: Can đảm
- 500Hz+: Tình yêu vô điều kiện`;

    if (!isFirst) {
      prompt += '\n\n⚠️ KHÔNG CHÀO LẠI!';
    }

    // Add history
    if (history.length > 0) {
      prompt += '\n\nLịch sử:\n';
      history.slice(-4).forEach(m => {
        prompt += `${m.isUser ? 'User' : 'AI'}: ${m.text}\n`;
      });
    }

    prompt += `\nUser: ${userMessage}\nAI:`;

    console.log('[GEM] Calling direct API...');

    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 4096 },
      }),
    });

    console.log('[GEM] Status:', res.status);

    if (!res.ok) {
      const err = await res.text();
      console.error('[GEM] API Error:', err);
      throw new Error(`API ${res.status}`);
    }

    const data = await res.json();
    console.log('[GEM] API Response structure:', JSON.stringify(data).substring(0, 500));

    // Try multiple paths to extract text from Gemini response
    let text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    // Fallback: check if response has different structure
    if (!text && data.candidates?.[0]?.output) {
      text = data.candidates[0].output;
    }
    if (!text && data.text) {
      text = data.text;
    }
    if (!text && data.response) {
      text = data.response;
    }

    // Check for blocked content or safety issues
    if (!text && data.candidates?.[0]?.finishReason) {
      console.warn('[GEM] Finish reason:', data.candidates[0].finishReason);
      if (data.candidates[0].finishReason === 'SAFETY') {
        text = 'Xin lỗi, tôi không thể trả lời câu hỏi này. Hãy thử hỏi cách khác nhé!';
      }
    }

    if (!text) {
      console.error('[GEM] Cannot extract text from response:', JSON.stringify(data));
      throw new Error('No response text');
    }

    console.log('[GEM] SUCCESS! Length:', text.length);

    // Determine what to show
    const showCrystals = text.includes('thạch anh') || text.includes('đá') || topics.includes('crystal');
    const showAffiliate = topics.includes('affiliate') || userMessage.toLowerCase().includes('kiếm thêm');

    return {
      text,
      topics,
      mode: 'chat',
      source: 'direct_api',
      ragUsed: false,
      widgetSuggestion: WIDGET_SUGGESTIONS[topics[0]] || null,
      courseRecommendation: COURSE_RECOMMENDATIONS[topics[0]] || null,
      showCrystals,
      crystalTags: showCrystals ? ['crystal'] : [],
      showAffiliate,
      affiliatePromo: showAffiliate ? AFFILIATE_PROMO : null,
    };

  } catch (err) {
    console.error('[GEM] ERROR:', err.message);
    return { text: `Lỗi: ${err.message}. Thử lại sau.`, error: err.message };
  }
};

// ========== SAVE WIDGET ==========
export const saveWidgetToVisionBoard = async (widget, userId) => {
  console.log('[GEM] Saving widget:', JSON.stringify(widget, null, 2));
  if (!userId || !widget) return { success: false, error: 'Missing data' };

  try {
    // Handle different widget structures (from GoalSettingForm vs other sources)
    // GoalSettingForm uses: widget.data.affirmations, widget.data.goalText
    // Other sources use: widget.affirmations, widget.exercises
    const widgetData = widget.data || widget;

    // Extract content based on widget type
    let content = [];
    if (widget.type === 'goal') {
      // For goal widgets, store goal text and other data
      content = [{
        goalText: widgetData.goalText || '',
        lifeArea: widgetData.lifeArea || '',
        timeline: widgetData.timeline || '',
      }];
    } else if (widget.type === 'affirmation') {
      // For affirmation widgets, store affirmations array WITH lifeArea for grouping
      content = {
        affirmations: widgetData.affirmations || widget.affirmations || [],
        lifeArea: widgetData.lifeArea || '',
      };
    } else if (widget.type === 'action_plan') {
      // For action plan widgets, store steps array
      content = {
        steps: widgetData.steps || [],
        lifeArea: widgetData.lifeArea || '',
      };
    } else if (widget.type === 'tarot') {
      // For tarot widgets, store cards and interpretation
      content = {
        cards: widgetData.cards || [],
        spread: widgetData.spread || 'three-card',
        interpretation: widgetData.interpretation || '',
        crystals: widgetData.crystals || [],
        affirmations: widgetData.affirmations || [],
        title: widgetData.title || '',
        notes: widgetData.notes || '',
        pinToDashboard: widgetData.pinToDashboard !== false,
      };
    } else if (widget.type === 'iching') {
      // For I Ching widgets, store hexagram and interpretation
      content = {
        hexagramNumber: widgetData.hexagramNumber || widgetData.hexagram?.id,
        hexagramName: widgetData.hexagramName || widgetData.hexagram?.name,
        vietnameseName: widgetData.vietnameseName || widgetData.hexagram?.vietnamese,
        interpretation: widgetData.interpretation || '',
        area: widgetData.area || 'general',
        crystals: widgetData.crystals || [],
        affirmations: widgetData.affirmations || [],
        title: widgetData.title || '',
        notes: widgetData.notes || '',
        pinToDashboard: widgetData.pinToDashboard !== false,
      };
    } else {
      // Fallback for other types (habit, etc.)
      content = widgetData.exercises || widget.exercises || widgetData.habits || widgetData.affirmations || widget.affirmations || [];
    }

    const { data, error } = await supabase
      .from('vision_board_widgets')
      .insert({
        user_id: userId,
        type: widget.type || 'affirmation',
        title: widget.title || 'Widget',
        icon: widget.icon || '✨',
        content: JSON.stringify(content),
        explanation: widget.explanation || '',
        is_active: true,
        streak: 0,
      })
      .select()
      .single();

    if (error) throw error;
    console.log('[GEM] Saved widget:', data?.id, 'type:', data?.type);
    return { success: true, widget: data };
  } catch (err) {
    console.error('[GEM] Save error:', err);
    return { success: false, error: err.message };
  }
};

// ========== RESET STATE ==========
export const resetConversation = () => {
  conversationState = {
    mode: 'chat',
    karmaType: null,
    currentQuestionIndex: 0,
    answers: [],
    analysisComplete: false,
  };
  messageCount = 0;
};

// ========== EXPORTS ==========
export const clearHistory = resetConversation;

export default {
  processMessage,
  saveWidgetToVisionBoard,
  resetConversation,
  clearHistory,
  WIDGET_SUGGESTIONS,
  COURSE_RECOMMENDATIONS,
  AFFILIATE_PROMO,
};
