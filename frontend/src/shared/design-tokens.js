/**
 * GEM PLATFORM - Shared Design Tokens
 * Re-exports tokens for components that need COLORS, TIER_STYLES, ANIMATION
 */

import { tokens } from '../styles/tokens';

// COLORS - flatten from tokens.colors
export const COLORS = {
  // Base backgrounds
  bgPrimary: tokens.colors.bgPrimary,
  bgSecondary: tokens.colors.bgSecondary,
  bgTertiary: tokens.colors.bgTertiary,
  bgGradient: tokens.colors.bgGradient,

  // Glass backgrounds
  bgCard: tokens.colors.bgCard,
  bgCardHover: tokens.colors.bgCardHover,
  bgGlass: tokens.colors.bgGlass,
  bgGlassLight: tokens.colors.bgGlassLight,
  bgGlassDark: tokens.colors.bgGlassDark,

  // Brand colors
  gold: tokens.colors.brandGold,
  burgundy: tokens.colors.brandBurgundy,
  purple: tokens.colors.brandPurple,
  pink: tokens.colors.brandPink,
  cyan: tokens.colors.brandCyan,
  blue: tokens.colors.brandBlue,

  // Functional colors
  success: tokens.colors.accentGreen,
  error: tokens.colors.accentRed,
  warning: tokens.colors.accentOrange,

  // Text colors
  textPrimary: tokens.colors.textPrimary,
  textSecondary: tokens.colors.textSecondary,
  textMuted: tokens.colors.textMuted,
  textDisabled: tokens.colors.textDisabled,

  // Course colors
  coursePrimary: tokens.colors.coursePrimary,
  courseAccent: tokens.colors.courseAccent,
  courseGlow: tokens.colors.courseGlow,
  courseBg: tokens.colors.courseBg,

  // Tier colors
  tierFree: tokens.colors.tierFree,
  tier1: tokens.colors.tier1,
  tier2: tokens.colors.tier2,
  tier3: tokens.colors.tier3,

  // Glow colors
  glowBlueBright: tokens.colors.glowBlueBright,
  glowBlueMedium: tokens.colors.glowBlueMedium,
  glowBlueDark: tokens.colors.glowBlueDark,

  // Common color aliases (used by CourseCard and other components)
  primary: tokens.colors.coursePrimary, // #00D9FF - cyan/blue
  accent: tokens.colors.courseAccent,   // #4A90E2 - blue accent
  info: tokens.colors.brandBlue,        // #4D9DE0 - info blue
};

// TIER_STYLES - styling for different membership tiers
export const TIER_STYLES = {
  free: {
    color: '#3AF7A6',
    colorDark: '#00D4AA',
    bg: 'rgba(58, 247, 166, 0.1)',
    bgLight: 'rgba(58, 247, 166, 0.1)',
    border: 'rgba(58, 247, 166, 0.3)',
    gradient: 'linear-gradient(135deg, #3AF7A6 0%, #00D4AA 100%)',
    label: 'Free',
  },
  tier1: {
    color: '#00F0FF',
    colorDark: '#00B8D4',
    bg: 'rgba(0, 240, 255, 0.1)',
    bgLight: 'rgba(0, 240, 255, 0.1)',
    border: 'rgba(0, 240, 255, 0.3)',
    gradient: 'linear-gradient(135deg, #00F0FF 0%, #00B8D4 100%)',
    label: 'Tier 1',
  },
  tier2: {
    color: '#6A5BFF',
    colorDark: '#8B5CF6',
    bg: 'rgba(106, 91, 255, 0.1)',
    bgLight: 'rgba(106, 91, 255, 0.1)',
    border: 'rgba(106, 91, 255, 0.3)',
    gradient: 'linear-gradient(135deg, #6A5BFF 0%, #8B5CF6 100%)',
    label: 'Tier 2',
  },
  tier3: {
    color: '#FFBD59',
    colorDark: '#E6A64D',
    bg: 'rgba(255, 189, 89, 0.1)',
    bgLight: 'rgba(255, 189, 89, 0.1)',
    border: 'rgba(255, 189, 89, 0.3)',
    gradient: 'linear-gradient(135deg, #FFBD59 0%, #E6A64D 100%)',
    label: 'Premium',
  },
};

// ANIMATION - common animation settings for Framer Motion
export const ANIMATION = {
  // Standard transitions
  transition: {
    fast: { duration: 0.15, ease: 'easeOut' },
    base: { duration: 0.3, ease: 'easeOut' },
    slow: { duration: 0.5, ease: 'easeOut' },
    spring: { type: 'spring', stiffness: 300, damping: 30 },
  },

  // Fade animations
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },

  // Slide animations
  slideUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 },
  },
  slideDown: {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  },
  slideLeft: {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 },
  },
  slideRight: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  },

  // Scale animations
  scaleIn: {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.9 },
  },

  // Hover effects
  hover: {
    scale: 1.02,
    transition: { duration: 0.2 },
  },
  tap: {
    scale: 0.98,
  },

  // Card hover
  cardHover: {
    y: -4,
    transition: { duration: 0.2 },
  },

  // Stagger children
  stagger: {
    animate: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  },
};

// CALLOUT_STYLES - for article/content callouts
export const CALLOUT_STYLES = {
  info: {
    bg: 'rgba(0, 217, 255, 0.1)',
    border: 'rgba(0, 217, 255, 0.3)',
    color: '#00D9FF',
    icon: 'info',
  },
  warning: {
    bg: 'rgba(255, 159, 67, 0.1)',
    border: 'rgba(255, 159, 67, 0.3)',
    color: '#FF9F43',
    icon: 'alert-triangle',
  },
  success: {
    bg: 'rgba(0, 255, 136, 0.1)',
    border: 'rgba(0, 255, 136, 0.3)',
    color: '#00FF88',
    icon: 'check-circle',
  },
  error: {
    bg: 'rgba(255, 71, 87, 0.1)',
    border: 'rgba(255, 71, 87, 0.3)',
    color: '#FF4757',
    icon: 'x-circle',
  },
  tip: {
    bg: 'rgba(255, 189, 89, 0.1)',
    border: 'rgba(255, 189, 89, 0.3)',
    color: '#FFBD59',
    icon: 'lightbulb',
  },
  note: {
    bg: 'rgba(139, 92, 246, 0.1)',
    border: 'rgba(139, 92, 246, 0.3)',
    color: '#8B5CF6',
    icon: 'bookmark',
  },
};

// Re-export full tokens for components that need all values
export { tokens };
export default { COLORS, TIER_STYLES, ANIMATION, CALLOUT_STYLES, tokens };
