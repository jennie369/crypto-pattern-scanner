/**
 * Gemral - Message Requests Screen
 * TikTok-style message requests inbox (Tin nhắn chờ)
 *
 * Features:
 * - View pending message requests from strangers
 * - Preview messages before accepting
 * - Accept / Decline / Block & Report
 * - Real-time updates
 * - Empty state
 * - Glass-morphism UI
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from '../../utils/haptics';

// Services
import messageRequestService from '../../services/messageRequestService';

// Auth
import { useAuth } from '../../contexts/AuthContext';

// Alert
import CustomAlert, { useCustomAlert } from '../../components/CustomAlert';

// Components
import MessageRequestItem from './components/MessageRequestItem';

// Tokens
import {
  COLORS,
  GRADIENTS,
  SPACING,
  TYPOGRAPHY,
} from '../../utils/tokens';

// Tooltip Component
const Tooltip = ({ visible, text, style }) => {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: visible ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [visible]);

  if (!visible) return null;

  return (
    <Animated.View style={[styles.tooltip, style, { opacity }]}>
      <Text style={styles.tooltipText}>{text}</Text>
    </Animated.View>
  );
};

export default function MessageRequestsScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { alert, AlertComponent } = useCustomAlert();

  // State
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [processingId, setProcessingId] = useState(null);
  const [showTooltip, setShowTooltip] = useState(false);

  // Refs
  const unsubscribeRef = useRef(null);

  // =====================================================
  // FETCH DATA
  // =====================================================

  const fetchRequests = useCallback(async () => {
    try {
      const data = await messageRequestService.getMessageRequests('pending');
      setRequests(data);
    } catch (error) {
      console.error('Error fetching message requests:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Initial load & subscription
  useEffect(() => {
    fetchRequests();

    // Subscribe to real-time updates
    if (user?.id) {
      unsubscribeRef.current = messageRequestService.subscribeToMessageRequests(
        user.id,
        (newRequest) => {
          // Add new request to list
          setRequests(prev => {
            const exists = prev.some(r => r.id === newRequest.id);
            if (exists) return prev;
            return [newRequest, ...prev];
          });
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        },
        null // No count callback needed here
      );
    }

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, [user?.id, fetchRequests]);

  // =====================================================
  // HANDLERS
  // =====================================================

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    fetchRequests();
  }, [fetchRequests]);

  const handleAccept = useCallback(async (request) => {
    try {
      setProcessingId(request.id);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      const result = await messageRequestService.acceptMessageRequest(request.id);

      if (result.success) {
        // Remove from list
        setRequests(prev => prev.filter(r => r.id !== request.id));
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        // Navigate to chat
        navigation.navigate('Chat', {
          conversationId: request.conversation_id,
          conversation: {
            id: request.conversation_id,
            other_participant: request.requester,
          },
        });
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error accepting request:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      alert({
        type: 'error',
        title: 'Lỗi',
        message: 'Không thể chấp nhận tin nhắn. Vui lòng thử lại.',
      });
    } finally {
      setProcessingId(null);
    }
  }, [navigation, alert]);

  const handleDecline = useCallback(async (request, shouldBlock = false) => {
    const action = shouldBlock ? 'chặn' : 'từ chối';
    const title = shouldBlock ? 'Chặn & Xóa' : 'Từ chối';

    alert({
      type: 'warning',
      title: title,
      message: `Bạn có chắc muốn ${action} tin nhắn từ ${request.requester?.display_name || 'người này'}?${shouldBlock ? '\n\nNgười này sẽ không thể gửi tin nhắn cho bạn nữa.' : ''}`,
      buttons: [
        { text: 'Hủy', style: 'cancel' },
        {
          text: title,
          style: 'destructive',
          onPress: async () => {
            try {
              setProcessingId(request.id);
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

              const result = await messageRequestService.declineMessageRequest(
                request.id,
                shouldBlock
              );

              if (result.success) {
                setRequests(prev => prev.filter(r => r.id !== request.id));
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              } else {
                throw new Error(result.error);
              }
            } catch (error) {
              console.error('Error declining request:', error);
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
              alert({
                type: 'error',
                title: 'Lỗi',
                message: 'Không thể xử lý yêu cầu. Vui lòng thử lại.',
              });
            } finally {
              setProcessingId(null);
            }
          },
        },
      ],
    });
  }, [alert]);

  const handleViewProfile = useCallback((request) => {
    if (request.requester?.id) {
      navigation.navigate('Profile', { userId: request.requester.id });
    }
  }, [navigation]);

  const handlePreview = useCallback((request) => {
    // Navigate to chat in preview mode (read-only until accepted)
    navigation.navigate('Chat', {
      conversationId: request.conversation_id,
      conversation: {
        id: request.conversation_id,
        other_participant: request.requester,
      },
      isMessageRequest: true,
      requestId: request.id,
    });
  }, [navigation]);

  // =====================================================
  // RENDER
  // =====================================================

  const renderInfoBanner = () => (
    <View style={styles.infoBanner}>
      <View style={styles.infoBannerIcon}>
        <Ionicons name="shield-checkmark" size={20} color={COLORS.purple} />
      </View>
      <View style={styles.infoBannerContent}>
        <Text style={styles.infoBannerTitle}>Tin nhắn chờ</Text>
        <Text style={styles.infoBannerText}>
          Đây là tin nhắn từ những người bạn chưa từng nhắn tin. Hãy xem xét trước khi chấp nhận.
        </Text>
      </View>
      <TouchableOpacity
        onPress={() => setShowTooltip(!showTooltip)}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons name="help-circle-outline" size={20} color={COLORS.textMuted} />
      </TouchableOpacity>
      <Tooltip
        visible={showTooltip}
        text="Tin nhắn từ người lạ sẽ được gửi vào đây thay vì hộp thư chính. Bạn có thể chấp nhận để bắt đầu trò chuyện hoặc từ chối/chặn nếu không muốn nhận."
        style={styles.infoTooltip}
      />
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <LinearGradient
          colors={GRADIENTS.glassBorder}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.emptyIconGradient}
        >
          <Ionicons name="mail-open-outline" size={48} color={COLORS.textPrimary} />
        </LinearGradient>
      </View>
      <Text style={styles.emptyTitle}>Không có tin nhắn chờ</Text>
      <Text style={styles.emptySubtitle}>
        Khi có người mới muốn nhắn tin với bạn, tin nhắn của họ sẽ hiển thị ở đây.
      </Text>
    </View>
  );

  const renderRequest = ({ item, index }) => (
    <MessageRequestItem
      request={item}
      onAccept={() => handleAccept(item)}
      onDecline={() => handleDecline(item, false)}
      onBlock={() => handleDecline(item, true)}
      onViewProfile={() => handleViewProfile(item)}
      onPreview={() => handlePreview(item)}
      isProcessing={processingId === item.id}
      index={index}
    />
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

        <View style={styles.titleContainer}>
          <Text style={styles.title}>Tin nhắn chờ</Text>
          {requests.length > 0 && (
            <View style={styles.countBadge}>
              <Text style={styles.countText}>{requests.length}</Text>
            </View>
          )}
        </View>

        <View style={styles.placeholder} />
      </View>

      {/* Info Banner */}
      {renderInfoBanner()}

      {/* Requests List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.gold} />
        </View>
      ) : (
        <FlatList
          data={requests}
          renderItem={renderRequest}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[
            styles.listContent,
            requests.length === 0 && styles.listContentEmpty,
          ]}
          ListEmptyComponent={renderEmptyState}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={COLORS.gold}
              colors={[COLORS.gold]}
            />
          }
          showsVerticalScrollIndicator={false}
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
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
  countBadge: {
    backgroundColor: COLORS.purple,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 20,
    alignItems: 'center',
  },
  countText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
  placeholder: {
    width: 40,
  },

  // Info Banner
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.md,
    padding: SPACING.md,
    backgroundColor: 'rgba(106, 91, 255, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.2)',
  },
  infoBannerIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(106, 91, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  infoBannerContent: {
    flex: 1,
  },
  infoBannerTitle: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  infoBannerText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },

  // Tooltip
  tooltip: {
    position: 'absolute',
    right: 0,
    top: 45,
    width: 280,
    padding: SPACING.md,
    backgroundColor: COLORS.glassBg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.3)',
    zIndex: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  tooltipText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  infoTooltip: {
    right: SPACING.md,
    top: 60,
  },

  // List
  listContent: {
    paddingTop: SPACING.md,
    paddingBottom: SPACING.huge,
  },
  listContentEmpty: {
    flex: 1,
  },

  // Loading
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Empty State
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.xxl,
  },
  emptyIconContainer: {
    marginBottom: SPACING.xl,
  },
  emptyIconGradient: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 24,
  },
});
