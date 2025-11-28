/**
 * Gemral - Voice Recorder Component
 * TikTok-style voice message recording UI
 *
 * Features:
 * - Hold to record
 * - Animated recording indicator
 * - Slide to cancel
 * - Duration display
 * - Waveform visualization
 */

import React, { useState, useRef, useEffect, memo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  PanResponder,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';

// Tokens
import {
  COLORS,
  GRADIENTS,
  SPACING,
  TYPOGRAPHY,
} from '../../../utils/tokens';

const CANCEL_THRESHOLD = -100; // Slide left to cancel
const MAX_DURATION = 60; // Max recording duration in seconds

const VoiceRecorder = memo(({
  onRecordingComplete,
  onCancel,
  disabled,
}) => {
  // State
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [isCanceling, setIsCanceling] = useState(false);

  // Refs
  const recording = useRef(null);
  const durationInterval = useRef(null);
  const translateX = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const waveAnim = useRef(new Animated.Value(0)).current;

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopRecording(true);
    };
  }, []);

  // Pulse animation for recording indicator
  useEffect(() => {
    if (isRecording) {
      const pulse = Animated.loop(
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
      );
      pulse.start();

      // Waveform animation
      const wave = Animated.loop(
        Animated.sequence([
          Animated.timing(waveAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(waveAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ])
      );
      wave.start();

      return () => {
        pulse.stop();
        wave.stop();
      };
    }
  }, [isRecording, pulseAnim, waveAnim]);

  // Pan responder for slide to cancel
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        startRecording();
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dx < 0) {
          translateX.setValue(Math.max(gestureState.dx, CANCEL_THRESHOLD));
          setIsCanceling(gestureState.dx < CANCEL_THRESHOLD / 2);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx < CANCEL_THRESHOLD / 2) {
          // Canceled
          stopRecording(true);
        } else {
          // Send recording
          stopRecording(false);
        }
        Animated.spring(translateX, {
          toValue: 0,
          tension: 65,
          friction: 11,
          useNativeDriver: true,
        }).start();
        setIsCanceling(false);
      },
    })
  ).current;

  // Start recording
  const startRecording = async () => {
    if (disabled) return;

    try {
      // Request permissions
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please allow microphone access to record voice messages');
        return;
      }

      // Configure audio mode
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      // Start recording
      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      recording.current = newRecording;
      setIsRecording(true);
      setDuration(0);

      // Start duration counter
      durationInterval.current = setInterval(() => {
        setDuration(prev => {
          if (prev >= MAX_DURATION) {
            stopRecording(false);
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (error) {
      console.error('Error starting recording:', error);
      Alert.alert('Error', 'Failed to start recording');
    }
  };

  // Stop recording
  const stopRecording = useCallback(async (cancel = false) => {
    if (!recording.current) return;

    try {
      // Clear interval
      if (durationInterval.current) {
        clearInterval(durationInterval.current);
        durationInterval.current = null;
      }

      setIsRecording(false);

      // Stop and unload recording
      await recording.current.stopAndUnloadAsync();

      if (!cancel && duration > 0) {
        // Get recording URI
        const uri = recording.current.getURI();

        if (uri) {
          onRecordingComplete?.({
            uri,
            duration,
            type: 'audio/m4a',
            name: `voice-${Date.now()}.m4a`,
          });
        }
      } else {
        onCancel?.();
      }

      recording.current = null;
      setDuration(0);

      // Reset audio mode
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      });
    } catch (error) {
      console.error('Error stopping recording:', error);
    }
  }, [duration, onRecordingComplete, onCancel]);

  // Format duration
  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Render waveform bars
  const renderWaveform = () => {
    const bars = [];
    for (let i = 0; i < 20; i++) {
      const height = 10 + Math.random() * 20;
      bars.push(
        <Animated.View
          key={i}
          style={[
            styles.waveBar,
            {
              height,
              opacity: waveAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.4, 1],
              }),
            },
          ]}
        />
      );
    }
    return bars;
  };

  if (!isRecording) {
    // Mic button (not recording)
    return (
      <TouchableOpacity
        style={styles.micButton}
        onLongPress={startRecording}
        delayLongPress={150}
        disabled={disabled}
        activeOpacity={0.7}
      >
        <Ionicons
          name="mic"
          size={22}
          color={disabled ? COLORS.textMuted : COLORS.purple}
        />
      </TouchableOpacity>
    );
  }

  // Recording UI
  return (
    <Animated.View
      style={[
        styles.recordingContainer,
        { transform: [{ translateX }] },
      ]}
      {...panResponder.panHandlers}
    >
      {/* Cancel hint */}
      <View style={styles.cancelHint}>
        <Ionicons
          name={isCanceling ? 'trash' : 'chevron-back'}
          size={20}
          color={isCanceling ? COLORS.error : COLORS.textMuted}
        />
        <Text style={[styles.cancelText, isCanceling && styles.cancelTextActive]}>
          {isCanceling ? 'Release to cancel' : 'Slide to cancel'}
        </Text>
      </View>

      {/* Waveform */}
      <View style={styles.waveformContainer}>
        {renderWaveform()}
      </View>

      {/* Duration */}
      <Text style={styles.duration}>{formatDuration(duration)}</Text>

      {/* Recording indicator */}
      <Animated.View
        style={[
          styles.recordingIndicator,
          { transform: [{ scale: pulseAnim }] },
        ]}
      >
        <LinearGradient
          colors={GRADIENTS.primaryButton}
          style={styles.recordingDot}
        >
          <Ionicons name="mic" size={20} color={COLORS.textPrimary} />
        </LinearGradient>
      </Animated.View>
    </Animated.View>
  );
});

VoiceRecorder.displayName = 'VoiceRecorder';

export default VoiceRecorder;

const styles = StyleSheet.create({
  // Mic button (idle)
  micButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Recording container
  recordingContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(156, 6, 18, 0.1)',
    borderRadius: 20,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    marginHorizontal: SPACING.sm,
  },

  // Cancel hint
  cancelHint: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  cancelText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    marginLeft: SPACING.xxs,
  },
  cancelTextActive: {
    color: COLORS.error,
  },

  // Waveform
  waveformContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 30,
    gap: 2,
  },
  waveBar: {
    width: 3,
    backgroundColor: COLORS.burgundy,
    borderRadius: 2,
  },

  // Duration
  duration: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.burgundy,
    marginHorizontal: SPACING.md,
    minWidth: 40,
  },

  // Recording indicator
  recordingIndicator: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordingDot: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
