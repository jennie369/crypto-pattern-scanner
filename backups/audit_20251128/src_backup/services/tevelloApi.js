/**
 * Gemral - Tevello API Client
 * Prepared API client for Tevello LMS integration
 * Will be activated when API credentials are available
 *
 * Documentation: https://docs.tevello.com/api (placeholder)
 */

// Configuration - Update when API is ready
const TEVELLO_CONFIG = {
  API_URL: process.env.TEVELLO_API_URL || 'https://api.tevello.com/v1',
  API_KEY: process.env.TEVELLO_API_KEY || null,
  STORE_ID: process.env.TEVELLO_STORE_ID || null,
};

// Check if API is configured
export const isApiConfigured = () => {
  return !!(TEVELLO_CONFIG.API_KEY && TEVELLO_CONFIG.STORE_ID);
};

/**
 * Base fetch wrapper with authentication
 */
const apiFetch = async (endpoint, options = {}) => {
  if (!isApiConfigured()) {
    throw new Error('Tevello API not configured');
  }

  const url = `${TEVELLO_CONFIG.API_URL}${endpoint}`;

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${TEVELLO_CONFIG.API_KEY}`,
    'X-Store-ID': TEVELLO_CONFIG.STORE_ID,
    ...options.headers,
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `API Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('[TevelloAPI] Request failed:', error);
    throw error;
  }
};

/**
 * Tevello API Methods
 * Structure matches expected Tevello API responses
 */
export const tevelloApi = {
  /**
   * Get all published courses
   * @param {Object} params - Query parameters
   * @param {string} params.tier - Filter by tier (FREE, TIER1, TIER2, TIER3)
   * @param {number} params.limit - Max results
   * @param {number} params.offset - Pagination offset
   */
  getCourses: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = `/courses${queryString ? `?${queryString}` : ''}`;

    const response = await apiFetch(endpoint);

    // Transform Tevello response to our format
    return response.courses.map(transformCourse);
  },

  /**
   * Get single course by ID
   * @param {string} courseId - Course ID
   */
  getCourseById: async (courseId) => {
    const response = await apiFetch(`/courses/${courseId}`);
    return transformCourse(response.course);
  },

  /**
   * Get course curriculum (modules and lessons)
   * @param {string} courseId - Course ID
   */
  getCourseCurriculum: async (courseId) => {
    const response = await apiFetch(`/courses/${courseId}/curriculum`);

    return response.modules.map(module => ({
      id: module.id,
      title: module.title,
      order: module.order,
      lessons: module.lessons.map(transformLesson),
    }));
  },

  /**
   * Get user's enrolled courses
   * @param {string} userId - User ID (from Supabase auth)
   */
  getUserEnrollments: async (userId) => {
    const response = await apiFetch(`/users/${userId}/enrollments`);
    return response.enrollments.map(e => e.course_id);
  },

  /**
   * Enroll user in a course
   * @param {string} userId - User ID
   * @param {string} courseId - Course ID
   */
  enrollUser: async (userId, courseId) => {
    const response = await apiFetch(`/enrollments`, {
      method: 'POST',
      body: JSON.stringify({
        user_id: userId,
        course_id: courseId,
      }),
    });

    return {
      success: true,
      enrollment_id: response.enrollment.id,
    };
  },

  /**
   * Get user's progress for a course
   * @param {string} userId - User ID
   * @param {string} courseId - Course ID
   */
  getCourseProgress: async (userId, courseId) => {
    const response = await apiFetch(`/users/${userId}/courses/${courseId}/progress`);

    return {
      percent: response.progress.percent,
      completedLessons: response.progress.completed_lessons,
      lastAccessedAt: response.progress.last_accessed_at,
    };
  },

  /**
   * Mark a lesson as complete
   * @param {string} userId - User ID
   * @param {string} courseId - Course ID
   * @param {string} lessonId - Lesson ID
   */
  markLessonComplete: async (userId, courseId, lessonId) => {
    const response = await apiFetch(`/progress`, {
      method: 'POST',
      body: JSON.stringify({
        user_id: userId,
        course_id: courseId,
        lesson_id: lessonId,
        completed: true,
        completed_at: new Date().toISOString(),
      }),
    });

    return {
      success: true,
      newProgress: response.progress.percent,
    };
  },

  /**
   * Get lesson content (video URL, etc.)
   * @param {string} lessonId - Lesson ID
   */
  getLessonContent: async (lessonId) => {
    const response = await apiFetch(`/lessons/${lessonId}/content`);

    return {
      video_url: response.content.video_url,
      duration_seconds: response.content.duration_seconds,
      transcript: response.content.transcript,
      attachments: response.content.attachments,
    };
  },

  /**
   * Get course certificate (if completed)
   * @param {string} userId - User ID
   * @param {string} courseId - Course ID
   */
  getCertificate: async (userId, courseId) => {
    const response = await apiFetch(`/users/${userId}/courses/${courseId}/certificate`);

    return {
      certificate_id: response.certificate.id,
      issued_at: response.certificate.issued_at,
      download_url: response.certificate.download_url,
    };
  },

  /**
   * Webhook verification (for server-side)
   * @param {string} signature - Webhook signature
   * @param {Object} payload - Webhook payload
   */
  verifyWebhook: (signature, payload) => {
    // Implementation would verify HMAC signature
    // This is a placeholder for server-side implementation
    console.warn('[TevelloAPI] Webhook verification should be done server-side');
    return false;
  },
};

/**
 * Transform Tevello course response to our format
 */
const transformCourse = (course) => ({
  id: course.id,
  title: course.title,
  description: course.description,
  thumbnail_url: course.thumbnail_url || course.image_url,
  instructor: {
    name: course.instructor_name || course.instructor?.name,
    avatar: course.instructor_avatar || course.instructor?.avatar_url,
  },
  duration_hours: course.duration_hours || Math.round(course.duration_minutes / 60),
  total_lessons: course.total_lessons || course.lessons_count,
  tier_required: mapTevelloTier(course.access_tier || course.tier),
  price: course.price || 0,
  currency: course.currency || 'VND',
  rating: course.rating || course.average_rating,
  students_count: course.students_count || course.enrollments_count,
  is_published: course.is_published ?? course.status === 'published',
  created_at: course.created_at,
  updated_at: course.updated_at,
  modules: course.modules?.map(m => ({
    id: m.id,
    title: m.title,
    order: m.order,
    lessons: m.lessons?.map(transformLesson),
  })),
});

/**
 * Transform Tevello lesson response to our format
 */
const transformLesson = (lesson) => ({
  id: lesson.id,
  title: lesson.title,
  description: lesson.description,
  type: lesson.content_type || lesson.type || 'video',
  duration_minutes: lesson.duration_minutes || Math.round(lesson.duration_seconds / 60),
  video_url: lesson.video_url,
  order: lesson.order,
  is_preview: lesson.is_preview || lesson.free_preview,
});

/**
 * Map Tevello tier to our tier system
 */
const mapTevelloTier = (tevelloTier) => {
  const tierMap = {
    'free': 'FREE',
    'basic': 'TIER1',
    'pro': 'TIER1',
    'premium': 'TIER2',
    'vip': 'TIER3',
    'enterprise': 'TIER3',
  };

  if (!tevelloTier) return 'FREE';

  const normalizedTier = tevelloTier.toLowerCase();
  return tierMap[normalizedTier] || tevelloTier.toUpperCase();
};

export default tevelloApi;
