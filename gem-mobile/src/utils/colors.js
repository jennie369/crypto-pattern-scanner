/**
 * GEM Platform - Colors Helper
 * Quick access to colors and gradients
 */

import { COLORS, GRADIENTS } from './tokens';

// Re-export colors as default
export default COLORS;

// Named exports for convenience
export { COLORS, GRADIENTS };

// Helper functions
export const withOpacity = (color, opacity) => {
  // Handle hex colors
  if (color.startsWith('#')) {
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }
  return color;
};

// Semantic color getters
export const getTextColor = (variant = 'primary') => {
  const map = {
    primary: COLORS.textPrimary,
    secondary: COLORS.textSecondary,
    muted: COLORS.textMuted,
    subtle: COLORS.textSubtle,
    disabled: COLORS.textDisabled,
    success: COLORS.success,
    error: COLORS.error,
    warning: COLORS.warning,
  };
  return map[variant] || COLORS.textPrimary;
};

export const getTierColor = (tier) => {
  const map = {
    free: COLORS.tierFree,
    1: COLORS.tier1,
    2: COLORS.tier2,
    3: COLORS.tier3,
  };
  return map[tier] || COLORS.tierFree;
};
