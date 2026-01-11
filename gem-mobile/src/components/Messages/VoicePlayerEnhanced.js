/**
 * VoicePlayerEnhanced Component
 * Voice message player with speed control, seek, and waveform
 */

import React, { useState, useEffect, useCallback, useRef, memo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Audio } from 'expo-av';
import { Play, Pause, AlertCircle } from 'lucide-react-native';
import Slider from '@react-native-community/slider';
import SpeedControlButton from './SpeedControlButton';
import { useVoiceSpeed, SPEED_OPTIONS } from '../../hooks/useVoiceSpeed';
import { COLORS, SPACING, TYPOGRAPHY } from '../../utils/tokens';

/**
 * Format duration in ms to MM:SS
 */
const formatDuration = (ms) => {
  if (!ms || ms <= 0) return '0:00';
  const totalSeconds = Math.floor(ms / 1000);
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

/**
 * VoicePlayerEnhanced - Voice message player with speed control
 *
 * @param {Object} props
 * @param {string} props.uri - URI of the voice file
 * @param {number} props.duration - Duration in milliseconds
 * @param {Array} props.waveform - Waveform data [0-1] (optional)
 * @param {boolean} props.isCurrentUser - Is this message from current user
 */
const VoicePlayerEnhanced = memo(({
  uri,
  duration = 0,
  waveform = [],
  isCurrentUser = false,
}) => {
  // ========== HOOKS ==========
  const { speed, setSpeed, SPEED_OPTIONS: speedOptions } = useVoiceSpeed();

  // ========== STATE ==========
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [position, setPosition] = useState(0);
  const [totalDuration, setTotalDuration] = useState(duration);

  // ========== REFS ==========
  const isMounted = useRef(true);

  // ========== EFFECTS ==========
  // Cleanup on unmount
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, []);

  // Update playback rate when speed changes
  useEffect(() => {
    if (sound && isPlaying) {
      sound.setRateAsync(speed, true); // true = maintain pitch
    }
  }, [speed, sound, isPlaying]);

  // ========== HANDLERS ==========
  const onPlaybackStatusUpdate = useCallback((status) => {
    if (!isMounted.current) return;

    if (status.isLoaded) {
      setPosition(status.positionMillis || 0);
      setIsPlaying(status.isPlaying);

      if (status.didJustFinish) {
        setPosition(0);
        setIsPlaying(false);
      }
    }
  }, []);

  const loadAndPlay = useCallback(async () => {
    if (!uri) return;

    try {
      setIsLoading(true);
      setError(null);

      // Unload previous sound
      if (sound) {
        await sound.unloadAsync();
      }

      // Configure audio mode
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
      });

      // Load new sound
      const { sound: newSound, status } = await Audio.Sound.createAsync(
        { uri },
        {
          shouldPlay: true,
          rate: speed,
          shouldCorrectPitch: true, // Maintain pitch at different speeds
        },
        onPlaybackStatusUpdate
      );

      if (!isMounted.current) {
        await newSound.unloadAsync();
        return;
      }

      setSound(newSound);
      setTotalDuration(status.durationMillis || duration);
      setIsPlaying(true);
      setIsLoading(false);
    } catch (err) {
      console.error('[VoicePlayer] Load error:', err);
      if (isMounted.current) {
        setError('Khong the phat audio');
        setIsLoading(false);
      }
    }
  }, [uri, speed, duration, sound, onPlaybackStatusUpdate]);

  const handlePlayPause = useCallback(async () => {
    if (isLoading) return;

    if (!sound) {
      await loadAndPlay();
      return;
    }

    try {
      if (isPlaying) {
        await sound.pauseAsync();
      } else {
        // If at the end, restart from beginning
        const status = await sound.getStatusAsync();
        if (status.positionMillis >= status.durationMillis - 100) {
          await sound.setPositionAsync(0);
        }
        await sound.setRateAsync(speed, true);
        await sound.playAsync();
      }
    } catch (err) {
      console.error('[VoicePlayer] Play/Pause error:', err);
    }
  }, [sound, isPlaying, isLoading, loadAndPlay, speed]);

  const handleSeek = useCallback(
    async (value) => {
      if (sound) {
        try {
          const seekPosition = value * totalDuration;
          await sound.setPositionAsync(seekPosition);
          setPosition(seekPosition);
        } catch (err) {
          console.error('[VoicePlayer] Seek error:', err);
        }
      }
    },
    [sound, totalDuration]
  );

  const handleSpeedChange = useCallback(
    (newSpeed) => {
      setSpeed(newSpeed);
    },
    [setSpeed]
  );

  // ========== RENDER ==========
  const progress = totalDuration > 0 ? position / totalDuration : 0;
  const currentTime = formatDuration(position);
  const totalTime = formatDuration(totalDuration);

  // Generate waveform bars (use provided waveform or generate placeholder)
  const waveformBars = waveform.length > 0 ? waveform : Array(15).fill(0).map(() => 0.2 + Math.random() * 0.8);

  return (
    <View
      style={[
        styles.container,
        isCurrentUser ? styles.containerSent : styles.containerReceived,
      ]}
    >
      {/* Play/Pause Button */}
      <TouchableOpacity
        style={styles.playButton}
        onPress={handlePlayPause}
        disabled={isLoading}
        activeOpacity={0.7}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color={COLORS.gold} />
        ) : error ? (
          <AlertCircle size={22} color={COLORS.burgundy} />
        ) : isPlaying ? (
          <Pause size={22} color={COLORS.gold} fill={COLORS.gold} />
        ) : (
          <Play size={22} color={COLORS.gold} fill={COLORS.gold} />
        )}
      </TouchableOpacity>

      {/* Progress Section */}
      <View style={styles.progressSection}>
        {/* Waveform */}
        <View style={styles.waveformContainer}>
          {waveformBars.slice(0, 20).map((height, i) => {
            const barProgress = (i + 1) / waveformBars.length;
            const isActive = barProgress <= progress;
            return (
              <View
                key={i}
                style={[
                  styles.waveformBar,
                  { height: 4 + height * 16 },
                  isActive && styles.waveformBarActive,
                  isPlaying && isActive && styles.waveformBarPlaying,
                ]}
              />
            );
          })}
        </View>

        {/* Slider */}
        <Slider
          style={styles.slider}
          value={progress}
          onSlidingComplete={handleSeek}
          minimumValue={0}
          maximumValue={1}
          minimumTrackTintColor={COLORS.gold}
          maximumTrackTintColor="rgba(255, 255, 255, 0.2)"
          thumbTintColor={COLORS.gold}
        />

        {/* Time */}
        <View style={styles.timeRow}>
          <Text style={styles.timeText}>{currentTime}</Text>
          <Text style={styles.timeText}>{totalTime}</Text>
        </View>
      </View>

      {/* Speed Control */}
      <SpeedControlButton
        currentSpeed={speed}
        options={speedOptions}
        onSpeedChange={handleSpeedChange}
      />
    </View>
  );
});

VoicePlayerEnhanced.displayName = 'VoicePlayerEnhanced';

export default VoicePlayerEnhanced;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: 16,
    minWidth: 250,
    maxWidth: 300,
  },
  containerSent: {
    backgroundColor: 'rgba(255, 189, 89, 0.15)',
  },
  containerReceived: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  playButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(106, 91, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  progressSection: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  waveformContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 24,
    gap: 2,
    marginBottom: 4,
  },
  waveformBar: {
    width: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
  },
  waveformBarActive: {
    backgroundColor: COLORS.gold,
  },
  waveformBarPlaying: {
    backgroundColor: COLORS.gold,
    opacity: 0.8,
  },
  slider: {
    width: '100%',
    height: 20,
    marginTop: -8,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: -4,
  },
  timeText: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
});
