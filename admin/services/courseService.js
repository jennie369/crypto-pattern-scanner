/**
 * Course Service for Admin Dashboard
 * CRUD operations for course management
 */

import { supabase } from './supabase';

// ============================================
// COURSE QUERIES
// ============================================

/**
 * Get all courses with filters
 */
export async function getCourses({
  status = 'all',
  search = '',
  page = 1,
  limit = 50
}) {
  try {
    let query = supabase
      .from('courses')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    if (status !== 'all') {
      query = query.eq('status', status);
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }

    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data, count, error } = await query;

    if (error) throw error;

    return {
      success: true,
      data: data || [],
      total: count || 0,
      page,
      totalPages: Math.ceil((count || 0) / limit),
    };
  } catch (error) {
    console.error('[courseService] getCourses error:', error);
    return { success: false, data: [], total: 0, error: error.message };
  }
}

/**
 * Get course by ID with modules
 */
export async function getCourseById(courseId) {
  try {
    const { data, error } = await supabase
      .from('courses')
      .select(`
        *,
        modules:course_modules(
          *,
          lessons:course_lessons(*)
        )
      `)
      .eq('id', courseId)
      .single();

    if (error) throw error;

    return { success: true, data };
  } catch (error) {
    console.error('[courseService] getCourseById error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Create a new course
 */
export async function createCourse(courseData) {
  try {
    const cleanedData = {
      title: courseData.title?.trim() || '',
      subtitle: courseData.subtitle?.trim() || null,
      description: courseData.description?.trim() || null,
      thumbnail_url: courseData.thumbnail_url || null,
      preview_video_url: courseData.preview_video_url || null,
      tier_required: courseData.tier_required || 'free',
      price: courseData.price || 0,
      original_price: courseData.original_price || null,
      currency: courseData.currency || 'VND',
      status: courseData.status || 'draft',
      is_featured: courseData.is_featured ?? false,
      display_order: courseData.display_order || 0,
      estimated_duration: courseData.estimated_duration || null,
      difficulty_level: courseData.difficulty_level || 'beginner',
      tags: courseData.tags || [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('courses')
      .insert(cleanedData)
      .select()
      .single();

    if (error) throw error;

    return { success: true, data };
  } catch (error) {
    console.error('[courseService] createCourse error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Update a course
 */
export async function updateCourse(courseId, updates) {
  try {
    const cleanedUpdates = {
      ...updates,
      updated_at: new Date().toISOString(),
    };

    Object.keys(cleanedUpdates).forEach(key => {
      if (cleanedUpdates[key] === undefined) {
        delete cleanedUpdates[key];
      }
    });

    const { data, error } = await supabase
      .from('courses')
      .update(cleanedUpdates)
      .eq('id', courseId)
      .select()
      .single();

    if (error) throw error;

    return { success: true, data };
  } catch (error) {
    console.error('[courseService] updateCourse error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Delete a course
 */
export async function deleteCourse(courseId) {
  try {
    const { error } = await supabase
      .from('courses')
      .delete()
      .eq('id', courseId);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error('[courseService] deleteCourse error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get course statistics
 */
export async function getCourseStats() {
  try {
    const { data: courses, error } = await supabase
      .from('courses')
      .select('id, status, tier_required');

    if (error) throw error;

    const total = courses?.length || 0;
    const published = courses?.filter(c => c.status === 'published').length || 0;
    const draft = courses?.filter(c => c.status === 'draft').length || 0;

    // Get enrollment count
    const { count: totalEnrollments } = await supabase
      .from('course_enrollments')
      .select('*', { count: 'exact', head: true });

    return {
      success: true,
      data: {
        total,
        published,
        draft,
        totalEnrollments: totalEnrollments || 0,
      },
    };
  } catch (error) {
    console.error('[courseService] getCourseStats error:', error);
    return { success: false, error: error.message };
  }
}

// ============================================
// MODULE OPERATIONS
// ============================================

export async function createModule(courseId, moduleData) {
  try {
    const { data, error } = await supabase
      .from('course_modules')
      .insert({
        course_id: courseId,
        title: moduleData.title?.trim() || '',
        description: moduleData.description?.trim() || null,
        display_order: moduleData.display_order || 0,
        is_free_preview: moduleData.is_free_preview ?? false,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    return { success: true, data };
  } catch (error) {
    console.error('[courseService] createModule error:', error);
    return { success: false, error: error.message };
  }
}

export async function updateModule(moduleId, updates) {
  try {
    const { data, error } = await supabase
      .from('course_modules')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', moduleId)
      .select()
      .single();

    if (error) throw error;

    return { success: true, data };
  } catch (error) {
    console.error('[courseService] updateModule error:', error);
    return { success: false, error: error.message };
  }
}

export async function deleteModule(moduleId) {
  try {
    const { error } = await supabase
      .from('course_modules')
      .delete()
      .eq('id', moduleId);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error('[courseService] deleteModule error:', error);
    return { success: false, error: error.message };
  }
}

// ============================================
// LESSON OPERATIONS
// ============================================

export async function createLesson(moduleId, lessonData) {
  try {
    const { data, error } = await supabase
      .from('course_lessons')
      .insert({
        module_id: moduleId,
        title: lessonData.title?.trim() || '',
        description: lessonData.description?.trim() || null,
        content_type: lessonData.content_type || 'video',
        content_url: lessonData.content_url || null,
        content_text: lessonData.content_text || null,
        duration_minutes: lessonData.duration_minutes || 0,
        display_order: lessonData.display_order || 0,
        is_free_preview: lessonData.is_free_preview ?? false,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    return { success: true, data };
  } catch (error) {
    console.error('[courseService] createLesson error:', error);
    return { success: false, error: error.message };
  }
}

export async function updateLesson(lessonId, updates) {
  try {
    const { data, error } = await supabase
      .from('course_lessons')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', lessonId)
      .select()
      .single();

    if (error) throw error;

    return { success: true, data };
  } catch (error) {
    console.error('[courseService] updateLesson error:', error);
    return { success: false, error: error.message };
  }
}

export async function deleteLesson(lessonId) {
  try {
    const { error } = await supabase
      .from('course_lessons')
      .delete()
      .eq('id', lessonId);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error('[courseService] deleteLesson error:', error);
    return { success: false, error: error.message };
  }
}

// ============================================
// ENROLLMENT OPERATIONS
// ============================================

export async function getCourseStudents(courseId, page = 1, limit = 50) {
  try {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, count, error } = await supabase
      .from('course_enrollments')
      .select(`
        *,
        user:profiles(id, display_name, email, avatar_url)
      `, { count: 'exact' })
      .eq('course_id', courseId)
      .order('enrolled_at', { ascending: false })
      .range(from, to);

    if (error) throw error;

    return {
      success: true,
      data: data || [],
      total: count || 0,
    };
  } catch (error) {
    console.error('[courseService] getCourseStudents error:', error);
    return { success: false, data: [], error: error.message };
  }
}

export default {
  getCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  getCourseStats,
  createModule,
  updateModule,
  deleteModule,
  createLesson,
  updateLesson,
  deleteLesson,
  getCourseStudents,
};
