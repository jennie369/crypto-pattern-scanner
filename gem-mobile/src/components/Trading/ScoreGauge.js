/**
 * ScoreGauge Component
 * Animated circular gauge for mindset score display
 *
 * Features:
 * - Animated arc fill
 * - Color zones based on score
 * - Animated number counter
 * - Inner breakdown display
 *
 * Created: December 13, 2025
 */

import React, { useEffect, useRef, useMemo } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import Svg, { Circle, Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import { COLORS, SPACING, TYPOGRAPHY, GLASS } from '../../utils/tokens';
import { SCORE_COLORS, SCORE_THRESHOLDS } from '../../services/mindsetAdvisorService';

const AnimatedPath = Animated.createAnimatedComponent(Path);

const ScoreGauge = ({
  score = 0,
  size = 180,
  strokeWidth = 12,
  breakdown = null,
  showBreakdown = true,
  animated = true,
  duration = 1000,
}) => {
  // Animation values
  const animatedScore = useRef(new Animated.Value(0)).current;
  const animatedProgress = useRef(new Animated.Value(0)).current;

  // Calculate dimensions
  const center = size / 2;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // Score range is 270 degrees (from -225 to 45)
  const startAngle = -225;
  const endAngle = 45;
  const totalAngle = 270;

  // Get color based on score
  const scoreColor = useMemo(() => {
    if (score >= SCORE_THRESHOLDS.READY) return SCORE_COLORS.ready;
    if (score >= SCORE_THRESHOLDS.PREPARE) return SCORE_COLORS.prepare;
    if (score >= SCORE_THRESHOLDS.CAUTION) return SCORE_COLORS.caution;
    return SCORE_COLORS.stop;
  }, [score]);

  // Get status text
  const statusText = useMemo(() => {
    if (score >= SCORE_THRESHOLDS.READY) return 'Sẵn Sàng';
    if (score >= SCORE_THRESHOLDS.PREPARE) return 'Chuẩn Bị';
    if (score >= SCORE_THRESHOLDS.CAUTION) return 'Cẩn Thận';
    return 'Dừng Lại';
  }, [score]);

  // Animation effect
  useEffect(() => {
    if (animated) {
      // Reset
      animatedScore.setValue(0);
      animatedProgress.setValue(0);

      // Animate
      Animated.parallel([
        Animated.timing(animatedScore, {
          toValue: score,
          duration: duration,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: false,
        }),
        Animated.timing(animatedProgress, {
          toValue: score / 100,
          duration: duration,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: false,
        }),
      ]).start();
    } else {
      animatedScore.setValue(score);
      animatedProgress.setValue(score / 100);
    }
  }, [score, animated, duration]);

  // Create arc path
  const createArcPath = (startDeg, endDeg) => {
    const startRad = (startDeg * Math.PI) / 180;
    const endRad = (endDeg * Math.PI) / 180;

    const x1 = center + radius * Math.cos(startRad);
    const y1 = center + radius * Math.sin(startRad);
    const x2 = center + radius * Math.cos(endRad);
    const y2 = center + radius * Math.sin(endRad);

    const largeArcFlag = endDeg - startDeg > 180 ? 1 : 0;

    return `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`;
  };

  // Background arc (full range)
  const backgroundPath = createArcPath(startAngle, endAngle);

  // Progress arc angle
  const progressAngle = startAngle + (totalAngle * score) / 100;
  const progressPath = score > 0 ? createArcPath(startAngle, progressAngle) : '';

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        <Defs>
          <LinearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor={scoreColor} stopOpacity="0.8" />
            <Stop offset="100%" stopColor={scoreColor} stopOpacity="1" />
          </LinearGradient>
        </Defs>

        {/* Background arc */}
        <Path
          d={backgroundPath}
          stroke="rgba(255, 255, 255, 0.1)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="none"
        />

        {/* Score zone markers */}
        {/* 40% marker */}
        <Circle
          cx={center + radius * Math.cos(((startAngle + totalAngle * 0.4) * Math.PI) / 180)}
          cy={center + radius * Math.sin(((startAngle + totalAngle * 0.4) * Math.PI) / 180)}
          r={3}
          fill={SCORE_COLORS.caution}
          opacity={0.5}
        />
        {/* 60% marker */}
        <Circle
          cx={center + radius * Math.cos(((startAngle + totalAngle * 0.6) * Math.PI) / 180)}
          cy={center + radius * Math.sin(((startAngle + totalAngle * 0.6) * Math.PI) / 180)}
          r={3}
          fill={SCORE_COLORS.prepare}
          opacity={0.5}
        />
        {/* 80% marker */}
        <Circle
          cx={center + radius * Math.cos(((startAngle + totalAngle * 0.8) * Math.PI) / 180)}
          cy={center + radius * Math.sin(((startAngle + totalAngle * 0.8) * Math.PI) / 180)}
          r={3}
          fill={SCORE_COLORS.ready}
          opacity={0.5}
        />

        {/* Progress arc */}
        {score > 0 && (
          <Path
            d={progressPath}
            stroke="url(#progressGradient)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            fill="none"
          />
        )}

        {/* End cap glow */}
        {score > 0 && (
          <Circle
            cx={center + radius * Math.cos((progressAngle * Math.PI) / 180)}
            cy={center + radius * Math.sin((progressAngle * Math.PI) / 180)}
            r={strokeWidth / 2 + 4}
            fill={scoreColor}
            opacity={0.3}
          />
        )}
      </Svg>

      {/* Center content */}
      <View style={styles.centerContent}>
        <Animated.Text style={[styles.scoreText, { color: scoreColor }]}>
          {animated
            ? animatedScore.interpolate({
                inputRange: [0, 100],
                outputRange: ['0', '100'],
                extrapolate: 'clamp',
              })
            : Math.round(score)}
        </Animated.Text>
        <Text style={[styles.statusText, { color: scoreColor }]}>{statusText}</Text>

        {/* Breakdown mini display */}
        {showBreakdown && breakdown && (
          <View style={styles.breakdownMini}>
            <View style={styles.breakdownItem}>
              <View style={[styles.breakdownDot, { backgroundColor: '#FF6B9D' }]} />
              <Text style={styles.breakdownLabel}>E</Text>
              <Text style={styles.breakdownValue}>{breakdown.emotional?.score || 0}</Text>
            </View>
            <View style={styles.breakdownItem}>
              <View style={[styles.breakdownDot, { backgroundColor: '#6A5BFF' }]} />
              <Text style={styles.breakdownLabel}>H</Text>
              <Text style={styles.breakdownValue}>{breakdown.history?.score || 0}</Text>
            </View>
            <View style={styles.breakdownItem}>
              <View style={[styles.breakdownDot, { backgroundColor: '#00F0FF' }]} />
              <Text style={styles.breakdownLabel}>D</Text>
              <Text style={styles.breakdownValue}>{breakdown.discipline?.score || 0}</Text>
            </View>
          </View>
        )}
      </View>
    </View>
  );
};

// Animated Score Text component for smooth number animation
const AnimatedScoreText = ({ animatedValue, style }) => {
  const [displayScore, setDisplayScore] = React.useState(0);

  useEffect(() => {
    const listener = animatedValue.addListener(({ value }) => {
      setDisplayScore(Math.round(value));
    });
    return () => animatedValue.removeListener(listener);
  }, [animatedValue]);

  return <Text style={style}>{displayScore}</Text>;
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  centerContent: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },

  scoreText: {
    fontSize: 48,
    fontWeight: '800',
    letterSpacing: -2,
  },

  statusText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },

  breakdownMini: {
    flexDirection: 'row',
    marginTop: SPACING.sm,
    gap: SPACING.md,
  },

  breakdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },

  breakdownDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },

  breakdownLabel: {
    fontSize: 9,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textMuted,
  },

  breakdownValue: {
    fontSize: 10,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textSecondary,
  },
});

export default ScoreGauge;
