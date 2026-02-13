/**
 * OutgoingCallScreen
 * Shows when initiating a call, waiting for callee to answer
 */

import React, { useEffect, useCallback, useState, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, BackHandler, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Phone, Video } from 'lucide-react-native';
import { COLORS, SPACING, TYPOGRAPHY, GRADIENTS } from '../../utils/tokens';
import { CALL_TYPE, CALL_STATUS } from '../../constants/callConstants';
import { callService } from '../../services/callService';
import { useCall } from '../../hooks/useCall';
import { CallAvatar, CallControls } from '../../components/Call';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

/**
 * OutgoingCallScreen - Screen shown when calling someone
 * @param {Object} props.route.params
 * @param {Object} props.route.params.call - Call object (initially only call_type and conversation_id)
 * @param {Object} props.route.params.callee - Callee user info
 */
const OutgoingCallScreen = ({ route, navigation }) => {
  const { call: initialCall, callee } = route.params || {};
  const isVideoCall = initialCall?.call_type === CALL_TYPE.VIDEO;

  // State for the actual call (after initiating)
  const [call, setCall] = useState(null);
  const [initiateError, setInitiateError] = useState(null);
  const [isInitiating, setIsInitiating] = useState(true);
  const isInitiated = useRef(false);

  // ========== INITIATE CALL ==========
  useEffect(() => {
    const initiate = async () => {
      // Prevent double initialization
      if (isInitiated.current) return;
      isInitiated.current = true;

      if (!initialCall?.conversation_id || !callee?.id) {
        setInitiateError('Thông tin cuộc gọi không hợp lệ');
        setIsInitiating(false);
        return;
      }

      try {
        console.log('[OutgoingCallScreen] ========================================');
        console.log('[OutgoingCallScreen] INITIATING CALL');
        console.log('[OutgoingCallScreen] conversation_id:', initialCall.conversation_id);
        console.log('[OutgoingCallScreen] callee object:', JSON.stringify(callee));
        console.log('[OutgoingCallScreen] callee.id (người nhận):', callee.id);
        console.log('[OutgoingCallScreen] call_type:', initialCall.call_type);
        console.log('[OutgoingCallScreen] ========================================');
        const result = await callService.initiateCall(
          initialCall.conversation_id,
          callee.id,
          initialCall.call_type
        );

        if (!result.success) {
          setInitiateError(result.error || 'Không thể khởi tạo cuộc gọi');
          setIsInitiating(false);
          return;
        }

        console.log('[OutgoingCallScreen] Call initiated:', result.call.id);
        setCall(result.call);
        setIsInitiating(false);
      } catch (err) {
        console.error('[OutgoingCallScreen] Initiate error:', err);
        setInitiateError(err.message);
        setIsInitiating(false);
      }
    };

    initiate();
  }, [initialCall, callee]);

  // Show error and go back
  useEffect(() => {
    if (initiateError) {
      Alert.alert('Lỗi', initiateError, [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    }
  }, [initiateError, navigation]);

  // ========== HOOKS ==========
  const {
    callState,
    isMuted,
    isSpeakerOn,
    toggleMute,
    toggleSpeaker,
    cancelCall,
    isConnected,
    isRinging,
    isConnecting,
  } = useCall({
    call, // This is now the actual call object with id
    isCaller: true,
    onCallEnded: (reason) => {
      navigation.replace('CallEnded', { call, callee, duration: 0, reason });
    },
  });

  // Timer disabled during ringing - only show when connected (industry standard)
  // Ringing state just shows "Đang gọi..." without timer

  // ========== EFFECTS ==========

  // Handle back button
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      handleCancel();
      return true;
    });

    return () => backHandler.remove();
  }, []);

  // Navigate to InCall or VideoCall when connected
  useEffect(() => {
    if (isConnected) {
      const screenName = isVideoCall ? 'VideoCall' : 'InCall';
      navigation.replace(screenName, { call, callee, isCaller: true });
    }
  }, [isConnected, navigation, call, callee, isVideoCall]);

  // ========== HANDLERS ==========

  const handleCancel = useCallback(async () => {
    if (call?.id) {
      await cancelCall();
    }
    navigation.goBack();
  }, [cancelCall, navigation, call?.id]);

  // ========== RENDER ==========

  const getStatusText = () => {
    if (isInitiating) return 'Đang khởi tạo...';
    if (isConnecting) return 'Đang kết nối...';
    if (isRinging) return 'Đang gọi...';
    return 'Đang chờ...';
  };

  return (
    <LinearGradient
      colors={GRADIENTS.background}
      locations={GRADIENTS.backgroundLocations}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        {/* Callee Info */}
        <View style={styles.calleeInfo}>
          <CallAvatar
            uri={callee?.avatar_url}
            size={140}
            isPulsing={isRinging}
            pulseColor={isVideoCall ? COLORS.cyan : COLORS.gold}
          />

          <Text style={styles.calleeName}>
            {callee?.display_name || 'Người nhận'}
          </Text>

          <View style={styles.statusRow}>
            {isVideoCall ? (
              <Video size={18} color={COLORS.textSecondary} />
            ) : (
              <Phone size={18} color={COLORS.textSecondary} />
            )}
            <Text style={styles.statusText}>
              {getStatusText()}
            </Text>
          </View>
        </View>

        {/* Controls */}
        <View style={styles.controlsContainer}>
          {/* Mute and Speaker controls */}
          <View style={styles.miniControls}>
            <CallControls
              isMuted={isMuted}
              isSpeakerOn={isSpeakerOn}
              showVideo={false}
              onToggleMute={toggleMute}
              onToggleSpeaker={toggleSpeaker}
              onEndCall={handleCancel}
            />
          </View>
        </View>
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
  calleeInfo: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: SCREEN_HEIGHT * 0.05,
  },
  calleeName: {
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
    marginBottom: SPACING.md,
  },
  statusText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textSecondary,
    marginLeft: SPACING.xs,
  },
  controlsContainer: {
    paddingBottom: SCREEN_HEIGHT * 0.08,
  },
  miniControls: {
    alignItems: 'center',
  },
});

export default OutgoingCallScreen;
