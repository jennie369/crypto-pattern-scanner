// src/components/Chat/ComparisonResponse.js
// ============================================================
// COMPARISON RESPONSE COMPONENT
// Side-by-side comparison of options (e.g., tier comparison)
// ============================================================

import React, { memo, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Star, Check, X } from 'lucide-react-native';
import { useSettings } from '../../contexts/SettingsContext';

const ComparisonResponse = memo(({
  title,
  items = [],
  highlightIndex,
  onItemSelect,
}) => {
  const { colors, gradients, glass, settings, SPACING, TYPOGRAPHY, t } = useSettings();

  const styles = useMemo(() => StyleSheet.create({
    container: {
      marginVertical: SPACING.sm,
    },
    title: {
      fontSize: TYPOGRAPHY.fontSize.lg,
      fontWeight: TYPOGRAPHY.fontWeight.semibold,
      color: colors.textPrimary,
      marginBottom: SPACING.md,
      paddingHorizontal: SPACING.sm,
    },
    scrollContent: {
      paddingHorizontal: SPACING.sm,
      gap: SPACING.md,
    },
    itemCard: {
      backgroundColor: settings.theme === 'light' ? colors.bgDarkest : (glass.background || 'rgba(15, 16, 48, 0.95)'),
      borderRadius: 16,
      padding: SPACING.md,
      minWidth: 180,
      borderWidth: 1,
      borderColor: 'transparent',
    },
    itemCardHighlighted: {
      borderColor: colors.gold,
      backgroundColor: 'rgba(255,189,89,0.1)',
    },
    highlightBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: colors.gold,
      paddingVertical: 4,
      paddingHorizontal: 8,
      borderRadius: 12,
      alignSelf: 'flex-start',
      marginBottom: SPACING.sm,
    },
    highlightText: {
      fontSize: TYPOGRAPHY.fontSize.xs,
      color: colors.bgDark,
      fontWeight: TYPOGRAPHY.fontWeight.semibold,
    },
    itemName: {
      fontSize: TYPOGRAPHY.fontSize.lg,
      fontWeight: TYPOGRAPHY.fontWeight.semibold,
      color: colors.textPrimary,
      marginBottom: SPACING.xs,
    },
    itemPrice: {
      fontSize: TYPOGRAPHY.fontSize.xl,
      fontWeight: TYPOGRAPHY.fontWeight.bold,
      color: colors.gold,
      marginBottom: SPACING.md,
    },
    features: {
      gap: SPACING.xs,
    },
    featureRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.xs,
    },
    featureText: {
      fontSize: TYPOGRAPHY.fontSize.sm,
      color: colors.textPrimary,
    },
    featureTextDisabled: {
      color: colors.textMuted,
    },
  }), [colors, settings.theme, glass, SPACING, TYPOGRAPHY]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title || 'So sánh'}</Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {(items || []).map((item, index) => {
          const isHighlighted = index === highlightIndex;

          return (
            <TouchableOpacity
              key={index}
              style={[
                styles.itemCard,
                isHighlighted && styles.itemCardHighlighted
              ]}
              onPress={() => onItemSelect?.(index)}
              activeOpacity={0.8}
            >
              {/* Highlight Badge */}
              {isHighlighted && (
                <View style={styles.highlightBadge}>
                  <Star size={12} color={colors.bgDark} fill={colors.bgDark} />
                  <Text style={styles.highlightText}>Đề xuất</Text>
                </View>
              )}

              {/* Name */}
              <Text style={styles.itemName}>{item?.name || ''}</Text>

              {/* Price */}
              {item?.price && (
                <Text style={styles.itemPrice}>{item.price}</Text>
              )}

              {/* Features */}
              <View style={styles.features}>
                {(item?.features || []).map((feature, fIndex) => (
                  <View key={fIndex} style={styles.featureRow}>
                    {feature?.included ? (
                      <Check size={14} color={colors.success} />
                    ) : (
                      <X size={14} color={colors.textMuted} />
                    )}
                    <Text style={[
                      styles.featureText,
                      !feature?.included && styles.featureTextDisabled
                    ]}>
                      {feature?.text || feature}
                    </Text>
                  </View>
                ))}
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
});

ComparisonResponse.displayName = 'ComparisonResponse';

export default ComparisonResponse;
