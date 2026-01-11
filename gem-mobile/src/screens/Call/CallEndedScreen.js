/**
 * CallEndedScreen
 * Shows call summary after call ends
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Phone, MessageCircle, PhoneMissed, PhoneOff } from 'lucide-react-native';
import { COLORS, SPACING, TYPOGRAPHY, GRADIENTS, BORDER_RADIUS } from '../../utils/tokens';
import { END_REASON, CALL_TYPE } from '../../constants/callConstants';
import { CallAvatar } from '../../components/Call';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

// Auto-close timeout
const AUTO_CLOSE_DELAY = 5000;

/**
 * CallEndedScreen - Call summary screen
 * @param {Object} props.route.params
 * @param {Object} props.route.params.call - Call object
 * @param {Object} props.route.params.otherUser - Other participant info
 * @param {string} props.route.params.duration - Call duration string
 * @param {string} props.route.params.reason - End reason
 */
const CallEndedScreen = ({ route, navigation }) => {
  const { call, otherUser, callee, caller, duration, reason } = route.params || {};
  const user = otherUser || callee || caller;
  const isVideoCall = call?.call_type === CALL_TYPE.VIDEO;

  // ========== EFFECTS ==========

  // Auto-close after delay
  useEffect(() => {
    const timer = setTimeout(() => {
      if (navigation.canGoBack()) {
        navigation.goBack();
      } else {
        navigation.navigate('ConversationsList');
      }
    }, AUTO_CLOSE_DELAY);

    return () => clearTimeout(timer);
  }, [navigation]);

  // ========== HANDLERS ==========

  const handleCallBack = () => {
    // Navigate to outgoing call
    navigation.replace('OutgoingCall', {
      call: {
        call_type: call?.call_type || CALL_TYPE.AUDIO,
        conversation_id: call?.conversation_id,
      },
      callee: user,
    });
  };

  const handleMessage = () => {
    // Navigate back to chat
    if (call?.conversation_id) {
      navigation.navigate('Chat', { conversationId: call.conversation_id });
    } else if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('ConversationsList');
    }
  };

  const handleClose = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('ConversationsList');
    }
  };

  // ========== HELPERS ==========

  const getReasonText = () => {
    switch (reason) {
      case END_REASON.COMPLETED:
        return 'Cuộc gọi đã kết thúc';
      case END_REASON.DECLINED:
        return 'Cuộc gọi bị từ chối';
      case END_REASON.MISSED:
        return 'Cuộc gọi nhỡ';
      case END_REASON.CANCELLED:
        return 'Cuộc gọi đã hủy';
      case END_REASON.BUSY:
        return 'Người nhận đang bận';
      case END_REASON.NO_ANSWER:
        return 'Không có phản hồi';
      case END_REASON.FAILED:
        return 'Không thể kết nối';
      case END_REASON.NETWORK_ERROR:
        return 'Lỗi kết nối mạng';
      default:
        return 'Cuộc gọi đã kết thúc';
    }
  };

  const getReasonIcon = () => {
    switch (reason) {
      case END_REASON.MISSED:
      case END_REASON.NO_ANSWER:
        return PhoneMissed;
      case END_REASON.DECLINED:
      case END_REASON.FAILED:
      case END_REASON.NETWORK_ERROR:
        return PhoneOff;
      default:
        return Phone;
    }
  };

  const getReasonColor = () => {
    switch (reason) {
      case END_REASON.COMPLETED:
        return COLORS.success;
      case END_REASON.MISSED:
      case END_REASON.NO_ANSWER:
        return COLORS.warning;
      case END_REASON.DECLINED:
      case END_REASON.FAILED:
      case END_REASON.NETWORK_ERROR:
        return COLORS.error;
      default:
        return COLORS.textSecondary;
    }
  };

  const ReasonIcon = getReasonIcon();
  const reasonColor = getReasonColor();

  // ========== RENDER ==========

  return (
    <LinearGradient
      colors={GRADIENTS.background}
      locations={GRADIENTS.backgroundLocations}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        {/* User Info */}
        <View style={styles.userInfo}>
          <CallAvatar
            uri={user?.avatar_url}
            size={120}
            isPulsing={false}
          />

          <Text style={styles.userName}>
            {user?.display_name || 'Người dùng'}
          </Text>

          {/* Status */}
          <View style={styles.statusRow}>
            <ReasonIcon size={20} color={reasonColor} />
            <Text style={[styles.statusText, { color: reasonColor }]}>
              {getReasonText()}
            </Text>
          </View>

          {/* Duration */}
          {duration && reason === END_REASON.COMPLETED && (
            <Text style={styles.durationText}>
              Thời lượng: {duration}
            </Text>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          {/* Call Back Button */}
          <TouchableOpacity
            style={[styles.actionButton, styles.callBackButton]}
            onPress={handleCallBack}
            activeOpacity={0.8}
          >
            <Phone size={24} color={COLORS.textPrimary} />
            <Text style={styles.actionButtonText}>Gọi lại</Text>
          </TouchableOpacity>

          {/* Message Button */}
          <TouchableOpacity
            style={[styles.actionButton, styles.messageButton]}
            onPress={handleMessage}
            activeOpacity={0.8}
          >
            <MessageCircle size={24} color={COLORS.textPrimary} />
            <Text style={styles.actionButtonText}>Nhắn tin</Text>
          </TouchableOpacity>
        </View>

        {/* Close Button */}
        <TouchableOpacity
          style={styles.closeButton}
          onPress={handleClose}
          activeOpacity={0.7}
        >
          <Text style={styles.closeButtonText}>Đóng</Text>
        </TouchableOpacity>

        {/* Auto-close hint */}
        <Text style={styles.hintText}>
          Tự động đóng sau 5 giây
        </Text>
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
  userInfo: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: SCREEN_HEIGHT * 0.05,
  },
  userName: {
    fontSize: TYPOGRAPHY.fontSize.hero,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
    marginTop: SPACING.xl,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.xs,
  },
  statusText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    marginLeft: SPACING.xs,
  },
  durationText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textSecondary,
    marginTop: SPACING.md,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    gap: SPACING.lg,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: BORDER_RADIUS.lg,
    gap: SPACING.sm,
  },
  callBackButton: {
    backgroundColor: COLORS.success,
  },
  messageButton: {
    backgroundColor: COLORS.glassBg,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  actionButtonText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
  },
  closeButton: {
    alignSelf: 'center',
    marginTop: SPACING.xl,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xxl,
  },
  closeButtonText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textSecondary,
  },
  hintText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    textAlign: 'center',
    paddingBottom: SPACING.xl,
  },
});

export default CallEndedScreen;
