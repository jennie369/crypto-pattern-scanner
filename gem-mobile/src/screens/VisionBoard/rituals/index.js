/**
 * Rituals Index - Vision Board 2.0
 * Cosmic Glassmorphism Redesign
 * Export all ritual screens
 * Updated: December 2025
 */

// Existing Rituals (Redesigned with Cosmic Glassmorphism)
export { default as HeartExpansionRitual } from './HeartExpansionRitual';
export { default as GratitudeFlowRitual } from './GratitudeFlowRitual';
export { default as CleansingBreathRitual } from './CleansingBreathRitual';
export { default as WaterManifestRitual } from './WaterManifestRitual';
export { default as LetterToUniverseRitual } from './LetterToUniverseRitual';

// New Rituals
export { default as BurnReleaseRitual } from './BurnReleaseRitual';
export { default as StarWishRitual } from './StarWishRitual';
export { default as CrystalHealingRitual } from './CrystalHealingRitual';

// Ritual mapping for navigation
export const RITUAL_SCREENS = {
  'heart-expansion': 'HeartExpansionRitual',
  'heart-opening': 'HeartExpansionRitual',           // Alias for heart-expansion
  'gratitude-flow': 'GratitudeFlowRitual',
  'cleansing-breath': 'CleansingBreathRitual',
  'purify-breathwork': 'CleansingBreathRitual',      // Alias for cleansing-breath
  'water-manifest': 'WaterManifestRitual',
  'letter-to-universe': 'LetterToUniverseRitual',
  'burn-release': 'BurnReleaseRitual',
  'star-wish': 'StarWishRitual',
  'crystal-healing': 'CrystalHealingRitual',
};

// Ritual metadata for displaying in lists
export const RITUAL_METADATA = {
  'heart-expansion': {
    id: 'heart-expansion',
    name: 'Mở Rộng Trái Tim',
    description: 'Gửi tình yêu đến bản thân và người khác',
    icon: 'Heart',
    duration: '5-7 phút',
    xpReward: 30,
    theme: 'heart',
  },
  'gratitude-flow': {
    id: 'gratitude-flow',
    name: 'Dòng Chảy Biết Ơn',
    description: 'Gửi lòng biết ơn đến vũ trụ',
    icon: 'Gift',
    duration: '3-5 phút',
    xpReward: 30,
    theme: 'gratitude',
  },
  'cleansing-breath': {
    id: 'cleansing-breath',
    name: 'Hơi Thở Thanh Lọc',
    description: 'Box breathing để cân bằng tâm trí',
    icon: 'Wind',
    duration: '5-7 phút',
    xpReward: 35,
    theme: 'breath',
  },
  'water-manifest': {
    id: 'water-manifest',
    name: 'Hiện Thực Hóa Bằng Nước',
    description: 'Nạp ý định vào nước và uống',
    icon: 'Droplet',
    duration: '5-7 phút',
    xpReward: 30,
    theme: 'water',
  },
  'letter-to-universe': {
    id: 'letter-to-universe',
    name: 'Thư Gửi Vũ Trụ',
    description: 'Viết điều ước và gửi lên những vì sao',
    icon: 'Mail',
    duration: '5-10 phút',
    xpReward: 25,
    theme: 'letter',
  },
  'burn-release': {
    id: 'burn-release',
    name: 'Đốt & Buông Bỏ',
    description: 'Viết và đốt cháy những gánh nặng',
    icon: 'Flame',
    duration: '5-7 phút',
    xpReward: 35,
    theme: 'burn',
  },
  'star-wish': {
    id: 'star-wish',
    name: 'Ước Nguyện Sao Băng',
    description: 'Chọn ngôi sao và gửi điều ước',
    icon: 'Star',
    duration: '3-5 phút',
    xpReward: 25,
    theme: 'star',
  },
  'crystal-healing': {
    id: 'crystal-healing',
    name: 'Chữa Lành Pha Lê',
    description: 'Kết nối năng lượng chữa lành của đá quý',
    icon: 'Gem',
    duration: '5 phút',
    xpReward: 30,
    theme: 'crystal',
    tags: ['healing'],
  },
};

// Get all rituals as array
export const getAllRituals = () => Object.values(RITUAL_METADATA);

// Get ritual by ID
export const getRitualById = (id) => RITUAL_METADATA[id];
