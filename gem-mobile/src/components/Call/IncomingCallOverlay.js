/**
 * IncomingCallOverlay Component
 * Full-screen incoming call UI
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Phone, PhoneOff, Video } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, TYPOGRAPHY, GRADIENTS } from '../../utils/tokens';
import { CALL_TYPE, CALL_UI } from '../../constants/callConstants';
import CallAvatar from './CallAvatar';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

/**
 * IncomingCallOverlay - Full-screen overlay for incoming calls
 * @param {Object} props
 * @param {boolean} props.visible - Whether overlay is visible
 * @param {Object} props.call - Call object
 * @param {Function} props.onAccept - Accept handler
 * @param {Function} props.onDecline - Decline handler
 */
const IncomingCallOverlay = ({
  visible = false,
  call,
  onAccept,
  onDecline,
}) => {
  if (!call) return null;

  const isVideoCall = call.call_type === CALL_TYPE.VIDEO;
  const caller = call.caller || {};

  return (
    <Modal
      visible={visible}
      animationType="fade"
      statusBarTranslucent
      transparent={false}
    >
      <LinearGradient
        colors={GRADIENTS.background}
        locations={GRADIENTS.backgroundLocations}
        style={styles.container}
      >
        <SafeAreaView style={styles.safeArea}>
          {/* Caller Info */}
          <View style={styles.callerInfo}>
            <CallAvatar
              uri={caller.avatar_url}
              size={CALL_UI.AVATAR_SIZE_LARGE}
              isPulsing
              pulseColor={isVideoCall ? COLORS.cyan : COLORS.gold}
            />

            <Text style={styles.callerName}>
              {caller.display_name || 'Người gọi'}
            </Text>

            <View style={styles.callTypeRow}>
              {isVideoCall ? (
                <Video size={20} color={COLORS.textSecondary} />
              ) : (
                <Phone size={20} color={COLORS.textSecondary} />
              )}
              <Text style={styles.callTypeText}>
                {isVideoCall ? 'Cuộc gọi video đến' : 'Cuộc gọi thoại đến'}
              </Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionsContainer}>
            {/* Decline Button */}
            <View style={styles.actionWrapper}>
              <TouchableOpacity
                style={[styles.actionButton, styles.declineButton]}
                onPress={onDecline}
                activeOpacity={0.8}
              >
                <PhoneOff size={32} color={COLORS.textPrimary} />
              </TouchableOpacity>
              <Text style={styles.actionLabel}>Từ chối</Text>
            </View>

            {/* Accept Button */}
            <View style={styles.actionWrapper}>
              <TouchableOpacity
                style={[styles.actionButton, styles.acceptButton]}
                onPress={onAccept}
                activeOpacity={0.8}
              >
                {isVideoCall ? (
                  <Video size={32} color={COLORS.textPrimary} />
                ) : (
                  <Phone size={32} color={COLORS.textPrimary} />
                )}
              </TouchableOpacity>
              <Text style={styles.actionLabel}>Trả lời</Text>
            </View>
          </View>

          {/* Hint text */}
          <Text style={styles.hintText}>
            Nhấn để trả lời hoặc từ chối
          </Text>
        </SafeAreaView>
      </LinearGradient>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  callerInfo: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: SCREEN_HEIGHT * 0.1,
  },
  callerName: {
    fontSize: TYPOGRAPHY.fontSize.hero,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
    marginTop: SPACING.xl,
    marginBottom: SPACING.sm,
    textAlign: 'center',
    paddingHorizontal: SPACING.xl,
  },
  callTypeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.xs,
  },
  callTypeText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textSecondary,
    marginLeft: SPACING.xs,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingBottom: SCREEN_HEIGHT * 0.08,
    gap: 80,
  },
  actionWrapper: {
    alignItems: 'center',
  },
  actionButton: {
    width: CALL_UI.END_BUTTON_SIZE,
    height: CALL_UI.END_BUTTON_SIZE,
    borderRadius: CALL_UI.END_BUTTON_SIZE / 2,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  declineButton: {
    backgroundColor: COLORS.error,
  },
  acceptButton: {
    backgroundColor: COLORS.success,
  },
  actionLabel: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textSecondary,
    marginTop: SPACING.md,
    textAlign: 'center',
  },
  hintText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    textAlign: 'center',
    paddingBottom: SPACING.xl,
  },
});

export default IncomingCallOverlay;
