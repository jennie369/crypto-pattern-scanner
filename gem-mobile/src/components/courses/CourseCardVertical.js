/**
 * GEM Academy - Course Card Vertical
 * Vertical course card for grid/list layouts
 * UPDATED: Added cache-busting for images
 */

import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Clock, Users, Star, PlayCircle, CheckCircle, Lock } from 'lucide-react-native';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS, SHADOWS } from '../../utils/tokens';
import ProgressBar from '../Common/ProgressBar';

// Helper: Add cache-busting parameter to image URL
const getCacheBustedUrl = (url, updatedAt) => {
  if (!url) return null;
  const separator = url.includes('?') ? '&' : '?';
  const cacheKey = updatedAt ? new Date(updatedAt).getTime() : Date.now();
  return `${url}${separator}v=${cacheKey}`;
};

const CourseCardVertical = React.memo(({
  course,
  progress = 0,
  isEnrolled = false,
  isCompleted = false,
  isLocked = false,
  onPress,
  compact = false,
  style = {},
}) => {
  if (!course) return null;

  const {
    title = 'Course',
    thumbnail_url,
    instructor_name,
    duration_minutes = 0,
    student_count = 0,
    rating = 0,
    lesson_count = 0,
    price = 0,
    is_free = false,
    difficulty = 'beginner',
    updated_at,
  } = course;

  // Cache-busted image URL
  const cacheBustedThumbnail = useMemo(() =>
    getCacheBustedUrl(thumbnail_url, updated_at),
    [thumbnail_url, updated_at]
  );

  // Format duration
  const formatDuration = (minutes) => {
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      return `${hours}h ${minutes % 60}m`;
    }
    return `${minutes}m`;
  };

  // Format student count
  const formatStudentCount = (count) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
  };

  // Difficulty colors
  const difficultyColors = {
    beginner: COLORS.success,
    intermediate: COLORS.gold,
    advanced: COLORS.error,
  };

  const difficultyLabels = {
    beginner: 'Cơ bản',
    intermediate: 'Trung cấp',
    advanced: 'Nâng cao',
  };

  if (compact) {
    return (
      <TouchableOpacity
        style={[styles.compactContainer, style]}
        onPress={onPress}
        activeOpacity={0.7}
        disabled={!onPress}
      >
        <View style={styles.compactThumbnail}>
          {cacheBustedThumbnail ? (
            <Image source={{ uri: cacheBustedThumbnail }} style={styles.compactImage} />
          ) : (
            <View style={styles.compactPlaceholder}>
              <PlayCircle size={24} color={COLORS.textMuted} />
            </View>
          )}
          {isLocked && (
            <View style={styles.lockOverlay}>
              <Lock size={20} color={COLORS.textPrimary} />
            </View>
          )}
          {isCompleted && (
            <View style={styles.completedBadge}>
              <CheckCircle size={16} color={COLORS.success} />
            </View>
          )}
        </View>
        <Text style={styles.compactTitle} numberOfLines={2}>{title}</Text>
        {isEnrolled && progress > 0 && (
          <ProgressBar
            progress={progress}
            height={4}
            fillColor={isCompleted ? COLORS.success : COLORS.gold}
            style={styles.compactProgress}
          />
        )}
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={!onPress}
    >
      {/* Thumbnail */}
      <View style={styles.thumbnailContainer}>
        {cacheBustedThumbnail ? (
          <Image source={{ uri: cacheBustedThumbnail }} style={styles.thumbnail} />
        ) : (
          <LinearGradient
            colors={['rgba(106, 91, 255, 0.3)', 'rgba(0, 240, 255, 0.2)']}
            style={styles.thumbnailPlaceholder}
          >
            <PlayCircle size={40} color={COLORS.textMuted} />
          </LinearGradient>
        )}

        {/* Overlays */}
        {isLocked && (
          <View style={styles.lockOverlay}>
            <Lock size={24} color={COLORS.textPrimary} />
          </View>
        )}

        {/* Duration badge */}
        <View style={styles.durationBadge}>
          <Clock size={10} color={COLORS.textPrimary} />
          <Text style={styles.durationText}>{formatDuration(duration_minutes)}</Text>
        </View>

        {/* Difficulty badge */}
        <View style={[styles.difficultyBadge, { backgroundColor: `${difficultyColors[difficulty]}20` }]}>
          <Text style={[styles.difficultyText, { color: difficultyColors[difficulty] }]}>
            {difficultyLabels[difficulty] || difficulty}
          </Text>
        </View>

        {/* Completed indicator */}
        {isCompleted && (
          <View style={styles.completedOverlay}>
            <CheckCircle size={32} color={COLORS.success} />
            <Text style={styles.completedText}>Hoàn thành</Text>
          </View>
        )}
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>{title}</Text>

        {instructor_name && (
          <Text style={styles.instructor} numberOfLines={1}>{instructor_name}</Text>
        )}

        {/* Stats row */}
        <View style={styles.statsRow}>
          {rating > 0 && (
            <View style={styles.statItem}>
              <Star size={12} color={COLORS.gold} fill={COLORS.gold} />
              <Text style={styles.statText}>{rating.toFixed(1)}</Text>
            </View>
          )}
          <View style={styles.statItem}>
            <Users size={12} color={COLORS.textMuted} />
            <Text style={styles.statText}>{formatStudentCount(student_count)}</Text>
          </View>
          <View style={styles.statItem}>
            <PlayCircle size={12} color={COLORS.textMuted} />
            <Text style={styles.statText}>{lesson_count} bài</Text>
          </View>
        </View>

        {/* Progress bar (if enrolled) */}
        {isEnrolled && progress > 0 && (
          <View style={styles.progressContainer}>
            <ProgressBar
              progress={progress}
              height={4}
              fillColor={isCompleted ? COLORS.success : COLORS.gold}
            />
            <Text style={styles.progressText}>{Math.round(progress)}%</Text>
          </View>
        )}

        {/* Price or status */}
        {!isEnrolled && (
          <View style={styles.priceContainer}>
            {is_free || !price || price === 0 ? (
              <Text style={styles.freeText}>Miễn phí</Text>
            ) : (
              <Text style={styles.priceText}>{price.toLocaleString('vi-VN')}đ</Text>
            )}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
});

CourseCardVertical.displayName = 'CourseCardVertical';

const styles = StyleSheet.create({
  container: {
    width: 180,
    backgroundColor: COLORS.glassBg,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.2)',
    ...SHADOWS.glass,
  },
  thumbnailContainer: {
    height: 100,
    position: 'relative',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  thumbnailPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  lockOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  durationBadge: {
    position: 'absolute',
    bottom: SPACING.xs,
    right: SPACING.xs,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.xs,
  },
  durationText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textPrimary,
    marginLeft: 3,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  difficultyBadge: {
    position: 'absolute',
    top: SPACING.xs,
    left: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.xs,
  },
  difficultyText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  completedOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  completedText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.success,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    marginTop: SPACING.xxs,
  },
  completedBadge: {
    position: 'absolute',
    top: SPACING.xs,
    right: SPACING.xs,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: BORDER_RADIUS.full,
    padding: 2,
  },
  content: {
    padding: SPACING.md,
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xxs,
    lineHeight: 20,
  },
  instructor: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    marginBottom: SPACING.sm,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  statText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
    marginLeft: SPACING.xxs,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.gold,
    marginLeft: SPACING.sm,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  priceContainer: {
    marginTop: SPACING.xxs,
  },
  priceText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.gold,
  },
  freeText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.success,
  },
  // Compact mode
  compactContainer: {
    width: 140,
    marginRight: SPACING.md,
  },
  compactThumbnail: {
    width: 140,
    height: 80,
    borderRadius: BORDER_RADIUS.md,
    overflow: 'hidden',
    backgroundColor: COLORS.glassBg,
    position: 'relative',
  },
  compactImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  compactPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 16, 48, 0.5)',
  },
  compactTitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.textPrimary,
    marginTop: SPACING.sm,
    lineHeight: 16,
  },
  compactProgress: {
    marginTop: SPACING.xs,
  },
});

export default CourseCardVertical;
