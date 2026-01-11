// ============================================================
// UPGRADE CARD
// Purpose: Card so sánh tier với pricing và features
// ============================================================

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Check, X, Crown, Zap, Star } from 'lucide-react-native';
import { COLORS, SPACING, TYPOGRAPHY, GRADIENTS } from '../../utils/tokens';
import { formatPrice, parseFeatures } from '../../services/upgradeService';

const UpgradeCard = ({
  tier,
  isCurrentTier = false,
  isRecommended = false,
  onSelect,
  compact = false,
  style,
}) => {
  if (!tier) return null;

  const features = parseFeatures(tier.features_json);

  const handleSelect = () => {
    if (onSelect && !isCurrentTier) {
      onSelect(tier);
    }
  };

  // Icon based on tier level
  const TierIcon = tier.tier_level === 3 ? Crown : tier.tier_level === 2 ? Star : Zap;

  return (
    <TouchableOpacity
      style={[
        styles.container,
        isRecommended && styles.containerRecommended,
        isCurrentTier && styles.containerCurrent,
        compact && styles.containerCompact,
        style,
      ]}
      onPress={handleSelect}
      activeOpacity={isCurrentTier ? 1 : 0.8}
      disabled={isCurrentTier}
    >
      {/* Recommended badge */}
      {(isRecommended || tier.is_featured) && (
        <View style={styles.recommendedBadge}>
          <Text style={styles.recommendedText}>
            {tier.badge_text || 'PHO BIEN NHAT'}
          </Text>
        </View>
      )}

      {/* Current tier badge */}
      {isCurrentTier && (
        <View style={styles.currentBadge}>
          <Text style={styles.currentText}>GOI HIEN TAI</Text>
        </View>
      )}

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <TierIcon size={24} color={isRecommended ? COLORS.bgDarkest : COLORS.gold} />
        </View>
        <Text style={styles.tierName}>{tier.display_name || tier.tier_name}</Text>
        <Text style={styles.tierLevel}>TIER {tier.tier_level}</Text>
      </View>

      {/* Price */}
      <View style={styles.priceSection}>
        {tier.original_price_vnd > tier.price_vnd && (
          <Text style={styles.originalPrice}>
            {formatPrice(tier.original_price_vnd)}
          </Text>
        )}
        <Text style={[styles.price, isRecommended && styles.priceRecommended]}>
          {formatPrice(tier.price_vnd)}
        </Text>
        <Text style={styles.priceNote}>/ lifetime</Text>
      </View>

      {/* Description */}
      {tier.short_description && !compact && (
        <Text style={styles.description} numberOfLines={2}>
          {tier.short_description}
        </Text>
      )}

      {/* Features */}
      <View style={styles.features}>
        {features.slice(0, compact ? 3 : 5).map((feature, index) => (
          <View key={index} style={styles.featureRow}>
            {feature.included ? (
              <Check size={16} color={COLORS.success} />
            ) : (
              <X size={16} color={COLORS.textMuted} />
            )}
            <Text
              style={[
                styles.featureText,
                !feature.included && styles.featureTextDisabled,
              ]}
              numberOfLines={1}
            >
              {feature.label}
            </Text>
          </View>
        ))}
        {features.length > (compact ? 3 : 5) && (
          <Text style={styles.moreFeatures}>
            +{features.length - (compact ? 3 : 5)} tính năng khác
          </Text>
        )}
      </View>

      {/* CTA Button */}
      {!isCurrentTier && (
        <TouchableOpacity
          style={[
            styles.ctaButton,
            isRecommended && styles.ctaButtonRecommended,
          ]}
          onPress={handleSelect}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={isRecommended ? [COLORS.gold, '#FFA500'] : ['transparent', 'transparent']}
            style={styles.ctaGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text
              style={[
                styles.ctaText,
                isRecommended && styles.ctaTextRecommended,
              ]}
            >
              {isRecommended ? 'CHON GOI NAY' : 'Chon goi'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      )}

      {isCurrentTier && (
        <View style={styles.currentButton}>
          <Check size={18} color={COLORS.success} />
          <Text style={styles.currentButtonText}>Dang su dung</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

/**
 * Horizontal card variant for carousel
 */
export const UpgradeCardHorizontal = ({
  tier,
  onSelect,
  style,
}) => {
  if (!tier) return null;

  const features = parseFeatures(tier.features_json);
  const TierIcon = tier.tier_level === 3 ? Crown : tier.tier_level === 2 ? Star : Zap;

  return (
    <TouchableOpacity
      style={[styles.horizontalContainer, style]}
      onPress={() => onSelect?.(tier)}
      activeOpacity={0.8}
    >
      <View style={styles.horizontalLeft}>
        <View style={styles.horizontalIconContainer}>
          <TierIcon size={20} color={COLORS.gold} />
        </View>
        <View>
          <Text style={styles.horizontalName}>{tier.display_name || tier.tier_name}</Text>
          <Text style={styles.horizontalPrice}>{formatPrice(tier.price_vnd)}</Text>
        </View>
      </View>

      <View style={styles.horizontalRight}>
        <Text style={styles.horizontalFeatureCount}>
          {features.filter(f => f.included).length} tính năng
        </Text>
        <View style={styles.horizontalArrow}>
          <Text style={styles.horizontalArrowText}>Xem</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.glassBg,
    borderRadius: 20,
    padding: SPACING.lg,
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
    overflow: 'hidden',
  },
  containerRecommended: {
    borderColor: COLORS.gold,
    backgroundColor: 'rgba(255, 189, 89, 0.1)',
  },
  containerCurrent: {
    borderColor: COLORS.success,
    opacity: 0.8,
  },
  containerCompact: {
    padding: SPACING.md,
  },

  // Badges
  recommendedBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: COLORS.gold,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderBottomLeftRadius: 12,
  },
  recommendedText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.bgDarkest,
  },
  currentBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: COLORS.success,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderBottomLeftRadius: 12,
  },
  currentText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.bgDarkest,
  },

  // Header
  header: {
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 189, 89, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  tierName: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  tierLevel: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textSecondary,
    marginTop: 2,
  },

  // Price
  priceSection: {
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  originalPrice: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    textDecorationLine: 'line-through',
  },
  price: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.gold,
  },
  priceRecommended: {
    fontSize: 28,
  },
  priceNote: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textSecondary,
    marginTop: 2,
  },

  // Description
  description: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },

  // Features
  features: {
    marginBottom: SPACING.md,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  featureText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textPrimary,
    flex: 1,
  },
  featureTextDisabled: {
    color: COLORS.textMuted,
    textDecorationLine: 'line-through',
  },
  moreFeatures: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
    marginTop: SPACING.xs,
  },

  // CTA
  ctaButton: {
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.gold,
  },
  ctaButtonRecommended: {
    borderWidth: 0,
  },
  ctaGradient: {
    paddingVertical: SPACING.sm,
    alignItems: 'center',
  },
  ctaText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.gold,
  },
  ctaTextRecommended: {
    color: COLORS.bgDarkest,
  },

  // Current
  currentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    paddingVertical: SPACING.sm,
    backgroundColor: 'rgba(46, 213, 115, 0.1)',
    borderRadius: 12,
  },
  currentButtonText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.success,
  },

  // Horizontal variant
  horizontalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.glassBg,
    borderRadius: 16,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  horizontalLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  horizontalIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 189, 89, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  horizontalName: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
  },
  horizontalPrice: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gold,
  },
  horizontalRight: {
    alignItems: 'flex-end',
  },
  horizontalFeatureCount: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  horizontalArrow: {
    backgroundColor: COLORS.gold,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: 8,
  },
  horizontalArrowText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.bgDarkest,
  },
});

export default UpgradeCard;
