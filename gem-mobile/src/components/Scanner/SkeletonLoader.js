/**
 * SkeletonLoader - Shimmer loading placeholders cho Scanner
 *
 * VARIANTS:
 * - Chart: Chart loading skeleton
 * - PatternCard: Pattern card skeleton
 * - PatternList: Multiple pattern cards
 * - ZoneInfo: Zone info skeleton
 * - ScanProgress: Scan progress skeleton
 *
 * USAGE:
 * import SkeletonLoader, { ChartSkeleton, PatternCardSkeleton } from '../components/Scanner/SkeletonLoader';
 *
 * // Use individual components
 * <ChartSkeleton />
 * <PatternCardSkeleton />
 *
 * // Or use via default export
 * <SkeletonLoader.Chart />
 * <SkeletonLoader.PatternCard />
 */

import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions, Text } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Theme colors
const COLORS = {
  background: '#0d1421',
  shimmerBase: '#1a1a2e',
  shimmerHighlight: 'rgba(255,255,255,0.08)',
  text: '#888',
  accent: '#00d4aa',
};

// ========================================
// SHIMMER PLACEHOLDER COMPONENT
// ========================================

const ShimmerPlaceholder = ({
  width,
  height,
  style,
  borderRadius = 4,
  marginBottom = 0,
}) => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      })
    );
    animation.start();

    return () => animation.stop();
  }, [animatedValue]);

  const translateX = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [-width, width],
  });

  return (
    <View
      style={[
        {
          width,
          height,
          borderRadius,
          overflow: 'hidden',
          backgroundColor: COLORS.shimmerBase,
          marginBottom,
        },
        style,
      ]}
    >
      <Animated.View
        style={{
          width: '200%',
          height: '100%',
          transform: [{ translateX }],
          flexDirection: 'row',
        }}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: 'transparent',
          }}
        />
        <View
          style={{
            width: width * 0.5,
            height: '100%',
            backgroundColor: COLORS.shimmerHighlight,
          }}
        />
        <View
          style={{
            flex: 1,
            backgroundColor: 'transparent',
          }}
        />
      </Animated.View>
    </View>
  );
};

// ========================================
// CHART SKELETON
// ========================================

export const ChartSkeleton = ({ height = 300 }) => {
  // Generate random candle heights
  const candleHeights = useRef(
    Array(25)
      .fill(0)
      .map(() => Math.random() * 80 + 30)
  ).current;

  return (
    <View style={[styles.chartContainer, { height }]}>
      {/* Price axis on right */}
      <View style={styles.priceAxis}>
        {[...Array(5)].map((_, i) => (
          <ShimmerPlaceholder
            key={`price-${i}`}
            width={45}
            height={12}
            borderRadius={3}
          />
        ))}
      </View>

      {/* Chart area with candles */}
      <View style={styles.chartArea}>
        {candleHeights.map((candleHeight, i) => (
          <View key={`candle-${i}`} style={styles.candleColumn}>
            <ShimmerPlaceholder
              width={6}
              height={candleHeight}
              borderRadius={2}
            />
          </View>
        ))}
      </View>

      {/* Time axis at bottom */}
      <View style={styles.timeAxis}>
        {[...Array(5)].map((_, i) => (
          <ShimmerPlaceholder
            key={`time-${i}`}
            width={35}
            height={10}
            borderRadius={3}
          />
        ))}
      </View>

      {/* Zone placeholder overlay */}
      <View style={styles.zonePlaceholder}>
        <ShimmerPlaceholder
          width={100}
          height={45}
          borderRadius={8}
          style={{ opacity: 0.5 }}
        />
      </View>
    </View>
  );
};

// ========================================
// PATTERN CARD SKELETON
// ========================================

export const PatternCardSkeleton = ({ index = 0 }) => {
  return (
    <Animated.View
      style={[
        styles.patternCard,
        {
          opacity: 1 - index * 0.15, // Fade out lower cards
        },
      ]}
    >
      {/* Header: Pattern name + Badge */}
      <View style={styles.patternHeader}>
        <ShimmerPlaceholder width={100} height={18} borderRadius={4} />
        <ShimmerPlaceholder width={45} height={22} borderRadius={11} />
      </View>

      {/* Body: Price info rows */}
      <View style={styles.patternBody}>
        <View style={styles.patternRow}>
          <ShimmerPlaceholder width={55} height={13} borderRadius={3} />
          <ShimmerPlaceholder width={75} height={13} borderRadius={3} />
        </View>
        <View style={styles.patternRow}>
          <ShimmerPlaceholder width={45} height={13} borderRadius={3} />
          <ShimmerPlaceholder width={65} height={13} borderRadius={3} />
        </View>
        <View style={styles.patternRow}>
          <ShimmerPlaceholder width={60} height={13} borderRadius={3} />
          <ShimmerPlaceholder width={55} height={13} borderRadius={3} />
        </View>
      </View>

      {/* Footer: Action button */}
      <View style={styles.patternFooter}>
        <ShimmerPlaceholder width={90} height={30} borderRadius={15} />
      </View>
    </Animated.View>
  );
};

// ========================================
// PATTERN LIST SKELETON
// ========================================

export const PatternListSkeleton = ({ count = 3 }) => (
  <View style={styles.listContainer}>
    {[...Array(count)].map((_, i) => (
      <PatternCardSkeleton key={`pattern-skeleton-${i}`} index={i} />
    ))}
  </View>
);

// ========================================
// ZONE INFO SKELETON
// ========================================

export const ZoneInfoSkeleton = () => (
  <View style={styles.zoneInfo}>
    {/* Title */}
    <ShimmerPlaceholder
      width={90}
      height={16}
      borderRadius={4}
      marginBottom={10}
    />

    {/* Info rows */}
    <View style={styles.zoneRow}>
      <ShimmerPlaceholder width={50} height={12} borderRadius={3} />
      <ShimmerPlaceholder width={70} height={12} borderRadius={3} />
    </View>
    <View style={styles.zoneRow}>
      <ShimmerPlaceholder width={40} height={12} borderRadius={3} />
      <ShimmerPlaceholder width={60} height={12} borderRadius={3} />
    </View>
    <View style={styles.zoneRow}>
      <ShimmerPlaceholder width={55} height={12} borderRadius={3} />
      <ShimmerPlaceholder width={50} height={12} borderRadius={3} />
    </View>

    {/* R:R row */}
    <View style={[styles.zoneRow, styles.zoneRowLast]}>
      <ShimmerPlaceholder width={60} height={12} borderRadius={3} />
      <ShimmerPlaceholder width={40} height={12} borderRadius={3} />
    </View>
  </View>
);

// ========================================
// SCAN PROGRESS SKELETON
// ========================================

export const ScanProgressSkeleton = ({
  progress = 0,
  total = 100,
  currentSymbol = '',
  patternsFound = 0,
}) => {
  const progressPercent = total > 0 ? (progress / total) * 100 : 0;
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: progressPercent,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [progressPercent, progressAnim]);

  return (
    <View style={styles.progressContainer}>
      {/* Header */}
      <View style={styles.progressHeader}>
        <Text style={styles.progressTitle}>Scanning...</Text>
      )}
        <Text style={styles.progressPercent}>{Math.round(progressPercent)}%</Text>
      </View>

      {/* Progress bar */}
      <View style={styles.progressBarBg}>
        <Animated.View
          style={[
            styles.progressBarFill,
            {
              width: progressAnim.interpolate({
                inputRange: [0, 100],
                outputRange: ['0%', '100%'],
              }),
            },
          ]}
        />
      </View>

      {/* Footer */}
      <View style={styles.progressFooter}>
        <Text style={styles.progressCurrent} numberOfLines={1}>
          {currentSymbol ? `Scanning: ${currentSymbol}` : 'Initializing...'}
        </Text>
        <Text style={styles.progressStats}>
          {progress}/{total} coins{patternsFound > 0 ? ` \u2022 ${patternsFound} patterns` : ''}
        </Text>
      </View>
    </View>
  );
};

// ========================================
// COIN CARD SKELETON
// ========================================

export const CoinCardSkeleton = () => (
  <View style={styles.coinCard}>
    {/* Icon */}
    <ShimmerPlaceholder width={40} height={40} borderRadius={20} />

    {/* Info */}
    <View style={styles.coinInfo}>
      <ShimmerPlaceholder width={70} height={14} borderRadius={3} marginBottom={4} />
      <ShimmerPlaceholder width={50} height={12} borderRadius={3} />
    </View>

    {/* Price */}
    <View style={styles.coinPrice}>
      <ShimmerPlaceholder width={65} height={14} borderRadius={3} marginBottom={4} />
      <ShimmerPlaceholder width={45} height={12} borderRadius={3} />
    </View>
  </View>
);

// ========================================
// COIN LIST SKELETON
// ========================================

export const CoinListSkeleton = ({ count = 5 }) => (
  <View style={styles.coinListContainer}>
    {[...Array(count)].map((_, i) => (
      <CoinCardSkeleton key={`coin-skeleton-${i}`} />
    ))}
  </View>
);

// ========================================
// STYLES
// ========================================

const styles = StyleSheet.create({
  // Chart skeleton
  chartContainer: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: 10,
    position: 'relative',
  },
  priceAxis: {
    position: 'absolute',
    right: 10,
    top: 20,
    bottom: 40,
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    zIndex: 1,
  },
  chartArea: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    paddingRight: 55,
    paddingBottom: 30,
    paddingTop: 10,
  },
  candleColumn: {
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  timeAxis: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingRight: 55,
    marginTop: 5,
  },
  zonePlaceholder: {
    position: 'absolute',
    right: 80,
    top: 70,
  },

  // Pattern card skeleton
  patternCard: {
    backgroundColor: COLORS.shimmerBase,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  patternHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  patternBody: {
    marginBottom: 12,
  },
  patternRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  patternFooter: {
    alignItems: 'flex-end',
  },

  // List skeleton
  listContainer: {
    padding: 12,
  },

  // Zone info skeleton
  zoneInfo: {
    backgroundColor: 'rgba(17, 34, 80, 0.95)',
    borderRadius: 8,
    padding: 12,
    minWidth: 150,
  },
  zoneRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  zoneRowLast: {
    marginBottom: 0,
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },

  // Scan progress skeleton
  progressContainer: {
    backgroundColor: COLORS.shimmerBase,
    borderRadius: 12,
    padding: 14,
    marginHorizontal: 12,
    marginVertical: 8,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  progressTitle: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  progressPercent: {
    color: COLORS.accent,
    fontSize: 17,
    fontWeight: 'bold',
  },
  progressBarBg: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: COLORS.accent,
    borderRadius: 3,
  },
  progressFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  progressCurrent: {
    color: COLORS.text,
    fontSize: 12,
    flex: 1,
  },
  progressStats: {
    color: '#666',
    fontSize: 12,
  },

  // Coin card skeleton
  coinCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.shimmerBase,
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
  },
  coinInfo: {
    flex: 1,
    marginLeft: 12,
  },
  coinPrice: {
    alignItems: 'flex-end',
  },
  coinListContainer: {
    padding: 12,
  },
});

// ========================================
// DEFAULT EXPORT
// ========================================

const SkeletonLoader = {
  Chart: ChartSkeleton,
  PatternCard: PatternCardSkeleton,
  PatternList: PatternListSkeleton,
  ZoneInfo: ZoneInfoSkeleton,
  ScanProgress: ScanProgressSkeleton,
  CoinCard: CoinCardSkeleton,
  CoinList: CoinListSkeleton,
  Shimmer: ShimmerPlaceholder,
};

export default SkeletonLoader;
