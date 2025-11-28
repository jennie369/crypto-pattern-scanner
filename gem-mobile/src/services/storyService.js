/**
 * Gemral - Story Service
 * Feature #21: Instagram-like stories
 */

import { supabase } from './supabase';

const STORY_DURATION = 24 * 60 * 60 * 1000; // 24 hours in ms

export const storyService = {
  /**
   * Create a new story
   * @param {object} storyData - Story content { mediaUrl, mediaType, caption, stickers }
   */
  async createStory(storyData) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { success: false, error: 'Chua dang nhap' };

      const expiresAt = new Date(Date.now() + STORY_DURATION);

      const { data, error } = await supabase
        .from('stories')
        .insert({
          user_id: user.id,
          media_url: storyData.mediaUrl,
          media_type: storyData.mediaType || 'image', // 'image' | 'video'
          caption: storyData.caption || null,
          stickers: storyData.stickers || [],
          background_color: storyData.backgroundColor || null,
          expires_at: expiresAt.toISOString(),
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      console.log('[StoryService] Story created:', data.id);
      return { success: true, data };
    } catch (error) {
      console.error('[StoryService] Create error:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Get active stories from followed users
   */
  async getFollowingStories() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const now = new Date().toISOString();

      // Get followed user IDs
      const { data: following } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', user.id);

      const followingIds = (following || []).map(f => f.following_id);
      followingIds.push(user.id); // Include own stories

      if (followingIds.length === 0) return [];

      // Get active stories
      const { data, error } = await supabase
        .from('stories')
        .select(`
          id,
          media_url,
          media_type,
          caption,
          stickers,
          background_color,
          created_at,
          expires_at,
          views_count,
          user:user_id (
            id,
            full_name,
            avatar_url
          )
        `)
        .in('user_id', followingIds)
        .gt('expires_at', now)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Group by user
      const groupedStories = {};
      (data || []).forEach(story => {
        const userId = story.user.id;
        if (!groupedStories[userId]) {
          groupedStories[userId] = {
            user: story.user,
            stories: [],
            hasUnviewed: false,
            latestAt: story.created_at,
          };
        }
        groupedStories[userId].stories.push(story);
      });

      // Check viewed status
      const storyIds = (data || []).map(s => s.id);
      if (storyIds.length > 0) {
        const { data: views } = await supabase
          .from('story_views')
          .select('story_id')
          .eq('viewer_id', user.id)
          .in('story_id', storyIds);

        const viewedIds = new Set((views || []).map(v => v.story_id));

        Object.values(groupedStories).forEach(group => {
          group.hasUnviewed = group.stories.some(s => !viewedIds.has(s.id));
          group.stories.forEach(s => {
            s.viewed = viewedIds.has(s.id);
          });
        });
      }

      // Sort by unviewed first, then by latest
      return Object.values(groupedStories).sort((a, b) => {
        if (a.hasUnviewed && !b.hasUnviewed) return -1;
        if (!a.hasUnviewed && b.hasUnviewed) return 1;
        return new Date(b.latestAt) - new Date(a.latestAt);
      });
    } catch (error) {
      console.error('[StoryService] Get following stories error:', error);
      return [];
    }
  },

  /**
   * Get user's own stories
   */
  async getMyStories() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const now = new Date().toISOString();

      const { data, error } = await supabase
        .from('stories')
        .select('*')
        .eq('user_id', user.id)
        .gt('expires_at', now)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('[StoryService] Get my stories error:', error);
      return [];
    }
  },

  /**
   * Get stories for a specific user
   * @param {string} userId - User ID
   */
  async getUserStories(userId) {
    try {
      const now = new Date().toISOString();

      const { data, error } = await supabase
        .from('stories')
        .select(`
          id,
          media_url,
          media_type,
          caption,
          stickers,
          background_color,
          created_at,
          expires_at,
          views_count
        `)
        .eq('user_id', userId)
        .gt('expires_at', now)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('[StoryService] Get user stories error:', error);
      return [];
    }
  },

  /**
   * Mark story as viewed
   * @param {string} storyId - Story ID
   */
  async viewStory(storyId) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { success: false };

      // Record view
      await supabase
        .from('story_views')
        .upsert({
          story_id: storyId,
          viewer_id: user.id,
          viewed_at: new Date().toISOString(),
        }, { onConflict: 'story_id,viewer_id' });

      // Increment view count
      await supabase.rpc('increment_story_views', { story_id: storyId });

      return { success: true };
    } catch (error) {
      console.error('[StoryService] View story error:', error);
      return { success: false };
    }
  },

  /**
   * Get story viewers
   * @param {string} storyId - Story ID
   */
  async getStoryViewers(storyId) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('story_views')
        .select(`
          viewed_at,
          viewer:viewer_id (
            id,
            full_name,
            avatar_url
          )
        `)
        .eq('story_id', storyId)
        .order('viewed_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('[StoryService] Get viewers error:', error);
      return [];
    }
  },

  /**
   * Delete a story
   * @param {string} storyId - Story ID
   */
  async deleteStory(storyId) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { success: false, error: 'Chua dang nhap' };

      const { error } = await supabase
        .from('stories')
        .delete()
        .eq('id', storyId)
        .eq('user_id', user.id);

      if (error) throw error;

      console.log('[StoryService] Story deleted:', storyId);
      return { success: true };
    } catch (error) {
      console.error('[StoryService] Delete error:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * React to a story
   * @param {string} storyId - Story ID
   * @param {string} reaction - Reaction emoji or type
   */
  async reactToStory(storyId, reaction) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { success: false, error: 'Chua dang nhap' };

      const { data, error } = await supabase
        .from('story_reactions')
        .insert({
          story_id: storyId,
          user_id: user.id,
          reaction,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('[StoryService] React error:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Reply to a story
   * @param {string} storyId - Story ID
   * @param {string} message - Reply message
   */
  async replyToStory(storyId, message) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { success: false, error: 'Chua dang nhap' };

      const { data, error } = await supabase
        .from('story_replies')
        .insert({
          story_id: storyId,
          user_id: user.id,
          message,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('[StoryService] Reply error:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Get time remaining for story
   * @param {string} expiresAt - Expiration ISO date
   */
  getTimeRemaining(expiresAt) {
    const now = new Date();
    const expires = new Date(expiresAt);
    const diff = expires - now;

    if (diff <= 0) return 'Het han';

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) {
      return `${hours}h`;
    }
    return `${minutes}m`;
  },

  /**
   * Constants
   */
  STORY_DURATION,
};

export default storyService;
