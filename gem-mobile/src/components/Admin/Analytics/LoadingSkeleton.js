/**
 * LoadingSkeleton Component
 * Admin Analytics Dashboard - GEM Platform
 *
 * Skeleton loading placeholders
 *
 * Created: January 30, 2026
 */

import React, { useEffect, useRef, useMemo } from 'react';
import {
  View,
  StyleSheet,
  Animated,
} from 'react-native';
import { useSettings } from '../../../contexts/SettingsContext';

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
        {
          backgroundColor: 'rgba(106, 91, 255, 0.15)',
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

// Preset skeleton components - wrapped in a function to use hooks
const createLoadingSkeleton = () => {
  const LoadingSkeletonComponent = ({ type, ...props }) => {
    const { colors, glass, settings, SPACING, TYPOGRAPHY, t } = useSettings();

    const styles = useMemo(() => StyleSheet.create({
      skeleton: {
        backgroundColor: 'rgba(106, 91, 255, 0.15)',
      },

      card: {
        backgroundColor: settings.theme === 'light' ? colors.bgDarkest : (glass.background || 'rgba(15, 16, 48, 0.95)'),
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
    }), [colors, settings.theme, glass, SPACING, TYPOGRAPHY]);

    // Metric card skeleton
    if (type === 'MetricCard') {
      return (
        <View style={[styles.card, props.style]}>
          <View style={styles.row}>
            <SkeletonItem width={32} height={32} borderRadius={8} />
            <SkeletonItem width={100} height={14} style={{ marginLeft: SPACING.sm }} />
          </View>
          <SkeletonItem width={80} height={28} style={{ marginTop: SPACING.sm }} />
          <SkeletonItem width={60} height={12} style={{ marginTop: SPACING.sm }} />
        </View>
      );
    }

    // Chart skeleton
    if (type === 'Chart') {
      const { height = 200 } = props;
      return (
        <View style={[styles.card, props.style]}>
          <SkeletonItem width={120} height={16} style={{ marginBottom: SPACING.md }} />
          <SkeletonItem width="100%" height={height} borderRadius={12} />
        </View>
      );
    }

    // List item skeleton
    if (type === 'ListItem') {
      return (
        <View style={[styles.listItem, props.style]}>
          <SkeletonItem width={28} height={28} borderRadius={8} />
          <View style={styles.listItemContent}>
            <SkeletonItem width="60%" height={14} />
            <SkeletonItem width="40%" height={10} style={{ marginTop: 6 }} />
          </View>
          <SkeletonItem width={50} height={14} />
        </View>
      );
    }

    // Multiple list items
    if (type === 'List') {
      const { count = 5 } = props;
      return (
        <View style={[styles.card, props.style]}>
          <SkeletonItem width={100} height={16} style={{ marginBottom: SPACING.md }} />
          {Array.from({ length: count }).map((_, index) => (
            <LoadingSkeletonComponent key={index} type="ListItem" style={{ marginBottom: SPACING.sm }} />
          ))}
        </View>
      );
    }

    // Table skeleton
    if (type === 'Table') {
      const { rows = 5, columns = 4 } = props;
      return (
        <View style={[styles.card, props.style]}>
          {/* Header */}
          <View style={styles.tableRow}>
            {Array.from({ length: columns }).map((_, i) => (
              <SkeletonItem key={i} width={`${90 / columns}%`} height={14} />
            ))}
          </View>
          {/* Rows */}
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <View key={rowIndex} style={[styles.tableRow, { marginTop: SPACING.sm }]}>
              {Array.from({ length: columns }).map((_, colIndex) => (
                <SkeletonItem key={colIndex} width={`${90 / columns}%`} height={12} />
              ))}
            </View>
          ))}
        </View>
      );
    }

    // Dashboard overview skeleton
    if (type === 'DashboardOverview') {
      return (
        <View style={props.style}>
          {/* Metric cards row */}
          <View style={styles.metricsRow}>
            <LoadingSkeletonComponent type="MetricCard" style={{ flex: 1, marginRight: SPACING.sm }} />
            <LoadingSkeletonComponent type="MetricCard" style={{ flex: 1 }} />
          </View>
          <View style={[styles.metricsRow, { marginTop: SPACING.sm }]}>
            <LoadingSkeletonComponent type="MetricCard" style={{ flex: 1, marginRight: SPACING.sm }} />
            <LoadingSkeletonComponent type="MetricCard" style={{ flex: 1 }} />
          </View>
          {/* Chart */}
          <LoadingSkeletonComponent type="Chart" style={{ marginTop: SPACING.md }} />
          {/* List */}
          <LoadingSkeletonComponent type="List" count={3} style={{ marginTop: SPACING.md }} />
        </View>
      );
    }

    // Full screen loading
    if (type === 'FullScreen') {
      return (
        <View style={[styles.fullScreen, props.style]}>
          <LoadingSkeletonComponent type="DashboardOverview" />
        </View>
      );
    }

    // Default: single skeleton item
    return <SkeletonItem {...props} />;
  };

  // Create wrapper object with static-like properties for backward compatibility
  const LoadingSkeleton = {
    Item: SkeletonItem,
    MetricCard: (props) => <LoadingSkeletonComponent type="MetricCard" {...props} />,
    Chart: (props) => <LoadingSkeletonComponent type="Chart" {...props} />,
    ListItem: (props) => <LoadingSkeletonComponent type="ListItem" {...props} />,
    List: (props) => <LoadingSkeletonComponent type="List" {...props} />,
    Table: (props) => <LoadingSkeletonComponent type="Table" {...props} />,
    DashboardOverview: (props) => <LoadingSkeletonComponent type="DashboardOverview" {...props} />,
    FullScreen: (props) => <LoadingSkeletonComponent type="FullScreen" {...props} />,
  };

  return LoadingSkeleton;
};

const LoadingSkeleton = createLoadingSkeleton();

export default LoadingSkeleton;
