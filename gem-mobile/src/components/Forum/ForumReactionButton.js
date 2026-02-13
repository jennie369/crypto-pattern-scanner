/**
 * ForumReactionButton Component - Facebook-style drag-to-select
 *
 * Features:
 * - Tap to toggle like
 * - Long-press + drag to select reaction (Facebook-style)
 * - Reactions scale up when hovered
 * - Release finger to confirm selection
 * - Haptic feedback
 */

import React, { useState, useCallback, useRef, memo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  PanResponder,
  Dimensions,
  Platform,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { ThumbsUp, Heart } from 'lucide-react-native';
import ReactionIcon from './ReactionIcon';
import { REACTION_CONFIG, REACTION_ORDER } from '../../constants/reactions';
import { COLORS, SPACING } from '../../utils/tokens';
import reactionService from '../../services/reactionService';

// Safe haptics import
let Haptics = null;
try {
  Haptics = require('expo-haptics');
} catch (e) {}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Timing constants
const LONG_PRESS_DELAY = 400; // ms to trigger long press (increased for better tap detection)
const PICKER_WIDTH = 260;
const PICKER_HEIGHT = 48;
const REACTION_SIZE = 36;
const REACTION_SPACING = 4;
const HOVER_SCALE = 1.3;

/**
 * ForumReactionButton - Facebook-style reaction button with drag-to-select
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
  const [hoveredReaction, setHoveredReaction] = useState(null);

  // Refs - use refs for values needed in PanResponder (which captures values at creation time)
  const buttonRef = useRef(null);
  const longPressTimer = useRef(null);
  const isLongPress = useRef(false);
  const isMoved = useRef(false); // Track if finger moved during touch
  const touchStartTime = useRef(0); // Track touch start time for tap detection
  const pickerBounds = useRef({ left: 0, right: 0, top: 0, bottom: 0 });
  const showPickerRef = useRef(false); // Mirror state for PanResponder
  const hoveredReactionRef = useRef(null); // Mirror state for PanResponder

  // CRITICAL: Track userReaction prop in a ref for PanResponder callbacks
  // PanResponder callbacks capture values at creation time (closure issue)
  // This ref always has the current value
  const userReactionRef = useRef(userReaction);
  userReactionRef.current = userReaction; // Update on every render

  // Animation values
  const buttonScale = useSharedValue(1);
  const pickerOpacity = useSharedValue(0);
  const pickerTranslateY = useSharedValue(10);
  const heartScale = useSharedValue(0);

  // Individual reaction scales
  const reactionScales = useRef(
    REACTION_ORDER.reduce((acc, type) => {
      acc[type] = useSharedValue(1);
      return acc;
    }, {})
  ).current;

  // Get current reaction config
  const currentConfig = userReaction ? REACTION_CONFIG[userReaction] : null;

  // Size-based dimensions
  const dimensions = {
    small: { icon: 14, font: 11, padding: 4 },
    medium: { icon: 16, font: 12, padding: 5 },
    large: { icon: 20, font: 14, padding: 6 },
  }[size] || { icon: 16, font: 12, padding: 5 };

  /**
   * Trigger haptic feedback
   */
  const triggerHaptic = useCallback((type = 'medium') => {
    if (Haptics) {
      try {
        if (type === 'light') {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        } else if (type === 'heavy') {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        } else {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }
      } catch (e) {}
    }
  }, []);

  /**
   * Show the reaction picker
   */
  const showReactionPicker = useCallback(() => {
    if (!buttonRef.current) return;

    buttonRef.current.measureInWindow((x, y, width, height) => {
      // Store screen position for hit testing during drag
      // Picker appears centered above the button
      const pickerX = x + width / 2 - PICKER_WIDTH / 2;
      const pickerY = y - PICKER_HEIGHT - 10;

      // Clamp to screen bounds
      const clampedX = Math.max(12, Math.min(pickerX, SCREEN_WIDTH - PICKER_WIDTH - 12));

      // Store bounds for hit testing (using screen coordinates)
      pickerBounds.current = {
        left: clampedX,
        right: clampedX + PICKER_WIDTH,
        top: pickerY,
        bottom: pickerY + PICKER_HEIGHT,
        // Store button screen position for relative positioning
        buttonX: x,
        buttonY: y,
        buttonWidth: width,
      };

      // Calculate relative position (picker relative to button)
      const relativeX = clampedX - x;
      const relativeY = -PICKER_HEIGHT - 10;

      setPickerPosition({ x: relativeX, y: relativeY });
      setShowPicker(true);
      showPickerRef.current = true; // Keep ref in sync

      // Animate picker in
      pickerOpacity.value = withTiming(1, { duration: 150 });
      pickerTranslateY.value = withSpring(0, { damping: 15, stiffness: 300 });
    });
  }, []);

  /**
   * Hide the reaction picker
   */
  const hideReactionPicker = useCallback(() => {
    showPickerRef.current = false; // Update ref immediately
    hoveredReactionRef.current = null;

    pickerOpacity.value = withTiming(0, { duration: 100 });
    pickerTranslateY.value = withTiming(10, { duration: 100 });

    // Reset all reaction scales
    REACTION_ORDER.forEach(type => {
      reactionScales[type].value = withTiming(1, { duration: 100 });
    });

    setTimeout(() => {
      setShowPicker(false);
      setHoveredReaction(null);
    }, 100);
  }, []);

  /**
   * Get reaction type at position
   */
  const getReactionAtPosition = useCallback((pageX, pageY) => {
    const bounds = pickerBounds.current;

    // Check if within picker bounds (with some padding)
    if (
      pageX < bounds.left - 20 ||
      pageX > bounds.right + 20 ||
      pageY < bounds.top - 30 ||
      pageY > bounds.bottom + 30
    ) {
      return null;
    }

    // Calculate which reaction is being hovered
    const relativeX = pageX - bounds.left;
    const paddingX = (PICKER_WIDTH - REACTION_ORDER.length * (REACTION_SIZE + REACTION_SPACING)) / 2;
    const reactionIndex = Math.floor((relativeX - paddingX) / (REACTION_SIZE + REACTION_SPACING));

    if (reactionIndex >= 0 && reactionIndex < REACTION_ORDER.length) {
      return REACTION_ORDER[reactionIndex];
    }

    return null;
  }, []);

  /**
   * Update hovered reaction with animation
   */
  const updateHoveredReaction = useCallback((type) => {
    const prevHovered = hoveredReactionRef.current;

    if (type !== prevHovered) {
      // Scale down previous
      if (prevHovered && reactionScales[prevHovered]) {
        reactionScales[prevHovered].value = withSpring(1, { damping: 15, stiffness: 400 });
      }

      // Scale up new
      if (type && reactionScales[type]) {
        reactionScales[type].value = withSpring(HOVER_SCALE, { damping: 12, stiffness: 300 });
        triggerHaptic('light');
      }

      hoveredReactionRef.current = type; // Update ref
      setHoveredReaction(type);
    }
  }, [triggerHaptic]);

  /**
   * Handle reaction selection
   */
  const handleSelectReaction = useCallback((type) => {
    if (!type) return;

    // Animate button
    buttonScale.value = withTiming(0.9, { duration: 50 }, () => {
      buttonScale.value = withTiming(1, { duration: 100 });
    });

    // Big heart animation for love
    if (type === 'love') {
      heartScale.value = withTiming(1.2, { duration: 200 }, () => {
        heartScale.value = withTiming(0, { duration: 300 });
      });
    }

    triggerHaptic('heavy');
    onReactionSelect?.(type);
    hideReactionPicker();
  }, [onReactionSelect, hideReactionPicker, triggerHaptic]);

  /**
   * PanResponder for handling long press + drag gesture
   * Key: Capture gesture to prevent ScrollView from scrolling
   * Uses refs (not state) because PanResponder callbacks are created once at mount
   */
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !disabled,
      onStartShouldSetPanResponderCapture: () => false,

      onMoveShouldSetPanResponder: (evt, gestureState) => {
        // Capture move when picker is showing
        return showPickerRef.current || isLongPress.current;
      },
      onMoveShouldSetPanResponderCapture: (evt, gestureState) => {
        return showPickerRef.current || isLongPress.current;
      },

      onPanResponderTerminationRequest: () => !showPickerRef.current && !isLongPress.current,

      onPanResponderGrant: (evt) => {
        // Record start time for tap detection
        touchStartTime.current = Date.now();
        isLongPress.current = false;
        isMoved.current = false;
        buttonScale.value = withTiming(0.95, { duration: 50 });

        // Start long press timer
        longPressTimer.current = setTimeout(() => {
          isLongPress.current = true;
          triggerHaptic('medium');
          showReactionPicker();
        }, LONG_PRESS_DELAY);
      },

      onPanResponderMove: (evt, gestureState) => {
        // Mark as moved if significant movement
        if (Math.abs(gestureState.dx) > 10 || Math.abs(gestureState.dy) > 10) {
          isMoved.current = true;
        }

        if (!isLongPress.current) return;

        // Get finger position (screen coordinates)
        const { pageX, pageY } = evt.nativeEvent;

        // Find which reaction is being hovered
        const reaction = getReactionAtPosition(pageX, pageY);
        updateHoveredReaction(reaction);
      },

      onPanResponderRelease: (evt, gestureState) => {
        const touchDuration = Date.now() - touchStartTime.current;

        // Clear long press timer
        if (longPressTimer.current) {
          clearTimeout(longPressTimer.current);
          longPressTimer.current = null;
        }

        buttonScale.value = withTiming(1, { duration: 100 });

        // Case 1: Long press with picker showing
        if (isLongPress.current && showPickerRef.current) {
          const currentHovered = hoveredReactionRef.current;
          if (currentHovered) {
            handleSelectReaction(currentHovered);
          } else {
            hideReactionPicker();
          }
        }
        // Case 2: Quick tap (short duration, no movement)
        else if (touchDuration < LONG_PRESS_DELAY && !isMoved.current) {
          triggerHaptic('light');
          // Use ref to get current value (prop is captured in closure at mount time)
          onToggle?.(userReactionRef.current || 'like');
        }

        isLongPress.current = false;
        isMoved.current = false;
      },

      onPanResponderTerminate: () => {
        if (longPressTimer.current) {
          clearTimeout(longPressTimer.current);
          longPressTimer.current = null;
        }
        buttonScale.value = withTiming(1, { duration: 100 });
        if (showPickerRef.current) {
          hideReactionPicker();
        }
        isLongPress.current = false;
        isMoved.current = false;
      },
    })
  ).current;

  // Animated styles
  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const pickerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: pickerOpacity.value,
    transform: [{ translateY: pickerTranslateY.value }],
  }));

  const bigHeartStyle = useAnimatedStyle(() => ({
    opacity: heartScale.value > 0.5 ? 1 : 0,
    transform: [{ scale: heartScale.value }],
  }));

  // Format count
  const formattedCount = reactionService.formatCount(totalCount);

  return (
    <View style={styles.wrapper}>
      {/* Main Button */}
      <View ref={buttonRef} collapsable={false}>
        <Animated.View
          style={[styles.container, buttonAnimatedStyle]}
          {...panResponder.panHandlers}
        >
          <View
            style={[
              styles.button,
              (showLabel || showCount) && {
                paddingVertical: dimensions.padding,
                paddingHorizontal: dimensions.padding + 4,
              },
              disabled && styles.buttonDisabled,
            ]}
          >
            {/* Reaction Icon */}
            <View style={styles.iconContainer}>
              {userReaction ? (
                <ReactionIcon type={userReaction} size={dimensions.icon} />
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
          </View>

          {/* Big Heart Animation */}
          <Animated.View style={[styles.bigHeart, bigHeartStyle]} pointerEvents="none">
            <Heart
              size={80}
              color={REACTION_CONFIG.love?.color || '#E91E63'}
              fill={REACTION_CONFIG.love?.color || '#E91E63'}
            />
          </Animated.View>
        </Animated.View>
      </View>

      {/* Reaction Picker - Rendered as overlay */}
      {showPicker && (
        <Animated.View
          style={[
            styles.picker,
            pickerAnimatedStyle,
            {
              left: pickerPosition.x,
              top: pickerPosition.y,
            },
          ]}
          pointerEvents="none"
        >
          <View style={styles.pickerContent}>
            {REACTION_ORDER.map((type) => {
              const config = REACTION_CONFIG[type];
              const isHovered = hoveredReaction === type;

              return (
                <ReactionItemAnimated
                  key={type}
                  type={type}
                  config={config}
                  scale={reactionScales[type]}
                  isHovered={isHovered}
                  isSelected={userReaction === type}
                />
              );
            })}
          </View>
        </Animated.View>
      )}
    </View>
  );
};

/**
 * Animated Reaction Item
 */
const ReactionItemAnimated = memo(({ type, config, scale, isHovered, isSelected }) => {
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { translateY: scale.value > 1.1 ? -10 * (scale.value - 1) : 0 },
    ],
  }));

  return (
    <Animated.View
      style={[
        styles.reactionItem,
        isSelected && styles.reactionItemSelected,
        animatedStyle,
      ]}
    >
      <Text style={styles.reactionEmoji}>{config.emoji}</Text>
      {isHovered && (
        <View style={styles.reactionLabel}>
          <Text style={styles.reactionLabelText} numberOfLines={1}>{config.label}</Text>
        </View>
      )}
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
    overflow: 'visible', // Allow picker to overflow above
    zIndex: 1,
  },
  container: {
    position: 'relative',
    overflow: 'visible',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  iconContainer: {
    width: 22,
    height: 22,
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
  // Picker styles
  picker: {
    position: 'absolute',
    width: PICKER_WIDTH,
    height: PICKER_HEIGHT,
    zIndex: 9999,
    elevation: 999,
  },
  pickerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    backgroundColor: Platform.OS === 'ios' ? 'rgba(30, 30, 50, 0.95)' : 'rgba(20, 20, 40, 0.98)',
    borderRadius: 24,
    paddingHorizontal: 8,
    // Shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  reactionItem: {
    width: REACTION_SIZE,
    height: REACTION_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reactionItemSelected: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 18,
  },
  reactionEmoji: {
    fontSize: 24,
    textAlign: 'center',
    includeFontPadding: false,
  },
  reactionLabel: {
    position: 'absolute',
    top: -24,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 10,
    minWidth: 40,
    alignItems: 'center',
  },
  reactionLabelText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default memo(ForumReactionButton);
