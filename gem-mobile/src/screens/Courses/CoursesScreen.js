/**
 * Gemral - Courses Screen (Main)
 * Course catalog with filter tabs and progress tracking
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
} from 'lucide-react-native';
import { CourseCard } from './components';
// useSwipeNavigation removed - was blocking touch events on Android
import { useCourse } from '../../contexts/CourseContext';
import { useAuth } from '../../contexts/AuthContext';
import { useTabBar } from '../../contexts/TabBarContext';
import { COLORS, SPACING, TYPOGRAPHY, GRADIENTS } from '../../utils/tokens';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Filter tabs
const FILTER_TABS = [
  { id: 'all', label: 'Tất cả', icon: BookOpen },
  { id: 'enrolled', label: 'Đang học', icon: GraduationCap },
  { id: 'completed', label: 'Hoàn thành', icon: CheckCircle },
];

const CoursesScreen = ({ navigation, route }) => {
  const { profile } = useAuth();
  const { handleScroll } = useTabBar();

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

  // Filter state - check route params for initial filter
  const initialFilter = route?.params?.filter || 'all';
  const [activeFilter, setActiveFilter] = useState(initialFilter);

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

  // Swipe navigation removed - was blocking touch events on Android
  // Users can tap filter tabs directly to change filters

  // Filter courses based on active tab
  const filteredCourses = useMemo(() => {
    if (activeFilter === 'all') {
      return courses;
    }

    if (activeFilter === 'enrolled') {
      return inProgressCourses;
    }

    if (activeFilter === 'completed') {
      return completedCourses;
    }

    return courses;
  }, [courses, activeFilter, inProgressCourses, completedCourses]);

  // Get counts for tabs
  const getCounts = useMemo(() => ({
    all: courses.length,
    enrolled: inProgressCourses.length,
    completed: completedCourses.length,
  }), [courses.length, inProgressCourses.length, completedCourses.length]);

  const handleCoursePress = (course) => {
    navigation.navigate('CourseDetail', { courseId: course.id });
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

  const renderCourseCard = ({ item, index }) => {
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
  };

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
        {/* Animated Header */}
        <Animated.View
          style={[
            styles.header,
            {
              opacity: headerFadeAnim,
              transform: [{ translateY: headerSlideAnim }],
            },
          ]}
        >
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
          >
            <ArrowLeft size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Khóa Học</Text>
          <TouchableOpacity
            style={styles.searchBtn}
            onPress={() => navigation.navigate('CourseSearch')}
          >
            <Search size={22} color={COLORS.textPrimary} />
          </TouchableOpacity>
        </Animated.View>

        {/* Animated Filter Tabs */}
        <Animated.View style={{ opacity: filterFadeAnim }}>
          {renderFilterTabs()}
        </Animated.View>

        {/* Course List */}
        <FlatList
          data={filteredCourses}
          renderItem={renderCourseCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          ListEmptyComponent={renderEmptyState}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={refresh}
              tintColor={COLORS.gold}
              colors={[COLORS.gold]}
            />
          }
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
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
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

  // List
  listContent: {
    padding: SPACING.md,
    paddingBottom: 120,
  },
  courseCard: {
    marginBottom: SPACING.md,
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
