/**
 * LivestreamPlayer Component
 * Video player for AI avatar livestream
 *
 * Features:
 * - Plays avatar video (MuseTalk output)
 * - Falls back to audio-only with avatar image
 * - Loading/buffering states
 * - Error handling
 */

import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  View,
  StyleSheet,
  Image,
  ActivityIndicator,
  Text,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSettings } from '../../contexts/SettingsContext';

// Avatar placeholder images
// TODO: Add actual avatar images to src/assets/avatars/
// For now, use null and display initials as fallback
const AVATAR_IMAGES = {
  sufu: null,
  cogiao: null,
  banthan: null,
  default: null,
};

// Avatar display names for fallback
const AVATAR_NAMES = {
  sufu: 'Sư Phụ',
  cogiao: 'Cô Giáo',
  banthan: 'Bạn Thân',
  default: 'Avatar',
};

const LivestreamPlayer = ({
  videoUrl,
  audioUrl,
  avatarId = 'sufu',
  isLive = false,
  onVideoEnd,
  onError,
  style,
}) => {
  const { colors, gradients, glass, settings, SPACING, TYPOGRAPHY, t } = useSettings();
  const videoRef = useRef(null);
  const [status, setStatus] = useState({
    isLoaded: false,
    isPlaying: false,
    isBuffering: false,
  });
  const [error, setError] = useState(null);
  const [isMuted, setIsMuted] = useState(false);

  // Get avatar image with fallback
  const avatarImage = AVATAR_IMAGES[avatarId] || AVATAR_IMAGES.default;
  const avatarName = AVATAR_NAMES[avatarId] || AVATAR_NAMES.default;

  const styles = useMemo(() => StyleSheet.create({
    container: {
      width: '100%',
      aspectRatio: 9 / 16,
      backgroundColor: settings.theme === 'light' ? colors.bgDarkest : (glass.background || 'rgba(15, 16, 48, 0.95)'),
      borderRadius: SPACING.lg,
      overflow: 'hidden',
    },
    video: {
      width: '100%',
      height: '100%',
    },
    avatarContainer: {
      width: '100%',
      height: '100%',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.surfaceDark,
    },
    avatarImage: {
      width: '100%',
      height: '100%',
      resizeMode: 'cover',
    },
    avatarPlaceholder: {
      width: '100%',
      height: '100%',
    },
    avatarGradient: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    avatarInitials: {
      fontSize: 80,
      fontWeight: '700',
      color: colors.white,
      opacity: 0.9,
    },
    avatarLabel: {
      marginTop: SPACING.md,
      fontSize: TYPOGRAPHY.fontSize.xl,
      color: colors.white,
      opacity: 0.7,
    },
    loadingOverlay: {
      ...StyleSheet.absoluteFillObject,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0,0,0,0.4)',
    },
    errorContainer: {
      width: '100%',
      height: '100%',
    },
    errorOverlay: {
      ...StyleSheet.absoluteFillObject,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0,0,0,0.7)',
    },
    errorText: {
      color: colors.white,
      fontSize: TYPOGRAPHY.fontSize.md,
      marginTop: SPACING.sm,
      textAlign: 'center',
    },
    retryButton: {
      marginTop: SPACING.md,
      paddingVertical: SPACING.sm,
      paddingHorizontal: SPACING.lg,
      backgroundColor: colors.primary,
      borderRadius: SPACING.md,
    },
    retryText: {
      color: colors.white,
      fontSize: TYPOGRAPHY.fontSize.md,
      fontWeight: '600',
    },
    bottomGradient: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: 100,
    },
    controls: {
      position: 'absolute',
      bottom: SPACING.md,
      right: SPACING.md,
      flexDirection: 'row',
      gap: SPACING.sm,
    },
    controlButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
  }), [colors, settings.theme, glass, SPACING, TYPOGRAPHY]);

  // Handle video status update
  const handleStatusUpdate = (newStatus) => {
    setStatus({
      isLoaded: newStatus.isLoaded,
      isPlaying: newStatus.isPlaying,
      isBuffering: newStatus.isBuffering,
    });

    if (newStatus.didJustFinish && onVideoEnd) {
      onVideoEnd();
    }
  };

  // Handle video error
  const handleError = (err) => {
    console.error('[LivestreamPlayer] Video error:', err);
    setError('Không thể phát video');
    if (onError) onError(err);
  };

  // Toggle mute
  const toggleMute = async () => {
    if (videoRef.current) {
      await videoRef.current.setIsMutedAsync(!isMuted);
      setIsMuted(!isMuted);
    }
  };

  // Retry playback
  const retry = async () => {
    setError(null);
    if (videoRef.current) {
      await videoRef.current.playAsync();
    }
  };

  // Render video player or fallback
  const renderContent = () => {
    if (error) {
      return (
        <View style={styles.errorContainer}>
          {avatarImage ? (
            <Image source={avatarImage} style={styles.avatarImage} />
          ) : (
            <View style={[styles.avatarPlaceholder, { backgroundColor: colors.surfaceDark }]} />
          )}
          <View style={styles.errorOverlay}>
            <Ionicons name="alert-circle" size={40} color={colors.error} />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={retry}>
              <Text style={styles.retryText}>Thử lại</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    if (videoUrl) {
      return (
        <Video
          ref={videoRef}
          source={{ uri: videoUrl }}
          style={styles.video}
          resizeMode={ResizeMode.COVER}
          shouldPlay
          isLooping={false}
          isMuted={isMuted}
          onPlaybackStatusUpdate={handleStatusUpdate}
          onError={handleError}
        />
      );
    }

    // Fallback: Avatar image with audio (or placeholder if no image)
    return (
      <View style={styles.avatarContainer}>
        {avatarImage ? (
          <Image source={avatarImage} style={styles.avatarImage} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <LinearGradient
              colors={[colors.primary, colors.primaryDark]}
              style={styles.avatarGradient}
            >
              <Text style={styles.avatarInitials}>
                {avatarName.split(' ').map(n => n[0]).join('')}
              </Text>
              <Text style={styles.avatarLabel}>{avatarName}</Text>
            </LinearGradient>
          </View>
        )}
        {audioUrl && (
          <Video
            source={{ uri: audioUrl }}
            shouldPlay
            isLooping={false}
            isMuted={isMuted}
            onPlaybackStatusUpdate={handleStatusUpdate}
            onError={handleError}
          />
        )}
      </View>
    );
  };

  return (
    <View style={[styles.container, style]}>
      {renderContent()}

      {/* Loading overlay */}
      {status.isBuffering && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      )}

      {/* Bottom gradient */}
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.6)']}
        style={styles.bottomGradient}
      />

      {/* Controls */}
      <View style={styles.controls}>
        <TouchableOpacity style={styles.controlButton} onPress={toggleMute}>
          <Ionicons
            name={isMuted ? 'volume-mute' : 'volume-high'}
            size={24}
            color={colors.white}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default LivestreamPlayer;
