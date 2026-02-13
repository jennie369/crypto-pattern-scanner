/**
 * ActivityFeed Component
 * Hiển thị activity feed từ user_activities table
 *
 * Features:
 * - Timeline layout với icons
 * - Grouped by date
 * - Support ritual completions, tarot readings, I Ching, etc.
 * - Load more on scroll
 * - Pull to refresh
 *
 * Phase 2: VisionBoard Upgrade
 */

import React, { useState, useEffect, useCallback, memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Heart,
  Flame,
  Star,
  Wind,
  Droplets,
  Mail,
  Gift,
  Gem,
  Sparkles,
  Moon,
  Sun,
  Clock,
  ChevronRight,
  Target,
  TrendingUp,
  Award,
  BookOpen,
} from 'lucide-react-native';
import { COLORS, TYPOGRAPHY, SPACING } from '../../utils/tokens';
import { getRecentActivities, ACTIVITY_TYPES } from '../../services/activityService';
import { useAuth } from '../../contexts/AuthContext';

const COMPONENT_NAME = '[ActivityFeed]';

// Icon mapping for activity types
const ACTIVITY_ICONS = {
  [ACTIVITY_TYPES.RITUAL_COMPLETE]: Sparkles,
  [ACTIVITY_TYPES.GOAL_PROGRESS]: Target,
  [ACTIVITY_TYPES.GOAL_COMPLETE]: Award,
  [ACTIVITY_TYPES.HABIT_CHECK]: TrendingUp,
  [ACTIVITY_TYPES.TAROT_READING]: Moon,
  [ACTIVITY_TYPES.ICHING_READING]: BookOpen,
  [ACTIVITY_TYPES.JOURNAL_ENTRY]: BookOpen,
  [ACTIVITY_TYPES.XP_EARNED]: Star,
  [ACTIVITY_TYPES.STREAK_MILESTONE]: Flame,
  [ACTIVITY_TYPES.LEVEL_UP]: Award,
};

// Color mapping for activity types
const ACTIVITY_COLORS = {
  [ACTIVITY_TYPES.RITUAL_COMPLETE]: ['#6A5BFF', '#9D4EDD'],
  [ACTIVITY_TYPES.GOAL_PROGRESS]: ['#4169E1', '#1E90FF'],
  [ACTIVITY_TYPES.GOAL_COMPLETE]: ['#FFD700', '#FFA500'],
  [ACTIVITY_TYPES.HABIT_CHECK]: ['#00CEC9', '#0984E3'],
  [ACTIVITY_TYPES.TAROT_READING]: ['#9D4EDD', '#6A5BFF'],
  [ACTIVITY_TYPES.ICHING_READING]: ['#2D3436', '#636E72'],
  [ACTIVITY_TYPES.JOURNAL_ENTRY]: ['#00B894', '#00CEC9'],
  [ACTIVITY_TYPES.XP_EARNED]: ['#FFD700', '#FFA500'],
  [ACTIVITY_TYPES.STREAK_MILESTONE]: ['#FF6B6B', '#FF8E53'],
  [ACTIVITY_TYPES.LEVEL_UP]: ['#F093FB', '#F5576C'],
};

// Ritual icon mapping
const RITUAL_ICONS = {
  'heart-expansion': Heart,
  'gratitude-flow': Gift,
  'cleansing-breath': Wind,
  'water-manifest': Droplets,
  'letter-to-universe': Mail,
  'burn-release': Flame,
  'star-wish': Star,
  'crystal-healing': Gem,
};

/**
 * Format relative time (e.g., "2 giờ trước")
 */
const formatRelativeTime = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Vừa xong';
  if (diffMins < 60) return `${diffMins} phút trước`;
  if (diffHours < 24) return `${diffHours} giờ trước`;
  if (diffDays === 1) return 'Hôm qua';
  if (diffDays < 7) return `${diffDays} ngày trước`;

  return date.toLocaleDateString('vi-VN', { day: 'numeric', month: 'short' });
};

/**
 * Format date for section header
 */
const formatDateHeader = (dateString) => {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) {
    return 'Hôm nay';
  }
  if (date.toDateString() === yesterday.toDateString()) {
    return 'Hôm qua';
  }

  return date.toLocaleDateString('vi-VN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
};

/**
 * Activity Item Component
 */
const ActivityItem = memo(({ activity, onPress }) => {
  // Get icon based on activity type
  let IconComponent = ACTIVITY_ICONS[activity.activityType] || Sparkles;

  // For ritual completions, use ritual-specific icon
  if (activity.activityType === ACTIVITY_TYPES.RITUAL_COMPLETE && activity.metadata?.ritual_slug) {
    IconComponent = RITUAL_ICONS[activity.metadata.ritual_slug] || Sparkles;
  }

  const colors = ACTIVITY_COLORS[activity.activityType] || ['#6A5BFF', '#9D4EDD'];

  return (
    <TouchableOpacity
      style={styles.activityItem}
      onPress={() => onPress?.(activity)}
      activeOpacity={0.8}
    >
      <View style={styles.activityTimeline}>
        <View style={[styles.timelineDot, { backgroundColor: colors[0] }]} />
        <View style={styles.timelineLine} />
      </View>

      <LinearGradient
        colors={[`${colors[0]}15`, `${colors[1]}10`]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.activityContent}
      >
        {/* Icon */}
        <View style={[styles.activityIcon, { backgroundColor: `${colors[0]}25` }]}>
          <IconComponent size={20} color={colors[0]} />
        </View>

        {/* Text content */}
        <View style={styles.activityText}>
          <Text style={styles.activityTitle} numberOfLines={1}>
            {activity.title}
          </Text>
          {activity.description && (
            <Text style={styles.activityDescription} numberOfLines={2}>
              {activity.description}
            </Text>
          )}

          {/* XP badge */}
          {activity.xpEarned > 0 && (
            <View style={styles.xpBadge}>
              <Star size={12} color={COLORS.gold} />
              <Text style={styles.xpText}>+{activity.xpEarned} XP</Text>
            </View>
          )}
        </View>

        {/* Time */}
        <View style={styles.activityTimeContainer}>
          <Text style={styles.activityTime}>
            {formatRelativeTime(activity.createdAt)}
          </Text>
          <ChevronRight size={14} color={COLORS.textMuted} />
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
});

ActivityItem.displayName = 'ActivityItem';

/**
 * Section Header Component
 */
const SectionHeader = memo(({ date }) => (
  <View style={styles.sectionHeader}>
    <Clock size={14} color={COLORS.textMuted} />
    <Text style={styles.sectionHeaderText}>{formatDateHeader(date)}</Text>
  </View>
));

SectionHeader.displayName = 'SectionHeader';

/**
 * Empty State Component
 */
const EmptyState = () => (
  <View style={styles.emptyState}>
    <Sparkles size={48} color={COLORS.purple} style={{ opacity: 0.5 }} />
    <Text style={styles.emptyTitle}>Chưa có hoạt động</Text>
    <Text style={styles.emptySubtitle}>
      Hoàn thành nghi thức đầu tiên để bắt đầu
    </Text>
  </View>
);

/**
 * Main ActivityFeed Component
 */
const ActivityFeed = ({
  maxItems = 20,
  showHeader = true,
  onActivityPress,
  onViewAll,
  style,
}) => {
  const { user } = useAuth();
  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Group activities by date
  const groupedActivities = React.useMemo(() => {
    const groups = {};

    activities.forEach((activity) => {
      const date = new Date(activity.createdAt).toDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(activity);
    });

    return Object.entries(groups).map(([date, items]) => ({
      date,
      data: items,
    }));
  }, [activities]);

  // Load activities
  const loadActivities = useCallback(async (showLoader = true) => {
    if (!user?.id) return;

    if (showLoader) setIsLoading(true);
    setError(null);

    try {
      const result = await getRecentActivities(user.id, maxItems);
      setActivities(result || []);
      console.log(COMPONENT_NAME, 'Loaded', result?.length || 0, 'activities');
    } catch (err) {
      console.error(COMPONENT_NAME, 'Failed to load activities:', err?.message);
      setError(err?.message || 'Không thể tải hoạt động');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [user?.id, maxItems]);

  // Initial load
  useEffect(() => {
    loadActivities();
  }, [loadActivities]);

  // Pull to refresh
  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    loadActivities(false);
  }, [loadActivities]);

  // Render section header
  const renderSectionHeader = useCallback(({ section }) => (
    <SectionHeader date={section.date} />
  ), []);

  // Render item
  const renderItem = useCallback(({ item }) => (
    <ActivityItem activity={item} onPress={onActivityPress} />
  ), [onActivityPress]);

  // Key extractor
  const keyExtractor = useCallback((item) => item.id, []);

  // Loading state
  if (isLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer, style]}>
        <ActivityIndicator size="small" color={COLORS.purple} />
        <Text style={styles.loadingText}>Đang tải...</Text>
      </View>
    );
  }

  // Error state
  if (error) {
    return (
      <View style={[styles.container, styles.errorContainer, style]}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity onPress={() => loadActivities()} style={styles.retryButton}>
          <Text style={styles.retryText}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      {/* Header */}
      {showHeader && (
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Sparkles size={18} color={COLORS.purple} />
            <Text style={styles.headerTitle}>Hoạt Động Gần Đây</Text>
          </View>
          {onViewAll && (
            <TouchableOpacity onPress={onViewAll} style={styles.viewAllBtn}>
              <Text style={styles.viewAllText}>Xem tất cả</Text>
              <ChevronRight size={14} color={COLORS.purple} />
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Activities List */}
      {activities.length === 0 ? (
        <EmptyState />
      ) : (
        <FlatList
          data={activities}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor={COLORS.purple}
            />
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.glassBg,
    borderRadius: 20,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.15)',
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
  viewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewAllText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.purple,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },

  // Section Header
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingVertical: SPACING.sm,
    marginTop: SPACING.sm,
  },
  sectionHeaderText: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: '600',
    textTransform: 'capitalize',
  },

  // Activity Item
  activityItem: {
    flexDirection: 'row',
    marginBottom: SPACING.sm,
  },
  activityTimeline: {
    width: 20,
    alignItems: 'center',
  },
  timelineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 16,
  },
  timelineLine: {
    flex: 1,
    width: 2,
    backgroundColor: 'rgba(106, 91, 255, 0.2)',
    marginTop: 4,
  },
  activityContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    gap: SPACING.md,
    marginLeft: SPACING.sm,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityText: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  activityDescription: {
    fontSize: 12,
    color: COLORS.textMuted,
    lineHeight: 16,
  },
  xpBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: SPACING.xs,
  },
  xpText: {
    fontSize: 11,
    color: COLORS.gold,
    fontWeight: '600',
  },
  activityTimeContainer: {
    alignItems: 'flex-end',
    gap: 4,
  },
  activityTime: {
    fontSize: 11,
    color: COLORS.textMuted,
  },

  // List
  listContent: {
    paddingBottom: SPACING.md,
  },

  // Loading
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xl,
  },
  loadingText: {
    marginTop: SPACING.sm,
    fontSize: 12,
    color: COLORS.textMuted,
  },

  // Error
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xl,
  },
  errorText: {
    fontSize: 14,
    color: COLORS.error,
    marginBottom: SPACING.md,
  },
  retryButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: 'rgba(106, 91, 255, 0.2)',
    borderRadius: 12,
  },
  retryText: {
    fontSize: 14,
    color: COLORS.purple,
    fontWeight: '600',
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xl * 2,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginTop: SPACING.md,
  },
  emptySubtitle: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
});

export default memo(ActivityFeed);
