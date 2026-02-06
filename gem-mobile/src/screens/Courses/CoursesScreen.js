/**
 * Gemral - Courses Screen (Main)
 * Enhanced course catalog with multiple sections, filters, banners
 * Updated to use CourseContext for state management
 */

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowLeft,
  Search,
  BookOpen,
  GraduationCap,
  CheckCircle,
  Filter,
  SlidersHorizontal,
} from 'lucide-react-native';
import { CourseCard } from './components';
import { useCourse } from '../../contexts/CourseContext';
import { useAuth } from '../../contexts/AuthContext';
import { useTabBar } from '../../contexts/TabBarContext';
import { useUpgrade } from '../../hooks/useUpgrade';
import { COLORS, SPACING, TYPOGRAPHY, GRADIENTS, BORDER_RADIUS } from '../../utils/tokens';

// Course components
import {
  HeroBannerCarousel,
  CourseSection,
  CourseCategoryGrid,
  CourseFlashSaleSection,
  CourseFilterSheet,
  HighlightedCourseSection,
  resetAllCourseSectionCaches,
} from '../../components/courses';

// Shop components
import { PromoBar, FilterPills, SortOptions } from '../../components/shop';

// Sponsor Banners
import SponsorBannerSection, { useSponsorBanners } from '../../components/SponsorBannerSection';

// Note: Gamification components removed due to rendering issues

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Filter tabs
const FILTER_TABS = [
  { id: 'all', label: 'Tất cả', icon: BookOpen },
  { id: 'enrolled', label: 'Đang học', icon: GraduationCap },
  { id: 'completed', label: 'Hoàn thành', icon: CheckCircle },
];

// Quick filter pills
const QUICK_FILTERS = [
  { id: 'popular', label: 'Phổ biến' },
  { id: 'new', label: 'Mới nhất' },
  { id: 'trading', label: 'Trading' },
  { id: 'mindset', label: 'Tư duy' },
];

const HEADER_HEIGHT = 60;

const CoursesScreen = ({ navigation, route }) => {
  const { profile } = useAuth();
  const {
    handleScroll: tabBarHandleScroll,
    enableAutoHide,
    disableAutoHide,
    bottomPadding,
  } = useTabBar();

  // Use CourseContext instead of local state
  const {
    courses,
    enrolledCourseIds,
    courseProgress,
    inProgressCourses,
    completedCourses,
    loading,
    refreshing,
    refresh,
    isEnrolled,
    isCourseLocked,
    getProgress,
  } = useCourse();

  // Upgrade hook for locked course handling
  const { onFeatureLocked, TIER_TYPES } = useUpgrade();

  // Filter state - check route params for initial filter
  const routeFilter = route?.params?.filter || 'all';
  const routeCategory = route?.params?.category || null;
  const routeFilterTags = route?.params?.filterTags || null; // Tag-based filtering from category cards
  const pageTitle = route?.params?.title || null;
  const sourceTab = route?.params?.sourceTab || 'Account'; // Default back to Tài Sản tab

  const [activeFilter, setActiveFilter] = useState(routeFilter);
  const [activeFilterTags, setActiveFilterTags] = useState(routeFilterTags);
  const [pageTitleOverride, setPageTitleOverride] = useState(null); // For category card selection
  const [activeQuickFilters, setActiveQuickFilters] = useState(
    routeCategory === 'trading' ? ['trading'] :
    routeCategory === 'mindset' || routeCategory === 'spiritual' ? ['mindset'] :
    routeFilter === 'popular' ? ['popular'] :
    routeFilter === 'new' ? ['new'] : []
  );
  const [showFilterSheet, setShowFilterSheet] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState({});

  // React to route param changes (when navigating from category cards with filterTags)
  useEffect(() => {
    if (JSON.stringify(routeFilterTags) !== JSON.stringify(activeFilterTags)) {
      setActiveFilterTags(routeFilterTags);
      // Reset other filters when filterTags changes
      if (routeFilterTags) {
        setActiveFilter('all');
        setActiveQuickFilters([]);
        setAppliedFilters({});
      }
    }
  }, [routeFilterTags]);

  // Header auto-hide animation
  const headerTranslateY = useRef(new Animated.Value(0)).current;
  const lastScrollY = useRef(0);
  const isHeaderVisible = useRef(true);

  // Enable auto-hide when screen mounts
  useEffect(() => {
    enableAutoHide();
    return () => {
      disableAutoHide();
    };
  }, [enableAutoHide, disableAutoHide]);

  // Combined scroll handler for header and tab bar auto-hide
  const handleScroll = useCallback((event) => {
    const currentScrollY = event.nativeEvent.contentOffset.y;
    const scrollThreshold = 50;

    // Handle tab bar
    tabBarHandleScroll(event);

    // Handle header auto-hide
    if (Math.abs(currentScrollY - lastScrollY.current) < 10) {
      return;
    }

    // Scroll down - hide header
    if (currentScrollY > lastScrollY.current && currentScrollY > scrollThreshold && isHeaderVisible.current) {
      isHeaderVisible.current = false;
      Animated.timing(headerTranslateY, {
        toValue: -HEADER_HEIGHT - 20,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
    // Scroll up - show header
    else if (currentScrollY < lastScrollY.current && !isHeaderVisible.current) {
      isHeaderVisible.current = true;
      Animated.timing(headerTranslateY, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }

    lastScrollY.current = currentScrollY;
  }, [tabBarHandleScroll, headerTranslateY]);

  // Sponsor banners
  const { banners: sponsorBanners, dismissBanner } = useSponsorBanners('courses');


  // Animation values for header entrance
  const headerFadeAnim = useRef(new Animated.Value(0)).current;
  const headerSlideAnim = useRef(new Animated.Value(-20)).current;
  const filterFadeAnim = useRef(new Animated.Value(0)).current;

  // Entrance animation on mount
  useEffect(() => {
    Animated.stagger(150, [
      Animated.parallel([
        Animated.timing(headerFadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(headerSlideAnim, {
          toValue: 0,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(filterFadeAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Filter courses based on active tab, quick filters, and route params
  const filteredCourses = useMemo(() => {
    let result = courses;

    // Apply tag-based filter from category cards
    if (activeFilterTags && activeFilterTags.length > 0) {
      // Normalize filter tags for matching
      const normalizedFilterTags = activeFilterTags.map(t => t.toLowerCase().trim());

      result = result.filter(c => {
        // Get course fields (normalize for comparison)
        const courseTags = (c.tags || []).map(t => t.toLowerCase().trim());
        const courseCategory = (c.category || '').toLowerCase().trim();
        const courseTitle = (c.title || '').toLowerCase();
        const courseDescription = (c.description || '').toLowerCase();
        const courseTier = (c.tier_required || '').toLowerCase();

        // Match if course has ANY of the filter tags in title, description, tags, or category
        return normalizedFilterTags.some(filterTag => {
          // Check tags array
          if (courseTags.includes(filterTag)) return true;
          if (courseTags.some(ct => ct.includes(filterTag) || filterTag.includes(ct))) return true;
          // Check category
          if (courseCategory === filterTag || courseCategory.includes(filterTag)) return true;
          // Check title (most important for matching)
          if (courseTitle.includes(filterTag)) return true;
          // Check description
          if (courseDescription.includes(filterTag)) return true;
          // Special matching for common keywords
          if (filterTag === 'trading' && (courseTitle.includes('trading') || courseTitle.includes('giao dịch'))) return true;
          if (filterTag === 'mindset' && (courseTitle.includes('tư duy') || courseTitle.includes('mindset'))) return true;
          if (filterTag === 'spiritual' && (courseTitle.includes('tâm thức') || courseTitle.includes('healing') || courseTitle.includes('tần số'))) return true;
          return false;
        });
      });
    }

    // Apply tab filter
    if (activeFilter === 'enrolled') {
      result = inProgressCourses;
    } else if (activeFilter === 'completed') {
      result = completedCourses;
    }

    // Apply quick filters
    if (activeQuickFilters.includes('free')) {
      result = result.filter(c => c.price === 0 || c.price === null);
    }
    if (activeQuickFilters.includes('popular')) {
      result = [...result].sort((a, b) => (b.students_count || b.student_count || 0) - (a.students_count || a.student_count || 0));
    }
    if (activeQuickFilters.includes('new')) {
      result = [...result].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }
    if (activeQuickFilters.includes('trading')) {
      result = result.filter(c => {
        const title = (c.title || '').toLowerCase();
        const description = (c.description || '').toLowerCase();
        return (
          c.category === 'trading' ||
          c.tags?.includes('trading') ||
          title.includes('trading') ||
          title.includes('giao dịch') ||
          title.includes('gem trading') ||
          description.includes('trading') ||
          description.includes('giao dịch')
        );
      });
    }
    if (activeQuickFilters.includes('mindset')) {
      result = result.filter(c => {
        const title = (c.title || '').toLowerCase();
        const description = (c.description || '').toLowerCase();
        return (
          c.category === 'mindset' ||
          c.category === 'spiritual' || // Legacy support
          c.tags?.includes('mindset') ||
          c.tags?.includes('spiritual') ||
          c.tags?.includes('tarot') ||
          title.includes('tư duy') ||
          title.includes('mindset') ||
          title.includes('tâm thức') ||
          title.includes('tần số') ||
          title.includes('healing') ||
          description.includes('tư duy') ||
          description.includes('mindset') ||
          description.includes('tâm thức')
        );
      });
    }

    // Apply advanced filters from filter sheet
    if (appliedFilters.categories?.length > 0) {
      const categoryIds = appliedFilters.categories.map(c => c.id);
      result = result.filter(c =>
        categoryIds.includes(c.category) ||
        c.tags?.some(t => categoryIds.includes(t))
      );
    }

    if (appliedFilters.difficulties?.length > 0) {
      const difficultyIds = appliedFilters.difficulties.map(d => d.id);
      result = result.filter(c => difficultyIds.includes(c.level));
    }

    if (appliedFilters.pricePreset) {
      const { min, max } = appliedFilters.pricePreset;
      result = result.filter(c => {
        const price = c.price || 0;
        return price >= min && price <= max;
      });
    }

    if (appliedFilters.rating) {
      result = result.filter(c => (c.rating || 0) >= appliedFilters.rating);
    }

    if (appliedFilters.isFree) {
      result = result.filter(c => c.price === 0 || c.price === null);
    }

    // Apply sorting from filter sheet
    if (appliedFilters.sortBy) {
      switch (appliedFilters.sortBy) {
        case 'newest':
          result = [...result].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
          break;
        case 'popular':
          result = [...result].sort((a, b) => (b.students_count || 0) - (a.students_count || 0));
          break;
        case 'rating':
          result = [...result].sort((a, b) => (b.rating || 0) - (a.rating || 0));
          break;
        case 'price_low':
          result = [...result].sort((a, b) => (a.price || 0) - (b.price || 0));
          break;
        case 'price_high':
          result = [...result].sort((a, b) => (b.price || 0) - (a.price || 0));
          break;
      }
    }

    return result;
  }, [courses, activeFilter, activeQuickFilters, inProgressCourses, completedCourses, activeFilterTags, appliedFilters]);

  // Categorized courses for sections
  const popularCourses = useMemo(() =>
    [...courses].sort((a, b) => (b.students_count || b.student_count || 0) - (a.students_count || a.student_count || 0)).slice(0, 10),
    [courses]
  );

  const newCourses = useMemo(() =>
    [...courses].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 10),
    [courses]
  );

  const freeCourses = useMemo(() =>
    courses.filter(c => c.price === 0 || c.price === null).slice(0, 10),
    [courses]
  );

  const tradingCourses = useMemo(() =>
    courses.filter(c => {
      const title = (c.title || '').toLowerCase();
      const description = (c.description || '').toLowerCase();
      return (
        c.category === 'trading' ||
        c.tags?.includes('trading') ||
        title.includes('trading') ||
        title.includes('giao dịch') ||
        title.includes('gem trading') ||
        description.includes('trading')
      );
    }).slice(0, 10),
    [courses]
  );

  // Get counts for tabs
  const getCounts = useMemo(() => ({
    all: courses.length,
    enrolled: inProgressCourses.length,
    completed: completedCourses.length,
  }), [courses.length, inProgressCourses.length, completedCourses.length]);

  // Memoize completed course IDs to prevent re-renders
  const completedCourseIds = useMemo(() =>
    completedCourses.map(c => c.id),
    [completedCourses]
  );

  const handleCoursePress = useCallback((course) => {
    // Check if course is locked
    if (isCourseLocked(course)) {
      // Show upgrade popup for locked course
      onFeatureLocked(TIER_TYPES.COURSE, course.title, 'course_list');
    }
    // Navigate to detail regardless (detail screen will handle lock state)
    navigation.navigate('CourseDetail', { courseId: course.id });
  }, [isCourseLocked, onFeatureLocked, TIER_TYPES.COURSE, navigation]);

  const toggleQuickFilter = (filterId) => {
    setActiveQuickFilters(prev =>
      prev.includes(filterId)
        ? prev.filter(f => f !== filterId)
        : [...prev, filterId]
    );
  };

  const handleApplyFilters = (filters) => {
    setAppliedFilters(filters);
    // Apply filter logic here
    console.log('[CoursesScreen] Applied filters:', filters);
  };

  // Enhanced refresh handler - resets section caches and refreshes data
  const handleRefresh = useCallback(() => {
    // Reset module-level caches so sections will re-fetch on next render
    resetAllCourseSectionCaches();
    // Trigger the main course refresh from context
    refresh();
  }, [refresh]);

  // Get distributed sponsor banners
  const getBannerForPosition = (position) => {
    if (sponsorBanners.length === 0) return null;
    const index = position % sponsorBanners.length;
    return sponsorBanners[index];
  };

  const renderFilterTabs = () => (
    <View style={styles.filterContainer}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterContent}
      >
        {FILTER_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeFilter === tab.id;
          const count = getCounts[tab.id];

          return (
            <TouchableOpacity
              key={tab.id}
              style={[styles.filterTab, isActive && styles.filterTabActive]}
              onPress={() => setActiveFilter(tab.id)}
              activeOpacity={0.7}
            >
              <Icon
                size={18}
                color={isActive ? COLORS.gold : COLORS.textMuted}
              />
              <Text style={[styles.filterLabel, isActive && styles.filterLabelActive]}>
                {tab.label}
              </Text>
              {count > 0 && (
                <View style={[styles.filterBadge, isActive && styles.filterBadgeActive]}>
                  <Text style={[styles.filterBadgeText, isActive && styles.filterBadgeTextActive]}>
                    {count}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );

  const renderQuickFilters = () => (
    <View style={styles.quickFiltersContainer}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.quickFiltersContent}
      >
        {/* Filter button */}
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilterSheet(true)}
          activeOpacity={0.7}
        >
          <SlidersHorizontal size={16} color={COLORS.gold} />
          <Text style={styles.filterButtonText}>Bộ lọc</Text>
        </TouchableOpacity>

        {/* Quick filter pills */}
        {QUICK_FILTERS.map((filter) => {
          const isActive = activeQuickFilters.includes(filter.id);
          return (
            <TouchableOpacity
              key={filter.id}
              style={[styles.quickFilterPill, isActive && styles.quickFilterPillActive]}
              onPress={() => toggleQuickFilter(filter.id)}
              activeOpacity={0.7}
            >
              <Text style={[styles.quickFilterText, isActive && styles.quickFilterTextActive]}>
                {filter.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );

  // Memoized render function for better scroll performance
  const renderCourseCard = useCallback(({ item, index }) => {
    const enrolled = isEnrolled(item.id);
    const progress = getProgress(item.id);
    const locked = isCourseLocked(item);

    return (
      <CourseCard
        course={item}
        onPress={() => handleCoursePress(item)}
        progress={progress}
        isEnrolled={enrolled}
        isLocked={locked}
        index={index}
        style={styles.courseCard}
      />
    );
  }, [isEnrolled, getProgress, isCourseLocked, handleCoursePress]);

  // Memoized key extractor for FlatList
  const keyExtractor = useCallback((item) => item.id, []);

  // Item layout for better scroll performance (fixed height items)
  const getItemLayout = useCallback((data, index) => ({
    length: 260, // Approximate height of CourseCard
    offset: 260 * index,
    index,
  }), []);

  const renderEmptyState = () => {
    const getMessage = () => {
      switch (activeFilter) {
        case 'enrolled':
          return {
            icon: '📚',
            title: 'Chưa đăng ký khóa học nào',
            subtitle: 'Khám phá các khóa học và bắt đầu học ngay!',
          };
        case 'completed':
          return {
            icon: '🎓',
            title: 'Chưa hoàn thành khóa học nào',
            subtitle: 'Tiếp tục học để hoàn thành khóa học đầu tiên!',
          };
        default:
          return {
            icon: '📖',
            title: 'Chưa có khóa học',
            subtitle: 'Khóa học sẽ được cập nhật sớm',
          };
      }
    };

    const message = getMessage();

    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyIcon}>{message.icon}</Text>
        <Text style={styles.emptyTitle}>{message.title}</Text>
        <Text style={styles.emptySubtitle}>{message.subtitle}</Text>
      </View>
    );
  };

  // Clear tag filter
  const handleClearTagFilter = useCallback(() => {
    setActiveFilterTags(null);
    setPageTitleOverride(null);
    // Reset navigation params
    navigation.setParams({ filterTags: null, title: null, categoryId: null });
  }, [navigation]);

  // Handle category card press - update filter directly without navigation
  const handleCategoryPress = useCallback((category) => {
    console.log('[CoursesScreen] Category pressed:', category.name, category.filterTags);
    setActiveFilterTags(category.filterTags);
    setPageTitleOverride(category.name);
    // Reset other filters when selecting category
    setActiveFilter('all');
    setActiveQuickFilters([]);
    setAppliedFilters({});
  }, []);

  // Render list header with all sections - MEMOIZED to prevent re-renders
  const renderListHeader = useCallback(() => {
    return (
      <>
        {/* Tag Filter Header - show when filtering by category tags */}
        {activeFilterTags && activeFilterTags.length > 0 && (
          <View style={styles.collectionHeader}>
            <View style={styles.collectionInfo}>
              <Text style={styles.collectionTitle}>{pageTitleOverride || pageTitle || 'Khóa học'}</Text>
              <Text style={styles.collectionCount}>
                {filteredCourses.length} khóa học
              </Text>
            </View>
            <TouchableOpacity
              style={styles.clearCollectionButton}
              onPress={handleClearTagFilter}
            >
              <Text style={styles.clearCollectionText}>Xóa bộ lọc</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Filter Tabs - Moved to top */}
        <Animated.View style={{ opacity: filterFadeAnim }}>
          {renderFilterTabs()}
        </Animated.View>

        {/* Quick Filters - Only show on "All" tab and when no category filter active */}
        {activeFilter === 'all' && !activeFilterTags && renderQuickFilters()}

        {/* === PROMOTIONAL SECTIONS - Only show on "All" tab and when no category filter active === */}
        {activeFilter === 'all' && !activeFilterTags && (
          <>
            {/* Promo Bar - shows if promo_bar_config has active data */}
            <PromoBar style={styles.promoBar} />

            {/* Hero Banner Carousel - shows if promo_banners has active data */}
            <HeroBannerCarousel userTier={profile?.tier} style={styles.heroBanner} />

            {/* Category Grid with Header - always shows (hardcoded categories) */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Danh mục khóa học</Text>
              <CourseCategoryGrid
                style={styles.categoryGrid}
                onCategoryPress={handleCategoryPress}
              />
            </View>

            {/* Flash Sale Section - shows if course_flash_sales has active data */}
            <CourseFlashSaleSection style={styles.flashSale} />

            {/* Sponsor Banner Position 1 */}
            {sponsorBanners.length > 0 && (
              <SponsorBannerSection
                screenName="courses"
                navigation={navigation}
                maxBanners={1}
              />
            )}

            {/* Popular Courses Section */}
            {popularCourses.length > 0 && (
              <CourseSection
                title="Khóa học phổ biến"
                subtitle="Được học viên yêu thích nhất"
                courses={popularCourses}
                userProgress={courseProgress}
                enrolledCourses={enrolledCourseIds}
                completedCourses={completedCourseIds}
                onCoursePress={handleCoursePress}
                seeAllRoute="CourseList"
                seeAllParams={{ filter: 'popular', title: 'Khóa học phổ biến' }}
                style={styles.courseSection}
              />
            )}

            {/* Highlighted/Featured Course Section */}
            <HighlightedCourseSection style={styles.highlightedSection} />

            {/* Sponsor Banner Position 2 */}
            {sponsorBanners.length > 1 && (
              <SponsorBannerSection
                screenName="courses"
                navigation={navigation}
                maxBanners={1}
              />
            )}

            {/* New Courses Section */}
            {newCourses.length > 0 && (
              <CourseSection
                title="Khóa học mới"
                subtitle="Vừa ra mắt gần đây"
                courses={newCourses}
                userProgress={courseProgress}
                enrolledCourses={enrolledCourseIds}
                completedCourses={completedCourseIds}
                onCoursePress={handleCoursePress}
                seeAllRoute="CourseList"
                seeAllParams={{ filter: 'new', title: 'Khóa học mới' }}
                style={styles.courseSection}
              />
            )}

            {/* Trading Courses Section */}
            {tradingCourses.length > 0 && (
              <CourseSection
                title="Khóa học Trading"
                subtitle="Học giao dịch từ chuyên gia"
                courses={tradingCourses}
                userProgress={courseProgress}
                enrolledCourses={enrolledCourseIds}
                completedCourses={completedCourseIds}
                onCoursePress={handleCoursePress}
                seeAllRoute="CourseList"
                seeAllParams={{ category: 'trading', title: 'Trading' }}
                style={styles.courseSection}
              />
            )}

            {/* Free Courses Section */}
            {freeCourses.length > 0 && (
              <CourseSection
                title="Khóa học miễn phí"
                subtitle="Học không tốn phí"
                courses={freeCourses}
                userProgress={courseProgress}
                enrolledCourses={enrolledCourseIds}
                completedCourses={completedCourseIds}
                onCoursePress={handleCoursePress}
                seeAllRoute="CourseList"
                seeAllParams={{ filter: 'free', title: 'Khóa học miễn phí' }}
                style={styles.courseSection}
              />
            )}
          </>
        )}

      {/* Section Header: All Courses */}
      <View style={styles.allCoursesHeader}>
        <Text style={styles.allCoursesTitle}>
          {activeFilter === 'enrolled' ? 'Khóa học đang học' :
           activeFilter === 'completed' ? 'Khóa học hoàn thành' : 'Tất cả khóa học'}
        </Text>
        <Text style={styles.allCoursesSubtitle}>
          {filteredCourses.length} khóa học
        </Text>
      </View>
    </>
    );
  }, [
    activeFilterTags,
    activeFilter,
    pageTitle,
    pageTitleOverride,
    filteredCourses.length,
    filterFadeAnim,
    sponsorBanners,
    profile,
    popularCourses,
    newCourses,
    tradingCourses,
    freeCourses,
    courseProgress,
    enrolledCourseIds,
    completedCourseIds,
    handleCoursePress,
    handleCategoryPress,
    navigation,
    handleClearTagFilter,
  ]);

  if (loading) {
    return (
      <LinearGradient
        colors={GRADIENTS.background}
        locations={GRADIENTS.backgroundLocations}
        style={styles.loadingContainer}
      >
        <ActivityIndicator size="large" color={COLORS.gold} />
        <Text style={styles.loadingText}>Đang tải khóa học...</Text>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={GRADIENTS.background}
      locations={GRADIENTS.backgroundLocations}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Animated Header with Auto-Hide */}
        <Animated.View
          style={[
            styles.header,
            {
              opacity: headerFadeAnim,
              transform: [
                { translateY: Animated.add(headerSlideAnim, headerTranslateY) }
              ],
            },
          ]}
        >
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => {
              // If we're in a filtered view (category selected), clear filter first
              if (activeFilterTags || pageTitleOverride) {
                setActiveFilterTags(null);
                setPageTitleOverride(null);
                setActiveFilter('all');
                setActiveQuickFilters([]);
                setAppliedFilters({});
                navigation.setParams({ filterTags: null, title: null, categoryId: null });
              } else {
                // Go back to previous screen
                navigation.goBack();
              }
            }}
          >
            <ArrowLeft size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{pageTitleOverride || pageTitle || 'Khóa Học'}</Text>
          <TouchableOpacity
            style={styles.searchBtn}
            onPress={() => navigation.navigate('CourseSearch')}
          >
            <Search size={22} color={COLORS.textPrimary} />
          </TouchableOpacity>
        </Animated.View>

        {/* Course List with Header Components - OPTIMIZED */}
        <Animated.FlatList
          data={filteredCourses}
          renderItem={renderCourseCard}
          keyExtractor={keyExtractor}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: 120 } // Space for bottom tab bar
          ]}
          showsVerticalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          ListEmptyComponent={renderEmptyState}
          ListHeaderComponent={renderListHeader}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={COLORS.gold}
              colors={[COLORS.gold]}
            />
          }
          // Performance optimizations
          removeClippedSubviews={true}
          maxToRenderPerBatch={5}
          windowSize={5}
          initialNumToRender={4}
          updateCellsBatchingPeriod={50}
          getItemLayout={getItemLayout}
        />

        {/* Filter Sheet Modal */}
        <CourseFilterSheet
          visible={showFilterSheet}
          onClose={() => setShowFilterSheet(false)}
          initialFilters={appliedFilters}
          onApply={handleApplyFilters}
        />
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textSecondary,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    backgroundColor: 'rgba(15, 16, 48, 0.98)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    zIndex: 100,
    elevation: 5,
  },
  backBtn: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.gold,
  },
  searchBtn: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Promo Bar
  promoBar: {
    marginTop: 0,
  },

  // Hero Banner
  heroBanner: {
    marginTop: SPACING.md,
  },

  // Section Container
  sectionContainer: {
    marginTop: SPACING.lg,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },

  // Category Grid
  categoryGrid: {
    marginTop: 0,
  },

  // Flash Sale
  flashSale: {
    marginTop: SPACING.md,
  },

  // Course Sections
  courseSection: {
    marginTop: SPACING.lg,
  },
  highlightedSection: {
    marginTop: SPACING.md,
  },

  // All Courses Header
  allCoursesHeader: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.sm,
  },
  allCoursesTitle: {
    fontSize: TYPOGRAPHY.fontSize.xxxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
  allCoursesSubtitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textMuted,
    marginTop: SPACING.xxs,
  },

  // Filter Tabs
  filterContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  filterContent: {
    paddingHorizontal: SPACING.md,
    gap: SPACING.sm,
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    gap: SPACING.xs,
    marginRight: SPACING.sm,
  },
  filterTabActive: {
    backgroundColor: 'rgba(255, 189, 89, 0.2)',
    borderWidth: 1,
    borderColor: COLORS.gold,
  },
  filterLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.textMuted,
  },
  filterLabelActive: {
    color: COLORS.gold,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  filterBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 20,
    alignItems: 'center',
  },
  filterBadgeActive: {
    backgroundColor: COLORS.gold,
  },
  filterBadgeText: {
    fontSize: 11,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textMuted,
  },
  filterBadgeTextActive: {
    color: '#112250',
  },

  // Quick Filters
  quickFiltersContainer: {
    paddingVertical: SPACING.sm,
  },
  quickFiltersContent: {
    paddingHorizontal: SPACING.md,
    gap: SPACING.sm,
    flexDirection: 'row',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: 'rgba(255, 189, 89, 0.15)',
    borderWidth: 1,
    borderColor: COLORS.gold,
    gap: SPACING.xs,
    marginRight: SPACING.sm,
  },
  filterButtonText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.gold,
  },
  quickFilterPill: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginRight: SPACING.sm,
  },
  quickFilterPillActive: {
    backgroundColor: 'rgba(255, 189, 89, 0.2)',
    borderWidth: 1,
    borderColor: COLORS.gold,
  },
  quickFilterText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
  },
  quickFilterTextActive: {
    color: COLORS.gold,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },

  // Collection Header (when filtering by category card)
  collectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: 'rgba(106, 91, 255, 0.1)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(106, 91, 255, 0.2)',
    marginBottom: SPACING.sm,
  },
  collectionInfo: {
    flex: 1,
  },
  collectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
  collectionCount: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  clearCollectionButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  clearCollectionText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gold,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },

  // List
  listContent: {
    paddingTop: 0,
    // Note: No paddingHorizontal here - each section manages its own padding
    // This prevents double-padding on horizontal scrolling sections
  },
  courseCard: {
    marginBottom: SPACING.md,
    marginHorizontal: SPACING.lg, // Match section padding (16px)
  },

  // Empty State
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
    paddingHorizontal: SPACING.xl,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: SPACING.md,
  },
  emptyTitle: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});

export default CoursesScreen;
