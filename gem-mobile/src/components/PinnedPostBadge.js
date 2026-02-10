/**
 * Gemral - Pinned Post Badge Component
 * Feature #20: Visual indicator for pinned posts
 * Uses dark glass theme from DESIGN_TOKENS
 */

import React, { useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Pin, PinOff } from 'lucide-react-native';
import { useSettings } from '../contexts/SettingsContext';

/**
 * Badge to show on pinned posts
 */
export const PinnedBadge = ({ style }) => {
  const { colors, gradients, glass, settings, SPACING, TYPOGRAPHY, t } = useSettings();

  const styles = useMemo(() => StyleSheet.create({
    badge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingVertical: 4,
      paddingHorizontal: SPACING.sm,
      backgroundColor: 'rgba(0, 212, 255, 0.15)',
      borderRadius: 12,
      borderWidth: 1,
      borderColor: 'rgba(0, 212, 255, 0.3)',
    },
    badgeText: {
      fontSize: TYPOGRAPHY.fontSize.xs,
      fontWeight: TYPOGRAPHY.fontWeight.medium,
      color: colors.cyan,
    },
  }), [colors, settings.theme, glass, SPACING, TYPOGRAPHY]);

  return (
    <View style={[styles.badge, style]}>
      <Pin size={12} color={colors.cyan} />
      <Text style={styles.badgeText}>Ghim</Text>
    </View>
  );
};

/**
 * Button to pin/unpin posts
 */
export const PinButton = ({
  isPinned,
  onPress,
  disabled = false,
  showLabel = true,
  size = 'medium',
}) => {
  const { colors, gradients, glass, settings, SPACING, TYPOGRAPHY, t } = useSettings();

  const styles = useMemo(() => StyleSheet.create({
    button: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.xs,
      paddingVertical: SPACING.sm,
      paddingHorizontal: SPACING.md,
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      borderRadius: 8,
      borderWidth: 1,
      borderColor: 'transparent',
    },
    buttonSmall: {
      paddingVertical: SPACING.xs,
      paddingHorizontal: SPACING.sm,
    },
    buttonActive: {
      borderColor: 'rgba(0, 212, 255, 0.3)',
      backgroundColor: 'rgba(0, 212, 255, 0.1)',
    },
    buttonDisabled: {
      opacity: 0.5,
    },
    buttonText: {
      fontSize: TYPOGRAPHY.fontSize.sm,
      color: colors.textMuted,
    },
    buttonTextActive: {
      color: colors.cyan,
    },
  }), [colors, settings.theme, glass, SPACING, TYPOGRAPHY]);

  const iconSize = size === 'small' ? 16 : 20;

  return (
    <TouchableOpacity
      style={[
        styles.button,
        size === 'small' && styles.buttonSmall,
        isPinned && styles.buttonActive,
        disabled && styles.buttonDisabled,
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      {isPinned ? (
        <PinOff size={iconSize} color={colors.cyan} />
      ) : (
        <Pin size={iconSize} color={colors.textMuted} />
      )}
      {showLabel && (
        <Text style={[styles.buttonText, isPinned && styles.buttonTextActive]}>
          {isPinned ? 'Bo ghim' : 'Ghim'}
        </Text>
      )}
    </TouchableOpacity>
  );
};

/**
 * Pinned Posts Section Header
 */
export const PinnedSectionHeader = ({ count = 0 }) => {
  const { colors, gradients, glass, settings, SPACING, TYPOGRAPHY, t } = useSettings();

  const styles = useMemo(() => StyleSheet.create({
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.sm,
      paddingHorizontal: SPACING.md,
      paddingVertical: SPACING.sm,
      marginBottom: SPACING.sm,
    },
    sectionTitle: {
      fontSize: TYPOGRAPHY.fontSize.md,
      fontWeight: TYPOGRAPHY.fontWeight.medium,
      color: colors.textPrimary,
    },
    countBadge: {
      backgroundColor: colors.cyan,
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 10,
    },
    countText: {
      fontSize: TYPOGRAPHY.fontSize.xs,
      fontWeight: TYPOGRAPHY.fontWeight.semibold,
      color: colors.background,
    },
  }), [colors, settings.theme, glass, SPACING, TYPOGRAPHY]);

  if (count === 0) return null;

  return (
    <View style={styles.sectionHeader}>
      <Pin size={16} color={colors.cyan} />
      <Text style={styles.sectionTitle}>Bai viet da ghim</Text>
      <View style={styles.countBadge}>
        <Text style={styles.countText}>{count}</Text>
      </View>
    </View>
  );
};

/**
 * Pinned Posts Limit Info
 */
export const PinLimitInfo = ({ current, max }) => {
  const { colors, gradients, glass, settings, SPACING, TYPOGRAPHY, t } = useSettings();

  const styles = useMemo(() => StyleSheet.create({
    limitInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.xs,
      padding: SPACING.sm,
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      borderRadius: 8,
    },
    limitInfoWarning: {
      backgroundColor: 'rgba(255, 176, 59, 0.1)',
      borderWidth: 1,
      borderColor: 'rgba(255, 176, 59, 0.3)',
    },
    limitText: {
      fontSize: TYPOGRAPHY.fontSize.sm,
      color: colors.textMuted,
    },
    limitTextWarning: {
      color: colors.warning,
    },
  }), [colors, settings.theme, glass, SPACING, TYPOGRAPHY]);

  const remaining = max - current;
  const atLimit = remaining <= 0;

  return (
    <View style={[styles.limitInfo, atLimit && styles.limitInfoWarning]}>
      <Pin size={14} color={atLimit ? colors.warning : colors.textMuted} />
      <Text style={[styles.limitText, atLimit && styles.limitTextWarning]}>
        {atLimit
          ? `Da dat gioi han ${max} bai ghim`
          : `Con ${remaining}/${max} vi tri ghim`}
      </Text>
    </View>
  );
};

export default PinnedBadge;
