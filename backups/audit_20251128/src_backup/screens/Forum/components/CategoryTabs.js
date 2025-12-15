/**
 * Gemral - Main Feed Tabs Component
 * Horizontal scrollable tabs for main feed types
 * Tabs: Khám phá, Đang theo dõi, Tin tức, Thông báo, Phổ biến
 */

import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import {
  Sparkles,
  Users,
  Newspaper,
  Bell,
  TrendingUp,
  GraduationCap
} from 'lucide-react-native';
import { COLORS, SPACING, TYPOGRAPHY } from '../../../utils/tokens';

// Main feed tabs configuration
// Note: "Dành cho bạn" = personalized feed (formerly "Khám phá" + "Dành Cho Bạn" merged)
const MAIN_TABS = [
  { id: 'explore', name: 'Dành cho bạn', Icon: Sparkles },
  { id: 'following', name: 'Đang theo dõi', Icon: Users },
  { id: 'news', name: 'Tin tức', Icon: Newspaper },
  { id: 'notifications', name: 'Thông báo', Icon: Bell },
  { id: 'popular', name: 'Phổ biến', Icon: TrendingUp },
  { id: 'academy', name: 'Academy', Icon: GraduationCap },
];

const CategoryTabs = ({ selected, onSelect }) => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      {MAIN_TABS.map((tab, index) => {
        const isSelected = tab.id === selected;
        const IconComponent = tab.Icon;

        return (
          <TouchableOpacity
            key={`tab-${index}-${tab.id}`}
            style={[styles.tab, isSelected && styles.tabActive]}
            onPress={() => onSelect(tab.id)}
            activeOpacity={0.7}
          >
            <IconComponent
              size={16}
              color={isSelected ? COLORS.gold : COLORS.textMuted}
              style={styles.tabIcon}
            />
            <Text style={[styles.tabText, isSelected && styles.tabTextActive]}>
              {tab.name}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

// STYLES - Matching TimeframeSelector style (purple border, gold text)
const styles = StyleSheet.create({
  container: {
    maxHeight: 56,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(106, 91, 255, 0.2)',
  },
  content: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    gap: SPACING.sm,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginRight: SPACING.sm,
    height: 36,
  },
  tabActive: {
    backgroundColor: 'rgba(106, 91, 255, 0.2)',
    borderColor: COLORS.purple,
  },
  tabIcon: {
    marginRight: 6,
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

export { MAIN_TABS };
export default CategoryTabs;
