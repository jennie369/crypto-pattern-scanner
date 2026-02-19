/**
 * Gemral - Course Image Service
 * Service quan ly hinh anh cho bai hoc
 * Supports: upload, CRUD, search, reorder
 */

import { supabase } from './supabase';
import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';

const BUCKET_NAME = 'course-images';
const TABLE_NAME = 'course_lesson_images';
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = [
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/gif',
  'image/webp',
  'image/svg+xml',
];

/**
 * Lay danh sach hinh theo lesson
 * @param {string} lessonId - ID cua lesson
 * @returns {Promise<Array>}
 */
export const getByLesson = async (lessonId) => {
  if (!lessonId) return [];

  try {
    const { data, error } = await supabase
      .from(TABLE_NAME)
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
};

/**
 * Lay tat ca hinh trong thu vien
 * @param {number} limit - So luong toi da
 * @param {number} offset - Vi tri bat dau
 * @returns {Promise<Array>}
 */
export const getAll = async (limit = 50, offset = 0) => {
  try {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('[courseImageService] getAll error:', error);
    return [];
  }
};

/**
 * Tim kiem hinh theo keyword
 * @param {string} keyword - Tu khoa tim kiem
 * @returns {Promise<Array>}
 */
export const search = async (keyword) => {
  if (!keyword?.trim()) return getAll();

  try {
    const searchTerm = keyword.trim().toLowerCase();
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .eq('is_active', true)
      .or(`title.ilike.%${searchTerm}%,position_id.ilike.%${searchTerm}%,file_name.ilike.%${searchTerm}%`)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('[courseImageService] search error:', error);
    return [];
  }
};

/**
 * Them hinh moi
 * @param {Object} imageData - Du lieu hinh anh
 * @returns {Promise<Object|null>}
 */
export const create = async (imageData) => {
  try {
    const { data: { session } } = await supabase.auth.getSession();

    const { data, error } = await supabase
      .from(TABLE_NAME)
      .insert({
        ...imageData,
        created_by: session?.user?.id || null,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('[courseImageService] create error:', error);
    throw error;
  }
};

/**
 * Cap nhat thong tin hinh
 * @param {string} id - UUID cua image
 * @param {Object} updates - Cac field can update
 * @returns {Promise<Object|null>}
 */
export const update = async (id, updates) => {
  try {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('[courseImageService] update error:', error);
    throw error;
  }
};

/**
 * Cap nhat thu tu hinh (batch update)
 * @param {Array} images - Mang images voi thu tu moi
 * @returns {Promise<boolean>}
 */
export const updateOrder = async (images) => {
  try {
    const updates = (images || []).map((img, index) => ({
      id: img.id,
      sort_order: index,
    }));

    for (const item of updates) {
      const { error } = await supabase
        .from(TABLE_NAME)
        .update({ sort_order: item.sort_order })
        .eq('id', item.id);

      if (error) throw error;
    }

    return true;
  } catch (error) {
    console.error('[courseImageService] updateOrder error:', error);
    throw error;
  }
};

/**
 * Xoa hinh (soft delete)
 * @param {string} id - UUID cua image
 * @returns {Promise<boolean>}
 */
export const deleteImage = async (id) => {
  try {
    const { error } = await supabase
      .from(TABLE_NAME)
      .update({ is_active: false })
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('[courseImageService] delete error:', error);
    throw error;
  }
};

/**
 * Xoa hinh vinh vien + xoa file storage
 * @param {string} id - UUID cua image
 * @param {string} storagePath - Path trong storage
 * @returns {Promise<boolean>}
 */
export const hardDelete = async (id, storagePath) => {
  try {
    // Xoa file tu storage
    if (storagePath) {
      const { error: storageError } = await supabase.storage
        .from(BUCKET_NAME)
        .remove([storagePath]);

      if (storageError) {
        console.warn('[courseImageService] Storage delete warning:', storageError);
      }
    }

    // Xoa record tu database
    const { error } = await supabase
      .from(TABLE_NAME)
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('[courseImageService] hardDelete error:', error);
    throw error;
  }
};

/**
 * Upload file len storage
 * @param {string} fileUri - URI cua file local
 * @param {string} fileName - Ten file
 * @param {string} mimeType - MIME type
 * @param {string} folderPath - Duong dan thu muc
 * @returns {Promise<{path: string, url: string}>}
 */
export const uploadFile = async (fileUri, fileName, mimeType, folderPath = 'lessons') => {
  try {
    // Read file - platform specific
    let fileData;
    if (Platform.OS === 'web') {
      const response = await fetch(fileUri);
      fileData = await response.blob();
    } else {
      // React Native: use FileSystem
      const base64 = await FileSystem.readAsStringAsync(fileUri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      const binaryString = atob(base64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      fileData = bytes.buffer;
    }

    const filePath = `${folderPath}/${fileName}`;

    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, fileData, {
        contentType: mimeType,
        upsert: false,
      });

    if (error) throw error;

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath);

    return {
      path: filePath,
      url: urlData?.publicUrl || '',
    };
  } catch (error) {
    console.error('[courseImageService] uploadFile error:', error);
    throw error;
  }
};

/**
 * Xoa file khoi storage
 * @param {string} path - Path trong storage
 * @returns {Promise<boolean>}
 */
export const deleteFile = async (path) => {
  try {
    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([path]);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('[courseImageService] deleteFile error:', error);
    throw error;
  }
};

/**
 * Lay public URL tu path
 * @param {string} path - Path trong storage
 * @returns {string}
 */
export const getPublicUrl = (path) => {
  const { data } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(path);
  return data?.publicUrl || '';
};

/**
 * Validate file truoc khi upload
 * @param {Object} file - File object
 * @returns {{valid: boolean, error?: string}}
 */
export const validateFile = (file) => {
  if (!file) {
    return { valid: false, error: 'Khong tim thay file' };
  }

  if (file.fileSize && file.fileSize > MAX_FILE_SIZE) {
    return { valid: false, error: 'File qua lon (toi da 5MB)' };
  }

  const mimeType = file.mimeType || file.type || '';
  if (mimeType && !ALLOWED_TYPES.includes(mimeType)) {
    return {
      valid: false,
      error: 'Dinh dang khong ho tro. Chi cho phep: PNG, JPG, GIF, WebP, SVG',
    };
  }

  return { valid: true };
};

/**
 * Validate position_id
 * @param {string} positionId - ID can validate
 * @param {Array} existingImages - Danh sach hinh hien co
 * @param {string} currentImageId - ID hinh dang edit (de exclude)
 * @returns {{valid: boolean, error?: string}}
 */
export const validatePositionId = (positionId, existingImages = [], currentImageId = null) => {
  if (!positionId?.trim()) {
    return { valid: false, error: 'Position ID khong duoc de trong' };
  }

  if (positionId.length > 50) {
    return { valid: false, error: 'Position ID toi da 50 ky tu' };
  }

  const validPattern = /^[a-zA-Z0-9_-]+$/;
  if (!validPattern.test(positionId)) {
    return {
      valid: false,
      error: 'Position ID chi cho phep chu, so, dau gach ngang va gach duoi',
    };
  }

  const duplicate = (existingImages || []).find(
    (img) => img.position_id === positionId && img.id !== currentImageId
  );
  if (duplicate) {
    return { valid: false, error: 'Position ID nay da duoc su dung' };
  }

  return { valid: true };
};

/**
 * Generate unique position ID
 * @param {string} prefix - Prefix for ID
 * @returns {string}
 */
export const generatePositionId = (prefix = 'img') => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 4);
  return `${prefix}-${timestamp}-${random}`;
};

// Export as named exports and default object
export default {
  getByLesson,
  getAll,
  search,
  create,
  update,
  updateOrder,
  deleteImage,
  hardDelete,
  uploadFile,
  deleteFile,
  getPublicUrl,
  validateFile,
  validatePositionId,
  generatePositionId,
  BUCKET_NAME,
  MAX_FILE_SIZE,
  ALLOWED_TYPES,
};
