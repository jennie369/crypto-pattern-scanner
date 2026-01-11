/**
 * HexagramBuilder Component
 * Animated hexagram line display (6 lines, bottom to top)
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSequence,
  withSpring,
  Easing,
} from 'react-native-reanimated';
import { COLORS, SPACING, TYPOGRAPHY } from '../../utils/tokens';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const LINE_WIDTH = SCREEN_WIDTH * 0.5;
const LINE_HEIGHT = 14;
const LINE_GAP = 8;

const HexagramBuilder = ({
  lines = [], // Array of { lineType: 'yang'|'yin', isChanging: boolean }
  showLabels = true,
  animated = true,
  size = 'normal', // 'small' | 'normal' | 'large'
}) => {
  // Calculate dimensions based on size
  const dimensions = {
    small: { width: LINE_WIDTH * 0.6, height: 10, gap: 6 },
    normal: { width: LINE_WIDTH, height: LINE_HEIGHT, gap: LINE_GAP },
    large: { width: LINE_WIDTH * 1.2, height: 18, gap: 10 },
  }[size];

  // Render a single line
  const HexagramLine = ({ line, index, total }) => {
    const opacity = useSharedValue(animated ? 0 : 1);
    const scaleX = useSharedValue(animated ? 0 : 1);
    const glowOpacity = useSharedValue(0);

    useEffect(() => {
      if (animated && line) {
        // Animate line appearance (bottom to top) - FAST animation
        const delay = (total - 1 - index) * 80; // 80ms between lines (was 300ms)
        opacity.value = withDelay(delay, withTiming(1, { duration: 120 })); // Fast fade in
        scaleX.value = withDelay(delay, withSpring(1, { damping: 15, stiffness: 200 })); // Snappy spring

        // Glow effect for changing lines - shorter animation
        if (line.isChanging) {
          glowOpacity.value = withDelay(
            delay + 100,
            withSequence(
              withTiming(1, { duration: 150 }),
              withTiming(0.4, { duration: 200 })
            )
          );
        }
      }
    }, [line, index, total, animated, opacity, scaleX, glowOpacity]);

    const lineStyle = useAnimatedStyle(() => ({
      opacity: opacity.value,
      transform: [{ scaleX: scaleX.value }],
    }));

    const glowStyle = useAnimatedStyle(() => ({
      opacity: glowOpacity.value,
    }));

    if (!line) {
      // Empty placeholder
      return (
        <View style={[styles.lineWrapper, { marginBottom: dimensions.gap }]}>
          <View style={[styles.emptyLine, { width: dimensions.width, height: dimensions.height }]} />
          {showLabels && (
            <Text style={styles.lineLabel}>{index + 1}</Text>
          )}
        </View>
      );
    }

    const isYang = line.lineType === 'yang';
    const isChanging = line.isChanging;

    return (
      <View style={[styles.lineWrapper, { marginBottom: dimensions.gap }]}>
        <View style={styles.lineContainer}>
          {/* Glow effect for changing lines */}
          {isChanging && (
            <Animated.View style={[styles.lineGlow, glowStyle, { width: dimensions.width + 20 }]} />
          )}

          {/* The actual line */}
          <Animated.View style={[styles.line, lineStyle, { width: dimensions.width }]}>
            {isYang ? (
              // Yang: solid line
              <View
                style={[
                  styles.yangLine,
                  { height: dimensions.height },
                  isChanging && styles.changingLine,
                ]}
              />
            ) : (
              // Yin: broken line (two segments with gap)
              <View style={styles.yinContainer}>
                <View
                  style={[
                    styles.yinSegment,
                    { height: dimensions.height, width: (dimensions.width - 20) / 2 },
                    isChanging && styles.changingLine,
                  ]}
                />
                <View style={[styles.yinGap, { width: 20 }]} />
                <View
                  style={[
                    styles.yinSegment,
                    { height: dimensions.height, width: (dimensions.width - 20) / 2 },
                    isChanging && styles.changingLine,
                  ]}
                />
              </View>
            )}
          </Animated.View>
        </View>

        {/* Line label */}
        {showLabels && (
          <View style={styles.labelContainer}>
            <Text style={styles.lineLabel}>{index + 1}</Text>
            {isChanging && (
              <Text style={styles.changingLabel}>Động</Text>
            )}
          </View>
        )}
      </View>
    );
  };

  // Ensure we have 6 lines (fill with null for empty)
  const displayLines = [...lines];
  while (displayLines.length < 6) {
    displayLines.push(null);
  }

  // Reverse for display (line 6 at top, line 1 at bottom)
  const reversedLines = [...displayLines].reverse();

  return (
    <View style={styles.container}>
      {reversedLines.map((line, index) => (
        <HexagramLine
          key={index}
          line={line}
          index={5 - index} // Real line number (1-6)
          total={6}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  lineWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lineContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  line: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyLine: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 189, 89, 0.15)',
    borderStyle: 'dashed',
  },
  yangLine: {
    width: '100%',
    backgroundColor: COLORS.gold,
    borderRadius: 6,
  },
  yinContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  yinSegment: {
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
    borderRadius: 6,
  },
  yinGap: {
    // Gap is just spacing
  },
  changingLine: {
    borderWidth: 1.5,
    borderColor: COLORS.gold,
    shadowColor: COLORS.gold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 6,
    elevation: 4,
  },
  lineGlow: {
    position: 'absolute',
    height: 30,
    backgroundColor: COLORS.gold,
    borderRadius: 15,
    opacity: 0.2,
  },
  labelContainer: {
    marginLeft: SPACING.md,
    alignItems: 'flex-start',
    width: 60,
  },
  lineLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  changingLabel: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.gold,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    marginTop: 2,
  },
});

export default HexagramBuilder;
