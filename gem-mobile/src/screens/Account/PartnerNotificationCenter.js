/**
 * PartnerNotificationCenter
 * Notification center for partner-specific notifications
 * Reference: GEM_PARTNERSHIP_IMPLEMENTATION_PHASE3.md
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowLeft,
  Bell,
  CheckCircle,
  XCircle,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Gift,
  Calendar,
  Check,
} from 'lucide-react-native';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

import { COLORS, GRADIENTS, SPACING, TYPOGRAPHY } from '../../utils/tokens';
import { NOTIFICATION_TYPES } from '../../constants/partnershipConstants';
import partnerNotificationService from '../../services/partnerNotificationService';

// Notification icons mapping
const NOTIFICATION_ICONS = {
  [NOTIFICATION_TYPES.APPLICATION_APPROVED]: { Icon: CheckCircle, color: COLORS.success },
  [NOTIFICATION_TYPES.APPLICATION_REJECTED]: { Icon: XCircle, color: COLORS.error },
  [NOTIFICATION_TYPES.TIER_UPGRADE]: { Icon: TrendingUp, color: COLORS.success },
  [NOTIFICATION_TYPES.TIER_DOWNGRADE]: { Icon: TrendingDown, color: COLORS.warning },
  [NOTIFICATION_TYPES.COMMISSION_EARNED]: { Icon: DollarSign, color: COLORS.gold },
  [NOTIFICATION_TYPES.COMMISSION_PAID]: { Icon: DollarSign, color: COLORS.success },
  [NOTIFICATION_TYPES.SUB_AFFILIATE_JOINED]: { Icon: Users, color: COLORS.info },
  [NOTIFICATION_TYPES.SUB_AFFILIATE_EARNED]: { Icon: Users, color: COLORS.gold },
  [NOTIFICATION_TYPES.PAYMENT_SCHEDULED]: { Icon: Calendar, color: COLORS.info },
  [NOTIFICATION_TYPES.PAYMENT_PROCESSED]: { Icon: DollarSign, color: COLORS.success },
  default: { Icon: Bell, color: COLORS.textMuted },
};

const PartnerNotificationCenter = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    loadNotifications(true);
  }, []);

  const loadNotifications = async (refresh = false) => {
    try {
      if (refresh) {
        setLoading(true);
        setPage(0);
      } else {
        setLoadingMore(true);
      }

      const currentPage = refresh ? 0 : page;
      const result = await partnerNotificationService.getNotifications(currentPage);

      if (result.success) {
        if (refresh) {
          setNotifications(result.notifications);
        } else {
          setNotifications(prev => [...prev, ...result.notifications]);
        }
        setHasMore(result.hasMore);
        setPage(currentPage + 1);
      }
    } catch (err) {
      console.error('Load notifications error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadNotifications(true);
  };

  const loadMore = () => {
    if (hasMore && !loadingMore && !loading) {
      loadNotifications(false);
    }
  };

  const handleNotificationPress = async (notification) => {
    // Mark as read
    if (!notification.is_read) {
      await partnerNotificationService.markAsRead(notification.id);
      setNotifications(prev =>
        prev.map(n => n.id === notification.id ? { ...n, is_read: true } : n)
      );
    }

    // Navigate based on type
    const { screen, params } = partnerNotificationService.getNavigationTarget(notification);
    navigation.navigate(screen, params);
  };

  const handleMarkAllRead = async () => {
    const success = await partnerNotificationService.markAllAsRead();
    if (success) {
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    }
  };

  const formatTime = (dateString) => {
    try {
      return formatDistanceToNow(new Date(dateString), {
        addSuffix: true,
        locale: vi
      });
    } catch {
      return '';
    }
  };

  const renderNotification = ({ item }) => {
    const iconData = NOTIFICATION_ICONS[item.notification_type] || NOTIFICATION_ICONS.default;
    const { Icon, color } = iconData;

    return (
      <TouchableOpacity
        style={[
          styles.notificationCard,
          !item.is_read && styles.notificationUnread
        ]}
        onPress={() => handleNotificationPress(item)}
        activeOpacity={0.7}
      >
        <View style={[styles.iconContainer, { backgroundColor: `${color}20` }]}>
          <Icon size={20} color={color} />
        </View>

        <View style={styles.contentContainer}>
          <Text style={styles.notificationTitle}>{item.title}</Text>
          <Text style={styles.notificationMessage} numberOfLines={2}>
            {item.message}
          </Text>
          <Text style={styles.notificationTime}>
            {formatTime(item.created_at)}
          </Text>
        </View>

        {!item.is_read && <View style={styles.unreadDot} />}
      </TouchableOpacity>
    );
  };

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={COLORS.gold} />
      </View>
    );
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  // Loading state
  if (loading) {
    return (
      <LinearGradient
        colors={GRADIENTS.background}
        locations={GRADIENTS.backgroundLocations}
        style={styles.gradient}
      >
        <SafeAreaView style={styles.container} edges={['top']}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <ArrowLeft size={24} color={COLORS.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Thông báo</Text>
            <View style={{ width: 24 }} />
          </View>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.gold} />
          </View>
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
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <ArrowLeft size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Thông báo</Text>
          {unreadCount > 0 ? (
            <TouchableOpacity onPress={handleMarkAllRead}>
              <Check size={24} color={COLORS.gold} />
            </TouchableOpacity>
          ) : (
            <View style={{ width: 24 }} />
          )}
        </View>

        {/* Unread count badge */}
        {unreadCount > 0 && (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadBadgeText}>
              {unreadCount} thông báo chưa đọc
            </Text>
            <TouchableOpacity onPress={handleMarkAllRead}>
              <Text style={styles.markAllReadText}>Đánh dấu đã đọc</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Notification list */}
        {notifications.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Bell size={48} color={COLORS.textMuted} />
            <Text style={styles.emptyText}>Chưa có thông báo</Text>
            <Text style={styles.emptySubtext}>
              Thông báo về hoa hồng, tier và đối tác sẽ xuất hiện ở đây
            </Text>
          </View>
        ) : (
          <FlatList
            data={notifications}
            renderItem={renderNotification}
            keyExtractor={(item) => item.id}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={COLORS.gold}
              />
            }
            onEndReached={loadMore}
            onEndReachedThreshold={0.5}
            ListFooterComponent={renderFooter}
            contentContainerStyle={styles.listContent}
          />
        )}
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },

  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Unread badge
  unreadBadge: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.gold + '15',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    marginHorizontal: SPACING.md,
    marginTop: SPACING.sm,
    borderRadius: 8,
  },
  unreadBadgeText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gold,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  markAllReadText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gold,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },

  // Empty state
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  emptyText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
    marginTop: SPACING.md,
  },
  emptySubtext: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: SPACING.xs,
  },

  // List
  listContent: {
    padding: SPACING.md,
  },

  // Notification card
  notificationCard: {
    flexDirection: 'row',
    padding: SPACING.md,
    backgroundColor: COLORS.bgCard,
    borderRadius: 12,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  notificationUnread: {
    backgroundColor: 'rgba(255, 189, 89, 0.05)',
    borderColor: COLORS.gold + '50',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  contentContainer: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
  },
  notificationMessage: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    marginTop: 2,
    lineHeight: 18,
  },
  notificationTime: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.gold,
    position: 'absolute',
    top: 12,
    right: 12,
  },

  // Footer loader
  footerLoader: {
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
});

export default PartnerNotificationCenter;
