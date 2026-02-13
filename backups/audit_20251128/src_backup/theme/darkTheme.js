/**
 * Gemral - Dark Theme Constants v3.0
 * EXACT values from DESIGN_TOKENS.md
 *
 * CRITICAL RULES:
 * - Purple (#6A5BFF) for ALL UI elements (borders, icons, buttons)
 * - Cyan (#00F0FF) for NUMBERS/STATS ONLY (prices, balances, percentages)
 * - Glass background: rgba(15, 16, 48, 0.55) - EXACT!
 */

import { COLORS, SPACING, GLASS } from '../utils/tokens';

export const DARK_THEME = {
  // === BASE BACKGROUND (EXACT from tokens.js) ===
  background: {
    darkest: COLORS.bgDarkest,                    // #05040B
    mid: COLORS.bgMid,                            // #0F1030
    light: COLORS.bgLight,                        // #1a0b2e

    // Glass effects (EXACT)
    glass: COLORS.glassBg,                        // rgba(15, 16, 48, 0.55)
    glassLight: COLORS.glassBgLight,              // rgba(15, 16, 48, 0.5)
    glassHeavy: COLORS.glassBgHeavy,              // rgba(15, 16, 48, 0.6)

    // Other backgrounds
    card: 'rgba(255, 255, 255, 0.03)',
    overlay: 'rgba(0, 0, 0, 0.3)',
    input: COLORS.inputBg,                        // rgba(0, 0, 0, 0.3)
  },

  // === TEXT COLORS (EXACT) ===
  text: {
    primary: COLORS.textPrimary,                  // #FFFFFF
    secondary: COLORS.textSecondary,              // rgba(255, 255, 255, 0.8)
    muted: COLORS.textMuted,                      // rgba(255, 255, 255, 0.6)
    subtle: COLORS.textSubtle,                    // rgba(255, 255, 255, 0.5)
    disabled: COLORS.textDisabled,                // rgba(255, 255, 255, 0.4)

    // Special text colors
    gold: COLORS.gold,                            // #FFBD59 - Titles/accents
    number: COLORS.cyan,                          // #00F0FF - Numbers ONLY!
    success: COLORS.success,                      // #3AF7A6
    danger: COLORS.error,                         // #FF6B6B
  },

  // === BORDER COLORS (EXACT - PURPLE based!) ===
  border: {
    default: COLORS.inputBorder,                  // rgba(106, 91, 255, 0.3) - PURPLE!
    active: COLORS.purple,                        // #6A5BFF - Full purple
    subtle: 'rgba(255, 255, 255, 0.05)',
    gold: COLORS.gold,                            // #FFBD59
    burgundy: COLORS.burgundy,                    // #9C0612
  },

  // === ICON COLORS (EXACT - PURPLE for UI!) ===
  icon: {
    primary: COLORS.textPrimary,                  // #FFFFFF
    accent: COLORS.purple,                        // #6A5BFF - UI accent (NOT cyan!)
    gold: COLORS.gold,                            // #FFBD59
    success: COLORS.success,                      // #3AF7A6
    warning: COLORS.warning,                      // #FFB800
    error: COLORS.error,                          // #FF6B6B
  },

  // === COMPONENT PRESETS (EXACT from GLASS) ===
  card: {
    backgroundColor: COLORS.glassBg,              // rgba(15, 16, 48, 0.55)
    borderColor: COLORS.inputBorder,              // rgba(106, 91, 255, 0.3)
    borderWidth: GLASS.borderWidth,               // 1.2
    borderRadius: GLASS.borderRadius,             // 18
  },

  section: {
    backgroundColor: COLORS.glassBg,              // rgba(15, 16, 48, 0.55)
    borderColor: COLORS.inputBorder,              // rgba(106, 91, 255, 0.3)
    borderWidth: GLASS.borderWidth,               // 1.2
    borderRadius: GLASS.borderRadius,             // 18
    padding: SPACING.xl,                          // 18
  },

  // === BUTTON PRESETS ===
  button: {
    primary: {
      backgroundColor: COLORS.burgundy,           // #9C0612
      borderColor: COLORS.gold,                   // #FFBD59
      color: COLORS.textPrimary,                  // #FFFFFF
    },
    secondary: {
      backgroundColor: 'transparent',
      borderColor: COLORS.inputBorder,            // Purple border
      color: COLORS.purple,                       // #6A5BFF
    },
    outline: {
      backgroundColor: 'transparent',
      borderColor: COLORS.gold,                   // Gold border
      color: COLORS.gold,                         // #FFBD59
    },
  },
};

// Shop-specific dark theme colors (EXACT from tokens.js)
export const SHOP_DARK_COLORS = {
  background: COLORS.bgDarkest,                   // #05040B
  cardBg: COLORS.glassBg,                         // rgba(15, 16, 48, 0.55)
  text: COLORS.textPrimary,                       // #FFFFFF
  textSecondary: COLORS.textMuted,                // rgba(255, 255, 255, 0.6)
  border: COLORS.inputBorder,                     // rgba(106, 91, 255, 0.3) - PURPLE!
  price: COLORS.cyan,                             // #00F0FF - Cyan for prices/numbers
  headerBg: COLORS.bgDarkest,                     // #05040B
};

export default DARK_THEME;
