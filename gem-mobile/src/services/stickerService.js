/**
 * GEM Mobile - Sticker Service
 * Manages sticker packs, stickers, and user preferences
 *
 * Tables: sticker_packs, stickers, user_recent_stickers, user_favorite_packs
 */

import { supabase } from './supabase';

class StickerService {
  constructor() {
    this.packsCache = null;
    this.packsCacheTime = null;
    this.CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  }

  // =====================================================
  // STICKER PACKS
  // =====================================================

  /**
   * Get all active sticker packs
   * @param {boolean} includeFeatured - Include featured packs first
   * @param {boolean} forceRefresh - Skip cache
   * @returns {Promise<Array>} List of sticker packs
   */
  async getPacks(includeFeatured = true, forceRefresh = false) {
    try {
      // Check cache
      if (!forceRefresh && this.packsCache && this.packsCacheTime) {
        const elapsed = Date.now() - this.packsCacheTime;
        if (elapsed < this.CACHE_DURATION) {
          return this.packsCache;
        }
      }

      let query = supabase
        .from('sticker_packs')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (includeFeatured) {
        query = query.order('is_featured', { ascending: false });
      }

      const { data, error } = await query;
      if (error) throw error;

      // Update cache
      this.packsCache = data || [];
      this.packsCacheTime = Date.now();

      return this.packsCache;
    } catch (error) {
      console.error('[StickerService] getPacks error:', error);
      return [];
    }
  }

  /**
   * Get a single sticker pack by ID
   * @param {string} packId - Pack ID
   * @returns {Promise<Object|null>}
   */
  async getPackById(packId) {
    try {
      const { data, error } = await supabase
        .from('sticker_packs')
        .select('*')
        .eq('id', packId)
        .eq('is_active', true)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('[StickerService] getPackById error:', error);
      return null;
    }
  }

  /**
   * Get featured sticker packs
   * @returns {Promise<Array>}
   */
  async getFeaturedPacks() {
    try {
      const { data, error } = await supabase
        .from('sticker_packs')
        .select('*')
        .eq('is_active', true)
        .eq('is_featured', true)
        .order('display_order', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('[StickerService] getFeaturedPacks error:', error);
      return [];
    }
  }

  // =====================================================
  // STICKERS
  // =====================================================

  /**
   * Get stickers for a specific pack
   * @param {string} packId - Pack ID
   * @returns {Promise<Array>} List of stickers
   */
  async getStickersForPack(packId) {
    try {
      if (!packId) return [];

      const { data, error } = await supabase
        .from('stickers')
        .select('*')
        .eq('pack_id', packId)
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('[StickerService] getStickersForPack error:', error);
      return [];
    }
  }

  /**
   * Get a single sticker by ID
   * @param {string} stickerId - Sticker ID
   * @returns {Promise<Object|null>}
   */
  async getStickerById(stickerId) {
    try {
      const { data, error } = await supabase
        .from('stickers')
        .select(`
          *,
          pack:sticker_packs(id, name, name_vi, thumbnail_url)
        `)
        .eq('id', stickerId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('[StickerService] getStickerById error:', error);
      return null;
    }
  }

  /**
   * Search stickers by keywords
   * @param {string} query - Search query
   * @param {number} limit - Max results
   * @returns {Promise<Array>} Matching stickers
   */
  async searchStickers(query, limit = 30) {
    try {
      if (!query || query.length < 2) return [];

      const searchTerm = query.toLowerCase().trim();

      const { data, error } = await supabase
        .from('stickers')
        .select(`
          *,
          pack:sticker_packs(id, name, name_vi, thumbnail_url)
        `)
        .eq('is_active', true)
        .or(`name.ilike.%${searchTerm}%,keywords.cs.{${searchTerm}}`)
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('[StickerService] searchStickers error:', error);
      return [];
    }
  }

  /**
   * Get popular stickers across all packs
   * @param {number} limit - Max results
   * @returns {Promise<Array>}
   */
  async getPopularStickers(limit = 20) {
    try {
      const { data, error } = await supabase
        .from('stickers')
        .select(`
          *,
          pack:sticker_packs(id, name, name_vi, thumbnail_url)
        `)
        .eq('is_active', true)
        .order('usage_count', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('[StickerService] getPopularStickers error:', error);
      return [];
    }
  }

  // =====================================================
  // USER RECENT & FAVORITES
  // =====================================================

  /**
   * Get user's recent stickers/emojis/gifs
   * @param {string} type - 'sticker' | 'gif' | 'emoji' | null (all)
   * @param {number} limit - Max items to return
   * @returns {Promise<Array>} Recent items
   */
  async getRecentItems(type = null, limit = 30) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      let query = supabase
        .from('user_recent_stickers')
        .select(`
          *,
          sticker:stickers(*)
        `)
        .eq('user_id', user.id)
        .order('used_at', { ascending: false })
        .limit(limit);

      if (type) {
        query = query.eq('type', type);
      }

      const { data, error } = await query;
      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('[StickerService] getRecentItems error:', error);
      return [];
    }
  }

  /**
   * Track sticker/emoji/gif usage
   * @param {Object} item - Item to track
   * @param {string} item.stickerId - Sticker ID (for stickers)
   * @param {string} item.giphyId - GIPHY ID (for GIFs)
   * @param {string} item.giphyUrl - GIPHY URL (for GIFs)
   * @param {string} item.emoji - Emoji character (for emojis)
   * @param {string} item.type - 'sticker' | 'gif' | 'emoji'
   */
  async trackUsage(item) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase.rpc('track_sticker_usage', {
        p_user_id: user.id,
        p_sticker_id: item.stickerId || null,
        p_giphy_id: item.giphyId || null,
        p_giphy_url: item.giphyUrl || null,
        p_emoji: item.emoji || null,
        p_type: item.type || 'sticker',
      });

      if (error) {
        console.error('[StickerService] trackUsage RPC error:', error);
      }
    } catch (error) {
      console.error('[StickerService] trackUsage error:', error);
    }
  }

  /**
   * Get user's favorite sticker packs
   * @returns {Promise<Array>} Favorite packs
   */
  async getFavoritePacks() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('user_favorite_packs')
        .select(`
          *,
          pack:sticker_packs(*)
        `)
        .eq('user_id', user.id)
        .order('added_at', { ascending: false });

      if (error) throw error;

      return (data || []).map(d => d.pack).filter(Boolean);
    } catch (error) {
      console.error('[StickerService] getFavoritePacks error:', error);
      return [];
    }
  }

  /**
   * Check if a pack is favorited
   * @param {string} packId - Pack ID
   * @returns {Promise<boolean>}
   */
  async isPackFavorited(packId) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { data, error } = await supabase
        .from('user_favorite_packs')
        .select('id')
        .eq('user_id', user.id)
        .eq('pack_id', packId)
        .maybeSingle();

      if (error) throw error;
      return !!data;
    } catch (error) {
      console.error('[StickerService] isPackFavorited error:', error);
      return false;
    }
  }

  /**
   * Toggle favorite pack
   * @param {string} packId - Pack ID
   * @returns {Promise<boolean>} True if added, false if removed
   */
  async toggleFavoritePack(packId) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Check if already favorited
      const { data: existing, error: checkError } = await supabase
        .from('user_favorite_packs')
        .select('id')
        .eq('user_id', user.id)
        .eq('pack_id', packId)
        .maybeSingle();

      if (checkError) throw checkError;

      if (existing) {
        // Remove favorite
        const { error: deleteError } = await supabase
          .from('user_favorite_packs')
          .delete()
          .eq('id', existing.id);

        if (deleteError) throw deleteError;
        return false;
      } else {
        // Add favorite
        const { error: insertError } = await supabase
          .from('user_favorite_packs')
          .insert({
            user_id: user.id,
            pack_id: packId,
          });

        if (insertError) throw insertError;
        return true;
      }
    } catch (error) {
      console.error('[StickerService] toggleFavoritePack error:', error);
      throw error;
    }
  }

  // =====================================================
  // ADMIN FUNCTIONS
  // =====================================================

  /**
   * Create a new sticker pack (Admin only)
   * @param {Object} packData - Pack data
   * @returns {Promise<Object>}
   */
  async createPack(packData) {
    try {
      const { data, error } = await supabase
        .from('sticker_packs')
        .insert({
          name: packData.name,
          name_vi: packData.nameVi || packData.name,
          description: packData.description || '',
          description_vi: packData.descriptionVi || packData.description || '',
          thumbnail_url: packData.thumbnailUrl,
          author: packData.author || 'GEM Team',
          category: packData.category || 'custom',
          is_animated: packData.isAnimated || false,
          is_featured: packData.isFeatured || false,
          display_order: packData.displayOrder || 0,
        })
        .select()
        .single();

      if (error) throw error;

      // Clear cache
      this.packsCache = null;

      return data;
    } catch (error) {
      console.error('[StickerService] createPack error:', error);
      throw error;
    }
  }

  /**
   * Update a sticker pack (Admin only)
   * @param {string} packId - Pack ID
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object>}
   */
  async updatePack(packId, updates) {
    try {
      const { data, error } = await supabase
        .from('sticker_packs')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', packId)
        .select()
        .single();

      if (error) throw error;

      // Clear cache
      this.packsCache = null;

      return data;
    } catch (error) {
      console.error('[StickerService] updatePack error:', error);
      throw error;
    }
  }

  /**
   * Delete a sticker pack (Admin only)
   * @param {string} packId - Pack ID
   */
  async deletePack(packId) {
    try {
      const { error } = await supabase
        .from('sticker_packs')
        .delete()
        .eq('id', packId);

      if (error) throw error;

      // Clear cache
      this.packsCache = null;
    } catch (error) {
      console.error('[StickerService] deletePack error:', error);
      throw error;
    }
  }

  /**
   * Upload sticker to a pack (Admin only)
   * @param {string} packId - Pack ID
   * @param {Object} file - File object with uri, name, type
   * @param {Object} metadata - Sticker metadata
   * @returns {Promise<Object>}
   */
  async uploadSticker(packId, file, metadata = {}) {
    try {
      // Determine file extension and format
      const fileExt = file.name?.split('.').pop()?.toLowerCase() || 'png';
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${packId}/${fileName}`;

      // Fetch file and convert to blob
      const response = await fetch(file.uri);
      const blob = await response.blob();

      // Upload to storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('stickers')
        .upload(filePath, blob, {
          contentType: file.type || 'image/png',
          cacheControl: '31536000', // 1 year cache
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('stickers')
        .getPublicUrl(uploadData.path);

      // Determine format
      const format = fileExt === 'json' ? 'lottie' : fileExt;

      // Create sticker record
      const stickerData = {
        pack_id: packId,
        name: metadata.name || null,
        keywords: metadata.keywords || [],
        format,
        width: metadata.width || 512,
        height: metadata.height || 512,
        display_order: metadata.displayOrder || 0,
      };

      // Set URL based on format
      if (format === 'lottie') {
        stickerData.lottie_url = publicUrl;
      } else if (format === 'gif') {
        stickerData.gif_url = publicUrl;
      } else {
        stickerData.image_url = publicUrl;
      }

      const { data, error } = await supabase
        .from('stickers')
        .insert(stickerData)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('[StickerService] uploadSticker error:', error);
      throw error;
    }
  }

  /**
   * Delete a sticker (Admin only)
   * @param {string} stickerId - Sticker ID
   */
  async deleteSticker(stickerId) {
    try {
      const { error } = await supabase
        .from('stickers')
        .delete()
        .eq('id', stickerId);

      if (error) throw error;
    } catch (error) {
      console.error('[StickerService] deleteSticker error:', error);
      throw error;
    }
  }

  // =====================================================
  // UTILITY
  // =====================================================

  /**
   * Clear all caches
   */
  clearCache() {
    this.packsCache = null;
    this.packsCacheTime = null;
  }
}

export default new StickerService();
