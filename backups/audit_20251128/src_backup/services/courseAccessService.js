/**
 * Gemral - Course Access Service
 * Manages course enrollment, access control, and student management
 */

import { supabase } from './supabase';

class CourseAccessService {

  /**
   * Check if user has access to a course
   * @param {string} userId - User UUID
   * @param {string} courseId - Course ID
   * @returns {Promise<{has_access: boolean, reason: string, expires_at: string|null}>}
   */
  async checkAccess(userId, courseId) {
    try {
      const { data, error } = await supabase
        .rpc('check_course_access', {
          user_id_param: userId,
          course_id_param: courseId
        });

      if (error) throw error;

      return data?.[0] || { has_access: false, reason: 'error' };
    } catch (error) {
      console.error('[CourseAccessService] checkAccess error:', error);
      return { has_access: false, reason: 'error' };
    }
  }

  /**
   * Grant access to a course
   * @param {Object} params - Grant parameters
   * @param {string} params.userId - User UUID
   * @param {string} params.courseId - Course ID
   * @param {string} [params.accessType='admin_grant'] - Access type
   * @param {number} [params.durationDays=null] - Duration in days (null = lifetime)
   * @returns {Promise<{success: boolean, enrollmentId?: string, error?: string}>}
   */
  async grantAccess({
    userId,
    courseId,
    accessType = 'admin_grant',
    durationDays = null
  }) {
    try {
      const { data, error } = await supabase
        .rpc('grant_course_access', {
          user_id_param: userId,
          course_id_param: courseId,
          access_source_param: accessType,
          duration_days_param: durationDays
        });

      if (error) throw error;

      return { success: true, enrollmentId: data };
    } catch (error) {
      console.error('[CourseAccessService] grantAccess error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Revoke access to a course
   * @param {string} userId - User UUID
   * @param {string} courseId - Course ID
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async revokeAccess(userId, courseId) {
    try {
      const { error } = await supabase
        .from('course_enrollments')
        .delete()
        .eq('user_id', userId)
        .eq('course_id', courseId);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('[CourseAccessService] revokeAccess error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get user's enrolled courses
   * @param {string} userId - User UUID
   * @returns {Promise<Array>}
   */
  async getEnrolledCourses(userId) {
    try {
      const { data, error } = await supabase
        .from('course_enrollments')
        .select(`
          *,
          course:courses(*)
        `)
        .eq('user_id', userId)
        .order('enrolled_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('[CourseAccessService] getEnrolledCourses error:', error);
      return [];
    }
  }

  /**
   * Get all students enrolled in a course (for admin)
   * @param {string} courseId - Course ID
   * @param {Object} [options] - Filter options
   * @param {boolean} [options.activeOnly=false] - Only active enrollments
   * @returns {Promise<Array>}
   */
  async getCourseStudents(courseId, options = {}) {
    try {
      let query = supabase
        .from('course_enrollments')
        .select(`
          *,
          user:profiles(id, full_name, username, email, avatar_url, scanner_tier)
        `)
        .eq('course_id', courseId);

      // Get lesson progress for each student
      const { data: enrollments, error } = await query
        .order('enrolled_at', { ascending: false });

      if (error) throw error;

      // Calculate progress for each student
      const studentsWithProgress = await Promise.all(
        (enrollments || []).map(async (enrollment) => {
          const progress = await this.getStudentProgress(enrollment.user_id, courseId);
          return {
            ...enrollment,
            progress_percent: progress
          };
        })
      );

      return studentsWithProgress;
    } catch (error) {
      console.error('[CourseAccessService] getCourseStudents error:', error);
      return [];
    }
  }

  /**
   * Get student's progress for a specific course
   * @param {string} userId - User UUID
   * @param {string} courseId - Course ID
   * @returns {Promise<number>} Progress percentage
   */
  async getStudentProgress(userId, courseId) {
    try {
      const { data, error } = await supabase
        .rpc('calculate_course_progress', {
          user_id_param: userId,
          course_id_param: courseId
        });

      if (error) throw error;
      return data || 0;
    } catch (error) {
      console.error('[CourseAccessService] getStudentProgress error:', error);
      return 0;
    }
  }

  /**
   * Update enrollment (extend expiry, change source)
   * @param {string} enrollmentId - Enrollment UUID
   * @param {Object} updates - Fields to update
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async updateEnrollment(enrollmentId, updates) {
    try {
      const { error } = await supabase
        .from('course_enrollments')
        .update(updates)
        .eq('id', enrollmentId);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('[CourseAccessService] updateEnrollment error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Batch grant access to multiple users
   * @param {Array<string>} userIds - Array of User UUIDs
   * @param {string} courseId - Course ID
   * @param {Object} [options] - Grant options
   * @returns {Promise<Array<{userId: string, success: boolean, error?: string}>>}
   */
  async batchGrantAccess(userIds, courseId, options = {}) {
    const results = [];

    for (const userId of userIds) {
      const result = await this.grantAccess({
        userId,
        courseId,
        ...options
      });
      results.push({ userId, ...result });
    }

    return results;
  }

  /**
   * Search users by email or name (for granting access)
   * @param {string} query - Search query
   * @param {number} [limit=20] - Max results
   * @returns {Promise<Array>}
   */
  async searchUsers(query, limit = 20) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, username, email, avatar_url, scanner_tier')
        .or(`email.ilike.%${query}%,full_name.ilike.%${query}%,username.ilike.%${query}%`)
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('[CourseAccessService] searchUsers error:', error);
      return [];
    }
  }

  /**
   * Get enrollment details
   * @param {string} userId - User UUID
   * @param {string} courseId - Course ID
   * @returns {Promise<Object|null>}
   */
  async getEnrollment(userId, courseId) {
    try {
      const { data, error } = await supabase
        .from('course_enrollments')
        .select('*')
        .eq('user_id', userId)
        .eq('course_id', courseId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    } catch (error) {
      console.error('[CourseAccessService] getEnrollment error:', error);
      return null;
    }
  }

  /**
   * Get course teachers
   * @param {string} courseId - Course ID
   * @returns {Promise<Array>}
   */
  async getCourseTeachers(courseId) {
    try {
      const { data, error } = await supabase
        .from('course_teachers')
        .select(`
          *,
          teacher:profiles(id, full_name, username, email, avatar_url)
        `)
        .eq('course_id', courseId);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('[CourseAccessService] getCourseTeachers error:', error);
      return [];
    }
  }

  /**
   * Add teacher to course
   * @param {string} courseId - Course ID
   * @param {string} teacherId - Teacher's User UUID
   * @param {string} [role='teacher'] - Role: 'owner', 'teacher', 'assistant'
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async addTeacher(courseId, teacherId, role = 'teacher') {
    try {
      const { error } = await supabase
        .from('course_teachers')
        .insert({
          course_id: courseId,
          teacher_id: teacherId,
          role
        });

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('[CourseAccessService] addTeacher error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Remove teacher from course
   * @param {string} courseId - Course ID
   * @param {string} teacherId - Teacher's User UUID
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async removeTeacher(courseId, teacherId) {
    try {
      const { error } = await supabase
        .from('course_teachers')
        .delete()
        .eq('course_id', courseId)
        .eq('teacher_id', teacherId);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('[CourseAccessService] removeTeacher error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get enrollment statistics for a course
   * @param {string} courseId - Course ID
   * @returns {Promise<Object>}
   */
  async getCourseStats(courseId) {
    try {
      // Get total enrollments
      const { data: enrollments, error: enrollError } = await supabase
        .from('course_enrollments')
        .select('id, completed_at')
        .eq('course_id', courseId);

      if (enrollError) throw enrollError;

      const total = enrollments?.length || 0;
      const completed = enrollments?.filter(e => e.completed_at).length || 0;

      return {
        totalStudents: total,
        completedStudents: completed,
        inProgressStudents: total - completed,
        completionRate: total > 0 ? Math.round((completed / total) * 100) : 0
      };
    } catch (error) {
      console.error('[CourseAccessService] getCourseStats error:', error);
      return {
        totalStudents: 0,
        completedStudents: 0,
        inProgressStudents: 0,
        completionRate: 0
      };
    }
  }
}

export const courseAccessService = new CourseAccessService();
export default courseAccessService;
