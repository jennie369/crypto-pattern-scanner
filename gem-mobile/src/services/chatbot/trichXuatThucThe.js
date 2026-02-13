/**
 * DICH VU TRICH XUAT THUC THE
 * Entity Extraction Service for GEM Master Chatbot
 *
 * Nhan dang cac thuc the tu tin nhan nguoi dung:
 * - DONG_COIN: BTC, ETH, SOL, etc.
 * - KHUNG_THOI_GIAN: 1m, 5m, 1h, 4h, etc.
 * - CONG_THUC: DPD, UPU, HFZ, etc.
 * - VUNG_GIA: vung cung, vung cau, etc.
 * - LA_TAROT: 22 Major Arcana cards
 * - DA_PHONG_THUY: thach anh tim, tourmaline den, etc.
 * - TAN_SO: Hawkins frequency values (20-700 Hz)
 *
 * Performance target: < 10ms
 *
 * @version 1.0.0
 * @date 2026-01-28
 */

// ===========================================
// ENTITY TYPE DEFINITIONS
// ===========================================

/**
 * DONG_COIN - Cryptocurrency symbols
 */
export const DONG_COIN_CONFIG = {
  // Main symbols
  symbols: [
    'BTC', 'ETH', 'SOL', 'BNB', 'XRP', 'ADA', 'DOGE',
    'AVAX', 'DOT', 'MATIC', 'LINK', 'UNI', 'ATOM', 'LTC',
    'SHIB', 'TRX', 'NEAR', 'APT', 'ARB', 'OP', 'INJ',
  ],
  // Vietnamese variants mapping
  vietnamese: {
    'bitcoin': 'BTC',
    'bit coin': 'BTC',
    'ethereum': 'ETH',
    'solana': 'SOL',
    'binance coin': 'BNB',
    'ripple': 'XRP',
    'cardano': 'ADA',
    'dogecoin': 'DOGE',
    'doge coin': 'DOGE',
    'polkadot': 'DOT',
    'chainlink': 'LINK',
    'polygon': 'MATIC',
    'avalanche': 'AVAX',
    'uniswap': 'UNI',
  },
  // Regex pattern - matches symbols with optional USDT suffix
  regex: /\b(BTC|ETH|SOL|BNB|XRP|ADA|DOGE|AVAX|DOT|MATIC|LINK|UNI|ATOM|LTC|SHIB|TRX|NEAR|APT|ARB|OP|INJ)(?:USDT|USD|BUSD)?\b/gi,
};

/**
 * KHUNG_THOI_GIAN - Timeframes
 */
export const KHUNG_THOI_GIAN_CONFIG = {
  // Standard timeframes
  standard: ['1m', '5m', '15m', '30m', '1h', '4h', '1d', '1w', '1M'],
  // Vietnamese mapping
  vietnamese: {
    '1 phut': '1m', 'mot phut': '1m', '1phut': '1m',
    '5 phut': '5m', 'nam phut': '5m', '5phut': '5m',
    '15 phut': '15m', 'muoi lam phut': '15m', '15phut': '15m',
    '30 phut': '30m', 'ba muoi phut': '30m', '30phut': '30m',
    '1 gio': '1h', 'mot gio': '1h', '1gio': '1h', '1 tieng': '1h',
    '4 gio': '4h', 'bon gio': '4h', '4gio': '4h', '4 tieng': '4h',
    'ngay': '1d', 'hang ngay': '1d', 'daily': '1d', '1 ngay': '1d',
    'tuan': '1w', 'hang tuan': '1w', 'weekly': '1w', '1 tuan': '1w',
    'thang': '1M', 'hang thang': '1M', 'monthly': '1M', '1 thang': '1M',
  },
  // Regex patterns
  regexStandard: /\b(1m|5m|15m|30m|1h|4h|1d|1w|1M)\b/gi,
  regexVietnamese: /\b(\d+)\s*(phut|gio|tieng|ngay|tuan|thang)\b/gi,
};

/**
 * CONG_THUC - GEM Trading Formulas
 */
export const CONG_THUC_CONFIG = {
  // Frequency formulas (TIER2)
  frequency: ['DPD', 'UPU', 'UPD', 'DPU', 'HFZ', 'LFZ'],
  // Other formulas
  other: ['DBD', 'UBU', 'RBD', 'DBR', 'RBR', 'FTR', 'FTB'],
  // Vietnamese mapping
  vietnamese: {
    'giam nghi giam': 'DPD',
    'tang nghi tang': 'UPU',
    'tang nghi giam': 'UPD',
    'giam nghi tang': 'DPU',
    'vung tan so cao': 'HFZ',
    'vung tan so thap': 'LFZ',
    'down pause down': 'DPD',
    'up pause up': 'UPU',
    'up pause down': 'UPD',
    'down pause up': 'DPU',
    'high frequency zone': 'HFZ',
    'low frequency zone': 'LFZ',
    'dau vai': 'HEAD_SHOULDERS',
    'head and shoulders': 'HEAD_SHOULDERS',
    'hai dinh': 'DOUBLE_TOP',
    'double top': 'DOUBLE_TOP',
    'hai day': 'DOUBLE_BOTTOM',
    'double bottom': 'DOUBLE_BOTTOM',
  },
  // Regex pattern
  regex: /\b(DPD|UPU|UPD|DPU|HFZ|LFZ|DBD|UBU|RBD|DBR|RBR|FTR|FTB)\b/gi,
};

/**
 * VUNG_GIA - Price Zones
 */
export const VUNG_GIA_CONFIG = {
  keywords: {
    'vung cung': { type: 'SUPPLY', normalized: 'SUPPLY_ZONE' },
    'supply zone': { type: 'SUPPLY', normalized: 'SUPPLY_ZONE' },
    'supply': { type: 'SUPPLY', normalized: 'SUPPLY_ZONE' },
    'vung cau': { type: 'DEMAND', normalized: 'DEMAND_ZONE' },
    'demand zone': { type: 'DEMAND', normalized: 'DEMAND_ZONE' },
    'demand': { type: 'DEMAND', normalized: 'DEMAND_ZONE' },
    'khang cu': { type: 'RESISTANCE', normalized: 'RESISTANCE' },
    'resistance': { type: 'RESISTANCE', normalized: 'RESISTANCE' },
    'ho tro': { type: 'SUPPORT', normalized: 'SUPPORT' },
    'support': { type: 'SUPPORT', normalized: 'SUPPORT' },
    'vung moi': { type: 'FRESH', normalized: 'FRESH_ZONE' },
    'fresh zone': { type: 'FRESH', normalized: 'FRESH_ZONE' },
    'vung da test': { type: 'TESTED', normalized: 'TESTED_ZONE' },
    'vung da kiem tra': { type: 'TESTED', normalized: 'TESTED_ZONE' },
    'tested zone': { type: 'TESTED', normalized: 'TESTED_ZONE' },
    'breakout': { type: 'BREAKOUT', normalized: 'BREAKOUT' },
    'pha vo': { type: 'BREAKOUT', normalized: 'BREAKOUT' },
  },
};

/**
 * LA_TAROT - Major Arcana Cards (22 cards)
 */
export const LA_TAROT_CONFIG = {
  majorArcana: {
    'nguoi kho': { number: 0, name: 'The Fool', vi: 'Nguoi Kho' },
    'the fool': { number: 0, name: 'The Fool', vi: 'Nguoi Kho' },
    'ke ngoc': { number: 0, name: 'The Fool', vi: 'Ke Ngoc' },
    'phap su': { number: 1, name: 'The Magician', vi: 'Phap Su' },
    'the magician': { number: 1, name: 'The Magician', vi: 'Phap Su' },
    'nu tu si': { number: 2, name: 'The High Priestess', vi: 'Nu Tu Si' },
    'high priestess': { number: 2, name: 'The High Priestess', vi: 'Nu Tu Si' },
    'hoang hau': { number: 3, name: 'The Empress', vi: 'Hoang Hau' },
    'the empress': { number: 3, name: 'The Empress', vi: 'Hoang Hau' },
    'hoang de': { number: 4, name: 'The Emperor', vi: 'Hoang De' },
    'the emperor': { number: 4, name: 'The Emperor', vi: 'Hoang De' },
    'giao hoang': { number: 5, name: 'The Hierophant', vi: 'Giao Hoang' },
    'the hierophant': { number: 5, name: 'The Hierophant', vi: 'Giao Hoang' },
    'nguoi tinh': { number: 6, name: 'The Lovers', vi: 'Nguoi Tinh' },
    'the lovers': { number: 6, name: 'The Lovers', vi: 'Nguoi Tinh' },
    'co xe': { number: 7, name: 'The Chariot', vi: 'Co Xe' },
    'the chariot': { number: 7, name: 'The Chariot', vi: 'Co Xe' },
    'suc manh': { number: 8, name: 'Strength', vi: 'Suc Manh' },
    'strength': { number: 8, name: 'Strength', vi: 'Suc Manh' },
    'an si': { number: 9, name: 'The Hermit', vi: 'An Si' },
    'the hermit': { number: 9, name: 'The Hermit', vi: 'An Si' },
    'vong quay van menh': { number: 10, name: 'Wheel of Fortune', vi: 'Vong Quay Van Menh' },
    'wheel of fortune': { number: 10, name: 'Wheel of Fortune', vi: 'Vong Quay Van Menh' },
    'cong ly': { number: 11, name: 'Justice', vi: 'Cong Ly' },
    'justice': { number: 11, name: 'Justice', vi: 'Cong Ly' },
    'treo nguoc': { number: 12, name: 'The Hanged Man', vi: 'Treo Nguoc' },
    'the hanged man': { number: 12, name: 'The Hanged Man', vi: 'Treo Nguoc' },
    'than chet': { number: 13, name: 'Death', vi: 'Than Chet' },
    'death': { number: 13, name: 'Death', vi: 'Than Chet' },
    'tiet che': { number: 14, name: 'Temperance', vi: 'Tiet Che' },
    'dieu do': { number: 14, name: 'Temperance', vi: 'Dieu Do' },
    'temperance': { number: 14, name: 'Temperance', vi: 'Tiet Che' },
    'ac quy': { number: 15, name: 'The Devil', vi: 'Ac Quy' },
    'the devil': { number: 15, name: 'The Devil', vi: 'Ac Quy' },
    'thap': { number: 16, name: 'The Tower', vi: 'Thap' },
    'the tower': { number: 16, name: 'The Tower', vi: 'Thap' },
    'ngoi sao': { number: 17, name: 'The Star', vi: 'Ngoi Sao' },
    'the star': { number: 17, name: 'The Star', vi: 'Ngoi Sao' },
    'mat trang': { number: 18, name: 'The Moon', vi: 'Mat Trang' },
    'the moon': { number: 18, name: 'The Moon', vi: 'Mat Trang' },
    'mat troi': { number: 19, name: 'The Sun', vi: 'Mat Troi' },
    'the sun': { number: 19, name: 'The Sun', vi: 'Mat Troi' },
    'phan xet': { number: 20, name: 'Judgement', vi: 'Phan Xet' },
    'judgement': { number: 20, name: 'Judgement', vi: 'Phan Xet' },
    'the gioi': { number: 21, name: 'The World', vi: 'The Gioi' },
    'the world': { number: 21, name: 'The World', vi: 'The Gioi' },
  },
};

/**
 * DA_PHONG_THUY - Feng Shui Crystals
 */
export const DA_PHONG_THUY_CONFIG = {
  crystals: {
    'thach anh tim': { en: 'Amethyst', property: 'calm', chakra: 'third_eye' },
    'amethyst': { en: 'Amethyst', property: 'calm', chakra: 'third_eye' },
    'thach anh vang': { en: 'Citrine', property: 'abundance', chakra: 'solar_plexus' },
    'citrine': { en: 'Citrine', property: 'abundance', chakra: 'solar_plexus' },
    'thach anh hong': { en: 'Rose Quartz', property: 'love', chakra: 'heart' },
    'rose quartz': { en: 'Rose Quartz', property: 'love', chakra: 'heart' },
    'thach anh trang': { en: 'Clear Quartz', property: 'clarity', chakra: 'crown' },
    'clear quartz': { en: 'Clear Quartz', property: 'clarity', chakra: 'crown' },
    'tourmaline den': { en: 'Black Tourmaline', property: 'protection', chakra: 'root' },
    'black tourmaline': { en: 'Black Tourmaline', property: 'protection', chakra: 'root' },
    'mat ho': { en: 'Tiger Eye', property: 'courage', chakra: 'solar_plexus' },
    'tiger eye': { en: 'Tiger Eye', property: 'courage', chakra: 'solar_plexus' },
    'obsidian': { en: 'Obsidian', property: 'grounding', chakra: 'root' },
    'obsidian den': { en: 'Black Obsidian', property: 'grounding', chakra: 'root' },
    'ma nao': { en: 'Agate', property: 'balance', chakra: 'varies' },
    'agate': { en: 'Agate', property: 'balance', chakra: 'varies' },
    'ngoc bich': { en: 'Jade', property: 'prosperity', chakra: 'heart' },
    'jade': { en: 'Jade', property: 'prosperity', chakra: 'heart' },
    'lapis lazuli': { en: 'Lapis Lazuli', property: 'wisdom', chakra: 'third_eye' },
  },
};

/**
 * TAN_SO - Hawkins Frequency Scale
 */
export const TAN_SO_CONFIG = {
  // Hawkins Scale ranges
  ranges: {
    shame: { min: 20, max: 30, vi: 'Xau ho/Toi loi' },
    guilt: { min: 30, max: 50, vi: 'Toi loi' },
    apathy: { min: 50, max: 75, vi: 'Tho o' },
    grief: { min: 75, max: 100, vi: 'Dau buon' },
    fear: { min: 100, max: 125, vi: 'So hai' },
    desire: { min: 125, max: 150, vi: 'Khao khat' },
    anger: { min: 150, max: 175, vi: 'Tuc gian' },
    pride: { min: 175, max: 200, vi: 'Kieu ngao' },
    courage: { min: 200, max: 250, vi: 'Can dam' },
    neutrality: { min: 250, max: 310, vi: 'Trung lap' },
    willingness: { min: 310, max: 350, vi: 'San sang' },
    acceptance: { min: 350, max: 400, vi: 'Chap nhan' },
    reason: { min: 400, max: 500, vi: 'Ly tri' },
    love: { min: 500, max: 540, vi: 'Tinh yeu' },
    joy: { min: 540, max: 600, vi: 'Hanh phuc' },
    peace: { min: 600, max: 700, vi: 'Binh an' },
    enlightenment: { min: 700, max: 1000, vi: 'Giac ngo' },
  },
  // Regex patterns
  regexHz: /\b(\d{2,3})\s*(hz|Hz|HZ|hertz)\b/gi,
  regexVietnamese: /\btan so\s*[:=]?\s*(\d{2,3})\b/gi,
};

// ===========================================
// ENTITY TYPES ENUM
// ===========================================

export const ENTITY_TYPES = {
  DONG_COIN: 'DONG_COIN',
  KHUNG_THOI_GIAN: 'KHUNG_THOI_GIAN',
  CONG_THUC: 'CONG_THUC',
  VUNG_GIA: 'VUNG_GIA',
  LA_TAROT: 'LA_TAROT',
  DA_PHONG_THUY: 'DA_PHONG_THUY',
  TAN_SO: 'TAN_SO',
};

// ===========================================
// NORMALIZE ENTITY HELPER
// ===========================================

/**
 * Normalize entity value to standard format
 * @param {string} type - Entity type
 * @param {string} value - Raw value
 * @returns {string} Normalized value
 */
export function normalizeEntity(type, value) {
  if (!value) return value;

  switch (type) {
    case ENTITY_TYPES.DONG_COIN:
      // Uppercase and remove USDT suffix
      return value.toUpperCase().replace(/USDT|USD|BUSD$/i, '');

    case ENTITY_TYPES.KHUNG_THOI_GIAN:
      // Normalize to standard format
      const tfLower = value.toLowerCase();
      if (KHUNG_THOI_GIAN_CONFIG.vietnamese[tfLower]) {
        return KHUNG_THOI_GIAN_CONFIG.vietnamese[tfLower];
      }
      return value.toLowerCase();

    case ENTITY_TYPES.CONG_THUC:
      // Uppercase for formula codes
      const formulaLower = value.toLowerCase();
      if (CONG_THUC_CONFIG.vietnamese[formulaLower]) {
        return CONG_THUC_CONFIG.vietnamese[formulaLower];
      }
      return value.toUpperCase();

    case ENTITY_TYPES.VUNG_GIA:
      // Lowercase for zones
      return value.toLowerCase();

    case ENTITY_TYPES.LA_TAROT:
      // Keep original format
      return value;

    case ENTITY_TYPES.DA_PHONG_THUY:
      // Lowercase for stones
      return value.toLowerCase();

    case ENTITY_TYPES.TAN_SO:
      // Extract number
      const match = value.match(/\d+/);
      return match ? parseInt(match[0], 10) : value;

    default:
      return value;
  }
}

// ===========================================
// REFERENCE PRONOUNS FOR RESOLUTION
// ===========================================

export const REFERENCE_PRONOUNS = {
  DONG_COIN: ['no', 'coin do', 'dong do', 'con nay', 'cai do', 'symbol do', 'dong coin do'],
  CONG_THUC: ['cong thuc do', 'mau do', 'pattern do', 'setup do', 'mo hinh do'],
  LA_TAROT: ['la do', 'bai do', 'que do', 'la nay'],
  KHUNG_THOI_GIAN: ['khung do', 'timeframe do', 'khung thoi gian do'],
  VUNG_GIA: ['vung do', 'zone do', 'level do'],
};

// ===========================================
// CACHING
// ===========================================

const cache = new Map();
const CACHE_TTL = 60000; // 60 seconds
const CACHE_MAX_SIZE = 500;

function getCacheKey(text) {
  return text.toLowerCase().trim().slice(0, 100);
}

function getFromCache(key) {
  const item = cache.get(key);
  if (!item) return null;
  if (Date.now() > item.expiry) {
    cache.delete(key);
    return null;
  }
  return item.value;
}

function setCache(key, value) {
  // LRU: Remove oldest if at max
  if (cache.size >= CACHE_MAX_SIZE) {
    const firstKey = cache.keys().next().value;
    cache.delete(firstKey);
  }
  cache.set(key, {
    value,
    expiry: Date.now() + CACHE_TTL,
  });
}

// ===========================================
// NORMALIZATION FUNCTIONS
// ===========================================

/**
 * Normalize text for Vietnamese (remove diacritics for matching)
 */
function removeVietnameseDiacritics(str) {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase();
}

/**
 * Normalize DONG_COIN
 */
function normalizeDongCoin(text) {
  const upper = text.toUpperCase().replace(/USDT|USD|BUSD/g, '');
  if (DONG_COIN_CONFIG.symbols.includes(upper)) {
    return upper;
  }
  const normalized = removeVietnameseDiacritics(text);
  return DONG_COIN_CONFIG.vietnamese[normalized] || upper;
}

/**
 * Normalize KHUNG_THOI_GIAN
 */
function normalizeKhungThoiGian(text) {
  const lower = text.toLowerCase().trim();

  // Check standard format
  if (KHUNG_THOI_GIAN_CONFIG.standard.includes(lower)) {
    return lower;
  }

  // Check Vietnamese mapping
  const normalized = removeVietnameseDiacritics(lower);
  if (KHUNG_THOI_GIAN_CONFIG.vietnamese[normalized]) {
    return KHUNG_THOI_GIAN_CONFIG.vietnamese[normalized];
  }

  // Parse numeric format like "4 gio" -> "4h"
  const match = text.match(/(\d+)\s*(phut|gio|tieng|ngay|tuan|thang)/i);
  if (match) {
    const num = match[1];
    const unit = removeVietnameseDiacritics(match[2]);
    const unitMap = {
      'phut': 'm',
      'gio': 'h',
      'tieng': 'h',
      'ngay': 'd',
      'tuan': 'w',
      'thang': 'M',
    };
    return `${num}${unitMap[unit] || unit}`;
  }

  return lower;
}

/**
 * Normalize CONG_THUC
 */
function normalizeCongThuc(text) {
  const upper = text.toUpperCase();
  if ([...CONG_THUC_CONFIG.frequency, ...CONG_THUC_CONFIG.other].includes(upper)) {
    return upper;
  }
  const normalized = removeVietnameseDiacritics(text);
  return CONG_THUC_CONFIG.vietnamese[normalized] || upper;
}

/**
 * Normalize VUNG_GIA
 */
function normalizeVungGia(text) {
  const normalized = removeVietnameseDiacritics(text);
  const config = VUNG_GIA_CONFIG.keywords[normalized];
  return config ? config.normalized : text.toLowerCase();
}

/**
 * Normalize LA_TAROT
 */
function normalizeLaTarot(text) {
  const normalized = removeVietnameseDiacritics(text);
  const card = LA_TAROT_CONFIG.majorArcana[normalized];
  return card ? { number: card.number, name: card.name, vi: card.vi } : null;
}

/**
 * Normalize DA_PHONG_THUY
 */
function normalizeDaPhongThuy(text) {
  const normalized = removeVietnameseDiacritics(text);
  const crystal = DA_PHONG_THUY_CONFIG.crystals[normalized];
  return crystal ? crystal.en : text.toLowerCase();
}

/**
 * Normalize TAN_SO (extract Hz value and find Hawkins level)
 */
function normalizeTanSo(text) {
  const match = text.match(/(\d{2,3})/);
  if (!match) return null;

  const hz = parseInt(match[1], 10);

  // Find Hawkins level
  for (const [level, range] of Object.entries(TAN_SO_CONFIG.ranges)) {
    if (hz >= range.min && hz < range.max) {
      return { hz, level, vi: range.vi };
    }
  }

  return { hz, level: 'unknown', vi: 'Khong xac dinh' };
}

// ===========================================
// EXTRACTION FUNCTIONS
// ===========================================

/**
 * Extract DONG_COIN entities
 */
function extractDongCoin(text) {
  const results = [];
  const normalizedText = removeVietnameseDiacritics(text);

  // Match symbols
  const symbolMatches = text.matchAll(DONG_COIN_CONFIG.regex);
  for (const match of symbolMatches) {
    results.push({
      type: 'DONG_COIN',
      text: match[0],
      normalized: normalizeDongCoin(match[0]),
      startIndex: match.index,
      endIndex: match.index + match[0].length,
      confidence: 0.95,
    });
  }

  // Match Vietnamese names
  for (const [vn, symbol] of Object.entries(DONG_COIN_CONFIG.vietnamese)) {
    if (normalizedText.includes(vn)) {
      const idx = normalizedText.indexOf(vn);
      results.push({
        type: 'DONG_COIN',
        text: vn,
        normalized: symbol,
        startIndex: idx,
        endIndex: idx + vn.length,
        confidence: 0.85,
      });
    }
  }

  // Remove duplicates by normalized value
  const unique = [];
  const seen = new Set();
  for (const r of results) {
    if (!seen.has(r.normalized)) {
      seen.add(r.normalized);
      unique.push(r);
    }
  }

  return unique;
}

/**
 * Extract KHUNG_THOI_GIAN entities
 */
function extractKhungThoiGian(text) {
  const results = [];
  const normalizedText = removeVietnameseDiacritics(text);

  // Match standard format
  const standardMatches = text.matchAll(KHUNG_THOI_GIAN_CONFIG.regexStandard);
  for (const match of standardMatches) {
    results.push({
      type: 'KHUNG_THOI_GIAN',
      text: match[0],
      normalized: normalizeKhungThoiGian(match[0]),
      startIndex: match.index,
      endIndex: match.index + match[0].length,
      confidence: 0.95,
    });
  }

  // Match Vietnamese format
  const vnMatches = text.matchAll(KHUNG_THOI_GIAN_CONFIG.regexVietnamese);
  for (const match of vnMatches) {
    results.push({
      type: 'KHUNG_THOI_GIAN',
      text: match[0],
      normalized: normalizeKhungThoiGian(match[0]),
      startIndex: match.index,
      endIndex: match.index + match[0].length,
      confidence: 0.85,
    });
  }

  // Remove duplicates
  const unique = [];
  const seen = new Set();
  for (const r of results) {
    if (!seen.has(r.normalized)) {
      seen.add(r.normalized);
      unique.push(r);
    }
  }

  return unique;
}

/**
 * Extract CONG_THUC entities
 */
function extractCongThuc(text) {
  const results = [];
  const normalizedText = removeVietnameseDiacritics(text);

  // Match codes
  const codeMatches = text.matchAll(CONG_THUC_CONFIG.regex);
  for (const match of codeMatches) {
    results.push({
      type: 'CONG_THUC',
      text: match[0],
      normalized: normalizeCongThuc(match[0]),
      startIndex: match.index,
      endIndex: match.index + match[0].length,
      confidence: 0.95,
      isFrequency: CONG_THUC_CONFIG.frequency.includes(match[0].toUpperCase()),
    });
  }

  // Match Vietnamese names
  for (const [vn, code] of Object.entries(CONG_THUC_CONFIG.vietnamese)) {
    if (normalizedText.includes(vn)) {
      const idx = normalizedText.indexOf(vn);
      results.push({
        type: 'CONG_THUC',
        text: vn,
        normalized: code,
        startIndex: idx,
        endIndex: idx + vn.length,
        confidence: 0.85,
        isFrequency: CONG_THUC_CONFIG.frequency.includes(code),
      });
    }
  }

  // Remove duplicates
  const unique = [];
  const seen = new Set();
  for (const r of results) {
    if (!seen.has(r.normalized)) {
      seen.add(r.normalized);
      unique.push(r);
    }
  }

  return unique;
}

/**
 * Extract VUNG_GIA entities
 */
function extractVungGia(text) {
  const results = [];
  const normalizedText = removeVietnameseDiacritics(text);

  for (const [keyword, config] of Object.entries(VUNG_GIA_CONFIG.keywords)) {
    if (normalizedText.includes(keyword)) {
      const idx = normalizedText.indexOf(keyword);
      results.push({
        type: 'VUNG_GIA',
        text: keyword,
        normalized: config.normalized,
        zoneType: config.type,
        startIndex: idx,
        endIndex: idx + keyword.length,
        confidence: 0.90,
      });
    }
  }

  // Remove duplicates
  const unique = [];
  const seen = new Set();
  for (const r of results) {
    if (!seen.has(r.normalized)) {
      seen.add(r.normalized);
      unique.push(r);
    }
  }

  return unique;
}

/**
 * Extract LA_TAROT entities
 */
function extractLaTarot(text) {
  const results = [];
  const normalizedText = removeVietnameseDiacritics(text);

  for (const [keyword, card] of Object.entries(LA_TAROT_CONFIG.majorArcana)) {
    if (normalizedText.includes(keyword)) {
      const idx = normalizedText.indexOf(keyword);
      results.push({
        type: 'LA_TAROT',
        text: keyword,
        normalized: card.name,
        cardNumber: card.number,
        vi: card.vi,
        startIndex: idx,
        endIndex: idx + keyword.length,
        confidence: 0.90,
      });
    }
  }

  // Remove duplicates by card number
  const unique = [];
  const seen = new Set();
  for (const r of results) {
    if (!seen.has(r.cardNumber)) {
      seen.add(r.cardNumber);
      unique.push(r);
    }
  }

  return unique;
}

/**
 * Extract DA_PHONG_THUY entities
 */
function extractDaPhongThuy(text) {
  const results = [];
  const normalizedText = removeVietnameseDiacritics(text);

  for (const [keyword, crystal] of Object.entries(DA_PHONG_THUY_CONFIG.crystals)) {
    if (normalizedText.includes(keyword)) {
      const idx = normalizedText.indexOf(keyword);
      results.push({
        type: 'DA_PHONG_THUY',
        text: keyword,
        normalized: crystal.en,
        property: crystal.property,
        chakra: crystal.chakra,
        startIndex: idx,
        endIndex: idx + keyword.length,
        confidence: 0.90,
      });
    }
  }

  // Remove duplicates by English name
  const unique = [];
  const seen = new Set();
  for (const r of results) {
    if (!seen.has(r.normalized)) {
      seen.add(r.normalized);
      unique.push(r);
    }
  }

  return unique;
}

/**
 * Extract TAN_SO entities
 */
function extractTanSo(text) {
  const results = [];

  // Match Hz patterns
  const hzMatches = text.matchAll(TAN_SO_CONFIG.regexHz);
  for (const match of hzMatches) {
    const normalized = normalizeTanSo(match[0]);
    if (normalized) {
      results.push({
        type: 'TAN_SO',
        text: match[0],
        normalized: normalized.hz,
        hawkinsLevel: normalized.level,
        vi: normalized.vi,
        startIndex: match.index,
        endIndex: match.index + match[0].length,
        confidence: 0.95,
      });
    }
  }

  // Match Vietnamese format
  const vnMatches = text.matchAll(TAN_SO_CONFIG.regexVietnamese);
  for (const match of vnMatches) {
    const normalized = normalizeTanSo(match[0]);
    if (normalized) {
      results.push({
        type: 'TAN_SO',
        text: match[0],
        normalized: normalized.hz,
        hawkinsLevel: normalized.level,
        vi: normalized.vi,
        startIndex: match.index,
        endIndex: match.index + match[0].length,
        confidence: 0.85,
      });
    }
  }

  // Remove duplicates by Hz value
  const unique = [];
  const seen = new Set();
  for (const r of results) {
    if (!seen.has(r.normalized)) {
      seen.add(r.normalized);
      unique.push(r);
    }
  }

  return unique;
}

// ===========================================
// MAIN EXTRACTION FUNCTION
// ===========================================

/**
 * Extract all entities from a message
 * @param {string} text - User message
 * @param {Object} options - Extraction options
 * @returns {Object} Extraction result with entities by type
 */
export function trichXuatThucThe(text, options = {}) {
  const startTime = Date.now();

  // Early exit for short/empty messages
  if (!text || text.length < 2) {
    return {
      entities: [],
      byType: {},
      processingTimeMs: Date.now() - startTime,
    };
  }

  // Check cache
  const cacheKey = getCacheKey(text);
  const cached = getFromCache(cacheKey);
  if (cached) {
    return {
      ...cached,
      fromCache: true,
      processingTimeMs: Date.now() - startTime,
    };
  }

  // Extract all entity types
  const allEntities = [];
  const byType = {};

  // DONG_COIN
  const coins = extractDongCoin(text);
  if (coins.length > 0) {
    byType.DONG_COIN = coins;
    allEntities.push(...coins);
  }

  // KHUNG_THOI_GIAN
  const timeframes = extractKhungThoiGian(text);
  if (timeframes.length > 0) {
    byType.KHUNG_THOI_GIAN = timeframes;
    allEntities.push(...timeframes);
  }

  // CONG_THUC
  const formulas = extractCongThuc(text);
  if (formulas.length > 0) {
    byType.CONG_THUC = formulas;
    allEntities.push(...formulas);
  }

  // VUNG_GIA
  const zones = extractVungGia(text);
  if (zones.length > 0) {
    byType.VUNG_GIA = zones;
    allEntities.push(...zones);
  }

  // LA_TAROT
  const tarot = extractLaTarot(text);
  if (tarot.length > 0) {
    byType.LA_TAROT = tarot;
    allEntities.push(...tarot);
  }

  // DA_PHONG_THUY
  const crystals = extractDaPhongThuy(text);
  if (crystals.length > 0) {
    byType.DA_PHONG_THUY = crystals;
    allEntities.push(...crystals);
  }

  // TAN_SO
  const frequencies = extractTanSo(text);
  if (frequencies.length > 0) {
    byType.TAN_SO = frequencies;
    allEntities.push(...frequencies);
  }

  const result = {
    entities: allEntities,
    byType,
    entityCount: allEntities.length,
    processingTimeMs: Date.now() - startTime,
  };

  // Cache result
  setCache(cacheKey, result);

  return result;
}

// ===========================================
// REFERENCE RESOLUTION
// ===========================================

/**
 * Detect if message contains reference pronouns
 */
function detectReferencePronouns(text) {
  const normalizedText = removeVietnameseDiacritics(text);
  const detected = {};

  for (const [entityType, pronouns] of Object.entries(REFERENCE_PRONOUNS)) {
    for (const pronoun of pronouns) {
      if (normalizedText.includes(pronoun)) {
        detected[entityType] = pronoun;
        break;
      }
    }
  }

  return detected;
}

/**
 * Resolve references from conversation history
 * @param {string} text - Current message
 * @param {Array} conversationHistory - Previous messages
 * @returns {Object} Resolved entities
 */
export function giaiQuyetThamChieu(text, conversationHistory = []) {
  const detectedPronouns = detectReferencePronouns(text);
  const resolved = {};

  if (Object.keys(detectedPronouns).length === 0) {
    return resolved;
  }

  // Search backwards through history (last 10 messages)
  const recentHistory = conversationHistory.slice(-10).reverse();

  for (const [entityType, pronoun] of Object.entries(detectedPronouns)) {
    for (const message of recentHistory) {
      const content = message.content || message.text || '';
      const extraction = trichXuatThucThe(content);

      if (extraction.byType[entityType] && extraction.byType[entityType].length > 0) {
        const resolvedEntity = extraction.byType[entityType][0];
        resolved[entityType] = {
          ...resolvedEntity,
          resolvedFrom: 'history',
          pronoun,
          sourceMessage: content.slice(0, 50),
        };
        break;
      }
    }
  }

  return resolved;
}

// ===========================================
// HELPER FUNCTIONS
// ===========================================

/**
 * Check if entity type is trading-related
 */
export function isTradingEntity(type) {
  return ['DONG_COIN', 'KHUNG_THOI_GIAN', 'CONG_THUC', 'VUNG_GIA'].includes(type);
}

/**
 * Check if entity type is spiritual-related
 */
export function isSpiritualEntity(type) {
  return ['LA_TAROT', 'DA_PHONG_THUY', 'TAN_SO'].includes(type);
}

/**
 * Get primary domain from entities
 */
export function getPrimaryDomain(byType) {
  const tradingCount = Object.keys(byType).filter(isTradingEntity).length;
  const spiritualCount = Object.keys(byType).filter(isSpiritualEntity).length;

  if (tradingCount > spiritualCount) return 'TRADING';
  if (spiritualCount > tradingCount) return 'SPIRITUAL';
  if (tradingCount > 0) return 'TRADING';
  if (spiritualCount > 0) return 'SPIRITUAL';
  return 'GENERAL';
}

/**
 * Format entities for AI context
 */
export function formatEntitiesForContext(byType) {
  if (Object.keys(byType).length === 0) return '';

  let context = '\n## THUC THE DUOC NHAN DIEN:\n';

  for (const [type, entities] of Object.entries(byType)) {
    const values = entities.map(e => e.normalized).join(', ');
    context += `- ${type}: ${values}\n`;
  }

  return context;
}

// ===========================================
// EXPORTS
// ===========================================

export default {
  // Main functions
  trichXuatThucThe,
  giaiQuyetThamChieu,
  normalizeEntity,
  // Helper functions
  isTradingEntity,
  isSpiritualEntity,
  getPrimaryDomain,
  formatEntitiesForContext,
  // Constants
  ENTITY_TYPES,
  // Configs for external use
  DONG_COIN_CONFIG,
  KHUNG_THOI_GIAN_CONFIG,
  CONG_THUC_CONFIG,
  VUNG_GIA_CONFIG,
  LA_TAROT_CONFIG,
  DA_PHONG_THUY_CONFIG,
  TAN_SO_CONFIG,
  REFERENCE_PRONOUNS,
};
