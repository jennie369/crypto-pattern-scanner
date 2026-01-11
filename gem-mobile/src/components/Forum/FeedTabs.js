/**
 * FeedTabs Component
 * Feed type selector with horizontal scroll
 * Phase 4: View Count & Algorithm (30/12/2024)
 */

import React, { memo, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Pressable,
} from 'react-native';
import {
  Clock,
  Flame,
  TrendingUp,
  Sparkles,
} from 'lucide-react-native';
import { COLORS, SPACING } from '../../utils/tokens';

/**
 * Feed type configurations
 */
export const FEED_TYPES = [
  { id: 'latest', label: 'Moi nhat', icon: Clock },
  { id: 'hot', label: 'Noi bat', icon: Flame },
  { id: 'trending', label: 'Xu huong', icon: TrendingUp },
  { id: 'foryou', label: 'Cho ban', icon: Sparkles },
];

/**
 * FeedTabs - Feed type selector
 *
 * @param {Object} props
 * @param {string} props.activeType - Currently active feed type
 * @param {Function} props.onChangeType - Callback when type changes
 * @param {Object} props.style - Additional container style
 */
const FeedTabs = ({
  activeType = 'latest',
  onChangeType,
  style,
}) => {
  const handlePress = useCallback((type) => {
    if (type !== activeType) {
      onChangeType?.(type);
    }
  }, [activeType, onChangeType]);

  return (
    <View style={[styles.container, style]}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {FEED_TYPES.map((feed) => {
          const isActive = activeType === feed.id;
          const IconComponent = feed.icon;

          return (
            <Pressable
              key={feed.id}
              style={[styles.tab, isActive && styles.tabActive]}
              onPress={() => handlePress(feed.id)}
            >
              <IconComponent
                size={16}
                color={isActive ? COLORS.gold : COLORS.textMuted}
                strokeWidth={2}
              />
              <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                {feed.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  scrollContent: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginRight: SPACING.xs,
  },
  tabActive: {
    backgroundColor: 'rgba(255, 189, 89, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 189, 89, 0.3)',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textMuted,
    marginLeft: 6,
  },
  tabTextActive: {
    color: COLORS.gold,
  },
});

export default memo(FeedTabs);
