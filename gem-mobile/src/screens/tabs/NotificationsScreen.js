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
  Gift,
} from 'lucide-react-native';
import { forumService } from '../../services/forumService';
import {
  notificationService,
  NOTIFICATION_CATEGORIES,
  CATEGORY_LABELS,
  TYPE_TO_CATEGORY,
} from '../../services/notificationService';
import { supabase } from '../../services/supabase';
import { useAuth } from '../../contexts/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, GRADIENTS, SPACING, TYPOGRAPHY, GLASS } from '../../utils/tokens';
import { CONTENT_BOTTOM_PADDING } from '../../constants/layout';
import useScrollToTop from '../../hooks/useScrollToTop';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const READ_NOTIFICATIONS_KEY = '@gem_read_notification_ids';
const DELETED_NOTIFICATIONS_KEY = '@gem_deleted_notification_ids';

// ============================================
// GLOBAL CACHE - persists across tab switches
// ============================================
const notificationsCache = {
  data: null,
  lastFetch: 0,
  CACHE_DURATION: 60000, // 60 seconds
};

// Local read IDs cache - persists read state even if DB update fails
let localReadIds = new Set();
const loadLocalReadIds = async () => {
  try {
    const stored = await AsyncStorage.getItem(READ_NOTIFICATIONS_KEY);
    if (stored) {
      localReadIds = new Set(JSON.parse(stored));
    }
  } catch (e) {
    console.warn('[Notifications] Failed to load local read IDs');
  }
};
const saveLocalReadIds = async () => {
  try {
    await AsyncStorage.setItem(READ_NOTIFICATIONS_KEY, JSON.stringify([...localReadIds]));
  } catch (e) {
    console.warn('[Notifications] Failed to save local read IDs');
  }
};

// Local deleted IDs cache - persists deleted state even if DB delete fails
let localDeletedIds = new Set();
const loadLocalDeletedIds = async () => {
  try {
    const stored = await AsyncStorage.getItem(DELETED_NOTIFICATIONS_KEY);
    if (stored) {
      localDeletedIds = new Set(JSON.parse(stored));
    }
  } catch (e) {
    console.warn('[Notifications] Failed to load local deleted IDs');
  }
};
const saveLocalDeletedIds = async () => {
  try {
    await AsyncStorage.setItem(DELETED_NOTIFICATIONS_KEY, JSON.stringify([...localDeletedIds]));
  } catch (e) {
    console.warn('[Notifications] Failed to save local deleted IDs');
  }
};

// Load on module init
loadLocalReadIds();
loadLocalDeletedIds();

// Notification type configurations
const NOTIFICATION_CONFIG = {
  // Social
  like: { icon: Heart, color: '#FF6B6B', fill: '#FF6B6B' },
  forum_like: { icon: Heart, color: '#FF6B6B', fill: '#FF6B6B' },
  reaction: { icon: Heart, color: '#FF6B6B', fill: '#FF6B6B' },
  comment: { icon: MessageCircle, color: COLORS.cyan, fill: 'transparent' },
  forum_comment: { icon: MessageCircle, color: COLORS.cyan, fill: 'transparent' },
  reply: { icon: MessageCircle, color: COLORS.gold, fill: 'transparent' },
  forum_reply: { icon: MessageCircle, color: COLORS.gold, fill: 'transparent' },
  follow: { icon: UserPlus, color: COLORS.green, fill: 'transparent' },
  forum_follow: { icon: UserPlus, color: COLORS.green, fill: 'transparent' },
  mention: { icon: MessageCircle, color: COLORS.purple, fill: 'transparent' },
  // Gift
  gift_received: { icon: Gift, color: COLORS.gold, fill: COLORS.gold },
  gift_sent: { icon: Gift, color: COLORS.purple, fill: 'transparent' },
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
  // Admin notifications
  admin_partnership_application: { icon: UserPlus, color: COLORS.gold, fill: COLORS.gold },
  admin_withdraw_request: { icon: TrendingDown, color: COLORS.gold, fill: 'transparent' },
};

// Category tabs data
const CATEGORY_TABS = [
  { id: 'all', label: 'Tất cả', icon: Bell },
  { id: 'trading', label: 'Giao dịch', icon: ChartLine },
  { id: 'social', label: 'Cộng đồng', icon: Heart },
  { id: 'system', label: 'Hệ thống', icon: AlertTriangle },
];

export default function NotificationsScreen() {
  const navigation = useNavigation();
  const { isAuthenticated, user } = useAuth();
  const swipeableRefs = useRef({});

  // State - initialize from global cache for instant display
  const [notifications, setNotifications] = useState(() => notificationsCache.data || []);
  const [loading, setLoading] = useState(!notificationsCache.data);
  const [refreshing, setRefreshing] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');
  const [deletingIds, setDeletingIds] = useState(new Set());

  // Double-tap to scroll to top and refresh
  const { scrollViewRef: flatListRef } = useScrollToTop('Notifications', async () => {
    setRefreshing(true);
    await loadNotifications();
    setRefreshing(false);
  });

  // Load notifications on focus - WITH GLOBAL CACHING
  // Key principle: NEVER show loading if we have ANY cached data
  useFocusEffect(
    useCallback(() => {
      if (isAuthenticated) {
        const now = Date.now();
        const cacheExpired = now - notificationsCache.lastFetch > notificationsCache.CACHE_DURATION;

        // If we have cached data, set loading false IMMEDIATELY and sync state
        if (notificationsCache.data) {
          setLoading(false);
          // Sync state from cache in case component state is out of sync
          if (notifications !== notificationsCache.data) {
            setNotifications(notificationsCache.data);
          }
        }

        // Fetch fresh data in background if no cache or cache expired
        if (!notificationsCache.data || cacheExpired) {
          loadNotifications();
        }
      } else {
        setLoading(false);
      }
    }, [isAuthenticated])
  );

  // Helper to set notifications and update cache
  const updateNotifications = (data) => {
    setNotifications(data);
    notificationsCache.data = data;
    notificationsCache.lastFetch = Date.now();
  };

  const loadNotifications = async () => {
    try {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      // Ensure local caches are loaded
      await Promise.all([loadLocalReadIds(), loadLocalDeletedIds()]);

      // Helper: check if notification was deleted locally
      const isDeleted = (n) => {
        if (!n.id) return false;
        return localDeletedIds.has(n.id.toString());
      };

      // Fetch from BOTH tables in parallel and merge results
      const [systemResult, forumData] = await Promise.all([
        notificationService.getUserNotificationsFromDB(user.id),
        forumService.getNotifications(),
      ]);

      // Helper: check if notification is read (DB or local cache)
      const isRead = (n) => {
        if (n.read || n.is_read) return true;
        if (n.id && localReadIds.has(n.id.toString())) return true;
        return false;
      };

      // Process system notifications (from notifications table)
      const systemNotifications = (systemResult.success && systemResult.data)
        ? systemResult.data.map(n => ({
            ...n,
            source: 'system',
            read: isRead(n),
          }))
        : [];

      // Process forum notifications (from forum_notifications table)
      const forumNotifications = (forumData || []).map(n => ({
        ...n,
        source: 'forum',
        category: TYPE_TO_CATEGORY[n.type] || 'social',
        read: isRead(n),
      }));

      // Merge all notifications and filter out locally deleted ones
      let allNotifications = [...systemNotifications, ...forumNotifications]
        .filter(n => !isDeleted(n));

      // Collect user IDs that need profile fetching (no from_user data)
      const userIdsToFetch = new Set();
      allNotifications.forEach(n => {
        if (!n.from_user?.full_name && !n.from_user?.avatar_url) {
          // Try to get user ID from various fields
          const userId = n.from_user_id || n.data?.fromUserId || n.data?.reactor_id;
          if (userId) userIdsToFetch.add(userId);
        }
      });

      // Batch fetch user profiles if needed
      if (userIdsToFetch.size > 0) {
        try {
          const { data: profiles } = await supabase
            .from('profiles')
            .select('id, full_name, username, avatar_url')
            .in('id', [...userIdsToFetch]);

          if (profiles) {
            const profileMap = new Map(profiles.map(p => [p.id, p]));

            // Enrich notifications with user data
            allNotifications = allNotifications.map(n => {
              if (n.from_user?.full_name || n.from_user?.avatar_url) return n;
              const userId = n.from_user_id || n.data?.fromUserId || n.data?.reactor_id;
              const profile = userId ? profileMap.get(userId) : null;
              if (profile) {
                return { ...n, from_user: profile };
              }
              return n;
            });
          }
        } catch (err) {
          console.warn('[Notifications] Failed to fetch user profiles:', err);
        }
      }

      // Sort by created_at descending
      allNotifications.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

      updateNotifications(allNotifications);
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
    // Mark as read - check both `read` and `is_read` fields
    const isRead = notification.read || notification.is_read;
    if (!isRead) {
      // 1. Update local state and global cache immediately for instant UI feedback
      const updatedNotifications = notifications.map(n =>
        n.id === notification.id ? { ...n, read: true, is_read: true } : n
      );
      updateNotifications(updatedNotifications);

      // 2. Save to local read cache (persists even if DB fails)
      if (notification.id) {
        localReadIds.add(notification.id.toString());
        await saveLocalReadIds();
      }

      // 3. Persist to correct DB table based on source
      try {
        if (notification.source === 'forum') {
          await forumService.markAsRead(notification.id);
        } else {
          await notificationService.markNotificationAsRead(notification.id, user?.id);
        }
      } catch (err) {
        console.warn('[Notifications] DB mark read failed:', err);
      }
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
      // Admin notifications
      case 'admin_partnership_application':
        navigation.navigate('Account', {
          screen: 'AdminDashboard',
          params: { initialTab: 'applications' },
        });
        break;
      case 'admin_withdraw_request':
        navigation.navigate('Account', {
          screen: 'AdminDashboard',
          params: { initialTab: 'withdrawals' },
        });
        break;
      // Gift notifications
      case 'gift_received':
        if (data.post_id) {
          navigation.navigate('Home', {
            screen: 'PostDetail',
            params: { postId: data.post_id },
          });
        } else {
          // Navigate to wallet/gift history
          navigation.navigate('Account', { screen: 'GiftHistory' });
        }
        break;
    }
  };

  // Delete notification
  const handleDelete = async (notificationId) => {
    setDeletingIds(prev => new Set(prev).add(notificationId));

    try {
      // 1. Update local state and global cache immediately for instant UI feedback
      const updatedNotifications = notifications.filter(n => n.id !== notificationId);
      updateNotifications(updatedNotifications);

      // 2. Save to local deleted cache (persists even if DB fails)
      if (notificationId) {
        localDeletedIds.add(notificationId.toString());
        await saveLocalDeletedIds();
      }

      // 3. Delete from DB - find matching notification to target correct table
      const notification = notifications.find(n => n.id === notificationId);
      try {
        if (notification?.source === 'forum') {
          await forumService.deleteNotification(notificationId);
        } else {
          await notificationService.deleteNotification(notificationId, user?.id);
        }
      } catch (err) {
        console.warn('[Notifications] DB delete failed:', err);
      }
    } catch (error) {
      console.error('[Notifications] Delete error:', error);
      // Don't restore - local state is source of truth for this session
    } finally {
      setDeletingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(notificationId);
        return newSet;
      });
    }
  };

  // Mark all as read - persist to DB AND local storage
  const handleMarkAllAsRead = async () => {
    // 1. Update local state immediately for instant UI feedback
    const updatedNotifications = notifications.map(n => ({ ...n, read: true, is_read: true }));
    updateNotifications(updatedNotifications);

    // 2. Save all IDs to local read cache (persists even if DB fails)
    notifications.forEach(n => {
      if (n.id) localReadIds.add(n.id.toString());
    });
    await saveLocalReadIds();

    // 3. Persist to both DB tables
    if (user?.id) {
      try {
        await Promise.all([
          notificationService.markAllNotificationsAsRead(user.id),
          forumService.markAllAsRead(),
        ]);
      } catch (err) {
        console.warn('[Notifications] DB markAllAsRead failed:', err);
      }
    }
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

  // Generate Facebook-style notification message
  // Priority: Combine title + body if title has user name, otherwise generate from type
  const getNotificationMessage = (item) => {
    const fromUser = item.from_user;
    const userName = fromUser?.full_name || fromUser?.username || null;
    const data = item.data || {};

    // Database notifications often have:
    // - title: "Nguyen Van A đã thả cảm xúc" (contains user name + action)
    // - body: "với bài viết của bạn" (contains the object)
    // We need to combine them for full message

    // Check if title contains action verb (meaning it has user name + action)
    if (item.title) {
      const titleLower = item.title.toLowerCase();
      const titleHasAction = titleLower.includes('đã ') ||
                              titleLower.includes('bắt đầu') ||
                              titleLower.includes('đang ') ||
                              titleLower.includes('vừa ');

      if (titleHasAction) {
        // Combine title + body for complete message
        const fullMessage = item.body
          ? `${item.title} ${item.body}`
          : item.title;
        return { userName: null, action: fullMessage };
      }
    }

    // Check if body already contains complete message with action verb
    if (item.body) {
      const bodyLower = item.body.toLowerCase();
      const hasActionVerb = bodyLower.includes('đã ') ||
                            bodyLower.includes('bắt đầu') ||
                            bodyLower.includes('đang ') ||
                            bodyLower.includes('mới') ||
                            bodyLower.includes('vừa ');

      // If body already contains action info, use it directly
      if (hasActionVerb) {
        return { userName: null, action: item.body };
      }
    }

    // If we have from_user data, generate Facebook-style message
    // Otherwise fall back to body/title
    switch (item.type) {
      // Social - Likes
      case 'like':
      case 'forum_like':
        if (userName) return { userName, action: 'đã thích bài viết của bạn' };
        return { userName: null, action: item.body || 'Ai đó đã thích bài viết của bạn' };

      // Social - Reactions (emoji reactions on posts)
      case 'reaction':
        // Title has "Nguyen Van A đã thả cảm xúc", body has "với bài viết của bạn"
        // Already handled by title+body combination above, this is fallback
        if (userName) {
          const reactionType = data.reaction_type || '❤️';
          return { userName, action: `đã thả ${reactionType} với bài viết của bạn` };
        }
        // Combine title and body if available
        if (item.title && item.body) {
          return { userName: null, action: `${item.title} ${item.body}` };
        }
        return { userName: null, action: item.title || item.body || 'Ai đó đã thả cảm xúc với bài viết của bạn' };

      // Social - Comments
      case 'comment':
      case 'forum_comment':
        if (userName) {
          const preview = data.comment_preview || data.content?.substring(0, 50);
          return { userName, action: preview ? `đã bình luận: "${preview}"` : 'đã bình luận về bài viết của bạn' };
        }
        return { userName: null, action: item.body || 'Ai đó đã bình luận về bài viết của bạn' };

      // Social - Replies
      case 'reply':
      case 'forum_reply':
        if (userName) {
          const preview = data.reply_preview || data.content?.substring(0, 50);
          return { userName, action: preview ? `đã trả lời: "${preview}"` : 'đã trả lời bình luận của bạn' };
        }
        return { userName: null, action: item.body || 'Ai đó đã trả lời bình luận của bạn' };

      // Social - Follow
      case 'follow':
      case 'forum_follow':
        if (userName) return { userName, action: 'đã bắt đầu theo dõi bạn' };
        return { userName: null, action: item.body || 'Ai đó đã bắt đầu theo dõi bạn' };

      // Social - Mention
      case 'mention':
        if (userName) return { userName, action: 'đã nhắc đến bạn trong một bài viết' };
        return { userName: null, action: item.body || 'Ai đó đã nhắc đến bạn' };

      // Gift
      case 'gift_received':
        const giftAmount = data.gem_amount || data.amount;
        if (userName) {
          return { userName, action: giftAmount ? `đã tặng bạn ${giftAmount} 💎` : 'đã tặng quà cho bạn' };
        }
        return { userName: null, action: item.body || `Bạn nhận được ${giftAmount || ''} 💎` };

      case 'gift_sent':
        return { userName: null, action: item.body || 'Bạn đã gửi quà thành công' };

      // Trading
      case 'pattern_detected':
        const pattern = data.pattern || 'mẫu hình';
        const symbol = data.symbol || '';
        return { userName: null, action: item.body || `🔔 Phát hiện ${pattern} trên ${symbol}` };

      case 'price_alert':
        return { userName: null, action: item.body || `🎯 ${data.symbol || 'Coin'} đã đạt mức giá ${data.price || 'mục tiêu'}` };

      case 'trade_executed':
        return { userName: null, action: item.body || `⚡ Lệnh giao dịch ${data.symbol || ''} đã được thực hiện` };

      case 'breakout':
        return { userName: null, action: item.body || `📈 ${data.symbol || 'Coin'} đang breakout ${data.direction === 'up' ? 'tăng' : 'giảm'}` };

      case 'stop_loss':
        return { userName: null, action: item.body || `🛑 Stop loss đã kích hoạt cho ${data.symbol || 'vị thế'}` };

      case 'take_profit':
        return { userName: null, action: item.body || `✅ Take profit đã đạt cho ${data.symbol || 'vị thế'}` };

      case 'market_alert':
        return { userName: null, action: item.body || `⚠️ ${data.message || 'Cảnh báo thị trường'}` };

      // System - Orders
      case 'order':
        const orderStatus = data.status || 'cập nhật';
        return { userName: null, action: item.body || `📦 Đơn hàng #${data.orderId || ''} ${orderStatus}` };

      // Partnership
      case 'partnership_approved':
        return { userName: null, action: item.body || '🎉 Chúc mừng! Đơn đăng ký CTV đã được duyệt' };

      case 'partnership_rejected':
        return { userName: null, action: item.body || '❌ Đơn đăng ký CTV chưa được duyệt' };

      case 'partnership_pending':
        return { userName: null, action: item.body || '⏳ Đơn đăng ký CTV đang chờ xét duyệt' };

      case 'affiliate_commission':
        const commission = data.amount || data.commission;
        return { userName: null, action: item.body || `💰 Bạn nhận được hoa hồng ${commission || ''}` };

      // Admin
      case 'admin_partnership_application':
        if (userName) return { userName, action: 'đã gửi đơn đăng ký CTV mới' };
        return { userName: null, action: item.body || 'Có đơn đăng ký CTV mới' };

      case 'admin_withdraw_request':
        if (userName) return { userName, action: 'yêu cầu rút tiền cần xét duyệt' };
        return { userName: null, action: item.body || 'Có yêu cầu rút tiền mới' };

      // System/Promotion
      case 'promotion':
        return { userName: null, action: item.body || item.title || '🎁 Khuyến mãi mới' };

      case 'system':
      default:
        // Fallback to original body/title
        return { userName: null, action: item.body || item.title || 'Thông báo mới' };
    }
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

  // Extract user name from body/title for avatar generation
  // Format: "Nguyen Van A đã thích bài viết..."
  const extractUserNameFromText = (text) => {
    if (!text) return null;
    // Try to extract name before action verbs
    const actionVerbs = ['đã ', ' đang ', ' bắt đầu ', ' vừa '];
    for (const verb of actionVerbs) {
      const index = text.indexOf(verb);
      if (index > 0) {
        const name = text.substring(0, index).trim();
        // Validate it looks like a name (2-50 chars, not starting with emoji/special char)
        if (name.length >= 2 && name.length <= 50 && /^[A-Za-zÀ-ỹ]/.test(name)) {
          return name;
        }
      }
    }
    return null;
  };

  // Render notification item - Facebook style
  const renderNotification = ({ item }) => {
    const config = getConfig(item.type);
    const IconComponent = config.icon;
    const fromUser = item.from_user;

    // Try to get user info from from_user, or extract from title/body
    const extractedName = !fromUser?.full_name
      ? (extractUserNameFromText(item.title) || extractUserNameFromText(item.body))
      : null;
    const displayName = fromUser?.full_name || fromUser?.username || extractedName;

    // Determine if we should show user avatar
    const isSocialType = ['like', 'forum_like', 'reaction', 'comment', 'forum_comment', 'reply', 'forum_reply', 'follow', 'forum_follow', 'mention', 'gift_received'].includes(item.type);
    const hasUserInfo = displayName || fromUser?.avatar_url;

    const avatarUrl = fromUser?.avatar_url ||
      (displayName
        ? `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=6A5BFF&color=fff`
        : null);

    const isDeleting = deletingIds.has(item.id);
    const { userName, action } = getNotificationMessage(item);

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
          {/* Avatar - Show user photo/initials for social, icon for system */}
          <View style={styles.avatarContainer}>
            {isSocialType && avatarUrl ? (
              <Image source={{ uri: avatarUrl }} style={styles.avatar} />
            ) : (
              <View style={[styles.iconAvatar, { backgroundColor: `${config.color}20` }]}>
                <IconComponent size={20} color={config.color} />
              </View>
            )}
            {/* Action type badge on avatar */}
            <View style={[styles.iconBadge, { backgroundColor: config.color }]}>
              <IconComponent
                size={9}
                color="#FFFFFF"
                fill={config.fill === config.color ? config.fill : 'transparent'}
              />
            </View>
          </View>

          {/* Content - Facebook style compact */}
          <View style={styles.contentContainer}>
            <Text style={styles.notificationText} numberOfLines={2}>
              {userName && (
                <Text style={styles.userName}>{userName} </Text>
              )}
              <Text style={styles.actionText}>{action}</Text>
            </Text>
            <Text style={styles.timeText}>{formatTime(item.created_at)}</Text>
          </View>

          {/* Unread indicator dot */}
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
            ref={flatListRef}
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
    paddingBottom: CONTENT_BOTTOM_PADDING,
  },
  emptyListContent: {
    flex: 1,
  },

  // Notification Row - Facebook style (no card, just divider)
  notificationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  unreadCard: {
    backgroundColor: 'rgba(106, 91, 255, 0.08)',
  },
  deletingCard: {
    opacity: 0.5,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: SPACING.sm,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.glassBg,
  },
  iconAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.bgDarkest,
  },
  contentContainer: {
    flex: 1,
  },
  notificationText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  userName: {
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
  },
  actionText: {
    color: COLORS.textSecondary,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  timeText: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  newBadge: {
    backgroundColor: COLORS.gold,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 8,
  },
  newBadgeText: {
    fontSize: 9,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.bgDarkest,
  },
  categoryBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  categoryText: {
    fontSize: 9,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    textTransform: 'uppercase',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.gold,
    marginLeft: SPACING.xs,
  },

  // Delete Action
  deleteAction: {
    backgroundColor: '#F6465D',
    justifyContent: 'center',
    alignItems: 'flex-end',
    width: 80,
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
