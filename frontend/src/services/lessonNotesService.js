/**
 * Lesson Notes Service
 * Save and retrieve user notes for course lessons
 */

import { supabase } from '../lib/supabaseClient';

export const lessonNotesService = {
  /**
   * Get note for a specific lesson
   */
  async getNote(lessonId) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { success: false, error: 'Not authenticated' };

      const { data, error } = await supabase
        .from('lesson_notes')
        .select('*')
        .eq('user_id', user.id)
        .eq('lesson_id', lessonId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
        throw error;
      }

      return { success: true, data: data?.content || '' };
    } catch (error) {
      console.error('[LessonNotesService] Error getting note:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Save/update note for a lesson
   */
  async saveNote(lessonId, content) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { success: false, error: 'Not authenticated' };

      // Use upsert function
      const { data, error } = await supabase.rpc('upsert_lesson_note', {
        p_user_id: user.id,
        p_lesson_id: lessonId,
        p_content: content
      });

      if (error) throw error;

      return { success: true, data };
    } catch (error) {
      console.error('[LessonNotesService] Error saving note:', error);
      // Fallback: try direct upsert if function doesn't exist
      return this.saveNoteDirect(lessonId, content);
    }
  },

  /**
   * Direct upsert fallback if RPC function not available
   */
  async saveNoteDirect(lessonId, content) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { success: false, error: 'Not authenticated' };

      const { data, error } = await supabase
        .from('lesson_notes')
        .upsert(
          {
            user_id: user.id,
            lesson_id: lessonId,
            content: content,
            updated_at: new Date().toISOString()
          },
          { onConflict: 'user_id,lesson_id' }
        )
        .select()
        .single();

      if (error) throw error;

      return { success: true, data };
    } catch (error) {
      console.error('[LessonNotesService] Error saving note (direct):', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Delete note for a lesson
   */
  async deleteNote(lessonId) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { success: false, error: 'Not authenticated' };

      const { error } = await supabase
        .from('lesson_notes')
        .delete()
        .eq('user_id', user.id)
        .eq('lesson_id', lessonId);

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error('[LessonNotesService] Error deleting note:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Get all notes for a course (all lessons)
   */
  async getAllNotesForCourse(courseId) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { success: false, error: 'Not authenticated' };

      // First get all lesson IDs for this course
      const { data: lessons, error: lessonsError } = await supabase
        .from('course_lessons')
        .select('id')
        .eq('course_id', courseId);

      if (lessonsError) throw lessonsError;

      const lessonIds = lessons.map(l => l.id);

      // Then get all notes for these lessons
      const { data: notes, error: notesError } = await supabase
        .from('lesson_notes')
        .select('*')
        .eq('user_id', user.id)
        .in('lesson_id', lessonIds);

      if (notesError) throw notesError;

      // Convert to map for easy lookup
      const notesMap = {};
      notes.forEach(note => {
        notesMap[note.lesson_id] = note.content;
      });

      return { success: true, data: notesMap };
    } catch (error) {
      console.error('[LessonNotesService] Error getting all notes:', error);
      return { success: false, error: error.message };
    }
  }
};

export default lessonNotesService;
