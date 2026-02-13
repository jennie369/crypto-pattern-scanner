/**
 * Gemral - Theme System
 * Unified theme exports for dark and light modes
 */

// Import themes
import DARK_THEME, { SHOP_DARK_COLORS } from './darkTheme';
import LIGHT_THEME, {
  LIGHT_COLORS,
  LIGHT_GLASS,
  LIGHT_GRADIENTS,
  SHOP_LIGHT_COLORS,
} from './lightTheme';

// Import base tokens
import {
  COLORS as DARK_COLORS,
  COLORS,
  SPACING,
  GLASS as DARK_GLASS,
  TYPOGRAPHY,
  GRADIENTS as DARK_GRADIENTS,
  BORDER_RADIUS,
} from '../utils/tokens';

// Theme type constants
export const THEME_TYPES = {
  DARK: 'dark',
  LIGHT: 'light',
};

/**
 * Get theme colors based on theme type
 * @param {string} themeType - 'dark' or 'light'
 * @returns {object} Theme colors
 */
export function getColors(themeType = 'dark') {
  return themeType === 'light' ? LIGHT_COLORS : DARK_COLORS;
}

/**
 * Get theme object based on theme type
 * @param {string} themeType - 'dark' or 'light'
 * @returns {object} Theme object
 */
export function getTheme(themeType = 'dark') {
  return themeType === 'light' ? LIGHT_THEME : DARK_THEME;
}

/**
 * Get glass styles based on theme type
 * @param {string} themeType - 'dark' or 'light'
 * @returns {object} Glass styles
 */
export function getGlass(themeType = 'dark') {
  return themeType === 'light' ? LIGHT_GLASS : DARK_GLASS;
}

/**
 * Get gradients based on theme type
 * @param {string} themeType - 'dark' or 'light'
 * @returns {object} Gradients
 */
export function getGradients(themeType = 'dark') {
  return themeType === 'light' ? LIGHT_GRADIENTS : DARK_GRADIENTS;
}

/**
 * Get shop colors based on theme type
 * @param {string} themeType - 'dark' or 'light'
 * @returns {object} Shop colors
 */
export function getShopColors(themeType = 'dark') {
  return themeType === 'light' ? SHOP_LIGHT_COLORS : SHOP_DARK_COLORS;
}

/**
 * Create themed styles helper
 * Wraps StyleSheet.create with theme-aware colors
 * @param {string} themeType - 'dark' or 'light'
 * @param {function} stylesFactory - Function that receives colors and returns styles
 * @returns {object} Themed styles
 */
export function createThemedStyles(themeType, stylesFactory) {
  const colors = getColors(themeType);
  const theme = getTheme(themeType);
  const glass = getGlass(themeType);

  return stylesFactory({ colors, theme, glass, SPACING, TYPOGRAPHY });
}

// Re-export everything
export {
  // Dark theme
  DARK_THEME,
  DARK_COLORS,
  DARK_GLASS,
  DARK_GRADIENTS,
  SHOP_DARK_COLORS,

  // Light theme
  LIGHT_THEME,
  LIGHT_COLORS,
  LIGHT_GLASS,
  LIGHT_GRADIENTS,
  SHOP_LIGHT_COLORS,

  // Shared tokens (COLORS is default dark theme)
  COLORS,
  SPACING,
  TYPOGRAPHY,
  BORDER_RADIUS,
};

// Default exports
export default {
  THEME_TYPES,
  getColors,
  getTheme,
  getGlass,
  getGradients,
  getShopColors,
  createThemedStyles,
  DARK_THEME,
  LIGHT_THEME,
  SPACING,
  TYPOGRAPHY,
};
