/**
 * GEM Mobile - Voice Input Button Component
 * Day 11-12: Voice Input Implementation
 *
 * BEHAVIOR:
 * - Tap to start recording
 * - Tap again to stop and send
 * - Long press to cancel
 * - Shows recording state with animation
 * - Displays quota for FREE users
 *
 * Uses design tokens from DESIGN_TOKENS.md
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Vibration,
  Platform,
} from 'react-native';
import { Mic, MicOff, Square, X } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { COLORS, SPACING, GRADIENTS } from '../../utils/tokens';
import voiceService from '../../services/voiceService';
import speechRecognition from '../../services/speechRecognitionService';

/**
 * Voice Input Button - Microphone button for voice recording
 * @param {Object} props
 * @param {boolean} props.disabled - Disable the button
 * @param {Function} props.onRecordingStart - Called when recording starts
 * @param {Function} props.onRecordingStop - Called when recording stops with audio URI
 * @param {Function} props.onTranscription - Called with transcribed text
 * @param {Function} props.onError - Called on error
 * @param {Object} props.voiceQuota - { canUse, remaining, limit }
 * @param {string} props.size - 'small' | 'medium' | 'large'
 */
const VoiceInputButton = ({
  disabled = false,
  onRecordingStart,
  onRecordingStop,
  onTranscription,
  onError,
  voiceQuota = { canUse: true, remaining: -1 },
  size = 'medium',
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);

  // Animation values
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // Recording timer
  const timerRef = useRef(null);

  // Check permission on mount
  useEffect(() => {
    checkPermission();
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // Start/stop animations based on recording state
  useEffect(() => {
    if (isRecording) {
      startRecordingAnimation();
      startDurationTimer();
    } else {
      stopRecordingAnimation();
      stopDurationTimer();
    }
  }, [isRecording]);

  const checkPermission = async () => {
    const granted = await voiceService.hasPermission();
    setHasPermission(granted);
  };

  const startRecordingAnimation = () => {
    // Pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Glow animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const stopRecordingAnimation = () => {
    pulseAnim.stopAnimation();
    glowAnim.stopAnimation();
    pulseAnim.setValue(1);
    glowAnim.setValue(0);
  };

  const startDurationTimer = () => {
    setRecordingDuration(0);
    timerRef.current = setInterval(() => {
      setRecordingDuration(prev => prev + 1);
    }, 1000);
  };

  const stopDurationTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setRecordingDuration(0);
  };

  const handlePress = async () => {
    if (disabled) return;

    // Check quota for FREE users
    if (!voiceQuota.canUse) {
      if (onError) {
        onError({
          code: 'quota_exceeded',
          message: 'Đã hết lượt voice hôm nay. Nâng cấp để dùng không giới hạn!'
        });
      }
      return;
    }

    if (isRecording) {
      // Stop recording
      await stopRecording();
    } else {
      // Start recording
      await startRecording();
    }
  };

  const handleLongPress = async () => {
    if (isRecording) {
      // Cancel recording
      await cancelRecording();
    }
  };

  const startRecording = async () => {
    try {
      // Request permission if needed
      if (!hasPermission) {
        const granted = await voiceService.requestPermission();
        setHasPermission(granted);

        if (!granted) {
          if (onError) {
            onError({
              code: 'permission_denied',
              message: 'Vui lòng cấp quyền microphone để sử dụng voice input'
            });
          }
          return;
        }
      }

      // Haptic feedback
      if (Platform.OS !== 'web') {
        Vibration.vibrate(50);
      }

      // Press animation
      Animated.spring(scaleAnim, {
        toValue: 0.9,
        useNativeDriver: true,
      }).start(() => {
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
        }).start();
      });

      // Start recording
      const started = await voiceService.startRecording();

      if (started) {
        setIsRecording(true);
        if (onRecordingStart) {
          onRecordingStart();
        }
      } else {
        if (onError) {
          onError({
            code: 'recording_failed',
            message: 'Không thể bắt đầu ghi âm'
          });
        }
      }

    } catch (error) {
      console.error('[VoiceInputButton] Start recording error:', error);
      if (onError) {
        onError({
          code: 'recording_error',
          message: error.message
        });
      }
    }
  };

  const stopRecording = async () => {
    try {
      // Haptic feedback
      if (Platform.OS !== 'web') {
        Vibration.vibrate(50);
      }

      const audioUri = await voiceService.stopRecording();
      setIsRecording(false);

      if (audioUri) {
        if (onRecordingStop) {
          onRecordingStop(audioUri, recordingDuration);
        }

        // Try to transcribe
        // For web, use Web Speech API (already handled in real-time)
        // For native, call server-side transcription
        if (Platform.OS !== 'web') {
          const result = await speechRecognition.transcribeAudio(audioUri, 'vi-VN');

          if (result.success && result.text && onTranscription) {
            onTranscription(result.text);
          }
        }
      }

    } catch (error) {
      console.error('[VoiceInputButton] Stop recording error:', error);
      setIsRecording(false);
      if (onError) {
        onError({
          code: 'stop_recording_error',
          message: error.message
        });
      }
    }
  };

  const cancelRecording = async () => {
    try {
      // Haptic feedback
      if (Platform.OS !== 'web') {
        Vibration.vibrate([0, 50, 50, 50]);
      }

      await voiceService.cancelRecording();
      setIsRecording(false);

      console.log('[VoiceInputButton] Recording cancelled');

    } catch (error) {
      console.error('[VoiceInputButton] Cancel recording error:', error);
      setIsRecording(false);
    }
  };

  // Size configurations
  const sizeConfig = {
    small: { button: 36, icon: 18 },
    medium: { button: 44, icon: 22 },
    large: { button: 56, icon: 28 },
  };

  const currentSize = sizeConfig[size] || sizeConfig.medium;

  // Determine button state and colors
  const isDisabled = disabled || !voiceQuota.canUse;
  const buttonColor = isRecording
    ? COLORS.error
    : isDisabled
    ? COLORS.textMuted
    : COLORS.gold;

  const glowColor = isRecording
    ? 'rgba(255, 107, 107, 0.5)'
    : 'rgba(255, 189, 89, 0.3)';

  return (
    <View style={styles.container}>
      {/* Glow effect when recording */}
      {isRecording && (
        <Animated.View
          style={[
            styles.glow,
            {
              width: currentSize.button + 20,
              height: currentSize.button + 20,
              borderRadius: (currentSize.button + 20) / 2,
              backgroundColor: glowColor,
              opacity: glowAnim,
            },
          ]}
        />
      )}

      <Animated.View
        style={[
          styles.buttonWrapper,
          {
            transform: [
              { scale: isRecording ? pulseAnim : scaleAnim },
            ],
          },
        ]}
      >
        <TouchableOpacity
          onPress={handlePress}
          onLongPress={handleLongPress}
          delayLongPress={500}
          disabled={disabled}
          activeOpacity={0.8}
          style={[
            styles.button,
            {
              width: currentSize.button,
              height: currentSize.button,
              borderRadius: currentSize.button / 2,
              backgroundColor: isRecording
                ? 'rgba(255, 107, 107, 0.2)'
                : 'rgba(255, 189, 89, 0.15)',
              borderColor: buttonColor,
            },
          ]}
        >
          {isRecording ? (
            <Square
              size={currentSize.icon - 4}
              color={COLORS.error}
              fill={COLORS.error}
            />
          ) : isDisabled ? (
            <MicOff size={currentSize.icon} color={COLORS.textMuted} />
          ) : (
            <Mic size={currentSize.icon} color={COLORS.gold} />
          )}
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  glow: {
    position: 'absolute',
  },
  buttonWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
});

export default VoiceInputButton;
