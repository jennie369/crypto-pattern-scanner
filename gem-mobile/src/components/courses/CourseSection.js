/**
 * GEM Academy - Course Section
 * Horizontal scrolling section with title and "See all" button
 */

import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../../utils/tokens';
import CourseCardVertical from './CourseCardVertical';

const CourseSection = ({
  title = 'Courses',
  subtitle,
  courses = [],
  userProgress = {}, // { courseId: progressPercent }
  enrolledCourses = [], // Array of enrolled course IDs
  completedCourses = [], // Array of completed course IDs
  loading = false,
  onSeeAll,
  onCoursePress,
  seeAllRoute = null,
  seeAllParams = {},
  emptyMessage = 'Chưa có khóa học nào',
  showEmpty = true,
  maxItems = 10,
  compact = false,
  style = {},
}) => {
  const navigation = useNavigation();

  const handleSeeAll = () => {
    if (onSeeAll) {
      onSeeAll();
    } else if (seeAllRoute) {
      navigation.navigate(seeAllRoute, seeAllParams);
    }
  };

  const handleCoursePress = (course) => {
    if (onCoursePress) {
      onCoursePress(course);
    } else {
      navigation.navigate('CourseDetail', { courseId: course.id });
    }
  };

  const renderCourse = ({ item: course }) => {
    const isEnrolled = enrolledCourses.includes(course.id);
    const isCompleted = completedCourses.includes(course.id);
    const progress = userProgress[course.id] || 0;

    return (
      <CourseCardVertical
        course={course}
        progress={progress}
        isEnrolled={isEnrolled}
        isCompleted={isCompleted}
        onPress={() => handleCoursePress(course)}
        compact={compact}
        style={styles.courseCard}
      />
    );
  };

  const renderEmpty = () => {
    if (!showEmpty) return null;

    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>{emptyMessage}</Text>
      </View>
    );
  };

  const displayCourses = courses.slice(0, maxItems);

  if (loading) {
    return (
      <View style={[styles.container, style]}>
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={COLORS.gold} />
        </View>
      </View>
    );
  }

  if (displayCourses.length === 0 && showEmpty) {
    return (
      <View style={[styles.container, style]}>
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
        </View>
        {renderEmpty()}
      </View>
    );
  }

  if (displayCourses.length === 0 && !showEmpty) {
    return null;
  }

  return (
    <View style={[styles.container, style]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{title}</Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>

        {(onSeeAll || seeAllRoute) && courses.length > maxItems && (
          <TouchableOpacity
            style={styles.seeAllButton}
            onPress={handleSeeAll}
            activeOpacity={0.7}
          >
            <Text style={styles.seeAllText}>Xem tất cả</Text>
            <ChevronRight size={16} color={COLORS.gold} />
          </TouchableOpacity>
        )}
      </View>

      {/* Course list */}
      <FlatList
        data={displayCourses}
        renderItem={renderCourse}
        keyExtractor={(item) => item.id?.toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: SPACING.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize.xxxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
    marginTop: SPACING.xxs,
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seeAllText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.gold,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    marginRight: SPACING.xxs,
  },
  listContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.sm,
  },
  separator: {
    width: SPACING.md,
  },
  courseCard: {
    // Additional card styling if needed
  },
  loadingContainer: {
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: SPACING.lg,
    backgroundColor: 'rgba(15, 16, 48, 0.5)',
    borderRadius: BORDER_RADIUS.lg,
  },
  emptyText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textMuted,
  },
});

export default CourseSection;
