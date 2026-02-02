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

import InAppNotificationToast, { NOTIFICATION_TYPES } from '../components/Notifications/InAppNotificationToast';
import { notificationService } from '../services/notificationService';
import { useAuth } from './AuthContext';
import { supabase } from '../services/supabase';
import { navigationRef } from '../navigation/navigationRef';
import { callService } from '../services/callService';
import { triggerIncomingCallFromPush } from './CallContext';

const InAppNotificationContext = createContext(null);

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
    if (!notif) return;

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
          if (notif.data?.conversationId) {
            navigationRef.current.navigate('Messages', {
              screen: 'Chat',
              params: { conversationId: notif.data.conversationId },
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
      }
    } catch (error) {
      console.warn('[InAppNotification] Navigation error:', error.message);
    }
  }, []);

  // Listen for system notifications when app is in foreground
  useEffect(() => {
    const subscription = Notifications.addNotificationReceivedListener((notification) => {
      const data = notification.request.content.data;

      // Handle message notifications
      if (data?.type === 'new_message') {
        // Don't show in-app if in the same conversation
        if (data.conversationId !== currentConversationRef.current) {
          showNotification({
            type: NOTIFICATION_TYPES.MESSAGE,
            title: notification.request.content.title,
            body: notification.request.content.body,
            avatar: data.senderAvatar,
            data,
          });
        }
      }

      // Handle call notifications
      // Show toast with working accept/decline handlers as FALLBACK
      // (in case realtime subscription doesn't detect the call)
      if (data?.type === 'incoming_call') {
        const callId = data.callId || data.call_id; // Support both formats
        console.log('[InAppNotification] ========================================');
        console.log('[InAppNotification] INCOMING CALL PUSH RECEIVED');
        console.log('[InAppNotification] Current user (receiver):', user?.id);
        console.log('[InAppNotification] callId:', callId);
        console.log('[InAppNotification] callerId (người gọi):', data.callerId);
        console.log('[InAppNotification] callerName:', data.callerName);
        console.log('[InAppNotification] Full data:', JSON.stringify(data));
        console.log('[InAppNotification] ========================================');

        if (!callId) {
          console.error('[InAppNotification] No callId in push data:', data);
          return;
        }

        // CRITICAL: Don't show incoming call UI if current user is the CALLER
        // This prevents the caller from seeing their own call notification
        if (data.callerId === user?.id) {
          console.log('[InAppNotification] Ignoring - current user is the caller');
          return;
        }

        // IMPORTANT: Trigger the full-screen overlay via CallContext
        // This ensures the proper incoming call UI shows even if realtime subscription fails
        console.log('[InAppNotification] Triggering full-screen overlay via CallContext');
        triggerIncomingCallFromPush(callId).catch(err => {
          console.error('[InAppNotification] Failed to trigger full-screen overlay:', err);
        });

        // Create handlers that actually work
        const handleAcceptFromToast = async () => {
          console.log('[InAppNotification] Accept from toast, callId:', callId);
          try {
            // Fetch call info
            const result = await callService.getCall(callId);
            console.log('[InAppNotification] getCall result:', result.success, result.call?.id);

            if (!result.success || !result.call) {
              console.error('[InAppNotification] Failed to get call:', result.error);
              return;
            }

            const call = result.call;

            // Navigate to incoming call screen
            const navReady = navigationRef.current &&
              (typeof navigationRef.current.isReady === 'function'
                ? navigationRef.current.isReady()
                : true);

            console.log('[InAppNotification] Navigation ready:', navReady);

            if (navReady) {
              console.log('[InAppNotification] Navigating to IncomingCall screen...');
              navigationRef.current.navigate('Call', {
                screen: 'IncomingCall',
                params: {
                  call,
                  caller: call.caller || {
                    id: data.callerId,
                    display_name: data.callerName || 'Người gọi',
                    avatar_url: data.callerAvatar
                  },
                },
              });
              console.log('[InAppNotification] Navigation triggered');
            } else {
              console.error('[InAppNotification] Navigation not ready');
            }
          } catch (error) {
            console.error('[InAppNotification] Error accepting call from toast:', error);
          }
        };

        const handleDeclineFromToast = async () => {
          console.log('[InAppNotification] Decline from toast, callId:', callId);
          try {
            await callService.declineCall(callId);
            console.log('[InAppNotification] Call declined successfully');
          } catch (error) {
            console.error('[InAppNotification] Error declining call from toast:', error);
          }
        };

        showNotification({
          type: NOTIFICATION_TYPES.INCOMING_CALL,
          title: notification.request.content.title || 'Cuộc gọi đến',
          body: notification.request.content.body || `${data.callerName || 'Ai đó'} đang gọi cho bạn`,
          avatar: data.callerAvatar,
          data,
          onAccept: handleAcceptFromToast,
          onDecline: handleDeclineFromToast,
        });
      }
    });

    return () => subscription.remove();
  }, [showNotification]);

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
