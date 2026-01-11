/**
 * ViewerCount Component
 * Display current viewer count with icon
 *
 * Features:
 * - Animated count changes
 * - Compact and full variants
 * - Number formatting (1K, 10K, etc.)
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import tokens from '../../utils/tokens';

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
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const prevCount = useRef(count);

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
            color={tokens.colors.textSecondary}
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
            color={tokens.colors.textSecondary}
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
          {count === 1 ? 'ng\u01B0\u1EDDi xem' : 'ng\u01B0\u1EDDi xem'}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingVertical: tokens.spacing.xs,
    paddingHorizontal: tokens.spacing.sm,
    borderRadius: tokens.radius.md,
    gap: tokens.spacing.xs,
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
    fontSize: tokens.fontSize.md,
    fontWeight: '700',
    color: tokens.colors.white,
  },
  label: {
    fontSize: tokens.fontSize.xs,
    color: tokens.colors.textSecondary,
  },
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  compactCount: {
    fontSize: tokens.fontSize.sm,
    fontWeight: '600',
    color: tokens.colors.textSecondary,
  },
});

export default ViewerCount;
