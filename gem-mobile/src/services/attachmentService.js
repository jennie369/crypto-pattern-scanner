/**
 * Gemral - Attachment Service
 * Upload/Download file attachments for lessons
 * Bug #27 Fix: Proper file upload handling
 * Bug #29 Fix: Column name mismatch and storage bucket setup
 */

import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { supabase } from './supabase';
import { Alert, Platform } from 'react-native';

const BUCKET_NAME = 'course-attachments';
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

const ALLOWED_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/zip',
  'application/x-zip-compressed',
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'video/mp4',
  'audio/mpeg',
  'audio/wav',
  'text/plain',
];

/**
 * Pick a document from device
 * @param {Object} options - Pick options
 * @param {string} options.type - MIME type filter (default: all allowed)
 * @returns {Promise<{success: boolean, file?: Object, error?: string, canceled?: boolean}>}
 */
export const pickDocument = async (options = {}) => {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: options.type || '*/*',
      copyToCacheDirectory: true,
      multiple: false,
    });

    if (result.canceled) {
      return { success: false, canceled: true };
    }

    const file = result.assets[0];

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return {
        success: false,
        error: `File quá lớn. Giới hạn ${MAX_FILE_SIZE / 1024 / 1024}MB`,
      };
    }

    return {
      success: true,
      file: {
        uri: file.uri,
        name: file.name,
        type: file.mimeType || 'application/octet-stream',
        size: file.size,
      },
    };
  } catch (error) {
    console.error('[attachmentService] pickDocument error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Upload file to Supabase Storage
 * @param {Object} file - File object from pickDocument
 * @param {string} lessonId - Lesson ID to attach file to
 * @param {Function} onProgress - Progress callback (optional)
 * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
 */
export const uploadFile = async (file, lessonId, onProgress = null) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Chưa đăng nhập');

    if (!lessonId) {
      throw new Error('Lesson ID là bắt buộc. Vui lòng lưu bài học trước.');
    }

    // Generate unique filename
    const timestamp = Date.now();
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filePath = `lessons/${lessonId}/${timestamp}_${sanitizedName}`;

    console.log('[attachmentService] Uploading file:', {
      name: file.name,
      type: file.type,
      size: file.size,
      path: filePath,
    });

    // Read file - different methods for different platforms
    let fileData;
    try {
      if (Platform.OS === 'web') {
        // Web: Use fetch to get blob
        const response = await fetch(file.uri);
        fileData = await response.blob();
      } else {
        // Native: Try reading as base64 first
        const base64 = await FileSystem.readAsStringAsync(file.uri, {
          encoding: FileSystem.EncodingType.Base64,
        });

        // Convert base64 to ArrayBuffer
        const binaryStr = atob(base64);
        const bytes = new Uint8Array(binaryStr.length);
        for (let i = 0; i < binaryStr.length; i++) {
          bytes[i] = binaryStr.charCodeAt(i);
        }
        fileData = bytes.buffer;
      }
    } catch (readError) {
      console.warn('[attachmentService] Base64 read failed, trying fetch:', readError.message);

      // Fallback to fetch method
      try {
        const response = await fetch(file.uri);
        fileData = await response.blob();
      } catch (fetchError) {
        console.error('[attachmentService] Fetch also failed:', fetchError);
        throw new Error('Không thể đọc file. Vui lòng thử lại.');
      }
    }

    // Check if bucket exists by trying to list it
    const { error: bucketCheckError } = await supabase.storage.from(BUCKET_NAME).list('', { limit: 1 });

    if (bucketCheckError) {
      console.error('[attachmentService] Bucket check error:', bucketCheckError);

      if (bucketCheckError.message?.includes('not found') ||
          bucketCheckError.message?.includes('does not exist') ||
          bucketCheckError.statusCode === 404) {
        throw new Error(
          'Storage bucket "course-attachments" chưa được tạo.\n\n' +
          'Vui lòng tạo bucket trong:\n' +
          'Supabase Dashboard → Storage → New bucket\n\n' +
          'Tên: course-attachments\n' +
          'Public: Yes\n' +
          'Size limit: 50MB'
        );
      }
    }

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, fileData, {
        contentType: file.type || 'application/octet-stream',
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      console.error('[attachmentService] Upload error:', uploadError);

      // Provide specific error messages
      if (uploadError.message?.includes('Bucket not found') ||
          uploadError.message?.includes('not found')) {
        throw new Error(
          'Storage bucket chưa được tạo.\n\n' +
          'Vui lòng tạo bucket "course-attachments" trong:\n' +
          'Supabase Dashboard → Storage → New bucket'
        );
      }
      if (uploadError.message?.includes('row-level security') ||
          uploadError.message?.includes('policy') ||
          uploadError.message?.includes('403')) {
        throw new Error(
          'Không có quyền upload.\n\n' +
          'Vui lòng thêm Storage Policies cho bucket "course-attachments":\n' +
          '1. Allow INSERT for authenticated users\n' +
          '2. Allow SELECT for authenticated users'
        );
      }
      if (uploadError.message?.includes('Payload too large') ||
          uploadError.message?.includes('413')) {
        throw new Error('File quá lớn. Giới hạn 50MB.');
      }
      throw new Error(uploadError.message || 'Upload thất bại');
    }

    console.log('[attachmentService] Upload successful:', uploadData);

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath);

    // Save to database - use correct column names from migration
    const { data: dbData, error: dbError } = await supabase
      .from('lesson_attachments')
      .insert({
        lesson_id: lessonId,
        file_name: file.name,
        file_url: urlData?.publicUrl || '',
        file_type: file.type || 'application/octet-stream',
        file_size: file.size || 0,
        storage_path: filePath,
        created_by: user.id,
      })
      .select()
      .single();

    if (dbError) {
      console.error('[attachmentService] DB error:', dbError);

      // Clean up uploaded file on DB error
      try {
        await supabase.storage.from(BUCKET_NAME).remove([filePath]);
      } catch (cleanupError) {
        console.warn('[attachmentService] Cleanup failed:', cleanupError);
      }

      if (dbError.code === '42P01' || dbError.message?.includes('does not exist')) {
        throw new Error(
          'Bảng lesson_attachments chưa được tạo.\n\n' +
          'Vui lòng chạy migration 20251202_fix_lesson_attachments.sql trong Supabase SQL Editor.'
        );
      }
      if (dbError.code === '42703' || dbError.message?.includes('column')) {
        throw new Error(
          'Cấu trúc bảng không khớp.\n\n' +
          'Vui lòng chạy migration 20251202_fix_lesson_attachments.sql để thêm các cột còn thiếu.'
        );
      }
      throw new Error(dbError.message || 'Lỗi lưu vào database');
    }

    console.log('[attachmentService] DB insert successful:', dbData);

    return {
      success: true,
      data: dbData,
    };
  } catch (error) {
    console.error('[attachmentService] uploadFile error:', error);
    return { success: false, error: error.message || 'Lỗi không xác định' };
  }
};

/**
 * Delete attachment from storage and database
 * @param {string} attachmentId - Attachment ID to delete
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const deleteAttachment = async (attachmentId) => {
  try {
    // Get attachment info
    const { data: attachment, error: fetchError } = await supabase
      .from('lesson_attachments')
      .select('*')
      .eq('id', attachmentId)
      .single();

    if (fetchError) throw fetchError;

    // Delete from storage
    if (attachment.storage_path) {
      const { error: storageError } = await supabase.storage
        .from(BUCKET_NAME)
        .remove([attachment.storage_path]);

      if (storageError) {
        console.warn('[attachmentService] Storage delete warning:', storageError);
        // Continue with DB delete even if storage fails
      }
    }

    // Delete from database
    const { error: deleteError } = await supabase
      .from('lesson_attachments')
      .delete()
      .eq('id', attachmentId);

    if (deleteError) throw deleteError;

    return { success: true };
  } catch (error) {
    console.error('[attachmentService] deleteAttachment error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get all attachments for a lesson
 * @param {string} lessonId - Lesson ID
 * @returns {Promise<{success: boolean, data?: Array, error?: string}>}
 */
export const getLessonAttachments = async (lessonId) => {
  try {
    const { data, error } = await supabase
      .from('lesson_attachments')
      .select('*')
      .eq('lesson_id', lessonId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return { success: true, data: data || [] };
  } catch (error) {
    console.error('[attachmentService] getLessonAttachments error:', error);
    return { success: false, error: error.message, data: [] };
  }
};

/**
 * Download attachment to device
 * @param {Object} attachment - Attachment object
 * @returns {Promise<{success: boolean, uri?: string, error?: string}>}
 */
export const downloadAttachment = async (attachment) => {
  try {
    const downloadDir = FileSystem.documentDirectory;
    const fileUri = `${downloadDir}${attachment.file_name}`;

    const downloadResult = await FileSystem.downloadAsync(
      attachment.file_url,
      fileUri
    );

    if (downloadResult.status !== 200) {
      throw new Error('Download failed with status: ' + downloadResult.status);
    }

    return {
      success: true,
      uri: downloadResult.uri,
    };
  } catch (error) {
    console.error('[attachmentService] downloadAttachment error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get file type icon name based on MIME type
 * @param {string} mimeType - MIME type of file
 * @returns {string} Icon name for lucide-react-native
 */
export const getFileTypeIcon = (mimeType) => {
  if (!mimeType) return 'File';

  if (mimeType.startsWith('image/')) return 'Image';
  if (mimeType.startsWith('video/')) return 'Video';
  if (mimeType.startsWith('audio/')) return 'Music';
  if (mimeType === 'application/pdf') return 'FileText';
  if (mimeType.includes('word') || mimeType.includes('document')) return 'FileText';
  if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return 'Table';
  if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) return 'Presentation';
  if (mimeType.startsWith('text/')) return 'FileText';

  return 'File';
};

/**
 * Format file size for display
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted file size
 */
export const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return '0 B';

  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(1)} ${units[unitIndex]}`;
};

// =====================================================
// EXPORTS
// =====================================================

export default {
  pickDocument,
  uploadFile,
  deleteAttachment,
  getLessonAttachments,
  downloadAttachment,
  getFileTypeIcon,
  formatFileSize,
  BUCKET_NAME,
  MAX_FILE_SIZE,
  ALLOWED_TYPES,
};
