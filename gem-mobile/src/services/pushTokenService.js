/**
 * Push Token Service
 * Manages Expo Push Tokens for GEM Partnership v3.0
 * Reference: GEM_PARTNERSHIP_IMPLEMENTATION_PHASE5.md
 */

import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { supabase } from './supabase';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

const PUSH_TOKEN_SERVICE = {
  /**
   * Register for push notifications
   * Call this when user logs in or app starts
   * @returns {Promise<string|null>} Push token or null
   */
  async registerForPushNotifications() {
    try {
      // Check if physical device
      if (!Device.isDevice) {
        console.log('[PushToken] Must use physical device for Push Notifications');
        return null;
      }

      // Get current permission status
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      // Request permission if not granted
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('[PushToken] Permission not granted');
        return null;
      }

      // Get push token
      const projectId = Constants.expoConfig?.extra?.eas?.projectId || Constants.easConfig?.projectId;

      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId,
      });

      const token = tokenData.data;
      console.log('[PushToken] Token obtained:', token?.substring(0, 30) + '...');

      // Save to database
      await this.savePushToken(token);

      // Configure Android channel for partnership notifications
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('partnership', {
          name: 'Partnership',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FFBD59',
          description: 'Thong bao ve chuong trinh Partnership',
        });

        await Notifications.setNotificationChannelAsync('commission', {
          name: 'Hoa hong',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#4CAF50',
          description: 'Thong bao ve hoa hong va thanh toan',
        });

        await Notifications.setNotificationChannelAsync('tier', {
          name: 'Tier',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 500, 250, 500],
          lightColor: '#FFD700',
          description: 'Thong bao ve thang/ha tier',
        });
      }

      return token;
    } catch (err) {
      console.error('[PushToken] Register error:', err);
      return null;
    }
  },

  /**
   * Save push token to database
   * @param {string} token - Expo push token
   */
  async savePushToken(token) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('[PushToken] No user logged in');
        return;
      }

      // Upsert push token
      const { error } = await supabase.from('user_push_tokens').upsert({
        user_id: user.id,
        push_token: token,
        platform: Platform.OS,
        device_name: Device.modelName || 'Unknown',
        is_active: true,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' });

      if (error) {
        console.error('[PushToken] Save error:', error);
      } else {
        console.log('[PushToken] Saved to database');
      }
    } catch (err) {
      console.error('[PushToken] Save error:', err);
    }
  },

  /**
   * Remove push token (on logout)
   */
  async removePushToken() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('user_push_tokens')
        .update({ is_active: false })
        .eq('user_id', user.id);

      if (error) {
        console.error('[PushToken] Remove error:', error);
      } else {
        console.log('[PushToken] Deactivated in database');
      }
    } catch (err) {
      console.error('[PushToken] Remove error:', err);
    }
  },

  /**
   * Completely delete push token (for account deletion)
   */
  async deletePushToken() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase
        .from('user_push_tokens')
        .delete()
        .eq('user_id', user.id);

      console.log('[PushToken] Deleted from database');
    } catch (err) {
      console.error('[PushToken] Delete error:', err);
    }
  },

  /**
   * Add notification listeners
   * @param {Function} onNotificationReceived - Called when notification received in foreground
   * @param {Function} onNotificationResponse - Called when user taps notification
   * @returns {Function} Cleanup function
   */
  addNotificationListeners(onNotificationReceived, onNotificationResponse) {
    // Listener for notifications received while app is foregrounded
    const receivedSubscription = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log('[PushToken] Notification received:', notification.request.content.title);
        if (onNotificationReceived) {
          onNotificationReceived(notification);
        }
      }
    );

    // Listener for user tapping on notification
    const responseSubscription = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        console.log('[PushToken] Notification tapped:', response.notification.request.content.title);
        if (onNotificationResponse) {
          onNotificationResponse(response);
        }
      }
    );

    // Return cleanup function
    return () => {
      receivedSubscription.remove();
      responseSubscription.remove();
    };
  },

  /**
   * Get current badge count
   * @returns {Promise<number>} Badge count
   */
  async getBadgeCount() {
    try {
      return await Notifications.getBadgeCountAsync();
    } catch {
      return 0;
    }
  },

  /**
   * Set badge count
   * @param {number} count - Badge count
   */
  async setBadgeCount(count) {
    try {
      await Notifications.setBadgeCountAsync(count);
    } catch (err) {
      console.error('[PushToken] Set badge error:', err);
    }
  },

  /**
   * Increment badge count
   */
  async incrementBadge() {
    const current = await this.getBadgeCount();
    await this.setBadgeCount(current + 1);
  },

  /**
   * Clear all notifications
   */
  async clearAllNotifications() {
    try {
      await Notifications.dismissAllNotificationsAsync();
      await this.setBadgeCount(0);
      console.log('[PushToken] All notifications cleared');
    } catch (err) {
      console.error('[PushToken] Clear error:', err);
    }
  },

  /**
   * Schedule local notification (for testing)
   * @param {Object} options - Notification options
   */
  async scheduleLocalNotification({ title, body, data = {}, seconds = 1 }) {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data,
          sound: 'default',
        },
        trigger: { seconds },
      });
      console.log('[PushToken] Local notification scheduled');
    } catch (err) {
      console.error('[PushToken] Schedule error:', err);
    }
  },

  /**
   * Get notification preferences
   * @returns {Promise<Object>} Notification preferences
   */
  async getPreferences() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('[PushToken] Get preferences error:', error);
      }

      return data;
    } catch (err) {
      console.error('[PushToken] Get preferences error:', err);
      return null;
    }
  },

  /**
   * Update notification preferences
   * @param {Object} preferences - Preferences to update
   */
  async updatePreferences(preferences) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { success: false };

      const { error } = await supabase
        .from('notification_preferences')
        .upsert({
          user_id: user.id,
          ...preferences,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' });

      if (error) throw error;

      console.log('[PushToken] Preferences updated');
      return { success: true };
    } catch (err) {
      console.error('[PushToken] Update preferences error:', err);
      return { success: false, error: err.message };
    }
  },
};

export default PUSH_TOKEN_SERVICE;
