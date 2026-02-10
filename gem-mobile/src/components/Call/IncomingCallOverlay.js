/**
 * IncomingCallOverlay Component
 * Full-screen incoming call UI
 */

import React, { useMemo } from 'react';
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
import { useSettings } from '../../contexts/SettingsContext';
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
  const { colors, gradients, glass, settings, SPACING, TYPOGRAPHY } = useSettings();

  const styles = useMemo(() => StyleSheet.create({
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
      color: colors.textPrimary,
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
      color: colors.textSecondary,
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
      backgroundColor: colors.error,
    },
    acceptButton: {
      backgroundColor: colors.success,
    },
    actionLabel: {
      fontSize: TYPOGRAPHY.fontSize.md,
      color: colors.textSecondary,
      marginTop: SPACING.md,
      textAlign: 'center',
    },
    hintText: {
      fontSize: TYPOGRAPHY.fontSize.sm,
      color: colors.textMuted,
      textAlign: 'center',
      paddingBottom: SPACING.xl,
    },
  }), [colors, settings.theme, glass, SPACING, TYPOGRAPHY]);

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
        colors={gradients.background}
        locations={gradients.backgroundLocations}
        style={styles.container}
      >
        <SafeAreaView style={styles.safeArea}>
          {/* Caller Info */}
          <View style={styles.callerInfo}>
            <CallAvatar
              uri={caller.avatar_url}
              size={CALL_UI.AVATAR_SIZE_LARGE}
              isPulsing
              pulseColor={isVideoCall ? colors.cyan : colors.gold}
            />

            <Text style={styles.callerName}>
              {caller.display_name || 'Nguoi goi'}
            </Text>

            <View style={styles.callTypeRow}>
              {isVideoCall ? (
                <Video size={20} color={colors.textSecondary} />
              ) : (
                <Phone size={20} color={colors.textSecondary} />
              )}
              <Text style={styles.callTypeText}>
                {isVideoCall ? 'Cuoc goi video den' : 'Cuoc goi thoai den'}
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
                <PhoneOff size={32} color={colors.textPrimary} />
              </TouchableOpacity>
              <Text style={styles.actionLabel}>Tu choi</Text>
            </View>

            {/* Accept Button */}
            <View style={styles.actionWrapper}>
              <TouchableOpacity
                style={[styles.actionButton, styles.acceptButton]}
                onPress={onAccept}
                activeOpacity={0.8}
              >
                {isVideoCall ? (
                  <Video size={32} color={colors.textPrimary} />
                ) : (
                  <Phone size={32} color={colors.textPrimary} />
                )}
              </TouchableOpacity>
              <Text style={styles.actionLabel}>Tra loi</Text>
            </View>
          </View>

          {/* Hint text */}
          <Text style={styles.hintText}>
            Nhan de tra loi hoac tu choi
          </Text>
        </SafeAreaView>
      </LinearGradient>
    </Modal>
  );
};

export default IncomingCallOverlay;
