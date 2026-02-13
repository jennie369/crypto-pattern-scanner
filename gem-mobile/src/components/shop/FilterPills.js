/**
 * FilterPills.js - Active Filter Pills Component
 * Horizontal scrollable active filter chips
 * Shows applied filters with remove capability
 */

import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { X } from 'lucide-react-native';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../../utils/tokens';

const FilterPills = ({
  filters = {},
  onRemoveFilter,
  onClearAll,
  style,
}) => {
  // Convert filters object to array of pills
  const getFilterPills = () => {
    const pills = [];

    // Price range
    if (filters.priceMin || filters.priceMax) {
      const formatPrice = (v) => {
        if (v >= 1000000) return `${(v / 1000000).toFixed(1)}tr`;
        return new Intl.NumberFormat('vi-VN').format(v);
      };

      pills.push({
        key: 'price',
        label: `${formatPrice(filters.priceMin || 0)} - ${formatPrice(filters.priceMax || 10000000)}`,
        type: 'price',
      });
    }

    // Categories
    if (filters.categories?.length > 0) {
      filters.categories.forEach((cat) => {
        pills.push({
          key: `category_${cat.id}`,
          label: cat.name,
          type: 'category',
          value: cat.id,
        });
      });
    }

    // Rating
    if (filters.rating) {
      pills.push({
        key: 'rating',
        label: `${filters.rating}+ sao`,
        type: 'rating',
      });
    }

    // On sale
    if (filters.onSale) {
      pills.push({
        key: 'onSale',
        label: 'Đang giảm giá',
        type: 'onSale',
      });
    }

    // In stock
    if (filters.inStock) {
      pills.push({
        key: 'inStock',
        label: 'Còn hàng',
        type: 'inStock',
      });
    }

    return pills;
  };

  const pills = getFilterPills();

  if (pills.length === 0) {
    return null;
  }

  return (
    <View style={[styles.container, style]}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {pills.map((pill) => (
          <TouchableOpacity
            key={pill.key}
            style={styles.pill}
            onPress={() => onRemoveFilter?.(pill.type, pill.value)}
            activeOpacity={0.7}
          >
            <Text style={styles.pillText}>{pill.label}</Text>
            <X size={12} color={COLORS.burgundy} />
          </TouchableOpacity>
        ))}

        {/* Clear All Button */}
        {pills.length > 1 && (
          <TouchableOpacity
            style={styles.clearAllButton}
            onPress={onClearAll}
            activeOpacity={0.7}
          >
            <Text style={styles.clearAllText}>Xóa tất cả</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.md,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    gap: SPACING.sm,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(156, 6, 18, 0.15)',
    paddingVertical: SPACING.xs,
    paddingLeft: SPACING.md,
    paddingRight: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    borderColor: 'rgba(156, 6, 18, 0.3)',
    gap: SPACING.xs,
  },
  pillText: {
    color: COLORS.burgundy,
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  clearAllButton: {
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  clearAllText: {
    color: COLORS.textMuted,
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
});

export default FilterPills;
