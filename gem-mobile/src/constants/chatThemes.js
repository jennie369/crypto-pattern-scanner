/**
 * Chat Themes Constants
 * 8 themes for chat with colors, gradients, backgrounds
 *
 * Themes:
 * 1. Crystal (default) - Gem purple/cyan
 * 2. Mystic Purple - Deep purple
 * 3. Ocean Blue - Blue gradient
 * 4. Sakura Pink - Cherry blossom
 * 5. Forest Green - Nature
 * 6. Sunrise Gold - Warm gold
 * 7. Midnight - Dark blue/black
 * 8. Starlight - Silver/white
 */

export const CHAT_THEMES = {
  crystal: {
    id: 'crystal',
    name: 'Crystal',
    emoji: '💎',
    description: 'Giao diện mặc định của Gem',
    colors: {
      primary: '#6A5BFF',
      secondary: '#00F0FF',
      accent: '#FFBD59',
      ownBubble: '#6A5BFF',
      ownBubbleText: '#FFFFFF',
      otherBubble: 'rgba(15, 16, 48, 0.85)',
      otherBubbleText: '#FFFFFF',
      inputBackground: 'rgba(255, 255, 255, 0.08)',
    },
    gradient: ['#0A0B1E', '#1A1B3E'],
    backgroundImage: null,
  },

  mystic: {
    id: 'mystic',
    name: 'Mystic Purple',
    emoji: '🔮',
    description: 'Huyền bí và sâu lắng',
    colors: {
      primary: '#9C27B0',
      secondary: '#E040FB',
      accent: '#EA80FC',
      ownBubble: '#7B1FA2',
      ownBubbleText: '#FFFFFF',
      otherBubble: 'rgba(74, 20, 140, 0.7)',
      otherBubbleText: '#FFFFFF',
      inputBackground: 'rgba(156, 39, 176, 0.15)',
    },
    gradient: ['#1A0A1F', '#2D1B3D'],
    backgroundImage: null,
  },

  ocean: {
    id: 'ocean',
    name: 'Ocean Blue',
    emoji: '🌊',
    description: 'Xanh biển sâu thẳm',
    colors: {
      primary: '#0288D1',
      secondary: '#00BCD4',
      accent: '#4DD0E1',
      ownBubble: '#0277BD',
      ownBubbleText: '#FFFFFF',
      otherBubble: 'rgba(1, 87, 155, 0.7)',
      otherBubbleText: '#FFFFFF',
      inputBackground: 'rgba(2, 136, 209, 0.15)',
    },
    gradient: ['#0A1929', '#1A3A5C'],
    backgroundImage: null,
  },

  sakura: {
    id: 'sakura',
    name: 'Sakura Pink',
    emoji: '🌸',
    description: 'Hoa anh đào dịu dàng',
    colors: {
      primary: '#EC407A',
      secondary: '#F48FB1',
      accent: '#FCE4EC',
      ownBubble: '#D81B60',
      ownBubbleText: '#FFFFFF',
      otherBubble: 'rgba(136, 14, 79, 0.6)',
      otherBubbleText: '#FFFFFF',
      inputBackground: 'rgba(236, 64, 122, 0.15)',
    },
    gradient: ['#1A0F14', '#2D1B25'],
    backgroundImage: null,
  },

  forest: {
    id: 'forest',
    name: 'Forest Green',
    emoji: '🌲',
    description: 'Thiên nhiên xanh mát',
    colors: {
      primary: '#2E7D32',
      secondary: '#66BB6A',
      accent: '#A5D6A7',
      ownBubble: '#1B5E20',
      ownBubbleText: '#FFFFFF',
      otherBubble: 'rgba(27, 94, 32, 0.6)',
      otherBubbleText: '#FFFFFF',
      inputBackground: 'rgba(46, 125, 50, 0.15)',
    },
    gradient: ['#0A1A0F', '#1B3D25'],
    backgroundImage: null,
  },

  sunrise: {
    id: 'sunrise',
    name: 'Sunrise Gold',
    emoji: '🌅',
    description: 'Bình minh ấm áp',
    colors: {
      primary: '#FF8F00',
      secondary: '#FFB300',
      accent: '#FFE082',
      ownBubble: '#EF6C00',
      ownBubbleText: '#FFFFFF',
      otherBubble: 'rgba(230, 81, 0, 0.6)',
      otherBubbleText: '#FFFFFF',
      inputBackground: 'rgba(255, 143, 0, 0.15)',
    },
    gradient: ['#1A140A', '#3D2A15'],
    backgroundImage: null,
  },

  midnight: {
    id: 'midnight',
    name: 'Midnight',
    emoji: '🌙',
    description: 'Đêm khuya tĩnh lặng',
    colors: {
      primary: '#1A237E',
      secondary: '#3F51B5',
      accent: '#7986CB',
      ownBubble: '#0D1642',
      ownBubbleText: '#FFFFFF',
      otherBubble: 'rgba(26, 35, 126, 0.7)',
      otherBubbleText: '#FFFFFF',
      inputBackground: 'rgba(26, 35, 126, 0.2)',
    },
    gradient: ['#000510', '#0D1B2A'],
    backgroundImage: null,
  },

  starlight: {
    id: 'starlight',
    name: 'Starlight',
    emoji: '⭐',
    description: 'Ánh sao lung linh',
    colors: {
      primary: '#B0BEC5',
      secondary: '#ECEFF1',
      accent: '#FFFFFF',
      ownBubble: '#546E7A',
      ownBubbleText: '#FFFFFF',
      otherBubble: 'rgba(55, 71, 79, 0.7)',
      otherBubbleText: '#FFFFFF',
      inputBackground: 'rgba(176, 190, 197, 0.1)',
    },
    gradient: ['#0A0A12', '#1E1E2E'],
    backgroundImage: null,
  },
};

export const DEFAULT_THEME = 'crystal';

/**
 * Get theme by ID
 * @param {string} themeId - Theme ID
 * @returns {object} Theme object
 */
export const getTheme = (themeId) => {
  return CHAT_THEMES[themeId] || CHAT_THEMES[DEFAULT_THEME];
};

/**
 * Get all themes as array
 * @returns {array} Array of all themes
 */
export const getAllThemes = () => {
  return Object.values(CHAT_THEMES);
};

/**
 * Get theme IDs
 * @returns {array} Array of theme IDs
 */
export const getThemeIds = () => {
  return Object.keys(CHAT_THEMES);
};

export default CHAT_THEMES;
