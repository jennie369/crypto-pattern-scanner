/**
 * xuLyDuPhong.js - Xử Lý Dự Phòng (Fallback Handler)
 * Fallback Handler for GEM Master Chatbot
 *
 * Xử lý các trường hợp chatbot không hiểu hoặc không chắc chắn
 * Dựa trên confidence score để quyết định phản hồi phù hợp
 *
 * Persona Sư Phụ: Lạnh lùng nhưng từ bi, xưng "Ta - Bạn"
 * KHÔNG emoji, ngôn ngữ quân sự/tâm thức
 *
 * Created: 2026-01-28
 * Author: GEM Team
 */

// ============================================================
// CONFIDENCE LEVELS & THRESHOLDS
// ============================================================

/**
 * Các mức độ confidence và ngưỡng tương ứng
 */
export const CONFIDENCE_LEVELS = {
  THUA_NHAN_GIOI_HAN: {
    id: 'THUA_NHAN_GIOI_HAN',
    ten: 'Thừa Nhận Giới Hạn',
    tenTiengAnh: 'Acknowledge Limits',
    min: 0,
    max: 0.29,
    moTa: 'Confidence quá thấp, thừa nhận không hiểu/không biết',
    hanhDong: 'Thừa nhận giới hạn một cách trung thực, đề xuất chủ đề liên quan',
  },
  HOI_LAI: {
    id: 'HOI_LAI',
    ten: 'Hỏi Lại',
    tenTiengAnh: 'Ask Clarification',
    min: 0.30,
    max: 0.44,
    moTa: 'Confidence thấp, cần hỏi lại để làm rõ',
    hanhDong: 'Đặt câu hỏi cụ thể để làm rõ ý định người dùng',
  },
  GOI_Y_CHU_DE: {
    id: 'GOI_Y_CHU_DE',
    ten: 'Gợi Ý Chủ Đề',
    tenTiengAnh: 'Suggest Topics',
    min: 0.45,
    max: 0.54,
    moTa: 'Confidence trung bình, gợi ý các chủ đề có thể liên quan',
    hanhDong: 'Đưa ra danh sách các chủ đề có thể bạn đang hỏi',
  },
  TRA_LOI_MOT_PHAN: {
    id: 'TRA_LOI_MOT_PHAN',
    ten: 'Trả Lời Một Phần',
    tenTiengAnh: 'Partial Answer',
    min: 0.55,
    max: 0.69,
    moTa: 'Confidence khá, trả lời với cảnh báo có thể chưa chính xác',
    hanhDong: 'Trả lời nhưng kèm disclaimer về độ chắc chắn',
  },
  TRA_LOI_DAY_DU: {
    id: 'TRA_LOI_DAY_DU',
    ten: 'Trả Lời Đầy Đủ',
    tenTiengAnh: 'Full Answer',
    min: 0.70,
    max: 1.0,
    moTa: 'Confidence cao, trả lời đầy đủ không cần fallback',
    hanhDong: 'Trả lời bình thường, không cần xử lý dự phòng',
  },
};

/**
 * Trọng số cho các thành phần confidence
 */
export const CONFIDENCE_WEIGHTS = {
  intent: 0.4,      // Trọng số cho độ chắc chắn của intent
  emotion: 0.1,     // Trọng số cho độ chắc chắn của emotion
  entity: 0.2,      // Trọng số cho độ chắc chắn của entity
  context: 0.3,     // Trọng số cho độ phù hợp ngữ cảnh
};

// ============================================================
// FALLBACK TEMPLATES - SƯ PHỤ STYLE
// ============================================================

/**
 * Templates phản hồi theo domain và confidence level
 * Viết theo phong cách Sư Phụ: lạnh lùng nhưng từ bi
 */
export const FALLBACK_TEMPLATES = {
  TRADING: {
    THUA_NHAN_GIOI_HAN: [
      'Câu hỏi này nằm ngoài phạm vi kiến thức Trading của Ta. Ta chuyên về: phân tích kỹ thuật, patterns, zones, và tâm lý giao dịch. Bạn muốn hỏi về chủ đề nào trong số đó?',
      'Ta không có câu trả lời cho điều bạn hỏi. Lĩnh vực của Ta là: công thức Frequency, vùng cung cầu, và quản lý rủi ro. Hãy đặt câu hỏi trong phạm vi đó.',
      'Sự thật là Ta không biết về điều này. Nhưng Ta có thể giúp bạn với: DPD, UPU, zones, và psychology trading. Bạn cần gì?',
    ],
    HOI_LAI: [
      'Câu hỏi của bạn chưa rõ ràng. Bạn muốn hỏi về công thức nào? Đồng coin nào? Khung thời gian nào?',
      'Ta cần thêm thông tin. Bạn đang nói về: pattern cụ thể, vùng giá, hay tâm lý giao dịch?',
      'Hãy làm rõ hơn: bạn đang phân tích coin nào, timeframe bao nhiêu, và đang tìm kiếm setup gì?',
      'Ta chưa nắm được ý bạn. Mô tả cụ thể hơn: bạn đang ở vị thế nào và cần hỗ trợ điều gì?',
    ],
    GOI_Y_CHU_DE: [
      'Có lẽ bạn đang hỏi về một trong những chủ đề sau:\n- Công thức Frequency (DPD, UPU, UPD, DPU)\n- Vùng cung cầu (Supply/Demand zones)\n- Phân tích kỹ thuật\n- Quản lý rủi ro\nChọn một để Ta giúp.',
      'Ta đoán bạn quan tâm đến:\n- Patterns giao dịch\n- Vùng giá quan trọng\n- Tâm lý trader\n- Quản lý vốn\nXác nhận để Ta đi sâu hơn.',
      'Câu hỏi của bạn có thể liên quan đến:\n- Setup entry/exit\n- Đọc chart\n- Risk management\n- Trading psychology\nBạn muốn tìm hiểu khía cạnh nào?',
    ],
    TRA_LOI_MOT_PHAN: [
      'Dựa trên những gì Ta hiểu, {partial_answer}. Tuy nhiên, Ta chưa hoàn toàn chắc chắn về ý định của bạn. Đây có phải điều bạn đang hỏi không?',
      'Ta sẽ trả lời theo cách Ta hiểu: {partial_answer}. Nếu không đúng ý, hãy làm rõ thêm.',
      'Theo những gì Ta nắm được: {partial_answer}. Ta có thể đang hiểu sai, hãy xác nhận để Ta điều chỉnh.',
    ],
  },

  SPIRITUAL: {
    THUA_NHAN_GIOI_HAN: [
      'Điều bạn hỏi vượt ra ngoài kiến thức tâm linh của Ta. Ta có thể giúp về: Tarot, Kinh Dịch, tần số Hawkins, và đá phong thủy. Bạn cần gì trong số đó?',
      'Ta không có khả năng trả lời câu hỏi này. Lĩnh vực tâm linh của Ta bao gồm: trải bài, gieo quẻ, và năng lượng trading. Hãy hỏi trong phạm vi đó.',
      'Sự trung thực của Ta: không biết về điều này. Nhưng Ta sẵn sàng giúp về Tarot trading, Hawkins scale, hoặc đá năng lượng.',
    ],
    HOI_LAI: [
      'Ta chưa hiểu bạn cần gì. Bạn muốn rút Tarot? Gieo quẻ Kinh Dịch? Hay tìm hiểu về đá phong thủy?',
      'Hãy cụ thể hơn: bạn đang tìm guidance về giao dịch, về cảm xúc, hay về hướng đi cuộc sống?',
      'Ta cần làm rõ: bạn muốn Ta giúp đỡ về mặt năng lượng trading hay về mặt tâm linh tổng quát?',
    ],
    GOI_Y_CHU_DE: [
      'Ta có thể giúp bạn với:\n- Rút lá Tarot cho ngày giao dịch\n- Gieo quẻ Kinh Dịch\n- Tìm đá phong thủy phù hợp\n- Đánh giá tần số cảm xúc\nChọn một.',
      'Các lĩnh vực tâm linh Ta hỗ trợ:\n- Major Arcana Tarot\n- Bát Quái Kinh Dịch\n- Thang Hawkins\n- Đá năng lượng trading\nBạn quan tâm điều nào?',
    ],
    TRA_LOI_MOT_PHAN: [
      'Theo sự hiểu biết của Ta: {partial_answer}. Năng lượng không nói dối, nhưng cách Ta diễn giải có thể chưa đúng với hoàn cảnh của bạn. Hãy xác nhận.',
      'Ta cảm nhận: {partial_answer}. Tuy nhiên, trực giác cần được xác nhận bằng thực tế. Điều này có đúng với bạn không?',
    ],
  },

  CAM_XUC: {
    THUA_NHAN_GIOI_HAN: [
      'Ta không phải chuyên gia tâm lý. Nhưng Ta có thể giúp bạn với tâm lý TRADING cụ thể: sợ hãi khi vào lệnh, tham lam khi có lời, tức giận khi thua. Đó có phải điều bạn cần không?',
      'Vấn đề cảm xúc tổng quát nằm ngoài khả năng của Ta. Tuy nhiên, nếu liên quan đến GIAO DỊCH, Ta có thể giúp về thang Hawkins và quản lý trạng thái. Bạn đang gặp khó khăn gì khi trade?',
    ],
    HOI_LAI: [
      'Bạn đang ở trạng thái cảm xúc nào? Mô tả cụ thể để Ta giúp: lo lắng, sợ hãi, tức giận, hay mất phương hướng?',
      'Ta cần hiểu rõ hơn. Cảm xúc này ảnh hưởng đến trading của bạn như thế nào? Bạn có đang giữ lệnh không?',
      'Hãy nói rõ: bạn cần hỗ trợ tâm lý trước khi trade, trong khi giữ lệnh, hay sau khi đã thua/thắng?',
    ],
    GOI_Y_CHU_DE: [
      'Ta có thể giúp bạn với:\n- Đánh giá tần số cảm xúc hiện tại\n- Xác định có nên trade không\n- Kỹ thuật điều chỉnh tâm lý\n- Nhận diện trạng thái nguy hiểm\nBạn cần gì?',
      'Các khía cạnh tâm lý trading Ta hỗ trợ:\n- Thang Hawkins (20-700 Hz)\n- 4 trạng thái nguy hiểm\n- Cách nâng cao tần số\n- Quyết định có trade hay không\nChọn một để đi sâu.',
    ],
    TRA_LOI_MOT_PHAN: [
      'Dựa trên những gì bạn mô tả, Ta đoán: {partial_answer}. Đây có đúng với trạng thái của bạn không? Nếu sai, hãy chia sẻ thêm.',
      'Ta cảm nhận bạn đang: {partial_answer}. Tuy nhiên, chỉ bạn mới biết rõ nội tâm mình. Xác nhận để Ta cho lời khuyên chính xác hơn.',
    ],
  },

  HOC: {
    THUA_NHAN_GIOI_HAN: [
      'Nội dung này nằm ngoài chương trình giảng dạy của Ta. Ta có thể dạy về: công thức giao dịch, cách đọc chart, quản lý rủi ro, và tâm lý trading. Bạn muốn học gì?',
      'Ta không có kiến thức về điều bạn hỏi. Chương trình của Ta bao gồm: Frequency formulas, zones, patterns, và trading psychology. Hãy chọn chủ đề.',
    ],
    HOI_LAI: [
      'Bạn muốn học gì cụ thể? Công thức DPD/UPU? Cách xác định zones? Hay quản lý tâm lý?',
      'Nói rõ hơn về mục tiêu học tập: bạn là newbie muốn học từ đầu, hay đã có kiến thức và muốn nâng cao?',
      'Ta cần biết trình độ hiện tại của bạn. Bạn đã biết gì về technical analysis và trading psychology?',
    ],
    GOI_Y_CHU_DE: [
      'Các chủ đề học tập Ta cung cấp:\n- Công thức Frequency (cơ bản đến nâng cao)\n- Vùng cung cầu\n- Patterns kinh điển\n- Tâm lý giao dịch\n- Quản lý vốn\nBạn muốn bắt đầu từ đâu?',
      'Lộ trình học của Ta:\n1. Nền tảng: đọc chart cơ bản\n2. Trung cấp: patterns và zones\n3. Nâng cao: Frequency formulas\n4. Bậc thầy: Psychology và risk management\nBạn ở đâu trên lộ trình?',
    ],
    TRA_LOI_MOT_PHAN: [
      'Theo câu hỏi của bạn, Ta sẽ giải thích: {partial_answer}. Đây có phải điều bạn muốn học không? Nếu cần điều chỉnh, cho Ta biết.',
      'Ta hiểu bạn muốn tìm hiểu về: {partial_answer}. Nếu đúng, Ta sẽ đi sâu hơn. Nếu sai, hãy chỉnh lại hướng.',
    ],
  },

  GENERAL: {
    THUA_NHAN_GIOI_HAN: [
      'Câu hỏi này nằm ngoài khả năng của Ta. Ta là Sư Phụ Trading, chuyên về: giao dịch, tâm linh trading, và tâm lý trader. Bạn có câu hỏi trong các lĩnh vực đó không?',
      'Ta thành thật: không biết về điều này. Phạm vi của Ta là: trading crypto, tarot trading, và quản lý cảm xúc khi giao dịch. Hỏi trong phạm vi đó, Ta sẽ giúp.',
    ],
    HOI_LAI: [
      'Ta chưa hiểu ý bạn. Hãy diễn đạt lại rõ ràng hơn: bạn cần hỗ trợ về trading, về tâm linh, hay về tâm lý?',
      'Câu hỏi của bạn khá mơ hồ. Cụ thể hơn: bạn đang gặp vấn đề gì và cần Ta giúp như thế nào?',
    ],
    GOI_Y_CHU_DE: [
      'Ta có thể hỗ trợ bạn trong các lĩnh vực:\n- Trading & Technical Analysis\n- Tâm linh (Tarot, Kinh Dịch)\n- Tâm lý giao dịch\n- Học tập về trading\nChọn một để bắt đầu.',
    ],
    TRA_LOI_MOT_PHAN: [
      'Dựa trên suy luận của Ta: {partial_answer}. Ta không hoàn toàn chắc chắn, vì vậy hãy xác nhận nếu đây là điều bạn cần.',
    ],
  },
};

/**
 * Các câu gợi ý follow-up theo domain
 */
export const FOLLOW_UP_SUGGESTIONS = {
  TRADING: [
    'Bạn đang phân tích coin nào?',
    'Timeframe bạn đang dùng là gì?',
    'Bạn đang tìm setup long hay short?',
    'Có pattern cụ thể nào bạn đang quan sát không?',
  ],
  SPIRITUAL: [
    'Bạn muốn rút lá Tarot không?',
    'Có cần Ta gieo quẻ Kinh Dịch không?',
    'Bạn đang tìm đá phong thủy cho mục đích gì?',
    'Tần số cảm xúc hiện tại của bạn là bao nhiêu?',
  ],
  CAM_XUC: [
    'Bạn đánh giá tâm trạng hiện tại từ 1-10 như thế nào?',
    'Đã có lệnh nào đang mở không?',
    'Gần đây bạn thắng hay thua nhiều hơn?',
    'Bạn có cảm thấy muốn revenge trade không?',
  ],
  HOC: [
    'Bạn đã trade được bao lâu?',
    'Phong cách giao dịch của bạn là gì?',
    'Bạn muốn học về pattern hay indicator?',
    'Có khái niệm nào bạn thấy khó hiểu không?',
  ],
};

// ============================================================
// CORE FUNCTIONS
// ============================================================

/**
 * Tính toán composite confidence từ các thành phần
 * @param {Object} components - Các thành phần confidence
 * @param {number} components.intent - Confidence của intent (0-1)
 * @param {number} components.emotion - Confidence của emotion (0-1)
 * @param {number} components.entity - Confidence của entity (0-1)
 * @param {number} components.context - Confidence của context (0-1)
 * @returns {number} Composite confidence (0-1)
 */
export function calculateCompositeConfidence(components) {
  const {
    intent = 0.5,
    emotion = 0.5,
    entity = 0.5,
    context = 0.5,
  } = components;

  const composite = (
    intent * CONFIDENCE_WEIGHTS.intent +
    emotion * CONFIDENCE_WEIGHTS.emotion +
    entity * CONFIDENCE_WEIGHTS.entity +
    context * CONFIDENCE_WEIGHTS.context
  );

  // Clamp to 0-1
  return Math.max(0, Math.min(1, composite));
}

/**
 * Xác định confidence level từ score
 * @param {number} confidence - Confidence score (0-1)
 * @returns {Object} Confidence level object
 */
export function determineConfidenceLevel(confidence) {
  for (const [key, level] of Object.entries(CONFIDENCE_LEVELS)) {
    if (confidence >= level.min && confidence <= level.max) {
      return { ...level, score: confidence };
    }
  }

  // Default to acknowledge limits if something goes wrong
  return { ...CONFIDENCE_LEVELS.THUA_NHAN_GIOI_HAN, score: confidence };
}

/**
 * Kiểm tra có cần dùng fallback không
 * @param {number} confidence - Confidence score (0-1)
 * @returns {boolean} True nếu cần fallback
 */
export function shouldUseFallback(confidence) {
  return confidence < CONFIDENCE_LEVELS.TRA_LOI_DAY_DU.min;
}

/**
 * Lấy fallback template ngẫu nhiên
 * @param {string} domain - Domain (TRADING, SPIRITUAL, CAM_XUC, HOC, GENERAL)
 * @param {string} levelId - Confidence level ID
 * @returns {string} Template string
 */
export function getRandomTemplate(domain, levelId) {
  const domainTemplates = FALLBACK_TEMPLATES[domain] || FALLBACK_TEMPLATES.GENERAL;
  const templates = domainTemplates[levelId] || domainTemplates.HOI_LAI;

  if (!templates || templates.length === 0) {
    return 'Ta cần bạn làm rõ hơn câu hỏi.';
  }

  const randomIndex = Math.floor(Math.random() * templates.length);
  return templates[randomIndex];
}

/**
 * Lấy follow-up suggestions
 * @param {string} domain - Domain
 * @returns {Array<string>} Danh sách gợi ý
 */
export function getFollowUpSuggestions(domain) {
  return FOLLOW_UP_SUGGESTIONS[domain] || FOLLOW_UP_SUGGESTIONS.TRADING;
}

/**
 * Xử lý fallback chính
 * @param {Object} params - Tham số
 * @param {string} params.message - Tin nhắn người dùng
 * @param {string} params.domain - Domain đã phát hiện
 * @param {Object} params.confidenceComponents - Các thành phần confidence
 * @param {string} params.partialAnswer - Câu trả lời một phần (nếu có)
 * @param {Object} params.context - Ngữ cảnh bổ sung
 * @returns {Object} Kết quả fallback
 */
export function processFallback({
  message,
  domain = 'GENERAL',
  confidenceComponents = {},
  partialAnswer = '',
  context = {},
}) {
  // Tính confidence
  const confidence = calculateCompositeConfidence(confidenceComponents);
  const level = determineConfidenceLevel(confidence);

  // Kiểm tra có cần fallback không
  if (!shouldUseFallback(confidence)) {
    return {
      needsFallback: false,
      confidence,
      level: level.id,
      response: null,
    };
  }

  // Lấy template phù hợp
  let template = getRandomTemplate(domain, level.id);

  // Thay thế placeholder nếu có
  if (partialAnswer && template.includes('{partial_answer}')) {
    template = template.replace('{partial_answer}', partialAnswer);
  }

  // Lấy follow-up suggestions
  const suggestions = getFollowUpSuggestions(domain);

  // Build response
  const response = {
    mainResponse: template,
    suggestions: level.id === 'HOI_LAI' ? suggestions.slice(0, 2) : [],
    disclaimer: level.id === 'TRA_LOI_MOT_PHAN'
      ? 'Đây là phỏng đoán của Ta dựa trên thông tin hạn chế.'
      : null,
  };

  return {
    needsFallback: true,
    confidence,
    level: level.id,
    levelName: level.ten,
    domain,
    response,
    metadata: {
      confidenceComponents,
      template,
      originalMessage: message,
    },
  };
}

/**
 * Tạo response fallback hoàn chỉnh
 * @param {Object} fallbackResult - Kết quả từ processFallback
 * @returns {string} Response text hoàn chỉnh
 */
export function buildFallbackResponse(fallbackResult) {
  if (!fallbackResult.needsFallback) {
    return null;
  }

  const { response } = fallbackResult;
  let fullResponse = response.mainResponse;

  // Thêm suggestions nếu có
  if (response.suggestions && response.suggestions.length > 0) {
    fullResponse += '\n\n' + response.suggestions.join('\n');
  }

  return fullResponse;
}

/**
 * Xác định domain từ message và intent
 * @param {string} message - Tin nhắn người dùng
 * @param {string} detectedIntent - Intent đã phát hiện
 * @returns {string} Domain
 */
export function determineDomain(message, detectedIntent) {
  const lowerMessage = message.toLowerCase();

  // Map intent to domain
  const intentDomainMap = {
    // Trading intents
    'hoi_cong_thuc': 'TRADING',
    'hoi_setup': 'TRADING',
    'phan_tich_chart': 'TRADING',
    'hoi_vung_gia': 'TRADING',
    'hoi_coin': 'TRADING',
    'trading_psychology': 'TRADING',
    'risk_management': 'TRADING',

    // Spiritual intents
    'rut_tarot': 'SPIRITUAL',
    'gieo_que': 'SPIRITUAL',
    'hoi_da': 'SPIRITUAL',
    'hoi_tan_so': 'SPIRITUAL',
    'kinh_dich': 'SPIRITUAL',

    // Emotion intents
    'chia_se_cam_xuc': 'CAM_XUC',
    'so_hai': 'CAM_XUC',
    'tuc_gian': 'CAM_XUC',
    'lo_lang': 'CAM_XUC',
    'tu_van_tam_ly': 'CAM_XUC',

    // Learning intents
    'hoi_khai_niem': 'HOC',
    'xin_giai_thich': 'HOC',
    'hoc_trading': 'HOC',
    'bat_dau': 'HOC',
  };

  if (detectedIntent && intentDomainMap[detectedIntent]) {
    return intentDomainMap[detectedIntent];
  }

  // Fallback detection based on keywords
  const tradingKeywords = ['coin', 'btc', 'eth', 'trade', 'lệnh', 'chart', 'pattern', 'zone', 'dpd', 'upu'];
  const spiritualKeywords = ['tarot', 'bài', 'quẻ', 'đá', 'tần số', 'kinh dịch', 'hawkins'];
  const emotionKeywords = ['sợ', 'lo', 'giận', 'buồn', 'stress', 'hoảng', 'thua', 'mất'];
  const learningKeywords = ['học', 'giải thích', 'là gì', 'như thế nào', 'cách', 'hướng dẫn'];

  if (tradingKeywords.some(kw => lowerMessage.includes(kw))) return 'TRADING';
  if (spiritualKeywords.some(kw => lowerMessage.includes(kw))) return 'SPIRITUAL';
  if (emotionKeywords.some(kw => lowerMessage.includes(kw))) return 'CAM_XUC';
  if (learningKeywords.some(kw => lowerMessage.includes(kw))) return 'HOC';

  return 'GENERAL';
}

/**
 * Đánh giá intent confidence
 * @param {Object} intentResult - Kết quả từ intent classifier
 * @returns {number} Confidence score (0-1)
 */
export function evaluateIntentConfidence(intentResult) {
  if (!intentResult) return 0.3;

  const { confidence = 0.5, secondBestConfidence = 0 } = intentResult;

  // Nếu confidence cao và cách biệt với second best lớn
  const gap = confidence - secondBestConfidence;

  if (confidence >= 0.8 && gap >= 0.3) return 0.95;
  if (confidence >= 0.7 && gap >= 0.2) return 0.85;
  if (confidence >= 0.6 && gap >= 0.15) return 0.75;
  if (confidence >= 0.5) return 0.6;
  if (confidence >= 0.4) return 0.45;

  return 0.3;
}

/**
 * Đánh giá entity confidence
 * @param {Object} entities - Entities đã trích xuất
 * @returns {number} Confidence score (0-1)
 */
export function evaluateEntityConfidence(entities) {
  if (!entities || Object.keys(entities).length === 0) return 0.3;

  const entityCount = Object.values(entities).flat().length;

  // Nhiều entities = confident hơn
  if (entityCount >= 3) return 0.9;
  if (entityCount === 2) return 0.75;
  if (entityCount === 1) return 0.6;

  return 0.4;
}

/**
 * Đánh giá context confidence
 * @param {Object} context - Context từ conversation history
 * @returns {number} Confidence score (0-1)
 */
export function evaluateContextConfidence(context) {
  if (!context) return 0.4;

  const { historyLength = 0, recentTopics = [], isFollowUp = false } = context;

  let score = 0.5;

  // Có history = confident hơn
  if (historyLength > 0) score += 0.1;
  if (historyLength > 3) score += 0.1;

  // Là câu hỏi tiếp nối = confident hơn
  if (isFollowUp) score += 0.15;

  // Có recent topics liên quan
  if (recentTopics.length > 0) score += 0.1;

  return Math.min(1, score);
}

/**
 * API chính để xử lý fallback trong gemMasterService
 * @param {Object} params - Tham số đầy đủ
 * @returns {Object} Kết quả xử lý fallback
 */
export async function handleFallback({
  message,
  intentResult,
  entities,
  context,
  partialAnswer,
}) {
  // Xác định domain
  const domain = determineDomain(message, intentResult?.intent);

  // Tính các thành phần confidence
  const confidenceComponents = {
    intent: evaluateIntentConfidence(intentResult),
    emotion: 0.5, // Default, có thể được update từ emotion detection
    entity: evaluateEntityConfidence(entities),
    context: evaluateContextConfidence(context),
  };

  // Xử lý fallback
  const result = processFallback({
    message,
    domain,
    confidenceComponents,
    partialAnswer,
    context,
  });

  // Build final response
  if (result.needsFallback) {
    result.finalResponse = buildFallbackResponse(result);
  }

  return result;
}

// ============================================================
// SPECIALIZED FALLBACK RESPONSES
// ============================================================

/**
 * Fallback cho trường hợp không tìm thấy công thức
 * @param {string} formulaQuery - Từ khóa tìm kiếm công thức
 * @returns {string} Response
 */
export function formulaNotFoundFallback(formulaQuery) {
  return `Ta không tìm thấy công thức "${formulaQuery}" trong kho kiến thức. Các công thức Ta biết:
- DPD (Giảm-Nghỉ-Giảm)
- UPU (Tăng-Nghỉ-Tăng)
- UPD (Tăng-Nghỉ-Giảm)
- DPU (Giảm-Nghỉ-Tăng)
- HFZ (Vùng Tần Số Cao)
- LFZ (Vùng Tần Số Thấp)
Bạn muốn hỏi về công thức nào?`;
}

/**
 * Fallback cho trường hợp tier không đủ
 * @param {string} contentName - Tên nội dung bị khóa
 * @param {string} requiredTier - Tier cần thiết
 * @param {string} userTier - Tier hiện tại của user
 * @returns {string} Response
 */
export function tierLockedFallback(contentName, requiredTier, userTier) {
  return `Nội dung "${contentName}" yêu cầu ${requiredTier}, trong khi bạn đang ở ${userTier}. Ta không thể mở khóa nội dung này cho bạn. Hãy nâng cấp tier để truy cập đầy đủ kiến thức. Trong khi chờ đợi, bạn có muốn Ta giải thích các khái niệm cơ bản không?`;
}

/**
 * Fallback cho lỗi hệ thống
 * @returns {string} Response
 */
export function systemErrorFallback() {
  return 'Ta gặp trục trặc trong việc xử lý yêu cầu của bạn. Hãy thử lại sau vài giây. Nếu vấn đề tiếp tục, hãy liên hệ với đội ngũ hỗ trợ.';
}

/**
 * Fallback cho câu hỏi ngoài phạm vi
 * @param {string} topic - Chủ đề ngoài phạm vi
 * @returns {string} Response
 */
export function outOfScopeFallback(topic) {
  return `"${topic}" nằm ngoài phạm vi chuyên môn của Ta. Ta là Sư Phụ Trading, tập trung vào:
- Phân tích kỹ thuật và công thức giao dịch
- Tâm linh ứng dụng trong trading (Tarot, Kinh Dịch)
- Tâm lý và quản lý cảm xúc khi giao dịch
Bạn có câu hỏi trong các lĩnh vực này không?`;
}

// ============================================================
// EXPORT ALL
// ============================================================

export default {
  // Constants
  CONFIDENCE_LEVELS,
  CONFIDENCE_WEIGHTS,
  FALLBACK_TEMPLATES,
  FOLLOW_UP_SUGGESTIONS,

  // Core functions
  calculateCompositeConfidence,
  determineConfidenceLevel,
  shouldUseFallback,
  getRandomTemplate,
  getFollowUpSuggestions,
  processFallback,
  buildFallbackResponse,
  determineDomain,

  // Evaluation functions
  evaluateIntentConfidence,
  evaluateEntityConfidence,
  evaluateContextConfidence,

  // Main API
  handleFallback,

  // Specialized fallbacks
  formulaNotFoundFallback,
  tierLockedFallback,
  systemErrorFallback,
  outOfScopeFallback,
};
