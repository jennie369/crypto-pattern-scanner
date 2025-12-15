/**
 * GEM Mobile - Course Realtime Hooks
 * Real-time subscriptions for courses, modules, lessons, and progress
 */

import { useEffect, useRef, useCallback } from 'react';
import { supabase } from '../services/supabase';

/**
 * Generic realtime subscription hook
 */
export function useRealtimeSubscription(table, options = {}) {
  const { filter, event = '*', onInsert, onUpdate, onDelete, onChange, enabled = true } = options;
  const channelRef = useRef(null);

  useEffect(() => {
    if (!enabled) return;

    const channelName = `${table}-${filter || 'all'}-${Date.now()}`;

    const subscriptionConfig = {
      event,
      schema: 'public',
      table,
    };

    // Add filter if provided
    if (filter) {
      subscriptionConfig.filter = filter;
    }

    channelRef.current = supabase
      .channel(channelName)
      .on('postgres_changes', subscriptionConfig, (payload) => {
        console.log(`[Realtime] ${table} ${payload.eventType}:`, payload);

        // Call specific handlers
        if (payload.eventType === 'INSERT' && onInsert) {
          onInsert(payload.new, payload);
        } else if (payload.eventType === 'UPDATE' && onUpdate) {
          onUpdate(payload.new, payload.old, payload);
        } else if (payload.eventType === 'DELETE' && onDelete) {
          onDelete(payload.old, payload);
        }

        // Call generic onChange handler
        if (onChange) {
          onChange(payload);
        }
      })
      .subscribe((status) => {
        console.log(`[Realtime] ${table} subscription:`, status);
      });

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [table, filter, event, enabled]);

  return channelRef.current;
}

/**
 * Subscribe to all courses changes (for course list)
 */
export function useCoursesRealtime(callbacks = {}) {
  const { onCourseAdded, onCourseUpdated, onCourseDeleted, onAnyChange } = callbacks;

  return useRealtimeSubscription('courses', {
    filter: 'is_published=eq.true',
    onInsert: onCourseAdded,
    onUpdate: onCourseUpdated,
    onDelete: onCourseDeleted,
    onChange: onAnyChange,
  });
}

/**
 * Subscribe to a specific course's changes
 */
export function useCourseRealtime(courseId, callback) {
  return useRealtimeSubscription('courses', {
    filter: `id=eq.${courseId}`,
    onChange: callback,
    enabled: !!courseId,
  });
}

/**
 * Subscribe to modules of a specific course
 */
export function useModulesRealtime(courseId, callbacks = {}) {
  const { onModuleAdded, onModuleUpdated, onModuleDeleted, onAnyChange } = callbacks;

  return useRealtimeSubscription('course_modules', {
    filter: `course_id=eq.${courseId}`,
    onInsert: onModuleAdded,
    onUpdate: onModuleUpdated,
    onDelete: onModuleDeleted,
    onChange: onAnyChange,
    enabled: !!courseId,
  });
}

/**
 * Subscribe to lessons of a specific module
 */
export function useLessonsRealtime(moduleId, callbacks = {}) {
  const { onLessonAdded, onLessonUpdated, onLessonDeleted, onAnyChange } = callbacks;

  return useRealtimeSubscription('course_lessons', {
    filter: `module_id=eq.${moduleId}`,
    onInsert: onLessonAdded,
    onUpdate: onLessonUpdated,
    onDelete: onLessonDeleted,
    onChange: onAnyChange,
    enabled: !!moduleId,
  });
}

/**
 * Subscribe to all lessons of a course (via course_id in modules)
 * This requires a different approach since lessons don't have direct course_id
 */
export function useCourseLessonsRealtime(courseId, callback, enabled = true) {
  const channelRef = useRef(null);

  useEffect(() => {
    if (!enabled || !courseId) return;

    const channelName = `course-lessons-${courseId}-${Date.now()}`;

    // Subscribe to all lesson changes and filter in callback
    channelRef.current = supabase
      .channel(channelName)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'course_lessons',
      }, async (payload) => {
        // Check if this lesson belongs to our course
        const lessonData = payload.new || payload.old;
        if (lessonData?.module_id) {
          // Verify module belongs to course
          const { data: module } = await supabase
            .from('course_modules')
            .select('course_id')
            .eq('id', lessonData.module_id)
            .single();

          if (module?.course_id === courseId) {
            console.log(`[Realtime] Lesson change for course ${courseId}:`, payload);
            if (callback) callback(payload);
          }
        }
      })
      .subscribe();

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [courseId, enabled]);

  return channelRef.current;
}

/**
 * Subscribe to user's enrollments
 */
export function useEnrollmentsRealtime(userId, callbacks = {}) {
  const { onEnrolled, onUnenrolled, onProgressUpdated, onAnyChange } = callbacks;

  return useRealtimeSubscription('course_enrollments', {
    filter: `user_id=eq.${userId}`,
    onInsert: onEnrolled,
    onUpdate: onProgressUpdated,
    onDelete: onUnenrolled,
    onChange: onAnyChange,
    enabled: !!userId,
  });
}

/**
 * Subscribe to lesson progress for a user
 */
export function useLessonProgressRealtime(userId, courseId, callbacks = {}) {
  const { onProgressUpdated, onLessonCompleted, onAnyChange } = callbacks;

  const handleUpdate = useCallback((newData, oldData, payload) => {
    if (onProgressUpdated) onProgressUpdated(newData, oldData, payload);

    // Check if lesson was just completed
    if (newData?.status === 'completed' && oldData?.status !== 'completed') {
      if (onLessonCompleted) onLessonCompleted(newData, payload);
    }
  }, [onProgressUpdated, onLessonCompleted]);

  const filter = courseId
    ? `user_id=eq.${userId},course_id=eq.${courseId}`
    : `user_id=eq.${userId}`;

  return useRealtimeSubscription('lesson_progress', {
    filter,
    onUpdate: handleUpdate,
    onInsert: (data, payload) => {
      if (onAnyChange) onAnyChange(payload);
      if (data.status === 'completed' && onLessonCompleted) {
        onLessonCompleted(data, payload);
      }
    },
    onChange: onAnyChange,
    enabled: !!userId,
  });
}

/**
 * Subscribe to certificates for a user
 */
export function useCertificatesRealtime(userId, callback) {
  return useRealtimeSubscription('course_certificates', {
    filter: `user_id=eq.${userId}`,
    onChange: callback,
    enabled: !!userId,
  });
}

/**
 * Combined hook for full course sync
 * Subscribes to courses, modules, lessons for a specific course
 */
export function useFullCourseRealtime(courseId, callbacks = {}) {
  const { onCourseChange, onModuleChange, onLessonChange } = callbacks;

  // Course subscription
  useCourseRealtime(courseId, onCourseChange);

  // Modules subscription
  useModulesRealtime(courseId, { onAnyChange: onModuleChange });

  // Lessons subscription (all lessons in course)
  useCourseLessonsRealtime(courseId, onLessonChange);
}

/**
 * Hook for student dashboard - tracks all enrolled courses
 */
export function useStudentRealtime(userId, enrolledCourseIds = [], callbacks = {}) {
  const { onEnrollmentChange, onProgressChange, onCertificateChange, onCourseContentChange } = callbacks;

  // Enrollment changes
  useEnrollmentsRealtime(userId, { onAnyChange: onEnrollmentChange });

  // Progress changes for all enrolled courses
  useLessonProgressRealtime(userId, null, { onAnyChange: onProgressChange });

  // Certificate changes
  useCertificatesRealtime(userId, onCertificateChange);

  // Course content changes for enrolled courses
  useEffect(() => {
    if (!enrolledCourseIds.length || !onCourseContentChange) return;

    const channels = [];

    // Subscribe to each enrolled course's content changes
    enrolledCourseIds.forEach(courseId => {
      const channelName = `student-course-${courseId}-${Date.now()}`;

      const channel = supabase
        .channel(channelName)
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'courses',
          filter: `id=eq.${courseId}`,
        }, (payload) => {
          console.log(`[Realtime] Enrolled course ${courseId} updated:`, payload);
          onCourseContentChange(payload, courseId);
        })
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'course_modules',
          filter: `course_id=eq.${courseId}`,
        }, (payload) => {
          console.log(`[Realtime] Course ${courseId} module changed:`, payload);
          onCourseContentChange(payload, courseId);
        })
        .subscribe();

      channels.push(channel);
    });

    return () => {
      channels.forEach(channel => {
        supabase.removeChannel(channel);
      });
    };
  }, [enrolledCourseIds.join(','), onCourseContentChange]);
}

export default {
  useRealtimeSubscription,
  useCoursesRealtime,
  useCourseRealtime,
  useModulesRealtime,
  useLessonsRealtime,
  useCourseLessonsRealtime,
  useEnrollmentsRealtime,
  useLessonProgressRealtime,
  useCertificatesRealtime,
  useFullCourseRealtime,
  useStudentRealtime,
};
