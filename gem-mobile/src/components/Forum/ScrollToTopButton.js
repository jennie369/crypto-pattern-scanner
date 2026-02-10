/**
 * Gemral - Scroll To Top FAB Button
 * Floating action button để scroll về đầu trang
 * Hiển thị khi user scroll xuống xa
 *
 * @version 1.0.0
 * @author GEM Team
 */

import React, { memo, useEffect, useRef, useMemo } from 'react';
import { TouchableOpacity, StyleSheet, Animated, Platform } from 'react-native';
import { ChevronUp } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useSettings } from '../../contexts/SettingsContext';

const COMPONENT_NAME = '[ScrollToTopButton]';

/**
 * ScrollToTopButton - FAB để scroll về đầu trang
 *
 * @param {boolean} visible - Hiển thị hay không
 * @param {function} onPress - Callback khi press
 * @param {object} style - Custom styles
 * @param {number} iconSize - Kích thước icon (default: 24)
 * @param {string} iconColor - Màu icon (default: colors.gold)
 * @param {string} backgroundColor - Màu nền button
 * @param {number} bottomOffset - Khoảng cách từ bottom (default: 100)
 */
const ScrollToTopButton = memo(({
  visible = false,
  onPress,
  style,
  iconSize = 24,
  iconColor,
  backgroundColor,
  bottomOffset = 100,
}) => {
  const { colors, gradients, glass, settings, SPACING, TYPOGRAPHY, t } = useSettings();

  // Use theme-aware defaults
  const finalIconColor = iconColor || colors.gold;
  const finalBackgroundColor = backgroundColor || (settings.theme === 'light' ? colors.bgDarkest : (glass.background || 'rgba(15, 16, 48, 0.9)'));

  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (__DEV__) {
      console.log(COMPONENT_NAME, 'Visibility changed:', visible);
    }

    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: visible ? 1 : 0,
        friction: 6,
        tension: 120,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: visible ? 1 : 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, [visible, scaleAnim, opacityAnim]);

  const handlePress = async () => {
    console.log(COMPONENT_NAME, 'Button pressed');

    // Haptic feedback
    try {
      if (Platform.OS !== 'web') {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    } catch (err) {
      // Haptics not available on all devices
      if (__DEV__) {
        console.log(COMPONENT_NAME, 'Haptics not available');
      }
    }

    onPress?.();
  };

  // Memoized styles
  const styles = useMemo(() => StyleSheet.create({
    container: {
      position: 'absolute',
      right: SPACING.md,
      zIndex: 1000,
    },
    button: {
      width: 48,
      height: 48,
      borderRadius: 24,
      justifyContent: 'center',
      alignItems: 'center',
      // Shadow for iOS
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      // Elevation for Android
      elevation: 8,
      // Border for glass effect
      borderWidth: 1,
      borderColor: 'rgba(255, 189, 89, 0.3)',
    },
  }), [colors, settings.theme, glass, SPACING, TYPOGRAPHY]);

  // Don't render if not visible (after animation completes)
  // Use __getValue() to check current value without triggering re-render
  // Note: In production, we render but let opacity hide it for smoother animations

  return (
    <Animated.View
      style={[
        styles.container,
        { bottom: bottomOffset },
        style,
        {
          transform: [{ scale: scaleAnim }],
          opacity: opacityAnim,
        },
      ]}
      pointerEvents={visible ? 'auto' : 'none'}
    >
      <TouchableOpacity
        style={[styles.button, { backgroundColor: finalBackgroundColor }]}
        onPress={handlePress}
        activeOpacity={0.8}
        accessibilityLabel="Cuộn về đầu trang"
        accessibilityRole="button"
        accessibilityHint="Nhấn để cuộn về đầu danh sách"
      >
        <ChevronUp
          size={iconSize}
          color={finalIconColor}
          strokeWidth={2.5}
        />
      </TouchableOpacity>
    </Animated.View>
  );
});

ScrollToTopButton.displayName = 'ScrollToTopButton';

export default ScrollToTopButton;
