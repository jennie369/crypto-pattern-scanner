/**
 * Gemral - Course Context
 * Global course state management with AsyncStorage persistence
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { courseService } from '../services/courseService';
import { useAuth } from './AuthContext';

const CourseContext = createContext(null);

const ENROLLMENTS_KEY = '@gem_enrollments';
const PROGRESS_KEY = '@gem_course_progress';
const COMPLETED_LESSONS_KEY = '@gem_completed_lessons';

export const CourseProvider = ({ children }) => {
  const { user, profile } = useAuth();

  // State
  const [courses, setCourses] = useState([]);
  const [enrolledCourseIds, setEnrolledCourseIds] = useState([]);
  const [courseProgress, setCourseProgress] = useState({}); // { courseId: percent }
  const [completedLessons, setCompletedLessons] = useState({}); // { courseId: [lessonIds] }
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Computed values
  const enrolledCourses = courses.filter(c => enrolledCourseIds.includes(c.id));
  const completedCourses = courses.filter(c => (courseProgress[c.id] || 0) >= 100);
  const inProgressCourses = enrolledCourses.filter(c => {
    const progress = courseProgress[c.id] || 0;
    return progress > 0 && progress < 100;
  });

  // Load data on mount
  useEffect(() => {
    if (user?.id) {
      loadAllData();
    } else {
      setLoading(false);
    }
  }, [user?.id]);

  // Load all data from service and storage
  const loadAllData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Load courses from service
      const coursesData = await courseService.getCourses();
      setCourses(coursesData);

      // Load enrollments from storage
      const storedEnrollments = await AsyncStorage.getItem(ENROLLMENTS_KEY);
      if (storedEnrollments) {
        setEnrolledCourseIds(JSON.parse(storedEnrollments));
      }

      // Load progress from storage
      const storedProgress = await AsyncStorage.getItem(PROGRESS_KEY);
      if (storedProgress) {
        setCourseProgress(JSON.parse(storedProgress));
      }

      // Load completed lessons from storage
      const storedCompleted = await AsyncStorage.getItem(COMPLETED_LESSONS_KEY);
      if (storedCompleted) {
        setCompletedLessons(JSON.parse(storedCompleted));
      }
    } catch (err) {
      console.error('[CourseContext] Error loading data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Refresh data
  const refresh = useCallback(async () => {
    setRefreshing(true);
    await loadAllData();
    setRefreshing(false);
  }, [user?.id]);

  // Enroll in a course
  const enrollInCourse = useCallback(async (courseId) => {
    try {
      // Check if already enrolled
      if (enrolledCourseIds.includes(courseId)) {
        return { success: true, alreadyEnrolled: true };
      }

      // Check tier access
      const course = courses.find(c => c.id === courseId);
      if (course && !canAccessCourse(course)) {
        return {
          success: false,
          error: 'Upgrade required',
          requiredTier: course.tier_required,
        };
      }

      // Add to enrollments
      const newEnrollments = [...enrolledCourseIds, courseId];
      setEnrolledCourseIds(newEnrollments);

      // Initialize progress
      const newProgress = { ...courseProgress, [courseId]: 0 };
      setCourseProgress(newProgress);

      // Initialize completed lessons
      const newCompleted = { ...completedLessons, [courseId]: [] };
      setCompletedLessons(newCompleted);

      // Save to storage
      await Promise.all([
        AsyncStorage.setItem(ENROLLMENTS_KEY, JSON.stringify(newEnrollments)),
        AsyncStorage.setItem(PROGRESS_KEY, JSON.stringify(newProgress)),
        AsyncStorage.setItem(COMPLETED_LESSONS_KEY, JSON.stringify(newCompleted)),
      ]);

      // Also update service (for sync when API is ready)
      await courseService.enrollInCourse(user?.id, courseId);

      return { success: true };
    } catch (err) {
      console.error('[CourseContext] Enroll error:', err);
      return { success: false, error: err.message };
    }
  }, [enrolledCourseIds, courses, courseProgress, completedLessons, user?.id]);

  // Mark lesson as complete
  const completeLesson = useCallback(async (courseId, lessonId) => {
    try {
      const currentCompleted = completedLessons[courseId] || [];

      // Check if already completed
      if (currentCompleted.includes(lessonId)) {
        return { success: true, alreadyCompleted: true };
      }

      // Add to completed lessons
      const newLessonsList = [...currentCompleted, lessonId];
      const newCompleted = { ...completedLessons, [courseId]: newLessonsList };
      setCompletedLessons(newCompleted);

      // Calculate new progress
      const course = courses.find(c => c.id === courseId);
      const totalLessons = course?.modules?.reduce(
        (sum, m) => sum + (m.lessons?.length || 0), 0
      ) || 1;
      const newPercent = Math.round((newLessonsList.length / totalLessons) * 100);

      const newProgress = { ...courseProgress, [courseId]: newPercent };
      setCourseProgress(newProgress);

      // Save to storage
      await Promise.all([
        AsyncStorage.setItem(COMPLETED_LESSONS_KEY, JSON.stringify(newCompleted)),
        AsyncStorage.setItem(PROGRESS_KEY, JSON.stringify(newProgress)),
      ]);

      // Also update service
      await courseService.markLessonComplete(user?.id, courseId, lessonId);

      return { success: true, progress: newPercent };
    } catch (err) {
      console.error('[CourseContext] Complete lesson error:', err);
      return { success: false, error: err.message };
    }
  }, [completedLessons, courseProgress, courses, user?.id]);

  // Check if user can access a course based on tier
  const canAccessCourse = useCallback((course) => {
    const userTier = profile?.scanner_tier || 'FREE';
    const tierOrder = ['FREE', 'TIER1', 'TIER2', 'TIER3'];
    const userTierIndex = tierOrder.indexOf(userTier);
    const courseTierIndex = tierOrder.indexOf(course?.tier_required || 'FREE');
    return courseTierIndex <= userTierIndex;
  }, [profile?.scanner_tier]);

  // Check if course is locked
  const isCourseLocked = useCallback((course) => {
    return !canAccessCourse(course);
  }, [canAccessCourse]);

  // Check if enrolled in a course
  const isEnrolled = useCallback((courseId) => {
    return enrolledCourseIds.includes(courseId);
  }, [enrolledCourseIds]);

  // Get progress for a course
  const getProgress = useCallback((courseId) => {
    return courseProgress[courseId] || 0;
  }, [courseProgress]);

  // Get completed lessons for a course
  const getCompletedLessons = useCallback((courseId) => {
    return completedLessons[courseId] || [];
  }, [completedLessons]);

  // Check if a lesson is completed
  const isLessonCompleted = useCallback((courseId, lessonId) => {
    const completed = completedLessons[courseId] || [];
    return completed.includes(lessonId);
  }, [completedLessons]);

  // Get course by ID
  const getCourseById = useCallback((courseId) => {
    return courses.find(c => c.id === courseId);
  }, [courses]);

  // Get next incomplete lesson for a course
  const getNextLesson = useCallback((courseId) => {
    const course = courses.find(c => c.id === courseId);
    if (!course?.modules) return null;

    const completed = completedLessons[courseId] || [];

    for (const module of course.modules) {
      for (const lesson of module.lessons || []) {
        if (!completed.includes(lesson.id)) {
          return lesson;
        }
      }
    }

    // All completed, return first lesson for review
    return course.modules[0]?.lessons?.[0] || null;
  }, [courses, completedLessons]);

  // Reset progress for a course (for testing)
  const resetCourseProgress = useCallback(async (courseId) => {
    try {
      const newProgress = { ...courseProgress, [courseId]: 0 };
      const newCompleted = { ...completedLessons, [courseId]: [] };

      setCourseProgress(newProgress);
      setCompletedLessons(newCompleted);

      await Promise.all([
        AsyncStorage.setItem(PROGRESS_KEY, JSON.stringify(newProgress)),
        AsyncStorage.setItem(COMPLETED_LESSONS_KEY, JSON.stringify(newCompleted)),
      ]);

      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, [courseProgress, completedLessons]);

  // Unenroll from a course
  const unenrollFromCourse = useCallback(async (courseId) => {
    try {
      const newEnrollments = enrolledCourseIds.filter(id => id !== courseId);
      setEnrolledCourseIds(newEnrollments);

      // Keep progress data in case they re-enroll
      await AsyncStorage.setItem(ENROLLMENTS_KEY, JSON.stringify(newEnrollments));

      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, [enrolledCourseIds]);

  const value = {
    // State
    courses,
    enrolledCourses,
    completedCourses,
    inProgressCourses,
    enrolledCourseIds,
    courseProgress,
    completedLessons,
    loading,
    refreshing,
    error,

    // Actions
    refresh,
    enrollInCourse,
    unenrollFromCourse,
    completeLesson,
    resetCourseProgress,

    // Getters
    getCourseById,
    isEnrolled,
    isCourseLocked,
    canAccessCourse,
    getProgress,
    getCompletedLessons,
    isLessonCompleted,
    getNextLesson,
  };

  return (
    <CourseContext.Provider value={value}>
      {children}
    </CourseContext.Provider>
  );
};

export const useCourse = () => {
  const context = useContext(CourseContext);
  if (!context) {
    throw new Error('useCourse must be used within a CourseProvider');
  }
  return context;
};

export default CourseContext;
