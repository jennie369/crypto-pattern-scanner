/**
 * RitualHeader - Header component for ritual screens
 * Features back button, title, and optional sound toggle
 */

import React, { useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, Platform, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { ChevronLeft, Volume2, VolumeX, X, Clock } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

import {
  COSMIC_COLORS,
  COSMIC_SPACING,
  COSMIC_TYPOGRAPHY,
} from '../../../theme/cosmicTokens';
import { COSMIC_TIMING } from '../../../utils/cosmicAnimations';

// ============================================
// ICON BUTTON
// ============================================

const IconButton = ({ icon, onPress, style }) => {
  const scale = useSharedValue(1);

  const triggerHaptic = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  const tapGesture = Gesture.Tap()
    .onStart(() => {
      scale.value = withTiming(0.9, { duration: 100 });
      runOnJS(triggerHaptic)();
    })
    .onEnd(() => {
      scale.value = withSpring(1, COSMIC_TIMING.spring.bouncy);
      if (onPress) {
        runOnJS(onPress)();
      }
    })
    .onFinalize(() => {
      scale.value = withSpring(1, COSMIC_TIMING.spring.bouncy);
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <GestureDetector gesture={tapGesture}>
      <Animated.View style={[styles.iconButton, animatedStyle, style]}>
        {icon}
      </Animated.View>
    </GestureDetector>
  );
};

// ============================================
// TIMER DISPLAY
// ============================================

const TimerDisplay = ({ seconds }) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  const formatTime = (num) => num.toString().padStart(2, '0');

  return (
    <View style={styles.timerContainer}>
      <Clock size={14} color={COSMIC_COLORS.text.secondary} strokeWidth={2} />
      <Text style={styles.timerText}>
        {formatTime(minutes)}:{formatTime(remainingSeconds)}
      </Text>
    </View>
  );
};

// ============================================
// MAIN COMPONENT
// ============================================

const RitualHeader = ({
  title,
  subtitle,
  icon = null, // Lucide icon element
  iconColor = COSMIC_COLORS.text.primary,
  onBack,
  onClose,
  onSoundToggle,
  soundEnabled = true,
  showSound = false,
  showTimer = false,
  timeRemaining = 0,
  transparent = true,
  style,
}) => {
  const insets = useSafeAreaInsets();

  const topPadding = Platform.OS === 'ios'
    ? insets.top
    : StatusBar.currentHeight || COSMIC_SPACING.lg;

  return (
    <View
      style={[
        styles.container,
        { paddingTop: topPadding },
        !transparent && styles.solidBackground,
        style,
      ]}
    >
      <View style={styles.content}>
        {/* Left section - Back/Close button */}
        <View style={styles.leftSection}>
          {onBack && (
            <IconButton
              icon={<ChevronLeft size={28} color={COSMIC_COLORS.text.primary} strokeWidth={2} />}
              onPress={onBack}
            />
          )}
          {onClose && !onBack && (
            <IconButton
              icon={<X size={24} color={COSMIC_COLORS.text.primary} strokeWidth={2} />}
              onPress={onClose}
            />
          )}
        </View>

        {/* Center section - Title */}
        <View style={styles.centerSection}>
          {icon && (
            <View style={styles.iconContainer}>
              {React.cloneElement(icon, {
                size: 20,
                color: iconColor,
                strokeWidth: 2,
              })}
            </View>
          )}
          <View style={styles.titleContainer}>
            <Text style={styles.title} numberOfLines={1}>
              {title}
            </Text>
            {subtitle && (
              <Text style={styles.subtitle} numberOfLines={1}>
                {subtitle}
              </Text>
            )}
          </View>
        </View>

        {/* Right section - Sound/Timer */}
        <View style={styles.rightSection}>
          {showTimer && timeRemaining > 0 && (
            <TimerDisplay seconds={timeRemaining} />
          )}
          {showSound && onSoundToggle && (
            <IconButton
              icon={
                soundEnabled
                  ? <Volume2 size={22} color={COSMIC_COLORS.text.primary} strokeWidth={2} />
                  : <VolumeX size={22} color={COSMIC_COLORS.text.muted} strokeWidth={2} />
              }
              onPress={onSoundToggle}
            />
          )}
          {/* Spacer if no right content */}
          {!showTimer && !showSound && <View style={styles.spacer} />}
        </View>
      </View>
    </View>
  );
};

// ============================================
// MINIMAL HEADER (just back button)
// ============================================

export const MinimalRitualHeader = ({ onBack, onClose, light = false }) => {
  const insets = useSafeAreaInsets();

  const topPadding = Platform.OS === 'ios'
    ? insets.top
    : StatusBar.currentHeight || COSMIC_SPACING.lg;

  const iconColor = light ? 'rgba(255, 255, 255, 0.9)' : COSMIC_COLORS.text.primary;

  return (
    <View style={[styles.minimalContainer, { paddingTop: topPadding }]}>
      {onBack && (
        <IconButton
          icon={<ChevronLeft size={28} color={iconColor} strokeWidth={2} />}
          onPress={onBack}
        />
      )}
      {onClose && !onBack && (
        <IconButton
          icon={<X size={24} color={iconColor} strokeWidth={2} />}
          onPress={onClose}
        />
      )}
    </View>
  );
};

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  solidBackground: {
    backgroundColor: COSMIC_COLORS.bgDeepSpace,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: COSMIC_SPACING.md,
    paddingVertical: COSMIC_SPACING.sm,
    minHeight: 56,
  },
  leftSection: {
    width: 48,
    alignItems: 'flex-start',
  },
  centerSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: COSMIC_SPACING.sm,
  },
  rightSection: {
    width: 48,
    alignItems: 'flex-end',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: COSMIC_SPACING.xs,
  },
  iconContainer: {
    marginRight: COSMIC_SPACING.xs,
  },
  titleContainer: {
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: COSMIC_COLORS.text.primary,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 12,
    color: COSMIC_COLORS.text.secondary,
    textAlign: 'center',
    marginTop: 2,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: COSMIC_SPACING.sm,
    paddingVertical: COSMIC_SPACING.xs,
    borderRadius: 12,
    gap: 4,
  },
  timerText: {
    fontSize: 12,
    fontWeight: '500',
    color: COSMIC_COLORS.text.secondary,
    fontVariant: ['tabular-nums'],
  },
  spacer: {
    width: 40,
  },
  minimalContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    paddingHorizontal: COSMIC_SPACING.md,
    paddingVertical: COSMIC_SPACING.sm,
  },
});

export default React.memo(RitualHeader);
