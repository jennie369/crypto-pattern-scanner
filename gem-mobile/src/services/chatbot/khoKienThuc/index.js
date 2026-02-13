/**
 * index.js - Kho Kiến Thức Exports
 * Knowledge Base Index for GEM Master Chatbot
 *
 * Tổng hợp và export tất cả modules từ kho kiến thức:
 * - congThucGiaoDich.js: Công thức trading (Frequency formulas, patterns, zones)
 * - tamLinh.js: Kiến thức tâm linh (Hawkins, Tarot, Kinh Dịch, Đá phong thủy)
 *
 * Created: 2026-01-28
 * Author: GEM Team
 */

// ============================================================
// IMPORT MODULES
// ============================================================

// Trading Knowledge
import {
  // Constants
  TIER_REQUIREMENTS,
  FORMULA_TYPES,
  FREQUENCY_FORMULAS,
  BASIC_FORMULAS,
  ZONE_CONCEPTS,

  // Functions
  checkTierAccess,
  getUpgradeMessage,
  getAllFormulas,
  getFormulaById,
  searchFormulas,
  getRelatedFormulas,
  getFormulasByType,
  getFormulasByTier,
  getFrequencyFormulas,
  formatForAIContext,
  buildKnowledgeContext,
} from './congThucGiaoDich';

// Spiritual Knowledge
import {
  // Constants
  HAWKINS_SCALE,
  TRANG_THAI_NGUY_HIEM,
  DA_PHONG_THUY_TRADING,
  MAJOR_ARCANA_TAROT,
  BAT_QUAI_CO_BAN,

  // Functions
  getHawkinsStateByFrequency,
  getTradingRuleByFrequency,
  checkTradingPermission,
  getStonesByPurpose,
  getTarotCard,
  drawRandomTarotCard,
  getKinhDichQue,
  searchSpiritualKnowledge,
} from './tamLinh';

// ============================================================
// UNIFIED SEARCH FUNCTION
// ============================================================

/**
 * Tìm kiếm thống nhất trong toàn bộ kho kiến thức
 * @param {string} query - Từ khóa tìm kiếm
 * @param {string} userTier - Tier của user (FREE, TIER1, TIER2, TIER3)
 * @param {Object} options - Tùy chọn tìm kiếm
 * @returns {Array} Kết quả tìm kiếm
 */
export function searchAllKnowledge(query, userTier = 'FREE', options = {}) {
  const {
    includeTrading = true,
    includeSpiritual = true,
    maxResults = 10,
  } = options;

  let allResults = [];

  // Search Trading Knowledge
  if (includeTrading) {
    const tradingResults = searchFormulas(query, userTier);
    allResults = allResults.concat(
      tradingResults.map(r => ({
        ...r,
        category: 'TRADING',
      }))
    );
  }

  // Search Spiritual Knowledge
  if (includeSpiritual) {
    const spiritualResults = searchSpiritualKnowledge(query);
    allResults = allResults.concat(
      spiritualResults.map(r => ({
        ...r,
        category: 'SPIRITUAL',
      }))
    );
  }

  // Sort by relevance (simple: exact matches first, then partial)
  const queryLower = query.toLowerCase();
  allResults.sort((a, b) => {
    const aExact = (a.ten || '').toLowerCase() === queryLower ? 1 : 0;
    const bExact = (b.ten || '').toLowerCase() === queryLower ? 1 : 0;
    return bExact - aExact;
  });

  // Limit results
  return allResults.slice(0, maxResults);
}

/**
 * Lấy kiến thức theo ID từ bất kỳ nguồn nào
 * @param {string} id - ID của kiến thức
 * @param {string} type - Loại kiến thức (FORMULA, HAWKINS, TAROT, STONE, KINH_DICH)
 * @param {string} userTier - Tier của user
 * @returns {Object|null} Kiến thức tìm được
 */
export function getKnowledgeById(id, type, userTier = 'FREE') {
  switch (type) {
    case 'FORMULA':
      return getFormulaById(id, userTier);

    case 'HAWKINS':
      return HAWKINS_SCALE[id] || null;

    case 'DANGEROUS_STATE':
      return TRANG_THAI_NGUY_HIEM[id] || null;

    case 'TAROT':
      const cardNumber = parseInt(id, 10);
      return isNaN(cardNumber) ? null : getTarotCard(cardNumber);

    case 'STONE':
      return DA_PHONG_THUY_TRADING[id] || null;

    case 'KINH_DICH':
      return getKinhDichQue(id);

    default:
      return null;
  }
}

/**
 * Lấy nội dung Sư Phụ cho một kiến thức
 * @param {string} id - ID của kiến thức
 * @param {string} type - Loại kiến thức
 * @param {string} userTier - Tier của user
 * @returns {string|null} Nội dung Sư Phụ
 */
export function getSuPhuContent(id, type, userTier = 'FREE') {
  const knowledge = getKnowledgeById(id, type, userTier);

  if (!knowledge) return null;

  // Check if content is locked
  if (knowledge.isLocked) {
    return knowledge.noiDung; // This contains the locked message
  }

  return knowledge.noiDungSuPhu || knowledge.noiDung || null;
}

// ============================================================
// CATEGORY HELPERS
// ============================================================

/**
 * Lấy tất cả categories có sẵn
 * @returns {Array} Danh sách categories
 */
export function getAllCategories() {
  return [
    {
      id: 'FREQUENCY_FORMULAS',
      ten: 'Công Thức Frequency',
      moTa: 'Các công thức giao dịch nâng cao dựa trên tần số',
      tierYeuCau: 'TIER2',
      soLuong: Object.keys(FREQUENCY_FORMULAS).length,
    },
    {
      id: 'BASIC_FORMULAS',
      ten: 'Công Thức Cơ Bản',
      moTa: 'Các patterns giao dịch cơ bản',
      tierYeuCau: 'FREE',
      soLuong: Object.keys(BASIC_FORMULAS).length,
    },
    {
      id: 'ZONE_CONCEPTS',
      ten: 'Khái Niệm Vùng Giá',
      moTa: 'Các khái niệm về vùng cung cầu',
      tierYeuCau: 'FREE',
      soLuong: Object.keys(ZONE_CONCEPTS).length,
    },
    {
      id: 'HAWKINS_SCALE',
      ten: 'Thang Hawkins',
      moTa: 'Thang đo tần số cảm xúc cho trading',
      tierYeuCau: 'FREE',
      soLuong: Object.keys(HAWKINS_SCALE).length,
    },
    {
      id: 'DANGEROUS_STATES',
      ten: 'Trạng Thái Nguy Hiểm',
      moTa: '4 trạng thái tâm lý nguy hiểm khi giao dịch',
      tierYeuCau: 'FREE',
      soLuong: Object.keys(TRANG_THAI_NGUY_HIEM).length,
    },
    {
      id: 'TAROT',
      ten: 'Major Arcana Tarot',
      moTa: '22 lá bài Major Arcana và ý nghĩa trading',
      tierYeuCau: 'FREE',
      soLuong: Object.keys(MAJOR_ARCANA_TAROT).length,
    },
    {
      id: 'FENG_SHUI_STONES',
      ten: 'Đá Phong Thủy Trading',
      moTa: 'Đá năng lượng hỗ trợ giao dịch',
      tierYeuCau: 'FREE',
      soLuong: Object.keys(DA_PHONG_THUY_TRADING).length,
    },
    {
      id: 'KINH_DICH',
      ten: 'Bát Quái Kinh Dịch',
      moTa: '8 quẻ cơ bản và ý nghĩa trading',
      tierYeuCau: 'FREE',
      soLuong: Object.keys(BAT_QUAI_CO_BAN).length,
    },
  ];
}

/**
 * Lấy tất cả items trong một category
 * @param {string} categoryId - ID của category
 * @param {string} userTier - Tier của user
 * @returns {Array} Danh sách items
 */
export function getCategoryItems(categoryId, userTier = 'FREE') {
  switch (categoryId) {
    case 'FREQUENCY_FORMULAS':
      return getFormulasByTier(userTier).filter(f => f.laCongThucFrequency);

    case 'BASIC_FORMULAS':
      return Object.values(BASIC_FORMULAS);

    case 'ZONE_CONCEPTS':
      return Object.values(ZONE_CONCEPTS);

    case 'HAWKINS_SCALE':
      return Object.values(HAWKINS_SCALE);

    case 'DANGEROUS_STATES':
      return Object.values(TRANG_THAI_NGUY_HIEM);

    case 'TAROT':
      return Object.values(MAJOR_ARCANA_TAROT);

    case 'FENG_SHUI_STONES':
      return Object.values(DA_PHONG_THUY_TRADING);

    case 'KINH_DICH':
      return Object.values(BAT_QUAI_CO_BAN);

    default:
      return [];
  }
}

// ============================================================
// STATISTICS
// ============================================================

/**
 * Lấy thống kê về kho kiến thức
 * @returns {Object} Thống kê
 */
export function getKnowledgeStats() {
  const tradingTotal =
    Object.keys(FREQUENCY_FORMULAS).length +
    Object.keys(BASIC_FORMULAS).length +
    Object.keys(ZONE_CONCEPTS).length;

  return {
    trading: {
      frequencyFormulas: Object.keys(FREQUENCY_FORMULAS).length,
      basicFormulas: Object.keys(BASIC_FORMULAS).length,
      zoneConcepts: Object.keys(ZONE_CONCEPTS).length,
      total: tradingTotal,
    },
    spiritual: {
      hawkinsStates: Object.keys(HAWKINS_SCALE).length,
      dangerousStates: Object.keys(TRANG_THAI_NGUY_HIEM).length,
      tarotCards: Object.keys(MAJOR_ARCANA_TAROT).length,
      fengShuiStones: Object.keys(DA_PHONG_THUY_TRADING).length,
      kinhDichQues: Object.keys(BAT_QUAI_CO_BAN).length,
      total:
        Object.keys(HAWKINS_SCALE).length +
        Object.keys(TRANG_THAI_NGUY_HIEM).length +
        Object.keys(MAJOR_ARCANA_TAROT).length +
        Object.keys(DA_PHONG_THUY_TRADING).length +
        Object.keys(BAT_QUAI_CO_BAN).length,
    },
    grandTotal:
      tradingTotal +
      Object.keys(HAWKINS_SCALE).length +
      Object.keys(TRANG_THAI_NGUY_HIEM).length +
      Object.keys(MAJOR_ARCANA_TAROT).length +
      Object.keys(DA_PHONG_THUY_TRADING).length +
      Object.keys(BAT_QUAI_CO_BAN).length,
  };
}

// ============================================================
// RE-EXPORT ALL
// ============================================================

// Trading Knowledge Exports
export {
  // Constants
  TIER_REQUIREMENTS,
  FORMULA_TYPES,
  FREQUENCY_FORMULAS,
  BASIC_FORMULAS,
  ZONE_CONCEPTS,

  // Functions
  checkTierAccess,
  getUpgradeMessage,
  getAllFormulas,
  getFormulaById,
  searchFormulas,
  getRelatedFormulas,
  getFormulasByType,
  getFormulasByTier,
  getFrequencyFormulas,
  formatForAIContext,
  buildKnowledgeContext,
};

// Spiritual Knowledge Exports
export {
  // Constants
  HAWKINS_SCALE,
  TRANG_THAI_NGUY_HIEM,
  DA_PHONG_THUY_TRADING,
  MAJOR_ARCANA_TAROT,
  BAT_QUAI_CO_BAN,

  // Functions
  getHawkinsStateByFrequency,
  getTradingRuleByFrequency,
  checkTradingPermission,
  getStonesByPurpose,
  getTarotCard,
  drawRandomTarotCard,
  getKinhDichQue,
  searchSpiritualKnowledge,
};

// ============================================================
// DEFAULT EXPORT
// ============================================================

export default {
  // Unified functions
  searchAllKnowledge,
  getKnowledgeById,
  getSuPhuContent,
  getAllCategories,
  getCategoryItems,
  getKnowledgeStats,

  // Trading
  trading: {
    TIER_REQUIREMENTS,
    FORMULA_TYPES,
    FREQUENCY_FORMULAS,
    BASIC_FORMULAS,
    ZONE_CONCEPTS,
    checkTierAccess,
    getUpgradeMessage,
    getAllFormulas,
    getFormulaById,
    searchFormulas,
    getRelatedFormulas,
    getFormulasByType,
    getFormulasByTier,
    getFrequencyFormulas,
    formatForAIContext,
    buildKnowledgeContext,
  },

  // Spiritual
  spiritual: {
    HAWKINS_SCALE,
    TRANG_THAI_NGUY_HIEM,
    DA_PHONG_THUY_TRADING,
    MAJOR_ARCANA_TAROT,
    BAT_QUAI_CO_BAN,
    getHawkinsStateByFrequency,
    getTradingRuleByFrequency,
    checkTradingPermission,
    getStonesByPurpose,
    getTarotCard,
    drawRandomTarotCard,
    getKinhDichQue,
    searchSpiritualKnowledge,
  },
};
