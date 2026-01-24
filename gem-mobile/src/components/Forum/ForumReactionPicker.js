/**
 * ForumReactionPicker Component - OPTIMIZED VERSION
 * Long-press reaction picker overlay for forum posts (Facebook-style)
 *
 * Performance optimizations:
 * - Lightweight Modal (no BlurView)
 * - Fast withTiming instead of withSpring
 * - No staggered animations
 * - Minimal re-renders
 */

import React, { useCallback, memo } from 'react';
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
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { REACTION_CONFIG, REACTION_ORDER, REACTION_SIZES } from '../../constants/reactions';
import { COLORS, SPACING } from '../../utils/tokens';

// Safe haptics import
let Haptics = null;
try {
  Haptics = require('expo-haptics');
} catch (e) {}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Fast animation config
const FAST_TIMING = { duration: 100, easing: Easing.out(Easing.ease) };

/**
 * Single Reaction Item - Memoized for performance
 */
const ReactionItem = memo(({ type, onSelect, isSelected }) => {
  const config = REACTION_CONFIG[type];
  const scale = useSharedValue(1);

  const handlePressIn = useCallback(() => {
    scale.value = withTiming(1.25, { duration: 60 });
  }, []);

  const handlePressOut = useCallback(() => {
    scale.value = withTiming(1, { duration: 60 });
  }, []);

  const handlePress = useCallback(() => {
    if (Haptics) {
      try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch (e) {}
    }
    onSelect(type);
  }, [type, onSelect]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Pressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={styles.reactionItem}
    >
      <Animated.View style={[styles.iconWrapper, isSelected && styles.selectedIcon, animatedStyle]}>
        <Text style={styles.emoji}>{config.emoji}</Text>
      </Animated.View>
    </Pressable>
  );
});

/**
 * ForumReactionPicker - Optimized for performance with Modal
 */
const ForumReactionPicker = ({
  visible,
  position = { x: 0, y: 0 },
  currentReaction = null,
  onSelect,
  onClose,
}) => {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(8);

  // Animate when visible changes
  React.useEffect(() => {
    if (visible) {
      opacity.value = withTiming(1, FAST_TIMING);
      translateY.value = withTiming(0, FAST_TIMING);
    } else {
      opacity.value = 0;
      translateY.value = 8;
    }
  }, [visible]);

  const handleSelect = useCallback((type) => {
    onSelect?.(type);
    onClose?.();
  }, [onSelect, onClose]);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  // Calculate position (centered, clamped to screen)
  const pickerWidth = 260; // Slightly smaller picker
  const pickerX = Math.max(12, Math.min(
    position.x - pickerWidth / 2,
    SCREEN_WIDTH - pickerWidth - 12
  ));
  const pickerY = Math.max(50, position.y - 55);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.modalContainer}>
        {/* Backdrop */}
        <Pressable style={styles.backdrop} onPress={onClose} />

        {/* Picker */}
        <Animated.View
          style={[
            styles.picker,
            containerStyle,
            { left: pickerX, top: pickerY, width: pickerWidth },
          ]}
        >
          <View style={styles.reactionsRow}>
            {REACTION_ORDER.map((type) => (
              <ReactionItem
                key={type}
                type={type}
                onSelect={handleSelect}
                isSelected={currentReaction === type}
              />
            ))}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
  },
  picker: {
    position: 'absolute',
    height: 44,
    borderRadius: 22,
    backgroundColor: Platform.OS === 'ios' ? 'rgba(30, 30, 50, 0.95)' : 'rgba(20, 20, 40, 0.98)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    // Shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  reactionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    flex: 1,
    paddingHorizontal: 6,
  },
  reactionItem: {
    padding: 3,
  },
  iconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedIcon: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  emoji: {
    fontSize: 22,
    textAlign: 'center',
    includeFontPadding: false,
  },
});

export default memo(ForumReactionPicker);
