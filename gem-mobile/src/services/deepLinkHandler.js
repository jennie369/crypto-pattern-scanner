/**
 * Gemral - Deep Link Handler
 *
 * Handles deep links from notifications:
 * - Navigate to Account tab
 * - Scroll to specific widget
 * - Highlight widget
 * - Execute actions (complete task, show confetti)
 *
 * Usage:
 * 1. Initialize in App.js
 * 2. Call handleDeepLink from notification response
 * 3. NavigationService handles actual navigation
 */

import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabase';

const PENDING_DEEP_LINK_KEY = '@gem_pending_deep_link';

class DeepLinkHandler {
  constructor() {
    this._navigationRef = null;
    this._responseListener = null;
    this._initialNotification = null;
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
      Notifications.removeNotificationSubscription(this._responseListener);
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
      if (data.deepLink) {
        await this.processDeepLink(data.deepLink);
      }
    } catch (error) {
      console.error('[DeepLinkHandler] Error handling notification:', error);
    }
  }

  /**
   * Process deep link
   * @param {Object} deepLink - Deep link configuration
   */
  async processDeepLink(deepLink) {
    const { screen, params } = deepLink;

    // If navigation is ready, navigate immediately
    if (this._navigationRef?.isReady()) {
      this.navigateToScreen(screen, params);
    } else {
      // Store for later processing
      await this.storePendingDeepLink(deepLink);
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

    // Navigate to the tab first
    this._navigationRef.navigate('MainTabs', {
      screen: screen,
      params: params,
    });

    console.log('[DeepLinkHandler] Navigated to:', screen, params);
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

      // Navigate to widget
      await this.processDeepLink({
        screen: 'Account',
        params: {
          scrollToWidget: widgetId,
          expandDashboard: true,
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
