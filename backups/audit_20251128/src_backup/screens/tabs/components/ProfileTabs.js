/**
 * Gemral - Profile Tabs Component
 * 3 tabs: Bài Viết, Hình Ảnh, Video
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { FileText, Image as ImageIcon, Video } from 'lucide-react-native';
import { COLORS, SPACING, TYPOGRAPHY } from '../../../utils/tokens';

const TABS = [
  { id: 'posts', label: 'Bài Viết', Icon: FileText },
  { id: 'photos', label: 'Hình Ảnh', Icon: ImageIcon },
  { id: 'videos', label: 'Video', Icon: Video },
];

const ProfileTabs = ({ selectedTab, onSelectTab }) => {
  return (
    <View style={styles.container}>
      {TABS.map((tab) => {
        const isSelected = selectedTab === tab.id;
        const IconComponent = tab.Icon;

        return (
          <TouchableOpacity
            key={tab.id}
            style={[styles.tab, isSelected && styles.tabSelected]}
            onPress={() => onSelectTab(tab.id)}
            activeOpacity={0.7}
          >
            <IconComponent
              size={18}
              color={isSelected ? COLORS.gold : COLORS.textMuted}
              style={styles.tabIcon}
            />
            <Text style={[styles.tabText, isSelected && styles.tabTextSelected]}>
              {tab.label}
            </Text>

            {/* Active indicator */}
            {isSelected && <View style={styles.activeIndicator} />}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginTop: SPACING.xl,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    position: 'relative',
  },
  tabSelected: {},
  tabIcon: {
    marginRight: SPACING.xs,
  },
  tabText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.textMuted,
  },
  tabTextSelected: {
    color: COLORS.gold,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
  activeIndicator: {
    position: 'absolute',
    bottom: -1,
    left: SPACING.lg,
    right: SPACING.lg,
    height: 2,
    backgroundColor: COLORS.gold,
    borderRadius: 1,
  },
});

export default ProfileTabs;
