/**
 * CallControls Component
 * Control buttons for in-call actions (mute, speaker, video, end)
 */

import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Video,
  VideoOff,
  PhoneOff,
  Camera,
} from 'lucide-react-native';
import { COLORS, SPACING, TYPOGRAPHY } from '../../utils/tokens';
import { CALL_UI, CALL_TOOLTIPS } from '../../constants/callConstants';

/**
 * Control button with icon and label
 */
const ControlButton = ({
  icon: Icon,
  label,
  onPress,
  isActive = false,
  isEnd = false,
  disabled = false,
}) => {
  const buttonSize = isEnd ? CALL_UI.END_BUTTON_SIZE : CALL_UI.CONTROL_BUTTON_SIZE;

  return (
    <View style={styles.controlWrapper}>
      <TouchableOpacity
        style={[
          styles.controlButton,
          {
            width: buttonSize,
            height: buttonSize,
            borderRadius: buttonSize / 2,
          },
          isEnd && styles.endButton,
          isActive && !isEnd && styles.activeButton,
          disabled && styles.disabledButton,
        ]}
        onPress={onPress}
        disabled={disabled}
        activeOpacity={0.7}
      >
        <Icon
          size={isEnd ? 32 : 28}
          color={isEnd ? COLORS.textPrimary : COLORS.textPrimary}
        />
      </TouchableOpacity>
      {label && (
        <Text style={styles.controlLabel}>{label}</Text>
      )}
    </View>
  );
};

/**
 * CallControls - Main controls component
 * @param {Object} props
 * @param {boolean} props.isMuted - Current mute state
 * @param {boolean} props.isSpeakerOn - Current speaker state
 * @param {boolean} props.isVideoEnabled - Current video state
 * @param {boolean} props.showVideo - Whether to show video button
 * @param {boolean} props.showCameraSwitch - Whether to show camera switch button
 * @param {Function} props.onToggleMute - Mute toggle handler
 * @param {Function} props.onToggleSpeaker - Speaker toggle handler
 * @param {Function} props.onToggleVideo - Video toggle handler
 * @param {Function} props.onSwitchCamera - Camera switch handler
 * @param {Function} props.onEndCall - End call handler
 */
const CallControls = ({
  isMuted = false,
  isSpeakerOn = false,
  isVideoEnabled = false,
  showVideo = true,
  showCameraSwitch = false,
  onToggleMute,
  onToggleSpeaker,
  onToggleVideo,
  onSwitchCamera,
  onEndCall,
}) => {
  return (
    <View style={styles.container}>
      {/* Top row: Media controls */}
      <View style={styles.controlsRow}>
        {/* Mute button */}
        <ControlButton
          icon={isMuted ? MicOff : Mic}
          label={isMuted ? 'Bật mic' : 'Tắt mic'}
          onPress={onToggleMute}
          isActive={isMuted}
        />

        {/* Speaker button */}
        <ControlButton
          icon={isSpeakerOn ? Volume2 : VolumeX}
          label={isSpeakerOn ? 'Loa ngoài' : 'Loa trong'}
          onPress={onToggleSpeaker}
          isActive={isSpeakerOn}
        />

        {/* Video button */}
        {showVideo && (
          <ControlButton
            icon={isVideoEnabled ? Video : VideoOff}
            label={isVideoEnabled ? 'Tắt video' : 'Bật video'}
            onPress={onToggleVideo}
            isActive={isVideoEnabled}
          />
        )}

        {/* Camera switch button */}
        {showCameraSwitch && isVideoEnabled && (
          <ControlButton
            icon={Camera}
            label="Đổi camera"
            onPress={onSwitchCamera}
          />
        )}
      </View>

      {/* Bottom row: End call */}
      <View style={styles.endCallRow}>
        <ControlButton
          icon={PhoneOff}
          label="Kết thúc"
          onPress={onEndCall}
          isEnd
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    marginBottom: SPACING.xxxl,
  },
  endCallRow: {
    alignItems: 'center',
  },
  controlWrapper: {
    alignItems: 'center',
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
  },
  controlButton: {
    backgroundColor: COLORS.glassBg,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
  },
  activeButton: {
    backgroundColor: COLORS.gold + '40',
    borderColor: COLORS.gold,
  },
  endButton: {
    backgroundColor: COLORS.error,
    borderWidth: 0,
  },
  disabledButton: {
    opacity: 0.5,
  },
  controlLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
});

export default CallControls;
