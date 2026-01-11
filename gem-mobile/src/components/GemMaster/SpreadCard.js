/**
 * SpreadCard Component
 * Card preview in spread selection grid
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Lock,
  Clock,
  Layers,
  Sparkles,
  Heart,
  Briefcase,
  TrendingUp,
  Crown,
  Info,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { COLORS, SPACING, TYPOGRAPHY, GRADIENTS } from '../../utils/tokens';
import { getTierColor, getTierDisplayName } from '../../data/tarotSpreads';

const CATEGORY_ICONS = {
  general: Sparkles,
  love: Heart,
  career: Briefcase,
  trading: TrendingUp,
  advanced: Crown,
};

const SpreadCard = ({
  spread,
  isLocked = false,
  onPress,
  onInfoPress,
  style,
}) => {
  const CategoryIcon = CATEGORY_ICONS[spread?.category] || Sparkles;
  const tierColor = getTierColor(spread?.tier_required);
  const tierName = getTierDisplayName(spread?.tier_required);

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (onPress) {
      onPress(spread);
    }
  };

  const handleInfoPress = (e) => {
    e.stopPropagation();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (onInfoPress) {
      onInfoPress(spread);
    }
  };

  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <View style={styles.card}>
        {/* Background gradient */}
        <LinearGradient
          colors={[COLORS.glassBg, COLORS.bgDarkest]}
          style={styles.background}
        />

        {/* Border gradient effect */}
        <View style={styles.borderGradient} />

        {/* Lock overlay */}
        {isLocked && (
          <View style={styles.lockOverlay}>
            <Lock size={24} color={COLORS.textMuted} />
          </View>
        )}

        {/* Content */}
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <View style={[styles.categoryBadge, { backgroundColor: `${tierColor}20` }]}>
              <CategoryIcon size={14} color={tierColor} />
            </View>

            <TouchableOpacity
              style={styles.infoButton}
              onPress={handleInfoPress}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Info size={16} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Name */}
          <Text style={styles.name} numberOfLines={2}>
            {spread?.name_vi || spread?.name_en || 'Unnamed Spread'}
          </Text>

          {/* Description */}
          {spread?.description_vi && (
            <Text style={styles.description} numberOfLines={2}>
              {spread.description_vi}
            </Text>
          )}

          {/* Footer */}
          <View style={styles.footer}>
            {/* Card count */}
            <View style={styles.metaItem}>
              <Layers size={12} color={COLORS.textMuted} />
              <Text style={styles.metaText}>{spread?.cards || 0} lá</Text>
            </View>

            {/* Estimated time */}
            {spread?.estimated_time && (
              <View style={styles.metaItem}>
                <Clock size={12} color={COLORS.textMuted} />
                <Text style={styles.metaText}>{spread.estimated_time}</Text>
              </View>
            )}
          </View>

          {/* Tier badge */}
          {spread?.tier_required && spread.tier_required !== 'FREE' && (
            <View style={[styles.tierBadge, { backgroundColor: `${tierColor}30`, borderColor: tierColor }]}>
              <Text style={[styles.tierText, { color: tierColor }]}>
                {tierName}
              </Text>
            </View>
          )}

          {/* Free badge */}
          {(!spread?.tier_required || spread.tier_required === 'FREE') && (
            <View style={styles.freeBadge}>
              <Text style={styles.freeText}>Miễn phí</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    margin: SPACING.xs,
  },
  card: {
    borderRadius: 16,
    overflow: 'hidden',
    minHeight: 160,
    position: 'relative',
  },
  background: {
    ...StyleSheet.absoluteFillObject,
  },
  borderGradient: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.purple,
    opacity: 0.5,
  },
  lockOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    borderRadius: 16,
  },
  content: {
    flex: 1,
    padding: SPACING.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  categoryBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoButton: {
    padding: 4,
  },
  name: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
    lineHeight: 20,
  },
  description: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
    marginBottom: SPACING.sm,
    lineHeight: 16,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    marginTop: 'auto',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
  },
  tierBadge: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
  },
  tierText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  freeBadge: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: 8,
    backgroundColor: 'rgba(58, 247, 166, 0.2)',
    borderWidth: 1,
    borderColor: COLORS.success,
  },
  freeText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.success,
  },
});

export default SpreadCard;
