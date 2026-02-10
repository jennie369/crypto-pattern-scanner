// ============================================================
// UPGRADE BANNER COMPONENT
// Purpose: Inline banner nhỏ gọn
// ============================================================

import React, { useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import {
  ChevronRight,
  Sparkles,
  Crown,
  Zap,
  Lock,
  Gem,
  TrendingUp,
  AlertCircle,
  ArrowUpCircle,
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useSettings } from '../../contexts/SettingsContext';
import upgradeService from '../../services/upgradeService';

const ICONS = {
  sparkles: Sparkles,
  crown: Crown,
  zap: Zap,
  lock: Lock,
  gem: Gem,
  'trending-up': TrendingUp,
  'alert-circle': AlertCircle,
  'arrow-up-circle': ArrowUpCircle,
};

const UpgradeBanner = ({
  banner,
  tierType,
  style,
  onPress,
  variant = 'default', // default, compact, prominent
}) => {
  const navigation = useNavigation();
  const { colors, gradients, glass, settings, SPACING, TYPOGRAPHY, t } = useSettings();
  const IconComponent = ICONS[banner?.icon_name] || Sparkles;

  const handlePress = async () => {
    if (onPress) {
      onPress();
      return;
    }

    // Track click
    if (banner?.id) {
      await upgradeService.trackClick(
        banner.id,
        banner.trigger_screen,
        tierType,
        null
      );
    }

    // Navigate
    navigation.navigate('UpgradeScreen', {
      tierType: tierType || banner?.target_tier_type,
      source: banner?.trigger_screen,
    });
  };

  const styles = useMemo(() => StyleSheet.create({
    // Default variant
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(255, 189, 89, 0.1)',
      borderRadius: 12,
      padding: SPACING.md,
      borderWidth: 1,
      borderColor: 'rgba(255, 189, 89, 0.2)',
    },
    iconContainer: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: 'rgba(255, 189, 89, 0.15)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    textContainer: {
      flex: 1,
      marginHorizontal: SPACING.sm,
    },
    title: {
      fontSize: TYPOGRAPHY.fontSize.md,
      color: colors.textPrimary,
      fontWeight: TYPOGRAPHY.fontWeight.semibold,
    },
    subtitle: {
      fontSize: TYPOGRAPHY.fontSize.sm,
      color: colors.textSecondary,
      marginTop: 2,
    },
    ctaContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    ctaText: {
      fontSize: TYPOGRAPHY.fontSize.sm,
      color: colors.gold,
      fontWeight: TYPOGRAPHY.fontWeight.semibold,
    },

    // Compact variant
    compactContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(255, 189, 89, 0.1)',
      borderRadius: 8,
      paddingVertical: SPACING.xs,
      paddingHorizontal: SPACING.sm,
      gap: SPACING.xs,
    },
    compactTitle: {
      flex: 1,
      fontSize: TYPOGRAPHY.fontSize.sm,
      color: colors.gold,
      fontWeight: TYPOGRAPHY.fontWeight.medium,
    },

    // Prominent variant
    prominentContainer: {
      backgroundColor: 'rgba(255, 189, 89, 0.15)',
      borderRadius: 16,
      padding: SPACING.lg,
      borderWidth: 1,
      borderColor: colors.gold,
    },
    prominentIconContainer: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: 'rgba(255, 189, 89, 0.2)',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: SPACING.md,
    },
    prominentTextContainer: {
      marginBottom: SPACING.md,
    },
    prominentTitle: {
      fontSize: TYPOGRAPHY.fontSize.xl,
      color: colors.textPrimary,
      fontWeight: TYPOGRAPHY.fontWeight.bold,
      marginBottom: SPACING.xs,
    },
    prominentSubtitle: {
      fontSize: TYPOGRAPHY.fontSize.md,
      color: colors.textSecondary,
    },
    prominentCta: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.gold,
      paddingVertical: SPACING.sm,
      borderRadius: 10,
      gap: SPACING.xs,
    },
    prominentCtaText: {
      fontSize: TYPOGRAPHY.fontSize.md,
      color: colors.bgDarkest,
      fontWeight: TYPOGRAPHY.fontWeight.bold,
    },
  }), [colors, settings.theme, glass, SPACING, TYPOGRAPHY]);

  if (!banner) return null;

  if (variant === 'compact') {
    return (
      <TouchableOpacity
        style={[styles.compactContainer, style]}
        onPress={handlePress}
        activeOpacity={0.8}
      >
        <IconComponent size={16} color={colors.gold} />
        <Text style={styles.compactTitle} numberOfLines={1}>
          {banner.title}
        </Text>
        <ChevronRight size={14} color={colors.gold} />
      </TouchableOpacity>
    );
  }

  if (variant === 'prominent') {
    return (
      <TouchableOpacity
        style={[styles.prominentContainer, style]}
        onPress={handlePress}
        activeOpacity={0.8}
      >
        <View style={styles.prominentIconContainer}>
          <IconComponent size={28} color={colors.gold} />
        </View>
        <View style={styles.prominentTextContainer}>
          <Text style={styles.prominentTitle}>{banner.title}</Text>
          {banner.subtitle && (
            <Text style={styles.prominentSubtitle}>{banner.subtitle}</Text>
          )}
        </View>
        <View style={styles.prominentCta}>
          <Text style={styles.prominentCtaText}>
            {banner.cta_text || 'Xem gói'}
          </Text>
          <ChevronRight size={18} color={colors.bgDarkest} />
        </View>
      </TouchableOpacity>
    );
  }

  // Default variant
  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <View style={styles.iconContainer}>
        <IconComponent size={20} color={colors.gold} />
      </View>

      <View style={styles.textContainer}>
        <Text style={styles.title} numberOfLines={1}>
          {banner.title}
        </Text>
        {banner.subtitle && (
          <Text style={styles.subtitle} numberOfLines={1}>
            {banner.subtitle}
          </Text>
        )}
      </View>

      <View style={styles.ctaContainer}>
        <Text style={styles.ctaText}>
          {banner.cta_text || 'Xem gói'}
        </Text>
        <ChevronRight size={16} color={colors.gold} />
      </View>
    </TouchableOpacity>
  );
};

export default UpgradeBanner;
