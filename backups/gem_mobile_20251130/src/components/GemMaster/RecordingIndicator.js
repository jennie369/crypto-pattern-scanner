/**
 * GEM Mobile - Recording Indicator Component
 * Day 11-12: Voice Input Implementation
 *
 * FEATURES:
 * - Shows recording duration
 * - Audio waveform visualization
 * - Recording status text
 * - Cancel button
 *
 * Uses design tokens from DESIGN_TOKENS.md
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
} from 'react-native';
import { X, Mic } from 'lucide-react-native';

import { COLORS, SPACING, TYPOGRAPHY, GLASS } from '../../utils/tokens';

/**
 * Recording Indicator - Shows recording state and duration
 * @param {Object} props
 * @param {boolean} props.isRecording - Recording state
 * @param {number} props.duration - Recording duration in seconds
 * @param {Function} props.onCancel - Called when cancel is pressed
 * @param {string} props.interimText - Real-time transcription text (if available)
 */
const RecordingIndicator = ({
  isRecording = false,
  duration = 0,
  onCancel,
  interimText = '',
}) => {
  // Animation for waveform bars
  const waveAnims = useRef(
    Array(5).fill(null).map(() => new Animated.Value(0.3))
  ).current;

  // Fade in animation
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    if (isRecording) {
      // Fade in
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      // Start waveform animation
      startWaveAnimation();
    } else {
      // Fade out
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 20,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();

      // Stop waveform animation
      stopWaveAnimation();
    }
  }, [isRecording]);

  const startWaveAnimation = () => {
    waveAnims.forEach((anim, index) => {
      const randomDelay = index * 100;
      const randomDuration = 300 + Math.random() * 200;

      Animated.loop(
        Animated.sequence([
          Animated.delay(randomDelay),
          Animated.timing(anim, {
            toValue: 0.8 + Math.random() * 0.2,
            duration: randomDuration,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0.3 + Math.random() * 0.2,
            duration: randomDuration,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();
    });
  };

  const stopWaveAnimation = () => {
    waveAnims.forEach(anim => {
      anim.stopAnimation();
      anim.setValue(0.3);
    });
  };

  /**
   * Format duration as MM:SS
   */
  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isRecording) {
    return null;
  }

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <View style={styles.content}>
        {/* Recording icon */}
        <View style={styles.recordingIcon}>
          <Mic size={16} color={COLORS.error} />
        </View>

        {/* Waveform visualization */}
        <View style={styles.waveform}>
          {waveAnims.map((anim, index) => (
            <Animated.View
              key={index}
              style={[
                styles.waveBar,
                {
                  transform: [{ scaleY: anim }],
                },
              ]}
            />
          ))}
        </View>

        {/* Duration */}
        <View style={styles.durationContainer}>
          <View style={styles.recordingDot} />
          <Text style={styles.durationText}>{formatDuration(duration)}</Text>
        </View>

        {/* Cancel button */}
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={onCancel}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <X size={16} color={COLORS.textMuted} />
        </TouchableOpacity>
      </View>

      {/* Interim transcription (if available) */}
      {interimText ? (
        <View style={styles.interimContainer}>
          <Text style={styles.interimText} numberOfLines={2}>
            {interimText}
          </Text>
        </View>
      ) : (
        <Text style={styles.hintText}>
          Đang nghe... Nhấn lại để dừng
        </Text>
      )}
    </Animated.View>
  );
};

/**
 * Recording Overlay - Full screen overlay when recording
 * For a more immersive recording experience
 */
export const RecordingOverlay = ({
  isRecording = false,
  duration = 0,
  onStop,
  onCancel,
  interimText = '',
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    if (isRecording) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [isRecording]);

  if (!isRecording) return null;

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Animated.View
      style={[
        styles.overlay,
        {
          opacity: fadeAnim,
        },
      ]}
    >
      <Animated.View
        style={[
          styles.overlayContent,
          {
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {/* Recording animation */}
        <View style={styles.overlayIconContainer}>
          <View style={styles.overlayPulse} />
          <View style={styles.overlayIcon}>
            <Mic size={32} color={COLORS.error} />
          </View>
        </View>

        {/* Duration */}
        <Text style={styles.overlayDuration}>{formatDuration(duration)}</Text>

        {/* Status */}
        <Text style={styles.overlayStatus}>Đang ghi âm...</Text>

        {/* Interim text */}
        {interimText && (
          <Text style={styles.overlayInterimText} numberOfLines={3}>
            "{interimText}"
          </Text>
        )}

        {/* Actions */}
        <View style={styles.overlayActions}>
          <TouchableOpacity
            style={styles.overlayStopButton}
            onPress={onStop}
          >
            <View style={styles.overlayStopIcon} />
            <Text style={styles.overlayStopText}>Gửi</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.overlayCancelButton}
            onPress={onCancel}
          >
            <X size={20} color={COLORS.textMuted} />
            <Text style={styles.overlayCancelText}>Hủy</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  // Inline indicator
  container: {
    backgroundColor: GLASS.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 107, 0.3)',
    padding: SPACING.sm,
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  recordingIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 107, 107, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  waveform: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    height: 24,
  },
  waveBar: {
    width: 3,
    height: 20,
    backgroundColor: COLORS.error,
    borderRadius: 1.5,
  },
  durationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    borderRadius: 8,
  },
  recordingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.error,
  },
  durationText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.error,
    fontVariant: ['tabular-nums'],
  },
  cancelButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  interimContainer: {
    marginTop: SPACING.xs,
    paddingTop: SPACING.xs,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  interimText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  },
  hintText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: SPACING.xs,
  },

  // Overlay styles
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10, 11, 35, 0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  overlayContent: {
    alignItems: 'center',
    padding: SPACING.xl,
  },
  overlayIconContainer: {
    width: 100,
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  overlayPulse: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 107, 107, 0.2)',
  },
  overlayIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 107, 107, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.error,
  },
  overlayDuration: {
    fontSize: 48,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
    fontVariant: ['tabular-nums'],
    marginBottom: SPACING.sm,
  },
  overlayStatus: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textMuted,
    marginBottom: SPACING.lg,
  },
  overlayInterimText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
    maxWidth: 280,
    marginBottom: SPACING.xl,
  },
  overlayActions: {
    flexDirection: 'row',
    gap: SPACING.xl,
  },
  overlayStopButton: {
    alignItems: 'center',
    gap: SPACING.xs,
  },
  overlayStopIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.error,
  },
  overlayStopText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textPrimary,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
  overlayCancelButton: {
    alignItems: 'center',
    gap: SPACING.xs,
  },
  overlayCancelText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
  },
});

export default RecordingIndicator;
