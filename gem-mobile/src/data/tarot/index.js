/**
 * TAROT DATA INDEX
 * Export tất cả data Tarot cho GEM Master
 */

// Major Arcana
export {
  MAJOR_ARCANA,
  getMajorArcanaCard,
  getMajorArcanaByName,
  getRandomMajorArcana
} from './majorArcana';

// Minor Arcana
export {
  WANDS,
  CUPS,
  SWORDS,
  PENTACLES,
  MINOR_ARCANA,
  getMinorArcanaCard,
  getCardsBySuit,
  getRandomMinorArcana,
  getRandomCardFromSuit
} from './minorArcana';

// Import để combine
import { MAJOR_ARCANA } from './majorArcana';
import { MINOR_ARCANA } from './minorArcana';

// Full deck (78 lá)
export const FULL_DECK = [...MAJOR_ARCANA, ...MINOR_ARCANA];

// Lấy random card từ full deck
export const getRandomCard = () => {
  const randomIndex = Math.floor(Math.random() * FULL_DECK.length);
  return FULL_DECK[randomIndex];
};

// Lấy nhiều cards random (không trùng)
export const getRandomCards = (count) => {
  const shuffled = [...FULL_DECK].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
};

// Lấy 3 cards cho spread phổ biến
export const getThreeCardSpread = () => {
  return getRandomCards(3);
};

// Lấy Celtic Cross spread (10 cards)
export const getCelticCrossSpread = () => {
  return getRandomCards(10);
};

// Tìm card theo tên (cả tiếng Anh và Việt)
export const findCardByName = (name) => {
  const searchName = name.toLowerCase();
  return FULL_DECK.find(card =>
    card.name.toLowerCase().includes(searchName) ||
    card.vietnameseName.toLowerCase().includes(searchName)
  );
};

// Suit info
export const SUIT_INFO = {
  wands: {
    name: 'Wands',
    vietnameseName: 'Gậy',
    element: 'Fire',
    elementVietnamese: 'Lửa',
    themes: ['đam mê', 'hành động', 'sáng tạo', 'năng lượng', 'ý chí'],
    crystals: ['Carnelian', 'Sunstone', 'Tiger Eye', 'Red Jasper']
  },
  cups: {
    name: 'Cups',
    vietnameseName: 'Cốc',
    element: 'Water',
    elementVietnamese: 'Nước',
    themes: ['cảm xúc', 'tình yêu', 'trực giác', 'mối quan hệ', 'sáng tạo'],
    crystals: ['Rose Quartz', 'Moonstone', 'Aquamarine', 'Pearl']
  },
  swords: {
    name: 'Swords',
    vietnameseName: 'Kiếm',
    element: 'Air',
    elementVietnamese: 'Gió',
    themes: ['trí tuệ', 'giao tiếp', 'xung đột', 'sự thật', 'quyết định'],
    crystals: ['Clear Quartz', 'Amethyst', 'Lapis Lazuli', 'Sodalite']
  },
  pentacles: {
    name: 'Pentacles',
    vietnameseName: 'Tiền',
    element: 'Earth',
    elementVietnamese: 'Đất',
    themes: ['vật chất', 'tài chính', 'sức khỏe', 'công việc', 'ổn định'],
    crystals: ['Green Aventurine', 'Citrine', 'Pyrite', 'Jade']
  }
};

export default {
  MAJOR_ARCANA,
  MINOR_ARCANA,
  FULL_DECK,
  SUIT_INFO,
  getRandomCard,
  getRandomCards,
  getThreeCardSpread,
  getCelticCrossSpread,
  findCardByName
};
