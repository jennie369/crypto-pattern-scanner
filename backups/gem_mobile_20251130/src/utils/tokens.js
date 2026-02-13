/**
 * Gemral - Design Tokens v3.0
 * Exact match to GEM_LIQUID_GLASS_COMPONENTS.html
 */

// ═══════════════════════════════════════════════════════════
// SPACING
// ═══════════════════════════════════════════════════════════
export const SPACING = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,     // MOST USED
  lg: 16,
  xl: 18,     // Glass card padding (EXACT)
  xxl: 20,
  xxxl: 24,
  huge: 32,
  giant: 40
};

// ═══════════════════════════════════════════════════════════
// COLORS - EXACT FROM REFERENCE
// ═══════════════════════════════════════════════════════════
export const COLORS = {
  // === PRIMARY BRAND ===
  burgundy: '#9C0612',
  burgundyDark: '#6B0F1A',
  burgundyLight: '#C41E2A',
  gold: '#FFBD59',
  goldBright: '#FFD700',
  goldMuted: '#D4A84B',

  // === BACKGROUND GRADIENT ===
  bgDarkest: '#05040B',
  bgMid: '#0F1030',
  bgLight: '#1a0b2e',

  // === ACCENT COLORS (EXACT) ===
  purple: '#6A5BFF',
  purpleGlow: '#8C64FF',
  cyan: '#00F0FF',          // EXACT (not #00D9FF!)

  // === FUNCTIONAL COLORS (EXACT) ===
  success: '#3AF7A6',       // EXACT (not #00FF88!)
  error: '#FF6B6B',         // EXACT (not #FF4444!)
  warning: '#FFB800',
  info: '#3B82F6',

  // === TEXT COLORS ===
  textPrimary: '#FFFFFF',
  textSecondary: 'rgba(255, 255, 255, 0.8)',
  textMuted: 'rgba(255, 255, 255, 0.6)',
  textSubtle: 'rgba(255, 255, 255, 0.5)',
  textDisabled: 'rgba(255, 255, 255, 0.4)',

  // === GLASS CARD ===
  glassBg: 'rgba(15, 16, 48, 0.55)',
  glassBgLight: 'rgba(15, 16, 48, 0.5)',
  glassBgHeavy: 'rgba(15, 16, 48, 0.6)',

  // === INPUT ===
  inputBg: 'rgba(0, 0, 0, 0.3)',
  inputBorder: 'rgba(106, 91, 255, 0.3)',

  // === TIER BADGES ===
  tierFree: 'rgba(255, 255, 255, 0.2)',
  tier1: '#FFBD59',
  tier2: '#3B82F6',
  tier3: '#9C0612',

  // === LIGHT THEME (for Forum/Shop) ===
  lightBg: '#F7F8FA',
  lightCard: '#FFFFFF',
  lightText: '#111827',
  lightTextSecondary: '#6B7280',
  lightBorder: '#E5E7EB',

  // === LIGHT THEME ALIASES (for Shop) ===
  bgWhite: '#FFFFFF',
  bgOffWhite: '#F7F8FA',
  bgGray: '#E5E7EB',
  textDark: '#111827',
};

// ═══════════════════════════════════════════════════════════
// GRADIENTS
// ═══════════════════════════════════════════════════════════
export const GRADIENTS = {
  // Background gradient (EXACT)
  background: ['#05040B', '#0F1030', '#1a0b2e'],
  backgroundLocations: [0, 0.5, 1],

  // Button gradient (EXACT)
  primaryButton: ['#9C0612', '#6B0F1A'],

  // Glass border gradient (EXACT)
  glassBorder: ['#6A5BFF', '#00F0FF'],

  // Toggle switch active
  toggleActive: ['#3AF7A6', '#00F0FF'],

  // Asset icon default
  assetIcon: ['#6A5BFF', '#00F0FF'],

  // Special gradients
  gold: ['#FFBD59', '#FFD700'],
  avatar: ['#FFBD59', '#9C0612'],
};

// ═══════════════════════════════════════════════════════════
// TYPOGRAPHY - EXACT FROM REFERENCE
// ═══════════════════════════════════════════════════════════
export const TYPOGRAPHY = {
  // Font families (iOS will use SF Pro Display)
  fontFamily: {
    primary: 'System',  // SF Pro Display on iOS
    mono: 'Menlo',      // SF Mono fallback
  },

  // Font sizes (EXACT from reference)
  fontSize: {
    xs: 10,
    sm: 11,       // Labels
    md: 12,       // Small text
    base: 13,     // Body small
    lg: 14,       // Body
    xl: 15,       // Buttons
    xxl: 16,      // Large body
    xxxl: 18,     // Card titles
    display: 20,  // APY
    hero: 32,     // Amount input
    giant: 42,    // Balance amount
  },

  // Font weights
  fontWeight: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  },

  // Line heights
  lineHeight: {
    tight: 1.2,
    normal: 1.4,
    relaxed: 1.6,
  },

  // Letter spacing
  letterSpacing: {
    tight: -2,      // Balance display
    normal: 0,
    wide: 0.5,
    wider: 1.2,     // Uppercase labels
  },
};

// ═══════════════════════════════════════════════════════════
// GLASS CARD STYLES - EXACT FROM REFERENCE
// ═══════════════════════════════════════════════════════════
export const GLASS = {
  // Background
  background: 'rgba(15, 16, 48, 0.55)',

  // Blur
  blur: 18,         // EXACT: 18px (not 20!)
  saturate: 180,    // EXACT: 180%

  // Border
  borderWidth: 1.2,
  borderRadius: 18, // EXACT: 18px (not 24!)

  // Border gradient colors
  borderStart: '#6A5BFF',
  borderEnd: '#00F0FF',

  // Shadows (multi-layer)
  shadowColor: 'rgba(0, 0, 0, 0.7)',
  shadowOffset: { width: 0, height: 10 },
  shadowRadius: 20,

  // Purple glow
  glowColor: '#8C64FF',
  glowOpacity: 0.22,
  glowBlur: 40,

  // Padding
  padding: 20,      // EXACT
};

// ═══════════════════════════════════════════════════════════
// BUTTONS - EXACT FROM REFERENCE
// ═══════════════════════════════════════════════════════════
export const BUTTON = {
  primary: {
    padding: 16,
    borderRadius: 12,  // EXACT (not 24!)
    borderWidth: 1,
    borderColor: '#FFBD59',
    fontSize: 15,
    fontWeight: '600',
  },

  control: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },

  timeframe: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    fontSize: 13,
    fontWeight: '600',
  },
};

// ═══════════════════════════════════════════════════════════
// INPUT - EXACT FROM REFERENCE
// ═══════════════════════════════════════════════════════════
export const INPUT = {
  borderRadius: 12,
  padding: 18,
  background: 'rgba(0, 0, 0, 0.3)',
  borderColor: 'rgba(106, 91, 255, 0.3)',
  borderColorFocus: '#6A5BFF',

  // Amount input
  amountFontSize: 32,
  amountFontWeight: '700',
};

// ═══════════════════════════════════════════════════════════
// BADGES - EXACT FROM REFERENCE
// ═══════════════════════════════════════════════════════════
export const BADGE = {
  direction: {
    padding: { vertical: 6, horizontal: 12 },
    borderRadius: 8,
    fontSize: 11,
    fontWeight: '700',
  },

  pattern: {
    size: 42,
    borderRadius: 10,
    fontSize: 11,
    fontWeight: '800',
    borderWidth: 1.5,
  },

  tier: {
    padding: { vertical: 4, horizontal: 10 },
    borderRadius: 6,
    fontSize: 10,
    fontWeight: '700',
  },
};

// ═══════════════════════════════════════════════════════════
// LAYOUT
// ═══════════════════════════════════════════════════════════
export const LAYOUT = {
  screenPadding: 16,
  cardWidth: 340,     // Reference width
  cardMargin: 12,

  // Safe areas
  safeAreaTop: 50,
  safeAreaBottom: 34,

  // Header/Tab
  headerHeight: 70,
  tabBarHeight: 70,
};

// ═══════════════════════════════════════════════════════════
// TOUCH TARGETS
// ═══════════════════════════════════════════════════════════
export const TOUCH = {
  minimum: 44,        // Apple HIG minimum
  recommended: 48,
  comfortable: 56,
  gap: 8,

  // Icons & Avatars
  iconSize: 20,
  avatarSm: 32,
  avatarMd: 42,       // EXACT from reference
  avatarLg: 56,
};

// ═══════════════════════════════════════════════════════════
// SHADOWS - EXACT FROM REFERENCE
// ═══════════════════════════════════════════════════════════
export const SHADOWS = {
  // Light theme shadows (for Shop)
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },

  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },

  // Dark theme shadows
  glass: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.7,
    shadowRadius: 20,
    elevation: 10,
  },

  glassHover: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.8,
    shadowRadius: 30,
    elevation: 15,
  },

  button: {
    shadowColor: '#9C0612',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 8,
  },

  assetIcon: {
    shadowColor: '#6A5BFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
};

// ═══════════════════════════════════════════════════════════
// ANIMATION - EXACT FROM REFERENCE
// ═══════════════════════════════════════════════════════════
export const ANIMATION = {
  duration: {
    fast: 150,
    normal: 300,
    slow: 400,      // Glass card transition
  },

  easing: {
    default: [0.4, 0, 0.2, 1],  // cubic-bezier
  },
};

// ═══════════════════════════════════════════════════════════
// Z-INDEX
// ═══════════════════════════════════════════════════════════
export const Z_INDEX = {
  base: 0,
  glowEffect: -1,
  card: 1,
  dropdown: 1000,
  modal: 1050,
  tooltip: 1070,
};

// Default export for convenience
export default {
  SPACING,
  COLORS,
  GRADIENTS,
  TYPOGRAPHY,
  GLASS,
  BUTTON,
  INPUT,
  BADGE,
  LAYOUT,
  TOUCH,
  SHADOWS,
  ANIMATION,
  Z_INDEX,
};
