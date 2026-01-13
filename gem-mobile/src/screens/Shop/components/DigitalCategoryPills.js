/**
 * Gemral - Digital Category Pills Component
 * Horizontal scrollable category filter for digital products
 * Style matches ShopCategoryTabs for consistency
 */

import React, { memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { COLORS, SPACING, TYPOGRAPHY, GLASS } from '../../../utils/tokens';
import { DIGITAL_CATEGORIES } from '../../../utils/digitalProductsConfig';

const DigitalCategoryPills = ({
  categories = DIGITAL_CATEGORIES,
  selectedCategory = 'all',
  onSelectCategory,
  style,
}) => {
  const handleSelect = (categoryId) => {
    if (onSelectCategory) {
      onSelectCategory(categoryId);
    }
  };

  return (
    <View style={[styles.container, style]}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {categories.map((category) => {
          const isSelected = selectedCategory === category.id;
          const IconComponent = category.icon;

          return (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.tab,
                isSelected && styles.tabActive,
              ]}
              onPress={() => handleSelect(category.id)}
              activeOpacity={0.7}
            >
              {IconComponent && (
                <IconComponent
                  size={14}
                  color={isSelected ? COLORS.gold : COLORS.textMuted}
                  strokeWidth={2}
                />
              )}
              <Text
                style={[
                  styles.tabText,
                  isSelected && styles.tabTextActive,
                ]}
              >
                {category.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

// STYLES - Matching ShopCategoryTabs exactly (purple border, gold text)
const styles = StyleSheet.create({
  container: {
    backgroundColor: 'transparent',
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    gap: SPACING.sm,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginRight: SPACING.sm,
    height: 36,
    gap: SPACING.xs,
  },
  tabActive: {
    backgroundColor: 'rgba(106, 91, 255, 0.2)',
    borderColor: COLORS.purple,
  },
  tabText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textMuted,
  },
  tabTextActive: {
    color: COLORS.gold,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
});

export default memo(DigitalCategoryPills);
