/**
 * Gemral - Draft Service
 * Feature #15: Auto-save drafts locally
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const DRAFTS_KEY = '@gem_post_drafts';
const AUTO_SAVE_INTERVAL = 30000; // 30 seconds

export const draftService = {
  /**
   * Save a draft
   * @param {object} draft - Draft data { title, content, topic, images, poll }
   * @param {string} draftId - Optional draft ID for editing existing draft
   */
  async saveDraft(draft, draftId = null) {
    try {
      const drafts = await this.getAllDrafts();
      const id = draftId || `draft_${Date.now()}`;

      const draftData = {
        id,
        ...draft,
        updatedAt: new Date().toISOString(),
        createdAt: drafts.find(d => d.id === id)?.createdAt || new Date().toISOString(),
      };

      // Update or add draft
      const existingIndex = drafts.findIndex(d => d.id === id);
      if (existingIndex >= 0) {
        drafts[existingIndex] = draftData;
      } else {
        drafts.unshift(draftData);
      }

      // Keep only last 10 drafts
      const trimmedDrafts = drafts.slice(0, 10);
      await AsyncStorage.setItem(DRAFTS_KEY, JSON.stringify(trimmedDrafts));

      console.log('[DraftService] Draft saved:', id);
      return { success: true, draftId: id };
    } catch (error) {
      console.error('[DraftService] Save error:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Get all drafts
   */
  async getAllDrafts() {
    try {
      const stored = await AsyncStorage.getItem(DRAFTS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('[DraftService] Get all error:', error);
      return [];
    }
  },

  /**
   * Get a specific draft by ID
   * @param {string} draftId - Draft ID
   */
  async getDraft(draftId) {
    try {
      const drafts = await this.getAllDrafts();
      return drafts.find(d => d.id === draftId) || null;
    } catch (error) {
      console.error('[DraftService] Get draft error:', error);
      return null;
    }
  },

  /**
   * Get the most recent draft
   */
  async getLatestDraft() {
    try {
      const drafts = await this.getAllDrafts();
      return drafts[0] || null;
    } catch (error) {
      console.error('[DraftService] Get latest error:', error);
      return null;
    }
  },

  /**
   * Delete a draft
   * @param {string} draftId - Draft ID to delete
   */
  async deleteDraft(draftId) {
    try {
      const drafts = await this.getAllDrafts();
      const filtered = drafts.filter(d => d.id !== draftId);
      await AsyncStorage.setItem(DRAFTS_KEY, JSON.stringify(filtered));

      console.log('[DraftService] Draft deleted:', draftId);
      return { success: true };
    } catch (error) {
      console.error('[DraftService] Delete error:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Clear all drafts
   */
  async clearAllDrafts() {
    try {
      await AsyncStorage.removeItem(DRAFTS_KEY);
      console.log('[DraftService] All drafts cleared');
      return { success: true };
    } catch (error) {
      console.error('[DraftService] Clear all error:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Get drafts count
   */
  async getDraftsCount() {
    try {
      const drafts = await this.getAllDrafts();
      return drafts.length;
    } catch (error) {
      return 0;
    }
  },

  /**
   * Check if there are any drafts
   */
  async hasDrafts() {
    const count = await this.getDraftsCount();
    return count > 0;
  },

  /**
   * Auto-save interval constant
   */
  AUTO_SAVE_INTERVAL,
};

export default draftService;
