/**
 * Gemral - Video Player Component
 * Inline and fullscreen video player for messages
 *
 * Features:
 * - Inline preview with play button
 * - Fullscreen playback
 * - Progress bar
 * - Play/Pause controls
 * - Mute toggle
 * - Duration display
 */

import React, { useRef, useState, memo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Dimensions,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';

// Tokens
import {
  COLORS,
  SPACING,
  TYPOGRAPHY,
} from '../../../utils/tokens';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const VideoPlayer = memo(({
  videoUrl,
  thumbnailUrl,
  duration: initialDuration,
  style,
}) => {
  // State
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(initialDuration || 0);

  // Refs
  const videoRef = useRef(null);
  const fullscreenVideoRef = useRef(null);

  // Format time
  const formatTime = (ms) => {
    const totalSeconds = Math.floor(ms / 1000);
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle playback status update
  const handlePlaybackStatusUpdate = useCallback((status) => {
    if (status.isLoaded) {
      setIsLoading(false);
      setIsPlaying(status.isPlaying);
      setPosition(status.positionMillis);
      setDuration(status.durationMillis || 0);

      if (status.didJustFinish) {
        setIsPlaying(false);
        // Reset to beginning
        videoRef.current?.setPositionAsync(0);
        fullscreenVideoRef.current?.setPositionAsync(0);
      }
    }
  }, []);

  // Toggle play/pause
  const togglePlayPause = useCallback(async () => {
    const video = isFullscreen ? fullscreenVideoRef.current : videoRef.current;
    if (!video) return;

    if (isPlaying) {
      await video.pauseAsync();
    } else {
      await video.playAsync();
    }
  }, [isPlaying, isFullscreen]);

  // Toggle mute
  const toggleMute = useCallback(async () => {
    const video = isFullscreen ? fullscreenVideoRef.current : videoRef.current;
    if (!video) return;

    await video.setIsMutedAsync(!isMuted);
    setIsMuted(!isMuted);
  }, [isMuted, isFullscreen]);

  // Seek
  const handleSeek = useCallback(async (value) => {
    const video = isFullscreen ? fullscreenVideoRef.current : videoRef.current;
    if (!video) return;

    await video.setPositionAsync(value);
  }, [isFullscreen]);

  // Open fullscreen
  const openFullscreen = useCallback(() => {
    setIsFullscreen(true);
  }, []);

  // Close fullscreen
  const closeFullscreen = useCallback(() => {
    setIsFullscreen(false);
  }, []);

  // Progress percentage
  const progress = duration > 0 ? position / duration : 0;

  return (
    <View style={[styles.container, style]}>
      {/* Inline Video Preview */}
      <TouchableOpacity
        style={styles.previewContainer}
        onPress={openFullscreen}
        activeOpacity={0.9}
      >
        <Video
          ref={videoRef}
          source={{ uri: videoUrl }}
          style={styles.video}
          resizeMode={ResizeMode.COVER}
          shouldPlay={false}
          isMuted={true}
          onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
          posterSource={thumbnailUrl ? { uri: thumbnailUrl } : undefined}
          usePoster={!!thumbnailUrl}
        />

        {/* Play overlay */}
        <View style={styles.playOverlay}>
          <View style={styles.playButton}>
            <Ionicons name="play" size={32} color={COLORS.textPrimary} />
          </View>
        </View>

        {/* Duration badge */}
        {duration > 0 && (
          <View style={styles.durationBadge}>
            <Text style={styles.durationText}>{formatTime(duration)}</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Fullscreen Modal */}
      <Modal
        visible={isFullscreen}
        animationType="fade"
        onRequestClose={closeFullscreen}
        statusBarTranslucent
      >
        <StatusBar hidden />

        <View style={styles.fullscreenContainer}>
          {/* Video */}
          <Video
            ref={fullscreenVideoRef}
            source={{ uri: videoUrl }}
            style={styles.fullscreenVideo}
            resizeMode={ResizeMode.CONTAIN}
            shouldPlay={true}
            isMuted={isMuted}
            onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
          />

          {/* Loading indicator */}
          {isLoading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={COLORS.gold} />
            </View>
          )}

          {/* Controls overlay */}
          <TouchableOpacity
            style={styles.controlsOverlay}
            activeOpacity={1}
            onPress={togglePlayPause}
          >
            {/* Header */}
            <View style={styles.fullscreenHeader}>
              <TouchableOpacity style={styles.closeButton} onPress={closeFullscreen}>
                <Ionicons name="close" size={28} color={COLORS.textPrimary} />
              </TouchableOpacity>
            </View>

            {/* Center play/pause button */}
            {!isPlaying && (
              <View style={styles.centerPlayButton}>
                <Ionicons name="play" size={60} color={COLORS.textPrimary} />
              </View>
            )}

            {/* Bottom controls */}
            <View style={styles.bottomControls}>
              {/* Play/Pause */}
              <TouchableOpacity style={styles.controlButton} onPress={togglePlayPause}>
                <Ionicons
                  name={isPlaying ? 'pause' : 'play'}
                  size={24}
                  color={COLORS.textPrimary}
                />
              </TouchableOpacity>

              {/* Progress bar */}
              <View style={styles.progressContainer}>
                <Text style={styles.timeText}>{formatTime(position)}</Text>
                <Slider
                  style={styles.slider}
                  minimumValue={0}
                  maximumValue={duration}
                  value={position}
                  onSlidingComplete={handleSeek}
                  minimumTrackTintColor={COLORS.gold}
                  maximumTrackTintColor="rgba(255, 255, 255, 0.3)"
                  thumbTintColor={COLORS.gold}
                />
                <Text style={styles.timeText}>{formatTime(duration)}</Text>
              </View>

              {/* Mute */}
              <TouchableOpacity style={styles.controlButton} onPress={toggleMute}>
                <Ionicons
                  name={isMuted ? 'volume-mute' : 'volume-high'}
                  size={24}
                  color={COLORS.textPrimary}
                />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
});

VideoPlayer.displayName = 'VideoPlayer';

export default VideoPlayer;

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    overflow: 'hidden',
  },

  // Preview
  previewContainer: {
    width: 200,
    height: 150,
    backgroundColor: COLORS.glassBg,
    borderRadius: 12,
    overflow: 'hidden',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  playOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: 4, // Visual centering for play icon
  },
  durationBadge: {
    position: 'absolute',
    bottom: SPACING.sm,
    right: SPACING.sm,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 4,
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
  },
  durationText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textPrimary,
  },

  // Fullscreen
  fullscreenContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  fullscreenVideo: {
    flex: 1,
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Controls
  controlsOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
  },
  fullscreenHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    paddingTop: 50,
    paddingHorizontal: SPACING.md,
  },
  closeButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerPlayButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    paddingLeft: 6,
  },
  bottomControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    paddingBottom: 40,
  },
  controlButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: SPACING.sm,
  },
  slider: {
    flex: 1,
    height: 40,
  },
  timeText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textPrimary,
    minWidth: 35,
    textAlign: 'center',
  },
});
