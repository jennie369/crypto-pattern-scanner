/**
 * Gemral - Course Card Component
 * Reusable card for displaying course in lists
 * With smooth entrance animations
 * UPDATED: Added cache-busting for images
 */

import React, { useEffect, useRef, useMemo } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import { Clock, Users, Star, Lock } from 'lucide-react-native';
import { COLORS, SPACING, TYPOGRAPHY, GLASS } from '../../../utils/tokens';

// Helper: Add cache-busting parameter to image URL
const getCacheBustedUrl = (url, updatedAt) => {
  if (!url) return null;
  // Add updated_at timestamp as cache-busting parameter
  const separator = url.includes('?') ? '&' : '?';
  const cacheKey = updatedAt ? new Date(updatedAt).getTime() : Date.now();
  return `${url}${separator}v=${cacheKey}`;
};

const TIER_COLORS = {
  FREE: COLORS.success,
  TIER1: COLORS.gold,
  TIER2: COLORS.purple,
  TIER3: COLORS.cyan,
};

const TIER_LABELS = {
  FREE: 'Miễn phí',
  TIER1: 'Pro',
  TIER2: 'Premium',
  TIER3: 'VIP',
};

const CourseCard = React.memo(({
  course,
  onPress,
  progress = 0,
  isEnrolled = false,
  isLocked = false,
  style,
  index = 0, // For staggered animation
}) => {
  const tierColor = TIER_COLORS[course.tier_required] || COLORS.textMuted;
  const tierLabel = TIER_LABELS[course.tier_required] || course.tier_required;

  // Cache-busted image URL - use course.updated_at for cache key
  const thumbnailUrl = useMemo(() =>
    getCacheBustedUrl(course.thumbnail_url, course.updated_at),
    [course.thumbnail_url, course.updated_at]
  );

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    // Staggered entrance animation
    const delay = index * 100; // 100ms delay per item

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        delay,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        {
          opacity: fadeAnim,
          transform: [
            { translateY: slideAnim },
            { scale: scaleAnim },
          ],
        },
      ]}
    >
      <TouchableOpacity
        style={[styles.container, style]}
        onPress={onPress}
        activeOpacity={0.8}
      >
      {/* Thumbnail */}
      <View style={styles.thumbnailContainer}>
        <Image
          source={{ uri: thumbnailUrl }}
          style={styles.thumbnail}
          resizeMode="cover"
        />

        {/* Tier Badge */}
        <View style={[styles.tierBadge, { backgroundColor: tierColor }]}>
          <Text style={styles.tierText}>{tierLabel}</Text>
        </View>

        {/* Lock Overlay */}
        {isLocked && (
          <View style={styles.lockOverlay}>
            <Lock size={32} color={COLORS.textPrimary} />
            <Text style={styles.lockText}>Nâng cấp để mở khóa</Text>
          </View>
        )}

        {/* Progress Bar (if enrolled) */}
        {isEnrolled && progress > 0 && (
          <View style={styles.progressContainer}>
            <View style={[styles.progressBar, { width: `${progress}%` }]} />
          </View>
        )}
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {course.title}
        </Text>

        <Text style={styles.instructor}>
          {course.instructor?.name || course.instructor}
        </Text>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Clock size={14} color={COLORS.textMuted} />
            <Text style={styles.statText}>{course.duration_hours}h</Text>
          </View>
          <View style={styles.stat}>
            <Users size={14} color={COLORS.textMuted} />
            <Text style={styles.statText}>
              {course.students_count?.toLocaleString() || 0}
            </Text>
          </View>
          {course.rating && (
            <View style={styles.stat}>
              <Star size={14} color={COLORS.gold} fill={COLORS.gold} />
              <Text style={[styles.statText, { color: COLORS.gold }]}>
                {course.rating}
              </Text>
            </View>
          )}
        </View>

        {/* Enrolled Badge or Price */}
        {isEnrolled ? (
          <View style={styles.enrolledBadge}>
            <Text style={styles.enrolledText}>
              {progress >= 100 ? 'Hoàn thành' : `${progress}% hoàn thành`}
            </Text>
          </View>
        ) : course.price > 0 ? (
          <Text style={styles.price}>
            {course.price.toLocaleString()} {course.currency || 'VND'}
          </Text>
        ) : (
          <Text style={[styles.price, { color: COLORS.success }]}>
            Miễn phí
          </Text>
        )}
      </View>
    </TouchableOpacity>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  container: {
    backgroundColor: GLASS.background,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(106, 91, 255, 0.2)',
    overflow: 'hidden',
    marginBottom: SPACING.md,
  },
  thumbnailContainer: {
    position: 'relative',
    width: '100%',
    height: 160,
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  tierBadge: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: 8,
  },
  tierText: {
    fontSize: 11,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: '#112250',
    textTransform: 'uppercase',
  },
  lockOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  lockText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    marginTop: SPACING.xs,
  },
  progressContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  progressBar: {
    height: '100%',
    backgroundColor: COLORS.gold,
  },
  content: {
    padding: SPACING.md,
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
    lineHeight: 22,
  },
  instructor: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    marginBottom: SPACING.sm,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    marginBottom: SPACING.sm,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
  },
  enrolledBadge: {
    backgroundColor: 'rgba(106, 91, 255, 0.2)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  enrolledText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.purple,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  price: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.gold,
  },
});

CourseCard.displayName = 'CourseCard';

export default CourseCard;
