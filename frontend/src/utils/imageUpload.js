/**
 * Image Upload Utility
 * Handles image uploads to Supabase Storage
 */

import { supabase } from '../lib/supabaseClient';

/**
 * Upload image to Supabase Storage
 * @param {File} file - Image file to upload
 * @param {string} bucket - Storage bucket name (default: 'event-covers')
 * @param {string} folder - Folder path in bucket (default: 'covers')
 * @returns {Promise<string>} Public URL of uploaded image
 */
export async function uploadImage(file, bucket = 'event-covers', folder = 'covers') {
  try {
    // Validate file
    if (!file) {
      throw new Error('No file provided');
    }

    // Check file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.');
    }

    // Check file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      throw new Error('File size exceeds 5MB limit');
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 15);
    const fileExt = file.name.split('.').pop();
    const fileName = `${timestamp}-${randomStr}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    console.log('📤 Uploading image:', fileName);

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('❌ Upload error:', error);
      throw error;
    }

    console.log('✅ Upload successful:', data.path);

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    if (!publicUrlData || !publicUrlData.publicUrl) {
      throw new Error('Failed to get public URL');
    }

    console.log('✅ Public URL:', publicUrlData.publicUrl);

    return publicUrlData.publicUrl;

  } catch (error) {
    console.error('💥 Image upload failed:', error);
    throw error;
  }
}

/**
 * Delete image from Supabase Storage
 * @param {string} imageUrl - Public URL of image to delete
 * @param {string} bucket - Storage bucket name
 * @returns {Promise<void>}
 */
export async function deleteImage(imageUrl, bucket = 'event-covers') {
  try {
    if (!imageUrl) return;

    // Extract file path from URL
    const url = new URL(imageUrl);
    const pathSegments = url.pathname.split('/');
    const filePath = pathSegments.slice(pathSegments.indexOf(bucket) + 1).join('/');

    console.log('🗑️ Deleting image:', filePath);

    const { error } = await supabase.storage
      .from(bucket)
      .remove([filePath]);

    if (error) {
      console.error('❌ Delete error:', error);
      throw error;
    }

    console.log('✅ Image deleted successfully');

  } catch (error) {
    console.error('💥 Image deletion failed:', error);
    // Don't throw error - deletion failure shouldn't block other operations
  }
}

/**
 * Compress image before upload (optional)
 * @param {File} file - Image file to compress
 * @param {number} maxWidth - Maximum width (default: 1200)
 * @param {number} quality - Quality 0-1 (default: 0.8)
 * @returns {Promise<Blob>} Compressed image blob
 */
export async function compressImage(file, maxWidth = 1200, quality = 0.8) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to compress image'));
            }
          },
          file.type,
          quality
        );
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target.result;
    };

    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}
