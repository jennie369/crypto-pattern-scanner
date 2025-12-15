/**
 * Gemral - Image Service
 * Handles image upload, processing, and thumbnail generation
 */

import { Image } from 'react-native';
import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system';
import { supabase } from './supabase';
import { IMAGE_SPECS, STORAGE_BUCKET } from '../constants/imageConstants';
import { calculateFitDimensions, getThumbnailDimensions, calculateAspectRatio } from '../utils/imageUtils';

class ImageService {
  /**
   * Upload image with automatic processing and thumbnail generation
   * @param {string} uri - Local image URI
   * @param {string} userId - User ID
   * @param {string} postId - Post ID
   * @returns {Object} - Image data with all URLs and metadata
   */
  async uploadPostImage(uri, userId, postId) {
    try {
      // 1. Get image info
      const imageInfo = await FileSystem.getInfoAsync(uri);
      const dimensions = await this.getImageDimensions(uri);
      const { width, height } = dimensions;

      // 2. Resize to max resolution (1080px)
      const fittedDimensions = calculateFitDimensions(width, height, 1080);
      const resizedUri = await this.resizeImage(uri, fittedDimensions);

      // 3. Generate thumbnails
      const thumbnailUri = await this.generateThumbnail(resizedUri, fittedDimensions.width, fittedDimensions.height);
      const mediumUri = await this.generateMedium(resizedUri);
      const placeholderUri = await this.generatePlaceholder(resizedUri);

      // 4. Upload all versions
      const timestamp = Date.now();
      const basePath = `posts/${userId}/${postId}`;

      const [fullUrl, thumbnailUrl, mediumUrl, placeholderUrl] = await Promise.all([
        this.uploadToStorage(resizedUri, `${basePath}_full_${timestamp}.jpg`),
        this.uploadToStorage(thumbnailUri, `${basePath}_thumb_${timestamp}.jpg`),
        this.uploadToStorage(mediumUri, `${basePath}_medium_${timestamp}.jpg`),
        this.uploadToStorage(placeholderUri, `${basePath}_placeholder_${timestamp}.jpg`)
      ]);

      // 5. Calculate aspect ratio
      const aspectRatio = calculateAspectRatio(fittedDimensions.width, fittedDimensions.height);

      // 6. Clean up temp files
      await this.cleanupTempFiles([resizedUri, thumbnailUri, mediumUri, placeholderUri]);

      return {
        imageUrl: fullUrl,
        thumbnailUrl,
        mediumUrl,
        placeholderUrl,
        width: fittedDimensions.width,
        height: fittedDimensions.height,
        ratio: aspectRatio,
        size: imageInfo.size || 0,
        format: 'jpeg',
        blurhash: null // TODO: Implement blurhash generation
      };

    } catch (error) {
      console.error('Image upload error:', error);
      throw new Error(`Failed to upload image: ${error.message}`);
    }
  }

  /**
   * Get image dimensions
   * @param {string} uri - Image URI
   * @returns {Promise<{width: number, height: number}>}
   */
  async getImageDimensions(uri) {
    return new Promise((resolve, reject) => {
      Image.getSize(
        uri,
        (width, height) => resolve({ width, height }),
        (error) => reject(new Error(`Failed to get image size: ${error}`))
      );
    });
  }

  /**
   * Resize image to fit max dimensions
   * @param {string} uri - Image URI
   * @param {Object} dimensions - Target dimensions {width, height}
   * @returns {Promise<string>} - Resized image URI
   */
  async resizeImage(uri, dimensions) {
    const result = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: dimensions }],
      {
        compress: IMAGE_SPECS.QUALITY.HIGH / 100,
        format: ImageManipulator.SaveFormat.JPEG
      }
    );
    return result.uri;
  }

  /**
   * Generate 3:4 thumbnail for grid view
   * @param {string} uri - Image URI
   * @param {number} originalWidth - Original width
   * @param {number} originalHeight - Original height
   * @returns {Promise<string>} - Thumbnail URI
   */
  async generateThumbnail(uri, originalWidth, originalHeight) {
    const thumbDimensions = getThumbnailDimensions(originalWidth, originalHeight);

    // Only crop if needed
    const actions = [];

    // Crop to 3:4 aspect ratio if needed
    if (thumbDimensions.offsetX > 0 || thumbDimensions.offsetY > 0) {
      actions.push({
        crop: {
          originX: thumbDimensions.offsetX,
          originY: thumbDimensions.offsetY,
          width: thumbDimensions.cropWidth,
          height: thumbDimensions.cropHeight
        }
      });
    }

    // Resize to target size
    actions.push({
      resize: {
        width: Math.min(thumbDimensions.width, 360),
        height: Math.min(thumbDimensions.height, 480)
      }
    });

    const result = await ImageManipulator.manipulateAsync(
      uri,
      actions,
      {
        compress: IMAGE_SPECS.QUALITY.THUMBNAIL / 100,
        format: ImageManipulator.SaveFormat.JPEG
      }
    );

    return result.uri;
  }

  /**
   * Generate medium size for list views (720px width)
   * @param {string} uri - Image URI
   * @returns {Promise<string>} - Medium image URI
   */
  async generateMedium(uri) {
    const result = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: IMAGE_SPECS.SIZES.MEDIUM.width } }],
      {
        compress: IMAGE_SPECS.QUALITY.MEDIUM / 100,
        format: ImageManipulator.SaveFormat.JPEG
      }
    );
    return result.uri;
  }

  /**
   * Generate tiny placeholder for blur-up effect (50px)
   * @param {string} uri - Image URI
   * @returns {Promise<string>} - Placeholder image URI
   */
  async generatePlaceholder(uri) {
    const result = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: IMAGE_SPECS.SIZES.PLACEHOLDER.width } }],
      {
        compress: IMAGE_SPECS.QUALITY.PLACEHOLDER / 100,
        format: ImageManipulator.SaveFormat.JPEG
      }
    );
    return result.uri;
  }

  /**
   * Upload file to Supabase Storage
   * @param {string} uri - Local file URI
   * @param {string} path - Storage path
   * @returns {Promise<string>} - Public URL
   */
  async uploadToStorage(uri, path) {
    try {
      // Read file as base64
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64
      });

      // Convert to ArrayBuffer
      const arrayBuffer = this.base64ToArrayBuffer(base64);

      // Upload to Supabase
      const { data, error } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(path, arrayBuffer, {
          contentType: 'image/jpeg',
          upsert: false
        });

      if (error) throw error;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(STORAGE_BUCKET)
        .getPublicUrl(data.path);

      return urlData.publicUrl;
    } catch (error) {
      console.error('Storage upload error:', error);
      throw error;
    }
  }

  /**
   * Convert base64 string to ArrayBuffer
   * @param {string} base64 - Base64 string
   * @returns {ArrayBuffer}
   */
  base64ToArrayBuffer(base64) {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  }

  /**
   * Clean up temporary files
   * @param {string[]} uris - Array of URIs to delete
   */
  async cleanupTempFiles(uris) {
    for (const uri of uris) {
      try {
        if (uri && uri.includes('ImageManipulator')) {
          await FileSystem.deleteAsync(uri, { idempotent: true });
        }
      } catch (error) {
        console.warn('Failed to cleanup temp file:', uri, error);
      }
    }
  }

  /**
   * Delete post images from storage
   * @param {Object} imageData - Image URLs object
   * @returns {Promise<{success: boolean}>}
   */
  async deletePostImages(imageData) {
    try {
      const urls = [
        imageData.imageUrl,
        imageData.thumbnailUrl,
        imageData.mediumUrl,
        imageData.placeholderUrl
      ].filter(Boolean);

      const paths = urls.map(url => {
        const urlParts = url.split(`/${STORAGE_BUCKET}/`);
        return urlParts[1];
      }).filter(Boolean);

      if (paths.length > 0) {
        const { error } = await supabase.storage
          .from(STORAGE_BUCKET)
          .remove(paths);

        if (error) throw error;
      }

      return { success: true };
    } catch (error) {
      console.error('Delete images error:', error);
      throw error;
    }
  }

  /**
   * Upload multiple images for a post
   * @param {string[]} uris - Array of image URIs
   * @param {string} userId - User ID
   * @param {string} postId - Post ID
   * @returns {Promise<Object[]>} - Array of image data objects
   */
  async uploadMultipleImages(uris, userId, postId) {
    const results = [];

    for (let i = 0; i < uris.length; i++) {
      const uri = uris[i];
      const imageData = await this.uploadPostImage(uri, userId, `${postId}_${i}`);
      results.push(imageData);
    }

    return results;
  }

  /**
   * Compress an image to a specific quality
   * @param {string} uri - Image URI
   * @param {number} quality - Quality level (0-100)
   * @returns {Promise<string>} - Compressed image URI
   */
  async compressImage(uri, quality = 80) {
    const result = await ImageManipulator.manipulateAsync(
      uri,
      [],
      {
        compress: quality / 100,
        format: ImageManipulator.SaveFormat.JPEG
      }
    );
    return result.uri;
  }
}

export default new ImageService();
