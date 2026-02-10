// ============================================================
// FEATURE LOCK OVERLAY
// Purpose: Overlay blur cho locked features
// ============================================================

import React, { useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Lock, ArrowRight, Crown, Sparkles } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useSettings } from '../../contexts/SettingsContext';

const FeatureLockOverlay = ({
  title = 'Tính năng Premium',
  subtitle = 'Nâng cấp để mở khóa',
  tierType = 'scanner',
  tierLevel = 2,
  ctaText = 'Mở khóa ngay',
  icon = 'lock', // lock, crown, sparkles
  children,
  style,
  blurIntensity = 15,
  onUnlock,
}) => {
  const navigation = useNavigation();
  const { colors, gradients, glass, settings, SPACING, TYPOGRAPHY, t } = useSettings();

  const handleUnlock = () => {
    if (onUnlock) {
      onUnlock();
      return;
    }

    navigation.navigate('UpgradeScreen', {
      tierType,
      requiredLevel: tierLevel,
      source: 'feature_lock',
    });
  };

  const IconComponent = icon === 'crown' ? Crown : icon === 'sparkles' ? Sparkles : Lock;

  const styles = useMemo(() => StyleSheet.create({
    container: {
      position: 'relative',
      borderRadius: 16,
      overflow: 'hidden',
    },
    contentContainer: {
      position: 'relative',
    },
    blur: {
      ...StyleSheet.absoluteFillObject,
    },
    overlay: {
      ...StyleSheet.absoluteFillObject,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: settings.theme === 'light' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(10, 10, 26, 0.7)',
      padding: SPACING.lg,
    },
    lockContainer: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: 'rgba(255, 189, 89, 0.15)',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: SPACING.md,
    },
    title: {
      fontSize: TYPOGRAPHY.fontSize.xl,
      fontWeight: TYPOGRAPHY.fontWeight.bold,
      color: colors.textPrimary,
      textAlign: 'center',
      marginBottom: SPACING.xs,
    },
    subtitle: {
      fontSize: TYPOGRAPHY.fontSize.md,
      color: colors.textSecondary,
      textAlign: 'center',
      marginBottom: SPACING.lg,
    },
    unlockButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.gold,
      paddingVertical: SPACING.sm,
      paddingHorizontal: SPACING.lg,
      borderRadius: 25,
      gap: SPACING.xs,
    },
    unlockText: {
      fontSize: TYPOGRAPHY.fontSize.md,
      fontWeight: TYPOGRAPHY.fontWeight.bold,
      color: colors.bgDarkest,
    },

    // Lock badge styles
    lockBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(255, 189, 89, 0.2)',
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 4,
      gap: 3,
    },
    lockBadgeMedium: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6,
      gap: 4,
    },
    lockBadgeText: {
      fontSize: 9,
      fontWeight: TYPOGRAPHY.fontWeight.bold,
      color: colors.gold,
    },
    lockBadgeTextMedium: {
      fontSize: 11,
    },

    // Lock icon styles
    lockIconContainer: {
      position: 'relative',
    },
    tooltip: {
      position: 'absolute',
      bottom: '100%',
      left: '50%',
      transform: [{ translateX: -50 }],
      backgroundColor: settings.theme === 'light' ? colors.bgDarkest : (glass.background || 'rgba(15, 16, 48, 0.95)'),
      paddingHorizontal: SPACING.sm,
      paddingVertical: SPACING.xs,
      borderRadius: 6,
      marginBottom: 4,
    },
    tooltipText: {
      fontSize: TYPOGRAPHY.fontSize.xs,
      color: colors.textSecondary,
      whiteSpace: 'nowrap',
    },
  }), [colors, settings.theme, glass, SPACING, TYPOGRAPHY]);

  return (
    <View style={[styles.container, style]}>
      {/* Blurred content */}
      <View style={styles.contentContainer}>
        {children}
        <BlurView intensity={blurIntensity} style={styles.blur} tint="dark" />
      </View>

      {/* Lock overlay */}
      <View style={styles.overlay}>
        <View style={styles.lockContainer}>
          <IconComponent size={32} color={colors.gold} />
        </View>

        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>

        <TouchableOpacity
          style={styles.unlockButton}
          onPress={handleUnlock}
          activeOpacity={0.8}
        >
          <Text style={styles.unlockText}>{ctaText}</Text>
          <ArrowRight size={18} color={colors.bgDarkest} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

/**
 * Compact lock badge - for smaller elements
 */
export const LockBadge = ({
  tierName = 'PRO',
  size = 'small', // small, medium
  onPress,
}) => {
  const navigation = useNavigation();
  const { colors, gradients, glass, settings, SPACING, TYPOGRAPHY, t } = useSettings();

  const styles = useMemo(() => StyleSheet.create({
    lockBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(255, 189, 89, 0.2)',
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 4,
      gap: 3,
    },
    lockBadgeMedium: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6,
      gap: 4,
    },
    lockBadgeText: {
      fontSize: 9,
      fontWeight: TYPOGRAPHY.fontWeight.bold,
      color: colors.gold,
    },
    lockBadgeTextMedium: {
      fontSize: 11,
    },
  }), [colors, settings.theme, glass, SPACING, TYPOGRAPHY]);

  const handlePress = () => {
    if (onPress) {
      onPress();
      return;
    }
    navigation.navigate('UpgradeScreen');
  };

  return (
    <TouchableOpacity
      style={[
        styles.lockBadge,
        size === 'medium' && styles.lockBadgeMedium,
      ]}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <Lock size={size === 'medium' ? 14 : 10} color={colors.gold} />
      <Text style={[
        styles.lockBadgeText,
        size === 'medium' && styles.lockBadgeTextMedium,
      ]}>
        {tierName}
      </Text>
    </TouchableOpacity>
  );
};

/**
 * Lock icon with tooltip
 */
export const LockIcon = ({
  size = 16,
  tooltip = 'Cần nâng cấp',
  showTooltip = false,
}) => {
  const { colors, gradients, glass, settings, SPACING, TYPOGRAPHY, t } = useSettings();

  const styles = useMemo(() => StyleSheet.create({
    lockIconContainer: {
      position: 'relative',
    },
    tooltip: {
      position: 'absolute',
      bottom: '100%',
      left: '50%',
      transform: [{ translateX: -50 }],
      backgroundColor: settings.theme === 'light' ? colors.bgDarkest : (glass.background || 'rgba(15, 16, 48, 0.95)'),
      paddingHorizontal: SPACING.sm,
      paddingVertical: SPACING.xs,
      borderRadius: 6,
      marginBottom: 4,
    },
    tooltipText: {
      fontSize: TYPOGRAPHY.fontSize.xs,
      color: colors.textSecondary,
      whiteSpace: 'nowrap',
    },
  }), [colors, settings.theme, glass, SPACING, TYPOGRAPHY]);

  return (
    <View style={styles.lockIconContainer}>
      <Lock size={size} color={colors.gold} />
      {showTooltip && (
        <View style={styles.tooltip}>
          <Text style={styles.tooltipText}>{tooltip}</Text>
        </View>
      )}
    </View>
  );
};

export default FeatureLockOverlay;
