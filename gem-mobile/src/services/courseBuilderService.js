/**
 * Gemral - Course Builder Service
 * CRUD operations for courses, modules, and lessons
 * Bug #26 Fix: Add proper validation and error handling
 */

import { supabase } from './supabase';

// =====================================================
// COURSES
// =====================================================

/**
 * Lấy danh sách tất cả khóa học (cho admin)
 */
export const getAllCourses = async () => {
  try {
    const { data, error } = await supabase
      .from('courses')
      .select(`
        *,
        modules:course_modules(count),
        created_by_user:profiles!created_by(full_name, avatar_url)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('[courseBuilderService] getAllCourses error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Lấy chi tiết 1 khóa học với modules và lessons
 */
export const getCourseDetails = async (courseId) => {
  try {
    // Fetch course
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select('*')
      .eq('id', courseId)
      .single();

    if (courseError) throw courseError;

    // Fetch modules first (without nested relations to avoid PGRST200 errors)
    const { data: modules, error: modulesError } = await supabase
      .from('course_modules')
      .select('*')
      .eq('course_id', courseId)
      .order('order_index', { ascending: true });

    if (modulesError) throw modulesError;

    // Fetch lessons for each module separately
    const sortedModules = await Promise.all(
      (modules || []).map(async (module) => {
        try {
          // Fetch lessons for this module
          const { data: lessonsData, error: lessonsError } = await supabase
            .from('course_lessons')
            .select('*')
            .eq('module_id', module.id)
            .order('order_index', { ascending: true });

          if (lessonsError) {
            console.warn('[courseBuilderService] Lessons fetch error for module', module.id, lessonsError);
            return { ...module, lessons: [] };
          }

          // Fetch attachments for each lesson
          const lessonsWithAttachments = await Promise.all(
            (lessonsData || []).map(async (lesson) => {
              try {
                const { data: attachmentsData } = await supabase
                  .from('lesson_attachments')
                  .select('*')
                  .eq('lesson_id', lesson.id);

                return { ...lesson, attachments: attachmentsData || [] };
              } catch (attError) {
                console.warn('[courseBuilderService] Attachments fetch error:', attError);
                return { ...lesson, attachments: [] };
              }
            })
          );

          return { ...module, lessons: lessonsWithAttachments };
        } catch (err) {
          console.warn('[courseBuilderService] Error loading lessons for module:', module.id, err);
          return { ...module, lessons: [] };
        }
      })
    );

    return {
      success: true,
      data: {
        ...course,
        modules: sortedModules,
      },
    };
  } catch (error) {
    console.error('[courseBuilderService] getCourseDetails error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Tạo khóa học mới
 */
export const createCourse = async (courseData) => {
  try {
    const { data: { session } } = await supabase.auth.getSession(); const user = session?.user;
    if (!user) throw new Error('Chưa đăng nhập');

    // Generate course ID from title
    const courseId = generateCourseId(courseData.title);

    const { data, error } = await supabase
      .from('courses')
      .insert({
        id: courseId,
        title: courseData.title,
        description: courseData.description || '',
        tier_required: courseData.tier_required || 'FREE',
        price: courseData.price || 0,
        thumbnail_url: courseData.thumbnail_url || null,
        membership_duration_days: courseData.membership_duration_days || 0,
        shopify_product_id: courseData.shopify_product_id || null,
        drip_enabled: courseData.drip_enabled || false,
        is_published: false,
        created_by: user.id,
      })
      .select()
      .single();

    if (error) throw error;

    // Add creator as course owner
    await supabase.from('course_teachers').insert({
      course_id: data.id,
      teacher_id: user.id,
      role: 'owner',
    });

    return { success: true, data };
  } catch (error) {
    console.error('[courseBuilderService] createCourse error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Cập nhật khóa học
 */
export const updateCourse = async (courseId, updates) => {
  try {
    const { data, error } = await supabase
      .from('courses')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', courseId)
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('[courseBuilderService] updateCourse error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Xóa khóa học
 */
export const deleteCourse = async (courseId) => {
  try {
    const { error } = await supabase
      .from('courses')
      .delete()
      .eq('id', courseId);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('[courseBuilderService] deleteCourse error:', error);
    return { success: false, error: error.message };
  }
};

// =====================================================
// MODULES - Bug #26 Fix
// =====================================================

/**
 * Thêm module mới vào khóa học
 * FIX Bug #26: Validate course exists before adding module
 */
export const addModule = async (courseId, moduleData) => {
  try {
    // Validate courseId
    if (!courseId) {
      throw new Error('Course ID là bắt buộc. Vui lòng lưu khóa học trước.');
    }

    // Check if course exists
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select('id')
      .eq('id', courseId)
      .single();

    if (courseError || !course) {
      console.error('[addModule] Course not found:', courseError);
      throw new Error('Khóa học không tồn tại. Vui lòng lưu khóa học trước khi thêm module.');
    }

    // Get max order_index
    const { data: existingModules } = await supabase
      .from('course_modules')
      .select('order_index')
      .eq('course_id', courseId)
      .order('order_index', { ascending: false })
      .limit(1);

    const nextOrderIndex = existingModules?.length > 0
      ? (existingModules[0].order_index + 1)
      : 0;

    // Generate module ID
    const moduleId = `module-${courseId}-${Date.now()}`;

    // Insert new module
    const { data, error } = await supabase
      .from('course_modules')
      .insert({
        id: moduleId,
        course_id: courseId,
        title: moduleData.title || 'Module mới',
        description: moduleData.description || '',
        order_index: nextOrderIndex,
      })
      .select()
      .single();

    if (error) {
      console.error('[addModule] Insert error:', error);

      // Provide specific error messages
      if (error.code === '42501') {
        throw new Error('Bạn không có quyền thêm module. Vui lòng kiểm tra role admin.');
      } else if (error.code === '23503') {
        throw new Error('Khóa học không tồn tại. Vui lòng refresh và thử lại.');
      }
      throw error;
    }

    return { success: true, data };
  } catch (error) {
    console.error('[courseBuilderService] addModule error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Cập nhật module
 */
export const updateModule = async (moduleId, updates) => {
  try {
    const { data, error } = await supabase
      .from('course_modules')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', moduleId)
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('[courseBuilderService] updateModule error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Xóa module
 */
export const deleteModule = async (moduleId) => {
  try {
    const { error } = await supabase
      .from('course_modules')
      .delete()
      .eq('id', moduleId);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('[courseBuilderService] deleteModule error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Sắp xếp lại modules
 */
export const reorderModules = async (courseId, moduleIds) => {
  try {
    const updates = moduleIds.map((id, index) => ({
      id,
      order_index: index,
    }));

    for (const update of updates) {
      await supabase
        .from('course_modules')
        .update({ order_index: update.order_index })
        .eq('id', update.id);
    }

    return { success: true };
  } catch (error) {
    console.error('[courseBuilderService] reorderModules error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Duplicate module with all lessons
 */
export const duplicateModule = async (courseId, sourceModuleId) => {
  try {
    // Get source module
    const { data: sourceModule, error: moduleError } = await supabase
      .from('course_modules')
      .select('*')
      .eq('id', sourceModuleId)
      .single();

    if (moduleError) throw moduleError;

    // Get max order_index
    const { data: existingModules } = await supabase
      .from('course_modules')
      .select('order_index')
      .eq('course_id', courseId)
      .order('order_index', { ascending: false })
      .limit(1);

    const nextOrderIndex = existingModules?.length > 0
      ? (existingModules[0].order_index + 1)
      : 0;

    // Create new module
    const newModuleId = `module-${courseId}-${Date.now()}`;
    const { data: newModule, error: createError } = await supabase
      .from('course_modules')
      .insert({
        id: newModuleId,
        course_id: courseId,
        title: `${sourceModule.title} (Bản sao)`,
        description: sourceModule.description,
        order_index: nextOrderIndex,
        is_free_preview: sourceModule.is_free_preview,
      })
      .select()
      .single();

    if (createError) throw createError;

    // Get source lessons
    const { data: sourceLessons, error: lessonsError } = await supabase
      .from('course_lessons')
      .select('*')
      .eq('module_id', sourceModuleId)
      .order('order_index', { ascending: true });

    if (lessonsError) throw lessonsError;

    // Duplicate lessons
    if (sourceLessons && sourceLessons.length > 0) {
      const duplicatedLessons = sourceLessons.map((lesson, idx) => ({
        id: `lesson-${newModuleId}-${idx}-${Date.now()}`,
        module_id: newModuleId,
        title: lesson.title,
        description: lesson.description,
        content_type: lesson.content_type,
        video_url: lesson.video_url,
        html_content: lesson.html_content,
        article_content: lesson.article_content,
        duration_minutes: lesson.duration_minutes,
        order_index: idx,
        is_free_preview: lesson.is_free_preview,
      }));

      const { error: dupError } = await supabase
        .from('course_lessons')
        .insert(duplicatedLessons);

      if (dupError) throw dupError;
    }

    return {
      success: true,
      data: {
        ...newModule,
        lessons: sourceLessons?.length || 0,
      },
    };
  } catch (error) {
    console.error('[courseBuilderService] duplicateModule error:', error);
    return { success: false, error: error.message };
  }
};

// =====================================================
// LESSONS
// =====================================================

/**
 * Thêm bài học mới vào module
 */
export const addLesson = async (moduleId, lessonData) => {
  try {
    if (!moduleId) {
      throw new Error('Module ID là bắt buộc');
    }

    // Get max order_index
    const { data: existingLessons } = await supabase
      .from('course_lessons')
      .select('order_index')
      .eq('module_id', moduleId)
      .order('order_index', { ascending: false })
      .limit(1);

    const nextOrderIndex = existingLessons?.length > 0
      ? (existingLessons[0].order_index + 1)
      : 0;

    const lessonId = `lesson-${moduleId}-${Date.now()}`;

    const { data, error } = await supabase
      .from('course_lessons')
      .insert({
        id: lessonId,
        module_id: moduleId,
        title: lessonData.title || 'Bài học mới',
        description: lessonData.description || '',
        content_type: lessonData.content_type || 'video',
        video_url: lessonData.video_url || null,
        html_content: lessonData.html_content || null,
        article_content: lessonData.article_content || null,
        duration_minutes: lessonData.duration_minutes || 0,
        order_index: nextOrderIndex,
        is_free_preview: lessonData.is_free_preview || false,
      })
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('[courseBuilderService] addLesson error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Cập nhật bài học
 */
export const updateLesson = async (lessonId, updates) => {
  try {
    const { data, error } = await supabase
      .from('course_lessons')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', lessonId)
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('[courseBuilderService] updateLesson error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Xóa bài học
 */
export const deleteLesson = async (lessonId) => {
  try {
    const { error } = await supabase
      .from('course_lessons')
      .delete()
      .eq('id', lessonId);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('[courseBuilderService] deleteLesson error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Sắp xếp lại lessons trong module
 */
export const reorderLessons = async (moduleId, lessonIds) => {
  try {
    for (let i = 0; i < lessonIds.length; i++) {
      await supabase
        .from('course_lessons')
        .update({ order_index: i })
        .eq('id', lessonIds[i]);
    }
    return { success: true };
  } catch (error) {
    console.error('[courseBuilderService] reorderLessons error:', error);
    return { success: false, error: error.message };
  }
};

// =====================================================
// HTML CONTENT
// =====================================================

/**
 * Lưu HTML content cho bài học
 */
export const saveHTMLContent = async (lessonId, htmlContent) => {
  try {
    const { data, error } = await supabase
      .from('course_lessons')
      .update({
        html_content: htmlContent,
        content_type: 'html',
        updated_at: new Date().toISOString(),
      })
      .eq('id', lessonId)
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('[courseBuilderService] saveHTMLContent error:', error);
    return { success: false, error: error.message };
  }
};

// =====================================================
// HELPERS
// =====================================================

/**
 * Generate course ID from title
 */
const generateCourseId = (title) => {
  return 'course-' + title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .substring(0, 50);
};

// =====================================================
// EXPORTS
// =====================================================

export default {
  // Courses
  getAllCourses,
  getCourseDetails,
  createCourse,
  updateCourse,
  deleteCourse,
  // Modules
  addModule,
  updateModule,
  deleteModule,
  reorderModules,
  duplicateModule,
  // Lessons
  addLesson,
  updateLesson,
  deleteLesson,
  reorderLessons,
  // HTML
  saveHTMLContent,
};
