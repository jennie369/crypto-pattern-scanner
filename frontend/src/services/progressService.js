/**
 * GEM Web App - Progress Service
 * Handles lesson progress tracking, certificates, and statistics
 */

import { supabase } from '../lib/supabaseClient';

/**
 * Progress Service Class
 */
class ProgressService {
  // =====================
  // PROGRESS TRACKING
  // =====================

  /**
   * Get user's progress for a course
   * @param {string} userId - User ID
   * @param {string} courseId - Course ID
   * @returns {Promise<Object>} Progress data
   */
  async getProgress(userId, courseId) {
    try {
      const { data, error } = await supabase
        .from('lesson_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('course_id', courseId);

      if (error) throw error;

      const progress = data || [];
      const completedLessons = progress.filter(p => p.status === 'completed');
      const lastLesson = progress
        .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))[0];

      return {
        completedLessons: completedLessons.map(p => p.lesson_id),
        completedCount: completedLessons.length,
        totalProgress: progress,
        lastLessonId: lastLesson?.lesson_id || null,
        lastAccessedAt: lastLesson?.updated_at || null,
      };
    } catch (error) {
      console.error('[ProgressService] getProgress error:', error);
      return {
        completedLessons: [],
        completedCount: 0,
        totalProgress: [],
        lastLessonId: null,
        lastAccessedAt: null,
      };
    }
  }

  /**
   * Mark lesson as complete
   * @param {string} userId - User ID
   * @param {string} courseId - Course ID
   * @param {string} lessonId - Lesson ID
   * @returns {Promise<Object>} Result with updated progress
   */
  async markLessonComplete(userId, courseId, lessonId) {
    try {
      // Check if progress exists
      const { data: existing } = await supabase
        .from('lesson_progress')
        .select('id')
        .eq('user_id', userId)
        .eq('lesson_id', lessonId)
        .single();

      if (existing) {
        // Update existing
        const { error } = await supabase
          .from('lesson_progress')
          .update({
            status: 'completed',
            completed_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', existing.id);

        if (error) throw error;
      } else {
        // Create new
        const { error } = await supabase
          .from('lesson_progress')
          .insert({
            user_id: userId,
            course_id: courseId,
            lesson_id: lessonId,
            status: 'completed',
            completed_at: new Date().toISOString(),
          });

        if (error) throw error;
      }

      // Update enrollment progress percentage
      await this._updateEnrollmentProgress(userId, courseId);

      // Get updated progress
      const progress = await this.getProgress(userId, courseId);
      return { success: true, progress };
    } catch (error) {
      console.error('[ProgressService] markLessonComplete error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Mark lesson as in-progress (started)
   * @param {string} userId - User ID
   * @param {string} courseId - Course ID
   * @param {string} lessonId - Lesson ID
   * @returns {Promise<Object>} Result
   */
  async markLessonStarted(userId, courseId, lessonId) {
    try {
      // Check if progress exists
      const { data: existing } = await supabase
        .from('lesson_progress')
        .select('id, status')
        .eq('user_id', userId)
        .eq('lesson_id', lessonId)
        .single();

      // Don't override completed status
      if (existing?.status === 'completed') {
        return { success: true };
      }

      if (existing) {
        await supabase
          .from('lesson_progress')
          .update({
            status: 'in_progress',
            updated_at: new Date().toISOString(),
          })
          .eq('id', existing.id);
      } else {
        await supabase
          .from('lesson_progress')
          .insert({
            user_id: userId,
            course_id: courseId,
            lesson_id: lessonId,
            status: 'in_progress',
          });
      }

      return { success: true };
    } catch (error) {
      console.error('[ProgressService] markLessonStarted error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Check if lesson is completed
   * @param {string} userId - User ID
   * @param {string} courseId - Course ID
   * @param {string} lessonId - Lesson ID
   * @returns {Promise<boolean>}
   */
  async isLessonCompleted(userId, courseId, lessonId) {
    try {
      const { data, error } = await supabase
        .from('lesson_progress')
        .select('status')
        .eq('user_id', userId)
        .eq('lesson_id', lessonId)
        .single();

      if (error) return false;
      return data?.status === 'completed';
    } catch (error) {
      return false;
    }
  }

  /**
   * Get lesson progress status
   * @param {string} userId - User ID
   * @param {string} lessonId - Lesson ID
   * @returns {Promise<string>} Status: 'not_started' | 'in_progress' | 'completed'
   */
  async getLessonStatus(userId, lessonId) {
    try {
      const { data, error } = await supabase
        .from('lesson_progress')
        .select('status')
        .eq('user_id', userId)
        .eq('lesson_id', lessonId)
        .single();

      if (error) return 'not_started';
      return data?.status || 'not_started';
    } catch (error) {
      return 'not_started';
    }
  }

  /**
   * Get all progress for a user (multiple courses)
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Progress keyed by courseId
   */
  async getAllProgress(userId) {
    try {
      const { data, error } = await supabase
        .from('lesson_progress')
        .select('*')
        .eq('user_id', userId);

      if (error) throw error;

      // Group by course
      const progressByCoourse = {};
      (data || []).forEach(p => {
        if (!progressByCoourse[p.course_id]) {
          progressByCoourse[p.course_id] = {
            completedLessons: [],
            totalProgress: [],
          };
        }
        progressByCoourse[p.course_id].totalProgress.push(p);
        if (p.status === 'completed') {
          progressByCoourse[p.course_id].completedLessons.push(p.lesson_id);
        }
      });

      return progressByCoourse;
    } catch (error) {
      console.error('[ProgressService] getAllProgress error:', error);
      return {};
    }
  }

  /**
   * Get course statistics for a user
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Statistics
   */
  async getUserCourseStats(userId) {
    try {
      const { data: enrollments, error } = await supabase
        .from('course_enrollments')
        .select('course_id, progress_percentage')
        .eq('user_id', userId)
        .eq('is_active', true);

      if (error) throw error;

      const totalEnrolled = enrollments?.length || 0;
      const completed = enrollments?.filter(e => e.progress_percentage >= 100).length || 0;
      const inProgress = enrollments?.filter(e =>
        e.progress_percentage > 0 && e.progress_percentage < 100
      ).length || 0;
      const notStarted = enrollments?.filter(e =>
        !e.progress_percentage || e.progress_percentage === 0
      ).length || 0;

      return {
        totalEnrolled,
        completed,
        inProgress,
        notStarted,
      };
    } catch (error) {
      console.error('[ProgressService] getUserCourseStats error:', error);
      return {
        totalEnrolled: 0,
        completed: 0,
        inProgress: 0,
        notStarted: 0,
      };
    }
  }

  // =====================
  // CERTIFICATES
  // =====================

  /**
   * Get user's certificate for a course
   * @param {string} userId - User ID
   * @param {string} courseId - Course ID
   * @returns {Promise<Object|null>} Certificate or null
   */
  async getCertificate(userId, courseId) {
    try {
      const { data, error } = await supabase
        .from('course_certificates')
        .select('*')
        .eq('user_id', userId)
        .eq('course_id', courseId)
        .single();

      if (error) return null;
      return data;
    } catch (error) {
      console.error('[ProgressService] getCertificate error:', error);
      return null;
    }
  }

  /**
   * Generate certificate for completed course
   * @param {string} userId - User ID
   * @param {string} courseId - Course ID
   * @param {string} userName - User's display name
   * @returns {Promise<Object>} Result with certificate
   */
  async generateCertificate(userId, courseId, userName) {
    try {
      // Check if already has certificate
      const existing = await this.getCertificate(userId, courseId);
      if (existing) {
        return { success: true, certificate: existing };
      }

      // Check completion percentage
      const { data: enrollment } = await supabase
        .from('course_enrollments')
        .select('progress_percentage')
        .eq('user_id', userId)
        .eq('course_id', courseId)
        .eq('is_active', true)
        .single();

      if (!enrollment || enrollment.progress_percentage < 100) {
        return { success: false, error: 'Khóa học chưa hoàn thành' };
      }

      // Get course info
      const { data: course } = await supabase
        .from('courses')
        .select(`
          title,
          creator:profiles!courses_created_by_fkey(full_name)
        `)
        .eq('id', courseId)
        .single();

      if (!course) {
        return { success: false, error: 'Không tìm thấy khóa học' };
      }

      // Generate certificate
      const certificateNumber = `GEM-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

      const { data: certificate, error } = await supabase
        .from('course_certificates')
        .insert({
          user_id: userId,
          course_id: courseId,
          user_name: userName,
          course_title: course.title,
          instructor_name: course.creator?.full_name || 'Gemral',
          certificate_number: certificateNumber,
          issued_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      return { success: true, certificate };
    } catch (error) {
      console.error('[ProgressService] generateCertificate error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get all certificates for a user
   * @param {string} userId - User ID
   * @returns {Promise<Array>} List of certificates
   */
  async getUserCertificates(userId) {
    try {
      const { data, error } = await supabase
        .from('course_certificates')
        .select(`
          *,
          course:courses(thumbnail_url)
        `)
        .eq('user_id', userId)
        .order('issued_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('[ProgressService] getUserCertificates error:', error);
      return [];
    }
  }

  /**
   * Verify certificate by number
   * @param {string} certificateNumber - Certificate number
   * @returns {Promise<Object|null>} Certificate data or null
   */
  async verifyCertificate(certificateNumber) {
    try {
      const { data, error } = await supabase
        .from('course_certificates')
        .select('*')
        .eq('certificate_number', certificateNumber)
        .single();

      if (error) return null;
      return data;
    } catch (error) {
      console.error('[ProgressService] verifyCertificate error:', error);
      return null;
    }
  }

  // =====================
  // PRIVATE HELPERS
  // =====================

  /**
   * Update enrollment progress percentage
   * @private
   */
  async _updateEnrollmentProgress(userId, courseId) {
    try {
      // Get total lessons in course
      const { data: modules } = await supabase
        .from('course_modules')
        .select(`
          lessons:course_lessons(id)
        `)
        .eq('course_id', courseId);

      let totalLessons = 0;
      modules?.forEach(m => {
        totalLessons += m.lessons?.length || 0;
      });

      if (totalLessons === 0) return;

      // Get completed lessons
      const { count: completedCount } = await supabase
        .from('lesson_progress')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('course_id', courseId)
        .eq('status', 'completed');

      const percentage = Math.round(((completedCount || 0) / totalLessons) * 100);

      // Update enrollment
      await supabase
        .from('course_enrollments')
        .update({
          progress_percentage: percentage,
          last_accessed_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .eq('course_id', courseId)
        .eq('is_active', true);
    } catch (error) {
      console.error('[ProgressService] _updateEnrollmentProgress error:', error);
    }
  }
}

export const progressService = new ProgressService();
export default progressService;
