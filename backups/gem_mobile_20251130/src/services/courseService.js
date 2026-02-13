/**
 * Gemral - Course Service (Mobile)
 * Supabase-powered course service with mock data fallback
 * Supports: courses, enrollments, progress, quizzes, certificates
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabase';

// Feature flag for using Supabase
const USE_SUPABASE = true; // Set to true to use Supabase, false for mock only

// Storage keys
const ENROLLMENTS_KEY = '@gem_course_enrollments';
const PROGRESS_KEY = '@gem_course_progress';

// Mock Courses Data
const MOCK_COURSES = [
  {
    id: 'course-trading-basics',
    title: 'Trading Cơ Bản',
    description: 'Học cách giao dịch crypto từ A-Z. Khóa học này sẽ giúp bạn hiểu được các khái niệm cơ bản về thị trường crypto, cách đọc biểu đồ, và các chiến lược giao dịch đơn giản nhưng hiệu quả.',
    thumbnail_url: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800',
    instructor: {
      name: 'Gemral',
      avatar: 'https://ui-avatars.com/api/?name=GEM+Master&background=6A5BFF&color=fff&size=200',
      bio: 'Chuyên gia Trading với 10+ năm kinh nghiệm',
    },
    duration_hours: 10,
    total_lessons: 12,
    tier_required: 'FREE',
    price: 0,
    is_published: true,
    rating: 4.8,
    students_count: 1250,
    modules: [
      {
        id: 'module-1',
        title: 'Giới Thiệu Về Crypto',
        order: 1,
        lessons: [
          {
            id: 'lesson-1-1',
            title: 'Crypto là gì?',
            type: 'video',
            duration_minutes: 15,
            description: 'Tìm hiểu về cryptocurrency và blockchain technology',
            video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
          },
          {
            id: 'lesson-1-2',
            title: 'Tại sao nên đầu tư Crypto?',
            type: 'video',
            duration_minutes: 12,
            description: 'Những lý do khiến crypto trở thành kênh đầu tư hấp dẫn',
            video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
          },
          {
            id: 'lesson-1-3',
            title: 'Các loại Crypto phổ biến',
            type: 'video',
            duration_minutes: 20,
            description: 'Bitcoin, Ethereum, và các altcoins quan trọng',
            video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
          },
        ],
      },
      {
        id: 'module-2',
        title: 'Đọc Hiểu Biểu Đồ',
        order: 2,
        lessons: [
          {
            id: 'lesson-2-1',
            title: 'Candlestick là gì?',
            type: 'video',
            duration_minutes: 18,
            description: 'Hiểu cách đọc nến Nhật Bản',
            video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
          },
          {
            id: 'lesson-2-2',
            title: 'Support và Resistance',
            type: 'video',
            duration_minutes: 25,
            description: 'Xác định các vùng hỗ trợ và kháng cự',
            video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
          },
          {
            id: 'lesson-2-3',
            title: 'Các mẫu hình nến quan trọng',
            type: 'video',
            duration_minutes: 30,
            description: 'Doji, Hammer, Engulfing và các patterns khác',
            video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
          },
        ],
      },
      {
        id: 'module-3',
        title: 'Chiến Lược Giao Dịch',
        order: 3,
        lessons: [
          {
            id: 'lesson-3-1',
            title: 'Quản lý vốn',
            type: 'video',
            duration_minutes: 22,
            description: 'Cách quản lý rủi ro và bảo toàn vốn',
            video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
          },
          {
            id: 'lesson-3-2',
            title: 'Entry và Exit points',
            type: 'video',
            duration_minutes: 28,
            description: 'Xác định điểm vào và thoát lệnh',
            video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
          },
          {
            id: 'lesson-3-3',
            title: 'Stop Loss và Take Profit',
            type: 'video',
            duration_minutes: 20,
            description: 'Đặt SL/TP để bảo vệ tài khoản',
            video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
          },
        ],
      },
    ],
  },
  {
    id: 'course-pattern-mastery',
    title: 'Pattern Mastery',
    description: 'Khóa học chuyên sâu về các mẫu hình kỹ thuật. Học cách nhận diện và giao dịch với các pattern như Head & Shoulders, Double Top/Bottom, Triangle, và nhiều hơn nữa.',
    thumbnail_url: 'https://images.unsplash.com/photo-1642790106117-e829e14a795f?w=800',
    instructor: {
      name: 'Pattern Pro',
      avatar: 'https://ui-avatars.com/api/?name=Pattern+Pro&background=FFBD59&color=112250&size=200',
      bio: 'Chuyên gia phân tích kỹ thuật',
    },
    duration_hours: 15,
    total_lessons: 18,
    tier_required: 'TIER1',
    price: 990000,
    is_published: true,
    rating: 4.9,
    students_count: 856,
    modules: [
      {
        id: 'pm-module-1',
        title: 'Continuation Patterns',
        order: 1,
        lessons: [
          {
            id: 'pm-lesson-1-1',
            title: 'Triangle Patterns',
            type: 'video',
            duration_minutes: 35,
            description: 'Ascending, Descending, và Symmetrical Triangles',
            video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
          },
          {
            id: 'pm-lesson-1-2',
            title: 'Flag và Pennant',
            type: 'video',
            duration_minutes: 28,
            description: 'Nhận diện và giao dịch với Flag patterns',
            video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
          },
          {
            id: 'pm-lesson-1-3',
            title: 'Wedge Patterns',
            type: 'video',
            duration_minutes: 25,
            description: 'Rising và Falling Wedges',
            video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
          },
        ],
      },
      {
        id: 'pm-module-2',
        title: 'Reversal Patterns',
        order: 2,
        lessons: [
          {
            id: 'pm-lesson-2-1',
            title: 'Head & Shoulders',
            type: 'video',
            duration_minutes: 40,
            description: 'Pattern đảo chiều kinh điển',
            video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
          },
          {
            id: 'pm-lesson-2-2',
            title: 'Double Top & Bottom',
            type: 'video',
            duration_minutes: 32,
            description: 'Đỉnh đôi và đáy đôi',
            video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
          },
          {
            id: 'pm-lesson-2-3',
            title: 'Triple Top & Bottom',
            type: 'video',
            duration_minutes: 28,
            description: 'Patterns 3 đỉnh/đáy',
            video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
          },
        ],
      },
    ],
  },
  {
    id: 'course-advanced-trading',
    title: 'Advanced Trading Strategies',
    description: 'Chiến lược giao dịch nâng cao dành cho trader chuyên nghiệp. Học về Fibonacci, Elliott Wave, Ichimoku, và các kỹ thuật phân tích chuyên sâu.',
    thumbnail_url: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=800',
    instructor: {
      name: 'Trading Elite',
      avatar: 'https://ui-avatars.com/api/?name=Trading+Elite&background=00F0FF&color=112250&size=200',
      bio: 'Full-time trader & educator',
    },
    duration_hours: 25,
    total_lessons: 28,
    tier_required: 'TIER2',
    price: 2490000,
    is_published: true,
    rating: 4.7,
    students_count: 423,
    modules: [
      {
        id: 'at-module-1',
        title: 'Fibonacci Trading',
        order: 1,
        lessons: [
          {
            id: 'at-lesson-1-1',
            title: 'Fibonacci Retracement',
            type: 'video',
            duration_minutes: 45,
            description: 'Cách sử dụng Fib Retracement',
            video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
          },
          {
            id: 'at-lesson-1-2',
            title: 'Fibonacci Extension',
            type: 'video',
            duration_minutes: 38,
            description: 'Xác định target với Fib Extension',
            video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
          },
        ],
      },
      {
        id: 'at-module-2',
        title: 'Elliott Wave',
        order: 2,
        lessons: [
          {
            id: 'at-lesson-2-1',
            title: 'Elliott Wave Basics',
            type: 'video',
            duration_minutes: 50,
            description: 'Nguyên lý cơ bản của Elliott Wave',
            video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
          },
          {
            id: 'at-lesson-2-2',
            title: 'Wave Counting',
            type: 'video',
            duration_minutes: 55,
            description: 'Cách đếm sóng Elliott',
            video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
          },
        ],
      },
    ],
  },
  {
    id: 'course-tinh-than',
    title: 'Tâm Lý Trading',
    description: 'Phát triển tâm lý vững vàng cho trading. Học cách kiểm soát cảm xúc, xây dựng kỷ luật, và duy trì mindset chiến thắng.',
    thumbnail_url: 'https://images.unsplash.com/photo-1544027993-37dbfe43562a?w=800',
    instructor: {
      name: 'Mind Coach',
      avatar: 'https://ui-avatars.com/api/?name=Mind+Coach&background=A855F7&color=fff&size=200',
      bio: 'Trading Psychology Expert',
    },
    duration_hours: 8,
    total_lessons: 10,
    tier_required: 'FREE',
    price: 0,
    is_published: true,
    rating: 4.9,
    students_count: 2100,
    modules: [
      {
        id: 'tt-module-1',
        title: 'Tâm Lý Cơ Bản',
        order: 1,
        lessons: [
          {
            id: 'tt-lesson-1-1',
            title: 'Tại sao tâm lý quan trọng?',
            type: 'video',
            duration_minutes: 20,
            description: '80% trading là tâm lý',
            video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
          },
          {
            id: 'tt-lesson-1-2',
            title: 'Kiểm soát FOMO',
            type: 'video',
            duration_minutes: 25,
            description: 'Đánh bại nỗi sợ bỏ lỡ cơ hội',
            video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
          },
          {
            id: 'tt-lesson-1-3',
            title: 'Quản lý Fear & Greed',
            type: 'video',
            duration_minutes: 30,
            description: 'Cân bằng giữa sợ hãi và tham lam',
            video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
          },
        ],
      },
      {
        id: 'tt-module-2',
        title: 'Xây Dựng Kỷ Luật',
        order: 2,
        lessons: [
          {
            id: 'tt-lesson-2-1',
            title: 'Trading Plan',
            type: 'video',
            duration_minutes: 35,
            description: 'Tạo và tuân thủ kế hoạch trading',
            video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
          },
          {
            id: 'tt-lesson-2-2',
            title: 'Trading Journal',
            type: 'video',
            duration_minutes: 28,
            description: 'Ghi chép và phân tích giao dịch',
            video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
          },
        ],
      },
    ],
  },
];

// Tier order for comparison
const TIER_ORDER = ['FREE', 'TIER1', 'TIER2', 'TIER3'];

// Storage keys for certificates
const CERTIFICATES_KEY = '@gem_course_certificates';
const REVIEWS_KEY = '@gem_course_reviews';

/**
 * Course Service - Mock data với API-ready structure
 * Supports automatic fallback between Tevello API and mock data
 */
class CourseService {
  constructor() {
    this._coursesCache = null;
    this._enrollmentsCache = null;
    this._progressCache = {};
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

  /**
   * Get all courses
   * Uses Supabase if enabled, otherwise falls back to mock data
   */
  async getCourses(filters = {}) {
    try {
      let courses;

      // Try Supabase first if enabled
      if (USE_SUPABASE) {
        try {
          console.log('[Course] Fetching from Supabase...');
          let query = supabase
            .from('courses')
            .select('*')
            .eq('is_published', true);

          // Apply tier filter at DB level
          if (filters.tier) {
            query = query.eq('tier_required', filters.tier);
          }

          const { data, error } = await query.order('created_at', { ascending: false });

          if (error) throw error;

          if (data && data.length > 0) {
            // Transform Supabase data to match expected format
            courses = data.map(c => ({
              ...c,
              instructor: {
                name: c.instructor_name || 'Gemral',
                avatar: c.instructor_avatar || 'https://ui-avatars.com/api/?name=GEM&background=6A5BFF&color=fff',
                bio: '',
              },
              thumbnail_url: c.thumbnail_url || 'https://placehold.co/400x200/1a0b2e/FFBD59?text=Course',
            }));
            this._coursesCache = courses;
            this._lastFetchTime = Date.now();
          } else {
            // No courses in DB, use mock
            console.log('[Course] No courses in Supabase, using mock data');
            courses = [...MOCK_COURSES];
          }
        } catch (apiError) {
          console.warn('[Course] Supabase failed, falling back to mock:', apiError.message);
          courses = [...MOCK_COURSES];
        }
      } else {
        // Use mock data
        courses = [...MOCK_COURSES];
      }

      // Filter by tier (for mock data)
      if (filters.tier && !USE_SUPABASE) {
        courses = courses.filter(c => c.tier_required === filters.tier);
      }

      // Filter by search
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        courses = courses.filter(c =>
          c.title.toLowerCase().includes(searchLower) ||
          c.description.toLowerCase().includes(searchLower)
        );
      }

      // Filter free only
      if (filters.freeOnly) {
        courses = courses.filter(c => c.tier_required === 'FREE');
      }

      // Filter premium only
      if (filters.premiumOnly) {
        courses = courses.filter(c => c.tier_required !== 'FREE');
      }

      return courses;
    } catch (error) {
      console.error('[Course] getCourses error:', error);
      return [];
    }
  }

  /**
   * Get course by ID with modules and lessons
   * Uses Supabase if enabled, otherwise falls back to mock data
   */
  async getCourseById(courseId) {
    try {
      // Try Supabase first if enabled
      if (USE_SUPABASE) {
        try {
          const { data: course, error } = await supabase
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

          if (course) {
            // Sort modules and lessons
            if (course.modules) {
              course.modules.sort((a, b) => a.order_index - b.order_index);
              course.modules.forEach(mod => {
                if (mod.lessons) {
                  mod.lessons.sort((a, b) => a.order_index - b.order_index);
                }
              });
            }

            // Transform to expected format
            return {
              ...course,
              instructor: {
                name: course.instructor_name || 'Gemral',
                avatar: course.instructor_avatar || 'https://ui-avatars.com/api/?name=GEM&background=6A5BFF&color=fff',
                bio: '',
              },
              thumbnail_url: course.thumbnail_url || 'https://placehold.co/400x200/1a0b2e/FFBD59?text=Course',
            };
          }
        } catch (apiError) {
          console.warn('[Course] Supabase failed, falling back to mock:', apiError.message);
        }
      }

      // Fallback to mock data
      const course = MOCK_COURSES.find(c => c.id === courseId);
      return course || null;
    } catch (error) {
      console.error('[Course] getCourseById error:', error);
      return null;
    }
  }

  /**
   * Get all lessons for a course (flattened)
   */
  async getCourseLessons(courseId) {
    try {
      const course = await this.getCourseById(courseId);
      if (!course) return [];

      const lessons = [];
      course.modules.forEach((module, moduleIndex) => {
        module.lessons.forEach((lesson, lessonIndex) => {
          lessons.push({
            ...lesson,
            moduleId: module.id,
            moduleTitle: module.title,
            moduleOrder: moduleIndex,
            lessonOrder: lessonIndex,
            fullOrder: moduleIndex * 100 + lessonIndex,
          });
        });
      });

      return lessons.sort((a, b) => a.fullOrder - b.fullOrder);
    } catch (error) {
      console.error('[Course] getCourseLessons error:', error);
      return [];
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

  // ==================== ENROLLMENT ====================

  /**
   * Get user enrollments from local storage
   */
  async getUserEnrollments(userId) {
    try {
      const data = await AsyncStorage.getItem(ENROLLMENTS_KEY);
      const enrollments = data ? JSON.parse(data) : {};
      return enrollments[userId] || [];
    } catch (error) {
      console.error('[Course] getUserEnrollments error:', error);
      return [];
    }
  }

  /**
   * Check if user is enrolled in a course
   */
  async isEnrolled(userId, courseId) {
    const enrollments = await this.getUserEnrollments(userId);
    return enrollments.some(e => e.courseId === courseId);
  }

  /**
   * Enroll user in a course
   */
  async enrollUser(userId, courseId) {
    try {
      const data = await AsyncStorage.getItem(ENROLLMENTS_KEY);
      const enrollments = data ? JSON.parse(data) : {};

      if (!enrollments[userId]) {
        enrollments[userId] = [];
      }

      // Check if already enrolled
      if (enrollments[userId].some(e => e.courseId === courseId)) {
        return { success: false, error: 'Already enrolled' };
      }

      const course = await this.getCourseById(courseId);
      if (!course) {
        return { success: false, error: 'Course not found' };
      }

      // Add enrollment
      enrollments[userId].push({
        courseId,
        courseTitle: course.title,
        courseThumbnail: course.thumbnail_url,
        enrolledAt: new Date().toISOString(),
        status: 'active',
      });

      await AsyncStorage.setItem(ENROLLMENTS_KEY, JSON.stringify(enrollments));

      // Initialize progress
      await this.initializeProgress(userId, courseId);

      console.log('[Course] Enrolled user in course:', courseId);
      return { success: true };
    } catch (error) {
      console.error('[Course] enrollUser error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Unenroll user from a course
   */
  async unenrollUser(userId, courseId) {
    try {
      const data = await AsyncStorage.getItem(ENROLLMENTS_KEY);
      const enrollments = data ? JSON.parse(data) : {};

      if (!enrollments[userId]) return { success: true };

      enrollments[userId] = enrollments[userId].filter(e => e.courseId !== courseId);

      await AsyncStorage.setItem(ENROLLMENTS_KEY, JSON.stringify(enrollments));
      return { success: true };
    } catch (error) {
      console.error('[Course] unenrollUser error:', error);
      return { success: false, error: error.message };
    }
  }

  // ==================== PROGRESS ====================

  /**
   * Initialize progress for a course
   */
  async initializeProgress(userId, courseId) {
    try {
      const data = await AsyncStorage.getItem(PROGRESS_KEY);
      const allProgress = data ? JSON.parse(data) : {};

      if (!allProgress[userId]) {
        allProgress[userId] = {};
      }

      if (!allProgress[userId][courseId]) {
        allProgress[userId][courseId] = {
          completedLessons: [],
          lastLessonId: null,
          lastAccessedAt: new Date().toISOString(),
          percentComplete: 0,
        };
      }

      await AsyncStorage.setItem(PROGRESS_KEY, JSON.stringify(allProgress));
    } catch (error) {
      console.error('[Course] initializeProgress error:', error);
    }
  }

  /**
   * Get progress for a course
   */
  async getProgress(userId, courseId) {
    try {
      const data = await AsyncStorage.getItem(PROGRESS_KEY);
      const allProgress = data ? JSON.parse(data) : {};

      if (!allProgress[userId] || !allProgress[userId][courseId]) {
        return {
          completedLessons: [],
          lastLessonId: null,
          lastAccessedAt: null,
          percentComplete: 0,
        };
      }

      return allProgress[userId][courseId];
    } catch (error) {
      console.error('[Course] getProgress error:', error);
      return { completedLessons: [], percentComplete: 0 };
    }
  }

  /**
   * Mark lesson as complete
   */
  async markLessonComplete(userId, courseId, lessonId) {
    try {
      const data = await AsyncStorage.getItem(PROGRESS_KEY);
      const allProgress = data ? JSON.parse(data) : {};

      if (!allProgress[userId]) {
        allProgress[userId] = {};
      }

      if (!allProgress[userId][courseId]) {
        allProgress[userId][courseId] = {
          completedLessons: [],
          lastLessonId: null,
          lastAccessedAt: new Date().toISOString(),
          percentComplete: 0,
        };
      }

      const progress = allProgress[userId][courseId];

      // Add lesson to completed if not already
      if (!progress.completedLessons.includes(lessonId)) {
        progress.completedLessons.push(lessonId);
      }

      progress.lastLessonId = lessonId;
      progress.lastAccessedAt = new Date().toISOString();

      // Calculate percent complete
      const course = await this.getCourseById(courseId);
      if (course) {
        progress.percentComplete = Math.round(
          (progress.completedLessons.length / course.total_lessons) * 100
        );
      }

      await AsyncStorage.setItem(PROGRESS_KEY, JSON.stringify(allProgress));

      console.log('[Course] Lesson completed:', lessonId, 'Progress:', progress.percentComplete + '%');
      return { success: true, progress };
    } catch (error) {
      console.error('[Course] markLessonComplete error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get all progress for a user (multiple courses)
   */
  async getAllProgress(userId) {
    try {
      const data = await AsyncStorage.getItem(PROGRESS_KEY);
      const allProgress = data ? JSON.parse(data) : {};
      return allProgress[userId] || {};
    } catch (error) {
      console.error('[Course] getAllProgress error:', error);
      return {};
    }
  }

  /**
   * Check if lesson is completed
   */
  async isLessonCompleted(userId, courseId, lessonId) {
    const progress = await this.getProgress(userId, courseId);
    return progress.completedLessons.includes(lessonId);
  }

  // ==================== STATISTICS ====================

  /**
   * Get course statistics for a user
   */
  async getUserCourseStats(userId) {
    try {
      const enrollments = await this.getUserEnrollments(userId);
      const allProgress = await this.getAllProgress(userId);

      let totalEnrolled = enrollments.length;
      let inProgress = 0;
      let completed = 0;

      for (const enrollment of enrollments) {
        const progress = allProgress[enrollment.courseId];
        if (progress) {
          if (progress.percentComplete >= 100) {
            completed++;
          } else if (progress.percentComplete > 0) {
            inProgress++;
          }
        }
      }

      return {
        totalEnrolled,
        inProgress,
        completed,
        notStarted: totalEnrolled - inProgress - completed,
      };
    } catch (error) {
      console.error('[Course] getUserCourseStats error:', error);
      return { totalEnrolled: 0, inProgress: 0, completed: 0, notStarted: 0 };
    }
  }

  // ==================== CERTIFICATES ====================

  /**
   * Get user's certificate for a course
   * @param {string} userId - User ID
   * @param {string} courseId - Course ID
   * @returns {Promise<Object|null>} Certificate or null
   */
  async getCertificate(userId, courseId) {
    try {
      // Try Supabase first
      if (USE_SUPABASE) {
        try {
          const { data, error } = await supabase
            .from('course_certificates')
            .select('*')
            .eq('user_id', userId)
            .eq('course_id', courseId)
            .single();

          if (!error && data) return data;
        } catch (apiError) {
          console.warn('[Course] Certificate fetch failed:', apiError.message);
        }
      }

      // Fallback to local storage
      const stored = await AsyncStorage.getItem(CERTIFICATES_KEY);
      const certs = stored ? JSON.parse(stored) : {};
      const key = `${userId}_${courseId}`;
      return certs[key] || null;
    } catch (error) {
      console.error('[Course] getCertificate error:', error);
      return null;
    }
  }

  /**
   * Generate certificate for completed course
   * @param {string} userId - User ID
   * @param {string} courseId - Course ID
   * @param {string} userName - User's display name
   * @returns {Promise<Object>} Generated certificate
   */
  async generateCertificate(userId, courseId, userName) {
    try {
      // Check if course is 100% complete
      const progress = await this.getProgress(userId, courseId);
      if (progress.percentComplete < 100) {
        return { success: false, error: 'Course not completed' };
      }

      const course = await this.getCourseById(courseId);
      if (!course) {
        return { success: false, error: 'Course not found' };
      }

      // Generate certificate data
      const certificate = {
        id: `cert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        user_id: userId,
        course_id: courseId,
        user_name: userName,
        course_title: course.title,
        instructor_name: course.instructor?.name || 'Gemral',
        completed_at: new Date().toISOString(),
        certificate_number: `GEM-${Date.now().toString(36).toUpperCase()}`,
      };

      // Try Supabase first
      if (USE_SUPABASE) {
        try {
          const { data, error } = await supabase
            .from('course_certificates')
            .insert(certificate)
            .select()
            .single();

          if (!error && data) {
            return { success: true, certificate: data };
          }
        } catch (apiError) {
          console.warn('[Course] Certificate insert failed:', apiError.message);
        }
      }

      // Fallback to local storage
      const stored = await AsyncStorage.getItem(CERTIFICATES_KEY);
      const certs = stored ? JSON.parse(stored) : {};
      const key = `${userId}_${courseId}`;
      certs[key] = certificate;
      await AsyncStorage.setItem(CERTIFICATES_KEY, JSON.stringify(certs));

      return { success: true, certificate };
    } catch (error) {
      console.error('[Course] generateCertificate error:', error);
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
      // Try Supabase first
      if (USE_SUPABASE) {
        try {
          const { data, error } = await supabase
            .from('course_certificates')
            .select('*')
            .eq('user_id', userId)
            .order('completed_at', { ascending: false });

          if (!error && data) return data;
        } catch (apiError) {
          console.warn('[Course] Certificates fetch failed:', apiError.message);
        }
      }

      // Fallback to local storage
      const stored = await AsyncStorage.getItem(CERTIFICATES_KEY);
      const certs = stored ? JSON.parse(stored) : {};
      return Object.values(certs).filter(c => c.user_id === userId);
    } catch (error) {
      console.error('[Course] getUserCertificates error:', error);
      return [];
    }
  }

  // ==================== REVIEWS ====================

  /**
   * Get reviews for a course
   * @param {string} courseId - Course ID
   * @param {Object} options - Pagination options
   * @returns {Promise<Array>} List of reviews
   */
  async getCourseReviews(courseId, options = {}) {
    const { limit = 10, offset = 0 } = options;

    try {
      // Try Supabase first
      if (USE_SUPABASE) {
        try {
          const { data, error } = await supabase
            .from('course_reviews')
            .select(`
              *,
              profiles:user_id(username, avatar_url)
            `)
            .eq('course_id', courseId)
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

          if (!error && data) {
            return data.map(r => ({
              ...r,
              user_name: r.profiles?.username || 'Anonymous',
              user_avatar: r.profiles?.avatar_url,
            }));
          }
        } catch (apiError) {
          console.warn('[Course] Reviews fetch failed:', apiError.message);
        }
      }

      // Fallback to local storage
      const stored = await AsyncStorage.getItem(REVIEWS_KEY);
      const reviews = stored ? JSON.parse(stored) : {};
      const courseReviews = Object.values(reviews)
        .filter(r => r.course_id === courseId)
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(offset, offset + limit);
      return courseReviews;
    } catch (error) {
      console.error('[Course] getCourseReviews error:', error);
      return [];
    }
  }

  /**
   * Get user's review for a course
   * @param {string} userId - User ID
   * @param {string} courseId - Course ID
   * @returns {Promise<Object|null>} Review or null
   */
  async getUserReview(userId, courseId) {
    try {
      // Try Supabase first
      if (USE_SUPABASE) {
        try {
          const { data, error } = await supabase
            .from('course_reviews')
            .select('*')
            .eq('user_id', userId)
            .eq('course_id', courseId)
            .single();

          if (!error && data) return data;
        } catch (apiError) {
          // Not found is OK
        }
      }

      // Fallback to local storage
      const stored = await AsyncStorage.getItem(REVIEWS_KEY);
      const reviews = stored ? JSON.parse(stored) : {};
      const key = `${userId}_${courseId}`;
      return reviews[key] || null;
    } catch (error) {
      console.error('[Course] getUserReview error:', error);
      return null;
    }
  }

  /**
   * Submit or update a course review
   * @param {string} userId - User ID
   * @param {string} courseId - Course ID
   * @param {number} rating - Rating 1-5
   * @param {string} reviewText - Review text (optional)
   * @returns {Promise<Object>} Result
   */
  async submitReview(userId, courseId, rating, reviewText = '') {
    try {
      if (rating < 1 || rating > 5) {
        return { success: false, error: 'Rating must be 1-5' };
      }

      // Check if user completed the course (for verified badge)
      const progress = await this.getProgress(userId, courseId);
      const isVerified = progress.percentComplete >= 100;

      const reviewData = {
        user_id: userId,
        course_id: courseId,
        rating,
        review_text: reviewText,
        is_verified: isVerified,
        updated_at: new Date().toISOString(),
      };

      // Try Supabase first
      if (USE_SUPABASE) {
        try {
          // Upsert (insert or update)
          const { data, error } = await supabase
            .from('course_reviews')
            .upsert(reviewData, { onConflict: 'user_id,course_id' })
            .select()
            .single();

          if (!error && data) {
            return { success: true, review: data };
          }
        } catch (apiError) {
          console.warn('[Course] Review upsert failed:', apiError.message);
        }
      }

      // Fallback to local storage
      const stored = await AsyncStorage.getItem(REVIEWS_KEY);
      const reviews = stored ? JSON.parse(stored) : {};
      const key = `${userId}_${courseId}`;

      // Check if updating existing
      const existing = reviews[key];
      reviews[key] = {
        id: existing?.id || `review_${Date.now()}`,
        ...reviewData,
        created_at: existing?.created_at || new Date().toISOString(),
      };

      await AsyncStorage.setItem(REVIEWS_KEY, JSON.stringify(reviews));
      return { success: true, review: reviews[key] };
    } catch (error) {
      console.error('[Course] submitReview error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Delete a review
   * @param {string} userId - User ID
   * @param {string} courseId - Course ID
   * @returns {Promise<Object>} Result
   */
  async deleteReview(userId, courseId) {
    try {
      // Try Supabase first
      if (USE_SUPABASE) {
        try {
          const { error } = await supabase
            .from('course_reviews')
            .delete()
            .eq('user_id', userId)
            .eq('course_id', courseId);

          if (!error) {
            return { success: true };
          }
        } catch (apiError) {
          console.warn('[Course] Review delete failed:', apiError.message);
        }
      }

      // Fallback to local storage
      const stored = await AsyncStorage.getItem(REVIEWS_KEY);
      const reviews = stored ? JSON.parse(stored) : {};
      const key = `${userId}_${courseId}`;
      delete reviews[key];
      await AsyncStorage.setItem(REVIEWS_KEY, JSON.stringify(reviews));

      return { success: true };
    } catch (error) {
      console.error('[Course] deleteReview error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Mark review as helpful
   * @param {string} reviewId - Review ID
   * @returns {Promise<Object>} Result
   */
  async markReviewHelpful(reviewId) {
    try {
      if (USE_SUPABASE) {
        try {
          const { data, error } = await supabase.rpc('increment_review_helpful', {
            review_id: reviewId,
          });

          if (!error) {
            return { success: true };
          }
        } catch (apiError) {
          console.warn('[Course] Mark helpful failed:', apiError.message);
        }
      }

      return { success: false, error: 'Not supported in offline mode' };
    } catch (error) {
      console.error('[Course] markReviewHelpful error:', error);
      return { success: false, error: error.message };
    }
  }

  // ==================== UTILITY ====================

  /**
   * Clear all course data (for testing/logout)
   */
  async clearAllData() {
    try {
      await AsyncStorage.removeItem(ENROLLMENTS_KEY);
      await AsyncStorage.removeItem(PROGRESS_KEY);
      await AsyncStorage.removeItem(CERTIFICATES_KEY);
      await AsyncStorage.removeItem(REVIEWS_KEY);
      console.log('[Course] All data cleared');
    } catch (error) {
      console.error('[Course] clearAllData error:', error);
    }
  }
}

export const courseService = new CourseService();
export default courseService;
