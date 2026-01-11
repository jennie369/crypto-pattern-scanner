/**
 * Facebook Live Service
 * Phase 3: Multi-Platform Integration
 *
 * Features:
 * - Create Facebook Live video
 * - Get RTMP stream URL
 * - Poll comments from Graph API
 * - Get viewer count
 * - End live video
 *
 * Note: Requires Facebook Page Access Token with permissions:
 * - pages_show_list
 * - pages_read_engagement
 * - pages_manage_posts
 * - publish_video
 */

// Environment variables - use process.env for Expo
const EXPO_PUBLIC_FACEBOOK_PAGE_ACCESS_TOKEN = process.env.EXPO_PUBLIC_FACEBOOK_PAGE_ACCESS_TOKEN || '';
const EXPO_PUBLIC_FACEBOOK_PAGE_ID = process.env.EXPO_PUBLIC_FACEBOOK_PAGE_ID || '';
const EXPO_PUBLIC_FACEBOOK_STREAM_KEY = process.env.EXPO_PUBLIC_FACEBOOK_STREAM_KEY || '';
const EXPO_PUBLIC_RESTREAM_KEY = process.env.EXPO_PUBLIC_RESTREAM_KEY || '';

const GRAPH_API_VERSION = 'v18.0';
const GRAPH_API_BASE = `https://graph.facebook.com/${GRAPH_API_VERSION}`;

// Event types
export const FACEBOOK_EVENTS = {
  CONNECTED: 'connected',
  DISCONNECTED: 'disconnected',
  COMMENT: 'comment',
  REACTION: 'reaction',
  VIEWER_COUNT: 'viewerCount',
  STREAM_STATUS: 'streamStatus',
  ERROR: 'error',
};

class FacebookService {
  constructor() {
    this.accessToken = EXPO_PUBLIC_FACEBOOK_PAGE_ACCESS_TOKEN || '';
    this.pageId = EXPO_PUBLIC_FACEBOOK_PAGE_ID || '';
    this.liveVideoId = null;
    this.streamUrl = null;
    this.pollingInterval = null;
    this.viewerPollingInterval = null;
    this.lastCommentTime = null;
    this.processedCommentIds = new Set();
    this.listeners = new Map();
    this.isConnected = false;
    this.stats = {
      comments: 0,
      reactions: 0,
      shares: 0,
      peakViewers: 0,
    };
  }

  /**
   * Get RTMP config for streaming
   */
  getRtmpConfig() {
    return {
      server: 'rtmps://live-api-s.facebook.com:443/rtmp/',
      streamKey: EXPO_PUBLIC_FACEBOOK_STREAM_KEY || '',
      // Use Restream for multi-platform
      restreamUrl: `rtmp://live.restream.io/live/${EXPO_PUBLIC_RESTREAM_KEY || ''}`,
      settings: {
        videoBitrate: 4500,
        audioBitrate: 128,
        fps: 30,
        resolution: '1280x720',
        keyframeInterval: 2,
      },
    };
  }

  /**
   * Create a new Facebook Live video
   * @param {string} title - Live video title
   * @param {string} description - Live video description
   */
  async createLiveVideo(title, description = '') {
    try {
      const response = await fetch(
        `${GRAPH_API_BASE}/${this.pageId}/live_videos`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            access_token: this.accessToken,
            title,
            description,
            status: 'LIVE_NOW',
          }),
        }
      );

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error.message);
      }

      this.liveVideoId = data.id;
      this.streamUrl = data.stream_url || data.secure_stream_url;
      this.isConnected = true;

      this._emit(FACEBOOK_EVENTS.CONNECTED, {
        platform: 'facebook',
        liveVideoId: data.id,
        streamUrl: this.streamUrl,
      });

      return {
        liveVideoId: data.id,
        streamUrl: data.stream_url,
        secureStreamUrl: data.secure_stream_url,
        dashPreviewUrl: data.dash_preview_url,
      };
    } catch (error) {
      console.error('[Facebook] Create live video failed:', error);
      this._emit(FACEBOOK_EVENTS.ERROR, { error });
      throw error;
    }
  }

  /**
   * Connect to existing live video for comments
   * @param {string} liveVideoId - Existing live video ID
   * @param {Object} options - Polling options
   */
  async connectToLive(liveVideoId, options = {}) {
    const { commentPollingMs = 2000, viewerPollingMs = 5000 } = options;

    try {
      this.liveVideoId = liveVideoId;
      this.lastCommentTime = new Date().toISOString();
      this.processedCommentIds.clear();

      // Start polling comments
      this._fetchComments();
      this.pollingInterval = setInterval(
        () => this._fetchComments(),
        commentPollingMs
      );

      // Start polling viewer count
      this._fetchViewerCount();
      this.viewerPollingInterval = setInterval(
        () => this._fetchViewerCount(),
        viewerPollingMs
      );

      this.isConnected = true;

      this._emit(FACEBOOK_EVENTS.CONNECTED, {
        platform: 'facebook',
        liveVideoId,
      });

      return { success: true, liveVideoId };
    } catch (error) {
      console.error('[Facebook] Connect to live failed:', error);
      this._emit(FACEBOOK_EVENTS.ERROR, { error });
      throw error;
    }
  }

  /**
   * Fetch comments from Graph API
   */
  async _fetchComments() {
    if (!this.liveVideoId) return;

    try {
      const params = new URLSearchParams({
        access_token: this.accessToken,
        fields: 'id,message,from{id,name,picture},created_time,like_count,comment_count',
        order: 'chronological',
        filter: 'stream',
        limit: '50',
      });

      // Add since parameter if we have a last comment time
      if (this.lastCommentTime) {
        params.append('since', this.lastCommentTime);
      }

      const response = await fetch(
        `${GRAPH_API_BASE}/${this.liveVideoId}/comments?${params}`
      );
      const data = await response.json();

      if (data.error) {
        throw new Error(data.error.message);
      }

      if (data.data && data.data.length > 0) {
        // Update last comment time
        const lastComment = data.data[data.data.length - 1];
        this.lastCommentTime = lastComment.created_time;

        // Process new comments
        for (const fbComment of data.data) {
          // Skip already processed comments
          if (this.processedCommentIds.has(fbComment.id)) continue;

          this.processedCommentIds.add(fbComment.id);
          const comment = this._transformComment(fbComment);
          this.stats.comments++;

          this._emit(FACEBOOK_EVENTS.COMMENT, comment);
        }

        // Limit processed IDs set size
        if (this.processedCommentIds.size > 1000) {
          const idsArray = Array.from(this.processedCommentIds);
          this.processedCommentIds = new Set(idsArray.slice(-500));
        }
      }
    } catch (error) {
      console.error('[Facebook] Fetch comments error:', error);
    }
  }

  /**
   * Fetch viewer count
   */
  async _fetchViewerCount() {
    if (!this.liveVideoId) return;

    try {
      const params = new URLSearchParams({
        access_token: this.accessToken,
        fields: 'live_views,reactions.summary(true)',
      });

      const response = await fetch(
        `${GRAPH_API_BASE}/${this.liveVideoId}?${params}`
      );
      const data = await response.json();

      if (data.error) return;

      const viewerCount = data.live_views || 0;

      // Track peak viewers
      if (viewerCount > this.stats.peakViewers) {
        this.stats.peakViewers = viewerCount;
      }

      this._emit(FACEBOOK_EVENTS.VIEWER_COUNT, {
        platform: 'facebook',
        count: viewerCount,
        peakViewers: this.stats.peakViewers,
        reactions: data.reactions?.summary?.total_count || 0,
        timestamp: Date.now(),
      });
    } catch (error) {
      console.error('[Facebook] Fetch viewer count error:', error);
    }
  }

  /**
   * Transform Facebook comment to unified format
   */
  _transformComment(fbComment) {
    const from = fbComment.from || {};

    return {
      id: `facebook_${fbComment.id}`,
      platform: 'facebook',
      userId: from.id || 'unknown',
      username: from.name || 'Anonymous',
      displayName: from.name || 'Anonymous',
      avatar: from.id
        ? `https://graph.facebook.com/${from.id}/picture?type=square&access_token=${this.accessToken}`
        : null,
      message: fbComment.message,
      timestamp: new Date(fbComment.created_time).getTime(),
      likeCount: fbComment.like_count || 0,
      replyCount: fbComment.comment_count || 0,
      badges: this._extractBadges(fbComment),
      metadata: {
        commentId: fbComment.id,
      },
      raw: fbComment,
    };
  }

  /**
   * Extract badges from comment data
   */
  _extractBadges(fbComment) {
    const badges = [];

    // Facebook doesn't provide role info in comment API
    // Badges can be added based on custom logic

    if (fbComment.like_count >= 10) {
      badges.push({ type: 'popular', name: 'Popular', icon: 'fire' });
    }

    return badges;
  }

  /**
   * Get live video status
   */
  async getLiveStatus() {
    if (!this.liveVideoId) return null;

    try {
      const params = new URLSearchParams({
        access_token: this.accessToken,
        fields: 'status,live_views,broadcast_start_time,permalink_url',
      });

      const response = await fetch(
        `${GRAPH_API_BASE}/${this.liveVideoId}?${params}`
      );
      const data = await response.json();

      if (data.error) throw new Error(data.error.message);

      this._emit(FACEBOOK_EVENTS.STREAM_STATUS, {
        platform: 'facebook',
        status: data.status,
        viewerCount: data.live_views,
        startTime: data.broadcast_start_time,
        permalink: data.permalink_url,
      });

      return data;
    } catch (error) {
      console.error('[Facebook] Get live status error:', error);
      return null;
    }
  }

  /**
   * End live video
   */
  async endLiveVideo() {
    if (!this.liveVideoId) return;

    try {
      await fetch(`${GRAPH_API_BASE}/${this.liveVideoId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          access_token: this.accessToken,
          end_live_video: true,
        }),
      });

      this.disconnect();

      return { success: true };
    } catch (error) {
      console.error('[Facebook] End live error:', error);
      throw error;
    }
  }

  /**
   * Stop polling without ending the live
   */
  disconnect() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }

    if (this.viewerPollingInterval) {
      clearInterval(this.viewerPollingInterval);
      this.viewerPollingInterval = null;
    }

    this.isConnected = false;
    this.liveVideoId = null;
    this.lastCommentTime = null;
    this.processedCommentIds.clear();

    this._emit(FACEBOOK_EVENTS.DISCONNECTED, { platform: 'facebook' });
  }

  /**
   * Subscribe to events
   */
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);

    return () => {
      this.listeners.get(event)?.delete(callback);
    };
  }

  /**
   * Emit event to listeners
   */
  _emit(event, data) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach((cb) => {
        try {
          cb(data);
        } catch (error) {
          console.error(`[Facebook] Event handler error for ${event}:`, error);
        }
      });
    }
  }

  /**
   * Get connection status
   */
  getStatus() {
    return {
      platform: 'facebook',
      connected: this.isConnected,
      liveVideoId: this.liveVideoId,
      polling: !!this.pollingInterval,
      stats: { ...this.stats },
    };
  }

  /**
   * Reset stats
   */
  resetStats() {
    this.stats = {
      comments: 0,
      reactions: 0,
      shares: 0,
      peakViewers: 0,
    };
  }

  /**
   * Update access token (for token refresh)
   */
  setAccessToken(token) {
    this.accessToken = token;
  }

  /**
   * Update page ID
   */
  setPageId(pageId) {
    this.pageId = pageId;
  }
}

// Singleton instance
export const facebookService = new FacebookService();
export default facebookService;
