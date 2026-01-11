/**
 * GEM Web App - Lesson Service
 * Handles lesson CRUD operations, attachments, and reordering
 */

import { supabase } from '../lib/supabaseClient';

/**
 * Lesson Service Class
 */
class LessonService {
  // =====================
  // ID GENERATION
  // =====================

  /**
   * Generate a unique lesson ID
   */
  _generateLessonId() {
    const timestamp = Date.now().toString(36);
    const randomPart = Math.random().toString(36).substring(2, 8);
    return `lesson-${timestamp}-${randomPart}`;
  }

  // =====================
  // CRUD METHODS
  // =====================

  /**
   * Create a new lesson
   * @param {Object} lessonData - Lesson data
   * @returns {Promise<Object>} Result
   */
  async createLesson(lessonData) {
    try {
      // Get max order_index in module
      const { data: existing } = await supabase
        .from('course_lessons')
        .select('order_index')
        .eq('module_id', lessonData.module_id)
        .order('order_index', { ascending: false })
        .limit(1);

      const newOrder = (existing?.[0]?.order_index || 0) + 1;

      // Generate unique ID (course_lessons uses TEXT id)
      const lessonId = this._generateLessonId();

      const { data, error } = await supabase
        .from('course_lessons')
        .insert({
          id: lessonId,
          ...lessonData,
          order_index: newOrder,
        })
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('[LessonService] createLesson error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get lesson by ID
   * @param {string} lessonId - Lesson ID
   * @returns {Promise<Object|null>} Lesson data
   */
  async getLesson(lessonId) {
    try {
      console.log('[LessonService] getLesson called with id:', lessonId);

      // First try simple query without relations (more reliable)
      const { data, error } = await supabase
        .from('course_lessons')
        .select('*')
        .eq('id', lessonId)
        .single();

      if (error) {
        console.error('[LessonService] getLesson query error:', error);
        throw error;
      }

      console.log('[LessonService] getLesson result:', data ? 'Found' : 'Not found');
      return data;
    } catch (error) {
      console.error('[LessonService] getLesson error:', error);
      return null;
    }
  }

  /**
   * Update lesson
   * @param {string} lessonId - Lesson ID
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object>} Result
   */
  async updateLesson(lessonId, updates) {
    try {
      console.log('[LessonService] updateLesson called:', {
        lessonId,
        updates: {
          ...updates,
          content: updates.content ? `[${updates.content.length} chars]` : 'NO CONTENT',
        }
      });

      const { data, error } = await supabase
        .from('course_lessons')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', lessonId)
        .select()
        .single();

      if (error) {
        console.error('[LessonService] updateLesson DB error:', error);
        throw error;
      }

      console.log('[LessonService] updateLesson success:', {
        id: data?.id,
        title: data?.title,
        type: data?.type,
        hasContent: !!data?.content,
        contentLength: data?.content?.length || 0,
      });

      return { success: true, data };
    } catch (error) {
      console.error('[LessonService] updateLesson error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Delete lesson
   * @param {string} lessonId - Lesson ID
   * @returns {Promise<Object>} Result
   */
  async deleteLesson(lessonId) {
    try {
      const { error } = await supabase
        .from('course_lessons')
        .delete()
        .eq('id', lessonId);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('[LessonService] deleteLesson error:', error);
      return { success: false, error: error.message };
    }
  }

  // =====================
  // REORDER METHODS
  // =====================

  /**
   * Reorder lessons within a module (drag & drop)
   * @param {string} moduleId - Module ID
   * @param {Array} lessonIds - Ordered array of lesson IDs
   * @returns {Promise<Object>} Result
   */
  async reorderLessons(moduleId, lessonIds) {
    try {
      const updates = lessonIds.map((id, index) => ({
        id,
        order_index: index + 1,
      }));

      for (const update of updates) {
        await supabase
          .from('course_lessons')
          .update({ order_index: update.order_index })
          .eq('id', update.id);
      }

      return { success: true };
    } catch (error) {
      console.error('[LessonService] reorderLessons error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Move lesson to a different module
   * @param {string} lessonId - Lesson ID
   * @param {string} newModuleId - Target module ID
   * @returns {Promise<Object>} Result
   */
  async moveLesson(lessonId, newModuleId) {
    try {
      // Get max order in new module
      const { data: existing } = await supabase
        .from('course_lessons')
        .select('order_index')
        .eq('module_id', newModuleId)
        .order('order_index', { ascending: false })
        .limit(1);

      const newOrder = (existing?.[0]?.order_index || 0) + 1;

      const { error } = await supabase
        .from('course_lessons')
        .update({
          module_id: newModuleId,
          order_index: newOrder,
        })
        .eq('id', lessonId);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('[LessonService] moveLesson error:', error);
      return { success: false, error: error.message };
    }
  }

  // =====================
  // ATTACHMENT METHODS
  // =====================

  /**
   * Upload attachment to a lesson
   * @param {string} lessonId - Lesson ID
   * @param {string} courseId - Course ID
   * @param {File} file - File to upload
   * @returns {Promise<Object>} Result with attachment data
   */
  async uploadAttachment(lessonId, courseId, file) {
    try {
      const fileName = `${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
      const filePath = `courses/${courseId}/lessons/${lessonId}/${fileName}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('course-files')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('course-files')
        .getPublicUrl(filePath);

      // Save attachment record to database
      const { data, error } = await supabase
        .from('lesson_attachments')
        .insert({
          lesson_id: lessonId,
          course_id: courseId,
          file_name: file.name,
          file_url: urlData.publicUrl,
          file_type: file.type,
          file_size_bytes: file.size,
        })
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('[LessonService] uploadAttachment error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Delete attachment
   * @param {string} attachmentId - Attachment ID
   * @returns {Promise<Object>} Result
   */
  async deleteAttachment(attachmentId) {
    try {
      // Get attachment info first
      const { data: attachment } = await supabase
        .from('lesson_attachments')
        .select('file_url')
        .eq('id', attachmentId)
        .single();

      // Delete from database
      const { error } = await supabase
        .from('lesson_attachments')
        .delete()
        .eq('id', attachmentId);

      if (error) throw error;

      // TODO: Also delete from storage if needed
      // (Supabase storage deletion based on URL)

      return { success: true };
    } catch (error) {
      console.error('[LessonService] deleteAttachment error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get attachments for a lesson
   * @param {string} lessonId - Lesson ID
   * @returns {Promise<Array>} List of attachments
   */
  async getAttachments(lessonId) {
    try {
      const { data, error } = await supabase
        .from('lesson_attachments')
        .select('*')
        .eq('lesson_id', lessonId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('[LessonService] getAttachments error:', error);
      return [];
    }
  }

  // =====================
  // UTILITY METHODS
  // =====================

  /**
   * Get lesson types
   */
  getLessonTypes() {
    return [
      { id: 'video', name: 'Video', icon: 'Video' },
      { id: 'article', name: 'Bài viết', icon: 'FileText' },
      { id: 'quiz', name: 'Quiz', icon: 'HelpCircle' },
    ];
  }

  /**
   * Get next lesson in course
   * @param {string} courseId - Course ID
   * @param {string} currentLessonId - Current lesson ID
   * @returns {Promise<Object|null>} Next lesson or null
   */
  async getNextLesson(courseId, currentLessonId) {
    try {
      // Get all lessons for course ordered
      const { data: modules } = await supabase
        .from('course_modules')
        .select(`
          id, order_index,
          lessons:course_lessons(id, title, order_index)
        `)
        .eq('course_id', courseId)
        .order('order_index');

      if (!modules) return null;

      // Flatten lessons in order
      const allLessons = [];
      modules.sort((a, b) => a.order_index - b.order_index).forEach(module => {
        const sorted = (module.lessons || []).sort((a, b) => a.order_index - b.order_index);
        sorted.forEach(lesson => {
          allLessons.push({
            ...lesson,
            moduleId: module.id,
          });
        });
      });

      // Find current lesson index
      const currentIndex = allLessons.findIndex(l => l.id === currentLessonId);
      if (currentIndex === -1 || currentIndex >= allLessons.length - 1) {
        return null;
      }

      return allLessons[currentIndex + 1];
    } catch (error) {
      console.error('[LessonService] getNextLesson error:', error);
      return null;
    }
  }

  /**
   * Get previous lesson in course
   * @param {string} courseId - Course ID
   * @param {string} currentLessonId - Current lesson ID
   * @returns {Promise<Object|null>} Previous lesson or null
   */
  async getPreviousLesson(courseId, currentLessonId) {
    try {
      const { data: modules } = await supabase
        .from('course_modules')
        .select(`
          id, order_index,
          lessons:course_lessons(id, title, order_index)
        `)
        .eq('course_id', courseId)
        .order('order_index');

      if (!modules) return null;

      const allLessons = [];
      modules.sort((a, b) => a.order_index - b.order_index).forEach(module => {
        const sorted = (module.lessons || []).sort((a, b) => a.order_index - b.order_index);
        sorted.forEach(lesson => {
          allLessons.push({
            ...lesson,
            moduleId: module.id,
          });
        });
      });

      const currentIndex = allLessons.findIndex(l => l.id === currentLessonId);
      if (currentIndex <= 0) {
        return null;
      }

      return allLessons[currentIndex - 1];
    } catch (error) {
      console.error('[LessonService] getPreviousLesson error:', error);
      return null;
    }
  }
}

export const lessonService = new LessonService();
export default lessonService;
