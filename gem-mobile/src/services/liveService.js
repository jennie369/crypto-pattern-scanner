/**
 * Gemral - Live Streaming Service
 * Feature #22: Live video streaming functionality
 */

import { supabase } from './supabase';

export const liveService = {
  /**
   * Start a live stream
   * @param {object} streamData - Stream info { title, description, topic }
   */
  async startStream(streamData) {
    try {
      const { data: { session } } = await supabase.auth.getSession(); const user = session?.user;
      if (!user) return { success: false, error: 'Chua dang nhap' };

      // Generate stream key
      const streamKey = this.generateStreamKey();

      const { data, error } = await supabase
        .from('live_streams')
        .insert({
          user_id: user.id,
          title: streamData.title,
          description: streamData.description || null,
          topic: streamData.topic || null,
          stream_key: streamKey,
          status: 'live',
          started_at: new Date().toISOString(),
          viewers_count: 0,
          peak_viewers: 0,
        })
        .select()
        .single();

      if (error) throw error;

      console.log('[LiveService] Stream started:', data.id);
      return { success: true, data };
    } catch (error) {
      console.error('[LiveService] Start stream error:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * End a live stream
   * @param {string} streamId - Stream ID
   */
  async endStream(streamId) {
    try {
      const { data: { session } } = await supabase.auth.getSession(); const user = session?.user;
      if (!user) return { success: false, error: 'Chua dang nhap' };

      const { data, error } = await supabase
        .from('live_streams')
        .update({
          status: 'ended',
          ended_at: new Date().toISOString(),
        })
        .eq('id', streamId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      console.log('[LiveService] Stream ended:', streamId);
      return { success: true, data };
    } catch (error) {
      console.error('[LiveService] End stream error:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Get active live streams
   */
  async getActiveStreams() {
    try {
      const { data, error } = await supabase
        .from('live_streams')
        .select(`
          id,
          title,
          description,
          topic,
          viewers_count,
          started_at,
          thumbnail_url,
          user:user_id (
            id,
            full_name,
            avatar_url
          )
        `)
        .eq('status', 'live')
        .order('viewers_count', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('[LiveService] Get active streams error:', error);
      return [];
    }
  },

  /**
   * Get streams from followed users
   */
  async getFollowingStreams() {
    try {
      const { data: { session } } = await supabase.auth.getSession(); const user = session?.user;
      if (!user) return [];

      // 'follows' table does not exist — return empty (no follow system yet)
      const followingIds = [];

      if (followingIds.length === 0) return [];

      const { data, error } = await supabase
        .from('live_streams')
        .select(`
          id,
          title,
          description,
          topic,
          viewers_count,
          started_at,
          thumbnail_url,
          user:user_id (
            id,
            full_name,
            avatar_url
          )
        `)
        .eq('status', 'live')
        .in('user_id', followingIds)
        .order('started_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('[LiveService] Get following streams error:', error);
      return [];
    }
  },

  /**
   * Get stream details
   * @param {string} streamId - Stream ID
   */
  async getStreamDetails(streamId) {
    try {
      const { data, error } = await supabase
        .from('live_streams')
        .select(`
          id,
          title,
          description,
          topic,
          status,
          stream_key,
          viewers_count,
          peak_viewers,
          started_at,
          ended_at,
          thumbnail_url,
          user:user_id (
            id,
            full_name,
            avatar_url
          )
        `)
        .eq('id', streamId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('[LiveService] Get stream details error:', error);
      return null;
    }
  },

  /**
   * Join a live stream as viewer
   * @param {string} streamId - Stream ID
   */
  async joinStream(streamId) {
    try {
      const { data: { session } } = await supabase.auth.getSession(); const user = session?.user;
      if (!user) return { success: false };

      // Add viewer record
      await supabase
        .from('stream_viewers')
        .upsert({
          stream_id: streamId,
          user_id: user.id,
          joined_at: new Date().toISOString(),
        }, { onConflict: 'stream_id,user_id' });

      // Increment viewer count
      await supabase.rpc('increment_stream_viewers', { stream_id: streamId });

      return { success: true };
    } catch (error) {
      console.error('[LiveService] Join stream error:', error);
      return { success: false };
    }
  },

  /**
   * Leave a live stream
   * @param {string} streamId - Stream ID
   */
  async leaveStream(streamId) {
    try {
      const { data: { session } } = await supabase.auth.getSession(); const user = session?.user;
      if (!user) return { success: false };

      // Remove viewer record
      await supabase
        .from('stream_viewers')
        .delete()
        .eq('stream_id', streamId)
        .eq('user_id', user.id);

      // Decrement viewer count
      await supabase.rpc('decrement_stream_viewers', { stream_id: streamId });

      return { success: true };
    } catch (error) {
      console.error('[LiveService] Leave stream error:', error);
      return { success: false };
    }
  },

  /**
   * Send chat message in stream
   * @param {string} streamId - Stream ID
   * @param {string} message - Chat message
   */
  async sendChatMessage(streamId, message) {
    try {
      const { data: { session } } = await supabase.auth.getSession(); const user = session?.user;
      if (!user) return { success: false, error: 'Chua dang nhap' };

      const { data, error } = await supabase
        .from('stream_chat')
        .insert({
          stream_id: streamId,
          user_id: user.id,
          message,
          created_at: new Date().toISOString(),
        })
        .select(`
          id,
          message,
          created_at,
          user:user_id (
            id,
            full_name,
            avatar_url
          )
        `)
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('[LiveService] Send chat error:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Subscribe to stream chat
   * @param {string} streamId - Stream ID
   * @param {function} callback - Message handler
   */
  subscribeToChatMessages(streamId, callback) {
    return supabase
      .channel(`stream_chat:${streamId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'stream_chat',
          filter: `stream_id=eq.${streamId}`,
        },
        (payload) => {
          callback(payload.new);
        }
      )
      .subscribe();
  },

  /**
   * Subscribe to viewer count updates
   * @param {string} streamId - Stream ID
   * @param {function} callback - Count handler
   */
  subscribeToViewerCount(streamId, callback) {
    return supabase
      .channel(`stream_viewers:${streamId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'live_streams',
          filter: `id=eq.${streamId}`,
        },
        (payload) => {
          callback(payload.new.viewers_count);
        }
      )
      .subscribe();
  },

  /**
   * Send a gift/donation to streamer
   * @param {string} streamId - Stream ID
   * @param {object} giftData - Gift info { type, amount, message }
   */
  async sendGift(streamId, giftData) {
    try {
      const { data: { session } } = await supabase.auth.getSession(); const user = session?.user;
      if (!user) return { success: false, error: 'Chua dang nhap' };

      const { data, error } = await supabase
        .from('stream_gifts')
        .insert({
          stream_id: streamId,
          sender_id: user.id,
          gift_type: giftData.type,
          amount: giftData.amount,
          message: giftData.message || null,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('[LiveService] Send gift error:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Get stream duration
   * @param {string} startedAt - ISO date string
   */
  getStreamDuration(startedAt) {
    const start = new Date(startedAt);
    const now = new Date();
    const diff = now - start;

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  },

  /**
   * Generate unique stream key
   */
  generateStreamKey() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let key = '';
    for (let i = 0; i < 24; i++) {
      key += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return key;
  },

  /**
   * Format viewer count
   * @param {number} count - Viewer count
   */
  formatViewerCount(count) {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    }
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  },
};

export default liveService;
