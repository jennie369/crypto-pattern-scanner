/**
 * ProgressRing - Circular progress indicator with glow effects
 * Uses SVG for smooth rendering
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';

import {
  COSMIC_COLORS,
  COSMIC_TYPOGRAPHY,
} from '../../../theme/cosmicTokens';
import { COSMIC_TIMING } from '../../../utils/cosmicAnimations';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

// ============================================
// MAIN COMPONENT
// ============================================

const ProgressRing = ({
  progress = 0, // 0 to 1
  size = 120,
  strokeWidth = 8,
  color = COSMIC_COLORS.glow.cyan,
  secondaryColor = null, // For gradient
  backgroundColor = 'rgba(255, 255, 255, 0.1)',
  showPercentage = true,
  showGlow = true,
  animated = true,
  duration = 500,
  children,
  style,
}) => {
  // Animation value
  const animatedProgress = useSharedValue(0);

  // Calculate circle properties
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const center = size / 2;

  // Update animation when progress changes
  useEffect(() => {
    if (animated) {
      animatedProgress.value = withTiming(progress, {
        duration,
        easing: COSMIC_TIMING.easing.smoothOut,
      });
    } else {
      animatedProgress.value = progress;
    }
  }, [progress, animated, duration]);

  // Animated props for the progress circle
  const animatedProps = useAnimatedProps(() => {
    const strokeDashoffset = circumference * (1 - animatedProgress.value);
    return {
      strokeDashoffset,
    };
  });

  // Gradient ID
  const gradientId = `progressGradient-${Math.random().toString(36).substr(2, 9)}`;

  // Determine if using gradient
  const useGradient = !!secondaryColor;

  return (
    <View style={[styles.container, { width: size, height: size }, style]}>
      {/* Glow effect */}
      {showGlow && (
        <View
          style={[
            styles.glow,
            {
              width: size + 20,
              height: size + 20,
              borderRadius: (size + 20) / 2,
              backgroundColor: color,
              opacity: 0.2,
              shadowColor: color,
              shadowOpacity: 0.5,
              shadowRadius: 20,
            },
          ]}
        />
      )}

      <Svg width={size} height={size} style={styles.svg}>
        {/* Gradient definition */}
        {useGradient && (
          <Defs>
            <SvgLinearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor={color} />
              <Stop offset="100%" stopColor={secondaryColor} />
            </SvgLinearGradient>
          </Defs>
        )}

        {/* Background circle */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={backgroundColor}
          strokeWidth={strokeWidth}
          fill="transparent"
        />

        {/* Progress circle */}
        <AnimatedCircle
          cx={center}
          cy={center}
          r={radius}
          stroke={useGradient ? `url(#${gradientId})` : color}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          animatedProps={animatedProps}
          strokeLinecap="round"
          transform={`rotate(-90 ${center} ${center})`}
        />
      </Svg>

      {/* Center content */}
      <View style={styles.centerContent}>
        {children ? (
          children
        ) : showPercentage ? (
          <ProgressPercentage progress={progress} animated={animated} duration={duration} />
        ) : null}
      </View>
    </View>
  );
};

// ============================================
// PERCENTAGE DISPLAY
// ============================================

const ProgressPercentage = ({ progress, animated, duration }) => {
  const animatedProgress = useSharedValue(0);

  useEffect(() => {
    if (animated) {
      animatedProgress.value = withTiming(progress, {
        duration,
        easing: COSMIC_TIMING.easing.smoothOut,
      });
    } else {
      animatedProgress.value = progress;
    }
  }, [progress, animated, duration]);

  const percentage = Math.round(progress * 100);

  return (
    <Text style={styles.percentage}>
      {percentage}%
    </Text>
  );
};

// ============================================
// RING WITH ICON
// ============================================

export const ProgressRingWithIcon = ({
  progress,
  size = 80,
  strokeWidth = 6,
  color,
  icon, // Lucide icon element
  iconSize = 32,
  ...props
}) => {
  return (
    <ProgressRing
      progress={progress}
      size={size}
      strokeWidth={strokeWidth}
      color={color}
      showPercentage={false}
      {...props}
    >
      {icon && React.cloneElement(icon, {
        size: iconSize,
        color: COSMIC_COLORS.text.primary,
        strokeWidth: 1.5,
      })}
    </ProgressRing>
  );
};

// ============================================
// MINI PROGRESS RING
// ============================================

export const MiniProgressRing = ({
  progress,
  size = 40,
  strokeWidth = 3,
  color = COSMIC_COLORS.glow.cyan,
  showPercentage = false,
  style,
}) => {
  return (
    <ProgressRing
      progress={progress}
      size={size}
      strokeWidth={strokeWidth}
      color={color}
      showPercentage={showPercentage}
      showGlow={false}
      animated={true}
      duration={300}
      style={style}
    />
  );
};

// ============================================
// STACKED PROGRESS RINGS
// ============================================

export const StackedProgressRings = ({
  rings = [], // [{ progress, color, label }]
  size = 120,
  strokeWidth = 6,
  gap = 10,
  showLabels = true,
  style,
}) => {
  return (
    <View style={[styles.stackedContainer, style]}>
      <View style={[styles.ringsWrapper, { width: size, height: size }]}>
        {rings.map((ring, index) => {
          const ringSize = size - (index * (strokeWidth + gap) * 2);
          const ringRadius = (ringSize - strokeWidth) / 2;

          return (
            <View
              key={index}
              style={[
                styles.stackedRing,
                {
                  position: 'absolute',
                  top: index * (strokeWidth + gap),
                  left: index * (strokeWidth + gap),
                },
              ]}
            >
              <ProgressRing
                progress={ring.progress}
                size={ringSize}
                strokeWidth={strokeWidth}
                color={ring.color}
                showPercentage={false}
                showGlow={index === 0}
              />
            </View>
          );
        })}
      </View>

      {showLabels && (
        <View style={styles.labelsContainer}>
          {rings.map((ring, index) => (
            <View key={index} style={styles.labelRow}>
              <View style={[styles.labelDot, { backgroundColor: ring.color }]} />
              <Text style={styles.labelText}>
                {ring.label}: {Math.round(ring.progress * 100)}%
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  glow: {
    position: 'absolute',
    shadowOffset: { width: 0, height: 0 },
  },
  svg: {
    position: 'absolute',
  },
  centerContent: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  percentage: {
    fontSize: 24,
    fontWeight: '600',
    color: COSMIC_COLORS.text.primary,
  },
  stackedContainer: {
    alignItems: 'center',
  },
  ringsWrapper: {
    position: 'relative',
  },
  stackedRing: {
    position: 'absolute',
  },
  labelsContainer: {
    marginTop: 16,
    alignItems: 'flex-start',
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  labelDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  labelText: {
    fontSize: 12,
    color: COSMIC_COLORS.text.secondary,
  },
});

export default React.memo(ProgressRing);
