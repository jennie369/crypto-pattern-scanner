/**
 * Gemral - Tarot Card Images
 * Real Rider-Waite Tarot card images
 * 78 cards total: 22 Major Arcana + 56 Minor Arcana
 */

// Card Back Image - YinYang Masters design
export const CARD_BACK = require('./card_back.jpg.png');

// Tarot Background - Dark blue silk with amethyst crystals
export const TAROT_BACKGROUND = require('./tarot_background.jpg.jpeg');

// Major Arcana (22 cards)
export const MAJOR_ARCANA = {
  0: require('./major/MW_The_Fool.jpg'),
  1: require('./major/MW_The_Magician.jpg'),
  2: require('./major/MW_The_High_Priestess.jpg'),
  3: require('./major/MW_The_Empress.jpg'),
  4: require('./major/MW_The_Emperor.jpg'),
  5: require('./major/MW_The_Hierophant.jpg'),
  6: require('./major/MW_The_Lovers.jpg'),
  7: require('./major/MW_The_Chariot.jpg'),
  8: require('./major/MW_Strength.jpg'),
  9: require('./major/MW_The_Hermit.jpg'),
  10: require('./major/MW_Wheel_of_Fortune.jpg'),
  11: require('./major/MW_Justice.jpg'),
  12: require('./major/MW_The_Hangedman.jpg'),
  13: require('./major/MW_Death.jpg'),
  14: require('./major/MW_Temperance.jpg'),
  15: require('./major/MW_The_Devil.jpg'),
  16: require('./major/MW_The_Tower.jpg'),
  17: require('./major/MW_The_Star.jpg'),
  18: require('./major/MW_The_Moon.jpg'),
  19: require('./major/MW_The_Sun.jpg'),
  20: require('./major/MW_Judgement.jpg'),
  21: require('./major/MW_The_World.jpg'),
};

// Minor Arcana - Wands (14 cards)
export const WANDS = {
  1: require('./minor/MW_Ace_of_Wands.jpg'),
  2: require('./minor/MW_Two_of_Wands.jpg'),
  3: require('./minor/MW_Three_of_Wands.jpg'),
  4: require('./minor/MW_Four_of_Wands.jpg'),
  5: require('./minor/MW_Five_of_Wands.jpg'),
  6: require('./minor/MW_Six_of_Wands.jpg'),
  7: require('./minor/MW_Seven_of_Wands.jpg'),
  8: require('./minor/MW_Eight_of_Wands.jpg'),
  9: require('./minor/MW_Nine_of_Wands.jpg'),
  10: require('./minor/MW_Ten_of_Wands.jpg'),
  11: require('./minor/MW_Page_of_Wands.jpg'),
  12: require('./minor/MW_Knight_of_Wands.jpg'),
  13: require('./minor/MW_Queen_of_Wands.jpg'),
  14: require('./minor/MW_King_of_Wands.jpg'),
};

// Minor Arcana - Cups (14 cards)
export const CUPS = {
  1: require('./minor/MW_Ace_of_Cups.jpg'),
  2: require('./minor/MW_Two_of_Cups.jpg'),
  3: require('./minor/MW_Three_of_Cups.jpg'),
  4: require('./minor/MW_Four_of_Cups.jpg'),
  5: require('./minor/MW_Five_of_Cups.jpg'),
  6: require('./minor/MW_Six_of_Cups.jpg'),
  7: require('./minor/MW_Seven_of_Cups.jpg'),
  8: require('./minor/MW_Eight_of_Cups.jpg'),
  9: require('./minor/MW_Nine_of_Cups.jpg'),
  10: require('./minor/MW_Ten_of_Cups.jpg'),
  11: require('./minor/MW_Page_of_Cups.jpg'),
  12: require('./minor/MW_Knight_of_Cups.jpg'),
  13: require('./minor/MW_Queen_of_Cups.jpg'),
  14: require('./minor/MW_King_of_Cups.jpg'),
};

// Minor Arcana - Swords (14 cards)
export const SWORDS = {
  1: require('./minor/MW_Ace_of_Sword.jpg'),
  2: require('./minor/MW_Two_of_Swords.jpg'),
  3: require('./minor/MW_Three_of_Swords.jpg'),
  4: require('./minor/MW_Four_of_Swords.jpg'),
  5: require('./minor/MW_Five_of_Swords.jpg'),
  6: require('./minor/MW_Six_of_Swords.jpg'),
  7: require('./minor/MW_Seven_of_Swords.jpg'),
  8: require('./minor/MW_Eight_of_Swords.jpg'),
  9: require('./minor/MW_Nine_of_Swords.jpg'),
  10: require('./minor/MW_Ten_of_Swords.jpg'),
  11: require('./minor/MW_Page_of_Swords.jpg'),
  12: require('./minor/MW_Knight_of_Swords.jpg'),
  13: require('./minor/MW_Queen_of_Swords.jpg'),
  14: require('./minor/MW_King_of_Swords.jpg'),
};

// Minor Arcana - Pentacles (14 cards)
export const PENTACLES = {
  1: require('./minor/MW_Ace_of_Pentacles.jpg'),
  2: require('./minor/MW_Two_of_Pentacles.jpg'),
  3: require('./minor/MW_Three_of_Pentacles.jpg'),
  4: require('./minor/MW_Four_of_Pentacles.jpg'),
  5: require('./minor/MW_Five_of_Pentacles.jpg'),
  6: require('./minor/MW_Six_of_Pentacles.jpg'),
  7: require('./minor/MW_Seven_of_Pentacles.jpg'),
  8: require('./minor/MW_Eight_of_Pentacles.jpg'),
  9: require('./minor/MW_Nine_of_Pentacles.jpg'),
  10: require('./minor/MW_Ten_of_Pentacles.jpg'),
  11: require('./minor/MW_Page_of_Pentacles.jpg'),
  12: require('./minor/MW_Knight_of_Pentacles.jpg'),
  13: require('./minor/MW_Queen_of_Pentacles.jpg'),
  14: require('./minor/MW_King_of_Pentacles.jpg'),
};

/**
 * Court card name to number mapping
 * Page = 11, Knight = 12, Queen = 13, King = 14
 */
const COURT_CARD_MAP = {
  'page': 11,
  'knight': 12,
  'queen': 13,
  'king': 14,
};

/**
 * Get card image by card ID
 * Supports:
 * - Numeric IDs (0-77): 0-21 Major Arcana, 22-35 Wands, 36-49 Cups, 50-63 Swords, 64-77 Pentacles
 * - String IDs with numbers: 'wands-01', 'cups-05', 'swords-10'
 * - String IDs with court names: 'cups-king', 'pentacles-queen', 'wands-page', 'swords-knight'
 */
export const getCardImage = (cardId) => {
  // Handle string IDs from Minor Arcana data
  if (typeof cardId === 'string') {
    // First check if it's a pure numeric string (Major Arcana ID stored as string)
    if (/^\d+$/.test(cardId)) {
      const numericId = parseInt(cardId, 10);
      if (numericId >= 0 && numericId <= 21) {
        return MAJOR_ARCANA[numericId] || null;
      } else if (numericId >= 22 && numericId <= 77) {
        // Extended numeric range for Minor Arcana
        if (numericId <= 35) return WANDS[numericId - 21] || null;
        if (numericId <= 49) return CUPS[numericId - 35] || null;
        if (numericId <= 63) return SWORDS[numericId - 49] || null;
        if (numericId <= 77) return PENTACLES[numericId - 63] || null;
      }
      return null;
    }

    // Handle suit-number format (e.g., 'wands-01', 'cups-king')
    const parts = cardId.split('-');
    if (parts.length === 2) {
      const suit = parts[0].toLowerCase();
      const numberOrCourt = parts[1].toLowerCase();

      // Convert court card names to numbers, or parse numeric string
      let number;
      if (COURT_CARD_MAP[numberOrCourt] !== undefined) {
        number = COURT_CARD_MAP[numberOrCourt];
      } else {
        number = parseInt(numberOrCourt, 10);
      }

      if (isNaN(number)) {
        return null;
      }

      switch (suit) {
        case 'wands':
          return WANDS[number] || null;
        case 'cups':
          return CUPS[number] || null;
        case 'swords':
          return SWORDS[number] || null;
        case 'pentacles':
          return PENTACLES[number] || null;
        default:
          return null;
      }
    }
    return null;
  }

  // Handle numeric IDs (0-77)
  if (typeof cardId === 'number') {
    if (cardId >= 0 && cardId <= 21) {
      return MAJOR_ARCANA[cardId] || null;
    } else if (cardId >= 22 && cardId <= 35) {
      return WANDS[cardId - 21] || null; // 22 -> 1, 35 -> 14
    } else if (cardId >= 36 && cardId <= 49) {
      return CUPS[cardId - 35] || null; // 36 -> 1, 49 -> 14
    } else if (cardId >= 50 && cardId <= 63) {
      return SWORDS[cardId - 49] || null; // 50 -> 1, 63 -> 14
    } else if (cardId >= 64 && cardId <= 77) {
      return PENTACLES[cardId - 63] || null; // 64 -> 1, 77 -> 14
    }
  }

  return null;
};

/**
 * Get card image by arcana type and number
 */
export const getCardImageByType = (arcana, number) => {
  switch (arcana) {
    case 'major':
      return MAJOR_ARCANA[number];
    case 'wands':
      return WANDS[number];
    case 'cups':
      return CUPS[number];
    case 'swords':
      return SWORDS[number];
    case 'pentacles':
      return PENTACLES[number];
    default:
      return null;
  }
};

/**
 * Vietnamese name to card ID mapping
 * Used to lookup card images from Vietnamese names (legacy data)
 */
const VIETNAMESE_NAME_TO_ID = {
  // Major Arcana
  'Kẻ Khờ': 0, 'Người Khờ': 0, 'The Fool': 0,
  'Nhà Ảo Thuật': 1, 'Pháp Sư': 1, 'The Magician': 1,
  'Nữ Tư Tế': 2, 'Nữ Giáo Hoàng': 2, 'The High Priestess': 2,
  'Hoàng Hậu': 3, 'Nữ Hoàng': 3, 'The Empress': 3,
  'Hoàng Đế': 4, 'The Emperor': 4,
  'Giáo Hoàng': 5, 'The Hierophant': 5,
  'Người Yêu': 6, 'Đôi Tình Nhân': 6, 'The Lovers': 6,
  'Cỗ Xe': 7, 'Chiến Xa': 7, 'The Chariot': 7,
  'Sức Mạnh': 8, 'Strength': 8,
  'Ẩn Sĩ': 9, 'The Hermit': 9,
  'Vòng Quay Vận Mệnh': 10, 'Bánh Xe Số Phận': 10, 'Wheel of Fortune': 10,
  'Công Lý': 11, 'Justice': 11,
  'Người Treo Ngược': 12, 'The Hanged Man': 12,
  'Thần Chết': 13, 'Tử Thần': 13, 'Death': 13,
  'Điều Độ': 14, 'Sự Tiết Chế': 14, 'Temperance': 14,
  'Ác Quỷ': 15, 'Quỷ Dữ': 15, 'The Devil': 15,
  'Tháp': 16, 'Tháp Đổ': 16, 'The Tower': 16,
  'Ngôi Sao': 17, 'The Star': 17,
  'Mặt Trăng': 18, 'The Moon': 18,
  'Mặt Trời': 19, 'The Sun': 19,
  'Phán Xét': 20, 'Sự Phán Xét': 20, 'Judgement': 20,
  'Thế Giới': 21, 'The World': 21,

  // Wands (Gậy)
  'Át Gậy': 'wands-01', 'Ace of Wands': 'wands-01',
  'Hai Gậy': 'wands-02', 'Two of Wands': 'wands-02',
  'Ba Gậy': 'wands-03', 'Three of Wands': 'wands-03',
  'Bốn Gậy': 'wands-04', 'Four of Wands': 'wands-04',
  'Năm Gậy': 'wands-05', 'Five of Wands': 'wands-05',
  'Sáu Gậy': 'wands-06', 'Six of Wands': 'wands-06',
  'Bảy Gậy': 'wands-07', 'Seven of Wands': 'wands-07',
  'Tám Gậy': 'wands-08', 'Eight of Wands': 'wands-08',
  'Chín Gậy': 'wands-09', 'Nine of Wands': 'wands-09',
  'Mười Gậy': 'wands-10', 'Ten of Wands': 'wands-10',
  'Thị Đồng Gậy': 'wands-page', 'Page of Wands': 'wands-page',
  'Hiệp Sĩ Gậy': 'wands-knight', 'Knight of Wands': 'wands-knight',
  'Nữ Hoàng Gậy': 'wands-queen', 'Queen of Wands': 'wands-queen',
  'Vua Gậy': 'wands-king', 'King of Wands': 'wands-king',

  // Cups (Cốc)
  'Át Cốc': 'cups-01', 'Ace of Cups': 'cups-01',
  'Hai Cốc': 'cups-02', 'Two of Cups': 'cups-02',
  'Ba Cốc': 'cups-03', 'Three of Cups': 'cups-03',
  'Bốn Cốc': 'cups-04', 'Four of Cups': 'cups-04',
  'Năm Cốc': 'cups-05', 'Five of Cups': 'cups-05',
  'Sáu Cốc': 'cups-06', 'Six of Cups': 'cups-06',
  'Bảy Cốc': 'cups-07', 'Seven of Cups': 'cups-07',
  'Tám Cốc': 'cups-08', 'Eight of Cups': 'cups-08',
  'Chín Cốc': 'cups-09', 'Nine of Cups': 'cups-09',
  'Mười Cốc': 'cups-10', 'Ten of Cups': 'cups-10',
  'Thị Đồng Cốc': 'cups-page', 'Page of Cups': 'cups-page',
  'Hiệp Sĩ Cốc': 'cups-knight', 'Knight of Cups': 'cups-knight',
  'Nữ Hoàng Cốc': 'cups-queen', 'Queen of Cups': 'cups-queen',
  'Vua Cốc': 'cups-king', 'King of Cups': 'cups-king',

  // Swords (Kiếm)
  'Át Kiếm': 'swords-01', 'Ace of Swords': 'swords-01',
  'Hai Kiếm': 'swords-02', 'Two of Swords': 'swords-02',
  'Ba Kiếm': 'swords-03', 'Three of Swords': 'swords-03',
  'Bốn Kiếm': 'swords-04', 'Four of Swords': 'swords-04',
  'Năm Kiếm': 'swords-05', 'Five of Swords': 'swords-05',
  'Sáu Kiếm': 'swords-06', 'Six of Swords': 'swords-06',
  'Bảy Kiếm': 'swords-07', 'Seven of Swords': 'swords-07',
  'Tám Kiếm': 'swords-08', 'Eight of Swords': 'swords-08',
  'Chín Kiếm': 'swords-09', 'Nine of Swords': 'swords-09',
  'Mười Kiếm': 'swords-10', 'Ten of Swords': 'swords-10',
  'Thị Đồng Kiếm': 'swords-page', 'Page of Swords': 'swords-page',
  'Hiệp Sĩ Kiếm': 'swords-knight', 'Knight of Swords': 'swords-knight',
  'Nữ Hoàng Kiếm': 'swords-queen', 'Queen of Swords': 'swords-queen',
  'Vua Kiếm': 'swords-king', 'King of Swords': 'swords-king',

  // Pentacles (Đồng Xu/Tiền)
  'Át Tiền': 'pentacles-01', 'Át Đồng Xu': 'pentacles-01', 'Ace of Pentacles': 'pentacles-01',
  'Hai Tiền': 'pentacles-02', 'Hai Đồng Xu': 'pentacles-02', 'Two of Pentacles': 'pentacles-02',
  'Ba Tiền': 'pentacles-03', 'Ba Đồng Xu': 'pentacles-03', 'Three of Pentacles': 'pentacles-03',
  'Bốn Tiền': 'pentacles-04', 'Bốn Đồng Xu': 'pentacles-04', 'Four of Pentacles': 'pentacles-04',
  'Năm Tiền': 'pentacles-05', 'Năm Đồng Xu': 'pentacles-05', 'Five of Pentacles': 'pentacles-05',
  'Sáu Tiền': 'pentacles-06', 'Sáu Đồng Xu': 'pentacles-06', 'Six of Pentacles': 'pentacles-06',
  'Bảy Tiền': 'pentacles-07', 'Bảy Đồng Xu': 'pentacles-07', 'Seven of Pentacles': 'pentacles-07',
  'Tám Tiền': 'pentacles-08', 'Tám Đồng Xu': 'pentacles-08', 'Eight of Pentacles': 'pentacles-08',
  'Chín Tiền': 'pentacles-09', 'Chín Đồng Xu': 'pentacles-09', 'Nine of Pentacles': 'pentacles-09',
  'Mười Tiền': 'pentacles-10', 'Mười Đồng Xu': 'pentacles-10', 'Ten of Pentacles': 'pentacles-10',
  'Thị Đồng Tiền': 'pentacles-page', 'Thị Đồng Đồng Xu': 'pentacles-page', 'Page of Pentacles': 'pentacles-page',
  'Hiệp Sĩ Tiền': 'pentacles-knight', 'Hiệp Sĩ Đồng Xu': 'pentacles-knight', 'Knight of Pentacles': 'pentacles-knight',
  'Nữ Hoàng Tiền': 'pentacles-queen', 'Nữ Hoàng Đồng Xu': 'pentacles-queen', 'Queen of Pentacles': 'pentacles-queen',
  'Vua Tiền': 'pentacles-king', 'Vua Đồng Xu': 'pentacles-king', 'King of Pentacles': 'pentacles-king',
};

/**
 * Get card image by Vietnamese name
 * Fallback for legacy saved data that only has Vietnamese names
 */
export const getCardImageByName = (vietnameseName) => {
  if (!vietnameseName) return null;

  // Try direct lookup
  const cardId = VIETNAMESE_NAME_TO_ID[vietnameseName];
  if (cardId !== undefined) {
    return getCardImage(cardId);
  }

  // Try case-insensitive lookup
  const lowerName = vietnameseName.toLowerCase();
  for (const [name, id] of Object.entries(VIETNAMESE_NAME_TO_ID)) {
    if (name.toLowerCase() === lowerName) {
      return getCardImage(id);
    }
  }

  return null;
};

export default {
  MAJOR_ARCANA,
  WANDS,
  CUPS,
  SWORDS,
  PENTACLES,
  getCardImage,
  getCardImageByType,
  getCardImageByName,
};
