/**
 * ForumReactionButton Component
 * Main reaction button for forum posts (replaces like button)
 *
 * Features:
 * - Tap to toggle like
 * - Long-press to show reaction picker
 * - Shows current reaction icon or default thumbs-up
 * - Animated selection effect
 * - Big heart animation for love reaction
 * - Count display
 */

import React, { useState, useCallback, useRef, memo } from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { ThumbsUp, Heart } from 'lucide-react-native';
import ForumReactionPicker from './ForumReactionPicker';
import ReactionIcon from './ReactionIcon';
import useLongPress from '../../hooks/useLongPress';
import {
  REACTION_CONFIG,
  REACTION_ANIMATIONS,
} from '../../constants/reactions';
import { COLORS, SPACING } from '../../utils/tokens';
import reactionService from '../../services/reactionService';

/**
 * ForumReactionButton - Main reaction button for posts
 *
 * @param {Object} props
 * @param {string|null} props.userReaction - User's current reaction type
 * @param {number} props.totalCount - Total reaction count
 * @param {Function} props.onReactionSelect - Callback when reaction is selected (type) => void
 * @param {Function} props.onToggle - Callback for tap toggle (type) => void
 * @param {boolean} props.disabled - Disable interactions
 * @param {boolean} props.showCount - Show count next to button (default: true)
 * @param {boolean} props.showLabel - Show label text (default: true)
 * @param {string} props.size - Button size: 'small' | 'medium' | 'large'
 */
const ForumReactionButton = ({
  userReaction = null,
  totalCount = 0,
  onReactionSelect,
  onToggle,
  disabled = false,
  showCount = true,
  showLabel = true,
  size = 'medium',
}) => {
  // State
  const [showPicker, setShowPicker] = useState(false);
  const [pickerPosition, setPickerPosition] = useState({ x: 0, y: 0 });
  const [panPosition, setPanPosition] = useState(null);

  // Refs
  const buttonRef = useRef(null);

  // Animation values
  const scale = useSharedValue(1);
  const heartScale = useSharedValue(0);

  // Get current reaction config
  const currentConfig = userReaction
    ? REACTION_CONFIG[userReaction]
    : null;

  // Size-based dimensions
  const dimensions = {
    small: { icon: 18, font: 12, padding: 6 },
    medium: { icon: 20, font: 14, padding: 8 },
    large: { icon: 24, font: 16, padding: 10 },
  }[size] || { icon: 20, font: 14, padding: 8 };

  /**
   * Open picker with position
   */
  const openPicker = useCallback(() => {
    if (!buttonRef.current) return;

    buttonRef.current.measureInWindow((x, y, width, height) => {
      setPickerPosition({
        x: x + width / 2,
        y: y,
      });
      setShowPicker(true);
    });
  }, []);

  /**
   * Handle tap (toggle like)
   */
  const handleTap = useCallback(() => {
    if (disabled) return;

    // Bounce animation
    scale.value = withSequence(
      withTiming(0.9, { duration: 100 }),
      withSpring(1, { damping: 15 })
    );

    // Call toggle callback
    onToggle?.(userReaction || 'like');
  }, [disabled, userReaction, onToggle, scale]);

  /**
   * Handle long press
   */
  const handleLongPress = useCallback(() => {
    if (disabled) return;
    openPicker();
  }, [disabled, openPicker]);

  /**
   * Handle reaction selection from picker
   */
  const handleSelect = useCallback(
    (type) => {
      // Selection animation
      scale.value = withSequence(
        withTiming(0.8, { duration: 100 }),
        withSpring(1.2, { damping: 10 }),
        withSpring(1, { damping: 15 })
      );

      // Big heart animation for "love" reaction
      if (type === 'love') {
        heartScale.value = withSequence(
          withTiming(1.5, { duration: 200 }),
          withTiming(0, { duration: 400 })
        );
      }

      // Call parent callback
      onReactionSelect?.(type);
      setShowPicker(false);
      setPanPosition(null);
    },
    [onReactionSelect, scale, heartScale]
  );

  /**
   * Handle picker close
   */
  const handleClosePicker = useCallback(() => {
    setShowPicker(false);
    setPanPosition(null);
  }, []);

  // Long press hook
  const { handlers } = useLongPress({
    onLongPress: handleLongPress,
    onPress: handleTap,
    threshold: REACTION_ANIMATIONS.LONG_PRESS_THRESHOLD,
    disabled,
  });

  // Animated styles
  const buttonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const bigHeartStyle = useAnimatedStyle(() => ({
    opacity: heartScale.value > 0.5 ? 1 : 0,
    transform: [{ scale: heartScale.value }],
  }));

  // Format count
  const formattedCount = reactionService.formatCount(totalCount);

  return (
    <>
      <Animated.View
        ref={buttonRef}
        style={[styles.container, buttonStyle]}
      >
        <Pressable
          {...handlers}
          style={[
            styles.button,
            // Only add padding if showing label or count
            (showLabel || showCount) && { paddingVertical: dimensions.padding, paddingHorizontal: dimensions.padding + 4 },
            disabled && styles.buttonDisabled,
          ]}
          disabled={disabled}
        >
          {/* Reaction Icon or Default ThumbsUp - Facebook-like small size */}
          <View style={styles.iconContainer}>
            {userReaction ? (
              <ReactionIcon
                type={userReaction}
                size={dimensions.icon}
              />
            ) : (
              <ThumbsUp
                size={dimensions.icon}
                color={COLORS.textMuted}
                strokeWidth={2}
              />
            )}
          </View>

          {/* Label */}
          {showLabel && (
            <Text
              style={[
                styles.label,
                { fontSize: dimensions.font },
                userReaction && { color: currentConfig?.color || COLORS.textPrimary },
              ]}
            >
              {userReaction ? currentConfig?.label || 'Thích' : 'Thích'}
            </Text>
          )}

          {/* Count */}
          {showCount && totalCount > 0 && (
            <Text style={[styles.count, { fontSize: dimensions.font }]}>
              {formattedCount}
            </Text>
          )}
        </Pressable>

        {/* Big Heart Animation (for love reaction) */}
        <Animated.View style={[styles.bigHeart, bigHeartStyle]} pointerEvents="none">
          <Heart
            size={80}
            color={REACTION_CONFIG.love?.color || '#E91E63'}
            fill={REACTION_CONFIG.love?.color || '#E91E63'}
          />
        </Animated.View>
      </Animated.View>

      {/* Reaction Picker */}
      <ForumReactionPicker
        visible={showPicker}
        position={pickerPosition}
        currentReaction={userReaction}
        onSelect={handleSelect}
        onClose={handleClosePicker}
        panPosition={panPosition}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  buttonActive: {
    // No background - keep it clean like Facebook
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  iconContainer: {
    // Fixed size container for emoji - small like other action buttons
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'visible',
  },
  label: {
    fontWeight: '500',
    color: COLORS.textMuted,
  },
  count: {
    color: COLORS.textMuted,
    marginLeft: SPACING.xs,
  },
  bigHeart: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -40,
    marginLeft: -40,
    zIndex: 100,
  },
});

export default memo(ForumReactionButton);
