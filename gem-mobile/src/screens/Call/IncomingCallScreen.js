/**
 * IncomingCallScreen
 * Shows when receiving an incoming call
 */

import React, { useEffect, useCallback, useState, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, BackHandler, Vibration } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Phone, Video, PhoneOff } from 'lucide-react-native';
import { COLORS, SPACING, TYPOGRAPHY, GRADIENTS } from '../../utils/tokens';
import { CALL_TYPE } from '../../constants/callConstants';
import { useCall } from '../../hooks/useCall';
import { callService } from '../../services/callService';
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

  // Track if user has pressed Accept button
  const [hasAccepted, setHasAccepted] = useState(false);
  const hasNavigatedRef = useRef(false);

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
    autoInitialize: false, // DON'T auto-init, wait for user to press Accept
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

  // Check if call is already ended (e.g., caller hung up before we showed screen)
  // This prevents showing a screen with non-working buttons
  useEffect(() => {
    const endedStatuses = ['ended', 'declined', 'cancelled', 'missed', 'failed'];
    if (call?.status && endedStatuses.includes(call.status)) {
      console.log('[IncomingCallScreen] Call already ended:', call.status, '- going back');
      Vibration.cancel();
      navigation.goBack();
    }
  }, [call?.status, navigation]);

  // On mount, verify call is still valid by checking database
  useEffect(() => {
    const checkCallStatus = async () => {
      if (!call?.id) return;

      try {
        const result = await callService.getCall(call.id);
        if (!result.success || !result.call) {
          console.log('[IncomingCallScreen] Call not found in database - going back');
          Vibration.cancel();
          navigation.goBack();
          return;
        }

        const dbStatus = result.call.status;
        const endedStatuses = ['ended', 'declined', 'cancelled', 'missed', 'failed'];
        if (endedStatuses.includes(dbStatus)) {
          console.log('[IncomingCallScreen] Call ended in database:', dbStatus, '- going back');
          Vibration.cancel();
          navigation.goBack();
        }
      } catch (err) {
        console.log('[IncomingCallScreen] Error checking call status:', err.message);
      }
    };

    // Check on mount
    checkCallStatus();

    // Also poll every 2 seconds to detect if caller hangs up
    const interval = setInterval(checkCallStatus, 2000);
    return () => clearInterval(interval);
  }, [call?.id, navigation]);

  // Navigate to InCall or VideoCall when connected AND user has accepted
  useEffect(() => {
    console.log('[IncomingCallScreen] Navigation check - hasAccepted:', hasAccepted, 'isConnected:', isConnected, 'hasNavigated:', hasNavigatedRef.current);

    // Only navigate if user pressed Accept AND connection is established
    if (hasAccepted && isConnected && !hasNavigatedRef.current) {
      hasNavigatedRef.current = true;
      const screenName = isVideoCall ? 'VideoCall' : 'InCall';
      console.log('[IncomingCallScreen] Navigating to', screenName);
      navigation.replace(screenName, { call, caller, isCaller: false });
    }
  }, [hasAccepted, isConnected, navigation, call, caller, isVideoCall]);

  // ========== HANDLERS ==========

  const handleAccept = useCallback(async () => {
    console.log('[IncomingCallScreen] ========================================');
    console.log('[IncomingCallScreen] ACCEPT BUTTON PRESSED');
    console.log('[IncomingCallScreen] call:', call?.id);
    console.log('[IncomingCallScreen] isConnecting:', isConnecting);
    console.log('[IncomingCallScreen] ========================================');

    // CRITICAL: Stop vibration immediately when user accepts
    Vibration.cancel();

    // Mark that user has accepted - this enables navigation when connected
    setHasAccepted(true);

    try {
      await answerCall();
      console.log('[IncomingCallScreen] answerCall completed');
    } catch (err) {
      console.error('[IncomingCallScreen] answerCall error:', err);
    }
  }, [answerCall, call?.id, isConnecting]);

  const handleDecline = useCallback(async () => {
    // CRITICAL: Stop vibration immediately when user declines
    Vibration.cancel();
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
              style={[styles.actionButton, styles.acceptButton, (isConnecting || hasAccepted) && { opacity: 0.5 }]}
              onPress={() => {
                if (hasAccepted || isConnecting) {
                  console.log('[IncomingCallScreen] Button disabled - already accepting');
                  return;
                }
                console.log('[IncomingCallScreen] TouchableOpacity onPress triggered');
                handleAccept();
              }}
              activeOpacity={0.8}
              disabled={hasAccepted || isConnecting}
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
