/**
 * CourseContext - Global Course State Management
 * Real-time sync between Web and Mobile via Supabase
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from './AuthContext';
import { courseService } from '../services/courseService';
import { enrollmentService } from '../services/enrollmentService';
import { progressService } from '../services/progressService';
import { useEnrollmentRealtime } from '../hooks/useRealtime';

const CourseContext = createContext(null);

export function CourseProvider({ children }) {
  const { user } = useAuth();

  // User's enrolled courses
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [isLoadingEnrolled, setIsLoadingEnrolled] = useState(false);

  // Teacher's courses (if user is instructor)
  const [teacherCourses, setTeacherCourses] = useState([]);
  const [isLoadingTeacher, setIsLoadingTeacher] = useState(false);

  // Current course being viewed/edited
  const [currentCourse, setCurrentCourse] = useState(null);
  const [currentProgress, setCurrentProgress] = useState(null);

  // Error state
  const [error, setError] = useState(null);

  // Real-time subscription for enrollments
  useEnrollmentRealtime(user?.id, (payload) => {
    const { eventType, new: newEnrollment, old: oldEnrollment } = payload;

    switch (eventType) {
      case 'INSERT':
        // New enrollment - add to list
        setEnrolledCourses(prev => {
          if (prev.some(e => e.id === newEnrollment.id)) return prev;
          return [...prev, newEnrollment];
        });
        break;

      case 'UPDATE':
        // Enrollment updated - update in list
        setEnrolledCourses(prev =>
          prev.map(e => e.id === newEnrollment.id ? { ...e, ...newEnrollment } : e)
        );
        break;

      case 'DELETE':
        // Unenrolled - remove from list
        setEnrolledCourses(prev =>
          prev.filter(e => e.id !== oldEnrollment.id)
        );
        break;
    }
  });

  // Fetch user's enrolled courses
  const fetchEnrolledCourses = useCallback(async () => {
    if (!user?.id) {
      setEnrolledCourses([]);
      return;
    }

    setIsLoadingEnrolled(true);
    setError(null);

    try {
      const courses = await enrollmentService.getUserEnrollments(user.id);
      setEnrolledCourses(courses || []);
    } catch (err) {
      console.error('[CourseContext] Error fetching enrolled courses:', err);
      setError('Không thể tải khóa học đã đăng ký');
    } finally {
      setIsLoadingEnrolled(false);
    }
  }, [user?.id]);

  // Fetch teacher's courses
  const fetchTeacherCourses = useCallback(async () => {
    if (!user?.id) {
      setTeacherCourses([]);
      return;
    }

    setIsLoadingTeacher(true);
    setError(null);

    try {
      const courses = await courseService.getAllCourses(user.id);
      setTeacherCourses(courses || []);
    } catch (err) {
      console.error('[CourseContext] Error fetching teacher courses:', err);
      setError('Không thể tải khóa học của bạn');
    } finally {
      setIsLoadingTeacher(false);
    }
  }, [user?.id]);

  // Load course detail
  const loadCourse = useCallback(async (courseId) => {
    if (!courseId) {
      setCurrentCourse(null);
      setCurrentProgress(null);
      return null;
    }

    try {
      const course = await courseService.getCourseDetail(courseId, user?.id);
      setCurrentCourse(course);

      // Load progress if enrolled
      if (user?.id && course?.enrollment) {
        const progress = await progressService.getCourseProgress(user.id, courseId);
        setCurrentProgress(progress);
      }

      return course;
    } catch (err) {
      console.error('[CourseContext] Error loading course:', err);
      setError('Không thể tải khóa học');
      return null;
    }
  }, [user?.id]);

  // Enroll in course
  const enrollInCourse = useCallback(async (courseId) => {
    if (!user?.id) {
      throw new Error('Bạn cần đăng nhập để đăng ký khóa học');
    }

    try {
      const result = await enrollmentService.enroll(user.id, courseId);

      if (result.success) {
        // Refresh enrolled courses
        await fetchEnrolledCourses();

        // Refresh current course if it's the one being enrolled
        if (currentCourse?.id === courseId) {
          await loadCourse(courseId);
        }
      }

      return result;
    } catch (err) {
      console.error('[CourseContext] Error enrolling:', err);
      throw err;
    }
  }, [user?.id, currentCourse?.id, fetchEnrolledCourses, loadCourse]);

  // Unenroll from course
  const unenrollFromCourse = useCallback(async (enrollmentId, courseId) => {
    if (!user?.id) {
      throw new Error('Bạn cần đăng nhập');
    }

    try {
      await enrollmentService.unenroll(enrollmentId);

      // Refresh enrolled courses
      await fetchEnrolledCourses();

      // Refresh current course if it's the one being unenrolled
      if (currentCourse?.id === courseId) {
        await loadCourse(courseId);
      }
    } catch (err) {
      console.error('[CourseContext] Error unenrolling:', err);
      throw err;
    }
  }, [user?.id, currentCourse?.id, fetchEnrolledCourses, loadCourse]);

  // Mark lesson as completed
  const markLessonComplete = useCallback(async (lessonId) => {
    if (!user?.id || !currentCourse?.enrollment?.id) {
      return;
    }

    try {
      await progressService.markLessonComplete(
        currentCourse.enrollment.id,
        lessonId
      );

      // Refresh progress
      const progress = await progressService.getCourseProgress(user.id, currentCourse.id);
      setCurrentProgress(progress);

      // Update enrolled courses list with new progress
      setEnrolledCourses(prev =>
        prev.map(e =>
          e.course_id === currentCourse.id
            ? { ...e, progress: progress?.completionPercentage || e.progress }
            : e
        )
      );
    } catch (err) {
      console.error('[CourseContext] Error marking lesson complete:', err);
    }
  }, [user?.id, currentCourse]);

  // Check if user is enrolled in a specific course
  const isEnrolled = useCallback((courseId) => {
    return enrolledCourses.some(e => e.course_id === courseId);
  }, [enrolledCourses]);

  // Get enrollment for a course
  const getEnrollment = useCallback((courseId) => {
    return enrolledCourses.find(e => e.course_id === courseId);
  }, [enrolledCourses]);

  // Initial load
  useEffect(() => {
    if (user?.id) {
      fetchEnrolledCourses();
      fetchTeacherCourses();
    } else {
      setEnrolledCourses([]);
      setTeacherCourses([]);
      setCurrentCourse(null);
      setCurrentProgress(null);
    }
  }, [user?.id, fetchEnrolledCourses, fetchTeacherCourses]);

  // Clear current course on unmount
  const clearCurrentCourse = useCallback(() => {
    setCurrentCourse(null);
    setCurrentProgress(null);
  }, []);

  // Context value
  const value = useMemo(() => ({
    // Enrolled courses
    enrolledCourses,
    isLoadingEnrolled,

    // Teacher courses
    teacherCourses,
    isLoadingTeacher,

    // Current course
    currentCourse,
    currentProgress,

    // Error
    error,
    clearError: () => setError(null),

    // Actions
    fetchEnrolledCourses,
    fetchTeacherCourses,
    loadCourse,
    clearCurrentCourse,
    enrollInCourse,
    unenrollFromCourse,
    markLessonComplete,

    // Helpers
    isEnrolled,
    getEnrollment,
  }), [
    enrolledCourses,
    isLoadingEnrolled,
    teacherCourses,
    isLoadingTeacher,
    currentCourse,
    currentProgress,
    error,
    fetchEnrolledCourses,
    fetchTeacherCourses,
    loadCourse,
    clearCurrentCourse,
    enrollInCourse,
    unenrollFromCourse,
    markLessonComplete,
    isEnrolled,
    getEnrollment,
  ]);

  return (
    <CourseContext.Provider value={value}>
      {children}
    </CourseContext.Provider>
  );
}

export function useCourse() {
  const context = useContext(CourseContext);
  if (!context) {
    throw new Error('useCourse must be used within a CourseProvider');
  }
  return context;
}

export default CourseContext;
