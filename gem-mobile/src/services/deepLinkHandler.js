/**
 * Gemral - Deep Link Handler
 *
 * Handles deep links from notifications:
 * - Navigate to Account tab or VisionBoard screen
 * - Open specific VisionBoard tab (affirmation, goals, iching, tarot)
 * - Execute actions (complete task, show confetti)
 *
 * Usage:
 * 1. Initialize in App.js
 * 2. Call handleDeepLink from notification response
 * 3. NavigationService handles actual navigation
 */

import * as Notifications from 'expo-notifications';
import * as Linking from 'expo-linking';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabase';

const PENDING_DEEP_LINK_KEY = '@gem_pending_deep_link';
const PENDING_AFFILIATE_KEY = '@gem_pending_affiliate_link';
const CHECKOUT_AFFILIATE_KEY = '@gem_checkout_affiliate';

// ========== WEB URL PATTERNS ==========
// Patterns for universal links from gemral.com
const WEB_URL_PATTERNS = [
  {
    // https://gemral.com/courses/{courseId}
    pattern: /^https?:\/\/(?:www\.)?gemral\.com\/courses\/([^\/?\s]+)(?:\/lessons\/([^\/?\s]+))?/i,
    handler: (matches) => {
      if (matches[2]) {
        // Has lessonId: /courses/{courseId}/lessons/{lessonId}
        return {
          stack: 'Courses',
          screen: 'LessonPlayer',
          params: { courseId: matches[1], lessonId: matches[2] },
        };
      }
      // Just courseId: /courses/{courseId}
      return {
        stack: 'Courses',
        screen: 'CourseDetail',
        params: { courseId: matches[1] },
      };
    },
  },
  {
    // https://gemral.com/forum/thread/{postId}
    pattern: /^https?:\/\/(?:www\.)?gemral\.com\/forum\/thread\/([^\/?\s]+)/i,
    handler: (matches) => ({
      stack: 'Home',
      screen: 'PostDetail',
      params: { postId: matches[1] },
    }),
  },
  {
    // https://gemral.com/shop/product/{productId}
    pattern: /^https?:\/\/(?:www\.)?gemral\.com\/shop\/product\/([^\/?\s]+)/i,
    handler: (matches) => ({
      stack: 'Shop',
      screen: 'ProductDetail',
      params: { productId: matches[1] },
    }),
  },
];

// ========== AFFILIATE URL PATTERNS ==========
const AFFILIATE_URL_PATTERNS = {
  // https://gemral.com/products/{handle}?ref={code}&pid={productId}
  gemralProducts: /^https?:\/\/(www\.)?gemral\.com\/products\/([^/?]+)\??(.*)$/i,
  // https://yinyangmasters.com/products/{handle}?ref={code}
  yinyangMasters: /^https?:\/\/yinyangmasters\.com\/products\/([^/?]+)\??(.*)$/i,
  // gem://product/{shortCode}?ref={code}&pid={productId}
  appScheme: /^gem:\/\/product\/([^/?]+)\??(.*)$/i,
  // Legacy: https://gemral.com/p/{shortCode}?ref={code} (fallback)
  gemralShortCode: /^https?:\/\/(www\.)?gemral\.com\/p\/([^/?]+)\??(.*)$/i,
};

// ========== DEEP LINK ROUTES ==========
// Map deep link paths to navigation targets (for push notifications)
const DEEP_LINK_ROUTES = {
  '/gemmaster': { stack: 'Home', screen: 'GemMaster' },
  '/scanner': { stack: 'Home', screen: 'Scanner' },
  '/visionboard': { stack: 'Account', screen: 'VisionBoard' },
  '/shop': { stack: 'Shop', screen: 'ShopHome' },
  '/courses': { stack: 'Courses', screen: 'CourseList' },
  '/forum': { stack: 'Home', screen: 'Forum' },
  '/tarot': { stack: 'Home', screen: 'GemMaster', params: { action: 'tarot_reading' } },
  '/iching': { stack: 'Home', screen: 'GemMaster', params: { action: 'iching_reading' } },
  '/frequency': { stack: 'Home', screen: 'GemMaster', params: { action: 'frequency_reading' } },
  '/wallet': { stack: 'Account', screen: 'Wallet' },
  '/portfolio': { stack: 'Account', screen: 'Portfolio' },
  '/earnings': { stack: 'Account', screen: 'Earnings' },
  '/affiliate': { stack: 'Account', screen: 'AffiliateDashboard' },
  '/product': { stack: 'Shop', screen: 'ProductDetail' },
};

// ========== DYNAMIC DEEP LINK PATTERNS ==========
// Patterns for deep links with parameters (e.g., /courses/123)
const DYNAMIC_DEEP_LINK_PATTERNS = [
  {
    // gem://courses/{courseId}
    pattern: /^\/courses\/([^\/]+)$/,
    handler: (matches) => ({
      stack: 'Courses',
      screen: 'CourseDetail',
      params: { courseId: matches[1] },
    }),
  },
  {
    // gem://courses/{courseId}/lessons/{lessonId}
    pattern: /^\/courses\/([^\/]+)\/lessons\/([^\/]+)$/,
    handler: (matches) => ({
      stack: 'Courses',
      screen: 'LessonPlayer',
      params: { courseId: matches[1], lessonId: matches[2] },
    }),
  },
  {
    // gem://courses/{courseId}/modules/{moduleId}
    pattern: /^\/courses\/([^\/]+)\/modules\/([^\/]+)$/,
    handler: (matches) => ({
      stack: 'Courses',
      screen: 'CourseDetail',
      params: { courseId: matches[1], moduleId: matches[2], scrollToModule: true },
    }),
  },
  {
    // gem://forum/thread/{postId}
    pattern: /^\/forum\/thread\/([^\/]+)$/,
    handler: (matches) => ({
      stack: 'Home',
      screen: 'PostDetail',
      params: { postId: matches[1] },
    }),
  },
  {
    // gem://shop/product/{productId}
    pattern: /^\/shop\/product\/([^\/]+)$/,
    handler: (matches) => ({
      stack: 'Shop',
      screen: 'ProductDetail',
      params: { productId: matches[1] },
    }),
  },
];

class DeepLinkHandler {
  constructor() {
    this._navigationRef = null;
    this._responseListener = null;
    this._initialNotification = null;
    this._urlListener = null;
  }

  // ========== AFFILIATE URL PARSING ==========

  /**
   * Parse affiliate URL and extract params
   * @param {string} url - Full URL or deep link
   * @returns {Object|null} - Parsed data { shortCode, affiliateCode, productId, productHandle, source }
   */
  parseAffiliateUrl(url) {
    if (!url) return null;

    try {
      // Try gemral.com/products/{handle} pattern (primary)
      let match = url.match(AFFILIATE_URL_PATTERNS.gemralProducts);
      if (match) {
        const handle = match[2]; // Group 1 is www., Group 2 is handle
        const params = this.parseQueryString(match[3]);
        return {
          shortCode: null,
          affiliateCode: params.ref || params.aff,
          productId: params.pid,
          productHandle: handle,
          source: 'gemral.com',
        };
      }

      // Try gemral.com/p/{shortCode} pattern (legacy/fallback)
      match = url.match(AFFILIATE_URL_PATTERNS.gemralShortCode);
      if (match) {
        const shortCode = match[2];
        const params = this.parseQueryString(match[3]);
        return {
          shortCode,
          affiliateCode: params.ref || params.aff,
          productId: params.pid,
          productHandle: params.handle,
          source: 'gemral.com',
        };
      }

      // Try yinyangmasters.com pattern
      match = url.match(AFFILIATE_URL_PATTERNS.yinyangMasters);
      if (match) {
        const handle = match[1];
        const params = this.parseQueryString(match[2]);
        return {
          shortCode: null,
          affiliateCode: params.ref || params.aff,
          productId: params.pid,
          productHandle: handle,
          source: 'yinyangmasters.com',
        };
      }

      // Try gem:// app scheme pattern
      match = url.match(AFFILIATE_URL_PATTERNS.appScheme);
      if (match) {
        const shortCode = match[1];
        const params = this.parseQueryString(match[2]);
        return {
          shortCode,
          affiliateCode: params.ref || params.aff,
          productId: params.pid,
          productHandle: params.handle,
          source: 'app_scheme',
        };
      }

      return null;
    } catch (error) {
      console.error('[DeepLinkHandler] parseAffiliateUrl error:', error);
      return null;
    }
  }

  /**
   * Parse query string to object
   */
  parseQueryString(queryString) {
    if (!queryString) return {};
    const params = {};
    const pairs = queryString.split('&');
    for (const pair of pairs) {
      const [key, value] = pair.split('=');
      if (key) {
        params[decodeURIComponent(key)] = value ? decodeURIComponent(value) : '';
      }
    }
    return params;
  }

  /**
   * Check if URL is an affiliate link
   */
  isAffiliateUrl(url) {
    if (!url) return false;
    return (
      AFFILIATE_URL_PATTERNS.linkGemralApp.test(url) ||
      AFFILIATE_URL_PATTERNS.yinyangMasters.test(url) ||
      AFFILIATE_URL_PATTERNS.appScheme.test(url)
    );
  }

  // ========== EXTERNAL URL HANDLING ==========

  /**
   * Check if URL is a gemral.com web URL
   */
  isGemralWebUrl(url) {
    if (!url) return false;
    return /^https?:\/\/(?:www\.)?gemral\.com\//i.test(url);
  }

  /**
   * Match web URL against WEB_URL_PATTERNS
   * @param {string} url - Full web URL
   * @returns {Object|null} - Route config if matched
   */
  matchWebUrlPattern(url) {
    for (const { pattern, handler } of WEB_URL_PATTERNS) {
      const matches = url.match(pattern);
      if (matches) {
        console.log('[DeepLinkHandler] Matched web URL pattern:', pattern, 'with:', matches);
        return handler(matches);
      }
    }
    return null;
  }

  /**
   * Handle gemral.com web URL (Universal Link)
   * @param {string} url - Web URL like https://gemral.com/courses/123
   */
  async handleWebUrl(url) {
    console.log('[DeepLinkHandler] handleWebUrl:', url);

    const route = this.matchWebUrlPattern(url);
    if (!route) {
      console.warn('[DeepLinkHandler] No matching route for web URL:', url);
      return;
    }

    const { stack, screen, params } = route;

    if (this._navigationRef?.isReady()) {
      this.navigateToStackScreen(stack, screen, params);
    } else {
      await this.storePendingDeepLink({ stack, screen, params });
    }
  }

  /**
   * Handle external URL (Universal Link / App Link / Custom Scheme)
   * @param {string} url - The URL that opened the app
   */
  async handleExternalUrl(url) {
    console.log('[DeepLinkHandler] handleExternalUrl:', url);

    if (!url) return;

    // Check if it's a gemral.com web URL (Universal Link)
    if (this.isGemralWebUrl(url)) {
      await this.handleWebUrl(url);
      return;
    }

    // Check if it's an affiliate link
    if (this.isAffiliateUrl(url)) {
      await this.handleAffiliateUrl(url);
      return;
    }

    // Handle other URLs (notifications, gem:// scheme, etc.)
    await this.processDeepLink(url);
  }

  /**
   * Handle affiliate URL
   */
  async handleAffiliateUrl(url) {
    const parsed = this.parseAffiliateUrl(url);
    if (!parsed) {
      console.warn('[DeepLinkHandler] Could not parse affiliate URL:', url);
      return;
    }

    console.log('[DeepLinkHandler] Parsed affiliate URL:', parsed);

    // Track click
    if (parsed.affiliateCode) {
      await this.trackAffiliateClick(parsed);
    }

    // Store affiliate code for checkout attribution
    if (parsed.affiliateCode) {
      await this.storeCheckoutAffiliate(parsed.affiliateCode);
    }

    // Navigate to product
    await this.navigateToProduct(parsed);
  }

  /**
   * Track affiliate click in database
   */
  async trackAffiliateClick(parsed) {
    try {
      const { shortCode, affiliateCode } = parsed;

      // Try RPC first
      const { error: rpcError } = await supabase.rpc('increment_affiliate_clicks', {
        code_param: affiliateCode,
      });

      if (rpcError) {
        // Fallback: update directly
        await supabase
          .from('affiliate_codes')
          .update({ clicks: supabase.sql`COALESCE(clicks, 0) + 1` })
          .eq('code', affiliateCode)
          .eq('is_active', true);
      }

      console.log('[DeepLinkHandler] Tracked affiliate click:', affiliateCode);
    } catch (error) {
      console.log('[DeepLinkHandler] Could not track click:', error.message);
      // Queue for later sync
      await this.queueOfflineClick(parsed);
    }
  }

  /**
   * Queue offline click for later sync
   */
  async queueOfflineClick(parsed) {
    try {
      const key = '@gem_offline_clicks';
      const stored = await AsyncStorage.getItem(key);
      const clicks = stored ? JSON.parse(stored) : [];

      clicks.push({
        ...parsed,
        timestamp: new Date().toISOString(),
      });

      // Keep last 50
      const trimmed = clicks.slice(-50);
      await AsyncStorage.setItem(key, JSON.stringify(trimmed));
    } catch (error) {
      console.error('[DeepLinkHandler] queueOfflineClick error:', error);
    }
  }

  /**
   * Store affiliate code for checkout attribution
   */
  async storeCheckoutAffiliate(affiliateCode) {
    try {
      await AsyncStorage.setItem(CHECKOUT_AFFILIATE_KEY, affiliateCode);
      console.log('[DeepLinkHandler] Stored checkout affiliate:', affiliateCode);
    } catch (error) {
      console.error('[DeepLinkHandler] storeCheckoutAffiliate error:', error);
    }
  }

  /**
   * Get stored checkout affiliate code
   */
  async getCheckoutAffiliate() {
    try {
      return await AsyncStorage.getItem(CHECKOUT_AFFILIATE_KEY);
    } catch (error) {
      return null;
    }
  }

  /**
   * Clear checkout affiliate after purchase
   */
  async clearCheckoutAffiliate() {
    try {
      await AsyncStorage.removeItem(CHECKOUT_AFFILIATE_KEY);
    } catch (error) {
      console.error('[DeepLinkHandler] clearCheckoutAffiliate error:', error);
    }
  }

  /**
   * Navigate to product screen
   */
  async navigateToProduct(parsed) {
    const { productId, productHandle, shortCode, affiliateCode } = parsed;

    // Build navigation params
    const params = {
      affiliateCode,
      fromDeepLink: true,
    };

    // If we have productId, use it directly
    if (productId) {
      params.productId = productId;
    }

    // If we have shortCode, look up product
    if (!productId && shortCode) {
      const productInfo = await this.lookupProductByShortCode(shortCode);
      if (productInfo) {
        params.productId = productInfo.product_id;
        params.productName = productInfo.product_name;
      }
    }

    // If we have handle, include it
    if (productHandle) {
      params.handle = productHandle;
    }

    // Navigate
    if (this._navigationRef?.isReady()) {
      this.navigateToStackScreen('Shop', 'ProductDetail', params);
    } else {
      // Store for when navigation is ready
      await this.storePendingAffiliateLink({ ...parsed, navigateParams: params });
    }
  }

  /**
   * Lookup product by short code from affiliate_codes table
   */
  async lookupProductByShortCode(shortCode) {
    try {
      const { data, error } = await supabase
        .from('affiliate_codes')
        .select('product_id, product_name, product_type')
        .eq('short_code', shortCode)
        .eq('is_active', true)
        .limit(1)
        .single();

      if (error || !data) {
        console.log('[DeepLinkHandler] Product not found for shortCode:', shortCode);
        return null;
      }

      return data;
    } catch (error) {
      console.error('[DeepLinkHandler] lookupProductByShortCode error:', error);
      return null;
    }
  }

  /**
   * Validate affiliate code
   */
  async validateAffiliateCode(code) {
    try {
      const { data, error } = await supabase
        .from('affiliate_codes')
        .select('id, is_active, user_id')
        .eq('code', code)
        .single();

      if (error || !data) return { valid: false };

      return {
        valid: data.is_active,
        userId: data.user_id,
      };
    } catch (error) {
      return { valid: false };
    }
  }

  // ========== PENDING AFFILIATE LINKS ==========

  /**
   * Store pending affiliate link (for deferred deep linking)
   */
  async storePendingAffiliateLink(data) {
    try {
      const payload = {
        ...data,
        storedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
      };
      await AsyncStorage.setItem(PENDING_AFFILIATE_KEY, JSON.stringify(payload));
      console.log('[DeepLinkHandler] Stored pending affiliate link');
    } catch (error) {
      console.error('[DeepLinkHandler] storePendingAffiliateLink error:', error);
    }
  }

  /**
   * Check and apply pending affiliate link
   * Call this on app launch after navigation is ready
   */
  async checkPendingAffiliateLink() {
    try {
      const stored = await AsyncStorage.getItem(PENDING_AFFILIATE_KEY);
      if (!stored) return null;

      const data = JSON.parse(stored);

      // Check expiry
      if (new Date(data.expiresAt) < new Date()) {
        await AsyncStorage.removeItem(PENDING_AFFILIATE_KEY);
        console.log('[DeepLinkHandler] Pending affiliate link expired');
        return null;
      }

      // Clear after reading
      await AsyncStorage.removeItem(PENDING_AFFILIATE_KEY);

      console.log('[DeepLinkHandler] Found pending affiliate link:', data);

      // Store affiliate code for checkout
      if (data.affiliateCode) {
        await this.storeCheckoutAffiliate(data.affiliateCode);
      }

      // Navigate if params available
      if (data.navigateParams) {
        this.navigateToStackScreen('Shop', 'ProductDetail', data.navigateParams);
      }

      return data;
    } catch (error) {
      console.error('[DeepLinkHandler] checkPendingAffiliateLink error:', error);
      return null;
    }
  }

  /**
   * Sync offline clicks when back online
   */
  async syncOfflineClicks() {
    try {
      const key = '@gem_offline_clicks';
      const stored = await AsyncStorage.getItem(key);
      if (!stored) return;

      const clicks = JSON.parse(stored);
      if (!clicks.length) return;

      for (const click of clicks) {
        await this.trackAffiliateClick(click);
      }

      await AsyncStorage.removeItem(key);
      console.log('[DeepLinkHandler] Synced', clicks.length, 'offline clicks');
    } catch (error) {
      console.error('[DeepLinkHandler] syncOfflineClicks error:', error);
    }
  }

  /**
   * Initialize deep link handler
   * @param {Object} navigationRef - React Navigation ref
   */
  initialize(navigationRef) {
    this._navigationRef = navigationRef;

    // Listen for notification responses (when user taps notification)
    this._responseListener = Notifications.addNotificationResponseReceivedListener(
      this.handleNotificationResponse.bind(this)
    );

    // Check for initial notification (app opened from notification)
    this.checkInitialNotification();

    console.log('[DeepLinkHandler] Initialized');
  }

  /**
   * Clean up listeners
   */
  cleanup() {
    if (this._responseListener) {
      // Use .remove() method on subscription object (expo-notifications v15+)
      if (typeof this._responseListener.remove === 'function') {
        this._responseListener.remove();
      } else if (typeof Notifications.removeNotificationSubscription === 'function') {
        Notifications.removeNotificationSubscription(this._responseListener);
      }
    }
  }

  /**
   * Check if app was opened from a notification
   */
  async checkInitialNotification() {
    try {
      const response = await Notifications.getLastNotificationResponseAsync();

      if (response) {
        this._initialNotification = response;
        await this.handleNotificationResponse(response);
      }
    } catch (error) {
      console.error('[DeepLinkHandler] Error checking initial notification:', error);
    }
  }

  /**
   * Handle notification response
   * @param {Object} response - Notification response
   */
  async handleNotificationResponse(response) {
    try {
      const { notification, actionIdentifier } = response;
      const { data } = notification.request.content;

      console.log('[DeepLinkHandler] Notification tapped:', data.type);

      // Track engagement
      await this.trackEngagement(data, actionIdentifier);

      // Handle action buttons
      if (actionIdentifier === 'complete') {
        await this.handleCompleteAction(data);
        return;
      }

      if (actionIdentifier === 'snooze') {
        await this.handleSnoozeAction(notification);
        return;
      }

      // Handle default tap (open app)
      // Support both deepLink (old format) and deep_link (new push notification format)
      const deepLinkData = data.deepLink || data.deep_link;
      if (deepLinkData) {
        await this.processDeepLink(deepLinkData, data);
      }

      // Track notification click for analytics (push notifications)
      if (data.notification_id) {
        this.trackNotificationClick(data.notification_id, data.ab_variant);
      }
    } catch (error) {
      console.error('[DeepLinkHandler] Error handling notification:', error);
    }
  }

  /**
   * Track push notification click
   * @param {string} notificationId - Notification ID
   * @param {string} abVariant - A/B test variant
   */
  async trackNotificationClick(notificationId, abVariant) {
    try {
      // Update notification_logs for this click
      const { error } = await supabase.rpc('update_notification_log_clicked', {
        p_notification_id: notificationId,
        p_user_id: (await supabase.auth.getUser()).data.user?.id,
      });

      if (error) {
        console.log('[DeepLinkHandler] Could not track click:', error.message);
      } else {
        console.log('[DeepLinkHandler] Notification click tracked:', notificationId);
      }
    } catch (err) {
      console.log('[DeepLinkHandler] Track click error:', err);
    }
  }

  /**
   * Process deep link
   * @param {Object|string} deepLink - Deep link configuration or path string
   * @param {Object} notificationData - Original notification data
   */
  async processDeepLink(deepLink, notificationData = {}) {
    let screen, params, stack;

    // Handle string deep links (e.g., "/gemmaster", "/tarot", "/courses/123")
    if (typeof deepLink === 'string') {
      const path = deepLink.toLowerCase();

      // First, check static routes
      const route = DEEP_LINK_ROUTES[path];

      if (route) {
        screen = route.screen;
        stack = route.stack;
        params = { ...route.params, ...notificationData };
      } else {
        // Check dynamic patterns (e.g., /courses/{id}, /forum/thread/{id})
        const dynamicRoute = this.matchDynamicPattern(path);

        if (dynamicRoute) {
          screen = dynamicRoute.screen;
          stack = dynamicRoute.stack;
          params = { ...dynamicRoute.params, ...notificationData };
        } else {
          console.warn('[DeepLinkHandler] Unknown deep link path:', deepLink);
          return;
        }
      }

      // Handle nested stack navigation
      if (stack) {
        this.navigateToStackScreen(stack, screen, params);
        return;
      }
    } else {
      // Handle object deep links (legacy format)
      screen = deepLink.screen;
      params = deepLink.params || {};
    }

    // If navigation is ready, navigate immediately
    if (this._navigationRef?.isReady()) {
      this.navigateToScreen(screen, params);
    } else {
      // Store for later processing
      await this.storePendingDeepLink({ screen, params });
    }
  }

  /**
   * Match a path against dynamic deep link patterns
   * @param {string} path - The path to match (e.g., "/courses/123")
   * @returns {Object|null} - Route config if matched, null otherwise
   */
  matchDynamicPattern(path) {
    for (const { pattern, handler } of DYNAMIC_DEEP_LINK_PATTERNS) {
      const matches = path.match(pattern);
      if (matches) {
        console.log('[DeepLinkHandler] Matched dynamic pattern:', pattern, 'with:', matches);
        return handler(matches);
      }
    }
    return null;
  }

  /**
   * Navigate to a screen within a specific stack
   * @param {string} stack - Stack name (Home, Account, Shop, Courses)
   * @param {string} screen - Screen name
   * @param {Object} params - Screen params
   */
  navigateToStackScreen(stack, screen, params) {
    if (!this._navigationRef?.isReady()) {
      console.warn('[DeepLinkHandler] Navigation not ready');
      this.storePendingDeepLink({ stack, screen, params });
      return;
    }

    try {
      this._navigationRef.navigate('MainTabs', {
        screen: stack,
        params: {
          screen: screen,
          params: params,
        },
      });
      console.log(`[DeepLinkHandler] Navigated to ${stack}/${screen}:`, params);
    } catch (error) {
      console.error('[DeepLinkHandler] Stack navigation error:', error);
    }
  }

  /**
   * Navigate to screen
   * @param {string} screen - Screen name
   * @param {Object} params - Screen params
   */
  navigateToScreen(screen, params) {
    if (!this._navigationRef) {
      console.warn('[DeepLinkHandler] Navigation ref not set');
      return;
    }

    try {
      // Special handling for VisionBoard - navigate within Account stack
      if (screen === 'VisionBoard') {
        // First navigate to Account tab, then to VisionBoard screen
        this._navigationRef.navigate('MainTabs', {
          screen: 'Account',
          params: {
            screen: 'VisionBoard',
            params: params,
          },
        });
        console.log('[DeepLinkHandler] Navigated to VisionBoard:', params);
        return;
      }

      // Navigate to the tab first
      this._navigationRef.navigate('MainTabs', {
        screen: screen,
        params: params,
      });

      console.log('[DeepLinkHandler] Navigated to:', screen, params);
    } catch (error) {
      console.error('[DeepLinkHandler] Navigation error:', error);
    }
  }

  /**
   * Navigate to VisionBoard with specific tab
   * @param {string} tab - Tab name (affirmation, goals, iching, tarot)
   * @param {Object} additionalParams - Extra params
   */
  navigateToVisionBoard(tab = 'affirmation', additionalParams = {}) {
    this.navigateToScreen('VisionBoard', { tab, ...additionalParams });
  }

  /**
   * Store pending deep link
   * @param {Object} deepLink - Deep link to store
   */
  async storePendingDeepLink(deepLink) {
    try {
      await AsyncStorage.setItem(PENDING_DEEP_LINK_KEY, JSON.stringify(deepLink));
      console.log('[DeepLinkHandler] Stored pending deep link');
    } catch (error) {
      console.error('[DeepLinkHandler] Error storing deep link:', error);
    }
  }

  /**
   * Get and clear pending deep link
   * @returns {Object|null} - Pending deep link
   */
  async getPendingDeepLink() {
    try {
      const stored = await AsyncStorage.getItem(PENDING_DEEP_LINK_KEY);

      if (stored) {
        await AsyncStorage.removeItem(PENDING_DEEP_LINK_KEY);
        return JSON.parse(stored);
      }

      return null;
    } catch (error) {
      console.error('[DeepLinkHandler] Error getting pending deep link:', error);
      return null;
    }
  }

  /**
   * Handle complete task action
   * @param {Object} data - Notification data
   */
  async handleCompleteAction(data) {
    try {
      const { widgetId, taskId, userId } = data;

      if (!widgetId || !taskId) return;

      // Get widget from storage
      const widgets = await this.getUserWidgets();
      const widget = widgets.find((w) => w.id === widgetId);

      if (!widget || !widget.data?.tasks) return;

      // Update task as completed
      const updatedTasks = widget.data.tasks.map((task) =>
        task.id === taskId ? { ...task, completed: true, completedAt: new Date().toISOString() } : task
      );

      // Update widget
      widget.data.tasks = updatedTasks;

      // Save to storage
      const updatedWidgets = widgets.map((w) => (w.id === widgetId ? widget : w));
      await AsyncStorage.setItem('@gem_dashboard_widgets', JSON.stringify(updatedWidgets));

      // Show success notification
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Task Completed!',
          body: 'Great job! Keep up the momentum.',
          sound: true,
        },
        trigger: null,
      });

      // Navigate to VisionBoard goals tab
      await this.processDeepLink({
        screen: 'VisionBoard',
        params: {
          tab: 'goals',
          showConfetti: true,
        },
      });

      console.log('[DeepLinkHandler] Task completed:', taskId);
    } catch (error) {
      console.error('[DeepLinkHandler] Error completing task:', error);
    }
  }

  /**
   * Handle snooze action
   * @param {Object} notification - Original notification
   */
  async handleSnoozeAction(notification) {
    try {
      const { content } = notification.request;

      // Reschedule notification for 2 hours later
      await Notifications.scheduleNotificationAsync({
        content: {
          ...content,
          title: content.title,
          body: content.body,
        },
        trigger: {
          seconds: 2 * 60 * 60, // 2 hours
        },
      });

      console.log('[DeepLinkHandler] Notification snoozed for 2 hours');
    } catch (error) {
      console.error('[DeepLinkHandler] Error snoozing notification:', error);
    }
  }

  /**
   * Track notification engagement
   * @param {Object} data - Notification data
   * @param {string} action - Action taken
   */
  async trackEngagement(data, action) {
    try {
      const { type, userId, widgetId } = data;

      // Store locally first
      const engagementKey = '@gem_notification_engagement';
      const stored = await AsyncStorage.getItem(engagementKey);
      const history = stored ? JSON.parse(stored) : [];

      history.push({
        notificationType: type,
        action: action || 'OPENED',
        widgetId,
        timestamp: new Date().toISOString(),
      });

      // Keep last 100 entries
      const trimmed = history.slice(-100);
      await AsyncStorage.setItem(engagementKey, JSON.stringify(trimmed));

      // Try to sync to database
      if (userId) {
        await supabase
          .from('notification_history')
          .insert({
            user_id: userId,
            notification_type: type,
            action_taken: action || 'OPENED',
            action_data: { widgetId },
            created_at: new Date().toISOString(),
          })
          .then(() => console.log('[DeepLinkHandler] Engagement tracked'))
          .catch(() => console.log('[DeepLinkHandler] Could not sync engagement'));
      }
    } catch (error) {
      console.error('[DeepLinkHandler] Error tracking engagement:', error);
    }
  }

  /**
   * Get user widgets from storage
   */
  async getUserWidgets() {
    try {
      const stored = await AsyncStorage.getItem('@gem_dashboard_widgets');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('[DeepLinkHandler] Error getting widgets:', error);
      return [];
    }
  }

  /**
   * Set navigation reference
   * @param {Object} ref - Navigation reference
   */
  setNavigationRef(ref) {
    this._navigationRef = ref;
  }

  /**
   * Check if navigation is ready
   * @returns {boolean}
   */
  isNavigationReady() {
    return this._navigationRef?.isReady() || false;
  }

  /**
   * Get engagement statistics
   * @returns {Object} - Engagement stats
   */
  async getEngagementStats() {
    try {
      const stored = await AsyncStorage.getItem('@gem_notification_engagement');
      const history = stored ? JSON.parse(stored) : [];

      const stats = {
        total: history.length,
        opened: history.filter((h) => h.action === 'OPENED').length,
        completed: history.filter((h) => h.action === 'complete').length,
        snoozed: history.filter((h) => h.action === 'snooze').length,
        byType: {},
      };

      // Group by notification type
      history.forEach((h) => {
        if (!stats.byType[h.notificationType]) {
          stats.byType[h.notificationType] = 0;
        }
        stats.byType[h.notificationType]++;
      });

      return stats;
    } catch (error) {
      console.error('[DeepLinkHandler] Error getting stats:', error);
      return { total: 0, opened: 0, completed: 0, snoozed: 0, byType: {} };
    }
  }
}

export default new DeepLinkHandler();
