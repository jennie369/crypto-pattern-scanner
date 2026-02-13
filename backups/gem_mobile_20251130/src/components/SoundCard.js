/**
 * Gemral - Sound Card Component
 * Feature #4: Browse Sounds
 * Displays a sound item with play controls
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import {
  Play,
  Pause,
  Music,
  Bookmark,
  BookmarkCheck,
  TrendingUp,
  Users,
} from 'lucide-react-native';
import { COLORS, SPACING, TYPOGRAPHY, GLASS } from '../utils/tokens';
import soundService from '../services/soundService';

const SoundCard = ({
  sound,
  isPlaying = false,
  onPlay,
  onPause,
  onSelect,
  showSaveButton = true,
  showUseCount = true,
  compact = false,
}) => {
  const [isSaved, setIsSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const pulseAnim = useState(new Animated.Value(1))[0];

  useEffect(() => {
    if (showSaveButton) {
      checkSaved();
    }
  }, [sound?.id]);

  useEffect(() => {
    if (isPlaying) {
      startPulseAnimation();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isPlaying]);

  const checkSaved = async () => {
    const saved = await soundService.isSoundSaved(sound.id);
    setIsSaved(saved);
  };

  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
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
  };

  const handlePlayPause = () => {
    if (isPlaying) {
      onPause?.();
    } else {
      onPlay?.(sound);
      soundService.recordPlay(sound.id);
    }
  };

  const handleSave = async () => {
    if (saving) return;
    setSaving(true);

    if (isSaved) {
      const result = await soundService.unsaveSound(sound.id);
      if (result.success) setIsSaved(false);
    } else {
      const result = await soundService.saveSound(sound.id);
      if (result.success) setIsSaved(true);
    }

    setSaving(false);
  };

  const handleSelect = () => {
    onSelect?.(sound);
    soundService.recordUse(sound.id);
  };

  const formatCount = (count) => {
    if (!count) return '0';
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  if (compact) {
    return (
      <TouchableOpacity
        style={styles.compactContainer}
        onPress={handleSelect}
        activeOpacity={0.7}
      >
        <TouchableOpacity
          style={[styles.compactPlayButton, isPlaying && styles.playButtonActive]}
          onPress={handlePlayPause}
        >
          {isPlaying ? (
            <Pause size={16} color={COLORS.textPrimary} />
          ) : (
            <Play size={16} color={COLORS.textPrimary} />
          )}
        </TouchableOpacity>

        {sound.cover_image ? (
          <Image source={{ uri: sound.cover_image }} style={styles.compactCover} />
        ) : (
          <View style={[styles.compactCover, styles.coverPlaceholder]}>
            <Music size={14} color={COLORS.textMuted} />
          </View>
        )}

        <View style={styles.compactInfo}>
          <Text style={styles.compactTitle} numberOfLines={1}>
            {sound.title}
          </Text>
          <Text style={styles.compactArtist} numberOfLines={1}>
            {sound.artist_name}
          </Text>
        </View>

        <Text style={styles.compactDuration}>
          {soundService.formatDuration(sound.duration)}
        </Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handleSelect}
      activeOpacity={0.8}
    >
      {/* Cover Image */}
      <View style={styles.coverContainer}>
        {sound.cover_image ? (
          <Image source={{ uri: sound.cover_image }} style={styles.coverImage} />
        ) : (
          <View style={[styles.coverImage, styles.coverPlaceholder]}>
            <Music size={24} color={COLORS.textMuted} />
          </View>
        )}

        {/* Play Button Overlay */}
        <Animated.View
          style={[
            styles.playButtonOverlay,
            { transform: [{ scale: pulseAnim }] },
          ]}
        >
          <TouchableOpacity
            style={[styles.playButton, isPlaying && styles.playButtonActive]}
            onPress={handlePlayPause}
          >
            {isPlaying ? (
              <Pause size={20} color={COLORS.textPrimary} />
            ) : (
              <Play size={20} color={COLORS.textPrimary} />
            )}
          </TouchableOpacity>
        </Animated.View>

        {/* Duration Badge */}
        <View style={styles.durationBadge}>
          <Text style={styles.durationText}>
            {soundService.formatDuration(sound.duration)}
          </Text>
        </View>
      </View>

      {/* Info Section */}
      <View style={styles.infoSection}>
        <View style={styles.titleRow}>
          <Text style={styles.title} numberOfLines={1}>
            {sound.title}
          </Text>
          {sound.is_original && (
            <View style={styles.originalBadge}>
              <Text style={styles.originalText}>Original</Text>
            </View>
          )}
        </View>

        <Text style={styles.artist} numberOfLines={1}>
          {sound.artist_name}
        </Text>

        {/* Stats */}
        {showUseCount && (
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Users size={12} color={COLORS.textMuted} />
              <Text style={styles.statText}>{formatCount(sound.use_count)} bai dang</Text>
            </View>
            {sound.use_count > 100 && (
              <View style={styles.trendingBadge}>
                <TrendingUp size={10} color={COLORS.success} />
                <Text style={styles.trendingText}>Trending</Text>
              </View>
            )}
          </View>
        )}
      </View>

      {/* Save Button */}
      {showSaveButton && (
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSave}
          disabled={saving}
        >
          {isSaved ? (
            <BookmarkCheck size={20} color={COLORS.gold} />
          ) : (
            <Bookmark size={20} color={COLORS.textMuted} />
          )}
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: GLASS.background,
    borderRadius: 12,
    padding: SPACING.sm,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  coverContainer: {
    position: 'relative',
    width: 56,
    height: 56,
  },
  coverImage: {
    width: 56,
    height: 56,
    borderRadius: 10,
    backgroundColor: COLORS.glassBg,
  },
  coverPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(106, 91, 255, 0.2)',
  },
  playButtonOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButtonActive: {
    backgroundColor: COLORS.purple,
  },
  durationBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
  },
  durationText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textPrimary,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  infoSection: {
    flex: 1,
    marginLeft: SPACING.md,
    marginRight: SPACING.sm,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
    flex: 1,
  },
  originalBadge: {
    backgroundColor: 'rgba(0, 240, 255, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  originalText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.cyan,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  artist: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.xs,
    gap: SPACING.sm,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
  },
  trendingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(58, 247, 166, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 2,
  },
  trendingText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.success,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  saveButton: {
    padding: SPACING.sm,
  },
  // Compact styles
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.xs,
    gap: SPACING.sm,
  },
  compactPlayButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(106, 91, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  compactCover: {
    width: 36,
    height: 36,
    borderRadius: 6,
    backgroundColor: COLORS.glassBg,
  },
  compactInfo: {
    flex: 1,
  },
  compactTitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.textPrimary,
  },
  compactArtist: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
  },
  compactDuration: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
  },
});

export default SoundCard;
