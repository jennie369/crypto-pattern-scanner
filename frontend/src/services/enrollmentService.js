/**
 * GEM Web App - Enrollment Service
 * Handles course enrollments and student management
 */

import { supabase } from '../lib/supabaseClient';

/**
 * Enrollment Service Class
 */
class EnrollmentService {
  // =====================
  // STUDENT METHODS
  // =====================

  /**
   * Enroll user in a course
   * @param {string} userId - User ID
   * @param {string} courseId - Course ID
   * @returns {Promise<Object>} Result
   */
  async enroll(userId, courseId) {
    try {
      // Check if already enrolled
      const existing = await this.isEnrolled(userId, courseId);
      if (existing) {
        return { success: false, error: 'Bạn đã đăng ký khóa học này' };
      }

      // Create enrollment
      const { data, error } = await supabase
        .from('course_enrollments')
        .insert({
          user_id: userId,
          course_id: courseId,
          enrolled_at: new Date().toISOString(),
          is_active: true,
          progress_percentage: 0,
        })
        .select()
        .single();

      if (error) throw error;

      return { success: true, data };
    } catch (error) {
      console.error('[EnrollmentService] enroll error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Unenroll user from a course
   * @param {string} userId - User ID
   * @param {string} courseId - Course ID
   * @returns {Promise<Object>} Result
   */
  async unenroll(userId, courseId) {
    try {
      // Soft delete - set is_active to false
      const { error } = await supabase
        .from('course_enrollments')
        .update({
          is_active: false,
          unenrolled_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .eq('course_id', courseId);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('[EnrollmentService] unenroll error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Check if user is enrolled in a course
   * @param {string} userId - User ID
   * @param {string} courseId - Course ID
   * @returns {Promise<boolean>}
   */
  async isEnrolled(userId, courseId) {
    try {
      const { data, error } = await supabase
        .from('course_enrollments')
        .select('id')
        .eq('user_id', userId)
        .eq('course_id', courseId)
        .eq('is_active', true)
        .single();

      if (error) return false;
      return !!data;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get user's enrollment for a course
   * @param {string} userId - User ID
   * @param {string} courseId - Course ID
   * @returns {Promise<Object|null>} Enrollment data
   */
  async getEnrollment(userId, courseId) {
    try {
      const { data, error } = await supabase
        .from('course_enrollments')
        .select('*')
        .eq('user_id', userId)
        .eq('course_id', courseId)
        .eq('is_active', true)
        .single();

      if (error) return null;
      return data;
    } catch (error) {
      console.error('[EnrollmentService] getEnrollment error:', error);
      return null;
    }
  }

  /**
   * Get all user enrollments
   * @param {string} userId - User ID
   * @returns {Promise<Array>} List of enrollments with course data
   */
  async getUserEnrollments(userId) {
    try {
      // Note: courses.created_by references auth.users, not profiles
      // So we can't directly join to profiles. Get course data without creator for now.
      const { data, error } = await supabase
        .from('course_enrollments')
        .select(`
          *,
          course:courses(
            id, title, thumbnail_url, tier_required,
            total_duration_minutes, created_by
          )
        `)
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('enrolled_at', { ascending: false });

      if (error) throw error;

      // Transform data - set default instructor
      return (data || []).map(enrollment => ({
        ...enrollment,
        course: {
          ...enrollment.course,
          instructor: {
            name: 'Gemral',
            avatar: '/default-avatar.png',
          },
        },
      }));
    } catch (error) {
      console.error('[EnrollmentService] getUserEnrollments error:', error);
      return [];
    }
  }

  /**
   * Get user's in-progress courses
   * @param {string} userId - User ID
   * @returns {Promise<Array>} List of in-progress enrollments
   */
  async getInProgressCourses(userId) {
    try {
      const enrollments = await this.getUserEnrollments(userId);
      return enrollments.filter(e =>
        e.progress_percentage > 0 && e.progress_percentage < 100
      );
    } catch (error) {
      console.error('[EnrollmentService] getInProgressCourses error:', error);
      return [];
    }
  }

  /**
   * Get user's completed courses
   * @param {string} userId - User ID
   * @returns {Promise<Array>} List of completed enrollments
   */
  async getCompletedCourses(userId) {
    try {
      const enrollments = await this.getUserEnrollments(userId);
      return enrollments.filter(e => e.progress_percentage >= 100);
    } catch (error) {
      console.error('[EnrollmentService] getCompletedCourses error:', error);
      return [];
    }
  }

  // =====================
  // ADMIN METHODS
  // =====================

  /**
   * Get enrolled students for a course (admin)
   * @param {string} courseId - Course ID
   * @param {Object} options - { limit, offset, search }
   * @returns {Promise<Object>} { students, total }
   */
  async getCourseStudents(courseId, options = {}) {
    try {
      const { limit = 20, offset = 0, search = '' } = options;

      let query = supabase
        .from('course_enrollments')
        .select(`
          *,
          user:profiles!course_enrollments_user_id_fkey(
            id, full_name, email, avatar_url
          )
        `, { count: 'exact' })
        .eq('course_id', courseId)
        .eq('is_active', true)
        .order('enrolled_at', { ascending: false })
        .range(offset, offset + limit - 1);

      const { data, count, error } = await query;

      if (error) throw error;

      // Transform data
      const students = (data || []).map(enrollment => ({
        id: enrollment.user?.id,
        name: enrollment.user?.full_name || 'Người dùng',
        email: enrollment.user?.email,
        avatar: enrollment.user?.avatar_url,
        enrolledAt: enrollment.enrolled_at,
        progress: enrollment.progress_percentage || 0,
        lastAccessedAt: enrollment.last_accessed_at,
      }));

      return {
        students,
        total: count || 0,
      };
    } catch (error) {
      console.error('[EnrollmentService] getCourseStudents error:', error);
      return { students: [], total: 0 };
    }
  }

  /**
   * Update enrollment progress
   * @param {string} userId - User ID
   * @param {string} courseId - Course ID
   * @param {number} percentage - Progress percentage
   * @returns {Promise<Object>} Result
   */
  async updateProgress(userId, courseId, percentage) {
    try {
      const { error } = await supabase
        .from('course_enrollments')
        .update({
          progress_percentage: percentage,
          last_accessed_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .eq('course_id', courseId)
        .eq('is_active', true);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('[EnrollmentService] updateProgress error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get enrollment statistics for a course
   * @param {string} courseId - Course ID
   * @returns {Promise<Object>} Statistics
   */
  async getCourseStats(courseId) {
    try {
      const { data, error } = await supabase
        .from('course_enrollments')
        .select('progress_percentage, enrolled_at')
        .eq('course_id', courseId)
        .eq('is_active', true);

      if (error) throw error;

      const enrollments = data || [];
      const totalStudents = enrollments.length;
      const completedCount = enrollments.filter(e => e.progress_percentage >= 100).length;
      const inProgressCount = enrollments.filter(e =>
        e.progress_percentage > 0 && e.progress_percentage < 100
      ).length;
      const notStartedCount = enrollments.filter(e =>
        !e.progress_percentage || e.progress_percentage === 0
      ).length;

      // Calculate average progress
      const avgProgress = totalStudents > 0
        ? Math.round(enrollments.reduce((sum, e) => sum + (e.progress_percentage || 0), 0) / totalStudents)
        : 0;

      // Enrollments by date (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const recentEnrollments = enrollments.filter(e =>
        new Date(e.enrolled_at) >= thirtyDaysAgo
      ).length;

      return {
        totalStudents,
        completedCount,
        inProgressCount,
        notStartedCount,
        avgProgress,
        recentEnrollments,
        completionRate: totalStudents > 0
          ? Math.round((completedCount / totalStudents) * 100)
          : 0,
      };
    } catch (error) {
      console.error('[EnrollmentService] getCourseStats error:', error);
      return {
        totalStudents: 0,
        completedCount: 0,
        inProgressCount: 0,
        notStartedCount: 0,
        avgProgress: 0,
        recentEnrollments: 0,
        completionRate: 0,
      };
    }
  }

  /**
   * Export students to CSV data
   * @param {string} courseId - Course ID
   * @returns {Promise<Array>} CSV-ready data
   */
  async exportStudentsCSV(courseId) {
    try {
      const { data, error } = await supabase
        .from('course_enrollments')
        .select(`
          *,
          user:profiles!course_enrollments_user_id_fkey(
            full_name, email
          )
        `)
        .eq('course_id', courseId)
        .eq('is_active', true)
        .order('enrolled_at', { ascending: false });

      if (error) throw error;

      return (data || []).map(enrollment => ({
        'Tên': enrollment.user?.full_name || 'N/A',
        'Email': enrollment.user?.email || 'N/A',
        'Ngày đăng ký': new Date(enrollment.enrolled_at).toLocaleDateString('vi-VN'),
        'Tiến độ (%)': enrollment.progress_percentage || 0,
        'Lần truy cập cuối': enrollment.last_accessed_at
          ? new Date(enrollment.last_accessed_at).toLocaleDateString('vi-VN')
          : 'Chưa bắt đầu',
      }));
    } catch (error) {
      console.error('[EnrollmentService] exportStudentsCSV error:', error);
      return [];
    }
  }
}

export const enrollmentService = new EnrollmentService();
export default enrollmentService;
