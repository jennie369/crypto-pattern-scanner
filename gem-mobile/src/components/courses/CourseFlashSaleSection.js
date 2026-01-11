/**
 * CourseFlashSaleSection.js - Flash Sale Section for Courses
 * Displays courses on sale with countdown timer
 */

import React, { useState, useEffect, useCallback, memo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Zap, ChevronRight, Clock, Users, Star } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../../services/supabase';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../../utils/tokens';
import CountdownTimer from '../shop/CountdownTimer';

// =============================================
// MODULE-LEVEL CACHE - Persists across remounts
// =============================================
let cachedFlashSale = null;
let cachedCourses = [];
let hasLoadedOnce = false;
let cacheTimestamp = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache

// Reset cache (can be called on pull-to-refresh)
export const resetFlashSaleCache = () => {
  cachedFlashSale = null;
  cachedCourses = [];
  hasLoadedOnce = false;
  cacheTimestamp = null;
};

// Check if cache is still valid
const isCacheValid = () => {
  if (!hasLoadedOnce || !cacheTimestamp) return false;
  return Date.now() - cacheTimestamp < CACHE_DURATION;
};

// Flash Sale Course Card
const FlashSaleCourseCard = ({ course, discountPercentage, onPress }) => {
  const originalPrice = course.price || 0;
  const salePrice = Math.round(originalPrice * (1 - discountPercentage / 100));

  return (
    <TouchableOpacity
      style={styles.courseCard}
      onPress={() => onPress(course)}
      activeOpacity={0.8}
    >
      {/* Thumbnail */}
      <View style={styles.thumbnailContainer}>
        {course.thumbnail_url ? (
          <View style={styles.thumbnail}>
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.8)']}
              style={styles.thumbnailGradient}
            />
          </View>
        ) : (
          <LinearGradient
            colors={['rgba(156, 6, 18, 0.3)', 'rgba(106, 91, 255, 0.3)']}
            style={styles.thumbnailPlaceholder}
          />
        )}

        {/* Discount badge */}
        <View style={styles.discountBadge}>
          <Zap size={12} color="#FFFFFF" fill="#FFFFFF" />
          <Text style={styles.discountText}>-{discountPercentage}%</Text>
        </View>
      </View>

      {/* Content */}
      <View style={styles.cardContent}>
        <Text style={styles.courseTitle} numberOfLines={2}>
          {course.title}
        </Text>

        {course.instructor_name && (
          <Text style={styles.instructorName} numberOfLines={1}>
            {course.instructor_name}
          </Text>
        )}

        {/* Stats */}
        <View style={styles.statsRow}>
          {course.rating > 0 && (
            <View style={styles.statItem}>
              <Star size={10} color={COLORS.gold} fill={COLORS.gold} />
              <Text style={styles.statText}>{course.rating.toFixed(1)}</Text>
            </View>
          )}
          <View style={styles.statItem}>
            <Users size={10} color={COLORS.textMuted} />
            <Text style={styles.statText}>{course.student_count || 0}</Text>
          </View>
          <View style={styles.statItem}>
            <Clock size={10} color={COLORS.textMuted} />
            <Text style={styles.statText}>{course.duration_minutes || 0}m</Text>
          </View>
        </View>

        {/* Price */}
        <View style={styles.priceRow}>
          <Text style={styles.salePrice}>
            {salePrice === 0 ? 'Miễn phí' : `${salePrice.toLocaleString('vi-VN')}đ`}
          </Text>
          {originalPrice > 0 && discountPercentage > 0 && (
            <Text style={styles.originalPrice}>
              {originalPrice.toLocaleString('vi-VN')}đ
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const CourseFlashSaleSection = ({ style }) => {
  const navigation = useNavigation();

  // Initialize state from cache if available (prevents loading flash)
  const [flashSale, setFlashSale] = useState(() => cachedFlashSale);
  const [courses, setCourses] = useState(() => cachedCourses);
  const [loading, setLoading] = useState(() => !isCacheValid());
  const [isExpired, setIsExpired] = useState(false);

  // Fetch active course flash sale
  const fetchFlashSale = useCallback(async () => {
    // Use cache if still valid - prevents re-fetch on remount
    if (isCacheValid()) {
      setFlashSale(cachedFlashSale);
      setCourses(cachedCourses);
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
      const now = new Date().toISOString();

      // Check for course flash sale config
      const { data: saleData, error: saleError } = await supabase
        .from('course_flash_sales')
        .select('*')
        .eq('is_active', true)
        .lte('start_time', now)
        .gte('end_time', now)
        .order('start_time', { ascending: true })
        .limit(1)
        .maybeSingle();

      if (saleError) {
        // Table might not exist yet
        if (saleError.code === '42P01') {
          console.log('[CourseFlashSale] Table not ready yet');
          cachedFlashSale = null;
          cachedCourses = [];
          cacheTimestamp = Date.now();
          setLoading(false);
          return;
        }
        throw saleError;
      }

      if (!saleData) {
        cachedFlashSale = null;
        cachedCourses = [];
        cacheTimestamp = Date.now();
        setFlashSale(null);
        setLoading(false);
        return;
      }

      // Update cache
      cachedFlashSale = saleData;
      setFlashSale(saleData);

      // Fetch courses for flash sale
      if (saleData.course_ids && saleData.course_ids.length > 0) {
        const { data: coursesData, error: coursesError } = await supabase
          .from('courses')
          .select('*')
          .in('id', saleData.course_ids)
          .eq('is_published', true);

        if (!coursesError && coursesData) {
          cachedCourses = coursesData;
          setCourses(coursesData);
        }
      }
      cacheTimestamp = Date.now();
    } catch (err) {
      console.error('[CourseFlashSale] Fetch error:', err);
      cacheTimestamp = Date.now(); // Still cache to prevent infinite retries
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFlashSale();
  }, [fetchFlashSale]);

  const handleExpire = () => {
    setIsExpired(true);
  };

  const handleSeeAll = () => {
    navigation.navigate('CourseList', {
      filter: 'flash-sale',
      title: flashSale?.title || 'Flash Sale',
    });
  };

  const handleCoursePress = (course) => {
    navigation.navigate('CourseDetail', { courseId: course.id });
  };

  const renderCourse = ({ item }) => (
    <FlashSaleCourseCard
      course={item}
      discountPercentage={flashSale?.discount_percentage || 30}
      onPress={handleCoursePress}
    />
  );

  // Don't render if no data available (loading or no flash sale)
  // Skip loading indicator entirely - just show nothing until data arrives
  // This prevents the "loading flash" issue on remount
  if (!flashSale || isExpired || courses.length === 0) {
    return null;
  }

  return (
    <View style={[styles.container, style]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.titleContainer}>
            <Zap size={20} color={COLORS.burgundy} fill={COLORS.burgundy} />
            <Text style={styles.title}>{flashSale.title || 'Flash Sale'}</Text>
          </View>
          <CountdownTimer
            endTime={flashSale.end_time}
            onExpire={handleExpire}
            size="small"
            showLabels={false}
          />
        </View>

        <TouchableOpacity
          style={styles.seeAllButton}
          onPress={handleSeeAll}
          activeOpacity={0.7}
        >
          <Text style={styles.seeAllText}>Xem tất cả</Text>
          <ChevronRight size={16} color={COLORS.burgundy} />
        </TouchableOpacity>
      </View>

      {/* Subtitle */}
      {flashSale.subtitle && (
        <Text style={styles.subtitle}>{flashSale.subtitle}</Text>
      )}

      {/* Courses */}
      <FlatList
        data={courses}
        renderItem={renderCourse}
        keyExtractor={(item) => item.id?.toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.courseList}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.xl,
    backgroundColor: 'rgba(156, 6, 18, 0.1)',
    paddingVertical: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    marginHorizontal: SPACING.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  title: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  subtitle: {
    color: COLORS.textMuted,
    fontSize: TYPOGRAPHY.fontSize.sm,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.md,
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seeAllText: {
    color: COLORS.burgundy,
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  courseList: {
    paddingHorizontal: SPACING.md,
  },

  // Course Card Styles
  courseCard: {
    width: 160,
    marginRight: SPACING.md,
    backgroundColor: COLORS.glassBg,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(156, 6, 18, 0.3)',
  },
  thumbnailContainer: {
    height: 90,
    position: 'relative',
    backgroundColor: 'rgba(156, 6, 18, 0.2)',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  thumbnailGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  thumbnailPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  discountBadge: {
    position: 'absolute',
    top: SPACING.xs,
    left: SPACING.xs,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.burgundy,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
    gap: 2,
  },
  discountText: {
    color: '#FFFFFF',
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  cardContent: {
    padding: SPACING.sm,
  },
  courseTitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xxs,
    lineHeight: 18,
  },
  instructorName: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
    marginBottom: SPACING.xs,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  statText: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginLeft: 2,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  salePrice: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.burgundy,
  },
  originalPrice: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    textDecorationLine: 'line-through',
  },
});

// Memoize to prevent unnecessary re-renders
export default memo(CourseFlashSaleSection);
