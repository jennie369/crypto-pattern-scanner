/**
 * GEM Platform - Category Filter Component
 * Dark theme support
 */

import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Gem, BookOpen, Star, Package, Gift, LayoutGrid } from 'lucide-react-native';
import { COLORS, SPACING, TYPOGRAPHY } from '../../../utils/tokens';

const CATEGORY_ICONS = {
  all: LayoutGrid,
  crystals: Gem,
  courses: BookOpen,
  subscriptions: Star,
  merchandise: Package,
  'gift-cards': Gift,
};

const CategoryFilter = ({ categories, selected, onSelect, darkMode = false }) => {
  // Default categories if none provided
  const defaultCategories = [
    { id: 'all', title: 'Tất cả', handle: null },
    { id: 'crystals', title: 'Đá Quý', handle: 'crystals' },
    { id: 'courses', title: 'Khóa Học', handle: 'courses' },
    { id: 'subscriptions', title: 'Gói VIP', handle: 'subscriptions' },
    { id: 'merchandise', title: 'Phụ Kiện', handle: 'merchandise' },
    { id: 'gift-cards', title: 'Gift Card', handle: 'gift-cards' },
  ];

  // Filter out duplicates and "Tất cả" from categories before adding it at the beginning
  const filteredCategories = categories.filter(cat =>
    cat.id !== 'all' &&
    cat.handle !== null &&
    cat.title?.toLowerCase() !== 'tất cả'
  );

  // Remove duplicate categories by id or handle
  const uniqueCategories = filteredCategories.filter((cat, index, self) =>
    index === self.findIndex(c =>
      (c.id && c.id === cat.id) || (c.handle && c.handle === cat.handle)
    )
  );

  const displayCategories = uniqueCategories.length > 0
    ? [{ id: 'all', title: 'Tất cả', handle: null }, ...uniqueCategories]
    : defaultCategories;

  // Dynamic styles based on dark mode
  const dynamicStyles = darkMode ? darkStyles : lightStyles;

  return (
    <View style={[styles.container, dynamicStyles.container]}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {displayCategories.map((category, index) => {
          const isActive = selected === category.handle;
          const IconComponent = CATEGORY_ICONS[category.handle || category.id] || Gem;

          return (
            <TouchableOpacity
              key={`cat-${index}-${category.id || category.handle || 'all'}`}
              style={[
                styles.tab,
                dynamicStyles.tab,
                isActive && styles.tabActive,
                isActive && dynamicStyles.tabActive,
              ]}
              onPress={() => onSelect(category.handle)}
              activeOpacity={0.7}
            >
              <IconComponent
                size={16}
                color={isActive ? COLORS.gold : COLORS.textMuted}
                style={styles.icon}
              />
              <Text style={[
                styles.tabText,
                dynamicStyles.tabText,
                isActive && styles.tabTextActive,
                isActive && dynamicStyles.tabTextActive,
              ]}>
                {category.title}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
    borderWidth: 1,
  },
  tabActive: {
    // Active styles in dynamic styles
  },
  icon: {
    marginRight: 6,
  },
  tabText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  tabTextActive: {
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
});

// Light theme styles
const lightStyles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.bgWhite,
    borderBottomColor: COLORS.bgGray,
  },
  tab: {
    backgroundColor: COLORS.bgGray,
    borderColor: 'transparent',
  },
  tabActive: {
    backgroundColor: COLORS.burgundy,
  },
  tabText: {
    color: COLORS.textMuted,
  },
  tabTextActive: {
    color: COLORS.bgWhite,
  },
});

// Dark theme styles - Matching TimeframeSelector (purple border, gold text)
const darkStyles = StyleSheet.create({
  container: {
    backgroundColor: 'transparent',
    borderBottomColor: 'rgba(106, 91, 255, 0.2)',
  },
  tab: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  tabActive: {
    backgroundColor: 'rgba(106, 91, 255, 0.2)',
    borderColor: COLORS.purple,
  },
  tabText: {
    color: COLORS.textMuted,
  },
  tabTextActive: {
    color: COLORS.gold,
  },
});

export default CategoryFilter;
