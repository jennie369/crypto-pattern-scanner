/**
 * VideoBackground - Video background component for ritual screens
 * Uses expo-av Video with fallback to LinearGradient
 *
 * Features:
 * - Loop video backgrounds
 * - Fallback gradients when video not available
 * - Dark overlay for text readability
 * - Vignette effects
 * - Pause when screen not visible
 * - Renders children on top of video
 * - Video preloading for smoother transitions
 * - Timeout fallback for iOS video loading issues
 */

import React, { memo, useState, useRef, useEffect } from 'react';
import { StyleSheet, View, Platform } from 'react-native';
import { Video, ResizeMode, Audio } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import useDevicePerformance from '../../../hooks/useDevicePerformance';

// Video load timeout
const VIDEO_LOAD_TIMEOUT = 12000; // 12 seconds to allow for loading

// Video preload cache
const preloadedVideos = new Map();

// ========== VIDEO SOURCES ==========
const VIDEO_SOURCES = {
  'heart-expansion': require('../../../../assets/videos/rituals/heart-expansion.mp4'),
  'gratitude-flow': require('../../../../assets/videos/rituals/gratitude-flow.mp4'),
  'cleansing-breath': require('../../../../assets/videos/rituals/cleansing-breath.mp4'),
  'water-manifest': require('../../../../assets/videos/rituals/water-manifest.mp4'),
  'letter-to-universe': require('../../../../assets/videos/rituals/letter-universe.mp4'),
  'letter-universe': require('../../../../assets/videos/rituals/letter-universe.mp4'),
  'burn-release': require('../../../../assets/videos/rituals/burning-release.mp4'),
  'burning-release': require('../../../../assets/videos/rituals/burning-release.mp4'),
  'star-wish': require('../../../../assets/videos/rituals/shooting-star.mp4'),
  'shooting-star': require('../../../../assets/videos/rituals/shooting-star.mp4'),
  'crystal-healing': require('../../../../assets/videos/rituals/crystal-healing.mp4'),
};

// ========== FALLBACK GRADIENTS ==========
const FALLBACK_GRADIENTS = {
  'heart-expansion': ['#1A0510', '#2D0A1A', '#4A1030'],
  'gratitude-flow': ['#1A1500', '#2D2500', '#4A3D00'],
  'cleansing-breath': ['#0A1628', '#152238', '#1E3A5F'],
  'water-manifest': ['#0A1A1A', '#102828', '#1A3D3D'],
  'letter-to-universe': ['#0D0221', '#1A0533', '#2D1B4E'],
  'letter-universe': ['#0D0221', '#1A0533', '#2D1B4E'],
  'burning-release': ['#1A0A0A', '#2D1010', '#3D1515'],
  'burn-release': ['#1A0A0A', '#2D1010', '#3D1515'],
  'crystal-healing': ['#150A1A', '#251530', '#352045'],
  'shooting-star': ['#0A0A1A', '#101028', '#151535'],
  'star-wish': ['#0A0A1A', '#101028', '#151535'],
};

/**
 * VideoBackground Component
 * Hiển thị video loop làm background cho ritual screens
 *
 * @param {string} ritualId - ID của ritual
 * @param {boolean} paused - Pause video khi không visible
 * @param {number} opacity - Opacity của video (0-1), default 0.85
 * @param {number} overlayOpacity - Opacity của dark overlay (0-1), default 0.25
 * @param {ReactNode} children - Content to render on top of video
 */
const VideoBackground = memo(({
  ritualId,
  paused = false,
  opacity = 0.85,
  overlayOpacity = 0.25,
  children,
  forceGradient = false, // Force gradient even on high-end devices
}) => {
  const videoRef = useRef(null);
  const [videoError, setVideoError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadTimedOut, setLoadTimedOut] = useState(false);
  const loadTimeoutRef = useRef(null);

  // Check device performance to decide whether to use video
  const { features, isLowEnd, tier } = useDevicePerformance();

  // On iOS, always try videos (iPhones are powerful enough)
  // On Android, respect the device tier detection
  const shouldUseVideo = Platform.OS === 'ios'
    ? !forceGradient
    : !forceGradient && features.enableVideoBackground;

  const videoSource = VIDEO_SOURCES[ritualId];
  const fallbackGradient = FALLBACK_GRADIENTS[ritualId] || FALLBACK_GRADIENTS['letter-universe'];

  // Log debug info on mount
  useEffect(() => {
    console.log('[VideoBackground] Mount:', {
      ritualId,
      platform: Platform.OS,
      tier,
      isLowEnd,
      enableVideoBackground: features.enableVideoBackground,
      shouldUseVideo,
      forceGradient,
      hasVideoSource: !!videoSource,
    });
  }, [ritualId, tier, isLowEnd, features.enableVideoBackground, shouldUseVideo, forceGradient, videoSource]);

  // Timeout fallback - if video doesn't load in time, show gradient
  useEffect(() => {
    if (shouldUseVideo && videoSource && !isLoaded && !videoError) {
      console.log('[VideoBackground] Starting load timeout for:', ritualId);
      loadTimeoutRef.current = setTimeout(() => {
        if (!isLoaded) {
          console.warn('[VideoBackground] Load timeout - falling back to gradient:', ritualId);
          setLoadTimedOut(true);
        }
      }, VIDEO_LOAD_TIMEOUT);
    }

    return () => {
      if (loadTimeoutRef.current) {
        clearTimeout(loadTimeoutRef.current);
      }
    };
  }, [shouldUseVideo, videoSource, isLoaded, videoError, ritualId]);

  // Handle video pause/play based on paused prop
  useEffect(() => {
    if (videoRef.current && isLoaded) {
      if (paused) {
        videoRef.current.pauseAsync();
      } else {
        videoRef.current.playAsync();
      }
    }
  }, [paused, isLoaded]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (videoRef.current) {
        videoRef.current.unloadAsync();
      }
    };
  }, []);

  // Fallback to gradient if no video source, error, timeout, or video disabled
  if (!videoSource || videoError || loadTimedOut || !shouldUseVideo) {
    // Log why we're showing gradient (only in dev)
    if (__DEV__) {
      console.log('[VideoBackground] Showing gradient because:', {
        ritualId,
        platform: Platform.OS,
        noSource: !videoSource,
        hasError: videoError,
        timedOut: loadTimedOut,
        videoDisabled: !shouldUseVideo,
      });
    }
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={fallbackGradient}
          style={StyleSheet.absoluteFill}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />

        {/* Bottom Vignette Effect */}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.2)', 'rgba(0,0,0,0.5)']}
          locations={[0, 0.6, 1]}
          style={StyleSheet.absoluteFill}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
        />

        {/* Top Vignette for header readability */}
        <LinearGradient
          colors={['rgba(0,0,0,0.4)', 'transparent']}
          locations={[0, 0.3]}
          style={styles.topVignette}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
        />

        {/* Children content */}
        {children}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Fallback gradient while video loads */}
      {!isLoaded && (
        <LinearGradient
          colors={fallbackGradient}
          style={StyleSheet.absoluteFill}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
      )}

      {/* Video Layer */}
      <Video
        ref={videoRef}
        source={videoSource}
        style={[styles.video, { opacity: isLoaded ? opacity : 0 }]}
        resizeMode={ResizeMode.COVER}
        isLooping={true}
        isMuted={true}
        shouldPlay={!paused}
        useNativeControls={false}
        onReadyForDisplay={() => {
          console.log('[VideoBackground] Ready for display:', ritualId);
          // Clear timeout since video is ready
          if (loadTimeoutRef.current) {
            clearTimeout(loadTimeoutRef.current);
          }
          if (!isLoaded) {
            setIsLoaded(true);
          }
        }}
        onPlaybackStatusUpdate={(status) => {
          if (status.isLoaded && !isLoaded) {
            console.log('[VideoBackground] Video loaded:', {
              ritualId,
              durationMs: status.durationMillis,
              isPlaying: status.isPlaying,
            });
            // Clear timeout
            if (loadTimeoutRef.current) {
              clearTimeout(loadTimeoutRef.current);
            }
            setIsLoaded(true);
          }
          if (status.error) {
            console.error('[VideoBackground] Playback status error:', ritualId, status.error);
            setVideoError(true);
          }
        }}
        onError={(error) => {
          console.error('[VideoBackground] ERROR loading video:', {
            ritualId,
            platform: Platform.OS,
            error: error?.message || error,
            nativeEvent: error?.nativeEvent,
          });
          setVideoError(true);
        }}
        onLoad={(status) => {
          console.log('[VideoBackground] onLoad callback:', {
            ritualId,
            duration: status?.durationMillis,
          });
        }}
      />

      {/* Dark Overlay for better text readability */}
      <View style={[styles.overlay, { opacity: overlayOpacity }]} />

      {/* Bottom Vignette Effect */}
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.2)', 'rgba(0,0,0,0.5)']}
        locations={[0, 0.6, 1]}
        style={styles.vignette}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />

      {/* Top Vignette for header readability */}
      <LinearGradient
        colors={['rgba(0,0,0,0.4)', 'transparent']}
        locations={[0, 0.3]}
        style={styles.topVignette}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />

      {/* Children content */}
      {children}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  video: {
    ...StyleSheet.absoluteFillObject,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000000',
  },
  vignette: {
    ...StyleSheet.absoluteFillObject,
  },
  topVignette: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 150,
  },
});

VideoBackground.displayName = 'VideoBackground';

/**
 * Preload a video for smoother transition
 * Call this before navigating to a ritual screen
 * @param {string} ritualId - The ritual ID to preload
 */
export const preloadVideo = async (ritualId) => {
  const source = VIDEO_SOURCES[ritualId];
  if (!source || preloadedVideos.has(ritualId)) return;

  try {
    // Create a silent Audio.Sound to preload the video
    const { sound } = await Audio.Sound.createAsync(
      source,
      { shouldPlay: false, isMuted: true },
      null,
      false
    );
    preloadedVideos.set(ritualId, sound);
    // Auto-cleanup after 30 seconds if not used
    setTimeout(() => {
      if (preloadedVideos.has(ritualId)) {
        const cached = preloadedVideos.get(ritualId);
        cached?.unloadAsync?.();
        preloadedVideos.delete(ritualId);
      }
    }, 30000);
  } catch (error) {
    console.warn('[VideoBackground] Preload failed:', ritualId, error);
  }
};

/**
 * Clear all preloaded videos
 */
export const clearPreloadedVideos = () => {
  preloadedVideos.forEach((sound) => {
    sound?.unloadAsync?.();
  });
  preloadedVideos.clear();
};

export default VideoBackground;
