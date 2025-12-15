/**
 * Gemral - Filter Modal Component
 * Feature #17: Advanced filter options for posts
 * Uses dark glass theme from DESIGN_TOKENS
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
} from 'react-native';
import { BlurView } from 'expo-blur';
import {
  SlidersHorizontal,
  X,
  Check,
  Clock,
  TrendingUp,
  MessageCircle,
  Heart,
  Calendar,
  Tag,
  User,
} from 'lucide-react-native';
import { COLORS, SPACING, TYPOGRAPHY, GLASS, BUTTON } from '../utils/tokens';

const FilterModal = ({
  visible,
  onClose,
  onApply,
  initialFilters = {},
  topics = [],
}) => {
  const [filters, setFilters] = useState({
    sortBy: 'newest',
    timeRange: 'all',
    topic: null,
    hasImages: null,
    hasPolls: null,
    minLikes: 0,
    minComments: 0,
    following: false,
    ...initialFilters,
  });

  useEffect(() => {
    if (visible) {
      setFilters({ ...filters, ...initialFilters });
    }
  }, [visible, initialFilters]);

  const handleApply = () => {
    onApply?.(filters);
    onClose?.();
  };

  const handleReset = () => {
    setFilters({
      sortBy: 'newest',
      timeRange: 'all',
      topic: null,
      hasImages: null,
      hasPolls: null,
      minLikes: 0,
      minComments: 0,
      following: false,
    });
  };

  const sortOptions = [
    { key: 'newest', label: 'Mới nhất', icon: Clock },
    { key: 'popular', label: 'Phổ biến', icon: TrendingUp },
    { key: 'most_liked', label: 'Nhiều tim nhất', icon: Heart },
    { key: 'most_commented', label: 'Nhiều bình luận', icon: MessageCircle },
  ];

  const timeRangeOptions = [
    { key: 'all', label: 'Tất cả' },
    { key: 'today', label: 'Hôm nay' },
    { key: 'week', label: 'Tuần này' },
    { key: 'month', label: 'Tháng này' },
    { key: 'year', label: 'Năm nay' },
  ];

  const engagementOptions = [
    { key: 0, label: 'Tất cả' },
    { key: 5, label: '5+' },
    { key: 10, label: '10+' },
    { key: 50, label: '50+' },
    { key: 100, label: '100+' },
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <BlurView intensity={20} style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color={COLORS.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.title}>Bộ lọc nâng cao</Text>
            <TouchableOpacity onPress={handleReset} style={styles.resetButton}>
              <Text style={styles.resetText}>Đặt lại</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Sort By */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <SlidersHorizontal size={18} color={COLORS.purple} />
                <Text style={styles.sectionTitle}>Sắp xếp theo</Text>
              </View>
              <View style={styles.optionsGrid}>
                {sortOptions.map((option) => {
                  const Icon = option.icon;
                  const isSelected = filters.sortBy === option.key;
                  return (
                    <TouchableOpacity
                      key={option.key}
                      style={[styles.optionCard, isSelected && styles.optionCardSelected]}
                      onPress={() => setFilters({ ...filters, sortBy: option.key })}
                    >
                      <Icon
                        size={20}
                        color={isSelected ? COLORS.textPrimary : COLORS.textMuted}
                      />
                      <Text
                        style={[
                          styles.optionLabel,
                          isSelected && styles.optionLabelSelected,
                        ]}
                      >
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Time Range */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Calendar size={18} color={COLORS.purple} />
                <Text style={styles.sectionTitle}>Thời gian</Text>
              </View>
              <View style={styles.chipRow}>
                {timeRangeOptions.map((option) => {
                  const isSelected = filters.timeRange === option.key;
                  return (
                    <TouchableOpacity
                      key={option.key}
                      style={[styles.chip, isSelected && styles.chipSelected]}
                      onPress={() => setFilters({ ...filters, timeRange: option.key })}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          isSelected && styles.chipTextSelected,
                        ]}
                      >
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Topics */}
            {topics.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Tag size={18} color={COLORS.purple} />
                  <Text style={styles.sectionTitle}>Chủ đề</Text>
                </View>
                <View style={styles.chipRow}>
                  <TouchableOpacity
                    style={[styles.chip, !filters.topic && styles.chipSelected]}
                    onPress={() => setFilters({ ...filters, topic: null })}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        !filters.topic && styles.chipTextSelected,
                      ]}
                    >
                      Tất cả
                    </Text>
                  </TouchableOpacity>
                  {topics.map((topic) => {
                    const isSelected = filters.topic === topic.id;
                    return (
                      <TouchableOpacity
                        key={topic.id}
                        style={[styles.chip, isSelected && styles.chipSelected]}
                        onPress={() => setFilters({ ...filters, topic: topic.id })}
                      >
                        <Text
                          style={[
                            styles.chipText,
                            isSelected && styles.chipTextSelected,
                          ]}
                        >
                          {topic.name}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            )}

            {/* Content Type */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Tag size={18} color={COLORS.purple} />
                <Text style={styles.sectionTitle}>Loại nội dung</Text>
              </View>
              <View style={styles.toggleRow}>
                <TouchableOpacity
                  style={[
                    styles.toggleItem,
                    filters.hasImages === true && styles.toggleItemActive,
                  ]}
                  onPress={() =>
                    setFilters({
                      ...filters,
                      hasImages: filters.hasImages === true ? null : true,
                    })
                  }
                >
                  <Text style={styles.toggleText}>Có hình ảnh</Text>
                  {filters.hasImages === true && (
                    <Check size={16} color={COLORS.success} />
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.toggleItem,
                    filters.hasPolls === true && styles.toggleItemActive,
                  ]}
                  onPress={() =>
                    setFilters({
                      ...filters,
                      hasPolls: filters.hasPolls === true ? null : true,
                    })
                  }
                >
                  <Text style={styles.toggleText}>Có bình chọn</Text>
                  {filters.hasPolls === true && (
                    <Check size={16} color={COLORS.success} />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Minimum Likes */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Heart size={18} color={COLORS.purple} />
                <Text style={styles.sectionTitle}>Lượt thích tối thiểu</Text>
              </View>
              <View style={styles.chipRow}>
                {engagementOptions.map((option) => {
                  const isSelected = filters.minLikes === option.key;
                  return (
                    <TouchableOpacity
                      key={option.key}
                      style={[styles.chip, isSelected && styles.chipSelected]}
                      onPress={() => setFilters({ ...filters, minLikes: option.key })}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          isSelected && styles.chipTextSelected,
                        ]}
                      >
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Minimum Comments */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <MessageCircle size={18} color={COLORS.purple} />
                <Text style={styles.sectionTitle}>Bình luận tối thiểu</Text>
              </View>
              <View style={styles.chipRow}>
                {engagementOptions.map((option) => {
                  const isSelected = filters.minComments === option.key;
                  return (
                    <TouchableOpacity
                      key={option.key}
                      style={[styles.chip, isSelected && styles.chipSelected]}
                      onPress={() => setFilters({ ...filters, minComments: option.key })}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          isSelected && styles.chipTextSelected,
                        ]}
                      >
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Following Only */}
            <View style={styles.section}>
              <TouchableOpacity
                style={[
                  styles.fullWidthToggle,
                  filters.following && styles.fullWidthToggleActive,
                ]}
                onPress={() => setFilters({ ...filters, following: !filters.following })}
              >
                <View style={styles.toggleContent}>
                  <User size={20} color={filters.following ? COLORS.textPrimary : COLORS.textMuted} />
                  <Text
                    style={[
                      styles.fullWidthToggleText,
                      filters.following && styles.fullWidthToggleTextActive,
                    ]}
                  >
                    Chỉ hiển thị từ người đang theo dõi
                  </Text>
                </View>
                {filters.following && <Check size={20} color={COLORS.success} />}
              </TouchableOpacity>
            </View>
          </ScrollView>

          {/* Apply Button */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
              <Text style={styles.applyButtonText}>Áp dụng bộ lọc</Text>
            </TouchableOpacity>
          </View>
        </View>
      </BlurView>
    </Modal>
  );
};

/**
 * Filter Chips Component - Shows active filters
 */
export const FilterChips = ({ filters, onRemove, onClear }) => {
  const activeFilters = [];

  if (filters.sortBy && filters.sortBy !== 'newest') {
    const sortLabels = {
      popular: 'Phổ biến',
      most_liked: 'Nhiều tim',
      most_commented: 'Nhiều bình luận',
    };
    activeFilters.push({ key: 'sortBy', label: sortLabels[filters.sortBy] });
  }

  if (filters.timeRange && filters.timeRange !== 'all') {
    const timeLabels = {
      today: 'Hôm nay',
      week: 'Tuần này',
      month: 'Tháng này',
      year: 'Năm nay',
    };
    activeFilters.push({ key: 'timeRange', label: timeLabels[filters.timeRange] });
  }

  if (filters.topic) {
    activeFilters.push({ key: 'topic', label: filters.topicName || 'Chủ đề' });
  }

  if (filters.hasImages) {
    activeFilters.push({ key: 'hasImages', label: 'Có ảnh' });
  }

  if (filters.hasPolls) {
    activeFilters.push({ key: 'hasPolls', label: 'Co poll' });
  }

  if (filters.minLikes > 0) {
    activeFilters.push({ key: 'minLikes', label: `${filters.minLikes}+ tim` });
  }

  if (filters.minComments > 0) {
    activeFilters.push({ key: 'minComments', label: `${filters.minComments}+ bình luận` });
  }

  if (filters.following) {
    activeFilters.push({ key: 'following', label: 'Đang theo dõi' });
  }

  if (activeFilters.length === 0) return null;

  return (
    <View style={chipStyles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {activeFilters.map((filter) => (
          <TouchableOpacity
            key={filter.key}
            style={chipStyles.chip}
            onPress={() => onRemove?.(filter.key)}
          >
            <Text style={chipStyles.chipText}>{filter.label}</Text>
            <X size={14} color={COLORS.textPrimary} />
          </TouchableOpacity>
        ))}
        {activeFilters.length > 1 && (
          <TouchableOpacity style={chipStyles.clearButton} onPress={onClear}>
            <Text style={chipStyles.clearText}>Xóa tất cả</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  container: {
    backgroundColor: GLASS.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.3)',
  },
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  closeButton: {
    padding: SPACING.xs,
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
  },
  resetButton: {
    padding: SPACING.xs,
  },
  resetText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.cyan,
  },
  // Content
  content: {
    padding: SPACING.lg,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.textPrimary,
  },
  // Options Grid
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  optionCard: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    padding: SPACING.md,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  optionCardSelected: {
    borderColor: COLORS.purple,
    backgroundColor: 'rgba(106, 91, 255, 0.2)',
  },
  optionLabel: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textMuted,
  },
  optionLabelSelected: {
    color: COLORS.textPrimary,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  // Chips
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  chip: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  chipSelected: {
    borderColor: COLORS.purple,
    backgroundColor: 'rgba(106, 91, 255, 0.2)',
  },
  chipText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
  },
  chipTextSelected: {
    color: COLORS.textPrimary,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  // Toggles
  toggleRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  toggleItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  toggleItemActive: {
    borderColor: COLORS.success,
    backgroundColor: 'rgba(0, 255, 136, 0.1)',
  },
  toggleText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textSecondary,
  },
  // Full Width Toggle
  fullWidthToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  fullWidthToggleActive: {
    borderColor: COLORS.purple,
    backgroundColor: 'rgba(106, 91, 255, 0.2)',
  },
  toggleContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  fullWidthToggleText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textMuted,
  },
  fullWidthToggleTextActive: {
    color: COLORS.textPrimary,
  },
  // Footer
  footer: {
    padding: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  applyButton: {
    backgroundColor: COLORS.purple,
    paddingVertical: SPACING.md,
    borderRadius: BUTTON.borderRadius,
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
  },
});

const chipStyles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    backgroundColor: 'rgba(106, 91, 255, 0.3)',
    borderRadius: 16,
    marginRight: SPACING.sm,
  },
  chipText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textPrimary,
  },
  clearButton: {
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
  },
  clearText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.error,
  },
});

export default FilterModal;
