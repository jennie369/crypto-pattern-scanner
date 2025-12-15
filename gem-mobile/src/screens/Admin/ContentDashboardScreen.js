/**
 * Gemral - Content Dashboard Screen
 * Main dashboard for push notifications and content management
 * @description Admin hub for content and push notifications
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  LayoutDashboard,
  Bell,
  FileText,
  Send,
  Calendar,
  BarChart2,
  ChevronRight,
  TrendingUp,
  Clock,
  Plus,
  Zap,
  Users,
  Eye,
  MousePointer,
  Copy,
  Settings,
  AlertCircle,
  RefreshCw,
} from 'lucide-react-native';

// Services
import notificationService from '../../services/notificationService';
import { contentAnalyticsService } from '../../services/contentAnalyticsService';

// Components
import { TemplateCard } from '../../components/Admin';

// Theme
import { COLORS, SPACING, TYPOGRAPHY, GLASS, GRADIENTS } from '../../utils/tokens';

// ========== STAT CARD ==========
const StatCard = ({ icon: Icon, value, label, color = COLORS.gold, onPress }) => (
  <TouchableOpacity
    style={styles.statCard}
    onPress={onPress}
    disabled={!onPress}
    activeOpacity={onPress ? 0.7 : 1}
  >
    <View style={[styles.statIconContainer, { backgroundColor: `${color}20` }]}>
      <Icon size={20} color={color} />
    </View>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </TouchableOpacity>
);

// ========== QUICK ACTION BUTTON ==========
const QuickAction = ({ icon: Icon, label, color, onPress }) => (
  <TouchableOpacity style={styles.quickAction} onPress={onPress}>
    <View style={[styles.quickActionIcon, { backgroundColor: color }]}>
      <Icon size={20} color={COLORS.bgDarkest} />
    </View>
    <Text style={styles.quickActionLabel}>{label}</Text>
  </TouchableOpacity>
);

// ========== UPCOMING ITEM ==========
const UpcomingItem = ({ item, type, onPress }) => {
  const isPush = type === 'push';
  const time = item?.scheduled_at
    ? new Date(item.scheduled_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    : item?.scheduled_time?.substring(0, 5) || '--:--';

  const date = item?.scheduled_at
    ? new Date(item.scheduled_at).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })
    : item?.scheduled_date || '';

  return (
    <TouchableOpacity style={styles.upcomingItem} onPress={() => onPress?.(item)} activeOpacity={0.7}>
      <View style={[styles.upcomingIcon, { backgroundColor: isPush ? 'rgba(255,189,89,0.2)' : 'rgba(0,240,255,0.2)' }]}>
        {isPush ? (
          <Bell size={18} color={COLORS.gold} />
        ) : (
          <FileText size={18} color={COLORS.cyan} />
        )}
      </View>
      <View style={styles.upcomingContent}>
        <Text style={styles.upcomingTitle} numberOfLines={1}>
          {item?.title || 'Không có tiêu đề'}
        </Text>
        <View style={styles.upcomingMeta}>
          <Clock size={12} color={COLORS.textMuted} />
          <Text style={styles.upcomingTime}>{date} {time}</Text>
          <Text style={[styles.upcomingType, { color: isPush ? COLORS.gold : COLORS.cyan }]}>
            {isPush ? 'Push' : 'Post'}
          </Text>
        </View>
      </View>
      <ChevronRight size={18} color={COLORS.textMuted} />
    </TouchableOpacity>
  );
};

// ========== MENU ITEM ==========
const MenuItem = ({ icon: Icon, label, value, onPress }) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress}>
    <View style={styles.menuItemLeft}>
      <Icon size={20} color={COLORS.gold} />
      <Text style={styles.menuItemLabel}>{label}</Text>
    </View>
    <View style={styles.menuItemRight}>
      {value && <Text style={styles.menuItemValue}>{value}</Text>}
      <ChevronRight size={18} color={COLORS.textMuted} />
    </View>
  </TouchableOpacity>
);

// ========== MAIN COMPONENT ==========
const ContentDashboardScreen = () => {
  const navigation = useNavigation();

  // State
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Data
  const [dashboardStats, setDashboardStats] = useState(null);
  const [todayStats, setTodayStats] = useState({ pushToday: 0, postToday: 0 });
  const [upcomingContent, setUpcomingContent] = useState([]);
  const [popularTemplates, setPopularTemplates] = useState([]);

  // Fetch data
  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  const fetchData = async () => {
    setError(null);
    try {
      const [statsResult, todayResult, pushScheduled, templatesResult] = await Promise.all([
        notificationService.getDashboardStats(),
        contentAnalyticsService.getTodayStats(),
        notificationService.getScheduledNotifications({ status: 'scheduled', limit: 5 }),
        notificationService.getTemplates(null, 'push'),
      ]);

      if (statsResult.success) {
        setDashboardStats(statsResult.data);
      }

      if (todayResult.success) {
        setTodayStats(todayResult.data);
      }

      // Combine push and post into upcoming
      const upcoming = [];
      if (pushScheduled.success && pushScheduled.data?.length) {
        pushScheduled.data.forEach(item => {
          upcoming.push({ ...item, _type: 'push' });
        });
      }
      // Sort by scheduled time
      upcoming.sort((a, b) => new Date(a.scheduled_at) - new Date(b.scheduled_at));
      setUpcomingContent(upcoming.slice(0, 5));

      if (templatesResult.success) {
        setPopularTemplates(templatesResult.data?.slice(0, 3) || []);
      }
    } catch (err) {
      console.error('[ContentDashboard] Fetch error:', err);
      setError(err?.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
  };

  // Navigation handlers
  const handleCreatePush = () => navigation.navigate('PushEditor', { mode: 'create' });
  const handleCreatePost = () => navigation.navigate('ContentEditor', { mode: 'add' });
  const handleViewCalendar = () => navigation.navigate('ContentCalendar');
  const handleViewTemplates = () => navigation.navigate('TemplateLibrary');
  const handleViewAnalytics = () => navigation.navigate('ContentAnalytics');
  const handleViewLogs = () => navigation.navigate('AutoPostLogs');

  const handleUpcomingPress = (item) => {
    if (item._type === 'push') {
      navigation.navigate('PushEditor', { mode: 'edit', notificationId: item.id });
    } else {
      navigation.navigate('ContentEditor', { mode: 'edit', contentId: item.id });
    }
  };

  const handleUseTemplate = (template) => {
    navigation.navigate('PushEditor', { mode: 'create', templateId: template.id });
  };

  // Format stats
  const formatNumber = (num) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num?.toString() || '0';
  };

  const formatRate = (rate) => {
    const num = parseFloat(rate) || 0;
    return num > 0 ? `${num.toFixed(1)}%` : '0%';
  };

  // Loading state
  if (loading && !refreshing) {
    return (
      <LinearGradient colors={GRADIENTS.background} style={styles.container}>
        <SafeAreaView style={styles.centerContainer}>
          <ActivityIndicator size="large" color={COLORS.gold} />
          <Text style={styles.loadingText}>Đang tải...</Text>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  // Error state
  if (error) {
    return (
      <LinearGradient colors={GRADIENTS.background} style={styles.container}>
        <SafeAreaView style={styles.centerContainer}>
          <AlertCircle size={48} color={COLORS.error} />
          <Text style={styles.errorTitle}>Đã có lỗi xảy ra</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchData}>
            <RefreshCw size={18} color={COLORS.gold} />
            <Text style={styles.retryText}>Thử lại</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={GRADIENTS.background} style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <LayoutDashboard size={24} color={COLORS.gold} />
            <Text style={styles.headerTitle}>Content Hub</Text>
          </View>
          <TouchableOpacity style={styles.settingsButton} onPress={() => {}}>
            <Settings size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.gold} />
          }
        >
          {/* Stats Row */}
          <View style={styles.statsRow}>
            <StatCard
              icon={Bell}
              value={todayStats.pushToday}
              label="Push hôm nay"
              color={COLORS.gold}
            />
            <StatCard
              icon={FileText}
              value={todayStats.postToday}
              label="Post hôm nay"
              color={COLORS.cyan}
            />
            <StatCard
              icon={Send}
              value={formatNumber(dashboardStats?.total_sent)}
              label="Đã gửi"
              color={COLORS.success}
            />
            <StatCard
              icon={Eye}
              value={formatRate(dashboardStats?.avg_open_rate)}
              label="Open Rate"
              color={COLORS.purple}
            />
          </View>

          {/* Quick Actions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Thao tác nhanh</Text>
            <View style={styles.quickActionsRow}>
              <QuickAction
                icon={Bell}
                label="+ Push"
                color={COLORS.gold}
                onPress={handleCreatePush}
              />
              <QuickAction
                icon={FileText}
                label="+ Post"
                color={COLORS.cyan}
                onPress={handleCreatePost}
              />
              <QuickAction
                icon={Calendar}
                label="Lịch"
                color={COLORS.purple}
                onPress={handleViewCalendar}
              />
              <QuickAction
                icon={BarChart2}
                label="Analytics"
                color={COLORS.success}
                onPress={handleViewAnalytics}
              />
            </View>
          </View>

          {/* Upcoming Content */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Sắp diễn ra</Text>
              <TouchableOpacity onPress={handleViewCalendar}>
                <Text style={styles.seeAll}>Xem tất cả</Text>
              </TouchableOpacity>
            </View>

            {upcomingContent.length === 0 ? (
              <View style={styles.emptyState}>
                <Clock size={32} color={COLORS.textMuted} />
                <Text style={styles.emptyText}>Chưa có nội dung nào được lên lịch</Text>
              </View>
            ) : (
              upcomingContent.map((item, index) => (
                <UpcomingItem
                  key={item.id || index}
                  item={item}
                  type={item._type}
                  onPress={handleUpcomingPress}
                />
              ))
            )}
          </View>

          {/* Popular Templates */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Template phổ biến</Text>
              <TouchableOpacity onPress={handleViewTemplates}>
                <Text style={styles.seeAll}>Xem tất cả</Text>
              </TouchableOpacity>
            </View>

            {popularTemplates.length === 0 ? (
              <View style={styles.emptyState}>
                <Copy size={32} color={COLORS.textMuted} />
                <Text style={styles.emptyText}>Chưa có template nào</Text>
              </View>
            ) : (
              popularTemplates.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  type="push"
                  compact
                  onUse={handleUseTemplate}
                  showActions={false}
                  showStats={false}
                  style={styles.templateCard}
                />
              ))
            )}
          </View>

          {/* Menu Items */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quản lý</Text>
            <View style={styles.menuContainer}>
              <MenuItem
                icon={Calendar}
                label="Content Calendar"
                onPress={handleViewCalendar}
              />
              <MenuItem
                icon={Copy}
                label="Thư viện Template"
                onPress={handleViewTemplates}
              />
              <MenuItem
                icon={BarChart2}
                label="Analytics"
                onPress={handleViewAnalytics}
              />
              <MenuItem
                icon={Clock}
                label="Lịch sử đăng bài"
                onPress={handleViewLogs}
              />
            </View>
          </View>

          {/* Spacer */}
          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

// ========== STYLES ==========
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.fontSize.xxxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.gold,
  },
  settingsButton: {
    padding: SPACING.sm,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.lg,
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
  },
  statCard: {
    flex: 1,
    backgroundColor: GLASS.background,
    borderRadius: SPACING.md,
    padding: SPACING.md,
    marginHorizontal: SPACING.xxs,
    alignItems: 'center',
  },
  statIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xs,
  },
  statValue: {
    fontSize: TYPOGRAPHY.fontSize.display,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
  statLabel: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: 2,
  },

  // Section
  section: {
    marginBottom: SPACING.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.xxxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
  seeAll: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.gold,
  },

  // Quick Actions
  quickActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: GLASS.background,
    borderRadius: GLASS.borderRadius,
    padding: SPACING.lg,
  },
  quickAction: {
    alignItems: 'center',
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xs,
  },
  quickActionLabel: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textSecondary,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },

  // Upcoming
  upcomingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: GLASS.background,
    borderRadius: SPACING.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  upcomingIcon: {
    width: 40,
    height: 40,
    borderRadius: SPACING.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  upcomingContent: {
    flex: 1,
  },
  upcomingTitle: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  upcomingMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  upcomingTime: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textMuted,
  },
  upcomingType: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },

  // Empty state
  emptyState: {
    alignItems: 'center',
    padding: SPACING.xl,
    backgroundColor: GLASS.background,
    borderRadius: GLASS.borderRadius,
  },
  emptyText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textMuted,
    marginTop: SPACING.sm,
  },

  // Template card
  templateCard: {
    marginBottom: SPACING.sm,
  },

  // Menu
  menuContainer: {
    backgroundColor: GLASS.background,
    borderRadius: GLASS.borderRadius,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  menuItemLabel: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    color: COLORS.textPrimary,
  },
  menuItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  menuItemValue: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textMuted,
  },

  // Loading/Error
  loadingText: {
    color: COLORS.textMuted,
    marginTop: SPACING.md,
    fontSize: TYPOGRAPHY.fontSize.lg,
  },
  errorTitle: {
    fontSize: TYPOGRAPHY.fontSize.xxxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
    marginTop: SPACING.md,
  },
  errorMessage: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textMuted,
    marginTop: SPACING.sm,
    textAlign: 'center',
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,189,89,0.2)',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: SPACING.sm,
    marginTop: SPACING.lg,
    gap: SPACING.sm,
  },
  retryText: {
    color: COLORS.gold,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    fontSize: TYPOGRAPHY.fontSize.lg,
  },
});

export default ContentDashboardScreen;
