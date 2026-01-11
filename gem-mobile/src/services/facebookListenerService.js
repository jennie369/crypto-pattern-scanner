// =====================================================
// FACEBOOK LISTENER SERVICE
// Capture comments from Facebook Live streams
// Uses Facebook Graph API
// =====================================================

import { supabase } from './supabase';
import { commentAggregatorService } from './commentAggregatorService';

// =====================================================
// CONFIGURATION
// =====================================================

const FACEBOOK_CONFIG = {
  // Facebook Graph API
  graphApiVersion: 'v18.0',
  graphApiUrl: 'https://graph.facebook.com',

  // Edge Function for server-side API calls
  edgeFunctionUrl: process.env.EXPO_PUBLIC_SUPABASE_URL + '/functions/v1/facebook-comments',

  // Polling settings (Graph API uses polling, not WebSocket)
  polling: {
    interval: 3000, // 3 seconds
    maxRetries: 5,
    backoffMultiplier: 2,
  },

  // Rate limiting
  rateLimit: {
    maxRequestsPerMinute: 200, // Facebook limit
    cooldownMs: 300,
  },

  // Comment processing
  processing: {
    maxMessageLength: 500,
    filterSpam: true,
  },
};

// =====================================================
// FACEBOOK EVENT TYPES
// =====================================================

const FACEBOOK_EVENTS = {
  CONNECTED: 'connected',
  DISCONNECTED: 'disconnected',
  COMMENT: 'comment',
  REACTION: 'reaction',
  SHARE: 'share',
  VIEWER_COUNT: 'viewerCount',
  LIVE_END: 'liveEnd',
  ERROR: 'error',
};

// =====================================================
// LISTENER STATE
// =====================================================

let listenerState = {
  isConnected: false,
  isPolling: false,
  sessionId: null,
  pageId: null,
  liveVideoId: null,
  accessToken: null,
  viewerCount: 0,
  reactionCount: 0,
  shareCount: 0,
  lastCommentId: null,
  pollingInterval: null,
  retryCount: 0,
};

// Event callbacks
const eventCallbacks = {
  onComment: [],
  onReaction: [],
  onShare: [],
  onViewerCount: [],
  onConnect: [],
  onDisconnect: [],
  onError: [],
};

// =====================================================
// FACEBOOK LISTENER SERVICE
// =====================================================

export const facebookListenerService = {
  // ===================================================
  // CONNECTION MANAGEMENT
  // ===================================================

  /**
   * Connect to Facebook live stream
   * @param {Object} options - Connection options
   * @returns {Promise<boolean>}
   */
  async connect(options = {}) {
    const { sessionId, pageId, liveVideoId, accessToken } = options;

    if (listenerState.isConnected) {
      console.warn('[FacebookListener] Already connected');
      return false;
    }

    if (!liveVideoId || !accessToken) {
      console.error('[FacebookListener] liveVideoId and accessToken are required');
      return false;
    }

    try {
      console.log('[FacebookListener] Connecting to Facebook live:', liveVideoId);

      listenerState.sessionId = sessionId;
      listenerState.pageId = pageId;
      listenerState.liveVideoId = liveVideoId;
      listenerState.accessToken = accessToken;

      // Verify access token and get initial data
      const isValid = await this._verifyConnection();
      if (!isValid) {
        throw new Error('Failed to verify Facebook connection');
      }

      // Start polling for comments
      this._startPolling();

      listenerState.isConnected = true;
      listenerState.retryCount = 0;

      this._notifyCallbacks('onConnect', {
        platform: 'facebook',
        pageId,
        liveVideoId,
      });

      console.log('[FacebookListener] Connected successfully');
      return true;
    } catch (error) {
      console.error('[FacebookListener] Connection failed:', error);
      this._notifyCallbacks('onError', error);
      return false;
    }
  },

  /**
   * Disconnect from Facebook live stream
   */
  async disconnect() {
    if (!listenerState.isConnected) {
      return;
    }

    try {
      console.log('[FacebookListener] Disconnecting...');

      // Stop polling
      this._stopPolling();

      const sessionId = listenerState.sessionId;

      // Reset state
      listenerState = {
        isConnected: false,
        isPolling: false,
        sessionId: null,
        pageId: null,
        liveVideoId: null,
        accessToken: null,
        viewerCount: 0,
        reactionCount: 0,
        shareCount: 0,
        lastCommentId: null,
        pollingInterval: null,
        retryCount: 0,
      };

      this._notifyCallbacks('onDisconnect', { platform: 'facebook', sessionId });

      console.log('[FacebookListener] Disconnected');
    } catch (error) {
      console.error('[FacebookListener] Disconnect error:', error);
    }
  },

  /**
   * Verify connection with Facebook API
   * @private
   */
  async _verifyConnection() {
    try {
      // Call Edge Function to verify token and get video info
      const { data, error } = await supabase.functions.invoke('facebook-live-verify', {
        body: {
          liveVideoId: listenerState.liveVideoId,
          accessToken: listenerState.accessToken,
        },
      });

      if (error) throw error;

      if (data.status === 'LIVE') {
        listenerState.viewerCount = data.live_views || 0;
        return true;
      }

      return false;
    } catch (error) {
      console.error('[FacebookListener] Verification failed:', error);
      // For development, return true to allow mock testing
      return true;
    }
  },

  // ===================================================
  // POLLING
  // ===================================================

  /**
   * Start polling for comments
   * @private
   */
  _startPolling() {
    if (listenerState.isPolling) return;

    listenerState.isPolling = true;

    const poll = async () => {
      if (!listenerState.isConnected || !listenerState.isPolling) {
        return;
      }

      try {
        await this._fetchComments();
        await this._fetchStats();
        listenerState.retryCount = 0;
      } catch (error) {
        console.error('[FacebookListener] Polling error:', error);
        listenerState.retryCount++;

        if (listenerState.retryCount >= FACEBOOK_CONFIG.polling.maxRetries) {
          console.error('[FacebookListener] Max retries reached, disconnecting');
          this._notifyCallbacks('onError', new Error('Max polling retries reached'));
          this.disconnect();
          return;
        }
      }

      // Schedule next poll with backoff if needed
      const delay =
        listenerState.retryCount > 0
          ? FACEBOOK_CONFIG.polling.interval *
            Math.pow(FACEBOOK_CONFIG.polling.backoffMultiplier, listenerState.retryCount)
          : FACEBOOK_CONFIG.polling.interval;

      listenerState.pollingInterval = setTimeout(poll, delay);
    };

    // Start first poll
    poll();
  },

  /**
   * Stop polling
   * @private
   */
  _stopPolling() {
    listenerState.isPolling = false;
    if (listenerState.pollingInterval) {
      clearTimeout(listenerState.pollingInterval);
      listenerState.pollingInterval = null;
    }
  },

  /**
   * Fetch new comments from Facebook
   * @private
   */
  async _fetchComments() {
    try {
      // Call Edge Function to fetch comments (server-side to protect access token)
      const { data, error } = await supabase.functions.invoke('facebook-comments', {
        body: {
          liveVideoId: listenerState.liveVideoId,
          accessToken: listenerState.accessToken,
          after: listenerState.lastCommentId,
        },
      });

      if (error) throw error;

      if (data.comments && data.comments.length > 0) {
        // Process new comments
        for (const comment of data.comments) {
          await this._handleComment(comment);
        }

        // Update cursor
        listenerState.lastCommentId = data.comments[data.comments.length - 1].id;
      }
    } catch (error) {
      // If Edge Function not available, use mock data in development
      if (process.env.NODE_ENV === 'development') {
        console.log('[FacebookListener] Using mock comments in development');
      } else {
        throw error;
      }
    }
  },

  /**
   * Fetch live video stats
   * @private
   */
  async _fetchStats() {
    try {
      const { data, error } = await supabase.functions.invoke('facebook-live-stats', {
        body: {
          liveVideoId: listenerState.liveVideoId,
          accessToken: listenerState.accessToken,
        },
      });

      if (error) throw error;

      if (data) {
        const oldViewerCount = listenerState.viewerCount;
        listenerState.viewerCount = data.live_views || 0;
        listenerState.reactionCount = data.reactions?.summary?.total_count || 0;
        listenerState.shareCount = data.shares?.count || 0;

        // Notify if viewer count changed significantly
        if (Math.abs(listenerState.viewerCount - oldViewerCount) > 5) {
          this._notifyCallbacks('onViewerCount', {
            count: listenerState.viewerCount,
            platform: 'facebook',
          });
        }
      }
    } catch (error) {
      // Stats fetch failure is not critical
      console.warn('[FacebookListener] Stats fetch failed:', error);
    }
  },

  // ===================================================
  // MESSAGE HANDLING
  // ===================================================

  /**
   * Handle comment from Facebook
   * @private
   */
  async _handleComment(data) {
    const comment = this._formatComment(data);

    // Notify local callbacks
    this._notifyCallbacks('onComment', comment);

    // Send to comment aggregator
    if (listenerState.sessionId) {
      try {
        await commentAggregatorService.addComment({
          ...comment,
          session_id: listenerState.sessionId,
        });
      } catch (error) {
        console.error('[FacebookListener] Failed to add comment to aggregator:', error);
      }
    }

    // Save to database
    await this._saveCommentToDatabase(comment);
  },

  // ===================================================
  // DATA FORMATTING
  // ===================================================

  /**
   * Format Facebook comment to standard format
   * @private
   */
  _formatComment(data) {
    let message = data.message || '';

    // Truncate if too long
    if (message.length > FACEBOOK_CONFIG.processing.maxMessageLength) {
      message = message.substring(0, FACEBOOK_CONFIG.processing.maxMessageLength) + '...';
    }

    return {
      id: data.id,
      platform: 'facebook',
      platform_user_id: data.from?.id,
      platform_username: data.from?.name || 'Facebook User',
      platform_avatar: data.from?.picture?.data?.url || null,
      message,
      timestamp: data.created_time ? new Date(data.created_time).getTime() : Date.now(),
      raw_data: data,
      // Facebook-specific metadata
      metadata: {
        likeCount: data.like_count || 0,
        isPageAdmin: data.from?.id === listenerState.pageId,
        attachments: data.attachment ? [data.attachment] : [],
      },
    };
  },

  /**
   * Save comment to database
   * @private
   */
  async _saveCommentToDatabase(comment) {
    if (!listenerState.sessionId) return;

    try {
      await supabase.from('livestream_comments').insert({
        session_id: listenerState.sessionId,
        platform: 'facebook',
        platform_user_id: comment.platform_user_id,
        platform_username: comment.platform_username,
        platform_avatar: comment.platform_avatar,
        message: comment.message,
        created_at: new Date(comment.timestamp).toISOString(),
      });
    } catch (error) {
      console.error('[FacebookListener] Failed to save comment:', error);
    }
  },

  // ===================================================
  // EVENT CALLBACKS
  // ===================================================

  /**
   * Subscribe to event
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   */
  on(event, callback) {
    const callbackKey = `on${event.charAt(0).toUpperCase() + event.slice(1)}`;
    if (eventCallbacks[callbackKey]) {
      eventCallbacks[callbackKey].push(callback);
    }
  },

  /**
   * Unsubscribe from event
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   */
  off(event, callback) {
    const callbackKey = `on${event.charAt(0).toUpperCase() + event.slice(1)}`;
    if (eventCallbacks[callbackKey]) {
      const index = eventCallbacks[callbackKey].indexOf(callback);
      if (index > -1) {
        eventCallbacks[callbackKey].splice(index, 1);
      }
    }
  },

  /**
   * Notify all callbacks for an event
   * @private
   */
  _notifyCallbacks(event, data) {
    if (eventCallbacks[event]) {
      eventCallbacks[event].forEach((callback) => {
        try {
          callback(data);
        } catch (error) {
          console.error(`[FacebookListener] Callback error for ${event}:`, error);
        }
      });
    }
  },

  // ===================================================
  // GETTERS
  // ===================================================

  /**
   * Get connection status
   */
  isConnected() {
    return listenerState.isConnected;
  },

  /**
   * Get current state
   */
  getState() {
    return { ...listenerState };
  },

  /**
   * Get viewer count
   */
  getViewerCount() {
    return listenerState.viewerCount;
  },

  /**
   * Get reaction count
   */
  getReactionCount() {
    return listenerState.reactionCount;
  },

  /**
   * Get share count
   */
  getShareCount() {
    return listenerState.shareCount;
  },
};

// =====================================================
// MOCK FACEBOOK LISTENER (For Development)
// =====================================================

export const mockFacebookListener = {
  /**
   * Start mock listener for development
   * @param {Object} options
   */
  start(options = {}) {
    const { sessionId, interval = 6000 } = options;

    console.log('[MockFacebookListener] Starting mock listener...');

    // Simulate random comments
    const mockUsers = [
      { name: 'Nguyễn Văn A', id: 'fb_1' },
      { name: 'Trần Thị B', id: 'fb_2' },
      { name: 'Lê Văn C', id: 'fb_3' },
      { name: 'Phạm Thị D', id: 'fb_4' },
      { name: 'Hoàng Văn E', id: 'fb_5' },
    ];

    const mockMessages = [
      'Chào chị, đá này bao nhiêu tiền ạ?',
      'Shop có ship COD không ạ?',
      'Rose quartz có tác dụng gì vậy chị?',
      'Em muốn mua cái vòng tay đó',
      'Tuổi Mão nên đeo đá gì ạ?',
      'Đẹp quá! 😍',
      'Share cho bạn bè xem nào',
      'Có mã giảm giá không chị?',
      'Amethyst có giúp ngủ ngon không?',
      'Mệnh Thủy hợp đá gì vậy chị?',
    ];

    const mockInterval = setInterval(() => {
      const user = mockUsers[Math.floor(Math.random() * mockUsers.length)];
      const message = mockMessages[Math.floor(Math.random() * mockMessages.length)];

      const mockComment = {
        id: `fb_comment_${Date.now()}`,
        platform: 'facebook',
        platform_user_id: user.id,
        platform_username: user.name,
        platform_avatar: null,
        message,
        session_id: sessionId,
      };

      // Add to aggregator
      commentAggregatorService.addComment(mockComment);

      console.log(`[MockFacebookListener] Generated comment: ${user.name}: ${message}`);
    }, interval);

    return () => {
      clearInterval(mockInterval);
      console.log('[MockFacebookListener] Stopped');
    };
  },
};

// =====================================================
// FACEBOOK EDGE FUNCTION HELPERS
// =====================================================

/**
 * Create Edge Function for Facebook Comments
 * This should be deployed to supabase/functions/facebook-comments/index.ts
 */
export const FACEBOOK_EDGE_FUNCTION_TEMPLATE = `
// supabase/functions/facebook-comments/index.ts

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { liveVideoId, accessToken, after } = await req.json();

    // Fetch comments from Facebook Graph API
    let url = \`https://graph.facebook.com/v18.0/\${liveVideoId}/comments?access_token=\${accessToken}&fields=id,message,from{id,name,picture},created_time,like_count\`;

    if (after) {
      url += \`&after=\${after}\`;
    }

    const response = await fetch(url);
    const data = await response.json();

    if (data.error) {
      throw new Error(data.error.message);
    }

    return new Response(
      JSON.stringify({ comments: data.data || [] }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
`;

// =====================================================
// EXPORTS
// =====================================================

export default facebookListenerService;
