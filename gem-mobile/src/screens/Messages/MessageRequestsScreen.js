/**
 * Gemral - Message Requests Screen
 * Hộp thư yêu cầu tin nhắn kiểu TikTok
 *
 * Tính năng:
 * - Xem yêu cầu tin nhắn đang chờ
 * - Chấp nhận/Từ chối yêu cầu
 * - Chặn người dùng
 * - Xem trước tin nhắn
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from '../../utils/haptics';

// Services
import { messageRequestService } from '../../services/messageRequestService';

// Auth
import { useAuth } from '../../contexts/AuthContext';

// Alert
import CustomAlert, { useCustomAlert } from '../../components/CustomAlert';

// Tokens
import {
  COLORS,
  GRADIENTS,
  SPACING,
  TYPOGRAPHY,
  TOUCH,
} from '../../utils/tokens';

export default function MessageRequestsScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { alert, AlertComponent } = useCustomAlert();

  // State
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [processingId, setProcessingId] = useState(null);

  // Fetch requests
  const fetchRequests = useCallback(async () => {
    try {
      const result = await messageRequestService.getMessageRequests('pending');
      if (result.success) {
        setRequests(result.requests);
      }
    } catch (error) {
      console.error('Lỗi khi tải yêu cầu tin nhắn:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();

    // Subscribe to real-time updates
    const unsubscribe = messageRequestService.subscribeToMessageRequests((payload) => {
      console.log('[MessageRequests] Cập nhật realtime:', payload);
      fetchRequests();
    });

    return unsubscribe;
  }, [fetchRequests]);

  // Handle refresh
  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    fetchRequests();
  }, [fetchRequests]);

  // Accept request
  const handleAccept = useCallback(async (request) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setProcessingId(request.id);

    try {
      const result = await messageRequestService.acceptMessageRequest(request.id);

      if (result.success) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setRequests(prev => prev.filter(r => r.id !== request.id));

        // Navigate to the conversation
        if (result.conversationId) {
          navigation.replace('Chat', { conversationId: result.conversationId });
        }
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        alert({
          type: 'error',
          title: 'Lỗi',
          message: result.error || 'Không thể chấp nhận yêu cầu',
        });
      }
    } catch (error) {
      console.error('Lỗi khi chấp nhận yêu cầu:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setProcessingId(null);
    }
  }, [navigation, alert]);

  // Decline request
  const handleDecline = useCallback((request) => {
    const requesterName = request.requester?.display_name || request.requester?.full_name || 'người này';

    alert({
      type: 'warning',
      title: 'Từ chối yêu cầu',
      message: `Từ chối tin nhắn từ ${requesterName}?`,
      buttons: [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Từ chối',
          onPress: async () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            setProcessingId(request.id);

            try {
              const result = await messageRequestService.declineMessageRequest(request.id, false);

              if (result.success) {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                setRequests(prev => prev.filter(r => r.id !== request.id));
              }
            } catch (error) {
              console.error('Lỗi khi từ chối yêu cầu:', error);
            } finally {
              setProcessingId(null);
            }
          },
        },
        {
          text: 'Từ chối & Chặn',
          style: 'destructive',
          onPress: async () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            setProcessingId(request.id);

            try {
              const result = await messageRequestService.declineMessageRequest(request.id, true);

              if (result.success) {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                setRequests(prev => prev.filter(r => r.id !== request.id));
              }
            } catch (error) {
              console.error('Lỗi khi chặn yêu cầu:', error);
            } finally {
              setProcessingId(null);
            }
          },
        },
      ],
    });
  }, [alert]);

  // Get initials
  const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name[0].toUpperCase();
  };

  // Format time
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return date.toLocaleTimeString('vi-VN', { hour: 'numeric', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Hôm qua';
    } else if (diffDays < 7) {
      return date.toLocaleDateString('vi-VN', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('vi-VN', { day: 'numeric', month: 'short' });
    }
  };

  // Render request item
  const renderRequestItem = ({ item }) => {
    const requester = item.requester || {};
    const requesterName = requester.display_name || requester.full_name || requester.username || 'Người lạ';
    const isProcessing = processingId === item.id;

    return (
      <View style={styles.requestItem}>
        {/* Avatar */}
        <View style={styles.avatarContainer}>
          {requester.avatar_url ? (
            <Image source={{ uri: requester.avatar_url }} style={styles.avatar} />
          ) : (
            <LinearGradient
              colors={GRADIENTS.avatar}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.avatarFallback}
            >
              <Text style={styles.avatarInitials}>{getInitials(requesterName)}</Text>
            </LinearGradient>
          )}
        </View>

        {/* Content */}
        <View style={styles.requestContent}>
          <View style={styles.requestHeader}>
            <Text style={styles.requesterName} numberOfLines={1}>
              {requesterName}
            </Text>
            <Text style={styles.requestTime}>{formatTime(item.created_at)}</Text>
          </View>

          <Text style={styles.messagePreview} numberOfLines={2}>
            {item.message_preview || 'Đã gửi tin nhắn'}
          </Text>

          {item.messages_count > 1 && (
            <Text style={styles.messageCount}>
              +{item.messages_count - 1} tin nhắn khác
            </Text>
          )}

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionButton, styles.declineButton]}
              onPress={() => handleDecline(item)}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <ActivityIndicator size="small" color={COLORS.textMuted} />
              ) : (
                <Text style={styles.declineText}>Từ chối</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.acceptButton]}
              onPress={() => handleAccept(item)}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <ActivityIndicator size="small" color={COLORS.textPrimary} />
              ) : (
                <Text style={styles.acceptText}>Chấp nhận</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  // Render empty state
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <Ionicons name="mail-open-outline" size={64} color={COLORS.textMuted} />
      </View>
      <Text style={styles.emptyTitle}>Không có yêu cầu tin nhắn</Text>
      <Text style={styles.emptySubtitle}>
        Yêu cầu tin nhắn từ những người bạn chưa từng trò chuyện sẽ xuất hiện ở đây
      </Text>
    </View>
  );

  return (
    <LinearGradient
      colors={GRADIENTS.background}
      locations={GRADIENTS.backgroundLocations}
      style={styles.container}
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>

        <Text style={styles.title}>Yêu cầu tin nhắn</Text>

        <View style={styles.placeholder}>
          {requests.length > 0 && (
            <View style={styles.countBadge}>
              <Text style={styles.countText}>{requests.length}</Text>
            </View>
          )}
        </View>
      </View>

      {/* Info Banner */}
      <View style={styles.infoBanner}>
        <Ionicons name="information-circle" size={20} color={COLORS.gold} />
        <Text style={styles.infoText}>
          Đây là tin nhắn từ những người bạn chưa từng trò chuyện. Chấp nhận để bắt đầu cuộc trò chuyện.
        </Text>
      </View>

      {/* Requests List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.gold} />
        </View>
      ) : (
        <FlatList
          data={requests}
          renderItem={renderRequestItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[
            styles.listContent,
            requests.length === 0 && styles.listContentEmpty,
          ]}
          ListEmptyComponent={renderEmptyState}
          showsVerticalScrollIndicator={false}
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          windowSize={10}
          initialNumToRender={10}
          refreshing={refreshing}
          onRefresh={handleRefresh}
        />
      )}

      {AlertComponent}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
    backgroundColor: 'rgba(5, 4, 11, 0.95)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(106, 91, 255, 0.2)',
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
  placeholder: {
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countBadge: {
    backgroundColor: COLORS.gold,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    minWidth: 24,
    alignItems: 'center',
  },
  countText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.background,
  },

  // Info Banner
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.md,
    padding: SPACING.md,
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    borderRadius: 12,
    gap: SPACING.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.2)',
  },
  infoText: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },

  // List
  listContent: {
    paddingTop: SPACING.md,
    paddingBottom: SPACING.huge,
  },
  listContentEmpty: {
    flex: 1,
  },

  // Request Item
  requestItem: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(106, 91, 255, 0.1)',
  },
  avatarContainer: {
    marginRight: SPACING.md,
  },
  avatar: {
    width: TOUCH.avatarMd,
    height: TOUCH.avatarMd,
    borderRadius: TOUCH.avatarMd / 2,
    backgroundColor: COLORS.glassBg,
  },
  avatarFallback: {
    width: TOUCH.avatarMd,
    height: TOUCH.avatarMd,
    borderRadius: TOUCH.avatarMd / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
  requestContent: {
    flex: 1,
  },
  requestHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  requesterName: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
    marginRight: SPACING.sm,
  },
  requestTime: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
  },
  messagePreview: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: 4,
  },
  messageCount: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    marginBottom: SPACING.sm,
  },

  // Action Buttons
  actionButtons: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.xs,
  },
  actionButton: {
    flex: 1,
    paddingVertical: SPACING.sm,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 36,
  },
  declineButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  acceptButton: {
    backgroundColor: COLORS.gold,
  },
  declineText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textSecondary,
  },
  acceptText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.background,
  },

  // Loading & Empty
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.xxl,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(15, 16, 48, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xl,
  },
  emptyTitle: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  emptySubtitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 24,
  },
});
