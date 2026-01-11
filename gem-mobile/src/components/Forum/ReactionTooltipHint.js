/**
 * ReactionTooltipHint Component
 * Small inline tooltip "Giữ để chọn cảm xúc"
 *
 * Features:
 * - Shows after user has liked 3+ posts without using picker
 * - Positioned above the reaction button
 * - Tap to dismiss
 * - Saves dismissal to AsyncStorage
 * - Auto-hide after 5 seconds
 */

import React, { useState, useEffect, useCallback, memo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Pressable,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
  FadeIn,
  FadeOut,
  runOnJS,
} from 'react-native-reanimated';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Hand, X } from 'lucide-react-native';
import { COLORS, SPACING } from '../../utils/tokens';

const STORAGE_KEY = '@gem:reaction_hint_dismissed';
const LIKES_COUNT_KEY = '@gem:reaction_likes_count';
const HINT_THRESHOLD = 3; // Show after 3 likes without using picker
const AUTO_HIDE_DELAY = 5000; // 5 seconds

/**
 * ReactionTooltipHint - Inline hint tooltip
 *
 * @param {Object} props
 * @param {boolean} props.visible - Control visibility
 * @param {Function} props.onDismiss - Callback when dismissed
 * @param {string} props.position - Position: 'top' | 'bottom'
 */
const ReactionTooltipHint = ({
  visible = false,
  onDismiss,
  position = 'top',
}) => {
  // State
  const [show, setShow] = useState(false);

  // Animation values
  const translateY = useSharedValue(position === 'top' ? 10 : -10);
  const opacity = useSharedValue(0);

  /**
   * Check if hint has been dismissed before
   */
  useEffect(() => {
    const checkDismissed = async () => {
      try {
        const dismissed = await AsyncStorage.getItem(STORAGE_KEY);
        if (dismissed === 'true') {
          setShow(false);
          return;
        }

        // Check like count threshold
        const likesCount = await AsyncStorage.getItem(LIKES_COUNT_KEY);
        const count = parseInt(likesCount || '0', 10);

        if (count >= HINT_THRESHOLD && visible) {
          setShow(true);
        } else {
          setShow(false);
        }
      } catch (err) {
        console.error('[ReactionTooltipHint] Check storage error:', err);
      }
    };

    checkDismissed();
  }, [visible]);

  /**
   * Handle visibility animation
   */
  useEffect(() => {
    if (show) {
      opacity.value = withDelay(300, withTiming(1, { duration: 200 }));
      translateY.value = withDelay(
        300,
        withSpring(0, { damping: 15, stiffness: 150 })
      );

      // Auto-hide after delay
      const timer = setTimeout(() => {
        handleDismiss();
      }, AUTO_HIDE_DELAY);

      return () => clearTimeout(timer);
    } else {
      opacity.value = withTiming(0, { duration: 150 });
      translateY.value = withTiming(position === 'top' ? 10 : -10, {
        duration: 150,
      });
    }
  }, [show, opacity, translateY, position]);

  /**
   * Dismiss hint permanently
   */
  const handleDismiss = useCallback(async () => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, 'true');
      setShow(false);
      onDismiss?.();
    } catch (err) {
      console.error('[ReactionTooltipHint] Dismiss error:', err);
    }
  }, [onDismiss]);

  /**
   * Animated styles
   */
  const containerStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  if (!show) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        position === 'top' ? styles.positionTop : styles.positionBottom,
        containerStyle,
      ]}
    >
      <Pressable onPress={handleDismiss} style={styles.tooltip}>
        {/* Arrow */}
        <View
          style={[
            styles.arrow,
            position === 'top' ? styles.arrowBottom : styles.arrowTop,
          ]}
        />

        {/* Content */}
        <View style={styles.content}>
          <Hand size={16} color={COLORS.gold} />
          <Text style={styles.text}>Giữ để chọn cảm xúc</Text>
          <Pressable onPress={handleDismiss} style={styles.closeButton}>
            <X size={14} color={COLORS.textMuted} />
          </Pressable>
        </View>
      </Pressable>
    </Animated.View>
  );
};

/**
 * Utility function to increment like count for hint threshold
 * Call this when user likes a post without using the picker
 */
export const incrementLikesForHint = async () => {
  try {
    const dismissed = await AsyncStorage.getItem(STORAGE_KEY);
    if (dismissed === 'true') return;

    const current = await AsyncStorage.getItem(LIKES_COUNT_KEY);
    const count = parseInt(current || '0', 10);
    await AsyncStorage.setItem(LIKES_COUNT_KEY, String(count + 1));

    console.log('[ReactionTooltipHint] Likes count:', count + 1);
  } catch (err) {
    console.error('[ReactionTooltipHint] Increment error:', err);
  }
};

/**
 * Utility function to reset like count (call when user uses picker)
 */
export const resetLikesForHint = async () => {
  try {
    await AsyncStorage.setItem(LIKES_COUNT_KEY, '0');
  } catch (err) {
    console.error('[ReactionTooltipHint] Reset error:', err);
  }
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    alignSelf: 'center',
    zIndex: 100,
  },
  positionTop: {
    bottom: '100%',
    marginBottom: 8,
  },
  positionBottom: {
    top: '100%',
    marginTop: 8,
  },
  tooltip: {
    backgroundColor: 'rgba(15, 16, 48, 0.95)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 189, 89, 0.3)',
    // Shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  arrow: {
    position: 'absolute',
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    alignSelf: 'center',
  },
  arrowBottom: {
    bottom: -8,
    borderTopWidth: 8,
    borderTopColor: 'rgba(15, 16, 48, 0.95)',
  },
  arrowTop: {
    top: -8,
    borderBottomWidth: 8,
    borderBottomColor: 'rgba(15, 16, 48, 0.95)',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    gap: SPACING.xs,
  },
  text: {
    fontSize: 13,
    color: COLORS.textPrimary,
    fontWeight: '500',
  },
  closeButton: {
    padding: 2,
    marginLeft: SPACING.xs,
  },
});

export default memo(ReactionTooltipHint);
