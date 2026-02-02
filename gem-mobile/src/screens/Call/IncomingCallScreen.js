/**
 * IncomingCallScreen
 * Shows when receiving an incoming call
 */

import React, { useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Dimensions, BackHandler } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Phone, Video, PhoneOff } from 'lucide-react-native';
import { COLORS, SPACING, TYPOGRAPHY, GRADIENTS } from '../../utils/tokens';
import { CALL_TYPE } from '../../constants/callConstants';
import { useCall } from '../../hooks/useCall';
import { CallAvatar, CallControls } from '../../components/Call';
import { TouchableOpacity } from 'react-native';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

/**
 * IncomingCallScreen - Screen shown when receiving a call
 * @param {Object} props.route.params
 * @param {Object} props.route.params.call - Call object
 * @param {Object} props.route.params.caller - Caller user info
 */
const IncomingCallScreen = ({ route, navigation }) => {
  const { call, caller } = route.params || {};
  const isVideoCall = call?.call_type === CALL_TYPE.VIDEO;

  // Debug: Log params on mount
  console.log('[IncomingCallScreen] ========================================');
  console.log('[IncomingCallScreen] SCREEN MOUNTED');
  console.log('[IncomingCallScreen] call.id:', call?.id);
  console.log('[IncomingCallScreen] call.status:', call?.status);
  console.log('[IncomingCallScreen] caller:', caller?.display_name);
  console.log('[IncomingCallScreen] ========================================');

  // ========== HOOKS ==========
  const {
    answerCall,
    declineCall,
    isConnecting,
    isConnected,
  } = useCall({
    call,
    isCaller: false,
    onCallEnded: (reason) => {
      navigation.replace('CallEnded', { call, caller, duration: 0, reason });
    },
  });

  // ========== EFFECTS ==========

  // Handle back button - decline call
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      handleDecline();
      return true;
    });

    return () => backHandler.remove();
  }, []);

  // Navigate to InCall or VideoCall when connected
  useEffect(() => {
    if (isConnected) {
      const screenName = isVideoCall ? 'VideoCall' : 'InCall';
      navigation.replace(screenName, { call, caller, isCaller: false });
    }
  }, [isConnected, navigation, call, caller, isVideoCall]);

  // ========== HANDLERS ==========

  const handleAccept = useCallback(async () => {
    console.log('[IncomingCallScreen] ========================================');
    console.log('[IncomingCallScreen] ACCEPT BUTTON PRESSED');
    console.log('[IncomingCallScreen] call:', call?.id);
    console.log('[IncomingCallScreen] isConnecting:', isConnecting);
    console.log('[IncomingCallScreen] ========================================');

    try {
      await answerCall();
      console.log('[IncomingCallScreen] answerCall completed');
    } catch (err) {
      console.error('[IncomingCallScreen] answerCall error:', err);
    }
  }, [answerCall, call?.id, isConnecting]);

  const handleDecline = useCallback(async () => {
    await declineCall();
    navigation.goBack();
  }, [declineCall, navigation]);

  // ========== RENDER ==========

  return (
    <LinearGradient
      colors={GRADIENTS.background}
      locations={GRADIENTS.backgroundLocations}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        {/* Caller Info */}
        <View style={styles.callerInfo}>
          <CallAvatar
            uri={caller?.avatar_url}
            size={140}
            isPulsing
            pulseColor={isVideoCall ? COLORS.cyan : COLORS.gold}
          />

          <Text style={styles.callerName}>
            {caller?.display_name || 'Người gọi'}
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

          {isConnecting && (
            <Text style={styles.connectingText}>Đang kết nối...</Text>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          {/* Decline Button */}
          <View style={styles.actionWrapper}>
            <TouchableOpacity
              style={[styles.actionButton, styles.declineButton]}
              onPress={handleDecline}
              activeOpacity={0.8}
            >
              <PhoneOff size={32} color={COLORS.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.actionLabel}>Từ chối</Text>
          </View>

          {/* Accept Button */}
          <View style={styles.actionWrapper}>
            <TouchableOpacity
              style={[styles.actionButton, styles.acceptButton, isConnecting && { opacity: 0.5 }]}
              onPress={() => {
                console.log('[IncomingCallScreen] TouchableOpacity onPress triggered');
                handleAccept();
              }}
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
  connectingText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.gold,
    marginTop: SPACING.md,
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
    width: 70,
    height: 70,
    borderRadius: 35,
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

export default IncomingCallScreen;
