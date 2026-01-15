/**
 * ForumReactionPicker Component
 * Long-press reaction picker overlay for forum posts (Facebook-style)
 *
 * Features:
 * - 6 reaction types (like, love, haha, wow, sad, angry)
 * - Staggered entrance animation
 * - Hover detection with scale effect
 * - Label popup on hover
 * - Glass blur background
 * - Position clamping to screen bounds
 */

import React, { useState, useCallback, useEffect, useRef, memo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  Dimensions,
  Platform,
  Modal,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  FadeIn,
  FadeOut,
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import ReactionIcon from './ReactionIcon';
import {
  REACTION_CONFIG,
  REACTION_ORDER,
  REACTION_SIZES,
  REACTION_ANIMATIONS,
} from '../../constants/reactions';
import { COLORS, SPACING } from '../../utils/tokens';

// Safe haptics import
let Haptics = null;
try {
  Haptics = require('expo-haptics');
} catch (e) {
  console.log('[ForumReactionPicker] expo-haptics not available');
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

/**
 * ForumReactionPicker - Long-press reaction picker
 *
 * @param {Object} props
 * @param {boolean} props.visible - Show/hide picker
 * @param {Object} props.position - Position {x, y} to anchor picker
 * @param {string|null} props.currentReaction - User's current reaction type
 * @param {Function} props.onSelect - Callback when reaction selected
 * @param {Function} props.onClose - Callback when picker closes
 * @param {Object|null} props.panPosition - Current pan position for hover detection
 */
const ForumReactionPicker = ({
  visible,
  position = { x: 0, y: 0 },
  currentReaction = null,
  onSelect,
  onClose,
  panPosition = null,
}) => {
  // State
  const [hoveredReaction, setHoveredReaction] = useState(null);
  const [showLabels, setShowLabels] = useState(false);

  // Refs for icon positions
  const iconPositions = useRef({});
  const pickerRef = useRef(null);
  const pickerLayout = useRef({ x: 0, y: 0 });

  // Animation values
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);

  /**
   * Calculate picker position (avoid screen edges)
   */
  const getPickerPosition = useCallback(() => {
    let x = position.x - REACTION_SIZES.PICKER_WIDTH / 2;
    let y = position.y - REACTION_SIZES.PICKER_HEIGHT - 20;

    // Clamp to screen bounds with padding
    const padding = 16;
    x = Math.max(
      padding,
      Math.min(x, SCREEN_WIDTH - REACTION_SIZES.PICKER_WIDTH - padding)
    );
    y = Math.max(padding, y);

    // If would go off bottom, position above
    if (y + REACTION_SIZES.PICKER_HEIGHT > SCREEN_HEIGHT - 100) {
      y = position.y - REACTION_SIZES.PICKER_HEIGHT - 20;
    }

    return { x, y };
  }, [position]);

  /**
   * Handle visibility changes
   */
  useEffect(() => {
    if (visible) {
      // Animate in
      scale.value = withSpring(1, { damping: 15, stiffness: 200 });
      opacity.value = withTiming(1, {
        duration: REACTION_ANIMATIONS.PICKER_APPEAR_DURATION,
      });

      // Delay showing labels
      setTimeout(() => setShowLabels(true), 200);
    } else {
      // Animate out
      scale.value = withSpring(0, { damping: 20, stiffness: 200 });
      opacity.value = withTiming(0, { duration: 150 });
      setShowLabels(false);
      setHoveredReaction(null);
    }
  }, [visible, scale, opacity]);

  /**
   * Detect hover based on pan position
   */
  useEffect(() => {
    if (!panPosition || !visible) {
      setHoveredReaction(null);
      return;
    }

    const { x, y } = panPosition;
    let foundReaction = null;

    // Check each icon position
    for (const [type, pos] of Object.entries(iconPositions.current)) {
      const iconX = pickerLayout.current.x + pos.x;
      const iconY = pickerLayout.current.y + pos.y;
      const hitPadding = 20;

      if (
        x >= iconX - hitPadding &&
        x <= iconX + REACTION_SIZES.ICON_SIZE + hitPadding &&
        y >= iconY - hitPadding &&
        y <= iconY + REACTION_SIZES.ICON_SIZE + hitPadding
      ) {
        foundReaction = type;
        break;
      }
    }

    if (foundReaction !== hoveredReaction) {
      setHoveredReaction(foundReaction);

      // Haptic feedback on hover change
      if (foundReaction && Haptics) {
        try {
          Haptics.selectionAsync();
        } catch (e) {
          // Ignore
        }
      }
    }
  }, [panPosition, visible, hoveredReaction]);

  /**
   * Handle icon layout to track positions
   */
  const handleIconLayout = useCallback((type, event) => {
    const { x, y, width, height } = event.nativeEvent.layout;
    iconPositions.current[type] = { x, y, width, height };
  }, []);

  /**
   * Handle picker layout
   */
  const handlePickerLayout = useCallback((event) => {
    const { x, y } = event.nativeEvent.layout;
    pickerLayout.current = { x, y };
  }, []);

  /**
   * Handle reaction selection
   */
  const handleSelect = useCallback(
    (type) => {
      // Haptic feedback
      if (Haptics) {
        try {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        } catch (e) {
          // Ignore
        }
      }

      onSelect?.(type);
      onClose?.();
    },
    [onSelect, onClose]
  );

  /**
   * Animated styles
   */
  const containerStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  if (!visible) return null;

  const pickerPos = getPickerPosition();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        {/* Backdrop - tap to close */}
        <Pressable style={styles.backdrop} onPress={onClose} />

        {/* Picker Container */}
        <Animated.View
          ref={pickerRef}
          style={[
            styles.pickerContainer,
            containerStyle,
            {
              left: pickerPos.x,
              top: pickerPos.y,
            },
          ]}
          onLayout={handlePickerLayout}
        >
          <BlurView
            intensity={Platform.OS === 'ios' ? 80 : 100}
            tint="dark"
            style={styles.blurView}
          >
            <View style={styles.reactionsRow}>
              {REACTION_ORDER.map((type, index) => {
                const isHovered = hoveredReaction === type;
                const isCurrentReaction = currentReaction === type;

                return (
                  <Pressable
                    key={type}
                    onPress={() => handleSelect(type)}
                    style={styles.reactionItem}
                  >
                    {/* Label popup on hover */}
                    {showLabels && isHovered && (
                      <Animated.View
                        entering={FadeIn.duration(100)}
                        exiting={FadeOut.duration(100)}
                        style={styles.labelContainer}
                      >
                        <Text style={styles.label}>
                          {REACTION_CONFIG[type]?.label}
                        </Text>
                      </Animated.View>
                    )}

                    {/* Icon wrapper */}
                    <View
                      onLayout={(e) => handleIconLayout(type, e)}
                      style={[
                        styles.iconWrapper,
                        isCurrentReaction && styles.currentReaction,
                      ]}
                    >
                      <ReactionIcon
                        type={type}
                        size={REACTION_SIZES.PICKER_EMOJI_SIZE}
                        emojiSize={REACTION_SIZES.PICKER_EMOJI_SIZE}
                        index={index}
                        isHovered={isHovered}
                        showAnimation={visible}
                      />
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </BlurView>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
  },
  pickerContainer: {
    position: 'absolute',
    width: REACTION_SIZES.PICKER_WIDTH,
    height: REACTION_SIZES.PICKER_HEIGHT,
    borderRadius: REACTION_SIZES.PICKER_BORDER_RADIUS,
    overflow: 'hidden',
    // Shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 15,
    // Border
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  blurView: {
    flex: 1,
    borderRadius: REACTION_SIZES.PICKER_BORDER_RADIUS,
    overflow: 'hidden',
    backgroundColor:
      Platform.OS === 'android' ? 'rgba(15, 16, 48, 0.95)' : 'transparent',
  },
  reactionsRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    paddingHorizontal: REACTION_SIZES.PADDING_HORIZONTAL,
  },
  reactionItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapper: {
    // Picker emoji size (larger than button emoji for easy selection)
    width: REACTION_SIZES.PICKER_EMOJI_SIZE + 8,
    height: REACTION_SIZES.PICKER_EMOJI_SIZE + 8,
    borderRadius: (REACTION_SIZES.PICKER_EMOJI_SIZE + 8) / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  currentReaction: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  labelContainer: {
    position: 'absolute',
    top: -28,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: 10,
    minWidth: 50,
    alignItems: 'center',
  },
  label: {
    color: COLORS.textPrimary,
    fontSize: 11,
    fontWeight: '600',
  },
});

export default memo(ForumReactionPicker);
