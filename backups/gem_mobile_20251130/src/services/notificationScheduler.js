/**
 * Gemral - Notification Scheduler
 *
 * Smart scheduling for widget-based notifications:
 * - Morning Affirmations (default 8:00 AM)
 * - Midday Check-in (default 12:00 PM)
 * - Evening Visualization (default 9:00 PM)
 * - Milestone Celebrations (instant)
 *
 * Features:
 * - Deep link to Account tab with widget highlight
 * - Personalized content based on user's widgets
 * - Timezone-aware scheduling
 * - Max 3 notifications per day
 */

import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabase';
import notificationPersonalizer from './notificationPersonalizer';

const WIDGET_NOTIFICATION_SETTINGS_KEY = '@gem_widget_notification_settings';
const PUSH_TOKEN_KEY = '@gem_push_token';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

class NotificationScheduler {
  constructor() {
    this._userId = null;
    this._settings = this.getDefaultSettings();
    this._initialized = false;
  }

  /**
   * Default notification settings
   */
  getDefaultSettings() {
    return {
      enabled: true,
      categories: {
        morning_affirmations: true,
        midday_checkin: true,
        evening_visualization: true,
        milestone_celebrations: true,
      },
      frequency: {
        max_per_day: 3,
      },
      do_not_disturb: {
        enabled: false,
        start: '22:00',
        end: '08:00',
      },
      custom_times: {
        morning: '08:00',
        midday: '12:00',
        evening: '21:00',
      },
    };
  }

  /**
   * Initialize notification scheduler
   * @param {string} userId - Current user ID
   */
  async initialize(userId) {
    try {
      this._userId = userId;

      // Request permissions
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        console.log('[NotificationScheduler] Permissions not granted');
        return false;
      }

      // Get push token
      const token = await this.registerForPushNotifications();
      if (token) {
        await this.savePushToken(userId, token);
      }

      // Load user settings
      await this.loadSettings();

      // Configure Android channels
      if (Platform.OS === 'android') {
        await this.setupAndroidChannels();
      }

      // Schedule widget notifications
      await this.scheduleAllNotifications(userId);

      this._initialized = true;
      console.log('[NotificationScheduler] Initialized successfully');
      return true;
    } catch (error) {
      console.error('[NotificationScheduler] Initialize error:', error);
      return false;
    }
  }

  /**
   * Request notification permissions
   */
  async requestPermissions() {
    if (!Device.isDevice) {
      console.warn('[NotificationScheduler] Must use physical device for notifications');
      return false;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    return finalStatus === 'granted';
  }

  /**
   * Register for push notifications
   */
  async registerForPushNotifications() {
    try {
      const token = (await Notifications.getExpoPushTokenAsync({
        projectId: 'gem-platform-mobile', // Replace with your Expo project ID
      })).data;

      await AsyncStorage.setItem(PUSH_TOKEN_KEY, token);
      return token;
    } catch (error) {
      console.error('[NotificationScheduler] Error getting push token:', error);
      return null;
    }
  }

  /**
   * Setup Android notification channels
   */
  async setupAndroidChannels() {
    // Widget notifications channel
    await Notifications.setNotificationChannelAsync('widget-notifications', {
      name: 'Widget Reminders',
      description: 'Notifications for your dashboard widgets',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FFBD59',
      sound: 'default',
    });

    // Milestone celebrations channel
    await Notifications.setNotificationChannelAsync('milestones', {
      name: 'Milestone Celebrations',
      description: 'Celebrate your progress achievements',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 500, 200, 500],
      lightColor: '#FFD700',
      sound: 'celebration.mp3',
    });
  }

  /**
   * Save push token to database
   */
  async savePushToken(userId, token) {
    try {
      await supabase
        .from('user_push_tokens')
        .upsert(
          {
            user_id: userId,
            token: token,
            platform: Platform.OS,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id' }
        );
    } catch (error) {
      console.error('[NotificationScheduler] Error saving push token:', error);
    }
  }

  /**
   * Load notification settings
   */
  async loadSettings() {
    try {
      // Try local storage first
      const stored = await AsyncStorage.getItem(WIDGET_NOTIFICATION_SETTINGS_KEY);
      if (stored) {
        this._settings = { ...this.getDefaultSettings(), ...JSON.parse(stored) };
        return;
      }

      // Try database
      if (this._userId) {
        const { data } = await supabase
          .from('notification_settings')
          .select('*')
          .eq('user_id', this._userId)
          .single();

        if (data) {
          this._settings = {
            enabled: data.enabled,
            categories: data.categories || this.getDefaultSettings().categories,
            frequency: data.frequency || this.getDefaultSettings().frequency,
            do_not_disturb: data.do_not_disturb || this.getDefaultSettings().do_not_disturb,
            custom_times: data.custom_times || this.getDefaultSettings().custom_times,
          };
        }
      }
    } catch (error) {
      console.error('[NotificationScheduler] Error loading settings:', error);
    }
  }

  /**
   * Save notification settings
   */
  async saveSettings(settings) {
    try {
      this._settings = { ...this._settings, ...settings };

      // Save to local storage
      await AsyncStorage.setItem(
        WIDGET_NOTIFICATION_SETTINGS_KEY,
        JSON.stringify(this._settings)
      );

      // Save to database
      if (this._userId) {
        await supabase.from('notification_settings').upsert(
          {
            user_id: this._userId,
            ...this._settings,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id' }
        );
      }

      // Reschedule notifications with new settings
      await this.scheduleAllNotifications(this._userId);
    } catch (error) {
      console.error('[NotificationScheduler] Error saving settings:', error);
    }
  }

  /**
   * Get current settings
   */
  getSettings() {
    return { ...this._settings };
  }

  /**
   * Schedule all widget notifications
   */
  async scheduleAllNotifications(userId) {
    try {
      if (!this._settings.enabled) {
        console.log('[NotificationScheduler] Notifications disabled');
        await this.cancelAllWidgetNotifications();
        return;
      }

      // Cancel existing widget notifications first
      await this.cancelAllWidgetNotifications();

      // Get user's widgets from local storage or database
      const widgets = await this.getUserWidgets(userId);

      if (widgets.length === 0) {
        console.log('[NotificationScheduler] No widgets found');
        return;
      }

      // Schedule based on categories
      if (this._settings.categories.morning_affirmations) {
        await this.scheduleMorningAffirmation(userId, widgets);
      }

      if (this._settings.categories.midday_checkin) {
        await this.scheduleMiddayCheckin(userId, widgets);
      }

      if (this._settings.categories.evening_visualization) {
        await this.scheduleEveningVisualization(userId, widgets);
      }

      console.log('[NotificationScheduler] All notifications scheduled');
    } catch (error) {
      console.error('[NotificationScheduler] Error scheduling notifications:', error);
    }
  }

  /**
   * Get user widgets from storage
   */
  async getUserWidgets(userId) {
    try {
      // Try local storage first
      const stored = await AsyncStorage.getItem('@gem_dashboard_widgets');
      if (stored) {
        return JSON.parse(stored);
      }

      // Fallback to database
      const { data } = await supabase
        .from('user_widgets')
        .select('*')
        .eq('user_id', userId)
        .order('order_index', { ascending: true });

      return data || [];
    } catch (error) {
      console.error('[NotificationScheduler] Error getting widgets:', error);
      return [];
    }
  }

  /**
   * Schedule morning affirmation notification
   */
  async scheduleMorningAffirmation(userId, widgets) {
    const time = this.parseTime(this._settings.custom_times.morning);
    const content = await notificationPersonalizer.getMorningAffirmation(widgets);

    if (!content) return;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: content.title,
        body: content.body,
        data: {
          type: 'MORNING_AFFIRMATION',
          userId,
          widgetId: content.widgetId,
          deepLink: {
            screen: 'Account',
            params: {
              scrollToWidget: content.widgetId,
              expandDashboard: true,
            },
          },
        },
        sound: true,
        ...(Platform.OS === 'android' && { channelId: 'widget-notifications' }),
      },
      trigger: {
        hour: time.hour,
        minute: time.minute,
        repeats: true,
      },
      identifier: 'morning-affirmation',
    });

    console.log(`[NotificationScheduler] Morning affirmation scheduled for ${time.hour}:${time.minute}`);
  }

  /**
   * Schedule midday check-in notification
   */
  async scheduleMiddayCheckin(userId, widgets) {
    const time = this.parseTime(this._settings.custom_times.midday);
    const content = await notificationPersonalizer.getMiddayCheckin(widgets);

    if (!content) return;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: content.title,
        body: content.body,
        data: {
          type: 'MIDDAY_CHECKIN',
          userId,
          widgetId: content.widgetId,
          taskId: content.taskId,
          deepLink: {
            screen: 'Account',
            params: {
              scrollToWidget: content.widgetId,
              expandDashboard: true,
              action: 'FOCUS_TASK',
              taskId: content.taskId,
            },
          },
        },
        sound: true,
        ...(Platform.OS === 'android' && { channelId: 'widget-notifications' }),
      },
      trigger: {
        hour: time.hour,
        minute: time.minute,
        repeats: true,
      },
      identifier: 'midday-checkin',
    });

    console.log(`[NotificationScheduler] Midday check-in scheduled for ${time.hour}:${time.minute}`);
  }

  /**
   * Schedule evening visualization notification
   */
  async scheduleEveningVisualization(userId, widgets) {
    const time = this.parseTime(this._settings.custom_times.evening);
    const content = await notificationPersonalizer.getEveningVisualization(widgets);

    if (!content) return;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: content.title,
        body: content.body,
        data: {
          type: 'EVENING_VISUALIZATION',
          userId,
          widgetId: content.widgetId,
          deepLink: {
            screen: 'Account',
            params: {
              scrollToWidget: content.widgetId,
              expandDashboard: true,
            },
          },
        },
        sound: true,
        ...(Platform.OS === 'android' && { channelId: 'widget-notifications' }),
      },
      trigger: {
        hour: time.hour,
        minute: time.minute,
        repeats: true,
      },
      identifier: 'evening-visualization',
    });

    console.log(`[NotificationScheduler] Evening visualization scheduled for ${time.hour}:${time.minute}`);
  }

  /**
   * Send milestone celebration notification (instant)
   */
  async sendMilestoneNotification(userId, widget, milestone) {
    if (!this._settings.categories.milestone_celebrations) return;

    const { percentage, currentAmount, targetAmount, goalTitle } = milestone;

    const milestoneEmojis = {
      10: '🌟',
      25: '💫',
      50: '🔥',
      75: '🚀',
      100: '🎉🏆',
    };

    const emoji = milestoneEmojis[percentage] || '✨';

    await Notifications.scheduleNotificationAsync({
      content: {
        title: `${emoji} Milestone Achieved!`,
        body: `You've reached ${percentage}% of "${goalTitle}"!\n${currentAmount} / ${targetAmount}`,
        data: {
          type: 'MILESTONE_CELEBRATION',
          userId,
          widgetId: widget.id,
          milestone: percentage,
          deepLink: {
            screen: 'Account',
            params: {
              scrollToWidget: widget.id,
              expandDashboard: true,
              showConfetti: true,
            },
          },
        },
        sound: 'celebration.mp3',
        priority: 'high',
        ...(Platform.OS === 'android' && { channelId: 'milestones' }),
      },
      trigger: null, // Send immediately
    });

    console.log(`[NotificationScheduler] Milestone notification sent: ${percentage}%`);
  }

  /**
   * Cancel all widget notifications
   */
  async cancelAllWidgetNotifications() {
    try {
      const identifiers = ['morning-affirmation', 'midday-checkin', 'evening-visualization'];

      for (const identifier of identifiers) {
        await Notifications.cancelScheduledNotificationAsync(identifier).catch(() => {});
      }

      console.log('[NotificationScheduler] Widget notifications cancelled');
    } catch (error) {
      console.error('[NotificationScheduler] Error cancelling notifications:', error);
    }
  }

  /**
   * Parse time string (HH:MM)
   */
  parseTime(timeString) {
    const [hour, minute] = timeString.split(':').map(Number);
    return { hour, minute };
  }

  /**
   * Check if current time is in Do Not Disturb period
   */
  isDoNotDisturbActive() {
    if (!this._settings.do_not_disturb.enabled) return false;

    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    const start = this.parseTime(this._settings.do_not_disturb.start);
    const end = this.parseTime(this._settings.do_not_disturb.end);

    const startMinutes = start.hour * 60 + start.minute;
    const endMinutes = end.hour * 60 + end.minute;

    // Handle overnight periods (e.g., 22:00 to 08:00)
    if (startMinutes > endMinutes) {
      return currentMinutes >= startMinutes || currentMinutes < endMinutes;
    }

    return currentMinutes >= startMinutes && currentMinutes < endMinutes;
  }

  /**
   * Get scheduled notifications
   */
  async getScheduledNotifications() {
    try {
      const scheduled = await Notifications.getAllScheduledNotificationsAsync();
      return scheduled.filter(
        (n) =>
          n.identifier === 'morning-affirmation' ||
          n.identifier === 'midday-checkin' ||
          n.identifier === 'evening-visualization'
      );
    } catch (error) {
      console.error('[NotificationScheduler] Error getting scheduled notifications:', error);
      return [];
    }
  }
}

export default new NotificationScheduler();
