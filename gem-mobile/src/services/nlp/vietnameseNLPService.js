// =====================================================
// VIETNAMESE NLP SERVICE
// Xử lý ngôn ngữ tự nhiên tiếng Việt
// Dùng cho GEM Master Chatbot và AI Livestream
// =====================================================

import {
  SLANG_MAPPING,
  STOPWORDS,
  LOCATION_ABBREVIATIONS,
  VIETNAMESE_CITIES,
  TYPO_PATTERNS,
  VIETNAMESE_CHARS,
} from './nlpData';

/**
 * @typedef {Object} NLPResult
 * @property {string} original - Text gốc
 * @property {string} normalized - Text đã chuẩn hóa
 * @property {string[]} tokens - Danh sách tokens
 * @property {string[]} keywords - Danh sách keywords quan trọng
 * @property {Object[]} entities - Các entities phát hiện được
 * @property {string} language - Ngôn ngữ (vi/en)
 * @property {number} confidence - Độ tin cậy
 */

/**
 * Vietnamese NLP Service
 *
 * Chức năng:
 * - Chuẩn hóa text tiếng Việt (slang, typo)
 * - Tokenization
 * - Keyword extraction
 * - Entity detection (location, money, quantity, phone)
 * - Language detection
 *
 * @example
 * import { vietnameseNLP } from './services/nlp';
 *
 * const result = vietnameseNLP.process("còn hàng ko shop, mik ở HN");
 * // result.normalized = "còn hàng không shop, mình ở Hà Nội"
 * // result.entities = [{ text: "HN", label: "LOCATION", value: "Hà Nội" }]
 */
class VietnameseNLPService {
  constructor() {
    this.slangMapping = SLANG_MAPPING;
    this.stopwords = STOPWORDS;
    this.locationAbbreviations = LOCATION_ABBREVIATIONS;
    this.vietnameseCities = VIETNAMESE_CITIES;
    this.typoPatterns = TYPO_PATTERNS;
    this.vietnameseChars = VIETNAMESE_CHARS;

    // Cache cho performance
    this._slangKeys = Object.keys(SLANG_MAPPING);
    this._locationKeys = Object.keys(LOCATION_ABBREVIATIONS);
  }

  // ========== NORMALIZE TEXT ==========

  /**
   * Chuẩn hóa text tiếng Việt
   *
   * @param {string} text - Text gốc
   * @returns {string} - Text đã chuẩn hóa
   *
   * @example
   * normalizeText("còn hàng ko shop, mik ở HN")
   * // → "còn hàng không shop, mình ở Hà Nội"
   */
  normalizeText(text) {
    if (!text || typeof text !== 'string') {
      return '';
    }

    // 1. Trim và lowercase
    let normalized = text.trim().toLowerCase();

    // 2. Xóa khoảng trắng thừa
    normalized = normalized.replace(/\s+/g, ' ');

    // 3. Sửa lỗi chính tả
    normalized = this._fixTypos(normalized);

    // 4. Thay thế slang
    normalized = this._replaceSlang(normalized);

    // 5. Thay thế viết tắt địa danh
    normalized = this._replaceLocationAbbreviations(normalized);

    return normalized;
  }

  /**
   * Sửa lỗi chính tả thường gặp
   * @private
   */
  _fixTypos(text) {
    let fixed = text;

    for (const { pattern, replacement } of this.typoPatterns) {
      fixed = fixed.replace(pattern, replacement);
    }

    return fixed;
  }

  /**
   * Thay thế slang bằng từ chuẩn
   * @private
   */
  _replaceSlang(text) {
    const words = text.split(' ');
    const normalizedWords = words.map((word) => {
      // Xóa dấu câu ở cuối để match
      const punctuation = word.match(/[.,!?;:]+$/)?.[0] || '';
      const cleanWord = word.replace(/[.,!?;:]+$/, '');

      // Check slang mapping
      const mapped = this.slangMapping[cleanWord];
      if (mapped) {
        return mapped + punctuation;
      }

      return word;
    });

    return normalizedWords.join(' ');
  }

  /**
   * Thay thế viết tắt địa danh
   * @private
   */
  _replaceLocationAbbreviations(text) {
    const words = text.split(' ');
    const normalizedWords = words.map((word) => {
      const cleanWord = word.replace(/[.,!?;:]+$/, '');
      const punctuation = word.match(/[.,!?;:]+$/)?.[0] || '';

      const location = this.locationAbbreviations[cleanWord];
      if (location) {
        return location + punctuation;
      }

      return word;
    });

    return normalizedWords.join(' ');
  }

  // ========== TOKENIZATION ==========

  /**
   * Tách từ tiếng Việt (basic tokenization)
   *
   * @param {string} text - Text đã normalize
   * @returns {string[]} - Danh sách tokens
   *
   * @note Để tokenize chuẩn tiếng Việt cần VnCoreNLP (backend)
   *       Đây là basic tokenization cho frontend
   */
  tokenize(text) {
    if (!text) return [];

    // Split by space và punctuation
    const tokens = text
      .split(/[\s,.!?;:'"()[\]{}]+/)
      .filter((token) => token.length > 0);

    return tokens;
  }

  // ========== KEYWORD EXTRACTION ==========

  /**
   * Trích xuất keywords quan trọng từ text
   *
   * @param {string} text - Text đã normalize
   * @returns {string[]} - Danh sách keywords
   *
   * @example
   * extractKeywords("còn hàng không shop, giao hàng về Hà Nội")
   * // → ["hàng", "giao hàng", "Hà Nội"]
   */
  extractKeywords(text) {
    const tokens = this.tokenize(text);

    // Filter out stopwords và short tokens
    const keywords = tokens.filter((token) => {
      // Skip stopwords
      if (this.stopwords.has(token)) {
        return false;
      }

      // Skip very short tokens (< 2 chars)
      if (token.length < 2) {
        return false;
      }

      // Skip numbers only
      if (/^\d+$/.test(token)) {
        return false;
      }

      return true;
    });

    // Remove duplicates
    return [...new Set(keywords)];
  }

  // ========== ENTITY DETECTION ==========

  /**
   * Phát hiện entities trong text
   *
   * @param {string} text - Text gốc (chưa normalize)
   * @returns {Object[]} - Danh sách entities
   *
   * @example
   * detectEntities("giao về HN, 2 cái 500k")
   * // → [
   * //   { text: "HN", label: "LOCATION", value: "Hà Nội" },
   * //   { text: "2 cái", label: "QUANTITY", value: 2 },
   * //   { text: "500k", label: "MONEY", value: 500000 }
   * // ]
   */
  detectEntities(text) {
    if (!text) return [];

    const entities = [];
    const originalText = text;
    const tokens = this.tokenize(originalText.toLowerCase());

    // 1. Detect LOCATION
    this._detectLocations(tokens, originalText, entities);

    // 2. Detect PHONE
    this._detectPhones(originalText, entities);

    // 3. Detect MONEY
    this._detectMoney(originalText, entities);

    // 4. Detect QUANTITY
    this._detectQuantity(originalText, entities);

    // 5. Detect EMAIL
    this._detectEmails(originalText, entities);

    return entities;
  }

  /**
   * Detect địa điểm
   * @private
   */
  _detectLocations(tokens, originalText, entities) {
    // Check abbreviations
    for (const token of tokens) {
      const cleanToken = token.replace(/[.,!?;:]+$/, '');

      if (this.locationAbbreviations[cleanToken]) {
        entities.push({
          text: cleanToken,
          label: 'LOCATION',
          value: this.locationAbbreviations[cleanToken],
        });
      }
    }

    // Check full city names
    const textLower = originalText.toLowerCase();
    for (const city of this.vietnameseCities) {
      if (textLower.includes(city)) {
        // Capitalize first letter of each word
        const capitalizedCity = city
          .split(' ')
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');

        // Avoid duplicates
        const exists = entities.some(
          (e) => e.label === 'LOCATION' && e.value === capitalizedCity
        );

        if (!exists) {
          entities.push({
            text: city,
            label: 'LOCATION',
            value: capitalizedCity,
          });
        }
      }
    }
  }

  /**
   * Detect số điện thoại
   * @private
   */
  _detectPhones(text, entities) {
    // Vietnamese phone patterns
    const phonePatterns = [
      /0\d{9,10}/g, // 0912345678, 09123456789
      /\+84\d{9,10}/g, // +84912345678
      /84\d{9,10}/g, // 84912345678
      /0\d{2}[\s.-]?\d{3}[\s.-]?\d{4}/g, // 091-234-5678, 091 234 5678
    ];

    for (const pattern of phonePatterns) {
      const matches = text.match(pattern);
      if (matches) {
        for (const match of matches) {
          // Clean phone number (remove spaces, dashes)
          const cleanPhone = match.replace(/[\s.-]/g, '');

          // Avoid duplicates
          const exists = entities.some(
            (e) => e.label === 'PHONE' && e.value === cleanPhone
          );

          if (!exists) {
            entities.push({
              text: match,
              label: 'PHONE',
              value: cleanPhone,
            });
          }
        }
      }
    }
  }

  /**
   * Detect số tiền
   * @private
   */
  _detectMoney(text, entities) {
    // Vietnamese money patterns
    const moneyPatterns = [
      // 500k, 500K, 500 k
      { pattern: /(\d+(?:\.\d+)?)\s*(k|K|nghìn|nghin)/gi, multiplier: 1000 },
      // 1tr, 1 tr, 1 triệu
      {
        pattern: /(\d+(?:\.\d+)?)\s*(tr|triệu|trieu|m|M|củ|cu)/gi,
        multiplier: 1000000,
      },
      // 1 tỷ
      { pattern: /(\d+(?:\.\d+)?)\s*(tỷ|ty)/gi, multiplier: 1000000000 },
      // 500000đ, 500.000đ, 500,000đ
      {
        pattern: /(\d{1,3}(?:[.,]\d{3})*)\s*(đ|d|đồng|dong|vnd|vnđ)/gi,
        multiplier: 1,
      },
      // Just number with đ/vnd (500000đ)
      { pattern: /(\d+)\s*(đ|d|đồng|dong|vnd|vnđ)/gi, multiplier: 1 },
    ];

    for (const { pattern, multiplier } of moneyPatterns) {
      let match;
      // Reset regex
      pattern.lastIndex = 0;

      while ((match = pattern.exec(text)) !== null) {
        // Parse number (handle both . and , as thousand separators)
        let numStr = match[1].replace(/[.,]/g, '');
        let amount = parseFloat(numStr) * multiplier;

        // Handle decimal in original (e.g., 1.5tr = 1,500,000)
        if (match[1].includes('.') && !match[1].includes(',')) {
          const parts = match[1].split('.');
          if (parts[1] && parts[1].length <= 2) {
            // It's a decimal, not thousand separator
            amount = parseFloat(match[1]) * multiplier;
          }
        }

        entities.push({
          text: match[0],
          label: 'MONEY',
          value: Math.round(amount),
          currency: 'VND',
        });
      }
    }
  }

  /**
   * Detect số lượng
   * @private
   */
  _detectQuantity(text, entities) {
    // Quantity patterns
    const quantityPattern =
      /(\d+)\s*(cái|chiếc|sản phẩm|sp|bộ|đôi|hộp|chai|gói|túi|kg|g|gram|lit|lít|ml)/gi;

    let match;
    while ((match = quantityPattern.exec(text)) !== null) {
      entities.push({
        text: match[0],
        label: 'QUANTITY',
        value: parseInt(match[1]),
        unit: match[2].toLowerCase(),
      });
    }
  }

  /**
   * Detect email
   * @private
   */
  _detectEmails(text, entities) {
    const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const matches = text.match(emailPattern);

    if (matches) {
      for (const match of matches) {
        entities.push({
          text: match,
          label: 'EMAIL',
          value: match.toLowerCase(),
        });
      }
    }
  }

  // ========== LANGUAGE DETECTION ==========

  /**
   * Detect ngôn ngữ (Vietnamese/English)
   *
   * @param {string} text - Text gốc
   * @returns {string} - 'vi' hoặc 'en'
   */
  detectLanguage(text) {
    if (!text) return 'vi'; // Default Vietnamese

    const textLower = text.toLowerCase();
    let vnCharCount = 0;

    for (const char of textLower) {
      if (this.vietnameseChars.includes(char)) {
        vnCharCount++;
      }
    }

    // If more than 3% Vietnamese characters, it's Vietnamese
    // (Lower threshold because slang often doesn't have diacritics)
    if (vnCharCount > text.length * 0.03) {
      return 'vi';
    }

    // Check for common Vietnamese words without diacritics
    const vnWordsNoDiacritics = [
      'khong',
      'duoc',
      'muon',
      'hang',
      'gia',
      'mua',
      'ban',
      'ship',
      'giao',
    ];
    for (const word of vnWordsNoDiacritics) {
      if (textLower.includes(word)) {
        return 'vi';
      }
    }

    return 'en';
  }

  // ========== FULL PROCESSING PIPELINE ==========

  /**
   * Xử lý NLP đầy đủ cho text
   *
   * @param {string} text - Text gốc
   * @returns {NLPResult} - Kết quả NLP
   *
   * @example
   * const result = vietnameseNLP.process("còn hàng ko shop, mik ở HN, 2 cái 500k");
   * // {
   * //   original: "còn hàng ko shop, mik ở HN, 2 cái 500k",
   * //   normalized: "còn hàng không shop, mình ở Hà Nội, 2 cái 500 nghìn",
   * //   tokens: ["còn", "hàng", "không", "shop", ...],
   * //   keywords: ["hàng", "shop", "Hà Nội"],
   * //   entities: [
   * //     { text: "HN", label: "LOCATION", value: "Hà Nội" },
   * //     { text: "2 cái", label: "QUANTITY", value: 2 },
   * //     { text: "500k", label: "MONEY", value: 500000 }
   * //   ],
   * //   language: "vi",
   * //   confidence: 0.85
   * // }
   */
  process(text) {
    if (!text || typeof text !== 'string') {
      return {
        original: '',
        normalized: '',
        tokens: [],
        keywords: [],
        entities: [],
        language: 'vi',
        confidence: 0,
      };
    }

    const original = text;
    const normalized = this.normalizeText(text);
    const tokens = this.tokenize(normalized);
    const keywords = this.extractKeywords(normalized);
    const entities = this.detectEntities(text); // Use original for entity detection
    const language = this.detectLanguage(text);

    // Calculate confidence based on how much we processed
    let confidence = 0.7; // Base confidence
    if (entities.length > 0) confidence += 0.1;
    if (keywords.length > 0) confidence += 0.1;
    if (language === 'vi') confidence += 0.05;
    confidence = Math.min(confidence, 0.95);

    return {
      original,
      normalized,
      tokens,
      keywords,
      entities,
      language,
      confidence,
    };
  }

  // ========== UTILITY METHODS ==========

  /**
   * Kiểm tra text có chứa từ khóa nào trong danh sách không
   *
   * @param {string} text - Text đã normalize
   * @param {string[]} keywords - Danh sách từ khóa cần check
   * @returns {boolean}
   */
  containsKeywords(text, keywords) {
    if (!text || !keywords || keywords.length === 0) return false;

    const normalizedText = this.normalizeText(text);
    return keywords.some((keyword) =>
      normalizedText.includes(keyword.toLowerCase())
    );
  }

  /**
   * Tìm từ khóa match trong text
   *
   * @param {string} text - Text đã normalize
   * @param {string[]} keywords - Danh sách từ khóa cần check
   * @returns {string[]} - Các từ khóa match được
   */
  findMatchingKeywords(text, keywords) {
    if (!text || !keywords || keywords.length === 0) return [];

    const normalizedText = this.normalizeText(text);
    return keywords.filter((keyword) =>
      normalizedText.includes(keyword.toLowerCase())
    );
  }

  /**
   * Lấy entity theo label
   *
   * @param {Object[]} entities - Danh sách entities
   * @param {string} label - Label cần lấy (LOCATION, MONEY, QUANTITY, PHONE, EMAIL)
   * @returns {Object|null} - Entity đầu tiên match hoặc null
   */
  getEntityByLabel(entities, label) {
    return entities.find((e) => e.label === label) || null;
  }

  /**
   * Lấy tất cả entities theo label
   *
   * @param {Object[]} entities - Danh sách entities
   * @param {string} label - Label cần lấy
   * @returns {Object[]} - Các entities match
   */
  getAllEntitiesByLabel(entities, label) {
    return entities.filter((e) => e.label === label);
  }

  /**
   * Tính độ tương đồng giữa 2 text (simple Jaccard similarity)
   *
   * @param {string} text1 - Text 1
   * @param {string} text2 - Text 2
   * @returns {number} - Độ tương đồng (0-1)
   */
  similarity(text1, text2) {
    const tokens1 = new Set(this.tokenize(this.normalizeText(text1)));
    const tokens2 = new Set(this.tokenize(this.normalizeText(text2)));

    const intersection = new Set([...tokens1].filter((x) => tokens2.has(x)));
    const union = new Set([...tokens1, ...tokens2]);

    if (union.size === 0) return 0;
    return intersection.size / union.size;
  }
}

// ========== SINGLETON INSTANCE ==========
export const vietnameseNLP = new VietnameseNLPService();

export default VietnameseNLPService;
