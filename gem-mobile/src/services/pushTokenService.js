/**
 * Push Token Service
 * Manages Expo Push Tokens and VoIP tokens for GEM
 * Reference: GEM_PARTNERSHIP_IMPLEMENTATION_PHASE5.md
 *
 * Features:
 * - Expo Push Token registration
 * - iOS VoIP PushKit token registration (for CallKeep)
 * - Android notification channels
 * - Token persistence in Supabase
 */

import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { supabase } from './supabase';
import callKeepService from './callKeepService';

// Dynamic import for VoIP push (iOS only, may not be installed)
let VoipPushNotification = null;
try {
  if (Platform.OS === 'ios') {
    VoipPushNotification = require('react-native-voip-push-notification').default;
  }
} catch (e) {
  console.log('[PushToken] VoIP push not available:', e.message);
}

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

      // Configure Android notification channels
      if (Platform.OS === 'android') {
        // Incoming call channel - highest priority with fullscreen intent
        await Notifications.setNotificationChannelAsync('incoming_call', {
          name: 'Cuộc gọi đến',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 500, 200, 500, 200, 500],
          lightColor: '#4CAF50',
          description: 'Thông báo cuộc gọi đến',
          sound: 'default',
          enableVibrate: true,
          showBadge: true,
          lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
          bypassDnd: true,
        });

        // Paper trade channel - for order fills, TP/SL, liquidation
        await Notifications.setNotificationChannelAsync('paper_trade', {
          name: 'Paper Trading',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FFD700',
          description: 'Thông báo giao dịch Paper Trade',
          sound: 'default',
          enableVibrate: true,
          showBadge: true,
        });

        // Messages channel
        await Notifications.setNotificationChannelAsync('messages', {
          name: 'Tin nhắn',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#2196F3',
          description: 'Thông báo tin nhắn mới',
        });

        // Partnership channel
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
   * Register for VoIP push notifications (iOS only)
   * This enables native incoming call UI via CallKeep
   * @returns {Promise<string|null>} VoIP token or null
   */
  async registerVoIPPush() {
    // Only iOS supports VoIP PushKit
    if (Platform.OS !== 'ios') {
      console.log('[PushToken] VoIP push is iOS only');
      return null;
    }

    if (!VoipPushNotification) {
      console.log('[PushToken] VoIP push module not available');
      return null;
    }

    if (!Device.isDevice) {
      console.log('[PushToken] VoIP push requires physical device');
      return null;
    }

    return new Promise((resolve) => {
      try {
        console.log('[PushToken] Registering for VoIP push...');

        // Listen for VoIP token
        VoipPushNotification.addEventListener('register', async (token) => {
          console.log('[PushToken] VoIP token received:', token?.substring(0, 20) + '...');

          // Save to database
          await this.saveVoIPToken(token);

          resolve(token);
        });

        // Listen for incoming VoIP notifications
        VoipPushNotification.addEventListener('notification', (notification) => {
          console.log('[PushToken] VoIP notification received:', notification);

          // Extract call data
          const { callId, callerName, callType, callerId, conversationId } = notification;

          // Display native incoming call UI via CallKeep
          if (callId && callerName && callKeepService.available) {
            callKeepService.displayIncomingCall(
              callId,
              callerName,
              callType === 'video',
              '',
              { callerId, conversationId, callType }
            );
          }
        });

        // Listen for when remote notifications are registered
        VoipPushNotification.addEventListener('didLoadWithEvents', (events) => {
          console.log('[PushToken] VoIP didLoadWithEvents:', events?.length);

          // Process any queued events
          if (events && Array.isArray(events)) {
            events.forEach((event) => {
              if (event.name === 'RNVoipPushRemoteNotificationsRegisteredEvent') {
                // Token event
                console.log('[PushToken] Processing queued token event');
              } else if (event.name === 'RNVoipPushRemoteNotificationReceivedEvent') {
                // Notification event - process incoming call
                const notification = event.data;
                if (notification) {
                  const { callId, callerName, callType, callerId, conversationId } = notification;
                  if (callId && callerName && callKeepService.available) {
                    callKeepService.displayIncomingCall(
                      callId,
                      callerName,
                      callType === 'video',
                      '',
                      { callerId, conversationId, callType }
                    );
                  }
                }
              }
            });
          }
        });

        // Request VoIP push registration
        VoipPushNotification.registerVoipToken();

        // Timeout after 10 seconds if no token
        setTimeout(() => {
          console.log('[PushToken] VoIP registration timeout');
          resolve(null);
        }, 10000);
      } catch (err) {
        console.error('[PushToken] VoIP registration error:', err);
        resolve(null);
      }
    });
  },

  /**
   * Save VoIP token to database
   * @param {string} token - VoIP PushKit token
   */
  async saveVoIPToken(token) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('[PushToken] No user logged in, cannot save VoIP token');
        return;
      }

      // Use RPC function to upsert VoIP token
      const { error: rpcError } = await supabase.rpc('update_voip_token', {
        p_user_id: user.id,
        p_voip_token: token,
        p_platform: 'ios',
      });

      if (rpcError) {
        // Fallback to direct upsert if RPC doesn't exist
        console.log('[PushToken] RPC failed, trying direct upsert:', rpcError.message);

        const { error: upsertError } = await supabase.from('user_push_tokens').upsert(
          {
            user_id: user.id,
            voip_token: token,
            platform: 'ios',
            is_active: true,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id' }
        );

        if (upsertError) {
          console.error('[PushToken] VoIP token save failed:', upsertError.message);
        } else {
          console.log('[PushToken] VoIP token saved via upsert');
        }
      } else {
        console.log('[PushToken] VoIP token saved via RPC');
      }
    } catch (err) {
      console.error('[PushToken] saveVoIPToken error:', err);
    }
  },

  /**
   * Remove VoIP token (on logout)
   */
  async removeVoIPToken() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('user_push_tokens')
        .update({ voip_token: null })
        .eq('user_id', user.id);

      if (error) {
        console.error('[PushToken] Remove VoIP token error:', error);
      } else {
        console.log('[PushToken] VoIP token removed');
      }
    } catch (err) {
      console.error('[PushToken] removeVoIPToken error:', err);
    }
  },

  /**
   * Register all push notifications (Expo + VoIP)
   * Call this when user logs in
   * @returns {Promise<{expoPushToken: string|null, voipToken: string|null}>}
   */
  async registerAllPushTokens() {
    console.log('[PushToken] Registering all push tokens...');

    // Register Expo push token
    const expoPushToken = await this.registerForPushNotifications();

    // Register VoIP token (iOS only)
    const voipToken = await this.registerVoIPPush();

    console.log('[PushToken] Registration complete:', {
      hasExpoPushToken: !!expoPushToken,
      hasVoIPToken: !!voipToken,
    });

    return { expoPushToken, voipToken };
  },

  /**
   * Save push token to database
   * IMPORTANT: First removes this token from ALL other users to prevent
   * notifications going to the wrong device when users switch accounts
   * @param {string} token - Expo push token
   */
  async savePushToken(token) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('[PushToken] No user logged in');
        return;
      }

      console.log('[PushToken] Saving token for user:', user.id);

      // CRITICAL: First, remove this token from ALL other users
      // This prevents notifications being sent to wrong user when accounts switch on same device
      const { data: existingTokens, error: checkError } = await supabase
        .from('user_push_tokens')
        .select('user_id')
        .eq('token', token)
        .neq('user_id', user.id);

      if (!checkError && existingTokens && existingTokens.length > 0) {
        console.log('[PushToken] Found token on other users, removing:', existingTokens.map(t => t.user_id));

        // Delete token from other users
        await supabase
          .from('user_push_tokens')
          .delete()
          .eq('token', token)
          .neq('user_id', user.id);

        // Also clear from profiles table
        const otherUserIds = existingTokens.map(t => t.user_id);
        await supabase
          .from('profiles')
          .update({ expo_push_token: null })
          .in('id', otherUserIds);

        console.log('[PushToken] Cleaned up token from other users');
      }

      // Now save to user_push_tokens table for current user
      const { error: tokenError } = await supabase.from('user_push_tokens').upsert({
        user_id: user.id,
        token: token,
        platform: Platform.OS,
        device_info: { model: Device.modelName || 'Unknown', source: 'pushTokenService' },
        is_active: true,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' });

      if (tokenError) {
        console.log('[PushToken] user_push_tokens save failed, trying profiles:', tokenError.message);
      } else {
        console.log('[PushToken] Saved to user_push_tokens for user:', user.id);
      }

      // Also save to profiles.expo_push_token as fallback
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ expo_push_token: token })
        .eq('id', user.id);

      if (profileError) {
        console.log('[PushToken] profiles save failed:', profileError.message);
      } else {
        console.log('[PushToken] Saved to profiles.expo_push_token');
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
