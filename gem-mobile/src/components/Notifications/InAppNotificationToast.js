/**
 * InAppNotificationToast Component
 * Shows in-app notifications for messages and calls
 *
 * Features:
 * - Slide-down animation from top
 * - Auto-dismiss after 4 seconds
 * - Tap to navigate to conversation/call
 * - Swipe up to dismiss
 * - Avatar display
 * - Vietnamese localization
 */

import React, { memo, useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  PanResponder,
  Image,
  StyleSheet,
  Dimensions,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';

// Utils
import { COLORS, SPACING, TYPOGRAPHY } from '../../utils/tokens';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const TOAST_HEIGHT = 80;
const AUTO_DISMISS_DELAY = 4000;

/**
 * Notification Types
 */
export const NOTIFICATION_TYPES = {
  MESSAGE: 'message',
  INCOMING_CALL: 'incoming_call',
  MISSED_CALL: 'missed_call',
  CALL_ENDED: 'call_ended',
};

/**
 * InAppNotificationToast
 * @param {Object} notification - Notification object
 * @param {string} notification.type - NOTIFICATION_TYPES
 * @param {string} notification.title - Title text
 * @param {string} notification.body - Body text
 * @param {string} notification.avatar - Avatar URL
 * @param {Object} notification.data - Additional data
 * @param {Function} onPress - Called when notification is tapped
 * @param {Function} onDismiss - Called when notification is dismissed
 */
const InAppNotificationToast = memo(({
  notification,
  onPress,
  onDismiss,
}) => {
  const insets = useSafeAreaInsets();
  const translateY = useRef(new Animated.Value(-TOAST_HEIGHT - insets.top - 20)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const dismissTimeoutRef = useRef(null);

  // Pan responder for swipe to dismiss
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return gestureState.dy < -10; // Only respond to upward swipes
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy < 0) {
          translateY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy < -30 || gestureState.vy < -0.5) {
          // Swipe up - dismiss
          handleDismiss();
        } else {
          // Spring back
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
            friction: 8,
          }).start();
        }
      },
    })
  ).current;

  // Show animation
  useEffect(() => {
    if (notification) {
      // Slide down
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          friction: 8,
          tension: 40,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto dismiss (except for incoming calls)
      if (notification.type !== NOTIFICATION_TYPES.INCOMING_CALL) {
        dismissTimeoutRef.current = setTimeout(() => {
          handleDismiss();
        }, AUTO_DISMISS_DELAY);
      }
    }

    return () => {
      if (dismissTimeoutRef.current) {
        clearTimeout(dismissTimeoutRef.current);
      }
    };
  }, [notification]);

  // Handle dismiss
  const handleDismiss = useCallback(() => {
    if (dismissTimeoutRef.current) {
      clearTimeout(dismissTimeoutRef.current);
    }

    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -TOAST_HEIGHT - insets.top - 20,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onDismiss?.();
    });
  }, [insets.top, onDismiss]);

  // Handle press
  const handlePress = useCallback(() => {
    handleDismiss();
    onPress?.(notification);
  }, [notification, onPress, handleDismiss]);

  if (!notification) return null;

  // Get icon based on type
  const getIcon = () => {
    switch (notification.type) {
      case NOTIFICATION_TYPES.INCOMING_CALL:
        return notification.data?.callType === 'video' ? 'videocam' : 'call';
      case NOTIFICATION_TYPES.MISSED_CALL:
        return 'call-outline';
      case NOTIFICATION_TYPES.MESSAGE:
      default:
        return 'chatbubble';
    }
  };

  // Get accent color based on type
  const getAccentColor = () => {
    switch (notification.type) {
      case NOTIFICATION_TYPES.INCOMING_CALL:
        return COLORS.success;
      case NOTIFICATION_TYPES.MISSED_CALL:
        return COLORS.error;
      case NOTIFICATION_TYPES.MESSAGE:
      default:
        return COLORS.purple;
    }
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          paddingTop: insets.top + SPACING.xs,
          transform: [{ translateY }],
          opacity,
        },
      ]}
      {...panResponder.panHandlers}
    >
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={handlePress}
        style={styles.touchable}
      >
        <BlurView intensity={80} tint="dark" style={styles.blurContainer}>
          {/* Accent bar */}
          <View style={[styles.accentBar, { backgroundColor: getAccentColor() }]} />

          {/* Content */}
          <View style={styles.content}>
            {/* Avatar / Icon */}
            <View style={styles.avatarContainer}>
              {notification.avatar ? (
                <Image
                  source={{ uri: notification.avatar }}
                  style={styles.avatar}
                />
              ) : (
                <View style={[styles.iconContainer, { backgroundColor: getAccentColor() + '30' }]}>
                  <Ionicons
                    name={getIcon()}
                    size={20}
                    color={getAccentColor()}
                  />
                </View>
              )}
            </View>

            {/* Text content */}
            <View style={styles.textContainer}>
              <Text style={styles.title} numberOfLines={1}>
                {notification.title}
              </Text>
              <Text style={styles.body} numberOfLines={2}>
                {notification.body}
              </Text>
            </View>

            {/* Time / Action */}
            <View style={styles.actionContainer}>
              {notification.type === NOTIFICATION_TYPES.INCOMING_CALL ? (
                <View style={styles.callActions}>
                  <TouchableOpacity
                    style={[styles.callButton, styles.declineButton]}
                    onPress={async () => {
                      console.log('[InAppNotificationToast] Decline pressed');
                      handleDismiss();
                      try {
                        await notification.onDecline?.();
                      } catch (e) {
                        console.error('[InAppNotificationToast] Decline error:', e);
                      }
                    }}
                  >
                    <Ionicons name="close" size={16} color={COLORS.textPrimary} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.callButton, styles.acceptButton]}
                    onPress={async () => {
                      console.log('[InAppNotificationToast] Accept pressed');
                      handleDismiss();
                      try {
                        await notification.onAccept?.();
                      } catch (e) {
                        console.error('[InAppNotificationToast] Accept error:', e);
                      }
                    }}
                  >
                    <Ionicons name="call" size={16} color={COLORS.textPrimary} />
                  </TouchableOpacity>
                </View>
              ) : (
                <Text style={styles.timeText}>Bây giờ</Text>
              )}
            </View>
          </View>
        </BlurView>
      </TouchableOpacity>
    </Animated.View>
  );
});

InAppNotificationToast.displayName = 'InAppNotificationToast';

export default InAppNotificationToast;

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    paddingHorizontal: SPACING.md,
  },
  touchable: {
    borderRadius: 16,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  blurContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  accentBar: {
    width: 4,
    alignSelf: 'stretch',
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.sm,
    paddingLeft: SPACING.md,
  },
  avatarContainer: {
    marginRight: SPACING.sm,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(106, 91, 255, 0.2)',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  body: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  actionContainer: {
    alignItems: 'flex-end',
  },
  timeText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
  },
  callActions: {
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  callButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  declineButton: {
    backgroundColor: COLORS.error,
  },
  acceptButton: {
    backgroundColor: COLORS.success,
  },
});
