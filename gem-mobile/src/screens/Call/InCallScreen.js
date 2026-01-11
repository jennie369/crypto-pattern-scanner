/**
 * InCallScreen
 * Active call screen with controls
 */

import React, { useEffect, useCallback, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, BackHandler } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, TYPOGRAPHY, GRADIENTS } from '../../utils/tokens';
import { CALL_TYPE } from '../../constants/callConstants';
import { useCall } from '../../hooks/useCall';
import { useCallTimer } from '../../hooks/useCallTimer';
import {
  CallAvatar,
  CallTimer,
  CallControls,
  CallStatusBadge,
  CallQualityIndicator,
} from '../../components/Call';
import { CustomAlert } from '../../components/Common';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

/**
 * InCallScreen - Active call screen
 * @param {Object} props.route.params
 * @param {Object} props.route.params.call - Call object
 * @param {Object} props.route.params.callee - Other participant info
 * @param {boolean} props.route.params.isCaller - Whether current user is caller
 */
const InCallScreen = ({ route, navigation }) => {
  const { call, callee, caller, isCaller } = route.params || {};
  const otherUser = isCaller ? callee : caller;
  const isVideoCall = call?.call_type === CALL_TYPE.VIDEO;

  const [showEndConfirm, setShowEndConfirm] = useState(false);

  // ========== HOOKS ==========
  const {
    callState,
    isMuted,
    isSpeakerOn,
    isVideoEnabled,
    connectionQuality,
    toggleMute,
    toggleSpeaker,
    toggleVideo,
    endCall,
    isConnected,
    isReconnecting,
  } = useCall({
    call,
    isCaller,
    onCallEnded: (reason) => {
      navigation.replace('CallEnded', {
        call,
        otherUser,
        duration: formattedDuration,
        reason,
      });
    },
  });

  // Handle upgrade to video call
  const handleUpgradeToVideo = useCallback(async () => {
    await toggleVideo();
    navigation.replace('VideoCall', {
      call: { ...call, call_type: CALL_TYPE.VIDEO },
      callee,
      caller,
      isCaller,
    });
  }, [toggleVideo, navigation, call, callee, caller, isCaller]);

  // Call duration timer - only count when connected
  const { formattedDuration, duration } = useCallTimer(isConnected);

  // ========== EFFECTS ==========

  // Handle back button - show confirmation
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      setShowEndConfirm(true);
      return true;
    });

    return () => backHandler.remove();
  }, []);

  // ========== HANDLERS ==========

  const handleEndCall = useCallback(async () => {
    await endCall();
  }, [endCall]);

  const confirmEndCall = useCallback(() => {
    setShowEndConfirm(false);
    handleEndCall();
  }, [handleEndCall]);

  // ========== RENDER ==========

  return (
    <LinearGradient
      colors={GRADIENTS.background}
      locations={GRADIENTS.backgroundLocations}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        {/* Header with status and quality */}
        <View style={styles.header}>
          <CallStatusBadge status={callState} />
          <CallQualityIndicator quality={connectionQuality} />
        </View>

        {/* Other User Info */}
        <View style={styles.userInfo}>
          <CallAvatar
            uri={otherUser?.avatar_url}
            size={120}
            isPulsing={isReconnecting}
            pulseColor={COLORS.warning}
          />

          <Text style={styles.userName}>
            {otherUser?.display_name || 'Đang gọi'}
          </Text>

          {/* Call Timer */}
          <CallTimer duration={formattedDuration} size="large" />

          {/* Reconnecting indicator */}
          {isReconnecting && (
            <Text style={styles.reconnectingText}>
              Đang kết nối lại...
            </Text>
          )}
        </View>

        {/* Controls */}
        <View style={styles.controlsContainer}>
          <CallControls
            isMuted={isMuted}
            isSpeakerOn={isSpeakerOn}
            isVideoEnabled={isVideoEnabled}
            showVideo={true}
            onToggleMute={toggleMute}
            onToggleSpeaker={toggleSpeaker}
            onToggleVideo={isVideoCall ? toggleVideo : handleUpgradeToVideo}
            onEndCall={() => setShowEndConfirm(true)}
          />
        </View>

        {/* End Call Confirmation */}
        <CustomAlert
          visible={showEndConfirm}
          title="Kết thúc cuộc gọi?"
          message="Bạn có chắc muốn kết thúc cuộc gọi này?"
          buttons={[
            {
              text: 'Hủy',
              style: 'cancel',
              onPress: () => setShowEndConfirm(false),
            },
            {
              text: 'Kết thúc',
              style: 'destructive',
              onPress: confirmEndCall,
            },
          ]}
          onClose={() => setShowEndConfirm(false)}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
  },
  userInfo: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userName: {
    fontSize: TYPOGRAPHY.fontSize.hero,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
    marginTop: SPACING.xl,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  reconnectingText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.warning,
    marginTop: SPACING.md,
  },
  controlsContainer: {
    paddingBottom: SCREEN_HEIGHT * 0.08,
    alignItems: 'center',
  },
});

export default InCallScreen;
