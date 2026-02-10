/**
 * Gemral - Feed Category Label Component
 *
 * Displays category badge on posts (Trading, Wellness, Integration, General)
 */

import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { TrendingUp, Sparkles, Infinity, MessageCircle } from 'lucide-react-native';

import { useSettings } from '../../contexts/SettingsContext';
import { CONTENT_CATEGORIES } from '../../services/personalizedFeedService';

const CATEGORY_ICONS = {
  trading: TrendingUp,
  wellness: Sparkles,
  integration: Infinity,
  general: MessageCircle,
};

const FeedCategoryLabel = ({
  category = 'general',
  size = 'small',
  showLabel = true,
  onPress,
  style,
}) => {
  const { colors, gradients, glass, settings, SPACING, TYPOGRAPHY, t } = useSettings();

  const categoryInfo = CONTENT_CATEGORIES[category] || CONTENT_CATEGORIES.general;
  const Icon = CATEGORY_ICONS[category] || MessageCircle;

  const isSmall = size === 'small';
  const isMedium = size === 'medium';

  const iconSize = isSmall ? 12 : isMedium ? 14 : 16;
  const fontSize = isSmall ? 10 : isMedium ? 12 : 14;
  const padding = isSmall ? 4 : isMedium ? 6 : 8;
  const paddingHorizontal = isSmall ? 6 : isMedium ? 8 : 10;

  // Memoized styles
  const styles = useMemo(() => StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      borderRadius: 6,
      borderWidth: 1,
    },
    label: {
      fontWeight: TYPOGRAPHY.fontWeight.medium,
    },
    filterChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 20,
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      borderWidth: 1,
      borderColor: 'transparent',
    },
    filterChipSelected: {
      backgroundColor: 'rgba(255, 189, 89, 0.2)',
      borderColor: colors.gold,
    },
    filterLabel: {
      fontSize: TYPOGRAPHY.fontSize.sm,
      color: colors.textMuted,
      fontWeight: TYPOGRAPHY.fontWeight.medium,
    },
    countBadge: {
      minWidth: 20,
      height: 20,
      borderRadius: 10,
      backgroundColor: colors.textMuted,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 4,
    },
    countText: {
      fontSize: 10,
      color: colors.bgDarkest,
      fontWeight: TYPOGRAPHY.fontWeight.bold,
    },
    filterList: {
      flexDirection: 'row',
      gap: SPACING.sm,
      paddingHorizontal: SPACING.md,
      paddingVertical: SPACING.sm,
    },
  }), [colors, settings.theme, glass, SPACING, TYPOGRAPHY]);

  const containerStyle = [
    styles.container,
    {
      backgroundColor: `${categoryInfo.color}20`,
      borderColor: `${categoryInfo.color}40`,
      paddingVertical: padding,
      paddingHorizontal: paddingHorizontal,
    },
    style,
  ];

  const content = (
    <>
      <Icon size={iconSize} color={categoryInfo.color} />
      {showLabel && (
        <Text
          style={[
            styles.label,
            {
              color: categoryInfo.color,
              fontSize: fontSize,
            },
          ]}
        >
          {categoryInfo.labelVi}
        </Text>
      )}
    </>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        style={containerStyle}
        onPress={onPress}
        activeOpacity={0.7}
      >
        {content}
      </TouchableOpacity>
    );
  }

  return <View style={containerStyle}>{content}</View>;
};

// Category filter chip for ForumScreen
export const CategoryFilterChip = ({
  category,
  isSelected,
  onSelect,
  count,
}) => {
  const { colors, gradients, glass, settings, SPACING, TYPOGRAPHY, t } = useSettings();

  const categoryInfo = CONTENT_CATEGORIES[category] || CONTENT_CATEGORIES.general;
  const Icon = CATEGORY_ICONS[category] || MessageCircle;

  // Memoized styles
  const styles = useMemo(() => StyleSheet.create({
    filterChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 20,
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      borderWidth: 1,
      borderColor: 'transparent',
    },
    filterLabel: {
      fontSize: TYPOGRAPHY.fontSize.sm,
      color: colors.textMuted,
      fontWeight: TYPOGRAPHY.fontWeight.medium,
    },
    countBadge: {
      minWidth: 20,
      height: 20,
      borderRadius: 10,
      backgroundColor: colors.textMuted,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 4,
    },
    countText: {
      fontSize: 10,
      color: colors.bgDarkest,
      fontWeight: TYPOGRAPHY.fontWeight.bold,
    },
  }), [colors, settings.theme, glass, SPACING, TYPOGRAPHY]);

  return (
    <TouchableOpacity
      style={[
        styles.filterChip,
        isSelected && {
          backgroundColor: `${categoryInfo.color}30`,
          borderColor: categoryInfo.color,
        },
      ]}
      onPress={() => onSelect(category)}
      activeOpacity={0.7}
    >
      <Icon
        size={16}
        color={isSelected ? categoryInfo.color : colors.textMuted}
      />
      <Text
        style={[
          styles.filterLabel,
          isSelected && { color: categoryInfo.color },
        ]}
      >
        {categoryInfo.labelVi}
      </Text>
      {count !== undefined && count > 0 && (
        <View
          style={[
            styles.countBadge,
            isSelected && { backgroundColor: categoryInfo.color },
          ]}
        >
          <Text style={styles.countText}>
            {count > 99 ? '99+' : count}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

// All categories horizontal list
export const CategoryFilterList = ({
  selectedCategory,
  onSelectCategory,
  stats = {},
  showAll = true,
}) => {
  const { colors, gradients, glass, settings, SPACING, TYPOGRAPHY, t } = useSettings();

  const categories = showAll
    ? ['all', 'trading', 'wellness', 'integration', 'general']
    : ['trading', 'wellness', 'integration', 'general'];

  // Memoized styles
  const styles = useMemo(() => StyleSheet.create({
    filterChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 20,
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      borderWidth: 1,
      borderColor: 'transparent',
    },
    filterChipSelected: {
      backgroundColor: 'rgba(255, 189, 89, 0.2)',
      borderColor: colors.gold,
    },
    filterLabel: {
      fontSize: TYPOGRAPHY.fontSize.sm,
      color: colors.textMuted,
      fontWeight: TYPOGRAPHY.fontWeight.medium,
    },
    filterList: {
      flexDirection: 'row',
      gap: SPACING.sm,
      paddingHorizontal: SPACING.md,
      paddingVertical: SPACING.sm,
    },
  }), [colors, settings.theme, glass, SPACING, TYPOGRAPHY]);

  return (
    <View style={styles.filterList}>
      {categories.map((cat) => {
        if (cat === 'all') {
          return (
            <TouchableOpacity
              key="all"
              style={[
                styles.filterChip,
                selectedCategory === null && styles.filterChipSelected,
              ]}
              onPress={() => onSelectCategory(null)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.filterLabel,
                  selectedCategory === null && { color: colors.gold },
                ]}
              >
                Tất cả
              </Text>
            </TouchableOpacity>
          );
        }

        return (
          <CategoryFilterChip
            key={cat}
            category={cat}
            isSelected={selectedCategory === cat}
            onSelect={onSelectCategory}
            count={stats[cat]?.recent_count}
          />
        );
      })}
    </View>
  );
};

export default FeedCategoryLabel;
