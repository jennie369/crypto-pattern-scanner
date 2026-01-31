/**
 * WidgetSkeleton.js
 * Skeleton loading component for VisionBoard widgets
 * Created: January 27, 2026
 */

import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, BORDER_RADIUS } from '../../theme';

/**
 * Animated skeleton bar
 */
const SkeletonBar = ({ width = '100%', height = 16, style }) => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();

    return () => animation.stop();
  }, [animatedValue]);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View
      style={[
        styles.skeletonBar,
        { width, height, opacity },
        style,
      ]}
    />
  );
};

/**
 * Skeleton for a single widget card
 */
export const WidgetCardSkeleton = ({ style }) => {
  return (
    <View style={[styles.widgetCard, style]}>
      <View style={styles.widgetHeader}>
        <SkeletonBar width={120} height={20} />
        <SkeletonBar width={40} height={20} />
      </View>
      <View style={styles.widgetContent}>
        <SkeletonBar width="80%" height={14} style={styles.mb8} />
        <SkeletonBar width="60%" height={14} />
      </View>
    </View>
  );
};

/**
 * Skeleton for ritual card
 */
export const RitualCardSkeleton = ({ style }) => {
  return (
    <View style={[styles.ritualCard, style]}>
      <View style={styles.ritualIcon}>
        <SkeletonBar width={48} height={48} style={styles.circle} />
      </View>
      <View style={styles.ritualInfo}>
        <SkeletonBar width={100} height={16} style={styles.mb4} />
        <SkeletonBar width={150} height={12} />
      </View>
    </View>
  );
};

/**
 * Skeleton for goal item
 */
export const GoalItemSkeleton = ({ style }) => {
  return (
    <View style={[styles.goalItem, style]}>
      <View style={styles.goalCheckbox}>
        <SkeletonBar width={24} height={24} style={styles.circle} />
      </View>
      <View style={styles.goalContent}>
        <SkeletonBar width="70%" height={16} style={styles.mb4} />
        <SkeletonBar width="40%" height={12} />
      </View>
    </View>
  );
};

/**
 * Skeleton for stats card
 */
export const StatsCardSkeleton = ({ style }) => {
  return (
    <View style={[styles.statsCard, style]}>
      <SkeletonBar width={60} height={32} style={styles.mb8} />
      <SkeletonBar width={80} height={14} />
    </View>
  );
};

/**
 * Full VisionBoard screen skeleton
 */
export const VisionBoardSkeleton = () => {
  return (
    <View style={styles.container}>
      {/* Header skeleton */}
      <View style={styles.header}>
        <SkeletonBar width={150} height={24} />
        <SkeletonBar width={40} height={40} style={styles.circle} />
      </View>

      {/* Stats row */}
      <View style={styles.statsRow}>
        <StatsCardSkeleton />
        <StatsCardSkeleton />
        <StatsCardSkeleton />
      </View>

      {/* Rituals section */}
      <View style={styles.section}>
        <SkeletonBar width={120} height={20} style={styles.mb12} />
        <View style={styles.ritualsGrid}>
          <RitualCardSkeleton />
          <RitualCardSkeleton />
        </View>
      </View>

      {/* Goals section */}
      <View style={styles.section}>
        <SkeletonBar width={100} height={20} style={styles.mb12} />
        <GoalItemSkeleton />
        <GoalItemSkeleton />
        <GoalItemSkeleton />
      </View>
    </View>
  );
};

/**
 * Generic widget skeleton (default export)
 * Can be used as a general-purpose skeleton loader
 */
const WidgetSkeleton = ({ variant = 'card', style, ...props }) => {
  switch (variant) {
    case 'ritual':
      return <RitualCardSkeleton style={style} {...props} />;
    case 'goal':
      return <GoalItemSkeleton style={style} {...props} />;
    case 'stats':
      return <StatsCardSkeleton style={style} {...props} />;
    case 'full':
      return <VisionBoardSkeleton {...props} />;
    case 'card':
    default:
      return <WidgetCardSkeleton style={style} {...props} />;
  }
};

/**
 * Inline skeleton with shimmer effect
 */
export const ShimmerSkeleton = ({ width, height, style }) => {
  const translateX = useRef(new Animated.Value(-100)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(translateX, {
        toValue: 200,
        duration: 1500,
        useNativeDriver: true,
      })
    );
    animation.start();

    return () => animation.stop();
  }, [translateX]);

  return (
    <View style={[styles.shimmerContainer, { width, height }, style]}>
      <Animated.View
        style={[
          styles.shimmer,
          { transform: [{ translateX }] },
        ]}
      >
        <LinearGradient
          colors={['transparent', 'rgba(255,255,255,0.2)', 'transparent']}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={styles.shimmerGradient}
        />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: SPACING.md,
  },
  skeletonBar: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: BORDER_RADIUS.sm,
  },
  circle: {
    borderRadius: 100,
  },
  mb4: {
    marginBottom: 4,
  },
  mb8: {
    marginBottom: SPACING.xs,
  },
  mb12: {
    marginBottom: SPACING.sm,
  },

  // Widget card
  widgetCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  widgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  widgetContent: {},

  // Ritual card
  ritualCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  ritualIcon: {
    marginRight: SPACING.sm,
  },
  ritualInfo: {
    flex: 1,
  },

  // Goal item
  goalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  goalCheckbox: {
    marginRight: SPACING.sm,
  },
  goalContent: {
    flex: 1,
  },

  // Stats card
  statsCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.sm,
    alignItems: 'center',
    marginHorizontal: 4,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },

  // Stats row
  statsRow: {
    flexDirection: 'row',
    marginBottom: SPACING.lg,
  },

  // Section
  section: {
    marginBottom: SPACING.lg,
  },

  // Rituals grid
  ritualsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },

  // Shimmer
  shimmerContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: BORDER_RADIUS.sm,
    overflow: 'hidden',
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 100,
  },
  shimmerGradient: {
    flex: 1,
  },
});

export default WidgetSkeleton;
