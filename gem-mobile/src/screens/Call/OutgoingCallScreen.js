/**
 * OutgoingCallScreen
 * Shows when initiating a call, waiting for callee to answer
 */

import React, { useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Dimensions, BackHandler } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Phone, Video } from 'lucide-react-native';
import { COLORS, SPACING, TYPOGRAPHY, GRADIENTS } from '../../utils/tokens';
import { CALL_TYPE, CALL_STATUS } from '../../constants/callConstants';
import { useCall } from '../../hooks/useCall';
import { useCallTimer } from '../../hooks/useCallTimer';
import { CallAvatar, CallTimer, CallControls } from '../../components/Call';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

/**
 * OutgoingCallScreen - Screen shown when calling someone
 * @param {Object} props.route.params
 * @param {Object} props.route.params.call - Call object
 * @param {Object} props.route.params.callee - Callee user info
 */
const OutgoingCallScreen = ({ route, navigation }) => {
  const { call, callee } = route.params || {};
  const isVideoCall = call?.call_type === CALL_TYPE.VIDEO;

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
    call,
    isCaller: true,
    onCallEnded: (reason) => {
      navigation.replace('CallEnded', { call, callee, duration: 0, reason });
    },
  });

  // Timer for waiting duration
  const { formattedDuration } = useCallTimer(isRinging);

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
    await cancelCall();
    navigation.goBack();
  }, [cancelCall, navigation]);

  // ========== RENDER ==========

  const getStatusText = () => {
    if (isConnecting) return 'Đang kết nối...';
    if (isRinging) return 'Đang gọi...';
    return 'Đang khởi tạo...';
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

          {/* Waiting timer */}
          {isRinging && (
            <CallTimer
              duration={formattedDuration}
              size="small"
            />
          )}
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
