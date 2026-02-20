/**
 * Gemral - Course Context
 * Global course state management with AsyncStorage persistence + Supabase Realtime Sync
 * Supports: courses, lessons, quizzes, certificates
 * REALTIME: Auto-syncs courses, progress, enrollments between Web and Mobile
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { courseService } from '../services/courseService';
import { quizService } from '../services/quizService';
import { progressService } from '../services/progressService';
import { supabase } from '../services/supabase';
import { useAuth } from './AuthContext';

const CourseContext = createContext(null);

const ENROLLMENTS_KEY = '@gem_enrollments';
const PROGRESS_KEY = '@gem_course_progress';
const COMPLETED_LESSONS_KEY = '@gem_completed_lessons';
const QUIZ_RESULTS_KEY = '@gem_quiz_results';
const CERTIFICATES_KEY = '@gem_certificates';

export const CourseProvider = ({ children }) => {
  const { user, profile, userTier, isAdmin } = useAuth();

  // State
  const [courses, setCourses] = useState([]);
  const [enrolledCourseIds, setEnrolledCourseIds] = useState([]);
  const [courseProgress, setCourseProgress] = useState({}); // { courseId: percent }
  const [completedLessons, setCompletedLessons] = useState({}); // { courseId: [lessonIds] }
  const [quizResults, setQuizResults] = useState({}); // { lessonId: { passed, score, percentage } }
  const [certificates, setCertificates] = useState({}); // { courseId: certificate }
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Realtime subscription refs
  const coursesChannelRef = useRef(null);
  const modulesChannelRef = useRef(null);
  const lessonsChannelRef = useRef(null);
  const enrollmentsChannelRef = useRef(null);
  const progressChannelRef = useRef(null);

  // Computed values
  const enrolledCourses = courses.filter(c => enrolledCourseIds.includes(c.id));
  const completedCourses = courses.filter(c => (courseProgress[c.id] || 0) >= 100);
  const inProgressCourses = enrolledCourses.filter(c => {
    const progress = courseProgress[c.id] || 0;
    return progress < 100; // Include not-started (progress=0) courses too
  });

  // Load data on mount or when admin status changes
  useEffect(() => {
    if (user?.id) {
      console.log('[CourseContext] useEffect triggered - user:', user?.id, 'isAdmin:', isAdmin);
      loadAllData();
      setupRealtimeSubscriptions();
    } else {
      setLoading(false);
    }

    // Cleanup subscriptions on unmount
    return () => {
      cleanupSubscriptions();
    };
  }, [user?.id, isAdmin]);

  // Force reload when isAdmin changes to true (profile loaded after initial fetch)
  useEffect(() => {
    if (isAdmin && user?.id && courses.length > 0) {
      console.log('[CourseContext] Admin status confirmed, checking if reload needed...');
      // Check if we have unpublished courses - if not, we need to reload
      const hasUnpublishedCourses = courses.some(c => c.is_published === false);
      if (!hasUnpublishedCourses) {
        console.log('[CourseContext] Reloading to include unpublished courses for admin');
        loadAllData();
      }
    }
  }, [isAdmin]);

  // ==================== REALTIME SUBSCRIPTIONS ====================

  const setupRealtimeSubscriptions = useCallback(() => {
    console.log('[CourseContext] Setting up realtime subscriptions...');

    // 1. Subscribe to courses changes (new courses, updates)
    coursesChannelRef.current = supabase
      .channel('courses-realtime')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'courses',
        filter: 'is_published=eq.true',
      }, (payload) => {
        console.log('[CourseContext] Course change:', payload.eventType, payload);
        handleCourseChange(payload);
      })
      .subscribe((status) => {
        console.log('[CourseContext] Courses subscription:', status);
      });

    // 2. Subscribe to modules changes
    modulesChannelRef.current = supabase
      .channel('modules-realtime')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'course_modules',
      }, (payload) => {
        console.log('[CourseContext] Module change:', payload.eventType, payload);
        handleModuleChange(payload);
      })
      .subscribe();

    // 3. Subscribe to lessons changes
    lessonsChannelRef.current = supabase
      .channel('lessons-realtime')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'course_lessons',
      }, (payload) => {
        console.log('[CourseContext] Lesson change:', payload.eventType, payload);
        handleLessonChange(payload);
      })
      .subscribe();

    // 4. Subscribe to user's enrollments
    if (user?.id) {
      enrollmentsChannelRef.current = supabase
        .channel(`enrollments-${user.id}`)
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'course_enrollments',
          filter: `user_id=eq.${user.id}`,
        }, (payload) => {
          console.log('[CourseContext] Enrollment change:', payload.eventType, payload);
          handleEnrollmentChange(payload);
        })
        .subscribe();

      // 5. Subscribe to user's lesson progress
      progressChannelRef.current = supabase
        .channel(`progress-${user.id}`)
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'lesson_progress',
          filter: `user_id=eq.${user.id}`,
        }, (payload) => {
          console.log('[CourseContext] Progress change:', payload.eventType, payload);
          handleProgressChange(payload);
        })
        .subscribe();
    }
  }, [user?.id]);

  const cleanupSubscriptions = useCallback(() => {
    console.log('[CourseContext] Cleaning up subscriptions...');
    if (coursesChannelRef.current) supabase.removeChannel(coursesChannelRef.current);
    if (modulesChannelRef.current) supabase.removeChannel(modulesChannelRef.current);
    if (lessonsChannelRef.current) supabase.removeChannel(lessonsChannelRef.current);
    if (enrollmentsChannelRef.current) supabase.removeChannel(enrollmentsChannelRef.current);
    if (progressChannelRef.current) supabase.removeChannel(progressChannelRef.current);
  }, []);

  // Handle course changes from realtime
  const handleCourseChange = useCallback((payload) => {
    const { eventType, new: newCourse, old: oldCourse } = payload;

    setCourses(prev => {
      if (eventType === 'INSERT') {
        // Add new course if not exists
        if (!prev.find(c => c.id === newCourse.id)) {
          console.log('[CourseContext] Adding new course:', newCourse.title);
          return [...prev, newCourse];
        }
      } else if (eventType === 'UPDATE') {
        // Update existing course
        return prev.map(c => c.id === newCourse.id ? { ...c, ...newCourse } : c);
      } else if (eventType === 'DELETE') {
        // Remove deleted course
        return prev.filter(c => c.id !== oldCourse.id);
      }
      return prev;
    });
  }, []);

  // Handle module changes from realtime
  const handleModuleChange = useCallback(async (payload) => {
    const { eventType, new: newModule, old: oldModule } = payload;
    const courseId = newModule?.course_id || oldModule?.course_id;

    if (!courseId) return;

    // Refresh the full course data to get updated modules
    const updatedCourse = await courseService.getCourseById(courseId);
    if (updatedCourse) {
      setCourses(prev =>
        prev.map(c => c.id === courseId ? updatedCourse : c)
      );
    }
  }, []);

  // Handle lesson changes from realtime
  const handleLessonChange = useCallback(async (payload) => {
    const { new: newLesson, old: oldLesson } = payload;
    const moduleId = newLesson?.module_id || oldLesson?.module_id;

    if (!moduleId) return;

    // Find course that contains this module and refresh it
    const course = courses.find(c =>
      c.modules?.some(m => m.id === moduleId)
    );

    if (course) {
      const updatedCourse = await courseService.getCourseById(course.id);
      if (updatedCourse) {
        setCourses(prev =>
          prev.map(c => c.id === course.id ? updatedCourse : c)
        );
      }
    }
  }, [courses]);

  // Handle enrollment changes from realtime (from web or other devices)
  const handleEnrollmentChange = useCallback(async (payload) => {
    const { eventType, new: newEnroll, old: oldEnroll } = payload;

    if (eventType === 'INSERT' && newEnroll) {
      const courseId = newEnroll.course_id;
      setEnrolledCourseIds(prev => {
        if (!prev.includes(courseId)) {
          const updated = [...prev, courseId];
          AsyncStorage.setItem(ENROLLMENTS_KEY, JSON.stringify(updated));
          return updated;
        }
        return prev;
      });

      // Initialize progress from enrollment data
      if (newEnroll.progress_percentage !== undefined) {
        setCourseProgress(prev => {
          const updated = { ...prev, [courseId]: newEnroll.progress_percentage };
          AsyncStorage.setItem(PROGRESS_KEY, JSON.stringify(updated));
          return updated;
        });
      }
    } else if (eventType === 'UPDATE' && newEnroll) {
      // Update progress from enrollment
      const courseId = newEnroll.course_id;
      if (newEnroll.progress_percentage !== undefined) {
        setCourseProgress(prev => {
          const updated = { ...prev, [courseId]: newEnroll.progress_percentage };
          AsyncStorage.setItem(PROGRESS_KEY, JSON.stringify(updated));
          return updated;
        });
      }
    } else if (eventType === 'DELETE' && oldEnroll) {
      const courseId = oldEnroll.course_id;
      setEnrolledCourseIds(prev => {
        const updated = prev.filter(id => id !== courseId);
        AsyncStorage.setItem(ENROLLMENTS_KEY, JSON.stringify(updated));
        return updated;
      });
    }
  }, []);

  // Handle lesson progress changes from realtime (from web or other devices)
  const handleProgressChange = useCallback((payload) => {
    const { eventType, new: newProgress } = payload;

    if ((eventType === 'INSERT' || eventType === 'UPDATE') && newProgress) {
      const { course_id: courseId, lesson_id: lessonId, status } = newProgress;

      if (status === 'completed') {
        // Add to completed lessons
        setCompletedLessons(prev => {
          const current = prev[courseId] || [];
          if (!current.includes(lessonId)) {
            const updated = { ...prev, [courseId]: [...current, lessonId] };
            AsyncStorage.setItem(COMPLETED_LESSONS_KEY, JSON.stringify(updated));
            return updated;
          }
          return prev;
        });

        // Recalculate progress
        const course = courses.find(c => c.id === courseId);
        if (course) {
          setCompletedLessons(prevCompleted => {
            const completedList = prevCompleted[courseId] || [];
            const totalLessons = course.modules?.reduce(
              (sum, m) => sum + (m.lessons?.length || 0), 0
            ) || 1;
            const newPercent = Math.round((completedList.length / totalLessons) * 100);

            setCourseProgress(prevProgress => {
              const updated = { ...prevProgress, [courseId]: newPercent };
              AsyncStorage.setItem(PROGRESS_KEY, JSON.stringify(updated));
              return updated;
            });

            return prevCompleted;
          });
        }
      }
    }
  }, [courses]);

  // Load all data from service and storage + sync from Supabase
  const loadAllData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Load courses from service
      // Admin/Creator can see all courses (including unpublished)
      console.log('[CourseContext] loadAllData - isAdmin:', isAdmin);
      const coursesData = await courseService.getCourses({
        includeUnpublished: isAdmin,
      });
      console.log('[CourseContext] Loaded courses:', coursesData?.length || 0, 'courses');
      if (coursesData?.length > 0) {
        console.log('[CourseContext] Course titles:', coursesData.map(c => c.title));
      }
      setCourses(coursesData);

      // Try to load enrollments from Supabase first, fallback to AsyncStorage
      let enrollments = [];
      const progressFromDb = {};

      if (user?.id) {
        try {
          // 1. Check course_enrollments table first
          const { data: dbEnrollments } = await supabase
            .from('course_enrollments')
            .select('course_id, progress_percentage')
            .eq('user_id', user.id)
            .eq('is_active', true);

          if (dbEnrollments && dbEnrollments.length > 0) {
            enrollments = dbEnrollments.map(e => e.course_id);
            dbEnrollments.forEach(e => {
              progressFromDb[e.course_id] = e.progress_percentage || 0;
            });
            console.log('[CourseContext] Loaded', enrollments.length, 'enrollments from course_enrollments');
          }
        } catch (dbErr) {
          console.warn('[CourseContext] Failed to load enrollments from DB:', dbErr);
        }

        // 2. ALSO check user_access.enrolled_courses (from Shopify purchases)
        // This is where webhook stores purchased course product_ids
        try {
          const userEmail = profile?.email || user?.email;
          if (userEmail) {
            const { data: userAccess } = await supabase
              .from('user_access')
              .select('enrolled_courses')
              .eq('user_email', userEmail)
              .single();

            if (userAccess?.enrolled_courses?.length > 0) {
              console.log('[CourseContext] Found', userAccess.enrolled_courses.length, 'courses in user_access');

              // Map Shopify product_ids to course_ids using shopify_product_id field
              for (const shopifyProductId of userAccess.enrolled_courses) {
                // Find course by shopify_product_id
                const matchingCourse = coursesData.find(c =>
                  c.shopify_product_id === shopifyProductId ||
                  c.shopify_product_id === String(shopifyProductId)
                );

                if (matchingCourse && !enrollments.includes(matchingCourse.id)) {
                  enrollments.push(matchingCourse.id);
                  console.log('[CourseContext] Mapped Shopify product', shopifyProductId, 'to course:', matchingCourse.title);

                  // Auto-sync to course_enrollments for consistency
                  try {
                    await supabase.from('course_enrollments').upsert({
                      user_id: user.id,
                      course_id: matchingCourse.id,
                      enrolled_at: new Date().toISOString(),
                      progress_percentage: 0,
                      is_active: true,
                      access_source: 'shopify_purchase',
                    }, { onConflict: 'user_id,course_id' });
                  } catch (syncErr) {
                    console.warn('[CourseContext] Failed to sync enrollment:', syncErr);
                  }
                }
              }
            }
          }
        } catch (accessErr) {
          console.warn('[CourseContext] Failed to check user_access:', accessErr);
        }

        if (Object.keys(progressFromDb).length > 0) {
          setCourseProgress(progressFromDb);
          await AsyncStorage.setItem(PROGRESS_KEY, JSON.stringify(progressFromDb));
        }
      }

      // If no DB enrollments, use AsyncStorage
      if (enrollments.length === 0) {
        const storedEnrollments = await AsyncStorage.getItem(ENROLLMENTS_KEY);
        if (storedEnrollments) {
          enrollments = JSON.parse(storedEnrollments);
        }

        // Load progress from storage
        const storedProgress = await AsyncStorage.getItem(PROGRESS_KEY);
        if (storedProgress) {
          setCourseProgress(JSON.parse(storedProgress));
        }
      }

      console.log('[CourseContext] Total enrolled courses:', enrollments.length);
      setEnrolledCourseIds(enrollments);
      await AsyncStorage.setItem(ENROLLMENTS_KEY, JSON.stringify(enrollments));

      // Try to load completed lessons from Supabase
      if (user?.id) {
        try {
          const { data: dbProgress } = await supabase
            .from('lesson_progress')
            .select('course_id, lesson_id, status')
            .eq('user_id', user.id)
            .eq('status', 'completed');

          if (dbProgress && dbProgress.length > 0) {
            const completedFromDb = {};
            dbProgress.forEach(p => {
              if (!completedFromDb[p.course_id]) {
                completedFromDb[p.course_id] = [];
              }
              if (!completedFromDb[p.course_id].includes(p.lesson_id)) {
                completedFromDb[p.course_id].push(p.lesson_id);
              }
            });
            setCompletedLessons(completedFromDb);
            await AsyncStorage.setItem(COMPLETED_LESSONS_KEY, JSON.stringify(completedFromDb));
          } else {
            // Fallback to AsyncStorage
            const storedCompleted = await AsyncStorage.getItem(COMPLETED_LESSONS_KEY);
            if (storedCompleted) {
              setCompletedLessons(JSON.parse(storedCompleted));
            }
          }
        } catch (dbErr) {
          console.warn('[CourseContext] Failed to load progress from DB:', dbErr);
          const storedCompleted = await AsyncStorage.getItem(COMPLETED_LESSONS_KEY);
          if (storedCompleted) {
            setCompletedLessons(JSON.parse(storedCompleted));
          }
        }
      } else {
        // Load completed lessons from storage
        const storedCompleted = await AsyncStorage.getItem(COMPLETED_LESSONS_KEY);
        if (storedCompleted) {
          setCompletedLessons(JSON.parse(storedCompleted));
        }
      }

      // Load quiz results from storage
      const storedQuizResults = await AsyncStorage.getItem(QUIZ_RESULTS_KEY);
      if (storedQuizResults) {
        setQuizResults(JSON.parse(storedQuizResults));
      }

      // Load certificates from storage
      const storedCertificates = await AsyncStorage.getItem(CERTIFICATES_KEY);
      if (storedCertificates) {
        setCertificates(JSON.parse(storedCertificates));
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

  // Check if user can access a course based on tier
  // IMPORTANT: This must be defined BEFORE enrollInCourse which uses it
  const canAccessCourse = useCallback((course) => {
    // Admin can access everything
    if (userTier === 'ADMIN' || isAdmin) {
      console.log('[CourseContext] canAccessCourse: ADMIN bypass - full access');
      return true;
    }

    // Use tier from AuthContext (already normalized with fallback to 'FREE')
    // Handle null/undefined tier_required as FREE
    const courseTier = course?.tier_required || 'FREE';

    // Tier hierarchy: FREE < STARTER < TIER1 < TIER2 < TIER3
    const tierOrder = ['FREE', 'STARTER', 'TIER1', 'TIER2', 'TIER3'];

    // If tier not in list, treat as FREE (most permissive)
    let userTierIdx = tierOrder.indexOf(userTier || 'FREE');
    if (userTierIdx === -1) userTierIdx = 0; // Treat unknown as FREE

    let courseTierIdx = tierOrder.indexOf(courseTier);
    if (courseTierIdx === -1) courseTierIdx = 0; // FREE/null courses accessible to all

    const canAccess = courseTierIdx <= userTierIdx;

    // Debug log
    console.log('[CourseContext] canAccessCourse:', {
      courseTitle: course?.title,
      courseTier,
      userTier,
      isAdmin,
      canAccess,
    });

    return canAccess;
  }, [userTier, isAdmin]);

  // Enroll in a course - syncs to Supabase
  // NOTE: This function should ONLY be called for FREE courses or after successful Shopify payment
  // For paid courses, use purchaseCourse() instead which redirects to Shopify checkout
  const enrollInCourse = useCallback(async (courseId, options = {}) => {
    const { bypassPaymentCheck = false, accessSource = 'free_enrollment' } = options;

    try {
      // Check if already enrolled
      if (enrolledCourseIds.includes(courseId)) {
        return { success: true, alreadyEnrolled: true };
      }

      const course = courses.find(c => c.id === courseId);
      if (!course) {
        return { success: false, error: 'Khóa học không tồn tại' };
      }

      // Check tier access
      if (!canAccessCourse(course)) {
        return {
          success: false,
          error: 'Upgrade required',
          requiredTier: course.tier_required,
        };
      }

      // CRITICAL: Check if this is a paid course (has Shopify product linked)
      // Only allow direct enrollment for FREE courses or when payment is confirmed
      const isPaidCourse = course.shopify_product_id || (course.price && course.price > 0);

      if (isPaidCourse && !bypassPaymentCheck) {
        console.log('[CourseContext] Paid course detected, requires Shopify checkout');
        return {
          success: false,
          error: 'Payment required',
          requiresPayment: true,
          shopifyProductId: course.shopify_product_id,
          price: course.price,
          courseTitle: course.title,
        };
      }

      // Add to enrollments locally
      const newEnrollments = [...enrolledCourseIds, courseId];
      setEnrolledCourseIds(newEnrollments);

      // Initialize progress
      const newProgress = { ...courseProgress, [courseId]: 0 };
      setCourseProgress(newProgress);

      // Initialize completed lessons
      const newCompleted = { ...completedLessons, [courseId]: [] };
      setCompletedLessons(newCompleted);

      // Save to AsyncStorage
      await Promise.all([
        AsyncStorage.setItem(ENROLLMENTS_KEY, JSON.stringify(newEnrollments)),
        AsyncStorage.setItem(PROGRESS_KEY, JSON.stringify(newProgress)),
        AsyncStorage.setItem(COMPLETED_LESSONS_KEY, JSON.stringify(newCompleted)),
      ]);

      // SYNC TO SUPABASE - This will trigger realtime for other devices/web
      if (user?.id) {
        try {
          const { error } = await supabase
            .from('course_enrollments')
            .upsert({
              user_id: user.id,
              course_id: courseId,
              enrolled_at: new Date().toISOString(),
              progress_percentage: 0,
              is_active: true,
              access_source: accessSource, // 'free_enrollment', 'shopify_purchase', 'admin_grant'
            }, {
              onConflict: 'user_id,course_id',
            });

          if (error) {
            console.warn('[CourseContext] Failed to sync enrollment to DB:', error);
          } else {
            console.log('[CourseContext] Enrollment synced to Supabase');
          }
        } catch (dbErr) {
          console.warn('[CourseContext] DB enrollment error:', dbErr);
        }
      }

      return { success: true };
    } catch (err) {
      console.error('[CourseContext] Enroll error:', err);
      return { success: false, error: err.message };
    }
  }, [enrolledCourseIds, courses, courseProgress, completedLessons, user?.id, canAccessCourse]);

  // NOTE: Course access after Shopify payment is now granted by the Shopify webhook (orders/paid)
  // The webhook calls grantCourseAccess() in shopify-webhook/index.ts
  // This ensures bank transfers and delayed payments work correctly
  // The app should NOT grant access directly - only refresh data from Supabase

  // Mark lesson as complete - syncs to Supabase for realtime
  const completeLesson = useCallback(async (courseId, lessonId) => {
    try {
      const currentCompleted = completedLessons[courseId] || [];

      // Check if already completed
      if (currentCompleted.includes(lessonId)) {
        return { success: true, alreadyCompleted: true };
      }

      // Add to completed lessons locally
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

      // Save to AsyncStorage
      await Promise.all([
        AsyncStorage.setItem(COMPLETED_LESSONS_KEY, JSON.stringify(newCompleted)),
        AsyncStorage.setItem(PROGRESS_KEY, JSON.stringify(newProgress)),
      ]);

      // SYNC TO SUPABASE - This triggers realtime for web and other devices
      if (user?.id) {
        try {
          // 1. Mark lesson as complete in lesson_progress table
          await progressService.markLessonComplete(user.id, lessonId, courseId);
          console.log('[CourseContext] Lesson progress synced to Supabase');

          // 2. Update enrollment progress percentage
          const { error: enrollError } = await supabase
            .from('course_enrollments')
            .update({
              progress_percentage: newPercent,
              updated_at: new Date().toISOString(),
            })
            .eq('user_id', user.id)
            .eq('course_id', courseId);

          if (enrollError) {
            console.warn('[CourseContext] Failed to update enrollment progress:', enrollError);
          } else {
            console.log('[CourseContext] Enrollment progress updated:', newPercent + '%');
          }
        } catch (dbErr) {
          console.warn('[CourseContext] DB sync error:', dbErr);
          // Continue - local state is already updated
        }
      }

      return { success: true, progress: newPercent };
    } catch (err) {
      console.error('[CourseContext] Complete lesson error:', err);
      return { success: false, error: err.message };
    }
  }, [completedLessons, courseProgress, courses, user?.id]);

  // Unmark lesson as complete - syncs to Supabase for realtime
  const uncompleteLesson = useCallback(async (courseId, lessonId) => {
    try {
      const currentCompleted = completedLessons[courseId] || [];

      // Check if not completed
      if (!currentCompleted.includes(lessonId)) {
        return { success: true, alreadyUncompleted: true };
      }

      // Remove from completed lessons locally
      const newLessonsList = currentCompleted.filter(id => id !== lessonId);
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

      // Save to AsyncStorage
      await Promise.all([
        AsyncStorage.setItem(COMPLETED_LESSONS_KEY, JSON.stringify(newCompleted)),
        AsyncStorage.setItem(PROGRESS_KEY, JSON.stringify(newProgress)),
      ]);

      // SYNC TO SUPABASE
      if (user?.id) {
        try {
          // 1. Unmark lesson as complete in lesson_progress table
          await progressService.unmarkLessonComplete(user.id, lessonId, courseId);
          console.log('[CourseContext] Lesson uncomplete synced to Supabase');

          // 2. Update enrollment progress percentage
          const { error: enrollError } = await supabase
            .from('course_enrollments')
            .update({
              progress_percentage: newPercent,
              updated_at: new Date().toISOString(),
            })
            .eq('user_id', user.id)
            .eq('course_id', courseId);

          if (enrollError) {
            console.warn('[CourseContext] Failed to update enrollment progress:', enrollError);
          } else {
            console.log('[CourseContext] Enrollment progress updated:', newPercent + '%');
          }
        } catch (dbErr) {
          console.warn('[CourseContext] DB sync error:', dbErr);
        }
      }

      return { success: true, progress: newPercent };
    } catch (err) {
      console.error('[CourseContext] Uncomplete lesson error:', err);
      return { success: false, error: err.message };
    }
  }, [completedLessons, courseProgress, courses, user?.id]);

  // Check if course is locked (considers both tier AND payment requirements)
  const isCourseLocked = useCallback((course) => {
    // Admin can access everything
    if (userTier === 'ADMIN' || isAdmin) {
      return false;
    }

    // Check tier access first
    const hasTierAccess = canAccessCourse(course);
    if (!hasTierAccess) {
      return true; // Locked due to tier
    }

    // For paid courses (shopify_product_id), check if enrolled
    // If not enrolled in a paid course, it's locked
    const isPaidCourse = course?.shopify_product_id || (course?.price && course?.price > 0);
    if (isPaidCourse) {
      const enrolled = enrolledCourseIds.includes(course?.id);
      if (!enrolled) {
        console.log('[CourseContext] isCourseLocked: Paid course, not enrolled', course?.title);
        return true; // Locked due to payment required
      }
    }

    return false;
  }, [canAccessCourse, userTier, isAdmin, enrolledCourseIds]);

  // Get the reason why a course is locked
  const getCourseLockReason = useCallback((course) => {
    // Admin can access everything
    if (userTier === 'ADMIN' || isAdmin) {
      return null;
    }

    // Check tier access first
    const hasTierAccess = canAccessCourse(course);
    if (!hasTierAccess) {
      return {
        type: 'tier',
        requiredTier: course?.tier_required,
        message: `Yêu cầu ${course?.tier_required || 'TIER1'}`,
      };
    }

    // Check payment for paid courses
    const isPaidCourse = course?.shopify_product_id || (course?.price && course?.price > 0);
    if (isPaidCourse) {
      const enrolled = enrolledCourseIds.includes(course?.id);
      if (!enrolled) {
        return {
          type: 'payment',
          shopifyProductId: course?.shopify_product_id,
          price: course?.price,
          message: 'Yêu cầu mua khóa học',
        };
      }
    }

    return null;
  }, [canAccessCourse, userTier, isAdmin, enrolledCourseIds]);

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
    const course = courses.find(c => c.id === courseId);
    return course || null;
  }, [courses]);

  // Fetch fresh course data with modules and lessons
  // Use this when course exists but modules are missing/empty
  const fetchCourseWithModules = useCallback(async (courseId) => {
    try {
      console.log('[CourseContext] Fetching fresh course data for:', courseId);
      const freshCourse = await courseService.getCourseById(courseId);

      if (freshCourse) {
        // Update the courses array with fresh data
        setCourses(prev =>
          prev.map(c => c.id === courseId ? freshCourse : c)
        );
        return freshCourse;
      }
      return null;
    } catch (err) {
      console.error('[CourseContext] fetchCourseWithModules error:', err);
      return null;
    }
  }, []);

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

  // ==================== QUIZ METHODS ====================

  // Save quiz result
  const saveQuizResult = useCallback(async (lessonId, result) => {
    try {
      const newQuizResults = {
        ...quizResults,
        [lessonId]: {
          passed: result.passed,
          score: result.score,
          maxScore: result.maxScore,
          percentage: result.percentage,
          completedAt: new Date().toISOString(),
        },
      };

      setQuizResults(newQuizResults);
      await AsyncStorage.setItem(QUIZ_RESULTS_KEY, JSON.stringify(newQuizResults));

      return { success: true };
    } catch (err) {
      console.error('[CourseContext] Save quiz result error:', err);
      return { success: false, error: err.message };
    }
  }, [quizResults]);

  // Get quiz result for a lesson
  const getQuizResult = useCallback((lessonId) => {
    return quizResults[lessonId] || null;
  }, [quizResults]);

  // Check if quiz is passed for a lesson
  const isQuizPassed = useCallback((lessonId) => {
    const result = quizResults[lessonId];
    return result?.passed || false;
  }, [quizResults]);

  // Check if user can retake quiz
  const canRetakeQuiz = useCallback(async (lessonId) => {
    if (!user?.id) return { canRetake: false, error: 'Not logged in' };

    try {
      // Get quiz by lesson ID
      const quiz = await quizService.getQuizByLessonId(lessonId);
      if (!quiz) return { canRetake: false, error: 'Quiz not found' };

      return await quizService.canRetakeQuiz(user.id, quiz.id);
    } catch (err) {
      console.error('[CourseContext] canRetakeQuiz error:', err);
      return { canRetake: true, attemptsUsed: 0, maxAttempts: null };
    }
  }, [user?.id]);

  // ==================== CERTIFICATE METHODS ====================

  // Get certificate for a course
  const getCertificate = useCallback(async (courseId) => {
    // Check local cache first
    if (certificates[courseId]) {
      return certificates[courseId];
    }

    // Try to fetch from service
    if (user?.id) {
      try {
        const cert = await courseService.getCertificate(user.id, courseId);
        if (cert) {
          // Cache locally
          const newCertificates = { ...certificates, [courseId]: cert };
          setCertificates(newCertificates);
          await AsyncStorage.setItem(CERTIFICATES_KEY, JSON.stringify(newCertificates));
          return cert;
        }
      } catch (err) {
        console.error('[CourseContext] getCertificate error:', err);
      }
    }

    return null;
  }, [certificates, user?.id]);

  // Generate certificate for completed course
  const generateCertificate = useCallback(async (courseId) => {
    if (!user?.id) return { success: false, error: 'Not logged in' };

    // Check if course is 100% complete
    const progress = courseProgress[courseId] || 0;
    if (progress < 100) {
      return { success: false, error: 'Course not completed' };
    }

    try {
      const userName = profile?.username || profile?.full_name || user.email?.split('@')[0] || 'Student';
      const result = await courseService.generateCertificate(user.id, courseId, userName);

      if (result.success && result.certificate) {
        // Cache locally
        const newCertificates = { ...certificates, [courseId]: result.certificate };
        setCertificates(newCertificates);
        await AsyncStorage.setItem(CERTIFICATES_KEY, JSON.stringify(newCertificates));
      }

      return result;
    } catch (err) {
      console.error('[CourseContext] generateCertificate error:', err);
      return { success: false, error: err.message };
    }
  }, [user?.id, profile, courseProgress, certificates]);

  // Check if certificate exists for a course
  const hasCertificate = useCallback((courseId) => {
    return !!certificates[courseId];
  }, [certificates]);

  const value = {
    // State
    courses,
    enrolledCourses,
    completedCourses,
    inProgressCourses,
    enrolledCourseIds,
    courseProgress,
    completedLessons,
    quizResults,
    certificates,
    loading,
    refreshing,
    error,

    // Actions
    refresh,
    enrollInCourse,
    unenrollFromCourse,
    completeLesson,
    uncompleteLesson,
    resetCourseProgress,
    fetchCourseWithModules,

    // Quiz Actions
    saveQuizResult,
    canRetakeQuiz,

    // Certificate Actions
    getCertificate,
    generateCertificate,

    // Getters
    getCourseById,
    isEnrolled,
    isCourseLocked,
    getCourseLockReason,
    canAccessCourse,
    getProgress,
    getCompletedLessons,
    isLessonCompleted,
    getNextLesson,

    // Quiz Getters
    getQuizResult,
    isQuizPassed,

    // Certificate Getters
    hasCertificate,
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
