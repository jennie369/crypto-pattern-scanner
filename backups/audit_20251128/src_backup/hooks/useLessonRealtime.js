/**
 * useLessonRealtime Hook (Mobile)
 * Provides realtime subscription for lesson content updates
 * Syncs teacher edits to student views in real-time
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../services/supabase';

/**
 * Hook for subscribing to lesson updates
 * @param {string} lessonId - The lesson ID to subscribe to
 * @param {object} options - Configuration options
 * @returns {object} Realtime state and controls
 */
export function useLessonRealtime(lessonId, options = {}) {
  const {
    onUpdate,
    onError,
    enabled = true,
  } = options;

  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const channelRef = useRef(null);

  // Load initial content
  const loadContent = useCallback(async () => {
    if (!lessonId) return;

    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('course_lessons')
        .select('id, html_content, parsed_content, last_edited_at, last_edited_by')
        .eq('id', lessonId)
        .single();

      if (fetchError) throw fetchError;

      setContent(data?.parsed_content || null);
      setLastUpdated(data?.last_edited_at);
    } catch (err) {
      console.error('[useLessonRealtime] Load error:', err);
      setError(err.message);
      onError?.(err);
    } finally {
      setLoading(false);
    }
  }, [lessonId, onError]);

  // Setup realtime subscription
  useEffect(() => {
    if (!lessonId || !enabled) return;

    // Load initial content
    loadContent();

    // Create channel
    const channel = supabase
      .channel(`lesson-realtime-${lessonId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'course_lessons',
          filter: `id=eq.${lessonId}`,
        },
        (payload) => {
          console.log('[useLessonRealtime] Update received:', payload.new?.id);

          if (payload.new?.parsed_content) {
            setContent(payload.new.parsed_content);
            setLastUpdated(payload.new.last_edited_at);
            onUpdate?.(payload.new);
          }
        }
      )
      .subscribe((status) => {
        console.log('[useLessonRealtime] Subscription status:', status);
        setIsConnected(status === 'SUBSCRIBED');
      });

    channelRef.current = channel;

    // Cleanup
    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
      setIsConnected(false);
    };
  }, [lessonId, enabled, loadContent, onUpdate]);

  // Manual refresh
  const refresh = useCallback(() => {
    loadContent();
  }, [loadContent]);

  return {
    content,
    loading,
    error,
    lastUpdated,
    isConnected,
    refresh,
  };
}

/**
 * Hook for tracking lesson progress with realtime sync
 * @param {string} lessonId - The lesson ID
 * @param {string} userId - The user ID
 * @returns {object} Progress state and controls
 */
export function useLessonProgress(lessonId, userId) {
  const [progress, setProgress] = useState({
    quizResults: {},
    completedQuizzes: [],
    progressPercent: 0,
    lastAccessedAt: null,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Load progress
  useEffect(() => {
    if (!lessonId || !userId) return;

    const loadProgress = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('lesson_progress')
          .select('*')
          .eq('lesson_id', lessonId)
          .eq('user_id', userId)
          .single();

        if (data) {
          setProgress({
            quizResults: data.quiz_results || {},
            completedQuizzes: data.completed_quizzes || [],
            progressPercent: data.progress_percent || 0,
            lastAccessedAt: data.last_accessed_at,
          });
        }
      } catch (err) {
        // No progress yet - that's fine
      } finally {
        setLoading(false);
      }
    };

    loadProgress();
  }, [lessonId, userId]);

  // Save progress
  const saveProgress = useCallback(
    async (updates) => {
      if (!lessonId || !userId || saving) return { success: false };

      setSaving(true);
      try {
        const newProgress = {
          ...progress,
          ...updates,
          lastAccessedAt: new Date().toISOString(),
        };

        const { error } = await supabase.from('lesson_progress').upsert({
          lesson_id: lessonId,
          user_id: userId,
          quiz_results: newProgress.quizResults,
          completed_quizzes: newProgress.completedQuizzes,
          progress_percent: newProgress.progressPercent,
          last_accessed_at: newProgress.lastAccessedAt,
        });

        if (error) throw error;

        setProgress(newProgress);
        return { success: true };
      } catch (err) {
        console.error('[useLessonProgress] Save error:', err);
        return { success: false, error: err.message };
      } finally {
        setSaving(false);
      }
    },
    [lessonId, userId, progress, saving]
  );

  // Submit quiz result
  const submitQuizResult = useCallback(
    async (quizId, result) => {
      const newQuizResults = { ...progress.quizResults, [quizId]: result };
      const newCompletedQuizzes = progress.completedQuizzes.includes(quizId)
        ? progress.completedQuizzes
        : [...progress.completedQuizzes, quizId];

      return saveProgress({
        quizResults: newQuizResults,
        completedQuizzes: newCompletedQuizzes,
      });
    },
    [progress, saveProgress]
  );

  return {
    progress,
    loading,
    saving,
    saveProgress,
    submitQuizResult,
  };
}

/**
 * Hook for presence awareness (who is viewing the lesson)
 * @param {string} lessonId - The lesson ID
 * @returns {object} Presence state
 */
export function useLessonPresence(lessonId) {
  const [viewers, setViewers] = useState([]);
  const [isTeacherOnline, setIsTeacherOnline] = useState(false);

  useEffect(() => {
    if (!lessonId) return;

    const channel = supabase.channel(`presence-lesson-${lessonId}`);

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const allViewers = Object.values(state).flat();
        setViewers(allViewers);
        setIsTeacherOnline(allViewers.some((v) => v.role === 'teacher'));
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          const { data: user } = await supabase.auth.getUser();
          if (user?.user) {
            await channel.track({
              id: user.user.id,
              email: user.user.email,
              role: 'student',
              joined_at: new Date().toISOString(),
            });
          }
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [lessonId]);

  return {
    viewers,
    viewerCount: viewers.length,
    isTeacherOnline,
  };
}

export default {
  useLessonRealtime,
  useLessonProgress,
  useLessonPresence,
};
