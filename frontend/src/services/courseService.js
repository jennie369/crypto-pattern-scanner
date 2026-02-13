/**
 * GEM Web App - Course Service
 * Supabase-powered course service synced with Mobile App
 * Supports: courses, modules, lessons, enrollments, progress
 */

import { supabase } from '../lib/supabaseClient';

// Tier order for comparison
const TIER_ORDER = ['FREE', 'TIER1', 'TIER2', 'TIER3'];

/**
 * Course Service Class
 * Mirrors mobile courseService.js structure
 */
class CourseService {
  constructor() {
    this._coursesCache = null;
    this._lastFetchTime = null;
    this._cacheTimeout = 5 * 60 * 1000; // 5 minutes cache
  }

  /**
   * Check if cache is still valid
   */
  _isCacheValid() {
    if (!this._lastFetchTime) return false;
    return Date.now() - this._lastFetchTime < this._cacheTimeout;
  }

  // =====================
  // STUDENT METHODS
  // =====================

  /**
   * Get published courses for catalog
   * @param {Object} options - Filter options { category, tier, search }
   * @returns {Promise<Array>} List of courses
   */
  async getPublishedCourses(options = {}) {
    try {
      let query = supabase
        .from('courses')
        .select(`
          *,
          modules:course_modules(count),
          lessons:course_lessons(count),
          enrollments:course_enrollments(count)
        `)
        .eq('is_published', true);

      // Filter by tier
      if (options.tier) {
        query = query.eq('tier_required', options.tier);
      }

      // Filter by category
      if (options.category) {
        query = query.eq('category', options.category);
      }

      // Search by title or description
      if (options.search) {
        query = query.or(`title.ilike.%${options.search}%,description.ilike.%${options.search}%`);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      // Transform data to expected format
      // Database fields: total_lessons, students_count, duration_hours, rating, thumbnail_url
      const courses = (data || []).map(course => ({
        ...course,
        // Use direct DB fields first, fallback to counted values
        moduleCount: course.modules?.[0]?.count || 0,
        lessonCount: course.total_lessons || course.lessons?.[0]?.count || 0,
        studentCount: course.students_count || course.enrollments?.[0]?.count || 0,
        // Duration: database has duration_hours, convert to minutes for display
        durationMinutes: (course.duration_hours || 0) * 60,
        // Thumbnail from DB
        thumbnail: course.thumbnail_url || null,
        // Rating from DB (already stored)
        rating: course.rating || 0,
        // Instructor info
        instructor: {
          name: course.instructor_name || 'Gemral',
          avatar: course.instructor_avatar || '/default-avatar.png',
        },
      }));

      this._coursesCache = courses;
      this._lastFetchTime = Date.now();

      return courses;
    } catch (error) {
      console.error('[CourseService] getPublishedCourses error:', error);
      return [];
    }
  }

  /**
   * Get course detail with modules and lessons
   * @param {string} courseId - Course ID
   * @param {string} userId - Current user ID (optional)
   * @returns {Promise<Object|null>} Course detail
   */
  async getCourseDetail(courseId, userId = null) {
    try {
      // First get the course with modules and lessons
      // Note: course_lessons uses 'type' not 'lesson_type'
      const { data: course, error } = await supabase
        .from('courses')
        .select(`
          *,
          modules:course_modules(
            *,
            lessons:course_lessons(
              id, module_id, title, type, duration_minutes, order_index, is_preview, video_url
            )
          )
        `)
        .eq('id', courseId)
        .single();

      if (error) throw error;
      if (!course) return null;

      // Fetch creator profile separately if created_by exists
      if (course.created_by) {
        const { data: creatorProfile } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url, bio')
          .eq('id', course.created_by)
          .single();

        course.creator = creatorProfile;
      }

      // Sort modules and lessons by order_index
      if (course.modules) {
        course.modules.sort((a, b) => a.order_index - b.order_index);
        course.modules.forEach(module => {
          if (module.lessons) {
            module.lessons.sort((a, b) => a.order_index - b.order_index);
          }
        });
      }

      // Get enrollment count
      const { count: enrollmentCount } = await supabase
        .from('course_enrollments')
        .select('*', { count: 'exact', head: true })
        .eq('course_id', courseId)
        .eq('is_active', true);

      course.studentCount = enrollmentCount || 0;

      // Calculate total lessons and duration
      let totalLessons = 0;
      let totalDuration = 0;
      course.modules?.forEach(module => {
        totalLessons += module.lessons?.length || 0;
        module.lessons?.forEach(lesson => {
          totalDuration += lesson.duration_minutes || 0;
        });
      });
      course.totalLessons = totalLessons;
      course.totalDuration = totalDuration;

      // Transform instructor
      course.instructor = course.creator ? {
        name: course.creator.full_name || 'Gemral',
        avatar: course.creator.avatar_url || '/default-avatar.png',
        bio: course.creator.bio || '',
      } : {
        name: 'Gemral',
        avatar: '/default-avatar.png',
        bio: '',
      };

      // Get user enrollment if logged in
      if (userId) {
        const { data: enrollment } = await supabase
          .from('course_enrollments')
          .select('*')
          .eq('user_id', userId)
          .eq('course_id', courseId)
          .eq('is_active', true)
          .single();

        course.enrollment = enrollment;

        // Get user progress
        if (enrollment) {
          const { data: progress } = await supabase
            .from('lesson_progress')
            .select('*')
            .eq('user_id', userId)
            .eq('course_id', courseId);

          course.progress = progress || [];

          // Calculate completion percentage
          const completedLessons = (progress || []).filter(p => p.status === 'completed').length;
          course.completionPercentage = totalLessons > 0
            ? Math.round((completedLessons / totalLessons) * 100)
            : 0;
        }
      }

      return course;
    } catch (error) {
      console.error('[CourseService] getCourseDetail error:', error);
      return null;
    }
  }

  /**
   * Get lesson content
   * @param {string} lessonId - Lesson ID
   * @param {string} userId - Current user ID
   * @returns {Promise<Object|null>} Lesson content
   */
  async getLessonContent(lessonId, userId) {
    try {
      // Fetch lesson without attachments first (more reliable)
      // lesson_attachments table may not exist
      const { data: lesson, error: lessonError } = await supabase
        .from('course_lessons')
        .select(`
          *,
          module:course_modules(id, title, course_id)
        `)
        .eq('id', lessonId)
        .single();

      if (lessonError) {
        console.error('[CourseService] getLessonContent error:', lessonError);
        throw lessonError;
      }

      if (!lesson) {
        return null;
      }

      // Try to fetch attachments separately (optional)
      lesson.attachments = [];
      try {
        const { data: attachments } = await supabase
          .from('lesson_attachments')
          .select('*')
          .eq('lesson_id', lessonId);

        if (attachments) {
          lesson.attachments = attachments;
        }
      } catch (attachError) {
        // Attachments table may not exist, ignore
      }

      // Get user progress for this lesson (optional, may fail)
      if (userId && lesson) {
        try {
          const { data: progress } = await supabase
            .from('lesson_progress')
            .select('*')
            .eq('user_id', userId)
            .eq('lesson_id', lessonId)
            .single();

          lesson.userProgress = progress;
        } catch (progressError) {
          // Progress table might not exist
          console.warn('[CourseService] Progress fetch failed:', progressError);
          lesson.userProgress = null;
        }
      }

      return lesson;
    } catch (error) {
      console.error('[CourseService] getLessonContent error:', error);
      return null;
    }
  }

  /**
   * Check if user can access course based on tier
   */
  canAccessCourse(userTier, course) {
    const userTierIndex = TIER_ORDER.indexOf(userTier || 'FREE');
    const requiredTierIndex = TIER_ORDER.indexOf(course.tier_required || 'FREE');
    return userTierIndex >= requiredTierIndex;
  }

  // =====================
  // ADMIN/TEACHER METHODS
  // =====================

  /**
   * Get all courses for admin (no filter by creator)
   * This loads ALL courses in the system for admin management
   * @returns {Promise<Array>} List of all courses
   */
  async getAllCoursesForAdmin() {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select(`
          *,
          modules:course_modules(count),
          lessons:course_lessons(count),
          enrollments:course_enrollments(count)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform data - use DB fields when available
      return (data || []).map(course => ({
        ...course,
        moduleCount: course.modules?.[0]?.count || 0,
        lessonCount: course.total_lessons || course.lessons?.[0]?.count || 0,
        studentCount: course.students_count || course.enrollments?.[0]?.count || 0,
      }));
    } catch (error) {
      console.error('[CourseService] getAllCoursesForAdmin error:', error);
      return [];
    }
  }

  /**
   * Get courses created by a specific teacher
   * @param {string} userId - Teacher user ID
   * @returns {Promise<Array>} List of courses by teacher
   */
  async getAllCourses(userId) {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select(`
          *,
          modules:course_modules(count),
          lessons:course_lessons(count),
          enrollments:course_enrollments(count)
        `)
        .eq('created_by', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform data
      return (data || []).map(course => ({
        ...course,
        moduleCount: course.modules?.[0]?.count || 0,
        lessonCount: course.total_lessons || course.lessons?.[0]?.count || 0,
        studentCount: course.students_count || course.enrollments?.[0]?.count || 0,
      }));
    } catch (error) {
      console.error('[CourseService] getAllCourses error:', error);
      return [];
    }
  }

  /**
   * Generate a unique course ID
   */
  _generateCourseId() {
    const timestamp = Date.now().toString(36);
    const randomPart = Math.random().toString(36).substring(2, 8);
    return `course-${timestamp}-${randomPart}`;
  }

  /**
   * Create a new course
   * @param {Object} courseData - Course data
   * @param {string} userId - Creator user ID (optional if already in courseData)
   * @returns {Promise<Object>} Result
   */
  async createCourse(courseData, userId = null) {
    try {
      // Generate unique ID (courses table uses TEXT id, not UUID)
      const courseId = this._generateCourseId();

      // Support both: courseData with created_by, or separate userId parameter
      const insertData = {
        id: courseId,
        ...courseData,
        created_by: userId || courseData.created_by || courseData.instructor_id,
        is_published: courseData.is_published || false,
      };

      // Remove instructor_id if it was used (not a DB column)
      delete insertData.instructor_id;

      console.log('[CourseService] Creating course with data:', insertData);

      const { data, error } = await supabase
        .from('courses')
        .insert(insertData)
        .select()
        .single();

      if (error) {
        console.error('[CourseService] createCourse DB error:', error);
        throw error;
      }

      console.log('[CourseService] Course created:', data);
      return { success: true, data };
    } catch (error) {
      console.error('[CourseService] createCourse error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Update course
   * @param {string} courseId - Course ID
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object>} Result
   */
  async updateCourse(courseId, updates) {
    try {
      console.log('[CourseService] Updating course:', courseId);
      console.log('[CourseService] Update payload:', updates);

      const updatePayload = {
        ...updates,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('courses')
        .update(updatePayload)
        .eq('id', courseId)
        .select()
        .single();

      if (error) {
        console.error('[CourseService] ❌ Update error:', error);
        throw error;
      }

      console.log('[CourseService] ✅ Update successful, returned data:', data);
      return { success: true, data };
    } catch (error) {
      console.error('[CourseService] updateCourse error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Delete course
   * @param {string} courseId - Course ID
   * @returns {Promise<Object>} Result
   */
  async deleteCourse(courseId) {
    try {
      const { error } = await supabase
        .from('courses')
        .delete()
        .eq('id', courseId);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('[CourseService] deleteCourse error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Toggle course publish status
   * @param {string} courseId - Course ID
   * @param {boolean} isPublished - New publish status
   * @returns {Promise<Object>} Result
   */
  async togglePublish(courseId, isPublished) {
    return this.updateCourse(courseId, { is_published: isPublished });
  }

  // =====================
  // MODULE METHODS
  // =====================

  /**
   * Get modules for a course
   * @param {string} courseId - Course ID
   * @returns {Promise<Array>} List of modules with lessons
   */
  async getModules(courseId) {
    try {
      const { data, error } = await supabase
        .from('course_modules')
        .select(`
          *,
          lessons:course_lessons(*)
        `)
        .eq('course_id', courseId)
        .order('order_index');

      if (error) throw error;

      // Sort lessons within each module
      (data || []).forEach(module => {
        if (module.lessons) {
          module.lessons.sort((a, b) => a.order_index - b.order_index);
        }
      });

      return data || [];
    } catch (error) {
      console.error('[CourseService] getModules error:', error);
      return [];
    }
  }

  /**
   * Generate a unique module ID
   */
  _generateModuleId() {
    const timestamp = Date.now().toString(36);
    const randomPart = Math.random().toString(36).substring(2, 8);
    return `module-${timestamp}-${randomPart}`;
  }

  /**
   * Create a new module
   * @param {Object} moduleData - { course_id, title, description }
   * @returns {Promise<Object>} Result
   */
  async createModule(moduleData) {
    try {
      // Get max order_index
      const { data: existing } = await supabase
        .from('course_modules')
        .select('order_index')
        .eq('course_id', moduleData.course_id)
        .order('order_index', { ascending: false })
        .limit(1);

      const newOrder = (existing?.[0]?.order_index || 0) + 1;

      // Generate unique ID (course_modules uses TEXT id like courses)
      const moduleId = this._generateModuleId();

      const { data, error } = await supabase
        .from('course_modules')
        .insert({
          id: moduleId,
          ...moduleData,
          order_index: newOrder,
        })
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('[CourseService] createModule error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Update module
   * @param {string} moduleId - Module ID
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object>} Result
   */
  async updateModule(moduleId, updates) {
    try {
      const { data, error } = await supabase
        .from('course_modules')
        .update(updates)
        .eq('id', moduleId)
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('[CourseService] updateModule error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Delete module
   * @param {string} moduleId - Module ID
   * @returns {Promise<Object>} Result
   */
  async deleteModule(moduleId) {
    try {
      const { error } = await supabase
        .from('course_modules')
        .delete()
        .eq('id', moduleId);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('[CourseService] deleteModule error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Reorder modules (drag & drop)
   * @param {string} courseId - Course ID
   * @param {Array} moduleIds - Ordered array of module IDs
   * @returns {Promise<Object>} Result
   */
  async reorderModules(courseId, moduleIds) {
    try {
      const updates = moduleIds.map((id, index) => ({
        id,
        order_index: index + 1,
      }));

      for (const update of updates) {
        await supabase
          .from('course_modules')
          .update({ order_index: update.order_index })
          .eq('id', update.id);
      }

      return { success: true };
    } catch (error) {
      console.error('[CourseService] reorderModules error:', error);
      return { success: false, error: error.message };
    }
  }

  // =====================
  // UPLOAD METHODS
  // =====================

  /**
   * Upload course thumbnail to Supabase Storage
   * @param {File} file - Image file to upload
   * @returns {Promise<string>} Public URL of uploaded image
   */
  async uploadThumbnail(file) {
    try {
      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `course-thumbnail-${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
      const filePath = `course-thumbnails/${fileName}`;

      console.log('[CourseService] Uploading thumbnail:', filePath);

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('course-assets')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) {
        console.error('[CourseService] Upload error:', error);
        throw error;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('course-assets')
        .getPublicUrl(filePath);

      console.log('[CourseService] ✅ Thumbnail uploaded:', urlData.publicUrl);
      return urlData.publicUrl;
    } catch (error) {
      console.error('[CourseService] uploadThumbnail error:', error);
      throw new Error('Không thể tải ảnh lên. Vui lòng thử lại.');
    }
  }

  // =====================
  // UTILITY METHODS
  // =====================

  /**
   * Get course categories
   */
  getCategories() {
    return [
      { id: 'trading', name: 'GEM Trading', icon: 'TrendingUp' },
      { id: 'spiritual', name: 'GEM Academy', icon: 'Sparkles' },
      { id: 'bundle', name: 'Bundles & Offers', icon: 'Gift' },
    ];
  }

  /**
   * Get tier options
   */
  getTiers() {
    return [
      { id: 'FREE', name: 'Miễn phí', color: '#888888' },
      { id: 'TIER1', name: 'Tier 1', color: '#FFD700' },
      { id: 'TIER2', name: 'Tier 2', color: '#E8C4FF' },
      { id: 'TIER3', name: 'Tier 3', color: '#FF6B9D' },
    ];
  }
}

export const courseService = new CourseService();
export default courseService;
