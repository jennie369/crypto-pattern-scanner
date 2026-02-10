/**
 * ViewerCount Component
 * Display current viewer count with icon
 *
 * Features:
 * - Animated count changes
 * - Compact and full variants
 * - Number formatting (1K, 10K, etc.)
 */

import React, { useEffect, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSettings } from '../../contexts/SettingsContext';

// Format number with K, M suffixes
const formatCount = (count) => {
  if (count >= 1000000) {
    return (count / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  }
  if (count >= 1000) {
    return (count / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  }
  return count.toString();
};

const ViewerCount = ({
  count = 0,
  variant = 'full', // 'full' | 'compact'
  showIcon = true,
  animated = true,
  style,
}) => {
  const { colors, gradients, glass, settings, SPACING, TYPOGRAPHY, t } = useSettings();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const prevCount = useRef(count);

  const styles = useMemo(() => StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: settings.theme === 'light' ? colors.bgDarkest : (glass.background || 'rgba(15, 16, 48, 0.95)'),
      paddingVertical: SPACING.xs,
      paddingHorizontal: SPACING.sm,
      borderRadius: SPACING.md,
      gap: SPACING.xs,
    },
    iconContainer: {
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: 'rgba(255,255,255,0.1)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    countContainer: {
      flexDirection: 'row',
      alignItems: 'baseline',
      gap: 4,
    },
    count: {
      fontSize: TYPOGRAPHY.fontSize.md,
      fontWeight: '700',
      color: colors.white,
    },
    label: {
      fontSize: TYPOGRAPHY.fontSize.xs,
      color: colors.textSecondary,
    },
    compactContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    compactCount: {
      fontSize: TYPOGRAPHY.fontSize.sm,
      fontWeight: '600',
      color: colors.textSecondary,
    },
  }), [colors, settings.theme, glass, SPACING, TYPOGRAPHY]);

  // Animate on count change
  useEffect(() => {
    if (animated && count !== prevCount.current) {
      const isIncrease = count > prevCount.current;

      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: isIncrease ? 1.2 : 0.9,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 5,
          useNativeDriver: true,
        }),
      ]).start();

      prevCount.current = count;
    }
  }, [count, animated]);

  const formattedCount = formatCount(count);

  if (variant === 'compact') {
    return (
      <View style={[styles.compactContainer, style]}>
        {showIcon && (
          <Ionicons
            name="eye"
            size={12}
            color={colors.textSecondary}
          />
        )}
        <Animated.Text
          style={[
            styles.compactCount,
            animated && { transform: [{ scale: scaleAnim }] },
          ]}
        >
          {formattedCount}
        </Animated.Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      {showIcon && (
        <View style={styles.iconContainer}>
          <Ionicons
            name="eye"
            size={16}
            color={colors.textSecondary}
          />
        </View>
      )}

      <View style={styles.countContainer}>
        <Animated.Text
          style={[
            styles.count,
            animated && { transform: [{ scale: scaleAnim }] },
          ]}
        >
          {formattedCount}
        </Animated.Text>
        <Text style={styles.label}>
          {count === 1 ? 'người xem' : 'người xem'}
        </Text>
      </View>
    </View>
  );
};

export default ViewerCount;
