/**
 * Gemral - Tier Lock Overlay Component
 * Shows lock overlay for premium content requiring tier upgrade
 */

import React, { memo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Lock, ArrowUpCircle, Crown } from 'lucide-react-native';
import { COLORS, SPACING, TYPOGRAPHY } from '../../../utils/tokens';
import { TIER_COLORS, TIER_NAMES, getUpgradeSuggestion } from '../../../utils/digitalProductsConfig';

const TierLockOverlay = ({
  isLocked,
  requiredTier,
  userTier,
  onUpgradePress,
  children,
  style,
  compact = false,
}) => {
  // If not locked, just render children
  if (!isLocked) {
    return children;
  }

  const suggestion = getUpgradeSuggestion(userTier, requiredTier);
  const tierColor = TIER_COLORS[requiredTier] || TIER_COLORS.tier1;
  const tierName = TIER_NAMES[requiredTier] || requiredTier;

  const handleUpgrade = useCallback(() => {
    onUpgradePress?.({
      requiredTier,
      currentTier: userTier,
      tierName,
    });
  }, [onUpgradePress, requiredTier, userTier, tierName]);

  return (
    <View style={[styles.container, style]}>
      {children}

      {/* Blur Overlay */}
      <BlurView intensity={20} style={styles.blurOverlay} tint="dark">
        <View style={styles.lockContent}>
          {/* Lock Icon with Tier Color */}
          <View style={[styles.lockIconContainer, { backgroundColor: tierColor.bg }]}>
            <Lock size={compact ? 18 : 24} color={tierColor.text} />
          </View>

          {/* Message */}
          {!compact && (
            <>
              <Text style={styles.lockTitle}>Nội dung bị khóa</Text>
              <Text style={styles.lockMessage}>{suggestion.message}</Text>
            </>
          )}

          {/* Tier Badge */}
          <View style={[styles.tierBadge, { borderColor: tierColor.border }]}>
            <Crown size={12} color={tierColor.text} />
            <Text style={[styles.tierBadgeText, { color: tierColor.text }]}>
              {tierName}
            </Text>
          </View>

          {/* Upgrade Button */}
          {!compact && (
            <TouchableOpacity
              style={[styles.upgradeButton, { borderColor: tierColor.border }]}
              onPress={handleUpgrade}
              activeOpacity={0.8}
            >
              <ArrowUpCircle size={18} color={tierColor.text} />
              <Text style={[styles.upgradeText, { color: tierColor.text }]}>
                Nâng cấp ngay
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </BlurView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    overflow: 'hidden',
  },
  blurOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(10, 14, 39, 0.85)',
  },
  lockContent: {
    alignItems: 'center',
    padding: SPACING.lg,
  },
  lockIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  lockTitle: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  lockMessage: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginBottom: SPACING.md,
    maxWidth: 200,
    lineHeight: 20,
  },
  tierBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: 12,
    borderWidth: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    marginBottom: SPACING.md,
    gap: 4,
  },
  tierBadgeText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  upgradeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.xxl,
    paddingVertical: SPACING.md,
    borderRadius: 24,
    borderWidth: 1.5,
    gap: SPACING.sm,
  },
  upgradeText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
});

// Compact version for smaller cards
export const TierLockBadge = memo(({ tier, style }) => {
  const tierColor = TIER_COLORS[tier] || TIER_COLORS.tier1;
  const tierName = TIER_NAMES[tier] || tier;

  return (
    <View style={[compactStyles.badge, { borderColor: tierColor.border }, style]}>
      <Lock size={10} color={tierColor.text} />
      <Text style={[compactStyles.badgeText, { color: tierColor.text }]}>
        {tierName}
      </Text>
    </View>
  );
});

const compactStyles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    gap: 2,
  },
  badgeText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
});

export default memo(TierLockOverlay);
