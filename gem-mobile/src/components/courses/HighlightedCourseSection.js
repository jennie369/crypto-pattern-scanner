/**
 * HighlightedCourseSection - Featured Course Display
 * Beautiful, prominent layout for showcasing a single highlighted course
 * Admin-manageable content
 */

import React, { useState, useEffect, useCallback, memo, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ImageBackground,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Star,
  Users,
  Clock,
  BookOpen,
  ChevronRight,
  Sparkles,
  Award,
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

import { useSettings } from '../../contexts/SettingsContext';
import { BORDER_RADIUS } from '../../utils/tokens';
import { supabase } from '../../services/supabase';

// =============================================
// MODULE-LEVEL CACHE - Persists across remounts
// =============================================
let cachedHighlightData = null;
let hasLoadedOnce = false;
let cacheTimestamp = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache

// Reset cache (can be called on pull-to-refresh)
export const resetHighlightedCourseCache = () => {
  cachedHighlightData = null;
  hasLoadedOnce = false;
  cacheTimestamp = null;
};

// Check if cache is still valid
const isCacheValid = () => {
  if (!hasLoadedOnce || !cacheTimestamp) return false;
  return Date.now() - cacheTimestamp < CACHE_DURATION;
};

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const HighlightedCourseSection = ({ style }) => {
  const navigation = useNavigation();
  const { colors, gradients, glass, settings, SPACING, TYPOGRAPHY } = useSettings();

  const CARD_WIDTH = SCREEN_WIDTH - SPACING.lg * 2;

  // Initialize state from cache if available (prevents loading flash)
  const [loading, setLoading] = useState(() => !isCacheValid());
  const [highlightData, setHighlightData] = useState(() => cachedHighlightData);
  const [error, setError] = useState(null);

  const styles = useMemo(() => StyleSheet.create({
    container: {
      paddingHorizontal: SPACING.lg,
      marginTop: SPACING.lg,
    },

    // Section Header
    sectionHeader: {
      marginBottom: SPACING.md,
    },
    sectionTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.sm,
    },
    sectionTitle: {
      fontSize: TYPOGRAPHY.fontSize.xl,
      fontWeight: TYPOGRAPHY.fontWeight.bold,
      color: colors.textPrimary,
    },
    sectionSubtitle: {
      fontSize: TYPOGRAPHY.fontSize.sm,
      color: colors.textMuted,
      marginTop: SPACING.xxs,
      marginLeft: 28, // Align with title (icon width + gap)
    },

    // Card
    card: {
      borderRadius: BORDER_RADIUS.xl,
      overflow: 'hidden',
      position: 'relative',
    },
    imageBackground: {
      width: '100%',
      minHeight: 320,
    },
    imageStyle: {
      borderRadius: BORDER_RADIUS.xl,
    },
    gradient: {
      flex: 1,
      minHeight: 320,
      padding: SPACING.lg,
      justifyContent: 'flex-end',
    },

    // Badge
    badge: {
      position: 'absolute',
      top: SPACING.lg,
      left: SPACING.lg,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: SPACING.sm,
      paddingVertical: SPACING.xs,
      borderRadius: BORDER_RADIUS.full,
      gap: 4,
    },
    badgeText: {
      fontSize: TYPOGRAPHY.fontSize.xs,
      fontWeight: TYPOGRAPHY.fontWeight.bold,
      color: colors.bgDarkest,
    },

    // Content
    content: {
      marginTop: 'auto',
    },
    title: {
      fontSize: TYPOGRAPHY.fontSize.xxl,
      fontWeight: TYPOGRAPHY.fontWeight.bold,
      color: colors.textPrimary,
      marginBottom: SPACING.xs,
      lineHeight: 28,
    },
    subtitle: {
      fontSize: TYPOGRAPHY.fontSize.sm,
      color: colors.textSecondary,
      marginBottom: SPACING.sm,
      lineHeight: 20,
    },
    instructor: {
      fontSize: TYPOGRAPHY.fontSize.xs,
      color: colors.gold,
      marginBottom: SPACING.md,
    },

    // Stats
    statsRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: SPACING.md,
      marginBottom: SPACING.md,
    },
    stat: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    statText: {
      fontSize: TYPOGRAPHY.fontSize.sm,
      color: colors.textSecondary,
    },

    // Bottom Row
    bottomRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: SPACING.sm,
    },
    priceContainer: {
      flexDirection: 'row',
      alignItems: 'baseline',
      gap: SPACING.sm,
    },
    price: {
      fontSize: TYPOGRAPHY.fontSize.xxl,
      fontWeight: TYPOGRAPHY.fontWeight.bold,
      color: colors.gold,
    },
    freePrice: {
      color: colors.success,
    },

    // CTA Button
    ctaButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.gold,
      paddingHorizontal: SPACING.lg,
      paddingVertical: SPACING.sm,
      borderRadius: BORDER_RADIUS.full,
      gap: 4,
    },
    ctaText: {
      fontSize: TYPOGRAPHY.fontSize.sm,
      fontWeight: TYPOGRAPHY.fontWeight.bold,
      color: colors.bgDarkest,
    },

    // Level Badge
    levelBadge: {
      position: 'absolute',
      top: -280,
      right: 0,
      backgroundColor: 'rgba(106, 91, 255, 0.9)',
      paddingHorizontal: SPACING.sm,
      paddingVertical: SPACING.xs,
      borderRadius: BORDER_RADIUS.sm,
    },
    levelText: {
      fontSize: TYPOGRAPHY.fontSize.xs,
      fontWeight: TYPOGRAPHY.fontWeight.bold,
      color: colors.textPrimary,
    },

    // Border Glow Effect
    borderGlow: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      borderRadius: BORDER_RADIUS.xl,
      borderWidth: 1,
      borderColor: 'rgba(255, 189, 89, 0.3)',
      pointerEvents: 'none',
    },
  }), [colors, settings.theme, glass, SPACING, TYPOGRAPHY]);

  const loadHighlightedCourse = useCallback(async () => {
    // Use cache if still valid - prevents re-fetch on remount
    if (isCacheValid()) {
      setHighlightData(cachedHighlightData);
      setLoading(false);
      return;
    }

    // Mark as loading started (prevent concurrent fetches)
    if (hasLoadedOnce && !isCacheValid()) {
      // Cache expired, need to refresh
    } else if (hasLoadedOnce) {
      return; // Already loading
    }
    hasLoadedOnce = true;

    try {
      setError(null);

      const { data, error: fetchError } = await supabase
        .rpc('get_highlighted_course');

      if (fetchError) throw fetchError;

      if (data && data.length > 0) {
        cachedHighlightData = data[0];
        setHighlightData(data[0]);
      } else {
        cachedHighlightData = null;
      }
      cacheTimestamp = Date.now();
    } catch (err) {
      console.error('[HighlightedCourseSection] Load error:', err);
      setError(err.message);
      cacheTimestamp = Date.now(); // Still cache to prevent infinite retries
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadHighlightedCourse();
  }, [loadHighlightedCourse]);

  const handlePress = () => {
    if (highlightData?.course_id) {
      navigation.navigate('CourseDetail', { courseId: highlightData.course_id });
    }
  };

  // Format price
  const formatPrice = (price) => {
    if (!price || price === 0) return 'Miễn phí';
    return new Intl.NumberFormat('vi-VN').format(price) + 'đ';
  };

  // Format duration
  const formatDuration = (hours) => {
    if (!hours) return '0h';
    if (hours < 1) return `${Math.round(hours * 60)}m`;
    return `${hours}h`;
  };

  // Don't show loading spinner - section will appear when data is ready
  // This prevents perpetual loading when function doesn't exist or no data
  if (loading || error || !highlightData) {
    return null;
  }

  const {
    course_id,
    custom_title,
    custom_subtitle,
    custom_description,
    custom_image_url,
    badge_text,
    badge_color,
    cta_text,
    show_price,
    show_students,
    show_rating,
    show_lessons,
    course_title,
    course_description,
    course_thumbnail,
    course_price,
    course_is_free,
    course_level,
    course_duration_hours,
    course_lesson_count,
    course_student_count,
    course_rating,
    course_instructor,
  } = highlightData;

  // Use custom values or fallback to course data
  const displayTitle = custom_title || course_title;
  const displaySubtitle = custom_subtitle || course_description;
  const displayImage = custom_image_url || course_thumbnail;
  const displayDescription = custom_description || '';

  // Get badge color
  const getBadgeColor = () => {
    switch (badge_color) {
      case 'gold': return colors.gold;
      case 'purple': return colors.purple;
      case 'cyan': return colors.cyan;
      case 'green': return colors.success;
      case 'red': return colors.error;
      default: return colors.gold;
    }
  };

  return (
    <View style={[styles.container, style]}>
      {/* Section Header */}
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleRow}>
          <Sparkles size={20} color={colors.gold} />
          <Text style={styles.sectionTitle}>Khóa học nổi bật</Text>
        </View>
        <Text style={styles.sectionSubtitle}>Được đề xuất cho bạn</Text>
      </View>

      {/* Main Card */}
      <TouchableOpacity
        style={styles.card}
        onPress={handlePress}
        activeOpacity={0.9}
      >
        {/* Image Background */}
        <ImageBackground
          source={{ uri: displayImage }}
          style={styles.imageBackground}
          imageStyle={styles.imageStyle}
        >
          {/* Gradient Overlay */}
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.7)', settings.theme === 'light' ? colors.bgDarkest : (glass.background || 'rgba(15, 16, 48, 0.95)')]}
            locations={[0, 0.5, 1]}
            style={styles.gradient}
          >
            {/* Badge */}
            <View style={[styles.badge, { backgroundColor: getBadgeColor() }]}>
              <Award size={12} color={colors.bgDarkest} />
              <Text style={styles.badgeText}>{badge_text || 'Nổi bật'}</Text>
            </View>

            {/* Content */}
            <View style={styles.content}>
              {/* Title */}
              <Text style={styles.title} numberOfLines={2}>
                {displayTitle}
              </Text>

              {/* Subtitle/Description */}
              {displaySubtitle && (
                <Text style={styles.subtitle} numberOfLines={2}>
                  {displaySubtitle}
                </Text>
              )}

              {/* Instructor */}
              {course_instructor && (
                <Text style={styles.instructor}>
                  Giảng viên: {course_instructor}
                </Text>
              )}

              {/* Stats Row */}
              <View style={styles.statsRow}>
                {show_rating && course_rating > 0 && (
                  <View style={styles.stat}>
                    <Star size={14} color={colors.gold} fill={colors.gold} />
                    <Text style={styles.statText}>{course_rating.toFixed(1)}</Text>
                  </View>
                )}

                {show_students && course_student_count > 0 && (
                  <View style={styles.stat}>
                    <Users size={14} color={colors.cyan} />
                    <Text style={styles.statText}>{course_student_count} học viên</Text>
                  </View>
                )}

                {show_lessons && course_lesson_count > 0 && (
                  <View style={styles.stat}>
                    <BookOpen size={14} color={colors.purple} />
                    <Text style={styles.statText}>{course_lesson_count} bài</Text>
                  </View>
                )}

                {course_duration_hours > 0 && (
                  <View style={styles.stat}>
                    <Clock size={14} color={colors.textMuted} />
                    <Text style={styles.statText}>{formatDuration(course_duration_hours)}</Text>
                  </View>
                )}
              </View>

              {/* Price & CTA Row */}
              <View style={styles.bottomRow}>
                {/* Price */}
                {show_price && (
                  <View style={styles.priceContainer}>
                    <Text style={[
                      styles.price,
                      course_is_free && styles.freePrice
                    ]}>
                      {course_is_free ? 'Miễn phí' : formatPrice(course_price)}
                    </Text>
                  </View>
                )}

                {/* CTA Button */}
                <TouchableOpacity
                  style={styles.ctaButton}
                  onPress={handlePress}
                  activeOpacity={0.8}
                >
                  <Text style={styles.ctaText}>{cta_text || 'Xem chi tiết'}</Text>
                  <ChevronRight size={16} color={colors.bgDarkest} />
                </TouchableOpacity>
              </View>

              {/* Level Badge */}
              {course_level && (
                <View style={styles.levelBadge}>
                  <Text style={styles.levelText}>
                    {course_level === 'beginner' ? 'Cơ bản' :
                     course_level === 'intermediate' ? 'Trung cấp' :
                     course_level === 'advanced' ? 'Nâng cao' : course_level}
                  </Text>
                </View>
              )}
            </View>
          </LinearGradient>
        </ImageBackground>

        {/* Decorative Border */}
        <View style={styles.borderGlow} />
      </TouchableOpacity>
    </View>
  );
};

// Memoize to prevent unnecessary re-renders
export default memo(HighlightedCourseSection);
