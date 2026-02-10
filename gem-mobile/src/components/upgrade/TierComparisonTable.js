// ============================================================
// TIER COMPARISON TABLE
// Purpose: Bảng so sánh features giữa các tiers
// ============================================================

import React, { useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Check, X, Crown, Zap, Star, Infinity } from 'lucide-react-native';
import { useSettings } from '../../contexts/SettingsContext';
import { formatPrice, formatPriceCompact, parseFeatures } from '../../services/upgradeService';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CELL_WIDTH = (SCREEN_WIDTH - 100) / 3;

const TierComparisonTable = ({
  tiers = [],
  currentTierLevel = 0,
  onSelectTier,
  highlightedTierLevel = null,
  style,
}) => {
  const { colors, gradients, glass, settings, SPACING, TYPOGRAPHY, t } = useSettings();

  const styles = useMemo(() => StyleSheet.create({
    container: {
      backgroundColor: settings.theme === 'light' ? colors.bgDarkest : (glass.background || 'rgba(15, 16, 48, 0.95)'),
      borderRadius: 16,
      overflow: 'hidden',
    },

    // Header Row
    headerRow: {
      flexDirection: 'row',
      borderBottomWidth: 2,
      borderBottomColor: 'rgba(255,255,255,0.1)',
    },
    featureLabelCell: {
      width: 100,
      padding: SPACING.sm,
      justifyContent: 'center',
    },
    featureLabelHeader: {
      fontSize: TYPOGRAPHY.fontSize.xs,
      fontWeight: TYPOGRAPHY.fontWeight.bold,
      color: colors.textSecondary,
      textTransform: 'uppercase',
    },
    tierHeaderCell: {
      width: CELL_WIDTH,
      padding: SPACING.sm,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.bgDarkest,
      position: 'relative',
    },
    tierHeaderCellHighlighted: {
      backgroundColor: colors.gold,
    },
    tierHeaderCellCurrent: {
      borderWidth: 2,
      borderColor: colors.success,
    },
    featuredBadge: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      backgroundColor: 'rgba(0,0,0,0.3)',
      paddingVertical: 2,
    },
    featuredBadgeText: {
      fontSize: 8,
      fontWeight: '700',
      color: colors.bgDarkest,
      textAlign: 'center',
    },
    tierName: {
      fontSize: TYPOGRAPHY.fontSize.sm,
      fontWeight: TYPOGRAPHY.fontWeight.bold,
      color: colors.textPrimary,
      marginTop: 4,
      textAlign: 'center',
    },
    tierNameHighlighted: {
      color: colors.bgDarkest,
    },
    tierPrice: {
      fontSize: TYPOGRAPHY.fontSize.md,
      fontWeight: TYPOGRAPHY.fontWeight.bold,
      color: colors.gold,
      marginTop: 2,
    },
    tierPriceHighlighted: {
      color: colors.bgDarkest,
    },
    currentBadge: {
      backgroundColor: colors.success,
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 4,
      marginTop: 4,
    },
    currentBadgeText: {
      fontSize: 9,
      fontWeight: '700',
      color: colors.bgDarkest,
    },

    // Feature Rows
    featureRow: {
      flexDirection: 'row',
      borderBottomWidth: 1,
      borderBottomColor: 'rgba(255,255,255,0.05)',
    },
    featureRowAlt: {
      backgroundColor: 'rgba(255,255,255,0.02)',
    },
    featureLabel: {
      fontSize: TYPOGRAPHY.fontSize.sm,
      color: colors.textSecondary,
    },
    featureValueCell: {
      width: CELL_WIDTH,
      padding: SPACING.sm,
      alignItems: 'center',
      justifyContent: 'center',
    },
    featureValueCellHighlighted: {
      backgroundColor: 'rgba(255, 189, 89, 0.05)',
    },
    featureLimit: {
      fontSize: TYPOGRAPHY.fontSize.sm,
      fontWeight: TYPOGRAPHY.fontWeight.semibold,
      color: colors.textPrimary,
    },

    // CTA Row
    ctaRow: {
      flexDirection: 'row',
      paddingVertical: SPACING.sm,
      backgroundColor: colors.bgDarkest,
    },
    ctaCell: {
      width: CELL_WIDTH,
      paddingHorizontal: SPACING.xs,
      alignItems: 'center',
    },
    ctaButton: {
      paddingVertical: SPACING.xs,
      paddingHorizontal: SPACING.sm,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.gold,
    },
    ctaButtonHighlighted: {
      backgroundColor: colors.gold,
      borderColor: colors.gold,
    },
    ctaButtonCurrent: {
      backgroundColor: 'transparent',
      borderColor: colors.success,
    },
    ctaText: {
      fontSize: TYPOGRAPHY.fontSize.sm,
      fontWeight: TYPOGRAPHY.fontWeight.bold,
      color: colors.gold,
    },
    ctaTextHighlighted: {
      color: colors.bgDarkest,
    },
    ctaTextCurrent: {
      color: colors.success,
    },

    // Compact variant
    compactContainer: {
      backgroundColor: settings.theme === 'light' ? colors.bgDarkest : (glass.background || 'rgba(15, 16, 48, 0.95)'),
      borderRadius: 16,
      padding: SPACING.md,
      borderWidth: 1,
      borderColor: colors.gold,
    },
    compactHeader: {
      marginBottom: SPACING.sm,
    },
    compactTitle: {
      fontSize: TYPOGRAPHY.fontSize.md,
      fontWeight: TYPOGRAPHY.fontWeight.bold,
      color: colors.textPrimary,
    },
    compactFeatures: {
      marginBottom: SPACING.md,
    },
    compactFeatureRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.sm,
      marginBottom: SPACING.xs,
    },
    compactFeatureText: {
      fontSize: TYPOGRAPHY.fontSize.sm,
      color: colors.textPrimary,
    },
    compactCta: {
      backgroundColor: colors.gold,
      paddingVertical: SPACING.sm,
      borderRadius: 12,
      alignItems: 'center',
    },
    compactCtaText: {
      fontSize: TYPOGRAPHY.fontSize.sm,
      fontWeight: TYPOGRAPHY.fontWeight.bold,
      color: colors.bgDarkest,
    },
  }), [colors, settings.theme, glass, SPACING, TYPOGRAPHY]);

  if (!tiers.length) return null;

  // Get all unique feature keys from all tiers
  const allFeatureKeys = new Set();
  tiers.forEach(tier => {
    const features = parseFeatures(tier.features_json);
    features.forEach(f => allFeatureKeys.add(f.key));
  });

  // Build feature rows
  const featureRows = Array.from(allFeatureKeys).map(key => {
    const row = { key, values: [] };
    tiers.forEach(tier => {
      const features = parseFeatures(tier.features_json);
      const feature = features.find(f => f.key === key);
      row.label = feature?.label?.split(' ')[0] || key; // First word as label
      row.values.push(feature || { included: false });
    });
    return row;
  });

  const TierIcon = (level) => {
    if (level === 3) return Crown;
    if (level === 2) return Star;
    return Zap;
  };

  return (
    <View style={[styles.container, style]}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View>
          {/* Header Row - Tier Names */}
          <View style={styles.headerRow}>
            <View style={styles.featureLabelCell}>
              <Text style={styles.featureLabelHeader}>Tính năng</Text>
            </View>
            {tiers.map((tier, index) => {
              const Icon = TierIcon(tier.tier_level);
              const isHighlighted = tier.tier_level === highlightedTierLevel || tier.is_featured;
              const isCurrent = tier.tier_level === currentTierLevel;

              return (
                <TouchableOpacity
                  key={tier.id}
                  style={[
                    styles.tierHeaderCell,
                    isHighlighted && styles.tierHeaderCellHighlighted,
                    isCurrent && styles.tierHeaderCellCurrent,
                  ]}
                  onPress={() => onSelectTier?.(tier)}
                  activeOpacity={0.8}
                >
                  {isHighlighted && (
                    <View style={styles.featuredBadge}>
                      <Text style={styles.featuredBadgeText}>
                        {tier.badge_text || 'PHO BIEN'}
                      </Text>
                    </View>
                  )}
                  <Icon
                    size={20}
                    color={isHighlighted ? colors.bgDarkest : colors.gold}
                  />
                  <Text style={[
                    styles.tierName,
                    isHighlighted && styles.tierNameHighlighted,
                  ]}>
                    {tier.display_name || `Tier ${tier.tier_level}`}
                  </Text>
                  <Text style={[
                    styles.tierPrice,
                    isHighlighted && styles.tierPriceHighlighted,
                  ]}>
                    {formatPriceCompact(tier.price_vnd)}
                  </Text>
                  {isCurrent && (
                    <View style={styles.currentBadge}>
                      <Text style={styles.currentBadgeText}>Dang dung</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Feature Rows */}
          {featureRows.map((row, rowIndex) => (
            <View
              key={row.key}
              style={[
                styles.featureRow,
                rowIndex % 2 === 0 && styles.featureRowAlt,
              ]}
            >
              <View style={styles.featureLabelCell}>
                <Text style={styles.featureLabel} numberOfLines={1}>
                  {row.label}
                </Text>
              </View>
              {row.values.map((value, colIndex) => {
                const tier = tiers[colIndex];
                const isHighlighted = tier?.tier_level === highlightedTierLevel || tier?.is_featured;

                return (
                  <View
                    key={colIndex}
                    style={[
                      styles.featureValueCell,
                      isHighlighted && styles.featureValueCellHighlighted,
                    ]}
                  >
                    {value.included ? (
                      value.limit ? (
                        <Text style={styles.featureLimit}>
                          {value.limit === -1 ? (
                            <Infinity size={16} color={colors.success} />
                          ) : (
                            value.limit
                          )}
                        </Text>
                      ) : (
                        <Check size={18} color={colors.success} />
                      )
                    ) : (
                      <X size={18} color={colors.textMuted} />
                    )}
                  </View>
                );
              })}
            </View>
          ))}

          {/* CTA Row */}
          <View style={styles.ctaRow}>
            <View style={styles.featureLabelCell} />
            {tiers.map((tier) => {
              const isHighlighted = tier.tier_level === highlightedTierLevel || tier.is_featured;
              const isCurrent = tier.tier_level === currentTierLevel;

              return (
                <View key={tier.id} style={styles.ctaCell}>
                  <TouchableOpacity
                    style={[
                      styles.ctaButton,
                      isHighlighted && styles.ctaButtonHighlighted,
                      isCurrent && styles.ctaButtonCurrent,
                    ]}
                    onPress={() => !isCurrent && onSelectTier?.(tier)}
                    disabled={isCurrent}
                    activeOpacity={0.8}
                  >
                    <Text style={[
                      styles.ctaText,
                      isHighlighted && styles.ctaTextHighlighted,
                      isCurrent && styles.ctaTextCurrent,
                    ]}>
                      {isCurrent ? 'Hien tai' : 'Chon'}
                    </Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

/**
 * Compact comparison - just 2 tiers side by side
 */
export const TierComparisonCompact = ({
  currentTier,
  upgradeTier,
  onUpgrade,
  style,
}) => {
  const { colors, gradients, glass, settings, SPACING, TYPOGRAPHY, t } = useSettings();

  const styles = useMemo(() => StyleSheet.create({
    compactContainer: {
      backgroundColor: settings.theme === 'light' ? colors.bgDarkest : (glass.background || 'rgba(15, 16, 48, 0.95)'),
      borderRadius: 16,
      padding: SPACING.md,
      borderWidth: 1,
      borderColor: colors.gold,
    },
    compactHeader: {
      marginBottom: SPACING.sm,
    },
    compactTitle: {
      fontSize: TYPOGRAPHY.fontSize.md,
      fontWeight: TYPOGRAPHY.fontWeight.bold,
      color: colors.textPrimary,
    },
    compactFeatures: {
      marginBottom: SPACING.md,
    },
    compactFeatureRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.sm,
      marginBottom: SPACING.xs,
    },
    compactFeatureText: {
      fontSize: TYPOGRAPHY.fontSize.sm,
      color: colors.textPrimary,
    },
    compactCta: {
      backgroundColor: colors.gold,
      paddingVertical: SPACING.sm,
      borderRadius: 12,
      alignItems: 'center',
    },
    compactCtaText: {
      fontSize: TYPOGRAPHY.fontSize.sm,
      fontWeight: TYPOGRAPHY.fontWeight.bold,
      color: colors.bgDarkest,
    },
  }), [colors, settings.theme, glass, SPACING, TYPOGRAPHY]);

  if (!currentTier || !upgradeTier) return null;

  const currentFeatures = parseFeatures(currentTier.features_json);
  const upgradeFeatures = parseFeatures(upgradeTier.features_json);

  // Find new features in upgrade tier
  const newFeatures = upgradeFeatures.filter(uf => {
    const current = currentFeatures.find(cf => cf.key === uf.key);
    return uf.included && (!current || !current.included);
  });

  return (
    <View style={[styles.compactContainer, style]}>
      <View style={styles.compactHeader}>
        <Text style={styles.compactTitle}>Nâng cấp để mở khóa</Text>
      </View>

      <View style={styles.compactFeatures}>
        {newFeatures.slice(0, 4).map((feature, index) => (
          <View key={index} style={styles.compactFeatureRow}>
            <Check size={16} color={colors.success} />
            <Text style={styles.compactFeatureText}>{feature.label}</Text>
          </View>
        ))}
      </View>

      <TouchableOpacity
        style={styles.compactCta}
        onPress={() => onUpgrade?.(upgradeTier)}
        activeOpacity={0.8}
      >
        <Text style={styles.compactCtaText}>
          Nâng cấp lên {upgradeTier.display_name} - {formatPrice(upgradeTier.price_vnd)}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default TierComparisonTable;
