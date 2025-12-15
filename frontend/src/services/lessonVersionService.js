/**
 * Lesson Version Service
 * Handles version history management for lesson content
 */

import { supabase } from '../lib/supabaseClient';

class LessonVersionService {
  /**
   * Get all versions for a lesson
   * @param {string} lessonId - Lesson ID
   * @returns {Promise<{data: Array, error: any}>}
   */
  async getVersions(lessonId) {
    try {
      const { data, error } = await supabase
        .from('lesson_versions')
        .select(`
          id,
          lesson_id,
          version_number,
          html_content,
          parsed_content,
          created_by,
          created_at,
          creator:profiles!lesson_versions_created_by_fkey(
            id,
            full_name,
            avatar_url
          )
        `)
        .eq('lesson_id', lessonId)
        .order('version_number', { ascending: false });

      if (error) throw error;

      return { data: data || [], error: null };
    } catch (error) {
      console.error('[LessonVersionService] getVersions error:', error);
      return { data: [], error };
    }
  }

  /**
   * Get a specific version
   * @param {string} versionId - Version UUID
   * @returns {Promise<{data: object, error: any}>}
   */
  async getVersion(versionId) {
    try {
      const { data, error } = await supabase
        .from('lesson_versions')
        .select(`
          *,
          creator:profiles!lesson_versions_created_by_fkey(
            id,
            full_name,
            avatar_url
          )
        `)
        .eq('id', versionId)
        .single();

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error('[LessonVersionService] getVersion error:', error);
      return { data: null, error };
    }
  }

  /**
   * Restore a lesson to a specific version
   * @param {string} lessonId - Lesson ID
   * @param {string} versionId - Version UUID to restore
   * @returns {Promise<{success: boolean, error: any}>}
   */
  async restoreVersion(lessonId, versionId) {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user?.user?.id) {
        throw new Error('Unauthorized');
      }

      // Use the database function for safe restore
      const { data, error } = await supabase.rpc('restore_lesson_version', {
        p_lesson_id: lessonId,
        p_version_id: versionId,
        p_user_id: user.user.id,
      });

      if (error) throw error;

      return { success: data === true, error: null };
    } catch (error) {
      console.error('[LessonVersionService] restoreVersion error:', error);
      return { success: false, error };
    }
  }

  /**
   * Delete old versions (keep last N versions)
   * @param {string} lessonId - Lesson ID
   * @param {number} keepCount - Number of versions to keep (default: 10)
   * @returns {Promise<{deleted: number, error: any}>}
   */
  async cleanupVersions(lessonId, keepCount = 10) {
    try {
      // Get versions to delete
      const { data: versions, error: fetchError } = await supabase
        .from('lesson_versions')
        .select('id, version_number')
        .eq('lesson_id', lessonId)
        .order('version_number', { ascending: false });

      if (fetchError) throw fetchError;

      if (!versions || versions.length <= keepCount) {
        return { deleted: 0, error: null };
      }

      // Delete older versions
      const versionsToDelete = versions.slice(keepCount);
      const idsToDelete = versionsToDelete.map(v => v.id);

      const { error: deleteError } = await supabase
        .from('lesson_versions')
        .delete()
        .in('id', idsToDelete);

      if (deleteError) throw deleteError;

      return { deleted: idsToDelete.length, error: null };
    } catch (error) {
      console.error('[LessonVersionService] cleanupVersions error:', error);
      return { deleted: 0, error };
    }
  }

  /**
   * Get version count for a lesson
   * @param {string} lessonId - Lesson ID
   * @returns {Promise<number>}
   */
  async getVersionCount(lessonId) {
    try {
      const { count, error } = await supabase
        .from('lesson_versions')
        .select('*', { count: 'exact', head: true })
        .eq('lesson_id', lessonId);

      if (error) throw error;

      return count || 0;
    } catch (error) {
      console.error('[LessonVersionService] getVersionCount error:', error);
      return 0;
    }
  }

  /**
   * Compare two versions (get diff summary)
   * @param {string} versionId1 - First version ID
   * @param {string} versionId2 - Second version ID
   * @returns {Promise<{data: object, error: any}>}
   */
  async compareVersions(versionId1, versionId2) {
    try {
      const [v1Result, v2Result] = await Promise.all([
        this.getVersion(versionId1),
        this.getVersion(versionId2),
      ]);

      if (v1Result.error || v2Result.error) {
        throw v1Result.error || v2Result.error;
      }

      const v1 = v1Result.data;
      const v2 = v2Result.data;

      // Basic diff info
      const comparison = {
        version1: {
          id: v1.id,
          version_number: v1.version_number,
          created_at: v1.created_at,
          creator: v1.creator,
          blockCount: v1.parsed_content?.blocks?.length || 0,
          quizCount: v1.parsed_content?.quizzes?.length || 0,
          contentLength: v1.html_content?.length || 0,
        },
        version2: {
          id: v2.id,
          version_number: v2.version_number,
          created_at: v2.created_at,
          creator: v2.creator,
          blockCount: v2.parsed_content?.blocks?.length || 0,
          quizCount: v2.parsed_content?.quizzes?.length || 0,
          contentLength: v2.html_content?.length || 0,
        },
        changes: {
          blocksAdded: (v2.parsed_content?.blocks?.length || 0) - (v1.parsed_content?.blocks?.length || 0),
          quizzesAdded: (v2.parsed_content?.quizzes?.length || 0) - (v1.parsed_content?.quizzes?.length || 0),
          contentLengthDiff: (v2.html_content?.length || 0) - (v1.html_content?.length || 0),
        },
      };

      return { data: comparison, error: null };
    } catch (error) {
      console.error('[LessonVersionService] compareVersions error:', error);
      return { data: null, error };
    }
  }
}

// Export singleton instance
export const lessonVersionService = new LessonVersionService();
export default LessonVersionService;
