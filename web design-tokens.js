/**
 * Shared Design Tokens - Match Mobile tokens.js
 * Used for inline styles and Framer Motion animations
 * CSS variables are in design-tokens.css
 */

// =============================================
// COLORS - Match Mobile tokens.js
// =============================================

export const COLORS = {
  // Primary
  primary: '#FFBD59',      // Gold
  primaryDark: '#FF8A00',

  // Accent
  accent: '#6A5BFF',       // Purple
  accentLight: '#8B7FFF',

  // Status
  success: '#3AF7A6',
  error: '#FF6B6B',
  warning: '#FFB800',
  info: '#00F0FF',

  // Background
  bgPrimary: '#0A0B1A',
  bgSecondary: '#0F1028',
  bgCard: '#1A1B3A',
  bgCardHover: '#222352',
  bgGlass: 'rgba(15, 16, 48, 0.55)',
  bgGlassLight: 'rgba(26, 27, 58, 0.7)',

  // Text
  textPrimary: '#FFFFFF',
  textSecondary: '#B8B8D0',
  textMuted: 'rgba(255, 255, 255, 0.6)',
  textDisabled: 'rgba(255, 255, 255, 0.35)',

  // Border
  borderLight: 'rgba(255, 255, 255, 0.1)',
  borderAccent: 'rgba(106, 91, 255, 0.3)',
  borderGold: 'rgba(255, 189, 89, 0.3)',

  // Tier Colors - Match Mobile exactly
  tierFree: '#3AF7A6',     // Green
  tierOne: '#00F0FF',      // Cyan
  tierTwo: '#6A5BFF',      // Purple
  tierThree: '#FFBD59',    // Gold
};

// =============================================
// TIER STYLES - For CourseCard badges
// =============================================

export const TIER_STYLES = {
  FREE: {
    color: COLORS.tierFree,
    bg: 'rgba(58, 247, 166, 0.15)',
    border: 'rgba(58, 247, 166, 0.3)',
    label: 'Miễn phí',
    labelEN: 'Free',
  },
  TIER1: {
    color: COLORS.tierOne,
    bg: 'rgba(0, 240, 255, 0.15)',
    border: 'rgba(0, 240, 255, 0.3)',
    label: 'Tier 1',
    labelEN: 'Tier 1',
  },
  TIER2: {
    color: COLORS.tierTwo,
    bg: 'rgba(106, 91, 255, 0.15)',
    border: 'rgba(106, 91, 255, 0.3)',
    label: 'Tier 2',
    labelEN: 'Tier 2',
  },
  TIER3: {
    color: COLORS.tierThree,
    bg: 'rgba(255, 189, 89, 0.15)',
    border: 'rgba(255, 189, 89, 0.3)',
    label: 'Tier 3',
    labelEN: 'Tier 3',
  },
};

// =============================================
// GRADIENTS
// =============================================

export const GRADIENTS = {
  background: ['#0A0B1A', '#0F1028', '#1A1B3A'],
  primary: ['#FFBD59', '#FF8A00'],
  accent: ['#6A5BFF', '#8B7FFF'],
  success: ['#3AF7A6', '#00D4AA'],
  card: ['#1A1B3A', '#0F1028'],

  // CSS string versions
  backgroundCSS: 'linear-gradient(135deg, #0A0B1A 0%, #0F1028 50%, #1A1B3A 100%)',
  primaryCSS: 'linear-gradient(135deg, #FFBD59 0%, #FF8A00 100%)',
  accentCSS: 'linear-gradient(135deg, #6A5BFF 0%, #8B7FFF 100%)',
  cardCSS: 'linear-gradient(180deg, #1A1B3A 0%, #0F1028 100%)',
};

// =============================================
// SPACING (8-point grid)
// =============================================

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
  '3xl': 40,
  '4xl': 48,
};

// =============================================
// TYPOGRAPHY
// =============================================

export const TYPOGRAPHY = {
  // Font sizes
  fontSize: {
    xs: 10,
    sm: 12,
    base: 14,
    md: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 28,
    '4xl': 32,
    '5xl': 40,
  },

  // Font weights
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },

  // Line heights
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
};

// =============================================
// BORDER RADIUS
// =============================================

export const RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  full: 9999,
};

// =============================================
// SHADOWS
// =============================================

export const SHADOWS = {
  sm: '0 2px 8px rgba(0, 0, 0, 0.15)',
  md: '0 4px 16px rgba(0, 0, 0, 0.2)',
  lg: '0 8px 32px rgba(0, 0, 0, 0.25)',
  glow: {
    gold: '0 0 20px rgba(255, 189, 89, 0.3)',
    purple: '0 0 20px rgba(106, 91, 255, 0.3)',
    cyan: '0 0 20px rgba(0, 240, 255, 0.3)',
    green: '0 0 20px rgba(58, 247, 166, 0.3)',
  },
  card: '0 4px 20px rgba(0, 0, 0, 0.3)',
  cardHover: '0 8px 30px rgba(0, 0, 0, 0.4)',
};

// =============================================
// ANIMATION PRESETS - For Framer Motion
// =============================================

export const ANIMATION = {
  // Durations (ms)
  fast: 150,
  normal: 300,
  slow: 500,

  // Easing
  easeOut: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  easeInOut: 'cubic-bezier(0.645, 0.045, 0.355, 1)',

  // Spring configs for Framer Motion
  spring: { type: 'spring', stiffness: 300, damping: 30 },
  springBouncy: { type: 'spring', stiffness: 400, damping: 25 },
  springSmooth: { type: 'spring', stiffness: 200, damping: 35 },

  // Card hover animation
  cardHover: {
    scale: 1.02,
    y: -8,
    transition: { type: 'spring', stiffness: 300, damping: 20 },
  },

  // Accordion animation
  accordion: {
    initial: { height: 0, opacity: 0 },
    animate: { height: 'auto', opacity: 1 },
    exit: { height: 0, opacity: 0 },
    transition: { duration: 0.3, ease: 'easeInOut' },
  },

  // Fade in animation
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.2 },
  },

  // Slide up animation
  slideUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.3 },
  },

  // Stagger container
  stagger: {
    animate: {
      transition: { staggerChildren: 0.1 },
    },
  },
};

// =============================================
// BREAKPOINTS
// =============================================

export const BREAKPOINTS = {
  xs: 375,   // Small phones
  sm: 640,   // Large phones / Small tablets
  md: 768,   // Tablets
  lg: 1024,  // Small desktops
  xl: 1280,  // Large desktops
  '2xl': 1536, // Extra large
};

// =============================================
// CALLOUT STYLES - For ArticleRenderer
// =============================================

export const CALLOUT_STYLES = {
  info: {
    bg: 'rgba(0, 240, 255, 0.1)',
    border: 'rgba(0, 240, 255, 0.3)',
    iconColor: COLORS.info,
  },
  warning: {
    bg: 'rgba(255, 184, 0, 0.1)',
    border: 'rgba(255, 184, 0, 0.3)',
    iconColor: COLORS.warning,
  },
  tip: {
    bg: 'rgba(58, 247, 166, 0.1)',
    border: 'rgba(58, 247, 166, 0.3)',
    iconColor: COLORS.success,
  },
  success: {
    bg: 'rgba(58, 247, 166, 0.1)',
    border: 'rgba(58, 247, 166, 0.3)',
    iconColor: COLORS.success,
  },
  error: {
    bg: 'rgba(255, 107, 107, 0.1)',
    border: 'rgba(255, 107, 107, 0.3)',
    iconColor: COLORS.error,
  },
};

export default {
  COLORS,
  TIER_STYLES,
  GRADIENTS,
  SPACING,
  TYPOGRAPHY,
  RADIUS,
  SHADOWS,
  ANIMATION,
  BREAKPOINTS,
  CALLOUT_STYLES,
};
