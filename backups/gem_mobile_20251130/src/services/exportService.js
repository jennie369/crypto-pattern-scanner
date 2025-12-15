/**
 * Gemral - Export Service
 *
 * Export AI responses/readings as beautiful images
 * - Save to gallery
 * - Share to social media
 * - Tier-based watermark logic
 */

import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';
import { captureRef } from 'react-native-view-shot';
import TierService from './tierService';

// Template definitions
const TEMPLATES = [
  {
    id: 'reading_card',
    name: 'Reading Card',
    description: 'Beautiful card for I Ching/Tarot readings',
    tier: 'FREE',
    aspectRatio: 9 / 16, // Instagram story
  },
  {
    id: 'chat_wisdom',
    name: 'Chat Wisdom',
    description: 'Elegant design for AI wisdom quotes',
    tier: 'TIER1',
    aspectRatio: 9 / 16,
  },
  {
    id: 'trading_signal',
    name: 'Trading Signal',
    description: 'Professional trading analysis card',
    tier: 'TIER2',
    aspectRatio: 9 / 16,
  },
];

class ExportService {
  /**
   * Request permissions for saving to gallery
   * @returns {Promise<boolean>}
   */
  async requestPermissions() {
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();

      if (status !== 'granted') {
        console.log('[ExportService] Gallery permission denied');
        return false;
      }

      return true;
    } catch (error) {
      console.error('[ExportService] Error requesting permissions:', error);
      return false;
    }
  }

  /**
   * Check if user can use template (tier-based)
   * @param {string} templateId
   * @param {string} userTier
   * @returns {boolean}
   */
  canUseTemplate(templateId, userTier) {
    const template = TEMPLATES.find((t) => t.id === templateId);
    if (!template) return false;

    const templateLevel = TierService.TIER_HIERARCHY[template.tier] || 0;
    const userLevel = TierService.TIER_HIERARCHY[TierService.normalizeTier(userTier)] || 0;

    return userLevel >= templateLevel;
  }

  /**
   * Check if user should have watermark
   * @param {string} userTier
   * @returns {boolean}
   */
  shouldHaveWatermark(userTier) {
    const normalizedTier = TierService.normalizeTier(userTier);
    return normalizedTier === 'FREE';
  }

  /**
   * Get available templates for user's tier
   * @param {string} userTier
   * @returns {Array}
   */
  getAvailableTemplates(userTier) {
    const userLevel = TierService.TIER_HIERARCHY[TierService.normalizeTier(userTier)] || 0;

    return TEMPLATES.map((template) => {
      const templateLevel = TierService.TIER_HIERARCHY[template.tier] || 0;
      return {
        ...template,
        isLocked: userLevel < templateLevel,
      };
    });
  }

  /**
   * Capture component as image
   * @param {React.RefObject} componentRef
   * @param {Object} options
   * @returns {Promise<string>} - URI of captured image
   */
  async captureComponent(componentRef, options = {}) {
    try {
      const uri = await captureRef(componentRef, {
        format: 'png',
        quality: 1.0,
        width: options.width || 1080,
        height: options.height || 1920,
        result: 'tmpfile',
      });

      console.log('[ExportService] Captured image:', uri);
      return uri;
    } catch (error) {
      console.error('[ExportService] Error capturing component:', error);
      throw error;
    }
  }

  /**
   * Save image to gallery
   * @param {string} imageUri
   * @returns {Promise<Object>} - MediaLibrary asset
   */
  async saveToGallery(imageUri) {
    try {
      // Request permissions
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        throw new Error('Gallery permission denied');
      }

      // Save to gallery
      const asset = await MediaLibrary.createAssetAsync(imageUri);

      // Try to add to Gemral album
      try {
        const album = await MediaLibrary.getAlbumAsync('Gemral');

        if (album) {
          await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
        } else {
          await MediaLibrary.createAlbumAsync('Gemral', asset, false);
        }
      } catch (albumError) {
        // Album creation might fail on some devices, but save still works
        console.log('[ExportService] Album creation skipped:', albumError);
      }

      console.log('[ExportService] Saved to gallery:', asset.uri);
      return asset;
    } catch (error) {
      console.error('[ExportService] Error saving to gallery:', error);
      throw error;
    }
  }

  /**
   * Share image
   * @param {string} imageUri
   * @param {Object} options
   * @returns {Promise<void>}
   */
  async shareImage(imageUri, options = {}) {
    try {
      const isAvailable = await Sharing.isAvailableAsync();

      if (!isAvailable) {
        throw new Error('Sharing not available on this device');
      }

      await Sharing.shareAsync(imageUri, {
        mimeType: 'image/png',
        dialogTitle: options.dialogTitle || 'Share GEM Reading',
        UTI: 'public.png',
      });

      console.log('[ExportService] Shared image successfully');
    } catch (error) {
      console.error('[ExportService] Error sharing image:', error);
      throw error;
    }
  }

  /**
   * Clean up temporary files
   * @param {string} imageUri
   */
  async cleanupTempFile(imageUri) {
    try {
      if (imageUri && imageUri.startsWith(FileSystem.cacheDirectory)) {
        await FileSystem.deleteAsync(imageUri, { idempotent: true });
        console.log('[ExportService] Cleaned up temp file');
      }
    } catch (error) {
      console.log('[ExportService] Cleanup error (non-fatal):', error);
    }
  }

  /**
   * Get template by ID
   * @param {string} templateId
   * @returns {Object|null}
   */
  getTemplate(templateId) {
    return TEMPLATES.find((t) => t.id === templateId) || null;
  }

  /**
   * Extract title from message content
   * @param {string} content
   * @returns {string}
   */
  extractTitle(content) {
    if (!content) return 'GEM Reading';

    // Try to extract first line or heading
    const lines = content.split('\n').filter((l) => l.trim());
    if (lines.length > 0) {
      // Remove markdown symbols
      return lines[0].replace(/[#*_]/g, '').trim().substring(0, 60);
    }

    return 'GEM Reading';
  }

  /**
   * Extract key message (quoted text)
   * @param {string} content
   * @returns {string|null}
   */
  extractKeyMessage(content) {
    if (!content) return null;

    // Try to find quoted text
    const quoteMatch = content.match(/"([^"]+)"/);
    if (quoteMatch) {
      return quoteMatch[1].substring(0, 150);
    }

    // Try to find emphasized text
    const emphasisMatch = content.match(/\*\*([^*]+)\*\*/);
    if (emphasisMatch) {
      return emphasisMatch[1].substring(0, 150);
    }

    return null;
  }

  /**
   * Truncate text with ellipsis
   * @param {string} text
   * @param {number} maxLength
   * @returns {string}
   */
  truncateText(text, maxLength = 300) {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
  }
}

export default new ExportService();
