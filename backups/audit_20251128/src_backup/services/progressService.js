/**
 * Gemral - Progress Service
 * Tracks lesson progress, video position, time spent
 */

import { supabase } from './supabase';

class ProgressService {

  /**
   * Update lesson progress
   * @param {string} userId - User UUID
   * @param {string} lessonId - Lesson ID
   * @param {string} courseId - Course ID
   * @param {Object} progressData - Progress data to update
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async updateLessonProgress(userId, lessonId, courseId, progressData) {
    try {
      const { error } = await supabase
        .from('lesson_progress')
        .upsert({
          user_id: userId,
          lesson_id: lessonId,
          course_id: courseId,
          ...progressData,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,lesson_id'
        });

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error('[ProgressService] updateLessonProgress error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Mark lesson as complete
   * @param {string} userId - User UUID
   * @param {string} lessonId - Lesson ID
   * @param {string} courseId - Course ID
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async markLessonComplete(userId, lessonId, courseId) {
    return this.updateLessonProgress(userId, lessonId, courseId, {
      status: 'completed',
      progress_percent: 100,
      completed_at: new Date().toISOString()
    });
  }

  /**
   * Mark lesson as in progress
   * @param {string} userId - User UUID
   * @param {string} lessonId - Lesson ID
   * @param {string} courseId - Course ID
   * @param {number} [progressPercent=0] - Progress percentage
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async markLessonInProgress(userId, lessonId, courseId, progressPercent = 0) {
    return this.updateLessonProgress(userId, lessonId, courseId, {
      status: 'in_progress',
      progress_percent: progressPercent
    });
  }

  /**
   * Get user's progress for all lessons in a course
   * @param {string} userId - User UUID
   * @param {string} courseId - Course ID
   * @returns {Promise<Array>}
   */
  async getCourseProgress(userId, courseId) {
    try {
      const { data, error } = await supabase
        .from('lesson_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('course_id', courseId);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('[ProgressService] getCourseProgress error:', error);
      return [];
    }
  }

  /**
   * Get progress for a specific lesson
   * @param {string} userId - User UUID
   * @param {string} lessonId - Lesson ID
   * @returns {Promise<Object|null>}
   */
  async getLessonProgress(userId, lessonId) {
    try {
      const { data, error } = await supabase
        .from('lesson_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('lesson_id', lessonId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    } catch (error) {
      console.error('[ProgressService] getLessonProgress error:', error);
      return null;
    }
  }

  /**
   * Save video position for resume playback
   * @param {string} userId - User UUID
   * @param {string} lessonId - Lesson ID
   * @param {string} courseId - Course ID
   * @param {number} positionSeconds - Current video position in seconds
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async saveVideoPosition(userId, lessonId, courseId, positionSeconds) {
    return this.updateLessonProgress(userId, lessonId, courseId, {
      status: 'in_progress',
      video_position_seconds: Math.floor(positionSeconds)
    });
  }

  /**
   * Get saved video position
   * @param {string} userId - User UUID
   * @param {string} lessonId - Lesson ID
   * @returns {Promise<number>} Position in seconds
   */
  async getVideoPosition(userId, lessonId) {
    try {
      const { data, error } = await supabase
        .from('lesson_progress')
        .select('video_position_seconds')
        .eq('user_id', userId)
        .eq('lesson_id', lessonId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data?.video_position_seconds || 0;
    } catch (error) {
      console.error('[ProgressService] getVideoPosition error:', error);
      return 0;
    }
  }

  /**
   * Add time spent on a lesson
   * @param {string} userId - User UUID
   * @param {string} lessonId - Lesson ID
   * @param {string} courseId - Course ID
   * @param {number} seconds - Seconds to add
   * @returns {Promise<number>} New total time spent
   */
  async addTimeSpent(userId, lessonId, courseId, seconds) {
    try {
      // Get current time spent
      const { data: current } = await supabase
        .from('lesson_progress')
        .select('time_spent_seconds')
        .eq('user_id', userId)
        .eq('lesson_id', lessonId)
        .single();

      const newTime = (current?.time_spent_seconds || 0) + seconds;

      // Update with new time
      const { error } = await supabase
        .from('lesson_progress')
        .upsert({
          user_id: userId,
          lesson_id: lessonId,
          course_id: courseId,
          time_spent_seconds: newTime,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,lesson_id'
        });

      if (error) throw error;
      return newTime;
    } catch (error) {
      console.error('[ProgressService] addTimeSpent error:', error);
      return 0;
    }
  }

  /**
   * Get total time spent on a course
   * @param {string} userId - User UUID
   * @param {string} courseId - Course ID
   * @returns {Promise<number>} Total seconds spent
   */
  async getTotalTimeSpent(userId, courseId) {
    try {
      const { data, error } = await supabase
        .from('lesson_progress')
        .select('time_spent_seconds')
        .eq('user_id', userId)
        .eq('course_id', courseId);

      if (error) throw error;

      const total = (data || []).reduce((sum, lesson) => {
        return sum + (lesson.time_spent_seconds || 0);
      }, 0);

      return total;
    } catch (error) {
      console.error('[ProgressService] getTotalTimeSpent error:', error);
      return 0;
    }
  }

  /**
   * Calculate overall course progress percentage
   * @param {string} userId - User UUID
   * @param {string} courseId - Course ID
   * @returns {Promise<number>} Progress percentage (0-100)
   */
  async calculateCourseProgress(userId, courseId) {
    try {
      const { data, error } = await supabase
        .rpc('calculate_course_progress', {
          user_id_param: userId,
          course_id_param: courseId
        });

      if (error) throw error;
      return data || 0;
    } catch (error) {
      console.error('[ProgressService] calculateCourseProgress error:', error);
      return 0;
    }
  }

  /**
   * Get completed lessons count for a course
   * @param {string} userId - User UUID
   * @param {string} courseId - Course ID
   * @returns {Promise<number>}
   */
  async getCompletedLessonsCount(userId, courseId) {
    try {
      const { data, error, count } = await supabase
        .from('lesson_progress')
        .select('id', { count: 'exact' })
        .eq('user_id', userId)
        .eq('course_id', courseId)
        .eq('status', 'completed');

      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error('[ProgressService] getCompletedLessonsCount error:', error);
      return 0;
    }
  }

  /**
   * Reset progress for a lesson
   * @param {string} userId - User UUID
   * @param {string} lessonId - Lesson ID
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async resetLessonProgress(userId, lessonId) {
    try {
      const { error } = await supabase
        .from('lesson_progress')
        .delete()
        .eq('user_id', userId)
        .eq('lesson_id', lessonId);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('[ProgressService] resetLessonProgress error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Reset all progress for a course
   * @param {string} userId - User UUID
   * @param {string} courseId - Course ID
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async resetCourseProgress(userId, courseId) {
    try {
      const { error } = await supabase
        .from('lesson_progress')
        .delete()
        .eq('user_id', userId)
        .eq('course_id', courseId);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('[ProgressService] resetCourseProgress error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get next incomplete lesson for a course
   * @param {string} userId - User UUID
   * @param {string} courseId - Course ID
   * @returns {Promise<Object|null>} Next lesson or null if all complete
   */
  async getNextLesson(userId, courseId) {
    try {
      // Get all lessons in order
      const { data: lessons, error: lessonsError } = await supabase
        .from('course_lessons')
        .select('id, title, module_id')
        .eq('course_id', courseId)
        .order('order_index', { ascending: true });

      if (lessonsError) throw lessonsError;

      // Get completed lessons
      const { data: progress, error: progressError } = await supabase
        .from('lesson_progress')
        .select('lesson_id')
        .eq('user_id', userId)
        .eq('course_id', courseId)
        .eq('status', 'completed');

      if (progressError) throw progressError;

      const completedIds = (progress || []).map(p => p.lesson_id);

      // Find first incomplete lesson
      const nextLesson = (lessons || []).find(lesson =>
        !completedIds.includes(lesson.id)
      );

      return nextLesson || null;
    } catch (error) {
      console.error('[ProgressService] getNextLesson error:', error);
      return null;
    }
  }

  /**
   * Get progress summary for admin dashboard
   * @param {string} courseId - Course ID
   * @returns {Promise<Object>}
   */
  async getCourseProgressSummary(courseId) {
    try {
      // Get all lesson progress for this course
      const { data, error } = await supabase
        .from('lesson_progress')
        .select('user_id, status, time_spent_seconds')
        .eq('course_id', courseId);

      if (error) throw error;

      // Calculate stats
      const userStats = {};
      (data || []).forEach(progress => {
        if (!userStats[progress.user_id]) {
          userStats[progress.user_id] = {
            completedLessons: 0,
            totalTimeSpent: 0
          };
        }
        if (progress.status === 'completed') {
          userStats[progress.user_id].completedLessons++;
        }
        userStats[progress.user_id].totalTimeSpent += progress.time_spent_seconds || 0;
      });

      const users = Object.keys(userStats);
      const avgTimePerUser = users.length > 0
        ? Math.round(users.reduce((sum, uid) => sum + userStats[uid].totalTimeSpent, 0) / users.length)
        : 0;

      return {
        totalLearners: users.length,
        averageTimeSpent: avgTimePerUser,
        lessonCompletions: (data || []).filter(p => p.status === 'completed').length
      };
    } catch (error) {
      console.error('[ProgressService] getCourseProgressSummary error:', error);
      return {
        totalLearners: 0,
        averageTimeSpent: 0,
        lessonCompletions: 0
      };
    }
  }
}

export const progressService = new ProgressService();
export default progressService;
