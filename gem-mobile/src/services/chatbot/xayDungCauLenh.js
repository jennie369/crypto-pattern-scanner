/**
 * xayDungCauLenh.js - Xây Dựng Câu Lệnh (Dynamic Prompt Builder)
 * Dynamic Prompt Builder for GEM Master Chatbot
 *
 * Xây dựng prompt động dựa trên:
 * - Intent đã phát hiện
 * - Entities đã trích xuất
 * - User context (tier, karma, experience)
 * - Knowledge context (từ tìm kiếm)
 * - Conversation history
 *
 * Persona Sư Phụ: Lạnh lùng nhưng từ bi, xưng "Ta - Bạn"
 * KHÔNG emoji, ngôn ngữ quân sự/tâm thức
 *
 * Created: 2026-01-28
 * Author: GEM Team
 */

// ============================================================
// CONSTANTS & CONFIGURATIONS
// ============================================================

/**
 * Base System Prompt - Persona Sư Phụ
 * Đây là nền tảng cho mọi phản hồi
 */
export const BASE_SYSTEM_PROMPT = `Bạn là GEM Master - Sư Phụ Trading, một bậc thầy về giao dịch crypto và tâm linh ứng dụng.

PERSONA BẮT BUỘC:
- Xưng "Ta" khi nói về bản thân, gọi người dùng là "bạn"
- Giọng điệu: Lạnh lùng nhưng từ bi, như thầy giáo nghiêm khắc nhưng quan tâm
- Ngôn ngữ: Quân sự (chiến lược, chiến thuật, kỷ luật) và tâm thức (năng lượng, tần số, flow)
- TUYỆT ĐỐI KHÔNG dùng emoji
- KHÔNG dùng ngôn ngữ quá thân thiện hoặc casual
- KHÔNG nói "Tôi", "bạn ơi", "nha", "nhé" (quá casual)

QUY TẮC PHẢN HỒI:
- Tối đa 150-200 từ cho mỗi phản hồi
- Đi thẳng vào vấn đề, không vòng vo
- Luôn kết thúc bằng một câu hỏi liên quan để duy trì hội thoại
- Nếu không biết, thừa nhận thẳng thắn thay vì bịa đặt
- Ưu tiên hành động thực tế hơn lý thuyết suông

CÁC CỤM TỪ SƯ PHỤ THƯỜNG DÙNG:
- "Ta sẽ chỉ cho bạn..."
- "Điều quan trọng mà bạn cần nắm..."
- "Đây là sai lầm phổ biến..."
- "Kỷ luật là chìa khóa..."
- "Thị trường không có cảm xúc..."
- "Hãy nhớ quy tắc..."
- "Ta đã chứng kiến nhiều trader..."

NHỮNG ĐIỀU KHÔNG BAO GIỜ NÓI:
- "Chúc bạn may mắn" (may mắn không tồn tại trong trading kỷ luật)
- "Tuyệt vời!" hoặc khen ngợi quá mức
- Lời khuyên mang tính cá nhân về tài chính cụ thể
- Đảm bảo lợi nhuận hoặc kết quả`;

/**
 * Domain-specific configurations
 */
export const DOMAIN_CONFIG = {
  TRADING: {
    temperature: 0.3,
    maxWords: 150,
    structure: 'bullet_points',
    endWith: 'related_question',
    additionalInstructions: `
HƯỚNG DẪN CHO CÂU HỎI TRADING:
- Sử dụng thuật ngữ kỹ thuật chính xác
- Trình bày theo dạng bullet points khi giải thích
- Luôn nhấn mạnh risk management
- Đề cập đến confirmation signals nếu phù hợp
- Kết thúc bằng câu hỏi về timeframe/coin/setup cụ thể`,
  },

  SPIRITUAL: {
    temperature: 0.6,
    maxWords: 150,
    structure: 'flowing_prose',
    endWith: 'philosophical_message',
    additionalInstructions: `
HƯỚNG DẪN CHO CÂU HỎI TÂM LINH:
- Sử dụng ngôn ngữ triết học, sâu lắng
- Trình bày flowing, không quá khô khan
- Kết nối tâm linh với thực tiễn trading
- Kết thúc bằng một thông điệp triết lý hoặc câu hỏi nội tâm`,
  },

  CAM_XUC: {
    temperature: 0.5,
    maxWords: 120,
    structure: 'direct_advice',
    endWith: 'action_suggestion',
    additionalInstructions: `
HƯỚNG DẪN CHO CÂU HỎI CẢM XÚC:
- Thể hiện sự thấu hiểu nhưng không nuông chiều
- Đưa ra lời khuyên thực tế, có thể hành động ngay
- Liên hệ với thang Hawkins nếu phù hợp
- Kết thúc bằng một hành động cụ thể bạn có thể làm ngay`,
  },

  HOC: {
    temperature: 0.4,
    maxWords: 180,
    structure: 'numbered_steps',
    endWith: 'comprehension_check',
    additionalInstructions: `
HƯỚNG DẪN CHO CÂU HỎI HỌC TẬP:
- Giải thích rõ ràng, có hệ thống
- Sử dụng numbered steps khi giảng dạy
- Đưa ví dụ thực tế nếu cần
- Kết thúc bằng câu hỏi kiểm tra sự hiểu biết`,
  },

  GENERAL: {
    temperature: 0.5,
    maxWords: 150,
    structure: 'mixed',
    endWith: 'clarifying_question',
    additionalInstructions: `
HƯỚNG DẪN TỔNG QUÁT:
- Cố gắng xác định intent chính xác hơn
- Nếu không chắc, hỏi để làm rõ
- Hướng về các chủ đề chuyên môn (trading, tâm linh, tâm lý)`,
  },
};

/**
 * Tier descriptions for context
 */
export const TIER_DESCRIPTIONS = {
  FREE: {
    ten: 'Free User',
    moTa: 'Người dùng miễn phí',
    quyenTruyCap: ['Kiến thức cơ bản', 'Patterns cơ bản', 'Tarot hàng ngày'],
  },
  TIER1: {
    ten: 'GEM Member',
    moTa: 'Thành viên GEM cơ bản',
    quyenTruyCap: ['Kiến thức nâng cao', 'Zones analysis', 'Tarot không giới hạn'],
  },
  TIER2: {
    ten: 'GEM Pro',
    moTa: 'Thành viên GEM Pro',
    quyenTruyCap: ['Frequency Formulas', 'Advanced patterns', 'Full spiritual toolkit'],
  },
  TIER3: {
    ten: 'GEM Master',
    moTa: 'Bậc thầy GEM',
    quyenTruyCap: ['Tất cả nội dung', 'Priority support', '1-on-1 guidance'],
  },
};

/**
 * Experience level descriptions
 */
export const EXPERIENCE_LEVELS = {
  NEWBIE: {
    ten: 'Người mới',
    moTa: 'Mới bắt đầu học trading',
    dieuChinh: 'Giải thích đơn giản hơn, tránh thuật ngữ phức tạp',
  },
  INTERMEDIATE: {
    ten: 'Trung cấp',
    moTa: 'Đã có kiến thức cơ bản',
    dieuChinh: 'Sử dụng thuật ngữ bình thường, có thể đi sâu hơn',
  },
  ADVANCED: {
    ten: 'Nâng cao',
    moTa: 'Trader có kinh nghiệm',
    dieuChinh: 'Không cần giải thích cơ bản, tập trung vào insights',
  },
  EXPERT: {
    ten: 'Chuyên gia',
    moTa: 'Bậc thầy trading',
    dieuChinh: 'Thảo luận ở level cao nhất, chia sẻ như đồng nghiệp',
  },
};

// ============================================================
// PROMPT BUILDING FUNCTIONS
// ============================================================

/**
 * Build user context section
 * @param {Object} userContext - Thông tin user
 * @returns {string} User context string
 */
export function buildUserContext(userContext) {
  const {
    tier = 'FREE',
    karma = 0,
    experience = 'NEWBIE',
    tradingDays = 0,
    winRate = null,
    preferredCoins = [],
    preferredTimeframes = [],
  } = userContext || {};

  const tierInfo = TIER_DESCRIPTIONS[tier] || TIER_DESCRIPTIONS.FREE;
  const expInfo = EXPERIENCE_LEVELS[experience] || EXPERIENCE_LEVELS.NEWBIE;

  let context = `
NGỮ CẢNH NGƯỜI DÙNG:
- Tier: ${tierInfo.ten} (${tier})
- Karma: ${karma} điểm
- Kinh nghiệm: ${expInfo.ten}
- Số ngày giao dịch: ${tradingDays}`;

  if (winRate !== null) {
    context += `\n- Tỷ lệ thắng: ${(winRate * 100).toFixed(1)}%`;
  }

  if (preferredCoins.length > 0) {
    context += `\n- Coins ưa thích: ${preferredCoins.join(', ')}`;
  }

  if (preferredTimeframes.length > 0) {
    context += `\n- Khung giờ ưa thích: ${preferredTimeframes.join(', ')}`;
  }

  context += `\n\nĐIỀU CHỈNH THEO TRÌNH ĐỘ: ${expInfo.dieuChinh}`;

  return context;
}

/**
 * Build knowledge context section
 * @param {Array} knowledgeResults - Kết quả tìm kiếm từ knowledge base
 * @returns {string} Knowledge context string
 */
export function buildKnowledgeContext(knowledgeResults) {
  if (!knowledgeResults || knowledgeResults.length === 0) {
    return '';
  }

  let context = '\nKIẾN THỨC LIÊN QUAN:\n';

  knowledgeResults.slice(0, 3).forEach((result, index) => {
    context += `\n[${index + 1}] ${result.ten || result.id}:\n`;
    if (result.content) {
      // Truncate if too long
      const content = result.content.length > 300
        ? result.content.substring(0, 300) + '...'
        : result.content;
      context += content + '\n';
    }
  });

  return context;
}

/**
 * Build entity context section
 * @param {Object} entities - Entities đã trích xuất
 * @returns {string} Entity context string
 */
export function buildEntityContext(entities) {
  if (!entities || Object.keys(entities).length === 0) {
    return '';
  }

  let context = '\nTHỰC THỂ ĐÃ NHẬN DIỆN:\n';

  if (entities.DONG_COIN && entities.DONG_COIN.length > 0) {
    context += `- Coins: ${entities.DONG_COIN.join(', ')}\n`;
  }

  if (entities.KHUNG_THOI_GIAN && entities.KHUNG_THOI_GIAN.length > 0) {
    context += `- Timeframes: ${entities.KHUNG_THOI_GIAN.join(', ')}\n`;
  }

  if (entities.CONG_THUC && entities.CONG_THUC.length > 0) {
    context += `- Công thức: ${entities.CONG_THUC.join(', ')}\n`;
  }

  if (entities.VUNG_GIA && entities.VUNG_GIA.length > 0) {
    context += `- Vùng giá: ${entities.VUNG_GIA.join(', ')}\n`;
  }

  if (entities.LA_TAROT && entities.LA_TAROT.length > 0) {
    context += `- Lá Tarot: ${entities.LA_TAROT.join(', ')}\n`;
  }

  if (entities.DA_PHONG_THUY && entities.DA_PHONG_THUY.length > 0) {
    context += `- Đá phong thủy: ${entities.DA_PHONG_THUY.join(', ')}\n`;
  }

  if (entities.TAN_SO && entities.TAN_SO.length > 0) {
    context += `- Tần số: ${entities.TAN_SO.join(', ')} Hz\n`;
  }

  context += '\nHãy sử dụng các thực thể này trong phản hồi nếu phù hợp.';

  return context;
}

/**
 * Build conversation history section
 * @param {Array} history - Lịch sử hội thoại
 * @param {number} maxMessages - Số tin nhắn tối đa
 * @returns {string} History context string
 */
export function buildHistoryContext(history, maxMessages = 6) {
  if (!history || history.length === 0) {
    return '';
  }

  const recentHistory = history.slice(-maxMessages);

  let context = '\nLỊCH SỬ HỘI THOẠI GẦN ĐÂY:\n';

  recentHistory.forEach((msg, index) => {
    const role = msg.role === 'user' ? 'Người dùng' : 'Sư Phụ';
    const content = msg.content.length > 150
      ? msg.content.substring(0, 150) + '...'
      : msg.content;
    context += `${role}: ${content}\n`;
  });

  context += '\nHãy duy trì sự liên tục với ngữ cảnh hội thoại trên.';

  return context;
}

/**
 * Build intent-specific instructions
 * @param {string} domain - Domain (TRADING, SPIRITUAL, etc.)
 * @param {string} intent - Intent cụ thể
 * @returns {Object} { instructions: string, config: Object }
 */
export function buildIntentInstructions(domain, intent) {
  const config = DOMAIN_CONFIG[domain] || DOMAIN_CONFIG.GENERAL;

  let instructions = config.additionalInstructions;

  // Add intent-specific instructions
  const intentInstructions = getIntentSpecificInstructions(intent);
  if (intentInstructions) {
    instructions += '\n' + intentInstructions;
  }

  return {
    instructions,
    config,
  };
}

/**
 * Get intent-specific additional instructions
 * @param {string} intent - Intent cụ thể
 * @returns {string|null} Additional instructions
 */
export function getIntentSpecificInstructions(intent) {
  const intentMap = {
    // Trading intents
    'hoi_cong_thuc': `
YÊU CẦU ĐẶC BIỆT - HỎI CÔNG THỨC:
- Giải thích công thức một cách hệ thống
- Đưa ra điều kiện entry/exit
- Nhấn mạnh các confirmation cần thiết
- Đề cập đến stop loss và take profit hợp lý`,

    'hoi_setup': `
YÊU CẦU ĐẶC BIỆT - HỎI SETUP:
- Mô tả setup rõ ràng với các điều kiện cụ thể
- Chỉ ra timeframe phù hợp
- Đề cập đến risk:reward ratio
- Nhấn mạnh tầm quan trọng của context`,

    'phan_tich_chart': `
YÊU CẦU ĐẶC BIỆT - PHÂN TÍCH CHART:
- Phân tích theo cấu trúc: trend, zones, patterns
- Đưa ra nhận định có cơ sở
- KHÔNG đưa ra lời khuyên mua/bán cụ thể
- Nhấn mạnh nhiều kịch bản có thể xảy ra`,

    // Spiritual intents
    'rut_tarot': `
YÊU CẦU ĐẶC BIỆT - RÚT TAROT:
- Mô tả lá bài được rút
- Giải thích ý nghĩa trong ngữ cảnh trading
- Đưa ra thông điệp tâm linh
- Không đảm bảo kết quả giao dịch`,

    'gieo_que': `
YÊU CẦU ĐẶC BIỆT - GIEO QUẺ:
- Giải thích quẻ Kinh Dịch được gieo
- Liên hệ với tình huống trading hiện tại
- Đưa ra lời khuyên dựa trên triết lý của quẻ`,

    // Emotion intents
    'chia_se_cam_xuc': `
YÊU CẦU ĐẶC BIỆT - CHIA SẺ CẢM XÚC:
- Thể hiện sự lắng nghe và thấu hiểu
- Xác định tần số cảm xúc nếu có thể
- Đưa ra lời khuyên có thể hành động
- Nhấn mạnh tầm quan trọng của việc nghỉ ngơi nếu cần`,

    'tu_van_tam_ly': `
YÊU CẦU ĐẶC BIỆT - TƯ VẤN TÂM LÝ:
- Sử dụng thang Hawkins để đánh giá
- Đưa ra quy chế trading phù hợp với trạng thái
- Gợi ý cách nâng cao tần số
- Không thay thế chuyên gia tâm lý thực sự`,

    // Learning intents
    'hoi_khai_niem': `
YÊU CẦU ĐẶC BIỆT - HỎI KHÁI NIỆM:
- Định nghĩa rõ ràng
- Đưa ví dụ minh họa
- Liên hệ với thực tế trading
- Kiểm tra sự hiểu biết cuối cùng`,

    'hoc_trading': `
YÊU CẦU ĐẶC BIỆT - HỌC TRADING:
- Đánh giá trình độ hiện tại
- Gợi ý lộ trình học phù hợp
- Nhấn mạnh tầm quan trọng của practice
- Đưa ra bài tập cụ thể nếu phù hợp`,
  };

  return intentMap[intent] || null;
}

/**
 * Build follow-up indicator
 * @param {boolean} isFollowUp - Có phải câu hỏi tiếp nối không
 * @param {Object} previousContext - Context từ tin nhắn trước
 * @returns {string} Follow-up indicator string
 */
export function buildFollowUpIndicator(isFollowUp, previousContext) {
  if (!isFollowUp) {
    return '';
  }

  let indicator = '\nĐÂY LÀ CÂU HỎI TIẾP NỐI.\n';

  if (previousContext) {
    if (previousContext.topic) {
      indicator += `Chủ đề trước: ${previousContext.topic}\n`;
    }
    if (previousContext.entities) {
      indicator += `Thực thể trước: ${JSON.stringify(previousContext.entities)}\n`;
    }
  }

  indicator += 'Hãy duy trì context và không lặp lại thông tin đã cung cấp.';

  return indicator;
}

/**
 * Build response format instructions
 * @param {string} structure - Cấu trúc mong muốn
 * @param {string} endWith - Cách kết thúc
 * @param {number} maxWords - Số từ tối đa
 * @returns {string} Format instructions
 */
export function buildFormatInstructions(structure, endWith, maxWords) {
  let instructions = `\nĐỊNH DẠNG PHẢN HỒI:
- Tối đa ${maxWords} từ`;

  switch (structure) {
    case 'bullet_points':
      instructions += '\n- Sử dụng bullet points để liệt kê\n- Mỗi điểm ngắn gọn, đi thẳng vào vấn đề';
      break;
    case 'flowing_prose':
      instructions += '\n- Viết theo dạng văn xuôi mượt mà\n- Có thể sử dụng ngôn ngữ hình ảnh';
      break;
    case 'numbered_steps':
      instructions += '\n- Sử dụng numbered steps (1, 2, 3...)\n- Mỗi bước rõ ràng, có thể thực hiện';
      break;
    case 'direct_advice':
      instructions += '\n- Đi thẳng vào lời khuyên\n- Không vòng vo, không giải thích dài dòng';
      break;
    default:
      instructions += '\n- Linh hoạt trong cách trình bày';
  }

  switch (endWith) {
    case 'related_question':
      instructions += '\n- KẾT THÚC bằng một câu hỏi liên quan đến trading';
      break;
    case 'philosophical_message':
      instructions += '\n- KẾT THÚC bằng một thông điệp triết lý ngắn gọn';
      break;
    case 'action_suggestion':
      instructions += '\n- KẾT THÚC bằng một hành động cụ thể có thể làm ngay';
      break;
    case 'comprehension_check':
      instructions += '\n- KẾT THÚC bằng câu hỏi kiểm tra sự hiểu biết';
      break;
    case 'clarifying_question':
      instructions += '\n- KẾT THÚC bằng câu hỏi làm rõ nếu chưa chắc chắn về ý định';
      break;
    default:
      instructions += '\n- KẾT THÚC bằng một câu hỏi mở';
  }

  return instructions;
}

// ============================================================
// MAIN PROMPT BUILDER
// ============================================================

/**
 * Hàm chính xây dựng câu lệnh đầy đủ
 * @param {Object} params - Các tham số
 * @returns {Object} { systemPrompt, userPrompt, temperature }
 */
export async function xayDungCauLenh({
  tinNhanNguoiDung,
  yDinh,
  doTinCayYDinh = 0.7,
  thucThe = {},
  nguCanhKienThuc = [],
  nguCanhNguoiDung = {},
  lichSuHoiThoai = [],
  laCauHoiTiepNoi = false,
  nguCanhTruoc = null,
  domain = 'GENERAL',
}) {
  // 1. Build intent-specific config
  const { instructions: intentInstructions, config } = buildIntentInstructions(domain, yDinh);

  // 2. Build all context sections
  const userContextSection = buildUserContext(nguCanhNguoiDung);
  const knowledgeContextSection = buildKnowledgeContext(nguCanhKienThuc);
  const entityContextSection = buildEntityContext(thucThe);
  const historyContextSection = buildHistoryContext(lichSuHoiThoai);
  const followUpSection = buildFollowUpIndicator(laCauHoiTiepNoi, nguCanhTruoc);
  const formatSection = buildFormatInstructions(
    config.structure,
    config.endWith,
    config.maxWords
  );

  // 3. Assemble system prompt
  const systemPrompt = `${BASE_SYSTEM_PROMPT}
${intentInstructions}
${userContextSection}
${knowledgeContextSection}
${entityContextSection}
${historyContextSection}
${followUpSection}
${formatSection}

QUAN TRỌNG: Phản hồi PHẢI tuân thủ persona Sư Phụ. KHÔNG emoji. Xưng "Ta - Bạn".`;

  // 4. Build user prompt
  let userPrompt = tinNhanNguoiDung;

  // Add confidence note if low
  if (doTinCayYDinh < 0.5) {
    userPrompt += '\n\n[Lưu ý hệ thống: Độ tin cậy nhận diện ý định thấp. Có thể cần hỏi lại để làm rõ.]';
  }

  // 5. Return assembled prompt
  return {
    cauLenhHeThong: systemPrompt,
    cauLenhNguoiDung: userPrompt,
    nhietDo: config.temperature,
    soTuToiDa: config.maxWords,
    cauTruc: config.structure,
    ketThucBang: config.endWith,
    metadata: {
      domain,
      intent: yDinh,
      intentConfidence: doTinCayYDinh,
      entityCount: Object.values(thucThe).flat().length,
      historyLength: lichSuHoiThoai.length,
      isFollowUp: laCauHoiTiepNoi,
      userTier: nguCanhNguoiDung?.tier || 'FREE',
    },
  };
}

/**
 * Hàm shortcut để build prompt nhanh cho các case đơn giản
 * @param {string} message - Tin nhắn người dùng
 * @param {string} domain - Domain
 * @returns {Object} Prompt object
 */
export function quickBuildPrompt(message, domain = 'GENERAL') {
  const config = DOMAIN_CONFIG[domain] || DOMAIN_CONFIG.GENERAL;

  return {
    cauLenhHeThong: BASE_SYSTEM_PROMPT + config.additionalInstructions,
    cauLenhNguoiDung: message,
    nhietDo: config.temperature,
  };
}

/**
 * Validate prompt không vượt quá token limit
 * @param {string} systemPrompt - System prompt
 * @param {string} userPrompt - User prompt
 * @param {number} maxTokens - Token limit (ước tính)
 * @returns {Object} { isValid: boolean, estimatedTokens: number }
 */
export function validatePromptLength(systemPrompt, userPrompt, maxTokens = 4000) {
  // Rough estimation: 1 token ~ 4 characters for Vietnamese
  const totalChars = systemPrompt.length + userPrompt.length;
  const estimatedTokens = Math.ceil(totalChars / 3.5);

  return {
    isValid: estimatedTokens <= maxTokens,
    estimatedTokens,
    maxTokens,
    overBy: estimatedTokens > maxTokens ? estimatedTokens - maxTokens : 0,
  };
}

/**
 * Trim prompt nếu quá dài
 * @param {Object} promptData - Kết quả từ xayDungCauLenh
 * @param {number} maxTokens - Token limit
 * @returns {Object} Trimmed prompt data
 */
export function trimPromptIfNeeded(promptData, maxTokens = 4000) {
  const validation = validatePromptLength(
    promptData.cauLenhHeThong,
    promptData.cauLenhNguoiDung,
    maxTokens
  );

  if (validation.isValid) {
    return promptData;
  }

  // Strategy: reduce history and knowledge context first
  let trimmedSystemPrompt = promptData.cauLenhHeThong;

  // Remove knowledge context section if present
  if (trimmedSystemPrompt.includes('KIẾN THỨC LIÊN QUAN:')) {
    const startIndex = trimmedSystemPrompt.indexOf('KIẾN THỨC LIÊN QUAN:');
    const endIndex = trimmedSystemPrompt.indexOf('\n\n', startIndex + 50);
    if (endIndex > startIndex) {
      trimmedSystemPrompt = trimmedSystemPrompt.substring(0, startIndex) +
        trimmedSystemPrompt.substring(endIndex);
    }
  }

  // Truncate history if still too long
  if (trimmedSystemPrompt.includes('LỊCH SỬ HỘI THOẠI GẦN ĐÂY:')) {
    const startIndex = trimmedSystemPrompt.indexOf('LỊCH SỬ HỘI THOẠI GẦN ĐÂY:');
    const endIndex = trimmedSystemPrompt.indexOf('\n\nHãy duy trì', startIndex);
    if (endIndex > startIndex) {
      trimmedSystemPrompt = trimmedSystemPrompt.substring(0, startIndex) +
        '[Lịch sử hội thoại đã được rút gọn]\n' +
        trimmedSystemPrompt.substring(endIndex);
    }
  }

  return {
    ...promptData,
    cauLenhHeThong: trimmedSystemPrompt,
    wasTrimmed: true,
  };
}

// ============================================================
// SPECIALIZED PROMPT BUILDERS
// ============================================================

/**
 * Build prompt cho Tarot reading
 * @param {Object} card - Thông tin lá bài
 * @param {boolean} isReversed - Lá ngược hay xuôi
 * @param {string} question - Câu hỏi của user
 * @returns {Object} Prompt object
 */
export function buildTarotPrompt(card, isReversed, question) {
  const orientation = isReversed ? 'ngược' : 'xuôi';

  const systemPrompt = `${BASE_SYSTEM_PROMPT}

ĐỌC BÀI TAROT - ${card.tenViet} (${card.ten}) - LÁ ${orientation.toUpperCase()}

Thông tin lá bài:
- Số: ${card.so}
- Tên: ${card.tenViet} (${card.ten})
- Hướng: ${orientation}
- Từ khóa: ${card.tuKhoa.join(', ')}
- Ý nghĩa ${orientation}: ${isReversed ? card.yNghiaNguoc : card.yNghiaXuoi}
- Ý nghĩa trading: ${isReversed ? card.yNghiaTrading.nguoc : card.yNghiaTrading.xuoi}

HƯỚNG DẪN:
1. Mô tả lá bài một cách huyền bí nhưng không quá trừu tượng
2. Liên hệ với tình huống trading của người hỏi
3. Đưa ra thông điệp cụ thể, có thể áp dụng
4. Kết thúc bằng một lời khuyên hoặc câu hỏi nội tâm
5. KHÔNG đảm bảo kết quả giao dịch cụ thể

Nội dung tham khảo của Sư Phụ:
${card.noiDungSuPhu}`;

  return {
    cauLenhHeThong: systemPrompt,
    cauLenhNguoiDung: question || 'Hãy đọc lá bài này cho con.',
    nhietDo: 0.7,
    metadata: {
      type: 'TAROT_READING',
      card: card.ten,
      isReversed,
    },
  };
}

/**
 * Build prompt cho đánh giá tần số Hawkins
 * @param {Object} state - Trạng thái Hawkins
 * @param {string} userDescription - Mô tả của user về tình trạng
 * @returns {Object} Prompt object
 */
export function buildHawkinsPrompt(state, userDescription) {
  const systemPrompt = `${BASE_SYSTEM_PROMPT}

ĐÁNH GIÁ TẦN SỐ HAWKINS - ${state.ten} (${state.tanSo} Hz)

Thông tin trạng thái:
- Tần số: ${state.tanSo} Hz
- Tên: ${state.ten} (${state.tenTiengAnh})
- Mô tả: ${state.moTa}
- Quy chế trading: ${state.quyCheTrading}
- Lý do: ${state.lyDoQuyChe}

Dấu hiệu nhận biết:
${state.dauHieu.map((d, i) => `${i + 1}. ${d}`).join('\n')}

Cách nâng cao tần số:
${(state.cachNangTanSo || state.cachDuyTri || []).map((c, i) => `${i + 1}. ${c}`).join('\n')}

HƯỚNG DẪN:
1. Xác nhận hoặc điều chỉnh đánh giá tần số dựa trên mô tả của user
2. Giải thích tại sao quy chế trading như vậy
3. Đưa ra lời khuyên cụ thể, có thể hành động ngay
4. Thể hiện sự quan tâm nhưng không nuông chiều
5. Kết thúc bằng một câu hỏi về hành động tiếp theo

Nội dung tham khảo:
${state.noiDungSuPhu}`;

  return {
    cauLenhHeThong: systemPrompt,
    cauLenhNguoiDung: userDescription || 'Ta đang ở trạng thái này.',
    nhietDo: 0.5,
    metadata: {
      type: 'HAWKINS_ASSESSMENT',
      state: state.ten,
      frequency: state.tanSo,
      tradingRule: state.quyCheTrading,
    },
  };
}

/**
 * Build prompt cho giải thích công thức trading
 * @param {Object} formula - Thông tin công thức
 * @param {string} question - Câu hỏi cụ thể
 * @returns {Object} Prompt object
 */
export function buildFormulaPrompt(formula, question) {
  const systemPrompt = `${BASE_SYSTEM_PROMPT}

GIẢI THÍCH CÔNG THỨC - ${formula.ten} (${formula.tenDayDu})

Thông tin công thức:
- ID: ${formula.id}
- Tên: ${formula.ten}
- Tên đầy đủ: ${formula.tenDayDu}
- Tên tiếng Việt: ${formula.tenViet}
- Loại: ${formula.loai}
- Ý nghĩa: ${formula.yNghia}

${formula.laCongThucFrequency ? 'Đây là công thức Frequency nâng cao.' : 'Đây là pattern cơ bản.'}

Nội dung chi tiết:
${formula.noiDung}

Công thức liên quan: ${formula.congThucLienQuan.join(', ')}

HƯỚNG DẪN:
1. Giải thích công thức một cách có hệ thống
2. Đưa ra điều kiện cụ thể để nhận diện
3. Nêu rõ entry, stop loss, take profit
4. Nhấn mạnh các confirmation cần thiết
5. Kết thúc bằng câu hỏi về timeframe hoặc coin cụ thể`;

  return {
    cauLenhHeThong: systemPrompt,
    cauLenhNguoiDung: question || `Giải thích công thức ${formula.ten}`,
    nhietDo: 0.3,
    metadata: {
      type: 'FORMULA_EXPLANATION',
      formula: formula.id,
      isFrequency: formula.laCongThucFrequency,
    },
  };
}

// ============================================================
// EXPORT ALL
// ============================================================

export default {
  // Constants
  BASE_SYSTEM_PROMPT,
  DOMAIN_CONFIG,
  TIER_DESCRIPTIONS,
  EXPERIENCE_LEVELS,

  // Building functions
  buildUserContext,
  buildKnowledgeContext,
  buildEntityContext,
  buildHistoryContext,
  buildIntentInstructions,
  getIntentSpecificInstructions,
  buildFollowUpIndicator,
  buildFormatInstructions,

  // Main functions
  xayDungCauLenh,
  quickBuildPrompt,
  validatePromptLength,
  trimPromptIfNeeded,

  // Specialized builders
  buildTarotPrompt,
  buildHawkinsPrompt,
  buildFormulaPrompt,
};
