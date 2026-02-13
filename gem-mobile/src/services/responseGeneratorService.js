/**
 * Response Generator Service - 3-Tier System
 *
 * Tier 1: Template Responses (< 50ms)
 *   - Pre-defined templates for common intents
 *   - No API calls, instant response
 *
 * Tier 2: LLM Quick (< 500ms)
 *   - Short, focused prompts
 *   - Gemini Flash for speed
 *
 * Tier 3: LLM Full (< 2000ms)
 *   - Complex queries, personalization
 *   - Full context, detailed response
 *
 * AI Personas: SuPhu, CoGiao, BanThan
 */

import { CRYSTAL_KNOWLEDGE, CRYSTAL_SELLING_POINTS, getCrystal, getSellingPoints } from '../data/crystalKnowledge';
import { NGU_HANH, calculateMenh, getMenhTemplate, getCrystalsForMenh } from '../data/nguHanhSystem';
import { ZODIACS, getZodiacByYear, getZodiacTemplate, getCrystalsForZodiac } from '../data/zodiacData';
import { getResponseStyle, getResponseEnding, getResponseEmoji } from './emotionDetectorService';

// ===========================================
// AI PERSONAS
// ===========================================

export const AI_PERSONAS = {
  sufu: {
    id: 'sufu',
    name: 'Sư Phụ',
    nameShort: 'Sư Phụ',
    description: 'Người thầy tâm thức, trí tuệ và sâu sắc',
    avatar: 'sufu',
    voice: 'banmai', // FPT.AI voice
    style: {
      tone: 'wise',
      greeting: 'Chào con',
      pronoun: { self: 'thầy', user: 'con' },
      ending: ['con nhé', 'con ạ', 'nha con'],
      emojis: ['🙏', '✨', '💎', '☯️'],
      traits: ['Sâu sắc', 'Từ bi', 'Hướng dẫn nhẹ nhàng'],
    },
    expertise: ['ngũ hành', 'phong thủy', 'tâm thức', 'triết lý'],
  },

  cogiao: {
    id: 'cogiao',
    name: 'Cô Giáo Linh',
    nameShort: 'Cô',
    description: 'Chuyên gia đá quý, am hiểu khoa học và năng lượng',
    avatar: 'cogiao',
    voice: 'linhsan', // FPT.AI voice
    style: {
      tone: 'educational',
      greeting: 'Chào bạn',
      pronoun: { self: 'cô', user: 'bạn' },
      ending: ['nhé bạn', 'bạn nhé', 'nha'],
      emojis: ['💎', '✨', '📚', '🔬'],
      traits: ['Chuyên nghiệp', 'Chi tiết', 'Khoa học'],
    },
    expertise: ['đá quý', 'chất liệu', 'năng lượng', 'chăm sóc đá'],
  },

  banthan: {
    id: 'banthan',
    name: 'Bạn Thân',
    nameShort: 'Mình',
    description: 'Bạn thân vui vẻ, gần gũi và thấu hiểu',
    avatar: 'banthan',
    voice: 'myan', // FPT.AI voice - friendly
    style: {
      tone: 'friendly',
      greeting: 'Hey bạn',
      pronoun: { self: 'mình', user: 'bạn' },
      ending: ['nha', 'nhé', 'ha', 'đó'],
      emojis: ['😊', '💕', '✨', '🥰'],
      traits: ['Vui vẻ', 'Gần gũi', 'Đồng cảm'],
    },
    expertise: ['tình yêu', 'cảm xúc', 'cuộc sống', 'may mắn'],
  },
};

// ===========================================
// TIER 1: TEMPLATE RESPONSES (< 50ms)
// ===========================================

const RESPONSE_TEMPLATES = {
  GREETING: {
    templates: [
      'Xin chào! {persona_greeting} Hôm nay {pronoun.self} có thể giúp gì cho {pronoun.user}?',
      '{persona_greeting}! Rất vui được gặp {pronoun.user}! {emoji}',
      'Hello! Chào mừng {pronoun.user} đến với Gemral! {emoji}',
    ],
    followUp: 'Bạn đang quan tâm đến đá phong thủy hay muốn tư vấn theo mệnh/tuổi?',
  },

  GOODBYE: {
    templates: [
      'Tạm biệt {pronoun.user}! Chúc {pronoun.user} một ngày tốt lành! {emoji}',
      'Bye {pronoun.user}! Hẹn gặp lại {ending}! {emoji}',
      'Chào {pronoun.user}! Cảm ơn đã ghé thăm Gemral! {emoji}',
    ],
  },

  THANKS: {
    templates: [
      'Không có gì {ending}! {persona_short} rất vui được giúp {pronoun.user}! {emoji}',
      'Dạ, cảm ơn {pronoun.user} nhiều {ending}! {emoji}',
      '{pronoun.user} quá khen! Chúc {pronoun.user} may mắn với viên đá mới! {emoji}',
    ],
  },

  LIKE_FOLLOW: {
    templates: [
      'Cảm ơn {pronoun.user} đã ủng hộ Gemral! {emoji} Yêu {pronoun.user} nhiều!',
      'Wow thank you! {emoji} {pronoun.self} rất trân trọng {pronoun.user}!',
    ],
  },

  COMPLIMENT: {
    templates: [
      'Cảm ơn {pronoun.user}! {emoji} Đá đẹp là dành cho người đẹp {ending}!',
      'Aww {pronoun.user} dễ thương quá! {emoji} Cảm ơn {pronoun.user} nhiều!',
    ],
  },

  GIFT_SENDING: {
    templates: [
      'OMG! Cảm ơn {pronoun.user}! {emoji} {pronoun.self} yêu {pronoun.user} quá!',
      'Wow wow wow! Thank you {pronoun.user}! {emoji}{emoji}{emoji}',
      'Trời ơi! Cảm ơn {pronoun.user} nhiều lắm! {emoji} Yêu thương {pronoun.user}!',
    ],
  },

  SHIPPING_QUERY: {
    templates: [
      'Dạ, Gemral ship toàn quốc ạ! Nội thành 1-2 ngày, tỉnh xa 3-5 ngày {ending}. {emoji}',
      'Free ship đơn từ 500k {ending}! Phí ship thường 25-35k tùy khu vực. {emoji}',
    ],
  },

  PAYMENT_QUERY: {
    templates: [
      'Gemral nhận thanh toán: Chuyển khoản, MoMo, ZaloPay, COD {ending}! {emoji}',
      'Dạ {pronoun.user} có thể thanh toán qua bank, ví điện tử hoặc COD đều được {ending}! {emoji}',
    ],
  },

  SPAM: {
    templates: [], // No response for spam
  },
};

/**
 * Generate Tier 1 template response
 * @param {string} intentId
 * @param {Object} options
 * @returns {Object|null} { text, tier, latency }
 */
export function generateTier1Response(intentId, options = {}) {
  const startTime = Date.now();
  const { persona = 'banthan', emotionId = 'NEUTRAL', userName = '' } = options;

  const templateSet = RESPONSE_TEMPLATES[intentId];
  if (!templateSet || !templateSet.templates.length) {
    return null;
  }

  const personaConfig = AI_PERSONAS[persona] || AI_PERSONAS.banthan;
  const template = templateSet.templates[Math.floor(Math.random() * templateSet.templates.length)];

  // Replace placeholders
  let text = template
    .replace(/{persona_greeting}/g, personaConfig.style.greeting)
    .replace(/{persona_short}/g, personaConfig.nameShort)
    .replace(/{pronoun\.self}/g, personaConfig.style.pronoun.self)
    .replace(/{pronoun\.user}/g, userName || personaConfig.style.pronoun.user)
    .replace(/{ending}/g, personaConfig.style.ending[Math.floor(Math.random() * personaConfig.style.ending.length)])
    .replace(/{emoji}/g, personaConfig.style.emojis[Math.floor(Math.random() * personaConfig.style.emojis.length)]);

  // Add emotion-based adjustments
  if (emotionId && emotionId !== 'NEUTRAL') {
    text += ' ' + getResponseEmoji(emotionId);
  }

  return {
    text,
    tier: 1,
    latency: Date.now() - startTime,
    persona: persona,
    followUp: templateSet.followUp || null,
  };
}

// ===========================================
// TIER 2: LLM QUICK RESPONSES (< 500ms)
// ===========================================

/**
 * Generate Tier 2 quick LLM response
 * @param {Object} params
 * @returns {Promise<Object>} { text, tier, latency }
 */
export async function generateTier2Response({
  message,
  intentId,
  emotionId,
  persona = 'banthan',
  context = {},
}) {
  const startTime = Date.now();
  const personaConfig = AI_PERSONAS[persona] || AI_PERSONAS.banthan;

  // Build focused prompt
  const prompt = buildTier2Prompt({
    message,
    intentId,
    emotionId,
    personaConfig,
    context,
  });

  try {
    // Use Gemini Flash for speed
    const response = await callGeminiQuick(prompt);

    return {
      text: response,
      tier: 2,
      latency: Date.now() - startTime,
      persona,
    };
  } catch (error) {
    console.error('[ResponseGenerator] Tier 2 error:', error);
    // Fallback to Tier 1 if available
    const tier1 = generateTier1Response(intentId, { persona, emotionId });
    if (tier1) return tier1;

    return {
      text: 'Xin lỗi, có lỗi xảy ra. Vui lòng thử lại nhé!',
      tier: 2,
      latency: Date.now() - startTime,
      error: true,
    };
  }
}

function buildTier2Prompt({ message, intentId, emotionId, personaConfig, context }) {
  const { menh, zodiac, userName } = context;

  let systemPrompt = `Bạn là ${personaConfig.name}, ${personaConfig.description}.
Phong cách: ${personaConfig.style.traits.join(', ')}.
Xưng hô: ${personaConfig.style.pronoun.self} - ${personaConfig.style.pronoun.user}.
Trả lời NGẮN GỌN (1-2 câu), thân thiện, có emoji.`;

  // Add context
  if (menh) {
    systemPrompt += `\nNgười dùng mệnh ${menh.name}.`;
  }
  if (zodiac) {
    systemPrompt += `\nNgười dùng tuổi ${zodiac.animal}.`;
  }

  // Intent-specific instructions
  switch (intentId) {
    case 'BUY_INTENT':
      systemPrompt += '\nHướng dẫn mua hàng, hỏi size/màu, chốt đơn.';
      break;
    case 'PRICE_QUERY':
      systemPrompt += '\nTrả lời giá, nhắc khuyến mãi nếu có.';
      break;
    case 'ZODIAC_QUERY':
    case 'ELEMENT_QUERY':
      systemPrompt += '\nTư vấn đá phù hợp với mệnh/tuổi.';
      break;
    case 'CRYSTAL_RECOMMENDATION':
      systemPrompt += '\nGợi ý đá phù hợp với nhu cầu.';
      break;
  }

  // Emotion adjustments
  if (emotionId === 'SAD' || emotionId === 'FRUSTRATED') {
    systemPrompt += '\nNgười dùng có vẻ buồn/bực - hãy đồng cảm và an ủi.';
  } else if (emotionId === 'EXCITED') {
    systemPrompt += '\nNgười dùng đang hào hứng - hãy nhiệt tình theo!';
  }

  return {
    system: systemPrompt,
    user: message,
  };
}

// ===========================================
// TIER 3: LLM FULL RESPONSES (< 2000ms)
// ===========================================

/**
 * Generate Tier 3 full LLM response
 * @param {Object} params
 * @returns {Promise<Object>} { text, tier, latency, sellingPoints }
 */
export async function generateTier3Response({
  message,
  intentId,
  emotionId,
  persona = 'banthan',
  context = {},
  includeSellingPoints = false,
}) {
  const startTime = Date.now();
  const personaConfig = AI_PERSONAS[persona] || AI_PERSONAS.banthan;

  // Build comprehensive prompt
  const prompt = buildTier3Prompt({
    message,
    intentId,
    emotionId,
    personaConfig,
    context,
    includeSellingPoints,
  });

  try {
    // Use Gemini Pro for quality
    const response = await callGeminiFull(prompt);

    const result = {
      text: response.text,
      tier: 3,
      latency: Date.now() - startTime,
      persona,
    };

    // Add selling points for purchase intents
    if (includeSellingPoints && context.crystalId) {
      result.sellingPoints = getSellingPoints(context.crystalId);
    }

    return result;
  } catch (error) {
    console.error('[ResponseGenerator] Tier 3 error:', error);
    // Try Tier 2 fallback
    return generateTier2Response({ message, intentId, emotionId, persona, context });
  }
}

function buildTier3Prompt({
  message,
  intentId,
  emotionId,
  personaConfig,
  context,
  includeSellingPoints,
}) {
  const { menh, zodiac, userName, crystalId, history = [] } = context;

  let systemPrompt = `# VAI TRÒ
Bạn là ${personaConfig.name}, ${personaConfig.description}.
Bạn là chuyên gia về: ${personaConfig.expertise.join(', ')}.

# PHONG CÁCH
- Giọng điệu: ${personaConfig.style.tone}
- Đặc điểm: ${personaConfig.style.traits.join(', ')}
- Xưng hô: "${personaConfig.style.pronoun.self}" và gọi khách hàng là "${personaConfig.style.pronoun.user}"
- Emoji yêu thích: ${personaConfig.style.emojis.join(' ')}

# CONTEXT`;

  // Add user context
  if (menh) {
    systemPrompt += `\n- Mệnh: ${menh.name} (${menh.nameEn})`;
    systemPrompt += `\n- Đá phù hợp: ${menh.crystals.main.join(', ')}`;
    systemPrompt += `\n- Màu may mắn: ${menh.colors.join(', ')}`;
  }

  if (zodiac) {
    systemPrompt += `\n- Tuổi: ${zodiac.animal} (${zodiac.animalEn})`;
    systemPrompt += `\n- Đá phù hợp: ${zodiac.crystals.main.join(', ')}`;
  }

  if (crystalId) {
    const crystal = getCrystal(crystalId);
    if (crystal) {
      systemPrompt += `\n- Đá đang xem: ${crystal.name} (${crystal.nameEn})`;
      systemPrompt += `\n- Tác dụng: ${crystal.benefits.slice(0, 3).join(', ')}`;
    }
  }

  // Add selling points for commerce
  if (includeSellingPoints && crystalId) {
    const selling = getSellingPoints(crystalId);
    if (selling) {
      systemPrompt += `\n\n# SELLING POINTS
- Quick pitch: ${selling.quick_pitch}
- Điểm bán: ${selling.selling_points.slice(0, 3).join('; ')}`;
    }
  }

  // Intent-specific instructions
  systemPrompt += '\n\n# NHIỆM VỤ';
  switch (intentId) {
    case 'BUY_INTENT':
      systemPrompt += `
- Xác nhận sản phẩm khách muốn mua
- Hỏi size/màu nếu cần
- Hướng dẫn cách đặt hàng
- Tạo cảm giác urgency (hàng hot, còn ít)`;
      break;

    case 'CRYSTAL_RECOMMENDATION':
      systemPrompt += `
- Phân tích nhu cầu của khách
- Gợi ý 2-3 loại đá phù hợp
- Giải thích tại sao phù hợp
- Đề cập giá và khuyến mãi`;
      break;

    case 'HEALTH_QUERY':
      systemPrompt += `
- DISCLAIMER: Đá hỗ trợ tinh thần, không thay thế y tế
- Gợi ý đá phù hợp với vấn đề
- Đề cập cách sử dụng`;
      break;

    case 'COMPLAINT':
      systemPrompt += `
- Xin lỗi chân thành
- Hỏi chi tiết vấn đề
- Đề xuất giải pháp (đổi/trả/hoàn tiền)
- Cam kết xử lý nhanh`;
      break;

    default:
      systemPrompt += `
- Trả lời câu hỏi một cách hữu ích
- Gợi ý sản phẩm phù hợp nếu có thể
- Giữ conversation flow tự nhiên`;
  }

  // Emotion handling
  if (emotionId === 'ANGRY' || emotionId === 'FRUSTRATED') {
    systemPrompt += '\n\n# LƯU Ý: Khách hàng có vẻ không vui. Hãy bình tĩnh, đồng cảm và giải quyết vấn đề.';
  }

  // Conversation history
  let conversationContext = '';
  if (history.length > 0) {
    conversationContext = '\n\n# LỊCH SỬ HỘI THOẠI\n';
    history.slice(-3).forEach(msg => {
      conversationContext += `${msg.role}: ${msg.content}\n`;
    });
  }

  return {
    system: systemPrompt + conversationContext,
    user: message,
  };
}

// ===========================================
// GEMINI API HELPERS (Simplified)
// ===========================================

/**
 * Call Gemini Flash for quick responses
 * This should connect to existing geminiService
 */
async function callGeminiQuick(prompt) {
  // Import dynamically to avoid circular dependencies
  const { geminiService } = await import('./geminiService');

  const response = await geminiService.generateContent({
    prompt: `${prompt.system}\n\nUser: ${prompt.user}`,
    maxTokens: 150,
    temperature: 0.7,
  });

  return response.text || response;
}

/**
 * Call Gemini Pro for full responses
 */
async function callGeminiFull(prompt) {
  const { geminiService } = await import('./geminiService');

  const response = await geminiService.generateContent({
    prompt: `${prompt.system}\n\nUser: ${prompt.user}`,
    maxTokens: 500,
    temperature: 0.8,
  });

  return { text: response.text || response };
}

// ===========================================
// MAIN GENERATOR FUNCTION
// ===========================================

/**
 * Generate response based on tier
 * Auto-selects tier based on intent and complexity
 *
 * @param {Object} params
 * @returns {Promise<Object>} Response object
 */
export async function generateResponse({
  message,
  intentId,
  emotionId = 'NEUTRAL',
  tier = null, // Auto-select if null
  persona = 'banthan',
  context = {},
}) {
  // Auto-select tier based on intent
  const selectedTier = tier || selectTier(intentId, message);

  switch (selectedTier) {
    case 1:
      const tier1 = generateTier1Response(intentId, {
        persona,
        emotionId,
        userName: context.userName,
      });
      if (tier1) return tier1;
      // Fallthrough to Tier 2 if no template
      return generateTier2Response({ message, intentId, emotionId, persona, context });

    case 2:
      return generateTier2Response({ message, intentId, emotionId, persona, context });

    case 3:
      return generateTier3Response({
        message,
        intentId,
        emotionId,
        persona,
        context,
        includeSellingPoints: ['BUY_INTENT', 'PRICE_QUERY', 'CRYSTAL_RECOMMENDATION'].includes(intentId),
      });

    default:
      return generateTier2Response({ message, intentId, emotionId, persona, context });
  }
}

/**
 * Auto-select response tier
 */
function selectTier(intentId, message) {
  // Tier 1: Simple, template-able intents
  const tier1Intents = ['GREETING', 'GOODBYE', 'THANKS', 'LIKE_FOLLOW', 'COMPLIMENT', 'GIFT_SENDING', 'SHIPPING_QUERY', 'PAYMENT_QUERY', 'SPAM'];
  if (tier1Intents.includes(intentId)) {
    return 1;
  }

  // Tier 3: Complex queries
  const tier3Intents = ['COMPLAINT', 'CUSTOM_ORDER', 'HEALTH_QUERY'];
  if (tier3Intents.includes(intentId)) {
    return 3;
  }

  // Check message length for complexity
  if (message && message.length > 100) {
    return 3;
  }

  // Default to Tier 2
  return 2;
}

// ===========================================
// EXPORT
// ===========================================

export default {
  AI_PERSONAS,
  generateTier1Response,
  generateTier2Response,
  generateTier3Response,
  generateResponse,
};
