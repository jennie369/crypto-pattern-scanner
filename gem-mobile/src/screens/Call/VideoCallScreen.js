/**
 * VideoCallScreen
 * Full-screen video call with local preview, remote view, and controls
 */

import React, { useEffect, useCallback, useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  StatusBar,
  BackHandler,
  TouchableWithoutFeedback,
  Dimensions,
} from 'react-native';
import { COLORS } from '../../utils/tokens';
import { useVideoCall } from '../../hooks/useVideoCall';
import { useCallTimer } from '../../hooks/useCallTimer';
import { usePictureInPicture } from '../../hooks/usePictureInPicture';
import { useCallContext } from '../../contexts/CallContext';
import {
  CallStatusBadge,
  CallQualityIndicator,
  CallTimer,
  LocalVideoView,
  RemoteVideoView,
  VideoControls,
  MinimizedCallView,
} from '../../components/Call';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CONTROLS_HIDE_DELAY = 4000; // Auto-hide controls after 4 seconds

/**
 * VideoCallScreen - Full video call experience
 * @param {Object} props.route.params
 * @param {Object} props.route.params.call - Call object
 * @param {Object} props.route.params.callee - Other participant info
 * @param {Object} props.route.params.caller - Caller info
 * @param {boolean} props.route.params.isCaller - Whether current user is caller
 */
const VideoCallScreen = ({ route, navigation }) => {
  const { call, callee, caller, isCaller, answeredFromCallKeep } = route.params || {};
  const otherUser = isCaller ? callee : caller;

  // If answered from CallKeep (native iOS CallKit), auto-initialize
  // since user already pressed Accept in native UI
  const shouldAutoInit = isCaller || answeredFromCallKeep;

  // ========== CONTEXT ==========
  const { setActiveCall, clearActiveCall } = useCallContext();

  // ========== STATE ==========
  const [showControls, setShowControls] = useState(true);
  const controlsTimeoutRef = useRef(null);

  // ========== HOOKS ==========
  const {
    callState,
    isMuted,
    isSpeakerOn,
    connectionQuality,
    toggleMute,
    toggleSpeaker,
    endCall,
    isConnected,
    isReconnecting,
    // Video specific
    localVideoStream,
    remoteVideoStream,
    isLocalVideoEnabled,
    isRemoteVideoEnabled,
    isFrontCamera,
    isMinimized,
    toggleLocalVideo,
    switchCamera,
    minimize,
    maximize,
  } = useVideoCall({
    call,
    isCaller,
    autoInitialize: shouldAutoInit, // Auto-init for caller or when answered from CallKeep
    onCallEnded: (reason) => {
      clearActiveCall();
      navigation.replace('CallEnded', {
        call,
        otherUser,
        duration: formattedDuration,
        reason,
      });
    },
  });

  // Call duration timer
  const { formattedDuration } = useCallTimer(isConnected);

  // Picture-in-Picture
  const { isPiPSupported, isPiPActive, enterPiP, exitPiP } = usePictureInPicture(isConnected);

  // ========== EFFECTS ==========

  // Clear active call banner when this screen is focused (user returned)
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      clearActiveCall();
    });
    return unsubscribe;
  }, [navigation, clearActiveCall]);

  // Hide status bar for immersive experience
  useEffect(() => {
    StatusBar.setHidden(true);
    return () => StatusBar.setHidden(false);
  }, []);

  // Handle back button - end call directly without confirmation
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (isMinimized) {
        maximize();
        return true;
      }
      handleEndCall();
      return true;
    });

    return () => backHandler.remove();
  }, [isMinimized, maximize, handleEndCall]);

  // Auto-hide controls
  useEffect(() => {
    if (showControls) {
      resetControlsTimeout();
    }

    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [showControls]);

  // ========== FUNCTIONS ==========

  const resetControlsTimeout = useCallback(() => {
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false);
    }, CONTROLS_HIDE_DELAY);
  }, []);

  const handleScreenTap = useCallback(() => {
    setShowControls(prev => !prev);
    if (!showControls) {
      resetControlsTimeout();
    }
  }, [showControls, resetControlsTimeout]);

  const handleEndCall = useCallback(async () => {
    await endCall();
  }, [endCall]);

  const handleMinimize = useCallback(() => {
    minimize();
    // Store call info in context so global banner can show
    setActiveCall({
      call,
      otherUser,
      isCaller,
      screenName: 'VideoCall',
    });
    // Navigate back to previous screen but keep call running
    navigation.goBack();
  }, [minimize, navigation, setActiveCall, call, otherUser, isCaller]);

  // ========== RENDER ==========

  // Minimized bubble view (when navigated away)
  if (isMinimized && !navigation.isFocused?.()) {
    return (
      <MinimizedCallView
        stream={remoteVideoStream}
        callDuration={formattedDuration}
        userName={otherUser?.display_name}
        userAvatar={otherUser?.avatar_url}
        onMaximize={maximize}
        onEndCall={handleEndCall}
      />
    );
  }

  return (
    <TouchableWithoutFeedback onPress={handleScreenTap}>
      <View style={styles.container}>
        {/* Remote Video (Full Screen) */}
        <RemoteVideoView
          stream={remoteVideoStream}
          isVideoEnabled={isRemoteVideoEnabled}
          userName={otherUser?.display_name}
          userAvatar={otherUser?.avatar_url}
        />

        {/* Local Video Preview (Draggable) */}
        {isLocalVideoEnabled && (
          <LocalVideoView
            stream={localVideoStream}
            isMirrored={isFrontCamera}
            onSwitchCamera={switchCamera}
          />
        )}

        {/* Status Indicators (Top) */}
        {showControls && (
          <View style={styles.statusBar}>
            <CallStatusBadge status={callState} />
            <CallQualityIndicator quality={connectionQuality} />
          </View>
        )}

        {/* Video Controls (Overlay) */}
        <VideoControls
          isMuted={isMuted}
          isVideoEnabled={isLocalVideoEnabled}
          isSpeakerOn={isSpeakerOn}
          onToggleMute={toggleMute}
          onToggleVideo={toggleLocalVideo}
          onToggleSpeaker={toggleSpeaker}
          onSwitchCamera={isLocalVideoEnabled ? switchCamera : undefined}
          onEndCall={handleEndCall}
          onMinimize={handleMinimize}
          visible={showControls}
        />

        {/* Call Duration (Center Bottom) */}
        {showControls && isConnected && (
          <View style={styles.durationContainer}>
            <View style={styles.durationBadge}>
              <CallTimer duration={formattedDuration} size="medium" />
            </View>
          </View>
        )}
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgDarkest,
  },
  statusBar: {
    position: 'absolute',
    top: 60,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  durationContainer: {
    position: 'absolute',
    bottom: 140,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  durationBadge: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
});

export default VideoCallScreen;
