/**
 * GEM Academy - Category Chips
 * Horizontal scrollable category filter chips
 */

import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  BookOpen,
  TrendingUp,
  BarChart3,
  Wallet,
  Shield,
  Code,
  Users,
  Star,
  Zap,
} from 'lucide-react-native';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../../utils/tokens';

// Default category icons
const CATEGORY_ICONS = {
  all: Star,
  trading: TrendingUp,
  analysis: BarChart3,
  defi: Wallet,
  security: Shield,
  development: Code,
  community: Users,
  beginner: BookOpen,
  advanced: Zap,
};

const CategoryChip = ({
  category,
  isSelected,
  onPress,
  showIcon = true,
}) => {
  const { id, name, icon } = category;
  const IconComponent = CATEGORY_ICONS[icon] || CATEGORY_ICONS[id] || BookOpen;

  if (isSelected) {
    return (
      <TouchableOpacity
        onPress={() => onPress(category)}
        activeOpacity={0.7}
        style={styles.chipWrapper}
      >
        <LinearGradient
          colors={[COLORS.gold, '#FFD700']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.chipSelected}
        >
          {showIcon && (
            <IconComponent size={14} color={COLORS.bgDarkest} strokeWidth={2.5} />
          )}
          <Text style={styles.chipTextSelected}>{name}</Text>
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={() => onPress(category)}
      activeOpacity={0.7}
      style={[styles.chipWrapper, styles.chip]}
    >
      {showIcon && (
        <IconComponent size={14} color={COLORS.textMuted} strokeWidth={2} />
      )}
      <Text style={styles.chipText}>{name}</Text>
    </TouchableOpacity>
  );
};

const CategoryChips = ({
  categories = [],
  selectedCategory = null,
  onSelectCategory,
  showAllOption = true,
  allLabel = 'Tất cả',
  showIcons = true,
  style = {},
}) => {
  // Build categories list with "All" option
  const allCategories = showAllOption
    ? [{ id: 'all', name: allLabel, icon: 'all' }, ...categories]
    : categories;

  const handleSelect = (category) => {
    if (onSelectCategory) {
      onSelectCategory(category.id === 'all' ? null : category);
    }
  };

  const isSelected = (category) => {
    if (category.id === 'all') {
      return selectedCategory === null;
    }
    return selectedCategory?.id === category.id;
  };

  return (
    <View style={[styles.container, style]}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {allCategories.map((category) => (
          <CategoryChip
            key={category.id}
            category={category}
            isSelected={isSelected(category)}
            onPress={handleSelect}
            showIcon={showIcons}
          />
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: SPACING.md,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    gap: SPACING.sm,
  },
  chipWrapper: {
    marginRight: SPACING.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  chipSelected: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.full,
  },
  chipText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textSecondary,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    marginLeft: SPACING.xs,
  },
  chipTextSelected: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.bgDarkest,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    marginLeft: SPACING.xs,
  },
});

export default CategoryChips;
