/**
 * Gemral - Light Theme Constants v1.0
 * EXACT values from CATALOG_ATOMS.html design system
 *
 * CRITICAL RULES:
 * - Background: #FFFFFF (pure white)
 * - Text: #000000 (pure black) with font-weight 500
 * - Cards: #FFFFFF with #CCCCCC border and shadow
 * - Primary Actions: #9C0612 (burgundy)
 * - Toggle On: #059669 (green)
 */

import { SPACING, TYPOGRAPHY } from '../utils/tokens';

// ═══════════════════════════════════════════════════════════
// LIGHT THEME COLORS - EXACT FROM CATALOG_ATOMS.html
// ═══════════════════════════════════════════════════════════
export const LIGHT_COLORS = {
  // === PRIMARY BRAND (keep consistent) ===
  burgundy: '#9C0612',
  burgundyDark: '#6B0F1A',
  burgundyLight: '#C41E2A',
  gold: '#FFBD59',
  goldBright: '#FFD700',
  goldMuted: '#D4A84B',

  // === BACKGROUND (LIGHT THEME) ===
  bgDarkest: '#FFFFFF',           // White instead of dark
  bgMid: '#F5F5F5',               // Light gray for sections
  bgLight: '#FAFAFA',             // Very light gray

  // === ACCENT COLORS ===
  purple: '#9C0612',              // Use burgundy as primary accent
  purpleGlow: '#9C0612',
  cyan: '#0066CC',                // Blue for links/numbers

  // === FUNCTIONAL COLORS (adapted for light bg) ===
  success: '#D4EDDA',             // Light green bg
  successText: '#155724',         // Dark green text
  error: '#F8D7DA',               // Light red bg
  errorText: '#721C24',           // Dark red text
  warning: '#FFF3CD',             // Light yellow bg
  warningText: '#856404',         // Dark yellow text
  info: '#CCE5FF',                // Light blue bg
  infoText: '#004085',            // Dark blue text

  // === TEXT COLORS (BLACK on WHITE) ===
  // WCAG AA requires 4.5:1 contrast ratio for normal text
  textPrimary: '#000000',                   // 21:1 contrast - highest
  textSecondary: 'rgba(0, 0, 0, 0.75)',     // ~7:1 contrast - good
  textMuted: 'rgba(0, 0, 0, 0.6)',          // ~5.3:1 contrast - meets AA
  textSubtle: 'rgba(0, 0, 0, 0.55)',        // ~4.7:1 contrast - meets AA
  textDisabled: 'rgba(0, 0, 0, 0.4)',       // ~3.0:1 - acceptable for disabled

  // === GLASS/CARD (LIGHT VERSION) ===
  glassBg: '#FFFFFF',
  glassBgLight: '#FAFAFA',
  glassBgHeavy: '#F0F0F0',
  glassBorder: '#CCCCCC',

  // === INPUT ===
  inputBg: '#FFFFFF',
  inputBorder: '#CCCCCC',
  inputFocusBorder: '#9C0612',     // Burgundy focus

  // === TIER BADGES (darker for visibility) ===
  tierFree: 'rgba(0, 0, 0, 0.1)',
  tier1: '#FFBD59',
  tier2: '#3B82F6',
  tier3: '#9C0612',

  // === INTERACTIVE ===
  toggleOn: '#059669',             // Green toggle
  toggleOff: '#CCCCCC',
  link: '#0066CC',                 // Blue links

  // === BORDER ===
  border: '#CCCCCC',
  borderLight: '#E5E5E5',
  borderDark: '#999999',

  // === SHADOW ===
  shadowColor: '#000000',
  shadowOpacity: 0.15,

  // === LEGACY ALIASES (for compatibility with dark theme) ===
  bgCard: '#FFFFFF',
  bgDark: '#FFFFFF',
  textLight: '#000000',

  // Additional aliases for components expecting dark theme color names
  primary: '#9C0612',                       // Burgundy as primary
  secondary: '#0066CC',                     // Blue as secondary

  // Icon specific (high contrast versions for light mode)
  iconPrimary: '#1A1A1A',                   // Near-black for icons
  iconSecondary: '#4A4A4A',                 // Dark gray for secondary icons
  iconMuted: '#6B6B6B',                     // Medium gray for muted icons
};

// ═══════════════════════════════════════════════════════════
// LIGHT THEME GRADIENTS
// ═══════════════════════════════════════════════════════════
export const LIGHT_GRADIENTS = {
  // Background gradient (subtle gray)
  background: ['#FFFFFF', '#F5F5F5', '#EEEEEE'],
  backgroundLocations: [0, 0.5, 1],

  // Button gradient (burgundy - keep same)
  primaryButton: ['#9C0612', '#6B0F1A'],

  // Toggle switch active
  toggleActive: ['#059669', '#10B981'],

  // Gold (keep same)
  gold: ['#FFBD59', '#FFD700'],
};

// ═══════════════════════════════════════════════════════════
// LIGHT GLASS CARD STYLES - FROM CATALOG_ATOMS.html
// ═══════════════════════════════════════════════════════════
export const LIGHT_GLASS = {
  // Background
  backgroundColor: '#FFFFFF',

  // No blur for light theme (clean look)
  blur: 0,
  saturate: 100,

  // Border (gray instead of gradient)
  borderWidth: 1,
  borderRadius: 18,
  borderColor: '#CCCCCC',

  // Shadow (subtle)
  shadowColor: '#000000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.15,
  shadowRadius: 8,
  elevation: 4,

  // No glow for light theme
  glowColor: 'transparent',
  glowOpacity: 0,
  glowBlur: 0,

  // Padding (keep same)
  padding: 20,
  paddingLg: 24,
  paddingMd: 18,
  paddingSm: 12,
};

// ═══════════════════════════════════════════════════════════
// LIGHT THEME OBJECT (matches DARK_THEME structure)
// ═══════════════════════════════════════════════════════════
export const LIGHT_THEME = {
  // === BASE BACKGROUND ===
  background: {
    darkest: LIGHT_COLORS.bgDarkest,      // #FFFFFF
    mid: LIGHT_COLORS.bgMid,              // #F5F5F5
    light: LIGHT_COLORS.bgLight,          // #FAFAFA

    // Card backgrounds
    glass: LIGHT_COLORS.glassBg,          // #FFFFFF
    glassLight: LIGHT_COLORS.glassBgLight,
    glassHeavy: LIGHT_COLORS.glassBgHeavy,

    // Other backgrounds
    card: '#FFFFFF',
    overlay: 'rgba(0, 0, 0, 0.1)',
    input: LIGHT_COLORS.inputBg,
  },

  // === TEXT COLORS ===
  text: {
    primary: LIGHT_COLORS.textPrimary,    // #000000
    secondary: LIGHT_COLORS.textSecondary,
    muted: LIGHT_COLORS.textMuted,
    subtle: LIGHT_COLORS.textSubtle,
    disabled: LIGHT_COLORS.textDisabled,

    // Special text colors
    gold: LIGHT_COLORS.gold,
    number: LIGHT_COLORS.link,            // Blue for numbers
    success: LIGHT_COLORS.successText,
    danger: LIGHT_COLORS.errorText,
  },

  // === BORDER COLORS ===
  border: {
    default: LIGHT_COLORS.border,         // #CCCCCC
    active: LIGHT_COLORS.burgundy,        // #9C0612
    subtle: LIGHT_COLORS.borderLight,     // #E5E5E5
    gold: LIGHT_COLORS.gold,
    burgundy: LIGHT_COLORS.burgundy,
  },

  // === ICON COLORS (high contrast for accessibility) ===
  icon: {
    primary: '#1A1A1A',                     // Near-black for best contrast
    secondary: '#4A4A4A',                   // Dark gray for secondary icons
    accent: LIGHT_COLORS.burgundy,          // #9C0612
    gold: '#CC8800',                        // Darker gold for better contrast
    success: LIGHT_COLORS.successText,
    warning: LIGHT_COLORS.warningText,
    error: LIGHT_COLORS.errorText,
  },

  // === COMPONENT PRESETS ===
  card: {
    backgroundColor: LIGHT_COLORS.glassBg,
    borderColor: LIGHT_COLORS.border,
    borderWidth: LIGHT_GLASS.borderWidth,
    borderRadius: LIGHT_GLASS.borderRadius,
    shadowColor: LIGHT_GLASS.shadowColor,
    shadowOffset: LIGHT_GLASS.shadowOffset,
    shadowOpacity: LIGHT_GLASS.shadowOpacity,
    shadowRadius: LIGHT_GLASS.shadowRadius,
    elevation: LIGHT_GLASS.elevation,
  },

  section: {
    backgroundColor: LIGHT_COLORS.glassBg,
    borderColor: LIGHT_COLORS.border,
    borderWidth: LIGHT_GLASS.borderWidth,
    borderRadius: LIGHT_GLASS.borderRadius,
    padding: SPACING.xl,
  },

  // === BUTTON PRESETS ===
  button: {
    primary: {
      backgroundColor: LIGHT_COLORS.burgundy,
      borderColor: LIGHT_COLORS.gold,
      color: '#FFFFFF',                   // White text on burgundy
    },
    secondary: {
      backgroundColor: 'transparent',
      borderColor: LIGHT_COLORS.textPrimary,
      borderWidth: 2,
      color: LIGHT_COLORS.textPrimary,    // Black text
    },
    outline: {
      backgroundColor: 'transparent',
      borderColor: LIGHT_COLORS.gold,
      color: LIGHT_COLORS.burgundy,
    },
  },

  // === STATUS BADGES ===
  badge: {
    success: {
      backgroundColor: LIGHT_COLORS.success,
      color: LIGHT_COLORS.successText,
    },
    error: {
      backgroundColor: LIGHT_COLORS.error,
      color: LIGHT_COLORS.errorText,
    },
    warning: {
      backgroundColor: LIGHT_COLORS.warning,
      color: LIGHT_COLORS.warningText,
    },
    info: {
      backgroundColor: LIGHT_COLORS.info,
      color: LIGHT_COLORS.infoText,
    },
  },

  // === TOGGLE ===
  toggle: {
    on: LIGHT_COLORS.toggleOn,            // #059669
    off: LIGHT_COLORS.toggleOff,          // #CCCCCC
  },
};

// Shop-specific light theme colors
export const SHOP_LIGHT_COLORS = {
  background: LIGHT_COLORS.bgDarkest,     // #FFFFFF
  cardBg: LIGHT_COLORS.glassBg,           // #FFFFFF
  text: LIGHT_COLORS.textPrimary,         // #000000
  textSecondary: LIGHT_COLORS.textMuted,
  border: LIGHT_COLORS.border,            // #CCCCCC
  price: LIGHT_COLORS.burgundy,           // #9C0612 for prices
  headerBg: LIGHT_COLORS.bgDarkest,       // #FFFFFF
};

export default LIGHT_THEME;
