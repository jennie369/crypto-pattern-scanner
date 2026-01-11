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

  // === LEGACY ALIASES (backward compatibility) ===
  bgCard: 'rgba(15, 16, 48, 0.55)',    // Same as glassBg
  bgDark: '#05040B',                    // Same as bgDarkest
  border: 'rgba(106, 91, 255, 0.3)',    // Same as inputBorder
  textLight: '#FFFFFF',                 // Same as textPrimary
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

  // Dark Purple (same as background) - for VisionBoard
  darkPurple: ['#05040B', '#0F1030', '#1a0b2e'],
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
  backgroundColor: 'rgba(15, 16, 48, 0.55)',

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
  backgroundColor: 'rgba(0, 0, 0, 0.3)',
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

// ═══════════════════════════════════════════════════════════
// POPUP/ALERT STYLES - Glassmorphism Frosted Glass
// Reference: matte translucent glass with blur background
// ═══════════════════════════════════════════════════════════
export const POPUP = {
  // Container
  container: {
    maxWidth: 280,
    borderRadius: 16,
  },

  // Glass card background
  glassCard: {
    backgroundColor: 'rgba(15, 25, 45, 0.85)',
    borderWidth: 1,
    borderColor: 'rgba(100, 150, 200, 0.25)',
    borderRadius: 16,
  },

  // Top border highlight
  borderGlow: {
    height: 1,
    backgroundColor: 'rgba(120, 170, 220, 0.4)',
  },

  // Content padding
  content: {
    padding: 20,
    paddingTop: 24,
  },

  // Icon container
  icon: {
    size: 48,
    borderRadius: 24,
    iconSize: 22,
    strokeWidth: 2.5,
    marginBottom: 12,
    borderWidth: 1.5,
  },

  // Icon colors by type
  iconTypes: {
    success: {
      color: '#4ADE80',
      bg: 'rgba(74, 222, 128, 0.15)',
    },
    error: {
      color: '#F87171',
      bg: 'rgba(248, 113, 113, 0.15)',
    },
    warning: {
      color: '#FBBF24',
      bg: 'rgba(251, 191, 36, 0.15)',
    },
    info: {
      color: '#60A5FA',
      bg: 'rgba(96, 165, 250, 0.15)',
    },
  },

  // Typography
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 6,
  },

  message: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: 18,
    marginBottom: 18,
  },

  // Buttons
  button: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 22,
    minWidth: 120,
  },

  buttonPrimary: {
    backgroundColor: 'rgba(245, 245, 245, 0.95)',
    textColor: '#1a1a2e',
  },

  buttonSecondary: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    textColor: '#FFFFFF',
  },

  buttonCancel: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    textColor: 'rgba(255, 255, 255, 0.6)',
  },

  buttonDestructive: {
    backgroundColor: 'rgba(248, 113, 113, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(248, 113, 113, 0.3)',
    textColor: '#F87171',
  },

  // Blur overlay
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    blurIntensity: {
      ios: 30,
      android: 80,
    },
  },
};

// ═══════════════════════════════════════════════════════════
// FONT SIZES - Convenience export (same as TYPOGRAPHY.fontSize)
// ═══════════════════════════════════════════════════════════
export const FONT_SIZES = {
  xxs: 9,
  xs: 10,
  sm: 11,
  md: 12,
  base: 13,
  lg: 14,
  xl: 15,
  xxl: 16,
  xxxl: 18,
  display: 20,
  hero: 32,
  giant: 42,
};

// ═══════════════════════════════════════════════════════════
// BORDER RADIUS - Convenience export
// ═══════════════════════════════════════════════════════════
export const BORDER_RADIUS = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 18,
  xxl: 24,
  full: 9999,
};

// ═══════════════════════════════════════════════════════════
// TOKENS - Nested structure for HTMLLessonRenderer compatibility
// ═══════════════════════════════════════════════════════════
export const tokens = {
  colors: {
    // Legacy aliases
    brand: COLORS.gold,
    primary: COLORS.purple,
    primaryDark: COLORS.purpleGlow,
    white: COLORS.textPrimary,
    surface: COLORS.glassBg,
    surfaceLight: COLORS.glassBgLight,
    surfaceDark: COLORS.bgDarkest,
    textPrimary: COLORS.textPrimary,
    textSecondary: COLORS.textSecondary,
    textTertiary: COLORS.textMuted,
    textDisabled: COLORS.textDisabled,
    // Nested structures
    accent: {
      primary: COLORS.gold,
      bg: 'rgba(255, 189, 89, 0.1)',
    },
    success: {
      text: COLORS.success,
      bg: 'rgba(58, 247, 166, 0.1)',
      border: 'rgba(58, 247, 166, 0.3)',
    },
    error: {
      text: COLORS.error,
      bg: 'rgba(255, 107, 107, 0.1)',
      border: 'rgba(255, 107, 107, 0.3)',
    },
    warning: {
      text: COLORS.warning,
      bg: 'rgba(255, 184, 0, 0.1)',
      border: 'rgba(255, 184, 0, 0.3)',
    },
    info: {
      text: COLORS.info,
      bg: 'rgba(59, 130, 246, 0.1)',
      border: 'rgba(59, 130, 246, 0.3)',
    },
    bg: {
      primary: COLORS.bgDarkest,
      secondary: COLORS.bgMid,
      tertiary: COLORS.glassBg,
    },
    text: {
      primary: COLORS.textPrimary,
      secondary: COLORS.textSecondary,
      muted: COLORS.textMuted,
      inverse: COLORS.bgDarkest,
    },
    border: {
      primary: 'rgba(106, 91, 255, 0.3)',
      secondary: 'rgba(255, 255, 255, 0.1)',
    },
    icon: COLORS.gold,
    iconInactive: COLORS.textMuted,
  },
  fontSize: {
    xs: 10,
    sm: 12,
    md: 14,
    lg: 16,
    xl: 18,
    xxl: 20,
    xxxl: 24,
  },
  spacing: SPACING,
  radius: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    full: 9999,
  },
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
};

// Colors structure for legacy compatibility
// Includes both direct color values AND nested structures
const COLORS_NESTED = {
  // Direct color values from COLORS (excluding success/error/warning/info which need nested structure)
  burgundy: COLORS.burgundy,
  burgundyDark: COLORS.burgundyDark,
  burgundyLight: COLORS.burgundyLight,
  gold: COLORS.gold,
  goldBright: COLORS.goldBright,
  goldMuted: COLORS.goldMuted,
  bgDarkest: COLORS.bgDarkest,
  bgMid: COLORS.bgMid,
  bgLight: COLORS.bgLight,
  purple: COLORS.purple,
  purpleGlow: COLORS.purpleGlow,
  cyan: COLORS.cyan,
  textPrimary: COLORS.textPrimary,
  textSecondary: COLORS.textSecondary,
  textMuted: COLORS.textMuted,
  textSubtle: COLORS.textSubtle,
  textDisabled: COLORS.textDisabled,
  glassBg: COLORS.glassBg,
  glassBgLight: COLORS.glassBgLight,
  glassBgHeavy: COLORS.glassBgHeavy,
  inputBg: COLORS.inputBg,
  inputBorder: COLORS.inputBorder,
  tierFree: COLORS.tierFree,
  tier1: COLORS.tier1,
  tier2: COLORS.tier2,
  tier3: COLORS.tier3,
  lightBg: COLORS.lightBg,
  lightCard: COLORS.lightCard,
  lightText: COLORS.lightText,
  lightTextSecondary: COLORS.lightTextSecondary,
  lightBorder: COLORS.lightBorder,
  bgWhite: COLORS.bgWhite,
  bgOffWhite: COLORS.bgOffWhite,
  bgGray: COLORS.bgGray,
  textDark: COLORS.textDark,

  // Additional direct aliases
  primary: COLORS.purple,
  secondary: COLORS.gold,
  background: COLORS.bgDarkest,
  card: COLORS.glassBg,

  // Nested accent structure (for tokens.colors.accent.primary)
  accent: {
    primary: COLORS.gold,
    secondary: COLORS.purple,
  },

  // Nested status structures (for tokens.colors.success.text, tokens.colors.error.bg, etc.)
  success: {
    text: COLORS.success,
    bg: 'rgba(58, 247, 166, 0.1)',
    border: 'rgba(58, 247, 166, 0.3)',
  },
  error: {
    text: COLORS.error,
    bg: 'rgba(255, 107, 107, 0.1)',
    border: 'rgba(255, 107, 107, 0.3)',
  },
  warning: {
    text: COLORS.warning,
    bg: 'rgba(255, 184, 0, 0.1)',
    border: 'rgba(255, 184, 0, 0.3)',
  },
  info: {
    text: COLORS.info,
    bg: 'rgba(59, 130, 246, 0.1)',
    border: 'rgba(59, 130, 246, 0.3)',
  },

  // Nested text structure (for tokens.colors.text.primary)
  text: {
    primary: COLORS.textPrimary,
    secondary: COLORS.textSecondary,
    muted: COLORS.textMuted,
    inverse: COLORS.bgDarkest,
  },

  // Nested bg structure (for tokens.colors.bg.primary)
  bg: {
    primary: COLORS.bgDarkest,
    secondary: COLORS.glassBg,
    tertiary: COLORS.glassBgLight,
  },

  // Nested border structure (for tokens.colors.border.primary)
  border: {
    primary: 'rgba(255, 255, 255, 0.1)',
    secondary: 'rgba(255, 255, 255, 0.05)',
  },
};

// Default export for convenience
// Includes both UPPERCASE (standard) and lowercase (legacy compatibility) aliases
export default {
  // UPPERCASE (standard)
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
  POPUP,
  FONT_SIZES,
  BORDER_RADIUS,
  // lowercase aliases (for legacy compatibility)
  spacing: SPACING,
  colors: COLORS_NESTED,
  gradients: GRADIENTS,
  typography: TYPOGRAPHY,
  glass: GLASS,
  button: BUTTON,
  input: INPUT,
  badge: BADGE,
  layout: LAYOUT,
  touch: TOUCH,
  shadows: SHADOWS,
  animation: ANIMATION,
  zIndex: Z_INDEX,
  popup: POPUP,
  fontSize: FONT_SIZES,
  fontSizes: FONT_SIZES,
  borderRadius: BORDER_RADIUS,
  radius: BORDER_RADIUS,
  fontWeight: TYPOGRAPHY.fontWeight,
};
