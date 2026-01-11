/**
 * Comment Aggregator Service
 * Phase 3: Multi-Platform Integration
 *
 * Unifies comments from all platforms:
 * - Gemral (Supabase Realtime)
 * - TikTok (WebSocket/Connector)
 * - Facebook (Graph API Polling)
 *
 * Features:
 * - Unified comment format
 * - Deduplication
 * - Priority queue integration
 * - Save to database
 * - Viewer count aggregation
 */

import { supabase } from './supabase';
import { tiktokService, TIKTOK_EVENTS } from './tiktokService';
import { facebookService, FACEBOOK_EVENTS } from './facebookService';
import priorityQueue from './priorityQueueService';
import { classifyIntent } from './intentClassifierService';
import { detectEmotion } from './emotionDetectorService';

// Event types
export const AGGREGATOR_EVENTS = {
  COMMENT: 'comment',
  GIFT: 'gift',
  LIKE: 'like',
  FOLLOW: 'follow',
  VIEWER_COUNT: 'viewerCount',
  PLATFORM_CONNECTED: 'platformConnected',
  PLATFORM_DISCONNECTED: 'platformDisconnected',
  ERROR: 'error',
};

class CommentAggregatorService {
  constructor() {
    this.sessionId = null;
    this.comments = [];
    this.processedIds = new Set();
    this.unsubscribers = [];
    this.listeners = new Map();

    this.platforms = {
      gemral: { connected: false, viewerCount: 0, stats: {} },
      tiktok: { connected: false, viewerCount: 0, stats: {} },
      facebook: { connected: false, viewerCount: 0, stats: {} },
    };

    this.stats = {
      totalComments: 0,
      totalGifts: 0,
      totalLikes: 0,
      totalFollows: 0,
    };
  }

  /**
   * Initialize aggregator for a session
   * @param {string} sessionId - Livestream session ID
   */
  async initialize(sessionId) {
    this.sessionId = sessionId;
    this.comments = [];
    this.processedIds = new Set();
    this.resetStats();

    console.log('[Aggregator] Initialized for session:', sessionId);
    return { success: true, sessionId };
  }

  /**
   * Connect to Gemral (Supabase Realtime)
   */
  async connectGemral() {
    if (!this.sessionId) {
      throw new Error('Session not initialized');
    }

    try {
      const channel = supabase
        .channel(`comments:${this.sessionId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'livestream_comments',
            filter: `session_id=eq.${this.sessionId}`,
          },
          (payload) => {
            const comment = this._transformGemralComment(payload.new);
            this._handleNewComment(comment);
          }
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            this.platforms.gemral.connected = true;
            this._emit(AGGREGATOR_EVENTS.PLATFORM_CONNECTED, {
              platform: 'gemral',
            });
            console.log('[Aggregator] Gemral connected');
          }
        });

      this.unsubscribers.push(() => {
        supabase.removeChannel(channel);
      });

      return { success: true, platform: 'gemral' };
    } catch (error) {
      console.error('[Aggregator] Gemral connection failed:', error);
      this._emit(AGGREGATOR_EVENTS.ERROR, { platform: 'gemral', error });
      throw error;
    }
  }

  /**
   * Connect to TikTok Live
   * @param {string} username - TikTok username
   */
  async connectTikTok(username) {
    try {
      // Subscribe to TikTok events
      const unsubComment = tiktokService.on(TIKTOK_EVENTS.COMMENT, (comment) => {
        this._handleNewComment(comment);
      });

      const unsubGift = tiktokService.on(TIKTOK_EVENTS.GIFT, (gift) => {
        this._handleGift(gift);
      });

      const unsubLike = tiktokService.on(TIKTOK_EVENTS.LIKE, (data) => {
        this.stats.totalLikes += data.likeCount || 1;
        this._emit(AGGREGATOR_EVENTS.LIKE, data);
      });

      const unsubFollow = tiktokService.on(TIKTOK_EVENTS.FOLLOW, (data) => {
        this.stats.totalFollows++;
        this._emit(AGGREGATOR_EVENTS.FOLLOW, data);
      });

      const unsubViewer = tiktokService.on(TIKTOK_EVENTS.VIEWER_COUNT, (data) => {
        this.platforms.tiktok.viewerCount = data.count;
        this._emitTotalViewerCount();
      });

      const unsubConnected = tiktokService.on(TIKTOK_EVENTS.CONNECTED, () => {
        this.platforms.tiktok.connected = true;
        this._emit(AGGREGATOR_EVENTS.PLATFORM_CONNECTED, { platform: 'tiktok' });
      });

      const unsubDisconnected = tiktokService.on(TIKTOK_EVENTS.DISCONNECTED, () => {
        this.platforms.tiktok.connected = false;
        this._emit(AGGREGATOR_EVENTS.PLATFORM_DISCONNECTED, { platform: 'tiktok' });
      });

      this.unsubscribers.push(
        unsubComment, unsubGift, unsubLike, unsubFollow,
        unsubViewer, unsubConnected, unsubDisconnected
      );

      // Connect to TikTok
      await tiktokService.connect(username);

      return { success: true, platform: 'tiktok', username };
    } catch (error) {
      console.error('[Aggregator] TikTok connection failed:', error);
      this._emit(AGGREGATOR_EVENTS.ERROR, { platform: 'tiktok', error });
      throw error;
    }
  }

  /**
   * Connect to Facebook Live
   * @param {string} liveVideoId - Facebook live video ID
   */
  async connectFacebook(liveVideoId) {
    try {
      // Subscribe to Facebook events
      const unsubComment = facebookService.on(FACEBOOK_EVENTS.COMMENT, (comment) => {
        this._handleNewComment(comment);
      });

      const unsubViewer = facebookService.on(FACEBOOK_EVENTS.VIEWER_COUNT, (data) => {
        this.platforms.facebook.viewerCount = data.count;
        this._emitTotalViewerCount();
      });

      const unsubConnected = facebookService.on(FACEBOOK_EVENTS.CONNECTED, () => {
        this.platforms.facebook.connected = true;
        this._emit(AGGREGATOR_EVENTS.PLATFORM_CONNECTED, { platform: 'facebook' });
      });

      const unsubDisconnected = facebookService.on(FACEBOOK_EVENTS.DISCONNECTED, () => {
        this.platforms.facebook.connected = false;
        this._emit(AGGREGATOR_EVENTS.PLATFORM_DISCONNECTED, { platform: 'facebook' });
      });

      this.unsubscribers.push(unsubComment, unsubViewer, unsubConnected, unsubDisconnected);

      // Connect to Facebook
      await facebookService.connectToLive(liveVideoId);

      return { success: true, platform: 'facebook', liveVideoId };
    } catch (error) {
      console.error('[Aggregator] Facebook connection failed:', error);
      this._emit(AGGREGATOR_EVENTS.ERROR, { platform: 'facebook', error });
      throw error;
    }
  }

  /**
   * Handle new comment from any platform
   */
  _handleNewComment(comment) {
    // Check for duplicate
    if (this.processedIds.has(comment.id)) {
      return;
    }

    this.processedIds.add(comment.id);
    this.stats.totalComments++;

    // Analyze comment
    const intentResult = classifyIntent(comment.message);
    const emotionResult = detectEmotion(comment.message);

    // Enrich comment with analysis
    const enrichedComment = {
      ...comment,
      intentId: intentResult.intent.id,
      intentConfidence: intentResult.confidence,
      emotionId: emotionResult.emotion.id,
      emotionConfidence: emotionResult.confidence,
      tier: intentResult.tier,
      priority: intentResult.priority,
    };

    // Add to local cache
    this.comments.push(enrichedComment);

    // Keep only last 500 comments
    if (this.comments.length > 500) {
      this.comments = this.comments.slice(-500);
    }

    // Emit to listeners
    this._emit(AGGREGATOR_EVENTS.COMMENT, enrichedComment);

    // Save to database
    this._saveComment(enrichedComment);

    // Add to priority queue
    priorityQueue.addComment(this.sessionId, enrichedComment);
  }

  /**
   * Handle gift from TikTok
   */
  _handleGift(gift) {
    this.stats.totalGifts++;

    // Emit gift event
    this._emit(AGGREGATOR_EVENTS.GIFT, gift);

    // Save gift to database
    this._saveGift(gift);

    // Create a comment entry for the gift
    const giftComment = {
      ...gift,
      id: gift.id,
      message: `[GIFT: ${gift.gift.name} x${gift.gift.repeatCount || 1}]`,
      isGift: true,
      giftValue: gift.valueVND || 0,
    };

    // Add to priority queue with high priority
    priorityQueue.addComment(this.sessionId, {
      ...giftComment,
      priority: 1.0, // Maximum priority for gifts
      intentId: 'GIFT_SENDING',
      emotionId: 'HAPPY',
    });
  }

  /**
   * Transform Gemral (Supabase) comment to unified format
   */
  _transformGemralComment(dbComment) {
    return {
      id: `gemral_${dbComment.id}`,
      platform: 'gemral',
      userId: dbComment.user_id,
      username: dbComment.metadata?.username || 'User',
      displayName: dbComment.metadata?.displayName || dbComment.metadata?.username || 'User',
      avatar: dbComment.metadata?.avatar || null,
      message: dbComment.message,
      timestamp: new Date(dbComment.created_at).getTime(),
      badges: dbComment.metadata?.badges || [],
      tier: dbComment.metadata?.tier || 'FREE',
      isFollower: true, // Gemral users are always "followers"
      raw: dbComment,
    };
  }

  /**
   * Save comment to database
   */
  async _saveComment(comment) {
    if (!this.sessionId) return;

    try {
      await supabase.from('livestream_comments').insert({
        session_id: this.sessionId,
        platform: comment.platform,
        platform_user_id: comment.userId,
        platform_username: comment.username,
        message: comment.message,
        intent: comment.intentId,
        emotion: comment.emotionId,
        priority_score: comment.priority,
        metadata: {
          avatar: comment.avatar,
          displayName: comment.displayName,
          badges: comment.badges,
          isFollower: comment.isFollower,
          isSubscriber: comment.isSubscriber,
        },
        created_at: new Date(comment.timestamp).toISOString(),
      });
    } catch (error) {
      console.error('[Aggregator] Save comment error:', error);
    }
  }

  /**
   * Save gift to database
   */
  async _saveGift(gift) {
    if (!this.sessionId) return;

    try {
      await supabase.from('livestream_gifts').insert({
        session_id: this.sessionId,
        platform: gift.platform,
        platform_user_id: gift.userId,
        platform_username: gift.username || gift.displayName,
        gift_id: gift.gift.id,
        gift_name: gift.gift.name,
        gift_count: gift.gift.repeatCount || 1,
        diamond_value: gift.diamondValue || 0,
        value_vnd: gift.valueVND || 0,
        metadata: {
          avatar: gift.avatar,
          displayName: gift.displayName,
          giftImage: gift.gift.image,
        },
        created_at: new Date(gift.timestamp).toISOString(),
      });
    } catch (error) {
      console.error('[Aggregator] Save gift error:', error);
    }
  }

  /**
   * Emit total viewer count from all platforms
   */
  _emitTotalViewerCount() {
    const total = Object.values(this.platforms).reduce(
      (sum, p) => sum + (p.viewerCount || 0),
      0
    );

    this._emit(AGGREGATOR_EVENTS.VIEWER_COUNT, {
      total,
      breakdown: {
        gemral: this.platforms.gemral.viewerCount,
        tiktok: this.platforms.tiktok.viewerCount,
        facebook: this.platforms.facebook.viewerCount,
      },
      timestamp: Date.now(),
    });
  }

  /**
   * Get recent comments
   * @param {number} limit - Max comments to return
   */
  getRecentComments(limit = 50) {
    return this.comments.slice(-limit);
  }

  /**
   * Get comments by platform
   */
  getCommentsByPlatform(platform) {
    return this.comments.filter((c) => c.platform === platform);
  }

  /**
   * Get platform status
   */
  getPlatformStatus() {
    return {
      gemral: { ...this.platforms.gemral },
      tiktok: { ...this.platforms.tiktok, ...tiktokService.getStatus() },
      facebook: { ...this.platforms.facebook, ...facebookService.getStatus() },
    };
  }

  /**
   * Get connected platforms
   */
  getConnectedPlatforms() {
    return Object.entries(this.platforms)
      .filter(([_, p]) => p.connected)
      .map(([name]) => name);
  }

  /**
   * Get total viewer count
   */
  getTotalViewerCount() {
    return Object.values(this.platforms).reduce(
      (sum, p) => sum + (p.viewerCount || 0),
      0
    );
  }

  /**
   * Get aggregated stats
   */
  getStats() {
    return {
      ...this.stats,
      platforms: this.platforms,
      sessionId: this.sessionId,
    };
  }

  /**
   * Reset stats
   */
  resetStats() {
    this.stats = {
      totalComments: 0,
      totalGifts: 0,
      totalLikes: 0,
      totalFollows: 0,
    };

    Object.keys(this.platforms).forEach((key) => {
      this.platforms[key].stats = {};
    });
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
          console.error(`[Aggregator] Event handler error for ${event}:`, error);
        }
      });
    }
  }

  /**
   * Disconnect all platforms
   */
  disconnectAll() {
    // Unsubscribe from all event listeners
    this.unsubscribers.forEach((unsub) => {
      try {
        unsub();
      } catch (e) {
        // Ignore cleanup errors
      }
    });
    this.unsubscribers = [];

    // Disconnect platform services
    tiktokService.disconnect();
    facebookService.disconnect();

    // Reset state
    Object.keys(this.platforms).forEach((key) => {
      this.platforms[key] = { connected: false, viewerCount: 0, stats: {} };
    });

    this.sessionId = null;
    this.comments = [];
    this.processedIds = new Set();

    console.log('[Aggregator] All platforms disconnected');
  }

  /**
   * Disconnect specific platform
   */
  disconnectPlatform(platform) {
    switch (platform) {
      case 'tiktok':
        tiktokService.disconnect();
        break;
      case 'facebook':
        facebookService.disconnect();
        break;
      // Gemral disconnection is handled via Supabase channel removal
    }

    this.platforms[platform] = { connected: false, viewerCount: 0, stats: {} };
    this._emit(AGGREGATOR_EVENTS.PLATFORM_DISCONNECTED, { platform });
  }
}

// Singleton instance
export const commentAggregatorService = new CommentAggregatorService();
export default commentAggregatorService;
