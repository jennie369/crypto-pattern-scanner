/**
 * Gemral - Crystal Tag Mapping
 *
 * Maps crystal names/shopHandles to Shopify product tags (Vietnamese)
 * Used by TarotScreen and IChingScreen to fetch real products
 *
 * IMPORTANT: Shopify tags are in Vietnamese!
 * Example tags: "Thạch Anh Hồng", "Thạch Anh Vàng", "Mắt Hổ", "Citrine"
 */

// ═══════════════════════════════════════════════════════════════════════════════
// CRYSTAL TO SHOPIFY TAG MAPPING
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Map crystal name/shopHandle to Shopify search tags
 * Returns array of tags to search for (in order of priority)
 */
export const CRYSTAL_TAG_MAP = {
  // === QUARTZ FAMILY ===
  'clear-quartz': ['Thạch Anh Trắng', 'Clear Quartz', 'Master Healer'],
  'clear-quartz-point': ['Thạch Anh Trắng', 'Clear Quartz', 'Point'],
  'rose-quartz': ['Thạch Anh Hồng', 'Rose Quartz', 'Tình Yêu'],
  'amethyst': ['Thạch Anh Tím', 'Amethyst', 'Trí Tuệ'],
  'citrine': ['Thạch Anh Vàng', 'Citrine', 'Tài Lộc'],
  'citrine-natural': ['Thạch Anh Vàng', 'Citrine', 'Natural'],
  'smoky-quartz': ['Thạch Anh Khói', 'Smoky Quartz', 'Grounding'],

  // === AVENTURINE ===
  'green-aventurine': ['Aventurine Xanh', 'Green Aventurine', 'May Mắn'],
  'aventurine': ['Aventurine', 'May Mắn'],

  // === TIGER EYE ===
  'tiger-eye': ['Mắt Hổ', 'Tiger Eye', 'Bảo Vệ'],
  'tiger-eye-bracelet': ['Mắt Hổ', 'Tiger Eye', 'Vòng Tay'],
  'tigers-eye': ['Mắt Hổ', 'Tiger Eye'],

  // === OBSIDIAN ===
  'obsidian': ['Obsidian', 'Bảo Vệ', 'Thanh Tẩy'],
  'black-obsidian': ['Obsidian Đen', 'Black Obsidian'],
  'snowflake-obsidian': ['Obsidian Bông Tuyết', 'Snowflake Obsidian'],

  // === TOURMALINE ===
  'black-tourmaline': ['Tourmaline Đen', 'Black Tourmaline', 'Bảo Vệ'],
  'tourmaline': ['Tourmaline'],
  'pink-tourmaline': ['Tourmaline Hồng', 'Pink Tourmaline'],

  // === JADE ===
  'jade': ['Ngọc Bích', 'Jade', 'Phong Thủy'],
  'green-jade': ['Ngọc Bích Xanh', 'Green Jade'],

  // === MOONSTONE ===
  'moonstone': ['Đá Mặt Trăng', 'Moonstone', 'Trực Giác'],
  'rainbow-moonstone': ['Đá Mặt Trăng Cầu Vồng', 'Rainbow Moonstone'],

  // === LAPIS LAZULI ===
  'lapis-lazuli': ['Lapis Lazuli', 'Đá Xanh Lam', 'Wisdom'],
  'lapis': ['Lapis Lazuli'],

  // === CARNELIAN ===
  'carnelian': ['Carnelian', 'Đá Mã Não Đỏ', 'Sáng Tạo'],

  // === LABRADORITE ===
  'labradorite': ['Labradorite', 'Đá Phép Thuật', 'Transformation'],

  // === SELENITE ===
  'selenite': ['Selenite', 'Đá Thạch Cao', 'Thanh Tẩy'],

  // === PYRITE ===
  'pyrite': ['Pyrite', 'Đá Vàng Ngu', 'Tài Lộc'],

  // === MALACHITE ===
  'malachite': ['Malachite', 'Đá Khổng Tước', 'Transformation'],

  // === HEMATITE ===
  'hematite': ['Hematite', 'Đá Sắt', 'Grounding'],

  // === AQUAMARINE ===
  'aquamarine': ['Aquamarine', 'Đá Biển', 'Bình An'],

  // === FLUORITE ===
  'fluorite': ['Fluorite', 'Đá Huỳnh Thạch', 'Focus'],

  // === GARNET ===
  'garnet': ['Garnet', 'Đá Hồng Lựu', 'Passion'],

  // === RHODONITE ===
  'rhodonite': ['Rhodonite', 'Đá Hồng', 'Chữa Lành'],

  // === SODALITE ===
  'sodalite': ['Sodalite', 'Đá Xanh Dương', 'Communication'],

  // === ONYX ===
  'onyx': ['Onyx', 'Đá Mã Não Đen', 'Bảo Vệ'],
  'black-onyx': ['Onyx Đen', 'Black Onyx'],

  // === SUNSTONE ===
  'sunstone': ['Sunstone', 'Đá Mặt Trời', 'Joy'],

  // === AMAZONITE ===
  'amazonite': ['Amazonite', 'Đá Xanh Amazon', 'Truth'],

  // === DEFAULT FALLBACK ===
  'default': ['Crystal', 'Đá Phong Thủy', 'Bestseller'],
};

// ═══════════════════════════════════════════════════════════════════════════════
// TAROT CARD TO CRYSTAL MAPPING
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Major Arcana cards → Recommended crystals
 * Used when tarot data doesn't have crystals or needs fallback
 */
export const TAROT_CRYSTAL_FALLBACK = {
  // Major Arcana
  0: ['clear-quartz', 'citrine', 'green-aventurine'],        // The Fool
  1: ['tiger-eye', 'carnelian', 'labradorite'],              // The Magician
  2: ['moonstone', 'lapis-lazuli', 'amethyst'],              // High Priestess
  3: ['rose-quartz', 'jade', 'green-aventurine'],            // The Empress
  4: ['tiger-eye', 'pyrite', 'carnelian'],                   // The Emperor
  5: ['lapis-lazuli', 'amethyst', 'clear-quartz'],           // The Hierophant
  6: ['rose-quartz', 'rhodonite', 'moonstone'],              // The Lovers
  7: ['tiger-eye', 'black-tourmaline', 'carnelian'],         // The Chariot
  8: ['carnelian', 'tiger-eye', 'garnet'],                   // Strength
  9: ['amethyst', 'labradorite', 'moonstone'],               // The Hermit
  10: ['labradorite', 'citrine', 'jade'],                    // Wheel of Fortune
  11: ['lapis-lazuli', 'clear-quartz', 'amethyst'],          // Justice
  12: ['amethyst', 'labradorite', 'aquamarine'],             // Hanged Man
  13: ['obsidian', 'black-tourmaline', 'smoky-quartz'],      // Death
  14: ['amethyst', 'aquamarine', 'clear-quartz'],            // Temperance
  15: ['obsidian', 'black-tourmaline', 'smoky-quartz'],      // The Devil
  16: ['obsidian', 'hematite', 'smoky-quartz'],              // The Tower
  17: ['aquamarine', 'moonstone', 'clear-quartz'],           // The Star
  18: ['moonstone', 'labradorite', 'selenite'],              // The Moon
  19: ['citrine', 'sunstone', 'carnelian'],                  // The Sun
  20: ['amethyst', 'clear-quartz', 'labradorite'],           // Judgement
  21: ['clear-quartz', 'labradorite', 'amethyst'],           // The World
};

// ═══════════════════════════════════════════════════════════════════════════════
// I CHING HEXAGRAM TO CRYSTAL MAPPING
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Hexagram number → Recommended crystals
 * Used when hexagram data doesn't have crystals or needs fallback
 */
export const ICHING_CRYSTAL_FALLBACK = {
  1: ['citrine', 'tiger-eye', 'clear-quartz'],           // Càn - Creative
  2: ['jade', 'moonstone', 'rose-quartz'],               // Khôn - Receptive
  3: ['carnelian', 'tiger-eye', 'citrine'],              // Truân - Difficulty
  4: ['amethyst', 'lapis-lazuli', 'fluorite'],           // Mông - Youthful
  5: ['aquamarine', 'clear-quartz', 'moonstone'],        // Nhu - Waiting
  6: ['black-tourmaline', 'hematite', 'obsidian'],       // Tụng - Conflict
  7: ['tiger-eye', 'carnelian', 'pyrite'],               // Sư - Army
  8: ['rose-quartz', 'jade', 'green-aventurine'],        // Tỷ - Holding Together
  // Add more as needed...
};

// ═══════════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Get Shopify tags for a crystal
 * @param {string} crystalNameOrHandle - Crystal name or shopHandle
 * @returns {string[]} - Array of Shopify tags to search
 */
export const getCrystalTags = (crystalNameOrHandle) => {
  if (!crystalNameOrHandle) {
    return CRYSTAL_TAG_MAP['default'];
  }

  // Normalize the input
  const normalized = crystalNameOrHandle
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/_/g, '-')
    .trim();

  // Direct match
  if (CRYSTAL_TAG_MAP[normalized]) {
    return CRYSTAL_TAG_MAP[normalized];
  }

  // Try partial match
  for (const [key, tags] of Object.entries(CRYSTAL_TAG_MAP)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return tags;
    }
  }

  // Fallback: use the original name as a tag
  return [crystalNameOrHandle, 'Crystal', 'Đá Phong Thủy'];
};

/**
 * Get all tags for multiple crystals
 * @param {Array} crystals - Array of crystal objects with name/shopHandle
 * @returns {string[]} - Combined unique tags
 */
export const getCrystalTagsForList = (crystals) => {
  if (!crystals || crystals.length === 0) {
    return CRYSTAL_TAG_MAP['default'];
  }

  const allTags = new Set();

  crystals.forEach((crystal) => {
    const handle = crystal.shopHandle || crystal.name;
    const tags = getCrystalTags(handle);
    tags.forEach((tag) => allTags.add(tag));
  });

  return Array.from(allTags);
};

/**
 * Get crystal recommendations for a Tarot reading
 * @param {Object} readingData - { cards: [...] } or { cardId: number }
 * @returns {string[]} - Crystal shopHandles
 */
export const getCrystalsForTarotReading = (readingData) => {
  if (!readingData) return TAROT_CRYSTAL_FALLBACK[0];

  // If we have cards array
  if (readingData.cards && readingData.cards.length > 0) {
    const crystals = new Set();

    readingData.cards.forEach((card) => {
      // If card has crystals, use them
      if (card.crystals && card.crystals.length > 0) {
        card.crystals.forEach((c) => {
          crystals.add(c.shopHandle || c.name);
        });
      } else {
        // Fallback to mapping
        const cardId = typeof card.id === 'number' ? card.id : 0;
        const fallback = TAROT_CRYSTAL_FALLBACK[cardId] || TAROT_CRYSTAL_FALLBACK[0];
        fallback.forEach((c) => crystals.add(c));
      }
    });

    return Array.from(crystals);
  }

  // If we have single cardId
  if (typeof readingData.cardId === 'number') {
    return TAROT_CRYSTAL_FALLBACK[readingData.cardId] || TAROT_CRYSTAL_FALLBACK[0];
  }

  return TAROT_CRYSTAL_FALLBACK[0];
};

/**
 * Get crystal recommendations for an I Ching reading
 * @param {Object} readingData - { hexagramNumber: number } or { hexagram: {...} }
 * @returns {string[]} - Crystal shopHandles
 */
export const getCrystalsForIChingReading = (readingData) => {
  if (!readingData) return ICHING_CRYSTAL_FALLBACK[1];

  const hexNumber = readingData.hexagramNumber || readingData.hexagram?.id || 1;

  // If hexagram data has crystals, use them
  if (readingData.hexagram?.crystals && readingData.hexagram.crystals.length > 0) {
    return readingData.hexagram.crystals.map((c) => c.shopHandle || c.name);
  }

  return ICHING_CRYSTAL_FALLBACK[hexNumber] || ICHING_CRYSTAL_FALLBACK[1];
};

/**
 * Get Shopify search tags for a reading
 * @param {string} readingType - 'tarot' or 'iching'
 * @param {Object} readingData - Reading data
 * @returns {string[]} - Shopify tags to search
 */
export const getShopifyTagsForReading = (readingType, readingData) => {
  let crystalHandles = [];

  if (readingType === 'tarot') {
    crystalHandles = getCrystalsForTarotReading(readingData);
  } else if (readingType === 'iching') {
    crystalHandles = getCrystalsForIChingReading(readingData);
  }

  // Convert handles to Shopify tags
  const allTags = new Set();
  crystalHandles.forEach((handle) => {
    const tags = getCrystalTags(handle);
    tags.slice(0, 2).forEach((tag) => allTags.add(tag)); // Take first 2 tags per crystal
  });

  return Array.from(allTags);
};

export default {
  CRYSTAL_TAG_MAP,
  TAROT_CRYSTAL_FALLBACK,
  ICHING_CRYSTAL_FALLBACK,
  getCrystalTags,
  getCrystalTagsForList,
  getCrystalsForTarotReading,
  getCrystalsForIChingReading,
  getShopifyTagsForReading,
};
