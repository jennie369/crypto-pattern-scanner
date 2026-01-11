/**
 * VideoControls Component
 * Controls for video call (mute, video, camera switch, end)
 */

import React, { memo, useState, useCallback, useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  RotateCcw,
  Minimize2,
  Volume2,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { COLORS, SPACING } from '../../utils/tokens';
import { CALL_UI } from '../../constants/callConstants';

/**
 * VideoControls Component
 * Controls cho video call
 * @param {Object} props
 * @param {boolean} props.isMuted - Mute state
 * @param {boolean} props.isVideoEnabled - Video state
 * @param {boolean} props.isSpeakerOn - Speaker state
 * @param {Function} props.onToggleMute - Mute toggle handler
 * @param {Function} props.onToggleVideo - Video toggle handler
 * @param {Function} props.onToggleSpeaker - Speaker toggle handler
 * @param {Function} props.onSwitchCamera - Camera switch handler
 * @param {Function} props.onEndCall - End call handler
 * @param {Function} props.onMinimize - Minimize handler
 * @param {boolean} props.visible - Whether controls are visible
 */
const VideoControls = memo(({
  isMuted = false,
  isVideoEnabled = true,
  isSpeakerOn = false,
  onToggleMute,
  onToggleVideo,
  onToggleSpeaker,
  onSwitchCamera,
  onEndCall,
  onMinimize,
  visible = true,
}) => {
  const [opacity] = useState(new Animated.Value(visible ? 1 : 0));

  // Animate visibility
  useEffect(() => {
    Animated.timing(opacity, {
      toValue: visible ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [visible, opacity]);

  const handlePress = useCallback((action, hapticType = 'light') => {
    try {
      Haptics.impactAsync(
        hapticType === 'heavy'
          ? Haptics.ImpactFeedbackStyle.Heavy
          : Haptics.ImpactFeedbackStyle.Light
      );
    } catch (e) {
      // Ignore haptic errors
    }
    action?.();
  }, []);

  return (
    <Animated.View
      style={[
        styles.container,
        { opacity },
      ]}
      pointerEvents={visible ? 'auto' : 'none'}
    >
      {/* Top Row - Minimize */}
      <View style={styles.topRow}>
        {onMinimize && (
          <TouchableOpacity
            style={styles.topButton}
            onPress={() => handlePress(onMinimize)}
            activeOpacity={0.7}
            accessibilityLabel="Thu nhỏ"
          >
            <Minimize2 size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Bottom Row - Main Controls */}
      <View style={styles.bottomRow}>
        {/* Switch Camera */}
        {isVideoEnabled && onSwitchCamera && (
          <TouchableOpacity
            style={styles.controlButton}
            onPress={() => handlePress(onSwitchCamera)}
            activeOpacity={0.7}
            accessibilityLabel="Chuyển camera"
          >
            <RotateCcw size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
        )}

        {/* Toggle Video */}
        <TouchableOpacity
          style={[
            styles.controlButton,
            !isVideoEnabled && styles.controlButtonActive,
          ]}
          onPress={() => handlePress(onToggleVideo)}
          activeOpacity={0.7}
          accessibilityLabel={isVideoEnabled ? 'Tắt camera' : 'Bật camera'}
        >
          {isVideoEnabled ? (
            <Video size={24} color={COLORS.textPrimary} />
          ) : (
            <VideoOff size={24} color={COLORS.textPrimary} />
          )}
        </TouchableOpacity>

        {/* Toggle Mute */}
        <TouchableOpacity
          style={[
            styles.controlButton,
            isMuted && styles.controlButtonActive,
          ]}
          onPress={() => handlePress(onToggleMute)}
          activeOpacity={0.7}
          accessibilityLabel={isMuted ? 'Bật mic' : 'Tắt mic'}
        >
          {isMuted ? (
            <MicOff size={24} color={COLORS.textPrimary} />
          ) : (
            <Mic size={24} color={COLORS.textPrimary} />
          )}
        </TouchableOpacity>

        {/* Toggle Speaker */}
        {onToggleSpeaker && (
          <TouchableOpacity
            style={[
              styles.controlButton,
              isSpeakerOn && styles.controlButtonActive,
            ]}
            onPress={() => handlePress(onToggleSpeaker)}
            activeOpacity={0.7}
            accessibilityLabel={isSpeakerOn ? 'Tắt loa ngoài' : 'Bật loa ngoài'}
          >
            <Volume2 size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
        )}

        {/* End Call */}
        <TouchableOpacity
          style={styles.endButton}
          onPress={() => handlePress(onEndCall, 'heavy')}
          activeOpacity={0.8}
          accessibilityLabel="Kết thúc cuộc gọi"
        >
          <PhoneOff size={28} color={COLORS.textPrimary} />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'space-between',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingTop: 60,
    paddingHorizontal: SPACING.lg,
  },
  topButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 50,
    paddingHorizontal: SPACING.lg,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    paddingTop: SPACING.lg,
    gap: SPACING.md,
  },
  controlButton: {
    width: CALL_UI.CONTROL_BUTTON_SIZE,
    height: CALL_UI.CONTROL_BUTTON_SIZE,
    borderRadius: CALL_UI.CONTROL_BUTTON_SIZE / 2,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlButtonActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  endButton: {
    width: CALL_UI.END_BUTTON_SIZE,
    height: CALL_UI.END_BUTTON_SIZE,
    borderRadius: CALL_UI.END_BUTTON_SIZE / 2,
    backgroundColor: COLORS.error,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: SPACING.md,
  },
});

VideoControls.displayName = 'VideoControls';

export default VideoControls;
