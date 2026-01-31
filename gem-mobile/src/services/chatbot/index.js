/**
 * index.js - Chatbot Services Integration
 * Main entry point for GEM Master Chatbot upgrade modules
 *
 * Tích hợp các module mới:
 * - Entity Extraction (trichXuatThucThe.js)
 * - Knowledge Base (khoKienThuc/)
 * - Fallback Handler (xuLyDuPhong.js)
 * - Dynamic Prompt Builder (xayDungCauLenh.js)
 *
 * Created: 2026-01-28
 * Author: GEM Team
 */

// ============================================================
// IMPORTS
// ============================================================

// Entity Extraction
import {
  trichXuatThucThe,
  giaiQuyetThamChieu,
  ENTITY_TYPES,
  normalizeEntity,
} from './trichXuatThucThe';

// Fallback Handler
import {
  handleFallback,
  shouldUseFallback,
  calculateCompositeConfidence,
  determineConfidenceLevel,
  determineDomain,
  formulaNotFoundFallback,
  tierLockedFallback,
  systemErrorFallback,
  outOfScopeFallback,
  CONFIDENCE_LEVELS,
} from './xuLyDuPhong';

// Dynamic Prompt Builder
import {
  xayDungCauLenh,
  quickBuildPrompt,
  buildTarotPrompt,
  buildHawkinsPrompt,
  buildFormulaPrompt,
  validatePromptLength,
  trimPromptIfNeeded,
  BASE_SYSTEM_PROMPT,
  DOMAIN_CONFIG,
} from './xayDungCauLenh';

// Knowledge Base
import khoKienThuc, {
  // Trading
  FREQUENCY_FORMULAS,
  BASIC_FORMULAS,
  ZONE_CONCEPTS,
  searchFormulas,
  getFormulaById,
  checkTierAccess,

  // Spiritual
  HAWKINS_SCALE,
  TRANG_THAI_NGUY_HIEM,
  DA_PHONG_THUY_TRADING,
  MAJOR_ARCANA_TAROT,
  BAT_QUAI_CO_BAN,
  checkTradingPermission,
  drawRandomTarotCard,
  getHawkinsStateByFrequency,
  getTarotCard,
  getKinhDichQue,

  // Unified search
  searchAllKnowledge,
  getKnowledgeById,
  getSuPhuContent,
} from './khoKienThuc';

// ============================================================
// MAIN ENHANCED PROCESSOR
// ============================================================

/**
 * Xử lý tin nhắn nâng cao với tất cả module mới
 * Dùng để tích hợp vào gemMasterService.processMessage
 *
 * @param {Object} params - Tham số
 * @param {string} params.message - Tin nhắn người dùng
 * @param {string} params.intent - Intent đã phát hiện
 * @param {number} params.intentConfidence - Độ tin cậy của intent
 * @param {Object} params.userContext - Ngữ cảnh người dùng
 * @param {Array} params.history - Lịch sử hội thoại
 * @returns {Object} Kết quả xử lý nâng cao
 */
export async function enhancedMessageProcessor({
  message,
  intent,
  intentConfidence = 0.7,
  userContext = {},
  history = [],
}) {
  const startTime = Date.now();

  try {
    // 1. Extract entities
    const entityResult = trichXuatThucThe(message);
    const resolvedEntities = giaiQuyetThamChieu(message, history);

    // Merge entities
    const mergedEntities = {
      ...entityResult.byType,
      ...resolvedEntities,
    };

    // 2. Determine domain
    const domain = determineDomain(message, intent);

    // 3. Search knowledge base
    const knowledgeResults = searchAllKnowledge(
      message,
      userContext.tier || 'FREE',
      { maxResults: 3 }
    );

    // 4. Calculate confidence components
    const confidenceComponents = {
      intent: intentConfidence,
      emotion: 0.5, // Can be enhanced with emotion detection later
      entity: entityResult.entities.length > 0 ? 0.7 : 0.4,
      context: history.length > 0 ? 0.6 : 0.4,
    };

    // 5. Check if fallback is needed
    const compositeConfidence = calculateCompositeConfidence(confidenceComponents);
    const needsFallback = shouldUseFallback(compositeConfidence);

    // 6. If fallback needed, process it
    if (needsFallback) {
      const fallbackResult = await handleFallback({
        message,
        domain,
        confidenceComponents,
        partialAnswer: knowledgeResults[0]?.noiDung || '',
        context: {
          historyLength: history.length,
          recentTopics: extractRecentTopics(history),
          isFollowUp: isFollowUpQuestion(message, history),
        },
      });

      return {
        success: true,
        useFallback: true,
        fallback: fallbackResult,
        entities: mergedEntities,
        domain,
        confidence: compositeConfidence,
        processingTime: Date.now() - startTime,
      };
    }

    // 7. Build dynamic prompt
    const promptData = await xayDungCauLenh({
      tinNhanNguoiDung: message,
      yDinh: intent,
      doTinCayYDinh: intentConfidence,
      thucThe: mergedEntities,
      nguCanhKienThuc: knowledgeResults,
      nguCanhNguoiDung: userContext,
      lichSuHoiThoai: history.slice(-6).map(h => ({
        role: h.isUser ? 'user' : 'assistant',
        content: h.text,
      })),
      laCauHoiTiepNoi: isFollowUpQuestion(message, history),
      domain,
    });

    // 8. Validate and trim if needed
    const validatedPrompt = trimPromptIfNeeded(promptData, 4000);

    return {
      success: true,
      useFallback: false,
      prompt: validatedPrompt,
      entities: mergedEntities,
      knowledgeContext: knowledgeResults,
      domain,
      confidence: compositeConfidence,
      processingTime: Date.now() - startTime,
    };

  } catch (error) {
    console.error('[Chatbot] Error in enhancedMessageProcessor:', error);

    return {
      success: false,
      error: error.message,
      fallback: {
        needsFallback: true,
        finalResponse: systemErrorFallback(),
      },
      processingTime: Date.now() - startTime,
    };
  }
}

// ============================================================
// SPECIALIZED HANDLERS
// ============================================================

/**
 * Xử lý câu hỏi về công thức trading
 * @param {string} formulaId - ID công thức
 * @param {string} question - Câu hỏi
 * @param {string} userTier - Tier của user
 * @returns {Object} Prompt hoặc locked message
 */
export async function handleFormulaQuestion(formulaId, question, userTier = 'FREE') {
  const formula = getFormulaById(formulaId, userTier);

  if (!formula) {
    return {
      success: false,
      response: formulaNotFoundFallback(formulaId),
    };
  }

  if (formula.isLocked) {
    return {
      success: false,
      response: tierLockedFallback(formula.ten, formula.tierYeuCau, userTier),
      requiresUpgrade: true,
      requiredTier: formula.tierYeuCau,
    };
  }

  return {
    success: true,
    prompt: buildFormulaPrompt(formula, question),
    formula,
  };
}

/**
 * Xử lý rút Tarot
 * @param {string} question - Câu hỏi của user
 * @param {number} specificCard - Số lá bài cụ thể (0-21) hoặc null để random
 * @returns {Object} Prompt và thông tin lá bài
 */
export async function handleTarotReading(question, specificCard = null) {
  let card, isReversed;

  if (specificCard !== null && specificCard >= 0 && specificCard <= 21) {
    card = getTarotCard(specificCard);
    isReversed = Math.random() < 0.5;
  } else {
    const drawnCard = drawRandomTarotCard(true);
    card = drawnCard.card;
    isReversed = drawnCard.isReversed;
  }

  if (!card) {
    return {
      success: false,
      response: 'Không thể rút lá bài. Vui lòng thử lại.',
    };
  }

  return {
    success: true,
    prompt: buildTarotPrompt(card, isReversed, question),
    card,
    isReversed,
  };
}

/**
 * Xử lý đánh giá tần số Hawkins
 * @param {number} frequency - Tần số ước tính hoặc user input
 * @param {string} description - Mô tả trạng thái của user
 * @returns {Object} Prompt và thông tin trạng thái
 */
export async function handleHawkinsAssessment(frequency, description) {
  const state = getHawkinsStateByFrequency(frequency);

  if (!state) {
    return {
      success: false,
      response: 'Không thể xác định trạng thái tần số. Vui lòng mô tả cụ thể hơn.',
    };
  }

  const permission = checkTradingPermission(frequency);

  return {
    success: true,
    prompt: buildHawkinsPrompt(state, description),
    state,
    tradingPermission: permission,
  };
}

/**
 * Xử lý gieo quẻ Kinh Dịch
 * @param {string} question - Câu hỏi của user
 * @returns {Object} Quẻ ngẫu nhiên và thông tin
 */
export async function handleKinhDichReading(question) {
  const queIds = Object.keys(BAT_QUAI_CO_BAN);
  const randomQueId = queIds[Math.floor(Math.random() * queIds.length)];
  const que = getKinhDichQue(randomQueId);

  if (!que) {
    return {
      success: false,
      response: 'Không thể gieo quẻ. Vui lòng thử lại.',
    };
  }

  const systemPrompt = `${BASE_SYSTEM_PROMPT}

GIEO QUẺ KINH DỊCH - ${que.ten} (${que.tenTiengAnh})

Thông tin quẻ:
- Ký hiệu: ${que.kyHieu}
- Hào Việt: ${que.haoViet}
- Nguyên tố: ${que.nguyenTo}
- Tính cách: ${que.tinhCach}
- Hướng: ${que.huong}
- Ý nghĩa trading xuôi: ${que.yNghiaTrading.xuoi}
- Ý nghĩa trading ngược: ${que.yNghiaTrading.nguoc}
- Lời khuyên: ${que.loiKhuyen}

Nội dung Sư Phụ:
${que.noiDungSuPhu}

HƯỚNG DẪN:
1. Mô tả quẻ một cách huyền bí, kết nối với triết học Kinh Dịch
2. Giải thích ý nghĩa trong ngữ cảnh trading
3. Đưa ra lời khuyên thực tế dựa trên quẻ
4. Kết thúc bằng một thông điệp triết lý`;

  return {
    success: true,
    prompt: {
      cauLenhHeThong: systemPrompt,
      cauLenhNguoiDung: question || 'Hãy gieo quẻ cho con.',
      nhietDo: 0.6,
    },
    que,
  };
}

// ============================================================
// HELPER FUNCTIONS
// ============================================================

/**
 * Kiểm tra xem có phải câu hỏi tiếp nối không
 * @param {string} message - Tin nhắn hiện tại
 * @param {Array} history - Lịch sử hội thoại
 * @returns {boolean}
 */
function isFollowUpQuestion(message, history) {
  if (history.length === 0) return false;

  const lowerMsg = message.toLowerCase();
  const followUpIndicators = [
    'vậy còn', 'thế còn', 'còn gì nữa', 'nói thêm', 'giải thích thêm',
    'ý là sao', 'nghĩa là gì', 'vd như', 'ví dụ', 'cụ thể hơn',
    'như thế nào', 'tại sao', 'vì sao', 'khi nào', 'ở đâu',
    'nó', 'cái đó', 'công thức đó', 'coin đó', 'lá đó',
  ];

  return followUpIndicators.some(indicator => lowerMsg.includes(indicator));
}

/**
 * Trích xuất các chủ đề gần đây từ history
 * @param {Array} history - Lịch sử hội thoại
 * @returns {Array} Danh sách chủ đề
 */
function extractRecentTopics(history) {
  const recentMessages = history.slice(-4);
  const topics = new Set();

  recentMessages.forEach(msg => {
    const text = (msg.text || '').toLowerCase();

    if (text.includes('dpd') || text.includes('upu') || text.includes('frequency')) {
      topics.add('frequency_formulas');
    }
    if (text.includes('zone') || text.includes('vùng')) {
      topics.add('zones');
    }
    if (text.includes('tarot') || text.includes('bài')) {
      topics.add('tarot');
    }
    if (text.includes('hawkins') || text.includes('tần số')) {
      topics.add('hawkins');
    }
    if (text.includes('btc') || text.includes('eth') || text.includes('coin')) {
      topics.add('crypto');
    }
  });

  return Array.from(topics);
}

// ============================================================
// QUICK ACCESS UTILITIES
// ============================================================

/**
 * Tìm kiếm nhanh trong kho kiến thức
 * @param {string} query - Từ khóa
 * @param {string} userTier - Tier của user
 * @returns {Array} Kết quả
 */
export function quickSearch(query, userTier = 'FREE') {
  return searchAllKnowledge(query, userTier, { maxResults: 5 });
}

/**
 * Kiểm tra quyền trade dựa trên tần số
 * @param {number} frequency - Tần số Hz
 * @returns {Object} Permission info
 */
export function checkCanTrade(frequency) {
  return checkTradingPermission(frequency);
}

/**
 * Lấy thống kê kho kiến thức
 * @returns {Object} Stats
 */
export function getKnowledgeStats() {
  return khoKienThuc.getKnowledgeStats();
}

// ============================================================
// RE-EXPORTS
// ============================================================

// Entity Extraction
export {
  trichXuatThucThe,
  giaiQuyetThamChieu,
  ENTITY_TYPES,
  normalizeEntity,
};

// Fallback Handler
export {
  handleFallback,
  shouldUseFallback,
  calculateCompositeConfidence,
  determineConfidenceLevel,
  determineDomain,
  formulaNotFoundFallback,
  tierLockedFallback,
  systemErrorFallback,
  outOfScopeFallback,
  CONFIDENCE_LEVELS,
};

// Dynamic Prompt Builder
export {
  xayDungCauLenh,
  quickBuildPrompt,
  buildTarotPrompt,
  buildHawkinsPrompt,
  buildFormulaPrompt,
  validatePromptLength,
  trimPromptIfNeeded,
  BASE_SYSTEM_PROMPT,
  DOMAIN_CONFIG,
};

// Knowledge Base
export {
  khoKienThuc,
  FREQUENCY_FORMULAS,
  BASIC_FORMULAS,
  ZONE_CONCEPTS,
  searchFormulas,
  getFormulaById,
  checkTierAccess,
  HAWKINS_SCALE,
  TRANG_THAI_NGUY_HIEM,
  DA_PHONG_THUY_TRADING,
  MAJOR_ARCANA_TAROT,
  BAT_QUAI_CO_BAN,
  checkTradingPermission,
  drawRandomTarotCard,
  getHawkinsStateByFrequency,
  getTarotCard,
  getKinhDichQue,
  searchAllKnowledge,
  getKnowledgeById,
  getSuPhuContent,
};

// ============================================================
// DEFAULT EXPORT
// ============================================================

export default {
  // Main processor
  enhancedMessageProcessor,

  // Specialized handlers
  handleFormulaQuestion,
  handleTarotReading,
  handleHawkinsAssessment,
  handleKinhDichReading,

  // Quick utilities
  quickSearch,
  checkCanTrade,
  getKnowledgeStats,

  // Sub-modules
  entityExtraction: {
    trichXuatThucThe,
    giaiQuyetThamChieu,
    ENTITY_TYPES,
    normalizeEntity,
  },
  fallback: {
    handleFallback,
    shouldUseFallback,
    calculateCompositeConfidence,
    CONFIDENCE_LEVELS,
  },
  promptBuilder: {
    xayDungCauLenh,
    quickBuildPrompt,
    buildTarotPrompt,
    buildHawkinsPrompt,
    buildFormulaPrompt,
    BASE_SYSTEM_PROMPT,
  },
  knowledge: khoKienThuc,
};
