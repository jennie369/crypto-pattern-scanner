/**
 * InAppNotificationContext
 * Global context for showing in-app notification toasts
 *
 * Usage:
 * const { showNotification } = useInAppNotification();
 * showNotification({
 *   type: 'message',
 *   title: 'Nguyễn Văn A',
 *   body: 'Xin chào!',
 *   avatar: 'https://...',
 *   data: { conversationId: '...' }
 * });
 */

import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import InAppNotificationToast, { NOTIFICATION_TYPES } from '../components/Notifications/InAppNotificationToast';
import { notificationService } from '../services/notificationService';
import { useAuth } from './AuthContext';
import { supabase } from '../services/supabase';
import { navigationRef } from '../navigation/navigationRef';
import { callService } from '../services/callService';
import { triggerIncomingCallFromPush } from './CallContext';

// CRITICAL: Configure notification handler for foreground notifications
// This handler is ONLY called when the app is in the FOREGROUND.
// For background notifications, the system handles display based on push payload.
Notifications.setNotificationHandler({
  handleNotification: async (notification) => {
    const data = notification.request.content.data;
    const notificationType = data?.type || data?.notification_type;

    console.log('[NotificationHandler] ========================================');
    console.log('[NotificationHandler] Notification received in FOREGROUND');
    console.log('[NotificationHandler] Type:', notificationType);
    console.log('[NotificationHandler] Platform:', Platform.OS);
    console.log('[NotificationHandler] Data:', JSON.stringify(data, null, 2));
    console.log('[NotificationHandler] ========================================');

    // For incoming calls in foreground:
    // - iOS: Suppress system banner (we show CallKit or our custom fullscreen UI)
    // - Android: Suppress system banner (we show our custom fullscreen UI)
    // The actual fullscreen UI is triggered by addNotificationReceivedListener below
    if (notificationType === 'incoming_call') {
      console.log('[NotificationHandler] Incoming call - suppressing system banner');
      console.log('[NotificationHandler] Our fullscreen UI will be triggered by notificationReceivedListener');
      return {
        shouldShowAlert: false, // Don't show system banner - we show fullscreen
        shouldPlaySound: false, // Our CallContext handles ringtone
        shouldSetBadge: false,
      };
    }

    // For other notifications (messages, etc.), show normally
    return {
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    };
  },
});

const InAppNotificationContext = createContext(null);

// Track call IDs that have been processed to prevent duplicate handling
const processedCallIdsRef = { current: new Set() };

export const useInAppNotification = () => {
  const context = useContext(InAppNotificationContext);
  if (!context) {
    throw new Error('useInAppNotification must be used within InAppNotificationProvider');
  }
  return context;
};

export const InAppNotificationProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [notification, setNotification] = useState(null);
  const queueRef = useRef([]);
  const isShowingRef = useRef(false);
  const currentConversationRef = useRef(null);
  const messageChannelRef = useRef(null);

  // Track current conversation to avoid showing notifications for it
  const setCurrentConversation = useCallback((conversationId) => {
    currentConversationRef.current = conversationId;
  }, []);

  // Process notification queue
  const processQueue = useCallback(() => {
    if (queueRef.current.length > 0 && !isShowingRef.current) {
      const nextNotification = queueRef.current.shift();
      isShowingRef.current = true;
      setNotification(nextNotification);
    }
  }, []);

  // Show notification
  const showNotification = useCallback((notif) => {
    // Don't show message notifications if user is in that conversation
    if (
      notif.type === NOTIFICATION_TYPES.MESSAGE &&
      notif.data?.conversationId === currentConversationRef.current
    ) {
      console.log('[InAppNotification] Skipping - user is in this conversation');
      return;
    }

    // Add to queue
    queueRef.current.push(notif);
    processQueue();
  }, [processQueue]);

  // Show message notification
  const showMessageNotification = useCallback((sender, message, conversation) => {
    const senderName = sender?.display_name || sender?.full_name || 'Ai đó';

    // Build body based on message type
    const messageTypeLabels = {
      text: message.content || 'Tin nhắn mới',
      image: '📷 Đã gửi một hình ảnh',
      video: '🎥 Đã gửi một video',
      audio: '🎵 Đã gửi tin nhắn thoại',
      file: `📎 Đã gửi tệp tin`,
      sticker: '🎨 Đã gửi một sticker',
      gif: '🎬 Đã gửi một GIF',
    };

    let body = messageTypeLabels[message.message_type] || message.content || 'Tin nhắn mới';
    if (body.length > 100) {
      body = body.substring(0, 97) + '...';
    }

    showNotification({
      type: NOTIFICATION_TYPES.MESSAGE,
      title: conversation?.is_group ? (conversation.name || 'Nhóm chat') : senderName,
      body: conversation?.is_group ? `${senderName}: ${body}` : body,
      avatar: sender?.avatar_url,
      data: {
        conversationId: conversation?.id,
        messageId: message?.id,
        senderId: sender?.id,
        isGroup: conversation?.is_group,
      },
    });
  }, [showNotification]);

  // Show incoming call notification
  const showIncomingCallNotification = useCallback((caller, call, onAccept, onDecline) => {
    const callerName = caller?.display_name || caller?.full_name || 'Ai đó';
    const callType = call?.call_type === 'video' ? 'video' : 'thoại';

    showNotification({
      type: NOTIFICATION_TYPES.INCOMING_CALL,
      title: `Cuộc gọi ${callType} đến`,
      body: `${callerName} đang gọi cho bạn`,
      avatar: caller?.avatar_url,
      data: {
        callId: call?.id,
        callerId: caller?.id,
        callType: call?.call_type,
      },
      onAccept,
      onDecline,
    });
  }, [showNotification]);

  // Show missed call notification
  const showMissedCallNotification = useCallback((caller, call) => {
    const callerName = caller?.display_name || caller?.full_name || 'Ai đó';
    const callType = call?.call_type === 'video' ? 'video' : 'thoại';

    showNotification({
      type: NOTIFICATION_TYPES.MISSED_CALL,
      title: 'Cuộc gọi nhỡ',
      body: `${callerName} đã gọi ${callType} cho bạn`,
      avatar: caller?.avatar_url,
      data: {
        callId: call?.id,
        callerId: caller?.id,
        callType: call?.call_type,
      },
    });
  }, [showNotification]);

  // Dismiss current notification
  const dismissNotification = useCallback(() => {
    setNotification(null);
    isShowingRef.current = false;
    // Process next in queue
    setTimeout(processQueue, 100);
  }, [processQueue]);

  // Handle notification press
  const handleNotificationPress = useCallback((notif) => {
    console.log('[InAppNotification] Toast pressed:', notif?.type, notif?.data);

    if (!notif) {
      console.warn('[InAppNotification] No notification data');
      return;
    }

    // Check if navigation ref exists and is ready
    const navReady = navigationRef.current &&
      (typeof navigationRef.current.isReady === 'function'
        ? navigationRef.current.isReady()
        : true);

    if (!navReady) {
      console.warn('[InAppNotification] Navigation not ready');
      return;
    }

    try {
      switch (notif.type) {
        case NOTIFICATION_TYPES.MESSAGE:
          const conversationId = notif.data?.conversationId;
          console.log('[InAppNotification] Navigating to conversation:', conversationId);

          if (conversationId) {
            // Use reset to ensure clean navigation to Chat screen
            navigationRef.current.navigate('Messages', {
              screen: 'Chat',
              params: {
                conversationId: conversationId,
                // Include any available data for better UX
                fromNotification: true,
              },
            });
            console.log('[InAppNotification] Navigation dispatched successfully');
          } else {
            // Fallback: navigate to conversations list
            console.warn('[InAppNotification] No conversationId, navigating to list');
            navigationRef.current.navigate('Messages', {
              screen: 'ConversationsList',
            });
          }
          break;

        case NOTIFICATION_TYPES.MISSED_CALL:
          // Navigate to call history or conversation
          if (notif.data?.callerId) {
            navigationRef.current.navigate('Messages', {
              screen: 'ConversationsList',
            });
          }
          break;

        case NOTIFICATION_TYPES.INCOMING_CALL:
          // Handled by onAccept/onDecline callbacks
          break;

        default:
          console.warn('[InAppNotification] Unknown notification type:', notif.type);
      }
    } catch (error) {
      console.error('[InAppNotification] Navigation error:', error);
    }
  }, []);

  // Listen for system notifications when app is in foreground
  // IMPORTANT: This only fires when app is actively in the foreground
  // For background, users tap the notification which triggers addNotificationResponseReceivedListener
  useEffect(() => {
    console.log('[InAppNotification] Setting up foreground notification listener');

    const subscription = Notifications.addNotificationReceivedListener((notification) => {
      const data = notification.request.content.data;
      const notificationType = data?.type || data?.notification_type;

      console.log('[InAppNotification] ========================================');
      console.log('[InAppNotification] FOREGROUND NOTIFICATION RECEIVED');
      console.log('[InAppNotification] Platform:', Platform.OS);
      console.log('[InAppNotification] Type:', notificationType);
      console.log('[InAppNotification] Title:', notification.request.content.title);
      console.log('[InAppNotification] Body:', notification.request.content.body);
      console.log('[InAppNotification] Data keys:', Object.keys(data || {}));
      console.log('[InAppNotification] ========================================');

      // Handle message notifications
      if (notificationType === 'new_message') {
        console.log('[InAppNotification] Processing new_message notification');
        // Don't show in-app if in the same conversation
        if (data.conversationId !== currentConversationRef.current) {
          showNotification({
            type: NOTIFICATION_TYPES.MESSAGE,
            title: notification.request.content.title,
            body: notification.request.content.body,
            avatar: data.senderAvatar,
            data,
          });
        } else {
          console.log('[InAppNotification] Skipping message - user is in conversation');
        }
      }

      // Handle incoming call notifications
      // This triggers our fullscreen incoming call UI
      if (notificationType === 'incoming_call') {
        const callId = data.callId || data.call_id; // Support both formats
        console.log('[InAppNotification] ========================================');
        console.log('[InAppNotification] INCOMING CALL PUSH RECEIVED');
        console.log('[InAppNotification] Current user (receiver):', user?.id);
        console.log('[InAppNotification] callId:', callId);
        console.log('[InAppNotification] callerId (người gọi):', data.callerId);
        console.log('[InAppNotification] callerName:', data.callerName);
        console.log('[InAppNotification] ========================================');

        if (!callId) {
          console.error('[InAppNotification] No callId in push data:', data);
          return;
        }

        // GUARD: Check if this call ID has already been processed
        if (processedCallIdsRef.current.has(callId)) {
          console.log('[InAppNotification] Call', callId, 'already processed - SKIPPING');
          return;
        }

        // CRITICAL: Don't show incoming call UI if current user is the CALLER
        // This prevents the caller from seeing their own call notification
        if (data.callerId === user?.id) {
          console.log('[InAppNotification] Ignoring - current user is the caller');
          return;
        }

        // Mark as processed BEFORE triggering to prevent duplicates
        processedCallIdsRef.current.add(callId);
        console.log('[InAppNotification] Marked call', callId, 'as processed');

        // Clear processed ID after 30 seconds to allow receiving new calls
        // (reduced from 60s - call should be handled within 30 seconds)
        setTimeout(() => {
          processedCallIdsRef.current.delete(callId);
          console.log('[InAppNotification] Cleared processed call', callId);
        }, 30000);

        // IMPORTANT: Trigger the full-screen overlay via CallContext
        // This ensures the proper incoming call UI shows even if realtime subscription fails
        // CallContext has its own guards against duplicate navigation
        console.log('[InAppNotification] Triggering full-screen overlay via CallContext');
        triggerIncomingCallFromPush(callId).catch(err => {
          console.error('[InAppNotification] Failed to trigger full-screen overlay:', err);
        });

        // DON'T show toast notification for incoming calls - we already have full screen UI
        // This prevents duplicate UI (both toast and full screen showing at the same time)
        console.log('[InAppNotification] Skipping toast for incoming call - full screen UI will show');
      }
    });

    return () => subscription.remove();
  }, [showNotification, user?.id]);

  // Listen for notification responses (user tapping on notification)
  // This is CRITICAL for handling incoming calls when app was in background/killed
  useEffect(() => {
    const responseSubscription = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data;
      const notificationType = data?.type || data?.notification_type;

      console.log('[InAppNotification] ========================================');
      console.log('[InAppNotification] USER TAPPED ON NOTIFICATION');
      console.log('[InAppNotification] Type:', notificationType);
      console.log('[InAppNotification] Data:', JSON.stringify(data, null, 2));
      console.log('[InAppNotification] ========================================');

      // Handle incoming call notification tap
      // This is important for when user taps notification from background/lock screen
      if (notificationType === 'incoming_call') {
        const callId = data.callId || data.call_id;
        console.log('[InAppNotification] User tapped incoming call notification, callId:', callId);

        if (callId) {
          // Don't check for duplicates here - user explicitly tapped the notification
          // They expect to see the incoming call screen
          console.log('[InAppNotification] Triggering full-screen overlay from notification tap');
          triggerIncomingCallFromPush(callId).catch(err => {
            console.error('[InAppNotification] Failed to trigger full-screen overlay from tap:', err);
          });
        }
        return;
      }

      // Handle missed call notification tap
      if (notificationType === 'missed_call') {
        console.log('[InAppNotification] User tapped missed call notification');
        // Navigate to conversations list
        const navReady = navigationRef.current &&
          (typeof navigationRef.current.isReady === 'function'
            ? navigationRef.current.isReady()
            : true);
        if (navReady) {
          navigationRef.current.navigate('Messages', {
            screen: 'ConversationsList',
          });
        }
        return;
      }

      // Handle message notification tap
      if (notificationType === 'new_message' && data.conversationId) {
        console.log('[InAppNotification] User tapped message notification, conversationId:', data.conversationId);
        const navReady = navigationRef.current &&
          (typeof navigationRef.current.isReady === 'function'
            ? navigationRef.current.isReady()
            : true);
        if (navReady) {
          navigationRef.current.navigate('Messages', {
            screen: 'Chat',
            params: {
              conversationId: data.conversationId,
              fromNotification: true,
            },
          });
        }
        return;
      }
    });

    return () => responseSubscription.remove();
  }, []);

  // Subscribe to real-time messages for global in-app notifications
  // This provides notifications even without backend push notification infrastructure
  useEffect(() => {
    if (!isAuthenticated || !user?.id) {
      // Clean up channel if user logs out
      if (messageChannelRef.current) {
        supabase.removeChannel(messageChannelRef.current);
        messageChannelRef.current = null;
      }
      return;
    }

    console.log('[InAppNotification] Setting up global message subscription for user:', user.id);

    const channel = supabase
      .channel('global_message_notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        async (payload) => {
          try {
            const message = payload.new;

            // Skip messages from current user
            if (message.sender_id === user.id) return;

            // Skip messages in current conversation (ChatScreen already showing)
            if (message.conversation_id === currentConversationRef.current) return;

            // Skip system messages
            if (message.message_type === 'system') return;

            // Check if user is a participant in this conversation
            const { data: participant, error: participantError } = await supabase
              .from('conversation_participants')
              .select('id')
              .eq('conversation_id', message.conversation_id)
              .eq('user_id', user.id)
              .single();

            if (participantError || !participant) {
              // User is not in this conversation, skip
              return;
            }

            // Fetch sender profile
            const { data: sender } = await supabase
              .from('profiles')
              .select('id, display_name, full_name, username, avatar_url')
              .eq('id', message.sender_id)
              .single();

            // Fetch conversation info
            const { data: conversation } = await supabase
              .from('conversations')
              .select('id, name, is_group')
              .eq('id', message.conversation_id)
              .single();

            // Build sender display name
            const senderProfile = sender || {};
            senderProfile.display_name = senderProfile.full_name || senderProfile.display_name || senderProfile.username || 'Ai đó';

            console.log('[InAppNotification] Showing notification for message from:', senderProfile.display_name);

            // Show in-app notification
            showMessageNotification(senderProfile, message, conversation);
          } catch (error) {
            console.error('[InAppNotification] Error processing message notification:', error);
          }
        }
      )
      .subscribe((status) => {
        console.log('[InAppNotification] Global message subscription status:', status);
      });

    messageChannelRef.current = channel;

    return () => {
      console.log('[InAppNotification] Cleaning up global message subscription');
      if (messageChannelRef.current) {
        supabase.removeChannel(messageChannelRef.current);
        messageChannelRef.current = null;
      }
    };
  }, [isAuthenticated, user?.id, showMessageNotification]);

  const value = {
    showNotification,
    showMessageNotification,
    showIncomingCallNotification,
    showMissedCallNotification,
    dismissNotification,
    setCurrentConversation,
  };

  return (
    <InAppNotificationContext.Provider value={value}>
      {children}
      <InAppNotificationToast
        notification={notification}
        onPress={handleNotificationPress}
        onDismiss={dismissNotification}
      />
    </InAppNotificationContext.Provider>
  );
};

export default InAppNotificationContext;
