/**
 * GEM Mobile - Navigation Helper
 * Centralized navigation utility for cross-tab navigation
 *
 * This helper resolves screen names to their correct tab and screen
 * for proper nested navigator navigation.
 */

// Screen to Tab mapping for nested navigation
// Maps common screen names to their tab and actual screen name
const SCREEN_TO_TAB_MAP = {
  // Scanner/Trading tab screens
  'Scanner': { tab: 'Trading', screen: 'ScannerMain' },
  'ScannerMain': { tab: 'Trading', screen: 'ScannerMain' },
  'PatternDetail': { tab: 'Trading', screen: 'PatternDetail' },
  'OpenPositions': { tab: 'Trading', screen: 'OpenPositions' },

  // Home tab screens
  'Home': { tab: 'Home', screen: 'HomeMain' },
  'HomeMain': { tab: 'Home', screen: 'HomeMain' },
  'Forum': { tab: 'Home', screen: 'Forum' },
  'ForumScreen': { tab: 'Home', screen: 'Forum' },
  'PostDetail': { tab: 'Home', screen: 'PostDetail' },
  'CreatePost': { tab: 'Home', screen: 'CreatePost' },
  'Course': { tab: 'Home', screen: 'Course' },
  'CourseDetail': { tab: 'Home', screen: 'CourseDetail' },
  'Courses': { tab: 'Home', screen: 'Courses' },
  'CoursesMain': { tab: 'Home', screen: 'CoursesMain' },

  // Shop tab screens
  'Shop': { tab: 'Shop', screen: 'ShopMain' },
  'ShopMain': { tab: 'Shop', screen: 'ShopMain' },
  'ShopScreen': { tab: 'Shop', screen: 'ShopMain' },
  'ProductDetail': { tab: 'Shop', screen: 'ProductDetail' },
  'ProductSearch': { tab: 'Shop', screen: 'ProductSearch' },
  'Cart': { tab: 'Shop', screen: 'Cart' },

  // GemMaster tab screens
  'GemMaster': { tab: 'GemMaster', screen: 'GemMasterMain' },
  'GemMasterMain': { tab: 'GemMaster', screen: 'GemMasterMain' },
  'Tarot': { tab: 'GemMaster', screen: 'Tarot' },
  'IChing': { tab: 'GemMaster', screen: 'IChing' },
  'ChatHistory': { tab: 'GemMaster', screen: 'ChatHistory' },

  // Account tab screens
  'Account': { tab: 'Account', screen: 'AccountMain' },
  'AccountMain': { tab: 'Account', screen: 'AccountMain' },
  'Portfolio': { tab: 'Account', screen: 'Portfolio' },
  'ProfileSettings': { tab: 'Account', screen: 'ProfileSettings' },
  'Wallet': { tab: 'Account', screen: 'Wallet' },
  'VisionBoard': { tab: 'Account', screen: 'VisionBoard' },
  'TierUpgrade': { tab: 'Account', screen: 'TierUpgrade' },

  // Notifications tab (single screen)
  'Notifications': { tab: 'Notifications' },
};

/**
 * Navigate to a screen with proper nested navigation handling
 * @param {object} navigation - React Navigation object
 * @param {string} screenName - Target screen name
 * @param {object} params - Optional navigation params
 */
export const navigateToScreen = (navigation, screenName, params = {}) => {
  if (!navigation || !screenName) {
    console.warn('[NavigationHelper] Missing navigation or screenName');
    return;
  }

  const mapping = SCREEN_TO_TAB_MAP[screenName];

  if (mapping) {
    // Screen is in our mapping, use nested navigation
    if (mapping.screen) {
      // Navigate to tab with specific screen
      navigation.navigate(mapping.tab, {
        screen: mapping.screen,
        params: params,
      });
    } else {
      // Tab without specific screen (e.g., Notifications)
      navigation.navigate(mapping.tab, params);
    }
  } else {
    // Unknown screen, try direct navigation (fallback)
    console.warn(`[NavigationHelper] Unknown screen: ${screenName}, trying direct navigation`);
    navigation.navigate(screenName, params);
  }
};

/**
 * Get the tab name for a given screen
 * @param {string} screenName - Screen name to look up
 * @returns {string|null} - Tab name or null if not found
 */
export const getTabForScreen = (screenName) => {
  const mapping = SCREEN_TO_TAB_MAP[screenName];
  return mapping?.tab || null;
};

/**
 * Get the actual screen name within the stack
 * @param {string} screenName - Screen name to look up
 * @returns {string|null} - Actual screen name or null if not found
 */
export const getActualScreenName = (screenName) => {
  const mapping = SCREEN_TO_TAB_MAP[screenName];
  return mapping?.screen || screenName;
};

export default {
  navigateToScreen,
  getTabForScreen,
  getActualScreenName,
  SCREEN_TO_TAB_MAP,
};
