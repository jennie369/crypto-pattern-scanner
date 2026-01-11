/**
 * FilterSheet.js - Filter Bottom Sheet Component
 * Full filter interface with price range, categories, rating, etc.
 * Uses Modal for cross-platform compatibility
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Pressable,
  Switch,
} from 'react-native';
import { X, Star, RotateCcw } from 'lucide-react-native';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../../utils/tokens';
import PriceRangeSlider from './PriceRangeSlider';

// Category options
const CATEGORIES = [
  { id: 'crystals', name: 'Đá Quý' },
  { id: 'courses', name: 'Khóa Học' },
  { id: 'subscriptions', name: 'Gói VIP' },
  { id: 'merchandise', name: 'Phụ Kiện' },
  { id: 'gifts', name: 'Quà Tặng' },
  { id: 'tarot', name: 'Tarot' },
  { id: 'meditation', name: 'Thiền' },
  { id: 'astrology', name: 'Chiêm Tinh' },
  { id: 'trading', name: 'Trading Tools' },
];

// Rating options
const RATINGS = [5, 4, 3, 2, 1];

const FilterSheet = ({
  visible,
  onClose,
  initialFilters = {},
  onApply,
}) => {
  const [filters, setFilters] = useState({
    priceMin: 0,
    priceMax: 10000000,
    categories: [],
    rating: null,
    onSale: false,
    inStock: false,
    ...initialFilters,
  });

  // Reset to initial filters when sheet opens
  useEffect(() => {
    if (visible) {
      setFilters({
        priceMin: 0,
        priceMax: 10000000,
        categories: [],
        rating: null,
        onSale: false,
        inStock: false,
        ...initialFilters,
      });
    }
  }, [visible, initialFilters]);

  const handlePriceChange = ({ min, max }) => {
    setFilters(prev => ({ ...prev, priceMin: min, priceMax: max }));
  };

  const toggleCategory = (category) => {
    setFilters(prev => {
      const exists = prev.categories.find(c => c.id === category.id);
      if (exists) {
        return {
          ...prev,
          categories: prev.categories.filter(c => c.id !== category.id),
        };
      } else {
        return {
          ...prev,
          categories: [...prev.categories, category],
        };
      }
    });
  };

  const selectRating = (rating) => {
    setFilters(prev => ({
      ...prev,
      rating: prev.rating === rating ? null : rating,
    }));
  };

  const handleReset = () => {
    setFilters({
      priceMin: 0,
      priceMax: 10000000,
      categories: [],
      rating: null,
      onSale: false,
      inStock: false,
    });
  };

  const handleApply = () => {
    onApply?.(filters);
    onClose?.();
  };

  // Count active filters
  const activeFilterCount = [
    filters.priceMin > 0 || filters.priceMax < 10000000,
    filters.categories.length > 0,
    filters.rating !== null,
    filters.onSale,
    filters.inStock,
  ].filter(Boolean).length;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Overlay */}
        <Pressable style={styles.overlay} onPress={onClose} />

        {/* Sheet Content */}
        <View style={styles.sheet}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.resetButton}
              onPress={handleReset}
              activeOpacity={0.7}
            >
              <RotateCcw size={18} color={COLORS.textMuted} />
              <Text style={styles.resetText}>Đặt lại</Text>
            </TouchableOpacity>

            <Text style={styles.title}>Bộ lọc</Text>

            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <X size={24} color={COLORS.textPrimary} />
            </TouchableOpacity>
          </View>

          {/* Scrollable Content */}
          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
          >
            {/* Price Range */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Khoảng giá</Text>
              <PriceRangeSlider
                min={0}
                max={10000000}
                minValue={filters.priceMin}
                maxValue={filters.priceMax}
                step={100000}
                onChange={handlePriceChange}
              />
            </View>

            {/* Categories */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Danh mục</Text>
              <View style={styles.categoryGrid}>
                {CATEGORIES.map((cat) => {
                  const isSelected = filters.categories.some(c => c.id === cat.id);
                  return (
                    <TouchableOpacity
                      key={cat.id}
                      style={[
                        styles.categoryChip,
                        isSelected && styles.categoryChipActive,
                      ]}
                      onPress={() => toggleCategory(cat)}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.categoryChipText,
                          isSelected && styles.categoryChipTextActive,
                        ]}
                      >
                        {cat.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Rating */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Đánh giá</Text>
              <View style={styles.ratingOptions}>
                {RATINGS.map((rating) => (
                  <TouchableOpacity
                    key={rating}
                    style={[
                      styles.ratingOption,
                      filters.rating === rating && styles.ratingOptionActive,
                    ]}
                    onPress={() => selectRating(rating)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.ratingText}>{rating}</Text>
                    <Star
                      size={14}
                      color={COLORS.gold}
                      fill={COLORS.gold}
                    />
                    <Text style={styles.ratingPlus}>trở lên</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Toggle Options */}
            <View style={styles.section}>
              <View style={styles.toggleRow}>
                <Text style={styles.toggleLabel}>Đang giảm giá</Text>
                <Switch
                  value={filters.onSale}
                  onValueChange={(v) => setFilters(prev => ({ ...prev, onSale: v }))}
                  trackColor={{ false: 'rgba(255,255,255,0.1)', true: COLORS.burgundy }}
                  thumbColor={COLORS.textPrimary}
                />
              </View>

              <View style={styles.toggleRow}>
                <Text style={styles.toggleLabel}>Còn hàng</Text>
                <Switch
                  value={filters.inStock}
                  onValueChange={(v) => setFilters(prev => ({ ...prev, inStock: v }))}
                  trackColor={{ false: 'rgba(255,255,255,0.1)', true: COLORS.burgundy }}
                  thumbColor={COLORS.textPrimary}
                />
              </View>
            </View>

            {/* Bottom padding */}
            <View style={{ height: 100 }} />
          </ScrollView>

          {/* Apply Button */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.applyButton}
              onPress={handleApply}
              activeOpacity={0.8}
            >
              <Text style={styles.applyButtonText}>
                Áp dụng {activeFilterCount > 0 ? `(${activeFilterCount})` : ''}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.bgMid,
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
    maxHeight: '85%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  resetText: {
    color: COLORS.textMuted,
    fontSize: TYPOGRAPHY.fontSize.md,
  },
  title: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.fontSize.xxxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  closeButton: {
    padding: SPACING.xs,
  },
  content: {
    paddingHorizontal: SPACING.lg,
  },
  section: {
    paddingVertical: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  sectionTitle: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    marginBottom: SPACING.md,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  categoryChip: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  categoryChipActive: {
    backgroundColor: 'rgba(156, 6, 18, 0.2)',
    borderColor: COLORS.burgundy,
  },
  categoryChipText: {
    color: COLORS.textSecondary,
    fontSize: TYPOGRAPHY.fontSize.md,
  },
  categoryChipTextActive: {
    color: COLORS.burgundy,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  ratingOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  ratingOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'transparent',
    gap: 4,
  },
  ratingOptionActive: {
    backgroundColor: 'rgba(156, 6, 18, 0.2)',
    borderColor: COLORS.burgundy,
  },
  ratingText: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
  ratingPlus: {
    color: COLORS.textMuted,
    fontSize: TYPOGRAPHY.fontSize.sm,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.md,
  },
  toggleLabel: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.fontSize.lg,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    paddingBottom: SPACING.huge,
    backgroundColor: COLORS.bgMid,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  applyButton: {
    backgroundColor: COLORS.burgundy,
    paddingVertical: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
  },
  applyButtonText: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
});

export default FilterSheet;
