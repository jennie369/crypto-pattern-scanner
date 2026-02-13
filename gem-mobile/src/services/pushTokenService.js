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

// VoIP push module - loaded lazily to prevent crash if not properly linked
// IMPORTANT: Don't load at module initialization - load only when needed
import { NativeModules } from 'react-native';

let VoipPushNotification = null;
let voipModuleLoaded = false;
let voipModuleError = false;

function getVoipModule() {
  // If we already tried and failed, don't try again
  if (voipModuleError) return null;
  if (voipModuleLoaded) return VoipPushNotification;

  if (Platform.OS !== 'ios') {
    voipModuleLoaded = true;
    return null;
  }

  // Check if native module is linked BEFORE trying to require JS module
  console.log('[PushToken] Checking NativeModules.RNVoipPushNotification:', !!NativeModules.RNVoipPushNotification);
  console.log('[PushToken] Available NativeModules:', Object.keys(NativeModules).filter(k => k.includes('Voip') || k.includes('Push') || k.includes('Call')));

  if (!NativeModules.RNVoipPushNotification) {
    console.log('[PushToken] VoIP native module not linked in this build - skipping');
    voipModuleLoaded = true;
    voipModuleError = true;
    return null;
  }

  try {
    // IMPORTANT: This require() only works AFTER EAS rebuild with native modules
    // Metro bundles this statically, so if native module isn't linked, app crashes
    // The NativeModules check above prevents reaching here if not linked
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const voipModule = require('react-native-voip-push-notification');
    VoipPushNotification = voipModule?.default || voipModule;
    voipModuleLoaded = true;
    console.log('[PushToken] VoIP module loaded successfully');
    return VoipPushNotification;
  } catch (e) {
    console.log('[PushToken] VoIP push not available:', e?.message || 'unknown error');
    VoipPushNotification = null;
    voipModuleLoaded = true;
    voipModuleError = true;
    return null;
  }
}

// NOTE: Notification handler is configured in InAppNotificationContext.js
// Do NOT configure it here to avoid conflicts and duplicate handlers

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
      // For Android: Use native FCM token so we can send via FCM V1 API directly
      // For iOS: Use Expo token (VoIP uses PushKit separately)
      let token;

      if (Platform.OS === 'android') {
        // Get native FCM token for Android
        // This allows our Edge Function to use FCM V1 API directly (bypassing Expo Push)
        try {
          const deviceToken = await Notifications.getDevicePushTokenAsync();
          token = deviceToken.data;
          console.log('[PushToken] Android native FCM token obtained:', token?.substring(0, 30) + '...');
        } catch (fcmErr) {
          console.log('[PushToken] Failed to get native FCM token, falling back to Expo:', fcmErr?.message);
          // Fallback to Expo token
          const projectId = Constants.expoConfig?.extra?.eas?.projectId || Constants.easConfig?.projectId;
          const tokenData = await Notifications.getExpoPushTokenAsync({ projectId });
          token = tokenData.data;
        }
      } else {
        // iOS - use Expo token for regular push
        const projectId = Constants.expoConfig?.extra?.eas?.projectId || Constants.easConfig?.projectId;
        const tokenData = await Notifications.getExpoPushTokenAsync({ projectId });
        token = tokenData.data;
        console.log('[PushToken] iOS Expo token obtained:', token?.substring(0, 30) + '...');
      }

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

    if (!Device.isDevice) {
      console.log('[PushToken] VoIP push requires physical device (not simulator)');
      return null;
    }

    // Early check: Is native module linked? This must happen BEFORE require()
    try {
      const { NativeModules } = require('react-native');
      if (!NativeModules.RNVoipPushNotification) {
        console.log('[PushToken] VoIP native module not linked in this build - skipping registration');
        return null;
      }
    } catch (nativeCheckErr) {
      console.log('[PushToken] Error checking native module:', nativeCheckErr?.message);
      return null;
    }

    // Load VoIP module lazily
    let voipModule;
    try {
      voipModule = getVoipModule();
    } catch (loadErr) {
      console.log('[PushToken] Error loading VoIP module:', loadErr?.message);
      return null;
    }

    if (!voipModule) {
      console.log('[PushToken] VoIP push module not available - check if react-native-voip-push-notification is installed and linked');
      return null;
    }

    // Capture 'this' for use in callbacks
    const self = this;

    return new Promise((resolve) => {
      let resolved = false;

      const resolveOnce = (token) => {
        if (!resolved) {
          resolved = true;
          resolve(token);
        }
      };

      try {
        console.log('[PushToken] REGISTERING FOR VoIP PUSH');

        // Check if addEventListener exists
        if (typeof voipModule.addEventListener !== 'function') {
          console.log('[PushToken] VoIP module does not have addEventListener - may not be properly configured');
          resolveOnce(null);
          return;
        }

        // Listen for VoIP token
        voipModule.addEventListener('register', async (token) => {
          console.log('[PushToken] ========================================');
          console.log('[PushToken] VoIP TOKEN RECEIVED!');
          console.log('[PushToken] Token:', token);
          console.log('[PushToken] Token length:', token?.length);
          console.log('[PushToken] ========================================');

          // Save to database
          try {
            await self.saveVoIPToken(token);
            console.log('[PushToken] VoIP token saved to database');
          } catch (saveErr) {
            console.error('[PushToken] Failed to save VoIP token:', saveErr);
          }

          resolveOnce(token);
        });

        // Listen for incoming VoIP notifications
        voipModule.addEventListener('notification', (notification) => {
          console.log('[PushToken] ========================================');
          console.log('[PushToken] VoIP NOTIFICATION RECEIVED');
          console.log('[PushToken] Notification:', JSON.stringify(notification, null, 2));
          console.log('[PushToken] ========================================');

          // Extract call data
          const { callId, callerName, callType, callerId, conversationId } = notification;

          // Display native incoming call UI via CallKeep
          if (callId && callerName && callKeepService.available) {
            console.log('[PushToken] Displaying incoming call via CallKeep');
            callKeepService.displayIncomingCall(
              callId,
              callerName,
              callType === 'video',
              '',
              { callerId, conversationId, callType }
            );
          } else {
            console.log('[PushToken] Cannot display call - callId:', callId, 'callerName:', callerName, 'callKeepAvailable:', callKeepService.available);
          }
        });

        // Listen for when remote notifications are registered
        voipModule.addEventListener('didLoadWithEvents', (events) => {
          console.log('[PushToken] VoIP didLoadWithEvents:', events?.length, 'events');

          // Process any queued events
          if (events && Array.isArray(events)) {
            events.forEach((event, index) => {
              console.log(`[PushToken] Processing queued event ${index}:`, event.name);
              if (event.name === 'RNVoipPushRemoteNotificationsRegisteredEvent') {
                // Token event - extract token from event data
                console.log('[PushToken] Queued token event data:', event.data);
                if (event.data) {
                  // The token might be in event.data
                  self.saveVoIPToken(event.data).catch(e => console.error('[PushToken] Save queued token failed:', e));
                }
              } else if (event.name === 'RNVoipPushRemoteNotificationReceivedEvent') {
                // Notification event - process incoming call
                const notification = event.data;
                console.log('[PushToken] Queued notification event:', notification);
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

        // Request VoIP push registration - wrap in separate try/catch
        try {
          console.log('[PushToken] Calling registerVoipToken()...');
          if (typeof voipModule.registerVoipToken === 'function') {
            voipModule.registerVoipToken();
            console.log('[PushToken] registerVoipToken() called, waiting for callback...');
          } else {
            console.log('[PushToken] registerVoipToken is not a function - module may not be properly linked');
            resolveOnce(null);
            return;
          }
        } catch (regErr) {
          console.log('[PushToken] registerVoipToken() failed:', regErr?.message || regErr);
          resolveOnce(null);
          return;
        }

        // Timeout after 15 seconds if no token
        setTimeout(() => {
          if (!resolved) {
            console.log('[PushToken] VoIP REGISTRATION TIMEOUT (15s)');
            resolveOnce(null);
          }
        }, 15000);
      } catch (err) {
        console.log('[PushToken] VoIP registration error:', err?.message || err);
        resolveOnce(null);
      }
    });
  },

  /**
   * Save VoIP token to database
   * @param {string} token - VoIP PushKit token
   */
  async saveVoIPToken(token) {
    console.log('[PushToken] ========================================');
    console.log('[PushToken] SAVING VoIP TOKEN TO DATABASE');
    console.log('[PushToken] Token to save:', token?.substring(0, 30) + '...');
    console.log('[PushToken] ========================================');

    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) {
        console.error('[PushToken] Auth error:', authError);
        return;
      }
      if (!user) {
        console.log('[PushToken] No user logged in, cannot save VoIP token');
        return;
      }

      console.log('[PushToken] Saving VoIP token for user:', user.id);

      // Try direct upsert first (more reliable than RPC)
      const { data: upsertData, error: upsertError } = await supabase.from('user_push_tokens').upsert(
        {
          user_id: user.id,
          voip_token: token,
          platform: 'ios',
          is_active: true,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      ).select();

      if (upsertError) {
        console.error('[PushToken] Direct upsert failed:', upsertError.message);
        console.error('[PushToken] Error details:', JSON.stringify(upsertError, null, 2));

        // Try RPC as fallback
        console.log('[PushToken] Trying RPC fallback...');
        const { error: rpcError } = await supabase.rpc('update_voip_token', {
          p_user_id: user.id,
          p_voip_token: token,
          p_platform: 'ios',
        });

        if (rpcError) {
          console.error('[PushToken] RPC also failed:', rpcError.message);

          // Last resort: try simple update
          console.log('[PushToken] Trying simple update...');
          const { error: updateError } = await supabase
            .from('user_push_tokens')
            .update({ voip_token: token, updated_at: new Date().toISOString() })
            .eq('user_id', user.id);

          if (updateError) {
            console.error('[PushToken] All save methods failed:', updateError.message);
          } else {
            console.log('[PushToken] VoIP token saved via simple update');
          }
        } else {
          console.log('[PushToken] VoIP token saved via RPC');
        }
      } else {
        console.log('[PushToken] VoIP token saved via upsert');
        console.log('[PushToken] Upsert result:', JSON.stringify(upsertData, null, 2));
      }

      // Verify the save
      const { data: verifyData, error: verifyError } = await supabase
        .from('user_push_tokens')
        .select('voip_token')
        .eq('user_id', user.id)
        .single();

      if (verifyError) {
        console.error('[PushToken] Verify failed:', verifyError.message);
      } else {
        console.log('[PushToken] Verified saved token:', verifyData?.voip_token?.substring(0, 30) + '...');
        if (!verifyData?.voip_token) {
          console.error('[PushToken] WARNING: voip_token is still null after save!');
        }
      }
    } catch (err) {
      console.error('[PushToken] saveVoIPToken error:', err);
      console.error('[PushToken] Error stack:', err.stack);
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
   * IMPORTANT: Completely delete the token to prevent notifications going to wrong device
   * when user logs into a different account on the same device
   */
  async removePushToken() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Completely delete the token instead of just deactivating
      // This ensures when user logs in on another device, the new token is used
      const { error } = await supabase
        .from('user_push_tokens')
        .delete()
        .eq('user_id', user.id);

      if (error) {
        console.error('[PushToken] Remove error:', error);
      } else {
        console.log('[PushToken] Token deleted from database');
      }

      // Also clear from profiles table
      await supabase
        .from('profiles')
        .update({ expo_push_token: null })
        .eq('id', user.id);

      console.log('[PushToken] Cleared expo_push_token from profile');
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
