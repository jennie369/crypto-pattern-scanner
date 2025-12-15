/**
 * Gemral - Enhanced Notifications Screen
 * Features: Category tabs, swipe to delete, trading alerts
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  Animated,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Swipeable } from 'react-native-gesture-handler';
import {
  Heart,
  MessageCircle,
  UserPlus,
  Bell,
  CheckCheck,
  TrendingUp,
  TrendingDown,
  Target,
  AlertTriangle,
  ShoppingBag,
  Trash2,
  ChartLine,
  Zap,
} from 'lucide-react-native';
import { forumService } from '../../services/forumService';
import {
  NOTIFICATION_CATEGORIES,
  CATEGORY_LABELS,
  TYPE_TO_CATEGORY,
} from '../../services/notificationService';
import { useAuth } from '../../contexts/AuthContext';
import { COLORS, GRADIENTS, SPACING, TYPOGRAPHY, GLASS } from '../../utils/tokens';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Notification type configurations
const NOTIFICATION_CONFIG = {
  // Social
  like: { icon: Heart, color: '#FF6B6B', fill: '#FF6B6B' },
  forum_like: { icon: Heart, color: '#FF6B6B', fill: '#FF6B6B' },
  comment: { icon: MessageCircle, color: COLORS.cyan, fill: 'transparent' },
  forum_comment: { icon: MessageCircle, color: COLORS.cyan, fill: 'transparent' },
  reply: { icon: MessageCircle, color: COLORS.gold, fill: 'transparent' },
  forum_reply: { icon: MessageCircle, color: COLORS.gold, fill: 'transparent' },
  follow: { icon: UserPlus, color: COLORS.green, fill: 'transparent' },
  forum_follow: { icon: UserPlus, color: COLORS.green, fill: 'transparent' },
  mention: { icon: MessageCircle, color: COLORS.purple, fill: 'transparent' },
  // Trading
  pattern_detected: { icon: ChartLine, color: COLORS.gold, fill: 'transparent' },
  price_alert: { icon: Target, color: COLORS.gold, fill: 'transparent' },
  trade_executed: { icon: Zap, color: COLORS.green, fill: 'transparent' },
  market_alert: { icon: AlertTriangle, color: '#FF9500', fill: 'transparent' },
  breakout: { icon: TrendingUp, color: COLORS.green, fill: 'transparent' },
  stop_loss: { icon: TrendingDown, color: '#F6465D', fill: 'transparent' },
  take_profit: { icon: Target, color: COLORS.green, fill: '#0ECB81' },
  // System
  order: { icon: ShoppingBag, color: COLORS.purple, fill: 'transparent' },
  promotion: { icon: Bell, color: COLORS.gold, fill: 'transparent' },
  system: { icon: Bell, color: COLORS.textMuted, fill: 'transparent' },
  default: { icon: Bell, color: COLORS.textMuted, fill: 'transparent' },
  // Partnership/Affiliate
  partnership_approved: { icon: Zap, color: COLORS.gold, fill: COLORS.gold },
  partnership_rejected: { icon: AlertTriangle, color: '#F6465D', fill: 'transparent' },
  partnership_pending: { icon: Bell, color: COLORS.purple, fill: 'transparent' },
  affiliate_commission: { icon: TrendingUp, color: COLORS.green, fill: 'transparent' },
};

// Category tabs data
const CATEGORY_TABS = [
  { id: 'all', label: 'Tất cả', icon: Bell },
  { id: 'trading', label: 'Giao dịch', icon: ChartLine },
  { id: 'social', label: 'Xã hội', icon: Heart },
  { id: 'system', label: 'Hệ thống', icon: AlertTriangle },
];

export default function NotificationsScreen() {
  const navigation = useNavigation();
  const { isAuthenticated } = useAuth();
  const swipeableRefs = useRef({});

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');
  const [deletingIds, setDeletingIds] = useState(new Set());

  // Load notifications on focus
  useFocusEffect(
    useCallback(() => {
      if (isAuthenticated) {
        loadNotifications();
      } else {
        setLoading(false);
      }
    }, [isAuthenticated])
  );

  const loadNotifications = async () => {
    try {
      const data = await forumService.getNotifications();
      // Add category to each notification
      const enrichedData = data.map(n => ({
        ...n,
        category: TYPE_TO_CATEGORY[n.type] || 'system',
      }));
      setNotifications(enrichedData);
    } catch (error) {
      console.error('[Notifications] Load error:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadNotifications();
    setRefreshing(false);
  };

  // Filter notifications by category
  const filteredNotifications = activeCategory === 'all'
    ? notifications
    : notifications.filter(n => n.category === activeCategory);

  // Handle notification press
  const handleNotificationPress = async (notification) => {
    // Mark as read
    if (!notification.read) {
      await forumService.markAsRead(notification.id);
      setNotifications(prev =>
        prev.map(n => n.id === notification.id ? { ...n, read: true } : n)
      );
    }

    // Navigate based on type
    const data = notification.data || {};

    // Check for screen-based navigation (deep link from push notification)
    if (data.screen) {
      switch (data.screen) {
        case 'AffiliateWelcome':
          navigation.navigate('Account', {
            screen: 'AffiliateWelcome',
            params: {
              partner_type: data.partner_type,
              ctv_tier: data.ctv_tier,
              isNewlyApproved: data.isNewlyApproved,
            },
          });
          return;
        case 'AffiliateDashboard':
          navigation.navigate('Account', { screen: 'AffiliateDashboard' });
          return;
        case 'MarketingKits':
          navigation.navigate('Account', { screen: 'MarketingKits' });
          return;
        case 'HelpCenter':
          navigation.navigate('Account', { screen: 'HelpCenter' });
          return;
      }
    }

    // Legacy type-based navigation
    switch (notification.type) {
      case 'like':
      case 'forum_like':
      case 'comment':
      case 'forum_comment':
      case 'reply':
      case 'forum_reply':
        if (data.postId) {
          navigation.navigate('Home', {
            screen: 'PostDetail',
            params: { postId: data.postId },
          });
        }
        break;
      case 'follow':
      case 'forum_follow':
        if (notification.from_user_id) {
          navigation.navigate('Home', {
            screen: 'UserProfile',
            params: { userId: notification.from_user_id },
          });
        }
        break;
      case 'pattern_detected':
      case 'price_alert':
      case 'breakout':
        // Navigate to trading screen with symbol
        if (data.symbol) {
          navigation.navigate('Trading', {
            screen: 'Scanner',
            params: { symbol: data.symbol },
          });
        }
        break;
      case 'order':
        if (data.orderId) {
          navigation.navigate('Shop', {
            screen: 'OrderDetail',
            params: { orderId: data.orderId },
          });
        }
        break;
      // Partnership notifications
      case 'partnership_approved':
        navigation.navigate('Account', {
          screen: 'AffiliateWelcome',
          params: {
            partner_type: data.partner_type,
            ctv_tier: data.ctv_tier,
            isNewlyApproved: true,
          },
        });
        break;
      case 'partnership_rejected':
        navigation.navigate('Account', { screen: 'PartnershipRegistration' });
        break;
      case 'affiliate_commission':
        navigation.navigate('Account', { screen: 'AffiliateDashboard' });
        break;
    }
  };

  // Delete notification
  const handleDelete = async (notificationId) => {
    setDeletingIds(prev => new Set(prev).add(notificationId));

    try {
      await forumService.deleteNotification(notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
    } catch (error) {
      console.error('[Notifications] Delete error:', error);
    } finally {
      setDeletingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(notificationId);
        return newSet;
      });
    }
  };

  // Mark all as read
  const handleMarkAllAsRead = async () => {
    await forumService.markAllAsRead();
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  // Format timestamp
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const now = new Date();
    const date = new Date(timestamp);
    const diffMins = Math.floor((now - date) / 60000);

    if (diffMins < 1) return 'Vừa xong';
    if (diffMins < 60) return `${diffMins} phút`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} giờ`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays} ngày`;
    return date.toLocaleDateString('vi-VN');
  };

  // Get notification config
  const getConfig = (type) => NOTIFICATION_CONFIG[type] || NOTIFICATION_CONFIG.default;

  // Render swipe delete action
  const renderRightActions = (progress, dragX, notificationId) => {
    const trans = dragX.interpolate({
      inputRange: [-100, 0],
      outputRange: [0, 100],
      extrapolate: 'clamp',
    });

    return (
      <Animated.View
        style={[
          styles.deleteAction,
          { transform: [{ translateX: trans }] },
        ]}
      >
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDelete(notificationId)}
        >
          <Trash2 size={24} color="#FFFFFF" />
          <Text style={styles.deleteText}>Xóa</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  // Render notification item
  const renderNotification = ({ item }) => {
    const config = getConfig(item.type);
    const IconComponent = config.icon;
    const fromUser = item.from_user;
    const avatarUrl = fromUser?.avatar_url ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(fromUser?.full_name || 'U')}&background=6A5BFF&color=fff`;

    const isDeleting = deletingIds.has(item.id);

    return (
      <Swipeable
        ref={(ref) => {
          if (ref) swipeableRefs.current[item.id] = ref;
        }}
        renderRightActions={(progress, dragX) =>
          renderRightActions(progress, dragX, item.id)
        }
        rightThreshold={40}
        overshootRight={false}
      >
        <TouchableOpacity
          style={[
            styles.notificationCard,
            !item.read && styles.unreadCard,
            isDeleting && styles.deletingCard,
          ]}
          onPress={() => handleNotificationPress(item)}
          activeOpacity={0.7}
          disabled={isDeleting}
        >
          {/* Avatar with icon badge */}
          <View style={styles.avatarContainer}>
            {item.category === 'social' ? (
              <Image source={{ uri: avatarUrl }} style={styles.avatar} />
            ) : (
              <View style={[styles.iconAvatar, { backgroundColor: `${config.color}20` }]}>
                <IconComponent size={24} color={config.color} />
              </View>
            )}
            <View style={[styles.iconBadge, { backgroundColor: config.color }]}>
              <IconComponent
                size={10}
                color="#FFFFFF"
                fill={config.fill === config.color ? config.fill : 'transparent'}
              />
            </View>
          </View>

          {/* Content */}
          <View style={styles.contentContainer}>
            <Text style={styles.notificationText} numberOfLines={2}>
              {item.category === 'social' && fromUser && (
                <Text style={styles.userName}>{fromUser.full_name || 'Ai đó'} </Text>
              )}
              {item.body || item.title}
            </Text>
            <View style={styles.metaRow}>
              <Text style={styles.timeText}>{formatTime(item.created_at)}</Text>
              <View style={[styles.categoryBadge, { backgroundColor: `${config.color}20` }]}>
                <Text style={[styles.categoryText, { color: config.color }]}>
                  {CATEGORY_LABELS[item.category]}
                </Text>
              </View>
            </View>
          </View>

          {/* Unread indicator */}
          {!item.read && <View style={styles.unreadDot} />}
        </TouchableOpacity>
      </Swipeable>
    );
  };

  // Render category tabs
  const renderCategoryTabs = () => (
    <View style={styles.tabsContainer}>
      {CATEGORY_TABS.map((tab) => {
        const isActive = activeCategory === tab.id;
        const TabIcon = tab.icon;
        const count = tab.id === 'all'
          ? notifications.filter(n => !n.read).length
          : notifications.filter(n => n.category === tab.id && !n.read).length;

        return (
          <TouchableOpacity
            key={tab.id}
            style={[styles.tab, isActive && styles.activeTab]}
            onPress={() => setActiveCategory(tab.id)}
          >
            <TabIcon
              size={18}
              color={isActive ? COLORS.gold : COLORS.textMuted}
            />
            <Text style={[styles.tabLabel, isActive && styles.activeTabLabel]}>
              {tab.label}
            </Text>
            {count > 0 && (
              <View style={styles.tabBadge}>
                <Text style={styles.tabBadgeText}>{count > 99 ? '99+' : count}</Text>
              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );

  // Render empty state
  const renderEmpty = () => (
    <View style={styles.emptyState}>
      <Bell size={64} color={COLORS.textMuted} />
      <Text style={styles.emptyTitle}>
        {activeCategory === 'all'
          ? 'Chưa có thông báo'
          : `Không có thông báo ${CATEGORY_LABELS[activeCategory].toLowerCase()}`}
      </Text>
      <Text style={styles.emptySubtitle}>
        {activeCategory === 'trading'
          ? 'Cảnh báo giao dịch và pattern sẽ hiển thị ở đây'
          : activeCategory === 'social'
          ? 'Likes, comments và follows sẽ hiển thị ở đây'
          : activeCategory === 'system'
          ? 'Thông báo hệ thống sẽ hiển thị ở đây'
          : 'Kéo xuống để làm mới'}
      </Text>
    </View>
  );

  // Render login prompt
  const renderLoginPrompt = () => (
    <View style={styles.emptyState}>
      <Bell size={64} color={COLORS.textMuted} />
      <Text style={styles.emptyTitle}>Đăng nhập để xem thông báo</Text>
      <TouchableOpacity
        style={styles.loginButton}
        onPress={() => navigation.navigate('Auth')}
      >
        <Text style={styles.loginButtonText}>Đăng nhập</Text>
      </TouchableOpacity>
    </View>
  );

  // Count unread
  const unreadCount = notifications.filter(n => !n.read).length;

  if (!isAuthenticated) {
    return (
      <LinearGradient colors={GRADIENTS.background} locations={GRADIENTS.backgroundLocations} style={styles.gradient}>
        <SafeAreaView style={styles.container} edges={['top']}>
          <View style={styles.header}>
            <Text style={styles.title}>Thông Báo</Text>
          </View>
          {renderLoginPrompt()}
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={GRADIENTS.background}
      locations={GRADIENTS.backgroundLocations}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.container} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Thông Báo</Text>
            {unreadCount > 0 && (
              <Text style={styles.unreadLabel}>{unreadCount} chưa đọc</Text>
            )}
          </View>
          {unreadCount > 0 && (
            <TouchableOpacity style={styles.markAllBtn} onPress={handleMarkAllAsRead}>
              <CheckCheck size={20} color={COLORS.gold} />
              <Text style={styles.markAllText}>Đọc hết</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Category Tabs */}
        {renderCategoryTabs()}

        {/* Notifications List */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.gold} />
          </View>
        ) : (
          <FlatList
            data={filteredNotifications}
            renderItem={renderNotification}
            keyExtractor={(item) => item.id?.toString()}
            contentContainerStyle={[
              styles.listContent,
              filteredNotifications.length === 0 && styles.emptyListContent,
            ]}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={renderEmpty}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={COLORS.gold}
              />
            }
          />
        )}
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  container: { flex: 1 },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    backgroundColor: GLASS.background,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(106, 91, 255, 0.2)',
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize.xxxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
  unreadLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gold,
    marginTop: 2,
  },
  markAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: SPACING.sm,
  },
  markAllText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.gold,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },

  // Category Tabs
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: GLASS.background,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(106, 91, 255, 0.15)',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.xs,
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: 'rgba(255, 189, 89, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 189, 89, 0.3)',
  },
  tabLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  activeTabLabel: {
    color: COLORS.gold,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
  tabBadge: {
    backgroundColor: COLORS.burgundy,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 20,
    alignItems: 'center',
  },
  tabBadgeText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },

  // List
  listContent: {
    padding: SPACING.md,
    paddingBottom: 120,
  },
  emptyListContent: {
    flex: 1,
  },

  // Notification Card
  notificationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: GLASS.background,
    padding: SPACING.md,
    borderRadius: 12,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.15)',
  },
  unreadCard: {
    backgroundColor: 'rgba(106, 91, 255, 0.1)',
    borderColor: 'rgba(106, 91, 255, 0.3)',
  },
  deletingCard: {
    opacity: 0.5,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: SPACING.md,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.glassBg,
  },
  iconAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.bgDarkest,
  },
  contentContainer: {
    flex: 1,
  },
  notificationText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  userName: {
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
  },
  timeText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    textTransform: 'uppercase',
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.gold,
    marginLeft: SPACING.sm,
  },

  // Delete Action
  deleteAction: {
    backgroundColor: '#F6465D',
    justifyContent: 'center',
    alignItems: 'flex-end',
    marginBottom: SPACING.sm,
    borderRadius: 12,
    width: 100,
  },
  deleteButton: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 100,
    height: '100%',
    paddingHorizontal: SPACING.md,
  },
  deleteText: {
    color: '#FFFFFF',
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    marginTop: 4,
  },

  // Empty State
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xxl,
  },
  emptyTitle: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
  loginButton: {
    marginTop: SPACING.lg,
    backgroundColor: COLORS.burgundy,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xxl,
    borderRadius: 25,
  },
  loginButtonText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
  },
});
