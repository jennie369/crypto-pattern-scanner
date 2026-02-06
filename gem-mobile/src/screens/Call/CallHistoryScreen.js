/**
 * CallHistoryScreen
 * Shows list of past calls
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Phone,
  Video,
  PhoneIncoming,
  PhoneOutgoing,
  PhoneMissed,
  ArrowLeft,
} from 'lucide-react-native';
import { COLORS, SPACING, TYPOGRAPHY, GRADIENTS, BORDER_RADIUS } from '../../utils/tokens';
import { CALL_TYPE, CALL_STATUS, END_REASON } from '../../constants/callConstants';
import { callService } from '../../services/callService';
import { CallAvatar } from '../../components/Call';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

/**
 * CallHistoryScreen - List of past calls
 */
const CallHistoryScreen = ({ navigation }) => {
  const [calls, setCalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // ========== DATA FETCHING ==========

  const fetchCallHistory = useCallback(async () => {
    try {
      const result = await callService.getCallHistory(50);
      if (result.success && result.data) {
        setCalls(result.data);
      } else {
        console.warn('[CallHistory] Failed to fetch:', result.error);
        setCalls([]);
      }
    } catch (error) {
      console.error('[CallHistory] Error fetching call history:', error);
      setCalls([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchCallHistory();
  }, [fetchCallHistory]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    fetchCallHistory();
  }, [fetchCallHistory]);

  // ========== HANDLERS ==========

  const handleCallBack = (item) => {
    // Handle both camelCase and snake_case field names
    const otherUser = item.otherUser || item.other_user || {};

    // Navigate to Call stack -> OutgoingCall screen
    navigation.navigate('Call', {
      screen: 'OutgoingCall',
      params: {
        call: {
          call_type: item.call_type || CALL_TYPE.AUDIO,
          conversation_id: item.conversation_id,
        },
        callee: otherUser,
      },
    });
  };

  const handleGoBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  // ========== HELPERS ==========

  const getCallIcon = (item) => {
    const isMissed = item.status === CALL_STATUS.MISSED ||
      item.end_reason === END_REASON.MISSED ||
      item.end_reason === END_REASON.NO_ANSWER;

    if (isMissed) {
      return { Icon: PhoneMissed, color: COLORS.error };
    }

    // Handle both is_caller and is_outgoing field names
    const isOutgoing = item.is_caller || item.is_outgoing;
    if (isOutgoing) {
      return { Icon: PhoneOutgoing, color: COLORS.success };
    }

    return { Icon: PhoneIncoming, color: COLORS.cyan };
  };

  const getCallTypeIcon = (callType) => {
    return callType === CALL_TYPE.VIDEO ? Video : Phone;
  };

  const formatDuration = (seconds) => {
    if (!seconds || seconds < 1) return null;

    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;

    if (mins > 0) {
      return `${mins} phút ${secs > 0 ? `${secs} giây` : ''}`;
    }
    return `${secs} giây`;
  };

  const formatTime = (dateString) => {
    if (!dateString) return '';

    try {
      return formatDistanceToNow(new Date(dateString), {
        addSuffix: true,
        locale: vi,
      });
    } catch {
      return '';
    }
  };

  // ========== RENDER ==========

  const renderCallItem = ({ item }) => {
    const { Icon: DirectionIcon, color: directionColor } = getCallIcon(item);
    const TypeIcon = getCallTypeIcon(item.call_type);
    // Handle both camelCase and snake_case field names
    const otherUser = item.otherUser || item.other_user || {};
    const duration = formatDuration(item.duration || item.duration_seconds);
    const timeAgo = formatTime(item.created_at);

    const isMissed = item.status === CALL_STATUS.MISSED ||
      item.end_reason === END_REASON.MISSED ||
      item.end_reason === END_REASON.NO_ANSWER;

    return (
      <TouchableOpacity
        style={styles.callItem}
        onPress={() => handleCallBack(item)}
        activeOpacity={0.7}
      >
        {/* Avatar */}
        <CallAvatar
          uri={otherUser.avatar_url}
          size={50}
          isPulsing={false}
        />

        {/* Info */}
        <View style={styles.callInfo}>
          <Text
            style={[
              styles.userName,
              isMissed && styles.missedText,
            ]}
            numberOfLines={1}
          >
            {otherUser.display_name || 'Người dùng'}
          </Text>

          <View style={styles.callMeta}>
            <DirectionIcon size={14} color={directionColor} />
            <TypeIcon size={14} color={COLORS.textSecondary} style={styles.typeIcon} />
            <Text style={styles.callDetail}>
              {isMissed ? 'Cuộc gọi nhỡ' : duration || 'Không kết nối'}
            </Text>
          </View>
        </View>

        {/* Time */}
        <Text style={styles.timeText}>{timeAgo}</Text>

        {/* Call Back Button */}
        <TouchableOpacity
          style={styles.callBackBtn}
          onPress={() => handleCallBack(item)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Phone size={20} color={COLORS.success} />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Phone size={48} color={COLORS.textMuted} />
      <Text style={styles.emptyText}>Chưa có lịch sử cuộc gọi</Text>
      <Text style={styles.emptySubtext}>
        Các cuộc gọi của bạn sẽ hiển thị ở đây
      </Text>
    </View>
  );

  if (loading) {
    return (
      <LinearGradient
        colors={GRADIENTS.background}
        locations={GRADIENTS.backgroundLocations}
        style={styles.container}
      >
        <SafeAreaView style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.gold} />
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={GRADIENTS.background}
      locations={GRADIENTS.backgroundLocations}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleGoBack}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <ArrowLeft size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Lịch sử cuộc gọi</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Call List */}
        <FlatList
          data={calls}
          keyExtractor={(item) => item.id}
          renderItem={renderCallItem}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={renderEmpty}
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
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.glassBorder,
  },
  backButton: {
    padding: SPACING.xs,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
  headerSpacer: {
    width: 32,
  },
  listContent: {
    paddingVertical: SPACING.md,
  },
  callItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.glassBorder,
  },
  callInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  userName: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xxs,
  },
  missedText: {
    color: COLORS.error,
  },
  callMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typeIcon: {
    marginLeft: SPACING.xs,
  },
  callDetail: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    marginLeft: SPACING.xs,
  },
  timeText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    marginRight: SPACING.md,
  },
  callBackBtn: {
    padding: SPACING.sm,
    backgroundColor: COLORS.glassBg,
    borderRadius: BORDER_RADIUS.full,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
    paddingHorizontal: SPACING.xl,
  },
  emptyText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textSecondary,
    marginTop: SPACING.lg,
  },
  emptySubtext: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textMuted,
    marginTop: SPACING.sm,
    textAlign: 'center',
  },
});

export default CallHistoryScreen;
