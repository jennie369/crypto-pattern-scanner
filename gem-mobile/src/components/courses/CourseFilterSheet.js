/**
 * CourseFilterSheet.js - Filter Bottom Sheet for Courses
 * Full filter interface with price range, categories, difficulty, rating
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
import { X, Star, RotateCcw, Filter, SortDesc } from 'lucide-react-native';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../../utils/tokens';

// Course category options
const COURSE_CATEGORIES = [
  { id: 'trading', name: 'Trading' },
  { id: 'tarot', name: 'Tarot' },
  { id: 'astrology', name: 'Chiêm Tinh' },
  { id: 'meditation', name: 'Thiền' },
  { id: 'crystals', name: 'Đá Quý' },
  { id: 'spiritual', name: 'Tâm Thức' },
  { id: 'analysis', name: 'Phân Tích' },
];

// Difficulty options
const DIFFICULTIES = [
  { id: 'beginner', name: 'Cơ bản', color: COLORS.success },
  { id: 'intermediate', name: 'Trung cấp', color: COLORS.gold },
  { id: 'advanced', name: 'Nâng cao', color: COLORS.error },
];

// Sort options
const SORT_OPTIONS = [
  { id: 'newest', name: 'Mới nhất' },
  { id: 'popular', name: 'Phổ biến nhất' },
  { id: 'rating', name: 'Đánh giá cao' },
  { id: 'price_low', name: 'Giá thấp đến cao' },
  { id: 'price_high', name: 'Giá cao đến thấp' },
];

// Rating options
const RATINGS = [5, 4, 3, 2, 1];

// Price range presets (VND)
const PRICE_PRESETS = [
  { id: 'free', name: 'Miễn phí', min: 0, max: 0 },
  { id: 'under_500k', name: 'Dưới 500K', min: 1, max: 500000 },
  { id: '500k_1m', name: '500K - 1M', min: 500000, max: 1000000 },
  { id: '1m_5m', name: '1M - 5M', min: 1000000, max: 5000000 },
  { id: 'over_5m', name: 'Trên 5M', min: 5000000, max: 999999999 },
];

const CourseFilterSheet = ({
  visible,
  onClose,
  initialFilters = {},
  onApply,
}) => {
  const [filters, setFilters] = useState({
    categories: [],
    difficulties: [],
    pricePreset: null,
    rating: null,
    sortBy: 'newest',
    isFree: false,
    hasQuiz: false,
    hasCertificate: false,
    ...initialFilters,
  });

  // Reset to initial filters when sheet opens
  useEffect(() => {
    if (visible) {
      setFilters({
        categories: [],
        difficulties: [],
        pricePreset: null,
        rating: null,
        sortBy: 'newest',
        isFree: false,
        hasQuiz: false,
        hasCertificate: false,
        ...initialFilters,
      });
    }
  }, [visible, initialFilters]);

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

  const toggleDifficulty = (difficulty) => {
    setFilters(prev => {
      const exists = prev.difficulties.find(d => d.id === difficulty.id);
      if (exists) {
        return {
          ...prev,
          difficulties: prev.difficulties.filter(d => d.id !== difficulty.id),
        };
      } else {
        return {
          ...prev,
          difficulties: [...prev.difficulties, difficulty],
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

  const selectPricePreset = (preset) => {
    setFilters(prev => ({
      ...prev,
      pricePreset: prev.pricePreset?.id === preset.id ? null : preset,
      isFree: preset.id === 'free' ? true : prev.isFree,
    }));
  };

  const selectSort = (sort) => {
    setFilters(prev => ({
      ...prev,
      sortBy: sort.id,
    }));
  };

  const handleReset = () => {
    setFilters({
      categories: [],
      difficulties: [],
      pricePreset: null,
      rating: null,
      sortBy: 'newest',
      isFree: false,
      hasQuiz: false,
      hasCertificate: false,
    });
  };

  const handleApply = () => {
    onApply?.(filters);
    onClose?.();
  };

  // Count active filters
  const activeFilterCount = [
    filters.categories.length > 0,
    filters.difficulties.length > 0,
    filters.pricePreset !== null,
    filters.rating !== null,
    filters.isFree,
    filters.hasQuiz,
    filters.hasCertificate,
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

            <View style={styles.titleContainer}>
              <Filter size={20} color={COLORS.gold} />
              <Text style={styles.title}>Bộ lọc</Text>
            </View>

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
            {/* Sort Options */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <SortDesc size={18} color={COLORS.gold} />
                <Text style={styles.sectionTitle}>Sắp xếp theo</Text>
              </View>
              <View style={styles.chipGrid}>
                {SORT_OPTIONS.map((sort) => {
                  const isSelected = filters.sortBy === sort.id;
                  return (
                    <TouchableOpacity
                      key={sort.id}
                      style={[
                        styles.chip,
                        isSelected && styles.chipActive,
                      ]}
                      onPress={() => selectSort(sort)}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          isSelected && styles.chipTextActive,
                        ]}
                      >
                        {sort.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Categories */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Danh mục</Text>
              <View style={styles.chipGrid}>
                {COURSE_CATEGORIES.map((cat) => {
                  const isSelected = filters.categories.some(c => c.id === cat.id);
                  return (
                    <TouchableOpacity
                      key={cat.id}
                      style={[
                        styles.chip,
                        isSelected && styles.chipActive,
                      ]}
                      onPress={() => toggleCategory(cat)}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          isSelected && styles.chipTextActive,
                        ]}
                      >
                        {cat.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Difficulty */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Trình độ</Text>
              <View style={styles.chipGrid}>
                {DIFFICULTIES.map((diff) => {
                  const isSelected = filters.difficulties.some(d => d.id === diff.id);
                  return (
                    <TouchableOpacity
                      key={diff.id}
                      style={[
                        styles.chip,
                        isSelected && { backgroundColor: `${diff.color}20`, borderColor: diff.color },
                      ]}
                      onPress={() => toggleDifficulty(diff)}
                      activeOpacity={0.7}
                    >
                      <View style={[styles.difficultyDot, { backgroundColor: diff.color }]} />
                      <Text
                        style={[
                          styles.chipText,
                          isSelected && { color: diff.color, fontWeight: TYPOGRAPHY.fontWeight.medium },
                        ]}
                      >
                        {diff.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Price Range */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Khoảng giá</Text>
              <View style={styles.chipGrid}>
                {PRICE_PRESETS.map((preset) => {
                  const isSelected = filters.pricePreset?.id === preset.id;
                  return (
                    <TouchableOpacity
                      key={preset.id}
                      style={[
                        styles.chip,
                        isSelected && styles.chipActive,
                      ]}
                      onPress={() => selectPricePreset(preset)}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          isSelected && styles.chipTextActive,
                        ]}
                      >
                        {preset.name}
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
                <Text style={styles.toggleLabel}>Chỉ khóa học miễn phí</Text>
                <Switch
                  value={filters.isFree}
                  onValueChange={(v) => setFilters(prev => ({ ...prev, isFree: v }))}
                  trackColor={{ false: 'rgba(255,255,255,0.1)', true: COLORS.gold }}
                  thumbColor={COLORS.textPrimary}
                />
              </View>

              <View style={styles.toggleRow}>
                <Text style={styles.toggleLabel}>Có bài Quiz</Text>
                <Switch
                  value={filters.hasQuiz}
                  onValueChange={(v) => setFilters(prev => ({ ...prev, hasQuiz: v }))}
                  trackColor={{ false: 'rgba(255,255,255,0.1)', true: COLORS.gold }}
                  thumbColor={COLORS.textPrimary}
                />
              </View>

              <View style={styles.toggleRow}>
                <Text style={styles.toggleLabel}>Có chứng chỉ</Text>
                <Switch
                  value={filters.hasCertificate}
                  onValueChange={(v) => setFilters(prev => ({ ...prev, hasCertificate: v }))}
                  trackColor={{ false: 'rgba(255,255,255,0.1)', true: COLORS.gold }}
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
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
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
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    marginBottom: SPACING.md,
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'transparent',
    gap: SPACING.xs,
  },
  chipActive: {
    backgroundColor: 'rgba(255, 189, 89, 0.2)',
    borderColor: COLORS.gold,
  },
  chipText: {
    color: COLORS.textSecondary,
    fontSize: TYPOGRAPHY.fontSize.md,
  },
  chipTextActive: {
    color: COLORS.gold,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  difficultyDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
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
    backgroundColor: 'rgba(255, 189, 89, 0.2)',
    borderColor: COLORS.gold,
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
    backgroundColor: COLORS.gold,
    paddingVertical: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
  },
  applyButtonText: {
    color: COLORS.bgDarkest,
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
});

export default CourseFilterSheet;
