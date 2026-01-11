/**
 * Gemral - Sound Service
 * Feature #4-6: Sound Library (Browse, Upload, Trending)
 * Handles audio/music for posts
 */

import { supabase } from './supabase';
import * as FileSystem from 'expo-file-system/legacy';
import { decode } from 'base64-arraybuffer';

export const soundService = {
  /**
   * Get trending sounds (based on use count and recency)
   * @param {number} limit - Max results
   * @returns {Promise<array>}
   */
  async getTrendingSounds(limit = 20) {
    try {
      const { data, error } = await supabase
        .from('sound_library')
        .select(`
          id,
          title,
          artist_name,
          audio_url,
          cover_image,
          duration,
          use_count,
          play_count,
          is_original,
          created_at,
          uploader_id
        `)
        .eq('is_active', true)
        .order('trending_score', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('[Sound] Get trending error:', error);
      return [];
    }
  },

  /**
   * Search sounds by title or artist
   * @param {string} query - Search query
   * @param {number} limit - Max results
   * @returns {Promise<array>}
   */
  async searchSounds(query, limit = 30) {
    try {
      const { data, error } = await supabase
        .from('sound_library')
        .select(`
          id,
          title,
          artist_name,
          audio_url,
          cover_image,
          duration,
          use_count,
          is_original,
          uploader_id
        `)
        .eq('is_active', true)
        .or(`title.ilike.%${query}%,artist_name.ilike.%${query}%`)
        .order('use_count', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('[Sound] Search error:', error);
      return [];
    }
  },

  /**
   * Get sounds by category
   * @param {string} category - Category name
   * @param {number} limit - Max results
   * @returns {Promise<array>}
   */
  async getSoundsByCategory(category, limit = 30) {
    try {
      const { data, error } = await supabase
        .from('sound_library')
        .select(`
          id,
          title,
          artist_name,
          audio_url,
          cover_image,
          duration,
          use_count,
          is_original,
          uploader_id
        `)
        .eq('is_active', true)
        .eq('category', category)
        .order('use_count', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('[Sound] Get by category error:', error);
      return [];
    }
  },

  /**
   * Get user's saved sounds
   * @param {number} limit - Max results
   * @returns {Promise<array>}
   */
  async getSavedSounds(limit = 50) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('saved_sounds')
        .select(`
          id,
          created_at,
          sound:sound_id (
            id,
            title,
            artist_name,
            audio_url,
            cover_image,
            duration,
            use_count,
            is_original,
            uploader_id
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return (data || []).map(s => ({ ...s.sound, saved_at: s.created_at }));
    } catch (error) {
      console.error('[Sound] Get saved error:', error);
      return [];
    }
  },

  /**
   * Get user's uploaded sounds
   * @param {string} userId - User ID (optional, defaults to current user)
   * @param {number} limit - Max results
   * @returns {Promise<array>}
   */
  async getUserSounds(userId = null, limit = 50) {
    try {
      let targetUserId = userId;
      if (!targetUserId) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return [];
        targetUserId = user.id;
      }

      const { data, error } = await supabase
        .from('sound_library')
        .select(`
          id,
          title,
          artist_name,
          audio_url,
          cover_image,
          duration,
          use_count,
          play_count,
          is_original,
          created_at
        `)
        .eq('uploader_id', targetUserId)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('[Sound] Get user sounds error:', error);
      return [];
    }
  },

  /**
   * Upload a new sound
   * @param {object} params - Sound parameters
   * @param {string} params.title - Sound title
   * @param {string} params.artistName - Artist name
   * @param {string} params.audioUri - Local audio file URI
   * @param {string} params.coverUri - Optional cover image URI
   * @param {number} params.duration - Duration in seconds
   * @param {string} params.category - Category
   * @param {boolean} params.isOriginal - Is original content
   * @returns {Promise<object>}
   */
  async uploadSound({
    title,
    artistName,
    audioUri,
    coverUri,
    duration,
    category = 'other',
    isOriginal = false,
  }) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'Chua dang nhap' };
      }

      // Upload audio file using FileSystem (React Native compatible)
      const audioFileName = `${user.id}/${Date.now()}_audio.mp3`;

      // Read file as base64 and convert to ArrayBuffer
      const audioBase64 = await FileSystem.readAsStringAsync(audioUri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      const audioArrayBuffer = decode(audioBase64);

      const { data: audioData, error: audioError } = await supabase.storage
        .from('sounds')
        .upload(audioFileName, audioArrayBuffer, {
          contentType: 'audio/mpeg',
          upsert: false,
        });

      if (audioError) throw audioError;

      const { data: { publicUrl: audioUrl } } = supabase.storage
        .from('sounds')
        .getPublicUrl(audioFileName);

      // Upload cover image if provided
      let coverUrl = null;
      if (coverUri) {
        const coverFileName = `${user.id}/${Date.now()}_cover.jpg`;

        // Read cover image as base64
        const coverBase64 = await FileSystem.readAsStringAsync(coverUri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        const coverArrayBuffer = decode(coverBase64);

        const { error: coverError } = await supabase.storage
          .from('sounds')
          .upload(coverFileName, coverArrayBuffer, {
            contentType: 'image/jpeg',
            upsert: false,
          });

        if (!coverError) {
          const { data: { publicUrl } } = supabase.storage
            .from('sounds')
            .getPublicUrl(coverFileName);
          coverUrl = publicUrl;
        }
      }

      // Create sound record
      const { data, error } = await supabase
        .from('sound_library')
        .insert({
          title,
          artist_name: artistName || user.full_name,
          audio_url: audioUrl,
          cover_image: coverUrl,
          duration,
          category,
          is_original: isOriginal,
          uploader_id: user.id,
          is_active: true,
        })
        .select()
        .single();

      if (error) throw error;

      console.log('[Sound] Uploaded:', data.id);
      return { success: true, data };
    } catch (error) {
      console.error('[Sound] Upload error:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Save a sound to library
   * @param {string} soundId - Sound ID
   * @returns {Promise<object>}
   */
  async saveSound(soundId) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'Chua dang nhap' };
      }

      // Check if already saved
      const { data: existing } = await supabase
        .from('saved_sounds')
        .select('id')
        .eq('user_id', user.id)
        .eq('sound_id', soundId)
        .single();

      if (existing) {
        return { success: false, error: 'Da luu am thanh nay' };
      }

      const { data, error } = await supabase
        .from('saved_sounds')
        .insert({
          user_id: user.id,
          sound_id: soundId,
        })
        .select()
        .single();

      if (error) throw error;

      console.log('[Sound] Saved:', soundId);
      return { success: true, data };
    } catch (error) {
      console.error('[Sound] Save error:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Unsave a sound
   * @param {string} soundId - Sound ID
   * @returns {Promise<object>}
   */
  async unsaveSound(soundId) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'Chua dang nhap' };
      }

      const { error } = await supabase
        .from('saved_sounds')
        .delete()
        .eq('user_id', user.id)
        .eq('sound_id', soundId);

      if (error) throw error;

      console.log('[Sound] Unsaved:', soundId);
      return { success: true };
    } catch (error) {
      console.error('[Sound] Unsave error:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Check if sound is saved
   * @param {string} soundId - Sound ID
   * @returns {Promise<boolean>}
   */
  async isSoundSaved(soundId) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { data } = await supabase
        .from('saved_sounds')
        .select('id')
        .eq('user_id', user.id)
        .eq('sound_id', soundId)
        .single();

      return !!data;
    } catch (error) {
      return false;
    }
  },

  /**
   * Record a sound play (for analytics)
   * @param {string} soundId - Sound ID
   * @returns {Promise<void>}
   */
  async recordPlay(soundId) {
    try {
      await supabase.rpc('increment_sound_play_count', { p_sound_id: soundId });
    } catch (error) {
      console.error('[Sound] Record play error:', error);
    }
  },

  /**
   * Record sound use in post (for trending algorithm)
   * @param {string} soundId - Sound ID
   * @returns {Promise<void>}
   */
  async recordUse(soundId) {
    try {
      await supabase.rpc('increment_sound_use_count', { p_sound_id: soundId });
    } catch (error) {
      console.error('[Sound] Record use error:', error);
    }
  },

  /**
   * Get sound by ID
   * @param {string} soundId - Sound ID
   * @returns {Promise<object|null>}
   */
  async getSound(soundId) {
    try {
      const { data, error } = await supabase
        .from('sound_library')
        .select(`
          id,
          title,
          artist_name,
          audio_url,
          cover_image,
          duration,
          use_count,
          play_count,
          is_original,
          category,
          created_at,
          uploader_id
        `)
        .eq('id', soundId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('[Sound] Get sound error:', error);
      return null;
    }
  },

  /**
   * Get posts using a sound
   * @param {string} soundId - Sound ID
   * @param {number} limit - Max results
   * @returns {Promise<array>}
   */
  async getPostsWithSound(soundId, limit = 20) {
    try {
      const { data, error } = await supabase
        .from('forum_posts')
        .select(`
          id,
          content,
          images,
          created_at,
          author:user_id (
            id,
            full_name,
            avatar_url
          )
        `)
        .eq('sound_id', soundId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('[Sound] Get posts with sound error:', error);
      return [];
    }
  },

  /**
   * Delete user's uploaded sound
   * @param {string} soundId - Sound ID
   * @returns {Promise<object>}
   */
  async deleteSound(soundId) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'Chua dang nhap' };
      }

      // Verify ownership
      const { data: sound } = await supabase
        .from('sound_library')
        .select('uploader_id')
        .eq('id', soundId)
        .single();

      if (sound?.uploader_id !== user.id) {
        return { success: false, error: 'Khong co quyen xoa' };
      }

      // Soft delete
      const { error } = await supabase
        .from('sound_library')
        .update({ is_active: false })
        .eq('id', soundId);

      if (error) throw error;

      console.log('[Sound] Deleted:', soundId);
      return { success: true };
    } catch (error) {
      console.error('[Sound] Delete error:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Get available categories
   */
  getCategories() {
    return [
      { id: 'trending', label: 'Xu huong', icon: 'TrendingUp' },
      { id: 'pop', label: 'Pop', icon: 'Music' },
      { id: 'edm', label: 'EDM', icon: 'Zap' },
      { id: 'hiphop', label: 'Hip Hop', icon: 'Mic' },
      { id: 'chill', label: 'Chill', icon: 'Coffee' },
      { id: 'lofi', label: 'Lo-Fi', icon: 'Headphones' },
      { id: 'acoustic', label: 'Acoustic', icon: 'Guitar' },
      { id: 'viet', label: 'Nhac Viet', icon: 'Star' },
      { id: 'funny', label: 'Hai huoc', icon: 'Smile' },
      { id: 'meme', label: 'Meme', icon: 'MessageSquare' },
      { id: 'original', label: 'Original', icon: 'Sparkles' },
      { id: 'other', label: 'Khac', icon: 'MoreHorizontal' },
    ];
  },

  /**
   * Format duration for display
   * @param {number} seconds - Duration in seconds
   * @returns {string}
   */
  formatDuration(seconds) {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  },
};

export default soundService;
