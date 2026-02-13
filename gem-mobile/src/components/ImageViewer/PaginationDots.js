/**
 * Pagination Dots Component
 * Dot indicators for image gallery
 * Phase 2: Image Viewer Enhancement (30/12/2024)
 */

import React, { memo } from 'react';
import {
  StyleSheet,
  View,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import { COLORS, SPACING } from '../../utils/tokens';

const DOT_SIZE = 8;
const DOT_SPACING = 8;
const ACTIVE_DOT_WIDTH = 24;

/**
 * PaginationDots - Pagination indicator
 *
 * @param {Object} props
 * @param {number} props.total - Total number of items
 * @param {number} props.currentIndex - Current index
 * @param {SharedValue} props.scrollX - Animated scroll position (optional)
 * @param {number} props.itemWidth - Width of each item for scroll calculation
 */
const PaginationDots = ({
  total,
  currentIndex,
  scrollX,
  itemWidth,
}) => {
  if (total <= 1) return null;

  // Limit dots shown (max 5 visible at a time for many items)
  const maxDotsVisible = 5;
  const showDots = total <= maxDotsVisible;

  return (
    <View style={styles.container}>
      {showDots ? (
        // Show individual dots
        Array.from({ length: total }).map((_, index) => (
          <PaginationDot
            key={index}
            index={index}
            currentIndex={currentIndex}
            scrollX={scrollX}
            itemWidth={itemWidth}
          />
        ))
      ) : (
        // Show compact indicator for many items
        <View style={styles.compactIndicator}>
          <View
            style={[
              styles.compactProgress,
              {
                width: `${((currentIndex + 1) / total) * 100}%`,
              },
            ]}
          />
        </View>
      )}
    </View>
  );
};

/**
 * Individual pagination dot
 */
const PaginationDot = memo(({ index, currentIndex, scrollX, itemWidth }) => {
  const animatedStyle = useAnimatedStyle(() => {
    if (scrollX && itemWidth) {
      // Animated based on scroll
      const inputRange = [
        (index - 1) * itemWidth,
        index * itemWidth,
        (index + 1) * itemWidth,
      ];

      const width = interpolate(
        scrollX.value,
        inputRange,
        [DOT_SIZE, ACTIVE_DOT_WIDTH, DOT_SIZE],
        Extrapolate.CLAMP
      );

      const opacity = interpolate(
        scrollX.value,
        inputRange,
        [0.5, 1, 0.5],
        Extrapolate.CLAMP
      );

      return { width, opacity };
    }

    // Static based on currentIndex
    const isActive = index === currentIndex;
    return {
      width: isActive ? ACTIVE_DOT_WIDTH : DOT_SIZE,
      opacity: isActive ? 1 : 0.5,
    };
  }, [index, currentIndex]);

  return (
    <Animated.View
      style={[
        styles.dot,
        animatedStyle,
      ]}
    />
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
  },
  dot: {
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
    backgroundColor: COLORS.gold,
    marginHorizontal: DOT_SPACING / 2,
  },
  compactIndicator: {
    width: 60,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  compactProgress: {
    height: '100%',
    backgroundColor: COLORS.gold,
    borderRadius: 2,
  },
});

export default memo(PaginationDots);
