/**
 * Gemral - Haptics Utility
 * Cross-platform haptic feedback with web fallback
 */

import { Platform } from 'react-native';

let Haptics = null;

// Only import expo-haptics on native platforms
if (Platform.OS !== 'web') {
  try {
    Haptics = require('expo-haptics');
  } catch (e) {
    console.log('expo-haptics not available');
  }
}

// Haptic feedback types
export const ImpactFeedbackStyle = {
  Light: 'Light',
  Medium: 'Medium',
  Heavy: 'Heavy',
};

export const NotificationFeedbackType = {
  Success: 'Success',
  Warning: 'Warning',
  Error: 'Error',
};

/**
 * Trigger impact feedback
 */
export const impactAsync = async (style = ImpactFeedbackStyle.Medium) => {
  if (Haptics && Platform.OS !== 'web') {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle[style]);
    } catch (e) {
      // Silently fail
    }
  }
};

/**
 * Trigger notification feedback
 */
export const notificationAsync = async (type = NotificationFeedbackType.Success) => {
  if (Haptics && Platform.OS !== 'web') {
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType[type]);
    } catch (e) {
      // Silently fail
    }
  }
};

/**
 * Trigger selection feedback
 */
export const selectionAsync = async () => {
  if (Haptics && Platform.OS !== 'web') {
    try {
      await Haptics.selectionAsync();
    } catch (e) {
      // Silently fail
    }
  }
};

// Default export for compatibility
export default {
  impactAsync,
  notificationAsync,
  selectionAsync,
  ImpactFeedbackStyle,
  NotificationFeedbackType,
};
