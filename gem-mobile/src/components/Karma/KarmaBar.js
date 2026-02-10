/**
 * KarmaBar - Progress bar showing karma points with level colors
 */

import React, { useEffect, useRef, useMemo } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { TrendingUp, TrendingDown } from 'lucide-react-native';
import { useSettings } from '../../contexts/SettingsContext';
import { KARMA_LEVEL_THRESHOLDS } from '../../services/karmaService';

const KarmaBar = ({
  karmaPoints = 200,
  karmaLevel = 'student',
  previousKarma = null,
  showChange = true,
  showLevelInfo = true,
  compact = false,
  animated = true,
  style,
}) => {
  const { colors, gradients, glass, settings, SPACING, TYPOGRAPHY, t } = useSettings();
  const progressAnim = useRef(new Animated.Value(0)).current;
  const changeAnim = useRef(new Animated.Value(0)).current;

  const levelConfig = KARMA_LEVEL_THRESHOLDS[karmaLevel] || KARMA_LEVEL_THRESHOLDS.student;
  const karmaChange = previousKarma !== null ? karmaPoints - previousKarma : 0;

  // Calculate progress percentage
  const calculateProgress = () => {
    const min = levelConfig.min;
    const max = levelConfig.max;

    if (karmaLevel === 'guardian') {
      // Guardian: show progress beyond 1000
      return Math.min(100, ((karmaPoints - 1000) / 500) * 100);
    }

    const range = max - min + 1;
    return Math.min(100, Math.max(0, ((karmaPoints - min) / range) * 100));
  };

  const progress = calculateProgress();

  // Get gradient colors based on level
  const getLevelGradient = () => {
    switch (karmaLevel) {
      case 'novice':
        return ['#6B7280', '#4B5563'];
      case 'student':
        return ['#3B82F6', '#2563EB'];
      case 'warrior':
        return ['#F59E0B', '#D97706'];
      case 'master':
        return ['#8B5CF6', '#7C3AED'];
      case 'guardian':
        return ['#FFD700', '#FFA500'];
      default:
        return ['#3B82F6', '#2563EB'];
    }
  };

  // Progress animation
  useEffect(() => {
    if (animated) {
      Animated.spring(progressAnim, {
        toValue: progress,
        friction: 8,
        tension: 40,
        useNativeDriver: false,
      }).start();
    } else {
      progressAnim.setValue(progress);
    }
  }, [progress, animated]);

  // Change indicator animation
  useEffect(() => {
    if (karmaChange !== 0 && showChange) {
      Animated.sequence([
        Animated.timing(changeAnim, {
          toValue: 1,
          duration: 300,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.delay(2000),
        Animated.timing(changeAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [karmaChange]);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  const styles = useMemo(() => StyleSheet.create({
    container: {
      width: '100%',
    },
    containerCompact: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.sm,
    },
    levelInfo: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: SPACING.sm,
    },
    levelName: {
      fontSize: TYPOGRAPHY.sizes.md,
      fontWeight: '600',
    },
    pointsContainer: {
      flexDirection: 'row',
      alignItems: 'baseline',
    },
    pointsValue: {
      color: colors.textPrimary,
      fontSize: TYPOGRAPHY.sizes.xl,
      fontWeight: '700',
    },
    pointsLabel: {
      color: colors.textMuted,
      fontSize: TYPOGRAPHY.sizes.sm,
    },
    progressContainer: {
      position: 'relative',
    },
    progressContainerCompact: {
      flex: 1,
    },
    progressTrack: {
      height: 8,
      backgroundColor: settings.theme === 'light' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)',
      borderRadius: 4,
      overflow: 'hidden',
    },
    progressFill: {
      height: '100%',
      borderRadius: 4,
      overflow: 'hidden',
    },
    progressGradient: {
      flex: 1,
    },
    shine: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: '50%',
      backgroundColor: 'rgba(255, 255, 255, 0.15)',
    },
    changeIndicator: {
      position: 'absolute',
      right: 0,
      top: -20,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: settings.theme === 'light' ? colors.bgDarkest : (glass.background || 'rgba(15, 16, 48, 0.9)'),
      paddingHorizontal: SPACING.sm,
      paddingVertical: SPACING.xxs,
      borderRadius: SPACING.sm,
      gap: 2,
    },
    changeText: {
      fontSize: TYPOGRAPHY.sizes.sm,
      fontWeight: '700',
    },
    rangeInfo: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: SPACING.xs,
    },
    rangeText: {
      color: colors.textMuted,
      fontSize: TYPOGRAPHY.sizes.xs,
    },
    compactPoints: {
      minWidth: 50,
      alignItems: 'flex-end',
    },
    compactValue: {
      fontSize: TYPOGRAPHY.sizes.md,
      fontWeight: '700',
    },
  }), [colors, settings.theme, glass, SPACING, TYPOGRAPHY]);

  return (
    <View style={[styles.container, compact && styles.containerCompact, style]}>
      {/* Level info */}
      {showLevelInfo && !compact && (
        <View style={styles.levelInfo}>
          <Text style={[styles.levelName, { color: levelConfig.color }]}>
            {levelConfig.name}
          </Text>
          <View style={styles.pointsContainer}>
            <Text style={styles.pointsValue}>{karmaPoints.toLocaleString()}</Text>
            <Text style={styles.pointsLabel}> Karma</Text>
          </View>
        </View>
      )}

      {/* Progress bar */}
      <View style={[styles.progressContainer, compact && styles.progressContainerCompact]}>
        {/* Background track */}
        <View style={styles.progressTrack}>
          {/* Progress fill */}
          <Animated.View
            style={[
              styles.progressFill,
              { width: progressWidth },
            ]}
          >
            <LinearGradient
              colors={getLevelGradient()}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.progressGradient}
            />
          </Animated.View>

          {/* Shine effect */}
          <View style={styles.shine} />
        </View>

        {/* Change indicator */}
        {showChange && karmaChange !== 0 && (
          <Animated.View
            style={[
              styles.changeIndicator,
              {
                opacity: changeAnim,
                transform: [{
                  translateY: changeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [10, 0],
                  }),
                }],
              },
            ]}
          >
            {karmaChange > 0 ? (
              <TrendingUp size={14} color={colors.success} strokeWidth={2} />
            ) : (
              <TrendingDown size={14} color={colors.error} strokeWidth={2} />
            )}
            <Text
              style={[
                styles.changeText,
                { color: karmaChange > 0 ? colors.success : colors.error },
              ]}
            >
              {karmaChange > 0 ? '+' : ''}{karmaChange}
            </Text>
          </Animated.View>
        )}
      </View>

      {/* Level range */}
      {showLevelInfo && !compact && (
        <View style={styles.rangeInfo}>
          <Text style={styles.rangeText}>{levelConfig.min}</Text>
          <Text style={styles.rangeText}>
            {karmaLevel === 'guardian' ? '∞' : levelConfig.max}
          </Text>
        </View>
      )}

      {/* Compact points display */}
      {compact && (
        <View style={styles.compactPoints}>
          <Text style={[styles.compactValue, { color: levelConfig.color }]}>
            {karmaPoints}
          </Text>
        </View>
      )}
    </View>
  );
};

export default KarmaBar;
