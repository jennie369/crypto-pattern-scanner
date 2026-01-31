/**
 * LoadingSkeleton Component
 * Admin Analytics Dashboard - GEM Platform
 *
 * Skeleton loading placeholders
 *
 * Created: January 30, 2026
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Animated,
} from 'react-native';
import { COLORS, SPACING, GLASS } from '../../../utils/tokens';

const SkeletonItem = ({ width, height, borderRadius = 8, style }) => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
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
    ).start();
  }, [animatedValue]);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius,
          opacity,
        },
        style,
      ]}
    />
  );
};

// Preset skeleton components
const LoadingSkeleton = {
  // Single skeleton item
  Item: SkeletonItem,

  // Metric card skeleton
  MetricCard: ({ style }) => (
    <View style={[styles.card, style]}>
      <View style={styles.row}>
        <SkeletonItem width={32} height={32} borderRadius={8} />
        <SkeletonItem width={100} height={14} style={{ marginLeft: SPACING.sm }} />
      </View>
    )}
      <SkeletonItem width={80} height={28} style={{ marginTop: SPACING.sm }} />
      <SkeletonItem width={60} height={12} style={{ marginTop: SPACING.sm }} />
    </View>
  ),

  // Chart skeleton
  Chart: ({ height = 200, style }) => (
    <View style={[styles.card, style]}>
      <SkeletonItem width={120} height={16} style={{ marginBottom: SPACING.md }} />
      <SkeletonItem width="100%" height={height} borderRadius={12} />
    </View>
  ),

  // List item skeleton
  ListItem: ({ style }) => (
    <View style={[styles.listItem, style]}>
      <SkeletonItem width={28} height={28} borderRadius={8} />
      <View style={styles.listItemContent}>
        <SkeletonItem width="60%" height={14} />
        <SkeletonItem width="40%" height={10} style={{ marginTop: 6 }} />
      </View>
    )}
      <SkeletonItem width={50} height={14} />
    </View>
  ),

  // Multiple list items
  List: ({ count = 5, style }) => (
    <View style={[styles.card, style]}>
      <SkeletonItem width={100} height={16} style={{ marginBottom: SPACING.md }} />
      {Array.from({ length: count }).map((_, index) => (
        <LoadingSkeleton.ListItem key={index} style={{ marginBottom: SPACING.sm }} />
      ))}
    </View>
  ),

  // Table skeleton
  Table: ({ rows = 5, columns = 4, style }) => (
    <View style={[styles.card, style]}>
      {/* Header */}
      <View style={styles.tableRow}>
        {Array.from({ length: columns }).map((_, i) => (
          <SkeletonItem key={i} width={`${90 / columns}%`} height={14} />
        ))}
      </View>
    )}
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <View key={rowIndex} style={[styles.tableRow, { marginTop: SPACING.sm }]}>
          {Array.from({ length: columns }).map((_, colIndex) => (
            <SkeletonItem key={colIndex} width={`${90 / columns}%`} height={12} />
          ))}
        </View>
      ))}
    </View>
  ),

  // Dashboard overview skeleton
  DashboardOverview: ({ style }) => (
    <View style={style}>
      {/* Metric cards row */}
      <View style={styles.metricsRow}>
        <LoadingSkeleton.MetricCard style={{ flex: 1, marginRight: SPACING.sm }} />
        <LoadingSkeleton.MetricCard style={{ flex: 1 }} />
      </View>
      <View style={[styles.metricsRow, { marginTop: SPACING.sm }]}>
        <LoadingSkeleton.MetricCard style={{ flex: 1, marginRight: SPACING.sm }} />
        <LoadingSkeleton.MetricCard style={{ flex: 1 }} />
      </View>
      {/* Chart */}
      <LoadingSkeleton.Chart style={{ marginTop: SPACING.md }} />
      {/* List */}
      <LoadingSkeleton.List count={3} style={{ marginTop: SPACING.md }} />
    </View>
  ),

  // Full screen loading
  FullScreen: ({ style }) => (
    <View style={[styles.fullScreen, style]}>
      <LoadingSkeleton.DashboardOverview />
    </View>
  ),
};

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: 'rgba(106, 91, 255, 0.15)',
  },

  card: {
    backgroundColor: GLASS.card,
    borderRadius: 16,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.2)',
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  listItemContent: {
    flex: 1,
    marginLeft: SPACING.sm,
  },

  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  metricsRow: {
    flexDirection: 'row',
  },

  fullScreen: {
    flex: 1,
    padding: SPACING.md,
  },
});

export default LoadingSkeleton;
