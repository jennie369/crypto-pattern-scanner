/**
 * courseImageService.js - Course Lesson Image Management
 * Manages image upload, CRUD operations for course lessons
 * Syncs with mobile app via shared Supabase backend
 */

import { supabase } from '../lib/supabaseClient';

const BUCKET_NAME = 'course-images';
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/gif', 'image/webp', 'image/svg+xml'];

export const courseImageService = {
  /**
   * Lấy danh sách hình theo lesson
   * @param {string} lessonId - Lesson ID
   * @returns {Promise<Array>} Array of images
   */
  async getByLesson(lessonId) {
    if (!lessonId) return [];

    try {
      const { data, error } = await supabase
        .from('course_lesson_images')
        .select('*')
        .eq('lesson_id', lessonId)
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('[courseImageService] getByLesson error:', error);
      return [];
    }
  },

  /**
   * Lấy tất cả hình (Media Library) - DEPRECATED, use getMyImages or getAllImagesAdmin
   * @param {Object} options - { limit, offset, search }
   * @returns {Promise<Object>} { data, count, error }
   */
  async getAll(options = {}) {
    const { limit = 50, offset = 0, search = '' } = options;

    try {
      let query = supabase
        .from('course_lesson_images')
        .select('*', { count: 'exact' })
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (search) {
        query = query.or(`file_name.ilike.%${search}%,position_id.ilike.%${search}%`);
      }

      const { data, error, count } = await query;

      if (error) throw error;
      return { data: data || [], count, error: null };
    } catch (error) {
      console.error('[courseImageService] getAll error:', error);
      return { data: [], count: 0, error };
    }
  },

  /**
   * Lấy tất cả hình của user hiện tại (My Images)
   * @param {Object} options - { limit, offset, search }
   * @returns {Promise<Object>} { data, count, error }
   */
  async getMyImages(options = {}) {
    const { limit = 100, offset = 0, search = '' } = options;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { data: [], count: 0, error: 'User not authenticated' };
      }

      let query = supabase
        .from('course_lesson_images')
        .select('*, lessons:lesson_id(title), courses:lessons!inner(course_id(title))', { count: 'exact' })
        .eq('is_active', true)
        .eq('created_by', user.id)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (search) {
        query = query.or(`file_name.ilike.%${search}%,position_id.ilike.%${search}%,title.ilike.%${search}%`);
      }

      const { data, error, count } = await query;

      if (error) {
        // Fallback: simple query without joins
        console.warn('[courseImageService] getMyImages join failed, falling back:', error);
        let fallbackQuery = supabase
          .from('course_lesson_images')
          .select('*', { count: 'exact' })
          .eq('is_active', true)
          .eq('created_by', user.id)
          .order('created_at', { ascending: false })
          .range(offset, offset + limit - 1);

        if (search) {
          fallbackQuery = fallbackQuery.or(`file_name.ilike.%${search}%,position_id.ilike.%${search}%`);
        }

        const fallbackResult = await fallbackQuery;
        return { data: fallbackResult.data || [], count: fallbackResult.count, error: null };
      }

      return { data: data || [], count, error: null };
    } catch (error) {
      console.error('[courseImageService] getMyImages error:', error);
      return { data: [], count: 0, error };
    }
  },

  /**
   * Lấy tất cả hình (Admin only - xem tất cả của mọi user)
   * @param {Object} options - { limit, offset, search, userId }
   * @returns {Promise<Object>} { data, count, error }
   */
  async getAllImagesAdmin(options = {}) {
    const { limit = 100, offset = 0, search = '', userId = null } = options;

    try {
      let query = supabase
        .from('course_lesson_images')
        .select('*, profiles:created_by(username, email)', { count: 'exact' })
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (search) {
        query = query.or(`file_name.ilike.%${search}%,position_id.ilike.%${search}%,title.ilike.%${search}%`);
      }

      // Filter by specific user if provided
      if (userId) {
        query = query.eq('created_by', userId);
      }

      const { data, error, count } = await query;

      if (error) {
        // Fallback: simple query without joins
        console.warn('[courseImageService] getAllImagesAdmin join failed, falling back:', error);
        let fallbackQuery = supabase
          .from('course_lesson_images')
          .select('*', { count: 'exact' })
          .eq('is_active', true)
          .order('created_at', { ascending: false })
          .range(offset, offset + limit - 1);

        if (search) {
          fallbackQuery = fallbackQuery.or(`file_name.ilike.%${search}%,position_id.ilike.%${search}%`);
        }

        if (userId) {
          fallbackQuery = fallbackQuery.eq('created_by', userId);
        }

        const fallbackResult = await fallbackQuery;
        return { data: fallbackResult.data || [], count: fallbackResult.count, error: null };
      }

      return { data: data || [], count, error: null };
    } catch (error) {
      console.error('[courseImageService] getAllImagesAdmin error:', error);
      return { data: [], count: 0, error };
    }
  },

  /**
   * Upload file lên Storage
   * @param {File} file - File to upload
   * @param {string} lessonId - Lesson ID
   * @returns {Promise<Object>} Upload result
   */
  async uploadFile(file, lessonId) {
    // Validate file
    if (!file) throw new Error('File is required');
    if (file.size > MAX_FILE_SIZE) throw new Error('File quá lớn (tối đa 10MB)');
    if (!ALLOWED_TYPES.includes(file.type)) {
      throw new Error('Chỉ hỗ trợ PNG, JPG, SVG, WebP, GIF');
    }

    // Clean filename and create unique path with random suffix
    const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    const fileName = `${lessonId}/${Date.now()}_${randomSuffix}_${cleanName}`;

    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true, // Allow overwrite to prevent silent failures
      });

    if (error) throw error;

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(fileName);

    return {
      storagePath: data.path,
      publicUrl,
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type,
    };
  },

  /**
   * Tạo record hình ảnh mới
   * @param {Object} imageData - Image data
   * @returns {Promise<Object>} { data, error }
   */
  async create(imageData) {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      // Get next sort order
      const { data: existing } = await supabase
        .from('course_lesson_images')
        .select('sort_order')
        .eq('lesson_id', imageData.lesson_id)
        .order('sort_order', { ascending: false })
        .limit(1);

      const nextOrder = (existing?.[0]?.sort_order ?? -1) + 1;

      const { data, error } = await supabase
        .from('course_lesson_images')
        .insert({
          ...imageData,
          sort_order: nextOrder,
          is_active: true,
          created_by: user?.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('[courseImageService] create error:', error);
      return { data: null, error };
    }
  },

  /**
   * Cập nhật thông tin hình
   * @param {string} imageId - Image ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} { data, error }
   */
  async update(imageId, updateData) {
    if (!imageId) return { data: null, error: 'Missing imageId' };

    try {
      const { data, error } = await supabase
        .from('course_lesson_images')
        .update({
          ...updateData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', imageId)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('[courseImageService] update error:', error);
      return { data: null, error };
    }
  },

  /**
   * Xóa hình (soft delete)
   * @param {string} imageId - Image ID
   * @returns {Promise<Object>} { error }
   */
  async delete(imageId) {
    if (!imageId) return { error: 'Missing imageId' };

    try {
      const { error } = await supabase
        .from('course_lesson_images')
        .update({ is_active: false })
        .eq('id', imageId);

      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('[courseImageService] delete error:', error);
      return { error };
    }
  },

  /**
   * Xóa hình vĩnh viễn (hard delete) + xóa file storage
   * @param {string} imageId - Image ID
   * @returns {Promise<Object>} { error }
   */
  async hardDelete(imageId) {
    if (!imageId) return { error: 'Missing imageId' };

    try {
      // Get image info first
      const { data: image } = await supabase
        .from('course_lesson_images')
        .select('storage_path')
        .eq('id', imageId)
        .single();

      // Delete from storage if path exists
      if (image?.storage_path) {
        await supabase.storage
          .from(BUCKET_NAME)
          .remove([image.storage_path]);
      }

      // Delete record
      const { error } = await supabase
        .from('course_lesson_images')
        .delete()
        .eq('id', imageId);

      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('[courseImageService] hardDelete error:', error);
      return { error };
    }
  },

  /**
   * Cập nhật thứ tự hình
   * @param {Array} images - Array of images with new order
   * @returns {Promise<Object>} { error }
   */
  async updateOrder(images) {
    try {
      for (let i = 0; i < images.length; i++) {
        await supabase
          .from('course_lesson_images')
          .update({ sort_order: i })
          .eq('id', images[i].id);
      }
      return { error: null };
    } catch (error) {
      console.error('[courseImageService] updateOrder error:', error);
      return { error };
    }
  },

  /**
   * Validate position_id format
   * @param {string} positionId - Position ID to validate
   * @returns {Object} { valid, error }
   */
  validatePositionId(positionId) {
    if (!positionId || positionId.trim() === '') {
      return { valid: false, error: 'Position ID bắt buộc' };
    }
    if (positionId.length > 50) {
      return { valid: false, error: 'Tối đa 50 ký tự' };
    }
    if (!/^[a-zA-Z0-9_-]+$/.test(positionId)) {
      return { valid: false, error: 'Chỉ cho phép a-z, 0-9, -, _' };
    }
    return { valid: true, error: null };
  },

  /**
   * Kiểm tra position_id đã tồn tại trong lesson chưa
   * @param {string} lessonId - Lesson ID
   * @param {string} positionId - Position ID
   * @param {string} excludeImageId - Image ID to exclude (for updates)
   * @returns {Promise<boolean>} True if duplicate exists
   */
  async checkDuplicatePositionId(lessonId, positionId, excludeImageId = null) {
    // Skip if lessonId is empty or invalid
    if (!lessonId || !positionId) {
      return false;
    }

    try {
      let query = supabase
        .from('course_lesson_images')
        .select('id')
        .eq('lesson_id', lessonId)
        .eq('position_id', positionId)
        .eq('is_active', true);

      if (excludeImageId) {
        query = query.neq('id', excludeImageId);
      }

      const { data, error } = await query;

      // If there's a type error, return false (no duplicate) to allow the operation to continue
      if (error) {
        console.warn('[courseImageService] checkDuplicatePositionId query error:', error);
        // Don't throw - just return false to not block uploads
        return false;
      }
      return (data?.length || 0) > 0;
    } catch (error) {
      console.error('[courseImageService] checkDuplicatePositionId error:', error);
      // Return false to not block the upload operation
      return false;
    }
  },

  /**
   * Generate suggested position_id from filename with unique suffix
   * @param {string} fileName - Original file name
   * @returns {string} Suggested position ID
   */
  generatePositionId(fileName) {
    const randomSuffix = Math.random().toString(36).substring(2, 6);

    if (!fileName) return `image-${randomSuffix}`;

    // Remove extension
    const nameWithoutExt = fileName.replace(/\.[^/.]+$/, '');
    // Replace non-alphanumeric with dash
    const cleaned = nameWithoutExt.replace(/[^a-zA-Z0-9]/g, '-');
    // Remove consecutive dashes and trim
    const normalized = cleaned.replace(/-+/g, '-').replace(/^-|-$/g, '');
    // Limit length, lowercase, and add random suffix for uniqueness
    const baseName = normalized.substring(0, 35).toLowerCase() || 'image';
    return `${baseName}-${randomSuffix}`;
  },

  /**
   * Get image dimensions from file
   * @param {File} file - Image file
   * @returns {Promise<Object>} { width, height }
   */
  async getImageDimensions(file) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new window.Image();
        img.onload = () => {
          resolve({ width: img.width, height: img.height });
        };
        img.onerror = () => {
          resolve({ width: 0, height: 0 });
        };
        img.src = e.target.result;
      };
      reader.onerror = () => {
        resolve({ width: 0, height: 0 });
      };
      reader.readAsDataURL(file);
    });
  },

  /**
   * Full upload flow: upload file + create record
   * @param {File} file - File to upload
   * @param {string} lessonId - Lesson ID
   * @param {Object} metadata - { positionId, title, caption, altText }
   * @returns {Promise<Object>} { data, error }
   */
  async uploadAndCreate(file, lessonId, metadata = {}) {
    try {
      // Upload file
      const uploadResult = await this.uploadFile(file, lessonId);

      // Get dimensions
      const dimensions = await this.getImageDimensions(file);

      // Create record
      const { data, error } = await this.create({
        lesson_id: lessonId,
        image_url: uploadResult.publicUrl,
        storage_path: uploadResult.storagePath,
        file_name: uploadResult.fileName,
        file_size: uploadResult.fileSize,
        mime_type: uploadResult.mimeType,
        position_id: metadata.positionId || this.generatePositionId(file.name),
        title: metadata.title || '',
        caption: metadata.caption || '',
        alt_text: metadata.altText || '',
        width: dimensions.width,
        height: dimensions.height,
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('[courseImageService] uploadAndCreate error:', error);
      return { data: null, error };
    }
  },
};

export default courseImageService;
