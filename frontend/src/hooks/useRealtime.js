/**
 * useRealtime Hook
 * Real-time subscription for Supabase tables
 * Teacher edits on Web → Mobile sees immediately
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import supabase from '../config/supabase';

/**
 * Subscribe to real-time changes on a table
 * @param {string} table - Table name to subscribe to
 * @param {object} options - Subscription options
 * @param {string} options.event - Event type: 'INSERT', 'UPDATE', 'DELETE', '*' (all)
 * @param {string} options.filter - Filter column and value, e.g., 'course_id=eq.123'
 * @param {function} options.onInsert - Callback for INSERT events
 * @param {function} options.onUpdate - Callback for UPDATE events
 * @param {function} options.onDelete - Callback for DELETE events
 * @param {function} options.onChange - Callback for any change
 * @param {boolean} options.enabled - Enable/disable subscription (default: true)
 */
export function useRealtimeSubscription(table, options = {}) {
  const {
    event = '*',
    filter = null,
    onInsert,
    onUpdate,
    onDelete,
    onChange,
    enabled = true,
  } = options;

  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);
  const channelRef = useRef(null);

  useEffect(() => {
    if (!enabled || !table) return;

    // Build channel config
    let channelConfig = {
      event,
      schema: 'public',
      table,
    };

    // Add filter if provided
    if (filter) {
      channelConfig.filter = filter;
    }

    // Create unique channel name
    const channelName = `realtime:${table}:${filter || 'all'}:${Date.now()}`;

    // Subscribe to channel
    const channel = supabase
      .channel(channelName)
      .on('postgres_changes', channelConfig, (payload) => {
        const { eventType, new: newRecord, old: oldRecord } = payload;

        // Call specific event handler
        switch (eventType) {
          case 'INSERT':
            onInsert?.(newRecord);
            break;
          case 'UPDATE':
            onUpdate?.(newRecord, oldRecord);
            break;
          case 'DELETE':
            onDelete?.(oldRecord);
            break;
        }

        // Call generic onChange handler
        onChange?.({ eventType, new: newRecord, old: oldRecord });
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setIsConnected(true);
          setError(null);
        } else if (status === 'CHANNEL_ERROR') {
          setIsConnected(false);
          setError('Không thể kết nối real-time');
        } else if (status === 'CLOSED') {
          setIsConnected(false);
        }
      });

    channelRef.current = channel;

    // Cleanup
    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [table, event, filter, enabled, onInsert, onUpdate, onDelete, onChange]);

  return { isConnected, error };
}

/**
 * Subscribe to course changes
 * @param {string} courseId - Course ID to subscribe to
 * @param {function} onCourseUpdate - Callback when course is updated
 */
export function useCourseRealtime(courseId, onCourseUpdate) {
  return useRealtimeSubscription('courses', {
    event: 'UPDATE',
    filter: `id=eq.${courseId}`,
    onUpdate: (newCourse) => {
      console.log('[useCourseRealtime] Course updated:', newCourse.id);
      onCourseUpdate?.(newCourse);
    },
    enabled: !!courseId,
  });
}

/**
 * Subscribe to module changes for a course
 * @param {string} courseId - Course ID
 * @param {function} onModulesChange - Callback when modules change
 */
export function useModulesRealtime(courseId, onModulesChange) {
  return useRealtimeSubscription('course_modules', {
    event: '*',
    filter: `course_id=eq.${courseId}`,
    onChange: (payload) => {
      console.log('[useModulesRealtime] Module changed:', payload.eventType);
      onModulesChange?.(payload);
    },
    enabled: !!courseId,
  });
}

/**
 * Subscribe to lesson changes for a module
 * @param {string} moduleId - Module ID
 * @param {function} onLessonsChange - Callback when lessons change
 */
export function useLessonsRealtime(moduleId, onLessonsChange) {
  return useRealtimeSubscription('course_lessons', {
    event: '*',
    filter: `module_id=eq.${moduleId}`,
    onChange: (payload) => {
      console.log('[useLessonsRealtime] Lesson changed:', payload.eventType);
      onLessonsChange?.(payload);
    },
    enabled: !!moduleId,
  });
}

/**
 * Subscribe to enrollment changes for a user
 * @param {string} userId - User ID
 * @param {function} onEnrollmentChange - Callback when enrollment changes
 */
export function useEnrollmentRealtime(userId, onEnrollmentChange) {
  return useRealtimeSubscription('course_enrollments', {
    event: '*',
    filter: `user_id=eq.${userId}`,
    onChange: (payload) => {
      console.log('[useEnrollmentRealtime] Enrollment changed:', payload.eventType);
      onEnrollmentChange?.(payload);
    },
    enabled: !!userId,
  });
}

/**
 * Subscribe to progress changes for an enrollment
 * @param {string} enrollmentId - Enrollment ID
 * @param {function} onProgressChange - Callback when progress changes
 */
export function useProgressRealtime(enrollmentId, onProgressChange) {
  return useRealtimeSubscription('lesson_progress', {
    event: '*',
    filter: `enrollment_id=eq.${enrollmentId}`,
    onChange: (payload) => {
      console.log('[useProgressRealtime] Progress changed:', payload.eventType);
      onProgressChange?.(payload);
    },
    enabled: !!enrollmentId,
  });
}

/**
 * Subscribe to quiz changes
 * @param {string} lessonId - Lesson ID
 * @param {function} onQuizChange - Callback when quiz changes
 */
export function useQuizRealtime(lessonId, onQuizChange) {
  return useRealtimeSubscription('quizzes', {
    event: '*',
    filter: `lesson_id=eq.${lessonId}`,
    onChange: (payload) => {
      console.log('[useQuizRealtime] Quiz changed:', payload.eventType);
      onQuizChange?.(payload);
    },
    enabled: !!lessonId,
  });
}

/**
 * Batch subscription for course admin
 * Subscribes to all course-related tables at once
 */
export function useCourseAdminRealtime(courseId, callbacks = {}) {
  const {
    onCourseUpdate,
    onModulesChange,
    onLessonsChange,
    onEnrollmentsChange,
  } = callbacks;

  const [subscriptions, setSubscriptions] = useState({
    course: false,
    modules: false,
    lessons: false,
    enrollments: false,
  });

  // Course subscription
  const { isConnected: courseConnected } = useCourseRealtime(courseId, onCourseUpdate);

  // Modules subscription
  const { isConnected: modulesConnected } = useModulesRealtime(courseId, onModulesChange);

  // Lessons subscription (subscribe to all course lessons)
  const { isConnected: lessonsConnected } = useRealtimeSubscription('course_lessons', {
    event: '*',
    onChange: (payload) => {
      // Filter by course_id on the client side
      onLessonsChange?.(payload);
    },
    enabled: !!courseId,
  });

  // Enrollments subscription
  const { isConnected: enrollmentsConnected } = useRealtimeSubscription('course_enrollments', {
    event: '*',
    filter: `course_id=eq.${courseId}`,
    onChange: (payload) => {
      onEnrollmentsChange?.(payload);
    },
    enabled: !!courseId,
  });

  useEffect(() => {
    setSubscriptions({
      course: courseConnected,
      modules: modulesConnected,
      lessons: lessonsConnected,
      enrollments: enrollmentsConnected,
    });
  }, [courseConnected, modulesConnected, lessonsConnected, enrollmentsConnected]);

  const isFullyConnected = Object.values(subscriptions).every(Boolean);

  return {
    subscriptions,
    isFullyConnected,
  };
}

export default {
  useRealtimeSubscription,
  useCourseRealtime,
  useModulesRealtime,
  useLessonsRealtime,
  useEnrollmentRealtime,
  useProgressRealtime,
  useQuizRealtime,
  useCourseAdminRealtime,
};
