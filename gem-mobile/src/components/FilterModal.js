/**
 * Gemral - Filter Modal Component
 * Feature #17: Advanced filter options for posts
 * Uses dark glass theme from DESIGN_TOKENS
 */

import React, { useState, useEffect, useMemo } from 'react';
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
import { useSettings } from '../contexts/SettingsContext';

const FilterModal = ({
  visible,
  onClose,
  onApply,
  initialFilters = {},
  topics = [],
}) => {
  const { colors, gradients, glass, settings, SPACING, TYPOGRAPHY, t } = useSettings();

  // Get BUTTON token from settings or use defaults
  const BUTTON = {
    borderRadius: 12,
  };

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
    { key: 'newest', label: 'Moi nhat', icon: Clock },
    { key: 'popular', label: 'Pho bien', icon: TrendingUp },
    { key: 'most_liked', label: 'Nhieu tim nhat', icon: Heart },
    { key: 'most_commented', label: 'Nhieu binh luan', icon: MessageCircle },
  ];

  const timeRangeOptions = [
    { key: 'all', label: 'Tat ca' },
    { key: 'today', label: 'Hom nay' },
    { key: 'week', label: 'Tuan nay' },
    { key: 'month', label: 'Thang nay' },
    { key: 'year', label: 'Nam nay' },
  ];

  const engagementOptions = [
    { key: 0, label: 'Tat ca' },
    { key: 5, label: '5+' },
    { key: 10, label: '10+' },
    { key: 50, label: '50+' },
    { key: 100, label: '100+' },
  ];

  const styles = useMemo(() => StyleSheet.create({
    overlay: {
      flex: 1,
      justifyContent: 'flex-end',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    container: {
      backgroundColor: settings.theme === 'light' ? colors.bgDarkest : (glass.background || 'rgba(15, 16, 48, 0.95)'),
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
      color: colors.textPrimary,
    },
    resetButton: {
      padding: SPACING.xs,
    },
    resetText: {
      fontSize: TYPOGRAPHY.fontSize.md,
      color: colors.cyan,
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
      color: colors.textPrimary,
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
      borderColor: colors.purple,
      backgroundColor: 'rgba(106, 91, 255, 0.2)',
    },
    optionLabel: {
      fontSize: TYPOGRAPHY.fontSize.md,
      color: colors.textMuted,
    },
    optionLabelSelected: {
      color: colors.textPrimary,
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
      borderColor: colors.purple,
      backgroundColor: 'rgba(106, 91, 255, 0.2)',
    },
    chipText: {
      fontSize: TYPOGRAPHY.fontSize.sm,
      color: colors.textMuted,
    },
    chipTextSelected: {
      color: colors.textPrimary,
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
      borderColor: colors.success,
      backgroundColor: 'rgba(0, 255, 136, 0.1)',
    },
    toggleText: {
      fontSize: TYPOGRAPHY.fontSize.md,
      color: colors.textSecondary,
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
      borderColor: colors.purple,
      backgroundColor: 'rgba(106, 91, 255, 0.2)',
    },
    toggleContent: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.sm,
    },
    fullWidthToggleText: {
      fontSize: TYPOGRAPHY.fontSize.md,
      color: colors.textMuted,
    },
    fullWidthToggleTextActive: {
      color: colors.textPrimary,
    },
    // Footer
    footer: {
      padding: SPACING.lg,
      borderTopWidth: 1,
      borderTopColor: 'rgba(255, 255, 255, 0.1)',
    },
    applyButton: {
      backgroundColor: colors.purple,
      paddingVertical: SPACING.md,
      borderRadius: BUTTON.borderRadius,
      alignItems: 'center',
    },
    applyButtonText: {
      fontSize: TYPOGRAPHY.fontSize.lg,
      fontWeight: TYPOGRAPHY.fontWeight.semibold,
      color: colors.textPrimary,
    },
  }), [colors, settings.theme, glass, SPACING, TYPOGRAPHY]);

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
              <X size={24} color={colors.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.title}>Bo loc nang cao</Text>
            <TouchableOpacity onPress={handleReset} style={styles.resetButton}>
              <Text style={styles.resetText}>Dat lai</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Sort By */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <SlidersHorizontal size={18} color={colors.purple} />
                <Text style={styles.sectionTitle}>Sap xep theo</Text>
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
                        color={isSelected ? colors.textPrimary : colors.textMuted}
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
                <Calendar size={18} color={colors.purple} />
                <Text style={styles.sectionTitle}>Thoi gian</Text>
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
                  <Tag size={18} color={colors.purple} />
                  <Text style={styles.sectionTitle}>Chu de</Text>
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
                      Tat ca
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
                <Tag size={18} color={colors.purple} />
                <Text style={styles.sectionTitle}>Loai noi dung</Text>
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
                  <Text style={styles.toggleText}>Co hinh anh</Text>
                  {filters.hasImages === true && (
                    <Check size={16} color={colors.success} />
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
                  <Text style={styles.toggleText}>Co binh chon</Text>
                  {filters.hasPolls === true && (
                    <Check size={16} color={colors.success} />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Minimum Likes */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Heart size={18} color={colors.purple} />
                <Text style={styles.sectionTitle}>Luot thich toi thieu</Text>
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
                <MessageCircle size={18} color={colors.purple} />
                <Text style={styles.sectionTitle}>Binh luan toi thieu</Text>
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
                  <User size={20} color={filters.following ? colors.textPrimary : colors.textMuted} />
                  <Text
                    style={[
                      styles.fullWidthToggleText,
                      filters.following && styles.fullWidthToggleTextActive,
                    ]}
                  >
                    Chi hien thi tu nguoi dang theo doi
                  </Text>
                </View>
                {filters.following && <Check size={20} color={colors.success} />}
              </TouchableOpacity>
            </View>
          </ScrollView>

          {/* Apply Button */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
              <Text style={styles.applyButtonText}>Ap dung bo loc</Text>
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
  const { colors, gradients, glass, settings, SPACING, TYPOGRAPHY, t } = useSettings();

  const chipStyles = useMemo(() => StyleSheet.create({
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
      color: colors.textPrimary,
    },
    clearButton: {
      paddingVertical: SPACING.xs,
      paddingHorizontal: SPACING.sm,
    },
    clearText: {
      fontSize: TYPOGRAPHY.fontSize.sm,
      color: colors.error,
    },
  }), [colors, settings.theme, glass, SPACING, TYPOGRAPHY]);

  const activeFilters = [];

  if (filters.sortBy && filters.sortBy !== 'newest') {
    const sortLabels = {
      popular: 'Pho bien',
      most_liked: 'Nhieu tim',
      most_commented: 'Nhieu binh luan',
    };
    activeFilters.push({ key: 'sortBy', label: sortLabels[filters.sortBy] });
  }

  if (filters.timeRange && filters.timeRange !== 'all') {
    const timeLabels = {
      today: 'Hom nay',
      week: 'Tuan nay',
      month: 'Thang nay',
      year: 'Nam nay',
    };
    activeFilters.push({ key: 'timeRange', label: timeLabels[filters.timeRange] });
  }

  if (filters.topic) {
    activeFilters.push({ key: 'topic', label: filters.topicName || 'Chu de' });
  }

  if (filters.hasImages) {
    activeFilters.push({ key: 'hasImages', label: 'Co anh' });
  }

  if (filters.hasPolls) {
    activeFilters.push({ key: 'hasPolls', label: 'Co poll' });
  }

  if (filters.minLikes > 0) {
    activeFilters.push({ key: 'minLikes', label: `${filters.minLikes}+ tim` });
  }

  if (filters.minComments > 0) {
    activeFilters.push({ key: 'minComments', label: `${filters.minComments}+ binh luan` });
  }

  if (filters.following) {
    activeFilters.push({ key: 'following', label: 'Dang theo doi' });
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
            <X size={14} color={colors.textPrimary} />
          </TouchableOpacity>
        ))}
        {activeFilters.length > 1 && (
          <TouchableOpacity style={chipStyles.clearButton} onPress={onClear}>
            <Text style={chipStyles.clearText}>Xoa tat ca</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
};

export default FilterModal;
