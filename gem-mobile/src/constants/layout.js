/**
 * Gemral - Layout Constants
 * Centralized layout values for consistent spacing
 * Used for bottom tab bar padding across all screens
 */

import { Platform } from 'react-native';

// Bottom tab bar height - matches GlassBottomTab and TabBarContext
export const TAB_BAR_HEIGHT = 85;

// Bottom tab padding with safe area
export const BOTTOM_TAB_PADDING = Platform.select({
  ios: TAB_BAR_HEIGHT + 40, // iOS safe area + extra buffer
  android: TAB_BAR_HEIGHT + 30, // Android gesture nav + extra buffer
  default: TAB_BAR_HEIGHT + 30,
});

// Extra padding for content that sits above the tab bar
// Increased to ensure content is never cut off
export const CONTENT_BOTTOM_PADDING = BOTTOM_TAB_PADDING + 24;

// For scrollable content (FlatList, ScrollView)
export const getContentContainerStyle = (extraPadding = 0) => ({
  paddingBottom: CONTENT_BOTTOM_PADDING + extraPadding,
});

// For screens with action buttons at bottom
export const ACTION_BUTTON_BOTTOM_PADDING = BOTTOM_TAB_PADDING + 16;

export default {
  TAB_BAR_HEIGHT,
  BOTTOM_TAB_PADDING,
  CONTENT_BOTTOM_PADDING,
  ACTION_BUTTON_BOTTOM_PADDING,
  getContentContainerStyle,
};
