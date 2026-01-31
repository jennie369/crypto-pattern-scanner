/**
 * HapticService - Tactile feedback for user interactions
 *
 * FEATURES:
 * - Light/Medium/Heavy impact feedback
 * - Success/Warning/Error notifications
 * - Selection feedback
 * - Platform-aware (no-op on web)
 * - Enable/disable toggle
 *
 * USAGE:
 * import { haptic } from '../services/hapticService';
 *
 * // On button press
 * haptic.lightTap();
 *
 * // On pattern detected
 * haptic.success();
 *
 * // On error
 * haptic.error();
 *
 * // On selection change
 * haptic.selection();
 */

import { Platform } from 'react-native';

// Try to import expo-haptics, fallback to no-op if not available
let Haptics = null;
try {
  Haptics = require('expo-haptics');
} catch (e) {
  console.log('[HapticService] expo-haptics not available, haptics disabled');
}

// Fallback for when Haptics is not available
const noOp = () => {};

class HapticService {
  constructor() {
    this.enabled = true;
    this.available = !!Haptics && Platform.OS !== 'web';

    if (!this.available) {
      console.log('[HapticService] Haptics not available on this platform');
    }
  }

  /**
   * Check if haptics can be triggered
   * @returns {boolean}
   * @private
   */
  _canTrigger() {
    return this.enabled && this.available;
  }

  /**
   * Light tap - for selections, toggles
   * Use for: Selecting items, toggling switches, light interactions
   */
  lightTap() {
    if (!this._canTrigger()) return;

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (e) {
      // Silently fail
    }
  }

  /**
   * Medium tap - for confirmations, button presses
   * Use for: Button presses, confirming actions
   */
  mediumTap() {
    if (!this._canTrigger()) return;

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (e) {
      // Silently fail
    }
  }

  /**
   * Heavy tap - for important actions, drag end
   * Use for: Important actions, completing drag gestures
   */
  heavyTap() {
    if (!this._canTrigger()) return;

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    } catch (e) {
      // Silently fail
    }
  }

  /**
   * Soft tap - for subtle feedback
   * Use for: Subtle interactions, hover-like effects
   */
  softTap() {
    if (!this._canTrigger()) return;

    try {
      // Use light with less intensity
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft || Haptics.ImpactFeedbackStyle.Light);
    } catch (e) {
      // Silently fail
    }
  }

  /**
   * Rigid tap - for firm feedback
   * Use for: Boundaries, limits reached
   */
  rigidTap() {
    if (!this._canTrigger()) return;

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid || Haptics.ImpactFeedbackStyle.Heavy);
    } catch (e) {
      // Silently fail
    }
  }

  /**
   * Success notification - pattern detected, trade completed
   * Use for: Successful operations, achievements, positive outcomes
   */
  success() {
    if (!this._canTrigger()) return;

    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e) {
      // Silently fail
    }
  }

  /**
   * Warning notification - approaching SL/TP, price alert
   * Use for: Warnings, approaching limits, attention needed
   */
  warning() {
    if (!this._canTrigger()) return;

    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    } catch (e) {
      // Silently fail
    }
  }

  /**
   * Error notification - SL hit, error occurred
   * Use for: Errors, failures, negative outcomes
   */
  error() {
    if (!this._canTrigger()) return;

    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } catch (e) {
      // Silently fail
    }
  }

  /**
   * Selection changed - picker, segment control
   * Use for: Changing selections in pickers, segment controls
   */
  selection() {
    if (!this._canTrigger()) return;

    try {
      Haptics.selectionAsync();
    } catch (e) {
      // Silently fail
    }
  }

  // === SCANNER-SPECIFIC HAPTICS ===

  /**
   * Pattern detected - new pattern found during scan
   */
  patternDetected() {
    this.success();
  }

  /**
   * Scan complete - scan finished
   */
  scanComplete() {
    this.success();
  }

  /**
   * Zone tapped - user tapped on a zone
   */
  zoneTapped() {
    this.lightTap();
  }

  /**
   * Trade opened - new position opened
   */
  tradeOpened() {
    this.mediumTap();
  }

  /**
   * Trade closed - position closed (profit)
   */
  tradeProfit() {
    this.success();
  }

  /**
   * Trade closed - position closed (loss)
   */
  tradeLoss() {
    this.error();
  }

  /**
   * Price alert - price approaching level
   */
  priceAlert() {
    this.warning();
  }

  /**
   * Chart interaction - zoom, pan
   */
  chartInteraction() {
    this.softTap();
  }

  /**
   * Filter changed
   */
  filterChanged() {
    this.selection();
  }

  /**
   * Drag start
   */
  dragStart() {
    this.lightTap();
  }

  /**
   * Drag end
   */
  dragEnd() {
    this.mediumTap();
  }

  // === CONFIGURATION ===

  /**
   * Enable/disable haptic feedback
   * @param {boolean} enabled
   */
  setEnabled(enabled) {
    this.enabled = enabled;
  }

  /**
   * Check if haptics are enabled
   * @returns {boolean}
   */
  isEnabled() {
    return this.enabled;
  }

  /**
   * Check if haptics are available on this device
   * @returns {boolean}
   */
  isAvailable() {
    return this.available;
  }

  /**
   * Toggle haptics on/off
   * @returns {boolean} New enabled state
   */
  toggle() {
    this.enabled = !this.enabled;
    return this.enabled;
  }
}

// Singleton instance
export const haptic = new HapticService();

// Named export for class (for testing)
export { HapticService };

// Default export
export default haptic;
