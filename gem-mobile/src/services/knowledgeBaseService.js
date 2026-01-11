/**
 * Knowledge Base Service
 * Combines local data search with pgvector semantic search
 *
 * Features:
 * - Fast local keyword matching (< 5ms)
 * - Semantic search via pgvector (< 100ms)
 * - Crystal, Ngũ Hành, Zodiac knowledge
 * - FAQ and response templates
 *
 * Performance targets:
 * - Local search: < 5ms
 * - Semantic search: < 100ms
 */

import { supabase } from './supabase';
import { CRYSTAL_KNOWLEDGE, getCrystal, getCrystalsByKeyword, CRYSTAL_COMBOS } from '../data/crystalKnowledge';
import { NGU_HANH, calculateMenh, getMenh, getCrystalsForMenh, checkCrystalCompatibility } from '../data/nguHanhSystem';
import { ZODIACS, getZodiacByYear, getZodiac, getCrystalsForZodiac, checkCrystalZodiacCompatibility } from '../data/zodiacData';

// ===========================================
// LOCAL KNOWLEDGE SEARCH
// ===========================================

/**
 * Search crystals by keyword/intention
 * @param {string} query
 * @param {number} limit
 * @returns {Array} Matching crystals
 */
export function searchCrystals(query, limit = 5) {
  const startTime = Date.now();

  if (!query || typeof query !== 'string') {
    return { results: [], latency: 0 };
  }

  const normalizedQuery = query.toLowerCase().trim();
  const results = [];

  // Search by name
  for (const [id, crystal] of Object.entries(CRYSTAL_KNOWLEDGE)) {
    let score = 0;

    // Name matching
    if (crystal.name?.toLowerCase().includes(normalizedQuery)) {
      score += 0.8;
    }
    if (crystal.nameEn?.toLowerCase().includes(normalizedQuery)) {
      score += 0.6;
    }

    // Benefits matching
    for (const benefit of crystal.benefits || []) {
      if (benefit.toLowerCase().includes(normalizedQuery)) {
        score += 0.4;
        break;
      }
    }

    // Keyword matching
    if (score === 0) {
      const keywordResults = getCrystalsByKeyword(normalizedQuery);
      if (keywordResults.some(c => c.id === id)) {
        score += 0.5;
      }
    }

    if (score > 0) {
      results.push({ ...crystal, id, score });
    }
  }

  // Sort by score and limit
  results.sort((a, b) => b.score - a.score);

  return {
    results: results.slice(0, limit),
    latency: Date.now() - startTime,
    source: 'local',
  };
}

/**
 * Search by user's mệnh (element)
 * @param {string} menhId
 * @returns {Object} Recommendations
 */
export function searchByMenh(menhId) {
  const startTime = Date.now();
  const menh = getMenh(menhId);

  if (!menh) {
    return { results: [], latency: 0, error: 'Mệnh không hợp lệ' };
  }

  const crystals = getCrystalsForMenh(menhId);
  const mainCrystals = crystals.main.map(id => ({
    ...getCrystal(id),
    id,
    compatibility: 'excellent',
  })).filter(c => c.name);

  const supportCrystals = crystals.support.map(id => ({
    ...getCrystal(id),
    id,
    compatibility: 'good',
  })).filter(c => c.name);

  const avoidCrystals = crystals.avoid.map(id => ({
    ...getCrystal(id),
    id,
    compatibility: 'avoid',
  })).filter(c => c.name);

  return {
    menh: {
      id: menh.id,
      name: menh.name,
      nameEn: menh.nameEn,
      colors: menh.colors,
      personality: menh.personality,
    },
    recommended: mainCrystals,
    support: supportCrystals,
    avoid: avoidCrystals,
    template: menh.templates,
    latency: Date.now() - startTime,
    source: 'local',
  };
}

/**
 * Search by user's zodiac
 * @param {string} zodiacId
 * @returns {Object} Recommendations
 */
export function searchByZodiac(zodiacId) {
  const startTime = Date.now();
  const zodiac = getZodiac(zodiacId);

  if (!zodiac) {
    return { results: [], latency: 0, error: 'Tuổi không hợp lệ' };
  }

  const crystals = getCrystalsForZodiac(zodiacId);
  const mainCrystals = crystals.main.map(id => ({
    ...getCrystal(id),
    id,
    compatibility: 'excellent',
  })).filter(c => c.name);

  const supportCrystals = crystals.support.map(id => ({
    ...getCrystal(id),
    id,
    compatibility: 'good',
  })).filter(c => c.name);

  return {
    zodiac: {
      id: zodiac.id,
      name: zodiac.name,
      animal: zodiac.animal,
      element: zodiac.element,
      personality: zodiac.personality,
    },
    recommended: mainCrystals,
    support: supportCrystals,
    template: zodiac.templates,
    latency: Date.now() - startTime,
    source: 'local',
  };
}

/**
 * Search by birth year
 * @param {number} birthYear
 * @returns {Object} Combined menh + zodiac recommendations
 */
export function searchByBirthYear(birthYear) {
  const startTime = Date.now();

  // Get menh
  const menhResult = calculateMenh(birthYear);

  // Get zodiac
  const zodiac = getZodiacByYear(birthYear);

  if (!menhResult || !zodiac) {
    return { error: 'Năm sinh không hợp lệ', latency: 0 };
  }

  // Get crystal recommendations from both
  const menhCrystals = getCrystalsForMenh(menhResult.menh);
  const zodiacCrystals = getCrystalsForZodiac(zodiac.id);

  // Find crystals that match both
  const perfectMatch = menhCrystals.main.filter(c =>
    zodiacCrystals.main.includes(c) || zodiacCrystals.support.includes(c)
  );

  // Get unique recommendations
  const allRecommended = [...new Set([
    ...perfectMatch,
    ...menhCrystals.main,
    ...zodiacCrystals.main,
  ])].slice(0, 5);

  const recommendedCrystals = allRecommended.map(id => ({
    ...getCrystal(id),
    id,
    isPerfectMatch: perfectMatch.includes(id),
  })).filter(c => c.name);

  return {
    birthYear,
    menh: {
      id: menhResult.menh,
      name: menhResult.menhData.name,
      napAm: menhResult.napAmName,
    },
    zodiac: {
      id: zodiac.id,
      name: zodiac.name,
      animal: zodiac.animal,
    },
    recommended: recommendedCrystals,
    avoid: [
      ...menhCrystals.avoid,
      ...zodiacCrystals.avoid,
    ].filter((v, i, a) => a.indexOf(v) === i),
    latency: Date.now() - startTime,
    source: 'local',
  };
}

// ===========================================
// SEMANTIC SEARCH (pgvector)
// ===========================================

/**
 * Semantic search using pgvector
 * @param {string} query
 * @param {Object} options
 * @returns {Promise<Object>}
 */
export async function semanticSearch(query, options = {}) {
  const startTime = Date.now();
  const { limit = 5, threshold = 0.7, category = null } = options;

  try {
    // Call Supabase Edge Function for embedding + search
    const { data, error } = await supabase.functions.invoke('knowledge-search', {
      body: { query, limit, threshold, category },
    });

    if (error) throw error;

    return {
      results: data.results || [],
      latency: Date.now() - startTime,
      source: 'semantic',
    };
  } catch (error) {
    console.error('[KnowledgeBase] Semantic search error:', error);

    // Fallback to local search
    const localResults = searchCrystals(query, limit);
    return {
      ...localResults,
      source: 'local_fallback',
      error: error.message,
    };
  }
}

/**
 * Search FAQ database
 * @param {string} query
 * @returns {Promise<Object>}
 */
export async function searchFAQ(query) {
  const startTime = Date.now();

  try {
    // First try local FAQ matching
    const localFAQ = matchLocalFAQ(query);
    if (localFAQ) {
      return {
        result: localFAQ,
        latency: Date.now() - startTime,
        source: 'local_faq',
      };
    }

    // Try semantic search on FAQ table
    const { data, error } = await supabase.functions.invoke('faq-search', {
      body: { query },
    });

    if (error) throw error;

    return {
      result: data.faq || null,
      latency: Date.now() - startTime,
      source: 'semantic_faq',
    };
  } catch (error) {
    console.error('[KnowledgeBase] FAQ search error:', error);
    return {
      result: null,
      latency: Date.now() - startTime,
      error: error.message,
    };
  }
}

// ===========================================
// LOCAL FAQ DATABASE
// ===========================================

const LOCAL_FAQ = [
  {
    id: 'shipping_time',
    question: 'Giao hàng bao lâu?',
    keywords: ['giao hàng', 'ship', 'bao lâu', 'mấy ngày'],
    answer: 'Gemral ship toàn quốc! Nội thành 1-2 ngày, tỉnh xa 3-5 ngày ạ.',
  },
  {
    id: 'shipping_fee',
    question: 'Phí ship bao nhiêu?',
    keywords: ['phí ship', 'tiền ship', 'free ship'],
    answer: 'Free ship đơn từ 500k! Phí ship thường 25-35k tùy khu vực ạ.',
  },
  {
    id: 'payment_method',
    question: 'Thanh toán bằng gì?',
    keywords: ['thanh toán', 'trả tiền', 'payment', 'momo', 'chuyển khoản'],
    answer: 'Gemral nhận: Chuyển khoản, MoMo, ZaloPay, COD đều được ạ!',
  },
  {
    id: 'authentic',
    question: 'Đá có thật không?',
    keywords: ['thật', 'giả', 'fake', 'chứng nhận', 'authentic'],
    answer: 'Tất cả đá Gemral đều là đá thiên nhiên 100%, có giấy chứng nhận và bảo hành ạ.',
  },
  {
    id: 'return_policy',
    question: 'Có đổi trả không?',
    keywords: ['đổi', 'trả', 'hoàn tiền', 'return', 'refund'],
    answer: 'Gemral hỗ trợ đổi trả trong 7 ngày nếu sản phẩm lỗi hoặc không đúng mô tả ạ.',
  },
  {
    id: 'cleanse_crystal',
    question: 'Làm sao tẩy tế đá?',
    keywords: ['tẩy tế', 'thanh lọc', 'cleanse', 'nạp năng lượng'],
    answer: 'Có nhiều cách tẩy tế: Ngâm nước muối, phơi trăng, dùng xô thảo mộc, hoặc đặt trên thạch anh trắng ạ.',
  },
  {
    id: 'which_hand',
    question: 'Đeo tay nào?',
    keywords: ['tay nào', 'tay trái', 'tay phải', 'đeo'],
    answer: 'Thường đeo tay trái để nhận năng lượng, tay phải để phát năng lượng. Đá bảo vệ nên đeo tay phải ạ.',
  },
];

function matchLocalFAQ(query) {
  if (!query) return null;

  const normalizedQuery = query.toLowerCase();
  let bestMatch = null;
  let bestScore = 0;

  for (const faq of LOCAL_FAQ) {
    let score = 0;

    for (const keyword of faq.keywords) {
      if (normalizedQuery.includes(keyword)) {
        score += 1;
      }
    }

    if (score > bestScore) {
      bestScore = score;
      bestMatch = faq;
    }
  }

  return bestScore >= 1 ? bestMatch : null;
}

// ===========================================
// COMBINED SEARCH
// ===========================================

/**
 * Comprehensive knowledge search
 * Searches all sources and combines results
 *
 * @param {Object} params
 * @returns {Promise<Object>}
 */
export async function searchKnowledge({
  query,
  birthYear = null,
  menhId = null,
  zodiacId = null,
  crystalId = null,
  includeSemanticSearch = false,
}) {
  const startTime = Date.now();
  const results = {
    crystals: [],
    menh: null,
    zodiac: null,
    faq: null,
    combos: [],
  };

  // Parallel searches
  const searches = [];

  // Crystal search
  if (query) {
    searches.push(
      Promise.resolve(searchCrystals(query, 5)).then(r => {
        results.crystals = r.results;
      })
    );

    // FAQ search
    searches.push(
      searchFAQ(query).then(r => {
        results.faq = r.result;
      })
    );
  }

  // Birth year search
  if (birthYear) {
    searches.push(
      Promise.resolve(searchByBirthYear(birthYear)).then(r => {
        if (!r.error) {
          results.menh = r.menh;
          results.zodiac = r.zodiac;
          results.crystals = r.recommended;
        }
      })
    );
  }

  // Menh search
  if (menhId && !birthYear) {
    searches.push(
      Promise.resolve(searchByMenh(menhId)).then(r => {
        if (!r.error) {
          results.menh = r.menh;
          results.crystals = r.recommended;
        }
      })
    );
  }

  // Zodiac search
  if (zodiacId && !birthYear) {
    searches.push(
      Promise.resolve(searchByZodiac(zodiacId)).then(r => {
        if (!r.error) {
          results.zodiac = r.zodiac;
          if (!results.crystals.length) {
            results.crystals = r.recommended;
          }
        }
      })
    );
  }

  // Crystal compatibility check
  if (crystalId && (menhId || zodiacId)) {
    if (menhId) {
      const compat = checkCrystalCompatibility(crystalId, menhId);
      results.crystalMenhCompatibility = compat;
    }
    if (zodiacId) {
      const compat = checkCrystalZodiacCompatibility(crystalId, zodiacId);
      results.crystalZodiacCompatibility = compat;
    }
  }

  // Semantic search (optional, slower)
  if (includeSemanticSearch && query) {
    searches.push(
      semanticSearch(query, { limit: 3 }).then(r => {
        results.semanticResults = r.results;
      })
    );
  }

  // Wait for all searches
  await Promise.all(searches);

  // Add combo suggestions
  if (results.crystals.length > 0) {
    const firstCrystal = results.crystals[0]?.id;
    if (firstCrystal && CRYSTAL_COMBOS[firstCrystal]) {
      results.combos = CRYSTAL_COMBOS[firstCrystal];
    }
  }

  return {
    ...results,
    latency: Date.now() - startTime,
    query,
  };
}

// ===========================================
// HELPER FUNCTIONS
// ===========================================

/**
 * Extract birth year from message
 * @param {string} message
 * @returns {number|null}
 */
export function extractBirthYear(message) {
  if (!message) return null;

  // Match 4-digit year
  const yearMatch = message.match(/\b(19[5-9]\d|20[0-2]\d)\b/);
  if (yearMatch) {
    return parseInt(yearMatch[1]);
  }

  // Match 2-digit year (assume 19xx for > 30, 20xx for <= 30)
  const shortYearMatch = message.match(/\b(\d{2})\b/);
  if (shortYearMatch) {
    const shortYear = parseInt(shortYearMatch[1]);
    if (shortYear >= 0 && shortYear <= 99) {
      return shortYear > 30 ? 1900 + shortYear : 2000 + shortYear;
    }
  }

  return null;
}

/**
 * Extract mệnh from message
 * @param {string} message
 * @returns {string|null}
 */
export function extractMenh(message) {
  if (!message) return null;

  const menhPatterns = {
    kim: /mệnh\s*kim|kim\s*mệnh/i,
    moc: /mệnh\s*mộc|mộc\s*mệnh/i,
    thuy: /mệnh\s*th[uủ]y|th[uủ]y\s*mệnh/i,
    hoa: /mệnh\s*h[oỏ]a|h[oỏ]a\s*mệnh/i,
    tho: /mệnh\s*th[oổ]|th[oổ]\s*mệnh/i,
  };

  for (const [menhId, pattern] of Object.entries(menhPatterns)) {
    if (pattern.test(message)) {
      return menhId;
    }
  }

  return null;
}

/**
 * Extract zodiac from message
 * @param {string} message
 * @returns {string|null}
 */
export function extractZodiac(message) {
  if (!message) return null;

  const zodiacPatterns = {
    ty: /tuổi\s*t[yý]|t[yý]\s*tuổi|con\s*chuột/i,
    suu: /tuổi\s*sửu|sửu\s*tuổi|con\s*trâu/i,
    dan: /tuổi\s*d[aầ]n|d[aầ]n\s*tuổi|con\s*hổ/i,
    mao: /tuổi\s*m[aã]o|m[aã]o\s*tuổi|con\s*mèo/i,
    thin: /tuổi\s*th[iì]n|th[iì]n\s*tuổi|con\s*rồng/i,
    ti: /tuổi\s*t[iỵ]|t[iỵ]\s*tuổi|con\s*rắn/i,
    ngo: /tuổi\s*ng[oọ]|ng[oọ]\s*tuổi|con\s*ngựa/i,
    mui: /tuổi\s*m[uù]i|m[uù]i\s*tuổi|con\s*d[eê]/i,
    than: /tuổi\s*th[aâ]n|th[aâ]n\s*tuổi|con\s*khỉ/i,
    dau: /tuổi\s*d[aậ]u|d[aậ]u\s*tuổi|con\s*gà/i,
    tuat: /tuổi\s*tu[aấ]t|tu[aấ]t\s*tuổi|con\s*chó/i,
    hoi: /tuổi\s*h[oợ]i|h[oợ]i\s*tuổi|con\s*(heo|lợn)/i,
  };

  for (const [zodiacId, pattern] of Object.entries(zodiacPatterns)) {
    if (pattern.test(message)) {
      return zodiacId;
    }
  }

  return null;
}

// ===========================================
// EXPORT
// ===========================================

export default {
  // Local search
  searchCrystals,
  searchByMenh,
  searchByZodiac,
  searchByBirthYear,

  // Semantic search
  semanticSearch,
  searchFAQ,

  // Combined
  searchKnowledge,

  // Helpers
  extractBirthYear,
  extractMenh,
  extractZodiac,
};
