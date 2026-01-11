/**
 * Notification Sounds Constants
 * Built-in notification sounds for chat messages
 *
 * Includes:
 * - Default sounds
 * - Gem-themed sounds
 * - Silent option
 */

export const NOTIFICATION_SOUNDS = [
  {
    id: 'default',
    name: 'Mặc định',
    emoji: '🔔',
    // Note: Sound files should be added to assets/sounds/ folder
    // Using placeholder paths - replace with actual sound files
    file: null, // require('../assets/sounds/default.mp3'),
    isDefault: true,
  },
  {
    id: 'crystal',
    name: 'Crystal',
    emoji: '💎',
    file: null, // require('../assets/sounds/crystal.mp3'),
    isGemTheme: true,
  },
  {
    id: 'mystic',
    name: 'Mystic',
    emoji: '🔮',
    file: null, // require('../assets/sounds/mystic.mp3'),
    isGemTheme: true,
  },
  {
    id: 'ocean',
    name: 'Ocean Wave',
    emoji: '🌊',
    file: null, // require('../assets/sounds/ocean.mp3'),
    isGemTheme: true,
  },
  {
    id: 'chime',
    name: 'Chime',
    emoji: '🎵',
    file: null, // require('../assets/sounds/chime.mp3'),
  },
  {
    id: 'bubble',
    name: 'Bubble',
    emoji: '💬',
    file: null, // require('../assets/sounds/bubble.mp3'),
  },
  {
    id: 'ding',
    name: 'Ding',
    emoji: '✨',
    file: null, // require('../assets/sounds/ding.mp3'),
  },
  {
    id: 'pop',
    name: 'Pop',
    emoji: '🎈',
    file: null, // require('../assets/sounds/pop.mp3'),
  },
  {
    id: 'water',
    name: 'Water Drop',
    emoji: '💧',
    file: null, // require('../assets/sounds/water.mp3'),
  },
  {
    id: 'wind',
    name: 'Wind Chime',
    emoji: '🌬️',
    file: null, // require('../assets/sounds/wind.mp3'),
  },
  {
    id: 'bell',
    name: 'Bell',
    emoji: '🔔',
    file: null, // require('../assets/sounds/bell.mp3'),
  },
  {
    id: 'gentle',
    name: 'Gentle',
    emoji: '🌸',
    file: null, // require('../assets/sounds/gentle.mp3'),
  },
  {
    id: 'none',
    name: 'Không có âm',
    emoji: '🔇',
    file: null,
    isSilent: true,
  },
];

/**
 * Get sound by ID
 * @param {string} soundId
 * @returns {object} Sound object
 */
export const getSound = (soundId) => {
  return NOTIFICATION_SOUNDS.find(s => s.id === soundId) || NOTIFICATION_SOUNDS[0];
};

/**
 * Get all sounds
 * @returns {array} All sounds
 */
export const getAllSounds = () => {
  return NOTIFICATION_SOUNDS;
};

/**
 * Get Gem-themed sounds
 * @returns {array} Gem theme sounds only
 */
export const getGemThemeSounds = () => {
  return NOTIFICATION_SOUNDS.filter(s => s.isGemTheme);
};

/**
 * Get default sound
 * @returns {object} Default sound
 */
export const getDefaultSound = () => {
  return NOTIFICATION_SOUNDS.find(s => s.isDefault) || NOTIFICATION_SOUNDS[0];
};

export default NOTIFICATION_SOUNDS;
