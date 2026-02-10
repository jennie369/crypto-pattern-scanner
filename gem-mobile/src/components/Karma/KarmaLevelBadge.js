/**
 * KarmaLevelBadge - Badge displaying karma level with icon
 */

import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { UserX, GraduationCap, Sword, Crown, Shield } from 'lucide-react-native';
import { useSettings } from '../../contexts/SettingsContext';
import { KARMA_LEVEL_THRESHOLDS } from '../../services/karmaService';

const KarmaLevelBadge = ({
  level = 'student',
  size = 'medium',
  showLabel = true,
  showPoints = false,
  karmaPoints = 0,
  style,
}) => {
  const { colors, gradients, glass, settings, SPACING, TYPOGRAPHY, t } = useSettings();
  const levelConfig = KARMA_LEVEL_THRESHOLDS[level] || KARMA_LEVEL_THRESHOLDS.student;

  // Size configurations
  const sizes = {
    small: { container: 28, icon: 14, fontSize: TYPOGRAPHY.sizes.xs, padding: SPACING.xs },
    medium: { container: 40, icon: 20, fontSize: TYPOGRAPHY.sizes.sm, padding: SPACING.sm },
    large: { container: 56, icon: 28, fontSize: TYPOGRAPHY.sizes.md, padding: SPACING.md },
  };

  const sizeConfig = sizes[size] || sizes.medium;

  // Get icon component
  const getIcon = () => {
    const iconProps = {
      size: sizeConfig.icon,
      color: colors.textPrimary,
      strokeWidth: 2,
    };

    switch (level) {
      case 'novice':
        return <UserX {...iconProps} />;
      case 'student':
        return <GraduationCap {...iconProps} />;
      case 'warrior':
        return <Sword {...iconProps} />;
      case 'master':
        return <Crown {...iconProps} />;
      case 'guardian':
        return <Shield {...iconProps} />;
      default:
        return <GraduationCap {...iconProps} />;
    }
  };

  // Get gradient colors
  const getGradientColors = () => {
    switch (level) {
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

  const styles = useMemo(() => StyleSheet.create({
    container: {
      borderRadius: SPACING.lg,
      overflow: 'hidden',
      alignSelf: 'flex-start',
    },
    gradient: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.sm,
    },
    iconOnly: {
      overflow: 'hidden',
    },
    iconGradient: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    iconContainer: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    textContent: {
      gap: 2,
    },
    levelLabel: {
      fontWeight: '700',
    },
    pointsText: {
      color: colors.textMuted,
    },
  }), [colors, settings.theme, glass, SPACING, TYPOGRAPHY]);

  // Icon only
  if (!showLabel && !showPoints) {
    return (
      <View
        style={[
          styles.iconOnly,
          {
            width: sizeConfig.container,
            height: sizeConfig.container,
            borderRadius: sizeConfig.container / 2,
          },
          style,
        ]}
      >
        <LinearGradient
          colors={getGradientColors()}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.iconGradient,
            {
              width: sizeConfig.container,
              height: sizeConfig.container,
              borderRadius: sizeConfig.container / 2,
            },
          ]}
        >
          {getIcon()}
        </LinearGradient>
      </View>
    );
  }

  // Full badge
  return (
    <View style={[styles.container, style]}>
      <LinearGradient
        colors={[...getGradientColors().map(c => c + '20')]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[
          styles.gradient,
          { paddingVertical: sizeConfig.padding, paddingHorizontal: sizeConfig.padding + 4 },
        ]}
      >
        {/* Icon */}
        <View
          style={[
            styles.iconContainer,
            {
              width: sizeConfig.container,
              height: sizeConfig.container,
              borderRadius: sizeConfig.container / 2,
              backgroundColor: levelConfig.color + '30',
            },
          ]}
        >
          {getIcon()}
        </View>

        {/* Text content */}
        <View style={styles.textContent}>
          {showLabel && (
            <Text
              style={[
                styles.levelLabel,
                { fontSize: sizeConfig.fontSize, color: levelConfig.color },
              ]}
            >
              {levelConfig.name}
            </Text>
          )}
          {showPoints && (
            <Text
              style={[
                styles.pointsText,
                { fontSize: sizeConfig.fontSize - 2 },
              ]}
            >
              {karmaPoints.toLocaleString()} Karma
            </Text>
          )}
        </View>
      </LinearGradient>
    </View>
  );
};

export default KarmaLevelBadge;
