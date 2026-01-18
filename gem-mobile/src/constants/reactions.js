/**
 * Reaction Constants
 * Quick and full emoji reactions for messages
 */

// Quick reactions - 7 emojis displayed in inline picker
export const QUICK_REACTIONS = [
  '❤️',  // Love
  '😂',  // Laugh
  '😮',  // Wow
  '😢',  // Sad
  '😡',  // Angry
  '👍',  // Like
  '👎',  // Dislike
];

// Full emoji picker categories
export const EMOJI_CATEGORIES = {
  recent: {
    key: 'recent',
    title: 'Gần đây',
    emojis: ['❤️', '😂', '👍', '🔥', '💯', '🙏'],
  },
  smileys: {
    key: 'smileys',
    title: 'Mặt cười',
    emojis: ['😀', '😃', '😄', '😁', '😅', '😂', '🤣', '😊', '😇', '🥰', '😍', '🤩'],
  },
  gestures: {
    key: 'gestures',
    title: 'Cử chỉ',
    emojis: ['👍', '👎', '👏', '🙌', '🤝', '🙏', '💪', '✌️', '🤞', '🤟', '🤙', '👋'],
  },
  hearts: {
    key: 'hearts',
    title: 'Tim',
    emojis: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '💔', '❤️‍🔥', '💕', '💖'],
  },
  objects: {
    key: 'objects',
    title: 'Đồ vật',
    emojis: ['🔥', '⭐', '💯', '✨', '💎', '🎯', '🚀', '💰', '📈', '📉', '💹', '🎉'],
  },
};

// All available reactions (flattened)
export const ALL_REACTIONS = Object.values(EMOJI_CATEGORIES)
  .flatMap(category => category.emojis)
  .filter((emoji, index, self) => self.indexOf(emoji) === index); // Remove duplicates

// =============================================
// FORUM POST REACTIONS (Facebook-style)
// =============================================

/**
 * Forum reaction types enum
 */
export const REACTION_TYPES = {
  LIKE: 'like',
  LOVE: 'love',
  HAHA: 'haha',
  WOW: 'wow',
  SAD: 'sad',
  ANGRY: 'angry',
};

/**
 * Forum reaction configuration
 * Each reaction has: type, label (Vietnamese), emoji, and color
 */
export const REACTION_CONFIG = {
  like: {
    type: 'like',
    label: 'Thích',
    emoji: '👍',
    color: '#2196F3',
  },
  love: {
    type: 'love',
    label: 'Yêu thích',
    emoji: '❤️',
    color: '#E91E63',
  },
  haha: {
    type: 'haha',
    label: 'Haha',
    emoji: '😂',
    color: '#FFEB3B',
  },
  wow: {
    type: 'wow',
    label: 'Wow',
    emoji: '😮',
    color: '#FFEB3B',
  },
  sad: {
    type: 'sad',
    label: 'Buồn',
    emoji: '😢',
    color: '#FFEB3B',
  },
  angry: {
    type: 'angry',
    label: 'Phẫn nộ',
    emoji: '😡',
    color: '#FF9800',
  },
};

/**
 * Order of reactions in picker (left to right)
 */
export const REACTION_ORDER = ['like', 'love', 'haha', 'wow', 'sad', 'angry'];

/**
 * Animation timing constants - OPTIMIZED for speed
 */
export const REACTION_ANIMATIONS = {
  LONG_PRESS_THRESHOLD: 200,    // ms to trigger long press (reduced from 300)
  PICKER_APPEAR_DURATION: 120,  // ms for picker fade in (reduced from 200)
  STAGGER_DELAY: 0,             // ms delay between each icon animation (disabled)
  HOVER_SCALE: 1.3,             // scale factor on hover (reduced from 1.4)
  HOVER_DURATION: 80,           // ms for hover transition (reduced from 150)
  SELECTION_DURATION: 100,      // ms for selection animation (reduced from 200)
  LABEL_TRANSLATE_Y: -24,       // px to move label up
};

/**
 * Dimension constants for reaction picker (Facebook-style)
 * Optimized for 6 reactions with proper spacing
 */
export const REACTION_SIZES = {
  // Picker dimensions
  PICKER_WIDTH: 280,           // Width to fit 6 icons with proper spacing
  PICKER_HEIGHT: 48,           // Height for picker bar
  PICKER_BORDER_RADIUS: 24,    // Half of height for pill shape
  PICKER_EMOJI_SIZE: 24,       // Emoji size in picker (larger for selection)
  // Button dimensions (Facebook-like small size)
  ICON_SIZE: 20,               // Base icon size for buttons
  ICON_SPACING: 6,             // Spacing between icons
  PADDING_HORIZONTAL: 12,      // Horizontal padding
  EMOJI_FONT_SIZE: 18,         // Small emoji for button display (matches other icons)
  // Note: Container needs ~fontSize * 1.2 to prevent clipping on mobile
};

/**
 * Default empty reaction counts object
 */
export const DEFAULT_REACTION_COUNTS = {
  like: 0,
  love: 0,
  haha: 0,
  wow: 0,
  sad: 0,
  angry: 0,
  total: 0,
};

/**
 * Tooltip messages for reactions feature
 */
export const REACTION_TOOLTIPS = {
  PICKER: 'Giữ để chọn cảm xúc',
  FIRST_TIME: 'Thử giữ nút để xem thêm cảm xúc!',
  SUMMARY: 'Nhấn để xem ai đã thả cảm xúc',
};

export default {
  QUICK_REACTIONS,
  EMOJI_CATEGORIES,
  ALL_REACTIONS,
  // Forum reactions
  REACTION_TYPES,
  REACTION_CONFIG,
  REACTION_ORDER,
  REACTION_ANIMATIONS,
  REACTION_SIZES,
  DEFAULT_REACTION_COUNTS,
  REACTION_TOOLTIPS,
};
